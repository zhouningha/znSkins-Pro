import type {
  DashboardConfig,
  EnergySourceData,
  EnergyPrefsResponse,
  HomeAssistant,
  StatisticsResponse,
} from './types';
import type { TranslationKey } from './types';
import { formatNumber } from './utils';

/** Pick an icon for an HA energy "individual device" from its friendly name. */
function energyDeviceIcon(name: string): string {
  const n = (name || '').toLowerCase();
  if (/空调|air|冷气|aircon|climate/.test(n)) return 'mdi:air-conditioner';
  if (/插座|socket|outlet|插排|排插/.test(n)) return 'mdi:power-socket-cn';
  if (/照明|灯|light|lamp/.test(n)) return 'mdi:lightbulb-group';
  if (/机柜|服务器|server|rack|nas|网络|路由/.test(n)) return 'mdi:server';
  if (/厨|kitchen|stove|oven/.test(n)) return 'mdi:stove';
  if (/热水|water heater|地暖|采暖|heat/.test(n)) return 'mdi:water-boiler';
  if (/充电|charger|ev\b/.test(n)) return 'mdi:ev-station';
  if (/冰箱|fridge|refriger/.test(n)) return 'mdi:fridge';
  return 'mdi:flash';
}

export async function fetchEnergySources(
  hass: HomeAssistant,
  config: DashboardConfig,
): Promise<{
  sources: EnergySourceData[];
  history: number[];
  yesterday: string | undefined;
  monthToDate: string | undefined;
  todayTotal: string | undefined;
}> {
  const empty = {
    sources: [] as EnergySourceData[],
    history: [] as number[],
    yesterday: undefined as string | undefined,
    monthToDate: undefined as string | undefined,
    todayTotal: undefined as string | undefined,
  };

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
  monthToDate: string | undefined;
  todayTotal: string | undefined;
} | null> {
  const connection = hass.connection;
  if (!connection?.sendMessagePromise) return null;

  try {
    const prefs = await connection.sendMessagePromise<EnergyPrefsResponse>({ type: command });
    if (!prefs?.energy_sources?.length && !prefs?.device_consumption?.length) return null;

    const gridEntity = config?.energy?.entity;
    const energyUnit = config?.energy?.unit || 'kWh';
    const ids: string[] = [];
    const entries: Array<{ key: TranslationKey; entityId: string; icon: string; unit: string; label?: string }> = [];
    const added = new Set<string>();

    for (const src of prefs.energy_sources ?? []) {
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

    // HA Energy dashboard "individual devices" — shown as per-device bars.
    for (const dev of prefs.device_consumption ?? []) {
      const entityId = dev?.stat_consumption;
      if (!entityId || added.has(entityId)) continue;
      added.add(entityId); ids.push(entityId);
      const friendly = (hass.states[entityId]?.attributes?.friendly_name as string) || entityId;
      const label = friendly
        .replace(/总电量累计|电量累计|总电量|用电量|能耗|电量/g, '')
        .trim() || friendly;
      entries.push({ key: 'todayEnergy', entityId, icon: energyDeviceIcon(friendly), unit: 'kWh', label });
    }

    if (entries.length === 0) return null;

    const now = new Date();
    const start = new Date(now);
    start.setDate(start.getDate() - 30);
    start.setHours(0, 0, 0, 0);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
    if (monthStart.getTime() < start.getTime()) start.setTime(monthStart.getTime());

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
        label: e.label,
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

    const monthStartMs = monthStart.getTime();
    let monthSum = 0;
    let monthHasData = false;
    for (const e of entries) {
      for (const entry of stats[e.entityId] ?? []) {
        const ts = entry.start === undefined ? NaN : new Date(entry.start).getTime();
        if (!Number.isFinite(ts) || ts < monthStartMs) continue;
        const v = entry.change ?? entry.sum ?? entry.state;
        if (v === null || v === undefined) continue;
        monthSum += v;
        monthHasData = true;
      }
    }

    let todaySum = 0;
    let todayCount = 0;
    for (const src of sources) {
      const t = parseFloat(src.today);
      if (Number.isFinite(t)) {
        todaySum += t;
        todayCount++;
      }
    }

    return {
      sources,
      history: combinedHistory,
      yesterday: yesterdayCount > 0 ? formatNumber(String(yesterdaySum), 1) : undefined,
      monthToDate: monthHasData ? formatNumber(String(monthSum), 1) : undefined,
      todayTotal: todayCount > 0 ? formatNumber(String(todaySum), 1) : undefined,
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