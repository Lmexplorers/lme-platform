/**
 * Ny nedlastingslenke til en som alt har kjøpt.
 *
 *   POST /api/nedlasting-ny-lenke   { email, sti, lang }
 *
 * Kunder som kjøpte før nedlastingene ble låst har lenker uten nøkkel i
 * innboksen. De skal ikke stå igjen med en død lenke. Her sjekker vi om
 * e-posten faktisk har kjøpt noe som gir filen, og sender i så fall
 * leveringsmailen på nytt, med en fersk nøkkel.
 *
 * Svaret er det samme uansett om e-posten fantes eller ikke. Ellers kunne
 * hvem som helst brukt dette til å finne ut hvem som har kjøpt hva.
 */
import { getPurchases } from "../_lib/purchases.js";
import { sendOppskriftMail, isOppskrift } from "../_lib/oppskrift-mail.js";
import { sendSkoledagbokMail } from "../_lib/skoledagbok-mail.js";
import { lagNedlastingsnokkel, produkterForFil, erEierEpost } from "../_lib/nedlasting-tilgang.js";

function json(data, status) {
  return new Response(JSON.stringify(data), {
    status: status || 200,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

/* Ett svar, uansett utfall. */
const SAMME_SVAR = { ok: true };

export async function onRequestPost(context) {
  const { request, env } = context;
  if (!env.BUILDER_KV) return json(SAMME_SVAR);

  const body = await request.json().catch(() => ({}));
  const email = String(body.email || "").trim().toLowerCase();
  const sti = String(body.sti || "").split("?")[0];
  const lang = body.lang === "en" ? "en" : "no";
  if (!email || email.indexOf("@") === -1 || !sti) return json(SAMME_SVAR);

  const eiere = produkterForFil(sti);
  if (!eiere.length) return json(SAMME_SVAR);

  /* Hvilket av produktene som gir denne filen har hun kjøpt? Eieren får
     alltid, hun trenger ingen kjøpshistorikk for sitt eget. */
  let pid = null;
  let navn = "";
  if (erEierEpost(email)) {
    pid = eiere[0];
  } else {
    let kjop = [];
    try { kjop = (await getPurchases(env, email)) || []; } catch (e) {}
    for (const k of kjop) {
      if (k && eiere.indexOf(k.id) !== -1) { pid = k.id; navn = k.title || ""; break; }
    }
  }
  if (!pid) return json(SAMME_SVAR);

  const nokkel = await lagNedlastingsnokkel(env, pid, email);
  if (!nokkel) return json(SAMME_SVAR);

  try {
    if (isOppskrift(pid)) {
      await sendOppskriftMail(env, { to: email, name: "", lang: lang, kind: "levering", pid: pid, nokkel: nokkel });
    } else if (pid.indexOf("skoledagbok") === 0) {
      const bok = pid.indexOf("4-7") !== -1 ? "4-7" : "1-3";
      await sendSkoledagbokMail(env, { to: email, name: "", lang: lang, book: bok, kind: "levering", nokkel: nokkel });
    }
  } catch (e) {}

  return json(SAMME_SVAR);
}
