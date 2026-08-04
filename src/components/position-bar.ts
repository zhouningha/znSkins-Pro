import { html } from 'lit';
import type { TemplateResult } from 'lit';
import type { HomeAssistant } from '../types';

/** Local optimistic percent until HA state catches up. */
const OPTIMISTIC_PCT = new Map<string, { value: number; expires: number }>();
/** Xiaomi/Galime curtains often lag >3s before current_position moves — keep UI stuck on target. */
const OPTIMISTIC_TTL_DEFAULT_MS = 3000;
const OPTIMISTIC_TTL_COVER_MS = 20000;

function displayPct(key: string, actual: number | undefined): number {
  const opt = OPTIMISTIC_PCT.get(key);
  if (opt) {
    if (actual !== undefined && Math.abs(actual - opt.value) <= 2) {
      OPTIMISTIC_PCT.delete(key);
      return Math.max(0, Math.min(100, actual));
    }
    if (Date.now() < opt.expires) return opt.value;
    OPTIMISTIC_PCT.delete(key);
  }
  return Math.max(0, Math.min(100, actual ?? 0));
}

function setOptimistic(key: string, value: number, ttlMs = OPTIMISTIC_TTL_DEFAULT_MS): void {
  OPTIMISTIC_PCT.set(key, { value, expires: Date.now() + ttlMs });
}

/**
 * Themed click-to-set percent bar (AC logic). Uses `.device-pos-track` / `.device-pos-fill`
 * so skins color the fill via `--sp-accent`. Avoids HA blue `ha-control-slider`.
 */
export function renderPercentBar(
  key: string,
  actualPct: number | undefined,
  onSet: (pct: number) => void,
  optimisticTtlMs = OPTIMISTIC_TTL_DEFAULT_MS,
): TemplateResult {
  const pct = displayPct(key, actualPct);
  const setPct = (e: MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const track = e.currentTarget as HTMLElement;
    const rect = track.getBoundingClientRect();
    if (rect.width <= 0) return;
    const next = Math.max(0, Math.min(100, Math.round(((e.clientX - rect.left) / rect.width) * 100)));
    setOptimistic(key, next, optimisticTtlMs);
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

/** Whether the cover UI should treat the entity as open (uses optimistic pct when present). */
export function coverDisplayOpen(
  entityId: string,
  actualPosition: number | undefined,
  state: string,
): boolean {
  if (actualPosition !== undefined || OPTIMISTIC_PCT.has(entityId)) {
    return displayPct(entityId, actualPosition) > 5;
  }
  return state === 'open' || state === 'opening';
}

/** Card / status tap: full open ↔ close (progress bar still sets mid positions). */
export function toggleCoverOpenClose(
  hass: HomeAssistant,
  entityId: string,
  currentlyOpen: boolean,
): void {
  const next = currentlyOpen ? 0 : 100;
  setOptimistic(entityId, next, OPTIMISTIC_TTL_COVER_MS);
  if (currentlyOpen) {
    void hass.callService('cover', 'close_cover', { entity_id: entityId });
  } else {
    void hass.callService('cover', 'open_cover', { entity_id: entityId });
  }
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
      return;
    }
    // Ends: prefer open/close — some motors respond more reliably than mid set_position.
    if (next <= 0) {
      void hass.callService('cover', 'close_cover', { entity_id: entityId });
    } else if (next >= 100) {
      void hass.callService('cover', 'open_cover', { entity_id: entityId });
    } else {
      void hass.callService('cover', 'set_cover_position', { entity_id: entityId, position: next });
    }
  }, OPTIMISTIC_TTL_COVER_MS);
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
