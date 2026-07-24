import { html } from 'lit';
import type { TemplateResult } from 'lit';

import type { DashboardConfig, EntityRegistryEntry, HomeAssistant, RenderedDevice } from '../types';
import type { Language } from '../i18n';
import { assetKeyForDomain, deviceStateLabel, formatRelativeTime, selectedSkin } from '../utils';
import { renderImage } from '../render/context';
import { renderThemedSwitch } from './themed-switch';

const BRIGHTNESS_MODES = new Set(['brightness', 'color_temp', 'hs', 'rgb', 'rgbw', 'rgbww', 'xy']);
const COLOR_TEMP_MODES = new Set(['color_temp']);
const COLOR_RGB_MODES = new Set(['hs', 'rgb', 'rgbw', 'rgbww', 'xy']);
const DEFAULT_MIN_KELVIN = 2000;
const DEFAULT_MAX_KELVIN = 6500;

function miredsToKelvin(mireds: number): number {
  return Math.round(1_000_000 / Math.max(1, mireds));
}

function mergeLightCapabilityAttrs(
  stateAttrs: Record<string, unknown>,
  registryEntry?: EntityRegistryEntry,
): Record<string, unknown> {
  const caps = (registryEntry?.capabilities || {}) as Record<string, unknown>;
  // State attrs win when present; registry capabilities fill gaps (Xiaomi etc.).
  const merged: Record<string, unknown> = { ...caps, ...stateAttrs };
  const stateModes = stateAttrs.supported_color_modes;
  const capModes = caps.supported_color_modes;
  if (
    (!Array.isArray(stateModes) || stateModes.length === 0)
    && Array.isArray(capModes)
    && capModes.length > 0
  ) {
    merged.supported_color_modes = capModes;
  }
  for (const key of [
    'min_color_temp_kelvin',
    'max_color_temp_kelvin',
    'min_mireds',
    'max_mireds',
  ] as const) {
    if (typeof stateAttrs[key] !== 'number' && typeof caps[key] === 'number') {
      merged[key] = caps[key];
    }
  }
  return merged;
}

function resolveColorTempControl(attributes: Record<string, unknown>): {
  supports: boolean;
  minKelvin: number;
  maxKelvin: number;
  currentKelvin: number;
} {
  const colorModes = (attributes.supported_color_modes as string[] | undefined) || [];
  const hasMode = colorModes.some((mode) => COLOR_TEMP_MODES.has(mode));
  const hasKelvinRange =
    typeof attributes.min_color_temp_kelvin === 'number'
    || typeof attributes.max_color_temp_kelvin === 'number';
  const hasMiredRange =
    typeof attributes.min_mireds === 'number'
    || typeof attributes.max_mireds === 'number';
  const hasCurrent =
    typeof attributes.color_temp_kelvin === 'number'
    || typeof attributes.color_temp === 'number';
  const supports = hasMode || hasKelvinRange || hasMiredRange || hasCurrent;

  // mireds are inverse of kelvin: min_mireds ~= max kelvin
  const minKelvin = typeof attributes.min_color_temp_kelvin === 'number'
    ? attributes.min_color_temp_kelvin
    : (typeof attributes.max_mireds === 'number'
      ? miredsToKelvin(attributes.max_mireds)
      : DEFAULT_MIN_KELVIN);
  const maxKelvin = typeof attributes.max_color_temp_kelvin === 'number'
    ? attributes.max_color_temp_kelvin
    : (typeof attributes.min_mireds === 'number'
      ? miredsToKelvin(attributes.min_mireds)
      : DEFAULT_MAX_KELVIN);
  const safeMin = Math.min(minKelvin, maxKelvin);
  const safeMax = Math.max(minKelvin, maxKelvin);

  let currentKelvin = typeof attributes.color_temp_kelvin === 'number'
    ? attributes.color_temp_kelvin
    : (typeof attributes.color_temp === 'number'
      ? miredsToKelvin(attributes.color_temp)
      : Math.round((safeMin + safeMax) / 2));
  currentKelvin = Math.min(safeMax, Math.max(safeMin, currentKelvin));

  return { supports, minKelvin: safeMin, maxKelvin: safeMax, currentKelvin };
}

function rgbToHex(rgb: [number, number, number]): string {
  const toHex = (n: number) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0');
  return `#${toHex(rgb[0])}${toHex(rgb[1])}${toHex(rgb[2])}`;
}

function hsToRgb(hue: number, sat: number): [number, number, number] {
  const s = sat / 100;
  const v = 1;
  const c = v * s;
  const hp = hue / 60;
  const x = c * (1 - Math.abs((hp % 2) - 1));
  let r = 0, g = 0, b = 0;
  if (hp >= 0 && hp < 1) { r = c; g = x; b = 0; }
  else if (hp < 2) { r = x; g = c; b = 0; }
  else if (hp < 3) { r = 0; g = c; b = x; }
  else if (hp < 4) { r = 0; g = x; b = c; }
  else if (hp < 5) { r = x; g = 0; b = c; }
  else { r = c; g = 0; b = x; }
  const m = v - c;
  return [(r + m) * 255, (g + m) * 255, (b + m) * 255];
}

function hexToRgb(hex: string): [number, number, number] {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return [255, 255, 255];
  const n = parseInt(m[1], 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function renderLightCard(
  config: DashboardConfig | undefined,
  hass: HomeAssistant,
  device: RenderedDevice,
  language: Language,
  onHandleAction: (entityId: string, action: string) => void,
  entityRegistry?: EntityRegistryEntry[],
): TemplateResult {
  const skin = selectedSkin(config);
  const assetKey = assetKeyForDomain(skin, 'light');
  const stateObj = hass.states?.[device.entityId];

  if (!stateObj) {
    return html`<button class="device device-off" @click=${() => onHandleAction(device.entityId, 'more-info')}>
      <div class="device-top">${renderImage(config, assetKey, device.name, 'item-img')}<div class="tag-stack"><div class="status">${deviceStateLabel(device.state, language, hass, 'light')}</div></div></div>
      <div class="device-copy"><p class="device-name">${device.name}</p><p class="muted">${device.subtitle}</p></div>
    </button>`;
  }

  const registryEntry = entityRegistry?.find((entry) => entry.entity_id === device.entityId);
  const a = mergeLightCapabilityAttrs(
    (stateObj.attributes || {}) as Record<string, unknown>,
    registryEntry,
  );
  const isOn = stateObj.state === 'on';
  const brightness = a.brightness as number | undefined;
  const briPct = brightness !== undefined ? Math.round(brightness / 2.55) : undefined;
  const colorModes = (a.supported_color_modes as string[]) || [];
  const hasBrightness = colorModes.some(m => BRIGHTNESS_MODES.has(m)) || brightness !== undefined;
  const colorTempControl = resolveColorTempControl(a);
  const hasColorTemp = colorTempControl.supports;
  const hasRgbColor = colorModes.some(m => COLOR_RGB_MODES.has(m));
  const rgbColor = a.rgb_color as [number, number, number] | undefined;
  const hsColor = a.hs_color as [number, number] | undefined;
  const currentHex = rgbColor
    ? rgbToHex(rgbColor)
    : (hsColor ? rgbToHex(hsToRgb(hsColor[0], hsColor[1])) : '#ffffff');

  const statusClass = isOn ? `device-on-${device.color}` : (stateObj.state === 'unavailable' ? 'device-unavailable' : 'device-off');
  const stateLabel = deviceStateLabel(stateObj.state, language, hass, 'light');
  const lastTime = stateObj.last_changed
    ? formatRelativeTime(new Date(stateObj.last_changed), language)
    : device.subtitle;

  const doService = (service: string, data: Record<string, unknown>) => {
    void hass.callService('light', service, { entity_id: device.entityId, ...data });
  };

  const stopCardClick = (e: Event) => e.stopPropagation();

  return html`
    <button class="device ${statusClass}" @click=${() => onHandleAction(device.entityId, 'toggle')}>
      <div class="device-top">
        ${renderImage(config, assetKey, device.name, 'item-img')}
        <div class="tag-stack">
          <div class="status">${stateLabel}</div>
        </div>
      </div>
      <div class="device-copy">
        <p class="device-name">${device.name}</p>
        <p class="muted">${lastTime}</p>
      </div>
      <div class="control-row" @click=${stopCardClick} @pointerdown=${stopCardClick}>
        ${hasBrightness && isOn && briPct !== undefined ? html`
        <ha-control-slider .value=${briPct} min="0" max="100" style="--control-slider-thickness:28px;--control-slider-border-radius:var(--sp-radius-pill, var(--sp-radius-infinite, 999px));flex:1;min-width:0;--control-slider-color:var(--sp-accent, var(--sp-accent-green, var(--primary-color, #7BC67E)));--control-slider-background:var(--sp-device-bg, rgba(128,128,128,.2))" @value-changed=${(e: CustomEvent) => { e.stopPropagation(); doService('turn_on', { brightness: Math.round((e.detail.value ?? 0) * 2.55) }); }} @click=${stopCardClick} @pointerdown=${stopCardClick}></ha-control-slider>
        ` : ''}
        ${hasColorTemp && isOn ? html`
        <ha-control-slider
          .value=${colorTempControl.currentKelvin}
          min=${colorTempControl.minKelvin}
          max=${colorTempControl.maxKelvin}
          style="--control-slider-thickness:28px;--control-slider-border-radius:var(--sp-radius-pill, var(--sp-radius-infinite, 999px));flex:1;min-width:0;--control-slider-color:var(--sp-accent, var(--sp-accent-green, var(--primary-color, #7BC67E)))"
          @value-changed=${(e: CustomEvent) => {
            e.stopPropagation();
            const kelvin = Math.round((e.detail.value ?? colorTempControl.currentKelvin) as number);
            doService('turn_on', { color_temp_kelvin: kelvin });
          }}
          @click=${stopCardClick}
          @pointerdown=${stopCardClick}
        ></ha-control-slider>
        ` : ''}
        ${hasRgbColor && isOn ? html`
        <label class="light-color-swatch" style="width:28px;height:28px;border-radius:50%;background:${currentHex};border:2px solid rgba(255,255,255,.6);flex-shrink:0;cursor:pointer;overflow:hidden;box-shadow:var(--sp-shadow-device);display:block" title=${currentHex} @click=${stopCardClick} @pointerdown=${stopCardClick}>
          <input type="color" .value=${currentHex} style="opacity:0;width:100%;height:100%;cursor:pointer;border:0;padding:0" @input=${(e: Event) => { e.stopPropagation(); const v = (e.target as HTMLInputElement).value; doService('turn_on', { rgb_color: hexToRgb(v) }); }} @click=${stopCardClick}>
        </label>
        ` : ''}
        ${renderThemedSwitch(isOn, () => doService('toggle', {}), device.name)}
      </div>
    </button>
  `;
}