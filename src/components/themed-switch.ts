import { html } from 'lit';
import type { TemplateResult } from 'lit';

/**
 * Theme-drawn pill switch (`.switch` / `.switch.on`).
 * Prefer this over `ha-control-switch` so skins (GoW / Animal Crossing) control visuals.
 */
export function renderThemedSwitch(
  checked: boolean,
  onToggle: () => void,
  label = '',
): TemplateResult {
  return html`
    <span
      class="switch ${checked ? 'on' : ''}"
      role="switch"
      aria-checked=${checked ? 'true' : 'false'}
      aria-label=${label}
      style="flex-shrink:0;margin-left:auto"
      @click=${(e: Event) => {
        e.stopPropagation();
        onToggle();
      }}
      @pointerdown=${(e: Event) => e.stopPropagation()}
    ></span>
  `;
}
