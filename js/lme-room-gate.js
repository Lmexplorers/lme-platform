/* ============================================================
   LME romlås — Inner Circle-rommene er bare for betalende
   medlemmer (og eier). Alle andre sendes til salgssiden, slik
   at ingen kommer inn i fellesrommet før de har betalt.

   Kjøres FØRST i <head> (blokkerende), så innholdet skjules før
   det rekker å vises. Har du tilgang, vises siden. Har du ikke,
   sendes du til /medlemskap uten at rommet blinker frem.

   Tilgangen avgjøres av /api/group/<id>/access, samme kilde som
   selve rommet bruker, så eier alltid regnes som innenfor.
   ============================================================ */
(function () {
  var SALES = "/medlemskap";

  // Skjul alt umiddelbart, så rommet ikke glimter frem for uvedkommende.
  try { document.documentElement.style.visibility = "hidden"; } catch (e) {}
  function reveal() { try { document.documentElement.style.visibility = ""; } catch (e) {} }
  function deny() { try { location.replace(SALES); } catch (e) { location.href = SALES; } }

  // Rom-id: bruk global om satt, ellers utled fra adressen (/grupper/<id>).
  var id = window.LME_GROUP_ID ||
    ((location.pathname.match(/grupper\/([^\/?#]+)/) || [])[1]) ||
    "inner-circle";

  var done = false;
  var ctrl; try { ctrl = new AbortController(); } catch (e) {}
  // Henger nettverket, feiler vi lukket (til salgssiden), aldri åpent.
  var timer = setTimeout(function () {
    if (done) return; done = true;
    if (ctrl) { try { ctrl.abort(); } catch (e) {} }
    deny();
  }, 8000);

  fetch("/api/group/" + encodeURIComponent(id) + "/access", {
    credentials: "same-origin",
    signal: ctrl && ctrl.signal,
  })
    .then(function (r) { return r.json(); })
    .then(function (d) {
      if (done) return; done = true; clearTimeout(timer);
      if (d && (d.owner || d.member)) reveal();
      else deny();
    })
    .catch(function () {
      if (done) return; done = true; clearTimeout(timer);
      deny();
    });
})();
