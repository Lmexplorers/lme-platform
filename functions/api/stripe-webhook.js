/**
 * LME Stripe-webhook — gir Inner Circle-tilgang automatisk ved betaling.
 *
 * Stripe sender hit naar noen betaler (Payment Link / Checkout). Vi
 * verifiserer signaturen, finner e-posten og skriver medlemskap til KV slik
 * at gruppe-chatten (isMember) slipper dem inn. Ved oppsigelse fjernes det.
 *
 *   POST /api/stripe-webhook   (sett denne URL-en i Stripe > Developers >
 *                               Webhooks, og lim signeringsnoekkelen inn som
 *                               env-variabelen STRIPE_WEBHOOK_SECRET)
 *
 * Lagring i KV:
 *   member:<e-post>   -> { status, plan, source:"stripe", customer, sub, since, updated }
 *   scust:<kunde-id>  -> <e-post>     (for aa kunne fjerne ved oppsigelse)
 * I tillegg speiles abonnementet inn paa user:<e-post> hvis kontoen finnes,
 * saa "Min konto" viser status.
 */

import { sendClaudeMail } from "../_lib/claude-mail.js";
import { registerNewsletter } from "../_lib/newsletter.js";
import { sendOppskriftMail } from "../_lib/oppskrift-mail.js";

/* Oppskrift-kjøp (bøttehatt/skaut): betalingslenke -> { produkt-id, språk }.
   NOK-lenker = norsk, USD-lenker = engelsk. Disse skal IKKE gi Inner Circle,
   men leveringsmail med oppskrift + mersalg, og to oppfølgere i kø. */
const PATTERN_LINKS = {
  // ro-strikk
  "plink_1TqKogLax7B8uQzq2xw0LSkj": { p: "ro-strikk", lang: "no" },
  "plink_1TqQJQLax7B8uQzqTYsUhiw6": { p: "ro-strikk", lang: "en" },
  // ro-hekle
  "plink_1TqKqMLax7B8uQzqqzdIpLFQ": { p: "ro-hekle", lang: "no" },
  "plink_1TqQJRLax7B8uQzqcH4uvgp1": { p: "ro-hekle", lang: "en" },
  // norway-strikk
  "plink_1TqKqNLax7B8uQzqoD0SH4Eu": { p: "norway-strikk", lang: "no" },
  "plink_1TqQJTLax7B8uQzqr0aWK1ZI": { p: "norway-strikk", lang: "en" },
  // norway-hekle
  "plink_1TqKqPLax7B8uQzqFThJKSO0": { p: "norway-hekle", lang: "no" },
  "plink_1TqQJULax7B8uQzqQEC8Ufr0": { p: "norway-hekle", lang: "en" },
  // norge-strikk (maskesting)
  "plink_1TqKqRLax7B8uQzqZ33h4h5J": { p: "norge-strikk", lang: "no" },
  "plink_1TqQJWLax7B8uQzqMybvRaX0": { p: "norge-strikk", lang: "en" },
  // norge-blokk
  "plink_1TqKqSLax7B8uQzqI6IBFKx2": { p: "norge-blokk", lang: "no" },
  "plink_1TqQJYLax7B8uQzqmY39qwMJ": { p: "norge-blokk", lang: "en" },
  // norge-innstrikket
  "plink_1TqKqULax7B8uQzqKE7t9KhT": { p: "norge-innstrikket", lang: "no" },
  "plink_1TqQJZLax7B8uQzqfnPEL2iV": { p: "norge-innstrikket", lang: "en" },
  // norge-rune
  "plink_1Tv4bQLax7B8uQzq4ghj2ZQD": { p: "norge-rune", lang: "no" },
  "plink_1Tv4baLax7B8uQzq692btr6j": { p: "norge-rune", lang: "en" },
  // norge-hekle
  "plink_1TqKqWLax7B8uQzq3zOum7nH": { p: "norge-hekle", lang: "no" },
  "plink_1TqQJbLax7B8uQzqIRUPmFMG": { p: "norge-hekle", lang: "en" },
  // norge-skaut (strikk)
  "plink_1TqKqYLax7B8uQzqYB906yIN": { p: "norge-skaut", lang: "no" },
  "plink_1TqQJcLax7B8uQzql7E8ODDo": { p: "norge-skaut", lang: "en" },
  // norge-skaut-hekle
  "plink_1TqR9WLax7B8uQzqmRsRLibH": { p: "norge-skaut-hekle", lang: "no" },
  "plink_1TqR9cLax7B8uQzqfJ5Gst5g": { p: "norge-skaut-hekle", lang: "en" },
  // norge-pakke
  "plink_1TqKqZLax7B8uQzq6QM3SDtw": { p: "norge-pakke", lang: "no" },
  "plink_1TqQJeLax7B8uQzqW0TTjWXK": { p: "norge-pakke", lang: "en" },
  // hekle-pakke (249)
  "plink_1TxlCHLax7B8uQzqptsW5CFG": { p: "hekle-pakke", lang: "no" },
  "plink_1TxlCILax7B8uQzqQF0Gx73q": { p: "hekle-pakke", lang: "en" },
  // strikk-pakke (299)
  "plink_1TxlerLax7B8uQzq3kWa07U1": { p: "strikk-pakke", lang: "no" },
  "plink_1TxletLax7B8uQzqylxXeWJL": { p: "strikk-pakke", lang: "en" },

  // Nye engelske lenker (tospråklig produktnavn i kassa: norsk · engelsk).
  // De gamle EN-lenkene over beholdes så eldre lenker i omløp fortsatt virker.
  "plink_1TxrRlLax7B8uQzqPpCoVfoO": { p: "ro-strikk", lang: "en" },
  "plink_1TxrRnLax7B8uQzqqrL5tVeg": { p: "ro-hekle", lang: "en" },
  "plink_1TxrRpLax7B8uQzqe7oMynMt": { p: "norway-strikk", lang: "en" },
  "plink_1TxrRrLax7B8uQzqrYnmcj3k": { p: "norway-hekle", lang: "en" },
  "plink_1TxrRsLax7B8uQzqKbcXPYtf": { p: "norge-strikk", lang: "en" },
  "plink_1TxrQWLax7B8uQzqV0F0wFWd": { p: "norge-blokk", lang: "en" },
  "plink_1TxrRuLax7B8uQzq4sfhppLa": { p: "norge-innstrikket", lang: "en" },
  "plink_1TxrRwLax7B8uQzqXGCZRLbA": { p: "norge-rune", lang: "en" },
  "plink_1TxrS2Lax7B8uQzqRcvpl8BH": { p: "norge-hekle", lang: "en" },
  "plink_1TxrS4Lax7B8uQzqIS6A7dXx": { p: "norge-skaut", lang: "en" },
  "plink_1TxrS5Lax7B8uQzqLzPCxlC6": { p: "norge-skaut-hekle", lang: "en" },
  "plink_1TxrS7Lax7B8uQzqGY8kviD5": { p: "norge-pakke", lang: "en" },
  "plink_1TxrS9Lax7B8uQzqIZL2EOrd": { p: "hekle-pakke", lang: "en" },
  "plink_1TxrSBLax7B8uQzqDA7jDjxK": { p: "strikk-pakke", lang: "en" },

  // Egen engelsk butikk (/shop): rene engelske produkter, engelsk-only kasse.
  "plink_1Txrq1Lax7B8uQzqjdWrx6Bl": { p: "ro-strikk", lang: "en" },
  "plink_1Txrq3Lax7B8uQzqYl8dOHJz": { p: "ro-hekle", lang: "en" },
  "plink_1Txrq5Lax7B8uQzqRWkOPQ07": { p: "norway-strikk", lang: "en" },
  "plink_1Txrq7Lax7B8uQzqo1iHeeXl": { p: "norway-hekle", lang: "en" },
  "plink_1Txrq9Lax7B8uQzqfS6xHMyB": { p: "norge-strikk", lang: "en" },
  "plink_1TxrqALax7B8uQzq74PYo73L": { p: "norge-blokk", lang: "en" },
  "plink_1TxrqCLax7B8uQzq53fOdLHy": { p: "norge-innstrikket", lang: "en" },
  "plink_1TxrqSLax7B8uQzq2sbB4c71": { p: "norge-rune", lang: "en" },
  "plink_1TxrqULax7B8uQzq52Cj0HbC": { p: "norge-hekle", lang: "en" },
  "plink_1TxrqWLax7B8uQzq6gLCuUFb": { p: "norge-skaut", lang: "en" },
  "plink_1TxrqXLax7B8uQzq2JYnJPzK": { p: "norge-skaut-hekle", lang: "en" },
  "plink_1TxrqZLax7B8uQzqkad1ruv4": { p: "norge-pakke", lang: "en" },
  "plink_1TxrqcLax7B8uQzqvG5N7UZ1": { p: "hekle-pakke", lang: "en" },
  "plink_1TxrqdLax7B8uQzqw2Dy9miq": { p: "strikk-pakke", lang: "en" },
};

function json(data, status) {
  return new Response(JSON.stringify(data), {
    status: status || 200,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

function hex(buf) {
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

/* Verifiser Stripe-Signature: t=<ts>,v1=<hmac sha256 av "ts.body"> */
async function verifyStripe(rawBody, sigHeader, secret) {
  if (!sigHeader || !secret) return false;
  const parts = {};
  sigHeader.split(",").forEach((kv) => {
    const i = kv.indexOf("=");
    if (i > 0) {
      const k = kv.slice(0, i).trim();
      const v = kv.slice(i + 1).trim();
      if (k === "v1") (parts.v1 = parts.v1 || []).push(v);
      else parts[k] = v;
    }
  });
  if (!parts.t || !parts.v1) return false;
  const key = await crypto.subtle.importKey(
    "raw", new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" }, false, ["sign"]
  );
  const mac = await crypto.subtle.sign(
    "HMAC", key, new TextEncoder().encode(parts.t + "." + rawBody)
  );
  const expected = hex(mac);
  // konstant-tid sammenligning mot alle v1-signaturer
  return parts.v1.some((sig) => {
    if (sig.length !== expected.length) return false;
    let diff = 0;
    for (let i = 0; i < sig.length; i++) diff |= sig.charCodeAt(i) ^ expected.charCodeAt(i);
    return diff === 0;
  });
}

function memberKey(email) { return "member:" + email.trim().toLowerCase(); }
function custKey(id) { return "scust:" + id; }
function userKey(email) { return "user:" + email.trim().toLowerCase(); }

/* Content Studio-produkter -> plan og månedskvote (bilder/video). */
const CS_PLANS = {
  "prod_UwWlnVHko5a1Dt": { plan: "cs-start", limits: { image: 30,  video: 1  } },
  "prod_UTtEl6dxkbq4qM": { plan: "cs-proff", limits: { image: 100, video: 6  } },
  "prod_UwWmmP16D4lT5Z": { plan: "cs-pluss", limits: { image: 250, video: 15 } },
};

/* Kredittpåfyll (engangskjøp) -> antall bilder/video som legges til kontoen.
   Nøkkelen er betalingslenken (payment_link) fra Stripe. Kreditten utløper
   ikke, og ligger på credit:<e-post> ved siden av månedskvoten. */
const CREDIT_PACKS = {
  "plink_1TwfK1Lax7B8uQzqGggoyx7a": { kind: "image", amount: 25  },
  "plink_1TwfKELax7B8uQzqRYROpOsk": { kind: "image", amount: 75  },
  "plink_1TwfKJLax7B8uQzqTyoZShBP": { kind: "image", amount: 200 },
  "plink_1TwfKOLax7B8uQzqIqnTG1iO": { kind: "video", amount: 3   },
  "plink_1TwfKYLax7B8uQzqKJDGAEOY": { kind: "video", amount: 10  },
  "plink_1TwfKdLax7B8uQzqfUOBWqs6": { kind: "video", amount: 25  },
};

async function addCredit(env, email, kind, amount) {
  if (!email || !amount) return;
  email = email.trim().toLowerCase();
  const key = "credit:" + email;
  let bal = { image: 0, video: 0 };
  try { const r = await env.BUILDER_KV.get(key); if (r) bal = JSON.parse(r) || bal; } catch (e) {}
  const k = kind === "video" ? "video" : "image";
  bal[k] = (bal[k] || 0) + amount;
  await env.BUILDER_KV.put(key, JSON.stringify(bal));
}

async function grant(env, email, info) {
  if (!email) return;
  const mkey = memberKey(email);
  let prevM = {};
  try { const r = await env.BUILDER_KV.get(mkey); if (r) prevM = JSON.parse(r) || {}; } catch (e) {}
  const plan = (info && info.plan) || (prevM.plan && String(prevM.plan).indexOf("cs-") === 0 ? prevM.plan : "inner-circle");
  const limits = (info && info.limits) || prevM.limits || null;
  // Medlemsnivå (Inner Circle): kommer fra Stripe-metadata (tier), settes av
  // medlemskaps-checkouten. Beholdes hvis en senere hendelse ikke sender det.
  const tier = (info && info.tier) || prevM.tier || null;
  const rec = {
    status: "active", source: "stripe", since: prevM.since || Date.now(),
    plan: plan, tier: tier, limits: limits,
    customer: (info && info.customer) || prevM.customer || null,
    sub: (info && info.sub) || prevM.sub || null,
    updated: Date.now(),
  };
  await env.BUILDER_KV.put(mkey, JSON.stringify(rec));
  if (info && info.customer) await env.BUILDER_KV.put(custKey(info.customer), email.toLowerCase());
  // Speil til kontoen hvis den finnes
  const uraw = await env.BUILDER_KV.get(userKey(email));
  if (uraw) {
    try {
      const u = JSON.parse(uraw);
      u.subscription = { status: rec.status, plan: rec.plan, tier: rec.tier, limits: rec.limits, source: "stripe", updated: rec.updated };
      await env.BUILDER_KV.put(userKey(email), JSON.stringify(u));
    } catch (e) {}
  }
}

async function revoke(env, email) {
  if (!email) return;
  const raw = await env.BUILDER_KV.get(memberKey(email));
  let rec = { status: "canceled", source: "stripe" };
  if (raw) { try { rec = JSON.parse(raw); } catch (e) {} }
  rec.status = "canceled";
  rec.updated = Date.now();
  await env.BUILDER_KV.put(memberKey(email), JSON.stringify(rec));
  const uraw = await env.BUILDER_KV.get(userKey(email));
  if (uraw) {
    try {
      const u = JSON.parse(uraw);
      if (u.subscription) { u.subscription.status = "canceled"; u.subscription.updated = Date.now(); }
      await env.BUILDER_KV.put(userKey(email), JSON.stringify(u));
    } catch (e) {}
  }
}

async function emailForCustomer(env, customerId) {
  if (!customerId) return null;
  return await env.BUILDER_KV.get(custKey(customerId));
}

/* ---- Claude-kurset -------------------------------------------------
   Kjøp via Claude-kursets betalingslenker skal IKKE gi Inner Circle,
   men legge kjøperen i MailerLite-gruppen "Claude-kurs, kjøpere", som
   trigger takke- og oppfølgingsautomasjonen. Betalingslenke-ID-ene under
   er hovedkurs (NO/USD) og mersalg (NO/USD). */
const CLAUDE_GROUP_NO = "193772564746601912"; // "Claude-kurs, kjøpere"
const CLAUDE_GROUP_EN = "193773243177371424"; // "Claude course, buyers"
// Betalingslenke -> språk. NOK-lenker gir norsk automasjon, USD-lenker engelsk.
const CLAUDE_PAYMENT_LINK_LANG = {
  "plink_1TwFJWLax7B8uQzqsBQjTBxl": "no", // Kom i gang med Claude (NOK)
  "plink_1TwFJZLax7B8uQzqqjnXtmbR": "no", // Videre med Claude, mersalg (NOK)
  "plink_1TwFJYLax7B8uQzqO1gObkcB": "en", // Get started with Claude (USD)
  "plink_1TwFJbLax7B8uQzqB3CNr2yR": "en", // Next Level with Claude, upsell (USD)
};
// Bare hovedkurset trigger takke- og oppfølgingsmail. Mersalget legges
// bare i gruppen (kjøperen har alt fått takkemailen fra hovedkjøpet).
const CLAUDE_MAIN_LINK_LANG = {
  "plink_1TwFJWLax7B8uQzqsBQjTBxl": "no", // Kom i gang med Claude (NOK)
  "plink_1TwFJYLax7B8uQzqO1gObkcB": "en", // Get started with Claude (USD)
};

async function addToClaudeGroup(env, email, name, groupId) {
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

export async function onRequestPost(context) {
  const { request, env } = context;
  if (!env.BUILDER_KV) return json({ error: "not_configured" }, 503);
  // Noekkelen kan ligge i KV (limt inn paa /grupper/admin) eller som env-variabel.
  const secret = (await env.BUILDER_KV.get("config:stripe_webhook_secret")) || env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    // Signaliser tydelig i Stripe-dashbordet at noekkelen mangler.
    return json({ error: "missing_webhook_secret" }, 503);
  }

  const raw = await request.text();
  const ok = await verifyStripe(raw, request.headers.get("Stripe-Signature"), secret);
  if (!ok) return json({ error: "bad_signature" }, 400);

  let event;
  try { event = JSON.parse(raw); } catch (e) { return json({ error: "bad_json" }, 400); }
  const obj = (event.data && event.data.object) || {};

  switch (event.type) {
    case "checkout.session.completed": {
      const email = (obj.customer_details && obj.customer_details.email) || obj.customer_email;
      // Kredittpåfyll: legg bilder/video til kontoen, ikke medlemskap.
      const pack = obj.payment_link && CREDIT_PACKS[obj.payment_link];
      if (pack) {
        if (email) await addCredit(env, email, pack.kind, pack.amount);
        break;
      }
      // Claude-kurset: legg kjøperen i riktig språkgruppe, ikke Inner Circle.
      const claudeLang = obj.payment_link && CLAUDE_PAYMENT_LINK_LANG[obj.payment_link];
      if (claudeLang) {
        const name = (obj.customer_details && obj.customer_details.name) || "";
        const groupId = claudeLang === "en"
          ? (env.MAILERLITE_CLAUDE_GROUP_EN || CLAUDE_GROUP_EN)
          : (env.MAILERLITE_CLAUDE_GROUP_NO || CLAUDE_GROUP_NO);
        await addToClaudeGroup(env, email, name, groupId);
        // Start også den ukentlige nyhetsbrev-serien for kjøperen.
        try { await registerNewsletter(env, email, name, claudeLang); } catch (e) {}
        // Hovedkurs: send takkemail nå, og legg 2-dagers oppfølger i kø.
        const mainLang = CLAUDE_MAIN_LINK_LANG[obj.payment_link];
        if (mainLang && email) {
          await sendClaudeMail(env, { to: email, name: name, lang: mainLang, kind: "takk" });
          try {
            await env.BUILDER_KV.put(
              "claude_fu:" + email.trim().toLowerCase(),
              JSON.stringify({ email: email, name: name, lang: mainLang, sendAfter: Date.now() + 2 * 24 * 60 * 60 * 1000 })
            );
          } catch (e) {}
        }
        break;
      }
      // Oppskrifter (bøttehatt/skaut): leveringsmail + oppfølgere, IKKE Inner Circle.
      const pat = obj.payment_link && PATTERN_LINKS[obj.payment_link];
      if (pat) {
        if (email) {
          const nm = (obj.customer_details && obj.customer_details.name) || "";
          await sendOppskriftMail(env, { to: email, name: nm, lang: pat.lang, kind: "levering", pid: pat.p });
          const e = email.trim().toLowerCase();
          const base = { email: email, name: nm, lang: pat.lang, pid: pat.p };
          try {
            await env.BUILDER_KV.put("opp_fu:" + e + ":d3",
              JSON.stringify(Object.assign({}, base, { kind: "oppfolging_dag", sendAfter: Date.now() + 3 * 24 * 60 * 60 * 1000 })));
            await env.BUILDER_KV.put("opp_fu:" + e + ":w2",
              JSON.stringify(Object.assign({}, base, { kind: "oppfolging_uke", sendAfter: Date.now() + 14 * 24 * 60 * 60 * 1000 })));
          } catch (e2) {}
        }
        break;
      }
      await grant(env, email, {
        customer: obj.customer, sub: obj.subscription,
        tier: (obj.metadata && obj.metadata.tier) || null,
      });
      break;
    }
    case "customer.subscription.created":
    case "customer.subscription.updated": {
      const email = await emailForCustomer(env, obj.customer);
      const active = obj.status === "active" || obj.status === "trialing";
      if (email) {
        if (active) {
          let cs = null;
          try {
            const item = obj.items && obj.items.data && obj.items.data[0];
            const price = item && item.price;
            const prod = price && (typeof price.product === "string" ? price.product : (price.product && price.product.id));
            cs = prod ? CS_PLANS[prod] : null;
          } catch (e) {}
          const tier = (obj.metadata && obj.metadata.tier) || null;
          await grant(env, email, cs
            ? { customer: obj.customer, sub: obj.id, plan: cs.plan, limits: cs.limits, tier: tier }
            : { customer: obj.customer, sub: obj.id, tier: tier });
        } else { await revoke(env, email); }
      }
      break;
    }
    case "customer.subscription.deleted": {
      const email = await emailForCustomer(env, obj.customer);
      if (email) await revoke(env, email);
      break;
    }
    case "invoice.paid": {
      const email = obj.customer_email || (await emailForCustomer(env, obj.customer));
      if (email) await grant(env, email, { customer: obj.customer });
      break;
    }
    default:
      break;
  }

  return json({ received: true });
}
