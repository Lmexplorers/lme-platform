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

const OWNER_EMAILS = [
  "renate@lmexplorers.com", "hei@lmexplorers.com", "hello@lmexplorers.com",
  "support@lmexplorers.com", "renateshobby@hotmail.com",
];
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

/* Medlemsnivå (Inner Circle) om det er kjent på Pages-siden. Returnerer
   "medlem" | "pro" | "vip" eller null når nivået ikke er lagret granulært
   (to innloggingssystemer, se docs). Klient-gaten er fail-open på null. */
function tierOf(sub) {
  if (!sub) return null;
  const t = String(sub.tier || "").toLowerCase();
  if (t === "vip" || t === "pro") return t;
  if (t === "regular" || t === "medlem" || t === "member") return "medlem";
  return null;
}

/* Kredittpåfyll som ligger på kontoen (utløper ikke). */
async function creditFor(context, email) {
  try {
    const r = await context.env.BUILDER_KV.get("credit:" + email);
    if (r) { const b = JSON.parse(r); return { image: b.image || 0, video: b.video || 0 }; }
  } catch (e) {}
  return { image: 0, video: 0 };
}

/* For klient-gate og /api/access: hvem er du og har du tilgang. */
export async function getAccess(context) {
  const user = await sessionUser(context);
  if (!user) return { loggedIn: false, active: false, plan: null, tier: null, limits: null, credit: null };
  if (isOwner(user)) return { loggedIn: true, active: true, plan: "owner", tier: "owner", limits: null, credit: null };
  const sub = await subscriptionFor(context, user);
  const active = !!(sub && sub.status === "active");
  const credit = await creditFor(context, user.email);
  return { loggedIn: true, active: active, plan: (sub && sub.plan) || null, tier: tierOf(sub), limits: (sub && sub.limits) || null, credit: credit };
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
  if (used < limit) {
    usage[k] = used + 1;
    await env.BUILDER_KV.put(key, JSON.stringify(usage), { expirationTtl: 60 * 60 * 24 * 70 });
    return { ok: true, remaining: Math.max(0, limit - usage[k]) };
  }
  // Månedskvoten er brukt opp. Trekk fra kredittpåfyll (utløper ikke).
  const ckey = "credit:" + user.email;
  let bal = { image: 0, video: 0 };
  try { const braw = await env.BUILDER_KV.get(ckey); if (braw) bal = JSON.parse(braw) || bal; } catch (e) {}
  if ((bal[k] || 0) > 0) {
    bal[k] = bal[k] - 1;
    await env.BUILDER_KV.put(ckey, JSON.stringify(bal));
    return { ok: true, remaining: 0, credit: bal[k], source: "credit" };
  }
  return {
    ok: false, status: 429,
    error: "Du har brukt opp månedskvoten for " + (k === "video" ? "video" : "bilder") + ". Kjøp mer kreditt på /kjop-kreditt, eller oppgrader planen. Kvoten nullstilles ved månedsskiftet.",
  };
}

/* =========================================================================
   Video Studio (egen app): for eier, Pro/VIP (Inner Circle) eller de som har
   kjøpt appen. INGEN gratis generering. Ren forhåndsbetalt video-kreditt, så
   Renate aldri dekker andres generering. Tilgang åpner døra, kreditt betaler
   for maskinen.
   ========================================================================= */

/* Hvem er du, og har du tilgang til Video Studio (uten å trekke kreditt). */
export async function videoAppAccess(context) {
  const user = await sessionUser(context);
  if (!user) return { loggedIn: false, entitled: false, owner: false, tier: null, credit: { image: 0, video: 0 } };
  const credit = await creditFor(context, user.email);
  if (isOwner(user)) return { loggedIn: true, entitled: true, owner: true, tier: "owner", credit: credit };
  const sub = await subscriptionFor(context, user);
  const tier = tierOf(sub);
  const bought = !!(sub && sub.apps && sub.apps.videostudio);
  return { loggedIn: true, entitled: tier === "pro" || tier === "vip" || bought, owner: false, tier: tier, credit: credit };
}

/* Sjekk tilgang OG trekk én video-kreditt (forhåndsbetalt, ingen gratis kvote). */
export async function enforceVideoApp(context) {
  const { env } = context;
  if (!env || !env.BUILDER_KV) return { ok: true };
  const user = await sessionUser(context);
  if (!user) return { ok: false, status: 401, error: "Logg inn for å bruke Video Studio." };
  if (isOwner(user)) return { ok: true, email: user.email, owner: true };
  const sub = await subscriptionFor(context, user);
  const tier = tierOf(sub);
  const bought = !!(sub && sub.apps && sub.apps.videostudio);
  if (!(tier === "pro" || tier === "vip" || bought)) {
    return { ok: false, status: 403, error: "Video Studio er for Pro og VIP, eller de som har kjøpt appen." };
  }
  // Ingen gratis kvote: krev forhåndskjøpt video-kreditt.
  const ckey = "credit:" + user.email;
  let bal = { image: 0, video: 0 };
  try { const r = await env.BUILDER_KV.get(ckey); if (r) bal = JSON.parse(r) || bal; } catch (e) {}
  if ((bal.video || 0) > 0) {
    bal.video = bal.video - 1;
    await env.BUILDER_KV.put(ckey, JSON.stringify(bal));
    return { ok: true, email: user.email, credit: bal.video };
  }
  return { ok: false, status: 402, needCredits: true, error: "Du trenger video-kreditter for å lage video. Kjøp på /kjop-kreditt." };
}

/* Refunder én video-kreditt (når en generering feiler, så ingen betaler for
   noe de ikke fikk). */
export async function refundVideoCredit(context, email) {
  const { env } = context;
  if (!env || !env.BUILDER_KV || !email) return;
  const ckey = "credit:" + email;
  let bal = { image: 0, video: 0 };
  try { const r = await env.BUILDER_KV.get(ckey); if (r) bal = JSON.parse(r) || bal; } catch (e) {}
  bal.video = (bal.video || 0) + 1;
  await env.BUILDER_KV.put(ckey, JSON.stringify(bal));
}

/* =========================================================================
   AI Headshot (egen app): eier gratis, ellers forhåndskjøpt bilde-kreditt.
   Ansiktsbevarende portretter via Higgsfield Soul. Samme prinsipp som Video
   Studio: tilgang åpner døra, kreditt betaler for maskinen. Bruker "image"-
   kreditt (samme som selges på /kjop-kreditt).
   ========================================================================= */

/* Hvem er du, og kreditt-saldo (uten å trekke). */
export async function headshotAppAccess(context) {
  const user = await sessionUser(context);
  if (!user) return { loggedIn: false, owner: false, credit: { image: 0, video: 0 } };
  const credit = await creditFor(context, user.email);
  if (isOwner(user)) return { loggedIn: true, owner: true, credit: credit };
  return { loggedIn: true, owner: false, credit: credit };
}

/* Sjekk tilgang OG trekk én bilde-kreditt (forhåndsbetalt, ingen gratis kvote). */
export async function enforceHeadshotApp(context) {
  const { env } = context;
  if (!env || !env.BUILDER_KV) return { ok: true };
  const user = await sessionUser(context);
  if (!user) return { ok: false, status: 401, error: "Logg inn for å bruke AI Headshot." };
  if (isOwner(user)) return { ok: true, email: user.email, owner: true };
  const ckey = "credit:" + user.email;
  let bal = { image: 0, video: 0 };
  try { const r = await env.BUILDER_KV.get(ckey); if (r) bal = JSON.parse(r) || bal; } catch (e) {}
  if ((bal.image || 0) > 0) {
    bal.image = bal.image - 1;
    await env.BUILDER_KV.put(ckey, JSON.stringify(bal));
    return { ok: true, email: user.email, credit: bal.image };
  }
  return { ok: false, status: 402, needCredits: true, error: "Du trenger bilde-kreditter for å lage headshots. Kjøp på /kjop-kreditt." };
}

/* Refunder én bilde-kreditt (når en generering feiler). */
export async function refundImageCredit(context, email) {
  const { env } = context;
  if (!env || !env.BUILDER_KV || !email) return;
  const ckey = "credit:" + email;
  let bal = { image: 0, video: 0 };
  try { const r = await env.BUILDER_KV.get(ckey); if (r) bal = JSON.parse(r) || bal; } catch (e) {}
  bal.image = (bal.image || 0) + 1;
  await env.BUILDER_KV.put(ckey, JSON.stringify(bal));
}
