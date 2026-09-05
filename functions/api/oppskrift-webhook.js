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
  CLAUDE_PAYMENT_LINK_LANG, CLAUDE_MAIN_LINK_LANG,
  AUTOPILOT_PAYMENT_LINKS, AUTOPILOT_PRODUCT_PLANS, grantAutopilot, revokeAutopilot, emailForStripeCustomer,
  COURSE_PAYMENT_LINKS, COURSE_INFO,
  MODULE_PAYMENT_LINKS,
  LAERINGSVERKSTED_PAYMENT_LINKS,
  SKOLEDAGBOK_PAYMENT_LINKS, SKOLEDAGBOK_INFO,
  VIDEOFLOW_PAYMENT_LINKS, VIDEOFLOW_PRODUCT_ID, grantVideoFlowSub, revokeVideoFlowSub,
  TJENESTE_PAYMENT_LINKS,
  APP_PAYMENT_LINKS, grantAutopilotApp,
  STRIKK_PAYMENT_LINKS,
} from "../_lib/purchase-links.js";
import { sendAutopilotMail } from "../_lib/autopilot-mail.js";
import { grantCourseAccess, grantModuleAccess } from "../_lib/course-access.js";
import { leverStrikk } from "../_lib/strikk-lever.js";
import { sendCourseDeliveryMail, sendModuleDeliveryMail } from "../_lib/course-mail.js";
import { recordPurchase } from "../_lib/purchases.js";
import { sendResourceDeliveryMail } from "../_lib/laeringsverksted-mail.js";
import { sendKvitteringKjop } from "../_lib/tjeneste-mail.js";
import { sendAppKjopMail } from "../_lib/app-kjop-mail.js";
import { koOppfolging } from "../_lib/autopilot-followup-mail.js";
import { sendSkoledagbokMail } from "../_lib/skoledagbok-mail.js";
import { lagNedlastingsnokkel } from "../_lib/nedlasting-tilgang.js";
import { setMonthlyCredits } from "../_lib/videoflow-credits.js";
import { sendVideoFlowWelcomeMail } from "../_lib/videoflow-mail.js";

const VIDEOFLOW_MONTHLY_CREDITS = 2000;

/* Rydder unna en eventuell "du er tom for kreditter"-påminnelseskø
   (videoflow-access.js sin queueEmptyCreditsReminder) når kontoen nettopp
   har fått fulle kreditter igjen, ellers kan påminnelsen komme selv om
   personen alt har abonnert på nytt. Cronjobben sjekker riktignok saldo på
   nytt før den sender, så dette er en ekstra opprydding, ikke en nødvendighet. */
async function clearVideoFlowReminderQueue(env, email) {
  if (!email) return;
  const e = email.trim().toLowerCase();
  try {
    await env.BUILDER_KV.delete("vf_fu:" + e + ":d3");
    await env.BUILDER_KV.delete("vf_fu:" + e + ":d7");
    await env.BUILDER_KV.delete("vf_fu:" + e + ":d14");
  } catch (e2) {}
}

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
      // Videokreditt er det ENESTE salget som krever at Renate gjør noe:
      // bildene går på løpende regning hos OpenAI og virker med en gang,
      // mens video trenger et Higgsfield-abonnement som må være kjøpt før
      // kunden kan generere. Derfor står det i e-posten hva hun skal gjøre,
      // i stedet for at hun må huske det eller oppdage det når kunden klager.
      const action = pack.kind === "video" ? {
        title: "Dette må du gjøre nå: kjøp videokapasitet",
        body: "Kunden har betalt for " + pack.amount + " videoer, men det finnes ingen " +
              "Higgsfield-plan bak dem ennå, så genereringen vil feile (kreditten " +
              "refunderes automatisk, så kunden taper ingen penger). Kjøp en plan, " +
              "så virker det med en gang. Ultra gir 133 videoer i måneden og er " +
              "den billigste per video. Bildekjøp trenger ingenting av dette.",
        url: "https://higgsfield.ai/pricing",
      } : null;
      try {
        await sendOwnerSaleNotice(env, {
          pname: pack.amount + " " + kindLabel, name: nm, email: email,
          amount: obj.amount_total, currency: obj.currency,
          action: action,
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
      /* Oppfolgingsserien: tre brev over tre uker, som tar henne gjennom
         oppsettet. Se _lib/autopilot-followup-mail.js. */
      try { await koOppfolging(env, { email: email, name: nm, lang: auto.lang, kilde: "abonnement" }); } catch (e1b) {}
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

    // LME VideoFlow ($8/mo, 2000 kreditter/mnd): eget abonnement, egen
    // kredittvaluta (vf-credit:<e-post>, functions/_lib/videoflow-credits.js),
    // ikke Inner Circle og ikke Autopilot-planene over. Opprettet live
    // 13. august 2026 (Renate: "Live modus, opprett, du vet jo prisene").
    const vfLink = obj.payment_link && VIDEOFLOW_PAYMENT_LINKS[obj.payment_link];
    if (vfLink && email && obj.payment_status !== "unpaid") {
      const nm = (obj.customer_details && obj.customer_details.name) || "";
      await grantVideoFlowSub(env, email, { customer: obj.customer, sub: obj.subscription, lang: vfLink.lang });
      await setMonthlyCredits(env, email, VIDEOFLOW_MONTHLY_CREDITS);
      await clearVideoFlowReminderQueue(env, email);
      try { await sendVideoFlowWelcomeMail(env, email, nm, vfLink.lang); } catch (e1) {}
      try {
        await sendOwnerSaleNotice(env, {
          pname: "LME VideoFlow (" + VIDEOFLOW_MONTHLY_CREDITS + " kreditter/mnd)", lang: vfLink.lang,
          name: nm, email: email, amount: obj.amount_total, currency: obj.currency,
        });
      } catch (e3) {}
      try {
        await recordPurchase(env, email, {
          type: "videoflow", id: "videoflow-abonnement", title: "LME VideoFlow",
          amount: obj.amount_total, currency: obj.currency, url: "/videoflow-studio",
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
      const ctaLabel = info.cta ? (info.cta[course.lang] || info.cta.no) : "";
      try { await sendCourseDeliveryMail(env, email, nm, course.lang, courseName, info.url, token, true, ctaLabel); } catch (e1) {}

      /* Byggeøkten 24. september: billetten gir også workshopen "Ansett dine
         fem AI-assistenter", som forberedelse. Den har sin egen lås, så
         kjøperen trenger sitt eget token til den, og en egen e-post med
         lenken. Plassen telles her, ETTER at selve leveringen er sendt, så
         en teller som svikter aldri stopper en billett. */
      if (course.courseId === "byggeokt") {
        try {
          const bonus = COURSE_INFO["ai-assistent-workshop"];
          const bonusToken = await grantCourseAccess(env, "ai-assistent-workshop", email, nm);
          await sendCourseDeliveryMail(
            env, email, nm, course.lang,
            bonus.name[course.lang] || bonus.name.no,
            bonus.url, bonusToken, true,
            bonus.cta ? (bonus.cta[course.lang] || bonus.cta.no) : ""
          );
        } catch (e5) { /* billetten er levert, bonusen kan sendes på nytt */ }
        try {
          const { tellByggeoktSalg } = await import("./byggeokt-plasser.js");
          await tellByggeoktSalg(env);
        } catch (e6) { /* med vilje stille */ }
        try {
          const { leggTilDeltaker } = await import("../_lib/byggeokt-mail.js");
          await leggTilDeltaker(env, email, nm, course.lang);
        } catch (e7) { /* uten køen går påminnelsene glipp, ikke billetten */ }
      }
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
    // (norsk + engelsk), uansett hvilken språklenke/pris kunden brukte, pluss
    // to oppfølgere med mersalg fra resten av plattformen (dag 3 og uke 2,
    // sendt fra functions/api/cron/skoledagbok-followups.js), samme mønster
    // som oppskriftene (opp_fu:-køen). Se purchase-links.js:
    // SKOLEDAGBOK_PAYMENT_LINKS/SKOLEDAGBOK_INFO. Fantes ikke før 11. august
    // 2026, så kjøpere fikk ingen leveringsmail i det hele tatt.
    const diary = obj.payment_link && SKOLEDAGBOK_PAYMENT_LINKS[obj.payment_link];
    if (diary && email && obj.payment_status !== "unpaid") {
      const nm = (obj.customer_details && obj.customer_details.name) || "";
      const info = SKOLEDAGBOK_INFO[diary.book];
      const bookName = (info && info.name[diary.lang]) || (info && info.name.no) || "Mia & Teo Skoledagbok";
      let bokNokkel = null;
      try { bokNokkel = await lagNedlastingsnokkel(env, "skoledagbok-" + diary.book, email, obj.id); } catch (eN) {}
      try { await registerNewsletter(env, email, nm, diary.lang, "skoledagbok"); } catch (eB) {}
      try { await sendSkoledagbokMail(env, { to: email, name: nm, lang: diary.lang, book: diary.book, kind: "levering", nokkel: bokNokkel }); } catch (e1) {}
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
      try {
        const e = email.trim().toLowerCase();
        const base = { email: email, name: nm, lang: diary.lang, book: diary.book };
        await env.BUILDER_KV.put("skole_fu:" + e + ":d3",
          JSON.stringify(Object.assign({}, base, { kind: "oppfolging_dag", sendAfter: Date.now() + 3 * 24 * 60 * 60 * 1000 })));
        await env.BUILDER_KV.put("skole_fu:" + e + ":w2",
          JSON.stringify(Object.assign({}, base, { kind: "oppfolging_uke", sendAfter: Date.now() + 14 * 24 * 60 * 60 * 1000 })));
      } catch (e2) {}
      return json({ ok: true });
    }

    // Claude-kurset: gir kursets egen takke-/oppfølgingsmail, ikke Inner Circle.
    const claudeLang = obj.payment_link && CLAUDE_PAYMENT_LINK_LANG[obj.payment_link];
    if (claudeLang && email && obj.payment_status !== "unpaid") {
      const name = (obj.customer_details && obj.customer_details.name) || "";
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
      /* Nedlastingene er låst. Nøkkelen lages her, legges i leveringsmailen,
         og legges under Stripe-øktnummeret så takkesiden kan hente den med
         en gang kunden lander der, uten å vente på e-posten. */
      let dlNokkel = null;
      try { dlNokkel = await lagNedlastingsnokkel(env, pat.p, email, obj.id); } catch (eN) {}
      /* Velkomstserien. Kjøpere i butikken sto utenfor nyhetsbrevet, så de
         fikk aldri velkomstmailen eller de ukentlige. registerNewsletter
         rører ikke en som alt er påmeldt. */
      try { await registerNewsletter(env, email, nm, pat.lang, "butikk"); } catch (eB) {}
      await sendOppskriftMail(env, { to: email, name: nm, lang: pat.lang, kind: "levering", pid: pat.p, nokkel: dlNokkel });
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
    // LME Autopilot, engangskjøp av appen. Gir ingen kvote, bare varig
    // tilgang. Kunden bruker sine egne AI-nøkler, så kjøpet koster meg
    // ingenting etterpå, og kan derfor selges én gang.
    // LME Strikk & Hekle, engangskjøp av appen. Kunden trenger ingen konto:
    // leveringen lager en personlig lenke med token og sender den på e-post.
    // Kort og Vipps deler den samme leveringen, se _lib/strikk-lever.js.
    const strikkKjop = obj.payment_link && STRIKK_PAYMENT_LINKS[obj.payment_link];
    if (strikkKjop && email && obj.payment_status !== "unpaid") {
      const nmS = (obj.customer_details && obj.customer_details.name) || "";
      await leverStrikk(env, {
        email: email, name: nmS, lang: strikkKjop.lang,
        betaltMed: "kort", amount: obj.amount_total, currency: obj.currency,
      });
      return json({ ok: true });
    }

    const appKjop = obj.payment_link && APP_PAYMENT_LINKS[obj.payment_link];
    if (appKjop && email && obj.payment_status !== "unpaid") {
      const nm = (obj.customer_details && obj.customer_details.name) || "";
      await grantAutopilotApp(env, email, { customer: obj.customer, via: "stripe" });
      try {
        await sendAppKjopMail(env, { to: email, name: nm, lang: appKjop.lang, betaltMed: "kort" });
        await koOppfolging(env, { email: email, name: nm, lang: appKjop.lang, kilde: "kjop" });
      } catch (e1) {}
      try {
        await sendOwnerSaleNotice(env, {
          pname: appKjop.navn + " (engangskjøp)", lang: appKjop.lang, name: nm, email: email,
          amount: obj.amount_total, currency: obj.currency,
          action: {
            title: "Ingenting å gjøre, men verdt å vite",
            body: "Hun har kjøpt appen som engangskjøp, ikke abonnement. Tilgangen er " +
                  "åpnet automatisk, og hun bruker sine egne AI-nøkler, så dette koster " +
                  "deg ingenting videre. Kvitteringen som forklarer nøklene er sendt.",
            url: "https://lmexplorers.com/autopilot-app",
          },
        });
      } catch (e3) {}
      try {
        await recordPurchase(env, email, {
          type: "app", id: appKjop.app, title: appKjop.navn,
          amount: obj.amount_total, currency: obj.currency,
          url: "https://lme-contentstudio.pages.dev",
        });
      } catch (e4) {}
      return json({ ok: true });
    }

    // LME Studio Tjenester (/tjenester): en "gjort for deg"-pakke betalt rett
    // i kassen. Ingen tilgang skal låses opp, men ordren må havne der Renate
    // ser den, altså i det samme panelet som forespørslene, og hun må få vite
    // det uten å måtte lete i Stripe.
    const tjeneste = obj.payment_link && TJENESTE_PAYMENT_LINKS[obj.payment_link];
    if (tjeneste && email && obj.payment_status !== "unpaid") {
      const nm = (obj.customer_details && obj.customer_details.name) || "";
      const tlf = (obj.customer_details && obj.customer_details.phone) || "";
      // Lenken til materialet er et valgfritt felt i kassen.
      let materiale = "";
      try {
        const felt = (obj.custom_fields || []).filter(function (f) { return f.key === "materiale"; })[0];
        materiale = (felt && felt.text && felt.text.value) || "";
      } catch (eM) {}
      const sak = {
        id: "tjeneste:" + Date.now() + "-" + Math.random().toString(36).slice(2, 8),
        navn: nm || email,
        epost: email,
        telefon: tlf,
        melding: "Betalt rett i kassen, uten beskrivelse. Be om materialet og detaljene.",
        lenke: materiale,
        lang: "no",
        pakke: tjeneste.pakke,
        pakkeNavn: tjeneste.navn,
        pris: tjeneste.nok,
        status: "betalt",
        betalt: true,
        opprettet: new Date().toISOString(),
      };
      try { await env.BUILDER_KV.put(sak.id, JSON.stringify(sak)); } catch (e1) {}
      /* Pakken med personlig oppsett inneholder selve appen. Da må kjøpet
         låse den opp med en gang, slik et engangskjøp gjør, i tillegg til
         at Renate får ordren. Ellers har kunden betalt 4997 kr og møter en
         låst app frem til timen deres. */
      if (tjeneste.girApp) {
        try { await grantAutopilotApp(env, email, { via: "tjeneste-oppsett" }); } catch (eA) {}
        try { await sendAppKjopMail(env, { to: email, name: nm, lang: "no" }); } catch (eB) {}
        try { await koOppfolging(env, { email: email, name: nm, lang: "no", kilde: "kjop" }); } catch (eC) {}
      }
      try { await sendKvitteringKjop(env, sak, tjeneste.navn); } catch (e2) {}
      try {
        await sendOwnerSaleNotice(env, {
          pname: "LME Studio Tjenester: " + tjeneste.navn, name: nm, email: email,
          amount: obj.amount_total, currency: obj.currency,
          action: {
            title: "Dette må du gjøre nå: hent inn materialet",
            body: "Kunden har betalt for en pakke du skal levere selv. Ordren ligger " +
                  "nederst på /tjenester, merket som betalt. Kvitteringen som ber om " +
                  "filene hennes er allerede sendt" +
                  (materiale ? ", og hun la igjen denne lenken i kassen: " + materiale : "") + ".",
            url: "https://lmexplorers.com/tjenester",
          },
        });
      } catch (e3) {}
      try {
        await recordPurchase(env, email, {
          type: "tjeneste", id: tjeneste.pakke, title: tjeneste.navn,
          amount: obj.amount_total, currency: obj.currency,
          url: "https://lmexplorers.com/tjenester",
        });
      } catch (e4) {}
      return json({ ok: true });
    }

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
    const active = event.type === "customer.subscription.updated" && (obj.status === "active" || obj.status === "trialing");

    if (plan) {
      const email = await emailForStripeCustomer(env, obj.customer);
      if (email) {
        if (active) await grantAutopilot(env, email, { customer: obj.customer, sub: obj.id, plan: plan.plan, limits: plan.limits });
        else await revokeAutopilot(env, email);
      }
      return json({ ok: true });
    }

    // LME VideoFlow: holder abonnementsstatus riktig ved oppsigelse/betaling
    // feilet (status i vf-sub:<e-post>, lest av UI-en for å vise "abonner på
    // nytt"). Kredittsaldoen (vf-credit:<e-post>) fylles IKKE her, det skjer
    // kun i invoice.paid under, siden denne hendelsen fyres for mye mer enn
    // bare fornyelse (f.eks. betalingsmetode oppdatert).
    if (prod === VIDEOFLOW_PRODUCT_ID) {
      const email = await emailForStripeCustomer(env, obj.customer);
      if (email) {
        if (active) await grantVideoFlowSub(env, email, { customer: obj.customer, sub: obj.id });
        else await revokeVideoFlowSub(env, email);
      }
      return json({ ok: true });
    }

    return json({ ok: true }); // ikke en kjent Autopilot- eller VideoFlow-plan, ikke vårt bord
  }

  // LME VideoFlow: fyller på 2000 kreditter ved hver fornyelse. Trygt å
  // kjøre flere ganger for samme faktura (setMonthlyCredits SETTER saldoen,
  // legger ikke til), så ingen fare for dobbel-tildeling selv om denne og
  // checkout.session.completed begge fyrer for samme første betaling.
  if (event.type === "invoice.paid") {
    const obj = (event.data && event.data.object) || {};
    let prod = null;
    try {
      const line = obj.lines && obj.lines.data && obj.lines.data[0];
      const price = line && line.price;
      prod = price && (typeof price.product === "string" ? price.product : (price.product && price.product.id));
    } catch (e) {}
    if (prod === VIDEOFLOW_PRODUCT_ID) {
      const email = obj.customer_email || (await emailForStripeCustomer(env, obj.customer));
      if (email) {
        await setMonthlyCredits(env, email, VIDEOFLOW_MONTHLY_CREDITS);
        await clearVideoFlowReminderQueue(env, email);
      }
    }
    return json({ ok: true });
  }

  return json({ ok: true });
}
