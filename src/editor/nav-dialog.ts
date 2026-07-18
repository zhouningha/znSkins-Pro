import type { NavItemConfig, TranslationKey } from '../types';
import type { Language } from '../i18n';
import { STRINGS } from '../i18n';
import { DEFAULT_NAV } from '../config';
import { t } from '../utils';

export function navItemChecked(config: Record<string, any>, key: string): boolean {
  const navItems: NavItemConfig[] = config?.nav ?? [];
  const item = navItems.find(n => n.key === key);
  return item ? item.enabled : true;
}

export function renderNavDialog(
  config: Record<string, any>,
  language: Language,
  isOpen: boolean,
): string {
  if (!isOpen) return '';
  return `
    <div class="nav-overlay" data-nav-overlay style="display:flex">
      <div class="nav-dialog">
        <h3>${t(language, 'editorNavigation')}</h3>
        ${DEFAULT_NAV.map(item => `
          <label class="nav-dialog-item">
            <span>${STRINGS[language][(item.key || 'home') as TranslationKey] || item.key}</span>
            <input type="checkbox" data-nav-key="${item.key}" ${navItemChecked(config, item.key || '') ? 'checked' : ''}>
          </label>
        `).join('')}
        <div class="nav-dialog-actions">
          <button class="nav-cancel" data-nav-cancel>${t(language, 'editorCancel')}</button>
          <button class="nav-save" data-nav-save>${t(language, 'editorSave')}</button>
        </div>
      </div>
    </div>
  `;
}

export interface NavSaveResult {
  nav: NavItemConfig[] | undefined;
}

export function parseNavSave(
  root: ShadowRoot | HTMLElement,
  currentConfig: Record<string, any>,
): NavSaveResult {
  const checkboxes = root.querySelectorAll<HTMLInputElement>('[data-nav-key]');
  if (!checkboxes || checkboxes.length === 0) return { nav: undefined };

  const existingNav: NavItemConfig[] = currentConfig?.nav ?? [];
  const dialogNav: NavItemConfig[] = [];
  let allEnabled = true;
  checkboxes.forEach(cb => {
    const key = cb.getAttribute('data-nav-key') || '';
    const checked = cb.checked;
    if (!checked) allEnabled = false;
    const existingItem = existingNav.find(n => n.key === key);
    const defaultItem = DEFAULT_NAV.find(d => d.key === key);
    dialogNav.push({ key, icon: existingItem?.icon || defaultItem?.icon, enabled: checked });
  });
  const customNav = existingNav.filter(n => !DEFAULT_NAV.some(d => d.key === n.key));
  if (allEnabled && customNav.length === 0) {
    return { nav: undefined };
  }
  return { nav: [...dialogNav, ...customNav] };
}
