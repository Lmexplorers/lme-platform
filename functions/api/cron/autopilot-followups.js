/**
 * LME Autopilot — sender oppfølgingsserien fra køen.
 *
 * Kjøpet legger kunden i køen (autopilot_fu:<e-post>, se koOppfolging() i
 * _lib/autopilot-followup-mail.js). Dette endepunktet går gjennom køen,
 * sender de brevene som er modne, og flytter kunden til neste steg. Er hun
 * ferdig med siste steg, fjernes hun.
 *
 * Kalles daglig av GitHub Actions (.github/workflows/autopilot-followups.yml).
 * Valgfri beskyttelse: sett env AUTOPILOT_CRON_TOKEN, så kreves ?token=… .
 *
 *   GET /api/cron/autopilot-followups
 *
 * Samme mønster som Claude-kurset bruker, med ett tillegg: serien har flere
 * steg, så en jobb som er sendt blir liggende med nytt tidspunkt i stedet
 * for å slettes.
 */

import { sendOppfolging, nesteSteg } from "../../_lib/autopilot-followup-mail.js";

function json(data, status) {
  return new Response(JSON.stringify(data), {
    status: status || 200,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

export async function onRequest(context) {
  const { env, request } = context;
  if (!env.BUILDER_KV) return json({ error: "not_configured" }, 503);

  const need = env.AUTOPILOT_CRON_TOKEN;
  if (need) {
    const url = new URL(request.url);
    const got = url.searchParams.get("token") || request.headers.get("X-Cron-Token");
    if (got !== need) return json({ error: "forbidden" }, 403);
  }

  const now = Date.now();
  let sendt = 0, venter = 0, feilet = 0, ferdige = 0;

  let cursor;
  do {
    const liste = await env.BUILDER_KV.list({ prefix: "autopilot_fu:", cursor: cursor });
    for (const k of liste.keys) {
      const raw = await env.BUILDER_KV.get(k.name);
      if (!raw) continue;
      let jobb;
      try { jobb = JSON.parse(raw); }
      catch (e) { await env.BUILDER_KV.delete(k.name); continue; }

      if (jobb.sendAfter && jobb.sendAfter > now) { venter++; continue; }

      const res = await sendOppfolging(env, {
        to: jobb.email, name: jobb.name, lang: jobb.lang,
        steg: jobb.steg, kilde: jobb.kilde,
      });
      if (!res || !res.ok) { feilet++; continue; }
      sendt++;

      /* Neste brev, eller ut av køen når serien er ferdig. */
      const neste = nesteSteg(jobb.steg);
      if (!neste) {
        await env.BUILDER_KV.delete(k.name);
        ferdige++;
        continue;
      }
      /* Tiden regnes fra kjøpet, ikke fra i dag, så en dag der jobben ikke
         kjørte ikke skyver hele serien ut. */
      const start = Date.parse(jobb.opprettet || "") || now;
      jobb.steg = neste.nr;
      jobb.sendAfter = start + neste.dager * 24 * 60 * 60 * 1000;
      await env.BUILDER_KV.put(k.name, JSON.stringify(jobb), {
        expirationTtl: 60 * 60 * 24 * 120,
      });
    }
    cursor = liste.list_complete ? null : liste.cursor;
  } while (cursor);

  return json({ ok: true, sendt: sendt, venter: venter, feilet: feilet, ferdige: ferdige });
}
