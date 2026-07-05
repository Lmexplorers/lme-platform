/**
 * LME — auto-generert bilde til sosiale innlegg (for Visibility-appen).
 *
 * POST /api/image
 *   body { text, character, lang, platform }
 *     character: "none" | "mia" | "teo" | "both"   (kun Mia/Teo er tillatt karakter)
 *   -> { url: "https://.../api/image?id=<id>" }     (offentlig, klart for Blotato)
 *
 * GET  /api/image?id=<id>
 *   -> selve PNG-en (hentet fra KV, offentlig)
 *
 * Bildet lagres i BUILDER_KV slik at Blotato kan hente en offentlig URL.
 *
 * Bildemotor: OpenAI-kompatibelt API. Konfigurerbart via miljøvariabler slik at
 * samme nøkkel som Content Studio kan gjenbrukes, eller byttes uten kodeendring:
 *   IMAGE_API_KEY   (ellers OPENAI_API_KEY)      -- hemmelig nøkkel
 *   IMAGE_API_BASE  (standard https://api.openai.com/v1)
 *   IMAGE_MODEL     (standard gpt-image-1)
 *
 * Mia og Teo har LÅST karakteridentitet (se brand/master-creative-bible.md).
 * Ekte personer genereres aldri her; bare de oppdiktede karakterene Mia og Teo
 * eller nøytrale Montessori-scener.
 */

const STYLE_LOCK =
  "Premium 3D illustrated children's book style, soft rounded Pixar-like look, " +
  "warm cinematic lighting, gentle depth of field. LME brand palette: cerise pink, " +
  "lime green, bright sky blue, lemon yellow, soft cream, warm wood tones, nature greens. " +
  "Never photorealistic. Absolutely no text, no words, no letters, no numbers, no logos, " +
  "no watermark anywhere in the image.";

// Låste karakterprompter, ordrett fra merkevare-bibelen.
const MIA =
  "Mia is a cheerful fictional cartoon girl: light blue eyes, golden blonde hair in a high " +
  "ponytail with a pink bow, round Pixar face, small button nose, warm friendly smile, " +
  "pink floral dress, white socks, pink shoes.";
const TEO =
  "Teo is a friendly fictional cartoon boy: brown eyes, medium brown wavy hair, round Pixar " +
  "face, warm smile, yellow and white striped shirt, blue shorts, brown shoes; binoculars in " +
  "explorer scenes.";
const CHAR = {
  mia: MIA,
  teo: TEO,
  both: MIA + " " + TEO + " They are best friends exploring together, never romantic.",
};

const NEUTRAL_SCENE =
  "A warm, inviting Montessori scene with real, pedagogically accurate Montessori practical-life " +
  "materials, natural wood, soft daylight, calm ordered shelves. No recognizable real people.";

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

function sizeFor(platform) {
  // gpt-image-1 støtter 1024x1024, 1024x1536 (portrett), 1536x1024 (landskap).
  switch (String(platform || "").toLowerCase()) {
    case "pinterest": return "1024x1536";
    case "tiktok": return "1024x1536";
    default: return "1024x1024"; // instagram, facebook, generelt
  }
}

function buildPrompt(text, character) {
  const parts = [];
  const c = CHAR[character];
  if (c) {
    parts.push(c);
    const theme = String(text || "").replace(/\s+/g, " ").trim().slice(0, 320);
    parts.push(
      theme
        ? `Depict them in a scene that fits this theme (illustrate the mood and activity, do not render any of these words): ${theme}`
        : "Depict them exploring nature and learning together."
    );
  } else {
    // Ingen karakter: nøytral, trygg Montessori-scene som passer temaet.
    const theme = String(text || "").replace(/\s+/g, " ").trim().slice(0, 320);
    parts.push(NEUTRAL_SCENE);
    if (theme) parts.push(`Let the scene fit this theme (do not render any of these words): ${theme}`);
  }
  parts.push(STYLE_LOCK);
  return parts.join(" ");
}

// =====================================================
// POST — generer og lagre bilde
// =====================================================
export async function onRequestPost(context) {
  const { request, env } = context;
  if (!env.BUILDER_KV) return json({ error: "not_configured" }, 200);

  const key = env.IMAGE_API_KEY || env.OPENAI_API_KEY;
  if (!key) {
    return json({ error: "Bildemotor er ikke koblet til ennå (IMAGE_API_KEY mangler)." }, 400);
  }

  let body;
  try { body = await request.json(); }
  catch { return json({ error: "Ugyldig JSON" }, 400); }

  let character = String(body.character || "none").toLowerCase();
  if (!["none", "mia", "teo", "both"].includes(character)) character = "none";

  const base = (env.IMAGE_API_BASE || "https://api.openai.com/v1").replace(/\/$/, "");
  const model = env.IMAGE_MODEL || "gpt-image-1";
  const prompt = buildPrompt(body.text, character);
  const size = sizeFor(body.platform);

  let bytes, contentType = "image/png";
  try {
    const r = await fetch(`${base}/images/generations`, {
      method: "POST",
      headers: { "Authorization": `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model, prompt, size, n: 1 }),
    });
    if (!r.ok) {
      const t = await r.text();
      return json({ error: `Bildemotor svarte ${r.status}.`, detail: t.slice(0, 300) }, 502);
    }
    const data = await r.json();
    const item = data && data.data && data.data[0];
    if (item && item.b64_json) {
      bytes = b64ToBytes(item.b64_json);
    } else if (item && item.url) {
      // Noen modeller returnerer en midlertidig URL; hent bytene så vi hoster den selv.
      const ir = await fetch(item.url);
      bytes = new Uint8Array(await ir.arrayBuffer());
      contentType = ir.headers.get("Content-Type") || contentType;
    } else {
      return json({ error: "Fikk ikke noe bilde tilbake." }, 502);
    }
  } catch (e) {
    return json({ error: "Kom ikke i kontakt med bildemotoren." }, 502);
  }

  const id = crypto.randomUUID().replace(/-/g, "");
  try {
    await env.BUILDER_KV.put("img:" + id, bytes, {
      metadata: { ct: contentType },
      expirationTtl: 60 * 60 * 24 * 30, // 30 dager
    });
  } catch (e) {
    return json({ error: "Klarte ikke å lagre bildet." }, 500);
  }

  const origin = new URL(request.url).origin;
  return json({ url: `${origin}/api/image?id=${id}` }, 200);
}

// =====================================================
// GET — server et lagret bilde
// =====================================================
export async function onRequestGet(context) {
  const { request, env } = context;
  const id = new URL(request.url).searchParams.get("id") || "";
  if (!/^[a-f0-9]{16,40}$/i.test(id)) return new Response("Not found", { status: 404 });
  if (!env.BUILDER_KV) return new Response("Not configured", { status: 500 });

  const res = await env.BUILDER_KV.getWithMetadata("img:" + id, { type: "arrayBuffer" });
  if (!res || !res.value) return new Response("Not found", { status: 404 });
  const ct = (res.metadata && res.metadata.ct) || "image/png";
  return new Response(res.value, {
    status: 200,
    headers: {
      "Content-Type": ct,
      "Cache-Control": "public, max-age=2592000, immutable",
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

function b64ToBytes(b64) {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}
