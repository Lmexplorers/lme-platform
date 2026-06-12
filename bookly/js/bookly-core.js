/* =====================================================================
   LME Bookly™ — kjerne: i18n, tilstand/lagring, AI-klient, ruter, utils
   ===================================================================== */
(function () {
  'use strict';
  var BK = (window.BK = window.BK || {});

  /* ============ UTILS ============ */
  BK.$ = function (sel, root) { return (root || document).querySelector(sel); };
  BK.$$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };
  BK.esc = function (s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  };
  BK.uid = function () {
    return 'bk' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  };
  BK.clone = function (o) { return JSON.parse(JSON.stringify(o)); };
  BK.shuffle = function (arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  };
  BK.rnd = function (min, max) { return min + Math.floor(Math.random() * (max - min + 1)); };
  BK.pick = function (arr) { return arr[Math.floor(Math.random() * arr.length)]; };
  BK.cap = function (s) { s = String(s || ''); return s.charAt(0).toUpperCase() + s.slice(1); };
  BK.fmtDate = function (ts) {
    var d = new Date(ts);
    return d.toLocaleDateString(BK.lang() === 'no' ? 'nb-NO' : 'en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  };
  BK.download = function (filename, blobOrUrl) {
    var a = document.createElement('a');
    a.href = typeof blobOrUrl === 'string' ? blobOrUrl : URL.createObjectURL(blobOrUrl);
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(function () {
      document.body.removeChild(a);
      if (typeof blobOrUrl !== 'string') URL.revokeObjectURL(a.href);
    }, 200);
  };
  /* Skaler ned en data-URL og returner JPEG-data-URL.
     Holder lagringen liten nok for localStorage og KV. */
  BK.shrinkImage = function (dataUrl, maxDim) {
    return new Promise(function (resolve, reject) {
      var img = new Image();
      img.onerror = function () { reject(new Error('bad_image')); };
      img.onload = function () {
        var sc = Math.min(1, (maxDim || 1400) / Math.max(img.width, img.height));
        var cv = document.createElement('canvas');
        cv.width = Math.round(img.width * sc);
        cv.height = Math.round(img.height * sc);
        var ctx = cv.getContext('2d');
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, cv.width, cv.height);
        ctx.drawImage(img, 0, 0, cv.width, cv.height);
        resolve(cv.toDataURL('image/jpeg', 0.82));
      };
      img.src = dataUrl;
    });
  };

  /* Les en bildefil, skaler ned og returner data-URL (JPEG). */
  BK.readImage = function (file, maxDim) {
    return new Promise(function (resolve, reject) {
      var reader = new FileReader();
      reader.onerror = function () { reject(new Error('read_failed')); };
      reader.onload = function () {
        BK.shrinkImage(reader.result, maxDim).then(resolve, reject);
      };
      reader.readAsDataURL(file);
    });
  };

  BK.copyText = function (text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text).catch(function () { fallback(); });
    }
    fallback();
    return Promise.resolve();
    function fallback() {
      var ta = document.createElement('textarea');
      ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); } catch (e) {}
      document.body.removeChild(ta);
    }
  };
  BK.toast = function (msg) {
    var el = BK.$('#bkToast');
    if (!el) return;
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(BK._toastT);
    // Lange meldinger (feilforklaringer) skal rekke å leses
    var ms = msg.length > 80 ? 9000 : 2400;
    BK._toastT = setTimeout(function () { el.classList.remove('show'); }, ms);
  };

  /* ============ I18N ============ */
  var DICT = {
    /* navigasjon */
    nav_dashboard: ['Dashbord', 'Dashboard'],
    nav_projects: ['Prosjekter', 'Projects'],
    nav_templates: ['Maler', 'Templates'],
    nav_book: ['Bokskaper', 'Book Creator'],
    nav_workbook: ['Arbeidsbok', 'Workbook Creator'],
    nav_activity: ['Aktivitetsbok', 'Activity Creator'],
    nav_puzzle: ['Puslerier', 'Puzzle Creator'],
    nav_flashcards: ['Flashkort', 'Flashcard Creator'],
    nav_coloring: ['Fargelegging', 'Coloring Book'],
    nav_journal: ['Journal', 'Journal Creator'],
    nav_planner: ['Planlegger', 'Planner Creator'],
    nav_cover: ['Omslagsdesigner', 'Cover Designer'],
    nav_prompts: ['AI Prompt Studio', 'AI Prompt Studio'],
    nav_publishing: ['Publiseringsassistent', 'Publishing Assistant'],
    nav_exports: ['Eksport', 'Exports'],
    nav_settings: ['Innstillinger', 'Settings'],
    nav_help: ['Hjelp', 'Help'],
    grp_create: ['Lag innhold', 'Create'],
    grp_design: ['Design og publisering', 'Design & publishing'],
    grp_more: ['Mer', 'More'],

    /* felles */
    create: ['Lag', 'Create'],
    generate: ['Generer', 'Generate'],
    regenerate: ['Generer på nytt', 'Regenerate'],
    save: ['Lagre', 'Save'],
    saved: ['Lagret', 'Saved'],
    cancel: ['Avbryt', 'Cancel'],
    delete_: ['Slett', 'Delete'],
    duplicate: ['Dupliser', 'Duplicate'],
    archive: ['Arkiver', 'Archive'],
    restore: ['Gjenopprett', 'Restore'],
    open: ['Åpne', 'Open'],
    copy: ['Kopier', 'Copy'],
    copied: ['Kopiert!', 'Copied!'],
    search: ['Søk', 'Search'],
    title: ['Tittel', 'Title'],
    topic: ['Tema', 'Topic'],
    language: ['Språk', 'Language'],
    audience: ['Målgruppe', 'Audience'],
    age_group: ['Aldersgruppe', 'Age group'],
    difficulty: ['Vanskelighetsgrad', 'Difficulty'],
    easy: ['Lett', 'Easy'],
    medium: ['Middels', 'Medium'],
    hard: ['Vanskelig', 'Hard'],
    pages: ['Sider', 'Pages'],
    none_yet: ['Ingenting her ennå.', 'Nothing here yet.'],
    use_template: ['Bruk mal', 'Use template'],
    export_: ['Eksporter', 'Export'],
    print_pdf: ['Skriv ut / PDF', 'Print / PDF'],
    download_png: ['Last ned PNG', 'Download PNG'],
    download_jpg: ['Last ned JPG', 'Download JPG'],
    download_docx: ['Last ned DOCX', 'Download DOCX'],
    new_project: ['Nytt prosjekt', 'New project'],
    untitled: ['Uten tittel', 'Untitled'],
    favorites: ['Favoritter', 'Favorites'],
    all: ['Alle', 'All'],
    folder: ['Mappe', 'Folder'],
    folders: ['Mapper', 'Folders'],
    new_folder: ['Ny mappe', 'New folder'],
    no_folder: ['Uten mappe', 'No folder'],
    move_to: ['Flytt til', 'Move to'],
    archived: ['Arkivert', 'Archived'],
    name: ['Navn', 'Name'],
    updated: ['Oppdatert', 'Updated'],
    type: ['Type', 'Type'],
    sort_newest: ['Nyeste først', 'Newest first'],
    sort_oldest: ['Eldste først', 'Oldest first'],
    sort_name: ['Navn A til Å', 'Name A to Z'],
    working: ['Genererer…', 'Generating…'],
    ai_note: ['AI-tekst lages av Renate AI. En hel bok tar vanligvis 30 til 90 sekunder. Uten API-nøkkel brukes innebygde maler, så alt fungerer uansett.', 'AI text is written by Renate AI. A full book usually takes 30 to 90 seconds. Without an API key the built-in templates are used, so everything works either way.'],
    confirm_delete: ['Vil du slette dette for godt?', 'Delete this permanently?'],
    project_saved: ['Prosjektet er lagret', 'Project saved'],
    synced: ['Synkronisert til kontoen din', 'Synced to your account'],
    local_only: ['Lagret lokalt i nettleseren', 'Saved locally in this browser'],
  };
  var _lang = null;

  BK.lang = function () {
    if (_lang) return _lang;
    try { _lang = localStorage.getItem('bk_lang') || 'no'; } catch (e) { _lang = 'no'; }
    return _lang;
  };
  BK.setLang = function (l) {
    _lang = l === 'en' ? 'en' : 'no';
    try { localStorage.setItem('bk_lang', _lang); } catch (e) {}
    document.documentElement.lang = _lang;
  };
  BK.t = function (key) {
    var row = DICT[key];
    if (!row) return key;
    return BK.lang() === 'no' ? row[0] : row[1];
  };
  /* L: inline-par {no, en} eller [no, en] */
  BK.L = function (pair) {
    if (pair == null) return '';
    if (Array.isArray(pair)) return BK.lang() === 'no' ? pair[0] : pair[1];
    if (typeof pair === 'object') return BK.lang() === 'no' ? pair.no : pair.en;
    return pair;
  };

  /* ============ TILSTAND OG LAGRING ============ */
  var LS_KEY = 'bk_library_v1';

  var state = {
    projects: [],     // se datamodell i bookly-app.js
    folders: [],      // {id, name}
    exports: [],      // {id, ts, projectId, projectTitle, format, what}
    savedPrompts: [], // {id, ts, title, text, style, kind}
    settings: { pageSize: 'a4', bleed: 3, defaultLang: 'no' },
    deleted: {},        // slettemerker: prosjekt-id -> tidspunkt
    user: null,       // fra /api/auth/me
    plan: 'free',
  };
  BK.state = state;

  var warnedQuota = false;
  var warnedSync = false;

  /* --- IndexedDB: primær lokal lagring (tar hundrevis av MB, så bilder
         aldri må strippes). localStorage beholdes som reserve/migrering. --- */
  var idb = null;
  function idbOpen() {
    return new Promise(function (resolve) {
      if (typeof indexedDB === 'undefined' || !indexedDB) return resolve(null);
      try {
        var req = indexedDB.open('bookly', 1);
        req.onupgradeneeded = function () {
          try { req.result.createObjectStore('kv'); } catch (e) {}
        };
        req.onsuccess = function () { resolve(req.result); };
        req.onerror = function () { resolve(null); };
        req.onblocked = function () { resolve(null); };
      } catch (e) { resolve(null); }
    });
  }
  function idbSet(key, val) {
    return new Promise(function (resolve) {
      if (!idb) return resolve(false);
      try {
        var tx = idb.transaction('kv', 'readwrite');
        tx.objectStore('kv').put(val, key);
        tx.oncomplete = function () { resolve(true); };
        tx.onerror = function () { resolve(false); };
        tx.onabort = function () { resolve(false); };
      } catch (e) { resolve(false); }
    });
  }
  function idbGet(key) {
    return new Promise(function (resolve) {
      if (!idb) return resolve(null);
      try {
        var tx = idb.transaction('kv', 'readonly');
        var rq = tx.objectStore('kv').get(key);
        rq.onsuccess = function () { resolve(rq.result || null); };
        rq.onerror = function () { resolve(null); };
      } catch (e) { resolve(null); }
    });
  }

  function libraryPayload() {
    return {
      projects: state.projects,
      folders: state.folders,
      exports: state.exports.slice(0, 60),
      savedPrompts: state.savedPrompts,
      settings: state.settings,
      deleted: state.deleted,
    };
  }

  function persistLocal() {
    var json = JSON.stringify(libraryPayload());

    if (idb) {
      idbSet('library', json).then(function (ok) {
        if (ok) return;
        persistLocalStorage(json); // reserve hvis IndexedDB feiler
      });
      return;
    }
    persistLocalStorage(json);
  }

  function persistLocalStorage(json) {
    try {
      localStorage.setItem(LS_KEY, json);
      return;
    } catch (e) { /* full: prøv uten bilder under */ }
    try {
      var slim = JSON.parse(json);
      (slim.projects || []).forEach(function (p) {
        (p.pages || []).forEach(function (pg) {
          if (pg.data && pg.data.image) pg.data.image = null;
        });
        if (p.cover && p.cover.image) p.cover.image = null;
        if (p.refs && p.refs.length) p.refs = [];
      });
      localStorage.setItem(LS_KEY, JSON.stringify(slim));
      if (!warnedQuota) {
        warnedQuota = true;
        BK.toast(BK.lang() === 'no'
          ? 'Nettleserens lagring er full: tekstene er trygge, men bildene får ikke plass lokalt. ' + (state.user ? 'Alt med bilder ligger trygt i skyen.' : 'Logg inn, så lagres alt med bilder i skyen.')
          : 'Browser storage is full: your texts are safe, but the images do not fit locally. ' + (state.user ? 'Everything incl. images is safe in the cloud.' : 'Sign in to keep everything incl. images in the cloud.'));
      }
    } catch (e2) {
      if (!warnedQuota) {
        warnedQuota = true;
        BK.toast(BK.lang() === 'no'
          ? 'Lagring feilet: nettleserens lagring er full. Slett gamle prosjekter, eller logg inn for skylagring.'
          : 'Saving failed: browser storage is full. Delete old projects, or sign in for cloud storage.');
      }
    }
  }

  function applyLibrary(raw) {
    try {
      var d = typeof raw === 'string' ? JSON.parse(raw) : raw;
      if (!d) return false;
      state.projects = d.projects || [];
      state.folders = d.folders || [];
      state.exports = d.exports || [];
      state.savedPrompts = d.savedPrompts || [];
      if (d.settings) state.settings = Object.assign(state.settings, d.settings);
      state.deleted = d.deleted || {};
      return true;
    } catch (e) { return false; }
  }

  function loadLocal() {
    // Åpne IndexedDB og les biblioteket derfra; migrer fra localStorage
    // første gang (den kopien kan mangle bilder, skyen fyller på etterpå).
    return idbOpen().then(function (db) {
      idb = db;
      return idbGet('library');
    }).then(function (raw) {
      if (raw && applyLibrary(raw)) return;
      try {
        var ls = localStorage.getItem(LS_KEY);
        if (ls && applyLibrary(ls) && idb) idbSet('library', ls);
      } catch (e) {}
    });
  }

  var syncTimer = null;
  function syncRemote() {
    if (!state.user) return;
    clearTimeout(syncTimer);
    syncTimer = setTimeout(function () {
      fetch('/api/bookly/library', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(libraryPayload()),
      })
        .then(function (r) { return r.json(); })
        .then(function (d) {
          // Si tydelig ifra hvis skylagringen feiler, i stedet for stillhet
          if (d && d.error && !warnedSync) {
            warnedSync = true;
            BK.toast(BK.lang() === 'no'
              ? 'Skylagringen feilet (' + d.error + '). Prosjektene er trygge lokalt, men sjekk innlogging eller si ifra til support.'
              : 'Cloud sync failed (' + d.error + '). Projects are safe locally, but check your sign-in or contact support.');
          }
        })
        .catch(function () {});
    }, 1200);
  }

  BK.save = function (quiet) {
    persistLocal();
    syncRemote();
    if (!quiet) BK.toast(BK.t('project_saved'));
  };

  BK.loadRemote = function () {
    if (!state.user) return Promise.resolve();
    return fetch('/api/bookly/library', { credentials: 'same-origin' })
      .then(function (r) { return r.json(); })
      .then(function (d) {
        if (!d || !d.library) return;
        var lib = d.library;
        /* Hent inn bilder fra den andre kopien der vinneren mangler dem.
           Den lokale kopien kan være lagret uten bilder (full lagring),
           mens skyen alltid har dem. */
        function hydrateImages(winner, loser) {
          if (!winner || !loser) return;
          var src = {};
          (loser.pages || []).forEach(function (pg) { src[pg.id] = pg; });
          (winner.pages || []).forEach(function (pg) {
            var s = src[pg.id];
            if (s && s.data && s.data.image && pg.data && !pg.data.image) pg.data.image = s.data.image;
          });
          if (loser.cover && loser.cover.image && winner.cover && !winner.cover.image) winner.cover.image = loser.cover.image;
          if ((loser.refs || []).length && !(winner.refs || []).length) winner.refs = loser.refs;
        }
        // Nyeste vinner; ved likt tidsstempel vinner skyen (den har bildene).
        var byId = {};
        (state.projects || []).forEach(function (p) { byId[p.id] = p; });
        (lib.projects || []).forEach(function (p) {
          var local = byId[p.id];
          if (!local) { byId[p.id] = p; return; }
          if ((p.updated || 0) >= (local.updated || 0)) {
            hydrateImages(p, local);
            byId[p.id] = p;
          } else {
            hydrateImages(local, p);
          }
        });
        // Slettemerker fra begge sider: nyeste vinner, fjerner eldre prosjekter
        var dead = {};
        Object.keys(state.deleted || {}).forEach(function (k) { dead[k] = state.deleted[k]; });
        Object.keys(lib.deleted || {}).forEach(function (k) {
          if (!dead[k] || lib.deleted[k] > dead[k]) dead[k] = lib.deleted[k];
        });
        Object.keys(dead).forEach(function (id) {
          var pr = byId[id];
          if (pr && dead[id] >= (pr.updated || 0)) delete byId[id];
        });
        state.deleted = dead;
        state.projects = Object.keys(byId).map(function (k) { return byId[k]; });
        var fIds = {};
        (state.folders || []).concat(lib.folders || []).forEach(function (f) { fIds[f.id] = f; });
        state.folders = Object.keys(fIds).map(function (k) { return fIds[k]; });
        if ((lib.exports || []).length > state.exports.length) state.exports = lib.exports;
        if ((lib.savedPrompts || []).length > state.savedPrompts.length) state.savedPrompts = lib.savedPrompts;
        persistLocal();
      })
      .catch(function () {});
  };

  /* --- Prosjekt-API --- */
  BK.newProject = function (type, title, config) {
    var p = {
      id: BK.uid(),
      type: type,
      title: title || BK.t('untitled'),
      lang: (config && config.lang) || BK.lang(),
      folderId: null,
      favorite: false,
      archived: false,
      created: Date.now(),
      updated: Date.now(),
      config: config || {},
      pages: [],
      cover: null,
      publishing: null,
    };
    state.projects.unshift(p);
    BK.save(true);
    return p;
  };
  BK.getProject = function (id) {
    for (var i = 0; i < state.projects.length; i++) if (state.projects[i].id === id) return state.projects[i];
    return null;
  };
  BK.touch = function (p) { p.updated = Date.now(); BK.save(true); };
  BK.deleteProject = function (id) {
    state.projects = state.projects.filter(function (p) { return p.id !== id; });
    state.deleted[id] = Date.now();
    // Hold kartet lite: behold de 300 nyeste merkene
    var keys = Object.keys(state.deleted);
    if (keys.length > 300) {
      keys.sort(function (a, b) { return state.deleted[a] - state.deleted[b]; });
      keys.slice(0, keys.length - 300).forEach(function (k) { delete state.deleted[k]; });
    }
    BK.save(true);
  };
  BK.duplicateProject = function (id) {
    var p = BK.getProject(id);
    if (!p) return null;
    var c = BK.clone(p);
    c.id = BK.uid();
    c.title = p.title + ' (2)';
    c.created = Date.now();
    c.updated = Date.now();
    state.projects.unshift(c);
    BK.save(true);
    return c;
  };
  BK.logExport = function (project, format, what) {
    state.exports.unshift({
      id: BK.uid(), ts: Date.now(),
      projectId: project ? project.id : null,
      projectTitle: project ? project.title : what,
      format: format, what: what,
    });
    state.exports = state.exports.slice(0, 60);
    BK.save(true);
  };

  /* Prosjekttyper */
  BK.TYPES = {
    book:       { icon: '📖', tint: 'tint-pink',  label: ['Bok', 'Book'] },
    workbook:   { icon: '📝', tint: 'tint-blue',  label: ['Arbeidsbok', 'Workbook'] },
    activity:   { icon: '✂️', tint: 'tint-lime',  label: ['Aktivitetsbok', 'Activity book'] },
    puzzle:     { icon: '🧩', tint: 'tint-lemon', label: ['Puslebok', 'Puzzle book'] },
    flashcards: { icon: '🃏', tint: 'tint-blue',  label: ['Flashkort', 'Flashcards'] },
    coloring:   { icon: '🎨', tint: 'tint-pink',  label: ['Fargeleggingsbok', 'Coloring book'] },
    journal:    { icon: '📔', tint: 'tint-lime',  label: ['Journal', 'Journal'] },
    planner:    { icon: '🗓️', tint: 'tint-lemon', label: ['Planlegger', 'Planner'] },
  };

  /* ============ AI-KLIENT ============ */
  BK.ai = {
    available: null, // ukjent før første kall

    /* Lavnivå: send prompt, få ren tekst tilbake. */
    complete: function (system, prompt, maxTokens) {
      return fetch('/api/bookly/ai', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ system: system, prompt: prompt, max_tokens: maxTokens || 3000 }),
      })
        .then(function (r) { return r.json(); })
        .then(function (d) {
          if (d && typeof d.text === 'string' && d.text) {
            BK.ai.available = true;
            return d.text;
          }
          BK.ai.available = false;
          throw new Error((d && d.error) || 'ai_unavailable');
        });
    },

    /* JSON-oppgave: be om JSON, parse robust, ellers kast. */
    json: function (system, prompt, maxTokens) {
      return BK.ai.complete(system, prompt, maxTokens).then(function (text) {
        var m = text.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
        if (!m) throw new Error('no_json');
        return JSON.parse(m[0]);
      });
    },

    /* Bildegenerering: prompt -> nedskalert JPEG-data-URL.
       Kaster 'image_unavailable' hvis ingen bildenøkkel er satt opp. */
    image: function (prompt, size, refs) {
      return fetch('/api/bookly/image', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: prompt, size: size || '1024x1024', refs: refs || [] }),
      })
        .then(function (r) { return r.json(); })
        .then(function (d) {
          if (d && d.b64) return BK.shrinkImage('data:image/png;base64,' + d.b64, 1400);
          var err = new Error((d && d.error) || 'image_failed');
          err.detail = (d && d.detail) || '';
          throw err;
        });
    },
    /* Mia & Teo-karakterprompt: hentes fra serveren, kun for eier. */
    charPrompt: function () {
      if (BK._charPrompt) return Promise.resolve(BK._charPrompt);
      return fetch('/api/bookly/charprompt', { credentials: 'same-origin' })
        .then(function (r) { return r.json(); })
        .then(function (d) {
          if (d && d.prompt) { BK._charPrompt = d.prompt; return d.prompt; }
          throw new Error('forbidden');
        });
    },
  };

  /* ============ RUTER ============ */
  var routes = {};
  BK.route = function (path, fn) { routes[path] = fn; };
  BK.go = function (path) { location.hash = '#' + path; };
  BK.currentPath = function () { return (location.hash || '#/dashboard').slice(1); };

  function dispatch() {
    var path = BK.currentPath();
    var parts = path.split('/').filter(Boolean); // f.eks. ['create','book'] eller ['project','bk123']
    var key = '/' + (parts[0] || 'dashboard');
    var fn = routes[key] || routes['/dashboard'];
    var root = BK.$('#bkView');
    if (!root) return;
    window.scrollTo(0, 0);
    BK.$('#bkSidebar').classList.remove('open');
    // Marker aktivt menypunkt
    BK.$$('.bk-nav-item').forEach(function (a) {
      var href = a.getAttribute('href') || '';
      a.classList.toggle('active', href === '#' + key || href === '#' + path);
    });
    fn(root, parts.slice(1));
  }
  BK.refresh = dispatch;

  window.addEventListener('hashchange', dispatch);

  /* ============ MODAL ============ */
  BK.modal = function (innerHtml, onMount) {
    var back = document.createElement('div');
    back.className = 'bk-modal-back';
    back.innerHTML = '<div class="bk-modal" role="dialog" aria-modal="true">' + innerHtml + '</div>';
    back.addEventListener('click', function (e) { if (e.target === back) close(); });
    document.body.appendChild(back);
    function close() { if (back.parentNode) back.parentNode.removeChild(back); }
    if (onMount) onMount(back, close);
    return close;
  };

  /* ============ OPPSTART ============ */
  BK.boot = function () {
    BK.setLang(BK.lang());
    loadLocal().then(function () {
      // Hent bruker (deler auth med resten av LME-plattformen)
      var me = window.LME && window.LME.me ? window.LME.me() : Promise.resolve({ user: null });
      return me;
    }).then(function (d) {
      if (d && d.user) {
        state.user = d.user;
        var sub = d.subscription;
        state.plan = (sub && (sub.plan || sub.tier)) || (d.user.role === 'owner' ? 'commercial' : 'free');
        BK.loadRemote().then(function () { BK.refresh(); });
      }
      BK.renderChrome();
      dispatch();
    }).catch(function () {
      BK.renderChrome();
      dispatch();
    });
  };
})();
