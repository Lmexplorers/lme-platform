/**
 * LME VideoFlow, permanent media serving (R2).
 *
 * Same pattern as functions/api/miateo/media.js: finished videos are copied
 * into R2 by functions/api/videoflow/render.js once a render job completes,
 * instead of staying only on the whiteboard-engine Render.com server's own
 * (non-durable) disk.
 *
 * Requires an R2 bucket bound to this Pages project as VIDEOFLOW_MEDIA
 * (Cloudflare dashboard: lme-platform project -> Settings -> Functions ->
 * R2 bucket bindings). Can point at the same underlying bucket as
 * MIATEO_EPISODES if you'd rather manage one bucket, bindings are
 * independent of which bucket backs them.
 *
 * GET /api/videoflow/media?key=<r2 object key>   -> the file (public)
 */

function notFound() { return new Response("Not found", { status: 404 }); }

export async function onRequestGet(context) {
  const { request, env } = context;
  if (!env.VIDEOFLOW_MEDIA) return new Response("Not configured", { status: 500 });
  const key = new URL(request.url).searchParams.get("key") || "";
  if (!/^videoflow\/[a-zA-Z0-9/_\-.]{1,200}$/.test(key)) return notFound();

  const object = await env.VIDEOFLOW_MEDIA.get(key);
  if (!object) return notFound();

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("Content-Type", (object.httpMetadata && object.httpMetadata.contentType) || "video/mp4");
  headers.set("Cache-Control", "public, max-age=2592000, immutable");
  headers.set("ETag", object.httpEtag);
  return new Response(object.body, { status: 200, headers });
}
