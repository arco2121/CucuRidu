(function () {
    var path = window.location.pathname + window.location.search + window.location.hash;

    // Server di destinazione per il redirect
    var HOSTS = [
        'https://cucuridu.onrender.com',
        'https://cucuridu-gmgv.onrender.com',
        'https://arco2120-cucuridu.hf.space',
        'https://cucuridu-jean.onrender.com'
    ];

    var SYNC_DOMAINS = [
        'https://cucuridu-portal.web.app',
        'https://riducucu.web.app',
        'https://cucuriduportal.web.app',
        'https://cucuridu.onrender.com',
        'https://cucuridu-gmgv.onrender.com',
        'https://arco2120-cucuridu.hf.space',
        'https://cucuridu-jean.onrender.com'
    ];

    var BRIDGE_PATH = '/sync-storage.html';
    var STORAGE_KEY = 'cucuRiduToken';
    var PING_TIMEOUT = 7000;
    var SYNC_READ_TIMEOUT = 4000;
    var SYNC_WRITE_TIMEOUT = 800;

    var completedPings = 0;
    var targetHost = null;
    var syncFinished = false;
    var redirected = false;

    var currentOrigin = window.location.protocol + '//' + window.location.host;
    var peers = [];
    var consensusStarted = false;
    var readTimer = null;
    var writeTimer = null;

    // --- UTILITY ES5 ---

    function getLocalCode() {
        try {
            var val = window.localStorage.getItem(STORAGE_KEY);
            return (val && val.length > 0) ? val : null;
        } catch (e) {
            return null;
        }
    }

    function setLocalCode(code) {
        try {
            window.localStorage.setItem(STORAGE_KEY, code);
        } catch (e) {}
    }

    function generateAlphanumericCode(length) {
        var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        var result = '';
        for (var i = 0; i < length; i++) {
            var idx = Math.floor(Math.random() * chars.length);
            result += chars.charAt(idx);
        }
        return result;
    }

    function findPeerByOrigin(origin) {
        for (var i = 0; i < peers.length; i++) {
            if (peers[i].domain === origin) {
                return peers[i];
            }
        }
        return null;
    }

    function cleanupIframes() {
        for (var i = 0; i < peers.length; i++) {
            if (peers[i].iframe && peers[i].iframe.parentNode) {
                peers[i].iframe.parentNode.removeChild(peers[i].iframe);
            }
        }
    }

    // --- COORDINAMENTO REDIRECT FINALE ---

    function tryRedirect() {
        if (syncFinished && targetHost && !redirected) {
            redirected = true;
            cleanupIframes();
            window.location.replace(targetHost + path);
        }
    }

    // --- FASE 1: CONTROLLO DISPONIBILITA HOST (/ping) ---

    function checkHost(host) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', host + '/ping', true);

        var timeout = setTimeout(function () {
            xhr.abort();
        }, PING_TIMEOUT);

        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                clearTimeout(timeout);
                if (!targetHost && xhr.status >= 200 && xhr.status < 300) {
                    targetHost = host;
                    tryRedirect();
                } else {
                    handlePingFailure();
                }
            }
        };

        xhr.onerror = function () {
            clearTimeout(timeout);
            handlePingFailure();
        };

        try {
            xhr.send();
        } catch (e) {
            clearTimeout(timeout);
            handlePingFailure();
        }
    }

    function handlePingFailure() {
        completedPings++;
        if (completedPings === HOSTS.length && !targetHost) {
            var statusElem = document.getElementById('status-text');
            if (statusElem) {
                statusElem.textContent = 'Nessun server disponibile al momento. Prova a ricaricare la pagina.';
                statusElem.style.color = '#d9534f';
            }
        }
    }

    // --- FASE 2: SINCRONIZZAZIONE LOCALSTORAGE TRAMITE IFRAME ---

    function finishSync() {
        if (syncFinished) {
            return;
        }
        if (writeTimer) {
            clearTimeout(writeTimer);
        }
        syncFinished = true;
        tryRedirect();
    }

    function checkAllAcknowledged() {
        for (var i = 0; i < peers.length; i++) {
            if (peers[i].status === 'ready' && !peers[i].acked) {
                return;
            }
        }
        finishSync();
    }

    function evaluateConsensusAndBroadcast() {
        if (consensusStarted) {
            return;
        }
        consensusStarted = true;
        if (readTimer) {
            clearTimeout(readTimer);
        }

        // Raccolta dei codici dal portale corrente e da tutti i domini che hanno risposto
        var localCode = getLocalCode();
        var samples = [localCode];
        var readyPeers = [];

        for (var i = 0; i < peers.length; i++) {
            if (peers[i].status === 'ready') {
                samples.push(peers[i].code);
                readyPeers.push(peers[i]);
            }
        }

        // Conteggio frequenze dei codici non nulli
        var counts = {};
        var bestCode = null;
        var bestCount = 0;

        for (var j = 0; j < samples.length; j++) {
            var c = samples[j];
            if (c) {
                counts[c] = (counts[c] || 0) + 1;
                if (counts[c] > bestCount) {
                    bestCount = counts[c];
                    bestCode = c;
                }
            }
        }

        // Maggioranza assoluta: piu della meta dei partecipanti attivi ha lo stesso codice
        var finalCode;
        if (bestCode && bestCount > (samples.length / 2)) {
            finalCode = bestCode;
        } else {
            finalCode = generateAlphanumericCode(128);
        }

        // Salvataggio sul portale corrente
        setLocalCode(finalCode);

        // Se non ci sono iframe remoti attivi, la sincronizzazione e gia completa
        if (readyPeers.length === 0) {
            finishSync();
            return;
        }

        // Invio comando di sovrascrittura a tutti gli iframe attivi
        var payload = JSON.stringify({
            action: 'SET_CODE',
            key: STORAGE_KEY,
            code: finalCode
        });

        for (var k = 0; k < readyPeers.length; k++) {
            try {
                readyPeers[k].iframe.contentWindow.postMessage(payload, readyPeers[k].domain);
            } catch (e) {
                readyPeers[k].acked = true;
            }
        }

        // Attesa conferma di scrittura (con timeout di sicurezza)
        writeTimer = setTimeout(function () {
            finishSync();
        }, SYNC_WRITE_TIMEOUT);

        checkAllAcknowledged();
    }

    function checkAllPeersRead() {
        for (var i = 0; i < peers.length; i++) {
            if (peers[i].status === 'pending') {
                return;
            }
        }
        evaluateConsensusAndBroadcast();
    }

    function onMessage(event) {
        var peer = findPeerByOrigin(event.origin);
        if (!peer) {
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

        if (data.action === 'CODE_RESPONSE' && peer.status === 'pending') {
            peer.status = 'ready';
            peer.code = (data.code && data.code.length > 0) ? data.code : null;
            checkAllPeersRead();
        } else if (data.action === 'CODE_SAVED' && peer.status === 'ready') {
            peer.acked = true;
            checkAllAcknowledged();
        }
    }

    function initSyncIframes() {
        var container = document.body || document.getElementsByTagName('head')[0];

        for (var i = 0; i < SYNC_DOMAINS.length; i++) {
            var domain = SYNC_DOMAINS[i];
            // Il dominio corrente viene gestito direttamente via window.localStorage
            if (domain === currentOrigin) {
                continue;
            }

            var iframe = document.createElement('iframe');
            iframe.style.display = 'none';
            iframe.style.width = '0';
            iframe.style.height = '0';
            iframe.style.border = '0';
            iframe.setAttribute('aria-hidden', 'true');
            iframe.src = domain + BRIDGE_PATH;

            var peerObj = {
                domain: domain,
                status: 'pending',
                code: null,
                acked: false,
                iframe: iframe
            };
            peers.push(peerObj);

            (function (p) {
                p.iframe.onload = function () {
                    if (p.status !== 'pending') {
                        return;
                    }
                    try {
                        var msg = JSON.stringify({
                            action: 'GET_CODE',
                            key: STORAGE_KEY
                        });
                        p.iframe.contentWindow.postMessage(msg, p.domain);
                    } catch (e) {
                        p.status = 'failed';
                        checkAllPeersRead();
                    }
                };

                p.iframe.onerror = function () {
                    p.status = 'failed';
                    checkAllPeersRead();
                };
            })(peerObj);

            container.appendChild(iframe);
        }

        if (peers.length === 0) {
            evaluateConsensusAndBroadcast();
            return;
        }

        // Timeout globale per evitare attese infinite se un server e spento o in cold start
        readTimer = setTimeout(function () {
            for (var j = 0; j < peers.length; j++) {
                if (peers[j].status === 'pending') {
                    peers[j].status = 'failed';
                }
            }
            evaluateConsensusAndBroadcast();
        }, SYNC_READ_TIMEOUT);
    }

    // --- AVVIO ---

    if (window.addEventListener) {
        window.addEventListener('message', onMessage, false);
    } else if (window.attachEvent) {
        window.attachEvent('onmessage', onMessage);
    }

    for (var h = 0; h < HOSTS.length; h++) {
        checkHost(HOSTS[h]);
    }

    if (document.body) {
        initSyncIframes();
    } else if (window.addEventListener) {
        window.addEventListener('DOMContentLoaded', initSyncIframes, false);
    } else {
        window.onload = initSyncIframes;
    }
})();