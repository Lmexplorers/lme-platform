/* =========================================================
   LME — delt kontoknapp (bildet + nedtrekksmeny) på ALLE sider.
   Ligger øverst til høyre på hver side som laster dette skriptet.
   Trykk på bildet -> nedtrekksmeny til din egen konto.

   - Henter innloggingsstatus fra /api/auth/me.
   - Innlogget: viser initial/bilde og full meny med Logg ut.
   - Utlogget: viser en nøytral knapp og "Logg inn".
   - Hopper over sider som allerede har sin egen avatar-meny
     (#avatarMenu / .avatar-wrapper), så det aldri blir to.
   - Tospråklig: følger window.LME_CURRENT_LANG og språkbytte.
   Endre kontoknappen KUN her — den gjelder da alle sidene.
   ========================================================= */
(function () {
  // Har siden allerede en egen kontomeny? Da gjør vi ingenting.
  if (document.getElementById('avatarMenu') || document.querySelector('.avatar-wrapper')) return;
  if (document.getElementById('lme-acct')) return; // aldri to

  function isEn() {
    var l = window.LME_CURRENT_LANG;
    if (l !== 'en' && l !== 'no') { try { l = localStorage.getItem('lme_lang') || 'no'; } catch (e) { l = 'no'; } }
    return l === 'en';
  }
  function t(no, en) { return isEn() ? en : no; }

  var state = { loggedIn: false, name: null, email: null };

  /* --- Stiler (selvstendige, kolliderer ikke med sidens egne) --- */
  var css = [
    '#lme-acct { position: fixed; top: 12px; right: 14px; z-index: 2147483200; }',
    '#lme-acct-btn { width: 42px; height: 42px; border-radius: 50%; border: 2px solid #fff; cursor: pointer;',
    '  background: linear-gradient(135deg, #F5A8B8, #E91E89); color: #fff; font-family: "Playpen Sans", system-ui, sans-serif;',
    '  font-weight: 700; font-size: 17px; display: flex; align-items: center; justify-content: center;',
    '  box-shadow: 0 6px 18px rgba(43,30,46,.28); padding: 0; overflow: hidden; }',
    '#lme-acct-btn img { width: 100%; height: 100%; object-fit: cover; display: block; }',
    '#lme-acct-btn:hover { transform: translateY(-1px); }',
    '#lme-acct-menu { position: absolute; top: 52px; right: 0; min-width: 226px; background: #fff;',
    '  border: 1px solid #f3dce6; border-radius: 16px; box-shadow: 0 22px 60px rgba(43,30,46,.24);',
    '  padding: 8px; display: none; font-family: "Sasson Montessori", "Playpen Sans", system-ui, sans-serif; }',
    '#lme-acct.open #lme-acct-menu { display: block; }',
    '#lme-acct-menu .lme-acct-name { padding: 8px 12px 10px; border-bottom: 1px solid #f3e3e9; margin-bottom: 6px; }',
    '#lme-acct-menu .lme-acct-name b { display: block; font-family: "Playpen Sans", sans-serif; font-size: 14px; color: #2a1e2e; }',
    '#lme-acct-menu .lme-acct-name span { font-size: 12px; color: #9a7b85; }',
    '#lme-acct-menu a, #lme-acct-menu button { display: flex; align-items: center; gap: 10px; width: 100%;',
    '  text-align: left; text-decoration: none; background: none; border: 0; cursor: pointer;',
    '  color: #2a1e2e; font-family: inherit; font-size: 14px; padding: 9px 12px; border-radius: 10px; }',
    '#lme-acct-menu a:hover, #lme-acct-menu button:hover { background: #FCEFF2; color: #c2255c; }',
    '#lme-acct-menu .lme-acct-ico { width: 20px; text-align: center; font-size: 15px; flex: none; }',
    '#lme-acct-menu .lme-acct-div { height: 1px; background: #f3e3e9; margin: 6px 4px; }',
    '@media (max-width: 768px) { #lme-acct { top: 10px; right: 12px; } }'
  ].join('\n');
  var st = document.createElement('style');
  st.textContent = css;
  (document.head || document.documentElement).appendChild(st);

  /* --- Bygg knapp + meny --- */
  var wrap = document.createElement('div');
  wrap.id = 'lme-acct';
  wrap.innerHTML =
    '<button id="lme-acct-btn" type="button" aria-label="' + t('Din konto', 'Your account') + '" aria-expanded="false"></button>' +
    '<div id="lme-acct-menu" role="menu"></div>';
  (document.body || document.documentElement).appendChild(wrap);

  var btn = wrap.querySelector('#lme-acct-btn');
  var menu = wrap.querySelector('#lme-acct-menu');

  function initial() {
    var n = (state.name || state.email || 'R').trim();
    return (n.charAt(0) || 'R').toUpperCase();
  }

  function item(href, ico, no, en) {
    return '<a href="' + href + '" role="menuitem"><span class="lme-acct-ico">' + ico + '</span><span>' + t(no, en) + '</span></a>';
  }

  function render() {
    btn.textContent = state.loggedIn ? initial() : '👤';
    btn.setAttribute('aria-label', t('Din konto', 'Your account'));
    var html = '';
    if (state.loggedIn) {
      if (state.name) {
        html += '<div class="lme-acct-name"><b>' + esc(state.name) + '</b>' +
          (state.email ? '<span>' + esc(state.email) + '</span>' : '') + '</div>';
      }
      html += item('/min-konto', '👤', 'Min konto', 'My account');
      html += item('/butikk', '🛍️', 'LME Butikk', 'LME Shop');
      html += item('/perks', '⭐', 'LME Perks', 'LME Perks');
      html += item('/oppgrader', '✨', 'Oppgrader plan', 'Upgrade plan');
      html += item('/wins', '💗', 'Del din seier', 'Share your win');
      html += '<div class="lme-acct-div"></div>';
      html += item('/om-renate', '🌷', 'Om Renate', 'About Renate');
      html += item('/spor-renate-ai', '💬', 'Spør Renate AI', 'Ask Renate AI');
      html += '<div class="lme-acct-div"></div>';
      html += '<button type="button" id="lme-acct-logout"><span class="lme-acct-ico">🚪</span><span>' +
        t('Logg ut', 'Log out') + '</span></button>';
    } else {
      html += item('/login?next=' + encodeURIComponent(location.pathname), '🔑', 'Logg inn', 'Log in');
      html += '<div class="lme-acct-div"></div>';
      html += item('/om-renate', '🌷', 'Om Renate', 'About Renate');
      html += item('/butikk', '🛍️', 'LME Butikk', 'LME Shop');
      html += item('/spor-renate-ai', '💬', 'Spør Renate AI', 'Ask Renate AI');
    }
    menu.innerHTML = html;
    var lo = menu.querySelector('#lme-acct-logout');
    if (lo) lo.addEventListener('click', function () {
      fetch('/api/auth/logout', { method: 'POST', credentials: 'same-origin' })
        .then(function () { location.replace('/login'); })
        .catch(function () { location.replace('/login'); });
    });
  }

  function esc(s) { var d = document.createElement('div'); d.textContent = s == null ? '' : String(s); return d.innerHTML; }

  function open() { wrap.classList.add('open'); btn.setAttribute('aria-expanded', 'true'); }
  function close() { wrap.classList.remove('open'); btn.setAttribute('aria-expanded', 'false'); }

  btn.addEventListener('click', function (e) {
    e.stopPropagation();
    if (wrap.classList.contains('open')) close(); else open();
  });
  document.addEventListener('click', function (e) {
    if (!e.target.closest('#lme-acct')) close();
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });

  render();

  // Innloggingsstatus: fyll inn navn og bytt meny når vi vet hvem det er.
  fetch('/api/auth/me', { credentials: 'same-origin' })
    .then(function (r) { return r.json(); })
    .then(function (d) {
      if (d && d.user) {
        state.loggedIn = true;
        state.name = d.user.name || null;
        state.email = d.user.email || null;
      }
      render();
    })
    .catch(function () { /* behold utlogget-visning */ });

  // Følg språkbytte.
  window.addEventListener('lme-lang', render);
  var origToggle = window.lmeToggleLang;
  if (typeof origToggle === 'function' && !origToggle.__lmeAcct) {
    window.lmeToggleLang = function () { var r = origToggle.apply(this, arguments); render(); return r; };
    window.lmeToggleLang.__lmeAcct = true;
  }
})();
