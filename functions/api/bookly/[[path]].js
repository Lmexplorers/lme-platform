/**
 * LME Bookly™ — backend (Cloudflare Pages Functions)
 *
 * Ruter:
 *   POST /api/bookly/ai        { system, prompt, max_tokens } -> { text }
 *        AI-tekstgenerering. Bruker ANTHROPIC_API_KEY (samme som Renate AI),
 *        med OPENAI_API_KEY som reserve hvis den finnes.
 *
 *   GET  /api/bookly/library   -> { library } (krever innlogget LME-bruker)
 *   POST /api/bookly/library   { projects, folders, ... } -> { ok }
 *        Synkroniserer brukerens Bookly-bibliotek til KV (BUILDER_KV),
 *        en JSON-verdi per bruker: bookly:lib:<uid>
 *
 * Auth deles med resten av plattformen: sesjons-cookien lme_sess
 * (satt av /api/auth/*) slås opp i KV.
 */

function json(data, status) {
  return new Response(JSON.stringify(data), {
    status: status || 200,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

function readCookies(request) {
  const out = {};
  (request.headers.get("Cookie") || "").split(";").forEach((p) => {
    const i = p.indexOf("=");
    if (i > 0) out[p.slice(0, i).trim()] = p.slice(i + 1).trim();
  });
  return out;
}

async function sessionFrom(context) {
  const { request, env } = context;
  const sid = readCookies(request)["lme_sess"];
  if (!sid || !env.BUILDER_KV) return null;
  const raw = await env.BUILDER_KV.get("sess:" + sid);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch (e) { return null; }
}

const libKey = (uid) => "bookly:lib:" + uid;

/* Låst Mia & Teo-karakterprompt (fra brand/master-creative-bible).
   Ligger kun her på serveren og leveres bare til innloggede eiere. */
const MIA_TEO_PROMPT =
  "Mia and Teo, two six-year-old best friends, premium Disney/Pixar-inspired 3D animation style with NRK Super warmth. " +
  "Mia: light blue eyes, golden light-blonde hair in a high ponytail with a pink bow, warm smile, round Pixar-inspired face, " +
  "small button nose, pink floral dress, white socks, pink shoes, pink backpack. " +
  "Teo: brown eyes, medium-brown softly wavy slightly tousled hair, warm smile, round Pixar-inspired face, " +
  "yellow-and-white striped shirt, blue shorts, brown shoes, green backpack, adventurous expression. " +
  "Best friends with equal visual importance and supportive, positive body language, never romantic framing. " +
  "CRITICAL CHARACTER LOCK: Mia and Teo must look EXACTLY like this in every single image, with zero changes: " +
  "identical faces, identical eye color, identical hair color and hairstyle, identical proportions and identical art style. " +
  "Their standard outfits are as described above. NEVER add jackets, coats, hats or any extra clothing unless the scene " +
  "description explicitly asks for it. If the scene description specifies clothing, follow the scene description. " +
  "Do not change, restyle, age, simplify or redesign the characters in ANY way. " +
  "Only the pose, the scene and the background may change between images. " +
  "Animals never talk, environments feel alive, magical, safe and premium with warm light and depth.";

/* Identitetslås som alltid legges på når referansebilder brukes. */
const REF_LOCK =
  "\n\nCRITICAL: The characters shown in the attached reference images must keep EXACTLY the same identity: " +
  "same faces, same eyes, same hair color and hairstyle, same proportions and same art style. Do not redesign, restyle or age them. " +
  "Clothing: keep their standard outfits from the references, but if the scene description above specifies clothing, " +
  "the scene description WINS. NEVER add jackets, coats or extra clothing unless the scene description explicitly asks for it. " +
  "Only the pose, scene and background may change.";

export async function onRequestGet(context) {
  const { params, env } = context;
  const path = (params.path || []).join("/");

  /* Mia & Teo-karakterprompt: kun for eier */
  if (path === "charprompt") {
    const sess = await sessionFrom(context);
    if (!sess || sess.role !== "owner") return json({ error: "forbidden" }, 403);
    return json({ prompt: MIA_TEO_PROMPT }, 200);
  }

  /* Status: viser hvilke AI-nøkler serveren ser (kun ja/nei, aldri verdier) */
  if (path === "status") {
    return json({
      text: !!(env.ANTHROPIC_API_KEY || env.OPENAI_API_KEY),
      textProvider: env.ANTHROPIC_API_KEY ? "anthropic" : (env.OPENAI_API_KEY ? "openai" : null),
      image: !!(env.OPENAI_API_KEY || env.GEMINI_API_KEY || env.GOOGLE_API_KEY || env.STABILITY_API_KEY),
      providers: {
        openai: !!env.OPENAI_API_KEY,
        gemini: !!(env.GEMINI_API_KEY || env.GOOGLE_API_KEY),
        stability: !!env.STABILITY_API_KEY,
      },
      kv: !!env.BUILDER_KV,
    }, 200);
  }

  if (path === "library") {
    const sess = await sessionFrom(context);
    if (!sess) return json({ error: "not_logged_in", library: null }, 200);
    try {
      const raw = await env.BUILDER_KV.get(libKey(sess.uid));
      return json({ library: raw ? JSON.parse(raw) : null }, 200);
    } catch (e) {
      return json({ error: "read_failed", library: null }, 200);
    }
  }
  return json({ error: "not_found" }, 404);
}

export async function onRequestPost(context) {
  const { request, params, env } = context;
  const path = (params.path || []).join("/");

  let body;
  try { body = await request.json(); } catch (e) { return json({ error: "bad_json" }, 400); }

  /* ---------- Bildegenerering (OpenAI / Google Gemini / Stability AI) ---------- */
  if (path === "image") {
    const prompt = String(body.prompt || "").slice(0, 3000);
    if (!prompt) return json({ error: "no_prompt" }, 400);
    const size = ["1024x1024", "1024x1536", "1536x1024"].indexOf(body.size) !== -1 ? body.size : "1024x1024";
    const quality = ["low", "medium", "high"].indexOf(body.quality) !== -1
      ? body.quality : (env.BOOKLY_IMAGE_QUALITY || "medium");
    const n = Math.min(3, Math.max(1, parseInt(body.n, 10) || 1));
    const refs = Array.isArray(body.refs) ? body.refs.slice(0, 3) : [];
    const provider = ["openai", "gemini", "stability"].indexOf(body.provider) !== -1 ? body.provider : "openai";
    let lastErr = null;

    const fullPrompt = (refs.length && prompt.indexOf("CRITICAL") === -1) ? prompt + REF_LOCK : prompt;

    /* --- Google Gemini (utmerket på karakter-konsistens med referanser) --- */
    if (provider === "gemini") {
      const gKey = env.GEMINI_API_KEY || env.GOOGLE_API_KEY;
      if (!gKey) return json({ error: "image_unavailable", detail: "GEMINI_API_KEY mangler i Cloudflare-innstillingene" }, 200);
      const parts = [{ text: fullPrompt }];
      refs.forEach((r) => {
        const m = /^data:(image\/(?:png|jpe?g|webp));base64,([A-Za-z0-9+/=]+)$/.exec(r || "");
        if (m) parts.push({ inline_data: { mime_type: m[1], data: m[2] } });
      });
      const model = env.BOOKLY_GEMINI_MODEL || "gemini-2.5-flash-image";
      async function oneGemini() {
        const res = await fetch("https://generativelanguage.googleapis.com/v1beta/models/" + model + ":generateContent", {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-goog-api-key": gKey },
          body: JSON.stringify({
            contents: [{ parts }],
            generationConfig: { responseModalities: ["TEXT", "IMAGE"] },
          }),
        });
        const data = await res.json();
        const outParts = (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts) || [];
        const imgPart = outParts.find((pt) => (pt.inlineData && pt.inlineData.data) || (pt.inline_data && pt.inline_data.data));
        if (res.ok && imgPart) return (imgPart.inlineData || imgPart.inline_data).data;
        throw new Error((data.error && data.error.message) || ("HTTP " + res.status));
      }
      try {
        const b64s = await Promise.all(Array.from({ length: n }, oneGemini));
        return json({ b64: b64s[0], b64s }, 200);
      } catch (e) {
        return json({ error: "image_failed", detail: String((e && e.message) || e).slice(0, 300) }, 200);
      }
    }

    /* --- Stability AI (Stable Image Core) --- */
    if (provider === "stability") {
      if (!env.STABILITY_API_KEY) return json({ error: "image_unavailable", detail: "STABILITY_API_KEY mangler i Cloudflare-innstillingene" }, 200);
      const aspect = size === "1024x1536" ? "2:3" : size === "1536x1024" ? "3:2" : "1:1";
      async function oneStability() {
        const fd = new FormData();
        fd.append("prompt", fullPrompt);
        fd.append("output_format", "png");
        fd.append("aspect_ratio", aspect);
        const res = await fetch("https://api.stability.ai/v2beta/stable-image/generate/core", {
          method: "POST",
          headers: { "Authorization": "Bearer " + env.STABILITY_API_KEY, "Accept": "application/json" },
          body: fd,
        });
        const data = await res.json();
        if (res.ok && data.image) return data.image;
        throw new Error((data.errors && data.errors.join("; ")) || data.message || ("HTTP " + res.status));
      }
      try {
        const b64s = await Promise.all(Array.from({ length: n }, oneStability));
        return json({ b64: b64s[0], b64s }, 200);
      } catch (e) {
        return json({ error: "image_failed", detail: String((e && e.message) || e).slice(0, 300) }, 200);
      }
    }

    /* --- OpenAI (standard) --- */
    if (!env.OPENAI_API_KEY) return json({ error: "image_unavailable" }, 200);

    /* Med referansebilder: bruk edits-endepunktet, som tar inn bilder og
       bevarer karakterenes utseende (krever gpt-image-1). */
    if (refs.length) {
      try {
        const fd = new FormData();
        fd.append("model", env.BOOKLY_IMAGE_MODEL || "gpt-image-1");
        fd.append("prompt", prompt.indexOf("CRITICAL") !== -1 ? prompt : prompt + REF_LOCK);
        fd.append("size", size);
        fd.append("quality", quality);
        fd.append("n", String(n));
        let added = 0;
        for (let i = 0; i < refs.length; i++) {
          const m = /^data:(image\/(?:png|jpe?g|webp));base64,([A-Za-z0-9+/=]+)$/.exec(refs[i] || "");
          if (!m) continue;
          const bin = Uint8Array.from(atob(m[2]), (c) => c.charCodeAt(0));
          const ext = m[1] === "image/png" ? ".png" : m[1] === "image/webp" ? ".webp" : ".jpg";
          fd.append("image[]", new Blob([bin], { type: m[1] }), "ref" + i + ext);
          added++;
        }
        if (added) {
          const res = await fetch("https://api.openai.com/v1/images/edits", {
            method: "POST",
            headers: { "Authorization": "Bearer " + env.OPENAI_API_KEY },
            body: fd,
          });
          const data = await res.json();
          const b64s = ((data && data.data) || []).map((x) => x && x.b64_json).filter(Boolean);
          if (res.ok && b64s.length) return json({ b64: b64s[0], b64s }, 200);
          lastErr = (data && data.error && data.error.message) || ("HTTP " + res.status);
          return json({ error: "image_failed", detail: String(lastErr || "").slice(0, 300) }, 200);
        }
      } catch (e) {
        return json({ error: "image_failed", detail: String((e && e.message) || e).slice(0, 300) }, 200);
      }
    }

    // 1) gpt-image-1 (nyeste, best kvalitet)
    try {
      const res = await fetch("https://api.openai.com/v1/images/generations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + env.OPENAI_API_KEY,
        },
        body: JSON.stringify({
          model: env.BOOKLY_IMAGE_MODEL || "gpt-image-1",
          prompt: prompt,
          size: size,
          quality: quality,
          n: n,
        }),
      });
      const data = await res.json();
      const b64s = ((data && data.data) || []).map((x) => x && x.b64_json).filter(Boolean);
      if (res.ok && b64s.length) return json({ b64: b64s[0], b64s }, 200);
      lastErr = (data && data.error && data.error.message) || ("HTTP " + res.status);
    } catch (e) { lastErr = String((e && e.message) || e); }

    // 2) dall-e-3 som reserve
    try {
      const res = await fetch("https://api.openai.com/v1/images/generations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + env.OPENAI_API_KEY,
        },
        body: JSON.stringify({
          model: "dall-e-3",
          prompt: prompt,
          size: "1024x1024",
          response_format: "b64_json",
          n: 1,
        }),
      });
      const data = await res.json();
      const b64 = data && data.data && data.data[0] && data.data[0].b64_json;
      if (res.ok && b64) return json({ b64 }, 200);
      lastErr = (data && data.error && data.error.message) || lastErr || ("HTTP " + res.status);
    } catch (e) { lastErr = lastErr || String((e && e.message) || e); }

    return json({ error: "image_failed", detail: String(lastErr || "").slice(0, 300) }, 200);
  }

  /* ---------- AI-generering ---------- */
  if (path === "ai") {
    const system = String(body.system || "").slice(0, 4000);
    const prompt = String(body.prompt || "").slice(0, 12000);
    if (!prompt) return json({ error: "no_prompt" }, 400);
    const maxTokens = Math.min(Math.max(parseInt(body.max_tokens, 10) || 3000, 256), 8000);

    if (env.ANTHROPIC_API_KEY) {
      try {
        const res = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": env.ANTHROPIC_API_KEY,
            "anthropic-version": "2023-06-01",
          },
          body: JSON.stringify({
            model: env.BOOKLY_MODEL || "claude-sonnet-4-6",
            max_tokens: maxTokens,
            system: system,
            messages: [{ role: "user", content: prompt }],
          }),
        });
        const data = await res.json();
        if (res.ok && data.content && data.content[0] && data.content[0].text) {
          return json({ text: data.content[0].text }, 200);
        }
        // fall videre til OpenAI hvis konfigurert
      } catch (e) { /* prøv reserve */ }
    }

    if (env.OPENAI_API_KEY) {
      try {
        const res = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + env.OPENAI_API_KEY,
          },
          body: JSON.stringify({
            model: env.BOOKLY_OPENAI_MODEL || "gpt-4o-mini",
            max_tokens: maxTokens,
            messages: [
              { role: "system", content: system },
              { role: "user", content: prompt },
            ],
          }),
        });
        const data = await res.json();
        const text = data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content;
        if (res.ok && text) return json({ text }, 200);
      } catch (e) { /* gi opp */ }
    }

    return json({ error: "ai_unavailable" }, 200);
  }

  /* ---------- Bibliotek-synk (fletter, erstatter aldri blindt) ---------- */
  if (path === "library") {
    const sess = await sessionFrom(context);
    if (!sess) return json({ error: "not_logged_in" }, 401);

    const incoming = {
      projects: Array.isArray(body.projects) ? body.projects : [],
      folders: Array.isArray(body.folders) ? body.folders : [],
      exports: Array.isArray(body.exports) ? body.exports.slice(0, 60) : [],
      savedPrompts: Array.isArray(body.savedPrompts) ? body.savedPrompts : [],
      settings: body.settings || {},
      deleted: body.deleted && typeof body.deleted === "object" ? body.deleted : {},
    };

    /* Flett med det som ligger lagret: en enhet som mangler prosjekter
       (f.eks. en fersk mobil) kan da aldri slette dem fra skyen.
       Sletting skjer kun via slettemerker (deleted: id -> tidspunkt). */
    let current = null;
    try {
      const raw = await env.BUILDER_KV.get(libKey(sess.uid));
      if (raw) current = JSON.parse(raw);
    } catch (e) { current = null; }

    function hydrateImages(winner, loser) {
      if (!winner || !loser) return;
      const src = {};
      (loser.pages || []).forEach((pg) => { src[pg.id] = pg; });
      (winner.pages || []).forEach((pg) => {
        const s = src[pg.id];
        if (s && s.data && s.data.image && pg.data && !pg.data.image) pg.data.image = s.data.image;
      });
      if (loser.cover && loser.cover.image && winner.cover && !winner.cover.image) winner.cover.image = loser.cover.image;
      if ((loser.refs || []).length && !(winner.refs || []).length) winner.refs = loser.refs;
    }

    let lib;
    if (!current) {
      lib = incoming;
    } else {
      const byId = {};
      (current.projects || []).forEach((p) => { byId[p.id] = p; });
      (incoming.projects || []).forEach((p) => {
        const c = byId[p.id];
        if (!c) { byId[p.id] = p; return; }
        if ((p.updated || 0) >= (c.updated || 0)) {
          hydrateImages(p, c);
          byId[p.id] = p;
        } else {
          hydrateImages(c, p);
        }
      });
      // Slettemerker: nyeste tidspunkt vinner, og fjerner eldre prosjekter
      const dead = {};
      Object.keys(current.deleted || {}).forEach((k) => { dead[k] = current.deleted[k]; });
      Object.keys(incoming.deleted || {}).forEach((k) => {
        if (!dead[k] || incoming.deleted[k] > dead[k]) dead[k] = incoming.deleted[k];
      });
      Object.keys(dead).forEach((id) => {
        const pr = byId[id];
        if (pr && dead[id] >= (pr.updated || 0)) delete byId[id];
      });
      const fIds = {};
      (current.folders || []).concat(incoming.folders || []).forEach((f) => { fIds[f.id] = f; });

      lib = {
        projects: Object.keys(byId).map((k) => byId[k]),
        folders: Object.keys(fIds).map((k) => fIds[k]),
        exports: (incoming.exports || []).length ? incoming.exports : (current.exports || []),
        savedPrompts: (incoming.savedPrompts || []).length >= (current.savedPrompts || []).length
          ? incoming.savedPrompts : current.savedPrompts,
        settings: Object.assign({}, current.settings || {}, incoming.settings || {}),
        deleted: dead,
      };
    }
    lib.updated = Date.now();

    const out = JSON.stringify(lib);
    if (out.length > 20 * 1024 * 1024) return json({ error: "too_large" }, 413);
    try {
      await env.BUILDER_KV.put(libKey(sess.uid), out);
      return json({ ok: true, projects: (lib.projects || []).length }, 200);
    } catch (e) {
      return json({ error: "write_failed" }, 200);
    }
  }

  return json({ error: "not_found" }, 404);
}
