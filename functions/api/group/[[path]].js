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

// Eiere har alltid tilgang, selv om rollen i KV skulle vaere utdatert
// (f.eks. registrert foer e-posten ble lagt til som eier).
const OWNER_EMAILS = [
  "renate@lmexplorers.com", "hei@lmexplorers.com", "hello@lmexplorers.com",
  "support@lmexplorers.com", "renateshobby@hotmail.com",
];

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

function activeStatus(s) {
  if (!s) return false;
  if (s.status && /cancel|inactive|expired|none/i.test(s.status)) return false;
  return true;
}

/* Medlemskap: eier, et aktivt abonnement paa kontoen, eller et aktivt
   medlemskap skrevet av Stripe-webhooken (member:<e-post>). */
function isMember(u, membership) {
  if (u) {
    if (u.role === "owner") return true;
    if (OWNER_EMAILS.indexOf((u.email || "").toLowerCase()) !== -1) return true;
    if (activeStatus(u.subscription)) return true;
  }
  if (activeStatus(membership)) return true;
  return false;
}

async function getMembership(env, email) {
  if (!email) return null;
  const raw = await env.BUILDER_KV.get("member:" + email.trim().toLowerCase());
  if (!raw) return null;
  try { return JSON.parse(raw); } catch (e) { return null; }
}

function chatKey(id) { return "gchat:" + id; }

function isOwner(u) {
  if (!u) return false;
  return u.role === "owner" || OWNER_EMAILS.indexOf((u.email || "").toLowerCase()) !== -1;
}

async function ownerFrom(context) {
  const sess = await sessionFrom(context);
  if (!sess) return null;
  const u = await getUser(context.env, sess.email);
  return isOwner(u) ? u : null;
}

async function setMembership(env, email, status) {
  email = (email || "").trim().toLowerCase();
  if (!email) return;
  const rec = { status: status, plan: "inner-circle", source: "manual", since: Date.now(), updated: Date.now() };
  await env.BUILDER_KV.put("member:" + email, JSON.stringify(rec));
  const uraw = await env.BUILDER_KV.get("user:" + email);
  if (uraw) {
    try {
      const u = JSON.parse(uraw);
      u.subscription = { status: status, plan: "inner-circle", source: "manual", updated: Date.now() };
      await env.BUILDER_KV.put("user:" + email, JSON.stringify(u));
    } catch (e) {}
  }
}

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
    const membership = await getMembership(env, u.email);
    return json({ loggedIn: true, member: isMember(u, membership), name: u.name || null, email: u.email, owner: isOwner(u) });
  }

  // /api/group/admin/config  (kun eier) -> er Stripe-automatikken paa?
  if (parts.length === 2 && parts[0] === "admin" && parts[1] === "config") {
    const owner = await ownerFrom(context);
    if (!owner) return json({ error: "forbidden" }, 403);
    const fromKv = await env.BUILDER_KV.get("config:stripe_webhook_secret");
    return json({ stripeConfigured: !!fromKv });
  }

  // /api/group/admin/members  (kun eier) -> liste over medlemmer
  if (parts.length === 2 && parts[0] === "admin" && parts[1] === "members") {
    const owner = await ownerFrom(context);
    if (!owner) return json({ error: "forbidden" }, 403);
    const list = await env.BUILDER_KV.list({ prefix: "member:" });
    const members = [];
    for (const k of list.keys) {
      const email = k.name.slice("member:".length);
      const raw = await env.BUILDER_KV.get(k.name);
      let rec = {}; try { rec = JSON.parse(raw); } catch (e) {}
      members.push({ email: email, status: rec.status || "active", source: rec.source || "", since: rec.since || null });
    }
    members.sort((a, b) => (b.since || 0) - (a.since || 0));
    return json({ members: members });
  }

  // /api/group/<id>/file/<fid>  -> serverer opplastet fil/bilde/lyd (kun medlem)
  if (parts.length === 3 && parts[1] === "file") {
    const id = parts[0];
    if (!GROUPS[id]) return new Response("unknown group", { status: 404 });
    const sess = await sessionFrom(context);
    const u = sess ? await getUser(env, sess.email) : null;
    const membership = u ? await getMembership(env, u.email) : null;
    if (!isMember(u, membership)) return new Response("forbidden", { status: 403 });
    const raw = await env.BUILDER_KV.get("gfile:" + id + ":" + parts[2]);
    if (!raw) return new Response("not found", { status: 404 });
    let f; try { f = JSON.parse(raw); } catch (e) { return new Response("error", { status: 500 }); }
    const bin = atob(f.data);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return new Response(bytes, {
      headers: { "Content-Type": f.type || "application/octet-stream", "Cache-Control": "private, max-age=86400" },
    });
  }

  // /api/group/<id>/messages
  if (parts.length === 2 && parts[1] === "messages") {
    const id = parts[0];
    if (!GROUPS[id]) return json({ error: "unknown_group" }, 404);
    const sess = await sessionFrom(context);
    const u = sess ? await getUser(env, sess.email) : null;
    const membership = u ? await getMembership(env, u.email) : null;
    if (!isMember(u, membership)) return json({ error: "forbidden", member: false }, 403);

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

  // /api/group/admin/stripe-secret  (kun eier) -> lagre Stripe-signeringsnoekkel i KV
  if (parts.length === 2 && parts[0] === "admin" && parts[1] === "stripe-secret") {
    const owner = await ownerFrom(context);
    if (!owner) return json({ error: "forbidden" }, 403);
    let body;
    try { body = await request.json(); } catch (e) { return json({ error: "bad_json" }, 400); }
    const secret = (body.secret || "").trim();
    if (secret === "") { await env.BUILDER_KV.delete("config:stripe_webhook_secret"); return json({ ok: true, cleared: true }); }
    if (!/^whsec_/.test(secret)) return json({ error: "bad_secret" }, 400);
    await env.BUILDER_KV.put("config:stripe_webhook_secret", secret);
    return json({ ok: true });
  }

  // /api/group/admin/grant | /api/group/admin/revoke  (kun eier)
  if (parts.length === 2 && parts[0] === "admin" && (parts[1] === "grant" || parts[1] === "revoke")) {
    const owner = await ownerFrom(context);
    if (!owner) return json({ error: "forbidden" }, 403);
    let body;
    try { body = await request.json(); } catch (e) { return json({ error: "bad_json" }, 400); }
    const email = (body.email || "").trim().toLowerCase();
    if (!email || !/.+@.+\..+/.test(email)) return json({ error: "bad_email" }, 400);
    await setMembership(env, email, parts[1] === "grant" ? "active" : "canceled");
    return json({ ok: true, email: email, status: parts[1] === "grant" ? "active" : "canceled" });
  }

  // /api/group/<id>/upload  -> lagre fil/bilde/lyd i KV, returner referanse
  if (parts.length === 2 && parts[1] === "upload") {
    const id = parts[0];
    if (!GROUPS[id]) return json({ error: "unknown_group" }, 404);
    const sess = await sessionFrom(context);
    const u = sess ? await getUser(env, sess.email) : null;
    const membership = u ? await getMembership(env, u.email) : null;
    if (!isMember(u, membership)) return json({ error: "forbidden", member: false }, 403);

    let body;
    try { body = await request.json(); } catch (e) { return json({ error: "bad_json" }, 400); }
    const data = (body.data || "").toString();
    if (!data) return json({ error: "empty" }, 400);
    // base64-lengde * 0.75 ~ antall bytes. Tak paa ca 5 MB.
    if (data.length * 0.75 > 5 * 1024 * 1024) return json({ error: "too_large" }, 413);
    const type = (body.type || "application/octet-stream").toString().slice(0, 100);
    const name = (body.name || "fil").toString().slice(0, 120);
    const kind = type.indexOf("image/") === 0 ? "image" : type.indexOf("audio/") === 0 ? "audio" : "file";
    const fid = crypto.randomUUID();
    await env.BUILDER_KV.put(
      "gfile:" + id + ":" + fid,
      JSON.stringify({ name: name, type: type, data: data }),
      { expirationTtl: 60 * 60 * 24 * 365 }
    );
    return json({ ok: true, file: { id: fid, url: "/api/group/" + id + "/file/" + fid, type: type, name: name, kind: kind } });
  }

  // /api/group/<id>/delete  -> slett en melding (egen, eller eier sletter hvilken som helst)
  if (parts.length === 2 && parts[1] === "delete") {
    const id = parts[0];
    if (!GROUPS[id]) return json({ error: "unknown_group" }, 404);
    const sess = await sessionFrom(context);
    const u = sess ? await getUser(env, sess.email) : null;
    const membership = u ? await getMembership(env, u.email) : null;
    if (!isMember(u, membership)) return json({ error: "forbidden", member: false }, 403);

    let body;
    try { body = await request.json(); } catch (e) { return json({ error: "bad_json" }, 400); }
    const mid = (body.messageId || "").toString();
    if (!mid) return json({ error: "bad_request" }, 400);

    const messages = await loadMessages(env, id);
    const idx = messages.findIndex((m) => m.id === mid);
    if (idx === -1) return json({ ok: true, deleted: mid });
    if (messages[idx].u !== u.email && !isOwner(u)) return json({ error: "not_yours" }, 403);
    messages.splice(idx, 1);
    await env.BUILDER_KV.put(chatKey(id), JSON.stringify(messages));
    return json({ ok: true, deleted: mid });
  }

  // /api/group/<id>/react  -> sla av/paa reaksjon paa en melding
  if (parts.length === 2 && parts[1] === "react") {
    const id = parts[0];
    if (!GROUPS[id]) return json({ error: "unknown_group" }, 404);
    const sess = await sessionFrom(context);
    const u = sess ? await getUser(env, sess.email) : null;
    const membership = u ? await getMembership(env, u.email) : null;
    if (!isMember(u, membership)) return json({ error: "forbidden", member: false }, 403);

    let body;
    try { body = await request.json(); } catch (e) { return json({ error: "bad_json" }, 400); }
    const mid = (body.messageId || "").toString();
    const emoji = (body.emoji || "").toString().slice(0, 8);
    if (!mid || !emoji) return json({ error: "bad_request" }, 400);

    const messages = await loadMessages(env, id);
    const msg = messages.find((m) => m.id === mid);
    if (!msg) return json({ error: "not_found" }, 404);
    if (!msg.r) msg.r = {};
    const who = u.email;
    const list = msg.r[emoji] || [];
    const i = list.indexOf(who);
    if (i === -1) list.push(who); else list.splice(i, 1);
    if (list.length) msg.r[emoji] = list; else delete msg.r[emoji];
    await env.BUILDER_KV.put(chatKey(id), JSON.stringify(messages));
    return json({ ok: true, reactions: msg.r });
  }

  if (parts.length === 2 && parts[1] === "messages") {
    const id = parts[0];
    if (!GROUPS[id]) return json({ error: "unknown_group" }, 404);

    const sess = await sessionFrom(context);
    const u = sess ? await getUser(env, sess.email) : null;
    const membership = u ? await getMembership(env, u.email) : null;
    if (!isMember(u, membership)) return json({ error: "forbidden", member: false }, 403);

    let body;
    try { body = await request.json(); } catch (e) { return json({ error: "bad_json" }, 400); }
    let text = (body.text || "").toString().trim();
    const att = body.attachment && typeof body.attachment === "object" ? {
      url: (body.attachment.url || "").toString().slice(0, 300),
      type: (body.attachment.type || "").toString().slice(0, 100),
      name: (body.attachment.name || "").toString().slice(0, 120),
      kind: (body.attachment.kind || "file").toString().slice(0, 12),
    } : null;
    if (!text && !att) return json({ error: "empty" }, 400);
    if (text.length > MAX_LEN) text = text.slice(0, MAX_LEN);

    const message = {
      id: crypto.randomUUID(),
      u: u.email,
      n: u.name || (u.email ? u.email.split("@")[0] : "Medlem"),
      t: text,
      ts: Date.now(),
    };
    if (att) message.a = att;

    const messages = await loadMessages(env, id);
    messages.push(message);
    while (messages.length > MAX_MESSAGES) messages.shift();
    await env.BUILDER_KV.put(chatKey(id), JSON.stringify(messages));

    return json({ ok: true, message: message });
  }

  return json({ error: "not_found" }, 404);
}
