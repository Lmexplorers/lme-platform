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
  const sub = user.subscription;
  if (!sub || sub.status !== "active") {
    return { ok: false, status: 402, error: "Dette krever et aktivt Content Studio-abonnement. Se planene på /oppgrader." };
  }
  const k = kind === "video" ? "video" : "image";
  const limit = limitsFor(user)[k] || 0;
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
