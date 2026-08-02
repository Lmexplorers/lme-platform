/* =====================================================================
   LME — Salgstrakt for "Videre med YouTube" · konfigurasjon
   ---------------------------------------------------------------------
   Samme mønster som funnel/youtube-kurs. Solgt som sitt eget kurs, ikke
   som et mersalg rett etter kjøp av hovedkurset.

   Trakten har to steg:
     salg.html   → salgsside for "Videre med YouTube" (pris + kjøp)
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
      checkoutUrl: "",   // Stripe: lim inn betalingslenken for 497 kr her (tom = hopp rett til takk)
      etterKjop: "takk.html",

      pris: {
        belop: 497,
        valuta: "kr",
        visningFor: "1497 kr"
      },

      merkelapp: "Lanseringstilbud",
      overskrift: "Videre med YouTube",
      underoverskrift:
        "Fortsettelsen på YouTube-kurset. Nå bygger vi videre: les tallene, test og " +
        "forbedre, sett bort arbeidet, og skalér til flere kanaler og større inntekt.",

      hvaDuLaererTittel: "Hva du lærer i dette kurset",
      hvaDuLaerer: [
        "Å lese YouTube-tallene som faktisk betyr noe: klikkrate, seetid og seerbevaring",
        "Hvordan du tester og forbedrer titler og miniatyrbilder",
        "Å bygge et enkelt team og system, så du slipper å gjøre alt selv",
        "Hvordan du skalerer til flere kanaler uten å brenne ut",
        "Monetisering på nivå to: sponsing, egne produkter og salg av kanal",
        "Ferdige oppskrifter for analyse, testing og bortsetting"
      ],

      bonuserTittel: "Bonuser du får med",
      bonuser: [
        {
          tittel: "Analyse-sjekklisten",
          tekst: "Steg-for-steg sjekkliste for å lese egne YouTube-tall riktig."
        },
        {
          tittel: "Ferdige oppskrifter",
          tekst: "Klare prompter for testing, analyse og bortsetting av arbeid."
        }
      ],

      forDegTittel: "Dette kurset er for deg hvis",
      forDeg: [
        "Du har startet en kanal og vil ta den videre",
        "Du vil forstå tallene og ta valg på data, ikke bare magefølelse",
        "Du vil jobbe smartere med et system og litt hjelp",
        "Du drømmer om flere kanaler eller en større inntekt"
      ],

      ikkeForDegTittel: "Dette kurset er ikke for deg hvis",
      ikkeForDeg: [
        "Du har ikke startet en kanal ennå (start med «Voks på YouTube med AI» først)",
        "Du leter etter en snarvei uten noe arbeid",
        "Du vil ha alt gjort for deg, ikke lære systemet selv"
      ],

      garanti: "",
      kjopKnapp: "Ja takk, gi meg Videre med YouTube",
      sosialtBevis: "Laget av Renate Dahl, som har bygget LME til en hel plattform.",
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
      knappLenke: "/academy/youtube-videre",
      bonusKnapp: "",
      bonusLenke: "",
      sekundaerKnapp: "Til kurs",
      sekundaerLenke: "/academy",
      support: "Spørsmål? Svar på e-posten du nettopp fikk, så hjelper jeg deg."
    }
  }
};
