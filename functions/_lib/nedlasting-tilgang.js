/**
 * Hvem får laste ned hva.
 *
 * Filene under /butikk/nedlasting/ lå åpent ute. Hvem som helst som kjente
 * adressen kunne hente en oppskrift uten å betale, og adressene var lette å
 * gjette (produktnavnet + .pdf). Nå må hver nedlasting vise et kjøpsbevis.
 *
 * Tre ting teller som bevis, i denne rekkefølgen:
 *
 *   1. En nedlastingsnøkkel i adressen (?t=...). Den lages ved kjøpet og
 *      står i leveringsmailen, så kundens egen lenke virker for alltid.
 *   2. Innlogget kunde som har kjøpt produktet. Kjøpene ligger alt i
 *      purchases:<e-post>.
 *   3. Eieren. Renate skal aldri stenges ute fra sitt eget.
 *
 * Nøkkelen er knyttet til ett produkt, ikke til én fil. Kjøper du en pakke,
 * åpner nøkkelen alle filene i pakken. Kjøper du én oppskrift, åpner den
 * bare den ene, selv om filene ligger side om side i samme mappe.
 */
import { oppskriftFiler, oppskriftIder } from "./oppskrift-mail.js";
import { sessionUser, isOwner, OWNER_EMAILS } from "./access.js";
import { getPurchases } from "./purchases.js";

export const NOKKEL_PREFIX = "dl:";
/* Fra Stripe-økt til nøkkel, slik takkesiden kan hente nøkkelen med en gang
   kunden lander der, uten å vente på e-posten. */
export const OKT_PREFIX = "dl_okt:";

/* Skoledagbøkene leveres av sin egen kode og står ikke i oppskriftslisten.
   Uten disse ville en kjøper av skoledagboken blitt stengt ute fra boka si. */
const SKOLEDAGBOK_1_3 = [
  "/butikk/nedlasting/skoledagbok/skoledagbok-1-3-trinn.pdf",
  "/butikk/nedlasting/skoledagbok/skoledagbok-1-3-trinn-en.pdf",
];
const SKOLEDAGBOK_4_7 = [
  "/butikk/nedlasting/skoledagbok/skoledagbok-4-7-trinn.pdf",
  "/butikk/nedlasting/skoledagbok/skoledagbok-4-7-trinn-en.pdf",
];

/* Skoledagboken har to skrivemåter i kjøpshistorikken, avhengig av om den
   ble kjøpt med kort eller Vipps ("skoledagbok-1-3" mot
   "skoledagbok-1-3-trinn"). Begge står her, ellers ville halvparten av
   kjøperne blitt stengt ute fra boka si. */
const EKSTRA_FILER = {
  "skoledagbok-1-3": SKOLEDAGBOK_1_3,
  "skoledagbok-4-7": SKOLEDAGBOK_4_7,
  "skoledagbok-1-3-trinn": SKOLEDAGBOK_1_3,
  "skoledagbok-4-7-trinn": SKOLEDAGBOK_4_7,
};

/* Filene et produkt gir, uansett hvilket av de to registrene det står i. */
export function filerFor(pid) {
  if (EKSTRA_FILER[pid]) return EKSTRA_FILER[pid].slice();
  return oppskriftFiler(pid);
}

/* Fra fil til produktene som gir den. Samme fil kan høre til flere
   produkter: en oppskrift selges både alene og i en pakke, og begge
   kjøpene skal åpne den. Bygges én gang. */
let kart = null;
function filkart() {
  if (kart) return kart;
  kart = new Map();
  const ider = oppskriftIder().concat(Object.keys(EKSTRA_FILER));
  for (const pid of ider) {
    for (const sti of filerFor(pid)) {
      if (!kart.has(sti)) kart.set(sti, []);
      const liste = kart.get(sti);
      if (liste.indexOf(pid) === -1) liste.push(pid);
    }
  }
  return kart;
}

export function produkterForFil(sti) {
  return filkart().get(sti) || [];
}

/* Er stien i det hele tatt en fil vi låser? Alt annet under mappen slipper
   gjennom som før, så en fil som legges der uten å høre til et produkt ikke
   blir utilgjengelig ved et uhell. */
export function erLaastFil(sti) {
  return filkart().has(sti);
}

function nyNokkel() {
  return (crypto.randomUUID() + crypto.randomUUID()).replace(/-/g, "");
}

/**
 * Lager en nedlastingsnøkkel for et kjøp. Kalles fra leveringen, både
 * Stripe og Vipps. Nøkkelen utløper ikke: Renate lover at du kan laste ned
 * så mange ganger du vil.
 *
 * @returns nøkkelen, eller null hvis produktet ikke har filer hos oss.
 */
export async function lagNedlastingsnokkel(env, pid, email, oktId) {
  if (!env || !env.BUILDER_KV || !pid) return null;
  if (!filerFor(pid).length) return null;
  const nokkel = nyNokkel();
  await env.BUILDER_KV.put(
    NOKKEL_PREFIX + nokkel,
    JSON.stringify({ pid: pid, email: (email || "").trim().toLowerCase(), laget: Date.now() })
  );
  /* Stripe forteller oss øktnummeret sitt både i webhooken og i adressen
     kunden sendes tilbake til. Vi legger nøkkelen under øktnummeret, så
     takkesiden kan hente den med en gang. Den slettes av seg selv etter et
     døgn, den trengs bare i minuttene rett etter kjøpet. */
  if (oktId) {
    try {
      await env.BUILDER_KV.put(OKT_PREFIX + oktId, nokkel, { expirationTtl: 86400 });
    } catch (e) {}
  }
  return nokkel;
}

/* Legger nøkkelen på en nedlastingslenke. Lar lenker til andre nettsteder
   (f.eks. tidslinjen i Google Drive) være i fred. */
export function medNokkel(url, nokkel) {
  if (!nokkel || !url) return url;
  const s = String(url);
  if (!(s.charAt(0) === "/" || s.indexOf("https://lmexplorers.com/") === 0)) return s;
  return s + (s.indexOf("?") >= 0 ? "&" : "?") + "t=" + encodeURIComponent(nokkel);
}

/**
 * Får denne forespørselen hente denne filen?
 *
 * @returns { ok, grunn } der grunn er "nokkel", "kjopt", "eier", "apen"
 *   eller, når svaret er nei, "mangler_bevis".
 */
export async function harNedlastingstilgang(context, sti) {
  const { request, env } = context;
  if (!erLaastFil(sti)) return { ok: true, grunn: "apen" };

  const eiere = produkterForFil(sti);
  const url = new URL(request.url);

  // 1. Nøkkel i adressen
  const nokkel = (url.searchParams.get("t") || "").trim();
  if (nokkel && env.BUILDER_KV) {
    let raa = null;
    try {
      raa = await env.BUILDER_KV.get(NOKKEL_PREFIX + nokkel);
    } catch (e) {
      /* Vi klarte ikke å slå opp nøkkelen. Det er ikke det samme som at
         den er ugyldig, det betyr at lageret vårt ikke svarte. Da slipper
         vi henne gjennom.

         Ja, i det minuttet KV er nede kommer også en oppdiktet nøkkel
         forbi. Men alternativet er at hver eneste kunde som har betalt
         blir stengt ute fra varen sin fordi noe hos oss er nede, og det
         er en mye verre feil å gjøre. */
      return { ok: true, grunn: "kv_nede" };
    }
    if (raa) {
      try {
        const rec = JSON.parse(raa);
        if (rec && eiere.indexOf(rec.pid) !== -1) return { ok: true, grunn: "nokkel" };
      } catch (e) {}
    }
  }

  // 2. og 3. Innlogget kunde eller eier
  let bruker = null;
  try { bruker = await sessionUser(context); } catch (e) {}
  if (bruker) {
    if (isOwner(bruker)) return { ok: true, grunn: "eier" };
    try {
      const kjop = await getPurchases(env, bruker.email);
      const har = (kjop || []).some(function (k) { return k && eiere.indexOf(k.id) !== -1; });
      if (har) return { ok: true, grunn: "kjopt" };
    } catch (e) {}
  }

  return { ok: false, grunn: "mangler_bevis", produkter: eiere };
}

/* Eiernes e-poster, til bruk der vi bare har en adresse og ingen økt. */
export function erEierEpost(email) {
  const e = String(email || "").trim().toLowerCase();
  return !!e && OWNER_EMAILS.indexOf(e) !== -1;
}
