import { html } from 'lit';
import type { TemplateResult } from 'lit';

import type { HassEntity, HomeAssistant } from '../types';

export function renderLiveCameraPreview(
  hass: HomeAssistant,
  entity: HassEntity,
  alt: string,
  className = 'camera-preview camera-live',
): TemplateResult {
  return html`
    <div class=${className}>
      <ha-camera-stream
        class="camera-stream"
        .hass=${hass}
        .stateObj=${entity}
      ></ha-camera-stream>
    </div>
  `;
}
