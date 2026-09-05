/**
 * Starter et Vipps-kjøp. To slags varer støttes:
 *   "lv"   Læringsverksted-ressurs (Skoledagbøkene, Plansjer, Tidslinje og
 *          alle andre betalte ressurser i samme system).
 *   "kurs" Enkeltkurs fra COURSES i _lib/plans.js (YouTube, KI for pedagoger osv.).
 *
 *   POST /api/vipps-pay
 *   body: { slug, email, name?, phoneNumber?, lang, type }
 *         type: "lv" (standard, Laeringsverksted-ressurs) eller "kurs"
 *   -> { ok: true, redirectUrl } eller { ok: false, error }
 *
 * E-postadressen samles inn HER (i skjemaet på siden, før Vipps-knappen
 * trykkes), ikke av Vipps selv, siden webhooken som leverer kjøpet etterpå
 * bare får en betalingsreferanse, ikke kjøperens e-post. Adressen lagres
 * midlertidig på selve ordren (vipps_order:<referanse>) og hentes fram
 * igjen av vipps-webhook.js når betalingen er godkjent.
 */
import { createVippsPayment, parseNokPriceToOre } from "../_lib/vipps.js";
import { KEY_PREFIX as LV_KEY_PREFIX } from "./laeringsverksted.js";
import { COURSES, kursPrisNok } from "../_lib/plans.js";
import { oppskriftPrisOre } from "../_lib/butikk-priser.js";
import { STRIKK_KJOP } from "../_lib/strikk-kjop.js";
import { oppskriftNavn } from "../_lib/oppskrift-mail.js";
import { pakkeMedId } from "../../js/tjenester-pakker.js";
import { APP_KJOP, gjeldendeTilbud } from "../_lib/app-kjop.js";

function json(data, status) {
  return new Response(JSON.stringify(data), {
    status: status || 200,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

function cleanSlug(slug) {
  if (typeof slug !== "string") return null;
  const s = slug.trim().toLowerCase();
  return /^[a-z0-9-]{1,80}$/.test(s) ? s : null;
}

/* Hvor kunden sendes tilbake etter at hun har betalt i Vipps-appen.
 *
 * Ikke kurssiden. Kurssidene er laast (js/course-gate.js), og laasen aapnes
 * av den personlige lenken i e-posten, ikke av at hun nettopp har betalt.
 * Sendte vi henne dit, ville hun blitt kastet rett ut til salgssiden igjen,
 * uten kvittering og uten et ord om hva som skjedde. Derfor takkesiden,
 * samme sted Stripe-kjoeperen lander.
 *
 * Claude-kurset gaar til mersalgssiden, ikke takkesiden, fordi det er dit
 * Stripe sender kjoeperen. Ellers ville Vipps-kunden gaatt glipp av tilbudet
 * om "Videre med Claude", og Renate av salget.
 *
 * De tre siste kursene selges fra kortene paa /academy og har ingen egen
 * takkeside. Da er /academy det naermeste vi har, og kvitteringen vises
 * der. */
const KURS_TAKKESIDE = {
  "claude": "/funnel/claude-kurs/mersalg.html",
  "claude-videre": "/funnel/claude-kurs/takk.html",
  "youtube": "/funnel/youtube-kurs/takk.html",
  "youtube-videre": "/funnel/youtube-videre-kurs/takk.html",
  "ki-pedagoger": "/funnel/ki-pedagoger-kurs/takk.html",
  "epostliste": "/funnel/epostliste-kurs/takk.html",
  "markedsforing-claude": "/academy",
  "minikurs": "/academy",
  "montessori-masterclass": "/academy",
};

function randomId() {
  return crypto.randomUUID().replace(/-/g, "").slice(0, 16);
}

export async function onRequestPost(context) {
  const { request, env } = context;
  if (!env.BUILDER_KV) return json({ ok: false, error: "not_configured" }, 503);
  if (!env.VIPPS_CLIENT_ID) return json({ ok: false, error: "vipps_not_configured" }, 503);

  const body = await request.json().catch(() => ({}));
  const slug = cleanSlug(body.slug);
  const email = ((body.email || "") + "").trim().toLowerCase();
  const lang = body.lang === "en" ? "en" : "no";
  if (!slug) return json({ ok: false, error: "bad_slug" }, 400);
  if (!email || !email.includes("@")) return json({ ok: false, error: "bad_email" }, 400);

  /* To slags varer kan kjoepes med Vipps, og de finner prisen sin to steder.
     Felles for begge: prisen leses paa serveren, aldri fra klienten, slik at
     ingen kan endre beloepet som faktisk trekkes.

       "lv"   Laeringsverksted-ressurs. Pris og tittel staar paa selve
              ressursen i KV, samme sted salgssiden viser dem fra.
       "kurs" Enkeltkurs. Pris og navn staar i COURSES i _lib/plans.js, den
              samme listen Nathalie og prislisten bruker. Ingen ny
              priskatalog, saa prisene kan ikke sprike.
       "oppskrift" Strikke- og hekleoppskriftene i butikken. Prisen staar i
              _lib/butikk-priser.js, hentet fra Stripe og sjekket mot
              prisen paa hver produktside. Navnet kommer fra den samme
              tabellen som leveringsmailen bruker, saa kunden ser samme
              navn i Vipps som i e-posten. */
  const TYPER = ["lv", "kurs", "oppskrift", "tjeneste", "app", "strikk"];
  const type = TYPER.indexOf(body.type) >= 0 ? body.type : "lv";
  let amount = 0;
  let title = "";
  let returnPath = "";

  if (type === "kurs") {
    const kurs = COURSES.filter((k) => k.id === slug)[0];
    if (!kurs) return json({ ok: false, error: "not_found" }, 404);
    const pris = kursPrisNok(kurs);
    if (!pris) return json({ ok: false, error: "no_price" }, 400);
    /* kursPrisNok, ikke kurs.nok: tre av kursene gaar fra lanseringspris til
       full pris 1. september, og da skal Vipps trekke det samme som
       salgssiden viser. */
    amount = pris * 100;
    title = (kurs.navn && (kurs.navn[lang] || kurs.navn.no)) || slug;
    returnPath = KURS_TAKKESIDE[slug] || "/academy";
  } else if (type === "app") {
    /* LME Autopilot som engangskjøp. Prisen leses på serveren, fra den
       samme filen Stripe-lenken og salgssiden bruker. */
    if (slug !== APP_KJOP.id) return json({ ok: false, error: "not_found" }, 404);
    amount = gjeldendeTilbud().nok * 100;
    title = APP_KJOP.navn[lang] || APP_KJOP.navn.no;
    returnPath = "/autopilot-app?takk=1";
  } else if (type === "strikk") {
    /* LME Strikk & Hekle som engangskjøp. Prisen leses på serveren, fra den
       samme filen Stripe-lenken og salgssiden bruker, så Vipps aldri kan
       trekke et annet beløp enn det kunden så. */
    if (slug !== STRIKK_KJOP.id) return json({ ok: false, error: "not_found" }, 404);
    amount = STRIKK_KJOP.nok * 100;
    title = STRIKK_KJOP.navn[lang] || STRIKK_KJOP.navn.no;
    /* Samme takkeside som Stripe sender kjøperen til. Lenken inn i appen
       kommer på e-post, siden kjøperen ikke har noen konto. */
    returnPath = "/strikk-app?takk=1";
  } else if (type === "tjeneste") {
    /* "Gjort for deg"-pakkene på /tjenester. Prisen leses fra den samme
       filen som salgssiden og Stripe-kvitteringen bruker, så Vipps aldri
       kan trekke et annet beløp enn det kunden så. */
    const pakke = pakkeMedId(slug);
    if (!pakke || !pakke.nok) return json({ ok: false, error: "not_found" }, 404);
    amount = pakke.nok * 100;
    title = (pakke.navn && (pakke.navn[lang] || pakke.navn.no)) || slug;
    /* Samme takkeside som Stripe sender kjøperen til. */
    returnPath = "/tjenester?takk=" + encodeURIComponent(slug);
  } else if (type === "oppskrift") {
    amount = oppskriftPrisOre(slug);
    title = oppskriftNavn(slug, lang);
    if (!title) return json({ ok: false, error: "not_found" }, 404);
    if (!amount) return json({ ok: false, error: "no_price" }, 400);
    /* Takkesiden er den samme som Stripe sender kunden til, med
       nedlastingene hennes. Den tar produktet i ?p=. */
    returnPath = "/butikk/takk.html?p=" + encodeURIComponent(slug);
  } else {
    let resource = null;
    try {
      const raw = await env.BUILDER_KV.get(LV_KEY_PREFIX + slug);
      if (raw) resource = JSON.parse(raw);
    } catch (e) {}
    if (!resource || resource.published === false) return json({ ok: false, error: "not_found" }, 404);
    if (resource.priceType !== "betalt") return json({ ok: false, error: "not_a_paid_resource" }, 400);
    const priceStr = resource.price && (resource.price.no || resource.price.en);
    amount = parseNokPriceToOre(priceStr);
    if (!amount) return json({ ok: false, error: "no_price" }, 400);
    title = (resource.title && (resource.title[lang] || resource.title.no)) || slug;
    returnPath = "/lv/" + slug;
  }

  const reference = type + "-" + slug + "-" + randomId();
  const origin = new URL(request.url).origin;

  const result = await createVippsPayment(env, {
    amount,
    currency: "NOK",
    reference,
    /* returnPath kan alt ha et sporsmalstegn (takkesiden tar ?p=), saa
       skilletegnet velges etter hva som staar der fra for. */
    returnUrl: origin + returnPath + (returnPath.indexOf("?") >= 0 ? "&" : "?") +
      "vipps=" + encodeURIComponent(reference),
    description: title,
    phoneNumber: body.phoneNumber || undefined,
  });
  if (!result.ok) return json(result, 502);

  // Lagre ordren, så webhooken vet hvem som skal ha varen og hva den
  // faktisk het, og kan sjekke at samme ordre ikke leveres to ganger.
  try {
    await env.BUILDER_KV.put(
      "vipps_order:" + reference,
      JSON.stringify({
        reference, type, slug, email, name: body.name || "", lang,
        amount, currency: "NOK", title,
        status: "created", createdAt: Date.now(),
      })
    );
  } catch (e) {
    return json({ ok: false, error: "order_store_failed" }, 500);
  }

  return json({ ok: true, redirectUrl: result.redirectUrl, reference });
}
