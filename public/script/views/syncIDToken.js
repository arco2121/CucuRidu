(() => {
  const ALLOWED_ORIGINS = new Set([
    'https://cucuridu-portal.web.app',
    'https://riducucu.web.app',
    'https://cucuriduportal.web.app',
    'https://cucuridu.onrender.com',
    'https://cucuridu-gmgv.onrender.com',
    'https://arco2120-cucuridu.hf.space',
    'https://cucuridu-jean.onrender.com'
  ]);

  const STORAGE_KEY = 'cucuRiduToken';

  window.addEventListener('message', ({ origin, source, data: raw }) => {
    if (!ALLOWED_ORIGINS.has(origin) || !source) return;

    let data;
    try {
      data = JSON.parse(raw);
    } catch {
      return;
    }

    const key = data?.key || STORAGE_KEY;

    if (data?.action === 'GET_CODE') {
      let code = null;
      try {
        code = localStorage.getItem(key);
      } catch {}

      source.postMessage(JSON.stringify({ action: 'CODE_RESPONSE', code }), origin);
    } else if (data?.action === 'SET_CODE' && typeof data.code === 'string') {
      try {
        localStorage.setItem(key, data.code);
      } catch {}

      source.postMessage(JSON.stringify({ action: 'CODE_SAVED', code: data.code }), origin);
    }
  });
})();