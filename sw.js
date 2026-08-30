const CACHE = "dice-dungeon-v2-0-0-2000";
const CORE = [
  "./style.css?v=2000",
  "./game.js?v=2000",
  "./effects.js?v=2000",
  "./manifest.webmanifest?v=2000",
  "./icon-180.png",
  "./icon-192.png",
  "./icon-512.png"
];

self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(CORE)));
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;

  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request, {cache:"no-store"}).catch(() => caches.match("./"))
    );
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then(response => {
        const copy=response.clone();
        caches.open(CACHE).then(cache=>cache.put(event.request,copy));
        return response;
      })
      .catch(()=>caches.match(event.request))
  );
});