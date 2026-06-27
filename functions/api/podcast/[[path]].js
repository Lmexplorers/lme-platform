/**
 * LME Podkast, en helautomatisk podkast-serie som lager seg selv og
 * publiserer en ny episode hver dag. Innholdet handler om hele LME-systemet:
 * Montessori og pedagogikk, det forberedte miljøet, observasjon,
 * aldersgruppene (3-6, 6-9, 9-12), LME-bøkene, LME-appene (Mia og Teo m.fl.),
 * Inner Circle, akademiet og verktøyene.
 *
 * Slik henger det sammen (dette er hele "publiser på alle plattformer"-magien):
 * Apple Podcasts, Spotify, Amazon Music, YouTube Music, Pocket Casts osv. henter
 * ALLE episodene fra EN RSS-feed. Du melder feed-en inn EN gang per plattform
 * (se workers/lme-podcast/PODCAST-SETUP.md). Etter det dukker hver nye daglige
 * episode opp automatisk overalt, uten at noen må løfte en finger.
 *
 * Ruter (Pages [[path]]-fanger på /api/podcast/*):
 *   GET  /api/podcast/feed.xml            -> RSS 2.0 + iTunes-namespace (norsk)
 *   GET  /api/podcast/feed-en.xml         -> RSS 2.0 (engelsk)
 *   GET  /api/podcast/episodes            -> { episodes:[...], config:{...} }
 *   GET  /api/podcast/episode?id=<id>     -> { episode:{full...} | null }
 *   GET  /api/podcast/audio/<id>.mp3      -> lydfila (støtter Range)
 *   GET  /api/podcast/status              -> { count, lastDate, hasTts, nextTopic }
 *   POST /api/podcast/generate            { password, force?, date? } -> { ok, episode }
 *
 * Lagring i KV (BUILDER_KV):
 *   lme-podcast:index            -> JSON [ {meta...} ]  (nyeste først)
 *   lme-podcast:ep:<id>          -> JSON { full episode }
 *   lme-podcast:audio:<id>       -> raw MP3 (ArrayBuffer)
 *   lme-podcast:state            -> JSON { lastNum, lastDate, topicCursor }
 *
 * Ingen manuell liste: cron-workeren (eller knappen på /podkast) kaller
 * generate en gang om dagen, og serien skriver og stemmelegger seg selv.
 */

const DEFAULT_PASSWORD = "LilleOppdager2026";
const IDX = "lme-podcast:index";
const EP = "lme-podcast:ep:";
const AUDIO = "lme-podcast:audio:";
const STATE = "lme-podcast:state";

// Hvor mange lydfiler vi beholder i KV. Eldre episoder beholder tekst/visning,
// men lydblobben ryddes vekk for å spare plass. Feed-en viser de nyeste.
const MAX_AUDIO = 90;
const FEED_LIMIT = 200;

// Podkast-metadata. Endres her om Renate vil justere tittel/forfatter/bilde.
const SHOW = {
  site: "https://lmexplorers.com",
  titleNo: "Daglig Montessori med Little Montessori Explorers",
  titleEn: "Daily Montessori with Little Montessori Explorers",
  author: "Renate Dahl",
  ownerName: "Renate Dahl",
  ownerEmail: "hei@lmexplorers.com",
  descNo: "En liten daglig dose Montessori og pedagogikk fra Little Montessori Explorers. Korte, varme episoder om det forberedte miljøet, observasjon, aldersgruppene, LME-bøkene og appene, Inner Circle og hele LME-systemet. Ny episode hver dag, helautomatisk.",
  descEn: "A small daily dose of Montessori and pedagogy from Little Montessori Explorers. Short, warm episodes about the prepared environment, observation, the age groups, the LME books and apps, Inner Circle and the whole LME system. A new episode every day, fully automated.",
  image: "https://lmexplorers.com/images/podkast-cover.png",
  language: "no",
  category: "Kids & Family",
  subCategory: "Parenting",
  copyright: "Little Montessori Explorers",
};

const CLAUDE_MODEL = "claude-sonnet-4-6";

/* ---- Tema-bank: serien "lager seg selv" ved å rotere gjennom disse ---- */
/* Hver runde plukkes neste tema (topicCursor), og Claude skriver en hel
   tospråklig episode rundt vinkelen. Dekker hele LME-systemet. */
const TOPICS = [
  { cat: "Montessori-prinsipper", no: "Følg barnet", en: "Follow the child", angle: "hva 'følg barnet' egentlig betyr i hverdagen, med et konkret eksempel" },
  { cat: "Praktisk liv", no: "Helle vann og dekke bord", en: "Pouring water and setting the table", angle: "hvorfor praktiske hverdagsoppgaver bygger konsentrasjon og selvstendighet" },
  { cat: "Forberedt miljø", no: "Mindre er mer", en: "Less is more", angle: "hvordan et rolig, ryddig miljø hjelper barnet å velge og fokusere" },
  { cat: "Observasjon", no: "Å se uten å gripe inn", en: "Watching without stepping in", angle: "kunsten å observere, og hvorfor det er pedagogens viktigste verktøy" },
  { cat: "Aldersgruppen 3-6", no: "De sensitive periodene", en: "The sensitive periods", angle: "hva som skjer i barnet fra 3 til 6 år, og hvordan vi møter det" },
  { cat: "Aldersgruppen 6-9", no: "Den store fortellingen", en: "The great lessons", angle: "hvordan fantasi og store fortellinger åpner verden for 6-9-åringen" },
  { cat: "Aldersgruppen 9-12", no: "Going out", en: "Going out", angle: "hvordan barnet fra 9 til 12 trenger å knytte læring til den virkelige verden" },
  { cat: "LME-bøkene", no: "Mia og Teo", en: "Mia and Teo", angle: "hvordan LME-bøkene om Mia og Teo brukes til samtale og høytlesning" },
  { cat: "LME-appene", no: "Læring gjennom lek i appen", en: "Learning through play in the app", angle: "hvordan LME-appene støtter Montessori-prinsipper hjemme på en skjermvennlig måte" },
  { cat: "Inner Circle", no: "Et fellesskap av voksne", en: "A community of grown-ups", angle: "hva Inner Circle er, og hvorfor voksne trenger et fellesskap rundt oppdragelsen" },
  { cat: "Pedagogikk", no: "Frihet innenfor rammer", en: "Freedom within limits", angle: "balansen mellom frihet og tydelige rammer, og hvorfor begge trengs" },
  { cat: "Foreldretips", no: "Den vanskelige morgenen", en: "The difficult morning", angle: "et konkret Montessori-grep for stressfrie morgener med små barn" },
  { cat: "Forberedt miljø", no: "Barnets høyde", en: "The child's height", angle: "hvorfor alt bør være tilgjengelig i barnets høyde, og enkle grep hjemme" },
  { cat: "Praktisk liv", no: "Å vente på tur", en: "Waiting for your turn", angle: "hvordan ekte oppgaver lærer tålmodighet bedre enn formaninger" },
  { cat: "Montessori-prinsipper", no: "Den absorberende hjernen", en: "The absorbent mind", angle: "hvordan små barn suger til seg omgivelsene, og hva det betyr for oss" },
  { cat: "Observasjon", no: "Konsentrasjonens øyeblikk", en: "The moment of concentration", angle: "hvordan vi kjenner igjen dyp konsentrasjon og verner om den" },
  { cat: "LME-systemet", no: "Akademiet og verktøyene", en: "The academy and the tools", angle: "hvordan LME-akademiet og verktøyene henger sammen til en helhet" },
  { cat: "Foreldretips", no: "Når barnet sier nei", en: "When the child says no", angle: "et rolig, respektfullt svar på trass, forklart med Montessori-blikk" },
];

/* ---------------------------- små hjelpere ---------------------------- */
function json(data, status) {
  return new Response(JSON.stringify(data), {
    status: status || 200,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

function xmlEsc(s) {
  return (s == null ? "" : String(s))
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}

function cleanId(id) {
  if (typeof id !== "string") return null;
  const c = id.trim().toLowerCase();
  return /^[a-z0-9\-]{1,60}$/.test(c) ? c : null;
}

function s(v, max) { return (typeof v === "string" ? v : "").slice(0, max); }

function pad(n) { return n < 10 ? "0" + n : "" + n; }

function isoDate(d) {
  // d: "YYYY-MM-DD" -> RFC822-ish dato for RSS (publisering kl 06:00 UTC)
  const parts = (d || "").split("-");
  const dt = new Date(Date.UTC(+parts[0], (+parts[1] || 1) - 1, +parts[2] || 1, 6, 0, 0));
  return dt.toUTCString();
}

function estDuration(text) {
  // Norsk høytlesning ~140 ord/min. Gir hh:mm:ss for itunes:duration.
  const words = (text || "").trim().split(/\s+/).filter(Boolean).length;
  const secs = Math.max(60, Math.round((words / 140) * 60));
  const h = Math.floor(secs / 3600), m = Math.floor((secs % 3600) / 60), sec = secs % 60;
  return (h ? h + ":" + pad(m) : m) + ":" + pad(sec);
}

async function readJson(env, key, fallback) {
  try { const raw = await env.BUILDER_KV.get(key); return raw ? JSON.parse(raw) : fallback; }
  catch (e) { return fallback; }
}

/* ----------------------------- TTS-lag ----------------------------- */
/* Provider-agnostisk: ElevenLabs (best på norsk) hvis satt, ellers OpenAI,
   ellers ingen lyd (episoden lages likevel; /podkast leser den høyt i nettleseren
   via tale-syntese, og feed-en hopper over enclosure for den episoden). */
function ttsProvider(env) {
  if (env.ELEVENLABS_API_KEY && env.ELEVENLABS_VOICE_ID) return "elevenlabs";
  if (env.OPENAI_API_KEY) return "openai";
  return null;
}

async function synthesize(env, text, lang) {
  const provider = ttsProvider(env);
  if (!provider) return null;
  lang = lang === "no" ? "no" : "en";
  // Hold lydlengden i sjakk (TTS-grenser).
  const body = s(text, 4500);
  try {
    if (provider === "elevenlabs") {
      const res = await fetch(
        "https://api.elevenlabs.io/v1/text-to-speech/" + env.ELEVENLABS_VOICE_ID,
        {
          method: "POST",
          headers: {
            "xi-api-key": env.ELEVENLABS_API_KEY,
            "Content-Type": "application/json",
            "Accept": "audio/mpeg",
          },
          body: JSON.stringify({
            text: body,
            model_id: env.ELEVENLABS_MODEL_ID || "eleven_multilingual_v2",
            voice_settings: { stability: 0.5, similarity_boost: 0.75 },
          }),
        }
      );
      if (!res.ok) return null;
      return await res.arrayBuffer();
    }
    if (provider === "openai") {
      const model = env.OPENAI_TTS_MODEL || "gpt-4o-mini-tts";
      const payload = {
        model: model,
        voice: env.OPENAI_TTS_VOICE || "shimmer",
        input: body,
        response_format: "mp3",
      };
      // Nyere modeller (gpt-4o-*) kan styres med en instruksjon. Det løfter
      // den norske uttalen og tonen tydelig.
      if (/gpt-4o/.test(model)) {
        payload.instructions = env.OPENAI_TTS_INSTRUCTIONS || (lang === "no"
          ? "Les teksten rolig, varmt og tydelig på naturlig norsk bokmål, som en vennlig og nær podkast-vert. Bruk naturlig norsk intonasjon, ikke engelsk aksent."
          : "Read the text calmly, warmly and clearly in natural English, like a friendly, close podcast host with a gentle, reassuring tone.");
      }
      const res = await fetch("https://api.openai.com/v1/audio/speech", {
        method: "POST",
        headers: {
          "Authorization": "Bearer " + env.OPENAI_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) return null;
      return await res.arrayBuffer();
    }
  } catch (e) { return null; }
  return null;
}

/* ------------------------- AI-episodegenerator ------------------------- */
function buildPrompt(topic, num) {
  const sys =
    "Du er manusforfatter for podkasten til Little Montessori Explorers (LME), " +
    "eid av Renate Dahl. Verten er en varm, rolig norsk stemme som snakker direkte " +
    "til foreldre og pedagoger. Tonen er nær, klok og oppmuntrende, aldri belærende.\n\n" +
    "SKRIVEREGLER (følg alltid):\n" +
    "- Bruk rette anførselstegn \"slik\" og apostrof ', aldri « ».\n" +
    "- ALDRI lange bindestreker eller tankestreker (— eller –) i teksten. Bruk komma, kolon, punktum eller \"og\".\n" +
    "- Stor forbokstav etter kolon kun når en hel setning følger.\n" +
    "- Følg norske kommaregler.\n" +
    "- Engelsk oversettelse skal være naturlig, ikke ord for ord.\n\n" +
    "Episoden skal være et kort monolog-manus (ca. 550 til 750 ord på norsk) som " +
    "kan leses høyt på 4 til 6 minutter. Bygg den slik: en vennlig velkomst som nevner " +
    "Little Montessori Explorers, så dagens tema med ett konkret hverdagseksempel, " +
    "så én ting lytteren kan prøve i dag, og en kort, varm avrunding som inviterer " +
    "videre inn i LME (akademiet, bøkene, appene eller Inner Circle der det passer). " +
    "Ikke nevn at manuset er skrevet av AI. Ikke bruk scene-anvisninger.\n\n" +
    "Svar KUN med gyldig JSON (ingen kodeblokk), med nøyaktig disse feltene:\n" +
    "{\n" +
    '  "titleNo": "kort, fengende episodetittel på norsk",\n' +
    '  "titleEn": "engelsk episodetittel",\n' +
    '  "teaserNo": "1 til 2 setninger som lokker til lytting (norsk)",\n' +
    '  "teaserEn": "engelsk teaser",\n' +
    '  "scriptNo": "hele manuset på norsk, ren tekst med doble linjeskift mellom avsnitt",\n' +
    '  "scriptEn": "hele manuset på engelsk",\n' +
    '  "showNotesNo": "3 til 5 punkter som ren tekst, ett per linje, norsk",\n' +
    '  "showNotesEn": "engelske punkter",\n' +
    '  "keywords": "5 til 8 komma-separerte nøkkelord på engelsk for plattformene"\n' +
    "}";
  const user =
    "Lag episode nummer " + num + " i serien.\n" +
    "Kategori: " + topic.cat + "\n" +
    "Tema (norsk): " + topic.no + "\n" +
    "Tema (engelsk): " + topic.en + "\n" +
    "Vinkel: " + topic.angle;
  return { sys, user };
}

// Escaper rå kontrolltegn (linjeskift, tab) som ligger INNI JSON-strenger.
// Modeller skriver ofte ekte linjeskift i manus-feltet, og det er ugyldig JSON.
function escapeControlInsideStrings(t) {
  let out = "", inStr = false, prev = "";
  for (let i = 0; i < t.length; i++) {
    const c = t[i];
    if (c === '"' && prev !== "\\") inStr = !inStr;
    if (inStr) {
      if (c === "\n") { out += "\\n"; prev = c; continue; }
      if (c === "\r") { out += "\\r"; prev = c; continue; }
      if (c === "\t") { out += "\\t"; prev = c; continue; }
    }
    out += c; prev = c;
  }
  return out;
}

function parseModelJson(txt) {
  if (!txt) return null;
  let t = txt.trim();
  // Fjern ev. kodeblokk-omslag.
  t = t.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "").trim();
  try { return JSON.parse(t); } catch (e) {}
  // Plukk ut første {...}-blokk.
  const a = t.indexOf("{"), b = t.lastIndexOf("}");
  const cand = (a >= 0 && b > a) ? t.slice(a, b + 1) : t;
  try { return JSON.parse(cand); } catch (e) {}
  // Siste forsøk: reparer rå linjeskift inni strenger.
  try { return JSON.parse(escapeControlInsideStrings(cand)); } catch (e) {}
  return null;
}

async function callClaude(env, topic, num) {
  if (!env.ANTHROPIC_API_KEY) throw new Error("missing_anthropic_key");
  const { sys, user } = buildPrompt(topic, num);
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: CLAUDE_MODEL,
      max_tokens: 8000,
      system: sys,
      messages: [{ role: "user", content: user }],
    }),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok || !data) throw new Error("claude_" + res.status);
  const txt = Array.isArray(data.content) ? data.content.map((c) => c.text || "").join("") : "";
  const parsed = parseModelJson(txt);
  if (!parsed || !parsed.scriptNo) throw new Error("bad_model_output");
  return parsed;
}

/**
 * Lager neste daglige episode. Idempotent per dato med mindre force=true:
 * har vi allerede laget en episode i dag, returnerer vi den i stedet.
 */
async function generateEpisode(env, opts) {
  opts = opts || {};
  if (!env.BUILDER_KV) throw new Error("not_configured");
  const date = (opts.date && /^\d{4}-\d{2}-\d{2}$/.test(opts.date)) ? opts.date : todayUTC();

  const state = (await readJson(env, STATE, null)) || { lastNum: 0, lastDate: "", topicCursor: 0 };
  let index = await readJson(env, IDX, []);
  if (!Array.isArray(index)) index = [];

  if (!opts.force && state.lastDate === date) {
    // Allerede laget i dag: returner den nyeste.
    const existing = index[0] ? await readJson(env, EP + index[0].id, null) : null;
    if (existing) return { episode: existing, reused: true };
  }

  const num = (state.lastNum || 0) + 1;
  const topic = TOPICS[(state.topicCursor || 0) % TOPICS.length];
  const id = "ep-" + pad(num >= 100 ? num : num) + "-" + date;
  const safeId = cleanId(id) || ("ep-" + Date.now());

  const gen = await callClaude(env, topic, num);

  // Syntetisk stemme er AV. Renate leser inn med sin egen stemme (opplasting).
  // Kan slås på igjen med PODCAST_TTS="on" om ønskelig.
  const wantTts = (env.PODCAST_TTS || "off").toLowerCase() === "on";
  const audioLang = (env.PODCAST_AUDIO_LANG || "en").toLowerCase() === "no" ? "no" : "en";
  const scriptForAudio = audioLang === "no" ? gen.scriptNo : (gen.scriptEn || gen.scriptNo);

  let audioBytes = null;
  if (wantTts) {
    try { audioBytes = await synthesize(env, scriptForAudio, audioLang); } catch (e) { audioBytes = null; }
  }
  let audioSize = 0;
  if (audioBytes) {
    audioSize = audioBytes.byteLength;
    await env.BUILDER_KV.put(AUDIO + safeId, audioBytes);
  }

  const episode = {
    id: safeId,
    num: num,
    date: date,
    category: topic.cat,
    titleNo: s(gen.titleNo, 160) || topic.no,
    titleEn: s(gen.titleEn, 160) || topic.en,
    teaserNo: s(gen.teaserNo, 400),
    teaserEn: s(gen.teaserEn, 400),
    scriptNo: s(gen.scriptNo, 12000),
    scriptEn: s(gen.scriptEn, 12000),
    showNotesNo: s(gen.showNotesNo, 1200),
    showNotesEn: s(gen.showNotesEn, 1200),
    keywords: s(gen.keywords, 300),
    hasAudio: !!audioBytes,
    audioLang: audioBytes ? audioLang : null,
    audioSize: audioSize,
    duration: estDuration(scriptForAudio),
    created: new Date().toISOString(),
  };

  await env.BUILDER_KV.put(EP + safeId, JSON.stringify(episode));

  // Index-meta (lett).
  const meta = {
    id: safeId, num: num, date: date, category: topic.cat,
    titleNo: episode.titleNo, titleEn: episode.titleEn,
    teaserNo: episode.teaserNo, teaserEn: episode.teaserEn,
    hasAudio: episode.hasAudio, audioLang: episode.audioLang, duration: episode.duration,
  };
  index.unshift(meta);
  if (index.length > FEED_LIMIT) index = index.slice(0, FEED_LIMIT);
  await env.BUILDER_KV.put(IDX, JSON.stringify(index));

  // Rydd gamle lydblobber utover MAX_AUDIO (behold tekst/visning).
  if (index.length > MAX_AUDIO) {
    for (let i = MAX_AUDIO; i < index.length; i++) {
      if (index[i].hasAudio) {
        try { await env.BUILDER_KV.delete(AUDIO + index[i].id); } catch (e) {}
        index[i].hasAudio = false;
      }
    }
    await env.BUILDER_KV.put(IDX, JSON.stringify(index));
  }

  await env.BUILDER_KV.put(STATE, JSON.stringify({
    lastNum: num, lastDate: date, topicCursor: ((state.topicCursor || 0) + 1) % TOPICS.length,
  }));

  return { episode: episode, reused: false };
}

function todayUTC() {
  const d = new Date();
  return d.getUTCFullYear() + "-" + pad(d.getUTCMonth() + 1) + "-" + pad(d.getUTCDate());
}

/* ------------------------------ RSS-feed ------------------------------ */
function audioUrl(id) { return SHOW.site + "/api/podcast/audio/" + id + ".mp3"; }
function episodeLink(id) { return SHOW.site + "/podkast#" + id; }

function buildFeed(index, lang) {
  const no = lang !== "en";
  const title = no ? SHOW.titleNo : SHOW.titleEn;
  const desc = no ? SHOW.descNo : SHOW.descEn;
  const self = SHOW.site + "/api/podcast/" + (no ? "feed.xml" : "feed-en.xml");
  // Hver feed tar bare med episoder med lyd på sitt eget språk. Foreløpig er
  // lyden engelsk, så den norske feed-en står tom til Renate leser inn norsk.
  const feedLang = no ? "no" : "en";
  const items = index
    .filter((e) => e && e.hasAudio && (e.audioLang || "no") === feedLang)
    .slice(0, FEED_LIMIT).map((e) => {
    const t = no ? (e.titleNo || e.titleEn) : (e.titleEn || e.titleNo);
    const teaser = no ? (e.teaserNo || "") : (e.teaserEn || "");
    return [
      "    <item>",
      "      <title>" + xmlEsc(t) + "</title>",
      "      <link>" + xmlEsc(episodeLink(e.id)) + "</link>",
      "      <guid isPermaLink=\"false\">lme-podcast-" + xmlEsc(e.id) + "</guid>",
      "      <pubDate>" + isoDate(e.date) + "</pubDate>",
      "      <description>" + xmlEsc(teaser) + "</description>",
      "      <itunes:summary>" + xmlEsc(teaser) + "</itunes:summary>",
      "      <itunes:subtitle>" + xmlEsc(e.category || "") + "</itunes:subtitle>",
      "      <itunes:episode>" + (e.num || 0) + "</itunes:episode>",
      "      <itunes:duration>" + xmlEsc(e.duration || "5:00") + "</itunes:duration>",
      "      <itunes:explicit>false</itunes:explicit>",
      "      <itunes:image href=\"" + xmlEsc(SHOW.image) + "\"/>",
      "      <enclosure url=\"" + xmlEsc(audioUrl(e.id)) + "\" length=\"" + (e.audioSize || 0) + "\" type=\"" + xmlEsc(e.audioType || "audio/mpeg") + "\"/>",
      "    </item>",
    ].join("\n");
  }).join("\n");

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:atom="http://www.w3.org/2005/Atom">',
    "  <channel>",
    "    <title>" + xmlEsc(title) + "</title>",
    "    <link>" + SHOW.site + "/podkast</link>",
    '    <atom:link href="' + xmlEsc(self) + '" rel="self" type="application/rss+xml"/>',
    "    <language>" + (no ? "no" : "en") + "</language>",
    "    <copyright>" + xmlEsc(SHOW.copyright) + "</copyright>",
    "    <description>" + xmlEsc(desc) + "</description>",
    "    <itunes:author>" + xmlEsc(SHOW.author) + "</itunes:author>",
    "    <itunes:summary>" + xmlEsc(desc) + "</itunes:summary>",
    "    <itunes:type>episodic</itunes:type>",
    "    <itunes:owner><itunes:name>" + xmlEsc(SHOW.ownerName) + "</itunes:name><itunes:email>" + xmlEsc(SHOW.ownerEmail) + "</itunes:email></itunes:owner>",
    '    <itunes:image href="' + xmlEsc(SHOW.image) + '"/>',
    '    <itunes:category text="' + xmlEsc(SHOW.category) + '"><itunes:category text="' + xmlEsc(SHOW.subCategory) + '"/></itunes:category>',
    "    <itunes:explicit>false</itunes:explicit>",
    "    <image><url>" + xmlEsc(SHOW.image) + "</url><title>" + xmlEsc(title) + "</title><link>" + SHOW.site + "/podkast</link></image>",
    items,
    "  </channel>",
    "</rss>",
  ].join("\n");
  return xml;
}

/* ----------------------------- lyd-serving ----------------------------- */
async function serveAudio(env, id, request) {
  const cid = cleanId(id);
  if (!cid) return new Response("bad id", { status: 400 });
  const buf = await env.BUILDER_KV.get(AUDIO + cid, "arrayBuffer");
  if (!buf) return new Response("not found", { status: 404 });
  const total = buf.byteLength;
  const ep = await readJson(env, EP + cid, null);
  const ctype = (ep && ep.audioType) || "audio/mpeg";
  const range = request.headers.get("Range");
  const baseHeaders = {
    "Content-Type": ctype,
    "Accept-Ranges": "bytes",
    "Cache-Control": "public, max-age=86400",
  };
  if (range) {
    const m = range.match(/bytes=(\d*)-(\d*)/);
    if (m) {
      let start = m[1] ? parseInt(m[1], 10) : 0;
      let end = m[2] ? parseInt(m[2], 10) : total - 1;
      if (isNaN(start)) start = 0;
      if (isNaN(end) || end >= total) end = total - 1;
      if (start > end || start >= total) {
        return new Response(null, { status: 416, headers: { "Content-Range": "bytes */" + total } });
      }
      const slice = buf.slice(start, end + 1);
      return new Response(slice, {
        status: 206,
        headers: Object.assign({}, baseHeaders, {
          "Content-Range": "bytes " + start + "-" + end + "/" + total,
          "Content-Length": "" + (end - start + 1),
        }),
      });
    }
  }
  return new Response(buf, {
    status: 200,
    headers: Object.assign({}, baseHeaders, { "Content-Length": "" + total }),
  });
}

/* ------------------------------- ruting ------------------------------- */
export async function onRequestGet(context) {
  const { request, env, params } = context;
  const parts = [].concat(params.path || []);
  const head = (parts[0] || "").toLowerCase();

  if (!env.BUILDER_KV) {
    if (head === "feed.xml" || head === "feed-en.xml") {
      return new Response(buildFeed([], head === "feed-en.xml" ? "en" : "no"), {
        headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
      });
    }
    return json({ error: "not_configured", episodes: [] }, 200);
  }

  if (head === "feed.xml" || head === "feed-en.xml") {
    const index = await readJson(env, IDX, []);
    const xml = buildFeed(Array.isArray(index) ? index : [], head === "feed-en.xml" ? "en" : "no");
    return new Response(xml, {
      headers: {
        "Content-Type": "application/rss+xml; charset=utf-8",
        "Cache-Control": "public, max-age=900",
      },
    });
  }

  if (head === "audio") {
    const file = parts[1] || "";
    const id = file.replace(/\.mp3$/i, "");
    return serveAudio(env, id, request);
  }

  if (head === "episodes") {
    const index = await readJson(env, IDX, []);
    return json({
      episodes: Array.isArray(index) ? index : [],
      config: { hasTts: !!ttsProvider(env), site: SHOW.site, titleNo: SHOW.titleNo, titleEn: SHOW.titleEn },
    }, 200);
  }

  if (head === "episode") {
    const id = cleanId(new URL(request.url).searchParams.get("id"));
    if (!id) return json({ episode: null }, 400);
    const ep = await readJson(env, EP + id, null);
    return json({ episode: ep }, 200);
  }

  if (head === "status") {
    const index = await readJson(env, IDX, []);
    const state = (await readJson(env, STATE, null)) || { topicCursor: 0, lastDate: "" };
    const next = TOPICS[(state.topicCursor || 0) % TOPICS.length];
    return json({
      count: Array.isArray(index) ? index.length : 0,
      lastDate: state.lastDate || "",
      hasTts: !!ttsProvider(env),
      ttsProvider: ttsProvider(env) || "none",
      feed: SHOW.site + "/api/podcast/feed.xml",
      feedEn: SHOW.site + "/api/podcast/feed-en.xml",
      nextTopic: next ? { cat: next.cat, no: next.no, en: next.en } : null,
    }, 200);
  }

  return json({ error: "not_found" }, 404);
}

function pwOk(env, given) {
  const expected = (env.PODCAST_PASSWORD || env.COURSE_EDIT_PASSWORD || DEFAULT_PASSWORD) + "";
  return (((given) || "") + "") === expected;
}

// Last opp Renates egen innleste lyd til en episode (multipart/form-data).
async function handleUpload(request, env) {
  if (!env.BUILDER_KV) return json({ error: "not_configured" }, 500);
  let form;
  try { form = await request.formData(); } catch (e) { return json({ error: "bad_form" }, 400); }
  if (!pwOk(env, form.get("password"))) return json({ error: "bad_password" }, 401);
  const id = cleanId(form.get("id"));
  if (!id) return json({ error: "bad_id" }, 400);
  const lang = (form.get("lang") + "").toLowerCase() === "en" ? "en" : "no";
  const file = form.get("audio");
  if (!file || typeof file.arrayBuffer !== "function") return json({ error: "no_file" }, 400);
  const buf = await file.arrayBuffer();
  if (!buf || buf.byteLength < 200) return json({ error: "empty_file" }, 400);
  if (buf.byteLength > 24 * 1024 * 1024) return json({ error: "too_big" }, 413);

  const ep = await readJson(env, EP + id, null);
  if (!ep) return json({ error: "no_episode" }, 404);
  const type = (file.type && /^audio\//.test(file.type)) ? file.type : "audio/mpeg";

  await env.BUILDER_KV.put(AUDIO + id, buf);
  ep.hasAudio = true; ep.audioLang = lang; ep.audioSize = buf.byteLength; ep.audioType = type;
  await env.BUILDER_KV.put(EP + id, JSON.stringify(ep));

  let index = await readJson(env, IDX, []);
  if (Array.isArray(index)) {
    for (let i = 0; i < index.length; i++) {
      if (index[i].id === id) { index[i].hasAudio = true; index[i].audioLang = lang; }
    }
    await env.BUILDER_KV.put(IDX, JSON.stringify(index));
  }
  return json({ ok: true, id: id, audioLang: lang }, 200);
}

// Slett en episode (tekst + lyd + indeks).
async function handleDelete(env, body) {
  if (!env.BUILDER_KV) return json({ error: "not_configured" }, 500);
  if (!pwOk(env, body && body.password)) return json({ error: "bad_password" }, 401);
  const id = cleanId(body && body.id);
  if (!id) return json({ error: "bad_id" }, 400);
  try { await env.BUILDER_KV.delete(AUDIO + id); } catch (e) {}
  try { await env.BUILDER_KV.delete(EP + id); } catch (e) {}
  let index = await readJson(env, IDX, []);
  if (Array.isArray(index)) {
    index = index.filter(function (m) { return m.id !== id; });
    await env.BUILDER_KV.put(IDX, JSON.stringify(index));
  }
  return json({ ok: true, id: id }, 200);
}

export async function onRequestPost(context) {
  const { request, env, params } = context;
  const parts = [].concat(params.path || []);
  const head = (parts[0] || "").toLowerCase();

  if (head === "upload") return handleUpload(request, env);

  let body = {};
  try { body = await request.json(); } catch (e) { return json({ error: "bad_json" }, 400); }

  if (head === "delete") return handleDelete(env, body);
  if (head !== "generate") return json({ error: "not_found" }, 404);

  if (!pwOk(env, body && body.password)) {
    return json({ error: "bad_password" }, 401);
  }
  if (!env.BUILDER_KV) return json({ error: "not_configured" }, 500);
  if (!env.ANTHROPIC_API_KEY) return json({ error: "missing_anthropic_key" }, 500);

  try {
    const out = await generateEpisode(env, { force: !!body.force, date: body.date });
    return json({ ok: true, reused: !!out.reused, episode: out.episode }, 200);
  } catch (e) {
    return json({ error: "generate_failed", detail: (e && e.message) || "?" }, 500);
  }
}
