/**
 * LME AI Core, "fortsett forbi grensen" og kvitteringen.
 *
 *   GET  /api/ai-core/payg        -> { on, credit, history }
 *   POST /api/ai-core/payg  { on } -> slår på eller av
 *
 * Krever innlogging, og en bruker ser bare sitt eget. Ingen AI-kall, ingen
 * kostnad. Eier trenger den ikke (eier har ubegrenset tilgang uansett), men
 * ruten svarer likevel, så siden ikke må ha to varianter.
 */

import { sessionUser, isOwner, getAccess } from "../../_lib/access.js";
import { paygState, setPayg, history } from "../../_lib/ai-core/payg.js";

function json(data, status) {
  return new Response(JSON.stringify(data), {
    status: status || 200,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

export async function onRequestGet(context) {
  const { env } = context;
  const user = await sessionUser(context);
  if (!user) return json({ error: "Logg inn for å se dette." }, 401);

  const state = await paygState(env, user.email);
  const access = await getAccess(context);

  return json({
    ok: true,
    on: state.on,
    owner: isOwner(user),
    // Eier har ingen grense, så bryteren betyr ingenting for henne.
    relevant: !isOwner(user),
    credit: access.credit || { image: 0, video: 0 },
    limits: access.limits || null,
    history: await history(env, user.email),
  });
}

export async function onRequestPost(context) {
  const { request, env } = context;
  const user = await sessionUser(context);
  if (!user) return json({ error: "Logg inn for å endre dette." }, 401);

  let body;
  try { body = await request.json(); } catch (e) { return json({ error: "bad_json" }, 400); }
  if (typeof body.on !== "boolean") return json({ error: "Mangler på eller av." }, 400);

  const state = await setPayg(env, user.email, body.on);
  return json({ ok: true, on: state.on, history: await history(env, user.email) });
}
