/**
 * Delt kilde for betalingslenker og hjelpefunksjoner som brukes av det
 * FAKTISK aktive Stripe-webhook-endepunktet (functions/api/oppskrift-webhook.js,
 * registrert i Stripe som /api/oppskrift-webhook). Ligger her i stedet for i
 * functions/api/stripe-webhook.js fordi det viste seg (sjekket direkte mot
 * Stripe sin liste over webhook-endepunkter 6. august 2026) at
 * stripe-webhook.js ALDRI er registrert der og derfor aldri kjører i
 * produksjon. De to andre registrerte endepunktene er:
 *   - /api/oppskrift-webhook  (denne plattformen, live)
 *   - lme-inner-circle.lmexplorers.workers.dev/webhook/stripe (egen worker,
 *     utenfor dette repoet, håndterer Inner Circle/medlemskap)
 * Kredittpåfyll og Claude-kurset hadde derfor INGEN fungerende
 * leveringsvei, siden koden for dem kun lå i den aldri-registrerte
 * stripe-webhook.js.
 */

/* Kredittpåfyll (engangskjøp) -> antall bilder/video som legges til kontoen.
   Nøkkelen er betalingslenken (payment_link) fra Stripe. Kreditten utløper
   ikke, og ligger på credit:<e-post> ved siden av månedskvoten. */
export const CREDIT_PACKS = {
  "plink_1TwfK1Lax7B8uQzqGggoyx7a": { kind: "image", amount: 25  },
  "plink_1TwfKELax7B8uQzqRYROpOsk": { kind: "image", amount: 75  },
  "plink_1TwfKJLax7B8uQzqTyoZShBP": { kind: "image", amount: 200 },
  "plink_1TwfKOLax7B8uQzqIqnTG1iO": { kind: "video", amount: 3   },
  "plink_1TwfKYLax7B8uQzqKJDGAEOY": { kind: "video", amount: 10  },
  "plink_1TwfKdLax7B8uQzqfUOBWqs6": { kind: "video", amount: 25  },
};

export async function addCredit(env, email, kind, amount) {
  if (!email || !amount) return;
  email = email.trim().toLowerCase();
  const key = "credit:" + email;
  let bal = { image: 0, video: 0 };
  try { const r = await env.BUILDER_KV.get(key); if (r) bal = JSON.parse(r) || bal; } catch (e) {}
  const k = kind === "video" ? "video" : "image";
  bal[k] = (bal[k] || 0) + amount;
  await env.BUILDER_KV.put(key, JSON.stringify(bal));
}

/* ---- Claude-kurset -------------------------------------------------
   Kjøp via Claude-kursets betalingslenker skal IKKE gi Inner Circle,
   men legge kjøperen i MailerLite-gruppen "Claude-kurs, kjøpere", som
   trigger takke- og oppfølgingsautomasjonen. Betalingslenke-ID-ene under
   er hovedkurs (NO/USD) og mersalg (NO/USD). */
export const CLAUDE_GROUP_NO = "193772564746601912"; // "Claude-kurs, kjøpere"
export const CLAUDE_GROUP_EN = "193773243177371424"; // "Claude course, buyers"
// Betalingslenke -> språk. NOK-lenker gir norsk automasjon, USD-lenker engelsk.
export const CLAUDE_PAYMENT_LINK_LANG = {
  "plink_1TwFJWLax7B8uQzqsBQjTBxl": "no", // Kom i gang med Claude (NOK)
  "plink_1TwFJZLax7B8uQzqqjnXtmbR": "no", // Videre med Claude, mersalg (NOK)
  "plink_1TwFJYLax7B8uQzqO1gObkcB": "en", // Get started with Claude (USD)
  "plink_1TwFJbLax7B8uQzqB3CNr2yR": "en", // Next Level with Claude, upsell (USD)
};
// Bare hovedkurset trigger takke- og oppfølgingsmail. Mersalget legges
// bare i gruppen (kjøperen har alt fått takkemailen fra hovedkjøpet).
export const CLAUDE_MAIN_LINK_LANG = {
  "plink_1TwFJWLax7B8uQzqsBQjTBxl": "no", // Kom i gang med Claude (NOK)
  "plink_1TwFJYLax7B8uQzqO1gObkcB": "en", // Get started with Claude (USD)
};

export async function addToClaudeGroup(env, email, name, groupId) {
  const key = env.MAILERLITE_API_KEY;
  if (!key || !email || !groupId) return;
  const payload = { email: email.trim(), groups: [groupId + ""] };
  if (name && name.trim()) payload.fields = { name: name.trim().slice(0, 100) };
  try {
    await fetch("https://connect.mailerlite.com/api/subscribers", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + key,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    });
  } catch (e) {}
}

/* ---- LME Autopilot-abonnement (Start/Proff/VIP), solgt fra /oppgrader ----
   IKKE Inner Circle (som håndteres av den separate lme-inner-circle-workeren).
   Betalingslenkene under ble tidligere kun håndtert i den aldri-registrerte
   stripe-webhook.js (se CS_PLANS der), så betalende kunder fikk verken
   e-post eller faktisk tilgang. Verifisert 1:1 mot knappene på /oppgrader
   og mot Stripe sin liste over betalingslenker samme dag som denne flyttingen. */
export const AUTOPILOT_PAYMENT_LINKS = {
  "plink_1Ty9NeLax7B8uQzqIlM5RCuB": { plan: "cs-start", limits: { image: 30,  video: 1  }, planLabel: "LME Autopilot – Start", lang: "no" },
  "plink_1Ty9NlLax7B8uQzqrRrPUgkr": { plan: "cs-start", limits: { image: 30,  video: 1  }, planLabel: "LME Autopilot – Start", lang: "en" },
  "plink_1TxaxbLax7B8uQzq9nJeLLHB": { plan: "cs-proff", limits: { image: 100, video: 6  }, planLabel: "LME Autopilot – Proff", lang: "no" },
  "plink_1TxaxcLax7B8uQzqQWSj2nuD": { plan: "cs-proff", limits: { image: 100, video: 6  }, planLabel: "LME Autopilot – Proff", lang: "en" },
  "plink_1TxaxeLax7B8uQzqhpvfmUta": { plan: "cs-pluss", limits: { image: 250, video: 15 }, planLabel: "LME Autopilot – VIP",   lang: "no" },
  "plink_1TxaxfLax7B8uQzq0VIMveFM": { plan: "cs-pluss", limits: { image: 250, video: 15 }, planLabel: "LME Autopilot – VIP",   lang: "en" },
  "plink_1TxaxhLax7B8uQzqYOEHA6O9": { plan: "cs-pluss", limits: { image: 250, video: 15 }, planLabel: "LME Autopilot – VIP (årlig)", lang: "no" },
  "plink_1TxaxiLax7B8uQzqCSt5zYag": { plan: "cs-pluss", limits: { image: 250, video: 15 }, planLabel: "LME Autopilot – VIP (årlig)", lang: "en" },
};

function memberKey(email) { return "member:" + email.trim().toLowerCase(); }
function custKey(id) { return "scust:" + id; }
function userKey(email) { return "user:" + email.trim().toLowerCase(); }

/* Gir/oppdaterer et LME Autopilot-abonnement i KV, lest av enforceGeneration
   i _lib/access.js (member:<e-post>, speilet til user:<e-post> hvis kontoen
   finnes). Samme lagringsformat som Inner Circle bruker, plan/limits skiller dem. */
export async function grantAutopilot(env, email, info) {
  if (!email) return;
  const mkey = memberKey(email);
  let prevM = {};
  try { const r = await env.BUILDER_KV.get(mkey); if (r) prevM = JSON.parse(r) || {}; } catch (e) {}
  const rec = {
    status: "active", source: "stripe", since: prevM.since || Date.now(),
    plan: info.plan, tier: prevM.tier || null, limits: info.limits,
    customer: info.customer || prevM.customer || null,
    sub: info.sub || prevM.sub || null,
    updated: Date.now(),
  };
  await env.BUILDER_KV.put(mkey, JSON.stringify(rec));
  if (info.customer) await env.BUILDER_KV.put(custKey(info.customer), email.trim().toLowerCase());
  const uraw = await env.BUILDER_KV.get(userKey(email));
  if (uraw) {
    try {
      const u = JSON.parse(uraw);
      u.subscription = { status: rec.status, plan: rec.plan, tier: rec.tier, limits: rec.limits, source: "stripe", updated: rec.updated };
      await env.BUILDER_KV.put(userKey(email), JSON.stringify(u));
    } catch (e) {}
  }
}

/* Samme plan/limits som AUTOPILOT_PAYMENT_LINKS over, men nøkkelen er
   Stripe-produktet (ikke betalingslenken), siden abonnements-hendelser
   (customer.subscription.updated/deleted) refererer til produktet på
   prisen, ikke lenken kjøpet startet fra. Brukes til å holde tilgangen
   riktig ved fornyelse/oppsigelse, ikke bare ved selve kjøpet. */
export const AUTOPILOT_PRODUCT_PLANS = {
  "prod_UwWlnVHko5a1Dt": { plan: "cs-start", limits: { image: 30,  video: 1  } },
  "prod_UTtEl6dxkbq4qM": { plan: "cs-proff", limits: { image: 100, video: 6  } },
  "prod_UwWmmP16D4lT5Z": { plan: "cs-pluss", limits: { image: 250, video: 15 } },
};

export async function emailForStripeCustomer(env, customerId) {
  if (!customerId) return null;
  return await env.BUILDER_KV.get(custKey(customerId));
}

/* Fjerner et LME Autopilot-abonnement (oppsigelse/betaling feilet).
   Rører kun status, ikke plan/limits, i tilfelle hun vil se hva de hadde. */
export async function revokeAutopilot(env, email) {
  if (!email) return;
  const mkey = memberKey(email);
  const raw = await env.BUILDER_KV.get(mkey);
  let rec = { status: "canceled", source: "stripe" };
  if (raw) { try { rec = JSON.parse(raw) || rec; } catch (e) {} }
  rec.status = "canceled";
  rec.updated = Date.now();
  await env.BUILDER_KV.put(mkey, JSON.stringify(rec));
  const uraw = await env.BUILDER_KV.get(userKey(email));
  if (uraw) {
    try {
      const u = JSON.parse(uraw);
      if (u.subscription) { u.subscription.status = "canceled"; u.subscription.updated = Date.now(); }
      await env.BUILDER_KV.put(userKey(email), JSON.stringify(u));
    } catch (e) {}
  }
}

/* ---- Låste enkeltkurs (YouTube, Videre med YouTube, KI for pedagoger) ----
   Ikke Inner Circle, ikke abonnement: engangskjøp, tilgang for alltid via
   en personlig lenke i leveringsmailen (se _lib/course-access.js). Hvert
   kurs har en "launch"-pris (i dag) og en "full"-pris (fra en senere dato),
   samme betalingslenke-mønster som resten av filen. */
export const COURSE_PAYMENT_LINKS = {
  // Voks på YouTube med AI
  "plink_1U1ro3Lax7B8uQzqrOlk5h4w": { courseId: "youtube", tier: "launch", lang: "no" },
  "plink_1U1ro8Lax7B8uQzqdP7TkfBY": { courseId: "youtube", tier: "launch", lang: "en" },
  "plink_1U1roDLax7B8uQzq2YNSJ5ZM": { courseId: "youtube", tier: "full",   lang: "no" },
  "plink_1U1roHLax7B8uQzq4erjXa5Q": { courseId: "youtube", tier: "full",   lang: "en" },
  // Videre med YouTube
  "plink_1U1roNLax7B8uQzqDMRVRv0S": { courseId: "youtube-videre", tier: "launch", lang: "no" },
  "plink_1U1roTLax7B8uQzqdR3O7LPO": { courseId: "youtube-videre", tier: "launch", lang: "en" },
  "plink_1U1roYLax7B8uQzq1Gz0QTdR": { courseId: "youtube-videre", tier: "full",   lang: "no" },
  "plink_1U1rocLax7B8uQzqV05mnxvI": { courseId: "youtube-videre", tier: "full",   lang: "en" },
  // KI for pedagoger
  "plink_1U1roiLax7B8uQzqnBcnb7LH": { courseId: "ki-pedagoger", tier: "launch", lang: "no" },
  "plink_1U1ronLax7B8uQzqPAtyjLaz": { courseId: "ki-pedagoger", tier: "launch", lang: "en" },
  "plink_1U1rorLax7B8uQzqDVl9503R": { courseId: "ki-pedagoger", tier: "full",   lang: "no" },
  "plink_1U1rovLax7B8uQzqQQKKxMdB": { courseId: "ki-pedagoger", tier: "full",   lang: "en" },
};

export const COURSE_INFO = {
  "youtube": {
    name: { no: "Voks på YouTube med AI", en: "Grow on YouTube with AI" },
    url: "https://lmexplorers.com/academy/youtube",
  },
  "youtube-videre": {
    name: { no: "Videre med YouTube", en: "Next Level with YouTube" },
    url: "https://lmexplorers.com/academy/youtube-videre",
  },
  "ki-pedagoger": {
    name: { no: "KI for pedagoger", en: "AI for Educators" },
    url: "https://lmexplorers.com/academy/ki-for-pedagoger",
  },
};
