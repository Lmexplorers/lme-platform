/**
 * LME FAQ Generator — Cloudflare Pages Function
 *
 * Generates FAQ content based on a topic, with correct platform positioning.
 *
 *   POST /api/ai/faq   { topic, lang }
 *        -> { faq: [ { q: "...", a: "..." }, ... ] }
 */

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Max-Age": "86400",
};

function json(data, status) {
  return new Response(JSON.stringify(data), {
    status: status || 200,
    headers: { "Content-Type": "application/json", ...CORS, "Cache-Control": "no-store" },
  });
}

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS });
}

const BRAND_CONTEXT = `Du jobber for Little Montessori Explorers (LME), en tospråklig (norsk/engelsk),
AI-drevet plattform grunnlagt av Renate Dahl. LME er ett samlet økosystem for kreativitet, læring, synlighet og vekst.

LME er laget for deg som ønsker å lære, skape og utvikle deg:
🌱 For foreldre som ønsker inspirerende, lekne og lærerike aktiviteter for barn i alderen 0-16 år – med fokus på nysgjerrighet, mestring og Montessori-inspirert læring.
📚 For lærere og pedagoger som ønsker ressurser, idéer og verktøy som kan gjøre undervisningen mer kreativ, engasjerende og tilpasset barnas utvikling.
✨ For kreative skapere som ønsker å bruke AI, digitale verktøy og kreative metoder til å utvikle innhold, produkter og egne prosjekter.
🚀 For gründere og små bedrifter som ønsker å bygge noe eget online, lære mer om digital synlighet, innholdsproduksjon, e-postlister og hvordan teknologi kan gjøre veien enklere.
💡 For deg som er nysgjerrig på fremtidens muligheter – og ønsker en plattform hvor læring, kreativitet, teknologi og entreprenørskap møtes.

LME samler ressurser, apper, kurs, fellesskap og kreative verktøy på ett sted – slik at du kan utforske, skape og vokse i ditt eget tempo.

⚠️ KRITISK REGEL ⚠️ kilden/temaet brukeren oppgir BESTEMMER INNHOLDET HELT OG FULLSTENDIG. Anta ALDRI at emnet handler om Montessori. Hvis brukeren sier "YouTube-kurs" eller noe annet enn eksplisitt Montessori, skal FAQ være 100% om AKKURAT DET TEMAET. IKKE generer Montessori-referanser, pedagogisk innhold eller barn-fokusert materiale med mindre kilden wirkelig ber om det.
VIKTIG: Montessori nevnes KUN når det spesifikt handler om Montessori-filosofi eller pedagogikk.

Tonen er varm, pedagogisk og tillitsvekkende. LME er kun Renate (én person). Skriv ALLTID i jeg-form: jeg, meg, min, mitt, mine.`;

const DEFAULT_MODEL = "claude-sonnet-5";
const CALL_TIMEOUT_MS = 20000;

async function callClaude(env, system, userPrompt) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), CALL_TIMEOUT_MS);
  let resp;
  try {
    resp = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      signal: ctrl.signal,
      headers: {
        "Content-Type": "application/json",
        "x-api-key": env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: env.CONTENT_TEXT_MODEL || DEFAULT_MODEL,
        max_tokens: 2000,
        thinking: { type: "disabled" },
        system,
        messages: [{ role: "user", content: userPrompt }],
      }),
    });
  } catch (e) {
    throw new Error(e && e.name === "AbortError"
      ? "Anthropic svarte for sakte"
      : "nettverksfeil mot Anthropic");
  } finally {
    clearTimeout(timer);
  }
  if (!resp.ok) {
    const t = await resp.text();
    throw new Error(`Anthropic ${resp.status}: ${t.replace(/\s+/g, " ").slice(0, 160)}`);
  }
  const data = await resp.json();
  return (data.content || []).filter((b) => b.type === "text").map((b) => b.text).join("\n");
}

export async function onRequestPost(context) {
  const { request, env } = context;
  if (!env.ANTHROPIC_API_KEY) {
    return json({ error: "Server-konfigurasjon mangler", faq: [] }, 500);
  }

  let body;
  try {
    body = await request.json();
  } catch (e) {
    return json({ error: "Ugyldig JSON", faq: [] }, 400);
  }

  const topic = String(body.topic || "").slice(0, 1000).trim();
  const lang = String(body.lang || "no");

  if (!topic) {
    return json({ error: "Emne mangler", faq: [] }, 400);
  }

  const systemInstr = lang === "en"
    ? `You are LME's FAQ generator. Create 5-7 relevant, helpful FAQ items on the exact topic provided.
Return ONLY valid JSON in this format: {"faq":[{"q":"Question","a":"Answer"}]}
Each answer should be 1-3 sentences, warm and practical.`
    : `Du er LMEs FAQ-generator. Lag 5-7 relevante, hjelpfulle FAQ-elementer om akkurat emnet som er oppgitt.
Returner KUN gyldig JSON i dette formatet: {"faq":[{"q":"Spørsmål","a":"Svar"}]}
Hvert svar skal være 1-3 setninger, varmt og praktisk.`;

  const system = `${BRAND_CONTEXT}\n${systemInstr}`;

  const userPrompt = lang === "en"
    ? `Create FAQ for: "${topic}"`
    : `Lag FAQ for: "${topic}"`;

  try {
    const result = await callClaude(env, system, userPrompt);
    let parsed = { faq: [] };
    try {
      const match = result.match(/\{[\s\S]*\}/);
      if (match) {
        parsed = JSON.parse(match[0]);
      }
    } catch (e) {
      // fallback: return raw result
    }
    return json({ faq: parsed.faq || [] }, 200);
  } catch (err) {
    return json({ error: "FAQ-generering mislyktes", faq: [] }, 502);
  }
}
