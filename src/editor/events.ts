import type { HomeAssistant } from '../types';
import type { Language } from '../i18n';
import { t } from '../utils';
import {
  addListItem,
  applySkin,
  setField,
  setListItem,
  type DashboardConfigRecord,
} from './config';
import { parseNavSave } from './nav-dialog';
import { downloadSkin, fetchSkinThemes, removeSkin, type SkinStoreState } from './skin-store';
import { uploadBackgroundImage } from './bg-upload';
import { ENTITY_PICKER_TAG } from './pickers';

export interface EditorState {
  config: DashboardConfigRecord;
  hass?: HomeAssistant;
  language: Language;
  navDialogOpen: boolean;
  skinStore: SkinStoreState;
}

export interface EditorHost {
  el: HTMLElement;
  root: ShadowRoot;
  state: EditorState;
  onChange: (next: Partial<EditorState>) => void;
  reload: () => void;
}

export function bindEditorEvents(host: EditorHost): void {
  bindEntityPickers(host);
  bindAreaPickers(host);
  bindTextInputs(host);
  bindCheckboxes(host);
  bindListButtons(host);
  bindBgUpload(host);
  bindNavDialog(host);
  bindSkinStore(host);
}

function bindEntityPickers(host: EditorHost): void {
  host.root.querySelectorAll(ENTITY_PICKER_TAG).forEach((el: any) => {
    if (host.state.hass) el.hass = host.state.hass;
    el.addEventListener('value-changed', (ev: CustomEvent) => {
      const path = el.dataset.path || el.dataset.listPath;
      if (!path) return;
      if (el.dataset.listIndex !== undefined) {
        host.state.config = setListItem(host.el, host.state.config, path, Number(el.dataset.listIndex), ev.detail.value);
      } else {
        host.state.config = setField(host.el, host.state.config, path, ev.detail.value);
      }
    });
  });
}

function bindAreaPickers(host: EditorHost): void {
  host.root.querySelectorAll<HTMLSelectElement>('select[data-area-path]').forEach((el) => {
    el.addEventListener('change', () => {
      const path = el.dataset.areaPath;
      if (!path || el.dataset.areaIndex === undefined) return;
      host.state.config = setListItem(host.el, host.state.config, path, Number(el.dataset.areaIndex), el.value);
    });
  });
}

function bindTextInputs(host: EditorHost): void {
  host.root.querySelectorAll<HTMLInputElement>('input[data-text-path], select[data-text-path]').forEach((el) => {
    el.addEventListener('change', () => {
      const path = el.getAttribute('data-text-path') || '';
      const value: any = el.value;
      if (path === 'resource_pack.skin') {
        host.state.config = applySkin(host.el, host.state.config, value);
        host.onChange({ config: host.state.config });
        host.reload();
        return;
      }
      host.state.config = setField(host.el, host.state.config, path, value);
    });
  });
}

function bindCheckboxes(host: EditorHost): void {
  host.root.querySelectorAll<HTMLInputElement>('input[type="checkbox"][data-path]').forEach((el) => {
    el.addEventListener('change', () => {
      host.state.config = setField(host.el, host.state.config, el.getAttribute('data-path') || '', el.checked);
    });
  });
}

function bindListButtons(host: EditorHost): void {
  host.root.querySelectorAll<HTMLElement>('[data-add-path]').forEach((btn) => {
    btn.addEventListener('click', () => {
      host.state.config = addListItem(host.el, host.state.config, btn.getAttribute('data-add-path') || '', Number(btn.getAttribute('data-add-max')) || undefined);
    });
  });
  host.root.querySelectorAll<HTMLElement>('[data-del-path]').forEach((btn) => {
    btn.addEventListener('click', () => {
      host.state.config = setListItem(host.el, host.state.config, btn.getAttribute('data-del-path') || '', Number(btn.getAttribute('data-del-index')), '');
    });
  });
  host.root.querySelectorAll<HTMLElement>('[data-add-area-path]').forEach((btn) => {
    btn.addEventListener('click', () => {
      host.state.config = addListItem(host.el, host.state.config, btn.getAttribute('data-add-area-path') || '', Number(btn.getAttribute('data-add-max')) || undefined);
    });
  });
  host.root.querySelectorAll<HTMLElement>('[data-del-area-path]').forEach((btn) => {
    btn.addEventListener('click', () => {
      host.state.config = setListItem(host.el, host.state.config, btn.getAttribute('data-del-area-path') || '', Number(btn.getAttribute('data-del-area-index')), '');
    });
  });
}

function bindBgUpload(host: EditorHost): void {
  const uploadInput = host.root.querySelector<HTMLInputElement>('input[data-bg-upload]');
  if (uploadInput) {
    uploadInput.addEventListener('change', async () => {
      const file = uploadInput.files?.[0];
      if (!file) return;
      const url = await uploadBackgroundImage(file, host.state.hass);
      if (url) host.state.config = setField(host.el, host.state.config, 'background_image', url);
    });
  }
  const clearBtn = host.root.querySelector<HTMLElement>('[data-bg-clear]');
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      host.state.config = setField(host.el, host.state.config, 'background_image', '');
    });
  }
}

function bindNavDialog(host: EditorHost): void {
  const configureBtn = host.root.querySelector<HTMLElement>('[data-nav-configure]');
  if (configureBtn) {
    configureBtn.addEventListener('click', () => {
      host.onChange({ navDialogOpen: true });
      host.reload();
    });
  }
  const overlay = host.root.querySelector<HTMLElement>('[data-nav-overlay]');
  if (overlay) {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        host.onChange({ navDialogOpen: false });
        host.reload();
      }
    });
  }
  const cancelBtn = host.root.querySelector<HTMLElement>('[data-nav-cancel]');
  if (cancelBtn) {
    cancelBtn.addEventListener('click', () => {
      host.onChange({ navDialogOpen: false });
      host.reload();
    });
  }
  const saveBtn = host.root.querySelector<HTMLElement>('[data-nav-save]');
  if (saveBtn) {
    saveBtn.addEventListener('click', () => {
      const result = parseNavSave(host.root, host.state.config);
      host.state.config = setField(host.el, host.state.config, 'nav', result.nav);
      host.onChange({ navDialogOpen: false, config: host.state.config });
      host.reload();
    });
  }
}

function bindSkinStore(host: EditorHost): void {
  const storeBtn = host.root.querySelector<HTMLElement>('[data-skin-store]');
  if (storeBtn) {
    storeBtn.addEventListener('click', async () => {
      host.onChange({ skinStore: { ...host.state.skinStore, open: true, loading: true, error: '' } });
      host.reload();
      try {
        const themes = await fetchSkinThemes();
        host.onChange({ skinStore: { open: true, loading: false, error: '', themes } });
      } catch (err) {
        host.onChange({ skinStore: { ...host.state.skinStore, loading: false, error: String(err) } });
      }
      host.reload();
    });
  }
  const storeOverlay = host.root.querySelector<HTMLElement>('[data-store-overlay]');
  if (storeOverlay) {
    storeOverlay.addEventListener('click', (e) => {
      if (e.target === storeOverlay) {
        host.onChange({ skinStore: { ...host.state.skinStore, open: false } });
        host.reload();
      }
    });
  }
  const storeCloseBtn = host.root.querySelector<HTMLElement>('[data-store-close]');
  if (storeCloseBtn) {
    storeCloseBtn.addEventListener('click', () => {
      host.onChange({ skinStore: { ...host.state.skinStore, open: false } });
      host.reload();
    });
  }
  host.root.querySelectorAll<HTMLElement>('[data-store-remove]').forEach(btn => {
    btn.addEventListener('click', () => {
      const skin = btn.getAttribute('data-store-remove');
      if (!skin) return;
      host.state.config = removeSkin(host.el, host.state.config, host.state.hass, skin);
      host.onChange({ config: host.state.config });
      host.reload();
    });
  });
  host.root.querySelectorAll<HTMLElement>('[data-store-download]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const skin = btn.getAttribute('data-store-download');
      if (!skin) return;
      const origText = btn.textContent || '';
      btn.textContent = t(host.state.language, 'editorDownloading');
      (btn as HTMLButtonElement).disabled = true;
      const result = await downloadSkin(host.el, host.state.config, host.state.hass, skin, host.state.language);
      if (result.success) {
        host.onChange({ skinStore: { ...host.state.skinStore, open: false } });
        host.reload();
      } else {
        alert(result.errorMessage || t(host.state.language, 'editorDownloadFailedHint'));
        btn.textContent = origText;
        (btn as HTMLButtonElement).disabled = false;
      }
    });
  });
}
