/**
 * 10 000-visninger-utfordringen — fellesskapsvegg (innlegg og kommentarer).
 *
 * Enkel, isolert vegg for betalende medlemmer av utfordringen, helt
 * uavhengig av Inner Circle. Medlemskap sjekkes mot utf_member:<e-post>,
 * som skrives av webhooken (oppskrift-webhook.js) og eier-ruten
 * (utfordring-preview.js) ved kjøp/tilgang. Ingen passord, bare e-post +
 * navn, lagret i nettleseren etter første "bli med".
 *
 *   GET  /api/utfordring-community                       -> { posts:[...] }
 *   POST /api/utfordring-community  { action:"join", email, name }
 *   POST /api/utfordring-community  { action:"post", email, name, text }
 *   POST /api/utfordring-community  { action:"comment", email, name, postId, text }
 *   POST /api/utfordring-community  { action:"like", email, postId }
 */

const INDEX_KEY = "utf_wall_index";
const MAX_POSTS = 300;
const MAX_POST_LEN = 2000;
const MAX_COMMENT_LEN = 500;

function json(data, status) {
  return new Response(JSON.stringify(data), {
    status: status || 200,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

function cleanEmail(s) {
  return ((s || "") + "").trim().toLowerCase();
}
function cleanName(s) {
  return ((s || "") + "").trim().slice(0, 60) || "Utforsker";
}
function cleanText(s, max) {
  return ((s || "") + "").trim().slice(0, max);
}
function newId() {
  return Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 8);
}

async function isMember(env, email) {
  if (!email) return false;
  const raw = await env.BUILDER_KV.get("utf_member:" + email);
  return !!raw;
}

async function readIndex(env) {
  try {
    const raw = await env.BUILDER_KV.get(INDEX_KEY);
    const list = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) ? list : [];
  } catch (e) {
    return [];
  }
}

export async function onRequestGet(context) {
  const { env } = context;
  if (!env.BUILDER_KV) return json({ error: "not_configured", posts: [] }, 200);
  const index = await readIndex(env);
  const posts = [];
  for (const id of index.slice(0, 100)) {
    const raw = await env.BUILDER_KV.get("utf_wall_post:" + id);
    if (!raw) continue;
    try {
      const p = JSON.parse(raw);
      posts.push({
        id: p.id, name: p.name, text: p.text, createdAt: p.createdAt,
        likeCount: (p.likedBy || []).length,
        comments: (p.comments || []).map((c) => ({ name: c.name, text: c.text, createdAt: c.createdAt })),
      });
    } catch (e) {}
  }
  return json({ posts: posts });
}

export async function onRequestPost(context) {
  const { env, request } = context;
  if (!env.BUILDER_KV) return json({ error: "not_configured" }, 503);

  const body = await request.json().catch(() => ({}));
  const action = body.action;
  const email = cleanEmail(body.email);

  if (action === "join") {
    const member = await isMember(env, email);
    if (!member) return json({ error: "not_member" }, 403);
    let name = "Utforsker";
    try {
      const raw = await env.BUILDER_KV.get("utf_member:" + email);
      if (raw) name = cleanName(JSON.parse(raw).name);
    } catch (e) {}
    return json({ ok: true, name: name });
  }

  if (!(await isMember(env, email))) return json({ error: "not_member" }, 403);
  const name = cleanName(body.name);

  if (action === "post") {
    const text = cleanText(body.text, MAX_POST_LEN);
    if (!text) return json({ error: "empty" }, 400);
    const post = { id: newId(), name: name, email: email, text: text, createdAt: Date.now(), comments: [], likedBy: [] };
    await env.BUILDER_KV.put("utf_wall_post:" + post.id, JSON.stringify(post));
    const index = await readIndex(env);
    index.unshift(post.id);
    if (index.length > MAX_POSTS) index.length = MAX_POSTS;
    await env.BUILDER_KV.put(INDEX_KEY, JSON.stringify(index));
    return json({ ok: true, id: post.id });
  }

  if (action === "comment") {
    const postId = (body.postId || "") + "";
    const text = cleanText(body.text, MAX_COMMENT_LEN);
    if (!postId || !text) return json({ error: "bad_request" }, 400);
    const raw = await env.BUILDER_KV.get("utf_wall_post:" + postId);
    if (!raw) return json({ error: "not_found" }, 404);
    const post = JSON.parse(raw);
    post.comments = post.comments || [];
    post.comments.push({ name: name, email: email, text: text, createdAt: Date.now() });
    await env.BUILDER_KV.put("utf_wall_post:" + postId, JSON.stringify(post));
    return json({ ok: true });
  }

  if (action === "like") {
    const postId = (body.postId || "") + "";
    if (!postId) return json({ error: "bad_request" }, 400);
    const raw = await env.BUILDER_KV.get("utf_wall_post:" + postId);
    if (!raw) return json({ error: "not_found" }, 404);
    const post = JSON.parse(raw);
    post.likedBy = post.likedBy || [];
    const i = post.likedBy.indexOf(email);
    if (i === -1) post.likedBy.push(email); else post.likedBy.splice(i, 1);
    await env.BUILDER_KV.put("utf_wall_post:" + postId, JSON.stringify(post));
    return json({ ok: true, likeCount: post.likedBy.length, liked: i === -1 });
  }

  return json({ error: "unknown_action" }, 400);
}
