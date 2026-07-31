import { enforceVideoApp, refundVideoCredit } from "../_lib/access.js";
/**
 * LME YouTube-appen — sett sammen manuset til en ferdig video.
 *
 * Tar det manuset brukeren allerede har generert/redigert i youtube-app
 * (tittel, hook, kapitler), lager ett AI-bilde per kapittel (ingen
 * Montessori-/Mia&Teo-låsing, følger temaet fritt, se buildImagePrompt),
 * sender bildene + kapiltekst videre til whiteboard-motoren (egen
 * Render-tjeneste, se whiteboard-engine/) sin nye slideshow-rute for
 * TTS + Ken Burns-rendring, og lagrer den ferdige MP4-en i plattformens
 * egen /api/video slik at Blotato kan hente en offentlig URL og poste den.
 *
 * Trekker én video-kreditt (samme system som Video Studio,
 * functions/_lib/access.js: enforceVideoApp/refundVideoCredit), refundert
 * automatisk ved feil hvor som helst i kjeden.
 *
 * Ruter:
 *   POST /api/youtube-video   { title, hook, sections:[{heading,talkingPoints}], lang }
 *        -> { id, credit }                     (bildene er laget, rendring er i gang)
 *   GET  /api/youtube-video?id=<id>
 *        -> { status: "pending"|"done"|"error", progress?, videoUrl?, error? }
 *
 * Miljøvariabel: WHITEBOARD_ENGINE_URL (standard https://lme-platform.onrender.com).
 */

const ENGINE_DEFAULT = "https://lme-platform.onrender.com";
const JOB_PREFIX = "ytvid:";

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
function buildImagePrompt(heading, points, title) {
  const topic = [heading, Array.isArray(points) ? points.join(". ") : ""].filter(Boolean).join(". ").slice(0, 500);
  return (
    "A realistic, warm, high-quality photograph or clean illustration that visually represents this exact topic: " +
    (topic || title || "a YouTube video") +
    ". Landscape 16:9 composition, no text, no words, no letters, no logos, no watermark anywhere in the image, " +
    "cinematic lighting, professional but approachable feel."
  );
}

async function fetchTimeout(url, opts, ms) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), ms || 55000);
  try { return await fetch(url, { ...opts, signal: ctrl.signal }); }
  finally { clearTimeout(timer); }
}

function b64ToBytes(b64) {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

// Samme bildemotor-kjede (Gemini foretrukket, ellers OpenAI) som
// functions/api/image.js, men med en fri, tema-drevet prompt i stedet for
// den låste Mia&Teo/Montessori-prompten (den er laget for et annet formål).
async function genSceneImage(env, prompt) {
  const hasGemini = !!(env.GEMINI_API_KEY || env.GOOGLE_API_KEY || env.GOOGLE_GEMINI_API_KEY);
  const size = "1536x1024"; // 16:9, samme som image.js sin "youtube"-størrelse
  if (hasGemini) {
    const key = env.GEMINI_API_KEY || env.GOOGLE_API_KEY || env.GOOGLE_GEMINI_API_KEY;
    const model = env.GEMINI_IMAGE_MODEL || "gemini-2.5-flash-image";
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(key)}`;
    const r = await fetchTimeout(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: { responseModalities: ["IMAGE"], imageConfig: { aspectRatio: "16:9" } },
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
  const r = await fetchTimeout(`${base}/images/generations`, {
    method: "POST",
    headers: { "Authorization": `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model, prompt, size, n: 1, quality: env.IMAGE_QUALITY || "low" }),
  }, 55000);
  if (!r.ok) throw new Error(`Bildemotoren svarte ${r.status}.`);
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
  if (!sections.length) return json({ error: "Mangler kapitler å lage video av. Lag manuset først." }, 400);

  const gate = await enforceVideoApp(context);
  if (!gate.ok) return json({ error: gate.error, needCredits: gate.needCredits || false }, gate.status);

  const origin = new URL(request.url).origin;

  // 1) Ett bilde per kapittel. Feiler ett bilde midtveis, refunder og stopp,
  //    ingen halvferdig jobb sendes videre til rendring.
  const scenes = [];
  try {
    for (let i = 0; i < sections.length; i++) {
      const sec = sections[i];
      const prompt = buildImagePrompt(sec && sec.heading, sec && sec.talkingPoints, title);
      const img = await genSceneImage(env, prompt);
      const imageUrl = await storeImage(env, origin, img.bytes, img.contentType);
      scenes.push({
        imageUrl,
        narration: narrationFor(sec),
        onScreenText: i === 0 ? hook : "",
      });
    }
  } catch (e) {
    if (!gate.owner) await refundVideoCredit(context, gate.email);
    return json({ error: "Klarte ikke å lage bildene til videoen. Kreditten er refundert.", detail: String((e && e.message) || e).slice(0, 200) }, 200);
  }

  // 2) Send scene-listen til rendrings-motoren (Render-tjeneste, asynkron jobb).
  let engineJobId;
  try {
    const r = await fetchTimeout(engineUrl(env) + "/api/generer-slideshow", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ scenes, lang, aspect: "16:9" }),
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
    return json({ status: "error", error: (data.error || "Videoen kunne ikke lages.") + " Kreditten er refundert." });
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
