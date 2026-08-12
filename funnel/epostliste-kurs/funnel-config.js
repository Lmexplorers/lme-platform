/* =====================================================================
   LME — Salgstrakt for "Voks e-postlisten din" · konfigurasjon
   ---------------------------------------------------------------------
   Samme mønster som funnel/youtube-kurs, salg.html og takk.html er
   generiske og henter all tekst herfra.

   Trakten har to steg:
     salg.html   → salgsside for "Voks e-postlisten din" (pris + kjøp)
     takk.html   → takkeside med tilgang

   Flyt:
     salg → (Stripe-checkout) → takk → e-post med personlig kurslenke
     (webhooken, ikke denne siden, gir den faktiske tilgangen — se
     functions/api/oppskrift-webhook.js og _lib/course-access.js)

   Pris bytter seg selv automatisk ved fristen (ingen manuell oppdatering
   nødvendig): lanseringspris frem til 1. september 2026, deretter full pris.
   Selve betalingslenkene er faste Stripe-lenker, én per pris og valuta.
   ===================================================================== */

(function () {
  var FULL_FROM = Date.parse("2026-09-01T00:00:00+02:00");
  var launch = Date.now() < FULL_FROM;

  var LINKS = {
    no: { launch: "https://buy.stripe.com/aFabJ2805gDR7a54119R63B", full: "https://buy.stripe.com/6oU6oIfsxaft0LHgNN9R63C" },
    en: { launch: "https://buy.stripe.com/28E4gA1BHbjx8e97dd9R63D", full: "https://buy.stripe.com/7sYdRafsx4V99ideFF9R63E" },
  };

  function priceFor(lang) {
    return launch
      ? { belop: 997, valuta: lang === "en" ? "$" : "kr", visningFor: lang === "en" ? "$150" : "1497 kr" }
      : { belop: lang === "en" ? 150 : 1497, valuta: lang === "en" ? "$" : "kr", visningFor: "" };
  }
  function checkoutFor(lang) {
    return launch ? LINKS[lang].launch : LINKS[lang].full;
  }
  function merkelapp(lang) {
    if (launch) return lang === "en" ? "Launch offer" : "Lanseringstilbud";
    return lang === "en" ? "Full course" : "Fullt kurs";
  }

window.LME_FUNNEL = {

  no: {
    brand: {
      navn: "Little Montessori Explorers",
      kortnavn: "LME",
      logo: "/images/lme-logo.png"
    },

    /* ---- Salgsside ---- */
    salg: {
      checkoutUrl: checkoutFor("no"),
      etterKjop: "takk.html",

      pris: priceFor("no"),

      merkelapp: merkelapp("no"),
      overskrift: "Voks e-postlisten din",
      underoverskrift:
        "Et lite kurs om å bygge en lojal e-postliste med en lead magnet, en enkel " +
        "påmeldingsside og en velkomstserie som jobber for deg mens du sover. " +
        "E-postlisten er den eneste kanalen ingen algoritme kan ta fra deg.",

      hvaDuLaererTittel: "Hva du lærer i dette kurset",
      hvaDuLaerer: [
        "Hvorfor e-postlisten er den viktigste kanalen du eier",
        "Hva en lead magnet er, og hvordan du lager en folk faktisk vil ha",
        "Hvordan du setter opp en enkel påmeldingsside som konverterer",
        "Å sette opp systemet: e-postverktøy, samtykke og en testet kundereise",
        "Velkomstserien: fem e-poster som bygger tillit på autopilot",
        "Hvordan du deler lead magneten din uten å mase, og måler og forbedrer listen videre"
      ],

      bonuserTittel: "Bonuser du får med",
      bonuser: [
        {
          tittel: "Arbeidsboken",
          tekst:
            "Arbeidsboken som følger kurset, med refleksjon, sjekklister og ett " +
            "konkret steg per del."
        },
        {
          tittel: "Tekstmaler",
          tekst:
            "Ferdige tekstmaler for påmeldingssiden og hele velkomstserien, klare til å " +
            "tilpasse med din egen stemme."
        },
        {
          tittel: "Idébank",
          tekst:
            "En idébank med lead magnet-konsepter du kan gå rett i gang med."
        },
        {
          tittel: "Sjekkliste",
          tekst:
            "Sjekklisten som sikrer at hele kundereisen, fra gave til velkomstserie, faktisk fungerer."
        }
      ],

      forDegTittel: "Dette kurset er for deg hvis",
      forDeg: [
        "Du vil bygge en e-postliste, men vet ikke hvor du skal starte",
        "Du er lei av å være avhengig av algoritmer for å nå folk",
        "Du vil ha en enkel lead magnet og påmeldingsside som faktisk virker",
        "Du vil at en velkomstserie skal bygge tillit for deg, automatisk",
        "Du vil eie kanalen din selv, ikke leie den av Instagram eller Facebook"
      ],

      ikkeForDegTittel: "Dette kurset er ikke for deg hvis",
      ikkeForDeg: [
        "Du allerede har en fungerende e-postliste med lead magnet og velkomstserie",
        "Du leter etter en snarvei uten noe arbeid",
        "Du vil ha listen bygget for deg, ikke lære systemet selv"
      ],

      garanti: "",
      kjopKnapp: "Ja takk, gi meg kurset",
      sosialtBevis: "Laget av Renate Dahl, som har bygget LME til en hel plattform.",
      // Ekte kundeuttalelse (valgfri). La "sitat" stå tomt til du har en du kan bruke.
      testimonial: { sitat: "", navn: "", sted: "" },
      bilde: "/images/mia-teo-brev.webp"
    },

    /* ---- Takkeside med tilgang ---- */
    takk: {
      merkelapp: "Kjøpet er bekreftet",
      overskrift: "Tusen takk, du er i gang! 🎉",
      underoverskrift:
        "Så gøy å ha deg med. Sjekk innboksen din, den personlige kurslenken din er på vei dit.",
      steg: [
        "Sjekk innboksen din, kvittering og din personlige kurslenke er på vei.",
        "Trykk på lenken i e-posten for å åpne kurset.",
        "Start med modul 1, og ta det i ditt eget tempo."
      ],
      knapp: "Åpne kurset",
      knappLenke: "/academy/epostliste",
      bonusKnapp: "Last ned arbeidsboken (PDF)",
      bonusLenke: "/funnel/nedlasting/LME-Voks-epostlisten-arbeidsbok.pdf",
      sekundaerKnapp: "Til kurs",
      sekundaerLenke: "/academy",
      support: "Spørsmål? Svar på e-posten du nettopp fikk, så hjelper jeg deg."
    }
  },

  en: {
    brand: {
      navn: "Little Montessori Explorers",
      kortnavn: "LME",
      logo: "/images/lme-logo.png"
    },

    salg: {
      checkoutUrl: checkoutFor("en"),
      etterKjop: "takk.html",

      pris: priceFor("en"),

      merkelapp: merkelapp("en"),
      overskrift: "Grow your email list",
      underoverskrift:
        "A little course about building a loyal email list with a lead magnet, a simple " +
        "sign-up page and a welcome series that works for you while you sleep. Your email " +
        "list is the one channel no algorithm can take away from you.",

      hvaDuLaererTittel: "What you'll learn in this course",
      hvaDuLaerer: [
        "Why your email list is the most important channel you own",
        "What a lead magnet is, and how to make one people actually want",
        "How to set up a simple sign-up page that actually converts",
        "Setting up the system: email tool, consent, and a tested customer journey",
        "The welcome series: five emails that build trust on autopilot",
        "How to share your lead magnet without nagging, and measure and grow the list further"
      ],

      bonuserTittel: "Bonuses included",
      bonuser: [
        {
          tittel: "The workbook",
          tekst:
            "The workbook that follows the course, with reflection, checklists and one " +
            "concrete step per part."
        },
        {
          tittel: "Text templates",
          tekst:
            "Ready-made text templates for the sign-up page and the whole welcome series, " +
            "ready to adapt in your own voice."
        },
        {
          tittel: "Idea bank",
          tekst:
            "An idea bank with lead magnet concepts you can start on right away."
        },
        {
          tittel: "Checklist",
          tekst:
            "The checklist that makes sure the whole customer journey, from gift to welcome series, actually works."
        }
      ],

      forDegTittel: "This course is for you if",
      forDeg: [
        "You want to build an email list but don't know where to start",
        "You're tired of depending on algorithms to reach people",
        "You want a simple lead magnet and sign-up page that actually works",
        "You want a welcome series to build trust for you, automatically",
        "You want to own your channel yourself, not rent it from Instagram or Facebook"
      ],

      ikkeForDegTittel: "This course is not for you if",
      ikkeForDeg: [
        "You already have a working email list with a lead magnet and welcome series",
        "You're looking for a shortcut with no work",
        "You want the list built for you, not to learn the system yourself"
      ],

      garanti: "",
      kjopKnapp: "Yes please, give me the course",
      sosialtBevis: "Made by Renate Dahl, who has built LME into a full platform.",
      testimonial: { sitat: "", navn: "", sted: "" },
      bilde: "/images/mia-teo-brev.webp"
    },

    takk: {
      merkelapp: "Purchase confirmed",
      overskrift: "Thank you, you're in! 🎉",
      underoverskrift:
        "So glad to have you. Check your inbox, your personal course link is on its way there.",
      steg: [
        "Check your inbox, your receipt and personal course link are on the way.",
        "Click the link in the email to open the course.",
        "Start with module 1, and take it at your own pace."
      ],
      knapp: "Open the course",
      knappLenke: "/academy/epostliste",
      bonusKnapp: "Download the workbook (PDF)",
      bonusLenke: "/funnel/nedlasting/LME-Voks-epostlisten-arbeidsbok-EN.pdf",
      sekundaerKnapp: "To classes",
      sekundaerLenke: "/academy",
      support: "Questions? Reply to the email you just got, and I'll help you."
    }
  }
};
})();
