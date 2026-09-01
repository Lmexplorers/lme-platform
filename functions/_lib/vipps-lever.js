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
import { sendOppskriftMail } from "./oppskrift-mail.js";
import { KEY_PREFIX as LV_KEY_PREFIX } from "../api/laeringsverksted.js";
import { sendResourceDeliveryMail } from "./laeringsverksted-mail.js";
import { sendOwnerSaleNotice } from "./oppskrift-mail.js";
import { recordPurchase } from "./purchases.js";
import { COURSE_INFO } from "./purchase-links.js";
import { grantCourseAccess } from "./course-access.js";
import { sendCourseDeliveryMail } from "./course-mail.js";
import { sendClaudeMail } from "./claude-mail.js";
import { lagNedlastingsnokkel, medNokkel } from "./nedlasting-tilgang.js";
import { registerNewsletter } from "./newsletter.js";
import { sendKvitteringKjop } from "./tjeneste-mail.js";
import { grantAutopilotApp } from "./purchase-links.js";
import { sendAppKjopMail } from "./app-kjop-mail.js";
import { koOppfolging } from "./autopilot-followup-mail.js";
import { pakkeMedId } from "../../js/tjenester-pakker.js";

export const ORDRE_PREFIX = "vipps_order:";

/* Leverer engangskjopet av LME Autopilot. Noyaktig de samme stegene som
   Stripe-flyten i api/oppskrift-webhook.js gjor: apne tilgangen, sende
   kvitteringen som forklarer noklene, varsle Renate, og fore kjopet paa
   kundens konto.

   grantAutopilotApp kjores FORST og uten catch. Feiler den, har hun betalt
   for ingenting, og det er den ene feilen som ikke kan svelges. Da kastes
   den videre, ordren staar fortsatt ikke som levert, og neste forsok tar
   den. Samme monster som leverKurs. */
async function leverAppKjop(env, order) {
  await grantAutopilotApp(env, order.email, { via: "vipps" });

  try {
    await koOppfolging(env, { email: order.email, name: order.name, lang: order.lang, kilde: "kjop" });
    await sendAppKjopMail(env, {
      to: order.email, name: order.name || "", lang: order.lang, betaltMed: "vipps",
    });
  } catch (e) {}
  try {
    await sendOwnerSaleNotice(env, {
      pname: (order.title || "LME Autopilot, appen") + " (engangskjøp, Vipps)", lang: order.lang,
      name: order.name || "", email: order.email,
      amount: order.amount, currency: order.currency,
      action: {
        title: "Ingenting å gjøre, men verdt å vite",
        body: "Hun har kjøpt appen som engangskjøp, ikke abonnement. Tilgangen er " +
              "åpnet automatisk, og hun bruker sine egne AI-nøkler, så dette koster " +
              "deg ingenting videre.",
        url: "https://lmexplorers.com/autopilot-app",
      },
    });
  } catch (e) {}
  try {
    await recordPurchase(env, order.email, {
      type: "app", id: order.slug, title: order.title || "LME Autopilot, appen",
      amount: order.amount, currency: order.currency, url: "https://lme-contentstudio.pages.dev",
    });
  } catch (e) {}
}

/* Leverer en "gjort for deg"-pakke fra /tjenester. Ingen fil å sende og
   ingen tilgang å låse opp: det som skal skje er at ordren havner i Renates
   eget panel nederst på /tjenester, at kunden får en kvittering som ber om
   materialet sitt, og at Renate får salgsvarsel. Nøyaktig de samme stegene
   som Stripe-flyten i api/oppskrift-webhook.js gjør. */
async function leverTjeneste(env, order) {
  const sak = {
    id: "tjeneste:" + Date.now() + "-" + Math.random().toString(36).slice(2, 8),
    navn: order.name || order.email,
    epost: order.email,
    telefon: order.phoneNumber || "",
    melding: "Betalt med Vipps, uten beskrivelse. Be om materialet og detaljene.",
    lenke: "",
    lang: order.lang || "no",
    pakke: order.slug,
    pakkeNavn: order.title || order.slug,
    pris: Math.round((order.amount || 0) / 100),
    status: "betalt",
    betalt: true,
    betaltMed: "vipps",
    opprettet: new Date().toISOString(),
  };
  try { await env.BUILDER_KV.put(sak.id, JSON.stringify(sak)); } catch (e) {}
  /* Pakken med personlig oppsett inneholder selve appen, og skal låse den
     opp med en gang. Nøyaktig samme regel som Stripe-flyten følger, se
     tjeneste-grenen i functions/api/oppskrift-webhook.js. */
  const pakke = pakkeMedId(order.slug);
  if (pakke && pakke.girApp && order.email) {
    try { await grantAutopilotApp(env, order.email, { via: "vipps-tjeneste-oppsett" }); } catch (e) {}
    try { await sendAppKjopMail(env, { to: order.email, name: order.name, lang: sak.lang, betaltMed: "vipps" }); } catch (e) {}
    try { await koOppfolging(env, { email: order.email, name: order.name, lang: sak.lang, kilde: "kjop" }); } catch (e) {}
  }
  try { await sendKvitteringKjop(env, sak, sak.pakkeNavn); } catch (e) {}
  try {
    await sendOwnerSaleNotice(env, {
      pname: "LME Studio Tjenester: " + sak.pakkeNavn + " (Vipps)", lang: sak.lang,
      name: order.name || "", email: order.email,
      amount: order.amount, currency: order.currency,
      action: {
        title: "Dette må du gjøre nå: hent inn materialet",
        body: "Kunden har betalt for en pakke du skal levere selv. Ordren ligger " +
              "nederst på /tjenester, merket som betalt, og kvitteringen som ber om " +
              "filene hennes er allerede sendt.",
        url: "https://lmexplorers.com/tjenester",
      },
    });
  } catch (e) {}
  try {
    await recordPurchase(env, order.email, {
      type: "tjeneste", id: order.slug, title: sak.pakkeNavn,
      amount: order.amount, currency: order.currency,
      url: "https://lmexplorers.com/tjenester",
    });
  } catch (e) {}
  return null;
}

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
  let downloadUrl = (resource && resource.fileUrl) || "";
  let nokkel = null;
  /* Ligger filen hos oss, er den bak låsen, og lenken trenger nøkkelen. */
  try {
    nokkel = await lagNedlastingsnokkel(env, order.slug, order.email);
    if (nokkel) downloadUrl = medNokkel(downloadUrl, nokkel);
  } catch (e) {}
  try { await registerNewsletter(env, order.email, order.name || "", order.lang, "laeringsverksted"); } catch (e) {}
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
  return nokkel;
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

/* Leverer en strikke- eller hekleoppskrift fra butikken. Nøyaktig de
   samme fire stegene som Stripe-flyten gjør i oppskrift-webhook.js:
   leveringsmail med nedlastingene, varsel til Renate, de to
   oppfølgingsmailene i kø, og kjøpet på kundens konto.

   Holdes bevisst likt. Skulle en Vipps-kunde få mindre enn en
   kortkunde, ville ingen oppdaget det før hun spurte hvor det ble av
   oppfølgingen. */
async function leverOppskrift(env, order) {
  /* Nedlastingene er låst. Uten nøkkelen i lenken møter kunden låsen i
     stedet for oppskriften hun nettopp betalte for. */
  let nokkel = null;
  try { nokkel = await lagNedlastingsnokkel(env, order.slug, order.email); } catch (e) {}
  /* Velkomstserien, samme som et kortkjøp gir. */
  try { await registerNewsletter(env, order.email, order.name || "", order.lang, "butikk"); } catch (e) {}

  try {
    await sendOppskriftMail(env, {
      to: order.email, name: order.name, lang: order.lang,
      kind: "levering", pid: order.slug, nokkel: nokkel,
    });
  } catch (e) {}
  try {
    await sendOwnerSaleNotice(env, {
      pid: order.slug, lang: order.lang,
      name: order.name, email: order.email,
      amount: order.amount, currency: order.currency,
    });
  } catch (e) {}
  /* De to oppfølgingsmailene, etter tre dager og etter to uker. Samme
     nøkler og samme kø som Stripe-kjøpene legger seg i. */
  try {
    const e = String(order.email || "").trim().toLowerCase();
    const base = { email: order.email, name: order.name, lang: order.lang, pid: order.slug };
    await env.BUILDER_KV.put("opp_fu:" + e + ":d3", JSON.stringify(
      Object.assign({}, base, { kind: "oppfolging_dag", sendAfter: Date.now() + 3 * 24 * 60 * 60 * 1000 })));
    await env.BUILDER_KV.put("opp_fu:" + e + ":w2", JSON.stringify(
      Object.assign({}, base, { kind: "oppfolging_uke", sendAfter: Date.now() + 14 * 24 * 60 * 60 * 1000 })));
  } catch (e) {}
  try {
    await recordPurchase(env, order.email, {
      type: "oppskrift", id: order.slug, title: order.slug,
      amount: order.amount, currency: order.currency,
    });
  } catch (e) {}
  return nokkel;
}

/* Claude-kursene har sin egen leveringsmail og sin egen oppfølgingsserie,
   ikke den vanlige kursmailen. Stegene her er de samme som Stripe-flyten
   gjør i oppskrift-webhook.js: nyhetsbrevet, tilgangsnøkkelen, riktig
   takkemail for hoved- eller mersalgskjøp, varsel til Renate, og kjøpet på
   kundens konto.

   grantCourseAccess kjøres uten catch, av samme grunn som i leverKurs. */
async function leverClaudeKurs(env, order) {
  const hovedkurs = order.slug === "claude";
  const navn = hovedkurs ? "Claude-kurset" : "Claude-kurset, mersalg";

  try { await registerNewsletter(env, order.email, order.name || "", order.lang); } catch (e) {}

  const token = await grantCourseAccess(env, order.slug, order.email, order.name || "");

  try {
    await sendClaudeMail(env, {
      to: order.email, name: order.name || "", lang: order.lang,
      kind: hovedkurs ? "takk" : "takk-videre", token: token,
    });
  } catch (e) {}
  /* Oppfølgingsmailen etter to dager gjelder bare hovedkurset, samme som
     i Stripe-flyten. */
  if (hovedkurs) {
    try {
      await env.BUILDER_KV.put(
        "claude_fu:" + String(order.email || "").trim().toLowerCase(),
        JSON.stringify({
          email: order.email, name: order.name || "", lang: order.lang,
          token: token, sendAfter: Date.now() + 2 * 24 * 60 * 60 * 1000,
        })
      );
    } catch (e) {}
  }
  try {
    await sendOwnerSaleNotice(env, {
      pname: navn + " (Vipps)", lang: order.lang,
      name: order.name, email: order.email,
      amount: order.amount, currency: order.currency,
    });
  } catch (e) {}
  try {
    await recordPurchase(env, order.email, {
      type: "claude", id: "claude-kurset", title: navn,
      amount: order.amount, currency: order.currency, url: "/claude-kurs",
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
  /* Nedlastingsnøkkelen tas vare på ordren. Da kan takkesiden hente den
     fra /api/vipps-status og gi kunden filene med en gang, i stedet for at
     hun må vente på e-posten. */
  let nokkel = null;
  if (order.type === "kurs" && (order.slug === "claude" || order.slug === "claude-videre")) {
    await leverClaudeKurs(env, order);
  } else if (order.type === "kurs") {
    await leverKurs(env, order);
  } else if (order.type === "oppskrift") {
    nokkel = await leverOppskrift(env, order);
  } else if (order.type === "tjeneste") {
    await leverTjeneste(env, order);
  } else if (order.type === "app") {
    await leverAppKjop(env, order);
  } else {
    nokkel = await leverLaeringsverksted(env, order);
  }
  if (nokkel) order.nokkel = nokkel;

  order.status = "fulfilled";
  order.fulfilledAt = Date.now();
  try { await env.BUILDER_KV.put(orderKey, JSON.stringify(order)); } catch (e) {}

  return { ok: true, resultat: "levert", order };
}
