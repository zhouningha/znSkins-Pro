import { html, render } from 'lit';
import type { HomeAssistant } from '../types';
import type { Language } from '../i18n';
import { t } from '../utils';
import { monitoringGo2rtcUrl } from './camera-stream';

const LOCK_DIALOG_ID = 'sp-lock-dialog';
const AUTO_CLOSE_SEC = 5;
/** Same go2rtc stream as security「门禁监控」— do not open a second Akuvox RTSP. */
export const DOORBELL_PREVIEW_STREAM = 'akuvox_sub';

/** CSS vars copied from skins-pro-card :host onto body-mounted dialog. */
const HOST_TOKEN_KEYS = [
  '--sp-accent',
  '--sp-accent-hover',
  '--sp-accent-alpha',
  '--sp-accent-border',
  '--sp-text-primary',
  '--sp-text-secondary',
  '--sp-text-main',
  '--sp-text-dark',
  '--sp-text-muted',
  '--sp-text-on-accent',
  '--sp-glass-bg',
  '--sp-panel-bg',
  '--sp-border-glass',
  '--sp-radius-lg',
  '--sp-radius-pill',
  '--sp-shadow-lg',
  '--glass-regular',
  '--glass-thick',
  '--glass-thin',
  '--sp-lock-scrim',
  '--sp-lock-card-bg',
  '--sp-lock-card-border',
  '--sp-lock-text',
  '--sp-lock-sub',
  '--sp-lock-status-bg',
  '--sp-lock-count-bg',
  '--sp-lock-count-fg',
  '--sp-lock-progress-bg',
  '--sp-lock-progress-fill',
  '--sp-lock-cancel-bg',
  '--sp-lock-cancel-fg',
  '--sp-lock-unlock-bg',
  '--sp-lock-unlock-fg',
] as const;

const LOCK_DIALOG_STYLE = `
#${LOCK_DIALOG_ID} {
  position: fixed; inset: 0; z-index: 100000;
  font-family: inherit; pointer-events: auto;
  color: var(--sp-lock-text, var(--sp-text-primary, var(--sp-text-main, var(--sp-text-dark, #3d5a40))));
}
#${LOCK_DIALOG_ID} .lock-dialog-scrim {
  position: absolute; inset: 0;
  display: flex; align-items: center; justify-content: center;
  padding: 24px;
  background: var(--sp-lock-scrim, rgba(20, 24, 28, 0.48));
  backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
}
#${LOCK_DIALOG_ID} .lock-dialog-card {
  width: min(360px, 100%);
  display: grid; gap: 16px; padding: 22px;
  border-radius: var(--sp-radius-lg, 22px);
  background: var(--sp-lock-card-bg, var(--glass-regular, var(--sp-glass-bg, var(--sp-panel-bg, rgba(255,248,230,0.96)))));
  border: 1px solid var(--sp-lock-card-border, var(--sp-border-glass, var(--sp-accent-border, rgba(0,0,0,.12))));
  box-shadow: var(--sp-shadow-lg, 0 16px 40px rgba(0,0,0,.28));
  color: inherit;
  pointer-events: auto; touch-action: manipulation;
}
#${LOCK_DIALOG_ID}[data-has-preview="true"] .lock-dialog-card {
  width: min(440px, 100%);
}
#${LOCK_DIALOG_ID} .lock-dialog-sub {
  margin: 0 0 4px; font-size: 12px; font-weight: 600;
  color: var(--sp-lock-sub, var(--sp-accent, inherit));
  opacity: 0.9;
}
#${LOCK_DIALOG_ID} .lock-dialog-titles h2 {
  margin: 0; font-size: 22px; font-weight: 800; color: inherit;
}
#${LOCK_DIALOG_ID} .lock-dialog-preview {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 10;
  border-radius: calc(var(--sp-radius-lg, 22px) - 6px);
  overflow: hidden;
  background: #050608;
  border: 1px solid var(--sp-border-glass, rgba(0,0,0,.12));
}
#${LOCK_DIALOG_ID} .lock-dialog-preview img {
  position: absolute; inset: 0;
  width: 100%; height: 100%;
  object-fit: cover; object-position: center;
  display: block; background: #050608;
}
#${LOCK_DIALOG_ID} .lock-dialog-status {
  display: flex; align-items: center; justify-content: space-between; gap: 12px;
  padding: 12px 14px; border-radius: 16px;
  background: var(--sp-lock-status-bg, var(--sp-accent-alpha, rgba(255,255,255,0.45)));
  border: 1px solid var(--sp-accent-border, transparent);
}
#${LOCK_DIALOG_ID} .lock-dialog-state {
  margin: 0; font-size: 18px; font-weight: 700; color: inherit;
}
#${LOCK_DIALOG_ID} .lock-dialog-count {
  width: 44px; height: 44px; border-radius: 50%;
  display: grid; place-items: center;
  font-size: 18px; font-weight: 800; flex-shrink: 0;
  background: var(--sp-lock-count-bg, var(--sp-accent, #7ec850));
  color: var(--sp-lock-count-fg, var(--sp-text-on-accent, #fff8e6));
  box-shadow: 0 6px 14px var(--sp-accent-alpha, rgba(0,0,0,.2));
}
#${LOCK_DIALOG_ID} .lock-dialog-progress {
  height: 8px; border-radius: 999px; overflow: hidden;
  background: var(--sp-lock-progress-bg, var(--sp-accent-alpha, rgba(0,0,0,.12)));
}
#${LOCK_DIALOG_ID} .lock-dialog-progress > span {
  display: block; height: 100%; border-radius: inherit;
  background: var(--sp-lock-progress-fill, linear-gradient(90deg, var(--sp-accent-alpha, transparent), var(--sp-accent, #7ec850)));
  transition: width 0.2s linear;
}
#${LOCK_DIALOG_ID} .lock-dialog-hint {
  margin: 0; font-size: 13px; text-align: center; opacity: 0.8;
}
#${LOCK_DIALOG_ID} .lock-dialog-actions {
  display: grid; grid-template-columns: 1fr 1fr; gap: 10px;
}
#${LOCK_DIALOG_ID} .lock-dialog-actions button {
  min-height: 48px; border: 0; border-radius: var(--sp-radius-pill, 999px);
  font: inherit; font-size: 16px; font-weight: 800;
  cursor: pointer; pointer-events: auto; touch-action: manipulation;
}
#${LOCK_DIALOG_ID} .lock-dialog-cancel {
  background: var(--sp-lock-cancel-bg, rgba(255,255,255,0.55));
  color: var(--sp-lock-cancel-fg, inherit);
  border: 1px solid var(--sp-border-glass, rgba(0,0,0,.12)) !important;
}
#${LOCK_DIALOG_ID} .lock-dialog-unlock {
  background: var(--sp-lock-unlock-bg, var(--sp-accent, #7ec850));
  color: var(--sp-lock-unlock-fg, var(--sp-text-on-accent, #fff8e6));
  box-shadow: 0 6px 14px var(--sp-accent-alpha, rgba(0,0,0,.2));
}
#${LOCK_DIALOG_ID} .lock-dialog-unlock:disabled { opacity: 0.55; cursor: not-allowed; }
`;

export type LockDialogOptions = {
  /** Countdown seconds (default 5). */
  autoCloseSec?: number;
  /** Override title (default entity friendly name). */
  title?: string;
  /** Cancel button label (default 取消). */
  cancelLabel?: string;
  /** Custom unlock action (default lock.unlock). */
  onUnlock?: () => Promise<void>;
  /** Called when user taps cancel / scrim. */
  onCancel?: () => void | Promise<void>;
  /** Called when countdown hits 0 (before close). */
  onTimeout?: () => void | Promise<void>;
  /** If true, tapping scrim does nothing (doorbell). */
  preventScrimClose?: boolean;
  /** go2rtc stream name for live preview (e.g. akuvox_sub). */
  previewStream?: string;
  /** Play repeating doorbell chime while open. */
  playSound?: boolean;
};

function entityTitle(hass: HomeAssistant, entityId: string): string {
  const state = hass.states?.[entityId];
  return String(state?.attributes?.friendly_name || entityId);
}

function stateHeading(state: string, language: Language): string {
  if (state === 'locked') return language === 'zh-CN' ? '可开门' : 'Ready';
  if (state === 'unlocked') return language === 'zh-CN' ? '已释放' : 'Released';
  if (state === 'open' || state === 'opening') return language === 'zh-CN' ? '已打开' : 'Open';
  if (state === 'unavailable' || state === 'unknown') return language === 'zh-CN' ? '离线' : 'Offline';
  return state;
}

function previewUrl(stream: string): string {
  return `${monitoringGo2rtcUrl().replace(/\/$/, '')}/api/stream.mjpeg?src=${encodeURIComponent(stream)}`;
}

/** Short two-tone chime; repeats until stop(). Works without local mp3 assets. */
function startDoorbellChime(): { stop: () => void } {
  const AudioCtx = window.AudioContext
    || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioCtx) return { stop: () => undefined };

  let stopped = false;
  let ctx: AudioContext | undefined;
  let intervalId: number | undefined;

  const ding = () => {
    if (stopped || !ctx) return;
    const now = ctx.currentTime;
    const gain = ctx.createGain();
    gain.connect(ctx.destination);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.22, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.55);

    const o1 = ctx.createOscillator();
    o1.type = 'sine';
    o1.frequency.setValueAtTime(880, now);
    o1.connect(gain);
    o1.start(now);
    o1.stop(now + 0.22);

    const o2 = ctx.createOscillator();
    o2.type = 'sine';
    o2.frequency.setValueAtTime(1174.7, now + 0.18);
    o2.connect(gain);
    o2.start(now + 0.18);
    o2.stop(now + 0.5);
  };

  try {
    ctx = new AudioCtx();
    void ctx.resume().then(() => {
      if (stopped) return;
      ding();
      intervalId = window.setInterval(ding, 2200);
    });
    try {
      navigator.vibrate?.([120, 80, 120]);
    } catch {
      /* ignore */
    }
  } catch (error) {
    console.warn('[Skins Pro] doorbell chime failed', error);
  }

  return {
    stop: () => {
      stopped = true;
      if (intervalId) window.clearInterval(intervalId);
      if (ctx) {
        void ctx.close().catch(() => undefined);
        ctx = undefined;
      }
    },
  };
}

/** Copy theme tokens from card host onto the body-mounted dialog. */
export function copyHostThemeTokens(host: HTMLElement | null | undefined, target: HTMLElement): void {
  if (!host) return;
  const cs = getComputedStyle(host);
  for (const key of HOST_TOKEN_KEYS) {
    const value = cs.getPropertyValue(key).trim();
    if (value) target.style.setProperty(key, value);
  }
}

export function isLockDialogOpen(): boolean {
  return Boolean(document.getElementById(LOCK_DIALOG_ID));
}

export function closeLockDialog(): void {
  const el = document.getElementById(LOCK_DIALOG_ID);
  el?.querySelectorAll('img').forEach((img) => img.removeAttribute('src'));
  el?.remove();
}

/**
 * Unlock dialog — same chrome for manual lock + doorbell.
 * Visuals follow host CSS variables (copied from active theme).
 */
export function openLockDialog(
  host: HTMLElement,
  hass: HomeAssistant,
  entityId: string,
  language: Language,
  skin = 'modern',
  options: LockDialogOptions = {},
): void {
  closeLockDialog();

  const autoCloseSec = Math.max(1, options.autoCloseSec ?? AUTO_CLOSE_SEC);
  const previewStream = options.previewStream?.trim() || '';
  let remainingMs = autoCloseSec * 1000;
  let timer: number | undefined;
  let unlocking = false;
  let lastPaintKey = '';
  let closed = false;
  const started = performance.now();
  const chime = options.playSound ? startDoorbellChime() : { stop: () => undefined };

  const container = document.createElement('div');
  container.id = LOCK_DIALOG_ID;
  container.dataset.skin = skin;
  container.dataset.hasPreview = previewStream ? 'true' : 'false';
  container.dataset.lockDialogBuild = 'doorbell-preview-sound-202607231735';
  copyHostThemeTokens(host, container);

  const close = () => {
    if (closed) return;
    closed = true;
    if (timer) window.clearInterval(timer);
    chime.stop();
    container.querySelectorAll('img').forEach((img) => img.removeAttribute('src'));
    container.remove();
  };

  const cancel = async () => {
    try {
      await options.onCancel?.();
    } catch (error) {
      console.warn('[Skins Pro] lock dialog cancel failed', error);
    } finally {
      close();
    }
  };

  const unlock = async () => {
    if (unlocking) return;
    unlocking = true;
    paint(true);
    try {
      if (options.onUnlock) {
        await options.onUnlock();
      } else {
        await hass.callService('lock', 'unlock', { entity_id: entityId });
      }
    } catch (error) {
      console.warn('[Skins Pro] lock.unlock failed', error);
    } finally {
      unlocking = false;
      paint(true);
      if (options.onUnlock) close();
    }
  };

  const onScrim = () => {
    if (options.preventScrimClose) return;
    void cancel();
  };

  const paint = (force = false) => {
    const stateObj = hass.states?.[entityId];
    const state = stateObj?.state || 'unavailable';
    const pct = Math.max(0, Math.min(100, (remainingMs / (autoCloseSec * 1000)) * 100));
    const secs = Math.max(1, Math.ceil(remainingMs / 1000));
    const key = `${state}|${secs}|${Math.round(pct)}|${unlocking ? 1 : 0}|${previewStream}`;
    if (!force && key === lastPaintKey) return;
    lastPaintKey = key;

    const title = options.title || entityTitle(hass, entityId);
    const cancelLabel = options.cancelLabel || t(language, 'editorCancel');

    render(html`
      <style>${LOCK_DIALOG_STYLE}</style>
      <div class="lock-dialog-scrim" @click=${onScrim}>
        <div class="lock-dialog-card" @click=${(e: Event) => e.stopPropagation()}>
          <div class="lock-dialog-titles">
            <p class="lock-dialog-sub">${t(language, 'security')}</p>
            <h2>${title}</h2>
          </div>

          ${previewStream
            ? html`
              <div class="lock-dialog-preview" aria-label=${t(language, 'doorbellPreview')}>
                <img src=${previewUrl(previewStream)} alt="" decoding="async" />
              </div>
            `
            : ''}

          <div class="lock-dialog-status">
            <p class="lock-dialog-state">${stateHeading(state, language)}</p>
            <div class="lock-dialog-count" aria-live="polite">${secs}</div>
          </div>

          <div class="lock-dialog-progress" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow=${Math.round(pct)}>
            <span style="width:${pct}%"></span>
          </div>
          <p class="lock-dialog-hint">${t(language, 'lockAutoClose', { n: secs })}</p>

          <div class="lock-dialog-actions">
            <button type="button" class="lock-dialog-cancel" @click=${() => { void cancel(); }}>
              ${cancelLabel}
            </button>
            <button
              type="button"
              class="lock-dialog-unlock"
              ?disabled=${unlocking || state === 'unavailable'}
              @click=${() => { void unlock(); }}
            >
              ${unlocking ? t(language, 'lockUnlocking') : t(language, 'lockUnlock')}
            </button>
          </div>
        </div>
      </div>
    `, container);
  };

  document.body.appendChild(container);
  paint(true);

  timer = window.setInterval(() => {
    remainingMs = Math.max(0, autoCloseSec * 1000 - (performance.now() - started));
    if (remainingMs <= 0) {
      void (async () => {
        try {
          await options.onTimeout?.();
        } catch (error) {
          console.warn('[Skins Pro] lock dialog timeout failed', error);
        } finally {
          close();
        }
      })();
      return;
    }
    paint();
  }, 100);
}
