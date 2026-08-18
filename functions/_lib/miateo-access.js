/**
 * Mia & Teo Video Creator, access control.
 *
 * This is a production tool Renate uses to build the actual Mia & Teo Lek &
 * Lær content library, not a customer-facing paid app, so it follows the
 * owner-only pattern (not the credit-purchase pattern of Video Studio /
 * AI Headshot): every route requires the logged-in session user to be the
 * owner (functions/_lib/access.js isOwner). No one else can reach it, so
 * there is no separate credit system to build or maintain here.
 */
import { sessionUser, isOwner } from "./access.js";

export async function requireOwner(context) {
  const user = await sessionUser(context);
  if (!user) return { ok: false, status: 401, error: "Logg inn som eier for å bruke Mia & Teo Video Creator." };
  if (!isOwner(user)) return { ok: false, status: 403, error: "Mia & Teo Video Creator er kun for eieren." };
  return { ok: true, user };
}
