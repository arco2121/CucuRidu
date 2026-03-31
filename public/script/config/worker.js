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

self.addEventListener('push', (event) => {
    let data = { title: 'Default', body: 'Default', url: '/' };
    try {
        if (event.data)
            data = event.data.json();
    } catch (e) {
        console.error("Errore:", e);
    }

    const options = {
        body: data.body,
        icon: '/assets/icon.png',
        badge: '/assets/error_icon.png',
        vibrate: [200, 100, 200],
        tag: data.tag || 'cucuridu',
        renotify: true,
        data: {
            url: data.url || '/'
        },
        actions: data.actions || null
    };

    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});

self.addEventListener('notificationclick', (event) => {
    const notification = event.notification;
    const action = event.action;
    const targetUrl = new URL(notification.data.url, self.location.origin).href;
    notification.close();

    if (action === 'close') return;

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then((windowClients) => {
                for (let client of windowClients) {
                    if (client.url === targetUrl && 'focus' in client) {
                        return client.focus();
                    }
                }
                if (clients.openWindow) {
                    return clients.openWindow(targetUrl);
                }
            })
    );
});