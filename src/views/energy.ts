import { html, nothing } from 'lit';
import type { TemplateResult } from 'lit';

import type { EnergySourceData, TranslationKey } from '../types';
import type { RenderContext } from '../render/context';
import { renderPageShell } from '../components/page-shell';
import { renderMaintenanceCard } from '../components/maintenance';
import { renderBars } from '../components/energy-bars';
import { localizedText } from '../utils';

function renderEnergyTotalCard(ctx: RenderContext, sources: EnergySourceData[]): TemplateResult | typeof nothing {
  const forTotal = sources.some((s) => s.isDevice)
    ? sources.filter((s) => s.isDevice)
    : sources;
  if (forTotal.length < 1) return nothing;

  let todaySum = 0;
  let weekSum = 0;
  let weekCount = 0;
  let monthSum = 0;
  let monthCount = 0;
  for (const src of forTotal) {
    const t = parseFloat(src.today);
    if (Number.isFinite(t)) todaySum += t;
    const w = parseFloat(src.weekToDate ?? '');
    if (Number.isFinite(w)) {
      weekSum += w;
      weekCount++;
    }
    const m = parseFloat(src.monthToDate ?? '');
    if (Number.isFinite(m)) {
      monthSum += m;
      monthCount++;
    }
  }
  const unit = forTotal[0]?.unit || 'kWh';
  const weekToDate = weekCount > 0 ? weekSum.toFixed(1) : ctx.energyWeekToDate;
  const monthToDate = monthCount > 0 ? monthSum.toFixed(1) : ctx.energyMonthToDate;
  const combined: number[] = [];
  for (const src of forTotal) {
    for (let i = 0; i < src.history.length; i++) {
      combined[i] = (combined[i] || 0) + (src.history[i] || 0);
    }
  }

  return html`
    <section class="glass-card panel-energy page-energy-card energy-total-card">
      <div class="section-title"><h2><ha-icon icon="mdi:chart-areaspline"></ha-icon> ${ctx.translate('totalEnergy')}</h2></div>
      <div class="env-list compact-energy-list">
        <div class="env-row">
          <div class="dot temp"><ha-icon icon="mdi:lightning-bolt"></ha-icon></div>
          <div class="muted">${ctx.translate('todayEnergy')}</div>
          <div class="env-value">${todaySum.toFixed(1)} ${unit}</div>
        </div>
        ${weekToDate !== undefined ? html`
          <div class="env-row">
            <div class="dot hum"><ha-icon icon="mdi:calendar-week"></ha-icon></div>
            <div class="muted">${ctx.translate('weekToDate')}</div>
            <div class="env-value">${weekToDate} ${unit}</div>
          </div>
        ` : nothing}
        ${monthToDate !== undefined ? html`
          <div class="env-row">
            <div class="dot temp"><ha-icon icon="mdi:calendar-month"></ha-icon></div>
            <div class="muted">${ctx.translate('monthToDate')}</div>
            <div class="env-value">${monthToDate} ${unit}</div>
          </div>
        ` : nothing}
      </div>
      <div class="bars compact-energy-bars">${renderBars(combined)}</div>
    </section>
  `;
}

function renderDeviceCard(
  ctx: RenderContext,
  src: EnergySourceData,
  groupTitle: string,
): TemplateResult {
  const srcLabel = src.label || ctx.translate(src.key);

  // Section header already shows floor·room — don't repeat on every card.
  const fullLocation = src.locationLabel || [src.floorName, src.areaName].filter(Boolean).join(' · ');
  const location = fullLocation && fullLocation !== groupTitle ? fullLocation : '';

  return html`
    <section class="glass-card panel-energy page-energy-card compact-energy-card">
      <div class="section-title energy-card-head">
        <h2><ha-icon icon="${src.icon}"></ha-icon> ${srcLabel}</h2>
        ${location ? html`<span class="muted energy-location">${location}</span>` : nothing}
      </div>
      <div class="env-list compact-energy-list">
        <div class="env-row"><div class="dot temp"><ha-icon icon="mdi:lightning-bolt"></ha-icon></div><div class="muted">${ctx.translate('todayEnergy')}</div><div class="env-value">${src.today} ${src.unit}</div></div>
        <div class="env-row"><div class="dot hum"><ha-icon icon="mdi:calendar-week"></ha-icon></div><div class="muted">${ctx.translate('weekToDate')}</div><div class="env-value">${src.weekToDate ?? '--'} ${src.unit}</div></div>
        <div class="env-row"><div class="dot temp"><ha-icon icon="mdi:calendar-month"></ha-icon></div><div class="muted">${ctx.translate('monthToDate')}</div><div class="env-value">${src.monthToDate ?? '--'} ${src.unit}</div></div>
      </div>
      <div class="bars compact-energy-bars">${renderBars(src.history)}</div>
    </section>
  `;
}

/** Group by「楼层 · 房间」so headers carry location; cards stay clean. */
function groupSourcesByLocation(sources: EnergySourceData[]): Array<{ title: string; items: EnergySourceData[] }> {
  const map = new Map<string, EnergySourceData[]>();
  for (const src of sources) {
    const title = [src.floorName, src.areaName].filter(Boolean).join(' · ')
      || src.floorName
      || src.areaName
      || '';
    if (!map.has(title)) map.set(title, []);
    map.get(title)!.push(src);
  }
  const keys = [...map.keys()].sort((a, b) => {
    if (!a) return 1;
    if (!b) return -1;
    return a.localeCompare(b, 'zh-CN');
  });
  return keys.map((title) => {
    const items = map.get(title) || [];
    items.sort((a, b) => {
      // Devices first, then meters/grid
      if (!!a.isDevice !== !!b.isDevice) return a.isDevice ? -1 : 1;
      return (a.label || a.entityId).localeCompare(b.label || b.entityId, 'zh-CN');
    });
    return { title, items };
  });
}

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

  const groups = groupSourcesByLocation(sources);

  return renderPageShell(
    ctx.translate('energy'),
    ctx.translate('todayEnergy'),
    html``,
    html`
      <div class="page-body single-column energy-detail-page">
        ${renderEnergyTotalCard(ctx, sources)}
        ${groups.map((group) => html`
          ${group.title ? html`<div class="section-title energy-floor-title"><h2>${group.title}</h2></div>` : nothing}
          ${group.items.map((src) => renderDeviceCard(ctx, src, group.title))}
        `)}
        ${renderMaintenanceCard(ctx.hass, ctx.translate)}
      </div>
    `,
  );
}

export function renderHomeEnergyCard(
  ctx: RenderContext,
  energyValue: string,
  energyUnit: string,
  compareValue: string,
  energyBars: TemplateResult,
): TemplateResult | typeof nothing {
  const energyEntity = String(ctx.config.energy?.entity || '').trim();
  if (!energyEntity) return nothing;
  if (energyValue === '--' && !ctx.hass?.states?.[energyEntity]) return nothing;
  const isPortrait = window.matchMedia('(orientation: portrait)').matches;
  if (isPortrait && energyValue === '--') return nothing;

  return html`
    <section class="glass-card panel-energy" style="height:auto;min-height:0;flex:0 0 auto;align-self:auto;">
      <div class="section-title"><h2>${ctx.translate('todayEnergy')}</h2></div>
      <div class="energy-value">${energyValue}<small> ${energyUnit}</small></div>
      <div class="bars" style="height:clamp(32px,7vw,72px);margin-top:clamp(4px,1.2vw,12px);">${energyBars}</div>
      <div class="energy-footer"><span class="muted">${localizedText(ctx.config.energy?.compare_text, ctx.config.energy?.compare_text_zh, ctx.config.energy?.compare_text_en, ctx.language, ctx.translate('compareYesterday'))}</span><span class="down">${compareValue ? `${compareValue} ${energyUnit}` : '--'}</span></div>
    </section>
  `;
}
