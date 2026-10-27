// Service Worker — guarda la app completa en el celular para usarla sin internet.
// Al publicar una versión nueva, cambiar el número de VERSION.
const VERSION = 'fichafinca-prueba-v1';
const ARCHIVOS = [
  './',
  './index.html',
  './manifest.json',
  './jspdf.umd.min.js',
  './icon-192.png',
  './icon-512.png',
  './icon-maskable.png',
  './apple-touch-icon.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(ARCHIVOS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((ks) => Promise.all(ks.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Primero la copia guardada; si hay internet, se actualiza en segundo plano.
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request, { ignoreSearch: true }).then((guardado) => {
      const red = fetch(e.request)
        .then((resp) => {
          if (resp && resp.ok && new URL(e.request.url).origin === location.origin) {
            const copia = resp.clone();
            caches.open(VERSION).then((c) => c.put(e.request, copia));
          }
          return resp;
        })
        .catch(() => guardado || caches.match('./index.html'));
      return guardado || red;
    })
  );
});
