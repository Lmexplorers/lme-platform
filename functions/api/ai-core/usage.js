/**
 * LME AI Core, tall til kostnadssiden /ai-kostnader.
 *
 * Kun for eier. Leser forbruksloggen som functions/_lib/ai-core/usage.js
 * skriver, summerer den per app, bruker, leverandør, modell og innholdstype,
 * og returnerer den sammen med statusen til modellregisteret.
 *
 *   GET /api/ai-core/usage              -> inneværende måned
 *   GET /api/ai-core/usage?month=2026-07 -> en bestemt måned
 *
 * Ruten gjør ingen AI-kall og koster ingenting. Den leser bare metadata fra
 * KV-nøklene, altså ett oppslag per tusen loggede kall.
 */

import { sessionUser, isOwner } from "../../_lib/access.js";
import { readMonth, summarize } from "../../_lib/ai-core/usage.js";
import { registryStatus, PRICES_CHECKED } from "../../_lib/ai-core/registry.js";

function json(data, status) {
  return new Response(JSON.stringify(data), {
    status: status || 200,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

function currentMonth() {
  const d = new Date();
  return d.getUTCFullYear() + "-" + String(d.getUTCMonth() + 1).padStart(2, "0");
}

/** Siste tolv måneder, nyeste først, til nedtrekksmenyen på siden. */
function recentMonths(n) {
  const out = [];
  const d = new Date();
  for (let i = 0; i < n; i++) {
    out.push(d.getUTCFullYear() + "-" + String(d.getUTCMonth() + 1).padStart(2, "0"));
    d.setUTCMonth(d.getUTCMonth() - 1);
  }
  return out;
}

export async function onRequestGet(context) {
  const { request, env } = context;

  const user = await sessionUser(context);
  if (!user) return json({ error: "Logg inn for å se AI-kostnadene." }, 401);
  if (!isOwner(user)) return json({ error: "AI-kostnader er kun for eieren." }, 403);

  const url = new URL(request.url);
  const asked = String(url.searchParams.get("month") || "").trim();
  const month = /^\d{4}-\d{2}$/.test(asked) ? asked : currentMonth();

  const { rows, truncated } = await readMonth(env, month, 20000);
  const summary = summarize(rows);

  return json({
    month: month,
    months: recentMonths(12),
    truncated: truncated,
    pricesChecked: PRICES_CHECKED,
    summary: summary,
    registry: registryStatus(env),
  });
}
