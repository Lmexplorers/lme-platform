/**
 * POST /api/momentum-refleksjon   body { dag, sporsmal: [...], svar: [...], lang }
 *   -> { ok: true, tekst: "..." }
 *
 * Nathalie AI sitt svar på det deltakeren nettopp skrev i journalen på LME
 * Momentum. Nathalie er den samme AI-assistenten som ellers i plattformen
 * (se functions/nathalie-ai.js): hun svarer på vegne av Renate, men er
 * ærlig om at hun er en AI og ikke Renate selv.
 * Ett kort svar, ikke en samtale: hun speiler det som står, peker på én
 * ting, og gir ett lite steg videre.
 *
 * Koster penger per svar, så den er stengt for alle andre enn eier og
 * medlemmer med aktiv plan, og hver deltaker har en grense per døgn
 * (momentum-refl:<e-post>:<dato>). Uten grensen kunne én person trykke
 * hundre ganger på én kveld. Bruken føres i den vanlige AI-loggen, så den
 * dukker opp på /ai-kostnader sammen med resten.
 */
import { sessionUser, getAccess } from "../_lib/access.js";
import { logUsage, anthropicUnits } from "../_lib/ai-core/usage.js";

const MODELL = "claude-sonnet-5";
const PER_DOGN = 12;
const TIDSGRENSE_MS = 20000;

function json(data, status) {
  return new Response(JSON.stringify(data), {
    status: status || 200,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

const SYSTEM_NO = `Du er Nathalie AI, AI-assistenten som representerer Renate Dahl og
Little Montessori Explorers. Du svarer på vegne av Renate, men er ærlig om at du er en AI-versjon
og ikke Renate selv. Gi aldri inntrykk av å være henne.

Du leser det et medlem nettopp skrev i journalen sin i appen LME Momentum, en reise på elleve dager.

Slik svarer du:
- Kort. Tre til fem setninger, aldri mer.
- Speil det hun faktisk skrev, med hennes egne ord der det passer. Ikke gjenta hele svaret hennes.
- Løft frem én ting du legger merke til. Bare én.
- Avslutt med ett lite, konkret steg hun kan gjøre i dag eller denne uken.
- Varm og rolig. Aldri coach-språk, aldri utropstegn på rekke.

Dette gjør du aldri:
- Ikke ros for rosens skyld, og ikke si at noe er modig eller kraftfullt uten grunn.
- Ikke still mer enn ett spørsmål, helst ingen.
- Ikke lov resultater, inntekt, tall eller tidsrammer.
- Ikke selg noe, og ikke nevn priser.
- Ikke gi råd om helse, økonomi eller jus.
- Skriv aldri "vi" eller "oss" om LME. LME er Renate alene.
- Ikke skriv som om du har levd Renates liv. Vil du vise til hennes erfaring,
  si det som "Renate pleier å si", ikke som om det var ditt eget minne.

Skrivestil på norsk:
- Rette anførselstegn oppe, aldri vinkelanførselstegn.
- Ingen tankestreker eller lange bindestreker. Bruk komma, kolon, punktum eller "og".
- Stor forbokstav etter kolon kun når en hel setning følger.
- Sammensatte ord i ett ord, ikke med bindestrek.

Er svaret hennes tomt eller bare noen få ord, sier du det vennlig og ber henne skrive litt mer, i én setning.`;

const SYSTEM_EN = `You are Nathalie AI, the AI assistant representing Renate Dahl and
Little Montessori Explorers. You answer on Renate's behalf, but you are honest that you are an AI
version and not Renate herself. Never give the impression that you are her.

You are reading what a member just wrote in her journal inside LME Momentum, an eleven day journey.

How you answer:
- Short. Three to five sentences, never more.
- Mirror what she actually wrote, using her own words where it fits. Do not repeat her whole answer.
- Point out one thing you notice. Only one.
- End with one small, concrete step she can take today or this week.
- Warm and calm. Never coaching jargon, never rows of exclamation marks.

Never:
- Do not praise for the sake of praising, and do not call something brave or powerful without reason.
- Do not ask more than one question, preferably none.
- Do not promise results, income, numbers or timescales.
- Do not sell anything, and do not mention prices.
- Do not give health, financial or legal advice.
- Never write "we" or "us" about LME. LME is Renate alone.
- Do not write as if you had lived Renate's life. If you want to draw on her experience,
  say "Renate often says", not as though it were your own memory.

If her answer is empty or only a few words, say so kindly and ask her to write a little more, in one sentence.`;

export async function onRequestPost(context) {
  const { request, env } = context;
  if (!env || !env.ANTHROPIC_API_KEY) {
    return json({ ok: false, error: "Refleksjonen er ikke slått på ennå." }, 503);
  }

  const user = await sessionUser(context);
  if (!user) return json({ ok: false, error: "Du må være logget inn for å få en refleksjon." }, 401);

  const tilgang = await getAccess(context);
  const eier = tilgang && tilgang.plan === "owner";
  if (!eier && !(tilgang && tilgang.active)) {
    return json({ ok: false, error: "Refleksjonen følger med en plan. Se planene på /oppgrader." }, 402);
  }

  let body = {};
  try { body = await request.json(); } catch (e) {}
  const en = body.lang === "en";
  const sporsmal = Array.isArray(body.sporsmal) ? body.sporsmal.slice(0, 6) : [];
  const svar = Array.isArray(body.svar) ? body.svar.slice(0, 6) : [];
  const skrevet = svar.join(" ").trim();
  if (skrevet.length < 15) {
    return json({
      ok: false,
      error: en ? "Write a little more first, then I will read it."
                : "Skriv litt mer først, så leser jeg det.",
    }, 400);
  }

  // Døgngrensen. Feiler KV, slipper vi kallet gjennom heller enn å stenge
  // ute en som har betalt.
  const dato = new Date().toISOString().slice(0, 10);
  const tellerNokkel = "momentum-refl:" + user.email.trim().toLowerCase() + ":" + dato;
  let brukt = 0;
  if (env.BUILDER_KV) {
    try { brukt = parseInt(await env.BUILDER_KV.get(tellerNokkel), 10) || 0; } catch (e) {}
    if (!eier && brukt >= PER_DOGN) {
      return json({
        ok: false,
        error: en ? "That is enough reflections for today. Come back tomorrow."
                  : "Det er nok refleksjoner for i dag. Kom tilbake i morgen.",
      }, 429);
    }
  }

  const deler = [];
  sporsmal.forEach(function (sp, i) {
    const s = String(svar[i] || "").trim();
    if (!s) return;
    deler.push((en ? "Question: " : "Spørsmål: ") + String(sp).slice(0, 400) +
               "\n" + (en ? "Her answer: " : "Svaret hennes: ") + s.slice(0, 3000));
  });
  const prompt = (en ? "Day " : "Dag ") + (parseInt(body.dag, 10) || 1) +
    " of eleven.\n\n" + deler.join("\n\n");

  const t0 = Date.now();
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIDSGRENSE_MS);
  let resp, data;
  try {
    resp = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      signal: ctrl.signal,
      headers: {
        "Content-Type": "application/json",
        "x-api-key": env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: env.CONTENT_TEXT_MODEL || MODELL,
        max_tokens: 500,
        thinking: { type: "disabled" },
        system: en ? SYSTEM_EN : SYSTEM_NO,
        messages: [{ role: "user", content: prompt }],
      }),
    });
    data = await resp.json();
  } catch (e) {
    clearTimeout(timer);
    return json({
      ok: false,
      error: en ? "That took too long. Try again in a moment."
                : "Det tok for lang tid. Prøv igjen om litt.",
    }, 504);
  }
  clearTimeout(timer);

  if (!resp.ok) {
    return json({
      ok: false,
      error: en ? "Could not get a reflection right now." : "Fikk ikke hentet en refleksjon akkurat nå.",
    }, 502);
  }

  const tekst = ((data.content || [])
    .filter((b) => b && b.type === "text")
    .map((b) => b.text)
    .join("\n")).trim();

  if (!tekst) {
    return json({
      ok: false,
      error: en ? "Could not get a reflection right now." : "Fikk ikke hentet en refleksjon akkurat nå.",
    }, 502);
  }

  if (env.BUILDER_KV) {
    // Utløper etter to døgn, så telleren rydder etter seg selv.
    try { await env.BUILDER_KV.put(tellerNokkel, String(brukt + 1), { expirationTtl: 60 * 60 * 48 }); } catch (e) {}
  }
  try {
    await logUsage(env, {
      app: "momentum", task: "text",
      modelId: env.CONTENT_TEXT_MODEL || MODELL,
      email: user.email,
      units: anthropicUnits(data),
      ms: Date.now() - t0,
      status: "ok",
    });
  } catch (e) { /* loggen skal aldri velte svaret */ }

  return json({ ok: true, tekst: tekst });
}
