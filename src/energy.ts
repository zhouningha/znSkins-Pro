import type {
  DashboardConfig,
  EnergySourceData,
  EnergyPrefsResponse,
  HomeAssistant,
  StatisticsResponse,
  TranslationKey,
} from './types';
import { formatNumber } from './utils';

export async function fetchEnergySources(
  hass: HomeAssistant,
  config: DashboardConfig,
): Promise<{
  sources: EnergySourceData[];
  history: number[];
  yesterday: string | undefined;
}> {
  const empty = { sources: [] as EnergySourceData[], history: [] as number[], yesterday: undefined as string | undefined };

  const connection = hass.connection;
  if (!connection?.sendMessagePromise) return empty;

  const result = await tryGetEnergyPrefs(hass, config, 'energy/get_prefs');
  if (result) return result;

  const fallback = await tryGetEnergyPrefs(hass, config, 'energy/get_preferences');
  return fallback ?? empty;
}

async function tryGetEnergyPrefs(
  hass: HomeAssistant,
  config: DashboardConfig,
  command: string,
): Promise<{
  sources: EnergySourceData[];
  history: number[];
  yesterday: string | undefined;
} | null> {
  const connection = hass.connection;
  if (!connection?.sendMessagePromise) return null;

  try {
    const prefs = await connection.sendMessagePromise<EnergyPrefsResponse>({ type: command });
    if (!prefs?.energy_sources?.length) return null;

    const gridEntity = config?.energy?.entity;
    const energyUnit = config?.energy?.unit || 'kWh';
    const ids: string[] = [];
    const entries: Array<{ key: TranslationKey; entityId: string; icon: string; unit: string }> = [];
    const added = new Set<string>();

    for (const src of prefs.energy_sources) {
      if (src.type === 'grid') {
        if (src.flow_from || src.flow_to) {
          for (const f of src.flow_from ?? []) {
            if (f.stat_energy_from && !added.has(f.stat_energy_from)) {
              added.add(f.stat_energy_from); ids.push(f.stat_energy_from);
              entries.push({ key: 'todayEnergy', entityId: f.stat_energy_from, icon: 'mdi:lightning-bolt', unit: 'kWh' });
            }
          }
          for (const f of src.flow_to ?? []) {
            if (f.stat_energy_to && !added.has(f.stat_energy_to)) {
              added.add(f.stat_energy_to); ids.push(f.stat_energy_to);
              entries.push({ key: 'gridReturn', entityId: f.stat_energy_to, icon: 'mdi:export-variant', unit: 'kWh' });
            }
          }
        } else {
          if (src.stat_energy_from && !added.has(src.stat_energy_from)) {
            added.add(src.stat_energy_from); ids.push(src.stat_energy_from);
            entries.push({ key: 'todayEnergy', entityId: src.stat_energy_from, icon: 'mdi:lightning-bolt', unit: 'kWh' });
          }
          if (src.stat_energy_to && !added.has(src.stat_energy_to)) {
            added.add(src.stat_energy_to); ids.push(src.stat_energy_to);
            entries.push({ key: 'gridReturn', entityId: src.stat_energy_to, icon: 'mdi:export-variant', unit: 'kWh' });
          }
        }
      } else if (src.type === 'solar' && src.stat_energy_from && !added.has(src.stat_energy_from)) {
        added.add(src.stat_energy_from); ids.push(src.stat_energy_from);
        entries.push({ key: 'solar', entityId: src.stat_energy_from, icon: 'mdi:solar-power', unit: 'kWh' });
      } else if (src.type === 'battery') {
        if (src.stat_energy_from && !added.has(src.stat_energy_from)) {
          added.add(src.stat_energy_from); ids.push(src.stat_energy_from);
          entries.push({ key: 'battery', entityId: src.stat_energy_from, icon: 'mdi:battery', unit: 'kWh' });
        }
        if (src.stat_energy_to && !added.has(src.stat_energy_to)) {
          added.add(src.stat_energy_to); ids.push(src.stat_energy_to);
          entries.push({ key: 'battery', entityId: src.stat_energy_to, icon: 'mdi:battery-charging', unit: 'kWh' });
        }
      } else if (src.type === 'gas' && src.stat_energy_from && !added.has(src.stat_energy_from)) {
        added.add(src.stat_energy_from); ids.push(src.stat_energy_from);
        entries.push({ key: 'gas', entityId: src.stat_energy_from, icon: 'mdi:fire', unit: 'm³' });
      } else if (src.type === 'water' && src.stat_energy_from && !added.has(src.stat_energy_from)) {
        added.add(src.stat_energy_from); ids.push(src.stat_energy_from);
        entries.push({ key: 'water', entityId: src.stat_energy_from, icon: 'mdi:water', unit: 'm³' });
      }
    }

    if (gridEntity && !added.has(gridEntity)) {
      ids.unshift(gridEntity);
      entries.unshift({ key: 'todayEnergy', entityId: gridEntity, icon: 'mdi:lightning-bolt', unit: energyUnit });
    }

    if (entries.length === 0) return null;

    const now = new Date();
    const start = new Date(now);
    start.setDate(start.getDate() - 30);
    start.setHours(0, 0, 0, 0);

    let stats: StatisticsResponse = {};
    try {
      stats = await connection.sendMessagePromise<StatisticsResponse>({
        type: 'recorder/statistics_during_period',
        start_time: start.toISOString(),
        end_time: now.toISOString(),
        types: ['change'],
        statistic_ids: ids,
        period: 'day',
      });
    } catch {
      // statistics unavailable
    }

    const sources: EnergySourceData[] = entries.map((e) => {
      const raw = stats[e.entityId] ?? [];
      const history = raw.map((entry) => {
        if (entry.change !== null && entry.change !== undefined) return Math.round(entry.change * 100) / 100;
        if (entry.sum !== null && entry.sum !== undefined) return Math.round(entry.sum * 100) / 100;
        if (entry.state !== null && entry.state !== undefined) return Math.round(entry.state * 100) / 100;
        return 0;
      });
      const yesterdayVal = history.length >= 2 ? history[history.length - 2] : (history.length === 1 ? history[0] : undefined);
      const latest = history.length > 0 ? history[history.length - 1] : undefined;
      return {
        key: e.key,
        entityId: e.entityId,
        icon: e.icon,
        unit: (hass.states[e.entityId]?.attributes?.unit_of_measurement as string) || e.unit,
        history,
        yesterday: yesterdayVal !== undefined ? formatNumber(String(yesterdayVal), 1) : undefined,
        today: latest !== undefined ? formatNumber(String(latest), 1) : '--',
      };
    });

    const combinedHistory: number[] = [];
    let yesterdaySum = 0;
    let yesterdayCount = 0;
    for (const src of sources) {
      for (let i = 0; i < src.history.length; i++) {
        combinedHistory[i] = (combinedHistory[i] || 0) + src.history[i]!;
      }
      if (src.history.length >= 2) {
        yesterdaySum += src.history[src.history.length - 2]!;
        yesterdayCount++;
      } else if (src.history.length === 1) {
        yesterdaySum += src.history[0]!;
        yesterdayCount++;
      }
    }

    return {
      sources,
      history: combinedHistory,
      yesterday: yesterdayCount > 0 ? formatNumber(String(yesterdaySum), 1) : undefined,
    };
  } catch {
    return null;
  }
}

export async function fetchEnergyHistory(
  hass: HomeAssistant,
  config: DashboardConfig,
): Promise<{
  history: number[];
  yesterday: string | undefined;
}> {
  const entityId = config?.energy?.entity;
  if (!entityId || !hass.connection?.sendMessagePromise) {
    return { history: [], yesterday: undefined };
  }

  const now = new Date();
  const start = new Date(now);
  start.setDate(start.getDate() - 30);
  start.setHours(0, 0, 0, 0);

  try {
    const data = await hass.connection.sendMessagePromise<StatisticsResponse>({
      type: 'recorder/statistics_during_period',
      start_time: start.toISOString(),
      end_time: now.toISOString(),
      types: ['change'],
      statistic_ids: [entityId],
      period: 'day',
    });
    const stats = data[entityId] ?? [];
    const daily: number[] = stats.map((entry) => {
      if (entry.change !== null && entry.change !== undefined) return Math.round(entry.change * 100) / 100;
      if (entry.sum !== null && entry.sum !== undefined) return Math.round(entry.sum * 100) / 100;
      if (entry.state !== null && entry.state !== undefined) return Math.round(entry.state * 100) / 100;
      return 0;
    });
    const yesterdayVal = daily.length >= 2 ? daily[daily.length - 2] : (daily.length === 1 ? daily[0] : undefined);
    return {
      history: daily,
      yesterday: yesterdayVal !== undefined ? formatNumber(String(yesterdayVal), 1) : undefined,
    };
  } catch {
    return { history: [], yesterday: undefined };
  }
}