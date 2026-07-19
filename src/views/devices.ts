import { html, nothing } from 'lit';
import type { TemplateResult } from 'lit';

import type { RenderContext } from '../render/context';
import { getRealDevicesForRender, getDeviceRooms, getDeviceTypes, deviceTypeGroupKey } from '../selectors/devices';
import { domainGroupLabel } from '../selectors/areas';
import { renderPageShell } from '../components/page-shell';
import { renderDeviceCard } from '../components/device-card';
import { t } from '../utils';

export function renderDevicesView(ctx: RenderContext): TemplateResult {
  const allDevices = getRealDevicesForRender(ctx.hass, ctx.deviceRegistry, ctx.entityRegistry, ctx.areas);
  const rooms = getDeviceRooms(allDevices);
  const types = getDeviceTypes(allDevices);

  const filteredDevices = getRealDevicesForRender(ctx.hass, ctx.deviceRegistry, ctx.entityRegistry, ctx.areas, {
    filterRoom: ctx.filterRoom,
    filterType: ctx.filterType,
    hideUnassigned: ctx.hideUnassigned,
  });

  return renderPageShell(
    ctx.translate('devices'),
    ctx.translate('quickControl'),
    ctx.kioskFullscreen ? html`` : html`
      <div class="filter-bar">
        <button class="chip${ctx.deviceGrouping === 'area' ? ' active' : ''}" @click=${() => ctx.setDeviceGrouping('area')}>${ctx.translate('byArea')}</button>
        <button class="chip${ctx.deviceGrouping === 'domain' ? ' active' : ''}" @click=${() => ctx.setDeviceGrouping('domain')}>${ctx.translate('byType')}</button>
        <select class="filter-select" style="min-height:32px" @change=${(e: Event) => ctx.setFilterRoom((e.target as HTMLSelectElement).value)}>
          <option value="">${ctx.translate('allRooms')}</option>
          ${rooms.map((r) => html`<option value="${r}" .selected=${r === ctx.filterRoom}>${r}</option>`)}
        </select>
        <select class="filter-select" style="min-height:32px" @change=${(e: Event) => ctx.setFilterType((e.target as HTMLSelectElement).value)}>
          <option value="">${ctx.translate('allTypes')}</option>
          ${types.map((t) => html`<option value="${t}" .selected=${t === ctx.filterType}>${domainGroupLabel(t, ctx.language)}</option>`)}
        </select>
        <select class="filter-select" style="min-height:32px" @change=${(e: Event) => ctx.setHideUnassigned((e.target as HTMLSelectElement).value === 'true')}>
          <option value="true" .selected=${ctx.hideUnassigned}>${ctx.translate('hideUnassigned')}</option>
          <option value="false" .selected=${!ctx.hideUnassigned}>${ctx.translate('showAll')}</option>
        </select>
        <button class="action-btn" @click=${() => ctx.onBatchControl('on')}>${ctx.translate('turnOnAll')}</button>
        <button class="action-btn" @click=${() => ctx.onBatchControl('off')}>${ctx.translate('turnOffAll')}</button>
      </div>
    `,
    html`
      <div class="page-scroll themed-scrollbar">
        ${renderRealDeviceGroups(ctx, filteredDevices)}
      </div>
    `
  );
}

function renderRealDeviceGroups(ctx: RenderContext, devices: ReturnType<typeof getRealDevicesForRender>): TemplateResult | typeof nothing {
  if (devices.length === 0) {
    return html`<div class="empty-state">${ctx.translate('noDevices')}</div>`;
  }

  const groups = new Map<string, typeof devices>();
  for (const device of devices) {
    const groupKey = ctx.deviceGrouping === 'domain'
      ? deviceTypeGroupKey(device.detail)
      : (device.subtitle || t(ctx.language, 'otherGroup'));
    const current = groups.get(groupKey) || [];
    current.push(device);
    groups.set(groupKey, current);
  }

  return html`${Array.from(groups.entries()).map(([group, items]) => {
    const groupLabel = ctx.deviceGrouping === 'domain'
      ? items.length > 0 ? domainGroupLabel(deviceTypeGroupKey(items[0]!.detail), ctx.language) : group
      : group;
    return html`
      <section class="device-group">
        <div class="section-title"><h2>${groupLabel}</h2><p class="muted">${String(items.length)}</p></div>
        <div class="devices devices-page-grid">
          ${items.map((device) => renderDeviceCard(ctx.config, ctx.hass, device, ctx.language, ctx.onHandleAction, true, ctx.entityRegistry))}
        </div>
      </section>
    `;
  })}`;
}
