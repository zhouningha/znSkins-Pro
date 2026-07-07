import { isWallPanel1080p } from './utils';

const STYLE_ID = 'skins-pro-kiosk';

let kioskLocked = false;

export function setKioskLocked(locked: boolean): void {
  kioskLocked = locked;
}

export function isKioskLocked(): boolean {
  return kioskLocked;
}

function removeStyle(root: Document | ShadowRoot | HTMLElement | null | undefined): void {
  root?.querySelector(`#${STYLE_ID}`)?.remove();
}

function injectStyle(root: Document | ShadowRoot | HTMLElement | null | undefined, css: string): void {
  if (!root) return;
  removeStyle(root);
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = css;
  root.appendChild(style);
}

function getHaRoots(): { drawer: HTMLElement; huiShadow: ShadowRoot | null | undefined } | null {
  const ha = document.querySelector('home-assistant')?.shadowRoot
    ?.querySelector('home-assistant-main')?.shadowRoot;
  if (!ha) return null;

  const drawer = ha.querySelector('ha-drawer') as HTMLElement | null;
  if (!drawer) return null;

  const lovelace = (ha.querySelector('ha-panel-lovelace') || ha.querySelector('ha-panel-sections')) as HTMLElement | null;
  const huiShadow = lovelace?.shadowRoot?.querySelector('hui-root')?.shadowRoot;

  return { drawer, huiShadow };
}

function applyKioskStyles(enable: boolean): boolean {
  const roots = getHaRoots();
  if (!roots) return false;

  const { drawer, huiShadow } = roots;

  if (enable) {
    injectStyle(drawer,
      `:host { --ha-sidebar-width: 0px !important; }
       ha-drawer > ha-sidebar { display: none !important; }
       partial-panel-resolver { --mdc-top-app-bar-width: 100% !important; }`
    );
    injectStyle(drawer.shadowRoot,
      `wa-drawer { display: none !important; }
       .sidebar-shell { display: none !important; }
       mwc-top-app-bar-fixed, mwc-top-app-bar, header { display: none !important; }`
    );
    if (huiShadow) {
      const viewCss = isWallPanel1080p()
        ? `#view { min-height: 100vh !important; height: 100vh !important; max-height: 100vh !important; padding-top: 0px !important; overflow: hidden !important; }
           .header { display: none !important; }`
        : `#view { min-height: 100vh !important; padding-top: 0px !important; }
           .header { display: none !important; }`;
      injectStyle(huiShadow, viewCss);
    }
  } else {
    removeStyle(drawer);
    removeStyle(drawer.shadowRoot);
    removeStyle(huiShadow);
  }

  return true;
}

/** Turn kiosk fullscreen on (idempotent). Returns false if HA shell not ready yet. */
export function enableKiosk(): boolean {
  if (!document.body.classList.contains('skins-pro-kiosk')) {
    document.body.classList.add('skins-pro-kiosk');
  }
  if (isWallPanel1080p()) {
    document.body.classList.add('skins-pro-wall-1080p');
  }
  try {
    return applyKioskStyles(true);
  } catch {
    return false;
  }
}

export function disableKiosk(): boolean {
  if (document.body.classList.contains('skins-pro-kiosk')) {
    document.body.classList.remove('skins-pro-kiosk');
  }
  document.body.classList.remove('skins-pro-wall-1080p');
  try {
    return applyKioskStyles(false);
  } catch {
    return false;
  }
}

export function setKiosk(enabled: boolean, options?: { force?: boolean }): boolean {
  if (!enabled && kioskLocked && !options?.force) {
    return document.body.classList.contains('skins-pro-kiosk');
  }
  return enabled ? enableKiosk() : disableKiosk();
}

export function toggleKiosk(options?: { force?: boolean }): boolean {
  if (kioskLocked && document.body.classList.contains('skins-pro-kiosk') && !options?.force) {
    return true;
  }
  const isKiosk = document.body.classList.toggle('skins-pro-kiosk');
  try {
    applyKioskStyles(isKiosk);
  } catch {
    // Kiosk manipulation failed silently; dashboard remains functional
  }
  return isKiosk;
}
