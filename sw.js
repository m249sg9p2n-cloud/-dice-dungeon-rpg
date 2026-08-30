const CACHE = "dice-dungeon-v1-3-0-1300";
const CORE = [
  "./style.css?v=1300",
  "./game.js?v=1300",
  "./effects.js?v=1300",
  "./manifest.webmanifest?v=1300",
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