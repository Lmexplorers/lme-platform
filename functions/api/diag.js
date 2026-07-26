/**
 * LME helsesjekk (kun for eier) — Cloudflare Pages Function.
 *
 *   GET /api/diag
 *
 * Forteller, uten å avsløre noen hemmelige verdier, hvilke nøkler som er satt
 * på Pages-prosjektet, og om et lite live-testkall til hver tjeneste faktisk
 * kommer fram. Brukes til å finne ut hvorfor AI-generering og publisering
 * feiler (f.eks. manglende nøkkel, ugyldig nøkkel, eller at utgående kall
 * henger). Hvert testkall har en kort, hard tidsgrense, så sjekken feiler rent
 * i stedet for å henge til Cloudflare gir opp.
 */

import { sessionUser } from "../_lib/access.js";

// Samme eier-logikk som functions/_lib/access.js: rolle ELLER eier-e-post.
const OWNER_EMAILS = ["renateshobby@hotmail.com", "renate@lmexplorers.com"];
const isOwner = (u) => !!(u && (u.role === "owner" || u.role === "admin" ||
  OWNER_EMAILS.indexOf(String(u.email || "").toLowerCase()) !== -1));

function json(data, status) {
  return new Response(JSON.stringify(data, null, 2), {
    status: status || 200,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

// Utgående kall med kort, hard tidsgrense. Returnerer aldri hemmeligheter,
// bare status, ventetid og et lite tekstutdrag av svaret.
async function probe(url, opts, ms) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), ms);
  const t0 = Date.now();
  try {
    const r = await fetch(url, { ...opts, signal: ctrl.signal });
    const body = await r.text();
    return { ok: r.ok, status: r.status, ms: Date.now() - t0, body: body.replace(/\s+/g, " ").trim().slice(0, 200) };
  } catch (e) {
    return { ok: false, status: 0, ms: Date.now() - t0, error: (e && e.name === "AbortError") ? ("tidsavbrudd etter " + ms + " ms") : (e && e.message) || "nettverksfeil" };
  } finally {
    clearTimeout(timer);
  }
}

export async function onRequestGet(context) {
  const { env } = context;
  const user = await sessionUser(context);
  if (!isOwner(user)) {
    // Vis hva økten faktisk ble gjenkjent som (din egen innloggingsinfo), så
    // vi ser hvorfor eier-sjekken ikke traff.
    return json({
      error: "Ikke gjenkjent som eier.",
      loggedIn: !!user,
      seenEmail: user ? (user.email || null) : null,
      seenRole: user ? (user.role || null) : null,
    }, 403);
  }

  const KEYS = ["ANTHROPIC_API_KEY", "OPENAI_API_KEY", "GEMINI_API_KEY", "BLOTATO_API_KEY", "HIGGSFIELD_API_KEY", "HIGGSFIELD_SECRET", "ELEVENLABS_API_KEY", "MAILERLITE_API_KEY", "STABILITY_API_KEY"];
  const present = {};
  KEYS.forEach((k) => { present[k] = !!(env[k] && String(env[k]).trim()); });

  const TIMEOUT = 8000;
  const tests = {};

  if (present.ANTHROPIC_API_KEY) {
    tests.anthropic = await probe("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": env.ANTHROPIC_API_KEY, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({ model: "claude-sonnet-5", max_tokens: 8, messages: [{ role: "user", content: "si hei" }] }),
    }, TIMEOUT);
  }

  if (present.BLOTATO_API_KEY) {
    tests.blotato = await probe("https://backend.blotato.com/v2/users/me/accounts", {
      method: "GET",
      headers: { "blotato-api-key": env.BLOTATO_API_KEY, "Accept": "application/json" },
    }, TIMEOUT);
  }

  // Higgsfield (video). Sender en tom payload bare for å teste innloggingen:
  // 401 = nøkkel/hemmelighet avvist, 4xx ellers = innlogging OK men payload
  // mangler (da er det ikke nøkkelen som er problemet). Lager ingen video.
  if (present.HIGGSFIELD_API_KEY && present.HIGGSFIELD_SECRET) {
    tests.higgsfield = await probe("https://platform.higgsfield.ai/v1/image2video/dop", {
      method: "POST",
      headers: { "Authorization": "Key " + env.HIGGSFIELD_API_KEY + ":" + env.HIGGSFIELD_SECRET, "Content-Type": "application/json", "Accept": "application/json" },
      body: "{}",
    }, TIMEOUT);
  }

  return json({ ok: true, owner: user.email, present, tests });
}
