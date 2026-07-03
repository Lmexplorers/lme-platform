/**
 * Kurssider: /academy/kurs/<adresse>
 *
 * Serverer alltid kursvisningen (academy/kurs.html) for disse adressene,
 * uavhengig av omskrivingsregelen i _redirects. Selve kurset hentes av
 * siden i nettleseren via /api/kurs?slug=<adresse>.
 *
 * Viktig: ASSETS kan svare med omdirigering til "pen" adresse
 * (/academy/kurs.html -> /academy/kurs). Den maa foelges her paa serveren.
 * Sendes den til nettleseren, mister adressen kursnavnet, og man havner
 * paa kursoversikten i stedet for kurset.
 */
export async function onRequestGet(context) {
  let res = await context.env.ASSETS.fetch(new URL("/academy/kurs.html", context.request.url));
  for (let hopp = 0; hopp < 3 && res.status >= 300 && res.status < 400; hopp++) {
    const til = res.headers.get("Location") || "/academy/kurs";
    res = await context.env.ASSETS.fetch(new URL(til, context.request.url));
  }
  const headers = new Headers(res.headers);
  headers.set("Cache-Control", "no-store");
  return new Response(res.body, { status: res.status, headers });
}
