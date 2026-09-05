/**
 * LME Strikk & Hekle, engangskjøp: hva det koster og hva det gir.
 *
 *   GET /api/strikk-kjop  ->  { ok, tilbud, eier, harApp, loggedIn }
 *
 * Salgssiden (/strikk-app) henter pris og innhold herfra i stedet for å ha
 * sin egen kopi, så prisen aldri kan sprike mellom siden og det Vipps
 * faktisk trekker.
 *
 * Svaret sier også om DU er eier. Eieren skal aldri møte en kjøpsknapp for
 * sitt eget produkt (CLAUDE.md), hun skal ha en egen gratis vei inn.
 */
import { sessionUser, isOwner } from "../_lib/access.js";
import { STRIKK_KJOP, STRIKK_ID, gjeldendeTilbud } from "../_lib/strikk-kjop.js";
import { getPurchases } from "../_lib/purchases.js";

function json(data, status) {
  return new Response(JSON.stringify(data), {
    status: status || 200,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

export async function onRequestGet(context) {
  const { env } = context;
  /* Prisen kunden ser er den som gjelder i dag, ikke standardprisen.
     Lanseringsprisen slår over til fastpris av seg selv, se
     gjeldendeTilbud() i _lib/strikk-kjop.js. */
  const naa = gjeldendeTilbud();
  const tilbud = Object.assign({}, STRIKK_KJOP, {
    nok: naa.nok, kjopLenke: naa.kjopLenke,
    trinn: naa.trinn, gjelderTil: naa.gjelderTil, ordinaer: naa.ordinaer,
  });
  const svar = { ok: true, tilbud: tilbud, eier: false, harApp: false, loggedIn: false };
  if (!env.BUILDER_KV) return json(svar);

  const bruker = await sessionUser(context);
  if (!bruker) return json(svar);
  svar.loggedIn = true;

  if (isOwner(bruker)) {
    svar.eier = true;
    svar.harApp = true;
    return json(svar);
  }

  /* Den som alt har kjøpt skal ikke kunne kjøpe to ganger. */
  try {
    const kjop = await getPurchases(env, bruker.email);
    svar.harApp = (kjop || []).some(function (k) { return k && k.id === STRIKK_ID; });
  } catch (e) {}
  return json(svar);
}
