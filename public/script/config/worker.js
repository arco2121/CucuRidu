/*
 * Cambia VERSIONE_CACHE a ogni deploy in cui vuoi essere sicuro che i vecchi
 * file spariscano: all'attivazione le cache con un nome diverso vengono
 * cancellate.
 */
const VERSIONE_CACHE = 'v3';
const CACHE_NAME = 'cucuridu_cache_' + VERSIONE_CACHE;
const OFFLINE_URL = '/offline';
const files = [
    '/assets/colors.json',
    '<st?/global.css',
    '<st?/fonts.css',
    '<sc?/config/colorConfig.js',
    '/script/external/ejs.js',
    '<sc?/config/eventsConfig.js',
    '<sc?/views/components/manageBack.js',
    '<sc?/views/components/clearDom.js',
    '/assets/icon.png',
    '/assets/offline_icon.png',
    '/assets/pencil.png',
    '/assets/loading.webp',
    '/assets/loading.gif',
    '/assets/fonts/Nunito-Italic-VariableFont_wght.ttf',
    '/assets/fonts/Nunito-VariableFont_wght.ttf',
    '/assets/fonts/SourGummy-Italic-VariableFont_wdth,wght.ttf',
    '/assets/fonts/SourGummy-VariableFont_wdth,wght.ttf'
];

const FILES = [];
files.map(file => {
    if(file.startsWith("<st?")) {
        FILES.push(file.replace("<st?", "/style"));
        FILES.push(file.replace("<st?", "/dist/style"));
        return;
    }
    if(file.startsWith("<sc?")) {
        FILES.push(file.replace("<sc?", "/script"));
        FILES.push(file.replace("<sc?", "/dist/script"));
        return;
    }
    FILES.push(file);
});

const ASSETS_TO_CACHE = [
    OFFLINE_URL,
    ...FILES
];
console.log("File in cache => ", FILES);

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('SW: Pre-caching assets...');
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cache) => {
                    if (cache !== CACHE_NAME) {
                        console.log('SW: Cancellazione vecchia cache:', cache);
                        return caches.delete(cache);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);

    if (url.pathname.match(/\.(ogg|mp3|mp4)$/) || event.request.method !== 'GET') {
        return;
    }
    if (event.request.mode === 'navigate') {
        event.respondWith(
            fetch(event.request).catch(() => {
                return caches.match(OFFLINE_URL);
            })
        );
        return;
    }

    /*
     * Prima era tutto "prima la cache, poi aggiorno di nascosto": dopo un
     * deploy il primo caricamento mostrava ancora CSS e script vecchi, e la
     * versione nuova compariva solo al ricaricamento successivo. Da qui il
     * classico "ho aggiornato ma non e' cambiato niente".
     *
     * Ora quello che cambia spesso (css, js, ejs, json) va di rete e usa la
     * cache solo se la rete non risponde. Font, immagini e audio, che non
     * cambiano mai, restano su cache prima.
     */
    const DA_RETE = /\.(css|js|ejs|json)$/i;
    const daRete = DA_RETE.test(url.pathname) || url.pathname === '/socket.io/socket.io.js';

    if (daRete) {
        event.respondWith(
            caches.open(CACHE_NAME).then((cache) =>
                fetch(event.request)
                    .then((networkResponse) => {
                        if (networkResponse && networkResponse.status === 200)
                            cache.put(event.request, networkResponse.clone());
                        return networkResponse;
                    })
                    .catch(() => cache.match(event.request)
                        .then((cached) => cached || new Response('Offline', { status: 503 })))
            )
        );
        return;
    }

    event.respondWith(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.match(event.request).then((cachedResponse) => {
                const fetchPromise = fetch(event.request)
                    .then((networkResponse) => {
                        if (networkResponse && networkResponse.status === 200) {
                            cache.put(event.request, networkResponse.clone());
                        }
                        return networkResponse;
                    })
                    .catch(() => {
                        return cachedResponse || new Response('Offline', { status: 503 });
                    });
                return cachedResponse || fetchPromise;
            });
        })
    );
});
