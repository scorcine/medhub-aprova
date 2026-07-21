/* MedHub R1 — service worker mínimo (necessário para “Instalar app” no Android) */
const APROVA_SW_VERSION = "r1-pwa-1";

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(APROVA_SW_VERSION).then((cache) =>
      cache.addAll([
        "/",
        "/index.html",
        "/app.html",
        "/cadastro.html",
        "/manifest.webmanifest",
        "/assets/icon-192.png",
        "/assets/icon-512.png",
        "/assets/medhub-r1-logo.png"
      ]).catch(() => undefined)
    )
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== APROVA_SW_VERSION).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  event.respondWith(
    fetch(req).catch(() => caches.match(req).then((hit) => hit || caches.match("/app.html")))
  );
});
