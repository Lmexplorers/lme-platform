/**
 * Engelsk lenke-alias: /bloom-method
 *
 * Samme prinsipp som functions/free-youtube-course.js: lenke-forhåndsvisning
 * (Instagram/Facebook/iMessage) leser <title>/<meta>-tagger direkte fra
 * HTML-en uten å kjøre JS, så de må være engelske i selve responsen for
 * denne stien, ikke bare byttet av skriptet i nettleseren.
 */
export async function onRequestGet(context) {
  const res = await context.env.ASSETS.fetch(new URL("/funnel/rolig-metoden/index.html", context.request.url));
  let html = await res.text();

  html = html
    .replace('<html lang="no">', '<html lang="en">')
    .replace(
      "<title>Blomstrings-metoden — LME</title>",
      "<title>The BLOOM Method — LME</title>"
    )
    .replace(
      '<meta name="description" content="Fem rolige steg fra Kaoskarusellen til Det blomstrende hjemmet.">',
      '<meta name="description" content="Five calm steps from the Chaos Carousel to the Blossoming Home.">'
    )
    .replace(
      '<meta property="og:title" content="Blomstrings-metoden — LME">',
      '<meta property="og:title" content="The BLOOM Method — LME">'
    )
    .replace(
      '<meta property="og:description" content="Fem rolige steg fra Kaoskarusellen til Det blomstrende hjemmet.">',
      '<meta property="og:description" content="Five calm steps from the Chaos Carousel to the Blossoming Home.">'
    )
    .replace(
      '<meta property="og:url" content="https://lmexplorers.com/rolig-metoden">',
      '<meta property="og:url" content="https://lmexplorers.com/bloom-method">'
    );

  const headers = new Headers(res.headers);
  headers.set("Content-Type", "text/html; charset=UTF-8");
  headers.set("Cache-Control", "no-store");
  return new Response(html, { status: 200, headers });
}
