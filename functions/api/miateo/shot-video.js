/**
 * Mia & Teo Video Creator, shot animation (image-to-video).
 *
 * Animates ONE approved keyframe into a short video clip via Higgsfield
 * (dop-turbo, image-to-video, same engine as functions/api/video-studio.js).
 * Requires the shot's keyframe to already be approved (spec §10, "only after
 * approval should expensive video generation begin"). Async job + poll, same
 * pattern as video-studio.js: submit returns a job id/status url, the client
 * polls GET until it resolves.
 *
 * POST /api/miateo/shot-video   { projectId, shotId, confirm }
 *   confirm !== true -> dry run: { paid:true, provider, estimatedCost, motionPrompt }
 *   confirm === true -> submits the Higgsfield job (costs money)
 *                     -> { ok:true, shot }   (shot.video.status = "generating")
 *
 * GET  /api/miateo/shot-video?projectId=X&shotId=Y
 *   -> polls the job if still generating, updates + saves the shot, returns it.
 *      -> { status, shot }
 *
 * Owner-only.
 */
import { requireOwner } from "../../_lib/miateo-access.js";
import { readProject, saveProject, shotById } from "../../_lib/miateo-store.js";
import { continuityNoteForShot } from "../../_lib/miateo-continuity.js";
import { buildMotionPrompt } from "../../_lib/miateo-bible.js";
import { videoGenerateSubmit, videoGeneratePoll, estimateVideoCost, videoProviderConfigured } from "../../_lib/miateo-providers.js";

function json(data, status) {
  return new Response(JSON.stringify(data), {
    status: status || 200,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
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
  if (!shot.keyframe || !shot.keyframe.approved || !shot.keyframe.assetUrl) {
    return json({ error: "Godkjenn nøkkelbildet for dette shotet før du lager video." }, 400);
  }

  const continuityNote = continuityNoteForShot(project, shot.id);
  const motionPrompt = buildMotionPrompt(shot, continuityNote);

  if (!body.confirm) {
    return json({
      paid: true, provider: "higgsfield", estimatedCost: estimateVideoCost(),
      motionPrompt, note: "Dry run, no API call made. Resend with confirm:true to actually generate (costs money / 1 video credit).",
    }, 200);
  }

  if (!videoProviderConfigured(env)) return json({ error: "not_configured", detail: "HIGGSFIELD_API_KEY/HIGGSFIELD_SECRET mangler." }, 200);

  let job;
  try {
    job = await videoGenerateSubmit(env, shot.keyframe.assetUrl, motionPrompt);
  } catch (e) {
    return json({ error: "Klarte ikke å starte videogenereringen.", detail: String((e && e.message) || e).slice(0, 200) }, 200);
  }

  shot.video = { assetUrl: null, prompt: motionPrompt, provider: "higgsfield", model: "dop-turbo", jobId: job.id, statusUrl: job.statusUrl, status: "generating" };
  project.status = "generating";
  await saveProject(env, project);
  return json({ ok: true, shot }, 200);
}

export async function onRequestGet(context) {
  const { request, env } = context;
  const gate = await requireOwner(context);
  if (!gate.ok) return json({ error: gate.error }, gate.status);
  if (!env.BUILDER_KV) return json({ error: "not_configured" }, 200);

  const url = new URL(request.url);
  const projectId = url.searchParams.get("projectId");
  const shotId = url.searchParams.get("shotId");
  const project = await readProject(env, projectId);
  if (!project) return json({ error: "not_found" }, 404);
  const shot = shotById(project, shotId);
  if (!shot) return json({ error: "shot_not_found" }, 404);

  if (!shot.video || shot.video.status !== "generating" || !shot.video.statusUrl) {
    return json({ status: (shot.video && shot.video.status) || "none", shot }, 200);
  }

  let poll;
  try {
    poll = await videoGeneratePoll(env, shot.video.statusUrl);
  } catch (e) {
    return json({ status: "generating", shot }, 200);
  }
  if (poll.status === "completed" && poll.url) {
    shot.video.assetUrl = poll.url;
    shot.video.status = "ready";
    await saveProject(env, project);
    return json({ status: "ready", shot }, 200);
  }
  if (poll.status === "failed" || poll.status === "nsfw") {
    shot.video.status = "failed";
    await saveProject(env, project);
    return json({ status: "failed", shot, error: "Videoen kunne ikke lages (" + poll.status + ")." }, 200);
  }
  return json({ status: "generating", shot }, 200);
}

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "GET, POST, OPTIONS", "Access-Control-Allow-Headers": "Content-Type" } });
}
