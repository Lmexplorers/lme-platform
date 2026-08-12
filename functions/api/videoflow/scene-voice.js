/**
 * LME VideoFlow, scene voice generation.
 *
 * One ElevenLabs "with-timestamps" call per scene's narration, producing
 * both the audio and word-level timing (needed for the karaoke-style
 * captions the render step burns in). Regenerating one scene's voice never
 * touches any other scene.
 *
 * POST /api/videoflow/scene-voice   { projectId, sceneId, confirm }
 *   confirm !== true -> dry run: { paid:true, creditCost, text }
 *   confirm === true -> real ElevenLabs call, debits credits (per character)
 *                     -> { ok:true, scene, balance }
 *
 * GET /api/videoflow/scene-voice?audioId=<id>   -> audio/mpeg (public)
 */
import { sessionUser } from "../../_lib/access.js";
import { enforceVideoFlow, refundVideoFlow } from "../../_lib/videoflow-access.js";
import { voiceGenerateLine, voiceProviderConfigured, estimateVoiceCredits, DEFAULT_VOICE_ID } from "../../_lib/videoflow-providers.js";
import { readProject, saveProject, sceneById } from "../../_lib/videoflow-store.js";

const AUDIO_PREFIX = "vf:audio:";

function json(data, status) {
  return new Response(JSON.stringify(data), {
    status: status || 200,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
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
  const text = scene.narration || scene.caption;
  if (!text) return json({ error: "Scenen mangler tekst å lese inn." }, 400);

  const creditCost = estimateVoiceCredits(text);
  if (!body.confirm) {
    return json({
      paid: true, creditCost, text,
      note: "Dry run, no API call made. Resend with confirm:true to actually generate (costs " + creditCost + " credits).",
    }, 200);
  }

  if (!voiceProviderConfigured(env)) return json({ error: "not_configured", detail: "ELEVENLABS_API_KEY mangler." }, 200);

  const gate = await enforceVideoFlow(context, creditCost);
  if (!gate.ok) return json({ error: gate.error, needCredits: gate.needCredits || false, balance: gate.balance }, gate.status);

  let out;
  try {
    out = await voiceGenerateLine(env, text, project.input.voiceId || DEFAULT_VOICE_ID, project.input.lang);
  } catch (e) {
    if (!gate.owner) await refundVideoFlow(context, gate.email, creditCost);
    scene.voice.status = "failed";
    await saveProject(env, project);
    return json({ error: "Klarte ikke å lage stemmen.", detail: String((e && e.message) || e).slice(0, 200) }, 200);
  }

  const audioId = crypto.randomUUID().replace(/-/g, "");
  await env.BUILDER_KV.put(AUDIO_PREFIX + audioId, out.bytes, { metadata: { ct: out.contentType }, expirationTtl: 60 * 60 * 24 * 30 });
  const origin = new URL(request.url).origin;
  scene.voice = { assetUrl: origin + "/api/videoflow/scene-voice?audioId=" + audioId, words: out.words, durationSec: out.durationSec, status: "ready" };
  await saveProject(env, project);
  return json({ ok: true, scene, balance: gate.owner ? null : gate.balance }, 200);
}

export async function onRequestGet(context) {
  const { request, env } = context;
  const id = new URL(request.url).searchParams.get("audioId") || "";
  if (!/^[a-f0-9]{16,40}$/i.test(id)) return new Response("Not found", { status: 404 });
  if (!env.BUILDER_KV) return new Response("Not configured", { status: 500 });
  const res = await env.BUILDER_KV.getWithMetadata(AUDIO_PREFIX + id, { type: "arrayBuffer" });
  if (!res || !res.value) return new Response("Not found", { status: 404 });
  const ct = (res.metadata && res.metadata.ct) || "audio/mpeg";
  return new Response(res.value, { status: 200, headers: { "Content-Type": ct, "Cache-Control": "public, max-age=2592000, immutable" } });
}

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "GET, POST, OPTIONS", "Access-Control-Allow-Headers": "Content-Type" } });
}
