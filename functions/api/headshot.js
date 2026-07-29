import { enforceHeadshotApp, refundImageCredit, headshotAppAccess } from "../_lib/access.js";
/**
 * LME AI Headshot, ansiktsbevarende proff-portretter (InstantID via Replicate).
 *
 * Ett-bilde-identitet (som GIO): last opp én selfie, velg stil, og få et
 * profesjonelt portrett som beholder ansiktet ditt, uten trening.
 * Egen app for eier (gratis) eller de som har kjøpt bilde-kreditt. Hver headshot
 * trekker én forhåndskjøpt bilde-kreditt, refundert ved feil.
 *
 * Ruter:
 *   GET  /api/headshot                          -> { loggedIn, owner, credit }
 *   POST /api/headshot   { imageUrl, style }     -> { id, statusUrl, credit }
 *   GET  /api/headshot?id=<id>[&u=<statusUrl>]   -> { status, url? }
 *
 * Secrets i Cloudflare Pages: REPLICATE_API_TOKEN.
 * Modell kan overstyres med REPLICATE_HEADSHOT_MODEL (standard zsxkib/instant-id).
 */

const RE_BASE = "https://api.replicate.com";
const DEFAULT_MODEL = "zsxkib/instant-id";
const JOB_PREFIX = "hsjob:";

// Stil-oppskrifter. Identiteten kommer fra selfien (InstantID); prompten styrer
// klær, bakgrunn og stemning. Alltid på engelsk for best resultat i modellen.
const STYLES = {
  business:  "professional corporate business headshot portrait, wearing a tailored dark blazer, clean neutral studio background, soft flattering studio lighting, confident friendly expression, sharp focus, high-end",
  linkedin:  "professional LinkedIn profile headshot, smart business-casual outfit, soft blurred modern office background, natural window light, warm approachable smile, crisp and clean",
  portrait:  "elegant editorial studio portrait, refined soft lighting with gentle shadows, plain warm background, timeless and flattering, magazine quality",
  bw:        "classic black and white studio portrait, dramatic soft lighting, plain dark background, timeless elegant look, fine detail, monochrome",
  outdoor:   "natural outdoor lifestyle portrait, soft golden-hour light, gently blurred green background, relaxed warm expression, candid and premium",
  creative:  "modern creative portrait with soft colored studio lighting, stylish contemporary look, clean gradient background, vibrant yet tasteful",
};
const NEG = "deformed, distorted, disfigured, extra fingers, mutated hands, bad anatomy, low quality, blurry, grainy, watermark, text, cartoon, plastic skin";

function json(data, status) {
  return new Response(JSON.stringify(data), {
    status: status || 200,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store", "Access-Control-Allow-Origin": "*" },
  });
}
function auth(env) { return "Bearer " + env.REPLICATE_API_TOKEN; }

function findImageUrl(o) {
  if (!o) return null;
  const out = o.output;
  if (typeof out === "string" && /^https?:\/\//.test(out)) return out;
  if (Array.isArray(out) && out.length) {
    const first = out[0];
    if (typeof first === "string" && /^https?:\/\//.test(first)) return first;
    if (first && first.url) return first.url;
  }
  return null;
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
  if (!env.REPLICATE_API_TOKEN) return json({ error: "not_configured" }, 200);

  let body;
  try { body = await request.json(); } catch { return json({ error: "Ugyldig JSON" }, 400); }

  const imageUrl = String(body.imageUrl || "").trim();
  const styleKey = String(body.style || "business").toLowerCase();
  const style = STYLES[styleKey] || STYLES.business;
  if (!/^https?:\/\//.test(imageUrl)) return json({ error: "Last opp et bilde av deg selv først." }, 400);

  const prompt = "a realistic professional headshot photograph of the same person, keeping the exact same face and identity, photorealistic, natural skin texture, looking at the camera, " + style;

  // Tilgang + trekk kreditt.
  const gate = await enforceHeadshotApp(context);
  if (!gate.ok) return json({ error: gate.error, needCredits: gate.needCredits || false }, gate.status);

  const model = String(env.REPLICATE_HEADSHOT_MODEL || DEFAULT_MODEL).replace(/[^a-zA-Z0-9._\/-]/g, "");
  const payload = {
    input: {
      image: imageUrl,
      prompt: prompt,
      negative_prompt: NEG,
      ip_adapter_scale: 0.8,
      controlnet_conditioning_scale: 0.8,
      guidance_scale: 5,
      num_inference_steps: 30,
      num_outputs: 1,
    },
  };

  let r, data, text;
  try {
    r = await fetch(RE_BASE + "/v1/models/" + model + "/predictions", {
      method: "POST",
      headers: { "Authorization": auth(env), "Content-Type": "application/json", "Prefer": "respond-async" },
      body: JSON.stringify(payload),
    });
    text = await r.text();
    try { data = JSON.parse(text); } catch { data = null; }
  } catch (e) {
    if (!gate.owner) await refundImageCredit(context, gate.email);
    return json({ error: "Kom ikke i kontakt med bilde-motoren. Kreditten er refundert." }, 502);
  }
  if (!r.ok) {
    if (!gate.owner) await refundImageCredit(context, gate.email);
    const detail = (data && (data.detail || data.title)) ? " (" + (data.detail || data.title) + ")" : " (" + r.status + ")";
    return json({ error: "Bilde-motoren svarte med feil" + detail + ". Kreditten er refundert." }, 200);
  }

  const id = data && data.id;
  const statusUrl = data && data.urls && data.urls.get;
  if (!id && !statusUrl) {
    if (!gate.owner) await refundImageCredit(context, gate.email);
    return json({ error: "Fant ingen jobb i svaret. Kreditten er refundert." }, 200);
  }
  // Bildet kan allerede være ferdig (sjelden, men mulig).
  const immediate = findImageUrl(data);
  if (immediate) return json({ id: id || "", statusUrl: statusUrl || "", credit: gate.credit, url: immediate, status: "completed" });

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
  if (!env.REPLICATE_API_TOKEN) return json({ error: "not_configured" }, 200);

  if (statusUrl) {
    try { if (new URL(statusUrl).hostname !== "api.replicate.com") statusUrl = ""; } catch { statusUrl = ""; }
  }
  if (!statusUrl) {
    if (!/^[A-Za-z0-9_-]{6,}$/.test(id)) return json({ error: "Ugyldig jobb-ID." }, 400);
    statusUrl = RE_BASE + "/v1/predictions/" + id;
  }

  let r, data, text;
  try {
    r = await fetch(statusUrl, { headers: { "Authorization": auth(env), "Accept": "application/json" } });
    text = await r.text();
    try { data = JSON.parse(text); } catch { data = null; }
  } catch (e) {
    return json({ status: "in_progress" });
  }
  if (!r.ok) return json({ error: "Status " + r.status + "." }, 200);

  const status = data && data.status ? String(data.status).toLowerCase() : "in_progress";
  const imgUrl = findImageUrl(data);
  if (status === "succeeded" && imgUrl) return json({ status: "completed", url: imgUrl });
  if (status === "failed" || status === "canceled") {
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
    return json({ status: "failed", error: "Bildet kunne ikke lages (" + (data && data.error ? data.error : status) + "). Kreditten er refundert." });
  }
  return json({ status: "in_progress" });
}
