import { html, nothing } from 'lit';
import type { TemplateResult } from 'lit';

import type { HassEntity, RenderedDevice } from '../types';
import type { RenderContext } from '../render/context';
import { renderImage, renderUserAvatar } from '../render/context';
import { renderNav } from '../components/nav';
import { renderMediaPlayer } from '../components/media-player';
import { renderMaintenanceCard } from '../components/maintenance';
import { renderWeather } from '../components/weather';
import { renderEnvironment } from '../components/environment';
import { renderBars } from '../components/energy-bars';
import { renderLiveCameraPreview } from '../components/camera-stream';
import { renderHomeEnergyCard } from './energy';
import { renderAreaRooms } from './rooms';
import { getRoomsForRender, areaFallbackInfo } from '../selectors/rooms';
import { getRealDevicesForRender } from '../selectors/devices';
import { renderDeviceCard } from '../components/device-card';
import {
  dateText,
  formatSceneOrScriptRelativeTime,
  localizedText,
  selectedSkin,
  skinString,
  stateValue,
  timeText,
} from '../utils';

export function renderHomeView(
  ctx: RenderContext,
  weatherIconName: string,
  quote: string,
  energyValue: string,
  energyUnit: string,
  compareValue: string,
): TemplateResult {
  const cameraEntityId = ctx.config.camera?.entity || '';
  const cameraState = cameraEntityId ? ctx.hass.states?.[cameraEntityId] : undefined;
  const hasCamera = Boolean(cameraState);

  const alarmEntityId = Object.keys(ctx.hass.states || {}).find(e => e.startsWith('alarm_control_panel.')) || '';
  const alarmStateObj = alarmEntityId ? ctx.hass.states?.[alarmEntityId] : undefined;
  const alarmState = alarmStateObj?.state || '';
  const alarmIconMap: Record<string, string> = {
    disarmed: 'mdi:shield-off', armed_home: 'mdi:shield-home', armed_away: 'mdi:shield-lock',
    armed_night: 'mdi:shield-moon', armed_vacation: 'mdi:shield-airplane', triggered: 'mdi:bell-ring',
    pending: 'mdi:shield-sync', arming: 'mdi:shield-sync',
  };
  const alarmIcon = alarmIconMap[alarmState] || 'mdi:shield-lock';

  const cameraCard = hasCamera ? (() => {
    // Display-only: do not open snapshot / more-info on click.
    return html`
      <section class="glass-card panel-camera panel-camera-static">
        <div class="section-title"><h2>${cameraState?.attributes?.friendly_name || cameraEntityId}</h2></div>
        ${renderLiveCameraPreview(ctx.hass, cameraState, 'camera-preview camera-live', 'live', { aspectRatio: null })}
      </section>
    `;
  })() : nothing;

  const energyBars = renderBars(ctx.energyHistory || []);
  // Cap column width: minmax(...,1fr) stretches a single card across the whole
  // devices row and leaves a huge empty middle (seen on official skins too).
  const homeDevicesStyle = window.matchMedia('(orientation: landscape)').matches
    ? 'display:grid;grid-auto-flow:column;grid-auto-columns:minmax(140px,200px);grid-template-columns:none;justify-content:start;overflow-x:auto;overflow-y:hidden;padding:var(--sp-space-xs);'
    : 'padding:var(--sp-space-xs);';

  return html`
    <div class="stage-grid">
      <div class="welcome-group">
        <section class="welcome" data-section="home">
          <h1>${ctx.config.title || localizedText(undefined, ctx.config.title_zh || skinString(selectedSkin(ctx.config), 'title_zh'), ctx.config.title_en || skinString(selectedSkin(ctx.config), 'title_en'), ctx.language)}</h1>
          <p class="quote">${quote}</p>
        </section>
        <div class="weather-with-meta">
          ${renderWeather(ctx.config, ctx.hass, weatherIconName, ctx.weatherForecast, ctx.onMoreInfo)}
          <div class="welcome-meta" style="flex:1;min-width:0;max-width:min(320px,42%);">
            <section class="time-card" style="width:100%;box-sizing:border-box;">
              <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;width:100%;min-width:0;">
                <span class="time-main">${timeText(ctx.hass, ctx.language)}</span>
                <span class="time-sub" style="font-size:var(--sp-font-sm);white-space:nowrap;">${dateText(ctx.hass, ctx.language)}</span>
                ${alarmEntityId ? html`
                <div class="time-icon" @click=${() => ctx.onHandleAction(alarmEntityId, 'more-info')} style="cursor:pointer;flex-shrink:0;">
                  <ha-icon icon=${alarmIcon}></ha-icon>
                </div>` : nothing}
              </div>
            </section>
            <section class="glass-card panel-environment" style="width:100%;box-sizing:border-box;margin-top:var(--sp-space-xs,6px);">
              <div class="env-list env-list-inline" style="gap:clamp(2px,0.6vw,6px) clamp(6px,1vw,12px);margin-top:0;">${renderEnvironment(ctx)}</div>
            </section>
          </div>
        </div>
      </div>
      <section class="bottom-stack">
        <section class="bottom-block bottom-devices">
          <div class="section-title"><h2>${ctx.translate('devices')}</h2><p class="muted">${ctx.translate('quickControl')}</p></div>
          <div class="devices" style=${homeDevicesStyle}>${renderShortcutDevices(ctx)}</div>
        </section>
        <section class="bottom-block">
          <div class="section-title"><h2>${ctx.translate('rooms')}</h2><p class="muted">${ctx.translate('roomSnapshots')}</p></div>
          <div class="rooms">${renderHomeRooms(ctx)}</div>
        </section>
      </section>
      <aside class="side">
        ${cameraCard}
        ${renderHomeEnergyCard(ctx, energyValue, energyUnit, compareValue, energyBars)}
        ${renderMediaPlayer(ctx.hass, ctx.config.media_player?.entity, ctx.translate)}
        ${renderMaintenanceCard(ctx.hass, ctx.translate)}
        <section class="glass-card panel-scenes" data-section="scenes">
          <div class="section-title"><h2>${ctx.translate('scenes')}</h2><p class="muted">${ctx.translate('modes')}</p></div>
          <div class="scene-grid">${renderHomeScenes(ctx)}</div>
        </section>
      </aside>
    </div>
  `;
}

export function renderSidebar(ctx: RenderContext): TemplateResult {
  return html`
    <aside class="sidebar">
      <div class="profile" @click=${() => ctx.onToggleKiosk()}>
        ${renderUserAvatar(ctx.config, ctx.hass, 'profile-img')}
        <div class="meta">
          <h2>${ctx.config.profile_name || ctx.hass?.user?.name || ''}</h2>
          <p class="muted">${ctx.config.profile_subtitle || localizedText(undefined, ctx.config.profile_subtitle_zh || skinString(selectedSkin(ctx.config), 'profile_subtitle_zh'), ctx.config.profile_subtitle_en || skinString(selectedSkin(ctx.config), 'profile_subtitle_en'), ctx.language)}</p>
        </div>
      </div>
      <nav class="menu">
        ${renderNav(ctx.config.nav, ctx.view, ctx.language, ctx.onNavigate)}
      </nav>
      <div class="sidebar-art">${renderImage(ctx.config, 'decor', 'Decor', '')}</div>
    </aside>
  `;
}

export function renderMobileNav(ctx: RenderContext): TemplateResult {
  return html`<nav class="mobile-nav">${renderNav(ctx.config.nav, ctx.view, ctx.language, ctx.onNavigate)}</nav>`;
}

function renderShortcutDevices(ctx: RenderContext): TemplateResult[] {
  const limit = ctx.config.home_limits?.devices || 5;
  const selectedEntities = ctx.config.home_selection?.devices || [];

  let realDevices: RenderedDevice[];

  if (selectedEntities.length > 0) {
    const colors: RenderedDevice['color'][] = ['yellow', 'green', 'blue', 'purple', 'red', 'brown'];
    realDevices = [];
    for (const entityId of selectedEntities) {
      const stateObj = ctx.hass.states[entityId];
      if (!stateObj) continue;
      const domain = entityId.split('.')[0] || '';
      realDevices.push({
        entityId,
        name: String(stateObj.attributes?.friendly_name || entityId),
        subtitle: '',
        detail: domain,
        state: stateObj.state,
        icon: String(stateObj.attributes?.icon || ''),
        color: colors[realDevices.length % colors.length]!,
      });
    }
  } else {
    const allRealDevices = getRealDevicesForRender(ctx.hass, ctx.deviceRegistry, ctx.entityRegistry, ctx.areas);
    realDevices = allRealDevices.slice(0, limit);
  }

  return realDevices.map((device) => renderDeviceCard(ctx.config, ctx.hass, device, ctx.language, ctx.onHandleAction, false, ctx.entityRegistry));
}

function renderHomeRooms(ctx: RenderContext): TemplateResult | typeof nothing {
  const limit = ctx.config.home_limits?.rooms || 4;
  const selectedRooms = ctx.config.home_selection?.rooms || [];
  const areaRooms = renderAreaRooms(ctx, ctx.areas, false, limit, selectedRooms);
  if (areaRooms !== nothing) return areaRooms;

  const rooms = getRoomsForRender(ctx.config.rooms, ctx.areas);
  if (rooms.length === 0) return nothing;
  return html`${rooms.map((room) => {
    const imageKey = room.image || 'room_living';
    const info = room.info_entity ? stateValue(ctx.hass, room.info_entity, ctx.language) : '';
    const fallbackInfo = ctx.areas?.length ? areaFallbackInfo(room, ctx.areas, ctx.hass, ctx.entityRegistry, ctx.deviceRegistry, ctx.language) : '--';
    const displayName = room.name || '--';
    return html`
      <button class="room" @click=${() => room.target ? ctx.onNavigatePath(room.target!) : undefined}>
        ${renderImage(ctx.config, imageKey, displayName, '')}
        <div class="room-label">
          <h3>${displayName}</h3>
          <p class="muted">${info || fallbackInfo || '--'}</p>
        </div>
      </button>
    `;
  })}`;
}

function renderHomeScenes(ctx: RenderContext): TemplateResult {
  const limit = ctx.config.home_limits?.scenes || 6;
  const selectedScenes = ctx.config.home_selection?.scenes || [];
  const scenes = renderRealScenes(ctx, limit, selectedScenes);
  if (scenes !== nothing) return scenes;
  return html`<div class="empty-state compact-empty">${ctx.translate('noScenes')}</div>`;
}

function renderRealScenes(
  ctx: RenderContext,
  limit = 12,
  selectedScenes: string[] = [],
): TemplateResult | typeof nothing {
  // Empty selection means show none — do not auto-fill every scene/script.
  const selected = selectedScenes.filter(Boolean);
  if (selected.length === 0) return nothing;

  const scenes = Object.values(ctx.hass.states)
    .filter((entity): entity is HassEntity => Boolean(isRunnableSceneEntity(entity?.entity_id)))
    .filter((entity) => selected.includes(entity.entity_id))
    .slice(0, limit);

  if (scenes.length === 0) return nothing;

  return html`${scenes.map((scene, index) => {
    const tones: Array<'morning' | 'night' | 'movie' | 'game'> = ['morning', 'night', 'movie', 'game'];
    const name = String(scene.attributes?.friendly_name || scene.entity_id);
    const lastActivated = formatSceneOrScriptRelativeTime(scene, ctx.language) || undefined;
    return html`
      <button class="scene ${tones[index % tones.length]}" @click=${() => ctx.onRunScene(scene.entity_id)}>
        <strong>${name}</strong>
        ${lastActivated ? html`<p class="muted">${lastActivated}</p>` : nothing}
      </button>
    `;
  })}`;
}

function isRunnableSceneEntity(entityId?: string): boolean {
  return Boolean(entityId?.startsWith('scene.') || entityId?.startsWith('script.'));
}
