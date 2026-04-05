(function() {
    var features = {
        fetch: !!window.fetch,
        promise: !!window.Promise,
        assign: !!Object.assign,
        customEvent: (function() {
            try { new CustomEvent('t'); return true; } catch (e) { return false; }
        })()
    };

    var needsPolyfill = !features.fetch || !features.promise || !features.assign || !features.customEvent;

    if (needsPolyfill) {
        console.warn("Ambiente limitato rilevato. Caricamento Polyfills...");

        var load = function(src, cb) {
            var s = document.createElement('script');
            s.src = src; s.async = false;
            s.onload = cb;
            document.head.appendChild(s);
        };

        load("https://cdnjs.cloudflare.com/ajax/libs/core-js/3.32.2/minified.js", function() {
            if (!window.fetch) {
                load("https://cdnjs.cloudflare.com/ajax/libs/fetch/3.6.17/fetch.min.js", function() {
                    console.log("Polyfills pronti.");
                    startApp();
                });
            } else {
                startApp();
            }
        });
    } else {
        startApp();
    }

    function startApp() {
        var ev = document.createEvent('Event');
        ev.initEvent('DOMContentLoaded', true, true);
        document.dispatchEvent(ev);
    }
})();