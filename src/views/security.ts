import { html, nothing } from 'lit';
import type { TemplateResult } from 'lit';

import type { EntityRegistryEntry, HassEntity, RenderedDevice, SecurityGo2rtcStream, SecurityMonitorSource } from '../types';
import type { RenderContext } from '../render/context';
import { renderPageShell } from '../components/page-shell';
import { renderImage } from '../render/context';
import { renderGo2rtcLivePreview, renderLiveCameraPreview } from '../components/camera-stream';
import { assetKeyForDomain, deviceStateLabel, selectedSkin, t } from '../utils';
import { alarmStateLabel } from '../components/alarm-control-panel';
import { setAlarmMode } from '../components/alarm-code-dialog';
import { renderThemedSwitch } from '../components/themed-switch';

const SECURITY_TOGGLE_DOMAINS = new Set([
  'light', 'switch', 'fan', 'cover', 'valve', 'media_player', 'lock',
  'input_boolean', 'automation', 'group', 'vacuum', 'humidifier', 'water_heater', 'siren',
]);

/**
 * Map known HA camera entities → go2rtc stream names used by this house.
 * Akuvox / R20K MUST use akuvox_sub only (never HA camera.* live on the same RTSP).
 */
const CAMERA_ENTITY_TO_GO2RTC: Record<string, { stream: string; label?: string }> = {
  'camera.r20k_profile_name_2': { stream: 'akuvox_sub', label: '门禁监控' },
  'camera.r20k_profile_name': { stream: 'akuvox_sub', label: '门禁监控' },
  'camera.akuvox_door_camera': { stream: 'akuvox_sub', label: '门禁监控' },
  'camera.tp_ipc_mainstream': { stream: 'tp_ipc_main', label: '监控' },
  'camera.tp_ipc_minorstream': { stream: 'tp_ipc_main', label: '监控' },
  'camera.yw_substream': { stream: 'yw_sub', label: '客厅监控' },
  'camera.yw_mainstream': { stream: 'yw_sub', label: '客厅监控' },
};

function isDoorStationCamera(entityId: string): boolean {
  const id = entityId.trim().toLowerCase();
  if (!id.startsWith('camera.')) return false;
  if (/r20k|akuvox/.test(id)) return true;
  return CAMERA_ENTITY_TO_GO2RTC[id]?.stream === 'akuvox_sub';
}

function normalizeMonitorSource(raw: SecurityMonitorSource | SecurityGo2rtcStream): SecurityMonitorSource | null {
  const stream = String(raw.stream || raw.entity || '').trim();
  if (!stream) return null;
  const provider = raw.provider
    || (raw.entity || stream.startsWith('camera.') ? 'ha-camera' : 'go2rtc-mjpeg');
  return {
    stream,
    label: raw.label,
    provider: provider as SecurityMonitorSource['provider'],
    entity: raw.entity,
    go2rtc_url: raw.go2rtc_url,
    modes: raw.modes,
  };
}

/** Regular / door camera entity → monitor source. */
function cameraEntityToMonitorSource(
  entityId: string,
  hass: RenderContext['hass'],
  kind: 'door' | 'camera',
): SecurityMonitorSource | null {
  const id = entityId.trim();
  if (!id.startsWith('camera.')) return null;
  const friendly = String(hass.states?.[id]?.attributes?.friendly_name || '').trim();
  const mapped = CAMERA_ENTITY_TO_GO2RTC[id];

  if (kind === 'door' || isDoorStationCamera(id)) {
    return {
      stream: mapped?.stream === 'akuvox_sub' || /r20k|akuvox/i.test(id)
        ? 'akuvox_sub'
        : (mapped?.stream || 'akuvox_sub'),
      label: mapped?.label || friendly || '门禁监控',
      provider: 'go2rtc-mjpeg',
      entity: id,
    };
  }

  if (mapped) {
    return {
      stream: mapped.stream,
      label: mapped.label || friendly || mapped.stream,
      provider: 'go2rtc-mjpeg',
      entity: id,
    };
  }
  return {
    stream: id,
    label: friendly || id,
    provider: 'ha-camera',
    entity: id,
  };
}

function configuredDoorCameraId(page: RenderContext['config']['security_page']): string {
  const direct = String(page?.door_camera || '').trim();
  if (direct) return direct;
  // Legacy: first door-station cam in selection
  const legacy = (page?.selection || []).find((id) => isDoorStationCamera(id));
  return legacy || '';
}

function configuredCameraIds(page: RenderContext['config']['security_page']): string[] {
  const cams = (page?.cameras || []).map((id) => id.trim()).filter(Boolean);
  if (cams.length) return cams.filter((id) => !isDoorStationCamera(id));
  // Legacy selection without cameras[] — keep non-door only
  return (page?.selection || []).filter((id) => id && !isDoorStationCamera(id));
}

/**
 * Door preview first (if configured), then regular cameras.
 * Empty config → no video cards.
 */
function listSecurityMonitorSources(ctx: RenderContext): SecurityMonitorSource[] {
  const page = ctx.config.security_page;
  const advanced = page?.streams;
  if (Array.isArray(advanced) && advanced.length > 0) {
    return advanced
      .map((s) => normalizeMonitorSource(s))
      .filter((s): s is SecurityMonitorSource => Boolean(s));
  }

  const out: SecurityMonitorSource[] = [];
  const seen = new Set<string>();

  const doorCam = configuredDoorCameraId(page);
  if (doorCam) {
    const src = cameraEntityToMonitorSource(doorCam, ctx.hass, 'door');
    if (src && !seen.has(src.stream)) {
      seen.add(src.stream);
      out.push(src);
    }
  }

  for (const entityId of configuredCameraIds(page)) {
    const src = cameraEntityToMonitorSource(entityId, ctx.hass, 'camera');
    if (!src || seen.has(src.stream)) continue;
    seen.add(src.stream);
    out.push(src);
  }
  return out;
}

function securityCamHideId(source: SecurityMonitorSource): string {
  return source.entity || `go2rtc:${source.stream}`;
}

function renderSecurityCamPreview(ctx: RenderContext, item: SecurityMonitorSource): TemplateResult {
  if (item.provider === 'ha-camera') {
    const entityId = item.entity || item.stream;
    const state = ctx.hass.states?.[entityId];
    if (state) {
      return renderLiveCameraPreview(ctx.hass, state, 'camera-preview camera-live', 'live', {
        aspectRatio: '16:10',
        fitMode: 'cover',
      });
    }
  }
  return renderGo2rtcLivePreview(item.stream, 'camera-preview camera-live', item.go2rtc_url);
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

  if (/cell_motion|camera_motion|connectivity|监控人体|motion_alarm|人体传感器/.test(hay)) {
    return false;
  }
  if (deviceClass === 'motion' || deviceClass === 'occupancy' || deviceClass === 'connectivity') {
    return false;
  }
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
      <div
        class="filter-bar security-hide-bar"
        style="justify-content:flex-start;margin-bottom:10px;position:relative;z-index:20;"
      >
        <button
          type="button"
          class="chip security-hide-chip${ctx.securityHideEditMode ? ' active' : ''}"
          ?disabled=${ctx.securityHideSaving}
          @click=${(e: Event) => {
            e.preventDefault();
            e.stopPropagation();
            if (ctx.securityHideSaving) return;
            if (ctx.securityHideEditMode) ctx.setSecurityHideEditMode(false);
            else ctx.setSecurityHideEditMode(true);
          }}
        >${ctx.securityHideEditMode
          ? (ctx.securityHideSaving ? ctx.translate('editHiddenSaving') : ctx.translate('editHiddenDone'))
          : ctx.translate('editHidden')}</button>
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

let lastLockDialogAt = 0;

function onSecurityCardClick(ctx: RenderContext, entityId: string, event?: Event): void {
  event?.preventDefault();
  event?.stopPropagation();
  if (ctx.securityHideEditMode) {
    ctx.onToggleSecurityHidden(entityId);
    return;
  }
  if (entityId.startsWith('lock.')) {
    const now = Date.now();
    if (now - lastLockDialogAt < 400) return;
    lastLockDialogAt = now;
    ctx.onHandleAction(entityId, 'lock-dialog');
    return;
  }
  ctx.onHandleAction(entityId, 'more-info');
}

function renderSecurityCards(ctx: RenderContext): TemplateResult | typeof nothing {
  const hiddenSet = new Set(ctx.securityHidden);
  const monitorSources = listSecurityMonitorSources(ctx);
  const visibleStreams = monitorSources.filter((s) => {
    const hideId = securityCamHideId(s);
    if (ctx.securityHideEditMode) return true;
    return !hiddenSet.has(hideId) && !hiddenSet.has(s.stream)
      && !(s.entity && hiddenSet.has(s.entity));
  });
  const doorLockId = String(ctx.config.security_page?.door_lock || '').trim();
  const others = Object.values(ctx.hass.states)
    .filter((entity): entity is HassEntity => Boolean(entity?.entity_id && /^(lock|alarm_control_panel|binary_sensor)\./.test(entity.entity_id)))
    .filter((entity) => {
      if (isRegistryHidden(entity.entity_id, ctx.entityRegistry)) return false;
      if (!ctx.securityHideEditMode && hiddenSet.has(entity.entity_id)) return false;
      if (entity.entity_id.startsWith('binary_sensor.')) return isUsefulSecurityBinarySensor(entity);
      if (entity.entity_id.startsWith('lock.')) {
        if (isNonDoorLock(entity)) return false;
        const id = entity.entity_id.toLowerCase();
        const name = String(entity.attributes?.friendly_name || '');
        const isDoor = isSecurityDoorRelayLock(entity.entity_id)
          || /akuvox|r20k|门禁/.test(`${id} ${name}`);
        // 门禁锁：只显示编辑器选中的 door_lock；未选则不显示。
        if (isDoor) return Boolean(doorLockId) && entity.entity_id === doorLockId;
        return isUsefulSecurityLock(entity);
      }
      return true;
    })
    .slice(0, ctx.securityHideEditMode ? 24 : 8);

  if (visibleStreams.length === 0 && others.length === 0) return nothing;

  const skin = selectedSkin(ctx.config);

  const cameraCards = visibleStreams.map((item) => {
    const hideId = securityCamHideId(item);
    const isHidden = hiddenSet.has(hideId) || hiddenSet.has(item.stream)
      || Boolean(item.entity && hiddenSet.has(item.entity));
    const label = item.label || item.stream;
    const onCameraClick = (event: Event) => {
      if (!ctx.securityHideEditMode) return;
      event.preventDefault();
      event.stopPropagation();
      ctx.onToggleSecurityHidden(hideId);
    };
    return html`
      <div
        class="camera-card${isHidden ? ' security-card-hidden' : ''}${ctx.securityHideEditMode ? ' camera-card-edit' : ''}"
        style=${isHidden ? 'opacity:0.55;' : nothing}
        role=${ctx.securityHideEditMode ? 'button' : nothing}
        @click=${onCameraClick}
      >
        ${renderSecurityCamPreview(ctx, item)}
        <div class="camera-meta camera-meta-overlay">
          <p class="device-name">${label}</p>
          ${ctx.securityHideEditMode ? html`
            <span class="status">${isHidden ? t(ctx.language, 'entityHidden') : t(ctx.language, 'tapToHide')}</span>
          ` : nothing}
        </div>
      </div>
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
      control = html`<div class="control-row" style="justify-content:flex-end"><span class="state-word">${isHidden ? t(ctx.language, 'entityHidden') : t(ctx.language, 'tapToHide')}</span></div>`;
    } else if (isRelayLock) {
      control = html`<div class="control-row" style="justify-content:flex-end"><span class="state-word lock-open-hint">${ctx.language === 'zh-CN' ? '点击开门' : 'Tap to open'}</span></div>`;
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
      control = html`<div class="control-row" style="justify-content:flex-end">${renderThemedSwitch(['on', 'playing', 'open', 'locked'].includes(entity.state), () => ctx.onHandleAction(entity.entity_id, 'toggle'), String(entity.attributes?.friendly_name || entity.entity_id))}</div>`;
    } else {
      control = html`<div class="control-row" style="justify-content:flex-end"><span class="state-word">${stateLabel}</span></div>`;
    }

    return html`
      <button
        type="button"
        class="device ${statusClass}${isHidden ? ' security-card-hidden' : ''}${!ctx.securityHideEditMode && domain === 'lock' ? ' security-lock-card' : ''}"
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
