const CACHE_NAME = 'outatlas-v4';
const DATA_CACHE_NAME = 'outatlas-data-v4';

// Static assets to cache on install
const STATIC_ASSETS = [
    '/OutAtlasAPP/',
    '/OutAtlasAPP/index.html',
    '/OutAtlasAPP/tailwind.min.css',
    '/OutAtlasAPP/manifest.json',
];

// Install: pre-cache static assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
    );
    self.skipWaiting();
});

// Activate: clean up old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(
                keys
                    .filter((key) => key !== CACHE_NAME && key !== DATA_CACHE_NAME)
                    .map((key) => caches.delete(key))
            )
        )
    );
    self.clients.claim();
});

self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);

    // Cache-first for destinations.json (large data file — serve from cache instantly on repeat visits)
    if (url.pathname.endsWith('destinations.json')) {
        event.respondWith(
            caches.open(DATA_CACHE_NAME).then(async (cache) => {
                const cached = await cache.match(event.request);
                // Fetch fresh copy in background to keep cache updated
                const networkFetch = fetch(event.request).then((response) => {
                    if (response.ok) cache.put(event.request, response.clone());
                    return response;
                });
                // Return cached version immediately if available, otherwise wait for network
                return cached || networkFetch;
            })
        );
        return;
    }

    // Network-first for HTML files so code updates are always reflected immediately
    if (url.pathname.endsWith('.html') || url.pathname.endsWith('/') || url.pathname === '/OutAtlasAPP/') {
        event.respondWith(
            fetch(event.request).then((response) => {
                if (response.ok) {
                    caches.open(CACHE_NAME).then((cache) => cache.put(event.request, response.clone()));
                }
                return response;
            }).catch(() => caches.match(event.request))
        );
        return;
    }

    // Cache-first for static assets (CSS, icons, manifest) — these never change without a new deploy
    if (url.origin === self.location.origin && !url.pathname.includes('firebase')) {
        event.respondWith(
            caches.match(event.request).then((cached) =>
                cached ||
                fetch(event.request).then((response) => {
                    if (response.ok) {
                        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, response.clone()));
                    }
                    return response;
                })
            )
        );
        return;
    }

    // Network-first for everything else (Firebase, Unsplash images, fonts)
    event.respondWith(fetch(event.request).catch(() => caches.match(event.request)));
});
