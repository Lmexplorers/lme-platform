/**
 * LME Autopilot, engangskjøp: hva det koster og hva det gir.
 *
 *   GET /api/app-kjop  ->  { ok, tilbud, eier, harApp }
 *
 * Salgssiden (/autopilot-app) henter teksten og prisen herfra i stedet for
 * å ha sin egen kopi, så prisen aldri kan sprike mellom siden og det Vipps
 * faktisk trekker.
 *
 * Svaret sier også om DU er eier, og om den innloggede alt har kjøpt appen.
 * Eieren skal aldri møte en kjøpsknapp for sitt eget produkt (CLAUDE.md),
 * og den som alt har kjøpt, skal ikke kunne kjøpe to ganger.
 */
import { sessionUser, isOwner } from "../_lib/access.js";
import { APP_KJOP } from "../_lib/app-kjop.js";

function json(data, status) {
  return new Response(JSON.stringify(data), {
    status: status || 200,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

export async function onRequestGet(context) {
  const { env } = context;
  const svar = { ok: true, tilbud: APP_KJOP, eier: false, harApp: false, loggedIn: false };
  if (!env.BUILDER_KV) return json(svar);

  const bruker = await sessionUser(context);
  if (!bruker) return json(svar);
  svar.loggedIn = true;

  if (isOwner(bruker)) {
    svar.eier = true;
    svar.harApp = true;
    return json(svar);
  }

  /* Kjøpet står på member-posten, samme sted abonnementet ligger, og det er
     den posten Autopilot-appen leser. */
  try {
    const raw = await env.BUILDER_KV.get("member:" + (bruker.email || "").trim().toLowerCase());
    if (raw) {
      const rec = JSON.parse(raw);
      svar.harApp = !!(rec && rec.appKjopt);
    }
  } catch (e) {}
  return json(svar);
}
