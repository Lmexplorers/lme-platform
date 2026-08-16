/**
 * LME AI Core, felles provider- og modelregister.
 *
 * ETT sted som beskriver hver AI-modell plattformen bruker: hvilken
 * leverandør den hører til, hva den kan, hvilke miljøvariabler som må være
 * satt, og hva den koster. Alt annet i AI Core leser prisene herfra, så en
 * prisendring gjøres på én linje i stedet for i sytten filer.
 *
 * Dette registeret ENDRER INGENTING i hvordan appene kaller modellene. Det
 * beskriver bare det som allerede skjer, slik at forbruket kan prises og
 * vises på /ai-kostnader. Se docs/ai-core-arkitektur.md, fase 1.
 *
 * ==========================================================================
 * OM PRISENE
 * ==========================================================================
 * Anthropic-prisene er hentet fra Anthropics egen prisliste og er
 * verifiserte. Alle andre priser er kvalifiserte anslag, og de er merket
 * med `verified: false` slik at administrasjonssiden kan vise dem som
 * anslag og ikke som fasit. Sjekk dem mot leverandørens eget dashbord før
 * du stoler på et krontall.
 *
 * Når du oppdaterer en pris: sett også `PRICES_CHECKED` under, så siden kan
 * si ærlig hvor gammelt tallet er.
 */

export const PRICES_CHECKED = "2026-08-16";

// ===========================================================================
// LEVERANDØRER
// ===========================================================================

export const PROVIDERS = {
  anthropic: {
    id: "anthropic",
    label: "Anthropic (Claude)",
    envKeys: ["ANTHROPIC_API_KEY"],
  },
  openai: {
    id: "openai",
    label: "OpenAI",
    envKeys: ["OPENAI_API_KEY", "IMAGE_OPENAI_KEY", "IMAGE_API_KEY"],
  },
  gemini: {
    id: "gemini",
    label: "Google Gemini",
    envKeys: ["GEMINI_API_KEY", "GOOGLE_API_KEY", "GOOGLE_GEMINI_API_KEY"],
  },
  elevenlabs: {
    id: "elevenlabs",
    label: "ElevenLabs",
    envKeys: ["ELEVENLABS_API_KEY"],
  },
  higgsfield: {
    id: "higgsfield",
    label: "Higgsfield",
    envKeys: ["HIGGSFIELD_API_KEY", "HIGGSFIELD_SECRET"],
    requiresAll: true,
  },
  stability: {
    id: "stability",
    label: "Stability AI",
    envKeys: ["STABILITY_API_KEY"],
  },
  cloudflare: {
    id: "cloudflare",
    label: "Cloudflare Workers AI",
    envKeys: ["CF_API_TOKEN", "CLOUDFLARE_API_TOKEN"],
    binding: "AI",
  },
  pollinations: {
    id: "pollinations",
    label: "Pollinations (gratis)",
    envKeys: [],
    alwaysConfigured: true,
  },
  blotato: {
    id: "blotato",
    label: "Blotato (publisering)",
    envKeys: ["BLOTATO_API_KEY"],
  },
  whiteboard: {
    id: "whiteboard",
    label: "whiteboard-engine (egen renderingstjeneste)",
    envKeys: ["WHITEBOARD_ENGINE_URL"],
    alwaysConfigured: true,
  },
};

// ===========================================================================
// MODELLER
// ===========================================================================
// unit forteller hvordan `units` skal tolkes når et kall logges:
//   "tokens"  -> { inputTokens, outputTokens }, pris per million
//   "image"   -> { images }, pris per bilde
//   "chars"   -> { chars }, pris per 1000 tegn
//   "minutes" -> { minutes }, pris per minutt
//   "clip"    -> { clips }, pris per klipp
//   "free"    -> ingen kostnad
// ===========================================================================

export const MODELS = [
  // --- Tekst -------------------------------------------------------------
  {
    id: "claude-opus-5",
    provider: "anthropic",
    task: "text",
    label: "Claude Opus 5",
    quality: "høy",
    unit: "tokens",
    price: { inPerM: 5.0, outPerM: 25.0 },
    verified: true,
  },
  {
    id: "claude-sonnet-5",
    provider: "anthropic",
    task: "text",
    label: "Claude Sonnet 5",
    quality: "middels",
    unit: "tokens",
    // Introduksjonspris ut august 2026, deretter 3.00 / 15.00.
    price: { inPerM: 2.0, outPerM: 10.0 },
    priceNote: "Introduksjonspris til og med 31. august 2026, deretter 3,00 / 15,00 per million.",
    verified: true,
  },
  {
    id: "claude-haiku-4-5-20251001",
    provider: "anthropic",
    task: "text",
    label: "Claude Haiku 4.5",
    quality: "rask",
    unit: "tokens",
    price: { inPerM: 1.0, outPerM: 5.0 },
    verified: true,
  },
  {
    id: "gpt-4o-mini",
    provider: "openai",
    task: "text",
    label: "GPT-4o mini",
    quality: "rask",
    unit: "tokens",
    price: { inPerM: 0.15, outPerM: 0.6 },
    verified: false,
  },

  // --- Bilde -------------------------------------------------------------
  {
    id: "gpt-image-1",
    provider: "openai",
    task: "image",
    label: "OpenAI gpt-image-1",
    quality: "høy",
    unit: "image",
    price: { perUnit: 0.08 },
    verified: false,
  },
  {
    id: "dall-e-3",
    provider: "openai",
    task: "image",
    label: "OpenAI DALL-E 3",
    quality: "middels",
    unit: "image",
    price: { perUnit: 0.04 },
    verified: false,
  },
  {
    id: "gemini-2.5-flash-image",
    provider: "gemini",
    task: "image",
    label: "Gemini 2.5 Flash Image",
    quality: "middels",
    unit: "image",
    price: { perUnit: 0.04 },
    verified: false,
  },
  {
    id: "stable-image-core",
    provider: "stability",
    task: "image",
    label: "Stability, Stable Image Core",
    quality: "middels",
    unit: "image",
    price: { perUnit: 0.03 },
    verified: false,
  },
  {
    id: "@cf/bytedance/stable-diffusion-xl-lightning",
    provider: "cloudflare",
    task: "image",
    label: "Cloudflare Workers AI, SDXL Lightning",
    quality: "rask",
    unit: "image",
    price: { perUnit: 0.01 },
    verified: false,
  },
  {
    id: "pollinations",
    provider: "pollinations",
    task: "image",
    label: "Pollinations (siste utvei, gratis)",
    quality: "lav",
    unit: "free",
    price: { perUnit: 0 },
    verified: true,
  },

  // --- Stemme og lyd -----------------------------------------------------
  {
    id: "eleven_multilingual_v2",
    provider: "elevenlabs",
    task: "voice",
    label: "ElevenLabs Multilingual v2",
    quality: "høy",
    unit: "chars",
    price: { per1000: 0.18 },
    verified: false,
  },
  {
    id: "eleven_turbo_v2_5",
    provider: "elevenlabs",
    task: "voice",
    label: "ElevenLabs Turbo v2.5",
    quality: "rask",
    unit: "chars",
    price: { per1000: 0.09 },
    verified: false,
  },
  {
    id: "gpt-4o-mini-tts",
    provider: "openai",
    task: "voice",
    label: "OpenAI TTS (gpt-4o-mini-tts)",
    quality: "middels",
    unit: "chars",
    price: { per1000: 0.015 },
    verified: false,
  },
  {
    id: "whisper-1",
    provider: "openai",
    task: "transcribe",
    label: "OpenAI Whisper",
    quality: "middels",
    unit: "minutes",
    price: { perUnit: 0.006 },
    verified: false,
  },

  // --- Video -------------------------------------------------------------
  {
    id: "dop-turbo",
    provider: "higgsfield",
    task: "video",
    label: "Higgsfield dop-turbo (bilde til video)",
    quality: "høy",
    unit: "clip",
    // LME selger dette som én forhåndskjøpt video-kreditt. Den prisen er
    // den autoritative, ikke et dollarestimat, så vi lar denne stå åpen.
    price: { perUnit: null },
    priceNote: "Prises som 1 video-kreditt på /kjop-kreditt, det er den autoritative prisen.",
    verified: false,
  },

  // --- Rendering og publisering (ingen kostnad per kall) -----------------
  {
    id: "whiteboard-render",
    provider: "whiteboard",
    task: "render",
    label: "whiteboard-engine (Remotion)",
    quality: "n/a",
    unit: "free",
    price: { perUnit: 0 },
    priceNote: "Fast månedspris på Render.com, ikke per kall.",
    verified: true,
  },
  {
    id: "blotato-publish",
    provider: "blotato",
    task: "publish",
    label: "Blotato publisering",
    quality: "n/a",
    unit: "free",
    price: { perUnit: 0 },
    priceNote: "Fast abonnement hos Blotato, ikke per kall.",
    verified: true,
  },
];

const BY_ID = MODELS.reduce((acc, m) => { acc[m.id] = m; return acc; }, {});

/** Slår opp en modell. Ukjent id gir null (og logges som ukjent, ikke som feil). */
export function findModel(modelId) {
  if (!modelId) return null;
  return BY_ID[modelId] || null;
}

/**
 * Beregner kostnad i dollar for ett kall.
 *
 * units:
 *   { inputTokens, outputTokens }  for tekst
 *   { images }                     for bilde
 *   { chars }                      for stemme
 *   { minutes }                    for transkribering
 *   { clips }                      for video
 *
 * Returnerer null når prisen ikke er kjent (f.eks. Higgsfield, som prises i
 * kreditter). Null betyr "vet ikke", ikke "gratis", og skal vises deretter.
 */
export function costFor(modelId, units) {
  const m = findModel(modelId);
  if (!m || !m.price) return null;
  const u = units || {};
  switch (m.unit) {
    case "tokens": {
      const inTok = Number(u.inputTokens) || 0;
      const outTok = Number(u.outputTokens) || 0;
      return round6((inTok / 1e6) * m.price.inPerM + (outTok / 1e6) * m.price.outPerM);
    }
    case "image": {
      if (m.price.perUnit == null) return null;
      const n = Number(u.images) || 1;
      return round6(n * m.price.perUnit);
    }
    case "chars": {
      const chars = Number(u.chars) || 0;
      return round6((chars / 1000) * m.price.per1000);
    }
    case "minutes": {
      if (m.price.perUnit == null) return null;
      const min = Number(u.minutes) || 0;
      return round6(min * m.price.perUnit);
    }
    case "clip": {
      if (m.price.perUnit == null) return null;
      const n = Number(u.clips) || 1;
      return round6(n * m.price.perUnit);
    }
    case "free":
      return 0;
    default:
      return null;
  }
}

function round6(n) {
  return Math.round(n * 1e6) / 1e6;
}

/** Er leverandøren satt opp med nøkler på dette miljøet. */
export function providerConfigured(env, providerId) {
  const p = PROVIDERS[providerId];
  if (!p) return false;
  if (p.alwaysConfigured) return true;
  if (p.binding && env && env[p.binding]) return true;
  if (!env) return false;
  if (p.requiresAll) return p.envKeys.every((k) => !!env[k]);
  return p.envKeys.some((k) => !!env[k]);
}

/** Oversikt til /api/ai-core/status og administrasjonssiden. Lekker aldri nøkkelverdier. */
export function registryStatus(env) {
  return {
    pricesChecked: PRICES_CHECKED,
    providers: Object.keys(PROVIDERS).map((id) => ({
      id: id,
      label: PROVIDERS[id].label,
      configured: providerConfigured(env, id),
    })),
    models: MODELS.map((m) => ({
      id: m.id,
      label: m.label,
      provider: m.provider,
      task: m.task,
      quality: m.quality,
      unit: m.unit,
      verified: !!m.verified,
      note: m.priceNote || "",
      configured: providerConfigured(env, m.provider),
    })),
  };
}
