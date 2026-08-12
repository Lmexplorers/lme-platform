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
import { sendClaudeMail } from "../_lib/claude-mail.js";
import { registerNewsletter } from "../_lib/newsletter.js";
import { PATTERN_LINKS } from "../_lib/pattern-links.js";
import { bumpToday } from "../_lib/track.js";
import {
  CREDIT_PACKS, addCredit,
  CLAUDE_GROUP_NO, CLAUDE_GROUP_EN, CLAUDE_PAYMENT_LINK_LANG, CLAUDE_MAIN_LINK_LANG, addToClaudeGroup,
  AUTOPILOT_PAYMENT_LINKS, AUTOPILOT_PRODUCT_PLANS, grantAutopilot, revokeAutopilot, emailForStripeCustomer,
  COURSE_PAYMENT_LINKS, COURSE_INFO,
  MODULE_PAYMENT_LINKS,
  LAERINGSVERKSTED_PAYMENT_LINKS,
  SKOLEDAGBOK_PAYMENT_LINKS, SKOLEDAGBOK_INFO,
} from "../_lib/purchase-links.js";
import { sendAutopilotMail } from "../_lib/autopilot-mail.js";
import { grantCourseAccess, grantModuleAccess } from "../_lib/course-access.js";
import { sendCourseDeliveryMail, sendModuleDeliveryMail } from "../_lib/course-mail.js";
import { recordPurchase } from "../_lib/purchases.js";
import { sendResourceDeliveryMail } from "../_lib/laeringsverksted-mail.js";
import { sendSkoledagbokMail } from "../_lib/skoledagbok-mail.js";

// Må matche KEY_PREFIX i functions/api/laeringsverksted.js (samme
// dupliseringsmønster som OWNER_EMAILS andre steder i kodebasen).
const LV_KEY_PREFIX = "lme-builder:lv:";

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
      try {
        await recordPurchase(env, email, {
          type: "kreditt", id: pack.kind, title: pack.amount + " " + kindLabel,
          amount: obj.amount_total, currency: obj.currency,
        });
      } catch (e4) {}
      return json({ ok: true });
    }

    // LME Autopilot (Start/Proff/VIP): gir abonnement, ikke Inner Circle.
    // Var tidligere kun i den aldri-registrerte stripe-webhook.js, så
    // betalende kunder fikk verken tilgang eller e-post. Se purchase-links.js.
    const auto = obj.payment_link && AUTOPILOT_PAYMENT_LINKS[obj.payment_link];
    if (auto && email && obj.payment_status !== "unpaid") {
      const nm = (obj.customer_details && obj.customer_details.name) || "";
      await grantAutopilot(env, email, { customer: obj.customer, sub: obj.subscription, plan: auto.plan, limits: auto.limits });
      try { await sendAutopilotMail(env, email, nm, auto.lang, auto.planLabel); } catch (e1) {}
      try {
        await sendOwnerSaleNotice(env, {
          pname: auto.planLabel, lang: auto.lang, name: nm, email: email,
          amount: obj.amount_total, currency: obj.currency,
        });
      } catch (e3) {}
      try {
        await recordPurchase(env, email, {
          type: "autopilot", id: auto.plan, title: auto.planLabel,
          amount: obj.amount_total, currency: obj.currency,
        });
      } catch (e4) {}
      return json({ ok: true });
    }

    // Låste enkeltkurs (YouTube, Videre med YouTube, KI for pedagoger):
    // engangskjøp, tilgang for alltid via personlig lenke (course-access.js).
    const course = obj.payment_link && COURSE_PAYMENT_LINKS[obj.payment_link];
    if (course && email && obj.payment_status !== "unpaid") {
      const nm = (obj.customer_details && obj.customer_details.name) || "";
      const info = COURSE_INFO[course.courseId];
      const courseName = info.name[course.lang] || info.name.no;
      const token = await grantCourseAccess(env, course.courseId, email, nm);
      try { await sendCourseDeliveryMail(env, email, nm, course.lang, courseName, info.url, token, true); } catch (e1) {}
      try {
        await sendOwnerSaleNotice(env, {
          pname: courseName + " (" + course.tier + ")", lang: course.lang, name: nm, email: email,
          amount: obj.amount_total, currency: obj.currency,
        });
      } catch (e3) {}
      try {
        await recordPurchase(env, email, {
          type: "kurs", id: course.courseId, title: courseName,
          amount: obj.amount_total, currency: obj.currency, url: info.url,
        });
      } catch (e4) {}
      return json({ ok: true });
    }

    // Lås opp enkeltmodul (Skool-stil): samme mønster som hele-kurset over,
    // men gir bare tilgang til den ene modulen (course-access.js: modul-token).
    const modulePurchase = obj.payment_link && MODULE_PAYMENT_LINKS[obj.payment_link];
    if (modulePurchase && email && obj.payment_status !== "unpaid") {
      const nm = (obj.customer_details && obj.customer_details.name) || "";
      const info = COURSE_INFO[modulePurchase.courseId];
      const courseName = (info && info.name[modulePurchase.lang]) || (info && info.name.no) || modulePurchase.courseId;
      const moduleLabel = courseName + " – " + modulePurchase.moduleKey;
      const moduleToken = await grantModuleAccess(env, modulePurchase.courseId, modulePurchase.moduleKey, email, nm);
      try {
        await sendModuleDeliveryMail(env, email, nm, modulePurchase.lang, moduleLabel, info.url, moduleToken, modulePurchase.moduleKey);
      } catch (e1) {}
      try {
        await sendOwnerSaleNotice(env, {
          pname: moduleLabel + " (enkeltmodul)", lang: modulePurchase.lang, name: nm, email: email,
          amount: obj.amount_total, currency: obj.currency,
        });
      } catch (e3) {}
      try {
        await recordPurchase(env, email, {
          type: "modul", id: modulePurchase.courseId + ":" + modulePurchase.moduleKey, title: moduleLabel,
          amount: obj.amount_total, currency: obj.currency, url: info && info.url,
        });
      } catch (e4) {}
      return json({ ok: true });
    }

    // Mia & Teo skoledagbok: engangskjøp, leveringsmail med BEGGE språk-PDF-ene
    // (norsk + engelsk), uansett hvilken språklenke/pris kunden brukte. Se
    // purchase-links.js: SKOLEDAGBOK_PAYMENT_LINKS/SKOLEDAGBOK_INFO. Fantes
    // ikke før 11. august 2026, så kjøpere fikk ingen leveringsmail i det hele tatt.
    const diary = obj.payment_link && SKOLEDAGBOK_PAYMENT_LINKS[obj.payment_link];
    if (diary && email && obj.payment_status !== "unpaid") {
      const nm = (obj.customer_details && obj.customer_details.name) || "";
      const info = SKOLEDAGBOK_INFO[diary.book];
      const bookName = (info && info.name[diary.lang]) || (info && info.name.no) || "Mia & Teo Skoledagbok";
      const files = (info && info.files) || {};
      try { await sendSkoledagbokMail(env, { to: email, name: nm, lang: diary.lang, book: diary.book, bookName: bookName, files: files }); } catch (e1) {}
      try {
        await sendOwnerSaleNotice(env, {
          pname: bookName, lang: diary.lang, name: nm, email: email,
          amount: obj.amount_total, currency: obj.currency,
        });
      } catch (e3) {}
      try {
        await recordPurchase(env, email, {
          type: "skoledagbok", id: "skoledagbok-" + diary.book, title: bookName,
          amount: obj.amount_total, currency: obj.currency,
        });
      } catch (e4) {}
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
      // Hovedkurset og "Videre med Claude" er hver sin låste kursside
      // (js/course-gate.js), samme mønster som course-access.js ellers i
      // filen. Gir en personlig tilgangsnøkkel og sender riktig takkemail
      // med lenken, uansett om det er hoved- eller mersalgkjøpet.
      const mainLang = CLAUDE_MAIN_LINK_LANG[obj.payment_link];
      const claudeCourseId = mainLang ? "claude" : "claude-videre";
      const claudeToken = await grantCourseAccess(env, claudeCourseId, email, name);
      if (mainLang) {
        await sendClaudeMail(env, { to: email, name: name, lang: mainLang, kind: "takk", token: claudeToken });
        try {
          await env.BUILDER_KV.put(
            "claude_fu:" + email.trim().toLowerCase(),
            JSON.stringify({ email: email, name: name, lang: mainLang, token: claudeToken, sendAfter: Date.now() + 2 * 24 * 60 * 60 * 1000 })
          );
        } catch (e) {}
      } else {
        await sendClaudeMail(env, { to: email, name: name, lang: claudeLang, kind: "takk-videre", token: claudeToken });
      }
      try {
        await sendOwnerSaleNotice(env, {
          pname: mainLang ? "Claude-kurset" : "Claude-kurset, mersalg", lang: claudeLang,
          name: name, email: email, amount: obj.amount_total, currency: obj.currency,
        });
      } catch (e3) {}
      try {
        await recordPurchase(env, email, {
          type: "claude", id: "claude-kurset", title: mainLang ? "Claude-kurset" : "Claude-kurset, mersalg",
          amount: obj.amount_total, currency: obj.currency, url: "/claude-kurs",
        });
      } catch (e4) {}
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
      try {
        await recordPurchase(env, email, {
          type: "oppskrift", id: pat.p, title: pat.p,
          amount: obj.amount_total, currency: obj.currency,
        });
      } catch (e4) {}
    }

    // LME Læringsverksted: enkeltressurser og samlepakker solgt via Stripe.
    // Tom liste (LAERINGSVERKSTED_PAYMENT_LINKS) inntil Renate oppretter og
    // registrerer en ekte betalingslenke for en betalt ressurs, se
    // purchase-links.js og hjelpeteksten i /laeringsverksted-bygger.
    const lvItem = obj.payment_link && LAERINGSVERKSTED_PAYMENT_LINKS[obj.payment_link];
    if (lvItem && email && obj.payment_status !== "unpaid") {
      const nm = (obj.customer_details && obj.customer_details.name) || "";
      let resource = null;
      try {
        const raw = await env.BUILDER_KV.get(LV_KEY_PREFIX + lvItem.slug);
        if (raw) resource = JSON.parse(raw);
      } catch (eR) {}
      const title = (resource && resource.title && (resource.title[lvItem.lang] || resource.title.no)) || lvItem.slug;
      const downloadUrl = (resource && resource.fileUrl) || "";
      const resourceUrl = "https://lmexplorers.com/lv/" + lvItem.slug;
      try { await sendResourceDeliveryMail(env, { to: email, name: nm, lang: lvItem.lang, title: title, downloadUrl: downloadUrl, resourceUrl: resourceUrl }); } catch (e1) {}
      try {
        await sendOwnerSaleNotice(env, {
          pname: title + " (" + lvItem.license + ")", lang: lvItem.lang, name: nm, email: email,
          amount: obj.amount_total, currency: obj.currency,
        });
      } catch (e3) {}
      try {
        await recordPurchase(env, email, {
          type: "laeringsverksted", id: lvItem.slug, title: title,
          amount: obj.amount_total, currency: obj.currency, url: resourceUrl,
        });
      } catch (e4) {}
      // Tell nedlastingen i ressursens egen statistikk (best effort, aldri blokkerende).
      try {
        if (resource) {
          resource.stats = resource.stats || { views: 0, downloads: 0, favorites: 0 };
          resource.stats.downloads = (resource.stats.downloads || 0) + 1;
          await env.BUILDER_KV.put(LV_KEY_PREFIX + lvItem.slug, JSON.stringify(resource));
        }
      } catch (e5) {}
    }
    return json({ ok: true });
  }

  // Holder LME Autopilot-abonnementet riktig ved fornyelse/oppsigelse.
  // Rører aldri Inner Circle: den egne lme-inner-circle-workeren har sitt
  // eget webhook-endepunkt og håndterer sine egne abonnement-hendelser.
  // Her sjekkes produktet på abonnementet, og alt som ikke er en kjent
  // Autopilot-plan (prod_… i AUTOPILOT_PRODUCT_PLANS) ignoreres stille.
  if (event.type === "customer.subscription.updated" || event.type === "customer.subscription.deleted") {
    const obj = (event.data && event.data.object) || {};
    let prod = null;
    try {
      const item = obj.items && obj.items.data && obj.items.data[0];
      const price = item && item.price;
      prod = price && (typeof price.product === "string" ? price.product : (price.product && price.product.id));
    } catch (e) {}
    const plan = prod && AUTOPILOT_PRODUCT_PLANS[prod];
    if (!plan) return json({ ok: true }); // ikke en Autopilot-plan, ikke vårt bord

    const email = await emailForStripeCustomer(env, obj.customer);
    if (!email) return json({ ok: true });

    const active = event.type === "customer.subscription.updated" && (obj.status === "active" || obj.status === "trialing");
    if (active) {
      await grantAutopilot(env, email, { customer: obj.customer, sub: obj.id, plan: plan.plan, limits: plan.limits });
    } else {
      await revokeAutopilot(env, email);
    }
    return json({ ok: true });
  }

  return json({ ok: true });
}
