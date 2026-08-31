/**
 * LME Studio Tjenester, én kilde for hva pakkene inneholder og hva de koster.
 *
 * Denne filen leses BÅDE av salgssiden (/tjenester, som modul i nettleseren)
 * og av forespørselsendepunktet på serveren
 * (functions/api/tjeneste-foresporsel.js, som sender kvitteringen).
 * Derfor står prisene bare her. Det var nettopp prisdrift i to kopier som
 * gjorde at Autopilot solgte til 299, 499 og 699 kr mens /oppgrader solgte
 * de samme planene til 199, 549 og 999 kr, se functions/_lib/plans.js.
 *
 * Skal en pris endres: endre den her, og bare her.
 *
 * MERK: pakkene betales ikke på siden. Kunden sender en forespørsel, og
 * Renate sender betalingslenke eller faktura selv. Da kan hun justere pris
 * per oppdrag, og ingen betalingslenke opprettes uten at hun har sett den.
 */

export const PRISER_SJEKKET = "2026-08-31";

/* `kjopLenke` er den levende Stripe-betalingslenken for pakken, opprettet
   31. august 2026 i live-modus. Den er også registrert i
   functions/_lib/purchase-links.js (TJENESTE_PAYMENT_LINKS), slik at
   webhooken kjenner igjen kjøpet, legger ordren i Renates panel på
   /tjenester og varsler henne. Legger du til en ny pakke, må BEGGE stedene
   oppdateres, ellers blir noe betalt uten at noen får beskjed. */

/* Prisene er "gjort for deg"-arbeid, altså Renates tid, ikke abonnement.
   Et eventuelt LME Autopilot-abonnement kommer i tillegg, se AUTOPILOT_NOTE. */
export const PAKKER = [
  {
    id: "effekt",
    emoji: "🎬",
    nok: 1490,
    kjopLenke: "https://buy.stripe.com/28EfZia8dgDR6612WX9R71t",
    navn: { no: "Effektpakken", en: "The Effects Package" },
    undertittel: {
      no: "Videoene dine, ferdig med effekter",
      en: "Your videos, finished with effects",
    },
    forHvem: {
      no: "Du har klippene liggende, men ikke tid eller tålmodighet til redigeringen.",
      en: "You already have the clips, but not the time or patience for the editing.",
    },
    levering: {
      no: "Levert innen tre virkedager",
      en: "Delivered within three working days",
    },
    inkluderer: {
      no: [
        "Tre videoer, opptil ett minutt hver",
        "Effekter, overganger og teksting",
        "Musikk og lyd som passer uttrykket ditt",
        "Ferdig i riktig format til Instagram, TikTok og YouTube",
        "En runde med endringer, så du får det slik du vil ha det",
      ],
      en: [
        "Three videos, up to one minute each",
        "Effects, transitions and captions",
        "Music and sound that fits your expression",
        "Delivered in the right format for Instagram, TikTok and YouTube",
        "One round of changes, so you get it the way you want it",
      ],
    },
  },
  {
    id: "karakter",
    emoji: "✨",
    nok: 3900,
    kjopLenke: "https://buy.stripe.com/5kQ28s0xD87l3XTdBB9R71u",
    populaer: true,
    navn: { no: "AI-karakteren din", en: "Your AI Character" },
    undertittel: {
      no: "Ditt eget ansikt utad, som aldri blir sykt",
      en: "Your own face outwards, one that never calls in sick",
    },
    forHvem: {
      no: "Du vil ha gjenkjennelig innhold uten å stå foran kameraet hver dag.",
      en: "You want recognisable content without standing in front of the camera every day.",
    },
    levering: {
      no: "Levert innen sju virkedager",
      en: "Delivered within seven working days",
    },
    inkluderer: {
      no: [
        "En egen AI-karakter, satt opp med utseende, uttrykk og stemme",
        "Ti ferdige klipp med henne, klare til å legges ut",
        "Karakteren lagret i LME Autopilot, så hun ser lik ut hver gang",
        "Oppskriften, så du kan lage flere klipp selv etterpå",
        "Videokreditten for de ti klippene, den er med i prisen",
        "En runde med endringer på karakteren",
      ],
      en: [
        "Your own AI character, set up with look, expression and voice",
        "Ten finished clips with her, ready to post",
        "The character saved in LME Autopilot, so she looks the same every time",
        "The recipe, so you can make more clips yourself afterwards",
        "The video credit for those ten clips, included in the price",
        "One round of changes to the character",
      ],
    },
  },
  {
    id: "autopilot",
    emoji: "🚀",
    nok: 7900,
    kjopLenke: "https://buy.stripe.com/eVqeVe6W1evJ661eFF9R71v",
    navn: { no: "Innhold på autopilot", en: "Content on Autopilot" },
    undertittel: {
      no: "En hel måned med innhold, satt opp for deg",
      en: "A full month of content, set up for you",
    },
    forHvem: {
      no: "Du vil være synlig hver dag, men vil ikke bruke kveldene på det.",
      en: "You want to be visible every day, without spending your evenings on it.",
    },
    levering: {
      no: "Levert innen ti virkedager",
      en: "Delivered within ten working days",
    },
    inkluderer: {
      no: [
        "LME Autopilot satt opp og koblet til kontoene dine",
        "Innholdsplan for tretti dager, bygget på det du faktisk selger",
        "Tjue ferdige innlegg og reels, lagt i kø og klare til publisering",
        "Din tone og dine farger lagt inn, så alt ser ut som deg",
        "En time på video med meg, der jeg viser deg hvordan du kjører det videre selv",
        "Alt settes opp på din egen konto, så innholdet er ditt fra første dag",
      ],
      en: [
        "LME Autopilot set up and connected to your accounts",
        "A thirty day content plan, built on what you actually sell",
        "Twenty finished posts and reels, queued and ready to publish",
        "Your tone and your colours applied, so everything looks like you",
        "One hour on video with me, showing you how to run it yourself from there",
        "Everything is set up on your own account, so the content is yours from day one",
      ],
    },
  },
];

/* Noe annet enn pakkene. Står som eget kort på siden, uten pris, fordi
   prisen settes per oppdrag. */
export const SKREDDERSYDD = {
  id: "annet",
  emoji: "💬",
  navn: { no: "Noe helt annet", en: "Something else entirely" },
  undertittel: {
    no: "Fortell meg hva du trenger, så sier jeg hva det koster",
    en: "Tell me what you need, and I will tell you what it costs",
  },
  tekst: {
    no: "Passer ingen av pakkene, beskriver du oppdraget i skjemaet under, så får du et fast pristilbud tilbake før noe settes i gang.",
    en: "If none of the packages fit, describe the job in the form below, and you get a fixed price quote back before anything starts.",
  },
};

/* Abonnementet er ikke det samme som jobben. Dette må stå tydelig på siden,
   ellers tror kunden at appen følger med i pakkeprisen. Tallene er de samme
   som i functions/_lib/plans.js. */
export const AUTOPILOT_NOTE = {
  no: "LME Autopilot er appen som lager innholdet videre etterpå, og koster 199 kr, 549 kr eller 999 kr i måneden avhengig av hvor mye du lager. Abonnementet kommer i tillegg til pakkeprisen, og du kan si det opp når du vil.",
  en: "LME Autopilot is the app that keeps making the content afterwards, and costs 199, 549 or 999 kr a month depending on how much you make. The subscription comes in addition to the package price, and you can cancel it whenever you want.",
};

/* Bilder følger med i planen, video gjør det ikke. Dette er det folk
   misforstår, og misforstår de det etter kjøp, er det for sent. Tallene
   er de samme som i functions/_lib/plans.js og på /kjop-kreditt. */
export const KREDITT_NOTE = {
  no: "Om bilder og video: AI-bildene følger med i Autopilot-planen, 30, 100 eller 250 i måneden alt etter nivå. Video følger ikke med i noen plan, og kjøpes som videokreditt fra 99 kr for tre videoer. Det gjelder etter at pakken min er levert, når du lager innhold på egen hånd.",
  en: "About images and video: the AI images are included in the Autopilot plan, 30, 100 or 250 a month depending on the level. Video is not included in any plan, and is bought as video credit from 99 kr for three videos. This applies after my package is delivered, when you make content on your own.",
};

export function pakkeMedId(id) {
  if (id === SKREDDERSYDD.id) return SKREDDERSYDD;
  for (let i = 0; i < PAKKER.length; i++) {
    if (PAKKER[i].id === id) return PAKKER[i];
  }
  return null;
}
