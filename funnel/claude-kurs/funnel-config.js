/* =====================================================================
   LME — Salgstrakt for Claude-kurset · konfigurasjon (norsk + engelsk)
   ---------------------------------------------------------------------
   Alt du trenger å endre for å styre trakten samles HER.

   Trakten har tre steg:
     salg.html     → salgsside for "Kom i gang med Claude" (pris + kjøp)
     mersalg.html  → engangstilbud (OTO) rett etter kjøp: "Videre med Claude"
     takk.html     → takkeside med tilgang og bonus

   Flyt:
     salg  → (Stripe-checkout for hovedkurset) → mersalg
     mersalg "ja"  → (Stripe-checkout for mersalget) → takk
     mersalg "nei" → takk

   Slik kobler du på ekte betaling:
     Lag to betalingslenker i Stripe (én for hovedkurset, én for mersalget)
     og lim dem inn i "checkoutUrl" under. La feltet stå tomt så lenge du
     bare vil forhåndsvise trakten, da hopper knappene rett videre til neste
     steg uten betaling.

   Sidene viser norsk som standard, og bytter til engelsk med 🇬🇧-knappen
   (samme språkvalg som resten av plattformen, lagres i localStorage
   'lme_lang'). Du kan også tvinge språk med ?lang=en / ?lang=no i URL-en.

   Rediger bare verdiene under, lagre, og last sidene på nytt.
   Tips: tekst i "anførselstegn", tall uten. Komma etter hver linje.
   ===================================================================== */

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

    /* ---- Salgsside: hovedtilbudet ---- */
    salg: {
      checkoutUrl: "https://buy.stripe.com/cNi4gA4NTaftfGBgNN9R615",   // Stripe: hovedkurs 490 kr (tom = hopp rett til mersalg)
      etterKjop: "mersalg.html",       // hit går brukeren etter kjøp

      pris: {
        belop: 490,                    // lanseringspris
        valuta: "kr",
        visningFor: "990 kr"           // vanlig pris (overstrøket). "" skjuler
      },

      merkelapp: "Lanseringstilbud",
      overskrift: "Kom i gang med Claude, den rolige veien",
      underoverskrift:
        "Et vennlig kurs som lærer deg å bruke Claude som en rolig medhjelper i " +
        "hverdagen. Fra din aller første samtale til ferdige oppskrifter du kan " +
        "kopiere og bruke med en gang, helt uten teknisk bakgrunn.",

      hvaDuLaererTittel: "Dette sitter du igjen med",
      hvaDuLaerer: [
        "Hva Claude er, og hvorfor det er nyttig for deg som jobber med barn",
        "Hvordan du kommer trygt i gang, satt opp riktig fra start",
        "Å starte din aller første samtale, uten teknisk bakgrunn",
        "Å skrive gode beskjeder, så du får svar du faktisk kan bruke",
        "Å gjøre en rotete idé om til tydelig, ferdig tekst på minutter",
        "En enkel arbeidsflyt fra idé til ferdig, uten å sette deg fast",
        "Å følge opp og justere, så teksten blir akkurat din",
        "Ferdige oppskrifter for foreldrebrev, ukeplaner, aktiviteter og oversettelser",
        "Å gi Claude litt fast kontekst om deg, så du slipper å forklare alt på nytt",
        "Å holde Claude ryddig, så du lett finner tilbake til det som virker",
        "Trygg og klok bruk: personvern, kildekritikk og sunn fornuft"
      ],

      bonuserTittel: "Bonuser du får med",
      bonuser: [
        {
          tittel: "Oppskriftspakke: ferdige prompter",
          tekst:
            "Alle oppskriftene fra kurset samlet, klare til å kopiere rett inn i " +
            "Claude. Bytt ut det som står i klammer, så er du i gang."
        },
        {
          tittel: "Din egen AI-hjelper-mal",
          tekst:
            "En enkel mal for å fortelle Claude hvem du er og hvordan du liker " +
            "svarene, så du får bedre hjelp fra første melding."
        }
      ],

      forDegTittel: "Dette kurset er for deg hvis",
      forDeg: [
        "Du har hørt om Claude, men aner ikke hvor du skal begynne",
        "Du vil bruke AI som en rolig hjelper i hverdagen, uten teknisk bakgrunn",
        "Du vil bruke mindre tid på det skriftlige og mer tid på barna",
        "Du ønsker ferdige oppskrifter du kan kopiere og bruke med en gang",
        "Du vil lære trygg og klok bruk fra første stund"
      ],

      ikkeForDegTittel: "Dette kurset er ikke for deg hvis",
      ikkeForDeg: [
        "Du vil ha et tungt teknisk kurs med koding fra dag én",
        "Du leter etter vage ideer i stedet for tydelig retning",
        "Du vil helst gjøre alt manuelt og ikke la AI ta noe av det skriftlige"
      ],

      garanti: "",
      kjopKnapp: "Ja takk, gi meg Claude-kurset",
      sosialtBevis:
        "Laget av Renate Dahl, høgskoleutdannet montessoripedagog.",
      // Ekte kundeuttalelse (valgfri). La "sitat" stå tomt til du har en du kan bruke,
      // da skjules boksen. Ikke dikt opp uttalelser, bruk bare ekte tilbakemeldinger.
      testimonial: { sitat: "", navn: "", sted: "" },
      bilde: "/images/banner_laer.webp"
    },

    /* ---- Mersalg (engangstilbud rett etter kjøp) ---- */
    mersalg: {
      checkoutUrl: "https://buy.stripe.com/14AfZifsx5ZdamhfJJ9R617",   // Stripe: mersalg 249 kr (tom = hopp rett til takk)
      etterKjop: "takk.html",
      avslo: "takk.html",

      pris: {
        belop: 249,                    // lanseringspris for mersalget
        valuta: "kr",
        visningFor: "490 kr",          // vanlig pris (overstrøket)
        timerNedtelling: 24
      },

      merkelapp: "Engangstilbud, kun nå",
      overskrift: "Vil du ta Claude et steg videre?",
      underoverskrift:
        "Du har akkurat sikret deg nybegynnerkurset. Vil du fortsette? Videre med " +
        "Claude viser deg skills, koblinger og hvordan du kan bygge enkle sider og " +
        "apper, alt forklart i vanlig språk.",
      nedtellingTekst: "Tilbudet forsvinner om:",
      punkter: [
        "Videregående kurs: skills, koblinger og bygging med Claude",
        "9 leksjoner i tre moduler, fra idé til ferdig prosjekt",
        "Lær å la Claude følge dine faste arbeidsmåter",
        "Trygge vaner for bygging, uten å måtte lære å kode"
      ],
      garanti: "",
      kjopKnapp: "Ja takk, legg til Videre med Claude",
      avslaaKnapp: "Nei takk, jeg fortsetter uten dette",
      sosialtBevis: "Det naturlige neste steget etter nybegynnerkurset.",
      bilde: "/images/courses/course_stjernedryss.webp"
    },

    /* ---- Takkeside med tilgang ---- */
    takk: {
      merkelapp: "Kjøpet er bekreftet",
      overskrift: "Tusen takk, du er i gang! 🎉",
      underoverskrift:
        "Så gøy å ha deg med. Claude-kurset er låst opp for deg, og du finner alt " +
        "du trenger rett under.",
      steg: [
        "Sjekk innboksen din, kvittering og tilgang er på vei.",
        "Trykk på knappen under for å åpne kurset med en gang.",
        "Start med leksjon 1, og ta det i ditt eget tempo."
      ],
      knapp: "Åpne Claude-kurset",
      knappLenke: "/academy/claude",
      bonusKnapp: "Last ned oppskriftspakken (PDF)",
      bonusLenke: "/funnel/nedlasting/LME-Claude-oppskrifter.pdf",   // tospråklig oppskriftspakke
      sekundaerKnapp: "Til kurs",
      sekundaerLenke: "/academy",
      support: "Spørsmål? Svar på e-posten du nettopp fikk, så hjelper jeg deg."
    }
  },

  /* =================================================================
     ENGLISH
     ================================================================= */
  en: {
    brand: {
      navn: "Little Montessori Explorers",
      kortnavn: "LME",
      logo: "/images/lme-logo.png"
    },

    salg: {
      checkoutUrl: "https://buy.stripe.com/bJedRa6W1cnB3XT4119R616",   // Stripe: main course $49 (empty = skip to upsell)
      etterKjop: "mersalg.html",

      pris: {
        belop: 49,                     // launch price
        valuta: "USD",
        visningFor: "$99"              // regular price (struck through)
      },

      merkelapp: "Launch offer",
      overskrift: "Get started with Claude, the calm way",
      underoverskrift:
        "A friendly course that teaches you to use Claude as a calm helper in " +
        "everyday life. From your very first conversation to ready-made recipes you " +
        "can copy and use right away, with no technical background.",

      hvaDuLaererTittel: "Here's what you'll walk away with",
      hvaDuLaerer: [
        "What Claude is, and why it's useful for you who work with children",
        "How to get started safely, set up the right way from the start",
        "Starting your very first conversation, with no technical background",
        "Writing good prompts, so you get answers you can actually use",
        "Turning a messy idea into clear, finished text in minutes",
        "A simple workflow from idea to done, without getting stuck",
        "Following up and adjusting, so the text becomes exactly yours",
        "Ready-made recipes for parent letters, weekly plans, activities and translations",
        "Giving Claude some steady context about you, so you don't repeat yourself",
        "Keeping Claude tidy, so you easily find your way back to what works",
        "Safe and wise use: privacy, source-checking and common sense"
      ],

      bonuserTittel: "Bonuses included",
      bonuser: [
        {
          tittel: "Recipe pack: ready-made prompts",
          tekst:
            "Every recipe from the course in one place, ready to copy straight into " +
            "Claude. Swap out what's in brackets, and you're off."
        },
        {
          tittel: "Your own AI-helper template",
          tekst:
            "A simple template for telling Claude who you are and how you like your " +
            "answers, so you get better help from the very first message."
        }
      ],

      forDegTittel: "This course is for you if",
      forDeg: [
        "You've heard of Claude but have no idea where to start",
        "You want to use AI as a calm helper in everyday life, with no technical background",
        "You want to spend less time on the writing and more time with the children",
        "You want ready-made recipes you can copy and use right away",
        "You want to learn safe and wise use from the very start"
      ],

      ikkeForDegTittel: "This course is not for you if",
      ikkeForDeg: [
        "You want a heavy technical course with coding from day one",
        "You're looking for vague ideas instead of clear direction",
        "You'd rather do everything manually and let AI handle none of the writing"
      ],

      garanti: "",
      kjopKnapp: "Yes please, give me the Claude course",
      sosialtBevis:
        "Created by Renate Dahl, a college-educated Montessori educator.",
      // Real customer quote (optional). Leave "sitat" empty until you have one you can
      // use, then the box is hidden. Don't invent quotes, only use genuine feedback.
      testimonial: { sitat: "", navn: "", sted: "" },
      bilde: "/images/banner_laer.webp"
    },

    mersalg: {
      checkoutUrl: "https://buy.stripe.com/00wfZi6W1cnBgKFapp9R618",   // Stripe: upsell $25 (empty = skip to thank-you)
      etterKjop: "takk.html",
      avslo: "takk.html",

      pris: {
        belop: 25,                     // launch price for the upsell
        valuta: "USD",
        visningFor: "$49",             // regular price (struck through)
        timerNedtelling: 24
      },

      merkelapp: "One-time offer, right now",
      overskrift: "Want to take Claude one step further?",
      underoverskrift:
        "You've just secured the beginner course. Want to keep going? Next Level " +
        "with Claude shows you skills, connections and how to build simple pages and " +
        "apps, all explained in plain language.",
      nedtellingTekst: "This offer disappears in:",
      punkter: [
        "Advanced course: skills, connections and building with Claude",
        "9 lessons across three modules, from idea to finished project",
        "Learn to let Claude follow your regular workflows",
        "Safe building habits, without having to learn to code"
      ],
      garanti: "",
      kjopKnapp: "Yes please, add Next Level with Claude",
      avslaaKnapp: "No thanks, I'll continue without this",
      sosialtBevis: "The natural next step after the beginner course.",
      bilde: "/images/courses/course_stjernedryss.webp"
    },

    takk: {
      merkelapp: "Purchase confirmed",
      overskrift: "Thank you, you're all set! 🎉",
      underoverskrift:
        "So glad to have you. The Claude course is now unlocked for you, and you'll " +
        "find everything you need right below.",
      steg: [
        "Check your inbox, your receipt and access are on the way.",
        "Tap the button below to open the course right away.",
        "Start with lesson 1, and take it at your own pace."
      ],
      knapp: "Open the Claude course",
      knappLenke: "/academy/claude",
      bonusKnapp: "Download the recipe pack (PDF)",
      bonusLenke: "/funnel/nedlasting/LME-Claude-oppskrifter.pdf",   // bilingual recipe pack
      sekundaerKnapp: "To Classes",
      sekundaerLenke: "/academy",
      support: "Questions? Just reply to the email you received, and I'll help you."
    }
  }
};
