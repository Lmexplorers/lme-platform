/**
 * LME Autopilot som engangskjøp, én kilde for pris og navn.
 *
 * Leses av:
 *   - functions/api/vipps-pay.js  (prisen Vipps trekker, alltid på serveren)
 *   - autopilot-app.html          (prisen kunden ser, via /api/app-kjop)
 *   - functions/_lib/purchase-links.js (beløpet i APP_PAYMENT_LINKS)
 *
 * Skal prisen endres, endres den HER, og i Stripe. Det var to kopier av de
 * samme tallene som gjorde at Autopilot en periode solgte til 299, 499 og
 * 699 kr mens /oppgrader solgte de samme planene til 199, 549 og 999 kr.
 *
 * HVORFOR ET ENGANGSKJØP I DET HELE TATT
 * Et abonnement gir kvote på Renates nøkler, og koster henne penger hver
 * måned. Engangskjøpet gir ingen kvote: kunden legger inn sine egne
 * AI-nøkler, og betaler AI-en direkte for det hun lager. Derfor kan appen
 * selges én gang uten at Renate sitter igjen med en løpende regning for en
 * kunde som betalte for to år siden.
 */
export const APP_KJOP = {
  id: "autopilot",
  nok: 1490,
  navn: {
    no: "LME Autopilot, appen",
    en: "LME Autopilot, the app",
  },
  /* Betalingslenken for kort. Vipps går via /api/vipps-pay i stedet. */
  kjopLenke: "https://buy.stripe.com/8x29AUfsx73h51Xapp9R71w",
  /* Dette låses opp av kjøpet. Må stemme med det appen faktisk åpner,
     se lmeHarApp() i no.html og en.html i lme-content-studio. */
  inkluderer: {
    no: [
      "Hele appen låst opp, for godt, uten månedspris",
      "Reel-editoren, der du finpusser hvert klipp",
      "Autopublisering rett til Instagram, Facebook, TikTok og resten",
      "90-dagers innholdsplan i stedet for 30",
      "Alle oppdateringer som kommer senere",
    ],
    en: [
      "The whole app unlocked, for good, with no monthly price",
      "The reel editor, where you fine tune every clip",
      "Auto-publishing straight to Instagram, Facebook, TikTok and the rest",
      "A 90 day content plan instead of 30",
      "Every update that comes later",
    ],
  },
  /* Dette følger IKKE med, og det må stå like tydelig som det som gjør.
     Oppdager kunden det først etter kjøp, er det for sent. */
  ikkeInkludert: {
    no: "Ingen AI-kvote følger med. Du legger inn dine egne nøkler under Innstillinger, fra OpenAI eller Gemini til bilder, Claude til tekst, og Blotato til publisering. Da betaler du AI-en direkte for det du lager, og ingenting til meg hver måned.",
    en: "No AI quota is included. You add your own keys under Settings, from OpenAI or Gemini for images, Claude for text, and Blotato for publishing. You then pay the AI directly for what you make, and nothing to me every month.",
  },
};
