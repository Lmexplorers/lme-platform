/**
 * Engelsk lenke-alias: /calm-mornings
 *
 * Samme prinsipp som functions/free-youtube-course.js: lenke-forhåndsvisning
 * (Instagram/Facebook/iMessage) leser <title>/<meta description>/og:-tagger
 * direkte fra HTML-en uten å kjøre JS, så de må være engelske i selve
 * responsen for denne stien, ikke bare byttet av skriptet i nettleseren.
 */
export async function onRequestGet(context) {
  const res = await context.env.ASSETS.fetch(new URL("/funnel/rolige-morgener/opt-in.html", context.request.url));
  let html = await res.text();

  html = html
    .replace('<html lang="no">', '<html lang="en">')
    .replace(
      "<title>Rolige morgener-utfordringen · LME</title>",
      "<title>The Calm Mornings Challenge · LME</title>"
    )
    .replace(
      '<meta name="description" content="Gratis 5-dagers utfordring: fem enkle morgengrep for roligere morgener, rett i innboksen din.">',
      '<meta name="description" content="Free 5-day challenge: five simple morning habits for calmer mornings, sent straight to your inbox.">'
    )
    .replace(
      '<meta property="og:title" content="Rolige morgener-utfordringen · LME">',
      '<meta property="og:title" content="The Calm Mornings Challenge · LME">'
    )
    .replace(
      '<meta property="og:description" content="Gratis 5-dagers utfordring: fem enkle morgengrep for roligere morgener, rett i innboksen din.">',
      '<meta property="og:description" content="Free 5-day challenge: five simple morning habits for calmer mornings, sent straight to your inbox.">'
    )
    .replace(
      '<meta property="og:url" content="https://lmexplorers.com/rolige-morgener">',
      '<meta property="og:url" content="https://lmexplorers.com/calm-mornings">'
    );

  const headers = new Headers(res.headers);
  headers.set("Content-Type", "text/html; charset=UTF-8");
  headers.set("Cache-Control", "no-store");
  return new Response(html, { status: 200, headers });
}
