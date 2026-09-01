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
      "Autopublisering til Instagram og Facebook, koblet til på ett minutt",
      "90-dagers innholdsplan i stedet for 30",
      "Alle oppdateringer som kommer senere",
    ],
    en: [
      "The whole app unlocked, for good, with no monthly price",
      "The reel editor, where you fine tune every clip",
      "Auto-publishing to Instagram and Facebook, connected in a minute",
      "A 90 day content plan instead of 30",
      "Every update that comes later",
    ],
  },
  /* Dette følger IKKE med, og det må stå like tydelig som det som gjør.
     Oppdager kunden det først etter kjøp, er det for sent. */
  ikkeInkludert: {
    no: "Ingen AI-kvote følger med. Du legger inn dine egne nøkler under Innstillinger, fra OpenAI eller Gemini til bilder, og Claude til tekst. Da betaler du AI-en direkte for det du lager, og ingenting til meg hver måned. Autopubliseringen til Instagram og Facebook er inkludert, og går gjennom LME. Du kobler til kontoene dine én gang på lmexplorers.com/planlegger, og det koster deg ingenting ekstra. Vil du i tillegg poste til TikTok, trenger du en egen Blotato-konto med betalt plan, men det er et tillegg, ikke noe appen står og faller på. Alle stegene, med lenker: lmexplorers.com/autopilot-nokler",
    en: "No AI quota is included. You add your own keys under Settings, from OpenAI or Gemini for images, and Claude for text. You then pay the AI directly for what you make, and nothing to me every month. Auto-publishing to Instagram and Facebook is included, and runs through LME. You connect your accounts once at lmexplorers.com/planlegger, at no extra cost. To also post to TikTok you need your own Blotato account on a paid plan, but that is an extra, not something the app depends on. Every step, with links: lmexplorers.com/autopilot-nokler",
  },
};
