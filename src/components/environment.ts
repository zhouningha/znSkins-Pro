import { html } from 'lit';
import type { TemplateResult } from 'lit';

import type {
  AreaRegistryEntry,
  DashboardConfig,
  DeviceRegistryEntry,
  EntityRegistryEntry,
  EnvironmentMetricConfig,
  FloorRegistryEntry,
  HomeAssistant,
} from '../types';
import type { Language } from '../i18n';
import { stateValue, t } from '../utils';

export function renderEnvironment(
  config: DashboardConfig,
  hass: HomeAssistant,
  areas: AreaRegistryEntry[] | undefined,
  entityRegistry: EntityRegistryEntry[] | undefined,
  deviceRegistry: DeviceRegistryEntry[] | undefined,
  floors: FloorRegistryEntry[] | undefined,
  language: Language,
): TemplateResult[] {
  const selectedMetrics = config.home_selection?.environment || [];
  const configuredMetrics = config.environment || [];
  // Order follows home_selection.environment (editor ↑↓ controls this list).
  const metrics = (selectedMetrics.length > 0
    ? selectedMetrics.map((entityId) => {
      const configured = configuredMetrics.find((metric) => metric.entity === entityId);
      if (configured) return configured;

      const state = hass.states[entityId];
      const deviceClass = String(state?.attributes?.device_class || '').toLowerCase();
      const label = String(state?.attributes?.friendly_name || entityId);
      const unit = String(state?.attributes?.unit_of_measurement || '');
      const variant: EnvironmentMetricConfig['variant'] = deviceClass === 'temperature' ? 'temp' : (deviceClass === 'humidity' ? 'hum' : 'pm');
      const icon = variant === 'temp' ? 'mdi:thermometer' : (variant === 'hum' ? 'mdi:water-percent' : 'mdi:leaf');
      return { entity: entityId, label, unit, variant, icon };
    })
    : configuredMetrics).slice(0, config.home_limits?.environment || 5);

  if (floors && floors.length > 1 && entityRegistry && areas) {
    const areaFloorLookup = new Map<string, string>();
    for (const area of areas) {
      const fid = (area as AreaRegistryEntry & { floor_id?: string | null }).floor_id;
      if (fid) areaFloorLookup.set(area.area_id, fid);
    }
    const entityFloorLookup = new Map<string, string>();
    for (const entry of entityRegistry) {
      if (entry.hidden_by || entry.disabled_by) continue;
      const directAreaId = entry.area_id || undefined;
      const areaId = directAreaId || deviceRegistry?.find((d) => d.id === entry.device_id)?.area_id || undefined;
      if (areaId && areaFloorLookup.has(areaId)) {
        entityFloorLookup.set(entry.entity_id, areaFloorLookup.get(areaId)!);
      }
    }
    const byFloor = new Map<string, EnvironmentMetricConfig[]>();
    const orphanMetrics: EnvironmentMetricConfig[] = [];
    for (const metric of metrics) {
      const floorId = entityFloorLookup.get(metric.entity);
      if (floorId) {
        const list = byFloor.get(floorId) || [];
        list.push(metric);
        byFloor.set(floorId, list);
      } else {
        orphanMetrics.push(metric);
      }
    }
    const rows: TemplateResult[] = [];
    for (const floor of floors) {
      const floorMetrics = byFloor.get(floor.floor_id);
      if (!floorMetrics || floorMetrics.length === 0) continue;
      rows.push(html`<div class="env-floor-header">${floor.name}</div>`);
      for (const metric of floorMetrics) {
        rows.push(renderEnvRow(hass, metric, language));
      }
    }
    if (orphanMetrics.length > 0) {
      rows.push(html`<div class="env-floor-header">${t(language, 'groupOthers')}</div>`);
      for (const metric of orphanMetrics) {
        rows.push(renderEnvRow(hass, metric, language));
      }
    }
    return rows;
  }

  return metrics.map((metric) => renderEnvRow(hass, metric, language));
}

function renderEnvRow(hass: HomeAssistant, metric: EnvironmentMetricConfig, language: Language): TemplateResult {
  return html`
    <div class="env-row">
      <div class="dot ${metric.variant || 'temp'}"><ha-icon icon=${metric.icon || 'mdi:circle'}></ha-icon></div>
      <div class="muted">${hass.states[metric.entity]?.attributes?.friendly_name || metric.label || metric.entity}</div>
      <div class="env-value">${stateValue(hass, metric.entity, language) || '--'}${metric.unit || ''}</div>
    </div>
  `;
}
