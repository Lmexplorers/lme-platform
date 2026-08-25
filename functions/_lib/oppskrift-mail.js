/**
 * Oppskrifter (bøttehatt/skaut) — automatiske e-poster via MailerSend.
 *
 * Sender leveringsmail (med oppskrift + mersalg) rett etter kjøp, og to
 * oppfølgere (etter noen dager og et par uker) fra KV-køen. Norsk for
 * NOK-lenker, engelsk for USD-lenker. Bruker samme MailerSend-oppsett som
 * Claude-kurset (env MAILERSEND_API_KEY, avsender renate@lmexplorers.com).
 */

const MS = "https://api.mailersend.com/v1/email";
const SITE = "https://lmexplorers.com";
const SHOP = SITE + "/butikk";
const DL = SITE + "/butikk/nedlasting/oppskrifter/";
const FROM_EMAIL = "renate@lmexplorers.com";
const FROM_NAME = "Renate Dahl";

function esc(s) {
  return (s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
function wrap(inner) {
  return '<!DOCTYPE html><html><head><meta charset="utf-8">' +
    '<link href="https://fonts.googleapis.com/css2?family=Playpen+Sans:wght@400;600;700&display=swap" rel="stylesheet">' +
    "<style>@font-face{font-family:'Sasson Montessori';src:url('" + SITE + "/fonts/SassoonMontessori.woff2') format('woff2');font-display:swap;}</style>" +
    '</head>' +
    '<body style="margin:0;background:#FBF7F0;font-family:\'Sasson Montessori\',\'Playpen Sans\',Arial,Helvetica,sans-serif;color:#1F1B24;">' +
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#FBF7F0;padding:24px 0;"><tr><td align="center">' +
    '<table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:18px;overflow:hidden;">' +
    '<tr><td style="padding:28px 32px 6px;text-align:center;"><img src="' + SITE + '/images/lme-logo.png" alt="Little Montessori Explorers" width="120" style="width:120px;height:auto;"></td></tr>' +
    '<tr><td style="padding:6px 32px 30px;font-size:16px;line-height:1.65;color:#3a343f;">' + inner + '</td></tr>' +
    '</table>' +
    '<div style="max-width:560px;color:#938E99;font-size:12px;padding:16px;">Little Montessori Explorers · Renate Dahl · Tønsberg</div>' +
    '</td></tr></table></body></html>';
}
function btn(href, label) {
  return '<p style="margin:22px 0;"><a href="' + href + '" style="background:#E91E89;color:#ffffff;text-decoration:none;font-weight:bold;padding:14px 26px;border-radius:999px;display:inline-block;">' + esc(label) + '</a></p>';
}
function link(href, label) {
  return '<a href="' + href + '" style="color:#E91E89;font-weight:bold;">' + esc(label) + '</a>';
}

/* Produktnavn + nedlastingsfiler per produkt-id. Filene har lesbar etikett
   per språk (brukes i lenketeksten, spesielt for pakkene). */
function f(name, no, en) { return { url: DL + name, no: no, en: en }; }
/* Som f(), men med full URL (produkter utenfor /butikk/nedlasting/oppskrifter/,
   f.eks. boka, plansjene og tidslinjen som ligger andre steder eller i skyen). */
function f2(url, no, en) { return { url: url, no: no, en: en }; }
const PRODUCT = {
  "ro-strikk":      { no: "RO-bøttehatt, strikk", en: "RO bucket hat, knit",
    files: { no: [f("ro-strikk.pdf", "RO-bøttehatt, strikk", "")], en: [f("ro-strikk-en.pdf", "", "RO bucket hat, knit")] } },
  "ro-hekle":       { no: "RO-bøttehatt, hekle", en: "RO bucket hat, crochet",
    files: { no: [f("ro-hekle.pdf", "RO-bøttehatt, hekle", "")], en: [f("ro-hekle-en.pdf", "", "RO bucket hat, crochet")] } },
  "norway-strikk":  { no: "NORWAY-bøttehatt, strikk", en: "NORWAY bucket hat, knit",
    files: { no: [f("norway-strikk.pdf", "NORWAY-bøttehatt, strikk", "")], en: [f("norway-strikk-en.pdf", "", "NORWAY bucket hat, knit")] } },
  "norway-hekle":   { no: "NORWAY-bøttehatt, hekle", en: "NORWAY bucket hat, crochet",
    files: { no: [f("norway-hekle.pdf", "NORWAY-bøttehatt, hekle", "")], en: [f("norway-hekle-en.pdf", "", "NORWAY bucket hat, crochet")] } },
  "norge-strikk":   { no: "NORGE-bøttehatt (maskesting)", en: "NORGE bucket hat (duplicate stitch)",
    files: { no: [f("norge-strikk.pdf", "NORGE-bøttehatt, maskesting", "")], en: [f("norge-strikk-en.pdf", "", "NORGE bucket hat, duplicate stitch")] } },
  "norge-blokk":    { no: "NORGE-bøttehatt (blokkbokstaver)", en: "NORGE bucket hat (block letters)",
    files: { no: [f("norge-blokk.pdf", "NORGE-bøttehatt, blokkbokstaver", "")], en: [f("norge-blokk-en.pdf", "", "NORGE bucket hat, block letters")] } },
  "norge-innstrikket": { no: "NORGE-bøttehatt (innstrikket)", en: "NORGE bucket hat (knitted in)",
    files: { no: [f("norge-innstrikket.pdf", "NORGE-bøttehatt, innstrikket", "")], en: [f("norge-innstrikket-en.pdf", "", "NORGE bucket hat, knitted in")] } },
  "norge-rune":     { no: "NORGE-runehatt (hekle)", en: "NORWAY rune hat (crochet)",
    files: { no: [f("norge-rune.pdf", "NORGE-runehatt, hekle", "")], en: [f("norge-rune-en.pdf", "", "NORWAY rune hat, crochet")] } },
  "norge-rune-strikk": { no: "NORGE-runehatt (strikk)", en: "NORGE rune hat (knit)",
    files: { no: [f("norge-rune-strikk.pdf", "NORGE-runehatt, strikk", "")], en: [f("norge-rune-strikk-en.pdf", "", "NORGE rune hat, knit")] } },
  "norge-hekle":    { no: "NORGE-bøttehatt, hekle", en: "NORGE bucket hat, crochet",
    files: { no: [f("norge-hekle.pdf", "NORGE-bøttehatt, hekle", "")], en: [f("norge-hekle-en.pdf", "", "NORGE bucket hat, crochet")] } },
  "norge-skaut":    { no: "Norge-skaut, strikk", en: "Norway kerchief, knit",
    files: { no: [f("norge-skaut.pdf", "Norge-skaut, strikk", "")], en: [f("norge-skaut-en.pdf", "", "Norway kerchief, knit")] } },
  "norge-skaut-hekle": { no: "Norge-skaut, hekle", en: "Norway kerchief, crochet",
    files: { no: [f("norge-skaut-hekle.pdf", "Norge-skaut, hekle", "")], en: [f("norge-skaut-hekle-en.pdf", "", "Norway kerchief, crochet")] } },
  "norge-pakke":    { no: "NORGE-pakke (3 strikkevarianter)", en: "NORGE bundle (3 knit versions)",
    files: { no: [
      f("norge-strikk.pdf", "NORGE, maskesting", ""),
      f("norge-blokk.pdf", "NORGE, blokkbokstaver", ""),
      f("norge-innstrikket.pdf", "NORGE, innstrikket", "") ], en: [
      f("norge-strikk-en.pdf", "", "NORGE, duplicate stitch"),
      f("norge-blokk-en.pdf", "", "NORGE, block letters"),
      f("norge-innstrikket-en.pdf", "", "NORGE, knitted in") ] } },
  "hekle-pakke":    { no: "Alle hekleoppskriftene", en: "All crochet patterns",
    files: { no: [
      f("ro-hekle.pdf", "RO-bøttehatt, hekle", ""),
      f("norway-hekle.pdf", "NORWAY-bøttehatt, hekle", ""),
      f("norge-hekle.pdf", "NORGE-bøttehatt, hekle", ""),
      f("norge-skaut-hekle.pdf", "Norge-skaut, hekle", "") ], en: [
      f("ro-hekle-en.pdf", "", "RO bucket hat, crochet"),
      f("norway-hekle-en.pdf", "", "NORWAY bucket hat, crochet"),
      f("norge-hekle-en.pdf", "", "NORGE bucket hat, crochet"),
      f("norge-skaut-hekle-en.pdf", "", "Norway kerchief, crochet") ] } },
  "strikk-pakke":   { no: "Alle strikkeoppskriftene", en: "All knitting patterns",
    files: { no: [
      f("ro-strikk.pdf", "RO-bøttehatt, strikk", ""),
      f("norway-strikk.pdf", "NORWAY-bøttehatt, strikk", ""),
      f("norge-strikk.pdf", "NORGE, maskesting", ""),
      f("norge-blokk.pdf", "NORGE, blokkbokstaver", ""),
      f("norge-innstrikket.pdf", "NORGE, innstrikket", ""),
      f("norge-skaut.pdf", "Norge-skaut, strikk", "") ], en: [
      f("ro-strikk-en.pdf", "", "RO bucket hat, knit"),
      f("norway-strikk-en.pdf", "", "NORWAY bucket hat, knit"),
      f("norge-strikk-en.pdf", "", "NORGE, duplicate stitch"),
      f("norge-blokk-en.pdf", "", "NORGE, block letters"),
      f("norge-innstrikket-en.pdf", "", "NORGE, knitted in"),
      f("norge-skaut-en.pdf", "", "Norway kerchief, knit") ] } },

  /* LME Baby Collection "Woodland Dreams" */
  "ellie-hekle": { no: "Ellie, det lille dådyret", en: "Ellie, the little fawn",
    files: { no: [f("ellie-hekle.pdf", "Ellie, det lille dådyret", "")], en: [f("ellie-hekle-en.pdf", "", "Ellie, the little fawn")] } },
  "ellies-smokkelenke": { no: "Ellies smokkelenke", en: "Ellie's pacifier clip",
    files: { no: [f("ellies-smokkelenke.pdf", "Ellies smokkelenke", "")], en: [f("ellies-smokkelenke-en.pdf", "", "Ellie's pacifier clip")] } },
  "ellies-rangle": { no: "Ellies rangle", en: "Ellie's rattle",
    files: { no: [f("ellies-rangle.pdf", "Ellies rangle", "")], en: [f("ellies-rangle-en.pdf", "", "Ellie's rattle")] } },
  "ellies-vognlenke": { no: "Ellies vognlenke", en: "Ellie's stroller toy",
    files: { no: [f("ellies-vognlenke.pdf", "Ellies vognlenke", "")], en: [f("ellies-vognlenke-en.pdf", "", "Ellie's stroller toy")] } },
  "ellies-ballerinasko": { no: "Ellies ballerinasko", en: "Ellie's ballerina shoes",
    files: { no: [f("ellies-ballerinasko.pdf", "Ellies ballerinasko", "")], en: [f("ellies-ballerinasko-en.pdf", "", "Ellie's ballerina shoes")] } },
  "ellies-aktivitetsleke": { no: "Ellies aktivitetsleke", en: "Ellie's activity toy",
    files: { no: [f("ellies-aktivitetsleke.pdf", "Ellies aktivitetsleke", "")], en: [f("ellies-aktivitetsleke-en.pdf", "", "Ellie's activity toy")] } },

  /* Woodland Dreams - Pip, Felix, Molly, Luna, Oliver + hele kolleksjonen,
     samt andre nedlastingsprodukter utenfor Woodland Dreams.
     Lagt til 4. august 2026 (manglet helt, så kjøpere av disse produktene
     fikk ingen leveringsmail). */
  "naturutforskerne": { no: "De små naturutforskerne", en: "The Little Nature Explorers",
    files: { no: [f2("https://lmexplorers.com/butikk/nedlasting/de-sma-naturutforskerne-no.pdf", "Last ned boka (norsk PDF)", "Download the book (Norwegian PDF)")], en: [f2("https://lmexplorers.com/butikk/nedlasting/the-little-nature-explorers-en.pdf", "Last ned boka (engelsk PDF)", "Download the book (English PDF)")] } },
  "plansjer": { no: "Plansjer og kortsett, forhistoriske dyr", en: "Posters and card sets, prehistoric animals",
    files: { no: [f2("https://lmexplorers.com/butikk/nedlasting/plansjer/LME_Cosmic_Plansjer_A3_NO.pdf", "Plansjer A3 (norsk PDF)", "Posters A3 (Norwegian PDF)"), f2("https://lmexplorers.com/butikk/nedlasting/plansjer/LME_Cosmic_Tekstkort_Navn_NO.pdf", "Tekstkort, navn (norsk PDF)", "Text cards, names (Norwegian PDF)"), f2("https://lmexplorers.com/butikk/nedlasting/plansjer/LME_Cosmic_Tekstkort_Navn_Type_NO.pdf", "Tekstkort, navn og type (norsk PDF)", "Text cards, name and type (Norwegian PDF)"), f2("https://lmexplorers.com/butikk/nedlasting/plansjer/LME_Cosmic_Tekstkort_Fakta_NO.pdf", "Tekstkort, fakta (norsk PDF)", "Text cards, facts (Norwegian PDF)"), f2("https://lmexplorers.com/butikk/nedlasting/plansjer/LME_Cosmic_Brukerveiledning_NO.pdf", "Brukerveiledning (norsk PDF)", "User guide (Norwegian PDF)")], en: [f2("https://lmexplorers.com/butikk/nedlasting/plansjer/LME_Cosmic_Posters_A3_EN.pdf", "Plansjer A3 (engelsk PDF)", "Posters A3 (English PDF)"), f2("https://lmexplorers.com/butikk/nedlasting/plansjer/LME_Cosmic_Text_Cards_Names_EN.pdf", "Tekstkort, navn (engelsk PDF)", "Text cards, names (English PDF)"), f2("https://lmexplorers.com/butikk/nedlasting/plansjer/LME_Cosmic_Text_Cards_Name_Type_EN.pdf", "Tekstkort, navn og type (engelsk PDF)", "Text cards, name and type (English PDF)"), f2("https://lmexplorers.com/butikk/nedlasting/plansjer/LME_Cosmic_Text_Cards_Facts_EN.pdf", "Tekstkort, fakta (engelsk PDF)", "Text cards, facts (English PDF)"), f2("https://lmexplorers.com/butikk/nedlasting/plansjer/LME_Cosmic_User_Guide_EN.pdf", "Brukerveiledning (engelsk PDF)", "User guide (English PDF)")] } },
  "tidslinje": { no: "Livets Tidslinje, komplett pakke", en: "Timeline of Life, complete package",
    files: { no: [f2("https://drive.usercontent.google.com/download?id=1n43Ha7f4xu4NW0GS4wj-FgEEzTHKe2zQ&export=download&confirm=t", "Last ned hele pakken (zip, norsk + engelsk)", "Download the complete package (zip, Norwegian + English)")], en: [f2("https://drive.usercontent.google.com/download?id=1n43Ha7f4xu4NW0GS4wj-FgEEzTHKe2zQ&export=download&confirm=t", "Last ned hele pakken (zip, norsk + engelsk)", "Download the complete package (zip, Norwegian + English)")] } },
  "pips-ballerinasko": { no: "Pips ballerinasko - amigurumi", en: "Pip's Ballerina Shoes - amigurumi",
    files: { no: [f2("https://lmexplorers.com/butikk/nedlasting/oppskrifter/pips-ballerinasko.pdf", "Last ned oppskriften (PDF)", "Download the pattern (PDF)")], en: [f2("https://lmexplorers.com/butikk/nedlasting/oppskrifter/pips-ballerinasko-en.pdf", "Last ned oppskriften (engelsk PDF)", "Download the pattern (PDF)")] } },
  "pips-aktivitetsleke": { no: "Pips aktivitetsleke - amigurumi", en: "Pip's Activity Toy - amigurumi",
    files: { no: [f2("https://lmexplorers.com/butikk/nedlasting/oppskrifter/pips-aktivitetsleke.pdf", "Last ned oppskriften (PDF)", "Download the pattern (PDF)")], en: [f2("https://lmexplorers.com/butikk/nedlasting/oppskrifter/pips-aktivitetsleke-en.pdf", "Last ned oppskriften (engelsk PDF)", "Download the pattern (PDF)")] } },
  "felix-ballerinasko": { no: "Felix' ballerinasko - amigurumi", en: "Felix's Ballerina Shoes - amigurumi",
    files: { no: [f2("https://lmexplorers.com/butikk/nedlasting/oppskrifter/felix-ballerinasko.pdf", "Last ned oppskriften (PDF)", "Download the pattern (PDF)")], en: [f2("https://lmexplorers.com/butikk/nedlasting/oppskrifter/felix-ballerinasko-en.pdf", "Last ned oppskriften (engelsk PDF)", "Download the pattern (PDF)")] } },
  "felix-aktivitetsleke": { no: "Felix' aktivitetsleke - amigurumi", en: "Felix's Activity Toy - amigurumi",
    files: { no: [f2("https://lmexplorers.com/butikk/nedlasting/oppskrifter/felix-aktivitetsleke.pdf", "Last ned oppskriften (PDF)", "Download the pattern (PDF)")], en: [f2("https://lmexplorers.com/butikk/nedlasting/oppskrifter/felix-aktivitetsleke-en.pdf", "Last ned oppskriften (engelsk PDF)", "Download the pattern (PDF)")] } },
  "mollys-ballerinasko": { no: "Mollys ballerinasko - amigurumi", en: "Molly's Ballerina Shoes - amigurumi",
    files: { no: [f2("https://lmexplorers.com/butikk/nedlasting/oppskrifter/mollys-ballerinasko.pdf", "Last ned oppskriften (PDF)", "Download the pattern (PDF)")], en: [f2("https://lmexplorers.com/butikk/nedlasting/oppskrifter/mollys-ballerinasko-en.pdf", "Last ned oppskriften (engelsk PDF)", "Download the pattern (PDF)")] } },
  "mollys-aktivitetsleke": { no: "Mollys aktivitetsleke - amigurumi", en: "Molly's Activity Toy - amigurumi",
    files: { no: [f2("https://lmexplorers.com/butikk/nedlasting/oppskrifter/mollys-aktivitetsleke.pdf", "Last ned oppskriften (PDF)", "Download the pattern (PDF)")], en: [f2("https://lmexplorers.com/butikk/nedlasting/oppskrifter/mollys-aktivitetsleke-en.pdf", "Last ned oppskriften (engelsk PDF)", "Download the pattern (PDF)")] } },
  "lunas-ballerinasko": { no: "Lunas ballerinasko - amigurumi", en: "Luna's Ballerina Shoes - amigurumi",
    files: { no: [f2("https://lmexplorers.com/butikk/nedlasting/oppskrifter/lunas-ballerinasko.pdf", "Last ned oppskriften (PDF)", "Download the pattern (PDF)")], en: [f2("https://lmexplorers.com/butikk/nedlasting/oppskrifter/lunas-ballerinasko-en.pdf", "Last ned oppskriften (engelsk PDF)", "Download the pattern (PDF)")] } },
  "lunas-aktivitetsleke": { no: "Lunas aktivitetsleke - amigurumi", en: "Luna's Activity Toy - amigurumi",
    files: { no: [f2("https://lmexplorers.com/butikk/nedlasting/oppskrifter/lunas-aktivitetsleke.pdf", "Last ned oppskriften (PDF)", "Download the pattern (PDF)")], en: [f2("https://lmexplorers.com/butikk/nedlasting/oppskrifter/lunas-aktivitetsleke-en.pdf", "Last ned oppskriften (engelsk PDF)", "Download the pattern (PDF)")] } },
  "olivers-ballerinasko": { no: "Olivers ballerinasko - amigurumi", en: "Oliver's Ballerina Shoes - amigurumi",
    files: { no: [f2("https://lmexplorers.com/butikk/nedlasting/oppskrifter/olivers-ballerinasko.pdf", "Last ned oppskriften (PDF)", "Download the pattern (PDF)")], en: [f2("https://lmexplorers.com/butikk/nedlasting/oppskrifter/olivers-ballerinasko-en.pdf", "Last ned oppskriften (engelsk PDF)", "Download the pattern (PDF)")] } },
  "olivers-aktivitetsleke": { no: "Olivers aktivitetsleke - amigurumi", en: "Oliver's Activity Toy - amigurumi",
    files: { no: [f2("https://lmexplorers.com/butikk/nedlasting/oppskrifter/olivers-aktivitetsleke.pdf", "Last ned oppskriften (PDF)", "Download the pattern (PDF)")], en: [f2("https://lmexplorers.com/butikk/nedlasting/oppskrifter/olivers-aktivitetsleke-en.pdf", "Last ned oppskriften (engelsk PDF)", "Download the pattern (PDF)")] } },
  "pip-hekle": { no: "Pip, det lille pinnsvinet - amigurumi", en: "Pip the Little Hedgehog - amigurumi",
    files: { no: [f2("https://lmexplorers.com/butikk/nedlasting/oppskrifter/pip-hekle.pdf", "Last ned oppskriften (PDF)", "Download the pattern (PDF)")], en: [f2("https://lmexplorers.com/butikk/nedlasting/oppskrifter/pip-hekle-en.pdf", "Last ned oppskriften (engelsk PDF)", "Download the pattern (PDF)")] } },
  "felix-hekle": { no: "Felix, den lille reven - amigurumi", en: "Felix the Little Fox - amigurumi",
    files: { no: [f2("https://lmexplorers.com/butikk/nedlasting/oppskrifter/felix-hekle.pdf", "Last ned oppskriften (PDF)", "Download the pattern (PDF)")], en: [f2("https://lmexplorers.com/butikk/nedlasting/oppskrifter/felix-hekle-en.pdf", "Last ned oppskriften (engelsk PDF)", "Download the pattern (PDF)")] } },
  "molly-hekle": { no: "Molly, det lille lammet - amigurumi", en: "Molly the Little Lamb - amigurumi",
    files: { no: [f2("https://lmexplorers.com/butikk/nedlasting/oppskrifter/molly-hekle.pdf", "Last ned oppskriften (PDF)", "Download the pattern (PDF)")], en: [f2("https://lmexplorers.com/butikk/nedlasting/oppskrifter/molly-hekle-en.pdf", "Last ned oppskriften (engelsk PDF)", "Download the pattern (PDF)")] } },
  "luna-hekle": { no: "Luna, den lille kaninen - amigurumi", en: "Luna the Little Bunny - amigurumi",
    files: { no: [f2("https://lmexplorers.com/butikk/nedlasting/oppskrifter/luna-hekle.pdf", "Last ned oppskriften (PDF)", "Download the pattern (PDF)")], en: [f2("https://lmexplorers.com/butikk/nedlasting/oppskrifter/luna-hekle-en.pdf", "Last ned oppskriften (engelsk PDF)", "Download the pattern (PDF)")] } },
  "oliver-hekle": { no: "Oliver, den lille bjørnen - amigurumi", en: "Oliver the Little Bear - amigurumi",
    files: { no: [f2("https://lmexplorers.com/butikk/nedlasting/oppskrifter/oliver-hekle.pdf", "Last ned oppskriften (PDF)", "Download the pattern (PDF)")], en: [f2("https://lmexplorers.com/butikk/nedlasting/oppskrifter/oliver-hekle-en.pdf", "Last ned oppskriften (engelsk PDF)", "Download the pattern (PDF)")] } },
  "pips-smokkelenke": { no: "Pips smokkelenke", en: "Pip's pacifier clip",
    files: { no: [f2("https://lmexplorers.com/butikk/nedlasting/oppskrifter/pips-smokkelenke.pdf", "Last ned oppskriften (PDF)", "Download the pattern (PDF)")], en: [f2("https://lmexplorers.com/butikk/nedlasting/oppskrifter/pips-smokkelenke-en.pdf", "Last ned oppskriften (engelsk PDF)", "Download the pattern (PDF)")] } },
  "felix-smokkelenke": { no: "Felix' smokkelenke", en: "Felix's pacifier clip",
    files: { no: [f2("https://lmexplorers.com/butikk/nedlasting/oppskrifter/felix-smokkelenke.pdf", "Last ned oppskriften (PDF)", "Download the pattern (PDF)")], en: [f2("https://lmexplorers.com/butikk/nedlasting/oppskrifter/felix-smokkelenke-en.pdf", "Last ned oppskriften (engelsk PDF)", "Download the pattern (PDF)")] } },
  "mollys-smokkelenke": { no: "Mollys smokkelenke", en: "Molly's pacifier clip",
    files: { no: [f2("https://lmexplorers.com/butikk/nedlasting/oppskrifter/mollys-smokkelenke.pdf", "Last ned oppskriften (PDF)", "Download the pattern (PDF)")], en: [f2("https://lmexplorers.com/butikk/nedlasting/oppskrifter/mollys-smokkelenke-en.pdf", "Last ned oppskriften (engelsk PDF)", "Download the pattern (PDF)")] } },
  "lunas-smokkelenke": { no: "Lunas smokkelenke", en: "Luna's pacifier clip",
    files: { no: [f2("https://lmexplorers.com/butikk/nedlasting/oppskrifter/lunas-smokkelenke.pdf", "Last ned oppskriften (PDF)", "Download the pattern (PDF)")], en: [f2("https://lmexplorers.com/butikk/nedlasting/oppskrifter/lunas-smokkelenke-en.pdf", "Last ned oppskriften (engelsk PDF)", "Download the pattern (PDF)")] } },
  "olivers-smokkelenke": { no: "Olivers smokkelenke", en: "Oliver's pacifier clip",
    files: { no: [f2("https://lmexplorers.com/butikk/nedlasting/oppskrifter/olivers-smokkelenke.pdf", "Last ned oppskriften (PDF)", "Download the pattern (PDF)")], en: [f2("https://lmexplorers.com/butikk/nedlasting/oppskrifter/olivers-smokkelenke-en.pdf", "Last ned oppskriften (engelsk PDF)", "Download the pattern (PDF)")] } },
  "pips-rangle": { no: "Pips rangle", en: "Pip's rattle",
    files: { no: [f2("https://lmexplorers.com/butikk/nedlasting/oppskrifter/pips-rangle.pdf", "Last ned oppskriften (PDF)", "Download the pattern (PDF)")], en: [f2("https://lmexplorers.com/butikk/nedlasting/oppskrifter/pips-rangle-en.pdf", "Last ned oppskriften (engelsk PDF)", "Download the pattern (PDF)")] } },
  "felix-rangle": { no: "Felix' rangle", en: "Felix's rattle",
    files: { no: [f2("https://lmexplorers.com/butikk/nedlasting/oppskrifter/felix-rangle.pdf", "Last ned oppskriften (PDF)", "Download the pattern (PDF)")], en: [f2("https://lmexplorers.com/butikk/nedlasting/oppskrifter/felix-rangle-en.pdf", "Last ned oppskriften (engelsk PDF)", "Download the pattern (PDF)")] } },
  "mollys-rangle": { no: "Mollys rangle", en: "Molly's rattle",
    files: { no: [f2("https://lmexplorers.com/butikk/nedlasting/oppskrifter/mollys-rangle.pdf", "Last ned oppskriften (PDF)", "Download the pattern (PDF)")], en: [f2("https://lmexplorers.com/butikk/nedlasting/oppskrifter/mollys-rangle-en.pdf", "Last ned oppskriften (engelsk PDF)", "Download the pattern (PDF)")] } },
  "lunas-rangle": { no: "Lunas rangle", en: "Luna's rattle",
    files: { no: [f2("https://lmexplorers.com/butikk/nedlasting/oppskrifter/lunas-rangle.pdf", "Last ned oppskriften (PDF)", "Download the pattern (PDF)")], en: [f2("https://lmexplorers.com/butikk/nedlasting/oppskrifter/lunas-rangle-en.pdf", "Last ned oppskriften (engelsk PDF)", "Download the pattern (PDF)")] } },
  "olivers-rangle": { no: "Olivers rangle", en: "Oliver's rattle",
    files: { no: [f2("https://lmexplorers.com/butikk/nedlasting/oppskrifter/olivers-rangle.pdf", "Last ned oppskriften (PDF)", "Download the pattern (PDF)")], en: [f2("https://lmexplorers.com/butikk/nedlasting/oppskrifter/olivers-rangle-en.pdf", "Last ned oppskriften (engelsk PDF)", "Download the pattern (PDF)")] } },
  "pips-vognlenke": { no: "Pips vognlenke", en: "Pip's stroller toy",
    files: { no: [f2("https://lmexplorers.com/butikk/nedlasting/oppskrifter/pips-vognlenke.pdf", "Last ned oppskriften (PDF)", "Download the pattern (PDF)")], en: [f2("https://lmexplorers.com/butikk/nedlasting/oppskrifter/pips-vognlenke-en.pdf", "Last ned oppskriften (engelsk PDF)", "Download the pattern (PDF)")] } },
  "felix-vognlenke": { no: "Felix' vognlenke", en: "Felix's stroller toy",
    files: { no: [f2("https://lmexplorers.com/butikk/nedlasting/oppskrifter/felix-vognlenke.pdf", "Last ned oppskriften (PDF)", "Download the pattern (PDF)")], en: [f2("https://lmexplorers.com/butikk/nedlasting/oppskrifter/felix-vognlenke-en.pdf", "Last ned oppskriften (engelsk PDF)", "Download the pattern (PDF)")] } },
  "mollys-vognlenke": { no: "Mollys vognlenke", en: "Molly's stroller toy",
    files: { no: [f2("https://lmexplorers.com/butikk/nedlasting/oppskrifter/mollys-vognlenke.pdf", "Last ned oppskriften (PDF)", "Download the pattern (PDF)")], en: [f2("https://lmexplorers.com/butikk/nedlasting/oppskrifter/mollys-vognlenke-en.pdf", "Last ned oppskriften (engelsk PDF)", "Download the pattern (PDF)")] } },
  "lunas-vognlenke": { no: "Lunas vognlenke", en: "Luna's stroller toy",
    files: { no: [f2("https://lmexplorers.com/butikk/nedlasting/oppskrifter/lunas-vognlenke.pdf", "Last ned oppskriften (PDF)", "Download the pattern (PDF)")], en: [f2("https://lmexplorers.com/butikk/nedlasting/oppskrifter/lunas-vognlenke-en.pdf", "Last ned oppskriften (engelsk PDF)", "Download the pattern (PDF)")] } },
  "olivers-vognlenke": { no: "Olivers vognlenke", en: "Oliver's stroller toy",
    files: { no: [f2("https://lmexplorers.com/butikk/nedlasting/oppskrifter/olivers-vognlenke.pdf", "Last ned oppskriften (PDF)", "Download the pattern (PDF)")], en: [f2("https://lmexplorers.com/butikk/nedlasting/oppskrifter/olivers-vognlenke-en.pdf", "Last ned oppskriften (engelsk PDF)", "Download the pattern (PDF)")] } },
  "woodland-dreams-bundle": { no: "Woodland Dreams, hele kolleksjonen (36 oppskrifter)", en: "Woodland Dreams, the complete collection (36 patterns)",
    files: { no: [f2("https://lmexplorers.com/butikk/nedlasting/oppskrifter/woodland-dreams-bundle-del1-no.zip", "Last ned del 1 av 3 (zip, norsk)", "Download part 1 of 3 (zip, Norwegian)"), f2("https://lmexplorers.com/butikk/nedlasting/oppskrifter/woodland-dreams-bundle-del2-no.zip", "Last ned del 2 av 3 (zip, norsk)", "Download part 2 of 3 (zip, Norwegian)"), f2("https://lmexplorers.com/butikk/nedlasting/oppskrifter/woodland-dreams-bundle-del3-no.zip", "Last ned del 3 av 3 (zip, norsk)", "Download part 3 of 3 (zip, Norwegian)")], en: [f2("https://lmexplorers.com/butikk/nedlasting/oppskrifter/woodland-dreams-bundle-del1-en.zip", "Last ned del 1 av 3 (zip, engelsk)", "Download part 1 of 3 (zip, English)"), f2("https://lmexplorers.com/butikk/nedlasting/oppskrifter/woodland-dreams-bundle-del2-en.zip", "Last ned del 2 av 3 (zip, engelsk)", "Download part 2 of 3 (zip, English)"), f2("https://lmexplorers.com/butikk/nedlasting/oppskrifter/woodland-dreams-bundle-del3-en.zip", "Last ned del 3 av 3 (zip, engelsk)", "Download part 3 of 3 (zip, English)")] } },
  "fotballpute-ro-strikk": { no: "Fotballpute RO RO RO, strikk", en: "RO RO RO football cushion, knit",
    files: { no: [f("fotballpute-ro-strikk.pdf?v=3", "Fotballpute RO RO RO, strikk", "")], en: [f("fotballpute-ro-strikk-en.pdf?v=3", "", "RO RO RO football cushion, knit")] } },
  "bottehatter-barn-strikk": { no: "Bøttehatter barn, strikk (NORGE/NORWAY/RO)", en: "Kids Bucket Hats, knit (NORGE/NORWAY/RO)",
    files: { no: [f("bottehatter-barn-strikk.pdf", "Bøttehatter barn, strikk", "")], en: [f("bottehatter-barn-strikk-en.pdf", "", "Kids Bucket Hats, knit")] } },
  "bottehatter-barn-hekle": { no: "Bøttehatter barn, hekle (NORGE/NORWAY/RO)", en: "Kids Bucket Hats, crochet (NORGE/NORWAY/RO)",
    files: { no: [f("bottehatter-barn-hekle.pdf", "Bøttehatter barn, hekle", "")], en: [f("bottehatter-barn-hekle-en.pdf", "", "Kids Bucket Hats, crochet")] } },
  "bottehatter-barn-strikk-brodert": { no: "Bøttehatter barn, brodert (NORGE/NORWAY/RO)", en: "Kids Bucket Hats, duplicate stitch (NORGE/NORWAY/RO)",
    files: { no: [f("bottehatter-barn-strikk-brodert.pdf", "Bøttehatter barn, brodert", "")], en: [f("bottehatter-barn-strikk-brodert-en.pdf", "", "Kids Bucket Hats, duplicate stitch")] } },
  "bottehatter-barn-hekle-rune": { no: "Bøttehatter barn, runeskrift (NORGE/NORWAY)", en: "Kids Bucket Hats, rune letters (NORGE/NORWAY)",
    files: { no: [f("bottehatter-barn-hekle-rune.pdf", "Bøttehatter barn, runeskrift", "")], en: [f("bottehatter-barn-hekle-rune-en.pdf", "", "Kids Bucket Hats, rune letters")] } },
  "bottehatter-barn-strikk-norge": { no: "NORGE-bøttehatt barn, strikk", en: "NORGE bucket hat kids, knit",
    files: { no: [f("bottehatter-barn-strikk-norge.pdf", "NORGE-bøttehatt barn, strikk", "")], en: [f("bottehatter-barn-strikk-norge-en.pdf", "", "NORGE bucket hat kids, knit")] } },
  "bottehatter-barn-strikk-norway": { no: "NORWAY-bøttehatt barn, strikk", en: "NORWAY bucket hat kids, knit",
    files: { no: [f("bottehatter-barn-strikk-norway.pdf", "NORWAY-bøttehatt barn, strikk", "")], en: [f("bottehatter-barn-strikk-norway-en.pdf", "", "NORWAY bucket hat kids, knit")] } },
  "bottehatter-barn-strikk-rune-norge": { no: "NORGE-runehatt barn, strikk", en: "NORGE rune hat kids, knit",
    files: { no: [f("bottehatter-barn-strikk-rune-norge.pdf", "NORGE-runehatt barn, strikk", "")], en: [f("bottehatter-barn-strikk-rune-norge-en.pdf", "", "NORGE rune hat kids, knit")] } },
  "bottehatter-barn-strikk-rune-norway": { no: "NORWAY-runehatt barn, strikk", en: "NORWAY rune hat kids, knit",
    files: { no: [f("bottehatter-barn-strikk-rune-norway.pdf", "NORWAY-runehatt barn, strikk", "")], en: [f("bottehatter-barn-strikk-rune-norway-en.pdf", "", "NORWAY rune hat kids, knit")] } },
  "bottehatter-barn-strikk-ro": { no: "RO-bøttehatt barn, strikk", en: "RO bucket hat kids, knit",
    files: { no: [f("bottehatter-barn-strikk-ro.pdf", "RO-bøttehatt barn, strikk", "")], en: [f("bottehatter-barn-strikk-ro-en.pdf", "", "RO bucket hat kids, knit")] } },
  "bottehatter-barn-strikk-brodert-norge": { no: "NORGE-bøttehatt barn, brodert", en: "NORGE bucket hat kids, duplicate stitch",
    files: { no: [f("bottehatter-barn-strikk-brodert-norge.pdf", "NORGE-bøttehatt barn, brodert", "")], en: [f("bottehatter-barn-strikk-brodert-norge-en.pdf", "", "NORGE bucket hat kids, duplicate stitch")] } },
  "bottehatter-barn-strikk-brodert-norway": { no: "NORWAY-bøttehatt barn, brodert", en: "NORWAY bucket hat kids, duplicate stitch",
    files: { no: [f("bottehatter-barn-strikk-brodert-norway.pdf", "NORWAY-bøttehatt barn, brodert", "")], en: [f("bottehatter-barn-strikk-brodert-norway-en.pdf", "", "NORWAY bucket hat kids, duplicate stitch")] } },
  "bottehatter-barn-strikk-brodert-ro": { no: "RO-bøttehatt barn, brodert", en: "RO bucket hat kids, duplicate stitch",
    files: { no: [f("bottehatter-barn-strikk-brodert-ro.pdf", "RO-bøttehatt barn, brodert", "")], en: [f("bottehatter-barn-strikk-brodert-ro-en.pdf", "", "RO bucket hat kids, duplicate stitch")] } },
  "bottehatter-barn-hekle-norge": { no: "NORGE-bøttehatt barn, hekle", en: "NORGE bucket hat kids, crochet",
    files: { no: [f("bottehatter-barn-hekle-norge.pdf", "NORGE-bøttehatt barn, hekle", "")], en: [f("bottehatter-barn-hekle-norge-en.pdf", "", "NORGE bucket hat kids, crochet")] } },
  "bottehatter-barn-hekle-norway": { no: "NORWAY-bøttehatt barn, hekle", en: "NORWAY bucket hat kids, crochet",
    files: { no: [f("bottehatter-barn-hekle-norway.pdf", "NORWAY-bøttehatt barn, hekle", "")], en: [f("bottehatter-barn-hekle-norway-en.pdf", "", "NORWAY bucket hat kids, crochet")] } },
  "bottehatter-barn-hekle-ro": { no: "RO-bøttehatt barn, hekle", en: "RO bucket hat kids, crochet",
    files: { no: [f("bottehatter-barn-hekle-ro.pdf", "RO-bøttehatt barn, hekle", "")], en: [f("bottehatter-barn-hekle-ro-en.pdf", "", "RO bucket hat kids, crochet")] } },
  "bottehatter-barn-hekle-rune-norge": { no: "NORGE-bøttehatt barn, runeskrift", en: "NORGE bucket hat kids, rune letters",
    files: { no: [f("bottehatter-barn-hekle-rune-norge.pdf", "NORGE-bøttehatt barn, runeskrift", "")], en: [f("bottehatter-barn-hekle-rune-norge-en.pdf", "", "NORGE bucket hat kids, rune letters")] } },
  "bottehatter-barn-hekle-rune-norway": { no: "NORWAY-bøttehatt barn, runeskrift", en: "NORWAY bucket hat kids, rune letters",
    files: { no: [f("bottehatter-barn-hekle-rune-norway.pdf", "NORWAY-bøttehatt barn, runeskrift", "")], en: [f("bottehatter-barn-hekle-rune-norway-en.pdf", "", "NORWAY bucket hat kids, rune letters")] } },
  "skaut-barn-strikk-norge": { no: "NORGE-skaut barn, strikk", en: "Norway kerchief kids, knit",
    files: { no: [f("skaut-barn-strikk-norge.pdf", "NORGE-skaut barn, strikk", "")], en: [f("skaut-barn-strikk-norge-en.pdf", "", "Norway kerchief kids, knit")] } },
  "skaut-barn-strikk-ro": { no: "RO-skaut barn, strikk", en: "RO kerchief kids, knit",
    files: { no: [f("skaut-barn-strikk-ro.pdf", "RO-skaut barn, strikk", "")], en: [f("skaut-barn-strikk-ro-en.pdf", "", "RO kerchief kids, knit")] } },
  "skaut-barn-hekle-norge": { no: "NORGE-skaut barn, hekle", en: "Norway kerchief kids, crochet",
    files: { no: [f("skaut-barn-hekle-norge.pdf", "NORGE-skaut barn, hekle", "")], en: [f("skaut-barn-hekle-norge-en.pdf", "", "Norway kerchief kids, crochet")] } },
  "skaut-barn-hekle-ro": { no: "RO-skaut barn, hekle", en: "RO kerchief kids, crochet",
    files: { no: [f("skaut-barn-hekle-ro.pdf", "RO-skaut barn, hekle", "")], en: [f("skaut-barn-hekle-ro-en.pdf", "", "RO kerchief kids, crochet")] } },
};

/* Bygger nedlastings-HTML: kun kjøperens eget språk. Engelsk kjøper får den
   engelske PDF-en, norsk kjøper den norske. Ingen blanding av språk. */
function downloads(prod, lang) {
  const files = prod.files[lang] || prod.files.no || [];
  const lbl = (fl) => (lang === "en" ? fl.en : fl.no) || "PDF";
  if (files.length === 1) {
    return btn(files[0].url, lang === "en" ? "Download the pattern (PDF)" : "Last ned oppskriften (PDF)");
  }
  return '<ul style="padding-left:20px;margin:14px 0;">' +
    files.map((fl) => '<li style="margin:6px 0;">' + link(fl.url, lbl(fl)) + '</li>').join("") +
    '</ul>';
}

function content(kind, lang, name, pid) {
  const prod = PRODUCT[pid];
  if (!prod) return null;
  const pname = lang === "en" ? prod.en : prod.no;
  const dl = downloads(prod, lang);

  if (lang === "en") {
    if (kind === "levering") return {
      subject: "Thank you! Here is your pattern 💛",
      html: wrap(
        "<p>Hi " + esc(name) + ",</p>" +
        "<p>Thank you so much for your purchase 💛 Here is your pattern, ready to print:</p>" +
        dl +
        "<p>A little tip before you start: Read through the whole pattern once first, and make a small gauge swatch, so you hit the right size.</p>" +
        "<p>Got the bug for it? Then the full bundle saves you money: all knitting patterns ($29) or all crochet patterns ($24).</p>" +
        btn(SHOP, "See the bundles") +
        "<p>If you get stuck anywhere, just reply to this email and I will help you as best I can.</p>" +
        "<p>Enjoy!<br>Warm wishes, Renate</p>"),
      text: "Hi " + name + ",\n\nThank you for your purchase. Download your pattern: " + (prod.files.en[0] || prod.files.no[0]).url + "\n\nSee the bundles: " + SHOP + "\n\nWarm wishes, Renate",
    };
    if (kind === "oppfolging_dag") return {
      subject: "Have you started on " + pname + "?",
      html: wrap(
        "<p>Hi " + esc(name) + ",</p>" +
        "<p>I just wanted to hear how it is going with " + esc(pname) + " 💛 Have you had a chance to begin?</p>" +
        "<p>Remember: If anything is unclear, just reply to this email. I am happy to help, whether it is a stitch that will not sit right or something else entirely.</p>" +
        "<p>And if you feel like making more, they are ready in the shop:</p>" +
        btn(SHOP, "Visit the shop") +
        "<p>Best of luck!<br>Warm wishes, Renate</p>"),
      text: "Hi " + name + ",\n\nHow is it going with " + pname + "? If anything is unclear, just reply. More patterns: " + SHOP + "\n\nWarm wishes, Renate",
    };
    return {
      subject: "How did it turn out? 🇳🇴",
      html: wrap(
        "<p>Hi " + esc(name) + ",</p>" +
        "<p>Some time has passed now, so I hope " + esc(pname) + " turned out lovely, or is well on its way 💛</p>" +
        "<p>It would make me so happy if you shared a photo. Tag me, or reply to this email with a picture, it truly makes my day.</p>" +
        "<p>Ready for a new one? The full bundle gives you something to knit and crochet for the whole family, or pick one of the other designs: NORGE, NORWAY, RO and the kerchief.</p>" +
        btn(SHOP, "Visit the shop") +
        "<p>Thank you for supporting what I make.<br>Warm wishes, Renate</p>"),
      text: "Hi " + name + ",\n\nI hope " + pname + " turned out lovely. I would love to see a photo. Ready for a new one? " + SHOP + "\n\nWarm wishes, Renate",
    };
  }

  // norsk
  if (kind === "levering") return {
    subject: "Tusen takk! Her er oppskriften din 💛",
    html: wrap(
      "<p>Hei " + esc(name) + ",</p>" +
      "<p>Tusen takk for kjøpet 💛 Her er oppskriften din, klar til å skrive ut:</p>" +
      dl +
      "<p>Et lite tips før du setter i gang: Les gjennom hele oppskriften en gang først, og lag gjerne en liten prøvelapp, så treffer du størrelsen.</p>" +
      "<p>Har du fått smaken på det? Da sparer du på å ta hele pakken: alle strikkeoppskriftene (299 kr) eller alle hekleoppskriftene (249 kr).</p>" +
      btn(SHOP, "Se pakkene") +
      "<p>Står du fast et sted, svar på denne e-posten, så hjelper jeg deg så godt jeg kan.</p>" +
      "<p>God fornøyelse!<br>Klem fra Renate</p>"),
    text: "Hei " + name + ",\n\nTusen takk for kjøpet. Last ned oppskriften: " + (prod.files.no[0] || prod.files.en[0]).url + "\n\nSe pakkene: " + SHOP + "\n\nKlem fra Renate",
  };
  if (kind === "oppfolging_dag") return {
    subject: "Har du kommet i gang med " + pname + "?",
    html: wrap(
      "<p>Hei " + esc(name) + ",</p>" +
      "<p>Jeg lurte bare på hvordan det går med " + esc(pname) + " 💛 Har du fått begynt?</p>" +
      "<p>Husk: Er noe uklart, er det bare å svare på denne e-posten. Jeg svarer gjerne, enten det er en maske som ikke vil sitte eller et helt annet spørsmål.</p>" +
      "<p>Og skulle du få lyst på flere, ligger de klare i butikken:</p>" +
      btn(SHOP, "Se butikken") +
      "<p>Lykke til videre!<br>Klem fra Renate</p>"),
    text: "Hei " + name + ",\n\nHvordan går det med " + pname + "? Er noe uklart, bare svar på denne. Flere oppskrifter: " + SHOP + "\n\nKlem fra Renate",
  };
  return {
    subject: "Ble den fin? 🇳🇴",
    html: wrap(
      "<p>Hei " + esc(name) + ",</p>" +
      "<p>Nå har det gått litt tid, så jeg håper " + esc(pname) + " har blitt fin, eller er godt på vei 💛</p>" +
      "<p>Jeg blir så glad om du deler et bilde. Tagg meg gjerne, eller svar på denne e-posten med et bilde, det gjør dagen min.</p>" +
      "<p>Er du klar for en ny? Hele pakken gir deg noe å strikke og hekle til hele familien, eller velg en av de andre modellene: NORGE, NORWAY, RO og skaut.</p>" +
      btn(SHOP, "Se butikken") +
      "<p>Takk for at du støtter det jeg lager.<br>Klem fra Renate</p>"),
    text: "Hei " + name + ",\n\nJeg håper " + pname + " ble fin. Jeg blir glad om du deler et bilde. Klar for en ny? " + SHOP + "\n\nKlem fra Renate",
  };
}

export function isOppskrift(pid) { return !!PRODUCT[pid]; }

/* Kort varsel til Renate ved hvert salg (oppskrift, kreditt, Claude-kurs,
   Inner Circle). amount i minste enhet. opts.pname overstyrer produktnavnet
   når salget ikke er en oppskrift (da er opts.pid ikke en nøkkel i PRODUCT). */
export async function sendOwnerSaleNotice(env, opts) {
  const apiKey = env.MAILERSEND_API_KEY;
  if (!apiKey) return { ok: false, skipped: true };
  const to = env.OWNER_NOTIFY_EMAIL || "renate@lmexplorers.com";
  const prod = PRODUCT[opts && opts.pid];
  const pname = (opts && opts.pname) || (prod ? prod.no : (opts && opts.pid) || "produkt");
  const cur = (opts.currency || "").toLowerCase();
  const beløp = opts.amount != null
    ? (cur === "usd" ? "$" + (opts.amount / 100) : (opts.amount / 100) + " kr")
    : "";
  const kunde = (opts.name && opts.name.trim()) ? opts.name.trim() : (opts.email || "en kunde");
  const språk = opts.lang === "en" ? "engelsk" : "norsk";
  const inner =
    "<p>Hei Renate,</p>" +
    "<p>Du har fått et nytt salg 🎉</p>" +
    '<table role="presentation" style="font-size:15px;line-height:1.7;">' +
    "<tr><td><b>Produkt:</b></td><td style=\"padding-left:10px;\">" + esc(pname) + "</td></tr>" +
    (beløp ? "<tr><td><b>Beløp:</b></td><td style=\"padding-left:10px;\">" + esc(beløp) + "</td></tr>" : "") +
    "<tr><td><b>Kunde:</b></td><td style=\"padding-left:10px;\">" + esc(kunde) + (opts.email ? " (" + esc(opts.email) + ")" : "") + "</td></tr>" +
    "<tr><td><b>Språk:</b></td><td style=\"padding-left:10px;\">" + språk + "</td></tr>" +
    "</table>" +
    "<p style=\"color:#6b6470;font-size:14px;\">Kunden har fått bekreftelsen sin automatisk.</p>";

  // Noen salg krever at Renate faktisk gjør noe for at kunden skal få varen.
  // Da skal det stå i e-posten, ikke ligge og vente på at hun oppdager det.
  // Kalleren bestemmer teksten, siden det er den som vet hva som ble solgt.
  const act = opts && opts.action;
  const actInner = act
    ? '<div style="margin:18px 0;padding:14px 16px;background:#fffdf2;' +
      'border:1px solid #f4ecc4;border-radius:12px;">' +
      '<p style="margin:0 0 6px;font-weight:600;">' + esc(act.title || "Dette må du gjøre nå") + "</p>" +
      '<p style="margin:0;font-size:15px;line-height:1.6;">' + esc(act.body || "") + "</p>" +
      (act.url ? '<p style="margin:8px 0 0;"><a href="' + esc(act.url) + '">' + esc(act.url) + "</a></p>" : "") +
      "</div>"
    : "";

  const body = {
    from: { email: FROM_EMAIL, name: FROM_NAME },
    to: [{ email: to, name: FROM_NAME }],
    subject: (act ? "⚠️ Nytt salg, krever handling: " : "🎉 Nytt salg: ") +
             pname + (beløp ? " (" + beløp + ")" : ""),
    html: wrap(inner + actInner),
    text: "Nytt salg! Oppskrift: " + pname + ". " + (beløp ? "Beløp: " + beløp + ". " : "") + "Kunde: " + kunde + (opts.email ? " (" + opts.email + ")" : "") + ". Språk: " + språk + "." +
          (act ? "\n\n" + (act.title || "Dette må du gjøre nå") + "\n" + (act.body || "") + (act.url ? "\n" + act.url : "") : ""),
  };
  try {
    const res = await fetch(MS, {
      method: "POST",
      headers: { Authorization: "Bearer " + apiKey, "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(body),
    });
    return { ok: res.ok, status: res.status };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

/**
 * Kort varsel til Renate ved GRATIS registreringer (gratiskurs, lead
 * magnet/nyhetsbrev osv.), samme mønster som sendOwnerSaleNotice over,
 * men uten beløp, siden ingenting er kjøpt.
 * opts: { what, name, email, lang }
 */
export async function sendOwnerSignupNotice(env, opts) {
  const apiKey = env.MAILERSEND_API_KEY;
  if (!apiKey) return { ok: false, skipped: true };
  const to = env.OWNER_NOTIFY_EMAIL || "renate@lmexplorers.com";
  const what = (opts && opts.what) || "noe gratis";
  const person = (opts.name && opts.name.trim()) ? opts.name.trim() : (opts.email || "en ny person");
  const språk = opts.lang === "en" ? "engelsk" : "norsk";
  const inner =
    "<p>Hei Renate,</p>" +
    "<p>Ny gratis registrering 🌱</p>" +
    '<table role="presentation" style="font-size:15px;line-height:1.7;">' +
    "<tr><td><b>Hva:</b></td><td style=\"padding-left:10px;\">" + esc(what) + "</td></tr>" +
    "<tr><td><b>Person:</b></td><td style=\"padding-left:10px;\">" + esc(person) + (opts.email ? " (" + esc(opts.email) + ")" : "") + "</td></tr>" +
    "<tr><td><b>Språk:</b></td><td style=\"padding-left:10px;\">" + språk + "</td></tr>" +
    "</table>";
  const body = {
    from: { email: FROM_EMAIL, name: FROM_NAME },
    to: [{ email: to, name: FROM_NAME }],
    subject: "🌱 Ny påmelding: " + what,
    html: wrap(inner),
    text: "Ny gratis registrering! " + what + ". Person: " + person + (opts.email ? " (" + opts.email + ")" : "") + ". Språk: " + språk + ".",
  };
  try {
    const res = await fetch(MS, {
      method: "POST",
      headers: { Authorization: "Bearer " + apiKey, "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(body),
    });
    return { ok: res.ok, status: res.status };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

/* Sender én oppskrift-e-post via MailerSend. kind: levering | oppfolging_dag | oppfolging_uke */
export async function sendOppskriftMail(env, opts) {
  const to = opts && opts.to;
  const apiKey = env.MAILERSEND_API_KEY;
  if (!apiKey || !to) return { ok: false, skipped: true };
  const lang = opts.lang === "en" ? "en" : "no";
  const msg = content(opts.kind || "levering", lang, opts.name || "", opts.pid);
  if (!msg) return { ok: false, skipped: true };
  const body = {
    from: { email: FROM_EMAIL, name: FROM_NAME },
    reply_to: { email: FROM_EMAIL, name: FROM_NAME },
    to: [{ email: to, name: opts.name || undefined }],
    subject: msg.subject,
    html: msg.html,
    text: msg.text,
  };
  try {
    const res = await fetch(MS, {
      method: "POST",
      headers: {
        Authorization: "Bearer " + apiKey,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body),
    });
    return { ok: res.ok, status: res.status };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}
