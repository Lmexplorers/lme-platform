/**
 * Mia & Teo, gratisheftet "Mitt første følelsesverktøy" — sender den
 * 5-stegs e-postserien fra køen (functions/_lib/mia-teo-mail.js).
 *
 * Hver jobb (mia_teo_fu:<e-post>) har et "step" (0-4) og "sendAfter". Denne
 * endepunktet går gjennom køen, sender steget som er modent (sendAfter <=
 * naa) via MailerSend, og enten flytter jobben til neste steg (ny
 * sendAfter) eller sletter den hvis siste steg akkurat ble sendt.
 *
 * Kalles daglig av GitHub Actions (.github/workflows/mia-teo-followups.yml).
 * Valgfri beskyttelse: sett env MIA_TEO_CRON_TOKEN, saa kreves ?token=... .
 *
 *   GET /api/cron/mia-teo-followups
 */
import { sendMiaTeoMail, KEY_PREFIX, STEP_DELAYS_MS, STEP_COUNT } from "../../_lib/mia-teo-mail.js";

function json(data, status) {
  return new Response(JSON.stringify(data), {
    status: status || 200,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

export async function onRequest(context) {
  const { env, request } = context;
  if (!env.BUILDER_KV) return json({ error: "not_configured" }, 503);

  const need = env.MIA_TEO_CRON_TOKEN;
  if (need) {
    const url = new URL(request.url);
    const got = url.searchParams.get("token") || request.headers.get("X-Cron-Token");
    if (got !== need) return json({ error: "forbidden" }, 403);
  }

  const now = Date.now();
  let sent = 0, pending = 0, failed = 0, finished = 0;

  let cursor;
  do {
    const list = await env.BUILDER_KV.list({ prefix: KEY_PREFIX, cursor: cursor });
    for (const k of list.keys) {
      const raw = await env.BUILDER_KV.get(k.name);
      if (!raw) continue;
      let job;
      try { job = JSON.parse(raw); } catch (e) { await env.BUILDER_KV.delete(k.name); continue; }
      if (job.sendAfter && job.sendAfter > now) { pending++; continue; }

      const step = job.step || 0;
      const res = await sendMiaTeoMail(env, { to: job.email, name: job.name, lang: job.lang, step: step });
      if (!res || !res.ok) { failed++; continue; }

      sent++;
      const nextStep = step + 1;
      if (nextStep >= STEP_COUNT) {
        await env.BUILDER_KV.delete(k.name);
        finished++;
      } else {
        job.step = nextStep;
        job.sendAfter = now + STEP_DELAYS_MS[nextStep];
        await env.BUILDER_KV.put(k.name, JSON.stringify(job));
      }
    }
    cursor = list.list_complete ? null : list.cursor;
  } while (cursor);

  return json({ ok: true, sent: sent, pending: pending, failed: failed, finished: finished });
}
