import type { AreaRegistryEntry, DeviceRegistryEntry, EntityRegistryEntry, FloorRegistryEntry, HomeAssistant } from '../types';

export interface RegistryResult {
  areas: AreaRegistryEntry[];
  entities: EntityRegistryEntry[];
  devices: DeviceRegistryEntry[];
}

export async function loadAreas(hass: HomeAssistant): Promise<AreaRegistryEntry[]> {
  const connection = hass.connection;
  if (!connection?.sendMessagePromise) return [];
  try {
    const areas = await connection.sendMessagePromise<AreaRegistryEntry[]>({ type: 'config/area_registry/list' });
    return Array.isArray(areas)
      ? [...areas].sort((left, right) => left.name.localeCompare(right.name))
      : [];
  } catch {
    return [];
  }
}

export async function loadFloors(hass: HomeAssistant): Promise<FloorRegistryEntry[]> {
  const connection = hass.connection;
  if (!connection?.sendMessagePromise) return [];
  try {
    const floors = await connection.sendMessagePromise<FloorRegistryEntry[]>({ type: 'config/floor_registry/list' });
    if (!Array.isArray(floors)) return [];
    return [...floors].sort((a, b) => {
      const la = a.level ?? Number.MAX_SAFE_INTEGER;
      const lb = b.level ?? Number.MAX_SAFE_INTEGER;
      if (la !== lb) return la - lb;
      return (a.name || '').localeCompare(b.name || '');
    });
  } catch {
    return [];
  }
}

export async function loadEntityRegistry(hass: HomeAssistant): Promise<EntityRegistryEntry[]> {
  const connection = hass.connection;
  if (!connection?.sendMessagePromise) return [];
  try {
    const entities = await connection.sendMessagePromise<EntityRegistryEntry[]>({ type: 'config/entity_registry/list' });
    return Array.isArray(entities) ? entities : [];
  } catch {
    return [];
  }
}

export async function loadDeviceRegistry(hass: HomeAssistant): Promise<DeviceRegistryEntry[]> {
  const connection = hass.connection;
  if (!connection?.sendMessagePromise) return [];
  try {
    const devices = await connection.sendMessagePromise<DeviceRegistryEntry[]>({ type: 'config/device_registry/list' });
    return Array.isArray(devices) ? devices : [];
  } catch {
    return [];
  }
}