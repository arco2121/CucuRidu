(function () {
    var path = window.location.pathname;
    var search = window.location.search;
    var HOSTS = [
        'https://cucuridu.onrender.com',
        'https://cucuridu-gmgv.onrender.com',
        'https://arco2120-cucuridu.hf.space',
        'https://cucuridu-jean.onrender.com'
    ];
    var STORAGE_KEY = 'cucuRiduPortalSession';
    var completed = 0;
    var found = false;

    function createId() {
        if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
        var bytes = new Uint8Array(16);
        if (window.crypto && crypto.getRandomValues) crypto.getRandomValues(bytes);
        else for (var i = 0; i < bytes.length; i++) bytes[i] = Math.floor(Math.random() * 256);
        return Array.from(bytes, function (byte) {
            return byte.toString(16).padStart(2, '0');
        }).join('');
    }

    function getPortalId() {
        try {
            var saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
            if (saved.id && saved.expiresAt > Date.now()) return saved.id;
        } catch (_) {}

        var id = createId();
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify({
                id: id,
                expiresAt: Date.now() + (30 * 24 * 60 * 60 * 1000)
            }));
        } catch (_) {}
        return id;
    }

    function transferToHost(host) {
        var form = document.createElement('form');
        form.method = 'POST';
        form.action = host + '/session/portal';
        form.style.display = 'none';

        var fields = {
            portalId: getPortalId(),
            next: path + search
        };
        Object.keys(fields).forEach(function (name) {
            var input = document.createElement('input');
            input.type = 'hidden';
            input.name = name;
            input.value = fields[name];
            form.appendChild(input);
        });

        document.body.appendChild(form);
        form.submit();
    }

    function checkHost(host) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', host + '/ping', true);

        var timeout = setTimeout(function () { xhr.abort(); }, 7000);
        xhr.onreadystatechange = function () {
            if (xhr.readyState !== 4) return;
            clearTimeout(timeout);
            if (!found && xhr.status >= 200 && xhr.status < 300) {
                found = true;
                transferToHost(host);
            } else {
                handleFailure();
            }
        };
        xhr.onerror = function () {
            clearTimeout(timeout);
            handleFailure();
        };

        try { xhr.send(); }
        catch (_) { handleFailure(); }
    }

    function handleFailure() {
        completed++;
        if (completed === HOSTS.length && !found) {
            var statusElem = document.getElementById('status-text');
            if (statusElem) {
                statusElem.textContent = 'Nessun server disponibile al momento. Prova a ricaricare la pagina.';
                statusElem.style.color = '#d9534f';
            }
        }
    }

    for (var i = 0; i < HOSTS.length; i++) checkHost(HOSTS[i]);
})();
