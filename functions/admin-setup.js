/**
 * /admin-setup — opprett en bruker, eller fjern en brukers tilgang.
 * Bare for Renate. Selve handlingene ligger bak eier-sjekk i
 * /api/admin/create-user og /api/admin/delete-user.
 *
 * ==========================================================================
 * TO TING BLE RETTET HER 2. SEPTEMBER 2026
 * ==========================================================================
 * 1. Siden hadde Carrie Greens navn, e-postadresse OG passordet hennes i
 *    klartekst som ferdig utfylte verdier. Denne siden er offentlig, det er
 *    bare selve opprettingen som krever innlogging, så passordet lå åpent
 *    for hvem som helst som åpnet adressen. Feltene står tomme nå, og
 *    passordet foreslås tilfeldig i nettleseren i stedet.
 *
 * 2. Det fantes ingen vei ut. Renate ba om å finne tilgangen hun hadde gitt
 *    Carrie Green, og fjerne den, og det måtte i så fall gjøres for hånd
 *    inne i Cloudflare. Nå har siden et eget felt for det, med oppslag
 *    først og sletting etterpå.
 *
 * Rollen står på Kunde som standard. Eier gir full tilgang til alt, og skal
 * være et bevisst valg, ikke det som ligger der fra før.
 */

export async function onRequest(context) {
  const html = `<!DOCTYPE html>
<html lang="no">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>LME Admin — brukere</title>
  <style>
    :root { --rose:#E91E89; --linje:#e7dfe4; --tekst:#2c2430; --mild:#6B6470; }
    body { font-family: 'Sasson Montessori', system-ui, sans-serif; padding: 20px;
           max-width: 560px; margin: 0 auto; color: var(--tekst); line-height: 1.6; }
    h1, h2 { font-family: 'Playpen Sans', system-ui, sans-serif; }
    h1 { font-size: 24px; }
    h2 { font-size: 19px; margin: 0 0 4px; }
    .kort { border: 1px solid var(--linje); border-radius: 16px; padding: 20px; margin: 22px 0; }
    .form-group { margin: 16px 0; }
    label { display: block; font-weight: bold; margin-bottom: 5px; font-size: 15px; }
    input, select { width: 100%; padding: 11px; border: 1px solid var(--linje); border-radius: 10px;
                    font-size: 16px; box-sizing: border-box; font-family: inherit; }
    button { color: #fff; padding: 13px 20px; border: none; border-radius: 999px; cursor: pointer;
             font-size: 16px; width: 100%; font-family: inherit; font-weight: 700; }
    .knapp-lag { background: #4CAF50; }
    .knapp-sok { background: var(--rose); }
    .knapp-slett { background: #b3261e; margin-top: 12px; }
    button[disabled] { opacity: .5; cursor: default; }
    .hjelp { font-size: 13.5px; color: var(--mild); margin: 0 0 14px; }
    .svar { padding: 14px; border-radius: 12px; margin-top: 16px; font-size: 15px; display: none; }
    .ok { background: #d4edda; color: #155724; }
    .feil { background: #f8d7da; color: #721c24; }
    .info { background: #d1ecf1; color: #0c5460; padding: 14px; border-radius: 12px;
            margin-bottom: 20px; font-size: 14.5px; }
    ul.funn { margin: 10px 0 0; padding-left: 20px; font-size: 14.5px; }
    ul.funn li { margin-bottom: 4px; }
  </style>
</head>
<body>
  <h1>Brukere</h1>

  <div class="info">
    Du må være logget inn som eier for at knappene her skal virke.
  </div>

  <div class="kort">
    <h2>Fjern tilgang</h2>
    <p class="hjelp">
      Skriv adressen og trykk Søk opp. Du får se nøyaktig hva som finnes før noe slettes.
      Sletting fjerner innlogging, abonnement, kreditt og tilkoblede kontoer for den adressen,
      og personen mister tilgangen med en gang, også om hun er innlogget fra før.
    </p>

    <div class="form-group">
      <label for="slett-epost">E-post</label>
      <input type="email" id="slett-epost" placeholder="navn@eksempel.no" autocomplete="off">
    </div>

    <button type="button" class="knapp-sok" onclick="sokOpp()">Søk opp</button>
    <div id="slett-svar" class="svar"></div>
  </div>

  <div class="kort">
    <h2>Opprett bruker</h2>
    <p class="hjelp">Kunde er vanlig tilgang. Eier gir full tilgang til alt på plattformen.</p>

    <form id="userForm">
      <div class="form-group">
        <label for="name">Navn</label>
        <input type="text" id="name" name="name" required autocomplete="off">
      </div>

      <div class="form-group">
        <label for="email">E-post</label>
        <input type="email" id="email" name="email" required autocomplete="off">
      </div>

      <div class="form-group">
        <label for="password">Passord</label>
        <input type="text" id="password" name="password" required autocomplete="off">
        <p class="hjelp" style="margin:6px 0 0;">Foreslått tilfeldig. Send det til personen på en trygg måte.</p>
      </div>

      <div class="form-group">
        <label for="role">Rolle</label>
        <select id="role" name="role">
          <option value="customer">Kunde (vanlig tilgang)</option>
          <option value="owner">Eier (full tilgang)</option>
        </select>
      </div>

      <button type="submit" class="knapp-lag">Opprett bruker</button>
    </form>
    <div id="lag-svar" class="svar"></div>
  </div>

  <script>
    /* Et nytt passord hver gang siden åpnes, i stedet for ett fast som ligger
       i koden og kan leses av hvem som helst. */
    (function () {
      var b = new Uint8Array(16);
      crypto.getRandomValues(b);
      document.getElementById('password').value =
        Array.from(b).map(function (x) { return x.toString(16).padStart(2, '0'); }).join('');
    })();

    function vis(id, klasse, html) {
      var el = document.getElementById(id);
      el.className = 'svar ' + klasse;
      el.innerHTML = html;
      el.style.display = 'block';
    }
    function trygg(s) {
      return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
      });
    }

    async function kall(url, data) {
      var r = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include'
      });
      var d = await r.json().catch(function () { return {}; });
      return { r: r, d: d };
    }

    /* Steg 1: se hva som finnes. Sletter ingenting. */
    async function sokOpp() {
      var epost = document.getElementById('slett-epost').value.trim();
      if (!epost) { vis('slett-svar', 'feil', 'Skriv en e-postadresse først.'); return; }
      vis('slett-svar', 'info', 'Søker …');
      try {
        var svar = await kall('/api/admin/delete-user', { epost: epost });
        if (!svar.r.ok) { vis('slett-svar', 'feil', trygg(svar.d.feil || 'Noe gikk galt.')); return; }
        if (!svar.d.antall) {
          vis('slett-svar', 'ok', 'Fant ingen tilgang på ' + trygg(epost) + '. Det er ingenting å fjerne.');
          return;
        }
        var linjer = svar.d.funn.map(function (f) {
          return '<li><strong>' + trygg(f.hva) + ':</strong> ' + trygg(f.detalj) + '</li>';
        }).join('');
        vis('slett-svar', 'info',
          '<strong>Dette finnes på ' + trygg(epost) + ':</strong><ul class="funn">' + linjer + '</ul>' +
          '<button type="button" class="knapp-slett" onclick="slett(\\'' + trygg(epost) + '\\')">' +
          'Fjern all tilgang for ' + trygg(epost) + '</button>');
      } catch (e) {
        vis('slett-svar', 'feil', 'Fikk ikke kontakt med serveren.');
      }
    }

    /* Steg 2: slett, etter at hun har sett listen og bekreftet. */
    async function slett(epost) {
      if (!confirm('Fjerne all tilgang for ' + epost + '? Dette kan ikke angres.')) return;
      vis('slett-svar', 'info', 'Fjerner …');
      try {
        var svar = await kall('/api/admin/delete-user', { epost: epost, bekreft: true });
        if (!svar.r.ok || !svar.d.ok) {
          vis('slett-svar', 'feil', trygg(svar.d.feil || 'Noe gikk galt.'));
          return;
        }
        vis('slett-svar', 'ok', 'Tilgangen er fjernet. ' + svar.d.antall +
          ' oppføringer slettet for ' + trygg(epost) + '.');
      } catch (e) {
        vis('slett-svar', 'feil', 'Fikk ikke kontakt med serveren.');
      }
    }

    document.getElementById('userForm').addEventListener('submit', async function (e) {
      e.preventDefault();
      var data = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        password: document.getElementById('password').value,
        role: document.getElementById('role').value
      };
      try {
        var svar = await kall('/api/admin/create-user', data);
        if (svar.r.ok) {
          vis('lag-svar', 'ok', '<strong>Bruker opprettet.</strong><br>E-post: ' +
            trygg(svar.d.user && svar.d.user.email) + '<br>Navn: ' +
            trygg(svar.d.user && svar.d.user.name) + '<br>Rolle: ' +
            trygg(svar.d.user && svar.d.user.role));
        } else {
          vis('lag-svar', 'feil', trygg(svar.d.error || 'Noe gikk galt.'));
        }
      } catch (err) {
        vis('lag-svar', 'feil', 'Fikk ikke kontakt med serveren.');
      }
    });
  </script>
</body>
</html>`;

  return new Response(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
