import { html, nothing } from 'lit';
import type { TemplateResult } from 'lit';

import type { EntityRegistryEntry, HassEntity, RenderedDevice } from '../types';
import type { RenderContext } from '../render/context';
import { renderPageShell } from '../components/page-shell';
import { renderImage } from '../render/context';
import { renderLiveCameraPreview } from '../components/camera-stream';
import { assetKeyForDomain, deviceStateLabel, selectedSkin, t } from '../utils';
import { alarmStateLabel } from '../components/alarm-control-panel';
import { setAlarmMode } from '../components/alarm-code-dialog';

const SECURITY_TOGGLE_DOMAINS = new Set([
  'light', 'switch', 'fan', 'cover', 'valve', 'media_player', 'lock',
  'input_boolean', 'automation', 'group', 'vacuum', 'humidifier', 'water_heater', 'siren',
]);

/** Sub-stream / low-res camera duplicates — keep main stream on security page. */
function isCameraSubstream(entity: HassEntity): boolean {
  if (!entity.entity_id.startsWith('camera.')) return false;
  const id = entity.entity_id.toLowerCase();
  const name = String(entity.attributes?.friendly_name || '');
  return (
    id.includes('zi_ma_liu')
    || id.includes('substream')
    || id.includes('minorstream')
    || id.includes('thirdstream')
    || /子码流/.test(name)
    || /sub\s*stream/i.test(name)
  );
}

function isRegistryHidden(entityId: string, registry: EntityRegistryEntry[] | undefined): boolean {
  const entry = registry?.find((item) => item.entity_id === entityId);
  if (!entry) return false;
  return Boolean(entry.hidden_by || entry.disabled_by);
}

/** Tablet / voice-assistant screen locks — not door access. */
function isNonDoorLock(entity: HassEntity): boolean {
  if (!entity.entity_id.startsWith('lock.')) return false;
  const id = entity.entity_id.toLowerCase();
  const name = String(entity.attributes?.friendly_name || '');
  return (
    id.includes('suo_ding_ping_mu')
    || id.includes('screen')
    || id.includes('lock_screen')
    || /锁定屏幕|锁屏|screen\s*lock/i.test(name)
  );
}

/** Door/window contacts + doorbell only — drop camera PIR / connectivity noise. */
function isUsefulSecurityBinarySensor(entity: HassEntity): boolean {
  if (!entity.entity_id.startsWith('binary_sensor.')) return false;
  const id = entity.entity_id.toLowerCase();
  const name = String(entity.attributes?.friendly_name || '');
  const deviceClass = String(entity.attributes?.device_class || '').toLowerCase();
  const hay = `${id} ${name}`;

  if (/cell_motion|camera_motion|connectivity|监控人体/.test(hay)) return false;
  if (['door', 'garage_door', 'window', 'opening'].includes(deviceClass)) return true;
  if (/ringing|doorbell|门铃/.test(hay)) return true;
  return false;
}

/** Keep primary door locks / open control; drop RelayB and Lock B duplicates. */
function isUsefulSecurityLock(entity: HassEntity): boolean {
  if (!entity.entity_id.startsWith('lock.')) return false;
  if (isNonDoorLock(entity)) return false;
  const id = entity.entity_id.toLowerCase();
  const name = String(entity.attributes?.friendly_name || '');
  if (/relayb|_lock_b|lock_b$/.test(id)) return false;
  // Keep Akuvox Lock A (deadbolt status); drop only Lock B.
  if (id === 'lock.akuvox_door_lock' || /akuvox_door_lock(?!_b)/.test(id)) return true;
  if (/门禁开门/.test(name) || /relaya/.test(id) || /^lock\.r20k_/.test(id)) return true;
  if (/akuvox|r20k|relay/.test(id)) return false;
  return true;
}

function isSecurityDoorRelayLock(entityId: string): boolean {
  return /^lock\..*(relay|relaya|relayb)(_|$)/i.test(entityId) || /^lock\.r20k_/i.test(entityId);
}

function securityDoorRelayStateLabel(state: string, language: string): string {
  if (state === 'unavailable' || state === 'unknown') {
    return language === 'zh-CN' ? '离线' : 'Offline';
  }
  // R20K/Akuvox relay: locked ≈ pulse/open circuit active in many integrations
  if (state === 'locked') return language === 'zh-CN' ? '可开门' : 'Ready';
  if (state === 'unlocked') return language === 'zh-CN' ? '已释放' : 'Released';
  return state;
}

export function renderSecurityView(ctx: RenderContext): TemplateResult {
  const cards = renderSecurityCards(ctx);
  const editBar = ctx.kioskFullscreen
    ? nothing
    : html`
      <div class="filter-bar" style="justify-content:flex-start;margin-bottom:10px;">
        <button
          class="chip${ctx.securityHideEditMode ? ' active' : ''}"
          @click=${() => ctx.setSecurityHideEditMode(!ctx.securityHideEditMode)}
        >${ctx.translate('editHidden')}</button>
        ${ctx.securityHideEditMode
          ? html`<span class="muted" style="font-size:12px;opacity:0.85;">${ctx.translate('hideSecurityHint')}</span>`
          : nothing}
      </div>
    `;

  return renderPageShell(
    ctx.translate('security'),
    ctx.translate('securityOverview'),
    html``,
    cards !== nothing
      ? html`<div class="page-scroll themed-scrollbar">${editBar}<div class="devices security-grid">${cards}</div></div>`
      : html`<div class="empty-state">${ctx.translate('offline')}</div>`
  );
}

function onSecurityCardClick(ctx: RenderContext, entityId: string, event?: Event): void {
  if (ctx.securityHideEditMode) {
    event?.preventDefault();
    event?.stopPropagation();
    ctx.onToggleSecurityHidden(entityId);
    return;
  }
  ctx.onHandleAction(entityId, 'more-info');
}

function renderSecurityCards(ctx: RenderContext): TemplateResult | typeof nothing {
  const hiddenSet = new Set(ctx.securityHidden);
  const all = Object.values(ctx.hass.states)
    .filter((entity): entity is HassEntity => Boolean(entity?.entity_id && /^(camera|lock|alarm_control_panel|binary_sensor)\./.test(entity.entity_id)))
    .filter((entity) => {
      if (isRegistryHidden(entity.entity_id, ctx.entityRegistry)) return false;
      if (isCameraSubstream(entity)) return false;
      if (!ctx.securityHideEditMode && hiddenSet.has(entity.entity_id)) return false;
      if (entity.entity_id.startsWith('binary_sensor.')) return isUsefulSecurityBinarySensor(entity);
      if (entity.entity_id.startsWith('lock.')) return isUsefulSecurityLock(entity);
      return true;
    });

  const cameraLimit = ctx.securityHideEditMode ? 12 : 6;
  const otherLimit = ctx.securityHideEditMode ? 16 : 8;
  const cameras = all.filter((e) => e.entity_id.startsWith('camera.')).slice(0, cameraLimit);
  const others = all.filter((e) => !e.entity_id.startsWith('camera.')).slice(0, otherLimit);
  const entities = [...cameras, ...others];

  if (entities.length === 0) return nothing;

  const skin = selectedSkin(ctx.config);

  const cameraCards = cameras.map(entity => {
    const domain = entity.entity_id.split('.')[0] || 'camera';
    const stateLabel = deviceStateLabel(entity.state, ctx.language, ctx.hass, domain);
    const entityPicture = String(entity.attributes?.entity_picture || '');
    const accessToken = String(entity.attributes?.access_token || '');
    const snapshotUrl = entityPicture
      || (accessToken
        ? `/api/camera_proxy/${entity.entity_id}?token=${encodeURIComponent(accessToken)}`
        : `/api/camera_proxy/${entity.entity_id}`);
    const openSnapshot = (event: Event) => {
      if (ctx.securityHideEditMode) {
        onSecurityCardClick(ctx, entity.entity_id, event);
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      window.open(`${snapshotUrl}${snapshotUrl.includes('?') ? '&' : '?'}ts=${Date.now()}`, '_blank', 'noopener');
    };
    const isHidden = hiddenSet.has(entity.entity_id);
    return html`
      <button
        class="camera-card${isHidden ? ' security-card-hidden' : ''}"
        style=${isHidden ? 'opacity:0.55;' : nothing}
        @click=${openSnapshot}
      >
        ${renderLiveCameraPreview(ctx.hass, entity)}
        <div class="camera-meta">
          <div>
            <p class="device-name">${String(entity.attributes?.friendly_name || entity.entity_id)}</p>
            <p class="muted">${ctx.securityHideEditMode && isHidden ? t(ctx.language, 'entityHidden') : t(ctx.language, 'snapshot')}</p>
          </div>
          <div class="status">${ctx.securityHideEditMode ? (isHidden ? t(ctx.language, 'entityHidden') : t(ctx.language, 'editHidden')) : stateLabel}</div>
        </div>
      </button>
    `;
  });

  const otherCards = others.map((entity, index) => {
    const domain = entity.entity_id.split('.')[0] || 'sensor';
    const isAlarm = domain === 'alarm_control_panel';
    const isRelayLock = domain === 'lock' && isSecurityDoorRelayLock(entity.entity_id);
    const stateLabel = isAlarm
      ? alarmStateLabel(entity.state, ctx.language)
      : isRelayLock
        ? securityDoorRelayStateLabel(entity.state, ctx.language)
        : deviceStateLabel(entity.state, ctx.language, ctx.hass, domain);
    const assetKey = assetKeyForDomain(skin, domain);
    const tones: RenderedDevice['color'][] = ['red', 'green', 'blue', 'purple', 'yellow', 'brown'];
    const statusClass = entity.state === 'unavailable' ? 'device-unavailable' : `device-on-${tones[index % tones.length]}`;
    const togglable = SECURITY_TOGGLE_DOMAINS.has(domain) && !isRelayLock;
    const isHidden = hiddenSet.has(entity.entity_id);

    let control: TemplateResult;
    if (ctx.securityHideEditMode) {
      control = html`<div class="control-row" style="justify-content:flex-end"><span class="state-word">${isHidden ? t(ctx.language, 'entityHidden') : t(ctx.language, 'editHidden')}</span></div>`;
    } else if (isRelayLock) {
      control = html`<div class="control-row" style="justify-content:flex-end"><span class="state-word">${stateLabel}</span></div>`;
    } else if (isAlarm) {
      const attrs = entity.attributes || {};
      const supportedFeatures = (attrs.supported_features as number) || 0;
      const isArmed = /armed_/.test(entity.state);
      const isTriggered = entity.state === 'triggered';
      const isPending = entity.state === 'pending' || entity.state === 'arming' || entity.state === 'disarming';
      const iconStyle = '--mdc-icon-size:18px;color:var(--sp-text-primary);display:flex;cursor:pointer';
      const armModes = [
        { f: 2, i: 'mdi:shield-lock', s: 'alarm_arm_away', k: 'alarmArmedAway' as const },
        { f: 1, i: 'mdi:shield-home', s: 'alarm_arm_home', k: 'alarmArmedHome' as const },
        { f: 4, i: 'mdi:shield-moon', s: 'alarm_arm_night', k: 'alarmArmedNight' as const },
      ].filter(m => supportedFeatures & m.f);
      const fallbackArms = armModes.length > 0 ? armModes : [
        { f: 0, i: 'mdi:shield-lock', s: 'alarm_arm_away', k: 'alarmArmedAway' as const },
        { f: 0, i: 'mdi:shield-home', s: 'alarm_arm_home', k: 'alarmArmedHome' as const },
      ];

      const armBtns = isPending
        ? html`<ha-icon icon=${isTriggered ? 'mdi:bell-ring' : 'mdi:shield-lock'} style=${iconStyle}></ha-icon>`
        : html`${fallbackArms.slice(0, 3).map(m => html`<ha-icon icon=${m.i} style=${iconStyle} title=${t(ctx.language, m.k)} @click=${(e: Event) => { e.stopPropagation(); void setAlarmMode(e.currentTarget as HTMLElement, ctx.hass, entity.entity_id, m.s, false); }}></ha-icon>`)}`;
      const disarmBtn = (isArmed || isTriggered)
        ? html`<ha-icon icon="mdi:shield-off" style=${iconStyle} title=${t(ctx.language, 'alarmDisarmed')} @click=${(e: Event) => { e.stopPropagation(); void setAlarmMode(e.currentTarget as HTMLElement, ctx.hass, entity.entity_id, 'alarm_disarm', true); }}></ha-icon>`
        : '';
      control = html`<div class="control-row" style="justify-content:flex-end;gap:6px" @click=${(e: Event) => e.stopPropagation()}>${armBtns}${disarmBtn}</div>`;
    } else if (togglable) {
      control = html`<div class="control-row" style="justify-content:flex-end"><ha-control-switch .checked=${['on', 'playing', 'open', 'locked'].includes(entity.state)} style="--control-switch-thickness:24px;--control-switch-border-radius:var(--sp-radius-pill);--control-switch-padding:3px;width:44px;flex-shrink:0" @click=${(e: Event) => e.stopPropagation()} @change=${(e: Event) => { e.stopPropagation(); ctx.onHandleAction(entity.entity_id, 'toggle'); }} .label=${String(entity.attributes?.friendly_name || entity.entity_id)}></ha-control-switch></div>`;
    } else {
      control = html`<div class="control-row" style="justify-content:flex-end"><span class="state-word">${stateLabel}</span></div>`;
    }

    return html`
      <button
        class="device ${statusClass}${isHidden ? ' security-card-hidden' : ''}"
        style=${isHidden ? 'opacity:0.55;' : nothing}
        @click=${(e: Event) => onSecurityCardClick(ctx, entity.entity_id, e)}
      >
        <div class="device-top">
          ${renderImage(ctx.config, assetKey, String(entity.attributes?.friendly_name || entity.entity_id), 'item-img')}
          <div class="tag-stack"><div class="status">${ctx.securityHideEditMode && isHidden ? t(ctx.language, 'entityHidden') : stateLabel}</div></div>
        </div>
        <div class="device-copy"><p class="device-name">${String(entity.attributes?.friendly_name || entity.entity_id)}</p><p class="muted">${t(ctx.language, 'security')}</p></div>
        ${control}
      </button>
    `;
  });

  return html`
    ${cameraCards.length > 0 ? html`<div class="security-cameras">${cameraCards}</div>` : nothing}
    ${otherCards.length > 0 ? html`<div class="security-devices">${otherCards}</div>` : nothing}
  `;
}
