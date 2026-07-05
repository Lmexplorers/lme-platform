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
- Avslutt med en relevant CTA til riktig LME-område (Akademiet/Biblioteket/Butikk/Inner Circle).

NORSKE SKRIVEREGLER (følg ALLTID i norsk tekst, dette er kritisk og rettes ellers manuelt):
- Bruk rette anførselstegn ("..."), aldri vinkeltegn « ». Apostrof: '.
- Bruk ALDRI lange bindestreker eller tankestreker (— eller –) i løpende tekst. Bruk komma, kolon, punktum eller "og". Ved tallintervall: kort bindestrek (for eksempel 3-6 år).
- Kolon: stor forbokstav etter kolon KUN når en hel setning følger. Ved oppramsing, undertittel eller setningsfragment: liten forbokstav. Hel setning: "Husk: Du trenger ikke være ekspert." Fragment: "Praktisk liv: der alt starter."
- Liten forbokstav etter semikolon.
- Norske kommaregler: komma foran "men", "for" og "så" når de binder to helsetninger; komma etter en innledende leddsetning; komma rundt innskutte setninger; ikke komma foran siste "og" i en oppramsing.`;

// =====================================================
// CORS — godtar alle LME-egne adresser (med/uten www + Pages-forhåndsvisninger)
// =====================================================
const ALLOWED_SUFFIXES = [
  "lmexplorers.com",
  "littlemontessoriexplorers.com",
  "lme-plattform.pages.dev",
];

function isAllowedOrigin(origin) {
  try {
    const host = new URL(origin).hostname;
    if (host === "localhost" || host === "127.0.0.1") return true;
    return ALLOWED_SUFFIXES.some((s) => host === s || host.endsWith("." + s));
  } catch {
    return false;
  }
}

function corsHeaders(origin) {
  const allowed = isAllowedOrigin(origin) ? origin : "https://lmexplorers.com";
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

    // Helsesjekk: åpne worker-URL-en i nettleseren (GET) for å se hva som mangler.
    if (request.method === "GET" && (url.pathname === "/" || url.pathname === "/ping")) {
      return handlePing(env, origin);
    }

    if (request.method !== "POST") {
      return new Response("Method not allowed", { status: 405, headers: corsHeaders(origin) });
    }

    // Blotato: autopublisering til sosiale medier. Trenger ikke Anthropic-nøkkel,
    // så disse rutene ligger før sjekken under.
    if (url.pathname === "/ai/blotato/accounts") {
      return handleBlotatoAccounts(env, origin);
    }
    if (url.pathname === "/ai/blotato/publish") {
      return handleBlotatoPublish(request, env, origin);
    }

    if (!env.ANTHROPIC_API_KEY) {
      return json({ error: "Server-konfigurasjon mangler (ANTHROPIC_API_KEY)." }, 500, origin);
    }

    // Schema-generering er ren JS — trenger ikke AI.
    if (url.pathname === "/ai/schema") {
      return handleSchema(request, origin);
    }

    // Publisering: render artikkel -> HTML og commit rett til GitHub (Fase 2).
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
// Helsesjekk — GET worker-URL i nettleseren for å se hva som mangler
// =====================================================
async function handlePing(env, origin) {
  const out = {
    worker: "lme-ai-visibility",
    hasAnthropicKey: !!env.ANTHROPIC_API_KEY,
    hasGithubToken: !!env.GITHUB_TOKEN,
    hasMailerlite: !!(env.MAILERLITE_TOKEN && env.MAILERLITE_GROUP_ID),
    hasBlotato: !!env.BLOTATO_API_KEY,
    anthropic: env.ANTHROPIC_API_KEY ? "tester…" : "MANGLER nøkkel",
  };
  if (env.ANTHROPIC_API_KEY) {
    try {
      const r = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": env.ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 8,
          messages: [{ role: "user", content: "hi" }],
        }),
      });
      out.anthropic = r.ok ? "OK ✓" : `feil ${r.status}: ${(await r.text()).slice(0, 180)}`;
    } catch (e) {
      out.anthropic = "exception: " + String(e).slice(0, 150);
    }
  }
  return json(out, 200, origin);
}

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
      model: "claude-sonnet-4-6",
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
 "sections":[{"h2":"...","body":"2-4 avsnitt ren tekst. IKKE markdown (ingen ** og ingen - lister). Foelg de norske skrivereglene.","h3":["valgfrie underpunkter"]}],
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
// Publisering (Fase 2) — alt i Cloudflare, ingen mellomledd
// =====================================================
// Body: { article: {seoTitle, metaDescription, slug, h1, intro, sections, faq, cta}, lang }
// 1) Bygger en full LME-stilet HTML-side med JSON-LD (Article + FAQ).
// 2) Committer den rett til repoet via GitHub Contents API -> Cloudflare Pages
//    deployer automatisk. Krever Worker-secret GITHUB_TOKEN (Contents: R/W).
//    Valgfritt: GITHUB_REPO (default Lmexplorers/lme-platform), GITHUB_BRANCH (default main).
// 3) Valgfritt: sender et MailerLite-kampanjeutkast direkte hvis MAILERLITE_TOKEN
//    og MAILERLITE_GROUP_ID er satt. Ingen Make, ingen webhook.
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
  const path = `blog/${a.slug}.html`;
  const url = `https://lmexplorers.com/${path.replace(/\.html$/, "")}`;

  // 1) Commit rett til GitHub (utløser Pages-deploy)
  let published = false, githubStatus = null;
  if (env.GITHUB_TOKEN) {
    const repo = env.GITHUB_REPO || "Lmexplorers/lme-platform";
    const branch = env.GITHUB_BRANCH || "main";
    const api = `https://api.github.com/repos/${repo}/contents/${path}`;
    const gh = {
      "Authorization": `Bearer ${env.GITHUB_TOKEN}`,
      "Accept": "application/vnd.github+json",
      "User-Agent": "LME-AI-Visibility",
      "Content-Type": "application/json",
    };
    try {
      // Finn eksisterende sha (for oppdatering); 404 = ny fil
      let sha;
      const head = await fetch(`${api}?ref=${branch}`, { headers: gh });
      if (head.ok) sha = (await head.json()).sha;

      const put = await fetch(api, {
        method: "PUT",
        headers: gh,
        body: JSON.stringify({
          message: `AI Visibility: artikkel ${a.slug} (${lang})`,
          branch,
          content: b64utf8(html),
          ...(sha ? { sha } : {}),
        }),
      });
      githubStatus = put.status;
      published = put.ok;
    } catch (e) {
      githubStatus = "error";
    }
  }

  // 2) Valgfritt: MailerLite-kampanjeutkast direkte fra workeren
  let mailStatus = null;
  if (env.MAILERLITE_TOKEN && env.MAILERLITE_GROUP_ID) {
    try {
      const r = await fetch("https://connect.mailerlite.com/api/campaigns", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${env.MAILERLITE_TOKEN}`,
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({
          name: `AI Visibility: ${a.seoTitle || a.h1}`,
          type: "regular",
          groups: [env.MAILERLITE_GROUP_ID],
          emails: [{
            subject: a.seoTitle || a.h1,
            from_name: "Little Montessori Explorers",
            from: env.MAILERLITE_FROM || "post@lmexplorers.com",
            content: `<h1>${esc(a.h1)}</h1><p>${esc(a.intro || "")}</p><p><a href="${url}">Les hele artikkelen</a></p>`,
          }],
        }),
      });
      mailStatus = r.status; // utkast opprettes; sending skjer manuelt i MailerLite
    } catch (e) {
      mailStatus = "error";
    }
  }

  return json({ result: { slug: a.slug, url, html, published, githubStatus, mailStatus } }, 200, origin);
}

// =====================================================
// Blotato — autopublisering til sosiale medier
// Nøkkelen (BLOTATO_API_KEY) ligger som hemmelig variabel på selve workeren,
// aldri i nettsiden. Klienten bygger den ferdige "post"-en (kontoID, innhold,
// mål-plattform), og workeren legger bare på nøkkelen og videresender til Blotato.
// =====================================================
const BLOTATO_BASE = "https://backend.blotato.com/v2";

async function handleBlotatoAccounts(env, origin) {
  if (!env.BLOTATO_API_KEY) {
    return json({ error: "Blotato er ikke koblet til ennå (BLOTATO_API_KEY mangler på workeren)." }, 400, origin);
  }
  try {
    const r = await fetch(`${BLOTATO_BASE}/accounts`, {
      headers: { "blotato-api-key": env.BLOTATO_API_KEY, "Accept": "application/json" },
    });
    const text = await r.text();
    let data; try { data = JSON.parse(text); } catch { data = text; }
    if (!r.ok) return json({ error: `Blotato svarte ${r.status}.`, detail: data }, 502, origin);
    return json({ result: data }, 200, origin);
  } catch (e) {
    return json({ error: "Kom ikke i kontakt med Blotato." }, 502, origin);
  }
}

async function handleBlotatoPublish(request, env, origin) {
  if (!env.BLOTATO_API_KEY) {
    return json({ error: "Blotato er ikke koblet til ennå (BLOTATO_API_KEY mangler på workeren)." }, 400, origin);
  }
  let body;
  try { body = await request.json(); }
  catch { return json({ error: "Ugyldig JSON" }, 400, origin); }

  const items = Array.isArray(body.items) ? body.items : [];
  if (!items.length) return json({ error: "Ingen innlegg å publisere." }, 400, origin);
  if (items.length > 12) return json({ error: "Maks 12 innlegg om gangen." }, 400, origin);

  const results = [];
  for (const it of items) {
    const label = (it && it.label)
      || (it && it.post && it.post.target && it.post.target.targetType)
      || "?";
    if (!it || !it.post || !it.post.accountId || !it.post.target) {
      results.push({ label, ok: false, status: 0, error: "Mangler kontoID eller mål-plattform." });
      continue;
    }
    const payload = { post: it.post };
    if (it.scheduledTime) payload.scheduledTime = it.scheduledTime;
    try {
      const r = await fetch(`${BLOTATO_BASE}/posts`, {
        method: "POST",
        headers: {
          "blotato-api-key": env.BLOTATO_API_KEY,
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify(payload),
      });
      const text = await r.text();
      let data; try { data = JSON.parse(text); } catch { data = text; }
      const id = data && (data.id || (data.submission && data.submission.id));
      results.push({ label, ok: r.ok, status: r.status, id, detail: r.ok ? undefined : data });
    } catch (e) {
      results.push({ label, ok: false, status: 0, error: "Nettverksfeil mot Blotato." });
    }
  }
  return json({ result: { results } }, 200, origin);
}

// Base64 av UTF-8-streng i Workers (uten å sprenge call-stacken på store HTML-er)
function b64utf8(str) {
  const bytes = new TextEncoder().encode(str);
  let bin = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    bin += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk));
  }
  return btoa(bin);
}

function esc(s) {
  return String(s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// Gjoer om markdown/streker/« » til ren HTML (sikkerhetsnett uansett hva modellen skriver).
function mdClean(raw) {
  let t = esc(raw || "");
  t = t.replace(/«|»/g, '"');
  t = t.replace(/(\d)\s*[–—]\s*(\d)/g, "$1-$2").replace(/ [–—] /g, ", ").replace(/[–—]/g, "-");
  t = t.replace(/\*\*([^*\n]+?)\*\*/g, "<strong>$1</strong>");
  t = t.replace(/\*([^*\n]+?)\*/g, "<em>$1</em>");
  const lines = t.split("\n");
  let out = [], inList = false, para = [];
  const flush = () => { if (para.length) { out.push("<p>" + para.join(" ") + "</p>"); para = []; } };
  for (const ln of lines) {
    const m = ln.match(/^\s*-\s+(.*)$/);
    if (m) { flush(); if (!inList) { out.push("<ul>"); inList = true; } out.push("<li>" + m[1].trim() + "</li>"); }
    else if (ln.trim()) { para.push(ln.trim()); }
    else { if (inList) { out.push("</ul>"); inList = false; } flush(); }
  }
  if (inList) out.push("</ul>");
  flush();
  return out.join("\n      ");
}

function renderArticleHTML(a, lang) {
  const sections = (a.sections || []).map((s) => {
    const h3s = (s.h3 || []).map((h) => `      <h3>${esc(h)}</h3>`).join("\n");
    const body = mdClean(s.body);
    return `    <section>\n      <h2>${esc(s.h2 || "")}</h2>\n      ${body}\n${h3s}\n    </section>`;
  }).join("\n");

  const faqItems = (a.faq || []).map((f) =>
    `      <details><summary>${esc(f.q)}</summary>${mdClean(f.a)}</details>`).join("\n");

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
  /* LAAST FONTREGEL: Playpen Sans = KUN overskrifter. Sasson Montessori = all annen tekst. Aldri avvik. */
  @import url('https://fonts.googleapis.com/css2?family=Playpen+Sans:wght@400;500;600;700;800&display=swap');
  @font-face{font-family:'Sasson Montessori';
    src:url('/fonts/SassoonMontessori.woff2') format('woff2'),
        url('/fonts/SassoonMontessori.ttf') format('truetype');font-display:swap;}
  :root{--cerise:#E91E89;--ink:#1A1A1A;--ink-soft:#4A4A4A;--cream:#FBF6F0;
    --font-head:'Playpen Sans',system-ui,sans-serif;
    --font-body:'Sasson Montessori','Playpen Sans',system-ui,sans-serif;}
  *{box-sizing:border-box;margin:0;padding:0;}
  body{font-family:var(--font-body);color:var(--ink);line-height:1.6;
    background:linear-gradient(180deg,#FDF5F1,#FBEAE9);}
  h1,h2,h3,h4,h5,h6{font-family:var(--font-head);}
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
