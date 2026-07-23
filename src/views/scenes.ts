import { html } from 'lit';
import type { TemplateResult } from 'lit';

import type { AreaRegistryEntry, HassEntity } from '../types';
import type { RenderContext } from '../render/context';
import { renderPageShell } from '../components/page-shell';
import { renderImage } from '../render/context';
import { assetKeyForDomain, formatSceneOrScriptRelativeTime, selectedSkin, t } from '../utils';

export function renderScenesView(ctx: RenderContext): TemplateResult {
  const selected = (ctx.config.scenes_page?.selection || []).filter(Boolean);
  const selectedSet = new Set(selected);
  const scenes = Object.values(ctx.hass.states)
    .filter((entity): entity is HassEntity => Boolean(isRunnableSceneEntity(entity?.entity_id)))
    .filter((entity) => selectedSet.has(entity.entity_id))
    .sort((left, right) => selected.indexOf(left.entity_id) - selected.indexOf(right.entity_id));

  const grouped = groupScenesByArea(ctx, scenes);
  const visibleGroups = ctx.selectedFloor
    ? grouped.filter((group) => group.id === ORPHAN_AREA_ID || group.area?.floor_id === ctx.selectedFloor)
    : grouped;

  const floors = ctx.floors || [];
  const hasFloorTabs = floors.length > 1;
  const floorTabs = hasFloorTabs ? html`
    <div class="filter-bar floor-tabs">
      <button class="chip${ctx.selectedFloor === '' ? ' active' : ''}" @click=${() => ctx.setSelectedFloor('')}>${ctx.translate('allFloors')}</button>
      ${floors.map((floor) => html`
        <button class="chip${ctx.selectedFloor === floor.floor_id ? ' active' : ''}" @click=${() => ctx.setSelectedFloor(floor.floor_id)}>${floor.name}</button>
      `)}
    </div>
  ` : html``;

  if (visibleGroups.length === 0) {
    return renderPageShell(
      ctx.translate('scenes'),
      ctx.translate('modes'),
      floorTabs,
      html`<div class="empty-state">${ctx.translate('noScenes')}</div>`
    );
  }

  const skin = selectedSkin(ctx.config);
  const renderScene = (scene: HassEntity, index: number) => {
    const name = String(scene.attributes?.friendly_name || scene.entity_id);
    const lastActivated = formatSceneOrScriptRelativeTime(scene, ctx.language) || t(ctx.language, 'notActivated');
    const assetKey = assetKeyForDomain(skin, scene.entity_id.startsWith('script.') ? 'script' : 'scene');
    const tones: Array<'green' | 'blue' | 'purple' | 'yellow'> = ['green', 'blue', 'purple', 'yellow'];
    const statusClass = `device device-on-${tones[index % tones.length]}`;

    return html`
      <button class="${statusClass}" @click=${() => ctx.onRunScene(scene.entity_id)}>
        <div class="device-top">
          ${renderImage(ctx.config, assetKey, name, 'item-img')}
          <div class="tag-stack"><div class="status">${ctx.translate('scenes')}</div></div>
        </div>
        <div class="device-copy"><p class="device-name">${name}</p><p class="muted">${lastActivated}</p></div>
        <div class="control-row"><span class="state-word">${t(ctx.language, 'run')}</span></div>
      </button>
    `;
  };

  return renderPageShell(
    ctx.translate('scenes'),
    ctx.translate('modes'),
    floorTabs,
    html`
      <div class="page-scroll themed-scrollbar">
        ${visibleGroups.map((group) => html`
          <section class="scene-area-section">
            <div class="section-title"><h2>${group.name}</h2><p class="muted">${group.floorName || ctx.translate('modes')}</p></div>
            <div class="devices devices-page-grid automations-grid">
              ${group.scenes.map((scene, index) => renderScene(scene, index))}
            </div>
          </section>
        `)}
      </div>
    `
  );
}

function isRunnableSceneEntity(entityId?: string): boolean {
  return Boolean(entityId?.startsWith('scene.') || entityId?.startsWith('script.'));
}

const ORPHAN_AREA_ID = '__others__';

function groupScenesByArea(
  ctx: RenderContext,
  scenes: HassEntity[],
): Array<{ id: string; name: string; floorName: string; area?: AreaRegistryEntry; scenes: HassEntity[] }> {
  const areasById = new Map((ctx.areas || []).map((area) => [area.area_id, area]));
  const floorNameById = new Map((ctx.floors || []).map((floor) => [floor.floor_id, floor.name]));
  const groupById = new Map<string, { id: string; name: string; floorName: string; area?: AreaRegistryEntry; scenes: HassEntity[] }>();
  const order: string[] = [];

  for (const scene of scenes) {
    const area = areaForEntity(ctx, scene.entity_id, areasById);
    const id = area?.area_id || ORPHAN_AREA_ID;
    if (!groupById.has(id)) {
      order.push(id);
      groupById.set(id, {
        id,
        name: area?.name || ctx.translate('groupOthers'),
        floorName: area?.floor_id ? (floorNameById.get(area.floor_id) || '') : '',
        area,
        scenes: [],
      });
    }
    groupById.get(id)!.scenes.push(scene);
  }

  return order
    .map((id) => groupById.get(id))
    .filter((group): group is { id: string; name: string; floorName: string; area?: AreaRegistryEntry; scenes: HassEntity[] } => Boolean(group));
}

function areaForEntity(
  ctx: RenderContext,
  entityId: string,
  areasById: Map<string, AreaRegistryEntry>,
): AreaRegistryEntry | undefined {
  const entry = ctx.entityRegistry?.find((item) => item.entity_id === entityId);
  const areaId = entry?.area_id || ctx.deviceRegistry?.find((device) => device.id === entry?.device_id)?.area_id || '';
  return areaId ? areasById.get(areaId) : undefined;
}
