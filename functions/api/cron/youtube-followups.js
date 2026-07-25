/**
 * YouTube-kurset — sender modne oppfølgingsmail fra 3-ukers køen.
 *
 * /gratis-youtube-kurs (via free-course.js) legger en 5-trinns serie i KV
 * ved bekreftelse (ytfu:<e-post>:<dag>). Dette endepunktet går gjennom
 * køen og sender de som er modne (sendAfter <= naa), via MailerSend, og
 * fjerner dem etterpaa. Etter siste steg (dag 21) meldes abonnenten inn i
 * den vanlige ukentlige evergreen-serien, saa hun fortsetter aa hore fra
 * Renate uten en ny dedikert kø.
 *
 * Kalles daglig av GitHub Actions (.github/workflows/youtube-followups.yml).
 * Valgfri beskyttelse: sett env YOUTUBE_CRON_TOKEN, saa kreves ?token=... .
 *
 *   GET /api/cron/youtube-followups
 */

import { sendYoutubeCourseMail } from "../../_lib/youtube-course-mail.js";
import { registerNewsletter } from "../../_lib/newsletter.js";

function json(data, status) {
  return new Response(JSON.stringify(data), {
    status: status || 200,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

export async function onRequest(context) {
  const { env, request } = context;
  if (!env.BUILDER_KV) return json({ error: "not_configured" }, 503);

  const need = env.YOUTUBE_CRON_TOKEN;
  if (need) {
    const url = new URL(request.url);
    const got = url.searchParams.get("token") || request.headers.get("X-Cron-Token");
    if (got !== need) return json({ error: "forbidden" }, 403);
  }

  const now = Date.now();
  let sent = 0, pending = 0, failed = 0;

  let cursor;
  do {
    const list = await env.BUILDER_KV.list({ prefix: "ytfu:", cursor: cursor });
    for (const k of list.keys) {
      const raw = await env.BUILDER_KV.get(k.name);
      if (!raw) continue;
      let job;
      try { job = JSON.parse(raw); } catch (e) { await env.BUILDER_KV.delete(k.name); continue; }
      if (job.sendAfter && job.sendAfter > now) { pending++; continue; }
      const res = await sendYoutubeCourseMail(env, { to: job.email, name: job.name, lang: job.lang, kind: job.kind });
      if (res && res.ok) {
        await env.BUILDER_KV.delete(k.name);
        sent++;
        if (job.kind === "day21") {
          // Siste steg i serien: fold inn i den vanlige ukentlige serien.
          await registerNewsletter(env, job.email, job.name, job.lang, "youtube-free-course");
        }
      } else {
        failed++;
      }
    }
    cursor = list.list_complete ? null : list.cursor;
  } while (cursor);

  return json({ ok: true, sent: sent, pending: pending, failed: failed });
}
