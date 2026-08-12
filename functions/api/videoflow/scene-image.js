/**
 * LME VideoFlow, scene image generation.
 *
 * One styled image per scene. The image prompt is composed here, at
 * generation time, from the project's chosen style + the scene's style-
 * agnostic visualDescription (see functions/api/videoflow/script.js), so
 * switching styles later and re-rendering doesn't need a new script call.
 * Regenerating one scene's image never touches any other scene.
 *
 * POST /api/videoflow/scene-image   { projectId, sceneId, confirm }
 *   confirm !== true -> dry run: { paid:true, creditCost, prompt }
 *   confirm === true -> real image call, debits CREDIT_COSTS.image credits
 *                     -> { ok:true, scene, balance }
 */
import { sessionUser } from "../../_lib/access.js";
import { enforceVideoFlow, refundVideoFlow } from "../../_lib/videoflow-access.js";
import { imageGenerateScene, imageProviderConfigured, CREDIT_COSTS } from "../../_lib/videoflow-providers.js";
import { styleById, AVOID_LIST, SAFE_SUFFIX } from "../../_lib/videoflow-styles.js";
import { readProject, sceneById, updateScene } from "../../_lib/videoflow-store.js";

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

function buildPrompt(project, scene) {
  const style = styleById(project.input.style);
  return [style.prompt, scene.visualDescription, AVOID_LIST].join(" ") + SAFE_SUFFIX;
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

  const prompt = buildPrompt(project, scene);

  if (!body.confirm) {
    return json({
      paid: true, creditCost: CREDIT_COSTS.image, prompt,
      note: "Dry run, no API call made. Resend with confirm:true to actually generate (costs " + CREDIT_COSTS.image + " credits).",
    }, 200);
  }

  if (!imageProviderConfigured(env)) return json({ error: "not_configured", detail: "Verken OPENAI_API_KEY eller GEMINI_API_KEY er satt." }, 200);

  const gate = await enforceVideoFlow(context, CREDIT_COSTS.image);
  if (!gate.ok) return json({ error: gate.error, needCredits: gate.needCredits || false, balance: gate.balance }, gate.status);

  let out;
  try {
    out = await imageGenerateScene(env, prompt, "1536x1024");
  } catch (e) {
    if (!gate.owner) await refundVideoFlow(context, gate.email, CREDIT_COSTS.image);
    // Re-read the project fresh here (see updateScene doc comment): the slow
    // API call above is exactly the window where another scene's generation
    // could have saved in the meantime, writing back the stale `project`
    // object we read at the top of this request would silently erase it.
    await updateScene(env, body.projectId, body.sceneId, (s) => { s.image.status = "failed"; });
    return json({ error: "Klarte ikke å lage bildet.", detail: String((e && e.message) || e).slice(0, 200) }, 200);
  }

  const origin = new URL(request.url).origin;
  const assetUrl = await storeImage(env, origin, out.bytes, out.contentType);
  const result = await updateScene(env, body.projectId, body.sceneId, (s, p) => {
    s.image = { assetUrl, prompt, status: "ready" };
    if (p.status === "idea") p.status = "script";
  });
  if (!result) return json({ error: "not_found" }, 404);
  return json({ ok: true, scene: result.scene, balance: gate.owner ? null : gate.balance }, 200);
}

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "POST, OPTIONS", "Access-Control-Allow-Headers": "Content-Type" } });
}
