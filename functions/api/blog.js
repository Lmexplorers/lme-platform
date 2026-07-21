/**
 * LME Blogg — lagring av blogginnlegg i Cloudflare KV (BUILDER_KV).
 * Samme passord-mekanisme som content.js / course.js (COURSE_EDIT_PASSWORD).
 *
 *  GET  /api/blog                 -> { posts: [ {meta...} ] }   (nyeste først)
 *  GET  /api/blog?action=post&id= -> { post: {full...} | null }
 *  GET  /api/blog?action=image&id=-> selve toppbildet (binært, hurtiglagres)
 *  POST /api/blog  { action:"save",   password, post:{...} } -> { ok:true, id }
 *  POST /api/blog  { action:"delete", password, id }         -> { ok:true }
 *  POST /api/blog  { action:"generate", password, topic }
 *       -> { ok:true, draft:{titleNo,titleEn,excerptNo,excerptEn,bodyNo,
 *            bodyEn,category,readMin,imagePrompt} }   (KI-skrevet utkast)
 *  POST /api/blog  { action:"generate-image", password, prompt }
 *       -> { ok:true, url:"/api/blog?action=image&id=..." }
 *
 * Innlegg er tospråklige: titleNo/titleEn, excerptNo/excerptEn, bodyNo/bodyEn.
 * Tekst genereres med ANTHROPIC_API_KEY (samme som Renate AI), bilder med
 * OPENAI_API_KEY (samme som Bookly). Genererte bilder lagres i KV og
 * serveres fra dette API-et, saa bildelenken i innlegget er kort.
 */

const DEFAULT_PASSWORD = "LilleOppdager2026";
const INDEX_KEY = "lme-blog:index";
const POST_PREFIX = "lme-blog:post:";
const IMG_PREFIX = "lme-blog:img:";

function json(obj, status) {
  return new Response(JSON.stringify(obj), {
    status: status || 200,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

function cleanId(id) {
  if (typeof id !== "string") return null;
  const c = id.trim().toLowerCase();
  if (!/^[a-z0-9\-]{1,60}$/.test(c)) return null;
  return c;
}

function s(v, max) {
  return (typeof v === "string" ? v : "").slice(0, max);
}

export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const action = url.searchParams.get("action") || "list";
  if (!env.BUILDER_KV) return json({ error: "not_configured", posts: [] }, 200);
  try {
    if (action === "post") {
      const id = cleanId(url.searchParams.get("id"));
      if (!id) return json({ error: "bad_id", post: null }, 400);
      const raw = await env.BUILDER_KV.get(POST_PREFIX + id);
      return json({ post: raw ? JSON.parse(raw) : null }, 200);
    }
    if (action === "image") {
      const id = cleanId(url.searchParams.get("id"));
      if (!id) return new Response("bad_id", { status: 400 });
      const b64 = await env.BUILDER_KV.get(IMG_PREFIX + id);
      if (!b64) return new Response("not_found", { status: 404 });
      const bin = atob(b64);
      const bytes = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
      return new Response(bytes, {
        status: 200,
        headers: { "Content-Type": "image/png", "Cache-Control": "public, max-age=31536000, immutable" },
      });
    }
    const raw = await env.BUILDER_KV.get(INDEX_KEY);
    return json({ posts: raw ? JSON.parse(raw) : [] }, 200);
  } catch (e) {
    return json({ error: "read_failed", posts: [] }, 200);
  }
}

export async function onRequestPost(context) {
  const { request, env } = context;
  let body = {};
  try { body = await request.json(); } catch (e) { return json({ error: "bad_json" }, 400); }

  const expected = (env.COURSE_EDIT_PASSWORD || DEFAULT_PASSWORD) + "";
  if (((body && body.password) || "") + "" !== expected) {
    return json({ error: "bad_password" }, 401);
  }
  if (!env.BUILDER_KV) return json({ error: "not_configured" }, 200);

  const action = body.action || "save";

  if (action === "generate") return generateDraft(body, env);
  if (action === "generate-image") return generateImage(body, env, request);

  try {
    let index = [];
    const rawIdx = await env.BUILDER_KV.get(INDEX_KEY);
    if (rawIdx) { try { index = JSON.parse(rawIdx); } catch (e) { index = []; } }
    if (!Array.isArray(index)) index = [];

    if (action === "delete") {
      const id = cleanId(body.id);
      if (!id) return json({ error: "bad_id" }, 400);
      await env.BUILDER_KV.delete(POST_PREFIX + id);
      index = index.filter(function (p) { return p.id !== id; });
      await env.BUILDER_KV.put(INDEX_KEY, JSON.stringify(index));
      return json({ ok: true }, 200);
    }

    // save (create or update)
    const p = body.post || {};
    let id = cleanId(p.id);
    if (!id) id = "p" + Date.now().toString(36);

    const post = {
      id: id,
      titleNo: s(p.titleNo, 200),
      titleEn: s(p.titleEn, 200),
      excerptNo: s(p.excerptNo, 600),
      excerptEn: s(p.excerptEn, 600),
      category: s(p.category, 80),
      image: s(p.image, 500),
      date: s(p.date, 40) || new Date().toISOString().slice(0, 10),
      readMin: s(p.readMin, 10),
      url: s(p.url, 500),
      bodyNo: s(p.bodyNo, 200000),
      bodyEn: s(p.bodyEn, 200000),
      updated: new Date().toISOString(),
    };

    const full = JSON.stringify(post);
    if (full.length > 1024 * 1024) return json({ error: "too_large" }, 413);
    await env.BUILDER_KV.put(POST_PREFIX + id, full);

    const meta = {
      id: post.id, titleNo: post.titleNo, titleEn: post.titleEn,
      excerptNo: post.excerptNo, excerptEn: post.excerptEn,
      category: post.category, image: post.image, date: post.date, readMin: post.readMin, url: post.url,
    };
    index = index.filter(function (x) { return x.id !== id; });
    index.unshift(meta);
    await env.BUILDER_KV.put(INDEX_KEY, JSON.stringify(index));
    return json({ ok: true, id: id }, 200);
  } catch (e) {
    return json({ error: "write_failed" }, 200);
  }
}

/* ---------- KI-generering ---------- */

/* Skriver et komplett tospråklig utkast med Claude (samme nøkkel som
   Renate AI). Returnerer et utkast til redigeringsvinduet; ingenting
   lagres før Renate trykker "Lagre innlegg". */
async function generateDraft(body, env) {
  if (!env.ANTHROPIC_API_KEY) return json({ error: "text_unavailable" }, 200);
  const topic = s(body.topic, 500).trim();
  if (!topic) return json({ error: "missing_topic" }, 400);

  const system =
    'Du skriver blogginnlegg for Renate Dahl, montessoripedagog med over 20 års erfaring og eier av ' +
    'Little Montessori Explorers (LME). Stemmen er varm, praktisk og rett på sak, som en erfaren venninne. ' +
    'Skriveregler for norsk (bokmål), følg dem nøyaktig: ' +
    '1) Bruk rette anførselstegn "slik" og apostrof \', aldri « ». ' +
    '2) Aldri lange tankestreker (— eller –) i løpende tekst; bruk komma, kolon, punktum eller "og". ' +
    '3) Etter kolon: stor forbokstav kun når en hel setning følger, ellers liten. ' +
    '4) Liten forbokstav etter semikolon. ' +
    '5) Norske kommaregler: komma foran "men", komma etter leddsetning foran hovedsetningen, komma rundt innskutte setninger, ikke komma foran siste "og" i oppramsing. ' +
    'Svar KUN i merkeformatet du får beskrevet, ingen annen tekst.';

  const prompt =
    'Skriv et blogginnlegg for LME-bloggen om: "' + topic + '".\n\n' +
    'Krav:\n' +
    '- Norsk brødtekst på 500-700 ord og en god engelsk oversettelse.\n' +
    '- Brødteksten er enkel HTML: <p>, <h3> for 2-4 mellomtitler, <ul><li> der det passer og <strong> for viktige ord. Ingen andre elementer.\n' +
    '- Konkret og praktisk, med eksempler foreldre eller pedagoger kan bruke samme dag.\n' +
    '- Ingress på 1-2 setninger som vekker lyst til å lese.\n\n' +
    'Svar i nøyaktig dette formatet, med hvert merke på egen linje og innholdet under:\n' +
    '===TITTEL_NO===\n(tittel på norsk)\n' +
    '===TITTEL_EN===\n(tittel på engelsk)\n' +
    '===INGRESS_NO===\n(ingress på norsk)\n' +
    '===INGRESS_EN===\n(ingress på engelsk)\n' +
    '===KATEGORI===\n(kort kategori, f.eks. Tips & råd)\n' +
    '===LESETID===\n(f.eks. 4 min)\n' +
    '===BILDE===\n(en engelsk beskrivelse av et vakkert toppbilde for innlegget, uten tekst i bildet)\n' +
    '===BROEDTEKST_NO===\n(hele den norske brødteksten som HTML)\n' +
    '===BROEDTEKST_EN===\n(hele den engelske brødteksten som HTML)';

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: env.BLOG_TEXT_MODEL || "claude-sonnet-4-6",
        max_tokens: 16000,
        system: system,
        messages: [{ role: "user", content: prompt }],
      }),
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      const msg = (data && data.error && (data.error.message || data.error)) || ("Anthropic svarte " + res.status);
      return json({ error: "" + msg }, 200);
    }
    let text = "";
    ((data && data.content) || []).forEach((c) => { if (c && c.type === "text") text += c.text; });
    const draft = parseDraft(text);
    if (!draft) return json({ error: "parse_failed" }, 200);
    return json({ ok: true, draft: draft }, 200);
  } catch (e) {
    return json({ error: "generate_failed" }, 200);
  }
}

/* Merkeformat-parsing: ===MERKE=== paa egen linje, innholdet under.
   Taaler anførselstegn, linjeskift og HTML i innholdet, og gir et brukbart
   utkast selv om svaret skulle bli kuttet mot slutten. */
function parseDraft(text) {
  const t = (text || "").replace(/```[a-z]*\n?|```/g, "");
  const felt = {};
  const re = /===\s*([A-ZÆØÅ_]+)\s*===\s*\n?([\s\S]*?)(?====\s*[A-ZÆØÅ_]+\s*===|$)/g;
  let m;
  while ((m = re.exec(t)) !== null) felt[m[1]] = (m[2] || "").trim();
  const d = {
    titleNo: s(felt.TITTEL_NO, 200), titleEn: s(felt.TITTEL_EN, 200),
    excerptNo: s(felt.INGRESS_NO, 600), excerptEn: s(felt.INGRESS_EN, 600),
    bodyNo: s(felt.BROEDTEKST_NO, 200000), bodyEn: s(felt.BROEDTEKST_EN, 200000),
    category: s(felt.KATEGORI, 80), readMin: s(felt.LESETID, 10),
    imagePrompt: s(felt.BILDE, 1000),
  };
  if (!d.titleNo || !d.bodyNo) return null;
  return d;
}

/* Lager toppbilde, lagrer det i KV og returnerer en kort adresse som kan
   brukes som bildelenke. Gemini foerst (Renates oppsett, samme kall som
   Bookly), deretter OpenAI og Stability som reserver hvis noekler finnes. */
async function generateImage(body, env, request) {
  if (!env.BUILDER_KV) return json({ error: "not_configured" }, 200);
  const prompt = s(body.prompt, 1200).trim();
  if (!prompt) return json({ error: "missing_prompt" }, 400);
  // Hvem skal vaere med: "mia_teo" | "andre" | "ingen" (standard: ingen).
  const cast = s(body.cast, 20).trim().toLowerCase();

  const gKey = env.GEMINI_API_KEY || env.GOOGLE_API_KEY || env.GOOGLE_GEMINI_API_KEY;
  if (!gKey && !env.OPENAI_API_KEY && !env.STABILITY_API_KEY) {
    return json({ error: "image_unavailable", detail: "ingen bildenøkkel (GEMINI_API_KEY) i Cloudflare-innstillingene" }, 200);
  }

  // Laast LME-stil: klar og skarp Pixar/Disney-look, aldri grumsete brunt.
  const STYLE =
    "Premium 3D illustrated children's book style, soft rounded Pixar and Disney look, " +
    "crisp and sharp with clear focus, high detail, bright and vibrant colors, warm cinematic lighting, " +
    "gentle depth of field. LME brand palette: cerise pink, lime green, bright sky blue, lemon yellow, " +
    "soft cream, warm wood tones, nature greens. Never photorealistic, never muddy, dull or brown. " +
    "Absolutely no text, no words, no letters, no numbers, no logos, no watermark anywhere in the image.";
  const MIA =
    "Mia is a cheerful fictional cartoon girl: light blue eyes, golden blonde hair in a high ponytail " +
    "with a pink bow, round Pixar face, small button nose, warm friendly smile, pink floral dress, white socks, pink shoes.";
  const TEO =
    "Teo is a friendly fictional cartoon boy: brown eyes, medium brown wavy hair, round Pixar face, " +
    "warm smile, yellow and white striped shirt, blue shorts, brown shoes.";

  // Figurer i bildet, styrt av valget i redigereren.
  let castText = "";
  let refPart = null;
  if (cast === "mia_teo") {
    castText =
      " Feature exactly two children, the recurring LME characters Mia and Teo, matching the attached reference image precisely (same faces, hair and clothes). " +
      "Mia MUST have golden blonde hair in a HIGH PONYTAIL tied with a PINK BOW, and wear a pink floral dress. " +
      "Teo MUST have medium brown wavy hair and wear a YELLOW AND WHITE HORIZONTALLY STRIPED shirt with blue shorts. " +
      "Keep these details exact and clearly visible. No adults and no other children in the image, only Mia and Teo. " +
      MIA + " " + TEO + " They are best friends exploring together, never romantic.";
    // Hent det faste referansebildet, saa figurene blir like hver gang.
    try {
      const refUrl = new URL("/bookly/refs/mia-teo-ref-2.jpg", request.url).toString();
      const rr = await fetch(refUrl);
      if (rr.ok) {
        const buf = new Uint8Array(await rr.arrayBuffer());
        let bin = "";
        for (let i = 0; i < buf.length; i++) bin += String.fromCharCode(buf[i]);
        refPart = { inlineData: { mimeType: "image/jpeg", data: btoa(bin) } };
      }
    } catch (e) { /* uten referanse faller vi tilbake til bare tekst */ }
  } else if (cast === "andre") {
    castText = " Include one or two cheerful young children of varied appearance, naturally engaged in the scene.";
  }

  // Lett vaktbikkje: hold det som et ekte Montessori-miljoe, la beskrivelsen
  // fra brukeren styre hvilket materiell som vises (unngaa en konkurrerende liste).
  const MATERIALS =
    "Keep the setting an authentic Montessori prepared environment: real natural-wood Montessori equipment " +
    "arranged neatly on low open wooden shelves at child height, calm and uncluttered. " +
    "Absolutely never generic rainbow stacking toys or rainbow stackers, never Waldorf toys, never plastic toys, " +
    "never random colourful toy blocks and never a colourful board game.";

  const full =
    "Wide landscape blog header illustration for a Montessori parenting blog. Scene: " + prompt + "." +
    castText + " " + MATERIALS + " " + STYLE;

  let b64 = null;
  let lastErr = "";

  // 1) Google Gemini (samme modell og kall som Bookly)
  if (gKey) {
    try {
      const model = env.BOOKLY_GEMINI_MODEL || "gemini-2.5-flash-image";
      const gParts = [{ text: full }];
      if (refPart) gParts.push(refPart);
      const res = await fetch("https://generativelanguage.googleapis.com/v1beta/models/" + model + ":generateContent", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": gKey },
        body: JSON.stringify({
          contents: [{ parts: gParts }],
          generationConfig: { responseModalities: ["TEXT", "IMAGE"] },
        }),
      });
      const data = await res.json().catch(() => null);
      const parts = (data && data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts) || [];
      const imgPart = parts.find((pt) => (pt.inlineData && pt.inlineData.data) || (pt.inline_data && pt.inline_data.data));
      if (res.ok && imgPart) b64 = (imgPart.inlineData || imgPart.inline_data).data;
      else lastErr = (data && data.error && (data.error.message || data.error)) || ("HTTP " + (res && res.status));
    } catch (e) {
      lastErr = String((e && e.message) || e);
    }
  }

  // 2) OpenAI som reserve. Rent kall som /api/image, uten response_format/quality
  // (gpt-image-1 avviser de parameterne). Returnerer b64_json som standard.
  if (!b64 && env.OPENAI_API_KEY) {
    try {
      const model = env.BOOKLY_IMAGE_MODEL || env.IMAGE_OPENAI_MODEL || "gpt-image-1";
      const res = await fetch("https://api.openai.com/v1/images/generations", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": "Bearer " + env.OPENAI_API_KEY },
        body: JSON.stringify({ model: model, prompt: full, size: "1536x1024", n: 1 }),
      });
      const data = await res.json().catch(() => null);
      const item = data && data.data && data.data[0];
      if (res.ok && item && item.b64_json) {
        b64 = item.b64_json;
      } else if (res.ok && item && item.url) {
        const ir = await fetch(item.url);
        if (ir.ok) {
          const ibuf = new Uint8Array(await ir.arrayBuffer());
          let ibin = "";
          for (let i = 0; i < ibuf.length; i++) ibin += String.fromCharCode(ibuf[i]);
          b64 = btoa(ibin);
        }
      } else {
        lastErr = (data && data.error && (data.error.message || data.error)) || ("HTTP " + res.status);
      }
    } catch (e) {
      lastErr = String((e && e.message) || e);
    }
  }

  // 3) Stability som siste reserve
  if (!b64 && env.STABILITY_API_KEY) {
    try {
      const fd = new FormData();
      fd.append("prompt", full);
      fd.append("output_format", "png");
      fd.append("aspect_ratio", "3:2");
      const res = await fetch("https://api.stability.ai/v2beta/stable-image/generate/core", {
        method: "POST",
        headers: { "Authorization": "Bearer " + env.STABILITY_API_KEY, "Accept": "application/json" },
        body: fd,
      });
      const data = await res.json().catch(() => null);
      if (res.ok && data && data.image) b64 = data.image;
      else lastErr = (data && ((data.errors && data.errors.join("; ")) || data.message)) || lastErr;
    } catch (e) {
      lastErr = lastErr || String((e && e.message) || e);
    }
  }

  if (!b64) return json({ error: "image_failed", detail: String(lastErr || "").slice(0, 300) }, 200);
  if (b64.length > 8 * 1024 * 1024) return json({ error: "image_too_large" }, 200);

  try {
    const imgId = "b" + Date.now().toString(36) + Math.floor(Math.random() * 1e6).toString(36);
    await env.BUILDER_KV.put(IMG_PREFIX + imgId, b64);
    return json({ ok: true, url: "/api/blog?action=image&id=" + imgId }, 200);
  } catch (e) {
    return json({ error: "image_store_failed" }, 200);
  }
}
