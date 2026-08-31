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
import { editPasswordOk, editPasswordSource } from "../_lib/edit-password.js";

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

/* Leser lista. Den eldste formen var bare en liste med titler, den nyere er
   { titler: [...], tekst: { <tittel>: <tekstavtrykk> } }. Begge leses, så en
   gammel lagret liste ikke gjør noen skade. */
async function readDelivered(env, slug) {
  try {
    const raw = await env.BUILDER_KV.get(deliveredKey(slug));
    if (!raw) return null;
    const d = JSON.parse(raw);
    if (Array.isArray(d)) return { titler: new Set(d), tekst: {} };
    if (d && Array.isArray(d.titler)) {
      return { titler: new Set(d.titler), tekst: (d && d.tekst) || {} };
    }
    return null;
  } catch (e) { return null; }
}

async function writeDelivered(env, slug, source) {
  try {
    const tekst = {};
    source.lessons.forEach((l) => { tekst[titleKey(l)] = bodyKey(l); });
    await env.BUILDER_KV.put(deliveredKey(slug), JSON.stringify({
      titler: source.lessons.map(titleKey), tekst: tekst,
    }));
  } catch (e) { /* med vilje stille, importen er alt lagret */ }
}

/* Oppdaterer teksten i leksjoner som er endret i koden, men BARE der teksten i
   kurset er nøyaktig den importen leverte sist. Har Renate skrevet om noe i
   Kursbygger, står hennes versjon, og leksjonen telles som hoppet over.

   Uten dette kunne importen bare legge til nye leksjoner: en rettelse i
   teksten til en leksjon som allerede lå der, nådde aldri fram til kurset. */
function updateChangedLessons(live, source, levert) {
  if (!levert || !levert.tekst) return { oppdatert: 0, hoppetOver: 0 };
  let oppdatert = 0, hoppetOver = 0;
  source.lessons.forEach((kilde) => {
    const key = titleKey(kilde);
    const levertTekst = levert.tekst[key];
    if (!levertTekst) return;                       // aldri levert, ikke vår å endre
    const min = live.lessons.find((l) => titleKey(l) === key);
    if (!min) return;                               // slettet eller omdøpt, la den være
    if (bodyKey(min) === bodyKey(kilde)) return;    // allerede lik, ingenting å gjøre
    if (bodyKey(min) !== levertTekst) { hoppetOver++; return; }  // Renate har redigert
    min.body = JSON.parse(JSON.stringify(kilde.body || []));
    min.tip = kilde.tip ? JSON.parse(JSON.stringify(kilde.tip)) : min.tip;
    oppdatert++;
  });
  return { oppdatert: oppdatert, hoppetOver: hoppetOver };
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
  const levertTitler = (levert && levert.titler) || null;
  let added = 0;
  source.lessons.forEach((lesson, i) => {
    const key = titleKey(lesson);
    if (!key || finnes.has(key)) return;
    if (levertTitler && levertTitler.has(key)) return;
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

/* Teksten i en leksjon, normalisert, brukt til å kjenne igjen to leksjoner som
   er den samme selv om tittelen er endret. */
function bodyKey(lesson) {
  return ((lesson && lesson.body) || [])
    .map((b) => ((b && b.no) || "").replace(/\s+/g, " ").trim().toLowerCase())
    .join(" ")
    .slice(0, 400);
}

/* Finner dubletter i kurset: par der to leksjoner har samme innhold, men ulik
   tittel. Det oppstår hvis en leksjon er gitt nytt navn i Kursbygger FØR
   importen begynte å føre liste over hva den hadde levert: importen kjente den
   ikke igjen, og la inn kodens versjon ved siden av.

   Returnerer par på formen { min, fraKoden }, der "min" er leksjonen Renate
   har i kurset sitt (tittel som ikke finnes i koden, altså den hun har døpt
   om) og "fraKoden" er kopien importen la inn. Sletter ingenting. */
function finnDubletter(live, source) {
  const kodeTitler = new Set(source.lessons.map(titleKey));
  const par = [];
  live.lessons.forEach((a, i) => {
    const aKey = bodyKey(a);
    if (!aKey) return;
    live.lessons.forEach((b, j) => {
      if (j <= i) return;
      if (bodyKey(b) !== aKey) return;
      if (titleKey(a) === titleKey(b)) return;
      // Den som IKKE står i koden er Renates egen, den beholdes.
      const aFraKoden = kodeTitler.has(titleKey(a));
      const bFraKoden = kodeTitler.has(titleKey(b));
      if (aFraKoden === bFraKoden) return; // ingen tydelig vinner, la den stå
      par.push({
        min: aFraKoden ? b.title.no : a.title.no,
        fraKoden: aFraKoden ? a.title.no : b.title.no,
        tekst: (((aFraKoden ? b : a).body || [])[0] || {}).no || "",
      });
    });
  });
  return par;
}

/* Selve importen. Kalles både fra GET (adresselinjen) og POST (siden
   /kurs-import, som sender passordet i kroppen i stedet for i URL-en, så det
   ikke havner i nettleserhistorikken). */
async function importer(env, pw, full) {
  if (!env.BUILDER_KV) return json({ error: "not_configured" }, 200);
  if (!editPasswordOk(env, pw, [DEFAULT_PASSWORD])) {
    // Sier IKKE hva passordet er, bare hvor det kommer fra. Uten dette er det
    // umulig å vite om et avvist passord skyldes standarden i koden eller en
    // hemmelighet satt i Cloudflare som overstyrer den.
    return json({ error: "bad_password", kilde: editPasswordSource(env) }, 401);
  }

  const source = sanitizeCourse(PLATTFORM_KURS);
  if (!source) return json({ error: "bad_course_data" }, 500);

  try {
    if (!full) {
      const raw = await env.BUILDER_KV.get(KEY_PREFIX + source.slug);
      if (raw) {
        let live = null;
        try { live = sanitizeCourse(JSON.parse(raw)); } catch (e) { live = null; }
        if (live) {
          const levert = await readDelivered(env, source.slug);
          const added = addMissingLessons(live, source, levert);
          const endret = updateChangedLessons(live, source, levert);
          const res = fillEnglish(live, translationMap(source));
          const err = await store(env, live);
          if (err) return json(err, 413);
          await writeDelivered(env, source.slug, source);
          return json({
            ok: true, slug: live.slug, mode: "en", filled: res.filled, skipped: res.skipped,
            added: added, oppdatert: endret.oppdatert, beholdt: endret.hoppetOver,
            lessonCount: live.lessons.length,
            dubletter: finnDubletter(live, source),
          });
        }
      }
    }
    const err = await store(env, source);
    if (err) return json(err, 413);
    await writeDelivered(env, source.slug, source);
    return json({ ok: true, slug: source.slug, mode: full ? "full" : "en", lessonCount: source.lessons.length });
  } catch (e) {
    return json({ error: "write_failed", detail: String(e) }, 200);
  }
}

/* Ser etter dubletter uten å endre noe. */
async function seEtterDubletter(env) {
  const source = sanitizeCourse(PLATTFORM_KURS);
  const raw = await env.BUILDER_KV.get(KEY_PREFIX + source.slug);
  if (!raw) return json({ ok: true, dubletter: [], lessonCount: 0 });
  const live = sanitizeCourse(JSON.parse(raw));
  return json({ ok: true, dubletter: finnDubletter(live, source), lessonCount: live.lessons.length });
}

/* Fjerner kodens kopi i hvert dublettpar, og beholder leksjonen Renate har
   døpt om, med teksten hennes. Fjerner ALDRI en leksjon som ikke inngår i et
   par der den andre halvdelen fortsatt blir stående. */
async function fjernDubletter(env) {
  const source = sanitizeCourse(PLATTFORM_KURS);
  const raw = await env.BUILDER_KV.get(KEY_PREFIX + source.slug);
  if (!raw) return json({ error: "not_found" }, 404);
  const live = sanitizeCourse(JSON.parse(raw));
  const par = finnDubletter(live, source);
  if (!par.length) return json({ ok: true, fjernet: 0, lessonCount: live.lessons.length, dubletter: [] });

  const skalBort = new Set(par.map((d) => d.fraKoden.trim().toLowerCase()));
  const beholdes = new Set(par.map((d) => d.min.trim().toLowerCase()));
  const foer = live.lessons.length;
  live.lessons = live.lessons.filter((l) => {
    const t = titleKey(l);
    // Bare kodens kopi ryker, og bare når leksjonen den dubletterer blir stående.
    return !(skalBort.has(t) && live.lessons.some((a) => beholdes.has(titleKey(a))));
  });
  const err = await store(env, live);
  if (err) return json(err, 413);
  return json({
    ok: true, fjernet: foer - live.lessons.length, lessonCount: live.lessons.length,
    titler: par.map((d) => d.fraKoden), dubletter: finnDubletter(live, source),
  });
}

export async function onRequestGet(context) {
  const url = new URL(context.request.url);
  return importer(
    context.env,
    (url.searchParams.get("pw") || "").trim(),
    url.searchParams.get("mode") === "full"
  );
}

/* POST /api/seed-plattform-kurs  body { password, mode? }
   Brukt av siden /kurs-import. Samme sjekk og samme resultat som GET. */
export async function onRequestPost(context) {
  let body = null;
  try { body = await context.request.json(); } catch (e) { body = null; }
  const env = context.env;
  const pw = (((body && body.password) || "") + "").trim();
  if (!env.BUILDER_KV) return json({ error: "not_configured" }, 200);
  if (!editPasswordOk(env, pw, [DEFAULT_PASSWORD])) {
    return json({ error: "bad_password", kilde: editPasswordSource(env) }, 401);
  }
  try {
    if (body && body.action === "dubletter") return await seEtterDubletter(env);
    if (body && body.action === "fjern-dubletter") return await fjernDubletter(env);
  } catch (e) {
    return json({ error: "write_failed", detail: String(e) }, 200);
  }
  return importer(env, pw, (body && body.mode) === "full");
}
