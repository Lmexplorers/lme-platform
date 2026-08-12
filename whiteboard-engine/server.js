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
 *        -> 202 { jobId }  (poll /api/whiteboard-status?id=)
 *
 * I tillegg: den ekte håndtegningen (Claude + Flow-arbeidsflyten, helautomatisk):
 *   POST /api/generer-veo   { scenes:[{imagePrompt,videoPrompt,narration}], lang }
 *        -> 202 { jobId }  (samme status-endepunkt)
 *   Nano Banana (Gemini) lager blyantskissen, Veo lar en hånd tegne den, og
 *   ElevenLabs legger på norsk stemme. Remotion setter klippene sammen.
 *
 * I tillegg: rimelig og rask "slideshow"-video for YouTube-appen, stillbilder
 * med Ken Burns-panorament i stedet for animerte Veo-klipp (ingen Veo, mye
 * raskere og billigere per scene):
 *   POST /api/generer-slideshow   { scenes:[{imageUrl|imagePrompt,narration,onScreenText?}], lang, aspect? }
 *        -> 202 { jobId }  (samme status-endepunkt)
 *
 * I tillegg: sluttsammenstilling for Mia & Teo Video Creator. Tar imot
 * FERDIGE shot-klipp (allerede animert av Higgsfield, se functions/api/
 * miateo/shot-video.js) og ferdig stemmelyd per replikk (ElevenLabs, se
 * functions/api/miateo/voice.js), og setter dem sammen til ÉN episode.
 * Ingen nye AI-kall her, bare Remotion-rendring på denne allerede kjørende
 * tjenesten:
 *   POST /api/generer-episode   { shots:[{videoUrl,durationSec,audio:[{url,startSec,durationSec}]}], aspect? }
 *        -> 202 { jobId }  (samme status-endepunkt)
 *
 * I tillegg: sluttsammenstilling for LME VideoFlow. Tar imot ferdige
 * scene-bilder (allerede stylede, se functions/api/videoflow/scene-image.js)
 * og ferdig stemmelyd + ord-tidsstempler per scene (ElevenLabs with-
 * timestamps, se functions/api/videoflow/scene-voice.js), og setter dem
 * sammen til én Ken Burns-video med karaoke-undertekster brent inn. Samme
 * "ingen nye AI-kall"-prinsipp som episode-ruten over:
 *   POST /api/generer-videoflow   { scenes:[{imageUrl,audioUrl,durationSec,words:[{word,start,end}]}], aspect? }
 *        -> 202 { jobId }  (samme status-endepunkt)
 *
 * Krever i .env:  OPENAI_API_KEY, ELEVENLABS_API_KEY
 *                 GEMINI_API_KEY (for /api/generer-veo: Nano Banana + Veo)
 * Valgfritt:      PORT (3000), PUBLIC_BASE_URL, ELEVENLABS_VOICE_ID,
 *                 ELEVENLABS_MODEL_ID, OPENAI_IMAGE_MODEL,
 *                 GEMINI_IMAGE_MODEL, VEO_MODEL, VEO_CLIP_SECONDS
 */

import express from "express";
import dotenv from "dotenv";
import { OpenAI } from "openai";
import { bundle } from "@remotion/bundler";
import { selectComposition, renderMedia, ensureBrowser } from "@remotion/renderer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import potrace from "potrace";
import { svgPathProperties } from "svg-path-properties";
import crypto from "crypto";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT || 3000);
// URL-en Remotion (hodeløs Chrome) bruker for å hente lyd/bilde lokalt.
const RENDER_BASE = `http://127.0.0.1:${PORT}`;
// URL-en klienten får tilbake (kan være et offentlig domene).
const PUBLIC_BASE = (process.env.PUBLIC_BASE_URL || RENDER_BASE).replace(/\/$/, "");

const PUBLIC_DIR = path.resolve(__dirname, "public");
const OUTPUT_DIR = path.resolve(__dirname, "output");
// Cache for ferdig-genererte, dyre delresultater (bilder, Veo-klipp, stemme).
// Nøkkel = hash av prompten, så samme scene gjenbrukes i stedet for å lages
// (og betales for) på nytt. Overlever prosess-omstart innen samme utrulling,
// så en jobb som ryker på siste steg kan kjøres om nesten gratis og raskt.
const CACHE_DIR = path.resolve(__dirname, "cache");
for (const d of [PUBLIC_DIR, OUTPUT_DIR, CACHE_DIR]) if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
const hashKey = (s) => crypto.createHash("sha1").update(String(s)).digest("hex").slice(0, 20);

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
const OPENAI_KEY = pickEnv("OPENAI_API_KEY", "OPENAI_API_KE", "OPENAI_APT_KEY", "OPENAI_APT_KE", "OPENAI_KEY");
const ELEVENLABS_API_KEY = pickEnv("ELEVENLABS_API_KEY", "ELEVENLABS_APT_KEY", "ELEVENLABS_APT_KE", "ELEVENLABS_KEY");
const VOICE_FROM_ENV = pickEnv("ELEVENLABS_VOICE_ID", "ELEVEN_VOICE_ID");

if (!OPENAI_KEY) console.warn("[advarsel] OpenAI-nøkkel mangler (OPENAI_API_KEY).");
if (!ELEVENLABS_API_KEY) console.warn("[advarsel] ElevenLabs-nøkkel mangler (ELEVENLABS_API_KEY).");

const openai = new OpenAI({ apiKey: OPENAI_KEY });
// Sikkerhet: hvis noen ved et uhell limte inn en API-nøkkel (sk_...) i
// voice-id-feltet, ignorer den og bruk en standardstemme i stedet.
const CLEAN_VOICE = (VOICE_FROM_ENV && !/^sk_/i.test(VOICE_FROM_ENV)) ? VOICE_FROM_ENV : "";
const DEFAULT_VOICE = CLEAN_VOICE || "21m00Tcm4TlvDq8ikWAM"; // Rachel (multilingual)
// Turbo v2.5 lar oss tvinge språket (language_code), så norsk tekst ikke blir
// lest med dansk uttale (norsk og dansk skrives nesten likt, og multilingual
// v2 gjetter ofte dansk). Kan overstyres med ELEVENLABS_MODEL_ID.
const ELEVEN_MODEL = process.env.ELEVENLABS_MODEL_ID || "eleven_turbo_v2_5";
const IMAGE_MODEL = process.env.OPENAI_IMAGE_MODEL || "gpt-image-1";

// Google-nøkkel for Nano Banana (Gemini-bilde) og Veo (video). Samme nøkkel som
// resten av plattformen bruker til Gemini. Godtar de vanlige navnene.
const GOOGLE_KEY = pickEnv("GEMINI_API_KEY", "GOOGLE_API_KEY", "GOOGLE_GEMINI_API_KEY", "GEMINI_APT_KEY");
// Nano Banana = gemini-2.5-flash-image. Nano Banana Pro (om nøkkelen har
// tilgang): sett GEMINI_IMAGE_MODEL=gemini-3-pro-image-preview.
const GEMINI_IMAGE_MODEL = process.env.GEMINI_IMAGE_MODEL || "gemini-2.5-flash-image";
// Veo-modell. Modellnavn varierer mellom kontoer og API-versjoner, så vi lar
// motoren oppdage en gyldig Veo-modell automatisk (se resolveVeoModel). Sett
// VEO_MODEL bare hvis du vil tvinge en bestemt modell.
const VEO_MODEL_ENV = (process.env.VEO_MODEL || "").trim();
// Antatt lengde på et Veo-klipp (sekunder). Brukes til å tilpasse scenelengden.
const CLIP_SECONDS = Number(process.env.VEO_CLIP_SECONDS || 8);

// Fast whiteboard-stil (samme som steg 3 på plattformen). Brukes bare som
// reserve hvis klienten ikke sender ferdige prompts.
const FLOW_IMG_STYLE = "hand-drawn black and white pencil sketch illustration, detailed ink line art, crosshatching shading, editorial illustration style, bold clean outlines, fine interior linework, textured sketch feel, on a pure white background, no color, no grayscale fills, monochrome ink drawing, whiteboard animation style, highly detailed hand-drawn artwork, vintage encyclopedia illustration aesthetic, expressive and slightly rough linework";
const FLOW_VIDEO_STYLE = "A real human hand holding a black pencil enters the frame from the right side and draws in real time on a plain pure white background, whiteboard animation style, the illustration appears stroke by stroke as the hand moves, detailed ink sketch linework, crosshatching shading technique, the hand reveals the drawing progressively, smooth and natural drawing motion, top-down or slight angle camera view, no color, monochrome black ink on white, clean white surface, educational explainer video style, cinematic close-up of hand and pencil tip, natural pencil scratching motion";
const flowImagePrompt = (subject) => (String(subject || "").trim() ? String(subject).trim() + ", " : "") + FLOW_IMG_STYLE;
const flowVideoPrompt = (subject) => (String(subject || "").trim() ? "The hand draws: " + String(subject).trim() + ".\n" : "") + FLOW_VIDEO_STYLE;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const app = express();
app.use(express.json({ limit: "1mb" }));
// CORS: la LME-plattformen (og forhåndsvisning) kalle motoren fra nettleseren.
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});
app.use("/public", express.static(PUBLIC_DIR));
app.use("/output", express.static(OUTPUT_DIR));
app.use("/cache", express.static(CACHE_DIR));
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
    "no text, centered, lots of white space, warm, friendly and child-friendly, educational. " +
    "Do NOT draw a Rubik's cube. If cubes or blocks are involved, draw simple soft-colored wooden " +
    "Montessori-style blocks (pastel pink, yellow, sky blue, calm), not a puzzle toy.";
  // Prøv flere bildemodeller til en virker: den nye gpt-image-1 først, saa
  // dall-e-3, saa dall-e-2 (som er tilgjengelig paa alle kontoer). Ulike
  // kontoer har ulik tilgang. Ikke send response_format (gpt-image-1 stoetter
  // det ikke); vi haandterer baade b64_json og url.
  const models = [];
  if (IMAGE_MODEL) models.push(IMAGE_MODEL);
  ["gpt-image-1", "dall-e-3", "dall-e-2"].forEach((m) => { if (models.indexOf(m) < 0) models.push(m); });
  let lastErr = null;
  for (const model of models) {
    try {
      const img = await openai.images.generate({ model, prompt, n: 1, size: "1024x1024" });
      const d = img && img.data && img.data[0];
      let buf = null;
      if (d && d.b64_json) buf = Buffer.from(d.b64_json, "base64");
      else if (d && d.url) { const r = await fetch(d.url); if (r.ok) buf = Buffer.from(await r.arrayBuffer()); }
      if (buf) {
        const filename = await saveBufferToPublic(buf, `img_${Date.now()}.png`);
        console.log("Bilde laget med modell:", model);
        return `/public/${filename}`;
      }
      lastErr = new Error("Ingen bildedata fra " + model);
    } catch (e) {
      lastErr = e;
      const msg = String((e && e.message) || e);
      // Gaa videre til neste modell ved modell-/tilgangsfeil, ellers kast.
      if (!/does not exist|no such model|model|verified|not have access|unsupported|permission|403|404/i.test(msg)) throw e;
      console.warn("Bildemodell '" + model + "' feilet, proever neste:", msg.slice(0, 140));
    }
  }
  throw lastErr || new Error("Ingen bildemodell tilgjengelig.");
}

// Generelt scene-bilde for slideshow-videoen (YouTube-appen), ingen
// whiteboard-skisse-stil og ingen påtvunget Montessoritema, følger bare
// prompten scenen faktisk sendte inn. Brukes kun som reserve når klienten
// ikke allerede har sendt en ferdig imageUrl (plattformen genererer normalt
// bildene selv via sin egen /api/image, se functions/api/youtube-video.js).
async function lagSlideBilde(prompt, aspect) {
  const cacheKey = "slide_" + hashKey((IMAGE_MODEL || "") + "|" + (aspect || "") + "|" + prompt);
  const cachedPath = path.resolve(CACHE_DIR, cacheKey + ".png");
  if (fs.existsSync(cachedPath)) return `/cache/${cacheKey}.png`;
  const size = aspect === "9:16" ? "1024x1536" : "1536x1024";
  const models = [];
  if (IMAGE_MODEL) models.push(IMAGE_MODEL);
  ["gpt-image-1", "dall-e-3", "dall-e-2"].forEach((m) => { if (models.indexOf(m) < 0) models.push(m); });
  let lastErr = null;
  for (const model of models) {
    try {
      const useSize = model === "dall-e-2" ? "1024x1024" : size;
      const img = await openai.images.generate({ model, prompt: String(prompt || "").slice(0, 800), n: 1, size: useSize });
      const d = img && img.data && img.data[0];
      let buf = null;
      if (d && d.b64_json) buf = Buffer.from(d.b64_json, "base64");
      else if (d && d.url) { const r = await fetch(d.url); if (r.ok) buf = Buffer.from(await r.arrayBuffer()); }
      if (buf) {
        await fs.promises.writeFile(cachedPath, buf);
        return `/cache/${cacheKey}.png`;
      }
      lastErr = new Error("Ingen bildedata fra " + model);
    } catch (e) {
      lastErr = e;
      const msg = String((e && e.message) || e);
      if (!/does not exist|no such model|model|verified|not have access|unsupported|permission|403|404/i.test(msg)) throw e;
      console.warn("Bildemodell '" + model + "' feilet (slideshow), proever neste:", msg.slice(0, 140));
    }
  }
  throw lastErr || new Error("Ingen bildemodell tilgjengelig.");
}

// Spor bildet til vektorstreker (SVG) så det kan tegnes strek for strek.
// Returnerer { viewBox, d, length, points } eller null (da faller vi tilbake
// på enkel avdekking).
function traceToDrawing(pngAbsPath) {
  return new Promise((resolve) => {
    try {
      potrace.trace(
        pngAbsPath,
        { threshold: 160, turdSize: 30, optTolerance: 0.4, color: "#1A1A1A", background: "transparent" },
        (err, svg) => {
          if (err || !svg) return resolve(null);
          const vb = svg.match(/viewBox="([^"]+)"/);
          let viewBox = vb ? vb[1] : null;
          if (!viewBox) {
            const w = (svg.match(/width="(\d+)/) || [])[1] || 1024;
            const h = (svg.match(/height="(\d+)/) || [])[1] || 1024;
            viewBox = `0 0 ${w} ${h}`;
          }
          const ds = Array.from(svg.matchAll(/<path[^>]*\sd="([^"]+)"/g)).map((m) => m[1]);
          if (!ds.length) return resolve(null);
          const d = ds.join(" ");
          let length = 0;
          const points = [];
          try {
            const props = new svgPathProperties(d);
            length = props.getTotalLength();
            const N = 80;
            for (let i = 0; i <= N; i++) {
              const p = props.getPointAtLength((length * i) / N);
              points.push({ x: Math.round(p.x), y: Math.round(p.y) });
            }
          } catch (e) { /* går uten punkter også */ }
          resolve({ viewBox, d, length, points });
        }
      );
    } catch (e) {
      resolve(null);
    }
  });
}

// Lag et ekte hånd-bilde (hånd som holder tusj) én gang, med gjennomsiktig
// bakgrunn, og gjenbruk det som tegnehånd i videoen.
let HAND_READY = null; // "/public/hand.png" | false | null(ikke forsøkt)
async function ensureHandImage() {
  if (HAND_READY !== null) return HAND_READY;
  const p = path.resolve(PUBLIC_DIR, "hand.png");
  if (fs.existsSync(p)) { HAND_READY = "/public/hand.png"; return HAND_READY; }
  try {
    const img = await openai.images.generate({
      model: "gpt-image-1",
      prompt:
        "A realistic human hand holding a black felt-tip marker pen, as if about to draw on a whiteboard. " +
        "Clean, simple, isolated on a fully transparent background, no shadow, no background at all. " +
        "The forearm enters from the top-right; the marker points down toward the lower-left, and the pen " +
        "tip is near the bottom-left area of the frame. Natural skin tone, gentle, friendly.",
      n: 1,
      size: "1024x1024",
      background: "transparent",
    });
    const b64 = img && img.data && img.data[0] && img.data[0].b64_json;
    if (b64) {
      await fs.promises.writeFile(p, Buffer.from(b64, "base64"));
      HAND_READY = "/public/hand.png";
      return HAND_READY;
    }
  } catch (e) {
    console.warn("Kunne ikke lage hånd-bilde (bruker tegnet markør i stedet):", e && e.message);
  }
  HAND_READY = false;
  return HAND_READY;
}

// 2) ElevenLabs with-timestamps -> lokal MP3 + ord-tidsstempler.
async function lagLydMedTidsstempler(manus, voiceId, lang) {
  // Gjenbruk lagret stemme for samme tekst + stemme + språk (sparer
  // ElevenLabs-kreditter ved omkjøring).
  const cacheKey = "tts_" + hashKey((voiceId || DEFAULT_VOICE) + "|" + ELEVEN_MODEL + "|" + (lang || "") + "|" + manus);
  const mp3Path = path.resolve(CACHE_DIR, cacheKey + ".mp3");
  const jsonPath = path.resolve(CACHE_DIR, cacheKey + ".json");
  if (fs.existsSync(mp3Path) && fs.existsSync(jsonPath)) {
    try {
      const words = JSON.parse(await fs.promises.readFile(jsonPath, "utf8"));
      return { audioPath: `/cache/${cacheKey}.mp3`, words };
    } catch (e) { /* ødelagt cache, lag på nytt */ }
  }
  const url =
    "https://api.elevenlabs.io/v1/text-to-speech/" +
    encodeURIComponent(voiceId || DEFAULT_VOICE) +
    "/with-timestamps";
  const body = {
    text: manus,
    model_id: ELEVEN_MODEL,
    language_code: lang === "en" ? "en" : "no", // tving norsk (ellers dansk uttale)
    voice_settings: { stability: 0.5, similarity_boost: 0.75 },
  };
  const r = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "xi-api-key": ELEVENLABS_API_KEY,
      Accept: "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!r.ok) {
    const detalj = await r.text().catch(() => "");
    throw new Error(`ElevenLabs feilet (${r.status}): ${detalj.slice(0, 300)}`);
  }
  const data = await r.json();
  if (!data.audio_base64) throw new Error("ElevenLabs ga ingen lyd (audio_base64 mangler).");
  const words = buildWordTimestamps(data.alignment);
  await fs.promises.writeFile(mp3Path, Buffer.from(data.audio_base64, "base64"));
  await fs.promises.writeFile(jsonPath, JSON.stringify(words));
  return { audioPath: `/cache/${cacheKey}.mp3`, words };
}

/* ================= Nano Banana + Veo (Claude + Flow-arbeidsflyten) =================
   Samme oppskrift som tutorialen: Nano Banana (Gemini) lager en håndtegnet
   blyantskisse, og Veo lar en ekte hånd tegne den strek for strek. Vi gjør det
   scene for scene, legger på norsk stemme (ElevenLabs) og setter alt sammen til
   én vertikal video med Remotion. */

const GEMINI_BASE = "https://generativelanguage.googleapis.com/v1beta";

// Nano Banana: bilde-prompt -> lokal PNG (+ base64, brukes som første bilde i Veo).
async function lagNanoBananaBilde(imagePrompt, aspect) {
  if (!GOOGLE_KEY) throw new Error("Google-nøkkel mangler (GEMINI_API_KEY) for Nano Banana.");
  // Gjenbruk lagret bilde for samme prompt (sparer generering og holder Veo-
  // klippet gyldig ved omkjøring).
  const cacheKey = "nb_" + hashKey(GEMINI_IMAGE_MODEL + "|" + (aspect || "") + "|" + imagePrompt);
  const cachedPath = path.resolve(CACHE_DIR, cacheKey + ".png");
  if (fs.existsSync(cachedPath)) {
    const buf = await fs.promises.readFile(cachedPath);
    return { path: `/cache/${cacheKey}.png`, base64: buf.toString("base64"), mime: "image/png", cached: true };
  }
  const url = `${GEMINI_BASE}/models/${GEMINI_IMAGE_MODEL}:generateContent?key=${encodeURIComponent(GOOGLE_KEY)}`;
  const mk = (withCfg) => ({
    contents: [{ role: "user", parts: [{ text: imagePrompt }] }],
    generationConfig: withCfg
      ? { responseModalities: ["IMAGE"], imageConfig: { aspectRatio: aspect || "9:16" } }
      : { responseModalities: ["IMAGE"] },
  });
  let data = null, lastErr = null;
  // Prøv med bildeformat først; noen modeller godtar ikke imageConfig, da uten.
  for (const withCfg of [true, false]) {
    try {
      const r = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(mk(withCfg)) });
      if (!r.ok) { lastErr = new Error(`Nano Banana ${r.status}: ${(await r.text()).replace(/\s+/g, " ").slice(0, 200)}`); continue; }
      data = await r.json(); break;
    } catch (e) { lastErr = e; }
  }
  if (!data) throw lastErr || new Error("Nano Banana svarte ikke.");
  const parts = (((data.candidates || [])[0] || {}).content || {}).parts || [];
  const img = parts.find((p) => p && p.inlineData && p.inlineData.data);
  if (!img) throw new Error("Nano Banana ga ikke noe bilde tilbake.");
  const b64 = img.inlineData.data;
  const mime = img.inlineData.mimeType || "image/png";
  await fs.promises.writeFile(cachedPath, Buffer.from(b64, "base64"));
  return { path: `/cache/${cacheKey}.png`, base64: b64, mime, cached: false };
}

// Finn video-referansen i et ferdig Veo-svar (feltnavn varierer mellom
// API-versjoner, så vi går gjennom hele svaret og leter etter base64-bytes
// eller en nedlastings-URL).
function findVeoVideo(obj) {
  let uri = null, bytes = null;
  (function walk(o) {
    if (!o || typeof o !== "object") return;
    for (const k of Object.keys(o)) {
      const v = o[k];
      if (v && typeof v === "object") walk(v);
      else if (typeof v === "string") {
        if (!bytes && /videoBytes|bytesBase64Encoded/i.test(k) && v.length > 100) bytes = v;
        if (!uri && /uri|url/i.test(k) && /^https?:/i.test(v) && /(files\/|\.mp4|videos?\/)/i.test(v)) uri = v;
      }
    }
  })(obj);
  if (bytes) return { bytes };
  if (uri) return { uri };
  return null;
}

async function saveVeoVideo(found, key, cacheKey) {
  const dest = path.resolve(CACHE_DIR, cacheKey + ".mp4");
  if (found.bytes) {
    await fs.promises.writeFile(dest, Buffer.from(found.bytes, "base64"));
    return `/cache/${cacheKey}.mp4`;
  }
  let u = found.uri;
  const headers = {};
  if (/generativelanguage\.googleapis\.com/i.test(u)) {
    headers["x-goog-api-key"] = key;
    if (!/[?&]key=/.test(u)) u += (u.includes("?") ? "&" : "?") + "key=" + encodeURIComponent(key);
  }
  const r = await fetch(u, { headers });
  if (!r.ok) throw new Error(`Nedlasting av Veo-video feilet (${r.status}).`);
  await fs.promises.writeFile(dest, Buffer.from(await r.arrayBuffer()));
  return `/cache/${cacheKey}.mp4`;
}

// Finn en Veo-modell som nøkkelen faktisk har (og som støtter
// predictLongRunning). Modellnavn skifter mellom nivåer og API-versjoner, så
// vi spør ListModels i stedet for å gjette. Foretrekker en "fast"-modell
// (rimeligst), ellers nyeste. Cacher svaret.
let VEO_MODEL_RESOLVED = null;
async function resolveVeoModel(force) {
  if (VEO_MODEL_RESOLVED && !force) return VEO_MODEL_RESOLVED;
  try {
    const r = await fetch(`${GEMINI_BASE}/models?key=${encodeURIComponent(GOOGLE_KEY)}&pageSize=1000`);
    if (!r.ok) return VEO_MODEL_RESOLVED;
    const data = await r.json();
    const cands = (data.models || []).filter((m) =>
      /veo/i.test(m.name || "") &&
      (m.supportedGenerationMethods || []).some((x) => /predictLongRunning/i.test(x)));
    if (!cands.length) return VEO_MODEL_RESOLVED;
    cands.sort((a, b) => {
      const af = /fast/i.test(a.name) ? 0 : 1, bf = /fast/i.test(b.name) ? 0 : 1;
      if (af !== bf) return af - bf;                        // foretrekk "fast"
      return String(b.name).localeCompare(String(a.name));  // ellers nyeste
    });
    VEO_MODEL_RESOLVED = cands[0].name.replace(/^models\//, "");
    console.log("Veo-modell valgt:", VEO_MODEL_RESOLVED);
    return VEO_MODEL_RESOLVED;
  } catch (e) { return VEO_MODEL_RESOLVED; }
}

async function veoStart(model, imageB64, mime, videoPrompt, aspect) {
  const startUrl = `${GEMINI_BASE}/models/${model}:predictLongRunning?key=${encodeURIComponent(GOOGLE_KEY)}`;
  const instance = { prompt: videoPrompt };
  if (imageB64) instance.image = { bytesBase64Encoded: imageB64, mimeType: mime || "image/png" };
  const body = { instances: [instance], parameters: { aspectRatio: aspect || "9:16", personGeneration: "allow_adult", sampleCount: 1 } };
  return fetch(startUrl, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
}

// Veo: video-prompt + første bilde -> lokal MP4 (der hånden tegner motivet).
// Veo er en langvarig operasjon: vi starter den og spør om status til den er
// ferdig (opptil ~10 min per klipp).
async function lagVeoKlipp(imageB64, mime, videoPrompt, aspect) {
  if (!GOOGLE_KEY) throw new Error("Google-nøkkel mangler (GEMINI_API_KEY) for Veo.");
  // Gjenbruk et lagret Veo-klipp for samme motiv + prompt (så du slipper å
  // betale for Veo på nytt hvis en jobb ryker på et senere steg).
  const cacheKey = "veo_" + hashKey((videoPrompt || "") + "|" + (aspect || "") + "|" + hashKey(imageB64 || ""));
  const cachedPath = path.resolve(CACHE_DIR, cacheKey + ".mp4");
  if (fs.existsSync(cachedPath)) return `/cache/${cacheKey}.mp4`;
  let model = VEO_MODEL_ENV || await resolveVeoModel();
  if (!model) throw new Error("Fant ingen Veo-modell på Google-nøkkelen. Slå på fakturering / Veo-tilgang i Google AI Studio (Veo krever betalt nivå).");
  let r = await veoStart(model, imageB64, mime, videoPrompt, aspect);
  if (r.status === 404) {
    // Modellnavnet fantes ikke, oppdag en gyldig modell og prøv på nytt.
    const discovered = await resolveVeoModel(true);
    if (discovered && discovered !== model) {
      model = discovered;
      r = await veoStart(model, imageB64, mime, videoPrompt, aspect);
    }
  }
  if (!r.ok) throw new Error(`Veo start ${r.status} (modell ${model}): ${(await r.text()).replace(/\s+/g, " ").slice(0, 220)}`);
  const op = await r.json();
  const name = op && op.name;
  if (!name) throw new Error("Veo ga ingen operasjons-id.");
  const pollUrl = `${GEMINI_BASE}/${name.replace(/^\//, "")}?key=${encodeURIComponent(GOOGLE_KEY)}`;
  for (let i = 0; i < 120; i++) { // ~10 min ved 5 s
    await sleep(5000);
    let pj;
    try {
      const pr = await fetch(pollUrl);
      if (!pr.ok) continue;
      pj = await pr.json();
    } catch (e) { continue; }
    if (pj && pj.done) {
      if (pj.error) throw new Error("Veo-feil: " + JSON.stringify(pj.error).slice(0, 250));
      const found = findVeoVideo(pj);
      if (!found) throw new Error("Fant ingen video i Veo-svaret.");
      return await saveVeoVideo(found, GOOGLE_KEY, cacheKey);
    }
  }
  throw new Error("Veo brukte for lang tid (tidsavbrudd).");
}

async function renderVeoJob(jobId, { scenes, lang, voiceId, aspect }, publicBase) {
  const t0 = Date.now();
  // Vi holder en jobb-tilstand som vokser scene for scene. Hver ferdige scene
  // (blyantskisse + Veo-klipp) legges inn med en gang, så klienten kan vise og
  // beholde dem underveis. Ryker jobben på et senere steg, ligger scenene som
  // alt er laget fortsatt i statusen (ingenting forsvinner).
  const jobState = { status: "pending", progress: "", scenes: [], when: Date.now() };
  const save = () => jobs.set(jobId, { ...jobState, scenes: jobState.scenes.slice(), when: Date.now() });
  const setProg = (p) => { jobState.progress = p; save(); };
  try {
    if (!GOOGLE_KEY) throw new Error("Google-nøkkel mangler (GEMINI_API_KEY). Veo og Nano Banana trenger den.");
    const list = (Array.isArray(scenes) ? scenes : []).filter((s) => s && (s.imagePrompt || s.videoPrompt || s.illustration));
    if (!list.length) throw new Error("Ingen scener å lage video av.");
    const asp = aspect || "9:16";
    const fps = 30;
    const outScenes = [];
    let accFrames = 0;
    for (let i = 0; i < list.length; i++) {
      const s = list[i];
      const imagePrompt = s.imagePrompt || flowImagePrompt(s.illustration);
      const videoPrompt = s.videoPrompt || flowVideoPrompt(s.illustration);
      setProg(`Scene ${i + 1}/${list.length}: lager blyantskisse (Nano Banana) …`);
      const bilde = await lagNanoBananaBilde(imagePrompt, asp);
      const imageUrl = publicBase + bilde.path;
      // Vis skissen umiddelbart (før Veo, som tar lengst tid).
      jobState.scenes.push({ n: i + 1, imageUrl, clipUrl: "" });
      save();
      setProg(`Scene ${i + 1}/${list.length}: ${bilde.cached ? "gjenbruker lagret skisse, " : ""}Veo tegner motivet (kan ta et par minutter) …`);
      const clipPath = await lagVeoKlipp(bilde.base64, bilde.mime, videoPrompt, asp);
      const clipUrl = publicBase + clipPath;
      jobState.scenes[i].clipUrl = clipUrl; // klippet klart, vis det
      save();
      let audioUrl = "", audioDur = 0;
      if (s.narration && ELEVENLABS_API_KEY) {
        try {
          setProg(`Scene ${i + 1}/${list.length}: legger på stemme …`);
          const { audioPath, words } = await lagLydMedTidsstempler(String(s.narration).trim(), voiceId, lang);
          audioUrl = RENDER_BASE + audioPath;
          audioDur = words.length ? (words[words.length - 1].end || 0) : 0;
        } catch (e) { console.warn("TTS feilet for scene " + (i + 1) + ":", e && e.message); }
      }
      const sceneSec = Math.max(CLIP_SECONDS, audioDur + 0.4);
      const durationInFrames = Math.ceil(sceneSec * fps);
      // Sakk klippet litt ned hvis stemmen er lengre enn klippet, så hånden
      // tegner gjennom hele scenen (aldri raskere enn ekte tid).
      const playbackRate = Math.min(1, CLIP_SECONDS / sceneSec);
      outScenes.push({ videoUrl: RENDER_BASE + clipPath, audioUrl, durationInFrames, playbackRate });
      accFrames += durationInFrames;
    }
    setProg("Setter sammen den ferdige videoen …");
    const totalFrames = Math.max(1, accFrames);
    const inputProps = { scenes: outScenes, fps, totalFrames };
    const serveUrl = await getServeUrl();
    const composition = await selectComposition({ serveUrl, id: "VeoComposition", inputProps });
    const outName = `veo_video_${Date.now()}.mp4`;
    const outputLocation = path.resolve(OUTPUT_DIR, outName);
    // Sammenslåingen (flere Veo-klipp -> én video) er det tyngste steget for
    // minne. På en 2 GB-server sprakk prosessen akkurat her. Vi holder minnet
    // lavt: én ramme om gangen (concurrency 1) og en liten video-buffer, så
    // den blir litt tregere, men kommer trygt i mål.
    await renderMedia({
      composition, serveUrl, codec: "h264", outputLocation, inputProps,
      jpegQuality: 80,
      concurrency: 1,
      offthreadVideoCacheSizeInBytes: 100 * 1024 * 1024,
      chromiumOptions: { gl: "swiftshader" },
    });
    console.log(`Veo-video ferdig på ${((Date.now() - t0) / 1000).toFixed(1)} s.`);
    jobState.status = "done";
    jobState.progress = "";
    jobState.videoUrl = `${publicBase}/output/${outName}`;
    jobState.durationSeconds = Number((totalFrames / fps).toFixed(1));
    save();
  } catch (error) {
    console.error("Veo-jobb feilet:", error);
    jobState.status = "error";
    jobState.error = String((error && error.message) || error);
    save(); // scenene som alt er laget blir liggende i statusen
  }
}

/* ================= Slideshow (stillbilder + Ken Burns, YouTube-appen) =================
   Enklere og raskere/rimeligere enn Veo-varianten: ett stillbilde per scene
   (normalt allerede generert av plattformen selv og sendt som imageUrl), med
   Ken Burns-panorament og ElevenLabs-stemme, satt sammen av Remotion. */
async function renderSlideshowJob(jobId, { scenes, lang, voiceId, aspect }, publicBase) {
  const t0 = Date.now();
  const jobState = { status: "pending", progress: "", scenes: [], when: Date.now() };
  const save = () => jobs.set(jobId, { ...jobState, scenes: jobState.scenes.slice(), when: Date.now() });
  const setProg = (p) => { jobState.progress = p; save(); };
  try {
    const list = (Array.isArray(scenes) ? scenes : []).filter((s) => s && (s.narration || s.imagePrompt || s.imageUrl));
    if (!list.length) throw new Error("Ingen scener å lage video av.");
    if (!ELEVENLABS_API_KEY) throw new Error("Server mangler ElevenLabs-nøkkel (ELEVENLABS_API_KEY).");
    const asp = aspect === "9:16" ? "9:16" : "16:9";
    const fps = 30;
    const outScenes = [];
    let accFrames = 0;
    for (let i = 0; i < list.length; i++) {
      const s = list[i];
      let imageUrl;
      if (s.imageUrl) {
        imageUrl = s.imageUrl; // allerede en offentlig URL (vanligvis fra plattformens egen /api/image)
      } else {
        setProg(`Scene ${i + 1}/${list.length}: lager bilde …`);
        const imgPath = await lagSlideBilde(s.imagePrompt || s.narration, asp);
        imageUrl = RENDER_BASE + imgPath;
      }
      jobState.scenes.push({ n: i + 1, imageUrl });
      save();
      let audioUrl = "", audioDur = 0;
      if (s.narration) {
        setProg(`Scene ${i + 1}/${list.length}: legger på stemme …`);
        const { audioPath, words } = await lagLydMedTidsstempler(String(s.narration).trim(), voiceId, lang);
        audioUrl = RENDER_BASE + audioPath;
        audioDur = words.length ? (words[words.length - 1].end || 0) : 0;
      }
      const sceneSec = Math.max(3, audioDur + 0.6);
      const durationInFrames = Math.ceil(sceneSec * fps);
      outScenes.push({ imageUrl, audioUrl, durationInFrames, onScreenText: i === 0 ? (s.onScreenText || "") : "" });
      accFrames += durationInFrames;
    }
    setProg("Setter sammen den ferdige videoen …");
    const totalFrames = Math.max(1, accFrames);
    const inputProps = { scenes: outScenes, fps, totalFrames, aspect: asp };
    const serveUrl = await getServeUrl();
    const composition = await selectComposition({ serveUrl, id: "SlideshowComposition", inputProps });
    const outName = `slideshow_${Date.now()}.mp4`;
    const outputLocation = path.resolve(OUTPUT_DIR, outName);
    await renderMedia({
      composition, serveUrl, codec: "h264", outputLocation, inputProps,
      jpegQuality: 80,
      concurrency: 1,
      offthreadVideoCacheSizeInBytes: 100 * 1024 * 1024,
      chromiumOptions: { gl: "swiftshader" },
    });
    console.log(`Slideshow-video ferdig på ${((Date.now() - t0) / 1000).toFixed(1)} s.`);
    jobState.status = "done";
    jobState.progress = "";
    jobState.videoUrl = `${publicBase}/output/${outName}`;
    jobState.durationSeconds = Number((totalFrames / fps).toFixed(1));
    save();
  } catch (error) {
    console.error("Slideshow-jobb feilet:", error);
    jobState.status = "error";
    jobState.error = String((error && error.message) || error);
    save();
  }
}

/* ================= Episode (Mia & Teo Video Creator sluttsammenstilling) =================
   Setter allerede genererte shot-klipp (video) og replikk-lyd (audio) sammen
   til én episode. Ingen egne AI-kall her, kun Remotion-rendring: pengene er
   allerede brukt (Higgsfield/ElevenLabs) idet dette kalles, dette steget
   koster bare rendrings-tid på denne serveren. */
async function renderEpisodeJob(jobId, { shots, aspect }, publicBase) {
  const t0 = Date.now();
  const jobState = { status: "pending", progress: "", when: Date.now() };
  const save = () => jobs.set(jobId, { ...jobState, when: Date.now() });
  const setProg = (p) => { jobState.progress = p; save(); };
  try {
    const list = (Array.isArray(shots) ? shots : []).filter((s) => s && s.videoUrl);
    if (!list.length) throw new Error("Ingen shot å sette sammen til en episode.");
    const asp = aspect === "9:16" ? "9:16" : "16:9";
    const fps = 30;
    setProg(`Setter sammen ${list.length} shot til én episode …`);
    let accFrames = 0;
    const outShots = list.map((s) => {
      const durSec = Math.max(0.5, Number(s.durationSec) || 6);
      const durationInFrames = Math.ceil(durSec * fps);
      accFrames += durationInFrames;
      const audio = (Array.isArray(s.audio) ? s.audio : [])
        .filter((a) => a && a.url)
        .map((a) => ({
          url: a.url,
          startInFrames: Math.max(0, Math.round((Number(a.startSec) || 0) * fps)),
          durationInFrames: Math.max(1, Math.ceil((Number(a.durationSec) || durSec) * fps)),
        }));
      return { videoUrl: s.videoUrl, durationInFrames, audio };
    });
    const totalFrames = Math.max(1, accFrames);
    const inputProps = { shots: outShots, fps, totalFrames, aspect: asp };
    const serveUrl = await getServeUrl();
    const composition = await selectComposition({ serveUrl, id: "EpisodeComposition", inputProps });
    const outName = `episode_${Date.now()}.mp4`;
    const outputLocation = path.resolve(OUTPUT_DIR, outName);
    await renderMedia({
      composition, serveUrl, codec: "h264", outputLocation, inputProps,
      jpegQuality: 80,
      concurrency: 1,
      offthreadVideoCacheSizeInBytes: 100 * 1024 * 1024,
      chromiumOptions: { gl: "swiftshader" },
    });
    console.log(`Episode ferdig på ${((Date.now() - t0) / 1000).toFixed(1)} s.`);
    jobState.status = "done";
    jobState.progress = "";
    jobState.videoUrl = `${publicBase}/output/${outName}`;
    jobState.durationSeconds = Number((totalFrames / fps).toFixed(1));
    save();
  } catch (error) {
    console.error("Episode-jobb feilet:", error);
    jobState.status = "error";
    jobState.error = String((error && error.message) || error);
    save();
  }
}

/* ================= VideoFlow (LME VideoFlow sluttsammenstilling) =================
   Setter allerede genererte scene-bilder og stemmelyd (med ord-tidsstempler)
   sammen til én Ken Burns-video med karaoke-undertekster. Ingen egne AI-kall
   her heller, kun Remotion-rendring. */
async function renderVideoflowJob(jobId, { scenes, aspect }, publicBase) {
  const t0 = Date.now();
  const jobState = { status: "pending", progress: "", when: Date.now() };
  const save = () => jobs.set(jobId, { ...jobState, when: Date.now() });
  const setProg = (p) => { jobState.progress = p; save(); };
  try {
    const list = (Array.isArray(scenes) ? scenes : []).filter((s) => s && s.imageUrl);
    if (!list.length) throw new Error("Ingen scener å sette sammen til en video.");
    const asp = aspect === "9:16" ? "9:16" : "16:9";
    const fps = 30;
    setProg(`Setter sammen ${list.length} scener …`);
    let accFrames = 0;
    const outScenes = list.map((s) => {
      const durSec = Math.max(1, Number(s.durationSec) || 5);
      const durationInFrames = Math.ceil(durSec * fps);
      accFrames += durationInFrames;
      const words = Array.isArray(s.words) ? s.words.map((w) => ({ word: String((w && w.word) || ""), start: Number((w && w.start) || 0), end: Number((w && w.end) || 0) })) : [];
      return { imageUrl: s.imageUrl, audioUrl: s.audioUrl || "", durationInFrames, words };
    });
    const totalFrames = Math.max(1, accFrames);
    const inputProps = { scenes: outScenes, fps, totalFrames, aspect: asp };
    const serveUrl = await getServeUrl();
    const composition = await selectComposition({ serveUrl, id: "CaptionedSlideshowComposition", inputProps });
    const outName = `videoflow_${Date.now()}.mp4`;
    const outputLocation = path.resolve(OUTPUT_DIR, outName);
    await renderMedia({
      composition, serveUrl, codec: "h264", outputLocation, inputProps,
      jpegQuality: 80,
      concurrency: 1,
      offthreadVideoCacheSizeInBytes: 100 * 1024 * 1024,
      chromiumOptions: { gl: "swiftshader" },
    });
    console.log(`VideoFlow-video ferdig på ${((Date.now() - t0) / 1000).toFixed(1)} s.`);
    jobState.status = "done";
    jobState.progress = "";
    jobState.videoUrl = `${publicBase}/output/${outName}`;
    jobState.durationSeconds = Number((totalFrames / fps).toFixed(1));
    save();
  } catch (error) {
    console.error("VideoFlow-jobb feilet:", error);
    jobState.status = "error";
    jobState.error = String((error && error.message) || error);
    save();
  }
}

/* ---------- Jobber (asynkron rendring) ----------
   Rendring tar flere minutter. I stedet for å holde én lang HTTP-forbindelse
   åpen (som ryker og gir "Failed to fetch"), starter vi en jobb, svarer med en
   gang, og lar klienten spørre om status. */
const jobs = new Map(); // jobId -> { status, videoUrl?, error?, when }

function newJobId() {
  return "wb_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}
function gcJobs() {
  const now = Date.now();
  for (const [id, j] of jobs) if (now - (j.when || 0) > 60 * 60 * 1000) jobs.delete(id);
}

async function renderJob(jobId, { manus, voiceId, tema, lang }, publicBase) {
  const t0 = Date.now();
  try {
    console.log("1/4  Lyd + tidsstempler (ElevenLabs)...");
    const { audioPath, words } = await lagLydMedTidsstempler(manus.trim(), voiceId, lang);
    if (!words.length) throw new Error("Fant ingen ord-tidsstempler fra ElevenLabs.");

    console.log("2/4  Whiteboard-skisse...");
    const imagePath = await lagWhiteboardBilde(tema || manus);
    // Spor bildet til streker for ekte tegne-animasjon.
    let drawing = null;
    try { drawing = await traceToDrawing(path.resolve(PUBLIC_DIR, path.basename(imagePath))); }
    catch (e) { console.warn("Sporing feilet, bruker enkel avdekking:", e && e.message); }

    const fps = 30;
    const sisteSlutt = words[words.length - 1].end || 0;
    const totalVarighetSekunder = Math.max(3, sisteSlutt + 2);
    const totalFrames = Math.ceil(totalVarighetSekunder * fps);

    const handPath = await ensureHandImage();
    const inputProps = {
      audioUrl: RENDER_BASE + audioPath,
      imageUrl: RENDER_BASE + imagePath,
      handUrl: handPath ? RENDER_BASE + handPath : "",
      drawing: drawing || null,
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
      composition, serveUrl, codec: "h264", outputLocation, inputProps,
      scale: 2 / 3, jpegQuality: 80,
    });

    console.log(`Ferdig på ${((Date.now() - t0) / 1000).toFixed(1)} s.`);
    jobs.set(jobId, {
      status: "done",
      videoUrl: `${publicBase}/output/${outName}`,
      durationSeconds: Number(totalVarighetSekunder.toFixed(1)),
      when: Date.now(),
    });
  } catch (error) {
    console.error("Feil under prosesseringen:", error);
    jobs.set(jobId, { status: "error", error: String((error && error.message) || error), when: Date.now() });
  }
}

/* ---------- Start jobb (svar med en gang) ---------- */
app.post("/api/generer-whiteboard", (req, res) => {
  const { manus, voiceId, tema, lang } = req.body || {};
  if (!manus || typeof manus !== "string" || !manus.trim()) {
    return res.status(400).json({ error: "Manus mangler i forespørselen." });
  }
  if (!OPENAI_KEY || !ELEVENLABS_API_KEY) {
    return res.status(500).json({ error: "Server mangler OpenAI- eller ElevenLabs-nøkkel (miljøvariabler)." });
  }
  gcJobs();
  const proto = String(req.headers["x-forwarded-proto"] || req.protocol || "https").split(",")[0].trim();
  const host = req.get("host");
  const publicBase = host ? `${proto}://${host}` : PUBLIC_BASE;

  const jobId = newJobId();
  jobs.set(jobId, { status: "pending", when: Date.now() });
  res.status(202).json({ jobId, status: "pending" });
  // Kjør i bakgrunnen (ikke await), så forbindelsen ikke må holdes åpen.
  renderJob(jobId, { manus, voiceId, tema, lang }, publicBase);
});

/* ---------- Start Veo-jobb (Nano Banana + Veo, som Flow) ---------- */
app.post("/api/generer-veo", (req, res) => {
  const { scenes, lang, voiceId, aspect } = req.body || {};
  if (!Array.isArray(scenes) || !scenes.length) {
    return res.status(400).json({ error: "scenes mangler i forespørselen." });
  }
  if (!GOOGLE_KEY) {
    return res.status(500).json({ error: "Server mangler Google-nøkkel (GEMINI_API_KEY) for Nano Banana og Veo." });
  }
  gcJobs();
  const proto = String(req.headers["x-forwarded-proto"] || req.protocol || "https").split(",")[0].trim();
  const host = req.get("host");
  const publicBase = host ? `${proto}://${host}` : PUBLIC_BASE;

  const jobId = newJobId();
  jobs.set(jobId, { status: "pending", progress: "Starter …", when: Date.now() });
  res.status(202).json({ jobId, status: "pending" });
  renderVeoJob(jobId, { scenes, lang, voiceId, aspect }, publicBase);
});

/* ---------- Start slideshow-jobb (stillbilder + Ken Burns, YouTube-appen) ---------- */
app.post("/api/generer-slideshow", (req, res) => {
  const { scenes, lang, voiceId, aspect } = req.body || {};
  if (!Array.isArray(scenes) || !scenes.length) {
    return res.status(400).json({ error: "scenes mangler i forespørselen." });
  }
  if (!ELEVENLABS_API_KEY) {
    return res.status(500).json({ error: "Server mangler ElevenLabs-nøkkel (miljøvariabel)." });
  }
  gcJobs();
  const proto = String(req.headers["x-forwarded-proto"] || req.protocol || "https").split(",")[0].trim();
  const host = req.get("host");
  const publicBase = host ? `${proto}://${host}` : PUBLIC_BASE;

  const jobId = newJobId();
  jobs.set(jobId, { status: "pending", progress: "Starter …", when: Date.now() });
  res.status(202).json({ jobId, status: "pending" });
  renderSlideshowJob(jobId, { scenes, lang, voiceId, aspect }, publicBase);
});

/* ---------- Start episode-jobb (Mia & Teo Video Creator sluttsammenstilling) ---------- */
app.post("/api/generer-episode", (req, res) => {
  const { shots, aspect } = req.body || {};
  if (!Array.isArray(shots) || !shots.length) {
    return res.status(400).json({ error: "shots mangler i forespørselen." });
  }
  gcJobs();
  const proto = String(req.headers["x-forwarded-proto"] || req.protocol || "https").split(",")[0].trim();
  const host = req.get("host");
  const publicBase = host ? `${proto}://${host}` : PUBLIC_BASE;

  const jobId = newJobId();
  jobs.set(jobId, { status: "pending", progress: "Starter …", when: Date.now() });
  res.status(202).json({ jobId, status: "pending" });
  renderEpisodeJob(jobId, { shots, aspect }, publicBase);
});

/* ---------- Start VideoFlow-jobb (LME VideoFlow sluttsammenstilling) ---------- */
app.post("/api/generer-videoflow", (req, res) => {
  const { scenes, aspect } = req.body || {};
  if (!Array.isArray(scenes) || !scenes.length) {
    return res.status(400).json({ error: "scenes mangler i forespørselen." });
  }
  gcJobs();
  const proto = String(req.headers["x-forwarded-proto"] || req.protocol || "https").split(",")[0].trim();
  const host = req.get("host");
  const publicBase = host ? `${proto}://${host}` : PUBLIC_BASE;

  const jobId = newJobId();
  jobs.set(jobId, { status: "pending", progress: "Starter …", when: Date.now() });
  res.status(202).json({ jobId, status: "pending" });
  renderVideoflowJob(jobId, { scenes, aspect }, publicBase);
});

/* ---------- Status-polling ---------- */
app.get("/api/whiteboard-status", (req, res) => {
  const id = String(req.query.id || "");
  const j = jobs.get(id);
  if (!j) return res.status(404).json({ status: "not_found" });
  return res.json(j);
});

app.listen(PORT, async () => {
  console.log(`Whiteboard-motor kjører på http://localhost:${PORT}`);
  try { await ensureBrowser(); console.log("Hodeløs Chrome klar."); }
  catch (e) { console.warn("Klarte ikke å forhåndslaste Chrome:", e && e.message); }
  // Forvarm Remotion-bundelen i bakgrunnen, så første video går raskere.
  getServeUrl().catch((e) => console.warn("Bundle-forvarming feilet:", e && e.message));
});
