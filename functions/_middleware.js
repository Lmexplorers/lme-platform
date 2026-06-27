/**
 * LME tilgangsvakt — Cloudflare Pages middleware.
 *
 * Kjoerer foer hver foresporsel. For sider som er gated (se PAGE_RULES i
 * _plans.js) sjekker den sesjon + plan og slipper kun gjennom de som har hoey
 * nok plan. Ellers:
 *   - ikke innlogget        -> /login?next=<sti>
 *   - innlogget, for lav plan -> /oppgrader?need=<plan>&next=<sti>
 * Eiere slipper alltid gjennom. Alt som ikke staar i PAGE_RULES er offentlig.
 *
 * Sesjonslogikken deles med /api/auth (HttpOnly-cookie lme_sess, KV BUILDER_KV).
 */

import { ruleForPath, userRank } from "./_plans.js";

const OWNER_EMAILS = [
  "renate@lmexplorers.com", "hei@lmexplorers.com", "hello@lmexplorers.com",
  "support@lmexplorers.com", "renateshobby@hotmail.com",
];

// Rang -> plan-navn for ?need= (saa /oppgrader kan utheve riktig plan).
const RANK_PLAN = { 1: "start", 2: "proff", 3: "proff-community" };

function readCookies(request) {
  const out = {};
  (request.headers.get("Cookie") || "").split(";").forEach((p) => {
    const i = p.indexOf("=");
    if (i > 0) out[p.slice(0, i).trim()] = p.slice(i + 1).trim();
  });
  return out;
}

async function loadAuth(context) {
  const { request, env } = context;
  if (!env.BUILDER_KV) return { user: null, membership: null };
  const sid = readCookies(request)["lme_sess"];
  if (!sid) return { user: null, membership: null };
  const sraw = await env.BUILDER_KV.get("sess:" + sid);
  if (!sraw) return { user: null, membership: null };
  let sess;
  try { sess = JSON.parse(sraw); } catch (e) { return { user: null, membership: null }; }
  let user = null, membership = null;
  const uraw = await env.BUILDER_KV.get("user:" + (sess.email || "").toLowerCase());
  if (uraw) { try { user = JSON.parse(uraw); } catch (e) {} }
  const mraw = await env.BUILDER_KV.get("member:" + (sess.email || "").toLowerCase());
  if (mraw) { try { membership = JSON.parse(mraw); } catch (e) {} }
  return { user, membership };
}

function isOwner(user) {
  if (!user) return false;
  if (user.role === "owner") return true;
  return OWNER_EMAILS.indexOf((user.email || "").toLowerCase()) !== -1;
}

function redirect(location) {
  return new Response(null, { status: 302, headers: { Location: location, "Cache-Control": "no-store" } });
}

export async function onRequest(context) {
  const { request, next } = context;
  const url = new URL(request.url);

  // Bare vanlige sidenavigasjoner er aktuelle. API-er og statiske filer
  // matcher uansett ikke PAGE_RULES, men vi hopper tidlig ut for ytelse.
  const need = ruleForPath(url.pathname);
  if (need == null) return next();

  const { user, membership } = await loadAuth(context);
  const nextParam = encodeURIComponent(url.pathname + url.search);

  if (!user) return redirect("/login?next=" + nextParam);
  if (isOwner(user)) return next();

  if (need === "auth") return next(); // innlogget holder

  const rank = userRank(user, membership, false);
  if (rank >= need) return next();

  const plan = RANK_PLAN[need] || "proff-community";
  return redirect("/oppgrader?need=" + plan + "&next=" + nextParam);
}
