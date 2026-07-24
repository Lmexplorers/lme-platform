/**
 * LME — automatisk oversetting av sidetekst ved visning ("nivå 2").
 *
 * De faste sidene oversetter med en innebygd ordliste (window.LME_TRANSLATIONS).
 * Dette endepunktet fyller hullene automatisk: norsk tekst som mangler engelsk
 * oversettes med Anthropic (samme nøkkel og KV-cache som /api/translate) og
 * huskes per side, slik at alle senere besøkende får den med en gang, gratis.
 *
 *   GET  /api/page-i18n?id=/dashboard
 *        -> { dict: { "<norsk>": "<engelsk>", ... } }     (offentlig: husket overlay)
 *
 *   POST /api/page-i18n   { id, texts: ["...", ...] }
 *        -> { dict: { "<norsk>": "<engelsk>", ... } }     (krever innlogget medlem)
 *        Oversetter de oppgitte tekstene, lagrer dem i sidens overlay, returnerer dem.
 *
 * Overlay lagres i KV: lme-builder:i18n:<sti>  som { "<no>": "<en>", ... }
 * Bruker samme KV-binding som resten: BUILDER_KV.
 */

const OWNER_EMAILS = [
  "renate@lmexplorers.com", "hei@lmexplorers.com", "hello@lmexplorers.com",
  "support@lmexplorers.com", "renateshobby@hotmail.com",
];
const MAX_TEXTS = 40;
const MAX_OVERLAY_BYTES = 512 * 1024;

function json(data, status) {
  return new Response(JSON.stringify(data), {
    status: status || 200,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

function keyFromId(id) {
  if (typeof id !== "string") return null;
  let clean = id.trim().replace(/\.html$/, "").replace(/\/+$/, "");
  if (clean === "") clean = "/index";
  if (!/^\/[a-z0-9\-\/]+$/i.test(clean)) return null;
  return "lme-builder:i18n:" + clean.slice(0, 180);
}

function readCookies(request) {
  const out = {};
  (request.headers.get("Cookie") || "").split(";").forEach((p) => {
    const i = p.indexOf("=");
    if (i > 0) out[p.slice(0, i).trim()] = p.slice(i + 1).trim();
  });
  return out;
}
function activeStatus(s) { if (!s) return false; if (s.status && /cancel|inactive|expired|none/i.test(s.status)) return false; return true; }
async function memberFrom(context) {
  const { request, env } = context;
  const sid = readCookies(request)["lme_sess"];
  if (!sid) return null;
  const sraw = await env.BUILDER_KV.get("sess:" + sid);
  if (!sraw) return null;
  let sess; try { sess = JSON.parse(sraw); } catch (e) { return null; }
  const uraw = await env.BUILDER_KV.get("user:" + (sess.email || "").toLowerCase());
  if (!uraw) return null;
  let u; try { u = JSON.parse(uraw); } catch (e) { return null; }
  if (u.role === "owner" || OWNER_EMAILS.indexOf((u.email || "").toLowerCase()) !== -1) return u;
  if (activeStatus(u.subscription)) return u;
  const m = await env.BUILDER_KV.get("member:" + (u.email || "").toLowerCase());
  if (m) { try { if (activeStatus(JSON.parse(m))) return u; } catch (e) {} }
  return null;
}

async function sha(text) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

// Oversetter en liste tekster til engelsk. Cache først (tr:en:<hash>), så Anthropic.
async function translateToEnglish(env, texts) {
  const out = {};
  if (!texts.length) return out;
  const need = [];
  for (const t of texts) {
    let c = null;
    try { c = await env.BUILDER_KV.get("tr:en:" + (await sha(t))); } catch (e) {}
    if (c != null) out[t] = c; else need.push(t);
  }
  if (need.length && env.ANTHROPIC_API_KEY) {
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-api-key": env.ANTHROPIC_API_KEY, "anthropic-version": "2023-06-01" },
        body: JSON.stringify({
          model: "claude-sonnet-5",
          max_tokens: 3000,
          system:
            "You translate short UI/website text for a Montessori brand (Little Montessori Explorers) from Norwegian into natural, warm English. " +
            "Keep emojis, numbers, arrows and names/brands (LME, Mia & Teo, Renate, Montessori, Bookly, Canva, Vipps, Stripe) exactly as-is. " +
            "If an item is already English or is just a number/symbol/brand, return it unchanged. " +
            "Use straight quotes and avoid long dashes. " +
            "Return ONLY a JSON array of strings, same length and order as the input array, with no commentary.",
          messages: [{ role: "user", content: JSON.stringify(need) }],
        }),
      });
      const data = await res.json().catch(() => null);
      const txt = data && data.content && data.content[0] && data.content[0].text;
      if (txt) {
        let arr = null;
        try { arr = JSON.parse(txt); } catch (e) {
          const m = txt.match(/\[[\s\S]*\]/);
          if (m) { try { arr = JSON.parse(m[0]); } catch (e2) {} }
        }
        if (Array.isArray(arr)) {
          for (let i = 0; i < need.length; i++) {
            const tr = (arr[i] != null) ? String(arr[i]) : need[i];
            out[need[i]] = tr;
            try { await env.BUILDER_KV.put("tr:en:" + (await sha(need[i])), tr, { expirationTtl: 60 * 60 * 24 * 180 }); } catch (e) {}
          }
        }
      }
    } catch (e) { /* stille: uoversatte faller tilbake til norsk */ }
  }
  return out;
}

export async function onRequestGet(context) {
  const { request, env } = context;
  const id = new URL(request.url).searchParams.get("id") || "";
  const key = keyFromId(id);
  if (!key) return json({ dict: {} }, 400);
  if (!env.BUILDER_KV) return json({ dict: {} }, 200);
  try {
    const raw = await env.BUILDER_KV.get(key);
    let dict = {};
    if (raw) { try { dict = JSON.parse(raw) || {}; } catch (e) { dict = {}; } }
    return json({ dict }, 200);
  } catch (e) {
    return json({ dict: {} }, 200);
  }
}

export async function onRequestPost(context) {
  const { request, env } = context;
  if (!env.BUILDER_KV) return json({ dict: {} }, 200);
  // Bare innloggede medlemmer kan utløse ny oversetting (koster API). Alle andre
  // får den huskede overlay-en via GET.
  const u = await memberFrom(context);
  if (!u) return json({ error: "forbidden", dict: {} }, 403);

  let body;
  try { body = await request.json(); } catch (e) { return json({ error: "bad_json", dict: {} }, 400); }
  const key = keyFromId(body && body.id);
  if (!key) return json({ error: "bad_id", dict: {} }, 400);

  let texts = Array.isArray(body.texts) ? body.texts : [];
  const uniq = [];
  const seen = {};
  for (const tx of texts) {
    const s = (tx || "").toString();
    if (s.trim() && !seen[s]) { seen[s] = true; uniq.push(s); }
    if (uniq.length >= MAX_TEXTS) break;
  }
  if (!uniq.length) return json({ dict: {} }, 200);

  const translations = await translateToEnglish(env, uniq);

  // Slå sammen i sidens overlay og lagre.
  try {
    let overlay = {};
    const raw = await env.BUILDER_KV.get(key);
    if (raw) { try { overlay = JSON.parse(raw) || {}; } catch (e) { overlay = {}; } }
    let changed = false;
    for (const k in translations) {
      const v = translations[k];
      if (typeof v === "string" && v && v !== k) {
        if (overlay[k] !== v) { overlay[k] = v; changed = true; }
      }
    }
    if (changed) {
      const out = JSON.stringify(overlay);
      if (out.length <= MAX_OVERLAY_BYTES) await env.BUILDER_KV.put(key, out);
    }
  } catch (e) { /* stille */ }

  return json({ dict: translations }, 200);
}
