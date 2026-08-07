/**
 * GET /api/course-access?course=<id>&t=<token>
 * -> { ok: true|false }
 *
 * Leses av js/course-gate.js på de låste kurssidene. Ingen innlogging,
 * token er den personlige tilgangslenken kjøperen/gratis-bekrefteren
 * fikk i e-posten (se functions/_lib/course-access.js).
 */
import { checkCourseAccess } from "../_lib/course-access.js";

function json(data, status) {
  return new Response(JSON.stringify(data), {
    status: status || 200,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store", "Access-Control-Allow-Origin": "*" },
  });
}

export async function onRequestGet(context) {
  const { request, env } = context;
  if (!env.BUILDER_KV) return json({ ok: false }, 503);
  const url = new URL(request.url);
  const course = (url.searchParams.get("course") || "").trim();
  const token = (url.searchParams.get("t") || "").trim();
  if (!course || !token) return json({ ok: false }, 400);
  const ok = await checkCourseAccess(env, course, token);
  return json({ ok });
}
