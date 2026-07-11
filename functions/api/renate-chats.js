/**
 * Renate AI — lagring av samtaler i skyen (Cloudflare KV)
 *
 * Gjør at Renate AI husker samtalene dine på tvers av enheter og økter.
 * Krever innlogging (samme lme_sess-cookie som /api/auth/*). Uinnloggede
 * brukere får { loggedIn: false } og fortsetter med lokal lagring i
 * nettleseren, akkurat som før.
 *
 * Lagring i KV (bindingen BUILDER_KV, samme som resten av plattformen):
 *   renatechat:<slot>:<uid>  -> JSON
 *     slot "widget" : samtalen i den flytende Renate AI-widgeten
 *     slot "no"     : samtalelisten på /spor-renate-ai
 *     slot "en"     : samtalelisten på /ask-renate-ai
 *
 * API:
 *   GET  /api/renate-chats?slot=no      -> { loggedIn, data }
 *   POST /api/renate-chats {slot, data} -> { ok }  (tom data sletter lagringen)
 */

const SLOTS = ["widget", "no", "en"];
const MAX_BYTES = 5 * 1024 * 1024; // 5 MB, på linje med localStorage-kvoten

function json(data, status) {
  return new Response(JSON.stringify(data), {
    status: status || 200,
    headers: { "Content-Type": "application/json" },
  });
}

function readCookies(request) {
  const out = {};
  (request.headers.get("Cookie") || "").split(";").forEach((p) => {
    const i = p.indexOf("=");
    if (i > 0) out[p.slice(0, i).trim()] = p.slice(i + 1).trim();
  });
  return out;
}

async function sessionFrom(context) {
  const { request, env } = context;
  const sid = readCookies(request)["lme_sess"];
  if (!sid || !env.BUILDER_KV) return null;
  const raw = await env.BUILDER_KV.get("sess:" + sid);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch (e) { return null; }
}

function chatKey(slot, uid) {
  return "renatechat:" + slot + ":" + uid;
}

export async function onRequestGet(context) {
  const { request, env } = context;
  if (!env.BUILDER_KV) return json({ loggedIn: false, data: null });

  const sess = await sessionFrom(context);
  if (!sess || !sess.uid) return json({ loggedIn: false, data: null });

  const slot = new URL(request.url).searchParams.get("slot") || "";
  if (!SLOTS.includes(slot)) return json({ error: "ukjent slot" }, 400);

  const raw = await env.BUILDER_KV.get(chatKey(slot, sess.uid));
  let data = null;
  if (raw) { try { data = JSON.parse(raw); } catch (e) { data = null; } }
  return json({ loggedIn: true, data });
}

export async function onRequestPost(context) {
  const { request, env } = context;
  if (!env.BUILDER_KV) return json({ error: "not_configured" }, 500);

  const sess = await sessionFrom(context);
  if (!sess || !sess.uid) return json({ loggedIn: false, error: "ikke innlogget" }, 401);

  let body;
  try { body = await request.json(); } catch (e) { return json({ error: "Ugyldig JSON" }, 400); }

  const slot = body.slot || "";
  if (!SLOTS.includes(slot)) return json({ error: "ukjent slot" }, 400);

  const data = body.data;
  const isEmpty = data == null || (Array.isArray(data) && data.length === 0);

  if (isEmpty) {
    await env.BUILDER_KV.delete(chatKey(slot, sess.uid));
    return json({ ok: true, deleted: true });
  }

  const serialized = JSON.stringify(data);
  if (serialized.length > MAX_BYTES) {
    return json({ error: "Samtalene er for store til å lagres i skyen (maks 5 MB). Slett gamle samtaler eller store vedlegg." }, 413);
  }

  await env.BUILDER_KV.put(chatKey(slot, sess.uid), serialized);
  return json({ ok: true });
}
