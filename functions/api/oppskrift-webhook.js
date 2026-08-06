/**
 * Dette ER det faktisk aktive Stripe-webhook-endepunktet for plattformen
 * (verifisert direkte mot Stripe sin liste over webhook-endepunkter
 * 6. august 2026 — se functions/api/stripe-webhook.js, som viste seg å
 * ALDRI være registrert). Rører aldri Inner Circle/medlemskap, som
 * håndteres av den separate lme-inner-circle-workeren (eget Stripe-
 * webhook-endepunkt, utenfor dette repoet).
 *
 * Håndterer alle frittstående kjøp: oppskrifter, 10 000-visninger-
 * utfordringen, kredittpåfyll (bilder/video) og Claude-kurset. Kreditt- og
 * Claude-logikken lå tidligere kun i stripe-webhook.js og kjørte derfor
 * aldri i produksjon; flyttet hit 6. august 2026 via den delte
 * functions/_lib/purchase-links.js.
 *
 *   POST /api/oppskrift-webhook
 *
 * Satt opp som et eget endepunkt i Stripe (Developers > Webhooks), med
 * hendelsen "checkout.session.completed". Signeringsnøkkelen (whsec_…)
 * limes inn på /grupper/admin (samme felt som ellers). Den lagres i KV som
 * config:stripe_webhook_secret, og leses også her.
 */

import { sendOppskriftMail, sendOwnerSaleNotice } from "../_lib/oppskrift-mail.js";
import { sendUtfordringMail } from "../_lib/utfordring-mail.js";
import { sendClaudeMail } from "../_lib/claude-mail.js";
import { registerNewsletter } from "../_lib/newsletter.js";
import { PATTERN_LINKS } from "../_lib/pattern-links.js";
import { bumpToday } from "../_lib/track.js";
import {
  CREDIT_PACKS, addCredit,
  CLAUDE_GROUP_NO, CLAUDE_GROUP_EN, CLAUDE_PAYMENT_LINK_LANG, CLAUDE_MAIN_LINK_LANG, addToClaudeGroup,
} from "../_lib/purchase-links.js";

/* ---- 10 000-visninger-utfordringen -------------------------------------
   Eget abonnement, helt uavhengig av Inner Circle (som selges av den
   separate lme-inner-circle-workeren): ingen tilgang, ingen tier, ingen
   deling av kode eller database. Hele 30-dagers-serien sendes rett fra
   plattformen via MailerSend (_lib/utfordring-mail.js), samme mønster som
   Claude-kurset, ingen MailerLite-automasjon. Dag 0 sendes med en gang,
   resten legges i kø (utf_fu:<e-post>:<dag>) og sendes av den daglige
   cronjobben api/cron/utfordring-followups. */
const UTFORDRING_PAYMENT_LINK_LANG = {
  "plink_1U0I2WLax7B8uQzqhBB6bAVC": "no", // Utfordringen, 299 kr/mnd (NOK)
  "plink_1U0I2XLax7B8uQzq7e9tzjBh": "en", // The Challenge, $33/mo (USD)
};
const UTFORDRING_DAYS = Array.from({ length: 30 }, (_, i) => i + 1);
const DAG = 24 * 60 * 60 * 1000;

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

    // Kredittpåfyll: legg bilder/video til kontoen, ikke medlemskap.
    const pack = obj.payment_link && CREDIT_PACKS[obj.payment_link];
    if (pack && email && obj.payment_status !== "unpaid") {
      await addCredit(env, email, pack.kind, pack.amount);
      const nm = (obj.customer_details && obj.customer_details.name) || "";
      const kindLabel = pack.kind === "video" ? "videokreditt" : "bildekreditt";
      try {
        await sendOwnerSaleNotice(env, {
          pname: pack.amount + " " + kindLabel, name: nm, email: email,
          amount: obj.amount_total, currency: obj.currency,
        });
      } catch (e3) {}
      return json({ ok: true });
    }

    // Claude-kurset: legg kjøperen i riktig språkgruppe, ikke Inner Circle.
    const claudeLang = obj.payment_link && CLAUDE_PAYMENT_LINK_LANG[obj.payment_link];
    if (claudeLang && email && obj.payment_status !== "unpaid") {
      const name = (obj.customer_details && obj.customer_details.name) || "";
      const groupId = claudeLang === "en"
        ? (env.MAILERLITE_CLAUDE_GROUP_EN || CLAUDE_GROUP_EN)
        : (env.MAILERLITE_CLAUDE_GROUP_NO || CLAUDE_GROUP_NO);
      await addToClaudeGroup(env, email, name, groupId);
      // Start også den ukentlige nyhetsbrev-serien for kjøperen.
      try { await registerNewsletter(env, email, name, claudeLang); } catch (e) {}
      // Hovedkurs: send takkemail nå, og legg 2-dagers oppfølger i kø.
      const mainLang = CLAUDE_MAIN_LINK_LANG[obj.payment_link];
      if (mainLang) {
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
      return json({ ok: true });
    }

    // Utfordringen: send dag 0 med en gang, legg resten i kø. Aldri Inner Circle.
    const utfordringLang = obj.payment_link && UTFORDRING_PAYMENT_LINK_LANG[obj.payment_link];
    if (utfordringLang && email && obj.payment_status !== "unpaid") {
      const nm = (obj.customer_details && obj.customer_details.name) || "";
      await sendUtfordringMail(env, { to: email, name: nm, lang: utfordringLang, kind: "d0" });
      const e = email.trim().toLowerCase();
      try {
        for (const dag of UTFORDRING_DAYS) {
          await env.BUILDER_KV.put(
            "utf_fu:" + e + ":d" + dag,
            JSON.stringify({ email: email, name: nm, lang: utfordringLang, kind: "d" + dag, sendAfter: Date.now() + dag * DAG })
          );
        }
        // Medlemskap i fellesskapet (funnel/utfordringen/fellesskap.html),
        // slik at bare betalende kjøpere kan poste/kommentere der.
        await env.BUILDER_KV.put("utf_member:" + e, JSON.stringify({ email: email, name: nm, lang: utfordringLang, joinedAt: Date.now() }));
      } catch (e2) {}
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
