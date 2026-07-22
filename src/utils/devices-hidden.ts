/**
 * Devices page hide list:
 * 1. Browse: omit entity ids in `devices_page.hidden`.
 * 2. Edit: show all; long-press hides, click restores; draft → localStorage immediately.
 * 3. Exit (完成 / 10s idle): persist draft → Lovelace strategy `devices_page.hidden`.
 *
 * Prefer: draft (while editing) > localStorage > HA strategy. Never union lists.
 */

import {
  normalizeHiddenIds,
  securityHideSavePaths,
} from './security-hidden';

const LS_KEY = 'skins-pro.devices.hidden';
const LS_KEY_USER = (userId: string) => `skins-pro.devices.hidden.${userId}`;

export const DEVICE_EDIT_IDLE_MS = 10000;
export const DEVICE_HIDE_LONG_PRESS_MS = 550;

export { normalizeHiddenIds };

export function readDevicesHiddenLocal(userId?: string): string[] | null {
  try {
    const raw = (userId && window.localStorage.getItem(LS_KEY_USER(userId)))
      || window.localStorage.getItem(LS_KEY);
    if (raw === null) return null;
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return null;
    return normalizeHiddenIds(parsed.filter((id): id is string => typeof id === 'string'));
  } catch {
    return null;
  }
}

export function writeDevicesHiddenLocal(hidden: string[], userId?: string): void {
  const normalized = normalizeHiddenIds(hidden);
  try {
    window.localStorage.setItem(LS_KEY, JSON.stringify(normalized));
    if (userId) window.localStorage.setItem(LS_KEY_USER(userId), JSON.stringify(normalized));
  } catch {
    // ignore quota / private mode
  }
}

/** Prefer draft > localStorage > HA. Never union. */
export function resolveDevicesHiddenIds(opts: {
  draft: string[] | null;
  configHidden: string[] | undefined;
  userId?: string;
}): string[] {
  if (opts.draft !== null) return normalizeHiddenIds(opts.draft);
  const local = readDevicesHiddenLocal(opts.userId);
  if (local !== null) return local;
  return normalizeHiddenIds(opts.configHidden);
}

export function addHiddenId(hidden: string[], entityId: string): string[] {
  const set = new Set(normalizeHiddenIds(hidden));
  set.add(entityId);
  return [...set];
}

export function removeHiddenId(hidden: string[], entityId: string): string[] {
  const set = new Set(normalizeHiddenIds(hidden));
  set.delete(entityId);
  return [...set];
}

type HassConnection = {
  sendMessagePromise: <T>(message: Record<string, unknown>) => Promise<T>;
};

/**
 * Write `devices_page.hidden` into the Skins Pro strategy dashboard.
 * Returns true only after read-back matches.
 */
export async function saveDevicesHiddenToHa(
  connection: HassConnection,
  hidden: string[],
  pathname = window.location.pathname,
): Promise<boolean> {
  const normalized = normalizeHiddenIds(hidden);
  let lastError: unknown;
  for (const urlPath of securityHideSavePaths(pathname)) {
    try {
      const current = await connection.sendMessagePromise<Record<string, unknown>>({
        type: 'lovelace/config',
        url_path: urlPath,
      });
      if (!current?.strategy || typeof current.strategy !== 'object') continue;
      const strategy = current.strategy as Record<string, unknown>;
      if (!String(strategy.type || '').includes('skins-pro')) continue;

      const prevPage = typeof strategy.devices_page === 'object' && strategy.devices_page
        ? (strategy.devices_page as Record<string, unknown>)
        : {};

      await connection.sendMessagePromise({
        type: 'lovelace/config/save',
        url_path: urlPath,
        config: {
          ...current,
          strategy: {
            ...strategy,
            devices_page: {
              ...prevPage,
              hidden: normalized,
            },
          },
        },
      });

      const verify = await connection.sendMessagePromise<Record<string, unknown>>({
        type: 'lovelace/config',
        url_path: urlPath,
      });
      const strat = (verify?.strategy && typeof verify.strategy === 'object')
        ? (verify.strategy as Record<string, unknown>)
        : {};
      const page = (strat.devices_page && typeof strat.devices_page === 'object')
        ? (strat.devices_page as Record<string, unknown>)
        : {};
      const saved = Array.isArray(page.hidden) ? page.hidden.map(String) : [];
      const same = saved.length === normalized.length && normalized.every((id) => saved.includes(id));
      if (same) return true;
      lastError = new Error(`verify mismatch on ${urlPath}`);
    } catch (error) {
      lastError = error;
    }
  }
  console.warn('[Skins Pro] devices_page.hidden save failed', lastError);
  return false;
}
