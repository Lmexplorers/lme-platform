/**
 * LME AI Core, "hva har jeg igjen" på tvers av appene.
 *
 *   GET /api/ai-core/balance -> alle saldoene til den innloggede brukeren
 *
 * Plattformen har i dag fire separate kostnadssystemer, og en bruker kan ha
 * saldo i ett og være tom i et annet uten at noe forklarer hvorfor. Dette
 * endepunktet er det første stedet hun ser hele bildet samlet.
 *
 * Ruten leser bare. Den trekker ingenting, endrer ingen saldo og gjør ingen
 * AI-kall. Se functions/_lib/ai-core/ledger.js.
 */

import { balanceFor, systemFor, describeSystem, APP_SYSTEM } from "../../_lib/ai-core/ledger.js";

function json(data, status) {
  return new Response(JSON.stringify(data), {
    status: status || 200,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

export async function onRequestGet(context) {
  const url = new URL(context.request.url);
  const lang = url.searchParams.get("lang") === "en" ? "en" : "no";

  const balance = await balanceFor(context);
  if (!balance.loggedIn) {
    return json({
      loggedIn: false,
      error: lang === "en"
        ? "Log in to see your balances."
        : "Logg inn for å se saldoene dine.",
    }, 401);
  }

  // Hvilket system hver app bruker, med en kort forklaring, slik at
  // grensesnittet kan si "denne appen bruker VideoFlow-kreditter" i stedet
  // for å bare vise et tall uten sammenheng.
  const apps = Object.keys(APP_SYSTEM).map((app) => {
    const system = systemFor(app);
    return { app: app, system: system, description: describeSystem(system, lang) };
  });

  return json({ ...balance, apps: apps });
}
