/**
 * E-poster for Mia & Teo skoledagbok-kjøpere: leveringsmail (norsk +
 * engelsk PDF i ett kjøp) rett etter kjøp, og to oppfølgere med mersalg fra
 * resten av plattformen (dag 3 og uke 2), samme mønster som oppskriftene
 * (oppskrift-mail.js) og Claude-kurset. Sendes fra
 * functions/api/oppskrift-webhook.js (levering, rett etter kjøp) og
 * functions/api/cron/skoledagbok-followups.js (oppfølgerne, fra KV-køen).
 */

import { SKOLEDAGBOK_INFO } from "./purchase-links.js";

const MS = "https://api.mailersend.com/v1/email";
const SITE = "https://lmexplorers.com";
const SHOP_NO = SITE + "/butikk";
const SHOP_EN = SITE + "/shop";
const DIARY_PAGE = SITE + "/butikk/skoledagbok";
const ACADEMY = SITE + "/academy";
const MEMBERSHIP = SITE + "/medlemskap";
const FROM_EMAIL = "renate@lmexplorers.com";
const FROM_NAME = "Renate Dahl";

function medNokkel(url, nokkel) {
  if (!nokkel || !url) return url;
  const u = String(url);
  if (!(u.charAt(0) === "/" || u.indexOf(SITE + "/") === 0)) return u;
  return u + (u.indexOf("?") >= 0 ? "&" : "?") + "t=" + encodeURIComponent(nokkel);
}

function esc(s) {
  return (s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function wrap(inner) {
  return '<!DOCTYPE html><html><head><meta charset="utf-8"></head>' +
    '<body style="margin:0;background:#FBF7F0;font-family:Arial,Helvetica,sans-serif;color:#1F1B24;">' +
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#FBF7F0;padding:24px 0;"><tr><td align="center">' +
    '<table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:18px;overflow:hidden;">' +
    '<tr><td style="padding:28px 32px 6px;text-align:center;"><img src="' + SITE + '/images/lme-logo.png" alt="Little Montessori Explorers" width="120" style="width:120px;height:auto;"></td></tr>' +
    '<tr><td style="padding:6px 32px 30px;font-size:16px;line-height:1.65;color:#3a343f;">' + inner + '</td></tr>' +
    '</table>' +
    '<div style="max-width:560px;color:#938E99;font-size:12px;padding:16px;">Little Montessori Explorers · Renate Dahl · Tønsberg</div>' +
    '</td></tr></table></body></html>';
}

function btn(href, label) {
  return '<p style="margin:18px 0;"><a href="' + href + '" style="background:#E91E89;color:#ffffff;text-decoration:none;font-weight:bold;padding:14px 26px;border-radius:999px;display:inline-block;">' + esc(label) + '</a></p>';
}

function link(href, label) {
  return '<a href="' + href + '" style="color:#E91E89;font-weight:bold;">' + esc(label) + '</a>';
}

function otherBook(book) { return book === "4-7" ? "1-3" : "4-7"; }

function content(kind, lang, name, book, nokkel) {
  const info = SKOLEDAGBOK_INFO[book] || SKOLEDAGBOK_INFO["1-3"];
  const bookName = info.name[lang] || info.name.no;
  /* Nedlastingene er låst. Uten nøkkelen på lenken møter kjøperen låsen i
     stedet for boka si. Lenker til andre nettsteder røres ikke. */
  const files = {
    no: medNokkel(info.files.no, nokkel),
    en: medNokkel(info.files.en, nokkel),
  };
  const other = SKOLEDAGBOK_INFO[otherBook(book)];
  const otherName = other.name[lang] || other.name.no;
  const shop = lang === "en" ? SHOP_EN : SHOP_NO;

  if (lang === "en") {
    if (kind === "levering") return {
      subject: "Thank you! Here is your school diary 💛",
      html: wrap(
        "<p>Hi " + esc(name || "there") + ",</p>" +
        "<p>Thank you so much for your purchase 💛 Here is <b>" + esc(bookName) + "</b>, ready to print, in both languages:</p>" +
        btn(files.en, "Download the English PDF") +
        btn(files.no, "Download the Norwegian PDF") +
        "<p>The diary is 358 pages, one page per day for the school year, with room to write, draw and reflect in the Montessori spirit.</p>" +
        "<p>If anything looks off in your download, just reply to this email and I will sort it out.</p>" +
        "<p>Enjoy the school year!<br>Warm wishes, Renate</p>"),
      text: "Hi " + name + ",\n\nThank you for your purchase of " + bookName + ". Download the English PDF: " + files.en + "\nDownload the Norwegian PDF: " + files.no + "\n\nWarm wishes, Renate",
    };
    if (kind === "oppfolging_dag") return {
      subject: "How is the school diary going?",
      html: wrap(
        "<p>Hi " + esc(name || "there") + ",</p>" +
        "<p>I just wanted to check in, have you had a chance to start on " + esc(bookName) + " yet 💛</p>" +
        "<p>If a page or a question ever feels unclear, just reply to this email, I am happy to help.</p>" +
        "<p>While you are here: if you would like more from LME, I also have " + link(ACADEMY, "Montessori courses for the whole family") + " and " + link(MEMBERSHIP, "the Inner Circle community") + ", both built the same way as the diary, practical and made to actually be used.</p>" +
        "<p>Warm wishes, Renate</p>"),
      text: "Hi " + name + ",\n\nHave you started on " + bookName + "? If anything is unclear, just reply. More from LME: " + ACADEMY + " and " + MEMBERSHIP + "\n\nWarm wishes, Renate",
    };
    return {
      subject: "A couple more things you might like 💛",
      html: wrap(
        "<p>Hi " + esc(name || "there") + ",</p>" +
        "<p>It has been a couple of weeks now, so I hope " + esc(bookName) + " has become part of the daily rhythm 💛</p>" +
        "<p>A few things from LME you might enjoy next:</p>" +
        '<ul style="padding-left:20px;margin:14px 0;">' +
        '<li style="margin:8px 0;">' + link(DIARY_PAGE, otherName) + ", perfect for a sibling" + '</li>' +
        '<li style="margin:8px 0;">' + link(shop, "The rest of the LME Shop") + " (picture books, patterns and more)" + '</li>' +
        '<li style="margin:8px 0;">' + link(ACADEMY, "Montessori courses") + " for you as a parent or educator" + '</li>' +
        '<li style="margin:8px 0;">' + link(MEMBERSHIP, "The Inner Circle") + ", a community for families who love Montessori" + '</li>' +
        '</ul>' +
        "<p>I would also love to hear how the diary is being used, just reply and tell me, or send a photo. It genuinely makes my day.</p>" +
        "<p>Thank you for supporting what I make.<br>Warm wishes, Renate</p>"),
      text: "Hi " + name + ",\n\nI hope " + bookName + " has become part of the daily rhythm. A few things you might like next: " + otherName + " (" + DIARY_PAGE + "), the shop (" + shop + "), courses (" + ACADEMY + "), the Inner Circle (" + MEMBERSHIP + "). I would love to hear how it's going.\n\nWarm wishes, Renate",
    };
  }

  // norsk
  if (kind === "levering") return {
    subject: "Tusen takk! Her er skoledagboka di 💛",
    html: wrap(
      "<p>Hei " + esc(name || "") + ",</p>" +
      "<p>Tusen takk for kjøpet 💛 Her er <b>" + esc(bookName) + "</b>, klar til å skrive ut, på begge språk:</p>" +
      btn(files.no, "Last ned norsk PDF") +
      btn(files.en, "Last ned engelsk PDF") +
      "<p>Dagboka har 358 sider, én side per skoledag, med plass til å skrive, tegne og reflektere i Montessoriånd.</p>" +
      "<p>Er det noe som ikke stemmer med nedlastingen, svar bare på denne e-posten, så ordner jeg det.</p>" +
      "<p>God skoleår!<br>Klem fra Renate</p>"),
    text: "Hei " + name + ",\n\nTusen takk for kjøpet av " + bookName + ". Last ned norsk PDF: " + files.no + "\nLast ned engelsk PDF: " + files.en + "\n\nKlem fra Renate",
  };
  if (kind === "oppfolging_dag") return {
    subject: "Hvordan går det med skoledagboka?",
    html: wrap(
      "<p>Hei " + esc(name || "") + ",</p>" +
      "<p>Jeg lurte bare på om dere har fått begynt på " + esc(bookName) + " 💛</p>" +
      "<p>Er det noe som er uklart på en side eller et spørsmål, er det bare å svare på denne e-posten, jeg hjelper gjerne.</p>" +
      "<p>Siden du først er her: har du lyst på mer fra LME, har jeg også " + link(ACADEMY, "Montessori-kurs for hele familien") + " og " + link(MEMBERSHIP, "Inner Circle-fellesskapet") + ", laget på samme måte som dagboka, praktisk og til å faktisk bruke.</p>" +
      "<p>Klem fra Renate</p>"),
    text: "Hei " + name + ",\n\nHar dere begynt på " + bookName + "? Er noe uklart, bare svar. Mer fra LME: " + ACADEMY + " og " + MEMBERSHIP + "\n\nKlem fra Renate",
  };
  return {
    subject: "Et par ting til du kanskje liker 💛",
    html: wrap(
      "<p>Hei " + esc(name || "") + ",</p>" +
      "<p>Nå har det gått et par uker, så jeg håper " + esc(bookName) + " har blitt en del av hverdagen 💛</p>" +
      "<p>Noen ting fra LME du kanskje har lyst på nå:</p>" +
      '<ul style="padding-left:20px;margin:14px 0;">' +
      '<li style="margin:8px 0;">' + link(DIARY_PAGE, otherName) + ", fin til søsken" + '</li>' +
      '<li style="margin:8px 0;">' + link(shop, "Resten av LME Butikk") + " (bildebøker, oppskrifter og mer)" + '</li>' +
      '<li style="margin:8px 0;">' + link(ACADEMY, "Montessori-kurs") + " for deg som forelder eller pedagog" + '</li>' +
      '<li style="margin:8px 0;">' + link(MEMBERSHIP, "Inner Circle") + ", et fellesskap for familier som er glad i Montessori" + '</li>' +
      '</ul>' +
      "<p>Jeg blir også veldig glad om du forteller hvordan dagboka brukes hos dere, svar gjerne på denne, eller send et bilde. Det gjør dagen min.</p>" +
      "<p>Takk for at du støtter det jeg lager.<br>Klem fra Renate</p>"),
    text: "Hei " + name + ",\n\nJeg håper " + bookName + " har blitt en del av hverdagen. Noen ting du kanskje liker nå: " + otherName + " (" + DIARY_PAGE + "), butikken (" + shop + "), kurs (" + ACADEMY + "), Inner Circle (" + MEMBERSHIP + "). Jeg blir glad om du forteller hvordan det går.\n\nKlem fra Renate",
  };
}

/**
 * kind: "levering" | "oppfolging_dag" | "oppfolging_uke"
 * opts: { to, name, lang, book: "1-3"|"4-7" }
 * Leveringsmailen lenker alltid til BEGGE språk-PDF-ene for det kjøpte
 * trinnet, uansett hvilken språklenke/pris kunden brukte, siden ett kjøp
 * alltid gir norsk + engelsk. "lang" styrer kun e-postens eget språk.
 */
export async function sendSkoledagbokMail(env, opts) {
  const to = opts && opts.to;
  const apiKey = env.MAILERSEND_API_KEY;
  if (!apiKey || !to) return { ok: false, skipped: true };
  const lang = opts.lang === "en" ? "en" : "no";
  const book = SKOLEDAGBOK_INFO[opts.book] ? opts.book : "1-3";
  const name = opts.name || "";
  const msg = content(opts.kind || "levering", lang, name, book, opts.nokkel);
  if (!msg) return { ok: false, skipped: true };

  const body = {
    from: { email: FROM_EMAIL, name: FROM_NAME },
    reply_to: { email: FROM_EMAIL, name: FROM_NAME },
    to: [{ email: to, name: name || undefined }],
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
