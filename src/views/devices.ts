import { html, nothing } from 'lit';
import type { TemplateResult } from 'lit';

import type { RenderContext } from '../render/context';
import { getRealDevicesForRender, getDeviceRooms, getDeviceTypes, deviceTypeGroupKey } from '../selectors/devices';
import { domainGroupLabel } from '../selectors/areas';
import { renderPageShell } from '../components/page-shell';
import { renderDeviceCard } from '../components/device-card';
import { t } from '../utils';

/** Android Kiosk WebView tile budget — page long device lists (Mac: no paging). */
const ANDROID_KIOSK_DEVICE_PAGE_SIZE = 16;

export function renderDevicesView(ctx: RenderContext): TemplateResult {
  const allDevices = getRealDevicesForRender(ctx.hass, ctx.deviceRegistry, ctx.entityRegistry, ctx.areas);
  const rooms = getDeviceRooms(allDevices);
  const types = getDeviceTypes(allDevices);

  const filteredDevices = getRealDevicesForRender(ctx.hass, ctx.deviceRegistry, ctx.entityRegistry, ctx.areas, {
    filterRoom: ctx.filterRoom,
    filterType: ctx.filterType,
    hideUnassigned: ctx.hideUnassigned,
  });

  const pageSize = ctx.androidKiosk ? ANDROID_KIOSK_DEVICE_PAGE_SIZE : 0;
  const totalPages = pageSize > 0 ? Math.max(1, Math.ceil(filteredDevices.length / pageSize)) : 1;
  const pageIndex = Math.min(Math.max(0, ctx.devicePageIndex), totalPages - 1);
  const pagedDevices = pageSize > 0
    ? filteredDevices.slice(pageIndex * pageSize, pageIndex * pageSize + pageSize)
    : filteredDevices;

  const pager = ctx.androidKiosk && filteredDevices.length > ANDROID_KIOSK_DEVICE_PAGE_SIZE
    ? html`
      <div class="android-device-pager">
        <span>${pageIndex + 1} / ${totalPages}</span>
        <button
          type="button"
          class="android-device-page-button"
          ?disabled=${pageIndex <= 0}
          @click=${() => ctx.setDevicePageIndex(pageIndex - 1)}
          aria-label="prev"
        ><ha-icon icon="mdi:chevron-left"></ha-icon></button>
        <button
          type="button"
          class="android-device-page-button"
          ?disabled=${pageIndex >= totalPages - 1}
          @click=${() => ctx.setDevicePageIndex(pageIndex + 1)}
          aria-label="next"
        ><ha-icon icon="mdi:chevron-right"></ha-icon></button>
      </div>
    `
    : nothing;

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
        ${pager}
        ${renderRealDeviceGroups(ctx, pagedDevices)}
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
