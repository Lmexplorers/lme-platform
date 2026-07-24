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
