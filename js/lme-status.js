/*
 * Vennlig statuslinje øverst på verktøyene, i stedet for et grensesnitt som
 * ser åpent ut og så feiler når man trykker.
 *
 * Den LÅSER ingenting. Serveren er den som bestemmer, og den gjør jobben sin
 * fra før. Grunnen til at dette bare informerer, er at flere av verktøyene kan
 * åpnes på mer enn én måte: Video Studio slipper for eksempel inn både Pro, VIP
 * og den som har kjøpt appen alene. En hard lås i nettleseren ville stengt ute
 * en ekte kjøper som betalte for appen uten å ha abonnement. Da er det bedre å
 * si tydelig fra hva verktøyet koster, og la serveren avgjøre resten.
 *
 * Siden ber om linja ved å sette, FØR dette skriptet lastes:
 *   window.LME_STATUS = {
 *     krever: "medlem",              // "medlem" | "eier"
 *     tekst:   "…",                  // hva som kreves, på norsk
 *     tekstEn: "…",
 *     url:     "/oppgrader",         // hvor man går for å få tilgang
 *   };
 */
(function () {
  var cfg = window.LME_STATUS;
  if (!cfg) return;

  function en() { return (window.LME_CURRENT_LANG === "en") || (localStorage.getItem("lme_lang") === "en"); }
  function T(no, eng) { return en() ? (eng || no) : no; }

  function vis(melding, knappTekst, knappUrl) {
    if (document.getElementById("lme-status")) return;
    var bar = document.createElement("div");
    bar.id = "lme-status";
    bar.style.cssText =
      "position:relative;z-index:60;display:flex;align-items:center;justify-content:center;gap:14px;flex-wrap:wrap;" +
      "background:#FFF4D6;color:#7a5e00;font-family:'Sasson Montessori','Playpen Sans',system-ui,sans-serif;" +
      "font-size:14.5px;line-height:1.5;padding:12px 18px;text-align:center;";
    var t = document.createElement("span");
    t.textContent = melding;
    bar.appendChild(t);
    if (knappUrl) {
      var a = document.createElement("a");
      a.href = knappUrl;
      a.textContent = knappTekst;
      a.style.cssText =
        "flex:0 0 auto;background:#E91E89;color:#fff;text-decoration:none;font-weight:800;" +
        "padding:9px 18px;border-radius:999px;font-size:13.5px;";
      bar.appendChild(a);
    }
    document.body.insertBefore(bar, document.body.firstChild);
  }

  fetch("/api/access", { credentials: "same-origin" })
    .then(function (r) { return r.json(); })
    .then(function (a) {
      if (!a) return;
      if (a.plan === "owner") return;                       // Renate ser aldri linja

      if (cfg.krever === "eier") {
        vis(T("Dette er Renates eget verktøy, og er ikke en del av medlemskapet.",
              "This is Renate's own tool, and is not part of the membership."),
            T("Se hva du får som medlem", "See what you get as a member"),
            cfg.url || "/community");
        return;
      }

      if (!a.loggedIn) {
        vis(T(cfg.tekst || "Dette verktøyet er for medlemmer.", cfg.tekstEn || "This tool is for members."),
            T("Logg inn", "Log in"), "/login");
        return;
      }
      if (!a.active) {
        vis(T(cfg.tekst || "Dette verktøyet krever en plan.", cfg.tekstEn || "This tool requires a plan."),
            T("Se planene", "See the plans"), cfg.url || "/oppgrader");
      }
    })
    .catch(function () { /* stille: en statuslinje skal aldri stå i veien */ });
})();
