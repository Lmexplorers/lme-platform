/**
 * Isolert engangsprodukt-webhook — sender leveringsmail/melder inn i
 * MailerLite ved kjøp av frittstående produkter (oppskrifter,
 * 10 000-visninger-utfordringen). Rører aldri medlemskap, Inner Circle,
 * Claude-kurs eller kreditt, så den kan ikke påvirke de andre flytene.
 *
 *   POST /api/oppskrift-webhook
 *
 * Satt opp som et eget endepunkt i Stripe (Developers > Webhooks), med
 * hendelsen "checkout.session.completed". Signeringsnøkkelen (whsec_…)
 * limes inn på /grupper/admin (samme felt som ellers). Den lagres i KV som
 * config:stripe_webhook_secret, og leses også her.
 */

import { sendOppskriftMail, sendOwnerSaleNotice } from "../_lib/oppskrift-mail.js";
import { PATTERN_LINKS } from "../_lib/pattern-links.js";
import { bumpToday } from "../_lib/track.js";

/* ---- 10 000-visninger-utfordringen -------------------------------------
   Eget abonnement, helt uavhengig av Inner Circle (som selges av den
   separate lme-inner-circle-workeren): ingen tilgang, ingen tier, ingen
   deling av kode eller database. Kjøp legger bare kjøperen i riktig
   MailerLite-gruppe, som trigger en egen 30-dagers automasjon der. Inner
   Circle nevnes ingen steder i denne flyten. */
const UTFORDRING_GROUP_NO = "194770523227423951"; // "10 000-visninger-utfordringen, kjøpere"
const UTFORDRING_GROUP_EN = "194771238803998196"; // "10,000 Views Challenge, buyers (EN)"
const UTFORDRING_PAYMENT_LINK_LANG = {
  "plink_1U0I2WLax7B8uQzqhBB6bAVC": "no", // Utfordringen, 299 kr/mnd (NOK)
  "plink_1U0I2XLax7B8uQzq7e9tzjBh": "en", // The Challenge, $33/mo (USD)
};

async function addToMailerliteGroup(env, email, name, groupId) {
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
  return parts.v1.some((sig) => {
    if (sig.length !== expected.length) return false;
    let diff = 0;
    for (let i = 0; i < sig.length; i++) diff |= sig.charCodeAt(i) ^ expected.charCodeAt(i);
    return diff === 0;
  });
}

export async function onRequestPost(context) {
  const { request, env } = context;
  if (!env.BUILDER_KV) return json({ error: "not_configured" }, 503);

  const secret = (await env.BUILDER_KV.get("config:stripe_webhook_secret")) || env.STRIPE_WEBHOOK_SECRET;
  if (!secret) return json({ error: "missing_webhook_secret" }, 503);

  const raw = await request.text();
  const ok = await verifyStripe(raw, request.headers.get("Stripe-Signature"), secret);
  if (!ok) return json({ error: "bad_signature" }, 400);

  let event;
  try { event = JSON.parse(raw); } catch (e) { return json({ error: "bad_json" }, 400); }

  if (event.type === "checkout.session.completed") {
    const obj = (event.data && event.data.object) || {};
    const email = (obj.customer_details && obj.customer_details.email) || obj.customer_email;

    // Utfordringen: legg kjøperen i riktig språkgruppe, aldri Inner Circle.
    const utfordringLang = obj.payment_link && UTFORDRING_PAYMENT_LINK_LANG[obj.payment_link];
    if (utfordringLang && email && obj.payment_status !== "unpaid") {
      const nm = (obj.customer_details && obj.customer_details.name) || "";
      const groupId = utfordringLang === "en"
        ? (env.MAILERLITE_UTFORDRING_GROUP_EN || UTFORDRING_GROUP_EN)
        : (env.MAILERLITE_UTFORDRING_GROUP_NO || UTFORDRING_GROUP_NO);
      await addToMailerliteGroup(env, email, nm, groupId);
      return json({ ok: true });
    }

    const pat = obj.payment_link && PATTERN_LINKS[obj.payment_link];
    // Bare oppskrift-kjøp håndteres her. Alt annet ignoreres (200 OK).
    if (pat && email && obj.payment_status !== "unpaid") {
      const nm = (obj.customer_details && obj.customer_details.name) || "";
      // Tell fullført kjøp i funnel-analysen (påvirker ingenting annet).
      try { await bumpToday(env, { purchase: 1 }, {}); } catch (eA) {}
      await sendOppskriftMail(env, { to: email, name: nm, lang: pat.lang, kind: "levering", pid: pat.p });
      // Kort salgs-varsel til Renate.
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
  }

  return json({ ok: true });
}
