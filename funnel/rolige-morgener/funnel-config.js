/* =====================================================================
   LME — Freebie-funnel: Rolige morgener-utfordringen (tospråklig)
   ---------------------------------------------------------------------
   En enkel gratis-funnel: opt-in-side som fanger e-posten, og en
   takkeside der utfordringen (PDF) lastes ned. Ingen betaling.

   Flyten: opt-in.html  ->  (MailerLite)  ->  takk.html (nedlasting)

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
      etterOptIn: "takk.html"
    },

    optIn: {
      merkelapp: "Gratis 5-dagers utfordring",
      overskrift: "5 dager til roligere morgener",
      underoverskrift:
        "På fem dager følger du fem enkle, gjentakbare morgengrep som gjør " +
        "morgenene roligere og lettere, uten kompliserte rutiner eller enda en " +
        "ting å mestre. Skriv inn navn og e-post, så sender jeg den rett til deg.",
      punkter: [
        "Bytt ut morgenkaoset med en rolig, forutsigbar start",
        "Få barna til å samarbeide, fordi dagen endelig har faste holdepunkter",
        "Ta tilbake ti rolige minutter for deg selv før huset våkner"
      ],
      epostPlaceholder: "Skriv inn e-posten din",
      navnPlaceholder: "Fornavn",
      knapp: "Send meg utfordringen",
      bekreftelseTittel: "Takk for påmeldingen! 🌸",
      bekreftelseTekst: "Utfordringen din er klar, jeg sender deg rett videre til nedlasting …",
      sikkerhet: "Ingen spam. Meld deg av når som helst.",
      bilde: "/images/renate-portrait.jpg"
    },

    takkIkkeKjoper: {
      merkelapp: "Klar til nedlasting",
      overskrift: "Her er utfordringen din 🌸",
      underoverskrift:
        "Så glad for at du sa ja! Jeg vet hvor tungt det er å starte dagen i kaos, " +
        "og du fortjener noe langt bedre enn det. Disse fem enkle grepene hjelper " +
        "deg å skape morgener som føles gode for hele familien, og de er faktisk " +
        "mulige selv på de travleste dagene.",
      steg: [
        "Trykk på knappen under for å laste ned utfordringen (PDF) med en gang.",
        "Lagre filen så du alltid har den for hånden.",
        "Start med dag 1 i morgen tidlig, ett lite grep om gangen."
      ],
      knapp: "Last ned utfordringen (PDF)",
      knappLenke: "/funnel/nedlasting/Rolige-morgener-utfordringen.pdf",
      sekundaerKnapp: "Tilbake til LME",
      sekundaerLenke: "/creative-academy",
      angre: "Vil du ha ro i hele dagen, ikke bare om morgenen? Rolige morgener er ett av fem steg i Blomstrings-metoden, signaturkurset mitt.",
      angreKnapp: "Se Blomstrings-metoden",
      angreLenke: "/rolig-metoden",
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
      etterOptIn: "takk.html"
    },

    optIn: {
      merkelapp: "Free 5-day challenge",
      overskrift: "5 Days to Calmer Mornings",
      underoverskrift:
        "Over five days, you'll follow five simple, repeatable morning habits that " +
        "make mornings calmer and easier, without complicated routines or one more " +
        "thing to master. Enter your name and email and I'll send it straight to you.",
      punkter: [
        "Swap morning chaos for a calm, predictable start",
        "Get your children to cooperate, because the day finally has steady anchors",
        "Reclaim ten calm minutes for yourself before the house wakes up"
      ],
      epostPlaceholder: "Enter your email",
      navnPlaceholder: "First name",
      knapp: "Send me the challenge",
      bekreftelseTittel: "Thank you for signing up! 🌸",
      bekreftelseTekst: "Your challenge is ready, taking you straight to the download …",
      sikkerhet: "No spam. Unsubscribe anytime.",
      bilde: "/images/renate-portrait.jpg"
    },

    takkIkkeKjoper: {
      merkelapp: "Ready to download",
      overskrift: "Here's your challenge 🌸",
      underoverskrift:
        "I'm so glad you said yes! I know how heavy it is to start the day in chaos, " +
        "and you deserve so much more than that. These five simple steps will help " +
        "you create mornings that feel good for the whole family, and they're truly " +
        "doable even on your busiest days.",
      steg: [
        "Click the button below to download the challenge (PDF) right away.",
        "Save the file so you always have it to hand.",
        "Start with day 1 tomorrow morning, one small step at a time."
      ],
      knapp: "Download the challenge (PDF)",
      knappLenke: "/funnel/nedlasting/The-Calm-Mornings-Challenge.pdf",
      sekundaerKnapp: "Back to LME",
      sekundaerLenke: "/creative-academy",
      angre: "Want calm across the whole day, not just the morning? Calm mornings are one of five steps in the BLOOM Method, my signature course.",
      angreKnapp: "See the BLOOM Method",
      angreLenke: "/bloom-method",
      butikkTekst: "Want to explore more? Take a calm look around the shop.",
      butikkKnapp: "Visit the shop",
      butikkLenke: "/butikk"
    }
  }
};
