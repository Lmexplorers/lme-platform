/**
 * LME VideoFlow, "generate everything at once".
 *
 * Before this endpoint, making a video meant clicking "Lag bilde" then
 * "Lag stemme" separately for every single scene, waiting for each to
 * finish before starting the next, one confirm-dialog per click. Renate,
 * 15. august 2026: "Den er laget alt for tidkrevende, med å måtte generere
 * lyd til hvert bilde, tar alt for lang tid. Dette er steg som går
 * automatisk i andre apper." This endpoint generates every scene's still
 * missing image AND voice line in ONE confirm step, all in parallel
 * (network-bound external API calls, not CPU-bound, so N scenes in
 * parallel costs roughly the same wall-clock as one).
 *
 * Only touches scenes that don't already have a ready image/voice, so
 * re-running after a partial success (or after editing just one scene's
 * text) never re-spends credits on work that's already done. Scene image
 * and voice generation are independent of each other (voice reads
 * scene.narration, not the image), so both fire in the same batch.
 *
 * POST /api/videoflow/generate-all   { projectId, confirm }
 *   confirm !== true -> dry run: { paid:true, creditCost, imageCount, voiceCount }
 *   confirm === true -> generates everything missing, debits the total
 *                       upfront (one enforceVideoFlow call, not one per
 *                       item, same reasoning as restyle.js), refunds
 *                       proportionally for anything that fails
 *                     -> { ok:true, project, succeeded, failed, balance }
 *
 * Concurrency note: same pattern as restyle.js. Running the slow API calls
 * in parallel is safe (they don't touch KV), but writing results back must
 * NOT be N parallel per-scene updateScene calls (that would recreate the
 * lost-update race at the batch level). Instead: collect all results,
 * re-read the project ONCE fresh, apply every result to that single copy,
 * save once.
 */
import { sessionUser } from "../../_lib/access.js";
import { enforceVideoFlow, refundVideoFlow } from "../../_lib/videoflow-access.js";
import {
  imageGenerateScene, imageProviderConfigured,
  voiceGenerateLine, voiceProviderConfigured, estimateVoiceCredits, DEFAULT_VOICE_ID,
  CREDIT_COSTS,
} from "../../_lib/videoflow-providers.js";
import { styleById, AVOID_LIST, SAFE_SUFFIX } from "../../_lib/videoflow-styles.js";
import { readProject, sceneById, saveProject } from "../../_lib/videoflow-store.js";

const AUDIO_PREFIX = "vf:audio:";

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

function buildImagePrompt(project, scene) {
  const style = styleById(project.input.style);
  return [style.prompt, scene.visualDescription, AVOID_LIST].join(" ") + SAFE_SUFFIX;
}

function needsImage(scene) { return !scene.image || scene.image.status !== "ready"; }
function needsVoice(scene) { return (!scene.voice || scene.voice.status !== "ready") && (scene.narration || scene.caption); }

export async function onRequestPost(context) {
  const { request, env } = context;
  const user = await sessionUser(context);
  if (!user) return json({ error: "Logg inn for å bruke VideoFlow." }, 401);
  if (!env.BUILDER_KV) return json({ error: "not_configured" }, 200);

  let body;
  try { body = await request.json(); } catch (e) { return json({ error: "bad_json" }, 400); }

  const project = await readProject(env, body.projectId);
  if (!project || project.ownerEmail !== user.email) return json({ error: "not_found" }, 404);
  if (!project.scenes || !project.scenes.length) return json({ error: "Ingen scener å generere ennå." }, 400);

  const imageScenes = project.scenes.filter(needsImage);
  const voiceScenes = project.scenes.filter(needsVoice);
  const voiceCostByScene = new Map(voiceScenes.map((s) => [s.id, estimateVoiceCredits(s.narration || s.caption)]));
  const totalCost = imageScenes.length * CREDIT_COSTS.image + voiceScenes.reduce((sum, s) => sum + voiceCostByScene.get(s.id), 0);

  if (!imageScenes.length && !voiceScenes.length) {
    return json({ error: "Alle scener har alt bilde og stemme." }, 200);
  }

  if (!body.confirm) {
    return json({
      paid: true, creditCost: totalCost, imageCount: imageScenes.length, voiceCount: voiceScenes.length,
      note: "Dry run, no API call made. Resend with confirm:true to generate " + imageScenes.length + " image(s) and " + voiceScenes.length + " voice line(s) (costs " + totalCost + " credits total).",
    }, 200);
  }

  if (imageScenes.length && !imageProviderConfigured(env)) return json({ error: "not_configured", detail: "Verken OPENAI_API_KEY eller GEMINI_API_KEY er satt." }, 200);
  if (voiceScenes.length && !voiceProviderConfigured(env)) return json({ error: "not_configured", detail: "ELEVENLABS_API_KEY mangler." }, 200);

  const gate = await enforceVideoFlow(context, totalCost);
  if (!gate.ok) return json({ error: gate.error, needCredits: gate.needCredits || false, balance: gate.balance }, gate.status);

  const origin = new URL(request.url).origin;

  const imageResults = Promise.allSettled(imageScenes.map(async (scene) => {
    const prompt = buildImagePrompt(project, scene);
    const out = await imageGenerateScene(env, prompt, "1536x1024", { email: user.email });
    const assetUrl = await storeImage(env, origin, out.bytes, out.contentType);
    return { sceneId: scene.id, assetUrl, prompt };
  }));
  const voiceResults = Promise.allSettled(voiceScenes.map(async (scene) => {
    const text = scene.narration || scene.caption;
    const out = await voiceGenerateLine(env, text, project.input.voiceId || DEFAULT_VOICE_ID, project.input.lang, { email: user.email });
    const audioId = crypto.randomUUID().replace(/-/g, "");
    await env.BUILDER_KV.put(AUDIO_PREFIX + audioId, out.bytes, { metadata: { ct: out.contentType }, expirationTtl: 60 * 60 * 24 * 30 });
    const audioUrl = origin + "/api/videoflow/scene-voice?audioId=" + audioId;
    return { sceneId: scene.id, audioUrl, words: out.words, durationSec: out.durationSec };
  }));
  const [imgOut, voiceOut] = await Promise.all([imageResults, voiceResults]);

  // Apply every result to ONE freshly-read project copy, single save at the
  // end, see the concurrency note above for why this can't be N parallel
  // per-scene saves (restyle.js has the same pattern for images only).
  const fresh = await readProject(env, body.projectId);
  if (!fresh) return json({ error: "not_found" }, 404);
  let succeeded = 0, failed = 0, refund = 0;

  imageScenes.forEach((snap, i) => {
    const scene = sceneById(fresh, snap.id);
    if (!scene) return;
    const r = imgOut[i];
    if (r.status === "fulfilled") {
      scene.image = { assetUrl: r.value.assetUrl, prompt: r.value.prompt, status: "ready" };
      succeeded++;
    } else {
      scene.image.status = "failed";
      failed++;
      refund += CREDIT_COSTS.image;
    }
  });
  voiceScenes.forEach((snap, i) => {
    const scene = sceneById(fresh, snap.id);
    if (!scene) return;
    const r = voiceOut[i];
    if (r.status === "fulfilled") {
      scene.voice = { assetUrl: r.value.audioUrl, words: r.value.words, durationSec: r.value.durationSec, status: "ready" };
      succeeded++;
    } else {
      scene.voice.status = "failed";
      failed++;
      refund += voiceCostByScene.get(snap.id);
    }
  });
  if (fresh.status === "idea" || fresh.status === "script") fresh.status = "generating";
  await saveProject(env, fresh);

  if (refund > 0 && !gate.owner) await refundVideoFlow(context, gate.email, refund);

  return json({ ok: true, project: fresh, succeeded, failed, balance: gate.owner ? null : (gate.balance + refund) }, 200);
}

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "POST, OPTIONS", "Access-Control-Allow-Headers": "Content-Type" } });
}
