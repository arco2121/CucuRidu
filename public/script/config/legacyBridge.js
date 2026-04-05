(function() {
    var isOld = false;
    try {
        new Function('() => {}');
    } catch (e) {
        isOld = true;
    }

    if (isOld) {
        window._babelReady = false;
        window._babelQueue = [];

        var transform = function(n) {
            if (n && n.tagName === 'SCRIPT') {
                if (n.type !== 'text/babel' && !n.src.match(/babel|core-js|es5-shim/)) {
                    n.type = 'text/babel';
                }
            }
        };

        if (typeof MutationObserver !== 'undefined') {
            var observer = new MutationObserver(function(mutations) {
                for (var i = 0; i < mutations.length; i++) {
                    var added = mutations[i].addedNodes;
                    for (var j = 0; j < added.length; j++) transform(added[j]);
                }
            });
            observer.observe(document.documentElement, { childList: true, subtree: true });
        } else {
            // Ripiego per IE9/10
            document.addEventListener('DOMNodeInserted', function(e) {
                transform(e.target);
            }, false);
        }

        var originalAdd = window.addEventListener || window.attachEvent;
        var proxy = function(t, l, o) {
            if (t === 'DOMContentLoaded' || t === 'load') {
                if (window._babelReady) {
                    setTimeout(l, 1);
                } else {
                    window._babelQueue.push(l);
                }
                return;
            }
            if (window.addEventListener) {
                return originalAdd.call(this, t, l, o);
            } else {
                return window.attachEvent('on' + t, l);
            }
        };
        window.addEventListener = document.addEventListener = proxy;

        var load = function(src, cb) {
            var s = document.createElement('script');
            s.src = src;
            s.async = false;
            if (s.readyState) {
                s.onreadystatechange = function() {
                    if (s.readyState === "loaded" || s.readyState === "complete") {
                        s.onreadystatechange = null; cb();
                    }
                };
            } else {
                s.onload = cb;
            }
            document.getElementsByTagName('head')[0].appendChild(s);
        };

        load("https://cdnjs.cloudflare.com/ajax/libs/es5-shim/4.6.7/es5-shim.min.js", function() {
            load("https://cdnjs.cloudflare.com/ajax/libs/core-js/3.32.2/minified.js", function() {
                try {
                    window.CustomEvent = function(e, p) {
                        p = p || {};
                        var evt = document.createEvent('CustomEvent');
                        evt.initCustomEvent(e, !!p.bubbles, !!p.cancelable, p.detail);
                        return evt;
                    };
                } catch(err) {}

                load("https://unpkg.com/@babel/standalone/babel.min.js", function() {
                    var runBabel = function() {
                        window._babelReady = true;
                        while (window._babelQueue.length) {
                            var f = window._babelQueue.shift();
                            try { f({ type: 'DOMContentLoaded', target: document }); } catch (e) {}
                        }
                        try {
                            var ev = document.createEvent('Event');
                            ev.initEvent('DOMContentLoaded', true, true);
                            document.dispatchEvent(ev);
                        } catch(e) {}
                    };

                    if (window.Babel) {
                        window.Babel.transformScriptTags();
                        setTimeout(runBabel, 500);
                    }
                });
            });
        });
    }
})();