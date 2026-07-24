/**
 * Ukentlig nyhetsbrev — sender neste brev i serien til hver abonnent.
 *
 * Går gjennom alle nl:<e-post> i KV. For hver aktive abonnent sendes brevet
 * som svarer til weekIndex (hvis det ikke er sendt for under 6 dager siden),
 * og weekIndex økes. Når serien er ferdig, sendes ikke mer.
 *
 * Kalles ukentlig av GitHub Actions (.github/workflows/newsletter.yml).
 * Valgfri beskyttelse: sett env CLAUDE_CRON_TOKEN, saa kreves ?token=... .
 *
 *   GET /api/cron/newsletter
 */

import { sendNewsletter, newsletterLength, newsletterGapDays } from "../../_lib/newsletter.js";

function json(data, status) {
  return new Response(JSON.stringify(data), {
    status: status || 200,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

export async function onRequest(context) {
  const { env, request } = context;
  if (!env.BUILDER_KV) return json({ error: "not_configured" }, 503);

  const need = env.CLAUDE_CRON_TOKEN;
  if (need) {
    const url = new URL(request.url);
    const got = url.searchParams.get("token") || request.headers.get("X-Cron-Token");
    if (got !== need) return json({ error: "forbidden" }, 403);
  }

  const now = Date.now();
  const DAY = 24 * 60 * 60 * 1000;
  let sent = 0, done = 0, skipped = 0, failed = 0;

  let cursor;
  do {
    const list = await env.BUILDER_KV.list({ prefix: "nl:", cursor: cursor });
    for (const k of list.keys) {
      const raw = await env.BUILDER_KV.get(k.name);
      if (!raw) continue;
      let sub;
      try { sub = JSON.parse(raw); } catch (e) { continue; }
      if (!sub.active) { skipped++; continue; }
      const total = newsletterLength(sub.source);
      const idx = sub.weekIndex || 0;
      if (idx >= total) { done++; continue; }               // serien fullført
      if (sub.lastSent && (now - sub.lastSent) < newsletterGapDays(sub.source) * DAY) { skipped++; continue; }
      const res = await sendNewsletter(env, sub, idx);
      if (res && res.ok) {
        sub.weekIndex = idx + 1;
        sub.lastSent = now;
        await env.BUILDER_KV.put(k.name, JSON.stringify(sub));
        sent++;
      } else { failed++; }
    }
    cursor = list.list_complete ? null : list.cursor;
  } while (cursor);

  return json({ ok: true, sent: sent, done: done, skipped: skipped, failed: failed });
}
