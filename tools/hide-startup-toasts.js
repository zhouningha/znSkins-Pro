/**
 * Hide Home Assistant startup / integration-starting snackbar toasts.
 * Matches ui.notification_toast.starting | integration_starting | wrapping_up_startup | started
 */
(function () {
  const BUILD = '202607241621';
  if (window.__HA_HIDE_STARTUP_TOASTS__ === BUILD) return;
  window.__HA_HIDE_STARTUP_TOASTS__ = BUILD;

  const MATCH =
    /正在启动|部分功能暂不可用|Wrapping up startup|Not everything will be available|Home Assistant is starting|Home Assistant has started|Home Assistant 已启动|已完成启动|正在收尾/;

  function textOf(el) {
    try {
      return (el.shadowRoot ? el.shadowRoot.textContent : el.textContent) || '';
    } catch (_) {
      return el.textContent || '';
    }
  }

  function isStartupToast(el) {
    const t = textOf(el).replace(/\s+/g, ' ').trim();
    return MATCH.test(t);
  }

  function dismiss(el) {
    if (!el || el.dataset.haStartupToastHidden === '1') return;
    el.dataset.haStartupToastHidden = '1';
    try {
      el.style.setProperty('display', 'none', 'important');
      el.style.setProperty('visibility', 'hidden', 'important');
      el.style.setProperty('opacity', '0', 'important');
      el.style.setProperty('pointer-events', 'none', 'important');
      el.setAttribute('hidden', '');
    } catch (_) {
      /* ignore */
    }

    const roots = [el, el.shadowRoot].filter(Boolean);
    for (const root of roots) {
      const buttons = Array.from(
        root.querySelectorAll('mwc-button, ha-button, button, a, [role="button"]'),
      );
      const btn =
        root.querySelector('[aria-label="关闭"], [aria-label="Dismiss"]') ||
        buttons.find((b) => /关闭|Dismiss/.test((b.textContent || '').trim()));
      if (btn) {
        try {
          btn.click();
        } catch (_) {
          /* ignore */
        }
        break;
      }
    }
    try {
      el.dispatchEvent(new CustomEvent('closed', { bubbles: true, composed: true }));
    } catch (_) {
      /* ignore */
    }
    try {
      el.remove();
    } catch (_) {
      /* ignore */
    }
  }

  function walk(node, depth) {
    if (!node || depth > 14) return;
    const tag = (node.tagName || '').toLowerCase();
    if (tag === 'ha-toast') {
      if (isStartupToast(node)) dismiss(node);
    }
    if (
      tag === 'ha-toast' ||
      tag === 'notification-toasts' ||
      tag === 'notification-manager' ||
      tag === 'home-assistant'
    ) {
      const scope = node.shadowRoot || node;
      scope.querySelectorAll?.('ha-toast').forEach((k) => {
        if (isStartupToast(k)) dismiss(k);
      });
    }

    if (node.shadowRoot) walk(node.shadowRoot, depth + 1);
    const children = node.children;
    if (children) {
      for (let i = 0; i < children.length; i++) walk(children[i], depth + 1);
    }
  }

  function scan() {
    const ha = document.querySelector('home-assistant');
    if (ha) walk(ha, 0);
    document.querySelectorAll('ha-toast').forEach((t) => {
      if (isStartupToast(t)) dismiss(t);
    });
  }

  const obs = new MutationObserver(() => {
    clearTimeout(window.__haStartupToastScanTimer);
    window.__haStartupToastScanTimer = setTimeout(scan, 50);
  });

  function start() {
    scan();
    obs.observe(document.documentElement, {
      childList: true,
      subtree: true,
      characterData: true,
    });
    const ha = document.querySelector('home-assistant');
    if (ha?.shadowRoot) {
      obs.observe(ha.shadowRoot, { childList: true, subtree: true, characterData: true });
    }
    let n = 0;
    const iv = setInterval(() => {
      scan();
      if (++n > 120) clearInterval(iv);
    }, 500);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }
  console.info('[hide-startup-toasts]', BUILD);
})();
