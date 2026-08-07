/**
 * Leveringsmail for låste enkeltkurs (YouTube, Videre med YouTube, KI for
 * pedagoger): sendes rett etter kjøp (functions/api/oppskrift-webhook.js)
 * OG rett etter gratis-bekreftelse i lanseringsvinduet (functions/api/free-course.js).
 * Inneholder den personlige tilgangslenken (?t=<token>) som js/course-gate.js
 * sjekker mot. Samme MailerSend-oppsett som resten av plattformen.
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
    '<tr><td style="padding:26px 32px 4px;text-align:center;"><img src="' + SITE + '/images/lme-logo.png" alt="Little Montessori Explorers" width="110" style="width:110px;height:auto;"></td></tr>' +
    '<tr><td style="padding:6px 32px 28px;font-size:16px;line-height:1.65;color:#3a343f;">' + inner + '</td></tr>' +
    '</table>' +
    '<div style="max-width:560px;color:#938E99;font-size:12px;padding:16px;">Little Montessori Explorers · Renate Dahl · Tønsberg</div>' +
    '</td></tr></table></body></html>';
}

function btn(href, label) {
  return '<p style="margin:22px 0;"><a href="' + href + '" style="background:#E91E89;color:#ffffff;text-decoration:none;font-weight:bold;padding:13px 24px;border-radius:999px;display:inline-block;">' + esc(label) + '</a></p>';
}

const COPY = {
  no: {
    subjectPaid: "Du er i gang med {course} 🎉",
    subjectFree: "Her er kurset ditt, gratis 🌱",
    introPaid: "Hei {name}, tusen takk for at du kjøpte {course}!",
    introFree: "Hei {name}, her er den gratis tilgangen til {course}!",
    body: "Lenken under er personlig og gir deg tilgang for alltid, lagre denne e-posten så du finner den igjen.",
    cta: "Åpne kurset",
    sign: "Klem fra Renate",
    fallbackName: "",
  },
  en: {
    subjectPaid: "You're in with {course} 🎉",
    subjectFree: "Here's your free course 🌱",
    introPaid: "Hi {name}, thank you so much for buying {course}!",
    introFree: "Hi {name}, here's your free access to {course}!",
    body: "The link below is personal and gives you access forever, save this email so you can find it again.",
    cta: "Open the course",
    sign: "Warm wishes, Renate",
    fallbackName: "there",
  },
};

/* paid: true|false — bare tekst, tilgangen er den samme i begge tilfeller. */
export function courseDeliveryEmail(lang, name, courseName, courseUrl, token, paid) {
  const l = lang === "en" ? "en" : "no";
  const c = COPY[l];
  const nm = name || c.fallbackName;
  const intro = (paid ? c.introPaid : c.introFree).replace("{name}", esc(nm)).replace("{course}", esc(courseName));
  const subject = (paid ? c.subjectPaid : c.subjectFree).replace("{course}", courseName);
  const link = courseUrl + "?t=" + encodeURIComponent(token);
  const html = wrap('<p>' + intro + '</p><p>' + c.body + '</p>' + btn(link, c.cta) + '<p>' + c.sign + '</p>');
  const text = intro + "\n\n" + c.body + "\n\n" + link + "\n\n" + c.sign;
  return { subject, html, text };
}

export async function sendCourseDeliveryMail(env, to, name, lang, courseName, courseUrl, token, paid) {
  const apiKey = env.MAILERSEND_API_KEY;
  if (!apiKey || !to) return { ok: false, skipped: true };
  const msg = courseDeliveryEmail(lang, name, courseName, courseUrl, token, paid);
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
