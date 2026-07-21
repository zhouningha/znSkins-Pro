import { html } from 'lit';
import type { TemplateResult } from 'lit';

import type {
  AreaRegistryEntry,
  DeviceRegistryEntry,
  EntityRegistryEntry,
  EnvironmentMetricConfig,
  HomeAssistant,
} from '../types';
import type { Language } from '../i18n';
import type { RenderContext } from '../render/context';
import { stateValue, t } from '../utils';

const ORPHAN_AREA_ID = '__others__';

/**
 * Home environment list — click **room/area** chips to switch.
 * Chip order + sensors within a room follow editor `home_selection.environment` ↑↓
 * (first sensor that belongs to a room decides that room's tab position).
 */
export function renderEnvironment(ctx: RenderContext): TemplateResult[] {
  const {
    config,
    hass,
    areas,
    entityRegistry,
    deviceRegistry,
    language,
    selectedEnvFloor: selectedEnvArea,
    setSelectedEnvFloor: setSelectedEnvArea,
  } = ctx;

  const selectedMetrics = config.home_selection?.environment || [];
  const configuredMetrics = config.environment || [];
  const limit = config.home_limits?.environment || 12;
  const allMetrics = (selectedMetrics.length > 0
    ? selectedMetrics.map((entityId) => metricFromEntity(hass, entityId, configuredMetrics))
    : configuredMetrics);

  const grouped = groupMetricsByArea(allMetrics, areas, entityRegistry, deviceRegistry);
  if (!grouped) {
    return allMetrics.slice(0, limit).map((metric) => renderEnvRow(hass, metric, language));
  }

  const { byArea, occupiedAreas, orphanMetrics } = grouped;
  const tabs: Array<{ id: string; name: string }> = occupiedAreas.map((a) => ({
    id: a.area_id,
    name: a.name,
  }));
  if (orphanMetrics.length > 0) {
    tabs.push({ id: ORPHAN_AREA_ID, name: t(language, 'groupOthers') });
  }

  if (tabs.length <= 1) {
    const only = tabs[0]
      ? (tabs[0].id === ORPHAN_AREA_ID ? orphanMetrics : (byArea.get(tabs[0].id) || []))
      : allMetrics;
    return only.slice(0, limit).map((metric) => renderEnvRow(hass, metric, language));
  }

  const activeId = tabs.some((tab) => tab.id === selectedEnvArea)
    ? selectedEnvArea
    : tabs[0]!.id;

  const activeMetrics = activeId === ORPHAN_AREA_ID
    ? orphanMetrics
    : (byArea.get(activeId) || []);

  return [
    html`
      <div class="env-floor-tabs" role="tablist">
        ${tabs.map((tab) => html`
          <button
            type="button"
            class="chip${tab.id === activeId ? ' active' : ''}"
            role="tab"
            aria-selected=${tab.id === activeId ? 'true' : 'false'}
            @click=${() => setSelectedEnvArea(tab.id)}
          >${tab.name}</button>
        `)}
      </div>
    `,
    ...activeMetrics.slice(0, limit).map((metric) => renderEnvRow(hass, metric, language)),
  ];
}

function metricFromEntity(
  hass: HomeAssistant,
  entityId: string,
  configuredMetrics: EnvironmentMetricConfig[],
): EnvironmentMetricConfig {
  const configured = configuredMetrics.find((metric) => metric.entity === entityId);
  if (configured) return configured;

  const state = hass.states[entityId];
  const deviceClass = String(state?.attributes?.device_class || '').toLowerCase();
  const label = String(state?.attributes?.friendly_name || entityId);
  const unit = String(state?.attributes?.unit_of_measurement || '');
  const variant: EnvironmentMetricConfig['variant'] = deviceClass === 'temperature' ? 'temp' : (deviceClass === 'humidity' ? 'hum' : 'pm');
  const icon = variant === 'temp' ? 'mdi:thermometer' : (variant === 'hum' ? 'mdi:water-percent' : 'mdi:leaf');
  return { entity: entityId, label, unit, variant, icon };
}

function groupMetricsByArea(
  metrics: EnvironmentMetricConfig[],
  areas: AreaRegistryEntry[] | undefined,
  entityRegistry: EntityRegistryEntry[] | undefined,
  deviceRegistry: DeviceRegistryEntry[] | undefined,
): {
  byArea: Map<string, EnvironmentMetricConfig[]>;
  occupiedAreas: AreaRegistryEntry[];
  orphanMetrics: EnvironmentMetricConfig[];
} | null {
  if (!areas || areas.length < 1 || !entityRegistry) return null;

  const areaById = new Map(areas.map((a) => [a.area_id, a]));
  const entityAreaLookup = new Map<string, string>();
  for (const entry of entityRegistry) {
    if (entry.hidden_by || entry.disabled_by) continue;
    const directAreaId = entry.area_id || undefined;
    const areaId = directAreaId || deviceRegistry?.find((d) => d.id === entry.device_id)?.area_id || undefined;
    if (areaId && areaById.has(areaId)) {
      entityAreaLookup.set(entry.entity_id, areaId);
    }
  }

  const byArea = new Map<string, EnvironmentMetricConfig[]>();
  const orphanMetrics: EnvironmentMetricConfig[] = [];
  const areaOrder: string[] = [];
  for (const metric of metrics) {
    const areaId = entityAreaLookup.get(metric.entity);
    if (areaId) {
      const list = byArea.get(areaId) || [];
      if (list.length === 0) areaOrder.push(areaId);
      list.push(metric);
      byArea.set(areaId, list);
    } else {
      orphanMetrics.push(metric);
    }
  }

  // Tab order = first appearance in editor selection, not area-name alphabet.
  const occupiedAreas = areaOrder
    .map((id) => areaById.get(id))
    .filter((area): area is AreaRegistryEntry => Boolean(area));
  if (occupiedAreas.length === 0 && orphanMetrics.length === 0) return null;
  return { byArea, occupiedAreas, orphanMetrics };
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
