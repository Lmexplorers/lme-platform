/**
 * LME VideoFlow, premium image-to-video animation (optional upgrade tier).
 *
 * Animates one scene's already-generated image into a short video clip via
 * Higgsfield, instead of the default Ken Burns still. Significantly pricier
 * than a still image (CREDIT_COSTS.video vs CREDIT_COSTS.image, see
 * functions/_lib/videoflow-providers.js), matching FacelessGenie's own
 * split between an affordable still-based baseline and a premium moving-
 * footage tier. Purely optional and additive: a scene with no ready video
 * just keeps using its Ken Burns still in the final render (see render.js
 * and whiteboard-engine/video/CaptionedSlideshow.tsx, which now accept
 * either an imageUrl or a videoUrl per scene).
 *
 * POST /api/videoflow/scene-video   { projectId, sceneId, confirm }
 *   confirm !== true -> dry run: { paid:true, creditCost, motionPrompt }
 *   confirm === true -> submits the Higgsfield job (costs credits)
 *                     -> { ok:true, scene, balance }   (scene.video.status = "generating")
 *
 * GET /api/videoflow/scene-video?projectId=X&sceneId=Y   -> polls, updates + returns the scene.
 */
import { sessionUser } from "../../_lib/access.js";
import { enforceVideoFlow, refundVideoFlow } from "../../_lib/videoflow-access.js";
import { videoGenerateSubmit, videoGeneratePoll, videoProviderConfigured, CREDIT_COSTS } from "../../_lib/videoflow-providers.js";
import { SAFE_SUFFIX } from "../../_lib/videoflow-styles.js";
import { readProject, sceneById, updateScene } from "../../_lib/videoflow-store.js";

function json(data, status) {
  return new Response(JSON.stringify(data), {
    status: status || 200,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

function buildMotionPrompt(scene) {
  const base = (scene.visualDescription || scene.caption || scene.narration || "the scene").trim();
  return ("Animate this scene with gentle, natural motion and a slow cinematic camera movement: " + base + ".").slice(0, 800) + SAFE_SUFFIX;
}

export async function onRequestPost(context) {
  const { request, env } = context;
  const user = await sessionUser(context);
  if (!user) return json({ error: "Logg inn for å bruke VideoFlow." }, 401);
  if (!env.BUILDER_KV) return json({ error: "not_configured" }, 200);

  let body;
  try { body = await request.json(); } catch (e) { return json({ error: "bad_json" }, 400); }

  const project = await readProject(env, body.projectId);
  if (!project || project.ownerEmail !== user.email) return json({ error: "not_found" }, 404);
  const scene = sceneById(project, body.sceneId);
  if (!scene) return json({ error: "scene_not_found" }, 404);
  if (!scene.image || scene.image.status !== "ready" || !scene.image.assetUrl) {
    return json({ error: "Lag et bilde for scenen først." }, 400);
  }

  const motionPrompt = buildMotionPrompt(scene);

  if (!body.confirm) {
    return json({
      paid: true, creditCost: CREDIT_COSTS.video, motionPrompt,
      note: "Dry run, no API call made. Resend with confirm:true to actually animate this scene (costs " + CREDIT_COSTS.video + " credits, premium tier).",
    }, 200);
  }

  if (!videoProviderConfigured(env)) return json({ error: "not_configured", detail: "HIGGSFIELD_API_KEY/HIGGSFIELD_SECRET mangler." }, 200);

  const gate = await enforceVideoFlow(context, CREDIT_COSTS.video);
  if (!gate.ok) return json({ error: gate.error, needCredits: gate.needCredits || false, balance: gate.balance }, gate.status);

  let job;
  try {
    job = await videoGenerateSubmit(env, scene.image.assetUrl, motionPrompt);
  } catch (e) {
    if (!gate.owner) await refundVideoFlow(context, gate.email, CREDIT_COSTS.video);
    return json({ error: "Klarte ikke å starte videogenereringen.", detail: String((e && e.message) || e).slice(0, 200) }, 200);
  }

  const result = await updateScene(env, body.projectId, body.sceneId, (s) => {
    s.video = { assetUrl: null, prompt: motionPrompt, jobId: job.id, statusUrl: job.statusUrl, status: "generating" };
  });
  if (!result) return json({ error: "not_found" }, 404);
  return json({ ok: true, scene: result.scene, balance: gate.owner ? null : gate.balance }, 200);
}

export async function onRequestGet(context) {
  const { request, env } = context;
  const user = await sessionUser(context);
  if (!user) return json({ error: "Logg inn for å bruke VideoFlow." }, 401);

  const url = new URL(request.url);
  const projectId = url.searchParams.get("projectId");
  const sceneId = url.searchParams.get("sceneId");
  const project = await readProject(env, projectId);
  if (!project || project.ownerEmail !== user.email) return json({ error: "not_found" }, 404);
  const scene = sceneById(project, sceneId);
  if (!scene) return json({ error: "scene_not_found" }, 404);

  if (!scene.video || scene.video.status !== "generating" || !scene.video.statusUrl) {
    return json({ status: (scene.video && scene.video.status) || "none", scene }, 200);
  }

  let poll;
  try {
    poll = await videoGeneratePoll(env, scene.video.statusUrl);
  } catch (e) {
    return json({ status: "generating", scene }, 200);
  }
  if (poll.status === "completed" && poll.url) {
    const result = await updateScene(env, projectId, sceneId, (s) => { s.video.assetUrl = poll.url; s.video.status = "ready"; });
    if (!result) return json({ error: "not_found" }, 404);
    return json({ status: "ready", scene: result.scene }, 200);
  }
  if (poll.status === "failed" || poll.status === "nsfw") {
    const result = await updateScene(env, projectId, sceneId, (s) => { s.video.status = "failed"; });
    if (!result) return json({ error: "not_found" }, 404);
    return json({ status: "failed", scene: result.scene, error: "Videoen kunne ikke lages (" + poll.status + ")." }, 200);
  }
  return json({ status: "generating", scene }, 200);
}

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "GET, POST, OPTIONS", "Access-Control-Allow-Headers": "Content-Type" } });
}
