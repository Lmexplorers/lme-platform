/**
 * Kurssider: /academy/kurs/<adresse> (legacy - redirects to /kurs)
 *
 * Redirects old /academy/kurs paths to the new /kurs system.
 * New courses are served from /kurs/<slug> via /functions/kurs/[[slug]].js
 */
export async function onRequestGet(context) {
  const pathname = new URL(context.request.url).pathname;
  const slug = pathname.match(/\/academy\/kurs\/([^\/]+)/)?.[1];

  if (slug) {
    return new Response(null, {
      status: 301,
      headers: { "Location": `/kurs/${slug}` }
    });
  }

  // Fallback to /kurs main page
  return new Response(null, {
    status: 301,
    headers: { "Location": "/kurs" }
  });
}
