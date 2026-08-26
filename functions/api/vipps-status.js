/**
 * Sikkerhetsnettet i Vipps-flyten.
 *
 *   GET /api/vipps-status?ref=<ordrereferanse>
 *
 * Når kunden har betalt i Vipps-appen, sendes hun tilbake til produkt-
 * siden med referansen i adressen. Siden spør her, og vi spør Vipps:
 * er betalingen godkjent? Er den det, og kjøpet ikke alt er levert,
 * leverer vi det på stedet.
 *
 * Hvorfor dette finnes: normalt varsler Vipps oss selv, og
 * /api/vipps-webhook leverer. Men et varsel kan bli borte, komme sent,
 * eller bli avvist fordi nøkkelen mangler. Da ville kunden ha betalt og
 * ikke fått noe, uten at noen oppdaget det. Nå henter vi kjøpet fram
 * igjen i samme øyeblikk som hun lander på siden.
 *
 * Referansen er en tilfeldig streng bare kjøperen og Vipps kjenner, og
 * svaret inneholder verken e-post eller navn.
 */
import { getVippsPayment } from "../_lib/vipps.js";
import { leverVippsOrdre, ORDRE_PREFIX } from "../_lib/vipps-lever.js";

function json(data, status) {
  return new Response(JSON.stringify(data), {
    status: status || 200,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

/* Det siden trenger å vite, og ikke ett felt mer. Ingen e-post, ingen
   navn, ingen nøkler. */
function omOrdren(order) {
  if (!order) return {};
  const ut = {
    type: order.type || "lv",
    slug: order.slug || "",
    title: order.title || "",
  };
  /* Nedlastingsnøkkelen, så takkesiden kan gi kunden filene med en gang i
     stedet for å be henne vente på e-posten. Den følger bare med når kjøpet
     faktisk er levert, og bare til den som kan referansen, altså kjøperen
     selv. */
  if (order.status === "fulfilled" && order.nokkel) ut.nokkel = order.nokkel;
  return ut;
}

export async function onRequestGet(context) {
  const { request, env } = context;
  if (!env.BUILDER_KV) return json({ ok: false, status: "ikke_satt_opp" }, 503);

  const reference = (new URL(request.url).searchParams.get("ref") || "").trim();
  if (!reference) return json({ ok: false, status: "mangler_referanse" }, 400);

  let order = null;
  try {
    const raw = await env.BUILDER_KV.get(ORDRE_PREFIX + reference);
    if (raw) order = JSON.parse(raw);
  } catch (e) {}
  if (!order) return json({ ok: false, status: "ukjent_ordre" }, 404);
  if (order.status === "fulfilled") {
    return json({ ok: true, status: "levert", ...omOrdren(order) });
  }

  const betaling = await getVippsPayment(env, reference);
  if (!betaling.ok) {
    /* Vi vet ikke om hun har betalt. Da sier vi det, i stedet for å
       påstå at noe gikk galt, og siden ber henne prøve igjen om litt. */
    return json({ ok: false, status: "ukjent_tilstand", detail: betaling.error, ...omOrdren(order) });
  }

  const tilstand = String(betaling.state || "").toUpperCase();
  if (tilstand === "AUTHORIZED") {
    const svar = await leverVippsOrdre(env, reference, { alleredeTrukket: betaling.captured > 0 });
    if (!svar.ok) return json({ ok: false, status: svar.resultat, detail: svar.detail, ...omOrdren(order) }, 502);
    /* Ordren fra leveringen, ikke den vi leste før den. Det er den som har
       fått nedlastingsnøkkelen, og uten den ville takkesiden bedt kunden
       vente på e-posten selv om filene var klare. */
    return json({ ok: true, status: svar.resultat, ...omOrdren(svar.order || order) });
  }
  if (tilstand === "CREATED") {
    return json({ ok: false, status: "venter", ...omOrdren(order) });
  }
  /* TERMINATED, ABORTED, EXPIRED: kunden avbrøt, eller betalingen løp ut. */
  return json({ ok: false, status: "avbrutt", tilstand, ...omOrdren(order) });
}
