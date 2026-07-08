import { html, nothing } from 'lit';
import type { TemplateResult } from 'lit';

import type { DashboardConfig, HomeAssistant, WeatherForecastDay } from '../types';
import { getWeatherDisplayText, getWeatherTemperature } from '../ha';
import { weatherIcon } from '../utils';

export function renderWeather(
  config: DashboardConfig,
  hass: HomeAssistant,
  weatherIconName: string,
  forecast: WeatherForecastDay[] | undefined,
  onMoreInfo: (entityId: string) => void,
): TemplateResult {
  const entityId = config.weather?.entity || '';
  const condition = getWeatherDisplayText(hass, entityId);
  const temp = getWeatherTemperature(hass, entityId);

  if (!entityId) return html``;

  const allForecast = forecast || [];
  const forecastSlice = allForecast.slice(0, 5);
  const today = allForecast[0];
  const locale = hass.locale?.language || hass.language || 'en';
  const weekdayFmt: Intl.DateTimeFormatOptions = { weekday: 'short' };

  const todayHigh = today?.temperature != null ? `${Math.round(Number(today.temperature))}°` : '';
  const todayLow = today?.templow != null ? `${Math.round(Number(today.templow))}°` : '';
  const todayPrecip = today?.precipitation != null ? `${Math.round(Number(today.precipitation))}mm` : '';

  return html`
    <div class="weather-block" @click=${() => onMoreInfo(entityId)}>
      <div class="weather-current">
        <div class="weather-state-icon"><ha-icon icon="${weatherIconName}"></ha-icon></div>
        <div class="weather-current-info">
          <div class="weather-current-temp">${temp || '--'}${todayHigh && todayLow ? html` <span class="weather-current-hl">${todayHigh}/${todayLow}</span>` : ''}</div>
          <div class="weather-current-cond">${condition}${todayPrecip ? html` · ${todayPrecip}` : ''}</div>
        </div>
      </div>
      ${forecastSlice.length > 0 ? html`
        <div class="weather-forecast">
          ${forecastSlice.map((day) => {
            const dt = day.datetime ? new Date(day.datetime) : null;
            const dayLabel = dt ? dt.toLocaleDateString(locale, weekdayFmt) : '';
            const high = day.temperature != null ? `${Math.round(Number(day.temperature))}°` : '--';
            const low = day.templow != null ? `${Math.round(Number(day.templow))}°` : '';
            return html`
              <div class="forecast-day">
                <div class="forecast-weekday">${dayLabel}</div>
                <div class="forecast-icon"><ha-icon icon="${weatherIcon(day.condition || '')}"></ha-icon></div>
                <div class="forecast-temps"><span class="forecast-high">${high}</span><span class="forecast-low">${low}</span></div>
              </div>
            `;
          })}
        </div>
      ` : nothing}
    </div>
  `;
}
