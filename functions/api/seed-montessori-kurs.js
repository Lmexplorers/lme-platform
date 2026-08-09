/**
 * Engangs-import: laster de to Montessori-kursene (skrevet i koden, se
 * _lib/seed-montessori-kurs-data.js) rett inn i Kursbygger sin lagring (KV),
 * uten at Renate må lime det inn manuelt i Kursbygger-UI-et. Samme mønster
 * som seed-plattform-kurs.js.
 *
 * GET /api/seed-montessori-kurs?pw=<COURSE_EDIT_PASSWORD>
 *   -> { ok: true, courses: [{slug, lessonCount}, ...] } eller { error: "..." }
 *
 * Trygt å kjøre flere ganger (overskriver med samme innhold hver gang).
 * Password er det samme som ellers i Kursbygger.
 */
import { sanitizeCourse, indexEntry, readIndex, KEY_PREFIX, INDEX_KEY, MAX_SIZE, DEFAULT_PASSWORD } from "./kurs.js";
import { MONTESSORI_KOM_I_GANG, MONTESSORI_MASTERCLASS } from "../_lib/seed-montessori-kurs-data.js";

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

  const results = [];
  for (const raw of [MONTESSORI_KOM_I_GANG, MONTESSORI_MASTERCLASS]) {
    const course = sanitizeCourse(raw);
    if (!course) { results.push({ error: "bad_course_data", slug: raw && raw.slug }); continue; }
    const payload = JSON.stringify(course);
    if (payload.length > MAX_SIZE) { results.push({ error: "too_large", slug: course.slug, bytes: payload.length }); continue; }
    try {
      await env.BUILDER_KV.put(KEY_PREFIX + course.slug, payload);
      const index = (await readIndex(env)).filter((c) => c && c.slug !== course.slug);
      index.push(indexEntry(course));
      index.sort((a, b) => (b.updated || 0) - (a.updated || 0));
      await env.BUILDER_KV.put(INDEX_KEY, JSON.stringify(index));
      results.push({ ok: true, slug: course.slug, lessonCount: course.lessons.length });
    } catch (e) {
      results.push({ error: "write_failed", slug: course.slug, detail: String(e) });
    }
  }
  return json({ ok: results.every((r) => r.ok), courses: results });
}
