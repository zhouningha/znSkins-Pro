import { LitElement, html, nothing } from 'lit';
import { state } from 'lit/decorators.js';
import type { PropertyValues, TemplateResult } from 'lit';
import './skins-pro-card-editor';

import type {
  AreaRegistryEntry,
  DashboardConfig,
  DeviceRegistryEntry,
  EnergySourceData,
  EntityRegistryEntry,
  EnvironmentMetricConfig,
  FloorRegistryEntry,
  HomeAssistant,
  HassEntity,
  MaintenanceItem,
  RenderedDevice,
  RoomConfig,
  ViewName,
  WeatherForecastDay,
} from './types';
import type { TranslationKey } from './types';
import type { Language } from './i18n.generated';
import { STRINGS } from './i18n.generated';

import {
  DEFAULT_ROOMS,
  areaRoomImageKey,
} from './constants';

import {
  assetHref,
  assetKeyForDomain,
  assetUrl,
  cameraSnapshotUrl,
  dateText,
  deviceStateLabel,
  formatNumber,
  getTranslate,
  iconForDomain,
  localizedText,
  formatRelativeTime,
  isWallPanel1080p,
  normalizeLanguage,
  refreshAssetVersionFromServer,
  fetchCameraSnapshotUrl,
  isUsableDirectCameraSnapshot,
  selectedSkin,
  skinString,
  stateValue,
  timeText,
  weatherIcon,
} from './utils';

import { mergeConfig, normalizeDevicesHidden, resolveSecurityEntityIds, isSecurityDoorWindowSensor, isSecurityDoorRelayLock, securityDoorRelayStateLabel, securityDoorRelayIsOpen } from './config';

import { fetchEnergyHistory, fetchEnergySources } from './energy';

import { loadWeatherForecast, getWeatherDisplayText, getWeatherTemperature } from './weather';

import { loadAreas, loadDeviceRegistry, loadEntityRegistry, loadFloors } from './registry';

import { getMaintenanceItems } from './maintenance';

import { enableKiosk, isKioskLocked, setKioskLocked, toggleKiosk } from './kiosk';

const CONTROLLABLE_DOMAINS = new Set(['light', 'switch', 'fan', 'cover', 'valve', 'media_player', 'lock', 'climate', 'vacuum', 'humidifier', 'water_heater', 'siren', 'automation', 'group', 'input_boolean']);

export class MinecraftDashboardCard extends LitElement {
  private _config?: DashboardConfig;
  private _hass?: HomeAssistant;

  @state() private _view: ViewName = 'home';
  @state() private _deviceGrouping: 'area' | 'domain' = 'area';
  @state() private _filterRoom = '';
  @state() private _filterType = '';
  @state() private _hideUnassigned = true;
  @state() private _showHiddenDevices = false;
  @state() private _deviceHideEditMode = false;
  @state() private _deviceHideToast = '';

  @state() private _doorConfirm?: {
    entityId: string;
    name: string;
    message: string;
  };
  private _doorConfirmTimer?: number;

  @state() private _cameraSnapshots: Record<string, string> = {};
  private _cameraSnapshotBlobs = new Set<string>();
  private _cameraSnapshotLoads = new Set<string>();
  private _cameraSnapshotFailed = new Set<string>();
  private _cameraSnapshotRetried = new Set<string>();
  private _cameraSnapshotRefreshTimer?: ReturnType<typeof setInterval>;
  private _snapshotRefreshInterval = 5000;

  private _longPressEntity = '';
  private _longPressTimer?: number;
  private _longPressDone = false;
  private _devicesHiddenHaSyncTimer?: number;
  private _devicesHiddenHaSyncing = false;
  @state() private _selectedEnvironmentAreaId = '';

  @state() private _areas?: AreaRegistryEntry[];
  @state() private _entityRegistry?: EntityRegistryEntry[];
  @state() private _deviceRegistry?: DeviceRegistryEntry[];
  @state() private _floors?: FloorRegistryEntry[];
  @state() private _selectedFloor = '';

  private _areasLoaded = false;
  private _areasLoading = false;
  private _entityRegistryLoaded = false;
  private _entityRegistryLoading = false;
  private _deviceRegistryLoaded = false;
  private _deviceRegistryLoading = false;
  private _floorsLoaded = false;
  private _floorsLoading = false;

  @state() private _energyHistory?: number[];
  @state() private _energyYesterday?: string;
  private _energyHistoryDone = false;
  private _energyHistoryLoading = false;

  @state() private _energySources: EnergySourceData[] = [];
  private _energyPrefsDone = false;
  private _energyPrefsLoading = false;

  @state() private _weatherForecast?: WeatherForecastDay[];
  private _weatherForecastEntity?: string;
  private _weatherForecastUnsub?: () => Promise<void>;

  private _autoFullscreenDone = false;
  private _autoFullscreenAttempts = 0;
  private static readonly AUTO_FULLSCREEN_MAX = 40;
  private _preMuteVolume = 0.3;
  private readonly _handleWindowResize = () => this.applyLayoutHeight();

  public get hass(): HomeAssistant | undefined {
    return this._hass;
  }

  public set hass(value: HomeAssistant | undefined) {
    const old = this._hass;
    this._hass = value;
    this.requestUpdate('hass', old);
  }

  public connectedCallback(): void {
    super.connectedCallback();
    try {
      const savedView = window.sessionStorage.getItem('skins-pro.view');
      const valid: ViewName[] = ['home', 'devices', 'rooms', 'scenes', 'automations', 'security', 'energy'];
      if (savedView && valid.includes(savedView as ViewName)) {
        this._view = savedView as ViewName;
      }
    } catch {
      // ignore
    }
    window.addEventListener('resize', this._handleWindowResize);
    void refreshAssetVersionFromServer().then((changed) => {
      if (changed) this.requestUpdate();
    });
    if (this._hass && this._config?.weather?.entity && this._weatherForecastEntity !== this._config.weather.entity) {
      void this.loadWeatherForecast();
    }
    void this.refreshVisibleCameraSnapshots();
    this._syncCameraSnapshotRefreshTimer();
  }

  public disconnectedCallback(): void {
    super.disconnectedCallback();
    window.removeEventListener('resize', this._handleWindowResize);
    window.clearTimeout(this._devicesHiddenHaSyncTimer);
    this.dismissDoorConfirmDialog();
    this._stopCameraSnapshotRefreshTimer();
    this._revokeCameraSnapshots();
    void this.unsubscribeWeatherForecast();
  }

  public setConfig(config: DashboardConfig): void {
    if (!config || config.type !== 'custom:skins-pro-card') {
      throw new Error('Card type must be custom:skins-pro-card');
    }
    const merged = this.mergeDevicesHiddenFromSources(config);
    this._config = merged;
    this._energyHistory = undefined;
    this._energyYesterday = undefined;
    this._energyHistoryDone = false;
    this._energySources = [];
    this._energyPrefsDone = false;
    this._weatherForecast = undefined;
    this._weatherForecastEntity = undefined;
    this._autoFullscreenDone = false;
    this._autoFullscreenAttempts = 0;
    void this.unsubscribeWeatherForecast();
    this.requestUpdate();
  }

  protected willUpdate(changed: PropertyValues): void {
    if (!this._hass) return;

    if (changed.has('hass') || (this._view === 'energy' && !this._energySources.length)) {
      void this.fetchEnergyPrefs();
    }
    if (changed.has('hass') && this.usesSnapshotPreview(this._view === 'security' ? 'security' : 'home')) {
      this._clearStaleCameraSnapshotFailures();
    }
    if (changed.has('hass')) {
      const prev = changed.get('hass') as HomeAssistant | undefined;
      const prevUser = prev?.user?.name;
      const nextUser = this._hass.user?.name;
      if (prevUser !== nextUser) {
        this._autoFullscreenDone = false;
        this._autoFullscreenAttempts = 0;
      }
      void this.loadAreas();
      void this.loadEntityRegistry();
      void this.loadDeviceRegistry();
      void this.loadFloorsRegistry();
      void this.loadEnergyHistory();
      void this.refreshVisibleCameraSnapshots();
      this._syncCameraSnapshotRefreshTimer();
    }
    if (changed.has('hass') && this._config?.fullscreen) {
      this.tryAutoFullscreen();
    }
    const weatherEntity = this._config?.weather?.entity;
    if (weatherEntity && this._weatherForecastEntity !== weatherEntity) {
      void this.loadWeatherForecast();
    }
  }

  public getCardSize(): number {
    return 12;
  }

  public static async getConfigElement(): Promise<HTMLElement> {
    return document.createElement('skins-pro-card-editor');
  }

  public static getStubConfig(): Record<string, unknown> {
    return { type: 'custom:skins-pro-card' };
  }

  // ─── Registry loading ───────────────────────────────────

  private async loadAreas(): Promise<void> {
    if (!this._hass || this._areasLoaded || this._areasLoading) return;
    this._areasLoading = true;
    try {
      this._areas = await loadAreas(this._hass);
      this._areasLoaded = true;
    } catch {
      // retry next cycle
    } finally {
      this._areasLoading = false;
    }
  }

  private async loadEntityRegistry(): Promise<void> {
    if (!this._hass || this._entityRegistryLoaded || this._entityRegistryLoading) return;
    this._entityRegistryLoading = true;
    try {
      this._entityRegistry = await loadEntityRegistry(this._hass);
      this._entityRegistryLoaded = true;
    } catch {
    } finally {
      this._entityRegistryLoading = false;
    }
  }

  private async loadDeviceRegistry(): Promise<void> {
    if (!this._hass || this._deviceRegistryLoaded || this._deviceRegistryLoading) return;
    this._deviceRegistryLoading = true;
    try {
      this._deviceRegistry = await loadDeviceRegistry(this._hass);
      this._deviceRegistryLoaded = true;
    } catch {
    } finally {
      this._deviceRegistryLoading = false;
    }
  }

  private async loadFloorsRegistry(): Promise<void> {
    if (!this._hass || this._floorsLoaded || this._floorsLoading) return;
    this._floorsLoading = true;
    try {
      this._floors = await loadFloors(this._hass);
      this._floorsLoaded = true;
    } catch {
    } finally {
      this._floorsLoading = false;
    }
  }

  // ─── Energy ─────────────────────────────────────────────

  private async fetchEnergyPrefs(): Promise<void> {
    if (!this._hass || this._energyPrefsDone || this._energyPrefsLoading) return;
    this._energyPrefsLoading = true;
    try {
      const result = await fetchEnergySources(this._hass, this._config!);
      this._energySources = result.sources;
      this._energyHistory = result.history;
      this._energyYesterday = result.yesterday;
      this._energyPrefsDone = result.sources.length > 0;
    } catch {
    } finally {
      this._energyPrefsLoading = false;
    }
  }

  private async loadEnergyHistory(): Promise<void> {
    const entityId = this._config?.energy?.entity;
    if (!entityId || !this._hass || this._energyPrefsDone || this._energyHistoryDone || this._energyHistoryLoading) return;
    this._energyHistoryLoading = true;
    try {
      const result = await fetchEnergyHistory(this._hass, this._config!);
      this._energyHistory = result.history;
      this._energyYesterday = result.yesterday;
      this._energyHistoryDone = result.history.length > 0;
    } catch {
    } finally {
      this._energyHistoryLoading = false;
    }
  }

  // ─── Weather forecast ───────────────────────────────────

  private async loadWeatherForecast(): Promise<void> {
    const entityId = this._config?.weather?.entity;
    if (!entityId || !this._hass) return;
    if (this._weatherForecastEntity === entityId) return;

    await this.unsubscribeWeatherForecast();
    this._weatherForecastEntity = entityId;

    const result = await loadWeatherForecast(
      this._hass, entityId,
      (forecast) => {
        this._weatherForecast = forecast;
        this.requestUpdate();
      },
    );
    this._weatherForecastUnsub = result.unsub;
    if (result.initial) {
      this._weatherForecast = result.initial;
    }
  }

  private async unsubscribeWeatherForecast(): Promise<void> {
    if (this._weatherForecastUnsub) {
      try {
        await this._weatherForecastUnsub();
      } catch {
        // connection may already be closed
      } finally {
        this._weatherForecastUnsub = undefined;
      }
    }
  }

  // ─── Main render ────────────────────────────────────────

  protected render(): TemplateResult {
    if (!this._config) {
      return html``;
    }

    if (!this._hass) {
      return html`
      <link rel="stylesheet" href="${assetHref(this._config, 'theme_css')}">
        <ha-card><div class="loading-state">Loading...</div></ha-card>
      `;
    }

    const language = normalizeLanguage(
      this._config.language === 'auto' ? this._hass.language : this._config.language,
    );
    const translate = getTranslate(language);
    const weatherIconName = weatherIcon(stateValue(this._hass, this._config.weather?.entity, language));
    const quote = stateValue(this._hass, this._config.info?.entity, language) || translate('loadingQuote');
    const energyEntityId = this._config.energy?.entity || '';
    const energyValue = this._config.energy?.entity ? formatNumber(stateValue(this._hass, this._config.energy.entity, language), 1) : '--';
    const energyUnit = (this._hass?.states[energyEntityId]?.attributes?.unit_of_measurement as string | undefined) || this._config.energy?.unit || 'kWh';
    const compareValue = this._energyYesterday || '';
    const energyBars = this.renderBars(this._energyHistory || []);
    const registriesLoading = this.renderRegistryLoading(language);

    return html`
      <link rel="stylesheet" href="${assetHref(this._config, 'theme_css')}">
      <ha-card>
        ${registriesLoading}
        <div class="mc-app" data-view=${this._view}>
          <aside class="sidebar">
            <div class="profile" @click=${(e: Event) => this.onKioskCornerClick(e)}>
              ${this.renderUserAvatar('profile-img')}
              <div class="meta">
                <h2>${this._config.profile_name || this._hass?.user?.name || ''}</h2>
                <p class="muted">${this._config.profile_subtitle || localizedText(undefined, this._config.profile_subtitle_zh || skinString(selectedSkin(this._config), 'profile_subtitle_zh'), this._config.profile_subtitle_en || skinString(selectedSkin(this._config), 'profile_subtitle_en'), language)}</p>
              </div>
            </div>
            <nav class="menu">
              ${this.renderNav(language)}
            </nav>
                        <div class="sidebar-art" @click=${(e: Event) => this.onKioskCornerClick(e)}>${this.renderImage('decor', 'Decor', '')}</div>
          </aside>
          <main class="stage">
            ${this.renderStageContent(language, translate, weatherIconName, quote, energyValue, energyUnit, compareValue, energyBars)}
          </main>
          <nav class="mobile-nav">${this.renderNav(language)}</nav>
        </div>
        ${this.renderDoorConfirmDialog(language)}
      </ha-card>
    `;
  }

  private renderRegistryLoading(language: Language): TemplateResult | typeof nothing {
    if (!this._hass) return nothing;
    const allLoaded = this._areasLoaded && this._entityRegistryLoaded && this._deviceRegistryLoaded;
    if (allLoaded) return nothing;
    const label = language === 'zh-CN' ? '正在加载 Home Assistant 数据…' : 'Loading Home Assistant data…';
    return html`<div class="loading-state loading-registry">${label}</div>`;
  }

  private renderStageContent(
    language: Language,
    translate: (key: TranslationKey) => string,
    weatherIconName: string,
    quote: string,
    energyValue: string,
    energyUnit: string,
    compareValue: string,
    energyBars: TemplateResult,
  ): TemplateResult {
    if (this._view === 'devices') return this.renderDevicesPage(language, translate);
    if (this._view === 'rooms') return this.renderRoomsPage(language, translate);
    if (this._view === 'scenes') return this.renderScenesPage(language, translate);
    if (this._view === 'automations') return this.renderAutomationsPage(language, translate);
    if (this._view === 'security') return this.renderSecurityPage(language, translate);
    if (this._view === 'energy') return this.renderEnergyPage(language, translate, energyValue, energyUnit, compareValue, energyBars);

    const cameraEntityId = this._config?.camera?.entity || '';
    const cameraState = cameraEntityId ? this._hass?.states?.[cameraEntityId] : undefined;
    const hasCamera = Boolean(cameraState);

    const alarmEntityId = Object.keys(this._hass?.states || {}).find(e => e.startsWith('alarm_control_panel.')) || '';
    const alarmStateObj = alarmEntityId ? this._hass?.states?.[alarmEntityId] : undefined;
    const alarmState = alarmStateObj?.state || '';
    const alarmIconMap: Record<string, string> = {
      disarmed: 'mdi:shield-off', armed_home: 'mdi:shield-home', armed_away: 'mdi:shield-lock',
      armed_night: 'mdi:shield-moon', armed_vacation: 'mdi:shield-airplane', triggered: 'mdi:bell-ring',
      pending: 'mdi:shield-sync', arming: 'mdi:shield-sync',
    };
    const alarmIcon = alarmIconMap[alarmState] || 'mdi:shield-lock';

    const cameraCard = hasCamera ? (() => {
      const name = String(cameraState?.attributes?.friendly_name || cameraEntityId);
      return html`
        <section class="glass-card panel-camera">
          ${this.renderCameraTile(cameraEntityId, language, name)}
        </section>
      `;
    })() : nothing;

    return html`
      <div class="stage-grid">
        <div class="welcome-group">
          <section class="welcome" data-section="home">
            <h1>${this._config?.title || localizedText(undefined, this._config?.title_zh || skinString(selectedSkin(this._config), 'title_zh'), this._config?.title_en || skinString(selectedSkin(this._config), 'title_en'), language)}</h1>
            <p class="quote">${quote}</p>
          </section>
          <div class="weather-with-meta">
            ${this.renderWeather(weatherIconName)}
            ${hasCamera ? html`
            <div class="welcome-meta">
              <div style="display:flex;justify-content:space-between;align-items:center">
                <span class="time-main">${timeText(this._hass, language)}</span>
                <span class="time-sub" style="font-size:var(--sp-font-sm)">${dateText(this._hass, language)}</span>
              </div>
              <div class="env-list env-list-inline">${this.renderEnvironment(language)}</div>
            </div>` : ''}
          </div>
        </div>
        <section class="bottom-stack">
          <section class="bottom-block bottom-devices">
            <div class="section-title"><h2>${translate('devices')}</h2><p class="muted">${translate('quickControl')}</p></div>
            <div class="devices">${this.renderShortcutDevices(language)}</div>
          </section>
          <section class="bottom-block">
            <div class="section-title"><h2>${translate('rooms')}</h2><p class="muted">${translate('roomSnapshots')}</p></div>
            <div class="rooms">${this.renderRooms(language)}</div>
          </section>
        </section>
        <aside class="side">
          ${hasCamera ? cameraCard : html`
          <section class="time-card">
            <div style="display:flex;justify-content:space-between;align-items:center;width:100%">
              <div class="time-main">${timeText(this._hass, language)}</div>
              <div class="time-sub" style="font-size:var(--sp-font-sm)">${dateText(this._hass, language)}</div>
            </div>
            <div class="time-icon" @click=${alarmEntityId ? () => this.handleAction(alarmEntityId, 'more-info') : undefined} style=${alarmEntityId ? 'cursor:pointer' : ''}><ha-icon icon=${alarmIcon}></ha-icon></div>
          </section>
          <section class="glass-card">
            <div class="section-title"><h2>${translate('environment')}</h2></div>
            <div class="env-list">${this.renderEnvironment(language)}</div>
          </section>`}
          ${this._config?.energy?.entity && (!window.matchMedia('(orientation: portrait)').matches || energyValue !== '--') ? html`
          <section class="glass-card panel-energy">
            <div class="section-title"><h2>${translate('todayEnergy')}</h2></div>
            <div class="energy-value">${energyValue}<small> ${energyUnit}</small></div>
            <div class="bars">${energyBars}</div>
            <div class="energy-footer"><span class="muted">${localizedText(this._config?.energy?.compare_text, this._config?.energy?.compare_text_zh, this._config?.energy?.compare_text_en, language, translate('compareYesterday'))}</span><span class="down">${compareValue || '--'}</span></div>
          </section>` : ''}
          ${this.renderMediaPlayer(translate)}
          ${this.renderMaintenanceCard(language, translate)}
          <section class="glass-card panel-scenes" data-section="scenes">
            <div class="section-title"><h2>${translate('scenes')}</h2><p class="muted">${translate('modes')}</p></div>
            <div class="scene-grid">${this.renderHomeScenes(language, translate)}</div>
          </section>
        </aside>
      </div>
    `;
  }

  // ─── Layout / Theme ─────────────────────────────────────

  private applyLayoutHeight(): void {
    const host = this.shadowRoot?.host as HTMLElement | undefined;
    if (!host) return;

    try {
      const roomCard = this.shadowRoot?.querySelector('.bottom-stack .room') as HTMLElement | null;
      const height = roomCard?.getBoundingClientRect().height || 0;
      if (Number.isFinite(height) && height > 0) {
        host.style.setProperty('--sp-home-room-card-height', `${Math.round(height)}px`);
      }
    } catch {
      // Best-effort visual sync with the official room/product card height.
    }

    this.syncKioskFullscreenHostState(host);
    if (this.isKioskFullscreenActive()) {
      this.applyKioskViewportHeight(host);
      return;
    }

    if (this.applyWallPanel1080Layout(host)) return;

    if (window.matchMedia('(orientation: portrait)').matches) {
      host.style.setProperty('--sp-runtime-height', 'auto');
      host.style.setProperty('--sp-runtime-min-height', '100vh');
      host.removeAttribute('data-wall-panel');
      host.removeAttribute('data-kiosk-fullscreen');
      return;
    }

    const rect = this.getBoundingClientRect();
    const paddingBottom = 0;
    const isShortLandscape = window.matchMedia('(orientation: landscape)').matches && window.innerHeight < 500;
    const availableHeight = isShortLandscape
      ? Math.max(240, Math.floor(window.innerHeight - rect.top - paddingBottom))
      : Math.max(560, Math.floor(window.innerHeight - rect.top - paddingBottom));
    host.style.setProperty('--sp-runtime-height', `${availableHeight}px`);
    host.style.setProperty('--sp-runtime-min-height', `${availableHeight}px`);
    host.removeAttribute('data-wall-panel');
    host.removeAttribute('data-kiosk-fullscreen');
  }

  private viewportHeight(): number {
    const visualHeight = typeof window.visualViewport?.height === 'number' ? window.visualViewport.height : 0;
    return Math.floor(visualHeight || window.innerHeight || 0);
  }

  private kioskViewportHeight(): number {
    const viewportH = this.viewportHeight();
    const isShortLandscape = window.matchMedia('(orientation: landscape)').matches && viewportH < 500;
    return isShortLandscape ? Math.max(240, viewportH) : Math.max(560, viewportH);
  }

  private applyKioskViewportHeight(host: HTMLElement): void {
    const h = this.kioskViewportHeight();
    host.dataset.kioskFullscreen = 'true';
    host.style.setProperty('--sp-runtime-height', `${h}px`);
    host.style.setProperty('--sp-runtime-min-height', `${h}px`);
  }

  private syncKioskFullscreenHostState(host: HTMLElement): void {
    if (this.isKioskFullscreenActive()) {
      host.dataset.kioskFullscreen = 'true';
    } else {
      host.removeAttribute('data-kiosk-fullscreen');
    }
  }

  private renderInlineSwitch(checked: boolean, label: string, onToggle: () => void): TemplateResult {
    return html`
      <span
        class="switch ${checked ? 'on' : ''}"
        role="switch"
        aria-checked=${checked ? 'true' : 'false'}
        aria-label=${label}
        @click=${(e: Event) => {
          e.stopPropagation();
          onToggle();
        }}
      ></span>
    `;
  }

  /** Lock layout to 1920×1080 wall panel to avoid stretch/distortion in WebView kiosk. */
  private applyWallPanel1080Layout(host: HTMLElement): boolean {
    if (!isWallPanel1080p()) return false;

    const viewportH = Math.floor(window.innerHeight);
    const padding = 20;
    const contentH = Math.max(560, viewportH - padding * 2);

    host.dataset.wallPanel = '1080p';
    host.style.setProperty('--sp-app-padding', `${padding}px`);
    host.style.setProperty('--sp-sidebar-width', '210px');
    host.style.setProperty('--sp-stage-radius', '28px');
    host.style.setProperty('--sp-runtime-height', `${contentH}px`);
    host.style.setProperty('--sp-runtime-min-height', `${contentH}px`);
    return true;
  }

  private applyThemeVariables(): void {
    const host = this.shadowRoot?.host as HTMLElement | undefined;
    if (!host) return;

    const theme = this._config?.resource_pack?.theme;
    if (theme) {
      for (const [key, value] of Object.entries(theme)) {
        host.style.setProperty(key, value);
      }
    }
    const stageUrl = this._config?.background_image || assetUrl(this._config, 'stage');
    host.style.setProperty('--sp-stage-texture', `url("${stageUrl}")`);
    if (selectedSkin(this._config) !== 'visionOS') {
      host.style.setProperty('--sp-base-texture', `url("${assetUrl(this._config, 'base')}")`);
    }
  }

  // ─── Asset helpers (delegate to utils) ──────────────────

  /** Find the person entity linked to the current HA user and return its entity_picture. */
  private userAvatarUrl(): string {
    const userId = this._hass?.user?.id;
    if (!userId || !this._hass) return '';
    const person = Object.values(this._hass.states).find(
      (s) => s && s.entity_id.startsWith('person.') && (s.attributes as Record<string, unknown>).user_id === userId,
    );
    return (person?.attributes?.entity_picture as string | undefined) || '';
  }

  private renderUserAvatar(className: string): TemplateResult | typeof nothing {
    const url = this.userAvatarUrl() || assetUrl(this._config, 'avatar');
    if (!url) return nothing;
    return html`<img class=${className} alt="Avatar" src=${url}>`;
  }

  private renderImage(key: string, alt: string, className?: string): TemplateResult | typeof nothing {
    const url = assetUrl(this._config, key);
    if (!url) return nothing;
    return html`<img class=${className || nothing} alt=${alt} src=${url}>`;
  }

  // ─── Navigation ─────────────────────────────────────────

  private renderNav(language: Language): TemplateResult {
    return html`${(this._config?.nav || []).filter(item => item.enabled !== false).map((item, index) => {
      const label = localizedText(item.label, item.label_zh, item.label_en, language, STRINGS[language][(item.key as TranslationKey) || 'home'] || item.key || '');
      const target = item.target || item.key || 'home';
      const isActive = target === this._view || (index === 0 && this._view === 'home' && target === 'home');
      return html`
        <button class="nav-button${isActive ? ' active' : ''}" @click=${() => this.navigateTo(target)}>
          <ha-icon icon=${item.icon || 'mdi:circle'}></ha-icon><span>${label}</span>
        </button>
      `;
    })}`;
  }

  private renderPageShell(title: string, subtitle: string, controls: TemplateResult, body: TemplateResult): TemplateResult {
    return html`
      <div class="page-shell">
        <div class="page-header">
          <div>
            <h1>${title}</h1>
            <p class="quote">${subtitle}</p>
          </div>
          <div class="page-controls">${controls}</div>
        </div>
        <div class="page-body">${body}</div>
      </div>
    `;
  }

  // ─── Devices page ───────────────────────────────────────

  private renderDevicesPage(language: Language, translate: (key: TranslationKey) => string): TemplateResult {
    const rooms = this.getDeviceRooms();
    const types = this.getDeviceTypes();
    const showDeviceHideControls = !this.isKioskFullscreenActive();
    return this.renderPageShell(
      translate('devices'),
      translate('quickControl'),
      html`
        <div class="filter-bar">
          <button class="chip${this._deviceGrouping === 'area' ? ' active' : ''}" @click=${() => { this._deviceGrouping = 'area'; }}>${translate('byArea')}</button>
          <button class="chip${this._deviceGrouping === 'domain' ? ' active' : ''}" @click=${() => { this._deviceGrouping = 'domain'; }}>${translate('byType')}</button>
          <select class="filter-select" @change=${(e: Event) => { this._filterRoom = (e.target as HTMLSelectElement).value; }}>
            <option value="">${translate('allRooms')}</option>
            ${rooms.map((r) => html`<option value="${r}" .selected=${r === this._filterRoom}>${r}</option>`)}
          </select>
          <select class="filter-select" @change=${(e: Event) => { this._filterType = (e.target as HTMLSelectElement).value; }}>
            <option value="">${translate('allTypes')}</option>
            ${types.map((t) => html`<option value="${t}" .selected=${t === this._filterType}>${this._domainGroupLabel(t, language)}</option>`)}
          </select>
          <select class="filter-select" @change=${(e: Event) => { this._hideUnassigned = (e.target as HTMLSelectElement).value === 'true'; }}>
            <option value="true" .selected=${this._hideUnassigned}>${translate('hideUnassigned')}</option>
            <option value="false" .selected=${!this._hideUnassigned}>${translate('showAll')}</option>
          </select>
          ${showDeviceHideControls ? html`
            <button class="chip${this._showHiddenDevices ? ' active' : ''}" @click=${() => { this._showHiddenDevices = !this._showHiddenDevices; }}>${translate('showHiddenDevices')}${this.getHiddenDeviceIds().length > 0 ? html` (${this.getHiddenDeviceIds().length})` : nothing}</button>
            <button class="chip${this._deviceHideEditMode ? ' active' : ''}" @click=${() => { this._deviceHideEditMode = !this._deviceHideEditMode; }}>${language === 'zh-CN' ? '编辑隐藏' : 'Edit hidden'}</button>
            ${this._deviceHideEditMode ? html`<span class="muted device-hide-hint" style="font-size:12px;opacity:0.85;">${translate('hideDeviceHint')}</span>` : nothing}
          ` : nothing}
          <button class="action-btn" @click=${() => this.batchControl('on', translate)}>${translate('turnOnAll')}</button>
          <button class="action-btn" @click=${() => this.batchControl('off', translate)}>${translate('turnOffAll')}</button>
        </div>
      `,
      html`
        <div class="page-scroll themed-scrollbar">
          ${this._deviceHideToast ? html`<div class="device-hide-toast" style="position:sticky;top:0;z-index:3;padding:10px 12px;margin:0 0 10px;border-radius:12px;background:rgba(20,10,8,0.82);color:#fff;text-align:center;font-size:13px;">${this._deviceHideToast}</div>` : nothing}
          ${this.renderRealDeviceGroups(language, translate)}
        </div>
      `
    );
  }

  // ─── Rooms page ─────────────────────────────────────────

  private renderRoomsPage(language: Language, translate: (key: TranslationKey) => string): TemplateResult {
    const floors = this._floors || [];
    const showFloorTabs = floors.length > 1;
    const selectedFloorRooms = showFloorTabs && this._selectedFloor
      ? (this._areas || []).filter((a) => (a as AreaRegistryEntry & { floor_id?: string | null }).floor_id === this._selectedFloor)
      : this.roomsPageAreas();
    const roomsMarkup = this.renderAreaRooms(language, true, undefined, [], false, selectedFloorRooms);
    const roomCount = selectedFloorRooms.length || 0;
    const roomPageClass = roomCount > 8 ? 'rooms-page rooms-page-dense' : (roomCount > 4 ? 'rooms-page rooms-page-medium' : 'rooms-page');

    const floorTabs = showFloorTabs ? html`
      <div class="filter-bar floor-tabs">
        <button class="chip${this._selectedFloor === '' ? ' active' : ''}" @click=${() => { this._selectedFloor = ''; }}>${translate('allFloors')}</button>
        ${floors.map((f) => html`<button class="chip${this._selectedFloor === f.floor_id ? ' active' : ''}" @click=${() => { this._selectedFloor = f.floor_id; }}>${f.name}</button>`)}
      </div>
    ` : html``;

    return this.renderPageShell(
      translate('rooms'),
      translate('roomSnapshots'),
      floorTabs,
      html`
        <div class="rooms-page-wrap">
          ${roomsMarkup !== nothing
            ? html`<div class="rooms ${roomPageClass}">${roomsMarkup}</div>`
            : html`<div class="empty-state">${language === 'zh-CN' ? '没有读取到 Home Assistant 房间' : 'No Home Assistant areas found'}</div>`}
        </div>
      `
    );
  }

  private roomsPageAreas(): AreaRegistryEntry[] {
    const areas = this._areas || [];
    if ((this._floors || []).length === 0) return areas;
    return areas.filter((area) => Boolean((area as AreaRegistryEntry & { floor_id?: string | null }).floor_id));
  }

  // ─── Scenes page ────────────────────────────────────────

  private renderScenesPage(language: Language, translate: (key: TranslationKey) => string): TemplateResult {
    if (!this._hass) return html``;

    const scenes = Object.values(this._hass.states)
      .filter((entity): entity is HassEntity => Boolean(entity?.entity_id?.startsWith('scene.')));

    if (scenes.length === 0) {
      return this.renderPageShell(
        translate('scenes'),
        translate('modes'),
        html``,
        html`<div class="empty-state">${translate('noScenes')}</div>`
      );
    }

    const skin = selectedSkin(this._config);
    const items = scenes.map((scene, index) => {
      const name = String(scene.attributes?.friendly_name || scene.entity_id);
      const lastActivated = scene.state && scene.state !== 'unavailable' && scene.state !== 'unknown'
        ? formatRelativeTime(new Date(scene.state), language)
        : (language === 'zh-CN' ? '未激活' : 'Not activated');
      const assetKey = assetKeyForDomain(skin, 'scene');
      const tones: Array<'green' | 'blue' | 'purple' | 'yellow'> = ['green', 'blue', 'purple', 'yellow'];
      const statusClass = `device device-on-${tones[index % tones.length]}`;

      return html`
        <button class="${statusClass}" @click=${() => this.runScene(scene.entity_id)}>
          <div class="device-top">
            ${this.renderImage(assetKey, name, 'item-img')}
            <div class="tag-stack"><div class="status">${translate('scenes')}</div></div>
          </div>
          <div class="device-copy"><p class="device-name">${name}</p><p class="muted">${lastActivated}</p></div>
          <div class="control-row"><span class="state-word">${language === 'zh-CN' ? '执行' : 'Run'}</span></div>
        </button>
      `;
    });

    return this.renderPageShell(
      translate('scenes'),
      translate('modes'),
      html``,
      html`<div class="page-scroll themed-scrollbar"><div class="devices devices-page-grid automations-grid">${items}</div></div>`
    );
  }

  // ─── Automations page ──────────────────────────────────

  private renderAutomationsPage(language: Language, translate: (key: TranslationKey) => string): TemplateResult {
    const automations = this.renderRealAutomations(language);
    return this.renderPageShell(
      translate('automations'),
      language === 'zh-CN' ? 'Home Assistant 自动化' : 'Home Assistant automations',
      html``,
      automations !== nothing
        ? html`<div class="page-scroll themed-scrollbar"><div class="devices devices-page-grid automations-grid">${automations}</div></div>`
        : html`<div class="empty-state">${translate('noAutomations')}</div>`
    );
  }

  // ─── Energy page ────────────────────────────────────────

  private renderEnergyPage(language: Language, translate: (key: TranslationKey) => string, energyValue: string, _energyUnit: string, compareValue: string, _energyBars: TemplateResult): TemplateResult {
    const sources = this._energySources.length > 0 ? this._energySources : (
      energyValue !== '--' ? [{
        key: 'todayEnergy' as TranslationKey,
        entityId: this._config?.energy?.entity || '',
        icon: 'mdi:lightning-bolt',
        unit: this._config?.energy?.unit || 'kWh',
        history: this._energyHistory || [],
        yesterday: compareValue || undefined,
        today: energyValue,
      }] : []
    );

    return this.renderPageShell(
      translate('energy'),
      translate('todayEnergy'),
      html``,
      html`
        <div class="page-body single-column energy-detail-page">
          ${sources.map((src) => {
            const bars = this.renderBars(src.history);
            return html`
              <section class="glass-card panel-energy page-energy-card compact-energy-card">
                <div class="section-title"><h2><ha-icon icon="${src.icon}"></ha-icon> ${translate(src.key)}</h2></div>
                <div class="env-list compact-energy-list">
                  <div class="env-row"><div class="dot temp"><ha-icon icon="${src.icon}"></ha-icon></div><div class="muted">${translate(src.key)}</div><div class="env-value">${src.today} ${src.unit}</div></div>
                  <div class="env-row"><div class="dot hum"><ha-icon icon="mdi:compare-vertical"></ha-icon></div><div class="muted">${translate('compareYesterday')}</div><div class="env-value">${src.yesterday || '--'}</div></div>
                </div>
                <div class="bars compact-energy-bars">${bars}</div>
              </section>
            `;
          })}
          ${this.renderMaintenanceCard(language, translate)}
        </div>
      `
    );
  }

  // ─── Security page ──────────────────────────────────────

  private renderSecurityPage(language: Language, translate: (key: TranslationKey) => string): TemplateResult {
    const cards = this.renderSecurityCards(language);
    return this.renderPageShell(
      translate('security'),
      translate('securityOverview'),
      html``,
      cards !== nothing
        ? html`<div class="page-scroll themed-scrollbar security-page-body">${cards}</div>`
        : html`<div class="empty-state">${language === 'zh-CN' ? '请在编辑器「安全页」添加要显示的实体' : 'Add entities in the Security Page editor section'}</div>`
    );
  }

  // ─── Maintenance ────────────────────────────────────────

  private renderMediaPlayer(translate: (key: TranslationKey) => string): TemplateResult | typeof nothing {
    const entityId = this._config?.media_player?.entity;
    if (!entityId) return nothing;
    const stateObj = this._hass?.states?.[entityId];
    if (!stateObj) return nothing;
    const state = stateObj.state;
    const isOff = state === 'off' || state === 'unavailable';
    if (isOff) {
      const name = (stateObj.attributes?.friendly_name as string) || entityId;
      return html`
        <section class="glass-card panel-media">
          <div class="section-title"><h2>${translate('mediaPlayer')}</h2></div>
          <div class="media-off-state">
            <button class="media-volbtn" @click=${() => this._hass?.callService('media_player', 'turn_on', { entity_id: entityId })} title="Turn on"><ha-icon icon="mdi:power-standby"></ha-icon></button>
            <span>${name}</span>
          </div>
        </section>
      `;
    }
    const attrs = stateObj.attributes || {};
    const title = (attrs.media_title as string) || (attrs.friendly_name as string) || entityId;
    const artist = attrs.media_artist as string | undefined;
    const albumArt = attrs.entity_picture as string | undefined;
    const source = (attrs.app_name as string) || (attrs.source as string) || '';
    const isPlaying = state === 'playing';
    const vol = attrs.volume_level as number | undefined;
    const volZero = vol !== undefined && vol === 0;
    const volPct = vol !== undefined ? Math.round(vol * 100) : undefined;
    const handleVolTrack = (e: MouseEvent) => {
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      this._hass?.callService('media_player', 'volume_set', { entity_id: entityId, volume_level: pct });
    };
    const handleMute = () => {
      if (vol !== undefined) {
        if (vol > 0) {
          this._preMuteVolume = vol;
          this._hass?.callService('media_player', 'volume_set', { entity_id: entityId, volume_level: 0 });
        } else {
          this._hass?.callService('media_player', 'volume_set', { entity_id: entityId, volume_level: this._preMuteVolume });
        }
      }
    };
    return html`
      <section class="glass-card panel-media">
        <div class="section-title"><h2>${translate('mediaPlayer')}</h2></div>
        <div class="media-content">
          <div class="media-row">
            ${albumArt ? html`<div class="media-cover"><img alt="" src=${albumArt}></div>` : html`<div class="media-cover media-cover-null"><ha-icon icon="mdi:music"></ha-icon></div>`}
            <div class="media-body">
              <div class="media-title">${title}</div>
              ${artist ? html`<div class="media-artist">${artist}</div>` : ''}
              ${source ? html`<div class="media-source">${source}</div>` : ''}
            </div>
            <div class="media-actions">
              <button class="media-btn" @click=${() => this._hass?.callService('media_player', 'media_previous_track', { entity_id: entityId })} title="Previous"><ha-icon icon="mdi:skip-previous"></ha-icon></button>
              <button class="media-btn media-playbtn" @click=${() => this._hass?.callService('media_player', 'media_play_pause', { entity_id: entityId })} title=${isPlaying ? 'Pause' : 'Play'}><ha-icon icon=${isPlaying ? 'mdi:pause-circle' : 'mdi:play-circle'}></ha-icon></button>
              <button class="media-btn" @click=${() => this._hass?.callService('media_player', 'media_next_track', { entity_id: entityId })} title="Next"><ha-icon icon="mdi:skip-next"></ha-icon></button>
            </div>
          </div>
          ${volPct !== undefined ? html`
          <div class="media-row media-volrow">
            <button class="media-volbtn" @click=${handleMute}><ha-icon icon=${volZero ? 'mdi:volume-off' : 'mdi:volume-high'}></ha-icon></button>
            <div class="media-voltrack" @click=${handleVolTrack}><div class="media-volfill" style="width:${volPct}%"></div></div>
          </div>` : ''}
        </div>
      </section>
    `;
  }

  private renderMaintenanceCard(language: Language, translate: (key: TranslationKey) => string): TemplateResult | typeof nothing {
    const items = this.getMaintenanceItemsInternal(language);
    if (items.length === 0) return nothing;

    return html`
      <section class="glass-card maintenance-card">
        <div class="maintenance-block">
          <div class="section-title maintenance-title"><h2>${translate('maintenance')}</h2></div>
          <div class="maintenance-list">
            ${items.slice(0, 5).map((item) => html`
              <div class="maintenance-item">
                <span class="maintenance-dot ${item.level}"></span>
                <span class="maintenance-name">${item.name}</span>
                <span class="maintenance-value">${String(item.battery)}%</span>
              </div>
            `)}
          </div>
        </div>
      </section>
    `;
  }

  private getMaintenanceItemsInternal(_language: Language): MaintenanceItem[] {
    return getMaintenanceItems(this._hass);
  }

  // ─── Home: shortcut devices ─────────────────────────────

  private renderShortcutDevices(language: Language): TemplateResult[] {
    const limit = this._config?.home_limits?.devices || 5;
    const selectedEntities = this._config?.home_selection?.devices || [];

    let realDevices: RenderedDevice[];

    if (selectedEntities.length > 0) {
      const colors: RenderedDevice['color'][] = ['yellow', 'green', 'blue', 'purple', 'red', 'brown'];
      realDevices = [];
      for (const entityId of selectedEntities) {
        const stateObj = this._hass?.states[entityId];
        if (!stateObj) continue;
        const domain = entityId.split('.')[0] || '';
        realDevices.push({
          entityId,
          name: String(stateObj.attributes?.friendly_name || entityId),
          subtitle: '',
          detail: domain,
          state: stateObj.state,
          icon: String(stateObj.attributes?.icon || ''),
          color: colors[realDevices.length % colors.length]!,
        });
      }
    } else {
      const allRealDevices = this.getRealDevicesForRender();
      realDevices = allRealDevices.slice(0, limit);
    }

    const skin = selectedSkin(this._config);

    return realDevices.map((device) => {
      const stateLabel = deviceStateLabel(device.state, language);
      const active = ['on', 'playing', 'paused', 'cool', 'heat', 'armed', 'locked', 'open'].includes(device.state);
      const statusClass = active ? `device-on-${device.color}` : (device.state === 'unavailable' ? 'device-unavailable' : 'device-off');
      const assetKey = assetKeyForDomain(skin, device.entityId.split('.')[0] || 'sensor');
      const domain = device.entityId.split('.')[0] || '';
      const isMedia = domain === 'media_player';
      const action = isMedia ? 'play-pause' : (CONTROLLABLE_DOMAINS.has(domain) ? 'toggle' : 'more-info');
      const mediaState = isMedia ? this._hass?.states?.[device.entityId] : undefined;
      const albumArt = isMedia ? (mediaState?.attributes?.entity_picture as string | undefined) : undefined;
      const vol = isMedia ? (mediaState?.attributes?.volume_level as number | undefined) : undefined;
      const volPct = vol !== undefined ? Math.round(vol * 100) : undefined;
      const stateObj = this._hass?.states?.[device.entityId];
      let lastTime: string | undefined;
      if (domain === 'automation') {
        lastTime = stateObj?.attributes?.last_triggered
          ? formatRelativeTime(new Date(stateObj.attributes.last_triggered as string), language)
          : undefined;
      } else if (domain === 'scene') {
        lastTime = stateObj?.state && stateObj.state !== 'unavailable' && stateObj.state !== 'unknown'
          ? formatRelativeTime(new Date(stateObj.state), language)
          : undefined;
      } else if (stateObj) {
        lastTime = formatRelativeTime(new Date(stateObj.last_changed), language);
      }
      return html`
        <button class="device ${statusClass}" @click=${() => this.handleAction(device.entityId, action)}>
          <div class="device-top">
            ${albumArt ? html`<img class="item-img" src=${albumArt} alt="">` : this.renderImage(assetKey, device.name, 'item-img')}
            <div class="tag-stack"><div class="status">${stateLabel}</div></div>
          </div>
          <div class="device-copy"><p class="device-name">${device.name}</p><p class="muted">${lastTime || device.subtitle}</p></div>
          <div class="control-row"><span class="state-word">${device.detail}</span>${action === 'play-pause' ? html`
            ${volPct !== undefined ? html`<ha-control-slider .value=${volPct} min="0" max="100" style="--control-slider-thickness:32px;--control-slider-border-radius:var(--sp-radius-pill)" @value-changed=${(e: CustomEvent) => { e.stopPropagation(); this._hass?.callService('media_player', 'volume_set', { entity_id: device.entityId, volume_level: (e.detail.value ?? 0) / 100 }); }} @click=${(e: Event) => e.stopPropagation()} class="media-vol-slider"></ha-control-slider>` : ''}
            <ha-icon icon=${device.state === 'playing' ? 'mdi:pause' : 'mdi:play'} class="media-toggle-icon"></ha-icon>
          ` : (action === 'toggle' ? this.renderInlineSwitch(active, device.name, () => this.handleAction(device.entityId, action)) : '')}</div>
        </button>
      `;
    });
  }

  // ─── Weather ────────────────────────────────────────────

  private renderWeather(weatherIconName: string): TemplateResult {
    const entityId = this._config?.weather?.entity || '';
    const condition = getWeatherDisplayText(this._hass, entityId);
    const temp = getWeatherTemperature(this._hass, entityId);

    if (!entityId) return html``;

    const allForecast = this._weatherForecast || [];
    const forecast = allForecast.slice(0, 5);
    const today = allForecast[0];
    const locale = this._hass?.locale?.language || this._hass?.language || 'en';
    const weekdayFmt: Intl.DateTimeFormatOptions = { weekday: 'short' };

    const todayHigh = today?.temperature != null ? `${Math.round(Number(today.temperature))}°` : '';
    const todayLow = today?.templow != null ? `${Math.round(Number(today.templow))}°` : '';
    const todayPrecip = today?.precipitation != null ? `${Math.round(Number(today.precipitation))}mm` : '';

    return html`
      <div class="weather-block" @click=${() => this.moreInfo(entityId)}>
        <div class="weather-current">
          <div class="weather-state-icon"><ha-icon icon="${weatherIconName}"></ha-icon></div>
          <div class="weather-current-info">
            <div class="weather-current-temp">${temp || '--'}${todayHigh && todayLow ? html` <span class="weather-current-hl">${todayHigh}/${todayLow}</span>` : ''}</div>
            <div class="weather-current-cond">${condition}${todayPrecip ? html` · ${todayPrecip}` : ''}</div>
          </div>
        </div>
        ${forecast.length > 0 ? html`
          <div class="weather-forecast">
            ${forecast.map((day) => {
              const dt = day.datetime ? new Date(day.datetime) : null;
              const dayLabel = dt ? dt.toLocaleDateString(locale, weekdayFmt) : '';
              const high = day.temperature != null ? `${Math.round(Number(day.temperature))}°` : '--';
              const low = day.templow != null ? `${Math.round(Number(day.templow))}°` : '';
              return html`
                <div class="forecast-day">
                  <div class="forecast-weekday">${dayLabel}</div>
                  <div class="forecast-icon"><ha-icon icon="${weatherIcon(day.condition || '')}"></ha-icon></div>
                  <div class="forecast-temps"><span class="forecast-high">${high}</span><span class="forecast-low">${low}</span></div>
                </div>
              `;
            })}
          </div>
        ` : nothing}
      </div>
    `;
  }

  // ─── Home: scenes ──────────────────────────────────────

  private renderHomeScenes(language: Language, translate: (key: TranslationKey) => string): TemplateResult {
    const limit = this._config?.home_limits?.scenes || 6;
    const selectedScenes = this._config?.home_selection?.scenes || [];
    const scenes = this.renderRealScenes(language, limit, selectedScenes);
    if (scenes !== nothing) return scenes;
    return html`<div class="empty-state compact-empty">${translate('noScenes')}</div>`;
  }

  // ─── Home: rooms ────────────────────────────────────────

  private renderRooms(language: Language): TemplateResult | typeof nothing {
    const limit = this._config?.home_limits?.rooms || 4;
    const selectedRooms = this._config?.home_selection?.rooms || [];
    const areaRooms = this.renderAreaRooms(language, false, limit, selectedRooms);
    if (areaRooms !== nothing) return areaRooms;

    const rooms = this.getRoomsForRender();
    if (rooms.length === 0) return nothing;
    return html`${rooms.map((room) => {
      const imageKey = room.image || 'room_living';
      const info = room.info_entity ? stateValue(this._hass, room.info_entity, language) : '';
      const fallbackInfo = this._areas?.length ? this.areaFallbackInfo(room, language) : '--';
      const displayName = room.name || '--';
      return html`
        <button class="room" @click=${() => room.target ? this.navigatePath(room.target!) : undefined}>
          ${this.renderImage(imageKey, displayName, '')}
          <div class="room-label">
            <h3>${displayName}</h3>
            <p class="muted">${info || fallbackInfo || '--'}</p>
          </div>
        </button>
      `;
    })}`;
  }

  private getRoomsForRender(): RoomConfig[] {
    const configuredRooms = this._config?.rooms || [];
    const hasCustomRooms = configuredRooms.length > 0 && !this.isDefaultRooms(configuredRooms);
    if (hasCustomRooms) return configuredRooms;

    if (this._areas && this._areas.length > 0) {
      return this._areas.map((area, index) => ({
        name: area.name,
        image: areaRoomImageKey(area.area_id || area.name, index),
      }));
    }

    return configuredRooms;
  }

  private isDefaultRooms(rooms: RoomConfig[]): boolean {
    if (rooms.length !== DEFAULT_ROOMS.length) return false;
    return rooms.every((room, index) => {
      const fallback = DEFAULT_ROOMS[index];
      return fallback && room.image === fallback.image && room.info_entity === fallback.info_entity;
    });
  }

  private areaFallbackInfo(_room: RoomConfig, language: Language): string {
    const area = this._areas?.find((entry) => entry.name === (_room.name || _room.name_zh || _room.name_en));
    if (!area) return 'Home Assistant Area';
    return this.areaSummaryById(area.area_id, language);
  }

  // ─── Area rooms ─────────────────────────────────────────

  private renderAreaRooms(language: Language, requireRealAreas: boolean, limit?: number, selectedRooms: string[] = [], showSummary = true, areasPool?: AreaRegistryEntry[]): TemplateResult | typeof nothing {
    const allAreas = areasPool ?? this._areas;
    if (!allAreas || allAreas.length === 0) return nothing;

    const filteredAreas = selectedRooms.length > 0
      ? selectedRooms
        .map((item) => {
          if (item.includes('.')) {
            const entry = this._entityRegistry?.find((e) => e.entity_id === item);
            if (entry?.area_id) return allAreas?.find((a) => a.area_id === entry.area_id);
            return undefined;
          }
          return allAreas?.find((a) => a.area_id === item) || allAreas?.find((a) => a.name === item);
        })
        .filter((area): area is AreaRegistryEntry => Boolean(area))
      : allAreas;
    const rooms = filteredAreas.slice(0, limit || filteredAreas.length).map((area, index) => ({
      areaId: area.area_id,
      name: area.name,
      image: areaRoomImageKey(area.area_id || area.name, index),
      picture: area.picture,
      summary: this.areaSummaryById(area.area_id, language),
      occupied: this.isAreaOccupied(area.area_id),
      counts: this.areaCounts(area.area_id),
      activeCounts: this.areaActiveCounts(area.area_id, language),
      scenes: this.areaScenes(area.area_id, area.name),
    }));

    if (requireRealAreas && rooms.length === 0) return nothing;

    const useAreaPics = this._config?.use_area_pictures;

    return html`${rooms.map((room) => {
      const imgSrc = useAreaPics && room.picture ? room.picture : assetUrl(this._config, room.image || 'room_living');
      const roomImg = imgSrc ? html`<img alt=${room.name} src=${imgSrc}>` : nothing;

      const sceneChips = room.scenes.length > 0 ? html`
        <div class="room-scenes">
          ${room.scenes.map((scene) => html`
            <button class="room-scene-chip" @click=${(e: Event) => { e.stopPropagation(); this.runScene(scene.entity_id); }}>
              ${scene.name}
            </button>
          `)}
        </div>
      ` : nothing;

      const activeCountsRow = room.activeCounts.length > 0 ? html`
        <div class="room-active">
          ${room.activeCounts.map((g) => html`
            <button class="room-active-chip" @click=${(e: Event) => { e.stopPropagation(); this.turnOffAreaType(g.entityIds); }}>
              <span>${g.label} ${g.count}</span>
            </button>
          `)}
        </div>
      ` : nothing;

      const presenceBadge = room.occupied ? html`
        <div class="room-presence-badge">${language === 'zh-CN' ? '有人' : 'Occupied'}</div>
      ` : nothing;

      if (showSummary) {
        return html`
          <button class="room${room.occupied ? ' room-occupied' : ''}">
            ${roomImg}
            ${presenceBadge}
            ${sceneChips}
            <div class="room-label">
              <h3>${room.name}</h3>
              <p class="muted">${room.summary}</p>
            </div>
            ${activeCountsRow}
          </button>
        `;
      }
      const countLabel = language === 'zh-CN'
        ? `${room.counts.devices} 设备 · ${room.counts.entities} 实体`
        : `${room.counts.devices} devices · ${room.counts.entities} entities`;
      return html`
        <button class="room${room.occupied ? ' room-occupied' : ''}">
          ${roomImg}
          ${presenceBadge}
          ${sceneChips}
          <div class="room-label">
            <h3>${room.name}</h3>
            <p class="muted">${room.summary}</p>
            <p class="room-stats">${countLabel}</p>
          </div>
          ${activeCountsRow}
        </button>
      `;
    })}`;
  }

  // ─── Area helpers ───────────────────────────────────────

  private areaEntityIds(areaId: string): string[] {
    if (!areaId) return [];

    const areaDeviceIds = new Set(
      (this._deviceRegistry || [])
        .filter((d) => d.area_id === areaId && !d.disabled_by)
        .map((d) => d.id)
    );

    return (this._entityRegistry || [])
      .filter((entry) => {
        if (entry.hidden_by || entry.disabled_by) return false;
        return entry.area_id === areaId || (entry.device_id && areaDeviceIds.has(entry.device_id));
      })
      .map((e) => e.entity_id);
  }

  private areaPresenceEntityId(areaId: string): string | undefined {
    const entries = this.areaEntityIds(areaId);
    const byClass = (cls: string) =>
      entries.find((eid) => this._hass?.states[eid]?.attributes?.device_class === cls);
    return byClass('presence') || byClass('occupancy') || byClass('motion');
  }

  private isAreaOccupied(areaId: string): boolean {
    const entityId = this.areaPresenceEntityId(areaId);
    if (!entityId || !this._hass) return false;
    return this._hass.states[entityId]?.state === 'on';
  }

  private areaSummaryById(areaId: string, language: Language): string {
    if (!areaId) return 'Home Assistant Area';

    const entries = this.areaEntityIds(areaId);

    if (entries.length === 0) {
      return language === 'zh-CN' ? '暂无实体' : 'No entities';
    }

    const byClass = (cls: string) =>
      entries.find((eid) => this._hass?.states[eid]?.attributes?.device_class === cls);

    const parts: string[] = [];

    const presence = this.areaPresenceEntityId(areaId);
    if (presence) {
      const occupied = this._hass?.states[presence]?.state === 'on';
      parts.push(language === 'zh-CN' ? (occupied ? '有人' : '无人') : (occupied ? 'Occupied' : 'Empty'));
    }

    const temp = byClass('temperature');
    if (temp) {
      parts.push(`${formatNumber(stateValue(this._hass, temp, language), 1)}°C`);
    }

    const hum = byClass('humidity');
    if (hum) {
      parts.push(`${formatNumber(stateValue(this._hass, hum, language), 0)}%`);
    }

    if (!temp) {
      const illum = byClass('illuminance');
      if (illum) {
        parts.push(`${formatNumber(stateValue(this._hass, illum, language), 0)}lx`);
      }
    }

    if (parts.length > 0) return parts.join(' · ');
    return language === 'zh-CN' ? `${entries.length} 个实体` : `${entries.length} entities`;
  }

  private areaCounts(areaId: string): { devices: number; entities: number } {
    if (!areaId) return { devices: 0, entities: 0 };

    const areaDevices = (this._deviceRegistry || [])
      .filter((d) => d.area_id === areaId && !d.disabled_by);
    const deviceIds = new Set(areaDevices.map((d) => d.id));

    const areaEntities = (this._entityRegistry || [])
      .filter((e) => {
        if (e.hidden_by || e.disabled_by) return false;
        return e.area_id === areaId || (e.device_id && deviceIds.has(e.device_id));
      });

    return { devices: deviceIds.size, entities: areaEntities.length };
  }

  private readonly _domainGroupMap: Record<string, string> = {
    light: 'lights',
    switch: 'switches',
    input_boolean: 'switches',
    button: 'switches',
    input_button: 'switches',
    climate: 'climate',
    fan: 'climate',
    humidifier: 'climate',
    water_heater: 'climate',
    cover: 'covers',
    valve: 'covers',
    media_player: 'media',
    lock: 'security',
    alarm_control_panel: 'security',
    vacuum: 'others',
    lawn_mower: 'others',
  };

  private _domainGroupLabel(key: string, language: Language): string {
    if (language === 'zh-CN') {
      const zh: Record<string, string> = {
        lights: '灯光', switches: '开关', climate: '空调',
        covers: '窗帘', media: '音响', security: '安防', others: '其他',
      };
      return zh[key] || key;
    }
    const en: Record<string, string> = {
      lights: 'Lights', switches: 'Switches', climate: 'Climate',
      covers: 'Covers', media: 'Media', security: 'Security', others: 'Others',
    };
    return en[key] || key;
  }

  private areaActiveCounts(areaId: string, language: Language): Array<{ domain: string; label: string; count: number; entityIds: string[] }> {
    if (!areaId || !this._hass) return [];

    const areaDeviceIds = new Set(
      (this._deviceRegistry || [])
        .filter((d) => d.area_id === areaId && !d.disabled_by)
        .map((d) => d.id)
    );

    const entries = (this._entityRegistry || [])
      .filter((e) => {
        if (e.hidden_by || e.disabled_by) return false;
        return e.area_id === areaId || (e.device_id && areaDeviceIds.has(e.device_id));
      })
      .map((e) => e.entity_id);

    const readonlyDomains = new Set(['sensor', 'binary_sensor', 'remote', 'automation']);
    const active = entries.filter((eid) => {
      const state = this._hass?.states[eid]?.state;
      if (!state || state !== 'on') return false;
      const domain = eid.split('.')[0];
      return domain && !readonlyDomains.has(domain);
    });

    const byGroup = new Map<string, string[]>();
    for (const eid of active) {
      const domain = eid.split('.')[0] || 'other';
      const groupKey = this._domainGroupMap[domain] || 'others';
      const list = byGroup.get(groupKey) || [];
      list.push(eid);
      byGroup.set(groupKey, list);
    }

    return [...byGroup.entries()]
      .map(([groupKey, entityIds]) => ({
        domain: groupKey,
        label: this._domainGroupLabel(groupKey, language),
        count: entityIds.length,
        entityIds,
      }))
      .filter((g) => g.count > 0)
      .sort((a, b) => b.count - a.count);
  }

  private turnOffAreaType(entityIds: string[]): void {
    if (!this._hass || entityIds.length === 0) return;
    const byDomain = new Map<string, string[]>();
    for (const eid of entityIds) {
      const domain = eid.split('.')[0] || '';
      if (!domain) continue;
      const list = byDomain.get(domain) || [];
      list.push(eid);
      byDomain.set(domain, list);
    }
    for (const [domain, ids] of byDomain) {
      const service = domain === 'lock' ? 'lock' : 'turn_off';
      void this._hass.callService(domain, service, { entity_id: ids });
    }
  }

  private areaScenes(areaId: string, roomName?: string): Array<{ entity_id: string; name: string }> {
    if (!this._hass) return [];

    const found = new Set<string>();
    const result: Array<{ entity_id: string; name: string }> = [];

    if (areaId && this._entityRegistry && this._deviceRegistry) {
      const areaDeviceIds = new Set(
        this._deviceRegistry
          .filter((d) => d.area_id === areaId && !d.disabled_by)
          .map((d) => d.id)
      );

      for (const entry of this._entityRegistry) {
        if (entry.hidden_by || entry.disabled_by) continue;
        if (!entry.entity_id.startsWith('scene.')) continue;
        if (!(entry.area_id === areaId || (entry.device_id && areaDeviceIds.has(entry.device_id)))) continue;
        if (found.has(entry.entity_id)) continue;
        found.add(entry.entity_id);
        const state = this._hass.states[entry.entity_id];
        result.push({
          entity_id: entry.entity_id,
          name: String(state?.attributes?.friendly_name || entry.entity_id.split('.')[1] || entry.entity_id),
        });
        if (result.length >= 4) break;
      }
    }

    if (roomName && result.length < 4) {
      const roomLower = roomName.toLowerCase();

      for (const state of Object.values(this._hass.states)) {
        if (!state) continue;
        if (!state.entity_id.startsWith('scene.')) continue;
        if (found.has(state.entity_id)) continue;

        const sceneName = String(state.attributes?.friendly_name || state.entity_id.split('.')[1] || '');
        const sceneLower = sceneName.toLowerCase();
        const roomKey = roomLower.replace(/\s+/g, '_');

        if (sceneLower.includes(roomLower) || state.entity_id.toLowerCase().includes(roomKey)) {
          found.add(state.entity_id);
          result.push({ entity_id: state.entity_id, name: sceneName });
          if (result.length >= 4) break;
        }
      }
    }

    return result;
  }

  private areaNameForEntity(entityId: string): string {
    const entry = this._entityRegistry?.find((item) => item.entity_id === entityId);
    if (!entry) return '';
    const areaId = entry.area_id || this._deviceRegistry?.find((d) => d.id === entry.device_id)?.area_id || '';
    if (!areaId) return '';
    return this._areas?.find((area) => area.area_id === areaId)?.name || '';
  }

  // ─── Device list for render ─────────────────────────────

  private getHiddenDeviceIds(): string[] {
    return normalizeDevicesHidden(this._config?.devices_page);
  }

  private isDeviceHidden(entityId: string): boolean {
    return this.getHiddenDeviceIds().includes(entityId);
  }

  private showDeviceHideToast(message: string): void {
    this._deviceHideToast = message;
    window.setTimeout(() => {
      if (this._deviceHideToast === message) {
        this._deviceHideToast = '';
      }
    }, 1800);
  }

  private onDevicePointerDown(e: PointerEvent, entityId: string, language: Language): void {
    if (!this._deviceHideEditMode) return;
    if (this.isKioskFullscreenActive()) return;
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    e.preventDefault();
    this._longPressDone = false;
    this._longPressEntity = entityId;
    window.clearTimeout(this._longPressTimer);
    this._longPressTimer = window.setTimeout(() => {
      if (this._longPressEntity !== entityId) return;
      this._longPressDone = true;
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(20);
      }
      void this.toggleDeviceHidden(entityId, language);
    }, 650);
  }

  private onDevicePointerEnd(): void {
    window.clearTimeout(this._longPressTimer);
    this._longPressEntity = '';
  }

  private onDeviceClick(e: Event, entityId: string, action: string): void {
    if (this._longPressDone) {
      this._longPressDone = false;
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    this.handleAction(entityId, action);
  }

  private toggleDeviceHidden(entityId: string, language: Language): void {
    if (!this._deviceHideEditMode) return;
    if (this.isKioskFullscreenActive()) return;
    const hidden = new Set(this.getHiddenDeviceIds());
    const name = String(this._hass?.states?.[entityId]?.attributes?.friendly_name || entityId);
    const translate = getTranslate(language);

    if (hidden.has(entityId)) {
      hidden.delete(entityId);
      this.showDeviceHideToast(`${name} · ${translate('deviceRestored')}`);
    } else {
      hidden.add(entityId);
      this.showDeviceHideToast(`${name} · ${translate('deviceHiddenDone')}`);
    }

    this.persistDevicesHidden([...hidden]);
  }

  private getLovelaceUrlPath(): string {
    const parts = window.location.pathname.replace(/^\/+|\/+$/g, '').split('/');
    if (parts[0] === 'lovelace' && parts[1]) return parts[1];
    const skip = new Set(['config', 'developer-tools', 'history', 'logbook', 'media-browser', 'profile', 'hacs']);
    if (parts[0] && !skip.has(parts[0])) return parts[0];
    return 'lovelace';
  }

  private syncDevicesHiddenStorage(hidden: string[]): void {
    try {
      const userId = this._hass?.user?.id || 'default';
      window.localStorage.setItem(`skins-pro.devices.hidden.${userId}`, JSON.stringify(hidden));
      window.localStorage.setItem('skins-pro.devices.hidden', JSON.stringify(hidden));
    } catch {
      // ignore
    }
  }

  /** HA config is primary for cross-device; localStorage covers unsaved edits on this browser. */
  private mergeDevicesHiddenFromSources(config: DashboardConfig): DashboardConfig {
    const merged = mergeConfig(config);
    const haHidden = normalizeDevicesHidden(config.devices_page);
    let localHidden: string[] = [];
    try {
      const userId = this._hass?.user?.id || 'default';
      const stored =
        window.localStorage.getItem(`skins-pro.devices.hidden.${userId}`)
        || window.localStorage.getItem('skins-pro.devices.hidden');
      if (stored) {
        const parsed = JSON.parse(stored) as unknown;
        if (Array.isArray(parsed)) localHidden = parsed.filter(Boolean) as string[];
      }
    } catch {
      // ignore
    }
    const hidden = [...new Set([...haHidden, ...localHidden])];
    merged.devices_page = { ...merged.devices_page, hidden };
    if (hidden.length > 0) this.syncDevicesHiddenStorage(hidden);
    return merged;
  }

  private persistDevicesHidden(hidden: string[]): void {
    const normalized = [...new Set(hidden.filter(Boolean))];
    this._config = mergeConfig({
      ...this._config!,
      devices_page: { hidden: normalized },
    });
    this.syncDevicesHiddenStorage(normalized);
    this.scheduleDevicesHiddenHaSync(normalized);
    this.requestUpdate();
  }

  private scheduleDevicesHiddenHaSync(hidden: string[]): void {
    window.clearTimeout(this._devicesHiddenHaSyncTimer);
    this._devicesHiddenHaSyncTimer = window.setTimeout(() => {
      void this.flushDevicesHiddenHaSync(hidden);
    }, 2000);
  }

  private async flushDevicesHiddenHaSync(hidden: string[]): Promise<void> {
    if (this._devicesHiddenHaSyncing) {
      this.scheduleDevicesHiddenHaSync(hidden);
      return;
    }
    const conn = this._hass?.connection;
    if (!conn) return;

    const normalized = [...new Set(hidden.filter(Boolean))];
    const urlPath = this.getLovelaceUrlPath();

    try {
      window.sessionStorage.setItem('skins-pro.view', this._view);
    } catch {
      // ignore
    }

    this._devicesHiddenHaSyncing = true;
    try {
      const raw = await conn.sendMessagePromise<Record<string, unknown>>({
        type: 'lovelace/config',
        url_path: urlPath,
      });
      const strategy = ((raw.strategy || raw) as Record<string, unknown>) || {};
      const existingDevicesPage =
        typeof strategy.devices_page === 'object' && strategy.devices_page
          ? (strategy.devices_page as Record<string, unknown>)
          : {};
      const nextStrategy = {
        ...strategy,
        devices_page: {
          ...existingDevicesPage,
          hidden: normalized,
        },
      };
      await conn.sendMessagePromise({
        type: 'lovelace/config/save',
        url_path: urlPath,
        config: { strategy: nextStrategy },
      });
    } catch (err) {
      console.warn('[Skins Pro] sync devices.hidden to HA failed', err);
    } finally {
      this._devicesHiddenHaSyncing = false;
    }
  }

  private getRealDevicesForRender(ignoreFilter = false): RenderedDevice[] {
    if (!this._deviceRegistry || !this._entityRegistry || !this._hass) return [];

    const colors: RenderedDevice['color'][] = ['yellow', 'green', 'blue', 'purple', 'red', 'brown'];

    return this._deviceRegistry
      .filter((device) => !device.disabled_by)
      .map((device, index) => {
        const entities = this._entityRegistry
          ?.filter((entry) => entry.device_id === device.id && !entry.hidden_by && !entry.disabled_by)
          .map((entry) => entry.entity_id) || [];
        if (entities.length === 0) return undefined;

        const nonUpdateEntities = entities.filter((entityId) => !entityId.startsWith('update.') && !entityId.startsWith('device_tracker.'));
        if (nonUpdateEntities.length === 0) return undefined;
        const preferredEntity = nonUpdateEntities.find((entityId) => /^(light|switch|climate|media_player|lock|cover|fan|valve|input_boolean|humidifier|water_heater|vacuum)\./.test(entityId)) || nonUpdateEntities[0];
        if (!preferredEntity || !this._hass) return undefined;

        const stateObj = this._hass.states[preferredEntity];
        const state = stateObj?.state || 'unknown';
        const domain = preferredEntity.split('.')[0] || 'sensor';
        const icon = String(stateObj?.attributes?.icon || iconForDomain(domain));
        const name = String(stateObj?.attributes?.friendly_name || preferredEntity);
        const subtitle = this.areaNameForEntity(preferredEntity) || '';
        const detail = domain || '--';

        return {
          entityId: preferredEntity,
          name,
          subtitle,
          detail,
          state,
          icon,
          color: colors[index % colors.length]!,
        };
      })
      .filter((device): device is RenderedDevice => Boolean(device))
      .filter((d) => {
        if (ignoreFilter) return true;
        const hidden = this.isDeviceHidden(d.entityId);
        const showHiddenDevices = this._showHiddenDevices && !this.isKioskFullscreenActive();
        if (showHiddenDevices) return hidden;
        if (hidden) return false;
        if (this._filterRoom && d.subtitle !== this._filterRoom) return false;
        if (this._filterType && this._deviceTypeGroupKey(d.detail) !== this._filterType) return false;
        if (this._hideUnassigned && !d.subtitle) return false;
        return true;
      });
  }

  private getDeviceRooms(): string[] {
    return [...new Set(this.getRealDevicesForRender(true).map((d) => d.subtitle).filter(Boolean))].sort();
  }

  private getDeviceTypes(): string[] {
    return [...new Set(this.getRealDevicesForRender(true).map((d) => this._deviceTypeGroupKey(d.detail)))].sort();
  }

  private _deviceTypeLabel(detail: string, language: Language): string {
    const groupKey = this._domainGroupMap[detail] || 'others';
    return this._domainGroupLabel(groupKey, language);
  }

  private _deviceTypeGroupKey(detail: string): string {
    return this._domainGroupMap[detail] || 'others';
  }

  private renderRealDeviceGroups(language: Language, translate: (key: TranslationKey) => string): TemplateResult | typeof nothing {
    const devices = this.getRealDevicesForRender();
    if (devices.length === 0) {
      const showHiddenDevices = this._showHiddenDevices && !this.isKioskFullscreenActive();
      const emptyText = showHiddenDevices
        ? (language === 'zh-CN' ? '没有已隐藏的设备' : 'No hidden devices')
        : translate('noDevices');
      return html`<div class="empty-state">${emptyText}</div>`;
    }

    const groups = new Map<string, RenderedDevice[]>();
    for (const device of devices) {
      const groupKey = this._deviceGrouping === 'domain'
        ? this._deviceTypeGroupKey(device.detail)
        : (device.subtitle || (language === 'zh-CN' ? '\u5176\u4ED6' : 'Other'));
      const current = groups.get(groupKey) || [];
      current.push(device);
      groups.set(groupKey, current);
    }

    const skin = selectedSkin(this._config);

    return html`${Array.from(groups.entries()).map(([group, items]) => {
      const groupLabel = this._deviceGrouping === 'domain'
        ? items.length > 0 ? this._deviceTypeLabel(items[0].detail, language) : group
        : group;
      return html`
      <section class="device-group">
        <div class="section-title"><h2>${groupLabel}</h2><p class="muted">${String(items.length)}</p></div>
        <div class="devices devices-page-grid">
          ${items.map((device) => {
            const stateLabel = deviceStateLabel(device.state, language);
            const active = ['on', 'playing', 'paused', 'cool', 'heat', 'armed', 'locked', 'open'].includes(device.state);
            const statusClass = active ? `device-on-${device.color}` : (device.state === 'unavailable' ? 'device-unavailable' : 'device-off');
            const assetKey = assetKeyForDomain(skin, device.entityId.split('.')[0] || 'sensor');
            const isMedia = device.detail === 'media_player';
            const action = isMedia ? 'play-pause' : (CONTROLLABLE_DOMAINS.has(device.detail) ? 'toggle' : 'more-info');
            const mediaState = isMedia ? this._hass?.states?.[device.entityId] : undefined;
            const albumArt = isMedia ? (mediaState?.attributes?.entity_picture as string | undefined) : undefined;
            const vol = isMedia ? (mediaState?.attributes?.volume_level as number | undefined) : undefined;
            const volPct = vol !== undefined ? Math.round(vol * 100) : undefined;
            const stateObj = this._hass?.states?.[device.entityId];
            const domain = device.entityId.split('.')[0];
            let lastTime: string | undefined;
            if (domain === 'automation') {
              lastTime = stateObj?.attributes?.last_triggered
                ? formatRelativeTime(new Date(stateObj.attributes.last_triggered as string), language)
                : undefined;
            } else if (domain === 'scene') {
              lastTime = stateObj?.state && stateObj.state !== 'unavailable' && stateObj.state !== 'unknown'
                ? formatRelativeTime(new Date(stateObj.state), language)
                : undefined;
            } else if (stateObj) {
              lastTime = formatRelativeTime(new Date(stateObj.last_changed), language);
            }
            return html`
              <button
                class="device ${statusClass}${this.isDeviceHidden(device.entityId) ? ' device-hidden-item' : ''}"
                @pointerdown=${(e: PointerEvent) => this.onDevicePointerDown(e, device.entityId, language)}
                @pointerup=${() => this.onDevicePointerEnd()}
                @pointerleave=${() => this.onDevicePointerEnd()}
                @pointercancel=${() => this.onDevicePointerEnd()}
                @contextmenu=${(e: Event) => e.preventDefault()}
                @click=${(e: Event) => this.onDeviceClick(e, device.entityId, action)}
              >
                <div class="device-top">
                  ${albumArt ? html`<img class="item-img" src=${albumArt} alt="">` : this.renderImage(assetKey, device.name, 'item-img')}
                  <div class="tag-stack">
                    ${this.isDeviceHidden(device.entityId) ? html`<div class="status">${translate('deviceHidden')}</div>` : nothing}
                    <div class="status">${stateLabel}</div>
                  </div>
                </div>
                <div class="device-copy"><p class="device-name">${device.name}</p><p class="muted">${lastTime || device.subtitle}</p></div>
                <div class="control-row"><span class="state-word">${device.detail}</span>${action === 'play-pause' ? html`
                  ${volPct !== undefined ? html`<ha-control-slider .value=${volPct} min="0" max="100" style="--control-slider-thickness:32px;--control-slider-border-radius:var(--sp-radius-pill)" @value-changed=${(e: CustomEvent) => { e.stopPropagation(); this._hass?.callService('media_player', 'volume_set', { entity_id: device.entityId, volume_level: (e.detail.value ?? 0) / 100 }); }} @click=${(e: Event) => e.stopPropagation()} class="media-vol-slider"></ha-control-slider>` : ''}
                  <ha-icon icon=${device.state === 'playing' ? 'mdi:pause' : 'mdi:play'} class="media-toggle-icon"></ha-icon>
                ` : (action === 'toggle' ? this.renderInlineSwitch(active, device.name, () => this.handleAction(device.entityId, 'toggle')) : '')}</div>
              </button>
            `;
          })}
        </div>
      </section>
    `})}`;
  }

  // ─── Real scenes ────────────────────────────────────────

  private renderRealScenes(language: Language, limit = 12, selectedScenes: string[] = []): TemplateResult | typeof nothing {
    if (!this._hass) return nothing;

    const scenes = Object.values(this._hass.states)
      .filter((entity): entity is HassEntity => Boolean(entity?.entity_id?.startsWith('scene.')))
      .filter((entity) => selectedScenes.length === 0 || selectedScenes.includes(entity.entity_id))
      .slice(0, limit);

    if (scenes.length === 0) return nothing;

    return html`${scenes.map((scene, index) => {
      const tones: Array<'morning' | 'night' | 'movie' | 'game'> = ['morning', 'night', 'movie', 'game'];
      const name = String(scene.attributes?.friendly_name || scene.entity_id);
      const lastActivated = scene.state && scene.state !== 'unavailable' && scene.state !== 'unknown'
        ? formatRelativeTime(new Date(scene.state), language)
        : undefined;
      return html`
        <button class="scene ${tones[index % tones.length]}" @click=${() => this.runScene(scene.entity_id)}>
          <strong>${name}</strong>
          ${lastActivated ? html`<p class="muted">${lastActivated}</p>` : nothing}
        </button>
      `;
    })}`;
  }

  // ─── Real automations ──────────────────────────────────

  private renderRealAutomations(language: Language): TemplateResult | typeof nothing {
    if (!this._hass) return nothing;

    const automations = Object.values(this._hass.states)
      .filter((entity): entity is HassEntity => Boolean(entity?.entity_id?.startsWith('automation.')));

    if (automations.length === 0) return nothing;

    return html`${automations.map((automation, index) => {
      const stateLabel = deviceStateLabel(automation.state, language);
      const active = automation.state === 'on';
      const tones: Array<'green' | 'blue' | 'purple' | 'yellow'> = ['green', 'blue', 'purple', 'yellow'];
      const statusClass = active ? `device-on-${tones[index % tones.length]}` : 'device-off';
      const lastTriggered = automation.attributes?.last_triggered
        ? formatRelativeTime(new Date(automation.attributes.last_triggered as string), language)
        : (language === 'zh-CN' ? '未触发' : 'Not triggered');
      const skin = selectedSkin(this._config);
      const assetKey = assetKeyForDomain(skin, 'automation');

      return html`
        <button class="device ${statusClass}" @click=${() => this.handleAction(automation.entity_id, 'more-info')}>
          <div class="device-top">
            ${this.renderImage(assetKey, 'Automation', 'item-img')}
            <div class="tag-stack"><div class="status">${stateLabel}</div></div>
          </div>
          <div class="device-copy"><p class="device-name">${String(automation.attributes?.friendly_name || automation.entity_id)}</p><p class="muted">${lastTriggered}</p></div>
          <div class="control-row"><span class="state-word">${active ? (language === 'zh-CN' ? '已启用' : 'Enabled') : (language === 'zh-CN' ? '已停用' : 'Disabled')}</span>${this.renderInlineSwitch(active, String(automation.attributes?.friendly_name || automation.entity_id), () => this.handleAction(automation.entity_id, 'toggle'))}</div>
        </button>
      `;
    })}`;
  }

  // ─── Security ──────────────────────────────────────────

  private _revokeCameraSnapshots(): void {
    for (const url of this._cameraSnapshotBlobs) {
      URL.revokeObjectURL(url);
    }
    this._cameraSnapshotBlobs.clear();
    this._cameraSnapshots = {};
    this._cameraSnapshotLoads.clear();
    this._cameraSnapshotFailed.clear();
    this._cameraSnapshotRetried.clear();
  }

  private _clearStaleCameraSnapshotFailures(): void {
    if (!this._hass || this._cameraSnapshotFailed.size === 0) return;
    for (const entityId of [...this._cameraSnapshotFailed]) {
      if (this._hass.states?.[entityId]) {
        this._cameraSnapshotFailed.delete(entityId);
        this._cameraSnapshotRetried.delete(entityId);
      }
    }
  }
  private shouldUseDirectCameraSnapshot(url: string): boolean {
    return isUsableDirectCameraSnapshot(url);
  }
  private usesSnapshotPreview(_context: 'home' | 'security'): boolean {
    return false;
  }

  private _stopCameraSnapshotRefreshTimer(): void {
    if (this._cameraSnapshotRefreshTimer) {
      clearInterval(this._cameraSnapshotRefreshTimer);
      this._cameraSnapshotRefreshTimer = undefined;
    }
  }

  private _syncCameraSnapshotRefreshTimer(): void {
    const needsRefresh = (this._view === 'home' && this.usesSnapshotPreview('home'))
      || (this._view === 'security' && this.usesSnapshotPreview('security'));
    const interval = this._view === 'security' ? 1500 : 5000;
    if (!needsRefresh) {
      this._stopCameraSnapshotRefreshTimer();
      return;
    }
    if (this._cameraSnapshotRefreshTimer && this._snapshotRefreshInterval === interval) return;
    this._stopCameraSnapshotRefreshTimer();
    this._snapshotRefreshInterval = interval;
    this._cameraSnapshotRefreshTimer = setInterval(() => {
      void this.refreshVisibleCameraSnapshots();
    }, interval);
  }

  private preloadSnapshotUrl(url: string): Promise<boolean> {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = url;
    });
  }

  private renderCameraTile(entityId: string, language: Language, name?: string): TemplateResult {
    const label = name || String(this._hass?.states?.[entityId]?.attributes?.friendly_name || entityId);
    return html`
      <div class="camera-card">
        <div class="camera-preview">
          ${this.renderCameraPreview(entityId, language)}
          <span class="camera-label">${label}</span>
        </div>
      </div>
    `;
  }

  private renderCameraPreview(
    entityId: string,
    language: Language,
  ): TemplateResult {
    const stateObj = this._hass?.states?.[entityId];
    if (!stateObj || stateObj.state === 'unavailable') {
      return html`<div class="camera-loading">${language === 'zh-CN' ? '画面不可用' : 'Unavailable'}</div>`;
    }
    return html`
      <ha-camera-stream
        .hass=${this._hass}
        .stateObj=${stateObj}
        .aspectRatio=${16 / 9}
        .fitMode=${'cover'}
        .controls=${false}
        muted
        autoplay
        playsinline
      ></ha-camera-stream>
    `;
  }
  private async refreshVisibleCameraSnapshots(forceBlob = false): Promise<void> {
    if (!this._hass) return;

    const entityIds = new Set<string>();
    const homeCamera = this._config?.camera?.entity;
    if (homeCamera && (this._view === 'home' || !this._view)) {
      entityIds.add(homeCamera);
    }
    if (this._view === 'security') {
      for (const entity of this.getSecurityEntities()) {
        if (entity.entity_id.startsWith('camera.')) {
          entityIds.add(entity.entity_id);
        }
      }
    }
    if (entityIds.size === 0) return;

    let changed = false;
    await Promise.all([...entityIds].map(async (entityId) => {
      if (this._cameraSnapshotLoads.has(entityId)) return;
      const stateObj = this._hass?.states?.[entityId];
      const direct = cameraSnapshotUrl(entityId, stateObj);
      if (!forceBlob && this.shouldUseDirectCameraSnapshot(direct)) {
        const ready = await this.preloadSnapshotUrl(direct);
        if (ready) {
          if (this._cameraSnapshots[entityId] !== direct) {
            this._cameraSnapshots = { ...this._cameraSnapshots, [entityId]: direct };
            changed = true;
          }
          this._cameraSnapshotFailed.delete(entityId);
        } else if (this._view === 'security') {
          this._cameraSnapshotLoads.add(entityId);
          try {
            const blobUrl = await fetchCameraSnapshotUrl(this._hass, entityId, stateObj);
            if (blobUrl && await this.preloadSnapshotUrl(blobUrl)) {
              const prev = this._cameraSnapshots[entityId];
              if (prev && this._cameraSnapshotBlobs.has(prev)) {
                URL.revokeObjectURL(prev);
                this._cameraSnapshotBlobs.delete(prev);
              }
              if (blobUrl.startsWith('blob:')) {
                this._cameraSnapshotBlobs.add(blobUrl);
              }
              this._cameraSnapshots = { ...this._cameraSnapshots, [entityId]: blobUrl };
              this._cameraSnapshotFailed.delete(entityId);
              changed = true;
            }
          } finally {
            this._cameraSnapshotLoads.delete(entityId);
          }
        }
        return;
      }
      this._cameraSnapshotLoads.add(entityId);
      try {
        const blobUrl = await fetchCameraSnapshotUrl(this._hass, entityId, stateObj);
        if (!blobUrl || !await this.preloadSnapshotUrl(blobUrl)) {
          this._cameraSnapshotFailed.add(entityId);
          changed = true;
          return;
        }
        const prev = this._cameraSnapshots[entityId];
        if (prev && this._cameraSnapshotBlobs.has(prev)) {
          URL.revokeObjectURL(prev);
          this._cameraSnapshotBlobs.delete(prev);
        }
        if (blobUrl.startsWith('blob:')) {
          this._cameraSnapshotBlobs.add(blobUrl);
        }
        this._cameraSnapshots = { ...this._cameraSnapshots, [entityId]: blobUrl };
        this._cameraSnapshotFailed.delete(entityId);
        changed = true;
      } finally {
        this._cameraSnapshotLoads.delete(entityId);
      }
    }));

    if (changed) {
      this.requestUpdate();
    }
  }

  private getSecurityEntities(): HassEntity[] {
    if (!this._hass) return [];

    const entityIds = resolveSecurityEntityIds(this._hass, this._config?.security, this._entityRegistry)
      .filter((entityId) => !this.isSecurityEntityHidden(entityId));

    return entityIds
      .map((entityId) => this._hass?.states?.[entityId])
      .filter((entity): entity is HassEntity => Boolean(entity?.entity_id));
  }

  private securityContactStateLabel(state: string, language: Language): string {
    if (state === 'on') return language === 'zh-CN' ? '打开' : 'Open';
    if (state === 'off') return language === 'zh-CN' ? '关闭' : 'Closed';
    return deviceStateLabel(state, language);
  }

  private isSecurityEntityHidden(entityId: string): boolean {
    const entry = this._entityRegistry?.find((item) => item.entity_id === entityId);
    return Boolean(entry?.hidden_by || entry?.disabled_by);
  }

  private renderSecurityCards(language: Language): TemplateResult | typeof nothing {
    const entities = this.getSecurityEntities();

    if (entities.length === 0) return nothing;

    const cameras = entities.filter(e => e.entity_id.startsWith('camera.'));
    const locks = entities.filter(e => e.entity_id.startsWith('lock.') && !isSecurityDoorRelayLock(e.entity_id));
    const relayLocks = entities.filter(e => isSecurityDoorRelayLock(e.entity_id));
    const actionButtons = entities.filter(e => e.entity_id.startsWith('button.'));
    const doorWindowSensors = entities.filter((e) => isSecurityDoorWindowSensor(e.entity_id, e));

    const skin = selectedSkin(this._config);

    const openAlerts = doorWindowSensors
      .filter((e) => e.state === 'on')
      .map((e) => {
        const areaName = this.areaNameForEntity(e.entity_id);
        const name = String(e.attributes?.friendly_name || e.entity_id);
        return { label: areaName || name, name };
      });

    const presenceBar = openAlerts.length > 0 ? html`
      <div class="security-presence-bar">
        ${openAlerts.map((item) => html`
          <span class="security-presence-chip">
            <ha-icon icon="mdi:door-open"></ha-icon>
            ${item.label} · ${language === 'zh-CN' ? '打开' : 'Open'}
          </span>
        `)}
      </div>
    ` : nothing;

    const cameraCards = cameras.map(entity => this.renderCameraTile(entity.entity_id, language));

    const buttonCards = actionButtons.map((entity, index) => {
      const name = String(entity.attributes?.friendly_name || entity.entity_id);
      const actionLabel = language === 'zh-CN' ? '开门' : 'Open';
      const assetKey = assetKeyForDomain(skin, 'button');
      const tones: RenderedDevice['color'][] = ['yellow', 'green', 'blue', 'purple'];
      const statusClass = entity.state === 'unavailable' ? 'device-unavailable' : `device-on-${tones[index % tones.length]}`;
      return html`
        <button class="device security-door-btn ${statusClass}" @click=${() => this.pressButton(entity.entity_id)}>
          <div class="device-top">
            ${this.renderImage(assetKey, name, 'item-img')}
            <div class="tag-stack"><div class="status">${actionLabel}</div></div>
          </div>
          <div class="device-copy">
            <p class="device-name">${name}</p>
            <p class="muted">${this.areaNameForEntity(entity.entity_id) || (language === 'zh-CN' ? '门禁' : 'Access')}</p>
          </div>
          <div class="control-row">
            <span class="state-word">${actionLabel}</span>
            <ha-icon icon="mdi:door-open" class="security-open-icon"></ha-icon>
          </div>
        </button>
      `;
    });

    const relayLockCards = relayLocks.map((entity, index) => {
      const name = String(entity.attributes?.friendly_name || entity.entity_id);
      const stateLabel = securityDoorRelayStateLabel(entity.state, language);
      const isOpen = securityDoorRelayIsOpen(entity.state);
      const actionLabel = language === 'zh-CN' ? '开门' : 'Open';
      const assetKey = assetKeyForDomain(skin, 'lock');
      const tones: RenderedDevice['color'][] = ['yellow', 'green', 'blue', 'purple'];
      const statusClass = entity.state === 'unavailable' ? 'device-unavailable' : (isOpen ? `device-on-${tones[index % tones.length]}` : 'device-off');
      return html`
        <button class="device security-door-btn ${statusClass}" @click=${() => this.openDoorRelay(entity.entity_id, language, name)}>
          <div class="device-top">
            ${this.renderImage(assetKey, name, 'item-img')}
            <div class="tag-stack"><div class="status">${stateLabel}</div></div>
          </div>
          <div class="device-copy">
            <p class="device-name">${name}</p>
            <p class="muted">${this.areaNameForEntity(entity.entity_id) || (language === 'zh-CN' ? '门禁' : 'Access')}</p>
          </div>
          <div class="control-row">
            <span class="state-word">${actionLabel}</span>
            <ha-icon icon="mdi:door-open" class="security-open-icon"></ha-icon>
          </div>
        </button>
      `;
    });

    const lockCards = locks.map((entity, index) => {
      const stateLabel = deviceStateLabel(entity.state, language);
      const assetKey = assetKeyForDomain(skin, 'lock');
      const tones: RenderedDevice['color'][] = ['red', 'green', 'blue', 'purple', 'yellow', 'brown'];
      const active = ['locked', 'on'].includes(entity.state);
      const statusClass = entity.state === 'unavailable' ? 'device-unavailable' : (active ? `device-on-${tones[index % tones.length]}` : 'device-off');
      return html`
        <button class="device ${statusClass}" @click=${() => this.handleAction(entity.entity_id, 'more-info')}>
          <div class="device-top">
            ${this.renderImage(assetKey, String(entity.attributes?.friendly_name || entity.entity_id), 'item-img')}
            <div class="tag-stack"><div class="status">${stateLabel}</div></div>
          </div>
          <div class="device-copy"><p class="device-name">${String(entity.attributes?.friendly_name || entity.entity_id)}</p><p class="muted">${this.areaNameForEntity(entity.entity_id) || 'lock'}</p></div>
          <div class="control-row"><span class="state-word">${stateLabel}</span>${this.renderInlineSwitch(['on', 'armed_away', 'armed_home', 'locked'].includes(entity.state), String(entity.attributes?.friendly_name || entity.entity_id), () => this.handleAction(entity.entity_id, 'toggle'))}</div>
        </button>
      `;
    });

    const sensorCards = doorWindowSensors.map((entity, index) => {
      const stateLabel = this.securityContactStateLabel(entity.state, language);
      const assetKey = assetKeyForDomain(skin, 'binary_sensor');
      const tones: RenderedDevice['color'][] = ['yellow', 'red', 'purple', 'brown'];
      const open = entity.state === 'on';
      const statusClass = entity.state === 'unavailable' ? 'device-unavailable' : (open ? `device-on-${tones[index % tones.length]}` : 'device-off');
      return html`
        <button class="device ${statusClass}" @click=${() => this.handleAction(entity.entity_id, 'more-info')}>
          <div class="device-top">
            ${this.renderImage(assetKey, String(entity.attributes?.friendly_name || entity.entity_id), 'item-img')}
            <div class="tag-stack"><div class="status">${stateLabel}</div></div>
          </div>
          <div class="device-copy"><p class="device-name">${String(entity.attributes?.friendly_name || entity.entity_id)}</p><p class="muted">${this.areaNameForEntity(entity.entity_id) || 'binary_sensor'}</p></div>
          <div class="control-row"><span class="state-word">${stateLabel}</span>${open ? html`<ha-icon icon="mdi:door-open" class="security-open-icon"></ha-icon>` : html`<ha-icon icon="mdi:door-closed" class="security-closed-icon"></ha-icon>`}</div>
        </button>
      `;
    });

    const deviceGrid = (cameraCards.length > 0 || buttonCards.length > 0 || relayLockCards.length > 0 || lockCards.length > 0 || sensorCards.length > 0) ? html`
      ${cameraCards.length > 0 ? html`<div class="security-cameras">${cameraCards}</div>` : nothing}
      ${buttonCards.length > 0 || relayLockCards.length > 0 || lockCards.length > 0 || sensorCards.length > 0 ? html`
        <div class="security-devices">${buttonCards}${relayLockCards}${lockCards}${sensorCards}</div>
      ` : nothing}
    ` : nothing;

    if (!presenceBar && !deviceGrid) return nothing;

    return html`
      ${presenceBar}
      ${deviceGrid}
    `;
  }

  // ─── Environment ────────────────────────────────────────

  private renderEnvironment(_language: Language): TemplateResult[] {
    const selectedMetrics = this._config?.home_selection?.environment || [];
    const configuredMetrics = this._config?.environment || [];
    const metrics = (selectedMetrics.length > 0
      ? selectedMetrics.map((entityId) => {
        const configured = configuredMetrics.find((metric) => metric.entity === entityId);
        if (configured) return configured;

        const state = this._hass?.states[entityId];
        const deviceClass = String(state?.attributes?.device_class || '').toLowerCase();
        const label = String(state?.attributes?.friendly_name || entityId);
        const unit = String(state?.attributes?.unit_of_measurement || '');
        const variant: EnvironmentMetricConfig['variant'] = deviceClass === 'temperature' ? 'temp' : (deviceClass === 'humidity' ? 'hum' : 'pm');
        const icon = variant === 'temp' ? 'mdi:thermometer' : (variant === 'hum' ? 'mdi:water-percent' : 'mdi:leaf');
        return { entity: entityId, label, unit, variant, icon };
      })
      : configuredMetrics).slice(0, this._config?.home_limits?.environment || 5);

    if (metrics.length === 0) return [];

    const areaById = new Map((this._areas || []).map((area) => [area.area_id, area]));
    const deviceAreaById = new Map((this._deviceRegistry || []).map((device) => [device.id, device.area_id || '']));
    const metricAreaId = (entityId: string): string => {
      const entry = this._entityRegistry?.find((item) => item.entity_id === entityId);
      if (!entry || entry.hidden_by || entry.disabled_by) return '';
      return entry.area_id || (entry.device_id ? deviceAreaById.get(entry.device_id) || '' : '');
    };

    const grouped = new Map<string, EnvironmentMetricConfig[]>();
    for (const metric of metrics) {
      const areaId = metricAreaId(metric.entity) || '__other';
      const list = grouped.get(areaId) || [];
      list.push(metric);
      grouped.set(areaId, list);
    }

    const orderedAreaIds = [
      ...(this._areas || []).map((area) => area.area_id).filter((areaId) => grouped.has(areaId)),
      ...(grouped.has('__other') ? ['__other'] : []),
    ];
    const selectedAreaId = orderedAreaIds.includes(this._selectedEnvironmentAreaId)
      ? this._selectedEnvironmentAreaId
      : orderedAreaIds[0] || '__other';
    const currentAreaMetrics = grouped.get(selectedAreaId) || metrics;
    const selectedName = selectedAreaId === '__other'
      ? (_language === 'zh-CN' ? '其他' : 'Others')
      : (areaById.get(selectedAreaId)?.name || selectedAreaId);
    const cycleArea = () => {
      if (orderedAreaIds.length <= 1) return;
      const currentIndex = Math.max(0, orderedAreaIds.indexOf(selectedAreaId));
      this._selectedEnvironmentAreaId = orderedAreaIds[(currentIndex + 1) % orderedAreaIds.length] || '';
    };

    return [
      html`
        <div
          class="env-floor-header"
          role="button"
          tabindex="0"
          @click=${cycleArea}
          @keydown=${(event: KeyboardEvent) => {
            if (event.key !== 'Enter' && event.key !== ' ') return;
            event.preventDefault();
            cycleArea();
          }}
        >${selectedName}</div>
      `,
      ...currentAreaMetrics.map((metric) => html`
        <div class="env-row">
          <div class="dot ${metric.variant || 'temp'}"><ha-icon icon=${metric.icon || 'mdi:circle'}></ha-icon></div>
          <div class="muted">${this._hass?.states[metric.entity]?.attributes?.friendly_name || metric.label || metric.entity}</div>
          <div class="env-value">${stateValue(this._hass, metric.entity, _language) || '--'}${metric.unit || ''}</div>
        </div>
      `),
    ];
  }

  // ─── Energy bars ────────────────────────────────────────

  private renderBars(values: number[]): TemplateResult {
    if (!values.length) {
      return html`${Array.from({ length: 30 }, () => html`<span class="energy-bar energy-bar-level-0"></span>`)}`;
    }
    const max = Math.max(...values, 0.1);
    return html`${values.map((value) => {
      const level = value <= 0 ? 0 : Math.max(1, Math.min(10, Math.round((value / max) * 10)));
      return html`<span class="energy-bar energy-bar-level-${level}" title=${String(value)}></span>`;
    })}`;
  }

  // ─── Lifecycle actions ──────────────────────────────────

  protected updated(_changed?: PropertyValues): void {
    this.applyThemeVariables();
    this.applyLayoutHeight();
    this.tryAutoFullscreen();
  }

  private currentHaUsername(): string {
    const user = this._hass?.user;
    if (!user) return '';
    return String(user.name || (user as { local?: string }).local || '').trim();
  }

  private shouldBlockKioskToggle(): boolean {
    if (this.shouldAutoFullscreen()) return true;
    if (typeof window !== 'undefined' && window.__skinsProKioskLocked) return true;
    return false;
  }

  private isKioskFullscreenActive(): boolean {
    if (typeof document !== 'undefined' && document.body.classList.contains('skins-pro-kiosk')) return true;
    if (typeof window !== 'undefined' && window.__skinsProKioskLocked) return true;
    return isKioskLocked();
  }

  private shouldAutoFullscreen(): boolean {
    if (!this._config?.fullscreen) return false;
    const allowed = this._config.fullscreen_users;
    if (!allowed?.length) return false;
    const current = this.currentHaUsername();
    return !!current && allowed.includes(current);
  }

  private tryAutoFullscreen(): void {
    if (this._autoFullscreenDone || !this.shouldAutoFullscreen()) return;
    if (!this._hass?.user) return;
    if (this._autoFullscreenAttempts >= MinecraftDashboardCard.AUTO_FULLSCREEN_MAX) {
      this._autoFullscreenDone = true;
      return;
    }
    this._autoFullscreenAttempts += 1;

    const host = this.shadowRoot?.host as HTMLElement | undefined;
    if (host) {
      host.dataset.kioskFullscreen = 'true';
      if (this.applyWallPanel1080Layout(host)) {
        // locked to wall panel viewport
      } else {
        this.applyKioskViewportHeight(host);
      }
    }

    if (enableKiosk()) {
      setKioskLocked(true);
      if (typeof window !== 'undefined') window.__skinsProKioskLocked = true;
      this._autoFullscreenDone = true;
      return;
    }

    window.setTimeout(() => this.tryAutoFullscreen(), 500);
  }

  private handleAction(entityId: string, action: string): void {
    if (action === 'toggle') {
      void this.toggleEntity(entityId);
    } else if (action === 'play-pause') {
      void this._hass?.callService('media_player', 'media_play_pause', { entity_id: entityId });
    } else {
      this.moreInfo(entityId);
    }
  }

  private doorOpenConfirmMessage(name: string, language: Language): string {
    const template = STRINGS[language].confirmDoorOpenAgain || STRINGS['zh-CN'].confirmDoorOpenAgain;
    return template.replace('{name}', name);
  }

  private showDoorConfirmDialog(entityId: string, language: Language, name: string): void {
    this.dismissDoorConfirmDialog();
    this._doorConfirm = {
      entityId,
      name,
      message: this.doorOpenConfirmMessage(name, language),
    };
    this._doorConfirmTimer = window.setTimeout(() => this.dismissDoorConfirmDialog(), 5000);
  }

  private dismissDoorConfirmDialog(): void {
    if (this._doorConfirmTimer) {
      clearTimeout(this._doorConfirmTimer);
      this._doorConfirmTimer = undefined;
    }
    this._doorConfirm = undefined;
  }

  private async acceptDoorConfirm(): Promise<void> {
    const pending = this._doorConfirm;
    this.dismissDoorConfirmDialog();
    if (!pending || !this._hass) return;
    await this._hass.callService('lock', 'unlock', { entity_id: pending.entityId });
  }

  private renderDoorConfirmDialog(language: Language): TemplateResult | typeof nothing {
    if (!this._doorConfirm) return nothing;
    const strings = STRINGS[language];
    return html`
      <div class="door-confirm-overlay" @click=${() => this.dismissDoorConfirmDialog()}>
        <div class="door-confirm-dialog" role="dialog" aria-modal="true" @click=${(e: Event) => e.stopPropagation()}>
          <div class="door-confirm-progress" aria-hidden="true"></div>
          <div class="door-confirm-icon"><ha-icon icon="mdi:door-open"></ha-icon></div>
          <p class="door-confirm-title">${strings.confirmDoorOpenTitle}</p>
          <p class="door-confirm-message">${this._doorConfirm.message}</p>
          <div class="door-confirm-actions">
            <button type="button" class="door-confirm-btn cancel" @click=${() => this.dismissDoorConfirmDialog()}>
              ${strings.confirmDoorOpenCancel}
            </button>
            <button type="button" class="door-confirm-btn confirm" @click=${() => void this.acceptDoorConfirm()}>
              ${strings.confirmDoorOpenOk}
            </button>
          </div>
        </div>
      </div>
    `;
  }

  private openDoorRelay(entityId: string, language: Language, name: string): void {
    this.showDoorConfirmDialog(entityId, language, name);
  }

  private async pressButton(entityId: string): Promise<void> {
    await this._hass?.callService('button', 'press', { entity_id: entityId });
  }

  private navigateTo(target: string): void {
    const valid: ViewName[] = ['home', 'devices', 'rooms', 'scenes', 'automations', 'security', 'energy'];
    if (valid.includes(target as ViewName)) {
      this._view = target as ViewName;
      try {
        window.sessionStorage.setItem('skins-pro.view', target);
      } catch {
        // ignore
      }
      if (target === 'security' || target === 'home') {
        void this.refreshVisibleCameraSnapshots();
        this._syncCameraSnapshotRefreshTimer();
      }
      this.requestUpdate();
    }
  }

  private navigatePath(path: string): void {
    window.history.pushState(null, '', path);
    window.dispatchEvent(new Event('location-changed'));
  }

  private async runScene(entityId: string): Promise<void> {
    await this._hass?.callService('scene', 'turn_on', { entity_id: entityId });
  }

  private async toggleEntity(entityId: string): Promise<void> {
    if (!this._hass) return;
    const [domain] = entityId.split('.');
    if (!domain) return;
    await this._hass.callService(domain, 'toggle', { entity_id: entityId });
  }

  private onKioskCornerClick(e: Event): void {
    e.preventDefault();
    e.stopPropagation();
    if (this.shouldBlockKioskToggle()) return;
    this.toggleKioskFullscreen();
  }

  private toggleKioskFullscreen(): void {
    if (this.shouldBlockKioskToggle()) return;
    const host = this.shadowRoot?.host as HTMLElement | undefined;
    if (document.body.classList.contains('skins-pro-kiosk')) {
      toggleKiosk();
      if (host) {
        host.removeAttribute('data-kiosk-fullscreen');
        requestAnimationFrame(() => {
          const r = host.getBoundingClientRect();
          const h = Math.max(560, Math.floor(this.viewportHeight() - r.top));
          host.style.setProperty('--sp-runtime-height', `${h}px`);
          host.style.setProperty('--sp-runtime-min-height', `${h}px`);
        });
      }
    } else {
      if (host) this.applyKioskViewportHeight(host);
      toggleKiosk();
    }
  }

  private async batchControl(state: 'on' | 'off', translate: (key: TranslationKey) => string): Promise<void> {
    const devices = this.getRealDevicesForRender();
    const controllable = devices.filter((d) => CONTROLLABLE_DOMAINS.has(d.detail));
    if (controllable.length === 0) return;
    if (!confirm(translate('confirmAction'))) return;
    const service = state === 'on' ? 'turn_on' : 'turn_off';
    await Promise.all(controllable.map((d) => this._hass?.callService(d.detail, service, { entity_id: d.entityId })));
  }

  private moreInfo(entityId: string): void {
    this.dispatchEvent(new CustomEvent('hass-more-info', {
      bubbles: true,
      composed: true,
      detail: { entityId },
    }));
  }
}
