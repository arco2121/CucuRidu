(function () {
    var STORAGE_KEY = 'cucuRiduToken';
    var UPDATED_AT_KEY = STORAGE_KEY + ':updatedAt';
    var LIFETIME = 24 * 60 * 60 * 1000;

    var HOSTS = [
        'https://cucuridu.onrender.com',
        'https://cucuridu-gmgv.onrender.com',
        'https://arco2120-cucuridu.hf.space',
        'https://cucuridu-jean.onrender.com'
    ];

    function generateCode(length) {
        var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        var bytes = new Uint8Array(length || 128);
        crypto.getRandomValues(bytes);
        return Array.from(bytes, function (b) { return chars[b % chars.length]; }).join('');
    }

    function preferState(candidate, current) {
        if (!candidate || !candidate.code) return current;
        if (!current || !current.code) return candidate;
        if (candidate.updatedAt !== current.updatedAt)
            return candidate.updatedAt > current.updatedAt ? candidate : current;
        return candidate.code > current.code ? candidate : current;
    }

    function resolvePortalState(incomingCode, incomingUpdatedAt) {
        var localState = null;
        try {
            var code = localStorage.getItem(STORAGE_KEY);
            var updatedAt = Number(localStorage.getItem(UPDATED_AT_KEY)) || 0;
            if (code) localState = { code: code, updatedAt: updatedAt };
        } catch (e) {}

        var candidate = incomingCode
            ? { code: incomingCode, updatedAt: Number(incomingUpdatedAt) || Date.now() }
            : null;

        var merged = preferState(candidate, localState);
        if (!merged || Date.now() - merged.updatedAt >= LIFETIME) {
            merged = { code: generateCode(128), updatedAt: Date.now() };
        }

        try {
            localStorage.setItem(STORAGE_KEY, merged.code);
            localStorage.setItem(UPDATED_AT_KEY, String(merged.updatedAt));
        } catch (e) {}

        return merged;
    }

    var currentUrl = new URL(window.location.href);
    var ssoReturn = currentUrl.searchParams.get('ssoReturn');

    // Modalita' SSO: un dominio del cluster ha chiesto il codice condiviso
    if (ssoReturn) {
        try {
            var returnUrl = new URL(ssoReturn);
            if (HOSTS.indexOf(returnUrl.origin) !== -1) {
                var state = resolvePortalState(
                    currentUrl.searchParams.get('code'),
                    currentUrl.searchParams.get('updatedAt')
                );
                returnUrl.searchParams.set('idToken', state.code);
                returnUrl.searchParams.set('idUpdatedAt', String(state.updatedAt));
                window.location.replace(returnUrl.toString());
                return;
            }
        } catch (e) {}
    }

    // Modalita' portale normale: smista sul primo server attivo portando idToken
    var portalState = resolvePortalState(currentUrl.searchParams.get('idToken'), 0);
    currentUrl.searchParams.set('idToken', portalState.code);
    currentUrl.searchParams.set('idUpdatedAt', String(portalState.updatedAt));
    var path = currentUrl.pathname + currentUrl.search;

    var completed = 0;
    var found = false;

    function checkHost(host) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', host + "/ping", true);

        var timeout = setTimeout(function() {
            xhr.abort();
        }, 7000);

        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4) {
                clearTimeout(timeout);
                if (!found && xhr.status >= 200 && xhr.status < 300) {
                    found = true;
                    window.location.replace(host + path);
                } else {
                    handleFailure();
                }
            }
        };

        xhr.onerror = function() {
            clearTimeout(timeout);
            handleFailure();
        };

        try {
            xhr.send();
        } catch (e) {
            handleFailure();
        }
    }

    function handleFailure() {
        completed++;
        if (completed === HOSTS.length && !found) {
            var statusElem = document.getElementById('status-text');
            if (statusElem) {
                statusElem.textContent = "Nessun server disponibile al momento. Prova a ricaricare la pagina.";
                statusElem.style.color = "#d9534f";
            }
        }
    }

    for (var i = 0; i < HOSTS.length; i++) {
        checkHost(HOSTS[i]);
    }
})();