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
  // Voks e-postlisten din
  "plink_1U2H3gLax7B8uQzqgARx4SGb": { courseId: "epostliste", tier: "launch", lang: "no" },
  "plink_1U2H3iLax7B8uQzqTsSkr9a0": { courseId: "epostliste", tier: "launch", lang: "en" },
  "plink_1U2H3hLax7B8uQzquNbVhZEW": { courseId: "epostliste", tier: "full",   lang: "no" },
  "plink_1U2H3jLax7B8uQzqsue9AdYd": { courseId: "epostliste", tier: "full",   lang: "en" },
  // Kursbygger-kurs (lagret i KV, vist på academy/kurs.html?k=<slug>). Fast
  // pris, ingen lanserings-/fullpris-splitt.
  "plink_1U1sDiLax7B8uQzqqHGOPBAe": { courseId: "lme-markedsfoering-med-claude", tier: "standard", lang: "no" },
  "plink_1U1sDnLax7B8uQzqjYHNAZui": { courseId: "lme-markedsfoering-med-claude", tier: "standard", lang: "en" },
  "plink_1U1sDvLax7B8uQzqUmjOAMbN": { courseId: "lag-ditt-foerste-digitale-minikurs", tier: "standard", lang: "no" },
  "plink_1U1sDzLax7B8uQzqZRyfpuwu": { courseId: "lag-ditt-foerste-digitale-minikurs", tier: "standard", lang: "en" },
  "plink_1U2I9tLax7B8uQzqCYi2ntGG": { courseId: "montessori-masterclass", tier: "standard", lang: "no" },
  "plink_1U2I9uLax7B8uQzqYzTq1jUw": { courseId: "montessori-masterclass", tier: "standard", lang: "en" },
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
  "epostliste": {
    name: { no: "Voks e-postlisten din", en: "Grow your email list" },
    url: "https://lmexplorers.com/academy/epostliste",
  },
  "lme-markedsfoering-med-claude": {
    name: { no: "LME Markedsføring med Claude", en: "LME Marketing with Claude" },
    url: "https://lmexplorers.com/academy/kurs?k=lme-markedsfoering-med-claude",
  },
  "lag-ditt-foerste-digitale-minikurs": {
    name: { no: "Lag ditt første digitale minikurs", en: "Create your first digital mini-course" },
    url: "https://lmexplorers.com/academy/kurs?k=lag-ditt-foerste-digitale-minikurs",
  },
  "montessori-masterclass": {
    name: { no: "Montessori mesterklasse", en: "Montessori Masterclass" },
    url: "https://lmexplorers.com/academy/kurs?k=montessori-masterclass",
  },
};

/* Kursbygger-slugs som krever kjøp for å lese innholdet (academy/kurs.html
   sjekker denne listen mot URL-slugen). Fri liste å utvide når flere kurs
   skal prises, uendret struktur ellers. */
export const PAID_KURSBYGGER_SLUGS = [
  "lme-markedsfoering-med-claude",
  "lag-ditt-foerste-digitale-minikurs",
  "montessori-masterclass",
];

/* ---- Lås opp ENKELTMODUL (Skool-stil) -----------------------------------
   I tillegg til å kjøpe hele kurset (COURSE_PAYMENT_LINKS over) kan en
   modul merkes "paid" i Kursbygger med sin egen pris og betalingslenke
   (functions/api/kurs.js: lesson.module.lock/price/paylink). Når en slik
   modul faktisk skal selges, opprett et Stripe-produkt/betalingslenke
   (samme fremgangsmåte som resten av filen) og legg den inn her, nøyaktig
   som COURSE_PAYMENT_LINKS: { courseId, moduleKey } — moduleKey må være
   IDENTISK med modulnavnet (norsk) skrevet inn i Kursbygger, siden det
   brukes til å slå opp riktig modul på kurssiden.
   Tom liste = ingen enkeltmoduler til salgs ennå. */
export const MODULE_PAYMENT_LINKS = {
  // "plink_...": { courseId: "eksempel-kurs", moduleKey: "Modul 2 · Tema", lang: "no" },
};

/* ---- LME Læringsverksted: enkeltressurser og samlepakker ----------------
   Samme mønster som MODULE_PAYMENT_LINKS over. Renate setter Stripe-
   betalingslenken som "Kjøpslenke" på ressursen i /laeringsverksted-bygger;
   når den ressursen faktisk skal telles i kjøpsloggen og utløse en
   leveringsmail med fillenken (ressursens "fileUrl"), legg den samme
   lenken inn her med ressursens slug. Tom liste = ingen ressurser med
   sporet Stripe-kjøp ennå (gratisressurser trenger ikke dette, de lenker
   rett til fila). */
export const LAERINGSVERKSTED_PAYMENT_LINKS = {
  // Mia & Teo – Følelser og sosial kompetanse (Renate, 9. august 2026).
  // Opprettet direkte via Stripe (produkt + pris + betalingslenke) i samme
  // økt som ressursene ble lagt inn, se seed-laeringsverksted-data.js.
  "plink_1U2ZQrLax7B8uQzqJRKmbwYG": { slug: "mia-teo-utforsker-folelsene", license: "privat", lang: "no" },
  "plink_1U2ZQsLax7B8uQzq7wX3Pdc4": { slug: "mia-teo-situasjonskort", license: "privat", lang: "no" },
  "plink_1U2ZQtLax7B8uQzqY5pl66U0": { slug: "mia-teo-snakke-om-folelser", license: "privat", lang: "no" },
  "plink_1U2ZQuLax7B8uQzqfo48xZlf": { slug: "mia-teo-folelsene-i-kroppen-3-6", license: "privat", lang: "no" },
  "plink_1U2ZQwLax7B8uQzqNkanwBIS": { slug: "mia-teo-folelsene-i-kroppen-6-9", license: "privat", lang: "no" },
  "plink_1U2ZQxLax7B8uQzqC6WWz3a9": { slug: "mia-teo-min-folelsesbok-3-6", license: "privat", lang: "no" },
  "plink_1U2ZQyLax7B8uQzqJztVUHcQ": { slug: "mia-teo-min-folelsesbok-6-9", license: "privat", lang: "no" },
  // Åttende og niende produkt lagt til i samlepakken 9. august 2026.
  // Samlepakken fikk da ny pris (549 kr) og dermed ny betalingslenke;
  // den gamle lenken (plink_1U2ZQzLax7B8uQzqJUhIWZKR, 449 kr) er satt
  // inaktiv i Stripe, ikke bare fjernet herfra, i tilfelle et gammelt
  // kjøp fortsatt refereres til den et sted.
  "plink_1U2a8ULax7B8uQzqxi9o1YSm": { slug: "mia-teo-folelsestermometer-3-6", license: "privat", lang: "no" },
  "plink_1U2a8WLax7B8uQzqvZNdtYOh": { slug: "mia-teo-folelsestermometer-6-9", license: "privat", lang: "no" },
  "plink_1U2a8hLax7B8uQzqH7Zx4cDl": { slug: "mia-teo-folelser-serien-komplett", license: "privat", lang: "no" },
  // Tre nye, frittstående serier (ikke en del av "Følelser og sosial
  // kompetanse"-samlepakken): Min dag, Sosiale historier, Jeg kan selv
  // (Renate, 9. august 2026, priser bekreftet samme dag).
  "plink_1U2bbILax7B8uQzq3YJ79hx5": { slug: "mia-teo-min-dag-3-6", license: "privat", lang: "no" },
  "plink_1U2bbJLax7B8uQzqge9Wc04v": { slug: "mia-teo-min-dag-6-9", license: "privat", lang: "no" },
  "plink_1U2bbLLax7B8uQzqNAvqGrDA": { slug: "mia-teo-sosiale-historier-3-6", license: "privat", lang: "no" },
  "plink_1U2bbMLax7B8uQzq1wOPa1Yo": { slug: "mia-teo-sosiale-historier-6-9", license: "privat", lang: "no" },
  "plink_1U2bbNLax7B8uQzqovubG0g6": { slug: "mia-teo-jeg-kan-selv-3-6", license: "privat", lang: "no" },
  "plink_1U2bbOLax7B8uQzqJ7EdlPJF": { slug: "mia-teo-jeg-kan-selv-6-9", license: "privat", lang: "no" },
  // Fjerde frittstående serie: Språklek (Renate, 9. august 2026).
  "plink_1U2cNyLax7B8uQzqj1DNOWdW": { slug: "mia-teo-spraklek-3-6", license: "privat", lang: "no" },
  "plink_1U2cNzLax7B8uQzqmKC7F8np": { slug: "mia-teo-spraklek-6-9", license: "privat", lang: "no" },
  // Femte og sjette frittstående serie: Matematikklek og Bokstavverksted
  // (Renate, 10. august 2026).
  "plink_1U2grWLax7B8uQzqDqXL79mu": { slug: "mia-teo-matematikklek-3-6", license: "privat", lang: "no" },
  "plink_1U2grYLax7B8uQzqwnON43se": { slug: "mia-teo-matematikklek-6-9", license: "privat", lang: "no" },
  "plink_1U2grZLax7B8uQzqG3pNqsLF": { slug: "mia-teo-bokstavverksted-3-6", license: "privat", lang: "no" },
  "plink_1U2grZLax7B8uQzqluKHsm4w": { slug: "mia-teo-bokstavverksted-6-9", license: "privat", lang: "no" },
  // Syvende og åttende frittstående serie: Naturverksted (Renate, 10. august 2026).
  "plink_1U2h06Lax7B8uQzqyh1ykDGD": { slug: "mia-teo-naturverksted-3-6", license: "privat", lang: "no" },
  "plink_1U2h06Lax7B8uQzqMsP3BrMz": { slug: "mia-teo-naturverksted-6-9", license: "privat", lang: "no" },
};

/* ---- Mia & Teo skoledagbok (butikk/skoledagbok.html + shop/books.html) --
   Hvert kjøp (uansett hvilken språk-lenke/pris kunden brukte) leverer BEGGE
   språk av samme trinn, siden produktbeskrivelsen på Stripe lover "digital
   nedlasting på norsk og engelsk" i ett kjøp. "lang" styrer kun hvilket
   språk selve leveringsmailen skrives på. Verifisert direkte mot Stripe
   11. august 2026 (samme plink-ID-er som data-no-href/data-en-href i
   butikk/skoledagbok.html og knappene på shop/books.html). Fantes IKKE i
   denne fila før, så kjøpere fikk ingen leveringsmail i det hele tatt. */
export const SKOLEDAGBOK_PAYMENT_LINKS = {
  "plink_1TeiNwLax7B8uQzqZQapSIuh": { book: "1-3", lang: "no" },
  "plink_1TeiO1Lax7B8uQzqxIRhXLMv": { book: "1-3", lang: "en" },
  "plink_1TeiO7Lax7B8uQzqLDGdL9KI": { book: "4-7", lang: "no" },
  "plink_1TeiOFLax7B8uQzqhLt2NsdA": { book: "4-7", lang: "en" },
};

const DL_SKOLEDAGBOK = "https://lmexplorers.com/butikk/nedlasting/skoledagbok/";
export const SKOLEDAGBOK_INFO = {
  "1-3": {
    name: { no: "Mia & Teo Skoledagbok, 1.–3. trinn", en: "Mia & Teo School Diary, Grades 1–3" },
    files: {
      no: DL_SKOLEDAGBOK + "skoledagbok-1-3-trinn.pdf",
      en: DL_SKOLEDAGBOK + "skoledagbok-1-3-trinn-en.pdf",
    },
  },
  "4-7": {
    name: { no: "Mia & Teo Skoledagbok, 4.–7. trinn", en: "Mia & Teo School Diary, Grades 4–7" },
    files: {
      no: DL_SKOLEDAGBOK + "skoledagbok-4-7-trinn.pdf",
      en: DL_SKOLEDAGBOK + "skoledagbok-4-7-trinn-en.pdf",
    },
  },
};
