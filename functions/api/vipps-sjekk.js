/**
 * MIDLERTIDIG: finner ut hvorfor /api/vipps-pay svarer med Cloudflares
 * "502 Bad gateway" i stedet for vårt eget svar.
 *
 *   Åpne https://lmexplorers.com/api/vipps-sjekk
 *
 * En 502 fra Cloudflare betyr at funksjonen aldri rekker å svare. Da hjelper
 * det ikke å legge inn flere feilmeldinger i koden, for den kjører ikke.
 * Årsaken må ligge før den: en modul som ikke lastes, eller et kall som
 * henger. Denne siden tar ett steg om gangen, hver for seg, og sier hvilket
 * steg som stopper.
 *
 * Hvert steg bruker `import()` underveis i stedet for `import` på toppen.
 * Feiler en modul da, blir det en feilmelding vi kan lese, ikke en funksjon
 * som ikke starter.
 *
 * PERSONVERN: ingen hemmelighet kommer ut herfra. Bare om en innstilling
 * finnes eller ikke, og hvor mange tegn den er.
 *
 * Slettes så snart vi vet svaret.
 */

function tekst(linjer) {
  return new Response(linjer.join("\n") + "\n", {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" },
  });
}

async function steg(navn, fn) {
  const t0 = Date.now();
  try {
    const svar = await fn();
    return "OK    " + navn + "  (" + (Date.now() - t0) + " ms)" + (svar ? "\n        " + svar : "");
  } catch (e) {
    return "STOPP " + navn + "  (" + (Date.now() - t0) + " ms)\n        " + String((e && e.message) || e);
  }
}

export async function onRequestGet(context) {
  const { env } = context;
  const ut = ["Vipps-sjekk", "===========", ""];

  ut.push("1. Kjører funksjoner i det hele tatt");
  ut.push("OK    denne siden svarer, så ja");
  ut.push("");

  ut.push("2. Innstillinger (bare lengde, aldri verdien)");
  for (const n of ["VIPPS_ENV", "VIPPS_CLIENT_ID", "VIPPS_CLIENT_SECRET",
                   "VIPPS_SUBSCRIPTION_KEY", "VIPPS_MERCHANT_SERIAL_NUMBER",
                   "VIPPS_WEBHOOK_SECRET"]) {
    const v = env[n];
    ut.push(v ? "OK    " + n.padEnd(30) + String(v).length + " tegn" +
                (n === "VIPPS_ENV" ? " (" + v + ")" : "")
              : "MANGLER " + n);
  }
  ut.push("");

  ut.push("3. Laster modulene hver for seg");
  ut.push(await steg("_lib/vipps.js", async () => {
    const m = await import("../_lib/vipps.js");
    return "adresse: " + m.vippsBaseUrl(env) +
           ", manglende nøkkel: " + (m.manglendeVippsNokkel(env) || "ingen");
  }));
  ut.push(await steg("api/laeringsverksted.js", async () => {
    const m = await import("./laeringsverksted.js");
    return "KEY_PREFIX: " + m.KEY_PREFIX;
  }));
  ut.push(await steg("_lib/purchase-links.js", async () => {
    const m = await import("../_lib/purchase-links.js");
    return Object.keys(m.COURSE_INFO).length + " kurs";
  }));
  ut.push(await steg("_lib/plans.js", async () => {
    const m = await import("../_lib/plans.js");
    return m.COURSES.length + " kurs i prislisten";
  }));
  ut.push("");

  ut.push("4. Slår opp skoledagboka i KV");
  ut.push(await steg("BUILDER_KV", async () => {
    if (!env.BUILDER_KV) throw new Error("BUILDER_KV er ikke bundet");
    const m = await import("./laeringsverksted.js");
    const raw = await env.BUILDER_KV.get(m.KEY_PREFIX + "skoledagbok-1-3-trinn");
    if (!raw) throw new Error("fant ikke skoledagbok-1-3-trinn");
    const r = JSON.parse(raw);
    return "pris: " + JSON.stringify(r.price) + ", type: " + r.priceType +
           ", publisert: " + (r.published !== false);
  }));
  ut.push("");

  ut.push("5. Ringer Vipps for et tegn (det er her /api/vipps-pay stopper)");
  ut.push(await steg("accessToken", async () => {
    const m = await import("../_lib/vipps.js");
    const tok = await m.getVippsAccessToken(env);
    return "fikk et tegn på " + String(tok).length + " tegn";
  }));

  ut.push("");
  ut.push("Send hele denne siden til meg, så vet jeg hva som skal fikses.");
  return tekst(ut);
}
