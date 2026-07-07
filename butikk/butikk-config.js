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
    },

    "ro-strikk": {
      navn:  { no: "RO-bøttehatt, strikkeoppskrift", en: "RO bucket hat, knitting pattern" },
      undertittel: { no: "Hvit hatt · blå RO og flagg · bølger · tre størrelser",
                     en: "White hat · blue RO and flag · waves · three sizes" },
      cover:   "/images/oppskrift-ro-strikk.jpg",
      coverEn: "/images/oppskrift-ro-strikk.jpg",
      filer: [
        { sprak: "no", url: "/butikk/nedlasting/oppskrifter/ro-strikk.pdf",
          knapp: { no: "Last ned oppskriften (PDF)", en: "Download the pattern (PDF)" } }
      ]
    },

    "ro-hekle": {
      navn:  { no: "RO-bøttehatt, hekleoppskrift", en: "RO bucket hat, crochet pattern" },
      undertittel: { no: "Hvit hatt · blå RO og flagg · bølger · voksen",
                     en: "White hat · blue RO and flag · waves · adult" },
      cover:   "/images/oppskrift-ro-hekle.jpg",
      coverEn: "/images/oppskrift-ro-hekle.jpg",
      filer: [
        { sprak: "no", url: "/butikk/nedlasting/oppskrifter/ro-hekle.pdf",
          knapp: { no: "Last ned oppskriften (PDF)", en: "Download the pattern (PDF)" } }
      ]
    },

    "norway-strikk": {
      navn:  { no: "NORWAY-bøttehatt, strikkeoppskrift", en: "NORWAY bucket hat, knitting pattern" },
      undertittel: { no: "Rød hatt · NORWAY foran · flagg bak · tre størrelser",
                     en: "Red hat · NORWAY front · flag back · three sizes" },
      cover:   "/images/oppskrift-norway-strikk.jpg",
      coverEn: "/images/oppskrift-norway-strikk.jpg",
      filer: [
        { sprak: "no", url: "/butikk/nedlasting/oppskrifter/norway-strikk.pdf",
          knapp: { no: "Last ned oppskriften (PDF)", en: "Download the pattern (PDF)" } }
      ]
    },

    "norway-hekle": {
      navn:  { no: "NORWAY-bøttehatt, hekleoppskrift", en: "NORWAY bucket hat, crochet pattern" },
      undertittel: { no: "Rød hatt · NORWAY foran · flagg bak · voksen",
                     en: "Red hat · NORWAY front · flag back · adult" },
      cover:   "/images/oppskrift-norway-hekle.png",
      coverEn: "/images/oppskrift-norway-hekle.png",
      filer: [
        { sprak: "no", url: "/butikk/nedlasting/oppskrifter/norway-hekle.pdf",
          knapp: { no: "Last ned oppskriften (PDF)", en: "Download the pattern (PDF)" } }
      ]
    },

    "norge-strikk": {
      navn:  { no: "NORGE-bøttehatt (maskesting), strikkeoppskrift", en: "NORGE bucket hat (duplicate stitch), knitting pattern" },
      undertittel: { no: "Rød hatt · NORGE og flagg foran · RO og bølger bak · tre størrelser",
                     en: "Red hat · NORGE and flag front · RO and waves back · three sizes" },
      cover:   "/images/oppskrift-norge-strikk.jpg",
      coverEn: "/images/oppskrift-norge-strikk.jpg",
      filer: [
        { sprak: "no", url: "/butikk/nedlasting/oppskrifter/norge-strikk.pdf",
          knapp: { no: "Last ned oppskriften (PDF)", en: "Download the pattern (PDF)" } }
      ]
    },

    "norge-blokk": {
      navn:  { no: "NORGE-bøttehatt (blokkbokstaver), strikkeoppskrift", en: "NORGE bucket hat (block letters), knitting pattern" },
      undertittel: { no: "Rød hatt · NORGE i blokkbokstaver · flagg bak · tre størrelser",
                     en: "Red hat · NORGE in block letters · flag back · three sizes" },
      cover:   "/images/oppskrift-norge-blokk.jpg",
      coverEn: "/images/oppskrift-norge-blokk.jpg",
      filer: [
        { sprak: "no", url: "/butikk/nedlasting/oppskrifter/norge-blokk.pdf",
          knapp: { no: "Last ned oppskriften (PDF)", en: "Download the pattern (PDF)" } }
      ]
    },

    "norge-innstrikket": {
      navn:  { no: "NORGE-bøttehatt (innstrikket), strikkeoppskrift", en: "NORGE bucket hat (knitted in), knitting pattern" },
      undertittel: { no: "Rød hatt · NORGE, flagg, RO og bølger innstrikket · tre størrelser",
                     en: "Red hat · NORGE, flag, RO and waves knitted in · three sizes" },
      cover:   "/images/oppskrift-norge-innstrikket.jpg",
      coverEn: "/images/oppskrift-norge-innstrikket.jpg",
      filer: [
        { sprak: "no", url: "/butikk/nedlasting/oppskrifter/norge-innstrikket.pdf",
          knapp: { no: "Last ned oppskriften (PDF)", en: "Download the pattern (PDF)" } }
      ]
    },

    "norge-hekle": {
      navn:  { no: "NORGE-bøttehatt, hekleoppskrift", en: "NORGE bucket hat, crochet pattern" },
      undertittel: { no: "Rød hatt · NORGE i blokkbokstaver · flagg · voksen",
                     en: "Red hat · NORGE in block letters · flag · adult" },
      cover:   "/images/oppskrift-norge-hekle.jpg",
      coverEn: "/images/oppskrift-norge-hekle.jpg",
      filer: [
        { sprak: "no", url: "/butikk/nedlasting/oppskrifter/norge-hekle.pdf",
          knapp: { no: "Last ned oppskriften (PDF)", en: "Download the pattern (PDF)" } }
      ]
    },

    "norge-skaut": {
      navn:  { no: "Norge-skaut, strikkeoppskrift", en: "Norway kerchief, knitting pattern" },
      undertittel: { no: "Trekantskaut · flagg foran eller bak · I-cord-snorer",
                     en: "Triangular kerchief · flag front or back · I-cord ties" },
      cover:   "/images/oppskrift-skaut.jpg",
      coverEn: "/images/oppskrift-skaut.jpg",
      filer: [
        { sprak: "no", url: "/butikk/nedlasting/oppskrifter/norge-skaut.pdf",
          knapp: { no: "Last ned oppskriften (PDF)", en: "Download the pattern (PDF)" } },
        { sprak: "en", url: "/butikk/nedlasting/oppskrifter/norge-skaut-en.pdf",
          knapp: { no: "Last ned oppskriften (engelsk PDF)", en: "Download the pattern (PDF)" } }
      ]
    },

    "norge-skaut-hekle": {
      navn:  { no: "Norge-skaut, hekleoppskrift", en: "Norway kerchief, crochet pattern" },
      undertittel: { no: "Trekantskaut · flagg foran eller bak · heklede snorer",
                     en: "Triangular kerchief · flag front or back · crocheted ties" },
      cover:   "/images/oppskrift-skaut-hekle.jpg",
      coverEn: "/images/oppskrift-skaut-hekle.jpg",
      filer: [
        { sprak: "no", url: "/butikk/nedlasting/oppskrifter/norge-skaut-hekle.pdf",
          knapp: { no: "Last ned oppskriften (PDF)", en: "Download the pattern (PDF)" } },
        { sprak: "en", url: "/butikk/nedlasting/oppskrifter/norge-skaut-hekle-en.pdf",
          knapp: { no: "Last ned oppskriften (engelsk PDF)", en: "Download the pattern (PDF)" } }
      ]
    },

    "norge-pakke": {
      navn:  { no: "NORGE-bøttehatt, alle 3 strikkevariantene", en: "NORGE bucket hat, all 3 knitting versions" },
      undertittel: { no: "Pakke · maskesting + blokkbokstaver + innstrikket",
                     en: "Bundle · duplicate stitch + block letters + knitted in" },
      cover:   "/images/oppskrift-norge-blokk.jpg",
      coverEn: "/images/oppskrift-norge-blokk.jpg",
      filer: [
        { sprak: "no", url: "/butikk/nedlasting/oppskrifter/norge-strikk.pdf",
          knapp: { no: "NORGE, maskesting (PDF)", en: "NORGE, duplicate stitch (PDF)" } },
        { sprak: "no", url: "/butikk/nedlasting/oppskrifter/norge-blokk.pdf",
          knapp: { no: "NORGE, blokkbokstaver (PDF)", en: "NORGE, block letters (PDF)" } },
        { sprak: "no", url: "/butikk/nedlasting/oppskrifter/norge-innstrikket.pdf",
          knapp: { no: "NORGE, innstrikket (PDF)", en: "NORGE, knitted in (PDF)" } }
      ]
    },

    "hekle-pakke": {
      navn:  { no: "Alle hekleoppskriftene, pakke", en: "All crochet patterns, bundle" },
      undertittel: { no: "Pakke · RO + NORWAY + NORGE + skaut i hekleutgave",
                     en: "Bundle · RO + NORWAY + NORGE + kerchief in crochet" },
      cover:   "/images/oppskrift-ro-hekle.jpg",
      coverEn: "/images/oppskrift-ro-hekle.jpg",
      filer: [
        { sprak: "no", url: "/butikk/nedlasting/oppskrifter/ro-hekle.pdf",
          knapp: { no: "RO-bøttehatt, hekle (PDF)", en: "RO bucket hat, crochet (PDF)" } },
        { sprak: "no", url: "/butikk/nedlasting/oppskrifter/norway-hekle.pdf",
          knapp: { no: "NORWAY-bøttehatt, hekle (PDF)", en: "NORWAY bucket hat, crochet (PDF)" } },
        { sprak: "no", url: "/butikk/nedlasting/oppskrifter/norge-hekle.pdf",
          knapp: { no: "NORGE-bøttehatt, hekle (PDF)", en: "NORGE bucket hat, crochet (PDF)" } },
        { sprak: "no", url: "/butikk/nedlasting/oppskrifter/norge-skaut-hekle.pdf",
          knapp: { no: "Norge-skaut, hekle (PDF)", en: "Norway kerchief, crochet (PDF)" } }
      ]
    },

    "strikk-pakke": {
      navn:  { no: "Alle strikkeoppskriftene, pakke", en: "All knitting patterns, bundle" },
      undertittel: { no: "Pakke · RO + NORWAY + NORGE (3) + skaut",
                     en: "Bundle · RO + NORWAY + NORGE (3) + kerchief" },
      cover:   "/images/oppskrift-ro-strikk.jpg",
      coverEn: "/images/oppskrift-ro-strikk.jpg",
      filer: [
        { sprak: "no", url: "/butikk/nedlasting/oppskrifter/ro-strikk.pdf",
          knapp: { no: "RO-bøttehatt, strikk (PDF)", en: "RO bucket hat, knit (PDF)" } },
        { sprak: "no", url: "/butikk/nedlasting/oppskrifter/norway-strikk.pdf",
          knapp: { no: "NORWAY-bøttehatt, strikk (PDF)", en: "NORWAY bucket hat, knit (PDF)" } },
        { sprak: "no", url: "/butikk/nedlasting/oppskrifter/norge-strikk.pdf",
          knapp: { no: "NORGE, maskesting (PDF)", en: "NORGE, duplicate stitch (PDF)" } },
        { sprak: "no", url: "/butikk/nedlasting/oppskrifter/norge-blokk.pdf",
          knapp: { no: "NORGE, blokkbokstaver (PDF)", en: "NORGE, block letters (PDF)" } },
        { sprak: "no", url: "/butikk/nedlasting/oppskrifter/norge-innstrikket.pdf",
          knapp: { no: "NORGE, innstrikket (PDF)", en: "NORGE, knitted in (PDF)" } },
        { sprak: "no", url: "/butikk/nedlasting/oppskrifter/norge-skaut.pdf",
          knapp: { no: "Norge-skaut (PDF)", en: "Norway kerchief (PDF)" } }
      ]
    }

    // ,"neste-produkt-id": { ... samme mønster ... }
  }
};
