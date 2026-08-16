/**
 * LME AI Core, betal for det du bruker (pay as you go).
 *
 * ==========================================================================
 * HVA DETTE LØSER
 * ==========================================================================
 * Renate skal aldri stå for andres bruk. Samtidig skal ikke en kunde stoppe
 * helt opp midt i en arbeidsøkt fordi månedskvoten tok slutt.
 *
 * Løsningen er den samme som NexLev bruker: kvoten i planen er veggen, og
 * kunden kan selv velge å fortsette forbi den med forhåndskjøpt kreditt.
 * Renate ligger aldri ute med noe, fordi kreditten er betalt på forhånd.
 *
 * FORSKJELLEN FRA NEXLEV: hos dem trekkes kortet når du går forbi grensen,
 * og derfor MÅ det være avslått som standard. Hos LME er kreditten kjøpt på
 * forhånd, så det finnes ingen overraskende trekk. Bryteren er derfor til
 * for det motsatte: å BESKYTTE saldoen din, slik at 25 videoer kjøpt til et
 * bestemt prosjekt ikke blir spist opp av tilfeldige testbilder.
 *
 * Derfor: avslått som standard, men slås automatisk PÅ når du kjøper en
 * kredittpakke, siden det er nettopp derfor du kjøpte den. Da er den aldri
 * overraskende, verken på eller av.
 *
 * `explicit` husker at kunden selv har tatt et valg. Da lar et senere kjøp
 * bryteren stå slik hun satte den: har hun skrudd av for å spare saldoen til
 * et bestemt prosjekt, skal ikke neste påfyll oppheve det uten at hun vet.
 *
 * KV-nøkler:
 *   payg:<e-post>       -> { on, explicit, updatedAt, starterGiven }
 *   payg-tx:<e-post>    -> [ { t, kind, amount, balance, note } ]  nyeste først
 */

const FLAG = "payg:";
const TX = "payg-tx:";

/** Så mange linjer vi husker i kvitteringen. Nok til å se et helt år. */
const TX_MAX = 200;

function key(prefix, email) {
  return prefix + String(email || "").trim().toLowerCase();
}

async function readJson(env, k, fallback) {
  try {
    const raw = await env.BUILDER_KV.get(k);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    return fallback;
  }
}

/**
 * Innstillingen til én bruker.
 * Returnerer { on, updatedAt, starterGiven }. Standard er avslått.
 */
export async function paygState(env, email) {
  const tom = { on: false, explicit: false, updatedAt: 0, starterGiven: false };
  if (!env || !env.BUILDER_KV || !email) return tom;
  const s = await readJson(env, key(FLAG, email), null);
  if (!s) return tom;
  return {
    on: !!s.on,
    explicit: !!s.explicit,
    updatedAt: s.updatedAt || 0,
    starterGiven: !!s.starterGiven,
  };
}

/** Er det lov å trekke fra kredittsaldoen for denne brukeren nå. */
export async function paygEnabled(env, email) {
  return (await paygState(env, email)).on;
}

/** Slår på eller av. Returnerer den nye tilstanden. */
export async function setPayg(env, email, on) {
  if (!env || !env.BUILDER_KV || !email) return { on: false };
  const prev = await paygState(env, email);
  // explicit: fra nå av er dette kundens eget valg, og et senere kjøp skal
  // ikke overstyre det.
  const next = { on: !!on, explicit: true, updatedAt: Date.now(), starterGiven: prev.starterGiven };
  try {
    await env.BUILDER_KV.put(key(FLAG, email), JSON.stringify(next));
  } catch (e) {
    return prev;
  }
  await logTx(env, email, {
    kind: on ? "enabled" : "disabled",
    amount: 0,
    note: on ? "Slått på" : "Slått av",
  });
  return next;
}

/**
 * Kalles når en kredittpakke er kjøpt. Slår på automatisk, siden det er
 * grunnen til at kunden kjøpte, og fører kjøpet i kvitteringen.
 */
export async function onCreditPurchase(env, email, kind, amount, balance) {
  if (!env || !env.BUILDER_KV || !email) return;
  const prev = await paygState(env, email);
  // Slå på ved kjøp, men BARE hvis kunden aldri har tatt et valg selv. Har
  // hun skrudd av med vilje, får påfyllet stå urørt til hun skrur på igjen.
  if (!prev.on && !prev.explicit) {
    try {
      await env.BUILDER_KV.put(key(FLAG, email), JSON.stringify({
        on: true, explicit: false, updatedAt: Date.now(), starterGiven: prev.starterGiven,
      }));
    } catch (e) { /* kjøpet er viktigere enn bryteren */ }
  }
  await logTx(env, email, {
    kind: "topup", unit: kind, amount: amount, balance: balance,
    note: "Kjøpt påfyll",
  });
}

/**
 * Startkreditt, gis én gang. Idempotent: kalles den to ganger, skjer det
 * ingenting den andre gangen. Returnerer true bare hvis den faktisk ble gitt.
 */
export async function grantStarterOnce(env, email) {
  if (!env || !env.BUILDER_KV || !email) return false;
  const prev = await paygState(env, email);
  if (prev.starterGiven) return false;
  try {
    await env.BUILDER_KV.put(key(FLAG, email), JSON.stringify({
      on: prev.on, explicit: prev.explicit, updatedAt: Date.now(), starterGiven: true,
    }));
  } catch (e) {
    return false;
  }
  return true;
}

/**
 * Fører en linje i kvitteringen. Feiler aldri på en måte som velter noe:
 * en tapt kvitteringslinje er et lite tap, en feilet generering er et stort.
 */
export async function logTx(env, email, entry) {
  if (!env || !env.BUILDER_KV || !email) return;
  try {
    const k = key(TX, email);
    const liste = (await readJson(env, k, [])) || [];
    const rad = {
      t: Date.now(),
      kind: String((entry && entry.kind) || "ukjent"),
      unit: (entry && entry.unit) || "",
      amount: Number((entry && entry.amount) || 0),
      balance: entry && entry.balance != null ? Number(entry.balance) : null,
      app: (entry && entry.app) || "",
      note: String((entry && entry.note) || "").slice(0, 120),
    };
    const neste = [rad].concat(Array.isArray(liste) ? liste : []).slice(0, TX_MAX);
    await env.BUILDER_KV.put(k, JSON.stringify(neste));
  } catch (e) {
    // Med vilje stille.
  }
}

/** Kvitteringen, nyeste først. */
export async function history(env, email) {
  if (!env || !env.BUILDER_KV || !email) return [];
  const liste = await readJson(env, key(TX, email), []);
  return Array.isArray(liste) ? liste : [];
}

/** Vennlig forklaring når kvoten er brukt opp og bryteren er av. */
export function offMessage(kind, lang) {
  const en = lang === "en";
  const hva = kind === "video" ? (en ? "videos" : "video") : (en ? "images" : "bilder");
  return en
    ? "You have used this month's quota for " + hva +
      ". You have credits saved, but 'keep going past the limit' is turned off, " +
      "so they are being protected. Turn it on to use them, or wait for the quota to reset."
    : "Du har brukt opp månedskvoten for " + hva +
      ". Du har kreditt spart opp, men \"fortsett forbi grensen\" er slått av, " +
      "så den blir stående urørt. Slå den på for å bruke den, eller vent til kvoten nullstilles.";
}
