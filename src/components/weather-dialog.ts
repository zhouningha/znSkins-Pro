import { html, render, nothing } from 'lit';
import type { HomeAssistant, WeatherForecastDay } from '../types';
import { getWeatherDisplayText, getWeatherTemperature } from '../ha';
import { weatherIcon } from '../utils';

const WEATHER_DIALOG_ID = 'sp-weather-dialog';

/** CSS vars copied from skins-pro-card :host onto body-mounted dialog. */
const HOST_TOKEN_KEYS = [
  '--sp-accent',
  '--sp-accent-hover',
  '--sp-accent-alpha',
  '--sp-accent-border',
  '--sp-text-primary',
  '--sp-text-secondary',
  '--sp-text-main',
  '--sp-text-muted',
  '--sp-text-muted-bright',
  '--sp-text-stage',
  '--sp-text-stage-muted',
  '--sp-text-on-accent',
  '--sp-glass-bg',
  '--sp-panel-bg',
  '--sp-glass-light',
  '--sp-device-bg',
  '--sp-border-glass',
  '--sp-radius-lg',
  '--sp-radius-xl',
  '--sp-radius-md',
  '--sp-shadow-lg',
  '--sp-shadow-md',
  '--glass-regular',
  '--glass-thick',
  '--glass-thin',
] as const;

const WEATHER_DIALOG_STYLE = `
#${WEATHER_DIALOG_ID} {
  position: fixed; inset: 0; z-index: 100000;
  font-family: inherit; pointer-events: auto;
  color: var(--sp-text-main, var(--sp-text-primary, inherit));
}
#${WEATHER_DIALOG_ID} .wx-scrim {
  position: absolute; inset: 0;
  display: flex; align-items: center; justify-content: center;
  padding: 24px;
  background: rgba(45, 55, 52, 0.42);
  backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px);
}
#${WEATHER_DIALOG_ID} .wx-card {
  width: min(520px, 100%);
  max-height: min(86vh, 720px);
  overflow: auto;
  display: grid; gap: 16px; padding: 22px;
  border-radius: var(--sp-radius-xl, var(--sp-radius-lg, 24px));
  background: var(--sp-panel-bg, var(--sp-glass-bg, var(--glass-regular, var(--glass-thick, #EBEFEA))));
  border: 1px solid var(--sp-border-glass, var(--sp-accent-border, rgba(45,55,52,0.12)));
  box-shadow: var(--sp-shadow-lg, 0 18px 48px rgba(45,55,52,.22));
  color: inherit;
  box-sizing: border-box;
}
#${WEATHER_DIALOG_ID} .wx-head {
  display: flex; align-items: flex-start; justify-content: space-between; gap: 12px;
}
#${WEATHER_DIALOG_ID} .wx-title {
  margin: 0; font-size: 18px; font-weight: 700; line-height: 1.2;
  color: var(--sp-text-main, var(--sp-text-primary, inherit));
}
#${WEATHER_DIALOG_ID} .wx-sub {
  margin: 4px 0 0; font-size: 12px; font-weight: 600;
  color: var(--sp-text-muted, var(--sp-text-secondary, var(--sp-accent, inherit)));
  opacity: 0.9;
}
#${WEATHER_DIALOG_ID} .wx-close {
  flex: 0 0 auto;
  width: 36px; height: 36px; border: 0; border-radius: 999px;
  display: grid; place-items: center; cursor: pointer;
  background: var(--sp-accent-alpha, rgba(45,55,52,.08));
  color: var(--sp-text-main, var(--sp-text-primary, inherit));
}
#${WEATHER_DIALOG_ID} .wx-close ha-icon { --mdc-icon-size: 22px; }
#${WEATHER_DIALOG_ID} .wx-now {
  display: flex; align-items: center; gap: 14px;
}
#${WEATHER_DIALOG_ID} .wx-now-icon {
  width: 56px; height: 56px; border-radius: var(--sp-radius-md, 18px);
  display: grid; place-items: center;
  background: var(--sp-accent-alpha, rgba(217,155,104,.14));
  color: var(--sp-accent, #d99b68);
}
#${WEATHER_DIALOG_ID} .wx-now-icon ha-icon { --mdc-icon-size: 34px; }
#${WEATHER_DIALOG_ID} .wx-temp {
  font-size: 42px; font-weight: 700; line-height: 1;
  color: var(--sp-text-main, var(--sp-text-primary, inherit));
}
#${WEATHER_DIALOG_ID} .wx-hl {
  margin-left: 8px; font-size: 16px; font-weight: 600;
  color: var(--sp-text-muted, var(--sp-text-secondary, inherit));
}
#${WEATHER_DIALOG_ID} .wx-cond {
  margin-top: 4px; font-size: 14px; font-weight: 600;
  color: var(--sp-text-muted, var(--sp-text-secondary, inherit));
}
#${WEATHER_DIALOG_ID} .wx-metrics {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}
#${WEATHER_DIALOG_ID} .wx-metric {
  padding: 10px 12px;
  border-radius: var(--sp-radius-md, 16px);
  background: var(--sp-accent-alpha, rgba(45,55,52,.05));
  border: 1px solid var(--sp-border-glass, rgba(45,55,52,.1));
}
#${WEATHER_DIALOG_ID} .wx-metric-label {
  font-size: 11px; font-weight: 600;
  color: var(--sp-text-muted, var(--sp-text-secondary, inherit));
  opacity: 0.85;
}
#${WEATHER_DIALOG_ID} .wx-metric-value {
  margin-top: 4px; font-size: 15px; font-weight: 700;
  color: var(--sp-text-main, var(--sp-text-primary, inherit));
}
#${WEATHER_DIALOG_ID} .wx-forecast {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(56px, 1fr));
  gap: 6px;
}
#${WEATHER_DIALOG_ID} .wx-day {
  display: flex; flex-direction: column; align-items: center; gap: 4px;
  padding: 8px 4px;
  border-radius: var(--sp-radius-md, 14px);
  background: var(--sp-accent-alpha, rgba(45,55,52,.04));
}
#${WEATHER_DIALOG_ID} .wx-day-label {
  font-size: 12px; font-weight: 700;
  color: var(--sp-text-muted, var(--sp-text-secondary, inherit));
}
#${WEATHER_DIALOG_ID} .wx-day-icon { color: var(--sp-accent, var(--sp-text-main, inherit)); }
#${WEATHER_DIALOG_ID} .wx-day-icon ha-icon { --mdc-icon-size: 22px; }
#${WEATHER_DIALOG_ID} .wx-day-high {
  font-size: 13px; font-weight: 700;
  color: var(--sp-text-main, var(--sp-text-primary, inherit));
}
#${WEATHER_DIALOG_ID} .wx-day-low {
  font-size: 12px; font-weight: 600;
  color: var(--sp-text-muted, var(--sp-text-secondary, inherit));
}
`;

function firstToken(computed: CSSStyleDeclaration, keys: string[]): string {
  for (const key of keys) {
    const value = computed.getPropertyValue(key).trim();
    if (value) return value;
  }
  return '';
}

function copyHostTokens(host: HTMLElement, target: HTMLElement): void {
  const computed = getComputedStyle(host);
  for (const key of HOST_TOKEN_KEYS) {
    target.style.removeProperty(key);
    const value = computed.getPropertyValue(key).trim();
    if (value) target.style.setProperty(key, value);
  }
  // Normalize aliases so skins that only define one side (GoW vs organic) both paint correctly.
  const text = firstToken(computed, ['--sp-text-main', '--sp-text-primary', '--sp-text-stage']);
  const muted = firstToken(computed, ['--sp-text-muted', '--sp-text-secondary', '--sp-text-stage-muted']);
  const panel = firstToken(computed, [
    '--sp-panel-bg', '--sp-glass-bg', '--sp-glass-light', '--glass-regular', '--glass-thick',
  ]);
  if (text) {
    target.style.setProperty('--sp-text-main', text);
    target.style.setProperty('--sp-text-primary', text);
  }
  if (muted) {
    target.style.setProperty('--sp-text-muted', muted);
    target.style.setProperty('--sp-text-secondary', muted);
  }
  if (panel) {
    target.style.setProperty('--sp-panel-bg', panel);
    target.style.setProperty('--sp-glass-bg', panel);
    target.style.setProperty('--glass-regular', panel);
  }
}

function ensureStyle(): void {
  if (document.getElementById(`${WEATHER_DIALOG_ID}-style`)) return;
  const style = document.createElement('style');
  style.id = `${WEATHER_DIALOG_ID}-style`;
  style.textContent = WEATHER_DIALOG_STYLE;
  document.head.appendChild(style);
}

function fmtNum(value: unknown, suffix = ''): string {
  if (value === undefined || value === null || value === '') return '';
  const n = Number(value);
  if (!Number.isFinite(n)) return `${value}${suffix}`;
  return `${Math.round(n)}${suffix}`;
}

export function isWeatherDialogOpen(): boolean {
  return !!document.getElementById(WEATHER_DIALOG_ID);
}

export function closeWeatherDialog(): void {
  const el = document.getElementById(WEATHER_DIALOG_ID);
  if (el) el.remove();
}

export function openWeatherDialog(
  host: HTMLElement,
  hass: HomeAssistant,
  entityId: string,
  forecast: WeatherForecastDay[] | undefined,
): void {
  ensureStyle();
  closeWeatherDialog();

  const state = hass.states?.[entityId];
  const attrs = (state?.attributes || {}) as Record<string, unknown>;
  const name = String(attrs.friendly_name || entityId);
  const condition = getWeatherDisplayText(hass, entityId);
  const temp = getWeatherTemperature(hass, entityId);
  const iconName = weatherIcon(String(state?.state || ''));
  const locale = hass.locale?.language || hass.language || 'en';
  const today = forecast?.[0];
  const todayHigh = today?.temperature != null ? `${Math.round(Number(today.temperature))}°` : '';
  const todayLow = today?.templow != null ? `${Math.round(Number(today.templow))}°` : '';
  const days = (forecast || []).slice(0, 7);

  const metrics: Array<{ label: string; value: string }> = [];
  const humidity = fmtNum(attrs.humidity, '%');
  const pressure = fmtNum(attrs.pressure, attrs.pressure_unit ? ` ${attrs.pressure_unit}` : ' hPa');
  const wind = fmtNum(attrs.wind_speed, attrs.wind_speed_unit ? ` ${attrs.wind_speed_unit}` : ' km/h');
  const visibility = fmtNum(attrs.visibility, attrs.visibility_unit ? ` ${attrs.visibility_unit}` : ' km');
  const windBearing = attrs.wind_bearing != null ? String(attrs.wind_bearing) : '';
  if (humidity) metrics.push({ label: '湿度', value: humidity });
  if (pressure) metrics.push({ label: '气压', value: pressure });
  if (wind) metrics.push({ label: '风速', value: windBearing ? `${wind} ${windBearing}` : wind });
  if (visibility) metrics.push({ label: '能见度', value: visibility });

  const root = document.createElement('div');
  root.id = WEATHER_DIALOG_ID;
  copyHostTokens(host, root);
  document.body.appendChild(root);

  const onClose = (event?: Event) => {
    event?.preventDefault();
    event?.stopPropagation();
    closeWeatherDialog();
  };

  render(html`
    <div class="wx-scrim" @click=${onClose}>
      <div class="wx-card" @click=${(e: Event) => e.stopPropagation()}>
        <div class="wx-head">
          <div>
            <h2 class="wx-title">${name}</h2>
            <p class="wx-sub">${entityId}</p>
          </div>
          <button class="wx-close" type="button" aria-label="Close" @click=${onClose}>
            <ha-icon icon="mdi:close"></ha-icon>
          </button>
        </div>

        <div class="wx-now">
          <div class="wx-now-icon"><ha-icon icon="${iconName}"></ha-icon></div>
          <div>
            <div>
              <span class="wx-temp">${temp || '--'}</span>
              ${todayHigh && todayLow ? html`<span class="wx-hl">${todayHigh}/${todayLow}</span>` : nothing}
            </div>
            <div class="wx-cond">${condition}</div>
          </div>
        </div>

        ${metrics.length ? html`
          <div class="wx-metrics">
            ${metrics.map((m) => html`
              <div class="wx-metric">
                <div class="wx-metric-label">${m.label}</div>
                <div class="wx-metric-value">${m.value}</div>
              </div>
            `)}
          </div>
        ` : nothing}

        ${days.length ? html`
          <div class="wx-forecast">
            ${days.map((day) => {
              const dt = day.datetime ? new Date(day.datetime) : null;
              const label = dt ? dt.toLocaleDateString(locale, { weekday: 'short' }) : '';
              const high = day.temperature != null ? `${Math.round(Number(day.temperature))}°` : '--';
              const low = day.templow != null ? `${Math.round(Number(day.templow))}°` : '';
              return html`
                <div class="wx-day">
                  <div class="wx-day-label">${label}</div>
                  <div class="wx-day-icon"><ha-icon icon="${weatherIcon(day.condition || '')}"></ha-icon></div>
                  <div class="wx-day-high">${high}</div>
                  ${low ? html`<div class="wx-day-low">${low}</div>` : nothing}
                </div>
              `;
            })}
          </div>
        ` : nothing}
      </div>
    </div>
  `, root);
}
