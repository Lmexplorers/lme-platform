/**
 * POST /api/utfordring-preview
 *
 * Gir eieren (Renate) gratis tilgang til 10 000-visninger-utfordringens
 * e-postserie, uten å måtte betale for sitt eget produkt.
 *
 * To veier inn, så det aldri er avhengig av at en bestemt innlogging er
 * aktiv akkurat da: (1) samme admin-nøkkel som resten av plattformen
 * bruker for redigering (COURSE_EDIT_PASSWORD, ellers LME26), sendt fra
 * knappen på /utfordringen, eller (2) en gjenkjent eier-økt (isOwner).
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
const OWNER_KEY_FALLBACK = "LME26";
const OWNER_EMAIL = "renateshobby@hotmail.com";

export async function onRequestPost(context) {
  const { env, request } = context;
  if (!env.BUILDER_KV) return json({ error: "not_configured" }, 503);

  const body = await request.json().catch(() => ({}));
  const lang = body.lang === "en" ? "en" : "no";
  const suppliedKey = ((body.key || "") + "").trim();
  const keyOk = suppliedKey && suppliedKey === ((env.COURSE_EDIT_PASSWORD || OWNER_KEY_FALLBACK) + "");

  if (!keyOk) {
    const user = await sessionUser(context);
    if (!user || !isOwner(user)) return json({ error: "forbidden" }, 403);
  }
  // Alltid samme, faste eier-identitet her, uansett om tilgangen kom via
  // ?eier=-nokkelen eller en innlogget okt (som kan vaere registrert med en
  // annen av OWNER_EMAILS-adressene). Det finnes bare en eier, sa det skal
  // bare finnes en "allerede med"-status, ellers sendes velkomstmailen pa
  // nytt hver gang hun kommer inn en annen vei enn sist.
  const email = OWNER_EMAIL;
  const nm = "Renate";

  // Idempotent: allerede medlem betyr at velkomstmailen og oppfolgingskoen
  // allerede er sendt/satt opp en gang. Ikke send den pa nytt hver gang
  // eieren trykker "Se utfordringen" igjen, det ga mange dobbeltmailer.
  const e = email.trim().toLowerCase();
  const already = await env.BUILDER_KV.get("utf_member:" + e);
  if (already) return json({ ok: true, email: email, alreadyMember: true });

  await sendUtfordringMail(env, { to: email, name: nm, lang: lang, kind: "d0" });
  try {
    for (const dag of UTFORDRING_DAYS) {
      await env.BUILDER_KV.put(
        "utf_fu:" + e + ":d" + dag,
        JSON.stringify({ email: email, name: nm, lang: lang, kind: "d" + dag, sendAfter: Date.now() + dag * DAG })
      );
    }
    await env.BUILDER_KV.put("utf_member:" + e, JSON.stringify({ email: email, name: nm, lang: lang, joinedAt: Date.now() }));
  } catch (e2) {}

  return json({ ok: true, email: email });
}
