// Offline support: keep the app's own files on the phone so it opens without internet.
// Change VERSION whenever any file changes, so phones pick up the new version.
const VERSION = "penguin-checklist-v3";
const FILES = [
  "./",
  "index.html",
  "manifest.webmanifest",
  "fonts/KoPubWorldDotum-Bold.woff2",
  "images/penguin-body.png",
  "images/penguin-wing-l.png",
  "images/penguin-wing-r.png",
  "images/icon-192.png",
  "images/icon-512.png",
  "images/icon-maskable-512.png",
  "images/apple-touch-icon.png"
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET" || new URL(req.url).origin !== location.origin) return;
  if (req.mode === "navigate") {
    // the page itself: try the network first so updates arrive, fall back to the saved copy offline
    e.respondWith(
      fetch(req).then((res) => {
        const copy = res.clone();
        caches.open(VERSION).then((c) => c.put("index.html", copy));
        return res;
      }).catch(() => caches.match("index.html"))
    );
    return;
  }
  e.respondWith(caches.match(req).then((hit) => hit || fetch(req)));
});
