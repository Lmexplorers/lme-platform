/**
 * LME Strikk & Hekle som engangskjøp, én kilde for pris og navn.
 *
 * Leses av:
 *   - functions/api/vipps-pay.js      (beløpet Vipps trekker, alltid på serveren)
 *   - functions/api/strikk-kjop.js    (prisen kunden ser på /strikk-app)
 *   - functions/_lib/purchase-links.js (beløpet i STRIKK_PAYMENT_LINKS)
 *
 * Endres en pris, endres den i TRINN under OG i Stripe. Autopilot solgte en
 * periode til tre forskjellige priser fordi tallet lå to steder, og det skal
 * ikke gjenta seg her.
 *
 * HVORFOR ET ENGANGSKJØP
 * Appen regner på kundens egen strikkefasthet i hennes egen nettleser. Den
 * bruker verken AI-kvote eller lagring hos meg, så en kunde koster ingenting
 * etter salget. Derfor kan den selges én gang, uten månedspris.
 *
 * HVORDAN TILGANGEN VIRKER
 * Kunden trenger ingen konto. Ved kjøp lages en personlig lenke med et
 * token (?t=...), den sendes på e-post og lagres i nettleseren hennes
 * første gang hun bruker den. Det er den samme låsen kursene bruker, se
 * js/course-gate.js og functions/_lib/course-access.js, med "strikk" som id.
 */
export const STRIKK_ID = "strikk";

/* Lanseringsprisen gjelder ut september 2026, så går den til fastpris av seg
   selv. Datoen står her, ikke i hodet til Renate: ingen skal måtte huske å
   skru den av 1. oktober. Tidspunktet er midnatt norsk sommertid. */
export const LANSERING_SLUTT = Date.parse("2026-10-01T00:00:00+02:00");

/* De to trinnene, hver med sin egen betalingslenke i Stripe. Begge lenkene
   er aktive samtidig, og siden velger den som gjelder. Endres et beløp her,
   må det endres i Stripe også, ellers betaler kunden noe annet enn det siden
   lover. Bestemt av Renate 5. september 2026. */
export const TRINN = {
  lansering: {
    nok: 199,
    kjopLenke: "https://buy.stripe.com/fZuaEYdkp87l6617dd9R71F",
  },
  fast: {
    nok: 299,
    kjopLenke: "https://buy.stripe.com/00waEY4NT1IX6619ll9R71E",
  },
};

/**
 * Prisen som gjelder nå. Leses av salgssiden, av kortknappen og av Vipps, så
 * de tre aldri kan komme i utakt.
 *   -> { trinn, nok, kjopLenke, gjelderTil, ordinaer }
 */
export function gjeldendeTilbud(na) {
  const tid = na ? new Date(na).getTime() : Date.now();
  if (tid < LANSERING_SLUTT) {
    return {
      trinn: "lansering",
      nok: TRINN.lansering.nok,
      kjopLenke: TRINN.lansering.kjopLenke,
      gjelderTil: new Date(LANSERING_SLUTT).toISOString(),
      ordinaer: TRINN.fast.nok,
    };
  }
  return {
    trinn: "fast",
    nok: TRINN.fast.nok,
    kjopLenke: TRINN.fast.kjopLenke,
    gjelderTil: null,
    ordinaer: TRINN.fast.nok,
  };
}

export const STRIKK_KJOP = {
  id: STRIKK_ID,
  /* Standardprisen. Det kunden faktisk betaler i dag kommer fra
     gjeldendeTilbud() over, som tar hensyn til lanseringsprisen. */
  nok: TRINN.fast.nok,
  kjopLenke: TRINN.fast.kjopLenke,
  navn: {
    no: "LME Strikk & Hekle, appen",
    en: "LME Knit & Crochet, the app",
  },
  kort: {
    no: "Regn ut økning, felling, masker, rader og garnmengde. Til strikking og hekling.",
    en: "Work out increases, decreases, stitches, rows and yarn amounts. For knitting and crochet.",
  },
  inkluderer: {
    no: [
      "Øk og fell jevnt over en lengde, med hvilke rader det skjer på",
      "Fell av i trinn, til ermehull, halsutringning og skulderskråning",
      "Fordel økninger og fellinger jevnt på én rad",
      "Masker og rader fra målene på plagget, med mønsterrapport",
      "Omregning når oppskriften har en annen strikkefasthet enn deg",
      "Garnmengde fra veid prøvelapp, og raskt anslag i garnbutikken",
      "Bytte av garn, regnet om i meter og nøster",
      "Hekling: flat sirkel runde for runde, ruter til teppe, startkjede",
      "Tellere som sier fra når det er rad for å øke eller felle",
      "Ordliste norsk, amerikansk og britisk, og tabell over garntykkelser",
      "Alt på norsk og engelsk, og alle oppdateringer som kommer senere",
    ],
    en: [
      "Increase and decrease evenly over a length, with the rows it happens on",
      "Bind off in steps, for armholes, necklines and shoulder slopes",
      "Spread increases and decreases evenly across one row",
      "Stitches and rows from the measurements of the garment, with pattern repeat",
      "Conversion when the pattern has a different gauge than you",
      "Yarn amount from a weighed swatch, and a quick estimate in the yarn shop",
      "Swapping yarn, converted into metres and balls",
      "Crochet: flat circle round by round, squares for a blanket, starting chain",
      "Counters that tell you when it is time to increase or decrease",
      "Glossary in Norwegian, American and British terms, and a yarn weight table",
      "Everything in Norwegian and English, and every update that comes later",
    ],
  },
  /* Dette følger ikke med, og skal stå like tydelig som det som gjør. */
  ikkeInkludert: {
    no: "Appen regner, den strikker ikke for deg. Den inneholder ingen oppskrifter og ingen ferdige plagg, den gir deg tallene til det du selv skal lage. Alle utregningene bygger på strikkefastheten din, så du må strikke en prøvelapp først. Uten den blir tallene et anslag, ikke en fasit.",
    en: "The app does the maths, it does not knit for you. It contains no patterns and no finished garments, it gives you the numbers for what you are making yourself. Every calculation builds on your gauge, so you need to make a swatch first. Without one the numbers are an estimate, not a fact.",
  },
};
