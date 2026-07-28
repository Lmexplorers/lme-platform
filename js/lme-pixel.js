/* =========================================================
   Meta Pixel for LME (Facebook/Instagram-annonser).

   Lastes KUN etter samtykke (se js/lme-consent.js). Sender
   standardhendelser til Meta så annonsene kan måles og optimaliseres:
     - PageView         (alle sider)
     - ViewContent      (butikk/produkt/oppskrift/kurs)
     - InitiateCheckout (trykk på kjøp: Stripe-lenker, /medlemskap, kasse)

   Kjøp (Purchase) kobles best server-side via Conversions API senere,
   siden selve betalingen fullføres hos Stripe.
   ========================================================= */
(function () {
  if (window.__lmePixelInit) return;
  window.__lmePixelInit = true;
  var PIXEL_ID = "1551311802669985";

  /* Metas standard base-kode. */
  !function (f, b, e, v, n, t, s) {
    if (f.fbq) return; n = f.fbq = function () { n.callMethod ?
      n.callMethod.apply(n, arguments) : n.queue.push(arguments); };
    if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = "2.0";
    n.queue = []; t = b.createElement(e); t.async = !0; t.src = v;
    s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s);
  }(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");

  try {
    fbq("init", PIXEL_ID);
    fbq("track", "PageView");

    var p = location.pathname || "/";
    if (/^\/(butikk|shop)(\/|$)/.test(p) || /(oppskrift|produkt|pattern|kurs)/.test(p)) {
      fbq("track", "ViewContent");
    }

    document.addEventListener("click", function (ev) {
      var a = ev.target && ev.target.closest ? ev.target.closest("a") : null;
      if (!a) return;
      var href = (a.getAttribute && a.getAttribute("href")) || "";
      if (/buy\.stripe\.com|checkout\.stripe\.com|\/medlemskap|\/kasse|\/checkout/.test(href)) {
        try { fbq("track", "InitiateCheckout"); } catch (e) {}
      }
    }, true);
  } catch (e) {}
})();
