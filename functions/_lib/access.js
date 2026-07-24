/**
 * Delt tilgangssjekk for Content Studio-generering.
 *
 * Krever innlogget bruker (Pages-økt, cookie lme_sess) med et aktivt
 * abonnement, og håndhever en månedlig kvote per bruker som kostnadsvern.
 * Brukes av bilde-, video- og reel-genereringen.
 */

function readCookies(request) {
  const out = {};
  (request.headers.get("Cookie") || "").split(";").forEach((p) => {
    const i = p.indexOf("=");
    if (i > 0) out[p.slice(0, i).trim()] = p.slice(i + 1).trim();
  });
  return out;
}

/* Hent den innloggede brukeren fra økten (eller null). */
export async function sessionUser(context) {
  const { request, env } = context;
  if (!env || !env.BUILDER_KV) return null;
  const sid = readCookies(request)["lme_sess"];
  if (!sid) return null;
  const sraw = await env.BUILDER_KV.get("sess:" + sid);
  if (!sraw) return null;
  let sess;
  try { sess = JSON.parse(sraw); } catch (e) { return null; }
  const email = (sess.email || "").trim().toLowerCase();
  if (!email) return null;
  const uraw = await env.BUILDER_KV.get("user:" + email);
  if (!uraw) return null;
  try {
    const u = JSON.parse(uraw);
    u.email = (u.email || email).toLowerCase();
    return u;
  } catch (e) { return null; }
}

/* Standardkvote for aktive abonnenter når planen ikke er lagret granulært
   ennå. Toppnivå (250 bilder / 15 video), så ingen betalende bruker blir
   feilaktig stoppet, men kostnadene er likevel bundet oppad. Når webhooken
   lagrer per-plan-grenser (subscription.limits), brukes de i stedet. */
const DEFAULT_LIMITS = { image: 250, video: 15 };

const OWNER_EMAILS = ["renateshobby@hotmail.com"];
function isOwner(user) {
  return !!user && (user.role === "owner" || user.role === "admin" ||
    OWNER_EMAILS.indexOf((user.email || "").toLowerCase()) !== -1);
}

function limitsFor(user) {
  const sub = user && user.subscription;
  if (sub && sub.limits && typeof sub.limits === "object") {
    return {
      image: sub.limits.image || DEFAULT_LIMITS.image,
      video: sub.limits.video || DEFAULT_LIMITS.video,
    };
  }
  return DEFAULT_LIMITS;
}

function monthKey(email) {
  const now = new Date();
  const ym = now.getUTCFullYear() + "-" + String(now.getUTCMonth() + 1).padStart(2, "0");
  return "usage:" + email + ":" + ym;
}

/* Abonnementet fra member:<e-post> (Stripe, autoritativt), fallback til
   kontoens speil. Slik funker det uansett om kontoen ble laget før eller
   etter kjøp. */
async function subscriptionFor(context, user) {
  const { env } = context;
  let sub = null;
  try {
    const r = await env.BUILDER_KV.get("member:" + user.email);
    if (r) sub = JSON.parse(r);
  } catch (e) {}
  if (!sub || sub.status !== "active") {
    sub = (user.subscription && user.subscription.status === "active") ? user.subscription : sub;
  }
  return sub;
}

/* For klient-gate og /api/access: hvem er du og har du tilgang. */
export async function getAccess(context) {
  const user = await sessionUser(context);
  if (!user) return { loggedIn: false, active: false, plan: null, limits: null };
  if (isOwner(user)) return { loggedIn: true, active: true, plan: "owner", limits: null };
  const sub = await subscriptionFor(context, user);
  const active = !!(sub && sub.status === "active");
  return { loggedIn: true, active: active, plan: (sub && sub.plan) || null, limits: (sub && sub.limits) || null };
}

/**
 * Sjekk tilgang og tell én generering.
 *   kind: "image" | "video"
 * Returnerer { ok:true, remaining } eller { ok:false, status, error }.
 * Hvis KV ikke er koblet til (lokal/utvikling), blokkeres ingenting.
 */
export async function enforceGeneration(context, kind) {
  const { env } = context;
  if (!env || !env.BUILDER_KV) return { ok: true };
  const user = await sessionUser(context);
  if (!user) {
    return { ok: false, status: 401, error: "Du må være logget inn for å bruke Content Studio." };
  }
  if (isOwner(user)) return { ok: true };
  const sub = await subscriptionFor(context, user);
  if (!sub || sub.status !== "active") {
    return { ok: false, status: 402, error: "Dette krever et aktivt Content Studio-abonnement. Se planene på /oppgrader." };
  }
  const k = kind === "video" ? "video" : "image";
  const limit = (sub.limits && sub.limits[k]) || DEFAULT_LIMITS[k] || 0;
  const key = monthKey(user.email);
  let usage = { image: 0, video: 0 };
  const raw = await env.BUILDER_KV.get(key);
  if (raw) { try { usage = JSON.parse(raw); } catch (e) {} }
  const used = usage[k] || 0;
  if (used >= limit) {
    return {
      ok: false, status: 429,
      error: "Du har nådd månedskvoten for " + (k === "video" ? "video" : "bilder") + ". Den nullstilles ved månedsskiftet, eller du kan oppgradere planen.",
    };
  }
  usage[k] = used + 1;
  await env.BUILDER_KV.put(key, JSON.stringify(usage), { expirationTtl: 60 * 60 * 24 * 70 });
  return { ok: true, remaining: Math.max(0, limit - usage[k]) };
}
