/**
 * Mia & Teo, gratisheftet "Mitt første følelsesverktøy" — lead magnet-endepunkt.
 *
 * POST /api/mia-teo-optin  { email, name, lang }
 *
 * Gjør to ting ved opt-in fra funnel/mia-teo-folelser-gratis/opt-in.html:
 *   1. Melder leaden inn i MailerLite (gruppe "Mia & Teo følelser, gratishefte",
 *      id 195347929448318941), for liste/CRM-oversikt hos Renate.
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

const ML = "https://connect.mailerlite.com/api";
const GROUP_ID = "195347929448318941";

function json(data, status) {
  return new Response(JSON.stringify(data), {
    status: status || 200,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

async function subscribeMailerLite(env, email, name, lang) {
  const key = env.MAILERLITE_API_KEY;
  if (!key) return;
  const payload = { email: email, groups: [GROUP_ID], fields: {} };
  if (name) payload.fields.name = name.slice(0, 100);
  if (lang) payload.fields.language = lang === "en" ? "en" : "no";
  try {
    await fetch(ML + "/subscribers", {
      method: "POST",
      headers: { Authorization: "Bearer " + key, "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(payload),
    });
  } catch (e) {}
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

  await subscribeMailerLite(env, email, name, lang);

  const now = Date.now();
  const job = { email: email, name: name, lang: lang, step: 0, sendAfter: now + STEP_DELAYS_MS[0] };
  try {
    await env.BUILDER_KV.put(KEY_PREFIX + email, JSON.stringify(job));
  } catch (e) {}

  return json({ ok: true });
}
