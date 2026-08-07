/* ============================================================
   LME kurslås — betalte kurs er bare for kjøpere (og eier, via
   den vanlige kontoen). Ingen innlogging: kjøperen/den gratis-
   bekreftede får en personlig lenke i e-posten (?t=<token>),
   lagres i denne nettleseren så senere besøk uten ?t= også funker.

   Kjøres FØRST i <head> (blokkerende), så innholdet skjules før
   det rekker å vises. Har du en gyldig lenke, vises siden. Har du
   ikke, sendes du til salgssiden uten at kurset blinker frem.

   Eier ser alltid kurset (sjekket via /api/auth/me), uansett token.
   ============================================================ */
(function () {
  var id = window.LME_COURSE_ID;
  var SALES = window.LME_COURSE_SALES_URL || "/";
  if (!id) return; // siden er ikke merket som låst, ikke rør den

  try { document.documentElement.style.visibility = "hidden"; } catch (e) {}
  function reveal() { try { document.documentElement.style.visibility = ""; } catch (e) {} }
  function deny() { try { location.replace(SALES); } catch (e) { location.href = SALES; } }

  var lsKey = "course_access:" + id;
  var qToken = null;
  try { qToken = new URLSearchParams(location.search).get("t"); } catch (e) {}
  var token = qToken || (function () { try { return localStorage.getItem(lsKey); } catch (e) { return null; } })();

  var done = false;
  var ctrl; try { ctrl = new AbortController(); } catch (e) {}
  var timer = setTimeout(function () {
    if (done) return; done = true;
    if (ctrl) { try { ctrl.abort(); } catch (e) {} }
    deny();
  }, 8000);

  function finish(ok) {
    if (done) return; done = true; clearTimeout(timer);
    if (ok) {
      if (qToken) { try { localStorage.setItem(lsKey, qToken); } catch (e) {} }
      reveal();
    } else {
      deny();
    }
  }

  // Eier har alltid tilgang, uansett token. Samme e-postliste som isOwner()
  // i functions/_lib/access.js (kun en klient-bekvemmelighet for eiers egen
  // forhåndsvisning, den ekte sperren er server-sjekken av selve tokenet).
  var OWNER_EMAILS = ["renate@lmexplorers.com", "hei@lmexplorers.com", "hello@lmexplorers.com", "support@lmexplorers.com", "renateshobby@hotmail.com"];
  fetch("/api/auth/me", { credentials: "same-origin" })
    .then(function (r) { return r.json(); })
    .then(function (me) {
      var u = me && me.user;
      var isOwner = u && (u.role === "owner" || u.role === "admin" || OWNER_EMAILS.indexOf((u.email || "").toLowerCase()) !== -1);
      if (isOwner) { finish(true); return; }
      if (!token) { finish(false); return; }
      fetch("/api/course-access?course=" + encodeURIComponent(id) + "&t=" + encodeURIComponent(token), {
        credentials: "same-origin", signal: ctrl && ctrl.signal,
      })
        .then(function (r) { return r.json(); })
        .then(function (d) { finish(!!(d && d.ok)); })
        .catch(function () { finish(false); });
    })
    .catch(function () {
      if (!token) { finish(false); return; }
      fetch("/api/course-access?course=" + encodeURIComponent(id) + "&t=" + encodeURIComponent(token), {
        credentials: "same-origin", signal: ctrl && ctrl.signal,
      })
        .then(function (r) { return r.json(); })
        .then(function (d) { finish(!!(d && d.ok)); })
        .catch(function () { finish(false); });
    });
})();
