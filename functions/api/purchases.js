/**
 * LME — ekte kjøpshistorikk for den innloggede brukeren, på tvers av alle
 * produkttyper (se functions/_lib/purchases.js). Erstatter den tidligere
 * statiske eksempelvisningen i "Kjøp"-fanen på Min side med ekte data når
 * det finnes, uten å endre selve fanens redigerte tekst/struktur.
 *
 * Auth deles med resten av plattformen: sesjons-cookien lme_sess (satt av
 * /api/auth/*) slås opp i BUILDER_KV, samme mønster som
 * functions/api/bookly/[[path]].js.
 *
 * GET /api/purchases -> { purchases: [...] } eller { error: "not_logged_in" }
 */

import { getPurchases } from "../_lib/purchases.js";

function json(data, status) {
  return new Response(JSON.stringify(data), {
    status: status || 200,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

function readCookies(request) {
  const out = {};
  (request.headers.get("Cookie") || "").split(";").forEach((p) => {
    const i = p.indexOf("=");
    if (i > 0) out[p.slice(0, i).trim()] = p.slice(i + 1).trim();
  });
  return out;
}

async function sessionFrom(context) {
  const { request, env } = context;
  const sid = readCookies(request)["lme_sess"];
  if (!sid || !env.BUILDER_KV) return null;
  const raw = await env.BUILDER_KV.get("sess:" + sid);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch (e) { return null; }
}

export async function onRequestGet(context) {
  const { env } = context;
  if (!env.BUILDER_KV) return json({ error: "not_configured", purchases: [] }, 200);
  const sess = await sessionFrom(context);
  if (!sess || !sess.email) return json({ error: "not_logged_in", purchases: [] }, 200);
  const purchases = await getPurchases(env, sess.email);
  return json({ purchases }, 200);
}
