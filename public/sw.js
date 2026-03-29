const CACHE_NAME = 'diamond-ai-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/styles/style.css',
  '/scripts/renderer.js',
  '/scripts/pwa.js',
  '/manifest.json',
  '/icons/icon-512.png',
  '/images/load-boy.png',
  '/images/botsp.png'
  // full.png и unfull.png не используются в коде, но можно добавить, если понадобятся
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (url.origin === location.origin && urlsToCache.includes(url.pathname)) {
    event.respondWith(
      caches.match(event.request).then(response => response || fetch(event.request))
    );
  } else {
    event.respondWith(fetch(event.request));
  }
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
    ))
  );
});