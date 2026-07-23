/* LME service worker
   Forsiktig strategi som aldri viser utdatert innhold:
   - Sider (HTML): alltid nett foerst, hurtiglager kun som noedfall ved frakobling.
   - Bilder og fonter: hurtiglager foerst (de endres sjelden, og fils-URL-er
     versjoneres med ?v= ved endring).
   - API-kall og alt annet: alltid rett paa nett, aldri hurtiglagret. */

var VERSION = 'lme-sw-v2';
var STATIC_CACHE = VERSION + '-static';
var PAGE_CACHE = VERSION + '-pages';

self.addEventListener('install', function (e) {
  self.skipWaiting();
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.map(function (k) {
        if (k.indexOf(VERSION) !== 0) return caches.delete(k);
      }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;
  var url = new URL(req.url);
  if (url.origin !== location.origin) return;

  // API og funksjoner: aldri hurtiglagres
  if (url.pathname.indexOf('/api/') === 0) return;

  // Bilder og fonter: hurtiglager foerst
  if (url.pathname.indexOf('/images/') === 0 || url.pathname.indexOf('/fonts/') === 0) {
    e.respondWith(
      caches.open(STATIC_CACHE).then(function (cache) {
        return cache.match(req).then(function (hit) {
          if (hit) return hit;
          return fetch(req).then(function (res) {
            if (res.ok) cache.put(req, res.clone());
            return res;
          });
        });
      })
    );
    return;
  }

  // Sider: nett foerst, hurtiglager kun ved frakobling.
  // { cache: 'reload' } hopper over nettleserens HTTP-buffer, saa en gammel
  // side (f.eks. med et fjernet loefte) aldri vises fra buffer naar man er paa nett.
  if (req.mode === 'navigate' || (req.headers.get('accept') || '').indexOf('text/html') !== -1) {
    e.respondWith(
      fetch(req, { cache: 'reload' }).then(function (res) {
        if (res.ok) {
          var copy = res.clone();
          caches.open(PAGE_CACHE).then(function (cache) { cache.put(req, copy); });
        }
        return res;
      }).catch(function () {
        return caches.match(req);
      })
    );
  }
});
