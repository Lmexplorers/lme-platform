/* =========================================================
   LME anonym funnel-sporing (Ads-funnel).

   Førstepart, personvernvennlig: ingen persondata, ingen
   informasjonskapsler mot tredjepart. Vi teller bare:
     - besøk og sidevisninger
     - hvilken annonse/kampanje folk kom fra (UTM i lenken)
     - trykk på kjøp/bli med (Stripe-lenker, /medlemskap, eller
       elementer merket data-track="…")

   Tallene sendes til /api/track og vises for eier på /analytics.
   Respekterer "Do Not Track".
   ========================================================= */
(function () {
  try { if (navigator.doNotTrack === "1" || window.doNotTrack === "1") return; } catch (e) {}
  var LS = null;
  try { LS = window.localStorage; } catch (e) { LS = null; }

  function get(k) { try { return LS ? LS.getItem(k) : null; } catch (e) { return null; } }
  function set(k, v) { try { if (LS) LS.setItem(k, v); } catch (e) {} }

  function vid() {
    var v = get("lme_vid");
    if (v) return v;
    v = Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
    set("lme_vid", v);
    return v;
  }

  // Ny "økt" hvis mer enn 30 minutter siden forrige aktivitet.
  function newVisit() {
    var t = Date.now();
    var last = parseInt(get("lme_vlast") || "0", 10) || 0;
    set("lme_vlast", String(t));
    return (t - last) > 30 * 60 * 1000;
  }

  // Kampanje: les UTM fra lenken, husk den for senere hendelser i økten.
  function campaign() {
    try {
      var q = new URLSearchParams(location.search);
      var c = q.get("utm_campaign") || q.get("utm_source");
      if (c) { set("lme_utm", c); return c; }
    } catch (e) {}
    return get("lme_utm") || "";
  }

  var id = vid();
  var path = (location.pathname || "/").replace(/\/+$/, "") || "/";
  var camp = campaign();

  function send(payload) {
    try {
      var body = JSON.stringify(payload);
      if (navigator.sendBeacon) {
        navigator.sendBeacon("/api/track", new Blob([body], { type: "application/json" }));
      } else {
        fetch("/api/track", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: body, keepalive: true, credentials: "omit",
        });
      }
    } catch (e) {}
  }

  // Sidevisning (+ ny økt + kampanje).
  send({ t: "pv", vid: id, path: path, visit: newVisit(), camp: camp });

  // Klikk: fanger opp kjøp/bli-med automatisk (Stripe-lenker, /medlemskap,
  // kasse) og alt merket data-track="…".
  document.addEventListener("click", function (ev) {
    var el = ev.target && ev.target.closest ? ev.target.closest("a,[data-track]") : null;
    if (!el) return;
    var name = el.getAttribute ? el.getAttribute("data-track") : null;
    if (!name) {
      var href = (el.getAttribute && el.getAttribute("href")) || "";
      if (/buy\.stripe\.com|checkout\.stripe\.com|\/medlemskap|\/kasse|\/checkout/.test(href)) {
        name = "checkout";
      }
    }
    if (!name) return;
    send({ t: "click", vid: id, path: path, name: name, camp: camp });
  }, true);
})();
