import { headshotAppAccess } from "../_lib/access.js";
/**
 * LME AI Twin, tren en Higgsfield Soul-karakter på ansiktet ditt (én gang).
 *
 * Riktig vei til ekte likhet: last opp 5-20 bilder av deg selv, tren en Soul,
 * og bruk den etterpå i /api/headshot for portretter som faktisk ligner deg.
 * Bruker Higgsfield-nøklene plattformen allerede har (ingen ny registrering).
 * Soul-en lagres per bruker i KV, så du trener bare én gang.
 *
 * Ruter:
 *   GET  /api/soul                          -> { loggedIn, owner, soul }  (din trente Soul, om noen)
 *   POST /api/soul   { images: [url,...] }  -> { id, status }             (start trening)
 *   GET  /api/soul?id=<id>                  -> { status, soulId? }        (poll trening)
 *
 * Endepunktene kan overstyres om Higgsfield endrer stier:
 *   HIGGSFIELD_SOUL_CREATE_PATH (standard /v1/custom-references)
 *   HIGGSFIELD_SOUL_STATUS_PATH (standard /v1/custom-references/)  (id legges bak)
 */

const HF_BASE = "https://platform.higgsfield.ai";
const CREATE_PATH_DEFAULT = "/v1/custom-references";
const STATUS_PATH_DEFAULT = "/v1/custom-references/";

function json(data, status) {
  return new Response(JSON.stringify(data), {
    status: status || 200,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store", "Access-Control-Allow-Origin": "*" },
  });
}
function auth(env) { return "Key " + env.HIGGSFIELD_API_KEY + ":" + env.HIGGSFIELD_SECRET; }

function findId(o) {
  if (!o || typeof o !== "object") return "";
  return o.id || o.reference_id || o.custom_reference_id || (o.result && o.result.id) ||
    (Array.isArray(o.jobs) && o.jobs[0] && o.jobs[0].id) || "";
}
function findStatus(o) {
  if (!o || typeof o !== "object") return "";
  const s = o.status || (Array.isArray(o.jobs) && o.jobs[0] && o.jobs[0].status) || "";
  return String(s).toLowerCase();
}

async function sessionEmail(context) {
  const acc = await headshotAppAccess(context);
  return { acc };
}

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "GET, POST, OPTIONS", "Access-Control-Allow-Headers": "Content-Type" },
  });
}

// ---- GET: din trente Soul, eller poll av en pågående trening ----
export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const id = url.searchParams.get("id") || "";

  const { acc } = await sessionEmail(context);

  // Poll av en trenings-jobb.
  if (id) {
    if (!env.HIGGSFIELD_API_KEY || !env.HIGGSFIELD_SECRET) return json({ error: "not_configured" }, 200);
    if (!/^[A-Za-z0-9_-]{6,}$/.test(id)) return json({ error: "Ugyldig id." }, 400);
    const statusPath = env.HIGGSFIELD_SOUL_STATUS_PATH || STATUS_PATH_DEFAULT;
    let r, data;
    try {
      r = await fetch(HF_BASE + statusPath + encodeURIComponent(id), { headers: { "Authorization": auth(env), "Accept": "application/json" } });
      const t = await r.text(); try { data = JSON.parse(t); } catch { data = null; }
    } catch (e) { return json({ status: "in_progress" }); }
    if (!r.ok) return json({ status: "in_progress", note: "hf " + r.status });
    const status = findStatus(data) || "in_progress";
    if (status === "completed" || status === "ready" || status === "succeeded" || status === "trained") {
      // Lagre som brukerens Soul.
      if (acc && acc.loggedIn && env.BUILDER_KV) {
        try {
          const email = await ownerEmail(context);
          if (email) await env.BUILDER_KV.put("soul:" + email, JSON.stringify({ id: id, status: "ready", ts: 0 }));
        } catch (e) {}
      }
      return json({ status: "ready", soulId: id });
    }
    if (status === "failed" || status === "nsfw") return json({ status: "failed", error: "Treningen feilet. Prøv med flere og tydeligere ansiktsbilder." });
    return json({ status: "in_progress" });
  }

  // Ingen id: returner brukerens lagrede Soul (om noen).
  let soul = null;
  try {
    const email = await ownerEmail(context);
    if (email && env.BUILDER_KV) {
      const raw = await env.BUILDER_KV.get("soul:" + email);
      if (raw) soul = JSON.parse(raw);
    }
  } catch (e) {}
  return json({ loggedIn: acc.loggedIn, owner: acc.owner, soul: soul });
}

// ---- POST: start trening av en Soul fra opplastede bilder ----
export async function onRequestPost(context) {
  const { request, env } = context;
  if (!env.HIGGSFIELD_API_KEY || !env.HIGGSFIELD_SECRET) return json({ error: "not_configured" }, 200);

  const { acc } = await sessionEmail(context);
  if (!acc.loggedIn) return json({ error: "Logg inn for å trene tvillingen din." }, 401);

  let body;
  try { body = await request.json(); } catch { return json({ error: "Ugyldig JSON" }, 400); }
  const images = Array.isArray(body.images) ? body.images.filter((u) => /^https?:\/\//.test(String(u))).slice(0, 20) : [];
  if (images.length < 5) return json({ error: "Last opp minst 5 tydelige bilder av ansiktet ditt (5-20)." }, 400);

  const createPath = env.HIGGSFIELD_SOUL_CREATE_PATH || CREATE_PATH_DEFAULT;
  const payload = {
    name: "lme-" + (body.name ? String(body.name).slice(0, 24) : "twin"),
    input_images: images.map((u) => ({ type: "image_url", image_url: u })),
    model: "soul-2",
  };

  let r, data, text;
  try {
    r = await fetch(HF_BASE + createPath, {
      method: "POST",
      headers: { "Authorization": auth(env), "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify(payload),
    });
    text = await r.text();
    try { data = JSON.parse(text); } catch { data = null; }
  } catch (e) {
    return json({ error: "Kom ikke i kontakt med Higgsfield." }, 502);
  }
  if (!r.ok) {
    return json({ error: "Higgsfield svarte " + r.status + (data && data.detail ? " (" + data.detail + ")" : "") + ".", raw: (text || "").slice(0, 300) }, 200);
  }
  const id = findId(data);
  if (!id) return json({ error: "Fant ingen Soul-id i svaret.", raw: (text || "").slice(0, 300) }, 200);
  return json({ id: id, status: findStatus(data) || "in_progress" });
}

// Hjelper: e-post for innlogget bruker (uten å eksponere access-internals).
async function ownerEmail(context) {
  try {
    const r = await fetch(new URL("/api/auth/me", context.request.url).toString(), {
      headers: { "Cookie": context.request.headers.get("Cookie") || "" },
    });
    if (!r.ok) return "";
    const d = await r.json();
    return (d && d.user && d.user.email) ? String(d.user.email) : "";
  } catch (e) { return ""; }
}
