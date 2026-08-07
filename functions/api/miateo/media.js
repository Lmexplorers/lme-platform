/**
 * Mia & Teo Video Creator, permanent media serving (R2).
 *
 * Finished episodes are copied into R2 by functions/api/miateo/render.js
 * once a render job completes, instead of staying only on the
 * whiteboard-engine Render.com server's own (non-durable) disk. This route
 * serves those files back out publicly, streamed straight from R2, no size
 * limit like the KV blob pattern (img:/vid:) used elsewhere on the platform.
 *
 * Requires an R2 bucket bound to this Pages project as MIATEO_EPISODES
 * (Cloudflare dashboard: lme-platform project -> Settings -> Functions ->
 * R2 bucket bindings -> variable name MIATEO_EPISODES). Until that binding
 * exists, render.js falls back to serving straight from the render engine
 * (temporary, see docs/mia-teo-video-creator.md).
 *
 * GET /api/miateo/media?key=<r2 object key>   -> the file (public)
 */

function notFound() { return new Response("Not found", { status: 404 }); }

export async function onRequestGet(context) {
  const { request, env } = context;
  if (!env.MIATEO_EPISODES) return new Response("Not configured", { status: 500 });
  const key = new URL(request.url).searchParams.get("key") || "";
  if (!/^miateo\/[a-zA-Z0-9/_\-.]{1,200}$/.test(key)) return notFound();

  const object = await env.MIATEO_EPISODES.get(key);
  if (!object) return notFound();

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("Content-Type", (object.httpMetadata && object.httpMetadata.contentType) || "video/mp4");
  headers.set("Cache-Control", "public, max-age=2592000, immutable");
  headers.set("ETag", object.httpEtag);
  return new Response(object.body, { status: 200, headers });
}
