import type { AreaRegistryEntry, HomeAssistant, TranslationKey } from './types';
import { assetHref, getTranslate, normalizeLanguage } from './utils';
import { type DashboardConfigRecord } from './editor/config';
import { renderEditorTemplate } from './editor/template';
import { bindEditorEvents, type EditorState } from './editor/events';

export class SkinsProCardEditor extends HTMLElement {
  private _state: EditorState = {
    config: { type: 'custom:skins-pro-card' },
    hass: undefined,
    language: 'en',
    navDialogOpen: false,
    skinStore: { open: false, loading: false, error: '', themes: [], searchQuery: '' },
  };
  private _areas: AreaRegistryEntry[] = [];
  private _areasLoaded = false;

  public constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  public setConfig(config: DashboardConfigRecord): void {
    const next = { type: 'custom:skins-pro-card', ...config };
    if (JSON.stringify(next) === JSON.stringify(this._state.config)) return;
    this._state.config = next;
    this.render();
  }

  public set hass(hass: HomeAssistant) {
    this._state.hass = hass;
    if (this.shadowRoot) {
      this.shadowRoot.querySelectorAll('ha-entity-picker').forEach((el: any) => {
        if (el) el.hass = hass;
      });
    }
    void this._loadAreas();
  }

  private async _loadAreas(): Promise<void> {
    if (this._areasLoaded || !this._state.hass) return;
    try {
      const conn = (this._state.hass as any).connection;
      if (!conn?.sendMessagePromise) return;
      const areas: AreaRegistryEntry[] = await conn.sendMessagePromise({ type: 'config/area_registry/list' });
      if (Array.isArray(areas)) {
        this._areas = areas;
        this._areasLoaded = true;
        this.render();
      }
    } catch { /* area registry not available */ }
  }

  private _currentLanguage(): ReturnType<typeof normalizeLanguage> {
    return normalizeLanguage(this._state.hass?.language);
  }

  private _translate(key: TranslationKey): string {
    return getTranslate(this._currentLanguage())(key);
  }

  private _themeCssUrl(): string {
    return assetHref(this._state.config as any, 'theme_css');
  }

  public render(): void {
    if (!this.shadowRoot) return;
    const language = this._currentLanguage();

    this.shadowRoot.innerHTML = renderEditorTemplate({
      config: this._state.config,
      areas: this._areas,
      areasLoaded: this._areasLoaded,
      language,
      translate: (key) => this._translate(key),
      themeCssUrl: this._themeCssUrl(),
      navDialogOpen: this._state.navDialogOpen,
      skinStore: this._state.skinStore,
    });

    bindEditorEvents({
      el: this,
      root: this.shadowRoot,
      state: this._state,
      onChange: (next) => { this._state = { ...this._state, ...next }; },
      reload: () => this.render(),
    });
  }
}

if (!customElements.get('skins-pro-card-editor')) {
  customElements.define('skins-pro-card-editor', SkinsProCardEditor);
}
