/**
 * LME VideoFlow, style-swap re-render.
 *
 * Re-renders every scene's image in a new visual style WITHOUT a new script
 * call: each scene's visualDescription (style-agnostic, see script.js) is
 * combined with the new style's prompt modifier, exactly like a normal
 * scene-image.js generation, just for every scene in one request.
 *
 * POST /api/videoflow/restyle   { projectId, style, confirm }
 *   confirm !== true -> dry run: { paid:true, creditCost, sceneCount, style }
 *   confirm === true -> regenerates every scene's image, debits
 *                       CREDIT_COSTS.image * sceneCount credits upfront
 *                     -> { ok:true, project, succeeded, failed, balance }
 *
 * Concurrency note: unlike scene-image.js (one scene, uses updateScene to
 * shrink the race window to almost nothing), this touches every scene in
 * the project at once. Running N independent updateScene calls in parallel
 * would just recreate the same lost-update bug at the batch level (each
 * would read-modify-write the WHOLE project, and only the last writer's
 * copy would survive). Instead: run the N image generations in parallel
 * (that's the slow, independent part), then apply all results to a single
 * freshly-read project copy and save ONCE. This is safe against races
 * within this request; it can still theoretically lose to a concurrent
 * single-scene generate fired from another tab mid-batch, same residual
 * risk as any KV document without real transactions.
 */
import { sessionUser } from "../../_lib/access.js";
import { enforceVideoFlow, refundVideoFlow } from "../../_lib/videoflow-access.js";
import { imageGenerateScene, imageProviderConfigured, CREDIT_COSTS } from "../../_lib/videoflow-providers.js";
import { styleById, AVOID_LIST, SAFE_SUFFIX } from "../../_lib/videoflow-styles.js";
import { readProject, sceneById, saveProject } from "../../_lib/videoflow-store.js";

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

function buildPrompt(style, scene) {
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
  if (!project.scenes || !project.scenes.length) return json({ error: "Ingen scener å style om ennå." }, 400);

  const style = styleById(body.style);
  const sceneCount = project.scenes.length;
  const totalCost = CREDIT_COSTS.image * sceneCount;

  if (!body.confirm) {
    return json({
      paid: true, creditCost: totalCost, sceneCount, style: style.id,
      note: "Dry run, no API call made. Resend with confirm:true to actually regenerate all " + sceneCount + " images (costs " + totalCost + " credits).",
    }, 200);
  }

  if (!imageProviderConfigured(env)) return json({ error: "not_configured", detail: "Verken OPENAI_API_KEY eller GEMINI_API_KEY er satt." }, 200);

  const gate = await enforceVideoFlow(context, totalCost);
  if (!gate.ok) return json({ error: gate.error, needCredits: gate.needCredits || false, balance: gate.balance }, gate.status);

  const scenesSnapshot = project.scenes.slice();
  const origin = new URL(request.url).origin;
  const results = await Promise.allSettled(scenesSnapshot.map(async (scene) => {
    const prompt = buildPrompt(style, scene);
    const out = await imageGenerateScene(env, prompt, "1536x1024");
    const assetUrl = await storeImage(env, origin, out.bytes, out.contentType);
    return { assetUrl, prompt };
  }));

  // Apply every result to ONE freshly-read project copy, single save at the
  // end, see the concurrency note above for why this can't be N parallel
  // per-scene saves.
  const fresh = await readProject(env, body.projectId);
  if (!fresh) return json({ error: "not_found" }, 404);
  let succeeded = 0, failed = 0;
  scenesSnapshot.forEach((snap, i) => {
    const scene = sceneById(fresh, snap.id);
    if (!scene) return;
    const r = results[i];
    if (r.status === "fulfilled") {
      scene.image = { assetUrl: r.value.assetUrl, prompt: r.value.prompt, status: "ready" };
      succeeded++;
    } else {
      scene.image.status = "failed";
      failed++;
    }
  });
  fresh.input.style = style.id;
  await saveProject(env, fresh);

  if (failed > 0 && !gate.owner) await refundVideoFlow(context, gate.email, CREDIT_COSTS.image * failed);

  return json({ ok: true, project: fresh, succeeded, failed, balance: gate.owner ? null : (gate.balance + (failed * CREDIT_COSTS.image)) }, 200);
}

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "POST, OPTIONS", "Access-Control-Allow-Headers": "Content-Type" } });
}
