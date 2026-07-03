/**
 * Kurssider: /academy/kurs/<adresse>
 *
 * Serverer alltid academy/kurs.html for disse adressene, uavhengig av
 * omskrivingsregelen i _redirects. Selve kurset hentes av siden i
 * nettleseren via /api/kurs?slug=<adresse>.
 */
export async function onRequestGet(context) {
  const url = new URL("/academy/kurs.html", context.request.url);
  const res = await context.env.ASSETS.fetch(url);
  // Aldri hurtiglagre selve HTML-skallet, saa oppdateringer naar ut med en gang
  const headers = new Headers(res.headers);
  headers.set("Cache-Control", "no-store");
  return new Response(res.body, { status: res.status, headers });
}
