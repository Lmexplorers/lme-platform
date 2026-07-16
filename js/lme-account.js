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
  // Samme kontoknapp for ALLE medlemmer på ALLE sider. Sider som hadde sin
  // egen kontomeny får den skjult (CSS under), så alle ser nøyaktig det samme.
  if (document.getElementById('lme-acct')) return; // aldri to

  function getPhoto() { try { return localStorage.getItem('lme_profile_photo') || ''; } catch (e) { return ''; } }
  function setPhoto(v) { try { if (v) localStorage.setItem('lme_profile_photo', v); else localStorage.removeItem('lme_profile_photo'); } catch (e) {} }

  // Forminsker bildet til et lite kvadrat, saa det er raskt og lite nok til
  // aa lagres paa kontoen (serveren har en grense).
  function shrink(file, cb) {
    var reader = new FileReader();
    reader.onload = function () {
      var img = new Image();
      img.onload = function () {
        var max = 256;
        var side = Math.min(img.width, img.height);
        var c = document.createElement('canvas');
        c.width = max; c.height = max;
        var g = c.getContext('2d');
        g.fillStyle = '#fff'; g.fillRect(0, 0, max, max);
        // midtstilt beskjaering til kvadrat
        var sx = (img.width - side) / 2, sy = (img.height - side) / 2;
        g.drawImage(img, sx, sy, side, side, 0, 0, max, max);
        cb(c.toDataURL('image/jpeg', 0.85));
      };
      img.onerror = function () { cb(null); };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  }

  // Forminsk et bilde som allerede er en data-URL (brukes til aa overfoere et
  // tidligere lokalt lagret bilde opp til kontoen).
  function shrinkSrc(src, cb) {
    var img = new Image();
    img.onload = function () {
      var max = 256, side = Math.min(img.width, img.height);
      var c = document.createElement('canvas'); c.width = max; c.height = max;
      var g = c.getContext('2d');
      g.fillStyle = '#fff'; g.fillRect(0, 0, max, max);
      var sx = (img.width - side) / 2, sy = (img.height - side) / 2;
      g.drawImage(img, sx, sy, side, side, 0, 0, max, max);
      cb(c.toDataURL('image/jpeg', 0.85));
    };
    img.onerror = function () { cb(null); };
    img.src = src;
  }

  function isEn() {
    var l = window.LME_CURRENT_LANG;
    if (l !== 'en' && l !== 'no') { try { l = localStorage.getItem('lme_lang') || 'no'; } catch (e) { l = 'no'; } }
    return l === 'en';
  }
  function t(no, en) { return isEn() ? en : no; }

  var state = { loggedIn: false, name: null, email: null, owner: false };

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
    /* Skjul sidenes egne kontomenyer, så den delte er den eneste (likt for alle) */
    '.avatar-wrapper { display: none !important; }',
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
    '<div id="lme-acct-menu" role="menu"></div>' +
    '<input type="file" id="lme-acct-file" accept="image/*" style="display:none">';
  (document.body || document.documentElement).appendChild(wrap);

  var btn = wrap.querySelector('#lme-acct-btn');
  var menu = wrap.querySelector('#lme-acct-menu');
  var fileInput = wrap.querySelector('#lme-acct-file');

  // Bildeopplasting: forminskes, vises med en gang (lokal buffer) og lagres
  // paa kontoen (serveren), saa det foelger deg paa alle sider og enheter.
  fileInput.addEventListener('change', function () {
    var f = this.files && this.files[0];
    this.value = '';
    if (!f) return;
    if (f.size > 8 * 1024 * 1024) { alert(t('Bildet er for stort. Velg et bilde under 8 MB.', 'Image too large. Choose one under 8 MB.')); return; }
    shrink(f, function (dataUrl) {
      if (!dataUrl) { alert(t('Kunne ikke lese bildet. Prøv et annet.', 'Could not read the image. Try another.')); return; }
      setPhoto(dataUrl);
      render();
      close();
      // lagre paa kontoen (best effort; bildet vises uansett lokalt)
      fetch('/api/auth/avatar', {
        method: 'POST', credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatar: dataUrl })
      }).catch(function () {});
    });
  });

  function initial() {
    var n = (state.name || state.email || 'R').trim();
    return (n.charAt(0) || 'R').toUpperCase();
  }

  function item(href, ico, no, en) {
    return '<a href="' + href + '" role="menuitem"><span class="lme-acct-ico">' + ico + '</span><span>' + t(no, en) + '</span></a>';
  }

  function render() {
    var photo = getPhoto();
    if (photo) {
      btn.innerHTML = '';
      var im = document.createElement('img'); im.src = photo; im.alt = ''; btn.appendChild(im);
    } else {
      btn.textContent = state.loggedIn ? initial() : '👤';
    }
    btn.setAttribute('aria-label', t('Din konto', 'Your account'));
    var html = '';
    if (state.loggedIn) {
      if (state.name) {
        html += '<div class="lme-acct-name"><b>' + esc(state.name) + '</b>' +
          (state.email ? '<span>' + esc(state.email) + '</span>' : '') + '</div>';
      }
      html += item('/min-konto', '👤', 'Min konto', 'My account');
      html += item('/grupper/inner-circle', '🌸', 'Inner Circle', 'Inner Circle');
      html += '<button type="button" id="lme-acct-upload"><span class="lme-acct-ico">📷</span><span>' +
        t('Last opp bilde', 'Upload photo') + '</span></button>';
      html += item('/butikk', '🛍️', 'LME Butikk', 'LME Shop');
      html += item('/perks', '⭐', 'LME Perks', 'LME Perks');
      html += item('/oppgrader', '✨', 'Oppgrader plan', 'Upgrade plan');
      html += item('/wins', '💗', 'Del din seier', 'Share your win');
      html += '<div class="lme-acct-div"></div>';
      html += item('/om-renate', '🌷', 'Om Renate', 'About Renate');
      html += item('/spor-renate-ai', '💬', 'Spør Renate AI', 'Ask Renate AI');
      // Byggerverktøy: kun synlig for deg som eier, på alle sider.
      if (state.owner) {
        html += '<div class="lme-acct-div"></div>';
        html += item('/gruppebygger', '🧩', 'Gruppebygger', 'Group builder');
        html += item('/kursbygger', '🎓', 'Kursbygger', 'Course builder');
      }
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
    var up = menu.querySelector('#lme-acct-upload');
    if (up) up.addEventListener('click', function (e) { e.preventDefault(); fileInput.click(); });
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
        state.owner = d.user.role === 'owner';
        // Kontoens bilde er fasit: speil det til lokal buffer, saa det vises
        // likt paa alle sider (og paa nye enheter etter innlogging).
        if (d.user.avatar) {
          setPhoto(d.user.avatar);
        } else {
          // Har kontoen ikke bilde ennaa, men nettleseren har et gammelt lokalt
          // bilde? Overfoer det (forminsket) til kontoen, saa det foelger deg.
          var local = getPhoto();
          if (local) shrinkSrc(local, function (sm) {
            if (!sm) return;
            setPhoto(sm); render();
            fetch('/api/auth/avatar', {
              method: 'POST', credentials: 'same-origin',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ avatar: sm })
            }).catch(function () {});
          });
        }
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
