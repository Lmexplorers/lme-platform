/**
 * Mia & Teo Video Creator, provider adapters.
 *
 * Real integrations against the same services already wired into LME
 * (see docs/mia-teo-video-creator.md, "capability table"). Nothing here is
 * mocked: every exported *Generate* function makes a genuine paid API call
 * when invoked. Because of that, NONE of them are ever called automatically.
 * Every route in functions/api/miateo/*.js that uses one of these requires
 * an explicit `confirm: true` in the request body; without it, the route
 * calls the matching estimate*() helper below and returns a dry-run preview
 * (exact prompt + a rough cost estimate) instead of touching the network.
 *
 * Swapping a provider later (Runway instead of Higgsfield, a different TTS
 * vendor, etc.) means editing this one file, per spec §O "Provider layer" —
 * nothing in functions/api/miateo/* talks to a vendor API directly.
 *
 * Cost estimates are deliberately conservative, rounded, and labelled as
 * ROUGH: exact pricing depends on your live account/plan/model choice and
 * changes over time. Always treat the number shown as "order of magnitude",
 * not an invoice, and check the provider dashboard for the real figure.
 */

import { logUsage, anthropicUnits } from "./ai-core/usage.js";

// Hver *Generate*-funksjon under logger forbruket sitt til AI Core
// (functions/_lib/ai-core/usage.js) etter at kallet er ferdig. Loggingen kan
// aldri kaste, og endrer ingenting i hva funksjonene returnerer. Det siste,
// valgfrie `meta`-argumentet bærer { email } slik at kostnaden kan knyttes
// til riktig bruker; utelates det, logges kallet uten e-post.
const APP = "mia-teo";

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
// TEXT / REASONING — Anthropic Claude (functions/api/film-script.js pattern)
// ===========================================================================

export const TEXT_PROVIDER = { id: "anthropic", label: "Anthropic Claude", model: "claude-sonnet-5", envKey: "ANTHROPIC_API_KEY" };

export function textProviderConfigured(env) {
  return !!(env && env.ANTHROPIC_API_KEY);
}

/** ROUGH estimate only: a story+storyboard call is typically a few thousand
 * output tokens. Real cost depends on your Anthropic plan/pricing tier. */
export function estimateTextCost(maxTokens) {
  const outTok = maxTokens || 4000;
  const roughUsd = (outTok / 1000) * 0.02; // order-of-magnitude placeholder
  return { provider: TEXT_PROVIDER.id, model: TEXT_PROVIDER.model, estimatedUsd: Math.round(roughUsd * 100) / 100, note: "Rough estimate, verify in your Anthropic console." };
}

/** PAID CALL. Returns parsed JSON from Claude, or throws. */
export async function textGenerateJSON(env, { system, user, maxTokens }, meta) {
  if (!env.ANTHROPIC_API_KEY) throw new Error("missing_anthropic_key");
  const t0 = Date.now();
  const res = await fetchTimeout("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-api-key": env.ANTHROPIC_API_KEY, "anthropic-version": "2023-06-01" },
    body: JSON.stringify({ model: TEXT_PROVIDER.model, max_tokens: maxTokens || 4000, system, messages: [{ role: "user", content: user }] }),
  }, 55000);
  const data = await res.json().catch(() => null);
  await logUsage(env, {
    app: APP, task: "text", modelId: TEXT_PROVIDER.model, email: (meta && meta.email) || "",
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
// IMAGE — storyboard keyframes. OpenAI primary, Gemini fallback (same chain
// as functions/api/image.js, self-contained here per the codebase's existing
// convention of each generation route owning its own image-gen call, see
// functions/api/youtube-video.js genSceneImage doing the same thing).
// ===========================================================================

export const IMAGE_PROVIDERS = [
  { id: "openai", label: "OpenAI Images", envKey: "OPENAI_API_KEY" },
  { id: "gemini", label: "Gemini (Nano Banana)", envKey: "GEMINI_API_KEY" },
];

export function imageProviderConfigured(env) {
  return !!(env && (env.OPENAI_API_KEY || env.IMAGE_API_KEY || env.GEMINI_API_KEY || env.GOOGLE_API_KEY));
}

/** ROUGH estimate only: verify in your OpenAI/Google billing dashboard. */
export function estimateImageCost() {
  return { estimatedUsd: 0.08, note: "Rough per-image estimate (OpenAI/Gemini image generation), verify in your billing dashboard." };
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

/** PAID CALL. size: "1536x1024" (16:9 keyframe, default) | "1024x1536" (9:16) | "1024x1024". */
export async function imageGenerateKeyframe(env, prompt, size, meta) {
  const sz = size || "1536x1024";
  const t0 = Date.now();
  let modelId = env.IMAGE_OPENAI_MODEL || env.IMAGE_MODEL || "gpt-image-1";
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
  return out; // { bytes, contentType }
}

// ===========================================================================
// VIDEO — image-to-video. Higgsfield dop-turbo (functions/api/video-studio.js
// pattern). Only image-to-video is available today; see docs for the
// reference-to-video / Runway-aggregator gap noted in the architecture report.
// ===========================================================================

export const VIDEO_PROVIDER = { id: "higgsfield", label: "Higgsfield (dop-turbo)", model: "dop-turbo" };
const HF_BASE = "https://platform.higgsfield.ai";
const HF_SUBMIT_PATH = "/v1/image2video/dop";

export function videoProviderConfigured(env) {
  return !!(env && env.HIGGSFIELD_API_KEY && env.HIGGSFIELD_SECRET);
}

/** ROUGH estimate only: LME already sells this as 1 prepaid "video credit"
 * via /kjop-kreditt; use that price as the real, authoritative figure. */
export function estimateVideoCost() {
  return { estimatedUsd: null, videoCredits: 1, note: "Priced as 1 video credit on /kjop-kreditt, the authoritative figure (this is not a separate estimate)." };
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

/** PAID CALL. imageUrl must be a publicly reachable https URL (the approved keyframe). */
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
// VOICE — ElevenLabs (functions/api/podcast/[[path]].js elevenTTS pattern),
// persistent Mia/Teo/Narrator voice IDs from miateo-bible.js voiceIdFor().
// ===========================================================================

export const VOICE_PROVIDER = { id: "elevenlabs", label: "ElevenLabs", model: "eleven_multilingual_v2" };

export function voiceProviderConfigured(env) {
  return !!(env && env.ELEVENLABS_API_KEY);
}

/** ROUGH estimate only, ElevenLabs bills per character and pricing varies
 * by plan; check your ElevenLabs account for the real per-character rate. */
export function estimateVoiceCost(text) {
  const chars = String(text || "").length;
  return { characters: chars, estimatedUsd: Math.round(chars * 0.00018 * 100) / 100, note: "Rough estimate, ElevenLabs bills per character on your plan, verify in your ElevenLabs account." };
}

// Turns a raw ElevenLabs failure into a message that actually tells the
// user what to do, instead of just "elevenlabs_401". Same idea as
// functions/api/youtube-video.js friendlyEngineError.
function friendlyElevenLabsError(status, bodyText) {
  const low = String(bodyText || "").toLowerCase();
  if (status === 401 || status === 402 || /quota|credit|payment|insufficient/i.test(low)) {
    return "ElevenLabs-kontoen har ikke nok kreditter eller mangler betaling. Fyll på hos ElevenLabs og prøv igjen.";
  }
  if (status === 429) {
    return "ElevenLabs er opptatt akkurat nå (for mange forespørsler). Vent litt og prøv igjen.";
  }
  if (status === 400 && /voice/i.test(low)) {
    return "Den valgte stemmen finnes ikke på ElevenLabs-kontoen din.";
  }
  return "Stemme-motoren (ElevenLabs) svarte med en feil (" + status + "). Prøv igjen om litt.";
}

/** PAID CALL. voiceId from miateo-bible.js voiceIdFor(env, speakerId). */
export async function voiceGenerateLine(env, text, voiceId, meta) {
  if (!env.ELEVENLABS_API_KEY || !voiceId) throw new Error("ElevenLabs-stemme mangler i oppsettet (ELEVENLABS_API_KEY / stemme-ID).");
  const t0 = Date.now();
  const spoken = String(text || "").slice(0, 600);
  const voiceModel = env.ELEVENLABS_MODEL_ID || VOICE_PROVIDER.model;
  const r = await fetchTimeout("https://api.elevenlabs.io/v1/text-to-speech/" + voiceId, {
    method: "POST",
    headers: { "xi-api-key": env.ELEVENLABS_API_KEY, "Content-Type": "application/json", Accept: "audio/mpeg" },
    body: JSON.stringify({ text: spoken, model_id: voiceModel, voice_settings: { stability: 0.45, similarity_boost: 0.8, style: 0.25 } }),
  }, 20000);
  await logUsage(env, {
    app: APP, task: "voice", modelId: voiceModel, email: (meta && meta.email) || "",
    units: { chars: spoken.length }, ms: Date.now() - t0,
    status: r.ok ? "ok" : "error", error: r.ok ? "" : "elevenlabs_" + r.status,
  });
  if (!r.ok) {
    const bodyText = await r.text().catch(() => "");
    throw new Error(friendlyElevenLabsError(r.status, bodyText));
  }
  const buf = await r.arrayBuffer();
  // Rough duration estimate (no ffprobe in Workers): ~150 wpm natural speech.
  const words = String(text || "").trim().split(/\s+/).filter(Boolean).length;
  const durationSec = Math.max(1, Math.round((words / 150) * 60 * 10) / 10);
  return { bytes: new Uint8Array(buf), contentType: "audio/mpeg", durationSecEstimate: durationSec };
}

// ===========================================================================
// Capability summary, for the UI to show what's live vs. not configured
// without leaking which env vars are set.
// ===========================================================================

export function providerStatus(env) {
  return {
    text: { provider: TEXT_PROVIDER.id, configured: textProviderConfigured(env) },
    image: { providers: IMAGE_PROVIDERS.map((p) => p.id), configured: imageProviderConfigured(env) },
    video: { provider: VIDEO_PROVIDER.id, configured: videoProviderConfigured(env) },
    voice: { provider: VOICE_PROVIDER.id, configured: voiceProviderConfigured(env) },
    lipSync: { provider: null, configured: false, note: "Not integrated yet, see docs (§ Infrastructure gaps)." },
    render: { provider: null, configured: false, note: "Not integrated yet, see docs (§ Infrastructure gaps)." },
  };
}
