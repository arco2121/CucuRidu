const CACHE_NAME = 'cucuridu_cache_v1';
const ASSETS_TO_CACHE = [
    '/assets/colors.json',
    '/style/global.css',
    '/script/config/colorConfig.js',
    '/script/config/ejs.js',
    '/assets/icon.png',
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

self.addEventListener('fetch', (event) => {
    if (event.request.mode === 'navigate') {
        return; 
    }

    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request);
        })
    );
});