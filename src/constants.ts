import type { DashboardConfig, DeviceConfig, EnvironmentMetricConfig, NavItemConfig, RoomConfig, SceneConfig } from './types';

export const DEFAULT_ASSETS: Record<string, string> = {
  base: 'base-texture.jpg',
  stage: 'background.jpg',
  theme_css: 'theme.css',
  avatar: 'avatar.png',
  decor: 'decoration.png',
  light: 'icon-light.png',
  switch: 'icon-switch.png',
  button: 'icon-button.png',
  climate: 'icon-ac.png',
  water_heater: 'icon-water_heater.png',
  humidifier: 'icon-humidifier.png',
  fan: 'icon-fan.png',
  speaker: 'icon-speaker.png',
  remote: 'icon-remote.png',
  lock: 'icon-lock.png',
  camera: 'icon-camera.png',
  cover: 'icon-cover.png',
  valve: 'icon-valve.png',
  automation: 'icon-automation.png',
  media_player: 'icon-media_player.png',
  vacuum: 'icon-vacuum.png',
  sensor: 'icon-sensor.png',
  binary_sensor: 'icon-binary_sensor.png',
  update: 'icon-update.png',
  device_tracker: 'icon-device_tracker.png',
  person: 'icon-person.png',
  garden: 'icon-garden-light.png',
  room_living: 'room-living.jpg',
  room_bedroom: 'room-bedroom.jpg',
  room_kitchen: 'room-kitchen.jpg',
  room_dining: 'room-dining.jpg',
  room_garden: 'room-garden.jpg',
  room_office: 'room-office.jpg',
  room_garage: 'room-garage.jpg',
  room_bathroom: 'room-bathroom.jpg',
  room_study: 'room-study.jpg',
  room_media: 'room-media.jpg',
};

/** Room image keys assigned in order so the first ten HA areas do not repeat. */
export const AREA_ROOM_IMAGE_KEYS = [
  'room_living',
  'room_office',
  'room_kitchen',
  'room_bathroom',
  'room_media',
  'room_study',
  'room_dining',
  'room_garden',
  'room_garage',
  'room_bedroom',
] as const;

export function areaRoomImageKey(areaId: string, fallbackIndex = 0, areaName = ''): string {
  const text = `${areaName} ${areaId}`.toLowerCase();
  if (/卫生|bath|toilet|wash/.test(text)) return 'room_bathroom';
  if (/厨房|kitchen/.test(text)) return 'room_kitchen';
  if (/客厅|living|lounge/.test(text)) return 'room_living';
  if (/办公|办公室|office/.test(text)) return 'room_office';
  if (/媒体|影音|机柜|tv|media|cinema|theater|avr/.test(text)) return 'room_media';
  if (/产品|product/.test(text)) return 'room_study';
  if (/演示|demo|show/.test(text)) return 'room_dining';
  if (/花园|garden|阳台|balcony|terrace/.test(text)) return 'room_garden';
  if (/车库|garage/.test(text)) return 'room_garage';
  if (/卧室|bedroom|寝室/.test(text)) return 'room_bedroom';
  return AREA_ROOM_IMAGE_KEYS[Math.abs(fallbackIndex) % AREA_ROOM_IMAGE_KEYS.length];
}

export const DEFAULT_NAV: NavItemConfig[] = [
  { key: 'home', icon: 'mdi:home', enabled: true },
  { key: 'devices', icon: 'mdi:devices', enabled: true },
  { key: 'scenes', icon: 'mdi:palette-swatch', enabled: true },
  { key: 'automations', icon: 'mdi:robot', enabled: true },
  { key: 'rooms', icon: 'mdi:door', enabled: true },
  { key: 'security', icon: 'mdi:shield-home', enabled: true },
  { key: 'energy', icon: 'mdi:lightning-bolt', enabled: true },
];

export const DEFAULT_DEVICES: DeviceConfig[] = [
  { entity: 'light.living_room_lights', image: 'light', color: 'yellow' },
  { entity: 'climate.living_room_ac', image: 'climate', color: 'blue', temperature_entity: 'sensor.living_room_temperature' },
  { entity: 'media_player.living_room_speaker', image: 'speaker', color: 'purple' },
  { entity: 'lock.front_door', image: 'lock', color: 'red' },
  { entity: 'light.garden_light_strip', image: 'garden', color: 'green' },
];

export const DEFAULT_ROOMS: RoomConfig[] = [
  { image: 'room_living', info_entity: 'sensor.living_room_summary' },
  { image: 'room_bedroom', info_entity: 'sensor.bedroom_summary' },
  { image: 'room_kitchen', info_entity: 'sensor.kitchen_summary' },
  { image: 'room_garden', info_entity: 'sensor.garden_summary' },
];

export const DEFAULT_SCENES: SceneConfig[] = [
  { entity: 'scene.home_mode', tone: 'morning', icon: 'mdi:home-import-outline', confirm: true },
  { entity: 'scene.good_night', tone: 'night', icon: 'mdi:weather-night', confirm: true },
  { entity: 'scene.welcome_home', tone: 'movie', icon: 'mdi:home-heart', confirm: true },
  { entity: 'scene.away_mode', tone: 'game', icon: 'mdi:exit-run', confirm: true },
];

export const DEFAULT_ENVIRONMENT: EnvironmentMetricConfig[] = [
  { entity: 'sensor.living_room_temperature', icon: 'mdi:thermometer', unit: '°C', variant: 'temp' },
  { entity: 'sensor.living_room_humidity', icon: 'mdi:water-percent', unit: '%', variant: 'hum' },
  { entity: 'sensor.pm25', icon: 'mdi:leaf', unit: '', variant: 'pm' },
];

export const DEFAULT_CONFIG: DashboardConfig = {
  type: 'custom:skins-pro-card',
  language: 'auto',
  resource_pack: {
    skin: 'modern',
    base_path: '__AUTO__',
    assets: DEFAULT_ASSETS,
  },
  weather: {
    entity: 'weather.home',
    temperature_entity: 'sensor.outdoor_temperature',
  },
  info: {
    entity: 'input_text.daily_quote',
  },
  fullscreen: false,
  use_area_pictures: false,
  downloaded_skins: [],
  devices: DEFAULT_DEVICES,
  rooms: DEFAULT_ROOMS,
  scenes: DEFAULT_SCENES,
  environment: DEFAULT_ENVIRONMENT,
  nav: DEFAULT_NAV,
  energy: {
    entity: 'sensor.energy_cost_today',
    unit: 'kWh',
    compare_text_zh: '较昨日',
    compare_text_en: 'vs yesterday',
  },
  media_player: {
    entity: '',
  },
  camera: {
    entity: '',
    preview_mode: 'live',
  },
  security: {
    cameras: [],
    entities: [],
    preview_mode: 'live',
  },
  devices_page: {
    hidden: [],
  },
  home_limits: {
    devices: 5,
    rooms: 4,
    scenes: 6,
    environment: 5,
  },
  home_selection: {
    devices: [],
    rooms: [],
    scenes: [],
    environment: [],
  },
};
