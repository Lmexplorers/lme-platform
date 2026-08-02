/**
 * GET /api/faq/list
 * Henter alle publiserte FAQ-er fra KV
 */
export async function onRequest(context) {
  const { env } = context;

  try {
    // Les FAQ-liste fra KV
    const faqJson = await env.BUILDER_KV.get('faq:all');
    const faqs = faqJson ? JSON.parse(faqJson) : [];

    return new Response(JSON.stringify({
      faq: faqs,
      count: faqs.length
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (e) {
    return new Response(JSON.stringify({
      error: 'Kunne ikke hente FAQ-er',
      faq: []
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
