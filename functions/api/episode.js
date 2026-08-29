/**
 * LME Mia & Teo Studio, animerte læringsepisoder lagret som JSON i KV
 *
 * En «episode» her er en ferdig Mia og Teo film (3D Pixar-stil) med et
 * tydelig læringsmål. Renate lager og publiserer episodene uten kode via
 * /mia-teo-studio, og de vises automatisk i en egen hylle på /mia-og-teo
 * (Lek & Lær), spilt av den samme fullskjermspilleren som sangene.
 *
 * GET  /api/episode
 *        -> { episodes: [ { slug, title, kicker, lede, duration,
 *                           category, published, updated } ] }   (offentlig liste)
 *
 * GET  /api/episode?slug=tallmodighet
 *        -> { episode: { ... } | null }                          (offentlig: hele episoden)
 *
 * POST /api/episode   body { action: "save", episode: {...}, password }
 *        -> { ok: true, slug }
 * POST /api/episode   body { action: "delete", slug, password }
 *        -> { ok: true }
 *
 * Bruker samme KV-binding som resten: BUILDER_KV. Passord er det samme som
 * for kurs og grupper: hemmeligheten COURSE_EDIT_PASSWORD i Cloudflare,
 * ellers standardpassordet under.
 *
 * Episode-JSON (alle tekstfelt er { no, en }; en kan være tom og faller
 * tilbake til norsk i visningen):
 *   {
 *     slug, published: true|false,
 *     category,                     // natur | praktisk | tall | farger | vennskap | rolig
 *     kicker, title, lede,
 *     learnGoal,                    // læringsmålet for episoden
 *     duration,                     // vist lengde, f.eks. "5:20"
 *     orient,                       // "landscape" | "portrait" (spillerformat)
 *     videoUrl,                     // ferdig episode (mp4/YouTube/Vimeo)
 *     cover: dataURL|undefined      // plakat/miniatyr
 *   }
 */
import { editPasswordOk } from "../_lib/edit-password.js";

const DEFAULT_PASSWORD = "LME2026";
const KEY_PREFIX = "lme-builder:episode:";
const INDEX_KEY = "lme-builder:episode-index";
const MAX_SIZE = 4 * 1024 * 1024; // plakat trenger plass
const MAX_IMG = 900000;           // per dataURL-bilde

const CATEGORIES = ["natur", "praktisk", "tall", "farger", "vennskap", "rolig"];

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

// Video-lenke: kun http(s) eller en ren sti på siden (f.eks. videos/...mp4).
// Visningen tolker YouTube/Vimeo/mp4 selv; her lagrer vi bare en trygg streng.
function cleanVideo(s, max) {
  if (typeof s !== "string") return "";
  const t = s.trim().slice(0, max || 400);
  if (/^https?:\/\//i.test(t)) return t;
  if (/^(videos|images|media)\/[^\s]+$/i.test(t)) return t;
  return "";
}

// Renser hele episodeobjektet, så bare kjente felt og rene strenger lagres.
function sanitizeEpisode(raw) {
  if (!raw || typeof raw !== "object") return null;
  const slug = cleanSlug(raw.slug);
  if (!slug) return null;
  const episode = {
    slug: slug,
    published: raw.published !== false,
    category: CATEGORIES.indexOf(raw.category) !== -1 ? raw.category : "natur",
    kicker: langField(raw.kicker, 80),
    title: langField(raw.title, 120),
    lede: langField(raw.lede, 600),
    learnGoal: langField(raw.learnGoal, 300),
    duration: ("" + (raw.duration || "")).slice(0, 12),
    orient: raw.orient === "portrait" ? "portrait" : "landscape",
    videoUrl: cleanVideo(raw.videoUrl, 400),
    updated: Date.now(),
  };
  if (isDataImg(raw.cover)) episode.cover = raw.cover;
  if (!episode.title.no.trim()) return null;
  return episode;
}

function indexEntry(episode) {
  return {
    slug: episode.slug,
    title: episode.title,
    kicker: episode.kicker,
    lede: episode.lede,
    duration: episode.duration,
    category: episode.category,
    published: episode.published,
    updated: episode.updated,
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
   consistent»). Finnes det lagrede episoder som mangler i indeksen, hentes de
   inn og indeksen repareres, så episoder aldri «forsvinner» fra listene. */
async function fullIndex(env) {
  const index = await readIndex(env);
  try {
    const listed = await env.BUILDER_KV.list({ prefix: KEY_PREFIX, limit: 1000 });
    const kjent = new Set(index.map((e) => e && e.slug));
    let endret = false;
    for (const key of (listed && listed.keys) || []) {
      const slug = key.name.slice(KEY_PREFIX.length);
      if (!slug || kjent.has(slug)) continue;
      const raw = await env.BUILDER_KV.get(key.name);
      if (!raw) continue;
      try {
        const episode = JSON.parse(raw);
        if (episode && episode.slug) {
          index.push(indexEntry(episode));
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
  if (!env.BUILDER_KV) return json({ error: "not_configured", episodes: [], episode: null }, 200);
  const slugParam = new URL(request.url).searchParams.get("slug");
  if (slugParam) {
    const slug = cleanSlug(slugParam);
    if (!slug) return json({ error: "bad_slug", episode: null }, 400);
    try {
      const raw = await env.BUILDER_KV.get(KEY_PREFIX + slug);
      return json({ episode: raw ? JSON.parse(raw) : null }, 200);
    } catch (e) {
      return json({ error: "read_failed", episode: null }, 200);
    }
  }
  const index = await fullIndex(env);
  return json({ episodes: index }, 200);
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
  if (!editPasswordOk(env, body && body.password, [DEFAULT_PASSWORD])) {
    return json({ error: "bad_password" }, 401);
  }

  if (body.action === "delete") {
    const slug = cleanSlug(body.slug);
    if (!slug) return json({ error: "bad_slug" }, 400);
    try {
      await env.BUILDER_KV.delete(KEY_PREFIX + slug);
      const index = (await readIndex(env)).filter((e) => e && e.slug !== slug);
      await env.BUILDER_KV.put(INDEX_KEY, JSON.stringify(index));
      return json({ ok: true }, 200);
    } catch (e) {
      return json({ error: "delete_failed" }, 200);
    }
  }

  // Standard: lagre
  const episode = sanitizeEpisode(body.episode);
  if (!episode) return json({ error: "bad_episode" }, 400);
  const payload = JSON.stringify(episode);
  if (payload.length > MAX_SIZE) return json({ error: "too_large" }, 413);
  try {
    await env.BUILDER_KV.put(KEY_PREFIX + episode.slug, payload);
    const index = (await readIndex(env)).filter((e) => e && e.slug !== episode.slug);
    index.push(indexEntry(episode));
    index.sort((a, b) => (b.updated || 0) - (a.updated || 0));
    await env.BUILDER_KV.put(INDEX_KEY, JSON.stringify(index));
    return json({ ok: true, slug: episode.slug }, 200);
  } catch (e) {
    return json({ error: "write_failed" }, 200);
  }
}
