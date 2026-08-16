/**
 * LME AI Core, hvem spør, og hva får de.
 *
 * Nathalie AI skal være tilgjengelig for alle, også folk uten konto, fordi
 * hun ligger på 51 sider og ofte er det første møtet noen har med LME. Men
 * "tilgjengelig for alle" kan ikke bety "gratis uten tak", så hvert nivå har
 * sin egen romslige grense.
 *
 * Fire nivåer:
 *
 *   eier       Renate. Ingen grense, i tråd med regelen om at eier aldri
 *              betaler for sitt eget produkt.
 *   kurs       Har kjøpt signaturkurset. Høy grense og en tilspisset
 *              Nathalie som er rettet mot å skape og selge, ikke bare
 *              Montessori.
 *   innlogget  Har konto. God grense.
 *   gjest      Ikke innlogget. Romslig nok til at ingen ekte leser merker
 *              den, lav nok til at et skript ikke tømmer budsjettet.
 *
 * ==========================================================================
 * SETT OPP SIGNATURKURSET FØR "kurs"-NIVÅET VIRKER
 * ==========================================================================
 * Miljøvariabelen SIGNATURE_COURSE_IDS er en kommaseparert liste med id-ene
 * til kurset (slik de lagres i purchases:<e-post>). Er den ikke satt, finnes
 * "kurs"-nivået rett og slett ikke, og kjøpere behandles som vanlige
 * innloggede brukere. Det er med vilje: da kan ingen bli feilaktig oppgradert
 * av en gjetning, og ingen blir stengt ute.
 *
 * Alle grensene kan justeres uten kodeendring:
 *   NATHALIE_LIMIT_GUEST   (standard 20 per døgn)
 *   NATHALIE_LIMIT_USER    (standard 60)
 *   NATHALIE_LIMIT_COURSE  (standard 200)
 */

import { sessionUser, isOwner } from "../access.js";
import { getPurchases } from "../purchases.js";

const DEFAULTS = { guest: 20, user: 60, course: 200 };

function num(v, fallback) {
  const n = parseInt(v, 10);
  return Number.isFinite(n) && n >= 0 ? n : fallback;
}

/** Id-ene til signaturkurset, fra oppsettet. Tom liste betyr "ikke satt opp". */
export function signatureCourseIds(env) {
  return String((env && env.SIGNATURE_COURSE_IDS) || "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

/** Har denne brukeren kjøpt signaturkurset. */
export async function hasSignatureCourse(env, email) {
  const ids = signatureCourseIds(env);
  if (!ids.length || !email) return false;
  try {
    const purchases = await getPurchases(env, email);
    return purchases.some((p) => {
      const id = String((p && p.id) || "").toLowerCase();
      return id && ids.indexOf(id) !== -1;
    });
  } catch (e) {
    return false;
  }
}

/**
 * Hvilket nivå denne forespørselen hører til, og hvor mange spørsmål nivået
 * gir per døgn.
 *
 * Returnerer { tier, email, limit, sharpened }.
 * limit = 0 betyr ingen grense.
 */
export async function nathalieTier(context) {
  const env = context.env;
  const limits = {
    guest: num(env && env.NATHALIE_LIMIT_GUEST, DEFAULTS.guest),
    user: num(env && env.NATHALIE_LIMIT_USER, DEFAULTS.user),
    course: num(env && env.NATHALIE_LIMIT_COURSE, DEFAULTS.course),
  };

  let user = null;
  try { user = await sessionUser(context); } catch (e) { user = null; }

  if (!user) {
    return { tier: "gjest", email: "", limit: limits.guest, sharpened: false };
  }
  if (isOwner(user)) {
    return { tier: "eier", email: user.email, limit: 0, sharpened: true };
  }
  if (await hasSignatureCourse(env, user.email)) {
    return { tier: "kurs", email: user.email, limit: limits.course, sharpened: true };
  }
  return { tier: "innlogget", email: user.email, limit: limits.user, sharpened: false };
}
