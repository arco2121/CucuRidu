(() => {
    const url = fromBackEnd['redirect'];
    const code = fromBackEnd['IDtoken'];
    if (url && code) {

       if(code) localStorage.setItem('cucuriduCode', code);

       location.replace(url)
  }

  const ALLOWED_ORIGINS = new Set([
    'https://cucuridu-portal.web.app',
    'https://riducucu.web.app',
    'https://cucuriduportal.web.app',
  ]);

  const STORAGE_KEY = 'cucuriduCode';

  const handleMessage = ({ origin, data: rawData, source }) => {
    if (!ALLOWED_ORIGINS.has(origin) || !source) return;

    let data;
    try {
      data = JSON.parse(rawData);
    } catch {
      return;
    }

    if (!data?.action) return;

    const key = data.key || STORAGE_KEY;

    switch (data.action) {
      case 'GET_CODE': {
        let code = null;
        try {
          code = window.localStorage.getItem(key);
        } catch {}

        source.postMessage(
          JSON.stringify({ action: 'CODE_RESPONSE', code }),
          origin
        );
        break;
      }

      case 'SET_CODE': {
        if (typeof data.code !== 'string') return;

        try {
          window.localStorage.setItem(key, data.code);
        } catch {}

        source.postMessage(
          JSON.stringify({ action: 'CODE_SAVED', code: data.code }),
          origin
        );
        break;
      }
    }
  };

  window.addEventListener('message', handleMessage);
})();