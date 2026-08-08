/* Pakker om en flat .crs-module/.crs-lesson-rekke (de håndbygde
   "løse" kurssidene i academy/, uten Kursbygger) til samme
   trykk-inn-i-modul-opplevelse som de dynamiske kursene på /kurs/<navn>
   har: modul-kortgrid, klikk et kort for å åpne akkurat den modulen
   (ingen sidesprang), leksjonene i modulen som en klikkbar liste med
   hake ved fullført, klikk en leksjon for å åpne kun den, med en
   "Tilbake"-knapp. Fremdrift lagres i nettleseren (localStorage), per
   side-adresse.

   Krever: siden pakker sin eksisterende .crs-module/.crs-lesson-rekke i
   <div class="crs-flatlessons">…</div>, og laster denne fila +
   css/course-modules.css. Rører ikke annet innhold på siden. */
(function () {
  function courseKey() {
    var m = location.pathname.match(/\/([a-z0-9\-]+)\.html?$/i);
    return 'static:' + ((m && m[1]) || location.pathname);
  }
  function loadProgress(key) {
    try {
      var raw = localStorage.getItem('lesson_progress:' + key);
      var arr = raw ? JSON.parse(raw) : [];
      return new Set(Array.isArray(arr) ? arr : []);
    } catch (e) { return new Set(); }
  }
  function saveProgress(key, set) {
    try { localStorage.setItem('lesson_progress:' + key, JSON.stringify(Array.from(set))); } catch (e) {}
  }
  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }
  var en = false; // disse sidene har foreløpig ikke språkbytte på kursteksten

  function init() {
    var wrap = document.querySelector('.crs-flatlessons');
    if (!wrap) return;

    var kids = Array.prototype.slice.call(wrap.children);
    var groups = [];
    kids.forEach(function (node) {
      if (node.classList && node.classList.contains('crs-module')) {
        groups.push({ title: node.textContent, lessons: [] });
      } else if (node.classList && node.classList.contains('crs-lesson') && groups.length) {
        groups[groups.length - 1].lessons.push(node);
      }
    });
    if (!groups.length) return;

    var totalLessons = groups.reduce(function (n, g) { return n + g.lessons.length; }, 0);
    var key = courseKey();
    var progress = loadProgress(key);

    var groupStarts = [];
    (function () {
      var running = 0;
      groups.forEach(function (g) { groupStarts.push(running); running += g.lessons.length; });
    })();

    var root = el('div', 'crs-modules-enh');

    var sum = el('div', 'crs-progress-summary');
    var overallTxt = el('span', 'txt', '');
    var track = el('div', 'crs-progress-track');
    var overallFill = el('div', 'crs-progress-fill');
    track.appendChild(overallFill);
    sum.appendChild(overallTxt);
    sum.appendChild(track);
    root.appendChild(sum);

    function countDone(start, count) {
      var n = 0;
      for (var k = start; k < start + count; k++) if (progress.has(k)) n++;
      return n;
    }
    var cardRefs = [];
    function refreshProgressUI() {
      var doneTotal = 0;
      for (var k = 0; k < totalLessons; k++) if (progress.has(k)) doneTotal++;
      var pct = totalLessons ? Math.round((doneTotal / totalLessons) * 100) : 0;
      overallTxt.textContent = (en ? 'Progress: ' : 'Fremdrift: ') + doneTotal + '/' + totalLessons + ' (' + pct + '%)';
      overallFill.style.width = pct + '%';
      cardRefs.forEach(function (c) {
        var d = countDone(c.start, c.count);
        var p = c.count ? Math.round((d / c.count) * 100) : 0;
        c.fillEl.style.width = p + '%';
        c.pctEl.textContent = d + '/' + c.count;
      });
    }

    function wireDone(lessonEl, globalIdx, onToggle) {
      if (lessonEl.querySelector('.crs-lesson-done-btn')) return; // allerede lagt til
      var doneRow = el('div', 'crs-lesson-done-row');
      var doneBtn = document.createElement('button');
      doneBtn.type = 'button';
      doneBtn.className = 'crs-lesson-done-btn';
      function paint() {
        var isDone = progress.has(globalIdx);
        doneBtn.classList.toggle('done', isDone);
        doneBtn.textContent = isDone ? (en ? '✓ Completed' : '✓ Fullført') : (en ? '☐ Mark as done' : '☐ Merk som fullført');
      }
      doneBtn.onclick = function () {
        if (progress.has(globalIdx)) progress.delete(globalIdx); else progress.add(globalIdx);
        saveProgress(key, progress);
        paint();
        refreshProgressUI();
        if (onToggle) onToggle();
      };
      paint();
      doneRow.appendChild(doneBtn);
      lessonEl.appendChild(doneRow);
    }

    var grid = el('div', 'crs-cardgrid');
    var contentArea = el('div', 'crs-module-content');
    contentArea.hidden = true;

    function showGrid() {
      grid.hidden = false;
      contentArea.hidden = true;
      contentArea.innerHTML = '';
    }

    function renderGroupInto(container, group, gi) {
      var row = el('div', 'crs-module-row');
      row.appendChild(el('div', 'crs-module', group.title));
      container.appendChild(row);

      var listWrap = el('div', 'crs-lesson-list');
      var detailWrap = el('div', 'crs-lesson-detail');
      detailWrap.hidden = true;
      container.appendChild(listWrap);
      container.appendChild(detailWrap);

      function showList() {
        listWrap.hidden = false;
        detailWrap.hidden = true;
        detailWrap.innerHTML = '';
      }
      function showLesson(lessonEl, globalIdx, check) {
        detailWrap.innerHTML = '';
        var back = el('button', 'crs-back-to-modules', en ? '← Lessons' : '← Leksjonene');
        back.type = 'button';
        back.onclick = showList;
        detailWrap.appendChild(back);
        wireDone(lessonEl, globalIdx, function () { check.textContent = progress.has(globalIdx) ? '✓' : ''; });
        detailWrap.appendChild(lessonEl);
        listWrap.hidden = true;
        detailWrap.hidden = false;
      }

      group.lessons.forEach(function (lessonEl, j) {
        var globalIdx = groupStarts[gi] + j;
        var h = lessonEl.querySelector('h3');
        var titleTxt = h ? h.textContent : '';
        var rowBtn = document.createElement('button');
        rowBtn.type = 'button';
        rowBtn.className = 'crs-lesson-row';
        rowBtn.appendChild(el('span', 'crs-lesson-row-num', (en ? 'Lesson ' : 'Leksjon ') + (globalIdx + 1)));
        rowBtn.appendChild(el('span', 'crs-lesson-row-title', titleTxt));
        var check = el('span', 'crs-lesson-row-check', progress.has(globalIdx) ? '✓' : '');
        rowBtn.appendChild(check);
        rowBtn.onclick = function () { showLesson(lessonEl, globalIdx, check); };
        listWrap.appendChild(rowBtn);
      });
    }

    function showGroup(gi) {
      contentArea.innerHTML = '';
      var back = el('button', 'crs-back-to-modules', en ? '← All modules' : '← Alle moduler');
      back.type = 'button';
      back.onclick = showGrid;
      contentArea.appendChild(back);
      renderGroupInto(contentArea, groups[gi], gi);
      grid.hidden = true;
      contentArea.hidden = false;
    }

    var palette = ['#F5A8B8,#E91E89', '#A4D233,#7AAE1F', '#F7C72E,#e0a800', '#3FA9F5,#1f7fc4', '#EE9CAD,#E91E89'];
    groups.forEach(function (group, gi) {
      var card = document.createElement('button');
      card.type = 'button';
      card.className = 'crs-mcard';
      var thumb = el('div', 'crs-mcard-thumb');
      thumb.style.background = 'linear-gradient(135deg,' + palette[gi % palette.length] + ')';
      var logoWrap = el('div', 'crs-mcard-logo');
      var logoImg = document.createElement('img');
      logoImg.src = '/images/lme-logo.png'; logoImg.alt = '';
      logoWrap.appendChild(logoImg);
      thumb.appendChild(logoWrap);
      card.appendChild(thumb);
      var body = el('div', 'crs-mcard-body');
      body.appendChild(el('div', 'crs-mcard-tag', (en ? 'Module ' : 'Modul ') + (gi + 1) + ' av ' + groups.length));
      body.appendChild(el('div', 'crs-mcard-title', group.title.replace(/^Modul\s+\d+\s*[·:.-]\s*/i, '')));
      var ptrack = el('div', 'crs-mcard-track');
      var pfill = el('div', 'crs-mcard-fill');
      ptrack.appendChild(pfill);
      body.appendChild(ptrack);
      var ppct = el('div', 'crs-mcard-pct', '');
      body.appendChild(ppct);
      card.appendChild(body);
      card.onclick = function () { showGroup(gi); };
      grid.appendChild(card);
      cardRefs.push({ start: groupStarts[gi], count: group.lessons.length, fillEl: pfill, pctEl: ppct });
    });

    root.appendChild(grid);
    root.appendChild(contentArea);
    wrap.innerHTML = '';
    wrap.appendChild(root);
    refreshProgressUI();
    showGrid();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
