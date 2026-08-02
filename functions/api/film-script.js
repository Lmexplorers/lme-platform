import { sessionUser } from "../_lib/access.js";
/**
 * LME Film-orkestrator, steg 1: manus.
 *
 * Gjør én idé om til et ferdig Mia og Teo filmmanus med scener, fortellerstemme
 * (norsk + engelsk) og en bildebeskrivelse per scene som resten av orkesteret
 * bruker (bilde -> animasjon -> stemme). Bruker Claude (ANTHROPIC_API_KEY).
 *
 *   POST /api/film-script  { idea, goal, scenes, lang }
 *     -> { titleNo, titleEn, scenes: [ { narrationNo, narrationEn, imagePrompt, motion } ] }
 *
 * Krever innlogget bruker.
 */

function json(data, status) {
  return new Response(JSON.stringify(data), {
    status: status || 200,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

const MIA_TEO_LOOK =
  "MIA: girl about 5, golden-blonde hair in a high ponytail with a pink bow, big blue eyes, rose-pink floral dress, white socks and pink sneakers. " +
  "TEO: boy about 5, tousled chestnut-brown hair, brown eyes, yellow striped t-shirt, blue denim shorts, olive-green backpack. " +
  "High-end 3D Pixar/Disney animated feature-film still, cinematic wide 16:9 composition, soft volumetric lighting, gentle depth of field, rich detail, expressive faces, warm and wholesome, child-friendly.";

export async function onRequestPost(context) {
  const { request, env } = context;
  if (!env.BUILDER_KV) return json({ error: "not_configured" }, 200);
  const user = await sessionUser(context);
  if (!user) return json({ error: "Logg inn for å bruke filmgeneratoren." }, 401);
  if (!env.ANTHROPIC_API_KEY) return json({ error: "not_configured" }, 200);

  let body;
  try { body = await request.json(); } catch (e) { return json({ error: "bad_json" }, 400); }

  const idea = String(body.idea || "").slice(0, 600).trim();
  const goal = String(body.goal || "").slice(0, 200).trim();
  let n = parseInt(body.scenes, 10); if (!isFinite(n) || n < 2) n = 4; if (n > 8) n = 8;
  if (!idea) return json({ error: "Skriv en idé for filmen." }, 400);

  const sys =
    "You write short, gentle, wholesome children's learning films starring two fixed characters, Mia and Teo. " +
    "They explore nature, learn through discovery, and grow together. Always keep them child-friendly: no violence, no scary or adult content, no real people. " +
    "You will be given an idea, an optional learning goal, and a number of scenes. " +
    "Return ONLY valid JSON (no markdown, no commentary) with this exact shape: " +
    '{"titleNo":"","titleEn":"","scenes":[{"narrationNo":"","narrationEn":"","imagePrompt":"","motion":""}]}. ' +
    "narrationNo is one warm sentence of Norwegian narration for the scene; narrationEn is the English translation. " +
    "imagePrompt is an English description of a single still image of the scene, and MUST begin with this exact character description so the look stays consistent: \"" +
    MIA_TEO_LOOK + "\" then add the specific setting and action. " +
    "motion is a short English description of gentle camera/character motion for that scene. " +
    "Make exactly the requested number of scenes, in order, telling one small story that teaches the goal.";

  const usr = "Idea: " + idea + "\nLearning goal: " + (goal || "(gentle everyday learning)") + "\nNumber of scenes: " + n;

  let data;
  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": env.ANTHROPIC_API_KEY, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({
        model: "claude-sonnet-5",
        max_tokens: 3000,
        system: sys,
        messages: [{ role: "user", content: usr }],
      }),
    });
    data = await r.json().catch(() => null);
  } catch (e) {
    return json({ error: "Kom ikke i kontakt med manus-modellen." }, 502);
  }

  const txt = data && data.content && data.content[0] && data.content[0].text;
  if (!txt) return json({ error: "Fikk ikke noe manus tilbake." }, 200);

  let script = null;
  try { script = JSON.parse(txt); } catch (e) {
    const m = txt.match(/\{[\s\S]*\}/);
    if (m) { try { script = JSON.parse(m[0]); } catch (e2) {} }
  }
  if (!script || !Array.isArray(script.scenes) || !script.scenes.length) {
    return json({ error: "Klarte ikke å lese manuset. Prøv igjen." }, 200);
  }

  // Rens til trygge strenger.
  const scenes = script.scenes.slice(0, n).map(function (s) {
    return {
      narrationNo: String((s && s.narrationNo) || "").slice(0, 400),
      narrationEn: String((s && s.narrationEn) || "").slice(0, 400),
      imagePrompt: String((s && s.imagePrompt) || "").slice(0, 900),
      motion: String((s && s.motion) || "gentle cinematic camera movement, soft and calm").slice(0, 300),
    };
  });

  return json({
    titleNo: String(script.titleNo || "").slice(0, 120),
    titleEn: String(script.titleEn || "").slice(0, 120),
    scenes: scenes,
  });
}
