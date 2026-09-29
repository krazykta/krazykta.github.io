// Venecia · service worker. Solo guarda la app para usarla sin conexión.
// Tus marcas y notas viven en el almacenamiento del navegador y NO se tocan al actualizar.
const CACHE = "venecia-2026-09-29-1";
const SHELL = ["./", "./index.html", "./data.js", "./manifest.webmanifest"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith("venecia-") && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", e => {
  const r = e.request; if (r.method !== "GET") return;
  const u = new URL(r.url);
  if (r.mode === "navigate") {
    e.respondWith(fetch(r).then(res => { const cp = res.clone(); caches.open(CACHE).then(c => c.put("./index.html", cp)); return res; }).catch(() => caches.match("./index.html")));
    return;
  }
  if (u.origin === location.origin || u.hostname.endsWith("fonts.googleapis.com") || u.hostname.endsWith("fonts.gstatic.com")) {
    e.respondWith(caches.match(r).then(hit => {
      const net = fetch(r).then(res => { if (res && (res.ok || res.type === "opaque")) { const cp = res.clone(); caches.open(CACHE).then(c => c.put(r, cp)); } return res; }).catch(() => hit);
      return hit || net;
    }));
  }
});
