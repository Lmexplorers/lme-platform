/**
 * Medlemmets egen reise gjennom LME.
 *
 * Veikartet på /roadmap forteller hva plattformen er. Denne siden forteller
 * medlemmet hvor DE er: hva de har gjort, hva som er neste steg. Fasene er de
 * samme fem som på veikartet, så det er én reise, ikke to systemer.
 *
 * GET  /api/min-reise
 *   -> { loggedIn, medlem, fase, faser: [ { id, navn, steg: [...] } ] }
 *      Hvert steg har { id, tekst, gjort, automatisk }.
 *      "automatisk" betyr at plattformen ser det selv (kjøp, egne kurs,
 *      medlemskap). Resten huker medlemmet av selv.
 *
 * POST /api/min-reise   body { steg: "<id>", gjort: true|false }
 *   -> { ok: true }
 *      Lagrer bare de manuelle stegene, i reise:<e-post>. De automatiske kan
 *      ikke hukes av for hånd, de leses fra det som faktisk har skjedd.
 */
import { sessionUser, getAccess } from "../_lib/access.js";
import { getPurchases } from "../_lib/purchases.js";
import { KEY_PREFIX as KURS_PREFIX } from "./kurs.js";

function json(data, status) {
  return new Response(JSON.stringify(data), {
    status: status || 200,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

const reiseKey = (epost) => "reise:" + epost.trim().toLowerCase();

/* Fasene, med samme navn som veikartet. Stegene er skrevet til medlemmet,
   ikke om plattformen. */
const FASER = [
  {
    id: "froet", navn: { no: "Frøet", en: "The Seed" },
    undertittel: { no: "Lær prinsippene", en: "Learn the principles" },
    steg: [
      { id: "konto", auto: "konto", tekst: { no: "Opprettet kontoen din", en: "Created your account" } },
      { id: "omvisning", tekst: { no: "Tatt kurset LME-plattformen fra A til Å", en: "Taken the course The LME Platform from A to Z" } },
      { id: "forste-kurs", auto: "kjopt", tekst: { no: "Startet på ditt første kurs", en: "Started your first course" } },
      { id: "biblioteket", tekst: { no: "Funnet fram i Biblioteket og Ressurser", en: "Found your way around the Library and Resources" } },
    ],
  },
  {
    id: "spiren", navn: { no: "Spiren", en: "The Sprout" },
    undertittel: { no: "Forbered miljøet", en: "Prepare the environment" },
    steg: [
      { id: "miljo", tekst: { no: "Forberedt ett rom eller én hylle hjemme eller i barnehagen", en: "Prepared one room or one shelf at home or at work" } },
      { id: "observasjon", tekst: { no: "Observert barnet i tjue minutter uten å gripe inn", en: "Observed the child for twenty minutes without stepping in" } },
      { id: "rytme", tekst: { no: "Laget en fast dagsrytme du klarer å holde", en: "Made a daily rhythm you can actually keep" } },
    ],
  },
  {
    id: "blomsten", navn: { no: "Blomsten", en: "The Bloom" },
    undertittel: { no: "Skap dine egne ting", en: "Create your own things" },
    steg: [
      { id: "eget-kurs", auto: "eget-kurs", tekst: { no: "Laget ditt første eget kurs i Kursbygger", en: "Made your first own course in the course builder" } },
      { id: "publisert", auto: "publisert", tekst: { no: "Publisert kurset ditt", en: "Published your course" } },
      { id: "innhold", tekst: { no: "Laget innhold du har delt offentlig", en: "Made content you have shared publicly" } },
      { id: "lead-magnet", tekst: { no: "Laget noe du kan gi bort, som samler e-postadresser", en: "Made something you can give away that collects email addresses" } },
    ],
  },
  {
    id: "treet", navn: { no: "Treet", en: "The Tree" },
    undertittel: { no: "Bygg fellesskapet ditt", en: "Build your community" },
    steg: [
      { id: "medlem", auto: "medlem", tekst: { no: "Blitt medlem i Inner Circle", en: "Become a member of the Inner Circle" } },
      { id: "live", tekst: { no: "Vært med på en live-økt eller sett et opptak", en: "Joined a live session or watched a recording" } },
      { id: "delt", tekst: { no: "Delt en seier eller et spørsmål med de andre", en: "Shared a win or a question with the others" } },
    ],
  },
  {
    id: "frukten", navn: { no: "Frukten", en: "The Fruit" },
    undertittel: { no: "Selg og voks", en: "Sell and grow" },
    steg: [
      { id: "pris", auto: "pris", tekst: { no: "Satt pris på noe du har laget", en: "Put a price on something you made" } },
      { id: "forste-salg", tekst: { no: "Fått ditt første salg", en: "Made your first sale" } },
      { id: "gjentakelse", tekst: { no: "Solgt det samme to ganger, uten å lage noe nytt", en: "Sold the same thing twice, without making anything new" } },
    ],
  },
];

/* Det plattformen ser selv. Ingenting av dette kan hukes av for hånd. */
async function automatisk(context, bruker) {
  const { env } = context;
  const epost = (bruker.email || "").toLowerCase();
  const ut = { konto: true, kjopt: false, medlem: false, "eget-kurs": false, publisert: false, pris: false };

  try {
    const tilgang = await getAccess(context);
    ut.medlem = !!(tilgang && tilgang.active);
  } catch (e) {}

  try {
    const kjop = await getPurchases(env, epost);
    ut.kjopt = Array.isArray(kjop) && kjop.length > 0;
  } catch (e) {}

  try {
    const listet = await env.BUILDER_KV.list({ prefix: KURS_PREFIX, limit: 1000 });
    for (const key of (listet && listet.keys) || []) {
      const raw = await env.BUILDER_KV.get(key.name);
      if (!raw) continue;
      let kurs = null;
      try { kurs = JSON.parse(raw); } catch (e) { continue; }
      if (!kurs || ((kurs.eier || "") + "") !== epost) continue;
      ut["eget-kurs"] = true;
      if (kurs.published) ut.publisert = true;
      if (kurs.pris && ((kurs.pris.no || "") + "").trim()) ut.pris = true;
    }
  } catch (e) {}

  return ut;
}

async function lesManuelle(env, epost) {
  try {
    const raw = await env.BUILDER_KV.get(reiseKey(epost));
    const d = raw ? JSON.parse(raw) : null;
    return (d && d.steg) || {};
  } catch (e) { return {}; }
}

export async function onRequestGet(context) {
  const { env } = context;
  if (!env.BUILDER_KV) return json({ loggedIn: false, error: "not_configured" });
  const bruker = await sessionUser(context);
  if (!bruker) return json({ loggedIn: false, faser: [] });

  const epost = (bruker.email || "").toLowerCase();
  const auto = await automatisk(context, bruker);
  const manuelle = await lesManuelle(env, epost);

  const faser = FASER.map((f) => ({
    id: f.id, navn: f.navn, undertittel: f.undertittel,
    steg: f.steg.map((s) => ({
      id: s.id, tekst: s.tekst,
      automatisk: !!s.auto,
      gjort: s.auto ? !!auto[s.auto] : !!manuelle[s.id],
    })),
  }));

  // Hvilken fase er jeg i? Den første som ikke er ferdig, ellers den siste.
  let fase = faser.findIndex((f) => f.steg.some((s) => !s.gjort));
  if (fase === -1) fase = faser.length - 1;

  const gjort = faser.reduce((n, f) => n + f.steg.filter((s) => s.gjort).length, 0);
  const totalt = faser.reduce((n, f) => n + f.steg.length, 0);

  return json({
    loggedIn: true, medlem: !!auto.medlem, navn: bruker.name || "",
    fase: fase, faser: faser, gjort: gjort, totalt: totalt,
  });
}

export async function onRequestPost(context) {
  const { request, env } = context;
  if (!env.BUILDER_KV) return json({ error: "not_configured" }, 200);
  const bruker = await sessionUser(context);
  if (!bruker) return json({ error: "not_logged_in" }, 401);

  let body = null;
  try { body = await request.json(); } catch (e) { return json({ error: "bad_json" }, 400); }
  const id = ((body && body.steg) || "") + "";

  // Bare manuelle steg kan endres. De automatiske leses fra virkeligheten.
  const kjent = FASER.some((f) => f.steg.some((s) => s.id === id && !s.auto));
  if (!kjent) return json({ error: "ukjent_steg" }, 400);

  const epost = (bruker.email || "").toLowerCase();
  const steg = await lesManuelle(env, epost);
  if (body.gjort) steg[id] = true; else delete steg[id];
  try {
    await env.BUILDER_KV.put(reiseKey(epost), JSON.stringify({ steg: steg, updated: Date.now() }));
  } catch (e) { return json({ error: "write_failed" }, 200); }
  return json({ ok: true, gjort: !!body.gjort });
}
