/**
 * LME VideoFlow — sender dag 3/7/14 "kredittene dine er tomme"-mail fra
 * køen (queued by functions/_lib/videoflow-access.js
 * queueEmptyCreditsReminder, én gang per tom-periode, ikke ved hvert
 * blokkerte forsøk).
 *
 * Sjekker saldoen på nytt rett før sending: hvis personen alt har
 * abonnert/fylt på igjen, droppes jobben stille i stedet for å sende en
 * misvisende "du er tom"-mail.
 *
 * Mail-språk: leses fra vf-sub:<e-post>.lang (satt ved selve kjøpet ut fra
 * hvilken betalingslenke, no/en, som ble brukt, se purchase-links.js
 * grantVideoFlowSub). Faller tilbake til norsk hvis kontoen aldri har hatt
 * et abonnement (f.eks. eieren, eller en gammel testkonto).
 *
 * Kalles daglig av GitHub Actions (.github/workflows/videoflow-followups.yml).
 * Valgfri beskyttelse: sett env VIDEOFLOW_CRON_TOKEN, så kreves ?token=... .
 *
 *   GET /api/cron/videoflow-followups
 */

import { getBalance } from "../../_lib/videoflow-credits.js";
import { sendVideoFlowEmptyCreditsMail } from "../../_lib/videoflow-mail.js";
import { getVideoFlowSub } from "../../_lib/purchase-links.js";

function json(data, status) {
  return new Response(JSON.stringify(data), {
    status: status || 200,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

export async function onRequest(context) {
  const { env, request } = context;
  if (!env.BUILDER_KV) return json({ error: "not_configured" }, 503);

  const need = env.VIDEOFLOW_CRON_TOKEN;
  if (need) {
    const url = new URL(request.url);
    const got = url.searchParams.get("token") || request.headers.get("X-Cron-Token");
    if (got !== need) return json({ error: "forbidden" }, 403);
  }

  const now = Date.now();
  let sent = 0, pending = 0, skipped = 0, failed = 0;

  let cursor;
  do {
    const list = await env.BUILDER_KV.list({ prefix: "vf_fu:", cursor: cursor });
    for (const k of list.keys) {
      const raw = await env.BUILDER_KV.get(k.name);
      if (!raw) continue;
      let job;
      try { job = JSON.parse(raw); } catch (e) { await env.BUILDER_KV.delete(k.name); continue; }
      if (job.sendAfter && job.sendAfter > now) { pending++; continue; }

      // Fortsatt tom for kreditter? Hvis ikke (abonnert/fylt på igjen i mellomtiden), dropp mailen stille.
      const balance = await getBalance(env, job.email);
      if (balance > 0) { await env.BUILDER_KV.delete(k.name); skipped++; continue; }

      const sub = await getVideoFlowSub(env, job.email);
      const lang = (sub && sub.lang === "en") ? "en" : "no";
      const res = await sendVideoFlowEmptyCreditsMail(env, job.email, "", lang, job.day || 3);
      if (res && res.ok) { await env.BUILDER_KV.delete(k.name); sent++; }
      else { failed++; }
    }
    cursor = list.list_complete ? null : list.cursor;
  } while (cursor);

  return json({ ok: true, sent: sent, pending: pending, skipped: skipped, failed: failed });
}
