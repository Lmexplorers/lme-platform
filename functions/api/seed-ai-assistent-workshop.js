/**
 * Import: laster workshopen "Ansett dine fem AI-assistenter" (skrevet i
 * koden, se _lib/seed-ai-assistent-workshop-data.js) rett inn i Kursbygger
 * sin lagring (KV), så Renate slipper å lime inn innholdet manuelt.
 *
 * Grunnen til at dette må gå via en egen adresse i stedet for en vanlig
 * git-push: Kursbygger-kurs lagres i Cloudflare KV, som bare det driftede
 * nettstedet kan skrive til. Koden kan pushes hit, men selve skrivingen må
 * skje fra nettleseren hennes, med ett trykk på https://lmexplorers.com/kurs-import
 *
 * GET  /api/seed-ai-assistent-workshop?pw=<passord>
 * POST /api/seed-ai-assistent-workshop   body { password, mode? }
 *   Standard: ligger ikke workshopen i KV ennå, skrives hele inn. Ligger den
 *   der, legges bare leksjoner som mangler til, og tekst Renate har endret i
 *   Kursbygger blir stående urørt.
 *   -> { ok: true, slug, mode: "ny"|"lagt-til", added, lessonCount }
 *
 * Med mode=full overskrives hele workshopen med innholdet i koden. Bruk kun
 * når endringer gjort i Kursbygger skal forkastes.
 */
import { sanitizeCourse, indexEntry, readIndex, KEY_PREFIX, INDEX_KEY, MAX_SIZE, DEFAULT_PASSWORD } from "./kurs.js";
import { AI_ASSISTENT_WORKSHOP } from "../_lib/seed-ai-assistent-workshop-data.js";
import { editPasswordOk, editPasswordSource } from "../_lib/edit-password.js";

function json(data, status) {
  return new Response(JSON.stringify(data, null, 2), {
    status: status || 200,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

/* Norsk tittel som nøkkel, så en leksjon kjennes igjen på tvers av koden og
   det lagrede kurset. */
function titleKey(lesson) {
  return ((lesson && lesson.title && lesson.title.no) || "").trim().toLowerCase();
}

/* Legger inn leksjoner fra koden som mangler i det lagrede kurset, på samme
   plass som de har i koden. Rører aldri en leksjon som alt ligger der. */
function addMissingLessons(live, source) {
  const finnes = new Set(live.lessons.map(titleKey));
  let added = 0;
  source.lessons.forEach((kilde, i) => {
    const key = titleKey(kilde);
    if (!key || finnes.has(key)) return;
    const foran = source.lessons.slice(0, i).map(titleKey).filter((t) => finnes.has(t)).pop();
    const pos = foran ? live.lessons.findIndex((l) => titleKey(l) === foran) + 1 : live.lessons.length;
    live.lessons.splice(pos, 0, JSON.parse(JSON.stringify(kilde)));
    finnes.add(key);
    added++;
  });
  return added;
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

async function importer(env, pw, full) {
  if (!env.BUILDER_KV) return json({ error: "not_configured" }, 200);
  if (!editPasswordOk(env, pw, [DEFAULT_PASSWORD])) {
    return json({ error: "bad_password", kilde: editPasswordSource(env) }, 401);
  }

  const source = sanitizeCourse(AI_ASSISTENT_WORKSHOP);
  if (!source) return json({ error: "bad_course_data" }, 500);

  try {
    if (!full) {
      const raw = await env.BUILDER_KV.get(KEY_PREFIX + source.slug);
      if (raw) {
        let live = null;
        try { live = sanitizeCourse(JSON.parse(raw)); } catch (e) { live = null; }
        if (live) {
          const added = addMissingLessons(live, source);
          const err = await store(env, live);
          if (err) return json(err, 413);
          return json({
            ok: true, slug: live.slug, mode: "lagt-til",
            added: added, lessonCount: live.lessons.length,
          });
        }
      }
    }
    const err = await store(env, source);
    if (err) return json(err, 413);
    return json({
      ok: true, slug: source.slug, mode: full ? "full" : "ny",
      added: source.lessons.length, lessonCount: source.lessons.length,
    });
  } catch (e) {
    return json({ error: "write_failed", detail: String(e) }, 200);
  }
}

export async function onRequestGet(context) {
  const url = new URL(context.request.url);
  return importer(
    context.env,
    (url.searchParams.get("pw") || "").trim(),
    url.searchParams.get("mode") === "full"
  );
}

export async function onRequestPost(context) {
  let body = null;
  try { body = await context.request.json(); } catch (e) { body = null; }
  return importer(
    context.env,
    (((body && body.password) || "") + "").trim(),
    (body && body.mode) === "full"
  );
}
