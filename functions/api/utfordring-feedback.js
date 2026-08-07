/**
 * 10 000-visninger-utfordringen — direkte AI-tilbakemelding.
 *
 * Gir betalende medlemmer konkret AI-tilbakemelding på en hook, bio eller
 * et helt innlegg de limer inn selv, med en gang. Samme "direct feedback"
 * konkurrerende utfordringer selger som en egen (manuell) modul, her
 * automatisert. Samme mønster som functions/api/ai/faq.js for selve
 * Claude-kallet (ANTHROPIC_API_KEY, ingen ny hemmelighet trengs).
 *
 * Krever medlemskap (utf_member:<e-post>), akkurat som å poste eller
 * kommentere i fellesskapet (utfordring-community.js).
 *
 *   POST /api/utfordring-feedback { email, text, kind, lang }
 *        -> { feedback: "..." }
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

async function callClaude(env, system, userPrompt) {
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
        max_tokens: 700,
        thinking: { type: "disabled" },
        system,
        messages: [{ role: "user", content: userPrompt }],
      }),
    });
  } catch (e) {
    throw new Error(e && e.name === "AbortError" ? "Anthropic svarte for sakte" : "nettverksfeil mot Anthropic");
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

const KIND_LABEL = {
  no: { hook: "en åpningssetning (hook)", bio: "en bio", post: "et helt innlegg" },
  en: { hook: "an opening line (a hook)", bio: "a bio", post: "a full post" },
};

export async function onRequestPost(context) {
  const { request, env } = context;
  if (!env.ANTHROPIC_API_KEY) return json({ error: "not_configured" }, 500);
  if (!env.BUILDER_KV) return json({ error: "not_configured" }, 500);

  let body;
  try { body = await request.json(); } catch (e) { return json({ error: "bad_request" }, 400); }

  const email = ((body.email || "") + "").trim().toLowerCase();
  const text = ((body.text || "") + "").trim().slice(0, 1500);
  const kind = ["hook", "bio", "post"].indexOf(body.kind) !== -1 ? body.kind : "post";
  const lang = body.lang === "en" ? "en" : "no";

  if (!email) return json({ error: "not_member" }, 403);
  const member = await env.BUILDER_KV.get("utf_member:" + email);
  if (!member) return json({ error: "not_member" }, 403);
  if (!text) return json({ error: "empty" }, 400);

  const label = KIND_LABEL[lang][kind];
  const system = lang === "en"
    ? 'You give direct, warm, concrete feedback on social media content for participants in LME\'s 10,000 Views Challenge (a 30-day content creation challenge for parents and creators). You are Renate, LME\'s founder, speaking in first person ("I"). Be specific and practical, never generic. Structure your answer as: one sentence on what\'s already working, then two or three concrete, actionable suggestions to improve it. Keep the whole answer under 120 words. No markdown headers, plain warm text only.'
    : 'Du gir direkte, varm og konkret tilbakemelding på sosiale medier-innhold til deltakere i LMEs 10 000-visninger-utfordring (en 30-dagers innholdsutfordring for foreldre og skapere). Du er Renate, grunnleggeren av LME, og skriver i jeg-form. Vær spesifikk og praktisk, aldri generisk. Strukturer svaret som: én setning om hva som allerede fungerer, deretter to eller tre konkrete, gjennomførbare forslag til forbedring. Hold hele svaret under 120 ord. Ingen markdown-overskrifter, bare varm løpende tekst.';

  const userPrompt = lang === "en"
    ? 'Give feedback on this ' + label + ' for the challenge:\n\n"' + text + '"'
    : 'Gi tilbakemelding på ' + label + ' til utfordringen:\n\n"' + text + '"';

  try {
    const feedback = await callClaude(env, system, userPrompt);
    return json({ feedback: feedback.trim() }, 200);
  } catch (err) {
    return json({ error: "feedback_failed" }, 502);
  }
}
