/**
 * LME AI Core, vern mot dobbeltkall og endeløs regenerering.
 *
 * Det dyreste som skjer på plattformen er ikke en generering. Det er den
 * samme genereringen to ganger. Et dobbelttrykk, en treg mobil som sender
 * skjemaet på nytt, en "prøv igjen" mens det første kallet fortsatt går:
 * hver av dem koster full pris og gir brukeren nøyaktig det samme svaret.
 *
 * Denne filen gir to nivåer av vern, med vilje forskjellige:
 *
 *   1. Kort vindu, automatisk fingeravtrykk (standard 90 sekunder).
 *      Blokkerer dobbelttrykket, men ikke en bevisst ny generering et
 *      minutt senere. Det siste er en helt legitim ting å ville gjøre,
 *      og skal ikke stoppes.
 *
 *   2. Langt vindu, nøkkel fra klienten (standard 24 timer).
 *      Når appen selv sier "dette er samme forsøk", holder vi på svaret og
 *      gir det tilbake i stedet for å kalle på nytt.
 *
 * Alt er fail-open: hvis KV ikke svarer, slipper kallet gjennom. Et
 * kostnadsvern skal aldri kunne bli grunnen til at ingenting virker.
 *
 * KV-nøkkel: ai:idem:<fingeravtrykk> -> { state, at, result, error }
 */

const PREFIX = "ai:idem:";

/** Standardvinduer, i sekunder. */
export const SHORT_WINDOW = 90;          // dobbelttrykk
export const LONG_WINDOW = 60 * 60 * 24; // uttrykkelig samme forsøk

/**
 * Hvor lenge et kall får stå som "pågår" før vi antar at det døde.
 * Cloudflare Pages Functions har uansett en øvre kjøretid, og en
 * generering som har hengt i to minutter kommer ikke tilbake.
 */
const STALE_MS = 2 * 60 * 1000;

/**
 * Skilletegn mellom delene i et fingeravtrykk. Et tegn brukeren umulig kan
 * skrive, slik at ["a b", "c"] og ["a", "b c"] ikke ender opp med samme
 * nøkkel og blokkerer hverandre.
 */
const SEP = String.fromCharCode(31); // ASCII unit separator

/**
 * Stabilt fingeravtrykk av det som gjør kallet unikt.
 * Samme bruker + samme app + samme inndata gir samme nøkkel.
 */
export async function fingerprint(parts) {
  const text = (Array.isArray(parts) ? parts : [parts])
    .map((p) => (p == null ? "" : String(p)))
    .join(SEP);
  const bytes = new TextEncoder().encode(text);
  const hash = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(hash).slice(0, 16))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function readSlot(env, key) {
  try {
    const raw = await env.BUILDER_KV.get(PREFIX + key);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

/**
 * Melder fra at et kall starter, og sier om det får lov.
 *
 *   const slot = await beginCall(env, key, SHORT_WINDOW);
 *   if (slot.state === "done")    return json(slot.result);       // samme svar igjen
 *   if (slot.state === "running") return json({ error: ... }, 409); // holder på
 *   ... gjør kallet ...
 *   await finishCall(env, key, resultat, SHORT_WINDOW);
 *
 * state:
 *   "new"     -> gå videre, dette er et ekte nytt kall
 *   "running" -> et likt kall pågår akkurat nå, ikke kall en gang til
 *   "done"    -> vi har svaret fra sist, bruk det i stedet for å betale igjen
 */
export async function beginCall(env, key, windowSeconds) {
  if (!env || !env.BUILDER_KV || !key) return { state: "new" };

  const existing = await readSlot(env, key);
  if (existing && existing.state === "done") {
    return { state: "done", result: existing.result, at: existing.at };
  }
  if (existing && existing.state === "running" && Date.now() - (existing.at || 0) < STALE_MS) {
    return { state: "running", at: existing.at };
  }

  try {
    await env.BUILDER_KV.put(
      PREFIX + key,
      JSON.stringify({ state: "running", at: Date.now() }),
      { expirationTtl: Math.max(60, windowSeconds || SHORT_WINDOW) }
    );
  } catch (e) {
    // Klarte ikke reservere plassen. La kallet gå heller enn å stoppe det.
  }
  return { state: "new" };
}

/** Lagrer svaret, slik at et likt kall innen vinduet får det gratis. */
export async function finishCall(env, key, result, windowSeconds) {
  if (!env || !env.BUILDER_KV || !key) return;
  try {
    await env.BUILDER_KV.put(
      PREFIX + key,
      JSON.stringify({ state: "done", at: Date.now(), result: result }),
      { expirationTtl: Math.max(60, windowSeconds || SHORT_WINDOW) }
    );
  } catch (e) {
    // Mister gjenbruken, ikke svaret. Brukeren merker ingenting.
  }
}

/**
 * Frigjør plassen etter et mislykket kall.
 * Viktig: en feilet generering skal ALLTID kunne prøves på nytt med en
 * gang. Uten dette ville vernet mot dobbeltkall blitt en felle.
 */
export async function releaseCall(env, key) {
  if (!env || !env.BUILDER_KV || !key) return;
  try {
    await env.BUILDER_KV.delete(PREFIX + key);
  } catch (e) {
    // Nøkkelen går ut på tid av seg selv uansett.
  }
}

/** Vennlig melding når et likt kall allerede pågår, tospråklig. */
export function busyMessage(lang) {
  return lang === "en"
    ? "This is already being generated. Wait a moment instead of starting it again, so you are not charged twice."
    : "Dette lages allerede. Vent litt i stedet for å starte på nytt, så slipper du å betale to ganger.";
}
