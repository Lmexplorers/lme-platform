/**
 * Gratis kurstilgang mot e-postbekreftelse (dobbel opt-in).
 *
 * Noen ber om gratis tilgang til et kurs (f.eks. via en kommentar "COURSE"
 * på sosiale medier). I stedet for at Renate sender lenken manuelt hver
 * gang, samler denne inn e-posten, sender en bekreftelseslenke, og gir
 * kurslenken først når de har bekreftet. Samme MailerSend-oppsett som
 * resten av plattformen (_lib/newsletter.js, _lib/claude-mail.js).
 */

const MS = "https://api.mailersend.com/v1/email";
const SITE = "https://lmexplorers.com";
const FROM_EMAIL = "post@lmexplorers.com";
const FROM_NAME = "Renate fra LME";

function wrap(inner) {
  return '<!DOCTYPE html><html><body style="margin:0;background:#FBF7F0;font-family:Arial,Helvetica,sans-serif;color:#1F1B24;">' +
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#FBF7F0;padding:24px 0;"><tr><td align="center">' +
    '<table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:18px;overflow:hidden;">' +
    '<tr><td style="padding:26px 32px 4px;text-align:center;"><img src="' + SITE + '/images/lme-logo.png" alt="Little Montessori Explorers" width="110" style="width:110px;height:auto;"></td></tr>' +
    '<tr><td style="padding:6px 32px 28px;font-size:16px;line-height:1.65;color:#3a343f;">' + inner + '</td></tr>' +
    '</table>' +
    '<div style="max-width:560px;color:#938E99;font-size:12px;padding:16px;">Little Montessori Explorers · Renate Dahl · Tønsberg</div>' +
    '</td></tr></table></body></html>';
}
function btn(href, label) {
  return '<p style="margin:22px 0;"><a href="' + href + '" style="background:#E91E89;color:#ffffff;text-decoration:none;font-weight:bold;padding:13px 24px;border-radius:999px;display:inline-block;">' + label + '</a></p>';
}
function mk(intro, body, ctaHref, ctaLabel, sign) {
  return wrap('<p>' + intro + '</p><p>' + body + '</p>' + btn(ctaHref, ctaLabel) + '<p>' + sign + '</p>');
}
// To knapper (kurs + arbeidsbok), for leveringsmailen.
function mk2(intro, body, pairs, sign) {
  const btns = pairs.map((p) => btn(p[0], p[1])).join('');
  return wrap('<p>' + intro + '</p><p>' + body + '</p>' + btns + '<p>' + sign + '</p>');
}

const COURSE_URL = SITE + "/kurs/youtube";
const WORKBOOK_PDF_NO = SITE + "/funnel/nedlasting/LME-YouTube-kurs-arbeidsbok.pdf";
const WORKBOOK_PDF_EN = SITE + "/funnel/nedlasting/LME-YouTube-kurs-arbeidsbok-EN.pdf";

function confirmTemplate(lang, name, confirmUrl) {
  const hi = name ? (lang === "en" ? "Hi " + name + "," : "Hei " + name + ",") : (lang === "en" ? "Hi," : "Hei,");
  if (lang === "en") {
    return {
      subject: "Confirm to get the free YouTube course",
      html: mk(hi, "One quick click, and I'll send you free access to \"Grow on YouTube with AI\" right away.",
        confirmUrl, "Confirm and get the course", "Warm wishes,<br>Renate"),
      text: hi + "\n\nConfirm here to get free access: " + confirmUrl + "\n\nWarm wishes,\nRenate",
    };
  }
  return {
    subject: "Bekreft for å få det gratis YouTube-kurset",
    html: mk(hi, "Ett lite klikk, så sender jeg deg gratis tilgang til \"Voks på YouTube med AI\" med en gang.",
      confirmUrl, "Bekreft og få kurset", "Klem fra Renate"),
    text: hi + "\n\nBekreft her for gratis tilgang: " + confirmUrl + "\n\nKlem fra Renate",
  };
}

function deliverTemplate(lang, name) {
  const hi = name ? (lang === "en" ? "Hi " + name + "," : "Hei " + name + ",") : (lang === "en" ? "Hi," : "Hei,");
  if (lang === "en") {
    return {
      subject: "Here's your free course 🌱",
      html: mk2(hi, "Thanks for confirming! Here's your free access to \"Grow on YouTube with AI\", build a channel without ever showing your face, with AI helping on the script, voice and editing. I've also attached the workbook that follows the course, with reflection, checklists and one concrete step per part.",
        [[COURSE_URL, "Open the course"], [WORKBOOK_PDF_EN, "Download the workbook (PDF)"]], "Warm wishes,<br>Renate"),
      text: hi + "\n\nHere's your course: " + COURSE_URL + "\nWorkbook (PDF): " + WORKBOOK_PDF_EN + "\n\nWarm wishes,\nRenate",
    };
  }
  return {
    subject: "Her er kurset ditt, gratis 🌱",
    html: mk2(hi, "Takk for at du bekreftet! Her er gratis tilgang til \"Voks på YouTube med AI\", bygg en kanal uten å vise ansikt, med AI som hjelper på manus, stemme og redigering. Jeg har også lagt ved arbeidsboken som følger kurset, med refleksjon, sjekklister og ett konkret steg per del.",
      [[COURSE_URL, "Åpne kurset"], [WORKBOOK_PDF_NO, "Last ned arbeidsboken (PDF)"]], "Klem fra Renate"),
    text: hi + "\n\nHer er kurset: " + COURSE_URL + "\nArbeidsbok (PDF): " + WORKBOOK_PDF_NO + "\n\nKlem fra Renate",
  };
}

async function send(env, to, name, msg) {
  const apiKey = env.MAILERSEND_API_KEY;
  if (!apiKey || !to) return { ok: false, skipped: true };
  try {
    const res = await fetch(MS, {
      method: "POST",
      headers: { Authorization: "Bearer " + apiKey, "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        from: { email: FROM_EMAIL, name: FROM_NAME },
        reply_to: { email: "renate@lmexplorers.com", name: "Renate Dahl" },
        to: [{ email: to, name: name || undefined }],
        subject: msg.subject, html: msg.html, text: msg.text,
      }),
    });
    return { ok: res.ok, status: res.status };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

export async function sendConfirmMail(env, to, name, lang, confirmUrl) {
  return send(env, to, name, confirmTemplate(lang === "en" ? "en" : "no", name, confirmUrl));
}
export async function sendDeliverMail(env, to, name, lang) {
  return send(env, to, name, deliverTemplate(lang === "en" ? "en" : "no", name));
}
export { COURSE_URL };
