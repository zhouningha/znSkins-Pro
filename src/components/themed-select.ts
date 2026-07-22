import { html } from 'lit';
import type { TemplateResult } from 'lit';

export type ThemedSelectOption = { value: string; label: string };

/** Open menus tracked directly — HA nests skins-pro-card in shadow roots, so querySelectorAll misses them. */
const openSelects = new Set<HTMLDetailsElement>();
/** Independent body portal (never move Lit-managed DOM). */
const portals = new WeakMap<HTMLDetailsElement, HTMLElement>();
let outsideCloseBound = false;
let globalStyleReady = false;

const THEME_VARS = [
  '--sp-panel-bg', '--sp-glass-bg', '--glass-thick', '--glass-regular',
  '--sp-text-main', '--sp-text-primary', '--sp-text-dark',
  '--sp-border-glass', '--sp-border-width', '--sp-border-chip',
  '--sp-radius-md', '--sp-radius-lg', '--sp-radius-sm', '--sp-radius-pill',
  '--sp-shadow-card', '--sp-accent', '--sp-accent-soft',
  '--sp-font-2xs', '--sp-font-3xs', '--sp-device-bg',
];

function ensureGlobalMenuStyle(): void {
  if (globalStyleReady) return;
  globalStyleReady = true;
  if (document.getElementById('sp-select-menu-global')) return;
  const style = document.createElement('style');
  style.id = 'sp-select-menu-global';
  style.textContent = `
.sp-select-portal {
  box-sizing: border-box !important;
  padding: 4px !important;
  border: var(--sp-border-width, 1px) solid var(--sp-border-glass, rgba(0,0,0,.18)) !important;
  border-radius: var(--sp-radius-md, var(--sp-radius-lg, 12px)) !important;
  background: var(--sp-panel-bg, var(--sp-glass-bg, var(--glass-thick, #fff))) !important;
  color: var(--sp-text-main, var(--sp-text-primary, #222)) !important;
  box-shadow: var(--sp-shadow-card, 0 8px 24px rgba(0,0,0,.22)) !important;
  backdrop-filter: blur(12px) saturate(120%);
  -webkit-backdrop-filter: blur(12px) saturate(120%);
  overflow-x: hidden !important;
  overflow-y: auto !important;
  margin: 0 !important;
  inset: auto !important;
}
.sp-select-portal .sp-select-option {
  display: block !important;
  width: 100% !important;
  text-align: left !important;
  border: 0 !important;
  border-radius: var(--sp-radius-sm, 8px) !important;
  padding: 8px 10px !important;
  background: transparent !important;
  color: inherit !important;
  font: inherit !important;
  font-size: var(--sp-font-2xs, 12px) !important;
  cursor: pointer !important;
}
.sp-select-portal .sp-select-option.selected,
.sp-select-portal .sp-select-option:hover {
  background: var(--sp-accent-soft, var(--sp-accent, rgba(196,165,116,.35))) !important;
  color: var(--sp-text-main, var(--sp-text-primary, inherit)) !important;
}
`;
  document.head.appendChild(style);
}

function setImp(el: HTMLElement, prop: string, value: string): void {
  el.style.setProperty(prop, value, 'important');
}

function copyThemeVars(from: Element, to: HTMLElement): void {
  const cs = getComputedStyle(from);
  for (const name of THEME_VARS) {
    const v = cs.getPropertyValue(name).trim();
    if (v) to.style.setProperty(name, v);
  }
}

function destroyPortal(details: HTMLDetailsElement): void {
  const portal = portals.get(details);
  if (!portal) return;
  portals.delete(details);
  try {
    if (typeof (portal as HTMLElement & { hidePopover?: () => void }).hidePopover === 'function'
      && portal.matches?.(':popover-open')) {
      (portal as HTMLElement & { hidePopover: () => void }).hidePopover();
    }
  } catch { /* ignore */ }
  portal.remove();
}

function buildPortal(
  details: HTMLDetailsElement,
  options: ThemedSelectOption[],
  value: string,
  onPick: (v: string) => void,
): HTMLElement {
  ensureGlobalMenuStyle();
  destroyPortal(details);

  const trigger = details.querySelector('.sp-select-trigger') as HTMLElement | null;
  const portal = document.createElement('div');
  portal.className = 'sp-select-portal';
  portal.setAttribute('role', 'listbox');
  portal.dataset.spSelectPortal = '1';
  if (typeof (portal as HTMLElement & { showPopover?: () => void }).showPopover === 'function') {
    portal.setAttribute('popover', 'manual');
  }
  if (trigger) copyThemeVars(trigger, portal);

  for (const o of options) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `sp-select-option${o.value === value ? ' selected' : ''}`;
    btn.setAttribute('role', 'option');
    btn.setAttribute('aria-selected', o.value === value ? 'true' : 'false');
    btn.textContent = o.label;
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      closeSelect(details);
      if (o.value !== value) onPick(o.value);
    });
    portal.appendChild(btn);
  }

  document.body.appendChild(portal);
  portals.set(details, portal);

  try {
    if (typeof (portal as HTMLElement & { showPopover?: () => void }).showPopover === 'function') {
      (portal as HTMLElement & { showPopover: () => void }).showPopover();
    }
  } catch { /* older WebView */ }

  positionPortal(details, portal);
  return portal;
}

function positionPortal(details: HTMLDetailsElement, portal: HTMLElement): void {
  const trigger = details.querySelector('.sp-select-trigger') as HTMLElement | null;
  if (!trigger) return;

  const rect = trigger.getBoundingClientRect();
  const width = Math.max(rect.width, 96);

  setImp(portal, 'position', 'fixed');
  setImp(portal, 'z-index', '2147483000');
  setImp(portal, 'display', 'block');
  setImp(portal, 'visibility', 'hidden');
  setImp(portal, 'right', 'auto');
  setImp(portal, 'min-width', `${width}px`);
  setImp(portal, 'width', 'max-content');
  setImp(portal, 'max-width', `${Math.min(240, window.innerWidth - 16)}px`);

  // Measure after styles apply
  const mh = Math.min(Math.max(portal.scrollHeight, 40), 280);
  const spaceAbove = rect.top;
  const spaceBelow = window.innerHeight - rect.bottom;
  const openUp = spaceAbove >= Math.min(mh, 140) || spaceAbove > spaceBelow;

  let left = rect.left;
  if (left + width > window.innerWidth - 8) left = Math.max(8, window.innerWidth - width - 8);
  if (left < 8) left = 8;
  setImp(portal, 'left', `${left}px`);

  if (openUp) {
    setImp(portal, 'top', 'auto');
    setImp(portal, 'bottom', `${Math.max(8, window.innerHeight - rect.top + 4)}px`);
    setImp(portal, 'max-height', `${Math.max(120, spaceAbove - 12)}px`);
  } else {
    setImp(portal, 'bottom', 'auto');
    setImp(portal, 'top', `${rect.bottom + 4}px`);
    setImp(portal, 'max-height', `${Math.max(120, spaceBelow - 12)}px`);
  }
  setImp(portal, 'visibility', 'visible');
}

function closeSelect(el: HTMLDetailsElement): void {
  destroyPortal(el);
  if (el.open) el.open = false;
  openSelects.delete(el);
}

function closeAllExcept(keep?: HTMLDetailsElement | null): void {
  for (const el of [...openSelects]) {
    if (keep && el === keep) continue;
    closeSelect(el);
  }
}

function ensureOutsideClose(): void {
  if (outsideCloseBound) return;
  outsideCloseBound = true;
  const closeIfOutside = (e: Event) => {
    if (openSelects.size === 0) return;
    const path = e.composedPath();
    for (const el of [...openSelects]) {
      const portal = portals.get(el);
      const inside = path.includes(el) || (portal ? path.includes(portal) : false);
      if (!inside) closeSelect(el);
    }
  };
  document.addEventListener('pointerdown', closeIfOutside, true);
  document.addEventListener('touchstart', closeIfOutside, true);
  document.addEventListener('mousedown', closeIfOutside, true);
  document.addEventListener('click', closeIfOutside, true);
  document.addEventListener('scroll', () => closeAllExcept(null), true);
  window.addEventListener('resize', () => closeAllExcept(null));
}

/**
 * Theme-token select (replaces native &lt;select&gt; popup, which ignores skin CSS on Android).
 * Menu renders in a body portal (+ popover top-layer when available) so `.device { overflow:hidden }`
 * and backdrop-filter containing blocks cannot clip it.
 */
export function renderThemedSelect(opts: {
  value: string;
  options: ThemedSelectOption[];
  onChange: (value: string) => void;
  className?: string;
}): TemplateResult {
  ensureOutsideClose();
  const current = opts.options.find((o) => o.value === opts.value) || opts.options[0];
  const label = current?.label || opts.value || '—';

  return html`
    <details
      class="sp-select ${opts.className || ''}"
      @toggle=${(e: Event) => {
        const el = e.currentTarget as HTMLDetailsElement;
        if (el.open) {
          closeAllExcept(el);
          openSelects.add(el);
          // Next frame: trigger rect is stable after details open layout.
          requestAnimationFrame(() => {
            if (!el.open) return;
            buildPortal(el, opts.options, opts.value, opts.onChange);
          });
        } else {
          destroyPortal(el);
          openSelects.delete(el);
        }
      }}
    >
      <summary class="sp-select-trigger">${label}</summary>
      <!-- In-shadow menu kept empty/hidden; real UI is the body portal. -->
      <div class="sp-select-menu" hidden aria-hidden="true"></div>
    </details>
  `;
}
