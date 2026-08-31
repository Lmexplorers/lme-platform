/* =====================================================================
   LME — Salgstrakt for "KI for pedagoger" · konfigurasjon
   ---------------------------------------------------------------------
   Samme mønster som funnel/youtube-kurs. Lanseringspris 299 kr/$30,
   ingen fast dato for prisøkning ennå (kan gå til 599 kr/$60 senere,
   si ifra når det skal skje så setter jeg opp samme automatiske
   dato-bytte som YouTube-kursene).
   ===================================================================== */

/* Kampanjekalenderen i /js/kampanjer.js gir merkelappen på salgssiden
   (Høstkampanje, Halloweentilbud, Juletilbud, Bursdagstilbud og så videre).
   Prisen er urørt, bare navnet på tilbudet følger årstiden. Utenfor
   kampanjeperioden, og hvis kalenderen ikke laster, står den faste
   merkelappen under. */
function lmeMerke(fast, sprak) {
  var k = window.LME_KAMPANJE && window.LME_KAMPANJE.naa();
  if (!k || !k.tilbud) return fast;
  return sprak === "en" ? k.merkelapp.en : k.merkelapp.no;
}

/* Ekte rabatt i Black Friday-uken og i julen. Egne priser og egne
   Stripe-lenker, opprettet 31. august 2026 og sjekket mot Stripe.
   Utenfor de to periodene gjelder den vanlige tilbudsprisen under. */
var LME_RABATTER = {
  blackfriday: {
    no: { url: "https://buy.stripe.com/fZudRa5RXbjx3XTapp9R71b", belop: 179 },
    en: { url: "https://buy.stripe.com/8x24gAdkp0ETdyt1ST9R71c", belop: 18 },
  },
  jul: {
    no: { url: "https://buy.stripe.com/9B6bJ24NT9bp51Xbtt9R71n", belop: 224 },
    en: { url: "https://buy.stripe.com/cNifZidkpgDReCxbtt9R71o", belop: 22 },
  },
};
function lmeRabatt(sprak) {
  return (window.LME_KAMPANJE && window.LME_KAMPANJE.rabattFor)
    ? window.LME_KAMPANJE.rabattFor(LME_RABATTER, sprak)
    : null;
}
function lmeLenke(fast, sprak) { var r = lmeRabatt(sprak); return r ? r.url : fast; }
function lmeBelop(fast, sprak) { var r = lmeRabatt(sprak); return r ? r.belop : fast; }

window.LME_FUNNEL = {

  no: {
    brand: { navn: "Little Montessori Explorers", kortnavn: "LME", logo: "/images/lme-logo.png" },

    salg: {
      checkoutUrl: lmeLenke("https://buy.stripe.com/4gM5kEgwBgDR9id0OP9R63t", "no"),
      etterKjop: "takk.html",

      pris: { belop: lmeBelop(299, "no"), valuta: "kr", visningFor: "599 kr" },

      merkelapp: lmeMerke("Lanseringstilbud", "no"),
      overskrift: "KI for pedagoger",
      underoverskrift:
        "En rolig og praktisk innføring i KI-verktøyene alle snakker om, laget for " +
        "deg som jobber med barn. Du lærer hva verktøyene gjør, hvordan du spør, og " +
        "hvordan du bruker dem trygt i hverdagen.",

      hvaDuLaererTittel: "Hva du lærer i dette kurset",
      hvaDuLaerer: [
        "Hva KI er, og hva det betyr for deg som pedagog",
        "Hvordan du stiller spørsmål som gir gode svar",
        "De viktigste verktøyene: ChatGPT, Claude, Gemini, bildeverktøy, Copilot og Perplexity",
        "En enkel arbeidsflyt for ukeplaner, foreldrebrev og materiell",
        "Trygg og etisk bruk, med barnas personvern først",
        "Canva, automatisering og din egen KI-hjelper",
        "En fire ukers plan for å komme godt i gang"
      ],

      bonuserTittel: "Bonuser du får med",
      bonuser: [
        { tittel: "Firekukers-planen", tekst: "En konkret, rolig plan for å komme godt i gang, uke for uke." },
        { tittel: "Ferdige oppskrifter", tekst: "Klare prompter for ukeplaner, foreldrebrev og materiell." }
      ],

      forDegTittel: "Dette kurset er for deg hvis",
      forDeg: [
        "Du har hørt om KI, men aner ikke hvor du skal begynne",
        "Du jobber med barn og vil bruke KI trygt og klokt",
        "Du vil bruke mindre tid på det praktiske og mer tid på barna",
        "Du vil ha en enkel arbeidsflyt du kan bruke fra dag én"
      ],

      ikkeForDegTittel: "Dette kurset er ikke for deg hvis",
      ikkeForDeg: [
        "Du vil ha et tungt teknisk kurs med koding",
        "Du er alt en erfaren KI-bruker og leter etter avansert innhold",
        "Du vil helst gjøre alt manuelt og ikke bruke KI i det hele tatt"
      ],

      garanti: "",
      kjopKnapp: "Ja takk, gi meg KI for pedagoger",
      sosialtBevis: "Laget av Renate Dahl, høgskoleutdannet montessoripedagog.",
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
      knappLenke: "/academy/ki-for-pedagoger",
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
      checkoutUrl: lmeLenke("https://buy.stripe.com/5kQ9AU8051IX2TPbtt9R63u", "en"),
      etterKjop: "takk.html",

      pris: { belop: lmeBelop(30, "en"), valuta: "$", visningFor: "$60" },

      merkelapp: lmeMerke("Launch offer", "en"),
      overskrift: "AI for Educators",
      underoverskrift:
        "A calm, practical introduction to the AI tools everyone's talking about, made for " +
        "you who works with children. You learn what the tools do, how to ask, and " +
        "how to use them safely in everyday life.",

      hvaDuLaererTittel: "What you'll learn in this course",
      hvaDuLaerer: [
        "What AI is, and what it means for you as an educator",
        "How to ask questions that get good answers",
        "The most important tools: ChatGPT, Claude, Gemini, image tools, Copilot and Perplexity",
        "A simple workflow for weekly plans, parent letters and materials",
        "Safe and ethical use, with children's privacy first",
        "Canva, automation and your own AI helper",
        "A four-week plan to get off to a good start"
      ],

      bonuserTittel: "Bonuses included",
      bonuser: [
        { tittel: "The four-week plan", tekst: "A concrete, calm plan to get started well, week by week." },
        { tittel: "Ready-made recipes", tekst: "Ready prompts for weekly plans, parent letters and materials." }
      ],

      forDegTittel: "This course is for you if",
      forDeg: [
        "You've heard of AI but have no idea where to start",
        "You work with children and want to use AI safely and wisely",
        "You want to spend less time on the practical and more time with the children",
        "You want a simple workflow you can use from day one"
      ],

      ikkeForDegTittel: "This course is not for you if",
      ikkeForDeg: [
        "You want a heavy technical course with coding",
        "You're already an experienced AI user looking for advanced content",
        "You'd rather do everything manually and not use AI at all"
      ],

      garanti: "",
      kjopKnapp: "Yes please, give me AI for Educators",
      sosialtBevis: "Made by Renate Dahl, college-educated Montessori teacher.",
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
      knappLenke: "/academy/ki-for-pedagoger",
      bonusKnapp: "",
      bonusLenke: "",
      sekundaerKnapp: "To classes",
      sekundaerLenke: "/academy",
      support: "Questions? Reply to the email you just got, and I'll help you."
    }
  }
};
