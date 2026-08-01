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

/* Last måling på alle sider: anonym funnel-sporing (lme-track.js) og
   samtykke-boks som styrer Meta-pixelen (lme-consent.js). Egne filer,
   kjører uavhengig av kontoknappen. */
(function () {
  try {
    if (window.__lmeTrackLoaded) return;
    window.__lmeTrackLoaded = true;
    ["/js/lme-track.js?v=1", "/js/lme-consent.js?v=1"].forEach(function (src) {
      var s = document.createElement("script");
      s.src = src;
      s.defer = true;
      (document.head || document.documentElement).appendChild(s);
    });
  } catch (e) {}
})();

(function () {
  // Samme kontoknapp for ALLE medlemmer på ALLE sider. Sider som hadde sin
  // egen kontomeny får den skjult (CSS under), så alle ser nøyaktig det samme.
  if (document.getElementById('lme-acct')) return; // aldri to

  function getPhoto() { try { return localStorage.getItem('lme_profile_photo') || ''; } catch (e) { return ''; } }
  function setPhoto(v) { try { if (v) localStorage.setItem('lme_profile_photo', v); else localStorage.removeItem('lme_profile_photo'); } catch (e) {} }

  // Standardportrettet (samme som toppavatarene brukte). Vises for eier paa
  // alle sider naar det ikke er lastet opp et eget bilde, saa portrettet er
  // likt overalt og ikke bare der sidens egen avatar hadde et <img>.
  var isNathalieAIPage = window.location.pathname.includes('nathalie-ai') || window.location.pathname.includes('spor-nathalie-ai') || window.location.pathname.includes('ask-nathalie-ai');
  var OWNER_DEFAULT_PHOTO = isNathalieAIPage ? 'data:image/jpeg;base64,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' : '/images/renate-portrait.jpg';

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

  var state = { loggedIn: false, name: null, email: null, owner: false, member: false };

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
    /* Skjul sidenes egne konto-avatarer/menyer, så den delte er den eneste
       (likt for alle). Gjelder både .avatar-wrapper (med nedtrekk) og løse
       .avatar-btn (konto-bilde i toppen) som mange sider har. */
    '.avatar-wrapper, .avatar-btn { display: none !important; }',
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
    var photo = getPhoto() || (state.owner ? OWNER_DEFAULT_PHOTO : '');
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
      html += item('/spor-nathalie-ai', '💬', 'Spør Nathalie AI', 'Ask Nathalie AI');
      // Byggerverktøy: Gruppebygger og Kursbygger for alle medlemmer
      // (Medlem, Pro, VIP) og eier. Vises på alle sider.
      if (state.owner || state.member) {
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
      html += item('/spor-nathalie-ai', '💬', 'Spør Nathalie AI', 'Ask Nathalie AI');
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
        // Alle medlemmer (Medlem, Pro, VIP med aktivt abonnement) faar
        // byggerverktoeyene, i tillegg til eier.
        var sub = d.subscription;
        state.member = !!(sub && sub.status && !/cancel|inactive|expired|none/i.test(sub.status));
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
