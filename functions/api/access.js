/**
 * GET /api/access
 * Returnerer { loggedIn, active, plan, limits } for den innloggede brukeren,
 * basert på økten og Stripe-abonnementet (member:<e-post>). Brukes av
 * klient-låsen js/lme-gate.js for å låse betalte verktøy.
 */
import { getAccess } from "../_lib/access.js";

function json(data, status) {
  return new Response(JSON.stringify(data), {
    status: status || 200,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

export async function onRequestGet(context) {
  try {
    return json(await getAccess(context));
  } catch (e) {
    // Fail-open: aldri lås ute en ekte bruker på grunn av en teknisk feil.
    return json({ loggedIn: false, active: false, plan: null, limits: null, error: "unavailable" });
  }
}
