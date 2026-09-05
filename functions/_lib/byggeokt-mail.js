/**
 * Byggeøkten 24. september, påminnelser via MailerSend.
 *
 * Samme mønster som Claude-kursets e-poster (_lib/claude-mail.js): teksten
 * står her i koden, på norsk og engelsk, og sendes med MAILERSEND_API_KEY.
 * Ingen ekstern automasjon.
 *
 * Køen er lista over kjøpere (byggeokt:deltakere i BUILDER_KV), som fylles
 * av webhooken når billetten er betalt. Hvilke påminnelser som er sendt
 * ligger på samme oppføring, så ingen får den samme to ganger.
 */

const MS = "https://api.mailersend.com/v1/email";
const SITE = "https://lmexplorers.com";
const FROM_EMAIL = "renate@lmexplorers.com";
const FROM_NAME = "Renate Dahl";

export const DELTAKER_KEY = "byggeokt:deltakere";
export const OKT_START = "2026-09-24T20:00:00+02:00";

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

const DELTAKERSIDE = SITE + "/byggeokt-deltaker";
const WORKSHOP = SITE + "/academy/kurs?k=ai-assistent-workshop";

/* De tre påminnelsene. Nøkkelen brukes også til å huske hva som er sendt. */
export const MINNER = ["uken-for", "dagen-for", "en-time-for"];

function innhold(type, navn, lang) {
  const hei = lang === "en" ? "Hi " : "Hei ";
  const n = esc(navn || (lang === "en" ? "there" : "du"));

  if (type === "uken-for") {
    return lang === "en" ? {
      subject: "One week to the build session, here is how to prepare",
      html: wrap(
        "<p>" + hei + n + ",</p>" +
        "<p>In one week we build together: Thursday 24 September at 20:00 Norwegian time, three hours.</p>" +
        "<p>Two things to do before then, and both are small:</p>" +
        "<p>1. Take the workshop that came with your ticket. It teaches you to describe a job clearly, which is the whole skill the evening rests on.</p>" +
        "<p>2. Create a Claude account if you do not have one, and think about what your app should do.</p>" +
        btn(WORKSHOP, "Open the workshop") +
        "<p>Everything about the evening lives on your participant page, and the link to the room goes up there.</p>" +
        btn(DELTAKERSIDE, "Open the participant page") +
        "<p>See you soon,<br>Renate</p>"
      ),
    } : {
      subject: "En uke til byggeøkten, slik forbereder du deg",
      html: wrap(
        "<p>" + hei + n + ",</p>" +
        "<p>Om en uke bygger vi sammen: torsdag 24. september kl. 20.00, tre timer.</p>" +
        "<p>To ting du bør gjøre før den tid, og begge er små:</p>" +
        "<p>1. Ta workshopen som fulgte med billetten. Den lærer deg å beskrive en jobb tydelig, og det er hele ferdigheten kvelden hviler på.</p>" +
        "<p>2. Lag deg en konto hos Claude hvis du ikke har en, og tenk på hva appen din skal gjøre.</p>" +
        btn(WORKSHOP, "Åpne workshopen") +
        "<p>Alt om kvelden ligger på deltakersiden din, og lenken til rommet legges ut der.</p>" +
        btn(DELTAKERSIDE, "Åpne deltakersiden") +
        "<p>Vi sees snart,<br>Renate</p>"
      ),
    };
  }

  if (type === "dagen-for") {
    return lang === "en" ? {
      subject: "Tomorrow we build, 20:00 Norwegian time",
      html: wrap(
        "<p>" + hei + n + ",</p>" +
        "<p>Tomorrow at 20:00 Norwegian time we start, and we are done by 23:00. You leave with an app that is published.</p>" +
        "<p>Have this ready: a PC or Mac with a browser, a Claude account, and an idea. No idea yet? Pick one of my three on the participant page, that is what they are there for.</p>" +
        btn(DELTAKERSIDE, "Open the participant page") +
        "<p>The link to the room is on that page. See you tomorrow,<br>Renate</p>"
      ),
    } : {
      subject: "I morgen bygger vi, kl. 20.00",
      html: wrap(
        "<p>" + hei + n + ",</p>" +
        "<p>I morgen kl. 20.00 starter vi, og vi er ferdige til 23.00. Du går fra kvelden med en app som er publisert.</p>" +
        "<p>Ha dette klart: en PC eller Mac med nettleser, en konto hos Claude, og en idé. Har du ingen idé? Velg en av mine tre på deltakersiden, det er derfor de står der.</p>" +
        btn(DELTAKERSIDE, "Åpne deltakersiden") +
        "<p>Lenken til rommet ligger på den siden. Vi sees i morgen,<br>Renate</p>"
      ),
    };
  }

  return lang === "en" ? {
    subject: "We start in an hour",
    html: wrap(
      "<p>" + hei + n + ",</p>" +
      "<p>One hour to go. Grab something to drink, open your laptop, and find the link to the room on your participant page.</p>" +
      btn(DELTAKERSIDE, "Go to the participant page") +
      "<p>See you in a bit,<br>Renate</p>"
    ),
  } : {
    subject: "Vi starter om en time",
    html: wrap(
      "<p>" + hei + n + ",</p>" +
      "<p>En time igjen. Finn deg noe å drikke, åpne maskinen, og hent lenken til rommet på deltakersiden din.</p>" +
      btn(DELTAKERSIDE, "Gå til deltakersiden") +
      "<p>Vi sees straks,<br>Renate</p>"
    ),
  };
}

export async function sendByggeoktMinne(env, to, navn, lang, type) {
  if (!env.MAILERSEND_API_KEY || !to) return { ok: false, grunn: "mangler nøkkel eller mottaker" };
  const m = innhold(type, navn, lang === "en" ? "en" : "no");
  const res = await fetch(MS, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + env.MAILERSEND_API_KEY,
    },
    body: JSON.stringify({
      from: { email: FROM_EMAIL, name: FROM_NAME },
      to: [{ email: to, name: navn || "" }],
      subject: m.subject,
      html: m.html,
    }),
  });
  return { ok: res.ok, status: res.status };
}

/* Legger en kjøper i køen. Kalles fra webhooken, alltid i try/catch der. */
export async function leggTilDeltaker(env, epost, navn, lang) {
  if (!env.BUILDER_KV || !epost) return;
  let liste = [];
  try {
    const raw = await env.BUILDER_KV.get(DELTAKER_KEY);
    liste = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(liste)) liste = [];
  } catch (e) { liste = []; }
  const e = epost.trim().toLowerCase();
  if (liste.some((d) => d && d.epost === e)) return;
  liste.push({ epost: e, navn: navn || "", lang: lang === "en" ? "en" : "no", sendt: [], kjopt: Date.now() });
  await env.BUILDER_KV.put(DELTAKER_KEY, JSON.stringify(liste));
}
