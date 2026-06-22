/**
 * LME gruppe-chat — naer-live, helt paa Cloudflare KV (BUILDER_KV).
 * Innlogging + medlemskap kreves for aa skrive. Deler sesjonslogikken
 * med /api/auth (HttpOnly-cookie lme_sess).
 *
 * Ruter (Pages [[path]]-fanger paa /api/group/*):
 *   GET  /api/group/access            -> { loggedIn, member, name, email }
 *   GET  /api/group/<id>/messages     -> { messages: [...] }   (?after=<ts> for kun nyere)
 *   POST /api/group/<id>/messages     { text }  -> { ok, message }
 *
 * Lagring i KV:
 *   gchat:<id>  -> JSON [{ id, u(e-post), n(navn), t(tekst), ts }]  (siste 200)
 *
 * Gyldige grupper er laast under GROUPS, saa ingen kan lage vilkaarlige rom.
 */

const GROUPS = {
  "3-6": "3–6 år",
  "6-9": "6–9 år",
  "9-12": "9–12 år",
  "voksen": "Voksengruppe",
  "inner-circle": "Inner Circle",
};

const MAX_MESSAGES = 200;
const MAX_LEN = 1000;

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
  if (!env.BUILDER_KV) return null;
  const sid = readCookies(request)["lme_sess"];
  if (!sid) return null;
  const raw = await env.BUILDER_KV.get("sess:" + sid);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch (e) { return null; }
}

async function getUser(env, email) {
  if (!email) return null;
  const raw = await env.BUILDER_KV.get("user:" + email.trim().toLowerCase());
  if (!raw) return null;
  try { return JSON.parse(raw); } catch (e) { return null; }
}

/* Medlemskap: eier eller et aktivt abonnement. Et hvilket som helst
   abonnement-objekt regnes som medlem, saa betalende ikke laases ute. */
function isMember(u) {
  if (!u) return false;
  if (u.role === "owner") return true;
  const s = u.subscription;
  if (!s) return false;
  if (s.status && /cancel|inactive|expired|none/i.test(s.status)) return false;
  return true;
}

function chatKey(id) { return "gchat:" + id; }

async function loadMessages(env, id) {
  const raw = await env.BUILDER_KV.get(chatKey(id));
  if (!raw) return [];
  try { const a = JSON.parse(raw); return Array.isArray(a) ? a : []; } catch (e) { return []; }
}

export async function onRequestGet(context) {
  const { params, env, request } = context;
  const parts = [].concat(params.path || []);
  if (!env.BUILDER_KV) return json({ error: "not_configured" }, 200);

  // /api/group/access
  if (parts.length === 1 && parts[0] === "access") {
    const sess = await sessionFrom(context);
    if (!sess) return json({ loggedIn: false, member: false });
    const u = await getUser(env, sess.email);
    if (!u) return json({ loggedIn: false, member: false });
    return json({ loggedIn: true, member: isMember(u), name: u.name || null, email: u.email });
  }

  // /api/group/<id>/messages
  if (parts.length === 2 && parts[1] === "messages") {
    const id = parts[0];
    if (!GROUPS[id]) return json({ error: "unknown_group" }, 404);
    const sess = await sessionFrom(context);
    const u = sess ? await getUser(env, sess.email) : null;
    if (!isMember(u)) return json({ error: "forbidden", member: false }, 403);

    let messages = await loadMessages(env, id);
    const after = Number(new URL(request.url).searchParams.get("after") || 0);
    if (after) messages = messages.filter((m) => m.ts > after);
    return json({ messages: messages });
  }

  return json({ error: "not_found" }, 404);
}

export async function onRequestPost(context) {
  const { params, env, request } = context;
  const parts = [].concat(params.path || []);
  if (!env.BUILDER_KV) return json({ error: "not_configured" }, 200);

  if (parts.length === 2 && parts[1] === "messages") {
    const id = parts[0];
    if (!GROUPS[id]) return json({ error: "unknown_group" }, 404);

    const sess = await sessionFrom(context);
    const u = sess ? await getUser(env, sess.email) : null;
    if (!isMember(u)) return json({ error: "forbidden", member: false }, 403);

    let body;
    try { body = await request.json(); } catch (e) { return json({ error: "bad_json" }, 400); }
    let text = (body.text || "").toString().trim();
    if (!text) return json({ error: "empty" }, 400);
    if (text.length > MAX_LEN) text = text.slice(0, MAX_LEN);

    const message = {
      id: crypto.randomUUID(),
      u: u.email,
      n: u.name || (u.email ? u.email.split("@")[0] : "Medlem"),
      t: text,
      ts: Date.now(),
    };

    const messages = await loadMessages(env, id);
    messages.push(message);
    while (messages.length > MAX_MESSAGES) messages.shift();
    await env.BUILDER_KV.put(chatKey(id), JSON.stringify(messages));

    return json({ ok: true, message: message });
  }

  return json({ error: "not_found" }, 404);
}
