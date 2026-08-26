/**
 * Hva hver oppskrift i butikken koster i norske kroner, i øre.
 *
 * Vipps må vite prisen på serveren. Prisen som står på nettsiden kommer
 * fra nettleseren, og den kan hvem som helst endre før den sendes hit.
 * Sto beløpet bare der, kunne noen kjøpt en oppskrift til én krone.
 *
 * Tallene er hentet fra Stripe 26. august 2026: for hver av de 77
 * oppskriftene ble den norske betalingslenken slått opp, og beløpet
 * lest av. Deretter ble hvert beløp sammenlignet med prisen som står i
 * kjøpsboksen på produktsiden. Alle 73 sidene stemte, uten ett avvik.
 * (Fire produkt-ID-er har ingen egen side, de er samlepakker som selges
 * fra variantsidene.)
 *
 * ENDRER DU EN PRIS: den må endres tre steder, ellers spriker det.
 *   1. i Stripe (det kortkunden faktisk betaler)
 *   2. i kjøpsboksen på produktsiden (det kunden ser)
 *   3. her (det Vipps-kunden faktisk betaler)
 * Kjør `node scripts/sjekk-butikkpriser.mjs` etterpå, den sier fra hvis
 * denne filen og sidene ikke er enige.
 */
export const OPPSKRIFT_NOK_ORE = {
  "bottehatter-barn-hekle": 14900,
  "bottehatter-barn-hekle-norge": 9900,
  "bottehatter-barn-hekle-norway": 9900,
  "bottehatter-barn-hekle-ro": 9900,
  "bottehatter-barn-hekle-rune": 14900,
  "bottehatter-barn-hekle-rune-norge": 9900,
  "bottehatter-barn-hekle-rune-norway": 9900,
  "bottehatter-barn-strikk": 14900,
  "bottehatter-barn-strikk-brodert": 14900,
  "bottehatter-barn-strikk-brodert-norge": 9900,
  "bottehatter-barn-strikk-brodert-norway": 9900,
  "bottehatter-barn-strikk-brodert-ro": 9900,
  "bottehatter-barn-strikk-norge": 9900,
  "bottehatter-barn-strikk-norway": 9900,
  "bottehatter-barn-strikk-ro": 9900,
  "bottehatter-barn-strikk-rune-norge": 9900,
  "bottehatter-barn-strikk-rune-norway": 9900,
  "ellie-hekle": 12900,
  "ellies-aktivitetsleke": 14900,
  "ellies-ballerinasko": 12900,
  "ellies-rangle": 9900,
  "ellies-smokkelenke": 8900,
  "ellies-vognlenke": 11900,
  "felix-aktivitetsleke": 14900,
  "felix-ballerinasko": 12900,
  "felix-hekle": 12900,
  "felix-rangle": 9900,
  "felix-smokkelenke": 8900,
  "felix-vognlenke": 11900,
  "fotballpute-ro-strikk": 9900,
  "hekle-pakke": 24900,
  "luna-hekle": 12900,
  "lunas-aktivitetsleke": 14900,
  "lunas-ballerinasko": 12900,
  "lunas-rangle": 9900,
  "lunas-smokkelenke": 8900,
  "lunas-vognlenke": 11900,
  "molly-hekle": 12900,
  "mollys-aktivitetsleke": 14900,
  "mollys-ballerinasko": 12900,
  "mollys-rangle": 9900,
  "mollys-smokkelenke": 8900,
  "mollys-vognlenke": 11900,
  "naturutforskerne": 9900,
  "norge-blokk": 9900,
  "norge-hekle": 9900,
  "norge-innstrikket": 9900,
  "norge-pakke": 14900,
  "norge-rune": 9900,
  "norge-rune-strikk": 9900,
  "norge-skaut": 9900,
  "norge-skaut-hekle": 9900,
  "norge-strikk": 9900,
  "norway-hekle": 9900,
  "norway-strikk": 9900,
  "oliver-hekle": 12900,
  "olivers-aktivitetsleke": 14900,
  "olivers-ballerinasko": 12900,
  "olivers-rangle": 9900,
  "olivers-smokkelenke": 8900,
  "olivers-vognlenke": 11900,
  "pip-hekle": 12900,
  "pips-aktivitetsleke": 14900,
  "pips-ballerinasko": 12900,
  "pips-rangle": 9900,
  "pips-smokkelenke": 8900,
  "pips-vognlenke": 11900,
  "plansjer": 19900,
  "ro-hekle": 9900,
  "ro-strikk": 9900,
  "skaut-barn-hekle-norge": 9900,
  "skaut-barn-hekle-ro": 9900,
  "skaut-barn-strikk-norge": 9900,
  "skaut-barn-strikk-ro": 9900,
  "strikk-pakke": 29900,
  "tidslinje": 49900,
  "woodland-dreams-bundle": 215000,
};

/* Prisen i øre for en oppskrift, eller null hvis vi ikke kjenner den.
   Null betyr "ikke selg denne med Vipps", ikke "gratis". */
export function oppskriftPrisOre(pid) {
  const ore = OPPSKRIFT_NOK_ORE[pid];
  return typeof ore === "number" && ore > 0 ? ore : null;
}
