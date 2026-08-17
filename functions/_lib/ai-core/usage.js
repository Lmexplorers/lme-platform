/**
 * LME AI Core, felles forbrukslogg.
 *
 * Hvert AI-kall på plattformen skriver én linje her: hvilken app, hvilken
 * bruker, hvilken leverandør og modell, hva slags innhold, hvor mange
 * enheter, beregnet kostnad, hvor lang tid det tok, og om det gikk bra.
 * Det er dette som gjør /ai-kostnader mulig.
 *
 * ==========================================================================
 * TO REGLER SOM ALDRI BRYTES
 * ==========================================================================
 * 1. Loggingen kan ALDRI velte en generering. Alt her er pakket i try/catch,
 *    og logUsage() returnerer alltid uten å kaste. En bruker skal aldri miste
 *    et bilde fordi en KV-skriving feilet.
 * 2. Loggingen skjer ETTER at resultatet er sikret. Kall logUsage() når du
 *    allerede har svaret i hånda, aldri før.
 *
 * ==========================================================================
 * HVORFOR SAMMENDRAGET LIGGER I NØKKEL-METADATA
 * ==========================================================================
 * Cloudflare KV `list()` returnerer nøkkelnavn OG metadata (inntil 1024 byte
 * per nøkkel) i ett kall. Ved å legge hele sammendraget i metadata kan
 * administrasjonssiden lese tusen kall med ett oppslag, i stedet for tusen
 * separate get()-kall. Selve verdien inneholder det fulle detaljobjektet, og
 * hentes bare når noen klikker seg inn på en enkelt linje.
 *
 * KV-nøkkel: ai:usage:<år-måned>:<tidsstempel>-<tilfeldig> , 400 dagers levetid.
 */

import { costFor, findModel } from "./registry.js";

const PREFIX = "ai:usage:";
const TTL = 60 * 60 * 24 * 400; // 400 dager

function monthKey(d) {
  const dt = d || new Date();
  return dt.getUTCFullYear() + "-" + String(dt.getUTCMonth() + 1).padStart(2, "0");
}

function shortId() {
  return Math.random().toString(36).slice(2, 10);
}

/** Kutter en streng trygt, så metadata aldri sprenger 1024-bytegrensen. */
function cut(s, n) {
  const v = String(s == null ? "" : s);
  return v.length > n ? v.slice(0, n) : v;
}

/**
 * Logg ett AI-kall. Kaster aldri.
 *
 *   await logUsage(env, {
 *     app: "videoflow",           // hvilken LME-app
 *     task: "text",               // text | image | voice | video | transcribe | render | publish
 *     modelId: "claude-sonnet-5", // id fra registry.js
 *     email: user.email,          // hvem som brukte det ("" for anonymt)
 *     units: { inputTokens: 1200, outputTokens: 800 },
 *     status: "ok",               // "ok" | "error"
 *     ms: 2400,                   // hvor lang tid kallet tok
 *     error: "",                  // kort feilkode når status er "error"
 *     note: "",                   // valgfritt, f.eks. hvilken scene
 *   });
 */
export async function logUsage(env, entry) {
  try {
    if (!env || !env.BUILDER_KV || !entry) return;

    const now = new Date();
    const modelId = entry.modelId || "";
    const model = findModel(modelId);
    const units = entry.units || {};
    const cost = entry.status === "error" ? 0 : costFor(modelId, units);

    const meta = {
      a: cut(entry.app, 32),
      t: cut(entry.task, 16),
      p: model ? model.provider : "ukjent",
      m: cut(modelId, 48),
      u: cut(entry.email, 64),
      c: cost == null ? null : cost,
      s: entry.status === "error" ? "error" : "ok",
      d: Math.max(0, Math.round(Number(entry.ms) || 0)),
      ts: now.toISOString(),
    };

    const full = {
      ...meta,
      units: units,
      error: cut(entry.error, 200),
      note: cut(entry.note, 200),
      unknownModel: !model,
    };

    const key = PREFIX + monthKey(now) + ":" + now.getTime() + "-" + shortId();
    await env.BUILDER_KV.put(key, JSON.stringify(full), {
      expirationTtl: TTL,
      metadata: meta,
    });
  } catch (e) {
    // Med vilje stille. En mislykket logg skal aldri gi feil til brukeren.
  }
}

/**
 * Praktisk innpakning: måler tiden, kjører kallet, logger både suksess og
 * feil, og sender feilen videre uendret. Ruter som allerede har egen
 * feilhåndtering kan bruke logUsage() direkte i stedet.
 *
 *   const svar = await trackUsage(env, { app, task, modelId, email }, async () => {
 *     const r = await ekteKall();
 *     return { result: r, units: { inputTokens: r.usage.input_tokens } };
 *   });
 */
export async function trackUsage(env, entry, fn) {
  const t0 = Date.now();
  try {
    const out = await fn();
    const wrapped = out && Object.prototype.hasOwnProperty.call(out, "result");
    await logUsage(env, {
      ...entry,
      units: (wrapped ? out.units : null) || entry.units,
      status: "ok",
      ms: Date.now() - t0,
    });
    return wrapped ? out.result : out;
  } catch (err) {
    await logUsage(env, {
      ...entry,
      status: "error",
      ms: Date.now() - t0,
      error: (err && err.message) || String(err),
    });
    throw err;
  }
}

/**
 * Trekker ut tokenbruk fra et Anthropic-svar. Tåler at feltet mangler.
 *
 * Med promptcache teller Anthropic de bufrede tokenene for seg:
 * input_tokens er da BARE de ferske tokenene, mens de bufrede ligger i
 * cache_read_input_tokens (billige) og cache_creation_input_tokens (litt
 * dyrere enn vanlig inndata). Tar vi ikke med de to, ser regnestykket på
 * /ai-kostnader billigere ut enn virkeligheten.
 */
export function anthropicUnits(data) {
  const u = (data && data.usage) || {};
  return {
    inputTokens: Number(u.input_tokens) || 0,
    outputTokens: Number(u.output_tokens) || 0,
    cacheReadTokens: Number(u.cache_read_input_tokens) || 0,
    cacheWriteTokens: Number(u.cache_creation_input_tokens) || 0,
  };
}

/** Trekker ut tokenbruk fra et OpenAI-svar (chat completions). */
export function openaiUnits(data) {
  const u = (data && data.usage) || {};
  return {
    inputTokens: Number(u.prompt_tokens) || 0,
    outputTokens: Number(u.completion_tokens) || 0,
  };
}

/**
 * Leser forbruket for én måned, til administrasjonssiden.
 * Leser bare nøkkel-metadata, altså ett KV-kall per tusen linjer.
 *
 * Returnerer { rows, truncated } der rows er sammendragene, nyeste sist.
 */
export async function readMonth(env, ym, maxRows) {
  const out = { rows: [], truncated: false };
  if (!env || !env.BUILDER_KV) return out;
  const limit = Math.max(1, Math.min(20000, maxRows || 5000));
  try {
    let cursor;
    for (;;) {
      const page = await env.BUILDER_KV.list({
        prefix: PREFIX + ym + ":",
        limit: 1000,
        cursor: cursor,
      });
      for (const k of page.keys) {
        if (k.metadata) out.rows.push(k.metadata);
      }
      if (out.rows.length >= limit) { out.truncated = !page.list_complete; break; }
      if (page.list_complete) break;
      cursor = page.cursor;
      if (!cursor) break;
    }
  } catch (e) {
    // Ved feil returneres det vi rakk å lese, heller enn å velte siden.
  }
  return out;
}

/**
 * Summerer rader til totaler per app, bruker, leverandør, modell og
 * innholdstype. Ren regning, ingen nettverkskall.
 */
export function summarize(rows) {
  const sum = {
    calls: 0,
    errors: 0,
    costUsd: 0,
    unknownCost: 0,
    byApp: {},
    byUser: {},
    byProvider: {},
    byModel: {},
    byTask: {},
  };
  const bump = (bucket, key, cost, isError) => {
    const k = key || "(ukjent)";
    if (!bucket[k]) bucket[k] = { calls: 0, errors: 0, costUsd: 0 };
    bucket[k].calls += 1;
    if (isError) bucket[k].errors += 1;
    if (typeof cost === "number") bucket[k].costUsd += cost;
  };
  for (const r of rows || []) {
    const isError = r.s === "error";
    const cost = typeof r.c === "number" ? r.c : null;
    sum.calls += 1;
    if (isError) sum.errors += 1;
    if (cost == null) sum.unknownCost += 1; else sum.costUsd += cost;
    bump(sum.byApp, r.a, cost, isError);
    bump(sum.byUser, r.u, cost, isError);
    bump(sum.byProvider, r.p, cost, isError);
    bump(sum.byModel, r.m, cost, isError);
    bump(sum.byTask, r.t, cost, isError);
  }
  sum.costUsd = Math.round(sum.costUsd * 1e4) / 1e4;
  for (const bucket of [sum.byApp, sum.byUser, sum.byProvider, sum.byModel, sum.byTask]) {
    for (const k of Object.keys(bucket)) {
      bucket[k].costUsd = Math.round(bucket[k].costUsd * 1e4) / 1e4;
    }
  }
  return sum;
}
