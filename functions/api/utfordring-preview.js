/**
 * POST /api/utfordring-preview
 *
 * Gir eieren (Renate) gratis tilgang til 10 000-visninger-utfordringens
 * e-postserie, samme prinsipp som resten av plattformen (isOwner i
 * _lib/access.js): eieren skal alltid ha tilgang til alt som bygges,
 * uten å måtte betale for sitt eget produkt.
 *
 * Sender dag 0 med en gang og legger resten i kø, akkurat som et ekte
 * kjøp gjør i functions/api/oppskrift-webhook.js, bare uten Stripe.
 */

import { sessionUser, isOwner } from "../_lib/access.js";
import { sendUtfordringMail } from "../_lib/utfordring-mail.js";

function json(data, status) {
  return new Response(JSON.stringify(data), {
    status: status || 200,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

const UTFORDRING_DAYS = [1, 3, 7, 14, 21, 30];
const DAG = 24 * 60 * 60 * 1000;

export async function onRequestPost(context) {
  const { env, request } = context;
  if (!env.BUILDER_KV) return json({ error: "not_configured" }, 503);

  const user = await sessionUser(context);
  if (!user || !isOwner(user)) return json({ error: "forbidden" }, 403);

  const body = await request.json().catch(() => ({}));
  const lang = body.lang === "en" ? "en" : "no";
  const email = user.email;
  const nm = user.display_name || user.name || "";

  await sendUtfordringMail(env, { to: email, name: nm, lang: lang, kind: "d0" });
  const e = email.trim().toLowerCase();
  try {
    for (const dag of UTFORDRING_DAYS) {
      await env.BUILDER_KV.put(
        "utf_fu:" + e + ":d" + dag,
        JSON.stringify({ email: email, name: nm, lang: lang, kind: "d" + dag, sendAfter: Date.now() + dag * DAG })
      );
    }
  } catch (e2) {}

  return json({ ok: true, email: email });
}
