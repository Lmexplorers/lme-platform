/**
 * AI-generering for LME Builder — Cloudflare Pages Function
 *
 * Erstatter den separate workeren (lme-proxy...workers.dev) som ga «Failed to
 * fetch». Kjører på samme domene som siden (/ai-generate), så ingen CORS og
 * ingen ekstra worker å vedlikeholde. Bruker samme ANTHROPIC_API_KEY som
 * Nathalie AI (settes i Pages → Settings → Variables and Secrets).
 *
 * Tar imot en Anthropic-stil forespørsel { system, messages, max_tokens } og
 * returnerer Anthropic sitt svar { content: [...] } slik byggeren forventer.
 */

import { sessionUser } from "./_lib/access.js";
import { logUsage, anthropicUnits } from "./_lib/ai-core/usage.js";

const MODEL = "claude-sonnet-5";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, X-LME-Key",
  "Access-Control-Max-Age": "86400",
};

function json(data, status) {
  return new Response(JSON.stringify(data), {
    status: status || 200,
    headers: { "Content-Type": "application/json", ...CORS },
  });
}

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS });
}

export async function onRequestPost(context) {
  const { request, env } = context;

  if (!env.ANTHROPIC_API_KEY) {
    return json({ error: "API-nøkkel mangler i Pages-innstillingene (ANTHROPIC_API_KEY)." }, 500);
  }

  // Innlogging kreves. Uten dette kunne hvem som helst som fant adressen bruke
  // plattformens Anthropic-nøkkel, siden ruten svarer på alle opphav
  // (Access-Control-Allow-Origin: *). LME Builder kaller alltid herfra med en
  // innlogget økt, så dette stenger ingen ekte bruker ute.
  const user = await sessionUser(context);
  if (!user) {
    return json({ error: "Logg inn for å bruke LME Builder." }, 401);
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

  const maxTokens = Math.min(Math.max(parseInt(body.max_tokens, 10) || 2000, 256), 4000);

  const t0 = Date.now();
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: maxTokens,
        system: typeof body.system === "string" ? body.system : "",
        messages: messages,
      }),
    });

    const data = await res.json().catch(() => null);

    await logUsage(env, {
      app: "builder", task: "text", modelId: MODEL, email: user.email,
      units: anthropicUnits(data), ms: Date.now() - t0,
      status: res.ok ? "ok" : "error", error: res.ok ? "" : "claude_" + res.status,
    });

    if (!res.ok) {
      let hint = "";
      if (res.status === 401) hint = "ugyldig API-nøkkel";
      else if (res.status === 402 || res.status === 403) hint = "ingen kreditt / tilgang på Anthropic-kontoen";
      else if (res.status === 429) hint = "for mange forespørsler — vent litt";
      else if (res.status === 404) hint = "modellen ble ikke funnet";
      const msg = (data && data.error && (data.error.message || data.error)) || ("Anthropic svarte " + res.status);
      return json({ error: msg, hint }, res.status);
    }

    // Pass gjennom Anthropic sitt content-array — byggeren leser data.content[].text
    return json({ content: data.content || [], usage: data.usage }, 200);
  } catch (err) {
    await logUsage(env, {
      app: "builder", task: "text", modelId: MODEL, email: user.email,
      ms: Date.now() - t0, status: "error", error: (err && err.message) || "network",
    });
    return json({ error: "Noe gikk galt mot Anthropic. Prøv igjen om litt." }, 502);
  }
}
