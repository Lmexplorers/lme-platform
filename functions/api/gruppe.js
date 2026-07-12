/**
 * LME Gruppebygger — egendefinerte gruppesider (Skool-stil) lagret som JSON i KV
 *
 * En «gruppe» her er en salgs- og landingsside for et fellesskap eller
 * medlemskap, i samme ånd som en Skool-gruppe: navn, trailer, bildegalleri,
 * kort beskrivelse, pris og en tydelig bli-med-knapp. Sidene vises på
 * /g/<adresse> (academy/gruppe.html + regel i _redirects) i LME-designet.
 *
 * GET  /api/gruppe
 *        -> { groups: [ { slug, title, kicker, lede, price, members,
 *                         published, updated } ] }        (offentlig liste)
 *
 * GET  /api/gruppe?slug=min-gruppe
 *        -> { group: { ... } | null }                     (offentlig: hele gruppen)
 *
 * POST /api/gruppe   body { action: "save", group: {...}, password }
 *        -> { ok: true, slug }
 * POST /api/gruppe   body { action: "delete", slug, password }
 *        -> { ok: true }
 *
 * Bruker samme KV-binding som resten: BUILDER_KV. Passord er det samme som
 * for kurs og kursbygger: hemmeligheten COURSE_EDIT_PASSWORD i Cloudflare,
 * ellers standardpassordet under.
 *
 * Gruppe-JSON (alle tekstfelt er { no, en }; en kan være tom og faller
 * tilbake til norsk i visningen):
 *   {
 *     slug, published: true|false, privacy: "privat"|"apen",
 *     kicker, title, lede,
 *     host, price, priceNote, cta,
 *     ctaUrl,                       // ren lenke bli-med-knappen går til
 *     members,                      // tall vist som sosialt bevis (0 = skjult)
 *     cover: dataURL|undefined,     // hovedbilde/omslag
 *     videoUrl,                     // valgfri trailer (YouTube/Vimeo/mp4)
 *     hostImg: dataURL|undefined,   // vertens portrett
 *     gallery: [ dataURL, ... ],    // miniatyrstripe under omslaget
 *     features: [ {no,en}, ... ],   // «dette får du»-punkter
 *     about: [ {no,en}, ... ],      // avsnitt (## overskrift, **fet**)
 *     outro: { title, text }
 *   }
 */

const DEFAULT_PASSWORD = "LilleOppdager2026";
const KEY_PREFIX = "lme-builder:gruppe:";
const INDEX_KEY = "lme-builder:gruppe-index";
const MAX_SIZE = 4 * 1024 * 1024; // omslag + galleribilder trenger plass
const MAX_IMG = 900000;           // per dataURL-bilde

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

function isDataImg(s) {
  return typeof s === "string" &&
    /^data:image\/(png|jpe?g|webp|gif);base64,/.test(s) &&
    s.length <= MAX_IMG;
}

// Trailer-lenke: kun http(s), begrenset lengde. Visningen tolker YouTube/
// Vimeo/mp4 selv; her lagrer vi bare en trygg streng.
function cleanUrl(s, max) {
  if (typeof s !== "string") return "";
  const t = s.trim().slice(0, max || 400);
  return /^https?:\/\//i.test(t) ? t : "";
}

// Intern lenke (bli-med-knappen). Tillater rene stier som /oppgrader og
// fulle http(s)-URL-er, men aldri javascript: og lignende.
function cleanLink(s, max) {
  if (typeof s !== "string") return "";
  const t = s.trim().slice(0, max || 300);
  if (/^https?:\/\//i.test(t)) return t;
  if (/^\/[^\s]*$/.test(t)) return t;
  return "";
}

// Renser hele gruppeobjektet, så bare kjente felt og rene strenger lagres.
function sanitizeGroup(raw) {
  if (!raw || typeof raw !== "object") return null;
  const slug = cleanSlug(raw.slug);
  if (!slug) return null;
  let members = parseInt(raw.members, 10);
  if (!isFinite(members) || members < 0) members = 0;
  if (members > 10000000) members = 10000000;
  const group = {
    slug: slug,
    published: raw.published !== false,
    privacy: raw.privacy === "apen" ? "apen" : "privat",
    kicker: langField(raw.kicker, 80),
    title: langField(raw.title, 120),
    lede: langField(raw.lede, 600),
    host: langField(raw.host, 120),
    price: langField(raw.price, 60),
    priceNote: langField(raw.priceNote, 120),
    cta: langField(raw.cta, 60),
    ctaUrl: cleanLink(raw.ctaUrl, 300),
    members: members,
    videoUrl: cleanUrl(raw.videoUrl, 400),
    gallery: [],
    features: [],
    about: [],
    outro: {
      title: langField(raw.outro && raw.outro.title, 120),
      text: langField(raw.outro && raw.outro.text, 600),
    },
    updated: Date.now(),
  };
  if (isDataImg(raw.cover)) group.cover = raw.cover;
  if (isDataImg(raw.hostImg)) group.hostImg = raw.hostImg;
  (Array.isArray(raw.gallery) ? raw.gallery : []).slice(0, 8).forEach((g) => {
    if (isDataImg(g)) group.gallery.push(g);
  });
  (Array.isArray(raw.features) ? raw.features : []).slice(0, 16).forEach((f) => {
    const lf = langField(f, 200);
    if (lf.no.trim()) group.features.push(lf);
  });
  (Array.isArray(raw.about) ? raw.about : []).slice(0, 30).forEach((p) => {
    const lf = langField(p, 2000);
    if (lf.no.trim()) group.about.push(lf);
  });
  if (!group.title.no.trim()) return null;
  return group;
}

function indexEntry(group) {
  return {
    slug: group.slug,
    title: group.title,
    kicker: group.kicker,
    lede: group.lede,
    price: group.price,
    members: group.members,
    published: group.published,
    updated: group.updated,
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

/* Selvreparerende liste: indeksen kan henge etter (KV er «eventually
   consistent»). Finnes det lagrede grupper som mangler i indeksen, hentes de
   inn og indeksen repareres, så grupper aldri «forsvinner» fra listene. */
async function fullIndex(env) {
  const index = await readIndex(env);
  try {
    const listed = await env.BUILDER_KV.list({ prefix: KEY_PREFIX, limit: 1000 });
    const kjent = new Set(index.map((g) => g && g.slug));
    let endret = false;
    for (const key of (listed && listed.keys) || []) {
      const slug = key.name.slice(KEY_PREFIX.length);
      if (!slug || kjent.has(slug)) continue;
      const raw = await env.BUILDER_KV.get(key.name);
      if (!raw) continue;
      try {
        const group = JSON.parse(raw);
        if (group && group.slug) {
          index.push(indexEntry(group));
          endret = true;
        }
      } catch (e) { /* hopp over ødelagte oppføringer */ }
    }
    if (endret) {
      index.sort((a, b) => (b.updated || 0) - (a.updated || 0));
      await env.BUILDER_KV.put(INDEX_KEY, JSON.stringify(index));
    }
  } catch (e) { /* uten list-støtte brukes indeksen som før */ }
  return index;
}

export async function onRequestGet(context) {
  const { request, env } = context;
  if (!env.BUILDER_KV) return json({ error: "not_configured", groups: [], group: null }, 200);
  const slugParam = new URL(request.url).searchParams.get("slug");
  if (slugParam) {
    const slug = cleanSlug(slugParam);
    if (!slug) return json({ error: "bad_slug", group: null }, 400);
    try {
      const raw = await env.BUILDER_KV.get(KEY_PREFIX + slug);
      return json({ group: raw ? JSON.parse(raw) : null }, 200);
    } catch (e) {
      return json({ error: "read_failed", group: null }, 200);
    }
  }
  const index = await fullIndex(env);
  return json({ groups: index }, 200);
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
      const index = (await readIndex(env)).filter((g) => g && g.slug !== slug);
      await env.BUILDER_KV.put(INDEX_KEY, JSON.stringify(index));
      return json({ ok: true }, 200);
    } catch (e) {
      return json({ error: "delete_failed" }, 200);
    }
  }

  // Standard: lagre
  const group = sanitizeGroup(body.group);
  if (!group) return json({ error: "bad_group" }, 400);
  const payload = JSON.stringify(group);
  if (payload.length > MAX_SIZE) return json({ error: "too_large" }, 413);
  try {
    await env.BUILDER_KV.put(KEY_PREFIX + group.slug, payload);
    const index = (await readIndex(env)).filter((g) => g && g.slug !== group.slug);
    index.push(indexEntry(group));
    index.sort((a, b) => (b.updated || 0) - (a.updated || 0));
    await env.BUILDER_KV.put(INDEX_KEY, JSON.stringify(index));
    return json({ ok: true, slug: group.slug }, 200);
  } catch (e) {
    return json({ error: "write_failed" }, 200);
  }
}
