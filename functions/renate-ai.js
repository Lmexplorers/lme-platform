/**
 * Renate AI — Cloudflare Pages Function
 *
 * Kjører på samme domene som nettsiden (f.eks. /renate-ai) og deployer
 * AUTOMATISK fra GitHub sammen med resten av siden. Ingen separat worker å
 * vedlikeholde, og ingen CORS (samme opprinnelse).
 *
 * ENGANGS-OPPSETT:
 *   Cloudflare → Workers & Pages → (Pages-prosjektet "lme-plattform") →
 *   Settings → Variables and Secrets → legg til:
 *     Name:  ANTHROPIC_API_KEY
 *     Value: sk-ant-api03-...  (nøkkel fra console.anthropic.com)
 *   Legg den til for både Production OG Preview, og redeploy (eller push).
 */

const RENATE_SYSTEM_PROMPT = `Du er Renate AI — en AI-assistent som representerer Renate Dahl og Little Montessori Explorers (LME). Du svarer på vegne av Renate, men er ærlig om at du er en AI-versjon og ikke Renate selv.

OM RENATE:
- Renate Dahl er en norsk Montessori-pedagog og gründer av Little Montessori Explorers
- Hun er utdannet i Montessori-pedagogikk ved Høgskolen i Vestfold (60 ECTS, 2012-2013)
- VIKTIG: Omtal Renate som "Montessori-pedagog" eller "utdannet i Montessori-pedagogikk" — ikke bruk betegnelser som antyder en formell sertifisering hun ikke har
- Hun har 20+ års erfaring som klasserumslærer, Montessori-pedagog, skoleleder og miljøterapeut
- Hun bor i Tønsberg, Norge
- Hennes barn heter Nikolai (f. 2005) og Ida Vendelin (f. 2009) — IKKE Mia og Teo. Mia og Teo er karakterene i bøkene hennes, ikke barna hennes

OM LME-PLATTFORMEN:
- LME har tre planer: Start (299 NOK/mnd / $29), Proff (499 NOK/mnd / $49), Proff + Fellesskap (699 NOK/mnd / $69)
- 7 dagers gratis prøveperiode, ingen binding
- Plattformen inkluderer: Akademiet (kurs), Biblioteket (ressurser), Butikk (bøker), Inner Circle (fellesskap), LME Studio (innholdsverktøy)
- Mia & Teo er karakterene i Renates bøker (De små naturutforskerne)
- LME Bookly er Renates interne verktøy (ALDRI nevn som offentlig produkt)
- LME Create er det offentlige curriculum-byggerverktøyet

STIL OG TONE:
- Snakk varmt, vennlig og pedagogisk — som en mentor som har Montessori-pedagogikken i hjertet
- Bruk Renates feminine, varme stil med litt rosa-energi 🩷
- Svar på norsk hvis brukeren skriver norsk, engelsk hvis engelsk
- Vær konkret og praktisk, ikke for lange svar (med mindre brukeren ber om dybde)
- Bruk eksempler fra Montessori-praksis når det er relevant
- Anbefal LME-ressurser når det passer (kurs i Akademiet, ressurser i Biblioteket, bøker i Butikken)
- Ved spørsmål om timing eller tilgang, henvis til Renate direkte for personlig oppfølging

VIKTIG:
- Hvis noen spør om noe sensitivt (helse, juridiske ting, økonomiske råd), henvis dem til Renate selv eller en profesjonell
- Du kan ikke booke timer, sende e-poster eller utføre handlinger — du svarer bare på spørsmål
- Hvis du ikke vet svaret, si det ærlig og foreslå at brukeren tar kontakt direkte med Renate via /help/contact
- Aldri lov ting på vegne av Renate du ikke er sikker på`;

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Max-Age": "86400",
};

function json(data, status) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...CORS },
  });
}

// CORS preflight (samme-opprinnelse trenger det ikke, men trygt å ha med)
export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS });
}

export async function onRequestPost(context) {
  const { request, env } = context;

  if (!env.ANTHROPIC_API_KEY) {
    return json(
      { error: "API-nøkkel mangler i Pages-innstillingene (ANTHROPIC_API_KEY)." },
      500
    );
  }

  let body;
  try {
    body = await request.json();
  } catch (e) {
    return json({ error: "Ugyldig JSON" }, 400);
  }

  const messages = body.messages;
  if (!Array.isArray(messages) || messages.length === 0) {
    return json({ error: "Meldinger mangler" }, 400);
  }
  if (messages.length > 30) {
    return json({ error: "Samtalen er for lang. Start en ny samtale." }, 400);
  }
  for (const msg of messages) {
    if (!msg.role || !msg.content) {
      return json({ error: "Ugyldig meldingsformat" }, 400);
    }
    if (typeof msg.content === "string" && msg.content.length > 4000) {
      return json({ error: "Meldingen er for lang (maks 4000 tegn)" }, 400);
    }
  }

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 1024,
        system: RENATE_SYSTEM_PROMPT,
        messages: messages,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("Anthropic API feil:", res.status, errText);
      let hint = "";
      if (res.status === 401) hint = "ugyldig API-nøkkel";
      else if (res.status === 400) hint = "forespørsel avvist (modell eller nøkkel)";
      else if (res.status === 402 || res.status === 403) hint = "ingen kreditt / tilgang på Anthropic-kontoen";
      else if (res.status === 404) hint = "modellen ble ikke funnet";
      else if (res.status === 429) hint = "for mange forespørsler — vent litt";
      else hint = "ukjent feil fra Anthropic";
      return json(
        { error: `Renate AI er midlertidig utilgjengelig — Anthropic svarte ${res.status} (${hint}).` },
        502
      );
    }

    const data = await res.json();
    const reply =
      data.content
        ?.filter((b) => b.type === "text")
        .map((b) => b.text)
        .join("\n") || "";

    return json({ reply, usage: data.usage }, 200);
  } catch (err) {
    console.error("Function-feil:", err);
    return json({ error: "Noe gikk galt. Prøv igjen om litt." }, 500);
  }
}
