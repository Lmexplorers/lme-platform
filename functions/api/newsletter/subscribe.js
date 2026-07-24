/**
 * Nyhetsbrev — påmelding.
 *
 * POST /api/newsletter/subscribe   { email, name, lang }
 * Legger abonnenten i KV (nl:<e-post>) og starter den ukentlige serien.
 * Kan brukes av påmeldingsskjemaer på plattformen.
 */

import { registerNewsletter } from "../../_lib/newsletter.js";

function json(data, status) {
  return new Response(JSON.stringify(data), {
    status: status || 200,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

export async function onRequestPost(context) {
  const { request, env } = context;
  if (!env.BUILDER_KV) return json({ error: "not_configured" }, 503);

  let email = "", name = "", lang = "", source = "";
  try {
    const ct = request.headers.get("Content-Type") || "";
    if (ct.indexOf("application/json") !== -1) {
      const b = await request.json();
      email = (b.email || "") + ""; name = (b.name || "") + ""; lang = (b.lang || "") + ""; source = (b.source || "") + "";
    } else {
      const form = new URLSearchParams(await request.text());
      email = form.get("email") || ""; name = form.get("name") || ""; lang = form.get("lang") || ""; source = form.get("source") || "";
    }
  } catch (e) {
    return json({ error: "bad_body" }, 400);
  }
  email = email.trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json({ error: "bad_email" }, 400);

  await registerNewsletter(env, email, name.trim().slice(0, 100), lang, source);
  return json({ ok: true });
}
