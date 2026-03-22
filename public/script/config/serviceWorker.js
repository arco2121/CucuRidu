const CACHE_NAME = 'cucuridu_cache';
const OFFLINE_URL = '/offline';

const ASSETS_TO_CACHE = [
    OFFLINE_URL,
    '/assets/colors.json',
    '/style/global.css',
    '/script/config/colorConfig.js',
    '/script/config/ejs.js',
    '/assets/icon.png',
    '/assets/offline_icon.png',
    '/assets/loading.webp',
    '/assets/fonts/Nunito-Italic-VariableFont_wght.ttf',
    '/assets/fonts/Nunito-VariableFont_wght.ttf',
    '/assets/fonts/SourGummy-Italic-VariableFont_wdth,wght.ttf',
    '/assets/fonts/SourGummy-VariableFont_wdth,wght.ttf'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
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
                        return caches.delete(cache);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

self.addEventListener('fetch', (event) => {
    if (event.request.mode === 'navigate') {
        event.respondWith(
            fetch(event.request).catch(() => caches.match(OFFLINE_URL))
        );
        return;
    }
    event.respondWith(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.match(event.request).then((response) => {
                const fetchPromise = fetch(event.request).then((networkResponse) => {
                    if (networkResponse.ok) {
                        cache.put(event.request, networkResponse.clone());
                    }
                    return networkResponse;
                }).catch(() => response);
                return response || fetchPromise;
            });
        })
    );
});