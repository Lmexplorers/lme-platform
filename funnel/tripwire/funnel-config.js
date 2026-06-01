/* =====================================================================
   LME — Tripwire-funnel · konfigurasjon (tospråklig: norsk + engelsk)
   ---------------------------------------------------------------------
   Alt du trenger å endre for å styre funnelen samles HER.

   Strukturen har to språkblokker:
     LME_FUNNEL.no = { ... norsk ... }
     LME_FUNNEL.en = { ... engelsk ... }

   Sidene viser norsk som standard, og bytter til engelsk med 🇬🇧-knappen
   (samme språkvalg som resten av plattformen — lagres i localStorage
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
      logo: "/images/lme-logo.png",
      optInActionUrl: "",                 // e-postliste/CRM (tom = demo)
      etterOptIn: "tilbud.html",
      checkoutUrl: "https://buy.stripe.com/00wfZidkpaft1PLgNN9R60f",  // Stripe (99 kr NOK)
      etterKjop: "takk-kjoper.html",
      avslo: "takk-ikke-kjoper.html"
    },

    tilbudPris: {
      belop: 99,
      valuta: "kr",
      visningFor: "299 kr",               // overstrøket «før»-pris ("" skjuler)
      timerNedtelling: 72
    },

    optIn: {
      merkelapp: "Gratis nedlasting",
      overskrift: "Den lille guiden til en roligere hverdag med Montessori hjemme",
      underoverskrift:
        "Få vår gratis startguide med 7 enkle aktiviteter du kan gjøre på kjøkkenet, " +
        "i stua og i hagen — laget for nysgjerrige barn mellom 1 og 6 år.",
      punkter: [
        "7 ferdige aktiviteter du kan starte med i dag",
        "Hva du trenger (spoiler: ting du allerede har hjemme)",
        "Slik forbereder du miljøet så barnet klarer mer selv"
      ],
      epostPlaceholder: "Skriv inn e-posten din",
      navnPlaceholder: "Fornavn",
      knapp: "Send meg guiden gratis",
      sikkerhet: "Ingen spam. Meld deg av når som helst.",
      bilde: "/images/mia-og-teo.jpg"
    },

    tilbud: {
      merkelapp: "Engangstilbud — kun nå",
      overskrift: "Vil du ha hele AI-guiden som lærer deg å lage alt selv?",
      underoverskrift:
        "Du har akkurat fått startguiden. Vil du ta det et steg videre? " +
        "AI-guiden viser deg, steg for steg, hvordan du bruker AI til å lage " +
        "Montessori-aktiviteter, ukeplaner og materiell — tilpasset barnets alder " +
        "og det du har hjemme.",
      nedtellingTekst: "Tilbudet forsvinner om:",
      punkter: [
        "20-siders AI-guide og arbeidshefte — din for alltid",
        "6 moduler: fra trygg AI-start til ukeplaner, aktiviteter og printables",
        "Komplett promptbibliotek — ferdige prompts du bare kopierer og bruker",
        "Bonus: Mia & Teo-sangen «Kom bli med!» — til kos og bevegelse hjemme"
      ],
      garanti: "14 dagers full pengene-tilbake-garanti — uten spørsmål.",
      kjopKnapp: "Ja takk — gi meg AI-guiden",
      avslaaKnapp: "Nei takk, jeg vil ikke ha dette tilbudet",
      sosialtBevis: "Allerede valgt av over 1 200 norske familier.",
      bilde: "/images/poster-norsk.jpg",
      video: "/videos/mia-og-teo-norsk.mp4"
    },

    takkKjoper: {
      merkelapp: "Kjøpet er bekreftet",
      overskrift: "Tusen takk — du er i gang! 🎉",
      underoverskrift:
        "Vi er så glade for å ha deg med. AI-guiden er nå låst opp for deg, " +
        "og du finner alt du trenger rett under.",
      steg: [
        "Sjekk innboksen din — kvittering og tilgang er på vei.",
        "Trykk på knappen under for å laste ned AI-guiden (PDF) med en gang.",
        "Lagre filen så du alltid finner tilbake til den."
      ],
      knapp: "Last ned AI-guiden (PDF)",
      knappLenke: "/funnel/nedlasting/LME-AI-Guide.pdf",
      bonusKnapp: "Last ned bonussangen «Kom bli med!»",
      bonusLenke: "/funnel/nedlasting/mia-og-teo-kom-bli-med.mp4",
      sekundaerKnapp: "Tilbake til Creative Studio",
      sekundaerLenke: "/creative-studio",
      support: "Spørsmål? Svar på e-posten du nettopp fikk, så hjelper vi deg."
    },

    takkIkkeKjoper: {
      merkelapp: "Guiden er på vei",
      overskrift: "Helt i orden — gratisguiden ligger i innboksen din 💛",
      underoverskrift:
        "Du trenger ikke kjøpe noe for å komme i gang. Åpne e-posten fra oss, " +
        "last ned startguiden, og prøv den første aktiviteten allerede i dag.",
      steg: [
        "Åpne e-posten fra oss (sjekk også søppelpost).",
        "Last ned den gratis startguiden.",
        "Velg én aktivitet og prøv den i dag."
      ],
      knapp: "Utforsk gratis ressurser",
      knappLenke: "/ressurser",
      sekundaerKnapp: "Tilbake til Creative Studio",
      sekundaerLenke: "/creative-studio",
      angre: "Ombestemte du deg? Du kan fortsatt få AI-guiden til introprisen.",
      angreKnapp: "Se tilbudet igjen",
      angreLenke: "tilbud.html"
    }
  },

  /* =================================================================
     ENGLISH
     ================================================================= */
  en: {
    brand: {
      navn: "Little Montessori Explorers",
      kortnavn: "LME",
      logo: "/images/lme-logo.png",
      optInActionUrl: "",                 // email list/CRM (empty = demo)
      etterOptIn: "tilbud.html",
      checkoutUrl: "https://buy.stripe.com/cNicN64NT0ET7a5app9R60g",  // Stripe (9.99 USD)
      etterKjop: "takk-kjoper.html",
      avslo: "takk-ikke-kjoper.html"
    },

    tilbudPris: {
      belop: 9.99,
      valuta: "USD",
      visningFor: "$29",                  // struck-through "before" price ("" hides)
      timerNedtelling: 72
    },

    optIn: {
      merkelapp: "Free download",
      overskrift: "The little guide to calmer days with Montessori at home",
      underoverskrift:
        "Get our free starter guide with 7 simple activities you can do in the kitchen, " +
        "living room and garden — made for curious children aged 1 to 6.",
      punkter: [
        "7 ready-to-use activities you can start today",
        "What you need (spoiler: things you already have at home)",
        "How to prepare the environment so your child can do more on their own"
      ],
      epostPlaceholder: "Enter your email",
      navnPlaceholder: "First name",
      knapp: "Send me the free guide",
      sikkerhet: "No spam. Unsubscribe anytime.",
      bilde: "/images/mia-og-teo.jpg"
    },

    tilbud: {
      merkelapp: "One-time offer — right now",
      overskrift: "Want the full AI guide that teaches you to create it all yourself?",
      underoverskrift:
        "You've just got the starter guide. Want to take it one step further? " +
        "The AI guide shows you, step by step, how to use AI to create " +
        "Montessori activities, weekly plans and materials — tailored to your " +
        "child's age and what you have at home.",
      nedtellingTekst: "This offer disappears in:",
      punkter: [
        "20-page AI guide & workbook — yours forever",
        "6 modules: from a safe AI start to weekly plans, activities and printables",
        "Complete prompt library — ready-made prompts you just copy and use",
        "Bonus: the Mia & Teo song “Come Along!” — for cuddles and movement at home"
      ],
      garanti: "14-day full money-back guarantee — no questions asked.",
      kjopKnapp: "Yes please — give me the AI guide",
      avslaaKnapp: "No thanks, I don't want this offer",
      sosialtBevis: "Already chosen by over 1,200 families.",
      bilde: "/images/poster-english.jpg",
      video: "/videos/mia-and-teo-english.mp4"
    },

    takkKjoper: {
      merkelapp: "Purchase confirmed",
      overskrift: "Thank you — you're all set! 🎉",
      underoverskrift:
        "We're so glad to have you. The AI guide is now unlocked for you, " +
        "and you'll find everything you need right below.",
      steg: [
        "Check your inbox — your receipt and access are on the way.",
        "Tap the button below to download the AI guide (PDF) right away.",
        "Save the file so you can always find your way back."
      ],
      knapp: "Download the AI guide (PDF)",
      // ENGELSK PDF kommer — legg filen i funnel/nedlasting/ og sett stien her.
      // Tom ("") skjuler nedlastingsknappen til guiden er klar.
      knappLenke: "",
      bonusKnapp: "Download the bonus song “Come Along!”",
      // ENGELSK SANG — legg filen i funnel/nedlasting/ og sett stien her.
      bonusLenke: "",
      sekundaerKnapp: "Back to Creative Studio",
      sekundaerLenke: "/creative-studio",
      support: "Questions? Just reply to the email you received and we'll help you."
    },

    takkIkkeKjoper: {
      merkelapp: "Your guide is on its way",
      overskrift: "All good — your free guide is in your inbox 💛",
      underoverskrift:
        "You don't need to buy anything to get started. Open the email from us, " +
        "download the starter guide, and try the first activity today.",
      steg: [
        "Open the email from us (check your spam folder too).",
        "Download the free starter guide.",
        "Pick one activity and try it today."
      ],
      knapp: "Explore free resources",
      knappLenke: "/ressurser",
      sekundaerKnapp: "Back to Creative Studio",
      sekundaerLenke: "/creative-studio",
      angre: "Changed your mind? You can still get the AI guide at the intro price.",
      angreKnapp: "See the offer again",
      angreLenke: "tilbud.html"
    }
  }
};
