/**
 * LME AI Core, enkel bruksgrense.
 *
 * En dør stenger folk ute. En grense gjør det ikke: den lar alle slippe inn,
 * men hindrer at én enkelt person (eller et skript) kan tømme AI-budsjettet.
 * Det er forskjellen vi trenger for Nathalie AI, som ligger på 51 sider og
 * skal være tilgjengelig for alle uten konto.
 *
 * Fast vindu, ikke glidende: enkelt, billig, og godt nok som kostnadsvern.
 * Én KV-skriving per kall. Grensen er alltid fail-open, altså at hvis KV
 * ikke svarer, slipper brukeren gjennom. En kostnadsgrense skal aldri kunne
 * bli grunnen til at plattformen føles ødelagt.
 *
 * KV-nøkkel: ai:rl:<omraade>:<hvem>:<vindu> -> antall, med TTL lik vinduet.
 */

const PREFIX = "ai:rl:";

/** Hvilket døgnvindu vi er i nå (UTC). Ett tall per dag. */
function windowId(hours) {
  const h = Math.max(1, hours || 24);
  return Math.floor(Date.now() / (h * 3600 * 1000));
}

/**
 * Hvem forespørselen kommer fra, så godt vi kan vite det.
 * E-post når brukeren er innlogget, ellers IP-adressen fra Cloudflare.
 * Faller tilbake til "ukjent", som betyr at alle uten IP deler én pott.
 */
export function callerKey(request, email) {
  if (email) return "e:" + String(email).toLowerCase();
  const ip = request.headers.get("CF-Connecting-IP") ||
             request.headers.get("X-Forwarded-For") || "";
  const first = String(ip).split(",")[0].trim();
  return first ? "i:" + first : "ukjent";
}

/**
 * Teller ett kall og sier om det er innenfor grensen.
 *
 *   const gate = await checkLimit(env, {
 *     area: "nathalie",     // hvilken funksjon grensen gjelder
 *     who: callerKey(request, email),
 *     limit: 30,            // antall kall per vindu
 *     hours: 24,            // vinduets lengde
 *   });
 *   if (!gate.ok) return json({ error: ... }, 429);
 *
 * Returnerer { ok, used, limit, remaining, resetInHours }.
 * limit = 0 eller negativ betyr ingen grense (brukes for eier).
 */
export async function checkLimit(env, opts) {
  const limit = Number(opts && opts.limit);
  if (!Number.isFinite(limit) || limit <= 0) {
    return { ok: true, used: 0, limit: 0, remaining: Infinity, resetInHours: 0 };
  }
  if (!env || !env.BUILDER_KV) {
    // Ingen database tilkoblet (lokal utvikling): ikke stopp noen.
    return { ok: true, used: 0, limit: limit, remaining: limit, resetInHours: 0 };
  }

  const hours = Math.max(1, Number(opts.hours) || 24);
  const key = PREFIX + (opts.area || "generell") + ":" + (opts.who || "ukjent") +
              ":" + windowId(hours);

  let used = 0;
  try {
    const raw = await env.BUILDER_KV.get(key);
    used = raw ? parseInt(raw, 10) : 0;
    if (!Number.isFinite(used) || used < 0) used = 0;
  } catch (e) {
    // Klarte ikke lese: slipp gjennom heller enn å stenge feilaktig.
    return { ok: true, used: 0, limit: limit, remaining: limit, resetInHours: hours };
  }

  if (used >= limit) {
    return { ok: false, used: used, limit: limit, remaining: 0, resetInHours: hours };
  }

  try {
    await env.BUILDER_KV.put(key, String(used + 1), { expirationTtl: hours * 3600 });
  } catch (e) {
    // Klarte ikke telle opp: la kallet gå. Vi mister én telling, ikke en bruker.
  }

  return {
    ok: true,
    used: used + 1,
    limit: limit,
    remaining: Math.max(0, limit - (used + 1)),
    resetInHours: hours,
  };
}

/** Vennlig melding når grensen er nådd, tospråklig. */
export function limitMessage(gate, lang) {
  const en = lang === "en";
  return en
    ? "You have reached today's limit of " + gate.limit +
      " questions. The limit resets within " + gate.resetInHours +
      " hours. Log in for a higher limit."
    : "Du har brukt opp dagens grense på " + gate.limit +
      " spørsmål. Grensen nullstilles innen " + gate.resetInHours +
      " timer. Logg inn for å få en høyere grense.";
}
