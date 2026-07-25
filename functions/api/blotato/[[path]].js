/**
 * Blotato-autopublisering, styrt fra selve plattformen.
 *
 * Nøkkelen din (fra blotato.com) lagres kryptert i Cloudflare KV via
 * /api/blotato/key og hentes bare her på serveren, aldri i nettleseren.
 * Slik kan du koble til autopublisering selv, uten å åpne Cloudflare.
 *
 *   GET  /api/blotato/status    -> { owner, hasKey, connected, count }
 *   POST /api/blotato/key       -> { key }        (kun eier) lagre/fjern nøkkel
 *   POST /api/blotato/accounts  -> proxy til Blotato /accounts (kun eier)
 *   POST /api/blotato/publish   -> proxy til Blotato /posts   (kun eier)
 */
import { sessionUser } from "../../_lib/access.js";

const OWNER_EMAILS = ["renateshobby@hotmail.com"];
const BLOTATO_BASE = "https://backend.blotato.com/v2";
const KEY_KV = "cfg:blotato_key";

function json(data, status) {
  return new Response(JSON.stringify(data), {
    status: status || 200,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

function isOwner(u) {
  return !!u && (u.role === "owner" || u.role === "admin" ||
    OWNER_EMAILS.indexOf((u.email || "").toLowerCase()) !== -1);
}

// Selvbetjenings-boksen i "Gjør synlig" lagrer nøkkelen i KV, det er
// hovedveien. Men støtt også en Cloudflare Pages-miljøvariabel
// (env.BLOTATO_API_KEY, satt på Pages-prosjektet "lme-platform", samme
// sted som ANTHROPIC_API_KEY ligger) som en likeverdig, alternativ vei.
// Returnerer også HVOR nøkkelen kom fra, så statussjekken kan vise det
// ærlig i stedet for én generisk "ikke koblet til"-melding uansett årsak.
async function storedKeyInfo(env) {
  try {
    const kv = await env.BUILDER_KV.get(KEY_KV);
    if (kv) return { key: kv, source: "kv" };
  } catch (e) {}
  if (env && env.BLOTATO_API_KEY) return { key: env.BLOTATO_API_KEY, source: "env" };
  return { key: "", source: "none" };
}
async function storedKey(env) { return (await storedKeyInfo(env)).key; }

async function fetchAccounts(key) {
  const r = await fetch(`${BLOTATO_BASE}/accounts`, {
    headers: { "blotato-api-key": key, "Accept": "application/json" },
  });
  const text = await r.text();
  let data; try { data = JSON.parse(text); } catch (e) { data = text; }
  return { ok: r.ok, status: r.status, data };
}

export async function onRequest(context) {
  const { request, env } = context;
  if (!env || !env.BUILDER_KV) return json({ error: "KV mangler." }, 500);

  const url = new URL(request.url);
  const path = url.pathname.replace(/^\/api\/blotato\/?/, "").replace(/\/$/, "");
  const user = await sessionUser(context);
  const owner = isOwner(user);

  /* Status: er nøkkelen satt, og er noen kontoer koblet til?
     Svaret inkluderer nå den ekte årsaken hvis noe svikter (keySource,
     checkErr), i stedet for at alt kollapser til én generisk melding. */
  if (path === "status" && request.method === "GET") {
    if (!owner) return json({ owner: false, hasKey: false, connected: false, count: 0 });
    const { key, source } = await storedKeyInfo(env);
    let connected = false, count = 0, checkErr = null;
    if (key) {
      try {
        const a = await fetchAccounts(key);
        if (a.ok) {
          const list = (a.data && (a.data.items || a.data.accounts || a.data)) || [];
          count = Array.isArray(list) ? list.length : 0;
          connected = count > 0;
        } else {
          checkErr = "Blotato " + a.status + ": " + JSON.stringify(a.data).slice(0, 200);
        }
      } catch (e) {
        checkErr = "Nettverksfeil mot Blotato: " + String((e && e.message) || e).slice(0, 150);
      }
    }
    return json({ owner: true, hasKey: !!key, keySource: source, connected, count, checkErr });
  }

  /* Lagre eller fjerne Blotato-nøkkelen (kun eier). */
  if (path === "key" && request.method === "POST") {
    if (!owner) return json({ error: "forbidden" }, 403);
    let body; try { body = await request.json(); } catch (e) { return json({ error: "Ugyldig JSON" }, 400); }
    const key = ((body && body.key) || "").trim();
    if (!key) { await env.BUILDER_KV.delete(KEY_KV); return json({ ok: true, hasKey: false }); }
    await env.BUILDER_KV.put(KEY_KV, key);
    let connected = false, count = 0;
    try {
      const a = await fetchAccounts(key);
      if (a.ok) {
        const list = (a.data && (a.data.items || a.data.accounts || a.data)) || [];
        count = Array.isArray(list) ? list.length : 0;
        connected = count > 0;
      } else {
        return json({ ok: true, hasKey: true, connected: false, count: 0, warn: "Nøkkelen ble lagret, men Blotato svarte " + a.status + ". Dobbeltsjekk at nøkkelen er riktig." });
      }
    } catch (e) {}
    return json({ ok: true, hasKey: true, connected, count });
  }

  /* Kontoer -> proxy. Ikke-eier får en tom liste, så dialogen faller
     pent tilbake til kopier/lim inn i stedet for å låse noe. */
  if (path === "accounts" && request.method === "POST") {
    if (!owner) return json({ result: { items: [] } }, 200);
    const key = await storedKey(env);
    if (!key) return json({ error: "Blotato er ikke koblet til ennå (mangler nøkkel).", result: { items: [] } }, 200);
    try {
      const a = await fetchAccounts(key);
      if (!a.ok) return json({ error: "Blotato svarte " + a.status + ".", detail: a.data, result: { items: [] } }, 200);
      return json({ result: a.data }, 200);
    } catch (e) {
      return json({ error: "Kom ikke i kontakt med Blotato.", result: { items: [] } }, 200);
    }
  }

  /* Publisering -> proxy (kun eier: dette legger ut på LME sine kanaler). */
  if (path === "publish" && request.method === "POST") {
    if (!owner) return json({ error: "Bare eier kan autopublisere til LME sine kanaler." }, 403);
    const key = await storedKey(env);
    if (!key) return json({ error: "Blotato er ikke koblet til ennå (mangler nøkkel)." }, 400);
    let body; try { body = await request.json(); } catch (e) { return json({ error: "Ugyldig JSON" }, 400); }
    const items = Array.isArray(body.items) ? body.items : [];
    if (!items.length) return json({ error: "Ingen innlegg å publisere." }, 400);
    if (items.length > 12) return json({ error: "Maks 12 innlegg om gangen." }, 400);

    const results = [];
    for (const it of items) {
      const label = (it && it.label) ||
        (it && it.post && it.post.target && it.post.target.targetType) || "?";
      if (!it || !it.post || !it.post.accountId || !it.post.target) {
        results.push({ label, ok: false, status: 0, error: "Mangler kontoID eller mål-plattform." });
        continue;
      }
      const payload = { post: it.post };
      if (it.scheduledTime) payload.scheduledTime = it.scheduledTime;
      try {
        const r = await fetch(`${BLOTATO_BASE}/posts`, {
          method: "POST",
          headers: { "blotato-api-key": key, "Content-Type": "application/json", "Accept": "application/json" },
          body: JSON.stringify(payload),
        });
        const text = await r.text();
        let data; try { data = JSON.parse(text); } catch (e) { data = text; }
        const id = data && (data.id || (data.submission && data.submission.id));
        results.push({ label, ok: r.ok, status: r.status, id, detail: r.ok ? undefined : data });
      } catch (e) {
        results.push({ label, ok: false, status: 0, error: "Nettverksfeil mot Blotato." });
      }
    }
    return json({ result: { results } }, 200);
  }

  return json({ error: "Ukjent endepunkt." }, 404);
}
