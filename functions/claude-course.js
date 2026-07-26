/**
 * Engelsk lenke-alias: /claude-course
 *
 * Samme prinsipp som functions/free-youtube-course.js: lenke-forhåndsvisning
 * (Instagram/Facebook/iMessage) leser <title>/<meta>-tagger direkte fra
 * HTML-en uten å kjøre JS, så de må være engelske i selve responsen for
 * denne stien, ikke bare byttet av skriptet i nettleseren.
 */
export async function onRequestGet(context) {
  const res = await context.env.ASSETS.fetch(new URL("/funnel/claude-kurs/salg.html", context.request.url));
  let html = await res.text();

  html = html
    .replace('<html lang="no">', '<html lang="en">')
    .replace(
      "<title>Kom i gang med Claude · LME</title>",
      "<title>Get started with Claude · LME</title>"
    )
    .replace(
      '<meta name="description" content="Kom i gang med Claude, med ferdige oppskrifter. Se kurset og pris.">',
      '<meta name="description" content="Get started with Claude, with ready-made recipes. See the course and price.">'
    )
    .replace(
      '<meta property="og:title" content="Kom i gang med Claude · LME">',
      '<meta property="og:title" content="Get started with Claude · LME">'
    )
    .replace(
      '<meta property="og:description" content="Kom i gang med Claude, med ferdige oppskrifter. Se kurset og pris.">',
      '<meta property="og:description" content="Get started with Claude, with ready-made recipes. See the course and price.">'
    )
    .replace(
      '<meta property="og:url" content="https://lmexplorers.com/claude-kurs">',
      '<meta property="og:url" content="https://lmexplorers.com/claude-course">'
    );

  const headers = new Headers(res.headers);
  headers.set("Content-Type", "text/html; charset=UTF-8");
  headers.set("Cache-Control", "no-store");
  return new Response(html, { status: 200, headers });
}
