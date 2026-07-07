import { SKINS } from './skins.generated';
import { STRINGS } from './i18n.generated';
import type { AreaRegistryEntry, HomeAssistant, TranslationKey, NavItemConfig } from './types';
import { DEFAULT_NAV } from './constants';
import { normalizeSecurityCameras, normalizeSecurityDevices } from './config';
import { assetHref, normalizeLanguage } from './utils';

const OFFICIAL_STORE_BASE = 'https://cdn.jsdelivr.net/gh/ha-china/Skins-Pro@master';
const CUSTOM_STORE_BASE = 'https://cdn.jsdelivr.net/gh/zhouningha/znSkins-Pro@master';
const STORE_SOURCES = [
  { key: 'official', label: 'Official', base: OFFICIAL_STORE_BASE },
  { key: 'custom', label: 'Mine', base: CUSTOM_STORE_BASE },
] as const;

type DashboardConfigRecord = Record<string, any>;
type SkinStoreTheme = {
  id: string;
  name: string;
  thumbnail: string;
  author?: string;
  package?: string;
  source: string;
  sourceLabel: string;
  sourceBase: string;
  packageUrl?: string;
};

function storeUrl(base: string, value?: string): string {
  if (!value) return '';
  if (/^https?:\/\//.test(value)) return value;
  return base.replace(/\/$/, '') + '/' + value.replace(/^\//, '');
}

const fire = (el: HTMLElement, config: DashboardConfigRecord) => {
  el.dispatchEvent(new CustomEvent('config-changed', {
    bubbles: true,
    composed: true,
    detail: { config },
  }));
};

const deepClone = <T,>(obj: T): T => {
  try {
    return structuredClone(obj);
  } catch {
    return JSON.parse(JSON.stringify(obj)) as T;
  }
};

const ENTITY_PICKER_TAG = 'ha-entity-picker';
const CONTROLLABLE_DOMAINS = ['light', 'switch', 'fan', 'cover', 'lock', 'climate', 'media_player', 'vacuum', 'humidifier', 'water_heater', 'valve', 'siren', 'automation', 'group', 'input_boolean'];

export class SkinsProCardEditor extends HTMLElement {
  private _config: DashboardConfigRecord = { type: 'custom:skins-pro-card' };
  private _hass?: HomeAssistant;
  private _areas: AreaRegistryEntry[] = [];
  private _areasLoaded = false;
  private _navDialogOpen = false;
  private _skinStoreOpen = false;
  private _skinStoreThemes: SkinStoreTheme[] = [];
  private _skinStoreLoading = false;
  private _skinStoreError = '';

  public constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  public setConfig(config: DashboardConfigRecord): void {
    const next = { type: 'custom:skins-pro-card', ...config };
    if (JSON.stringify(next) === JSON.stringify(this._config)) return;
    this._config = next;
    this.render();
  }

  public set hass(hass: HomeAssistant) {
    this._hass = hass;
    if (this.shadowRoot) {
      this.shadowRoot.querySelectorAll(ENTITY_PICKER_TAG).forEach((el: any) => {
        if (el) el.hass = hass;
      });
    }
    void this._loadAreas();
  }

  private async _loadAreas(): Promise<void> {
    if (this._areasLoaded || !this._hass) return;
    try {
      const conn = (this._hass as any).connection;
      if (!conn?.sendMessagePromise) return;
      const areas: AreaRegistryEntry[] = await conn.sendMessagePromise({ type: 'config/area_registry/list' });
      if (Array.isArray(areas)) {
        this._areas = areas;
        this._areasLoaded = true;
        this.render();
      }
    } catch { /* area registry not available */ }
  }

  private _loc(key: TranslationKey): string {
    const lang = normalizeLanguage(this._hass?.language);
    return STRINGS[lang][key];
  }

  private themeCssUrl(): string {
    return assetHref(this._config as any, 'theme_css');
  }

  private setField(path: string, value: any): void {
    const next = deepClone(this._config);
    const parts = path.split('.');
    let cur: Record<string, any> = next;
    for (let i = 0; i < parts.length - 1; i += 1) {
      const p = parts[i];
      if (!p) return;
      cur[p] = cur[p] || {};
      cur = cur[p] as Record<string, any>;
    }
    const last = parts[parts.length - 1];
    if (last) cur[last] = value;
    this._config = next;
    fire(this, this._config);
    this.render();
  }

  private setListItem(path: string, index: number, value: string): void {
    const next = deepClone(this._config);
    const parts = path.split('.');
    let cur: Record<string, any> = next;
    for (let i = 0; i < parts.length - 1; i += 1) {
      const p = parts[i];
      if (!p) return;
      cur[p] = cur[p] || {};
      cur = cur[p] as Record<string, any>;
    }
    const last = parts[parts.length - 1];
    if (!last) return;
    const arr: string[] = cur[last] || [];
    if (value) {
      arr[index] = value;
      cur[last] = arr;
      this._config = next;
      fire(this, this._config);
      return;
    }
    arr.splice(index, 1);
    cur[last] = arr;
    this._config = next;
    fire(this, this._config);
    this.render();
  }

  private addListItem(path: string, max?: number): void {
    const next = deepClone(this._config);
    const parts = path.split('.');
    let cur: Record<string, any> = next;
    for (let i = 0; i < parts.length - 1; i += 1) {
      const p = parts[i];
      if (!p) return;
      cur[p] = cur[p] || {};
      cur = cur[p] as Record<string, any>;
    }
    const last = parts[parts.length - 1];
    if (!last) return;
    const arr: string[] = cur[last] || [];
    if (max !== undefined && arr.length >= max) return;
    arr.push('');
    cur[last] = arr;
    this._config = next;
    fire(this, this._config);
    this.render();
  }

  private entityPicker(label: string, path: string, value: string, domains?: string[]): string {
    const filter = domains?.length ? ` include-domains='${JSON.stringify(domains)}'` : '';
    return `
      <label>
        <span>${label}</span>
        <${ENTITY_PICKER_TAG} data-path="${path}"${filter} value="${value || ''}"></${ENTITY_PICKER_TAG}>
      </label>
    `;
  }

  private listPicker(label: string, path: string, values: string[], domains?: string[], max?: number): string {
    const filter = domains?.length ? ` include-domains='${JSON.stringify(domains)}'` : '';
    const arr = Array.isArray(values) ? values : [];
    const rows = (arr.length > 0 ? arr : ['']).map((val, i) => `
      <div class="selector-row">
        <${ENTITY_PICKER_TAG} data-list-path="${path}" data-list-index="${i}"${filter} value="${val || ''}"></${ENTITY_PICKER_TAG}>
        <button class="sp-del" data-del-path="${path}" data-del-index="${i}">✕</button>
      </div>
    `).join('');
    const addBtn = arr.length >= (max ?? Infinity) ? '' : `<button class="sp-add" data-add-path="${path}" data-add-max="${max ?? ''}">+</button>`;
    return `
      <label>
        <span>${label}</span>
        <div class="sp-list">${rows}</div>
        ${addBtn}
      </label>
    `;
  }

  private areaPicker(values: string[], max?: number): string {
    if (!this._areasLoaded || this._areas.length === 0) {
      return `<p class="muted">Loading areas...</p>`;
    }
    const arr = Array.isArray(values) ? values : [];
    const rows = (arr.length > 0 ? arr : ['']).map((val, i) => `
      <div class="selector-row">
        <select data-area-path="home_selection.rooms" data-area-index="${i}">
          <option value="">—</option>
          ${this._areas.map(a => `<option value="${a.area_id}"${a.area_id === val ? ' selected' : ''}>${a.name}</option>`).join('')}
        </select>
        <button class="sp-del" data-del-area-path="home_selection.rooms" data-del-area-index="${i}">✕</button>
      </div>
    `).join('');
    const addBtn = arr.length >= (max ?? Infinity) ? '' : `<button class="sp-add" data-add-area-path="home_selection.rooms" data-add-max="${max ?? ''}">+</button>`;
    return `
      <div class="sp-list">${rows}</div>
      ${addBtn}
    `;
  }

  private _navItemChecked(key: string): boolean {
    const navItems: NavItemConfig[] = this._config?.nav ?? [];
    const item = navItems.find(n => n.key === key);
    return item ? item.enabled !== false : true;
  }

  private _renderSkinStore(): string {
    if (!this._skinStoreOpen) return '';
    let content: string;
    if (this._skinStoreLoading) {
      content = `<p style="text-align:center;padding:40px 0;color:var(--sp-text-muted,#888)">${this._loc('loadingQuote')}</p>`;
    } else if (this._skinStoreError) {
      content = `<p style="text-align:center;padding:40px 0;color:var(--sp-error,#e44)">${this._loc('editorSkinStoreLoadFailed')}</p>`;
    } else {
      const downloaded: string[] = this._config.downloaded_skins || [];
      content = `<div class="store-grid">${this._skinStoreThemes.map(t => {
        const installed = downloaded.includes(t.id);
        return `
        <div class="store-card ${installed ? 'store-installed' : ''}" data-store-theme="${t.id}">
          <img src="${storeUrl(t.sourceBase, t.thumbnail)}" alt="${t.name}" class="store-thumb" loading="lazy">
          <div class="store-info">
            <span class="store-name">${t.name}<small class="store-source">${t.sourceLabel}</small>${t.author ? `<a href="https://github.com/${t.author}" target="_blank" rel="noopener noreferrer" class="store-author">${t.author}</a>` : ''}</span>
            ${installed
              ? `<button class="store-remove" data-store-remove="${t.id}">${this._loc('editorSkinStoreRemove')}</button>`
              : `<button class="store-download" data-store-download="${t.id}" data-store-package-url="${t.packageUrl || storeUrl(t.sourceBase, t.package)}">${this._loc('editorSkinStoreDownload')}</button>`
            }
          </div>
        </div>`;
      }).join('')}</div>`;
    }
    return `
      <div class="nav-overlay" data-store-overlay style="display:flex">
        <div class="nav-dialog" style="max-width:1200px;width:95vw">
          <h3>${this._loc('editorSkinStore')}</h3>
          ${content}
          <div class="nav-dialog-actions">
            <button class="nav-cancel" data-store-close>${this._loc('editorSkinStoreClose')}</button>
          </div>
        </div>
      </div>
    `;
  }

  private _renderNavDialog(): string {
    const lang = normalizeLanguage(this._hass?.language);
    return `
      <div class="nav-overlay" data-nav-overlay>
        <div class="nav-dialog">
          <h3>${this._loc('editorNavigation')}</h3>
          ${DEFAULT_NAV.map(item => `
            <label class="nav-dialog-item">
              <span>${STRINGS[lang][(item.key || 'home') as TranslationKey] || item.key}</span>
              <input type="checkbox" data-nav-key="${item.key}" ${this._navItemChecked(item.key || '') ? 'checked' : ''}>
            </label>
          `).join('')}
          <div class="nav-dialog-actions">
            <button class="nav-cancel" data-nav-cancel>Cancel</button>
            <button class="nav-save" data-nav-save>Save</button>
          </div>
        </div>
      </div>
    `;
  }

  private render(): void {
    if (!this.shadowRoot) return;
    const c = this._config || {};
    const hs = c.home_selection || {};
    const hl = c.home_limits || {};

    this.shadowRoot.innerHTML = `
      <link rel="stylesheet" href="${this.themeCssUrl()}">
      <style>.bg-preview{max-width:120px;max-height:60px;border-radius:6px;display:block;flex-shrink:0}.sp-card input[type=checkbox]{width:auto;min-height:auto;margin:0}.sp-card label:has(input[type=checkbox]){display:flex;align-items:center;gap:8px}.sp-btn-configure{cursor:pointer}.nav-overlay{position:fixed;inset:0;z-index:999;background:rgba(0,0,0,0.5);display:${this._navDialogOpen ? 'flex' : 'none'};align-items:center;justify-content:center}.nav-dialog{background:var(--sp-card-bg,var(--sp-panel-bg,var(--glass-regular,var(--ha-card-background,#fff))));border-radius:var(--sp-radius-lg);padding:var(--sp-space-xl);min-width:280px;max-width:380px;box-shadow:var(--sp-shadow-card);border:var(--sp-border-width,1px) solid var(--sp-border-device,var(--sp-border-glass,var(--divider-color,rgba(0,0,0,0.12))));backdrop-filter:var(--sp-blur-lg,none);-webkit-backdrop-filter:var(--sp-blur-lg,none)}.nav-dialog h3{margin:0 0 var(--sp-space-md);font-size:var(--sp-font-md);font-weight:700;color:var(--sp-text-main,var(--sp-text-primary,inherit))}.nav-dialog-item{display:flex;align-items:center;gap:var(--sp-space-sm);padding:var(--sp-space-2xs) 0}.nav-dialog-item span{font-size:var(--sp-font-xs);color:var(--sp-text-main,var(--sp-text-primary,inherit))}.nav-dialog-item input[type=checkbox]{width:auto;min-height:auto;margin:0;margin-left:auto;accent-color:var(--sp-accent)}.nav-dialog-actions{display:flex;gap:var(--sp-space-sm);justify-content:flex-end;margin-top:var(--sp-space-lg)}.nav-dialog-actions button{min-height:38px;border:0;border-radius:var(--sp-radius-sm,8px);padding:0 var(--sp-space-lg);cursor:pointer;font:inherit;font-weight:600;font-size:var(--sp-font-xs);white-space:nowrap}.nav-dialog-actions .nav-cancel{background:var(--sp-device-bg,rgba(128,128,128,0.1));color:var(--sp-text-main,var(--sp-text-primary,inherit));border:var(--sp-border-width,1px) solid var(--sp-border-muted,var(--sp-border-glass,transparent))}.nav-dialog-actions .nav-cancel:hover{filter:brightness(0.96)}.nav-dialog-actions .nav-save{background:var(--sp-accent);color:var(--sp-text-on-accent,#fff)}.nav-dialog-actions .nav-save:hover{filter:brightness(1.08)}.store-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:16px;max-height:70vh;overflow-y:auto}.store-card{display:flex;flex-direction:column;gap:8px;padding:12px;border-radius:8px;background:var(--sp-device-bg,rgba(128,128,128,0.06))}.store-thumb{width:100%;height:auto;border-radius:6px;display:block}.store-info{display:flex;align-items:center;justify-content:space-between;gap:8px}.store-name{font-size:var(--sp-font-xs,13px);font-weight:600;color:var(--sp-text-main,var(--sp-text-primary,inherit))}.store-source{display:inline-block;margin-left:6px;padding:1px 5px;border-radius:5px;background:rgba(128,128,128,0.16);font-size:var(--sp-font-3xs,11px);font-weight:600;opacity:.82}.store-author{margin-left:6px;font-weight:400;font-size:var(--sp-font-2xs,12px);color:var(--sp-accent,#8ab8cc);text-decoration:none}.store-author:hover{text-decoration:underline}.store-download{min-height:32px;border:0;border-radius:6px;padding:0 12px;cursor:pointer;font:inherit;font-weight:600;font-size:var(--sp-font-2xs,12px);white-space:nowrap;background:var(--sp-accent,#8ab8cc);color:#fff}.store-download:hover{filter:brightness(1.1)}.store-installed{border:1px solid var(--sp-accent,#8ab8cc)}.store-remove{min-height:32px;border:0;border-radius:6px;padding:0 12px;cursor:pointer;font:inherit;font-weight:600;font-size:var(--sp-font-2xs,12px);white-space:nowrap;background:var(--sp-error,#e44);color:#fff}.store-remove:hover{filter:brightness(1.1)}</style>
      <div class="sp-wrap">
        <div class="sp-card">
          <h3>${this._loc('editorSkin')}</h3>
          <div style="display:flex;flex-wrap:wrap;gap:12px;align-items:flex-end">
            <label class="sp-field" style="min-width:auto">
              <span>&nbsp;</span>
              <button class="sp-btn-configure" data-skin-store style="min-height:40px;padding:0 14px">${this._loc('editorSkinStore')}</button>
            </label>
            <label class="sp-field" style="flex:1;min-width:140px">
              <span>Skin</span>
              <select data-text-path="resource_pack.skin">
                ${(SKINS as readonly string[]).map((s: string) => `<option value="${s}"${s === (c.resource_pack?.skin || 'modern') ? ' selected' : ''}>${s}</option>`).join('')}
                ${((c.downloaded_skins || []) as string[]).filter((s: string) => !SKINS.includes(s)).map((s: string) => `<option value="${s}"${s === (c.resource_pack?.skin || 'modern') ? ' selected' : ''}>${s} (Downloaded)</option>`).join('')}
              </select>
            </label>
            <label class="sp-field" style="min-width:120px;display:grid;justify-items:center;align-content:center">
              <span>${this._loc('editorUseAreaPictures')}</span>
              <input type="checkbox" data-path="use_area_pictures"${c.use_area_pictures ? ' checked' : ''} style="width:18px;height:18px;margin:0">
            </label>
            <label class="sp-field" style="min-width:80px;display:grid;justify-items:center;align-content:center">
              <span>${this._loc('editorFullscreen')}</span>
              <input type="checkbox" data-path="fullscreen"${c.fullscreen ? ' checked' : ''} style="width:18px;height:18px;margin:0">
            </label>
          </div>
          <div class="sp-row" style="grid-template-columns:1fr 1fr;gap:12px">
            <label class="sp-field">
              <span>Background</span>
              <div style="display:flex;flex-wrap:nowrap;align-items:center;gap:8px">
                <input type="file" accept="image/*" data-bg-upload style="flex:1;min-width:0">
                ${c.background_image ? `<img class="bg-preview" src="${c.background_image}"><button class="sp-del" data-bg-clear>✕</button>` : ''}
                ${!c.background_image ? '' : ''}
              </div>
            </label>
            <label class="sp-field">
              <span>${this._loc('editorNavigation')}</span>
              <button class="sp-btn-configure" data-nav-configure>${this._loc('editorNavigationConfigure')}</button>
            </label>
          </div>
        </div>

        <div class="sp-row">
          <div class="sp-card">${this.entityPicker('Weather', 'weather.entity', c.weather?.entity || hs.weather_entity || '', ['weather'])}</div>
          <div class="sp-card">${this.entityPicker(this._loc('editorInfo'), 'info.entity', c.info?.entity || '', ['input_text', 'sensor'])}</div>
        </div>

        <div class="sp-row" style="grid-template-columns:1fr 1fr 1fr">
          <div class="sp-card">
            <h3>${this._loc('editorEnergy')}</h3>
            ${this.entityPicker('Energy Entity', 'energy.entity', c.energy?.entity || hs.energy_entity || '', ['sensor'])}
          </div>
          <div class="sp-card">
            <h3>${this._loc('editorMediaPlayer')}</h3>
            ${this.entityPicker('Media Player', 'media_player.entity', c.media_player?.entity || '', ['media_player'])}
          </div>
          <div class="sp-card">
            <h3>${this._loc('editorCamera')}</h3>
            <p class="muted">${this._loc('editorCameraHint')}</p>
            ${this.entityPicker('Camera', 'camera.entity', c.camera?.entity || '', ['camera'])}
          </div>
        </div>

        <div class="sp-row" style="grid-template-columns:1fr 1fr">
          <div class="sp-card">
            <h3>${this._loc('editorSecurity')}</h3>
            <p class="muted">${this._loc('editorSecurityHint')}</p>
            <h4 style="margin:12px 0 6px;font-size:13px;font-weight:600;">${this._loc('editorSecurityCameras')}</h4>
            ${this.listPicker(this._loc('editorSecurityCameras'), 'security.cameras', c.security?.cameras || normalizeSecurityCameras(c.security) || [], ['camera'])}
            <h4 style="margin:16px 0 6px;font-size:13px;font-weight:600;">${this._loc('editorSecurityDevices')}</h4>
            ${this.listPicker(this._loc('editorSecurityDevices'), 'security.entities', c.security?.entities || normalizeSecurityDevices(c.security) || [], ['camera', 'button', 'lock', 'alarm_control_panel', 'binary_sensor'])}
          </div>
        </div>

        <div class="sp-row">
          <div class="sp-card">
            <h3>${this._loc('editorHomeDevices')}</h3>
            ${this.listPicker('Devices', 'home_selection.devices', hs.devices || [], CONTROLLABLE_DOMAINS, hl.devices || 5)}
          </div>
          <div class="sp-card">
            <h3>${this._loc('editorHomeRooms')}</h3>
            ${this.areaPicker(hs.rooms || [], hl.rooms || 4)}
          </div>
        </div>

        <div class="sp-row">
          <div class="sp-card">
            <h3>${this._loc('editorHomeScenes')}</h3>
            ${this.listPicker('Scenes', 'home_selection.scenes', hs.scenes || [], ['scene'], hl.scenes || 6)}
          </div>
          <div class="sp-card">
            <h3>${this._loc('editorHomeEnv')}</h3>
            ${this.listPicker('Environment', 'home_selection.environment', hs.environment || [], ['sensor'], hl.environment || 5)}
          </div>
        </div>

        ${this._renderNavDialog()}
        ${this._renderSkinStore()}
      </div>
    `;

    this.shadowRoot.querySelectorAll(ENTITY_PICKER_TAG).forEach((el: any) => {
      if (this._hass) el.hass = this._hass;
      el.addEventListener('value-changed', (ev: CustomEvent) => {
        const path = el.dataset.path || el.dataset.listPath;
        if (!path) return;
        if (el.dataset.listIndex !== undefined) {
          this.setListItem(path, Number(el.dataset.listIndex), ev.detail.value);
        } else {
          this.setField(path, ev.detail.value);
        }
      });
    });

    this.shadowRoot.querySelectorAll<HTMLSelectElement>('select[data-area-path]').forEach((el) => {
      el.addEventListener('change', () => {
        const path = el.dataset.areaPath;
        if (!path || el.dataset.areaIndex === undefined) return;
        this.setListItem(path, Number(el.dataset.areaIndex), el.value);
      });
    });

    this.shadowRoot.querySelectorAll<HTMLInputElement>('input[data-text-path], select[data-text-path]').forEach((el) => {
      el.addEventListener('change', () => {
        const path = el.getAttribute('data-text-path') || '';
        const value: any = el.value;
        if (path === 'resource_pack.skin') {
          const next = deepClone(this._config);
          next.resource_pack = next.resource_pack || {};
          next.resource_pack.skin = value;
          if (SKINS.includes(value)) {
            next.resource_pack.base_path = '__AUTO__';
          }
          this._config = next;
          fire(this, this._config);
          return;
        }
        this.setField(path, value);
      });
    });

    this.shadowRoot.querySelectorAll<HTMLInputElement>('input[type="checkbox"][data-path]').forEach((el) => {
      el.addEventListener('change', () => {
        this.setField(el.getAttribute('data-path') || '', el.checked);
      });
    });

    this.shadowRoot.querySelectorAll<HTMLElement>('[data-add-path]').forEach((btn) => {
      btn.addEventListener('click', () => this.addListItem(btn.getAttribute('data-add-path') || '', Number(btn.getAttribute('data-add-max')) || undefined));
    });
    this.shadowRoot.querySelectorAll<HTMLElement>('[data-del-path]').forEach((btn) => {
      btn.addEventListener('click', () => this.setListItem(btn.getAttribute('data-del-path') || '', Number(btn.getAttribute('data-del-index')), ''));
    });

    this.shadowRoot.querySelectorAll<HTMLElement>('[data-add-area-path]').forEach((btn) => {
      btn.addEventListener('click', () => this.addListItem(btn.getAttribute('data-add-area-path') || '', Number(btn.getAttribute('data-add-max')) || undefined));
    });
    this.shadowRoot.querySelectorAll<HTMLElement>('[data-del-area-path]').forEach((btn) => {
      btn.addEventListener('click', () => this.setListItem(btn.getAttribute('data-del-area-path') || '', Number(btn.getAttribute('data-del-area-index')), ''));
    });

    const uploadInput = this.shadowRoot.querySelector<HTMLInputElement>('input[data-bg-upload]');
    if (uploadInput) {
      uploadInput.addEventListener('change', async () => {
        const file = uploadInput.files?.[0];
        if (!file) return;
        const formData = new FormData();
        formData.append('file', file);
        try {
          const resp = await fetch('/api/image/upload', {
            method: 'POST',
            headers: { Authorization: `Bearer ${this._hass?.auth?.data?.access_token || ''}` },
            body: formData,
          });
          if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
          const item = await resp.json();
          if (item?.id) {
            this.setField('background_image', `/api/image/serve/${item.id}/original`);
            return;
          }
          throw new Error('No id in response');
        } catch {
          const reader = new FileReader();
          reader.onload = () => {
            const dataUrl = reader.result as string;
            if (dataUrl) this.setField('background_image', dataUrl);
          };
          reader.readAsDataURL(file);
        }
      });
    }

    const clearBtn = this.shadowRoot.querySelector<HTMLElement>('[data-bg-clear]');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => this.setField('background_image', ''));
    }

    const configureBtn = this.shadowRoot.querySelector<HTMLElement>('[data-nav-configure]');
    if (configureBtn) {
      configureBtn.addEventListener('click', () => {
        this._navDialogOpen = true;
        this.render();
      });
    }

    const storeBtn = this.shadowRoot.querySelector<HTMLElement>('[data-skin-store]');
    if (storeBtn) {
      storeBtn.addEventListener('click', async () => {
        this._skinStoreOpen = true;
        this._skinStoreLoading = true;
        this._skinStoreError = '';
        this.render();
        try {
          const merged = new Map<string, SkinStoreTheme>();
          const results = await Promise.all(STORE_SOURCES.map(async (source) => {
            const res = await fetch(`${source.base}/screenshots/registry.json`);
            if (!res.ok) throw new Error(`${source.label}: HTTP ${res.status}`);
            const data = await res.json() as Array<{ id: string; name?: string; thumbnail?: string; author?: string; package?: string }>;
            if (!Array.isArray(data)) return;
            for (const item of data) {
              if (!item?.id || !item.thumbnail) continue;
              merged.set(item.id, {
                id: item.id,
                name: item.name || item.id,
                thumbnail: item.thumbnail,
                author: item.author,
                package: item.package,
                source: source.key,
                sourceLabel: source.label,
                sourceBase: source.base,
                packageUrl: storeUrl(source.base, item.package),
              });
            }
          }).map(p => p.catch((err) => err)));
          const loadedAny = results.some((result) => !(result instanceof Error));
          if (!loadedAny) throw results.find((result) => result instanceof Error) || new Error('No store source loaded');
          this._skinStoreThemes = [...merged.values()].sort((a, b) => {
            if (a.source !== b.source) return a.source === 'custom' ? -1 : 1;
            return a.name.localeCompare(b.name);
          });
          this._skinStoreLoading = false;
        } catch (err) {
          this._skinStoreLoading = false;
          this._skinStoreError = String(err);
        }
        this.render();
      });
    }

    const storeOverlay = this.shadowRoot.querySelector<HTMLElement>('[data-store-overlay]');
    if (storeOverlay) {
      storeOverlay.addEventListener('click', (e) => {
        if (e.target === storeOverlay) {
          this._skinStoreOpen = false;
          this.render();
        }
      });
    }

    const storeCloseBtn = this.shadowRoot.querySelector<HTMLElement>('[data-store-close]');
    if (storeCloseBtn) {
      storeCloseBtn.addEventListener('click', () => {
        this._skinStoreOpen = false;
        this.render();
      });
    }

    this.shadowRoot.querySelectorAll<HTMLElement>('[data-store-remove]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const skin = btn.getAttribute('data-store-remove');
        if (!skin) return;
        try {
          await (this._hass as any)?.callService(
            'skins_pro', 'remove_skin', { skin_id: skin }
          );
        } catch {
          // integration not installed, still remove from config
        }
        const next = deepClone(this._config);
        const list: string[] = next.downloaded_skins || [];
        const idx = list.indexOf(skin);
        if (idx !== -1) list.splice(idx, 1);
        next.downloaded_skins = list;
        if (next.resource_pack?.skin === skin) {
          next.resource_pack.skin = 'modern';
          next.resource_pack.base_path = '__AUTO__';
        }
        this._config = next;
        fire(this, this._config);
        this.render();
      });
    });

    this.shadowRoot.querySelectorAll<HTMLElement>('[data-store-download]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const skin = btn.getAttribute('data-store-download');
        if (!skin) return;
        const packageUrl = btn.getAttribute('data-store-package-url') || '';
        const origText = btn.textContent || '';
        btn.textContent = 'Downloading...';
        (btn as HTMLButtonElement).disabled = true;
        try {
          try {
            await (this._hass as any).callService(
              'skins_pro', 'download_skin', packageUrl ? { skin_id: skin, package_url: packageUrl } : { skin_id: skin }
            );
          } catch (firstErr) {
            if (!packageUrl) throw firstErr;
            await (this._hass as any).callService(
              'skins_pro', 'download_skin', { skin_id: skin }
            );
          }
          const next = deepClone(this._config);
          next.resource_pack = next.resource_pack || {};
          next.resource_pack.skin = skin;
          next.resource_pack.base_path = `/local/skins-pro/${skin}/`;
          next.downloaded_skins = [...new Set([...(next.downloaded_skins || []), skin])];
          this._config = next;
          fire(this, this._config);
          this._skinStoreOpen = false;
          this.render();
          return;
        } catch (err: any) {
          alert(`Download failed: ${err?.message || 'Integration not found. Install skins-pro-hass and restart HA.'}`);
        }
        btn.textContent = origText;
        (btn as HTMLButtonElement).disabled = false;
      });
    });

    const overlay = this.shadowRoot.querySelector<HTMLElement>('[data-nav-overlay]');
    if (overlay) {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          this._navDialogOpen = false;
          this.render();
        }
      });
    }

    const cancelBtn = this.shadowRoot.querySelector<HTMLElement>('[data-nav-cancel]');
    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => {
        this._navDialogOpen = false;
        this.render();
      });
    }

    const saveBtn = this.shadowRoot.querySelector<HTMLElement>('[data-nav-save]');
    if (saveBtn) {
      saveBtn.addEventListener('click', () => {
        const checkboxes = this.shadowRoot?.querySelectorAll<HTMLInputElement>('[data-nav-key]');
        if (!checkboxes) return;
        const existingNav: NavItemConfig[] = this._config?.nav ?? [];
        const dialogNav: NavItemConfig[] = [];
        let allEnabled = true;
        checkboxes.forEach(cb => {
          const key = cb.getAttribute('data-nav-key') || '';
          const checked = cb.checked;
          if (!checked) allEnabled = false;
          const existingItem = existingNav.find(n => n.key === key);
          const defaultItem = DEFAULT_NAV.find(d => d.key === key);
          dialogNav.push({ key, icon: existingItem?.icon || defaultItem?.icon, enabled: checked });
        });
        const customNav = existingNav.filter(n => !DEFAULT_NAV.some(d => d.key === n.key));
        const mergedNav = [...dialogNav, ...customNav];
        this._navDialogOpen = false;
        if (allEnabled && customNav.length === 0) {
          this.setField('nav', undefined);
        } else {
          this.setField('nav', mergedNav);
        }
      });
    }
  }
}

if (!customElements.get('skins-pro-card-editor')) {
  customElements.define('skins-pro-card-editor', SkinsProCardEditor);
}
