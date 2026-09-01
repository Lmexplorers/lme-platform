/**
 * LME Autopilot — bekreftelses-e-post rett etter kjøp av Start/Proff/VIP
 * (functions/api/oppskrift-webhook.js). Samme MailerSend-oppsett som resten
 * av plattformen. Tospråklig (no/en). Feiler stille, så et kjøp aldri
 * stopper på e-post, tilgangen er allerede gitt via grantAutopilot().
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
    subject: "Du er i gang med {plan} 🎉",
    intro: "Hei {name}, tusen takk for at du ble med på {plan}!",
    /* Sier hva som faktisk er inkludert. Video er 0 i alle planer, og
       autopublisering krever en egen Blotato-konto, saa brevet skal ikke
       love noen av delene. */
    body: "Abonnementet ditt er aktivt med en gang, og du trenger ingen AI-nøkler: bildene og tekstene er inkludert og går på min nøkkel. Logg inn, skriv inn nisjen din under Innstillinger, og la appen lage den første innholdsplanen din. Vil du at den skal legge ut for deg av seg selv, kobler du til Blotato under Innstillinger.",
    cta: "Åpne LME Autopilot",
    sign: "Klem fra Renate",
    fallbackName: "",
  },
  en: {
    subject: "You're in with {plan} 🎉",
    intro: "Hi {name}, thank you so much for joining {plan}!",
    body: "Your subscription is active right away, and you need no AI keys: images and text are included and run on my key. Log in, write your niche under Settings, and let the app build your first content plan. If you want it to post for you on its own, connect Blotato under Settings.",
    cta: "Open LME Autopilot",
    sign: "Warm wishes, Renate",
    fallbackName: "there",
  },
};

export function autopilotEmail(lang, name, planLabel) {
  const l = lang === "en" ? "en" : "no";
  const c = COPY[l];
  const nm = name || c.fallbackName;
  const intro = c.intro.replace("{name}", esc(nm)).replace("{plan}", esc(planLabel));
  const subject = c.subject.replace("{plan}", planLabel);
  const html = wrap('<p>' + intro + '</p><p>' + c.body + '</p>' + btn(SITE + "/apper", c.cta) + '<p>' + c.sign + '</p>');
  const text = intro + "\n\n" + c.body + "\n\n" + SITE + "/apper\n\n" + c.sign;
  return { subject, html, text };
}

export async function sendAutopilotMail(env, to, name, lang, planLabel) {
  const apiKey = env.MAILERSEND_API_KEY;
  if (!apiKey || !to) return { ok: false, skipped: true };
  const msg = autopilotEmail(lang, name, planLabel);
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
