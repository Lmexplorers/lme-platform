/* =========================================================
   LME Creative Academy — delt sidemeny
   Injiseres i <aside class="sidebar" id="sidebar"></aside>.
   Endre menyen KUN her — den gjelder da alle hub-sidene.
   Aktivt punkt settes automatisk ut fra URL-en.
   ========================================================= */
(function () {
  var SIDEBAR_HTML = [
    '<div class="sidebar-group">',
    '  <div class="sidebar-group-title"><span class="grp-emoji">📍</span> <span data-no="Start her" data-en="Start here">Start her</span></div>',
    '  <a href="/creative-academy#oversikt" class="sidebar-item"><span class="si-icon">🏡</span><span class="si-label" data-no="Oversikt" data-en="Overview">Oversikt</span></a>',
    '  <a href="/creative-academy#tutorials" class="sidebar-item"><span class="si-icon">🎓</span><span class="si-label">Tutorials</span></a>',
    '  <a href="/utforsk" class="sidebar-item"><span class="si-icon">🧭</span><span class="si-label" data-no="Utforsk" data-en="Explore">Utforsk</span></a>',
    '</div>',
    '<div class="sidebar-group">',
    '  <div class="sidebar-group-title"><span class="grp-emoji">🛠️</span> <span data-no="Verktøy" data-en="Tools">Verktøy</span></div>',
    '  <a href="/lme-builder" class="sidebar-item" data-tool="builder"><span class="si-icon">✨</span><span class="si-label">LME Builder</span></a>',
    '  <a href="/bookly/" class="sidebar-item"><span class="si-icon">📚</span><span class="si-label">LME Bookly</span><span class="si-badge beta" data-no="Ny" data-en="New">Ny</span></a>',
    '  <a href="https://lme-conten-studio-no-eng.pages.dev" class="sidebar-item"><span class="si-icon">🎨</span><span class="si-label">Content Studio</span></a>',
    '  <a href="/spor-renate-ai" class="sidebar-item"><span class="si-icon">💗</span><span class="si-label">Renate AI</span></a>',
    '  <a href="/ai-visibility" class="sidebar-item"><span class="si-icon">🔍</span><span class="si-label">AI Visibility</span><span class="si-badge beta" data-no="Ny" data-en="New">Ny</span></a>',
    '</div>',
    '<div class="sidebar-group">',
    '  <div class="sidebar-group-title"><span class="grp-emoji">👥</span> <span data-no="Kunder &amp; salg" data-en="Customers &amp; sales">Kunder &amp; salg</span></div>',
    '  <a href="/funnel/oversikt.html" class="sidebar-item"><span class="si-icon">🪝</span><span class="si-label" data-no="Tripwire-funnel" data-en="Tripwire funnel">Tripwire-funnel</span><span class="si-badge beta" data-no="Ny" data-en="New">Ny</span></a>',
    '  <a href="/subscribers" class="sidebar-item"><span class="si-icon">👤</span><span class="si-label">Subscribers</span></a>',
    '  <a href="/payments" class="sidebar-item"><span class="si-icon">💳</span><span class="si-label">Payments</span></a>',
    '  <a href="/produkter" class="sidebar-item"><span class="si-icon">🛍️</span><span class="si-label" data-no="Produkter" data-en="Products">Produkter</span></a>',
    '  <a href="/pipeline" class="sidebar-item"><span class="si-icon">📈</span><span class="si-label">Sales pipeline</span></a>',
    '  <a href="/analytics" class="sidebar-item"><span class="si-icon">📊</span><span class="si-label" data-no="Analyse" data-en="Analytics">Analyse</span></a>',
    '</div>',
    '<div class="sidebar-group">',
    '  <div class="sidebar-group-title"><span class="grp-emoji">💌</span> <span data-no="Markedsføring" data-en="Marketing">Markedsføring</span></div>',
    '  <a href="/forms" class="sidebar-item"><span class="si-icon">📝</span><span class="si-label">Forms</span></a>',
    '  <a href="/surveys" class="sidebar-item"><span class="si-icon">📋</span><span class="si-label">Surveys</span></a>',
    '  <a href="/quizzes" class="sidebar-item"><span class="si-icon">❓</span><span class="si-label">Quizzes</span></a>',
    '  <a href="/email" class="sidebar-item"><span class="si-icon">📧</span><span class="si-label">Email</span></a>',
    '  <a href="/automations" class="sidebar-item"><span class="si-icon">⚡</span><span class="si-label">Automations</span></a>',
    '</div>',
    '<div class="sidebar-group">',
    '  <div class="sidebar-group-title"><span class="grp-emoji">🎨</span> <span data-no="Innhold" data-en="Content">Innhold</span></div>',
    '  <a href="/websites" class="sidebar-item"><span class="si-icon">🌐</span><span class="si-label">Websites</span></a>',
    '  <a href="/courses" class="sidebar-item"><span class="si-icon">🎬</span><span class="si-label">Courses</span></a>',
    '  <a href="/webinars" class="sidebar-item"><span class="si-icon">🎥</span><span class="si-label">Webinars</span></a>',
    '  <a href="/biblioteket" class="sidebar-item"><span class="si-icon">📂</span><span class="si-label">Library</span></a>',
    '  <a href="/community" class="sidebar-item"><span class="si-icon">🌸</span><span class="si-label">Community</span><span class="si-badge beta">Beta</span></a>',
    '</div>',
    '<div class="sidebar-divider"></div>',
    '<div class="sidebar-group">',
    '  <div class="sidebar-group-title"><span class="grp-emoji">⚙️</span> <span data-no="Innstillinger" data-en="Settings">Innstillinger</span></div>',
    '  <a href="/business-profile" class="sidebar-item"><span class="si-icon">🏢</span><span class="si-label" data-no="Forretningsprofil" data-en="Business profile">Forretningsprofil</span></a>',
    '  <a href="/domener" class="sidebar-item"><span class="si-icon">🌐</span><span class="si-label" data-no="Domener" data-en="Domains">Domener</span></a>',
    '  <a href="/min-konto" class="sidebar-item"><span class="si-icon">🌷</span><span class="si-label" data-no="Merke" data-en="Brand">Merke</span></a>',
    '  <a href="/min-konto" class="sidebar-item"><span class="si-icon">⚙️</span><span class="si-label" data-no="Innstillinger" data-en="Settings">Innstillinger</span></a>',
    '  <a href="/help/contact" class="sidebar-item"><span class="si-icon">💬</span><span class="si-label" data-no="Hjelp &amp; kontakt" data-en="Help &amp; contact">Hjelp &amp; kontakt</span></a>',
    '</div>',
    '<div class="sidebar-ai-card">',
    '  <div class="ai-avatar">R</div>',
    '  <p data-no="Trenger du veiledning eller hjelp med et verktøy?" data-en="Need guidance or help with a tool?">Trenger du veiledning eller hjelp med et verktøy?</p>',
    '  <a href="/spor-renate-ai" data-no="Spør Renate AI" data-en="Ask Renate AI">Spør Renate AI</a>',
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
