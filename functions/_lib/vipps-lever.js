/**
 * Leverer et Vipps-kjøp: tar pengene og gir kunden varen.
 *
 * Koden lå tidligere inni vipps-webhook.js. Nå ligger den her, fordi to
 * veier fører hit:
 *
 *   1. vipps-webhook.js, når Vipps varsler oss om at kunden har godkjent.
 *   2. vipps-status.js, når kunden selv kommer tilbake til siden etter å
 *      ha betalt. Det er sikkerhetsnettet: kommer aldri varselet fram,
 *      leveres kjøpet likevel, med en gang kunden lander på siden.
 *
 * Begge veier kaller leverVippsOrdre, så et kjøp leveres nøyaktig én
 * gang uansett hvem som kom først.
 */
import { captureVippsPayment } from "./vipps.js";
import { KEY_PREFIX as LV_KEY_PREFIX } from "../api/laeringsverksted.js";
import { sendResourceDeliveryMail } from "./laeringsverksted-mail.js";
import { sendOwnerSaleNotice } from "./oppskrift-mail.js";
import { recordPurchase } from "./purchases.js";
import { COURSE_INFO } from "./purchase-links.js";
import { grantCourseAccess } from "./course-access.js";
import { sendCourseDeliveryMail } from "./course-mail.js";

export const ORDRE_PREFIX = "vipps_order:";

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
   svelges. Feiler den, kastes den videre, ordren staar fortsatt ikke som
   levert, og neste forsoek (Vipps sin retry, eller kunden som laster
   siden paa nytt) tar den. */
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

/**
 * Tar pengene og leverer varen for en ordre som Vipps har godkjent.
 *
 * @param env      Cloudflare-miljøet (trenger BUILDER_KV og Vipps-nøklene).
 * @param reference Ordrereferansen, f.eks. "kurs-observasjon-a1b2c3".
 * @param opts.alleredeTrukket  true hvis Vipps alt har trukket beløpet,
 *   da hoppes capture over (den ville svart 409 Conflict).
 *
 * @returns { ok, resultat } der resultat er ett av:
 *   "levert"            kjøpet er levert nå
 *   "allerede_levert"   det var levert fra før, ingenting gjort
 *   "ukjent_ordre"      referansen finnes ikke hos oss
 *   "capture_feilet"    Vipps nektet å trekke pengene
 */
export async function leverVippsOrdre(env, reference, opts) {
  const valg = opts || {};
  const orderKey = ORDRE_PREFIX + reference;

  let order = null;
  try {
    const raw = await env.BUILDER_KV.get(orderKey);
    if (raw) order = JSON.parse(raw);
  } catch (e) {}
  if (!order) return { ok: true, resultat: "ukjent_ordre" };
  if (order.status === "fulfilled") return { ok: true, resultat: "allerede_levert", order };

  /* Marker ordren som "under levering" før vi begynner. KV er ikke en lås,
     så to samtidige kall (webhooken og kunden som lander på siden i samme
     sekund) kan i teorien begge slippe forbi. Da blir følgen én ekstra
     leveringsmail, ikke et tapt kjøp, og det er den riktige veien å bomme. */
  if (order.status !== "leverer") {
    order.status = "leverer";
    try { await env.BUILDER_KV.put(orderKey, JSON.stringify(order)); } catch (e) {}
  }

  if (!valg.alleredeTrukket) {
    const captured = await captureVippsPayment(env, reference, order.amount, order.currency);
    if (!captured.ok) {
      /* Fikk vi ikke pengene, skal ordren kunne prøves igjen. Sett den
         tilbake, ellers står den for evig som "leverer". */
      order.status = "authorized";
      try { await env.BUILDER_KV.put(orderKey, JSON.stringify(order)); } catch (e) {}
      return { ok: false, resultat: "capture_feilet", detail: captured.error };
    }
  }

  /* Ordrer laget foer varetyper fantes har ingen `type`. De var alle
     Laeringsverksted-ressurser, saa mangler feltet, er det "lv". */
  if (order.type === "kurs") {
    await leverKurs(env, order);
  } else {
    await leverLaeringsverksted(env, order);
  }

  order.status = "fulfilled";
  order.fulfilledAt = Date.now();
  try { await env.BUILDER_KV.put(orderKey, JSON.stringify(order)); } catch (e) {}

  return { ok: true, resultat: "levert", order };
}
