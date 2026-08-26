/* Kvittering etter et Vipps-kjøp.
 *
 * Vipps sender kunden tilbake hit med ?vipps=<referanse> i adressen.
 * Skriptet spør /api/vipps-status, som sjekker hos Vipps om betalingen
 * er godkjent og leverer kjøpet der og da hvis det ikke alt er levert.
 * Slik får kunden varen selv om varselet fra Vipps skulle bli borte.
 *
 * Legges inn på hver side som kan være returside for et Vipps-kjøp:
 *   <script src="/js/vipps-kvittering.js?v=1" defer></script>
 */
(function () {
  var param = new URLSearchParams(location.search).get('vipps');
  if (!param) return;

  var TEKST = {
    venter: {
      no: 'Vent litt, jeg sjekker betalingen hos Vipps …',
      en: 'One moment, I am checking your payment with Vipps …',
    },
    levert: {
      no: 'Takk for kjøpet. Du får en e-post fra meg med lenken din nå. Sjekk gjerne søppelpost hvis den ikke dukker opp.',
      en: 'Thank you for your purchase. You will get an email from me with your link now. Do check your spam folder if it does not turn up.',
    },
    avbrutt: {
      no: 'Betalingen ble ikke fullført. Ingen penger er trukket, og du kan prøve igjen når du vil.',
      en: 'The payment was not completed. Nothing has been charged, and you can try again whenever you like.',
    },
    uklar: {
      no: 'Jeg får ikke lest av betalingen akkurat nå. Har du betalt, er kjøpet ditt trygt, og du hører fra meg på e-post. Skriv gjerne til meg på post@lmexplorers.com hvis det ikke skjer.',
      en: 'I cannot read your payment right now. If you have paid, your purchase is safe and you will hear from me by email. Do write to me at post@lmexplorers.com if that does not happen.',
    },
  };

  function erEn() {
    if (window.LME_CURRENT_LANG) return window.LME_CURRENT_LANG === 'en';
    try { return localStorage.getItem('lme_lang') === 'en'; } catch (e) {}
    return false;
  }

  var boks = document.createElement('div');
  boks.setAttribute('role', 'status');
  boks.style.cssText =
    'max-width:760px;margin:16px auto;padding:14px 16px;border-radius:14px;' +
    'font-family:var(--font-body,"Sasson Montessori",system-ui,sans-serif);' +
    'font-size:15px;line-height:1.5;text-align:center;';

  var tekst = document.createElement('p');
  tekst.style.cssText = 'margin:0;';
  boks.appendChild(tekst);

  function vis(nokkel, farge) {
    tekst.setAttribute('data-no', TEKST[nokkel].no);
    tekst.setAttribute('data-en', TEKST[nokkel].en);
    tekst.textContent = erEn() ? TEKST[nokkel].en : TEKST[nokkel].no;
    boks.style.background = farge.bak;
    boks.style.color = farge.tekst;
    boks.style.border = '1px solid ' + farge.kant;
  }

  var GRØNN = { bak: '#eaf7ef', tekst: '#1d5c35', kant: '#bfe3cd' };
  var GRÅ = { bak: '#f4f2ee', tekst: '#4a4640', kant: '#ddd8d0' };
  var RØD = { bak: '#fdeeee', tekst: '#8a2b2b', kant: '#f3cfcf' };

  /* Språkbyttet på sidene tegner som regel bare sitt eget innhold på
     nytt, og kjenner ikke denne boksen. Derfor setter jeg teksten på
     nytt etter hvert klikk på siden: det koster ingenting, og boksen
     følger språket uansett hvilken side den står på. */
  document.addEventListener('click', function () {
    setTimeout(function () {
      var no = tekst.getAttribute('data-no');
      var en = tekst.getAttribute('data-en');
      if (no && en) tekst.textContent = erEn() ? en : no;
    }, 0);
  });

  function settInn() {
    var vert = document.querySelector('.wrap') || document.querySelector('main') || document.body;
    vert.insertBefore(boks, vert.firstChild);
  }

  /* Betalingen er som regel godkjent i det sekundet kunden lander her,
     men Vipps kan bruke et lite øyeblikk. Derfor spør jeg opptil fem
     ganger, med lengre og lengre pause. */
  var PAUSER = [1200, 2000, 3000, 5000];
  var forsøk = 0;

  function spør() {
    fetch('/api/vipps-status?ref=' + encodeURIComponent(param), { credentials: 'same-origin' })
      .then(function (r) { return r.json().catch(function () { return null; }); })
      .then(function (svar) {
        var status = (svar && svar.status) || '';
        if (status === 'levert' || status === 'allerede_levert') {
          vis('levert', GRØNN);
          rydd();
          return;
        }
        if (status === 'avbrutt') {
          vis('avbrutt', GRÅ);
          rydd();
          return;
        }
        if (forsøk < PAUSER.length) {
          setTimeout(spør, PAUSER[forsøk++]);
          return;
        }
        vis('uklar', RØD);
      })
      .catch(function () {
        if (forsøk < PAUSER.length) { setTimeout(spør, PAUSER[forsøk++]); return; }
        vis('uklar', RØD);
      });
  }

  /* Ta referansen ut av adressen når vi er ferdige, så en oppfriskning
     av siden ikke ser ut som et nytt kjøp. */
  function rydd() {
    try {
      var u = new URL(location.href);
      u.searchParams.delete('vipps');
      history.replaceState(null, '', u.pathname + (u.search || '') + (u.hash || ''));
    } catch (e) {}
  }

  function start() {
    settInn();
    vis('venter', GRÅ);
    spør();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
