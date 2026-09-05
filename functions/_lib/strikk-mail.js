/**
 * LME Strikk & Hekle, engangskjøp: kvitteringen til kjøperen.
 *
 * Brevet har én jobb utover å takke: å gi henne lenken inn i appen. Hun har
 * ingen konto hos meg, og skal ikke trenge en. Lenken har hennes eget token
 * (?t=...), og appen husker det i nettleseren hennes første gang hun åpner
 * den. Mister hun e-posten, kan hun be om lenken på nytt fra salgssiden.
 *
 * Sendes med MailerSend rett fra koden, samme mønster som resten av
 * plattformen (CLAUDE.md: MailerLite skal aldri brukes igjen).
 */
const MS = "https://api.mailersend.com/v1/email";
const SITE = "https://lmexplorers.com";
const FROM_EMAIL = "post@lmexplorers.com";
const FROM_NAME = "Renate fra LME";

function esc(s) {
  return (s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function wrap(inner) {
  return '<!DOCTYPE html><html><body style="margin:0;background:#FBF7F0;font-family:Arial,Helvetica,sans-serif;color:#1F1B24;">' +
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#FBF7F0;padding:24px 0;"><tr><td align="center">' +
    '<table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:18px;overflow:hidden;">' +
    '<tr><td style="padding:28px 32px 6px;text-align:center;"><img src="' + SITE + '/images/lme-logo.png" alt="Little Montessori Explorers" width="120" style="width:120px;height:auto;"></td></tr>' +
    '<tr><td style="padding:6px 32px 30px;font-size:16px;line-height:1.65;color:#3a343f;">' + inner + '</td></tr>' +
    '</table>' +
    '<div style="max-width:560px;color:#938E99;font-size:12px;padding:16px;">Little Montessori Explorers · Renate Dahl · Tønsberg</div>' +
    '</td></tr></table></body></html>';
}

function btn(href, label) {
  return '<p style="margin:22px 0;"><a href="' + href + '" style="background:#E91E89;color:#ffffff;text-decoration:none;font-weight:bold;padding:14px 26px;border-radius:999px;display:inline-block;">' + label + '</a></p>';
}

export async function sendMail(env, to, toName, subject, html) {
  if (!env || !env.MAILERSEND_API_KEY || !to) return { ok: false, grunn: "mangler_nokkel_eller_mottaker" };
  try {
    const r = await fetch(MS, {
      method: "POST",
      headers: {
        Authorization: "Bearer " + env.MAILERSEND_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: { email: FROM_EMAIL, name: FROM_NAME },
        to: [{ email: to, name: toName || to }],
        subject: subject,
        html: html,
      }),
    });
    if (!r.ok) return { ok: false, grunn: "mailersend_" + r.status };
    return { ok: true };
  } catch (e) {
    return { ok: false, grunn: "nettverk" };
  }
}

const send = sendMail;

/** Den personlige lenken inn i appen. */
export function appLenke(token) {
  return SITE + "/strikk" + (token ? "?t=" + encodeURIComponent(token) : "");
}

export async function sendStrikkKjopMail(env, { to, name, lang, token, betaltMed }) {
  const en = lang === "en";
  const fornavn = esc((name || "").split(" ")[0]);
  const hei = fornavn ? (en ? "Hi " + fornavn + "," : "Hei " + fornavn + ",") : (en ? "Hi," : "Hei,");
  const lenke = appLenke(token);
  const betalt = betaltMed === "vipps" ? (en ? "Vipps" : "Vipps") : (en ? "card" : "kort");

  const inner = en
    ? '<h2 style="font-size:21px;margin:0 0 14px;">The app is yours</h2>' +
      "<p>" + hei + "</p>" +
      "<p>Thank you. <strong>LME Knit &amp; Crochet</strong> is yours now, paid once, with nothing to cancel. Here is your own way in:</p>" +
      btn(lenke, "Open the app") +
      '<p style="margin:18px 0 6px;"><strong>Three things worth knowing:</strong></p>' +
      '<ol style="margin:0 0 18px;padding-left:20px;">' +
      "<li><strong>This link is yours.</strong> The app remembers it in your browser the first time, so later you can just go to lmexplorers.com/strikk. Keep the email in case you change phone.</li>" +
      "<li><strong>Put it on your home screen.</strong> Open the link on your phone, tap the share button and choose Add to home screen. Then it sits there like any other app, and opens straight into your work.</li>" +
      "<li><strong>Start with a swatch.</strong> Every calculation builds on your gauge. Knit at least 12 x 12 cm, wash it the way you will wash the garment, and count in the middle of it.</li>" +
      "</ol>" +
      "<p>You paid with " + betalt + ". If anything is unclear, just answer this email. It comes straight to me.</p>" +
      "<p>Warm wishes,<br>Renate</p>"
    : '<h2 style="font-size:21px;margin:0 0 14px;">Appen er din</h2>' +
      "<p>" + hei + "</p>" +
      "<p>Tusen takk. <strong>LME Strikk &amp; Hekle</strong> er din nå, betalt én gang, uten noe å si opp. Her er din egen vei inn:</p>" +
      btn(lenke, "Åpne appen") +
      '<p style="margin:18px 0 6px;"><strong>Tre ting det er verdt å vite:</strong></p>' +
      '<ol style="margin:0 0 18px;padding-left:20px;">' +
      "<li><strong>Lenken er din.</strong> Appen husker den i nettleseren din første gang, så senere kan du bare gå til lmexplorers.com/strikk. Ta vare på denne e-posten i tilfelle du bytter telefon.</li>" +
      "<li><strong>Legg den på hjemskjermen.</strong> Åpne lenken på telefonen, trykk på del-knappen og velg Legg til på Hjem-skjerm. Da ligger den der som en hvilken som helst annen app, og åpner rett i arbeidet ditt.</li>" +
      "<li><strong>Start med en prøvelapp.</strong> Alle utregningene bygger på strikkefastheten din. Strikk minst 12 x 12 cm, vask den slik du vil vaske plagget, og tell midt i lappen.</li>" +
      "</ol>" +
      "<p>Du betalte med " + betalt + ". Er noe uklart, svar på denne e-posten. Den kommer rett til meg.</p>" +
      "<p>Klem,<br>Renate</p>";

  return send(env, to, name, en ? "Your app is ready, here is the link" : "Appen din er klar, her er lenken", wrap(inner));
}

/** Sender lenken på nytt til en som har mistet e-posten. */
export async function sendStrikkLenkePaaNytt(env, { to, name, lang, token }) {
  const en = lang === "en";
  const lenke = appLenke(token);
  const inner = en
    ? '<h2 style="font-size:21px;margin:0 0 14px;">Here is your link again</h2>' +
      "<p>No problem, here it is:</p>" + btn(lenke, "Open the app") +
      "<p>The app remembers it in this browser once you have opened it.</p><p>Warm wishes,<br>Renate</p>"
    : '<h2 style="font-size:21px;margin:0 0 14px;">Her er lenken din igjen</h2>' +
      "<p>Ikke noe problem, her er den:</p>" + btn(lenke, "Åpne appen") +
      "<p>Appen husker den i denne nettleseren når du har åpnet den én gang.</p><p>Klem,<br>Renate</p>";
  return send(env, to, name, en ? "Your link to Knit & Crochet" : "Lenken din til Strikk & Hekle", wrap(inner));
}

