/* ============================================================
   LME Læringsverksted — delt favoritt-klient.
   Anonyme brukere: lagres kun i denne nettleseren (localStorage).
   Innloggede brukere: synkroniseres til /api/laeringsverksted-favorites
   (KV per bruker), så favoritter følger med på tvers av enheter. Rett
   etter innlogging slås lokale favoritter sammen med de lagrede, uten
   å miste noe.

   window.LMEFavorites.init(function (favoriteSlugs) { ... })
   window.LMEFavorites.isFavorite(slug) -> bool
   window.LMEFavorites.toggle(slug) -> bool (ny tilstand, satt synkront)
   window.LMEFavorites.getAll() -> [slug, ...]
   ============================================================ */
(function () {
  var LOCAL_KEY = "lv_favorites";
  var favs = [];
  var loggedIn = null;

  function readLocal() {
    try { return JSON.parse(localStorage.getItem(LOCAL_KEY) || "[]"); } catch (e) { return []; }
  }
  function writeLocal(list) {
    try { localStorage.setItem(LOCAL_KEY, JSON.stringify(list)); } catch (e) {}
  }
  function trackStat(slug, kind) {
    fetch("/api/laeringsverksted", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "track", slug: slug, kind: kind }),
    }).catch(function () {});
  }

  function init(cb) {
    fetch("/api/laeringsverksted-favorites", { credentials: "same-origin" })
      .then(function (r) { return r.json(); })
      .then(function (d) {
        if (!d || d.error === "not_logged_in" || d.error === "not_configured") {
          loggedIn = false;
          favs = readLocal();
          if (cb) cb(favs.slice());
          return;
        }
        loggedIn = true;
        var serverFavs = d.favorites || [];
        var localFavs = readLocal();
        var toMerge = localFavs.filter(function (s) { return serverFavs.indexOf(s) === -1; });
        if (!toMerge.length) {
          favs = serverFavs;
          if (cb) cb(favs.slice());
          return;
        }
        fetch("/api/laeringsverksted-favorites", {
          method: "POST", credentials: "same-origin", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "merge", favorites: toMerge }),
        }).then(function (r) { return r.json(); })
          .then(function (d2) {
            favs = (d2 && d2.favorites) || serverFavs;
            writeLocal(favs);
            if (cb) cb(favs.slice());
          })
          .catch(function () {
            favs = serverFavs;
            if (cb) cb(favs.slice());
          });
      })
      .catch(function () {
        loggedIn = false;
        favs = readLocal();
        if (cb) cb(favs.slice());
      });
  }

  function isFavorite(slug) { return favs.indexOf(slug) !== -1; }

  function toggle(slug) {
    var i = favs.indexOf(slug);
    var on;
    if (i === -1) { favs.push(slug); on = true; } else { favs.splice(i, 1); on = false; }
    writeLocal(favs);
    trackStat(slug, on ? "favorite" : "unfavorite");
    if (loggedIn) {
      fetch("/api/laeringsverksted-favorites", {
        method: "POST", credentials: "same-origin", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "toggle", slug: slug }),
      }).catch(function () {});
    }
    return on;
  }

  function getAll() { return favs.slice(); }

  window.LMEFavorites = { init: init, isFavorite: isFavorite, toggle: toggle, getAll: getAll };
})();
