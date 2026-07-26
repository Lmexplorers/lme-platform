/**
 * LME whiteboard-video-motor  (Express + Remotion)
 *
 * Flyt:
 *   1) Ta imot et manus (ferdig voiceover-tekst) + valgfri voiceId.
 *   2) ElevenLabs "with-timestamps": lag MP3 + tegn-tidsstempler per tegn,
 *      som vi grupperer til ord-tidsstempler.
 *   3) DALL-E 3: lag en enkel svart/hvit whiteboard-skisse av temaet.
 *   4) Remotion: rendre en MP4 der teksten skrives fram og bildet avdekkes,
 *      med en hand som "tegner", i takt med stemmen.
 *
 *   POST /api/generer-whiteboard   { manus, voiceId?, tema? }
 *        -> { success, videoUrl, videoPath, durationSeconds }
 *
 * Krever i .env:  OPENAI_API_KEY, ELEVENLABS_API_KEY
 * Valgfritt:      PORT (3000), PUBLIC_BASE_URL, ELEVENLABS_VOICE_ID,
 *                 ELEVENLABS_MODEL_ID, OPENAI_IMAGE_MODEL
 */

import express from "express";
import dotenv from "dotenv";
import { OpenAI } from "openai";
import { bundle } from "@remotion/bundler";
import { selectComposition, renderMedia, ensureBrowser } from "@remotion/renderer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT || 3000);
// URL-en Remotion (hodeløs Chrome) bruker for å hente lyd/bilde lokalt.
const RENDER_BASE = `http://127.0.0.1:${PORT}`;
// URL-en klienten får tilbake (kan være et offentlig domene).
const PUBLIC_BASE = (process.env.PUBLIC_BASE_URL || RENDER_BASE).replace(/\/$/, "");

const PUBLIC_DIR = path.resolve(__dirname, "public");
const OUTPUT_DIR = path.resolve(__dirname, "output");
for (const d of [PUBLIC_DIR, OUTPUT_DIR]) if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });

// Robust nøkkel-oppslag: godtar den riktige skrivemåten OG vanlige skrivefeil
// (f.eks. "APT" i stedet for "API"), så et lite uhell i miljøvariablene ikke
// stopper motoren.
function pickEnv(...names) {
  for (const n of names) {
    const v = process.env[n];
    if (v && String(v).trim()) return String(v).trim();
  }
  return "";
}
const OPENAI_KEY = pickEnv("OPENAI_API_KEY", "OPENAI_APT_KEY", "OPENAI_APT_KE", "OPENAI_KEY");
const ELEVENLABS_API_KEY = pickEnv("ELEVENLABS_API_KEY", "ELEVENLABS_APT_KEY", "ELEVENLABS_APT_KE", "ELEVENLABS_KEY");
const VOICE_FROM_ENV = pickEnv("ELEVENLABS_VOICE_ID", "ELEVEN_VOICE_ID");

if (!OPENAI_KEY) console.warn("[advarsel] OpenAI-nøkkel mangler (OPENAI_API_KEY).");
if (!ELEVENLABS_API_KEY) console.warn("[advarsel] ElevenLabs-nøkkel mangler (ELEVENLABS_API_KEY).");

const openai = new OpenAI({ apiKey: OPENAI_KEY });
const DEFAULT_VOICE = VOICE_FROM_ENV || "21m00Tcm4TlvDq8ikWAM"; // Rachel (multilingual)
const ELEVEN_MODEL = process.env.ELEVENLABS_MODEL_ID || "eleven_multilingual_v2";
const IMAGE_MODEL = process.env.OPENAI_IMAGE_MODEL || "dall-e-3";

const app = express();
app.use(express.json({ limit: "1mb" }));
app.use("/public", express.static(PUBLIC_DIR));
app.use("/output", express.static(OUTPUT_DIR));
app.get("/", (_req, res) => res.json({ ok: true, service: "whiteboard-video-motor" }));

/* ---------- Remotion-bundle (bygges én gang, gjenbrukes) ---------- */
let serveUrlPromise = null;
function getServeUrl() {
  if (!serveUrlPromise) {
    console.log("Bygger Remotion-bundle (én gang)...");
    serveUrlPromise = bundle({
      entryPoint: path.resolve(__dirname, "video/Root.tsx"),
      // Ingen webpack-override trengs; Remotion håndterer TSX selv.
    }).then((url) => {
      console.log("Remotion-bundle klar.");
      return url;
    });
  }
  return serveUrlPromise;
}

/* ---------- Hjelpere ---------- */

// Grupperer ElevenLabs sin tegn-alignment til ord-tidsstempler.
function buildWordTimestamps(alignment) {
  const chars = alignment && alignment.characters;
  const starts = alignment && alignment.character_start_times_seconds;
  const ends = alignment && alignment.character_end_times_seconds;
  if (!Array.isArray(chars) || !Array.isArray(starts) || !Array.isArray(ends)) return [];
  const words = [];
  let cur = null;
  for (let i = 0; i < chars.length; i++) {
    const ch = chars[i];
    const isSpace = /\s/.test(ch);
    if (isSpace) {
      if (cur) { words.push(cur); cur = null; }
      continue;
    }
    if (!cur) cur = { word: "", start: starts[i], end: ends[i] };
    cur.word += ch;
    cur.end = ends[i];
  }
  if (cur) words.push(cur);
  return words;
}

async function saveBufferToPublic(buffer, filename) {
  const p = path.resolve(PUBLIC_DIR, filename);
  await fs.promises.writeFile(p, buffer);
  return filename;
}

// 1) DALL-E 3 -> lokal PNG (b64 unngår URL-utløp og CORS under rendring).
async function lagWhiteboardBilde(temaTekst) {
  const prompt =
    "Simple black ink line-art icon on a pure white background, single clear subject: " +
    String(temaTekst || "").slice(0, 180) +
    ". Clean hand-drawn whiteboard sketch style, thick even strokes, no shading, no gradients, " +
    "no text, centered, lots of white space, friendly and educational.";
  const img = await openai.images.generate({
    model: IMAGE_MODEL,
    prompt,
    n: 1,
    size: "1024x1024",
    response_format: "b64_json",
  });
  const b64 = img && img.data && img.data[0] && img.data[0].b64_json;
  if (!b64) throw new Error("DALL-E ga ingen bildedata.");
  const filename = await saveBufferToPublic(Buffer.from(b64, "base64"), `img_${Date.now()}.png`);
  return `/public/${filename}`;
}

// 2) ElevenLabs with-timestamps -> lokal MP3 + ord-tidsstempler.
async function lagLydMedTidsstempler(manus, voiceId) {
  const url =
    "https://api.elevenlabs.io/v1/text-to-speech/" +
    encodeURIComponent(voiceId || DEFAULT_VOICE) +
    "/with-timestamps";
  const r = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "xi-api-key": ELEVENLABS_API_KEY,
      Accept: "application/json",
    },
    body: JSON.stringify({
      text: manus,
      model_id: ELEVEN_MODEL,
      voice_settings: { stability: 0.5, similarity_boost: 0.75 },
    }),
  });
  if (!r.ok) {
    const detalj = await r.text().catch(() => "");
    throw new Error(`ElevenLabs feilet (${r.status}): ${detalj.slice(0, 300)}`);
  }
  const data = await r.json();
  if (!data.audio_base64) throw new Error("ElevenLabs ga ingen lyd (audio_base64 mangler).");
  const filename = await saveBufferToPublic(Buffer.from(data.audio_base64, "base64"), `audio_${Date.now()}.mp3`);
  const words = buildWordTimestamps(data.alignment);
  return { audioPath: `/public/${filename}`, words };
}

/* ---------- Endepunkt ---------- */
app.post("/api/generer-whiteboard", async (req, res) => {
  const t0 = Date.now();
  try {
    const { manus, voiceId, tema } = req.body || {};
    if (!manus || typeof manus !== "string" || !manus.trim()) {
      return res.status(400).json({ error: "Manus mangler i forespørselen." });
    }
    if (!OPENAI_KEY || !ELEVENLABS_API_KEY) {
      return res.status(500).json({ error: "Server mangler OpenAI- eller ElevenLabs-nøkkel (miljøvariabler)." });
    }

    console.log("1/4  Lyd + tidsstempler (ElevenLabs)...");
    const { audioPath, words } = await lagLydMedTidsstempler(manus.trim(), voiceId);
    if (!words.length) throw new Error("Fant ingen ord-tidsstempler fra ElevenLabs.");

    console.log("2/4  Whiteboard-skisse (DALL-E 3)...");
    const imagePath = await lagWhiteboardBilde(tema || manus);

    console.log("3/4  Beregner tidslinje...");
    const fps = 30;
    const sisteSlutt = words[words.length - 1].end || 0;
    const totalVarighetSekunder = Math.max(3, sisteSlutt + 2); // 2 s haleklipp
    const totalFrames = Math.ceil(totalVarighetSekunder * fps);

    const inputProps = {
      audioUrl: RENDER_BASE + audioPath,
      imageUrl: RENDER_BASE + imagePath,
      textTimestamps: words,
      totalFrames,
      fps,
    };

    console.log(`4/4  Remotion-rendring (${totalVarighetSekunder.toFixed(1)} s)...`);
    const serveUrl = await getServeUrl();
    const composition = await selectComposition({ serveUrl, id: "WhiteboardComposition", inputProps });
    const outName = `video_${Date.now()}.mp4`;
    const outputLocation = path.resolve(OUTPUT_DIR, outName);
    await renderMedia({
      composition,
      serveUrl,
      codec: "h264",
      outputLocation,
      inputProps,
    });

    console.log(`Ferdig på ${((Date.now() - t0) / 1000).toFixed(1)} s.`);
    return res.status(200).json({
      success: true,
      videoUrl: `${PUBLIC_BASE}/output/${outName}`,
      videoPath: outputLocation,
      durationSeconds: Number(totalVarighetSekunder.toFixed(1)),
      words: words.length,
    });
  } catch (error) {
    console.error("Feil under prosesseringen:", error);
    return res.status(500).json({ error: String((error && error.message) || error) });
  }
});

app.listen(PORT, async () => {
  console.log(`Whiteboard-motor kjører på http://localhost:${PORT}`);
  try { await ensureBrowser(); console.log("Hodeløs Chrome klar."); }
  catch (e) { console.warn("Klarte ikke å forhåndslaste Chrome:", e && e.message); }
  // Forvarm Remotion-bundelen i bakgrunnen, så første video går raskere.
  getServeUrl().catch((e) => console.warn("Bundle-forvarming feilet:", e && e.message));
});
