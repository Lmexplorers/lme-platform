/**
 * LME auth-klient — Cloudflare-native (snakker med /api/auth/*).
 * Ingen Supabase. Sesjonen ligger i en HttpOnly-cookie, så vi trenger
 * ikke håndtere tokens i nettleseren.
 */
(function () {
  window.LME = {
    /* Hent innlogget bruker + abonnement + kjøp. Returnerer {user, subscription, purchases}. */
    me: function () {
      return fetch("/api/auth/me", { credentials: "same-origin" })
        .then(function (r) { return r.json(); })
        .catch(function () { return { user: null }; });
    },

    /* Krev innlogging. Sender til /login hvis ikke innlogget. Returnerer data ellers. */
    requireAuth: function (loginPath) {
      return LME.me().then(function (d) {
        if (!d || !d.user) {
          location.replace((loginPath || "/login") + "?next=" + encodeURIComponent(location.pathname));
          return null;
        }
        return d;
      });
    },

    login: function (email, password) {
      return fetch("/api/auth/login", {
        method: "POST", credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email, password: password }),
      }).then(function (r) { return r.json(); });
    },

    register: function (email, password, name) {
      return fetch("/api/auth/register", {
        method: "POST", credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email, password: password, name: name || "" }),
      }).then(function (r) { return r.json(); });
    },

    signOut: function () {
      return fetch("/api/auth/logout", { method: "POST", credentials: "same-origin" })
        .then(function () { location.replace("/login"); });
    },
  };
})();
