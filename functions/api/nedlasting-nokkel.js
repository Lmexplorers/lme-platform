/**
 * Nedlastingsnøkkelen til et ferskt Stripe-kjøp.
 *
 *   GET /api/nedlasting-nokkel?session_id=cs_live_...
 *
 * Stripe sender kunden tilbake til takkesiden med øktnummeret sitt i
 * adressen. Webhooken har da lagt nøkkelen under det nummeret, og her
 * hentes den fram, slik at kunden får filene med en gang i stedet for å
 * måtte vente på e-posten.
 *
 * Webhooken kan komme et par sekunder etter kunden. Derfor spør siden
 * flere ganger, og et "ikke ennå" er et helt normalt svar.
 */
import { OKT_PREFIX } from "../_lib/nedlasting-tilgang.js";

function json(data, status) {
  return new Response(JSON.stringify(data), {
    status: status || 200,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

export async function onRequestGet(context) {
  const { request, env } = context;
  if (!env.BUILDER_KV) return json({ ok: false, status: "ikke_satt_opp" }, 503);

  const okt = (new URL(request.url).searchParams.get("session_id") || "").trim();
  /* Stripe sine øktnummer ser slik ut. Alt annet avvises med en gang, så
     ingen kan bruke dette til å lete seg gjennom KV. */
  if (!/^cs_[A-Za-z0-9_]{10,80}$/.test(okt)) return json({ ok: false, status: "ugyldig" }, 400);

  let nokkel = null;
  try { nokkel = await env.BUILDER_KV.get(OKT_PREFIX + okt); } catch (e) {}
  if (!nokkel) return json({ ok: false, status: "ikke_ennaa" });
  return json({ ok: true, nokkel: nokkel });
}
