/*
 * LME klient-lås for betalte verktøy.
 *
 * En side ber om lås ved å sette (før dette skriptet lastes):
 *   window.LME_REQUIRES = "sub";            // krever aktivt abonnement/medlemskap
 *   window.LME_MIN_TIER = "pro";            // valgfritt: krev minst dette nivået
 *   window.LME_GATE_TITLE = "Pro-verktøy";  // valgfri overskrift
 *   window.LME_GATE_URL   = "/oppgrader";   // hvor "Se planene" går
 *
 * Er brukeren logget inn med et aktivt abonnement (og høyt nok nivå), skjer
 * ingenting. Ellers legges et vennlig låse-lag over siden. Eier slipper alltid
 * gjennom. Fail-open: ved teknisk feil, eller når nivået ikke er kjent på
 * Pages-siden, låses ingenting, så en ekte betalende bruker aldri stenges ute.
 */
(function () {
  if (!window.LME_REQUIRES) return;

  function txt(no, en) {
    return (window.LME_CURRENT_LANG === "en") ? en : no;
  }

  function showGate(loggedIn) {
    if (document.getElementById("lme-gate")) return;
    var url = window.LME_GATE_URL || "/oppgrader";
    var title = window.LME_GATE_TITLE || txt("Dette er en betalt funksjon", "This is a paid feature");
    var body = loggedIn
      ? txt("Verktøyet krever et aktivt abonnement.", "This tool requires an active subscription.")
      : txt("Logg inn eller velg en plan for å bruke verktøyet.", "Log in or choose a plan to use this tool.");
    var o = document.createElement("div");
    o.id = "lme-gate";
    o.style.cssText = "position:fixed;inset:0;z-index:99999;background:rgba(255,247,244,.96);display:grid;place-items:center;padding:24px;text-align:center;font-family:inherit;";
    o.innerHTML =
      '<div style="max-width:420px;background:#fff;border-radius:22px;padding:34px 28px;box-shadow:0 14px 44px rgba(233,30,137,.16)">' +
      '<div style="font-size:36px;margin-bottom:10px">🔒</div>' +
      '<h2 style="font-family:var(--font-head,inherit);color:#E91E89;margin:0 0 8px;font-size:22px">' + title + "</h2>" +
      '<p style="color:#5a4750;line-height:1.6;margin:0 0 22px">' + body + "</p>" +
      '<a href="' + url + '" style="display:inline-block;background:linear-gradient(120deg,#E91E89,#ff5fb0);color:#fff;font-weight:800;text-decoration:none;padding:13px 28px;border-radius:999px;box-shadow:0 10px 24px rgba(233,30,137,.28)">' +
      txt("Se planene →", "See the plans →") + "</a>" +
      '<div style="margin-top:14px"><a href="/dashboard" style="color:#9a8790;font-size:14px;text-decoration:none">' + txt("← Tilbake", "← Back") + "</a></div>" +
      "</div>";
    document.body.appendChild(o);
  }

  var RANK = { medlem: 1, regular: 1, member: 1, pro: 2, vip: 3, owner: 4 };

  function start() {
    fetch("/api/access", { credentials: "same-origin" })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (a) {
        if (!a) return;                 // fail-open
        if (a.plan === "owner" || a.tier === "owner") return; // eier slipper alltid gjennom
        if (!a.active) { showGate(!!a.loggedIn); return; }     // ikke innlogget / uten abonnement
        // Aktiv: sjekk eventuelt nivåkrav. Er nivået ukjent (null), er vi
        // fail-open, så en ekte betalende bruker aldri stenges ute.
        var need = window.LME_MIN_TIER ? (RANK[String(window.LME_MIN_TIER).toLowerCase()] || 0) : 0;
        if (need && a.tier) {
          var have = RANK[String(a.tier).toLowerCase()] || 0;
          if (have < need) { showGate(true); return; }
        }
        // aktiv og nivå ok (eller ukjent): ingen lås
      })
      .catch(function () { /* fail-open */ });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else { start(); }
})();
