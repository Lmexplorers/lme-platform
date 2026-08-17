/**
 * LME VideoFlow, transactional e-post via MailerSend. Same visual pattern
 * as functions/_lib/autopilot-mail.js (closest analogous subscription
 * product), bilingual (no/en). Feiler stille, en kjøpsbekreftelse eller
 * påminnelse skal aldri stoppe noe annet (tilgang er allerede gitt/fjernet
 * i KV før disse kalles).
 *
 * Two kinds:
 *   - welcome: sent once, right after checkout.session.completed
 *   - empty:   sent by functions/api/cron/videoflow-followups.js, 3/7/14
 *              days after a generation was first blocked for lack of
 *              credits (queued by videoflow-access.js queueEmptyCreditsReminder)
 */
import { videoFlowCheckoutUrl } from "./purchase-links.js";

const MS = "https://api.mailersend.com/v1/email";
const SITE = "https://lmexplorers.com";
const FROM_EMAIL = "post@lmexplorers.com";
const FROM_NAME = "Renate fra LME";
const STUDIO_URL = SITE + "/videoflow-studio";

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

const WELCOME_COPY = {
  no: {
    subject: "Du er i gang med LME VideoFlow 🎬",
    intro: "Hei {name}, tusen takk for at du ble med på LME VideoFlow!",
    body: "Du har nå 2000 kreditter denne måneden, klare til å brukes på manus, bilder, stemmer og animerte scener. Kredittene fylles automatisk på igjen ved neste fornyelse.",
    cta: "Åpne VideoFlow",
    sign: "Klem fra Renate",
    fallbackName: "",
  },
  en: {
    subject: "You're in with LME VideoFlow 🎬",
    intro: "Hi {name}, thank you so much for joining LME VideoFlow!",
    body: "You now have 2000 credits this month, ready to spend on scripts, images, voices and animated scenes. Credits automatically refill at your next renewal.",
    cta: "Open VideoFlow",
    sign: "Warm wishes, Renate",
    fallbackName: "there",
  },
};

/* Samme mail for dag 3, 7 og 14, kun innledningen varierer litt etter hvor lenge det har gått. */
const EMPTY_COPY = {
  no: {
    subject: "Kredittene dine i VideoFlow er brukt opp",
    lines: {
      3: "Det er noen dager siden VideoFlow-kredittene dine tok slutt.",
      7: "Det er en uke siden VideoFlow-kredittene dine tok slutt.",
      14: "Det er to uker siden VideoFlow-kredittene dine tok slutt.",
    },
    body: "Abonner for 89 kr/mnd og få 2000 nye kreditter med en gang, pluss automatisk påfyll hver måned, så du kan fortsette å lage videoer.",
    cta: "Forny VideoFlow",
    sign: "Klem fra Renate",
    fallbackName: "",
  },
  en: {
    subject: "Your VideoFlow credits ran out",
    lines: {
      3: "It's been a few days since your VideoFlow credits ran out.",
      7: "It's been a week since your VideoFlow credits ran out.",
      14: "It's been two weeks since your VideoFlow credits ran out.",
    },
    body: "Subscribe for $8/mo and get 2000 fresh credits right away, plus automatic monthly refills, so you can keep making videos.",
    cta: "Renew VideoFlow",
    sign: "Warm wishes, Renate",
    fallbackName: "there",
  },
};

export function videoflowWelcomeEmail(lang, name) {
  const l = lang === "en" ? "en" : "no";
  const c = WELCOME_COPY[l];
  const nm = name || c.fallbackName;
  const intro = c.intro.replace("{name}", esc(nm));
  const html = wrap('<p>' + intro + '</p><p>' + c.body + '</p>' + btn(STUDIO_URL, c.cta) + '<p>' + c.sign + '</p>');
  const text = intro + "\n\n" + c.body + "\n\n" + STUDIO_URL + "\n\n" + c.sign;
  return { subject: c.subject, html, text };
}

export function videoflowEmptyCreditsEmail(lang, name, day) {
  const l = lang === "en" ? "en" : "no";
  const c = EMPTY_COPY[l];
  const nm = name || c.fallbackName;
  const greetLine = c.lines[day] || c.lines[3];
  const payUrl = videoFlowCheckoutUrl(l);
  const hello = nm ? ((l === "en" ? "Hi " : "Hei ") + esc(nm) + ",") : "";
  const html = wrap('<p>' + hello + '</p><p>' + greetLine + '</p><p>' + c.body + '</p>' + btn(payUrl, c.cta) + '<p>' + c.sign + '</p>');
  const text = greetLine + "\n\n" + c.body + "\n\n" + payUrl + "\n\n" + c.sign;
  return { subject: c.subject, html, text };
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

export async function sendVideoFlowWelcomeMail(env, to, name, lang) {
  return send(env, to, name, videoflowWelcomeEmail(lang, name));
}

export async function sendVideoFlowEmptyCreditsMail(env, to, name, lang, day) {
  return send(env, to, name, videoflowEmptyCreditsEmail(lang, name, day));
}
