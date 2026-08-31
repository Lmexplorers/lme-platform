/**
 * Kjøperen har betalt hos medlemmets egen betalingsleverandør, og er sendt
 * hit av leverandørens "etter betaling"-adresse. Her får de tilgangen sin.
 *
 * POST /api/kjopt   body { slug, n, epost, navn? }
 *   -> { ok: true, lenke, kurs }        tilgangen er gitt og sendt på e-post
 *   -> { error: "..." }                 hvis nøkkelen ikke stemmer
 *
 * Se functions/_lib/kurs-kvittering.js for hvorfor det er løst slik, og hva
 * grensene er.
 */
import { grantCourseAccess } from "../_lib/course-access.js";
import { sendCourseDeliveryMail } from "../_lib/course-mail.js";
import { KEY_PREFIX } from "./kurs.js";
import { lesNokkel, nokkelStemmer, innenforGrensen, lagreKjoper } from "../_lib/kurs-kvittering.js";
import { leggTil as leggTilPaaListe } from "../_lib/medlem-liste.js";

function json(data, status) {
  return new Response(JSON.stringify(data), {
    status: status || 200,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

function gyldigEpost(e) {
  return /^[^@\s]+@[^@\s.]+\.[^@\s]{2,}$/.test((e || "").trim());
}

export async function onRequestPost(context) {
  const { request, env } = context;
  if (!env.BUILDER_KV) return json({ error: "not_configured" }, 200);

  let body = null;
  try { body = await request.json(); } catch (e) { return json({ error: "bad_json" }, 400); }

  const slug = ((body && body.slug) || "").trim().toLowerCase();
  const epost = ((body && body.epost) || "").trim().toLowerCase();
  const navn = ((body && body.navn) || "").trim().slice(0, 80);
  if (!/^[a-z0-9][a-z0-9-]{1,58}[a-z0-9]$/.test(slug)) return json({ error: "bad_slug" }, 400);
  if (!gyldigEpost(epost)) return json({ error: "bad_email" }, 400);

  const lagret = await lesNokkel(env, slug);
  if (!lagret || !nokkelStemmer(lagret, (body && body.n) || "")) {
    return json({ error: "bad_key" }, 403);
  }

  let kurs = null;
  try {
    const raw = await env.BUILDER_KV.get(KEY_PREFIX + slug);
    kurs = raw ? JSON.parse(raw) : null;
  } catch (e) { kurs = null; }
  if (!kurs) return json({ error: "not_found" }, 404);

  if (!(await innenforGrensen(env, slug))) return json({ error: "for_mange" }, 429);

  const token = await grantCourseAccess(env, slug, epost, navn);
  const url = "https://lmexplorers.com/kurs?k=" + slug;
  const lenke = url + "&t=" + token;
  const navnPaaKurs = (kurs.title && (kurs.title.no || kurs.title.en)) || slug;

  // Leveringsmailen er den samme som ellers på plattformen, med kursets navn.
  try {
    await sendCourseDeliveryMail(env, epost, navn, "no", navnPaaKurs, url, token, true);
  } catch (e) { /* tilgangen er alt gitt, e-posten er en bonus */ }

  try { await lagreKjoper(env, slug, { epost, navn, token }); } catch (e) {}

  /* Kjøperen havner også på selgerens EGEN e-postliste, ikke Renates. Det er
     slik en skaper bygger videre: den som har kjøpt én gang, er den viktigste
     å kunne snakke med igjen. */
  try {
    const eier = ((kurs.eier || "") + "").toLowerCase();
    if (eier) await leggTilPaaListe(env, eier, { epost, navn, kilde: "kjøpte " + slug });
  } catch (e) {}

  return json({ ok: true, lenke: lenke, kurs: navnPaaKurs });
}
