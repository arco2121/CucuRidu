(() => {
    const STORAGE_KEY = 'cucuRiduToken';
    const UPDATED_AT_KEY = `${STORAGE_KEY}:updatedAt`;
    const SSO_TS_KEY = 'cucuRiduSsoSyncedAt';
    const URL_PARAM_KEY = 'idToken';
    const URL_UPDATED_KEY = 'idUpdatedAt';
    const TOKEN_LIFETIME = 24 * 60 * 60 * 1000;
    const SSO_COOLDOWN_MS = 5000;
    const PORTAL_SSO_ORIGIN = 'https://cucuridu-portal.web.app';
    const SYNC_DOMAINS = [
        'https://cucuridu.onrender.com',
        'https://cucuridu-gmgv.onrender.com',
        'https://arco2120-cucuridu.hf.space',
        'https://cucuridu-jean.onrender.com'
    ];

    const currentOrigin = window.location.origin;

    const getLocalState = () => {
        try {
            const code = localStorage.getItem(STORAGE_KEY) || null;
            const updatedAt = Number(localStorage.getItem(UPDATED_AT_KEY)) || 0;
            return code ? { code, updatedAt } : null;
        } catch {
            return null;
        }
    };

    const preferState = (candidate, current) => {
        if (!candidate?.code) return current;
        if (!current?.code) return candidate;
        if (candidate.updatedAt !== current.updatedAt)
            return candidate.updatedAt > current.updatedAt ? candidate : current;
        return candidate.code > current.code ? candidate : current;
    };

    const setLocalState = (state) => {
        if (!state?.code) return getLocalState();
        try {
            const current = getLocalState();
            const preferred = preferState(state, current);
            localStorage.setItem(STORAGE_KEY, preferred.code);
            localStorage.setItem(UPDATED_AT_KEY, String(preferred.updatedAt));
            return preferred;
        } catch {
            return state;
        }
    };

    const generateCode = (length = 128) => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const bytes = new Uint8Array(length);
        crypto.getRandomValues(bytes);
        return Array.from(bytes, (b) => chars[b % chars.length]).join('');
    };

    const syncUrlParam = (code) => {
        if (!code) return;
        try {
            const url = new URL(window.location.href);
            url.searchParams.delete(STORAGE_KEY);
            url.searchParams.delete(URL_UPDATED_KEY);
            url.searchParams.set(URL_PARAM_KEY, code);
            if (url.toString() !== window.location.href) {
                window.history.replaceState({}, '', url.toString());
            }
        } catch {}
    };

    const initSync = () => {
        const url = new URL(window.location.href);
        const urlCode = url.searchParams.get(URL_PARAM_KEY) || url.searchParams.get(STORAGE_KEY);
        const urlUpdatedAt = Number(url.searchParams.get(URL_UPDATED_KEY)) || 0;
        const lastSyncedAt = Number(sessionStorage.getItem(SSO_TS_KEY)) || 0;
        const recentlySynced = (Date.now() - lastSyncedAt) < SSO_COOLDOWN_MS;
        const isClusterHost = SYNC_DOMAINS.includes(currentOrigin);
        const isGamePage = url.pathname === '/game' && (url.searchParams.has('token') || url.searchParams.has(URL_PARAM_KEY));

        if (urlUpdatedAt > 0 || recentlySynced || !isClusterHost || isGamePage || navigator.onLine === false) {
            sessionStorage.setItem(SSO_TS_KEY, String(Date.now()));
            let merged = getLocalState();
            if (urlCode) {
                merged = preferState({ code: urlCode, updatedAt: urlUpdatedAt || Date.now() }, merged);
            }
            if (!merged || Date.now() - merged.updatedAt >= TOKEN_LIFETIME) {
                merged = { code: generateCode(128), updatedAt: Date.now() };
            }
            const finalState = setLocalState(merged);
            syncUrlParam(finalState.code);
            return finalState.code;
        }

        sessionStorage.setItem(SSO_TS_KEY, String(Date.now()));
        const local = getLocalState();
        const validLocal = local && Date.now() - local.updatedAt < TOKEN_LIFETIME ? local : null;

        const cleanReturnUrl = new URL(window.location.href);
        cleanReturnUrl.searchParams.delete(URL_PARAM_KEY);
        cleanReturnUrl.searchParams.delete(URL_UPDATED_KEY);
        cleanReturnUrl.searchParams.delete(STORAGE_KEY);

        const ssoUrl = new URL(PORTAL_SSO_ORIGIN + '/');
        ssoUrl.searchParams.set('ssoReturn', cleanReturnUrl.toString());
        if (validLocal) {
            ssoUrl.searchParams.set('code', validLocal.code);
            ssoUrl.searchParams.set('updatedAt', String(validLocal.updatedAt));
        }

        window.__cucuRiduSsoRedirecting = true;
        window.location.replace(ssoUrl.toString());
        return validLocal?.code || null;
    };

    const currentCode = initSync();

    window.CucuriduSync = {
        syncCode: async () => currentCode,
        shareCode: async (code, updatedAt = Date.now()) => {
            const saved = setLocalState({ code, updatedAt });
            syncUrlParam(saved?.code);
            return saved?.code || null;
        },
        getCode: () => getLocalState()?.code || new URLSearchParams(window.location.search).get(URL_PARAM_KEY) || null
    };
})();
