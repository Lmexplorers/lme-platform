/**
 * Slå opp og fjern en brukers tilgang. Bare eier.
 *
 * ==========================================================================
 * HVORFOR DENNE FILEN FINNES
 * ==========================================================================
 * Det fantes en vei inn (`create-user.js`), men ingen vei ut. Renate ba
 * 2. september 2026 om å finne tilgangen hun hadde gitt Carrie Green, og
 * fjerne den. Uten dette endepunktet måtte hun inn i Cloudflare og slette
 * nøkler for hånd, og da er det lett å slette feil ting eller å glemme
 * halvparten.
 *
 * TO STEG, ALDRI ETT
 * POST { epost }                  -> viser hva som finnes, sletter ingenting
 * POST { epost, bekreft: true }   -> sletter det som ble vist
 *
 * Oppslaget først er med vilje: ingen skal kunne slette en konto uten å ha
 * sett hva som forsvinner.
 *
 * EIEREN KAN IKKE SLETTES
 * Adressene i OWNER_EMAILS avvises. Renate skal ikke kunne stenge seg selv
 * ute av sin egen plattform med et feiltrykk, og hun kan ikke slette den
 * kontoen hun står innlogget som.
 *
 * HVA "TILGANG" BESTÅR AV
 * Én person kan ha spor i flere nøkler. Alle må med, ellers ser kontoen
 * borte ut mens abonnementet fortsatt gjelder:
 *
 *   user:<e-post>     selve innloggingen, med rolle. Uten den kommer ingen
 *                     inn, heller ikke med en økt som allerede er åpen,
 *                     siden sessionUser leser denne på hvert eneste kall.
 *   member:<e-post>   abonnement, kjøp av appen, kreditter fra Stripe/Vipps
 *   credit:<e-post>   kjøpt bilde- og videokreditt
 *   social:<e-post>   tilkoblede kontoer for autopublisering
 *   socialc:<e-post>  bufret liste over de samme kontoene
 *   srule:<e-post>    faste publiseringsregler
 *   sseen:<e-post>    hva appen allerede har lagt ut
 *
 * Åpne økter blir liggende i KV til de går ut av seg selv, men de gir ingen
 * tilgang etter at user-nøkkelen er borte.
 */

import { sessionUser, OWNER_EMAILS } from "../../_lib/access.js";

const NOKLER = [
  { prefiks: "user:",    hva: "Innlogging og rolle" },
  { prefiks: "member:",  hva: "Abonnement og kjøp" },
  { prefiks: "credit:",  hva: "Kjøpt kreditt" },
  { prefiks: "social:",  hva: "Tilkoblede kontoer for publisering" },
  { prefiks: "socialc:", hva: "Bufret kontoliste" },
  { prefiks: "srule:",   hva: "Publiseringsregler" },
  { prefiks: "sseen:",   hva: "Hva appen har lagt ut" },
];

function json(data, status) {
  return new Response(JSON.stringify(data), {
    status: status || 200,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

/* Kort sammendrag av en post, uten å sende ut passordhasher eller nøkler. */
function sammendrag(prefiks, raw) {
  let o = null;
  try { o = JSON.parse(raw); } catch (e) { return "lagret"; }
  if (!o || typeof o !== "object") return "lagret";
  if (prefiks === "user:") {
    const deler = [];
    if (o.name) deler.push(o.name);
    if (o.role) deler.push("rolle: " + o.role);
    if (o.created_at) deler.push("opprettet " + String(o.created_at).slice(0, 10));
    if (o.appKjopt) deler.push("har kjøpt appen");
    return deler.join(", ") || "konto finnes";
  }
  if (prefiks === "member:") {
    const deler = [];
    if (o.plan) deler.push("plan: " + o.plan);
    if (o.tier) deler.push("nivå: " + o.tier);
    if (o.status) deler.push(o.status);
    if (o.appKjopt) deler.push("har kjøpt appen");
    return deler.join(", ") || "medlemskap finnes";
  }
  if (prefiks === "credit:") {
    const deler = [];
    if (typeof o.image === "number") deler.push(o.image + " bilder");
    if (typeof o.video === "number") deler.push(o.video + " videoer");
    return deler.join(", ") || "kreditt finnes";
  }
  if (Array.isArray(o)) return o.length + " oppføringer";
  return "lagret";
}

export async function onRequestPost(context) {
  const { request, env } = context;

  const meg = await sessionUser(context);
  if (!meg || (meg.role !== "owner" && meg.role !== "admin")) {
    return json({ ok: false, feil: "Du må være logget inn som eier." }, 403);
  }
  if (!env || !env.BUILDER_KV) {
    return json({ ok: false, feil: "Lagringen er ikke tilgjengelig." }, 500);
  }

  let body = {};
  try { body = await request.json(); } catch (e) { body = {}; }

  const epost = String(body.epost || body.email || "").trim().toLowerCase();
  if (!epost || epost.indexOf("@") < 1) {
    return json({ ok: false, feil: "Skriv en gyldig e-postadresse." }, 400);
  }

  /* Eieren skal aldri kunne stenges ute av sin egen plattform. */
  const eierlista = Array.isArray(OWNER_EMAILS) ? OWNER_EMAILS : [];
  const fraMiljo = String((env.OWNER_EMAIL || "")).trim().toLowerCase();
  if (eierlista.includes(epost) || (fraMiljo && epost === fraMiljo)) {
    return json({ ok: false, feil: "Dette er en eier-adresse, den kan ikke slettes herfra." }, 400);
  }
  if (meg.email && epost === String(meg.email).trim().toLowerCase()) {
    return json({ ok: false, feil: "Du kan ikke slette kontoen du er innlogget som." }, 400);
  }

  /* Steg 1: hva finnes? */
  const funn = [];
  for (const n of NOKLER) {
    let raw = null;
    try { raw = await env.BUILDER_KV.get(n.prefiks + epost); } catch (e) { raw = null; }
    if (raw) funn.push({ nokkel: n.prefiks + epost, hva: n.hva, detalj: sammendrag(n.prefiks, raw) });
  }

  if (!body.bekreft) {
    return json({ ok: true, steg: "funnet", epost, antall: funn.length, funn });
  }

  if (!funn.length) {
    return json({ ok: true, steg: "slettet", epost, antall: 0, slettet: [] });
  }

  /* Steg 2: slett det som faktisk ble funnet, ikke mer. */
  const slettet = [];
  const feilet = [];
  for (const f of funn) {
    try { await env.BUILDER_KV.delete(f.nokkel); slettet.push(f.nokkel); }
    catch (e) { feilet.push(f.nokkel); }
  }

  return json({ ok: feilet.length === 0, steg: "slettet", epost, antall: slettet.length, slettet, feilet });
}
