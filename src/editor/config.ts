import { DEFAULT_ASSETS } from '../config/constants';
import { SKINS } from '../skins/generated';

export type DashboardConfigRecord = Record<string, any>;

/** Asset keys that must reset to canonical filenames when switching skins. */
const SKIN_LOCAL_ASSET_KEYS = [
  'theme_css', 'stage', 'base', 'avatar', 'decor',
  'room_living', 'room_bedroom', 'room_kitchen', 'room_garden',
  'room_dining', 'room_office', 'room_garage',
] as const;

function isCanonicalSkinAsset(key: string, val: string): boolean {
  const def = DEFAULT_ASSETS[key];
  if (!def) return !val.includes('?') && !val.startsWith('/') && !/^https?:\/\//.test(val);
  // Accept default name, optional cache-buster query on that exact file.
  return val === def || val.startsWith(`${def}?`);
}

const SKIN_LABELS: Record<string, string> = {
  modern: 'Modern',
  'animal-crossing': '动物森友会',
  organic: '自然之家',
  god_of_war_3_wall: '战神',
  'retro-luxury': '复古奢华',
  'fantasy-westward-journey': '梦幻西游',
  'neo-tactile': 'Neo Tactile',
  'super-mario': '超级玛丽',
};

export function fire(el: HTMLElement, config: DashboardConfigRecord): void {
  el.dispatchEvent(new CustomEvent('config-changed', {
    bubbles: true,
    composed: true,
    detail: { config },
  }));
}

export function deepClone<T>(obj: T): T {
  try {
    return structuredClone(obj);
  } catch {
    return JSON.parse(JSON.stringify(obj)) as T;
  }
}

function drillPath(next: DashboardConfigRecord, path: string): { parent: Record<string, any>; last: string } | null {
  const parts = path.split('.');
  let cur: Record<string, any> = next;
  for (let i = 0; i < parts.length - 1; i += 1) {
    const p = parts[i];
    if (!p) return null;
    cur[p] = cur[p] || {};
    cur = cur[p] as Record<string, any>;
  }
  const last = parts[parts.length - 1];
  if (!last) return null;
  return { parent: cur, last };
}

export function setField(el: HTMLElement, current: DashboardConfigRecord, path: string, value: any): DashboardConfigRecord {
  const next = deepClone(current);
  const drill = drillPath(next, path);
  if (!drill) return current;
  drill.parent[drill.last] = value;
  fire(el, next);
  return next;
}

export function setListItem(el: HTMLElement, current: DashboardConfigRecord, path: string, index: number, value: string): DashboardConfigRecord {
  const next = deepClone(current);
  const drill = drillPath(next, path);
  if (!drill) return current;
  const arr: string[] = drill.parent[drill.last] || [];
  if (value) {
    arr[index] = value;
    drill.parent[drill.last] = arr;
    fire(el, next);
    return next;
  }
  arr.splice(index, 1);
  drill.parent[drill.last] = arr;
  fire(el, next);
  return next;
}

export function addListItem(el: HTMLElement, current: DashboardConfigRecord, path: string, max?: number): DashboardConfigRecord {
  const next = deepClone(current);
  const drill = drillPath(next, path);
  if (!drill) return current;
  const arr: string[] = drill.parent[drill.last] || [];
  if (max !== undefined && arr.length >= max) return current;
  arr.push('');
  drill.parent[drill.last] = arr;
  fire(el, next);
  return next;
}

/** Move a list item up (delta=-1) or down (delta=+1). */
export function moveListItem(el: HTMLElement, current: DashboardConfigRecord, path: string, index: number, delta: number): DashboardConfigRecord {
  const next = deepClone(current);
  const drill = drillPath(next, path);
  if (!drill) return current;
  const arr: string[] = [...(drill.parent[drill.last] || [])];
  const target = index + delta;
  if (index < 0 || index >= arr.length || target < 0 || target >= arr.length) return current;
  const tmp = arr[index]!;
  arr[index] = arr[target]!;
  arr[target] = tmp;
  drill.parent[drill.last] = arr;
  fire(el, next);
  return next;
}

export function applySkinConfig(current: DashboardConfigRecord, skin: string): DashboardConfigRecord {
  const next = deepClone(current);
  next.resource_pack = next.resource_pack || {};
  next.resource_pack.skin = skin;
  // Bundled skins use in-JS assets; downloaded skins must point at /local/skins-pro/<id>/.
  if (SKINS.includes(skin)) {
    next.resource_pack.base_path = '__AUTO__';
  } else {
    next.resource_pack.base_path = `/local/skins-pro/${skin}/`;
    next.downloaded_skins = [...new Set([...(next.downloaded_skins || []), skin])];
  }
  // Sticky custom BG / absolute / per-skin cache-bust paths pin the previous skin
  // (e.g. theme-mario7.css, room-living.jpg?v=mario7) onto the next skin folder.
  if (next.background_image) next.background_image = '';
  const assets = { ...(next.resource_pack.assets || {}) } as Record<string, string>;
  for (const key of SKIN_LOCAL_ASSET_KEYS) {
    const val = assets[key];
    const def = DEFAULT_ASSETS[key];
    if (typeof val !== 'string') {
      if (def) assets[key] = def;
      continue;
    }
    if (
      val.startsWith('/')
      || /^https?:\/\//.test(val)
      || val.includes('/skins-pro/')
      || !isCanonicalSkinAsset(key, val)
    ) {
      if (def) assets[key] = def;
      else delete assets[key];
      continue;
    }
    // Drop cache-buster queries so the new skin folder loads its own files.
    if (def) assets[key] = def;
  }
  next.resource_pack.assets = assets;
  return next;
}

export function applySkin(el: HTMLElement, current: DashboardConfigRecord, skin: string): DashboardConfigRecord {
  const next = applySkinConfig(current, skin);
  fire(el, next);
  return next;
}

export function buildSkinOptions(config: DashboardConfigRecord): string {
  const current = config.resource_pack?.skin || 'modern';
  const downloaded = ((config.downloaded_skins || []) as string[]).filter((s) => !SKINS.includes(s));
  const toOption = (s: string): string => {
    const label = SKIN_LABELS[s] || s;
    return `<option value="${s}"${s === current ? ' selected' : ''}>${label}</option>`;
  };
  const bundled = (SKINS as readonly string[]).map(toOption).join('');
  const extra = downloaded.map(toOption).join('');
  return bundled + extra;
}
