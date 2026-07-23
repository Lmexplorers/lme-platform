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
      optInActionUrl: "/api/mailerlite/subscribe", // sender leads til MailerLite-lista di
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
      merkelapp: "Gratis guide",
      overskrift: "Slik bygger du en Montessori-inntekt hjemmefra — med hjerte, strategi og AI",
      underoverskrift:
        "Last ned vår gratis guide og få en realistisk, varm og konkret vei fra " +
        "Montessoripedagogikk til en inntekt du kan bygge i ditt eget tempo — hjemmefra.",
      punkter: [
        "En realistisk vei fra pedagogikk til inntekt — uten luftslott",
        "Ferdige maler og refleksjonsoppgaver du fyller ut underveis",
        "Slik bruker du AI og Content Studio for å spare tid"
      ],
      epostPlaceholder: "Skriv inn e-posten din",
      navnPlaceholder: "Fornavn",
      knapp: "Send meg gratisguiden",
      bekreftelseTittel: "Takk for påmeldingen! 🎉",
      bekreftelseTekst: "Gratisguiden din er klar — vi sender deg rett videre til nedlasting …",
      sikkerhet: "Ingen spam. Meld deg av når som helst.",
      bilde: "/images/renate-portrait.jpg"
    },

    tilbud: {
      merkelapp: "Engangstilbud — kun nå",
      overskrift: "Vil du ha hele AI-guiden som lærer deg å lage alt selv?",
      underoverskrift:
        "Du har akkurat fått startguiden. Vil du ta det et steg videre? " +
        "AI-guiden viser deg, steg for steg, hvordan du bruker AI til å lage " +
        "Montessoriaktiviteter, ukeplaner og materiell — tilpasset barnets alder " +
        "og det du har hjemme.",
      nedtellingTekst: "Tilbudet forsvinner om:",
      punkter: [
        "20-siders AI-guide og arbeidshefte — din for alltid",
        "6 moduler: fra trygg AI-start til ukeplaner, aktiviteter og printables",
        "Komplett promptbibliotek — ferdige prompts du bare kopierer og bruker",
        "Bonus: Mia & Teo-sangen «Kom bli med!» — til kos og bevegelse hjemme"
      ],
      garanti: "",
      kjopKnapp: "Ja takk — gi meg AI-guiden",
      avslaaKnapp: "Nei takk, jeg vil ikke ha dette tilbudet",
      sosialtBevis: "Laget av en høgskoleutdannet montessoripedagog.",
      // Levering av gratisguiden rett etter påmelding (banner øverst på tilbudssiden).
      // Tom gratisLenke skjuler banneret.
      gratisLevering: "Takk for påmeldingen! Gratisguiden din er klar:",
      gratisKnapp: "Last ned gratisguiden (PDF)",
      gratisLenke: "/funnel/nedlasting/LME-Gratis-Guide-Montessori-Inntekt.pdf",
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
      support: "Spørsmål? Svar på e-posten du nettopp fikk, så hjelper vi deg.",
      butikkTekst: "Når du er klar for neste steg, finner du workbooks og bundles i butikken.",
      butikkKnapp: "Se workbooks og bundles i butikken",
      butikkLenke: "/butikk"
    },

    takkIkkeKjoper: {
      merkelapp: "Klar til nedlasting",
      overskrift: "Helt i orden — her er gratisguiden din 💛",
      underoverskrift:
        "Du trenger ikke kjøpe noe for å komme i gang. Last ned gratisguiden med en gang " +
        "under, og ta det første steget mot en Montessori-inntekt i dag.",
      steg: [
        "Trykk på knappen under for å laste ned gratisguiden (PDF) med en gang.",
        "Lagre filen så du alltid har den for hånden.",
        "Velg ett steg fra guiden og start i dag."
      ],
      knapp: "Last ned gratisguiden (PDF)",
      knappLenke: "/funnel/nedlasting/LME-Gratis-Guide-Montessori-Inntekt.pdf",
      sekundaerKnapp: "Tilbake til Creative Studio",
      sekundaerLenke: "/creative-studio",
      angre: "Ombestemte du deg? Du kan fortsatt få AI-guiden til introprisen.",
      angreKnapp: "Se tilbudet igjen",
      angreLenke: "tilbud.html",
      butikkTekst: "Vil du utforske mer? Ta gjerne en rolig titt i butikken.",
      butikkKnapp: "Se butikken",
      butikkLenke: "/butikk"
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
      optInActionUrl: "/api/mailerlite/subscribe", // sends leads to your MailerLite list
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
      merkelapp: "Free guide",
      overskrift: "How to build a Montessori income from home — with heart, strategy and AI",
      underoverskrift:
        "Download our free guide for a realistic, warm and concrete path from " +
        "Montessori teaching to an income you can build at your own pace — from home.",
      punkter: [
        "A realistic path from pedagogy to income — no get-rich-quick promises",
        "Ready-made templates and reflection tasks you fill in as you go",
        "How to use AI and Content Studio to save time"
      ],
      epostPlaceholder: "Enter your email",
      navnPlaceholder: "First name",
      knapp: "Send me the free guide",
      bekreftelseTittel: "Thank you for signing up! 🎉",
      bekreftelseTekst: "Your free guide is ready — taking you straight to the download …",
      sikkerhet: "No spam. Unsubscribe anytime.",
      bilde: "/images/renate-portrait.jpg"
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
      garanti: "",
      kjopKnapp: "Yes please — give me the AI guide",
      avslaaKnapp: "No thanks, I don't want this offer",
      sosialtBevis: "Created by a college-educated Montessori educator.",
      // Free-guide delivery banner. Set gratisLenke to the English PDF when ready (empty = hidden).
      gratisLevering: "Thanks for signing up! Your free guide is ready:",
      gratisKnapp: "Download the free guide (PDF)",
      gratisLenke: "/funnel/nedlasting/LME-Free-Guide-Montessori-Income-EN.pdf",
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
      // ENGELSK PDF er klar:
      knappLenke: "/funnel/nedlasting/LME-AI-Guide-EN.pdf",
      bonusKnapp: "Download the bonus song “Come and Play”",
      bonusLenke: "/funnel/nedlasting/mia-and-teo-come-and-play.mp4",
      sekundaerKnapp: "Back to Creative Studio",
      sekundaerLenke: "/creative-studio",
      support: "Questions? Just reply to the email you received and we'll help you.",
      butikkTekst: "Whenever you're ready for the next step, you'll find workbooks and bundles in the shop.",
      butikkKnapp: "See workbooks and bundles in the shop",
      butikkLenke: "/butikk"
    },

    takkIkkeKjoper: {
      merkelapp: "Ready to download",
      overskrift: "All good — here's your free guide 💛",
      underoverskrift:
        "You don't need to buy anything to begin. Download the free guide right away " +
        "below, and take your first step toward a Montessori income today.",
      steg: [
        "Tap the button below to download the free guide (PDF) right away.",
        "Save the file so you always have it handy.",
        "Pick one step from the guide and start today."
      ],
      knapp: "Download the free guide (PDF)",
      knappLenke: "/funnel/nedlasting/LME-Free-Guide-Montessori-Income-EN.pdf",
      sekundaerKnapp: "Back to Creative Studio",
      sekundaerLenke: "/creative-studio",
      angre: "Changed your mind? You can still get the AI guide at the intro price.",
      angreKnapp: "See the offer again",
      angreLenke: "tilbud.html",
      butikkTekst: "Want to explore more? Feel free to take a calm look in the shop.",
      butikkKnapp: "Visit the shop",
      butikkLenke: "/butikk"
    }
  }
};
