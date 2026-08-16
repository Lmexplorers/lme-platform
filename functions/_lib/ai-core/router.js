/**
 * LME AI Core, ruting: primærmodell og reserve.
 *
 * Ruteren velger ikke noe nytt for appene. Den beskriver valget som allerede
 * finnes i koden, samlet ett sted, slik at rekkefølgen "OpenAI først, så
 * Gemini, så Stability, så Cloudflare, så Pollinations" står én gang i
 * stedet for i fem filer.
 *
 * `pick()` gir en liste: primærmodell først, deretter reservene. Modeller
 * som mangler nøkler faller ut, og det samme gjør leverandører der
 * strømbryteren står åpen etter gjentatte feil (se breaker.js). Er ALT
 * utilgjengelig, får kalleren likevel den opprinnelige listen tilbake, med
 * `degraded: true`. Å prøve en leverandør som kanskje er nede er bedre enn
 * å nekte brukeren å prøve i det hele tatt.
 *
 * Ruteren gjør ingen nettverkskall og kjenner ingen leverandør-API-er. Den
 * sier bare hvilken modell som bør prøves i hvilken rekkefølge.
 */

import { MODELS, findModel, providerConfigured } from "./registry.js";
import { providerHealthy } from "./breaker.js";

/**
 * Standardrekkefølgen per oppgavetype, slik appene faktisk gjør det i dag.
 * Endres denne, endres reserveveien for alle som bruker ruteren, så det
 * skal være en bevisst avgjørelse.
 */
export const CHAINS = {
  text: ["claude-sonnet-5", "gpt-4o-mini"],
  image: [
    "gpt-image-1",
    "gemini-2.5-flash-image",
    "stable-image-core",
    "@cf/bytedance/stable-diffusion-xl-lightning",
    "pollinations",
  ],
  voice: ["eleven_multilingual_v2", "gpt-4o-mini-tts"],
  transcribe: ["whisper-1"],
  video: ["dop-turbo"],
  render: ["whiteboard-render"],
  publish: ["blotato-publish"],
};

/**
 * Kvalitetsvalg. "høy" er standard for det brukeren ser, "rask" brukes der
 * svaret er en mellomregning (oversettelse, korte forslag) og ventetiden
 * betyr mer enn den siste prosenten kvalitet.
 */
const QUALITY_ORDER = { høy: 0, middels: 1, rask: 2, lav: 3, "n/a": 4 };

function rank(quality) {
  const n = QUALITY_ORDER[quality];
  return typeof n === "number" ? n : 9;
}

function baseChain(task, opts) {
  const o = opts || {};
  const chain = (CHAINS[task] || []).slice();

  // En uttrykkelig ønsket modell går først, uten å fjerne reservene.
  if (o.prefer && findModel(o.prefer)) {
    const i = chain.indexOf(o.prefer);
    if (i > -1) chain.splice(i, 1);
    chain.unshift(o.prefer);
  }

  let models = chain.map(findModel).filter(Boolean);

  // Vil kalleren ha noe raskt eller billig, sorteres reservene deretter,
  // men primærmodellen beholder plassen sin.
  if (o.quality && models.length > 1) {
    const wanted = rank(o.quality);
    const first = models[0];
    const rest = models.slice(1).sort((a, b) => {
      return Math.abs(rank(a.quality) - wanted) - Math.abs(rank(b.quality) - wanted);
    });
    models = [first].concat(rest);
  }

  return models;
}

/**
 * Hvilke modeller som bør prøves, i rekkefølge.
 *
 *   const route = await pick(env, "image", { prefer: "gpt-image-1" });
 *   for (const model of route.models) { ... prøv ... }
 *
 * Returnerer:
 *   {
 *     models:   [ modell, ... ]  i rekkefølge, primær først
 *     skipped:  [ { id, provider, grunn } ]
 *     degraded: true hvis ingenting var tilgjengelig og vi prøver likevel
 *   }
 */
export async function pick(env, task, opts) {
  const all = baseChain(task, opts);
  const models = [];
  const skipped = [];

  for (const m of all) {
    if (!providerConfigured(env, m.provider)) {
      skipped.push({ id: m.id, provider: m.provider, grunn: "mangler nøkkel" });
      continue;
    }
    const health = await providerHealthy(env, m.provider);
    if (!health.ok) {
      skipped.push({
        id: m.id,
        provider: m.provider,
        grunn: "strømbryter åpen, prøver igjen om " + health.retryInSeconds + " sekunder",
      });
      continue;
    }
    models.push(m);
  }

  if (!models.length && all.length) {
    // Alt er utilgjengelig på papiret. Prøv likevel, og si fra om det.
    return { models: all, skipped: skipped, degraded: true };
  }
  return { models: models, skipped: skipped, degraded: false };
}

/**
 * Samme valg uten KV-oppslag, altså uten strømbryter. Til dry run og
 * kostnadsestimat, der vi bare skal vise hva som vil bli brukt.
 */
export function pickSync(env, task, opts) {
  const models = baseChain(task, opts).filter((m) => providerConfigured(env, m.provider));
  return { models: models, skipped: [], degraded: false };
}

/** Alle oppgavetyper ruteren kjenner. Til statussiden. */
export function knownTasks() {
  return Object.keys(CHAINS);
}

/** Modeller i registeret som ingen kjede peker på, altså døde oppføringer. */
export function orphanModels() {
  const used = new Set();
  Object.keys(CHAINS).forEach((t) => CHAINS[t].forEach((id) => used.add(id)));
  return MODELS.filter((m) => !used.has(m.id)).map((m) => m.id);
}
