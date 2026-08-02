import { LitElement, html } from 'lit';
import type { TemplateResult } from 'lit';
import { property, state } from 'lit/decorators.js';

import type { HassEntity, HomeAssistant, SecurityMonitorSource } from '../types';

export type CameraPreviewView = 'live' | 'auto';
export type CameraFitMode = 'cover' | 'contain' | 'fill';

const COVER_STYLE_ID = 'sp-camera-cover';
const COVER_CSS = `
video, img {
  width: 100% !important;
  height: 100% !important;
  max-height: none !important;
  object-fit: cover !important;
  object-position: center center !important;
}
ha-camera-stream,
ha-hls-player,
ha-web-rtc-player {
  display: block !important;
  width: 100% !important;
  height: 100% !important;
}
`;

function injectCoverIntoShadow(host: Element): void {
  const root = (host as HTMLElement).shadowRoot;
  if (!root) return;
  if (!root.getElementById(COVER_STYLE_ID)) {
    const style = document.createElement('style');
    style.id = COVER_STYLE_ID;
    style.textContent = COVER_CSS;
    root.appendChild(style);
  }
  root.querySelectorAll('ha-camera-stream, ha-hls-player, ha-web-rtc-player').forEach(injectCoverIntoShadow);
}

function patchCameraCover(root: ParentNode): void {
  root.querySelectorAll('hui-image, ha-camera-stream').forEach(injectCoverIntoShadow);
}

/**
 * Camera preview via HA `hui-image` (live or auto).
 * Injects cover CSS into nested player shadow roots — theme CSS cannot pierce those.
 */
export class SpCameraPreview extends LitElement {
  @property({ attribute: false }) hass?: HomeAssistant;
  @property({ attribute: false }) entity?: HassEntity;
  @property() cameraView: CameraPreviewView = 'live';
  /** HA ratio string e.g. `16:10`. Empty skips so flex panels can use height:100%. */
  @property() aspectRatio = '';
  @property() fitMode: CameraFitMode = 'cover';

  private _mo?: MutationObserver;
  private _timers: number[] = [];

  createRenderRoot(): HTMLElement | DocumentFragment {
    return this;
  }

  connectedCallback(): void {
    super.connectedCallback();
    this._mo = new MutationObserver(() => this._applyCover());
    this._mo.observe(this, { childList: true, subtree: true });
    this._scheduleCover();
  }

  disconnectedCallback(): void {
    this._mo?.disconnect();
    this._mo = undefined;
    for (const id of this._timers) window.clearTimeout(id);
    this._timers = [];
    super.disconnectedCallback();
  }

  protected updated(): void {
    this._scheduleCover();
  }

  private _scheduleCover(): void {
    if (this.fitMode !== 'cover') return;
    for (const id of this._timers) window.clearTimeout(id);
    this._timers = [0, 80, 320, 1000].map((ms) =>
      window.setTimeout(() => this._applyCover(), ms),
    );
  }

  private _applyCover(): void {
    if (this.fitMode !== 'cover') return;
    patchCameraCover(this);
  }

  render() {
    if (!this.hass || !this.entity) return html``;
    return html`
      <hui-image
        class="camera-stream"
        .hass=${this.hass}
        .stateObj=${this.entity}
        .cameraImage=${this.entity.entity_id}
        .cameraView=${this.cameraView}
        .fitMode=${this.fitMode}
        .aspectRatio=${this.aspectRatio || undefined}
        .show_state=${false}
        .show_name=${false}
      ></hui-image>
    `;
  }
}

if (!customElements.get('sp-camera-preview')) {
  customElements.define('sp-camera-preview', SpCameraPreview);
}

/** Camera card preview via HA `hui-image`. */
export function renderLiveCameraPreview(
  hass: HomeAssistant,
  entity: HassEntity,
  className = 'camera-preview camera-live',
  cameraView: CameraPreviewView = 'live',
  options?: { aspectRatio?: string | null; fitMode?: CameraFitMode },
): TemplateResult {
  void (window as unknown as { loadCardHelpers?: () => Promise<unknown> }).loadCardHelpers?.();
  const aspectRatio = options && 'aspectRatio' in options
    ? (options.aspectRatio || '')
    : '16:10';
  return html`
    <div class=${className}>
      <sp-camera-preview
        .hass=${hass}
        .entity=${entity}
        .cameraView=${cameraView}
        .aspectRatio=${aspectRatio}
        .fitMode=${options?.fitMode ?? 'cover'}
      ></sp-camera-preview>
    </div>
  `;
}

/** Same go2rtc base URL as dashboard-n/monitoring. */
export function monitoringGo2rtcUrl(): string {
  const loc = typeof window !== 'undefined' ? window.location : undefined;
  const host = loc?.hostname || '192.168.1.17';
  // External hostname cannot expose :1984; prefer LAN go2rtc on the wire.
  // (HTTPS pages still need same-origin ingress — see resolveGo2rtcBaseForPreview.)
  if (/homekitzhou|nabu\.casa|ui\.nabu/i.test(host)) {
    return 'http://192.168.1.17:1984';
  }
  return `http://${host}:1984`;
}

/**
 * Prefer same-origin go2rtc ingress on HTTPS (avoids mixed-content block on :1984).
 * Falls back to monitoringGo2rtcUrl() on LAN http / if supervisor API unavailable.
 */
export async function resolveGo2rtcBaseForPreview(hass?: HomeAssistant): Promise<string> {
  const loc = typeof window !== 'undefined' ? window.location : undefined;
  if (loc?.protocol === 'https:' && hass?.connection?.sendMessagePromise) {
    try {
      const cached = sessionStorage.getItem('sp-go2rtc-ingress');
      if (cached) return cached;
      const info = await hass.connection.sendMessagePromise<{ ingress_entry?: string; data?: { ingress_entry?: string } }>({
        type: 'supervisor/api',
        endpoint: '/addons/core_go2rtc/info',
        method: 'get',
      });
      const entry = info?.ingress_entry || info?.data?.ingress_entry;
      if (entry) {
        const base = `${loc.origin}${entry}`.replace(/\/$/, '');
        sessionStorage.setItem('sp-go2rtc-ingress', base);
        return base;
      }
    } catch {
      /* supervisor API may be denied for non-admin */
    }
  }
  return monitoringGo2rtcUrl();
}

type Go2rtcVideoRtc = HTMLElement & {
  mode?: string;
  media?: string;
  background?: boolean;
  visibilityCheck?: boolean;
  src?: string | URL;
  video?: HTMLVideoElement;
  oninit?: () => void;
  play?: () => void;
};

let videoRtcLoad: Promise<void> | null = null;

function ensureGo2rtcVideoTag(baseUrl: string): Promise<void> {
  if (customElements.get('sp-go2rtc-video')) return Promise.resolve();
  if (!videoRtcLoad) {
    const base = baseUrl.replace(/\/$/, '');
    videoRtcLoad = import(/* @vite-ignore */ `${base}/video-rtc.js`)
      .then((mod: { VideoRTC?: new () => Go2rtcVideoRtc }) => {
        const VideoRTC = mod.VideoRTC as (new () => Go2rtcVideoRtc) | undefined;
        if (!VideoRTC) throw new Error('VideoRTC export missing');
        if (!customElements.get('sp-go2rtc-video')) {
          // Dynamic base from go2rtc; strip native controls so the skin owns the chrome.
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const Base = VideoRTC as any;
          class SpGo2rtcVideo extends Base {
            oninit(): void {
              super.oninit();
              const video = this.video as HTMLVideoElement | undefined;
              if (video) {
                video.controls = false;
                video.muted = true;
                video.autoplay = true;
                video.playsInline = true;
                video.setAttribute('playsinline', '');
                video.setAttribute('webkit-playsinline', '');
                video.disablePictureInPicture = true;
                // Hide native big-play / control chrome (Android WebView often shows a play glyph).
                video.style.setProperty('pointer-events', 'none');
                video.controlsList?.add?.('nodownload');
                video.style.width = '100%';
                video.style.height = '100%';
                video.style.objectFit = 'cover';
                video.style.display = 'block';
                video.style.background = '#111';
                void video.play().catch(() => undefined);
              }
            }
          }
          customElements.define('sp-go2rtc-video', SpGo2rtcVideo);
        }
      })
      .catch((err) => {
        videoRtcLoad = null;
        throw err;
      });
  }
  return videoRtcLoad;
}

/**
 * Live security preview via go2rtc VideoRTC (WebRTC → MSE → …), controls-free.
 * Contained in the themed camera-card — no stream.html iframe chrome.
 * Same three streams only; no HA webrtc-camera / advanced-camera-card.
 *
 * Note: go2rtc 1.9.x `api/stream.mjpeg` returns empty for raw H264 producers
 * (no ffmpeg mjpeg). Prefer `live`. Fallback is dual-buffer `frame.jpeg` (not
 * single-img 1s polling — that flashes).
 */
export class SpGo2rtcLivePreview extends LitElement {
  @property() stream = '';
  @property() baseUrl = '';
  /**
   * `live` — VideoRTC WebRTC/MSE (default; may show native play glyph on some WebViews).
   * `jpeg` — dual-buffer frame.jpeg poll (no glyph; used when live fails or forced).
   * `mjpeg` — alias of `jpeg` (stream.mjpeg is empty on this go2rtc).
   */
  @property() mode: 'live' | 'mjpeg' | 'jpeg' = 'live';

  @state() private _fallback: 'live' | 'jpeg' = 'live';
  @state() private _front = 0;
  @state() private _urls: [string, string] = ['', ''];
  private _jpegTimer?: number;
  private _jpegLoading = false;
  private _player: Go2rtcVideoRtc | null = null;
  private _appliedSrc = '';
  private _mountToken = 0;

  createRenderRoot(): HTMLElement | DocumentFragment {
    return this;
  }

  connectedCallback(): void {
    super.connectedCallback();
    // Always contain the player even if a skin theme omits .camera-preview { position:relative }.
    this.style.cssText = 'position:absolute;inset:0;display:block;width:100%;height:100%;overflow:hidden;background:#111;';
    if (this.mode !== 'live' && this._fallback === 'live') {
      this._startJpeg();
    }
  }

  disconnectedCallback(): void {
    this._mountToken += 1;
    this._player = null;
    this._appliedSrc = '';
    if (this._jpegTimer) window.clearInterval(this._jpegTimer);
    this._jpegTimer = undefined;
    super.disconnectedCallback();
  }

  protected updated(changed: Map<string, unknown>): void {
    if (changed.has('mode')) {
      if (this.mode !== 'live') {
        this._startJpeg();
        return;
      }
      if (this._fallback !== 'live') {
        if (this._jpegTimer) window.clearInterval(this._jpegTimer);
        this._jpegTimer = undefined;
        this._fallback = 'live';
      }
    }
    if (
      changed.has('stream')
      || changed.has('baseUrl')
      || changed.has('_fallback')
      || this._fallback === 'live'
    ) {
      if (this._fallback === 'live') void this._syncPlayer();
      else if (changed.has('stream') || changed.has('baseUrl')) this._queueJpegFrame();
    }
  }

  private _base(): string {
    return (this.baseUrl || monitoringGo2rtcUrl()).replace(/\/$/, '');
  }

  private _wsSrc(): string {
    return `${this._base()}/api/ws?src=${encodeURIComponent(this.stream)}`;
  }

  private _frameUrl(): string {
    const src = encodeURIComponent(this.stream);
    return `${this._base()}/api/frame.jpeg?src=${src}&t=${Date.now()}`;
  }

  private _startJpeg(): void {
    this._player = null;
    this._appliedSrc = '';
    this._fallback = 'jpeg';
    this._queueJpegFrame();
    if (this._jpegTimer) window.clearInterval(this._jpegTimer);
    // Dual-buffer swap; ~2fps is enough for door/security stills without flicker.
    this._jpegTimer = window.setInterval(() => this._queueJpegFrame(), 500);
  }

  private _queueJpegFrame(): void {
    if (!this.stream || this._fallback !== 'jpeg' || this._jpegLoading) return;
    const back = 1 - this._front;
    const url = this._frameUrl();
    this._jpegLoading = true;
    const probe = new Image();
    probe.onload = () => {
      this._jpegLoading = false;
      if (!this.isConnected || this._fallback !== 'jpeg') return;
      const next: [string, string] = [...this._urls] as [string, string];
      next[back] = url;
      this._urls = next;
      this._front = back;
    };
    probe.onerror = () => {
      this._jpegLoading = false;
    };
    probe.src = url;
  }

  private async _syncPlayer(): Promise<void> {
    if (!this.stream || this._fallback !== 'live') {
      this._player = null;
      this._appliedSrc = '';
      return;
    }
    const slot = this.querySelector('.sp-go2rtc-slot') as HTMLElement | null;
    if (!slot) return;
    const token = ++this._mountToken;
    const wsSrc = this._wsSrc();
    try {
      await ensureGo2rtcVideoTag(this._base());
      if (token !== this._mountToken || !this.isConnected) return;
      let el = slot.querySelector('sp-go2rtc-video') as Go2rtcVideoRtc | null;
      if (!el) {
        el = document.createElement('sp-go2rtc-video') as Go2rtcVideoRtc;
        el.className = 'sp-go2rtc-live';
        el.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block;background:#111;';
        el.mode = 'webrtc,mse,mjpeg';
        el.media = 'video'; // video-only — avoids waiting on audio / play-button UX
        el.background = true;
        el.visibilityCheck = false;
        slot.replaceChildren(el);
      }
      this._player = el;
      if (this._appliedSrc !== wsSrc) {
        el.src = wsSrc;
        this._appliedSrc = wsSrc;
      }
      const video = el.video;
      if (video) {
        video.controls = false;
        video.muted = true;
        video.autoplay = true;
        video.playsInline = true;
        video.style.objectFit = 'cover';
        video.style.pointerEvents = 'none';
        void video.play().catch(() => undefined);
      }
      el.play?.();
    } catch {
      // stream.mjpeg is empty on this go2rtc — use dual-buffer JPEG instead.
      if (token === this._mountToken) this._startJpeg();
    }
  }

  render() {
    if (!this.stream) return html``;
    if (this._fallback === 'live') {
      return html`<div class="sp-go2rtc-slot" style="position:absolute;inset:0;overflow:hidden;"></div>`;
    }
    const imgStyle =
      'position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block;background:#111;transition:opacity 80ms linear;';
    return html`
      <img
        class="sp-go2rtc-jpeg"
        src=${this._urls[0] || this._frameUrl()}
        alt=""
        decoding="async"
        style="${imgStyle}opacity:${this._front === 0 ? 1 : 0};"
      />
      <img
        class="sp-go2rtc-jpeg"
        src=${this._urls[1] || ''}
        alt=""
        decoding="async"
        style="${imgStyle}opacity:${this._front === 1 ? 1 : 0};"
      />
    `;
  }
}

if (!customElements.get('sp-go2rtc-live-preview')) {
  customElements.define('sp-go2rtc-live-preview', SpGo2rtcLivePreview);
}

/** Dual-buffer JPEG stills — only when VideoRTC is unsuitable. */
export function renderGo2rtcMjpegPreview(
  stream: string,
  className = 'camera-preview camera-live',
  baseUrl?: string,
): TemplateResult {
  return renderGo2rtcLivePreview(stream, className, baseUrl, 'jpeg');
}

export function renderGo2rtcLivePreview(
  stream: string,
  className = 'camera-preview camera-live',
  baseUrl?: string,
  mode: 'live' | 'mjpeg' | 'jpeg' = 'live',
): TemplateResult {
  return html`
    <div class=${className} style="position:relative;overflow:hidden;">
      <sp-go2rtc-live-preview
        .stream=${stream}
        .baseUrl=${baseUrl || ''}
        .mode=${mode}
      ></sp-go2rtc-live-preview>
    </div>
  `;
}

/**
 * Exact Lovelace card configs used by dashboard-n/monitoring (no card_mod / view_layout).
 * Do not edit that dashboard — copy its live sources here.
 */
export function monitoringCardConfig(source: SecurityMonitorSource): Record<string, unknown> {
  const go2rtcUrl = source.go2rtc_url || monitoringGo2rtcUrl();
  if (source.provider === 'ha-camera') {
    // Caller should use renderLiveCameraPreview; keep a webrtc entity fallback.
    return {
      type: 'custom:webrtc-camera',
      entity: source.entity || source.stream,
      muted: true,
      ui: false,
      background: false,
      mse: false,
      intersection: 0,
    };
  }
  if (source.provider === 'webrtc-camera') {
    // Match monitoring door card; mse:false avoids black MSE on Akuvox (pcm_mulaw audio).
    return {
      type: 'custom:webrtc-camera',
      url: source.stream,
      muted: true,
      ui: false,
      background: false,
      mse: false,
      intersection: 0,
    };
  }
  return {
    type: 'custom:advanced-camera-card',
    cameras: [
      {
        live_provider: 'go2rtc',
        go2rtc: {
          stream: source.stream,
          url: go2rtcUrl,
          modes: source.modes?.length ? source.modes : ['webrtc', 'mse', 'mp4'],
        },
      },
    ],
    dimensions: {
      aspect_ratio_mode: 'static',
      aspect_ratio: '16:9',
    },
  };
}

type LovelaceCardEl = HTMLElement & {
  hass?: HomeAssistant;
  setConfig?: (config: Record<string, unknown>) => void;
  onconnect?: () => boolean | void;
  config?: Record<string, unknown>;
};

/**
 * Mount the same Lovelace cards as dashboard-n/monitoring.
 * Create once; on hass updates only refresh `.hass` (avoids remount stutter).
 */
export class SpMonitoringCamPreview extends LitElement {
  @property({ attribute: false }) hass?: HomeAssistant;
  @property({ attribute: false }) source?: SecurityMonitorSource;

  private _mountedKey = '';
  private _mounting = false;
  private _card?: LovelaceCardEl;

  createRenderRoot(): HTMLElement | DocumentFragment {
    return this;
  }

  protected updated(): void {
    void this._mount();
    if (this._card && this.hass) {
      this._card.hass = this.hass;
    }
  }

  private async _mount(): Promise<void> {
    if (!this.source?.stream || !this.hass || this._mounting) return;
    const host = this.querySelector('.sp-monitoring-host') as HTMLElement | null;
    if (!host) return;

    const key = JSON.stringify(monitoringCardConfig(this.source));
    if (key === this._mountedKey && this._card && host.contains(this._card)) return;

    this._mounting = true;
    const source = this.source;
    const hass = this.hass;
    const config = monitoringCardConfig(source);

    try {
      let card: LovelaceCardEl;

      if (source.provider === 'webrtc-camera') {
        // Proven path: setConfig + hass BEFORE append (createCardElement can race).
        await customElements.whenDefined('webrtc-camera');
        card = document.createElement('webrtc-camera') as LovelaceCardEl;
        card.setConfig?.(config);
        if (!card.config) throw new Error('webrtc-camera setConfig did not apply');
        card.hass = hass;
      } else {
        const Win = window as unknown as {
          loadCardHelpers?: () => Promise<{ createCardElement: (config: Record<string, unknown>) => HTMLElement }>;
        };
        if (typeof Win.loadCardHelpers === 'function') {
          const helpers = await Win.loadCardHelpers();
          card = helpers.createCardElement(config) as LovelaceCardEl;
        } else {
          await customElements.whenDefined('advanced-camera-card');
          card = document.createElement('advanced-camera-card') as LovelaceCardEl;
          card.setConfig?.(config);
        }
        card.hass = hass;
      }

      if (!this.isConnected || this.source !== source || !this.hass) {
        this._mounting = false;
        return;
      }
      const liveHost = this.querySelector('.sp-monitoring-host') as HTMLElement | null;
      if (!liveHost) {
        this._mounting = false;
        return;
      }

      liveHost.replaceChildren(card);
      this._card = card;
      this._mountedKey = key;
      console.info('[Skins Pro] monitoring cam mounted', source.provider, source.stream);

      if (source.provider === 'webrtc-camera') {
        const tryConnect = (): void => {
          try {
            if (this.hass) card.hass = this.hass;
            card.onconnect?.();
            const video = (card.shadowRoot?.querySelector('video')
              || card.querySelector?.('video')) as HTMLVideoElement | null;
            if (video) {
              video.muted = true;
              video.playsInline = true;
              void video.play().catch(() => undefined);
            }
          } catch (error) {
            console.warn('[Skins Pro] webrtc door reconnect failed', error);
          }
        };
        window.setTimeout(tryConnect, 50);
        window.setTimeout(tryConnect, 400);
      }
    } catch (error) {
      console.warn('[Skins Pro] monitoring cam mount failed', source, error);
    } finally {
      this._mounting = false;
    }
  }

  render() {
    return html`<div class="sp-monitoring-host" style="position:absolute;inset:0;width:100%;height:100%;"></div>`;
  }
}

if (!customElements.get('sp-monitoring-cam-preview')) {
  customElements.define('sp-monitoring-cam-preview', SpMonitoringCamPreview);
}

/** @deprecated Prefer renderMonitoringCamPreview — kept for call-site compatibility. */
export function renderGo2rtcWebrtcPreview(
  hass: HomeAssistant,
  stream: string,
  className = 'camera-preview camera-live',
): TemplateResult {
  return renderMonitoringCamPreview(hass, {
    stream,
    provider: 'webrtc-camera',
    label: stream,
  }, className);
}

export function renderMonitoringCamPreview(
  hass: HomeAssistant,
  source: SecurityMonitorSource,
  className = 'camera-preview camera-live',
): TemplateResult {
  void (window as unknown as { loadCardHelpers?: () => Promise<unknown> }).loadCardHelpers?.();
  return html`
    <div class=${className}>
      <sp-monitoring-cam-preview .hass=${hass} .source=${source}></sp-monitoring-cam-preview>
    </div>
  `;
}
