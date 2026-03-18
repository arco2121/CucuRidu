const CACHE_NAME = 'cucuridu_cache';
const ASSETS_TO_CACHE = [
    '/',
    '/assets/color.json',
    '/style/global.css',
    '/script/colorConfig.js',
    '/script/ejs.js',
    '/assets/icon.png',
    '/assets/loading.webp',
    '/assets/fonts/Nunito-Italic-VariableFont_wght.ttf',
    '/assets/fonts/Nunito-VariableFont_wght.ttf',
    'assets/fonts/SourGummy-Italic-VariableFont_wdth,wght.ttf',
    '/assets/fonts/SourGummy-VariableFont_wdth,wght.ttf'
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