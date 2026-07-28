import type { DashboardConfig } from '../types';
import { assetHref, assetUrl } from './index';

const FADE_MS = 180;
const PRELOAD_TIMEOUT_MS = 2500;

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T | void> {
  return Promise.race([
    promise,
    wait(ms).then(() => undefined),
  ]);
}

function preloadStylesheet(href: string): Promise<void> {
  if (!href) return Promise.resolve();
  return new Promise((resolve) => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    const done = () => {
      link.onload = null;
      link.onerror = null;
      resolve();
    };
    link.onload = done;
    link.onerror = done;
    document.head.appendChild(link);
    // Keep the cached stylesheet; browser will reuse for the shadow <link>.
    window.setTimeout(done, PRELOAD_TIMEOUT_MS);
  });
}

function preloadImage(url: string): Promise<void> {
  if (!url || url === 'url("")' || url.includes('url("")')) return Promise.resolve();
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

/** Prefetch theme.css + stage/base so the next paint has bytes in cache. */
export async function preloadSkinAssets(config: DashboardConfig | undefined): Promise<void> {
  if (!config) return;
  const cssHref = assetHref(config, 'theme_css');
  const stage = assetUrl(config, 'stage');
  const base = assetUrl(config, 'base');
  await withTimeout(
    Promise.all([
      preloadStylesheet(cssHref),
      preloadImage(stage),
      preloadImage(base),
    ]),
    PRELOAD_TIMEOUT_MS,
  );
}

export function skinTransitionFadeMs(): number {
  return FADE_MS;
}

/** Soft fade-out before swapping skin assets. */
export async function beginSkinFade(host: HTMLElement | null | undefined): Promise<void> {
  if (!host) return;
  host.setAttribute('data-skin-transition', 'out');
  await wait(FADE_MS);
}

/** Fade back in after the new theme is applied. */
export async function endSkinFade(host: HTMLElement | null | undefined): Promise<void> {
  if (!host) return;
  // Force a frame at opacity 0 with the new skin painted, then ease in.
  host.setAttribute('data-skin-transition', 'hold');
  await wait(32);
  host.setAttribute('data-skin-transition', 'in');
  await wait(FADE_MS);
  host.removeAttribute('data-skin-transition');
}
