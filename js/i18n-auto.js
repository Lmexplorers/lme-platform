/**
 * LME — automatisk oversetting ved visning ("nivå 2").
 *
 * De faste sidene oversetter til engelsk med ordlista window.LME_TRANSLATIONS.
 * Dette skriptet fyller hullene automatisk:
 *   1) Henter sidens huskede overlay (/api/page-i18n GET) og slår den inn i
 *      ordlista, så tidligere oversatte hull vises med en gang for ALLE.
 *   2) Når siden vises på engelsk og det fortsatt er norsk tekst uten
 *      oversettelse, sendes den til serveren (/api/page-i18n POST), som
 *      oversetter, husker og returnerer. Bare innloggede medlemmer utløser ny
 *      oversetting; alle andre nyter godt av det huskede.
 *
 * Skriptet rører ikke den innebygde logikken; det kobler seg bare på
 * window.lmeToggleLang og window.LME_TRANSLATIONS. Feiler alt stille.
 */
(function () {
  if (window.__lmeAutoI18n) return;
  window.__lmeAutoI18n = true;

  var PATH = location.pathname.replace(/\.html$/, "").replace(/\/+$/, "");
  if (PATH === "") PATH = "/index";

  function looksNorwegian(t) {
    if (!t || t.length < 2) return false;
    if (!/[A-Za-zÆØÅæøå]/.test(t)) return false;            // må ha bokstaver
    if (/^[\s\d.,:;!?·•★☆♡♥→←↗↘↑↓%&+\/()\-–—'"]+$/.test(t)) return false; // bare symbol/tall
    if (/[æøåÆØÅ]/.test(t)) return true;
    return /\b(og|du|deg|din|ditt|dine|ikke|det|den|som|på|har|kan|med|til|for|å|vi|er|en|et|de|hva|hvordan|skal|vil|når|hvor|vår|våre|laget|uten|eller|mer|alle|sammen|barn|barnet|hjem|hjemme|nytt|her|oss|dette|disse|over|under|etter|før|gjør|bli|blir|ble|må|får|fått)\b/i.test(t);
  }

  function reapplyEnglish() {
    // Re-kjør engelsk-passet med oppdatert ordliste, uten å bytte språk.
    try {
      if (window.LME_CURRENT_LANG === "en" && typeof window.lmeToggleLang === "function") {
        window.LME_CURRENT_LANG = "no";
        window.lmeToggleLang(); // tilbake til 'en', nå med nye nøkler
      }
    } catch (e) {}
  }

  function collectMissing() {
    var miss = {};
    try {
      if (window.LME_ORIGINALS && window.LME_ORIGINALS.forEach) {
        window.LME_ORIGINALS.forEach(function (original) {
          var t = (original || "").trim();
          if (t && !window.LME_TRANSLATIONS[t] && looksNorwegian(t)) miss[t] = 1;
        });
      }
      (window.LME_ATTR_ORIGINALS || []).forEach(function (rec) {
        var v = (rec[2] || "").trim();
        if (v && !window.LME_TRANSLATIONS[v] && looksNorwegian(v)) miss[v] = 1;
      });
    } catch (e) {}
    return Object.keys(miss);
  }

  var filling = false;
  function fillGaps() {
    if (filling) return;
    var texts = collectMissing();
    if (!texts.length) return;
    filling = true;
    fetch("/api/page-i18n", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: PATH, texts: texts.slice(0, 40) }),
    })
      .then(function (r) { return r.json(); })
      .then(function (d) {
        filling = false;
        if (!d || !d.dict) return;
        var added = false;
        for (var k in d.dict) {
          var v = d.dict[k];
          if (typeof v === "string" && v && v !== k && !window.LME_TRANSLATIONS[k]) {
            window.LME_TRANSLATIONS[k] = v; added = true;
          }
        }
        if (added) reapplyEnglish();
      })
      .catch(function () { filling = false; });
  }

  function start() {
    // 1) Hent og slå inn sidens huskede overlay.
    fetch("/api/page-i18n?id=" + encodeURIComponent(PATH))
      .then(function (r) { return r.json(); })
      .then(function (d) {
        if (d && d.dict) {
          var added = false;
          for (var k in d.dict) {
            if (d.dict[k] && !window.LME_TRANSLATIONS[k]) { window.LME_TRANSLATIONS[k] = d.dict[k]; added = true; }
          }
          if (added) reapplyEnglish();
        }
      })
      .catch(function () {})
      .then(function () {
        // 2) Hvis vi allerede er på engelsk: fyll gjenværende hull.
        if (window.LME_CURRENT_LANG === "en") setTimeout(fillGaps, 300);
      });

    // 3) Koble på språkbyttet: fyll hull hver gang vi går til engelsk.
    if (typeof window.lmeToggleLang === "function" && !window.lmeToggleLang.__lmeWrapped) {
      var orig = window.lmeToggleLang;
      var wrapped = function () {
        orig.apply(this, arguments);
        if (window.LME_CURRENT_LANG === "en") setTimeout(fillGaps, 50);
      };
      wrapped.__lmeWrapped = true;
      window.lmeToggleLang = wrapped;
    }
  }

  // Vent til den innebygde oversetter-mekanikken finnes.
  var tries = 0;
  var timer = setInterval(function () {
    tries++;
    if (window.LME_TRANSLATIONS && typeof window.lmeToggleLang === "function" && window.LME_ORIGINALS) {
      clearInterval(timer);
      // La den innebygde init() (som kan auto-bytte til engelsk) få kjøre først.
      setTimeout(start, 350);
    } else if (tries > 60) {
      clearInterval(timer);
    }
  }, 100);
})();
