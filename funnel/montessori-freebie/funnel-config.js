/* =====================================================================
   LME — Freebie-funnel: Kom i gang med Montessori
   ---------------------------------------------------------------------
   Enkel gratis-funnel: opt-in-side som fanger e-posten, og en takkeside
   som sender rett videre inn i det gratis Kursbygger-kurset. Ingen
   betaling. Erstatter den tidligere åpne lenken rett til kurset, som lå
   synlig gratis uten noen registrering, se avtale med Renate 8. august 2026.

   Flyten: opt-in.html  ->  (plattformens egen liste)  ->  takk.html (åpne kurset)
   ===================================================================== */

window.LME_FUNNEL = {
  no: {
    brand: {
      navn: "Little Montessori Explorers",
      kortnavn: "LME",
      logo: "/images/lme-logo.png",
      optInActionUrl: "/api/subscribe",
      newsletterSource: "montessori-freebie", // Montessori mesterklasse, gratis leads
      etterOptIn: "takk.html"
    },

    optIn: {
      merkelapp: "Gratis, start her",
      overskrift: "Kom i gang med Montessori",
      underoverskrift:
        "Møt LME, forstå barnets utvikling og bli klar for Montessorireisen. Skriv inn " +
        "navn og e-post, så åpner jeg kurset for deg med en gang.",
      punkter: [
        "Hva Montessori egentlig handler om, og hvorfor det passer for barnet ditt",
        "Hvordan barn lærer i de første årene, og hva det betyr for deg",
        "Dine aller første steg på LME"
      ],
      epostPlaceholder: "Skriv inn e-posten din",
      navnPlaceholder: "Fornavn",
      knapp: "Åpne kurset gratis",
      bekreftelseTittel: "Takk! Du er inne 🌸",
      bekreftelseTekst: "Kurset ditt er klart, jeg sender deg rett videre …",
      sikkerhet: "Ingen spam. Meld deg av når som helst.",
      bilde: "/images/hero_learning_tree.webp"
    },

    takkIkkeKjoper: {
      merkelapp: "Klar til å starte",
      overskrift: "Velkommen inn 🌸",
      underoverskrift:
        "Så glad for at du er her. «Kom i gang med Montessori» møter deg der du er, og gir deg " +
        "grunnlaget du trenger før du går videre i Montessorireisen.",
      steg: [
        "Trykk på knappen under for å åpne kurset med en gang.",
        "Ta det i ditt eget tempo, du kan alltid komme tilbake.",
        "Klar for mer? Montessori Masterclass tar deg videre med fem fulle moduler."
      ],
      knapp: "Åpne kurset",
      knappLenke: "/kurs/montessori-kom-i-gang",
      sekundaerKnapp: "Til akademiet",
      sekundaerLenke: "/academy",
      angre: "Klar for å gå dypere? Montessori Masterclass tar deg fra 3–6 år til observasjonskunsten, i ditt eget tempo.",
      angreKnapp: "Se Montessori Masterclass",
      angreLenke: "/montessori-mesterklasse",
      butikkTekst: "",
      butikkKnapp: "",
      butikkLenke: ""
    }
  }
};
