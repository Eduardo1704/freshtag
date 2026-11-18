// Offline shell: network first (so updates show up right away), cache as fallback.
const CACHE = 'freshtag-v5';
const SHELL = ['./', 'index.html', 'css/app.css', 'css/glass.css', 'css/fonts/geist.woff2', 'css/fonts/space-grotesk.woff2', 'css/fonts.css', 'js/app.js', 'js/data.js', 'js/icons.js', 'js/recipes.js', 'js/feedback.js', 'img/isotipo.svg', 'img/logo.svg', 'img/wordmark.svg', 'img/icon-192.png'];

self.addEventListener('install', e => e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())));
self.addEventListener('activate', e => e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())));
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET' || !e.request.url.startsWith(self.location.origin)) return;
  // no-cache: revalidate with the server so a new version never mixes with stale modules from the HTTP cache
  e.respondWith(fetch(e.request, { cache: 'no-cache' }).then(r => {
    const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); return r;
  }).catch(() => caches.match(e.request, { ignoreSearch: true })));
});
self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(self.clients.matchAll({ type: 'window' }).then(ws => ws[0] ? ws[0].focus() : self.clients.openWindow('./')));
});
