/**
 * Meld deg av nyhetsbrevet.
 *
 *   GET /api/avmeld?e=<e-post>&k=<kode>
 *
 * Lenken står nederst i hver e-post. Koden er tilfeldig og ligger på
 * abonnenten, så ingen kan melde av noen andre ved å gjette en adresse.
 *
 * Ett klikk holder. Ingen innlogging, ingen skjema, ingen "er du sikker".
 * Den som vil ut, skal komme ut.
 */
function side(tittel, tekst) {
  const html =
    '<!doctype html><html lang="no"><head><meta charset="utf-8">' +
    '<meta name="viewport" content="width=device-width,initial-scale=1">' +
    "<title>" + tittel + " | LME</title><style>" +
    "@font-face{font-family:'Sasson Montessori';" +
      "src:url('/fonts/SassoonMontessori.woff2') format('woff2');font-display:swap}" +
    "body{margin:0;background:#FBF6F0;color:#1A1A1A;" +
      "font-family:'Sasson Montessori','Playpen Sans',system-ui,sans-serif;" +
      "display:grid;place-items:center;min-height:100vh;padding:24px}" +
    ".kort{background:#fff;border-radius:24px;box-shadow:0 12px 40px rgba(26,26,26,.08);" +
      "padding:32px 28px;max-width:460px;text-align:center}" +
    "h1{font-family:'Playpen Sans',system-ui,sans-serif;font-size:24px;margin:0 0 12px}" +
    "p{font-size:15.5px;line-height:1.55;color:#4A4A4A;margin:0 0 14px}a{color:#E91E89}" +
    "</style></head><body><div class=\"kort\"><h1>" + tittel + "</h1><p>" + tekst + "</p>" +
    '<p><a href="/">Til lmexplorers.com</a></p></div></body></html>';
  return new Response(html, {
    headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" },
  });
}

export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const email = (url.searchParams.get("e") || "").trim().toLowerCase();
  const kode = (url.searchParams.get("k") || "").trim();

  const ferdig = side(
    "Du er meldt av",
    "Du får ikke flere nyhetsbrev fra meg. Har du kjøpt noe, får du fortsatt e-posten med varen din og kvitteringen. Vil du inn igjen senere, er du hjertelig velkommen."
  );

  if (!env.BUILDER_KV || !email || !kode) return ferdig;

  try {
    const key = "nl:" + email;
    const raa = await env.BUILDER_KV.get(key);
    if (raa) {
      const sub = JSON.parse(raa);
      /* Feil kode svarer likevel "du er meldt av", slik at ingen kan bruke
         siden til å finne ut hvem som står på listen. */
      if (sub && sub.avmeld && sub.avmeld === kode && sub.active !== false) {
        sub.active = false;
        sub.avmeldtAt = Date.now();
        await env.BUILDER_KV.put(key, JSON.stringify(sub));
      }
    }
  } catch (e) {}

  return ferdig;
}
