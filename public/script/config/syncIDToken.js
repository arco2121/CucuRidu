(() => {
    const STORAGE_KEY = 'cucuRiduToken';
    const UPDATED_AT_KEY = `${STORAGE_KEY}:updatedAt`;
    const TOKEN_LIFETIME = 24 * 60 * 60 * 1000;
    const BRIDGE_PATH = '/syncIDToken';
    const SYNC_DOMAINS = [
        'https://cucuridu.onrender.com',
        'https://cucuridu-gmgv.onrender.com',
        'https://arco2120-cucuridu.hf.space',
        'https://cucuridu-jean.onrender.com'
    ];

    const READ_TIMEOUT = 4000;
    const WRITE_TIMEOUT = 800;
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

    // La scelta e' deterministica anche in caso di rotazioni simultanee nello
    // stesso millisecondo, cosi' tutti i domini convergono sullo stesso valore.
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

    const consumeUrlCode = () => {
        const url = new URL(window.location.href);
        const codeFromUrl = url.searchParams.get(STORAGE_KEY);

        if (!codeFromUrl) return null;

        url.searchParams.delete(STORAGE_KEY);
        window.history.replaceState({}, '', url.toString());

        return { code: codeFromUrl, updatedAt: Date.now() };
    };

    // Apre un iframe nascosto verso un dominio e permette di scambiare messaggi postMessage
    const connectPeer = (domain) => new Promise((resolve, reject) => {
        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        iframe.setAttribute('aria-hidden', 'true');
        iframe.src = `${domain}${BRIDGE_PATH}`;

        const timer = setTimeout(() => {
            cleanup();
            reject(new Error(`Timeout: ${domain}`));
        }, READ_TIMEOUT);

        const cleanup = () => {
            clearTimeout(timer);
            iframe.remove();
        };

        iframe.onload = () => resolve({ domain, iframe, cleanup });
        iframe.onerror = () => {
            cleanup();
            reject(new Error(`Errore caricamento: ${domain}`));
        };

        document.body.appendChild(iframe);
    });

    const sendRpc = ({ domain, iframe }, payload, expectedAction, timeoutMs) =>
        new Promise((resolve) => {
            const timer = setTimeout(() => {
                window.removeEventListener('message', onMsg);
                resolve(null);
            }, timeoutMs);

            const onMsg = (event) => {
                if (event.origin !== domain) return;
                let data;
                try {
                    data = JSON.parse(event.data);
                } catch {
                    return;
                }
                if (data?.action === expectedAction) {
                    clearTimeout(timer);
                    window.removeEventListener('message', onMsg);
                    resolve(data);
                }
            };

            window.addEventListener('message', onMsg);
            iframe.contentWindow?.postMessage(JSON.stringify(payload), domain);
        });

    // Condivide il token e la sua data di generazione con tutti i portali configurati
    const shareCode = async (code, updatedAt = Date.now()) => {
        if (!code) return null;
        const state = setLocalState({ code, updatedAt });

        const remoteDomains = SYNC_DOMAINS.filter((d) => d !== currentOrigin);
        const results = await Promise.allSettled(remoteDomains.map(connectPeer));
        const activePeers = results
            .filter((r) => r.status === 'fulfilled')
            .map((r) => r.value);

        await Promise.all(
            activePeers.map((peer) =>
                sendRpc(peer, {
                    action: 'SET_CODE', key: STORAGE_KEY,
                    code: state.code, updatedAt: state.updatedAt
                }, 'CODE_SAVED', WRITE_TIMEOUT)
            )
        );

        activePeers.forEach((peer) => peer.cleanup());
        return state.code;
    };

    // Allinea i domini sul token piu' recente e lo rinnova quando ha almeno 24 ore.
    const syncCode = async () => {
        const urlState = consumeUrlCode();
        if (urlState) return shareCode(urlState.code, urlState.updatedAt);

        const remoteDomains = SYNC_DOMAINS.filter((d) => d !== currentOrigin);
        const results = await Promise.allSettled(remoteDomains.map(connectPeer));
        const activePeers = results
            .filter((r) => r.status === 'fulfilled')
            .map((r) => r.value);

        const responses = await Promise.all(
            activePeers.map((peer) =>
                sendRpc(peer, { action: 'GET_CODE', key: STORAGE_KEY }, 'CODE_RESPONSE', READ_TIMEOUT)
            )
        );

        let newestState = getLocalState();
        for (const response of responses) {
            if (!response?.code) continue;
            const updatedAt = Number(response.updatedAt) || 0;
            newestState = preferState({ code: response.code, updatedAt }, newestState);
        }

        const tokenExpired = !newestState || Date.now() - newestState.updatedAt >= TOKEN_LIFETIME;
        const desiredState = tokenExpired
            ? { code: generateCode(128), updatedAt: Date.now() }
            : newestState;
        const finalState = setLocalState(desiredState);

        await Promise.all(
            activePeers.map((peer) =>
                sendRpc(peer, {
                    action: 'SET_CODE', key: STORAGE_KEY,
                    code: finalState.code, updatedAt: finalState.updatedAt
                }, 'CODE_SAVED', WRITE_TIMEOUT)
            )
        );

        activePeers.forEach((peer) => peer.cleanup());
        return finalState.code;
    };

    window.CucuriduSync = {
        syncCode,
        shareCode,
        getCode: () => getLocalState()?.code || null
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => syncCode());
    } else {
        syncCode();
    }
})();
