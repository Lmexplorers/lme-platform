/**
 * LME Momentum — fremdriften til den enkelte deltakeren.
 *
 * GET  /api/momentum
 *   -> { ok, eier, fremdrift: { fullfort, journal, maaling, seire, visjon, start, sist } }
 *
 * POST /api/momentum   body { handling: "...", ... }
 *   fullfor    { dag }                 huker av dagen, og setter rekken
 *   angre      { dag }                 huker den av igjen
 *   journal    { dag, svar: [...] }    lagrer svarene på dagens spørsmål
 *   maaling    { dag, tall }           lagrer tallet fra 0 til 10
 *   seier      { tekst }               legger til en seier
 *   fjernSeier { id }
 *   visjon     { tekst, bilde }        legger til et kort på visjonstavla
 *   fjernVisjon{ id }
 *
 * Lagres i momentum:<e-post>, altså per innlogget bruker. Kjøperen får
 * tilgang til selve reisen med tilgangslenken på e-post (samme system som
 * kursene, se _lib/course-access.js), men fremdriften følger kontoen, slik
 * at den ligger der på både telefon og maskin. Er du ikke logget inn,
 * svarer endepunktet at det ikke er noen fremdrift å hente, og appen
 * lagrer da bare i nettleseren.
 */
import { sessionUser, isOwner } from "../_lib/access.js";

function json(data, status) {
  return new Response(JSON.stringify(data), {
    status: status || 200,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

const key = (epost) => "momentum:" + epost.trim().toLowerCase();

const TOM = { fullfort: [], journal: {}, maaling: {}, seire: [], visjon: [], start: 0, sist: 0 };

async function les(env, epost) {
  try {
    const raw = await env.BUILDER_KV.get(key(epost));
    if (!raw) return { ...TOM };
    const d = JSON.parse(raw) || {};
    return {
      fullfort: Array.isArray(d.fullfort) ? d.fullfort : [],
      journal: d.journal && typeof d.journal === "object" ? d.journal : {},
      maaling: d.maaling && typeof d.maaling === "object" ? d.maaling : {},
      seire: Array.isArray(d.seire) ? d.seire : [],
      visjon: Array.isArray(d.visjon) ? d.visjon : [],
      start: d.start || 0,
      sist: d.sist || 0,
    };
  } catch (e) {
    return { ...TOM };
  }
}

async function skriv(env, epost, d) {
  await env.BUILDER_KV.put(key(epost), JSON.stringify(d));
}

/* Kutter tekst som er lengre enn den har noen grunn til å være. Uten dette
   kan ett langt journalsvar fylle hele nøkkelen i KV. */
function kort(v, maks) {
  return String(v == null ? "" : v).slice(0, maks || 4000);
}

const idag = () => new Date().toISOString().slice(0, 10);

export async function onRequestGet(context) {
  const { env } = context;
  if (!env || !env.BUILDER_KV) return json({ ok: false, error: "unavailable" }, 503);
  const user = await sessionUser(context);
  if (!user) return json({ ok: true, innlogget: false, eier: false, fremdrift: { ...TOM } });
  return json({
    ok: true,
    innlogget: true,
    eier: isOwner(user),
    fremdrift: await les(env, user.email),
  });
}

export async function onRequestPost(context) {
  const { request, env } = context;
  if (!env || !env.BUILDER_KV) return json({ ok: false, error: "unavailable" }, 503);
  const user = await sessionUser(context);
  if (!user) return json({ ok: false, error: "Du må være logget inn for at fremdriften skal lagres." }, 401);

  let body = {};
  try { body = await request.json(); } catch (e) {}
  const h = String(body.handling || "");
  const d = await les(env, user.email);
  if (!d.start) d.start = Date.now();

  const dag = Math.max(1, Math.min(999, parseInt(body.dag, 10) || 0));

  if (h === "fullfor") {
    if (!dag) return json({ ok: false, error: "Mangler dag." }, 400);
    if (d.fullfort.indexOf(dag) === -1) d.fullfort.push(dag);
    d.fullfort.sort((a, b) => a - b);
    d.sist = Date.now();
    // Rekken telles av datoene dagene ble haket av, ikke av dagnummeret,
    // så to dager på rad i appen er to dager på rad i livet.
    d.datoer = d.datoer && typeof d.datoer === "object" ? d.datoer : {};
    d.datoer[String(dag)] = idag();
  } else if (h === "angre") {
    if (!dag) return json({ ok: false, error: "Mangler dag." }, 400);
    d.fullfort = d.fullfort.filter((x) => x !== dag);
    if (d.datoer) delete d.datoer[String(dag)];
  } else if (h === "journal") {
    if (!dag) return json({ ok: false, error: "Mangler dag." }, 400);
    const svar = Array.isArray(body.svar) ? body.svar.slice(0, 10).map((s) => kort(s, 4000)) : [];
    d.journal[String(dag)] = svar;
  } else if (h === "maaling") {
    if (!dag) return json({ ok: false, error: "Mangler dag." }, 400);
    const tall = parseInt(body.tall, 10);
    if (isNaN(tall) || tall < 0 || tall > 10) return json({ ok: false, error: "Tallet må være fra 0 til 10." }, 400);
    d.maaling[String(dag)] = tall;
  } else if (h === "seier") {
    const tekst = kort(body.tekst, 500).trim();
    if (!tekst) return json({ ok: false, error: "Skriv noe først." }, 400);
    if (d.seire.length >= 500) return json({ ok: false, error: "Det er plass til 500 seire." }, 400);
    d.seire.unshift({ id: "s" + Date.now(), tekst: tekst, ts: Date.now() });
  } else if (h === "fjernSeier") {
    d.seire = d.seire.filter((s) => s.id !== String(body.id || ""));
  } else if (h === "visjon") {
    const tekst = kort(body.tekst, 300).trim();
    let bilde = kort(body.bilde, 600).trim();
    // Bare https, og bare som bildeadresse. Et kort uten tekst og uten
    // bilde er ingenting, og skal ikke lagres.
    if (bilde && !/^https:\/\//i.test(bilde)) bilde = "";
    if (!tekst && !bilde) return json({ ok: false, error: "Skriv noe, eller lim inn en bildeadresse." }, 400);
    if (d.visjon.length >= 100) return json({ ok: false, error: "Det er plass til 100 kort." }, 400);
    d.visjon.unshift({ id: "v" + Date.now(), tekst: tekst, bilde: bilde, ts: Date.now() });
  } else if (h === "fjernVisjon") {
    d.visjon = d.visjon.filter((v) => v.id !== String(body.id || ""));
  } else {
    return json({ ok: false, error: "Ukjent handling." }, 400);
  }

  await skriv(env, user.email, d);
  return json({ ok: true, fremdrift: d });
}
