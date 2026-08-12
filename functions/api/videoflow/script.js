/**
 * LME VideoFlow, Script AI.
 *
 * Turns one idea into a scene-by-scene script: narration (spoken), caption
 * (short on-screen text, may differ from narration), and a visual
 * description per scene. The visual description is style-agnostic on
 * purpose, the actual image prompt is composed later (style + description,
 * see scene-image.js) so switching a project's visual style doesn't need a
 * new script call.
 *
 * POST /api/videoflow/script   { idea, style, voiceId, lang, projectId?, confirm }
 *   confirm !== true -> dry run: { paid:true, creditCost, systemPrompt, userPrompt }
 *   confirm === true -> real Claude call, debits CREDIT_COSTS.script credits
 *                     -> { ok:true, project }
 *
 * Any logged-in user (this is a sellable, multi-user app, not owner-only).
 */
import { sessionUser } from "../../_lib/access.js";
import { enforceVideoFlow, refundVideoFlow } from "../../_lib/videoflow-access.js";
import { textGenerateJSON, textProviderConfigured, CREDIT_COSTS } from "../../_lib/videoflow-providers.js";
import { styleById, DEFAULT_STYLE } from "../../_lib/videoflow-styles.js";
import { newProject, newScene, saveProject, readProject } from "../../_lib/videoflow-store.js";

function json(data, status) {
  return new Response(JSON.stringify(data), {
    status: status || 200,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

const SCENE_COUNT_TARGET = 6;

function buildPrompts(idea, lang) {
  const sys =
    "You write short, punchy faceless-video scripts (30-90 seconds spoken) for a general content creation app. " +
    "Given one idea/topic, write " + SCENE_COUNT_TARGET + " scenes that together tell a complete, engaging mini-story " +
    "or explainer, with a strong hook in scene 1 and a clear payoff by the last scene. " +
    "SAFETY: no sexual content, no graphic violence, no hateful or dangerous content, nothing defamatory about real people.\n\n" +
    "Return ONLY valid JSON (no markdown, no commentary) with EXACTLY this shape:\n" +
    '{"title":"", "scenes":[{"narration":"","caption":"","visualDescription":"","durationSec":5}]}\n' +
    "narration is what the voiceover says (natural spoken sentence, 1-2 sentences). caption is a short punchy on-screen " +
    "text version of the same beat (can be shorter/punchier than the narration, this is what's burned onto the video). " +
    "visualDescription is an English description of what the scene's image should show (subject, action, setting), " +
    "WITHOUT mentioning any specific art style (style is applied separately). durationSec is a realistic estimate " +
    "(4 to 8) for how long the narration takes to say.";
  const usr = "Idea: " + idea + "\nLanguage for narration/caption: " + (lang === "no" ? "Norwegian (bokmål)" : "English");
  return { sys, usr };
}

function sanitizeScript(raw) {
  if (!raw || !Array.isArray(raw.scenes) || !raw.scenes.length) return null;
  return {
    title: String(raw.title || "").slice(0, 140),
    scenes: raw.scenes.slice(0, 10).map((s) => ({
      narration: String((s && s.narration) || "").slice(0, 400),
      caption: String((s && s.caption) || "").slice(0, 120),
      visualDescription: String((s && s.visualDescription) || "").slice(0, 400),
      durationSec: Math.min(15, Math.max(3, parseInt(s && s.durationSec, 10) || 5)),
    })),
  };
}

export async function onRequestPost(context) {
  const { request, env } = context;
  const user = await sessionUser(context);
  if (!user) return json({ error: "Logg inn for å bruke VideoFlow." }, 401);
  if (!env.BUILDER_KV) return json({ error: "not_configured" }, 200);

  let body;
  try { body = await request.json(); } catch (e) { return json({ error: "bad_json" }, 400); }

  const idea = String(body.idea || "").slice(0, 600).trim();
  if (!idea) return json({ error: "Skriv en idé først." }, 400);
  const style = styleById(body.style).id;
  const lang = body.lang === "no" ? "no" : "en";
  const voiceId = String(body.voiceId || "");

  const { sys, usr } = buildPrompts(idea, lang);

  if (!body.confirm) {
    return json({
      paid: true, creditCost: CREDIT_COSTS.script,
      systemPrompt: sys, userPrompt: usr,
      note: "Dry run, no API call made. Resend with confirm:true to actually generate (costs " + CREDIT_COSTS.script + " credits).",
    }, 200);
  }

  if (!textProviderConfigured(env)) return json({ error: "not_configured", detail: "ANTHROPIC_API_KEY mangler." }, 200);

  const gate = await enforceVideoFlow(context, CREDIT_COSTS.script);
  if (!gate.ok) return json({ error: gate.error, needCredits: gate.needCredits || false, balance: gate.balance }, gate.status);

  let raw;
  try {
    raw = await textGenerateJSON(env, { system: sys, user: usr, maxTokens: 2500 });
  } catch (e) {
    if (!gate.owner) await refundVideoFlow(context, gate.email, CREDIT_COSTS.script);
    return json({ error: "Klarte ikke å lage manuset.", detail: String((e && e.message) || e).slice(0, 200) }, 200);
  }
  const script = sanitizeScript(raw);
  if (!script) {
    if (!gate.owner) await refundVideoFlow(context, gate.email, CREDIT_COSTS.script);
    return json({ error: "Fikk et ugyldig manus tilbake. Prøv igjen." }, 200);
  }

  let project = body.projectId ? await readProject(env, body.projectId) : null;
  if (!project || project.ownerEmail !== user.email) project = newProject(user.email, { idea, style, voiceId, lang });
  else project.input = { idea, style, voiceId, lang };

  project.title = script.title;
  project.scenes = script.scenes.map((s, i) => {
    const scene = newScene(i);
    scene.narration = s.narration;
    scene.caption = s.caption;
    scene.visualDescription = s.visualDescription;
    scene.durationSec = s.durationSec;
    return scene;
  });
  project.status = "script";
  await saveProject(env, project);

  return json({ ok: true, project, balance: gate.owner ? null : gate.balance }, 200);
}

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "POST, OPTIONS", "Access-Control-Allow-Headers": "Content-Type" } });
}
