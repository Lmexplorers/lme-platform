/**
 * LME oversetting — oversetter brukerskrevet chat-innhold til engelsk i
 * farten, slik at gruppene/feeden kan leses paa engelsk. Bruker samme
 * Anthropic-noekkel som resten (ANTHROPIC_API_KEY), og cacher hver
 * oversettelse i KV (tr:en:<hash>) saa samme tekst ikke oversettes paa nytt.
 *
 *   POST /api/translate  { texts: ["...", ...], to: "en" }
 *     -> { translations: { "<orig>": "<oversatt>", ... } }
 *
 * Krever innlogget medlem (samme regler som chatten).
 */

const OWNER_EMAILS = [
  "renate@lmexplorers.com", "hei@lmexplorers.com", "hello@lmexplorers.com",
  "support@lmexplorers.com", "renateshobby@hotmail.com",
];
const MAX_TEXTS = 40;

function json(data, status) {
  return new Response(JSON.stringify(data), {
    status: status || 200,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
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

export async function onRequestPost(context) {
  const { request, env } = context;
  if (!env.BUILDER_KV) return json({ error: "not_configured" }, 200);
  const u = await memberFrom(context);
  if (!u) return json({ error: "forbidden" }, 403);

  let body;
  try { body = await request.json(); } catch (e) { return json({ error: "bad_json" }, 400); }
  let texts = Array.isArray(body.texts) ? body.texts : [];
  texts = texts.map(function (s) { return (s || "").toString(); }).filter(function (s) { return s.trim().length; });
  // unike
  const uniq = [];
  const seen = {};
  for (const tx of texts) { if (!seen[tx]) { seen[tx] = true; uniq.push(tx); } if (uniq.length >= MAX_TEXTS) break; }
  if (!uniq.length) return json({ translations: {} });

  const out = {};
  const need = [];
  // 1) hent fra cache
  for (const tx of uniq) {
    const c = await env.BUILDER_KV.get("tr:en:" + (await sha(tx)));
    if (c != null) out[tx] = c; else need.push(tx);
  }

  // 2) oversett resten med Anthropic (i én forespørsel)
  if (need.length && env.ANTHROPIC_API_KEY) {
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-api-key": env.ANTHROPIC_API_KEY, "anthropic-version": "2023-06-01" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 2000,
          system: "You are a translator for a Montessori community chat. Translate each item from Norwegian (or whatever language it is) into natural, friendly English. Keep emojis and names as-is. Return ONLY a JSON array of strings, same length and order as the input array, with no extra commentary.",
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
    } catch (e) { /* stille: ikke-oversatte vises paa norsk */ }
  }

  return json({ translations: out });
}
