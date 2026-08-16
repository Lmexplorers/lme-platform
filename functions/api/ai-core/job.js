/**
 * LME AI Core, felles jobbstatus.
 *
 *   GET /api/ai-core/job?id=job-...   -> én jobb
 *   GET /api/ai-core/job              -> brukerens siste jobber
 *
 * Én rute for "hvordan går det", uansett hvilken app som startet
 * genereringen. Brukeren ser bare sine egne jobber, eieren ser alle.
 *
 * Ruten gjør ingen AI-kall og koster ingenting. Den erstatter heller ikke
 * noen eksisterende polling: rutene som allerede virker fortsetter som før,
 * og skriver i tillegg hit etter hvert som de tas i bruk.
 */

import { sessionUser, isOwner } from "../../_lib/access.js";
import { readOwnJob, listJobs } from "../../_lib/ai-core/jobs.js";

function json(data, status) {
  return new Response(JSON.stringify(data), {
    status: status || 200,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

export async function onRequestGet(context) {
  const { request, env } = context;

  const user = await sessionUser(context);
  if (!user) return json({ error: "Logg inn for å se statusen." }, 401);

  const id = new URL(request.url).searchParams.get("id");
  if (!id) {
    return json({ ok: true, jobs: await listJobs(env, user.email) }, 200);
  }

  const job = await readOwnJob(env, id, user.email, isOwner(user));
  if (!job) return json({ error: "not_found" }, 404);
  return json({ ok: true, job: job }, 200);
}
