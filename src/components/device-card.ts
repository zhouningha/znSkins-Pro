import { html, nothing } from 'lit';
import type { TemplateResult } from 'lit';

import type { DashboardConfig, EntityRegistryEntry, HomeAssistant, RenderedDevice } from '../types';
import type { Language } from '../i18n';
import { domainLabel } from '../utils/domain-labels';
import { assetKeyForDomain, deviceStateLabel, formatRelativeTime, formatSceneOrScriptRelativeTime, selectedSkin } from '../utils';
import { renderImage } from '../render/context';
import { renderClimateCard } from './climate';
import { renderLightCard } from './light';
import { renderFanCard } from './fan';
import { renderHumidifierCard } from './humidifier';
import { renderVacuumCard } from './vacuum';
import { renderWaterHeaterCard } from './water-heater';
import { renderAlarmControlPanelCard } from './alarm-control-panel';
import { renderThemedSwitch } from './themed-switch';
import { renderPositionBar, renderVolumeBar } from './position-bar';

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
  if (domain === 'scene' || domain === 'script') {
    return stateObj ? (formatSceneOrScriptRelativeTime(stateObj, language) || undefined) : undefined;
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
  showDomain = false,
  entityRegistry?: EntityRegistryEntry[],
): TemplateResult {
  const isClimate = device.detail === 'climate';
  if (isClimate) {
    return renderClimateCard(config, hass, device, language, onHandleAction);
  }

  const isLight = device.detail === 'light';
  if (isLight) {
    return renderLightCard(config, hass, device, language, onHandleAction, entityRegistry);
  }

  if (device.detail === 'fan') {
    return renderFanCard(config, hass, device, language, onHandleAction);
  }

  if (device.detail === 'humidifier') {
    return renderHumidifierCard(config, hass, device, language, onHandleAction);
  }

  if (device.detail === 'vacuum') {
    return renderVacuumCard(config, hass, device, language, onHandleAction);
  }

  if (device.detail === 'water_heater') {
    return renderWaterHeaterCard(config, hass, device, language, onHandleAction);
  }

  if (device.detail === 'alarm_control_panel') {
    return renderAlarmControlPanelCard(config, hass, device, language, onHandleAction);
  }

  const stateLabel = deviceStateLabel(device.state, language, hass, device.detail);
  const active = ['on', 'playing', 'paused', 'cool', 'heat', 'armed', 'locked', 'open'].includes(device.state);
  const statusClass = active ? `device-on-${device.color}` : (device.state === 'unavailable' ? 'device-unavailable' : 'device-off');
  const skin = selectedSkin(config);
  const assetKey = assetKeyForDomain(skin, device.entityId.split('.')[0] || 'sensor');
  const isMedia = device.detail === 'media_player';
  const isCover = device.detail === 'cover';
  const isValve = device.detail === 'valve';
  const stateObj = hass.states?.[device.entityId];
  const attrs = (stateObj?.attributes || {}) as Record<string, unknown>;
  // HA CoverEntityFeature.SET_POSITION / ValveEntityFeature.SET_POSITION = 4
  const rawPos = attrs.current_position;
  const posNum = typeof rawPos === 'number' ? rawPos : (typeof rawPos === 'string' ? Number(rawPos) : NaN);
  const coverPos = Number.isFinite(posNum) ? posNum : undefined;
  const canSetPos = (isCover || isValve) && (
    coverPos !== undefined || (Number(attrs.supported_features || 0) & 4) !== 0
  );
  const displayPos = coverPos !== undefined
    ? coverPos
    : (device.state === 'open' || device.state === 'opening' ? 100
      : device.state === 'closed' || device.state === 'closing' ? 0 : 50);
  const action = isMedia
    ? 'play-pause'
    : (canSetPos
      ? 'position'
      : (CONTROLLABLE_DOMAINS.has(device.detail) ? 'toggle' : 'more-info'));
  const mediaState = isMedia ? stateObj : undefined;
  const albumArt = isMedia ? (mediaState?.attributes?.entity_picture as string | undefined) : undefined;
  const vol = isMedia ? (mediaState?.attributes?.volume_level as number | undefined) : undefined;
  const volPct = vol !== undefined ? Math.round(vol * 100) : undefined;
  const lastTime = deviceLastChanged(hass, device, language);

  let control: TemplateResult | typeof nothing = nothing;
  if (action === 'play-pause') {
    control = html`
      ${volPct !== undefined ? renderVolumeBar(hass, device.entityId, vol) : ''}
      <ha-icon icon="mdi:skip-previous" style="--mdc-icon-size:16px;color:var(--sp-text-primary);display:flex;cursor:pointer;opacity:.6" @click=${(e: Event) => { e.stopPropagation(); hass.callService('media_player', 'media_previous_track', { entity_id: device.entityId }); }}></ha-icon>
      <ha-icon icon=${device.state === 'playing' ? 'mdi:pause' : 'mdi:play'} class="media-toggle-icon"></ha-icon>
      <ha-icon icon="mdi:skip-next" style="--mdc-icon-size:16px;color:var(--sp-text-primary);display:flex;cursor:pointer;opacity:.6" @click=${(e: Event) => { e.stopPropagation(); hass.callService('media_player', 'media_next_track', { entity_id: device.entityId }); }}></ha-icon>
    `;
  } else if (action === 'position') {
    control = renderPositionBar(hass, device.entityId, isValve ? 'valve' : 'cover', displayPos);
  } else if (action === 'toggle') {
    control = renderThemedSwitch(active, () => onHandleAction(device.entityId, action), device.name);
  }

  return html`
    <button class="device ${statusClass}" @click=${action === 'position' ? undefined : () => onHandleAction(device.entityId, action)} style=${action === 'position' ? 'cursor:default' : ''}>
      <div class="device-top">
        ${albumArt ? html`<img class="item-img" src=${albumArt} alt="">` : renderImage(config, assetKey, device.name, 'item-img')}
        <div class="tag-stack"><div class="status">${stateLabel}</div></div>
      </div>
      <div class="device-copy"><p class="device-name">${device.name}</p><p class="muted">${lastTime || device.subtitle}</p></div>
      <div class="control-row" style=${showDomain ? '' : 'justify-content:flex-end'}>
        ${showDomain ? html`<span class="state-word">${domainLabel(device.detail, language)}</span>` : ''}
        ${control}
      </div>
    </button>
  `;
}
