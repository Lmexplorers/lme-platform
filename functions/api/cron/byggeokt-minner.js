/**
 * Påminnelser til byggeøkten 24. september.
 *
 * GET /api/cron/byggeokt-minner            -> sender det som er forfalt
 * GET /api/cron/byggeokt-minner?dryrun=1   -> sier hva som VILLE blitt sendt
 *
 * Kjøres av .github/workflows/byggeokt-minner.yml to ganger om dagen.
 * Endepunktet bestemmer selv hva som er forfalt ut fra klokken:
 *
 *   uken før     fra 8 til 5 døgn før start
 *   dagen før    fra 36 til 2 timer før
 *   en time før  fra 90 minutter før, til start
 *
 * Vinduene er bevisst smale i hver ende. "Uken før" skal ikke lande to
 * dager før, for da stemmer ikke teksten, og den som kjøper sent får
 * forberedelsene i selve kvitteringen i stedet.
 *
 * Hver deltaker får hver påminnelse én gang. Kjøres endepunktet flere
 * ganger i samme vindu, sendes ingenting på nytt.
 */
import { DELTAKER_KEY, OKT_START, sendByggeoktMinne } from "../../_lib/byggeokt-mail.js";

function json(data, status) {
  return new Response(JSON.stringify(data, null, 2), {
    status: status || 200,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

/* Hvilken påminnelse er forfalt akkurat nå? Null betyr ingen. */
export function forfaltMinne(naa, start) {
  const min = (start - naa) / 60000;
  if (min <= 0) return null;                        // økten er i gang eller over
  if (min <= 90) return "en-time-for";
  if (min <= 36 * 60 && min > 2 * 60) return "dagen-for";
  if (min <= 8 * 24 * 60 && min > 5 * 24 * 60) return "uken-for";
  return null;
}

export async function onRequestGet(context) {
  const { request, env } = context;
  if (!env.BUILDER_KV) return json({ error: "not_configured" }, 200);

  const url = new URL(request.url);
  const dryrun = url.searchParams.get("dryrun") === "1";
  const naa = Date.now();
  const start = Date.parse(OKT_START);
  const minne = forfaltMinne(naa, start);
  if (!minne) return json({ ok: true, minne: null, sendt: 0, melding: "ingenting forfalt nå" });

  let liste = [];
  try {
    const raw = await env.BUILDER_KV.get(DELTAKER_KEY);
    liste = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(liste)) liste = [];
  } catch (e) { liste = []; }

  const skalHa = liste.filter((d) => d && d.epost && !(Array.isArray(d.sendt) ? d.sendt : []).includes(minne));
  if (dryrun) {
    return json({ ok: true, minne, dryrun: true, villeSendt: skalHa.length, deltakere: liste.length });
  }

  let sendt = 0, feilet = 0;
  for (const d of skalHa) {
    try {
      const r = await sendByggeoktMinne(env, d.epost, d.navn, d.lang, minne);
      if (r && r.ok) {
        d.sendt = (Array.isArray(d.sendt) ? d.sendt : []).concat(minne);
        sendt++;
      } else {
        feilet++;
      }
    } catch (e) { feilet++; }
  }
  if (sendt) {
    try { await env.BUILDER_KV.put(DELTAKER_KEY, JSON.stringify(liste)); } catch (e) { /* neste kjøring prøver igjen */ }
  }
  return json({ ok: true, minne, sendt, feilet, deltakere: liste.length });
}
