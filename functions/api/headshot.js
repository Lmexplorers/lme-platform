import { enforceHeadshotApp, refundImageCredit, headshotAppAccess } from "../_lib/access.js";
/**
 * LME AI Headshot, ansiktsbevarende proff-portretter via en TRENT Higgsfield
 * Soul. Rekkefølge: bruker trener en Soul på bildene sine (/api/soul), og her
 * genererer vi portretter i valgt stil med den trente identiteten
 * (custom_reference_id). Det er slik likheten faktisk blir god.
 *
 * Bruker Higgsfield-nøklene plattformen allerede har (ingen ny registrering).
 * Hver headshot trekker én forhåndskjøpt bilde-kreditt, eier gratis, refundert
 * ved feil.
 *
 * Ruter:
 *   GET  /api/headshot                          -> { loggedIn, owner, credit, hasSoul }
 *   POST /api/headshot   { style }               -> { id, statusUrl, credit } | { needSoul:true }
 *   GET  /api/headshot?id=<id>[&u=<statusUrl>]   -> { status, url? }
 *
 * Secrets: HIGGSFIELD_API_KEY, HIGGSFIELD_SECRET.
 */

const HF_BASE = "https://platform.higgsfield.ai";
const SUBMIT_PATH = "/v1/text2image/soul";
const JOB_PREFIX = "hsjob:";

const STYLES = {
  business:  "professional corporate business headshot portrait, tailored dark blazer, clean neutral studio background, soft flattering studio lighting, confident friendly expression, sharp focus, high-end",
  linkedin:  "professional LinkedIn profile headshot, smart business-casual outfit, soft blurred modern office background, natural window light, warm approachable smile, crisp and clean",
  portrait:  "elegant editorial studio portrait, refined soft lighting with gentle shadows, plain warm background, timeless and flattering, magazine quality",
  bw:        "classic black and white studio portrait, dramatic soft lighting, plain dark background, timeless elegant look, fine detail, monochrome",
  outdoor:   "natural outdoor lifestyle portrait, soft golden-hour light, gently blurred green background, relaxed warm expression, candid and premium",
  creative:  "modern creative portrait with soft colored studio lighting, stylish contemporary look, clean gradient background, vibrant yet tasteful",
};
const SAFE_SUFFIX = ", photorealistic, natural skin texture, looking at the camera, family-friendly";

function json(data, status) {
  return new Response(JSON.stringify(data), {
    status: status || 200,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store", "Access-Control-Allow-Origin": "*" },
  });
}
// Send begge autentiseringsskjemaene Higgsfield bruker (V2 "Authorization: Key"
// for generering, og V1 hf-api-key/hf-secret), så vi unngår 401 uansett rute.
function hfHeaders(env) {
  return {
    "hf-api-key": env.HIGGSFIELD_API_KEY,
    "hf-secret": env.HIGGSFIELD_SECRET,
    "Authorization": "Key " + env.HIGGSFIELD_API_KEY + ":" + env.HIGGSFIELD_SECRET,
  };
}

async function soulFor(env, email) {
  if (!env.BUILDER_KV || !email) return null;
  try { const raw = await env.BUILDER_KV.get("soul:" + email); if (raw) return JSON.parse(raw); } catch (e) {}
  return null;
}
function findImageUrl(o) {
  if (!o || typeof o !== "object") return null;
  if (Array.isArray(o.images) && o.images[0] && o.images[0].url) return o.images[0].url;
  if (o.image && o.image.url) return o.image.url;
  if (o.results && o.results.raw && o.results.raw.url) return o.results.raw.url;
  if (Array.isArray(o.jobs) && o.jobs[0]) {
    const j = o.jobs[0];
    if (j.results && j.results.raw && j.results.raw.url) return j.results.raw.url;
    if (Array.isArray(j.images) && j.images[0] && j.images[0].url) return j.images[0].url;
  }
  if (Array.isArray(o.results) && o.results[0] && o.results[0].url) return o.results[0].url;
  return null;
}
function findStatus(o) {
  if (!o || typeof o !== "object") return "";
  if (o.status) return String(o.status).toLowerCase();
  if (Array.isArray(o.jobs) && o.jobs[0] && o.jobs[0].status) return String(o.jobs[0].status).toLowerCase();
  return "";
}

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "GET, POST, OPTIONS", "Access-Control-Allow-Headers": "Content-Type" },
  });
}

// ---- POST: generer et headshot med den trente Soul-en (trekker 1 kreditt) ----
export async function onRequestPost(context) {
  const { request, env } = context;
  if (!env.HIGGSFIELD_API_KEY || !env.HIGGSFIELD_SECRET) return json({ error: "not_configured" }, 200);

  let body;
  try { body = await request.json(); } catch { return json({ error: "Ugyldig JSON" }, 400); }
  const styleKey = String(body.style || "business").toLowerCase();
  const style = STYLES[styleKey] || STYLES.business;

  // Krev en trent Soul FØR vi trekker kreditt.
  const acc = await headshotAppAccess(context);
  if (!acc.loggedIn) return json({ error: "Logg inn for å lage headshots." }, 401);
  const soul = await soulFor(env, acc.email);
  if (!soul || !soul.id || soul.status !== "ready") return json({ needSoul: true, error: "Tren tvillingen din først, så lager vi headshots som ligner deg." }, 200);

  const prompt = ("a realistic professional headshot photograph of the person, " + style + SAFE_SUFFIX).slice(0, 900);

  const gate = await enforceHeadshotApp(context);
  if (!gate.ok) return json({ error: gate.error, needCredits: gate.needCredits || false }, gate.status);

  const strength = Number(env.HIGGSFIELD_SOUL_STRENGTH) > 0 ? Number(env.HIGGSFIELD_SOUL_STRENGTH) : 1;
  const payload = {
    prompt: prompt,
    custom_reference_id: soul.id,
    custom_reference_strength: strength,
    width_and_height: "PORTRAIT_1536x2048",
    quality: "HD",
    batch_size: "SINGLE",
  };

  let r, data, text;
  try {
    r = await fetch(HF_BASE + SUBMIT_PATH, {
      method: "POST",
      headers: Object.assign({ "Content-Type": "application/json", "Accept": "application/json" }, hfHeaders(env)),
      body: JSON.stringify(payload),
    });
    text = await r.text();
    try { data = JSON.parse(text); } catch { data = null; }
  } catch (e) {
    if (!gate.owner) await refundImageCredit(context, gate.email);
    return json({ error: "Kom ikke i kontakt med Higgsfield. Kreditten er refundert." }, 502);
  }
  if (!r.ok) {
    if (!gate.owner) await refundImageCredit(context, gate.email);
    return json({ error: "Higgsfield svarte " + r.status + ". Kreditten er refundert.", raw: (text || "").slice(0, 200) }, 200);
  }
  const id = data && (data.request_id || data.id || (Array.isArray(data.jobs) && data.jobs[0] && data.jobs[0].id));
  const statusUrl = data && (data.status_url || data.statusUrl);
  const immediate = findImageUrl(data);
  if (immediate) return json({ status: "completed", url: immediate, credit: gate.credit });
  if (!id && !statusUrl) {
    if (!gate.owner) await refundImageCredit(context, gate.email);
    return json({ error: "Fant ingen jobb i svaret. Kreditten er refundert." }, 200);
  }
  if (id && !gate.owner) {
    try { await env.BUILDER_KV.put(JOB_PREFIX + id, JSON.stringify({ email: gate.email, refunded: false }), { expirationTtl: 60 * 60 * 2 }); } catch (e) {}
  }
  return json({ id: id || "", statusUrl: statusUrl || "", credit: gate.credit });
}

// ---- GET: tilgang/kreditt + om du har en trent Soul, eller poll ----
export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const id = url.searchParams.get("id") || "";
  let statusUrl = url.searchParams.get("u") || "";

  if (!id && !statusUrl) {
    const acc = await headshotAppAccess(context);
    const soul = await soulFor(env, acc.email);
    return json({ loggedIn: acc.loggedIn, owner: acc.owner, credit: acc.credit, hasSoul: !!(soul && soul.id && soul.status === "ready") });
  }
  if (!env.HIGGSFIELD_API_KEY || !env.HIGGSFIELD_SECRET) return json({ error: "not_configured" }, 200);

  if (statusUrl) {
    try { if (new URL(statusUrl).hostname !== "platform.higgsfield.ai") statusUrl = ""; } catch { statusUrl = ""; }
  }
  if (!statusUrl) {
    if (!/^[A-Za-z0-9_-]{6,}$/.test(id)) return json({ error: "Ugyldig jobb-ID." }, 400);
    statusUrl = HF_BASE + "/v1/text2image/soul/requests/" + id;
  }

  let r, data, text;
  try {
    r = await fetch(statusUrl, { headers: Object.assign({ "Accept": "application/json" }, hfHeaders(env)) });
    text = await r.text();
    try { data = JSON.parse(text); } catch { data = null; }
  } catch (e) { return json({ status: "in_progress" }); }
  if (!r.ok) return json({ error: "Higgsfield status " + r.status + "." }, 200);

  const status = findStatus(data) || "in_progress";
  const imgUrl = findImageUrl(data);
  if (imgUrl) return json({ status: "completed", url: imgUrl });
  if (status === "failed" || status === "nsfw") {
    if (id) {
      try {
        const raw = await env.BUILDER_KV.get(JOB_PREFIX + id);
        if (raw) {
          const rec = JSON.parse(raw);
          if (rec && rec.email && !rec.refunded) {
            await refundImageCredit(context, rec.email);
            rec.refunded = true;
            await env.BUILDER_KV.put(JOB_PREFIX + id, JSON.stringify(rec), { expirationTtl: 60 * 60 * 2 });
          }
        }
      } catch (e) {}
    }
    return json({ status: status, error: "Bildet kunne ikke lages (" + status + "). Kreditten er refundert." });
  }
  return json({ status: "in_progress" });
}
