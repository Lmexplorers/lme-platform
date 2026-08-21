/**
 * Engangs-import: laster "LME-plattformen fra A til Å"-kurset (skrevet i
 * koden, se _lib/seed-plattform-kurs-data.js) rett inn i Kursbygger sin
 * lagring (KV), uten at Renate må lime det inn manuelt i Kursbygger-UI-et.
 *
 * Grunnen til at dette må gå via en egen adresse i stedet for en vanlig
 * git-push: Kursbygger-kurs lagres i Cloudflare KV, som bare selve det
 * driftede nettstedet kan skrive til (via functions/api/kurs.js sitt
 * POST-endepunkt). En agent-sandkasse uten nettverkstilgang til
 * lmexplorers.com kan pushe koden hit, men kan ikke selv rope til det
 * levende API-et. Denne siden gjør akkurat det kallet, kjørt av Renate i
 * nettleseren hennes med ett enkelt trykk.
 *
 * GET /api/seed-plattform-kurs?pw=<COURSE_EDIT_PASSWORD>
 *   Standard: fyller bare inn engelsk tekst i kurset som allerede ligger i
 *   KV. Norsk tekst røres ikke, så alt Renate har redigert i Kursbygger blir
 *   stående. Engelsk fylles inn der feltet er tomt, og bare når den norske
 *   teksten er den samme som i koden. Ligger ikke kurset i KV ennå, skrives
 *   hele kurset inn.
 *   -> { ok: true, slug, mode: "en", filled, skipped, lessonCount }
 *
 * GET /api/seed-plattform-kurs?pw=<...>&mode=full
 *   Overskriver hele kurset med innholdet i koden. Bruk kun når du vil
 *   forkaste eventuelle endringer gjort i Kursbygger.
 *   -> { ok: true, slug, mode: "full", lessonCount }
 *
 * Password er det samme som ellers i Kursbygger.
 */
import { sanitizeCourse, indexEntry, readIndex, KEY_PREFIX, INDEX_KEY, MAX_SIZE, DEFAULT_PASSWORD } from "./kurs.js";
import { PLATTFORM_KURS } from "../_lib/seed-plattform-kurs-data.js";

function json(data, status) {
  return new Response(JSON.stringify(data, null, 2), {
    status: status || 200,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

/* Gaar gjennom alle { no, en }-felt i et kurs og kaller fn paa hvert av dem. */
function eachLangField(node, fn) {
  if (Array.isArray(node)) { node.forEach((v) => eachLangField(v, fn)); return; }
  if (!node || typeof node !== "object") return;
  if (typeof node.no === "string" && typeof node.en === "string") { fn(node); return; }
  Object.keys(node).forEach((k) => eachLangField(node[k], fn));
}

/* Norsk tekst -> engelsk tekst, hentet fra kurset i koden. */
function translationMap(source) {
  const map = new Map();
  eachLangField(source, (f) => {
    const no = f.no.trim();
    if (no && f.en.trim()) map.set(no, f.en);
  });
  return map;
}

/* Fyller inn engelsk i live-kurset uten aa roere norsk tekst. */
function fillEnglish(live, map) {
  let filled = 0, skipped = 0;
  eachLangField(live, (f) => {
    if (!f.no.trim() || f.en.trim()) return;
    const en = map.get(f.no.trim());
    if (en) { f.en = en; filled++; } else { skipped++; }
  });
  return { filled: filled, skipped: skipped };
}

async function store(env, course) {
  const payload = JSON.stringify(course);
  if (payload.length > MAX_SIZE) return { error: "too_large", bytes: payload.length };
  await env.BUILDER_KV.put(KEY_PREFIX + course.slug, payload);
  const index = (await readIndex(env)).filter((c) => c && c.slug !== course.slug);
  index.push(indexEntry(course));
  index.sort((a, b) => (b.updated || 0) - (a.updated || 0));
  await env.BUILDER_KV.put(INDEX_KEY, JSON.stringify(index));
  return null;
}

export async function onRequestGet(context) {
  const { request, env } = context;
  if (!env.BUILDER_KV) return json({ error: "not_configured" }, 200);

  const url = new URL(request.url);
  const pw = (url.searchParams.get("pw") || "").trim();
  const expected = (env.COURSE_EDIT_PASSWORD || DEFAULT_PASSWORD) + "";
  if (pw !== expected) return json({ error: "bad_password" }, 401);
  const full = url.searchParams.get("mode") === "full";

  const source = sanitizeCourse(PLATTFORM_KURS);
  if (!source) return json({ error: "bad_course_data" }, 500);

  try {
    if (!full) {
      const raw = await env.BUILDER_KV.get(KEY_PREFIX + source.slug);
      if (raw) {
        let live = null;
        try { live = sanitizeCourse(JSON.parse(raw)); } catch (e) { live = null; }
        if (live) {
          const res = fillEnglish(live, translationMap(source));
          const err = await store(env, live);
          if (err) return json(err, 413);
          return json({ ok: true, slug: live.slug, mode: "en", filled: res.filled, skipped: res.skipped, lessonCount: live.lessons.length });
        }
      }
    }
    const err = await store(env, source);
    if (err) return json(err, 413);
    return json({ ok: true, slug: source.slug, mode: full ? "full" : "en", lessonCount: source.lessons.length });
  } catch (e) {
    return json({ error: "write_failed", detail: String(e) }, 200);
  }
}
