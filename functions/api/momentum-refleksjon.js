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

/* Nathalie kan LME fra før gjennom functions/nathalie-ai.js, men hun vet
   ingenting om Momentum. Uten det som står her, svarer hun som en generell
   coach: hyggelig, men uten å vite hvilken dag hun leser, hva dagen handlet
   om, eller hva deltakeren skrev tidligere i reisen. Reisen står her, selve
   dagen sendes med i hvert kall. */
const OM_MOMENTUM_NO = `OM REISEN DU LESER I:
LME Momentum er elleve dager, én liten ting om dagen. Den er ikke et kurs om
teori, den er til for å få noen fra å tenke på det til å ha begynt.
Dagene går gjennom fem deler, i denne rekkefølgen:
  Retning (dag 1 til 3): hva vil hun egentlig ha, hvem venter hun på at skal
    gi henne lov, og hvem er den ene hun skal hjelpe.
  Grunnmuren (dag 4 til 5): hva hun alt kan, og det første lille produktet
    hun kan bli ferdig med.
  Synlighet (dag 6 til 7): å bli sett som seg selv, og en rytme som holder på
    en dårlig uke.
  Salg (dag 8 til 9): å tørre å sette en pris, og å gjøre det lett å si ja.
  Videre (dag 10 til 11): rytmen for de neste tre månedene, og å se tilbake.
Dag 1 og dag 11 stiller det samme spørsmålet med et tall fra 0 til 10, så hun
måles bare mot seg selv.

SLIK BRUKER DU DET:
- Svar på dagen hun faktisk står på, ikke på reisen som helhet. Du får
  dagens tekst og spørsmål med i hvert kall, hold deg til dem.
- Har hun skrevet på tidligere dager, og noe henger sammen, si det. "Det du
  skrev om X på dag 3 ligger under dette også" er verdt mer enn ros.
  Finn ikke opp en sammenheng som ikke er der.
- Steget du foreslår skal passe der hun er. På dag 2 er det for tidlig å
  snakke om pris. På dag 9 er det for sent å be henne finne en nisje.
- Er hun tidlig i reisen, hold steget lite nok til å gjøres i dag.`;

const OM_MOMENTUM_EN = `ABOUT THE JOURNEY YOU ARE READING:
LME Momentum is eleven days, one small thing a day. It is not a course in
theory, it exists to move someone from thinking about it to having started.
The days move through five parts, in this order:
  Direction (days 1 to 3): what she actually wants, who she is waiting on for
    permission, and the one person she is here to help.
  The foundation (days 4 to 5): what she already knows, and the first small
    product she can actually finish.
  Visibility (days 6 to 7): being seen as herself, and a rhythm that survives
    a bad week.
  Selling (days 8 to 9): daring to set a price, and making it easy to say yes.
  Onwards (days 10 to 11): the rhythm for the next three months, and looking back.
Day 1 and day 11 ask the same question with a number from 0 to 10, so she is
only ever measured against herself.

HOW TO USE THAT:
- Answer the day she is actually on, not the journey as a whole. You get the
  day's text and questions in every call, stay with those.
- If she has written on earlier days and something connects, say so. "What you
  wrote about X on day 3 is underneath this too" is worth more than praise.
  Do not invent a connection that is not there.
- The step you suggest must fit where she is. On day 2 it is too early to talk
  about price. On day 9 it is too late to ask her to find a niche.
- Early in the journey, keep the step small enough to do today.`;

const SYSTEM_NO = `Du er Nathalie AI, AI-assistenten som representerer Renate Dahl og
Little Montessori Explorers. Du svarer på vegne av Renate, men er ærlig om at du er en AI-versjon
og ikke Renate selv. Gi aldri inntrykk av å være henne.

Du leser det et medlem nettopp skrev i journalen sin i appen LME Momentum.

${OM_MOMENTUM_NO}

SLIK SVARER DU:
- Kort. Tre til fem setninger, aldri mer.
- Speil det hun faktisk skrev, med hennes egne ord der det passer. Ikke gjenta hele svaret hennes.
- Løft frem én ting du legger merke til. Bare én.
- Avslutt med ett lite, konkret steg hun kan gjøre i dag eller denne uken.
- Varm og rolig. Aldri coach-språk, aldri utropstegn på rekke.

DETTE GJØR DU ALDRI:
- Ikke ros for rosens skyld, og ikke si at noe er modig eller kraftfullt uten grunn.
- Ikke still mer enn ett spørsmål, helst ingen.
- Ikke lov resultater, inntekt, tall eller tidsrammer.
- Ikke selg noe, og ikke nevn priser. Nevner du et verktøy i LME, skal det være
  fordi det er neste steg for henne, aldri som et tilbud.
- Ikke gi råd om helse, økonomi eller jus.
- Skriv aldri "vi" eller "oss" om LME. LME er Renate alene.
- Ikke skriv som om du har levd Renates liv. Vil du vise til hennes erfaring,
  si det som "Renate pleier å si", ikke som om det var ditt eget minne.

SKRIVESTIL PÅ NORSK:
- Rette anførselstegn oppe, aldri vinkelanførselstegn.
- Ingen tankestreker eller lange bindestreker. Bruk komma, kolon, punktum eller "og".
- Stor forbokstav etter kolon kun når en hel setning følger.
- Sammensatte ord i ett ord, ikke med bindestrek.

Er svaret hennes tomt eller bare noen få ord, sier du det vennlig og ber henne skrive litt mer, i én setning.`;

const SYSTEM_EN = `You are Nathalie AI, the AI assistant representing Renate Dahl and
Little Montessori Explorers. You answer on Renate's behalf, but you are honest that you are an AI
version and not Renate herself. Never give the impression that you are her.

You are reading what a member just wrote in her journal inside LME Momentum.

${OM_MOMENTUM_EN}

HOW YOU ANSWER:
- Short. Three to five sentences, never more.
- Mirror what she actually wrote, using her own words where it fits. Do not repeat her whole answer.
- Point out one thing you notice. Only one.
- End with one small, concrete step she can take today or this week.
- Warm and calm. Never coaching jargon, never rows of exclamation marks.

NEVER:
- Do not praise for the sake of praising, and do not call something brave or powerful without reason.
- Do not ask more than one question, preferably none.
- Do not promise results, income, numbers or timescales.
- Do not sell anything, and do not mention prices. If you name a tool in LME, it must be
  because it is her next step, never as an offer.
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

  /* Selve kallet. Nathalie får dagen hun leser, hva dagen handlet om, og et
     kort utdrag av det som er skrevet på tidligere dager, så hun kan se en
     tråd i stedet for å svare på ett løsrevet felt. Alt er kappet, både for
     å holde kostnaden nede og fordi hun bare trenger nok til å kjenne igjen
     sammenhengen. */
  const kutt = (v, n) => String(v == null ? "" : v).slice(0, n);
  const dagNr = Math.max(1, Math.min(99, parseInt(body.dag, 10) || 1));
  const antall = Math.max(1, Math.min(99, parseInt(body.antallDager, 10) || 11));

  const linjer = [];
  linjer.push((en ? "DAY " : "DAG ") + dagNr + (en ? " of " : " av ") + antall +
              (body.skifte ? (en ? "  ·  part: " : "  ·  del: ") + kutt(body.skifte, 60) : ""));
  if (body.dagTittel) linjer.push((en ? "Title: " : "Tittel: ") + kutt(body.dagTittel, 120));
  if (body.dagTekst) {
    linjer.push("");
    linjer.push(en ? "WHAT THE DAY SAID (she has just read this):" : "HVA DAGEN SA (dette har hun nettopp lest):");
    linjer.push(kutt(Array.isArray(body.dagTekst) ? body.dagTekst.join("\n") : body.dagTekst, 2500));
  }

  linjer.push("");
  linjer.push(en ? "WHAT SHE WROTE TODAY:" : "DET HUN SKREV I DAG:");
  sporsmal.forEach(function (sp, i) {
    const sv = String(svar[i] || "").trim();
    if (!sv) return;
    linjer.push((en ? "Q: " : "Spørsmål: ") + kutt(sp, 400));
    linjer.push((en ? "A: " : "Svar: ") + kutt(sv, 3000));
  });

  // Opptil tre tidligere dager, de nærmeste først, kort utdrag av hver.
  const tidligere = Array.isArray(body.tidligere) ? body.tidligere.slice(0, 3) : [];
  if (tidligere.length) {
    linjer.push("");
    linjer.push(en ? "WHAT SHE WROTE ON EARLIER DAYS (extract):"
                   : "DET HUN SKREV PÅ TIDLIGERE DAGER (utdrag):");
    tidligere.forEach(function (t) {
      const sv = (Array.isArray(t && t.svar) ? t.svar : []).map((x) => kutt(x, 400)).filter(Boolean);
      if (!sv.length) return;
      linjer.push((en ? "Day " : "Dag ") + (parseInt(t.dag, 10) || "?") +
                  (t.tittel ? ", " + kutt(t.tittel, 120) : "") + ": " + sv.join(" / "));
    });
  }

  // Tallet fra 0 til 10, når det finnes. På dag 11 er endringen selve poenget.
  if (body.maalingFor != null || body.maalingNaa != null) {
    linjer.push("");
    linjer.push((en ? "Her number from 0 to 10, day 1: " : "Tallet hennes fra 0 til 10, dag 1: ") +
                (body.maalingFor == null ? (en ? "not given" : "ikke satt") : parseInt(body.maalingFor, 10)) +
                (body.maalingNaa == null ? "" :
                  (en ? ", today: " : ", i dag: ") + parseInt(body.maalingNaa, 10)));
  }

  const prompt = linjer.join("\n");

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
