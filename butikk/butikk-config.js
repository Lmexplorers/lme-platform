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
    }

    // ,"neste-produkt-id": { ... samme mønster ... }
  }
};
