/* =====================================================================
   LME — Freebie-funnel: Få dine første 100 e-postabonnenter (tospråklig)
   ---------------------------------------------------------------------
   Gratis minikurs-funnel: opt-in-side som fanger e-posten, og en
   takkeside som sender rett videre inn i det gratis Kursbygger-kurset
   "Få dine første 100 e-postabonnenter". Ingen betaling. Bygget som en
   egen, ny gratis-inngang til e-postliste-temaet, atskilt fra den
   eksisterende "5 lead magnet-idéer"-guiden i funnel/epostliste-freebie/.

   Flyten: opt-in.html  ->  (plattformens egen liste)  ->  takk.html (åpne minikurset)
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
      optInActionUrl: "/api/subscribe",
      newsletterSource: "epostliste-minikurs-no", // Epostliste minikurs, gratis leads
      etterOptIn: "takk.html"
    },

    optIn: {
      merkelapp: "Gratis minikurs",
      overskrift: "Få dine første 100 e-postabonnenter",
      underoverskrift:
        "Hvorfor du bør bygge e-postlisten din nå, din første lead magnet og en " +
        "enkel 7-dagers plan for å komme i gang. Skriv inn navn og e-post, så åpner " +
        "jeg minikurset for deg med en gang.",
      punkter: [
        "Hvorfor e-postlisten bør bygges tidlig, uansett hvor liten virksomheten er",
        "Hvordan du velger din første lead magnet",
        "En enkel 7-dagers plan som tar deg fra ingenting til dine første abonnenter"
      ],
      epostPlaceholder: "Skriv inn e-posten din",
      navnPlaceholder: "Fornavn",
      knapp: "Åpne minikurset gratis",
      bekreftelseTittel: "Takk! Du er inne 🌸",
      bekreftelseTekst: "Minikurset ditt er klart, jeg sender deg rett videre …",
      sikkerhet: "Ingen spam. Meld deg av når som helst.",
      bilde: "/images/mia-teo-brev.webp"
    },

    takkIkkeKjoper: {
      merkelapp: "Klar til å starte",
      overskrift: "Velkommen inn 🌸",
      underoverskrift:
        "Så glad for at du er her. Minikurset gir deg de aller første stegene mot en " +
        "e-postliste som jobber for deg, uten at det trenger å være komplisert.",
      steg: [
        "Trykk på knappen under for å åpne minikurset med en gang.",
        "Ta det i ditt eget tempo, du kan alltid komme tilbake.",
        "Klar for mer? \"Voks e-postlisten din\" tar deg gjennom hele strategien."
      ],
      knapp: "Åpne minikurset",
      knappLenke: "/kurs/epostliste-100-abonnenter",
      sekundaerKnapp: "Til akademiet",
      sekundaerLenke: "/academy",
      angre: "Klar for hele systemet? \"Voks e-postlisten din\" tar deg fra idé til lead magnet, påmeldingsside og en velkomstserie som jobber for deg mens du sover.",
      angreKnapp: "Se \"Voks e-postlisten din\"",
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
      newsletterSource: "epostliste-minikurs-en", // Email list mini-course, free leads (EN)
      etterOptIn: "takk.html"
    },

    optIn: {
      merkelapp: "Free mini-course",
      overskrift: "Get your first 100 email subscribers",
      underoverskrift:
        "Why you should build your email list now, your first lead magnet, and a " +
        "simple 7-day plan to get going. Enter your name and email and I'll open " +
        "the mini-course for you right away.",
      punkter: [
        "Why your email list should be built early, no matter how small your business is",
        "How to choose your first lead magnet",
        "A simple 7-day plan that takes you from nothing to your first subscribers"
      ],
      epostPlaceholder: "Enter your email",
      navnPlaceholder: "First name",
      knapp: "Open the mini-course, free",
      bekreftelseTittel: "Thank you! You're in 🌸",
      bekreftelseTekst: "Your mini-course is ready, taking you straight there …",
      sikkerhet: "No spam. Unsubscribe anytime.",
      bilde: "/images/mia-teo-brev.webp"
    },

    takkIkkeKjoper: {
      merkelapp: "Ready to start",
      overskrift: "Welcome in 🌸",
      underoverskrift:
        "So glad you're here. The mini-course gives you the very first steps toward " +
        "an email list that works for you, without it needing to be complicated.",
      steg: [
        "Click the button below to open the mini-course right away.",
        "Take it at your own pace, you can always come back.",
        "Ready for more? \"Grow your email list\" takes you through the whole strategy."
      ],
      knapp: "Open the mini-course",
      knappLenke: "/kurs/epostliste-100-abonnenter?lang=en",
      sekundaerKnapp: "To the academy",
      sekundaerLenke: "/academy",
      angre: "Ready for the whole system? \"Grow your email list\" takes you from idea to lead magnet, sign-up page and a welcome series that works for you while you sleep.",
      angreKnapp: "See \"Grow your email list\"",
      angreLenke: "/epostliste-kurs?lang=en",
      butikkTekst: "",
      butikkKnapp: "",
      butikkLenke: ""
    }
  }
};
