/**
 * Mia & Teo Video Creator, final render/compositor.
 *
 * Calls the ALREADY RUNNING whiteboard-engine Render.com service (same one
 * the YouTube app uses for its slideshow videos, functions/api/youtube-
 * video.js), which now has a dedicated "/api/generer-episode" route and
 * Remotion composition (whiteboard-engine/video/EpisodeComposition.tsx) that
 * places every approved shot clip back to back, with each shot's
 * dialogue/narration audio layered on top at the right offset.
 *
 * IMPORTANT: this step makes NO new calls to Claude/OpenAI/Higgsfield/
 * ElevenLabs, it only stitches together assets that were already generated
 * (and already paid for) earlier in the pipeline. Rendering itself runs on
 * infrastructure that's already deployed and already paid for monthly, not
 * a new per-use cost, so this route is not confirm-gated like the
 * generation routes are.
 *
 * Still honestly missing (see docs/mia-teo-video-creator.md):
 *   - Background music / SFX mixing (no music provider wired up yet, so the
 *     episode plays with dialogue/narration audio only).
 *   - Burned-in subtitles.
 *   - Crossfades/transitions (hard cuts between shots).
 *   - Permanent storage: the finished MP4 is served from the render
 *     engine's own disk (may not survive a redeploy), not yet copied to
 *     durable storage (R2). Download and keep a copy of anything you want
 *     to publish.
 *
 * POST /api/miateo/render { projectId }
 *   -> not all shots ready:  { ok:false, ready:false, missingShotIds }
 *   -> starts the render:     { ok:true, status:"rendering", jobId }
 *
 * GET /api/miateo/render?projectId=X
 *   -> polls the render job if one is in progress, updates + returns
 *      project.render: { status:"not_started"|"rendering"|"ready"|"failed", videoUrl?, error? }
 *
 * Owner-only.
 */
import { requireOwner } from "../../_lib/miateo-access.js";
import { readProject, saveProject } from "../../_lib/miateo-store.js";
import { orderedShots } from "../../_lib/miateo-continuity.js";

const ENGINE_DEFAULT = "https://lme-platform.onrender.com";

function json(data, status) {
  return new Response(JSON.stringify(data), {
    status: status || 200,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

function engineUrl(env) {
  return (env.WHITEBOARD_ENGINE_URL || ENGINE_DEFAULT).replace(/\/$/, "");
}

async function fetchTimeout(url, opts, ms) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), ms || 20000);
  try { return await fetch(url, { ...opts, signal: ctrl.signal }); }
  finally { clearTimeout(timer); }
}

// One shot's audio tracks: narration first (if voiced), then dialogue lines
// in order, each starting right after the previous one ends. Lines that
// haven't been voiced yet (no audioAssetId) are skipped, they just play
// silent in the assembled episode until you generate that line's voice.
function buildAudioTracks(origin, shot) {
  const tracks = [];
  let cursor = 0;
  const push = (line) => {
    if (!line || !line.audioAssetId) return;
    const durationSec = Number(line.durationSec) || 2;
    tracks.push({ url: origin + "/api/miateo/voice?audioId=" + line.audioAssetId, startSec: cursor, durationSec });
    cursor += durationSec + 0.2;
  };
  push(shot.narration);
  (shot.dialogue || []).forEach(push);
  return tracks;
}

function buildEpisodePayload(origin, project) {
  const shots = orderedShots(project).filter((s) => s.video && s.video.status === "ready" && s.video.assetUrl);
  return shots.map((s) => ({
    videoUrl: s.video.assetUrl,
    durationSec: s.durationSec || 6,
    audio: buildAudioTracks(origin, s),
  }));
}

export async function onRequestGet(context) {
  const { request, env } = context;
  const gate = await requireOwner(context);
  if (!gate.ok) return json({ error: gate.error }, gate.status);
  const project = await readProject(env, new URL(request.url).searchParams.get("projectId"));
  if (!project) return json({ error: "not_found" }, 404);

  const r = project.render;
  if (!r || r.status !== "rendering" || !r.jobId) return json({ render: r || { status: "not_started" } }, 200);

  let data;
  try {
    const res = await fetchTimeout(engineUrl(env) + "/api/whiteboard-status?id=" + encodeURIComponent(r.jobId), {}, 20000);
    data = await res.json().catch(() => null);
  } catch (e) {
    return json({ render: r }, 200); // engine unreachable right now, keep polling later
  }
  if (!data) return json({ render: r }, 200);

  if (data.status === "done" && data.videoUrl) {
    project.render = { status: "ready", videoUrl: data.videoUrl, durationSeconds: data.durationSeconds || 0, jobId: r.jobId, finishedAt: Date.now() };
    project.status = "ready";
    await saveProject(env, project);
    return json({ render: project.render }, 200);
  }
  if (data.status === "error") {
    project.render = { status: "failed", error: String(data.error || "Ukjent feil under sammenstilling."), jobId: r.jobId };
    await saveProject(env, project);
    return json({ render: project.render }, 200);
  }
  project.render = { status: "rendering", jobId: r.jobId, progress: data.progress || "", startedAt: r.startedAt };
  return json({ render: project.render }, 200);
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

  const notReady = (project.shots || []).filter((s) => !s.video || s.video.status !== "ready");
  if (notReady.length) {
    return json({
      ok: false, ready: false,
      missingShotIds: notReady.map((s) => s.id),
      detail: notReady.length + " av " + project.shots.length + " shot mangler ferdig video ennå.",
    }, 200);
  }

  const origin = new URL(request.url).origin;
  const shots = buildEpisodePayload(origin, project);
  if (!shots.length) return json({ ok: false, error: "Ingen godkjente shot å sette sammen." }, 200);

  let data;
  try {
    const res = await fetchTimeout(engineUrl(env) + "/api/generer-episode", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ shots, aspect: "16:9" }),
    }, 20000);
    data = await res.json().catch(() => null);
    if (!res.ok || !data || !data.jobId) throw new Error((data && data.error) || "Rendringsmotoren svarte " + res.status + ".");
  } catch (e) {
    return json({ ok: false, error: "Klarte ikke å starte sammenstillingen.", detail: String((e && e.message) || e).slice(0, 200) }, 200);
  }

  project.render = { status: "rendering", jobId: data.jobId, startedAt: Date.now() };
  project.status = "generating";
  await saveProject(env, project);
  return json({ ok: true, status: "rendering", jobId: data.jobId }, 200);
}

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "GET, POST, OPTIONS", "Access-Control-Allow-Headers": "Content-Type" } });
}
