/**
 * LME, viser hva en generering koster.
 *
 * Skriv ett attributt i HTML-en:
 *
 *   <span data-lme-price="video-studio"></span>
 *
 * så fyller dette skriptet inn "1 video-kreditt (ca. 24 kr)", på riktig
 * språk. Nøklene står i functions/_lib/ai-core/prices.js (SHOWN).
 *
 * Vil du ha prisen inn i en setning, bruk en mal med {pris}:
 *
 *   data-lme-price-mal="Å lage videoen koster {pris}."
 *   data-lme-price-mal-en="Making the video costs {pris}."
 *
 * Hvorfor et attributt og ikke et tall skrevet inn på siden: prisene har
 * allerede vært skrevet inn for hånd én gang, i systemprompten til Nathalie,
 * og de ble aldri oppdatert da planene ble endret. Da sto det gamle priser
 * på 51 sider. Én kilde, mange sider.
 *
 * Bygger siden kort etter at den er lastet (som reel-app gjør), kall
 * window.lmePriceRefresh() etterpå, så fylles de nye feltene også.
 *
 * Feiler stille. Får den ikke tak i prisen, står feltet tomt i stedet for at
 * det står noe galt. En tom plass er bedre enn feil pris.
 */
(function () {
  var priser = null;

  function spraak() {
    try {
      if (localStorage.getItem("lme_lang") === "en") return "en";
    } catch (e) {}
    return document.documentElement.lang === "en" ? "en" : "no";
  }

  function tegn() {
    if (!priser) return;
    var lang = spraak();
    var felt = document.querySelectorAll("[data-lme-price]");
    for (var i = 0; i < felt.length; i++) {
      var el = felt[i];
      var p = priser[el.getAttribute("data-lme-price")];
      if (!p || !p.text) continue;
      var tekst = p.text[lang] || p.text.no;
      var mal = el.getAttribute("data-lme-price-mal-" + lang) ||
                el.getAttribute("data-lme-price-mal");
      el.textContent = mal ? mal.replace("{pris}", tekst) : tekst;
    }
  }

  window.lmePriceRefresh = tegn;

  fetch("/api/ai-core/prices", { credentials: "same-origin" })
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (j) {
      if (!j || !j.prices) return;
      priser = j.prices;
      tegn();
      // Sidene bytter språk uten å laste på nytt, så vi tegner om når de gjør det.
      window.addEventListener("lme-lang-changed", tegn);
    })
    .catch(function () { /* med vilje stille */ });
})();
