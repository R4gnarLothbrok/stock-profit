// service-worker.js
// ─────────────────────────────────────────────
// A service worker sits between your app and the network.
// This one does one job: caches the app shell so it loads
// instantly (and works offline) after the first visit.
// ─────────────────────────────────────────────

const CACHE_NAME = 'stock-profit-v1';

// Files to cache on install — the app shell
const SHELL = [
  '/index.html',
  '/manifest.json'
];

// Install: cache the app shell
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(SHELL))
  );
  self.skipWaiting();
});

// Activate: delete old caches if the version changed
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch: serve from cache if available, otherwise go to network
// API calls (Twelve Data, exchange rate) always go to the network —
// we never want stale prices from a cache.
self.addEventListener('fetch', event => {
  const url = event.request.url;

  // Always fetch live data from APIs
  if (url.includes('twelvedata.com') || url.includes('open.er-api.com') || url.includes('fonts.googleapis.com')) {
    return; // let browser handle it normally
  }

  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request))
  );
});
