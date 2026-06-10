/**
 * LME — redigerbare tekstblokker lagret i Cloudflare KV.
 *
 * GET  /api/content?id=/mia-og-teo
 *        -> { blocks: { <key>: <html>, ... } }   (offentlig)
 *
 * POST /api/content   body { id, password, blocks: { <key>: <html> } }
 *        -> { ok: true }                          (krever riktig passord)
 *
 * Lagrer én JSON-verdi per side: alle redigerte blokker samlet.
 * Bruker samme KV-binding som byggeren: BUILDER_KV.
 * Passord: hemmeligheten COURSE_EDIT_PASSWORD (samme som kursredigering),
 * ellers standardpassordet under.
 */

const DEFAULT_PASSWORD = "LilleOppdager2026";

function json(data, status) {
  return new Response(JSON.stringify(data), {
    status: status || 200,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

// Gjør en side-sti om til en trygg KV-nøkkel.
function keyFromId(id) {
  if (typeof id !== "string") return null;
  let clean = id.trim().replace(/\.html$/, "").replace(/\/+$/, "");
  if (clean === "") clean = "/index";
  if (!/^\/[a-z0-9\-\/]+$/i.test(clean)) return null;
  return "lme-builder:content:" + clean.slice(0, 180);
}

export async function onRequestGet(context) {
  const { request, env } = context;
  const id = new URL(request.url).searchParams.get("id") || "";
  const key = keyFromId(id);
  if (!key) return json({ error: "bad_id", blocks: {} }, 400);
  if (!env.BUILDER_KV) return json({ error: "not_configured", blocks: {} }, 200);
  try {
    const raw = await env.BUILDER_KV.get(key);
    let blocks = {};
    if (raw) { try { blocks = JSON.parse(raw); } catch (e) { blocks = {}; } }
    return json({ blocks: blocks }, 200);
  } catch (e) {
    return json({ error: "read_failed", blocks: {} }, 200);
  }
}

export async function onRequestPost(context) {
  const { request, env } = context;
  if (!env.BUILDER_KV) return json({ error: "not_configured" }, 200);
  let body;
  try { body = await request.json(); } catch (e) { return json({ error: "bad_json" }, 400); }

  const expected = (env.COURSE_EDIT_PASSWORD || DEFAULT_PASSWORD) + "";
  if (((body && body.password) || "") + "" !== expected) {
    return json({ error: "bad_password" }, 401);
  }

  const key = keyFromId(body && body.id);
  if (!key) return json({ error: "bad_id" }, 400);

  const incoming = body && body.blocks;
  if (!incoming || typeof incoming !== "object") return json({ error: "no_blocks" }, 400);

  try {
    // Slå sammen med det som allerede er lagret.
    let current = {};
    const raw = await env.BUILDER_KV.get(key);
    if (raw) { try { current = JSON.parse(raw); } catch (e) { current = {}; } }
    for (const k in incoming) {
      if (Object.prototype.hasOwnProperty.call(incoming, k)) {
        const v = incoming[k];
        if (typeof v === "string") current[String(k).slice(0, 120)] = v.slice(0, 200000);
      }
    }
    const out = JSON.stringify(current);
    if (out.length > 1024 * 1024) return json({ error: "too_large" }, 413);
    await env.BUILDER_KV.put(key, out);
    return json({ ok: true }, 200);
  } catch (e) {
    return json({ error: "write_failed" }, 200);
  }
}
