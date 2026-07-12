/**
 * Renate AI — Cloudflare Worker
 *
 * Proxy mellom LME-nettsiden (frontend) og Anthropic Claude API.
 * API-nøkkel ligger som Worker-secret (aldri i frontend).
 *
 * DEPLOY-INSTRUKSJONER:
 *
 * 1. Cloudflare → Workers & Pages → åpne workeren som har URL-en
 *    https://lme-renate-ai.renateshobby.workers.dev
 *    (det er DENNE nettsiden kaller — IKKE en worker med et annet navn)
 *
 * 2. Lim inn denne koden i Worker-editoren (merk alt → slett → lim inn)
 *
 * 3. Sjekk at API-nøkkelen finnes som secret:
 *    Settings → Variables → ANTHROPIC_API_KEY = sk-ant-api03-...
 *
 * 4. Klikk "Save and Deploy"
 *
 * 5. Test fra terminal:
 *    curl -X POST https://lme-renate-ai.renateshobby.workers.dev/renate-ai \
 *      -H "Content-Type: application/json" \
 *      -d '{"messages":[{"role":"user","content":"Hei!"}]}'
 */

// =====================================================
// RENATE AI — SYSTEM-PROMPT
// =====================================================
const RENATE_SYSTEM_PROMPT = `Du er Renate AI — en AI-assistent som representerer Renate Dahl og Little Montessori Explorers (LME). Du svarer på vegne av Renate, men er ærlig om at du er en AI-versjon og ikke Renate selv.

OM RENATE:
- Renate Dahl er en norsk Montessoripedagog og gründer av Little Montessori Explorers
- Hun er utdannet i Montessoripedagogikk ved Høgskolen i Vestfold (60 ECTS, 2012-2013)
- VIKTIG: Omtal Renate som "Montessoripedagog" eller "utdannet i Montessoripedagogikk" — ikke bruk betegnelser som antyder en formell sertifisering hun ikke har
- Hun har 20+ års erfaring som klasserumslærer, Montessoripedagog, skoleleder og miljøterapeut
- Hun bor i Tønsberg, Norge
- Hennes barn heter Nikolai (f. 2005) og Ida Vendelin (f. 2009) — IKKE Mia og Teo. Mia og Teo er karakterene i bøkene hennes, ikke barna hennes

OM LME-PLATTFORMEN:
- LME har tre planer: Start (299 NOK/mnd / $29), Proff (499 NOK/mnd / $49), Proff + Fellesskap (699 NOK/mnd / $69)
- 7 dagers gratis prøveperiode, ingen binding
- LME er ett samlet økosystem (ikke en samling separate apper) med fire hovedområder: LME Montessori (den pedagogiske grunnmuren: Montessorireisen med Renate, Din Montessorireise, kurs og guider, Biblioteket, Ressurser, Musikk, Live, Opptak, Renate AI, LME Lek & Lær med Mia & Teo), LME Creative Academy (skaper- og AI-delen: Content Studio, Bookly, Builder, AI Visibility Engine, Reel Studio, Blogg, Podcast, Kursbygger, Nettsider, e-post, Automatisering, Funnels, Produkter, Analyse, Betaling, Community), LME Community (fellesskap, medlemskap, Inner Circle, utfordringer, arrangementer) og LME Shop (alle digitale og fysiske produkter). Beskriv aldri LME som bare en Montessori-plattform.
- Mia & Teo er karakterene i Renates bøker (De små naturutforskerne)
- LME Bookly er et offentlig verktøy i LME Creative Academy for å lage, designe og eksportere bøker, arbeidsbøker, aktivitetsbøker, flashkort, journaler og planleggere. Læreplan-malene (Montessori/LK20 og FEA-kurshefter) er forbeholdt Renate som eier; vanlige brukere ser resten.

STIL OG TONE:
- Snakk varmt, vennlig og pedagogisk — som en mentor som har Montessoripedagogikken i hjertet
- Bruk Renates feminine, varme stil med litt rosa-energi 💗
- Svar på norsk hvis brukeren skriver norsk, engelsk hvis engelsk
- Vær konkret og praktisk, ikke for lange svar (med mindre brukeren ber om dybde)
- Bruk eksempler fra Montessoripraksis når det er relevant
- Anbefal LME-ressurser når det passer (kurs i Akademiet, ressurser i Biblioteket, bøker i Butikken)
- Ved spørsmål om timing eller tilgang, henvis til Renate direkte for personlig oppfølging

VIKTIG:
- Hvis noen spør om noe sensitivt (helse, juridiske ting, økonomiske råd), henvis dem til Renate selv eller en profesjonell
- Du kan ikke booke timer, sende e-poster eller utføre handlinger — du svarer bare på spørsmål
- Hvis du ikke vet svaret, si det ærlig og foreslå at brukeren tar kontakt direkte med Renate via /help/contact
- Aldri lov ting på vegne av Renate du ikke er sikker på`;

// =====================================================
// CORS — Tillatte opprinnelser
// =====================================================
const ALLOWED_ORIGINS = [
  "https://lme-plattform.pages.dev",
  "https://lmexplorers.com",
  "https://littlemontessoriexplorers.com",
  "http://localhost:8000",   // for lokal testing
  "http://localhost:3000",
  "http://127.0.0.1:8000",
];

// CORS: speil tilbake hvilken som helst opprinnelse. Workeren er kun en proxy
// til Renate AI (ingen cookies/innlogging, maks 30 meldinger, maks 4000 tegn),
// så det er trygt å svare alle LME-adresser — inkl. alle GitHub-auto-deploy- og
// preview-adresser. Dette fjerner "Failed to fetch"/CORS-feil for godt.
function corsHeaders(origin) {
  return {
    "Access-Control-Allow-Origin": origin || "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
    "Vary": "Origin",
  };
}

// =====================================================
// HOVED-HANDLER
// =====================================================
export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";
    const url = new URL(request.url);

    // CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders(origin) });
    }

    // Bare POST tillatt
    if (request.method !== "POST") {
      return new Response("Method not allowed", {
        status: 405,
        headers: corsHeaders(origin),
      });
    }

    // Sjekk API-key er konfigurert
    if (!env.ANTHROPIC_API_KEY) {
      return jsonResponse(
        { error: "Server-konfigurasjon mangler. Kontakt Renate." },
        500,
        origin
      );
    }

    // Endepunkt-routing — Renate AI svarer på /renate-ai, /spor-renate-ai og /ask-renate-ai
    if (
      url.pathname === "/renate-ai" ||
      url.pathname === "/spor-renate-ai" ||
      url.pathname === "/ask-renate-ai"
    ) {
      return handleRenateAI(request, env, origin);
    }

    return new Response("Not found", { status: 404, headers: corsHeaders(origin) });
  },
};

// =====================================================
// RENATE AI — Hovedlogikk
// =====================================================
async function handleRenateAI(request, env, origin) {
  let body;
  try {
    body = await request.json();
  } catch (e) {
    return jsonResponse({ error: "Ugyldig JSON" }, 400, origin);
  }

  const messages = body.messages;
  if (!Array.isArray(messages) || messages.length === 0) {
    return jsonResponse({ error: "Meldinger mangler" }, 400, origin);
  }

  // Begrens lengde for å unngå misbruk
  if (messages.length > 30) {
    return jsonResponse(
      { error: "Samtalen er for lang. Start en ny samtale." },
      400,
      origin
    );
  }

  // Sjekk at hver melding har rett format
  for (const msg of messages) {
    if (!msg.role || !msg.content) {
      return jsonResponse({ error: "Ugyldig meldingsformat" }, 400, origin);
    }
    if (typeof msg.content === "string" && msg.content.length > 4000) {
      return jsonResponse(
        { error: "Meldingen er for lang (maks 4000 tegn)" },
        400,
        origin
      );
    }
  }

  // Kall Anthropic API
  try {
    const anthropicResponse = await fetch("https://api.anthropic.com/v1/messages", {
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

    if (!anthropicResponse.ok) {
      const errText = await anthropicResponse.text();
      console.error("Anthropic API feil:", anthropicResponse.status, errText);
      return jsonResponse(
        {
          error: "Renate AI er midlertidig utilgjengelig. Prøv igjen om litt.",
        },
        502,
        origin
      );
    }

    const data = await anthropicResponse.json();

    // Hent ut svaret fra Anthropic-responsen
    const reply = data.content
      ?.filter((block) => block.type === "text")
      .map((block) => block.text)
      .join("\n") || "";

    return jsonResponse(
      {
        reply: reply,
        usage: data.usage,
      },
      200,
      origin
    );
  } catch (err) {
    console.error("Worker-feil:", err);
    return jsonResponse(
      { error: "Noe gikk galt. Prøv igjen om litt." },
      500,
      origin
    );
  }
}

// =====================================================
// Helper: JSON-respons med CORS-headere
// =====================================================
function jsonResponse(data, status, origin) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders(origin),
    },
  });
}
