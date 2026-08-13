/**
 * LME VideoFlow, audio-to-idea transcription.
 *
 * Lets the idea input come from a recorded or uploaded audio note instead
 * of typing, matching the tagline ("Turn any idea, text or audio into a
 * ready-to-post video"). Uses OpenAI Whisper (reuses OPENAI_API_KEY, no new
 * secret) to transcribe; the resulting text is dropped into the idea field
 * and used exactly like a typed idea by /api/videoflow/script.
 *
 * POST /api/videoflow/transcribe   multipart/form-data { audio?, confirm }
 *   confirm !== "true" -> dry run (audio not required): { paid:true, creditCost }
 *   confirm === "true" -> real Whisper call, debits CREDIT_COSTS.transcribe
 *                       -> { ok:true, text, balance }
 *
 * Max 15MB / roughly 3 minutes per note, keeps cost and request size sane.
 */
import { sessionUser } from "../../_lib/access.js";
import { enforceVideoFlow, refundVideoFlow } from "../../_lib/videoflow-access.js";
import { transcribeAudio, transcribeProviderConfigured, CREDIT_COSTS } from "../../_lib/videoflow-providers.js";

const MAX_BYTES = 15 * 1024 * 1024;

function json(data, status) {
  return new Response(JSON.stringify(data), {
    status: status || 200,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

export async function onRequestPost(context) {
  const { request, env } = context;
  const user = await sessionUser(context);
  if (!user) return json({ error: "Logg inn for å bruke VideoFlow." }, 401);

  let form;
  try { form = await request.formData(); } catch (e) { return json({ error: "bad_form" }, 400); }
  const confirm = form.get("confirm") === "true";

  if (!confirm) {
    return json({
      paid: true, creditCost: CREDIT_COSTS.transcribe,
      note: "Dry run, no API call made. Send the audio with confirm:true to actually transcribe (costs " + CREDIT_COSTS.transcribe + " credits, flat, up to ~3 minutes).",
    }, 200);
  }

  const file = form.get("audio");
  if (!file || typeof file.arrayBuffer !== "function") return json({ error: "Mangler lydfil." }, 400);
  if (file.size > MAX_BYTES) return json({ error: "Lydnotatet er for stort (maks 15 MB, ca. 3 minutter)." }, 413);

  if (!transcribeProviderConfigured(env)) return json({ error: "not_configured", detail: "OPENAI_API_KEY mangler." }, 200);

  const gate = await enforceVideoFlow(context, CREDIT_COSTS.transcribe);
  if (!gate.ok) return json({ error: gate.error, needCredits: gate.needCredits || false, balance: gate.balance }, gate.status);

  let text;
  try {
    text = await transcribeAudio(env, file);
  } catch (e) {
    if (!gate.owner) await refundVideoFlow(context, gate.email, CREDIT_COSTS.transcribe);
    return json({ error: "Klarte ikke å transkribere lydnotatet.", detail: String((e && e.message) || e).slice(0, 200) }, 200);
  }

  return json({ ok: true, text, balance: gate.owner ? null : gate.balance }, 200);
}

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "POST, OPTIONS", "Access-Control-Allow-Headers": "Content-Type" } });
}
