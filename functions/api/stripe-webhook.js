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

async function grant(env, email, info) {
  if (!email) return;
  const rec = Object.assign(
    { status: "active", plan: "inner-circle", source: "stripe", since: Date.now() },
    info || {}, { updated: Date.now() }
  );
  await env.BUILDER_KV.put(memberKey(email), JSON.stringify(rec));
  if (info && info.customer) await env.BUILDER_KV.put(custKey(info.customer), email.toLowerCase());
  // Speil til kontoen hvis den finnes
  const uraw = await env.BUILDER_KV.get(userKey(email));
  if (uraw) {
    try {
      const u = JSON.parse(uraw);
      u.subscription = { status: rec.status, plan: rec.plan, source: "stripe", updated: rec.updated };
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
const CLAUDE_PAYMENT_LINKS = new Set([
  "plink_1TwFJWLax7B8uQzqsBQjTBxl", // Kom i gang med Claude (NOK)
  "plink_1TwFJYLax7B8uQzqO1gObkcB", // Get started with Claude (USD)
  "plink_1TwFJZLax7B8uQzqqjnXtmbR", // Videre med Claude, mersalg (NOK)
  "plink_1TwFJbLax7B8uQzqB3CNr2yR", // Next Level with Claude, upsell (USD)
]);

async function addToClaudeGroup(env, email, name) {
  const key = env.MAILERLITE_API_KEY;
  if (!key || !email) return;
  const groupId = (env.MAILERLITE_CLAUDE_GROUP || "193772564746601912") + "";
  const payload = { email: email.trim(), groups: [groupId] };
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
      // Claude-kurset: legg kjøperen i MailerLite-gruppen, ikke Inner Circle.
      if (obj.payment_link && CLAUDE_PAYMENT_LINKS.has(obj.payment_link)) {
        const name = (obj.customer_details && obj.customer_details.name) || "";
        await addToClaudeGroup(env, email, name);
        break;
      }
      await grant(env, email, { customer: obj.customer, sub: obj.subscription });
      break;
    }
    case "customer.subscription.created":
    case "customer.subscription.updated": {
      const email = await emailForCustomer(env, obj.customer);
      const active = obj.status === "active" || obj.status === "trialing";
      if (email) { if (active) await grant(env, email, { customer: obj.customer, sub: obj.id }); else await revoke(env, email); }
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
