/**
 * LME nyhetsbrev-statistikk (kun for eier) — Cloudflare Pages Function.
 *
 *   GET /api/newsletter-stats
 *
 * Erstatter /api/mailerlite/stats + /api/mailerlite/campaigns (fjernet
 * 12. august 2026). Teller abonnenter direkte fra plattformens egen liste
 * (BUILDER_KV, nl:<e-post>), gruppert etter kilde (funnel/produkt), i
 * stedet for å hente tall fra en ekstern MailerLite-konto.
 */
import { sessionUser } from "../_lib/access.js";

const OWNER_EMAILS = ["renateshobby@hotmail.com", "renate@lmexplorers.com"];
const isOwner = (u) => !!(u && (u.role === "owner" || u.role === "admin" ||
  OWNER_EMAILS.indexOf(String(u.email || "").toLowerCase()) !== -1));

function json(data, status) {
  return new Response(JSON.stringify(data), {
    status: status || 200,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

export async function onRequestGet(context) {
  const { env } = context;
  const user = await sessionUser(context);
  if (!isOwner(user)) return json({ error: "forbidden" }, 403);
  if (!env.BUILDER_KV) return json({ total: 0, bySource: {} });

  let total = 0;
  const bySource = {};
  let cursor;
  try {
    do {
      const list = await env.BUILDER_KV.list({ prefix: "nl:", cursor: cursor });
      for (const k of list.keys) {
        const raw = await env.BUILDER_KV.get(k.name);
        if (!raw) continue;
        let rec;
        try { rec = JSON.parse(raw); } catch (e) { continue; }
        total++;
        const src = rec.source || "ukjent";
        bySource[src] = (bySource[src] || 0) + 1;
      }
      cursor = list.list_complete ? null : list.cursor;
    } while (cursor);
  } catch (e) {
    return json({ error: "kv_failed" }, 200);
  }

  return json({ total: total, bySource: bySource });
}
