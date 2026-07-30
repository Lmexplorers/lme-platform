import { enforceHeadshotApp, refundImageCredit, headshotAppAccess } from "../_lib/access.js";
/**
 * LME AI Headshot, ansiktsbevarende proff-portretter via OpenAI-bildemotoren
 * (gpt-image-1, samme motor som Bookly bruker). Brukeren laster opp ett eller
 * flere bilder av seg selv, og vi bruker dem som referanse i et image-edit-kall
 * med valgt stil, slik at ansiktet bevares. Ingen egen trening, ingen nye
 * nøkler, ingen ny registrering.
 *
 * Flere referansebilder gir bedre likhet. Hver headshot trekker én
 * forhåndskjøpt bilde-kreditt, eier gratis, refundert ved feil.
 *
 * Ruter:
 *   GET  /api/headshot                       -> { loggedIn, owner, credit }
 *   POST /api/headshot { style, images:[url] } -> { status:"completed", url, credit }
 *
 * Secret: OPENAI_API_KEY (samme nøkkel som Bookly og resten av plattformen).
 */

const OPENAI_EDITS = "https://api.openai.com/v1/images/edits";
const MAX_REFS = 8;

// Hver stil endrer BARE bakgrunn, antrekk og lys, ikke ansiktet. Mykt,
// smigrende lys i alle, for å unngå at harde skygger legger på år.
const STYLES = {
  business:  "Restyle only the setting into a professional business headshot: clean neutral studio backdrop, smart tailored dark blazer, soft flattering studio lighting.",
  linkedin:  "Restyle only the setting into a LinkedIn profile headshot: softly blurred modern office, smart business-casual outfit, soft natural window light.",
  portrait:  "Restyle only the setting into an elegant editorial studio portrait: plain warm studio backdrop, soft flattering even lighting.",
  bw:        "Restyle only the setting into an elegant black and white studio portrait: plain dark background, soft flattering lighting, timeless monochrome look.",
  outdoor:   "Restyle only the setting into a natural outdoor lifestyle portrait: softly blurred green background in warm, soft golden-hour light.",
  creative:  "Restyle only the setting into a modern creative portrait: clean gradient backdrop with soft flattering colored studio lighting, stylish and contemporary.",
};
const FACE_LOCK =
  " This must look like a REAL photograph taken by a professional photographer, absolutely not a render, " +
  "not AI, not airbrushed and not a doll. Keep natural, realistic skin with real texture, real pores, " +
  "fine lines and natural detail. Do NOT smooth, retouch, airbrush, plasticise or beautify the skin, and " +
  "never give it a waxy, glossy or doll-like plastic look. Keep the exact same person, face shape, bone " +
  "structure, age and identity as in the reference photo, clearly and unmistakably recognisable: the same " +
  "eyes, nose, mouth, warm smile and features. Keep her LIGHT BLONDE hair the exact same light blonde " +
  "colour, do NOT darken it or turn it brown. Flatter her ONLY through soft, natural professional lighting " +
  "and a flattering, slightly elevated, subtly slimming camera angle and portrait lens that removes " +
  "close-up selfie distortion. Do NOT add weight, roundness or fullness to her face, cheeks, chin, jaw or " +
  "neck, and do NOT change her face or make her younger or different. Photorealistic, authentic, natural, " +
  "head and shoulders, looking at the camera, family-friendly.";

function json(data, status) {
  return new Response(JSON.stringify(data), {
    status: status || 200,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store", "Access-Control-Allow-Origin": "*" },
  });
}

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "GET, POST, OPTIONS", "Access-Control-Allow-Headers": "Content-Type" },
  });
}

// Hent et referansebilde (våre egne /api/image?id=-URL-er) som bytes + mime.
async function fetchRef(request, u) {
  try {
    const abs = new URL(u, request.url).toString();
    const r = await fetch(abs, { headers: { "Cookie": request.headers.get("Cookie") || "" } });
    if (!r.ok) return null;
    const ct = (r.headers.get("Content-Type") || "image/png").split(";")[0].trim();
    if (!/^image\/(png|jpe?g|webp)$/.test(ct)) return null;
    const buf = new Uint8Array(await r.arrayBuffer());
    if (!buf.length || buf.length > 8 * 1024 * 1024) return null;
    return { bytes: buf, ct: ct };
  } catch (e) { return null; }
}

// ---- POST: lag et headshot fra opplastede referansebilder (trekker 1 kreditt) ----
export async function onRequestPost(context) {
  const { request, env } = context;
  if (!env.OPENAI_API_KEY) return json({ error: "not_configured" }, 200);

  let body;
  try { body = await request.json(); } catch { return json({ error: "Ugyldig JSON" }, 400); }
  const styleKey = String(body.style || "business").toLowerCase();
  const style = STYLES[styleKey] || STYLES.business;
  const urls = Array.isArray(body.images) ? body.images.filter((u) => /^https?:\/\/|^\//.test(String(u))).slice(0, MAX_REFS) : [];

  const acc = await headshotAppAccess(context);
  if (!acc.loggedIn) return json({ error: "Logg inn for å lage headshots." }, 401);
  if (!urls.length) return json({ error: "Last opp minst ett bilde av deg selv først.", needPhoto: true }, 200);

  // Hent referansebildene før vi trekker kreditt.
  const refs = [];
  for (const u of urls) {
    const ref = await fetchRef(request, u);
    if (ref) refs.push(ref);
  }
  if (!refs.length) return json({ error: "Fikk ikke lastet bildene dine. Prøv å laste dem opp på nytt.", needPhoto: true }, 200);

  const gate = await enforceHeadshotApp(context);
  if (!gate.ok) return json({ error: gate.error, needCredits: gate.needCredits || false }, gate.status);

  const prompt = ("Create a polished, flattering professional headshot of the person from the reference photo. " + style + FACE_LOCK).slice(0, 980);
  const size = env.HEADSHOT_IMAGE_SIZE || "1024x1536";
  const quality = env.HEADSHOT_IMAGE_QUALITY || "medium";

  const fd = new FormData();
  fd.append("model", env.HEADSHOT_IMAGE_MODEL || "gpt-image-1");
  fd.append("prompt", prompt);
  fd.append("size", size);
  fd.append("quality", quality);
  // input_fidelity: high bevarer ansiktstrekk fra referansebildet mye bedre.
  fd.append("input_fidelity", env.HEADSHOT_INPUT_FIDELITY || "high");
  fd.append("n", "1");
  refs.forEach((ref, i) => {
    const ext = ref.ct === "image/png" ? ".png" : ref.ct === "image/webp" ? ".webp" : ".jpg";
    fd.append("image[]", new Blob([ref.bytes], { type: ref.ct }), "ref" + i + ext);
  });

  let res, data, timedOut = false;
  const ctrl = new AbortController();
  const timer = setTimeout(() => { timedOut = true; ctrl.abort(); }, 85000);
  try {
    res = await fetch(OPENAI_EDITS, { method: "POST", headers: { "Authorization": "Bearer " + env.OPENAI_API_KEY }, body: fd, signal: ctrl.signal });
    const t = await res.text();
    try { data = JSON.parse(t); } catch (e) { data = null; }
  } catch (e) {
    if (!gate.owner) await refundImageCredit(context, gate.email);
    const msg = timedOut
      ? "Bildemotoren brukte for lang tid denne gangen. Kreditten er refundert, prøv en gang til."
      : "Kom ikke i kontakt med bildemotoren. Kreditten er refundert.";
    return json({ error: msg }, 200);
  } finally {
    clearTimeout(timer);
  }
  const b64 = data && data.data && data.data[0] && data.data[0].b64_json;
  if (!res.ok || !b64) {
    if (!gate.owner) await refundImageCredit(context, gate.email);
    const detail = (data && data.error && data.error.message) ? " (" + String(data.error.message).slice(0, 160) + ")" : "";
    return json({ error: "Bildet kunne ikke lages" + detail + ". Kreditten er refundert." }, 200);
  }
  // Lagre bildet på en ekte adresse (KV, som /api/image) så det kan lastes ned og
  // deles på mobil. iOS-Safari klarer ikke å laste ned data:-URL-er.
  let outUrl = "data:image/png;base64," + b64;
  try {
    if (env.BUILDER_KV) {
      const bytes = b64ToBytes(b64);
      const id = crypto.randomUUID().replace(/-/g, "");
      await env.BUILDER_KV.put("img:" + id, bytes, { metadata: { ct: "image/png" }, expirationTtl: 60 * 60 * 24 * 30 });
      outUrl = new URL(request.url).origin + "/api/image?id=" + id;
    }
  } catch (e) {}
  return json({ status: "completed", url: outUrl, credit: gate.credit });
}

function b64ToBytes(b64) {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

// ---- GET: tilgang/kreditt ----
export async function onRequestGet(context) {
  const acc = await headshotAppAccess(context);
  return json({ loggedIn: acc.loggedIn, owner: acc.owner, credit: acc.credit });
}
