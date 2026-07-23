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
  FloorRegistryEntry,
  HomeAssistant,
  ViewName,
  WeatherForecastDay,
} from './types';
import type { TranslationKey } from './types';
import type { Language } from './i18n';

import {
  assetHref,
  formatNumber,
  getTranslate,
  normalizeLanguage,
  selectedSkin,
  setDarkAssetSkin,
  skinSupportsDark,
  stateValue,
  infoDisplayValue,
  weatherIcon,
  t,
  moreInfo,
  navigatePath,
  runScene,
  toggleEntity,
  turnOffAreaType as turnOffAreaTypeAction,
  loadSkinMetadata,
  BUNDLED_SKINS,
} from './utils';
import {
  normalizeHiddenIds,
  readSecurityHiddenLocal,
  resolveSecurityHiddenIds,
  saveSecurityHiddenToHa,
  toggleHiddenId,
  writeSecurityHiddenLocal,
} from './utils/security-hidden';
import {
  DEVICE_EDIT_IDLE_MS,
  addHiddenId,
  readDevicesHiddenLocal,
  removeHiddenId,
  resolveDevicesHiddenIds,
  saveDevicesHiddenToHa,
  writeDevicesHiddenLocal,
} from './utils/devices-hidden';

import { mergeConfig } from './config';
import { fetchEnergyHistory, fetchEnergySources, enrichEnergySourcesWithMeters, loadWeatherForecast, loadAreas, loadDeviceRegistry, loadEntityRegistry, loadFloors, ensureKiosk, isAndroidKiosk, isKioskActive, toggleKiosk } from './ha';

import { openLockDialog, closeLockDialog, isLockDialogOpen, DOORBELL_PREVIEW_STREAM } from './components/lock-dialog';
import type { RenderContext } from './render/context';
import { applyFullscreenHeight, applyKioskExitHeight, applyLayoutHeight, applyThemeVariables } from './render/layout';
import { getRealDevicesForRender } from './selectors/devices';
import { CONTROLLABLE_DOMAINS } from './components/device-card';
import { renderHomeView, renderSidebar, renderMobileNav } from './views/home';
import { renderDevicesView } from './views/devices';
import { renderRoomsView } from './views/rooms';
import { renderScenesView } from './views/scenes';
import { renderAutomationsView } from './views/automations';
import { renderEnergyView } from './views/energy';
import { renderSecurityView } from './views/security';
import { SHARED_CHROME_CSS } from './styles/shared-chrome';

/** HA package r20k_doorbell.yaml — reuse manual lock dialog on pending. */
const DOORBELL_ACTIVE_ENTITY = 'input_boolean.r20k_doorbell_active';
const DOORBELL_LOCK_ENTITY = 'lock.r20k_2c74_relaya';
const DOORBELL_OPEN_SCRIPT = 'script.r20k_open_door';
const DOORBELL_DISMISS_SCRIPT = 'script.r20k_doorbell_dismiss';
const DOORBELL_DIALOG_SEC = 15;

/** Fork LAYOUT LOCK (playlist/camera…) — AFTER skin theme.css so skins cannot invent alternate size/radius. */
const SHARED_CHROME_STYLE = html`<style id="sp-shared-chrome">${SHARED_CHROME_CSS}</style>`;

const KIOSK_HOME_SIDE_STYLE = html`
  <style>
    :host([data-sp-kiosk]) .mc-app[data-view="home"] .stage-grid {
      grid-template-columns: minmax(0, 1fr) clamp(240px, 23vw, 310px);
      grid-template-rows: auto minmax(0, 1fr) auto;
    }
    :host([data-sp-kiosk]) .mc-app[data-view="home"] .side {
      height: 100%;
      min-height: 0;
      overflow: hidden;
      display: grid;
      grid-template-rows: minmax(118px, 1.05fr) minmax(112px, 0.95fr) minmax(96px, 0.8fr) minmax(150px, 1.9fr);
      grid-auto-rows: 0;
      gap: var(--sp-space-sm);
      align-content: stretch;
    }
    :host([data-sp-kiosk]) .mc-app[data-view="home"] .side > .panel-camera,
    :host([data-sp-kiosk]) .mc-app[data-view="home"] .side > .panel-energy,
    :host([data-sp-kiosk]) .mc-app[data-view="home"] .side > .panel-media,
    :host([data-sp-kiosk]) .mc-app[data-view="home"] .side > .panel-scenes {
      height: 100%;
      min-height: 0;
      overflow: hidden;
      align-self: stretch;
    }
    :host([data-sp-kiosk]) .mc-app[data-view="home"] .side > .maintenance-card {
      display: none;
    }
    :host([data-sp-kiosk]) .mc-app[data-view="home"] .panel-camera {
      display: flex;
      flex-direction: column;
    }
    :host([data-sp-kiosk]) .mc-app[data-view="home"] .panel-camera .camera-preview {
      flex: 1;
      min-height: 0;
      max-height: none;
      aspect-ratio: auto;
    }
    :host([data-sp-kiosk]) .mc-app[data-view="home"] .panel-energy .energy-value {
      font-size: var(--sp-font-lg);
      margin-top: 0;
    }
    :host([data-sp-kiosk]) .mc-app[data-view="home"] .panel-energy .bars {
      flex: 1;
      min-height: 38px;
      height: auto;
      margin-top: var(--sp-space-xs);
    }
    :host([data-sp-kiosk]) .mc-app[data-view="home"] .panel-media .section-title,
    :host([data-sp-kiosk]) .mc-app[data-view="home"] .panel-scenes .section-title {
      margin-bottom: var(--sp-space-2xs);
    }
    :host([data-sp-kiosk]) .mc-app[data-view="home"] .panel-media .media-content {
      flex: 1;
      justify-content: center;
      min-height: 0;
      margin-top: 0;
    }
    :host([data-sp-kiosk]) .mc-app[data-view="home"] .panel-media .media-cover,
    :host([data-sp-kiosk]) .mc-app[data-view="home"] .panel-media .media-cover-null {
      width: 40px;
      height: 40px;
    }
    :host([data-sp-kiosk]) .mc-app[data-view="home"] .panel-media .media-playbtn ha-icon {
      --mdc-icon-size: 30px;
    }
    :host([data-sp-kiosk]) .mc-app[data-view="home"] .panel-scenes .scene-grid {
      flex: 1;
      min-height: 0;
      overflow: hidden;
      gap: var(--sp-space-xs);
      margin-top: var(--sp-space-xs);
    }
  </style>
`;

export class SkinsProCard extends LitElement {
  private _config?: DashboardConfig;
  private _hass?: HomeAssistant;

  @state() private _view: ViewName = 'home';
  @state() private _deviceGrouping: 'area' | 'domain' = 'area';
  @state() private _filterRoom = '';
  @state() private _focusDeviceRoom = '';
  @state() private _filterType = '';
  @state() private _hideUnassigned = true;

  @state() private _areas?: AreaRegistryEntry[];
  @state() private _entityRegistry?: EntityRegistryEntry[];
  @state() private _deviceRegistry?: DeviceRegistryEntry[];
  @state() private _floors?: FloorRegistryEntry[];
  @state() private _selectedFloor = '';
  @state() private _selectedEnvFloor = '';
  @state() private _devicePageIndex = 0;

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
  @state() private _energyMonthToDate?: string;
  @state() private _energyWeekToDate?: string;
  @state() private _energyTodayTotal?: string;
  private _energyPrefsDone = false;
  private _energyPrefsLoading = false;

  @state() private _weatherForecast?: WeatherForecastDay[];
  private _weatherForecastEntity?: string;
  private _weatherForecastUnsub?: () => Promise<void>;

  /** Security hide: edit mode + draft list (see utils/security-hidden.ts). */
  @state() private _securityHideEditMode = false;
  @state() private _securityHideSaving = false;
  /** Draft while editing; also caches last known list after Done. */
  private _securityHiddenDraft: string[] | null = null;

  /** Devices page hide: edit mode + draft (see utils/devices-hidden.ts). */
  @state() private _deviceHideEditMode = false;
  @state() private _deviceHideSaving = false;
  private _deviceHiddenDraft: string[] | null = null;
  private _deviceHideIdleTimer?: number;

  private _autoFullscreenDone = false;
  private _autoFullscreenAttempts = 0;
  private _loadedSkinMetadata?: string;
  /** Avoid reopening the same doorbell session after user closes / timeout. */
  private _doorbellDialogHandled = false;
  /** `input_datetime.r20k_last_doorbell` value for the session we already showed. */
  private _doorbellSessionKey = '';
  private _doorbellPollTimer?: number;
  private readonly _handleWindowResize = () => this._applyLayout();

  public get hass(): HomeAssistant | undefined {
    return this._hass;
  }

  public set hass(value: HomeAssistant | undefined) {
    const old = this._hass;
    this._hass = value;
    this._syncDoorbellDialog();
    this.requestUpdate('hass', old);
  }

  /** Doorbell → same lock dialog as manual「门禁开门」(not HA notification text). */
  private _syncDoorbellDialog(): void {
    if (!this._hass || !this._config) return;
    const active = this._hass.states?.[DOORBELL_ACTIVE_ENTITY]?.state === 'on';
    const lastDoorbell = String(this._hass.states?.['input_datetime.r20k_last_doorbell']?.state || '');
    const timerOn = this._hass.states?.['timer.r20k_doorbell_wait']?.state === 'active';
    const sessionKey = lastDoorbell || (active ? 'active' : '');

    if (!active) {
      this._doorbellDialogHandled = false;
      if (!timerOn) this._doorbellSessionKey = '';
      return;
    }

    // New doorbell event (timestamp changed) → force a fresh dialog even if
    // the previous session left `_doorbellDialogHandled` stuck true.
    if (sessionKey && sessionKey !== this._doorbellSessionKey) {
      this._doorbellSessionKey = sessionKey;
      this._doorbellDialogHandled = false;
      if (isLockDialogOpen()) closeLockDialog();
    }

    if (this._doorbellDialogHandled || isLockDialogOpen()) return;

    const language = normalizeLanguage(
      this._config.language === 'auto' ? this._hass.language : this._config.language,
    );
    const hass = this._hass;
    this._doorbellDialogHandled = true;
    console.info('[Skins Pro] doorbell dialog open', { sessionKey, timerOn });
    try {
      openLockDialog(this, hass, DOORBELL_LOCK_ENTITY, language, selectedSkin(this._config), {
        autoCloseSec: DOORBELL_DIALOG_SEC,
        title: t(language, 'doorbellTitle'),
        preventScrimClose: true,
        previewStream: DOORBELL_PREVIEW_STREAM,
        playSound: true,
        onUnlock: async () => {
          await hass.callService('script', 'turn_on', { entity_id: DOORBELL_OPEN_SCRIPT });
        },
        onCancel: async () => {
          await hass.callService('script', 'turn_on', { entity_id: DOORBELL_DISMISS_SCRIPT });
        },
        // Timeout: close UI only — HA still notifies phone after its own 15s timer.
        onTimeout: () => undefined,
      });
    } catch (error) {
      this._doorbellDialogHandled = false;
      console.warn('[Skins Pro] doorbell lock dialog failed', error);
    }
  }

  public connectedCallback(): void {
    super.connectedCallback();
    window.addEventListener('resize', this._handleWindowResize);
    if (this._hass && this._config?.weather?.entity && this._weatherForecastEntity !== this._config.weather.entity) {
      void this.loadWeatherForecast();
    }
    this._syncDoorbellDialog();
    if (this._doorbellPollTimer) window.clearInterval(this._doorbellPollTimer);
    this._doorbellPollTimer = window.setInterval(() => this._syncDoorbellDialog(), 1500);
  }

  public disconnectedCallback(): void {
    super.disconnectedCallback();
    window.removeEventListener('resize', this._handleWindowResize);
    this.clearDeviceHideIdle();
    void this.unsubscribeWeatherForecast();
    if (this._doorbellPollTimer) {
      window.clearInterval(this._doorbellPollTimer);
      this._doorbellPollTimer = undefined;
    }
  }

  public setConfig(config: DashboardConfig): void {
    if (!config || config.type !== 'custom:skins-pro-card') {
      throw new Error('Card type must be custom:skins-pro-card');
    }
    this._config = this.mergeHiddenFromSources(config);
    this._energyHistory = undefined;
    this._energyYesterday = undefined;
    this._energyMonthToDate = undefined;
    this._energyWeekToDate = undefined;
    this._energyTodayTotal = undefined;
    this._energyHistoryDone = false;
    this._energySources = [];
    this._energyPrefsDone = false;
    this._weatherForecast = undefined;
    this._weatherForecastEntity = undefined;
    this._autoFullscreenDone = false;
    this._autoFullscreenAttempts = 0;
    this._loadedSkinMetadata = undefined;
    void this.unsubscribeWeatherForecast();
    this._syncDoorbellDialog();
    this.requestUpdate();
  }

  protected willUpdate(changed: PropertyValues): void {
    if (!this._hass) return;

    if (changed.has('hass') || (this._view === 'energy' && !this._energySources.length)) {
      void this.fetchEnergyPrefs();
    }
    if (changed.has('hass')) {
      void this.loadAreas();
      void this.loadEntityRegistry();
      void this.loadDeviceRegistry();
      void this.loadFloorsRegistry();
      void this.loadEnergyHistory();
      this._syncDoorbellDialog();
    }
    const weatherEntity = this._config?.weather?.entity;
    if (weatherEntity && this._weatherForecastEntity !== weatherEntity) {
      void this.loadWeatherForecast();
    }

    const skin = this._config ? selectedSkin(this._config) : undefined;
    if (skin && skin !== this._loadedSkinMetadata) {
      this._loadedSkinMetadata = skin;
      if (!BUNDLED_SKINS.includes(skin)) {
        void loadSkinMetadata(skin).then((changed) => {
          if (changed) this.requestUpdate();
        });
      }
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

  private _areasPromise?: Promise<void>;
  private _entityRegistryPromise?: Promise<void>;
  private _deviceRegistryPromise?: Promise<void>;
  private _floorsPromise?: Promise<void>;

  private async loadAreas(): Promise<void> {
    if (!this._hass || this._areasLoaded) return;
    if (this._areasPromise) return this._areasPromise;
    this._areasLoading = true;
    this._areasPromise = (async () => {
      try {
        this._areas = await loadAreas(this._hass!);
        this._areasLoaded = true;
      } catch {
      } finally {
        this._areasLoading = false;
      }
    })();
    return this._areasPromise;
  }

  private async loadEntityRegistry(): Promise<void> {
    if (!this._hass || this._entityRegistryLoaded) return;
    if (this._entityRegistryPromise) return this._entityRegistryPromise;
    this._entityRegistryLoading = true;
    this._entityRegistryPromise = (async () => {
      try {
        this._entityRegistry = await loadEntityRegistry(this._hass!);
        this._entityRegistryLoaded = true;
      } catch {
      } finally {
        this._entityRegistryLoading = false;
      }
    })();
    return this._entityRegistryPromise;
  }

  private async loadDeviceRegistry(): Promise<void> {
    if (!this._hass || this._deviceRegistryLoaded) return;
    if (this._deviceRegistryPromise) return this._deviceRegistryPromise;
    this._deviceRegistryLoading = true;
    this._deviceRegistryPromise = (async () => {
      try {
        this._deviceRegistry = await loadDeviceRegistry(this._hass!);
        this._deviceRegistryLoaded = true;
      } catch {
      } finally {
        this._deviceRegistryLoading = false;
      }
    })();
    return this._deviceRegistryPromise;
  }

  private async loadFloorsRegistry(): Promise<void> {
    if (!this._hass || this._floorsLoaded) return;
    if (this._floorsPromise) return this._floorsPromise;
    this._floorsLoading = true;
    this._floorsPromise = (async () => {
      try {
        this._floors = await loadFloors(this._hass!);
        this._floorsLoaded = true;
      } catch {
      } finally {
        this._floorsLoading = false;
      }
    })();
    return this._floorsPromise;
  }

  // ─── Energy ─────────────────────────────────────────────

  private async fetchEnergyPrefs(): Promise<void> {
    if (!this._hass || this._energyPrefsDone || this._energyPrefsLoading) return;
    this._energyPrefsLoading = true;
    try {
      await Promise.all([
        this.loadAreas(),
        this.loadEntityRegistry(),
        this.loadDeviceRegistry(),
        this.loadFloorsRegistry(),
      ]);
      const result = await fetchEnergySources(this._hass, this._config!, {
        areas: this._areas,
        floors: this._floors,
        entityRegistry: this._entityRegistry,
        deviceRegistry: this._deviceRegistry,
      });
      this._energySources = result.sources;
      this._energyHistory = result.history;
      this._energyYesterday = result.yesterday;
      this._energyMonthToDate = result.monthToDate;
      this._energyWeekToDate = result.weekToDate;
      this._energyTodayTotal = result.todayTotal;
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

  /** Today / yesterday from daily statistics change (midnight-based), never raw cumulative totals. */
  private getConfiguredEnergyDisplay(): {
    today: string;
    yesterday: string;
    history: number[] | undefined;
  } {
    const entityId = this._config?.energy?.entity;
    if (!entityId) {
      return { today: '--', yesterday: '', history: undefined };
    }

    const fromPrefs = this._energySources.find((source) => source.entityId === entityId);
    if (fromPrefs) {
      return {
        today: fromPrefs.today && fromPrefs.today !== '--' ? fromPrefs.today : '--',
        yesterday: fromPrefs.yesterday || '',
        history: fromPrefs.history,
      };
    }

    if (this._energyHistory?.length) {
      const latest = this._energyHistory[this._energyHistory.length - 1]!;
      return {
        today: formatNumber(String(latest), 1),
        yesterday: this._energyYesterday || '',
        history: this._energyHistory,
      };
    }

    return { today: '--', yesterday: '', history: undefined };
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
      } finally {
        this._weatherForecastUnsub = undefined;
      }
    }
  }

  // ─── Layout ─────────────────────────────────────────────

  private _host(): HTMLElement | null | undefined {
    return this.shadowRoot?.host as HTMLElement | undefined;
  }

  private _applyLayout(): void {
    applyLayoutHeight(this._host());
  }

  // ─── Render context ─────────────────────────────────────

  private _buildContext(
    language: Language,
    translate: (key: TranslationKey) => string,
    energyHistoryOverride?: number[],
  ): RenderContext {
    const hass = this._hass!;
    const resolvedTheme = this._resolveTheme();
    setDarkAssetSkin(resolvedTheme === 'dark' ? selectedSkin(this._config) : null);
    return {
      config: this._config!,
      hass,
      language,
      translate,
      areas: this._areas,
      entityRegistry: this._entityRegistry,
      deviceRegistry: this._deviceRegistry,
      floors: this._floors,
      view: this._view,
      deviceGrouping: this._deviceGrouping,
      filterRoom: this._filterRoom,
      focusDeviceRoom: this._focusDeviceRoom,
      filterType: this._filterType,
      hideUnassigned: this._hideUnassigned,
      selectedFloor: this._selectedFloor,
      selectedEnvFloor: this._selectedEnvFloor,
      kioskFullscreen: isKioskActive(),
      androidKiosk: isAndroidKiosk(),
      devicePageIndex: this._devicePageIndex,
      securityHideEditMode: this._securityHideEditMode,
      securityHideSaving: this._securityHideSaving,
      securityHidden: this.getSecurityHiddenIds(),
      deviceHideEditMode: this._deviceHideEditMode,
      deviceHideSaving: this._deviceHideSaving,
      deviceHidden: this.getDeviceHiddenIds(),
      weatherForecast: this._weatherForecast,
      energyHistory: energyHistoryOverride ?? this._energyHistory,
      energyYesterday: this._energyYesterday,
      energySources: enrichEnergySourcesWithMeters(hass, this._energySources),
      energyMonthToDate: this._energyMonthToDate,
      energyWeekToDate: this._energyWeekToDate,
      energyTodayTotal: this._energyTodayTotal,
      onNavigate: (target) => this.navigateTo(target),
      onNavigatePath: (path) => navigatePath(path),
      onRunScene: (entityId) => { void runScene(this._hass, entityId); },
      onToggleEntity: (entityId) => { void toggleEntity(this._hass, entityId); },
      onHandleAction: (entityId, action) => this.handleAction(entityId, action),
      onBatchControl: (state) => { void this.batchControl(state, translate); },
      onToggleKiosk: () => this.toggleKioskFullscreen(),
      onMoreInfo: (entityId) => moreInfo(this, entityId),
      onTurnOffAreaType: (entityIds) => turnOffAreaTypeAction(this._hass, entityIds),
      setDeviceGrouping: (g) => { this._deviceGrouping = g; this._devicePageIndex = 0; },
      setFilterRoom: (r) => { this._filterRoom = r; this._devicePageIndex = 0; },
      setFocusDeviceRoom: (room) => { this._focusDeviceRoom = room; },
      setFilterType: (t) => { this._filterType = t; this._devicePageIndex = 0; },
      setHideUnassigned: (h) => { this._hideUnassigned = h; this._devicePageIndex = 0; },
      setSelectedFloor: (f) => { this._selectedFloor = f; },
      setSelectedEnvFloor: (f) => { this._selectedEnvFloor = f; },
      setDevicePageIndex: (page) => { this._devicePageIndex = Math.max(0, page); },
      setSecurityHideEditMode: (on) => this.setSecurityHideEditMode(on),
      onToggleSecurityHidden: (entityId) => this.toggleSecurityHidden(entityId),
      setDeviceHideEditMode: (on) => this.setDeviceHideEditMode(on),
      onDeviceHideLongPress: (entityId) => this.hideDeviceEntity(entityId),
      onDeviceHideClick: (entityId) => this.unhideDeviceEntity(entityId),
      bumpDeviceHideIdle: () => this.bumpDeviceHideIdle(),
      resolvedTheme: this._resolveTheme(),
    };
  }

  private userIdForStorage(): string {
    return this._hass?.user?.id || 'default';
  }

  private collectSecurityCameraMeta(): Array<{ entityId: string; name?: string }> {
    const byId = new Map<string, { entityId: string; name?: string }>();
    for (const entry of this._entityRegistry || []) {
      if (!entry.entity_id.startsWith('camera.')) continue;
      byId.set(entry.entity_id, {
        entityId: entry.entity_id,
        name: entry.name || entry.original_name || undefined,
      });
    }
    for (const entity of Object.values(this._hass?.states || {})) {
      if (!entity?.entity_id?.startsWith('camera.')) continue;
      const prev = byId.get(entity.entity_id);
      byId.set(entity.entity_id, {
        entityId: entity.entity_id,
        name: String(entity.attributes?.friendly_name || prev?.name || ''),
      });
    }
    return [...byId.values()];
  }

  private getSecurityHiddenIds(): string[] {
    return resolveSecurityHiddenIds({
      draft: this._securityHiddenDraft,
      configHidden: this._config?.security_page?.hidden,
      userId: this.userIdForStorage(),
      cameras: this.collectSecurityCameraMeta(),
    });
  }

  private mergeSecurityHiddenFromSources(config: DashboardConfig): DashboardConfig {
    const merged = mergeConfig(config);
    const hidden = resolveSecurityHiddenIds({
      draft: this._securityHiddenDraft,
      configHidden: merged.security_page?.hidden,
      userId: this.userIdForStorage(),
      cameras: this.collectSecurityCameraMeta(),
    });
    merged.security_page = { ...merged.security_page, hidden };
    if (this._securityHiddenDraft === null && readSecurityHiddenLocal(this.userIdForStorage()) === null) {
      writeSecurityHiddenLocal(hidden, this.userIdForStorage());
    }
    return merged;
  }

  private mergeDevicesHiddenFromSources(config: DashboardConfig): DashboardConfig {
    const merged = mergeConfig(config);
    const hidden = resolveDevicesHiddenIds({
      draft: this._deviceHiddenDraft,
      configHidden: merged.devices_page?.hidden,
      userId: this.userIdForStorage(),
    });
    merged.devices_page = { ...merged.devices_page, hidden };
    if (this._deviceHiddenDraft === null && readDevicesHiddenLocal(this.userIdForStorage()) === null) {
      writeDevicesHiddenLocal(hidden, this.userIdForStorage());
    }
    return merged;
  }

  private mergeHiddenFromSources(config: DashboardConfig): DashboardConfig {
    return this.mergeDevicesHiddenFromSources(this.mergeSecurityHiddenFromSources(config));
  }

  private getDeviceHiddenIds(): string[] {
    return resolveDevicesHiddenIds({
      draft: this._deviceHiddenDraft,
      configHidden: this._config?.devices_page?.hidden,
      userId: this.userIdForStorage(),
    });
  }

  private clearDeviceHideIdle(): void {
    if (this._deviceHideIdleTimer) {
      window.clearTimeout(this._deviceHideIdleTimer);
      this._deviceHideIdleTimer = undefined;
    }
  }

  private bumpDeviceHideIdle(): void {
    if (!this._deviceHideEditMode || this._deviceHideSaving) return;
    this.clearDeviceHideIdle();
    this._deviceHideIdleTimer = window.setTimeout(() => {
      this.setDeviceHideEditMode(false);
    }, DEVICE_EDIT_IDLE_MS);
  }

  private applyDeviceHiddenDraft(next: string[]): void {
    this._deviceHiddenDraft = next;
    writeDevicesHiddenLocal(next, this.userIdForStorage());
    this._config = mergeConfig({
      ...this._config!,
      devices_page: { ...this._config?.devices_page, hidden: next },
    });
    this.bumpDeviceHideIdle();
    this.requestUpdate();
  }

  /** Edit-mode long-press — hide entity. */
  private hideDeviceEntity(entityId: string): void {
    if (!this._deviceHideEditMode || this._deviceHideSaving) return;
    this.applyDeviceHiddenDraft(addHiddenId(this.getDeviceHiddenIds(), entityId));
  }

  /** Edit-mode click on already-hidden card — restore. */
  private unhideDeviceEntity(entityId: string): void {
    if (!this._deviceHideEditMode || this._deviceHideSaving) return;
    this.applyDeviceHiddenDraft(removeHiddenId(this.getDeviceHiddenIds(), entityId));
  }

  private setDeviceHideEditMode(on: boolean): void {
    if (on) {
      this._deviceHiddenDraft = this.getDeviceHiddenIds();
      this._deviceHideEditMode = true;
      this._deviceHideSaving = false;
      this.bumpDeviceHideIdle();
      this.requestUpdate();
      return;
    }
    if (!this._deviceHideEditMode) return;
    if (this._deviceHideSaving) return;

    this.clearDeviceHideIdle();
    const hidden = normalizeHiddenIds(this._deviceHiddenDraft ?? this.getDeviceHiddenIds());
    this._deviceHiddenDraft = hidden;
    writeDevicesHiddenLocal(hidden, this.userIdForStorage());
    this._config = mergeConfig({
      ...this._config!,
      devices_page: { ...this._config?.devices_page, hidden },
    });

    const connection = this._hass?.connection;
    if (!connection?.sendMessagePromise) {
      this._deviceHideEditMode = false;
      this.requestUpdate();
      return;
    }

    this._deviceHideSaving = true;
    this.requestUpdate();
    void saveDevicesHiddenToHa(connection, hidden)
      .then((ok) => {
        if (!ok) console.warn('[Skins Pro] devices hide saved locally; HA strategy sync failed');
      })
      .finally(() => {
        this._deviceHideSaving = false;
        this._deviceHideEditMode = false;
        this.requestUpdate();
      });
  }

  /** Edit-mode tap only — updates draft + localStorage, never HA. */
  private toggleSecurityHidden(entityId: string): void {
    if (!this._securityHideEditMode || this._securityHideSaving) return;
    const next = toggleHiddenId(this.getSecurityHiddenIds(), entityId);
    this._securityHiddenDraft = next;
    writeSecurityHiddenLocal(next, this.userIdForStorage());
    this._config = mergeConfig({
      ...this._config!,
      security_page: { ...this._config?.security_page, hidden: next },
    });
    this.requestUpdate();
  }

  /**
   * Enter edit: copy current list into draft.
   * Exit (Done): save draft to HA strategy, then leave edit mode.
   */
  private setSecurityHideEditMode(on: boolean): void {
    if (on) {
      this._securityHiddenDraft = this.getSecurityHiddenIds();
      this._securityHideEditMode = true;
      this._securityHideSaving = false;
      this.requestUpdate();
      return;
    }
    if (!this._securityHideEditMode) return;
    if (this._securityHideSaving) return;

    const hidden = normalizeHiddenIds(this._securityHiddenDraft ?? this.getSecurityHiddenIds());
    this._securityHiddenDraft = hidden;
    writeSecurityHiddenLocal(hidden, this.userIdForStorage());
    this._config = mergeConfig({
      ...this._config!,
      security_page: { ...this._config?.security_page, hidden },
    });

    const connection = this._hass?.connection;
    if (!connection?.sendMessagePromise) {
      this._securityHideEditMode = false;
      this.requestUpdate();
      return;
    }

    this._securityHideSaving = true;
    this.requestUpdate();
    void saveSecurityHiddenToHa(connection, hidden)
      .then((ok) => {
        if (!ok) console.warn('[Skins Pro] security hide saved locally; HA strategy sync failed');
      })
      .finally(() => {
        this._securityHideSaving = false;
        this._securityHideEditMode = false;
        this.requestUpdate();
      });
  }

  // ─── Main render ────────────────────────────────────────

  protected render(): TemplateResult {
    if (!this._config) {
      return html``;
    }

    if (!this._hass) {
      return html`
        <link rel="stylesheet" href="${assetHref(this._config, 'theme_css')}">
        ${SHARED_CHROME_STYLE}
        ${KIOSK_HOME_SIDE_STYLE}
        <ha-card><div class="loading-state">Loading...</div></ha-card>
      `;
    }

    const language = normalizeLanguage(
      this._config.language === 'auto' ? this._hass.language : this._config.language,
    );
    const translate = getTranslate(language);
    const energyDisplay = this.getConfiguredEnergyDisplay();
    const ctx = this._buildContext(language, translate, energyDisplay.history);

    const weatherIconName = weatherIcon(stateValue(this._hass, this._config.weather?.entity, language));
    const quote = infoDisplayValue(this._hass, this._config.info?.entity, language) || translate('loadingQuote');
    const energyEntityId = this._config.energy?.entity || '';
    const energyValue = energyDisplay.today;
    const energyUnit = (this._hass?.states[energyEntityId]?.attributes?.unit_of_measurement as string | undefined) || this._config.energy?.unit || 'kWh';
    const compareValue = energyDisplay.yesterday;
    const registriesLoading = this.renderRegistryLoading(language);

    let stage: TemplateResult;
    switch (this._view) {
      case 'devices': stage = renderDevicesView(ctx); break;
      case 'rooms': stage = renderRoomsView(ctx); break;
      case 'scenes': stage = renderScenesView(ctx); break;
      case 'automations': stage = renderAutomationsView(ctx); break;
      case 'security': stage = renderSecurityView(ctx); break;
      case 'energy': stage = renderEnergyView(ctx, energyValue, energyUnit, compareValue); break;
      default: stage = renderHomeView(ctx, weatherIconName, quote, energyValue, energyUnit, compareValue);
    }

    return html`
      <link rel="stylesheet" href="${assetHref(this._config, 'theme_css')}">
      ${SHARED_CHROME_STYLE}
      ${KIOSK_HOME_SIDE_STYLE}
      <ha-card>
        ${registriesLoading}
        <div class="mc-app" data-view=${this._view}>
          ${renderSidebar(ctx)}
          <main class="stage">${stage}</main>
          ${renderMobileNav(ctx)}
        </div>
      </ha-card>
    `;
  }

  private renderRegistryLoading(language: Language): TemplateResult | typeof nothing {
    if (!this._hass) return nothing;
    const allLoaded = this._areasLoaded && this._entityRegistryLoaded && this._deviceRegistryLoaded;
    if (allLoaded) return nothing;
    return html`<div class="loading-state loading-registry">${t(language, 'loadingRegistry')}</div>`;
  }

  // ─── Lifecycle ──────────────────────────────────────────

  protected updated(): void {
    applyThemeVariables(this._host(), this._config);
    this._applyLayout();
    this._applyThemeAttribute();
    // Re-check after paint — covers first load when doorbell already pending.
    this._syncDoorbellDialog();
    if (this._shouldAutoFullscreen() && !this._autoFullscreenDone) {
      applyFullscreenHeight(this._host());
      const applied = ensureKiosk();
      this._autoFullscreenDone = applied || this._autoFullscreenAttempts >= 12;
      if (!this._autoFullscreenDone) {
        this._autoFullscreenAttempts += 1;
        window.setTimeout(() => this.requestUpdate(), 250);
      } else {
        this.requestUpdate();
      }
    }
    this._scrollToFocusedDeviceRoom();
  }

  /** Room card → devices: keep all areas visible, scroll to the tapped room section. */
  private _scrollToFocusedDeviceRoom(): void {
    if (this._view !== 'devices' || !this._focusDeviceRoom) return;
    const room = this._focusDeviceRoom;
    this._focusDeviceRoom = '';
    window.requestAnimationFrame(() => {
      const root = this.renderRoot as ShadowRoot | null;
      const section = root?.querySelector(`[data-device-room="${CSS.escape(room)}"]`) as HTMLElement | null;
      section?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  private _shouldAutoFullscreen(): boolean {
    if (this._config?.fullscreen) return true;
    const users = this._config?.fullscreen_users || [];
    if (!users.length) return false;
    const current = [this._hass?.user?.id, this._hass?.user?.name]
      .filter((value): value is string => Boolean(value))
      .map((value) => value.toLowerCase());
    return users.some((user) => current.includes(String(user).toLowerCase()));
  }

  private _resolveTheme(): 'light' | 'dark' {
    if (!skinSupportsDark(selectedSkin(this._config))) return 'light';
    const mode = this._config?.skin_mode || 'auto';
    if (mode === 'light') return 'light';
    if (mode === 'dark') return 'dark';
    // auto: use sun entity, fallback to hour-based
    const sun = this._hass?.states?.['sun.sun'];
    if (sun?.state === 'above_horizon') return 'light';
    if (sun?.state === 'below_horizon') return 'dark';
    // no sun data: 6:00-17:59 = light, 18:00-5:59 = dark
    const hour = new Date().getHours();
    return hour >= 6 && hour < 18 ? 'light' : 'dark';
  }

  private _applyThemeAttribute(): void {
    this.setAttribute('data-sp-theme', this._resolveTheme());
    const kiosk = this._shouldAutoFullscreen() || isKioskActive();
    this.toggleAttribute('data-sp-kiosk', kiosk);
    // Legacy GoW selector + Android Kiosk APK identity (tile-memory CSS / paging).
    this.toggleAttribute('data-kiosk-fullscreen', kiosk);
    if (isAndroidKiosk()) this.setAttribute('data-android-kiosk', 'true');
    else this.removeAttribute('data-android-kiosk');
  }

  private handleAction(entityId: string, action: string): void {
    if (action === 'toggle') {
      void toggleEntity(this._hass, entityId);
    } else if (action === 'play-pause') {
      void this._hass?.callService('media_player', 'media_play_pause', { entity_id: entityId });
    } else if (action === 'lock-dialog') {
      if (!this._hass) return;
      const language = normalizeLanguage(
        this._config?.language === 'auto' ? this._hass.language : this._config?.language,
      );
      openLockDialog(this, this._hass, entityId, language, selectedSkin(this._config));
    } else {
      moreInfo(this, entityId);
    }
  }

  private navigateTo(target: string): void {
    const valid: ViewName[] = ['home', 'devices', 'rooms', 'scenes', 'automations', 'security', 'energy'];
    if (valid.includes(target as ViewName)) {
      if (target !== 'devices' && this._deviceHideEditMode) this.setDeviceHideEditMode(false);
      if (target !== 'security' && this._securityHideEditMode) this.setSecurityHideEditMode(false);
      this._view = target as ViewName;
    }
  }

  private toggleKioskFullscreen(): void {
    // Edit-hidden UI is hidden in kiosk; clear so hidden items don't get stuck.
    if (this._securityHideEditMode) this.setSecurityHideEditMode(false);
    if (this._deviceHideEditMode) this.setDeviceHideEditMode(false);
    const host = this._host();
    if (document.body.classList.contains('skins-pro-kiosk')) {
      toggleKiosk();
      if (host) applyKioskExitHeight(host);
    } else {
      if (host) applyFullscreenHeight(host);
      toggleKiosk();
    }
    this.requestUpdate();
  }

  private async batchControl(state: 'on' | 'off', translate: (key: TranslationKey) => string): Promise<void> {
    const hidden = new Set(this.getDeviceHiddenIds());
    const devices = getRealDevicesForRender(this._hass, this._deviceRegistry, this._entityRegistry, this._areas, {
      filterRoom: this._filterRoom,
      filterType: this._filterType,
      hideUnassigned: this._hideUnassigned,
    }).filter((d) => !hidden.has(d.entityId));
    const controllable = devices.filter((d) => CONTROLLABLE_DOMAINS.has(d.detail));
    if (controllable.length === 0) return;
    if (!confirm(translate('confirmAction'))) return;
    const service = state === 'on' ? 'turn_on' : 'turn_off';
    await Promise.all(controllable.map((d) => this._hass?.callService(d.detail, service, { entity_id: d.entityId })));
  }
}
