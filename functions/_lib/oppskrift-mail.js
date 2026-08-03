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

/* Kort varsel til Renate ved hvert oppskrift-salg. amount i minste enhet. */
export async function sendOwnerSaleNotice(env, opts) {
  const apiKey = env.MAILERSEND_API_KEY;
  if (!apiKey) return { ok: false, skipped: true };
  const to = env.OWNER_NOTIFY_EMAIL || "renateshobby@hotmail.com";
  const prod = PRODUCT[opts && opts.pid];
  const pname = prod ? prod.no : (opts && opts.pid) || "oppskrift";
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
    "<tr><td><b>Oppskrift:</b></td><td style=\"padding-left:10px;\">" + esc(pname) + "</td></tr>" +
    (beløp ? "<tr><td><b>Beløp:</b></td><td style=\"padding-left:10px;\">" + esc(beløp) + "</td></tr>" : "") +
    "<tr><td><b>Kunde:</b></td><td style=\"padding-left:10px;\">" + esc(kunde) + (opts.email ? " (" + esc(opts.email) + ")" : "") + "</td></tr>" +
    "<tr><td><b>Språk:</b></td><td style=\"padding-left:10px;\">" + språk + "</td></tr>" +
    "</table>" +
    "<p style=\"color:#6b6470;font-size:14px;\">Kunden har fått leveringsmailen med oppskriften automatisk.</p>";
  const body = {
    from: { email: FROM_EMAIL, name: FROM_NAME },
    to: [{ email: to, name: FROM_NAME }],
    subject: "🎉 Nytt salg: " + pname + (beløp ? " (" + beløp + ")" : ""),
    html: wrap(inner),
    text: "Nytt salg! Oppskrift: " + pname + ". " + (beløp ? "Beløp: " + beløp + ". " : "") + "Kunde: " + kunde + (opts.email ? " (" + opts.email + ")" : "") + ". Språk: " + språk + ".",
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
