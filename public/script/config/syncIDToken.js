(() => {
    const STORAGE_KEY = 'cucuriduCode';
    const BRIDGE_PATH = '/syncIDToken';
    const SYNC_DOMAINS = [
        'https://cucuridu-portal.web.app',
        'https://riducucu.web.app',
        'https://cucuriduportal.web.app',
        'https://cucuridu.onrender.com',
        'https://cucuridu-gmgv.onrender.com',
        'https://arco2120-cucuridu.hf.space',
        'https://cucuridu-jean.onrender.com'
    ];

    const READ_TIMEOUT = 4000;
    const WRITE_TIMEOUT = 800;
    const currentOrigin = window.location.origin;

    const getLocalCode = () => {
        try {
            return localStorage.getItem(STORAGE_KEY) || null;
        } catch {
            return null;
        }
    };

    const setLocalCode = (code) => {
        try {
            localStorage.setItem(STORAGE_KEY, code);
        } catch {}
    };

    const generateCode = (length = 64) => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const bytes = new Uint8Array(length);
        crypto.getRandomValues(bytes);
        return Array.from(bytes, (b) => chars[b % chars.length]).join('');
    };
    
    const consumeUrlCode = () => {
        const url = new URL(window.location.href);
        const codeFromUrl = url.searchParams.get(STORAGE_KEY);

        if (!codeFromUrl) return null;

        setLocalCode(codeFromUrl);
        url.searchParams.delete(STORAGE_KEY);
        window.history.replaceState({}, '', url.toString());

        return codeFromUrl;
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

    // Condivide un codice specifico con tutti i portali configurati
    const shareCode = async (code) => {
        if (!code) return null;
        setLocalCode(code);

        const remoteDomains = SYNC_DOMAINS.filter((d) => d !== currentOrigin);
        const results = await Promise.allSettled(remoteDomains.map(connectPeer));
        const activePeers = results
            .filter((r) => r.status === 'fulfilled')
            .map((r) => r.value);

        await Promise.all(
            activePeers.map((peer) =>
                sendRpc(peer, { action: 'SET_CODE', key: STORAGE_KEY, code }, 'CODE_SAVED', WRITE_TIMEOUT)
            )
        );

        activePeers.forEach((peer) => peer.cleanup());
        return code;
    };

    // Recupera il codice (da URL o consenso tra portali) e lo allinea ovunque
    const syncCode = async () => {
        // 1. Se arriviamo da un redirect del portale, l'URL ha la priorita
        const urlCode = consumeUrlCode();
        if (urlCode) {
            await shareCode(urlCode);
            return urlCode;
        }

        // 2. Altrimenti (accesso diretto al webserver), interroga i portali e calcola la maggioranza
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

        const samples = [getLocalCode(), ...responses.map((r) => r?.code || null)];
        const counts = new Map();
        let bestCode = null;
        let bestCount = 0;

        for (const c of samples) {
            if (!c) continue;
            const next = (counts.get(c) ?? 0) + 1;
            counts.set(c, next);
            if (next > bestCount) {
                bestCount = next;
                bestCode = c;
            }
        }

        const finalCode = bestCode && bestCount > samples.length / 2
            ? bestCode
            : generateCode(64);

        setLocalCode(finalCode);

        await Promise.all(
            activePeers.map((peer) =>
                sendRpc(peer, { action: 'SET_CODE', key: STORAGE_KEY, code: finalCode }, 'CODE_SAVED', WRITE_TIMEOUT)
            )
        );

        activePeers.forEach((peer) => peer.cleanup());
        return finalCode;
    };

    window.CucuriduSync = {
        syncCode,
        shareCode,
        getCode: getLocalCode
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => syncCode());
    } else {
        syncCode();
    }
})();