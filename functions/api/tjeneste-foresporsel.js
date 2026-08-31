/**
 * LME Studio Tjenester, forespørsler fra /tjenester.
 *
 *   POST /api/tjeneste-foresporsel   { navn, epost, telefon, pakke, melding, lenke, lang }
 *        -> lagrer saken i BUILDER_KV, varsler Renate og kvitterer til kunden
 *
 *   GET  /api/tjeneste-foresporsel   -> { ok, saker: [...] }   (bare eier)
 *   POST /api/tjeneste-foresporsel   { action: "status", id, status }  (bare eier)
 *
 * Ingen betaling skjer her. Kunden beskriver oppdraget, Renate sender
 * betalingslenke eller faktura selv. Slik kan prisen justeres per oppdrag,
 * og ingen ny betalingslenke opprettes uten at hun har sett den.
 *
 * Nøkler i KV: tjeneste:<tidsstempel>-<tilfeldig>
 */
import { sessionUser, isOwner } from "../_lib/access.js";
import { pakkeMedId, SKREDDERSYDD } from "../../js/tjenester-pakker.js";
import { sendVarselTilRenate, sendKvitteringTilKunde } from "../_lib/tjeneste-mail.js";

const PREFIX = "tjeneste:";
const GYLDIGE_STATUS = ["ny", "svart", "i-gang", "ferdig"];

function json(data, status) {
  return new Response(JSON.stringify(data), {
    status: status || 200,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

function tekst(v, maks) {
  return ((v || "") + "").trim().slice(0, maks);
}

export async function onRequestPost(context) {
  const { request, env } = context;
  if (!env.BUILDER_KV) return json({ error: "not_configured" }, 200);

  let body = null;
  try { body = await request.json(); } catch (e) { return json({ error: "bad_json" }, 400); }

  /* Eierens egen handling: merke en sak som besvart eller ferdig. */
  if (body.action === "status") {
    const bruker = await sessionUser(context);
    if (!isOwner(bruker)) return json({ error: "ikke_eier" }, 403);
    const id = tekst(body.id, 120);
    const status = tekst(body.status, 20);
    if (id.indexOf(PREFIX) !== 0) return json({ error: "ukjent_sak" }, 400);
    if (GYLDIGE_STATUS.indexOf(status) === -1) return json({ error: "ukjent_status" }, 400);
    const raw = await env.BUILDER_KV.get(id);
    if (!raw) return json({ error: "ukjent_sak" }, 404);
    let sak;
    try { sak = JSON.parse(raw); } catch (e) { return json({ error: "ukjent_sak" }, 404); }
    sak.status = status;
    sak.endret = new Date().toISOString();
    await env.BUILDER_KV.put(id, JSON.stringify(sak));
    return json({ ok: true, sak: sak });
  }

  const navn = tekst(body.navn, 100);
  const epost = tekst(body.epost, 160).toLowerCase();
  const telefon = tekst(body.telefon, 40);
  const melding = tekst(body.melding, 4000);
  const lenke = tekst(body.lenke, 500);
  const lang = tekst(body.lang, 4) === "en" ? "en" : "no";
  const pakkeId = tekst(body.pakke, 40) || SKREDDERSYDD.id;

  if (!navn) return json({ error: "mangler_navn" }, 400);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(epost)) return json({ error: "bad_email" }, 400);
  if (!melding) return json({ error: "mangler_melding" }, 400);

  const pakke = pakkeMedId(pakkeId) || SKREDDERSYDD;
  const pakkeNavn = pakke.navn[lang] || pakke.navn.no;

  const sak = {
    id: PREFIX + Date.now() + "-" + Math.random().toString(36).slice(2, 8),
    navn: navn,
    epost: epost,
    telefon: telefon,
    melding: melding,
    lenke: lenke,
    lang: lang,
    pakke: pakke.id,
    pakkeNavn: pakkeNavn,
    pris: pakke.nok || null,
    status: "ny",
    opprettet: new Date().toISOString(),
  };

  await env.BUILDER_KV.put(sak.id, JSON.stringify(sak));

  /* Brevene skal ikke kunne velte lagringen. Går sendingen galt, ligger
     saken der uansett, og Renate ser den på /tjenester. */
  const varsel = await sendVarselTilRenate(env, sak, pakkeNavn);
  const kvittering = await sendKvitteringTilKunde(env, sak, pakkeNavn);

  return json({ ok: true, id: sak.id, varslet: !!varsel.ok, kvittert: !!kvittering.ok });
}

export async function onRequestGet(context) {
  const { env } = context;
  if (!env.BUILDER_KV) return json({ error: "not_configured" }, 200);
  const bruker = await sessionUser(context);
  if (!isOwner(bruker)) return json({ ok: false, eier: false, saker: [] }, 200);

  const liste = await env.BUILDER_KV.list({ prefix: PREFIX, limit: 1000 });
  const saker = [];
  for (let i = 0; i < liste.keys.length; i++) {
    const raw = await env.BUILDER_KV.get(liste.keys[i].name);
    if (!raw) continue;
    try { saker.push(JSON.parse(raw)); } catch (e) {}
  }
  saker.sort(function (a, b) {
    return (b.opprettet || "").localeCompare(a.opprettet || "");
  });
  return json({ ok: true, eier: true, antall: saker.length, saker: saker });
}
