/**
 * Minimal service worker for PWA installability (Chromium / Samsung Internet, etc.).
 * Passes all requests to the network; no offline cache in this build.
 */
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  event.respondWith(fetch(event.request));
});
