/**
 * Mia & Teo Video Creator, Story/Director AI.
 *
 * Turns one idea into a complete structured episode: concept, title,
 * learning objective, scenes, shots (camera/action/expression/dialogue),
 * viewer-interaction moments and an educational block, following the
 * story-structure template for the chosen video type (spec §6). Uses
 * Claude (functions/_lib/miateo-providers.js textGenerateJSON), with the
 * locked Mia & Teo character bible injected into every shot's visual intent
 * so downstream keyframe prompts stay consistent from the very first draft.
 *
 * POST /api/miateo/story
 *   { idea, ageBand, lang, videoType, length, projectId?, confirm }
 *
 *   confirm !== true  -> DRY RUN, no API call, no cost.
 *     -> { paid:true, provider, estimatedCost, systemPrompt, userPrompt }
 *
 *   confirm === true  -> real Claude call (costs money).
 *     -> { ok:true, project }   or   { error }
 *
 * Owner-only (functions/_lib/miateo-access.js), matching the rest of the
 * owner-run no-code builders (mia-teo-studio, kursbygger, gruppebygger).
 */
import { requireOwner } from "../../_lib/miateo-access.js";
import { textGenerateJSON, estimateTextCost, textProviderConfigured } from "../../_lib/miateo-providers.js";
import { MASTER_PROMPT, AGE_BANDS, DEFAULT_AGE_BAND } from "../../_lib/miateo-bible.js";
import {
  newProject, newScene, newShot, saveProject, readProject,
  VIDEO_TYPES, LENGTHS,
} from "../../_lib/miateo-store.js";

function json(data, status) {
  return new Response(JSON.stringify(data), {
    status: status || 200,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

// Story-structure beats per video type, spec §6. Given verbatim to Claude so
// every episode actually follows a real dramatic shape instead of one
// generic "AI lesson" formula.
const STRUCTURES = {
  adventure: "Hook, discovery, journey, challenge, learning through exploration, solution, ending.",
  mystery: "Something strange happens, Mia & Teo investigate, clues, the viewer guesses, a new clue, solution, explanation.",
  "learn-discover": "Big question, exploration, examples, visual demonstration, a surprising fact, a mini challenge, conclusion.",
  "what-if": "An impossible question, prediction, explore the consequences, science/facts, a surprising outcome, conclusion.",
  quiz: "Question, visual clues, thinking time, Mia/Teo guesses, reveal, explanation.",
  experiment: "Question, prediction, materials, experiment, observation, explanation, safe takeaway.",
  story: "Strong opening, character goal, problem, journey, emotional/educational discovery, resolution.",
  science: "Big question, exploration, examples, visual demonstration, a surprising fact, a mini challenge, conclusion.",
  nature: "Hook, discovery, journey, challenge, learning through exploration, solution, ending.",
  animals: "Hook, discovery, journey, challenge, learning through exploration, solution, ending.",
  space: "Big question, exploration, examples, visual demonstration, a surprising fact, a mini challenge, conclusion.",
  geography: "Hook, discovery, journey, challenge, learning through exploration, solution, ending.",
  history: "Strong opening, character goal, problem, journey, emotional/educational discovery, resolution.",
  math: "Question, visual clues, thinking time, Mia/Teo guesses, reveal, explanation.",
  language: "Big question, exploration, examples, visual demonstration, a surprising fact, a mini challenge, conclusion.",
  creative: "Strong opening, character goal, problem, journey, emotional/educational discovery, resolution.",
};

const SCENE_COUNT_BY_LENGTH = { short: 3, "2-3": 4, "4-5": 5, "6-8": 6, "10plus": 8 };
const SHOTS_PER_SCENE = 3;

function buildPrompts(input) {
  const structure = STRUCTURES[input.videoType] || STRUCTURES.adventure;
  const sceneCount = SCENE_COUNT_BY_LENGTH[input.length] || 5;
  const ageInfo = AGE_BANDS[input.ageBand] || AGE_BANDS[DEFAULT_AGE_BAND];

  const sys =
    "You are the writer, director, storyboard artist and educational designer for \"Mia & Teo Lek og Lær\", " +
    "an animated children's series from Little Montessori Explorers (LME). Mia and Teo are two fixed, already-" +
    "designed characters (do not redesign them, only stage them in the scene). " +
    "AUDIENCE: age band " + input.ageBand + ". " + ageInfo.note + " " +
    (input.ageBand === "6-9"
      ? "This age wants intelligent, cinematic, curious, adventurous storytelling. It must NOT feel babyish or slow."
      : "") + "\n\n" +
    "STORY STRUCTURE (follow this shape exactly, spread across " + sceneCount + " scenes): " + structure + "\n\n" +
    "STORY FIRST, LEARNING INSIDE THE STORY: Mia and Teo discover, wonder, investigate, predict, ask questions, " +
    "solve problems and learn through experience. Never write a lesson with a story bolted on.\n\n" +
    "VIEWER PARTICIPATION: include natural moments where the viewer is invited to think or answer before Mia/Teo " +
    "does (e.g. \"What do you think is behind the door?\"), age-appropriate for " + input.ageBand + " (never toddler-" +
    "style for 6-9 and up).\n\n" +
    "SAFETY: strictly no sexual content, graphic violence, dangerous imitation, adult themes, frightening content " +
    "inappropriate for the age band, or real people.\n\n" +
    "EDUCATIONAL ACCURACY: do not invent facts. If unsure a statement is factually correct, avoid it rather than " +
    "guess. Use real, nameable Montessori Practical Life materials only if Practical Life appears (pouring, " +
    "spooning, washing, polishing, sweeping, food prep, dressing frames), never invented props. Do not force the " +
    "word Montessori into the dialogue.\n\n" +
    "VISUAL CONTINUITY: every shot needs continuityEvents whenever something changes that the NEXT shot must " +
    "remember (a character picks something up, the location changes, time of day changes, an object's state " +
    "changes). Be specific and consistent scene to scene.\n\n" +
    "Each shot's \"action\"/\"composition\" fields describe STAGING only (pose, what they do, where they stand), " +
    "never Mia or Teo's appearance, hair, face or clothing, that is fixed and supplied separately:\n" + MASTER_PROMPT + "\n\n" +
    "Write dialogue in short, natural lines a 3D-animated child character would actually say. Both Norwegian " +
    "(bokmål) and English for every line and every narration.\n\n" +
    "Return ONLY valid JSON (no markdown, no commentary) with EXACTLY this shape:\n" +
    "{\n" +
    '  "titleNo":"", "titleEn":"", "concept":"", "learningObjective":"", "centralQuestion":"", "hook":"",\n' +
    '  "arc":"", "conclusion":"", "nextEpisodeTease":"",\n' +
    '  "educational": {"learningArea":"","keyConcepts":[""],"vocabulary":[""],"skills":[""],"difficulty":"","takeaway":""},\n' +
    '  "scenes": [ {\n' +
    '    "title":"", "location":"", "timeOfDay":"", "weather":"", "learningTag":"",\n' +
    '    "shots": [ {\n' +
    '      "characters":["mia","teo"], "action":"", "expression":"", "composition":"", "cameraAngle":"",\n' +
    '      "cameraMovement":"", "lighting":"", "props":"", "durationSec":6,\n' +
    '      "dialogue":[{"speaker":"mia","no":"","en":""}], "narration":{"no":"","en":""},\n' +
    '      "sfx":[{"type":"","atSec":0}], "musicMood":"",\n' +
    '      "continuityEvents":[{"type":"holds","character":"mia","item":""}]\n' +
    "    } ]\n" +
    "  } ]\n" +
    "  , \"interactionMoments\": [ {\"afterSceneIndex\":0,\"no\":\"\",\"en\":\"\"} ]\n" +
    "}\n" +
    "Make exactly " + sceneCount + " scenes, " + SHOTS_PER_SCENE + " shots each, in order, telling one complete " +
    "episode following the structure above.";

  const usr =
    "Idea: " + input.idea + "\n" +
    "Age band: " + input.ageBand + "\n" +
    "Language priority: " + (input.lang === "en" ? "English" : "Norwegian (bokmål)") + " (write both regardless)\n" +
    "Video type: " + input.videoType + "\n" +
    "Target length: " + input.length + " minutes";

  return { sys, usr, sceneCount };
}

function sanitizeStoryOutput(raw, sceneCount) {
  if (!raw || !Array.isArray(raw.scenes) || !raw.scenes.length) return null;
  return {
    titleNo: String(raw.titleNo || "").slice(0, 140),
    titleEn: String(raw.titleEn || "").slice(0, 140),
    concept: String(raw.concept || "").slice(0, 600),
    learningObjective: String(raw.learningObjective || "").slice(0, 400),
    centralQuestion: String(raw.centralQuestion || "").slice(0, 300),
    hook: String(raw.hook || "").slice(0, 400),
    arc: String(raw.arc || "").slice(0, 1200),
    conclusion: String(raw.conclusion || "").slice(0, 400),
    nextEpisodeTease: String(raw.nextEpisodeTease || "").slice(0, 300),
    educational: {
      learningArea: String((raw.educational && raw.educational.learningArea) || "").slice(0, 80),
      keyConcepts: Array.isArray(raw.educational && raw.educational.keyConcepts) ? raw.educational.keyConcepts.slice(0, 8).map((s) => String(s).slice(0, 100)) : [],
      vocabulary: Array.isArray(raw.educational && raw.educational.vocabulary) ? raw.educational.vocabulary.slice(0, 12).map((s) => String(s).slice(0, 60)) : [],
      skills: Array.isArray(raw.educational && raw.educational.skills) ? raw.educational.skills.slice(0, 8).map((s) => String(s).slice(0, 80)) : [],
      difficulty: String((raw.educational && raw.educational.difficulty) || "").slice(0, 40),
      takeaway: String((raw.educational && raw.educational.takeaway) || "").slice(0, 300),
      factChecked: false,
    },
    scenes: raw.scenes.slice(0, sceneCount + 1),
    interactionMoments: Array.isArray(raw.interactionMoments) ? raw.interactionMoments.slice(0, 10) : [],
  };
}

function applyStoryToProject(project, story) {
  project.story = {
    titleNo: story.titleNo, titleEn: story.titleEn, concept: story.concept,
    learningObjective: story.learningObjective, centralQuestion: story.centralQuestion, hook: story.hook,
    arc: story.arc, conclusion: story.conclusion, nextEpisodeTease: story.nextEpisodeTease,
  };
  project.educational = story.educational;
  project.scenes = [];
  project.shots = [];
  story.scenes.forEach((rawScene, sceneIndex) => {
    const scene = newScene(sceneIndex);
    scene.title = String((rawScene && rawScene.title) || "").slice(0, 140);
    scene.location = String((rawScene && rawScene.location) || "").slice(0, 200);
    scene.timeOfDay = String((rawScene && rawScene.timeOfDay) || "").slice(0, 60);
    scene.weather = String((rawScene && rawScene.weather) || "").slice(0, 60);
    scene.learningTag = String((rawScene && rawScene.learningTag) || "").slice(0, 100);
    const rawShots = Array.isArray(rawScene && rawScene.shots) ? rawScene.shots : [];
    rawShots.forEach((rawShot, shotIndex) => {
      const shot = newShot(scene.id, shotIndex);
      shot.characters = Array.isArray(rawShot.characters) ? rawShot.characters.filter((c) => c === "mia" || c === "teo").slice(0, 2) : [];
      shot.location = scene.location;
      shot.action = String(rawShot.action || "").slice(0, 400);
      shot.expression = String(rawShot.expression || "").slice(0, 200);
      shot.composition = String(rawShot.composition || "").slice(0, 200);
      shot.cameraAngle = String(rawShot.cameraAngle || "").slice(0, 120);
      shot.cameraMovement = String(rawShot.cameraMovement || "").slice(0, 200);
      shot.lighting = String(rawShot.lighting || "").slice(0, 150);
      shot.props = String(rawShot.props || "").slice(0, 250);
      shot.durationSec = Math.min(20, Math.max(2, parseInt(rawShot.durationSec, 10) || 6));
      shot.dialogue = Array.isArray(rawShot.dialogue) ? rawShot.dialogue.slice(0, 6).map((d) => ({
        speaker: d && (d.speaker === "teo" ? "teo" : d.speaker === "mia" ? "mia" : "narrator"),
        no: String((d && d.no) || "").slice(0, 300), en: String((d && d.en) || "").slice(0, 300),
        audioAssetId: null, durationSec: null,
      })) : [];
      shot.narration = (rawShot.narration && (rawShot.narration.no || rawShot.narration.en))
        ? { no: String(rawShot.narration.no || "").slice(0, 300), en: String(rawShot.narration.en || "").slice(0, 300), audioAssetId: null, durationSec: null }
        : null;
      shot.sfx = Array.isArray(rawShot.sfx) ? rawShot.sfx.slice(0, 6).map((s) => ({ type: String((s && s.type) || "").slice(0, 40), atSec: Number((s && s.atSec) || 0) })) : [];
      shot.musicMood = String(rawShot.musicMood || "").slice(0, 80);
      shot.continuityEvents = Array.isArray(rawShot.continuityEvents) ? rawShot.continuityEvents.slice(0, 6).map((e) => ({
        type: String((e && e.type) || "").slice(0, 20), character: e && e.character === "teo" ? "teo" : "mia",
        item: String((e && e.item) || "").slice(0, 120), name: String((e && e.name) || "").slice(0, 120), value: String((e && e.value) || "").slice(0, 200),
      })) : [];
      scene.shots.push(shot.id);
      project.shots.push(shot);
    });
    project.scenes.push(scene);
  });
  project.status = "story";
}

export async function onRequestPost(context) {
  const { request, env } = context;
  const gate = await requireOwner(context);
  if (!gate.ok) return json({ error: gate.error }, gate.status);
  if (!env.BUILDER_KV) return json({ error: "not_configured" }, 200);

  let body;
  try { body = await request.json(); } catch (e) { return json({ error: "bad_json" }, 400); }

  const input = {
    idea: String(body.idea || "").slice(0, 600).trim(),
    ageBand: AGE_BANDS[body.ageBand] ? body.ageBand : DEFAULT_AGE_BAND,
    lang: body.lang === "en" ? "en" : "no",
    videoType: VIDEO_TYPES.includes(body.videoType) ? body.videoType : "adventure",
    length: LENGTHS.includes(body.length) ? body.length : "4-5",
  };
  if (!input.idea) return json({ error: "Skriv en idé for episoden." }, 400);

  const { sys, usr, sceneCount } = buildPrompts(input);
  const maxTokens = 4000 + sceneCount * SHOTS_PER_SCENE * 250;

  if (!body.confirm) {
    return json({
      paid: true,
      provider: "anthropic",
      ageBandTuned: !!AGE_BANDS[input.ageBand].tuned,
      estimatedCost: estimateTextCost(maxTokens),
      systemPrompt: sys,
      userPrompt: usr,
      note: "Dry run, no API call made. Resend with confirm:true to actually generate (costs money).",
    }, 200);
  }

  if (!textProviderConfigured(env)) return json({ error: "not_configured", detail: "ANTHROPIC_API_KEY mangler." }, 200);

  let project = body.projectId ? await readProject(env, body.projectId) : null;
  if (!project) project = newProject(input);
  else project.input = input;

  let raw;
  try {
    raw = await textGenerateJSON(env, { system: sys, user: usr, maxTokens });
  } catch (e) {
    return json({ error: "Klarte ikke å lage manuset.", detail: String((e && e.message) || e).slice(0, 200) }, 200);
  }
  const story = sanitizeStoryOutput(raw, sceneCount);
  if (!story) return json({ error: "Fikk et ugyldig manus tilbake. Prøv igjen." }, 200);

  applyStoryToProject(project, story);
  await saveProject(env, project);
  return json({ ok: true, project }, 200);
}

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "POST, OPTIONS", "Access-Control-Allow-Headers": "Content-Type" } });
}
