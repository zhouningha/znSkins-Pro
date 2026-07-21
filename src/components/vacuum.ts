import { html } from 'lit';
import type { TemplateResult } from 'lit';

import type { DashboardConfig, HomeAssistant, RenderedDevice, TranslationKey } from '../types';
import type { Language } from '../i18n';
import { assetKeyForDomain, formatRelativeTime, selectedSkin, t } from '../utils';
import { renderImage } from '../render/context';
import { renderThemedSwitch } from './themed-switch';

const VACUUM_STATE_LABELS: Record<string, TranslationKey> = {
  cleaning: 'vacuumCleaning',
  docked: 'vacuumDocked',
  returning: 'vacuumReturning',
  paused: 'vacuumPaused',
  idle: 'vacuumIdle',
  error: 'vacuumError',
};

function vacuumStateLabel(state: string, language: Language): string {
  const key = VACUUM_STATE_LABELS[state];
  return key ? t(language, key) : state;
}

export function renderVacuumCard(
  config: DashboardConfig | undefined,
  hass: HomeAssistant,
  device: RenderedDevice,
  language: Language,
  onHandleAction: (entityId: string, action: string) => void,
): TemplateResult {
  const skin = selectedSkin(config);
  const assetKey = assetKeyForDomain(skin, 'vacuum');
  const stateObj = hass.states?.[device.entityId];

  if (!stateObj) {
    return html`<button class="device device-off" @click=${() => onHandleAction(device.entityId, 'more-info')}>
      <div class="device-top">${renderImage(config, assetKey, device.name, 'item-img')}<div class="tag-stack"><div class="status">${vacuumStateLabel(device.state, language)}</div></div></div>
      <div class="device-copy"><p class="device-name">${device.name}</p><p class="muted">${device.subtitle}</p></div>
    </button>`;
  }

  const state = stateObj.state;
  const a = stateObj.attributes || {};
  const fanSpeed = a.fan_speed as string | undefined;
  const fanSpeedList = (a.fan_speed_list as string[]) || [];
  const batteryLevel = a.battery_level as number | undefined;

  const isActive = state === 'cleaning' || state === 'returning';
  const isPaused = state === 'paused';

  const statusClass: string = isActive ? `device-on-${device.color}` : (state === 'unavailable' ? 'device-unavailable' : 'device-off');
  const statusText = batteryLevel !== undefined ? `${batteryLevel}%` : vacuumStateLabel(state, language);
  const lastTime = stateObj.last_changed ? formatRelativeTime(new Date(stateObj.last_changed), language) : device.subtitle;
  const mutedText = batteryLevel !== undefined ? vacuumStateLabel(state, language) : (lastTime || device.subtitle);

  const doService = (service: string) => {
    void hass.callService('vacuum', service, { entity_id: device.entityId });
  };
  const setFanSpeed = (speed: string) => {
    void hass.callService('vacuum', 'set_fan_speed', { entity_id: device.entityId, fan_speed: speed });
  };

  const btnStyle = 'width:32px;height:32px;padding:0;flex-shrink:0';

  const startBtn = html`<div class="media-volbtn" role="button" style=${btnStyle} title=${t(language, 'vacuumStart')} @click=${(e: Event) => { e.stopPropagation(); doService('start'); }}><ha-icon icon="mdi:play" style="--mdc-icon-size:14px"></ha-icon></div>`;
  const pauseBtn = html`<div class="media-volbtn" role="button" style=${btnStyle} title=${t(language, 'vacuumPause')} @click=${(e: Event) => { e.stopPropagation(); doService('pause'); }}><ha-icon icon="mdi:pause" style="--mdc-icon-size:14px"></ha-icon></div>`;
  const dockBtn = html`<div class="media-volbtn" role="button" style=${btnStyle} title=${t(language, 'vacuumDock')} @click=${(e: Event) => { e.stopPropagation(); doService('return_to_base'); }}><ha-icon icon="mdi:home" style="--mdc-icon-size:14px"></ha-icon></div>`;
  const locateBtn = html`<div class="media-volbtn" role="button" style=${btnStyle} title=${t(language, 'vacuumLocate')} @click=${(e: Event) => { e.stopPropagation(); doService('locate'); }}><ha-icon icon="mdi:map-marker" style="--mdc-icon-size:14px"></ha-icon></div>`;

  return html`
    <button class="device ${statusClass}" @click=${() => onHandleAction(device.entityId, 'more-info')}>
      <div class="device-top" @click=${(e: Event) => { e.stopPropagation(); onHandleAction(device.entityId, 'more-info'); }}>
        ${renderImage(config, assetKey, device.name, 'item-img')}
        <div class="tag-stack">
          <div class="status">${statusText}</div>
        </div>
      </div>
      <div class="device-copy">
        <p class="device-name">${device.name}</p>
        <p class="muted">${mutedText}</p>
      </div>
      <div class="control-row" style="gap:4px" @click=${(e: Event) => e.stopPropagation()}>
        ${fanSpeedList.length > 0 ? html`
        <select class="filter-select" style="font-size:var(--sp-font-3xs);min-height:32px;min-width:48px;padding:0 16px 0 4px;background-size:8px;flex-shrink:0" @change=${(e: Event) => { e.stopPropagation(); setFanSpeed((e.target as HTMLSelectElement).value); }} @click=${(e: Event) => e.stopPropagation()}>
          ${fanSpeedList.map(s => html`<option value=${s} ?selected=${s === fanSpeed}>${s}</option>`)}
        </select>` : ''}
        ${isActive ? pauseBtn : startBtn}
        ${(isActive || isPaused) ? dockBtn : ''}
        ${locateBtn}
        ${renderThemedSwitch(isActive, () => doService(isActive ? 'pause' : 'start'), device.name)}
      </div>
    </button>
  `;
}
