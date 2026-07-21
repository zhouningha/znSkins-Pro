/**
 * Security page hide list — single clear model:
 *
 * 1. Browse: show all cameras except those in `hidden` (edit-hide only — no stream-type filters).
 * 2. Edit: show all cameras; tap toggles draft only (no HA write).
 * 3. Done: persist draft → localStorage + lovelace strategy (`security_page.hidden`), then exit.
 *
 * Never auto-exit edit mode. Never lovelace/config/save on each card tap (that remounts the card).
 * Prefer: draft (while editing) > localStorage > HA strategy. Never union lists.
 */

const LS_KEY = 'skins-pro.security.hidden';
const LS_KEY_USER = (userId: string) => `skins-pro.security.hidden.${userId}`;
/** v4: stop auto-hiding streams; clear prior camera.* entries from local hide list once. */
const LS_PREVIEW_MIGRATE = 'skins-pro.security.preview-all-v4';

export function normalizeHiddenIds(ids: string[] | undefined | null): string[] {
  return [...new Set((ids || []).filter((id): id is string => typeof id === 'string' && Boolean(id)))];
}

export function readSecurityHiddenLocal(userId?: string): string[] | null {
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

export function writeSecurityHiddenLocal(hidden: string[], userId?: string): void {
  const normalized = normalizeHiddenIds(hidden);
  try {
    window.localStorage.setItem(LS_KEY, JSON.stringify(normalized));
    if (userId) window.localStorage.setItem(LS_KEY_USER(userId), JSON.stringify(normalized));
  } catch {
    // ignore quota / private mode
  }
}

/** Secondary / low-res streams (helpers for docs / optional tooling). */
export function isCameraSubstreamId(entityId: string, friendlyName = ''): boolean {
  if (!entityId.startsWith('camera.')) return false;
  const id = entityId.toLowerCase();
  const name = friendlyName || '';
  return (
    id.includes('zi_ma_liu')
    || id.includes('substream')
    || id.includes('minorstream')
    || id.includes('thirdstream')
    || id.includes('profile_name_2')
    || /子码流/.test(name)
    || /sub\s*stream/i.test(name)
    || /minor\s*stream/i.test(name)
  );
}

/** Primary / high-res streams. */
export function isCameraMainstreamId(entityId: string, friendlyName = ''): boolean {
  if (!entityId.startsWith('camera.')) return false;
  if (isCameraSubstreamId(entityId, friendlyName)) return false;
  const id = entityId.toLowerCase();
  const name = friendlyName || '';
  return (
    id.includes('mainstream')
    || /(^|\.)r20k_profile_name$/.test(id)
    || /主码流/.test(name)
    || /main\s*stream/i.test(name)
  );
}

/** Extra / noisy camera entities (optional tooling). */
export function isCameraPreviewNoiseId(entityId: string, friendlyName = ''): boolean {
  if (!entityId.startsWith('camera.')) return false;
  const id = entityId.toLowerCase();
  const name = friendlyName || '';
  return (
    id.includes('thirdstream')
    || id.includes('kuai_zhao')
    || /快照/.test(name)
    || id === 'camera.akuvox_door_camera'
  );
}

/**
 * One-time: do not auto-hide any camera stream.
 * Clears prior camera.* ids from the hide list so all cams show until user uses「编辑隐藏」.
 */
export function applyPreviewSubstreamDefaults(
  hidden: string[],
  _cameras: Array<{ entityId: string; name?: string }> = [],
  userId?: string,
): string[] {
  const base = normalizeHiddenIds(hidden);
  try {
    if (window.localStorage.getItem(LS_PREVIEW_MIGRATE) === '1') {
      return base;
    }
    const next = base.filter((id) => !id.startsWith('camera.'));
    writeSecurityHiddenLocal(next, userId);
    window.localStorage.setItem(LS_PREVIEW_MIGRATE, '1');
    return next;
  } catch {
    return base.filter((id) => !id.startsWith('camera.'));
  }
}

/**
 * Prefer draft > localStorage > HA. Never union.
 */
export function resolveSecurityHiddenIds(opts: {
  draft: string[] | null;
  configHidden: string[] | undefined;
  userId?: string;
  cameras?: Array<{ entityId: string; name?: string }>;
}): string[] {
  if (opts.draft !== null) return normalizeHiddenIds(opts.draft);
  const local = readSecurityHiddenLocal(opts.userId);
  const base = local !== null
    ? local
    : normalizeHiddenIds(opts.configHidden);
  return applyPreviewSubstreamDefaults(base, opts.cameras || [], opts.userId);
}

export function toggleHiddenId(hidden: string[], entityId: string): string[] {
  const set = new Set(normalizeHiddenIds(hidden));
  if (set.has(entityId)) set.delete(entityId);
  else set.add(entityId);
  return [...set];
}

export function lovelacePathFromLocation(pathname = window.location.pathname): string {
  const parts = pathname.replace(/^\/+|\/+$/g, '').split('/');
  if (parts[0] === 'lovelace' && parts[1]) return parts[1];
  const reserved = new Set(['config', 'developer-tools', 'history', 'logbook', 'media-browser', 'profile', 'hacs', 'api']);
  if (parts[0] && !reserved.has(parts[0])) return parts[0];
  return 'dashboard-n-2';
}

export function securityHideSavePaths(pathname = window.location.pathname): string[] {
  const primary = lovelacePathFromLocation(pathname);
  const out = [primary];
  if (primary !== 'dashboard-n-2') out.push('dashboard-n-2');
  return [...new Set(out.filter((p) => p && p !== 'my-home' && p !== 'lovelace'))];
}

type HassConnection = {
  sendMessagePromise: <T>(message: Record<string, unknown>) => Promise<T>;
};

/**
 * Write `security_page.hidden` into the Skins Pro strategy dashboard.
 * Returns true only after read-back matches.
 */
export async function saveSecurityHiddenToHa(
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

      const prevPage = typeof strategy.security_page === 'object' && strategy.security_page
        ? (strategy.security_page as Record<string, unknown>)
        : {};

      await connection.sendMessagePromise({
        type: 'lovelace/config/save',
        url_path: urlPath,
        config: {
          ...current,
          strategy: {
            ...strategy,
            security_page: {
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
      const page = (strat.security_page && typeof strat.security_page === 'object')
        ? (strat.security_page as Record<string, unknown>)
        : {};
      const saved = Array.isArray(page.hidden) ? page.hidden.map(String) : [];
      const same = saved.length === normalized.length && normalized.every((id) => saved.includes(id));
      if (same) return true;
      lastError = new Error(`verify mismatch on ${urlPath}`);
    } catch (error) {
      lastError = error;
    }
  }
  console.warn('[Skins Pro] security_page.hidden save failed', lastError);
  return false;
}
