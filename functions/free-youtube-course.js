/**
 * Engelsk lenke-alias: /free-youtube-course
 *
 * Instagram/Facebook/iMessage sin lenke-forhåndsvisning leser <title>,
 * <meta name="description"> og og:-taggene direkte fra HTML-en uten å
 * kjøre JS, så språkbytte-skriptet på gratis-youtube-kurs.html (som kun
 * kjører i nettleseren) rekker aldri å bytte dem til engelsk før
 * forhåndsvisningen genereres. Denne funksjonen serverer derfor en
 * engelsk-tagget versjon direkte på denne adressen (ingen omdirigering,
 * adressen forblir ren), og sidens eget skript gjenkjenner selve stien
 * (/free-youtube-course) og bytter resten av det synlige innholdet til
 * engelsk med en gang.
 */
export async function onRequestGet(context) {
  const res = await context.env.ASSETS.fetch(new URL("/gratis-youtube-kurs.html", context.request.url));
  let html = await res.text();

  html = html
    .replace('<html lang="no">', '<html lang="en">')
    .replace(
      "<title>Få YouTube-kurset gratis · LME</title>",
      "<title>Get the free YouTube course · LME</title>"
    )
    .replace(
      '<meta name="description" content="Bekreft e-posten din, så får du gratis tilgang til «Voks på YouTube med AI».">',
      '<meta name="description" content="Confirm your email and get free access to “Grow on YouTube with AI”.">'
    )
    .replace(
      '<meta property="og:title" content="Få YouTube-kurset gratis · LME">',
      '<meta property="og:title" content="Get the free YouTube course · LME">'
    )
    .replace(
      '<meta property="og:description" content="Bekreft e-posten din, så får du gratis tilgang til «Voks på YouTube med AI».">',
      '<meta property="og:description" content="Confirm your email and get free access to “Grow on YouTube with AI”.">'
    )
    .replace(
      '<meta property="og:url" content="https://lmexplorers.com/gratis-youtube-kurs">',
      '<meta property="og:url" content="https://lmexplorers.com/free-youtube-course">'
    );

  const headers = new Headers(res.headers);
  headers.set("Content-Type", "text/html; charset=UTF-8");
  headers.set("Cache-Control", "no-store");
  return new Response(html, { status: 200, headers });
}
