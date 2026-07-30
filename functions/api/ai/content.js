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
LME er kun Renate (én person). Skriv ALLTID i jeg-form: jeg, meg, min, mitt, mine. Bruk ALDRI vi, oss, vår, våre eller vårt når LME/Renate snakker (skriv f.eks. "barna" eller "barn", ikke "barna våre"; "bli med meg", ikke "bli med oss"). Gjelder også engelsk (I, me, my, ikke we/us/our).
Ikke dikt opp personlig historie, hendelser, sitater eller påstander som ikke står i kilden/temaet brukeren har gitt. Hold deg til det som faktisk er oppgitt.
Norske skriveregler: rette anførselstegn oppe, aldri vinkel-anførselstegn. Ingen tankestreker eller lange bindestreker i teksten.
VIKTIG: nevn aldri AMI eller Association Montessori Internationale. Renate har sin utdanning fra Høyskolen i Vestfold.
ALDRI dikt opp garantier, pengene-tilbake-løfter, refusjonsvilkår, priser, rabatter, tall, resultater eller andre påstander som ikke er oppgitt i kilden. Ikke lov noe på vegne av LME. Er ikke noe oppgitt, la det være.`;

const langName = (l) => (l === "en" ? "English" : "norsk (bokmål)");

// Sterk modell for kvalitet. En raskere modell (haiku) ble prøvd for å unngå
// tidsavbrudd, men den beskrev Montessori-materiellet feil og droppet felter
// (hook, caption, CTA, hashtags). Denne jobben krever presisjon: riktige navn
// og utseende på materiellet, og fullstendig JSON. Vi holder den likevel rask
// og robust med tenkning AV, ett nytt forsøk ved feil, og en romslig
// tidsgrense. Kan overstyres uten ny utrulling via CONTENT_TEXT_MODEL.
const DEFAULT_MODEL = "claude-sonnet-5";

// Hard timeout per kall. Uten dette kan et tregt Anthropic-svar henge helt
// til Cloudflare gir opp og sender sin egen HTML-502 (i stedet for vår rene
// JSON). Bedre å avbryte selv og feile rent og retry-bart. Romsligere enn før
// (20s) siden sonnet med tenkning av holder seg godt innenfor, og retry tar
// den sjeldne trege.
const CALL_TIMEOUT_MS = 20000;

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
        model: model || env.CONTENT_TEXT_MODEL || DEFAULT_MODEL,
        max_tokens: maxTokens || 3000,
        // Tenkning AV: for strukturert innholdsgenerering trenger vi ikke
        // resonnering, og uten den svarer sonnet raskt og direkte, godt
        // innenfor tidsgrensen.
        thinking: { type: "disabled" },
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

// Ett kall kan ryke på en forbigående blipp (timeout, 429/5xx fra Anthropic,
// nettverk). Prøv en gang til før vi gir opp, så en enkelt hikke ikke gir
// brukeren "Noe gikk galt".
async function callClaudeRetry(env, system, userPrompt, maxTokens, model) {
  try {
    return await callClaude(env, system, userPrompt, maxTokens, model);
  } catch (e) {
    return await callClaude(env, system, userPrompt, maxTokens, model);
  }
}

// Reserve: OpenAI (samme nøkkel som Bookly/headshot). Brukes hvis Anthropic
// feiler (nøkkel, kreditt, rate, timeout), så tekst-genereringen virker så lenge
// minst én leverandør svarer. Ber om ren JSON.
async function callOpenAI(env, system, userPrompt, maxTokens) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), CALL_TIMEOUT_MS);
  let resp;
  try {
    resp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      signal: ctrl.signal,
      headers: { "Content-Type": "application/json", "Authorization": "Bearer " + env.OPENAI_API_KEY },
      body: JSON.stringify({
        model: env.CONTENT_OPENAI_MODEL || "gpt-4o-mini",
        max_tokens: maxTokens || 3000,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: system },
          { role: "user", content: userPrompt },
        ],
      }),
    });
  } catch (e) {
    throw new Error(e && e.name === "AbortError" ? "OpenAI svarte for sakte" : "nettverksfeil mot OpenAI");
  } finally {
    clearTimeout(timer);
  }
  if (!resp.ok) {
    const t = await resp.text();
    throw new Error(`OpenAI ${resp.status}: ${t.replace(/\s+/g, " ").slice(0, 160)}`);
  }
  const data = await resp.json();
  return (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) || "";
}

// Prøv Anthropic først (med retry), fall tilbake til OpenAI om den feiler.
async function generateText(env, system, userPrompt, maxTokens) {
  if (env.ANTHROPIC_API_KEY) {
    try {
      return await callClaudeRetry(env, system, userPrompt, maxTokens);
    } catch (e) {
      if (env.OPENAI_API_KEY) return await callOpenAI(env, system, userPrompt, maxTokens);
      throw e;
    }
  }
  if (env.OPENAI_API_KEY) return await callOpenAI(env, system, userPrompt, maxTokens);
  throw new Error("mangler AI-nøkkel");
}

function contentPrompt(b) {
  const fmt = String(b.format || "post");
  const src = (b.source || b.article || "").slice(0, 6000);
  const shapes = {
    carousel: `{"format":"carousel","title":"kort arbeidstittel","slides":["3-8 korte slides, hver bygger på forrige, siste er en tydelig CTA"],"caption":"ferdig caption","hashtags":["8-12 hashtags"]}`,
    reel: `{"format":"reel","title":"kort arbeidstittel","hook":"tekst-på-skjerm 0-3s, maks 8 ord","voiceover":"hele voiceover-manuset","scenes":[{"time":"0-3s","onScreen":"tekst","voiceover":"det som sies","broll":"ALLTID PÅ ENGELSK: visuell prompt for en vertikal 9:16 scene i LMEs rosa/krem Montessori-stil, ingen tekst i bildet. Handler scenen om et konkret Montessori-materiell, MÅ du navngi det presist med det engelske navnet OG beskrive nøyaktig hvordan det ser ut (riktige farger, antall deler, form og oppsett), f.eks. 'the Pink Tower: ten graduated pink wooden cubes stacked from largest at the bottom to smallest at the top' eller 'the Golden Bead material: a unit bead, a ten-bar, a hundred-square and a thousand-cube in golden beads'. Aldri bare 'a wooden toy'."}],"musicMood":"stil","caption":"caption","cta":"varm, tydelig oppfordring til handling","keywords":["6-10 søkeord folk kan søke etter"],"hashtags":["8-12 hashtags"]}`,
    story: `{"format":"story","title":"kort arbeidstittel","frames":[{"headline":"kort overskrift på framen","body":"kort tekst"}],"caption":"kort ledetekst","hashtags":["5-8 hashtags"]}`,
    post: `{"format":"post","title":"kort arbeidstittel","caption":"ferdig feed-caption, answer-first, varm CTA","hashtags":["8-12 hashtags"],"imagePrompt":"detaljert bilde-prompt i LMEs rosa/krem Montessori-stil"}`,
    caption: `{"format":"caption","title":"kort arbeidstittel","caption":"dyp, personlig bildetekst, 4-8 avsnitt","hashtags":["6-10 hashtags"]}`,
    email: `{"format":"email","subject":"emnelinje","preview":"forhåndstekst","body":"varm e-post til lista, ren tekst med avsnitt","cta":"kort oppfordring"}`,
    pinterest: `{"format":"pinterest","pinTitle":"søkbar tittel maks 100 tegn","pinDescription":"150-200 tegn med nøkkelord og myk CTA","imagePrompt":"detaljert Canva/bilde-prompt i LME-stil"}`,
    hookreel: `{"format":"hookreel","title":"kort arbeidstittel","hook":"scroll-stoppende tekst-på-skjerm i de første sekundene, 4-10 ord, skaper nysgjerrighet","voiceover":"hele det personlige manuset i jeg-form, historie som drar leseren inn og gir ekte verdi","scenes":[{"time":"0-3s","onScreen":"tekst-hook","voiceover":"det som sies","broll":"ALLTID PÅ ENGELSK: visuell prompt for vertikal 9:16 i LME-stil, enten meg som snakker til kamera eller rolig lifestyle b-roll, ingen tekst i bildet. Vises et konkret Montessori-materiell, MÅ du navngi det presist med det engelske navnet OG beskrive nøyaktig utseende (farger, antall deler, form, oppsett), f.eks. 'the Pink Tower: ten graduated pink wooden cubes from largest to smallest'. Aldri bare 'a wooden toy'."}],"cta":"kommentar-basert oppfordring, f.eks. Kommenter ORDET nedenfor, så sender jeg deg …","caption":"ferdig caption","hashtags":["6-10 hashtags"]}`,
    explainer: `{"format":"explainer","title":"kort arbeidstittel","level":"hvem videoen passer for, f.eks. foreldre, barnehage 3-6 år, skole","hook":"åpningssetning som skrives på tavla, maks 8 ord","scenes":[{"time":"0-8s","board":"det som tegnes/skrives på whiteboarden i denne scenen, korte stikkord","narration":"det som fortelles med rolig stemme, 1-2 setninger","illustration":"ALLTID PÅ ENGELSK: ett konkret motiv som kan tegnes som én håndtegnet blyantskisse for denne scenen, f.eks. 'a child concentrating on a wooden puzzle at a small table'. Handler scenen om et konkret Montessori-materiell, MÅ du både navngi det presist med det engelske navnet OG beskrive nøyaktig hvordan det faktisk ser ut, med riktige farger, antall deler, form og oppsett, f.eks. 'the Pink Tower: ten graduated pink wooden cubes stacked from largest at the bottom to smallest at the top' eller 'the Golden Bead material: a unit bead, a ten-bar, a hundred-square and a thousand-cube in golden beads'. Aldri bare 'a wooden toy'. Ett tydelig motiv, ingen tekst i bildet."}],"takeaway":"én setning som oppsummerer det seeren skal huske","caption":"kort delings-caption for Instagram/TikTok","hashtags":["6-10 hashtags"]}`,
    youtube: `{"format":"youtube","title":"klikkverdig, søkbar YouTube-tittel, maks 70 tegn","hook":"de første 15 sekundene: det du sier for å fange seeren og love verdi","sections":[{"heading":"kort kapittel-tittel","talkingPoints":["korte punkter for hva du sier i dette kapittelet"]}],"description":"ferdig YouTube-beskrivelse: kort intro på et par setninger, deretter en punktliste over det videoen dekker","tags":["10-15 søkeord og tags"],"thumbnailText":"3-5 kraftige ord til thumbnailen","cta":"varm oppfordring til å abonnere og kommentere"}`,
  };
  const shape = shapes[fmt] || shapes.post;
  const extra = fmt === "carousel" ? "3-8 slides." : fmt === "story" ? "3-5 frames." : fmt === "reel" ? "4-6 scener." : fmt === "explainer" ? "Nøyaktig 5 scener, korte. Til sammen cirka ett minutt. Bygg forklaringen steg for steg, som en tegnet whiteboard-video: hver scene tegner videre på den forrige. Konkret, enkelt og lett å huske. Hold hver narration til én til to setninger og hver board til noen få stikkord. For hver scene skal illustration alltid være på engelsk og beskrive ETT konkret, tegnbart motiv (én håndtegnet blyantskisse) som passer scenen, uten tekst i bildet." : fmt === "hookreel" ? "4-6 scener, cirka 15-40 sekunder, i stilen til en personlig merkevare-reel: en sterk tekst-hook som stopper scrollingen, deretter en ærlig historie i jeg-form som gir én konkret verdi, og en varm kommentar-basert oppfordring til slutt. Skriv aldri oppdiktede inntekter, tall, resultater eller løfter. Hold det ekte og pedagogisk, i LMEs varme tone." : fmt === "youtube" ? "4-7 kapitler (sections). En sammenhengende, pedagogisk YouTube-video på noen minutter. Bygg innholdet steg for steg, konkret og lett å følge, med en tydelig rød tråd. Hold hvert talking point kort. Skriv aldri oppdiktede tall, resultater eller løfter." : "";
  return `Språk: ${langName(b.lang)}. Format: ${fmt}.
Kilde/tema: "${src}".
Lag ferdig, publiseringsklart innhold i dette formatet. ${extra}
Returner KUN gyldig JSON med denne formen:
${shape}
Answer-first, konkret pedagogisk verdi, varm tone. Følg de norske skrivereglene (rette anførselstegn, ingen tankestreker, riktig kolon- og kommabruk). Ingen tekst utenfor JSON.`;
}

export async function onRequestPost(context) {
  const { request, env } = context;
  if (!env.ANTHROPIC_API_KEY && !env.OPENAI_API_KEY) {
    return json({ error: "Server-konfigurasjon mangler (mangler AI-nøkkel)." }, 500);
  }
  let body;
  try { body = await request.json(); }
  catch { return json({ error: "Ugyldig JSON" }, 400); }

  const system = `${BRAND_CONTEXT}\nDu er LMEs innholdsprodusent. Du lager ferdig, publiseringsklart innhold i akkurat det formatet brukeren velger, i LMEs varme, pedagogiske tone.`;
  // Nok token-tak til at hele JSON-en kommer med. De tyngre formatene
  // (explainer, hookreel) har mange felter og flere scener, så de trenger
  // rikelig rom, ellers kappes svaret og felter som caption, CTA og hashtags
  // (som står sist) faller bort.
  const fmt = String(body.format || "post");
  const light = (fmt === "explainer" || fmt === "hookreel");
  const maxTokens = light ? 3000 : 3200;
  try {
    const result = await generateText(env, system, contentPrompt(body), maxTokens);
    return json({ result });
  } catch (err) {
    return json({ error: "AI er midlertidig utilgjengelig. Prøv igjen om litt." }, 502);
  }
}
