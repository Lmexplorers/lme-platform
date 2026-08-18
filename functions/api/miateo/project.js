/**
 * Mia & Teo Video Creator, project (episode) storage + storyboard editing.
 *
 * Free, no AI cost: this is where the visual storyboard editor reads/writes
 * scenes and shots, approves the storyboard, and the library tabs (Ideas,
 * Drafts, Storyboards, Generating, Ready, Published, Series) get their data.
 * Actual generation (story text, keyframes, video, voice) lives in the
 * sibling routes story.js / keyframe.js / shot-video.js / voice.js.
 *
 * GET  /api/miateo/project                    -> { projects:[...] }        (library index)
 * GET  /api/miateo/project?id=X                -> { project }
 * GET  /api/miateo/project?kind=series          -> { series:[...] }
 * GET  /api/miateo/project?kind=series&id=X     -> { series:{...} }
 *
 * POST /api/miateo/project   { action, ... }
 *   action:"new"            { input:{idea,ageBand,lang,videoType,length,seriesId?} } -> { ok, project }
 *   action:"save"           { project:{...whole doc, editable fields only...} }      -> { ok, project }
 *   action:"delete"         { id }                                                   -> { ok }
 *   action:"approve"        { id }  (requires every shot's keyframe approved)         -> { ok, project }
 *   action:"series-new"     { input:{...} }                                          -> { ok, series }
 *   action:"series-save"    { series:{...} }                                         -> { ok, series }
 *   action:"series-delete"  { id }                                                   -> { ok }
 *
 * Owner-only (functions/_lib/miateo-access.js).
 */
import { requireOwner } from "../../_lib/miateo-access.js";
import {
  newProject, readProject, saveProject, deleteProject, listProjects,
  newSeries, readSeries, saveSeries, deleteSeries, listSeries,
  cleanId, VIDEO_TYPES, LENGTHS, STATUSES,
} from "../../_lib/miateo-store.js";
import { AGE_BANDS, DEFAULT_AGE_BAND } from "../../_lib/miateo-bible.js";
import { providerStatus } from "../../_lib/miateo-providers.js";

function json(data, status) {
  return new Response(JSON.stringify(data), {
    status: status || 200,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

function clampStr(v, max) { return String(v == null ? "" : v).slice(0, max || 400); }
function clampArr(v, max) { return Array.isArray(v) ? v.slice(0, max || 20) : []; }

function sanitizeDialogueLine(d) {
  return {
    speaker: d && d.speaker === "teo" ? "teo" : d && d.speaker === "narrator" ? "narrator" : "mia",
    no: clampStr(d && d.no, 300), en: clampStr(d && d.en, 300),
    audioAssetId: d && typeof d.audioAssetId === "string" ? clampStr(d.audioAssetId, 200) : null,
    durationSec: d && typeof d.durationSec === "number" ? d.durationSec : null,
  };
}

function sanitizeShotForSave(raw, allowedIds) {
  if (!raw || !cleanId(raw.id) || !allowedIds.has(raw.id)) return null;
  const existing = allowedIds.get(raw.id);
  return {
    id: raw.id, sceneId: existing.sceneId, index: Number.isFinite(raw.index) ? raw.index : existing.index,
    characters: clampArr(raw.characters, 2).filter((c) => c === "mia" || c === "teo"),
    location: clampStr(raw.location, 200), action: clampStr(raw.action, 400), expression: clampStr(raw.expression, 200),
    composition: clampStr(raw.composition, 200), cameraAngle: clampStr(raw.cameraAngle, 120), cameraMovement: clampStr(raw.cameraMovement, 200),
    lighting: clampStr(raw.lighting, 150), props: clampStr(raw.props, 250),
    durationSec: Math.min(20, Math.max(2, parseInt(raw.durationSec, 10) || existing.durationSec || 6)),
    dialogue: clampArr(raw.dialogue, 6).map(sanitizeDialogueLine),
    narration: raw.narration && (raw.narration.no || raw.narration.en) ? { no: clampStr(raw.narration.no, 300), en: clampStr(raw.narration.en, 300), audioAssetId: existing.narration && existing.narration.audioAssetId || null, durationSec: existing.narration && existing.narration.durationSec || null } : null,
    sfx: clampArr(raw.sfx, 6).map((s) => ({ type: clampStr(s && s.type, 40), atSec: Number((s && s.atSec) || 0) })),
    musicMood: clampStr(raw.musicMood, 80),
    continuityEvents: clampArr(raw.continuityEvents, 8).map((e) => ({
      type: clampStr(e && e.type, 20), character: e && e.character === "teo" ? "teo" : "mia",
      item: clampStr(e && e.item, 120), name: clampStr(e && e.name, 120), value: clampStr(e && e.value, 200),
    })),
    // Generation state is server-authoritative: never accept it from the
    // client, always keep whatever keyframe.js / shot-video.js / voice.js
    // last wrote for this shot.
    keyframe: existing.keyframe, video: existing.video, qc: existing.qc,
    continuityIn: existing.continuityIn, continuityOut: existing.continuityOut,
  };
}

async function handleSave(env, body) {
  const incoming = body.project;
  if (!incoming || !cleanId(incoming.id)) return json({ error: "bad_project" }, 400);
  const existing = await readProject(env, incoming.id);
  if (!existing) return json({ error: "not_found" }, 404);

  const shotIndex = new Map(existing.shots.map((s) => [s.id, s]));
  const sceneIndex = new Map(existing.scenes.map((s) => [s.id, s]));

  existing.status = STATUSES.includes(incoming.status) ? incoming.status : existing.status;
  existing.seriesId = incoming.seriesId ? clampStr(incoming.seriesId, 80) : existing.seriesId;

  if (Array.isArray(incoming.scenes)) {
    existing.scenes = incoming.scenes.filter((s) => s && cleanId(s.id) && sceneIndex.has(s.id)).map((s) => {
      const base = sceneIndex.get(s.id);
      return {
        id: s.id, index: Number.isFinite(s.index) ? s.index : base.index,
        title: clampStr(s.title, 140), location: clampStr(s.location, 200), timeOfDay: clampStr(s.timeOfDay, 60),
        weather: clampStr(s.weather, 60), learningTag: clampStr(s.learningTag, 100), shots: clampArr(s.shots, 30),
      };
    });
  }
  if (Array.isArray(incoming.shots)) {
    const cleaned = incoming.shots.map((s) => sanitizeShotForSave(s, shotIndex)).filter(Boolean);
    if (cleaned.length) existing.shots = cleaned;
  }
  if (incoming.educational && typeof incoming.educational === "object") {
    existing.educational = {
      learningArea: clampStr(incoming.educational.learningArea, 80),
      keyConcepts: clampArr(incoming.educational.keyConcepts, 8).map((s) => clampStr(s, 100)),
      vocabulary: clampArr(incoming.educational.vocabulary, 12).map((s) => clampStr(s, 60)),
      skills: clampArr(incoming.educational.skills, 8).map((s) => clampStr(s, 80)),
      difficulty: clampStr(incoming.educational.difficulty, 40),
      takeaway: clampStr(incoming.educational.takeaway, 300),
      factChecked: !!incoming.educational.factChecked,
    };
  }
  if (Array.isArray(incoming.interactionMoments)) {
    existing.interactionMoments = clampArr(incoming.interactionMoments, 10).map((m) => ({
      afterSceneIndex: Number((m && m.afterSceneIndex) || 0), no: clampStr(m && m.no, 200), en: clampStr(m && m.en, 200),
    }));
  }
  if (incoming.publish && typeof incoming.publish === "object") {
    existing.publish = {
      lekOgLaer: { published: !!(incoming.publish.lekOgLaer && incoming.publish.lekOgLaer.published), slug: clampStr(incoming.publish.lekOgLaer && incoming.publish.lekOgLaer.slug, 80) },
      youtube: { prepared: !!(incoming.publish.youtube && incoming.publish.youtube.prepared) },
    };
  }

  await saveProject(env, existing);
  return json({ ok: true, project: existing }, 200);
}

function everyKeyframeApproved(project) {
  return project.shots.length > 0 && project.shots.every((s) => s.keyframe && s.keyframe.approved);
}

export async function onRequestGet(context) {
  const { request, env } = context;
  const gate = await requireOwner(context);
  if (!gate.ok) return json({ error: gate.error }, gate.status);
  if (!env.BUILDER_KV) return json({ error: "not_configured", projects: [] }, 200);

  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  const kind = url.searchParams.get("kind");

  if (kind === "series") {
    if (id) return json({ series: await readSeries(env, id) }, 200);
    return json({ series: await listSeries(env) }, 200);
  }
  if (kind === "status") return json({ providers: providerStatus(env) }, 200);
  if (id) {
    const project = await readProject(env, id);
    if (!project) return json({ error: "not_found", project: null }, 404);
    return json({ project }, 200);
  }
  return json({ projects: await listProjects(env) }, 200);
}

export async function onRequestPost(context) {
  const { request, env } = context;
  const gate = await requireOwner(context);
  if (!gate.ok) return json({ error: gate.error }, gate.status);
  if (!env.BUILDER_KV) return json({ error: "not_configured" }, 200);

  let body;
  try { body = await request.json(); } catch (e) { return json({ error: "bad_json" }, 400); }

  switch (body.action) {
    case "new": {
      const input = body.input || {};
      const project = newProject({
        idea: input.idea, ageBand: AGE_BANDS[input.ageBand] ? input.ageBand : DEFAULT_AGE_BAND,
        lang: input.lang, videoType: VIDEO_TYPES.includes(input.videoType) ? input.videoType : "adventure",
        length: LENGTHS.includes(input.length) ? input.length : "4-5", seriesId: input.seriesId || null,
      });
      await saveProject(env, project);
      return json({ ok: true, project }, 200);
    }
    case "save": return handleSave(env, body);
    case "delete": {
      const id = cleanId(body.id);
      if (!id) return json({ error: "bad_id" }, 400);
      await deleteProject(env, id);
      return json({ ok: true }, 200);
    }
    case "approve": {
      const project = await readProject(env, body.id);
      if (!project) return json({ error: "not_found" }, 404);
      if (!everyKeyframeApproved(project)) {
        return json({ error: "Godkjenn (eller lag) et nøkkelbilde for hvert shot før du godkjenner storyboardet." }, 400);
      }
      project.status = "approved";
      await saveProject(env, project);
      return json({ ok: true, project }, 200);
    }
    case "series-new": {
      const series = newSeries(body.input || {});
      await saveSeries(env, series);
      return json({ ok: true, series }, 200);
    }
    case "series-save": {
      const incoming = body.series;
      if (!incoming || !cleanId(incoming.id)) return json({ error: "bad_series" }, 400);
      const existing = await readSeries(env, incoming.id);
      if (!existing) return json({ error: "not_found" }, 404);
      existing.titleNo = clampStr(incoming.titleNo, 120); existing.titleEn = clampStr(incoming.titleEn, 120);
      existing.visualStyleNote = clampStr(incoming.visualStyleNote, 600);
      existing.musicIdentityNote = clampStr(incoming.musicIdentityNote, 300);
      await saveSeries(env, existing);
      return json({ ok: true, series: existing }, 200);
    }
    case "series-delete": {
      const id = cleanId(body.id);
      if (!id) return json({ error: "bad_id" }, 400);
      await deleteSeries(env, id);
      return json({ ok: true }, 200);
    }
    default:
      return json({ error: "unknown_action" }, 400);
  }
}

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "GET, POST, OPTIONS", "Access-Control-Allow-Headers": "Content-Type" } });
}
