import { SKINS } from '../skins/generated';

export type DashboardConfigRecord = Record<string, any>;

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

export function applySkin(el: HTMLElement, current: DashboardConfigRecord, skin: string): DashboardConfigRecord {
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
  // Sticky custom BG / absolute asset paths pin the previous skin's stage & theme.css.
  if (next.background_image) next.background_image = '';
  const assets = { ...(next.resource_pack.assets || {}) } as Record<string, string>;
  for (const key of ['theme_css', 'stage', 'base'] as const) {
    const val = assets[key];
    if (typeof val !== 'string') continue;
    if (val.startsWith('/') || /^https?:\/\//.test(val) || val.includes('/skins-pro/')) {
      delete assets[key];
      continue;
    }
    // Drop stale cache-buster queries (e.g. theme.css?v=gow-…) so the new skin folder loads.
    if (key === 'theme_css' && val.startsWith('theme.css')) assets.theme_css = 'theme.css';
  }
  // Downloaded skins should not keep a prior skin's absolute/query asset map beyond theme.css.
  if (!SKINS.includes(skin)) {
    delete assets.stage;
    delete assets.base;
  }
  next.resource_pack.assets = assets;
  fire(el, next);
  return next;
}

export function buildSkinOptions(config: DashboardConfigRecord): string {
  const current = config.resource_pack?.skin || 'modern';
  const downloaded = ((config.downloaded_skins || []) as string[]).filter((s) => !SKINS.includes(s));
  const bundled = (SKINS as readonly string[]).map((s) => `<option value="${s}"${s === current ? ' selected' : ''}>${s}</option>`).join('');
  const extra = downloaded.map((s) => `<option value="${s}"${s === current ? ' selected' : ''}>${s}</option>`).join('');
  return bundled + extra;
}
