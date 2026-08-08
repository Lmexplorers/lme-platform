/**
 * 10 000-visninger-utfordringen — fellesskap (innlegg, kommentarer,
 * kategorier, medlemmer, fremdrift og ledertavle).
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
 *   GET  /api/utfordring-community?view=progress&email=<e-post>
 *   POST { action:"join", email, name, country }
 *   POST { action:"post", email, name, text, category }
 *   POST { action:"comment", email, name, postId, text }
 *   POST { action:"like", email, postId }
 *   POST { action:"complete_day", email, name, day, done }
 *
 * Poeng/merker (samme tabell som i curriculumet): 10 poeng for hver
 * fullførte dag, 3 poeng for hvert fellesskap-innlegg ("del refleksjon
 * eller resultat"), 2 poeng for hver kommentar ("gi tilbakemelding"),
 * 20 bonuspoeng for å fullføre en hel uke, 50 bonuspoeng for å fullføre
 * alle 30 dagene. "Publisere dagens innlegg" (5 poeng i curriculumet) er
 * IKKE tellet separat, siden selve publiseringen skjer utenfor
 * plattformen (Instagram/TikTok/YouTube) og ikke kan verifiseres herfra;
 * fullført dag-poenget dekker den daglige handlingen i praksis.
 */

import { isOwner } from "../_lib/access.js";

const INDEX_KEY = "utf_wall_index";
const MAX_POSTS = 300;
const MAX_POST_LEN = 2000;
const MAX_COMMENT_LEN = 500;
const CATEGORIES = ["velkommen", "utfordring", "seier", "sporsmal", "ressurser", "prat", "tilbakemelding", "annet"];

const POINTS_PER_POST = 3;
const POINTS_PER_COMMENT = 2;
const POINTS_PER_DAY = 10;
const POINTS_PER_WEEK = 20;
const POINTS_FOR_FULL_COMPLETION = 50;
const CHALLENGE_DAYS = Array.from({ length: 30 }, (_, i) => i + 1); // 1..30, dag 0 er forberedelse, ikke en "utfordringsdag"
const WEEKS = [
  { days: [1, 2, 3, 4, 5, 6, 7], badge: { no: "Retningen er satt", en: "Direction set" } },
  { days: [8, 9, 10, 11, 12, 13, 14], badge: { no: "Innholdstester", en: "Content tester" } },
  { days: [15, 16, 17, 18, 19, 20, 21], badge: { no: "Relasjonsbygger", en: "Relationship builder" } },
  { days: [22, 23, 24, 25, 26, 27, 28, 29], badge: { no: "Tydelig stemme", en: "Clear voice" } },
];
const COMPLETE_BADGE = { no: "Challenge fullført", en: "Challenge complete" };

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

function progressKey(email) { return "utf_progress:" + email; }

async function readProgress(env, email) {
  if (!email) return {};
  try {
    const raw = await env.BUILDER_KV.get(progressKey(email));
    const p = raw ? JSON.parse(raw) : null;
    return (p && p.days && typeof p.days === "object") ? p.days : {};
  } catch (e) {
    return {};
  }
}

async function allProgress(env) {
  const out = {};
  let cursor;
  do {
    const list = await env.BUILDER_KV.list({ prefix: "utf_progress:", cursor: cursor });
    for (const k of list.keys) {
      const email = k.name.slice("utf_progress:".length);
      const raw = await env.BUILDER_KV.get(k.name);
      if (!raw) continue;
      try {
        const p = JSON.parse(raw);
        out[email] = (p && p.days && typeof p.days === "object") ? p.days : {};
      } catch (e) {}
    }
    cursor = list.list_complete ? null : list.cursor;
  } while (cursor);
  return out;
}

/* Poeng og merker fra dag-fullføringer: 10 p/dag, 20 p bonus per fullført
   uke (alle dagene i WEEKS-gruppen krysset av), 50 p bonus for alle 30
   dagene. Merker er rent avledet av dagene, ikke lagret separat. */
function dayStats(daysMap) {
  const done = new Set(Object.keys(daysMap || {}).filter((k) => daysMap[k]).map((k) => parseInt(k, 10)));
  let points = done.size * POINTS_PER_DAY;
  const badges = [];
  WEEKS.forEach((w) => {
    if (w.days.every((d) => done.has(d))) {
      points += POINTS_PER_WEEK;
      badges.push(w.badge);
    }
  });
  if (done.has(30)) badges.push(COMPLETE_BADGE);
  if (CHALLENGE_DAYS.every((d) => done.has(d))) points += POINTS_FOR_FULL_COMPLETION;
  return { doneCount: done.size, points: points, badges: badges };
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
    const badgesByKey = {};
    posts.forEach((p) => {
      const key = (p.email || p.name || "").toLowerCase();
      names[key] = p.name;
      points[key] = (points[key] || 0) + POINTS_PER_POST;
      (p.comments || []).forEach((c) => {
        const ck = (c.email || c.name || "").toLowerCase();
        names[ck] = c.name;
        points[ck] = (points[ck] || 0) + POINTS_PER_COMMENT;
      });
    });
    const progress = await allProgress(env);
    Object.keys(progress).forEach((email) => {
      const key = email.toLowerCase();
      const stats = dayStats(progress[email]);
      points[key] = (points[key] || 0) + stats.points;
      badgesByKey[key] = stats.badges;
      if (!names[key]) names[key] = ""; // navn fylles inn under om medlemmet ikke har postet ennå
    });
    // Fyll inn navn for medlemmer med fremdrift, men ingen innlegg ennå.
    if (Object.keys(progress).length) {
      const members = await allMembers(env);
      const byEmail = {};
      members.forEach((m) => { if (m && m.email) byEmail[m.email.toLowerCase()] = m.name; });
      Object.keys(names).forEach((k) => { if (!names[k] && byEmail[k]) names[k] = byEmail[k]; });
    }
    const board = Object.keys(points)
      .map((k) => ({ name: names[k] || "Utforsker", points: points[k], badges: badgesByKey[k] || [] }))
      .sort((a, b) => b.points - a.points)
      .slice(0, 50);
    return json({ leaderboard: board });
  }

  if (view === "progress") {
    const email = cleanEmail(url.searchParams.get("email"));
    const days = await readProgress(env, email);
    const stats = dayStats(days);
    return json({ days: days, points: stats.points, badges: stats.badges, doneCount: stats.doneCount });
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
        isAdmin: isOwner({ email: p.email }),
        comments: (p.comments || []).map((c) => ({ name: c.name, text: c.text, createdAt: c.createdAt, isAdmin: isOwner({ email: c.email }) })),
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

  if (action === "complete_day") {
    const day = parseInt(body.day, 10);
    if (!Number.isFinite(day) || day < 0 || day > 30) return json({ error: "bad_day" }, 400);
    const days = await readProgress(env, email);
    if (body.done === false) delete days[day]; else days[day] = true;
    await env.BUILDER_KV.put(progressKey(email), JSON.stringify({ days: days, updatedAt: Date.now() }));
    const stats = dayStats(days);
    return json({ ok: true, days: days, points: stats.points, badges: stats.badges, doneCount: stats.doneCount });
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
