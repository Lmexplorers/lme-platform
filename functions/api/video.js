/**
 * LME — lagrer en generert kort video og gir en offentlig URL (for Blotato).
 *
 * Reel Studio lager videoen i nettleseren (bilde -> 9:16 Ken Burns via FFmpeg),
 * og laster den opp hit. Vi lagrer den i BUILDER_KV og serverer den på en
 * offentlig URL som Blotato kan hente og re-hoste. Samme mønster som /api/image.
 *
 *   POST /api/video   { data: "<base64 mp4>", contentType?: "video/mp4" }
 *     -> { url: "https://.../api/video?id=<id>" }
 *   GET  /api/video?id=<id>   -> selve videoen
 */

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

function b64ToBytes(b64) {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

// Cloudflare KV tåler opptil 25 MB per verdi. En kort 9:16-klipp er langt mindre.
const MAX_BYTES = 24 * 1024 * 1024;

export async function onRequestPost(context) {
  const { request, env } = context;
  if (!env.BUILDER_KV) return json({ error: "not_configured" }, 200);

  let body;
  try { body = await request.json(); }
  catch { return json({ error: "Ugyldig JSON" }, 400); }

  let b64 = String(body.data || "");
  const comma = b64.indexOf(",");
  if (b64.startsWith("data:") && comma !== -1) b64 = b64.slice(comma + 1); // tåler data-URL
  if (!b64) return json({ error: "Ingen video mottatt." }, 400);

  let bytes;
  try { bytes = b64ToBytes(b64); }
  catch { return json({ error: "Ugyldig video-data." }, 400); }
  if (bytes.length > MAX_BYTES) return json({ error: "Videoen er for stor (maks 24 MB). Lag en kortere reel." }, 413);

  const contentType = /^video\/(mp4|webm|quicktime)$/.test(String(body.contentType || ""))
    ? body.contentType : "video/mp4";

  const id = crypto.randomUUID().replace(/-/g, "");
  try {
    await env.BUILDER_KV.put("vid:" + id, bytes, {
      metadata: { ct: contentType },
      expirationTtl: 60 * 60 * 24 * 30, // 30 dager
    });
  } catch (e) {
    return json({ error: "Klarte ikke å lagre videoen." }, 500);
  }

  const origin = new URL(request.url).origin;
  return json({ url: `${origin}/api/video?id=${id}` }, 200);
}

export async function onRequestGet(context) {
  const { request, env } = context;
  const id = new URL(request.url).searchParams.get("id") || "";
  if (!/^[a-f0-9]{16,40}$/i.test(id)) return new Response("Not found", { status: 404 });
  if (!env.BUILDER_KV) return new Response("Not configured", { status: 500 });

  const res = await env.BUILDER_KV.getWithMetadata("vid:" + id, { type: "arrayBuffer" });
  if (!res || !res.value) return new Response("Not found", { status: 404 });
  const ct = (res.metadata && res.metadata.ct) || "video/mp4";
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
