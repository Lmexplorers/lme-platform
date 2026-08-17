/**
 * LME AI Core, kunnskapsindeksen til Nathalie.
 *
 *   GET  /api/ai-core/knowledge          -> status: når den ble bygget, hvor mye
 *   GET  /api/ai-core/knowledge?q=...    -> prøvesøk, så du kan se hva hun finner
 *   POST /api/ai-core/knowledge          -> bygg indeksen på nytt
 *
 * Kun for eier. Byggingen leser Kursbygger-kursene fra KV og henter
 * kurssidene i akademiet fra samme domene, så den tar noen sekunder og bør
 * kjøres når kursinnhold er endret, ikke ved hvert besøk.
 *
 * Ruten gjør ingen AI-kall og koster ingenting hos leverandørene.
 */

import { sessionUser, isOwner } from "../../_lib/access.js";
import { buildIndex, readIndex, searchIndex } from "../../_lib/ai-core/knowledge.js";

function json(data, status) {
  return new Response(JSON.stringify(data), {
    status: status || 200,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

async function requireOwner(context) {
  const user = await sessionUser(context);
  if (!user) return { error: json({ error: "Logg inn for å se kunnskapsindeksen." }, 401) };
  if (!isOwner(user)) return { error: json({ error: "Kunnskapsindeksen er kun for eieren." }, 403) };
  return { user: user };
}

export async function onRequestGet(context) {
  const { request, env } = context;
  const gate = await requireOwner(context);
  if (gate.error) return gate.error;

  const index = await readIndex(env);
  if (!index) return json({ ok: true, built: false, chunks: 0 });

  const q = new URL(request.url).searchParams.get("q");
  if (q) {
    return json({
      ok: true, built: true, query: q,
      builtAt: index.builtAt, chunks: index.chunks.length,
      hits: searchIndex(index, q, { topK: 5 }),
    });
  }

  return json({
    ok: true, built: true,
    builtAt: index.builtAt,
    chunks: index.chunks.length,
    sources: index.sources || null,
    // Hvilke kurs som faktisk kom med, så det er lett å se hva som mangler.
    titles: Array.from(new Set(index.chunks.map((c) => c.t))).sort(),
  });
}

export async function onRequestPost(context) {
  const { request, env } = context;
  const gate = await requireOwner(context);
  if (gate.error) return gate.error;

  const origin = new URL(request.url).origin;
  const result = await buildIndex(env, origin);
  return json(result, result.ok ? 200 : 500);
}
