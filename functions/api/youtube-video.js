import { enforceVideoApp, refundVideoCredit } from "../_lib/access.js";
/**
 * LME YouTube-appen — sett sammen manuset til en ferdig video.
 *
 * Tar det manuset brukeren allerede har generert/redigert i youtube-app
 * (tittel, hook, kapitler/scener), lager ett bilde per kapittel og sender
 * bildene + kapiltekst videre til whiteboard-motoren (egen Render-tjeneste,
 * se whiteboard-engine/) sin slideshow-rute for TTS + Ken Burns-rendring,
 * og lagrer den ferdige MP4-en i plattformens egen /api/video slik at
 * Blotato kan hente en offentlig URL og poste den. Fungerer for både lange
 * YouTube-videoer (16:9) og Shorts (9:16, se aspect).
 *
 * Bilde per kapittel er, i prioritert rekkefølge:
 *   1. Et bilde brukeren selv har lastet opp for det kapittelet (sec.imageUpload,
 *      base64), lagres direkte, ingen AI-generering eller ekstra kostnad.
 *   2. Mia & Teo med LME sin låste karakterprompt (useMiaTeo:true i body),
 *      KUN når den innloggede brukeren er eier (Renate). Sjekkes server-side
 *      via gate.owner fra enforceVideoApp, ikke stolt på fra klienten, slik
 *      at Mia & Teo aldri kan brukes av andre som eventuelt kjøper appen.
 *   3. Ellers et fritt, tema-drevet AI-bilde (ingen Montessori-/Mia&Teo-
 *      låsing, se buildImagePrompt), som før.
 *
 * Trekker én video-kreditt (samme system som Video Studio,
 * functions/_lib/access.js: enforceVideoApp/refundVideoCredit), refundert
 * automatisk ved feil hvor som helst i kjeden. Opplastede bilder koster ikke
 * noe ekstra (samme prinsipp som opplasting i functions/api/image.js).
 *
 * Ruter:
 *   POST /api/youtube-video   { title, hook, sections:[{heading,talkingPoints,imageUpload?}],
 *                                lang, aspect:"16:9"|"9:16", useMiaTeo? }
 *        -> { id, credit }                     (bildene er laget, rendring er i gang)
 *   GET  /api/youtube-video?id=<id>
 *        -> { status: "pending"|"done"|"error", progress?, videoUrl?, error? }
 *
 * Miljøvariabel: WHITEBOARD_ENGINE_URL (standard https://lme-platform.onrender.com).
 */

const ENGINE_DEFAULT = "https://lme-platform.onrender.com";
const JOB_PREFIX = "ytvid:";

// Låste Mia & Teo-karakterprompter, ordrett fra merkevare-bibelen (samme
// tekst som functions/api/image.js sin CHAR.both, se docs/mia-teo-studio.md).
// KUN for eier, se enforcement i onRequestPost.
const MIA_TEO_STYLE_LOCK =
  "Premium 3D illustrated children's book style, soft rounded Pixar-like look, " +
  "warm cinematic lighting, gentle depth of field. LME brand palette: cerise pink, " +
  "lime green, bright sky blue, lemon yellow, soft cream, warm wood tones, nature greens. " +
  "Never photorealistic. Absolutely no text, no words, no letters, no numbers, no logos, " +
  "no watermark anywhere in the image.";
const MIA_TEO_CHAR =
  "Mia is a cheerful fictional cartoon girl: light blue eyes, golden blonde hair in a high " +
  "ponytail with a pink bow, round Pixar face, small button nose, warm friendly smile, " +
  "pink floral dress, white socks, pink shoes. " +
  "Teo is a friendly fictional cartoon boy: brown eyes, medium brown wavy hair, round Pixar " +
  "face, warm smile, yellow and white striped shirt, blue shorts, brown shoes; binoculars in " +
  "explorer scenes. They are best friends exploring together, never romantic.";

function json(data, status) {
  return new Response(JSON.stringify(data), {
    status: status || 200,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
      "Access-Control-Allow-Origin": "*",
    },
  });
}

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

function engineUrl(env) {
  return (env.WHITEBOARD_ENGINE_URL || ENGINE_DEFAULT).replace(/\/$/, "");
}

// Bilde-prompt per kapittel: følger temaet fritt, ingen Montessori-/
// Mia&Teo-låsing (dette er et generelt YouTube-videoverktøy, se samme
// prinsipp fastsatt for tekstgenerereren i functions/api/ai/content.js).
function buildImagePrompt(heading, points, title, aspect) {
  const topic = [heading, Array.isArray(points) ? points.join(". ") : ""].filter(Boolean).join(". ").slice(0, 500);
  const orient = aspect === "9:16" ? "Vertical 9:16" : "Landscape 16:9";
  return (
    "A realistic, warm, high-quality photograph or clean illustration that visually represents this exact topic: " +
    (topic || title || "a YouTube video") +
    ". " + orient + " composition, no text, no words, no letters, no logos, no watermark anywhere in the image, " +
    "cinematic lighting, professional but approachable feel."
  );
}

// Mia & Teo-variant, kun brukt når useMiaTeo er satt OG innlogget bruker er
// eier (server-side sjekk, se onRequestPost). Samme låste karakteridentitet
// som functions/api/image.js, temaet styrer bare scenen/aktiviteten, aldri
// utseendet til Mia og Teo selv.
function buildCharacterImagePrompt(heading, points, title, aspect) {
  const topic = [heading, Array.isArray(points) ? points.join(". ") : ""].filter(Boolean).join(". ").slice(0, 400);
  const orient = aspect === "9:16" ? "Vertical 9:16" : "Landscape 16:9";
  return (
    MIA_TEO_CHAR + " " +
    (topic
      ? `Depict them in a scene that fits this theme (illustrate the mood and activity, do not render any of these words): ${topic}`
      : "Depict them exploring nature and learning together.") +
    " " + orient + " composition. " + MIA_TEO_STYLE_LOCK
  );
}

async function fetchTimeout(url, opts, ms) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), ms || 55000);
  try { return await fetch(url, { ...opts, signal: ctrl.signal }); }
  finally { clearTimeout(timer); }
}

function sleep(ms) { return new Promise((res) => setTimeout(res, ms)); }

// Egen feiltype for rate-limit (HTTP 429) fra bildemotoren, så vi kan gi
// brukeren en tydelig, vennlig beskjed i stedet for en rå statuskode.
class RateLimitError extends Error {
  constructor(msg) { super(msg || "rate_limit"); this.name = "RateLimitError"; }
}

function b64ToBytes(b64) {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

// Samme bildemotor-kjede (Gemini foretrukket, ellers OpenAI) som
// functions/api/image.js, men med en fri, tema-drevet prompt i stedet for
// den låste Mia&Teo/Montessoriprompten (den er laget for et annet formål,
// med mindre useMiaTeo er satt, se buildCharacterImagePrompt).
async function genSceneImage(env, prompt, aspect) {
  const asp = aspect === "9:16" ? "9:16" : "16:9";
  const hasGemini = !!(env.GEMINI_API_KEY || env.GOOGLE_API_KEY || env.GOOGLE_GEMINI_API_KEY);
  const size = asp === "9:16" ? "1024x1536" : "1536x1024"; // samme størrelser som image.js
  if (hasGemini) {
    const key = env.GEMINI_API_KEY || env.GOOGLE_API_KEY || env.GOOGLE_GEMINI_API_KEY;
    const model = env.GEMINI_IMAGE_MODEL || "gemini-2.5-flash-image";
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(key)}`;
    const r = await fetchTimeout(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: { responseModalities: ["IMAGE"], imageConfig: { aspectRatio: asp } },
      }),
    }, 55000);
    if (r.ok) {
      const data = await r.json();
      const parts = (((data.candidates || [])[0] || {}).content || {}).parts || [];
      const img = parts.find((p) => p && p.inlineData && p.inlineData.data);
      if (img) return { bytes: b64ToBytes(img.inlineData.data), contentType: img.inlineData.mimeType || "image/png" };
    }
    // faller videre til OpenAI under
  }
  const key = env.OPENAI_API_KEY || env.IMAGE_OPENAI_KEY || env.IMAGE_API_KEY;
  if (!key) throw new Error("Ingen bildemotor koblet til (GEMINI_API_KEY eller OPENAI_API_KEY mangler).");
  const base = (env.IMAGE_OPENAI_BASE || env.IMAGE_API_BASE || "https://api.openai.com/v1").replace(/\/$/, "");
  const model = env.IMAGE_OPENAI_MODEL || env.IMAGE_MODEL || "gpt-image-1";
  // gpt-image-1 har en lav grense for bilder per minutt, og en video med
  // flere kapitler lager flere bilder rett etter hverandre. Ved 429 (for mange
  // forespørsler) eller en midlertidig 5xx, vent og prøv igjen noen ganger,
  // og respekter Retry-After-headeren når den finnes.
  let r;
  for (let attempt = 0; attempt < 4; attempt++) {
    r = await fetchTimeout(`${base}/images/generations`, {
      method: "POST",
      headers: { "Authorization": `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model, prompt, size, n: 1, quality: env.IMAGE_QUALITY || "low" }),
    }, 55000);
    if (r.ok) break;
    const retryable = r.status === 429 || r.status === 500 || r.status === 502 || r.status === 503;
    if (!retryable || attempt === 3) {
      if (r.status === 429) throw new RateLimitError("Bildemotoren svarte 429.");
      throw new Error(`Bildemotoren svarte ${r.status}.`);
    }
    const ra = parseInt(r.headers.get("retry-after") || "", 10);
    const waitMs = Math.min((Number.isFinite(ra) && ra > 0 ? ra * 1000 : 0) || (3000 * (attempt + 1)), 12000);
    await sleep(waitMs);
  }
  const data = await r.json();
  const item = data && data.data && data.data[0];
  if (item && item.b64_json) return { bytes: b64ToBytes(item.b64_json), contentType: "image/png" };
  if (item && item.url) {
    const ir = await fetchTimeout(item.url, {}, 30000);
    return { bytes: new Uint8Array(await ir.arrayBuffer()), contentType: ir.headers.get("Content-Type") || "image/png" };
  }
  throw new Error("Bildemotoren ga ikke noe bilde tilbake.");
}

async function storeImage(env, origin, bytes, contentType) {
  const id = crypto.randomUUID().replace(/-/g, "");
  await env.BUILDER_KV.put("img:" + id, bytes, { metadata: { ct: contentType || "image/png" }, expirationTtl: 60 * 60 * 24 * 30 });
  return `${origin}/api/image?id=${id}`;
}

// Gjør en rå feilmelding fra rendringsmotoren (kan inneholde JSON og engelske
// leverandørmeldinger) om til en kort, tydelig beskjed på riktig språk. Fanger
// særlig ElevenLabs-betalingsfeil, som Renate må ordne i ElevenLabs-kontoen sin.
function friendlyEngineError(raw, lang) {
  const s = String(raw || "");
  const low = s.toLowerCase();
  const en = lang === "en";
  if (low.includes("elevenlabs") || low.includes("payment_issue") || low.includes("payment_required")) {
    if (low.includes("payment") || low.includes("401") || low.includes("invoice") || low.includes("quota") || low.includes("credit")) {
      return en
        ? "The voice engine (ElevenLabs) is paused because a payment did not go through. Open your ElevenLabs account, complete the latest invoice, and try again."
        : "Stemme-motoren (ElevenLabs) er satt på pause fordi en betaling ikke gikk gjennom. Gå inn i ElevenLabs-kontoen din, fullfør siste faktura, og prøv igjen.";
    }
    return en
      ? "The voice engine (ElevenLabs) could not make the narration right now. Try again in a little while."
      : "Stemme-motoren (ElevenLabs) klarte ikke å lage fortellerstemmen akkurat nå. Prøv igjen om litt.";
  }
  // Ukjent motorfeil: gi en nøytral beskjed, ikke dump rå JSON til brukeren.
  return en ? "The video could not be made." : "Videoen kunne ikke lages.";
}

function narrationFor(section) {
  const heading = String((section && section.heading) || "").trim();
  const points = Array.isArray(section && section.talkingPoints) ? section.talkingPoints : [];
  return [heading, points.join(". ")].filter(Boolean).join(". ");
}

// ---- POST: lag bilder, start rendring (trekker 1 kreditt) ----
export async function onRequestPost(context) {
  const { request, env } = context;
  if (!env.BUILDER_KV) return json({ error: "not_configured" }, 200);

  let body;
  try { body = await request.json(); }
  catch { return json({ error: "Ugyldig JSON" }, 400); }

  const title = String(body.title || "").slice(0, 200).trim();
  const hook = String(body.hook || "").slice(0, 300).trim();
  const sections = Array.isArray(body.sections) ? body.sections.slice(0, 8) : [];
  const lang = body.lang === "en" ? "en" : "no";
  const aspect = body.aspect === "9:16" ? "9:16" : "16:9";
  if (!sections.length) return json({ error: "Mangler kapitler å lage video av. Lag manuset først." }, 400);

  const gate = await enforceVideoApp(context);
  if (!gate.ok) return json({ error: gate.error, needCredits: gate.needCredits || false }, gate.status);

  // Mia & Teo (låst karakterprompt) er KUN for eier. Ikke stol på klienten:
  // sjekk gate.owner (server-side, fra sesjonen), ignorer flagget stille for
  // alle andre i stedet for å feile, så en vanlig bruker bare får det vanlige,
  // frie temabildet uten å ane at Mia & Teo-alternativet finnes.
  const useMiaTeo = !!body.useMiaTeo && !!gate.owner;

  const origin = new URL(request.url).origin;

  // 1) Ett bilde per kapittel. Feiler ett bilde midtveis, refunder og stopp,
  //    ingen halvferdig jobb sendes videre til rendring.
  const scenes = [];
  try {
    for (let i = 0; i < sections.length; i++) {
      const sec = sections[i];
      let imageUrl;
      const upload = sec && sec.imageUpload ? String(sec.imageUpload) : "";
      if (upload) {
        // Brukeren har selv lastet opp et bilde til dette kapittelet: lagre
        // det direkte, ingen AI-generering og ingen ekstra kostnad.
        let ub = upload;
        const c = ub.indexOf(",");
        if (ub.startsWith("data:") && c !== -1) ub = ub.slice(c + 1);
        let bytes;
        try { bytes = b64ToBytes(ub); } catch { throw new Error("Ugyldig bilde-opplasting i kapittel " + (i + 1) + "."); }
        if (!bytes.length || bytes.length > 15 * 1024 * 1024) throw new Error("Bildet i kapittel " + (i + 1) + " er ugyldig eller for stort (maks 15 MB).");
        imageUrl = await storeImage(env, origin, bytes, "image/png");
      } else {
        const prompt = useMiaTeo
          ? buildCharacterImagePrompt(sec && sec.heading, sec && sec.talkingPoints, title, aspect)
          : buildImagePrompt(sec && sec.heading, sec && sec.talkingPoints, title, aspect);
        // Liten pause mellom hvert AI-bilde (ikke før det første) for å jevne ut
        // forespørslene og unngå å slå i bildemotorens grense per minutt.
        if (i > 0) await sleep(1200);
        const img = await genSceneImage(env, prompt, aspect);
        imageUrl = await storeImage(env, origin, img.bytes, img.contentType);
      }
      scenes.push({
        imageUrl,
        narration: narrationFor(sec),
        onScreenText: i === 0 ? hook : "",
      });
    }
  } catch (e) {
    if (!gate.owner) await refundVideoCredit(context, gate.email);
    if (e instanceof RateLimitError) {
      return json({
        error: lang === "en"
          ? "The image engine is busy right now (too many requests). Wait a minute and try again. Your credit has been refunded."
          : "Bildemotoren er opptatt akkurat nå (for mange forespørsler). Vent ett minutt og prøv igjen. Kreditten er refundert.",
      }, 200);
    }
    return json({ error: "Klarte ikke å lage bildene til videoen. Kreditten er refundert.", detail: String((e && e.message) || e).slice(0, 200) }, 200);
  }

  // 2) Send scene-listen til rendrings-motoren (Render-tjeneste, asynkron jobb).
  let engineJobId;
  try {
    const r = await fetchTimeout(engineUrl(env) + "/api/generer-slideshow", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ scenes, lang, aspect }),
    }, 20000);
    const data = await r.json().catch(() => null);
    if (!r.ok || !data || !data.jobId) {
      throw new Error((data && data.error) || `Rendringsmotoren svarte ${r.status}.`);
    }
    engineJobId = data.jobId;
  } catch (e) {
    if (!gate.owner) await refundVideoCredit(context, gate.email);
    return json({ error: "Klarte ikke å starte videorendringen. Kreditten er refundert.", detail: String((e && e.message) || e).slice(0, 200) }, 200);
  }

  if (!gate.owner) {
    try {
      await env.BUILDER_KV.put(JOB_PREFIX + engineJobId, JSON.stringify({ email: gate.email, refunded: false, title }), { expirationTtl: 60 * 60 * 2 });
    } catch (e) {}
  }
  return json({ id: engineJobId, credit: gate.credit });
}

// ---- GET: poll rendringsstatus, lagre ferdig video i /api/video ved suksess ----
export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const id = url.searchParams.get("id") || "";
  const lang = url.searchParams.get("lang") === "en" ? "en" : "no";
  if (!id) return json({ error: "Mangler id." }, 400);
  if (!/^[A-Za-z0-9_-]{6,60}$/.test(id)) return json({ error: "Ugyldig jobb-ID." }, 400);

  let r, data;
  try {
    r = await fetchTimeout(engineUrl(env) + "/api/whiteboard-status?id=" + encodeURIComponent(id), {}, 20000);
    data = await r.json().catch(() => null);
  } catch (e) {
    return json({ status: "pending" });
  }
  if (!r.ok || !data) return json({ status: "pending" });

  if (data.status === "error") {
    try {
      const raw = await env.BUILDER_KV.get(JOB_PREFIX + id);
      if (raw) {
        const rec = JSON.parse(raw);
        if (rec && rec.email && !rec.refunded) {
          await refundVideoCredit(context, rec.email);
          rec.refunded = true;
          await env.BUILDER_KV.put(JOB_PREFIX + id, JSON.stringify(rec), { expirationTtl: 60 * 60 * 2 });
        }
      }
    } catch (e) {}
    const refundNote = lang === "en" ? " Your credit has been refunded." : " Kreditten er refundert.";
    return json({ status: "error", error: friendlyEngineError(data.error, lang) + refundNote });
  }

  if (data.status !== "done" || !data.videoUrl) {
    return json({ status: "pending", progress: data.progress || "" });
  }

  // Ferdig: hent MP4-en fra rendringsmotoren, og lagre den selv, direkte i KV,
  // med samme nøkkelmønster ("vid:<id>") som /api/video sin GET allerede leser
  // fra. Kaller bevisst IKKE /api/video sin POST her: den har sin egen,
  // separate kvote/kreditt-sperre (enforceGeneration, ment for Reel Studios
  // klient-side klipp), og ville trukket en ANNEN kreditt oppå den vi allerede
  // trakk over i enforceVideoApp, dobbel betaling for samme video. GET-en er
  // uendret og fri for alle, så URL-en er identisk brukbar for Blotato uansett.
  const MAX_BYTES = 24 * 1024 * 1024;
  try {
    const vr = await fetchTimeout(data.videoUrl, {}, 55000);
    if (!vr.ok) throw new Error("Klarte ikke å hente den ferdige videoen (" + vr.status + ").");
    const bytes = new Uint8Array(await vr.arrayBuffer());
    if (bytes.length > MAX_BYTES) throw new Error("Videoen ble for stor til å lagres (maks 24 MB).");
    const vidId = crypto.randomUUID().replace(/-/g, "");
    await env.BUILDER_KV.put("vid:" + vidId, bytes, { metadata: { ct: "video/mp4" }, expirationTtl: 60 * 60 * 24 * 30 });
    const origin = new URL(request.url).origin;
    return json({ status: "done", videoUrl: `${origin}/api/video?id=${vidId}`, durationSeconds: data.durationSeconds || 0 });
  } catch (e) {
    return json({ status: "error", error: "Videoen ble laget, men kunne ikke lagres: " + String((e && e.message) || e).slice(0, 200) });
  }
}
