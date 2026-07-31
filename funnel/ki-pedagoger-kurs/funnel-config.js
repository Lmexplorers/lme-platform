/* =====================================================================
   LME — Salgstrakt for "KI for pedagoger" · konfigurasjon
   ---------------------------------------------------------------------
   Samme mønster som funnel/claude-kurs. Samme prising som Claude-kurset
   (490 kr lanseringspris, 990 kr vanlig pris), etter avtale med Renate.

   Trakten har to steg:
     salg.html   → salgsside for "KI for pedagoger" (pris + kjøp)
     takk.html   → takkeside med tilgang

   Slik kobler du på ekte betaling:
     Lag en betalingslenke i Stripe og lim den inn i "checkoutUrl" under.
     La feltet stå tomt så lenge du bare vil forhåndsvise trakten.

   Kun norsk foreløpig, se funnel/youtube-kurs/funnel-config.js for hvordan
   en engelsk versjon evt. kan legges til senere.
   ===================================================================== */

window.LME_FUNNEL = {

  no: {
    brand: {
      navn: "Little Montessori Explorers",
      kortnavn: "LME",
      logo: "/images/lme-logo.png"
    },

    salg: {
      checkoutUrl: "",   // Stripe: lim inn betalingslenken for 490 kr her (tom = hopp rett til takk)
      etterKjop: "takk.html",

      pris: {
        belop: 490,
        valuta: "kr",
        visningFor: "990 kr"
      },

      merkelapp: "Lanseringstilbud",
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
        {
          tittel: "Firekukers-planen",
          tekst: "En konkret, rolig plan for å komme godt i gang, uke for uke."
        },
        {
          tittel: "Ferdige oppskrifter",
          tekst: "Klare prompter for ukeplaner, foreldrebrev og materiell."
        }
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
      underoverskrift:
        "Så gøy å ha deg med. Kurset er låst opp for deg, og du finner alt du " +
        "trenger rett under.",
      steg: [
        "Sjekk innboksen din, kvittering og tilgang er på vei.",
        "Trykk på knappen under for å åpne kurset med en gang.",
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
  }
};
