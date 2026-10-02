const CACHE_NAME = "eom-os-cache-v1";
const ASSETS_TO_CACHE = [
  "/",
  "/index.html",
  "/style.css",
  "/styles.css",
  "/app.js",
  "/script.js",
  "/Documentary.html",
  "/apple-touch-icon.png",
  "/favicon.svg",
  "/manifest.json"
];

// Install event - caching assets
self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Activate event - cleanup old caches
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - network first, falling back to cache
self.addEventListener("fetch", (e) => {
  // Exclude non-GET requests and PHP backend calls from cache
  if (e.request.method !== "GET" || e.request.url.includes("validate.php")) {
    return;
  }

  e.respondWith(
    fetch(e.request)
      .then((res) => {
        // Clone response and cache it
        const resClone = res.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(e.request, resClone);
        });
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
