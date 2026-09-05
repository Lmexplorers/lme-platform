/**
 * LME Strikk & Hekle: send den personlige lenken på nytt.
 *
 *   POST /api/strikk-lenke   { email, lang }  ->  { ok }
 *
 * Kjøperen har ingen konto. Mister hun e-posten med lenken, er dette veien
 * tilbake: hun skriver inn den samme adressen hun betalte med, og får en ny
 * lenke til den adressen. Lenken sendes ALDRI til en annen adresse enn den
 * som står i kjøpsloggen, så skjemaet kan ikke brukes til å skaffe seg
 * tilgang til noe man ikke har betalt for.
 *
 * Svaret sier ikke noe om hvorvidt adressen finnes hos oss ut over det
 * kunden trenger å vite, men et ærlig "jeg finner ikke et kjøp" er bedre
 * enn å la henne vente på en e-post som aldri kommer.
 */
import { getPurchases } from "../_lib/purchases.js";
import { grantCourseAccess } from "../_lib/course-access.js";
import { sendStrikkLenkePaaNytt } from "../_lib/strikk-mail.js";
import { STRIKK_ID } from "../_lib/strikk-kjop.js";
import { erEierEpost } from "../_lib/nedlasting-tilgang.js";

function json(data, status) {
  return new Response(JSON.stringify(data), {
    status: status || 200,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

export async function onRequestPost(context) {
  const { request, env } = context;
  if (!env.BUILDER_KV) return json({ ok: false, error: "not_configured" }, 503);

  let body = {};
  try { body = await request.json(); } catch (e) {}
  const email = String(body.email || "").trim().toLowerCase();
  const lang = body.lang === "en" ? "en" : "no";
  if (!email || email.indexOf("@") < 1) return json({ ok: false, error: "ugyldig_epost" }, 400);

  /* Eieren skal aldri stenges ute fra sitt eget, heller ikke her. */
  let harKjopt = erEierEpost(email);
  if (!harKjopt) {
    try {
      const kjop = await getPurchases(env, email);
      harKjopt = (kjop || []).some(function (k) { return k && k.id === STRIKK_ID; });
    } catch (e) {}
  }
  if (!harKjopt) return json({ ok: false, error: "ingen_kjop" });

  /* Ny nøkkel hver gang. De gamle blir stående og virker fortsatt, så en
     kunde som har lenken på en annen telefon ikke plutselig mister den. */
  const token = await grantCourseAccess(env, STRIKK_ID, email, "");
  const res = await sendStrikkLenkePaaNytt(env, { to: email, name: "", lang: lang, token: token });
  return json({ ok: !!(res && res.ok) });
}
