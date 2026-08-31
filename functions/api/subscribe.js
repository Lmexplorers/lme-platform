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
import { leggTil as leggTilMedlemsliste } from "../_lib/medlem-liste.js";

function json(data, status) {
  return new Response(JSON.stringify(data), {
    status: status || 200,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

export async function onRequestPost(context) {
  const { request, env } = context;
  if (!env.BUILDER_KV) return json({ error: "not_configured" }, 200);

  let email = "", name = "", lang = "", tag = "", group = "", body_eier = "";
  try {
    const ct = request.headers.get("Content-Type") || "";
    if (ct.indexOf("application/json") !== -1) {
      const b = await request.json();
      email = (b.email || "") + ""; name = (b.name || "") + ""; lang = (b.lang || "") + ""; tag = (b.tag || "") + ""; group = (b.group || "") + "";
      body_eier = (b.eier || "") + "";
    } else {
      const form = new URLSearchParams(await request.text());
      email = form.get("email") || ""; name = form.get("name") || ""; lang = form.get("lang") || ""; tag = form.get("tag") || ""; group = form.get("group") || "";
      body_eier = form.get("eier") || "";
    }
  } catch (e) {
    return json({ error: "bad_body" }, 400);
  }
  email = email.trim().toLowerCase();
  name = name.trim().slice(0, 100);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json({ error: "bad_email" }, 400);

  /* "eier" betyr at skjemaet står på et medlems egen side. Da havner adressen
     på DERES liste, ikke på Renates. Uten eier går den til Renates liste, som
     før, siden det da er hennes egne funnels som spør. */
  let eier = "";
  try {
    const u = new URL(request.url);
    eier = ((u.searchParams.get("eier") || "") + "").trim().toLowerCase();
  } catch (e) {}
  if (!eier && typeof body_eier === "string") eier = body_eier.trim().toLowerCase();

  if (eier) {
    try {
      await leggTilMedlemsliste(env, eier, {
        epost: email, navn: name, kilde: group.trim() || "skjema", sprak: lang,
      });
    } catch (e) {}
    return json({ ok: true, til: "medlem" }, 200);
  }

  try {
    await registerNewsletter(env, email, name, lang, group.trim() || "funnel", tag.trim());
  } catch (e) {}

  return json({ ok: true }, 200);
}
