/**
 * Mia & Teo, gratisheftet "Mitt første følelsesverktøy" — lead magnet-endepunkt.
 *
 * POST /api/mia-teo-optin  { email, name, lang }
 *
 * Gjør to ting ved opt-in fra funnel/mia-teo-folelser-gratis/opt-in.html:
 *   1. Registrerer leaden i plattformens egen abonnentliste (BUILDER_KV,
 *      nl:<e-post> via _lib/newsletter.js sin registerNewsletter, kilde
 *      "mia-teo-folelser-gratis"), for liste-/oversikt hos Renate. Fram til
 *      12. august 2026 gikk dette til en MailerLite-gruppe i stedet, fjernet
 *      da Renate ba om å rydde MailerLite helt ut av plattformen.
 *   2. Starter den 5-stegs automatiske e-postserien via MailerSend (se
 *      _lib/mia-teo-mail.js), IKKE en MailerLite-automasjon (CLAUDE.md:
 *      "Automatiserte e-postserier — bruk MailerSend, ikke MailerLite-
 *      automasjoner"). Jobben lagres i BUILDER_KV (mia_teo_fu:<e-post>) og
 *      beveger seg gjennom stegene via den daglige cronen
 *      (api/cron/mia-teo-followups.js), som sender neste steg og skyver
 *      "sendAfter" fremover til jobben er ferdig etter siste steg.
 *
 * Kalles med mode:'no-cors' fra klienten (fire-and-forget), så svaret leses
 * aldri av nettleseren, bare best effort, aldri blokkerende for brukeren.
 */
import { KEY_PREFIX, STEP_DELAYS_MS } from "../_lib/mia-teo-mail.js";
import { registerNewsletter } from "../_lib/newsletter.js";

function json(data, status) {
  return new Response(JSON.stringify(data), {
    status: status || 200,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

export async function onRequestPost(context) {
  const { request, env } = context;
  if (!env.BUILDER_KV) return json({ error: "not_configured" }, 200);

  let email = "", name = "", lang = "";
  try {
    const ct = request.headers.get("Content-Type") || "";
    if (ct.indexOf("application/json") !== -1) {
      const b = await request.json();
      email = (b.email || "") + ""; name = (b.name || "") + ""; lang = (b.lang || "") + "";
    } else {
      const form = new URLSearchParams(await request.text());
      email = form.get("email") || ""; name = form.get("name") || ""; lang = form.get("lang") || "";
    }
  } catch (e) {
    return json({ error: "bad_body" }, 400);
  }
  email = email.trim().toLowerCase();
  name = name.trim().slice(0, 100);
  lang = lang === "en" ? "en" : "no";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json({ error: "bad_email" }, 400);

  try { await registerNewsletter(env, email, name, lang, "mia-teo-folelser-gratis"); } catch (e) {}

  const now = Date.now();
  const job = { email: email, name: name, lang: lang, step: 0, sendAfter: now + STEP_DELAYS_MS[0] };
  try {
    await env.BUILDER_KV.put(KEY_PREFIX + email, JSON.stringify(job));
  } catch (e) {}

  return json({ ok: true });
}
