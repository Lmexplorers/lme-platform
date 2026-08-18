/**
 * LME VideoFlow, access control.
 *
 * Owner-free, everyone else pays with credits, same shape as the platform's
 * existing paid-app pattern (functions/_lib/access.js enforceVideoApp) but
 * using VideoFlow's own unified credit currency instead of the image/video
 * credit split. No subscription tier gate here (unlike Video Studio's
 * Pro/VIP requirement): any logged-in user with a credit balance can use
 * VideoFlow, since credits themselves are what's sold ($8/mo plan).
 */
import { sessionUser, isOwner } from "./access.js";
import { getBalance, debitCredits, refundCredits } from "./videoflow-credits.js";
import { getVideoFlowSub } from "./purchase-links.js";

/** Who is this, and what's their balance (no debit). */
export async function videoflowAccess(context) {
  const user = await sessionUser(context);
  if (!user) return { loggedIn: false, owner: false, email: "", balance: 0, subscription: null };
  const balance = await getBalance(context.env, user.email);
  const subscription = context.env && context.env.BUILDER_KV ? await getVideoFlowSub(context.env, user.email) : null;
  return { loggedIn: true, owner: isOwner(user), email: user.email, balance, subscription };
}

/**
 * Queues the day-3/7/14 "you're out of credits" reminder chain the first
 * time a generation is blocked for lack of credits (not every time, see the
 * d3-key existence check: as long as that job is still pending, another
 * failed generation attempt in the same empty period is not a new event).
 * Sent by functions/api/cron/videoflow-followups.js, which re-checks the
 * balance right before sending and silently drops the job if the person
 * already resubscribed/topped up, so a stale queue entry is harmless.
 */
async function queueEmptyCreditsReminder(env, email) {
  if (!env || !env.BUILDER_KV || !email) return;
  const e = email.trim().toLowerCase();
  const already = await env.BUILDER_KV.get("vf_fu:" + e + ":d3");
  if (already) return;
  const now = Date.now();
  const DAY = 24 * 60 * 60 * 1000;
  try {
    await env.BUILDER_KV.put("vf_fu:" + e + ":d3", JSON.stringify({ email, day: 3, sendAfter: now + 3 * DAY }));
    await env.BUILDER_KV.put("vf_fu:" + e + ":d7", JSON.stringify({ email, day: 7, sendAfter: now + 7 * DAY }));
    await env.BUILDER_KV.put("vf_fu:" + e + ":d14", JSON.stringify({ email, day: 14, sendAfter: now + 14 * DAY }));
  } catch (e2) { /* best effort, never blocks the actual error response */ }
}

/** Check login AND debit `amount` credits (owner bypasses, no debit). */
export async function enforceVideoFlow(context, amount) {
  const { env } = context;
  if (!env || !env.BUILDER_KV) return { ok: true, owner: true, email: "" };
  const user = await sessionUser(context);
  if (!user) return { ok: false, status: 401, error: "Logg inn for å bruke VideoFlow." };
  if (isOwner(user)) return { ok: true, owner: true, email: user.email };
  const result = await debitCredits(env, user.email, amount);
  if (!result.ok) {
    await queueEmptyCreditsReminder(env, user.email);
    return { ok: false, status: 402, needCredits: true, balance: result.balance, error: "Du har ikke nok VideoFlow-kreditter. Kjøp flere for å fortsette." };
  }
  return { ok: true, owner: false, email: user.email, balance: result.balance };
}

export async function refundVideoFlow(context, email, amount) {
  if (!email) return;
  await refundCredits(context.env, email, amount);
}
