/* Eieren skal aldri måtte betale for sitt eget produkt.
 *
 * Avtalt med Renate 3. august 2026. Skoledagboken har hatt dette lenge,
 * de 73 oppskriftssidene hadde det ikke, så Renate ble belastet som en
 * hvilken som helst kunde når hun hentet sin egen oppskrift.
 *
 * Skriptet leser produkt-IDen fra data-vipps-produkt på kjøpsboksen,
 * spør /api/access, og bytter kjøpsknappene mot nedlastingslenkene hvis
 * den som ser på siden er eieren.
 *
 * Legges inn slik, på en side som alt har en kjøpsboks med
 * data-vipps-produkt:
 *
 *   <script src="/js/eier-gratis.js?v=1" defer></script>
 *
 * Filene hentes fra butikk/butikk-config.js, den samme listen takkesiden
 * bruker. Den lastes først når vi vet at det er eieren som ser på, så en
 * vanlig kunde laster den aldri.
 *
 * Fail-open: svarer /api/access ikke, står kjøpsknappene som vanlig.
 * Skriptet kan gjøre en side gratis, aldri låse noe.
 */
(function () {
  var boks = document.querySelector('[data-vipps-produkt]');
  if (!boks) return;
  var pid = boks.getAttribute('data-vipps-produkt');
  if (!pid) return;

  function erEn() { return document.documentElement.lang === 'en'; }

  function lastKonfig(naar) {
    if (window.LME_BUTIKK) return naar();
    var s = document.createElement('script');
    s.src = '/butikk/butikk-config.js';
    s.onload = naar;
    s.onerror = function () {};
    document.head.appendChild(s);
  }

  function vis() {
    var produkt = window.LME_BUTIKK &&
      window.LME_BUTIKK.produkter && window.LME_BUTIKK.produkter[pid];
    var filer = (produkt && produkt.filer) || [];
    if (!filer.length) return;

    var blokk = document.createElement('div');
    blokk.className = 'lme-eier';

    var merke = document.createElement('p');
    merke.className = 'lme-eier-merke';
    merke.setAttribute('data-no', 'Ditt eget produkt. Bare last ned.');
    merke.setAttribute('data-en', 'Your own product. Just download it.');
    merke.textContent = erEn() ? merke.getAttribute('data-en') : merke.getAttribute('data-no');
    blokk.appendChild(merke);

    filer.forEach(function (fil) {
      if (!fil || !fil.url) return;
      var a = document.createElement('a');
      a.className = 'lme-eier-lenke';
      a.href = fil.url;
      var no = (fil.knapp && fil.knapp.no) || 'Last ned';
      var en = (fil.knapp && fil.knapp.en) || 'Download';
      a.setAttribute('data-no', no);
      a.setAttribute('data-en', en);
      a.textContent = erEn() ? en : no;
      blokk.appendChild(a);
    });

    var stil = document.createElement('style');
    stil.textContent =
      /* Uten !important gjør hidden ingenting på en kjøpsknapp. Knappene
         setter selv display (flex eller block) i sidens egen CSS, og en
         klasseregel slår nettleserens innebygde regel for hidden. Det var
         nettopp derfor kjøpsknappen ble stående synlig for eieren, med
         hidden satt og alt. */
      '[hidden]{display:none !important}' +
      '.lme-eier{margin:10px 0 0;display:flex;flex-direction:column;gap:8px}' +
      '.lme-eier-merke{margin:0 0 2px;font-size:12.5px;font-weight:700;' +
        'color:var(--cerise,#E91E89);text-align:center}' +
      '.lme-eier-lenke{display:block;text-align:center;text-decoration:none;' +
        'border-radius:999px;padding:14px 20px;font-size:15.5px;font-weight:700;' +
        'background:var(--btn-yellow,#F7E76B);color:var(--ink,#1A1A1A);' +
        'font-family:var(--font-body,"Sasson Montessori",system-ui,sans-serif);' +
        'transition:transform .2s ease}' +
      '.lme-eier-lenke:hover{transform:translateY(-1px)}';
    document.head.appendChild(stil);

    /* Skjul alt som ber om penger: kjøpsknappen, Vipps-blokken og linjen
       om betalingsmåter. Vipps-blokken merker seg selv med buy-cta. */
    var kjop = boks.querySelectorAll('.btn-card, .buy-cta, .pay-methods');
    Array.prototype.forEach.call(kjop, function (el) { el.hidden = true; });

    boks.insertBefore(blokk, boks.querySelector('.fine') || null);
  }

  fetch('/api/access', { credentials: 'same-origin' })
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (a) {
      if (!a || (a.plan !== 'owner' && a.tier !== 'owner')) return;
      lastKonfig(vis);
    })
    .catch(function () {});
})();
