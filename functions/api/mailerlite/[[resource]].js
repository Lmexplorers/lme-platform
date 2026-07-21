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

/* POST /api/mailerlite/subscribe — melder en lead inn i e-postlisten.
   Brukes av tripwire-funnelens opt-in-skjema (funnel/tripwire/opt-in.html).
   Tar imot både JSON og skjema-data: { email, name, lang }.
   Grupper: sett gjerne hemmeligheten MAILERLITE_FUNNEL_GROUP til en
   gruppe-ID i MailerLite, saa havner leads i riktig gruppe. */
export async function onRequestPost(context) {
  const { request, env, params } = context;
  const seg = Array.isArray(params.resource) ? params.resource[0] : params.resource;
  if (seg !== "subscribe") return json({ error: "unknown_resource" }, 404);

  const key = env.MAILERLITE_API_KEY;
  if (!key) return json({ error: "not_configured" }, 200);

  let email = "", name = "", lang = "", tag = "";
  try {
    const ct = request.headers.get("Content-Type") || "";
    if (ct.indexOf("application/json") !== -1) {
      const b = await request.json();
      email = (b.email || "") + ""; name = (b.name || "") + ""; lang = (b.lang || "") + ""; tag = (b.tag || "") + "";
    } else {
      const form = new URLSearchParams(await request.text());
      email = form.get("email") || ""; name = form.get("name") || ""; lang = form.get("lang") || ""; tag = form.get("tag") || "";
    }
  } catch (e) {
    return json({ error: "bad_body" }, 400);
  }
  email = email.trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json({ error: "bad_email" }, 400);

  const payload = { email: email, fields: {} };
  if (name.trim()) payload.fields.name = name.trim().slice(0, 100);
  if (lang) payload.fields.language = lang === "en" ? "en" : "no";
  // Quiz-resultat lagres som eget felt saa lista kan segmenteres (krever et
  // tekstfelt "quiz_result" i MailerLite; ukjente felt ignoreres trygt).
  if (tag.trim()) payload.fields.quiz_result = tag.trim().slice(0, 60);
  if (env.MAILERLITE_FUNNEL_GROUP) payload.groups = [env.MAILERLITE_FUNNEL_GROUP + ""];

  try {
    const res = await fetch(ML + "/subscribers", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + key,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      return json({ error: "mailerlite_error", status: res.status, body }, 200);
    }
    return json({ ok: true }, 200);
  } catch (e) {
    return json({ error: "fetch_failed" }, 200);
  }
}
