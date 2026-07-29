import { enforceHeadshotApp, refundImageCredit, headshotAppAccess } from "../_lib/access.js";
/**
 * LME AI Headshot, ansiktsbevarende proff-portretter (Higgsfield Soul).
 *
 * Last opp en selfie, velg stil, og få et profesjonelt headshot som fortsatt
 * ligner deg. Egen app for eier (gratis) eller de som har kjøpt bilde-kreditt.
 * Hver headshot trekker én forhåndskjøpt bilde-kreditt, refundert ved feil.
 *
 * Ruter:
 *   GET  /api/headshot                          -> { loggedIn, owner, credit }
 *   POST /api/headshot   { imageUrl, style }     -> { id, statusUrl, credit }
 *   GET  /api/headshot?id=<id>[&u=<statusUrl>]   -> { status, url? }
 *
 * Secrets i Cloudflare Pages: HIGGSFIELD_API_KEY, HIGGSFIELD_SECRET.
 * Soul-modus utløses av prompt + reference_image_urls (selfien din).
 */

const HF_BASE = "https://platform.higgsfield.ai";
const SUBMIT_PATH = "/v1/text2image/soul";
const JOB_PREFIX = "hsjob:";

// Stil-oppskrifter. Ansiktet beholdes via reference_image_urls; prompten styrer
// klær, bakgrunn og stemning. Alltid på engelsk for best resultat i modellen.
const STYLES = {
  business:  "a polished professional business headshot, wearing a tailored dark blazer, clean neutral studio background, soft flattering studio lighting, confident friendly expression, sharp focus, high-end corporate portrait",
  linkedin:  "a professional LinkedIn profile headshot, smart business-casual outfit, soft blurred office background, natural window light, warm approachable smile, crisp and clean",
  portrait:  "an elegant editorial studio portrait, refined lighting with soft shadows, plain warm background, timeless and flattering, magazine quality",
  bw:        "a classic black and white studio portrait, dramatic soft lighting, plain dark background, timeless elegant look, fine detail",
  outdoor:   "a natural outdoor lifestyle portrait, soft golden-hour light, gently blurred green background, relaxed warm expression, candid and premium",
  creative:  "a modern creative portrait with soft colored studio lighting, stylish contemporary look, clean gradient background, vibrant yet tasteful",
};
const SAFE_SUFFIX = ", keep the person's real facial identity and likeness, natural realistic skin, tasteful and professional, no nudity, family-friendly";

function json(data, status) {
  return new Response(JSON.stringify(data), {
    status: status || 200,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store", "Access-Control-Allow-Origin": "*" },
  });
}
function auth(env) { return "Key " + env.HIGGSFIELD_API_KEY + ":" + env.HIGGSFIELD_SECRET; }

function findImageUrl(o) {
  if (!o || typeof o !== "object") return null;
  if (Array.isArray(o.images) && o.images[0] && o.images[0].url) return o.images[0].url;
  if (o.image && o.image.url) return o.image.url;
  if (o.results && o.results.raw && o.results.raw.url) return o.results.raw.url;
  if (Array.isArray(o.jobs) && o.jobs[0]) {
    const j = o.jobs[0];
    if (j.results && j.results.raw && j.results.raw.url) return j.results.raw.url;
    if (j.result && j.result.url) return j.result.url;
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

// ---- POST: send inn headshot-jobben (trekker 1 bilde-kreditt) ----
export async function onRequestPost(context) {
  const { request, env } = context;
  if (!env.HIGGSFIELD_API_KEY || !env.HIGGSFIELD_SECRET) return json({ error: "not_configured" }, 200);

  let body;
  try { body = await request.json(); } catch { return json({ error: "Ugyldig JSON" }, 400); }

  const imageUrl = String(body.imageUrl || "").trim();
  const styleKey = String(body.style || "business").toLowerCase();
  const style = STYLES[styleKey] || STYLES.business;
  if (!/^https?:\/\//.test(imageUrl)) return json({ error: "Last opp et bilde av deg selv først." }, 400);

  const prompt = (style + SAFE_SUFFIX).slice(0, 900);

  // Tilgang + trekk kreditt.
  const gate = await enforceHeadshotApp(context);
  if (!gate.ok) return json({ error: gate.error, needCredits: gate.needCredits || false }, gate.status);

  const payload = {
    prompt: prompt,
    reference_image_urls: [imageUrl],
    width_and_height: "PORTRAIT_1536x2048",
    quality: "HD",
    batch_size: "SINGLE",
  };

  let r, data, text;
  try {
    r = await fetch(HF_BASE + SUBMIT_PATH, {
      method: "POST",
      headers: { "Authorization": auth(env), "Content-Type": "application/json", "Accept": "application/json" },
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
    return json({ error: "Higgsfield svarte " + r.status + ". Kreditten er refundert." }, 200);
  }

  const id = data && (data.request_id || data.id || data.generation_id ||
    (Array.isArray(data.jobs) && data.jobs[0] && data.jobs[0].id));
  const statusUrl = data && (data.status_url || data.statusUrl);
  if (!id && !statusUrl) {
    if (!gate.owner) await refundImageCredit(context, gate.email);
    return json({ error: "Fant ingen jobb i Higgsfield-svaret. Kreditten er refundert." }, 200);
  }
  if (id && !gate.owner) {
    try { await env.BUILDER_KV.put(JOB_PREFIX + id, JSON.stringify({ email: gate.email, refunded: false }), { expirationTtl: 60 * 60 * 2 }); } catch (e) {}
  }
  return json({ id: id || "", statusUrl: statusUrl || "", credit: gate.credit });
}

// ---- GET: tilgangssjekk (ingen params) eller poll (id) ----
export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const id = url.searchParams.get("id") || "";
  let statusUrl = url.searchParams.get("u") || "";

  if (!id && !statusUrl) {
    const acc = await headshotAppAccess(context);
    return json(acc);
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
    r = await fetch(statusUrl, { headers: { "Authorization": auth(env), "Accept": "application/json" } });
    text = await r.text();
    try { data = JSON.parse(text); } catch { data = null; }
  } catch (e) {
    return json({ status: "in_progress" });
  }
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
  return json({ status: status });
}
