(function () {
    var ALLOWED_ORIGINS = [
        'https://cucuridu-portal.web.app',
        'https://riducucu.web.app',
        'https://cucuriduportal.web.app',
        'https://cucuridu.onrender.com',
        'https://cucuridu-gmgv.onrender.com',
        'https://arco2120-cucuridu.hf.space',
        'https://cucuridu-jean.onrender.com'
    ];

    var STORAGE_KEY = 'cucuriduCode';

    function isAllowedOrigin(origin) {
        for (var i = 0; i < ALLOWED_ORIGINS.length; i++) {
            if (ALLOWED_ORIGINS[i] === origin) {
                return true;
            }
        }
        return false;
    }

    function handleMessage(event) {
        if (!isAllowedOrigin(event.origin)) {
            return;
        }

        var data;
        try {
            data = JSON.parse(event.data);
        } catch (e) {
            return;
        }

        if (!data || !data.action) {
            return;
        }

        var key = data.key || STORAGE_KEY;

        if (data.action === 'GET_CODE') {
            var currentCode = null;
            try {
                currentCode = window.localStorage.getItem(key);
            } catch (e) {}

            event.source.postMessage(JSON.stringify({
                action: 'CODE_RESPONSE',
                code: currentCode
            }), event.origin);

        } else if (data.action === 'SET_CODE' && typeof data.code === 'string') {
            try {
                window.localStorage.setItem(key, data.code);
            } catch (e) {}

            event.source.postMessage(JSON.stringify({
                action: 'CODE_SAVED',
                code: data.code
            }), event.origin);
        }
    }

    if (window.addEventListener) {
        window.addEventListener('message', handleMessage, false);
    } else if (window.attachEvent) {
        window.attachEvent('onmessage', handleMessage);
    }
})();