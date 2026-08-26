/* Vipps-knapp i en kjøpsboks.
 *
 * Legg dette på et element som omslutter kjøpsknappen:
 *
 *   <aside class="buy-box" data-vipps-produkt="ro-strikk" data-vipps-type="oppskrift">
 *
 * og ta med skriptet nederst på siden:
 *
 *   <script src="/js/vipps-knapp.js?v=1" defer></script>
 *
 * Resten skjer her: knappen, e-postfeltet, kallet til /api/vipps-pay og
 * feilmeldingene. Ingen av delene skal skrives inn på hver enkelt side.
 *
 * data-vipps-type er "oppskrift" (butikken), "kurs" eller "lv"
 * (Læringsverksted). Står den ikke, gjettes "oppskrift".
 *
 * Vipps tar bare norske kroner, så knappen vises bare i norsk visning.
 * Bytter kunden til engelsk, forsvinner den, og kortknappen står igjen.
 *
 * E-postfeltet er ikke valgfritt: Vipps forteller oss ikke hvem som
 * betalte, så uten adressen har vi ingen å sende varen til.
 */
(function () {
  var bokser = document.querySelectorAll('[data-vipps-produkt]');
  if (!bokser.length) return;

  var STIL =
    '.lme-vipps{margin:10px 0 0}' +
    '.lme-vipps-knapp{display:flex;align-items:center;justify-content:center;gap:8px;' +
      'width:100%;border:none;cursor:pointer;border-radius:999px;padding:14px 20px;' +
      'font-size:15.5px;font-weight:700;background:#FF5B24;color:#fff;' +
      'font-family:var(--font-body,"Sasson Montessori",system-ui,sans-serif);' +
      'transition:background .2s ease,transform .2s ease}' +
    '.lme-vipps-knapp:hover{background:#E64A16;transform:translateY(-1px)}' +
    '.lme-vipps-knapp:disabled{opacity:.6;cursor:default;transform:none}' +
    '.lme-vipps-skjema{display:none;flex-direction:column;gap:8px;margin-top:10px}' +
    '.lme-vipps-skjema.apen{display:flex}' +
    '.lme-vipps-skjema input{width:100%;border:1px solid rgba(26,26,26,.18);border-radius:12px;' +
      'padding:12px 14px;font-size:15px;' +
      'font-family:var(--font-body,"Sasson Montessori",system-ui,sans-serif)}' +
    '.lme-vipps-hvorfor{font-size:12.5px;color:var(--ink-muted,#8A8A8A);margin:0;text-align:center}' +
    '.lme-vipps-feil{color:#E91E89;font-size:12.5px;display:none;margin:0}' +
    '.lme-vipps-feil.vis{display:block}';

  var stil = document.createElement('style');
  stil.textContent = STIL;
  document.head.appendChild(stil);

  function erEn() { return document.documentElement.lang === 'en'; }

  function tekst(el, no, en) {
    el.setAttribute('data-no', no);
    el.setAttribute('data-en', en);
    el.textContent = erEn() ? en : no;
  }

  /* Sju forskjellige ting kan gå galt når kjøpet startes, og kunden skal
     ikke få den samme intetsigende beskjeden for alle sju. Den tekniske
     koden står i parentes bak, så den kan leses rett av skjermen på mobil.
     Koden røper ingenting hemmelig, den sier bare hvilket steg som stoppet. */
  var FEIL = {
    bad_email: { no: 'Sjekk e-postadressen.', en: 'Please check your email address.' },
    bad_slug: { no: 'Fant ikke varen. Last siden på nytt.', en: 'Product not found. Reload the page.' },
    not_found: { no: 'Fant ikke varen. Last siden på nytt.', en: 'Product not found. Reload the page.' },
    no_price: { no: 'Denne varen kan ikke kjøpes med Vipps ennå.', en: 'This item cannot be bought with Vipps yet.' },
  };
  var IKKE_KLAR = {
    no: 'Vipps er ikke klar akkurat nå. Bruk kjøpsknappen over, så virker kortbetaling.',
    en: 'Vipps is not available right now. Use the buy button above to pay by card.',
  };

  function visFeil(feilEl, kode) {
    var t = FEIL[kode] || IKKE_KLAR;
    tekst(feilEl, t.no + ' (' + kode + ')', t.en + ' (' + kode + ')');
    feilEl.classList.add('vis');
    if (window.console) console.error('vipps-pay:', kode);
  }

  var alle = [];

  Array.prototype.forEach.call(bokser, function (boks) {
    var slug = boks.getAttribute('data-vipps-produkt');
    var type = boks.getAttribute('data-vipps-type') || 'oppskrift';
    if (!slug) return;

    var blokk = document.createElement('div');
    /* buy-cta er LMEs egen merking for "dette er en kjøpsknapp". Sider som
       gir eieren varen gratis skjuler alt med den klassen, og da skal
       Vipps-knappen forsvinne sammen med resten. Eieren skal aldri betale
       for sitt eget produkt. */
    blokk.className = 'lme-vipps buy-cta';

    var knapp = document.createElement('button');
    knapp.type = 'button';
    knapp.className = 'lme-vipps-knapp';
    tekst(knapp, 'Betal med Vipps', 'Pay with Vipps');

    var skjema = document.createElement('form');
    skjema.className = 'lme-vipps-skjema';

    /* Si hvorfor vi spør. Et e-postfelt som dukker opp uten forklaring
       midt i et kjøp får folk til å snu. */
    var hvorfor = document.createElement('p');
    hvorfor.className = 'lme-vipps-hvorfor';
    tekst(hvorfor, 'Hit sender jeg varen din.', 'This is where I send your purchase.');

    var epost = document.createElement('input');
    epost.type = 'email';
    epost.required = true;
    epost.placeholder = erEn() ? 'Email' : 'E-post';
    epost.setAttribute('data-no-placeholder', 'E-post');
    epost.setAttribute('data-en-placeholder', 'Email');
    epost.autocomplete = 'email';

    var send = document.createElement('button');
    send.type = 'submit';
    send.className = 'lme-vipps-knapp';
    tekst(send, 'Gå til Vipps →', 'Continue to Vipps →');

    var feil = document.createElement('p');
    feil.className = 'lme-vipps-feil';

    skjema.appendChild(hvorfor);
    skjema.appendChild(epost);
    skjema.appendChild(send);
    skjema.appendChild(feil);
    blokk.appendChild(knapp);
    blokk.appendChild(skjema);

    /* Under kjøpsknappen, men over linjen om betalingsmåter, der den hører
       hjemme. Finnes ingen slik linje, legges den nederst i boksen. */
    var etter = boks.querySelector('.pay-methods');
    if (etter) etter.parentNode.insertBefore(blokk, etter);
    else boks.appendChild(blokk);

    /* Er kjøpsknappene i denne boksen alt skjult, er eieren logget inn og
       har fått varen gratis. Da skal ikke Vipps-knappen dukke opp igjen
       bare fordi den ble lagt til etterpå. */
    if (boks.querySelector('.buy-cta[hidden]')) blokk.hidden = true;

    knapp.addEventListener('click', function () { skjema.classList.toggle('apen'); });

    skjema.addEventListener('submit', function (e) {
      e.preventDefault();
      feil.classList.remove('vis');
      send.disabled = true;
      var før = { no: send.getAttribute('data-no'), en: send.getAttribute('data-en') };
      tekst(send, 'Ett øyeblikk …', 'One moment …');

      fetch('/api/vipps-pay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: type, slug: slug, email: epost.value, lang: erEn() ? 'en' : 'no',
        }),
      })
        /* Leser svaret som tekst først og prøver JSON etterpå. Er en 502-en
           fra Cloudflare og ikke fra oss, er kroppen en HTML-feilside, og
           da sier "http_502" alene ingenting om hva som stod der. */
        .then(function (res) {
          return res.text().then(function (t) { return { res: res, t: t }; });
        })
        .then(function (svar) {
          var data = null;
          try { data = JSON.parse(svar.t); } catch (e) {}
          if (data && data.ok && data.redirectUrl) {
            window.location.href = data.redirectUrl;
            return;
          }
          var kode;
          if (data && data.error) {
            kode = data.error + (data.status ? ' ' + data.status : '');
          } else {
            var utdrag = svar.t.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 80);
            kode = 'http_' + svar.res.status + (utdrag ? ': ' + utdrag : '');
          }
          visFeil(feil, kode);
          send.disabled = false;
          tekst(send, før.no, før.en);
        })
        .catch(function () {
          visFeil(feil, 'nettverk');
          send.disabled = false;
          tekst(send, før.no, før.en);
        });
    });

    alle.push({ blokk: blokk, skjema: skjema, epost: epost });
  });

  /* Vipps tar bare norske kroner. Sidenes egen språkbytter setter lang på
     html-elementet, så vi følger med på akkurat den, i stedet for å hekte
     oss på hver enkelt side sin knapp. */
  function følgSpråk() {
    var en = erEn();
    alle.forEach(function (v) {
      v.blokk.style.display = en ? 'none' : '';
      if (en) v.skjema.classList.remove('apen');
      v.epost.placeholder = en ? 'Email' : 'E-post';
    });
  }
  følgSpråk();
  new MutationObserver(følgSpråk).observe(document.documentElement, {
    attributes: true, attributeFilter: ['lang'],
  });
})();
