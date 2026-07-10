/* =========================================================
   LME — mobilfikser for toppnavigasjonen (delt)
   1) Hamburgermeny: sidene med <nav class="nav" id="nav">
      skjuler menyen på mobil; her får de et panel med HELE
      menyen ferdig utvidet.
   2) Topplinje på mobil: lar knappene bryte pent og skjuler
      pynteikonene (søk/meldinger/varsler uten funksjon).
   3) Flytende språkknapp: flyttes ned i hjørnet på mobil, og
      den gamle hvite "English"-dubletten skjules der begge
      finnes.
   Endre mobiloppførselen KUN her — gjelder alle sidene.
   ========================================================= */
(function () {
  /* --- Globale stiler (uavhengig av meny) --- */
  var css = [
    '.lme-burger { display: none; align-items: center; justify-content: center;',
    '  width: 40px; height: 40px; border-radius: 999px; border: none;',
    '  background: rgba(248,215,218,.5); color: #2a1e2e; font-size: 19px;',
    '  cursor: pointer; flex: none; }',
    '@media (max-width: 768px) {',
    '  .lme-burger { display: inline-flex !important; }',
    /* Topplinje: bryt pent, skjul pynteikonene */
    '  .header .icon-btn { display: none !important; }',
    '  .header-right { flex: 1 1 auto !important; flex-wrap: wrap;',
    '    justify-content: flex-end; min-width: 0; gap: 6px; }',
    /* Flytende språkknapp: på logo-raden, oppe til høyre i det hvite feltet */
    '  #lme-floating-lang-btn { top: 60px !important; bottom: auto !important;',
    '    right: 16px !important; left: auto !important; transform: none !important;',
    '    padding: 8px 14px !important; font-size: 12px !important; z-index: 2147483600 !important; }',
    '  #lme-floating-lang-btn:hover { transform: scale(1.05) !important; }',
    '  a.lang-float { top: 60px !important; bottom: auto !important; right: 16px !important;',
    '    left: auto !important; transform: none !important; }',
    /* Hero-seksjonen: nyhetsliste + banner under hverandre, ikke ved siden av */
    '  .hero-section { grid-template-columns: 1fr !important; gap: 16px; }',
    '  .hero-section .hero { min-height: 250px; aspect-ratio: auto; }',
    '  .hero-section .hero-slide { padding: 22px; }',
    '  .hero-section .hero h1 { font-size: 24px; }',
    '  .hero-section .hero .by { font-size: 15px; }',
    /* Fanerader (Oversikt/Abonnement/...): hold dem innenfor skjermen, rull sidelengs */
    '  .tabs { max-width: 100% !important; }',
    /* Mobilmeny-panelet */
    '  .nav { display: none !important; position: fixed; left: 12px; right: 12px;',
    '    flex-direction: column; background: #fff; border-radius: 22px;',
    '    box-shadow: 0 22px 60px rgba(43,30,46,.22); border: 1px solid #f3dce6;',
    '    padding: 6px 12px 14px; z-index: 1200; overflow-y: auto;',
    '    -webkit-overflow-scrolling: touch; gap: 0; }',
    '  .nav.lme-open { display: flex !important; }',
    '  .nav .nav-item { position: static; width: 100%; }',
    '  .nav .lme-grp > .nav-btn { pointer-events: none; width: 100%;',
    '    font-size: 12px; font-weight: 800; text-transform: uppercase;',
    '    letter-spacing: .07em; color: #c2255c; padding: 14px 4px 2px; }',
    '  .nav .lme-grp > .nav-btn .chev { display: none; }',
    '  .nav .dropdown { display: grid !important; position: static; min-width: 0;',
    '    width: 100%; grid-template-columns: 1fr; gap: 12px; box-shadow: none;',
    '    border: none; padding: 0 4px 6px; margin-top: 0; }',
    '  .nav .dropdown::before { display: none; }',
    '  .nav .dropdown-col h4 { margin: 8px 0 2px; }',
    '  .nav .dropdown-col li a { padding: 9px 0; }',
    '  .nav .lme-dup-hide { display: none !important; }',
    '}',
  ].join('\n');
  var st = document.createElement('style');
  st.textContent = css;
  /* Sist i body, så reglene vinner over sidens egne stilblokker i body */
  (document.body || document.head).appendChild(st);

  /* --- Flytende språkknapp: flytt ned på mobil med inline-stil (slår alt) --- */
  function placeLangBtn() {
    var b = document.getElementById('lme-floating-lang-btn');
    if (!b) return;
    if (window.matchMedia('(max-width: 768px)').matches) {
      // Oppe, rett under den faktiske toppmenyen (uansett høyde), og
      // midtstilt så knappen alltid faller innenfor skjermen, også i
      // Facebook-nettleseren. Aldri nederst / bak "Gjør synlig".
      // Legg knappen på logo-raden, oppe til høyre i det hvite toppfeltet,
      // over den svarte R-knappen. Rett den vertikalt etter logoen.
      var top = 60;
      var logo = document.querySelector('.header .logo, .logo');
      if (logo) {
        var lr = logo.getBoundingClientRect();
        if (lr && lr.height) top = Math.round(lr.top + lr.height / 2 - 16);
      } else {
        var hdr = document.querySelector('.header');
        if (hdr) { var r = hdr.getBoundingClientRect(); if (r && r.top > -100) top = Math.round(r.top + 14); }
      }
      if (top < 8) top = 8;
      b.style.setProperty('top', top + 'px', 'important');
      b.style.setProperty('bottom', 'auto', 'important');
      b.style.setProperty('right', '16px', 'important');
      b.style.setProperty('left', 'auto', 'important');
      b.style.setProperty('transform', 'none', 'important');
      b.style.setProperty('padding', '8px 14px', 'important');
      b.style.setProperty('font-size', '12px', 'important');
      b.style.setProperty('z-index', '2147483600', 'important');
    } else {
      ['top', 'bottom', 'left', 'right', 'transform', 'padding', 'font-size', 'z-index'].forEach(function (k) {
        b.style.removeProperty(k);
      });
    }
  }
  placeLangBtn();
  window.addEventListener('resize', placeLangBtn);
  window.addEventListener('load', placeLangBtn);
  setTimeout(placeLangBtn, 300);

  /* --- Fjern den gamle hvite "English"-dubletten der begge finnes --- */
  function dedupeLang() {
    var pink = document.getElementById('lme-floating-lang-btn');
    var dup = document.querySelector('a.lang-float, button.lang-float');
    if (pink && dup) dup.style.display = 'none';
  }
  dedupeLang();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { dedupeLang(); placeLangBtn(); });
  }

  /* --- Gjør topplinjens ikoner (søk, meldinger, varsler) funksjonelle --- */
  (function wireHeaderIcons() {
    var st2 = document.createElement('style');
    st2.textContent = [
      '.icon-btn { position: relative; }',
      '.lme-badge { position: absolute; top: 6px; right: 6px; width: 9px; height: 9px; border-radius: 50%; background: #E91E89; border: 2px solid #fff; }',
      '.lme-pop2 { position: fixed; top: 64px; right: 14px; width: 300px; max-width: 92vw; background: #fff; border: 1px solid #f3dce6; border-radius: 16px; box-shadow: 0 18px 50px rgba(43,30,46,.22); z-index: 3000; overflow: hidden; font-family: "Sasson Montessori","Playpen Sans",system-ui,sans-serif; }',
      '.lme-pop2 .ph { padding: 12px 14px; border-bottom: 1px solid #f3e3e9; display: flex; justify-content: space-between; align-items: center; }',
      '.lme-pop2 .ph b { font-size: 14px; color: #2a1e2e; font-family: "Playpen Sans",sans-serif; }',
      '.lme-pop2 .ph button { font-size: 12px; border: 0; background: none; color: #c2255c; cursor: pointer; font-family: inherit; }',
      '.lme-pop2 .pb { max-height: 60vh; overflow-y: auto; }',
      '.lme-pop2 a.it { display: block; padding: 10px 14px; border-bottom: 1px solid #f6ecf0; text-decoration: none; color: #2a1e2e; font-size: 13.5px; }',
      '.lme-pop2 a.it:hover { background: #FCEFF2; }',
      '.lme-pop2 .empty { padding: 14px; color: #9a7b85; font-size: 13.5px; }',
      '.lme-pop2 input { width: 100%; border: 0; border-bottom: 1px solid #f3e3e9; padding: 12px 14px; font-family: inherit; font-size: 14px; outline: none; }'
    ].join('\n');
    document.head.appendChild(st2);

    function lang() { try { return localStorage.getItem('lme_lang') || 'no'; } catch (e) { return 'no'; } }
    function esc(s) { var d = document.createElement('div'); d.textContent = s == null ? '' : String(s); return d.innerHTML; }
    function closePop2() { var p = document.getElementById('lme-pop2'); if (p) p.remove(); document.removeEventListener('click', out2, true); }
    function out2(e) { var p = document.getElementById('lme-pop2'); if (p && !p.contains(e.target) && !(e.target.closest && e.target.closest('.icon-btn'))) closePop2(); }
    function openPop2(html) { closePop2(); var p = document.createElement('div'); p.className = 'lme-pop2'; p.id = 'lme-pop2'; p.innerHTML = html; document.body.appendChild(p); setTimeout(function () { document.addEventListener('click', out2, true); }, 0); return p; }

    var msg = document.querySelector('.icon-btn[aria-label="Meldinger"]');
    if (msg) msg.addEventListener('click', function (e) { e.stopPropagation(); location.href = '/meldinger'; });

    var search = document.querySelector('.icon-btn[aria-label="Søk"]');
    if (search) search.addEventListener('click', function (e) {
      e.stopPropagation();
      var p = openPop2('<input type="text" id="lme-search-in" placeholder="' + (lang() === 'en' ? 'Search members…' : 'Søk etter medlemmer…') + '"><div class="pb" id="lme-search-res"><p class="empty">' + (lang() === 'en' ? 'Type a name' : 'Skriv et navn') + '</p></div>');
      var inp = p.querySelector('#lme-search-in'); inp.focus();
      var people = null;
      inp.addEventListener('input', function () {
        var q = inp.value.trim().toLowerCase(); var res = p.querySelector('#lme-search-res');
        if (!q) { res.innerHTML = '<p class="empty">' + (lang() === 'en' ? 'Type a name' : 'Skriv et navn') + '</p>'; return; }
        function paint() { var hits = (people || []).filter(function (x) { return (x.name || '').toLowerCase().indexOf(q) >= 0; }).slice(0, 12); res.innerHTML = hits.length ? hits.map(function (x) { return '<a class="it" href="/medlem?u=' + encodeURIComponent(x.uid) + '">' + esc(x.name) + '</a>'; }).join('') : '<p class="empty">' + (lang() === 'en' ? 'No matches' : 'Ingen treff') + '</p>'; }
        if (people) { paint(); return; }
        fetch('/api/group/directory', { credentials: 'same-origin' }).then(function (r) { return r.json(); }).then(function (d) { people = (d && d.people) || []; paint(); }).catch(function () { res.innerHTML = '<p class="empty">' + (lang() === 'en' ? 'Log in to search' : 'Logg inn for å søke') + '</p>'; });
      });
    });

    var bell = document.querySelector('.icon-btn[aria-label="Varsler"]');
    if (bell) {
      fetch('/api/group/notifs', { credentials: 'same-origin' }).then(function (r) { return r.json(); }).then(function (d) {
        var unread = ((d && d.notifs) || []).filter(function (n) { return !n.read; }).length;
        if (unread > 0 && !bell.querySelector('.lme-badge')) { var b = document.createElement('span'); b.className = 'lme-badge'; bell.appendChild(b); }
      }).catch(function () {});
      bell.addEventListener('click', function (e) {
        e.stopPropagation();
        var p = openPop2('<div class="ph"><b>' + (lang() === 'en' ? 'Notifications' : 'Varsler') + '</b><button id="lme-nr2">' + (lang() === 'en' ? 'Mark read' : 'Marker lest') + '</button></div><div class="pb" id="lme-nb2"><p class="empty">' + (lang() === 'en' ? 'Loading…' : 'Laster…') + '</p></div>');
        fetch('/api/group/notifs', { credentials: 'same-origin' }).then(function (r) { return r.json(); }).then(function (d) {
          var ns = (d && d.notifs) || []; var nb = p.querySelector('#lme-nb2');
          nb.innerHTML = ns.length ? ns.slice(0, 20).map(function (n) { return '<a class="it" href="' + esc(n.link || '#') + '"' + (n.read ? '' : ' style="background:#FFF6DA;"') + '>' + esc(n.text) + '</a>'; }).join('') : '<p class="empty">' + (lang() === 'en' ? 'No notifications yet' : 'Ingen varsler ennå') + '</p>';
        }).catch(function () { p.querySelector('#lme-nb2').innerHTML = '<p class="empty">' + (lang() === 'en' ? 'Log in to see notifications' : 'Logg inn for å se varsler') + '</p>'; });
        p.querySelector('#lme-nr2').addEventListener('click', function () { fetch('/api/group/notifs/read', { method: 'POST', credentials: 'same-origin' }).then(function () { var b = bell.querySelector('.lme-badge'); if (b) b.remove(); closePop2(); }); });
      });
    }
  })();

  /* --- Hamburgermeny (bare på sider med delt toppnav) --- */
  var nav = document.getElementById('nav');
  var header = nav && nav.closest('.header');
  if (!nav || !header) return;

  var items = nav.querySelectorAll('.nav-item');
  for (var i = 0; i < items.length; i++) {
    if (items[i].querySelector('.dropdown')) items[i].className += ' lme-grp';
  }

  /* --- Fjern dubletter på mobil: samme menykolonne (f.eks. "Støtte")
     finnes i flere nedtrekk. På desktop vises bare ett nedtrekk om
     gangen, men i mobilpanelet stables alt, så kolonnen dukker opp
     flere ganger. Behold den fyldigste og skjul resten. --- */
  var cols = nav.querySelectorAll('.dropdown-col');
  var seen = {};
  for (var c = 0; c < cols.length; c++) {
    var h4 = cols[c].querySelector('h4');
    if (!h4) continue;
    var key = (h4.textContent || '').replace(/\s+/g, ' ').trim().toLowerCase();
    if (!key) continue;
    var score = cols[c].querySelectorAll('li').length +
      (cols[c].querySelector('.dropdown-cta') ? 1 : 0);
    if (!seen[key]) {
      seen[key] = { el: cols[c], score: score };
    } else if (score > seen[key].score) {
      seen[key].el.className += ' lme-dup-hide';
      seen[key] = { el: cols[c], score: score };
    } else {
      cols[c].className += ' lme-dup-hide';
    }
  }

  var btn = document.createElement('button');
  btn.className = 'lme-burger';
  btn.setAttribute('aria-label', 'Meny');
  btn.setAttribute('aria-expanded', 'false');
  btn.textContent = '☰';
  var right = header.querySelector('.header-right');
  if (right) right.insertBefore(btn, right.firstChild);
  else header.appendChild(btn);

  function close() {
    nav.classList.remove('lme-open');
    btn.setAttribute('aria-expanded', 'false');
  }

  btn.addEventListener('click', function (e) {
    e.stopPropagation();
    var open = nav.classList.toggle('lme-open');
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (open) {
      // Plasser panelet rett under headeren, og hold det innenfor skjermen
      // (dvh tar hensyn til Safari-verktøylinjene; vh er reserve).
      var bottom = Math.round(header.getBoundingClientRect().bottom);
      nav.style.top = (bottom + 8) + 'px';
      nav.style.maxHeight = 'calc(100vh - ' + (bottom + 24) + 'px)';
      try { nav.style.maxHeight = 'calc(100dvh - ' + (bottom + 24) + 'px)'; } catch (e2) {}
      nav.scrollTop = 0;
    }
  });

  nav.addEventListener('click', function (e) {
    if (e.target.closest('a')) close();      // lenke valgt: lukk panelet
  });
  document.addEventListener('click', function (e) {
    if (!e.target.closest('.nav') && !e.target.closest('.lme-burger')) close();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') close();
  });
})();
