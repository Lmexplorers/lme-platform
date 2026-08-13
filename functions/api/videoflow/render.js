/**
 * LME VideoFlow, final render/compositor.
 *
 * Calls the whiteboard-engine Render.com service's new "/api/generer-
 * videoflow" route (whiteboard-engine/video/CaptionedSlideshow.tsx), which
 * assembles every scene's already-generated image + voice + word timestamps
 * into one Ken Burns video with karaoke captions burned in.
 *
 * Makes NO new calls to Claude/OpenAI/ElevenLabs, only stitches together
 * assets already generated (and already paid for in credits) earlier in
 * the pipeline, so this route is not credit-gated.
 *
 * POST /api/videoflow/render { projectId }
 *   -> not all scenes ready:  { ok:false, ready:false, missingSceneIds }
 *   -> starts the render:     { ok:true, status:"rendering", jobId }
 *
 * GET /api/videoflow/render?projectId=X
 *   -> polls the render job if one is in progress, updates + returns
 *      project.render: { status:"not_started"|"rendering"|"ready"|"failed", videoUrl?, error? }
 */
import { sessionUser } from "../../_lib/access.js";
import { readProject, saveProject } from "../../_lib/videoflow-store.js";

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

export async function onRequestGet(context) {
  const { request, env } = context;
  const user = await sessionUser(context);
  if (!user) return json({ error: "Logg inn for å bruke VideoFlow." }, 401);
  const project = await readProject(env, new URL(request.url).searchParams.get("projectId"));
  if (!project || project.ownerEmail !== user.email) return json({ error: "not_found" }, 404);

  const r = project.render;
  if (!r || r.status !== "rendering" || !r.jobId) return json({ render: r || { status: "not_started" } }, 200);

  let data;
  try {
    const res = await fetchTimeout(engineUrl(env) + "/api/whiteboard-status?id=" + encodeURIComponent(r.jobId), {}, 20000);
    data = await res.json().catch(() => null);
  } catch (e) {
    return json({ render: r }, 200);
  }
  if (!data) return json({ render: r }, 200);

  if (data.status === "done" && data.videoUrl) {
    let videoUrl = data.videoUrl;
    let stored = false;
    if (env.VIDEOFLOW_MEDIA) {
      try {
        const origin = new URL(request.url).origin;
        const key = "videoflow/videos/" + project.id + "/" + Date.now() + ".mp4";
        const vr = await fetchTimeout(data.videoUrl, {}, 55000);
        if (vr.ok && vr.body) {
          await env.VIDEOFLOW_MEDIA.put(key, vr.body, { httpMetadata: { contentType: "video/mp4" } });
          videoUrl = origin + "/api/videoflow/media?key=" + encodeURIComponent(key);
          stored = true;
        }
      } catch (e) { /* R2-kopiering feilet, bruk motorens URL som reserve */ }
    }
    project.render = { status: "ready", videoUrl, engineVideoUrl: data.videoUrl, stored, durationSeconds: data.durationSeconds || 0, jobId: r.jobId, finishedAt: Date.now() };
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
  const user = await sessionUser(context);
  if (!user) return json({ error: "Logg inn for å bruke VideoFlow." }, 401);
  if (!env.BUILDER_KV) return json({ error: "not_configured" }, 200);

  let body;
  try { body = await request.json(); } catch (e) { return json({ error: "bad_json" }, 400); }
  const project = await readProject(env, body.projectId);
  if (!project || project.ownerEmail !== user.email) return json({ error: "not_found" }, 404);

  const notReady = (project.scenes || []).filter((s) => !s.image || s.image.status !== "ready" || !s.voice || s.voice.status !== "ready");
  if (notReady.length) {
    return json({ ok: false, ready: false, missingSceneIds: notReady.map((s) => s.id), detail: notReady.length + " av " + project.scenes.length + " scener mangler bilde eller stemme ennå." }, 200);
  }

  // Premium tier: a scene with a ready animated clip (functions/api/
  // videoflow/scene-video.js) uses that instead of its Ken Burns still.
  // Purely opportunistic, never blocks rendering on video still generating.
  const scenes = project.scenes.map((s) => ({
    imageUrl: s.image.assetUrl,
    videoUrl: (s.video && s.video.status === "ready" && s.video.assetUrl) || undefined,
    audioUrl: s.voice.assetUrl,
    durationSec: Math.max(s.durationSec || 5, s.voice.durationSec || 0),
    words: s.voice.words || [],
  }));

  let data;
  try {
    const res = await fetchTimeout(engineUrl(env) + "/api/generer-videoflow", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ scenes, aspect: "16:9" }),
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
