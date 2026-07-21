import { html } from 'lit';
import type { TemplateResult } from 'lit';

/** Energy sparkline slot count — matches 30‑day cards across all skins. */
export const ENERGY_BAR_SLOTS = 30;

/** Right-align values into a fixed slot count so sparse series don't stretch into thick bars. */
export function padEnergyBarValues(values: number[], slots = ENERGY_BAR_SLOTS): number[] {
  if (values.length >= slots) return values.slice(-slots);
  if (values.length === 0) return Array.from({ length: slots }, () => 0);
  return [...Array.from({ length: slots - values.length }, () => 0), ...values];
}

export function renderBars(values: number[]): TemplateResult {
  const series = padEnergyBarValues(values);
  const max = Math.max(...series, 0.1);
  return html`${series.map((value) => {
    const level = value <= 0 ? 0 : Math.max(1, Math.min(10, Math.round((value / max) * 10)));
    return html`<span class="energy-bar energy-bar-level-${level}" title=${String(value)}></span>`;
  })}`;
}
