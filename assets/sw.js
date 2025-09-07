const CACHE_NAME = 'note-qr-v1';
const CORE_ASSETS = [
  '/',
  '/index.html',
  '/assets/styles.css',
  '/assets/ui.js',
  '/assets/generator.js',
  '/assets/scanner.js',
  '/assets/main.js',
  '/assets/manifest.webmanifest',
  '/assets/icons/logo.svg',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  // Cache-first for same-origin; network-first for others (e.g., CDNs)
  if (url.origin === location.origin) {
    event.respondWith(
      caches.match(event.request).then((res) => res || fetch(event.request))
    );
  } else {
    event.respondWith(
      fetch(event.request).then((res) => {
        const copy = res.clone();
        caches.open(CACHE_NAME).then((c) => c.put(event.request, copy)).catch(()=>{});
        return res;
      }).catch(() => caches.match(event.request))
    );
  }
});

