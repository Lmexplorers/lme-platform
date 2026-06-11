/* =====================================================================
   LME Bookly™ — applikasjon: ramme + alle visninger
   ===================================================================== */
(function () {
  'use strict';
  var BK = window.BK;
  var $ = BK.$, esc = BK.esc, t = BK.t, L = BK.L;

  /* =====================================================================
     RAMME (sidemeny + topplinje)
     ===================================================================== */
  BK.renderChrome = function () {
    var u = BK.state.user;
    var planNames = { free: 'Free', starter: 'Starter', pro: 'Pro', commercial: 'Commercial' };
    $('#bkSidebar').innerHTML =
      '<a class="bk-logo" href="#/dashboard">' +
      '<span class="mark">📚</span>' +
      '<span class="name">LME Bookly<span class="tm">™</span><small>Little Montessori Explorers</small></span></a>' +
      navGroup('', [
        ['/dashboard', '🏡', t('nav_dashboard')],
        ['/projects', '📂', t('nav_projects')],
        ['/templates', '🗂️', t('nav_templates')],
      ]) +
      navGroup(t('grp_create'), [
        ['/create/book', '📖', t('nav_book')],
        ['/create/workbook', '📝', t('nav_workbook')],
        ['/create/activity', '✂️', t('nav_activity')],
        ['/create/puzzle', '🧩', t('nav_puzzle')],
        ['/create/flashcards', '🃏', t('nav_flashcards')],
        ['/create/coloring', '🎨', t('nav_coloring')],
        ['/create/journal', '📔', t('nav_journal')],
        ['/create/planner', '🗓️', t('nav_planner')],
      ]) +
      navGroup(t('grp_design'), [
        ['/cover', '🖼️', t('nav_cover')],
        ['/prompts', '✨', t('nav_prompts')],
        ['/publishing', '🚀', t('nav_publishing')],
        ['/exports', '📤', t('nav_exports')],
      ]) +
      navGroup(t('grp_more'), [
        ['/settings', '⚙️', t('nav_settings')],
        ['/help', '💬', t('nav_help')],
      ]);

    $('#bkTopActions').innerHTML =
      '<span class="bk-plan-chip">' + (planNames[BK.state.plan] || 'Free') + '</span>' +
      '<button class="bk-lang" id="bkLang">' + (BK.lang() === 'no' ? 'EN 🌍' : 'NO 🇳🇴') + '</button>' +
      '<div class="bk-avatar" id="bkAvatar" title="' + (u ? esc(u.email) : (BK.lang() === 'no' ? 'Logg inn' : 'Sign in')) + '">' +
      (u ? esc((u.name || u.email || '?').charAt(0).toUpperCase()) : '👤') + '</div>';

    $('#bkLang').onclick = function () {
      BK.setLang(BK.lang() === 'no' ? 'en' : 'no');
      BK.renderChrome();
      BK.refresh();
    };
    $('#bkAvatar').onclick = function () {
      if (BK.state.user) BK.go('/settings');
      else location.href = '/login?next=' + encodeURIComponent('/bookly/');
    };
    $('#bkSearch').placeholder = t('search') + '…';
    $('#bkSearch').onkeydown = function (e) {
      if (e.key === 'Enter') { BK.searchQuery = this.value; BK.go('/projects'); BK.refresh(); }
    };
    $('#bkBurger').onclick = function () { $('#bkSidebar').classList.toggle('open'); };

    function navGroup(label, items) {
      return '<div class="bk-nav-group">' + (label ? '<div class="lbl">' + esc(label) + '</div>' : '') +
        items.map(function (it) {
          return '<a class="bk-nav-item" href="#' + it[0] + '"><span class="ico">' + it[1] + '</span>' + esc(it[2]) + '</a>';
        }).join('') + '</div>';
    }
  };

  function head(titleHtml, sub, actionsHtml) {
    return '<div class="bk-head-row"><div class="bk-page-head"><h1>' + titleHtml + '</h1>' +
      (sub ? '<p class="sub">' + esc(sub) + '</p>' : '') + '</div>' +
      (actionsHtml || '') + '</div>';
  }

  /* Skalert forhåndsvisning av en side */
  function mountSheets(container) {
    BK.$$('.bk-sheet', container).forEach(function (sh) {
      var wmm = parseFloat(sh.style.width);
      var pxW = wmm * 96 / 25.4;
      var wrap = document.createElement('div');
      wrap.className = 'bk-sheet-wrap';
      sh.parentNode.insertBefore(wrap, sh);
      wrap.appendChild(sh);
      function fit() {
        var avail = wrap.clientWidth;
        var scale = Math.min(1, avail / pxW);
        sh.style.transform = 'scale(' + scale + ')';
        sh.style.transformOrigin = 'top left';
        wrap.style.height = (parseFloat(sh.style.height) * 96 / 25.4 * scale) + 'px';
        sh.style.marginLeft = Math.max(0, (avail - pxW * scale) / 2) + 'px';
      }
      fit();
      window.addEventListener('resize', fit);
    });
  }

  function projCard(p) {
    var ty = BK.TYPES[p.type] || BK.TYPES.book;
    return '<div class="bk-proj" data-id="' + p.id + '">' +
      '<div class="thumb ' + ty.tint + '" data-open="' + p.id + '"><span class="typ">' + esc(L(ty.label)) + '</span>' +
      '<button class="fav' + (p.favorite ? ' on' : '') + '" data-fav="' + p.id + '" title="' + t('favorites') + '">💗</button>' +
      ty.icon + '</div>' +
      '<div class="body"><span class="nm" data-open="' + p.id + '">' + esc(p.title) + '</span>' +
      '<span class="mt">' + (p.pages ? p.pages.length : 0) + ' ' + t('pages').toLowerCase() + ' · ' + BK.fmtDate(p.updated) + '</span></div></div>';
  }
  function bindProjCards(root) {
    BK.$$('[data-open]', root).forEach(function (el) {
      el.onclick = function () { BK.go('/project/' + el.getAttribute('data-open')); };
    });
    BK.$$('[data-fav]', root).forEach(function (el) {
      el.onclick = function (e) {
        e.stopPropagation();
        var p = BK.getProject(el.getAttribute('data-fav'));
        if (p) { p.favorite = !p.favorite; BK.save(true); BK.refresh(); }
      };
    });
  }

  /* =====================================================================
     DASHBORD
     ===================================================================== */
  BK.route('/dashboard', function (root) {
    var no = BK.lang() === 'no';
    var u = BK.state.user;
    var name = u && u.name ? u.name.split(' ')[0] : (no ? 'kreatør' : 'creator');
    var projects = BK.state.projects.filter(function (p) { return !p.archived; });
    var recent = projects.slice().sort(function (a, b) { return b.updated - a.updated; }).slice(0, 4);
    var favs = projects.filter(function (p) { return p.favorite; }).slice(0, 4);
    var recTpl = BK.shuffle(BK.TEMPLATES).slice(0, 6);
    var pubProjects = projects.filter(function (p) { return p.publishing; }).slice(0, 4);

    var quicks = [
      ['/create/book', '📖', 'tint-pink', no ? 'Lag bok' : 'Create book', no ? 'Bildebøker og fortellinger' : 'Picture and story books'],
      ['/create/workbook', '📝', 'tint-blue', no ? 'Lag arbeidsbok' : 'Create workbook', no ? 'Oppgaver med fasit' : 'Exercises with answer key'],
      ['/create/activity', '✂️', 'tint-lime', no ? 'Lag aktivitetsbok' : 'Create activity book', no ? 'Klipp, koble og finn' : 'Cut, match and find'],
      ['/create/puzzle', '🧩', 'tint-lemon', no ? 'Lag puslebok' : 'Create puzzle book', no ? 'Sudoku, ordleting, labyrint' : 'Sudoku, word search, mazes'],
      ['/create/flashcards', '🃏', 'tint-blue', no ? 'Lag flashkort' : 'Create flashcards', no ? 'Også Montessori trepartskort' : 'Incl. Montessori 3-part cards'],
      ['/create/coloring', '🎨', 'tint-pink', no ? 'Lag fargebok' : 'Create coloring book', no ? 'Mandalaer og motiver' : 'Mandalas and artwork'],
      ['/create/journal', '📔', 'tint-lime', no ? 'Lag journal' : 'Create journal', no ? 'Takknemlighet og refleksjon' : 'Gratitude and reflection'],
      ['/create/planner', '🗓️', 'tint-lemon', no ? 'Lag planlegger' : 'Create planner', no ? 'Kalendere og vaner' : 'Calendars and habits'],
    ];

    root.innerHTML =
      head((no ? 'Hei, ' : 'Hello, ') + '<em>' + esc(name) + '</em> 🌸',
        no ? 'Hva skal vi skape i dag? Alt du lager kan eksporteres trykkeklart.' : 'What shall we create today? Everything you make can be exported print-ready.') +
      '<section class="bk-section"><h2>⚡ ' + (no ? 'Hurtighandlinger' : 'Quick actions') + '</h2>' +
      '<div class="bk-grid c4">' + quicks.map(function (q) {
        return '<a class="bk-quick" href="#' + q[0] + '"><span class="qi ' + q[2] + '">' + q[1] + '</span>' +
          '<span class="qt">' + esc(q[3]) + '</span><span class="qd">' + esc(q[4]) + '</span></a>';
      }).join('') + '</div></section>' +

      (recent.length ? '<section class="bk-section"><h2>🕐 ' + (no ? 'Fortsett der du slapp' : 'Continue editing') +
        '<a class="more" href="#/projects">' + (no ? 'Se alle' : 'View all') + ' →</a></h2>' +
        '<div class="bk-grid auto">' + recent.map(projCard).join('') + '</div></section>' : '') +

      (favs.length ? '<section class="bk-section"><h2>💗 ' + t('favorites') + '</h2>' +
        '<div class="bk-grid auto">' + favs.map(projCard).join('') + '</div></section>' : '') +

      '<section class="bk-section"><h2>🗂️ ' + (no ? 'Anbefalte maler' : 'Recommended templates') +
      '<a class="more" href="#/templates">' + (no ? 'Hele biblioteket' : 'Full library') + ' →</a></h2>' +
      '<div class="bk-grid auto">' + recTpl.map(tplCard).join('') + '</div></section>' +

      '<div class="bk-grid c2">' +
      '<section class="bk-section"><h2>📤 ' + (no ? 'Eksporthistorikk' : 'Export history') + '</h2>' +
      exportTable(BK.state.exports.slice(0, 5)) + '</section>' +
      '<section class="bk-section"><h2>🚀 ' + (no ? 'Publiseringsstatus' : 'Publishing status') + '</h2>' +
      (pubProjects.length ? pubProjects.map(function (p) {
        var done = Object.keys(p.publishing.done || {}).length;
        var total = p.publishing.total || 1;
        var pct = Math.min(100, Math.round(done / total * 100));
        return '<div class="bk-card" style="margin-bottom:10px;padding:14px 16px">' +
          '<div style="display:flex;justify-content:space-between;font-weight:800;font-size:13px;margin-bottom:6px">' +
          '<span>' + esc(p.title) + '</span><span style="color:var(--cerise)">' + pct + ' %</span></div>' +
          '<div class="bk-progress"><div style="width:' + pct + '%"></div></div></div>';
      }).join('') :
        '<div class="bk-empty"><div class="big">🚀</div><p>' +
        (no ? 'Ingen utgivelser i gang. Publiseringsassistenten lager sjekklister, metadata og nøkkelord for deg.' : 'No releases in progress. The Publishing Assistant builds checklists, metadata and keywords for you.') +
        '</p><a class="bk-btn primary" href="#/publishing">' + t('nav_publishing') + '</a></div>') +
      '</section></div>';
    bindProjCards(root);
    bindTplCards(root);
  });

  function exportTable(rows) {
    var no = BK.lang() === 'no';
    if (!rows.length) return '<div class="bk-empty"><div class="big">📤</div><p>' +
      (no ? 'Eksportene dine dukker opp her: PDF, PNG, JPG og DOCX.' : 'Your exports show up here: PDF, PNG, JPG and DOCX.') + '</p></div>';
    return '<div class="bk-card" style="padding:8px 14px"><table class="bk-table"><thead><tr><th>' +
      (no ? 'Prosjekt' : 'Project') + '</th><th>Format</th><th>' + (no ? 'Hva' : 'What') + '</th><th>' + (no ? 'Når' : 'When') + '</th></tr></thead><tbody>' +
      rows.map(function (e) {
        return '<tr><td style="font-weight:700">' + esc(e.projectTitle || '') + '</td><td>' + esc(e.format) + '</td><td>' + esc(e.what || '') + '</td><td>' + BK.fmtDate(e.ts) + '</td></tr>';
      }).join('') + '</tbody></table></div>';
  }

  /* =====================================================================
     PROSJEKTER
     ===================================================================== */
  BK.route('/projects', function (root) {
    var no = BK.lang() === 'no';
    var st = BK._projFilter || (BK._projFilter = { q: BK.searchQuery || '', type: 'all', folder: 'all', sort: 'new', archived: false });
    if (BK.searchQuery) { st.q = BK.searchQuery; BK.searchQuery = ''; }

    var list = BK.state.projects.filter(function (p) {
      if (!!p.archived !== st.archived) return false;
      if (st.type !== 'all' && p.type !== st.type) return false;
      if (st.folder !== 'all' && (p.folderId || '') !== (st.folder === 'none' ? '' : st.folder)) return false;
      if (st.q && p.title.toLowerCase().indexOf(st.q.toLowerCase()) === -1) return false;
      return true;
    });
    list.sort(function (a, b) {
      if (st.sort === 'name') return a.title.localeCompare(b.title);
      if (st.sort === 'old') return a.updated - b.updated;
      return b.updated - a.updated;
    });

    root.innerHTML =
      head(t('nav_projects'), no ? 'Alle prosjektene dine: søk, sorter, organiser i mapper og arkiver.' : 'All your projects: search, sort, organise into folders and archive.',
        '<button class="bk-btn ghost" id="pNewFolder">📁 ' + t('new_folder') + '</button>') +
      '<div class="bk-card bk-no-print" style="display:flex;gap:10px;flex-wrap:wrap;align-items:center;padding:13px 16px;margin-bottom:16px">' +
      '<input id="pQ" type="text" placeholder="' + t('search') + '…" value="' + esc(st.q) + '" style="flex:1;min-width:140px;border:1.5px solid var(--line);border-radius:999px;padding:7px 14px;font-size:13px;outline:none">' +
      '<select id="pType">' + ['all'].concat(Object.keys(BK.TYPES)).map(function (k) {
        return '<option value="' + k + '"' + (st.type === k ? ' selected' : '') + '>' + (k === 'all' ? t('all') : L(BK.TYPES[k].label)) + '</option>';
      }).join('') + '</select>' +
      '<select id="pFolder"><option value="all">' + t('folders') + ': ' + t('all') + '</option><option value="none"' + (st.folder === 'none' ? ' selected' : '') + '>' + t('no_folder') + '</option>' +
      BK.state.folders.map(function (f) { return '<option value="' + f.id + '"' + (st.folder === f.id ? ' selected' : '') + '>' + esc(f.name) + '</option>'; }).join('') + '</select>' +
      '<select id="pSort"><option value="new"' + (st.sort === 'new' ? ' selected' : '') + '>' + t('sort_newest') + '</option>' +
      '<option value="old"' + (st.sort === 'old' ? ' selected' : '') + '>' + t('sort_oldest') + '</option>' +
      '<option value="name"' + (st.sort === 'name' ? ' selected' : '') + '>' + t('sort_name') + '</option></select>' +
      '<button class="bk-chip' + (st.archived ? ' on' : '') + '" id="pArch">🗄️ ' + t('archived') + '</button>' +
      '</div>' +
      (list.length
        ? '<div class="bk-grid auto" id="pGrid">' + list.map(function (p) {
            return projCard(p).replace('</div></div>',
              '<div class="row">' +
              '<button class="bk-btn quiet sm" data-act="dup" data-id="' + p.id + '">⧉ ' + t('duplicate') + '</button>' +
              '<button class="bk-btn quiet sm" data-act="move" data-id="' + p.id + '">📁</button>' +
              '<button class="bk-btn quiet sm" data-act="arch" data-id="' + p.id + '">' + (p.archived ? '↩︎' : '🗄️') + '</button>' +
              '<button class="bk-btn quiet sm" data-act="del" data-id="' + p.id + '">🗑️</button>' +
              '</div></div></div>');
          }).join('') + '</div>'
        : '<div class="bk-empty"><div class="big">🌷</div><p>' +
          (no ? 'Ingen prosjekter her ennå. Start med en mal, eller lag noe helt nytt.' : 'No projects here yet. Start from a template, or create something brand new.') +
          '</p><a class="bk-btn primary" href="#/templates">' + t('nav_templates') + '</a></div>');

    function rerender() { BK.refresh(); }
    $('#pQ').oninput = function () { st.q = this.value; clearTimeout(BK._qT); BK._qT = setTimeout(rerender, 300); };
    $('#pType').onchange = function () { st.type = this.value; rerender(); };
    $('#pFolder').onchange = function () { st.folder = this.value; rerender(); };
    $('#pSort').onchange = function () { st.sort = this.value; rerender(); };
    $('#pArch').onclick = function () { st.archived = !st.archived; rerender(); };
    $('#pNewFolder').onclick = function () {
      BK.modal('<h3>📁 ' + t('new_folder') + '</h3><div class="bk-field"><label>' + t('name') + '</label><input id="mFName" type="text"></div>' +
        '<div class="actions"><button class="bk-btn quiet" id="mCancel">' + t('cancel') + '</button><button class="bk-btn primary" id="mOk">' + t('create') + '</button></div>',
        function (back, close) {
          BK.$('#mCancel', back).onclick = close;
          BK.$('#mOk', back).onclick = function () {
            var name = BK.$('#mFName', back).value.trim();
            if (name) { BK.state.folders.push({ id: BK.uid(), name: name }); BK.save(true); }
            close(); rerender();
          };
        });
    };
    bindProjCards(root);
    BK.$$('[data-act]', root).forEach(function (btn) {
      btn.onclick = function (e) {
        e.stopPropagation();
        var id = btn.getAttribute('data-id'), act = btn.getAttribute('data-act');
        var p = BK.getProject(id);
        if (act === 'dup') { BK.duplicateProject(id); rerender(); }
        if (act === 'arch') { p.archived = !p.archived; BK.save(true); rerender(); }
        if (act === 'del') {
          BK.modal('<h3>🗑️ ' + t('delete_') + '</h3><p style="font-size:13.5px">' + t('confirm_delete') + '</p>' +
            '<div class="actions"><button class="bk-btn quiet" id="mC">' + t('cancel') + '</button><button class="bk-btn primary" id="mD">' + t('delete_') + '</button></div>',
            function (back, close) {
              BK.$('#mC', back).onclick = close;
              BK.$('#mD', back).onclick = function () { BK.deleteProject(id); close(); rerender(); };
            });
        }
        if (act === 'move') {
          BK.modal('<h3>📁 ' + t('move_to') + '</h3><div class="bk-chips">' +
            '<button class="bk-chip" data-f="">' + t('no_folder') + '</button>' +
            BK.state.folders.map(function (f) { return '<button class="bk-chip" data-f="' + f.id + '">' + esc(f.name) + '</button>'; }).join('') + '</div>',
            function (back, close) {
              BK.$$('[data-f]', back).forEach(function (ch) {
                ch.onclick = function () { p.folderId = ch.getAttribute('data-f') || null; BK.save(true); close(); rerender(); };
              });
            });
        }
      };
    });
  });

  /* =====================================================================
     MALER
     ===================================================================== */
  function tplCard(tp) {
    return '<div class="bk-tpl"><div class="tp-top ' + tp.tint + '">' + tp.icon + '</div>' +
      '<div class="tp-body"><span class="tp-cat">' + esc(L(BK.TPL_CATS[tp.cat])) + '</span>' +
      '<span class="tp-name">' + esc(L(tp.name)) + '</span><span class="tp-desc">' + esc(L(tp.desc)) + '</span>' +
      '<button class="bk-btn soft sm" data-tpl="' + tp.id + '" style="margin-top:8px">' + t('use_template') + '</button></div></div>';
  }
  function bindTplCards(root) {
    BK.$$('[data-tpl]', root).forEach(function (b) {
      b.onclick = function () { BK.useTemplate(b.getAttribute('data-tpl')); };
    });
  }

  BK.route('/templates', function (root) {
    var no = BK.lang() === 'no';
    var cat = BK._tplCat || 'all';
    var list = BK.TEMPLATES.filter(function (tp) { return cat === 'all' || tp.cat === cat; });
    root.innerHTML =
      head(t('nav_templates') + ' <em>(' + BK.TEMPLATES.length + ')</em>',
        no ? 'Profesjonelle utgangspunkt for alt du vil lage. Velg en mal, juster, og generer.' : 'Professional starting points for everything you want to make. Pick a template, adjust, and generate.') +
      '<div class="bk-tabs">' + ['all'].concat(Object.keys(BK.TPL_CATS)).map(function (c) {
        return '<button class="bk-tab' + (cat === c ? ' on' : '') + '" data-cat="' + c + '">' +
          (c === 'all' ? t('all') : esc(L(BK.TPL_CATS[c]))) + '</button>';
      }).join('') + '</div>' +
      '<div class="bk-grid auto">' + list.map(tplCard).join('') + '</div>';
    BK.$$('[data-cat]', root).forEach(function (b) {
      b.onclick = function () { BK._tplCat = b.getAttribute('data-cat'); BK.refresh(); };
    });
    bindTplCards(root);
  });

  /* =====================================================================
     SKAPERE — skjemadefinisjoner
     ===================================================================== */
  var FORMS = {
    book: {
      icon: '📖', title: ['Bokskaper', 'Book Creator'],
      sub: ['Komplett bok: disposisjon, sidetekster, illustrasjonsprompter, læringsmål og baksidetekst.',
            'A complete book: outline, page texts, illustration prompts, learning goals and back cover text.'],
      fields: [
        ['title', 'text', ['Tittel', 'Title'], { req: 1, ph: ['F.eks. Mia og Teo i skogen', 'E.g. Mia and Teo in the Forest'] }],
        ['bookType', 'select', ['Boktype', 'Book type'], { opts: [['picture book', ['Bildebok', 'Picture book']], ['story book', ['Fortelling', 'Story book']], ['educational book', ['Pedagogisk bok', 'Educational book']], ['nature book', ['Naturbok', 'Nature book']], ['fact book', ['Faktabok', 'Fact book']], ['language learning book', ['Språklæringsbok', 'Language learning book']]] }],
        ['topic', 'text', ['Tema', 'Topic'], { ph: ['F.eks. livet i skogen om høsten', 'E.g. forest life in autumn'] }],
        ['audience', 'text', ['Målgruppe', 'Audience'], { ph: ['F.eks. nysgjerrige barn og foreldrene deres', 'E.g. curious children and their parents'] }],
        ['age', 'select', ['Aldersgruppe', 'Age group'], { opts: [['0-3', ['0-3 år', 'Ages 0-3']], ['3-6', ['3-6 år', 'Ages 3-6']], ['6-9', ['6-9 år', 'Ages 6-9']], ['9-12', ['9-12 år', 'Ages 9-12']]], def: '3-6' }],
        ['lang', 'select', ['Bokas språk', 'Book language'], { opts: [['no', ['Norsk', 'Norwegian']], ['en', ['Engelsk', 'English']]] }],
        ['characters', 'text', ['Karakterer', 'Characters'], { ph: ['F.eks. Mia og Teo', 'E.g. Mia and Teo'] }],
        ['style', 'text', ['Skrivestil', 'Writing style'], { ph: ['F.eks. varm, enkel, rytmisk', 'E.g. warm, simple, rhythmic'] }],
        ['tone', 'text', ['Tone', 'Tone'], { ph: ['F.eks. nysgjerrig og trygg', 'E.g. curious and safe'] }],
        ['goals', 'text', ['Læringsmål', 'Learning goals'], { ph: ['F.eks. kjenne igjen fem skogsdyr', 'E.g. recognise five forest animals'] }],
        ['pages', 'select', ['Antall sider', 'Number of pages'], { opts: [['12', ['12', '12']], ['24', ['24', '24']], ['32', ['32', '32']], ['48', ['48', '48']], ['64', ['64', '64']]], def: '24' }],
        ['size', 'size', ['Sidestørrelse', 'Page size'], { def: 'square8' }],
      ],
      ai: true,
    },
    workbook: {
      icon: '📝', title: ['Arbeidsbok-skaper', 'Workbook Creator'],
      sub: ['Arbeidsbok med omslag, introduksjon, oppgaveark, fasit og diplom. Regneark får ekte oppgaver og ekte fasit.',
            'A workbook with cover, introduction, worksheets, answer key and certificate. Math sheets get real problems and a real answer key.'],
      fields: [
        ['title', 'text', ['Tittel', 'Title'], { req: 1 }],
        ['category', 'select', ['Kategori', 'Category'], { opts: [['literacy', ['Lese og skrive', 'Literacy']], ['reading', ['Lesing', 'Reading']], ['writing', ['Skriving', 'Writing']], ['mathematics', ['Matematikk', 'Mathematics']], ['science', ['Naturfag', 'Science']], ['geography', ['Geografi', 'Geography']], ['language', ['Språklæring', 'Language learning']], ['montessori', ['Montessori-inspirert', 'Montessori inspired']]] }],
        ['topic', 'text', ['Tema', 'Topic'], {}],
        ['age', 'select', ['Aldersgruppe', 'Age group'], { opts: [['3-6', ['3-6 år (førskole)', 'Ages 3-6 (preschool)']], ['6-9', ['6-9 år', 'Ages 6-9']], ['9-12', ['9-12 år', 'Ages 9-12']]], def: '6-9' }],
        ['count', 'select', ['Antall oppgaveark', 'Number of worksheets'], { opts: [['6', ['6', '6']], ['8', ['8', '8']], ['10', ['10', '10']], ['12', ['12', '12']], ['16', ['16', '16']]], def: '10' }],
        ['size', 'size', ['Sidestørrelse', 'Page size'], { def: 'a4' }],
      ],
    },
    activity: {
      icon: '✂️', title: ['Aktivitetsbok-skaper', 'Activity Creator'],
      sub: ['Koble sammen, klipp og lim, sporing, mønster, memory, finn forskjellene, finn og tell, labyrinter.',
            'Matching, cut and paste, tracing, patterns, memory, spot the difference, find and count, mazes.'],
      fields: [
        ['title', 'text', ['Tittel', 'Title'], { req: 1 }],
        ['theme', 'select', ['Tema', 'Theme'], { opts: [['dyr', ['Dyr', 'Animals']], ['natur', ['Natur', 'Nature']], ['mat', ['Mat', 'Food']], ['kjoretoy', ['Kjøretøy', 'Vehicles']], ['fantasi', ['Fantasi', 'Fantasy']], ['arstider', ['Årstider', 'Seasons']]] }],
        ['difficulty', 'select', ['Vanskelighetsgrad', 'Difficulty'], { opts: [['easy', ['Lett', 'Easy']], ['medium', ['Middels', 'Medium']], ['hard', ['Vanskelig', 'Hard']]], def: 'medium' }],
        ['count', 'select', ['Antall aktiviteter', 'Number of activities'], { opts: [['8', ['8', '8']], ['10', ['10', '10']], ['12', ['12', '12']], ['16', ['16', '16']]], def: '12' }],
        ['types', 'chips', ['Aktivitetstyper', 'Activity types'], { opts: [['matching', ['Koble sammen', 'Matching']], ['cutpaste', ['Klipp og lim', 'Cut & paste']], ['tracing', ['Sporing', 'Tracing']], ['pattern', ['Mønster og logikk', 'Patterns & logic']], ['memory', ['Memory', 'Memory']], ['spotdiff', ['Finn forskjellene', 'Spot the difference']], ['findobject', ['Finn og tell', 'Find & count']], ['maze', ['Labyrint', 'Maze']]] }],
        ['size', 'size', ['Sidestørrelse', 'Page size'], { def: 'a4' }],
      ],
    },
    puzzle: {
      icon: '🧩', title: ['Pusleri-skaper', 'Puzzle Creator'],
      sub: ['Ekte genererte puslerier med fasit: ordleting, kryssord, sudoku (unik løsning), labyrinter og tallgåter.',
            'Genuinely generated puzzles with solutions: word searches, crosswords, sudoku (unique solution), mazes and number riddles.'],
      fields: [
        ['title', 'text', ['Tittel', 'Title'], { req: 1 }],
        ['kinds', 'chips', ['Pusletyper', 'Puzzle types'], { opts: [['wordsearch', ['Ordleting', 'Word search']], ['crossword', ['Kryssord', 'Crossword']], ['sudoku', ['Sudoku', 'Sudoku']], ['maze', ['Labyrint', 'Maze']], ['numberpuzzle', ['Tallgåter', 'Number riddles']]] }],
        ['wordTheme', 'select', ['Ordtema', 'Word theme'], { opts: [['dyr', ['Dyr', 'Animals']], ['natur', ['Natur', 'Nature']], ['mat', ['Mat', 'Food']], ['kropp', ['Kroppen', 'The body']], ['familie', ['Familie', 'Family']], ['skole', ['Skole', 'School']]] }],
        ['difficulty', 'select', ['Vanskelighetsgrad', 'Difficulty'], { opts: [['easy', ['Lett', 'Easy']], ['medium', ['Middels', 'Medium']], ['hard', ['Vanskelig', 'Hard']]], def: 'medium' }],
        ['count', 'select', ['Antall puslerier', 'Number of puzzles'], { opts: [['8', ['8', '8']], ['10', ['10', '10']], ['12', ['12', '12']], ['15', ['15', '15']], ['20', ['20', '20']]], def: '12' }],
        ['size', 'size', ['Sidestørrelse', 'Page size'], { def: 'a4' }],
      ],
    },
    flashcards: {
      icon: '🃏', title: ['Flashkort-skaper', 'Flashcard Creator'],
      sub: ['Ordkort, glosekort med oversettelse (dobbeltsidig utskrift) og Montessori trepartskort, klare til å klippes.',
            'Word cards, vocabulary cards with translations (duplex printing) and Montessori three-part cards, ready to cut.'],
      fields: [
        ['title', 'text', ['Tittel', 'Title'], { req: 1 }],
        ['mode', 'select', ['Korttype', 'Card type'], { opts: [['vocab', ['Ord- og glosekort', 'Word & vocabulary cards']], ['threepart', ['Montessori trepartskort', 'Montessori three-part cards']]] }],
        ['theme', 'select', ['Innebygd tema', 'Built-in theme'], { opts: [['dyr', ['Dyr', 'Animals']], ['natur', ['Natur', 'Nature']], ['mat', ['Mat', 'Food']], ['kropp', ['Kroppen', 'The body']], ['familie', ['Familie', 'Family']], ['skole', ['Skole', 'School']]] }],
        ['itemsText', 'textarea', ['Egne ord (valgfritt)', 'Your own words (optional)'], { ph: ['Ett kort per linje. Med oversettelse/definisjon: ord = oversettelse\nF.eks: hund = dog', 'One card per line. With translation/definition: word = translation\nE.g.: dog = hund'], full: 1 }],
        ['size', 'size', ['Sidestørrelse', 'Page size'], { def: 'a4' }],
      ],
    },
    coloring: {
      icon: '🎨', title: ['Fargeleggingsbok-skaper', 'Coloring Book Creator'],
      sub: ['Genererte mandala-sider å fargelegge med en gang, pluss motivsider med ferdige AI-prompter for linjekunst.',
            'Generated mandala pages to color right away, plus artwork pages with ready-made AI prompts for line art.'],
      fields: [
        ['title', 'text', ['Tittel', 'Title'], { req: 1 }],
        ['theme', 'select', ['Tema', 'Theme'], { opts: [['dyr', ['Dyr', 'Animals']], ['natur', ['Natur', 'Nature']], ['fantasi', ['Fantasi', 'Fantasy']], ['kjoretoy', ['Kjøretøy', 'Vehicles']], ['arstider', ['Årstider', 'Seasonal']], ['laering', ['Lærerikt', 'Educational']]] }],
        ['count', 'select', ['Antall sider', 'Number of pages'], { opts: [['10', ['10', '10']], ['12', ['12', '12']], ['16', ['16', '16']], ['20', ['20', '20']]], def: '12' }],
        ['size', 'size', ['Sidestørrelse', 'Page size'], { def: 'square85' }],
      ],
    },
    journal: {
      icon: '📔', title: ['Journal-skaper', 'Journal Creator'],
      sub: ['Takknemlighet, refleksjon, velvære, dagbok, lærer- og elevjournaler, med skrivelinjer og humørlogg.',
            'Gratitude, reflection, wellness, daily, teacher and student journals, with writing lines and mood tracker.'],
      fields: [
        ['title', 'text', ['Tittel', 'Title'], { req: 1 }],
        ['kind', 'select', ['Journaltype', 'Journal type'], { opts: [['gratitude', ['Takknemlighet', 'Gratitude']], ['reflection', ['Refleksjon', 'Reflection']], ['wellness', ['Velvære', 'Wellness']], ['daily', ['Dagbok', 'Daily journal']], ['teacher', ['Lærerjournal', 'Teacher journal']], ['student', ['Elevjournal', 'Student journal']]] }],
        ['count', 'select', ['Antall dager', 'Number of days'], { opts: [['14', ['14', '14']], ['21', ['21', '21']], ['30', ['30', '30']]], def: '14' }],
        ['size', 'size', ['Sidestørrelse', 'Page size'], { def: 'a5' }],
      ],
    },
    planner: {
      icon: '🗓️', title: ['Planlegger-skaper', 'Planner Creator'],
      sub: ['Ekte kalendere for valgt år: måneds-, uke- og dagsoppslag, målsider og vanesporing.',
            'Real calendars for your chosen year: monthly, weekly and daily spreads, goal pages and habit trackers.'],
      fields: [
        ['title', 'text', ['Tittel', 'Title'], { req: 1 }],
        ['kind', 'select', ['Planleggertype', 'Planner type'], { opts: [['monthly', ['Månedsplanlegger', 'Monthly planner']], ['weekly', ['Ukeplanlegger', 'Weekly planner']], ['daily', ['Dagsplanlegger', 'Daily planner']], ['teacher', ['Lærerplanlegger', 'Teacher planner']], ['student', ['Studentplanlegger', 'Student planner']], ['goals', ['Målplanlegger', 'Goal planner']], ['habits', ['Vanesporing', 'Habit tracker']]] }],
        ['year', 'select', ['År', 'Year'], { opts: [['2026', ['2026', '2026']], ['2027', ['2027', '2027']], ['2028', ['2028', '2028']]], def: String(new Date().getFullYear()) }],
        ['startMonth', 'select', ['Startmåned', 'Start month'], { optsFn: function () { return BK.gen.MONTHS[BK.lang()].map(function (m, i) { return [String(i), [m, BK.gen.MONTHS.en[i]]]; }); } }],
        ['months', 'select', ['Antall måneder', 'Number of months'], { opts: [['3', ['3', '3']], ['6', ['6', '6']], ['10', ['10', '10']], ['12', ['12', '12']]], def: '12' }],
        ['habitsText', 'textarea', ['Vaner (for vanesporing, en per linje)', 'Habits (for habit tracker, one per line)'], { full: 1 }],
        ['size', 'size', ['Sidestørrelse', 'Page size'], { def: 'a4' }],
      ],
    },
  };

  BK.route('/create', function (root, rest) {
    var type = rest[0] || 'book';
    var def = FORMS[type] || FORMS.book;
    var no = BK.lang() === 'no';
    var preset = (BK.pendingTemplate && BK.pendingTemplate.type === type) ? BK.pendingTemplate : null;
    // Husk sist brukte oppsett per skaper, så ingenting må fylles inn på nytt.
    var lastCfg = (BK.state.settings.lastCfg || {})[type] || {};
    var pcfg = preset ? preset.cfg : lastCfg;

    root.innerHTML =
      head(def.icon + ' ' + esc(L(def.title)), L(def.sub),
        preset ? '<span class="bk-plan-chip">🗂️ ' + esc(L(preset.name)) + '</span>' : '') +
      (def.ai ? '<div class="bk-note blue" style="margin-bottom:16px">🤖 ' + t('ai_note') + '</div>' : '') +
      '<div class="bk-card"><div class="bk-form" id="cForm">' +
      def.fields.map(function (f) { return fieldHtml(f, pcfg); }).join('') +
      '</div><button class="bk-btn primary lg" id="cGo" style="margin-top:20px">✨ ' + t('generate') + '</button></div>';

    if (preset && !pcfg.title) {
      var ti = BK.$('[name="title"]', root);
      if (ti) ti.value = L(preset.name);
    }
    BK.pendingTemplate = null;

    BK.$$('.bk-chip[data-val]', root).forEach(function (ch) {
      ch.onclick = function () { ch.classList.toggle('on'); };
    });

    $('#cGo').onclick = function () {
      var cfg = {};
      def.fields.forEach(function (f) {
        var name = f[0], kind = f[1];
        if (kind === 'chips') {
          cfg[name] = BK.$$('.bk-chip.on[data-name="' + name + '"]', root).map(function (c) { return c.getAttribute('data-val'); });
        } else {
          var el = BK.$('[name="' + name + '"]', root);
          if (el) cfg[name] = el.value;
        }
      });
      if (!cfg.title || !cfg.title.trim()) {
        BK.toast(no ? 'Gi prosjektet en tittel først.' : 'Give the project a title first.');
        return;
      }
      BK.state.settings.lastCfg = BK.state.settings.lastCfg || {};
      BK.state.settings.lastCfg[type] = cfg;
      var btn = this;
      btn.disabled = true;
      var t0 = Date.now();
      var stage = t('working');
      function tick() {
        btn.innerHTML = '⏳ ' + stage + ' ' + Math.round((Date.now() - t0) / 1000) + ' s';
      }
      tick();
      var iv = setInterval(tick, 1000);
      BK.make[type](cfg, function (s) { stage = s; tick(); }).then(function (p) {
        clearInterval(iv);
        BK.toast(no ? 'Ferdig! ' + p.pages.length + ' sider generert.' : 'Done! ' + p.pages.length + ' pages generated.');
        BK.go('/project/' + p.id);
      }).catch(function () {
        clearInterval(iv);
        btn.disabled = false;
        btn.innerHTML = '✨ ' + t('generate');
        BK.toast(no ? 'Noe gikk galt. Prøv igjen.' : 'Something went wrong. Try again.');
      });
    };

    function fieldHtml(f, pre) {
      var name = f[0], kind = f[1], label = L(f[2]), o = f[3] || {};
      var val = pre[name] != null ? pre[name] : (o.def || '');
      var full = o.full || kind === 'chips' ? ' full' : '';
      var inner = '';
      if (kind === 'text') {
        inner = '<input type="text" name="' + name + '" value="' + esc(val) + '"' +
          (o.ph ? ' placeholder="' + esc(L(o.ph)) + '"' : '') + '>';
      } else if (kind === 'textarea') {
        inner = '<textarea name="' + name + '"' + (o.ph ? ' placeholder="' + esc(L(o.ph)) + '"' : '') + '>' + esc(val) + '</textarea>';
      } else if (kind === 'select') {
        var opts = o.optsFn ? o.optsFn() : o.opts;
        inner = '<select name="' + name + '">' + opts.map(function (op) {
          return '<option value="' + esc(op[0]) + '"' + (String(val) === op[0] ? ' selected' : '') + '>' + esc(L(op[1])) + '</option>';
        }).join('') + '</select>';
      } else if (kind === 'size') {
        inner = '<select name="size">' + Object.keys(BK.SIZES).map(function (k) {
          return '<option value="' + k + '"' + ((val || 'a4') === k ? ' selected' : '') + '>' + esc(L(BK.SIZES[k].label)) + '</option>';
        }).join('') + '</select>';
      } else if (kind === 'chips') {
        var sel = pre[name] || [];
        inner = '<div class="bk-chips">' + o.opts.map(function (op) {
          var on = !sel.length || sel.indexOf(op[0]) !== -1;
          return '<button type="button" class="bk-chip' + (on ? ' on' : '') + '" data-name="' + name + '" data-val="' + op[0] + '">' + esc(L(op[1])) + '</button>';
        }).join('') + '</div>';
      }
      return '<div class="bk-field' + full + '"><label>' + esc(label) + (o.req ? ' *' : '') + '</label>' + inner + '</div>';
    }
  });

  /* =====================================================================
     PROSJEKT-EDITOR
     ===================================================================== */
  BK.route('/project', function (root, rest) {
    var p = BK.getProject(rest[0]);
    var no = BK.lang() === 'no';
    if (!p) { root.innerHTML = '<div class="bk-empty"><div class="big">🤔</div><p>' + t('none_yet') + '</p></div>'; return; }
    var cur = Math.min(BK._curPage || 0, p.pages.length - 1);
    BK._curPage = cur;
    var ty = BK.TYPES[p.type];

    root.innerHTML =
      head(ty.icon + ' <em contenteditable="true" id="eTitle" spellcheck="false">' + esc(p.title) + '</em>',
        L(ty.label) + ' · ' + p.pages.length + ' ' + t('pages').toLowerCase() + ' · ' + L(BK.sizeOf(p).label),
        '<div style="display:flex;gap:8px;flex-wrap:wrap" class="bk-no-print">' +
        '<button class="bk-btn primary" id="ePdf">🖨️ ' + t('print_pdf') + '</button>' +
        '<button class="bk-btn ghost" id="ePng">PNG</button>' +
        '<button class="bk-btn ghost" id="eJpg">JPG</button>' +
        '<button class="bk-btn ghost" id="eDocx">DOCX</button>' +
        '<a class="bk-btn soft" href="#/cover/' + p.id + '">🖼️ ' + t('nav_cover') + '</a>' +
        '<a class="bk-btn soft" href="#/publishing/' + p.id + '">🚀</a>' +
        '</div>') +
      '<div class="bk-editor" style="margin-top:18px">' +
      '<div class="bk-pagelist bk-no-print" id="ePages">' +
      p.pages.map(function (pgObj, i) {
        return '<div class="bk-pageitem' + (i === cur ? ' on' : '') + '" data-pg="' + i + '"><span class="no">' + (i + 1) + '</span>' +
          esc(pgObj.title || kindName(pgObj.kind)) + '</div>';
      }).join('') + '</div>' +
      '<div><div id="eStage" class="bk-stage"></div><div id="eEdit" class="bk-card bk-no-print" style="margin-top:14px"></div></div>' +
      '</div>';

    function kindName(k) {
      var names = {
        cover: ['Omslag', 'Cover'], backcover: ['Bakside', 'Back cover'], toc: ['Innhold', 'Contents'],
        story: ['Historieside', 'Story page'], text: ['Tekstside', 'Text page'], intro: ['Intro', 'Intro'],
        certificate: ['Diplom', 'Certificate'], answers: ['Fasit', 'Answer key'],
        mandala: ['Mandala', 'Mandala'], colorprompt: ['Motivside', 'Artwork page'],
      };
      return names[k] ? L(names[k]) : k;
    }

    function renderStage() {
      var stage = $('#eStage');
      stage.innerHTML = BK.gen.renderPage(p, p.pages[cur], cur, p.pages.length);
      mountSheets(stage);
      renderEditPanel();
    }

    function renderEditPanel() {
      var pgObj = p.pages[cur];
      var d = pgObj.data || {};
      var ed = $('#eEdit');
      var fields = [];
      fields.push('<div class="bk-field"><label>' + (no ? 'Sidetittel' : 'Page title') + '</label><input id="edTitle" type="text" value="' + esc(pgObj.title || '') + '"></div>');
      if (pgObj.kind === 'story' || pgObj.kind === 'text' || pgObj.kind === 'intro') {
        fields.push('<div class="bk-field full"><label>' + (no ? 'Tekst' : 'Text') + '</label><textarea id="edText" rows="4">' + esc(d.text || '') + '</textarea></div>');
      }
      if (pgObj.kind === 'story') {
        fields.push('<div class="bk-field full"><label>' + (no ? 'Illustrasjonsbeskrivelse' : 'Illustration description') + '</label><textarea id="edIllus" rows="2">' + esc(d.illustration || '') + '</textarea></div>');
      }
      if (pgObj.kind === 'backcover') {
        fields.push('<div class="bk-field"><label>Hook</label><input id="edHook" type="text" value="' + esc(d.hook || '') + '"></div>');
        fields.push('<div class="bk-field full"><label>' + (no ? 'Baksidetekst' : 'Back cover text') + '</label><textarea id="edBack" rows="3">' + esc(d.text || '') + '</textarea></div>');
      }
      var canImage = ['story', 'text', 'intro', 'colorprompt', 'cover'].indexOf(pgObj.kind) !== -1;
      if (canImage) {
        var defPrompt = d.imgPrompt;
        if (!defPrompt) {
          if (pgObj.kind === 'colorprompt') defPrompt = d.prompt || '';
          else if (pgObj.kind === 'cover') defPrompt = "Children's book cover art, " + (d.title || p.title) +
            ((p.config && p.config.topic) ? ', ' + p.config.topic : '') +
            ', Pixar inspired 3D render, Disney style, soft global illumination, rounded friendly shapes, expressive big eyes, warm cinematic lighting, kid friendly, high detail, no text, space for title at the top';
          else defPrompt = "Children's book illustration, " + (d.illustration || (p.config && p.config.topic) || pgObj.title || p.title) +
            ', Pixar inspired 3D render, Disney style, soft global illumination, rounded friendly shapes, expressive big eyes, warm cinematic lighting, kid friendly, high detail, no text';
        }
        fields.push('<div class="bk-field full"><label>✨ ' + (no ? 'Bildeprompt for denne siden' : 'Image prompt for this page') + '</label>' +
          '<textarea id="edPrompt" rows="2">' + esc(defPrompt) + '</textarea>' +
          '<div style="display:flex;gap:8px;margin-top:6px;flex-wrap:wrap">' +
          '<button class="bk-btn primary sm" id="edGenImg">🎨 ' + (no ? 'Generer bilde' : 'Generate image') + '</button>' +
          '<button class="bk-btn ghost sm" id="edCopyPrompt">' + t('copy') + '</button>' +
          (BK.state.user && BK.state.user.role === 'owner'
            ? '<button class="bk-btn soft sm" id="edMiaTeo">🧒 Mia &amp; Teo</button>' : '') +
          '</div></div>');
        fields.push('<div class="bk-field full"><label>🖼️ ' + (no ? 'Eller last opp eget bilde' : 'Or upload your own image') + '</label>' +
          '<input id="edImg" type="file" accept="image/*">' +
          '<div class="hint">' + (no ? 'Bildet erstatter illustrasjonsboksen og blir med i alle eksporter.' : 'The image replaces the illustration box and is included in all exports.') + '</div>' +
          (d.image ? '<div><button class="bk-btn quiet sm" id="edImgRm" style="margin-top:4px">🗑️ ' + (no ? 'Fjern bilde' : 'Remove image') + '</button></div>' : '') +
          '</div>');
      }
      // Referansebilder gjelder hele prosjektet og vises derfor på alle sider
      var refs = p.refs || [];
      fields.push('<div class="bk-field full"><label>📎 ' + (no ? 'Referansebilder for karakterene (gjelder hele prosjektet)' : 'Character reference images (apply to the whole project)') + '</label>' +
        '<div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center">' +
        refs.map(function (r2, ri) {
          return '<span style="position:relative;display:inline-block"><img src="' + r2 + '" alt="" style="width:56px;height:56px;object-fit:cover;border-radius:10px;border:1.5px solid var(--line)">' +
            '<button data-refrm="' + ri + '" style="position:absolute;top:-6px;right:-6px;width:20px;height:20px;border-radius:50%;border:none;background:var(--cerise);color:#fff;font-size:11px;cursor:pointer">✕</button></span>';
        }).join('') +
        (refs.length < 3 ? '<label class="bk-btn ghost sm" style="cursor:pointer">＋ ' + (no ? 'Legg til' : 'Add') + '<input id="edRefAdd" type="file" accept="image/*" multiple style="display:none"></label>' : '') +
        '</div>' +
        '<div class="hint">' + (no ? 'Last opp 1-3 godkjente bilder av karakterene (f.eks. Mia & Teo), så bruker bildegenereringen dem som fasit for utseendet.' : 'Upload 1-3 approved images of your characters, and image generation will use them as the reference for their look.') + '</div></div>');
      var regen = ['mandala', 'maze', 'wordsearch', 'sudoku', 'spotdiff', 'findobject', 'numberpuzzle'].indexOf(pgObj.kind) !== -1;
      var sol = ['sudoku', 'crossword', 'numberpuzzle'].indexOf(pgObj.kind) !== -1;
      ed.innerHTML = '<div class="bk-form">' + fields.join('') + '</div>' +
        '<div style="display:flex;gap:8px;margin-top:12px;flex-wrap:wrap">' +
        '<button class="bk-btn primary sm" id="edSave">💾 ' + t('save') + '</button>' +
        (regen ? '<button class="bk-btn ghost sm" id="edRegen">🎲 ' + t('regenerate') + '</button>' : '') +
        (sol ? '<button class="bk-btn ghost sm" id="edSol">' + (d.showSolution ? (no ? 'Skjul fasit' : 'Hide solution') : (no ? 'Vis fasit' : 'Show solution')) + '</button>' : '') +
        '<button class="bk-btn quiet sm" id="edDelPg">🗑️ ' + (no ? 'Slett side' : 'Delete page') + '</button>' +
        '</div>';
      /* Synkroniser alle felter inn i modellen, så ingenting går tapt
         selv om man genererer eller bytter side uten å trykke Lagre. */
      function syncFields() {
        if ($('#edTitle')) pgObj.title = $('#edTitle').value;
        if ($('#edText')) d.text = $('#edText').value;
        if ($('#edIllus')) d.illustration = $('#edIllus').value;
        if ($('#edHook')) d.hook = $('#edHook').value;
        if ($('#edBack')) d.text = $('#edBack').value;
        if ($('#edPrompt')) d.imgPrompt = $('#edPrompt').value;
      }
      ['edTitle', 'edText', 'edIllus', 'edHook', 'edBack', 'edPrompt'].forEach(function (id) {
        var el2 = $('#' + id);
        if (!el2) return;
        el2.addEventListener('input', function () {
          syncFields();
          clearTimeout(BK._edT);
          BK._edT = setTimeout(function () { BK.touch(p); }, 600);
        });
      });
      $('#edSave').onclick = function () {
        syncFields();
        BK.touch(p);
        BK.toast(t('saved'));
        BK.refresh();
      };
      if ($('#edRegen')) $('#edRegen').onclick = function () {
        if (d.seed != null) d.seed = BK.gen.seed();
        if (pgObj.kind === 'wordsearch' && d.ws) {
          var words = d.ws.words;
          d.ws = BK.gen.wordsearch(words, d.ws.grid.length, true, false);
        }
        if (pgObj.kind === 'sudoku' && d.puzzle) {
          var s = d.puzzle.length === 4 ? BK.gen.sudoku4(BK.gen.seed()) : BK.gen.sudoku(p.config.difficulty || 'medium', BK.gen.seed());
          d.puzzle = s.puzzle; d.solution = s.solution;
        }
        if (pgObj.kind === 'spotdiff') d.scene = BK.gen.spotScene(p.config.theme || 'natur', d.diffs || 5, BK.gen.seed());
        if (pgObj.kind === 'findobject') d.scene = BK.gen.findScene(p.config.theme || 'natur', Object.keys(d.scene.counts), BK.gen.seed());
        if (pgObj.kind === 'numberpuzzle') {
          var np = BK.gen.numberPuzzle(p.config.difficulty || 'medium', BK.gen.seed());
          d.puzzle = np.puzzle; d.solution = np.solution; d.sum = np.sum;
        }
        BK.touch(p); renderStage();
      };
      if ($('#edSol')) $('#edSol').onclick = function () {
        d.showSolution = !d.showSolution;
        renderStage();
      };
      if ($('#edGenImg')) $('#edGenImg').onclick = function () {
        syncFields();
        var promptTxt = ($('#edPrompt').value || '').trim();
        if (!promptTxt) { BK.toast(no ? 'Skriv en bildeprompt først.' : 'Write an image prompt first.'); return; }
        d.imgPrompt = promptTxt;
        BK.touch(p);
        var btn = this;
        btn.disabled = true;
        btn.innerHTML = '⏳ ' + (no ? 'Genererer bilde… (kan ta opptil ett minutt)' : 'Generating image… (can take up to a minute)');
        BK.ai.image(promptTxt, null, (p.refs && p.refs.length) ? p.refs : null).then(function (dataUrl) {
          d.image = dataUrl;
          BK.touch(p);
          BK.toast(no ? 'Bildet er lagt på siden!' : 'The image is on the page!');
          renderStage();
        }, function (err) {
          btn.disabled = false;
          btn.innerHTML = '🎨 ' + (no ? 'Generer bilde' : 'Generate image');
          var detail = (err && err.detail) || '';
          var low = detail.toLowerCase();
          if (err && err.message === 'image_unavailable') {
            BK.toast(no
              ? 'Bildegenerering krever en OpenAI-nøkkel (OPENAI_API_KEY) i Cloudflare-innstillingene. Kopier prompten og lag bildet i et annet verktøy så lenge.'
              : 'Image generation needs an OpenAI key (OPENAI_API_KEY) in the Cloudflare settings. Copy the prompt and create the image in another tool for now.');
          } else if (low.indexOf('billing') !== -1 || low.indexOf('quota') !== -1) {
            BK.toast(no
              ? 'OpenAI-kontoen mangler kreditt: legg inn betalingskort eller kjøp kreditt på platform.openai.com under Billing, så virker det.'
              : 'The OpenAI account has no credit: add a payment method or buy credits at platform.openai.com under Billing.');
          } else if (low.indexOf('api key') !== -1 || low.indexOf('incorrect') !== -1 || low.indexOf('invalid') !== -1) {
            BK.toast(no
              ? 'OpenAI avviser nøkkelen: sjekk at hele nøkkelen ble limt inn riktig i Cloudflare (begynner med sk-).'
              : 'OpenAI rejects the key: check that the full key was pasted correctly in Cloudflare (starts with sk-).');
          } else {
            BK.toast((no ? 'Bildegenereringen feilet' : 'Image generation failed') +
              (detail ? ': ' + detail : (no ? '. Prøv igjen, eller juster prompten.' : '. Try again, or adjust the prompt.')));
          }
        });
      };
      if ($('#edMiaTeo')) $('#edMiaTeo').onclick = function () {
        var btn2 = this;
        btn2.disabled = true;
        BK.ai.charPrompt().then(function (cp) {
          btn2.disabled = false;
          var ta = $('#edPrompt');
          if (ta.value.indexOf('Mia and Teo, two six-year-old') !== -1) {
            BK.toast(no ? 'Mia & Teo er allerede med i prompten.' : 'Mia & Teo are already in the prompt.');
            return;
          }
          // Karakteridentiteten først, deretter scenen
          ta.value = cp + '\n\nScene: ' + ta.value;
          d.imgPrompt = ta.value;
          BK.touch(p);
          BK.toast(no ? 'Mia & Teo-karakterprompten er lagt inn.' : 'The Mia & Teo character prompt was inserted.');
        }, function () {
          btn2.disabled = false;
          BK.toast(no ? 'Karakterprompten er kun tilgjengelig for eierkontoen.' : 'The character prompt is only available to the owner account.');
        });
      };
      if ($('#edCopyPrompt')) $('#edCopyPrompt').onclick = function () {
        d.imgPrompt = $('#edPrompt').value.trim();
        BK.copyText(d.imgPrompt);
        BK.touch(p);
        BK.toast(t('copied'));
      };
      if ($('#edImg')) $('#edImg').onchange = function () {
        var file = this.files && this.files[0];
        if (!file) return;
        BK.readImage(file, 1400).then(function (dataUrl) {
          d.image = dataUrl;
          BK.touch(p);
          BK.toast(t('saved'));
          renderStage();
        }, function () {
          BK.toast(no ? 'Kunne ikke lese bildet. Prøv en JPG eller PNG.' : 'Could not read the image. Try a JPG or PNG.');
        });
      };
      if ($('#edImgRm')) $('#edImgRm').onclick = function () {
        d.image = null;
        BK.touch(p);
        renderStage();
      };
      if ($('#edRefAdd')) $('#edRefAdd').onchange = function () {
        var files = Array.prototype.slice.call(this.files || []).slice(0, 3 - (p.refs || []).length);
        if (!files.length) return;
        Promise.all(files.map(function (f) { return BK.readImage(f, 800); })).then(function (urls) {
          p.refs = (p.refs || []).concat(urls).slice(0, 3);
          BK.touch(p);
          BK.toast(no ? 'Referansebilde lagt til. Brukes ved all bildegenerering i prosjektet.' : 'Reference image added. Used for all image generation in this project.');
          renderEditPanel();
        }, function () {
          BK.toast(no ? 'Kunne ikke lese bildet. Prøv en JPG eller PNG.' : 'Could not read the image. Try a JPG or PNG.');
        });
      };
      BK.$$('[data-refrm]', ed).forEach(function (rb) {
        rb.onclick = function () {
          p.refs.splice(parseInt(rb.getAttribute('data-refrm'), 10), 1);
          BK.touch(p);
          renderEditPanel();
        };
      });
      $('#edDelPg').onclick = function () {
        p.pages.splice(cur, 1);
        BK._curPage = Math.max(0, cur - 1);
        BK.touch(p);
        BK.refresh();
      };
    }

    BK.$$('[data-pg]', root).forEach(function (el) {
      el.onclick = function () {
        cur = parseInt(el.getAttribute('data-pg'), 10);
        BK._curPage = cur;
        BK.$$('.bk-pageitem', root).forEach(function (x) { x.classList.remove('on'); });
        el.classList.add('on');
        renderStage();
      };
    });

    $('#eTitle').onblur = function () {
      p.title = this.textContent.trim() || t('untitled');
      BK.touch(p);
    };
    $('#ePdf').onclick = function () { BK.exp.printProject(p); };
    $('#ePng').onclick = function () { BK.exp.downloadPageImage(p, cur, 'png'); };
    $('#eJpg').onclick = function () { BK.exp.downloadPageImage(p, cur, 'jpg'); };
    $('#eDocx').onclick = function () { BK.exp.downloadDocx(p); };

    renderStage();
  });

  /* =====================================================================
     OMSLAGSDESIGNER
     ===================================================================== */
  BK.route('/cover', function (root, rest) {
    var no = BK.lang() === 'no';
    var p = rest[0] ? BK.getProject(rest[0]) : null;
    var projects = BK.state.projects.filter(function (x) { return !x.archived; });
    if (!p && projects.length) p = projects[0];

    if (!p) {
      root.innerHTML = head('🖼️ ' + t('nav_cover'), '') +
        '<div class="bk-empty"><div class="big">🖼️</div><p>' +
        (no ? 'Lag et prosjekt først, så designer vi omslaget her.' : 'Create a project first, then design its cover here.') +
        '</p><a class="bk-btn primary" href="#/templates">' + t('nav_templates') + '</a></div>';
      return;
    }
    if (!p.cover) {
      var first = p.pages[0] && p.pages[0].kind === 'cover' ? p.pages[0].data : {};
      p.cover = {
        title: first.title || p.title, subtitle: first.subtitle || '',
        author: first.author || (BK.state.user && BK.state.user.name) || '',
        theme: first.theme || 'pink', emoji: first.emoji || '🌸',
        image: first.image || null, paper: 'premium', wrap: false,
      };
    }
    var c = p.cover;
    var spec = BK.exp.printSpec(p, { paper: c.paper });
    function f(nn) { var s = nn.toFixed(1); return no ? s.replace('.', ',') : s; }

    root.innerHTML =
      head('🖼️ ' + t('nav_cover'),
        no ? 'Forside, rygg og bakside med levende forhåndsvisning. Ryggbredden beregnes fra sidetall og papir.' : 'Front, spine and back cover with live preview. Spine width is calculated from page count and paper.') +
      '<div class="bk-cover-layout">' +
      '<div class="bk-card"><div class="bk-form" style="grid-template-columns:1fr">' +
      '<div class="bk-field"><label>' + (no ? 'Prosjekt' : 'Project') + '</label><select id="cvProj">' +
      projects.map(function (x) { return '<option value="' + x.id + '"' + (x.id === p.id ? ' selected' : '') + '>' + esc(x.title) + '</option>'; }).join('') + '</select></div>' +
      '<div class="bk-field"><label>' + t('title') + '</label><input id="cvTitle" type="text" value="' + esc(c.title) + '"></div>' +
      '<div class="bk-field"><label>' + (no ? 'Undertittel' : 'Subtitle') + '</label><input id="cvSub" type="text" value="' + esc(c.subtitle) + '"></div>' +
      '<div class="bk-field"><label>' + (no ? 'Forfatter' : 'Author') + '</label><input id="cvAuthor" type="text" value="' + esc(c.author) + '"></div>' +
      '<div class="bk-field"><label>' + (no ? 'Fargetema' : 'Color theme') + '</label><div class="bk-chips">' +
      ['pink', 'blue', 'lime', 'lemon'].map(function (th) {
        return '<button class="bk-chip' + (c.theme === th ? ' on' : '') + '" data-th="' + th + '">' +
          ({ pink: '🌸', blue: '💙', lime: '🍀', lemon: '🍋' }[th]) + ' ' + th + '</button>';
      }).join('') + '</div></div>' +
      '<div class="bk-field"><label>Emoji</label><div class="bk-chips">' +
      ['🌸', '📖', '🦊', '🌳', '🧩', '🎨', '⭐', '🦋', '🚀', '🐻'].map(function (e) {
        return '<button class="bk-chip' + (c.emoji === e ? ' on' : '') + '" data-em="' + e + '">' + e + '</button>';
      }).join('') + '</div></div>' +
      '<div class="bk-field"><label>' + (no ? 'Eget bilde' : 'Your own image') + '</label><input id="cvImg" type="file" accept="image/*">' +
      (c.image ? '<button class="bk-btn quiet sm" id="cvImgClear" style="margin-top:4px">🗑️ ' + (no ? 'Fjern bilde' : 'Remove image') + '</button>' : '') + '</div>' +
      '<div class="bk-field"><label>' + (no ? 'Papir (for ryggbredde)' : 'Paper (for spine width)') + '</label><select id="cvPaper">' +
      [['premium', no ? 'Farge premium' : 'Color premium'], ['color', no ? 'Farge standard' : 'Color standard'], ['white', no ? 'Svart-hvitt, hvitt' : 'B/W white'], ['cream', no ? 'Svart-hvitt, krem' : 'B/W cream']].map(function (op) {
        return '<option value="' + op[0] + '"' + (c.paper === op[0] ? ' selected' : '') + '>' + op[1] + '</option>';
      }).join('') + '</select></div>' +
      '<div class="bk-field"><label>' + (no ? 'Visning' : 'View') + '</label><div class="bk-chips">' +
      '<button class="bk-chip' + (!c.wrap ? ' on' : '') + '" id="cvFront">' + (no ? 'Forside' : 'Front') + '</button>' +
      '<button class="bk-chip' + (c.wrap ? ' on' : '') + '" id="cvWrap">' + (no ? 'Hel flate (med rygg)' : 'Full wrap (with spine)') + '</button></div></div>' +
      '</div>' +
      '<div class="bk-note" style="margin-top:12px">📐 ' +
      (no ? 'Rygg: ' : 'Spine: ') + f(spec.spine) + ' mm · ' +
      (no ? 'Hel flate: ' : 'Full wrap: ') + f(spec.coverW) + ' x ' + f(spec.coverH) + ' mm (' +
      (no ? 'med ' : 'incl. ') + f(spec.bleed) + ' mm bleed)</div>' +
      '<div style="display:flex;gap:8px;margin-top:12px;flex-wrap:wrap">' +
      '<button class="bk-btn primary" id="cvSave">💾 ' + t('save') + '</button>' +
      '<button class="bk-btn ghost" id="cvPrint">🖨️ ' + (no ? 'Omslag som PDF' : 'Cover as PDF') + '</button>' +
      '<button class="bk-btn ghost" id="cvPng">PNG</button>' +
      '<button class="bk-btn soft" id="cvPrompt">✨ ' + (no ? 'AI-prompt for omslagskunst' : 'AI prompt for cover art') + '</button>' +
      '</div></div>' +
      '<div class="bk-cover-prev" id="cvPrev"></div></div>';

    function coverPageObj() {
      return { id: 'cv', kind: 'cover', title: '', data: c };
    }
    function renderPrev() {
      var prev = $('#cvPrev');
      if (!c.wrap) {
        prev.innerHTML = BK.gen.renderPage(p, coverPageObj(), 0, 1);
      } else {
        var size = BK.sizeOf(p);
        var sp = BK.exp.printSpec(p, { paper: c.paper });
        var bgs = { pink: '#ffe3ee', blue: '#e3f2fd', lime: '#f0fadd', lemon: '#fff8db' };
        prev.innerHTML =
          '<div class="bk-sheet" style="width:' + sp.coverW + 'mm;height:' + sp.coverH + 'mm;background:' + (bgs[c.theme] || bgs.pink) + ';display:flex">' +
          '<div style="flex:1;display:flex;flex-direction:column;justify-content:center;padding:10mm;text-align:center">' +
          '<div style="font-size:10pt;line-height:1.7;color:#4a3429">' + esc((p.meta && p.meta.description) || c.subtitle || '') + '</div>' +
          '<div style="margin-top:8mm;border:1pt solid #b8a4ad;border-radius:2mm;height:16mm;width:38mm;align-self:center;display:flex;align-items:center;justify-content:center;font-size:7pt;color:#9b8b93">ISBN / EAN-13</div></div>' +
          '<div style="width:' + Math.max(2, sp.spine) + 'mm;background:rgba(176,36,88,.14);display:flex;align-items:center;justify-content:center">' +
          (sp.spine > 5 ? '<span style="writing-mode:vertical-rl;font-size:8pt;font-weight:800;color:#b02458;white-space:nowrap">' + esc(c.title) + '</span>' : '') + '</div>' +
          '<div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:8mm;text-align:center">' +
          '<div style="font-family:\'Sasson Montessori\',\'Playpen Sans\',sans-serif;font-weight:700;font-size:16pt;color:#2b2530">' + esc(c.title) + '</div>' +
          (c.subtitle ? '<div style="font-size:9pt;color:#7a6a72;margin-top:2mm">' + esc(c.subtitle) + '</div>' : '') +
          (c.image ? '<img src="' + c.image + '" alt="" style="max-width:80%;max-height:45%;border-radius:3mm;margin:4mm 0"/>' : '<div style="font-size:24mm;margin:3mm 0">' + (c.emoji || '🌸') + '</div>') +
          '<div style="font-size:9pt;font-weight:800;color:#b02458">' + esc(c.author) + '</div></div></div>';
      }
      mountSheets(prev);
    }

    function syncInputs() {
      c.title = $('#cvTitle').value;
      c.subtitle = $('#cvSub').value;
      c.author = $('#cvAuthor').value;
      c.paper = $('#cvPaper').value;
      if (p.pages[0] && p.pages[0].kind === 'cover') {
        Object.assign(p.pages[0].data, { title: c.title, subtitle: c.subtitle, author: c.author, theme: c.theme, emoji: c.emoji, image: c.image });
      }
    }
    ['cvTitle', 'cvSub', 'cvAuthor'].forEach(function (id) {
      $('#' + id).oninput = function () { syncInputs(); renderPrev(); };
    });
    $('#cvPaper').onchange = function () { syncInputs(); BK.refresh(); };
    $('#cvProj').onchange = function () { BK._curPage = 0; BK.go('/cover/' + this.value); };
    BK.$$('[data-th]', root).forEach(function (b) {
      b.onclick = function () { c.theme = b.getAttribute('data-th'); syncInputs(); BK.refresh(); };
    });
    BK.$$('[data-em]', root).forEach(function (b) {
      b.onclick = function () { c.emoji = b.getAttribute('data-em'); c.image = null; syncInputs(); BK.refresh(); };
    });
    $('#cvFront').onclick = function () { c.wrap = false; BK.refresh(); };
    $('#cvWrap').onclick = function () { c.wrap = true; BK.refresh(); };
    $('#cvImg').onchange = function () {
      var file = this.files && this.files[0];
      if (!file) return;
      var reader = new FileReader();
      reader.onload = function () {
        // skaler ned til maks 1200 px for lagringsplass
        var img = new Image();
        img.onload = function () {
          var maxDim = 1200, sc = Math.min(1, maxDim / Math.max(img.width, img.height));
          var cv2 = document.createElement('canvas');
          cv2.width = Math.round(img.width * sc); cv2.height = Math.round(img.height * sc);
          cv2.getContext('2d').drawImage(img, 0, 0, cv2.width, cv2.height);
          c.image = cv2.toDataURL('image/jpeg', 0.85);
          syncInputs(); BK.touch(p); BK.refresh();
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    };
    if ($('#cvImgClear')) $('#cvImgClear').onclick = function () { c.image = null; syncInputs(); BK.touch(p); BK.refresh(); };
    $('#cvSave').onclick = function () { syncInputs(); BK.touch(p); BK.toast(t('saved')); };
    $('#cvPrint').onclick = function () {
      syncInputs();
      BK.exp.printProject(p, { pages: [coverPageObj()], what: no ? 'Omslag' : 'Cover' });
    };
    $('#cvPng').onclick = function () {
      syncInputs();
      var tmp = { title: p.title, pages: [coverPageObj()], config: p.config, id: p.id };
      BK.exp.downloadPageImage(tmp, 0, 'png');
    };
    $('#cvPrompt').onclick = function () {
      var style = 'Pixar inspired 3D render, Disney style, soft global illumination, rounded friendly shapes, expressive big eyes, warm cinematic lighting, kid friendly, high detail';
      var prompt = 'Children\'s book cover art, ' + (c.title || p.title) + ', ' +
        ((p.config && p.config.topic) || 'a warm exploratory scene') + ', ' + style +
        ', whimsical, high detail, no text, square composition, centered focal point';
      BK.modal('<h3>✨ ' + (no ? 'AI-prompt for omslagskunst' : 'AI prompt for cover art') + '</h3>' +
        '<div class="bk-out">' + esc(prompt) + '</div>' +
        '<div class="actions"><button class="bk-btn primary" id="mCp">' + t('copy') + '</button></div>',
        function (back, close) {
          BK.$('#mCp', back).onclick = function () { BK.copyText(prompt); BK.toast(t('copied')); close(); };
        });
    };
    renderPrev();
  });

  /* =====================================================================
     AI PROMPT STUDIO
     ===================================================================== */
  BK.route('/prompts', function (root) {
    var no = BK.lang() === 'no';
    var STYLES = {
      pixar: { name: ['Pixar-inspirert 3D', 'Pixar-inspired 3D'], txt: 'Pixar-inspired 3D render, soft global illumination, rounded friendly shapes, expressive big eyes, subsurface skin, cinematic warm lighting, high detail' },
      watercolor: { name: ['Akvarell', 'Watercolor'], txt: 'soft watercolor illustration, gentle washes, visible paper texture, pastel palette, loose expressive brushwork, storybook charm' },
      montessori: { name: ['Montessori-inspirert', 'Montessori inspired'], txt: 'realistic and calm educational illustration, accurate natural details, muted natural colors, no fantasy elements, animals behave naturally, clean composition on white' },
      clipart: { name: ['Clipart', 'Clipart'], txt: 'clean vector clipart, bold outlines, flat bright colors, simple shapes, white background, sticker style' },
      cartoon: { name: ['Tegneserie', 'Cartoon'], txt: 'playful cartoon illustration, bold clean linework, cel shading, cheerful colors, dynamic poses' },
      realistic: { name: ['Realistisk', 'Realistic'], txt: 'realistic detailed illustration, natural lighting, lifelike textures, soft depth of field' },
    };
    var KINDS = {
      character: { name: ['Karakterprompt', 'Character prompt'], pre: ['Character design of', 'Character design of'] },
      illustration: { name: ['Illustrasjonsprompt', 'Illustration prompt'], pre: ['Children\'s book illustration of', 'Children\'s book illustration of'] },
      scene: { name: ['Sceneprompt', 'Scene prompt'], pre: ['Full scene illustration of', 'Full scene illustration of'] },
      cover: { name: ['Omslagsprompt', 'Cover prompt'], pre: ['Children\'s book cover art of', 'Children\'s book cover art of'] },
      coloringpage: { name: ['Fargeleggingsside', 'Coloring page prompt'], pre: ['Black and white coloring book page of', 'Black and white coloring book page of'] },
    };
    var st = BK._promptState || (BK._promptState = { style: 'pixar', kind: 'illustration', subject: '', details: '' });

    root.innerHTML =
      head('✨ ' + t('nav_prompts'),
        no ? 'Profesjonelle prompter for Midjourney, DALL-E, Ideogram og andre bildeverktøy. Komponer, kopier, lagre og eksporter.' : 'Professional prompts for Midjourney, DALL-E, Ideogram and other image tools. Compose, copy, save and export.') +
      '<div class="bk-grid c2" style="align-items:start">' +
      '<div class="bk-card"><div class="bk-form" style="grid-template-columns:1fr">' +
      '<div class="bk-field"><label>' + (no ? 'Prompttype' : 'Prompt type') + '</label><div class="bk-chips">' +
      Object.keys(KINDS).map(function (k) {
        return '<button class="bk-chip' + (st.kind === k ? ' on' : '') + '" data-k="' + k + '">' + esc(L(KINDS[k].name)) + '</button>';
      }).join('') + '</div></div>' +
      '<div class="bk-field"><label>' + (no ? 'Stil' : 'Style') + '</label><div class="bk-chips">' +
      Object.keys(STYLES).map(function (k) {
        return '<button class="bk-chip' + (st.style === k ? ' on' : '') + '" data-s="' + k + '">' + esc(L(STYLES[k].name)) + '</button>';
      }).join('') + '</div></div>' +
      '<div class="bk-field"><label>' + (no ? 'Motiv' : 'Subject') + '</label><input id="prSubject" type="text" value="' + esc(st.subject) + '" placeholder="' +
      (no ? 'F.eks. en seks år gammel jente som planter frø i hagen' : 'E.g. a six year old girl planting seeds in the garden') + '"></div>' +
      '<div class="bk-field"><label>' + (no ? 'Ekstra detaljer (valgfritt)' : 'Extra details (optional)') + '</label><input id="prDetails" type="text" value="' + esc(st.details) + '" placeholder="' +
      (no ? 'F.eks. gyllent ettermiddagslys, rødt forkle' : 'E.g. golden afternoon light, red apron') + '"></div>' +
      '</div>' +
      '<button class="bk-btn primary lg" id="prGo" style="margin-top:14px">✨ ' + t('generate') + '</button></div>' +
      '<div><div class="bk-card" id="prOut" style="display:none"></div>' +
      '<section class="bk-section" style="margin-top:14px"><h2>💾 ' + (no ? 'Lagrede prompter' : 'Saved prompts') +
      (BK.state.savedPrompts.length ? '<button class="more bk-btn quiet sm" id="prExportAll">📤 ' + t('export_') + '</button>' : '') + '</h2>' +
      (BK.state.savedPrompts.length ? BK.state.savedPrompts.map(function (sp, i) {
        return '<div class="bk-card" style="margin-bottom:10px;padding:13px 15px"><div style="font-weight:800;font-size:12.5px;margin-bottom:4px">' + esc(sp.title) + '</div>' +
          '<div style="font-size:11.5px;color:var(--ink-soft);line-height:1.5;max-height:54px;overflow:hidden">' + esc(sp.text) + '</div>' +
          '<div style="display:flex;gap:6px;margin-top:8px"><button class="bk-btn soft sm" data-cp="' + i + '">' + t('copy') + '</button>' +
          '<button class="bk-btn quiet sm" data-rm="' + i + '">🗑️</button></div></div>';
      }).join('') : '<div class="bk-empty"><div class="big">💾</div><p>' + t('none_yet') + '</p></div>') +
      '</section></div></div>';

    BK.$$('[data-k]', root).forEach(function (b) { b.onclick = function () { st.kind = b.getAttribute('data-k'); BK.refresh(); }; });
    BK.$$('[data-s]', root).forEach(function (b) { b.onclick = function () { st.style = b.getAttribute('data-s'); BK.refresh(); }; });

    $('#prGo').onclick = function () {
      st.subject = $('#prSubject').value.trim();
      st.details = $('#prDetails').value.trim();
      if (!st.subject) { BK.toast(no ? 'Skriv inn et motiv først.' : 'Enter a subject first.'); return; }
      var kind = KINDS[st.kind], style = STYLES[st.style];
      var parts = [L(kind.pre) + ' ' + st.subject];
      if (st.kind === 'coloringpage') {
        parts.push('clean bold outlines, no shading, no color fills, white background, kid friendly line art, printable');
      } else {
        parts.push(style.txt);
      }
      if (st.details) parts.push(st.details);
      if (st.kind === 'cover') parts.push('no text, space for title at the top, strong central composition');
      if (st.kind === 'character') parts.push('full body, neutral background, consistent character reference sheet');
      var promptTxt = parts.join(', ');
      var out = $('#prOut');
      out.style.display = 'block';
      out.innerHTML = '<h3 style="margin-bottom:8px">' + esc(L(kind.name)) + ' · ' + esc(L(style.name)) + '</h3>' +
        '<div class="bk-out" id="prText">' + esc(promptTxt) + '</div>' +
        '<div style="display:flex;gap:8px;margin-top:12px;flex-wrap:wrap">' +
        '<button class="bk-btn primary sm" id="prCopy">' + t('copy') + '</button>' +
        '<button class="bk-btn ghost sm" id="prSave">💾 ' + t('save') + '</button>' +
        (BK.state.user && BK.state.user.role === 'owner'
          ? '<button class="bk-btn soft sm" id="prMiaTeo">🧒 Mia &amp; Teo</button>' : '') +
        '</div>';
      if ($('#prMiaTeo')) $('#prMiaTeo').onclick = function () {
        var btn2 = this;
        btn2.disabled = true;
        BK.ai.charPrompt().then(function (cp) {
          btn2.disabled = false;
          if (promptTxt.indexOf('Mia and Teo, two six-year-old') !== -1) return;
          promptTxt = cp + '\n\nScene: ' + promptTxt;
          $('#prText').textContent = promptTxt;
          BK.toast(no ? 'Mia & Teo-karakterprompten er lagt inn.' : 'The Mia & Teo character prompt was inserted.');
        }, function () {
          btn2.disabled = false;
          BK.toast(no ? 'Karakterprompten er kun tilgjengelig for eierkontoen.' : 'The character prompt is only available to the owner account.');
        });
      };
      $('#prCopy').onclick = function () { BK.copyText(promptTxt); BK.toast(t('copied')); };
      $('#prSave').onclick = function () {
        BK.state.savedPrompts.unshift({ id: BK.uid(), ts: Date.now(), title: st.subject.slice(0, 60), text: promptTxt, style: st.style, kind: st.kind });
        BK.save(true);
        BK.refresh();
      };
    };
    BK.$$('[data-cp]', root).forEach(function (b) {
      b.onclick = function () { BK.copyText(BK.state.savedPrompts[+b.getAttribute('data-cp')].text); BK.toast(t('copied')); };
    });
    BK.$$('[data-rm]', root).forEach(function (b) {
      b.onclick = function () { BK.state.savedPrompts.splice(+b.getAttribute('data-rm'), 1); BK.save(true); BK.refresh(); };
    });
    if ($('#prExportAll')) $('#prExportAll').onclick = function () {
      var txt = BK.state.savedPrompts.map(function (sp) { return '## ' + sp.title + '\n' + sp.text; }).join('\n\n');
      BK.download('bookly-prompts.txt', new Blob([txt], { type: 'text/plain' }));
      BK.logExport(null, 'TXT', no ? 'Lagrede prompter' : 'Saved prompts');
    };
  });

  /* =====================================================================
     PUBLISERINGSASSISTENT
     ===================================================================== */
  BK.route('/publishing', function (root, rest) {
    var no = BK.lang() === 'no';
    var tab = BK._pubTab || 'books';
    var st = BK._pubState || (BK._pubState = {
      market: 'both', projectId: rest[0] || null,
      genre: 'bildebok', formats: { paperback: true, hardcover: false, ebook: true },
      title: '', author: '', themes: '', desc: '', price: '', audience: '',
    });
    if (rest[0]) st.projectId = rest[0];
    var p = st.projectId ? BK.getProject(st.projectId) : null;
    if (p && !st.title) { st.title = p.title; st.author = (p.cover && p.cover.author) || ''; }

    root.innerHTML =
      head('🚀 ' + t('nav_publishing'),
        no ? 'Gjør utgivelsen klar for Norge (BoldBooks, Kolofon, Forlagshuset Vest, ebok.no), internasjonalt (Amazon KDP, IngramSpark, Bookvault) og digitalsalg.' :
             'Prepare your release for Norway (BoldBooks, Kolofon, Forlagshuset Vest, ebok.no), internationally (Amazon KDP, IngramSpark, Bookvault) and digital shops.') +
      '<div class="bk-tabs">' +
      '<button class="bk-tab' + (tab === 'books' ? ' on' : '') + '" data-tab="books">📚 ' + (no ? 'Bokutgivelse' : 'Book publishing') + '</button>' +
      '<button class="bk-tab' + (tab === 'digital' ? ' on' : '') + '" data-tab="digital">🛍️ ' + (no ? 'Digitale produkter' : 'Digital products') + '</button>' +
      '</div><div id="pubBody"></div>';

    BK.$$('[data-tab]', root).forEach(function (b) {
      b.onclick = function () { BK._pubTab = b.getAttribute('data-tab'); BK.refresh(); };
    });

    var body = $('#pubBody');
    if (tab === 'books') renderBooks(body); else renderDigital(body);

    function formCommon(showFormats) {
      var projects = BK.state.projects.filter(function (x) { return !x.archived; });
      return '<div class="bk-card" style="margin-bottom:16px"><div class="bk-form">' +
        '<div class="bk-field"><label>' + (no ? 'Hent fra prosjekt' : 'Load from project') + '</label><select id="puProj"><option value="">—</option>' +
        projects.map(function (x) { return '<option value="' + x.id + '"' + (st.projectId === x.id ? ' selected' : '') + '>' + esc(x.title) + '</option>'; }).join('') + '</select></div>' +
        '<div class="bk-field"><label>' + t('title') + ' *</label><input id="puTitle" type="text" value="' + esc(st.title) + '"></div>' +
        '<div class="bk-field"><label>' + (no ? 'Forfatter' : 'Author') + '</label><input id="puAuthor" type="text" value="' + esc(st.author) + '"></div>' +
        '<div class="bk-field"><label>' + (no ? 'Sjanger' : 'Genre') + '</label><select id="puGenre">' +
        [['bildebok', no ? 'Bildebok' : 'Picture book'], ['aktivitetsbok', no ? 'Aktivitetsbok' : 'Activity book'], ['pedagogikk', no ? 'Pedagogikk/foreldre' : 'Education/parenting'], ['skjonn', no ? 'Skjønnlitteratur' : 'Fiction'], ['sakprosa', no ? 'Sakprosa' : 'Non-fiction']].map(function (op) {
          return '<option value="' + op[0] + '"' + (st.genre === op[0] ? ' selected' : '') + '>' + op[1] + '</option>';
        }).join('') + '</select></div>' +
        '<div class="bk-field"><label>' + t('audience') + '</label><input id="puAud" type="text" value="' + esc(st.audience) + '" placeholder="' + (no ? 'F.eks. barn 3-6 år' : 'E.g. children ages 3-6') + '"></div>' +
        '<div class="bk-field"><label>' + (no ? 'Pris' : 'Price') + '</label><input id="puPrice" type="text" value="' + esc(st.price) + '"></div>' +
        '<div class="bk-field full"><label>' + (no ? 'Temaer (komma)' : 'Themes (commas)') + '</label><input id="puThemes" type="text" value="' + esc(st.themes) + '" placeholder="' + (no ? 'natur, hagearbeid, årstider' : 'nature, gardening, seasons') + '"></div>' +
        '<div class="bk-field full"><label>' + (no ? 'Kort beskrivelse' : 'Short description') + '</label><textarea id="puDesc" rows="3">' + esc(st.desc) + '</textarea></div>' +
        (showFormats ?
          '<div class="bk-field full"><label>' + (no ? 'Formater' : 'Formats') + '</label><div class="bk-chips">' +
          [['paperback', 'Paperback'], ['hardcover', 'Hardcover'], ['ebook', no ? 'E-bok' : 'Ebook']].map(function (fm) {
            return '<button class="bk-chip' + (st.formats[fm[0]] ? ' on' : '') + '" data-fmt="' + fm[0] + '">' + fm[1] + '</button>';
          }).join('') + '</div></div>' +
          '<div class="bk-field full"><label>' + (no ? 'Marked' : 'Market') + '</label><div class="bk-chips">' +
          [['no', '🇳🇴 ' + (no ? 'Norge' : 'Norway')], ['int', '🌍 ' + (no ? 'Internasjonalt' : 'International')], ['both', '🌐 ' + (no ? 'Begge' : 'Both')]].map(function (m) {
            return '<button class="bk-chip' + (st.market === m[0] ? ' on' : '') + '" data-mkt="' + m[0] + '">' + m[1] + '</button>';
          }).join('') + '</div></div>'
        : '') +
        '</div><button class="bk-btn primary lg" id="puGo" style="margin-top:16px">✨ ' + t('generate') + '</button></div>';
    }
    function bindCommon() {
      $('#puProj').onchange = function () {
        st.projectId = this.value || null;
        var pr = st.projectId ? BK.getProject(st.projectId) : null;
        if (pr) {
          st.title = pr.title;
          st.author = (pr.cover && pr.cover.author) || st.author;
          st.desc = (pr.meta && pr.meta.description) || st.desc;
        }
        BK.refresh();
      };
      BK.$$('[data-fmt]', body).forEach(function (b) {
        b.onclick = function () { var k = b.getAttribute('data-fmt'); st.formats[k] = !st.formats[k]; BK.refresh(); };
      });
      BK.$$('[data-mkt]', body).forEach(function (b) {
        b.onclick = function () { st.market = b.getAttribute('data-mkt'); BK.refresh(); };
      });
      ['puTitle:title', 'puAuthor:author', 'puAud:audience', 'puPrice:price', 'puThemes:themes', 'puDesc:desc'].forEach(function (mp) {
        var pr = mp.split(':');
        var el = $('#' + pr[0]);
        if (el) el.oninput = function () { st[pr[1]] = this.value; };
      });
      $('#puGenre').onchange = function () { st.genre = this.value; };
    }

    function outCard(icon, title, bodyHtml, copyText) {
      var id = 'oc' + Math.random().toString(36).slice(2, 7);
      setTimeout(function () {
        var b2 = document.getElementById(id);
        if (b2) b2.onclick = function () { BK.copyText(copyText); BK.toast(t('copied')); };
      }, 0);
      return '<div class="bk-card" style="margin-bottom:14px"><div style="display:flex;align-items:center;gap:8px;margin-bottom:10px">' +
        '<h3 style="flex:1;margin:0">' + icon + ' ' + esc(title) + '</h3>' +
        '<button class="bk-btn ghost sm" id="' + id + '">' + t('copy') + '</button></div>' + bodyHtml + '</div>';
    }

    function renderBooks(el) {
      var platforms = (st.market !== 'int' ? BK.pub.PLATFORMS.no : []).concat(st.market !== 'no' ? BK.pub.PLATFORMS.int : []);
      el.innerHTML = formCommon(true) +
        '<div class="bk-grid auto" style="margin-bottom:16px">' + platforms.map(function (pl) {
          return '<div class="bk-card hover" onclick="window.open(\'' + pl.url + '\',\'_blank\')" style="padding:15px"><h3>' + pl.icon + ' ' + esc(pl.name) + '</h3>' +
            '<p style="font-size:12px;color:var(--ink-soft);line-height:1.55">' + esc(L(pl.desc)) + '</p>' +
            '<span style="font-size:11.5px;font-weight:700;color:var(--cerise)">' + pl.url.replace('https://www.', '').replace('https://', '') + ' ↗</span></div>';
        }).join('') + '</div><div id="puOut"></div>';
      bindCommon();
      $('#puGo').onclick = function () {
        if (!st.title.trim()) { BK.toast(no ? 'Fyll inn tittel først.' : 'Enter a title first.'); return; }
        var d = {
          title: st.title, author: st.author, genre: st.genre, audience: st.audience,
          themes: st.themes.split(',').map(function (s) { return s.trim(); }).filter(Boolean),
          desc: st.desc, price: st.price, market: st.market, formats: st.formats,
          imprint: 'Little Montessori Explorers', bio: '',
        };
        var r = BK.pub.generate(d);
        var pr = st.projectId ? BK.getProject(st.projectId) : null;
        var total = 0;
        r.checklist.forEach(function (s) { total += s.items.length; });
        if (pr) {
          pr.publishing = pr.publishing || { done: {} };
          pr.publishing.total = total;
          pr.publishing.market = st.market;
          BK.touch(pr);
        }
        var done = (pr && pr.publishing.done) || {};

        var html = '';
        html += outCard('📗', no ? 'ISBN-sjekkliste' : 'ISBN checklist',
          r.isbn.map(function (it) { return '<label class="bk-chk"><input type="checkbox"><span>' + esc(it) + '</span></label>'; }).join(''),
          r.isbn.map(function (x) { return '[ ] ' + x; }).join('\n'));
        html += outCard('🗂️', no ? 'Metadata' : 'Metadata', '<div class="bk-out">' + esc(r.metadata) + '</div>', r.metadata);
        html += outCard('🔑', no ? 'Nøkkelord (KDP: 7 felt)' : 'Keywords (KDP: 7 slots)',
          '<div class="bk-kv">' + r.keywords.map(function (k) { return '<span class="bk-kw">' + esc(k) + '</span>'; }).join('') + '</div>' +
          '<div class="bk-note" style="margin-top:10px">' + (no ? 'Backend-nøkkelord: ' : 'Backend keywords: ') + esc(r.backendKeywords) + '</div>',
          r.keywords.join('; '));
        html += outCard('🏷️', no ? 'Kategorier' : 'Categories',
          r.categories.map(function (c2) { return '<h4 style="font-size:12.5px;color:var(--cerise);margin:8px 0 4px">' + esc(c2.title) + '</h4><div class="bk-out">' + esc(c2.lines.join('\n')) + '</div>'; }).join(''),
          r.categories.map(function (c2) { return c2.title + ':\n' + c2.lines.join('\n'); }).join('\n\n'));
        html += outCard('👩‍🏫', no ? 'Forfatterbio' : 'Author bio', '<div class="bk-out">' + esc(r.bio) + '</div>', r.bio);
        html += outCard('📝', no ? 'Produktbeskrivelse' : 'Product description', '<div class="bk-out">' + esc(r.productDesc) + '</div>', r.productDesc);
        html += outCard('📈', 'SEO',
          r.seo.map(function (s) { return '<h4 style="font-size:12.5px;color:var(--cerise);margin:8px 0 4px">' + esc(s.title) + '</h4><div class="bk-out">' + esc(s.lines.join('\n')) + '</div>'; }).join(''),
          r.seo.map(function (s) { return s.title + ':\n' + s.lines.join('\n'); }).join('\n\n'));

        var ci = 0;
        html += outCard('✅', no ? 'Publiseringssjekkliste' : 'Publishing checklist',
          r.checklist.map(function (s) {
            return '<h4 style="font-size:12.5px;color:var(--cerise);margin:10px 0 4px">' + esc(s.name) + '</h4>' +
              s.items.map(function (it) {
                var key = 'c' + (ci++);
                return '<label class="bk-chk"><input type="checkbox" data-chk="' + key + '"' + (done[key] ? ' checked' : '') + '><span>' + esc(it) + '</span></label>';
              }).join('');
          }).join(''),
          r.checklist.map(function (s) { return s.name + ':\n' + s.items.map(function (x) { return '[ ] ' + x; }).join('\n'); }).join('\n\n'));

        var spec = pr ? BK.exp.printSpec(pr, {}) : null;
        html += outCard('🖨️', no ? 'Trykkforberedelse' : 'Print preparation',
          (spec ? '<div class="bk-out">' + esc(spec.lines.join('\n')) + '</div>' : '') +
          '<h4 style="font-size:12.5px;color:var(--cerise);margin:10px 0 4px">' + (no ? 'Sjekkliste' : 'Checklist') + '</h4>' +
          BK.exp.printChecklist().map(function (it) { return '<label class="bk-chk"><input type="checkbox"><span>' + esc(it) + '</span></label>'; }).join(''),
          ((spec ? spec.lines.join('\n') + '\n\n' : '') + BK.exp.printChecklist().map(function (x) { return '[ ] ' + x; }).join('\n')));

        $('#puOut').innerHTML = html +
          '<div class="bk-note pink">💡 ' + (no ? 'Kategorier og koder er forslag: sjekk alltid plattformens egen liste før du publiserer.' : "Categories and codes are suggestions: always check the platform's own list before publishing.") + '</div>';

        BK.$$('[data-chk]', el).forEach(function (cb) {
          cb.onchange = function () {
            if (!pr) return;
            if (cb.checked) pr.publishing.done[cb.getAttribute('data-chk')] = 1;
            else delete pr.publishing.done[cb.getAttribute('data-chk')];
            BK.touch(pr);
          };
        });
        $('#puOut').scrollIntoView({ behavior: 'smooth' });
      };
    }

    function renderDigital(el) {
      el.innerHTML =
        '<div class="bk-grid auto" style="margin-bottom:16px">' + BK.pub.SHOPS.map(function (s) {
          return '<div class="bk-card" style="padding:13px;text-align:center;font-weight:800;font-size:13px">🛍️ ' + esc(s) + '</div>';
        }).join('') + '</div>' + formCommon(false) + '<div id="puOut"></div>';
      bindCommon();
      $('#puGo').onclick = function () {
        if (!st.title.trim()) { BK.toast(no ? 'Fyll inn tittel først.' : 'Enter a title first.'); return; }
        var d = {
          title: st.title, audience: st.audience, desc: st.desc,
          themes: st.themes.split(',').map(function (s) { return s.trim(); }).filter(Boolean),
        };
        var r = BK.pub.digital(d);
        var html = '';
        html += outCard('🏷️', no ? 'Produkttitler' : 'Product titles',
          r.titles.map(function (x) { return '<div class="bk-out" style="margin-bottom:6px">' + esc(x) + '</div>'; }).join(''), r.titles.join('\n'));
        html += outCard('📝', no ? 'Salgstekst' : 'Sales copy', '<div class="bk-out">' + esc(r.salesCopy) + '</div>', r.salesCopy);
        html += outCard('⭐', no ? 'Produktfordeler' : 'Product features',
          r.features.map(function (x) { return '<div style="font-size:13px;padding:2px 0">✓ ' + esc(x) + '</div>'; }).join(''), r.features.map(function (x) { return '• ' + x; }).join('\n'));
        html += outCard('🔑', no ? 'SEO-nøkkelord (Etsy: 13 tagger)' : 'SEO keywords (Etsy: 13 tags)',
          '<div class="bk-kv">' + r.seoKeywords.map(function (k) { return '<span class="bk-kw">' + esc(k) + '</span>'; }).join('') + '</div>', r.seoKeywords.join(', '));
        html += outCard('🛍️', no ? 'Tips per plattform' : 'Tips per platform',
          r.perShop.map(function (s) { return '<div style="font-size:12.5px;padding:4px 0"><strong style="color:var(--cerise)">' + esc(s.shop) + ':</strong> ' + esc(s.tips) + '</div>'; }).join(''),
          r.perShop.map(function (s) { return s.shop + ': ' + s.tips; }).join('\n'));
        $('#puOut').innerHTML = html;
        $('#puOut').scrollIntoView({ behavior: 'smooth' });
      };
    }
  });

  /* =====================================================================
     EKSPORT
     ===================================================================== */
  BK.route('/exports', function (root) {
    var no = BK.lang() === 'no';
    var s = BK.state.settings;
    root.innerHTML =
      head('📤 ' + t('nav_exports'),
        no ? 'Eksporthistorikk og trykkinnstillinger. PDF lages via nettleserens "Lagre som PDF" i utskriftsdialogen.' : 'Export history and print settings. PDFs are created via the browser\'s "Save as PDF" in the print dialog.') +
      '<div class="bk-grid c2" style="align-items:start">' +
      '<section class="bk-section" style="margin-top:0"><h2>🗂️ ' + (no ? 'Historikk' : 'History') + '</h2>' +
      exportTable(BK.state.exports.slice(0, 20)) + '</section>' +
      '<section class="bk-section" style="margin-top:0"><h2>🖨️ ' + (no ? 'Trykkinnstillinger' : 'Print settings') + '</h2>' +
      '<div class="bk-card"><div class="bk-form" style="grid-template-columns:1fr 1fr">' +
      '<div class="bk-field"><label>' + (no ? 'Standard sidestørrelse' : 'Default page size') + '</label><select id="exSize">' +
      Object.keys(BK.SIZES).map(function (k) {
        return '<option value="' + k + '"' + (s.pageSize === k ? ' selected' : '') + '>' + esc(L(BK.SIZES[k].label)) + '</option>';
      }).join('') + '</select></div>' +
      '<div class="bk-field"><label>Bleed (mm)</label><select id="exBleed">' +
      [3, 3.2, 5].map(function (b) { return '<option value="' + b + '"' + (s.bleed === b ? ' selected' : '') + '>' + b + ' mm</option>'; }).join('') + '</select></div>' +
      '</div>' +
      '<h4 style="font-size:13px;color:var(--cerise);margin:14px 0 6px">' + (no ? 'Ryggbredde-kalkulator' : 'Spine width calculator') + '</h4>' +
      '<div class="bk-form" style="grid-template-columns:1fr 1fr"><div class="bk-field"><label>' + (no ? 'Sidetall' : 'Page count') + '</label><input id="exPages" type="number" value="32"></div>' +
      '<div class="bk-field"><label>' + (no ? 'Papir' : 'Paper') + '</label><select id="exPaper">' +
      [['premium', no ? 'Farge premium' : 'Color premium'], ['color', no ? 'Farge standard' : 'Color standard'], ['white', no ? 'SH hvit' : 'B/W white'], ['cream', no ? 'SH krem' : 'B/W cream']].map(function (op) {
        return '<option value="' + op[0] + '">' + op[1] + '</option>';
      }).join('') + '</select></div></div>' +
      '<div class="bk-note blue" id="exSpine" style="margin-top:10px"></div>' +
      '<h4 style="font-size:13px;color:var(--cerise);margin:14px 0 6px">' + (no ? 'Trykksjekkliste' : 'Print checklist') + '</h4>' +
      BK.exp.printChecklist().map(function (it) { return '<label class="bk-chk"><input type="checkbox"><span>' + esc(it) + '</span></label>'; }).join('') +
      '</div></section></div>';

    function updSpine() {
      var pages = parseInt($('#exPages').value, 10) || 0;
      var sp = BK.exp.spineWidth(pages, $('#exPaper').value);
      var v = sp.toFixed(2);
      $('#exSpine').textContent = '📐 ' + (no ? 'Ryggbredde: ' : 'Spine width: ') + (no ? v.replace('.', ',') : v) + ' mm' +
        (pages < 79 ? (no ? ' · for tynn for ryggtekst' : ' · too thin for spine text') : '');
    }
    $('#exSize').onchange = function () { s.pageSize = this.value; BK.save(true); };
    $('#exBleed').onchange = function () { s.bleed = parseFloat(this.value); BK.save(true); };
    $('#exPages').oninput = updSpine;
    $('#exPaper').onchange = updSpine;
    updSpine();
  });

  /* =====================================================================
     INNSTILLINGER
     ===================================================================== */
  BK.route('/settings', function (root) {
    var no = BK.lang() === 'no';
    var u = BK.state.user;
    var plans = [
      { id: 'free', name: 'Free', price: '0 kr', feats: no ? ['3 prosjekter', 'Alle skapere', 'PDF-eksport', 'Vannmerke på eksport'] : ['3 projects', 'All creators', 'PDF export', 'Watermark on exports'] },
      { id: 'starter', name: 'Starter', price: '99 kr/mnd', feats: no ? ['Ubegrensede prosjekter', 'PNG/JPG/DOCX-eksport', 'Malbiblioteket', 'Uten vannmerke'] : ['Unlimited projects', 'PNG/JPG/DOCX export', 'Template library', 'No watermark'] },
      { id: 'pro', name: 'Pro', price: '199 kr/mnd', feats: no ? ['Alt i Starter', 'AI-tekstgenerering', 'Publiseringsassistent', 'Prioritert støtte'] : ['Everything in Starter', 'AI text generation', 'Publishing Assistant', 'Priority support'], hot: true },
      { id: 'commercial', name: 'Commercial', price: '399 kr/mnd', feats: no ? ['Alt i Pro', 'Kommersiell lisens for salg', 'Digitalsalg-verktøy', 'Tidlig tilgang'] : ['Everything in Pro', 'Commercial licence for sales', 'Digital seller tools', 'Early access'] },
    ];
    root.innerHTML =
      head('⚙️ ' + t('nav_settings'), '') +
      '<div class="bk-grid c2" style="align-items:start">' +
      '<div><div class="bk-card" style="margin-bottom:14px"><h3>👤 ' + (no ? 'Konto' : 'Account') + '</h3>' +
      (u ? '<p style="font-size:13px;margin:8px 0">' + esc(u.name || '') + '<br><span style="color:var(--ink-soft)">' + esc(u.email) + '</span></p>' +
        '<div class="bk-note blue">' + t('synced') + '</div>' +
        '<button class="bk-btn quiet sm" id="setLogout" style="margin-top:10px">' + (no ? 'Logg ut' : 'Sign out') + '</button>'
        : '<p style="font-size:13px;margin:8px 0;color:var(--ink-soft)">' + t('local_only') + '. ' +
        (no ? 'Logg inn med LME-kontoen din for å synkronisere prosjektene mellom enheter.' : 'Sign in with your LME account to sync projects across devices.') + '</p>' +
        '<a class="bk-btn primary sm" href="/login?next=' + encodeURIComponent('/bookly/') + '">' + (no ? 'Logg inn' : 'Sign in') + '</a>') +
      '</div>' +
      '<div class="bk-card" style="margin-bottom:14px"><h3>🤖 ' + (no ? 'AI-status' : 'AI status') + '</h3>' +
      '<div id="setAiStatus" style="font-size:13px;margin-top:8px;color:var(--ink-soft)">' + (no ? 'Sjekker…' : 'Checking…') + '</div>' +
      '<button class="bk-btn ghost sm" id="setImgTest" style="margin-top:10px">🧪 ' + (no ? 'Test bildegenerering' : 'Test image generation') + '</button>' +
      '<div id="setImgTestOut" style="font-size:12px;margin-top:8px;line-height:1.5"></div></div>' +
      '<div class="bk-card" style="margin-bottom:14px"><h3>🌍 ' + t('language') + '</h3><div class="bk-chips" style="margin-top:8px">' +
      '<button class="bk-chip' + (BK.lang() === 'no' ? ' on' : '') + '" data-lng="no">🇳🇴 Norsk</button>' +
      '<button class="bk-chip' + (BK.lang() === 'en' ? ' on' : '') + '" data-lng="en">🌍 English</button></div></div>' +
      '<div class="bk-card"><h3>💾 ' + (no ? 'Dine data' : 'Your data') + '</h3>' +
      '<p style="font-size:12.5px;color:var(--ink-soft);margin:6px 0 10px">' +
      (no ? 'Last ned alt som en fil, eller importer fra en tidligere eksport.' : 'Download everything as one file, or import from a previous export.') + '</p>' +
      '<div style="display:flex;gap:8px;flex-wrap:wrap">' +
      '<button class="bk-btn ghost sm" id="setExport">📤 ' + (no ? 'Eksporter bibliotek' : 'Export library') + '</button>' +
      '<label class="bk-btn ghost sm" style="cursor:pointer">📥 ' + (no ? 'Importer' : 'Import') + '<input id="setImport" type="file" accept=".json" style="display:none"></label>' +
      '</div></div></div>' +
      '<div><h2 style="font-family:var(--font-display);font-size:17px;margin-bottom:12px">💎 ' + (no ? 'Abonnement' : 'Subscription') + '</h2>' +
      '<div class="bk-grid c2">' + plans.map(function (pl) {
        var isCur = BK.state.plan === pl.id;
        return '<div class="bk-plan' + (pl.hot ? ' hot' : '') + '"><div class="pl-name">' + pl.name + (isCur ? ' ✓' : '') + '</div>' +
          '<div class="pl-price">' + pl.price.split('/')[0] + '<small>' + (pl.price.indexOf('/') > -1 ? '/' + pl.price.split('/')[1] : '') + '</small></div>' +
          '<ul>' + pl.feats.map(function (ft) { return '<li>' + esc(ft) + '</li>'; }).join('') + '</ul>' +
          (isCur ? '<button class="bk-btn soft sm" disabled>' + (no ? 'Din plan' : 'Your plan') + '</button>'
            : '<a class="bk-btn ' + (pl.hot ? 'primary' : 'ghost') + ' sm" href="/oppgrader">' + (no ? 'Oppgrader' : 'Upgrade') + '</a>') + '</div>';
      }).join('') + '</div>' +
      '<div class="bk-note" style="margin-top:12px">' + (no ? 'Betaling håndteres trygt via LME-plattformen (Stripe).' : 'Payments are handled securely through the LME platform (Stripe).') + '</div></div></div>';

    BK.$$('[data-lng]', root).forEach(function (b) {
      b.onclick = function () { BK.setLang(b.getAttribute('data-lng')); BK.renderChrome(); BK.refresh(); };
    });
    if ($('#setLogout')) $('#setLogout').onclick = function () { window.LME && LME.signOut(); };
    fetch('/api/bookly/status', { credentials: 'same-origin' })
      .then(function (r) { return r.json(); })
      .then(function (s) {
        var el = $('#setAiStatus');
        if (!el) return;
        function row(ok, label, hint) {
          return '<div style="padding:3px 0">' + (ok ? '✅' : '❌') + ' <strong>' + label + '</strong>' +
            (ok ? '' : '<div style="font-size:11.5px;color:var(--ink-soft);margin-left:24px">' + hint + '</div>') + '</div>';
        }
        el.innerHTML =
          row(s.text, no ? 'Tekstgenerering (bøker)' : 'Text generation (books)',
            no ? 'Legg inn ANTHROPIC_API_KEY i Cloudflare → prosjektet → Settings → Variables and Secrets.' : 'Add ANTHROPIC_API_KEY in Cloudflare → project → Settings → Variables and Secrets.') +
          row(s.image, no ? 'Bildegenerering' : 'Image generation',
            no ? 'Legg inn OPENAI_API_KEY (Production) i Cloudflare → prosjektet → Settings → Variables and Secrets, og kjør "Retry deployment" etterpå.' : 'Add OPENAI_API_KEY (Production) in Cloudflare → project → Settings → Variables and Secrets, then "Retry deployment".') +
          row(s.kv, no ? 'Skylagring (KV)' : 'Cloud storage (KV)',
            no ? 'KV-bindingen BUILDER_KV mangler på prosjektet.' : 'The BUILDER_KV binding is missing on the project.');
      })
      .catch(function () {
        var el = $('#setAiStatus');
        if (el) el.textContent = no ? 'Fikk ikke kontakt med serveren.' : 'Could not reach the server.';
      });
    if ($('#setImgTest')) $('#setImgTest').onclick = function () {
      var btn = this, out = $('#setImgTestOut');
      btn.disabled = true;
      btn.innerHTML = '⏳ ' + (no ? 'Tester… (opptil ett minutt)' : 'Testing… (up to a minute)');
      out.textContent = '';
      fetch('/api/bookly/image', {
        method: 'POST', credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: 'a single red apple on a white background, simple test image' }),
      })
        .then(function (r) { return r.json(); })
        .then(function (d) {
          btn.disabled = false;
          btn.innerHTML = '🧪 ' + (no ? 'Test bildegenerering' : 'Test image generation');
          if (d && d.b64) {
            out.innerHTML = '✅ <strong>' + (no ? 'Bildegenerering virker!' : 'Image generation works!') + '</strong><br>' +
              '<img src="data:image/png;base64,' + d.b64 + '" alt="" style="width:90px;border-radius:8px;margin-top:6px">';
          } else {
            out.innerHTML = '❌ <strong>' + (no ? 'Feil fra OpenAI:' : 'Error from OpenAI:') + '</strong><br>' +
              '<span style="color:var(--ink-soft)">' + esc((d && d.detail) || (d && d.error) || (no ? 'ukjent feil' : 'unknown error')) + '</span>';
          }
        })
        .catch(function (e) {
          btn.disabled = false;
          btn.innerHTML = '🧪 ' + (no ? 'Test bildegenerering' : 'Test image generation');
          out.textContent = '❌ ' + String((e && e.message) || e);
        });
    };
    $('#setExport').onclick = function () {
      var data = JSON.stringify({ projects: BK.state.projects, folders: BK.state.folders, savedPrompts: BK.state.savedPrompts, settings: BK.state.settings }, null, 2);
      BK.download('lme-bookly-bibliotek.json', new Blob([data], { type: 'application/json' }));
    };
    $('#setImport').onchange = function () {
      var file = this.files && this.files[0];
      if (!file) return;
      var reader = new FileReader();
      reader.onload = function () {
        try {
          var d = JSON.parse(reader.result);
          if (d.projects) BK.state.projects = d.projects.concat(BK.state.projects.filter(function (p) {
            return !d.projects.some(function (x) { return x.id === p.id; });
          }));
          if (d.folders) BK.state.folders = d.folders;
          if (d.savedPrompts) BK.state.savedPrompts = d.savedPrompts;
          BK.save();
          BK.refresh();
        } catch (e) { BK.toast('Import: ' + (no ? 'ugyldig fil' : 'invalid file')); }
      };
      reader.readAsText(file);
    };
  });

  /* =====================================================================
     HJELP
     ===================================================================== */
  BK.route('/help', function (root) {
    var no = BK.lang() === 'no';
    var sections = no ? [
      ['🚀 Kom i gang', 'Velg en mal under Maler, eller åpne en av skaperne i menyen. Fyll inn detaljene og trykk Generer. Alt lagres automatisk i Prosjekter, og du kan redigere hver side etterpå.'],
      ['📖 Bokskaperen og AI', 'Bokskaperen bruker Renate AI til å skrive sidetekster, illustrasjonsbeskrivelser og baksidetekst. Hvis AI ikke er tilgjengelig, brukes innebygde tekstmaler, du kan alltid redigere alt etterpå.'],
      ['🧩 Pusleriene er ekte', 'Ordletinger, kryssord, sudoku (med garantert unik løsning), labyrinter og tallgåter genereres algoritmisk. Bruk "Generer på nytt" på en side for å få en ny variant, og "Vis fasit" for løsningen.'],
      ['🖨️ Slik eksporterer du PDF', 'Trykk "Skriv ut / PDF" i et prosjekt. I utskriftsdialogen velger du "Lagre som PDF" som skriver. Sidestørrelsen settes automatisk til prosjektets format. Velg "Ingen marger" hvis dialogen spør.'],
      ['🖼️ Omslag og rygg', 'Omslagsdesigneren beregner ryggbredden fra sidetall og papirtype. Under cirka 80 sider bør ryggen være uten tekst. Bruk alltid plattformens egen omslagskalkulator for endelige mål.'],
      ['🚀 Publisering', 'Publiseringsassistenten lager ISBN-sjekkliste, metadata, nøkkelord, kategorier og sjekklister for BoldBooks, Kolofon, Forlagshuset Vest, ebok.no, Amazon KDP, IngramSpark og Bookvault. Norske ISBN er gratis fra Nasjonalbiblioteket.'],
      ['💾 Lagring og synk', 'Alt lagres i nettleseren din med en gang. Logger du inn med LME-kontoen, synkroniseres biblioteket til skyen, så du kan fortsette på en annen enhet.'],
      ['🃏 Skrive ut flashkort', 'Skriv ut på tykt papir (200 g+). Glosekort med bakside er lagt opp for dobbeltsidig utskrift: baksidene er speilvendt slik at de treffer riktig kort.'],
    ] : [
      ['🚀 Getting started', 'Pick a template under Templates, or open one of the creators in the menu. Fill in the details and press Generate. Everything is saved automatically under Projects, and every page can be edited afterwards.'],
      ['📖 The Book Creator and AI', 'The Book Creator uses Renate AI to write page texts, illustration descriptions and back cover text. If AI is unavailable, built-in templates are used, and you can always edit everything afterwards.'],
      ['🧩 The puzzles are real', 'Word searches, crosswords, sudoku (with a guaranteed unique solution), mazes and number riddles are generated algorithmically. Use "Regenerate" on a page for a new variant, and "Show solution" for the answer.'],
      ['🖨️ Exporting PDFs', 'Press "Print / PDF" in a project. In the print dialog, choose "Save as PDF" as the printer. The page size is set automatically to the project format. Choose "No margins" if asked.'],
      ['🖼️ Covers and spines', 'The Cover Designer calculates spine width from page count and paper type. Below about 80 pages, keep the spine free of text. Always use the platform\'s own cover calculator for final dimensions.'],
      ['🚀 Publishing', 'The Publishing Assistant builds ISBN checklists, metadata, keywords, categories and checklists for BoldBooks, Kolofon, Forlagshuset Vest, ebok.no, Amazon KDP, IngramSpark and Bookvault. Norwegian ISBNs are free from the National Library.'],
      ['💾 Saving and sync', 'Everything is saved in your browser instantly. If you sign in with your LME account, the library syncs to the cloud so you can continue on another device.'],
      ['🃏 Printing flashcards', 'Print on thick paper (200 gsm+). Vocabulary cards with backs are laid out for duplex printing: the backs are mirrored so they line up with the right card.'],
    ];
    root.innerHTML = head('💬 ' + t('nav_help'),
      no ? 'Korte svar på det viktigste. Trenger du mer hjelp, er Renate AI alltid tilgjengelig.' : 'Short answers to the essentials. Need more help? Renate AI is always available.') +
      '<div class="bk-grid c2">' + sections.map(function (s) {
        return '<div class="bk-card"><h3>' + s[0] + '</h3><p style="font-size:13px;color:var(--ink-soft);line-height:1.65">' + esc(s[1]) + '</p></div>';
      }).join('') + '</div>' +
      '<div class="bk-card" style="margin-top:16px;display:flex;align-items:center;gap:14px;flex-wrap:wrap">' +
      '<div class="bk-avatar" style="width:44px;height:44px">R</div>' +
      '<div style="flex:1;min-width:200px"><strong>' + (no ? 'Spør Renate AI' : 'Ask Renate AI') + '</strong>' +
      '<p style="font-size:12.5px;color:var(--ink-soft)">' + (no ? 'Veiledning om Montessori, bokproduksjon og publisering, døgnet rundt.' : 'Guidance on Montessori, book production and publishing, around the clock.') + '</p></div>' +
      '<a class="bk-btn primary" href="/spor-renate-ai" target="_blank" rel="noopener">💗 ' + (no ? 'Åpne Renate AI' : 'Open Renate AI') + '</a></div>';
  });
})();
