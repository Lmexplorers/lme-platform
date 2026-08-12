/* =====================================================================
   LME — Salgstrakt for "Voks på YouTube med AI" · konfigurasjon
   ---------------------------------------------------------------------
   Samme mønster som funnel/claude-kurs, men uten mersalg-steg (Videre med
   YouTube selges som sitt eget kurs, se funnel/youtube-videre-kurs).

   Trakten har to steg:
     salg.html   → salgsside for "Voks på YouTube med AI" (pris + kjøp)
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
    no: { launch: "https://buy.stripe.com/5kQbJ24NTevJgKFgNN9R63l", full: "https://buy.stripe.com/4gMbJ26W13R5cup9ll9R63n" },
    en: { launch: "https://buy.stripe.com/4gMbJ2bchcnB0LHdBB9R63m", full: "https://buy.stripe.com/aFadRabchfzNdyt6999R63o" },
  };

  function priceFor(lang) {
    return launch
      ? { belop: 497, valuta: lang === "en" ? "$" : "kr", visningFor: lang === "en" ? "$150" : "1497 kr" }
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
      overskrift: "Voks på YouTube med AI",
      underoverskrift:
        "Et komplett norsk kurs i å bygge en YouTube-kanal uten å vise ansikt, med AI " +
        "som hjelper på manus, stemme og redigering. Du lærer det samme systemet " +
        "proffene bruker, tilpasset deg som vil skape, bli synlig og tjene penger.",

      hvaDuLaererTittel: "Hva du lærer i dette kurset",
      hvaDuLaerer: [
        "Hvordan du finner en lønnsom nisje før du lager en eneste video",
        "Å pakke video med titler og miniatyrbilder som faktisk får klikk",
        "Å lage manus med Claude, stemme med ElevenLabs og ferdige videoer med AI",
        "Hvordan du setter produksjonen i system, uten å gjøre alt selv",
        "Å tjene penger på kanalen: annonser, sponsing og egne produkter",
        "Ferdige oppskrifter du kan kopiere rett inn i Claude"
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
          tittel: "Ferdige oppskrifter",
          tekst:
            "Manus-, tittel- og miniatyrbilde-oppskrifter du kan kopiere rett inn i Claude."
        }
      ],

      forDegTittel: "Dette kurset er for deg hvis",
      forDeg: [
        "Du vil starte en YouTube-kanal, men vil ikke stå foran kamera",
        "Du har hørt at AI kan gjøre mye av jobben, men vet ikke hvor du skal begynne",
        "Du vil bygge noe som vokser over tid, ikke jage virale enkelttreff",
        "Du vil bruke tiden din klokt, med et tydelig system å følge",
        "Du drømmer om en ekstra inntekt fra noe du eier selv"
      ],

      ikkeForDegTittel: "Dette kurset er ikke for deg hvis",
      ikkeForDeg: [
        "Du vil stå foran kamera og vise ansiktet ditt",
        "Du leter etter en snarvei uten noe arbeid",
        "Du vil ha en ferdig kanal levert, ikke lære systemet selv"
      ],

      garanti: "",
      kjopKnapp: "Ja takk, gi meg YouTube-kurset",
      sosialtBevis: "Laget av Renate Dahl, som har bygget LME til en hel plattform.",
      // Ekte kundeuttalelse (valgfri). La "sitat" stå tomt til du har en du kan bruke.
      testimonial: { sitat: "", navn: "", sted: "" },
      bilde: "/images/banner_laer.webp"
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
        "Start med leksjon 1, og ta det i ditt eget tempo."
      ],
      knapp: "Åpne kurset",
      knappLenke: "/academy/youtube",
      bonusKnapp: "Last ned arbeidsboken (PDF)",
      bonusLenke: "/ressurser/print/youtube-kurs-arbeidsbok",
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
      overskrift: "Grow on YouTube with AI",
      underoverskrift:
        "A complete course in building a YouTube channel without ever showing your face, with AI " +
        "helping on script, voice and editing. You learn the same system the pros use, adapted " +
        "for you who want to create, get visible and earn money.",

      hvaDuLaererTittel: "What you'll learn in this course",
      hvaDuLaerer: [
        "How to find a profitable niche before you make a single video",
        "Packaging videos with titles and thumbnails that actually get clicks",
        "Writing scripts with Claude, voice with ElevenLabs and finished videos with AI",
        "How to systematize production, without doing everything yourself",
        "Making money from the channel: ads, sponsorships and your own products",
        "Ready-made recipes you can copy straight into Claude"
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
          tittel: "Ready-made recipes",
          tekst:
            "Script, title and thumbnail recipes you can copy straight into Claude."
        }
      ],

      forDegTittel: "This course is for you if",
      forDeg: [
        "You want to start a YouTube channel but don't want to be on camera",
        "You've heard AI can do a lot of the work, but don't know where to start",
        "You want to build something that grows over time, not chase viral one-offs",
        "You want to use your time wisely, with a clear system to follow",
        "You dream of extra income from something you own yourself"
      ],

      ikkeForDegTittel: "This course is not for you if",
      ikkeForDeg: [
        "You want to be on camera and show your face",
        "You're looking for a shortcut with no work",
        "You want a finished channel handed to you, not to learn the system yourself"
      ],

      garanti: "",
      kjopKnapp: "Yes please, give me the YouTube course",
      sosialtBevis: "Made by Renate Dahl, who has built LME into a full platform.",
      testimonial: { sitat: "", navn: "", sted: "" },
      bilde: "/images/banner_laer.webp"
    },

    takk: {
      merkelapp: "Purchase confirmed",
      overskrift: "Thank you, you're in! 🎉",
      underoverskrift:
        "So glad to have you. Check your inbox, your personal course link is on its way there.",
      steg: [
        "Check your inbox, your receipt and personal course link are on the way.",
        "Click the link in the email to open the course.",
        "Start with lesson 1, and take it at your own pace."
      ],
      knapp: "Open the course",
      knappLenke: "/academy/youtube",
      bonusKnapp: "Download the workbook (PDF)",
      bonusLenke: "/ressurser/print/youtube-kurs-arbeidsbok",
      sekundaerKnapp: "To classes",
      sekundaerLenke: "/academy",
      support: "Questions? Reply to the email you just got, and I'll help you."
    }
  }
};
})();
