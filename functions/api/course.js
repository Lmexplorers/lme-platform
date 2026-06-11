/**
 * LME Akademiet — redigerbart kursinnhold lagret i Cloudflare KV
 *
 * GET  /api/course?id=/academy/intro
 *        -> { html: <string|null> }   (offentlig: leverer lagret tekst)
 *
 * POST /api/course   body { id, html, password }
 *        -> { ok: true }              (krever riktig passord)
 *
 * Bruker samme KV-binding som byggeren: BUILDER_KV.
 * Passord settes helst som hemmelighet COURSE_EDIT_PASSWORD i Cloudflare
 * (Workers & Pages → prosjektet → Settings → Variables and Secrets).
 * Hvis ingen er satt, brukes standardpassordet under.
 */

const DEFAULT_PASSWORD = "LilleOppdager2026";

function json(data, status) {
  return new Response(JSON.stringify(data), {
    status: status || 200,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

// Kun gyldige akademi-stier slipper gjennom, og blir til en trygg KV-nøkkel.
function keyFromId(id) {
  if (typeof id !== "string") return null;
  const clean = id.trim().replace(/\.html$/, "").replace(/\/+$/, "");
  if (!/^\/academy\/[a-z0-9\-]+$/i.test(clean)) return null;
  return "lme-builder:course:" + clean;
}

export async function onRequestGet(context) {
  const { request, env } = context;
  const id = new URL(request.url).searchParams.get("id") || "";
  const key = keyFromId(id);
  if (!key) return json({ error: "bad_id", html: null }, 400);
  if (!env.BUILDER_KV) return json({ error: "not_configured", html: null }, 200);
  try {
    const html = await env.BUILDER_KV.get(key);
    return json({ html: html }, 200);
  } catch (e) {
    return json({ error: "read_failed", html: null }, 200);
  }
}

export async function onRequestPost(context) {
  const { request, env } = context;
  if (!env.BUILDER_KV) return json({ error: "not_configured" }, 200);
  let body;
  try {
    body = await request.json();
  } catch (e) {
    return json({ error: "bad_json" }, 400);
  }
  const expected = (env.COURSE_EDIT_PASSWORD || DEFAULT_PASSWORD) + "";
  if (((body && body.password) || "") + "" !== expected) {
    return json({ error: "bad_password" }, 401);
  }
  const key = keyFromId(body && body.id);
  if (!key) return json({ error: "bad_id" }, 400);
  const html = typeof body.html === "string" ? body.html : "";
  if (!html) return json({ error: "empty" }, 400);
  if (html.length > 1024 * 1024) return json({ error: "too_large" }, 413);
  try {
    await env.BUILDER_KV.put(key, html);
    return json({ ok: true }, 200);
  } catch (e) {
    return json({ error: "write_failed" }, 200);
  }
}
