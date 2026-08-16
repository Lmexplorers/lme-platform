/**
 * LME AI Core, prislisten sidene leser.
 *
 *   GET /api/ai-core/prices   -> { ok, prices: { "<nøkkel>": { amount, unit, nok, text } } }
 *
 * Åpen med vilje. Dette er butikkvinduet, ikke et hemmelig tall: en pris
 * skal kunne vises før noen logger inn, ellers må folk lage en konto for å
 * finne ut hva noe koster. Ingen nøkler, ingen brukerdata, ingen AI-kall.
 *
 * Mellomlagres i en time, siden prisene endres sjelden og hver side spør.
 */

import { priceList } from "../../_lib/ai-core/prices.js";

export async function onRequestGet() {
  return new Response(JSON.stringify({ ok: true, prices: priceList() }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
