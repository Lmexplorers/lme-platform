/**
 * LME — enkeltstående utsending, kun for eier.
 *
 * HVORFOR DEN FINNES
 * Plattformen kunne sende automatiske serier, men ikke ett brev til en
 * håndfull folk. Renate hadde fire testere som skulle ha grunneleggertilbudet
 * 1. september 2026, og det fantes ingen knapp for det. Nå gjør det det.
 *
 *   POST /api/utsending
 *     { mottakere: [{ epost, navn }], emne, tekst, test: true|false }
 *     -> { ok, sendt, feilet, detaljer: [{ epost, ok, grunn }] }
 *
 * TRE VERN, FORDI DETTE SENDER TIL EKTE MENNESKER
 *   1. Kun eier. Alle andre får 403, også innloggede medlemmer.
 *   2. `test: true` sender BARE til eierens egen adresse, med [TEST] i emnet.
 *      Slik ser hun brevet i sin egen innboks før noen andre får det.
 *   3. Maks 200 mottakere per kall, og adressene valideres. En skrivefeil
 *      skal stoppe før MailerSend, ikke etterpå.
 *
 * Teksten skrives som vanlige avsnitt, ikke HTML. {navn} byttes med
 * fornavnet til hver mottaker. Alt annet escapes, så en lenke eller et
 * tegn i teksten aldri kan bli til markup.
 */

import { sessionUser, isOwner } from "../_lib/access.js";

const MS = "https://api.mailersend.com/v1/email";
const SITE = "https://lmexplorers.com";
const FROM_EMAIL = "post@lmexplorers.com";
const FROM_NAME = "Renate fra LME";
const MAKS_MOTTAKERE = 200;

function json(data, status) {
  return new Response(JSON.stringify(data), {
    status: status || 200,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

function esc(s) {
  return String(s == null ? "" : s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function gyldigEpost(e) {
  return /^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(String(e || "").trim());
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

/* Vanlig tekst til trygg HTML: avsnitt på tomme linjer, lenker gjøres
   klikkbare, og alt annet escapes. */
export function tekstTilHtml(tekst, navn) {
  const fornavn = String(navn || "").trim().split(" ")[0];
  const raa = String(tekst || "").replace(/\{navn\}/g, fornavn || "du");
  return raa
    .split(/\n{2,}/)
    .map(function (avsnitt) {
      const trygg = esc(avsnitt.trim()).replace(/\n/g, "<br>");
      const medLenker = trygg.replace(/(https?:\/\/[^\s<]+)/g, function (u) {
        return '<a href="' + u + '" style="color:#E91E89;">' + u + "</a>";
      });
      return '<p style="margin:0 0 14px;">' + medLenker + "</p>";
    })
    .join("");
}

async function send(env, til, navn, emne, html) {
  try {
    const r = await fetch(MS, {
      method: "POST",
      headers: {
        Authorization: "Bearer " + env.MAILERSEND_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: { email: FROM_EMAIL, name: FROM_NAME },
        to: [{ email: til, name: navn || til }],
        subject: emne,
        html: html,
      }),
    });
    if (!r.ok) return { ok: false, grunn: "mailersend_" + r.status };
    return { ok: true };
  } catch (e) {
    return { ok: false, grunn: "nettverk" };
  }
}

export async function onRequestPost(context) {
  const { request, env } = context;

  const bruker = await sessionUser(context);
  if (!bruker) return json({ ok: false, error: "Logg inn." }, 401);
  if (!isOwner(bruker)) return json({ ok: false, error: "Utsending er kun for eieren." }, 403);
  if (!env.MAILERSEND_API_KEY) return json({ ok: false, error: "MAILERSEND_API_KEY mangler." }, 503);

  let b = {};
  try { b = await request.json(); } catch (e) { return json({ ok: false, error: "bad_json" }, 400); }

  const emne = String(b.emne || "").trim();
  const tekst = String(b.tekst || "").trim();
  if (!emne) return json({ ok: false, error: "Emnet mangler." }, 400);
  if (!tekst) return json({ ok: false, error: "Teksten mangler." }, 400);

  /* Testsending går bare til eieren selv, uansett hva som står i lista. */
  let mottakere;
  if (b.test) {
    mottakere = [{ epost: bruker.email, navn: "Renate" }];
  } else {
    mottakere = (Array.isArray(b.mottakere) ? b.mottakere : [])
      .map(function (m) {
        return { epost: String((m && m.epost) || "").trim().toLowerCase(), navn: String((m && m.navn) || "").trim() };
      })
      .filter(function (m) { return m.epost; });
  }

  if (!mottakere.length) return json({ ok: false, error: "Ingen mottakere." }, 400);
  if (mottakere.length > MAKS_MOTTAKERE) {
    return json({ ok: false, error: "For mange mottakere på én gang (maks " + MAKS_MOTTAKERE + ")." }, 400);
  }
  const ugyldige = mottakere.filter(function (m) { return !gyldigEpost(m.epost); });
  if (ugyldige.length) {
    return json({ ok: false, error: "Disse adressene ser feil ut: " + ugyldige.map(function (m) { return m.epost; }).join(", ") }, 400);
  }

  const detaljer = [];
  let sendt = 0, feilet = 0;
  for (const m of mottakere) {
    const html = wrap(tekstTilHtml(tekst, m.navn));
    const res = await send(env, m.epost, m.navn, (b.test ? "[TEST] " : "") + emne, html);
    if (res.ok) sendt++; else feilet++;
    detaljer.push({ epost: m.epost, ok: !!res.ok, grunn: res.grunn || "" });
  }

  /* En kort logg, så Renate kan se hva som er sendt tidligere. Selve
     teksten lagres, men ikke mer enn 30 dager. */
  try {
    await env.BUILDER_KV.put(
      "utsending:" + Date.now(),
      JSON.stringify({ emne: emne, antall: mottakere.length, sendt: sendt, feilet: feilet, test: !!b.test, nar: new Date().toISOString() }),
      { expirationTtl: 60 * 60 * 24 * 30 }
    );
  } catch (e) {}

  return json({ ok: feilet === 0, sendt: sendt, feilet: feilet, detaljer: detaljer });
}
