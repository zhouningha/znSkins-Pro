import { html, render, nothing } from 'lit';
import type { DashboardConfig } from '../types';
import { SKINS } from '../skins/generated';
import { selectedSkin, skinString } from '../utils';

const DIALOG_ID = 'sp-skin-picker-dialog';

const SKIN_LABELS: Record<string, string> = {
  modern: 'Modern',
  'animal-crossing': '动物森友会',
  organic: '自然之家',
  god_of_war_3_wall: '战神',
  'retro-luxury': '复古奢华',
  'fantasy-westward-journey': '梦幻西游',
  'neo-tactile': 'Neo Tactile',
  'super-mario': '超级玛丽',
};

const HOST_TOKEN_KEYS = [
  '--sp-accent',
  '--sp-accent-alpha',
  '--sp-accent-border',
  '--sp-text-primary',
  '--sp-text-main',
  '--sp-text-muted',
  '--sp-text-secondary',
  '--sp-panel-bg',
  '--sp-glass-bg',
  '--sp-border-glass',
  '--sp-radius-xl',
  '--sp-radius-lg',
  '--sp-radius-md',
  '--sp-shadow-lg',
  '--glass-regular',
] as const;

const STYLE = `
#${DIALOG_ID} {
  position: fixed; inset: 0; z-index: 100000;
  font-family: inherit; pointer-events: auto;
  color: var(--sp-text-main, var(--sp-text-primary, #2d3734));
}
#${DIALOG_ID} .sk-scrim {
  position: absolute; inset: 0;
  display: flex; align-items: center; justify-content: center;
  padding: 24px;
  background: rgba(45, 55, 52, 0.42);
  backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
}
#${DIALOG_ID} .sk-card {
  width: min(420px, 100%);
  max-height: min(78vh, 640px);
  overflow: auto;
  display: grid; gap: 12px; padding: 20px;
  border-radius: var(--sp-radius-xl, 24px);
  background: var(--sp-panel-bg, var(--sp-glass-bg, var(--glass-regular, #EBEFEA)));
  border: 1px solid var(--sp-border-glass, rgba(45,55,52,.12));
  box-shadow: var(--sp-shadow-lg, 0 18px 48px rgba(45,55,52,.22));
  box-sizing: border-box;
}
#${DIALOG_ID} .sk-head {
  display: flex; align-items: center; justify-content: space-between; gap: 12px;
}
#${DIALOG_ID} .sk-title {
  margin: 0; font-size: 18px; font-weight: 700;
}
#${DIALOG_ID} .sk-close {
  width: 36px; height: 36px; border: 0; border-radius: 999px; cursor: pointer;
  background: var(--sp-accent-alpha, rgba(45,55,52,.08));
  color: inherit; display: grid; place-items: center;
}
#${DIALOG_ID} .sk-hint {
  margin: 0; font-size: 12px; font-weight: 600;
  color: var(--sp-text-muted, var(--sp-text-secondary, inherit));
  opacity: 0.9;
}
#${DIALOG_ID} .sk-list { display: grid; gap: 8px; }
#${DIALOG_ID} .sk-item {
  min-height: 48px; padding: 12px 14px; border-radius: var(--sp-radius-md, 16px);
  border: 1px solid var(--sp-border-glass, rgba(45,55,52,.1));
  background: var(--sp-accent-alpha, rgba(45,55,52,.04));
  color: inherit; font: inherit; font-size: 15px; font-weight: 700;
  text-align: left; cursor: pointer;
  display: flex; align-items: center; justify-content: space-between; gap: 10px;
}
#${DIALOG_ID} .sk-item[data-active="true"] {
  border-color: var(--sp-accent, #d99b68);
  background: var(--sp-accent-alpha, rgba(217,155,104,.14));
}
#${DIALOG_ID} .sk-item:active { transform: scale(0.98); }
#${DIALOG_ID} .sk-badge {
  font-size: 11px; font-weight: 700;
  color: var(--sp-accent, inherit); opacity: 0.9;
}
`;

function copyHostTokens(host: HTMLElement, target: HTMLElement): void {
  const computed = getComputedStyle(host);
  for (const key of HOST_TOKEN_KEYS) {
    const value = computed.getPropertyValue(key).trim();
    if (value) target.style.setProperty(key, value);
  }
}

function ensureStyle(): void {
  if (document.getElementById(`${DIALOG_ID}-style`)) return;
  const style = document.createElement('style');
  style.id = `${DIALOG_ID}-style`;
  style.textContent = STYLE;
  document.head.appendChild(style);
}

function skinLabel(id: string): string {
  const fromMeta = skinString(id, 'title_zh') || skinString(id, 'title');
  if (fromMeta) return fromMeta;
  return SKIN_LABELS[id] || id;
}

export function listAvailableSkins(config: DashboardConfig | undefined): string[] {
  const downloaded = ((config?.downloaded_skins || []) as string[]).filter(Boolean);
  return [...new Set<string>([...(SKINS as readonly string[]), ...downloaded])];
}

export function closeSkinPickerDialog(): void {
  document.getElementById(DIALOG_ID)?.remove();
}

export function openSkinPickerDialog(
  host: HTMLElement,
  config: DashboardConfig,
  onPick: (skin: string) => void | Promise<void>,
): void {
  ensureStyle();
  closeSkinPickerDialog();

  const current = selectedSkin(config);
  const skins = listAvailableSkins(config);
  const root = document.createElement('div');
  root.id = DIALOG_ID;
  copyHostTokens(host, root);
  document.body.appendChild(root);

  const onClose = (event?: Event) => {
    event?.preventDefault();
    event?.stopPropagation();
    closeSkinPickerDialog();
  };

  const pick = async (skin: string) => {
    if (skin === current) {
      closeSkinPickerDialog();
      return;
    }
    closeSkinPickerDialog();
    await onPick(skin);
  };

  render(html`
    <div class="sk-scrim" @click=${onClose}>
      <div class="sk-card" @click=${(e: Event) => e.stopPropagation()}>
        <div class="sk-head">
          <h2 class="sk-title">切换主题</h2>
          <button class="sk-close" type="button" aria-label="Close" @click=${onClose}>
            <ha-icon icon="mdi:close"></ha-icon>
          </button>
        </div>
        <p class="sk-hint">已安装主题 · 切换后会同步到所有设备</p>
        <div class="sk-list">
          ${skins.map((id) => html`
            <button
              class="sk-item"
              type="button"
              data-active=${id === current ? 'true' : 'false'}
              @click=${() => void pick(id)}
            >
              <span>${skinLabel(id)}</span>
              ${id === current ? html`<span class="sk-badge">当前</span>` : nothing}
            </button>
          `)}
        </div>
      </div>
    </div>
  `, root);
}
