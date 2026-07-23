/**
 * Claude-kurset — sender 2-dagers oppfølgingsmail fra køen.
 *
 * Webhooken legger en oppfølger i KV ved kjøp (claude_fu:<e-post>). Denne
 * endepunktet går gjennom køen og sender de som er modne (sendAfter <= naa),
 * via MailerSend, og fjerner dem etterpaa.
 *
 * Kalles daglig av GitHub Actions (.github/workflows/claude-followups.yml).
 * Valgfri beskyttelse: sett env CLAUDE_CRON_TOKEN, saa kreves ?token=... .
 *
 *   GET /api/cron/claude-followups
 */

import { sendClaudeMail } from "../../_lib/claude-mail.js";

function json(data, status) {
  return new Response(JSON.stringify(data), {
    status: status || 200,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

export async function onRequest(context) {
  const { env, request } = context;
  if (!env.BUILDER_KV) return json({ error: "not_configured" }, 503);

  // Valgfri token-beskyttelse
  const need = env.CLAUDE_CRON_TOKEN;
  if (need) {
    const url = new URL(request.url);
    const got = url.searchParams.get("token") || request.headers.get("X-Cron-Token");
    if (got !== need) return json({ error: "forbidden" }, 403);
  }

  const now = Date.now();
  let sent = 0, pending = 0, failed = 0;

  let cursor;
  do {
    const list = await env.BUILDER_KV.list({ prefix: "claude_fu:", cursor: cursor });
    for (const k of list.keys) {
      const raw = await env.BUILDER_KV.get(k.name);
      if (!raw) continue;
      let job;
      try { job = JSON.parse(raw); } catch (e) { await env.BUILDER_KV.delete(k.name); continue; }
      if (job.sendAfter && job.sendAfter > now) { pending++; continue; }
      const res = await sendClaudeMail(env, { to: job.email, name: job.name, lang: job.lang, kind: "oppfolging" });
      if (res && res.ok) { await env.BUILDER_KV.delete(k.name); sent++; }
      else { failed++; }
    }
    cursor = list.list_complete ? null : list.cursor;
  } while (cursor);

  return json({ ok: true, sent: sent, pending: pending, failed: failed });
}
