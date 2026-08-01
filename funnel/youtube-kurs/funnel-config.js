/* =====================================================================
   LME — Salgstrakt for "Voks på YouTube med AI" · konfigurasjon
   ---------------------------------------------------------------------
   Samme mønster som funnel/claude-kurs, men uten mersalg-steg (Videre med
   YouTube selges som sitt eget kurs, se funnel/youtube-videre-kurs).

   Trakten har to steg:
     salg.html   → salgsside for "Voks på YouTube med AI" (pris + kjøp)
     takk.html   → takkeside med tilgang

   Flyt:
     salg → (Stripe-checkout) → takk

   Slik kobler du på ekte betaling:
     Lag en betalingslenke i Stripe og lim den inn i "checkoutUrl" under.
     La feltet stå tomt så lenge du bare vil forhåndsvise trakten, da hopper
     knappen rett videre til takkesiden uten betaling.

   Kun norsk foreløpig (samme fallback-mønster som claude-kurs, så en
   engelsk versjon kan legges til senere ved å legge en "en"-nøkkel til
   under, uten å endre salg.html/takk.html).

   Rediger bare verdiene under, lagre, og last sidene på nytt.
   ===================================================================== */

window.LME_FUNNEL = {

  no: {
    brand: {
      navn: "Little Montessori Explorers",
      kortnavn: "LME",
      logo: "/images/lme-logo.png"
    },

    /* ---- Salgsside ---- */
    salg: {
      checkoutUrl: "",   // Stripe: lim inn betalingslenken for 497 kr her (tom = hopp rett til takk)
      etterKjop: "takk.html",

      pris: {
        belop: 497,                    // lanseringspris (etter gratis-uken)
        valuta: "kr",
        visningFor: "1497 kr"          // vanlig pris (overstrøket)
      },

      merkelapp: "Lanseringstilbud",
      overskrift: "Voks på YouTube med AI",
      underoverskrift:
        "Et komplett norsk kurs i å bygge en YouTube-kanal uten å vise ansikt, med AI " +
        "som hjelper på manus, stemme og redigering. Du lærer det samme systemet " +
        "proffene bruker, tilpasset deg som vil skape, bli synlig og tjene penger.",

      hvaDuLaererTittel: "Hva du lærer i dette kurset",
      hvaDuLaerer: [
        "Hvordan du finner en lønnsom nisje før du lager en eneste video",
        "Å pakke video med titler og miniatyrbilder som faktisk får klikk",
        "Å lage manus med Claude, stemme med ElevenLabs og ferdige videoer med AI",
        "Hvordan du setter produksjonen i system, uten å gjøre alt selv",
        "Å tjene penger på kanalen: annonser, sponsing og egne produkter",
        "Ferdige oppskrifter du kan kopiere rett inn i Claude"
      ],

      bonuserTittel: "Bonuser du får med",
      bonuser: [
        {
          tittel: "Arbeidsboken",
          tekst:
            "Arbeidsboken som følger kurset, med refleksjon, sjekklister og ett " +
            "konkret steg per del."
        },
        {
          tittel: "Ferdige oppskrifter",
          tekst:
            "Manus-, tittel- og miniatyrbilde-oppskrifter du kan kopiere rett inn i Claude."
        }
      ],

      forDegTittel: "Dette kurset er for deg hvis",
      forDeg: [
        "Du vil starte en YouTube-kanal, men vil ikke stå foran kamera",
        "Du har hørt at AI kan gjøre mye av jobben, men vet ikke hvor du skal begynne",
        "Du vil bygge noe som vokser over tid, ikke jage virale enkelttreff",
        "Du vil bruke tiden din klokt, med et tydelig system å følge",
        "Du drømmer om en ekstra inntekt fra noe du eier selv"
      ],

      ikkeForDegTittel: "Dette kurset er ikke for deg hvis",
      ikkeForDeg: [
        "Du vil stå foran kamera og vise ansiktet ditt",
        "Du leter etter en snarvei uten noe arbeid",
        "Du vil ha en ferdig kanal levert, ikke lære systemet selv"
      ],

      garanti: "",
      kjopKnapp: "Ja takk, gi meg YouTube-kurset",
      sosialtBevis: "Laget av Renate Dahl, som har bygget LME til en hel plattform.",
      // Ekte kundeuttalelse (valgfri). La "sitat" stå tomt til du har en du kan bruke.
      testimonial: { sitat: "", navn: "", sted: "" },
      bilde: "/images/banner_laer.webp"
    },

    /* ---- Takkeside med tilgang ---- */
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
      knappLenke: "/academy/youtube",
      bonusKnapp: "Last ned arbeidsboken (PDF)",
      bonusLenke: "/ressurser/print/youtube-kurs-arbeidsbok",
      sekundaerKnapp: "Til kurs",
      sekundaerLenke: "/academy",
      support: "Spørsmål? Svar på e-posten du nettopp fikk, så hjelper jeg deg."
    }
  }
};
