/**
 * LME, én kilde for hva plattformen selger og hva det koster.
 *
 * ==========================================================================
 * HVORFOR DENNE FILEN FINNES
 * ==========================================================================
 * Nathalie AI oppga i lang tid prisene 299, 499 og 699 kr til hver eneste
 * besøkende på 51 sider. Det var de gamle prisene, skrevet rett inn i
 * systemprompten hennes, og de ble aldri oppdatert da planene ble endret.
 * Ingen merket det, fordi ingenting koblet prompten til det som faktisk lå
 * i Stripe.
 *
 * Derfor: prisene står her, ett sted. Nathalie leser dem herfra, og det
 * samme skal alt annet som nevner en pris gjøre. Skal en pris endres,
 * endres den her og i Stripe, ikke i sytten filer.
 *
 * Tallene er lest direkte fra Stripe 16. august 2026, og verifisert mot
 * hvilken pris hver levende betalingslenke faktisk peker på (ikke bare mot
 * hvilke priser som finnes, siden flere gamle priser fortsatt ligger
 * aktive ved siden av de nye).
 *
 * NÅR DU ENDRER EN PRIS: oppdater `PRICES_CHECKED` også, så alt som viser
 * tallene kan si ærlig hvor gamle de er.
 *
 * Autopilot-appen ligger i et eget repo (`lme-content-studio`) og har sin egen
 * kopi av de samme tallene i `lme-pricing.js`, siden den ikke kan importere
 * herfra. Endrer du en Autopilot-pris under, må den endres der også. Det var
 * nettopp den driften som gjorde at appen solgte til 299, 499 og 699 kr mens
 * /oppgrader solgte de samme planene til 199, 549 og 999 kr, rettet
 * 26. august 2026.
 */

/* Video følger IKKE med i noen Autopilot-plan. Bestemt av Renate
   26. august 2026: hun kan ikke kjøpe videogenerering for en hel
   kundemasse. Kunden bruker egen nøkkel eller kjøper videokreditt.
   Nevner du video som inkludert et sted, selger du noe appen nekter
   å levere, og det var akkurat den feilen som gjorde at planene lovet
   1, 6 og 15 videoer mens appen ga null. */

export const PRICES_CHECKED = "2026-08-16";

/**
 * Har planene en gratis prøveperiode.
 *
 * Systemprompten til Nathalie påsto "7 dagers gratis prøveperiode, ingen
 * binding". Jeg fant ingen prøveperiode på de levende betalingslenkene da
 * jeg sjekket, men jeg klarte heller ikke å lese alle lenkene, så jeg vil
 * ikke påstå noe skråsikkert. Står den til false, sier Nathalie ingenting
 * om prøveperiode i det hele tatt, som er tryggere enn å love noe som ikke
 * finnes. Sett den til true igjen når du har bekreftet den i Stripe.
 */
export const FREE_TRIAL_DAYS = 0;

/**
 * Abonnementene. `nok` og `usd` er hele kroner og dollar, ikke ører.
 * `stripePrice` er prisen den levende betalingslenken faktisk bruker,
 * tatt med så neste person kan sjekke uten å gjette.
 */
export const PLANS = [
  {
    id: "autopilot-start",
    navn: { no: "LME Autopilot Start", en: "LME Autopilot Start" },
    nok: 199, usd: 19, interval: "month",
    inkluderer: {
      no: "30 AI-bilder i måneden. Video med egen nøkkel eller kjøpt kreditt",
      en: "30 AI images a month. Video with your own key or bought credit",
    },
    stripePrice: { nok: "price_1TwdidLax7B8uQzqLLBmXBgg", usd: "price_1TwdieLax7B8uQzqvwjrelLk" },
  },
  {
    id: "autopilot-proff",
    navn: { no: "LME Autopilot Proff", en: "LME Autopilot Pro" },
    nok: 549, usd: 54, interval: "month",
    inkluderer: {
      no: "100 AI-bilder i måneden. Video med egen nøkkel eller kjøpt kreditt",
      en: "100 AI images a month. Video with your own key or bought credit",
    },
    stripePrice: { nok: "price_1Txax0Lax7B8uQzqF9BvHLl5", usd: "price_1Txax1Lax7B8uQzqqB6pkith" },
  },
  {
    id: "autopilot-vip",
    navn: { no: "LME Autopilot VIP", en: "LME Autopilot VIP" },
    nok: 999, usd: 99, interval: "month",
    inkluderer: {
      no: "250 AI-bilder i måneden. Video med egen nøkkel eller kjøpt kreditt",
      en: "250 AI images a month. Video with your own key or bought credit",
    },
    stripePrice: { nok: "price_1Txax3Lax7B8uQzqe6Ub3Eog", usd: "price_1Txax4Lax7B8uQzqxb8jpZ4k" },
  },
  {
    id: "autopilot-vip-arlig",
    navn: { no: "LME Autopilot VIP, årlig", en: "LME Autopilot VIP, yearly" },
    nok: 9990, usd: 990, interval: "year",
    inkluderer: {
      no: "samme som VIP, betalt for et helt år",
      en: "same as VIP, paid for a full year",
    },
    stripePrice: { nok: "price_1Txax6Lax7B8uQzqN4GCmOLm", usd: "price_1Txax7Lax7B8uQzqeu7VYPcu" },
  },
  {
    id: "videoflow",
    navn: { no: "LME VideoFlow", en: "LME VideoFlow" },
    nok: null, usd: 8, interval: "month",
    inkluderer: {
      no: "2000 kreditter i måneden til manus, bilder, stemmer og video",
      en: "2000 credits a month for scripts, images, voices and video",
    },
    // Ingen kronepris finnes, norske kunder betaler i dollar.
    stripePrice: { nok: null, usd: "price_1U44bSLax7B8uQzqahgfMCP4" },
  },
  {
    id: "bookly-enkel",
    navn: { no: "LME Bookly Enkel", en: "LME Bookly Simple" },
    nok: 299, usd: null, interval: "month",
    inkluderer: { no: "bokbyggeren", en: "the book builder" },
    stripePrice: { nok: "price_1TWwIOLax7B8uQzqrYMUF0cB", usd: null },
  },
  {
    id: "bookly-pro",
    navn: { no: "LME Bookly Pro", en: "LME Bookly Pro" },
    nok: 699, usd: null, interval: "month",
    inkluderer: { no: "bokbyggeren med alt", en: "the book builder with everything" },
    stripePrice: { nok: "price_1TWwIfLax7B8uQzqVsqCXMd7", usd: null },
  },
];

/**
 * Kursene som selges enkeltvis. Kurs med lanseringspris har to tall:
 * `nok` er prisen som gjelder nå, `nokFull` er prisen den går opp til.
 */
export const COURSES = [
  { id: "claude", navn: { no: "Kom i gang med Claude", en: "Get started with Claude" }, nok: 490, usd: 49 },
  { id: "claude-videre", navn: { no: "Videre med Claude", en: "Next Level with Claude" }, nok: 249, usd: 25 },
  { id: "youtube", navn: { no: "Voks på YouTube med AI", en: "Grow on YouTube with AI" }, nok: 497, usd: 50, nokFull: 1497, usdFull: 150 },
  { id: "youtube-videre", navn: { no: "Videre med YouTube", en: "Next Level with YouTube" }, nok: 497, usd: 50, nokFull: 1497, usdFull: 150 },
  { id: "ki-pedagoger", navn: { no: "KI for pedagoger", en: "AI for Educators" }, nok: 299, usd: 30, nokFull: 599, usdFull: 60 },
  { id: "epostliste", navn: { no: "Voks e-postlisten din", en: "Grow your email list" }, nok: 997, usd: 99, nokFull: 1497, usdFull: 150 },
  { id: "markedsforing-claude", navn: { no: "LME Markedsføring med Claude", en: "LME Marketing with Claude" }, nok: 399, usd: 40 },
  { id: "minikurs", navn: { no: "Lag ditt første digitale minikurs", en: "Create your first digital mini-course" }, nok: 699, usd: 70 },
  { id: "montessori-masterclass", navn: { no: "Montessori mesterklasse", en: "Montessori Masterclass" }, nok: 997, usd: 99 },
];

function prisTekst(p, lang) {
  const en = lang === "en";
  const deler = [];
  if (p.nok != null) deler.push(p.nok + " kr");
  if (p.usd != null) deler.push("$" + p.usd);
  if (!deler.length) return en ? "price not set" : "pris ikke satt";
  const pris = deler.join(" / ");
  if (!p.interval) return pris;
  const per = p.interval === "year"
    ? (en ? " a year" : " i året")
    : (en ? " a month" : " i måneden");
  return pris + per;
}

/**
 * Prislisten som ren tekst, til systemprompten til Nathalie AI og til alt
 * annet som skal fortelle noen hva ting koster. Tospråklig.
 */
export function priceBlock(lang) {
  const en = lang === "en";
  const linjer = [];

  linjer.push(en ? "SUBSCRIPTIONS (current prices):" : "ABONNEMENTER (gjeldende priser):");
  for (const p of PLANS) {
    linjer.push("- " + p.navn[en ? "en" : "no"] + ": " + prisTekst(p, lang) +
                ", " + p.inkluderer[en ? "en" : "no"]);
  }

  linjer.push("");
  linjer.push(en ? "COURSES SOLD SEPARATELY:" : "KURS SOM SELGES ENKELTVIS:");
  for (const k of COURSES) {
    let l = "- " + k.navn[en ? "en" : "no"] + ": " + k.nok + " kr / $" + k.usd;
    if (k.nokFull) {
      l += en
        ? " (launch price, goes up to " + k.nokFull + " kr / $" + k.usdFull + ")"
        : " (lanseringspris, går opp til " + k.nokFull + " kr / $" + k.usdFull + ")";
    }
    linjer.push(l);
  }

  linjer.push("");
  if (FREE_TRIAL_DAYS > 0) {
    linjer.push(en
      ? "There is a " + FREE_TRIAL_DAYS + "-day free trial, no lock-in."
      : "Det er " + FREE_TRIAL_DAYS + " dagers gratis prøveperiode, ingen binding.");
  }
  linjer.push(en
    ? "NEVER invent a price. If a price is not in this list, say you are not sure and point to lmexplorers.com/oppgrader or the shop."
    : "Finn aldri på en pris. Står den ikke i listen over, si at du ikke er sikker og vis til lmexplorers.com/oppgrader eller butikken.");

  return linjer.join("\n");
}
