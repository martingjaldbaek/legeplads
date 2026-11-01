/* Service worker: makes Legeplads work offline.
 *
 * The deploy workflow (.github/workflows/pages.yml) replaces VERSION with the commit hash and
 * ASSETS with every file in the site. A new commit therefore means a byte-different sw.js, which
 * makes the browser install it, precache all files fresh, and switch over on the next launch.
 *
 * Locally (VERSION still the placeholder) it is network-first, so edits show up immediately.
 */
const VERSION = '__VERSION__';
const ASSETS = [/*__ASSETS__*/];
const DEV = VERSION === '__' + 'VERSION__';
const CACHE = 'legeplads-' + VERSION;

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    // cache:'reload' bypasses the HTTP cache so we never precache a stale file
    await cache.addAll(['./', ...ASSETS].map(url => new Request(url, { cache: 'reload' })));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    for (const key of await caches.keys()) {
      if (key.startsWith('legeplads-') && key !== CACHE) await caches.delete(key);
    }
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    if (!DEV) {
      const hit = await cache.match(req, { ignoreSearch: true });
      if (hit) return hit;
    }
    try {
      const res = await fetch(req);
      if (res.ok) cache.put(req, res.clone());
      return res;
    } catch (err) {
      const hit = await cache.match(req, { ignoreSearch: true }) ||
                  (req.mode === 'navigate' && await cache.match('./'));
      if (hit) return hit;
      throw err;
    }
  })());
});

self.addEventListener('message', event => {
  if (event.data === 'version') event.source.postMessage({ version: VERSION, dev: DEV });
});
