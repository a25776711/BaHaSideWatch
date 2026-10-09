(() => {
  'use strict';

  if (window.__bswLoaded) return;
  window.__bswLoaded = true;

  const ROOT = document.documentElement;
  const CLS_ACTIVE = 'bsw-active';
  const CLS_NOPANEL = 'bsw-nopanel';
  const SS_KEY = 'bsw-mode';
  const BTN_TITLE_ON = '離開側欄全螢幕 (Shift+F)';
  const BTN_TITLE_OFF = '側欄全螢幕 (Shift+F)';
  const BTN_TITLE_OFF_TAKEOVER = '側欄全螢幕 (F / Shift+F)';
  const titleOff = () => (config.takeoverNative ? BTN_TITLE_OFF_TAKEOVER : BTN_TITLE_OFF);

  const CLS_EXEMPT = 'toast-top-center';
  const ATTR_MARK = 'data-bsw-mark';

  const DEFAULTS = { takeoverNative: false };
  const config = { ...DEFAULTS };

  let active = false;
  let entering = false;
  let fsOwned = false;
  let fsPending = false;
  let fsFailed = false;
  let fsSeq = 0;
  let savedX = 0;
  let savedY = 0;
  let toastEl = null;
  let toastTimer = 0;

  const noFsDebug = () => {
    try {
      return localStorage.getItem('bsw-debug-nofs') === '1';
    } catch (_) {
      return false;
    }
  };

  const ssSet = (v) => {
    try {
      if (v) sessionStorage.setItem(SS_KEY, '1');
      else sessionStorage.removeItem(SS_KEY);
    } catch (_) {}
  };

  const isEditable = (t) => {
    if (!t || t.nodeType !== 1) return false;
    const tag = t.tagName;
    return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || t.isContentEditable;
  };

  const redraw = () => {
    requestAnimationFrame(() => {
      window.dispatchEvent(new Event('resize'));
      requestAnimationFrame(() => window.dispatchEvent(new Event('resize')));
    });
  };

  const toast = (msg, ms = 3500) => {
    if (!toastEl) {
      toastEl = document.createElement('div');
      toastEl.className = 'bsw-toast';
      (document.body || ROOT).appendChild(toastEl);
    }
    toastEl.textContent = msg;
    void toastEl.offsetWidth;
    toastEl.classList.add('bsw-toast-show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      if (toastEl) toastEl.classList.remove('bsw-toast-show');
    }, ms);
  };

  const removeToast = () => {
    clearTimeout(toastTimer);
    if (toastEl) {
      toastEl.remove();
      toastEl = null;
    }
  };

  const markPanel = () => {
    const p = document.querySelector('section.player > .subtitle');
    if (p && !p.hasAttribute(ATTR_MARK)) {
      p.setAttribute(ATTR_MARK, '1');
      p.classList.add(CLS_EXEMPT);
    }
  };

  const unmarkPanel = () => {
    document.querySelectorAll('[' + ATTR_MARK + ']').forEach((p) => {
      p.classList.remove(CLS_EXEMPT);
      p.removeAttribute(ATTR_MARK);
      if (!p.getAttribute('class')) p.removeAttribute('class');
    });
  };

  const syncButton = () => {
    document.querySelectorAll('.bsw-btn').forEach((b) => {
      const t = active ? BTN_TITLE_ON : titleOff();
      b.title = t;
      b.classList.toggle('bsw-btn-on', active);
      const s = b.querySelector('.vjs-control-text');
      if (s) s.textContent = t;
    });
  };

  const tryRequestFullscreen = async () => {
    if (noFsDebug() || !document.fullscreenEnabled) return false;
    const seq = ++fsSeq;
    fsPending = true;
    try {
      await ROOT.requestFullscreen({ navigationUI: 'hide' });
      if (!active) {
        if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
        return null;
      }
      if (seq !== fsSeq) return null;
      fsOwned = true;
      return true;
    } catch (_) {
      return seq === fsSeq ? false : null;
    } finally {
      if (seq === fsSeq) fsPending = false;
    }
  };

  async function enter() {
    if (active || entering) return;
    entering = true;
    try {
      savedX = window.scrollX;
      savedY = window.scrollY;
      if (document.fullscreenElement) {
        try {
          await document.exitFullscreen();
        } catch (_) {}
      }
      ROOT.classList.add(CLS_ACTIVE);
      active = true;
      fsOwned = false;
      fsFailed = false;
      markPanel();
      ssSet(true);
      syncButton();
      redraw();
    } finally {
      entering = false;
    }
    requestRealFullscreen('無法進入瀏覽器全螢幕，已使用網頁全螢幕（Esc 離開）', 3000);
  }

  function exit() {
    if (!active) return;
    active = false;
    fsOwned = false;
    fsPending = false;
    fsFailed = false;
    fsSeq++;
    ROOT.classList.remove(CLS_ACTIVE, CLS_NOPANEL);
    unmarkPanel();
    ssSet(false);
    removeToast();
    syncButton();
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
    const x = savedX;
    const y = savedY;
    const restoreScroll = () => {
      if (!active) window.scrollTo(x, y);
    };
    requestAnimationFrame(restoreScroll);
    setTimeout(restoreScroll, 200);
    redraw();
  }

  function requestRealFullscreen(failMsg, ms) {
    tryRequestFullscreen().then((ok) => {
      if (ok === null) return;
      if (ok) {
        redraw();
      } else if (active) {
        fsFailed = true;
        toast(failMsg, ms);
      }
    });
  }

  function upgradeFullscreen() {
    if (!active) return;
    requestRealFullscreen('無法進入瀏覽器全螢幕，維持網頁全螢幕（Esc 離開）', 2500);
  }

  function toggleFromShortcut() {
    if (!active) {
      enter();
    } else if (!fsPending && !fsFailed && !document.fullscreenElement && !noFsDebug()) {
      upgradeFullscreen();
    } else {
      exit();
    }
  }

  function togglePanel() {
    const hidden = ROOT.classList.toggle(CLS_NOPANEL);
    redraw();
    toast(hidden ? '已隱藏彈幕列表（Shift+C 顯示）' : '已顯示彈幕列表', 1500);
  }

  const swallow = (e) => {
    e.preventDefault();
    e.stopImmediatePropagation();
  };

  const canTakeover = () => config.takeoverNative && !active && !entering && !document.fullscreenElement;

  window.addEventListener(
    'keydown',
    (e) => {
      if (e.ctrlKey || e.altKey || e.metaKey || e.isComposing) return;

      if (e.code === 'Escape' || e.key === 'Escape') {
        if (active && !document.fullscreenElement) {
          swallow(e);
          exit();
        }
        return;
      }

      if (e.code !== 'KeyF' && e.code !== 'KeyC') return;
      if (isEditable(e.target)) return;

      if (e.code === 'KeyF' && e.shiftKey) {
        swallow(e);
        if (!e.repeat) toggleFromShortcut();
      } else if (e.code === 'KeyF' && active) {
        swallow(e);
        if (!e.repeat) exit();
      } else if (e.code === 'KeyF' && canTakeover()) {
        swallow(e);
        if (!e.repeat) enter();
      } else if (e.code === 'KeyC' && e.shiftKey && active) {
        swallow(e);
        if (!e.repeat) togglePanel();
      }
    },
    true
  );

  window.addEventListener(
    'click',
    (e) => {
      const t = e.target;
      if (!t || !t.closest || !t.closest('button.vjs-fullscreen-control')) return;
      if (active) {
        swallow(e);
        exit();
      } else if (canTakeover()) {
        swallow(e);
        enter();
      }
    },
    true
  );

  window.addEventListener(
    'dblclick',
    (e) => {
      const t = e.target;
      if (!t || !t.closest || !t.closest('#ani_video')) return;
      if (active) {
        swallow(e);
        if (!t.closest('.vjs-control-bar')) exit();
      } else if (canTakeover() && !t.closest('.vjs-control-bar') && !isEditable(t)) {
        swallow(e);
        enter();
      }
    },
    true
  );

  document.addEventListener('fullscreenchange', () => {
    if (!active) return;
    const fe = document.fullscreenElement;
    if (fe === ROOT) {
      fsOwned = true;
      redraw();
    } else if (fe === null) {
      if (fsOwned) exit();
    } else {
      exit();
    }
  });

  const ICON_SVG =
    '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">' +
    '<path d="M3 4h18a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1zm1 2v12h10.5V6H4zm12.5 0v12H20V6h-3.5z"/>' +
    '</svg>';

  function buildButton() {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'bsw-btn vjs-control vjs-button vjs-show-tip';
    b.title = active ? BTN_TITLE_ON : titleOff();
    b.setAttribute('aria-label', b.title);
    b.innerHTML = ICON_SVG + '<span class="vjs-control-text" aria-live="polite"></span>';
    b.querySelector('.vjs-control-text').textContent = b.title;
    if (active) b.classList.add('bsw-btn-on');
    b.addEventListener('click', (e) => {
      e.stopPropagation();
      e.preventDefault();
      if (active) exit();
      else enter();
    });
    return b;
  }

  function ensureButton() {
    const bar = document.querySelector('.control-bar-rightbtn');
    if (!bar || bar.querySelector('.bsw-btn')) return;
    const fs = bar.querySelector('button.vjs-fullscreen-control');
    const btn = buildButton();
    if (fs && fs.parentNode === bar) bar.insertBefore(btn, fs);
    else bar.insertBefore(btn, bar.firstChild);
  }

  let scheduled = false;
  const scheduleEnsure = () => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      ensureButton();
      if (active) markPanel();
    });
  };

  const applySettings = (obj) => {
    if (obj && typeof obj.takeoverNative === 'boolean') config.takeoverNative = obj.takeoverNative;
    syncButton();
  };

  try {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
      chrome.storage.sync.get(DEFAULTS, applySettings);
      chrome.storage.onChanged.addListener((changes, area) => {
        if (area !== 'sync') return;
        const next = {};
        for (const k of Object.keys(DEFAULTS)) {
          if (changes[k]) next[k] = changes[k].newValue;
        }
        applySettings(next);
      });
    }
  } catch (_) {
  }

  ensureButton();
  new MutationObserver(scheduleEnsure).observe(ROOT, { childList: true, subtree: true });

  let restore = false;
  try {
    restore = sessionStorage.getItem(SS_KEY) === '1';
  } catch (_) {}
  if (restore) {
    savedX = window.scrollX;
    savedY = window.scrollY;
    ROOT.classList.add(CLS_ACTIVE);
    active = true;
    markPanel();
    syncButton();
    redraw();
    setTimeout(redraw, 800);
    toast('按 Shift+F 進入全螢幕', 4000);
  }
})();
