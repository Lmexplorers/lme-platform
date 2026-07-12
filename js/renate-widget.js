/* =========================================================
   Renate AI — flytende veileder-widget for hele LME
   Legges inn på alle sider med:
   <script src="/js/renate-widget.js" defer></script>

   - Viser en flytende Renate AI-knapp nede til høyre
   - Chatten vet hvilken side brukeren står på (sendes som
     kontekst til /renate-ai)
   - Samtalen huskes i nettleseren (localStorage), og for
     innloggede brukere også i skyen via /api/renate-chats,
     så Renate husker på tvers av enheter og økter
   - Tospråklig: alle tekster har data-no/data-en og følger
     sidens switchLanguage-mønster
   ========================================================= */
(function () {
  'use strict';

  var path = (location.pathname || '/').replace(/\/+$/, '') || '/';

  // Ikke på selve chat-sidene (der er Renate AI allerede i fullversjon)
  if (path === '/spor-renate-ai' || path === '/ask-renate-ai') return;
  if (window.__lmeRenateWidget) return;
  window.__lmeRenateWidget = true;

  var API_URL = '/renate-ai';
  var STORAGE_KEY = 'lme_renate_widget_chat';
  var MAX_HISTORY_SENT = 12;   // backend tillater maks 30 meldinger
  var MAX_INPUT = 4000;        // backend tillater maks 4000 tegn

  // ---------- Språk ----------
  function lang() {
    return (document.documentElement.lang || 'no').indexOf('en') === 0 ? 'en' : 'no';
  }
  function t(no, en) { return lang() === 'en' ? en : no; }

  // ---------- Hvilket område av plattformen er brukeren i? ----------
  function currentArea() {
    var p = path;
    if (/creative-academy|creator-academy|kursbygger|lme-builder|bookly|blogg|blog\b|podkast|websites|courses|email|automations|forms|surveys|quizzes|subscribers|payments|produkter|pipeline|analytics|ai-visibility|ai-traffic|domener|business-profile|lme-visibility/.test(p)) {
      return 'LME Creative Academy';
    }
    if (/community|medlemmer|grupper|wins|perks|live|replays|webinars|meldinger|medlem\b/.test(p)) {
      return 'LME Community';
    }
    if (/butikk|oppgrader/.test(p)) {
      return 'LME Shop';
    }
    if (/academy|biblioteket|ressurser|musikk|mia-og-teo|laer-norsk|oppdageroya|skoledagbok|maler/.test(p)) {
      return 'LME Montessori';
    }
    return 'LME-plattformen';
  }

  function buildContext() {
    return 'Brukeren er akkurat nå på siden "' + (document.title || path) + '"' +
      ' (sti: ' + path + ', område: ' + currentArea() + ').' +
      ' Språket på siden er ' + (lang() === 'en' ? 'engelsk' : 'norsk') + '.';
  }

  // ---------- Samtaleminne ----------
  // Lokalt: localStorage (overlever at nettleseren lukkes).
  // Innlogget: også i skyen via /api/renate-chats, så samtalen
  // følger brukeren på tvers av enheter.
  var cloudLoggedIn = false;
  var cloudTimer = null;

  function loadHistory() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      var arr = raw ? JSON.parse(raw) : [];
      return Array.isArray(arr) ? arr : [];
    } catch (e) { return []; }
  }
  function saveHistory(hist) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(hist.slice(-30))); } catch (e) {}
    scheduleCloudSave(hist);
  }
  function scheduleCloudSave(hist) {
    if (!cloudLoggedIn) return;
    clearTimeout(cloudTimer);
    cloudTimer = setTimeout(function () {
      fetch('/api/renate-chats', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slot: 'widget', data: hist.slice(-30) })
      }).catch(function () {});
    }, 600);
  }
  var history = loadHistory();

  // ---------- Stiler ----------
  var css = [
    "@font-face { font-family: 'Sasson Montessori';",
    "  src: url('/fonts/SassoonMontessori.woff2') format('woff2'),",
    "       url('/fonts/SassoonMontessori.ttf') format('truetype');",
    "  font-display: swap; }",
    '.rw-root { position: fixed; right: 20px; bottom: 20px; z-index: 99999;',
    "  font-family: 'Sasson Montessori','Playpen Sans',system-ui,sans-serif; }",
    '.rw-btn { border: none; cursor: pointer; border-radius: 999px; padding: 7px 18px 7px 8px;',
    '  background: linear-gradient(135deg, #E91E89, #EE9CAD); color: #fff;',
    '  display: flex; align-items: center; gap: 10px;',
    "  font-family: 'Sasson Montessori','Playpen Sans',system-ui,sans-serif; font-size: 15px; font-weight: 700;",
    '  box-shadow: 0 6px 20px rgba(233,30,137,0.35); transition: transform .15s ease, box-shadow .15s ease; }',
    '.rw-btn:hover { transform: translateY(-2px); box-shadow: 0 10px 26px rgba(233,30,137,0.45); }',
    '.rw-btn-avatar { position: relative; width: 38px; height: 38px; border-radius: 50%; flex: 0 0 auto;',
    '  background: rgba(255,255,255,0.25); border: 2px solid rgba(255,255,255,0.85); overflow: hidden;',
    "  display: flex; align-items: center; justify-content: center; font-family: 'Playpen Sans',system-ui,sans-serif;",
    '  font-size: 16px; font-weight: 700; color: #fff; }',
    '.rw-btn-avatar img, .rw-avatar img { position: absolute; inset: 0; width: 100%; height: 100%;',
    '  object-fit: cover; object-position: center 25%; }',
    '.rw-btn-label { white-space: nowrap; }',
    '.rw-panel { position: absolute; right: 0; bottom: 72px; width: min(380px, calc(100vw - 32px));',
    '  height: min(560px, calc(100vh - 120px)); background: #fff; border-radius: 20px;',
    '  border: 1px solid rgba(26,26,26,0.08); box-shadow: 0 12px 40px rgba(26,26,26,0.16);',
    '  display: none; flex-direction: column; overflow: hidden; }',
    '.rw-root.open .rw-panel { display: flex; }',
    '.rw-head { display: flex; align-items: center; gap: 10px; padding: 14px 16px;',
    '  background: linear-gradient(135deg, #FBF6F0, #F8D7DA); border-bottom: 1px solid rgba(26,26,26,0.06); }',
    '.rw-avatar { position: relative; width: 38px; height: 38px; border-radius: 50%; flex: 0 0 auto; overflow: hidden;',
    '  background: linear-gradient(135deg, #E91E89, #EE9CAD); color: #fff; display: flex;',
    "  align-items: center; justify-content: center; font-family: 'Playpen Sans',system-ui,sans-serif;",
    '  font-weight: 700; font-size: 17px; }',
    ".rw-head h4 { margin: 0; font-family: 'Playpen Sans',system-ui,sans-serif; font-size: 15px; color: #1A1A1A; }",
    '.rw-head p { margin: 0; font-size: 12px; color: #4A4A4A; }',
    '.rw-close { margin-left: auto; border: none; background: none; cursor: pointer; font-size: 18px;',
    '  color: #4A4A4A; padding: 4px 6px; border-radius: 8px; }',
    '.rw-close:hover { background: rgba(26,26,26,0.06); }',
    '.rw-msgs { flex: 1; overflow-y: auto; padding: 14px; display: flex; flex-direction: column; gap: 10px;',
    '  background: #FDFBF8; }',
    '.rw-msg { max-width: 85%; padding: 9px 13px; border-radius: 14px; font-size: 14px; line-height: 1.5;',
    '  color: #1A1A1A; white-space: normal; word-wrap: break-word; }',
    '.rw-msg.user { align-self: flex-end; background: #F8D7DA; border-bottom-right-radius: 4px; }',
    '.rw-msg.bot { align-self: flex-start; background: #fff; border: 1px solid rgba(26,26,26,0.08);',
    '  border-bottom-left-radius: 4px; }',
    '.rw-msg a { color: #E91E89; font-weight: 600; }',
    '.rw-typing { align-self: flex-start; font-size: 13px; color: #8A8A8A; padding: 4px 8px; }',
    '.rw-inputrow { display: flex; gap: 8px; padding: 10px 12px; border-top: 1px solid rgba(26,26,26,0.06);',
    '  background: #fff; align-items: center; }',
    '.rw-input { flex: 1; border: 1px solid rgba(26,26,26,0.12); border-radius: 999px; padding: 10px 14px;',
    "  font-family: 'Sasson Montessori','Playpen Sans',system-ui,sans-serif; font-size: 14px; outline: none; }",
    '.rw-input:focus { border-color: #EE9CAD; box-shadow: 0 0 0 3px rgba(238,156,173,0.2); }',
    '.rw-send { width: 40px; height: 40px; border-radius: 50%; border: none; cursor: pointer; flex: 0 0 auto;',
    '  background: #E91E89; color: #fff; font-size: 16px; display: flex; align-items: center; justify-content: center; }',
    '.rw-send:disabled { opacity: .5; cursor: default; }',
    '.rw-foot { text-align: center; padding: 6px 10px 9px; background: #fff; }',
    '.rw-foot a { font-size: 12px; color: #8A8A8A; text-decoration: none; }',
    '.rw-foot a:hover { color: #E91E89; }',
    '@media (max-width: 480px) {',
    '  .rw-root { right: 12px; bottom: 12px; }',
    '  .rw-panel { bottom: 66px; height: min(70vh, calc(100vh - 100px)); }',
    '}'
  ].join('\n');

  // ---------- HTML ----------
  var root = document.createElement('div');
  root.className = 'rw-root';
  root.innerHTML =
    '<div class="rw-panel" role="dialog" aria-label="Renate AI">' +
    '  <div class="rw-head">' +
    '    <div class="rw-avatar">R<img src="/images/renate-portrait.jpg" alt="" onerror="this.remove()"></div>' +
    '    <div>' +
    '      <h4>Renate AI</h4>' +
    '      <p data-no="Veilederen din på LME" data-en="Your guide on LME">Veilederen din på LME</p>' +
    '    </div>' +
    '    <button type="button" class="rw-close" aria-label="Lukk">✕</button>' +
    '  </div>' +
    '  <div class="rw-msgs"></div>' +
    '  <div class="rw-inputrow">' +
    '    <input type="text" class="rw-input" maxlength="' + MAX_INPUT + '">' +
    '    <button type="button" class="rw-send" aria-label="Send">➤</button>' +
    '  </div>' +
    '  <div class="rw-foot">' +
    '    <a href="/spor-renate-ai" data-no="Åpne hele Renate AI-samtalen" data-en="Open the full Renate AI chat">Åpne hele Renate AI-samtalen</a>' +
    '  </div>' +
    '</div>' +
    '<button type="button" class="rw-btn" aria-label="Spør Renate AI" title="Spør Renate AI">' +
    '  <span class="rw-btn-avatar">R<img src="/images/renate-portrait.jpg" alt="" onerror="this.remove()"></span>' +
    '  <span class="rw-btn-label" data-no="Spør Renate AI" data-en="Ask Renate AI">Spør Renate AI</span>' +
    '</button>';

  var style = document.createElement('style');
  style.textContent = css;

  function mount() {
    document.head.appendChild(style);
    document.body.appendChild(root);
    adjustPosition();
    // AI Visibility-knappen (.lme-vis-fab) injiseres av eget script litt
    // etter oss; sjekk noen ganger til så vi ikke legger oss oppå den
    setTimeout(adjustPosition, 500);
    setTimeout(adjustPosition, 1500);
    setTimeout(adjustPosition, 3000);
    init();
  }

  // Ligger det allerede en flytende knapp nede til høyre (AI Visibility),
  // legger Renate-knappen seg rett over den i stedet for oppå
  function adjustPosition() {
    var fab = document.querySelector('.lme-vis-fab');
    root.style.bottom = fab ? '88px' : '';
  }

  function init() {
    var btn = root.querySelector('.rw-btn');
    var panel = root.querySelector('.rw-panel');
    var closeBtn = root.querySelector('.rw-close');
    var msgsEl = root.querySelector('.rw-msgs');
    var input = root.querySelector('.rw-input');
    var sendBtn = root.querySelector('.rw-send');
    var footLink = root.querySelector('.rw-foot a');

    function applyLang() {
      input.placeholder = t('Skriv til Renate AI …', 'Write to Renate AI …');
      btn.title = t('Spør Renate AI', 'Ask Renate AI');
      btn.setAttribute('aria-label', btn.title);
      closeBtn.setAttribute('aria-label', t('Lukk', 'Close'));
      footLink.href = lang() === 'en' ? '/ask-renate-ai' : '/spor-renate-ai';
      // data-no/data-en-tekster oppdateres også av sidens eget språkbytte;
      // dette dekker sider uten switchLanguage og widget lastet etter bytte
      root.querySelectorAll('[data-no][data-en]').forEach(function (el) {
        var txt = el.getAttribute('data-' + lang());
        if (txt) el.textContent = txt;
      });
    }
    applyLang();
    new MutationObserver(applyLang)
      .observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });

    function escapeHtml(s) {
      return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }
    function renderText(text) {
      var out = escapeHtml(text);
      out = out.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
      out = out.replace(/\[([^\]]+)\]\((\/[^\s)]+|https?:\/\/[^\s)]+)\)/g, '<a href="$2">$1</a>');
      out = out.replace(/(^|[\s(])(\/[a-z0-9][a-z0-9\-\/]{2,})/g, '$1<a href="$2">$2</a>');
      return out.replace(/\n/g, '<br>');
    }

    function addBubble(role, text) {
      var el = document.createElement('div');
      el.className = 'rw-msg ' + (role === 'user' ? 'user' : 'bot');
      el.innerHTML = renderText(text);
      msgsEl.appendChild(el);
      msgsEl.scrollTop = msgsEl.scrollHeight;
      return el;
    }

    function showWelcome() {
      addBubble('bot', t(
        'Hei! 💗 Jeg er Renate AI, veilederen din her på LME. Jeg ser hvilken side du er på og hjelper deg videre. Hva lurer du på?',
        'Hi! 💗 I am Renate AI, your guide here on LME. I can see which page you are on and help you move forward. What can I help you with?'
      ));
    }

    function renderAll() {
      msgsEl.innerHTML = '';
      if (history.length) {
        history.forEach(function (m) { addBubble(m.role, m.content); });
      } else {
        showWelcome();
      }
    }

    // Vis tidligere samtale, ellers velkomst
    renderAll();

    // Innlogget? Hent samtalen fra skyen, den er fasit på tvers av enheter
    fetch('/api/renate-chats?slot=widget', { credentials: 'same-origin' })
      .then(function (r) { return r.json(); })
      .then(function (d) {
        if (!d || !d.loggedIn) return;
        cloudLoggedIn = true;
        if (Array.isArray(d.data) && d.data.length) {
          history = d.data;
          try { localStorage.setItem(STORAGE_KEY, JSON.stringify(history.slice(-30))); } catch (e) {}
          renderAll();
        } else if (history.length) {
          scheduleCloudSave(history); // første synk: last opp det lokale
        }
      })
      .catch(function () {});

    var sending = false;
    function send() {
      var text = (input.value || '').trim();
      if (!text || sending) return;
      sending = true;
      sendBtn.disabled = true;
      input.value = '';

      addBubble('user', text);
      history.push({ role: 'user', content: text });
      saveHistory(history);

      var typing = document.createElement('div');
      typing.className = 'rw-typing';
      typing.textContent = t('Renate AI skriver …', 'Renate AI is typing …');
      msgsEl.appendChild(typing);
      msgsEl.scrollTop = msgsEl.scrollHeight;

      fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: history.slice(-MAX_HISTORY_SENT),
          context: buildContext()
        })
      })
        .then(function (res) {
          return res.json().catch(function () { return {}; }).then(function (data) {
            if (!res.ok) throw new Error(data.error || ('HTTP ' + res.status));
            return data;
          });
        })
        .then(function (data) {
          typing.remove();
          var reply = data.reply || t('Beklager, jeg fikk ikke svar akkurat nå.', 'Sorry, I did not get an answer right now.');
          addBubble('bot', reply);
          history.push({ role: 'assistant', content: reply });
          saveHistory(history);
        })
        .catch(function (err) {
          typing.remove();
          addBubble('bot', t('Beklager, noe gikk galt. Prøv igjen om litt 🌷', 'Sorry, something went wrong. Please try again in a moment 🌷') +
            ' (' + err.message + ')');
        })
        .then(function () {
          sending = false;
          sendBtn.disabled = false;
          input.focus();
        });
    }

    btn.addEventListener('click', function () {
      root.classList.toggle('open');
      if (root.classList.contains('open')) input.focus();
    });
    closeBtn.addEventListener('click', function () { root.classList.remove('open'); });
    sendBtn.addEventListener('click', send);
    input.addEventListener('keypress', function (e) { if (e.key === 'Enter') send(); });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount);
  } else {
    mount();
  }
})();
