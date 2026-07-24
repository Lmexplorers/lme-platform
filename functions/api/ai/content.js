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

async function callClaude(env, system, userPrompt, maxTokens) {
  const resp = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-5",
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
  };
  const shape = shapes[fmt] || shapes.post;
  const extra = fmt === "carousel" ? "3-8 slides." : fmt === "story" ? "3-5 frames." : fmt === "reel" ? "4-6 scener." : "";
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
  try {
    const result = await callClaude(env, system, contentPrompt(body), 3000);
    return json({ result });
  } catch (err) {
    return json({ error: "AI er midlertidig utilgjengelig. Prøv igjen om litt." }, 502);
  }
}
