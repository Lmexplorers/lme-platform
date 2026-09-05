/**
 * LME arrangementer — live-samlinger og events i fellesskapet.
 * Eier oppretter, medlemmer ser og melder seg paa (RSVP). KV-basert.
 *
 *   GET  /api/events            -> { events: [...], owner, now }
 *   POST /api/events  { action: "create"|"update"|"rsvp"|"join"|"delete", ... }
 *
 * Lagring: events -> JSON [{ id, title, desc, ts, dur, link, pass, replay,
 *                            rsvps:[e-post], att:[e-post], created }]
 *
 * Selve moteromslenken (Zoom) sendes ALDRI ut i lista. Den ligger bak
 * "join", som krever innlogget medlem OG at rommet er aapent, slik at en
 * lenke som lekker videre ikke gir noen utenfra tilgang til samlingen.
 * Eieren faar lenken med i lista, siden hun skal kunne redigere den.
 */

const OWNER_EMAILS = [
  "renate@lmexplorers.com", "hei@lmexplorers.com", "hello@lmexplorers.com",
  "support@lmexplorers.com", "renateshobby@hotmail.com",
];
const MAX_EVENTS = 100;
const MAX_ATT = 500;

/* Rommet aapnes et kvarter foer, og staar aapent en time etter slutt. */
const OPEN_BEFORE = 15 * 60 * 1000;
const OPEN_AFTER = 60 * 60 * 1000;
const DEFAULT_DUR = 60;

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
function activeStatus(s) { if (!s) return false; if (s.status && /cancel|inactive|expired|none/i.test(s.status)) return false; return true; }
function isOwner(u) { return !!u && (u.role === "owner" || OWNER_EMAILS.indexOf((u.email || "").toLowerCase()) !== -1); }
async function userFrom(context) {
  const { request, env } = context;
  const sid = readCookies(request)["lme_sess"];
  if (!sid) return null;
  const sraw = await env.BUILDER_KV.get("sess:" + sid);
  if (!sraw) return null;
  let sess; try { sess = JSON.parse(sraw); } catch (e) { return null; }
  const uraw = await env.BUILDER_KV.get("user:" + (sess.email || "").toLowerCase());
  if (!uraw) return null;
  try { return JSON.parse(uraw); } catch (e) { return null; }
}
async function isMember(env, u) {
  if (!u) return false;
  if (isOwner(u)) return true;
  if (activeStatus(u.subscription)) return true;
  const m = await env.BUILDER_KV.get("member:" + (u.email || "").toLowerCase());
  if (m) { try { return activeStatus(JSON.parse(m)); } catch (e) {} }
  return false;
}
async function loadEvents(env) {
  const raw = await env.BUILDER_KV.get("events");
  if (!raw) return [];
  try { const a = JSON.parse(raw); return Array.isArray(a) ? a : []; } catch (e) { return []; }
}

/* Bare vanlige nettadresser slipper gjennom, slik at ingen kan lagre
   javascript: eller data: og faa det aapnet i nettleseren til et medlem. */
function safeUrl(v) {
  const s = (v == null ? "" : String(v)).trim().slice(0, 500);
  if (!s) return "";
  if (!/^https?:\/\//i.test(s)) return "";
  return s;
}
function dur(e) { return Number(e.dur) > 0 ? Number(e.dur) : DEFAULT_DUR; }
function endsAt(e) { return e.ts + dur(e) * 60000; }
function opensAt(e) { return e.ts - OPEN_BEFORE; }
function closesAt(e) { return endsAt(e) + OPEN_AFTER; }

function view(e, u, owner, now) {
  const out = {
    id: e.id,
    title: e.title,
    desc: e.desc || "",
    ts: e.ts,
    dur: dur(e),
    ends: endsAt(e),
    opens: opensAt(e),
    closes: closesAt(e),
    replay: e.replay || "",
    hasRoom: true,
    external: !!e.link,
    joinOpen: now >= opensAt(e) && now <= closesAt(e),
    live: now >= e.ts && now <= endsAt(e),
    rsvpCount: (e.rsvps || []).length,
    youRsvp: (e.rsvps || []).indexOf(u.email) !== -1,
  };
  if (owner) {
    out.link = e.link || "";
    out.pass = e.pass || "";
    out.attCount = (e.att || []).length;
  }
  return out;
}

export async function onRequestGet(context) {
  const { env } = context;
  if (!env.BUILDER_KV) return json({ events: [] });
  const u = await userFrom(context);
  if (!(await isMember(env, u))) return json({ error: "forbidden", events: [] }, 403);
  const owner = isOwner(u);
  const now = Date.now();
  const events = (await loadEvents(env)).sort((a, b) => a.ts - b.ts)
    .map(function (e) { return view(e, u, owner, now); });
  return json({ events: events, owner: owner, now: now });
}

export async function onRequestPost(context) {
  const { request, env } = context;
  if (!env.BUILDER_KV) return json({ error: "not_configured" }, 200);
  const u = await userFrom(context);
  if (!(await isMember(env, u))) return json({ error: "forbidden" }, 403);

  let body;
  try { body = await request.json(); } catch (e) { return json({ error: "bad_json" }, 400); }
  const action = body.action;
  const events = await loadEvents(env);
  const now = Date.now();

  if (action === "create") {
    if (!isOwner(u)) return json({ error: "forbidden" }, 403);
    const title = (body.title || "").toString().trim().slice(0, 140);
    const ts = Number(body.ts) || Date.parse(body.datetime || "") || 0;
    if (!title || !ts) return json({ error: "bad_request" }, 400);
    const ev = {
      id: crypto.randomUUID(),
      title: title,
      desc: (body.desc || "").toString().trim().slice(0, 1000),
      ts: ts,
      dur: Math.min(600, Math.max(10, Number(body.dur) || DEFAULT_DUR)),
      link: safeUrl(body.link),
      pass: (body.pass || "").toString().trim().slice(0, 40),
      replay: safeUrl(body.replay),
      rsvps: [], att: [], created: now,
    };
    events.push(ev);
    while (events.length > MAX_EVENTS) events.sort((a, b) => a.ts - b.ts).shift();
    await env.BUILDER_KV.put("events", JSON.stringify(events));
    return json({ ok: true, id: ev.id });
  }

  if (action === "update") {
    if (!isOwner(u)) return json({ error: "forbidden" }, 403);
    const ev = events.find((e) => e.id === body.id);
    if (!ev) return json({ error: "not_found" }, 404);
    if (typeof body.title === "string" && body.title.trim()) ev.title = body.title.trim().slice(0, 140);
    if (typeof body.desc === "string") ev.desc = body.desc.trim().slice(0, 1000);
    const ts = Number(body.ts) || Date.parse(body.datetime || "") || 0;
    if (ts) ev.ts = ts;
    if (body.dur != null) ev.dur = Math.min(600, Math.max(10, Number(body.dur) || DEFAULT_DUR));
    if (typeof body.link === "string") ev.link = safeUrl(body.link);
    if (typeof body.pass === "string") ev.pass = body.pass.trim().slice(0, 40);
    if (typeof body.replay === "string") ev.replay = safeUrl(body.replay);
    await env.BUILDER_KV.put("events", JSON.stringify(events));
    return json({ ok: true, event: view(ev, u, true, now) });
  }

  if (action === "rsvp") {
    const ev = events.find((e) => e.id === body.id);
    if (!ev) return json({ error: "not_found" }, 404);
    if (!ev.rsvps) ev.rsvps = [];
    const i = ev.rsvps.indexOf(u.email);
    if (i === -1) ev.rsvps.push(u.email); else ev.rsvps.splice(i, 1);
    await env.BUILDER_KV.put("events", JSON.stringify(events));
    return json({ ok: true, youRsvp: i === -1, rsvpCount: ev.rsvps.length });
  }

  /* Selve doeren inn i moterommet. */
  if (action === "join") {
    const ev = events.find((e) => e.id === body.id);
    if (!ev) return json({ error: "not_found" }, 404);
    if (now < opensAt(ev)) return json({ error: "not_open", opens: opensAt(ev), ts: ev.ts }, 200);
    if (now > closesAt(ev)) return json({ error: "ended", replay: ev.replay || "" }, 200);
    if (!ev.att) ev.att = [];
    if (ev.att.indexOf(u.email) === -1) {
      ev.att.push(u.email);
      while (ev.att.length > MAX_ATT) ev.att.shift();
      await env.BUILDER_KV.put("events", JSON.stringify(events));
    }
    if (ev.link) {
      return json({ ok: true, kind: "ekstern", link: ev.link, pass: ev.pass || "", title: ev.title });
    }
    /* LMEs eget rom. Navnet bygges paa id-en, som er en tilfeldig uuid, saa
       ingen kan gjette seg fram til rommet utenfra. */
    return json({
      ok: true,
      kind: "innebygd",
      room: "lme-" + ev.id.replace(/-/g, ""),
      navn: u.name || (u.email ? u.email.split("@")[0] : "Medlem"),
      vert: isOwner(u),
      title: ev.title,
    });
  }

  if (action === "delete") {
    if (!isOwner(u)) return json({ error: "forbidden" }, 403);
    const idx = events.findIndex((e) => e.id === body.id);
    if (idx !== -1) { events.splice(idx, 1); await env.BUILDER_KV.put("events", JSON.stringify(events)); }
    return json({ ok: true });
  }

  return json({ error: "bad_action" }, 400);
}
