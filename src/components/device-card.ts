import { html } from 'lit';
import type { TemplateResult } from 'lit';

import type { DashboardConfig, HomeAssistant, RenderedDevice } from '../types';
import type { Language } from '../i18n';
import { assetKeyForDomain, deviceStateLabel, formatRelativeTime, selectedSkin } from '../utils';
import { renderImage } from '../render/context';

export const CONTROLLABLE_DOMAINS = new Set([
  'light', 'switch', 'fan', 'cover', 'valve', 'media_player', 'lock', 'climate',
  'vacuum', 'humidifier', 'water_heater', 'siren', 'automation', 'group', 'input_boolean',
]);

export function deviceLastChanged(
  hass: HomeAssistant,
  device: RenderedDevice,
  language: Language,
): string | undefined {
  const domain = device.entityId.split('.')[0];
  const stateObj = hass.states?.[device.entityId];
  if (domain === 'automation') {
    return stateObj?.attributes?.last_triggered
      ? formatRelativeTime(new Date(stateObj.attributes.last_triggered as string), language)
      : undefined;
  }
  if (domain === 'scene') {
    return stateObj?.state && stateObj.state !== 'unavailable' && stateObj.state !== 'unknown'
      ? formatRelativeTime(new Date(stateObj.state), language)
      : undefined;
  }
  if (stateObj) {
    return formatRelativeTime(new Date(stateObj.last_changed), language);
  }
  return undefined;
}

export function renderDeviceCard(
  config: DashboardConfig | undefined,
  hass: HomeAssistant,
  device: RenderedDevice,
  language: Language,
  onHandleAction: (entityId: string, action: string) => void,
): TemplateResult {
  const stateLabel = deviceStateLabel(device.state, language);
  const active = ['on', 'playing', 'paused', 'cool', 'heat', 'dry', 'auto', 'fan_only', 'heat_cool', 'armed', 'locked', 'open'].includes(device.state);
  const statusClass = active ? `device-on-${device.color}` : (device.state === 'unavailable' ? 'device-unavailable' : 'device-off');
  const skin = selectedSkin(config);
  const assetKey = assetKeyForDomain(skin, device.entityId.split('.')[0] || 'sensor');
  const isMedia = device.detail === 'media_player';
  const isClimate = device.detail === 'climate';
  const action = isClimate ? 'climate-control' : (isMedia ? 'play-pause' : (CONTROLLABLE_DOMAINS.has(device.detail) ? 'toggle' : 'more-info'));
  const mediaState = isMedia ? hass.states?.[device.entityId] : undefined;
  const albumArt = isMedia ? (mediaState?.attributes?.entity_picture as string | undefined) : undefined;
  const vol = isMedia ? (mediaState?.attributes?.volume_level as number | undefined) : undefined;
  const volPct = vol !== undefined ? Math.round(vol * 100) : undefined;
  const lastTime = deviceLastChanged(hass, device, language);

  return html`
    <button class="device ${statusClass}" @click=${() => onHandleAction(device.entityId, action)}>
      <div class="device-top">
        ${albumArt ? html`<img class="item-img" src=${albumArt} alt="">` : renderImage(config, assetKey, device.name, 'item-img')}
        <div class="tag-stack"><div class="status">${stateLabel}</div></div>
      </div>
      <div class="device-copy"><p class="device-name">${device.name}</p><p class="muted">${lastTime || device.subtitle}</p></div>
      <div class="control-row"><span class="state-word">${device.detail}</span>${action === 'play-pause' ? html`
        ${volPct !== undefined ? html`<ha-control-slider .value=${volPct} min="0" max="100" style="--control-slider-thickness:32px;--control-slider-border-radius:var(--sp-radius-pill)" @value-changed=${(e: CustomEvent) => { e.stopPropagation(); hass.callService('media_player', 'volume_set', { entity_id: device.entityId, volume_level: (e.detail.value ?? 0) / 100 }); }} @click=${(e: Event) => e.stopPropagation()} class="media-vol-slider"></ha-control-slider>` : ''}
        <ha-icon icon=${device.state === 'playing' ? 'mdi:pause' : 'mdi:play'} class="media-toggle-icon"></ha-icon>
      ` : (isClimate || action === 'toggle' ? html`<ha-control-switch .checked=${active} style="--control-switch-thickness:24px;--control-switch-border-radius:var(--sp-radius-pill);--control-switch-padding:3px;width:44px;flex-shrink:0" @change=${(e: Event) => { e.stopPropagation(); onHandleAction(device.entityId, 'toggle'); }} @click=${(e: Event) => e.stopPropagation()} .label=${device.name}></ha-control-switch>` : '')}</div>
    </button>
  `;
}
