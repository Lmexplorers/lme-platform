/**
 * Medlemmets egen e-postliste.
 *
 * GET  /api/min-epost            -> { ok, liste: [...], antall }
 * GET  /api/min-epost?csv=1      -> CSV-fil til nedlasting
 * POST /api/min-epost  { action: "fjern", epost }
 * POST /api/min-epost  { action: "legg-til", epost, navn }
 *
 * Bare den innloggede eierens egen liste. Renates abonnenter (nl:<e-post>)
 * røres aldri herfra.
 */
import { sessionUser } from "../_lib/access.js";
import { hentListe, fjern, leggTil, tilCsv } from "../_lib/medlem-liste.js";

function json(data, status) {
  return new Response(JSON.stringify(data), {
    status: status || 200,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

export async function onRequestGet(context) {
  const { request, env } = context;
  if (!env.BUILDER_KV) return json({ error: "not_configured" }, 200);
  const bruker = await sessionUser(context);
  if (!bruker) return json({ ok: false, loggedIn: false }, 200);
  const eier = (bruker.email || "").toLowerCase();
  const liste = await hentListe(env, eier);

  if (new URL(request.url).searchParams.get("csv") === "1") {
    return new Response(tilCsv(liste), {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="e-postlista-mi.csv"',
        "Cache-Control": "no-store",
      },
    });
  }
  return json({ ok: true, loggedIn: true, antall: liste.length, liste: liste });
}

export async function onRequestPost(context) {
  const { request, env } = context;
  if (!env.BUILDER_KV) return json({ error: "not_configured" }, 200);
  const bruker = await sessionUser(context);
  if (!bruker) return json({ error: "not_logged_in" }, 401);
  const eier = (bruker.email || "").toLowerCase();

  let body = null;
  try { body = await request.json(); } catch (e) { return json({ error: "bad_json" }, 400); }

  if (body.action === "fjern") {
    await fjern(env, eier, (body.epost || "") + "");
    return json({ ok: true });
  }
  if (body.action === "legg-til") {
    const r = await leggTil(env, eier, {
      epost: (body.epost || "") + "", navn: (body.navn || "") + "",
      kilde: "lagt inn av deg", sprak: body.sprak,
    });
    return json(r.ok ? { ok: true } : { error: "bad_email" }, r.ok ? 200 : 400);
  }
  return json({ error: "ukjent_handling" }, 400);
}
