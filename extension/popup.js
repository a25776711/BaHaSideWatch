(() => {
  'use strict';
  const KEY = 'takeoverNative';
  const box = document.getElementById(KEY);

  chrome.storage.sync.get({ [KEY]: false }, (v) => {
    box.checked = !!v[KEY];
  });

  box.addEventListener('change', () => {
    chrome.storage.sync.set({ [KEY]: box.checked });
  });
})();
