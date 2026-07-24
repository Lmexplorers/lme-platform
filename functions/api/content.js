/**
 * LME — redigerbare tekstblokker lagret i Cloudflare KV.
 *
 * GET  /api/content?id=/mia-og-teo
 *        -> { blocks: { <key>: <html> }, blocksEn: { <key>: <html> } }   (offentlig)
 *
 * POST /api/content   body { id, password, blocks: { <key>: <html> } }
 *        -> { ok: true, en: { <key>: <html> } }    (krever riktig passord)
 *
 * Når du lagrer en norsk redigering, oversettes den automatisk til engelsk
 * (samme Anthropic-nøkkel og KV-cache som /api/translate) og begge språk lagres.
 * Slik holder den norske og engelske teksten seg i sync uten manuelt arbeid.
 *
 * Lagret KV-verdi (nytt format): { __lme_v: 2, blocks: {...}, en: {...} }
 * Gammelt format (flat { key: html }) leses fortsatt som norsk-blokker.
 *
 * Bruker samme KV-binding som byggeren: BUILDER_KV.
 * Passord: hemmeligheten COURSE_EDIT_PASSWORD (samme som kursredigering),
 * ellers standardpassordet under.
 */

const DEFAULT_PASSWORD = "LilleOppdager2026";

function json(data, status) {
  return new Response(JSON.stringify(data), {
    status: status || 200,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

// Gjør en side-sti om til en trygg KV-nøkkel.
function keyFromId(id) {
  if (typeof id !== "string") return null;
  let clean = id.trim().replace(/\.html$/, "").replace(/\/+$/, "");
  if (clean === "") clean = "/index";
  if (!/^\/[a-z0-9\-\/]+$/i.test(clean)) return null;
  return "lme-builder:content:" + clean.slice(0, 180);
}

// Leser KV-verdien og normaliserer til { blocks, en }, uansett gammelt/nytt format.
function normalizeStore(raw) {
  let parsed = {};
  if (raw) { try { parsed = JSON.parse(raw); } catch (e) { parsed = {}; } }
  if (parsed && parsed.__lme_v === 2 && parsed.blocks && typeof parsed.blocks === "object") {
    return { blocks: parsed.blocks || {}, en: (parsed.en && typeof parsed.en === "object") ? parsed.en : {} };
  }
  // Gammelt flatt format: hele objektet er norske blokker.
  return { blocks: (parsed && typeof parsed === "object") ? parsed : {}, en: {} };
}

async function sha(text) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

// Oversetter en liste tekster (kan inneholde HTML) til engelsk. Gjenbruker
// samme KV-cache (tr:en:<hash>) som /api/translate. Best effort: feiler stille.
async function translateToEnglish(env, texts) {
  const out = {};
  const uniq = [];
  const seen = {};
  for (const t of texts) {
    const s = (t || "").toString();
    if (s.trim() && !seen[s]) { seen[s] = true; uniq.push(s); }
  }
  if (!uniq.length) return out;

  const need = [];
  for (const t of uniq) {
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
          max_tokens: 4000,
          system:
            "You translate website text for a Montessori brand (Little Montessori Explorers) from Norwegian into natural, warm English. " +
            "Each input item may contain HTML tags. Preserve every HTML tag, attribute and entity EXACTLY; translate only the human-readable text between them. " +
            "Do not add, remove or reorder tags. Keep emojis, numbers, and names/brands (LME, Mia & Teo, Renate, Montessori) as-is. " +
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
    } catch (e) { /* stille: uoversatte blokker faller tilbake til norsk */ }
  }
  return out;
}

export async function onRequestGet(context) {
  const { request, env } = context;
  const id = new URL(request.url).searchParams.get("id") || "";
  const key = keyFromId(id);
  if (!key) return json({ error: "bad_id", blocks: {}, blocksEn: {} }, 400);
  if (!env.BUILDER_KV) return json({ error: "not_configured", blocks: {}, blocksEn: {} }, 200);
  try {
    const store = normalizeStore(await env.BUILDER_KV.get(key));
    return json({ blocks: store.blocks, blocksEn: store.en }, 200);
  } catch (e) {
    return json({ error: "read_failed", blocks: {}, blocksEn: {} }, 200);
  }
}

export async function onRequestPost(context) {
  const { request, env } = context;
  if (!env.BUILDER_KV) return json({ error: "not_configured" }, 200);
  let body;
  try { body = await request.json(); } catch (e) { return json({ error: "bad_json" }, 400); }

  const expected = (env.COURSE_EDIT_PASSWORD || DEFAULT_PASSWORD) + "";
  if (((body && body.password) || "") + "" !== expected) {
    return json({ error: "bad_password" }, 401);
  }

  const key = keyFromId(body && body.id);
  if (!key) return json({ error: "bad_id" }, 400);

  const incoming = body && body.blocks;
  if (!incoming || typeof incoming !== "object") return json({ error: "no_blocks" }, 400);

  try {
    // Slå sammen med det som allerede er lagret.
    const store = normalizeStore(await env.BUILDER_KV.get(key));
    const changedKeys = [];
    for (const k in incoming) {
      if (Object.prototype.hasOwnProperty.call(incoming, k)) {
        const v = incoming[k];
        if (typeof v === "string") {
          const kk = String(k).slice(0, 120);
          store.blocks[kk] = v.slice(0, 200000);
          changedKeys.push(kk);
        }
      }
    }

    // Auto-oversett de endrede blokkene til engelsk (best effort).
    const enOut = {};
    try {
      const texts = changedKeys.map((k) => store.blocks[k]);
      const trMap = await translateToEnglish(env, texts);
      for (const k of changedKeys) {
        const tr = trMap[store.blocks[k]];
        if (tr) { store.en[k] = tr; enOut[k] = tr; }
      }
    } catch (e) { /* stille */ }

    const out = JSON.stringify({ __lme_v: 2, blocks: store.blocks, en: store.en });
    if (out.length > 1024 * 1024) return json({ error: "too_large" }, 413);
    await env.BUILDER_KV.put(key, out);
    return json({ ok: true, en: enOut }, 200);
  } catch (e) {
    return json({ error: "write_failed" }, 200);
  }
}
