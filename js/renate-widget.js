/* Gammelt navn på Nathalie-widgeten, beholdt som en bro.
   ==========================================================================
   Filen het renate-widget.js til 1. september 2026. Alle sider henter nå
   /js/nathalie-widget.js i stedet. Denne ligger igjen fordi en side som er
   mellomlagret på en telefon fortsatt kan spørre etter det gamle navnet, og
   da skal chatteknappen dukke opp som før i stedet for å forsvinne.

   Den laster bare den nye filen. Widgeten passer selv på å ikke starte to
   ganger (window.__lmeRenateWidget), så det gjør ingen skade om begge
   adressene skulle bli hentet på den samme siden.

   Kan slettes når ingen mellomlagrede sider peker hit lenger. */
(function () {
  'use strict';
  if (window.__lmeRenateWidget) return;
  if (document.querySelector('script[src*="nathalie-widget.js"]')) return;
  var s = document.createElement('script');
  s.src = '/js/nathalie-widget.js?v=1';
  s.defer = true;
  document.head.appendChild(s);
})();
