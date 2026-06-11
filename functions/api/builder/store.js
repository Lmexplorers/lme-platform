/**
 * LME Builder — lagring i Cloudflare KV
 *
 * GET  /api/builder/store?key=...        -> { value: <string|null> }
 * POST /api/builder/store?key=...  body { value } -> { ok: true }
 *
 * Krever en KV-binding kalt BUILDER_KV på Pages-prosjektet.
 * (Workers & Pages → prosjektet → Settings → Bindings → KV namespace →
 *  Variable name: BUILDER_KV → velg «lme-builder».)
 */

function json(data, status) {
  return new Response(JSON.stringify(data), {
    status: status || 200,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

function keyFrom(url) {
  const k = new URL(url).searchParams.get("key") || "";
  // Begrens til byggerens egne nøkler for sikkerhets skyld
  if (!/^lme-builder[:_-]/.test(k)) return null;
  return k.slice(0, 200);
}

export async function onRequestGet(context) {
  const { request, env } = context;
  if (!env.BUILDER_KV) return json({ error: "not_configured", value: null }, 200);
  const key = keyFrom(request.url);
  if (!key) return json({ error: "bad_key", value: null }, 400);
  try {
    const value = await env.BUILDER_KV.get(key);
    return json({ value: value }, 200);
  } catch (e) {
    return json({ error: "read_failed", value: null }, 200);
  }
}

export async function onRequestPost(context) {
  const { request, env } = context;
  if (!env.BUILDER_KV) return json({ error: "not_configured" }, 200);
  const key = keyFrom(request.url);
  if (!key) return json({ error: "bad_key" }, 400);
  let body;
  try {
    body = await request.json();
  } catch (e) {
    return json({ error: "bad_json" }, 400);
  }
  const value = typeof body.value === "string" ? body.value : JSON.stringify(body.value);
  if (value.length > 24 * 1024 * 1024) return json({ error: "too_large" }, 413);
  try {
    await env.BUILDER_KV.put(key, value);
    return json({ ok: true }, 200);
  } catch (e) {
    return json({ error: "write_failed" }, 200);
  }
}
