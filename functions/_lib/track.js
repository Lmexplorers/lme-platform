/**
 * LME funnel-analyse: anonyme dagstellere i KV (BUILDER_KV).
 *
 * Ingen persondata. Vi teller bare hendelser per dag:
 *   an:day:<YYYY-MM-DD> = {
 *     pv, visit, productview, checkout, purchase,   // funnel-tellere
 *     pages:   { "/sti": n },                       // toppsider
 *     clicks:  { "checkout": n },                   // klikk på merkede knapper
 *     camp:    { "kampanje": n }                    // UTM-kilde/kampanje
 *   }
 *
 * Brukes av /api/track (innsamling + eier-lesing) og av oppskrift-webhooken
 * (teller fullførte kjøp). Egnet for LMEs trafikkvolum. KV tåler ~1 skriving
 * per sekund per nøkkel, så ved svært høye topper kan enkelttellinger gå tapt,
 * det er en akseptabel forenkling for denne skalaen.
 */

function dayStr(d) {
  return d.getUTCFullYear() + "-" +
    String(d.getUTCMonth() + 1).padStart(2, "0") + "-" +
    String(d.getUTCDate()).padStart(2, "0");
}

function dayKey(ds) { return "an:day:" + ds; }

/* Legg til tellere for i dag. fields: {pv:1,...}. maps: {pages:{"/x":1}, ...}. */
export async function bumpToday(env, fields, maps) {
  if (!env || !env.BUILDER_KV) return;
  const k = dayKey(dayStr(new Date()));
  let day = {};
  try { const raw = await env.BUILDER_KV.get(k); if (raw) day = JSON.parse(raw) || {}; } catch (e) {}
  const f = fields || {};
  for (const key in f) day[key] = (day[key] || 0) + (f[key] || 0);
  const m = maps || {};
  for (const name in m) {
    day[name] = day[name] || {};
    const sub = m[name] || {};
    for (const kk in sub) {
      const key = String(kk).slice(0, 120);
      if (!key) continue;
      day[name][key] = (day[name][key] || 0) + (sub[kk] || 0);
      // Hold kartene små: maks 200 nøkler per dag.
      const keys = Object.keys(day[name]);
      if (keys.length > 200) delete day[name][keys[0]];
    }
  }
  try { await env.BUILDER_KV.put(k, JSON.stringify(day), { expirationTtl: 60 * 60 * 24 * 400 }); } catch (e) {}
}

/* Hent de siste n dagene (eldst først). */
export async function readDays(env, n) {
  const out = [];
  if (!env || !env.BUILDER_KV) return out;
  const base = Date.now();
  const days = Math.max(1, Math.min(120, n || 30));
  for (let i = days - 1; i >= 0; i--) {
    const ds = dayStr(new Date(base - i * 86400000));
    let day = {};
    try { const raw = await env.BUILDER_KV.get(dayKey(ds)); if (raw) day = JSON.parse(raw) || {}; } catch (e) {}
    out.push({ date: ds, day: day });
  }
  return out;
}
