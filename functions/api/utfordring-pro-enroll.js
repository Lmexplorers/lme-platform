/**
 * Internt endepunkt: melder en kjøper inn i 10 000-visninger-utfordringen
 * (dag 0-e-post + 30-dagers kø + fellesskaps-medlemskap), kalt på tvers fra
 * den separate lme-inner-circle-workeren rett etter et fullført kjøp av
 * "utfordring + Inner Circle Pro" (grunnleggerpris, se PLANS.proUtfordring
 * i workers/lme-inner-circle/worker.js). Selve Pro-medlemskapet gis av
 * workeren selv (egen D1-database, ikke tilgjengelig herfra), denne ruten
 * gjør kun utfordrings-delen, som lever i dette repoets BUILDER_KV.
 *
 *   POST /api/utfordring-pro-enroll
 *   Header: X-Internal-Secret: <UTFORDRING_ENROLL_SECRET>
 *   Body: { email, name, lang: "no"|"en" }
 *
 * Passordet settes som miljøvariabel/secret på BEGGE steder (Cloudflare
 * Pages-prosjektet her, og lme-inner-circle-workeren via
 * `wrangler secret put UTFORDRING_ENROLL_SECRET`), samme verdi begge steder.
 * Uten riktig secret avvises kallet, så ingen andre kan melde vilkårlige
 * e-poster inn i utfordringen herfra.
 */
import { enrollUtfordringMember } from "../_lib/utfordring-mail.js";
import { sendOwnerSaleNotice } from "../_lib/oppskrift-mail.js";

function json(data, status) {
  return new Response(JSON.stringify(data), {
    status: status || 200,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

export async function onRequestPost(context) {
  const { request, env } = context;
  if (!env.BUILDER_KV) return json({ error: "not_configured" }, 200);
  if (!env.UTFORDRING_ENROLL_SECRET) return json({ error: "not_configured" }, 503);

  const secret = request.headers.get("X-Internal-Secret") || "";
  if (secret !== env.UTFORDRING_ENROLL_SECRET) return json({ error: "unauthorized" }, 401);

  const body = await request.json().catch(() => ({}));
  const email = ((body.email || "") + "").trim().toLowerCase();
  if (!email || !email.includes("@")) return json({ error: "bad_email" }, 400);
  const name = ((body.name || "") + "").trim().slice(0, 60);
  const lang = body.lang === "en" ? "en" : "no";

  const result = await enrollUtfordringMember(env, { email, name, lang });
  if (!result.ok) return json(result, 500);

  try {
    await sendOwnerSaleNotice(env, {
      pname: "10 000-visninger-utfordringen + Inner Circle Pro (grunnleggerpris)",
      lang, name, email,
    });
  } catch (e) {}

  return json({ ok: true });
}
