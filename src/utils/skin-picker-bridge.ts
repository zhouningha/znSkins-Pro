type SkinPickerHost = {
  isConnected: boolean;
  openSkinPicker: () => void;
};

const activeCards = new Set<SkinPickerHost>();

declare global {
  interface Window {
    __spOpenSkinPicker?: () => boolean;
    __spFindSkinsProCard?: () => SkinPickerHost | null;
  }
}

/** Walk light + shadow DOM — HA nests skins-pro-card inside several shadow roots. */
export function findSkinsProCard(root: ParentNode | null | undefined = document): SkinPickerHost | null {
  if (!root) return null;
  const direct = (root as ParentNode).querySelector?.('skins-pro-card') as SkinPickerHost | null;
  if (direct) return direct;

  const nodes = (root as ParentNode).querySelectorAll?.('*');
  if (!nodes) return null;
  for (let i = 0; i < nodes.length; i += 1) {
    const el = nodes[i] as HTMLElement;
    if (el.shadowRoot) {
      const found = findSkinsProCard(el.shadowRoot);
      if (found) return found;
    }
  }
  return null;
}

export function registerSkinPickerHost(card: SkinPickerHost): void {
  activeCards.add(card);
  bindGlobalSkinPicker();
}

export function unregisterSkinPickerHost(card: SkinPickerHost): void {
  activeCards.delete(card);
  bindGlobalSkinPicker();
}

function resolveCard(): SkinPickerHost | null {
  for (const card of activeCards) {
    if (card.isConnected) return card;
  }
  return findSkinsProCard(document);
}

export function bindGlobalSkinPicker(): void {
  window.__spFindSkinsProCard = () => resolveCard();
  window.__spOpenSkinPicker = () => {
    const card = resolveCard();
    if (!card || typeof card.openSkinPicker !== 'function') return false;
    card.openSkinPicker();
    return true;
  };
}

/** Install as soon as the module loads (before any card connects). */
bindGlobalSkinPicker();
