const CACHE_NAME = 'cucuridu_cache';
const ASSETS_TO_CACHE = [
    '/',
    '/assets/color.json',
    '/style/global.css',
    '/script/colorConfig.js',
    '/script/ejs.js',
    '/assets/icon.png',
    '/assets/loading.webp'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request);
        })
    );
});