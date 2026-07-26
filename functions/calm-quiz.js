/**
 * Engelsk lenke-alias: /calm-quiz
 *
 * Samme prinsipp som functions/free-youtube-course.js: lenke-forhåndsvisning
 * (Instagram/Facebook/iMessage) leser <title>/<meta>-tagger direkte fra
 * HTML-en uten å kjøre JS, så de må være engelske i selve responsen for
 * denne stien, ikke bare byttet av skriptet i nettleseren.
 */
export async function onRequestGet(context) {
  const res = await context.env.ASSETS.fetch(new URL("/funnel/ro-quiz/index.html", context.request.url));
  let html = await res.text();

  html = html
    .replace('<html lang="no">', '<html lang="en">')
    .replace(
      "<title>Hva stjeler roen i hjemmet ditt? · LME</title>",
      "<title>What's stealing the calm in your home? · LME</title>"
    )
    .replace(
      '<meta name="description" content="Ta den lille gratisquizen og finn den største ro-tyven hjemme hos deg, og hva som hjelper mest akkurat nå.">',
      '<meta name="description" content="Take the short free quiz and find your biggest calm-thief at home, and what helps most right now.">'
    )
    .replace(
      '<meta property="og:title" content="Hva stjeler roen i hjemmet ditt?">',
      '<meta property="og:title" content="What\'s stealing the calm in your home?">'
    )
    .replace(
      '<meta property="og:description" content="Ta den lille gratisquizen og finn den største ro-tyven hjemme hos deg. Seks spørsmål, svar med en gang.">',
      '<meta property="og:description" content="Take the free quiz and find your biggest calm-thief at home. Six questions, instant answer.">'
    )
    .replace(
      '<meta property="og:url" content="https://lmexplorers.com/ro-quiz">',
      '<meta property="og:url" content="https://lmexplorers.com/calm-quiz">'
    )
    .replace(
      '<meta name="twitter:title" content="Hva stjeler roen i hjemmet ditt?">',
      '<meta name="twitter:title" content="What\'s stealing the calm in your home?">'
    )
    .replace(
      '<meta name="twitter:description" content="Ta den lille gratisquizen og finn den største ro-tyven hjemme hos deg.">',
      '<meta name="twitter:description" content="Take the free quiz and find your biggest calm-thief at home.">'
    );

  const headers = new Headers(res.headers);
  headers.set("Content-Type", "text/html; charset=UTF-8");
  headers.set("Cache-Control", "no-store");
  return new Response(html, { status: 200, headers });
}
