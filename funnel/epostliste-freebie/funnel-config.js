/* =====================================================================
   LME — Freebie-funnel: 5 lead magnet-idéer (tospråklig)
   ---------------------------------------------------------------------
   Enkel gratis-funnel: opt-in-side som fanger e-posten, og en takkeside
   der guiden (PDF) lastes ned med en gang. Ingen betaling. Bygget som
   den manglende registreringen for "Voks e-postlisten din", som helt
   frem til nå var en helt åpen side uten noe skjema i det hele tatt.

   Flyten: opt-in.html  ->  (plattformens egen liste, api/subscribe.js)  ->  takk.html (nedlasting)

   Leaden går rett inn i plattformens egen nyhetsbrev-liste (BUILDER_KV,
   _lib/newsletter.js) og får den ukentlige evergreen-serien via MailerSend,
   IKKE en MailerLite-automasjon, samme mønster som Claude-kursets
   oppfølging (se _lib/claude-mail.js).
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
      optInActionUrl: "/api/subscribe", // sender leads til plattformens egen liste
      newsletterSource: "epostliste-freebie-no", // Voks e-postlisten, gratis leads (NO)
      etterOptIn: "takk.html"
    },

    optIn: {
      merkelapp: "Gratis guide",
      overskrift: "5 lead magnet-idéer for din første e-postliste",
      underoverskrift:
        "Fem konkrete idéer til den aller første gaven du kan tilby i bytte mot en " +
        "e-postadresse, pluss hvordan du velger den som passer deg. Skriv inn navn " +
        "og e-post, så sender jeg guiden rett til deg.",
      punkter: [
        "Fem lead magnet-formater som faktisk fungerer",
        "Hjelp til å velge riktig format for akkurat deg",
        "Et lite dytt videre til å bygge hele systemet"
      ],
      epostPlaceholder: "Skriv inn e-posten din",
      navnPlaceholder: "Fornavn",
      knapp: "Send meg guiden",
      bekreftelseTittel: "Takk for påmeldingen! 🎁",
      bekreftelseTekst: "Guiden din er klar, jeg sender deg rett videre til nedlasting …",
      sikkerhet: "Ingen spam. Meld deg av når som helst.",
      bilde: "/images/mia-teo-brev.webp"
    },

    takkIkkeKjoper: {
      merkelapp: "Klar til nedlasting",
      overskrift: "Her er guiden din 🎁",
      underoverskrift:
        "Så glad for at du sa ja! Bruk de fem idéene til å velge den første gaven du " +
        "vil tilby, og lag den enkel. Du trenger ikke den perfekte idéen, bare én god " +
        "nok til å starte med.",
      steg: [
        "Trykk på knappen under for å laste ned guiden (PDF) med en gang.",
        "Lagre filen så du alltid har den for hånden.",
        "Velg én idé, og lag den enkel denne uken."
      ],
      knapp: "Last ned guiden (PDF)",
      knappLenke: "/funnel/nedlasting/LME-5-lead-magnet-ideer.pdf",
      sekundaerKnapp: "Tilbake til LME",
      sekundaerLenke: "/academy",
      angre: "Klar for hele systemet? «Voks e-postlisten din» tar deg fra idé til lead magnet, påmeldingsside og en velkomstserie som jobber for deg mens du sover.",
      angreKnapp: "Se «Voks e-postlisten din»",
      angreLenke: "/epostliste-kurs",
      butikkTekst: "",
      butikkKnapp: "",
      butikkLenke: ""
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
      optInActionUrl: "/api/subscribe",
      newsletterSource: "epostliste-freebie-en", // Grow your email list, free leads (EN)
      etterOptIn: "takk.html"
    },

    optIn: {
      merkelapp: "Free guide",
      overskrift: "5 lead magnet ideas for your first email list",
      underoverskrift:
        "Five concrete ideas for the very first gift you can offer in exchange for " +
        "an email address, plus how to choose the one that fits you. Enter your " +
        "name and email and I'll send the guide straight to you.",
      punkter: [
        "Five lead magnet formats that actually work",
        "Help choosing the right format for you",
        "A little nudge toward building the whole system"
      ],
      epostPlaceholder: "Enter your email",
      navnPlaceholder: "First name",
      knapp: "Send me the guide",
      bekreftelseTittel: "Thank you for signing up! 🎁",
      bekreftelseTekst: "Your guide is ready, taking you straight to the download …",
      sikkerhet: "No spam. Unsubscribe anytime.",
      bilde: "/images/mia-teo-brev.webp"
    },

    takkIkkeKjoper: {
      merkelapp: "Ready to download",
      overskrift: "Here's your guide 🎁",
      underoverskrift:
        "So glad you said yes! Use the five ideas to choose your first gift to offer, " +
        "and keep it simple. You don't need the perfect idea, just a good enough one " +
        "to start with.",
      steg: [
        "Click the button below to download the guide (PDF) right away.",
        "Save the file so you always have it to hand.",
        "Pick one idea, and keep it simple this week."
      ],
      knapp: "Download the guide (PDF)",
      knappLenke: "/funnel/nedlasting/LME-5-lead-magnet-ideas-EN.pdf",
      sekundaerKnapp: "Back to LME",
      sekundaerLenke: "/academy",
      angre: "Ready for the whole system? “Grow your email list” takes you from idea to lead magnet, sign-up page and a welcome series that works for you while you sleep.",
      angreKnapp: "See “Grow your email list”",
      angreLenke: "/epostliste-kurs?lang=en",
      butikkTekst: "",
      butikkKnapp: "",
      butikkLenke: ""
    }
  }
};
