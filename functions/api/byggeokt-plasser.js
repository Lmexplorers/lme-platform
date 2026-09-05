/**
 * Plasser igjen til byggeøkten 24. september.
 *
 * GET /api/byggeokt-plasser -> { plasser, solgt, igjen }
 *
 * Telleren økes av webhooken (functions/api/oppskrift-webhook.js) hver gang
 * en billett faktisk er betalt, så tallet på salgssiden er ekte og ikke et
 * påfunn. Er KV utilgjengelig, svarer vi med at alle plassene er ledige:
 * heller en solgt plass for mye enn en kjøper som får beskjed om at det er
 * fullt når det ikke er det.
 */

export const BYGGEOKT_PLASSER = 20;
export const BYGGEOKT_SOLGT_KEY = "byggeokt:solgt";

/* Øker telleren med én. Kalles fra webhooken, alltid i try/catch der, så
   en teller som ikke lar seg skrive aldri stopper en leveranse. */
export async function tellByggeoktSalg(env) {
  if (!env.BUILDER_KV) return;
  let n = 0;
  try {
    const raw = await env.BUILDER_KV.get(BYGGEOKT_SOLGT_KEY);
    n = parseInt(raw || "0", 10) || 0;
  } catch (e) { n = 0; }
  await env.BUILDER_KV.put(BYGGEOKT_SOLGT_KEY, String(n + 1));
}

export async function onRequestGet(context) {
  const { env } = context;
  let solgt = 0;
  try {
    if (env.BUILDER_KV) {
      const raw = await env.BUILDER_KV.get(BYGGEOKT_SOLGT_KEY);
      solgt = parseInt(raw || "0", 10) || 0;
    }
  } catch (e) { solgt = 0; }
  const igjen = Math.max(0, BYGGEOKT_PLASSER - solgt);
  return new Response(JSON.stringify({ plasser: BYGGEOKT_PLASSER, solgt, igjen }), {
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}
