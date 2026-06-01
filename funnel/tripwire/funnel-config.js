/* =====================================================================
   LME — Tripwire-funnel · konfigurasjon
   ---------------------------------------------------------------------
   Alt du trenger å endre for å styre funnelen samles HER.
   Tekst, priser, lenker og innstillinger — bare rediger verdiene under,
   lagre filen, og last sidene på nytt. Du trenger ikke røre HTML-en.

   Tips:
   - Tekst står inni anførselstegn:  "slik"
   - Tall står uten anførselstegn:   99
   - Husk komma på slutten av hver linje (men ikke på den siste i en gruppe)
   ===================================================================== */

window.LME_FUNNEL = {

  /* -----------------------------------------------------------------
     1) GENERELT — gjelder hele funnelen
     ----------------------------------------------------------------- */
  brand: {
    navn: "Little Montessori Explorers",
    kortnavn: "LME",
    logo: "/images/lme-logo.png",          // bytt bilde her om ønskelig
    // E-postliste / CRM: lim inn URL-en skjemaet skal sende til.
    // La stå tom ("") for å bruke den innebygde demo-bekreftelsen.
    optInActionUrl: "",
    // Hvor brukeren sendes ETTER at e-posten er registrert:
    etterOptIn: "tilbud.html",
    // Stripe/betalings-lenke for kjøp av guiden (lim inn din checkout-URL).
    // La stå tom ("") for å bruke demo-knappen som går til takk-siden.
    checkoutUrl: "https://buy.stripe.com/00wfZidkpaft1PLgNN9R60f",
    // Sider brukeren sendes til avhengig av utfall:
    etterKjop: "takk-kjoper.html",
    avslo: "takk-ikke-kjoper.html"
  },

  /* -----------------------------------------------------------------
     2) PRIS & NEDTELLING
     ----------------------------------------------------------------- */
  tilbudPris: {
    belop: 99,                  // prisen på AI-guiden
    valuta: "kr",
    visningFor: "299 kr",       // overstrøket «før»-pris (sett "" for å skjule)
    timerNedtelling: 72         // hvor mange timer nedtellingen varer
  },

  /* -----------------------------------------------------------------
     3) SIDE 1 — OPT-IN (gratis guide)
     ----------------------------------------------------------------- */
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

  /* -----------------------------------------------------------------
     4) SIDE 2 — TILBUD (AI-guiden til 99 kr + nedtelling)
     ----------------------------------------------------------------- */
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
    bilde: "/images/poster-norsk.jpg",        // stillbilde (poster) som vises før videoen spiller
    video: "/videos/mia-og-teo-norsk.mp4"     // Mia & Teo-video; sett "" for å bruke kun stillbildet
  },

  /* -----------------------------------------------------------------
     5) SIDE 3 — TAKK (for KJØPERE)
     ----------------------------------------------------------------- */
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
    // Bonus: Mia & Teo-sangen «Kom bli med!». La bonusLenke stå tom ("") for å skjule bonusknappen.
    bonusKnapp: "Last ned bonussangen «Kom bli med!»",
    bonusLenke: "/funnel/nedlasting/mia-og-teo-kom-bli-med.mp4",
    sekundaerKnapp: "Tilbake til Creative Studio",
    sekundaerLenke: "/creative-studio",
    support: "Spørsmål? Svar på e-posten du nettopp fikk, så hjelper vi deg."
  },

  /* -----------------------------------------------------------------
     6) SIDE 4 — TAKK (for IKKE-KJØPERE)
     ----------------------------------------------------------------- */
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
};
