/**
 * Leveringsmail for Mia & Teo skoledagbok (digital PDF, norsk + engelsk i
 * ett kjøp). Sendes rett etter kjøp fra functions/api/oppskrift-webhook.js.
 * Samme MailerSend-oppsett og HTML-mal som resten av plattformen.
 */

const MS = "https://api.mailersend.com/v1/email";
const SITE = "https://lmexplorers.com";
const SHOP_NO = SITE + "/butikk";
const SHOP_EN = SITE + "/shop";
const FROM_EMAIL = "renate@lmexplorers.com";
const FROM_NAME = "Renate Dahl";

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

/**
 * Sender leveringsmail med lenker til BEGGE språk-PDF-ene for det kjøpte
 * trinnet. lang styrer bare e-postens eget språk, ikke hvilke filer som
 * lenkes, siden kjøpet alltid gir norsk + engelsk.
 * opts: { to, name, lang, book: "1-3"|"4-7", bookName, files: {no,en} }
 */
export async function sendSkoledagbokMail(env, opts) {
  const to = opts && opts.to;
  const apiKey = env.MAILERSEND_API_KEY;
  if (!apiKey || !to) return { ok: false, skipped: true };
  const lang = opts.lang === "en" ? "en" : "no";
  const name = opts.name || "";
  const bookName = opts.bookName || "Mia & Teo Skoledagbok";
  const files = opts.files || {};
  const shop = lang === "en" ? SHOP_EN : SHOP_NO;

  let subject, html, text;
  if (lang === "en") {
    subject = "Thank you! Here is your school diary 💛";
    html = wrap(
      "<p>Hi " + esc(name || "there") + ",</p>" +
      "<p>Thank you so much for your purchase 💛 Here is <b>" + esc(bookName) + "</b>, ready to print, in both languages:</p>" +
      btn(files.en, "Download the English PDF") +
      btn(files.no, "Download the Norwegian PDF") +
      "<p>The diary is 358 pages, one page per day for the school year, with room to write, draw and reflect in the Montessori spirit.</p>" +
      "<p>If anything looks off in your download, just reply to this email and I will sort it out.</p>" +
      "<p>Enjoy the school year!<br>Warm wishes, Renate</p>"),
    text = "Hi " + name + ",\n\nThank you for your purchase of " + bookName + ". Download the English PDF: " + files.en + "\nDownload the Norwegian PDF: " + files.no + "\n\nWarm wishes, Renate";
  } else {
    subject = "Tusen takk! Her er skoledagboka di 💛";
    html = wrap(
      "<p>Hei " + esc(name || "") + ",</p>" +
      "<p>Tusen takk for kjøpet 💛 Her er <b>" + esc(bookName) + "</b>, klar til å skrive ut, på begge språk:</p>" +
      btn(files.no, "Last ned norsk PDF") +
      btn(files.en, "Last ned engelsk PDF") +
      "<p>Dagboka har 358 sider, én side per skoledag, med plass til å skrive, tegne og reflektere i Montessoriånd.</p>" +
      "<p>Er det noe som ikke stemmer med nedlastingen, svar bare på denne e-posten, så ordner jeg det.</p>" +
      "<p>God skoleår!<br>Klem fra Renate</p>"),
    text = "Hei " + name + ",\n\nTusen takk for kjøpet av " + bookName + ". Last ned norsk PDF: " + files.no + "\nLast ned engelsk PDF: " + files.en + "\n\nKlem fra Renate";
  }

  const body = {
    from: { email: FROM_EMAIL, name: FROM_NAME },
    reply_to: { email: FROM_EMAIL, name: FROM_NAME },
    to: [{ email: to, name: name || undefined }],
    subject: subject,
    html: html,
    text: text,
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
