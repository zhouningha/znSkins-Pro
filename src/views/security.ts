import { html, nothing } from 'lit';
import type { TemplateResult } from 'lit';

import type { HassEntity, RenderedDevice } from '../types';
import type { RenderContext } from '../render/context';
import { renderPageShell } from '../components/page-shell';
import { renderLiveCameraPreview } from '../components/camera-stream';
import { renderImage } from '../render/context';
import { assetKeyForDomain, deviceStateLabel, selectedSkin } from '../utils';

export function renderSecurityView(ctx: RenderContext): TemplateResult {
  const cards = renderSecurityCards(ctx);
  return renderPageShell(
    ctx.translate('security'),
    ctx.translate('securityOverview'),
    html``,
    cards !== nothing
      ? html`<div class="page-scroll themed-scrollbar"><div class="devices security-grid">${cards}</div></div>`
      : html`<div class="empty-state">${ctx.translate('offline')}</div>`
  );
}

function renderSecurityCards(ctx: RenderContext): TemplateResult | typeof nothing {
  const entities = Object.values(ctx.hass.states)
    .filter((entity): entity is HassEntity => Boolean(entity?.entity_id && /^(camera|lock|alarm_control_panel|binary_sensor)\./.test(entity.entity_id)))
    .filter((entity) => {
      if (entity.entity_id.startsWith('binary_sensor.')) {
        return /door|window|motion|contact|lock/i.test(entity.entity_id);
      }
      return true;
    })
    .slice(0, 12);

  if (entities.length === 0) return nothing;

  const cameras = entities.filter(e => e.entity_id.startsWith('camera.'));
  const others = entities.filter(e => !e.entity_id.startsWith('camera.'));

  const skin = selectedSkin(ctx.config);

  const cameraCards = cameras.map(entity => {
    const stateLabel = deviceStateLabel(entity.state, ctx.language);
    const cameraName = String(entity.attributes?.friendly_name || entity.entity_id);
    const liveLabel = ctx.language?.startsWith('zh') ? '实时监控' : 'Live stream';
    return html`
      <button class="camera-card" @click=${() => ctx.onHandleAction(entity.entity_id, 'more-info')}>
        ${renderLiveCameraPreview(ctx.hass, entity, cameraName)}
        <div class="camera-meta">
          <div>
            <p class="device-name">${cameraName}</p>
            <p class="muted">${liveLabel}</p>
          </div>
          <div class="status">${stateLabel}</div>
        </div>
      </button>
    `;
  });

  const otherCards = others.map((entity, index) => {
    const stateLabel = deviceStateLabel(entity.state, ctx.language);
    const domain = entity.entity_id.split('.')[0] || 'sensor';
    const assetKey = assetKeyForDomain(skin, domain);
    const tones: RenderedDevice['color'][] = ['red', 'green', 'blue', 'purple', 'yellow', 'brown'];
    const statusClass = entity.state === 'unavailable' ? 'device-unavailable' : `device-on-${tones[index % tones.length]}`;
    return html`
      <button class="device ${statusClass}" @click=${() => ctx.onHandleAction(entity.entity_id, 'more-info')}>
        <div class="device-top">
          ${renderImage(ctx.config, assetKey, String(entity.attributes?.friendly_name || entity.entity_id), 'item-img')}
          <div class="tag-stack"><div class="status">${stateLabel}</div></div>
        </div>
        <div class="device-copy"><p class="device-name">${String(entity.attributes?.friendly_name || entity.entity_id)}</p><p class="muted">${domain}</p></div>
        <div class="control-row"><span class="state-word">${stateLabel}</span><ha-control-switch .checked=${['on', 'armed_away', 'armed_home', 'locked'].includes(entity.state)} style="--control-switch-thickness:24px;--control-switch-border-radius:var(--sp-radius-pill);--control-switch-padding:3px;width:44px;flex-shrink:0" @click=${(e: Event) => e.stopPropagation()} @change=${(e: Event) => { e.stopPropagation(); ctx.onHandleAction(entity.entity_id, 'toggle'); }} .label=${String(entity.attributes?.friendly_name || entity.entity_id)}></ha-control-switch></div>
      </button>
    `;
  });

  return html`
    ${cameraCards.length > 0 ? html`<div class="security-cameras">${cameraCards}</div>` : nothing}
    ${otherCards.length > 0 ? html`<div class="security-devices">${otherCards}</div>` : nothing}
  `;
}
