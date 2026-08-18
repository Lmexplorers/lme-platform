/**
 * LME AI Core, felles kreditt- og kvotefasade.
 *
 * ==========================================================================
 * DENNE FILEN FLYTTER INGEN PENGER
 * ==========================================================================
 * Plattformen har i dag fire ulike kostnadssystemer som ikke vet om
 * hverandre (se docs/ai-core-arkitektur.md, del 1.4). Denne filen slår dem
 * IKKE sammen. Den leser dem som de er, gjennom de samme funksjonene som
 * allerede eier logikken, og gir resten av AI Core ett felles språk å
 * spørre i.
 *
 * Ingen ny KV-nøkkel. Ingen endret saldo. Ingen ny prislogikk. Hvis denne
 * filen slettes, oppfører plattformen seg nøyaktig som før.
 *
 * De fire systemene:
 *
 *   A  Månedskvote + kredittpåfyll   access.js enforceGeneration()
 *      usage:<e-post>:<år-måned> og credit:<e-post>
 *      Brukes av Autopilot: bilde, video, reel, YouTube.
 *
 *   B  Ren forhåndsbetalt kreditt    access.js enforceVideoApp() /
 *      credit:<e-post>               enforceHeadshotApp()
 *      Brukes av Video Studio og AI Headshot. Ingen gratis kvote.
 *
 *   C  VideoFlow-kreditter           videoflow-credits.js
 *      vf-credit:<e-post>            Egen valuta, egen prisliste.
 *
 *   D  Mia & Teo                     ingen kreditt, kun eiertilgang
 *
 * Når de fire en gang skal bli én valuta, er det denne fasaden som skal
 * bytte innmat, mens rutene over den står uendret. Selve sammenslåingen er
 * en egen beslutning med egne konsekvenser for betalende brukere, og gjøres
 * ikke her.
 */

import { sessionUser, isOwner, getAccess } from "../access.js";
import { getBalance as vfGetBalance } from "../videoflow-credits.js";
import { CREDIT_COSTS as VF_COSTS, estimateVoiceCredits } from "../videoflow-providers.js";

/** Hvilket kostnadssystem en gitt app hører til. */
export const APP_SYSTEM = {
  autopilot: "kvote",       // A
  youtube: "kvote",         // A
  "video-studio": "kreditt", // B
  headshot: "kreditt",      // B
  videoflow: "vf",          // C
  "mia-teo": "eier",        // D
  // Resten har ingen kostnadskontroll i dag. Det er nettopp det AI Core
  // skal rette opp, men det skjer i en egen fase, ikke her.
  builder: "ingen",
  "nathalie-ai": "ingen",
  bookly: "ingen",
  blogg: "ingen",
  podcast: "ingen",
  tts: "ingen",
  oversettelse: "ingen",
  sidetekst: "ingen",
  faq: "ingen",
  schema: "ingen",
  "film-manus": "ingen",
  utfordringen: "ingen",
  innboks: "ingen",
};

export function systemFor(app) {
  return APP_SYSTEM[app] || "ingen";
}

/**
 * Hele kostnadsbildet for én bruker, samlet ett sted, uten å trekke noe.
 * Dette er det nærmeste plattformen kommer "hva har jeg igjen" i dag, og
 * det er med vilje ærlig om at det er flere separate potter.
 *
 * Returnerer:
 *   {
 *     loggedIn, owner, email,
 *     kvote:   { image, video } | null   månedsgrensen som gjelder
 *     kreditt: { image, video }          forhåndskjøpt påfyll
 *     vf:      <heltall>                 VideoFlow-kreditter
 *     ubegrenset: true                   for eier
 *   }
 */
export async function balanceFor(context) {
  const user = await sessionUser(context);
  if (!user) {
    return { loggedIn: false, owner: false, email: "", kvote: null, kreditt: null, vf: 0, ubegrenset: false };
  }

  const owner = isOwner(user);
  const access = await getAccess(context);
  const vf = await vfGetBalance(context.env, user.email);

  return {
    loggedIn: true,
    owner: owner,
    email: user.email,
    // Eier har alltid full tilgang, i tråd med regelen om at eier aldri
    // betaler for sitt eget produkt (functions/_lib/access.js isOwner).
    ubegrenset: owner,
    kvote: access.limits || null,
    kreditt: access.credit || { image: 0, video: 0 },
    vf: vf,
    plan: access.plan || null,
    tier: access.tier || null,
  };
}

/**
 * Hva en generering koster, uttrykt i valutaen appen faktisk bruker.
 * Ren regning, ingen nettverkskall, ingen trekk. Brukes til
 * kostnadsestimat før dyre genereringer.
 *
 * Returnerer { system, amount, unit } eller null når appen ikke har noe
 * kostnadssystem i dag.
 */
export function estimateCost(app, task, units) {
  const system = systemFor(app);
  const u = units || {};

  if (system === "vf") {
    switch (task) {
      case "text":       return { system: system, amount: VF_COSTS.script, unit: "videoflow-kreditt" };
      case "image":      return { system: system, amount: VF_COSTS.image * (Number(u.images) || 1), unit: "videoflow-kreditt" };
      case "voice":      return { system: system, amount: estimateVoiceCredits(u.text || ""), unit: "videoflow-kreditt" };
      case "video":      return { system: system, amount: VF_COSTS.video * (Number(u.clips) || 1), unit: "videoflow-kreditt" };
      case "transcribe": return { system: system, amount: VF_COSTS.transcribe, unit: "videoflow-kreditt" };
      default:           return { system: system, amount: 0, unit: "videoflow-kreditt" };
    }
  }

  if (system === "kvote" || system === "kreditt") {
    // Begge disse teller hele genereringer, ikke tegn eller tokens: én
    // video eller ett bilde, uansett hvor stort promptet var.
    if (task === "video") return { system: system, amount: Number(u.clips) || 1, unit: "video-kreditt" };
    if (task === "image") return { system: system, amount: Number(u.images) || 1, unit: "bilde-kreditt" };
    return { system: system, amount: 0, unit: "ingen" };
  }

  if (system === "eier") return { system: system, amount: 0, unit: "eiertilgang" };

  return null;
}

/**
 * Kort, ærlig forklaring på hvilket kostnadssystem en app bruker, til
 * administrasjonssiden og til feilmeldinger. Tospråklig.
 */
export function describeSystem(system, lang) {
  const en = lang === "en";
  switch (system) {
    case "kvote":
      return en
        ? "Monthly quota, then prepaid credit."
        : "Månedskvote, deretter forhåndskjøpt kreditt.";
    case "kreditt":
      return en
        ? "Prepaid credit only, no free quota."
        : "Kun forhåndskjøpt kreditt, ingen gratis kvote.";
    case "vf":
      return en
        ? "VideoFlow credits, its own currency."
        : "VideoFlow-kreditter, en egen valuta.";
    case "eier":
      return en ? "Owner only, no credit." : "Kun eier, ingen kreditt.";
    default:
      return en
        ? "No cost control yet."
        : "Ingen kostnadskontroll ennå.";
  }
}
