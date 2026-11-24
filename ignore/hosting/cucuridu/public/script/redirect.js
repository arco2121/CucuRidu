(() => {
    const CANONICAL_PORTAL = 'https://cucuridu-portal.web.app';
    const STORAGE_KEY = 'cucuriduCode';
    const STICKY_KEY = 'cucuridu_last_node';
    const STICKY_TTL_MS = 25 * 60 * 1000; // 25 minuti

    const NODES = [
        'https://cucuridu.onrender.com',
        'https://cucuridu-gmgv.onrender.com',
        'https://arco2120-cucuridu.hf.space',
        'https://cucuridu-jean.onrender.com'
    ];

    const statusEl = document.getElementById('status-text');
    const setStatus = (msg) => { if (statusEl) statusEl.textContent = msg; };

    // 1. Recupera eventuale codice passato via #hash o query
    const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));
    const queryParams = new URLSearchParams(window.location.search);
    const incomingCode = hashParams.get(STORAGE_KEY)
        || hashParams.get('idToken')
        || queryParams.get(STORAGE_KEY)
        || queryParams.get('idToken');

    let code = localStorage.getItem(STORAGE_KEY);
    if (incomingCode) {
        code = incomingCode;
        localStorage.setItem(STORAGE_KEY, code);
    } else if (!code) {
        code = (crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`);
        localStorage.setItem(STORAGE_KEY, code);
    }

    // 2. Unifica su un solo dominio portale per non frammentare il localStorage top-level
    if (window.location.origin !== CANONICAL_PORTAL && window.location.hostname.endsWith('.web.app')) {
        const target = new URL(window.location.pathname + window.location.search, CANONICAL_PORTAL);
        target.hash = `${STORAGE_KEY}=${encodeURIComponent(code)}`;
        window.location.replace(target.toString());
        return;
    }

    // Estrae eventuale codice stanza dalle rotte reali di Cucu Ridu (/partecipaStanza/XYZ, ?stanza=XYZ, ?room=XYZ)
    const roomParam = queryParams.get('stanza')
        || queryParams.get('room')
        || window.location.pathname.match(/\/(?:partecipaStanza|stanza)\/([a-zA-Z0-9_-]+)/)?.[1]
        || '';

    const probeNode = async (baseUrl, timeoutMs) => {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), timeoutMs);
        try {
            const url = new URL('/health', baseUrl);
            if (roomParam) url.searchParams.set('room', roomParam);

            const res = await fetch(url.toString(), {
                method: 'GET',
                cache: 'no-store',
                signal: controller.signal
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);

            const data = await res.json().catch(() => ({ ok: true }));
            return { baseUrl, hasRoom: Boolean(data.hasRoom) };
        } finally {
            clearTimeout(timer);
        }
    };

    const redirectToNode = (baseUrl) => {
        localStorage.setItem(STICKY_KEY, JSON.stringify({ url: baseUrl, ts: Date.now() }));

        // Preserva path e query (es. /partecipaStanza/XYZ) senza token in query string
        queryParams.delete(STORAGE_KEY);
        queryParams.delete('idToken');
        const cleanSearch = queryParams.toString();
        const target = new URL(
            window.location.pathname + (cleanSearch ? `?${cleanSearch}` : ''),
            baseUrl
        );
        // Il fragment # non viene inviato al server: zero 302 di pulizia!
        target.hash = `${STORAGE_KEY}=${encodeURIComponent(code)}`;
        window.location.replace(target.toString());
    };

    // Race intelligente per inviti stanza: appena un nodo risponde hasRoom: true vince istantaneamente;
    // se risponde un nodo senza stanza in RAM, aspetta al massimo 450ms gli altri nodi prima di partire.
    const resolveRoomNode = () => new Promise((resolve, reject) => {
        let settled = false;
        let firstAlive = null;
        let graceTimer = null;
        let pending = NODES.length;

        const finish = (url) => {
            if (settled) return;
            settled = true;
            if (graceTimer) clearTimeout(graceTimer);
            resolve(url);
        };

        NODES.forEach((node) => {
            probeNode(node, 7000)
                .then(({ baseUrl, hasRoom }) => {
                    if (settled) return;
                    if (hasRoom) return finish(baseUrl);
                    if (!firstAlive) {
                        firstAlive = baseUrl;
                        graceTimer = setTimeout(() => finish(firstAlive), 450);
                    }
                })
                .catch(() => {})
                .finally(() => {
                    pending -= 1;
                    if (pending === 0 && !settled) {
                        if (firstAlive) finish(firstAlive);
                        else reject(new Error('Nessun nodo disponibile'));
                    }
                });
        });
    });

    const resolveBestNode = async () => {
        // 3. Fast-path Sticky Node: se non cerchiamo una stanza specifica, prova prima l'ultimo nodo attivo
        if (!roomParam) {
            try {
                const sticky = JSON.parse(localStorage.getItem(STICKY_KEY) || 'null');
                if (sticky?.url && NODES.includes(sticky.url) && (Date.now() - sticky.ts) < STICKY_TTL_MS) {
                    setStatus('Riconnessione rapida al server precedente...');
                    const fast = await probeNode(sticky.url, 1500);
                    return fast.baseUrl;
                }
            } catch { /* fallback al race completo */ }
        }

        setStatus('Ricerca del nodo più veloce...');

        // 4. Ricerca stanza con uscita immediata su hasRoom: true
        if (roomParam) return resolveRoomNode();

        // 5. Race puro: vince il primo nodo che risponde
        const winner = await Promise.any(NODES.map((n) => probeNode(n, 8000)));
        return winner.baseUrl;
    };

    resolveBestNode()
        .then(redirectToNode)
        .catch(() => {
            setStatus('Tutti i server sono in fase di avvio. Riprovo tra 3 secondi...');
            setTimeout(() => window.location.reload(), 3000);
        });
})();