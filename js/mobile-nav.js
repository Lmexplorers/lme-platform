/* =========================================================
   LME — mobilmeny for toppnavigasjonen (delt)
   Sidene med <nav class="nav" id="nav"> skjuler menyen på
   mobil. Dette skriptet legger til en hamburgerknapp og gjør
   menyen om til et nedtrekkspanel på små skjermer.
   Endre mobilmenyen KUN her — gjelder alle sidene.
   ========================================================= */
(function () {
  var nav = document.getElementById('nav');
  var header = nav && nav.closest('.header');
  if (!nav || !header) return;

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
    '    padding: 10px; z-index: 1200; overflow-y: auto; gap: 2px; }',
    '  .nav.lme-open { display: flex !important; }',
    '  .nav .nav-item { position: static; width: 100%; }',
    '  .nav .nav-btn { width: 100%; justify-content: space-between; font-size: 15px; }',
    '  .nav .dropdown { position: static; min-width: 0; width: 100%;',
    '    grid-template-columns: 1fr; gap: 16px; box-shadow: none; border: none;',
    '    padding: 2px 10px 12px; margin-top: 0; }',
    '  .nav .dropdown::before { display: none; }',
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
      // Plasser panelet rett under headeren, uansett hvor høy den er
      var r = header.getBoundingClientRect();
      nav.style.top = Math.round(r.bottom + 8) + 'px';
      nav.style.maxHeight = 'calc(100vh - ' + Math.round(r.bottom + 24) + 'px)';
    }
  });

  /* Reserve-toggle for sider uten egen dropdown-JS. På sider som har den,
     stopper den egne handleren hendelsen, så denne kjører ikke dobbelt. */
  nav.addEventListener('click', function (e) {
    var a = e.target.closest('a');
    if (a) { close(); return; }                 // lenke valgt: lukk panelet
    var b = e.target.closest('.nav-btn');
    if (!b) return;
    var item = b.closest('.nav-item');
    if (!item) return;
    var was = item.classList.contains('open');
    var openItems = nav.querySelectorAll('.nav-item.open');
    for (var i = 0; i < openItems.length; i++) openItems[i].classList.remove('open');
    if (!was) item.classList.add('open');
  });

  document.addEventListener('click', function (e) {
    if (!e.target.closest('.nav') && !e.target.closest('.lme-burger')) close();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') close();
  });
})();
