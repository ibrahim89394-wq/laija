/* يحفظ الصفحة على الآيباد عشان تفتح بدون إنترنت */
const CACHE = 'laija-lux-v3';
const PAGE = new URL('./index.html', self.registration.scope).href;

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => fetch(PAGE, {cache:'reload'}).then(r => { if (!r.ok) throw new Error('fetch'); return c.put(PAGE, r); }))
      .then(() => self.skipWaiting())
  );
});
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;
  const isPage = req.mode === 'navigate' || url.pathname.endsWith('/') || url.pathname.endsWith('/index.html');
  e.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const key = isPage ? PAGE : req;
    const cached = await cache.match(key, {ignoreSearch:true});
    const net = fetch(isPage ? PAGE : req, {cache:'no-cache'})
      .then(r => { if (r.ok) return cache.put(key, r.clone()).then(() => r); return r; });
    if (cached){ e.waitUntil(net.catch(()=>{})); return cached; }
    return net;
  })());
});
