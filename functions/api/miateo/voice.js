/**
 * Mia & Teo Video Creator, character voice lines.
 *
 * One ElevenLabs TTS call PER DIALOGUE LINE (or per narration line), using
 * the persistent Mia/Teo/Narrator voice IDs from functions/_lib/miateo-
 * bible.js voiceIdFor() (same env vars as the existing Mia & Teo lydeventyr
 * in functions/api/podcast/[[path]].js: ELEVENLABS_VOICE_MIA/TEO/NARRATOR).
 * Regenerating one line never touches any other line or shot.
 *
 * Storing/serving audio: no existing route serves single audio blobs by id
 * (functions/api/podcast serves whole-episode audio only), so this route
 * both stores ("miateo:audio:<id>" in BUILDER_KV, same 30-day TTL pattern as
 * functions/api/image.js "img:") and serves it back via GET.
 *
 * POST /api/miateo/voice
 *   { projectId, shotId, lineKind:"dialogue"|"narration", lineIndex?, confirm }
 *   confirm !== true -> dry run: { paid:true, provider, estimatedCost, text, speaker }
 *   confirm === true -> real ElevenLabs call (costs money)
 *                     -> { ok:true, shot, audioUrl, durationSec }
 *
 * GET /api/miateo/voice?audioId=<id>   -> audio/mpeg (public, immutable)
 *
 * Owner-only for POST; GET is public (needed for the <audio> player + any
 * future render step to fetch the file, same openness as /api/image GET).
 */
import { requireOwner } from "../../_lib/miateo-access.js";
import { readProject, shotById, updateShot } from "../../_lib/miateo-store.js";
import { voiceIdFor } from "../../_lib/miateo-bible.js";
import { voiceGenerateLine, estimateVoiceCost, voiceProviderConfigured } from "../../_lib/miateo-providers.js";

const AUDIO_PREFIX = "miateo:audio:";

function json(data, status) {
  return new Response(JSON.stringify(data), {
    status: status || 200,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

function findLine(shot, body) {
  if (body.lineKind === "narration") {
    return { text: shot.narration && (shot.narration[body.lang === "en" ? "en" : "no"] || shot.narration.no), speaker: "narrator", target: shot.narration };
  }
  const i = parseInt(body.lineIndex, 10);
  const line = Array.isArray(shot.dialogue) ? shot.dialogue[i] : null;
  if (!line) return null;
  return { text: line[body.lang === "en" ? "en" : "no"] || line.no, speaker: line.speaker, target: line };
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
  const line = findLine(shot, body);
  if (!line || !line.text) return json({ error: "Fant ingen replikk å lese inn." }, 400);

  if (!body.confirm) {
    return json({
      paid: true, provider: "elevenlabs", estimatedCost: estimateVoiceCost(line.text),
      text: line.text, speaker: line.speaker,
      note: "Dry run, no API call made. Resend with confirm:true to actually generate (costs money).",
    }, 200);
  }

  if (!voiceProviderConfigured(env)) return json({ error: "not_configured", detail: "ELEVENLABS_API_KEY mangler." }, 200);
  const voiceId = voiceIdFor(env, line.speaker);
  if (!voiceId) return json({ error: "not_configured", detail: "Ingen ElevenLabs-stemme satt for " + line.speaker + " (ELEVENLABS_VOICE_MIA/TEO/NARRATOR)." }, 200);

  let out;
  try {
    out = await voiceGenerateLine(env, line.text, voiceId);
  } catch (e) {
    // voiceGenerateLine already throws a user-facing, Norwegian message
    // (e.g. "ElevenLabs-kontoen har ikke nok kreditter …"), surface it
    // directly instead of a generic wrapper so the real cause is visible.
    return json({ error: String((e && e.message) || e).slice(0, 300) }, 200);
  }

  const audioId = crypto.randomUUID().replace(/-/g, "");
  await env.BUILDER_KV.put(AUDIO_PREFIX + audioId, out.bytes, { metadata: { ct: out.contentType }, expirationTtl: 60 * 60 * 24 * 30 });
  const origin = new URL(request.url).origin;
  const audioUrl = origin + "/api/miateo/voice?audioId=" + audioId;

  // Re-read fresh before writing (see updateShot doc comment in miateo-
  // store.js): the ElevenLabs call above is exactly the window another
  // shot's (or another line's) generation could have saved in. Re-resolve
  // the line against the FRESH shot, not the stale `line` from the top of
  // this request, since `line.target` points into the old object.
  const result = await updateShot(env, body.projectId, body.shotId, (freshShot) => {
    const freshLine = findLine(freshShot, body);
    if (freshLine && freshLine.target) {
      freshLine.target.audioAssetId = audioId;
      freshLine.target.durationSec = out.durationSecEstimate;
    }
  });
  if (!result) return json({ error: "not_found" }, 404);
  return json({ ok: true, shot: result.shot, audioUrl, durationSec: out.durationSecEstimate }, 200);
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
