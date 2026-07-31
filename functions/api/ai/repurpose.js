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

// Sju kanaler i ETT svar ble for tregt: Cloudflare avbrøt Pages-funksjonen
// før den rakk å svare, og brukeren fikk en plattform-502 (HTML), ikke vår
// egen JSON. Løsning: del opp i to KORTERE kall som kjører SAMTIDIG. Da blir
// hvert svar raskt, veggklokka omtrent halveres, og vi holder oss trygt
// innenfor tidsgrensen. Rask modell, hard timeout per kall.
const MODEL = "claude-haiku-4-5-20251001";
// Kortere enn før: jo lenger vi venter, jo større sjanse for at NOE i kjeden
// (Cloudflare, mobilnettet hennes, eller Anthropic) rekker å gi opp først.
// Bedre å feile raskt og rent (egen JSON) enn å risikere at noen andre
// avbryter oss stygt (HTML-502) mens vi venter.
const CALL_TIMEOUT_MS = 14000;

// Feltbeskrivelsene "Gjør synlig" viser, delt i to grupper for to parallelle kall.
const CH = {
  blog: '"blog":"kort ingress"',
  facebook: '"facebook":"ferdig Facebook-innlegg, varm og answer-first"',
  instagram: '"instagram":"ferdig caption med hashtags"',
  pinterest: '"pinterest":"pin-tekst med søkbare nøkkelord"',
  tiktok: '"tiktok":"idé/hook til en kort video"',
  reelScript: '"reelScript":"15-30s manus med scener"',
  email: '"email":"emnelinje + kort e-post til lista"',
};
const GROUPS = [
  ["blog", "facebook", "instagram", "pinterest"],
  ["tiktok", "reelScript", "email"],
];

async function callClaude(env, system, userPrompt, maxTokens) {
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
        model: MODEL,
        max_tokens: maxTokens || 1400,
        system,
        messages: [{ role: "user", content: userPrompt }],
      }),
    });
  } catch (e) {
    throw new Error(e && e.name === "AbortError"
      ? "Anthropic svarte for sakte (avbrutt etter " + Math.round(CALL_TIMEOUT_MS / 1000) + "s)"
      : "nettverksfeil mot Anthropic");
  } finally {
    clearTimeout(timer);
  }
  if (!resp.ok) {
    const t = await resp.text();
    throw new Error("Anthropic " + resp.status + ": " + t.replace(/\s+/g, " ").slice(0, 160));
  }
  const data = await resp.json();
  return (data.content || []).filter((b) => b.type === "text").map((b) => b.text).join("\n");
}

function promptFor(b, keys) {
  // Kortere kildetekst = færre input-tokens = raskere første token tilbake.
  // 6000 var mer enn nok her, det som teller er ingress/poeng, ikke hele
  // artikkelen ord for ord.
  const src = (b.article || b.source || "").slice(0, 3000);
  const fields = keys.map((k) => CH[k]).join(",");
  return `Språk: ${langName(b.lang)}.
Kilde (artikkel/utdrag): "${src}".
Omform denne ene kilden til KORTE, ferdige, publiseringsklare kanaler. Returner KUN gyldig JSON med NØYAKTIG disse feltene: {${fields}}.
Behold LMEs varme, pedagogiske tone. Følg de norske skrivereglene (rette anførselstegn, ingen tankestreker, riktig kolon- og kommabruk). ALDRI dikt opp løfter eller tall som ikke står i kilden. Ingen tekst utenfor JSON.`;
}

function parseObj(txt) {
  if (!txt) return {};
  const m = txt.match(/\{[\s\S]*\}/);
  try { return JSON.parse(m ? m[0] : txt); } catch (e) { return {}; }
}

export async function onRequestPost(context) {
  const { request, env } = context;
  if (!env.ANTHROPIC_API_KEY) {
    return json({ error: "Server-konfigurasjon mangler (ANTHROPIC_API_KEY)." }, 500);
  }
  let body;
  try { body = await request.json(); }
  catch { return json({ error: "Ugyldig JSON" }, 400); }

  const system = `${BRAND_CONTEXT}\nDu omformer ÉN kilde til flere kanaler, gjenbruker LME Autopilot-tankegangen.`;

  // To kortere kall samtidig. Feiler den ene, beholder vi kanalene fra den
  // andre (delvis er bedre enn ingenting). Bare hvis begge feiler gir vi 502.
  const settled = await Promise.all(GROUPS.map(async (keys) => {
    try {
      return parseObj(await callClaude(env, system, promptFor(body, keys), 1000));
    } catch (e) {
      return { __err: (e && e.message) || "feil" };
    }
  }));

  const merged = {};
  let ok = 0, lastErr = "ukjent feil";
  for (const part of settled) {
    if (part && part.__err) { lastErr = part.__err; continue; }
    Object.assign(merged, part); ok++;
  }
  if (ok === 0) {
    return json({ error: "AI-feil: " + String(lastErr).slice(0, 200) }, 502);
  }
  return json({ result: JSON.stringify(merged) });
}
