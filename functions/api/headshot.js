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
// Higgsfield bruker to auth-skjema (V2 "Authorization: Key" for generering, V1
// hf-api-key/hf-secret for custom-references). Vi prøver skjemaene i rekkefølge
// og bruker det første som ikke gir 401.
function authSchemes(env) {
  const key = env.HIGGSFIELD_API_KEY || "";
  const secret = env.HIGGSFIELD_SECRET || "";
  return [
    { name: "auth", headers: { "Authorization": "Key " + key + ":" + secret } },
    { name: "hf", headers: { "hf-api-key": key, "hf-secret": secret } },
    { name: "both", headers: { "hf-api-key": key, "hf-secret": secret, "Authorization": "Key " + key + ":" + secret } },
  ];
}
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
      last = { ok: false, status: -1, text: "", data: null, tried: tried, network: true };
      continue;
    }
    tried.push({ name: s.name, status: r.status });
    let data = null; try { data = JSON.parse(text); } catch (e) {}
    last = { ok: r.ok, status: r.status, text: text, data: data, tried: tried };
    if (r.status !== 401) return last;
  }
  return last;
}
function triedStr(tried) { return (tried || []).map(function (t) { return t.name + " " + t.status; }).join(", "); }

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

  const res = await hfRequest(env, HF_BASE + SUBMIT_PATH, "POST",
    { "Content-Type": "application/json", "Accept": "application/json" },
    JSON.stringify(payload));
  if (res && res.network) {
    if (!gate.owner) await refundImageCredit(context, gate.email);
    return json({ error: "Kom ikke i kontakt med Higgsfield. Kreditten er refundert." }, 502);
  }
  const data = res && res.data;
  if (!res || !res.ok) {
    if (!gate.owner) await refundImageCredit(context, gate.email);
    const allAuth = res && (res.tried || []).every(function (t) { return t.status === 401; });
    const msg = allAuth
      ? "Higgsfield godtok ikke nøklene (401). Kreditten er refundert. [" + triedStr(res.tried) + "]"
      : "Higgsfield svarte " + (res ? res.status : "?") + ". Kreditten er refundert. [" + (res ? triedStr(res.tried) : "") + "]";
    return json({ error: msg, raw: (res && res.text ? res.text : "").slice(0, 200) }, 200);
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

  const res = await hfRequest(env, statusUrl, "GET", { "Accept": "application/json" }, undefined);
  if (res && res.network) return json({ status: "in_progress" });
  if (!res || !res.ok) return json({ error: "Higgsfield status " + (res ? res.status : "?") + "." }, 200);
  const data = res.data;

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
