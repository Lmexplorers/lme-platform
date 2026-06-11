/**
 * MailerLite-proxy — Cloudflare Pages Function
 *
 * Henter ekte data fra MailerLite uten å eksponere API-nøkkelen i nettleseren.
 * Ruter: /api/mailerlite/automations · /api/mailerlite/campaigns · /api/mailerlite/stats
 *
 * ENGANGS-OPPSETT (Cloudflare):
 *   Workers & Pages → Pages-prosjektet → Settings → Variables and Secrets:
 *     Name:  MAILERLITE_API_KEY
 *     Value: <API-nøkkel fra MailerLite → Integrations → API>
 *   Legg den til for både Production OG Preview, og redeploy (eller push).
 */

const ML = "https://connect.mailerlite.com/api";

function json(data, status) {
  return new Response(JSON.stringify(data), {
    status: status || 200,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

const ENDPOINTS = {
  automations: "/automations?limit=50",
  campaigns: "/campaigns?limit=25",
  stats: "/subscribers?limit=1",
};

export async function onRequestGet(context) {
  const { env, params } = context;
  const key = env.MAILERLITE_API_KEY;

  if (!key) {
    return json(
      { error: "not_configured", message: "MAILERLITE_API_KEY er ikke satt i Cloudflare-innstillingene." },
      200
    );
  }

  const seg = Array.isArray(params.resource) ? params.resource[0] : params.resource;
  const endpoint = ENDPOINTS[seg];
  if (!endpoint) return json({ error: "unknown_resource" }, 404);

  try {
    const res = await fetch(ML + endpoint, {
      headers: { Authorization: "Bearer " + key, Accept: "application/json" },
    });
    const body = await res.json();
    if (!res.ok) {
      return json({ error: "mailerlite_error", status: res.status, body }, 200);
    }
    return json(body, 200);
  } catch (e) {
    return json({ error: "fetch_failed", message: String(e) }, 200);
  }
}
