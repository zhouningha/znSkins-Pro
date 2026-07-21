import { html } from 'lit';
import type { TemplateResult } from 'lit';
import type { HomeAssistant } from '../types';

/** Local optimistic percent until HA state catches up. */
const OPTIMISTIC_PCT = new Map<string, { value: number; expires: number }>();

function displayPct(key: string, actual: number | undefined): number {
  const opt = OPTIMISTIC_PCT.get(key);
  if (opt && Date.now() < opt.expires) return opt.value;
  if (opt) OPTIMISTIC_PCT.delete(key);
  return Math.max(0, Math.min(100, actual ?? 0));
}

function setOptimistic(key: string, value: number): void {
  OPTIMISTIC_PCT.set(key, { value, expires: Date.now() + 3000 });
}

/**
 * Themed click-to-set percent bar (AC logic). Uses `.device-pos-track` / `.device-pos-fill`
 * so skins color the fill via `--sp-accent`. Avoids HA blue `ha-control-slider`.
 */
export function renderPercentBar(
  key: string,
  actualPct: number | undefined,
  onSet: (pct: number) => void,
): TemplateResult {
  const pct = displayPct(key, actualPct);
  const setPct = (e: MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const track = e.currentTarget as HTMLElement;
    const rect = track.getBoundingClientRect();
    if (rect.width <= 0) return;
    const next = Math.max(0, Math.min(100, Math.round(((e.clientX - rect.left) / rect.width) * 100)));
    setOptimistic(key, next);
    const fill = track.querySelector('.device-pos-fill') as HTMLElement | null;
    if (fill) fill.style.width = `${next}%`;
    onSet(next);
  };

  return html`
    <div
      class="device-pos-track"
      role="slider"
      aria-valuemin="0"
      aria-valuemax="100"
      aria-valuenow=${pct}
      title="${pct}%"
      @click=${setPct}
      @pointerdown=${(e: Event) => e.stopPropagation()}
    >
      <div class="device-pos-fill" style="width:${pct}%"></div>
    </div>
  `;
}

/** Cover/valve position. */
export function renderPositionBar(
  hass: HomeAssistant,
  entityId: string,
  domain: 'cover' | 'valve',
  actualPosition: number | undefined,
): TemplateResult {
  return renderPercentBar(entityId, actualPosition, (next) => {
    if (domain === 'valve') {
      void hass.callService('valve', 'set_valve_position', { entity_id: entityId, position: next });
    } else {
      void hass.callService('cover', 'set_cover_position', { entity_id: entityId, position: next });
    }
  });
}

/** Media player volume on device cards (0–100 UI → 0–1 service). */
export function renderVolumeBar(
  hass: HomeAssistant,
  entityId: string,
  volumeLevel: number | undefined,
): TemplateResult {
  const actual = volumeLevel !== undefined ? Math.round(volumeLevel * 100) : undefined;
  return renderPercentBar(`vol:${entityId}`, actual, (next) => {
    void hass.callService('media_player', 'volume_set', {
      entity_id: entityId,
      volume_level: next / 100,
    });
  });
}
