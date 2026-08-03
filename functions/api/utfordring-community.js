/**
 * 10 000-visninger-utfordringen — fellesskap (innlegg, kommentarer,
 * kategorier, medlemmer og ledertavle).
 *
 * Enkelt, isolert fellesskap for betalende medlemmer av utfordringen,
 * helt uavhengig av Inner Circle. Medlemskap sjekkes mot
 * utf_member:<e-post>, som skrives av webhooken (oppskrift-webhook.js)
 * og eier-ruten (utfordring-preview.js) ved kjøp/tilgang. Ingen passord,
 * bare e-post + navn, lagret i nettleseren etter første "bli med".
 *
 *   GET  /api/utfordring-community?view=posts[&category=welcome]
 *   GET  /api/utfordring-community?view=members
 *   GET  /api/utfordring-community?view=leaderboard
 *   POST { action:"join", email, name, country }
 *   POST { action:"post", email, name, text, category }
 *   POST { action:"comment", email, name, postId, text }
 *   POST { action:"like", email, postId }
 */

const INDEX_KEY = "utf_wall_index";
const MAX_POSTS = 300;
const MAX_POST_LEN = 2000;
const MAX_COMMENT_LEN = 500;
const CATEGORIES = ["velkommen", "utfordring", "seier", "hjelp", "annet"];

function json(data, status) {
  return new Response(JSON.stringify(data), {
    status: status || 200,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

function cleanEmail(s) { return ((s || "") + "").trim().toLowerCase(); }
function cleanName(s) { return ((s || "") + "").trim().slice(0, 60) || "Utforsker"; }
function cleanText(s, max) { return ((s || "") + "").trim().slice(0, max); }
function cleanCountry(s) { return ((s || "") + "").trim().slice(0, 60); }
function cleanCategory(s) {
  const c = ((s || "") + "").trim().toLowerCase();
  return CATEGORIES.indexOf(c) !== -1 ? c : "annet";
}
function newId() { return Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 8); }

async function getMember(env, email) {
  if (!email) return null;
  const raw = await env.BUILDER_KV.get("utf_member:" + email);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch (e) { return null; }
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

async function allMembers(env) {
  const out = [];
  let cursor;
  do {
    const list = await env.BUILDER_KV.list({ prefix: "utf_member:", cursor: cursor });
    for (const k of list.keys) {
      const raw = await env.BUILDER_KV.get(k.name);
      if (!raw) continue;
      try { out.push(JSON.parse(raw)); } catch (e) {}
    }
    cursor = list.list_complete ? null : list.cursor;
  } while (cursor);
  return out;
}

async function allPosts(env) {
  const index = await readIndex(env);
  const out = [];
  for (const id of index) {
    const raw = await env.BUILDER_KV.get("utf_wall_post:" + id);
    if (!raw) continue;
    try { out.push(JSON.parse(raw)); } catch (e) {}
  }
  return out;
}

export async function onRequestGet(context) {
  const { env, request } = context;
  if (!env.BUILDER_KV) return json({ error: "not_configured", posts: [] }, 200);
  const url = new URL(request.url);
  const view = url.searchParams.get("view") || "posts";

  if (view === "members") {
    const members = await allMembers(env);
    members.sort((a, b) => (a.joinedAt || 0) - (b.joinedAt || 0));
    return json({
      members: members.map((m) => ({ name: m.name, country: m.country || "", joinedAt: m.joinedAt || 0 })),
      total: members.length,
    });
  }

  if (view === "leaderboard") {
    const posts = await allPosts(env);
    const points = {};
    const names = {};
    posts.forEach((p) => {
      const key = (p.email || p.name || "").toLowerCase();
      names[key] = p.name;
      points[key] = (points[key] || 0) + 3;
      (p.comments || []).forEach((c) => {
        const ck = (c.email || c.name || "").toLowerCase();
        names[ck] = c.name;
        points[ck] = (points[ck] || 0) + 1;
      });
    });
    const board = Object.keys(points)
      .map((k) => ({ name: names[k], points: points[k] }))
      .sort((a, b) => b.points - a.points)
      .slice(0, 50);
    return json({ leaderboard: board });
  }

  // view === "posts" (standard)
  const category = url.searchParams.get("category") || "";
  const index = await readIndex(env);
  const posts = [];
  for (const id of index.slice(0, 150)) {
    const raw = await env.BUILDER_KV.get("utf_wall_post:" + id);
    if (!raw) continue;
    try {
      const p = JSON.parse(raw);
      if (category && p.category !== category) continue;
      posts.push({
        id: p.id, name: p.name, text: p.text, category: p.category || "annet", createdAt: p.createdAt,
        likeCount: (p.likedBy || []).length,
        comments: (p.comments || []).map((c) => ({ name: c.name, text: c.text, createdAt: c.createdAt })),
      });
    } catch (e) {}
  }
  return json({ posts: posts, memberCount: (await allMembers(env)).length });
}

export async function onRequestPost(context) {
  const { env, request } = context;
  if (!env.BUILDER_KV) return json({ error: "not_configured" }, 503);

  const body = await request.json().catch(() => ({}));
  const action = body.action;
  const email = cleanEmail(body.email);

  if (action === "join") {
    const member = await getMember(env, email);
    if (!member) return json({ error: "not_member" }, 403);
    // Landet er valgfritt og kan legges til/oppdateres ved innmelding.
    const country = cleanCountry(body.country);
    if (country) {
      member.country = country;
      await env.BUILDER_KV.put("utf_member:" + email, JSON.stringify(member));
    }
    return json({ ok: true, name: cleanName(member.name), country: member.country || "" });
  }

  if (!(await getMember(env, email))) return json({ error: "not_member" }, 403);
  const name = cleanName(body.name);

  if (action === "post") {
    const text = cleanText(body.text, MAX_POST_LEN);
    if (!text) return json({ error: "empty" }, 400);
    const category = cleanCategory(body.category);
    const post = { id: newId(), name: name, email: email, text: text, category: category, createdAt: Date.now(), comments: [], likedBy: [] };
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
