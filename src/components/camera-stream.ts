import { html, nothing } from 'lit';
import type { TemplateResult } from 'lit';

import type { HassEntity, HomeAssistant } from '../types';

export function cameraSnapshotUrl(entity: HassEntity | undefined): string {
  if (!entity) return '';
  const entityPicture = String(entity.attributes?.entity_picture || '');
  const accessToken = String(entity.attributes?.access_token || '');
  const baseUrl = entityPicture
    || (accessToken
      ? `/api/camera_proxy/${entity.entity_id}?token=${encodeURIComponent(accessToken)}`
      : '');
  if (!baseUrl) return '';
  const sep = baseUrl.includes('?') ? '&' : '?';
  return `${baseUrl}${sep}ts=${Date.now()}`;
}

export function renderLiveCameraPreview(
  hass: HomeAssistant,
  entity: HassEntity,
  alt: string,
  className = 'camera-preview camera-live',
): TemplateResult {
  const snapshotUrl = cameraSnapshotUrl(entity);
  return html`
    <div class=${className}>
      ${snapshotUrl ? html`
        <div class="camera-fallback">
          <img alt=${alt} src=${snapshotUrl}>
        </div>
      ` : nothing}
      <ha-camera-stream
        class="camera-stream"
        .hass=${hass}
        .stateObj=${entity}
      ></ha-camera-stream>
    </div>
  `;
}
