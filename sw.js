// ============================================================
//  LONA OS — sw.js  Service Worker (PWA)
// ============================================================

const CACHE = "lona-os-v2";
const ASSETS = [
  "./",
  "./home.html",
  "./gatekeeper.html",
  "./hub.html",
  "./profile.html",
  "./library.html",
  "./index.html",
  "./style.css",
  "./config.js",
  "./engine.js",
  "./manifest.json",
  "./engine/gatekeeper.js",
  "./engine/xp.js",
  "./engine/cooldown.js",
  "./engine/joker.js",
  "./engine/actionPrompt.js",
  "./engine/mastery.js",
  "./engine/season.js",
  "./engine/equipment.js",
  "./engine/eq.js",
  "./engine/bank.js",
  "./engine/attributes.js",
  "./engine/progressive.js",
  "./engine/streak.js",
  "./engine/custom_missions.js",
  "./engine/scholar.js",
];

self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  // Na localhost — vedno iz omrežja, nikoli cache
  if (e.request.url.includes('127.0.0.1') || e.request.url.includes('localhost')) {
    e.respondWith(fetch(e.request));
    return;
  }
  const url = e.request.url;
  if (e.request.destination === "document" || url.endsWith(".html")) {
    e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
  } else {
    e.respondWith(caches.match(e.request).then(cached => cached || fetch(e.request)));
  }
});
