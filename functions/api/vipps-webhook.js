/**
 * Vipps-webhook: bekrefter at et varsel faktisk kommer fra Vipps, og
 * leverer kjøpet.
 *
 *   POST /api/vipps-webhook
 *
 * Selve leveringen ligger i _lib/vipps-lever.js, delt med
 * /api/vipps-status, som leverer det samme kjøpet hvis dette varselet
 * aldri når fram. Et kjøp leveres uansett bare én gang.
 *
 * Registreres hos Vipps med vipps-register-webhook.js (kjøres én gang),
 * som gir en hemmelig nøkkel (VIPPS_WEBHOOK_SECRET) brukt til å bekrefte
 * at kallet faktisk kommer fra Vipps og ikke er forfalsket, se
 * verifyVippsWebhookSignature i _lib/vipps.js.
 */
import { verifyVippsWebhookSignature } from "../_lib/vipps.js";
import { leverVippsOrdre } from "../_lib/vipps-lever.js";

function json(data, status) {
  return new Response(JSON.stringify(data), {
    status: status || 200,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

// Hendelsene som faktisk betyr "kunden har godkjent betalingen i appen,
// pengene er reservert, lever varen nå". Andre hendelser (created,
// aborted, expired, cancelled) ignoreres, de betyr ikke et fullført kjøp.
const FULFILL_ON_EVENTS = new Set(["epayments.payment.authorized.v1"]);

export async function onRequestPost(context) {
  const { request, env } = context;
  if (!env.BUILDER_KV) return json({ ok: true, ignorert: "not_configured" });

  const rawBody = await request.text();
  const validSig = await verifyVippsWebhookSignature(request, rawBody, env.VIPPS_WEBHOOK_SECRET);
  if (!validSig) return json({ error: "invalid_signature" }, 401);

  let event;
  try {
    event = JSON.parse(rawBody);
  } catch (e) {
    return json({ error: "bad_json" }, 400);
  }

  const eventName = event && event.name;
  const reference = event && (event.reference || (event.data && event.data.reference));
  if (!reference) return json({ ok: true, ignorert: "mangler referanse" });
  if (!FULFILL_ON_EVENTS.has(eventName)) return json({ ok: true, ignorert: eventName || "ukjent hendelse" });

  const svar = await leverVippsOrdre(env, reference);
  /* Feilet det å trekke pengene, svarer vi 502. Da prøver Vipps igjen
     senere, i stedet for å regne varselet som ferdig behandlet. */
  if (!svar.ok) return json({ ok: false, error: svar.resultat, detail: svar.detail }, 502);
  return json({ ok: true, resultat: svar.resultat });
}
