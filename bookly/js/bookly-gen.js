/* =====================================================================
   LME Bookly™ — innholdsmotor
   Ekte generatorer (ordleting, sudoku, labyrint, kryssord, mandala,
   kalender, regneoppgaver) + siderenderere for alle sidetyper.
   Alt fungerer uten AI; AI forbedrer tekstene når nøkkel finnes.
   ===================================================================== */
(function () {
  'use strict';
  var BK = window.BK;
  var gen = (BK.gen = {});
  var esc = BK.esc, L = BK.L;

  /* ============ SIDESTØRRELSER (mm) ============ */
  BK.SIZES = {
    a4:       { w: 210,   h: 297,   label: ['A4 (21 x 29,7 cm)', 'A4 (21 x 29.7 cm)'] },
    a5:       { w: 148,   h: 210,   label: ['A5 (14,8 x 21 cm)', 'A5 (14.8 x 21 cm)'] },
    letter:   { w: 215.9, h: 279.4, label: ['US Letter / 8,5 x 11"', 'US Letter / 8.5 x 11"'] },
    '6x9':    { w: 152.4, h: 228.6, label: ['6 x 9" (15,2 x 22,9 cm)', '6 x 9" (15.2 x 22.9 cm)'] },
    square8:  { w: 203.2, h: 203.2, label: ['Kvadrat 8 x 8"', 'Square 8 x 8"'] },
    square85: { w: 215.9, h: 215.9, label: ['Kvadrat 8,5 x 8,5"', 'Square 8.5 x 8.5"'] },
  };
  BK.sizeOf = function (project) {
    var s = (project && project.config && project.config.size) || BK.state.settings.pageSize || 'a4';
    return BK.SIZES[s] || BK.SIZES.a4;
  };

  /* ============ SEEDET TILFELDIGHET ============ */
  function mulberry32(seed) {
    var a = seed >>> 0;
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  gen.seed = function () { return Math.floor(Math.random() * 2147483647); };

  /* ============ ORDBANKER ============ */
  var WORDBANK = {
    dyr:      { no: ['KATT', 'HUND', 'HEST', 'SAU', 'KU', 'GRIS', 'REV', 'ELG', 'BJØRN', 'UGLE', 'MUS', 'HARE'], en: ['CAT', 'DOG', 'HORSE', 'SHEEP', 'COW', 'PIG', 'FOX', 'MOOSE', 'BEAR', 'OWL', 'MOUSE', 'HARE'] },
    natur:    { no: ['TRE', 'BLAD', 'STEIN', 'BEKK', 'FJELL', 'SKOG', 'BLOMST', 'SOL', 'REGN', 'SKY', 'MOSE', 'FRØ'], en: ['TREE', 'LEAF', 'STONE', 'CREEK', 'HILL', 'FOREST', 'FLOWER', 'SUN', 'RAIN', 'CLOUD', 'MOSS', 'SEED'] },
    mat:      { no: ['EPLE', 'BRØD', 'OST', 'MELK', 'FISK', 'RIS', 'SUPPE', 'BÆR', 'EGG', 'HONNING'], en: ['APPLE', 'BREAD', 'CHEESE', 'MILK', 'FISH', 'RICE', 'SOUP', 'BERRY', 'EGG', 'HONEY'] },
    kropp:    { no: ['HODE', 'ARM', 'FOT', 'HÅND', 'ØYE', 'ØRE', 'NESE', 'MUNN', 'KNE', 'HJERTE'], en: ['HEAD', 'ARM', 'FOOT', 'HAND', 'EYE', 'EAR', 'NOSE', 'MOUTH', 'KNEE', 'HEART'] },
    familie:  { no: ['MAMMA', 'PAPPA', 'SØSTER', 'BROR', 'MORMOR', 'FARFAR', 'TANTE', 'ONKEL', 'BABY', 'VENN'], en: ['MOM', 'DAD', 'SISTER', 'BROTHER', 'GRANDMA', 'GRANDPA', 'AUNT', 'UNCLE', 'BABY', 'FRIEND'] },
    skole:    { no: ['BOK', 'PENN', 'TAVLE', 'PULT', 'SAKS', 'LIM', 'PAPIR', 'FARGE', 'TALL', 'ORD'], en: ['BOOK', 'PEN', 'BOARD', 'DESK', 'SCISSORS', 'GLUE', 'PAPER', 'COLOR', 'NUMBER', 'WORD'] },
  };
  gen.wordbank = function (key) {
    var b = WORDBANK[key] || WORDBANK.natur;
    return (BK.lang() === 'no' ? b.no : b.en).slice();
  };
  gen.WORDBANK_KEYS = Object.keys(WORDBANK);

  var EMOJI = {
    dyr:    ['🐱', '🐶', '🐴', '🐑', '🐮', '🐷', '🦊', '🦌', '🐻', '🦉', '🐭', '🐰'],
    natur:  ['🌳', '🍃', '🪨', '🌊', '⛰️', '🌲', '🌸', '☀️', '🌧️', '☁️', '🍄', '🌱'],
    mat:    ['🍎', '🍞', '🧀', '🥛', '🐟', '🍚', '🥣', '🫐', '🥚', '🍯', '🥕', '🍐'],
    kjoretoy: ['🚗', '🚌', '🚜', '🚒', '🚓', '🚲', '✈️', '⛵', '🚂', '🚁', '🛴', '🚚'],
    fantasi: ['🦄', '🐉', '🧚', '🏰', '⭐', '🌈', '🪄', '👑', '🧜', '🔮', '🗝️', '🦋'],
    arstider: ['🍂', '❄️', '🌷', '☀️', '🍁', '⛄', '🌻', '🏖️', '🌧️', '🧣', '🪁', '🍓'],
  };
  gen.emojiSet = function (key) { return (EMOJI[key] || EMOJI.natur).slice(); };
  gen.EMOJI_KEYS = Object.keys(EMOJI);

  /* =====================================================================
     ALGORITMISKE GENERATORER
     ===================================================================== */

  /* --- Ordleting --- */
  gen.wordsearch = function (words, size, diagonal, reverse, seed) {
    var rnd = mulberry32(seed || gen.seed());
    var N = size || 12;
    var grid = [];
    for (var r = 0; r < N; r++) { grid.push(new Array(N).fill('')); }
    var dirs = [[0, 1], [1, 0]];
    if (diagonal) dirs.push([1, 1], [1, -1]);
    var placed = [];
    words = words.map(function (w) { return w.toUpperCase().replace(/[^A-ZÆØÅ]/g, ''); })
      .filter(function (w) { return w.length >= 2 && w.length <= N; });
    words.sort(function (a, b) { return b.length - a.length; });

    words.forEach(function (word) {
      for (var attempt = 0; attempt < 260; attempt++) {
        var d = dirs[Math.floor(rnd() * dirs.length)];
        var rev = reverse && rnd() < 0.35;
        var w = rev ? word.split('').reverse().join('') : word;
        var maxR = N - (d[0] > 0 ? w.length : 1);
        var maxC = d[1] > 0 ? N - w.length : (d[1] < 0 ? N - 1 : N - 1);
        var minC = d[1] < 0 ? w.length - 1 : 0;
        var row = Math.floor(rnd() * (maxR + 1));
        var col = minC + Math.floor(rnd() * (maxC - minC + 1));
        var ok = true;
        for (var i = 0; i < w.length; i++) {
          var ch = grid[row + d[0] * i][col + d[1] * i];
          if (ch && ch !== w[i]) { ok = false; break; }
        }
        if (!ok) continue;
        for (var j = 0; j < w.length; j++) grid[row + d[0] * j][col + d[1] * j] = w[j];
        placed.push(word);
        return;
      }
    });

    var alphabet = BK.lang() === 'no' ? 'ABDEFGHIJKLMNOPRSTUVÅ' : 'ABCDEFGHIJKLMNOPRSTUW';
    for (var rr = 0; rr < N; rr++) for (var cc = 0; cc < N; cc++) {
      if (!grid[rr][cc]) grid[rr][cc] = alphabet[Math.floor(rnd() * alphabet.length)];
    }
    return { grid: grid, words: placed };
  };

  /* --- Sudoku (med unik løsning) --- */
  function sudokuSolve(board, countOnly, limit) {
    var count = 0;
    function valid(b, r, c, v) {
      for (var i = 0; i < 9; i++) {
        if (b[r][i] === v || b[i][c] === v) return false;
        var br = 3 * Math.floor(r / 3) + Math.floor(i / 3);
        var bc = 3 * Math.floor(c / 3) + (i % 3);
        if (b[br][bc] === v) return false;
      }
      return true;
    }
    function go(b) {
      for (var r = 0; r < 9; r++) for (var c = 0; c < 9; c++) {
        if (b[r][c] === 0) {
          for (var v = 1; v <= 9; v++) {
            if (valid(b, r, c, v)) {
              b[r][c] = v;
              if (go(b)) { if (!countOnly) return true; }
              b[r][c] = 0;
              if (countOnly && count >= limit) return true;
            }
          }
          return false;
        }
      }
      if (countOnly) { count++; return count >= limit; }
      return true;
    }
    go(board);
    return countOnly ? count : board;
  }

  gen.sudoku = function (difficulty, seed) {
    var rnd = mulberry32(seed || gen.seed());
    // Full løsning via tilfeldig backtracking
    var board = [];
    for (var i = 0; i < 9; i++) board.push(new Array(9).fill(0));
    (function fill() {
      function valid(r, c, v) {
        for (var k = 0; k < 9; k++) {
          if (board[r][k] === v || board[k][c] === v) return false;
          var br = 3 * Math.floor(r / 3) + Math.floor(k / 3);
          var bc = 3 * Math.floor(c / 3) + (k % 3);
          if (board[br][bc] === v) return false;
        }
        return true;
      }
      function go(pos) {
        if (pos === 81) return true;
        var r = Math.floor(pos / 9), c = pos % 9;
        var vals = [1, 2, 3, 4, 5, 6, 7, 8, 9].sort(function () { return rnd() - 0.5; });
        for (var i2 = 0; i2 < 9; i2++) {
          if (valid(r, c, vals[i2])) {
            board[r][c] = vals[i2];
            if (go(pos + 1)) return true;
            board[r][c] = 0;
          }
        }
        return false;
      }
      go(0);
    })();
    var solution = board.map(function (row) { return row.slice(); });
    var removeTarget = difficulty === 'easy' ? 38 : difficulty === 'hard' ? 54 : 46;
    var cells = [];
    for (var p = 0; p < 81; p++) cells.push(p);
    cells.sort(function () { return rnd() - 0.5; });
    var removed = 0;
    for (var ci = 0; ci < cells.length && removed < removeTarget; ci++) {
      var r2 = Math.floor(cells[ci] / 9), c2 = cells[ci] % 9;
      var keep = board[r2][c2];
      board[r2][c2] = 0;
      var test = board.map(function (row) { return row.slice(); });
      if (sudokuSolve(test, true, 2) !== 1) board[r2][c2] = keep;
      else removed++;
    }
    return { puzzle: board, solution: solution };
  };

  /* Mini-sudoku 4x4 for de yngste */
  gen.sudoku4 = function (seed) {
    var rnd = mulberry32(seed || gen.seed());
    var base = [[1, 2, 3, 4], [3, 4, 1, 2], [2, 1, 4, 3], [4, 3, 2, 1]];
    var perm = [1, 2, 3, 4].sort(function () { return rnd() - 0.5; });
    var sol = base.map(function (row) { return row.map(function (v) { return perm[v - 1]; }); });
    var puz = sol.map(function (row) { return row.slice(); });
    var hide = 8 + Math.floor(rnd() * 2);
    var cells = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].sort(function () { return rnd() - 0.5; });
    for (var i = 0; i < hide; i++) puz[Math.floor(cells[i] / 4)][cells[i] % 4] = 0;
    return { puzzle: puz, solution: sol };
  };

  /* --- Labyrint (SVG) --- */
  gen.mazeSvg = function (cols, rows, seed, sizeMM) {
    var rnd = mulberry32(seed || gen.seed());
    var W = cols, H = rows;
    var walls = []; // hver celle: [top, right, bottom, left]
    var visited = [];
    for (var i = 0; i < W * H; i++) { walls.push([1, 1, 1, 1]); visited.push(false); }
    var stack = [0];
    visited[0] = true;
    while (stack.length) {
      var cur = stack[stack.length - 1];
      var cx = cur % W, cy = Math.floor(cur / W);
      var nbrs = [];
      if (cy > 0 && !visited[cur - W]) nbrs.push([cur - W, 0, 2]);
      if (cx < W - 1 && !visited[cur + 1]) nbrs.push([cur + 1, 1, 3]);
      if (cy < H - 1 && !visited[cur + W]) nbrs.push([cur + W, 2, 0]);
      if (cx > 0 && !visited[cur - 1]) nbrs.push([cur - 1, 3, 1]);
      if (!nbrs.length) { stack.pop(); continue; }
      var pickN = nbrs[Math.floor(rnd() * nbrs.length)];
      walls[cur][pickN[1]] = 0;
      walls[pickN[0]][pickN[2]] = 0;
      visited[pickN[0]] = true;
      stack.push(pickN[0]);
    }
    walls[0][3] = 0;                  // inngang venstre topp
    walls[W * H - 1][1] = 0;          // utgang høyre bunn
    var mm = sizeMM || 120;
    var cell = mm / Math.max(W, H);
    var lines = [];
    for (var c2 = 0; c2 < W * H; c2++) {
      var x = (c2 % W) * cell, y = Math.floor(c2 / W) * cell;
      var w2 = walls[c2];
      if (w2[0]) lines.push('M' + x + ' ' + y + 'h' + cell);
      if (w2[3]) lines.push('M' + x + ' ' + y + 'v' + cell);
      if ((c2 % W) === W - 1 && w2[1]) lines.push('M' + (x + cell) + ' ' + y + 'v' + cell);
      if (Math.floor(c2 / W) === H - 1 && w2[2]) lines.push('M' + x + ' ' + (y + cell) + 'h' + cell);
    }
    var startY = cell / 2, endY = (H - 0.5) * cell;
    return '<svg viewBox="-2 -2 ' + (W * cell + 4) + ' ' + (H * cell + 4) + '" style="width:' + mm + 'mm;height:' + (H * cell) + 'mm">' +
      '<path d="' + lines.join('') + '" stroke="#2b2530" stroke-width="1.1" fill="none" stroke-linecap="round"/>' +
      '<text x="' + (cell * 0.18) + '" y="' + (startY + 1.6) + '" font-size="' + (cell * 0.5) + '">🐭</text>' +
      '<text x="' + ((W - 0.85) * cell) + '" y="' + (endY + 1.6) + '" font-size="' + (cell * 0.5) + '">🧀</text>' +
      '</svg>';
  };

  /* --- Kryssord --- */
  gen.crossword = function (entries) {
    // entries: [{word, clue}] — plasser med kryssende bokstaver
    var list = entries
      .map(function (e) { return { word: e.word.toUpperCase().replace(/[^A-ZÆØÅ]/g, ''), clue: e.clue }; })
      .filter(function (e) { return e.word.length >= 2; })
      .sort(function (a, b) { return b.word.length - a.word.length; });
    if (!list.length) return null;
    var SIZE = 21, mid = Math.floor(SIZE / 2);
    var grid = {};
    function get(r, c) { return grid[r + ',' + c] || ''; }
    function set(r, c, ch) { grid[r + ',' + c] = ch; }
    var placedWords = [];

    function canPlace(word, r, c, dr, dc) {
      var before = get(r - dr, c - dc);
      var after = get(r + dr * word.length, c + dc * word.length);
      if (before || after) return -1;
      var crossings = 0;
      for (var i = 0; i < word.length; i++) {
        var rr = r + dr * i, cc = c + dc * i;
        if (rr < 0 || cc < 0 || rr >= SIZE || cc >= SIZE) return -1;
        var ch = get(rr, cc);
        if (ch) {
          if (ch !== word[i]) return -1;
          crossings++;
        } else {
          // naboceller på tvers må være tomme der vi ikke krysser
          if (get(rr + dc, cc + dr) || get(rr - dc, cc - dr)) return -1;
        }
      }
      return crossings;
    }
    function place(word, r, c, dr, dc, clue) {
      for (var i = 0; i < word.length; i++) set(r + dr * i, c + dc * i, word[i]);
      placedWords.push({ word: word, clue: clue, r: r, c: c, dr: dr, dc: dc });
    }

    place(list[0].word, mid, mid - Math.floor(list[0].word.length / 2), 0, 1, list[0].clue);
    for (var li = 1; li < list.length; li++) {
      var e = list[li], best = null;
      for (var pi = 0; pi < placedWords.length; pi++) {
        var pw = placedWords[pi];
        for (var a = 0; a < pw.word.length; a++) {
          for (var b = 0; b < e.word.length; b++) {
            if (pw.word[a] !== e.word[b]) continue;
            var dr = pw.dr === 0 ? 1 : 0, dc = pw.dr === 0 ? 0 : 1;
            var r = pw.r + pw.dr * a - dr * b;
            var c = pw.c + pw.dc * a - dc * b;
            var cr = canPlace(e.word, r, c, dr, dc);
            if (cr > 0 && (!best || cr > best.cr)) best = { r: r, c: c, dr: dr, dc: dc, cr: cr };
          }
        }
      }
      if (best) place(e.word, best.r, best.c, best.dr, best.dc, e.clue);
    }

    // Beskjær og nummerer
    var minR = 99, maxR = -1, minC = 99, maxC = -1;
    Object.keys(grid).forEach(function (k) {
      var p = k.split(',');
      minR = Math.min(minR, +p[0]); maxR = Math.max(maxR, +p[0]);
      minC = Math.min(minC, +p[1]); maxC = Math.max(maxC, +p[1]);
    });
    var across = [], down = [], num = 0, numbers = {};
    placedWords.sort(function (a, b) { return (a.r - b.r) || (a.c - b.c); });
    placedWords.forEach(function (w) {
      var key = w.r + ',' + w.c;
      if (!numbers[key]) { num++; numbers[key] = num; }
      var item = { n: numbers[key], clue: w.clue, word: w.word };
      if (w.dr === 0) across.push(item); else down.push(item);
    });
    return {
      minR: minR, maxR: maxR, minC: minC, maxC: maxC,
      grid: grid, numbers: numbers, across: across, down: down,
    };
  };

  /* --- Mandala / mønster-fargelegging (SVG) --- */
  gen.mandalaSvg = function (seed, sizeMM) {
    var rnd = mulberry32(seed || gen.seed());
    var S = 200, cx = 100, cy = 100;
    var parts = [];
    var symmetry = [8, 10, 12, 16][Math.floor(rnd() * 4)];
    var rings = 4 + Math.floor(rnd() * 3);
    var rStep = 88 / rings;
    parts.push('<circle cx="100" cy="100" r="95" />');
    parts.push('<circle cx="100" cy="100" r="' + (4 + rnd() * 4).toFixed(1) + '" />');
    for (var ring = 1; ring <= rings; ring++) {
      var r0 = ring * rStep * 0.92 + 6;
      var motif = Math.floor(rnd() * 5);
      for (var k = 0; k < symmetry; k++) {
        var ang = (k / symmetry) * Math.PI * 2;
        var x = cx + Math.cos(ang) * r0, y = cy + Math.sin(ang) * r0;
        var deg = (ang * 180 / Math.PI + 90).toFixed(1);
        if (motif === 0) {
          parts.push('<circle cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="' + (rStep * 0.34).toFixed(1) + '" />');
        } else if (motif === 1) {
          var rp = rStep * 0.52;
          parts.push('<ellipse cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" rx="' + (rp * 0.42).toFixed(1) + '" ry="' + rp.toFixed(1) +
            '" transform="rotate(' + deg + ' ' + x.toFixed(1) + ' ' + y.toFixed(1) + ')" />');
        } else if (motif === 2) {
          var s2 = rStep * 0.4;
          parts.push('<rect x="' + (x - s2 / 2).toFixed(1) + '" y="' + (y - s2 / 2).toFixed(1) + '" width="' + s2.toFixed(1) + '" height="' + s2.toFixed(1) +
            '" transform="rotate(' + (45 + +deg) + ' ' + x.toFixed(1) + ' ' + y.toFixed(1) + ')" rx="1.5" />');
        } else if (motif === 3) {
          var r3 = rStep * 0.5;
          parts.push('<path d="M ' + x.toFixed(1) + ' ' + (y - r3).toFixed(1) + ' Q ' + (x + r3).toFixed(1) + ' ' + y.toFixed(1) + ' ' + x.toFixed(1) + ' ' + (y + r3).toFixed(1) +
            ' Q ' + (x - r3).toFixed(1) + ' ' + y.toFixed(1) + ' ' + x.toFixed(1) + ' ' + (y - r3).toFixed(1) + ' Z" transform="rotate(' + deg + ' ' + x.toFixed(1) + ' ' + y.toFixed(1) + ')"/>');
        } else {
          var a2 = ((k + 0.5) / symmetry) * Math.PI * 2;
          parts.push('<line x1="' + (cx + Math.cos(a2) * (r0 - rStep * 0.35)).toFixed(1) + '" y1="' + (cy + Math.sin(a2) * (r0 - rStep * 0.35)).toFixed(1) +
            '" x2="' + (cx + Math.cos(a2) * (r0 + rStep * 0.35)).toFixed(1) + '" y2="' + (cy + Math.sin(a2) * (r0 + rStep * 0.35)).toFixed(1) + '" />');
        }
      }
      if (rnd() < 0.55) parts.push('<circle cx="100" cy="100" r="' + (r0 + rStep * 0.46).toFixed(1) + '" />');
    }
    return '<svg viewBox="0 0 ' + S + ' ' + S + '" style="width:' + (sizeMM || 150) + 'mm;height:' + (sizeMM || 150) + 'mm">' +
      '<g fill="none" stroke="#2b2530" stroke-width="0.9">' + parts.join('') + '</g></svg>';
  };

  /* --- Kalender-matematikk --- */
  gen.MONTHS = {
    no: ['Januar', 'Februar', 'Mars', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Desember'],
    en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  };
  gen.DAYS = {
    no: ['Mandag', 'Tirsdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lørdag', 'Søndag'],
    en: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
  };
  gen.monthMatrix = function (year, month) {
    // Uker som rader, mandag først. 0 = tom celle.
    var first = new Date(year, month, 1);
    var startCol = (first.getDay() + 6) % 7;
    var days = new Date(year, month + 1, 0).getDate();
    var rows = [], row = new Array(7).fill(0), col = startCol;
    for (var d = 1; d <= days; d++) {
      row[col] = d;
      col++;
      if (col === 7) { rows.push(row); row = new Array(7).fill(0); col = 0; }
    }
    if (col > 0) rows.push(row);
    return rows;
  };

  /* --- Regneoppgaver --- */
  gen.mathProblems = function (level, op, count, seed) {
    var rnd = mulberry32(seed || gen.seed());
    var out = [];
    function ri(min, max) { return min + Math.floor(rnd() * (max - min + 1)); }
    for (var i = 0; i < count; i++) {
      var a, b, q, ans;
      var o = op === 'mix' ? ['add', 'sub', 'mul'][Math.floor(rnd() * (level === 1 ? 2 : 3))] : op;
      if (o === 'add') {
        var max = level === 1 ? 10 : level === 2 ? 20 : 100;
        a = ri(1, max); b = ri(1, max);
        q = a + ' + ' + b + ' ='; ans = a + b;
      } else if (o === 'sub') {
        var max2 = level === 1 ? 10 : level === 2 ? 20 : 100;
        a = ri(2, max2); b = ri(1, a);
        q = a + ' − ' + b + ' ='; ans = a - b;
      } else if (o === 'mul') {
        var mx = level <= 2 ? 5 : 10;
        a = ri(1, mx); b = ri(1, 10);
        q = a + ' × ' + b + ' ='; ans = a * b;
      } else { // div
        b = ri(2, level <= 2 ? 5 : 9); ans = ri(1, 10); a = b * ans;
        q = a + ' ÷ ' + b + ' =';
      }
      out.push({ q: q, a: ans });
    }
    return out;
  };

  /* --- Spot the difference / finn objektet (emoji-scener) --- */
  gen.spotScene = function (themeKey, diffCount, seed) {
    var rnd = mulberry32(seed || gen.seed());
    var set = gen.emojiSet(themeKey);
    var cells = 20; // 5 x 4
    var A = [];
    for (var i = 0; i < cells; i++) A.push(set[Math.floor(rnd() * set.length)]);
    var B = A.slice();
    var idxs = [];
    while (idxs.length < diffCount) {
      var x = Math.floor(rnd() * cells);
      if (idxs.indexOf(x) === -1) idxs.push(x);
    }
    idxs.forEach(function (ix) {
      var cur = B[ix], alt = cur;
      while (alt === cur) alt = set[Math.floor(rnd() * set.length)];
      B[ix] = alt;
    });
    return { a: A, b: B, cols: 5 };
  };

  gen.findScene = function (themeKey, targets, seed) {
    var rnd = mulberry32(seed || gen.seed());
    var set = gen.emojiSet(themeKey);
    var grid = [];
    var N = 64; // 8 x 8
    for (var i = 0; i < N; i++) grid.push(set[Math.floor(rnd() * set.length)]);
    var counts = {};
    targets.forEach(function (t) {
      counts[t] = grid.filter(function (g) { return g === t; }).length;
      if (counts[t] === 0) { // garanter minst 2
        for (var k = 0; k < 2; k++) grid[Math.floor(rnd() * N)] = t;
        counts[t] = grid.filter(function (g) { return g === t; }).length;
      }
    });
    return { grid: grid, cols: 8, counts: counts };
  };

  /* --- Tallpuslespill (magisk kvadrat med skjulte felter) --- */
  gen.numberPuzzle = function (difficulty, seed) {
    var rnd = mulberry32(seed || gen.seed());
    var base = [[2, 7, 6], [9, 5, 1], [4, 3, 8]]; // magisk sum 15
    var add = difficulty === 'easy' ? 0 : Math.floor(rnd() * 6) + (difficulty === 'hard' ? 6 : 1);
    var sol = base.map(function (r) { return r.map(function (v) { return v + add; }); });
    var hide = difficulty === 'easy' ? 3 : difficulty === 'hard' ? 6 : 4;
    var puz = sol.map(function (r) { return r.slice(); });
    var cells = [0, 1, 2, 3, 4, 5, 6, 7, 8].sort(function () { return rnd() - 0.5; });
    for (var i = 0; i < hide; i++) puz[Math.floor(cells[i] / 3)][cells[i] % 3] = 0;
    return { puzzle: puz, solution: sol, sum: 15 + add * 3 };
  };

  /* =====================================================================
     INNEBYGDE TEKSTBANKER (fallback uten AI + journals/planners)
     ===================================================================== */
  gen.GRATITUDE = {
    no: ['Tre ting jeg er takknemlig for i dag', 'En person som gjorde dagen min bedre', 'Noe fint jeg så i naturen', 'Noe jeg fikk til i dag', 'Et øyeblikk jeg vil huske', 'Noe som fikk meg til å le', 'En ting jeg gleder meg til', 'Noe godt jeg gjorde for en annen', 'En lyd, lukt eller smak jeg likte', 'Noe jeg lærte i dag'],
    en: ['Three things I am grateful for today', 'A person who made my day better', 'Something beautiful I saw in nature', 'Something I accomplished today', 'A moment I want to remember', 'Something that made me laugh', 'One thing I look forward to', 'Something kind I did for someone else', 'A sound, smell or taste I enjoyed', 'Something I learned today'],
  };
  gen.REFLECTION = {
    no: ['Hva var det beste med dagen?', 'Hva var utfordrende, og hvordan løste jeg det?', 'Hva ville jeg gjort annerledes?', 'Hvem hjalp meg i dag, og hvem hjalp jeg?', 'Hva er jeg stolt av denne uka?', 'Hvilket mål vil jeg jobbe mot i morgen?', 'Hva ga meg energi, og hva tappet meg?', 'Hva har jeg lært om meg selv?'],
    en: ['What was the best part of the day?', 'What was challenging, and how did I solve it?', 'What would I do differently?', 'Who helped me today, and who did I help?', 'What am I proud of this week?', 'Which goal will I work towards tomorrow?', 'What gave me energy, and what drained me?', 'What have I learned about myself?'],
  };

  /* Fallback-historie for bokskaperen (uten AI) */
  gen.fallbackStory = function (cfg, pageCount) {
    var lang = cfg.lang || BK.lang();
    var chars = (cfg.characters || (lang === 'no' ? 'Mia og Teo' : 'Mia and Teo'));
    var topic = cfg.topic || (lang === 'no' ? 'naturen' : 'nature');
    var T = lang === 'no' ? {
      open: [
        chars + ' våknet tidlig en morgen. Utenfor vinduet ventet noe spennende: ' + topic + '.',
        '"Kom!" ropte ' + chars.split(/ og | and /)[0] + '. "I dag skal vi utforske ' + topic + '!"',
        'Sola tittet frem, og ' + chars + ' pakket sekken. I dag skulle de lære om ' + topic + '.',
      ],
      mid: [
        'De stoppet og så nøye etter. Det var så mye å oppdage når de tok seg god tid.',
        '"Se her!" hvisket de. Noe lite og fint gjemte seg rett foran dem.',
        'De stilte spørsmål og lette etter svar. Hvert funn gjorde dem mer nysgjerrige.',
        'Noen ganger var det vanskelig, men de prøvde igjen. Sakte ble det lettere.',
        'De sorterte, telte og sammenlignet det de fant. Det var som en skattejakt.',
        'En venn kom forbi og ville være med. Sammen oppdaget de enda mer.',
        'De tegnet det de så, så de kunne huske det etterpå.',
        'Vinden hvisket i trærne mens de jobbet konsentrert, helt oppslukt.',
      ],
      end: [
        'Da kvelden kom, var de trøtte og glade. De hadde lært så mye om ' + topic + '.',
        '"I morgen utforsker vi mer," sa de og smilte. Verden var full av ting å undre seg over.',
      ],
      illus: 'Illustrasjon: ',
    } : {
      open: [
        chars + ' woke up early one morning. Something exciting was waiting outside: ' + topic + '.',
        '"Come on!" called ' + chars.split(/ og | and /)[0] + '. "Today we are exploring ' + topic + '!"',
        'The sun peeked out, and ' + chars + ' packed their bag. Today they would learn about ' + topic + '.',
      ],
      mid: [
        'They stopped and looked closely. There was so much to discover when they took their time.',
        '"Look here!" they whispered. Something small and lovely was hiding right in front of them.',
        'They asked questions and searched for answers. Every find made them more curious.',
        'Sometimes it was hard, but they tried again. Slowly it became easier.',
        'They sorted, counted and compared what they found. It was like a treasure hunt.',
        'A friend came by and wanted to join. Together they discovered even more.',
        'They drew what they saw, so they could remember it afterwards.',
        'The wind whispered in the trees while they worked, completely absorbed.',
      ],
      end: [
        'When evening came, they were tired and happy. They had learned so much about ' + topic + '.',
        '"Tomorrow we will explore more," they said and smiled. The world was full of things to wonder about.',
      ],
      illus: 'Illustration: ',
    };
    var pagesOut = [];
    for (var i = 0; i < pageCount; i++) {
      var text;
      if (i === 0) text = T.open[i % T.open.length];
      else if (i < Math.min(3, pageCount - 2)) text = T.open[i % T.open.length];
      else if (i >= pageCount - 2) text = T.end[(i - (pageCount - 2)) % T.end.length];
      else text = T.mid[(i - 3) % T.mid.length];
      pagesOut.push({
        text: text,
        illustration: (lang === 'no'
          ? 'Varm, lys scene med ' + chars + ' som utforsker ' + topic + ', side ' + (i + 1)
          : 'Warm, bright scene of ' + chars + ' exploring ' + topic + ', page ' + (i + 1)),
      });
    }
    return pagesOut;
  };

  /* =====================================================================
     SIDERENDERERE
     Hver side: { id, kind, title, data }. Render gir komplett .bk-sheet.
     ===================================================================== */
  var R = {};
  gen.renderers = R;

  function sheet(project, page, idx, total, bodyHtml, opts) {
    opts = opts || {};
    var size = BK.sizeOf(project);
    var headSizes = { s: '12pt', m: '16pt', l: '22pt', xl: '28pt' };
    var hs = headSizes[(page.data && page.data.headSize) || 'm'] || '16pt';
    var head = opts.noHead ? '' :
      '<div class="pg-head" style="font-size:' + hs + '">' + esc(page.title || '') + '</div>' +
      (page.data && page.data.sub ? '<div class="pg-sub">' + esc(page.data.sub) + '</div>' : '');
    var foot = opts.noFoot ? '' :
      '<div class="pg-foot"><span>' + esc(project.title) + '</span><span>' + (idx + 1) + ' / ' + total + '</span></div>';
    return '<div class="bk-sheet" data-page="' + idx + '" style="width:' + size.w + 'mm;height:' + size.h + 'mm">' +
      '<div class="pg-inner">' + head + '<div class="pg-body">' + bodyHtml + '</div>' + foot + '</div></div>';
  }

  gen.renderPage = function (project, page, idx, total) {
    var fn = R[page.kind] || R.text;
    return fn(project, page, idx, total);
  };

  /* --- Generelle sider --- */
  R.cover = function (p, pg, i, n) {
    var d = pg.data || {};
    var size = BK.sizeOf(p);
    var theme = d.theme || 'pink';
    var bgs = {
      pink: 'linear-gradient(160deg,#ffe3ee,#fff5f9 60%,#ffd9e8)',
      blue: 'linear-gradient(160deg,#e3f2fd,#ffffff 60%,#d8ecfb)',
      lime: 'linear-gradient(160deg,#f0fadd,#ffffff 60%,#e6f5c8)',
      lemon: 'linear-gradient(160deg,#fff8db,#ffffff 60%,#ffefb3)',
    };
    var img = d.image ? '<div style="flex:1;display:flex;align-items:center;justify-content:center;min-height:0">' +
        '<img src="' + d.image + '" alt="" style="max-width:88%;max-height:100%;border-radius:5mm;box-shadow:0 4mm 10mm rgba(176,36,88,.18)"/></div>'
      : '<div style="flex:1;display:flex;align-items:center;justify-content:center;font-size:46mm">' + (d.emoji || '🌸') + '</div>';
    return '<div class="bk-sheet" data-page="' + i + '" style="width:' + size.w + 'mm;height:' + size.h + 'mm;background:' + (bgs[theme] || bgs.pink) + '">' +
      '<div class="pg-inner" style="text-align:center;padding:16mm">' +
      '<div style="font-size:9pt;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:#b02458">' + esc(d.kicker || 'Little Montessori Explorers') + '</div>' +
      '<div style="font-family:\'Sasson Montessori\',\'Playpen Sans\',sans-serif;font-weight:700;font-size:30pt;line-height:1.12;color:#2b2530;margin-top:8mm">' + esc(d.title || p.title) + '</div>' +
      (d.subtitle ? '<div style="font-size:13pt;color:#7a6a72;margin-top:4mm">' + esc(d.subtitle) + '</div>' : '') +
      img +
      '<div style="font-size:12pt;font-weight:800;color:#b02458">' + esc(d.author || '') + '</div>' +
      '</div></div>';
  };

  R.backcover = function (p, pg, i, n) {
    var d = pg.data || {};
    return sheet(p, pg, i, n,
      '<div style="display:flex;flex-direction:column;height:100%;justify-content:center;max-width:80%;margin:0 auto;text-align:center;gap:6mm">' +
      '<div style="font-family:\'Sasson Montessori\',\'Playpen Sans\',sans-serif;font-size:14pt;color:#b02458">' + esc(d.hook || '') + '</div>' +
      '<div style="font-size:11pt;line-height:1.8">' + esc(d.text || '') + '</div>' +
      (d.bio ? '<div style="font-size:9.5pt;color:#7a6a72">' + esc(d.bio) + '</div>' : '') +
      '<div style="margin-top:8mm;border:1pt solid #d8c4ce;border-radius:2mm;height:18mm;width:42mm;align-self:center;display:flex;align-items:center;justify-content:center;font-size:8pt;color:#9b8b93">ISBN / EAN-13</div>' +
      '</div>', { noHead: true, noFoot: true });
  };

  R.toc = function (p, pg, i, n) {
    var items = (pg.data && pg.data.items) || [];
    return sheet(p, pg, i, n, items.map(function (it, ix) {
      return '<div style="display:flex;align-items:baseline;gap:3mm;padding:1.6mm 0;font-size:11.5pt">' +
        '<span style="font-weight:800;color:#b02458">' + (ix + 1) + '.</span>' +
        '<span>' + esc(it.t) + '</span>' +
        '<span style="flex:1;border-bottom:1pt dotted #d8c4ce"></span>' +
        '<span style="font-weight:700">' + esc(it.p || '') + '</span></div>';
    }).join(''));
  };

  R.text = function (p, pg, i, n) {
    var d = pg.data || {};
    return sheet(p, pg, i, n,
      '<div style="display:flex;flex-direction:column;height:100%;gap:5mm">' +
      '<div style="white-space:pre-wrap;font-size:11pt;line-height:1.8">' + esc(d.text || '') + '</div>' +
      (d.image ? '<div style="flex:1;display:flex;align-items:center;justify-content:center;min-height:0">' +
        '<img src="' + d.image + '" alt="" style="max-width:100%;max-height:100%;border-radius:4mm;object-fit:contain"/></div>' : '') +
      '</div>');
  };

  R.story = function (p, pg, i, n) {
    var d = pg.data || {};
    var illus = d.image
      ? '<div style="flex:1.4;display:flex;align-items:center;justify-content:center;min-height:0">' +
        '<img src="' + d.image + '" alt="" style="max-width:100%;max-height:100%;border-radius:4mm;object-fit:contain"/></div>'
      : '<div class="illus-box" style="flex:1.4"><div style="font-size:10mm">🎨</div>' +
        '<div><strong>' + (BK.lang() === 'no' ? 'Illustrasjon' : 'Illustration') + ':</strong> ' + esc(d.illustration || '') + '</div></div>';
    return sheet(p, pg, i, n,
      '<div style="display:flex;flex-direction:column;height:100%;gap:5mm">' + illus +
      '<div class="story-text" style="flex:1">' + esc(d.text || '') + '</div>' +
      '</div>', {});
  };

  R.intro = R.text;

  /* Helsides bildeside: for egne design, f.eks. eksportert fra Canva */
  R.fullimage = function (p, pg, i, n) {
    var d = pg.data || {};
    var size = BK.sizeOf(p);
    var lang = BK.lang();
    var inner = d.image
      ? '<img src="' + d.image + '" alt="" style="position:absolute;inset:0;width:100%;height:100%;object-fit:' + (d.fit === 'contain' ? 'contain' : 'cover') + '"/>'
      : '<div class="pg-inner"><div class="illus-box" style="height:100%"><div style="font-size:12mm">🖼️</div>' +
        '<div style="max-width:80%">' + (lang === 'no'
          ? 'Last opp et bilde som fyller hele siden, f.eks. en side du har designet i Canva (eksporter som PNG eller JPG i sidens format).'
          : 'Upload an image that fills the whole page, e.g. a page designed in Canva (export as PNG or JPG in the page format).') + '</div></div></div>';
    return '<div class="bk-sheet" data-page="' + i + '" style="width:' + size.w + 'mm;height:' + size.h + 'mm">' + inner + '</div>';
  };

  R.certificate = function (p, pg, i, n) {
    var d = pg.data || {};
    var lang = BK.lang();
    return sheet(p, pg, i, n,
      '<div style="border:2.5pt solid #f0a8c4;border-radius:6mm;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:5mm;text-align:center;padding:10mm">' +
      '<div style="font-size:16mm">🏅</div>' +
      '<div style="font-family:\'Sasson Montessori\',\'Playpen Sans\',sans-serif;font-size:22pt;color:#b02458">' + esc(d.heading || (lang === 'no' ? 'Diplom' : 'Certificate')) + '</div>' +
      '<div style="font-size:11pt">' + esc(d.line || (lang === 'no' ? 'tildeles' : 'is awarded to')) + '</div>' +
      '<div style="border-bottom:1.5pt solid #b02458;width:70%;height:10mm"></div>' +
      '<div style="font-size:10.5pt;max-width:80%">' + esc(d.reason || '') + '</div>' +
      '<div style="display:flex;gap:14mm;margin-top:8mm;font-size:9pt;color:#7a6a72"><span>' + (lang === 'no' ? 'Dato' : 'Date') + ': ____________</span><span>' + (lang === 'no' ? 'Signatur' : 'Signature') + ': ____________</span></div>' +
      '</div>', { noFoot: true });
  };

  R.answers = function (p, pg, i, n) {
    var items = (pg.data && pg.data.items) || [];
    return sheet(p, pg, i, n,
      '<div style="columns:2;column-gap:8mm;font-size:9.5pt;line-height:1.7">' +
      items.map(function (it) { return '<div><strong>' + esc(it.ref) + ':</strong> ' + esc(it.ans) + '</div>'; }).join('') +
      '</div>');
  };

  /* --- Arbeidsark --- */
  R.mathsheet = function (p, pg, i, n) {
    var d = pg.data || {};
    var probs = d.problems || [];
    return sheet(p, pg, i, n,
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:5mm 10mm;font-size:13pt;font-weight:700;padding-top:2mm">' +
      probs.map(function (pr, ix) {
        return '<div style="display:flex;align-items:center;gap:3mm"><span style="font-size:8.5pt;color:#9b8b93">' + (ix + 1) + ')</span>' +
          '<span>' + esc(pr.q) + '</span><span style="border-bottom:1.2pt solid #b02458;min-width:14mm;height:6mm"></span></div>';
      }).join('') + '</div>');
  };

  R.counting = function (p, pg, i, n) {
    var d = pg.data || {};
    var rows = d.rows || [];
    return sheet(p, pg, i, n, rows.map(function (r) {
      return '<div style="display:flex;align-items:center;gap:4mm;padding:3mm 0;border-bottom:.6pt solid #f0d4e0">' +
        '<div style="flex:1;font-size:9mm;letter-spacing:2mm">' + r.emoji.repeat(r.count) + '</div>' +
        '<div class="cellbox" style="width:14mm;height:14mm;font-size:12pt;color:#c8b2bd"></div></div>';
    }).join('') + '<div class="pg-sub" style="margin-top:4mm">' +
      (BK.lang() === 'no' ? 'Tell og skriv tallet i ruten.' : 'Count and write the number in the box.') + '</div>');
  };

  R.tracing = function (p, pg, i, n) {
    var d = pg.data || {};
    var items = d.items || [];
    var rows = items.map(function (word) {
      return '<div style="position:relative;border-bottom:1pt solid #d8c4ce;margin-bottom:7mm">' +
        '<svg viewBox="0 0 180 30" style="width:100%;height:19mm;display:block">' +
        '<line x1="0" y1="22" x2="180" y2="22" stroke="#e8d4dd" stroke-width="0.6"/>' +
        '<line x1="0" y1="8" x2="180" y2="8" stroke="#f3e4ea" stroke-width="0.5" stroke-dasharray="2,2"/>' +
        '<text x="2" y="22" font-size="19" font-family="Sasson Montessori, Playpen Sans, sans-serif" fill="none" stroke="#8a7a82" stroke-width="0.45" stroke-dasharray="2.2,1.6" letter-spacing="3">' + esc(word) + '</text>' +
        '</svg></div>';
    }).join('');
    return sheet(p, pg, i, n, rows +
      '<div class="lines tight">' + '<div></div><div></div><div></div>' + '</div>' +
      '<div class="pg-sub" style="margin-top:3mm">' + (BK.lang() === 'no' ? 'Spor bokstavene, og prøv selv på linjene.' : 'Trace the letters, then try on the lines.') + '</div>');
  };

  R.matching = function (p, pg, i, n) {
    var d = pg.data || {};
    var pairs = d.pairs || [];
    var rights = d.shuffled || pairs.map(function (x) { return x.right; });
    return sheet(p, pg, i, n,
      '<div style="display:flex;gap:14mm;padding-top:2mm">' +
      '<div style="flex:1;display:flex;flex-direction:column;gap:5mm">' +
      pairs.map(function (pr) {
        return '<div style="display:flex;align-items:center;gap:3mm;border:1pt solid #f0d4e0;border-radius:3mm;padding:2.5mm 4mm;font-size:12pt"><span style="font-size:8mm">' + pr.icon + '</span> ' + esc(pr.left) + '<span style="margin-left:auto;color:#b02458">●</span></div>';
      }).join('') + '</div>' +
      '<div style="flex:1;display:flex;flex-direction:column;gap:5mm">' +
      rights.map(function (r2) {
        return '<div style="display:flex;align-items:center;gap:3mm;border:1pt solid #d4e6f5;border-radius:3mm;padding:2.5mm 4mm;font-size:12pt"><span style="color:#1971c2">●</span> ' + esc(r2) + '</div>';
      }).join('') + '</div></div>' +
      '<div class="pg-sub" style="margin-top:5mm">' + (BK.lang() === 'no' ? 'Trekk strek mellom det som hører sammen.' : 'Draw a line between the ones that belong together.') + '</div>');
  };

  R.cutpaste = function (p, pg, i, n) {
    var d = pg.data || {};
    var lang = BK.lang();
    return sheet(p, pg, i, n,
      '<div style="border:1.2pt dashed #b02458;border-radius:3mm;padding:4mm;display:flex;justify-content:space-around;font-size:11mm">✂️ ' +
      (d.items || []).map(function (e) { return '<span>' + e + '</span>'; }).join('') + '</div>' +
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:5mm;margin-top:7mm;flex:1">' +
      (d.boxes || []).map(function (b) {
        return '<div style="border:1pt solid #e8b8cd;border-radius:4mm;min-height:46mm;padding:3mm;text-align:center"><strong style="font-size:11pt;color:#b02458">' + esc(b) + '</strong></div>';
      }).join('') + '</div>' +
      '<div class="pg-sub" style="margin-top:4mm">' + (lang === 'no' ? 'Klipp ut bildene øverst, og lim dem i riktig boks.' : 'Cut out the pictures at the top and glue them into the right box.') + '</div>');
  };

  R.memory = function (p, pg, i, n) {
    var d = pg.data || {};
    var cards = d.cards || [];
    return sheet(p, pg, i, n,
      '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:3mm;padding-top:2mm">' +
      cards.map(function (c) {
        return '<div style="border:1pt dashed #b02458;border-radius:3mm;aspect-ratio:1;display:flex;align-items:center;justify-content:center;font-size:11mm">' + c + '</div>';
      }).join('') + '</div>' +
      '<div class="pg-sub" style="margin-top:4mm">' + (BK.lang() === 'no' ? 'Klipp ut kortene, snu dem og finn to like.' : 'Cut out the cards, turn them over and find the matching pairs.') + '</div>');
  };

  R.maze = function (p, pg, i, n) {
    var d = pg.data || {};
    var dims = d.dims || [10, 10];
    return sheet(p, pg, i, n,
      '<div style="display:flex;justify-content:center;padding-top:3mm">' + gen.mazeSvg(dims[0], dims[1], d.seed, d.mm || 130) + '</div>' +
      '<div class="pg-sub" style="text-align:center;margin-top:4mm">' + (BK.lang() === 'no' ? 'Hjelp musa å finne veien til osten!' : 'Help the mouse find its way to the cheese!') + '</div>');
  };

  R.wordsearch = function (p, pg, i, n) {
    var d = pg.data || {};
    var ws = d.ws;
    if (!ws) return sheet(p, pg, i, n, '');
    var N = ws.grid.length;
    var cellSize = (130 / N).toFixed(2);
    return sheet(p, pg, i, n,
      '<div style="display:flex;justify-content:center"><table style="border-collapse:collapse">' +
      ws.grid.map(function (row) {
        return '<tr>' + row.map(function (ch) {
          return '<td style="border:.6pt solid #e8d4dd;width:' + cellSize + 'mm;height:' + cellSize + 'mm;text-align:center;font-weight:800;font-size:' + Math.min(13, 30 / N * 6) + 'pt">' + ch + '</td>';
        }).join('') + '</tr>';
      }).join('') + '</table></div>' +
      '<div style="display:flex;flex-wrap:wrap;gap:2mm 5mm;margin-top:5mm;justify-content:center">' +
      ws.words.map(function (w) { return '<span style="font-size:10pt;font-weight:700;border:1pt solid #f0d4e0;border-radius:99mm;padding:.8mm 3.5mm">' + esc(w) + '</span>'; }).join('') +
      '</div>');
  };

  R.crossword = function (p, pg, i, n) {
    var d = pg.data || {};
    var cw = d.cw;
    if (!cw) return sheet(p, pg, i, n, '');
    var rows = [];
    var cols = cw.maxC - cw.minC + 1, rcount = cw.maxR - cw.minR + 1;
    var cell = Math.min(9, 120 / Math.max(cols, rcount));
    for (var r = cw.minR; r <= cw.maxR; r++) {
      var tds = [];
      for (var c = cw.minC; c <= cw.maxC; c++) {
        var ch = cw.grid[r + ',' + c];
        var num = cw.numbers[r + ',' + c];
        if (ch) {
          tds.push('<td style="border:.7pt solid #4a3429;width:' + cell + 'mm;height:' + cell + 'mm;position:relative;text-align:center;font-weight:800;font-size:8pt">' +
            (num ? '<span style="position:absolute;top:.2mm;left:.6mm;font-size:5.5pt;font-weight:700;color:#b02458">' + num + '</span>' : '') +
            (d.showSolution ? ch : '') + '</td>');
        } else {
          tds.push('<td style="width:' + cell + 'mm;height:' + cell + 'mm"></td>');
        }
      }
      rows.push('<tr>' + tds.join('') + '</tr>');
    }
    var lang = BK.lang();
    function clues(list, head) {
      return '<div style="flex:1"><strong style="color:#b02458;font-size:9.5pt">' + head + '</strong>' +
        list.map(function (cl) { return '<div style="font-size:8.5pt;line-height:1.55"><strong>' + cl.n + '.</strong> ' + esc(cl.clue) + '</div>'; }).join('') + '</div>';
    }
    return sheet(p, pg, i, n,
      '<div style="display:flex;justify-content:center"><table style="border-collapse:collapse">' + rows.join('') + '</table></div>' +
      '<div style="display:flex;gap:8mm;margin-top:5mm">' +
      clues(cw.across, lang === 'no' ? 'Vannrett' : 'Across') +
      clues(cw.down, lang === 'no' ? 'Loddrett' : 'Down') +
      '</div>');
  };

  R.sudoku = function (p, pg, i, n) {
    var d = pg.data || {};
    var board = d.showSolution ? d.solution : d.puzzle;
    if (!board) return sheet(p, pg, i, n, '');
    var N = board.length;
    var cell = N === 4 ? 17 : 13;
    var box = N === 4 ? 2 : 3;
    var rows = board.map(function (row, r) {
      return '<tr>' + row.map(function (v, c) {
        var bs = 'border:.5pt solid #c8b2bd;';
        if (r % box === 0) bs += 'border-top:1.4pt solid #4a3429;';
        if (c % box === 0) bs += 'border-left:1.4pt solid #4a3429;';
        if (r === N - 1) bs += 'border-bottom:1.4pt solid #4a3429;';
        if (c === N - 1) bs += 'border-right:1.4pt solid #4a3429;';
        return '<td style="' + bs + 'width:' + cell + 'mm;height:' + cell + 'mm;text-align:center;font-size:' + (N === 4 ? 16 : 13) + 'pt;font-weight:700">' + (v || '') + '</td>';
      }).join('') + '</tr>';
    }).join('');
    return sheet(p, pg, i, n, '<div style="display:flex;justify-content:center;padding-top:4mm"><table style="border-collapse:collapse">' + rows + '</table></div>');
  };

  R.numberpuzzle = function (p, pg, i, n) {
    var d = pg.data || {};
    var puz = d.showSolution ? d.solution : d.puzzle;
    var lang = BK.lang();
    return sheet(p, pg, i, n,
      '<div style="display:flex;flex-direction:column;align-items:center;gap:5mm;padding-top:5mm">' +
      '<table style="border-collapse:collapse">' + puz.map(function (row) {
        return '<tr>' + row.map(function (v) {
          return '<td style="border:1pt solid #4a3429;width:18mm;height:18mm;text-align:center;font-size:16pt;font-weight:800">' + (v || '') + '</td>';
        }).join('') + '</tr>';
      }).join('') + '</table>' +
      '<div style="font-size:10.5pt;max-width:80%;text-align:center">' +
      (lang === 'no' ? 'Magisk kvadrat: hver rad, kolonne og diagonal skal bli ' + d.sum + '. Fyll inn tallene som mangler.' : 'Magic square: every row, column and diagonal must equal ' + d.sum + '. Fill in the missing numbers.') +
      '</div></div>');
  };

  R.spotdiff = function (p, pg, i, n) {
    var d = pg.data || {};
    var sc = d.scene;
    var lang = BK.lang();
    function grid(cellsArr) {
      return '<div style="border:1pt solid #e8b8cd;border-radius:4mm;padding:3mm;display:grid;grid-template-columns:repeat(' + sc.cols + ',1fr);gap:2mm;text-align:center;font-size:9mm">' +
        cellsArr.map(function (e) { return '<span>' + e + '</span>'; }).join('') + '</div>';
    }
    return sheet(p, pg, i, n,
      grid(sc.a) + '<div style="height:6mm"></div>' + grid(sc.b) +
      '<div class="pg-sub" style="margin-top:5mm;text-align:center">' +
      (lang === 'no' ? 'Finn ' + d.diffs + ' forskjeller mellom de to bildene, og sett ring rundt dem.' : 'Find ' + d.diffs + ' differences between the two pictures and circle them.') + '</div>');
  };

  R.findobject = function (p, pg, i, n) {
    var d = pg.data || {};
    var sc = d.scene;
    var lang = BK.lang();
    return sheet(p, pg, i, n,
      '<div style="display:flex;gap:4mm;flex-wrap:wrap;margin-bottom:4mm">' +
      Object.keys(sc.counts).map(function (t) {
        return '<span style="border:1pt solid #f0d4e0;border-radius:99mm;padding:1mm 4mm;font-size:11pt">' + t + ' × ' + sc.counts[t] + '</span>';
      }).join('') + '</div>' +
      '<div style="border:1pt solid #e8b8cd;border-radius:4mm;padding:4mm;display:grid;grid-template-columns:repeat(' + sc.cols + ',1fr);gap:2.5mm;text-align:center;font-size:8.5mm">' +
      sc.grid.map(function (e) { return '<span>' + e + '</span>'; }).join('') + '</div>' +
      '<div class="pg-sub" style="margin-top:4mm">' + (lang === 'no' ? 'Finn og sett ring rundt alle.' : 'Find and circle them all.') + '</div>');
  };

  R.pattern = function (p, pg, i, n) {
    var d = pg.data || {};
    var rows = d.rows || [];
    return sheet(p, pg, i, n, rows.map(function (r) {
      return '<div style="display:flex;align-items:center;gap:4mm;padding:4mm 0;border-bottom:.6pt solid #f0d4e0;font-size:10mm">' +
        r.seq.map(function (e) { return '<span>' + e + '</span>'; }).join('') +
        '<div class="cellbox" style="width:13mm;height:13mm"></div></div>';
    }).join('') + '<div class="pg-sub" style="margin-top:4mm">' +
      (BK.lang() === 'no' ? 'Hva kommer etterpå? Tegn eller skriv i ruten.' : 'What comes next? Draw or write in the box.') + '</div>');
  };

  /* --- Flashkort --- */
  R.cardsheet = function (p, pg, i, n) {
    var d = pg.data || {};
    var cards = d.cards || [];
    var cols = d.cols || 2, rows = d.rows || 4;
    return sheet(p, pg, i, n,
      '<div style="display:grid;grid-template-columns:repeat(' + cols + ',1fr);grid-template-rows:repeat(' + rows + ',1fr);gap:0;height:100%">' +
      cards.map(function (c) {
        return '<div style="border:.7pt dashed #b8a4ad;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:3mm;gap:1.5mm">' +
          (c.emoji ? '<div style="font-size:12mm">' + c.emoji + '</div>' : '') +
          (c.main ? '<div style="font-weight:800;font-size:' + (c.big ? 16 : 12) + 'pt">' + esc(c.main) + '</div>' : '') +
          (c.sub ? '<div style="font-size:9pt;color:#7a6a72">' + esc(c.sub) + '</div>' : '') +
          '</div>';
      }).join('') + '</div>', { noFoot: true });
  };

  /* --- Fargelegging --- */
  R.mandala = function (p, pg, i, n) {
    var d = pg.data || {};
    return sheet(p, pg, i, n,
      '<div style="display:flex;align-items:center;justify-content:center;height:100%">' + gen.mandalaSvg(d.seed, d.mm || 150) + '</div>',
      { noHead: !pg.title });
  };

  R.colorprompt = function (p, pg, i, n) {
    var d = pg.data || {};
    var lang = BK.lang();
    if (d.image) {
      return sheet(p, pg, i, n,
        '<div style="height:100%;display:flex;align-items:center;justify-content:center">' +
        '<img src="' + d.image + '" alt="" style="max-width:100%;max-height:100%;object-fit:contain"/></div>');
    }
    return sheet(p, pg, i, n,
      '<div class="illus-box" style="height:100%;border-color:#c8b2bd;background:#fff">' +
      '<div style="font-size:12mm">🖍️</div>' +
      '<div style="max-width:80%"><strong>' + (lang === 'no' ? 'Fargeleggingsmotiv' : 'Coloring artwork') + ':</strong> ' + esc(d.idea || '') + '</div>' +
      '<div style="font-size:8pt;color:#9b8b93;max-width:85%">' + (lang === 'no' ? 'AI-prompt: ' : 'AI prompt: ') + esc(d.prompt || '') + '</div>' +
      '</div>');
  };

  /* --- Journal --- */
  R.journal = function (p, pg, i, n) {
    var d = pg.data || {};
    var blocks = (d.prompts || []).map(function (q) {
      return '<div style="margin-bottom:6mm"><div style="font-weight:800;font-size:11pt;color:#b02458;margin-bottom:2mm">' + esc(q) + '</div>' +
        '<div class="lines"><div></div><div></div><div></div></div></div>';
    }).join('');
    return sheet(p, pg, i, n, blocks);
  };

  R.moodtracker = function (p, pg, i, n) {
    var lang = BK.lang();
    var moods = ['😀', '🙂', '😐', '😢', '😡'];
    var days = 31;
    var head = '<tr><th></th>';
    for (var d2 = 1; d2 <= days; d2++) head += '<th style="font-size:6.5pt;text-align:center;padding:.5mm">' + d2 + '</th>';
    head += '</tr>';
    var rows = moods.map(function (m) {
      var tds = '<td style="font-size:5mm;border:none">' + m + '</td>';
      for (var d3 = 0; d3 < days; d3++) tds += '<td style="border:.5pt solid #e8d4dd;width:4.6mm;height:6mm"></td>';
      return '<tr>' + tds + '</tr>';
    }).join('');
    return sheet(p, pg, i, n,
      '<table class="cal" style="margin-top:4mm">' + head + rows + '</table>' +
      '<div class="pg-sub" style="margin-top:4mm">' + (lang === 'no' ? 'Sett kryss for følelsen som passet best hver dag.' : 'Mark the feeling that fitted best each day.') + '</div>' +
      '<div style="margin-top:8mm;font-weight:800;color:#b02458;font-size:11pt">' + (lang === 'no' ? 'Notater' : 'Notes') + '</div>' +
      '<div class="lines"><div></div><div></div><div></div><div></div></div>');
  };

  R.habittracker = function (p, pg, i, n) {
    var d = pg.data || {};
    var habits = d.habits || [];
    var days = 30;
    var head = '<tr><th style="width:34mm">' + (BK.lang() === 'no' ? 'Vane' : 'Habit') + '</th>';
    for (var x = 1; x <= days; x++) head += '<th style="font-size:6pt;text-align:center;padding:.4mm">' + x + '</th>';
    head += '</tr>';
    var rows = habits.map(function (h) {
      var tds = '<td style="font-size:8.5pt">' + esc(h) + '</td>';
      for (var d4 = 0; d4 < days; d4++) tds += '<td style="border:.5pt solid #e8d4dd;width:4.4mm;height:7mm"></td>';
      return '<tr>' + tds + '</tr>';
    }).join('');
    return sheet(p, pg, i, n, '<table class="cal" style="margin-top:3mm">' + head + rows + '</table>');
  };

  /* --- Planlegger --- */
  R.month = function (p, pg, i, n) {
    var d = pg.data || {};
    var lang = BK.lang();
    var matrix = gen.monthMatrix(d.year, d.month);
    var dayNames = gen.DAYS[lang].map(function (x) { return x.slice(0, 3); });
    var head = '<tr>' + dayNames.map(function (dn) { return '<th>' + dn + '</th>'; }).join('') + '</tr>';
    var cellH = Math.max(18, Math.floor(150 / matrix.length));
    var rows = matrix.map(function (week) {
      return '<tr>' + week.map(function (day) {
        return '<td style="height:' + cellH + 'mm">' + (day || '') + '</td>';
      }).join('') + '</tr>';
    }).join('');
    return sheet(p, pg, i, n, '<table class="cal">' + head + rows + '</table>');
  };

  R.week = function (p, pg, i, n) {
    var lang = BK.lang();
    var days = gen.DAYS[lang];
    return sheet(p, pg, i, n,
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:4mm;height:100%">' +
      days.map(function (dn) {
        return '<div style="border:1pt solid #f0d4e0;border-radius:3mm;padding:3mm"><strong style="font-size:10pt;color:#b02458">' + dn + '</strong>' +
          '<div class="lines tight" style="margin-top:2mm"><div></div><div></div><div></div></div></div>';
      }).join('') +
      '<div style="border:1pt solid #d4e6f5;border-radius:3mm;padding:3mm;background:#f6fbff"><strong style="font-size:10pt;color:#1971c2">' +
      (lang === 'no' ? 'Ukens fokus' : 'Focus of the week') + '</strong>' +
      '<div class="lines tight" style="margin-top:2mm"><div></div><div></div><div></div></div></div>' +
      '</div>');
  };

  R.day = function (p, pg, i, n) {
    var lang = BK.lang();
    var hours = [];
    for (var h = 7; h <= 20; h++) hours.push((h < 10 ? '0' : '') + h + ':00');
    return sheet(p, pg, i, n,
      '<div style="display:flex;gap:6mm;height:100%">' +
      '<div style="flex:1.3">' + hours.map(function (h2) {
        return '<div style="display:flex;gap:3mm;align-items:flex-end;border-bottom:.6pt solid #e8d4dd;height:9.5mm"><span style="font-size:7.5pt;color:#9b8b93;width:9mm">' + h2 + '</span></div>';
      }).join('') + '</div>' +
      '<div style="flex:1;display:flex;flex-direction:column;gap:4mm">' +
      '<div style="border:1pt solid #f0d4e0;border-radius:3mm;padding:3mm;flex:1"><strong style="font-size:9.5pt;color:#b02458">' + (lang === 'no' ? 'Viktigst i dag' : 'Top priorities') + '</strong>' +
      '<div class="lines tight" style="margin-top:2mm"><div></div><div></div><div></div></div></div>' +
      '<div style="border:1pt solid #e6f5c8;border-radius:3mm;padding:3mm;flex:1;background:#fbfff3"><strong style="font-size:9.5pt;color:#5c940d">' + (lang === 'no' ? 'Å gjøre' : 'To do') + '</strong>' +
      '<div class="lines tight" style="margin-top:2mm"><div></div><div></div><div></div><div></div></div></div>' +
      '<div style="border:1pt solid #ffefb3;border-radius:3mm;padding:3mm;flex:1;background:#fffdf2"><strong style="font-size:9.5pt;color:#9c7a00">' + (lang === 'no' ? 'Notater' : 'Notes') + '</strong>' +
      '<div class="lines tight" style="margin-top:2mm"><div></div><div></div><div></div></div></div>' +
      '</div></div>');
  };

  R.goals = function (p, pg, i, n) {
    var lang = BK.lang();
    var boxes = lang === 'no'
      ? ['Målet mitt', 'Hvorfor er dette viktig for meg?', 'Tre steg som tar meg dit', 'Slik feirer jeg når jeg er i mål']
      : ['My goal', 'Why does this matter to me?', 'Three steps that get me there', 'How I will celebrate when I reach it'];
    return sheet(p, pg, i, n, boxes.map(function (b) {
      return '<div style="border:1pt solid #f0d4e0;border-radius:4mm;padding:4mm;margin-bottom:5mm"><strong style="font-size:10.5pt;color:#b02458">' + b + '</strong>' +
        '<div class="lines"><div></div><div></div></div></div>';
    }).join(''));
  };
})();
