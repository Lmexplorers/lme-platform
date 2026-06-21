/**
 * LME — "Nytt i biblioteket", helautomatisk.
 *
 * GET /api/biblioteket-nytt -> { items: [ { url, dato, t_no, t_en, d_no, d_en }, ... ] }
 *
 * Finner ressursene i biblioteket/print/ av seg selv via GitHubs API (repoet er
 * offentlig), henter siste commit-dato per fil og overskrift/undertittel fra selve
 * fila, og returnerer de nyeste forst. Ingen manuell liste: legg en ny print-side i
 * mappa, og den dukker opp her automatisk neste gang cachen fornyes.
 *
 * Robusthet: svaret caches paa kanten (1 time) og speiles i KV (BUILDER_KV) som
 * reserve hvis GitHub skulle svare tregt eller med rategrense.
 */

const OWNER = "Lmexplorers";
const REPO = "lme-platform";
const BRANCH = "main";
const DIR = "biblioteket/print";
const LIMIT = 6;
const KV_KEY = "lme:biblioteket-nytt";
const GH_HEADERS = { "User-Agent": "lme-biblioteket", "Accept": "application/vnd.github+json" };

function json(data, status, cacheSeconds) {
  return new Response(JSON.stringify(data), {
    status: status || 200,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": cacheSeconds ? "public, max-age=" + cacheSeconds : "no-store",
    },
  });
}

function decode(s) {
  return (s || "")
    .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'");
}

function pick(re, html) {
  const m = html && html.match(re);
  return m ? { no: decode(m[1]), en: decode(m[2]) } : null;
}

function firstSentence(s) {
  s = (s || "").trim();
  if (!s) return "";
  const i = s.search(/[.!?]/);
  if (i > 0 && i < 110) return s.slice(0, i + 1);
  return s.length > 110 ? s.slice(0, 107) + "..." : s;
}

async function buildList() {
  const listRes = await fetch(
    `https://api.github.com/repos/${OWNER}/${REPO}/contents/${DIR}?ref=${BRANCH}`,
    { headers: GH_HEADERS }
  );
  if (!listRes.ok) throw new Error("list " + listRes.status);
  const files = (await listRes.json()).filter(
    (f) => f && f.type === "file" && f.name.endsWith(".html")
  );

  const items = await Promise.all(
    files.map(async (f) => {
      const slug = f.name.replace(/\.html$/, "");
      let dato = null;
      try {
        const cRes = await fetch(
          `https://api.github.com/repos/${OWNER}/${REPO}/commits?path=${DIR}/${f.name}&per_page=1&sha=${BRANCH}`,
          { headers: GH_HEADERS }
        );
        if (cRes.ok) {
          const c = await cRes.json();
          dato = (c[0] && c[0].commit && (c[0].commit.committer || c[0].commit.author) || {}).date || null;
        }
      } catch (e) {}

      let html = "";
      try {
        const r = await fetch(
          `https://raw.githubusercontent.com/${OWNER}/${REPO}/${BRANCH}/${DIR}/${f.name}`
        );
        if (r.ok) html = await r.text();
      } catch (e) {}

      const t = pick(/<h1[^>]*data-no="([^"]*)"[^>]*data-en="([^"]*)"/, html) || { no: slug, en: slug };
      const sub = pick(/class="sub"[^>]*data-no="([^"]*)"[^>]*data-en="([^"]*)"/, html) || { no: "", en: "" };
      return {
        url: "/" + DIR + "/" + slug,
        dato,
        t_no: t.no,
        t_en: t.en,
        d_no: firstSentence(sub.no),
        d_en: firstSentence(sub.en),
      };
    })
  );

  items.sort((a, b) => (b.dato || "").localeCompare(a.dato || ""));
  return items.slice(0, LIMIT);
}

export async function onRequestGet(context) {
  const { request, env } = context;
  const cache = caches.default;
  const cacheKey = new Request(new URL(request.url).origin + "/api/biblioteket-nytt", { method: "GET" });

  const hit = await cache.match(cacheKey);
  if (hit) return hit;

  let items = null;
  try {
    items = await buildList();
    if (env.BUILDER_KV && items.length) {
      context.waitUntil(env.BUILDER_KV.put(KV_KEY, JSON.stringify(items)));
    }
  } catch (e) {
    if (env.BUILDER_KV) {
      const saved = await env.BUILDER_KV.get(KV_KEY);
      if (saved) {
        try { items = JSON.parse(saved); } catch (e2) {}
      }
    }
  }
  if (!items) items = [];

  const res = json({ items }, 200, 3600);
  context.waitUntil(cache.put(cacheKey, res.clone()));
  return res;
}
