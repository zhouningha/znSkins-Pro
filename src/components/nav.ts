import { html } from 'lit';
import type { TemplateResult } from 'lit';

import type { NavItemConfig, ViewName } from '../types';
import type { Language } from '../i18n';
import { STRINGS } from '../i18n';
import type { TranslationKey } from '../types';
import { localizedText } from '../utils';

export function renderNav(
  nav: NavItemConfig[] | undefined,
  view: ViewName,
  language: Language,
  onNavigate: (target: string) => void,
): TemplateResult {
  return html`${(nav || []).filter(item => item.enabled).map((item, index) => {
    const label = localizedText(item.label, item.label_zh, item.label_en, language, STRINGS[language][(item.key as TranslationKey) || 'home'] || item.key || '');
    const target = item.target || item.key || 'home';
    const isActive = target === view || (index === 0 && view === 'home' && target === 'home');
    return html`
      <button class="nav-button${isActive ? ' active' : ''}" @click=${() => onNavigate(target)}>
        <ha-icon icon=${item.icon || 'mdi:circle'}></ha-icon><span>${label}</span>
      </button>
    `;
  })}`;
}
