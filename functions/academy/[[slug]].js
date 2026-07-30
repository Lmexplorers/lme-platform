/**
 * Legacy /academy/<slug> course paths redirect to /kurs/<slug>
 *
 * Examples:
 *   /academy/intro          → /kurs/intro
 *   /academy/3-6            → /kurs/3-6
 *   /academy/forberedt-miljo → /kurs/forberedt-miljo
 */
export async function onRequestGet(context) {
  const pathname = new URL(context.request.url).pathname;
  // Extract slug from /academy/<slug>
  const match = pathname.match(/^\/academy\/([^\/]+)$/);

  if (match && match[1]) {
    const slug = match[1];
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
