/**
 * Mia & Teo Video Creator, storyboard keyframe generation.
 *
 * One approved image PER SHOT, generated before any video credit is spent
 * (spec §8-10, §27 cost control: cheap-ish preview before the expensive
 * step). The Character Bible (functions/_lib/miateo-bible.js) is injected
 * into every prompt so Mia and Teo stay recognizable, and the continuity
 * engine (functions/_lib/miateo-continuity.js) adds what the previous shot
 * left behind (what a character is holding, the location, time of day...).
 *
 * Regenerating one shot's keyframe never touches any other shot (spec §9,
 * "changing ONE shot must NOT regenerate the whole episode").
 *
 * Generated images are stored with the exact same KV blob pattern as
 * functions/api/image.js ("img:<id>"), so they are served by the existing
 * GET /api/image?id=<id> route, no new serving code needed.
 *
 * POST /api/miateo/keyframe   { projectId, shotId, size?, confirm }
 *   confirm !== true -> dry run: { paid:true, provider, estimatedCost, prompt }
 *   confirm === true -> real image-generation call (costs money)
 *                     -> { ok:true, shot }
 *
 * POST /api/miateo/keyframe   { projectId, shotId, approve:true }
 *   -> marks the already-generated keyframe approved, no cost, no call.
 *      -> { ok:true, shot }
 *
 * Owner-only.
 */
import { requireOwner } from "../../_lib/miateo-access.js";
import { readProject, shotById, updateShot } from "../../_lib/miateo-store.js";
import { continuityNoteForShot } from "../../_lib/miateo-continuity.js";
import { buildKeyframePrompt } from "../../_lib/miateo-bible.js";
import { imageGenerateKeyframe, estimateImageCost, imageProviderConfigured } from "../../_lib/miateo-providers.js";

function json(data, status) {
  return new Response(JSON.stringify(data), {
    status: status || 200,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

async function storeImage(env, origin, bytes, contentType) {
  const id = crypto.randomUUID().replace(/-/g, "");
  await env.BUILDER_KV.put("img:" + id, bytes, { metadata: { ct: contentType || "image/png" }, expirationTtl: 60 * 60 * 24 * 30 });
  return origin + "/api/image?id=" + id;
}

export async function onRequestPost(context) {
  const { request, env } = context;
  const gate = await requireOwner(context);
  if (!gate.ok) return json({ error: gate.error }, gate.status);
  if (!env.BUILDER_KV) return json({ error: "not_configured" }, 200);

  let body;
  try { body = await request.json(); } catch (e) { return json({ error: "bad_json" }, 400); }

  const project = await readProject(env, body.projectId);
  if (!project) return json({ error: "not_found" }, 404);
  const shot = shotById(project, body.shotId);
  if (!shot) return json({ error: "shot_not_found" }, 404);

  if (body.approve === true) {
    if (!shot.keyframe || !shot.keyframe.assetUrl) return json({ error: "Ingen nøkkelbilde å godkjenne ennå." }, 400);
    const result = await updateShot(env, body.projectId, body.shotId, (s, p) => {
      s.keyframe.approved = true;
      if (p.status === "idea" || p.status === "story") p.status = "storyboard";
    });
    if (!result) return json({ error: "not_found" }, 404);
    return json({ ok: true, shot: result.shot }, 200);
  }

  const size = body.size === "9:16" ? "1024x1536" : "1536x1024";
  const continuityNote = continuityNoteForShot(project, shot.id);
  const prompt = buildKeyframePrompt(shot, continuityNote);

  if (!body.confirm) {
    return json({
      paid: true, provider: "openai/gemini", estimatedCost: estimateImageCost(),
      prompt, note: "Dry run, no API call made. Resend with confirm:true to actually generate (costs money).",
    }, 200);
  }

  if (!imageProviderConfigured(env)) return json({ error: "not_configured", detail: "Verken OPENAI_API_KEY eller GEMINI_API_KEY er satt." }, 200);

  let out;
  try {
    out = await imageGenerateKeyframe(env, prompt, size);
  } catch (e) {
    // Re-read fresh before writing (see updateShot doc comment in
    // miateo-store.js): the slow image call above is exactly the window
    // another shot's generation could have saved in.
    await updateShot(env, body.projectId, body.shotId, (s) => { s.keyframe.status = "failed"; });
    return json({ error: "Klarte ikke å lage nøkkelbildet.", detail: String((e && e.message) || e).slice(0, 200) }, 200);
  }

  const origin = new URL(request.url).origin;
  const assetUrl = await storeImage(env, origin, out.bytes, out.contentType);
  const result = await updateShot(env, body.projectId, body.shotId, (s, p) => {
    s.keyframe = { assetUrl, prompt, provider: "openai/gemini", model: null, status: "ready", approved: false };
    if (p.status === "idea" || p.status === "story") p.status = "storyboard";
  });
  if (!result) return json({ error: "not_found" }, 404);
  return json({ ok: true, shot: result.shot }, 200);
}

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "POST, OPTIONS", "Access-Control-Allow-Headers": "Content-Type" } });
}
