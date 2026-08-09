/**
 * Engangs-import: laster "Livets Tidslinje" og "Plansjer og kortsett" (flyttet
 * inn fra butikken på Renates ønske, se _lib/seed-laeringsverksted-data.js)
 * rett inn i Læringsverksted sin lagring (KV), uten at Renate må skrive det
 * inn manuelt i byggeren. Samme mønster som seed-montessori-kurs.js.
 *
 * GET /api/seed-laeringsverksted?pw=<COURSE_EDIT_PASSWORD>
 *   -> { ok: true, resources: [{slug}, ...] } eller { error: "..." }
 *
 * Trygt å kjøre flere ganger (overskriver med samme innhold hver gang).
 * Password er det samme som ellers i Læringsverksted-byggeren.
 */
import {
  sanitizeResource, indexEntry, readIndex, KEY_PREFIX, INDEX_KEY, MAX_SIZE, DEFAULT_PASSWORD,
} from "./laeringsverksted.js";
import {
  LIVETS_TIDSLINJE, PLANSJER_OG_KORTSETT, DE_SMA_NATURUTFORSKERNE,
  SKOLEDAGBOK_1_3_TRINN, SKOLEDAGBOK_4_7_TRINN, MIA_TEO_FOLELSER,
} from "../_lib/seed-laeringsverksted-data.js";

function json(data, status) {
  return new Response(JSON.stringify(data, null, 2), {
    status: status || 200,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

export async function onRequestGet(context) {
  const { request, env } = context;
  if (!env.BUILDER_KV) return json({ error: "not_configured" }, 200);

  const url = new URL(request.url);
  const pw = (url.searchParams.get("pw") || "").trim();
  const expected = (env.COURSE_EDIT_PASSWORD || DEFAULT_PASSWORD) + "";
  if (pw !== expected) return json({ error: "bad_password" }, 401);

  const results = [];
  for (const raw of [LIVETS_TIDSLINJE, PLANSJER_OG_KORTSETT, DE_SMA_NATURUTFORSKERNE, SKOLEDAGBOK_1_3_TRINN, SKOLEDAGBOK_4_7_TRINN, MIA_TEO_FOLELSER]) {
    const resource = sanitizeResource(raw);
    if (!resource) { results.push({ error: "bad_resource_data", slug: raw && raw.slug }); continue; }
    const payload = JSON.stringify(resource);
    if (payload.length > MAX_SIZE) { results.push({ error: "too_large", slug: resource.slug, bytes: payload.length }); continue; }
    try {
      await env.BUILDER_KV.put(KEY_PREFIX + resource.slug, payload);
      const index = (await readIndex(env)).filter((r) => r && r.slug !== resource.slug);
      index.push(indexEntry(resource));
      index.sort((a, b) => (b.updated || 0) - (a.updated || 0));
      await env.BUILDER_KV.put(INDEX_KEY, JSON.stringify(index));
      results.push({ ok: true, slug: resource.slug });
    } catch (e) {
      results.push({ error: "write_failed", slug: resource.slug, detail: String(e) });
    }
  }
  return json({ ok: results.every((r) => r.ok), resources: results });
}
