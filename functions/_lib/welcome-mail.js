/**
 * LME velkomst-e-post — sendes automatisk med en gang en ny konto opprettes
 * (functions/api/auth/[action].js, action "register"). Gjenbruker MailerSend,
 * samme oppsett som nyhetsbrevet. Tospråklig (no/en). Avsender post@lmexplorers.com.
 * Krever MAILERSEND_API_KEY. Feiler stille, så en registrering aldri stopper på e-post.
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
    '<div style="max-width:560px;color:#938E99;font-size:12px;padding:16px;">Little Montessori Explorers · Renate Dahl · Tønsberg<br>Du får dette fordi du opprettet en konto hos oss.</div>' +
    '</td></tr></table></body></html>';
}

function btn(href, label) {
  return '<p style="margin:22px 0;"><a href="' + href + '" style="background:#E91E89;color:#ffffff;text-decoration:none;font-weight:bold;padding:13px 24px;border-radius:999px;display:inline-block;">' + label + '</a></p>';
}

const COPY = {
  no: {
    subject: "Velkommen til LME 🌸",
    intro: "Hei {name}, så glad for å ha deg her!",
    body: "Kontoen din er klar. LME er stedet der du lærer Montessori, skaper ditt eget innhold med AI, blir synlig og bygger noe eget, alt på ett sted. Du trenger ikke kunne alt fra start. Begynn med ett lite steg, så tar vi resten sammen.",
    cta: "Gå til plattformen",
    sign: "Klem fra Renate",
    fallbackName: "",
  },
  en: {
    subject: "Welcome to LME 🌸",
    intro: "Hi {name}, so glad to have you here!",
    body: "Your account is ready. LME is where you learn Montessori, create your own content with AI, get visible and build something of your own, all in one place. You don't need to know everything from the start. Begin with one small step, and we'll take the rest together.",
    cta: "Go to the platform",
    sign: "Warm wishes, Renate",
    fallbackName: "there",
  },
};

export function welcomeEmail(lang, name) {
  const l = lang === "en" ? "en" : "no";
  const c = COPY[l];
  const nm = name || c.fallbackName;
  const intro = c.intro.replace("{name}", esc(nm));
  const html = wrap('<p>' + intro + '</p><p>' + c.body + '</p>' + btn(SITE + "/dashboard", c.cta) + '<p>' + c.sign + '</p>');
  const text = intro.replace(/<[^>]+>/g, "") + "\n\n" + c.body + "\n\n" + SITE + "/dashboard\n\n" + c.sign;
  return { subject: c.subject, html: html, text: text };
}

/* Sender velkomst-e-posten via MailerSend. Feiler stille (returnerer et objekt). */
export async function sendWelcome(env, user, lang) {
  const apiKey = env.MAILERSEND_API_KEY;
  const to = user && user.email;
  if (!apiKey || !to) return { ok: false, skipped: true };
  const msg = welcomeEmail(lang, user.name);
  try {
    const res = await fetch(MS, {
      method: "POST",
      headers: {
        Authorization: "Bearer " + apiKey,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        from: { email: FROM_EMAIL, name: FROM_NAME },
        reply_to: { email: "renate@lmexplorers.com", name: "Renate Dahl" },
        to: [{ email: to, name: user.name || undefined }],
        subject: msg.subject,
        html: msg.html,
        text: msg.text,
      }),
    });
    return { ok: res.ok, status: res.status };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}
