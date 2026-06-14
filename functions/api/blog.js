/**
 * LME Blogg — lagring av blogginnlegg i Cloudflare KV (BUILDER_KV).
 * Samme passord-mekanisme som content.js / course.js (COURSE_EDIT_PASSWORD).
 *
 *  GET  /api/blog                 -> { posts: [ {meta...} ] }   (nyeste først)
 *  GET  /api/blog?action=post&id= -> { post: {full...} | null }
 *  POST /api/blog  { action:"save",   password, post:{...} } -> { ok:true, id }
 *  POST /api/blog  { action:"delete", password, id }         -> { ok:true }
 *
 * Innlegg er tospråklige: titleNo/titleEn, excerptNo/excerptEn, bodyNo/bodyEn.
 */

const DEFAULT_PASSWORD = "LilleOppdager2026";
const INDEX_KEY = "lme-blog:index";
const POST_PREFIX = "lme-blog:post:";

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
      category: post.category, image: post.image, date: post.date, readMin: post.readMin,
    };
    index = index.filter(function (x) { return x.id !== id; });
    index.unshift(meta);
    await env.BUILDER_KV.put(INDEX_KEY, JSON.stringify(index));
    return json({ ok: true, id: id }, 200);
  } catch (e) {
    return json({ error: "write_failed" }, 200);
  }
}
