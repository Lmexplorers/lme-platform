/* =====================================================================
   LME Bookly™ — Flytt og tilpass (Canva-aktig sideredigering)

   Skru paa modusen i prosjekt-editoren, saa kan du:
   - trykke paa tekst eller bilde for aa velge det
   - dra elementer dit du vil paa siden
   - dra i selve bildet for aa velge hvilken del som vises i rammen
   - zoome bildet og endre rammebredden med glidebrytere
   - veksle mellom "fyll rammen" og "vis hele bildet"

   Alt lagres i page.data.layout og brukes av de vanlige sidemalene,
   saa PDF-, PNG- og JPG-eksport blir identisk med det du ser.
   ===================================================================== */
(function () {
  'use strict';
  var BK = window.BK;
  var ed = (BK.layoutEd = {});
  ed.enabled = true; // paa som standard: dra bilder og tekst rett paa siden

  var ctx = null;   // { project, pageIdx, stage, rerender, sheet, bar }
  var sel = null;   // valgt element (DOM)
  var tool = 'pan'; // for bilderammer: 'pan' = flytt bildet, 'move' = flytt rammen

  function no() { return BK.lang() === 'no'; }
  function clamp(v, lo, hi) { return Math.min(hi, Math.max(lo, v)); }

  function pageData() {
    var pg = ctx.project.pages[ctx.pageIdx];
    pg.data = pg.data || {};
    pg.data.layout = pg.data.layout || {};
    return pg.data;
  }
  function lay(key) {
    var d = pageData();
    return (d.layout[key] = d.layout[key] || {});
  }
  function scaleOf(sheet) {
    var r = sheet.getBoundingClientRect();
    return sheet.offsetWidth ? r.width / sheet.offsetWidth : 1;
  }

  /* ---------- montering ---------- */
  ed.mount = function (stage, project, pageIdx, rerender) {
    var host = stage.parentNode || stage;
    var old = host.querySelector('.bk-lay-bar');
    if (old) old.remove();
    sel = null;
    if (!ed.enabled) { ctx = null; return; }

    var sheet = stage.querySelector('.bk-sheet');
    if (!sheet) return;
    ctx = { project: project, pageIdx: pageIdx, stage: stage, rerender: rerender, sheet: sheet };

    var bar = document.createElement('div');
    bar.className = 'bk-lay-bar bk-no-print';
    host.insertBefore(bar, stage);
    ctx.bar = bar;

    var els = sheet.querySelectorAll('[data-el]');
    els.forEach(function (el) {
      el.classList.add('bk-lay-el');
      el.addEventListener('pointerdown', onDown);
    });
    sheet.addEventListener('pointerdown', function (e) {
      if (!e.target.closest('[data-el]')) select(null);
    });
    renderBar();
  };

  function select(el) {
    if (sel) sel.classList.remove('sel');
    var oldHandle = ctx && ctx.sheet.querySelector('.bk-lay-handle');
    if (oldHandle) oldHandle.remove();
    sel = el;
    if (sel) {
      sel.classList.add('sel');
      if (sel.hasAttribute('data-img-frame')) addResizeHandle(sel);
    }
    renderBar();
  }

  /* Hjoernehaandtak: dra for aa endre bildestoerrelsen, som i Canva. */
  function addResizeHandle(frame) {
    var h = document.createElement('div');
    h.className = 'bk-lay-handle';
    h.title = 'Dra for å endre størrelse';
    frame.appendChild(h);
    h.addEventListener('pointerdown', function (e) {
      e.preventDefault();
      e.stopPropagation();
      var key = frame.getAttribute('data-el');
      var l = lay(key);
      var s = scaleOf(ctx.sheet);
      var startX = e.clientX;
      var parentW = frame.parentElement.offsetWidth || 1;
      var startW = frame.offsetWidth;
      function move(ev) {
        var dw = (ev.clientX - startX) / s;
        l.w = Math.round(clamp(((startW + dw) / parentW) * 100, 20, 100));
        frame.style.width = l.w + '%';
        var slider = ctx.bar && ctx.bar.querySelector('[data-act="width"]');
        if (slider) slider.value = l.w;
      }
      function up() {
        window.removeEventListener('pointermove', move);
        window.removeEventListener('pointerup', up);
        BK.save(true);
      }
      window.addEventListener('pointermove', move);
      window.addEventListener('pointerup', up);
    });
  }

  /* ---------- dra: flytt element eller panorer bilde ---------- */
  function onDown(e) {
    var el = e.currentTarget;
    if (sel !== el) select(el);
    e.preventDefault();
    e.stopPropagation();

    var isImg = el.hasAttribute('data-img-frame');
    var mode = isImg && tool === 'pan' ? 'pan' : 'move';
    var key = el.getAttribute('data-el');
    var l = lay(key);
    var s = scaleOf(ctx.sheet);
    var startX = e.clientX, startY = e.clientY;
    var frameR = el.getBoundingClientRect();
    var sheetW = ctx.sheet.offsetWidth, sheetH = ctx.sheet.offsetHeight;
    var start = mode === 'pan'
      ? { x: l.px != null ? l.px : 50, y: l.py != null ? l.py : 50 }
      : { x: l.dx || 0, y: l.dy || 0 };
    var moved = false;

    function move(ev) {
      var dx = (ev.clientX - startX) / s;
      var dy = (ev.clientY - startY) / s;
      if (Math.abs(dx) + Math.abs(dy) > 1) moved = true;
      if (mode === 'pan') {
        var fw = frameR.width / s || 1, fh = frameR.height / s || 1;
        l.px = Math.round(clamp(start.x - (dx / fw) * 100, 0, 100));
        l.py = Math.round(clamp(start.y - (dy / fh) * 100, 0, 100));
        applyImg(el, l);
      } else {
        l.dx = Math.round(clamp(start.x + (dx / sheetW) * 100, -100, 100) * 10) / 10;
        l.dy = Math.round(clamp(start.y + (dy / sheetH) * 100, -100, 100) * 10) / 10;
        el.style.position = 'relative';
        el.style.left = l.dx + '%';
        el.style.top = l.dy + '%';
      }
    }
    function up() {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      if (moved) BK.save(true);
    }
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  }

  /* Setter bildestilene live, likt det sidemalen (gen.imgFrame) lager. */
  function applyImg(el, l) {
    var img = el.querySelector('img');
    if (!img) return;
    var px = l.px != null ? l.px : 50;
    var py = l.py != null ? l.py : 50;
    var zoom = l.zoom || 100;
    img.style.objectPosition = px + '% ' + py + '%';
    if (zoom !== 100) {
      img.style.transform = 'scale(' + zoom / 100 + ')';
      img.style.transformOrigin = px + '% ' + py + '%';
    } else {
      img.style.transform = '';
    }
    if (l.mode) img.style.objectFit = l.mode;
    if (l.w) el.style.width = l.w + '%';
  }

  /* ---------- verktoylinje ---------- */
  function elName(key) {
    var names = {
      img: ['Bilde', 'Image'], title: ['Tittel', 'Title'], subtitle: ['Undertittel', 'Subtitle'],
      kicker: ['Liten overskrift', 'Kicker'], author: ['Forfatter', 'Author'],
      text: ['Tekst', 'Text'], hook: ['Hook', 'Hook'], bio: ['Bio', 'Bio'],
    };
    var nm = names[key];
    return nm ? (no() ? nm[0] : nm[1]) : key;
  }

  function renderBar() {
    if (!ctx || !ctx.bar) return;
    var bar = ctx.bar;
    var hasEls = ctx.sheet.querySelector('[data-el]');
    if (!hasEls) {
      bar.innerHTML = '<span class="hint">' + (no()
        ? 'Denne sidetypen har ingen flyttbare elementer ennå.'
        : 'This page type has no movable elements yet.') + '</span>';
      return;
    }
    var h = '';
    if (!sel) {
      h += '<span class="hint">🎯 ' + (no()
        ? 'Trykk på tekst eller bilde for å velge. Dra for å flytte.'
        : 'Tap text or an image to select it. Drag to move.') + '</span>';
    } else {
      var key = sel.getAttribute('data-el');
      var l = lay(key);
      h += '<span class="bk-lay-name">' + elName(key) + '</span>';
      if (sel.hasAttribute('data-img-frame')) {
        h += '<span class="bk-lay-group">' +
          '<button type="button" class="bk-lay-tool' + (tool === 'pan' ? ' on' : '') + '" data-act="tool-pan">🖐 ' + (no() ? 'Flytt bildet' : 'Move image') + '</button>' +
          '<button type="button" class="bk-lay-tool' + (tool === 'move' ? ' on' : '') + '" data-act="tool-move">✥ ' + (no() ? 'Flytt rammen' : 'Move frame') + '</button>' +
          '</span>';
        h += '<label>🔍 Zoom <input type="range" min="100" max="300" step="5" value="' + (l.zoom || 100) + '" data-act="zoom"></label>';
        h += '<label>↔️ ' + (no() ? 'Bredde' : 'Width') + ' <input type="range" min="20" max="100" step="1" value="' + (l.w || 100) + '" data-act="width"></label>';
        var contain = (l.mode || 'cover') === 'contain';
        h += '<button type="button" class="bk-lay-tool" data-act="fit">' + (contain
          ? '⬜ ' + (no() ? 'Fyll rammen' : 'Fill frame')
          : '🖼 ' + (no() ? 'Vis hele bildet' : 'Show whole image')) + '</button>';
      }
      h += '<button type="button" class="bk-lay-tool" data-act="reset-el">↩︎ ' + (no() ? 'Nullstill' : 'Reset') + '</button>';
    }
    h += '<button type="button" class="bk-lay-tool danger" data-act="reset-page" style="margin-left:auto">🧹 ' + (no() ? 'Nullstill siden' : 'Reset page') + '</button>';
    bar.innerHTML = h;

    bar.querySelectorAll('[data-act]').forEach(function (b) {
      var act = b.getAttribute('data-act');
      if (act === 'zoom' || act === 'width') {
        b.addEventListener('input', function () {
          if (!sel) return;
          var l2 = lay(sel.getAttribute('data-el'));
          if (act === 'zoom') l2.zoom = parseInt(this.value, 10);
          else l2.w = parseInt(this.value, 10);
          applyImg(sel, l2);
        });
        b.addEventListener('change', function () { BK.save(true); });
        return;
      }
      b.onclick = function () {
        if (act === 'tool-pan') { tool = 'pan'; renderBar(); }
        else if (act === 'tool-move') { tool = 'move'; renderBar(); }
        else if (act === 'fit' && sel) {
          var l3 = lay(sel.getAttribute('data-el'));
          l3.mode = (l3.mode || 'cover') === 'contain' ? 'cover' : 'contain';
          applyImg(sel, l3);
          BK.save(true);
          renderBar();
        } else if (act === 'reset-el' && sel) {
          delete pageData().layout[sel.getAttribute('data-el')];
          BK.save(true);
          ctx.rerender();
        } else if (act === 'reset-page') {
          delete ctx.project.pages[ctx.pageIdx].data.layout;
          BK.save(true);
          ctx.rerender();
        }
      };
    });
  }
})();
