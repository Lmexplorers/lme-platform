import { enforceVideoApp, refundVideoCredit, videoAppAccess } from "../_lib/access.js";
/**
 * LME Video Studio, AI-video med din egen karakter (Higgsfield image-to-video).
 *
 * Egen app for eier, Pro/VIP eller de som har kjøpt appen. INGEN gratis
 * generering: hver video trekker én forhåndskjøpt video-kreditt, og kreditten
 * refunderes automatisk hvis genereringen feiler.
 *
 * Ruter:
 *   GET  /api/video-studio
 *        -> { loggedIn, entitled, owner, tier, credit }      (tilgangssjekk for siden)
 *   POST /api/video-studio   { prompt, imageUrl }
 *        -> { id, statusUrl, credit }                        (sender inn jobben, trekker 1 kreditt)
 *   GET  /api/video-studio?id=<id>[&u=<statusUrl>]
 *        -> { status, url? }                                 (poll; refunderer ved feil)
 *
 * Nøkler som Secrets i Cloudflare Pages: HIGGSFIELD_API_KEY, HIGGSFIELD_SECRET.
 */

const HF_BASE = "https://platform.higgsfield.ai";
const SUBMIT_PATH = "/v1/image2video/dop";
const JOB_PREFIX = "vsjob:";

// Trygghet: barnevennlig plattform. Blokker åpenbart voksent/skummelt innhold,
// og legg på en mild familievennlig føring på alle klipp.
const BANNED = [
  "nude", "naked", "nsfw", "sex", "sexual", "porn", "erotic", "fetish",
  "gore", "blood", "kill", "murder", "weapon", "gun", "knife", "violence",
  "naken", "vold", "blod", "drep", "våpen", "porno", "sex",
];
const SAFE_SUFFIX = ", wholesome family-friendly children's animation, gentle and safe, no violence, no nudity, no real people";

function json(data, status) {
  return new Response(JSON.stringify(data), {
    status: status || 200,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
      "Access-Control-Allow-Origin": "*",
    },
  });
}

function auth(env) { return "Key " + env.HIGGSFIELD_API_KEY + ":" + env.HIGGSFIELD_SECRET; }

function findVideoUrl(o) {
  if (!o || typeof o !== "object") return null;
  if (o.video && o.video.url) return o.video.url;
  if (o.results && o.results.raw && o.results.raw.url) return o.results.raw.url;
  if (Array.isArray(o.jobs) && o.jobs[0]) {
    const j = o.jobs[0];
    if (j.results && j.results.raw && j.results.raw.url) return j.results.raw.url;
    if (j.result && j.result.url) return j.result.url;
    if (j.video && j.video.url) return j.video.url;
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

function hasBanned(text) {
  const t = (" " + String(text || "").toLowerCase() + " ");
  return BANNED.some((w) => t.indexOf(w) !== -1);
}

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

// ---- POST: send inn video-jobben (trekker 1 kreditt) ----
export async function onRequestPost(context) {
  const { request, env } = context;
  if (!env.HIGGSFIELD_API_KEY || !env.HIGGSFIELD_SECRET) return json({ error: "not_configured" }, 200);

  let body;
  try { body = await request.json(); }
  catch { return json({ error: "Ugyldig JSON" }, 400); }

  const imageUrl = String(body.imageUrl || "").trim();
  let prompt = String(body.prompt || "").slice(0, 500).trim();
  if (!/^https?:\/\//.test(imageUrl)) return json({ error: "Last opp et karakterbilde først." }, 400);
  if (hasBanned(prompt)) {
    return json({ error: "Teksten inneholder noe som ikke passer i en barnevennlig app. Prøv en snillere beskrivelse." }, 400);
  }
  prompt = (prompt || "Gentle cinematic camera movement, soft and calm.") + SAFE_SUFFIX;

  // Tilgang + trekk kreditt (etter at innholdet er godkjent).
  const gate = await enforceVideoApp(context);
  if (!gate.ok) return json({ error: gate.error, needCredits: gate.needCredits || false }, gate.status);

  const payload = {
    input: {
      model: "dop-turbo",
      prompt: prompt,
      input_images: [{ type: "image_url", image_url: imageUrl }],
    },
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
    if (!gate.owner) await refundVideoCredit(context, gate.email);
    return json({ error: "Kom ikke i kontakt med Higgsfield. Kreditten er refundert." }, 502);
  }
  if (!r.ok) {
    if (!gate.owner) await refundVideoCredit(context, gate.email);
    return json({ error: "Higgsfield svarte " + r.status + ". Kreditten er refundert." }, 200);
  }

  const id = data && (data.request_id || data.id || data.generation_id ||
    (Array.isArray(data.jobs) && data.jobs[0] && data.jobs[0].id));
  const statusUrl = data && (data.status_url || data.statusUrl);
  if (!id && !statusUrl) {
    if (!gate.owner) await refundVideoCredit(context, gate.email);
    return json({ error: "Fant ingen jobb i Higgsfield-svaret. Kreditten er refundert." }, 200);
  }

  // Lagre jobb-info så vi kan refundere idempotent hvis den feiler under polling.
  if (id && !gate.owner) {
    try {
      await env.BUILDER_KV.put(JOB_PREFIX + id, JSON.stringify({ email: gate.email, refunded: false }),
        { expirationTtl: 60 * 60 * 2 });
    } catch (e) {}
  }
  return json({ id: id || "", statusUrl: statusUrl || "", credit: gate.credit });
}

// ---- GET: tilgangssjekk (ingen params) eller poll (id) ----
export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const id = url.searchParams.get("id") || "";
  let statusUrl = url.searchParams.get("u") || "";

  // Ingen id/u -> returner tilgangsinfo for siden.
  if (!id && !statusUrl) {
    const acc = await videoAppAccess(context);
    return json(acc);
  }

  if (!env.HIGGSFIELD_API_KEY || !env.HIGGSFIELD_SECRET) return json({ error: "not_configured" }, 200);

  if (statusUrl) {
    try { if (new URL(statusUrl).hostname !== "platform.higgsfield.ai") statusUrl = ""; } catch { statusUrl = ""; }
  }
  if (!statusUrl) {
    if (!/^[A-Za-z0-9_-]{6,}$/.test(id)) return json({ error: "Ugyldig jobb-ID." }, 400);
    statusUrl = HF_BASE + "/v1/image2video/dop/requests/" + id;
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
  const videoUrl = findVideoUrl(data);
  if (videoUrl) return json({ status: "completed", url: videoUrl });
  if (status === "failed" || status === "nsfw") {
    // Refunder kreditten én gang (idempotent via jobb-record).
    if (id) {
      try {
        const raw = await env.BUILDER_KV.get(JOB_PREFIX + id);
        if (raw) {
          const rec = JSON.parse(raw);
          if (rec && rec.email && !rec.refunded) {
            await refundVideoCredit(context, rec.email);
            rec.refunded = true;
            await env.BUILDER_KV.put(JOB_PREFIX + id, JSON.stringify(rec), { expirationTtl: 60 * 60 * 2 });
          }
        }
      } catch (e) {}
    }
    return json({ status: status, error: "Videoen kunne ikke lages (" + status + "). Kreditten er refundert." });
  }
  return json({ status: status });
}
