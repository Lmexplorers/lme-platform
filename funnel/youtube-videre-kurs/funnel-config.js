/* =====================================================================
   LME — Salgstrakt for "Videre med YouTube" · konfigurasjon
   ---------------------------------------------------------------------
   Samme mønster som funnel/youtube-kurs. Solgt som sitt eget kurs, ikke
   som et mersalg rett etter kjøp av hovedkurset. Ingen gratis-periode,
   lanseringsprisen gjelder fra nå av.

   Pris bytter seg selv automatisk ved fristen (ingen manuell oppdatering
   nødvendig): lanseringspris frem til 1. september 2026, deretter full pris.
   ===================================================================== */

(function () {
  var FULL_FROM = Date.parse("2026-09-01T00:00:00+02:00");
  var launch = Date.now() < FULL_FROM;

  var LINKS = {
    no: { launch: "https://buy.stripe.com/aFaaEYbchdrFdyt0OP9R63p", full: "https://buy.stripe.com/14A5kE9492N17a5cxx9R63r" },
    en: { launch: "https://buy.stripe.com/eVq4gA80573h9id6999R63q", full: "https://buy.stripe.com/3cIcN6bchgDR51XgNN9R63s" },
  };

  function priceFor(lang) {
    return launch
      ? { belop: 497, valuta: lang === "en" ? "$" : "kr", visningFor: lang === "en" ? "$150" : "1497 kr" }
      : { belop: lang === "en" ? 150 : 1497, valuta: lang === "en" ? "$" : "kr", visningFor: "" };
  }
  function checkoutFor(lang) { return launch ? LINKS[lang].launch : LINKS[lang].full; }
  function merkelapp(lang) {
    if (launch) return lang === "en" ? "Launch offer" : "Lanseringstilbud";
    return lang === "en" ? "Full course" : "Fullt kurs";
  }

window.LME_FUNNEL = {

  no: {
    brand: { navn: "Little Montessori Explorers", kortnavn: "LME", logo: "/images/lme-logo.png" },

    salg: {
      checkoutUrl: checkoutFor("no"),
      etterKjop: "takk.html",
      pris: priceFor("no"),
      merkelapp: merkelapp("no"),
      overskrift: "Videre med YouTube",
      underoverskrift:
        "Fortsettelsen på YouTube-kurset. Nå bygger vi videre: les tallene, test og " +
        "forbedre, sett bort arbeidet, og skalér til flere kanaler og større inntekt.",

      hvaDuLaererTittel: "Hva du lærer i dette kurset",
      hvaDuLaerer: [
        "Å lese YouTube-tallene som faktisk betyr noe: klikkrate, seetid og seerbevaring",
        "Hvordan du tester og forbedrer titler og miniatyrbilder",
        "Å bygge et enkelt team og system, så du slipper å gjøre alt selv",
        "Hvordan du skalerer til flere kanaler uten å brenne ut",
        "Monetisering på nivå to: sponsing, egne produkter og salg av kanal",
        "Ferdige oppskrifter for analyse, testing og bortsetting"
      ],

      bonuserTittel: "Bonuser du får med",
      bonuser: [
        { tittel: "Analyse-sjekklisten", tekst: "Steg-for-steg sjekkliste for å lese egne YouTube-tall riktig." },
        { tittel: "Ferdige oppskrifter", tekst: "Klare prompter for testing, analyse og bortsetting av arbeid." }
      ],

      forDegTittel: "Dette kurset er for deg hvis",
      forDeg: [
        "Du har startet en kanal og vil ta den videre",
        "Du vil forstå tallene og ta valg på data, ikke bare magefølelse",
        "Du vil jobbe smartere med et system og litt hjelp",
        "Du drømmer om flere kanaler eller en større inntekt"
      ],

      ikkeForDegTittel: "Dette kurset er ikke for deg hvis",
      ikkeForDeg: [
        "Du har ikke startet en kanal ennå (start med «Voks på YouTube med AI» først)",
        "Du leter etter en snarvei uten noe arbeid",
        "Du vil ha alt gjort for deg, ikke lære systemet selv"
      ],

      garanti: "",
      kjopKnapp: "Ja takk, gi meg Videre med YouTube",
      sosialtBevis: "Laget av Renate Dahl, som har bygget LME til en hel plattform.",
      testimonial: { sitat: "", navn: "", sted: "" },
      bilde: "/images/banner_laer.webp"
    },

    takk: {
      merkelapp: "Kjøpet er bekreftet",
      overskrift: "Tusen takk, du er i gang! 🎉",
      underoverskrift: "Så gøy å ha deg med. Sjekk innboksen din, den personlige kurslenken din er på vei dit.",
      steg: [
        "Sjekk innboksen din, kvittering og din personlige kurslenke er på vei.",
        "Trykk på lenken i e-posten for å åpne kurset.",
        "Start med leksjon 1, og ta det i ditt eget tempo."
      ],
      knapp: "Åpne kurset",
      knappLenke: "/academy/youtube-videre",
      bonusKnapp: "",
      bonusLenke: "",
      sekundaerKnapp: "Til kurs",
      sekundaerLenke: "/academy",
      support: "Spørsmål? Svar på e-posten du nettopp fikk, så hjelper jeg deg."
    }
  },

  en: {
    brand: { navn: "Little Montessori Explorers", kortnavn: "LME", logo: "/images/lme-logo.png" },

    salg: {
      checkoutUrl: checkoutFor("en"),
      etterKjop: "takk.html",
      pris: priceFor("en"),
      merkelapp: merkelapp("en"),
      overskrift: "Next Level with YouTube",
      underoverskrift:
        "The continuation of the YouTube course. Now we build further: read the numbers, test and " +
        "improve, delegate the work, and scale to more channels and bigger income.",

      hvaDuLaererTittel: "What you'll learn in this course",
      hvaDuLaerer: [
        "Reading the YouTube numbers that actually matter: click-through rate, watch time and retention",
        "How to test and improve titles and thumbnails",
        "Building a simple team and system, so you don't have to do everything yourself",
        "How to scale to more channels without burning out",
        "Monetization level two: sponsorships, your own products and selling a channel",
        "Ready-made recipes for analysis, testing and delegating"
      ],

      bonuserTittel: "Bonuses included",
      bonuser: [
        { tittel: "The analytics checklist", tekst: "Step-by-step checklist for reading your own YouTube numbers correctly." },
        { tittel: "Ready-made recipes", tekst: "Ready prompts for testing, analysis and delegating work." }
      ],

      forDegTittel: "This course is for you if",
      forDeg: [
        "You've started a channel and want to take it further",
        "You want to understand the numbers and decide on data, not just gut feeling",
        "You want to work smarter with a system and a little help",
        "You dream of more channels or a bigger income"
      ],

      ikkeForDegTittel: "This course is not for you if",
      ikkeForDeg: [
        "You haven't started a channel yet (start with \"Grow on YouTube with AI\" first)",
        "You're looking for a shortcut with no work",
        "You want everything done for you, not to learn the system yourself"
      ],

      garanti: "",
      kjopKnapp: "Yes please, give me Next Level with YouTube",
      sosialtBevis: "Made by Renate Dahl, who has built LME into a full platform.",
      testimonial: { sitat: "", navn: "", sted: "" },
      bilde: "/images/banner_laer.webp"
    },

    takk: {
      merkelapp: "Purchase confirmed",
      overskrift: "Thank you, you're in! 🎉",
      underoverskrift: "So glad to have you. Check your inbox, your personal course link is on its way there.",
      steg: [
        "Check your inbox, your receipt and personal course link are on the way.",
        "Click the link in the email to open the course.",
        "Start with lesson 1, and take it at your own pace."
      ],
      knapp: "Open the course",
      knappLenke: "/academy/youtube-videre",
      bonusKnapp: "",
      bonusLenke: "",
      sekundaerKnapp: "To classes",
      sekundaerLenke: "/academy",
      support: "Questions? Reply to the email you just got, and I'll help you."
    }
  }
};
})();
