import type { DashboardConfig } from '../types';
import { assetHref, assetUrl, selectedSkin } from './index';

const FADE_OUT_MS = 90;
const FADE_IN_MS = 160;
const PRELOAD_TIMEOUT_MS = 1800;
const WARM_TIMEOUT_MS = 1200;

const warmedSkins = new Set<string>();
let warmPassRunning = false;

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T | void> {
  return Promise.race([promise, wait(ms).then(() => undefined)]);
}

/** Cache bytes via fetch — avoids leaking permanent <link> tags into document.head. */
function prefetchUrl(url: string): Promise<void> {
  if (!url) return Promise.resolve();
  return fetch(url, { credentials: 'same-origin', cache: 'force-cache' })
    .then(() => undefined)
    .catch(() => undefined);
}

function preloadImage(url: string): Promise<void> {
  if (!url) return Promise.resolve();
  const clean = url.replace(/^url\(["']?/, '').replace(/["']?\)$/, '').trim();
  if (!clean || clean === 'none') return Promise.resolve();
  return new Promise((resolve) => {
    const img = new Image();
    const done = () => {
      img.onload = null;
      img.onerror = null;
      resolve();
    };
    img.onload = done;
    img.onerror = done;
    img.src = clean;
    window.setTimeout(done, PRELOAD_TIMEOUT_MS);
  });
}

function skinAssetUrls(config: DashboardConfig): string[] {
  const urls = [
    assetHref(config, 'theme_css'),
    assetUrl(config, 'stage'),
    assetUrl(config, 'base'),
  ].filter(Boolean);
  return [...new Set(urls)];
}

/** Prefetch theme.css + stage/base so the next paint has bytes in cache. */
export async function preloadSkinAssets(config: DashboardConfig | undefined): Promise<void> {
  if (!config) return;
  const urls = skinAssetUrls(config);
  const stage = assetUrl(config, 'stage');
  const base = assetUrl(config, 'base');
  await withTimeout(
    Promise.all([
      ...urls.map((u) => prefetchUrl(u)),
      preloadImage(stage),
      preloadImage(base),
    ]),
    PRELOAD_TIMEOUT_MS,
  );
  const skin = selectedSkin(config);
  if (skin) warmedSkins.add(skin);
}

/**
 * Idle-warm downloaded skins so the first switch is already cached.
 * Safe to call repeatedly; each skin warms at most once per page life.
 */
export function warmKnownSkins(config: DashboardConfig | undefined): void {
  if (!config || warmPassRunning) return;
  const skins = [...new Set<string>([
    selectedSkin(config),
    ...((config.downloaded_skins || []) as string[]),
  ].filter(Boolean))];
  const pending = skins.filter((s) => !warmedSkins.has(s));
  if (!pending.length) return;

  warmPassRunning = true;
  void (async () => {
    try {
      for (const skin of pending) {
        if (warmedSkins.has(skin)) continue;
        warmedSkins.add(skin);
        const probe: DashboardConfig = {
          ...config,
          resource_pack: {
            ...config.resource_pack,
            skin,
            base_path: skin === 'modern' ? '__AUTO__' : `/local/skins-pro/${skin}/`,
          },
        };
        await withTimeout(preloadSkinAssets(probe), WARM_TIMEOUT_MS);
        await wait(40);
      }
    } finally {
      warmPassRunning = false;
    }
  })();
}

export function skinTransitionFadeOutMs(): number {
  return FADE_OUT_MS;
}

export function skinTransitionFadeInMs(): number {
  return FADE_IN_MS;
}

/** Quick fade-out — call only after assets are already warm. */
export async function beginSkinFade(host: HTMLElement | null | undefined): Promise<void> {
  if (!host) return;
  host.setAttribute('data-skin-transition', 'out');
  await wait(FADE_OUT_MS);
}

/** Fade back in after the new theme is painted. */
export async function endSkinFade(host: HTMLElement | null | undefined): Promise<void> {
  if (!host) return;
  host.setAttribute('data-skin-transition', 'hold');
  await wait(16);
  host.setAttribute('data-skin-transition', 'in');
  await wait(FADE_IN_MS);
  host.removeAttribute('data-skin-transition');
}

/** Wait until the shadow theme <link> finishes (or timeout). */
export async function waitForShadowTheme(root: ShadowRoot | null | undefined): Promise<void> {
  if (!root) return;
  const link = root.querySelector('link[rel="stylesheet"]') as HTMLLinkElement | null;
  if (!link) return;
  if (link.sheet) return;
  await withTimeout(
    new Promise<void>((resolve) => {
      const done = () => {
        link.removeEventListener('load', done);
        link.removeEventListener('error', done);
        resolve();
      };
      link.addEventListener('load', done);
      link.addEventListener('error', done);
    }),
    900,
  );
}
