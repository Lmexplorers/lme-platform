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

export async function onRequestGet(context) {
  const { params, env } = context;
  const path = (params.path || []).join("/");

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

  /* ---------- Bibliotek-synk ---------- */
  if (path === "library") {
    const sess = await sessionFrom(context);
    if (!sess) return json({ error: "not_logged_in" }, 401);
    const lib = {
      projects: Array.isArray(body.projects) ? body.projects : [],
      folders: Array.isArray(body.folders) ? body.folders : [],
      exports: Array.isArray(body.exports) ? body.exports.slice(0, 60) : [],
      savedPrompts: Array.isArray(body.savedPrompts) ? body.savedPrompts : [],
      settings: body.settings || {},
      updated: Date.now(),
    };
    const out = JSON.stringify(lib);
    if (out.length > 20 * 1024 * 1024) return json({ error: "too_large" }, 413);
    try {
      await env.BUILDER_KV.put(libKey(sess.uid), out);
      return json({ ok: true }, 200);
    } catch (e) {
      return json({ error: "write_failed" }, 200);
    }
  }

  return json({ error: "not_found" }, 404);
}
