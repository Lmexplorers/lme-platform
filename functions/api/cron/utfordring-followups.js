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

  // Eierens eget testmedlemskap skal alltid stå i norsk (plattformens
  // standardspråk), uansett hvilket språk siden tilfeldigvis viste sist hun
  // testet "Se utfordringen"-knappen. Før velkomstmailen ble idempotent
  // (functions/api/utfordring-preview.js) kunne gjentatte testklikk med
  // ulikt språk skrive feil lang til utf_member-posten hennes, som igjen ga
  // en enkelt engelsk dagsmail midt i en ellers norsk serie. Rettes
  // automatisk her hver kjøring, ingen manuell handling nødvendig.
  const OWNER_EMAIL = "renateshobby@hotmail.com";
  try {
    const ownerRaw = await env.BUILDER_KV.get("utf_member:" + OWNER_EMAIL);
    if (ownerRaw) {
      const ownerMember = JSON.parse(ownerRaw);
      if (ownerMember.lang !== "no") {
        ownerMember.lang = "no";
        await env.BUILDER_KV.put("utf_member:" + OWNER_EMAIL, JSON.stringify(ownerMember));
      }
    }
  } catch (eOwner) {}

  // Medlemmets lagrede språk (utf_member:<e-post>) er alltid fasit, ikke det
  // som sto i køen da den enkelte dagen ble lagt inn. Før velkomstmailen ble
  // idempotent kunne gjentatte testklikk med ulikt språk skrive forskjellig
  // lang til ulike dager i samme kø, avhengig av hva som allerede var sendt
  // og fjernet fra køen i mellomtiden, noe som ga blandet norsk/engelsk i
  // samme serie. Cachet per e-post per kjøring, så det bare slås opp én gang.
  const memberLangCache = new Map();

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

        let lang = job.lang;
        const e = ((job.email || "") + "").trim().toLowerCase();
        if (e) {
          if (!memberLangCache.has(e)) {
            let memberLang = null;
            try {
              const memberRaw = await env.BUILDER_KV.get("utf_member:" + e);
              if (memberRaw) memberLang = JSON.parse(memberRaw).lang || null;
            } catch (e3) {}
            memberLangCache.set(e, memberLang);
          }
          lang = memberLangCache.get(e) || job.lang;
        }

        const res = await sendUtfordringMail(env, {
          to: job.email, name: job.name, lang: lang, kind: job.kind,
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
