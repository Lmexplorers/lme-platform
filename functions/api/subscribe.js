/**
 * LME lead-innmelding — erstatter den tidligere MailerLite-proxyen
 * (functions/api/mailerlite/[[resource]].js, fjernet 12. august 2026 da
 * Renate ba om å rydde MailerLite helt ut av plattformen).
 *
 * Alt legges nå rett inn i plattformens egen abonnentliste (BUILDER_KV,
 * nl:<e-post>, samme lager som _lib/newsletter.js), og den ukentlige
 * evergreen-serien sendes videre via MailerSend av den eksisterende
 * ukentlige cronen (functions/api/cron/newsletter.js) — ingen ekstern
 * automasjon involvert.
 *
 *   POST /api/subscribe   { email, name, lang, group, tag }
 *
 * "group" er en lesbar kilde-streng (f.eks. "rolige-morgener"), IKKE lenger
 * en MailerLite-gruppe-ID. Satt av hver funnels funnel-config.js sitt
 * "newsletterSource"-felt. "tag" er valgfri ekstra kontekst (f.eks.
 * ro-quiz sitt resultat), lagres men styrer ikke selve serien.
 *
 * Kalles med mode:'no-cors' fra klienten (fire-and-forget) i de fleste
 * opt-in-skjemaene, så svaret leses aldri, bare best effort.
 */
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

  let email = "", name = "", lang = "", tag = "", group = "";
  try {
    const ct = request.headers.get("Content-Type") || "";
    if (ct.indexOf("application/json") !== -1) {
      const b = await request.json();
      email = (b.email || "") + ""; name = (b.name || "") + ""; lang = (b.lang || "") + ""; tag = (b.tag || "") + ""; group = (b.group || "") + "";
    } else {
      const form = new URLSearchParams(await request.text());
      email = form.get("email") || ""; name = form.get("name") || ""; lang = form.get("lang") || ""; tag = form.get("tag") || ""; group = form.get("group") || "";
    }
  } catch (e) {
    return json({ error: "bad_body" }, 400);
  }
  email = email.trim().toLowerCase();
  name = name.trim().slice(0, 100);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json({ error: "bad_email" }, 400);

  try {
    await registerNewsletter(env, email, name, lang, group.trim() || "funnel", tag.trim());
  } catch (e) {}

  return json({ ok: true }, 200);
}
