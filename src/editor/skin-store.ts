import type { HomeAssistant } from '../types';
import type { Language } from '../i18n';
import { t } from '../utils';
import { deepClone, fire, type DashboardConfigRecord } from './config';

export const CDN_STORE = 'https://cdn.jsdelivr.net/gh/ha-china/Skins-Pro@store';

export interface SkinStoreTheme {
  id: string;
  name: string;
  thumbnail: string;
  author?: string;
}

export interface SkinStoreState {
  open: boolean;
  loading: boolean;
  error: string;
  themes: SkinStoreTheme[];
}

export function renderSkinStore(
  state: SkinStoreState,
  config: DashboardConfigRecord,
  language: Language,
): string {
  if (!state.open) return '';

  let content: string;
  if (state.loading) {
    content = `<p style="text-align:center;padding:40px 0;color:var(--sp-text-muted,#888)">${t(language, 'loadingQuote')}</p>`;
  } else if (state.error) {
    content = `<p style="text-align:center;padding:40px 0;color:var(--sp-error,#e44)">${t(language, 'editorSkinStoreLoadFailed')}</p>`;
  } else {
    const downloaded: string[] = config.downloaded_skins || [];
    content = `<div class="store-grid">${state.themes.map(theme => {
      const installed = downloaded.includes(theme.id);
      return `
      <div class="store-card ${installed ? 'store-installed' : ''}" data-store-theme="${theme.id}">
        <img src="${CDN_STORE}/${theme.thumbnail}" alt="${theme.name}" class="store-thumb" loading="lazy">
        <div class="store-info">
          <span class="store-name">${theme.name}${theme.author ? `<a href="https://github.com/${theme.author}" target="_blank" rel="noopener noreferrer" class="store-author">${theme.author}</a>` : ''}</span>
          ${installed
            ? `<button class="store-remove" data-store-remove="${theme.id}">${t(language, 'editorSkinStoreRemove')}</button>`
            : `<button class="store-download" data-store-download="${theme.id}">${t(language, 'editorSkinStoreDownload')}</button>`
          }
        </div>
      </div>`;
    }).join('')}</div>`;
  }

  return `
    <div class="nav-overlay" data-store-overlay style="display:flex">
      <div class="nav-dialog" style="max-width:1200px;width:95vw">
        <h3>${t(language, 'editorSkinStore')}</h3>
        ${content}
        <div class="nav-dialog-actions">
          <button class="nav-cancel" data-store-close>${t(language, 'editorSkinStoreClose')}</button>
        </div>
      </div>
    </div>
  `;
}

export async function fetchSkinThemes(): Promise<SkinStoreTheme[]> {
  const res = await fetch(`${CDN_STORE}/screenshots/registry.json?t=${Date.now()}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json() as SkinStoreTheme[];
  const themes = Array.isArray(data) ? data : [];
  for (let i = themes.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [themes[i], themes[j]] = [themes[j]!, themes[i]!];
  }
  return themes;
}

export function removeSkin(
  el: HTMLElement,
  currentConfig: DashboardConfigRecord,
  hass: HomeAssistant | undefined,
  skinId: string,
): DashboardConfigRecord {
  void (hass as any)?.callService('skins_pro', 'remove_skin', { skin_id: skinId }).catch(() => { /* integration not installed */ });
  const next = deepClone(currentConfig);
  const list: string[] = next.downloaded_skins || [];
  const idx = list.indexOf(skinId);
  if (idx !== -1) list.splice(idx, 1);
  next.downloaded_skins = list;
  if (next.resource_pack?.skin === skinId) {
    next.resource_pack.skin = 'modern';
    next.resource_pack.base_path = '__AUTO__';
  }
  fire(el, next);
  return next;
}

export interface DownloadResult {
  success: boolean;
  errorMessage?: string;
}

export async function downloadSkin(
  el: HTMLElement,
  currentConfig: DashboardConfigRecord,
  hass: HomeAssistant | undefined,
  skinId: string,
  language: Language,
): Promise<DownloadResult> {
  try {
    await (hass as any)?.callService('skins_pro', 'download_skin', { skin_id: skinId });
    const next = deepClone(currentConfig);
    next.resource_pack = next.resource_pack || {};
    next.resource_pack.skin = skinId;
    next.resource_pack.base_path = `/local/skins-pro/${skinId}/`;
    next.downloaded_skins = [...new Set([...(next.downloaded_skins || []), skinId])];
    fire(el, next);
    return { success: true };
  } catch (err: any) {
    const raw = err?.message || t(language, 'editorDownloadFailedHint');
    return { success: false, errorMessage: t(language, 'editorDownloadFailed', { message: raw }) };
  }
}
