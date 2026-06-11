/* =========================================================
   LME Creative Academy — delt sidemeny
   Injiseres i <aside class="sidebar" id="sidebar"></aside>.
   Endre menyen KUN her — den gjelder da alle hub-sidene.
   Aktivt punkt settes automatisk ut fra URL-en.
   ========================================================= */
(function () {
  var SIDEBAR_HTML = [
    '<div class="sidebar-group">',
    '  <div class="sidebar-group-title"><span class="grp-emoji">📍</span> Start her</div>',
    '  <a href="/creative-academy#oversikt" class="sidebar-item"><span class="si-icon">🏡</span><span class="si-label">Oversikt</span></a>',
    '  <a href="/creative-academy#tutorials" class="sidebar-item"><span class="si-icon">🎓</span><span class="si-label">Tutorials</span></a>',
    '  <a href="/utforsk" class="sidebar-item"><span class="si-icon">🧭</span><span class="si-label">Utforsk</span></a>',
    '</div>',
    '<div class="sidebar-group">',
    '  <div class="sidebar-group-title"><span class="grp-emoji">🛠️</span> Verktøy</div>',
    '  <a href="/lme-builder" class="sidebar-item" data-tool="builder"><span class="si-icon">✨</span><span class="si-label">LME Builder</span></a>',
    '  <a href="/bookly/" class="sidebar-item"><span class="si-icon">📚</span><span class="si-label">LME Bookly</span><span class="si-badge beta">Ny</span></a>',
    '  <a href="https://lme-conten-studio-no-eng.pages.dev" class="sidebar-item"><span class="si-icon">🎨</span><span class="si-label">Content Studio</span></a>',
    '  <a href="/spor-renate-ai" class="sidebar-item"><span class="si-icon">💗</span><span class="si-label">Renate AI</span></a>',
    '  <a href="/ai-visibility" class="sidebar-item"><span class="si-icon">🔍</span><span class="si-label">AI Visibility</span><span class="si-badge beta">Ny</span></a>',
    '</div>',
    '<div class="sidebar-group">',
    '  <div class="sidebar-group-title"><span class="grp-emoji">👥</span> Kunder &amp; salg</div>',
    '  <a href="/funnel/oversikt.html" class="sidebar-item"><span class="si-icon">🪝</span><span class="si-label">Tripwire-funnel</span><span class="si-badge beta">Ny</span></a>',
    '  <a href="/subscribers" class="sidebar-item"><span class="si-icon">👤</span><span class="si-label">Subscribers</span></a>',
    '  <a href="/payments" class="sidebar-item"><span class="si-icon">💳</span><span class="si-label">Payments</span></a>',
    '  <a href="/produkter" class="sidebar-item"><span class="si-icon">🛍️</span><span class="si-label">Produkter</span></a>',
    '  <a href="/pipeline" class="sidebar-item"><span class="si-icon">📈</span><span class="si-label">Sales pipeline</span></a>',
    '  <a href="/analytics" class="sidebar-item"><span class="si-icon">📊</span><span class="si-label">Analyse</span></a>',
    '</div>',
    '<div class="sidebar-group">',
    '  <div class="sidebar-group-title"><span class="grp-emoji">💌</span> Markedsføring</div>',
    '  <a href="/forms" class="sidebar-item"><span class="si-icon">📝</span><span class="si-label">Forms</span></a>',
    '  <a href="/surveys" class="sidebar-item"><span class="si-icon">📋</span><span class="si-label">Surveys</span></a>',
    '  <a href="/quizzes" class="sidebar-item"><span class="si-icon">❓</span><span class="si-label">Quizzes</span></a>',
    '  <a href="/email" class="sidebar-item"><span class="si-icon">📧</span><span class="si-label">Email</span></a>',
    '  <a href="/automations" class="sidebar-item"><span class="si-icon">⚡</span><span class="si-label">Automations</span></a>',
    '</div>',
    '<div class="sidebar-group">',
    '  <div class="sidebar-group-title"><span class="grp-emoji">🎨</span> Innhold</div>',
    '  <a href="/websites" class="sidebar-item"><span class="si-icon">🌐</span><span class="si-label">Websites</span></a>',
    '  <a href="/courses" class="sidebar-item"><span class="si-icon">🎬</span><span class="si-label">Courses</span></a>',
    '  <a href="/webinars" class="sidebar-item"><span class="si-icon">🎥</span><span class="si-label">Webinars</span></a>',
    '  <a href="/biblioteket" class="sidebar-item"><span class="si-icon">📂</span><span class="si-label">Library</span></a>',
    '  <a href="/community" class="sidebar-item"><span class="si-icon">🌸</span><span class="si-label">Community</span><span class="si-badge beta">Beta</span></a>',
    '</div>',
    '<div class="sidebar-divider"></div>',
    '<div class="sidebar-group">',
    '  <div class="sidebar-group-title"><span class="grp-emoji">⚙️</span> Innstillinger</div>',
    '  <a href="/business-profile" class="sidebar-item"><span class="si-icon">🏢</span><span class="si-label">Forretningsprofil</span></a>',
    '  <a href="/domener" class="sidebar-item"><span class="si-icon">🌐</span><span class="si-label">Domener</span></a>',
    '  <a href="/min-konto" class="sidebar-item"><span class="si-icon">🌷</span><span class="si-label">Merke</span></a>',
    '  <a href="/min-konto" class="sidebar-item"><span class="si-icon">⚙️</span><span class="si-label">Innstillinger</span></a>',
    '  <a href="/help/contact" class="sidebar-item"><span class="si-icon">💬</span><span class="si-label">Hjelp &amp; kontakt</span></a>',
    '</div>',
    '<div class="sidebar-ai-card">',
    '  <div class="ai-avatar">R</div>',
    '  <p>Trenger du veiledning eller hjelp med et verktøy?</p>',
    '  <a href="/spor-renate-ai">Spør Renate AI</a>',
    '</div>'
  ].join('\n');

  var el = document.getElementById('sidebar');
  if (!el) return;
  el.innerHTML = SIDEBAR_HTML;

  // Sett aktivt punkt ut fra gjeldende sti
  var path = (location.pathname || '/').replace(/\/+$/, '') || '/';
  var matched = false;
  var links = el.querySelectorAll('a.sidebar-item');
  for (var i = 0; i < links.length; i++) {
    var href = links[i].getAttribute('href') || '';
    if (/^https?:/.test(href)) continue;            // hopp over eksterne lenker
    var base = href.split('#')[0].replace(/\/+$/, '');
    if (base && base === path && !matched) {
      links[i].classList.add('active');
      matched = true;                                 // bare ett punkt aktivt
    }
  }
  // På hub-en (/creative-academy) er Oversikt aktiv som standard
  if (!matched && path === '/creative-academy') {
    if (links[0]) links[0].classList.add('active');
  }
})();
