/* =====================================================================
   LME Butikk — produkt-/nedlastingsregister
   ---------------------------------------------------------------------
   Én plass for alle produkter som leveres via takkesiden (takk.html).
   Takkesiden leses med ?p=<id>, f.eks. /butikk/takk.html?p=naturutforskerne

   Slik legger du til et nytt produkt:
     1) Legg PDF-ene i  butikk/nedlasting/
     2) Lim inn en ny blokk under "produkter" med samme mønster
     3) Sett Stripe-betalingslenkens redirect til
        /butikk/takk.html?p=<id> (be meg gjøre det, eller gjør i Stripe)

   Tekst er tospråklig: { no: "…", en: "…" }
   ===================================================================== */

window.LME_BUTIKK = {

  // Felles tekst på takkesiden (norsk + engelsk)
  takk: {
    merkelapp:     { no: "Kjøpet er bekreftet",            en: "Purchase confirmed" },
    overskrift:    { no: "Tusen takk — her er nedlastingen din! 🎉",
                     en: "Thank you — here's your download! 🎉" },
    underUtenMail: { no: "Last ned filene dine under. Du kan laste ned så mange ganger du vil — lagre dem trygt.",
                     en: "Download your files below. You can download as many times as you like — keep them safe." },
    norsk:         { no: "Norsk versjon",                  en: "Norwegian version" },
    engelsk:       { no: "Engelsk versjon",                en: "English version" },
    support:       { no: "Spørsmål? Svar på kvitteringen fra Stripe, så hjelper vi deg.",
                     en: "Questions? Reply to your Stripe receipt and we'll help you." },
    tilbake:       { no: "Tilbake til butikken",           en: "Back to the shop" },
    tilbakeLenke:  "/butikk",
    mangler:       { no: "Fant ikke produktet. Sjekk lenken, eller gå tilbake til butikken.",
                     en: "Product not found. Check the link, or go back to the shop." }
  },

  // ---- PRODUKTER ----
  produkter: {

    "naturutforskerne": {
      navn:  { no: "De små naturutforskerne", en: "The Little Nature Explorers" },
      undertittel: { no: "Mia & Teo møter skogens små venner · 24 sider",
                     en: "Mia & Teo meet the little friends of the forest · 24 pages" },
      cover:   "/images/bok-cover.jpg",
      coverEn: "/images/book-cover-en.jpg",
      filer: [
        { sprak: "no", url: "/butikk/nedlasting/de-sma-naturutforskerne-no.pdf",
          knapp: { no: "Last ned boka (norsk PDF)", en: "Download the book (Norwegian PDF)" } },
        { sprak: "en", url: "/butikk/nedlasting/the-little-nature-explorers-en.pdf",
          knapp: { no: "Last ned boka (engelsk PDF)", en: "Download the book (English PDF)" } }
      ]
    },

    "plansjer": {
      navn:  { no: "Plansjer og kortsett, forhistoriske dyr", en: "Posters and card sets, prehistoric animals" },
      undertittel: { no: "LME Cosmic · 10 A3-plansjer · tekstkort · brukerveiledning",
                     en: "LME Cosmic · 10 A3 posters · text cards · user guide" },
      cover:   "/images/plansjer/thumb-plansjer.jpg",
      coverEn: "/images/plansjer/thumb-posters-en.jpg",
      filer: [
        { sprak: "no", url: "/butikk/nedlasting/plansjer/LME_Cosmic_Plansjer_A3_NO.pdf",
          knapp: { no: "Plansjer A3 (norsk PDF)", en: "Posters A3 (Norwegian PDF)" } },
        { sprak: "no", url: "/butikk/nedlasting/plansjer/LME_Cosmic_Tekstkort_Navn_NO.pdf",
          knapp: { no: "Tekstkort, navn (norsk PDF)", en: "Text cards, names (Norwegian PDF)" } },
        { sprak: "no", url: "/butikk/nedlasting/plansjer/LME_Cosmic_Tekstkort_Navn_Type_NO.pdf",
          knapp: { no: "Tekstkort, navn og type (norsk PDF)", en: "Text cards, name and type (Norwegian PDF)" } },
        { sprak: "no", url: "/butikk/nedlasting/plansjer/LME_Cosmic_Tekstkort_Fakta_NO.pdf",
          knapp: { no: "Tekstkort, fakta (norsk PDF)", en: "Text cards, facts (Norwegian PDF)" } },
        { sprak: "no", url: "/butikk/nedlasting/plansjer/LME_Cosmic_Brukerveiledning_NO.pdf",
          knapp: { no: "Brukerveiledning (norsk PDF)", en: "User guide (Norwegian PDF)" } },
        { sprak: "en", url: "/butikk/nedlasting/plansjer/LME_Cosmic_Posters_A3_EN.pdf",
          knapp: { no: "Plansjer A3 (engelsk PDF)", en: "Posters A3 (English PDF)" } },
        { sprak: "en", url: "/butikk/nedlasting/plansjer/LME_Cosmic_Text_Cards_Names_EN.pdf",
          knapp: { no: "Tekstkort, navn (engelsk PDF)", en: "Text cards, names (English PDF)" } },
        { sprak: "en", url: "/butikk/nedlasting/plansjer/LME_Cosmic_Text_Cards_Name_Type_EN.pdf",
          knapp: { no: "Tekstkort, navn og type (engelsk PDF)", en: "Text cards, name and type (English PDF)" } },
        { sprak: "en", url: "/butikk/nedlasting/plansjer/LME_Cosmic_Text_Cards_Facts_EN.pdf",
          knapp: { no: "Tekstkort, fakta (engelsk PDF)", en: "Text cards, facts (English PDF)" } },
        { sprak: "en", url: "/butikk/nedlasting/plansjer/LME_Cosmic_User_Guide_EN.pdf",
          knapp: { no: "Brukerveiledning (engelsk PDF)", en: "User guide (English PDF)" } }
      ]
    },

    "tidslinje": {
      navn:  { no: "Livets Tidslinje, komplett pakke", en: "Timeline of Life, complete package" },
      undertittel: { no: "Ferdig + tom tidslinje · 55 bildekort · navnekort · lærerveiledning",
                     en: "Finished + blank timeline · 55 picture cards · name cards · teacher's guide" },
      cover:   "/images/thumb-tidslinje.jpg",
      coverEn: "/images/thumb-timeline.jpg",
      // Pakken er for stor for nettstedet (113 MB) og leveres derfor fra skylagring.
      filer: [
        { sprak: "no",
          url: "https://drive.usercontent.google.com/download?id=1n43Ha7f4xu4NW0GS4wj-FgEEzTHKe2zQ&export=download&confirm=t",
          knapp: { no: "Last ned hele pakken (zip, norsk + engelsk)",
                   en: "Download the complete package (zip, Norwegian + English)" } }
      ]
    }

    // ,"neste-produkt-id": { ... samme mønster ... }
  }
};
