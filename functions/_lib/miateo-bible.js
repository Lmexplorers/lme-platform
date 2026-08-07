/**
 * Mia & Teo Video Creator, Character Bible.
 *
 * Single source of truth for how Mia and Teo look, sound and move. Every
 * generation call in the Video Creator pipeline (story, storyboard keyframe,
 * shot video, voice) imports from here instead of re-describing the
 * characters, so their identity can never drift between shots or episodes.
 *
 * The master prompt text below is copied VERBATIM from the "Fast utseende
 * (låst)" block in mia-teo-studio.html (#masterPrompt) and from
 * brand/master-creative-bible.md. Do not edit the wording here without
 * updating those two places too, and never let a generation prompt describe
 * Mia or Teo in different words: text alone misses the faces, which is why
 * REFERENCE_IMAGES exists (see buildKeyframePrompt / buildReferenceImageUrls).
 */

// ---------------------------------------------------------------------------
// Master prompt (verbatim from mia-teo-studio.html #masterPrompt)
// ---------------------------------------------------------------------------
export const MASTER_PROMPT =
  "3D Pixar / Disney style animated feature-film look, high-detail CGI, soft global illumination, warm natural colors, wholesome and calm children's educational mood, no on-screen text.\n\n" +
  "MIA (girl, ~5): golden-blonde hair in a high ponytail tied with a pink bow, big bright blue eyes with long lashes, round rosy cheeks, warm smile, rose-pink floral short-sleeve dress with a fabric belt, white ankle socks and pink sneakers, often carrying a small woven wicker basket with a white daisy. Curious and eager.\n\n" +
  "TEO (boy, ~5): tousled chestnut-brown hair, warm brown eyes, cheerful grin, yellow and pale-yellow horizontal-striped t-shirt, blue denim shorts, white socks and brown sneakers, an olive-green backpack and often binoculars around his neck. Playful and giggly.";

// Short form used where prompt budgets are tight (e.g. inside a video
// motion-prompt that already spends most of its length on the action).
// Kept in sync with functions/api/film-script.js MIA_TEO_LOOK.
export const MASTER_PROMPT_SHORT =
  "MIA: girl about 5-9, golden-blonde hair in a high ponytail with a pink bow, big blue eyes, rose-pink floral dress, white socks and pink sneakers. " +
  "TEO: boy about 5-9, tousled chestnut-brown hair, brown eyes, yellow striped t-shirt, blue denim shorts, olive-green backpack. " +
  "High-end 3D Pixar/Disney animated feature-film still, cinematic composition, soft volumetric lighting, warm and wholesome, child-friendly.";

// ---------------------------------------------------------------------------
// Structured character records (functions/api/image.js CHAR + brand bible)
// ---------------------------------------------------------------------------
export const CHARACTERS = {
  mia: {
    id: "mia",
    displayName: "Mia",
    age: "~5-9 (grows with content age band, see AGE_BANDS)",
    appearance: [
      "light blue eyes with long lashes",
      "golden-blonde hair in a high ponytail with a pink bow",
      "round rosy Pixar-style face, small button nose",
      "warm friendly smile",
    ],
    clothing: [
      "rose-pink floral short-sleeve dress with a fabric belt",
      "white ankle socks",
      "pink sneakers",
      "pink backpack (when carrying one)",
    ],
    accessories: ["small woven wicker basket with a white daisy (when relevant to the scene)"],
    personality: ["curious", "kind", "creative", "eager", "loves stories and learning"],
    movement: "quick, light, leans in first when something is interesting",
    typicalExpressions: ["wide-eyed wonder", "gentle concentration", "delighted surprise", "thoughtful head-tilt"],
    voiceEnvKeys: ["ELEVENLABS_VOICE_MIA", "ELEVENLABS_VOICE_ID"],
  },
  teo: {
    id: "teo",
    displayName: "Teo",
    age: "~5-9 (grows with content age band, see AGE_BANDS)",
    appearance: [
      "warm brown eyes",
      "tousled chestnut-brown hair",
      "round rosy Pixar-style face",
      "cheerful grin",
    ],
    clothing: [
      "yellow and pale-yellow horizontal-striped t-shirt",
      "blue denim shorts",
      "white socks and brown sneakers",
      "olive-green backpack",
    ],
    accessories: ["binoculars around the neck (in explorer scenes)"],
    personality: ["adventurous", "brave", "playful", "giggly", "loves discovering new things"],
    movement: "bouncy, hands-on, tries things himself before asking",
    typicalExpressions: ["big open-mouthed grin", "surprised eyebrows-up", "focused squint while investigating", "giggling"],
    voiceEnvKeys: ["ELEVENLABS_VOICE_TEO", "ELEVENLABS_VOICE_ID"],
  },
  narrator: {
    id: "narrator",
    displayName: "Forteller / Narrator",
    voiceEnvKeys: ["ELEVENLABS_VOICE_NARRATOR", "ELEVENLABS_VOICE_ID"],
  },
};

// Relationship rule (brand/master-creative-bible.md): best friends and
// adventure partners, never romantic. Always appended when both appear.
export const RELATIONSHIP_NOTE =
  "Mia and Teo are best friends and adventure partners exploring together, never romantic, never portrayed as boyfriend/girlfriend.";

// ---------------------------------------------------------------------------
// Reference images already approved in-repo (brand/README-STATUS.md).
// Served as ordinary static files by Cloudflare Pages, so an absolute URL is
// just origin + path. Passed as image-conditioning input wherever the
// selected provider supports reference images (see miateo-providers.js).
// ---------------------------------------------------------------------------
export const REFERENCE_IMAGES = {
  both: ["/brand/references/mia-teo-6-8-final.png"],
  expressions: ["/brand/references/mia-teo-expressions.png"],
};

export function referenceImageUrls(origin, kind) {
  const paths = REFERENCE_IMAGES[kind || "both"] || REFERENCE_IMAGES.both;
  return paths.map((p) => String(origin || "").replace(/\/$/, "") + p);
}

// ---------------------------------------------------------------------------
// Negative / avoid list (spec §11: things a generated shot must never show).
// Appended to every image and video generation prompt.
// ---------------------------------------------------------------------------
export const AVOID_LIST =
  "Avoid: morphing or changing faces, changing clothing between shots, extra or missing fingers, " +
  "characters changing age or height, disappearing or duplicated objects, duplicated characters, " +
  "random or jarring camera movement, visual flicker, inconsistent backgrounds, text or watermarks, " +
  "photorealism, real people.";

// Family-safety suffix appended to every video motion prompt (verbatim
// pattern from functions/api/video-studio.js SAFE_SUFFIX).
export const SAFE_SUFFIX =
  ", wholesome family-friendly children's animation, gentle and safe, no violence, no nudity, no real people";

// ---------------------------------------------------------------------------
// Age bands (spec §19). Only 6-9 is tuned for the first implementation; the
// others are placeholders so the data model and UI already carry the field,
// without pretending the prompts are actually age-differentiated yet.
// ---------------------------------------------------------------------------
export const AGE_BANDS = {
  "0-3": { label: "0-3", tuned: false, note: "Not yet tuned. See brand/mia-teo-age-progression-SKILL.md before building this band." },
  "3-6": { label: "3-6", tuned: false, note: "Not yet tuned. See brand/mia-teo-age-progression-SKILL.md before building this band." },
  "6-9": {
    label: "6-9", tuned: true,
    note: "First fully-tuned band. Intelligent, cinematic, curious, adventurous tone, never babyish. Real viewer-participation prompts, real story structure.",
  },
  "9-12": { label: "9-12", tuned: false, note: "Not yet tuned. See brand/mia-teo-age-progression-SKILL.md before building this band." },
  "12-16": { label: "12-16", tuned: false, note: "Not yet tuned. See brand/mia-teo-age-progression-SKILL.md before building this band." },
};

export const DEFAULT_AGE_BAND = "6-9";

// ---------------------------------------------------------------------------
// Which characters appear in a shot, by id list -> combined description.
// ---------------------------------------------------------------------------
export function charactersIn(shot) {
  const ids = Array.isArray(shot && shot.characters) ? shot.characters : [];
  return ids.map((id) => CHARACTERS[id]).filter(Boolean);
}

function describeCharacter(c) {
  return c.displayName + ": " + c.appearance.concat(c.clothing).join(", ") + ".";
}

/**
 * Build the full English image-generation prompt for one storyboard
 * keyframe. Always starts with MASTER_PROMPT so the character description
 * dominates, then the shot-specific composition, then continuity notes
 * (what a character is holding/wearing right now, carried over from a
 * previous shot), then the avoid-list.
 *
 * shot: { characters:[ids], location, action, expression, composition,
 *         cameraAngle, lighting, props }
 * continuityNote: string built by miateo-continuity.js, or "".
 */
export function buildKeyframePrompt(shot, continuityNote) {
  const parts = [MASTER_PROMPT];
  const chars = charactersIn(shot);
  if (chars.length === 2) parts.push(RELATIONSHIP_NOTE);
  const bits = [];
  if (shot && shot.location) bits.push("Location: " + shot.location + ".");
  if (shot && shot.action) bits.push("Action: " + shot.action + ".");
  if (shot && shot.expression) bits.push("Expression: " + shot.expression + ".");
  if (shot && shot.composition) bits.push("Composition: " + shot.composition + ".");
  if (shot && shot.cameraAngle) bits.push("Camera angle: " + shot.cameraAngle + ".");
  if (shot && shot.lighting) bits.push("Lighting: " + shot.lighting + ".");
  if (shot && shot.props) bits.push("Props/environment detail: " + shot.props + ".");
  if (bits.length) parts.push(bits.join(" "));
  if (continuityNote) parts.push("Continuity (must match the previous shot): " + continuityNote);
  parts.push(AVOID_LIST);
  return parts.join("\n\n").slice(0, 3500);
}

/**
 * Build the short English motion prompt for image-to-video generation of an
 * approved keyframe. Video providers charge by generation, not by prompt
 * length, so this stays compact: the keyframe image already carries the
 * character identity, this just describes the movement.
 */
export function buildMotionPrompt(shot, continuityNote) {
  const bits = [];
  if (shot && shot.action) bits.push(shot.action);
  if (shot && shot.cameraMovement) bits.push("Camera: " + shot.cameraMovement + ".");
  if (continuityNote) bits.push(continuityNote);
  const base = bits.join(" ").trim() || "Gentle cinematic camera movement, soft and calm.";
  return (base + SAFE_SUFFIX).slice(0, 900);
}

export function voiceIdFor(env, speakerId) {
  const c = CHARACTERS[String(speakerId || "").toLowerCase()] || CHARACTERS.narrator;
  for (const key of c.voiceEnvKeys) {
    if (env && env[key]) return env[key];
  }
  return null;
}
