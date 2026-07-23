/**
 * LME "Gjør synlig" — omform én kilde til flere kanaler. Cloudflare Pages Function.
 *
 * Kjører på samme domene som siden (/api/ai/repurpose), så den deployer
 * automatisk med Pages og trenger ingen egen worker. Bruker samme
 * ANTHROPIC_API_KEY som resten av funksjonene (Pages → Settings → Variables).
 *
 *   POST /api/ai/repurpose   { article, lang }  -> { result: "<JSON-tekst>" }
 *
 * Svaret er JSON med kanalene "Gjør synlig" viser:
 *   { blog, facebook, instagram, pinterest, tiktok, reelScript, email }
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
AI-drevet plattform grunnlagt av Renate Dahl (Montessori-pedagog med utdanning fra Høyskolen i Vestfold, Tønsberg).
LME er ett samlet økosystem, ikke en samling separate apper. Reisen er: lær, skap, bli synlig, selg og voks.
Montessori-filosofien er fundamentet, men LME er mer enn en Montessori-plattform.
Mia & Teo er karakterene i Renates bøker (De små naturutforskerne). Tonen er varm, pedagogisk og tillitsvekkende.
VIKTIG: nevn aldri AMI eller Association Montessori Internationale. Renate har sin utdanning fra Høyskolen i Vestfold.
ALDRI dikt opp garantier, pengene-tilbake-løfter, refusjonsvilkår, priser, rabatter, tall, resultater eller andre påstander som ikke er oppgitt i kilden. Ikke lov noe på vegne av LME. Er ikke noe oppgitt, la det være.`;

const langName = (l) => (l === "en" ? "English" : "norsk (bokmål)");

async function callClaude(env, system, userPrompt, maxTokens) {
  const resp = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: maxTokens || 3000,
      system,
      messages: [{ role: "user", content: userPrompt }],
    }),
  });
  if (!resp.ok) {
    const t = await resp.text();
    throw new Error(`Anthropic ${resp.status}: ${t}`);
  }
  const data = await resp.json();
  return (data.content || []).filter((b) => b.type === "text").map((b) => b.text).join("\n");
}

function repurposePrompt(b) {
  const src = (b.article || b.source || "").slice(0, 6000);
  return `Språk: ${langName(b.lang)}.
Kilde (artikkel/utdrag): "${src}".
Omform denne ene kilden til flere ferdige, publiseringsklare kanaler. Returner KUN gyldig JSON med denne formen:
{"blog":"kort ingress","facebook":"ferdig Facebook-innlegg, varm og answer-first","instagram":"ferdig caption med hashtags","pinterest":"pin-tekst med søkbare nøkkelord","tiktok":"idé/hook til en kort video","reelScript":"15-30s manus med scener","email":"emnelinje + kort e-post til lista"}
Behold LMEs varme, pedagogiske tone. Følg de norske skrivereglene (rette anførselstegn, ingen tankestreker, riktig kolon- og kommabruk). ALDRI dikt opp løfter eller tall som ikke står i kilden. Ingen tekst utenfor JSON.`;
}

export async function onRequestPost(context) {
  const { request, env } = context;
  if (!env.ANTHROPIC_API_KEY) {
    return json({ error: "Server-konfigurasjon mangler (ANTHROPIC_API_KEY)." }, 500);
  }
  let body;
  try { body = await request.json(); }
  catch { return json({ error: "Ugyldig JSON" }, 400); }

  const system = `${BRAND_CONTEXT}\nDu omformer ÉN kilde til flere kanaler, gjenbruker LME Content Studio-tankegangen.`;
  try {
    const result = await callClaude(env, system, repurposePrompt(body), 3000);
    return json({ result });
  } catch (err) {
    return json({ error: "AI er midlertidig utilgjengelig. Prøv igjen om litt." }, 502);
  }
}
