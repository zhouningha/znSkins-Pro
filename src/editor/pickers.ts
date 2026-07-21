import type { AreaRegistryEntry } from '../types';
import type { Language } from '../i18n';
import { t } from '../utils';

const ENTITY_PICKER_TAG = 'ha-entity-picker';

export const CONTROLLABLE_DOMAINS = [
  'light', 'switch', 'fan', 'cover', 'lock', 'climate', 'media_player',
  'vacuum', 'humidifier', 'water_heater', 'valve', 'siren', 'automation',
  'group', 'input_boolean',
];

export { ENTITY_PICKER_TAG };

function escapeAttr(value: string): string {
  return value.replace(/"/g, '&quot;');
}

export function entityPicker(label: string, path: string, value: string, domains?: string[], deviceClasses?: string[]): string {
  const dFilter = domains?.length ? ` include-domains='${JSON.stringify(domains)}'` : '';
  const dcFilter = deviceClasses?.length ? ` include-device-classes='${JSON.stringify(deviceClasses)}'` : '';
  return `
    <label>
      <span>${label}</span>
      <${ENTITY_PICKER_TAG} data-path="${path}"${dFilter}${dcFilter} value="${escapeAttr(value || '')}"></${ENTITY_PICKER_TAG}>
    </label>
  `;
}

/** Prefer climate / air-quality sensors in the home environment list. */
export const ENVIRONMENT_DEVICE_CLASSES = [
  'temperature',
  'humidity',
  'carbon_dioxide',
  'pm25',
  'pm10',
  'aqi',
  'volatile_organic_compounds',
  'nitrogen_dioxide',
  'carbon_monoxide',
  'pressure',
];

export function listPicker(
  label: string,
  path: string,
  values: string[],
  domains?: string[],
  max?: number,
  deviceClasses?: string[],
): string {
  const filter = domains?.length ? ` include-domains='${JSON.stringify(domains)}'` : '';
  const dcFilter = deviceClasses?.length ? ` include-device-classes='${JSON.stringify(deviceClasses)}'` : '';
  // Empty config → no rows (only +). After +, keep '' rows so the entity picker appears.
  const arr = Array.isArray(values) ? values : [];
  const rows = arr.map((val, i) => `
    <div class="selector-row">
      <${ENTITY_PICKER_TAG} data-list-path="${path}" data-list-index="${i}"${filter}${dcFilter} value="${escapeAttr(val || '')}"></${ENTITY_PICKER_TAG}>
      <button type="button" class="sp-move" data-move-path="${path}" data-move-index="${i}" data-move-delta="-1" ${i === 0 ? 'disabled' : ''} title="上移">↑</button>
      <button type="button" class="sp-move" data-move-path="${path}" data-move-index="${i}" data-move-delta="1" ${i >= arr.length - 1 ? 'disabled' : ''} title="下移">↓</button>
      <button class="sp-del" data-del-path="${path}" data-del-index="${i}">✕</button>
    </div>
  `).join('');
  const addBtn = arr.length >= (max ?? Infinity) ? '' : `<button class="sp-add" data-add-path="${path}" data-add-max="${max ?? ''}">+</button>`;
  return `
    <label>
      <span>${label}</span>
      <div class="sp-list">${rows}</div>
      ${addBtn}
    </label>
  `;
}

export function areaPicker(
  areas: AreaRegistryEntry[],
  areasLoaded: boolean,
  values: string[],
  max: number | undefined,
  language: Language,
): string {
  if (!areasLoaded || areas.length === 0) {
    return `<p class="muted">${t(language, 'editorLoadingAreas')}</p>`;
  }
  const arr = Array.isArray(values) ? values : [];
  const rows = (arr.length > 0 ? arr : ['']).map((val, i) => `
    <div class="selector-row">
      <select data-area-path="home_selection.rooms" data-area-index="${i}">
        <option value="">—</option>
        ${areas.map(a => `<option value="${a.area_id}"${a.area_id === val ? ' selected' : ''}>${a.name}</option>`).join('')}
      </select>
      <button class="sp-del" data-del-area-path="home_selection.rooms" data-del-area-index="${i}">✕</button>
    </div>
  `).join('');
  const addBtn = arr.length >= (max ?? Infinity) ? '' : `<button class="sp-add" data-add-area-path="home_selection.rooms" data-add-max="${max ?? ''}">+</button>`;
  return `
    <div class="sp-list">${rows}</div>
    ${addBtn}
  `;
}
