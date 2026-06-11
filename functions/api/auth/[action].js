/**
 * LME konto/innlogging — helt i Cloudflare (D1 + KV-sesjoner).
 *
 * Ruter:
 *   POST /api/auth/register   { email, password, name }
 *   POST /api/auth/login      { email, password }
 *   POST /api/auth/logout
 *   GET  /api/auth/me         -> { user, subscription, purchases }
 *
 * Krever:
 *   - D1-binding "DB"  (Settings -> Functions -> D1 database bindings)
 *   - KV-binding "BUILDER_KV"  (brukes til sesjoner, prefiks "sess:")
 */

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
  try {
    const s = JSON.parse(raw);
    s.sid = sid;
    return s;
  } catch (e) {
    return null;
  }
}

export async function onRequestGet(context) {
  const { params, env } = context;
  if (params.action !== "me") return json({ error: "not_found" }, 404);
  const sess = await sessionFrom(context);
  if (!sess) return json({ user: null }, 200);
  if (!env.DB) {
    return json({ user: { id: sess.uid, email: sess.email, role: sess.role }, subscription: null, purchases: [] });
  }
  const user = await env.DB.prepare(
    "SELECT id,email,name,role,created_at FROM users WHERE id=?"
  ).bind(sess.uid).first();
  if (!user) return json({ user: null }, 200);
  const subscription = await env.DB.prepare(
    "SELECT plan,status,provider,current_period_end FROM subscriptions WHERE user_id=? ORDER BY created_at DESC LIMIT 1"
  ).bind(sess.uid).first();
  const purchasesRes = await env.DB.prepare(
    "SELECT title,amount_ore,created_at FROM purchases WHERE user_id=? ORDER BY created_at DESC"
  ).bind(sess.uid).all();
  return json({ user, subscription: subscription || null, purchases: (purchasesRes && purchasesRes.results) || [] });
}

export async function onRequestPost(context) {
  const { request, params, env } = context;
  const action = params.action;

  if (action === "logout") {
    const sess = await sessionFrom(context);
    if (sess && env.BUILDER_KV) await env.BUILDER_KV.delete("sess:" + sess.sid);
    return json({ ok: true }, 200, { "Set-Cookie": clearCookie() });
  }

  if (!env.DB) return json({ error: "not_configured" }, 200);
  let body;
  try { body = await request.json(); } catch (e) { return json({ error: "bad_json" }, 400); }
  const email = (body.email || "").trim().toLowerCase();
  const password = body.password || "";

  if (action === "register") {
    if (!email || !/.+@.+\..+/.test(email)) return json({ error: "bad_email" }, 400);
    if (password.length < 6) return json({ error: "weak_password" }, 400);
    const existing = await env.DB.prepare("SELECT id FROM users WHERE email=?").bind(email).first();
    if (existing) return json({ error: "exists" }, 409);
    const { salt, hash } = await hashPassword(password);
    const id = crypto.randomUUID();
    const name = (body.name || "").trim() || null;
    await env.DB.prepare(
      "INSERT INTO users (id,email,name,pass_salt,pass_hash,role,created_at) VALUES (?,?,?,?,?,?,?)"
    ).bind(id, email, name, salt, hash, "customer", Date.now()).run();
    const sid = await createSession(env, { id, email, role: "customer" });
    return json({ ok: true, user: { id, email, name, role: "customer" } }, 200, { "Set-Cookie": sessionCookie(sid) });
  }

  if (action === "login") {
    const u = await env.DB.prepare(
      "SELECT id,email,name,role,pass_salt,pass_hash FROM users WHERE email=?"
    ).bind(email).first();
    if (!u) return json({ error: "invalid" }, 401);
    const ok = await verifyPassword(password, u.pass_salt, u.pass_hash);
    if (!ok) return json({ error: "invalid" }, 401);
    const sid = await createSession(env, u);
    return json({ ok: true, user: { id: u.id, email: u.email, name: u.name, role: u.role } }, 200, { "Set-Cookie": sessionCookie(sid) });
  }

  return json({ error: "not_found" }, 404);
}
