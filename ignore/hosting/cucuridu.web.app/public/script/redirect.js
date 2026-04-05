(function () {
    var useOld = false;
    try { new Function("() => {}"); } catch { useOld = true; }
    var path = window.location.pathname;
    var HOSTS = [
        'https://cucuridu.onrender.com',
        'https://arco2120-cucuridu.hf.space'
    ];

    if(!useOld)
        new Function('path', 'HOSTS',
            'const pingHost = async (host) => {' +
            '    const controller = new AbortController();' +
            '    const timeoutId = setTimeout(() => controller.abort(), 7000);' +
            '    try {' +
            '        const response = await fetch(host + "/ping", { method: "HEAD", mode: "cors", signal: controller.signal });' +
            '        if (response.ok) return host;' +
            '        throw new Error("Host non pronto");' +
            '    } finally { clearTimeout(timeoutId); }' +
            '};' +
            '(async () => {' +
            '    try {' +
            '        const fastestHost = await Promise.any(HOSTS.map(pingHost));' +
            '        window.location.replace(fastestHost + path);' +
            '    } catch (e) {' +
            '        document.body.innerText = "Nessun server disponibile. Prova a ricaricare.";' +
            '    }' +
            '})();'
        )(path, HOSTS);
    else
        (function() {
            var completed = 0;
            var found = false;

            function checkHost(host) {
                var xhr = new XMLHttpRequest();
                xhr.open('HEAD', host + "/ping", true);

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
                    document.body.innerHTML = "<h1>Nessun server disponibile. Prova a ricaricare.</h1>";
                }
            }

            for (var i = 0; i < HOSTS.length; i++) {
                checkHost(HOSTS[i]);
            }
        })();
})();