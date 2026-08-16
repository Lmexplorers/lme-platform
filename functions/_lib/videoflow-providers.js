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

import { logUsage, anthropicUnits } from "./ai-core/usage.js";

// Hver *Generate*-funksjon under logger forbruket sitt til AI Core
// (functions/_lib/ai-core/usage.js) etter at kallet er ferdig. Loggingen kan
// aldri kaste, og endrer ingenting i hva funksjonene returnerer. Det siste,
// valgfrie `meta`-argumentet bærer { email } slik at kostnaden kan knyttes
// til riktig bruker; utelates det, logges kallet uten e-post.
const APP = "videoflow";

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
  transcribe: 15,     // one audio note transcribed into an idea (flat, max 3 min)
  // Premium tier (spec: "affordable baseline is stills, premium tier is
  // full moving footage"): animating one scene into an actual video clip
  // instead of a Ken Burns still. Priced 8x a still image, this is the
  // expensive ingredient real per-video-generator economics warn about.
  video: 120,
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
export async function textGenerateJSON(env, { system, user, maxTokens }, meta) {
  if (!env.ANTHROPIC_API_KEY) throw new Error("missing_anthropic_key");
  const t0 = Date.now();
  const res = await fetchTimeout("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-api-key": env.ANTHROPIC_API_KEY, "anthropic-version": "2023-06-01" },
    body: JSON.stringify({ model: TEXT_MODEL, max_tokens: maxTokens || 3000, system, messages: [{ role: "user", content: user }] }),
  }, 55000);
  const data = await res.json().catch(() => null);
  await logUsage(env, {
    app: APP, task: "text", modelId: TEXT_MODEL, email: (meta && meta.email) || "",
    units: anthropicUnits(data), ms: Date.now() - t0,
    status: res.ok && data ? "ok" : "error", error: res.ok ? "" : "claude_" + res.status,
  });
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
export async function imageGenerateScene(env, prompt, size, meta) {
  const sz = size || "1536x1024";
  const t0 = Date.now();
  const openaiModel = env.IMAGE_OPENAI_MODEL || env.IMAGE_MODEL || "gpt-image-1";
  let modelId = openaiModel;
  let out = await genOpenAIImage(env, prompt, sz);
  if (out.error) {
    modelId = env.GEMINI_IMAGE_MODEL || "gemini-2.5-flash-image";
    out = await genGeminiImage(env, prompt, sz);
  }
  await logUsage(env, {
    app: APP, task: "image", modelId: modelId, email: (meta && meta.email) || "",
    units: { images: 1 }, ms: Date.now() - t0,
    status: out.error ? "error" : "ok", error: out.error || "",
  });
  if (out.error) throw new Error(out.error);
  return out;
}

// ===========================================================================
// VIDEO — premium tier, animates a scene's already-generated image into a
// short clip via Higgsfield (dop-turbo), same engine and adapter shape as
// functions/_lib/miateo-providers.js, kept as its own copy here rather than
// a shared import (see this file's header: VideoFlow intentionally shares
// no code with the Mia & Teo adapters, so the two apps can evolve
// independently and neither can break the other by accident).
// ===========================================================================
export const VIDEO_PROVIDER = { id: "higgsfield", label: "Higgsfield (dop-turbo)", model: "dop-turbo" };
const HF_BASE = "https://platform.higgsfield.ai";
const HF_SUBMIT_PATH = "/v1/image2video/dop";

export function videoProviderConfigured(env) {
  return !!(env && env.HIGGSFIELD_API_KEY && env.HIGGSFIELD_SECRET);
}

function hfAuth(env) { return "Key " + env.HIGGSFIELD_API_KEY + ":" + env.HIGGSFIELD_SECRET; }

function findVideoUrl(o) {
  if (!o || typeof o !== "object") return null;
  if (o.video && o.video.url) return o.video.url;
  if (o.results && o.results.raw && o.results.raw.url) return o.results.raw.url;
  if (Array.isArray(o.jobs) && o.jobs[0]) {
    const j = o.jobs[0];
    if (j.results && j.results.raw && j.results.raw.url) return j.results.raw.url;
    if (j.result && j.result.url) return j.result.url;
    if (j.video && j.video.url) return j.video.url;
  }
  if (Array.isArray(o.results) && o.results[0] && o.results[0].url) return o.results[0].url;
  return null;
}
function findStatus(o) {
  if (!o || typeof o !== "object") return "";
  if (o.status) return String(o.status).toLowerCase();
  if (Array.isArray(o.jobs) && o.jobs[0] && o.jobs[0].status) return String(o.jobs[0].status).toLowerCase();
  return "";
}

/** PAID CALL (CREDIT_COSTS.video). imageUrl must be a publicly reachable https URL (the scene's generated image). */
export async function videoGenerateSubmit(env, imageUrl, motionPrompt, meta) {
  if (!videoProviderConfigured(env)) throw new Error("missing_higgsfield_keys");
  const t0 = Date.now();
  const r = await fetchTimeout(HF_BASE + HF_SUBMIT_PATH, {
    method: "POST",
    headers: { Authorization: hfAuth(env), "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ input: { model: VIDEO_PROVIDER.model, prompt: motionPrompt, input_images: [{ type: "image_url", image_url: imageUrl }] } }),
  }, 20000);
  const text = await r.text();
  let data; try { data = JSON.parse(text); } catch (e) { data = null; }
  await logUsage(env, {
    app: APP, task: "video", modelId: VIDEO_PROVIDER.model, email: (meta && meta.email) || "",
    units: { clips: 1 }, ms: Date.now() - t0,
    status: r.ok ? "ok" : "error", error: r.ok ? "" : "higgsfield_" + r.status,
  });
  if (!r.ok) throw new Error("higgsfield_" + r.status);
  const id = data && (data.request_id || data.id || data.generation_id || (Array.isArray(data.jobs) && data.jobs[0] && data.jobs[0].id));
  const statusUrl = data && (data.status_url || data.statusUrl);
  if (!id && !statusUrl) throw new Error("higgsfield_no_job");
  return { id: id || "", statusUrl: statusUrl || (id ? HF_BASE + HF_SUBMIT_PATH + "/requests/" + id : "") };
}

/** Poll only (free): checks status of an already-submitted job. */
export async function videoGeneratePoll(env, statusUrl) {
  let url = statusUrl;
  try { if (new URL(url).hostname !== "platform.higgsfield.ai") url = ""; } catch (e) { url = ""; }
  if (!url) throw new Error("bad_status_url");
  const r = await fetchTimeout(url, { headers: { Authorization: hfAuth(env), Accept: "application/json" } }, 20000);
  const text = await r.text();
  let data; try { data = JSON.parse(text); } catch (e) { data = null; }
  if (!r.ok) throw new Error("higgsfield_status_" + r.status);
  const status = findStatus(data) || "in_progress";
  const videoUrl = findVideoUrl(data);
  if (videoUrl) return { status: "completed", url: videoUrl };
  return { status };
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

// Turns a raw ElevenLabs failure (status + body, which is often opaque JSON)
// into a message that actually tells the user what to do, instead of just
// "elevenlabs_401". Same idea as functions/api/youtube-video.js
// friendlyEngineError, kept local here since the wording differs per app.
function friendlyElevenLabsError(status, bodyText) {
  const low = String(bodyText || "").toLowerCase();
  if (status === 401 || status === 402 || /quota|credit|payment|insufficient/i.test(low)) {
    return "ElevenLabs-kontoen har ikke nok kreditter eller mangler betaling. Fyll på hos ElevenLabs og prøv igjen.";
  }
  if (status === 429) {
    return "ElevenLabs er opptatt akkurat nå (for mange forespørsler). Vent litt og prøv igjen.";
  }
  if (status === 400 && /voice/i.test(low)) {
    return "Den valgte stemmen finnes ikke på ElevenLabs-kontoen din. Prøv en annen stemme.";
  }
  return "Stemme-motoren (ElevenLabs) svarte med en feil (" + status + "). Prøv igjen om litt.";
}

/** PAID CALL (estimateVoiceCredits(text)). Returns {bytes, contentType, words, durationSec}. */
export async function voiceGenerateLine(env, text, voiceId, lang, meta) {
  if (!env.ELEVENLABS_API_KEY) throw new Error("ElevenLabs-nøkkel mangler i oppsettet (ELEVENLABS_API_KEY).");
  const vid = voiceId || env.ELEVENLABS_VOICE_ID || DEFAULT_VOICE_ID;
  const t0 = Date.now();
  const spoken = String(text || "").slice(0, 900);
  const voiceModel = env.ELEVENLABS_MODEL_ID || "eleven_turbo_v2_5";
  const r = await fetchTimeout("https://api.elevenlabs.io/v1/text-to-speech/" + encodeURIComponent(vid) + "/with-timestamps", {
    method: "POST",
    headers: { "xi-api-key": env.ELEVENLABS_API_KEY, "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ text: spoken, model_id: voiceModel, language_code: lang === "no" ? "no" : "en", voice_settings: { stability: 0.5, similarity_boost: 0.75 } }),
  }, 30000);
  await logUsage(env, {
    app: APP, task: "voice", modelId: voiceModel, email: (meta && meta.email) || "",
    units: { chars: spoken.length }, ms: Date.now() - t0,
    status: r.ok ? "ok" : "error", error: r.ok ? "" : "elevenlabs_" + r.status,
  });
  if (!r.ok) {
    const bodyText = await r.text().catch(() => "");
    throw new Error(friendlyElevenLabsError(r.status, bodyText));
  }
  const data = await r.json();
  if (!data.audio_base64) throw new Error("elevenlabs_no_audio");
  const words = buildWordTimestamps(data.alignment);
  const durationSec = words.length ? (words[words.length - 1].end || 0) : Math.max(1, String(text || "").split(/\s+/).length / 2.5);
  return { bytes: b64ToBytes(data.audio_base64), contentType: "audio/mpeg", words, durationSec };
}

// ===========================================================================
// TRANSCRIBE — OpenAI Whisper, turns an uploaded/recorded audio note into
// the idea text, matching the tagline ("idea, text or audio"). Reuses
// OPENAI_API_KEY, no new secret.
// ===========================================================================
export function transcribeProviderConfigured(env) { return !!(env && env.OPENAI_API_KEY); }

/** PAID CALL (CREDIT_COSTS.transcribe). audioFile: a Blob/File from FormData. Returns transcript text. */
export async function transcribeAudio(env, audioFile, meta) {
  if (!env.OPENAI_API_KEY) throw new Error("missing_openai_key");
  const t0 = Date.now();
  const model = env.OPENAI_TRANSCRIBE_MODEL || "whisper-1";
  const fd = new FormData();
  fd.append("file", audioFile, audioFile.name || "note.webm");
  fd.append("model", model);
  const r = await fetchTimeout("https://api.openai.com/v1/audio/transcriptions", {
    method: "POST",
    headers: { Authorization: "Bearer " + env.OPENAI_API_KEY },
    body: fd,
  }, 60000);
  await logUsage(env, {
    app: APP, task: "transcribe", modelId: model, email: (meta && meta.email) || "",
    // Lydnoten er begrenset til 3 minutter i ruten, så det er taket vi priser mot.
    units: { minutes: 3 }, ms: Date.now() - t0,
    status: r.ok ? "ok" : "error", error: r.ok ? "" : "openai_transcribe_" + r.status,
  });
  if (!r.ok) throw new Error("openai_transcribe_" + r.status);
  const data = await r.json();
  if (!data.text) throw new Error("openai_transcribe_no_text");
  return String(data.text).slice(0, 2000);
}

export function providerStatus(env) {
  return {
    text: { configured: textProviderConfigured(env) },
    image: { configured: imageProviderConfigured(env) },
    voice: { configured: voiceProviderConfigured(env) },
    transcribe: { configured: transcribeProviderConfigured(env) },
    video: { configured: videoProviderConfigured(env) },
  };
}
