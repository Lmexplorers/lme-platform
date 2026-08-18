/**
 * GET /api/course-access?course=<id>&t=<token>
 * -> { ok: true|false }
 *
 * Leses av js/course-gate.js på de låste kurssidene. Ingen innlogging,
 * token er den personlige tilgangslenken kjøperen/gratis-bekrefteren
 * fikk i e-posten (se functions/_lib/course-access.js).
 *
 * POST /api/course-access
 * body { course, t?: courseToken, modules?: [{key, token}, ...] }
 * -> { ok, courseUnlocked, unlockedModules: [key, ...] }
 *
 * Batch-sjekk brukt av modul-kortene på kurssiden (Skool-stil låsing per
 * modul): ett kall sjekker både hele-kurset-token og alle modul-tokenene
 * som ligger i localStorage for dette kurset.
 */
import { checkCourseAccess, checkModuleAccess } from "../_lib/course-access.js";

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

export async function onRequestPost(context) {
  const { request, env } = context;
  if (!env.BUILDER_KV) return json({ ok: false, courseUnlocked: false, unlockedModules: [] }, 503);
  let body;
  try {
    body = await request.json();
  } catch (e) {
    return json({ ok: false }, 400);
  }
  const course = ((body && body.course) || "").trim();
  if (!course) return json({ ok: false }, 400);

  const courseToken = ((body && body.t) || "").trim();
  const courseUnlocked = courseToken ? await checkCourseAccess(env, course, courseToken) : false;

  const modules = Array.isArray(body && body.modules) ? body.modules.slice(0, 40) : [];
  const unlockedModules = [];
  for (const m of modules) {
    const key = ((m && m.key) || "").trim();
    const token = ((m && m.token) || "").trim();
    if (!key || !token) continue;
    if (await checkModuleAccess(env, course, key, token)) unlockedModules.push(key);
  }
  return json({ ok: courseUnlocked, courseUnlocked, unlockedModules });
}
