/**
 * MIDLERTIDIG diagnose for Higgsfield-autentisering. Leser IKKE ut nøklene,
 * bare om de er satt og hvilket auth-skjema hvert endepunkt godtar. Fjernes
 * så snart 401-en er løst.
 */
const HF_BASE = "https://platform.higgsfield.ai";

function json(data, status) {
  return new Response(JSON.stringify(data, null, 2), {
    status: status || 200,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

async function tryGet(env, path, mode) {
  const key = env.HIGGSFIELD_API_KEY || "";
  const secret = env.HIGGSFIELD_SECRET || "";
  let headers = { "Accept": "application/json" };
  if (mode === "hf") { headers["hf-api-key"] = key; headers["hf-secret"] = secret; }
  else if (mode === "auth") { headers["Authorization"] = "Key " + key + ":" + secret; }
  else if (mode === "both") { headers["hf-api-key"] = key; headers["hf-secret"] = secret; headers["Authorization"] = "Key " + key + ":" + secret; }
  else if (mode === "bearer") { headers["Authorization"] = "Bearer " + key; }
  try {
    const r = await fetch(HF_BASE + path, { headers });
    const t = await r.text();
    return { status: r.status, body: t.slice(0, 120) };
  } catch (e) { return { status: -1, body: String(e).slice(0, 120) }; }
}

export async function onRequestGet(context) {
  const { env } = context;
  const keyLen = (env.HIGGSFIELD_API_KEY || "").length;
  const secLen = (env.HIGGSFIELD_SECRET || "").length;
  const keyHasColon = (env.HIGGSFIELD_API_KEY || "").indexOf(":") !== -1;
  const paths = ["/v1/text2image/soul-styles", "/v1/motions", "/v1/custom-references/list"];
  const modes = ["hf", "auth", "both", "bearer"];
  const results = {};
  for (const p of paths) {
    results[p] = {};
    for (const m of modes) {
      results[p][m] = await tryGet(env, p, m);
    }
  }
  return json({
    env: { hasKey: keyLen > 0, hasSecret: secLen > 0, keyLen, secLen, keyHasColon },
    results,
  });
}
