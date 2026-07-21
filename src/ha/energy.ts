import type {
  AreaRegistryEntry,
  DashboardConfig,
  DeviceRegistryEntry,
  EnergySourceData,
  EnergyPrefsResponse,
  EntityRegistryEntry,
  FloorRegistryEntry,
  HomeAssistant,
  StatisticsResponse,
} from '../types';
import type { TranslationKey } from '../types';
import { formatNumber } from '../utils';

export interface EnergyRegistryContext {
  areas?: AreaRegistryEntry[];
  floors?: FloorRegistryEntry[];
  entityRegistry?: EntityRegistryEntry[];
  deviceRegistry?: DeviceRegistryEntry[];
}

/** Pick an icon for an HA energy "individual device" from its friendly name (GoW-era baseline). */
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
  if (/电表|meter|dian_biao|炬为|总能量|总表|合计/.test(n)) return 'mdi:meter-electric';
  return 'mdi:flash';
}

/** Strip cumulative suffixes so cards read as「2楼空调」not「2楼空调总电量累计」. */
function cleanEnergyLabel(friendly: string): string {
  let s = friendly
    .replace(/WiFi联网远控电表\([^)]*\)/gi, '电表')
    .replace(/通道电量计量模块[^\s]*/g, '电量模块')
    .replace(/\s+/g, ' ')
    .trim();

  // Whole-meter names:「2楼总电量累计」→「2楼总」； device:「2楼空调总电量累计」→「2楼空调」
  if (/(总电量累计|总电量)$/.test(s)) {
    const base = s.replace(/(总电量累计|总电量)$/, '').trim();
    if (!base) return '总表';
    if (!/(空调|插座|照明|机柜|灯|厨|冷气|排插)/.test(base)) {
      return /总$/.test(base) ? base : `${base}总`;
    }
    return base;
  }
  if (/^(总能量|Total Energy)$/i.test(s)) return '';

  s = s
    .replace(/电量累计|累计电量/g, '')
    .replace(/用电量|能耗|总能量/g, '')
    .replace(/合计电量|电量$/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  return s;
}

function resolveEntityMeta(
  entityId: string,
  hass: HomeAssistant,
  registries?: EnergyRegistryContext,
): { label: string; icon: string; floorName?: string; areaName?: string; locationLabel?: string } {
  const entry = registries?.entityRegistry?.find((item) => item.entity_id === entityId);
  const device = entry?.device_id
    ? registries?.deviceRegistry?.find((item) => item.id === entry.device_id)
    : undefined;
  const friendly = String(
    hass.states[entityId]?.attributes?.friendly_name
    || entry?.name
    || entry?.original_name
    || '',
  );
  let label = cleanEnergyLabel(friendly);
  if (!label || label === '总能量' || /^ch[_\s]?\d/i.test(label) || /^total energy$/i.test(friendly)) {
    const deviceName = String(device?.name_by_user || device?.name || '').trim();
    if (deviceName) label = cleanEnergyLabel(deviceName);
  }
  if (!label) label = entityId.split('.').pop() || entityId;

  const location = resolveEntityLocation(entityId, registries);
  return {
    label,
    icon: energyDeviceIcon(`${friendly} ${label} ${device?.name || ''}`),
    ...location,
  };
}

function resolveEntityLocation(
  entityId: string,
  registries?: EnergyRegistryContext,
): { floorName?: string; areaName?: string; locationLabel?: string } {
  if (!registries) return {};
  const entry = registries.entityRegistry?.find((item) => item.entity_id === entityId);
  let areaId = entry?.area_id || undefined;
  if (!areaId && entry?.device_id) {
    const device = registries.deviceRegistry?.find((item) => item.id === entry.device_id);
    areaId = device?.area_id || undefined;
  }
  if (!areaId) return {};

  const area = registries.areas?.find((item) => item.area_id === areaId || (item as { id?: string }).id === areaId);
  if (!area) return {};
  const floor = area.floor_id
    ? registries.floors?.find((item) => item.floor_id === area.floor_id)
    : undefined;
  const floorName = floor?.name || undefined;
  const areaName = area.name || undefined;
  const locationLabel = [floorName, areaName].filter(Boolean).join(' · ') || undefined;
  return { floorName, areaName, locationLabel };
}

function pickLocation(meta: { floorName?: string; areaName?: string; locationLabel?: string }) {
  return {
    floorName: meta.floorName,
    areaName: meta.areaName,
    locationLabel: meta.locationLabel,
  };
}

/** Linked utility_meter entity ids for a Riemann/energy source (HA helper naming). */
function relatedUtilityMeterIds(sourceEntityId: string): { daily?: string; weekly?: string; monthly?: string } {
  if (!sourceEntityId.endsWith('_yong_dian_liang')) return {};
  const stem = sourceEntityId.slice(0, -'_yong_dian_liang'.length);
  return {
    daily: `${stem}_jin_ri`,
    weekly: `${stem}_ben_zhou`,
    monthly: `${stem}_ben_yue`,
  };
}

function readMeterState(hass: HomeAssistant, entityId?: string): string | undefined {
  if (!entityId) return undefined;
  const raw = hass.states[entityId]?.state;
  if (raw === undefined || raw === 'unknown' || raw === 'unavailable') return undefined;
  const n = parseFloat(raw);
  if (!Number.isFinite(n)) return undefined;
  return formatNumber(String(n), 1);
}

function periodValueFromStats(
  entries: Array<{ start?: string; change?: number | null; sum?: number | null; state?: number | null }>,
  periodStartMs: number,
): number | undefined {
  let sum = 0;
  let has = false;
  for (const entry of entries) {
    const ts = entry.start === undefined ? NaN : new Date(entry.start).getTime();
    if (!Number.isFinite(ts) || ts < periodStartMs) continue;
    const v = entry.change ?? entry.sum ?? entry.state;
    if (v === null || v === undefined) continue;
    sum += v;
    has = true;
  }
  return has ? sum : undefined;
}

/** Monday 00:00 local of the current week. */
function startOfWeek(now: Date): Date {
  const d = new Date(now);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay(); // 0=Sun
  const diff = day === 0 ? 6 : day - 1;
  d.setDate(d.getDate() - diff);
  return d;
}

export async function fetchEnergySources(
  hass: HomeAssistant,
  config: DashboardConfig,
  registries?: EnergyRegistryContext,
): Promise<{
  sources: EnergySourceData[];
  history: number[];
  yesterday: string | undefined;
  monthToDate: string | undefined;
  weekToDate: string | undefined;
  todayTotal: string | undefined;
}> {
  const empty = {
    sources: [] as EnergySourceData[],
    history: [] as number[],
    yesterday: undefined as string | undefined,
    monthToDate: undefined as string | undefined,
    weekToDate: undefined as string | undefined,
    todayTotal: undefined as string | undefined,
  };

  const connection = hass.connection;
  if (!connection?.sendMessagePromise) return empty;

  const result = await tryGetEnergyPrefs(hass, config, 'energy/get_prefs', registries);
  if (result) return result;

  const fallback = await tryGetEnergyPrefs(hass, config, 'energy/get_preferences', registries);
  return fallback ?? empty;
}

async function tryGetEnergyPrefs(
  hass: HomeAssistant,
  config: DashboardConfig,
  command: string,
  registries?: EnergyRegistryContext,
): Promise<{
  sources: EnergySourceData[];
  history: number[];
  yesterday: string | undefined;
  monthToDate: string | undefined;
  weekToDate: string | undefined;
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
    const entries: Array<{
      key: TranslationKey;
      entityId: string;
      icon: string;
      unit: string;
      label?: string;
      floorName?: string;
      areaName?: string;
      locationLabel?: string;
      isDevice?: boolean;
    }> = [];
    const added = new Set<string>();

    const hasDeviceConsumption = (prefs.device_consumption?.length ?? 0) > 0;

    for (const src of prefs.energy_sources ?? []) {
      // When individual devices are configured, skip grid meters on the energy page —
      // they duplicate the top total + per-circuit cards (e.g.「2楼总」≈ 分路之和).
      if (hasDeviceConsumption && src.type === 'grid') continue;
      if (src.type === 'grid') {
        if (src.flow_from || src.flow_to) {
          for (const f of src.flow_from ?? []) {
            if (f.stat_energy_from && !added.has(f.stat_energy_from)) {
              added.add(f.stat_energy_from); ids.push(f.stat_energy_from);
              const meta = resolveEntityMeta(f.stat_energy_from, hass, registries);
              entries.push({
                key: 'todayEnergy',
                entityId: f.stat_energy_from,
                icon: meta.icon || 'mdi:transmission-tower',
                unit: 'kWh',
                label: meta.label || '电网',
                ...pickLocation(meta),
              });
            }
          }
          for (const f of src.flow_to ?? []) {
            if (f.stat_energy_to && !added.has(f.stat_energy_to)) {
              added.add(f.stat_energy_to); ids.push(f.stat_energy_to);
              const meta = resolveEntityMeta(f.stat_energy_to, hass, registries);
              entries.push({
                key: 'gridReturn',
                entityId: f.stat_energy_to,
                icon: 'mdi:export-variant',
                unit: 'kWh',
                label: meta.label,
                ...pickLocation(meta),
              });
            }
          }
        } else {
          if (src.stat_energy_from && !added.has(src.stat_energy_from)) {
            added.add(src.stat_energy_from); ids.push(src.stat_energy_from);
            const meta = resolveEntityMeta(src.stat_energy_from, hass, registries);
            entries.push({
              key: 'todayEnergy',
              entityId: src.stat_energy_from,
              icon: meta.icon || 'mdi:transmission-tower',
              unit: 'kWh',
              label: meta.label || '电网',
              ...pickLocation(meta),
            });
          }
          if (src.stat_energy_to && !added.has(src.stat_energy_to)) {
            added.add(src.stat_energy_to); ids.push(src.stat_energy_to);
            const meta = resolveEntityMeta(src.stat_energy_to, hass, registries);
            entries.push({
              key: 'gridReturn',
              entityId: src.stat_energy_to,
              icon: 'mdi:export-variant',
              unit: 'kWh',
              label: meta.label,
              ...pickLocation(meta),
            });
          }
        }
      } else if (src.type === 'solar' && src.stat_energy_from && !added.has(src.stat_energy_from)) {
        added.add(src.stat_energy_from); ids.push(src.stat_energy_from);
        const meta = resolveEntityMeta(src.stat_energy_from, hass, registries);
        entries.push({ key: 'solar', entityId: src.stat_energy_from, icon: 'mdi:solar-power', unit: 'kWh', label: meta.label, ...pickLocation(meta) });
      } else if (src.type === 'battery') {
        if (src.stat_energy_from && !added.has(src.stat_energy_from)) {
          added.add(src.stat_energy_from); ids.push(src.stat_energy_from);
          const meta = resolveEntityMeta(src.stat_energy_from, hass, registries);
          entries.push({ key: 'battery', entityId: src.stat_energy_from, icon: 'mdi:battery', unit: 'kWh', label: meta.label, ...pickLocation(meta) });
        }
        if (src.stat_energy_to && !added.has(src.stat_energy_to)) {
          added.add(src.stat_energy_to); ids.push(src.stat_energy_to);
          const meta = resolveEntityMeta(src.stat_energy_to, hass, registries);
          entries.push({ key: 'battery', entityId: src.stat_energy_to, icon: 'mdi:battery-charging', unit: 'kWh', label: meta.label, ...pickLocation(meta) });
        }
      } else if (src.type === 'gas' && src.stat_energy_from && !added.has(src.stat_energy_from)) {
        added.add(src.stat_energy_from); ids.push(src.stat_energy_from);
        const meta = resolveEntityMeta(src.stat_energy_from, hass, registries);
        entries.push({ key: 'gas', entityId: src.stat_energy_from, icon: 'mdi:fire', unit: 'm³', label: meta.label, ...pickLocation(meta) });
      } else if (src.type === 'water' && src.stat_energy_from && !added.has(src.stat_energy_from)) {
        added.add(src.stat_energy_from); ids.push(src.stat_energy_from);
        const meta = resolveEntityMeta(src.stat_energy_from, hass, registries);
        entries.push({ key: 'water', entityId: src.stat_energy_from, icon: 'mdi:water', unit: 'm³', label: meta.label, ...pickLocation(meta) });
      }
    }

    // Homepage summary entity only — do not add as energy-page card when prefs already list sources/devices
    // (avoids duplicate「今日用电」from 6_chs_sum alongside per-channel devices).
    const hasPrefsCards = entries.length > 0 || (prefs.device_consumption?.length ?? 0) > 0;
    if (gridEntity && !added.has(gridEntity) && !hasPrefsCards) {
      ids.unshift(gridEntity);
      const meta = resolveEntityMeta(gridEntity, hass, registries);
      entries.unshift({
        key: 'todayEnergy',
        entityId: gridEntity,
        icon: meta.icon || 'mdi:lightning-bolt',
        unit: energyUnit,
        label: meta.label,
        ...pickLocation(meta),
      });
    }

    // HA Energy → Individual devices (插座/空调/照明… by friendly name)
    for (const device of prefs.device_consumption ?? []) {
      const entityId = String(device.stat_consumption || '').trim();
      if (!entityId || added.has(entityId)) continue;
      added.add(entityId);
      ids.push(entityId);
      const meta = resolveEntityMeta(entityId, hass, registries);
      entries.push({
        key: 'todayEnergy',
        entityId,
        icon: meta.icon,
        unit: 'kWh',
        label: meta.label,
        isDevice: true,
        ...pickLocation(meta),
      });
    }

    if (entries.length === 0) return null;

    const now = new Date();
    const start = new Date(now);
    start.setDate(start.getDate() - 30);
    start.setHours(0, 0, 0, 0);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
    const weekStart = startOfWeek(now);
    if (monthStart.getTime() < start.getTime()) start.setTime(monthStart.getTime());
    if (weekStart.getTime() < start.getTime()) start.setTime(weekStart.getTime());

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

    // New meters (e.g. Juwei Riemann from today) only have 0–1 daily buckets —
    // day bars look wrong. Fall back to recent hourly, then 5‑minute change.
    const sparseIds = ids.filter((id) => (stats[id]?.length ?? 0) < 3);
    let hourStats: StatisticsResponse = {};
    let fineStats: StatisticsResponse = {};
    if (sparseIds.length > 0) {
      const hourStart = new Date(now);
      hourStart.setHours(hourStart.getHours() - 48);
      try {
        hourStats = await connection.sendMessagePromise<StatisticsResponse>({
          type: 'recorder/statistics_during_period',
          start_time: hourStart.toISOString(),
          end_time: now.toISOString(),
          types: ['change'],
          statistic_ids: sparseIds,
          period: 'hour',
        });
      } catch {
        // hourly unavailable
      }
      const stillSparse = sparseIds.filter((id) => (hourStats[id]?.length ?? 0) < 3);
      if (stillSparse.length > 0) {
        const fineStart = new Date(now);
        fineStart.setHours(fineStart.getHours() - 12);
        try {
          fineStats = await connection.sendMessagePromise<StatisticsResponse>({
            type: 'recorder/statistics_during_period',
            start_time: fineStart.toISOString(),
            end_time: now.toISOString(),
            types: ['change'],
            statistic_ids: stillSparse,
            period: '5minute',
          });
        } catch {
          // 5minute unavailable
        }
      }
    }

    const weekStartMs = weekStart.getTime();
    const monthStartMs = monthStart.getTime();

    const mapChangeHistory = (
      raw: Array<{ change?: number | null }>,
    ): number[] => raw.map((entry) => {
      if (entry.change !== null && entry.change !== undefined) return Math.round(entry.change * 1000) / 1000;
      return 0;
    });

    const sources: EnergySourceData[] = entries.map((e) => {
      const raw = stats[e.entityId] ?? [];
      const dayHistory = mapChangeHistory(raw);
      const hourHistory = mapChangeHistory(hourStats[e.entityId] ?? []);
      const fineHistory = mapChangeHistory(fineStats[e.entityId] ?? []);
      // Prefer ≥3 daily points; else hourly; else recent 5‑minute profile (last 30).
      const history = dayHistory.length >= 3
        ? dayHistory
        : hourHistory.length >= 3
          ? hourHistory.slice(-24)
          : fineHistory.length > 0
            ? fineHistory.slice(-30)
            : dayHistory;

      const yesterdayVal = dayHistory.length >= 2
        ? dayHistory[dayHistory.length - 2]
        : undefined;
      const latestDay = dayHistory.length > 0 ? dayHistory[dayHistory.length - 1] : undefined;
      const location = e.floorName || e.areaName
        ? { floorName: e.floorName, areaName: e.areaName, locationLabel: e.locationLabel }
        : resolveEntityLocation(e.entityId, registries);

      const meters = relatedUtilityMeterIds(e.entityId);
      const weekFromMeter = readMeterState(hass, meters.weekly);
      const monthFromMeter = readMeterState(hass, meters.monthly);
      const todayFromMeter = readMeterState(hass, meters.daily);
      const weekFromStats = periodValueFromStats(raw, weekStartMs);
      const monthFromStats = periodValueFromStats(raw, monthStartMs);

      return {
        key: e.key,
        label: e.label,
        isDevice: e.isDevice,
        entityId: e.entityId,
        icon: e.icon,
        unit: (hass.states[e.entityId]?.attributes?.unit_of_measurement as string) || e.unit,
        history,
        yesterday: yesterdayVal !== undefined ? formatNumber(String(yesterdayVal), 1) : undefined,
        today: todayFromMeter
          ?? (latestDay !== undefined ? formatNumber(String(latestDay), 1) : '--'),
        weekToDate: weekFromMeter
          ?? (weekFromStats !== undefined ? formatNumber(String(weekFromStats), 1) : undefined),
        monthToDate: monthFromMeter
          ?? (monthFromStats !== undefined ? formatNumber(String(monthFromStats), 1) : undefined),
        ...location,
      };
    });

    // Prefer device_consumption for aggregates — grid/sum meters would double-count.
    const aggregateSources = sources.some((s) => s.isDevice)
      ? sources.filter((s) => s.isDevice)
      : sources;

    // Energy page cards: when individual devices exist, hide grid/solar/… peers
    // (e.g.「2楼总」≈ sum of 插座/机柜/空调/照明).
    const pageSources = sources.some((s) => s.isDevice)
      ? sources.filter((s) => s.isDevice)
      : sources;

    const combinedHistory: number[] = [];
    let yesterdaySum = 0;
    let yesterdayCount = 0;
    for (const src of aggregateSources) {
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

    let monthSum = 0;
    let monthHasData = false;
    let weekSum = 0;
    let weekHasData = false;
    for (const src of aggregateSources) {
      const m = parseFloat(src.monthToDate ?? '');
      if (Number.isFinite(m)) {
        monthSum += m;
        monthHasData = true;
      }
      const w = parseFloat(src.weekToDate ?? '');
      if (Number.isFinite(w)) {
        weekSum += w;
        weekHasData = true;
      }
    }

    let todaySum = 0;
    let todayCount = 0;
    for (const src of aggregateSources) {
      const t = parseFloat(src.today);
      if (Number.isFinite(t)) {
        todaySum += t;
        todayCount++;
      }
    }

    return {
      sources: pageSources,
      history: combinedHistory,
      yesterday: yesterdayCount > 0 ? formatNumber(String(yesterdaySum), 1) : undefined,
      monthToDate: monthHasData ? formatNumber(String(monthSum), 1) : undefined,
      weekToDate: weekHasData ? formatNumber(String(weekSum), 1) : undefined,
      todayTotal: todayCount > 0 ? formatNumber(String(todaySum), 1) : undefined,
    };
  } catch {
    return null;
  }
}

/** Overlay live utility_meter states onto energy cards (今日/本周/本月). */
export function enrichEnergySourcesWithMeters(
  hass: HomeAssistant,
  sources: EnergySourceData[],
): EnergySourceData[] {
  return sources.map((src) => {
    const meters = relatedUtilityMeterIds(src.entityId);
    const today = readMeterState(hass, meters.daily);
    const weekToDate = readMeterState(hass, meters.weekly);
    const monthToDate = readMeterState(hass, meters.monthly);
    if (!today && !weekToDate && !monthToDate) return src;
    return {
      ...src,
      today: today ?? src.today,
      weekToDate: weekToDate ?? src.weekToDate,
      monthToDate: monthToDate ?? src.monthToDate,
    };
  });
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
