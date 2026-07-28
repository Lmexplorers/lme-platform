/**
 * /api/track
 *   POST  -> registrer en anonym hendelse (åpen, brukes av js/lme-track.js)
 *   GET   -> les funnel-tall (KUN eier, brukes av /analytics)
 *
 * Ingen persondata lagres, bare dagstellere (se _lib/track.js).
 */
import { bumpToday, readDays } from "../_lib/track.js";
import { getAccess } from "../_lib/access.js";

function json(data, status) {
  return new Response(JSON.stringify(data), {
    status: status || 200,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

function cleanPath(p) {
  if (!p || typeof p !== "string") return "/";
  let s = p.split("?")[0].split("#")[0].replace(/\/+$/, "");
  s = s.slice(0, 120);
  return s || "/";
}

function isProductPath(p) {
  return /^\/(butikk|shop)(\/|$)/.test(p) || /(oppskrift|produkt|pattern|kurs)/.test(p);
}

export async function onRequestPost(context) {
  const { request, env } = context;
  if (!env || !env.BUILDER_KV) return json({ ok: false });
  let ev;
  try { ev = await request.json(); } catch (e) { return json({ ok: false }, 400); }
  if (!ev || typeof ev !== "object") return json({ ok: false }, 400);

  const fields = {};
  const maps = {};
  const path = cleanPath(ev.path);
  const camp = (typeof ev.camp === "string" && ev.camp) ? ev.camp.slice(0, 80) : "";

  if (ev.t === "pv") {
    fields.pv = 1;
    maps.pages = {}; maps.pages[path] = 1;
    if (ev.visit) {
      fields.visit = 1;
      if (camp) { maps.camp = {}; maps.camp[camp] = 1; }
    }
    if (isProductPath(path)) fields.productview = 1;
  } else if (ev.t === "click") {
    const name = (typeof ev.name === "string" && ev.name) ? ev.name.slice(0, 60) : "cta";
    maps.clicks = {}; maps.clicks[name] = 1;
    if (name === "checkout") fields.checkout = 1;
  } else {
    return json({ ok: false }, 400);
  }

  await bumpToday(env, fields, maps);
  return json({ ok: true });
}

export async function onRequestGet(context) {
  // Kun eier får se tallene.
  let access;
  try { access = await getAccess(context); } catch (e) { access = null; }
  const owner = access && (access.plan === "owner" || access.tier === "owner");
  if (!owner) return json({ error: "forbidden" }, 403);

  const url = new URL(context.request.url);
  const n = parseInt(url.searchParams.get("days") || "30", 10) || 30;
  const days = await readDays(context.env, n);

  // Aggreger totaler for perioden.
  const totals = { pv: 0, visit: 0, productview: 0, checkout: 0, purchase: 0 };
  const pages = {}, camp = {}, clicks = {};
  const series = [];
  for (const d of days) {
    const x = d.day || {};
    totals.pv += x.pv || 0;
    totals.visit += x.visit || 0;
    totals.productview += x.productview || 0;
    totals.checkout += x.checkout || 0;
    totals.purchase += x.purchase || 0;
    series.push({ date: d.date, visit: x.visit || 0 });
    for (const k in (x.pages || {})) pages[k] = (pages[k] || 0) + x.pages[k];
    for (const k in (x.camp || {})) camp[k] = (camp[k] || 0) + x.camp[k];
    for (const k in (x.clicks || {})) clicks[k] = (clicks[k] || 0) + x.clicks[k];
  }
  const top = (obj, m) => Object.keys(obj).map(k => ({ key: k, n: obj[k] }))
    .sort((a, b) => b.n - a.n).slice(0, m || 8);

  return json({
    days: n,
    totals: totals,
    series: series,
    topPages: top(pages, 8),
    campaigns: top(camp, 8),
    clicks: top(clicks, 8),
  });
}
