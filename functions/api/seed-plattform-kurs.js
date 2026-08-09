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
 *   -> { ok: true, slug, lessonCount } eller { error: "..." }
 *
 * Trygt å kjøre flere ganger (overskriver med samme innhold hver gang).
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

export async function onRequestGet(context) {
  const { request, env } = context;
  if (!env.BUILDER_KV) return json({ error: "not_configured" }, 200);

  const url = new URL(request.url);
  const pw = (url.searchParams.get("pw") || "").trim();
  const expected = (env.COURSE_EDIT_PASSWORD || DEFAULT_PASSWORD) + "";
  if (pw !== expected) return json({ error: "bad_password" }, 401);

  const course = sanitizeCourse(PLATTFORM_KURS);
  if (!course) return json({ error: "bad_course_data" }, 500);

  const payload = JSON.stringify(course);
  if (payload.length > MAX_SIZE) return json({ error: "too_large", bytes: payload.length }, 413);

  try {
    await env.BUILDER_KV.put(KEY_PREFIX + course.slug, payload);
    const index = (await readIndex(env)).filter((c) => c && c.slug !== course.slug);
    index.push(indexEntry(course));
    index.sort((a, b) => (b.updated || 0) - (a.updated || 0));
    await env.BUILDER_KV.put(INDEX_KEY, JSON.stringify(index));
    return json({ ok: true, slug: course.slug, lessonCount: course.lessons.length });
  } catch (e) {
    return json({ error: "write_failed", detail: String(e) }, 200);
  }
}
