/**
 * LME VideoFlow, data store.
 *
 * Same KV-document + self-healing-index pattern as functions/_lib/miateo-
 * store.js, but scoped per user (ownerEmail on every project): VideoFlow is
 * a multi-user, sellable product, not an owner-only production tool, so
 * everyone's projects need to stay private to them.
 *
 * Keys:
 *   vf:project:<id>          -> full project JSON
 *   vf:project-index:<email> -> [ {id, title, status, ...} ]  (light, per user)
 */

export const PROJECT_PREFIX = "vf:project:";
export const INDEX_PREFIX = "vf:project-index:";

const MAX_SIZE = 4 * 1024 * 1024;

export const STATUSES = ["idea", "script", "generating", "ready"];

export function cleanId(id) {
  if (typeof id !== "string") return null;
  const s = id.trim().toLowerCase();
  return /^[a-z0-9][a-z0-9\-]{1,58}[a-z0-9]$/.test(s) ? s : null;
}

export function newId(prefix) {
  return (prefix || "id") + "-" + crypto.randomUUID().replace(/-/g, "").slice(0, 16);
}

async function readJson(env, key, fallback) {
  try { const raw = await env.BUILDER_KV.get(key); return raw ? JSON.parse(raw) : fallback; }
  catch (e) { return fallback; }
}

export function newProject(ownerEmail, input) {
  const now = Date.now();
  return {
    id: newId("vfp"),
    ownerEmail,
    createdAt: now,
    updatedAt: now,
    status: "idea",
    input: {
      idea: String((input && input.idea) || "").slice(0, 600),
      style: String((input && input.style) || "cinematic"),
      voiceId: String((input && input.voiceId) || ""),
      lang: (input && input.lang) === "no" ? "no" : "en",
    },
    scenes: [],
    render: { status: "not_started" },
  };
}

function indexEntry(p) {
  return {
    id: p.id, title: p.input.idea.slice(0, 60) || "(uten tittel)", status: p.status,
    style: p.input.style, sceneCount: Array.isArray(p.scenes) ? p.scenes.length : 0,
    thumbnailUrl: (p.scenes && p.scenes[0] && p.scenes[0].image && p.scenes[0].image.assetUrl) || null,
    updatedAt: p.updatedAt,
  };
}

async function readIndex(env, email) {
  const list = await readJson(env, INDEX_PREFIX + email, []);
  return Array.isArray(list) ? list : [];
}

export async function listProjects(env, email) {
  return readIndex(env, email);
}

export async function readProject(env, id) {
  const cid = cleanId(id);
  if (!cid) return null;
  return readJson(env, PROJECT_PREFIX + cid, null);
}

export async function saveProject(env, project) {
  if (!project || !cleanId(project.id) || !project.ownerEmail) throw new Error("bad_project");
  project.updatedAt = Date.now();
  const payload = JSON.stringify(project);
  if (payload.length > MAX_SIZE) throw new Error("too_large");
  await env.BUILDER_KV.put(PROJECT_PREFIX + project.id, payload);
  const index = (await readIndex(env, project.ownerEmail)).filter((e) => e && e.id !== project.id);
  index.push(indexEntry(project));
  index.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
  await env.BUILDER_KV.put(INDEX_PREFIX + project.ownerEmail, JSON.stringify(index));
  return project;
}

export async function deleteProject(env, project) {
  if (!project) return;
  await env.BUILDER_KV.delete(PROJECT_PREFIX + project.id);
  const index = (await readIndex(env, project.ownerEmail)).filter((e) => e && e.id !== project.id);
  await env.BUILDER_KV.put(INDEX_PREFIX + project.ownerEmail, JSON.stringify(index));
}

export function newScene(index) {
  return {
    id: newId("vfs"), index: index || 0,
    narration: "", caption: "", visualDescription: "", durationSec: 5,
    // imagePrompt is derived from style + visualDescription at generation
    // time (see functions/api/videoflow/scene-image.js), so swapping a
    // project's style later can re-render images without a new script call.
    image: { assetUrl: null, prompt: "", status: "none" },
    voice: { assetUrl: null, words: [], durationSec: 0, status: "none" },
  };
}

export function sceneById(project, sceneId) {
  return (project.scenes || []).find((s) => s.id === sceneId) || null;
}

/**
 * Read-modify-write a single scene, re-reading the project FRESH from KV
 * right before the write. Generation endpoints (scene-image.js, scene-
 * voice.js) call this only AFTER their slow external API call finishes, so
 * the only thing sitting between this read and this write is a fast local
 * mutation, not a multi-second AI call. Without this, generating images for
 * two scenes back to back could lose one: both requests read the project
 * before either had written, so whichever wrote second silently overwrote
 * the first scene's new image with its own stale copy. Still theoretically
 * racy (KV has no transactions), but the window shrinks from "as long as
 * the AI call takes" to "a few milliseconds".
 */
export async function updateScene(env, projectId, sceneId, mutator) {
  const project = await readProject(env, projectId);
  if (!project) return null;
  const scene = sceneById(project, sceneId);
  if (!scene) return null;
  mutator(scene, project);
  await saveProject(env, project);
  return { project, scene };
}
