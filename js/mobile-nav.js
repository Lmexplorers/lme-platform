/* =========================================================
   LME — mobilmeny for toppnavigasjonen (delt)
   Sidene med <nav class="nav" id="nav"> skjuler menyen på
   mobil. Dette skriptet legger til en hamburgerknapp og gjør
   menyen om til et panel med HELE menyen ferdig utvidet.
   Endre mobilmenyen KUN her — gjelder alle sidene.
   ========================================================= */
(function () {
  var nav = document.getElementById('nav');
  var header = nav && nav.closest('.header');
  if (!nav || !header) return;

  /* Marker grupper som har undermeny, så de kan vises som overskrifter */
  var items = nav.querySelectorAll('.nav-item');
  for (var i = 0; i < items.length; i++) {
    if (items[i].querySelector('.dropdown')) items[i].className += ' lme-grp';
  }

  /* --- Stiler --- */
  var css = [
    '.lme-burger { display: none; align-items: center; justify-content: center;',
    '  width: 40px; height: 40px; border-radius: 999px; border: none;',
    '  background: rgba(248,215,218,.5); color: #2a1e2e; font-size: 19px;',
    '  cursor: pointer; flex: none; }',
    '@media (max-width: 768px) {',
    '  .lme-burger { display: inline-flex !important; }',
    '  .nav { display: none !important; position: fixed; left: 12px; right: 12px;',
    '    flex-direction: column; background: #fff; border-radius: 22px;',
    '    box-shadow: 0 22px 60px rgba(43,30,46,.22); border: 1px solid #f3dce6;',
    '    padding: 6px 12px 14px; z-index: 1200; overflow-y: auto;',
    '    -webkit-overflow-scrolling: touch; gap: 0; }',
    '  .nav.lme-open { display: flex !important; }',
    '  .nav .nav-item { position: static; width: 100%; }',
    /* Gruppeknappene blir overskrifter; hele menyen vises ferdig utvidet */
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
    '}',
  ].join('\n');
  var st = document.createElement('style');
  st.textContent = css;
  document.head.appendChild(st);

  /* --- Hamburgerknapp --- */
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
