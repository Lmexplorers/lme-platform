/**
 * LME Sosialplanlegger — bakgrunnsjobben.
 *
 * To oppgaver, begge på vegne av medlemmene:
 *   1. Publiser planlagte innlegg som har blitt modne (when <= nå).
 *   2. Kjør automatiseringsreglene: se etter nye kommentarer og svar på dem
 *      offentlig og i DM, slik medlemmet har satt det opp.
 *
 * Kalles hvert kvarter av GitHub Actions
 * (.github/workflows/social-planner.yml). Valgfri beskyttelse: sett env
 * SOCIAL_CRON_TOKEN, så kreves ?token=... .
 *
 *   GET /api/cron/social
 *
 * Jobben er bevisst forsiktig med tid og med Metas timegrense: den tar
 * høyst 25 innlegg og 25 medlemmer per runde. Blir det flere, tas resten
 * neste runde, et kvarter senere.
 */

import {
  readConnection, readRules, runPlan, runAutomation,
} from "../../_lib/social.js";

const MAX_POSTS = 25;
const MAX_MEMBERS = 25;

function json(data, status) {
  return new Response(JSON.stringify(data), {
    status: status || 200,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

/* splan:<e-post>:<id> -> { email, id }. E-poster inneholder aldri kolon, så
   det første og siste kolonet er trygge skillepunkter. */
function splitPlanKey(name) {
  const rest = name.slice("splan:".length);
  const i = rest.lastIndexOf(":");
  if (i <= 0) return null;
  return { email: rest.slice(0, i), id: rest.slice(i + 1) };
}

async function listKeys(env, prefix) {
  const out = [];
  let cursor;
  do {
    const res = await env.BUILDER_KV.list({ prefix: prefix, cursor: cursor });
    res.keys.forEach((k) => out.push(k.name));
    cursor = res.list_complete ? null : res.cursor;
  } while (cursor);
  return out;
}

export async function onRequest(context) {
  const { env, request } = context;
  if (!env.BUILDER_KV) return json({ error: "not_configured" }, 503);

  const need = env.SOCIAL_CRON_TOKEN;
  if (need) {
    const url = new URL(request.url);
    const got = url.searchParams.get("token") || request.headers.get("X-Cron-Token");
    if (got !== need) return json({ error: "forbidden" }, 403);
  }

  const now = Date.now();
  const report = { published: 0, failed: 0, waiting: 0, members: 0, replies: 0, dms: 0, errors: [] };

  /* ---- 1. Planlagte innlegg ---- */
  const conns = new Map(); // e-post -> tilkobling, hentes én gang per runde
  async function connFor(email) {
    if (!conns.has(email)) conns.set(email, await readConnection(env, email));
    return conns.get(email);
  }

  const planKeys = await listKeys(env, "splan:");
  for (const name of planKeys) {
    if (report.published + report.failed >= MAX_POSTS) { report.waiting++; continue; }
    const parts = splitPlanKey(name);
    if (!parts) continue;
    let post;
    try { post = JSON.parse(await env.BUILDER_KV.get(name)); } catch (e) { continue; }
    if (!post || post.status !== "planlagt") continue;
    if (new Date(post.when).getTime() > now) { report.waiting++; continue; }

    const conn = await connFor(parts.email);
    if (!conn) {
      post.status = "feilet";
      post.results = [{ ok: false, error: "Kontoene er ikke koblet til lenger." }];
      post.publishedAt = new Date().toISOString();
      try { await env.BUILDER_KV.put(name, JSON.stringify(post), { expirationTtl: 60 * 60 * 24 * 60 }); } catch (e) {}
      report.failed++;
      continue;
    }
    const done = await runPlan(env, parts.email, post, conn, "no");
    if (done.status === "publisert" || done.status === "delvis") report.published++;
    else report.failed++;
  }

  /* ---- 2. Automatisering ---- */
  const ruleKeys = await listKeys(env, "srule:");
  for (const name of ruleKeys) {
    if (report.members >= MAX_MEMBERS) break;
    const email = name.slice("srule:".length);
    if (!email) continue;
    const rules = await readRules(env, email);
    if (!rules.some((r) => r.on !== false)) continue;
    const conn = await connFor(email);
    if (!conn) continue;
    report.members++;
    const res = await runAutomation(env, email, conn, rules, "no");
    report.replies += res.replies;
    report.dms += res.dms;
    if (res.errors.length) report.errors.push({ email: email, error: res.errors[0].error });
  }

  return json({ ok: true, ...report });
}
