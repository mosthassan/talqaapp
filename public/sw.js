/**
 * Talqa Net PWA Service Worker
 * Version: talqanet-v2 (Phase 2 Update)
 * Features: Precaching, StaleWhileRevalidate, CacheFirst, OSM Map Tiles Caching,
 * Bypass for real speed test endpoints, and safe manual SKIP_WAITING flow.
 */

const CACHE_NAME = 'talqanet-cache-v2';
const TILE_CACHE_NAME = 'talqanet-tiles-v2';

const PRECACHE_URLS = [
  '/',
  '/offline.html',
  '/manifest.webmanifest',
  '/manifest.json',
  '/icon.svg',
  '/pwa-192x192.png',
  '/pwa-512x512.png',
  '/apple-touch-icon.png',
  '/favicon.png',
];

// Maximum cached map tiles to protect storage
const MAX_TILES = 100;

async function limitCacheSize(cacheName, maxItems) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  if (keys.length > maxItems) {
    await cache.delete(keys[0]);
    limitCacheSize(cacheName, maxItems);
  }
}

// Install: Precache shell resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_URLS);
    })
  );
  // Note: Do NOT auto-skipWaiting here to preserve active user session
});

// Activate: Clean up old caches
self.addEventListener('activate', (event) => {
  const currentCaches = [CACHE_NAME, TILE_CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (!currentCaches.includes(name)) {
            return caches.delete(name);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Listen for SKIP_WAITING from user in-app toast
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Fetch handling with intelligent caching strategies
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // Ignore non-GET requests and external protocols
  if (request.method !== 'GET') return;
  if (!url.protocol.startsWith('http')) return;

  // STRICT BYPASS: Never cache Speed Test endpoints (live measurement integrity)
  if (
    url.hostname.includes('speed.cloudflare.com') ||
    url.pathname.startsWith('/api/speed')
  ) {
    return; // Pass through to network directly
  }

  // 1. OpenStreetMap Map Tiles: CacheFirst with capacity limit
  if (url.hostname.endsWith('tile.openstreetmap.org')) {
    event.respondWith(
      caches.open(TILE_CACHE_NAME).then(async (tileCache) => {
        const cached = await tileCache.match(request);
        if (cached) return cached;

        try {
          const networkResponse = await fetch(request);
          if (networkResponse && networkResponse.status === 200) {
            tileCache.put(request, networkResponse.clone());
            limitCacheSize(TILE_CACHE_NAME, MAX_TILES);
          }
          return networkResponse;
        } catch {
          return cached || new Response('', { status: 408 });
        }
      })
    );
    return;
  }

  // 2. Navigation requests: NetworkFirst with offline.html fallback
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(async () => {
          const cachedResponse = await caches.match(request);
          if (cachedResponse) return cachedResponse;
          const offlinePage = await caches.match('/offline.html');
          return offlinePage || new Response('Offline', { status: 503 });
        })
    );
    return;
  }

  // 3. Static assets & images & fonts: CacheFirst
  if (
    url.pathname.match(/\.(png|jpg|jpeg|svg|webp|ico|woff|woff2|ttf|css|js)$/) ||
    url.origin === 'https://fonts.googleapis.com' ||
    url.origin === 'https://fonts.gstatic.com'
  ) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          // Revalidate in background for css/js chunks
          fetch(request).then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              caches.open(CACHE_NAME).then((cache) => cache.put(request, networkResponse));
            }
          }).catch(() => {});
          return cachedResponse;
        }

        return fetch(request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return networkResponse;
        });
      })
    );
    return;
  }

  // 4. Data / API requests: StaleWhileRevalidate
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const fetchPromise = fetch(request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          caches.open(CACHE_NAME).then((cache) => cache.put(request, networkResponse));
        }
        return networkResponse;
      }).catch(() => cachedResponse);

      return cachedResponse || fetchPromise;
    })
  );
});
