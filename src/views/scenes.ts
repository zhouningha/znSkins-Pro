import { html } from 'lit';
import type { TemplateResult } from 'lit';

import type { HassEntity } from '../types';
import type { RenderContext } from '../render/context';
import { renderPageShell } from '../components/page-shell';
import { renderImage } from '../render/context';
import { assetKeyForDomain, formatSceneOrScriptRelativeTime, selectedSkin, t } from '../utils';

export function renderScenesView(ctx: RenderContext): TemplateResult {
  // Scenes page: scene.* only. Scripts stay on home via home_selection.scenes.
  const scenes = Object.values(ctx.hass.states)
    .filter((entity): entity is HassEntity => Boolean(entity?.entity_id?.startsWith('scene.')));

  if (scenes.length === 0) {
    return renderPageShell(
      ctx.translate('scenes'),
      ctx.translate('modes'),
      html``,
      html`<div class="empty-state">${ctx.translate('noScenes')}</div>`
    );
  }

  const skin = selectedSkin(ctx.config);
  const items = scenes.map((scene, index) => {
    const name = String(scene.attributes?.friendly_name || scene.entity_id);
    const lastActivated = formatSceneOrScriptRelativeTime(scene, ctx.language) || t(ctx.language, 'notActivated');
    const assetKey = assetKeyForDomain(skin, 'scene');
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
  });

  return renderPageShell(
    ctx.translate('scenes'),
    ctx.translate('modes'),
    html``,
    html`<div class="page-scroll themed-scrollbar"><div class="devices devices-page-grid automations-grid">${items}</div></div>`
  );
}
