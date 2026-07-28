/**
 * Oppskrift-webhook (isolert) — sender leveringsmail ved oppskrift-kjøp.
 *
 * Egen, avgrenset Stripe-webhook som KUN håndterer oppskrift-kjøp
 * (bøttehatt/skaut). Den rører aldri medlemskap, Inner Circle, Claude-kurs
 * eller kreditt, så den kan ikke påvirke de andre flytene.
 *
 *   POST /api/oppskrift-webhook
 *
 * Sett denne URL-en som et eget endepunkt i Stripe (Developers > Webhooks),
 * med hendelsen "checkout.session.completed". Lim signeringsnøkkelen (whsec_…)
 * inn på /grupper/admin (samme felt som ellers). Den lagres i KV som
 * config:stripe_webhook_secret, og leses også her.
 */

import { sendOppskriftMail, sendOwnerSaleNotice } from "../_lib/oppskrift-mail.js";
import { PATTERN_LINKS } from "../_lib/pattern-links.js";
import { bumpToday } from "../_lib/track.js";

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
    const pat = obj.payment_link && PATTERN_LINKS[obj.payment_link];
    const email = (obj.customer_details && obj.customer_details.email) || obj.customer_email;
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
