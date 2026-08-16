/**
 * LME AI Core, hva en generering koster for brukeren.
 *
 * ==========================================================================
 * DETTE ER DAGENS PRISER, IKKE DE PLANLAGTE
 * ==========================================================================
 * Plattformen har fortsatt fire kostnadssystemer (se ledger.js). Denne
 * filen beskriver det som FAKTISK trekkes i dag, slik at en side kan si
 * "dette koster 1 video-kreditt" og ha rett. Den lyver ikke om framtiden.
 *
 * De planlagte, felles prisene ligger nederst under PLANLAGT, tydelig
 * skilt ut, så de kan tas i bruk samtidig som valutaene slås sammen og
 * ikke et minutt før.
 *
 * Kronetallene er hentet fra det kredittpakkene faktisk selges for på
 * /kjop-kreditt, ikke fra leverandørkostnad. Det er prisen kunden har
 * betalt, og derfor det ærligste tallet å vise henne.
 */

import { estimateCost } from "./ledger.js";

/**
 * Hva én enhet av hver valuta er verdt i kroner, regnet fra den største
 * pakken på /kjop-kreditt (den kunden mest sannsynlig har kjøpt).
 *
 *   bilde-kreditt:   200 bilder til 279 kr  -> 1,40 kr
 *   video-kreditt:    25 videoer til 599 kr -> 23,96 kr
 *   videoflow-kreditt: 2000 til $8 (84 kr)  -> 0,042 kr
 */
export const UNIT_NOK = {
  "bilde-kreditt": 1.40,
  "video-kreditt": 23.96,
  "videoflow-kreditt": 0.042,
  "eiertilgang": 0,
  "ingen": 0,
};

const UNIT_LABEL = {
  "bilde-kreditt": { no: ["bilde-kreditt", "bilde-kreditter"], en: ["image credit", "image credits"] },
  "video-kreditt": { no: ["video-kreditt", "video-kreditter"], en: ["video credit", "video credits"] },
  "videoflow-kreditt": { no: ["VideoFlow-kreditt", "VideoFlow-kreditter"], en: ["VideoFlow credit", "VideoFlow credits"] },
};

function plural(unit, amount, lang) {
  const l = UNIT_LABEL[unit];
  if (!l) return unit;
  const ord = l[lang === "en" ? "en" : "no"];
  return amount === 1 ? ord[0] : ord[1];
}

function kroner(n) {
  if (n >= 10) return Math.round(n) + " kr";
  if (n >= 1) return n.toFixed(2).replace(".", ",") + " kr";
  return (Math.round(n * 100) / 100).toFixed(2).replace(".", ",") + " kr";
}

/**
 * Hva én generering koster, ferdig til å vises.
 *
 *   priceFor("video-studio", "video")
 *   -> { amount: 1, unit: "video-kreditt", nok: 23.96,
 *        text: { no: "1 video-kreditt (ca. 24 kr)", en: "1 video credit (about 24 kr)" } }
 *
 * Returnerer null når appen ikke har noe kostnadssystem i dag. Det er ikke
 * det samme som gratis: det betyr at ingen teller, og at det er nettopp
 * det AI Core skal rette opp.
 */
export function priceFor(app, task, units) {
  const est = estimateCost(app, task, units);
  if (!est || est.system === "ingen") return null;
  if (est.system === "eier") {
    return {
      amount: 0, unit: "eiertilgang", nok: 0,
      text: { no: "gratis for deg som eier", en: "free for you as the owner" },
    };
  }

  const amount = est.amount;
  const nok = (UNIT_NOK[est.unit] || 0) * amount;
  const mk = (lang) => {
    const enhet = plural(est.unit, amount, lang);
    if (!nok) return amount + " " + enhet;
    const ca = lang === "en" ? "about " : "ca. ";
    return amount + " " + enhet + " (" + ca + kroner(nok) + ")";
  };

  return {
    amount: amount, unit: est.unit, system: est.system, nok: Math.round(nok * 100) / 100,
    text: { no: mk("no"), en: mk("en") },
  };
}

/**
 * Prislisten for de handlingene sidene faktisk spør om.
 * Nøkkelen er den samme strengen som brukes i data-lme-price="..." i HTML.
 */
export const SHOWN = {
  "reel-video": { app: "autopilot", task: "video" },
  "reel-bilde": { app: "autopilot", task: "image" },
  "youtube-video": { app: "youtube", task: "video" },
  "video-studio": { app: "video-studio", task: "video" },
  "headshot": { app: "headshot", task: "image" },
  "videoflow-manus": { app: "videoflow", task: "text" },
  "videoflow-bilde": { app: "videoflow", task: "image" },
  "videoflow-video": { app: "videoflow", task: "video" },
};

/** Hele listen, til /api/ai-core/prices. */
export function priceList() {
  const out = {};
  for (const key of Object.keys(SHOWN)) {
    const s = SHOWN[key];
    const p = priceFor(s.app, s.task);
    if (p) out[key] = { amount: p.amount, unit: p.unit, nok: p.nok, text: p.text };
  }
  return out;
}

// ===========================================================================
// PLANLAGT: den felles valutaen
// ===========================================================================
/**
 * Tallene under er BESLUTTET, men IKKE TATT I BRUK. De trer i kraft samtidig
 * som de fire valutaene slås sammen til én, ikke før. Ingenting i koden
 * leser dem ennå, de står her så beslutningen ikke går tapt.
 *
 * 1 LME-kreditt = 20 øre. Prisene er regnet som 3,3 ganger
 * leverandørkostnaden fra registry.js, som gir rundt 67 % margin etter
 * Stripe-gebyr.
 *
 * Video står til 150 og ikke 120, fordi 120 var regnet på Higgsfields
 * ÅRSPRIS. Renate kan ikke binde seg årlig før firmaet har inntekt, og på
 * månedlig betaling koster en video omtrent det dobbelte. 150 tåler hele
 * reisen: den virker allerede på Ultra månedlig, og blir bare bedre den
 * dagen årsavtalen er innen rekkevidde.
 */
export const PLANLAGT = {
  kredittVerdiNok: 0.20,
  paaslag: 3.3,
  handlinger: {
    tekst: 2,             // ett Claude-kall
    bilde: 14,
    stemmePer1000Tegn: 31,
    transkribering: 3,    // inntil tre minutter
    video: 150,
  },
  pakker: [
    { kreditter: 500, nok: 99 },
    { kreditter: 1500, nok: 279 },
    { kreditter: 4000, nok: 690 },
  ],
};
