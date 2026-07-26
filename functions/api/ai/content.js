/**
 * LME innholdsgenerering — Cloudflare Pages Function.
 *
 * Kjører på samme domene som siden (/api/ai/content), så den deployer
 * automatisk med Pages og trenger ingen egen worker. Bruker samme
 * ANTHROPIC_API_KEY som resten av funksjonene (Pages → Settings → Variables).
 *
 * Brukes av Reel Studio (/reel-studio) til å lage innhold i valgt format:
 * reel, karusell, story, feed-innlegg, lang bildetekst, nyhetsbrev, pinterest.
 *
 *   POST /api/ai/content   { format, source, seconds, lang }  -> { result: "<JSON-tekst>" }
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

// Hard timeout per kall. Uten dette kan et tregt Anthropic-svar henge helt
// til Cloudflare gir opp og sender sin egen HTML-502 (i stedet for vår rene
// JSON). Bedre å avbryte selv og feile rent og retry-bart. Samme mønster som
// functions/api/ai/repurpose.js.
const CALL_TIMEOUT_MS = 14000;

async function callClaude(env, system, userPrompt, maxTokens, model) {
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
        model: model || "claude-sonnet-5",
        max_tokens: maxTokens || 3000,
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
    throw new Error(`Anthropic ${resp.status}: ${t.replace(/\s+/g, " ").slice(0, 160)}`);
  }
  const data = await resp.json();
  return (data.content || []).filter((b) => b.type === "text").map((b) => b.text).join("\n");
}

function contentPrompt(b) {
  const fmt = String(b.format || "post");
  const src = (b.source || b.article || "").slice(0, 6000);
  const shapes = {
    carousel: `{"format":"carousel","title":"kort arbeidstittel","slides":["3-8 korte slides, hver bygger på forrige, siste er en tydelig CTA"],"caption":"ferdig caption","hashtags":["8-12 hashtags"]}`,
    reel: `{"format":"reel","title":"kort arbeidstittel","hook":"tekst-på-skjerm 0-3s, maks 8 ord","voiceover":"hele voiceover-manuset","scenes":[{"time":"0-3s","onScreen":"tekst","voiceover":"det som sies","broll":"visuell prompt i LME-stil, 9:16"}],"musicMood":"stil","caption":"caption","hashtags":["8-12 hashtags"]}`,
    story: `{"format":"story","title":"kort arbeidstittel","frames":[{"headline":"kort overskrift på framen","body":"kort tekst"}],"caption":"kort ledetekst","hashtags":["5-8 hashtags"]}`,
    post: `{"format":"post","title":"kort arbeidstittel","caption":"ferdig feed-caption, answer-first, varm CTA","hashtags":["8-12 hashtags"],"imagePrompt":"detaljert bilde-prompt i LMEs rosa/krem Montessori-stil"}`,
    caption: `{"format":"caption","title":"kort arbeidstittel","caption":"dyp, personlig bildetekst, 4-8 avsnitt","hashtags":["6-10 hashtags"]}`,
    email: `{"format":"email","subject":"emnelinje","preview":"forhåndstekst","body":"varm e-post til lista, ren tekst med avsnitt","cta":"kort oppfordring"}`,
    pinterest: `{"format":"pinterest","pinTitle":"søkbar tittel maks 100 tegn","pinDescription":"150-200 tegn med nøkkelord og myk CTA","imagePrompt":"detaljert Canva/bilde-prompt i LME-stil"}`,
    hookreel: `{"format":"hookreel","title":"kort arbeidstittel","hook":"scroll-stoppende tekst-på-skjerm i de første sekundene, 4-10 ord, skaper nysgjerrighet","voiceover":"hele det personlige manuset i jeg-form, historie som drar leseren inn og gir ekte verdi","scenes":[{"time":"0-3s","onScreen":"tekst-hook","voiceover":"det som sies","broll":"visuell prompt: enten meg som snakker til kamera, eller rolig lifestyle b-roll, vertikal 9:16 i LME-stil"}],"cta":"kommentar-basert oppfordring, f.eks. Kommenter ORDET nedenfor, så sender jeg deg …","caption":"ferdig caption","hashtags":["6-10 hashtags"]}`,
    explainer: `{"format":"explainer","title":"kort arbeidstittel","level":"hvem videoen passer for, f.eks. foreldre, barnehage 3-6 år, skole","hook":"åpningssetning som skrives på tavla, maks 8 ord","scenes":[{"time":"0-8s","board":"det som tegnes/skrives på whiteboarden i denne scenen, korte stikkord","narration":"det som fortelles med rolig stemme, 1-2 setninger"}],"takeaway":"én setning som oppsummerer det seeren skal huske","caption":"kort delings-caption for Instagram/TikTok","hashtags":["6-10 hashtags"]}`,
  };
  const shape = shapes[fmt] || shapes.post;
  const extra = fmt === "carousel" ? "3-8 slides." : fmt === "story" ? "3-5 frames." : fmt === "reel" ? "4-6 scener." : fmt === "explainer" ? "5-6 scener som til sammen blir cirka ett minutt. Bygg forklaringen steg for steg, som en tegnet whiteboard-video: hver scene tegner videre på den forrige. Konkret, enkelt og lett å huske. Hold hver scene kort." : fmt === "hookreel" ? "4-6 scener, cirka 15-40 sekunder, i stilen til en personlig merkevare-reel: en sterk tekst-hook som stopper scrollingen, deretter en ærlig historie i jeg-form som gir én konkret verdi, og en varm kommentar-basert oppfordring til slutt. Skriv aldri oppdiktede inntekter, tall, resultater eller løfter. Hold det ekte og pedagogisk, i LMEs varme tone." : "";
  return `Språk: ${langName(b.lang)}. Format: ${fmt}.
Kilde/tema: "${src}".
Lag ferdig, publiseringsklart innhold i dette formatet. ${extra}
Returner KUN gyldig JSON med denne formen:
${shape}
Answer-first, konkret pedagogisk verdi, varm tone. Følg de norske skrivereglene (rette anførselstegn, ingen tankestreker, riktig kolon- og kommabruk). Ingen tekst utenfor JSON.`;
}

export async function onRequestPost(context) {
  const { request, env } = context;
  if (!env.ANTHROPIC_API_KEY) {
    return json({ error: "Server-konfigurasjon mangler (ANTHROPIC_API_KEY)." }, 500);
  }
  let body;
  try { body = await request.json(); }
  catch { return json({ error: "Ugyldig JSON" }, 400); }

  const system = `${BRAND_CONTEXT}\nDu er LMEs innholdsprodusent. Du lager ferdig, publiseringsklart innhold i akkurat det formatet brukeren velger, i LMEs varme, pedagogiske tone.`;
  // Nye, tyngre formater (whiteboard-forklaring og hook-reel) kjøres på en rask
  // modell, slik at kallet holder seg godt innenfor tidsgrensen til funksjonen.
  // De eksisterende formatene beholder modellen de alltid har brukt.
  const fmt = String(body.format || "post");
  const fast = (fmt === "explainer" || fmt === "hookreel");
  const model = fast ? "claude-haiku-4-5-20251001" : "claude-sonnet-5";
  const maxTokens = fast ? 2000 : 3000;
  try {
    const result = await callClaude(env, system, contentPrompt(body), maxTokens, model);
    return json({ result });
  } catch (err) {
    return json({ error: "AI er midlertidig utilgjengelig. Prøv igjen om litt." }, 502);
  }
}
