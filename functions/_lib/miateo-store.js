/**
 * Mia & Teo Video Creator, data store.
 *
 * Everything lives in BUILDER_KV as JSON documents, the same pattern already
 * used by functions/api/episode.js, gruppe.js and kurs.js (there is no D1 or
 * R2 on this platform yet, see docs/mia-teo-video-creator.md "Infrastructure
 * gaps"). One "project" document is one in-progress or finished episode:
 * idea -> story -> storyboard (scenes+shots) -> approved -> generating ->
 * ready -> published. A self-healing index (same fullIndex() trick as
 * episode.js) keeps the library list fast without re-reading every project.
 *
 * Keys:
 *   miateo:project:<id>        -> full project JSON
 *   miateo:project-index       -> [ {id, slug, title, status, ...} ]  (light)
 *   miateo:series:<id>         -> full series JSON
 *   miateo:series-index        -> [ {id, title, episodeIds, ...} ]   (light)
 *
 * Generated binary assets (keyframe images, shot video clips, voice lines)
 * are NOT stored here: they reuse the existing img:/vid: KV blob pattern
 * from functions/api/image.js and functions/api/video.js, and this store
 * only keeps the resulting public URL + generation metadata per shot.
 */

export const PROJECT_PREFIX = "miateo:project:";
export const PROJECT_INDEX_KEY = "miateo:project-index";
export const SERIES_PREFIX = "miateo:series:";
export const SERIES_INDEX_KEY = "miateo:series-index";

const MAX_SIZE = 6 * 1024 * 1024; // one project doc (scenes+shots+dialogue), no embedded binaries

export const STATUSES = ["idea", "story", "storyboard", "approved", "generating", "ready", "published"];
export const VIDEO_TYPES = [
  "adventure", "mystery", "learn-discover", "story", "science", "nature",
  "animals", "space", "geography", "history", "math", "language", "quiz",
  "experiment", "creative", "what-if",
];
export const LENGTHS = ["short", "2-3", "4-5", "6-8", "10plus"];

export function cleanId(id) {
  if (typeof id !== "string") return null;
  const s = id.trim().toLowerCase();
  return /^[a-z0-9][a-z0-9\-]{1,58}[a-z0-9]$/.test(s) ? s : null;
}

export function newId(prefix) {
  return (prefix || "id") + "-" + crypto.randomUUID().replace(/-/g, "").slice(0, 16);
}

export function slugify(s) {
  return (s || "")
    .toLowerCase()
    .replace(/æ/g, "ae").replace(/ø/g, "oe").replace(/å/g, "aa")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60);
}

async function readJson(env, key, fallback) {
  try {
    const raw = await env.BUILDER_KV.get(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    return fallback;
  }
}

async function readIndex(env, key) {
  const list = await readJson(env, key, []);
  return Array.isArray(list) ? list : [];
}

/* Self-healing index, same trick as functions/api/episode.js fullIndex():
   KV list() is eventually consistent, so reconcile any stored doc missing
   from the light index instead of ever silently dropping a project. */
async function fullIndex(env, prefix, indexKey, toEntry) {
  const index = await readIndex(env, indexKey);
  try {
    const listed = await env.BUILDER_KV.list({ prefix, limit: 1000 });
    const known = new Set(index.map((e) => e && e.id));
    let changed = false;
    for (const key of (listed && listed.keys) || []) {
      const id = key.name.slice(prefix.length);
      if (!id || known.has(id)) continue;
      const raw = await env.BUILDER_KV.get(key.name);
      if (!raw) continue;
      try {
        const doc = JSON.parse(raw);
        if (doc && doc.id) { index.push(toEntry(doc)); changed = true; }
      } catch (e) { /* skip corrupt entry */ }
    }
    if (changed) {
      index.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
      await env.BUILDER_KV.put(indexKey, JSON.stringify(index));
    }
  } catch (e) { /* no list() support: use index as-is */ }
  return index;
}

// ===========================================================================
// Projects (episodes in progress or finished)
// ===========================================================================

export function newProject(input) {
  const now = Date.now();
  const id = newId("proj");
  return {
    id,
    slug: slugify((input && input.idea) || "") + "-" + id.slice(-6),
    createdAt: now,
    updatedAt: now,
    status: "idea",
    seriesId: (input && input.seriesId) || null,
    input: {
      idea: String((input && input.idea) || "").slice(0, 600),
      ageBand: String((input && input.ageBand) || "6-9"),
      lang: (input && input.lang) === "en" ? "en" : "no",
      videoType: VIDEO_TYPES.includes(input && input.videoType) ? input.videoType : "adventure",
      length: LENGTHS.includes(input && input.length) ? input.length : "4-5",
    },
    story: null,
    scenes: [],
    shots: [],
    interactionMoments: [],
    educational: {
      learningArea: "", learningObjective: "", keyConcepts: [], vocabulary: [],
      skills: [], difficulty: "", takeaway: "", factChecked: false,
    },
    render: { status: "not_started" },
    publish: { lekOgLaer: { published: false }, youtube: { prepared: false } },
    costLog: [],
  };
}

function projectIndexEntry(p) {
  return {
    id: p.id, slug: p.slug, title: (p.story && p.story.titleNo) || p.input.idea.slice(0, 60),
    status: p.status, ageBand: p.input.ageBand, lang: p.input.lang, videoType: p.input.videoType,
    seriesId: p.seriesId, updatedAt: p.updatedAt,
    shotCount: Array.isArray(p.shots) ? p.shots.length : 0,
    thumbnailUrl: (p.shots && p.shots[0] && p.shots[0].keyframe && p.shots[0].keyframe.assetUrl) || null,
  };
}

export async function listProjects(env) {
  return fullIndex(env, PROJECT_PREFIX, PROJECT_INDEX_KEY, projectIndexEntry);
}

export async function readProject(env, id) {
  const cid = cleanId(id);
  if (!cid) return null;
  return readJson(env, PROJECT_PREFIX + cid, null);
}

export async function saveProject(env, project) {
  if (!project || !cleanId(project.id)) throw new Error("bad_project_id");
  project.updatedAt = Date.now();
  const payload = JSON.stringify(project);
  if (payload.length > MAX_SIZE) throw new Error("too_large");
  await env.BUILDER_KV.put(PROJECT_PREFIX + project.id, payload);
  const index = (await readIndex(env, PROJECT_INDEX_KEY)).filter((e) => e && e.id !== project.id);
  index.push(projectIndexEntry(project));
  index.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
  await env.BUILDER_KV.put(PROJECT_INDEX_KEY, JSON.stringify(index));
  return project;
}

export async function deleteProject(env, id) {
  const cid = cleanId(id);
  if (!cid) return;
  await env.BUILDER_KV.delete(PROJECT_PREFIX + cid);
  const index = (await readIndex(env, PROJECT_INDEX_KEY)).filter((e) => e && e.id !== cid);
  await env.BUILDER_KV.put(PROJECT_INDEX_KEY, JSON.stringify(index));
}

// ===========================================================================
// Series (a recurring show, e.g. "Mia & Teo's Forest Mysteries")
// ===========================================================================

export function newSeries(input) {
  const now = Date.now();
  return {
    id: newId("series"),
    titleNo: String((input && input.titleNo) || "").slice(0, 120),
    titleEn: String((input && input.titleEn) || "").slice(0, 120),
    ageBand: String((input && input.ageBand) || "6-9"),
    lang: (input && input.lang) === "en" ? "en" : "no",
    videoType: VIDEO_TYPES.includes(input && input.videoType) ? input.videoType : "mystery",
    visualStyleNote: String((input && input.visualStyleNote) || ""),
    musicIdentityNote: String((input && input.musicIdentityNote) || ""),
    episodeIds: [],
    createdAt: now,
    updatedAt: now,
  };
}

function seriesIndexEntry(s) {
  return {
    id: s.id, titleNo: s.titleNo, titleEn: s.titleEn, ageBand: s.ageBand, lang: s.lang,
    episodeCount: Array.isArray(s.episodeIds) ? s.episodeIds.length : 0, updatedAt: s.updatedAt,
  };
}

export async function listSeries(env) {
  return fullIndex(env, SERIES_PREFIX, SERIES_INDEX_KEY, seriesIndexEntry);
}

export async function readSeries(env, id) {
  const cid = cleanId(id);
  if (!cid) return null;
  return readJson(env, SERIES_PREFIX + cid, null);
}

export async function saveSeries(env, series) {
  if (!series || !cleanId(series.id)) throw new Error("bad_series_id");
  series.updatedAt = Date.now();
  await env.BUILDER_KV.put(SERIES_PREFIX + series.id, JSON.stringify(series));
  const index = (await readIndex(env, SERIES_INDEX_KEY)).filter((e) => e && e.id !== series.id);
  index.push(seriesIndexEntry(series));
  index.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
  await env.BUILDER_KV.put(SERIES_INDEX_KEY, JSON.stringify(index));
  return series;
}

export async function deleteSeries(env, id) {
  const cid = cleanId(id);
  if (!cid) return;
  await env.BUILDER_KV.delete(SERIES_PREFIX + cid);
  const index = (await readIndex(env, SERIES_INDEX_KEY)).filter((e) => e && e.id !== cid);
  await env.BUILDER_KV.put(SERIES_INDEX_KEY, JSON.stringify(index));
}

// ===========================================================================
// Shot / scene helpers (operate on an in-memory project doc, caller saves)
// ===========================================================================

export function newScene(index) {
  return { id: newId("scene"), index: index || 0, title: "", location: "", timeOfDay: "day", weather: "", learningTag: "", shots: [] };
}

export function newShot(sceneId, index) {
  return {
    id: newId("shot"), sceneId, index: index || 0,
    characters: [], location: "", action: "", expression: "", composition: "", cameraAngle: "", cameraMovement: "",
    lighting: "", props: "",
    dialogue: [], narration: null,
    durationSec: 6, sfx: [], musicMood: "",
    continuityIn: null, continuityOut: null,
    keyframe: { assetUrl: null, prompt: "", provider: null, model: null, status: "none", approved: false },
    video: { assetUrl: null, prompt: "", provider: null, model: null, jobId: null, status: "none" },
    qc: { checked: false, issues: [] },
  };
}

export function shotById(project, shotId) {
  return (project.shots || []).find((s) => s.id === shotId) || null;
}
