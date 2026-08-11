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
          knapp: { no: "Last ned oppskriften (PDF)", en: "Download the pattern (PDF)" } },
        { sprak: "en", url: "/butikk/nedlasting/oppskrifter/ro-strikk-en.pdf",
          knapp: { no: "Last ned oppskriften (engelsk PDF)", en: "Download the pattern (PDF)" } }
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
          knapp: { no: "Last ned oppskriften (PDF)", en: "Download the pattern (PDF)" } },
        { sprak: "en", url: "/butikk/nedlasting/oppskrifter/ro-hekle-en.pdf",
          knapp: { no: "Last ned oppskriften (engelsk PDF)", en: "Download the pattern (PDF)" } }
      ]
    },

    "fotballpute-ro-strikk": {
      navn:  { no: "Fotballpute RO RO RO, strikkeoppskrift", en: "RO RO RO football cushion, knitting pattern" },
      undertittel: { no: "Hvit · fotballnett · røde tribuner · RO RO RO · 45×45 cm",
                     en: "White · football net · red terraces · RO RO RO · 45×45 cm" },
      cover:   "/images/oppskrift-fotballpute-ro-strikk.jpg?v=2",
      coverEn: "/images/oppskrift-fotballpute-ro-strikk.jpg?v=2",
      filer: [
        { sprak: "no", url: "/butikk/nedlasting/oppskrifter/fotballpute-ro-strikk.pdf?v=2",
          knapp: { no: "Last ned oppskriften (PDF)", en: "Download the pattern (PDF)" } },
        { sprak: "en", url: "/butikk/nedlasting/oppskrifter/fotballpute-ro-strikk-en.pdf?v=2",
          knapp: { no: "Last ned oppskriften (engelsk PDF)", en: "Download the pattern (PDF)" } }
      ]
    },

    "ellie-hekle": {
      navn:  { no: "Ellie, det lille dådyret - amigurumi", en: "Ellie the Little Fawn - amigurumi" },
      undertittel: { no: "LME Baby Collection · Woodland Dreams · ca. 18-20 cm · avtakbar sløyfe",
                     en: "LME Baby Collection · Woodland Dreams · approx. 18-20 cm · removable bow" },
      cover:   "/images/oppskrift-ellie-hekle.jpg",
      coverEn: "/images/oppskrift-ellie-hekle.jpg",
      filer: [
        { sprak: "no", url: "/butikk/nedlasting/oppskrifter/ellie-hekle.pdf",
          knapp: { no: "Last ned oppskriften (PDF)", en: "Download the pattern (PDF)" } },
        { sprak: "en", url: "/butikk/nedlasting/oppskrifter/ellie-hekle-en.pdf",
          knapp: { no: "Last ned oppskriften (engelsk PDF)", en: "Download the pattern (PDF)" } }
      ]
    },

    "ellies-smokkelenke": {
      navn:  { no: "Ellies smokkelenke - amigurumi", en: "Ellie's Pacifier Clip - amigurumi" },
      undertittel: { no: "LME Baby Collection · Woodland Dreams · maks 22 cm (EN 12586)",
                     en: "LME Baby Collection · Woodland Dreams · max 22 cm (EN 12586)" },
      cover:   "/images/oppskrift-ellies-smokkelenke-2.jpg",
      coverEn: "/images/oppskrift-ellies-smokkelenke-2.jpg",
      filer: [
        { sprak: "no", url: "/butikk/nedlasting/oppskrifter/ellies-smokkelenke.pdf",
          knapp: { no: "Last ned oppskriften (PDF)", en: "Download the pattern (PDF)" } },
        { sprak: "en", url: "/butikk/nedlasting/oppskrifter/ellies-smokkelenke-en.pdf",
          knapp: { no: "Last ned oppskriften (engelsk PDF)", en: "Download the pattern (PDF)" } }
      ]
    },

    "ellies-rangle": {
      navn:  { no: "Ellies rangle - amigurumi", en: "Ellie's Rattle - amigurumi" },
      undertittel: { no: "LME Baby Collection · Woodland Dreams · ca. 13-15 cm · trering",
                     en: "LME Baby Collection · Woodland Dreams · approx. 13-15 cm · wooden ring" },
      cover:   "/images/oppskrift-ellies-rangle-2.jpg",
      coverEn: "/images/oppskrift-ellies-rangle-2.jpg",
      filer: [
        { sprak: "no", url: "/butikk/nedlasting/oppskrifter/ellies-rangle.pdf",
          knapp: { no: "Last ned oppskriften (PDF)", en: "Download the pattern (PDF)" } },
        { sprak: "en", url: "/butikk/nedlasting/oppskrifter/ellies-rangle-en.pdf",
          knapp: { no: "Last ned oppskriften (engelsk PDF)", en: "Download the pattern (PDF)" } }
      ]
    },

    "ellies-vognlenke": {
      navn:  { no: "Ellies vognlenke - amigurumi", en: "Ellie's Stroller Toy - amigurumi" },
      undertittel: { no: "LME Baby Collection · Woodland Dreams · sju motiver · maks 35-40 cm",
                     en: "LME Baby Collection · Woodland Dreams · seven motifs · max 35-40 cm" },
      cover:   "/images/oppskrift-ellies-vognlenke-3.jpg",
      coverEn: "/images/oppskrift-ellies-vognlenke-3.jpg",
      filer: [
        { sprak: "no", url: "/butikk/nedlasting/oppskrifter/ellies-vognlenke.pdf",
          knapp: { no: "Last ned oppskriften (PDF)", en: "Download the pattern (PDF)" } },
        { sprak: "en", url: "/butikk/nedlasting/oppskrifter/ellies-vognlenke-en.pdf",
          knapp: { no: "Last ned oppskriften (engelsk PDF)", en: "Download the pattern (PDF)" } }
      ]
    },

    "ellies-ballerinasko": {
      navn:  { no: "Ellies ballerinasko - amigurumi", en: "Ellie's Ballerina Shoes - amigurumi" },
      undertittel: { no: "LME Baby Collection · Woodland Dreams · fem størrelser · matchende hårsløyfe",
                     en: "LME Baby Collection · Woodland Dreams · five sizes · matching hair bow" },
      cover:   "/images/oppskrift-ellies-ballerinasko-2.jpg",
      coverEn: "/images/oppskrift-ellies-ballerinasko-2.jpg",
      filer: [
        { sprak: "no", url: "/butikk/nedlasting/oppskrifter/ellies-ballerinasko.pdf",
          knapp: { no: "Last ned oppskriften (PDF)", en: "Download the pattern (PDF)" } },
        { sprak: "en", url: "/butikk/nedlasting/oppskrifter/ellies-ballerinasko-en.pdf",
          knapp: { no: "Last ned oppskriften (engelsk PDF)", en: "Download the pattern (PDF)" } }
      ]
    },

    "ellies-aktivitetsleke": {
      navn:  { no: "Ellies aktivitetsleke - amigurumi", en: "Ellie's Activity Toy - amigurumi" },
      undertittel: { no: "LME Baby Collection · Woodland Dreams · babysikkert speil · ca. 11-12 cm",
                     en: "LME Baby Collection · Woodland Dreams · baby-safe mirror · approx. 11-12 cm" },
      cover:   "/images/oppskrift-ellies-aktivitetsleke-2.jpg",
      coverEn: "/images/oppskrift-ellies-aktivitetsleke-2.jpg",
      filer: [
        { sprak: "no", url: "/butikk/nedlasting/oppskrifter/ellies-aktivitetsleke.pdf",
          knapp: { no: "Last ned oppskriften (PDF)", en: "Download the pattern (PDF)" } },
        { sprak: "en", url: "/butikk/nedlasting/oppskrifter/ellies-aktivitetsleke-en.pdf",
          knapp: { no: "Last ned oppskriften (engelsk PDF)", en: "Download the pattern (PDF)" } }
      ]
    },

    "pips-ballerinasko": {
      navn:  { no: "Pips ballerinasko - amigurumi", en: "Pip's Ballerina Shoes - amigurumi" },
      undertittel: { no: "LME Baby Collection · Woodland Dreams · fem størrelser · 17 sider",
                     en: "LME Baby Collection · Woodland Dreams · five sizes · 17 pages" },
      cover:   "/images/oppskrift-pips-ballerinasko.jpg",
      coverEn: "/images/oppskrift-pips-ballerinasko.jpg",
      filer: [
        { sprak: "no", url: "/butikk/nedlasting/oppskrifter/pips-ballerinasko.pdf",
          knapp: { no: "Last ned oppskriften (PDF)", en: "Download the pattern (PDF)" } },
        { sprak: "en", url: "/butikk/nedlasting/oppskrifter/pips-ballerinasko-en.pdf",
          knapp: { no: "Last ned oppskriften (engelsk PDF)", en: "Download the pattern (PDF)" } }
      ]
    },

    "pips-aktivitetsleke": {
      navn:  { no: "Pips aktivitetsleke - amigurumi", en: "Pip's Activity Toy - amigurumi" },
      undertittel: { no: "LME Baby Collection · Woodland Dreams · ca. 11-12 cm · 21 sider",
                     en: "LME Baby Collection · Woodland Dreams · approx. 11-12 cm · 21 pages" },
      cover:   "/images/oppskrift-pips-aktivitetsleke.jpg",
      coverEn: "/images/oppskrift-pips-aktivitetsleke.jpg",
      filer: [
        { sprak: "no", url: "/butikk/nedlasting/oppskrifter/pips-aktivitetsleke.pdf",
          knapp: { no: "Last ned oppskriften (PDF)", en: "Download the pattern (PDF)" } },
        { sprak: "en", url: "/butikk/nedlasting/oppskrifter/pips-aktivitetsleke-en.pdf",
          knapp: { no: "Last ned oppskriften (engelsk PDF)", en: "Download the pattern (PDF)" } }
      ]
    },

    "felix-ballerinasko": {
      navn:  { no: "Felix' ballerinasko - amigurumi", en: "Felix's Ballerina Shoes - amigurumi" },
      undertittel: { no: "LME Baby Collection · Woodland Dreams · fem størrelser · 17 sider",
                     en: "LME Baby Collection · Woodland Dreams · five sizes · 17 pages" },
      cover:   "/images/oppskrift-felix-ballerinasko.jpg",
      coverEn: "/images/oppskrift-felix-ballerinasko.jpg",
      filer: [
        { sprak: "no", url: "/butikk/nedlasting/oppskrifter/felix-ballerinasko.pdf",
          knapp: { no: "Last ned oppskriften (PDF)", en: "Download the pattern (PDF)" } },
        { sprak: "en", url: "/butikk/nedlasting/oppskrifter/felix-ballerinasko-en.pdf",
          knapp: { no: "Last ned oppskriften (engelsk PDF)", en: "Download the pattern (PDF)" } }
      ]
    },

    "felix-aktivitetsleke": {
      navn:  { no: "Felix' aktivitetsleke - amigurumi", en: "Felix's Activity Toy - amigurumi" },
      undertittel: { no: "LME Baby Collection · Woodland Dreams · ca. 11-12 cm · 20 sider",
                     en: "LME Baby Collection · Woodland Dreams · approx. 11-12 cm · 20 pages" },
      cover:   "/images/oppskrift-felix-aktivitetsleke-2.jpg",
      coverEn: "/images/oppskrift-felix-aktivitetsleke-2.jpg",
      filer: [
        { sprak: "no", url: "/butikk/nedlasting/oppskrifter/felix-aktivitetsleke.pdf",
          knapp: { no: "Last ned oppskriften (PDF)", en: "Download the pattern (PDF)" } },
        { sprak: "en", url: "/butikk/nedlasting/oppskrifter/felix-aktivitetsleke-en.pdf",
          knapp: { no: "Last ned oppskriften (engelsk PDF)", en: "Download the pattern (PDF)" } }
      ]
    },

    "mollys-ballerinasko": {
      navn:  { no: "Mollys ballerinasko - amigurumi", en: "Molly's Ballerina Shoes - amigurumi" },
      undertittel: { no: "LME Baby Collection · Woodland Dreams · fem størrelser · 17 sider",
                     en: "LME Baby Collection · Woodland Dreams · five sizes · 17 pages" },
      cover:   "/images/oppskrift-mollys-ballerinasko.jpg",
      coverEn: "/images/oppskrift-mollys-ballerinasko.jpg",
      filer: [
        { sprak: "no", url: "/butikk/nedlasting/oppskrifter/mollys-ballerinasko.pdf",
          knapp: { no: "Last ned oppskriften (PDF)", en: "Download the pattern (PDF)" } },
        { sprak: "en", url: "/butikk/nedlasting/oppskrifter/mollys-ballerinasko-en.pdf",
          knapp: { no: "Last ned oppskriften (engelsk PDF)", en: "Download the pattern (PDF)" } }
      ]
    },

    "mollys-aktivitetsleke": {
      navn:  { no: "Mollys aktivitetsleke - amigurumi", en: "Molly's Activity Toy - amigurumi" },
      undertittel: { no: "LME Baby Collection · Woodland Dreams · ca. 11-12 cm · 20 sider",
                     en: "LME Baby Collection · Woodland Dreams · approx. 11-12 cm · 20 pages" },
      cover:   "/images/oppskrift-mollys-aktivitetsleke.jpg",
      coverEn: "/images/oppskrift-mollys-aktivitetsleke.jpg",
      filer: [
        { sprak: "no", url: "/butikk/nedlasting/oppskrifter/mollys-aktivitetsleke.pdf",
          knapp: { no: "Last ned oppskriften (PDF)", en: "Download the pattern (PDF)" } },
        { sprak: "en", url: "/butikk/nedlasting/oppskrifter/mollys-aktivitetsleke-en.pdf",
          knapp: { no: "Last ned oppskriften (engelsk PDF)", en: "Download the pattern (PDF)" } }
      ]
    },

    "lunas-ballerinasko": {
      navn:  { no: "Lunas ballerinasko - amigurumi", en: "Luna's Ballerina Shoes - amigurumi" },
      undertittel: { no: "LME Baby Collection · Woodland Dreams · fem størrelser · 17 sider",
                     en: "LME Baby Collection · Woodland Dreams · five sizes · 17 pages" },
      cover:   "/images/oppskrift-lunas-ballerinasko.jpg",
      coverEn: "/images/oppskrift-lunas-ballerinasko.jpg",
      filer: [
        { sprak: "no", url: "/butikk/nedlasting/oppskrifter/lunas-ballerinasko.pdf",
          knapp: { no: "Last ned oppskriften (PDF)", en: "Download the pattern (PDF)" } },
        { sprak: "en", url: "/butikk/nedlasting/oppskrifter/lunas-ballerinasko-en.pdf",
          knapp: { no: "Last ned oppskriften (engelsk PDF)", en: "Download the pattern (PDF)" } }
      ]
    },

    "lunas-aktivitetsleke": {
      navn:  { no: "Lunas aktivitetsleke - amigurumi", en: "Luna's Activity Toy - amigurumi" },
      undertittel: { no: "LME Baby Collection · Woodland Dreams · ca. 11-12 cm · 20 sider",
                     en: "LME Baby Collection · Woodland Dreams · approx. 11-12 cm · 20 pages" },
      cover:   "/images/oppskrift-lunas-aktivitetsleke.jpg",
      coverEn: "/images/oppskrift-lunas-aktivitetsleke.jpg",
      filer: [
        { sprak: "no", url: "/butikk/nedlasting/oppskrifter/lunas-aktivitetsleke.pdf",
          knapp: { no: "Last ned oppskriften (PDF)", en: "Download the pattern (PDF)" } },
        { sprak: "en", url: "/butikk/nedlasting/oppskrifter/lunas-aktivitetsleke-en.pdf",
          knapp: { no: "Last ned oppskriften (engelsk PDF)", en: "Download the pattern (PDF)" } }
      ]
    },

    "olivers-ballerinasko": {
      navn:  { no: "Olivers ballerinasko - amigurumi", en: "Oliver's Ballerina Shoes - amigurumi" },
      undertittel: { no: "LME Baby Collection · Woodland Dreams · fem størrelser · 15 sider",
                     en: "LME Baby Collection · Woodland Dreams · five sizes · 15 pages" },
      cover:   "/images/oppskrift-olivers-ballerinasko.jpg",
      coverEn: "/images/oppskrift-olivers-ballerinasko.jpg",
      filer: [
        { sprak: "no", url: "/butikk/nedlasting/oppskrifter/olivers-ballerinasko.pdf",
          knapp: { no: "Last ned oppskriften (PDF)", en: "Download the pattern (PDF)" } },
        { sprak: "en", url: "/butikk/nedlasting/oppskrifter/olivers-ballerinasko-en.pdf",
          knapp: { no: "Last ned oppskriften (engelsk PDF)", en: "Download the pattern (PDF)" } }
      ]
    },

    "olivers-aktivitetsleke": {
      navn:  { no: "Olivers aktivitetsleke - amigurumi", en: "Oliver's Activity Toy - amigurumi" },
      undertittel: { no: "LME Baby Collection · Woodland Dreams · ca. 11-12 cm · 20 sider",
                     en: "LME Baby Collection · Woodland Dreams · approx. 11-12 cm · 20 pages" },
      cover:   "/images/oppskrift-olivers-aktivitetsleke.jpg",
      coverEn: "/images/oppskrift-olivers-aktivitetsleke.jpg",
      filer: [
        { sprak: "no", url: "/butikk/nedlasting/oppskrifter/olivers-aktivitetsleke.pdf",
          knapp: { no: "Last ned oppskriften (PDF)", en: "Download the pattern (PDF)" } },
        { sprak: "en", url: "/butikk/nedlasting/oppskrifter/olivers-aktivitetsleke-en.pdf",
          knapp: { no: "Last ned oppskriften (engelsk PDF)", en: "Download the pattern (PDF)" } }
      ]
    },

    "norway-strikk": {
      navn:  { no: "NORWAY-bøttehatt, strikkeoppskrift", en: "NORWAY bucket hat, knitting pattern" },
      undertittel: { no: "Rød hatt · NORWAY foran · RO og bølger bak · én størrelse (pinnen graderer)",
                     en: "Red hat · NORWAY front · RO and waves back · one size (needle graded)" },
      cover:   "/images/oppskrift-norway-strikk.jpg",
      coverEn: "/images/oppskrift-norway-strikk.jpg",
      filer: [
        { sprak: "no", url: "/butikk/nedlasting/oppskrifter/norway-strikk.pdf",
          knapp: { no: "Last ned oppskriften (PDF)", en: "Download the pattern (PDF)" } },
        { sprak: "en", url: "/butikk/nedlasting/oppskrifter/norway-strikk-en.pdf",
          knapp: { no: "Last ned oppskriften (engelsk PDF)", en: "Download the pattern (PDF)" } }
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
          knapp: { no: "Last ned oppskriften (PDF)", en: "Download the pattern (PDF)" } },
        { sprak: "en", url: "/butikk/nedlasting/oppskrifter/norway-hekle-en.pdf",
          knapp: { no: "Last ned oppskriften (engelsk PDF)", en: "Download the pattern (PDF)" } }
      ]
    },

    "norge-strikk": {
      navn:  { no: "NORGE-bøttehatt (maskesting), strikkeoppskrift", en: "NORGE bucket hat (duplicate stitch), knitting pattern" },
      undertittel: { no: "Rød hatt · NORGE foran · RO og bølger bak · brodert på · én størrelse (pinnen graderer)",
                     en: "Red hat · NORGE front · RO and waves back · embroidered on · one size (needle graded)" },
      cover:   "/images/oppskrift-norge-strikk-foto.jpg",
      coverEn: "/images/oppskrift-norge-strikk-foto.jpg",
      filer: [
        { sprak: "no", url: "/butikk/nedlasting/oppskrifter/norge-strikk.pdf",
          knapp: { no: "Last ned oppskriften (PDF)", en: "Download the pattern (PDF)" } },
        { sprak: "en", url: "/butikk/nedlasting/oppskrifter/norge-strikk-en.pdf",
          knapp: { no: "Last ned oppskriften (engelsk PDF)", en: "Download the pattern (PDF)" } }
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
          knapp: { no: "Last ned oppskriften (PDF)", en: "Download the pattern (PDF)" } },
        { sprak: "en", url: "/butikk/nedlasting/oppskrifter/norge-blokk-en.pdf",
          knapp: { no: "Last ned oppskriften (engelsk PDF)", en: "Download the pattern (PDF)" } }
      ]
    },

    "norge-innstrikket": {
      navn:  { no: "NORGE-bøttehatt (innstrikket), strikkeoppskrift", en: "NORGE bucket hat (knitted in), knitting pattern" },
      undertittel: { no: "Rød hatt · NORGE foran · RO og bølger bak · innstrikket · én størrelse (pinnen graderer)",
                     en: "Red hat · NORGE front · RO and waves back · knitted in · one size (needle graded)" },
      cover:   "/images/oppskrift-norge-strikk-foto.jpg",
      coverEn: "/images/oppskrift-norge-strikk-foto.jpg",
      filer: [
        { sprak: "no", url: "/butikk/nedlasting/oppskrifter/norge-innstrikket.pdf",
          knapp: { no: "Last ned oppskriften (PDF)", en: "Download the pattern (PDF)" } },
        { sprak: "en", url: "/butikk/nedlasting/oppskrifter/norge-innstrikket-en.pdf",
          knapp: { no: "Last ned oppskriften (engelsk PDF)", en: "Download the pattern (PDF)" } }
      ]
    },

    "norge-rune": {
      navn:  { no: "NORGE-runehatt, hekleoppskrift", en: "NORWAY rune hat, crochet pattern" },
      undertittel: { no: "Rød hatt · NORGE/NORWAY i runeskrift · stripet brem · staver · barn til herre",
                     en: "Red hat · NORGE/NORWAY in runes · striped brim · double crochet · child to man" },
      cover:   "/images/oppskrift-norge-rune.jpg?v=2",
      coverEn: "/images/oppskrift-norge-rune.jpg?v=2",
      filer: [
        { sprak: "no", url: "/butikk/nedlasting/oppskrifter/norge-rune.pdf",
          knapp: { no: "Last ned oppskriften (PDF)", en: "Download the pattern (PDF)" } },
        { sprak: "en", url: "/butikk/nedlasting/oppskrifter/norge-rune-en.pdf",
          knapp: { no: "Last ned oppskriften (engelsk PDF)", en: "Download the pattern (PDF)" } }
      ]
    },

    "norge-hekle": {
      navn:  { no: "NORGE-bøttehatt, hekleoppskrift", en: "NORGE bucket hat, crochet pattern" },
      undertittel: { no: "Rød hatt · NORGE i blokkbokstaver · flagg · voksen",
                     en: "Red hat · NORGE in block letters · flag · adult" },
      cover:   "/images/oppskrift-norge-hekle-foto.jpg",
      coverEn: "/images/oppskrift-norge-hekle-foto.jpg",
      filer: [
        { sprak: "no", url: "/butikk/nedlasting/oppskrifter/norge-hekle.pdf",
          knapp: { no: "Last ned oppskriften (PDF)", en: "Download the pattern (PDF)" } },
        { sprak: "en", url: "/butikk/nedlasting/oppskrifter/norge-hekle-en.pdf",
          knapp: { no: "Last ned oppskriften (engelsk PDF)", en: "Download the pattern (PDF)" } }
      ]
    },

    "norge-skaut": {
      navn:  { no: "Norge-skaut, strikkeoppskrift", en: "Norway kerchief, knitting pattern" },
      undertittel: { no: "Trekantskaut · flagg foran eller bak · I-cord-snorer",
                     en: "Triangular kerchief · flag front or back · I-cord ties" },
      cover:   "/images/oppskrift-skaut-strikk.jpg",
      coverEn: "/images/oppskrift-skaut-strikk.jpg",
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
          knapp: { no: "NORGE, innstrikket (PDF)", en: "NORGE, knitted in (PDF)" } },
        { sprak: "en", url: "/butikk/nedlasting/oppskrifter/norge-strikk-en.pdf",
          knapp: { no: "NORGE, maskesting (engelsk PDF)", en: "NORGE, duplicate stitch (PDF)" } },
        { sprak: "en", url: "/butikk/nedlasting/oppskrifter/norge-blokk-en.pdf",
          knapp: { no: "NORGE, blokkbokstaver (engelsk PDF)", en: "NORGE, block letters (PDF)" } },
        { sprak: "en", url: "/butikk/nedlasting/oppskrifter/norge-innstrikket-en.pdf",
          knapp: { no: "NORGE, innstrikket (engelsk PDF)", en: "NORGE, knitted in (PDF)" } }
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
          knapp: { no: "Norge-skaut, hekle (PDF)", en: "Norway kerchief, crochet (PDF)" } },
        { sprak: "en", url: "/butikk/nedlasting/oppskrifter/ro-hekle-en.pdf",
          knapp: { no: "RO-bøttehatt, hekle (engelsk PDF)", en: "RO bucket hat, crochet (PDF)" } },
        { sprak: "en", url: "/butikk/nedlasting/oppskrifter/norway-hekle-en.pdf",
          knapp: { no: "NORWAY-bøttehatt, hekle (engelsk PDF)", en: "NORWAY bucket hat, crochet (PDF)" } },
        { sprak: "en", url: "/butikk/nedlasting/oppskrifter/norge-hekle-en.pdf",
          knapp: { no: "NORGE-bøttehatt, hekle (engelsk PDF)", en: "NORGE bucket hat, crochet (PDF)" } },
        { sprak: "en", url: "/butikk/nedlasting/oppskrifter/norge-skaut-hekle-en.pdf",
          knapp: { no: "Norge-skaut, hekle (engelsk PDF)", en: "Norway kerchief, crochet (PDF)" } }
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
          knapp: { no: "Norge-skaut (PDF)", en: "Norway kerchief (PDF)" } },
        { sprak: "en", url: "/butikk/nedlasting/oppskrifter/ro-strikk-en.pdf",
          knapp: { no: "RO-bøttehatt, strikk (engelsk PDF)", en: "RO bucket hat, knit (PDF)" } },
        { sprak: "en", url: "/butikk/nedlasting/oppskrifter/norway-strikk-en.pdf",
          knapp: { no: "NORWAY-bøttehatt, strikk (engelsk PDF)", en: "NORWAY bucket hat, knit (PDF)" } },
        { sprak: "en", url: "/butikk/nedlasting/oppskrifter/norge-strikk-en.pdf",
          knapp: { no: "NORGE, maskesting (engelsk PDF)", en: "NORGE, duplicate stitch (PDF)" } },
        { sprak: "en", url: "/butikk/nedlasting/oppskrifter/norge-blokk-en.pdf",
          knapp: { no: "NORGE, blokkbokstaver (engelsk PDF)", en: "NORGE, block letters (PDF)" } },
        { sprak: "en", url: "/butikk/nedlasting/oppskrifter/norge-innstrikket-en.pdf",
          knapp: { no: "NORGE, innstrikket (engelsk PDF)", en: "NORGE, knitted in (PDF)" } },
        { sprak: "en", url: "/butikk/nedlasting/oppskrifter/norge-skaut-en.pdf",
          knapp: { no: "Norge-skaut (engelsk PDF)", en: "Norway kerchief (PDF)" } }
      ]
    },

    "pip-hekle": {
      navn:  { no: "Pip, det lille pinnsvinet - amigurumi", en: "Pip the Little Hedgehog - amigurumi" },
      undertittel: { no: "LME Baby Collection · Woodland Dreams · ca. 18-20 cm · 20 sider",
                     en: "LME Baby Collection · Woodland Dreams · approx. 18-20 cm · 20 pages" },
      cover:   "/images/oppskrift-pip-hekle.jpg",
      coverEn: "/images/oppskrift-pip-hekle.jpg",
      filer: [
        { sprak: "no", url: "/butikk/nedlasting/oppskrifter/pip-hekle.pdf",
          knapp: { no: "Last ned oppskriften (PDF)", en: "Download the pattern (PDF)" } },
        { sprak: "en", url: "/butikk/nedlasting/oppskrifter/pip-hekle-en.pdf",
          knapp: { no: "Last ned oppskriften (engelsk PDF)", en: "Download the pattern (PDF)" } }
      ]
    },

    "felix-hekle": {
      navn:  { no: "Felix, den lille reven - amigurumi", en: "Felix the Little Fox - amigurumi" },
      undertittel: { no: "LME Baby Collection · Woodland Dreams · ca. 18-20 cm · 20 sider",
                     en: "LME Baby Collection · Woodland Dreams · approx. 18-20 cm · 20 pages" },
      cover:   "/images/oppskrift-felix-hekle.jpg",
      coverEn: "/images/oppskrift-felix-hekle.jpg",
      filer: [
        { sprak: "no", url: "/butikk/nedlasting/oppskrifter/felix-hekle.pdf",
          knapp: { no: "Last ned oppskriften (PDF)", en: "Download the pattern (PDF)" } },
        { sprak: "en", url: "/butikk/nedlasting/oppskrifter/felix-hekle-en.pdf",
          knapp: { no: "Last ned oppskriften (engelsk PDF)", en: "Download the pattern (PDF)" } }
      ]
    },

    "molly-hekle": {
      navn:  { no: "Molly, det lille lammet - amigurumi", en: "Molly the Little Lamb - amigurumi" },
      undertittel: { no: "LME Baby Collection · Woodland Dreams · ca. 18-20 cm · 20 sider",
                     en: "LME Baby Collection · Woodland Dreams · approx. 18-20 cm · 20 pages" },
      cover:   "/images/oppskrift-molly-hekle.jpg",
      coverEn: "/images/oppskrift-molly-hekle.jpg",
      filer: [
        { sprak: "no", url: "/butikk/nedlasting/oppskrifter/molly-hekle.pdf",
          knapp: { no: "Last ned oppskriften (PDF)", en: "Download the pattern (PDF)" } },
        { sprak: "en", url: "/butikk/nedlasting/oppskrifter/molly-hekle-en.pdf",
          knapp: { no: "Last ned oppskriften (engelsk PDF)", en: "Download the pattern (PDF)" } }
      ]
    },

    "luna-hekle": {
      navn:  { no: "Luna, den lille kaninen - amigurumi", en: "Luna the Little Bunny - amigurumi" },
      undertittel: { no: "LME Baby Collection · Woodland Dreams · ca. 18-20 cm · 20 sider",
                     en: "LME Baby Collection · Woodland Dreams · approx. 18-20 cm · 20 pages" },
      cover:   "/images/oppskrift-luna-hekle.jpg",
      coverEn: "/images/oppskrift-luna-hekle.jpg",
      filer: [
        { sprak: "no", url: "/butikk/nedlasting/oppskrifter/luna-hekle.pdf",
          knapp: { no: "Last ned oppskriften (PDF)", en: "Download the pattern (PDF)" } },
        { sprak: "en", url: "/butikk/nedlasting/oppskrifter/luna-hekle-en.pdf",
          knapp: { no: "Last ned oppskriften (engelsk PDF)", en: "Download the pattern (PDF)" } }
      ]
    },

    "oliver-hekle": {
      navn:  { no: "Oliver, den lille bjørnen - amigurumi", en: "Oliver the Little Bear - amigurumi" },
      undertittel: { no: "LME Baby Collection · Woodland Dreams · ca. 18-20 cm · 19 sider",
                     en: "LME Baby Collection · Woodland Dreams · approx. 18-20 cm · 19 pages" },
      cover:   "/images/oppskrift-oliver-hekle.jpg",
      coverEn: "/images/oppskrift-oliver-hekle.jpg",
      filer: [
        { sprak: "no", url: "/butikk/nedlasting/oppskrifter/oliver-hekle.pdf",
          knapp: { no: "Last ned oppskriften (PDF)", en: "Download the pattern (PDF)" } },
        { sprak: "en", url: "/butikk/nedlasting/oppskrifter/oliver-hekle-en.pdf",
          knapp: { no: "Last ned oppskriften (engelsk PDF)", en: "Download the pattern (PDF)" } }
      ]
    },

    "pips-smokkelenke": {
      navn:  { no: "Pips smokkelenke", en: "Pip's pacifier clip" },
      undertittel: { no: "LME Baby Collection · Woodland Dreams · maks 22 cm · 14 sider",
                     en: "LME Baby Collection · Woodland Dreams · max 22 cm · 14 pages" },
      cover:   "/images/oppskrift-pips-smokkelenke-3.jpg",
      coverEn: "/images/oppskrift-pips-smokkelenke-3.jpg",
      filer: [
        { sprak: "no", url: "/butikk/nedlasting/oppskrifter/pips-smokkelenke.pdf",
          knapp: { no: "Last ned oppskriften (PDF)", en: "Download the pattern (PDF)" } },
        { sprak: "en", url: "/butikk/nedlasting/oppskrifter/pips-smokkelenke-en.pdf",
          knapp: { no: "Last ned oppskriften (engelsk PDF)", en: "Download the pattern (PDF)" } }
      ]
    },

    "felix-smokkelenke": {
      navn:  { no: "Felix' smokkelenke", en: "Felix's pacifier clip" },
      undertittel: { no: "LME Baby Collection · Woodland Dreams · maks 22 cm · 14 sider",
                     en: "LME Baby Collection · Woodland Dreams · max 22 cm · 14 pages" },
      cover:   "/images/oppskrift-felix-smokkelenke-3.jpg",
      coverEn: "/images/oppskrift-felix-smokkelenke-3.jpg",
      filer: [
        { sprak: "no", url: "/butikk/nedlasting/oppskrifter/felix-smokkelenke.pdf",
          knapp: { no: "Last ned oppskriften (PDF)", en: "Download the pattern (PDF)" } },
        { sprak: "en", url: "/butikk/nedlasting/oppskrifter/felix-smokkelenke-en.pdf",
          knapp: { no: "Last ned oppskriften (engelsk PDF)", en: "Download the pattern (PDF)" } }
      ]
    },

    "mollys-smokkelenke": {
      navn:  { no: "Mollys smokkelenke", en: "Molly's pacifier clip" },
      undertittel: { no: "LME Baby Collection · Woodland Dreams · maks 22 cm · 14 sider",
                     en: "LME Baby Collection · Woodland Dreams · max 22 cm · 14 pages" },
      cover:   "/images/oppskrift-mollys-smokkelenke-2.jpg",
      coverEn: "/images/oppskrift-mollys-smokkelenke-2.jpg",
      filer: [
        { sprak: "no", url: "/butikk/nedlasting/oppskrifter/mollys-smokkelenke.pdf",
          knapp: { no: "Last ned oppskriften (PDF)", en: "Download the pattern (PDF)" } },
        { sprak: "en", url: "/butikk/nedlasting/oppskrifter/mollys-smokkelenke-en.pdf",
          knapp: { no: "Last ned oppskriften (engelsk PDF)", en: "Download the pattern (PDF)" } }
      ]
    },

    "lunas-smokkelenke": {
      navn:  { no: "Lunas smokkelenke", en: "Luna's pacifier clip" },
      undertittel: { no: "LME Baby Collection · Woodland Dreams · maks 22 cm · 14 sider",
                     en: "LME Baby Collection · Woodland Dreams · max 22 cm · 14 pages" },
      cover:   "/images/oppskrift-lunas-smokkelenke-2.jpg",
      coverEn: "/images/oppskrift-lunas-smokkelenke-2.jpg",
      filer: [
        { sprak: "no", url: "/butikk/nedlasting/oppskrifter/lunas-smokkelenke.pdf",
          knapp: { no: "Last ned oppskriften (PDF)", en: "Download the pattern (PDF)" } },
        { sprak: "en", url: "/butikk/nedlasting/oppskrifter/lunas-smokkelenke-en.pdf",
          knapp: { no: "Last ned oppskriften (engelsk PDF)", en: "Download the pattern (PDF)" } }
      ]
    },

    "olivers-smokkelenke": {
      navn:  { no: "Olivers smokkelenke", en: "Oliver's pacifier clip" },
      undertittel: { no: "LME Baby Collection · Woodland Dreams · maks 22 cm · 13 sider",
                     en: "LME Baby Collection · Woodland Dreams · max 22 cm · 13 pages" },
      cover:   "/images/oppskrift-olivers-smokkelenke-3.jpg",
      coverEn: "/images/oppskrift-olivers-smokkelenke-3.jpg",
      filer: [
        { sprak: "no", url: "/butikk/nedlasting/oppskrifter/olivers-smokkelenke.pdf",
          knapp: { no: "Last ned oppskriften (PDF)", en: "Download the pattern (PDF)" } },
        { sprak: "en", url: "/butikk/nedlasting/oppskrifter/olivers-smokkelenke-en.pdf",
          knapp: { no: "Last ned oppskriften (engelsk PDF)", en: "Download the pattern (PDF)" } }
      ]
    },

    "pips-rangle": {
      navn:  { no: "Pips rangle", en: "Pip's rattle" },
      undertittel: { no: "LME Baby Collection · Woodland Dreams · ca. 13-15 cm · 13 sider",
                     en: "LME Baby Collection · Woodland Dreams · approx. 13-15 cm · 13 pages" },
      cover:   "/images/oppskrift-pips-rangle-2.jpg",
      coverEn: "/images/oppskrift-pips-rangle-2.jpg",
      filer: [
        { sprak: "no", url: "/butikk/nedlasting/oppskrifter/pips-rangle.pdf",
          knapp: { no: "Last ned oppskriften (PDF)", en: "Download the pattern (PDF)" } },
        { sprak: "en", url: "/butikk/nedlasting/oppskrifter/pips-rangle-en.pdf",
          knapp: { no: "Last ned oppskriften (engelsk PDF)", en: "Download the pattern (PDF)" } }
      ]
    },

    "felix-rangle": {
      navn:  { no: "Felix' rangle", en: "Felix's rattle" },
      undertittel: { no: "LME Baby Collection · Woodland Dreams · ca. 13-15 cm · 13 sider",
                     en: "LME Baby Collection · Woodland Dreams · approx. 13-15 cm · 13 pages" },
      cover:   "/images/oppskrift-felix-rangle-2.jpg",
      coverEn: "/images/oppskrift-felix-rangle-2.jpg",
      filer: [
        { sprak: "no", url: "/butikk/nedlasting/oppskrifter/felix-rangle.pdf",
          knapp: { no: "Last ned oppskriften (PDF)", en: "Download the pattern (PDF)" } },
        { sprak: "en", url: "/butikk/nedlasting/oppskrifter/felix-rangle-en.pdf",
          knapp: { no: "Last ned oppskriften (engelsk PDF)", en: "Download the pattern (PDF)" } }
      ]
    },

    "mollys-rangle": {
      navn:  { no: "Mollys rangle", en: "Molly's rattle" },
      undertittel: { no: "LME Baby Collection · Woodland Dreams · ca. 13-15 cm · 13 sider",
                     en: "LME Baby Collection · Woodland Dreams · approx. 13-15 cm · 13 pages" },
      cover:   "/images/oppskrift-mollys-rangle-2.jpg",
      coverEn: "/images/oppskrift-mollys-rangle-2.jpg",
      filer: [
        { sprak: "no", url: "/butikk/nedlasting/oppskrifter/mollys-rangle.pdf",
          knapp: { no: "Last ned oppskriften (PDF)", en: "Download the pattern (PDF)" } },
        { sprak: "en", url: "/butikk/nedlasting/oppskrifter/mollys-rangle-en.pdf",
          knapp: { no: "Last ned oppskriften (engelsk PDF)", en: "Download the pattern (PDF)" } }
      ]
    },

    "lunas-rangle": {
      navn:  { no: "Lunas rangle", en: "Luna's rattle" },
      undertittel: { no: "LME Baby Collection · Woodland Dreams · ca. 13-15 cm · 13 sider",
                     en: "LME Baby Collection · Woodland Dreams · approx. 13-15 cm · 13 pages" },
      cover:   "/images/oppskrift-lunas-rangle-2.jpg",
      coverEn: "/images/oppskrift-lunas-rangle-2.jpg",
      filer: [
        { sprak: "no", url: "/butikk/nedlasting/oppskrifter/lunas-rangle.pdf",
          knapp: { no: "Last ned oppskriften (PDF)", en: "Download the pattern (PDF)" } },
        { sprak: "en", url: "/butikk/nedlasting/oppskrifter/lunas-rangle-en.pdf",
          knapp: { no: "Last ned oppskriften (engelsk PDF)", en: "Download the pattern (PDF)" } }
      ]
    },

    "olivers-rangle": {
      navn:  { no: "Olivers rangle", en: "Oliver's rattle" },
      undertittel: { no: "LME Baby Collection · Woodland Dreams · ca. 13-15 cm · 13 sider",
                     en: "LME Baby Collection · Woodland Dreams · approx. 13-15 cm · 13 pages" },
      cover:   "/images/oppskrift-olivers-rangle-2.jpg",
      coverEn: "/images/oppskrift-olivers-rangle-2.jpg",
      filer: [
        { sprak: "no", url: "/butikk/nedlasting/oppskrifter/olivers-rangle.pdf",
          knapp: { no: "Last ned oppskriften (PDF)", en: "Download the pattern (PDF)" } },
        { sprak: "en", url: "/butikk/nedlasting/oppskrifter/olivers-rangle-en.pdf",
          knapp: { no: "Last ned oppskriften (engelsk PDF)", en: "Download the pattern (PDF)" } }
      ]
    },

    "pips-vognlenke": {
      navn:  { no: "Pips vognlenke", en: "Pip's stroller toy" },
      undertittel: { no: "LME Baby Collection · Woodland Dreams · maks 35-40 cm · 14 sider",
                     en: "LME Baby Collection · Woodland Dreams · max 35-40 cm · 14 pages" },
      cover:   "/images/oppskrift-pips-vognlenke-2.jpg",
      coverEn: "/images/oppskrift-pips-vognlenke-2.jpg",
      filer: [
        { sprak: "no", url: "/butikk/nedlasting/oppskrifter/pips-vognlenke.pdf",
          knapp: { no: "Last ned oppskriften (PDF)", en: "Download the pattern (PDF)" } },
        { sprak: "en", url: "/butikk/nedlasting/oppskrifter/pips-vognlenke-en.pdf",
          knapp: { no: "Last ned oppskriften (engelsk PDF)", en: "Download the pattern (PDF)" } }
      ]
    },

    "felix-vognlenke": {
      navn:  { no: "Felix' vognlenke", en: "Felix's stroller toy" },
      undertittel: { no: "LME Baby Collection · Woodland Dreams · maks 35-40 cm · 14 sider",
                     en: "LME Baby Collection · Woodland Dreams · max 35-40 cm · 14 pages" },
      cover:   "/images/oppskrift-felix-vognlenke-3.jpg",
      coverEn: "/images/oppskrift-felix-vognlenke-3.jpg",
      filer: [
        { sprak: "no", url: "/butikk/nedlasting/oppskrifter/felix-vognlenke.pdf",
          knapp: { no: "Last ned oppskriften (PDF)", en: "Download the pattern (PDF)" } },
        { sprak: "en", url: "/butikk/nedlasting/oppskrifter/felix-vognlenke-en.pdf",
          knapp: { no: "Last ned oppskriften (engelsk PDF)", en: "Download the pattern (PDF)" } }
      ]
    },

    "mollys-vognlenke": {
      navn:  { no: "Mollys vognlenke", en: "Molly's stroller toy" },
      undertittel: { no: "LME Baby Collection · Woodland Dreams · maks 35-40 cm · 14 sider",
                     en: "LME Baby Collection · Woodland Dreams · max 35-40 cm · 14 pages" },
      cover:   "/images/oppskrift-mollys-vognlenke-2.jpg",
      coverEn: "/images/oppskrift-mollys-vognlenke-2.jpg",
      filer: [
        { sprak: "no", url: "/butikk/nedlasting/oppskrifter/mollys-vognlenke.pdf",
          knapp: { no: "Last ned oppskriften (PDF)", en: "Download the pattern (PDF)" } },
        { sprak: "en", url: "/butikk/nedlasting/oppskrifter/mollys-vognlenke-en.pdf",
          knapp: { no: "Last ned oppskriften (engelsk PDF)", en: "Download the pattern (PDF)" } }
      ]
    },

    "lunas-vognlenke": {
      navn:  { no: "Lunas vognlenke", en: "Luna's stroller toy" },
      undertittel: { no: "LME Baby Collection · Woodland Dreams · maks 35-40 cm · 14 sider",
                     en: "LME Baby Collection · Woodland Dreams · max 35-40 cm · 14 pages" },
      cover:   "/images/oppskrift-lunas-vognlenke-2.jpg",
      coverEn: "/images/oppskrift-lunas-vognlenke-2.jpg",
      filer: [
        { sprak: "no", url: "/butikk/nedlasting/oppskrifter/lunas-vognlenke.pdf",
          knapp: { no: "Last ned oppskriften (PDF)", en: "Download the pattern (PDF)" } },
        { sprak: "en", url: "/butikk/nedlasting/oppskrifter/lunas-vognlenke-en.pdf",
          knapp: { no: "Last ned oppskriften (engelsk PDF)", en: "Download the pattern (PDF)" } }
      ]
    },

    "olivers-vognlenke": {
      navn:  { no: "Olivers vognlenke", en: "Oliver's stroller toy" },
      undertittel: { no: "LME Baby Collection · Woodland Dreams · maks 35-40 cm · 15 sider",
                     en: "LME Baby Collection · Woodland Dreams · max 35-40 cm · 15 pages" },
      cover:   "/images/oppskrift-olivers-vognlenke-2.jpg",
      coverEn: "/images/oppskrift-olivers-vognlenke-2.jpg",
      filer: [
        { sprak: "no", url: "/butikk/nedlasting/oppskrifter/olivers-vognlenke.pdf",
          knapp: { no: "Last ned oppskriften (PDF)", en: "Download the pattern (PDF)" } },
        { sprak: "en", url: "/butikk/nedlasting/oppskrifter/olivers-vognlenke-en.pdf",
          knapp: { no: "Last ned oppskriften (engelsk PDF)", en: "Download the pattern (PDF)" } }
      ]
    },

    "woodland-dreams-bundle": {
      navn:  { no: "Woodland Dreams, hele kolleksjonen (36 oppskrifter)", en: "Woodland Dreams, the complete collection (36 patterns)" },
      undertittel: { no: "LME Baby Collection · Woodland Dreams · 6 karakterer · 36 oppskrifter",
                     en: "LME Baby Collection · Woodland Dreams · 6 characters · 36 patterns" },
      cover:   "/images/oppskrift-woodland-dreams-bundle.jpg",
      coverEn: "/images/oppskrift-woodland-dreams-bundle.jpg",
      // Pakken er delt i tre zip-filer per språk (hver ca. 10-11 MB), fordi Cloudflare Pages
      // har en grense på 25 MB per fil, og én samlet zip ble for stor (28+ MB).
      filer: [
        { sprak: "no", url: "/butikk/nedlasting/oppskrifter/woodland-dreams-bundle-del1-no.zip",
          knapp: { no: "Last ned del 1 av 3 (zip, norsk)", en: "Download part 1 of 3 (zip, Norwegian)" } },
        { sprak: "no", url: "/butikk/nedlasting/oppskrifter/woodland-dreams-bundle-del2-no.zip",
          knapp: { no: "Last ned del 2 av 3 (zip, norsk)", en: "Download part 2 of 3 (zip, Norwegian)" } },
        { sprak: "no", url: "/butikk/nedlasting/oppskrifter/woodland-dreams-bundle-del3-no.zip",
          knapp: { no: "Last ned del 3 av 3 (zip, norsk)", en: "Download part 3 of 3 (zip, Norwegian)" } },
        { sprak: "en", url: "/butikk/nedlasting/oppskrifter/woodland-dreams-bundle-del1-en.zip",
          knapp: { no: "Last ned del 1 av 3 (zip, engelsk)", en: "Download part 1 of 3 (zip, English)" } },
        { sprak: "en", url: "/butikk/nedlasting/oppskrifter/woodland-dreams-bundle-del2-en.zip",
          knapp: { no: "Last ned del 2 av 3 (zip, engelsk)", en: "Download part 2 of 3 (zip, English)" } },
        { sprak: "en", url: "/butikk/nedlasting/oppskrifter/woodland-dreams-bundle-del3-en.zip",
          knapp: { no: "Last ned del 3 av 3 (zip, engelsk)", en: "Download part 3 of 3 (zip, English)" } }
      ]
    },

    // ,"neste-produkt-id": { ... samme mønster ... }
  }
};
