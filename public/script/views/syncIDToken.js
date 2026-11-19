(() => {
  const ALLOWED_ORIGINS = new Set([
    'https://cucuridu.onrender.com',
    'https://cucuridu-gmgv.onrender.com',
    'https://arco2120-cucuridu.hf.space',
    'https://cucuridu-jean.onrender.com'
  ]);

  const STORAGE_KEY = 'cucuRiduToken';

  const preferState = (candidate, current) => {
    if (!candidate?.code) return current;
    if (!current?.code) return candidate;
    if (candidate.updatedAt !== current.updatedAt)
      return candidate.updatedAt > current.updatedAt ? candidate : current;
    return candidate.code > current.code ? candidate : current;
  };

  window.addEventListener('message', ({ origin, source, data: raw }) => {
    if (!ALLOWED_ORIGINS.has(origin) || !source) return;

    let data;
    try {
      data = JSON.parse(raw);
    } catch {
      return;
    }

    const key = data?.key || STORAGE_KEY;
    const updatedAtKey = `${key}:updatedAt`;

    if (data?.action === 'GET_CODE') {
      let code = null;
      let updatedAt = 0;
      try {
        code = localStorage.getItem(key);
        updatedAt = Number(localStorage.getItem(updatedAtKey)) || 0;
      } catch {}

      source.postMessage(JSON.stringify({ action: 'CODE_RESPONSE', code, updatedAt }), origin);
    } else if (data?.action === 'SET_CODE' && typeof data.code === 'string' && data.code) {
      const incomingUpdatedAt = Number(data.updatedAt) || 0;
      let savedState = { code: data.code, updatedAt: incomingUpdatedAt };
      try {
        const currentCode = localStorage.getItem(key);
        const currentUpdatedAt = Number(localStorage.getItem(updatedAtKey)) || 0;
        const currentState = currentCode ? { code: currentCode, updatedAt: currentUpdatedAt } : null;
        savedState = preferState(savedState, currentState);
        localStorage.setItem(key, savedState.code);
        localStorage.setItem(updatedAtKey, String(savedState.updatedAt));
      } catch {}

      source.postMessage(JSON.stringify({
        action: 'CODE_SAVED', code: savedState.code, updatedAt: savedState.updatedAt
      }), origin);
    }
  });
})();
