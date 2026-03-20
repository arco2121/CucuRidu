const CACHE_NAME = 'cucuridu_cache';
const ASSETS_TO_CACHE = [
    '/assets/color.json',
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
    self.skipWaiting(); // Forza l'attivazione immediata
});

self.addEventListener('fetch', (event) => {
    // 1. IGNORA le richieste per le pagine (HTML/Navigazione)
    // Se è una navigazione, non facciamo nulla: il browser gestirà l'offline standard.
    if (event.request.mode === 'navigate') {
        return; 
    }

    // 2. GESTISCI solo gli asset specifici (immagini, font, css, json)
    event.respondWith(
        caches.match(event.request).then((response) => {
            // Se lo abbiamo in cache (perché messo in ASSETS_TO_CACHE o salvato prima), usalo.
            // Altrimenti vai in rete.
            return response || fetch(event.request);
        })
    );
});