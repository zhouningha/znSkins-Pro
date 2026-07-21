import { html, render } from 'lit';
import type { HomeAssistant } from '../types';
import type { Language } from '../i18n';
import { t } from '../utils';

const LOCK_DIALOG_ID = 'sp-lock-dialog';
const AUTO_CLOSE_SEC = 5;

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
  /* optional lock-specific overrides skins may set */
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

/**
 * Single lock-dialog stylesheet — structure fixed; colors from host tokens.
 * Mounted on document.body (outside shadow theme.css), so tokens are copied in.
 */
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
#${LOCK_DIALOG_ID} .lock-dialog-sub {
  margin: 0 0 4px; font-size: 12px; font-weight: 600;
  color: var(--sp-lock-sub, var(--sp-accent, inherit));
  opacity: 0.9;
}
#${LOCK_DIALOG_ID} .lock-dialog-titles h2 {
  margin: 0; font-size: 22px; font-weight: 800; color: inherit;
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

/** Copy theme tokens from card host onto the body-mounted dialog. */
export function copyHostThemeTokens(host: HTMLElement | null | undefined, target: HTMLElement): void {
  if (!host) return;
  const cs = getComputedStyle(host);
  for (const key of HOST_TOKEN_KEYS) {
    const value = cs.getPropertyValue(key).trim();
    if (value) target.style.setProperty(key, value);
  }
}

/**
 * Unlock dialog — same logic for every skin.
 * Visuals follow host CSS variables (copied from active theme).
 */
export function openLockDialog(
  host: HTMLElement,
  hass: HomeAssistant,
  entityId: string,
  language: Language,
  skin = 'modern',
): void {
  document.getElementById(LOCK_DIALOG_ID)?.remove();

  let remainingMs = AUTO_CLOSE_SEC * 1000;
  let timer: number | undefined;
  let unlocking = false;
  let lastPaintKey = '';
  const started = performance.now();

  const container = document.createElement('div');
  container.id = LOCK_DIALOG_ID;
  container.dataset.skin = skin;
  container.dataset.lockDialogBuild = 'token-202607201553';
  copyHostThemeTokens(host, container);

  const close = () => {
    if (timer) window.clearInterval(timer);
    container.remove();
  };

  const unlock = async () => {
    if (unlocking) return;
    unlocking = true;
    paint(true);
    try {
      await hass.callService('lock', 'unlock', { entity_id: entityId });
    } catch (error) {
      console.warn('[Skins Pro] lock.unlock failed', error);
    } finally {
      unlocking = false;
      paint(true);
    }
  };

  const paint = (force = false) => {
    const stateObj = hass.states?.[entityId];
    const state = stateObj?.state || 'unavailable';
    const pct = Math.max(0, Math.min(100, (remainingMs / (AUTO_CLOSE_SEC * 1000)) * 100));
    const secs = Math.max(1, Math.ceil(remainingMs / 1000));
    const key = `${state}|${secs}|${Math.round(pct)}|${unlocking ? 1 : 0}`;
    if (!force && key === lastPaintKey) return;
    lastPaintKey = key;

    render(html`
      <style>${LOCK_DIALOG_STYLE}</style>
      <div class="lock-dialog-scrim" @click=${close}>
        <div class="lock-dialog-card" @click=${(e: Event) => e.stopPropagation()}>
          <div class="lock-dialog-titles">
            <p class="lock-dialog-sub">${t(language, 'security')}</p>
            <h2>${entityTitle(hass, entityId)}</h2>
          </div>

          <div class="lock-dialog-status">
            <p class="lock-dialog-state">${stateHeading(state, language)}</p>
            <div class="lock-dialog-count" aria-live="polite">${secs}</div>
          </div>

          <div class="lock-dialog-progress" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow=${Math.round(pct)}>
            <span style="width:${pct}%"></span>
          </div>
          <p class="lock-dialog-hint">${t(language, 'lockAutoClose', { n: secs })}</p>

          <div class="lock-dialog-actions">
            <button type="button" class="lock-dialog-cancel" @click=${close}>
              ${t(language, 'editorCancel')}
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
    remainingMs = Math.max(0, AUTO_CLOSE_SEC * 1000 - (performance.now() - started));
    if (remainingMs <= 0) {
      close();
      return;
    }
    paint();
  }, 100);
}
