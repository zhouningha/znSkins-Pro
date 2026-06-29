import type { HomeAssistant, MaintenanceItem } from './types';

const NON_BATTERY_UNITS = new Set([
  'v', 'mv', 'kv', 'volt', 'volts',
  '°c', 'c', '°f', 'f', 'k',
  'a', 'ma', 'w', 'kw', 'wh', 'kwh',
  'db', 'dbm', 'lux', 'lx', 'ppm', 'µg/m³',
]);

const NON_BATTERY_DEVICE_CLASSES = new Set([
  'voltage', 'temperature', 'current', 'power', 'energy', 'illuminance', 'humidity',
]);

function isValidBatteryPercent(value: number, unit: string, deviceClass: string): boolean {
  if (!Number.isFinite(value) || value < 0 || value > 100) return false;
  if (NON_BATTERY_DEVICE_CLASSES.has(deviceClass)) return false;
  if (NON_BATTERY_UNITS.has(unit.toLowerCase().trim())) return false;
  return true;
}

export function getMaintenanceItems(hass: HomeAssistant | undefined): MaintenanceItem[] {
  if (!hass) return [];

  const items: MaintenanceItem[] = [];
  const added = new Set<string>();

  for (const entity of Object.values(hass.states)) {
    if (!entity || added.has(entity.entity_id)) continue;

    const friendlyName = String(entity.attributes?.friendly_name || entity.entity_id);
    const deviceClass = String(entity.attributes?.device_class || '').toLowerCase();
    const unit = String(entity.attributes?.unit_of_measurement || '');

    let value: number | null = null;

    if (deviceClass === 'battery') {
      const v = Number(entity.state);
      if (isValidBatteryPercent(v, unit, deviceClass)) {
        value = v;
      }
    }

    if (value === null) {
      const attrBattery = Number(entity.attributes?.battery_level);
      if (Number.isFinite(attrBattery) && isValidBatteryPercent(attrBattery, '%', deviceClass)) {
        value = attrBattery;
      }
    }

    if (value === null && entity.entity_id.startsWith('sensor.') && /battery/i.test(entity.entity_id)) {
      if (!/voltage|_temp|temperature|_current|_power|signal|rf_link/i.test(entity.entity_id)) {
        const v = Number(entity.state);
        if (isValidBatteryPercent(v, unit, deviceClass)) {
          value = v;
        }
      }
    }

    if (value !== null && value > 0 && value <= 20) {
      added.add(entity.entity_id);
      items.push({
        name: friendlyName,
        battery: Math.round(value),
        level: value <= 10 ? 'error' : 'warning',
      });
    }
  }

  const seen = new Set<string>();
  return items.filter((item) => {
    const key = `${item.name}|${item.battery}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}