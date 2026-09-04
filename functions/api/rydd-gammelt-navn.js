/**
 * LME — finn og rett det gamle appnavnet i lagret tekst.
 *
 * Appen heter LME Autopilot. Det gamle navnet ble fjernet fra koden, men
 * sidetekst og kursinnhold som Renate har lagret ligger i Cloudflare KV, ikke
 * i git. Ble en side lagret mens den gamle teksten sto der, viser den fortsatt
 * det gamle navnet, uansett hvor mange ganger HTML-en rettes.
 *
 * Derfor dette: én adresse som leter gjennom alt som er lagret, og som kan
 * rette det på stedet.
 *
 *   GET /api/rydd-gammelt-navn?pw=<passord>
 *       -> { treff: [ { nokkel, felt, utdrag } ], antall }      leter bare
 *
 *   GET /api/rydd-gammelt-navn?pw=<passord>&rett=ja
 *       -> { rettet: [ ... ], antall }                          skriver
 *
 * Uten &rett=ja endres ingenting. Da kan du se hva som ville blitt rettet før
 * du bestemmer deg.
 *
 * Leter i sidetekst (lme-builder:content:*), oversettelser
 * (lme-builder:i18n:*) og kurs (lme-builder:kurs:*), på både norsk og engelsk.
 *
 * Passord: samme som kursredigering (COURSE_EDIT_PASSWORD).
 */

import { DEFAULT_PASSWORD } from "./kurs.js";
import { editPasswordOk } from "../_lib/edit-password.js";

const PREFIKSER = ["lme-builder:content:", "lme-builder:i18n:", "lme-builder:kurs:"];

// Rekkefølgen betyr noe: "LME Content Studio" må tas før "Content Studio",
// ellers står det "LME LME Autopilot" igjen.
const REGLER = [
  [/LME\s+Content\s+Studio/gi, "LME Autopilot"],
  [/Content\s+Studio/gi, "LME Autopilot"],
];

function json(data, status) {
  return new Response(JSON.stringify(data, null, 2), {
    status: status || 200,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

// Beholder store bokstaver hvis originalen skrek: CONTENT STUDIO -> LME AUTOPILOT.
function erstatt(tekst) {
  let ut = tekst;
  for (const [moenster, ny] of REGLER) {
    ut = ut.replace(moenster, (treff) => (treff === treff.toUpperCase() ? ny.toUpperCase() : ny));
  }
  return ut;
}

function harGammeltNavn(tekst) {
  return typeof tekst === "string" && /Content\s+Studio/i.test(tekst);
}

function utdrag(tekst) {
  const i = tekst.search(/Content\s+Studio/i);
  const fra = Math.max(0, i - 60);
  return (fra > 0 ? "…" : "") + tekst.slice(fra, i + 80).replace(/\s+/g, " ") + "…";
}

// Går gjennom en vilkårlig JSON-struktur og retter alle strenger i den.
// Returnerer [ny verdi, antall strenger som ble endret].
function gaaGjennom(verdi) {
  if (typeof verdi === "string") {
    if (!harGammeltNavn(verdi)) return [verdi, 0];
    return [erstatt(verdi), 1];
  }
  if (Array.isArray(verdi)) {
    let n = 0;
    const ut = verdi.map((v) => {
      const [ny, antall] = gaaGjennom(v);
      n += antall;
      return ny;
    });
    return [ut, n];
  }
  if (verdi && typeof verdi === "object") {
    let n = 0;
    const ut = {};
    for (const k of Object.keys(verdi)) {
      const [ny, antall] = gaaGjennom(verdi[k]);
      n += antall;
      ut[k] = ny;
    }
    return [ut, n];
  }
  return [verdi, 0];
}

async function alleNokler(env, prefix) {
  const ut = [];
  let cursor;
  // KV lister 1000 om gangen. Løkka er begrenset, så en uventet stor
  // liste ikke kan gå rundt for alltid.
  for (let runde = 0; runde < 20; runde++) {
    const svar = await env.BUILDER_KV.list({ prefix, cursor });
    for (const n of svar.keys || []) ut.push(n.name);
    if (svar.list_complete || !svar.cursor) break;
    cursor = svar.cursor;
  }
  return ut;
}

export async function onRequestGet(context) {
  const { request, env } = context;
  if (!env.BUILDER_KV) return json({ error: "not_configured" }, 200);

  const url = new URL(request.url);
  const pw = (url.searchParams.get("pw") || "").trim();
  if (!editPasswordOk(env, pw, [DEFAULT_PASSWORD])) return json({ error: "bad_password" }, 401);

  const rett = url.searchParams.get("rett") === "ja";
  const treff = [];
  let skrevet = 0;

  for (const prefix of PREFIKSER) {
    let nokler = [];
    try {
      nokler = await alleNokler(env, prefix);
    } catch (e) {
      treff.push({ nokkel: prefix + "*", felt: "listing", utdrag: "kunne ikke leses: " + String(e) });
      continue;
    }

    for (const nokkel of nokler) {
      let raa;
      try {
        raa = await env.BUILDER_KV.get(nokkel);
      } catch (e) {
        continue;
      }
      if (!raa || !harGammeltNavn(raa)) continue;

      let data;
      try {
        data = JSON.parse(raa);
      } catch (e) {
        // Ikke JSON, behandles som ren tekst.
        treff.push({ nokkel, felt: "(ren tekst)", utdrag: utdrag(raa) });
        if (rett) {
          await env.BUILDER_KV.put(nokkel, erstatt(raa));
          skrevet++;
        }
        continue;
      }

      const [ny, antall] = gaaGjennom(data);
      if (!antall) continue;
      treff.push({ nokkel, felt: antall + " tekst(er)", utdrag: utdrag(raa) });
      if (rett) {
        await env.BUILDER_KV.put(nokkel, JSON.stringify(ny));
        skrevet++;
      }
    }
  }

  return json({
    ok: true,
    modus: rett ? "rettet" : "bare lett",
    antall: treff.length,
    skrevet,
    treff,
    tips: rett
      ? "Ferdig. Last siden på nytt for å se resultatet."
      : "Legg til &rett=ja i adressen for å rette dette.",
  });
}
