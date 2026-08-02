/**
 * POST /api/faq/publish
 * Publiserer FAQ-er til KV (lagrer dem for /faq siden)
 * Body: { faq: [{q: "...", a: "..."}, ...] }
 */
export async function onRequest(context) {
  const { request, env } = context;

  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const body = await request.json();
    const newFaqs = body.faq || [];

    if (!Array.isArray(newFaqs) || !newFaqs.length) {
      return new Response(JSON.stringify({ error: 'Ingen FAQ-er å publisere' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Hent eksisterende FAQ-er
    const existingJson = await env.BUILDER_KV.get('faq:all');
    const existing = existingJson ? JSON.parse(existingJson) : [];

    // Legg til nye FAQ-er (eller replace hvis de finnes)
    const merged = [...existing];
    for (const newFaq of newFaqs) {
      const idx = merged.findIndex(f => f.q === newFaq.q);
      if (idx >= 0) {
        merged[idx] = newFaq;
      } else {
        merged.push(newFaq);
      }
    }

    // Lagre tilbake til KV
    await env.BUILDER_KV.put('faq:all', JSON.stringify(merged));

    return new Response(JSON.stringify({
      success: true,
      message: `${newFaqs.length} FAQ-er publisert`,
      total: merged.length
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (e) {
    console.error('FAQ publish error:', e);
    return new Response(JSON.stringify({
      error: 'Kunne ikke publisere FAQ-er',
      detail: e.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
