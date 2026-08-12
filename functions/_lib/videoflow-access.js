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

/** Who is this, and what's their balance (no debit). */
export async function videoflowAccess(context) {
  const user = await sessionUser(context);
  if (!user) return { loggedIn: false, owner: false, email: "", balance: 0 };
  const balance = await getBalance(context.env, user.email);
  return { loggedIn: true, owner: isOwner(user), email: user.email, balance };
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
    return { ok: false, status: 402, needCredits: true, balance: result.balance, error: "Du har ikke nok VideoFlow-kreditter. Kjøp flere for å fortsette." };
  }
  return { ok: true, owner: false, email: user.email, balance: result.balance };
}

export async function refundVideoFlow(context, email, amount) {
  if (!email) return;
  await refundCredits(context.env, email, amount);
}
