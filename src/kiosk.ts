const STYLE_ID = 'skins-pro-kiosk';

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

export function toggleKiosk(): boolean {
  const isKiosk = document.body.classList.toggle('skins-pro-kiosk');

  try {
    const ha = document.querySelector('home-assistant')?.shadowRoot
      ?.querySelector('home-assistant-main')?.shadowRoot;
    if (!ha) return isKiosk;

    const drawer = ha.querySelector('ha-drawer') as HTMLElement | null;
    const lovelace = (ha.querySelector('ha-panel-lovelace') || ha.querySelector('ha-panel-sections')) as HTMLElement | null;
    const huiShadow = lovelace?.shadowRoot?.querySelector('hui-root')?.shadowRoot;

    if (isKiosk) {
      if (drawer) {
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
      }
      if (huiShadow) {
        injectStyle(huiShadow,
          `#view { min-height: 100vh !important; padding-top: 0px !important; }
           .header { display: none !important; }`
        );
      }
    } else {
      removeStyle(drawer);
      removeStyle(drawer?.shadowRoot);
      removeStyle(huiShadow);
    }
  } catch {
    // Kiosk manipulation failed silently; dashboard remains functional
  }

  return isKiosk;
}