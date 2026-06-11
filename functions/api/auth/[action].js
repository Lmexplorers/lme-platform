/**
 * LME konto/innlogging — helt i Cloudflare, kun på KV (ingen ny database).
 * Bruker KV-bindingen BUILDER_KV som allerede er satt opp.
 *
 * Ruter:
 *   POST /api/auth/register   { email, password, name }
 *   POST /api/auth/login      { email, password }
 *   POST /api/auth/logout
 *   GET  /api/auth/me         -> { user, subscription, purchases }
 *
 * Lagring i KV:
 *   user:<e-post>   -> { id, email, name, salt, hash, role, created_at, subscription, purchases }
 *   sess:<sid>      -> { uid, email, role }   (HttpOnly-cookie lme_sess)
 */

// E-poster som automatisk blir eier (ikke kunde, uten abonnement).
const OWNER_EMAILS = ["hei@littlemontessoriexplorers.com", "renateshobby@hotmail.com"];

function json(data, status, headers) {
  return new Response(JSON.stringify(data), {
    status: status || 200,
    headers: Object.assign(
      { "Content-Type": "application/json", "Cache-Control": "no-store" },
      headers || {}
    ),
  });
}

function hex(buf) {
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}
function unhex(s) {
  const a = new Uint8Array(s.length / 2);
  for (let i = 0; i < a.length; i++) a[i] = parseInt(s.substr(i * 2, 2), 16);
  return a;
}
async function pbkdf2(password, salt) {
  const key = await crypto.subtle.importKey(
    "raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]
  );
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt, iterations: 100000, hash: "SHA-256" }, key, 256
  );
  return new Uint8Array(bits);
}
async function hashPassword(password) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  return { salt: hex(salt), hash: hex(await pbkdf2(password, salt)) };
}
async function verifyPassword(password, saltHex, hashHex) {
  const got = hex(await pbkdf2(password, unhex(saltHex)));
  if (got.length !== hashHex.length) return false;
  let diff = 0;
  for (let i = 0; i < got.length; i++) diff |= got.charCodeAt(i) ^ hashHex.charCodeAt(i);
  return diff === 0;
}

function readCookies(request) {
  const out = {};
  (request.headers.get("Cookie") || "").split(";").forEach((p) => {
    const i = p.indexOf("=");
    if (i > 0) out[p.slice(0, i).trim()] = p.slice(i + 1).trim();
  });
  return out;
}
const SESS_TTL = 60 * 60 * 24 * 30; // 30 dager
function sessionCookie(sid) {
  return `lme_sess=${sid}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${SESS_TTL}`;
}
function clearCookie() {
  return "lme_sess=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0";
}
function userKey(email) { return "user:" + email.trim().toLowerCase(); }

async function createSession(env, user) {
  const sid = (crypto.randomUUID() + crypto.randomUUID()).replace(/-/g, "");
  await env.BUILDER_KV.put(
    "sess:" + sid,
    JSON.stringify({ uid: user.id, email: user.email, role: user.role }),
    { expirationTtl: SESS_TTL }
  );
  return sid;
}
async function sessionFrom(context) {
  const { request, env } = context;
  const sid = readCookies(request)["lme_sess"];
  if (!sid || !env.BUILDER_KV) return null;
  const raw = await env.BUILDER_KV.get("sess:" + sid);
  if (!raw) return null;
  try { const s = JSON.parse(raw); s.sid = sid; return s; } catch (e) { return null; }
}
async function getUser(env, email) {
  const raw = await env.BUILDER_KV.get(userKey(email));
  if (!raw) return null;
  try { return JSON.parse(raw); } catch (e) { return null; }
}
function publicUser(u) {
  return { id: u.id, email: u.email, name: u.name || null, role: u.role || "customer", created_at: u.created_at };
}

export async function onRequestGet(context) {
  const { params, env } = context;
  if (params.action !== "me") return json({ error: "not_found" }, 404);
  if (!env.BUILDER_KV) return json({ user: null }, 200);
  const sess = await sessionFrom(context);
  if (!sess) return json({ user: null }, 200);
  const u = await getUser(env, sess.email);
  if (!u) return json({ user: null }, 200);
  return json({ user: publicUser(u), subscription: u.subscription || null, purchases: u.purchases || [] });
}

export async function onRequestPost(context) {
  const { request, params, env } = context;
  const action = params.action;

  if (action === "logout") {
    const sess = await sessionFrom(context);
    if (sess && env.BUILDER_KV) await env.BUILDER_KV.delete("sess:" + sess.sid);
    return json({ ok: true }, 200, { "Set-Cookie": clearCookie() });
  }

  if (!env.BUILDER_KV) return json({ error: "not_configured" }, 200);
  let body;
  try { body = await request.json(); } catch (e) { return json({ error: "bad_json" }, 400); }
  const email = (body.email || "").trim().toLowerCase();
  const password = body.password || "";

  if (action === "register") {
    if (!email || !/.+@.+\..+/.test(email)) return json({ error: "bad_email" }, 400);
    if (password.length < 6) return json({ error: "weak_password" }, 400);
    if (await getUser(env, email)) return json({ error: "exists" }, 409);
    const { salt, hash } = await hashPassword(password);
    const role = OWNER_EMAILS.indexOf(email) !== -1 ? "owner" : "customer";
    const user = {
      id: crypto.randomUUID(),
      email,
      name: (body.name || "").trim() || null,
      salt, hash, role,
      created_at: Date.now(),
      subscription: null,
      purchases: [],
    };
    await env.BUILDER_KV.put(userKey(email), JSON.stringify(user));
    const sid = await createSession(env, user);
    return json({ ok: true, user: publicUser(user) }, 200, { "Set-Cookie": sessionCookie(sid) });
  }

  if (action === "login") {
    const u = await getUser(env, email);
    if (!u) return json({ error: "invalid" }, 401);
    if (!(await verifyPassword(password, u.salt, u.hash))) return json({ error: "invalid" }, 401);
    const sid = await createSession(env, u);
    return json({ ok: true, user: publicUser(u) }, 200, { "Set-Cookie": sessionCookie(sid) });
  }

  return json({ error: "not_found" }, 404);
}
