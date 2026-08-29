/**
 * LME Læringsverksted — pedagogiske ressurser (arbeidsark, plakater, trepartskort,
 * temapakker osv.) lagret som JSON i Cloudflare KV, etter nøyaktig samme mønster
 * som gruppebygger/kursbygger (functions/api/gruppe.js / kurs.js).
 *
 * GET  /api/laeringsverksted
 *        -> { resources: [ <indexEntry>, ... ] }        (offentlig liste/katalog)
 *        Er ekte lager tomt, returneres noen tydelig merkede eksempelressurser
 *        (example:true) slik at katalogen aldri fremstår tom før Renate har
 *        lagt inn ekte innhold. De forsvinner automatisk så snart første
 *        ressurs er lagret via byggeren.
 *
 * GET  /api/laeringsverksted?slug=min-ressurs
 *        -> { resource: { ... } | null }                (offentlig: hele ressursen)
 *
 * POST /api/laeringsverksted   body { action:"save", resource:{...}, password }
 *        -> { ok:true, slug }
 * POST /api/laeringsverksted   body { action:"delete", slug, password }
 *        -> { ok:true }
 * POST /api/laeringsverksted   body { action:"track", slug, kind:"view"|"download"|"favorite"|"unfavorite" }
 *        -> { ok:true }   (ingen passord — enkel tellerøkning, ikke race-safe,
 *                          men samme "godt nok"-nivå som resten av plattformen)
 *
 * Bruker samme KV-binding og passord som gruppe/kurs: BUILDER_KV og
 * hemmeligheten COURSE_EDIT_PASSWORD (ellers standardpassordet under).
 *
 * Ressurs-JSON (alle tekstfelt er { no, en }; en kan være tom og faller
 * tilbake til norsk i visningen):
 *   {
 *     slug, published: true|false,
 *     title, subtitle, description: {no,en},
 *     cover: dataURL|undefined, gallery: [dataURL,...],
 *     audience: ["foreldre"|"pedagog"|"montessoripedagog"|"spesialpedagog"|"hjemme"],
 *     ageBands: ["0-3","3-6","1-2trinn","3-4trinn","5-7trinn","8-10trinn","vgs","m0-3","m3-6","m6-9","m9-12","m12-16"],
 *     direction: "montessori"|"offentlig"|"begge"|"ingen",
 *     subjects: ["norsk","matematikk","engelsk",...],   // fag/områder, frie nøkler
 *     resourceType: ["arbeidsark","plakat","trepartskort",...],
 *     competencyGoals: [ {no,en} ],
 *     montessoriArea: { area, presentation, prerequisites, directPurpose,
 *                        indirectPurpose, controlOfError, extension } (hver {no,en})
 *     contains: [ {no,en} ], pageCount, language: ["nb","nn","en"],
 *     fileFormat: ["pdf","docx","png"], editable: true|false,
 *     usageTips, prep, differentiation: {no,en},
 *     license: "gratis"|"privat"|"pedagog"|"barnehage"|"skole",
 *     priceType: "gratis"|"betalt"|"medlem",
 *     price, memberPrice: {no,en}, buyUrl,
 *     bundle: true|false, bundleItems: [slug,...], related: [slug,...],
 *     bookly: { type, topic, age, plan, fag, alder, category } // dyplenke-forslag
 *     featured: true|false, stats: { views, downloads, favorites },
 *     updated
 *   }
 */

export const DEFAULT_PASSWORD = "LME2026";
export const KEY_PREFIX = "lme-builder:lv:";
export const INDEX_KEY = "lme-builder:lv-index";
export const MAX_SIZE = 4 * 1024 * 1024;
const MAX_IMG = 900000;

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

function cleanUrl(s, max) {
  if (typeof s !== "string") return "";
  const t = s.trim().slice(0, max || 400);
  return /^https?:\/\//i.test(t) ? t : "";
}

function cleanLink(s, max) {
  if (typeof s !== "string") return "";
  const t = s.trim().slice(0, max || 300);
  if (/^https?:\/\//i.test(t)) return t;
  if (/^\/[^\s]*$/.test(t)) return t;
  return "";
}

function tagList(v, max, itemMax) {
  if (!Array.isArray(v)) return [];
  const out = [];
  for (const item of v.slice(0, max || 20)) {
    if (typeof item !== "string") continue;
    const t = item.trim().slice(0, itemMax || 40);
    if (t && /^[a-z0-9æøå\-]+$/i.test(t)) out.push(t.toLowerCase());
  }
  return Array.from(new Set(out));
}

function slugList(v, max) {
  if (!Array.isArray(v)) return [];
  const out = [];
  for (const item of v.slice(0, max || 12)) {
    const s = cleanSlug(item);
    if (s) out.push(s);
  }
  return Array.from(new Set(out));
}

function langArray(v, maxItems, itemMax) {
  if (!Array.isArray(v)) return [];
  const out = [];
  for (const item of v.slice(0, maxItems || 30)) {
    const lf = langField(item, itemMax || 300);
    if (lf.no.trim()) out.push(lf);
  }
  return out;
}

function safeInt(v, min, max, def) {
  const n = parseInt(v, 10);
  if (!isFinite(n)) return def;
  return Math.min(max, Math.max(min, n));
}

const PRICE_TYPES = ["gratis", "betalt", "medlem"];
const LICENSES = ["gratis", "privat", "pedagog", "barnehage", "skole"];
const PAID_LICENSES = ["privat", "pedagog", "barnehage", "skole"];
const DIRECTIONS = ["montessori", "offentlig", "begge", "ingen"];

/* Flere kjøpbare lisensnivåer på samme ressurs (f.eks. privatlisens for én
   familie vs. skolelisens for hele skolen), hver med egen pris og egen
   Stripe-betalingslenke. Valgfritt: en ressurs uten dette bruker fortsatt
   bare de vanlige price/buyUrl-feltene (bakoverkompatibelt). Maks ett
   oppføring per lisenstype; siste oppføring for en gitt lisens vinner. */
function licenseOptionList(v) {
  if (!Array.isArray(v)) return [];
  const byLicense = {};
  for (const item of v.slice(0, PAID_LICENSES.length)) {
    if (!item || typeof item !== "object") continue;
    if (!PAID_LICENSES.includes(item.license)) continue;
    const price = langField(item.price, 60);
    const buyUrl = cleanLink(item.buyUrl, 400);
    if (!price.no.trim() && !buyUrl) continue;
    byLicense[item.license] = { license: item.license, price, buyUrl };
  }
  return PAID_LICENSES.map((l) => byLicense[l]).filter(Boolean);
}

export function sanitizeResource(raw) {
  if (!raw || typeof raw !== "object") return null;
  const slug = cleanSlug(raw.slug);
  if (!slug) return null;

  const resource = {
    slug,
    published: raw.published !== false,
    title: langField(raw.title, 140),
    subtitle: langField(raw.subtitle, 200),
    description: langField(raw.description, 3000),
    audience: tagList(raw.audience, 8, 30),
    ageBands: tagList(raw.ageBands, 12, 20),
    direction: DIRECTIONS.includes(raw.direction) ? raw.direction : "ingen",
    subjects: tagList(raw.subjects, 12, 30),
    resourceType: tagList(raw.resourceType, 6, 30),
    competencyGoals: langArray(raw.competencyGoals, 20, 500),
    contains: langArray(raw.contains, 30, 200),
    pageCount: safeInt(raw.pageCount, 0, 999, 0),
    language: tagList(raw.language, 4, 6),
    fileFormat: tagList(raw.fileFormat, 6, 10),
    editable: !!raw.editable,
    usageTips: langField(raw.usageTips, 1500),
    prep: langField(raw.prep, 1000),
    differentiation: langField(raw.differentiation, 1500),
    license: LICENSES.includes(raw.license) ? raw.license : "gratis",
    priceType: PRICE_TYPES.includes(raw.priceType) ? raw.priceType : "gratis",
    price: langField(raw.price, 40),
    memberPrice: langField(raw.memberPrice, 40),
    /* Valgfri Stripe-rabattkode kjøperen selv taster inn i kassen (Stripe
       "allow_promotion_codes" på betalingslenken). Ren visningstekst, ikke
       koblet til noen egen medlems-only kjøpslenke. */
    memberPromoCode: String(raw.memberPromoCode || "").trim().slice(0, 40),
    buyUrl: cleanLink(raw.buyUrl, 400),
    /* Selve fila (PDF e.l.) som skal leveres etter kjøp/nedlasting. For
       gratisressurser holder buyUrl alene (som før); for betalte ressurser
       er buyUrl Stripe-betalingslenken, så fileUrl er nedlastingslenken
       leveringsmailen sender etter et registrert kjøp (se
       LAERINGSVERKSTED_PAYMENT_LINKS i functions/_lib/purchase-links.js). */
    fileUrl: cleanLink(raw.fileUrl, 400),
    licenseOptions: licenseOptionList(raw.licenseOptions),
    bundle: !!raw.bundle,
    bundleItems: slugList(raw.bundleItems, 20),
    related: slugList(raw.related, 8),
    featured: !!raw.featured,
    montessoriArea: {
      area: langField(raw.montessoriArea && raw.montessoriArea.area, 120),
      presentation: langField(raw.montessoriArea && raw.montessoriArea.presentation, 800),
      prerequisites: langField(raw.montessoriArea && raw.montessoriArea.prerequisites, 400),
      directPurpose: langField(raw.montessoriArea && raw.montessoriArea.directPurpose, 400),
      indirectPurpose: langField(raw.montessoriArea && raw.montessoriArea.indirectPurpose, 400),
      controlOfError: langField(raw.montessoriArea && raw.montessoriArea.controlOfError, 400),
      extension: langField(raw.montessoriArea && raw.montessoriArea.extension, 400),
    },
    bookly: {
      type: (["book", "workbook", "activity", "puzzle", "flashcards", "coloring", "journal", "planner"].includes(raw.bookly && raw.bookly.type)) ? raw.bookly.type : "",
      category: typeof (raw.bookly && raw.bookly.category) === "string" ? raw.bookly.category.slice(0, 40) : "",
      topic: typeof (raw.bookly && raw.bookly.topic) === "string" ? raw.bookly.topic.slice(0, 200) : "",
      age: typeof (raw.bookly && raw.bookly.age) === "string" ? raw.bookly.age.slice(0, 10) : "",
      plan: ["montessori", "lk20", "lme36", ""].includes(raw.bookly && raw.bookly.plan) ? raw.bookly.plan : "",
      fag: typeof (raw.bookly && raw.bookly.fag) === "string" ? raw.bookly.fag.slice(0, 40) : "",
      alder: typeof (raw.bookly && raw.bookly.alder) === "string" ? raw.bookly.alder.slice(0, 10) : "",
    },
    gallery: [],
    stats: {
      views: safeInt(raw.stats && raw.stats.views, 0, 100000000, 0),
      downloads: safeInt(raw.stats && raw.stats.downloads, 0, 100000000, 0),
      favorites: safeInt(raw.stats && raw.stats.favorites, 0, 100000000, 0),
    },
    updated: Date.now(),
  };
  if (isDataImg(raw.cover) || cleanUrl(raw.cover)) resource.cover = isDataImg(raw.cover) ? raw.cover : cleanUrl(raw.cover);
  (Array.isArray(raw.gallery) ? raw.gallery : []).slice(0, 10).forEach((g) => {
    if (isDataImg(g) || cleanUrl(g)) resource.gallery.push(isDataImg(g) ? g : cleanUrl(g));
  });
  if (!resource.title.no.trim()) return null;
  return resource;
}

export function indexEntry(r) {
  return {
    slug: r.slug,
    title: r.title,
    subtitle: r.subtitle,
    cover: r.cover,
    audience: r.audience,
    ageBands: r.ageBands,
    direction: r.direction,
    subjects: r.subjects,
    resourceType: r.resourceType,
    language: r.language,
    license: r.license,
    priceType: r.priceType,
    price: r.price,
    memberPrice: r.memberPrice,
    memberPromoCode: r.memberPromoCode,
    bundle: r.bundle,
    featured: r.featured,
    published: r.published,
    stats: r.stats,
    updated: r.updated,
  };
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

async function writeIndex(env, index) {
  index.sort((a, b) => (b.updated || 0) - (a.updated || 0));
  await env.BUILDER_KV.put(INDEX_KEY, JSON.stringify(index));
}

/* Selvreparerende liste, samme mønster som gruppe.js/kurs.js. */
async function fullIndex(env) {
  const index = await readIndex(env);
  try {
    const listed = await env.BUILDER_KV.list({ prefix: KEY_PREFIX, limit: 1000 });
    const kjent = new Set(index.map((r) => r && r.slug));
    let endret = false;
    for (const key of (listed && listed.keys) || []) {
      const slug = key.name.slice(KEY_PREFIX.length);
      if (!slug || kjent.has(slug)) continue;
      const raw = await env.BUILDER_KV.get(key.name);
      if (!raw) continue;
      try {
        const r = JSON.parse(raw);
        if (r && r.slug) {
          index.push(indexEntry(r));
          endret = true;
        }
      } catch (e) { /* hopp over ødelagte oppføringer */ }
    }
    if (endret) await writeIndex(env, index);
  } catch (e) { /* uten list-støtte brukes indeksen som før */ }
  return index;
}

/* Eksempeldata: vises KUN når det ekte lageret er tomt, tydelig merket
   example:true i svaret. Fjernes automatisk fra visningen så snart Renate
   lagrer sin første ekte ressurs via /laeringsverksted-bygger. Ikke
   presenter disse som ferdige salgsprodukter — de er demonstrasjon av
   systemet. */
function exampleResources() {
  const now = 0;
  return [
    {
      slug: "eksempel-hosttema-arbeidshefte",
      published: true,
      example: true,
      title: { no: "EKSEMPEL: Høsttema arbeidshefte", en: "EXAMPLE: Autumn theme workbook" },
      subtitle: { no: "Naturfag og praktisk liv, 3–6 år", en: "Science and practical life, ages 3-6" },
      description: {
        no: "Et arbeidshefte om høsten: blader, dyr som forbereder vinteren, og enkle tellemønstre. Vist her som eksempel på hvordan en ressurs ser ut i Læringsverksted.",
        en: "A workbook about autumn: leaves, animals preparing for winter, and simple counting patterns. Shown here as an example of how a resource looks in the Learning Workshop.",
      },
      cover: "",
      gallery: [],
      audience: ["foreldre", "pedagog", "montessoripedagog"],
      ageBands: ["3-6", "m6-9"],
      direction: "begge",
      subjects: ["naturfag", "praktisk-liv"],
      resourceType: ["arbeidshefte", "temapakke"],
      competencyGoals: [{ no: "Utforske og beskrive plantenes og dyrenes grunnleggende behov.", en: "Explore and describe the basic needs of plants and animals." }],
      contains: [{ no: "12 arbeidsark", en: "12 worksheets" }, { no: "Fasit", en: "Answer key" }, { no: "Lærerveiledning", en: "Teacher guide" }],
      pageCount: 16,
      language: ["nb", "en"],
      fileFormat: ["pdf"],
      editable: false,
      usageTips: { no: "Bruk som stasjonsarbeid eller hjemmelekse i høstmånedene.", en: "Use as station work or homework during autumn." },
      prep: { no: "Skriv ut i farger eller sort/hvitt.", en: "Print in color or black and white." },
      differentiation: { no: "Enklere versjon uten tekst følger med.", en: "A simpler wordless version is included." },
      montessoriArea: { area: { no: "Naturfag / kosmisk utdanning", en: "Science / cosmic education" }, presentation: {}, prerequisites: {}, directPurpose: {}, indirectPurpose: {}, controlOfError: {}, extension: {} },
      license: "gratis",
      priceType: "gratis",
      price: { no: "Gratis", en: "Free" },
      memberPrice: {},
      buyUrl: "",
      bundle: false,
      bundleItems: [],
      related: [],
      bookly: { type: "workbook", category: "science", topic: "høsten: blader, dyr og enkle tellemønstre", age: "3-6", plan: "lme36", fag: "botanikk", alder: "3-6" },
      featured: true,
      stats: { views: 0, downloads: 0, favorites: 0 },
      updated: now,
    },
    {
      slug: "eksempel-trepartskort-dyr",
      published: true,
      example: true,
      title: { no: "EKSEMPEL: Trepartskort — dyreverdenen", en: "EXAMPLE: Three-part cards — the animal kingdom" },
      subtitle: { no: "Montessori 6–9 år, zoologi", en: "Montessori ages 6-9, zoology" },
      description: {
        no: "Klassiske Montessori-trepartskort med bilde, bilde+ord og ordkort for virveldyrgruppene. Vist her som eksempel.",
        en: "Classic Montessori three-part cards with picture, picture+word and word cards for the vertebrate groups. Shown here as an example.",
      },
      cover: "",
      gallery: [],
      audience: ["montessoripedagog", "hjemme"],
      ageBands: ["m6-9"],
      direction: "montessori",
      subjects: ["zoologi"],
      resourceType: ["trepartskort"],
      competencyGoals: [],
      contains: [{ no: "18 trepartskort", en: "18 three-part cards" }, { no: "Kontrollkort", en: "Control cards" }],
      pageCount: 9,
      language: ["nb"],
      fileFormat: ["pdf"],
      editable: false,
      usageTips: { no: "Presenter tre og tre kort om gangen etter en tredelt leksjon.", en: "Present three cards at a time following a three-period lesson." },
      prep: { no: "Skriv ut på kartong og laminer for holdbarhet.", en: "Print on cardstock and laminate for durability." },
      differentiation: {},
      montessoriArea: {
        area: { no: "Kultur: zoologi", en: "Culture: zoology" },
        presentation: { no: "Tredelt leksjon med kort og kontrollkort.", en: "Three-period lesson with cards and control cards." },
        prerequisites: { no: "Kjennskap til sansemateriell og klassifisering.", en: "Familiarity with sensorial materials and classification." },
        directPurpose: { no: "Lære navn på virveldyrgrupper.", en: "Learn the names of vertebrate groups." },
        indirectPurpose: { no: "Forberede vitenskapelig klassifisering.", en: "Prepare for scientific classification." },
        controlOfError: { no: "Kontrollkortet med ord.", en: "The control card with words." },
        extension: { no: "Sortere egne bilder av dyr i grupper.", en: "Sort own animal pictures into groups." },
      },
      license: "privat",
      priceType: "betalt",
      price: { no: "149 kr", en: "$15" },
      memberPrice: { no: "99 kr", en: "$10" },
      buyUrl: "",
      licenseOptions: [
        { license: "pedagog", price: { no: "249 kr", en: "$25" }, buyUrl: "" },
        { license: "barnehage", price: { no: "449 kr", en: "$45" }, buyUrl: "" },
      ],
      bundle: false,
      bundleItems: [],
      related: [],
      bookly: { type: "flashcards", category: "", topic: "", age: "m6-9", plan: "montessori", fag: "biologi", alder: "6-9" },
      featured: false,
      stats: { views: 0, downloads: 0, favorites: 0 },
      updated: now,
    },
    {
      slug: "eksempel-matematikk-samlepakke",
      published: true,
      example: true,
      title: { no: "EKSEMPEL: Matematikk-samlepakke 1.–4. trinn", en: "EXAMPLE: Mathematics bundle, Grades 1-4" },
      subtitle: { no: "Offentlig læreplan, tall og de fire regneartene", en: "Public curriculum, numbers and the four operations" },
      description: {
        no: "En samlepakke med arbeidsark, spill og plakater om tall og regning, koblet til kompetansemål i LK20. Vist her som eksempel på en samlepakke.",
        en: "A bundle of worksheets, games and posters on numbers and arithmetic, linked to LK20 competence aims. Shown here as an example of a bundle.",
      },
      cover: "",
      gallery: [],
      audience: ["pedagog", "spesialpedagog"],
      ageBands: ["1-2trinn", "3-4trinn"],
      direction: "offentlig",
      subjects: ["matematikk"],
      resourceType: ["temapakke", "samlepakke"],
      competencyGoals: [{ no: "Utforske tall, mengder og telling.", en: "Explore numbers, quantities and counting." }],
      contains: [{ no: "20 arbeidsark", en: "20 worksheets" }, { no: "3 spill", en: "3 games" }, { no: "4 plakater", en: "4 posters" }],
      pageCount: 30,
      language: ["nb", "nn"],
      fileFormat: ["pdf"],
      editable: true,
      usageTips: {},
      prep: {},
      differentiation: { no: "Tre vanskelighetsnivåer inkludert.", en: "Three difficulty levels included." },
      montessoriArea: { area: {}, presentation: {}, prerequisites: {}, directPurpose: {}, indirectPurpose: {}, controlOfError: {}, extension: {} },
      license: "skole",
      priceType: "betalt",
      price: { no: "349 kr", en: "$35" },
      memberPrice: { no: "249 kr", en: "$25" },
      buyUrl: "",
      bundle: true,
      bundleItems: [],
      related: [],
      bookly: { type: "workbook", category: "mathematics", topic: "tall, de fire regneartene og problemløsing for småtrinnet", age: "6-9", plan: "lk20", fag: "matematikk", alder: "6-9" },
      featured: true,
      stats: { views: 0, downloads: 0, favorites: 0 },
      updated: now,
    },
  ];
}

export async function onRequestGet(context) {
  const { request, env } = context;
  if (!env.BUILDER_KV) {
    const slugParam0 = new URL(request.url).searchParams.get("slug");
    if (slugParam0) {
      const ex = exampleResources().find((r) => r.slug === slugParam0);
      return json({ resource: ex || null }, 200);
    }
    return json({ resources: exampleResources() }, 200);
  }

  const slugParam = new URL(request.url).searchParams.get("slug");
  if (slugParam) {
    const slug = cleanSlug(slugParam);
    if (!slug) return json({ error: "bad_slug", resource: null }, 400);
    try {
      const raw = await env.BUILDER_KV.get(KEY_PREFIX + slug);
      if (raw) return json({ resource: JSON.parse(raw) }, 200);
      const ex = exampleResources().find((r) => r.slug === slug);
      return json({ resource: ex || null }, 200);
    } catch (e) {
      return json({ error: "read_failed", resource: null }, 200);
    }
  }

  const index = await fullIndex(env);
  if (!index.length) return json({ resources: exampleResources() }, 200);
  return json({ resources: index }, 200);
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

  if (body.action === "track") {
    const slug = cleanSlug(body.slug);
    const kind = body.kind;
    if (!slug || !["view", "download", "favorite", "unfavorite"].includes(kind)) {
      return json({ error: "bad_request" }, 400);
    }
    try {
      const raw = await env.BUILDER_KV.get(KEY_PREFIX + slug);
      if (!raw) return json({ ok: true }, 200); // eksempelressurser telles ikke
      const r = JSON.parse(raw);
      r.stats = r.stats || { views: 0, downloads: 0, favorites: 0 };
      if (kind === "view") r.stats.views = (r.stats.views || 0) + 1;
      if (kind === "download") r.stats.downloads = (r.stats.downloads || 0) + 1;
      if (kind === "favorite") r.stats.favorites = (r.stats.favorites || 0) + 1;
      if (kind === "unfavorite") r.stats.favorites = Math.max(0, (r.stats.favorites || 0) - 1);
      await env.BUILDER_KV.put(KEY_PREFIX + slug, JSON.stringify(r));
      const index = await readIndex(env);
      const idx = index.findIndex((e) => e && e.slug === slug);
      if (idx !== -1) { index[idx].stats = r.stats; await writeIndex(env, index); }
      return json({ ok: true }, 200);
    } catch (e) {
      return json({ ok: true }, 200);
    }
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
      const index = (await readIndex(env)).filter((r) => r && r.slug !== slug);
      await writeIndex(env, index);
      return json({ ok: true }, 200);
    } catch (e) {
      return json({ error: "delete_failed" }, 200);
    }
  }

  const resource = sanitizeResource(body.resource);
  if (!resource) return json({ error: "bad_resource" }, 400);
  const payload = JSON.stringify(resource);
  if (payload.length > MAX_SIZE) return json({ error: "too_large" }, 413);
  try {
    await env.BUILDER_KV.put(KEY_PREFIX + resource.slug, payload);
    const index = (await readIndex(env)).filter((r) => r && r.slug !== resource.slug);
    index.push(indexEntry(resource));
    await writeIndex(env, index);
    return json({ ok: true, slug: resource.slug }, 200);
  } catch (e) {
    return json({ error: "write_failed" }, 200);
  }
}
