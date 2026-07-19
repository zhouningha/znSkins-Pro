import { html } from 'lit';
import type { TemplateResult } from 'lit';

import type { HassEntity, HomeAssistant } from '../types';

export function renderLiveCameraPreview(
  hass: HomeAssistant,
  entity: HassEntity,
  className = 'camera-preview camera-live',
): TemplateResult {
  void (window as unknown as { loadCardHelpers?: () => Promise<unknown> }).loadCardHelpers?.();
  return html`
    <div class=${className}>
      <hui-image
        class="camera-stream"
        .hass=${hass}
        .stateObj=${entity}
        .cameraImage=${entity.entity_id}
        .cameraView=${'live'}
        .show_state=${false}
        .show_name=${false}
      ></hui-image>
    </div>
  `;
}
