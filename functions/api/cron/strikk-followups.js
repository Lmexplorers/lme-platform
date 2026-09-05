/**
 * LME Strikk & Hekle — sender oppfølgingsserien fra køen.
 *
 * Kjøpet legger kjøperen i KV (strikk_fu:<e-post>). Dette endepunktet går
 * gjennom køen, sender de som er modne (sendAfter <= nå), og flytter dem til
 * neste steg. Er serien ferdig, fjernes posten.
 *
 * Kalles daglig av GitHub Actions (.github/workflows/strikk-followups.yml).
 * Valgfri beskyttelse: sett env STRIKK_CRON_TOKEN, så kreves ?token=... .
 *
 *   GET /api/cron/strikk-followups
 */
import { sendOppfolging, nesteSteg, KEY_PREFIX } from "../../_lib/strikk-followup-mail.js";

function json(data, status) {
  return new Response(JSON.stringify(data), {
    status: status || 200,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

export async function onRequest(context) {
  const { env, request } = context;
  if (!env.BUILDER_KV) return json({ error: "not_configured" }, 503);

  const need = env.STRIKK_CRON_TOKEN;
  if (need) {
    const url = new URL(request.url);
    const got = url.searchParams.get("token") || request.headers.get("X-Cron-Token");
    if (got !== need) return json({ error: "forbidden" }, 403);
  }

  const now = Date.now();
  let sent = 0, pending = 0, failed = 0, ferdig = 0;

  let cursor;
  do {
    const list = await env.BUILDER_KV.list({ prefix: KEY_PREFIX, cursor: cursor });
    for (const k of list.keys) {
      const raw = await env.BUILDER_KV.get(k.name);
      if (!raw) continue;
      let job;
      try { job = JSON.parse(raw); } catch (e) { await env.BUILDER_KV.delete(k.name); continue; }
      if (job.sendAfter && job.sendAfter > now) { pending++; continue; }

      const res = await sendOppfolging(env, {
        to: job.email, name: job.name, lang: job.lang, steg: job.steg,
      });
      if (!(res && res.ok)) { failed++; continue; }
      sent++;

      /* Sendt. Sett opp neste brev, eller rydd bort posten når serien er
         ferdig. Rekkefølgen er viktig: vi skriver den nye tilstanden FØR vi
         gir oss, så et brev aldri kan sendes to ganger. */
      const neste = nesteSteg(job.steg);
      if (neste) {
        job.steg = neste.nr;
        job.sendAfter = now + neste.omMs;
        await env.BUILDER_KV.put(k.name, JSON.stringify(job));
      } else {
        await env.BUILDER_KV.delete(k.name);
        ferdig++;
      }
    }
    cursor = list.list_complete ? null : list.cursor;
  } while (cursor);

  return json({ ok: true, sent: sent, pending: pending, failed: failed, ferdig: ferdig });
}
