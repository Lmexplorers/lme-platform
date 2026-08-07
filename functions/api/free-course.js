/**
 * Gratis kurs mot e-postbekreftelse (dobbel opt-in).
 *
 *   POST /api/free-course              { email, name, lang } -> send bekreftelseslenke
 *   GET  /api/free-course?confirm=tok  -> bekreft, send kurslenken, gå rett til kurset
 *
 * Lagrer en midlertidig token i KV (freecourse:pending:<token>), utløper
 * etter 7 dager om den aldri bekreftes. Brukes av /gratis-youtube-kurs.
 */
import { sendConfirmMail, sendDeliverMail, COURSE_URL } from "../_lib/free-course.js";
import { enqueueYoutubeFollowups } from "../_lib/youtube-course-mail.js";
import { sendOwnerSignupNotice } from "../_lib/oppskrift-mail.js";

const TOKEN_TTL = 60 * 60 * 24 * 7; // 7 dager

function json(data, status) {
  return new Response(JSON.stringify(data), {
    status: status || 200,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

export async function onRequestPost(context) {
  const { request, env } = context;
  if (!env.BUILDER_KV) return json({ error: "not_configured" }, 503);

  let body;
  try { body = await request.json(); } catch (e) { return json({ error: "bad_body" }, 400); }
  const email = ((body && body.email) || "").trim();
  const name = ((body && body.name) || "").trim().slice(0, 100);
  const lang = (body && body.lang) === "en" ? "en" : "no";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json({ error: "bad_email" }, 400);

  const token = crypto.randomUUID();
  await env.BUILDER_KV.put("freecourse:pending:" + token, JSON.stringify({ email, name, lang, ts: Date.now() }), { expirationTtl: TOKEN_TTL });

  const confirmUrl = new URL(request.url);
  confirmUrl.search = "?confirm=" + token;
  const mail = await sendConfirmMail(env, email, name, lang, confirmUrl.toString());
  if (!mail.ok && !mail.skipped) return json({ error: "mail_failed" }, 502);
  return json({ ok: true });
}

export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const token = url.searchParams.get("confirm");
  if (!token || !env.BUILDER_KV) {
    return Response.redirect("https://lmexplorers.com/gratis-youtube-kurs?feil=1", 302);
  }
  const key = "freecourse:pending:" + token;
  const raw = await env.BUILDER_KV.get(key);
  if (!raw) {
    // Ugyldig eller allerede brukt/utløpt token.
    return Response.redirect("https://lmexplorers.com/gratis-youtube-kurs?utlopt=1", 302);
  }
  await env.BUILDER_KV.delete(key); // engangslenke
  let sub; try { sub = JSON.parse(raw); } catch (e) { sub = null; }
  if (sub && sub.email) {
    await sendDeliverMail(env, sub.email, sub.name, sub.lang);
    // Køer 3-ukers oppfølgingsserien (mersalg + jevnlige e-poster fremover).
    await enqueueYoutubeFollowups(env, sub.email, sub.name, sub.lang);
    try {
      await sendOwnerSignupNotice(env, { what: "Gratis YouTube-kurs", name: sub.name, email: sub.email, lang: sub.lang });
    } catch (e) {}
  }
  // Bekreftet: rett inn i kurset med en gang, i tillegg til e-posten hun får.
  return Response.redirect(COURSE_URL, 302);
}
