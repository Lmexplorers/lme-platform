/**
 * LME arrangementer — live-samlinger og events i fellesskapet.
 * Eier oppretter, medlemmer ser og melder seg paa (RSVP). KV-basert.
 *
 *   GET  /api/events            -> { events: [...], owner }
 *   POST /api/events  { action: "create"|"rsvp"|"delete", ... }
 *
 * Lagring: events -> JSON [{ id, title, desc, ts, link, rsvps:[e-post], created }]
 */

const OWNER_EMAILS = [
  "renate@lmexplorers.com", "hei@lmexplorers.com", "hello@lmexplorers.com",
  "support@lmexplorers.com", "renateshobby@hotmail.com",
];
const MAX_EVENTS = 100;

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

export async function onRequestGet(context) {
  const { env } = context;
  if (!env.BUILDER_KV) return json({ events: [] });
  const u = await userFrom(context);
  if (!(await isMember(env, u))) return json({ error: "forbidden", events: [] }, 403);
  const events = (await loadEvents(env)).sort((a, b) => a.ts - b.ts).map(function (e) {
    return { id: e.id, title: e.title, desc: e.desc || "", ts: e.ts, link: e.link || "", rsvpCount: (e.rsvps || []).length, youRsvp: (e.rsvps || []).indexOf(u.email) !== -1 };
  });
  return json({ events: events, owner: isOwner(u) });
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

  if (action === "create") {
    if (!isOwner(u)) return json({ error: "forbidden" }, 403);
    const title = (body.title || "").toString().trim().slice(0, 140);
    const ts = Number(body.ts) || Date.parse(body.datetime || "") || 0;
    if (!title || !ts) return json({ error: "bad_request" }, 400);
    const ev = { id: crypto.randomUUID(), title: title, desc: (body.desc || "").toString().trim().slice(0, 1000), ts: ts, link: (body.link || "").toString().trim().slice(0, 300), rsvps: [], created: Date.now() };
    events.push(ev);
    while (events.length > MAX_EVENTS) events.sort((a, b) => a.ts - b.ts).shift();
    await env.BUILDER_KV.put("events", JSON.stringify(events));
    return json({ ok: true, id: ev.id });
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

  if (action === "delete") {
    if (!isOwner(u)) return json({ error: "forbidden" }, 403);
    const idx = events.findIndex((e) => e.id === body.id);
    if (idx !== -1) { events.splice(idx, 1); await env.BUILDER_KV.put("events", JSON.stringify(events)); }
    return json({ ok: true });
  }

  return json({ error: "bad_action" }, 400);
}
