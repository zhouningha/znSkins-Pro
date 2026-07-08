import type {
  AreaRegistryEntry,
  DeviceRegistryEntry,
  EntityRegistryEntry,
  HomeAssistant,
  RoomConfig,
} from '../types';
import type { Language } from '../i18n';
import { DEFAULT_ROOMS, areaRoomImageKey } from '../config';
import { areaSummaryById } from './areas';

export function isDefaultRooms(rooms: RoomConfig[]): boolean {
  if (rooms.length !== DEFAULT_ROOMS.length) return false;
  return rooms.every((room, index) => {
    const fallback = DEFAULT_ROOMS[index];
    return fallback && room.image === fallback.image && room.info_entity === fallback.info_entity;
  });
}

export function getRoomsForRender(
  configRooms: RoomConfig[] | undefined,
  areas: AreaRegistryEntry[] | undefined,
): RoomConfig[] {
  const configuredRooms = configRooms || [];
  const hasCustomRooms = configuredRooms.length > 0 && !isDefaultRooms(configuredRooms);
  if (hasCustomRooms) return configuredRooms;

  if (areas && areas.length > 0) {
    return areas.map((area, index) => ({
      name: area.name,
      image: areaRoomImageKey(area.area_id || area.name, index, area.name),
    }));
  }

  return configuredRooms;
}

export function areaFallbackInfo(
  room: RoomConfig,
  areas: AreaRegistryEntry[] | undefined,
  hass: HomeAssistant | undefined,
  entityRegistry: EntityRegistryEntry[] | undefined,
  deviceRegistry: DeviceRegistryEntry[] | undefined,
  language: Language,
): string {
  const area = areas?.find((entry) => entry.name === (room.name || room.name_zh || room.name_en));
  if (!area) return 'Home Assistant Area';
  return areaSummaryById(area.area_id, hass, entityRegistry, deviceRegistry, language);
}
