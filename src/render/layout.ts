import type { DashboardConfig } from '../types';
import { assetUrl, selectedSkin } from '../utils';

export function applyLayoutHeight(host: HTMLElement | null | undefined): void {
  if (!host) return;

  if (window.matchMedia('(orientation: portrait)').matches) {
    host.style.setProperty('--sp-runtime-height', 'auto');
    host.style.setProperty('--sp-runtime-min-height', '100vh');
    return;
  }

  const rect = host.getBoundingClientRect();
  const paddingBottom = 0;
  const isShortLandscape = window.matchMedia('(orientation: landscape)').matches && window.innerHeight < 500;
  const availableHeight = isShortLandscape
    ? Math.max(240, Math.floor(window.innerHeight - rect.top - paddingBottom))
    : Math.max(560, Math.floor(window.innerHeight - rect.top - paddingBottom));
  host.style.setProperty('--sp-runtime-height', `${availableHeight}px`);
  host.style.setProperty('--sp-runtime-min-height', `${availableHeight}px`);
}

export function applyThemeVariables(host: HTMLElement | null | undefined, config: DashboardConfig | undefined): void {
  if (!host) return;

  const theme = config?.resource_pack?.theme;
  if (theme) {
    for (const [key, value] of Object.entries(theme)) {
      host.style.setProperty(key, value);
    }
  }
  const stageUrl = config?.background_image || assetUrl(config, 'stage');
  host.style.setProperty('--sp-stage-texture', `url("${stageUrl}")`);
  if (selectedSkin(config) !== 'visionOS') {
    host.style.setProperty('--sp-base-texture', `url("${assetUrl(config, 'base')}")`);
  }
}

export function applyFullscreenHeight(host: HTMLElement | null | undefined): void {
  if (!host) return;
  const isShortLandscape = window.matchMedia('(orientation: landscape)').matches && window.innerHeight < 500;
  const h = isShortLandscape
    ? Math.max(240, Math.floor(window.innerHeight))
    : Math.max(560, Math.floor(window.innerHeight));
  host.style.setProperty('--sp-runtime-height', `${h}px`);
  host.style.setProperty('--sp-runtime-min-height', `${h}px`);
}

export function applyKioskExitHeight(host: HTMLElement | null | undefined): void {
  if (!host) return;
  requestAnimationFrame(() => {
    const r = host.getBoundingClientRect();
    const h = Math.max(560, Math.floor(window.innerHeight - r.top));
    host.style.setProperty('--sp-runtime-height', `${h}px`);
    host.style.setProperty('--sp-runtime-min-height', `${h}px`);
  });
}
