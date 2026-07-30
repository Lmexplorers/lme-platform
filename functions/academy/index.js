/**
 * Legacy /academy path redirects to /kurs (new Kurs/Classes hub)
 */
export async function onRequestGet(context) {
  return new Response(null, {
    status: 301,
    headers: { "Location": "/kurs" }
  });
}
