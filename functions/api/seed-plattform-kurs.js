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
 *   Standard: legger til leksjoner som er nye i koden, og fyller inn engelsk
 *   tekst i kurset som allerede ligger i KV. Norsk tekst røres ikke, og en
 *   leksjon som alt ligger der blir stående nøyaktig som den er, så alt
 *   Renate har redigert i Kursbygger beholdes. Nye leksjoner settes inn på
 *   samme plass som de har i koden. Engelsk fylles inn der feltet er tomt, og
 *   bare når den norske teksten er den samme som i koden. Ligger ikke kurset
 *   i KV ennå, skrives hele kurset inn.
 *   -> { ok: true, slug, mode: "en", filled, skipped, added, lessonCount }
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

/* Norsk tittel som nøkkel, brukt til å kjenne igjen en leksjon på tvers av
   koden og det lagrede kurset. */
function titleKey(lesson) {
  return ((lesson && lesson.title && lesson.title.no) || "").trim().toLowerCase();
}

/* Hvilke leksjoner denne importen allerede har levert til kurset, lagret som
   en liste med norske titler. Uten dette ville en leksjon Renate har gitt et
   nytt navn i Kursbygger se ut som en manglende leksjon, og blitt lagt inn på
   nytt som en duplikat. Med lista vet vi at den er levert før, uansett hva
   den heter nå. */
const deliveredKey = (slug) => "lme-builder:kurs-levert:" + slug;

async function readDelivered(env, slug) {
  try {
    const raw = await env.BUILDER_KV.get(deliveredKey(slug));
    if (!raw) return null;
    const list = JSON.parse(raw);
    return Array.isArray(list) ? new Set(list) : null;
  } catch (e) { return null; }
}

async function writeDelivered(env, slug, keys) {
  try {
    await env.BUILDER_KV.put(deliveredKey(slug), JSON.stringify(keys));
  } catch (e) { /* med vilje stille, importen er alt lagret */ }
}

/* Legger til leksjoner som finnes i koden, men ikke i kurset som ligger i KV.
   Nye leksjoner settes inn rett etter leksjonen de følger i koden, så
   rekkefølgen blir den samme begge steder. En leksjon som allerede ligger der
   røres ALDRI, uansett hvor mye teksten er endret i Kursbygger. Slik kan et
   nytt verktøy (for eksempel LME Vault) komme inn i kurset uten at Renate
   mister noe hun har skrevet om.

   `levert` er lista over leksjoner importen har levert før. Finnes den, er
   den fasiten, og en leksjon som står der legges aldri inn igjen selv om den
   har byttet navn i Kursbygger. Første gang finnes ingen liste, og da
   sammenlignes det mot kurset slik det ligger, som stemmer, siden kurset
   opprinnelig ble skrevet inn fra nettopp denne koden. */
function addMissingLessons(live, source, levert) {
  const finnes = new Set(live.lessons.map(titleKey));
  let added = 0;
  source.lessons.forEach((lesson, i) => {
    const key = titleKey(lesson);
    if (!key || finnes.has(key)) return;
    if (levert && levert.has(key)) return;
    // Finn nærmeste leksjon foran i koden som også ligger i det lagrede
    // kurset, og legg den nye rett etter den. Finner vi ingen, havner den sist.
    let pos = live.lessons.length;
    for (let j = i - 1; j >= 0; j--) {
      const before = titleKey(source.lessons[j]);
      const at = live.lessons.findIndex((l) => titleKey(l) === before);
      if (at !== -1) { pos = at + 1; break; }
    }
    live.lessons.splice(pos, 0, JSON.parse(JSON.stringify(lesson)));
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
          const added = addMissingLessons(live, source, await readDelivered(env, source.slug));
          const res = fillEnglish(live, translationMap(source));
          const err = await store(env, live);
          if (err) return json(err, 413);
          await writeDelivered(env, source.slug, source.lessons.map(titleKey));
          return json({ ok: true, slug: live.slug, mode: "en", filled: res.filled, skipped: res.skipped, added: added, lessonCount: live.lessons.length });
        }
      }
    }
    const err = await store(env, source);
    if (err) return json(err, 413);
    await writeDelivered(env, source.slug, source.lessons.map(titleKey));
    return json({ ok: true, slug: source.slug, mode: full ? "full" : "en", lessonCount: source.lessons.length });
  } catch (e) {
    return json({ error: "write_failed", detail: String(e) }, 200);
  }
}
