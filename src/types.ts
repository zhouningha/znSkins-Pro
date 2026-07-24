export interface HassEntity {
  entity_id: string;
  state: string;
  last_changed: string;
  attributes?: Record<string, unknown>;
}

export interface HomeAssistant {
  language?: string;
  locale?: {
    language?: string;
    time_format?: '12h' | '24h';
    date_format?: 'DMY' | 'MDY' | 'YMD';
    number_format?: string;
  };
  user?: { id?: string; name?: string; is_owner?: boolean; is_admin?: boolean };
  states: Record<string, HassEntity | undefined>;
  callService: (domain: string, service: string, data?: Record<string, unknown>) => Promise<unknown>;
  callApi?: (method: string, path: string, body?: unknown) => Promise<unknown>;
  connection?: {
    sendMessagePromise: <T>(message: Record<string, unknown>) => Promise<T>;
    subscribeMessage?: <T>(
      callback: (data: T) => void,
      message: Record<string, unknown>,
      options?: { resubscribe?: boolean }
    ) => Promise<() => Promise<void>>;
  };
  auth?: { data?: { access_token?: string } };
}

export interface AreaRegistryEntry {
  area_id: string;
  name: string;
  picture?: string | null;
  floor_id?: string | null;
  icon?: string | null;
  aliases?: string[];
}

export interface FloorRegistryEntry {
  floor_id: string;
  name: string;
  level: number | null;
  icon?: string | null;
  aliases?: string[];
}

export interface EntityRegistryEntry {
  entity_id: string;
  name?: string | null;
  original_name?: string | null;
  area_id?: string | null;
  device_id?: string | null;
  hidden_by?: string | null;
  disabled_by?: string | null;
  capabilities?: Record<string, unknown> | null;
  supported_features?: number | null;
}

export interface DeviceRegistryEntry {
  id: string;
  area_id?: string | null;
  name?: string | null;
  name_by_user?: string | null;
  manufacturer?: string | null;
  model?: string | null;
  disabled_by?: string | null;
}

export interface NavItemConfig {
  key?: string;
  label?: string;
  label_zh?: string;
  label_en?: string;
  icon?: string;
  target?: string;
  enabled: boolean;
}

export interface DeviceConfig {
  entity: string;
  name?: string;
  name_zh?: string;
  name_en?: string;
  area?: string;
  area_zh?: string;
  area_en?: string;
  image?: string;
  icon?: string;
  color?: 'yellow' | 'green' | 'blue' | 'purple' | 'red' | 'brown';
  temperature_entity?: string;
}

export interface RoomConfig {
  name?: string;
  name_zh?: string;
  name_en?: string;
  image?: string;
  target?: string;
  info_entity?: string;
}

export interface SceneConfig {
  entity: string;
  icon?: string;
  tone?: 'morning' | 'night' | 'movie' | 'game';
  name?: string;
  name_zh?: string;
  name_en?: string;
  subtitle?: string;
  subtitle_zh?: string;
  subtitle_en?: string;
  confirm?: boolean;
}

export interface EnvironmentMetricConfig {
  entity: string;
  icon?: string;
  unit?: string;
  variant?: 'temp' | 'hum' | 'pm';
  label?: string;
  label_zh?: string;
  label_en?: string;
}

export interface ResourcePackConfig {
  base_path?: string;
  skin?: string;
  assets?: Record<string, string>;
  theme?: Record<string, string>;
}

export interface WeatherConfig {
  entity?: string;
  temperature_entity?: string;
}

export interface InfoConfig {
  entity?: string;
}

export interface EnergyConfig {
  entity?: string;
  unit?: string;
  compare_text?: string;
  compare_text_zh?: string;
  compare_text_en?: string;
}

export interface MediaPlayerConfig {
  entity?: string;
}

export interface CameraConfig {
  entity?: string;
}

export interface SecurityGo2rtcStream {
  /**
   * Stable id for hide/order (go2rtc stream name or camera entity_id).
   * For `ha-camera`, prefer the entity_id.
   */
  stream: string;
  /** Overlay label. */
  label?: string;
  /**
   * How the security page plays this stream:
   * - `go2rtc-mjpeg` — direct `http://host:1984/api/stream.mjpeg?src=` (reliable in skins-pro)
   * - `ha-camera` — HA camera entity via hui-image live
   * - `webrtc-camera` — AlexxIT card + go2rtc stream name
   * - `advanced-camera-card` — go2rtc via Frigate card
   */
  provider?: 'go2rtc-mjpeg' | 'ha-camera' | 'webrtc-camera' | 'advanced-camera-card';
  /** HA camera entity_id when provider is `ha-camera`. */
  entity?: string;
  /** go2rtc HTTP base, e.g. http://192.168.1.17:1984 (defaults to hostname:1984). */
  go2rtc_url?: string;
  /** advanced-camera-card go2rtc modes (monitoring living-room uses webrtc only). */
  modes?: string[];
}

/** Alias: security cam source descriptor. */
export type SecurityMonitorSource = SecurityGo2rtcStream & {
  provider: 'go2rtc-mjpeg' | 'ha-camera' | 'webrtc-camera' | 'advanced-camera-card';
};

export interface SecurityPageConfig {
  /** Entity IDs / go2rtc stream keys hidden from the security page (edit-hidden mode). */
  hidden?: string[];
  /**
   * Live previews matching dashboard-n/monitoring card configs exactly.
   * When omitted, defaults to the three working monitoring streams.
   */
  streams?: SecurityGo2rtcStream[];
}

export interface DevicesPageConfig {
  /** Entity IDs hidden from the devices page (edit-hidden mode). */
  hidden?: string[];
}

export interface ScenesPageConfig {
  /** Scene/script entity IDs shown on the scenes page, grouped by HA floor/area. */
  selection?: string[];
}

export interface HomeLimitsConfig {
  devices?: number;
  rooms?: number;
  scenes?: number;
  environment?: number;
}

export interface HomeSelectionConfig {
  devices?: string[];
  rooms?: string[];
  scenes?: string[];
  environment?: string[];
  weather_entity?: string;
  weather_temperature_entity?: string;
  energy_entity?: string;
}

export interface DashboardConfig {
  type: string;
  language?: 'zh-CN' | 'en' | 'auto';
  title?: string;
  title_zh?: string;
  title_en?: string;
  subtitle?: string;
  subtitle_zh?: string;
  subtitle_en?: string;
  profile_name?: string;
  profile_subtitle?: string;
  profile_subtitle_zh?: string;
  profile_subtitle_en?: string;
  resource_pack?: ResourcePackConfig;
  downloaded_skins?: string[];
  background_image?: string;
  skin_mode?: 'auto' | 'light' | 'dark';
  weather?: WeatherConfig;
  info?: InfoConfig;
  fullscreen?: boolean;
  fullscreen_users?: string[];
  use_area_pictures?: boolean;
  environment?: EnvironmentMetricConfig[];
  devices?: DeviceConfig[];
  rooms?: RoomConfig[];
  scenes?: SceneConfig[];
  nav?: NavItemConfig[];
  energy?: EnergyConfig;
  media_player?: MediaPlayerConfig;
  camera?: CameraConfig;
  security_page?: SecurityPageConfig;
  /**
   * Tablet doorbell ringtone URL (mp3/wav/ogg).
   * Default `/local/doorbell.mp3` — place file at `/config/www/doorbell.mp3`.
   */
  doorbell_sound?: string;
  devices_page?: DevicesPageConfig;
  scenes_page?: ScenesPageConfig;
  home_limits?: HomeLimitsConfig;
  home_selection?: HomeSelectionConfig;
}

export type DeviceColor = 'yellow' | 'green' | 'blue' | 'purple' | 'red' | 'brown';

export type ViewName = 'home' | 'devices' | 'rooms' | 'scenes' | 'automations' | 'security' | 'energy';

export interface RenderedDevice {
  entityId: string;
  name: string;
  subtitle: string;
  detail: string;
  state: string;
  icon: string;
  color: DeviceColor;
}

export type TranslationKey =
  | 'home'
  | 'devices'
  | 'scenes'
  | 'automations'
  | 'rooms'
  | 'security'
  | 'energy'
  | 'environment'
  | 'quickControl'
  | 'roomSnapshots'
  | 'modes'
  | 'todayEnergy'
  | 'totalEnergy'
  | 'monthToDate'
  | 'weekToDate'
  | 'maintenance'
  | 'compareYesterday'
  | 'loadingQuote'
  | 'offline'
  | 'noDevices'
  | 'noScenes'
  | 'noAutomations'
  | 'byArea'
  | 'byType'
  | 'securityOverview'
  | 'on'
  | 'off'
  | 'open'
  | 'closed'
  | 'solar'
  | 'battery'
  | 'gas'
  | 'water'
  | 'gridReturn'
  | 'allRooms'
  | 'allFloors'
  | 'allTypes'
  | 'turnOnAll'
  | 'turnOffAll'
  | 'confirmAction'
  | 'uploadBackground'
  | 'clearBackground'
  | 'mediaPlayer'
  | 'showAll'
  | 'hideUnassigned'
  | 'editHidden'
  | 'editHiddenDone'
  | 'editHiddenSaving'
  | 'hideSecurityHint'
  | 'hideDevicesHint'
  | 'entityHidden'
  | 'tapToHide'
  | 'groupLights'
  | 'groupSwitches'
  | 'groupClimate'
  | 'climateTempCurrent'
  | 'climateTempTarget'
  | 'climateMode'
  | 'climateFanSpeed'
  | 'climateSwing'
  | 'climatePreset'
  | 'brightness'
  | 'colorTemperature'
  | 'colorMode'
  | 'fanSpeed'
  | 'fanOscillate'
  | 'fanDirection'
  | 'airPurifier'
  | 'humidifying'
  | 'drying'
  | 'idle'
  | 'targetHumidity'
  | 'currentHumidity'
  | 'vacuumCleaning'
  | 'vacuumDocked'
  | 'vacuumReturning'
  | 'vacuumPaused'
  | 'vacuumIdle'
  | 'vacuumError'
  | 'vacuumStart'
  | 'vacuumPause'
  | 'vacuumStop'
  | 'vacuumDock'
  | 'vacuumLocate'
  | 'vacuumCleanSpot'
  | 'alarmDisarmed'
  | 'alarmArmedHome'
  | 'alarmArmedAway'
  | 'alarmArmedNight'
  | 'alarmArmedVacation'
  | 'alarmArmedCustom'
  | 'alarmArming'
  | 'alarmPending'
  | 'alarmTriggered'
  | 'alarmDisarming'
  | 'hvacAuto'
  | 'hvacCool'
  | 'hvacHeat'
  | 'hvacFanOnly'
  | 'hvacDry'
  | 'hvacOff'
  | 'fanAuto'
  | 'fanLow'
  | 'fanMedium'
  | 'fanHigh'
  | 'fanOn'
  | 'fanOff'
  | 'fanSilent'
  | 'fanFull'
  | 'swingOff'
  | 'swingBoth'
  | 'swingVertical'
  | 'swingHorizontal'
  | 'presetNone'
  | 'presetEco'
  | 'presetAway'
  | 'presetBoost'
  | 'presetSleep'
  | 'groupCovers'
  | 'groupMedia'
  | 'groupSecurity'
  | 'groupOthers'
  | 'groupCleaning'
  | 'otherGroup'
  | 'noEntities'
  | 'areaOccupied'
  | 'areaEmpty'
  | 'entityCount'
  | 'deviceEntityCount'
  | 'notActivated'
  | 'notTriggered'
  | 'run'
  | 'enabled'
  | 'disabled'
  | 'snapshot'
  | 'toggleTheme'
  | 'loadingRegistry'
  | 'noAreas'
  | 'automationsSubtitle'
  | 'turnOn'
  | 'previous'
  | 'next'
  | 'play'
  | 'pause'
  | 'editorSkin'
  | 'editorSkinStore'
  | 'editorSkinStoreDependency'
  | 'editorSkinStoreClose'
  | 'editorSkinStoreLoadFailed'
  | 'editorSkinStoreDownload'
  | 'editorSkinStoreRemove'
  | 'editorSkinStoreRedownload'
  | 'editorSkinStoreNewVersion'
  | 'editorSkinStoreSearch'
  | 'editorStoreClearCache'
  | 'editorEnergy'
  | 'editorMediaPlayer'
  | 'editorCamera'
  | 'editorHomeDevices'
  | 'editorHomeRooms'
  | 'editorHomeScenes'
  | 'editorScenesPage'
  | 'editorScenesPageHint'
  | 'editorHomeEnv'
  | 'editorInfo'
  | 'editorFullscreen'
  | 'editorUseAreaPictures'
  | 'editorNavigation'
  | 'editorNavigationConfigure'
  | 'editorSkinMode'
  | 'editorSkinModeAuto'
  | 'editorSkinModeLight'
  | 'editorSkinModeDark'
  | 'editorCancel'
  | 'editorSave'
  | 'editorBackground'
  | 'editorWeather'
  | 'editorEnergyEntity'
  | 'editorLoadingAreas'
  | 'editorDownloading'
  | 'editorDownloadFailed'
  | 'editorUploadFailed'
  | 'alarmEnterCode'
  | 'lockUnlock'
  | 'lockUnlocking'
  | 'lockAutoClose'
  | 'doorbellTitle'
  | 'doorbellPreview'
  | 'doorbellDismiss'
  | 'doorbellWaitPhone'
  | 'doorbellPhoneNotified'
  | 'searchPlaceholder'
  | 'searchRecent'
  | 'searchNoResults'
  | 'searchAll'
;

export interface EnergySourceData {
  key: TranslationKey;
  /** Custom display label (HA individual devices); falls back to translate(key). */
  label?: string;
  /** Floor name from area/floor registry (e.g. 二层). */
  floorName?: string;
  /** Area/room name (e.g. 多媒体机柜 / 小薛). */
  areaName?: string;
  /** Combined「楼层 · 房间」for card subtitle. */
  locationLabel?: string;
  /** True when from HA Energy device_consumption (not grid/solar/…). */
  isDevice?: boolean;
  entityId: string;
  icon: string;
  unit: string;
  history: number[];
  yesterday?: string;
  today: string;
  /** Current calendar week consumption (Mon–today). */
  weekToDate?: string;
  /** Current calendar month consumption. */
  monthToDate?: string;
}

export interface WeatherForecastDay {
  datetime?: string;
  condition?: string;
  temperature?: number | null;
  templow?: number | null;
  precipitation?: number | null;
}

export interface MaintenanceItem {
  name: string;
  battery: number;
  level: 'warning' | 'error';
}

export interface EnergySourceEntry {
  type: string;
  flow_from?: Array<{ stat_energy_from?: string }>;
  flow_to?: Array<{ stat_energy_to?: string }>;
  stat_energy_from?: string | null;
  stat_energy_to?: string | null;
  stat_soc?: string;
}

export interface EnergyDeviceConsumptionEntry {
  stat_consumption?: string;
}

export interface EnergyPrefsResponse {
  energy_sources?: EnergySourceEntry[];
  /** HA Energy → Individual devices */
  device_consumption?: EnergyDeviceConsumptionEntry[];
}

export type StatisticEntry = {
  start?: string;
  change?: number | null;
  sum?: number | null;
  state?: number | null;
};

export type StatisticsResponse = Record<string, StatisticEntry[]>;
