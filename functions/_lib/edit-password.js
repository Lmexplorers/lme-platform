/**
 * Passordet Renate bruker til å redigere på plattformen: kurs, Kursbygger,
 * grupper, Læringsverksted, episoder, blogg, podkast, sideredigering og
 * import-endepunktene.
 *
 * Tidligere overstyrte hemmeligheten COURSE_EDIT_PASSWORD i Cloudflare alltid
 * passordet i koden. Da hjalp det ikke å endre koden: så lenge hemmeligheten
 * lå der med en gammel verdi, var det den som gjaldt, og Renate ble avvist med
 * passordet hun faktisk bruker. Hun har ikke lyst til å lete i Cloudflare for å
 * få lov til å redigere sitt eget produkt.
 *
 * Derfor godtas nå BEGGE: passordet i koden under, og en eventuell hemmelighet
 * i Cloudflare. Da virker passordet hennes uansett hva som ligger der fra før,
 * og gamle bokmerker eller skript med hemmeligheten slutter ikke å virke.
 *
 * Skal passordet byttes senere, er det denne verdien som skal endres.
 */
export const EDIT_PASSWORD = "LME2026";

/**
 * Er det oppgitte passordet gyldig?
 *
 * @param env    Cloudflare-miljøet (leser COURSE_EDIT_PASSWORD hvis satt)
 * @param gitt   passordet brukeren oppga
 * @param ekstra valgfrie ekstra gyldige passord, for endepunkter som har sitt
 *               eget (podkasten har for eksempel PODCAST_PASSWORD)
 */
export function editPasswordOk(env, gitt, ekstra) {
  const s = (gitt == null ? "" : gitt) + "";
  if (!s) return false;
  const gyldige = [EDIT_PASSWORD, env && env.COURSE_EDIT_PASSWORD]
    .concat(Array.isArray(ekstra) ? ekstra : [])
    .filter(Boolean)
    .map((v) => v + "");
  return gyldige.some((v) => v === s);
}

/** Hvor passordet serveren godtar kommer fra, til feilmeldinger. Aldri verdien. */
export function editPasswordSource(env) {
  return env && env.COURSE_EDIT_PASSWORD ? "kode+cloudflare" : "kode";
}
