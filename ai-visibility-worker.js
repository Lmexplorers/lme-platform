/**
 * LME AI Visibility Engine — Cloudflare Worker
 *
 * Gjenbruker SAMME mønster som renate-ai-worker.js: en tynn proxy foran
 * Anthropic Claude API, med API-nøkkelen som Worker-secret (aldri i frontend).
 * Dette er motoren bak /ai-visibility (Creative Studio).
 *
 * Målet er ikke bare klassisk SEO, men GEO (Generative Engine Optimization):
 * strukturert, sitatvennlig innhold som Google OG AI-søk (ChatGPT, Gemini,
 * Claude, Perplexity) enkelt kan lese og anbefale.
 *
 * ENDEPUNKTER (alle POST, JSON inn/ut):
 *   /ai/keywords    { seed, lang }              -> søkeord + long-tail
 *   /ai/questions   { topic, lang }             -> spørsmål folk stiller AI
 *   /ai/article     { keyword, lang }           -> full SEO/GEO-artikkel + meta + FAQ + CTA
 *   /ai/faq         { topic, lang }             -> FAQ-seksjon (Q/A)
 *   /ai/schema      { type, data }              -> JSON-LD (FAQ/Article/Product/Course/Org/Breadcrumb)
 *   /ai/pinterest   { title, summary, lang }    -> Pinterest-tittel/beskrivelse/pins/bildeprompt
 *   /ai/repurpose   { article, lang }           -> IG/FB/Pinterest/TikTok/Reel/e-post fra én kilde
 *
 * DEPLOY:
 *   1. Cloudflare -> Workers & Pages -> ny Worker "lme-ai-visibility"
 *      (eller legg til disse rutene i den eksisterende lme-proxy-Workeren).
 *   2. Lim inn denne koden.
 *   3. Settings -> Variables -> Encrypted: ANTHROPIC_API_KEY = sk-ant-...
 *   4. (Valgfritt, Fase 2) Bind D1 "lme-ai-visibility" som env.DB for lagring.
 *   5. Save and Deploy. Frontend kaller https://<worker>/ai/<endepunkt>.
 */

// =====================================================
// Merkevarestemme — holdt i tråd med Renate AI
// =====================================================
const BRAND_CONTEXT = `Du jobber for Little Montessori Explorers (LME), en bilingual norsk/engelsk
Montessori-plattform grunnlagt av Renate Dahl (Montessori-pedagog i AMI-tradisjon, Tønsberg).
LME tilbyr Akademiet (kurs), Biblioteket (ressurser), Butikk (Mia & Teo-bøker og digitale
Montessori-ressurser), Inner Circle (fellesskap) og AI-verktøy. Mia & Teo er karakterene i
Renates bøker (De små naturutforskerne). Tonen er varm, pedagogisk og tillitsvekkende.
VIKTIG: si aldri at Renate er "AMI-sertifisert"; hun er utdannet i AMI-tradisjonen.`;

const GEO_RULES = `Skriv for både Google OG generative AI-motorer (ChatGPT, Gemini, Claude, Perplexity).
GEO-prinsipper du ALLTID følger:
- Svar på spørsmålet tydelig i de første 1-2 setningene (sitatvennlig "answer-first").
- Bruk klare H2/H3 som matcher hvordan folk faktisk spør.
- Inkluder konkrete, faktabaserte punktlister AI kan trekke ut og sitere.
- Naturlig, ikke keyword-stuffet. E-E-A-T: vis erfaring og pedagogisk autoritet.
- Avslutt med en relevant CTA til riktig LME-område (Akademiet/Biblioteket/Butikk/Inner Circle).`;

// =====================================================
// CORS — samme tillatte opprinnelser som resten av LME
// =====================================================
const ALLOWED_ORIGINS = [
  "https://lme-plattform.pages.dev",
  "https://lmexplorers.com",
  "https://littlemontessoriexplorers.com",
  "http://localhost:8000",
  "http://localhost:3000",
  "http://127.0.0.1:8000",
];

function corsHeaders(origin) {
  const allowed = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allowed,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
  };
}

function json(data, status, origin) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders(origin) },
  });
}

// =====================================================
// Hoved-handler
// =====================================================
export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders(origin) });
    }
    if (request.method !== "POST") {
      return new Response("Method not allowed", { status: 405, headers: corsHeaders(origin) });
    }
    if (!env.ANTHROPIC_API_KEY) {
      return json({ error: "Server-konfigurasjon mangler (ANTHROPIC_API_KEY)." }, 500, origin);
    }

    // Schema-generering er ren JS — trenger ikke AI.
    if (url.pathname === "/ai/schema") {
      return handleSchema(request, origin);
    }

    // Publisering: render artikkel -> HTML og send til Make-webhook (Fase 2).
    if (url.pathname === "/ai/publish") {
      return handlePublish(request, env, origin);
    }

    const route = ROUTES[url.pathname];
    if (!route) {
      return json({ error: "Ukjent endepunkt." }, 404, origin);
    }

    let body;
    try { body = await request.json(); }
    catch { return json({ error: "Ugyldig JSON" }, 400, origin); }

    try {
      const result = await callClaude(env, route.system, route.prompt(body), route.maxTokens);
      return json({ result }, 200, origin);
    } catch (err) {
      console.error("AI Visibility-feil:", err);
      return json({ error: "AI er midlertidig utilgjengelig. Prøv igjen om litt." }, 502, origin);
    }
  },
};

// =====================================================
// Anthropic-kall (samme som renate-ai-worker.js)
// =====================================================
async function callClaude(env, system, userPrompt, maxTokens) {
  const resp = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: maxTokens || 2048,
      system,
      messages: [{ role: "user", content: userPrompt }],
    }),
  });
  if (!resp.ok) {
    const t = await resp.text();
    throw new Error(`Anthropic ${resp.status}: ${t}`);
  }
  const data = await resp.json();
  return (data.content || [])
    .filter((b) => b.type === "text")
    .map((b) => b.text)
    .join("\n");
}

const langName = (l) => (l === "en" ? "English" : "norsk (bokmål)");

// =====================================================
// Rute-definisjoner (AI-drevne)
// =====================================================
const ROUTES = {
  "/ai/keywords": {
    maxTokens: 1500,
    system: `${BRAND_CONTEXT}\nDu er en SEO/GEO-keyword-spesialist for Montessori og barnelæring.`,
    prompt: (b) => `Språk: ${langName(b.lang)}.
Tema/seed: "${b.seed || "Montessori for barn"}".
Returner KUN gyldig JSON med denne formen:
{"head":["..."],"longtail":["..."],"questions":["..."]}
- head: 8 korte hovedsøkeord
- longtail: 12 long-tail søkeord (3-6 ord) med reell intensjon
- questions: 8 spørsmål folk googler/spør AI om dette
Alt på ${langName(b.lang)}. Ingen tekst utenfor JSON.`,
  },

  "/ai/questions": {
    maxTokens: 1500,
    system: `${BRAND_CONTEXT}\nDu kartlegger spørsmål folk stiller AI-assistenter (ChatGPT/Gemini/Claude/Perplexity).`,
    prompt: (b) => `Språk: ${langName(b.lang)}. Tema: "${b.topic || "Montessori"}".
Returner KUN gyldig JSON: {"questions":[{"q":"...","intent":"informational|commercial|navigational"}]}
Gi 12 realistiske spørsmål en forelder/pedagog ville stilt en AI om dette temaet,
fra nybegynner til viderekommen. Alt på ${langName(b.lang)}. Ingen tekst utenfor JSON.`,
  },

  "/ai/article": {
    maxTokens: 4096,
    system: `${BRAND_CONTEXT}\n${GEO_RULES}\nDu er LMEs innholdsforfatter.`,
    prompt: (b) => `Språk: ${langName(b.lang)}. Målsøkeord: "${b.keyword || ""}".
Skriv en komplett, GEO-optimalisert artikkel. Returner KUN gyldig JSON:
{
 "seoTitle":"max 60 tegn",
 "metaDescription":"max 155 tegn",
 "slug":"kebab-case",
 "h1":"...",
 "intro":"answer-first, 2-3 setninger",
 "sections":[{"h2":"...","body":"2-4 avsnitt markdown","h3":["valgfrie underpunkter"]}],
 "faq":[{"q":"...","a":"..."}],
 "cta":{"text":"...","area":"academy|library|shop|innercircle","url":"/biblioteket"}
}
Krav: minst 4 seksjoner, minst 4 FAQ, naturlig tone, faktabasert. Ingen tekst utenfor JSON.`,
  },

  "/ai/faq": {
    maxTokens: 2000,
    system: `${BRAND_CONTEXT}\n${GEO_RULES}`,
    prompt: (b) => `Språk: ${langName(b.lang)}. Tema: "${b.topic || ""}".
Returner KUN gyldig JSON: {"faq":[{"q":"...","a":"..."}]}
Gi 6-8 spørsmål/svar som Google og AI lett kan lese. Svar i 2-4 setninger,
answer-first. Alt på ${langName(b.lang)}. Ingen tekst utenfor JSON.`,
  },

  "/ai/pinterest": {
    maxTokens: 1500,
    system: `${BRAND_CONTEXT}\nDu er Pinterest-strateg for en Montessori-merkevare. Pinterest er en visuell søkemotor.`,
    prompt: (b) => `Språk: ${langName(b.lang)}.
Artikkeltittel: "${b.title || ""}". Sammendrag: "${b.summary || ""}".
Returner KUN gyldig JSON:
{"pinTitle":"max 100 tegn, søkbar","pinDescription":"150-200 tegn med naturlige nøkkelord og myk CTA",
 "pinIdeas":["5 ulike pin-vinkler"],"imagePrompt":"detaljert Canva/bilde-prompt i LMEs varme rosa/krem Montessori-stil"}
Ingen tekst utenfor JSON.`,
  },

  "/ai/repurpose": {
    maxTokens: 3000,
    system: `${BRAND_CONTEXT}\nDu omformer ÉN kilde til flere kanaler — gjenbruker LME Content Studio-tankegangen.`,
    prompt: (b) => `Språk: ${langName(b.lang)}.
Kilde (artikkel/utdrag): "${(b.article || "").slice(0, 6000)}".
Returner KUN gyldig JSON:
{"blog":"kort ingress","facebook":"...","instagram":"caption + hashtags","pinterest":"pin-tekst",
 "tiktok":"idé/hook","reelScript":"15-30s manus med scener","email":"emnelinje + kort e-post"}
Behold LMEs varme, pedagogiske tone. Ingen tekst utenfor JSON.`,
  },
};

// =====================================================
// Schema-generator (ren JS — JSON-LD, ingen AI nødvendig)
// =====================================================
async function handleSchema(request, origin) {
  let body;
  try { body = await request.json(); }
  catch { return json({ error: "Ugyldig JSON" }, 400, origin); }

  const { type, data = {} } = body;
  const ORG = {
    "@type": "Organization",
    name: "Little Montessori Explorers",
    url: "https://lmexplorers.com",
    logo: "https://lmexplorers.com/images/lme-logo.png",
  };

  let schema;
  switch ((type || "").toLowerCase()) {
    case "faq":
      schema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: (data.faq || []).map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      };
      break;
    case "article":
      schema = {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: data.h1 || data.seoTitle || "",
        description: data.metaDescription || "",
        author: { "@type": "Person", name: "Renate Dahl" },
        publisher: ORG,
        inLanguage: data.lang === "en" ? "en" : "no",
        datePublished: data.datePublished || new Date().toISOString().slice(0, 10),
      };
      break;
    case "product":
      schema = {
        "@context": "https://schema.org",
        "@type": "Product",
        name: data.name || "",
        description: data.description || "",
        brand: ORG,
        offers: {
          "@type": "Offer",
          price: data.price || "",
          priceCurrency: data.currency || "NOK",
          availability: "https://schema.org/InStock",
        },
      };
      break;
    case "course":
      schema = {
        "@context": "https://schema.org",
        "@type": "Course",
        name: data.name || "",
        description: data.description || "",
        provider: ORG,
      };
      break;
    case "organization":
      schema = { "@context": "https://schema.org", ...ORG, sameAs: data.sameAs || [] };
      break;
    case "breadcrumb":
      schema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: (data.items || []).map((it, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: it.name,
          item: it.url,
        })),
      };
      break;
    default:
      return json({ error: "Ukjent schema-type." }, 400, origin);
  }

  const jsonld = `<script type="application/ld+json">\n${JSON.stringify(schema, null, 2)}\n</script>`;
  return json({ result: { schema, jsonld } }, 200, origin);
}

// =====================================================
// Publisering (Fase 2) — render artikkel til HTML + send til Make
// =====================================================
// Body: { article: {seoTitle, metaDescription, slug, h1, intro, sections, faq, cta}, lang }
// 1) Bygger en full LME-stilet HTML-side med JSON-LD (Article + FAQ).
// 2) Hvis env.MAKE_WEBHOOK_URL er satt: POSTer {slug, lang, seoTitle, html} dit,
//    slik at Make-scenarioet skriver fila til repoet (/blog/<slug>.html) og
//    Cloudflare Pages deployer den automatisk.
async function handlePublish(request, env, origin) {
  let body;
  try { body = await request.json(); }
  catch { return json({ error: "Ugyldig JSON" }, 400, origin); }

  const a = body.article || {};
  const lang = body.lang === "en" ? "en" : "no";
  if (!a.slug || !a.h1) {
    return json({ error: "Mangler artikkeldata (slug/h1)." }, 400, origin);
  }

  const html = renderArticleHTML(a, lang);

  let sent = false, makeStatus = null;
  if (env.MAKE_WEBHOOK_URL) {
    try {
      const r = await fetch(env.MAKE_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: a.slug,
          lang,
          seoTitle: a.seoTitle || a.h1,
          title: a.h1 || a.seoTitle || "",
          metaDescription: a.metaDescription || "",
          summary: a.intro || a.metaDescription || "",
          url: `https://lmexplorers.com/blog/${a.slug}`,
          html,
        }),
      });
      makeStatus = r.status;
      sent = r.ok;
    } catch (e) {
      makeStatus = "error";
    }
  }

  return json({ result: { slug: a.slug, html, sent, makeStatus } }, 200, origin);
}

function esc(s) {
  return String(s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function renderArticleHTML(a, lang) {
  const sections = (a.sections || []).map((s) => {
    const h3s = (s.h3 || []).map((h) => `      <h3>${esc(h)}</h3>`).join("\n");
    const body = esc(s.body || "").replace(/\n\n+/g, "</p>\n      <p>");
    return `    <section>\n      <h2>${esc(s.h2 || "")}</h2>\n      <p>${body}</p>\n${h3s}\n    </section>`;
  }).join("\n");

  const faqItems = (a.faq || []).map((f) =>
    `      <details><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`).join("\n");

  const articleSchema = {
    "@context": "https://schema.org", "@type": "Article",
    headline: a.h1 || a.seoTitle || "", description: a.metaDescription || "",
    author: { "@type": "Person", name: "Renate Dahl" },
    publisher: { "@type": "Organization", name: "Little Montessori Explorers",
      logo: "https://lmexplorers.com/images/lme-logo.png" },
    inLanguage: lang, datePublished: new Date().toISOString().slice(0, 10),
  };
  const faqSchema = (a.faq || []).length ? {
    "@context": "https://schema.org", "@type": "FAQPage",
    mainEntity: a.faq.map((f) => ({ "@type": "Question", name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a } })),
  } : null;

  const ld = [articleSchema, faqSchema].filter(Boolean)
    .map((s) => `<script type="application/ld+json">\n${JSON.stringify(s)}\n</script>`).join("\n");

  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(a.seoTitle || a.h1)}</title>
<meta name="description" content="${esc(a.metaDescription || "")}">
<link rel="canonical" href="https://lmexplorers.com/blog/${esc(a.slug)}">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Playpen+Sans:wght@400;600;700;800&display=swap');
  :root{--cerise:#E91E89;--ink:#1A1A1A;--ink-soft:#4A4A4A;--cream:#FBF6F0;}
  *{box-sizing:border-box;margin:0;padding:0;}
  body{font-family:'Playpen Sans',sans-serif;color:var(--ink);line-height:1.6;
    background:linear-gradient(180deg,#FDF5F1,#FBEAE9);}
  .wrap{max-width:760px;margin:0 auto;padding:48px 22px 80px;}
  a{color:var(--cerise);}
  h1{font-size:32px;line-height:1.2;margin-bottom:14px;}
  h2{font-size:23px;margin:32px 0 10px;}
  h3{font-size:18px;margin:18px 0 6px;color:var(--ink-soft);}
  p{margin-bottom:14px;color:var(--ink-soft);}
  .lead{font-size:18px;color:var(--ink);}
  details{background:#fff;border:1px solid rgba(26,26,26,.08);border-radius:14px;padding:14px 16px;margin-bottom:10px;}
  summary{font-weight:700;cursor:pointer;}
  .cta{display:inline-block;margin-top:24px;background:var(--cerise);color:#fff;font-weight:700;
    padding:14px 26px;border-radius:999px;}
  .brand{font-size:13px;color:#8A8A8A;margin-bottom:28px;}
</style>
${ld}
</head>
<body>
  <article class="wrap">
    <p class="brand">Little Montessori Explorers</p>
    <h1>${esc(a.h1)}</h1>
    <p class="lead">${esc(a.intro || "")}</p>
${sections}
${faqItems ? `    <section>\n      <h2>FAQ</h2>\n${faqItems}\n    </section>` : ""}
    ${a.cta ? `<a class="cta" href="${esc(a.cta.url || "/")}">${esc(a.cta.text || "Utforsk LME")}</a>` : ""}
  </article>
</body>
</html>`;
}
