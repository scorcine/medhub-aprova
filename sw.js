/* MedHub R1 — service worker (PWA). HTML/JS sempre da rede quando online. */
const APROVA_SW_VERSION = "r1-pwa-4";

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(APROVA_SW_VERSION).then((cache) =>
      cache.addAll([
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

  const url = new URL(req.url);
  // API e scripts de auth nunca saem do cache local
  if (url.pathname.indexOf("/api/") === 0) {
    event.respondWith(fetch(req));
    return;
  }

  const isDoc =
    req.mode === "navigate" ||
    (req.headers.get("accept") || "").indexOf("text/html") >= 0 ||
    /\.(?:html?|js|webmanifest)(?:$|\?)/i.test(url.pathname);

  if (isDoc) {
    event.respondWith(
      fetch(req)
        .then((res) => res)
        .catch(() =>
          caches.match(req).then((hit) => hit || caches.match("/app.html"))
        )
    );
    return;
  }

  event.respondWith(
    fetch(req).catch(() => caches.match(req))
  );
});
