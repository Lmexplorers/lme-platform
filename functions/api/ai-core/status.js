/**
 * LME AI Core, driftsstatus.
 *
 *   GET /api/ai-core/status
 *
 * Svarer på "hva virker akkurat nå": hvilke leverandører som er satt opp,
 * hvilken modell som blir brukt til hver oppgavetype, hvilke reserver som
 * står bak den, og om noen strømbryter har slått ut etter gjentatte feil.
 *
 * Kun for eier. Ikke fordi tallene er hemmelige, men fordi listen forteller
 * hvilke leverandører plattformen er avhengig av, og det er unødvendig å
 * kringkaste. Nøkkelverdier vises aldri, kun om nøkkelen finnes.
 *
 * Ruten gjør ingen AI-kall og koster ingenting.
 */

import { sessionUser, isOwner } from "../../_lib/access.js";
import { registryStatus, PROVIDERS, PRICES_CHECKED } from "../../_lib/ai-core/registry.js";
import { pick, knownTasks, orphanModels } from "../../_lib/ai-core/router.js";
import { breakerStatus } from "../../_lib/ai-core/breaker.js";

function json(data, status) {
  return new Response(JSON.stringify(data), {
    status: status || 200,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

export async function onRequestGet(context) {
  const { env } = context;

  const user = await sessionUser(context);
  if (!user) return json({ error: "Logg inn for å se AI-statusen." }, 401);
  if (!isOwner(user)) return json({ error: "AI-statusen er kun for eieren." }, 403);

  const routes = {};
  for (const task of knownTasks()) {
    const route = await pick(env, task, {});
    routes[task] = {
      primary: route.models.length ? route.models[0].id : null,
      fallbacks: route.models.slice(1).map((m) => m.id),
      skipped: route.skipped,
      degraded: route.degraded,
    };
  }

  return json({
    pricesChecked: PRICES_CHECKED,
    registry: registryStatus(env),
    routes: routes,
    breakers: await breakerStatus(env, Object.keys(PROVIDERS)),
    // Modeller registeret kjenner, men ingen kjede peker på. Ikke en feil,
    // men greit å se: det er her et modellnavn blir liggende igjen etter at
    // en app har byttet.
    ubrukteModeller: orphanModels(),
  });
}
