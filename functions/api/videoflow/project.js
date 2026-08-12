/**
 * LME VideoFlow, project storage.
 *
 * Free, no AI cost. Every project is scoped to the logged-in user who
 * created it (functions/_lib/videoflow-store.js indexes per email), this is
 * a multi-user sellable app, not an owner-only tool like Mia & Teo.
 *
 * GET  /api/videoflow/project             -> { projects:[...] }  (caller's own)
 * GET  /api/videoflow/project?id=X         -> { project }         (must own it)
 *
 * POST /api/videoflow/project   { action, ... }
 *   action:"save"    { project:{ id, scenes:[{id,narration,caption,visualDescription,durationSec}] } }
 *   action:"delete"  { id }
 *
 * Owner (Renate) note: per platform rule, the owner's OWN generations are
 * always free (enforceVideoFlow bypasses credits for isOwner), but project
 * storage itself has no owner special-case, everyone (including the owner,
 * if she makes her own VideoFlow projects) only sees their own library.
 */
import { sessionUser } from "../../_lib/access.js";
import { videoflowAccess } from "../../_lib/videoflow-access.js";
import { readProject, saveProject, deleteProject, listProjects, cleanId, STATUSES } from "../../_lib/videoflow-store.js";

function json(data, status) {
  return new Response(JSON.stringify(data), {
    status: status || 200,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

function clampStr(v, max) { return String(v == null ? "" : v).slice(0, max || 400); }

export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  if (url.searchParams.get("balance") === "1") return json(await videoflowAccess(context), 200);

  const user = await sessionUser(context);
  if (!user) return json({ error: "Logg inn for å bruke VideoFlow." }, 401);
  if (!env.BUILDER_KV) return json({ error: "not_configured", projects: [] }, 200);

  const id = url.searchParams.get("id");
  if (id) {
    const project = await readProject(env, id);
    if (!project || project.ownerEmail !== user.email) return json({ error: "not_found", project: null }, 404);
    return json({ project }, 200);
  }
  return json({ projects: await listProjects(env, user.email) }, 200);
}

export async function onRequestPost(context) {
  const { request, env } = context;
  const user = await sessionUser(context);
  if (!user) return json({ error: "Logg inn for å bruke VideoFlow." }, 401);
  if (!env.BUILDER_KV) return json({ error: "not_configured" }, 200);

  let body;
  try { body = await request.json(); } catch (e) { return json({ error: "bad_json" }, 400); }

  if (body.action === "delete") {
    const project = await readProject(env, body.id);
    if (!project || project.ownerEmail !== user.email) return json({ error: "not_found" }, 404);
    await deleteProject(env, project);
    return json({ ok: true }, 200);
  }

  if (body.action === "save") {
    const incoming = body.project;
    if (!incoming || !cleanId(incoming.id)) return json({ error: "bad_project" }, 400);
    const existing = await readProject(env, incoming.id);
    if (!existing || existing.ownerEmail !== user.email) return json({ error: "not_found" }, 404);

    existing.status = STATUSES.includes(incoming.status) ? incoming.status : existing.status;
    if (Array.isArray(incoming.scenes)) {
      const byId = new Map(existing.scenes.map((s) => [s.id, s]));
      existing.scenes = incoming.scenes
        .filter((s) => s && cleanId(s.id) && byId.has(s.id))
        .map((s) => {
          const base = byId.get(s.id);
          return {
            id: s.id, index: Number.isFinite(s.index) ? s.index : base.index,
            narration: clampStr(s.narration, 400), caption: clampStr(s.caption, 120),
            visualDescription: clampStr(s.visualDescription, 400),
            durationSec: Math.min(15, Math.max(3, parseInt(s.durationSec, 10) || base.durationSec || 5)),
            // Generation state is server-authoritative, never accept it from the client.
            image: base.image, voice: base.voice,
          };
        });
    }
    await saveProject(env, existing);
    return json({ ok: true, project: existing }, 200);
  }

  return json({ error: "unknown_action" }, 400);
}

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "GET, POST, OPTIONS", "Access-Control-Allow-Headers": "Content-Type" } });
}
