/**
 * Mia & Teo Video Creator, quality control (spec §28).
 *
 * Free, rule-based, no AI call. Runs the checks that CAN honestly be done
 * with plain code today, and says so explicitly for the ones that can't
 * (visual anatomy/character-drift detection needs a vision model pass,
 * which is not implemented yet, see docs/mia-teo-video-creator.md).
 *
 * POST /api/miateo/qc   { projectId }
 *   -> { ok, issues:[ {shotId, severity:"error"|"warning", code, message} ] }
 *
 * Owner-only.
 */
import { requireOwner } from "../../_lib/miateo-access.js";
import { readProject } from "../../_lib/miateo-store.js";
import { computeContinuity } from "../../_lib/miateo-continuity.js";
import { AGE_BANDS } from "../../_lib/miateo-bible.js";

function json(data, status) {
  return new Response(JSON.stringify(data), {
    status: status || 200,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

// Same family-safety word list family as functions/api/video-studio.js
// BANNED, applied here to the WRITTEN script (dialogue/narration/action)
// rather than a generation prompt.
const UNSAFE_WORDS = [
  "nude", "naked", "nsfw", "sex", "sexual", "porn", "erotic", "fetish",
  "gore", "blood", "kill", "murder", "weapon", "gun", "knife", "violence",
  "naken", "vold", "blod", "drep", "våpen", "porno",
];

function hasUnsafe(text) {
  const t = " " + String(text || "").toLowerCase() + " ";
  return UNSAFE_WORDS.some((w) => t.indexOf(w) !== -1);
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

  const issues = [];
  const push = (shotId, severity, code, message) => issues.push({ shotId, severity, code, message });

  // AGE CHECK
  const ageInfo = AGE_BANDS[project.input.ageBand];
  if (!ageInfo || !ageInfo.tuned) {
    push(null, "warning", "age_not_tuned", "Aldersgruppen " + project.input.ageBand + " er ikke finjustert ennå (kun 6-9 er det foreløpig).");
  }

  // EDUCATIONAL CHECK
  if (!project.educational || !project.educational.factChecked) {
    push(null, "warning", "not_fact_checked", "Det pedagogiske innholdet er ikke markert som faktasjekket ennå.");
  }
  if (!project.educational || !project.educational.learningObjective) {
    push(null, "warning", "no_learning_objective", "Mangler et tydelig læringsmål.");
  }

  const { before } = computeContinuity(project);
  (project.shots || []).forEach((shot) => {
    // CHARACTER / STORYBOARD CHECK
    if (shot.characters && shot.characters.length && (!shot.keyframe || !shot.keyframe.assetUrl)) {
      push(shot.id, "error", "no_keyframe", "Shotet mangler et nøkkelbilde.");
    }
    if (shot.keyframe && shot.keyframe.assetUrl && !shot.keyframe.approved) {
      push(shot.id, "warning", "keyframe_not_approved", "Nøkkelbildet er laget, men ikke godkjent ennå.");
    }
    // DIALOGUE CHECK
    (shot.dialogue || []).forEach((line, i) => {
      if (!line.no && !line.en) push(shot.id, "error", "empty_dialogue", "Replikk " + (i + 1) + " mangler tekst.");
      else if (!line.no || !line.en) push(shot.id, "warning", "missing_translation", "Replikk " + (i + 1) + " mangler norsk eller engelsk versjon.");
      if (hasUnsafe(line.no) || hasUnsafe(line.en)) push(shot.id, "error", "unsafe_language", "Replikk " + (i + 1) + " inneholder ord som ikke passer i en barnevennlig app.");
    });
    if (hasUnsafe(shot.action)) push(shot.id, "error", "unsafe_action", "Handlingsbeskrivelsen inneholder ord som ikke passer i en barnevennlig app.");
    // CONTINUITY CHECK: a "drops" event for an item never established as held.
    const state = before.get(shot.id);
    (shot.continuityEvents || []).forEach((ev) => {
      if (ev.type === "drops" && state && !state.holding[ev.character].includes(ev.item)) {
        push(shot.id, "warning", "continuity_drop_unheld", (ev.character === "teo" ? "Teo" : "Mia") + " slipper \"" + ev.item + "\" i dette shotet, men holdt det ikke fra før. Sjekk kontinuiteten.");
      }
    });
    // ANATOMY / VISUAL-DRIFT CHECK: honestly not automatable yet.
    if (shot.keyframe && shot.keyframe.assetUrl) {
      push(shot.id, "info", "manual_visual_review", "Ingen automatisk bilde-QC (hender/ansikt/kontinuitet i selve bildet) er bygget ennå. Se bildet manuelt før godkjenning.");
    }
  });

  const hasErrors = issues.some((i) => i.severity === "error");
  return json({ ok: !hasErrors, issues }, 200);
}

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "POST, OPTIONS", "Access-Control-Allow-Headers": "Content-Type" } });
}
