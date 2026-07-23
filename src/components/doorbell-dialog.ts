import { html, render } from 'lit';
import type { HomeAssistant } from '../types';
import type { Language } from '../i18n';
import { t } from '../utils';
import { copyHostThemeTokens } from './lock-dialog';
import { monitoringGo2rtcUrl } from './camera-stream';

/** Matches HA package r20k_doorbell.yaml — do not open a second Akuvox RTSP. */
export const DOORBELL_ACTIVE_ENTITY = 'input_boolean.r20k_doorbell_active';
export const DOORBELL_TIMER_ENTITY = 'timer.r20k_doorbell_wait';
export const DOORBELL_OPEN_SCRIPT = 'script.r20k_open_door';
export const DOORBELL_DISMISS_SCRIPT = 'script.r20k_doorbell_dismiss';
export const DOORBELL_LOCK_ENTITY = 'lock.r20k_2c74_relaya';
/** Same go2rtc name as security page — single RTSP producer via go2rtc. */
export const DOORBELL_STREAM = 'akuvox_sub';

const DOORBELL_DIALOG_ID = 'sp-doorbell-dialog';
const FALLBACK_WAIT_MS = 15_000;

const DOORBELL_DIALOG_STYLE = `
#${DOORBELL_DIALOG_ID} {
  position: fixed; inset: 0; z-index: 100010;
  font-family: inherit; pointer-events: auto;
  color: var(--sp-lock-text, var(--sp-text-primary, var(--sp-text-main, var(--sp-text-dark, #3d5a40))));
}
#${DOORBELL_DIALOG_ID} .lock-dialog-scrim {
  position: absolute; inset: 0;
  display: flex; align-items: center; justify-content: center;
  padding: 24px;
  background: var(--sp-lock-scrim, rgba(20, 24, 28, 0.48));
  backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
}
#${DOORBELL_DIALOG_ID} .lock-dialog-card {
  width: min(420px, 100%);
  display: grid; gap: 14px; padding: 22px;
  border-radius: var(--sp-radius-lg, 22px);
  background: var(--sp-lock-card-bg, var(--glass-regular, var(--sp-glass-bg, var(--sp-panel-bg, rgba(255,248,230,0.96)))));
  border: 1px solid var(--sp-lock-card-border, var(--sp-border-glass, var(--sp-accent-border, rgba(0,0,0,.12))));
  box-shadow: var(--sp-shadow-lg, 0 16px 40px rgba(0,0,0,.28));
  color: inherit;
  pointer-events: auto; touch-action: manipulation;
}
#${DOORBELL_DIALOG_ID} .lock-dialog-sub {
  margin: 0 0 4px; font-size: 12px; font-weight: 600;
  color: var(--sp-lock-sub, var(--sp-accent, inherit));
  opacity: 0.9;
}
#${DOORBELL_DIALOG_ID} .lock-dialog-titles h2 {
  margin: 0; font-size: 22px; font-weight: 800; color: inherit;
}
#${DOORBELL_DIALOG_ID} .doorbell-preview {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 10;
  border-radius: calc(var(--sp-radius-lg, 22px) - 6px);
  overflow: hidden;
  background: #050608;
  border: 1px solid var(--sp-border-glass, rgba(0,0,0,.12));
}
#${DOORBELL_DIALOG_ID} .doorbell-preview img {
  position: absolute; inset: 0;
  width: 100%; height: 100%;
  object-fit: cover; object-position: center;
  display: block; background: #050608;
}
#${DOORBELL_DIALOG_ID} .lock-dialog-status {
  display: flex; align-items: center; justify-content: space-between; gap: 12px;
  padding: 12px 14px; border-radius: 16px;
  background: var(--sp-lock-status-bg, var(--sp-accent-alpha, rgba(255,255,255,0.45)));
  border: 1px solid var(--sp-accent-border, transparent);
}
#${DOORBELL_DIALOG_ID} .lock-dialog-state {
  margin: 0; font-size: 18px; font-weight: 700; color: inherit;
}
#${DOORBELL_DIALOG_ID} .lock-dialog-count {
  width: 44px; height: 44px; border-radius: 50%;
  display: grid; place-items: center;
  font-size: 18px; font-weight: 800; flex-shrink: 0;
  background: var(--sp-lock-count-bg, var(--sp-accent, #7ec850));
  color: var(--sp-lock-count-fg, var(--sp-text-on-accent, #fff8e6));
  box-shadow: 0 6px 14px var(--sp-accent-alpha, rgba(0,0,0,.2));
}
#${DOORBELL_DIALOG_ID} .lock-dialog-progress {
  height: 8px; border-radius: 999px; overflow: hidden;
  background: var(--sp-lock-progress-bg, var(--sp-accent-alpha, rgba(0,0,0,.12)));
}
#${DOORBELL_DIALOG_ID} .lock-dialog-progress > span {
  display: block; height: 100%; border-radius: inherit;
  background: var(--sp-lock-progress-fill, linear-gradient(90deg, var(--sp-accent-alpha, transparent), var(--sp-accent, #7ec850)));
  transition: width 0.2s linear;
}
#${DOORBELL_DIALOG_ID} .lock-dialog-hint {
  margin: 0; font-size: 13px; text-align: center; opacity: 0.8;
}
#${DOORBELL_DIALOG_ID} .lock-dialog-actions {
  display: grid; grid-template-columns: 1fr 1fr; gap: 10px;
}
#${DOORBELL_DIALOG_ID} .lock-dialog-actions button {
  min-height: 48px; border: 0; border-radius: var(--sp-radius-pill, 999px);
  font: inherit; font-size: 16px; font-weight: 800;
  cursor: pointer; pointer-events: auto; touch-action: manipulation;
}
#${DOORBELL_DIALOG_ID} .lock-dialog-cancel {
  background: var(--sp-lock-cancel-bg, rgba(255,255,255,0.55));
  color: var(--sp-lock-cancel-fg, inherit);
  border: 1px solid var(--sp-border-glass, rgba(0,0,0,.12)) !important;
}
#${DOORBELL_DIALOG_ID} .lock-dialog-unlock {
  background: var(--sp-lock-unlock-bg, var(--sp-accent, #7ec850));
  color: var(--sp-lock-unlock-fg, var(--sp-text-on-accent, #fff8e6));
  box-shadow: 0 6px 14px var(--sp-accent-alpha, rgba(0,0,0,.2));
}
#${DOORBELL_DIALOG_ID} .lock-dialog-unlock:disabled { opacity: 0.55; cursor: not-allowed; }
`;

function lockStateHeading(state: string, language: Language): string {
  if (state === 'locked') return language === 'zh-CN' ? '可开门' : 'Ready';
  if (state === 'unlocked') return language === 'zh-CN' ? '已释放' : 'Released';
  if (state === 'unavailable' || state === 'unknown') return language === 'zh-CN' ? '离线' : 'Offline';
  return state;
}

function remainingMsFromHass(hass: HomeAssistant, openedAt: number): { remainingMs: number; totalMs: number; phoneNotified: boolean } {
  const timer = hass.states?.[DOORBELL_TIMER_ENTITY];
  const finishesAt = timer?.attributes?.finishes_at;
  if (timer?.state === 'active' && typeof finishesAt === 'string' && finishesAt) {
    const end = Date.parse(finishesAt);
    if (!Number.isNaN(end)) {
      const remainingMs = Math.max(0, end - Date.now());
      const durationStr = String(timer.attributes?.duration || '0:00:15');
      const parts = durationStr.split(':').map((p) => Number(p) || 0);
      let totalMs = FALLBACK_WAIT_MS;
      if (parts.length === 3) totalMs = ((parts[0] * 3600) + (parts[1] * 60) + parts[2]) * 1000;
      else if (parts.length === 2) totalMs = (parts[0] * 60 + parts[1]) * 1000;
      return { remainingMs, totalMs: Math.max(totalMs, 1000), phoneNotified: remainingMs <= 0 };
    }
  }
  const elapsed = performance.now() - openedAt;
  const remainingMs = Math.max(0, FALLBACK_WAIT_MS - elapsed);
  return { remainingMs, totalMs: FALLBACK_WAIT_MS, phoneNotified: remainingMs <= 0 && timer?.state !== 'active' };
}

function previewUrl(): string {
  return `${monitoringGo2rtcUrl().replace(/\/$/, '')}/api/stream.mjpeg?src=${encodeURIComponent(DOORBELL_STREAM)}`;
}

export function isDoorbellDialogOpen(): boolean {
  return Boolean(document.getElementById(DOORBELL_DIALOG_ID));
}

export function closeDoorbellDialog(): void {
  document.getElementById(DOORBELL_DIALOG_ID)?.remove();
}

/**
 * Doorbell overlay — same chrome as lock-dialog (host --sp-* tokens).
 * Open / dismiss call existing HA scripts; preview uses go2rtc akuvox_sub only.
 */
export function openDoorbellDialog(
  host: HTMLElement,
  hass: HomeAssistant,
  language: Language,
  skin = 'modern',
): void {
  if (isDoorbellDialogOpen()) return;

  let busy = false;
  let timer: number | undefined;
  let lastPaintKey = '';
  let latestHass = hass;
  const openedAt = performance.now();

  const container = document.createElement('div');
  container.id = DOORBELL_DIALOG_ID;
  container.dataset.skin = skin;
  container.dataset.doorbellDialogBuild = '202607231705';
  copyHostThemeTokens(host, container);

  const close = () => {
    if (timer) window.clearInterval(timer);
    // Drop MJPEG consumer when overlay closes.
    container.querySelectorAll('img').forEach((img) => {
      img.removeAttribute('src');
    });
    container.remove();
  };

  const dismiss = async () => {
    if (busy) return;
    busy = true;
    paint(true);
    try {
      await latestHass.callService('script', 'turn_on', { entity_id: DOORBELL_DISMISS_SCRIPT });
    } catch (error) {
      console.warn('[Skins Pro] doorbell dismiss failed', error);
    } finally {
      busy = false;
      close();
    }
  };

  const openDoor = async () => {
    if (busy) return;
    busy = true;
    paint(true);
    try {
      await latestHass.callService('script', 'turn_on', { entity_id: DOORBELL_OPEN_SCRIPT });
    } catch (error) {
      console.warn('[Skins Pro] doorbell open failed', error);
    } finally {
      busy = false;
      close();
    }
  };

  const paint = (force = false) => {
    const lockState = latestHass.states?.[DOORBELL_LOCK_ENTITY]?.state || 'unavailable';
    const { remainingMs, totalMs, phoneNotified } = remainingMsFromHass(latestHass, openedAt);
    const pct = phoneNotified ? 0 : Math.max(0, Math.min(100, (remainingMs / totalMs) * 100));
    const secs = phoneNotified ? 0 : Math.max(1, Math.ceil(remainingMs / 1000));
    const key = `${lockState}|${secs}|${Math.round(pct)}|${busy ? 1 : 0}|${phoneNotified ? 1 : 0}`;
    if (!force && key === lastPaintKey) return;
    lastPaintKey = key;

    const hint = phoneNotified
      ? t(language, 'doorbellPhoneNotified')
      : t(language, 'doorbellWaitPhone', { n: secs });

    render(html`
      <style>${DOORBELL_DIALOG_STYLE}</style>
      <div class="lock-dialog-scrim" @click=${(e: Event) => e.stopPropagation()}>
        <div class="lock-dialog-card" @click=${(e: Event) => e.stopPropagation()}>
          <div class="lock-dialog-titles">
            <p class="lock-dialog-sub">${t(language, 'security')}</p>
            <h2>${t(language, 'doorbellTitle')}</h2>
          </div>

          <div class="doorbell-preview" aria-label=${t(language, 'doorbellPreview')}>
            <img src=${previewUrl()} alt="" decoding="async" />
          </div>

          <div class="lock-dialog-status">
            <p class="lock-dialog-state">${lockStateHeading(lockState, language)}</p>
            <div class="lock-dialog-count" aria-live="polite">${phoneNotified ? '✓' : secs}</div>
          </div>

          <div class="lock-dialog-progress" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow=${Math.round(pct)}>
            <span style="width:${pct}%"></span>
          </div>
          <p class="lock-dialog-hint">${hint}</p>

          <div class="lock-dialog-actions">
            <button type="button" class="lock-dialog-cancel" ?disabled=${busy} @click=${() => { void dismiss(); }}>
              ${t(language, 'doorbellDismiss')}
            </button>
            <button
              type="button"
              class="lock-dialog-unlock"
              ?disabled=${busy || lockState === 'unavailable'}
              @click=${() => { void openDoor(); }}
            >
              ${busy ? t(language, 'lockUnlocking') : t(language, 'lockUnlock')}
            </button>
          </div>
        </div>
      </div>
    `, container);
  };

  (container as HTMLElement & { __spUpdateHass?: (next: HomeAssistant) => void }).__spUpdateHass = (next) => {
    latestHass = next;
  };

  document.body.appendChild(container);
  paint(true);

  timer = window.setInterval(() => {
    if (latestHass.states?.[DOORBELL_ACTIVE_ENTITY]?.state !== 'on') {
      close();
      return;
    }
    paint();
  }, 200);
}

/** Refresh live hass reference while the overlay is open. */
export function updateDoorbellDialogHass(hass: HomeAssistant): void {
  const el = document.getElementById(DOORBELL_DIALOG_ID) as (HTMLElement & { __spUpdateHass?: (next: HomeAssistant) => void }) | null;
  el?.__spUpdateHass?.(hass);
}
