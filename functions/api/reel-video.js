import { enforceGeneration } from "../_lib/access.js";
/**
 * LME — server-side AI-video via Higgsfield (image-to-video).
 *
 * Kjører på selve siden, så det virker på alle enheter (også iPhone, som
 * ikke kan lage video i nettleseren). Bruker Higgsfield sitt API med nøklene
 * som ligger som krypterte Secrets i Cloudflare Pages:
 *   HIGGSFIELD_API_KEY, HIGGSFIELD_SECRET   (auth: "Key KEY:SECRET")
 *
 * To steg (video-generering er asynkron):
 *   POST /api/reel-video   { prompt, imageUrl }
 *       -> { id, statusUrl }        (sender inn jobben)
 *   GET  /api/reel-video?id=<id>[&u=<statusUrl>]
 *       -> { status, url? }         (poll til status = completed, url = ferdig MP4)
 */

const HF_BASE = "https://platform.higgsfield.ai";
const SUBMIT_PATH = "/v1/image2video/dop";

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

// Finn en video-URL i et Higgsfield-svar (formen varierer litt).
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

// ---- POST: send inn video-jobben ----
export async function onRequestPost(context) {
  const gate = await enforceGeneration(context, "video");
  if (!gate.ok) return json({ error: gate.error }, gate.status);

  const { request, env } = context;
  if (!env.HIGGSFIELD_API_KEY || !env.HIGGSFIELD_SECRET) {
    return json({ error: "not_configured" }, 200);
  }
  let body;
  try { body = await request.json(); }
  catch { return json({ error: "Ugyldig JSON" }, 400); }

  const imageUrl = String(body.imageUrl || "").trim();
  const prompt = String(body.prompt || "").slice(0, 500) || "Gentle cinematic camera movement, soft and calm.";
  if (!/^https?:\/\//.test(imageUrl)) return json({ error: "Mangler gyldig bilde-URL." }, 400);

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
    return json({ error: "Kom ikke i kontakt med Higgsfield." }, 502);
  }
  if (!r.ok) return json({ error: "Higgsfield svarte " + r.status + ".", detail: (text || "").slice(0, 400) }, 200);

  const id = data && (data.request_id || data.id || data.generation_id ||
    (Array.isArray(data.jobs) && data.jobs[0] && data.jobs[0].id));
  const statusUrl = data && (data.status_url || data.statusUrl);
  if (!id && !statusUrl) return json({ error: "Fant ingen jobb-ID i Higgsfield-svaret.", detail: (text || "").slice(0, 400) }, 200);
  return json({ id: id || "", statusUrl: statusUrl || "" });
}

// ---- GET: poll status ----
export async function onRequestGet(context) {
  const { request, env } = context;
  if (!env.HIGGSFIELD_API_KEY || !env.HIGGSFIELD_SECRET) return json({ error: "not_configured" }, 200);

  const url = new URL(request.url);
  const id = url.searchParams.get("id") || "";
  let statusUrl = url.searchParams.get("u") || "";

  // Bare tillat polling mot Higgsfield selv (unngå misbruk).
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
    return json({ status: "in_progress" }); // forbigående, la klienten prøve igjen
  }
  if (!r.ok) return json({ error: "Higgsfield status " + r.status + ".", detail: (text || "").slice(0, 300) }, 200);

  const status = findStatus(data) || "in_progress";
  const videoUrl = findVideoUrl(data);
  if (videoUrl) return json({ status: "completed", url: videoUrl });
  if (status === "failed" || status === "nsfw") return json({ status: status, error: "Videoen kunne ikke lages (" + status + ")." });
  return json({ status: status });
}
