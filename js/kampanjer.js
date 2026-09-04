/* =====================================================================
   LME — kampanjekalender
   ---------------------------------------------------------------------
   Én kalender for alle salgssidene, i stedet for én dato gjemt i hver
   funnel-config. Renate bestemte 31. august 2026 at tilbudsprisen skal
   løpe sammenhengende fra nå til og med januar, med et nytt navn på
   tilbudet etter hvilken tid på året det er, og full pris fra
   1. februar 2027.

   Kalenderen bytter NAVNET på tilbudet, ikke selve prisen. Alle
   periodene under bruker den samme tilbudslenken i Stripe som
   lanseringsprisen bruker i dag, så det finnes ingen nye priser å
   opprette og ingenting som kan komme i utakt med Stripe. Skal en
   enkelt kampanje ha sin egen pris, må den prisen og lenken lages i
   Stripe først, og så legges inn i den funnelen det gjelder.

   Slik legger du inn en ny periode: sett den inn i PERIODER i riktig
   rekkefølge. Datoen er første dagen perioden gjelder, og perioden
   varer til neste periode starter. Norsk tid (+01:00 om vinteren,
   +02:00 om sommeren).

   Sidene bruker den slik, FØR funnel-config.js:
     <script src="/js/kampanjer.js"></script>
   og i konfigurasjonen:
     var k = window.LME_KAMPANJE.naa();
     if (k.tilbud) { ...tilbudspris... } else { ...full pris... }
   ===================================================================== */
(function () {
  var PERIODER = [
    {
      id: "lansering",
      fra: "2026-01-01T00:00:00+01:00",
      merkelapp: { no: "Lanseringstilbud", en: "Launch offer" },
    },
    {
      id: "host",
      fra: "2026-10-01T00:00:00+02:00",
      merkelapp: { no: "Høstkampanje", en: "Autumn campaign" },
    },
    {
      id: "halloween",
      fra: "2026-10-25T00:00:00+01:00",
      merkelapp: { no: "Halloweentilbud", en: "Halloween offer" },
    },
    {
      // Etter Halloween er det høst igjen, helt til Thanksgiving-uken.
      id: "host-2",
      fra: "2026-11-02T00:00:00+01:00",
      merkelapp: { no: "Høstkampanje", en: "Autumn campaign" },
    },
    {
      // Thanksgiving faller på 26. november 2026, Black Friday 27. og
      // Cyber Monday 30. Én periode dekker hele uken.
      id: "thanksgiving",
      fra: "2026-11-23T00:00:00+01:00",
      merkelapp: { no: "Thanksgiving-tilbud", en: "Thanksgiving offer" },
      rabatt: "blackfriday",
    },
    {
      id: "jul",
      fra: "2026-12-01T00:00:00+01:00",
      merkelapp: { no: "Juletilbud", en: "Christmas offer" },
      rabatt: "jul",
    },
    {
      // Renate har bursdag 4. januar, og vil ha bursdagstilbud hele
      // måneden, ikke bare den ene dagen.
      id: "bursdag",
      fra: "2027-01-01T00:00:00+01:00",
      merkelapp: { no: "Bursdagstilbud", en: "Birthday offer" },
    },
    {
      // Full pris. Siste periode i lista, og den eneste uten tilbud.
      id: "full",
      fra: "2027-02-01T00:00:00+01:00",
      tilbud: false,
      merkelapp: { no: "Fullt kurs", en: "Full course" },
    },
  ];

  function naa(tid) {
    var t = typeof tid === "number" ? tid : Date.now();
    var valgt = PERIODER[0];
    for (var i = 0; i < PERIODER.length; i++) {
      if (t >= Date.parse(PERIODER[i].fra)) valgt = PERIODER[i];
    }
    return {
      id: valgt.id,
      tilbud: valgt.tilbud !== false,
      merkelapp: valgt.merkelapp,
      rabatt: valgt.rabatt || null,
    };
  }

  /* Slår opp den ekte rabatten for perioden vi er i nå, hvis den har en.
     `tabell` er kampanjetabellen i den enkelte funnelen, på formen
       { blackfriday: { no: { url, belop }, en: { url, belop } }, jul: {...} }
     Finnes ingen rabatt for perioden, eller mangler språket i tabellen,
     returneres null, og funnelen bruker den vanlige tilbudsprisen sin.
     Da kan en funnel legges til i kalenderen uten å ha egne rabattlenker. */
  function rabattFor(tabell, sprak, tid) {
    var k = naa(tid);
    if (!k.rabatt || !tabell) return null;
    var r = tabell[k.rabatt];
    if (!r) return null;
    return r[sprak === "en" ? "en" : "no"] || null;
  }

  window.LME_KAMPANJE = { naa: naa, rabattFor: rabattFor, perioder: PERIODER };
})();
