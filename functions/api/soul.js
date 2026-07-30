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
// Higgsfield bruker to ulike auth-skjema: V2-genereringen tar "Authorization:
// Key KEY:SECRET", mens V1 (custom-references / Soul) tar egne hf-api-key/
// hf-secret-headere. For å slippe å gjette, prøver vi skjemaene i rekkefølge og
// bruker det første som ikke gir 401. Er alle 401, er selve nøklene feil, og da
// rapporterer vi hvert forsøk så vi ser det.
function authSchemes(env) {
  const key = env.HIGGSFIELD_API_KEY || "";
  const secret = env.HIGGSFIELD_SECRET || "";
  return [
    { name: "hf", headers: { "hf-api-key": key, "hf-secret": secret } },
    { name: "auth", headers: { "Authorization": "Key " + key + ":" + secret } },
    { name: "both", headers: { "hf-api-key": key, "hf-secret": secret, "Authorization": "Key " + key + ":" + secret } },
  ];
}

// Prøv en Higgsfield-forespørsel med hvert auth-skjema til et som ikke gir 401.
// Returnerer { ok, status, text, data, scheme, tried:[{name,status}] }.
async function hfRequest(env, url, method, baseHeaders, body) {
  const tried = [];
  let last = null;
  for (const s of authSchemes(env)) {
    let r, text;
    try {
      r = await fetch(url, { method: method, headers: Object.assign({}, baseHeaders, s.headers), body: body });
      text = await r.text();
    } catch (e) {
      tried.push({ name: s.name, status: -1 });
      last = { ok: false, status: -1, text: "", data: null, scheme: s.name, tried: tried, network: true };
      continue;
    }
    tried.push({ name: s.name, status: r.status });
    let data = null; try { data = JSON.parse(text); } catch (e) {}
    last = { ok: r.ok, status: r.status, text: text, data: data, scheme: s.name, tried: tried };
    // 401 = auth avvist, prøv neste skjema. Alt annet (200, 422, 400, 5xx)
    // betyr at auth gikk igjennom, så vi stopper her.
    if (r.status !== 401) return last;
  }
  return last;
}
function triedStr(tried) { return (tried || []).map(function (t) { return t.name + " " + t.status; }).join(", "); }

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
    const res = await hfRequest(env, HF_BASE + statusPath + encodeURIComponent(id), "GET", { "Accept": "application/json" }, undefined);
    if (!res || !res.ok) return json({ status: "in_progress", note: "hf " + (res ? res.status : "?") });
    const data = res.data;
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
  // Kroppen følger Higgsfields SoulIdCreateData: bare name + input_images.
  const payload = {
    name: "lme-" + (body.name ? String(body.name).slice(0, 24) : "twin"),
    input_images: images.map((u) => ({ type: "image_url", image_url: u })),
  };

  const res = await hfRequest(env, HF_BASE + createPath, "POST",
    { "Content-Type": "application/json", "Accept": "application/json" },
    JSON.stringify(payload));
  if (res && res.network) return json({ error: "Kom ikke i kontakt med Higgsfield." }, 502);
  const data = res && res.data;
  if (!res || !res.ok) {
    const allAuth = res && (res.tried || []).every(function (t) { return t.status === 401; });
    const detail = data && data.detail ? " (" + data.detail + ")" : "";
    const tried = res ? triedStr(res.tried) : "";
    const msg = allAuth
      ? "Higgsfield godtok ikke nøklene (401). Sjekk at HIGGSFIELD_API_KEY og HIGGSFIELD_SECRET i Cloudflare er riktige og aktive. [" + tried + "]"
      : "Higgsfield svarte " + (res ? res.status : "?") + detail + ". [" + tried + "]";
    return json({ error: msg, tried: tried, raw: (res && res.text ? res.text : "").slice(0, 300) }, 200);
  }
  const id = findId(data);
  if (!id) return json({ error: "Fant ingen Soul-id i svaret.", raw: (res.text || "").slice(0, 300) }, 200);
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
