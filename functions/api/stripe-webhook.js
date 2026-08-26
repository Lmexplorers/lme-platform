/**
 * LME Stripe-webhook — IKKE registrert i Stripe, kjører ALDRI i produksjon.
 *
 * Verifisert direkte mot Stripe sin liste over webhook-endepunkter
 * (GET /v1/webhook_endpoints) 6. august 2026: denne URL-en
 * (/api/stripe-webhook) finnes ikke blant de aktive endepunktene. De to som
 * faktisk mottar hendelser er functions/api/oppskrift-webhook.js (denne
 * plattformen) og lme-inner-circle.lmexplorers.workers.dev/webhook/stripe
 * (egen worker for Inner Circle/medlemskap, utenfor dette repoet).
 *
 * Kredittpåfyll- og Claude-kurs-logikken herfra er derfor flyttet til
 * functions/api/oppskrift-webhook.js (via den delte functions/_lib/purchase-links.js),
 * som er der de faktisk kjører nå. Denne filen ligger igjen som referanse
 * for Inner Circle-medlemskapslogikken (grant/revoke/CS_PLANS) i tilfelle
 * den skal kobles til et fremtidig, faktisk registrert endepunkt her, men
 * IKKE stol på at koden under kjører før den er verifisert live i Stripe.
 *
 * Lagring i KV (hvis/når denne noen gang blir live):
 *   member:<e-post>   -> { status, plan, source:"stripe", customer, sub, since, updated }
 *   scust:<kunde-id>  -> <e-post>     (for aa kunne fjerne ved oppsigelse)
 * I tillegg speiles abonnementet inn paa user:<e-post> hvis kontoen finnes,
 * saa "Min konto" viser status.
 */

import { sendClaudeMail } from "../_lib/claude-mail.js";
import { registerNewsletter } from "../_lib/newsletter.js";
import { sendOppskriftMail, sendOwnerSaleNotice } from "../_lib/oppskrift-mail.js";
import { PATTERN_LINKS } from "../_lib/pattern-links.js";
import { bumpToday } from "../_lib/track.js";
import {
  CREDIT_PACKS, addCredit,
  CLAUDE_PAYMENT_LINK_LANG, CLAUDE_MAIN_LINK_LANG,
} from "../_lib/purchase-links.js";

/* PATTERN_LINKS: delt kilde i ../_lib/pattern-links.js */

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

/* LME Autopilot-produkter -> plan og månedskvote (bilder/video). */
const CS_PLANS = {
  "prod_UwWlnVHko5a1Dt": { plan: "cs-start", limits: { image: 30,  video: 0 } },
  "prod_UTtEl6dxkbq4qM": { plan: "cs-proff", limits: { image: 100, video: 0 } },
  "prod_UwWmmP16D4lT5Z": { plan: "cs-pluss", limits: { image: 250, video: 0 } },
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
        if (email) {
          await addCredit(env, email, pack.kind, pack.amount);
          const nm = (obj.customer_details && obj.customer_details.name) || "";
          const kindLabel = pack.kind === "video" ? "videokreditt" : "bildekreditt";
          try {
            await sendOwnerSaleNotice(env, {
              pname: pack.amount + " " + kindLabel, name: nm, email: email,
              amount: obj.amount_total, currency: obj.currency,
            });
          } catch (e3) {}
        }
        break;
      }
      // Claude-kurset: gir kursets egen takke-/oppfølgingsmail, ikke Inner Circle.
      const claudeLang = obj.payment_link && CLAUDE_PAYMENT_LINK_LANG[obj.payment_link];
      if (claudeLang) {
        const name = (obj.customer_details && obj.customer_details.name) || "";
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
        try {
          await sendOwnerSaleNotice(env, {
            pname: mainLang ? "Claude-kurset" : "Claude-kurset, mersalg", lang: claudeLang,
            name: name, email: email, amount: obj.amount_total, currency: obj.currency,
          });
        } catch (e3) {}
        break;
      }
      // Oppskrifter (bøttehatt/skaut): leveringsmail + oppfølgere, IKKE Inner Circle.
      const pat = obj.payment_link && PATTERN_LINKS[obj.payment_link];
      if (pat) {
        if (email) {
          const nm = (obj.customer_details && obj.customer_details.name) || "";
          // Tell fullført kjøp i funnel-analysen (påvirker ingenting annet).
          try { await bumpToday(env, { purchase: 1 }, {}); } catch (eA) {}
          await sendOppskriftMail(env, { to: email, name: nm, lang: pat.lang, kind: "levering", pid: pat.p });
          // Kort salgs-varsel til Renate, så hun ikke bare oppdager det via Stripe-utbetalinger.
          try {
            await sendOwnerSaleNotice(env, {
              pid: pat.p, lang: pat.lang, name: nm, email: email,
              amount: obj.amount_total, currency: obj.currency,
            });
          } catch (e3) {}
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
      const tier = (obj.metadata && obj.metadata.tier) || null;
      await grant(env, email, { customer: obj.customer, sub: obj.subscription, tier: tier });
      try {
        const nm = (obj.customer_details && obj.customer_details.name) || "";
        await sendOwnerSaleNotice(env, {
          pname: "Inner Circle" + (tier ? " (" + tier + ")" : ""), name: nm, email: email,
          amount: obj.amount_total, currency: obj.currency,
        });
      } catch (e3) {}
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
