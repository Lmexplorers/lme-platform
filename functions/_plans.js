/**
 * LME planer og tilgangsnivaaer — EN kilde til sannhet.
 *
 * Brukes baade av server-koden (middleware, Stripe-webhook, gruppe-API) for aa
 * avgjoere hvem som slipper inn hvor. Prisene er satt i LME innholdsstudio og
 * speiles paa /oppgrader. Endrer du priser der, oppdater PLAN_AMOUNTS under.
 *
 * Tre planer (rang bestemmer tilgang, hoeyere = mer):
 *   1  start             299 kr / 29 $  pr. md
 *   2  proff             499 kr / 49 $  pr. md
 *   3  proff-community   699 kr / 69 $  pr. md   (inkluderer Inner Circle)
 *
 * Eldre medlemskap fra foer nivaadelingen har plan "inner-circle" -> rang 3,
 * saa de beholder full tilgang.
 */

export const PLAN_RANK = {
  start: 1,
  proff: 2,
  "proff-community": 3,
  "inner-circle": 3, // eldre/Inner Circle-medlemskap = full fellesskapstilgang
};

// Penere navn til visning (Min konto m.m.)
export const PLAN_LABEL = {
  start: "Start",
  proff: "Proff",
  "proff-community": "Proff + Fellesskap",
  "inner-circle": "Proff + Fellesskap",
};

/**
 * Beloep (i minste valutaenhet: oere/cent) -> plan. Stripe sender amount_total
 * slik. Dekker NOK + USD, baade maanedlig og aarlig. Hold i synk med /oppgrader.
 */
export const PLAN_AMOUNTS = {
  // start: 299 kr / 29 $ (md), 2990 kr / 290 $ (aar)
  29900: "start", 2900: "start", 299000: "start", 29000: "start",
  // proff: 499 kr / 49 $ (md), 4990 kr / 490 $ (aar)
  49900: "proff", 4900: "proff", 499000: "proff", 49000: "proff",
  // proff + fellesskap: 699 kr / 69 $ (md), 6990 kr / 690 $ (aar)
  69900: "proff-community", 6900: "proff-community",
  699000: "proff-community", 69000: "proff-community",
};

/** Finn plan ut fra betalt beloep. Ukjent beloep -> "start" (laveste betalte),
 *  saa en betalende kunde aldri blir helt utestengt. */
export function planFromAmount(amountTotal) {
  if (amountTotal == null) return "start";
  return PLAN_AMOUNTS[amountTotal] || "start";
}

export function planRank(plan) {
  return PLAN_RANK[(plan || "").toLowerCase()] || 0;
}

/**
 * Tilgangskrav pr. side (lengste prefiks vinner). Verdi:
 *   tall   = minste plan-rang som kreves (1=Start, 2=Proff, 3=Proff+Fellesskap)
 *   "auth" = bare innlogging kreves (plan valgfri) — f.eks. Min konto
 * Alt som IKKE staar her er offentlig (markedsforing, butikk, blogg, /oppgrader,
 * /login osv.). Legg til flere linjer for aa gate flere sider.
 */
export const PAGE_RULES = {
  // Fellesskap / Inner Circle — kun Proff + Fellesskap
  "/community": 3,
  "/grupper": 3,
  "/medlemmer": 3,
  "/medlem": 3,
  "/live": 3,
  "/replays": 3,
  "/wins": 3,
  "/perks": 3,
  "/partnere": 3,
  "/meldinger": 3,
  "/favoritter": 3,
  "/ressurser": 3,
  "/biblioteket": 3,
  // Hele LME Creative Academy med verktoeysuiten — Proff + Fellesskap
  "/creative-academy": 3,
  "/creator-academy": 3,
  "/analytics": 3,
  "/automations": 3,
  "/email": 3,
  "/forms": 3,
  "/pipeline": 3,
  "/subscribers": 3,
  "/surveys": 3,
  "/quizzes": 3,
  "/webinars": 3,
  "/websites": 3,
  "/domener": 3,
  "/payments": 3,
  "/produkter": 3,
  "/business-profile": 3,
  "/courses": 3,
  "/utforsk": 3,
  // Avanserte skaperverktoey / apper — Proff og oppover
  "/lme-builder": 2,
  "/ai-traffic-engine": 2,
  "/bookly": 2,
  "/ai-visibility": 2,
  "/maler": 2,
  // Kjerne-app / kurs — alle betalte planer (Start og oppover)
  "/dashboard": 1,
  "/ask-renate-ai": 1,
  "/spor-renate-ai": 1,
  "/academy": 1,
  // Bare innlogging (ogsaa uten betalt plan)
  "/min-konto": "auth",
  "/onboarding": "auth",
};

/** Normaliser sti: dropp .html og etterstilt skraastrek. */
export function normalizePath(pathname) {
  let p = (pathname || "/").toLowerCase();
  p = p.replace(/\.html$/, "");
  if (p.length > 1) p = p.replace(/\/+$/, "");
  return p || "/";
}

/** Finn tilgangskrav for en sti. Returnerer tall, "auth" eller null (offentlig). */
export function ruleForPath(pathname) {
  const p = normalizePath(pathname);
  let best = null, bestLen = -1;
  for (const prefix in PAGE_RULES) {
    if (p === prefix || p.startsWith(prefix + "/")) {
      if (prefix.length > bestLen) { best = PAGE_RULES[prefix]; bestLen = prefix.length; }
    }
  }
  return best;
}

/** Er statusen aktiv (aktiv/trialing/aktivt medlemskap)? */
export function isActiveStatus(s) {
  if (!s || !s.status) return false;
  if (/cancel|inactive|expired|none|past_due|unpaid/i.test(s.status)) return false;
  return true;
}

/**
 * Brukerens hoeyeste tilgangsrang. Eier = 99. Ellers stoerste rang blant
 * aktivt abonnement paa kontoen og aktivt medlemskap (member:-record).
 */
export function userRank(user, membership, isOwner) {
  if (isOwner) return 99;
  let r = 0;
  if (user && isActiveStatus(user.subscription)) r = Math.max(r, planRank(user.subscription.plan));
  if (isActiveStatus(membership)) r = Math.max(r, planRank(membership.plan));
  return r;
}
