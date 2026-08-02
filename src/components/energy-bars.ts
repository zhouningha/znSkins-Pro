import { html, nothing } from 'lit';
import type { TemplateResult } from 'lit';

import type { Language } from '../i18n';

/** Energy sparkline slot count — matches 30‑day cards across all skins. */
export const ENERGY_BAR_SLOTS = 30;

/** Right-align values into a fixed slot count so sparse series don't stretch into thick bars. */
export function padEnergyBarValues(values: number[], slots = ENERGY_BAR_SLOTS): number[] {
  if (values.length >= slots) return values.slice(-slots);
  if (values.length === 0) return Array.from({ length: slots }, () => 0);
  return [...Array.from({ length: slots - values.length }, () => 0), ...values];
}

function startOfLocalDay(d = new Date()): Date {
  const out = new Date(d);
  out.setHours(0, 0, 0, 0);
  return out;
}

/** Dates for each padded slot, right-aligned to today (daily series). */
function slotDates(slots: number): Date[] {
  const end = startOfLocalDay();
  return Array.from({ length: slots }, (_, i) => {
    const d = new Date(end);
    d.setDate(end.getDate() - (slots - 1 - i));
    return d;
  });
}

function formatAxisDate(d: Date, language: Language, isToday: boolean): string {
  if (isToday) return language.startsWith('zh') ? '今天' : 'Today';
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

function formatBarTitle(d: Date, value: number, language: Language): string {
  const date = language.startsWith('zh')
    ? `${d.getMonth() + 1}月${d.getDate()}日`
    : `${d.getMonth() + 1}/${d.getDate()}`;
  return `${date}: ${value}`;
}

export type RenderBarsOptions = {
  language?: Language;
  /** Extra class on the bars row (e.g. compact-energy-bars). */
  barsClass?: string;
  /** Inline style on the bars row (home card height clamp). */
  barsStyle?: string;
};

/**
 * 30-day energy bars + time axis (start / mid / today).
 * Inline % height so skins missing energy-bar-level-* still show highs/lows.
 */
export function renderBars(values: number[], options: RenderBarsOptions = {}): TemplateResult {
  const language = options.language || 'zh-CN';
  const series = padEnergyBarValues(values);
  const dates = slotDates(series.length);
  const positives = series.filter((v) => v > 0);
  const max = Math.max(...positives, 0.1);
  const last = series.length - 1;
  // Four week-ish ticks across ~30 days: start · +1w · +2w · today
  const axisIdx = [0, 7, 14, last].map((i) => Math.max(0, Math.min(last, i)));

  const bars = series.map((value, i) => {
    const date = dates[i]!;
    const title = formatBarTitle(date, value, language);
    if (value <= 0) {
      return html`<span class="energy-bar energy-bar-level-0" style="height:4%" title=${title}></span>`;
    }
    const ratio = Math.min(1, value / max);
    const visual = Math.sqrt(ratio);
    const pct = Math.max(10, Math.min(96, Math.round(visual * 96)));
    const level = Math.max(1, Math.min(10, Math.round(ratio * 10)));
    return html`<span
      class="energy-bar energy-bar-level-${level}"
      style="height:${pct}%"
      title=${title}
    ></span>`;
  });

  const barsClass = ['bars', options.barsClass].filter(Boolean).join(' ');

  return html`
    <div class="energy-chart">
      <div class=${barsClass} style=${options.barsStyle || nothing}>${bars}</div>
      <div class="energy-bar-axis">
        ${axisIdx.map((idx) => html`
          <span>${formatAxisDate(dates[idx]!, language, idx === last)}</span>
        `)}
      </div>
    </div>
  `;
}
