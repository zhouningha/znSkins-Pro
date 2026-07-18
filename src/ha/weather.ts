import type { HomeAssistant, WeatherForecastDay } from '../types';

export async function loadWeatherForecast(
  hass: HomeAssistant,
  entityId: string,
  onUpdate: (forecast: WeatherForecastDay[]) => void,
): Promise<{ unsub: () => Promise<void>; initial?: WeatherForecastDay[] }> {
  const weather = hass.states[entityId];
  if (!weather) {
    return { unsub: async () => {} };
  }

  const supportedFeatures: number = (weather.attributes?.supported_features as number) || 0;
  const supportsDaily = (supportedFeatures & 1) !== 0;
  const supportsHourly = (supportedFeatures & 2) !== 0;
  const supportsTwiceDaily = (supportedFeatures & 4) !== 0;

  if (!supportsDaily && !supportsHourly && !supportsTwiceDaily) {
    const legacy = weather.attributes?.forecast;
    if (Array.isArray(legacy)) {
      return {
        unsub: async () => {},
        initial: legacy as WeatherForecastDay[],
      };
    }
    return { unsub: async () => {} };
  }

  if (!hass.connection?.subscribeMessage) {
    return { unsub: async () => {} };
  }

  const forecastType: 'daily' | 'hourly' | 'twice_daily' =
    supportsDaily ? 'daily' : (supportsTwiceDaily ? 'twice_daily' : 'hourly');

  const callback = (event: { forecast?: WeatherForecastDay[] }): void => {
    if (event.forecast) {
      onUpdate(event.forecast);
    }
  };

  try {
    const unsubFn = await hass.connection.subscribeMessage(callback, {
      type: 'weather/subscribe_forecast',
      entity_id: entityId,
      forecast_type: forecastType,
    }, { resubscribe: false });

    return {
      unsub: async () => {
        try { await unsubFn(); } catch { /* connection may be closed */ }
      },
    };
  } catch (e) {
    console.error('Skins Pro - Failed to subscribe to weather forecast', e);
    return { unsub: async () => {} };
  }
}

export function getWeatherTemperature(
  hass: HomeAssistant | undefined,
  entityId?: string,
): string {
  if (!entityId || !hass) return '';
  const temp = hass.states[entityId]?.attributes?.temperature;
  if (temp !== undefined && temp !== null) {
    const num = Number(temp);
    return Number.isFinite(num) ? `${Math.round(num)}°` : '';
  }
  return '';
}

export function getWeatherDisplayText(
  hass: HomeAssistant | undefined,
  entityId?: string,
): string {
  if (!entityId || !hass) return '--';
  const entity = hass.states[entityId];
  return String(entity?.state || '--');
}