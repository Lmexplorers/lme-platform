/*
 * Tilgangsmerke på app- og verktøykort.
 *
 * Uten dette ser hvert kort på /apper likt ut, enten det er gratis eller
 * krever en plan. Den som er nysgjerrig, trykker seg inn, møter en vegg og
 * går igjen, uten å ha sett en pris eller en vei videre. Merket sier hva
 * kortet krever FØR man trykker, og gir en knapp til planene.
 *
 * Kortet ber om merket med ett attributt:
 *   data-lme-tilgang="plan"   krever et LME Autopilot-abonnement
 *   data-lme-tilgang="kjop"   følger med plan, eller kjøpes som app alene
 *   data-lme-tilgang="eier"   Renates eget verktøy, ikke en del av salget
 *   data-lme-tilgang="fri"    fritt for alle (får et rolig "Gratis"-merke)
 *
 * Merket LÅSER ingenting. Serveren bestemmer, akkurat som i js/lme-status.js,
 * og av samme grunn: flere verktøy kan åpnes på mer enn én måte, så en lås i
 * nettleseren ville stengt ute en ekte kjøper. Dette informerer bare.
 *
 * Eieren ser aldri en pris på sitt eget produkt.
 */
(function () {
  var KORT = "[data-lme-tilgang]";
  if (!document.querySelector(KORT)) return;

  function en() {
    if (window.LME_CURRENT_LANG === "en") return true;
    try { return localStorage.getItem("lme_lang") === "en"; } catch (e) { return false; }
  }
  function T(no, eng) { return en() ? eng : no; }

  /* Tekstene per tilgangstype, for hver av de tre situasjonene en besøkende
     kan være i: eier, medlem med aktiv plan, og alle andre. */
  var TEKST = {
    plan: {
      eier:   { no: "Din egen",     en: "Yours" },
      medlem: { no: "Med i planen", en: "In your plan" },
      utenfor: { no: "Krever plan",  en: "Needs a plan" },
    },
    kjop: {
      eier:   { no: "Din egen",     en: "Yours" },
      medlem: { no: "Med i planen", en: "In your plan" },
      utenfor: { no: "Plan eller kjøp", en: "Plan or purchase" },
    },
    eier: {
      eier:   { no: "Kun for deg",  en: "Only for you" },
      medlem: { no: "Kun for Renate", en: "Renate only" },
      utenfor: { no: "Kun for Renate", en: "Renate only" },
    },
    fri: {
      eier:   { no: "Gratis", en: "Free" },
      medlem: { no: "Gratis", en: "Free" },
      utenfor: { no: "Gratis", en: "Free" },
    },
  };

  var STIL = {
    plan:   "color:#b58a00;background:#FFF8E6;",
    kjop:   "color:#b58a00;background:#FFF8E6;",
    eier:   "color:#7a5e00;background:#FFF4D6;",
    fri:    "color:#5d8a12;background:#F3F8E8;",
  };

  function merkFor(kort, rolle) {
    var type = kort.getAttribute("data-lme-tilgang");
    var sett = TEKST[type];
    if (!sett) return;
    var ord = sett[rolle] || sett.utenfor;

    var gammelt = kort.querySelector("[data-lme-merke]");
    if (gammelt) gammelt.remove();

    var m = document.createElement("span");
    m.setAttribute("data-lme-merke", "1");
    m.setAttribute("data-no", ord.no);
    m.setAttribute("data-en", ord.en);
    m.textContent = T(ord.no, ord.en);
    m.style.cssText =
      "align-self:flex-start;margin-top:10px;font-size:11px;font-weight:700;letter-spacing:0.05em;" +
      "border-radius:999px;padding:3px 10px;font-family:inherit;" + (STIL[type] || STIL.fri);
    kort.appendChild(m);
  }

  /* Én linje øverst for den som ikke har plan, så veien til å kjøpe er
     synlig uten at man må trykke seg inn i et verktøy først. */
  function visLinje() {
    if (document.getElementById("lme-tilgangslinje")) return;
    var linje = document.createElement("div");
    linje.id = "lme-tilgangslinje";
    linje.style.cssText =
      "display:flex;align-items:center;justify-content:center;gap:14px;flex-wrap:wrap;" +
      "background:#FFF8E6;color:#7a5e00;font-family:'Sasson Montessori','Playpen Sans',system-ui,sans-serif;" +
      "font-size:14.5px;line-height:1.5;padding:12px 18px;text-align:center;";
    var t = document.createElement("span");
    t.setAttribute("data-no", "Noen av verktøyene følger med en plan. Resten er gratis for alle.");
    t.setAttribute("data-en", "Some of the tools come with a plan. The rest are free for everyone.");
    t.textContent = T(
      "Noen av verktøyene følger med en plan. Resten er gratis for alle.",
      "Some of the tools come with a plan. The rest are free for everyone."
    );
    linje.appendChild(t);
    var a = document.createElement("a");
    a.href = "/oppgrader";
    a.setAttribute("data-no", "Se planer og priser →");
    a.setAttribute("data-en", "See plans and prices →");
    a.textContent = T("Se planer og priser →", "See plans and prices →");
    a.style.cssText =
      "flex:0 0 auto;background:#E91E89;color:#fff;text-decoration:none;font-weight:800;" +
      "padding:9px 18px;border-radius:999px;font-size:13.5px;";
    linje.appendChild(a);
    document.body.insertBefore(linje, document.body.firstChild);
  }

  function tegn(rolle) {
    document.querySelectorAll(KORT).forEach(function (kort) { merkFor(kort, rolle); });
    if (rolle === "utenfor" && document.querySelector('[data-lme-tilgang="plan"],[data-lme-tilgang="kjop"]')) {
      visLinje();
    }
  }

  function rollen(a) {
    if (!a) return "utenfor";
    if (a.plan === "owner") return "eier";
    if (a.active) return "medlem";
    return "utenfor";
  }

  fetch("/api/access", { credentials: "same-origin" })
    .then(function (r) { return r.json(); })
    .then(function (a) {
      var rolle = rollen(a);
      tegn(rolle);
      // Språkbytte på siden skal også bytte merkene. Sidene sender
      // "lme-lang" når knappen trykkes, og oversetter selv alt som har
      // data-no/data-en, så vi trenger bare å tegne på nytt hvis en side
      // skulle mangle den runden.
      window.addEventListener("lme-lang", function () { tegn(rolle); });
    })
    .catch(function () { tegn("utenfor"); });
})();
