/**
 * Skoledagbok — sender oppfølgingsmail (dag 3 og uke 2) fra køen.
 *
 * Webhooken legger to oppfølgere i KV ved kjøp (skole_fu:<e-post>:d3 og :w2).
 * Dette endepunktet går gjennom køen og sender de som er modne
 * (sendAfter <= naa) via MailerSend, og fjerner dem etterpaa.
 *
 * Kalles daglig av GitHub Actions (.github/workflows/skoledagbok-followups.yml).
 * Valgfri beskyttelse: sett env OPPSKRIFT_CRON_TOKEN (samme hemmelighet som
 * oppskrift-followups, siden begge er interne cron-kall), saa kreves ?token=... .
 *
 *   GET /api/cron/skoledagbok-followups
 */

import { sendSkoledagbokMail } from "../../_lib/skoledagbok-mail.js";

function json(data, status) {
  return new Response(JSON.stringify(data), {
    status: status || 200,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

export async function onRequest(context) {
  const { env, request } = context;
  if (!env.BUILDER_KV) return json({ error: "not_configured" }, 503);

  const need = env.OPPSKRIFT_CRON_TOKEN;
  if (need) {
    const url = new URL(request.url);
    const got = url.searchParams.get("token") || request.headers.get("X-Cron-Token");
    if (got !== need) return json({ error: "forbidden" }, 403);
  }

  const now = Date.now();
  let sent = 0, pending = 0, failed = 0;

  let cursor;
  do {
    const list = await env.BUILDER_KV.list({ prefix: "skole_fu:", cursor: cursor });
    for (const k of list.keys) {
      const raw = await env.BUILDER_KV.get(k.name);
      if (!raw) continue;
      let job;
      try { job = JSON.parse(raw); } catch (e) { await env.BUILDER_KV.delete(k.name); continue; }
      if (job.sendAfter && job.sendAfter > now) { pending++; continue; }
      const res = await sendSkoledagbokMail(env, {
        to: job.email, name: job.name, lang: job.lang, kind: job.kind, book: job.book,
      });
      if (res && res.ok) { await env.BUILDER_KV.delete(k.name); sent++; }
      else { failed++; }
    }
    cursor = list.list_complete ? null : list.cursor;
  } while (cursor);

  return json({ ok: true, sent: sent, pending: pending, failed: failed });
}
