/**
 * Mia & Teo Video Creator, final render/compositor contract.
 *
 * HONEST STATUS (see docs/mia-teo-video-creator.md, "Infrastructure gaps"):
 * this route defines the real RenderProvider API shape the rest of the app
 * expects, but there is no working renderer wired up behind it yet, and this
 * file does not pretend otherwise or fake a render.
 *
 * Why: Cloudflare Pages Functions run on the Workers runtime, no filesystem,
 * no FFmpeg, no headless Chrome, so joining N Higgsfield video clips with
 * per-line ElevenLabs voice tracks, music, SFX, crossfades and subtitles
 * into one MP4 cannot happen inside this file. The one render-capable
 * service already reachable from this platform is whiteboard-engine (an
 * external Render.com Node/Remotion service, see functions/api/youtube-
 * video.js), but it currently only knows how to build a Ken-Burns slideshow
 * from still images + one narration track, it has no "join these video clips
 * and mix these audio tracks" composition. Building that composition, and/or
 * adding an R2 bucket so assets aren't squeezed through KV's 25MB value
 * limit, is new paid infrastructure. Per instructions, that is not
 * provisioned without asking first.
 *
 * GET  /api/miateo/render?projectId=X   -> current project.render state
 * POST /api/miateo/render { projectId }  -> readiness check; if every shot
 *   has an approved keyframe + ready video, returns requiresInfrastructure:true
 *   with the exact manual workaround (same approach mia-teo-studio.html
 *   already documents: download each clip + line, assemble with an external
 *   NLE or the existing whiteboard-engine tools) plus what would need to be
 *   built/deployed to automate it, so nothing is silently declared "done".
 *
 * Owner-only.
 */
import { requireOwner } from "../../_lib/miateo-access.js";
import { readProject, saveProject } from "../../_lib/miateo-store.js";

function json(data, status) {
  return new Response(JSON.stringify(data), {
    status: status || 200,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

const WHAT_IS_NEEDED = [
  "An R2 bucket (or equivalent object storage) for episode assets, KV's 25MB per-value limit is too small for a multi-minute finished episode.",
  "A real clip+audio compositor: either a new Remotion composition on the existing whiteboard-engine Render service that accepts a shot list (video clip URL + dialogue/narration audio URLs + timing + music/SFX) and outputs one MP4, or an equivalent FFmpeg-based render worker.",
  "Subtitle burn-in or a .vtt/.srt sidecar file generated from the already-timed dialogue/narration lines (durations are already tracked per line, see shot.dialogue[].durationSec).",
  "9:16 short/teaser reframing logic (spec §21: not a naive crop, an intentional re-edit).",
];

export async function onRequestGet(context) {
  const { request, env } = context;
  const gate = await requireOwner(context);
  if (!gate.ok) return json({ error: gate.error }, gate.status);
  const project = await readProject(env, new URL(request.url).searchParams.get("projectId"));
  if (!project) return json({ error: "not_found" }, 404);
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

  project.render = { status: "blocked_no_infrastructure", checkedAt: Date.now() };
  await saveProject(env, project);

  return json({
    ok: false, ready: true, requiresInfrastructure: true, reason: "no_render_service",
    detail: "Alle shot har ferdig video og lyd, men det finnes ingen automatisk sammenstillingsmotor ennå (se docs/mia-teo-video-creator.md).",
    whatIsNeeded: WHAT_IS_NEEDED,
    manualWorkaround: "Last ned hvert shots videoklipp (shot.video.assetUrl) og hver stemmelinje (shot.dialogue[].audioAssetId via /api/miateo/voice?audioId=), og sett dem sammen i et vanlig videoredigeringsprogram eller de eksisterende whiteboard-engine-verktøyene, samme fremgangsmåte som mia-teo-studio.html allerede beskriver for Filmgeneratoren.",
    shots: project.shots.map((s) => ({ id: s.id, videoUrl: s.video.assetUrl, durationSec: s.durationSec })),
  }, 200);
}

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "GET, POST, OPTIONS", "Access-Control-Allow-Headers": "Content-Type" } });
}
