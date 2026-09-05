/**
 * LME Strikk & Hekle: leveringen etter et kjøp.
 *
 * Kort og Vipps skal gi kunden nøyaktig det samme (CLAUDE.md), og derfor
 * finnes leveringen bare ett sted. Både stripe-webhooken og vipps-leveringen
 * kaller denne.
 *
 * Rekkefølgen er valgt med vilje:
 *   1. Tilgang først. Den er det hun har betalt for, og den skal aldri
 *      falle bort fordi en e-post ikke gikk gjennom.
 *   2. Kvitteringen med hennes personlige lenke.
 *   3. Oppfølgingsserien i kø.
 *   4. Kjøpsloggen og varselet til Renate, som begge er hyggelige å ha,
 *      men aldri får lov til å stoppe en leveranse.
 */
import { grantCourseAccess } from "./course-access.js";
import { sendStrikkKjopMail } from "./strikk-mail.js";
import { koOppfolging } from "./strikk-followup-mail.js";
import { recordPurchase } from "./purchases.js";
import { sendOwnerSaleNotice } from "./oppskrift-mail.js";
import { STRIKK_ID, STRIKK_KJOP } from "./strikk-kjop.js";

/**
 * @returns { ok, token } der token er den personlige lenkenøkkelen.
 */
export async function leverStrikk(env, { email, name, lang, betaltMed, amount, currency }) {
  const e = String(email || "").trim().toLowerCase();
  if (!env || !env.BUILDER_KV || !e) return { ok: false, grunn: "mangler_epost" };
  const spraak = lang === "en" ? "en" : "no";

  /* 1. Tilgangen. Uten catch: feiler denne, har hun betalt uten å få varen,
     og da skal Stripe se en feil og prøve igjen. */
  const token = await grantCourseAccess(env, STRIKK_ID, e, name || "");

  /* 2. Kvitteringen med lenken hennes. */
  try {
    await sendStrikkKjopMail(env, { to: e, name: name || "", lang: spraak, token: token, betaltMed: betaltMed || "kort" });
  } catch (e1) {}

  /* 3. Oppfølgingsserien. */
  try {
    await koOppfolging(env, { email: e, name: name || "", lang: spraak });
  } catch (e2) {}

  /* 4. Kjøpsloggen på Min side. */
  try {
    await recordPurchase(env, e, {
      type: "app",
      id: STRIKK_ID,
      title: STRIKK_KJOP.navn[spraak] || STRIKK_KJOP.navn.no,
      amount: typeof amount === "number" ? amount : null,
      currency: currency || "nok",
      url: "https://lmexplorers.com/strikk?t=" + encodeURIComponent(token),
    });
  } catch (e3) {}

  /* 5. Varselet til Renate. */
  try {
    await sendOwnerSaleNotice(env, {
      pname: STRIKK_KJOP.navn.no,
      lang: spraak,
      name: name || "",
      email: e,
      amount: typeof amount === "number" ? amount : STRIKK_KJOP.nok * 100,
      currency: currency || "nok",
      action: {
        title: "Ingenting å gjøre",
        body: "Hun har kjøpt Strikk og Hekle som engangskjøp. Tilgangen er åpnet, " +
              "den personlige lenken er sendt, og oppfølgingsserien er lagt i kø. " +
              "Appen bruker verken AI-kvote eller lagring, så kjøpet koster deg " +
              "ingenting videre.",
        url: "https://lmexplorers.com/strikk-app",
      },
    });
  } catch (e4) {}

  return { ok: true, token: token };
}
