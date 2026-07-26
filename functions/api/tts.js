/**
 * LME tekst-til-tale — Cloudflare Pages Function.
 *
 *   POST /api/tts   { text, lang }   -> audio/mpeg (MP3)
 *
 * Brukes av Forklaringsvideo til å lese inn forklaringen scene for scene.
 * Gjenbruker samme stemme-oppsett som podkasten: ElevenLabs (forteller-
 * stemmen) hvis satt, ellers OpenAI TTS. Krever innlogget bruker.
 */

import { sessionUser } from "../_lib/access.js";

const CALL_TIMEOUT_MS = 20000;

function j(data, status) {
  return new Response(JSON.stringify(data), {
    status: status || 200,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

async function timedFetch(url, opts) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), CALL_TIMEOUT_MS);
  try { return await fetch(url, { ...opts, signal: ctrl.signal }); }
  finally { clearTimeout(timer); }
}

export async function onRequestPost(context) {
  const { request, env } = context;
  const user = await sessionUser(context);
  if (!user) return j({ error: "login_required" }, 401);

  let body;
  try { body = await request.json(); } catch { return j({ error: "bad_json" }, 400); }
  const text = String(body.text || "").replace(/\s+/g, " ").trim().slice(0, 1200);
  const lang = body.lang === "en" ? "en" : "no";
  if (!text) return j({ error: "empty" }, 400);

  const audioHeaders = { "Content-Type": "audio/mpeg", "Cache-Control": "no-store", "Access-Control-Allow-Origin": "*" };

  try {
    // 1) ElevenLabs (forteller-stemmen), hvis konfigurert.
    const voiceId = env.ELEVENLABS_VOICE_NARRATOR || env.ELEVENLABS_VOICE_ID;
    if (env.ELEVENLABS_API_KEY && voiceId) {
      const r = await timedFetch("https://api.elevenlabs.io/v1/text-to-speech/" + voiceId, {
        method: "POST",
        headers: { "xi-api-key": env.ELEVENLABS_API_KEY, "Content-Type": "application/json", "Accept": "audio/mpeg" },
        body: JSON.stringify({
          text: text,
          model_id: env.ELEVENLABS_MODEL_ID || "eleven_multilingual_v2",
          voice_settings: { stability: 0.5, similarity_boost: 0.75 },
        }),
      });
      if (r.ok) return new Response(await r.arrayBuffer(), { status: 200, headers: audioHeaders });
      // Faller videre til OpenAI hvis ElevenLabs feiler (f.eks. tom kvote).
    }

    // 2) OpenAI TTS som reserve.
    if (env.OPENAI_API_KEY) {
      const model = env.OPENAI_TTS_MODEL || "gpt-4o-mini-tts";
      const payload = { model: model, voice: env.OPENAI_TTS_VOICE || "shimmer", input: text, response_format: "mp3" };
      if (/gpt-4o/.test(model)) {
        payload.instructions = lang === "no"
          ? "Les teksten rolig, varmt og tydelig på naturlig norsk bokmål, som en vennlig lærer."
          : "Read the text calmly, warmly and clearly in natural English, like a friendly teacher.";
      }
      const r = await timedFetch("https://api.openai.com/v1/audio/speech", {
        method: "POST",
        headers: { "Authorization": "Bearer " + env.OPENAI_API_KEY, "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (r.ok) return new Response(await r.arrayBuffer(), { status: 200, headers: audioHeaders });
      const t = await r.text();
      return j({ error: "tts_failed", detail: (t || "").slice(0, 200) }, 200);
    }

    return j({ error: "not_configured" }, 200);
  } catch (e) {
    return j({ error: "tts_error", detail: String((e && e.message) || e).slice(0, 120) }, 200);
  }
}
