/* =====================================================================
   Byggeøkt: Bygg din egen app med AI, live · salgstrakt (norsk + engelsk)
   ---------------------------------------------------------------------
   Trakten har tre steg:
     salg.html              → salgsside med pris, dato og plasser  (/byggeokt)
     takk.html              → takkeside etter kjøp                 (/byggeokt-takk)
     /byggeokt-deltaker     → deltakersiden, låst til de som har kjøpt

   Datoen står ETT sted, i OKT under, og brukes av begge sidene og av
   nedtellingen. Endres tidspunktet, endres det her.

   Prisen bytter seg selv: tidligpris til og med 14. september 2026,
   deretter full pris. Betalingslenkene er faste Stripe-lenker, én per pris
   og valuta, og betalingslenke-ID-ene (plink_…) ligger i
   COURSE_PAYMENT_LINKS i functions/_lib/purchase-links.js med courseId
   "byggeokt". Det er de som gjør at kjøperen får deltakerlenken sin på
   e-post, og workshopen på kjøpet.

   Plassene telles ekte: hvert kjøp øker telleren i
   functions/api/byggeokt-plasser.js, og salgssiden viser hvor mange som er
   igjen. Er det fullt, forsvinner kjøpsknappen.
   ===================================================================== */

(function () {
  // Tidspunktet for økten. Norsk tid, sommertid (+02:00) den 24. september.
  var OKT = {
    start: "2026-09-24T20:00:00+02:00",
    varighet: "3 timer",
    plasser: 20,
    // Tidligprisen varer til og med denne datoen.
    tidligprisTil: "2026-09-14T23:59:59+02:00",
  };

  var tidlig = Date.now() <= Date.parse(OKT.tidligprisTil);

  var LENKER = {
    no: {
      tidlig: "https://buy.stripe.com/14A9AUbchevJfGB4119R71A",
      full: "https://buy.stripe.com/3cIdRa9492N19ideFF9R71B",
    },
    en: {
      tidlig: "https://buy.stripe.com/3cI7sMgwB9bpdyt6999R71C",
      full: "https://buy.stripe.com/bJe7sMbch87l2TP2WX9R71D",
    },
  };

  function pris(lang) {
    return tidlig
      ? { belop: lang === "en" ? 99 : 990, valuta: lang === "en" ? "$" : "kr", visningFor: lang === "en" ? "$199" : "1990 kr" }
      : { belop: lang === "en" ? 199 : 1990, valuta: lang === "en" ? "$" : "kr", visningFor: "" };
  }
  function kasse(lang) { return tidlig ? LENKER[lang].tidlig : LENKER[lang].full; }
  function merkelapp(lang) {
    if (tidlig) return lang === "en" ? "Early bird" : "Tidligpris";
    return lang === "en" ? "Live build session" : "Live byggeøkt";
  }

window.LME_OKT = OKT;

window.LME_FUNNEL = {

  /* =================================================================
     NORSK
     ================================================================= */
  no: {
    brand: {
      navn: "Little Montessori Explorers",
      kortnavn: "LME",
      logo: "/images/lme-logo.png"
    },

    salg: {
      checkoutUrl: kasse("no"),
      etterKjop: "takk.html",

      pris: pris("no"),

      merkelapp: merkelapp("no"),
      overskrift: "Bygg din egen app med AI, live",
      underoverskrift:
        "Torsdag 24. september kl. 20.00, tre timer sammen. Du kommer med en idé, " +
        "og går fra økten med en app som er publisert og har sin egen lenke. Jeg deler " +
        "skjerm og bygger sammen med deg, steg for steg. 20 plasser.",

      fakta: "24. september kl. 20.00 · 3 timer · 20 plasser · opptak følger med",

      hvaDuFaarTittel: "Slik er kvelden satt opp",
      deler: [
        {
          ikon: "🧭",
          tittel: "20.00 Klargjøring og idé",
          kort: "Vi setter opp verktøyet, og du velger appen din: quiz, generator, planlegger eller din egen idé."
        },
        {
          ikon: "⚡",
          tittel: "20.40 Første versjon på skjermen",
          kort: "Du beskriver hva appen skal gjøre, og ser den bli til. Dette er timen der det løsner."
        },
        {
          ikon: "🎨",
          tittel: "21.20 Gjør den til din",
          kort: "Farger, tekst, logo, norsk og engelsk. Fra noe som virker til noe som er ditt."
        },
        {
          ikon: "🚀",
          tittel: "22.10 Ut i verden",
          kort: "Publisert, med egen adresse du kan dele, og koblet til e-postliste eller betaling."
        },
        {
          ikon: "🛟",
          tittel: "22.40 Når noe knekker",
          kort: "Hva du skriver når det stopper opp, så du kommer videre på egen hånd etterpå."
        }
      ],

      hvaDuLaererTittel: "Dette får du med",
      hvaDuLaerer: [
        "Tre timer live med meg, der du bygger mens jeg bygger",
        "Din egen app, publisert med sin egen lenke før du logger av",
        "Workshopen \"Ansett dine fem AI-assistenter\", 21 leksjoner, som forberedelse",
        "Opptak av hele økten, så du kan bygge videre i eget tempo",
        "Ferdige beskrivelser du kan gjenbruke til neste app",
        "En plass i et lite rom, ikke et webinar med tusen personer"
      ],

      forDegTittel: "Dette er for deg hvis",
      forDeg: [
        "Du har en idé du aldri har fått laget, fordi du ikke koder",
        "Du har prøvd AI til tekst, og lurer på hva mer som er mulig",
        "Du vil ha noe ferdig samme kveld, ikke et prosjekt som drar ut",
        "Du lærer best når noen bygger sammen med deg",
        "Du vil kunne lage det neste selv, uten å spørre noen"
      ],

      ikkeForDegTittel: "Dette er ikke for deg hvis",
      ikkeForDeg: [
        "Du vil at noen andre skal bygge appen for deg",
        "Du vil se på, og ikke gjøre noe selv underveis",
        "Du kan ikke være med live, og vil ikke se opptaket heller"
      ],

      trengerTittel: "Dette trenger du",
      trenger: [
        "En PC eller Mac med nettleser, det holder, ingenting skal installeres",
        "En konto hos Claude",
        "En idé, eller lyst til å velge en av mine tre"
      ],

      garanti: "",
      kjopKnapp: "Ja takk, jeg vil ha en plass",
      utsolgtKnapp: "Alle plassene er tatt",
      sosialtBevis:
        "Laget av Renate Dahl, som har bygget hele LME-plattformen på denne måten, uten å skrive kode selv.",
      testimonial: { sitat: "", navn: "", sted: "" },
      bilde: ""
    },

    takk: {
      merkelapp: "Plassen er din",
      overskrift: "Takk, vi sees 24. september",
      underoverskrift:
        "Deltakerlenken din ligger i innboksen, sammen med workshopen du får på kjøpet. " +
        "Sjekk søppelposten hvis du ikke ser den etter noen minutter.",
      steg: [
        "Åpne e-posten fra meg og trykk på lenken til deltakersiden",
        "Legg kvelden inn i kalenderen, knappen ligger på deltakersiden",
        "Ta workshopen som følger med, den gjør deg klar til å bygge",
        "Ha en idé i hodet når vi starter, eller velg en av mine tre"
      ],
      knapp: "Åpne deltakersiden",
      knappLenke: "/byggeokt-deltaker",
      sekundaerKnapp: "Til LME Studio",
      sekundaerLenke: "/academy",
      support: "Noe som ikke stemmer? Svar på e-posten, så ordner jeg det."
    }
  },

  /* =================================================================
     ENGELSK
     ================================================================= */
  en: {
    brand: {
      navn: "Little Montessori Explorers",
      kortnavn: "LME",
      logo: "/images/lme-logo.png"
    },

    salg: {
      checkoutUrl: kasse("en"),
      etterKjop: "takk.html",

      pris: pris("en"),

      merkelapp: merkelapp("en"),
      overskrift: "Build your own app with AI, live",
      underoverskrift:
        "Thursday 24 September at 20:00 Norwegian time, three hours together. You arrive " +
        "with an idea, and leave with an app that is published and has its own link. I share " +
        "my screen and build alongside you, step by step. 20 seats.",

      fakta: "24 September at 20:00 CEST · 3 hours · 20 seats · recording included",

      hvaDuFaarTittel: "How the evening is set up",
      deler: [
        {
          ikon: "🧭",
          tittel: "20:00 Setup and idea",
          kort: "We set up the tool, and you choose your app: a quiz, a generator, a planner, or your own idea."
        },
        {
          ikon: "⚡",
          tittel: "20:40 First version on screen",
          kort: "You describe what the app should do, and watch it appear. This is the hour where it clicks."
        },
        {
          ikon: "🎨",
          tittel: "21:20 Make it yours",
          kort: "Colours, text, logo, English and Norwegian. From something that works to something that is yours."
        },
        {
          ikon: "🚀",
          tittel: "22:10 Out into the world",
          kort: "Published, with its own address you can share, and connected to your email list or payment."
        },
        {
          ikon: "🛟",
          tittel: "22:40 When something breaks",
          kort: "What to write when it gets stuck, so you can keep going on your own afterwards."
        }
      ],

      hvaDuLaererTittel: "What you get",
      hvaDuLaerer: [
        "Three hours live with me, where you build while I build",
        "Your own app, published with its own link before you log off",
        "The workshop \"Hire your five AI assistants\", 21 lessons, as preparation",
        "A recording of the whole session, so you can keep building at your own pace",
        "Ready-made descriptions you can reuse for the next app",
        "A seat in a small room, not a webinar with a thousand people"
      ],

      forDegTittel: "This is for you if",
      forDeg: [
        "You have an idea you never got made, because you do not code",
        "You have tried AI for text, and wonder what else is possible",
        "You want something finished the same evening, not a project that drags on",
        "You learn best when someone builds alongside you",
        "You want to be able to make the next one yourself, without asking anyone"
      ],

      ikkeForDegTittel: "This is not for you if",
      ikkeForDeg: [
        "You want someone else to build the app for you",
        "You want to watch, and not do anything yourself along the way",
        "You cannot join live, and do not want the recording either"
      ],

      trengerTittel: "What you need",
      trenger: [
        "A PC or Mac with a browser, that is enough, nothing gets installed",
        "A Claude account",
        "An idea, or the willingness to pick one of my three"
      ],

      garanti: "",
      kjopKnapp: "Yes, save me a seat",
      utsolgtKnapp: "All the seats are taken",
      sosialtBevis:
        "Made by Renate Dahl, who built the entire LME platform this way, without writing code herself.",
      testimonial: { sitat: "", navn: "", sted: "" },
      bilde: ""
    },

    takk: {
      merkelapp: "The seat is yours",
      overskrift: "Thank you, see you on 24 September",
      underoverskrift:
        "Your participant link is in your inbox, together with the workshop you get with it. " +
        "Check your spam folder if you do not see it after a few minutes.",
      steg: [
        "Open the email from me and click the link to the participant page",
        "Put the evening in your calendar, the button is on the participant page",
        "Take the workshop that comes with it, it gets you ready to build",
        "Have an idea in mind when we start, or pick one of my three"
      ],
      knapp: "Open the participant page",
      knappLenke: "/byggeokt-deltaker",
      sekundaerKnapp: "To LME Studio",
      sekundaerLenke: "/academy",
      support: "Something not right? Just reply to the email and I will fix it."
    }
  }
};

})();
