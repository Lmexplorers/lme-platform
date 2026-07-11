/**
 * Renate AI — minne om brukeren (Cloudflare KV)
 *
 * Renate AI bygger et lite minne om hver innlogget bruker (mål, nisje,
 * hvor langt de er kommet i reisen Lær, Skap, Bli synlig, Selg, Voks),
 * slik at hun kan veilede bedre. Minnet oppdateres automatisk av
 * /renate-ai etter samtaler, og brukeren har fullt innsyn her:
 * les, rediger og slett på /min-konto (fanen Profil).
 *
 * Lagring i KV: renateprofile:<uid> -> ren tekst (maks 4000 tegn)
 *
 * API:
 *   GET  /api/renate-profile            -> { loggedIn, memory }
 *   POST /api/renate-profile {memory}   -> { ok }  (tom tekst sletter minnet)
 */

const MAX_MEMORY = 4000;

function json(data, status) {
  return new Response(JSON.stringify(data), {
    status: status || 200,
    headers: { "Content-Type": "application/json" },
  });
}

function readCookies(request) {
  const out = {};
  (request.headers.get("Cookie") || "").split(";").forEach((p) => {
    const i = p.indexOf("=");
    if (i > 0) out[p.slice(0, i).trim()] = p.slice(i + 1).trim();
  });
  return out;
}

async function sessionFrom(context) {
  const { request, env } = context;
  const sid = readCookies(request)["lme_sess"];
  if (!sid || !env.BUILDER_KV) return null;
  const raw = await env.BUILDER_KV.get("sess:" + sid);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch (e) { return null; }
}

export function profileKey(uid) {
  return "renateprofile:" + uid;
}

export async function onRequestGet(context) {
  const { env } = context;
  if (!env.BUILDER_KV) return json({ loggedIn: false, memory: null });

  const sess = await sessionFrom(context);
  if (!sess || !sess.uid) return json({ loggedIn: false, memory: null });

  const memory = await env.BUILDER_KV.get(profileKey(sess.uid));
  return json({ loggedIn: true, memory: memory || null });
}

export async function onRequestPost(context) {
  const { request, env } = context;
  if (!env.BUILDER_KV) return json({ error: "not_configured" }, 500);

  const sess = await sessionFrom(context);
  if (!sess || !sess.uid) return json({ loggedIn: false, error: "ikke innlogget" }, 401);

  let body;
  try { body = await request.json(); } catch (e) { return json({ error: "Ugyldig JSON" }, 400); }

  const memory = typeof body.memory === "string" ? body.memory.trim() : "";
  if (!memory) {
    await env.BUILDER_KV.delete(profileKey(sess.uid));
    return json({ ok: true, deleted: true });
  }
  if (memory.length > MAX_MEMORY) {
    return json({ error: "Minnet er for langt (maks " + MAX_MEMORY + " tegn)." }, 413);
  }

  await env.BUILDER_KV.put(profileKey(sess.uid), memory);
  return json({ ok: true });
}
