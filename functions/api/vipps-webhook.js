/**
 * Vipps-webhook: bekrefter en godkjent betaling, fanger opp (tar) pengene,
 * og leverer kjøpet, samme leveringskode som Stripe-flyten i
 * oppskrift-webhook.js bruker for Læringsverksted-ressurser
 * (sendResourceDeliveryMail/sendOwnerSaleNotice/recordPurchase), ikke
 * duplisert her.
 *
 *   POST /api/vipps-webhook
 *
 * Registreres hos Vipps med vipps-register-webhook.js (kjøres én gang),
 * som gir en hemmelig nøkkel (VIPPS_WEBHOOK_SECRET) brukt til å bekrefte
 * at kallet faktisk kommer fra Vipps og ikke er forfalsket, se
 * verifyVippsWebhookSignature i _lib/vipps.js.
 */
import { verifyVippsWebhookSignature, captureVippsPayment } from "../_lib/vipps.js";
import { KEY_PREFIX as LV_KEY_PREFIX } from "./laeringsverksted.js";
import { sendResourceDeliveryMail } from "../_lib/laeringsverksted-mail.js";
import { sendOwnerSaleNotice } from "../_lib/oppskrift-mail.js";
import { recordPurchase } from "../_lib/purchases.js";
import { COURSE_INFO } from "../_lib/purchase-links.js";
import { grantCourseAccess } from "../_lib/course-access.js";
import { sendCourseDeliveryMail } from "../_lib/course-mail.js";

function json(data, status) {
  return new Response(JSON.stringify(data), {
    status: status || 200,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

// Hendelsene som faktisk betyr "kunden har godkjent betalingen i appen,
// pengene er reservert, lever varen nå". Andre hendelser (created,
// aborted, expired, cancelled) ignoreres, de betyr ikke et fullført kjøp.
const FULFILL_ON_EVENTS = new Set(["epayments.payment.authorized.v1"]);

/* Leverer en Laeringsverksted-ressurs: leveringsmail med nedlastingslenke,
   varsel til Renate, kjoepet paa kundens konto, og en telling opp paa
   ressursen. Hvert steg staar for seg, saa en e-post som feiler ikke
   stopper de andre. Tilgangen er alt gitt, kunden har betalt. */
async function leverLaeringsverksted(env, order) {
  let resource = null;
  try {
    const raw = await env.BUILDER_KV.get(LV_KEY_PREFIX + order.slug);
    if (raw) resource = JSON.parse(raw);
  } catch (e) {}
  const downloadUrl = (resource && resource.fileUrl) || "";
  const resourceUrl = "https://lmexplorers.com/lv/" + order.slug;

  try {
    await sendResourceDeliveryMail(env, {
      to: order.email, name: order.name, lang: order.lang,
      title: order.title, downloadUrl, resourceUrl,
    });
  } catch (e) {}
  try {
    await sendOwnerSaleNotice(env, {
      pname: order.title + " (Vipps)", lang: order.lang,
      name: order.name, email: order.email,
      amount: order.amount, currency: order.currency,
    });
  } catch (e) {}
  try {
    await recordPurchase(env, order.email, {
      type: "laeringsverksted", id: order.slug, title: order.title,
      amount: order.amount, currency: order.currency, url: resourceUrl,
    });
  } catch (e) {}
  try {
    if (resource) {
      resource.stats = resource.stats || { views: 0, downloads: 0, favorites: 0 };
      resource.stats.downloads = (resource.stats.downloads || 0) + 1;
      await env.BUILDER_KV.put(LV_KEY_PREFIX + order.slug, JSON.stringify(resource));
    }
  } catch (e) {}
}

/* Leverer et enkeltkurs. Noeyaktig samme steg som Stripe-flyten i
   oppskrift-webhook.js gjoer: gi tilgang, send den personlige lenken,
   varsle Renate, foer kjoepet paa kundens konto.

   grantCourseAccess kjoeres FOERST og uten catch. Faar hun ikke tilgang,
   har hun betalt for ingenting, og det er den ene feilen som ikke kan
   svelges. Feiler den, kastes den videre, Vipps proever igjen, og ordren
   staar fortsatt ikke som levert. */
async function leverKurs(env, order) {
  const info = COURSE_INFO[order.slug];
  const kursnavn = order.title || (info && (info.name[order.lang] || info.name.no)) || order.slug;
  const kursUrl = (info && info.url) || "https://lmexplorers.com/academy";

  const token = await grantCourseAccess(env, order.slug, order.email, order.name || "");

  try {
    await sendCourseDeliveryMail(env, order.email, order.name || "", order.lang, kursnavn, kursUrl, token, true);
  } catch (e) {}
  try {
    await sendOwnerSaleNotice(env, {
      pname: kursnavn + " (Vipps)", lang: order.lang,
      name: order.name, email: order.email,
      amount: order.amount, currency: order.currency,
    });
  } catch (e) {}
  try {
    await recordPurchase(env, order.email, {
      type: "kurs", id: order.slug, title: kursnavn,
      amount: order.amount, currency: order.currency, url: kursUrl,
    });
  } catch (e) {}
}

export async function onRequestPost(context) {
  const { request, env } = context;
  if (!env.BUILDER_KV) return json({ ok: true, ignorert: "not_configured" });

  const rawBody = await request.text();
  const validSig = await verifyVippsWebhookSignature(request, rawBody, env.VIPPS_WEBHOOK_SECRET);
  if (!validSig) return json({ error: "invalid_signature" }, 401);

  let event;
  try {
    event = JSON.parse(rawBody);
  } catch (e) {
    return json({ error: "bad_json" }, 400);
  }

  const eventName = event && event.name;
  const reference = event && (event.reference || (event.data && event.data.reference));
  if (!reference) return json({ ok: true, ignorert: "mangler referanse" });
  if (!FULFILL_ON_EVENTS.has(eventName)) return json({ ok: true, ignorert: eventName || "ukjent hendelse" });

  const orderKey = "vipps_order:" + reference;
  let order = null;
  try {
    const raw = await env.BUILDER_KV.get(orderKey);
    if (raw) order = JSON.parse(raw);
  } catch (e) {}
  if (!order) return json({ ok: true, ignorert: "ukjent ordre" });
  // Allerede levert (Vipps kan sende samme hendelse flere ganger, f.eks.
  // ved automatiske retries), ikke lever på nytt.
  if (order.status === "fulfilled") return json({ ok: true, allerede_levert: true });

  const captured = await captureVippsPayment(env, reference, order.amount, order.currency);
  if (!captured.ok) return json({ ok: false, error: "capture_failed", detail: captured.error }, 502);

  /* Ordrer laget foer varetyper fantes har ingen `type`. De var alle
     Laeringsverksted-ressurser, saa mangler feltet, er det "lv". */
  if (order.type === "kurs") {
    await leverKurs(env, order);
  } else {
    await leverLaeringsverksted(env, order);
  }

  order.status = "fulfilled";
  order.fulfilledAt = Date.now();
  try {
    await env.BUILDER_KV.put(orderKey, JSON.stringify(order));
  } catch (e) {}

  return json({ ok: true });
}
