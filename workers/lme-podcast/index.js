/**
 * LME Podkast — cron-worker som lager en ny episode hver dag.
 *
 * Selve episodelogikken (manus, stemmelegging, RSS, lagring) bor i Pages-
 * funksjonen /api/podcast/* slik at det finnes EN kilde til sannhet. Denne
 * lille workeren gjoer bare en ting: kaller generate-endepunktet en gang i
 * doegnet med et hemmelig passord. Da skriver og stemmelegger serien seg selv,
 * og alle plattformer (Apple, Spotify osv.) henter den nye episoden fra feed-en.
 *
 * Konfig (Worker -> Settings -> Variables):
 *   PODCAST_GENERATE_URL  (var)    f.eks. https://lmexplorers.com/api/podcast/generate
 *   PODCAST_PASSWORD      (secret) samme verdi som Pages-prosjektet bruker
 *
 * Cron settes i wrangler.toml ([triggers] crons). Standard: 06:00 UTC daglig.
 * Du kan også trigge manuelt: GET https://<worker>/run?key=<PODCAST_PASSWORD>
 */

const DEFAULT_URL = "https://lmexplorers.com/api/podcast/generate";

async function generate(env) {
  const url = env.PODCAST_GENERATE_URL || DEFAULT_URL;
  const password = env.PODCAST_PASSWORD || "";
  if (!password) {
    return { ok: false, status: 0, error: "missing PODCAST_PASSWORD secret" };
  }
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: password }),
    });
    const data = await res.json().catch(() => ({}));
    return { ok: res.ok && !!data.ok, status: res.status, data: data };
  } catch (e) {
    return { ok: false, status: 0, error: (e && e.message) || "fetch_failed" };
  }
}

export default {
  // Daglig cron.
  async scheduled(event, env, ctx) {
    ctx.waitUntil(generate(env));
  },

  // Manuell trigger / helsesjekk.
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/run") {
      const key = url.searchParams.get("key") || "";
      if (!env.PODCAST_PASSWORD || key !== env.PODCAST_PASSWORD) {
        return new Response(JSON.stringify({ error: "unauthorized" }), {
          status: 401, headers: { "Content-Type": "application/json" },
        });
      }
      const out = await generate(env);
      return new Response(JSON.stringify(out), {
        status: out.ok ? 200 : 502, headers: { "Content-Type": "application/json" },
      });
    }
    return new Response(
      "LME Podkast cron-worker er i live. Den lager en ny episode hver dag kl 06:00 UTC.\n" +
      "Manuell kjoering: /run?key=<PODCAST_PASSWORD>\n",
      { headers: { "Content-Type": "text/plain; charset=utf-8" } }
    );
  },
};
