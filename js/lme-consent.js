/* =========================================================
   LME samtykke for tredjeparts-måling (Meta Pixel).

   Førstepart-analysen (js/lme-track.js) er anonym og kjører uansett.
   Denne boksen gjelder KUN Facebook-pixelen, som deler data med Meta.
   Personvern: pixelen lastes bare hvis brukeren sier "Godta".
   Valget huskes i nettleseren.
   ========================================================= */
(function () {
  var KEY = "lme_consent"; // "yes" | "no"
  var LS = null; try { LS = window.localStorage; } catch (e) { LS = null; }
  function get() { try { return LS ? LS.getItem(KEY) : null; } catch (e) { return null; } }
  function set(v) { try { if (LS) LS.setItem(KEY, v); } catch (e) {} }
  function en() { return window.LME_CURRENT_LANG === "en"; }

  function loadPixel() {
    if (window.__lmePixelLoaded) return;
    window.__lmePixelLoaded = true;
    var s = document.createElement("script");
    s.src = "/js/lme-pixel.js?v=1"; s.defer = true;
    (document.head || document.documentElement).appendChild(s);
  }

  function banner() {
    if (document.getElementById("lme-consent")) return;
    var txt = en()
      ? "I use cookies to measure visits and improve LME, and to see how my ads perform. Anonymous stats always run; the Facebook pixel only if you accept."
      : "Jeg bruker informasjonskapsler for å måle besøk og forbedre LME, og for å se hvordan annonsene virker. Anonym statistikk går alltid; Facebook-pixelen kun hvis du sier ja.";
    // Skjul de flytende knappene nederst (Spør Nathalie AI, Gjør synlig) mens
    // boksen vises, så de ikke dekker Godta/Avvis på mobil. Språkbryteren
    // ligger øverst (se js/mobile-nav.js) og skal IKKE skjules her: uten den
    // kan en engelsktalende besøkende verken lese samtykketeksten på engelsk
    // eller resten av siden, før de har tatt et valg de ikke forstår.
    if (!document.getElementById("lme-consent-style")) {
      var st = document.createElement("style");
      st.id = "lme-consent-style";
      st.textContent = "html.lme-consent-open .rw-root,html.lme-consent-open .rw-btn," +
        "html.lme-consent-open .lme-vis-fab{display:none !important;}";
      (document.head || document.documentElement).appendChild(st);
    }
    var w = document.createElement("div");
    w.id = "lme-consent";
    w.style.cssText = "position:fixed;left:16px;right:16px;bottom:16px;z-index:2147483600;max-width:560px;margin:0 auto;background:#fff;border:1px solid #f0d9e4;border-radius:16px;box-shadow:0 12px 40px rgba(233,30,137,.16);padding:16px 18px;font-family:var(--font-body,system-ui,sans-serif);color:#5a4750;font-size:14px;line-height:1.5";
    w.innerHTML =
      '<div style="margin-bottom:12px">' + txt + "</div>" +
      '<div style="display:flex;gap:10px;justify-content:flex-end;flex-wrap:wrap">' +
      '<button id="lme-consent-no" style="border:1px solid #e6d3dc;background:#fff;color:#5a4750;font-weight:700;border-radius:999px;padding:9px 18px;cursor:pointer;font-family:inherit">' + (en() ? "Decline" : "Avvis") + "</button>" +
      '<button id="lme-consent-yes" style="border:none;background:linear-gradient(120deg,#E91E89,#ff5fb0);color:#fff;font-weight:800;border-radius:999px;padding:9px 20px;cursor:pointer;font-family:inherit">' + (en() ? "Accept" : "Godta") + "</button>" +
      "</div>";
    document.body.appendChild(w);
    document.documentElement.classList.add("lme-consent-open");
    function close() { w.remove(); document.documentElement.classList.remove("lme-consent-open"); }
    document.getElementById("lme-consent-yes").addEventListener("click", function () { set("yes"); close(); loadPixel(); });
    document.getElementById("lme-consent-no").addEventListener("click", function () { set("no"); close(); });
  }

  var c = get();
  if (c === "yes") { loadPixel(); }
  else if (c === "no") { /* respekter nei, gjør ingenting */ }
  else {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", banner);
    else banner();
  }
})();
