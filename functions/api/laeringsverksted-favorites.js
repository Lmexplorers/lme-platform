/**
 * LME Læringsverksted — favoritter for innloggede brukere, synkronisert på
 * tvers av enheter. Anonyme brukere bruker fortsatt kun nettleserlokal
 * lagring (localStorage, se js/laeringsverksted-favorites.js); denne API-en
 * er andre laget som slår inn når brukeren er innlogget.
 *
 * Auth deles med resten av plattformen: sesjons-cookien lme_sess (satt av
 * /api/auth/*) slås opp i BUILDER_KV, samme mønster som
 * functions/api/bookly/[[path]].js sin bibliotek-rute.
 *
 * GET  /api/laeringsverksted-favorites
 *        -> { favorites: [slug, ...] } eller { error: "not_logged_in" }
 *
 * POST /api/laeringsverksted-favorites  body { action: "toggle", slug }
 *        -> { favorites: [...], on: true|false }
 * POST /api/laeringsverksted-favorites  body { action: "merge", favorites: [slug,...] }
 *        -> { favorites: [...] }
 *        Slår sammen en liste (typisk fra localStorage rett etter innlogging)
 *        inn i brukerens lagrede favoritter, uten å miste noe.
 */

function json(data, status) {
  return new Response(JSON.stringify(data), {
    status: status || 200,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
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

const favKey = (uid) => "lv:fav:" + uid;
const MAX_FAVORITES = 300;

function cleanSlug(slug) {
  if (typeof slug !== "string") return null;
  const s = slug.trim().toLowerCase();
  if (!/^[a-z0-9][a-z0-9\-]{1,58}[a-z0-9]$/.test(s)) return null;
  return s;
}

function cleanList(list) {
  if (!Array.isArray(list)) return [];
  const out = [];
  for (const item of list) {
    const s = cleanSlug(item);
    if (s && out.indexOf(s) === -1) out.push(s);
    if (out.length >= MAX_FAVORITES) break;
  }
  return out;
}

async function readFavorites(env, uid) {
  try {
    const raw = await env.BUILDER_KV.get(favKey(uid));
    const list = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) ? list : [];
  } catch (e) {
    return [];
  }
}

async function writeFavorites(env, uid, list) {
  await env.BUILDER_KV.put(favKey(uid), JSON.stringify(list));
}

export async function onRequestGet(context) {
  const { env } = context;
  if (!env.BUILDER_KV) return json({ error: "not_configured", favorites: [] }, 200);
  const sess = await sessionFrom(context);
  if (!sess || !sess.uid) return json({ error: "not_logged_in", favorites: [] }, 200);
  const favorites = await readFavorites(env, sess.uid);
  return json({ favorites }, 200);
}

export async function onRequestPost(context) {
  const { request, env } = context;
  if (!env.BUILDER_KV) return json({ error: "not_configured" }, 200);
  const sess = await sessionFrom(context);
  if (!sess || !sess.uid) return json({ error: "not_logged_in" }, 200);

  let body;
  try {
    body = await request.json();
  } catch (e) {
    return json({ error: "bad_json" }, 400);
  }

  if (body.action === "toggle") {
    const slug = cleanSlug(body.slug);
    if (!slug) return json({ error: "bad_slug" }, 400);
    const current = await readFavorites(env, sess.uid);
    const i = current.indexOf(slug);
    let on;
    if (i === -1) { current.push(slug); on = true; } else { current.splice(i, 1); on = false; }
    const trimmed = current.slice(0, MAX_FAVORITES);
    await writeFavorites(env, sess.uid, trimmed);
    return json({ favorites: trimmed, on }, 200);
  }

  if (body.action === "merge") {
    const incoming = cleanList(body.favorites);
    const current = await readFavorites(env, sess.uid);
    const merged = current.slice();
    incoming.forEach((s) => { if (merged.indexOf(s) === -1) merged.push(s); });
    const trimmed = merged.slice(0, MAX_FAVORITES);
    await writeFavorites(env, sess.uid, trimmed);
    return json({ favorites: trimmed }, 200);
  }

  return json({ error: "bad_action" }, 400);
}
