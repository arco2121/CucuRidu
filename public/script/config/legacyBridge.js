(function() {
    try {
        var doBridge = false;
        try {
            new Function('() => {}');
        } catch (e) {
            doBridge = true;
        }

        if (doBridge) {
            console.log("Legacy Mode");
            window._babelReady = false;
            window._babelQueue = [];

            var orgAdd = window.addEventListener;
            var proxy = function (t, l, o) {
                if (t === 'DOMContentLoaded' || t === 'load') {
                    window._babelReady ? setTimeout(l, 1) : window._babelQueue.push(l);
                    return;
                }
                return orgAdd ? orgAdd.apply(this, arguments) : (window.attachEvent && window.attachEvent('on' + t, l));
            };
            window.addEventListener = document.addEventListener = proxy;

            var transform = function (n) {
                if (n && n.tagName === 'SCRIPT' && n.type !== 'text/babel' && !n.src.match(/babel|core-js|es5-shim/)) {
                    n.type = 'text/babel';
                }
            };

            if (typeof MutationObserver !== 'undefined') {
                new MutationObserver(function (m) {
                    for (var i = 0; i < m.length; i++)
                        for (var j = 0; j < m[i].addedNodes.length; j++) transform(m[i].addedNodes[j]);
                }).observe(document.documentElement, {childList: true, subtree: true});
            } else {
                document.addEventListener('DOMNodeInserted', function (e) {
                    transform(e.target);
                });
            }

            var load = function (src, cb) {
                var s = document.createElement('script');
                s.src = src;
                s.async = false;
                s.onload = cb;
                document.head.appendChild(s);
            };

            load("https://cdnjs.cloudflare.com/ajax/libs/es5-shim/4.6.7/es5-shim.min.js", function () {
                load("https://cdnjs.cloudflare.com/ajax/libs/core-js/3.32.2/minified.js", function () {
                    window.CustomEvent = window.CustomEvent || function (e, p) {
                        var evt = document.createEvent('CustomEvent');
                        p = p || {};
                        evt.initCustomEvent(e, !!p.bubbles, !!p.cancelable, p.detail);
                        return evt;
                    };
                    load("https://unpkg.com/@babel/standalone/babel.min.js", function () {
                        setTimeout(function () {
                            window._babelReady = true;
                            while (window._babelQueue.length) {
                                var f = window._babelQueue.shift();
                                try {
                                    f({type: 'DOMContentLoaded', target: document});
                                } catch (err) {
                                }
                            }
                            var ev = document.createEvent('Event');
                            ev.initEvent('DOMContentLoaded', true, true);
                            document.dispatchEvent(ev);
                            window.dispatchEvent(ev);
                        }, 250);
                    });
                });
            });
        }
    } catch (e) {
        console.log(e.message);
    }
})();