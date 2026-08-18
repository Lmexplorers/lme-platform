/**
 * LME VideoFlow, credit ledger.
 *
 * A single unified "VideoFlow credit" currency (unlike the platform's
 * existing image/video credit split in functions/_lib/access.js), matching
 * how the app is priced: $8/mo = 2000 credits, spent across script/image/
 * voice generation at the rates in functions/_lib/videoflow-providers.js
 * CREDIT_COSTS.
 *
 * Phase 1: balances are granted manually (grantCredits), there is no Stripe
 * subscription wired up yet, that's a deliberate separate step (real
 * billing, needs its own review) documented in docs/videoflow.md. Owner
 * (Renate) always has unlimited access regardless of balance, per the
 * platform-wide "owner never pays for their own product" rule, see
 * functions/_lib/access.js isOwner().
 *
 * KV key: vf-credit:<email> -> integer balance (no expiry).
 */

const PREFIX = "vf-credit:";

export async function getBalance(env, email) {
  if (!env || !env.BUILDER_KV || !email) return 0;
  try {
    const raw = await env.BUILDER_KV.get(PREFIX + email);
    const n = raw ? parseInt(raw, 10) : 0;
    return Number.isFinite(n) ? n : 0;
  } catch (e) { return 0; }
}

async function setBalance(env, email, n) {
  await env.BUILDER_KV.put(PREFIX + email, String(Math.max(0, Math.round(n))));
}

/** Admin/owner tool: add credits to an account (e.g. after a manual top-up or, later, a Stripe payment webhook). */
export async function grantCredits(env, email, amount) {
  const bal = await getBalance(env, email);
  const next = bal + Math.max(0, Math.round(amount));
  await setBalance(env, email, next);
  return next;
}

/**
 * Subscription credit refill (functions/api/oppskrift-webhook.js, on
 * checkout.session.completed AND every invoice.paid renewal for the
 * VideoFlow subscription). RESETS to `amount` rather than adding, since the
 * plan is "2000 credits a month", not a stacking top-up, unlike
 * grantCredits() above (used by the platform's other, additive credit
 * packs). Safe to call more than once for the same billing cycle (e.g. if
 * both checkout.session.completed and an immediate invoice.paid fire for
 * the same first payment): resetting to 2000 twice in a row is a no-op.
 */
export async function setMonthlyCredits(env, email, amount) {
  await setBalance(env, email, amount);
  return amount;
}

/** Debit credits if the balance covers it. Returns {ok, balance, needCredits?}. */
export async function debitCredits(env, email, amount) {
  const bal = await getBalance(env, email);
  const cost = Math.max(0, Math.round(amount));
  if (bal < cost) return { ok: false, balance: bal, needCredits: true, shortfall: cost - bal };
  const next = bal - cost;
  await setBalance(env, email, next);
  return { ok: true, balance: next };
}

/** Refund credits when a generation fails after being debited, mirrors refundVideoCredit in access.js. */
export async function refundCredits(env, email, amount) {
  return grantCredits(env, email, amount);
}
