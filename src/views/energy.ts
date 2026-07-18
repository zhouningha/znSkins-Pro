import { html, nothing } from 'lit';
import type { TemplateResult } from 'lit';

import type { TranslationKey } from '../types';
import type { RenderContext } from '../render/context';
import { renderPageShell } from '../components/page-shell';
import { renderMaintenanceCard } from '../components/maintenance';
import { renderBars } from '../components/energy-bars';
import { localizedText } from '../utils';

export function renderEnergyView(
  ctx: RenderContext,
  energyValue: string,
  _energyUnit: string,
  compareValue: string,
): TemplateResult {
  const sources = ctx.energySources.length > 0 ? ctx.energySources : (
    energyValue !== '--' ? [{
      key: 'todayEnergy' as TranslationKey,
      entityId: ctx.config.energy?.entity || '',
      icon: 'mdi:lightning-bolt',
      unit: ctx.config.energy?.unit || 'kWh',
      history: ctx.energyHistory || [],
      yesterday: compareValue || undefined,
      today: energyValue,
    }] : []
  );

  return renderPageShell(
    ctx.translate('energy'),
    ctx.translate('todayEnergy'),
    html``,
    html`
      <div class="page-body single-column energy-detail-page">
        ${sources.map((src) => {
          const bars = renderBars(src.history);
          return html`
            <section class="glass-card panel-energy page-energy-card compact-energy-card">
              <div class="section-title"><h2><ha-icon icon="${src.icon}"></ha-icon> ${ctx.translate(src.key)}</h2></div>
              <div class="env-list compact-energy-list">
                <div class="env-row"><div class="dot temp"><ha-icon icon="${src.icon}"></ha-icon></div><div class="muted">${ctx.translate(src.key)}</div><div class="env-value">${src.today} ${src.unit}</div></div>
                <div class="env-row"><div class="dot hum"><ha-icon icon="mdi:compare-vertical"></ha-icon></div><div class="muted">${ctx.translate('compareYesterday')}</div><div class="env-value">${src.yesterday || '--'}</div></div>
              </div>
              <div class="bars compact-energy-bars">${bars}</div>
            </section>
          `;
        })}
        ${renderMaintenanceCard(ctx.hass, ctx.translate)}
      </div>
    `
  );
}

export function renderHomeEnergyCard(
  ctx: RenderContext,
  energyValue: string,
  energyUnit: string,
  compareValue: string,
  energyBars: TemplateResult,
): TemplateResult | typeof nothing {
  if (!ctx.config.energy?.entity) return nothing;
  const isPortrait = window.matchMedia('(orientation: portrait)').matches;
  if (isPortrait && energyValue === '--') return nothing;

  return html`
    <section class="glass-card panel-energy" style="height:auto;min-height:0;flex:0 0 auto;align-self:auto;">
      <div class="section-title"><h2>${ctx.translate('todayEnergy')}</h2></div>
      <div class="energy-value">${energyValue}<small> ${energyUnit}</small></div>
      <div class="bars" style="height:clamp(32px,7vw,72px);margin-top:clamp(4px,1.2vw,12px);">${energyBars}</div>
      <div class="energy-footer"><span class="muted">${localizedText(ctx.config.energy?.compare_text, ctx.config.energy?.compare_text_zh, ctx.config.energy?.compare_text_en, ctx.language, ctx.translate('compareYesterday'))}</span><span class="down">${compareValue || '--'}</span></div>
    </section>
  `;
}
