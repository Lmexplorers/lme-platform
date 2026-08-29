/**
 * Engangsoppsett: registrerer Vipps-webhooken (dette nettstedets adresse
 * for /api/vipps-webhook) hos Vipps, og gir tilbake en hemmelig nøkkel
 * som må lagres som VIPPS_WEBHOOK_SECRET (Cloudflare Pages -> Settings
 * -> Variables and secrets), ellers kan ikke webhooken bekrefte at
 * kallene faktisk kommer fra Vipps.
 *
 * GET /api/vipps-register-webhook?pw=<COURSE_EDIT_PASSWORD>
 *   -> { ok: true, id, secret } eller { error: "..." }
 *
 * Trygt å kjøre flere ganger, men NB: hver kjøring lager et NYTT
 * abonnement med en NY hemmelig nøkkel hos Vipps (de har ikke et
 * "oppdater eksisterende" endepunkt for dette), så husk å oppdatere
 * VIPPS_WEBHOOK_SECRET til den ferskeste verdien hver gang du kjører den.
 */
import { registerVippsWebhook } from "../_lib/vipps.js";
import { DEFAULT_PASSWORD } from "./laeringsverksted.js";
import { editPasswordOk } from "../_lib/edit-password.js";

function json(data, status) {
  return new Response(JSON.stringify(data), {
    status: status || 200,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

export async function onRequestGet(context) {
  const { request, env } = context;
  if (!env.VIPPS_CLIENT_ID) return json({ error: "vipps_not_configured" }, 503);

  const url = new URL(request.url);
  const pw = (url.searchParams.get("pw") || "").trim();
  if (!editPasswordOk(env, pw, [DEFAULT_PASSWORD])) return json({ error: "bad_password" }, 401);

  const callbackUrl = url.origin + "/api/vipps-webhook";
  const result = await registerVippsWebhook(env, callbackUrl, ["epayments.payment.authorized.v1"]);
  return json(result, result.ok ? 200 : 502);
}
