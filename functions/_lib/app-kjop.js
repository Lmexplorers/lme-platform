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
      "Autopublisering til Instagram, Facebook, TikTok og resten, med egen Blotato-konto (fra 29 dollar i måneden hos dem)",
      "90-dagers innholdsplan i stedet for 30",
      "Alle oppdateringer som kommer senere",
    ],
    en: [
      "The whole app unlocked, for good, with no monthly price",
      "The reel editor, where you fine tune every clip",
      "Auto-publishing to Instagram, Facebook, TikTok and the rest, with your own Blotato account (from 29 dollars a month with them)",
      "A 90 day content plan instead of 30",
      "Every update that comes later",
    ],
  },
  /* Dette følger IKKE med, og det må stå like tydelig som det som gjør.
     Oppdager kunden det først etter kjøp, er det for sent.

     Blotato-prisen (29 dollar i måneden for Starter) er bekreftet av Renate
     1. september 2026, i hennes egen konto hos dem. Endrer Blotato prisen,
     må tallet endres her, i kvitteringen (app-kjop-mail.js), i veiledningen
     (autopilot-nokler.html) og på grunneleggersiden. Lenken til deres egen
     prisside står ved siden av alle stedene, så kunden ser gjeldende pris
     selv om vårt tall skulle bli gammelt. */
  ikkeInkludert: {
    no: "Ingen AI-kvote følger med. Du legger inn dine egne nøkler under Innstillinger, fra OpenAI eller Gemini til bilder, og Claude til tekst. Da betaler du AI-en direkte for det du lager, og ingenting til meg hver måned. For at appen skal legge ut for deg, trenger du i tillegg en egen Blotato-konto med betalt plan. Det er den som gir appen lov til å poste til Instagram, Facebook og TikTok. Den rimeligste planen heter Starter og koster 29 dollar i måneden, altså rundt 300 kroner avhengig av dollarkursen. Gratisversjonen og prøveperioden har alt annet, men ikke API-tilgangen, og det er den appen bruker. Gjeldende priser: blotato.com/pricing. Uten den koblingen publiserer ikke appen, og da er den ikke lenger en autopilot. Alle stegene, med lenker: lmexplorers.com/autopilot-nokler",
    en: "No AI quota is included. You add your own keys under Settings, from OpenAI or Gemini for images, and Claude for text. You then pay the AI directly for what you make, and nothing to me every month. For the app to post for you, you also need your own Blotato account on a paid plan. That is what lets the app post to Instagram, Facebook and TikTok. Their cheapest plan is called Starter and costs 29 dollars a month. The free version and the trial have everything else, but not the API access, and that is what the app uses. Current prices: blotato.com/pricing. Without that connection the app does not publish, and then it is no longer an autopilot. Every step, with links: lmexplorers.com/autopilot-nokler",
  },
};
