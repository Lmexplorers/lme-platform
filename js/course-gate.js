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

  /* Fikk vi ikke svar på om du har tilgang, er det feil å sende deg stille
     tilbake til salgssiden: da ser det ut som lenken ikke virker, og du får
     ingen anelse om hvorfor (Renate, 31. august 2026). Siden holdes fortsatt
     skjult, du får bare vite hva som skjedde, og en vei videre. */
  function usikker() {
    var en = (document.documentElement.lang || "no").toLowerCase().indexOf("en") === 0;
    var d = document.createElement("div");
    d.style.cssText = "position:fixed;inset:0;z-index:2147483000;display:flex;align-items:center;justify-content:center;padding:24px;background:#FBF7F0;font-family:'Sasson Montessori','Playpen Sans',system-ui,sans-serif;color:#1F1B24;text-align:center;visibility:visible";
    d.innerHTML =
      '<div style="max-width:420px">' +
      '<div style="font-size:38px;line-height:1;margin-bottom:14px">🔄</div>' +
      '<h1 style="font-family:\'Playpen Sans\',system-ui,sans-serif;font-size:22px;margin:0 0 10px">' +
      (en ? "Could not check your access" : "Fikk ikke sjekket tilgangen din") + "</h1>" +
      '<p style="font-size:15px;color:#5A5560;margin:0 0 18px">' +
      (en
        ? "The connection did not answer in time. Try again, and if you have bought this, log in first."
        : "Forbindelsen svarte ikke i tide. Prøv igjen, og logg inn først hvis du har kjøpt dette.") + "</p>" +
      '<button id="lme-gate-retry" style="font-family:inherit;font-size:15.5px;font-weight:800;border:none;border-radius:999px;padding:14px 24px;color:#fff;background:linear-gradient(120deg,#E91E89,#ff5fb0);cursor:pointer">' +
      (en ? "Try again" : "Prøv igjen") + "</button>" +
      '<div style="margin-top:14px"><a href="' + SALES + '" style="font-size:14px;color:#938E99">' +
      (en ? "See what this is" : "Se hva dette er") + "</a>" +
      ' · <a href="/login" style="font-size:14px;color:#938E99">' + (en ? "Log in" : "Logg inn") + "</a></div>" +
      "</div>";
    (document.body || document.documentElement).appendChild(d);
    var b = document.getElementById("lme-gate-retry");
    if (b) b.addEventListener("click", function () { location.reload(); });
  }

  var lsKey = "course_access:" + id;
  var qToken = null;
  try { qToken = new URLSearchParams(location.search).get("t"); } catch (e) {}
  var token = qToken || (function () { try { return localStorage.getItem(lsKey); } catch (e) { return null; } })();

  var done = false;
  var ctrl; try { ctrl = new AbortController(); } catch (e) {}
  var timer = setTimeout(function () {
    if (done) return; done = true;
    if (ctrl) { try { ctrl.abort(); } catch (e) {} }
    usikker();
  }, 12000);

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
      sjekkToken(false);
    })
    // Svarte ikke serveren i det hele tatt, vet vi ingenting om hvem du er.
    // Da er "ikke kjøpt" en gjetning, ikke et svar, og du skal ikke sendes
    // stille bort. Har du et tilgangstoken, prøver vi det først.
    .catch(function () {
      if (!token) { if (!done) { done = true; clearTimeout(timer); usikker(); } return; }
      sjekkToken(true);
    });

  function sjekkToken(uvissBakgrunn) {
    fetch("/api/course-access?course=" + encodeURIComponent(id) + "&t=" + encodeURIComponent(token), {
      credentials: "same-origin", signal: ctrl && ctrl.signal,
    })
      .then(function (r) { return r.json(); })
      .then(function (d) { finish(!!(d && d.ok)); })
      .catch(function () {
        if (uvissBakgrunn) { if (!done) { done = true; clearTimeout(timer); usikker(); } return; }
        finish(false);
      });
  }
})();
