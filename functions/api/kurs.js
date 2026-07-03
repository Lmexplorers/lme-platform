/**
 * LME Kursbygger — egendefinerte kurs lagret som JSON i Cloudflare KV
 *
 * GET  /api/kurs
 *        -> { courses: [ { slug, title, kicker, lede, size, lessonCount,
 *                          published, updated } ] }   (offentlig liste)
 *
 * GET  /api/kurs?slug=mitt-kurs
 *        -> { course: { ... } | null }                (offentlig: hele kurset)
 *
 * POST /api/kurs   body { action: "save", course: {...}, password }
 *        -> { ok: true, slug }
 * POST /api/kurs   body { action: "delete", slug, password }
 *        -> { ok: true }
 *
 * Bruker samme KV-binding som resten: BUILDER_KV. Passord er det samme som
 * for kursredigering: hemmeligheten COURSE_EDIT_PASSWORD i Cloudflare,
 * ellers standardpassordet under (samme som i functions/api/course.js).
 *
 * Kurs-JSON (alle tekstfelt er { no, en }; en kan være tom og faller
 * tilbake til norsk i visningen):
 *   {
 *     slug, size: "mini"|"stor", published: true|false, cert: true|false,
 *     kicker, title, lede,
 *     learn: [ {no,en}, ... ],
 *     lessons: [ { module: {no,en}|null, title, body: [ {no,en}, ... ],
 *                  tip: {no,en}|null, img: dataURL|undefined } ],
 *     outro: { title, text }
 *   }
 */

const DEFAULT_PASSWORD = "LilleOppdager2026";
const KEY_PREFIX = "lme-builder:kurs:";
const INDEX_KEY = "lme-builder:kurs-index";
const MAX_SIZE = 4 * 1024 * 1024; // kurs med leksjonsbilder trenger plass

function json(data, status) {
  return new Response(JSON.stringify(data), {
    status: status || 200,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

function cleanSlug(slug) {
  if (typeof slug !== "string") return null;
  const s = slug.trim().toLowerCase();
  if (!/^[a-z0-9][a-z0-9\-]{1,58}[a-z0-9]$/.test(s)) return null;
  return s;
}

// Kort tekstfelt { no, en } -> trygt objekt med strenger.
function langField(v, max) {
  const lim = max || 400;
  const out = { no: "", en: "" };
  if (v && typeof v === "object") {
    out.no = ("" + (v.no || "")).slice(0, lim);
    out.en = ("" + (v.en || "")).slice(0, lim);
  } else if (typeof v === "string") {
    out.no = v.slice(0, lim);
  }
  return out;
}

// Renser hele kursobjektet, så bare kjente felt og rene strenger lagres.
function sanitizeCourse(raw) {
  if (!raw || typeof raw !== "object") return null;
  const slug = cleanSlug(raw.slug);
  if (!slug) return null;
  const course = {
    slug: slug,
    size: raw.size === "stor" ? "stor" : "mini",
    published: raw.published !== false,
    cert: raw.cert !== false,
    kicker: langField(raw.kicker, 80),
    title: langField(raw.title, 120),
    lede: langField(raw.lede, 600),
    learn: [],
    lessons: [],
    outro: {
      title: langField(raw.outro && raw.outro.title, 120),
      text: langField(raw.outro && raw.outro.text, 600),
    },
    updated: Date.now(),
  };
  (Array.isArray(raw.learn) ? raw.learn : []).slice(0, 12).forEach((li) => {
    const f = langField(li, 300);
    if (f.no.trim()) course.learn.push(f);
  });
  (Array.isArray(raw.lessons) ? raw.lessons : []).slice(0, 40).forEach((l) => {
    if (!l || typeof l !== "object") return;
    const lesson = {
      module: null,
      title: langField(l.title, 160),
      body: [],
      tip: null,
    };
    const mod = langField(l.module, 120);
    if (mod.no.trim()) lesson.module = mod;
    (Array.isArray(l.body) ? l.body : []).slice(0, 10).forEach((p) => {
      const f = langField(p, 2000);
      if (f.no.trim()) lesson.body.push(f);
    });
    const tip = langField(l.tip, 500);
    if (tip.no.trim()) lesson.tip = tip;
    if (typeof l.img === "string" && /^data:image\/(png|jpe?g|webp|gif);base64,/.test(l.img) && l.img.length <= 900000) {
      lesson.img = l.img;
    }
    if (lesson.title.no.trim() || lesson.body.length) course.lessons.push(lesson);
  });
  if (!course.title.no.trim() || !course.lessons.length) return null;
  return course;
}

function indexEntry(course) {
  return {
    slug: course.slug,
    title: course.title,
    kicker: course.kicker,
    lede: course.lede,
    size: course.size,
    lessonCount: course.lessons.length,
    published: course.published,
    updated: course.updated,
  };
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
  const { request, env } = context;
  if (!env.BUILDER_KV) return json({ error: "not_configured", courses: [], course: null }, 200);
  const slugParam = new URL(request.url).searchParams.get("slug");
  if (slugParam) {
    const slug = cleanSlug(slugParam);
    if (!slug) return json({ error: "bad_slug", course: null }, 400);
    try {
      const raw = await env.BUILDER_KV.get(KEY_PREFIX + slug);
      return json({ course: raw ? JSON.parse(raw) : null }, 200);
    } catch (e) {
      return json({ error: "read_failed", course: null }, 200);
    }
  }
  const index = await readIndex(env);
  return json({ courses: index }, 200);
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

  if (body.action === "delete") {
    const slug = cleanSlug(body.slug);
    if (!slug) return json({ error: "bad_slug" }, 400);
    try {
      await env.BUILDER_KV.delete(KEY_PREFIX + slug);
      const index = (await readIndex(env)).filter((c) => c && c.slug !== slug);
      await env.BUILDER_KV.put(INDEX_KEY, JSON.stringify(index));
      return json({ ok: true }, 200);
    } catch (e) {
      return json({ error: "delete_failed" }, 200);
    }
  }

  // Standard: lagre
  const course = sanitizeCourse(body.course);
  if (!course) return json({ error: "bad_course" }, 400);
  const payload = JSON.stringify(course);
  if (payload.length > MAX_SIZE) return json({ error: "too_large" }, 413);
  try {
    await env.BUILDER_KV.put(KEY_PREFIX + course.slug, payload);
    const index = (await readIndex(env)).filter((c) => c && c.slug !== course.slug);
    index.push(indexEntry(course));
    index.sort((a, b) => (b.updated || 0) - (a.updated || 0));
    await env.BUILDER_KV.put(INDEX_KEY, JSON.stringify(index));
    return json({ ok: true, slug: course.slug }, 200);
  } catch (e) {
    return json({ error: "write_failed" }, 200);
  }
}
