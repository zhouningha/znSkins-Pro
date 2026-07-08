import { html, nothing } from 'lit';
import type { TemplateResult } from 'lit';

import type { HomeAssistant, TranslationKey } from '../types';
import { getMaintenanceItems } from '../ha';

export function renderMaintenanceCard(
  hass: HomeAssistant,
  translate: (key: TranslationKey) => string,
): TemplateResult | typeof nothing {
  const items = getMaintenanceItems(hass);
  if (items.length === 0) return nothing;

  return html`
    <section class="glass-card maintenance-card">
      <div class="maintenance-block">
        <div class="section-title maintenance-title"><h2>${translate('maintenance')}</h2></div>
        <div class="maintenance-list">
          ${items.slice(0, 5).map((item) => html`
            <div class="maintenance-item">
              <span class="maintenance-dot ${item.level}"></span>
              <span class="maintenance-name">${item.name}</span>
              <span class="maintenance-value">${String(item.battery)}%</span>
            </div>
          `)}
        </div>
      </div>
    </section>
  `;
}
