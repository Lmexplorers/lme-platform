/**
 * Automatisk tilgang etter kjøp, for medlemmenes egne kurs.
 *
 * Medlemmene bruker sin egen betalingsløsning (Stripe, PayPal, Klarna, Vipps
 * eller noe annet), og pengene går rett til dem. LME ser derfor aldri selve
 * betalingen, og kan ikke lytte på en webhook hos en leverandør vi ikke eier.
 *
 * Det alle disse leverandørene HAR til felles, er at selgeren kan bestemme
 * hvor kjøperen sendes etter betaling. Derfor får hvert kurs sin egen
 * takkeadresse:
 *
 *     https://lmexplorers.com/kjopt/<slug>?n=<nøkkel>
 *
 * Medlemmet limer den inn som "etter betaling"-adresse hos leverandøren sin,
 * én gang. Kjøperen lander der, skriver e-posten sin, og får tilgangen med det
 * samme, pluss en personlig lenke på e-post. Ingenting å be Renate om, og
 * ingenting teknisk for medlemmet utover å lime inn én adresse.
 *
 * Ærlig om grensen: den som kjenner takkeadressen, kan be om tilgang uten å ha
 * betalt. Derfor ligger nøkkelen aldri i den offentlige kurs-JSON-en, hvert
 * kurs har en grense per døgn, og selgeren ser hvem som har fått tilgang og
 * kan fjerne den igjen. For småsalg er dette den avveiningen alle
 * lavterskelverktøy gjør. Skal det bli helt tett, må hver leverandør kobles
 * på for seg, med signert webhook.
 *
 * KV:
 *   kurs-kvittering:<slug>          -> { nokkel, eier, laget }
 *   kurs-kvittering-teller:<slug>:<dato> -> antall tilganger gitt i døgnet
 *   kurs-kjopere:<slug>             -> [ { epost, navn, ts, token } ]
 */

const nokkelKey = (slug) => "kurs-kvittering:" + slug;
const tellerKey = (slug, dato) => "kurs-kvittering-teller:" + slug + ":" + dato;
const kjoperKey = (slug) => "kurs-kjopere:" + slug;

/* Hvor mange tilganger ett kurs kan gi ut i døgnet. Et lite kurs selger ikke
   femti eksemplarer på én dag, så taket stopper misbruk uten å stå i veien.
   Selgeren ser uansett hver eneste tilgang i lista si. */
export const DOGNGRENSE = 50;

function idag() {
  return new Date().toISOString().slice(0, 10);
}

/* Henter kursets nøkkel, og lager den første gang. Kalles bare fra kode som
   allerede har sjekket at den som spør eier kurset. */
export async function hentEllerLagNokkel(env, slug, eier) {
  const raw = await env.BUILDER_KV.get(nokkelKey(slug));
  if (raw) {
    try {
      const d = JSON.parse(raw);
      if (d && d.nokkel) return d;
    } catch (e) { /* ødelagt post, lag ny under */ }
  }
  const rec = {
    nokkel: crypto.randomUUID().replace(/-/g, "").slice(0, 24),
    eier: (eier || "").toLowerCase(),
    laget: Date.now(),
  };
  await env.BUILDER_KV.put(nokkelKey(slug), JSON.stringify(rec));
  return rec;
}

export async function lesNokkel(env, slug) {
  try {
    const raw = await env.BUILDER_KV.get(nokkelKey(slug));
    return raw ? JSON.parse(raw) : null;
  } catch (e) { return null; }
}

/* Stemmer nøkkelen kjøperen kom med? Sammenligningen tar like lang tid
   uansett hvor mye som stemmer, så den ikke kan gjettes tegn for tegn. */
export function nokkelStemmer(lagret, oppgitt) {
  const a = ((lagret && lagret.nokkel) || "") + "";
  const b = (oppgitt || "") + "";
  if (!a || a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/* Døgngrensen. Returnerer true hvis det er plass til én til. */
export async function innenforGrensen(env, slug) {
  const key = tellerKey(slug, idag());
  let n = 0;
  try { n = parseInt((await env.BUILDER_KV.get(key)) || "0", 10) || 0; } catch (e) { n = 0; }
  if (n >= DOGNGRENSE) return false;
  try {
    // To døgn levetid, så gårsdagens teller rydder seg selv bort.
    await env.BUILDER_KV.put(key, String(n + 1), { expirationTtl: 60 * 60 * 48 });
  } catch (e) { /* teller er et vern, ikke en sperre for selve salget */ }
  return true;
}

/* Kjøperlista selgeren ser, og som gjør at tilgang kan fjernes igjen. */
export async function lagreKjoper(env, slug, kjoper) {
  const key = kjoperKey(slug);
  let liste = [];
  try {
    const raw = await env.BUILDER_KV.get(key);
    liste = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(liste)) liste = [];
  } catch (e) { liste = []; }
  liste.unshift({
    epost: (kjoper.epost || "").toLowerCase(),
    navn: kjoper.navn || "",
    token: kjoper.token || "",
    ts: Date.now(),
  });
  if (liste.length > 500) liste = liste.slice(0, 500);
  await env.BUILDER_KV.put(key, JSON.stringify(liste));
}

export async function lesKjopere(env, slug) {
  try {
    const raw = await env.BUILDER_KV.get(kjoperKey(slug));
    const liste = raw ? JSON.parse(raw) : [];
    return Array.isArray(liste) ? liste : [];
  } catch (e) { return []; }
}

/* Takkeadressen medlemmet limer inn hos betalingsleverandøren sin. */
export function takkeadresse(slug, nokkel) {
  return "https://lmexplorers.com/kjopt/" + slug + "?n=" + nokkel;
}
