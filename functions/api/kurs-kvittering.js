/**
 * Takkeadressen for et kurs, altså adressen medlemmet limer inn hos sin egen
 * betalingsleverandør. Bare den som eier kurset får se den, for den som har
 * adressen kan be om tilgang.
 *
 * GET  /api/kurs-kvittering?slug=<slug>   -> { ok, adresse, kjopere: [...] }
 * POST /api/kurs-kvittering  body { slug, action: "fjern", epost }
 *   -> fjerner en kjøpers tilgang igjen
 */
import { sessionUser, isOwner } from "../_lib/access.js";
import { KEY_PREFIX } from "./kurs.js";
import { hentEllerLagNokkel, lesKjopere, takkeadresse, DOGNGRENSE } from "../_lib/kurs-kvittering.js";

function json(data, status) {
  return new Response(JSON.stringify(data), {
    status: status || 200,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

/* Eier den innloggede dette kurset? Renate eier sine egne (uten eier-felt). */
async function eierKurset(context, slug) {
  const { env } = context;
  const bruker = await sessionUser(context);
  if (!bruker) return { ok: false };
  let kurs = null;
  try {
    const raw = await env.BUILDER_KV.get(KEY_PREFIX + slug);
    kurs = raw ? JSON.parse(raw) : null;
  } catch (e) { kurs = null; }
  if (!kurs) return { ok: false, mangler: true };
  const epost = (bruker.email || "").toLowerCase();
  if (isOwner(bruker)) return { ok: true, epost: epost, kurs: kurs };
  if (((kurs.eier || "") + "") === epost) return { ok: true, epost: epost, kurs: kurs };
  return { ok: false };
}

export async function onRequestGet(context) {
  const { request, env } = context;
  if (!env.BUILDER_KV) return json({ error: "not_configured" }, 200);
  const slug = (new URL(request.url).searchParams.get("slug") || "").trim().toLowerCase();
  if (!slug) return json({ error: "bad_slug" }, 400);

  const eier = await eierKurset(context, slug);
  if (!eier.ok) return json({ error: "not_yours" }, 403);

  const nokkel = await hentEllerLagNokkel(env, slug, eier.epost);
  return json({
    ok: true,
    adresse: takkeadresse(slug, nokkel.nokkel),
    kjopere: (await lesKjopere(env, slug)).map((k) => ({ epost: k.epost, navn: k.navn, ts: k.ts })),
    dogngrense: DOGNGRENSE,
  });
}

export async function onRequestPost(context) {
  const { request, env } = context;
  if (!env.BUILDER_KV) return json({ error: "not_configured" }, 200);
  let body = null;
  try { body = await request.json(); } catch (e) { return json({ error: "bad_json" }, 400); }
  const slug = ((body && body.slug) || "").trim().toLowerCase();
  const eier = await eierKurset(context, slug);
  if (!eier.ok) return json({ error: "not_yours" }, 403);

  if (body.action === "fjern") {
    const epost = ((body.epost || "") + "").trim().toLowerCase();
    const liste = await lesKjopere(env, slug);
    const igjen = [];
    for (const k of liste) {
      if ((k.epost || "") === epost) {
        // Selve tilgangsnøkkelen slettes, ikke bare oppføringen i lista.
        try { await env.BUILDER_KV.delete("course_access:" + slug + ":" + k.token); } catch (e) {}
        continue;
      }
      igjen.push(k);
    }
    await env.BUILDER_KV.put("kurs-kjopere:" + slug, JSON.stringify(igjen));
    return json({ ok: true, fjernet: liste.length - igjen.length });
  }
  return json({ error: "ukjent_handling" }, 400);
}
