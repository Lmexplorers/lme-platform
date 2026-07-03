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
  if (action === "generate-image") return generateImage(body, env);

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
    'Svar KUN med et gyldig JSON-objekt, ingen annen tekst og ingen kodeblokk.';

  const prompt =
    'Skriv et blogginnlegg for LME-bloggen om: "' + topic + '".\n\n' +
    'Krav:\n' +
    '- Norsk brødtekst på 500-800 ord og en god engelsk oversettelse.\n' +
    '- Brødteksten er enkel HTML: <p>, <h3> for 2-4 mellomtitler, <ul><li> der det passer og <strong> for viktige ord. Ingen andre elementer.\n' +
    '- Konkret og praktisk, med eksempler foreldre eller pedagoger kan bruke samme dag.\n' +
    '- Ingress på 1-2 setninger som vekker lyst til å lese.\n\n' +
    'Svar med nøyaktig dette JSON-formatet:\n' +
    '{"titleNo":"...","titleEn":"...","excerptNo":"...","excerptEn":"...",' +
    '"bodyNo":"<p>...</p>","bodyEn":"<p>...</p>","category":"...","readMin":"X min",' +
    '"imagePrompt":"en engelsk beskrivelse av et vakkert toppbilde for innlegget, uten tekst i bildet"}';

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
        max_tokens: 6000,
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

/* Robust JSON-parsing: modellen kan pakke svaret i kodeblokk. */
function parseDraft(text) {
  let t = (text || "").trim();
  const fence = t.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fence) t = fence[1].trim();
  const start = t.indexOf("{");
  const end = t.lastIndexOf("}");
  if (start === -1 || end <= start) return null;
  try {
    const d = JSON.parse(t.slice(start, end + 1));
    return {
      titleNo: s(d.titleNo, 200), titleEn: s(d.titleEn, 200),
      excerptNo: s(d.excerptNo, 600), excerptEn: s(d.excerptEn, 600),
      bodyNo: s(d.bodyNo, 200000), bodyEn: s(d.bodyEn, 200000),
      category: s(d.category, 80), readMin: s(d.readMin, 10),
      imagePrompt: s(d.imagePrompt, 1000),
    };
  } catch (e) {
    return null;
  }
}

/* Lager toppbilde med OpenAI (samme nøkkel som Bookly), lagrer det i KV
   og returnerer en kort adresse som kan brukes som bildelenke. */
async function generateImage(body, env) {
  if (!env.OPENAI_API_KEY) return json({ error: "image_unavailable" }, 200);
  if (!env.BUILDER_KV) return json({ error: "not_configured" }, 200);
  const prompt = s(body.prompt, 1200).trim();
  if (!prompt) return json({ error: "missing_prompt" }, 400);

  const full =
    "Warm, inviting blog header illustration for a Montessori parenting blog: " + prompt + ". " +
    "Soft pastel palette with gentle pink and cream tones, cozy and natural, high quality, no text in the image.";

  let b64 = null;
  try {
    const res = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": "Bearer " + env.OPENAI_API_KEY },
      body: JSON.stringify({ model: "gpt-image-1", prompt: full, size: "1536x1024", quality: "medium", n: 1 }),
    });
    const data = await res.json().catch(() => null);
    if (res.ok && data && data.data && data.data[0] && data.data[0].b64_json) b64 = data.data[0].b64_json;
  } catch (e) { /* proever reserven under */ }

  if (!b64) {
    try {
      const res = await fetch("https://api.openai.com/v1/images/generations", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": "Bearer " + env.OPENAI_API_KEY },
        body: JSON.stringify({ model: "dall-e-3", prompt: full, size: "1792x1024", response_format: "b64_json", n: 1 }),
      });
      const data = await res.json().catch(() => null);
      if (res.ok && data && data.data && data.data[0] && data.data[0].b64_json) b64 = data.data[0].b64_json;
    } catch (e) { /* gir beskjed under */ }
  }

  if (!b64) return json({ error: "image_failed" }, 200);
  if (b64.length > 8 * 1024 * 1024) return json({ error: "image_too_large" }, 200);

  try {
    const imgId = "b" + Date.now().toString(36) + Math.floor(Math.random() * 1e6).toString(36);
    await env.BUILDER_KV.put(IMG_PREFIX + imgId, b64);
    return json({ ok: true, url: "/api/blog?action=image&id=" + imgId }, 200);
  } catch (e) {
    return json({ error: "image_store_failed" }, 200);
  }
}
