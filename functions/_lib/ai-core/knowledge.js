/**
 * LME AI Core, kunnskap om Renates eget materiale.
 *
 * ==========================================================================
 * HVA DENNE LØSER
 * ==========================================================================
 * Nathalie AI har visst mye OM LME, men ingenting FRA kursene. Hun kunne
 * fortelle at "Voks på YouTube med AI" finnes, men ikke hva som faktisk
 * står i det. Det er forskjellen på en assistent som kan brosjyren og en
 * som kan produktet, og det er hele grunnen til at en kurs-AI føles god.
 *
 * Her bygges en søkbar indeks over Renates eget innhold: kursene fra
 * Kursbygger (JSON i KV) og kurssidene i akademiet (hentet som HTML og
 * strippet til tekst). Ved hvert spørsmål plukkes de få avsnittene som
 * ligner mest på spørsmålet, og de legges inn i systemprompten.
 *
 * ==========================================================================
 * HVORFOR IKKE VEKTORSØK
 * ==========================================================================
 * Innholdet er lite (noen hundre avsnitt), og et ordbasert søk med BM25-
 * lignende vekting er både godt nok og gratis. Vektorsøk ville krevd en ny
 * Cloudflare-binding, en innbyggingsmodell og en kostnad per spørsmål, for
 * en gevinst som ikke merkes på denne størrelsen. Skal det byttes senere,
 * er det bare `search()` som må skiftes ut.
 *
 * KV-nøkler:
 *   ai:kb:index  -> { builtAt, sources, chunks: [ {t,h,u,x} ] }
 *
 * Feltnavnene er korte med vilje: indeksen leses ved hvert spørsmål, og
 * hvert tegn er båndbredde.
 *   t = tittel (kurset)   h = overskrift (avsnittet)
 *   u = url                x = selve teksten
 */

export const INDEX_KEY = "ai:kb:index";

/** Så mange avsnitt indeksen kan inneholde. Nok til alt Renate har i dag. */
export const MAX_CHUNKS = 600;

/** Så langt hvert avsnitt får være. Lengre avsnitt deles. */
export const CHUNK_CHARS = 700;

/** Så mange avsnitt som legges i prompten per spørsmål. */
export const TOP_K = 4;

/**
 * Kurssidene i akademiet som hentes som HTML. Kursbygger-kursene finnes
 * allerede som JSON i KV og trenger ikke stå her.
 */
export const ACADEMY_PAGES = [
  { url: "/academy/claude", title: "Kom i gang med Claude" },
  { url: "/academy/claude-videre", title: "Videre med Claude" },
  { url: "/academy/youtube", title: "Voks på YouTube med AI" },
  { url: "/academy/youtube-videre", title: "Videre med YouTube" },
  { url: "/academy/ki-for-pedagoger", title: "KI for pedagoger" },
  { url: "/academy/epostliste", title: "Voks e-postlisten din" },
  { url: "/academy/3-6", title: "Montessori 3 til 6 år" },
  { url: "/academy/6-9", title: "Montessori 6 til 9 år" },
  { url: "/academy/9-12", title: "Montessori 9 til 12 år" },
  { url: "/academy/forberedt-miljo", title: "Det forberedte miljøet" },
  { url: "/academy/observasjon", title: "Observasjonskunsten" },
  { url: "/academy/intro", title: "Velkommen til LME" },
];

// ===========================================================================
// TEKSTBEHANDLING
// ===========================================================================

/**
 * Ord som er for vanlige til å si noe om hva et avsnitt handler om.
 * Norsk og engelsk i samme liste, siden kursene finnes på begge språk.
 */
const STOPWORDS = new Set((
  "og i jeg det at en et den til er som på de med han av ikke der så var meg " +
  "seg men ett har om vi min mitt ha hun nå over da ved fra du ut sin dem oss " +
  "opp man kan hans hvor eller hva skal selv sjøl her alle vil bli ble blitt " +
  "kunne inn når være kom noen noe ville dere som deres kun ja etter ned skulle " +
  "denne for deg si sine sitt mot å meget hvorfor dette disse uten hvordan " +
  "ingen din ditt blir samme hvilken hvilke sånn inni mellom vår hver hvem " +
  "the a an and or but of to in on for with is are was were be been being " +
  "this that these those it its as at by from you your we our they them he she " +
  "have has had do does did not can could will would should may might " +
  "if then than so such about into out up down more most some any all"
).split(/\s+/));

/** Deler tekst i ord vi kan søke på. Tåler æ, ø og å. */
export function tokenize(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .split(" ")
    .filter((w) => w.length > 2 && !STOPWORDS.has(w));
}

/** HTML til lesbar tekst. Fjerner skript, stiler og markup. */
export function htmlToText(html) {
  return String(html || "")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<(br|\/p|\/div|\/li|\/h[1-6])>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/** Deler lang tekst i biter på setningsgrenser, ikke midt i et ord. */
export function splitChunks(text, maxChars) {
  const lim = maxChars || CHUNK_CHARS;
  const clean = String(text || "").trim();
  if (!clean) return [];
  if (clean.length <= lim) return [clean];

  const out = [];
  const setninger = clean.split(/(?<=[.!?])\s+|\n{2,}/);
  let buffer = "";
  for (const s of setninger) {
    const bit = s.trim();
    if (!bit) continue;
    if (bit.length > lim) {
      // Én setning som er lengre enn grensen: del den hardt.
      if (buffer) { out.push(buffer); buffer = ""; }
      for (let i = 0; i < bit.length; i += lim) out.push(bit.slice(i, i + lim));
      continue;
    }
    if ((buffer + " " + bit).trim().length > lim) {
      out.push(buffer.trim());
      buffer = bit;
    } else {
      buffer = (buffer + " " + bit).trim();
    }
  }
  if (buffer.trim()) out.push(buffer.trim());
  return out.filter(Boolean);
}

// ===========================================================================
// BYGGE INDEKSEN
// ===========================================================================

function pushChunks(list, { title, heading, url, text }) {
  for (const bit of splitChunks(text)) {
    if (list.length >= MAX_CHUNKS) return;
    list.push({ t: title, h: heading || "", u: url || "", x: bit });
  }
}

/** Henter et tekstfelt { no, en } og setter sammen begge språk. */
function bothLangs(field) {
  if (!field) return "";
  if (typeof field === "string") return field;
  const no = String(field.no || "").trim();
  const en = String(field.en || "").trim();
  if (no && en && no !== en) return no + "\n" + en;
  return no || en;
}

/** Alle Kursbygger-kurs i KV, som avsnitt. */
export async function chunksFromKursbygger(env) {
  const out = [];
  if (!env || !env.BUILDER_KV) return out;
  let listing;
  try {
    listing = await env.BUILDER_KV.list({ prefix: "lme-builder:kurs:", limit: 1000 });
  } catch (e) {
    return out;
  }
  for (const key of (listing && listing.keys) || []) {
    let kurs;
    try {
      const raw = await env.BUILDER_KV.get(key.name);
      kurs = raw ? JSON.parse(raw) : null;
    } catch (e) { continue; }
    if (!kurs || kurs.published === false) continue;

    const tittel = bothLangs(kurs.title) || key.name;
    const url = "/kurs/" + (kurs.slug || "");

    pushChunks(out, { title: tittel, heading: "Om kurset", url, text: bothLangs(kurs.lede) });
    if (Array.isArray(kurs.learn) && kurs.learn.length) {
      pushChunks(out, {
        title: tittel, heading: "Dette lærer du", url,
        text: kurs.learn.map(bothLangs).filter(Boolean).join(". "),
      });
    }
    for (const leksjon of Array.isArray(kurs.lessons) ? kurs.lessons : []) {
      const overskrift = bothLangs(leksjon && leksjon.title);
      const brodtekst = Array.isArray(leksjon && leksjon.body)
        ? leksjon.body.map(bothLangs).filter(Boolean).join("\n")
        : "";
      const tips = bothLangs(leksjon && leksjon.tip);
      const tekst = [brodtekst, tips].filter(Boolean).join("\n");
      if (tekst) pushChunks(out, { title: tittel, heading: overskrift, url, text: tekst });
    }
  }
  return out;
}

/** Kurssidene i akademiet, hentet som HTML fra samme domene. */
export async function chunksFromAcademy(origin, pages) {
  const out = [];
  if (!origin) return out;
  for (const side of pages || ACADEMY_PAGES) {
    let html;
    try {
      const res = await fetch(origin + side.url, { headers: { "User-Agent": "LME-AI-Core" } });
      if (!res.ok) continue;
      html = await res.text();
    } catch (e) { continue; }
    const tekst = htmlToText(html);
    if (tekst.length < 200) continue;
    pushChunks(out, { title: side.title, heading: "", url: side.url, text: tekst });
  }
  return out;
}

/**
 * Bygger hele indeksen og lagrer den.
 * Returnerer { ok, chunks, sources, builtAt } eller { ok:false, error }.
 */
export async function buildIndex(env, origin) {
  if (!env || !env.BUILDER_KV) return { ok: false, error: "no_kv" };

  const fraKurs = await chunksFromKursbygger(env);
  const fraAkademi = await chunksFromAcademy(origin);
  const chunks = fraKurs.concat(fraAkademi).slice(0, MAX_CHUNKS);

  const index = {
    builtAt: Date.now(),
    sources: { kursbygger: fraKurs.length, akademi: fraAkademi.length },
    chunks: chunks,
  };
  try {
    await env.BUILDER_KV.put(INDEX_KEY, JSON.stringify(index));
  } catch (e) {
    return { ok: false, error: String((e && e.message) || e).slice(0, 200) };
  }
  return { ok: true, chunks: chunks.length, sources: index.sources, builtAt: index.builtAt };
}

export async function readIndex(env) {
  if (!env || !env.BUILDER_KV) return null;
  try {
    const raw = await env.BUILDER_KV.get(INDEX_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

// ===========================================================================
// SØK
// ===========================================================================

/**
 * Finner de avsnittene som ligner mest på spørsmålet.
 *
 * Vekting: hvor ofte ordet står i avsnittet, dempet med kvadratrot så et
 * langt avsnitt ikke vinner bare på lengde, ganget med hvor sjeldent ordet
 * er i hele samlingen. Treff i tittel eller overskrift teller ekstra, fordi
 * "hva handler kurset om YouTube om" skal finne YouTube-kurset.
 *
 * Returnerer [] når ingenting er relevant nok. Det er et poeng: da legges
 * ingenting inn i prompten, og Nathalie svarer som før i stedet for å bli
 * dyttet mot et tilfeldig kursavsnitt.
 */
export function searchIndex(index, query, opts) {
  const o = opts || {};
  const topK = o.topK || TOP_K;
  const chunks = (index && index.chunks) || [];
  if (!chunks.length) return [];

  const ord = tokenize(query);
  if (!ord.length) return [];

  // Hvor mange avsnitt hvert ord finnes i.
  const docCount = {};
  const tokenCache = chunks.map((c) => {
    const set = new Set(tokenize(c.x + " " + c.h + " " + c.t));
    for (const w of set) docCount[w] = (docCount[w] || 0) + 1;
    return set;
  });

  const N = chunks.length;
  const scored = chunks.map((c, i) => {
    const tekstOrd = tokenize(c.x);
    const tittelOrd = new Set(tokenize(c.t + " " + c.h));
    let score = 0;
    for (const w of ord) {
      const df = docCount[w] || 0;
      if (!df) continue;
      const idf = Math.log(1 + N / df);
      const tf = tekstOrd.filter((t) => t === w).length;
      if (tf) score += Math.sqrt(tf) * idf;
      if (tittelOrd.has(w)) score += 2 * idf;
    }
    return { i: i, score: score, chunk: c, treff: tokenCache[i] };
  });

  const beste = scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);

  // Krev at det beste treffet er tydelig, ikke bare det minst dårlige.
  const terskel = o.minScore == null ? 1.5 : o.minScore;
  if (!beste.length || beste[0].score < terskel) return [];

  return beste.map((s) => ({
    title: s.chunk.t, heading: s.chunk.h, url: s.chunk.u,
    text: s.chunk.x, score: Math.round(s.score * 100) / 100,
  }));
}

/** Henter indeksen og søker i ett kall. */
export async function search(env, query, opts) {
  const index = await readIndex(env);
  if (!index) return [];
  return searchIndex(index, query, opts);
}

/**
 * Formaterer treffene til systemprompten.
 * Tom streng når det ikke er noe å legge til, slik at kalleren kan la være
 * å røre prompten i det hele tatt.
 */
export function knowledgeBlock(hits, lang) {
  if (!hits || !hits.length) return "";
  const en = lang === "en";
  const linjer = [
    en
      ? "FROM RENATE'S OWN COURSES (use this when it answers the question, and say which course it comes from):"
      : "FRA RENATES EGNE KURS (bruk dette når det svarer på spørsmålet, og si hvilket kurs det kommer fra):",
  ];
  for (const h of hits) {
    const hvor = h.heading ? h.title + ", " + h.heading : h.title;
    linjer.push("");
    linjer.push("[" + hvor + (h.url ? " · " + h.url : "") + "]");
    linjer.push(h.text);
  }
  linjer.push("");
  linjer.push(en
    ? "Only use the excerpts above if they actually answer the question. If they do not, answer from your general knowledge instead and do not pretend they were relevant."
    : "Bruk utdragene over bare hvis de faktisk svarer på spørsmålet. Gjør de ikke det, svar ut fra det du ellers vet, og lat som ingenting om dem.");
  return linjer.join("\n");
}
