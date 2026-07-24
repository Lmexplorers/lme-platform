/**
 * Lyd & meditasjon for Biblioteket, egne opptak i de fire kortene.
 *
 * Samme mønster som podkasten: rå lyd lagres i KV og strømmes med
 * Range-støtte, så avspilleren kan spole. Opplasting krever passordet
 * (COURSE_EDIT_PASSWORD, ellers standardpassordet under), akkurat som
 * kursredigering og podkast, så bare Renate kan legge inn lyd.
 *
 *   GET  /api/lyd/list                 -> { slots: { <slot>: {hasAudio,duration,size} } }
 *   GET  /api/lyd/<slot>.mp3           -> lydfila (støtter Range)
 *   POST /api/lyd/upload  (multipart)  -> felt: slot, file, password, [duration]
 *   POST /api/lyd/delete  { slot, password }
 *
 * KV (BUILDER_KV):
 *   lme-lyd:audio:<slot>   -> rå lyd (ArrayBuffer)
 *   lme-lyd:meta:<slot>    -> { size, type, duration, updated }
 */

const AUDIO = "lme-lyd:audio:";
const META = "lme-lyd:meta:";
const DEFAULT_PASSWORD = "LilleOppdager2026";

// De faste plassholderne på Biblioteket. Bare disse fire kan få lyd.
const SLOTS = {
  morgensirkel: "Morgensirkel, 7 minutter ro",
  observasjon: "Observasjon uten å gripe inn",
  naturlyder: "Naturlyder for det forberedte miljøet",
  visualisering: "Visualisering: Ditt ideelle miljø",
};

function json(data, status) {
  return new Response(JSON.stringify(data), {
    status: status || 200,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

function slotFromPath(pathParts) {
  // ["lyd","<slot>.mp3"] eller ["lyd","<slot>"]
  const last = (pathParts[pathParts.length - 1] || "").replace(/\.mp3$/i, "");
  return SLOTS[last] ? last : null;
}

async function getMeta(env, slot) {
  try { const r = await env.BUILDER_KV.get(META + slot); return r ? JSON.parse(r) : null; } catch (e) { return null; }
}

/* GET /api/lyd/list */
async function handleList(env) {
  const slots = {};
  for (const slot of Object.keys(SLOTS)) {
    const m = await getMeta(env, slot);
    slots[slot] = m
      ? { hasAudio: true, duration: m.duration || null, size: m.size || 0, updated: m.updated || null }
      : { hasAudio: false, duration: null, size: 0 };
  }
  return json({ slots });
}

/* GET /api/lyd/<slot>.mp3 med Range-støtte */
async function handleAudio(env, slot, request) {
  const buf = await env.BUILDER_KV.get(AUDIO + slot, "arrayBuffer");
  if (!buf) return new Response("not found", { status: 404 });
  const meta = (await getMeta(env, slot)) || {};
  const total = buf.byteLength;
  const type = meta.type || "audio/mpeg";
  const baseHeaders = {
    "Content-Type": type,
    "Accept-Ranges": "bytes",
    "Cache-Control": "public, max-age=300",
  };
  const range = request.headers.get("Range");
  if (range) {
    const m = range.match(/bytes=(\d*)-(\d*)/);
    if (m) {
      let start = m[1] ? parseInt(m[1], 10) : 0;
      let end = m[2] ? parseInt(m[2], 10) : total - 1;
      if (isNaN(start) || start < 0) start = 0;
      if (isNaN(end) || end >= total) end = total - 1;
      if (start > end) return new Response(null, { status: 416, headers: { "Content-Range": "bytes */" + total } });
      return new Response(buf.slice(start, end + 1), {
        status: 206,
        headers: Object.assign({}, baseHeaders, {
          "Content-Range": "bytes " + start + "-" + end + "/" + total,
          "Content-Length": String(end - start + 1),
        }),
      });
    }
  }
  return new Response(buf, { status: 200, headers: Object.assign({}, baseHeaders, { "Content-Length": String(total) }) });
}

function checkPassword(env, given) {
  const expected = (env.COURSE_EDIT_PASSWORD || DEFAULT_PASSWORD) + "";
  return ((given || "") + "") === expected;
}

/* POST /api/lyd/upload (multipart) */
async function handleUpload(env, request) {
  let form;
  try { form = await request.formData(); } catch (e) { return json({ error: "bad_form" }, 400); }
  if (!checkPassword(env, form.get("password"))) return json({ error: "bad_password" }, 401);
  const slot = (form.get("slot") || "") + "";
  if (!SLOTS[slot]) return json({ error: "bad_slot" }, 400);
  const file = form.get("file");
  if (!file || typeof file.arrayBuffer !== "function") return json({ error: "no_file" }, 400);
  const buf = await file.arrayBuffer();
  if (!buf.byteLength) return json({ error: "empty" }, 400);
  // KV tåler opptil 25 MB per verdi. Hold filene under det (ca. 96 kbps rekker langt).
  if (buf.byteLength > 25 * 1024 * 1024) {
    return json({ error: "too_large", hint: "Filen er over 25 MB. Eksporter i lavere bitrate (for eksempel 96 kbps), så får du plass til lange spor." }, 413);
  }
  const type = (file.type && /^audio\//.test(file.type)) ? file.type : "audio/mpeg";
  const duration = ((form.get("duration") || "") + "").trim() || null;
  await env.BUILDER_KV.put(AUDIO + slot, buf);
  await env.BUILDER_KV.put(META + slot, JSON.stringify({ size: buf.byteLength, type: type, duration: duration, updated: Date.now() }));
  return json({ ok: true, slot: slot, size: buf.byteLength, duration: duration });
}

/* POST /api/lyd/delete */
async function handleDelete(env, request) {
  let body;
  try { body = await request.json(); } catch (e) { return json({ error: "bad_json" }, 400); }
  if (!checkPassword(env, body && body.password)) return json({ error: "bad_password" }, 401);
  const slot = (body && body.slot || "") + "";
  if (!SLOTS[slot]) return json({ error: "bad_slot" }, 400);
  await env.BUILDER_KV.delete(AUDIO + slot);
  await env.BUILDER_KV.delete(META + slot);
  return json({ ok: true, slot: slot });
}

export async function onRequest(context) {
  const { request, env, params } = context;
  if (!env.BUILDER_KV) return json({ error: "not_configured" }, 503);
  const parts = Array.isArray(params.path) ? params.path : (params.path ? [params.path] : []);
  const tail = parts[parts.length - 1] || "";

  if (request.method === "GET") {
    if (tail === "list") return handleList(env);
    const slot = slotFromPath(["lyd"].concat(parts));
    if (slot) return handleAudio(env, slot, request);
    return json({ error: "not_found" }, 404);
  }
  if (request.method === "POST") {
    if (tail === "upload") return handleUpload(env, request);
    if (tail === "delete") return handleDelete(env, request);
  }
  return json({ error: "not_found" }, 404);
}
