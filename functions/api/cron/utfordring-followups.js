/**
 * 10 000-visninger-utfordringen — sender dag 1/3/7/14/21/30 fra køen.
 *
 * Webhooken legger seks oppfølgere i KV ved kjøp (utf_fu:<e-post>:d<dag>).
 * Dette endepunktet går gjennom køen og sender de som er modne
 * (sendAfter <= naa) via MailerSend, og fjerner dem etterpaa.
 *
 * Kalles daglig av GitHub Actions (.github/workflows/utfordring-followups.yml).
 * Valgfri beskyttelse: sett env UTFORDRING_CRON_TOKEN, saa kreves ?token=... .
 *
 *   GET /api/cron/utfordring-followups
 */

import { sendUtfordringMail } from "../../_lib/utfordring-mail.js";

function json(data, status) {
  return new Response(JSON.stringify(data), {
    status: status || 200,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

export async function onRequest(context) {
  const { env, request } = context;
  if (!env.BUILDER_KV) return json({ error: "not_configured" }, 503);

  const need = env.UTFORDRING_CRON_TOKEN;
  if (need) {
    const url = new URL(request.url);
    const got = url.searchParams.get("token") || request.headers.get("X-Cron-Token");
    if (got !== need) return json({ error: "forbidden" }, 403);
  }

  const now = Date.now();
  let sent = 0, pending = 0, failed = 0, errored = 0;

  let cursor;
  do {
    const list = await env.BUILDER_KV.list({ prefix: "utf_fu:", cursor: cursor });
    for (const k of list.keys) {
      // En feil på ett enkelt varsel (f.eks. en forbigående KV-feil) skal
      // aldri stoppe resten av køen eller kræsje hele kjøringen. Uten dette
      // ville en feilet delete() etter en vellykket sending la varselet bli
      // liggende igjen med samme (fortidige) sendAfter, og sende samme
      // e-post på nytt neste dag, akkurat det som skjedde med dag 1-mailen.
      try {
        const raw = await env.BUILDER_KV.get(k.name);
        if (!raw) continue;
        let job;
        try { job = JSON.parse(raw); } catch (e) { await env.BUILDER_KV.delete(k.name); continue; }
        if (job.sendAfter && job.sendAfter > now) { pending++; continue; }
        const res = await sendUtfordringMail(env, {
          to: job.email, name: job.name, lang: job.lang, kind: job.kind,
        });
        if (res && res.ok) {
          sent++;
          try {
            await env.BUILDER_KV.delete(k.name);
          } catch (delErr) {
            // Prøv én gang til med en gang, i stedet for å la den forbigåtte
            // feilen stå igjen til i morgen.
            await env.BUILDER_KV.delete(k.name);
          }
        } else {
          failed++;
        }
      } catch (keyErr) {
        errored++;
      }
    }
    cursor = list.list_complete ? null : list.cursor;
  } while (cursor);

  return json({ ok: true, sent: sent, pending: pending, failed: failed, errored: errored });
}
