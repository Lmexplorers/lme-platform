/**
 * LME AI Core, strømbryter per leverandør.
 *
 * Når en leverandør er nede, er det verste vi kan gjøre å fortsette å kalle
 * den. Hvert kall tar tid, kan koste penger selv når det feiler, og gjør at
 * brukeren venter på et svar som aldri kommer. En strømbryter husker at
 * leverandøren nettopp sviktet, hopper over den en stund, og lar ruteren gå
 * rett til reserven i stedet.
 *
 * Bevisst enkel: teller feil, åpner ved terskelen, lukker etter en pause.
 * Ingen halvåpen tilstand med prøvetrafikk, fordi Cloudflare-funksjoner
 * ikke deler minne og alt må gjennom KV uansett.
 *
 * Alt er fail-open. Kan vi ikke lese tilstanden, regner vi leverandøren som
 * frisk. En strømbryter som stenger på grunn av sin egen feil er verre enn
 * ingen strømbryter.
 *
 * KV-nøkkel: ai:breaker:<leverandør> -> { fails, openedAt, lastError }
 */

const PREFIX = "ai:breaker:";

/** Så mange feil på rad før vi hopper over leverandøren. */
export const FAIL_THRESHOLD = 4;

/** Hvor lenge vi hopper over den, i sekunder. */
export const COOLDOWN_SECONDS = 5 * 60;

/** Hvor lenge en feiltelling lever hvis ingenting mer skjer. */
const COUNTER_TTL = 15 * 60;

/**
 * Er dette en feil hos leverandøren, eller bare et dårlig svar.
 *
 * Skillet er viktigere enn det ser ut. Hvis en modell svarer med ugyldig
 * JSON fire ganger på rad, er ikke Anthropic nede: promptet er dårlig. Å
 * telle det som leverandørfeil ville satt Claude på pause for HELE
 * plattformen på grunn av én app sitt prompt. Strømbryteren skal bare
 * reagere på det den faktisk kan gjøre noe med, altså at leverandøren ikke
 * svarer: tidsavbrudd, nettverksfeil, 429 og 5xx.
 *
 * Feil vi med vilje IKKE teller: ugyldig modellsvar, manglende nøkkel og
 * 4xx. En pause i fem minutter reparerer ingen av dem.
 */
export function isProviderFault(error) {
  const msg = String((error && error.message) || error || "").toLowerCase();
  if (!msg) return false;
  if (/_(429|5\d\d)\b/.test(msg)) return true;
  if (/\b(429|500|502|503|504)\b/.test(msg)) return true;
  return /timeout|timed out|abort|network|fetch failed|econnreset|socket/.test(msg);
}

async function readState(env, providerId) {
  if (!env || !env.BUILDER_KV || !providerId) return null;
  try {
    const raw = await env.BUILDER_KV.get(PREFIX + providerId);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

/**
 * Er leverandøren tilgjengelig akkurat nå.
 * Returnerer { ok, openedAt, retryInSeconds, fails }.
 */
export async function providerHealthy(env, providerId) {
  const state = await readState(env, providerId);
  if (!state || !state.openedAt) return { ok: true, fails: (state && state.fails) || 0 };

  const elapsed = (Date.now() - state.openedAt) / 1000;
  if (elapsed >= COOLDOWN_SECONDS) return { ok: true, fails: state.fails || 0 };

  return {
    ok: false,
    openedAt: state.openedAt,
    retryInSeconds: Math.ceil(COOLDOWN_SECONDS - elapsed),
    fails: state.fails || 0,
    lastError: state.lastError || "",
  };
}

/**
 * Registrerer at et kall mot leverandøren feilet.
 * Åpner strømbryteren når terskelen nås. Kalles fire-and-forget, aldri
 * med await der brukeren venter på svar.
 */
export async function noteFailure(env, providerId, error) {
  if (!env || !env.BUILDER_KV || !providerId) return;
  try {
    const state = (await readState(env, providerId)) || { fails: 0 };
    const fails = (Number(state.fails) || 0) + 1;
    const next = {
      fails: fails,
      openedAt: fails >= FAIL_THRESHOLD ? Date.now() : (state.openedAt || 0),
      lastError: String(error || "").slice(0, 200),
    };
    await env.BUILDER_KV.put(PREFIX + providerId, JSON.stringify(next), {
      expirationTtl: Math.max(COUNTER_TTL, COOLDOWN_SECONDS * 2),
    });
  } catch (e) {
    // Uten telling får vi bare ingen strømbryter. Kallene går som før.
  }
}

/** Registrerer at leverandøren svarte. Nullstiller alt. */
export async function noteSuccess(env, providerId) {
  if (!env || !env.BUILDER_KV || !providerId) return;
  try {
    const state = await readState(env, providerId);
    if (!state) return; // Ingenting å nullstille, spar en skriving.
    await env.BUILDER_KV.delete(PREFIX + providerId);
  } catch (e) {
    // Verste utfall: en gammel telling lever til den går ut på tid.
  }
}

/** Tilstanden for alle leverandører som har en, til statussiden. */
export async function breakerStatus(env, providerIds) {
  const out = {};
  for (const id of providerIds || []) {
    const health = await providerHealthy(env, id);
    if (!health.ok || health.fails) out[id] = health;
  }
  return out;
}
