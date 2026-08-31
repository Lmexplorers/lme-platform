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
 *     lessons: [ { module: {no,en,lock:"free"|"member"|"paid",
 *                            price?:{no,en}, paylink?:{no,en}, thumb?:dataURL}|null,
 *                  title, body: [ {no,en}, ... ],
 *                  tip: {no,en}|null, img: dataURL|undefined } ],
 * (module er satt paa foerste leksjon i hver modul-gruppe; lock/price/
 *  paylink/thumb gjelder for hele modulen den aapner)
 *     outro: { title, text, cta?: { label, href:"https://..." } }
 *   }
 */
import { editPasswordOk } from "../_lib/edit-password.js";
import { sessionUser, isOwner, getAccess } from "../_lib/access.js";

export const DEFAULT_PASSWORD = "LME2026";
export const KEY_PREFIX = "lme-builder:kurs:";
export const INDEX_KEY = "lme-builder:kurs-index";
export const MAX_SIZE = 4 * 1024 * 1024; // kurs med leksjonsbilder trenger plass

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
export function sanitizeCourse(raw) {
  if (!raw || typeof raw !== "object") return null;
  const slug = cleanSlug(raw.slug);
  if (!slug) return null;
  const course = {
    slug: slug,
    size: raw.size === "stor" ? "stor" : "mini",
    published: raw.published !== false,
    cert: raw.cert !== false,
    meet: raw.meet !== false,
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
  // Eieren av kurset, som e-post i små bokstaver. Tom streng betyr Renates
  // egne kurs, altså plattformens egne. Settes av lagringen, aldri av det
  // klienten sender inn, så ingen kan skrive seg til et annet kurs.
  course.eier = ((raw.eier || "") + "").trim().toLowerCase();
  const ctaLabel = langField(raw.outro && raw.outro.cta && raw.outro.cta.label, 60);
  const ctaHref = (((raw.outro && raw.outro.cta && raw.outro.cta.href) || "") + "").trim();
  if (ctaLabel.no.trim() && /^(\/|https:\/\/)/.test(ctaHref)) {
    course.outro.cta = { label: ctaLabel, href: ctaHref };
  }
  (Array.isArray(raw.learn) ? raw.learn : []).slice(0, 12).forEach((li) => {
    const f = langField(li, 300);
    if (f.no.trim()) course.learn.push(f);
  });
  (Array.isArray(raw.lessons) ? raw.lessons : []).slice(0, 80).forEach((l) => {
    if (!l || typeof l !== "object") return;
    const lesson = {
      module: null,
      title: langField(l.title, 160),
      body: [],
      tip: null,
    };
    const mod = langField(l.module, 120);
    if (mod.no.trim()) {
      lesson.module = mod;
      const rawLock = l.module && l.module.lock;
      lesson.module.lock = (rawLock === "member" || rawLock === "paid") ? rawLock : "free";
      if (lesson.module.lock === "paid") {
        const price = langField(l.module && l.module.price, 40);
        if (price.no.trim() || price.en.trim()) lesson.module.price = price;
        const paylink = langField(l.module && l.module.paylink, 500);
        if (/^https:\/\//.test(paylink.no.trim())) lesson.module.paylink = { no: paylink.no.trim(), en: /^https:\/\//.test(paylink.en.trim()) ? paylink.en.trim() : paylink.no.trim() };
      }
      const thumb = l.module && l.module.thumb;
      if (typeof thumb === "string" && /^data:image\/(png|jpe?g|webp|gif);base64,/.test(thumb) && thumb.length <= 900000) {
        lesson.module.thumb = thumb;
      }
    }
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

export function indexEntry(course) {
  return {
    slug: course.slug,
    title: course.title,
    kicker: course.kicker,
    lede: course.lede,
    size: course.size,
    lessonCount: course.lessons.length,
    published: course.published,
    updated: course.updated,
    eier: course.eier || "",
  };
}

/* Hvem gjør dette kallet, og hva har de lov til?
   - Renate: enten innlogget som eier, eller med redigeringspassordet, som før.
   - Medlem: innlogget med aktivt medlemskap. De eier sine egne kurs.
   - Andre: ingenting.
   Eierskapet leses ALDRI fra det klienten sender, bare fra økten, så ingen kan
   skrive seg til et kurs som ikke er deres. */
async function aktor(context, body) {
  const passordOk = editPasswordOk(context.env, body && body.password, [DEFAULT_PASSWORD]);
  let bruker = null;
  try { bruker = await sessionUser(context); } catch (e) { bruker = null; }
  if (bruker && isOwner(bruker)) return { rolle: "eier", epost: "" };
  if (passordOk) return { rolle: "eier", epost: "" };
  if (!bruker) return { rolle: "ingen", epost: "" };
  let tilgang = null;
  try { tilgang = await getAccess(context); } catch (e) { tilgang = null; }
  if (tilgang && tilgang.active) return { rolle: "medlem", epost: (bruker.email || "").toLowerCase() };
  return { rolle: "innlogget", epost: (bruker.email || "").toLowerCase() };
}

/* Har denne aktøren lov til å endre kurset som ligger der fra før?
   Et kurs uten eier er Renates, og da er det bare hun som kan røre det. */
function kanEndre(rolle, epost, eksisterende) {
  if (rolle === "eier") return true;
  if (rolle !== "medlem") return false;
  if (!eksisterende) return true;                       // nytt kurs
  return ((eksisterende.eier || "") + "") === epost;    // bare sitt eget
}

export async function readIndex(env) {
  try {
    const raw = await env.BUILDER_KV.get(INDEX_KEY);
    const list = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) ? list : [];
  } catch (e) {
    return [];
  }
}

/* Selvreparerende liste: indeksen kan henge etter (KV er "eventually
   consistent"). Finnes det lagrede kurs som mangler i indeksen, hentes de
   inn og indeksen repareres, saa kurs aldri "forsvinner" fra listene. */
async function fullIndex(env) {
  const index = await readIndex(env);
  try {
    const listed = await env.BUILDER_KV.list({ prefix: KEY_PREFIX, limit: 1000 });
    const kjent = new Set(index.map((c) => c && c.slug));
    let endret = false;
    for (const key of (listed && listed.keys) || []) {
      const slug = key.name.slice(KEY_PREFIX.length);
      if (!slug || kjent.has(slug)) continue;
      const raw = await env.BUILDER_KV.get(key.name);
      if (!raw) continue;
      try {
        const course = JSON.parse(raw);
        if (course && course.slug) {
          index.push(indexEntry(course));
          endret = true;
        }
      } catch (e) { /* hopp over oedelagte oppfoeringer */ }
    }
    if (endret) {
      index.sort((a, b) => (b.updated || 0) - (a.updated || 0));
      await env.BUILDER_KV.put(INDEX_KEY, JSON.stringify(index));
    }
  } catch (e) { /* uten list-stoette brukes indeksen som foer */ }
  return index;
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
  const index = await fullIndex(env);
  const url = new URL(request.url);

  // ?mine=1 -> bare kursene den innloggede eier selv.
  if (url.searchParams.get("mine") === "1") {
    let bruker = null;
    try { bruker = await sessionUser(context); } catch (e) { bruker = null; }
    if (!bruker) return json({ courses: [], loggedIn: false }, 200);
    const epost = (bruker.email || "").toLowerCase();
    if (isOwner(bruker)) return json({ courses: index, loggedIn: true, eier: true }, 200);
    return json({
      courses: index.filter((c) => c && (c.eier || "") === epost),
      loggedIn: true, eier: false,
    }, 200);
  }

  // Standard: plattformens egne kurs. Medlemmenes kurs er deres, og skal ikke
  // dukke opp i Renates lister eller på forsiden hennes.
  return json({ courses: index.filter((c) => c && !(c.eier || "")) }, 200);
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
  const { rolle, epost } = await aktor(context, body);
  if (rolle === "ingen") return json({ error: "bad_password" }, 401);
  if (rolle === "innlogget") {
    return json({ error: "no_membership" }, 403);
  }

  const lesEksisterende = async (slug) => {
    try {
      const raw = await env.BUILDER_KV.get(KEY_PREFIX + slug);
      return raw ? JSON.parse(raw) : null;
    } catch (e) { return null; }
  };

  if (body.action === "delete") {
    const slug = cleanSlug(body.slug);
    if (!slug) return json({ error: "bad_slug" }, 400);
    const fra_for = await lesEksisterende(slug);
    if (!kanEndre(rolle, epost, fra_for)) return json({ error: "not_yours" }, 403);
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
  const fra_for = await lesEksisterende(course.slug);
  if (!kanEndre(rolle, epost, fra_for)) return json({ error: "not_yours" }, 403);
  // Eieren settes her, av økten, og beholdes ved senere lagringer.
  course.eier = fra_for ? ((fra_for.eier || "") + "") : (rolle === "medlem" ? epost : "");
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
