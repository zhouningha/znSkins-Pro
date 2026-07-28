import type { DashboardConfig } from '../types';
import { assetUrl } from '../utils';

function viewportHeight(): number {
  const vv = window.visualViewport?.height;
  if (typeof vv === 'number' && vv > 0) return Math.floor(vv);
  return Math.floor(window.innerHeight);
}

function isKioskHost(host: HTMLElement): boolean {
  return host.hasAttribute('data-kiosk-fullscreen')
    || host.hasAttribute('data-sp-kiosk')
    || host.getAttribute('data-android-kiosk') === 'true'
    || document.body.classList.contains('skins-pro-kiosk');
}

export function applyLayoutHeight(host: HTMLElement | null | undefined): void {
  if (!host) return;

  if (window.matchMedia('(orientation: portrait)').matches) {
    host.style.setProperty('--sp-runtime-height', 'auto');
    host.style.setProperty('--sp-runtime-min-height', '100vh');
    return;
  }

  // Kiosk / Android wall panel: fill the real visual viewport (no letterbox).
  if (isKioskHost(host)) {
    applyFullscreenHeight(host);
    return;
  }

  const rect = host.getBoundingClientRect();
  const paddingBottom = 0;
  const isShortLandscape = window.matchMedia('(orientation: landscape)').matches && window.innerHeight < 500;
  const vh = viewportHeight();
  const availableHeight = isShortLandscape
    ? Math.max(240, Math.floor(vh - rect.top - paddingBottom))
    : Math.max(560, Math.floor(vh - rect.top - paddingBottom));
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
  host.style.setProperty('--sp-base-texture', `url("${assetUrl(config, 'base')}")`);
}

function firstToken(computed: CSSStyleDeclaration, keys: string[]): string {
  for (const key of keys) {
    const value = computed.getPropertyValue(key).trim();
    if (value) return value;
  }
  return '';
}

const MORE_INFO_THEME_STYLE_ID = 'sp-more-info-theme';

/** Map current skin tokens onto HA more-info / dialog chrome (body portal). */
export function syncPortalThemeVariables(host: HTMLElement | null | undefined): void {
  if (!host) return;
  const targets = [document.documentElement, document.body].filter(Boolean) as HTMLElement[];
  const explicitTokens = [
    '--ha-dialog-surface-background',
    '--ha-dialog-border-radius',
    '--ha-dialog-scrim-backdrop-filter',
    '--dialog-content-padding',
    '--dialog-box-shadow',
    '--ha-bar-primary-color',
    '--ha-bar-background-color',
    '--ha-bar-border-radius',
    '--ha-spinner-indicator-color',
    '--ha-spinner-divider-color',
    '--ha-button-height',
    '--ha-button-border-radius',
    '--primary-color',
    '--accent-color',
    '--primary-text-color',
    '--secondary-text-color',
    '--card-background-color',
    '--ha-card-background',
    '--divider-color',
    '--mdc-theme-surface',
    '--mdc-theme-on-surface',
    '--md-sys-color-surface',
    '--md-sys-color-on-surface',
    '--md-sys-color-surface-container',
    '--md-sys-color-surface-container-high',
    '--md-sys-color-on-surface-variant',
  ];

  // Prefer explicit getPropertyValue — WebView often omits custom props from computed.length.
  const hostTokenKeys = [
    '--sp-accent', '--sp-accent-hover', '--sp-accent-alpha', '--sp-accent-border',
    '--sp-text-primary', '--sp-text-secondary', '--sp-text-main', '--sp-text-muted',
    '--sp-text-muted-bright', '--sp-text-stage', '--sp-text-stage-muted', '--sp-text-on-accent',
    '--sp-panel-bg', '--sp-glass-bg', '--sp-glass-light', '--sp-device-bg',
    '--sp-border-glass', '--sp-radius-xl', '--sp-radius-lg', '--sp-shadow-md', '--sp-shadow-lg',
    '--glass-thin', '--glass-regular', '--glass-thick',
  ];

  // Drop previous skin's portal tokens BEFORE reading host — custom props inherit from
  // body into :host, so a GoW --sp-text-primary would otherwise pollute organic/AC.
  for (const name of [...hostTokenKeys, ...explicitTokens]) {
    for (const target of targets) target.style.removeProperty(name);
  }

  const computed = getComputedStyle(host);
  for (const name of hostTokenKeys) {
    const value = computed.getPropertyValue(name).trim();
    if (!value) continue;
    for (const target of targets) target.style.setProperty(name, value);
  }
  for (const name of explicitTokens) {
    const value = computed.getPropertyValue(name).trim();
    if (!value) continue;
    for (const target of targets) target.style.setProperty(name, value);
  }

  // GoW / visionOS skins use --sp-text-primary + --glass-regular (no --sp-text-main / --sp-panel-bg).
  const text = firstToken(computed, ['--sp-text-main', '--sp-text-primary', '--sp-text-stage']);
  const muted = firstToken(computed, ['--sp-text-muted', '--sp-text-secondary', '--sp-text-stage-muted']);
  const accent = firstToken(computed, ['--sp-accent']);
  const panel = firstToken(computed, [
    '--sp-panel-bg', '--sp-glass-bg', '--sp-glass-light', '--glass-regular', '--glass-thick', '--sp-device-bg',
  ]);
  const border = firstToken(computed, ['--sp-border-glass', '--sp-accent-border']);
  const shadow = firstToken(computed, ['--sp-shadow-md', '--sp-shadow-lg', '--sp-shadow-card']);
  const radius = firstToken(computed, ['--sp-radius-xl', '--sp-radius-lg', '--sp-radius-glass']);

  for (const target of targets) {
    if (text) {
      target.style.setProperty('--primary-text-color', text);
      target.style.setProperty('--mdc-theme-on-surface', text);
      target.style.setProperty('--md-sys-color-on-surface', text);
    }
    if (muted) {
      target.style.setProperty('--secondary-text-color', muted);
      target.style.setProperty('--md-sys-color-on-surface-variant', muted);
    }
    if (accent) {
      target.style.setProperty('--primary-color', accent);
      target.style.setProperty('--accent-color', accent);
      target.style.setProperty('--mdc-theme-primary', accent);
    }
    if (panel) {
      target.style.setProperty('--ha-dialog-surface-background', panel);
      target.style.setProperty('--card-background-color', panel);
      target.style.setProperty('--ha-card-background', panel);
      target.style.setProperty('--mdc-theme-surface', panel);
      target.style.setProperty('--md-sys-color-surface', panel);
      target.style.setProperty('--md-sys-color-surface-container', panel);
      target.style.setProperty('--md-sys-color-surface-container-high', panel);
    }
    if (border) target.style.setProperty('--divider-color', border);
    if (shadow) target.style.setProperty('--dialog-box-shadow', shadow);
    if (radius) target.style.setProperty('--ha-dialog-border-radius', radius);
  }

  applyMoreInfoThemeStyles({ text, muted, accent, panel, border, radius });
  // Dialog mounts async — re-apply onto the open surface shortly after.
  window.setTimeout(() => paintOpenMoreInfoDialogs({ text, muted, accent, panel, border, radius }), 40);
  window.setTimeout(() => paintOpenMoreInfoDialogs({ text, muted, accent, panel, border, radius }), 200);
}

function applyMoreInfoThemeStyles(tokens: {
  text: string; muted: string; accent: string; panel: string; border: string; radius: string;
}): void {
  let style = document.getElementById(MORE_INFO_THEME_STYLE_ID) as HTMLStyleElement | null;
  if (!style) {
    style = document.createElement('style');
    style.id = MORE_INFO_THEME_STYLE_ID;
    document.head.appendChild(style);
  }
  const panel = tokens.panel || 'rgba(20,16,18,0.92)';
  const text = tokens.text || '#f5f0e6';
  const muted = tokens.muted || 'rgba(245,240,230,0.72)';
  const accent = tokens.accent || '#e8a826';
  const border = tokens.border || 'rgba(255,255,255,0.18)';
  const radius = tokens.radius || '24px';
  style.textContent = `
ha-more-info-dialog,
ha-dialog,
ha-adaptive-dialog,
wa-dialog {
  --ha-dialog-surface-background: ${panel} !important;
  --card-background-color: ${panel} !important;
  --ha-card-background: ${panel} !important;
  --mdc-theme-surface: ${panel} !important;
  --md-sys-color-surface: ${panel} !important;
  --md-sys-color-surface-container: ${panel} !important;
  --md-sys-color-surface-container-high: ${panel} !important;
  --primary-text-color: ${text} !important;
  --secondary-text-color: ${muted} !important;
  --mdc-theme-on-surface: ${text} !important;
  --md-sys-color-on-surface: ${text} !important;
  --md-sys-color-on-surface-variant: ${muted} !important;
  --primary-color: ${accent} !important;
  --accent-color: ${accent} !important;
  --divider-color: ${border} !important;
  --ha-dialog-border-radius: ${radius} !important;
  color: ${text};
}
ha-more-info-dialog::part(dialog),
ha-dialog::part(surface),
wa-dialog::part(dialog),
ha-more-info-dialog .content,
more-info-content,
more-info-weather {
  background: ${panel} !important;
  color: ${text} !important;
}
`;
}

function paintOpenMoreInfoDialogs(tokens: {
  text: string; muted: string; accent: string; panel: string; border: string; radius: string;
}): void {
  const roots: Element[] = [];
  const walk = (root: ParentNode | null | undefined, depth = 0) => {
    if (!root || depth > 10) return;
    const list = (root as ParentNode).querySelectorAll?.(
      'ha-more-info-dialog, ha-dialog, ha-adaptive-dialog, wa-dialog, more-info-weather, more-info-content',
    );
    list?.forEach((el) => roots.push(el));
    (root as ParentNode).querySelectorAll?.('*').forEach((el) => {
      if ((el as HTMLElement).shadowRoot) walk((el as HTMLElement).shadowRoot, depth + 1);
    });
  };
  walk(document);
  const map: Array<[string, string]> = [
    ['--ha-dialog-surface-background', tokens.panel],
    ['--card-background-color', tokens.panel],
    ['--ha-card-background', tokens.panel],
    ['--mdc-theme-surface', tokens.panel],
    ['--md-sys-color-surface', tokens.panel],
    ['--primary-text-color', tokens.text],
    ['--secondary-text-color', tokens.muted],
    ['--mdc-theme-on-surface', tokens.text],
    ['--primary-color', tokens.accent],
    ['--accent-color', tokens.accent],
    ['--divider-color', tokens.border],
    ['--ha-dialog-border-radius', tokens.radius],
  ];
  for (const el of roots) {
    const style = (el as HTMLElement).style;
    if (!style) continue;
    for (const [key, value] of map) {
      if (value) style.setProperty(key, value);
    }
    if (tokens.text) (el as HTMLElement).style.color = tokens.text;
    if (tokens.panel && /DIALOG|MORE-INFO-WEATHER|MORE-INFO-CONTENT/i.test(el.tagName)) {
      (el as HTMLElement).style.background = tokens.panel;
    }
  }
}

export function applyFullscreenHeight(host: HTMLElement | null | undefined): void {
  if (!host) return;
  const vh = viewportHeight();
  const isShortLandscape = window.matchMedia('(orientation: landscape)').matches && vh < 500;
  const h = isShortLandscape ? Math.max(240, vh) : Math.max(560, vh);
  host.style.setProperty('--sp-runtime-height', `${h}px`);
  host.style.setProperty('--sp-runtime-min-height', `${h}px`);
}

export function applyKioskExitHeight(host: HTMLElement | null | undefined): void {
  if (!host) return;
  requestAnimationFrame(() => {
    const r = host.getBoundingClientRect();
    const h = Math.max(560, Math.floor(viewportHeight() - r.top));
    host.style.setProperty('--sp-runtime-height', `${h}px`);
    host.style.setProperty('--sp-runtime-min-height', `${h}px`);
  });
}
