import { html } from 'lit';
import type { TemplateResult } from 'lit';

export function renderBars(values: number[]): TemplateResult {
  if (!values.length) {
    return html`${Array.from({ length: 30 }, () => html`<span class="energy-bar energy-bar-level-0"></span>`)}`;
  }
  const max = Math.max(...values, 0.1);
  return html`${values.map((value) => {
    const level = value <= 0 ? 0 : Math.max(1, Math.min(10, Math.round((value / max) * 10)));
    return html`<span class="energy-bar energy-bar-level-${level}" title=${String(value)}></span>`;
  })}`;
}
