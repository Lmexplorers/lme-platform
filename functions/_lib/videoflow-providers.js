/**
 * LME VideoFlow, provider adapters + credit-cost table.
 *
 * Same reuse philosophy as functions/_lib/miateo-providers.js (real calls
 * against the providers already wired into LME: Claude, OpenAI/Gemini,
 * ElevenLabs), kept as its own file rather than sharing code with the
 * Mia & Teo adapters, since VideoFlow has no character bible and prices
 * everything in VIDEOFLOW CREDITS (an internal currency, see
 * functions/_lib/videoflow-credits.js) instead of raw dollars.
 *
 * Every *Generate* function here is a real, paid call. Routes that use them
 * must debit credits (or dry-run without debiting) before calling, exactly
 * like the Mia & Teo routes require confirm:true before spending real money.
 */

function fetchTimeout(url, opts, ms) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), ms || 55000);
  return fetch(url, { ...opts, signal: ctrl.signal }).finally(() => clearTimeout(timer));
}

function b64ToBytes(b64) {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

// ===========================================================================
// CREDIT COSTS — VideoFlow's own currency, not dollars. Tuned so a typical
// 5-8 scene short video costs roughly 150-250 credits, i.e. a $8/mo, 2000
// credit plan covers roughly 8-13 short videos a month.
// ===========================================================================
export const CREDIT_COSTS = {
  script: 20,       // one Claude call for the whole project's scene list
  image: 15,         // one styled scene image
  voicePerChar: 0.08, // ElevenLabs, per character of the line being read
  voiceMin: 3,
};

export function estimateVoiceCredits(text) {
  const chars = String(text || "").length;
  return Math.max(CREDIT_COSTS.voiceMin, Math.ceil(chars * CREDIT_COSTS.voicePerChar));
}

// ===========================================================================
// TEXT / SCRIPT — Anthropic Claude
// ===========================================================================
export const TEXT_MODEL = "claude-sonnet-5";

export function textProviderConfigured(env) { return !!(env && env.ANTHROPIC_API_KEY); }

/** PAID CALL (CREDIT_COSTS.script). Returns parsed JSON from Claude, or throws. */
export async function textGenerateJSON(env, { system, user, maxTokens }) {
  if (!env.ANTHROPIC_API_KEY) throw new Error("missing_anthropic_key");
  const res = await fetchTimeout("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-api-key": env.ANTHROPIC_API_KEY, "anthropic-version": "2023-06-01" },
    body: JSON.stringify({ model: TEXT_MODEL, max_tokens: maxTokens || 3000, system, messages: [{ role: "user", content: user }] }),
  }, 55000);
  const data = await res.json().catch(() => null);
  if (!res.ok || !data) throw new Error("claude_" + res.status);
  const txt = Array.isArray(data.content) ? data.content.map((c) => c.text || "").join("") : "";
  let t = txt.trim().replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "").trim();
  try { return JSON.parse(t); } catch (e) {}
  const a = t.indexOf("{"), b = t.lastIndexOf("}");
  if (a >= 0 && b > a) { try { return JSON.parse(t.slice(a, b + 1)); } catch (e) {} }
  throw new Error("bad_model_output");
}

// ===========================================================================
// IMAGE — styled scene image. OpenAI primary, Gemini fallback.
// ===========================================================================
export function imageProviderConfigured(env) {
  return !!(env && (env.OPENAI_API_KEY || env.IMAGE_API_KEY || env.GEMINI_API_KEY || env.GOOGLE_API_KEY));
}

async function genOpenAIImage(env, prompt, size) {
  const key = env.OPENAI_API_KEY || env.IMAGE_OPENAI_KEY || env.IMAGE_API_KEY;
  if (!key) return { error: "missing_openai_key" };
  const base = (env.IMAGE_OPENAI_BASE || env.IMAGE_API_BASE || "https://api.openai.com/v1").replace(/\/$/, "");
  const model = env.IMAGE_OPENAI_MODEL || env.IMAGE_MODEL || "gpt-image-1";
  const r = await fetchTimeout(base + "/images/generations", {
    method: "POST",
    headers: { Authorization: "Bearer " + key, "Content-Type": "application/json" },
    body: JSON.stringify({ model, prompt, size, n: 1 }),
  }, 55000);
  if (!r.ok) return { error: "openai_" + r.status, detail: (await r.text()).slice(0, 300) };
  const data = await r.json();
  const item = data && data.data && data.data[0];
  if (item && item.b64_json) return { bytes: b64ToBytes(item.b64_json), contentType: "image/png" };
  if (item && item.url) {
    const ir = await fetchTimeout(item.url, {}, 30000);
    return { bytes: new Uint8Array(await ir.arrayBuffer()), contentType: ir.headers.get("Content-Type") || "image/png" };
  }
  return { error: "openai_no_image" };
}

async function genGeminiImage(env, prompt, size) {
  const key = env.GEMINI_API_KEY || env.GOOGLE_API_KEY || env.GOOGLE_GEMINI_API_KEY;
  if (!key) return { error: "missing_gemini_key" };
  const model = env.GEMINI_IMAGE_MODEL || "gemini-2.5-flash-image";
  const aspect = size === "1024x1536" ? "2:3" : size === "1536x1024" ? "16:9" : "1:1";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(key)}`;
  const r = await fetchTimeout(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contents: [{ role: "user", parts: [{ text: prompt }] }], generationConfig: { responseModalities: ["IMAGE"], imageConfig: { aspectRatio: aspect } } }),
  }, 55000);
  if (!r.ok) return { error: "gemini_" + r.status, detail: (await r.text()).slice(0, 300) };
  const data = await r.json();
  const parts = (((data.candidates || [])[0] || {}).content || {}).parts || [];
  const img = parts.find((p) => p && p.inlineData && p.inlineData.data);
  if (img) return { bytes: b64ToBytes(img.inlineData.data), contentType: img.inlineData.mimeType || "image/png" };
  return { error: "gemini_no_image" };
}

/** PAID CALL (CREDIT_COSTS.image). size defaults to 16:9. */
export async function imageGenerateScene(env, prompt, size) {
  const sz = size || "1536x1024";
  let out = await genOpenAIImage(env, prompt, sz);
  if (out.error) out = await genGeminiImage(env, prompt, sz);
  if (out.error) throw new Error(out.error);
  return out;
}

// ===========================================================================
// VOICE — ElevenLabs, with-timestamps (needed for the karaoke captions).
// Curated set of well-known default ElevenLabs premade voices so there's a
// real picker without requiring new per-voice secrets. Falls back to
// ELEVENLABS_VOICE_ID (already set for the rest of the platform) if the
// account's library differs. Verify these IDs are available on your
// ElevenLabs plan before relying on a specific one.
// ===========================================================================
export const VOICES = [
  { id: "21m00Tcm4TlvDq8ikWAM", label: "Rachel (kvinne, rolig)" },
  { id: "pNInz6obpgDQGcFmaJgB", label: "Adam (mann, dyp)" },
  { id: "EXAVITQu4vr4xnSDxMaL", label: "Bella (kvinne, varm)" },
  { id: "ErXwobaYiN019PkySvjV", label: "Antoni (mann, vennlig)" },
];
export const DEFAULT_VOICE_ID = VOICES[0].id;

export function voiceProviderConfigured(env) { return !!(env && env.ELEVENLABS_API_KEY); }

/** Groups ElevenLabs character-level alignment into word-level timestamps. */
function buildWordTimestamps(alignment) {
  const chars = alignment && alignment.characters;
  const starts = alignment && alignment.character_start_times_seconds;
  const ends = alignment && alignment.character_end_times_seconds;
  if (!Array.isArray(chars) || !Array.isArray(starts) || !Array.isArray(ends)) return [];
  const words = [];
  let cur = null;
  for (let i = 0; i < chars.length; i++) {
    const ch = chars[i];
    if (/\s/.test(ch)) { if (cur) { words.push(cur); cur = null; } continue; }
    if (!cur) cur = { word: "", start: starts[i], end: ends[i] };
    cur.word += ch; cur.end = ends[i];
  }
  if (cur) words.push(cur);
  return words;
}

/** PAID CALL (estimateVoiceCredits(text)). Returns {bytes, contentType, words, durationSec}. */
export async function voiceGenerateLine(env, text, voiceId, lang) {
  if (!env.ELEVENLABS_API_KEY) throw new Error("missing_elevenlabs_key");
  const vid = voiceId || env.ELEVENLABS_VOICE_ID || DEFAULT_VOICE_ID;
  const r = await fetchTimeout("https://api.elevenlabs.io/v1/text-to-speech/" + encodeURIComponent(vid) + "/with-timestamps", {
    method: "POST",
    headers: { "xi-api-key": env.ELEVENLABS_API_KEY, "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ text: String(text || "").slice(0, 900), model_id: env.ELEVENLABS_MODEL_ID || "eleven_turbo_v2_5", language_code: lang === "no" ? "no" : "en", voice_settings: { stability: 0.5, similarity_boost: 0.75 } }),
  }, 30000);
  if (!r.ok) throw new Error("elevenlabs_" + r.status);
  const data = await r.json();
  if (!data.audio_base64) throw new Error("elevenlabs_no_audio");
  const words = buildWordTimestamps(data.alignment);
  const durationSec = words.length ? (words[words.length - 1].end || 0) : Math.max(1, String(text || "").split(/\s+/).length / 2.5);
  return { bytes: b64ToBytes(data.audio_base64), contentType: "audio/mpeg", words, durationSec };
}

export function providerStatus(env) {
  return {
    text: { configured: textProviderConfigured(env) },
    image: { configured: imageProviderConfigured(env) },
    voice: { configured: voiceProviderConfigured(env) },
  };
}
