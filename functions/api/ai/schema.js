import { sessionUser } from "../../_lib/access.js";
import { logUsage, anthropicUnits } from "../../_lib/ai-core/usage.js";
/**
 * LME Schema Generator — Cloudflare Pages Function
 *
 * Generates JSON-LD structured data for SEO and AI search engines.
 *
 *   POST /api/ai/schema   { type, data, lang }
 *        -> { jsonld: "..." }
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

const DEFAULT_MODEL = "claude-sonnet-5";
const CALL_TIMEOUT_MS = 20000;

async function callClaude(env, system, userPrompt, email) {
  const t0 = Date.now();
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
  await logUsage(env, {
    app: "schema", task: "text", modelId: env.CONTENT_TEXT_MODEL || DEFAULT_MODEL,
    email: email || "", units: anthropicUnits(data), ms: Date.now() - t0, status: "ok",
  });
  return (data.content || []).filter((b) => b.type === "text").map((b) => b.text).join("\n");
}

export async function onRequestPost(context) {
  const { request, env } = context;

  // Innlogging kreves. Ingen side i plattformen kaller denne ruten i dag
  // (AI Visibility-appen bruker den separate workeren, se
  // ai-visibility-worker.js), men ruten var likevel åpen og kunne bruke
  // plattformens Anthropic-nøkkel. Se docs/ai-core.md.
  const user = await sessionUser(context);
  if (!user) {
    return json({ error: "Logg inn for å bruke denne funksjonen.", jsonld: "" }, 401);
  }

  if (!env.ANTHROPIC_API_KEY) {
    return json({ error: "Server-konfigurasjon mangler", jsonld: "" }, 500);
  }

  let body;
  try {
    body = await request.json();
  } catch (e) {
    return json({ error: "Ugyldig JSON", jsonld: "" }, 400);
  }

  const type = String(body.type || "article").trim().toLowerCase();
  const lang = String(body.lang || "no");
  const data = body.data || {};

  if (!type || !["organization", "article", "faq", "product", "course", "breadcrumb"].includes(type)) {
    return json({ error: "Ukjent schema-type", jsonld: "" }, 400);
  }

  const systemInstr = lang === "en"
    ? `You are LME's JSON-LD schema generator. Generate valid JSON-LD structured data for Google, Pinterest and AI search engines.
Return ONLY valid JSON in this format: {"jsonld":"<script type=\"application/ld+json\">{...}</script>"}
The JSON-LD must be valid, complete, and optimized for search engines and AI indexing.`
    : `Du er LMEs JSON-LD schema-generator. Generer gyldig JSON-LD strukturerte data for Google, Pinterest og AI-søk.
Returner KUN gyldig JSON i dette formatet: {"jsonld":"<script type=\"application/ld+json\">{...}</script>"}
JSON-LD må være gyldig, komplett og optimalisert for søkemotorer og AI-indeksering.`;

  const prompts = {
    organization: lang === "en"
      ? `Generate Organization schema for: Little Montessori Explorers (LME), a bilingual (Norwegian/English) AI-powered platform founded by Renate Dahl. Focus on: creativity, learning, visibility and growth. Social profiles: ${data.sameAs ? JSON.stringify(data.sameAs) : ""}. Include contact and logo.`
      : `Generer Organization schema for: Little Montessori Explorers (LME), en tospråklig (norsk/engelsk) AI-drevet plattform grunnlagt av Renate Dahl. Fokus: kreativitet, læring, synlighet og vekst. Sosiale profiler: ${data.sameAs ? JSON.stringify(data.sameAs) : ""}. Inkluder kontakt og logo.`,

    article: lang === "en"
      ? `Generate Article schema for: Title: "${data.h1 || ''}", Meta description: "${data.metaDescription || ''}". Include author (Renate Dahl), datePublished, dateModified, keywords, and language: ${data.lang || 'en'}.`
      : `Generer Article schema for: Tittel: "${data.h1 || ''}", Meta-beskrivelse: "${data.metaDescription || ''}". Inkluder forfatter (Renate Dahl), datePublished, dateModified, nøkkelord, og språk: ${data.lang || 'no'}.`,

    faq: lang === "en"
      ? `Generate FAQPage schema from these Q&A pairs: ${JSON.stringify(data.faq || [])}. Ensure each question and answer is properly formatted.`
      : `Generer FAQPage schema fra disse spørsmål-og-svar-parene: ${JSON.stringify(data.faq || [])}. Sikre at hvert spørsmål og svar er riktig formatert.`,

    product: lang === "en"
      ? `Generate Product schema for: Name: "${data.name || ''}", Description: "${data.description || ''}", Price: "${data.price || ''}", Currency: "${data.currency || 'NOK'}". Include availability, rating, and reviews if available.`
      : `Generer Product schema for: Navn: "${data.name || ''}", Beskrivelse: "${data.description || ''}", Pris: "${data.price || ''}", Valuta: "${data.currency || 'NOK'}". Inkluder tilgjengelighet, vurdering og anmeldelser hvis tilgjengelig.`,

    course: lang === "en"
      ? `Generate Course schema for: Name: "${data.name || ''}", Description: "${data.description || ''}", Provider: LME (Renate Dahl). Include learningResourceType, educationalLevel, and language.`
      : `Generer Course schema for: Navn: "${data.name || ''}", Beskrivelse: "${data.description || ''}", Provider: LME (Renate Dahl). Inkluder learningResourceType, educationalLevel, og språk.`,

    breadcrumb: lang === "en"
      ? `Generate BreadcrumbList schema from these items: ${JSON.stringify(data.items || [])}. Include position and URL for each item.`
      : `Generer BreadcrumbList schema fra disse elementer: ${JSON.stringify(data.items || [])}. Inkluder posisjon og URL for hvert element.`,
  };

  const userPrompt = prompts[type] || "";

  try {
    const result = await callClaude(env, systemInstr, userPrompt, user.email);
    let parsed = { jsonld: "" };
    try {
      const match = result.match(/\{[\s\S]*\}/);
      if (match) {
        parsed = JSON.parse(match[0]);
      }
    } catch (e) {
      // fallback: return raw result wrapped in script tag
      parsed = { jsonld: `<script type="application/ld+json">${result}</script>` };
    }
    return json({ jsonld: parsed.jsonld || "" }, 200);
  } catch (err) {
    return json({ error: "Schema-generering mislyktes", jsonld: "" }, 502);
  }
}
