/**
 * Gi bort Strikk & Hekle uten betaling. Kun for eier.
 *
 *   POST /api/strikk-gave  { email, name?, lang?, sendMail? }
 *        -> { ok, lenke }
 *   GET  /api/strikk-gave  -> { ok, gaver: [...] }
 *
 * Bakgrunnen (Renate, 5. september 2026): moren hennes kjøper aldri noe på
 * nett, så selv en rabattkode gjennom Stripe er for mye. Hun bruker heller
 * ikke e-post. Det Renate trenger er en lenke hun kan sende på melding.
 *
 * DERFOR ER E-POST VALGFRITT. En lenke lages uten at noen adresse oppgis i
 * det hele tatt, og den returneres alltid til eieren. Skriver hun inn en
 * adresse, kan brevet sendes i tillegg, men det er tillegget, ikke veien.
 *
 * Gaver settes IKKE i oppfølgingsserien. Den selger Inner Circle og spør om
 * hva som skal lages neste gang, og det er en samtale for en kunde, ikke for
 * noen som nettopp har fått noe i gave.
 */
import { sessionUser, isOwner } from "../_lib/access.js";
import { grantCourseAccess } from "../_lib/course-access.js";
import { sendStrikkGaveMail, appLenke } from "../_lib/strikk-mail.js";
import { STRIKK_ID } from "../_lib/strikk-kjop.js";

const GAVE_PREFIX = "strikk_gave:";

function json(data, status) {
  return new Response(JSON.stringify(data), {
    status: status || 200,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

async function kunEier(context) {
  const bruker = await sessionUser(context);
  if (!bruker || !isOwner(bruker)) return null;
  return bruker;
}

export async function onRequestPost(context) {
  const { request, env } = context;
  if (!env.BUILDER_KV) return json({ ok: false, error: "not_configured" }, 503);
  const eier = await kunEier(context);
  if (!eier) return json({ ok: false, error: "kun_eier" }, 403);

  let body = {};
  try { body = await request.json(); } catch (e) {}
  const email = String(body.email || "").trim().toLowerCase();
  const navn = String(body.name || "").trim().slice(0, 80);
  const lang = body.lang === "en" ? "en" : "no";
  /* Bare send e-post hvis det faktisk står en adresse der OG hun har bedt om
     det. Uten adresse lages lenken uansett. */
  const sendMail = body.sendMail === true && email.indexOf("@") > 0;
  if (email && email.indexOf("@") < 1) return json({ ok: false, error: "ugyldig_epost" }, 400);

  /* Tilgangen først. Den er hele poenget, og virker uten at vi vet hvem den
     er til. Selve nøkkelen er lenken, ikke adressen. */
  const token = await grantCourseAccess(env, STRIKK_ID, email, navn);

  let mailSendt = false;
  if (sendMail) {
    try {
      const r = await sendStrikkGaveMail(env, {
        to: email, name: navn, lang: lang, token: token,
        fra: (eier.name || "Renate").split(" ")[0],
      });
      mailSendt = !!(r && r.ok);
    } catch (e) {}
  }

  try {
    /* Nøkkelen er tokenet, ikke e-posten: en lenke kan lages helt uten
       adresse, og da finnes det ingen e-post å lagre den under. Lenken
       lagres med, så Renate kan hente den frem igjen hvis mottakeren mister
       den. */
    await env.BUILDER_KV.put(GAVE_PREFIX + token, JSON.stringify({
      id: token, email: email, name: navn, lang: lang, lenke: appLenke(token),
      gitt: Date.now(), av: (eier.email || "").toLowerCase(), mailSendt: mailSendt,
    }));
  } catch (e) {}

  return json({ ok: true, lenke: appLenke(token), mailSendt: mailSendt });
}

export async function onRequestGet(context) {
  const { env } = context;
  if (!env.BUILDER_KV) return json({ ok: false, error: "not_configured" }, 503);
  const eier = await kunEier(context);
  if (!eier) return json({ ok: false, error: "kun_eier" }, 403);

  const gaver = [];
  let cursor;
  do {
    const list = await env.BUILDER_KV.list({ prefix: GAVE_PREFIX, cursor: cursor });
    for (const k of list.keys) {
      const raw = await env.BUILDER_KV.get(k.name);
      if (!raw) continue;
      try { gaver.push(JSON.parse(raw)); } catch (e) {}
    }
    cursor = list.list_complete ? null : list.cursor;
  } while (cursor);

  gaver.sort(function (a, b) { return (b.gitt || 0) - (a.gitt || 0); });
  return json({ ok: true, gaver: gaver.slice(0, 100) });
}
