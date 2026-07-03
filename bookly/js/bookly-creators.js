/* =====================================================================
   LME Bookly™ — skapere: bygger komplette prosjekter fra innstillinger.
   AI (Renate AI) skriver tekstene når API-nøkkel finnes; ellers brukes
   de innebygde tekstmalene, så alt fungerer uansett.
   + Malbiblioteket (100+ profesjonelle maler).
   ===================================================================== */
(function () {
  'use strict';
  var BK = window.BK;
  var gen = BK.gen;
  var make = (BK.make = {});

  function pg(kind, title, data) {
    return { id: BK.uid(), kind: kind, title: title || '', data: data || {} };
  }
  function lang(cfg) { return (cfg && cfg.lang) || BK.lang(); }
  function isNo(cfg) { return lang(cfg) === 'no'; }

  function coverPage(cfg, emoji) {
    return pg('cover', '', {
      title: cfg.title, subtitle: cfg.subtitle || '',
      author: cfg.author || (BK.state.user && BK.state.user.name) || '',
      emoji: emoji || '🌸', theme: cfg.coverTheme || 'pink',
    });
  }

  /* =====================================================================
     BOKSKAPER
     ===================================================================== */
  make.book = function (cfg, onProgress) {
    var no = isNo(cfg);
    var count = parseInt(cfg.pages, 10) || 24;
    var inner = Math.max(6, count - 4); // minus omslag, tittelside, mål, bakside

    function build(aiData) {
      var p = BK.newProject('book', cfg.title, cfg);
      var pages = [];
      pages.push(coverPage(cfg, '📖'));
      var story = (aiData && aiData.pages) || gen.fallbackStory(cfg, inner);
      pages.push(pg('toc', no ? 'Innhold' : 'Contents', {
        items: story.slice(0, Math.min(10, story.length)).map(function (s, i) {
          return { t: (s.heading || (no ? 'Side ' : 'Page ') + (i + 1) + ': ' + s.text.slice(0, 38) + '…'), p: i + 3 };
        }),
      }));
      story.slice(0, inner).forEach(function (s, i) {
        pages.push(pg('story', s.heading || '', { text: s.text, illustration: s.illustration || '' }));
      });
      if (cfg.goals) {
        pages.push(pg('text', no ? 'Læringsmål' : 'Learning goals', {
          text: (aiData && aiData.objectives ? aiData.objectives.join('\n• ') : cfg.goals),
        }));
      }
      pages.push(pg('backcover', '', {
        hook: (aiData && aiData.hook) || (no ? 'Hva oppdager vi i dag?' : 'What will we discover today?'),
        text: (aiData && aiData.backCover) || (aiData && aiData.description) ||
          (no ? 'Bli med ' + (cfg.characters || 'Mia og Teo') + ' på en oppdagelsesferd om ' + (cfg.topic || 'verden') + '. En bok laget for ' + (cfg.audience || 'nysgjerrige barn') + '.'
              : 'Join ' + (cfg.characters || 'Mia and Teo') + ' on a journey of discovery about ' + (cfg.topic || 'the world') + '. A book made for ' + (cfg.audience || 'curious children') + '.'),
        bio: '',
      }));
      p.pages = pages;
      p.meta = {
        description: (aiData && aiData.description) || '',
        coverConcept: (aiData && aiData.coverConcept) ||
          (no ? 'Varmt, lyst omslag med ' + (cfg.characters || 'hovedpersonene') + ' midt i ' + (cfg.topic || 'motivet') + ', myke pastellfarger.'
              : 'Warm, bright cover with ' + (cfg.characters || 'the main characters') + ' in the middle of ' + (cfg.topic || 'the scene') + ', soft pastel colors.'),
        outline: (aiData && aiData.outline) || [],
      };
      BK.touch(p);
      return p;
    }

    var sys = 'You are a professional children\'s book author for the brand Little Montessori Explorers. ' +
      'Answer ONLY with valid JSON, no markdown. Write in ' + (no ? 'Norwegian (bokmål). Follow Norwegian typography: use straight quotes, never long dashes.' : 'English.');
    var facts = 'Title: ' + cfg.title + '\nTopic: ' + (cfg.topic || '-') + '\nAudience: ' + (cfg.audience || '-') +
      '\nAge group: ' + (cfg.age || '-') + '\nCharacters: ' + (cfg.characters || '-') +
      '\nWriting style: ' + (cfg.style || 'warm, simple') + '\nTone: ' + (cfg.tone || 'curious, gentle') +
      '\nLearning goals: ' + (cfg.goals || '-') +
      (cfg.characters ? '\nIMPORTANT: Use ONLY these exact character names: ' + cfg.characters + '. Never invent, rename or add other named characters.' : '');
    var pageSpec = '{"text":"page text (1-3 sentences for picture books)","illustration":"illustration description for this page: describe ONLY the scene, action, setting and mood. Never describe character appearance, hair or clothing; the character look is locked elsewhere"}';

    function prog(s) { if (onProgress) { try { onProgress(s); } catch (e) {} } }

    /* Små bøker: ett kall. Store bøker: disposisjon først, deretter sidene
       i parallelle bolker, så det går raskt og JSON aldri blir kuttet. */
    if (inner <= 18) {
      var prompt = 'Write a complete ' + (cfg.bookType || 'children\'s picture book') + '.\n' + facts +
        '\nNumber of content pages: ' + inner + '\n' +
        'Return JSON: {"description":"2-3 sentence book description","coverConcept":"one sentence cover idea",' +
        '"hook":"short back cover hook","backCover":"3-4 sentence back cover text",' +
        '"objectives":["learning objective", ...],' +
        '"outline":["chapter/section", ...],' +
        '"pages":[' + pageSpec + ', ...exactly ' + inner + ' items]}';
      prog(no ? 'Renate AI skriver boka…' : 'Renate AI is writing the book…');
      return BK.ai.json(sys, prompt, Math.min(7000, 800 + inner * 170)).then(build, function () { return build(null); });
    }

    var CHUNK = 14;
    prog(no ? 'Lager disposisjon…' : 'Creating the outline…');
    var metaPrompt = 'Plan a complete ' + (cfg.bookType || 'children\'s picture book') + '.\n' + facts +
      '\nNumber of content pages: ' + inner + '\n' +
      'Return JSON: {"description":"2-3 sentence book description","coverConcept":"one sentence cover idea",' +
      '"hook":"short back cover hook","backCover":"3-4 sentence back cover text",' +
      '"objectives":["learning objective", ...],' +
      '"outline":["chapter/section", ...],' +
      '"beats":["one short sentence describing what happens on this page", ...exactly ' + inner + ' items]}';

    return BK.ai.json(sys, metaPrompt, Math.min(4000, 900 + inner * 30)).then(function (meta) {
      var beats = (meta.beats || []).slice(0, inner);
      while (beats.length < inner) beats.push('');
      var beatList = beats.map(function (b, i) { return (i + 1) + '. ' + b; }).join('\n');
      var calls = [];
      for (var start = 0; start < inner; start += CHUNK) {
        (function (s0) {
          var n2 = Math.min(CHUNK, inner - s0);
          var chunkPrompt = 'Book in progress: ' + (cfg.bookType || 'children\'s picture book') + '.\n' + facts +
            '\nFull page plan (' + inner + ' pages):\n' + beatList +
            '\nWrite the final text and illustration description for pages ' + (s0 + 1) + ' to ' + (s0 + n2) + ' only, following the plan.' +
            '\nReturn JSON: {"pages":[' + pageSpec + ', ...exactly ' + n2 + ' items]}';
          calls.push(BK.ai.json(sys, chunkPrompt, Math.min(6000, 500 + n2 * 170)));
        })(start);
      }
      prog(no ? 'Skriver alle ' + inner + ' sidene…' : 'Writing all ' + inner + ' pages…');
      return Promise.all(calls).then(function (parts) {
        var pages = [];
        parts.forEach(function (part) { pages = pages.concat((part && part.pages) || []); });
        pages = pages.slice(0, inner);
        if (pages.length < inner) {
          var fb = gen.fallbackStory(cfg, inner);
          while (pages.length < inner) pages.push(fb[pages.length]);
        }
        meta.pages = pages;
        return build(meta);
      });
    }).catch(function () { return build(null); });
  };

  /* =====================================================================
     ARBEIDSBOK
     ===================================================================== */
  make.workbook = function (cfg) {
    var no = isNo(cfg);
    var count = parseInt(cfg.count, 10) || 8;
    var level = cfg.age === '3-6' ? 1 : cfg.age === '6-9' ? 2 : 3;
    var p = BK.newProject('workbook', cfg.title, cfg);
    var pages = [coverPage(cfg, '📝')];
    var answers = [];

    pages.push(pg('intro', no ? 'Velkommen!' : 'Welcome!', {
      text: no
        ? 'Denne arbeidsboka handler om ' + (cfg.topic || cfg.category) + '. Jobb i ditt eget tempo, og ta pauser når du trenger det. Husk: Det viktigste er ikke å bli fort ferdig, men å forstå og ha det gøy underveis.\n\nLykke til!\n' + (cfg.author || 'Little Montessori Explorers')
        : 'This workbook is about ' + (cfg.topic || cfg.category) + '. Work at your own pace and take breaks when you need them. Remember: The goal is not to finish fast, but to understand and have fun along the way.\n\nGood luck!\n' + (cfg.author || 'Little Montessori Explorers'),
    }));

    var mathCats = ['mathematics', 'matematikk'];
    var litCats = ['literacy', 'reading', 'writing', 'lesing', 'skriving', 'sprak'];
    var isMath = mathCats.indexOf(cfg.category) !== -1;
    var isLit = litCats.indexOf(cfg.category) !== -1;

    /* Respekter temaet: "gangetabellene" skal gi gangestykker, ikke pluss/minus */
    var topicTxt = ((cfg.topic || '') + ' ' + (cfg.title || '')).toLowerCase();
    var topicOps = [];
    if (/gange|multiplikasjon|multiplication|times table/.test(topicTxt)) topicOps.push('mul');
    if (/divisjon|deling|division|divide/.test(topicTxt)) topicOps.push('div');
    if (/pluss|addisjon|addition/.test(topicTxt)) topicOps.push('add');
    if (/minus|subtraksjon|subtraction/.test(topicTxt)) topicOps.push('sub');

    for (var i = 0; i < count; i++) {
      var no_ = i + 1;
      if (isMath) {
        if (!topicOps.length && level === 1 && i % 2 === 0) {
          var set = gen.emojiSet(BK.pick(gen.EMOJI_KEYS));
          var rows = [];
          for (var r = 0; r < 6; r++) rows.push({ emoji: BK.pick(set), count: BK.rnd(1, 9) });
          pages.push(pg('counting', (no ? 'Telle og skrive ' : 'Count and write ') + no_, { rows: rows }));
          rows.forEach(function (row, ri) { answers.push({ ref: (no ? 'Ark ' : 'Sheet ') + no_ + '.' + (ri + 1), ans: String(row.count) }); });
        } else {
          var op = topicOps.length
            ? topicOps[i % topicOps.length]
            : ['add', 'sub', 'mix', 'mul'][i % (level === 1 ? 2 : 4)];
          var probs = gen.mathProblems(level, op, 16);
          pages.push(pg('mathsheet', (no ? 'Regneark ' : 'Math sheet ') + no_, { problems: probs }));
          probs.forEach(function (prb, pi) { answers.push({ ref: (no ? 'Ark ' : 'Sheet ') + no_ + '.' + (pi + 1), ans: prb.q.replace(' =', ' = ') + prb.a }); });
        }
      } else if (isLit) {
        var bankKey = gen.WORDBANK_KEYS[i % gen.WORDBANK_KEYS.length];
        var words = BK.shuffle(gen.wordbank(bankKey)).slice(0, level === 1 ? 4 : 6);
        if (i % 3 === 0) {
          pages.push(pg('tracing', (no ? 'Sporing ' : 'Tracing ') + no_, { items: level === 1 ? words.map(function (w) { return w.slice(0, 5); }) : words }));
        } else if (i % 3 === 1) {
          var emojis = gen.emojiSet(bankKey in {dyr:1,natur:1,mat:1} ? bankKey : 'natur');
          var bankAll = gen.wordbank(bankKey);
          var pairs = words.map(function (w) {
            return { left: BK.cap(w.toLowerCase()), right: BK.cap(w.toLowerCase()), icon: emojis[bankAll.indexOf(w)] || '⭐' };
          });
          pages.push(pg('matching', (no ? 'Koble sammen ' : 'Match ') + no_, {
            pairs: pairs, shuffled: BK.shuffle(pairs.map(function (x) { return x.right; })),
          }));
        } else {
          var ws = gen.wordsearch(words, level === 1 ? 8 : 11, level >= 2, level === 3);
          pages.push(pg('wordsearch', (no ? 'Ordleting ' : 'Word search ') + no_, { ws: ws }));
        }
      } else {
        // Fag-tema: kunnskapsark med spørsmål + skriveplass (AI kan forbedre senere)
        pages.push(pg('journal', (no ? 'Oppgaveark ' : 'Worksheet ') + no_, {
          prompts: no
            ? ['Hva vet du om ' + (cfg.topic || 'temaet') + ' fra før?', 'Skriv eller tegn tre ting du har lært.', 'Hva lurer du fortsatt på?']
            : ['What do you already know about ' + (cfg.topic || 'the topic') + '?', 'Write or draw three things you have learned.', 'What are you still wondering about?'],
        }));
      }
    }

    pages.push(pg('journal', no ? 'Oppsummering' : 'Review', {
      prompts: no
        ? ['Det viktigste jeg har lært i denne boka', 'Dette vil jeg øve mer på', 'Dette var jeg god til!']
        : ['The most important thing I learned in this book', 'This is what I want to practice more', 'This is what I was good at!'],
    }));
    if (answers.length) pages.push(pg('answers', no ? 'Fasit' : 'Answer key', { items: answers }));
    pages.push(pg('certificate', '', {
      heading: no ? 'Diplom' : 'Certificate',
      reason: no
        ? 'har fullført arbeidsboka "' + cfg.title + '" med innsats og nysgjerrighet.'
        : 'has completed the workbook "' + cfg.title + '" with effort and curiosity.',
    }));
    p.pages = pages;
    BK.touch(p);
    return Promise.resolve(p);
  };

  /* =====================================================================
     AKTIVITETSBOK
     ===================================================================== */
  make.activity = function (cfg) {
    var no = isNo(cfg);
    var p = BK.newProject('activity', cfg.title, cfg);
    var theme = cfg.theme || 'natur';
    var count = parseInt(cfg.count, 10) || 10;
    var diff = cfg.difficulty || 'medium';
    var types = cfg.types && cfg.types.length ? cfg.types : ['matching', 'cutpaste', 'tracing', 'pattern', 'memory', 'spotdiff', 'findobject', 'maze'];
    var pages = [coverPage(cfg, '✂️')];
    var set = gen.emojiSet(theme);
    var wbKey = theme in { dyr: 1, natur: 1, mat: 1 } ? theme : 'natur';

    for (var i = 0; i < count; i++) {
      var t = types[i % types.length];
      var nr = ' ' + (i + 1);
      if (t === 'matching') {
        var words = BK.shuffle(gen.wordbank(wbKey)).slice(0, 6);
        var bank = gen.wordbank(wbKey);
        var em = gen.emojiSet(wbKey);
        var pairs = words.map(function (w) { return { left: BK.cap(w.toLowerCase()), right: BK.cap(w.toLowerCase()), icon: em[bank.indexOf(w)] || '⭐' }; });
        pages.push(pg('matching', (no ? 'Koble sammen' : 'Match it') + nr, { pairs: pairs, shuffled: BK.shuffle(pairs.map(function (x) { return x.right; })) }));
      } else if (t === 'cutpaste') {
        pages.push(pg('cutpaste', (no ? 'Klipp og lim' : 'Cut and paste') + nr, {
          items: BK.shuffle(set).slice(0, 6),
          boxes: no ? ['Stor', 'Liten', 'Ute', 'Inne'] : ['Big', 'Small', 'Outside', 'Inside'],
        }));
      } else if (t === 'tracing') {
        pages.push(pg('tracing', (no ? 'Sporing' : 'Tracing') + nr, { items: BK.shuffle(gen.wordbank(wbKey)).slice(0, 5) }));
      } else if (t === 'pattern') {
        var rows = [];
        for (var r = 0; r < 5; r++) {
          var a = BK.pick(set), b = BK.pick(set);
          var pat = diff === 'easy' ? [a, b, a, b, a] : diff === 'hard' ? [a, a, b, a, a, b, a] : [a, b, b, a, b, b];
          rows.push({ seq: pat });
        }
        pages.push(pg('pattern', (no ? 'Mønster' : 'Patterns') + nr, { rows: rows }));
      } else if (t === 'memory') {
        var pairsArr = BK.shuffle(set).slice(0, 8);
        pages.push(pg('memory', (no ? 'Memory-spill' : 'Memory game') + nr, { cards: BK.shuffle(pairsArr.concat(pairsArr)) }));
      } else if (t === 'spotdiff') {
        var nDiff = diff === 'easy' ? 3 : diff === 'hard' ? 7 : 5;
        pages.push(pg('spotdiff', (no ? 'Finn forskjellene' : 'Spot the difference') + nr, { scene: gen.spotScene(theme, nDiff, gen.seed()), diffs: nDiff }));
      } else if (t === 'findobject') {
        pages.push(pg('findobject', (no ? 'Finn og tell' : 'Find and count') + nr, { scene: gen.findScene(theme, BK.shuffle(set).slice(0, 3), gen.seed()) }));
      } else if (t === 'maze') {
        var dims = diff === 'easy' ? [8, 8] : diff === 'hard' ? [16, 16] : [12, 12];
        pages.push(pg('maze', (no ? 'Labyrint' : 'Maze') + nr, { dims: dims, seed: gen.seed(), mm: 125 }));
      }
    }
    pages.push(pg('certificate', '', {
      reason: no ? 'har fullført alle aktivitetene i "' + cfg.title + '"!' : 'has completed all the activities in "' + cfg.title + '"!',
    }));
    p.pages = pages;
    BK.touch(p);
    return Promise.resolve(p);
  };

  /* =====================================================================
     PUSLERIER
     ===================================================================== */
  make.puzzle = function (cfg) {
    var no = isNo(cfg);
    var p = BK.newProject('puzzle', cfg.title, cfg);
    var diff = cfg.difficulty || 'medium';
    var count = parseInt(cfg.count, 10) || 10;
    var kinds = cfg.kinds && cfg.kinds.length ? cfg.kinds : ['wordsearch', 'crossword', 'sudoku', 'maze', 'numberpuzzle'];
    var wbKey = cfg.wordTheme || 'natur';
    var pages = [coverPage(cfg, '🧩')];
    var solutions = [];

    for (var i = 0; i < count; i++) {
      var k = kinds[i % kinds.length];
      var nr = ' ' + (i + 1);
      if (k === 'wordsearch') {
        var words = BK.shuffle(gen.wordbank(wbKey)).slice(0, diff === 'easy' ? 6 : diff === 'hard' ? 12 : 8);
        var size = diff === 'easy' ? 9 : diff === 'hard' ? 14 : 12;
        var ws = gen.wordsearch(words, size, diff !== 'easy', diff === 'hard');
        pages.push(pg('wordsearch', (no ? 'Ordleting' : 'Word search') + nr, { ws: ws }));
      } else if (k === 'crossword') {
        var bank = gen.wordbank(wbKey);
        var em = gen.emojiSet(wbKey in { dyr: 1, natur: 1, mat: 1 } ? wbKey : 'natur');
        var entries = BK.shuffle(bank.map(function (w, ix) { return { word: w, clue: em[ix] || '⭐' }; })).slice(0, diff === 'easy' ? 5 : 8);
        var cw = gen.crossword(entries);
        if (cw) {
          pages.push(pg('crossword', (no ? 'Kryssord' : 'Crossword') + nr, { cw: cw }));
          cw.across.concat(cw.down).forEach(function (c2) {
            solutions.push({ ref: (no ? 'Kryssord' : 'Crossword') + nr + ' · ' + c2.n, ans: c2.word });
          });
        }
      } else if (k === 'sudoku') {
        if (diff === 'easy' && i % 2 === 0) {
          var s4 = gen.sudoku4(gen.seed());
          pages.push(pg('sudoku', (no ? 'Mini-sudoku' : 'Mini sudoku') + nr, { puzzle: s4.puzzle, solution: s4.solution }));
          solutions.push({ ref: (no ? 'Mini-sudoku' : 'Mini sudoku') + nr, ans: s4.solution.map(function (r2) { return r2.join(''); }).join(' / ') });
        } else {
          var s9 = gen.sudoku(diff, gen.seed());
          pages.push(pg('sudoku', 'Sudoku' + nr, { puzzle: s9.puzzle, solution: s9.solution }));
          solutions.push({ ref: 'Sudoku' + nr, ans: s9.solution.map(function (r3) { return r3.join(''); }).join(' / ') });
        }
      } else if (k === 'maze') {
        var dims = diff === 'easy' ? [10, 10] : diff === 'hard' ? [20, 20] : [14, 14];
        pages.push(pg('maze', (no ? 'Labyrint' : 'Maze') + nr, { dims: dims, seed: gen.seed(), mm: 130 }));
      } else if (k === 'numberpuzzle') {
        var np = gen.numberPuzzle(diff, gen.seed());
        pages.push(pg('numberpuzzle', (no ? 'Tallpuslespill' : 'Number puzzle') + nr, np));
        solutions.push({ ref: (no ? 'Tallpuslespill' : 'Number puzzle') + nr, ans: np.solution.map(function (r4) { return r4.join(' '); }).join(' / ') });
      }
    }
    if (solutions.length) pages.push(pg('answers', no ? 'Fasit' : 'Solutions', { items: solutions }));
    p.pages = pages;
    BK.touch(p);
    return Promise.resolve(p);
  };

  /* =====================================================================
     FLASHKORT
     ===================================================================== */
  make.flashcards = function (cfg) {
    var no = isNo(cfg);
    var p = BK.newProject('flashcards', cfg.title, cfg);
    var mode = cfg.mode || 'vocab';
    var pages = [coverPage(cfg, '🃏')];
    var items = [];

    if (cfg.itemsText) {
      cfg.itemsText.split('\n').forEach(function (line) {
        var m = line.split(/=|—|–|->/);
        var word = (m[0] || '').trim();
        if (!word) return;
        items.push({ main: word, sub: (m[1] || '').trim(), emoji: (m[2] || '').trim() });
      });
    }
    if (!items.length) {
      var bankKey = cfg.theme || 'dyr';
      var bNo = (bankKey in { dyr: 1, natur: 1, mat: 1, kropp: 1, familie: 1, skole: 1 }) ? bankKey : 'dyr';
      var bank = gen.wordbank(bNo);
      var em = gen.emojiSet(bNo in { dyr: 1, natur: 1, mat: 1 } ? bNo : 'natur');
      bank.forEach(function (w, ix) {
        items.push({ main: BK.cap(w.toLowerCase()), sub: '', emoji: em[ix] || '' });
      });
    }

    var perPage = mode === 'threepart' ? 6 : 8;
    var cols = 2, rows = mode === 'threepart' ? 3 : 4;

    if (mode === 'threepart') {
      // Montessori trepartskort: bilde+navn, bare bilde, bare navn
      var cards = [];
      items.forEach(function (it) {
        cards.push({ emoji: it.emoji, main: it.main, big: false });
        cards.push({ emoji: it.emoji });
        cards.push({ main: it.main, big: true });
      });
      for (var i = 0; i < cards.length; i += perPage) {
        pages.push(pg('cardsheet', (no ? 'Trepartskort, ark ' : 'Three-part cards, sheet ') + (Math.floor(i / perPage) + 1),
          { cards: cards.slice(i, i + perPage), cols: cols, rows: rows }));
      }
    } else {
      for (var j = 0; j < items.length; j += perPage) {
        var chunk = items.slice(j, j + perPage);
        pages.push(pg('cardsheet', (no ? 'Kort, ark ' : 'Cards, sheet ') + (Math.floor(j / perPage) + 1) + (no ? ' (forside)' : ' (front)'),
          { cards: chunk.map(function (it) { return { emoji: it.emoji, main: it.main, big: !it.emoji }; }), cols: cols, rows: rows }));
        if (chunk.some(function (it) { return it.sub; })) {
          // bakside: speilvendt kolonneorden for dobbeltsidig utskrift
          var backs = [];
          for (var r2 = 0; r2 < rows; r2++) {
            var rowItems = chunk.slice(r2 * cols, r2 * cols + cols).reverse();
            while (rowItems.length < cols) rowItems.push({});
            backs = backs.concat(rowItems);
          }
          pages.push(pg('cardsheet', (no ? 'Kort, ark ' : 'Cards, sheet ') + (Math.floor(j / perPage) + 1) + (no ? ' (bakside)' : ' (back)'),
            { cards: backs.map(function (it) { return { main: it.sub || '', big: true }; }), cols: cols, rows: rows }));
        }
      }
    }
    var instr = no
      ? 'Skriv ut på tykt papir (200 g eller mer), klipp langs de stiplede linjene, og laminer gjerne kortene så de varer lenge.'
      : 'Print on thick paper (200 gsm or more), cut along the dashed lines, and laminate the cards if you want them to last.';
    pages.splice(1, 0, pg('intro', no ? 'Slik bruker du kortene' : 'How to use the cards', { text: instr }));
    p.pages = pages;
    BK.touch(p);
    return Promise.resolve(p);
  };

  /* =====================================================================
     FARGELEGGINGSBOK
     ===================================================================== */
  make.coloring = function (cfg) {
    var no = isNo(cfg);
    var p = BK.newProject('coloring', cfg.title, cfg);
    var count = parseInt(cfg.count, 10) || 12;
    var theme = cfg.theme || 'natur';
    var pages = [coverPage(cfg, '🎨')];
    var THEMES = {
      dyr: { no: ['en vennlig katt i en hage', 'en hundevalp som leker med en ball', 'en hest på en blomstereng', 'en ugle på en gren i måneskinn', 'en bjørnefamilie ved en elv', 'en rev i høstskogen'], en: ['a friendly cat in a garden', 'a puppy playing with a ball', 'a horse in a flower meadow', 'an owl on a branch in moonlight', 'a bear family by a river', 'a fox in the autumn forest'] },
      natur: { no: ['et stort tre med detaljerte blader', 'en blomstereng med sommerfugler', 'fjell og en sol med mønster', 'en soppfamilie i skogen', 'bølger og fisker i havet', 'en hage med grønnsaker'], en: ['a big tree with detailed leaves', 'a flower meadow with butterflies', 'mountains and a patterned sun', 'a mushroom family in the forest', 'waves and fish in the sea', 'a vegetable garden'] },
      fantasi: { no: ['en snill drage foran et slott', 'en enhjørning under en regnbue', 'en fe i en blomsterhage', 'et flyvende teppe over byen', 'en havfrue blant koraller', 'en trollmannshatt med stjerner'], en: ['a kind dragon in front of a castle', 'a unicorn under a rainbow', 'a fairy in a flower garden', 'a flying carpet over the city', 'a mermaid among corals', 'a wizard hat with stars'] },
      kjoretoy: { no: ['en traktor på en bondegård', 'et damplokomotiv med vogner', 'en brannbil i full fart', 'en seilbåt på havet', 'et fly over skyene', 'en gravemaskin på byggeplass'], en: ['a tractor on a farm', 'a steam train with wagons', 'a fire truck on its way', 'a sailboat on the sea', 'a plane above the clouds', 'an excavator on a building site'] },
      arstider: { no: ['høstblader som virvler i vinden', 'en snømann med skjerf og lue', 'vårblomster som titter opp av jorda', 'en strand med skjell og sandslott', 'et epletre med modne epler', 'regndråper og en paraply'], en: ['autumn leaves swirling in the wind', 'a snowman with scarf and hat', 'spring flowers peeking out of the soil', 'a beach with shells and a sandcastle', 'an apple tree with ripe apples', 'raindrops and an umbrella'] },
      laering: { no: ['alfabetet gjemt i en hage', 'tall fra 1 til 10 med små figurer', 'geometriske former som bygger en by', 'en jordklode med dyr fra hele verden', 'sola og planetene', 'årstidshjulet med fire deler'], en: ['the alphabet hidden in a garden', 'numbers 1 to 10 with little figures', 'geometric shapes building a city', 'a globe with animals from around the world', 'the sun and the planets', 'the wheel of seasons in four parts'] },
    };
    var ideas = (THEMES[theme] || THEMES.natur)[no ? 'no' : 'en'];
    for (var i = 0; i < count; i++) {
      if (i % 2 === 0) {
        pages.push(pg('mandala', '', { seed: gen.seed(), mm: 150 }));
      } else {
        var idea = ideas[(Math.floor(i / 2)) % ideas.length];
        pages.push(pg('colorprompt', '', {
          idea: BK.cap(idea),
          prompt: 'black and white coloring book page, ' + idea + ', clean bold outlines, no shading, white background, kid friendly, printable',
        }));
      }
    }
    pages.push(pg('backcover', '', {
      hook: no ? 'Fargelegg, pust og skap!' : 'Color, breathe and create!',
      text: no
        ? count + ' fargeleggingssider med ro og kreativitet. Mandalaer og motiver laget for små og store hender.'
        : count + ' coloring pages full of calm and creativity. Mandalas and artwork made for small and big hands.',
    }));
    p.pages = pages;
    BK.touch(p);
    return Promise.resolve(p);
  };

  /* =====================================================================
     JOURNAL
     ===================================================================== */
  make.journal = function (cfg) {
    var no = isNo(cfg);
    var p = BK.newProject('journal', cfg.title, cfg);
    var kind = cfg.kind || 'gratitude';
    var count = parseInt(cfg.count, 10) || 14;
    var pages = [coverPage(cfg, '📔')];
    var bankG = gen.GRATITUDE[no ? 'no' : 'en'];
    var bankR = gen.REFLECTION[no ? 'no' : 'en'];

    var intro = {
      gratitude: no ? 'Takknemlighet er en muskel: jo oftere du bruker den, jo sterkere blir den. Skriv litt hver dag, det trenger ikke være perfekt.' : 'Gratitude is a muscle: the more you use it, the stronger it gets. Write a little every day, it does not have to be perfect.',
      reflection: no ? 'Refleksjon gjør erfaring om til læring. Bruk noen minutter hver kveld på å se tilbake på dagen.' : 'Reflection turns experience into learning. Spend a few minutes every evening looking back at your day.',
      wellness: no ? 'Denne journalen hjelper deg å legge merke til søvn, energi og humør, små steg mot bedre balanse.' : 'This journal helps you notice sleep, energy and mood, small steps towards better balance.',
      teacher: no ? 'En lærerjournal for observasjoner, planer og refleksjoner fra klasserommet.' : 'A teacher journal for observations, plans and reflections from the classroom.',
      student: no ? 'Din egen bok for tanker, mål og det du lærer, hver dag.' : 'Your very own book for thoughts, goals and what you learn, every day.',
      daily: no ? 'En enkel dagbok: litt hver dag blir mye over tid.' : 'A simple daily journal: a little every day adds up.',
    };
    pages.push(pg('intro', no ? 'Om denne journalen' : 'About this journal', { text: intro[kind] || intro.daily }));

    for (var i = 0; i < count; i++) {
      var prompts;
      if (kind === 'gratitude') prompts = [bankG[i % bankG.length], bankG[(i + 3) % bankG.length]];
      else if (kind === 'reflection') prompts = [bankR[i % bankR.length], bankR[(i + 2) % bankR.length]];
      else if (kind === 'wellness') prompts = no
        ? ['Slik sov jeg i natt', 'Energinivået mitt i dag (1 til 10), og hvorfor', 'En ting jeg gjorde for kroppen min']
        : ['How I slept last night', 'My energy level today (1 to 10), and why', 'One thing I did for my body'];
      else if (kind === 'teacher') prompts = no
        ? ['Observasjoner fra i dag', 'Hva fungerte godt i undervisningen?', 'Justeringer til i morgen']
        : ['Observations from today', 'What worked well in my teaching?', 'Adjustments for tomorrow'];
      else if (kind === 'student') prompts = no
        ? ['Dette lærte jeg i dag', 'Dette var gøy eller vanskelig', 'I morgen vil jeg…']
        : ['This is what I learned today', 'This was fun or difficult', 'Tomorrow I want to…'];
      else prompts = [no ? 'Dagen i dag' : 'Today', bankG[i % bankG.length]];
      pages.push(pg('journal', (no ? 'Dag ' : 'Day ') + (i + 1), { prompts: prompts }));
    }
    if (kind === 'wellness' || kind === 'daily') pages.push(pg('moodtracker', no ? 'Humørlogg' : 'Mood tracker', {}));
    p.pages = pages;
    BK.touch(p);
    return Promise.resolve(p);
  };

  /* =====================================================================
     PLANLEGGER
     ===================================================================== */
  make.planner = function (cfg) {
    var no = isNo(cfg);
    var p = BK.newProject('planner', cfg.title, cfg);
    var kind = cfg.kind || 'weekly';
    var year = parseInt(cfg.year, 10) || new Date().getFullYear();
    var startMonth = parseInt(cfg.startMonth, 10) || 0;
    var months = Math.min(12, parseInt(cfg.months, 10) || (kind === 'monthly' ? 12 : 3));
    var pages = [coverPage(cfg, '🗓️')];

    if (kind === 'monthly' || kind === 'teacher' || kind === 'student') {
      for (var m = 0; m < months; m++) {
        var mm = (startMonth + m) % 12;
        var yy = year + Math.floor((startMonth + m) / 12);
        pages.push(pg('month', gen.MONTHS[no ? 'no' : 'en'][mm] + ' ' + yy, { year: yy, month: mm }));
        if (kind === 'teacher') pages.push(pg('journal', (no ? 'Månedens planer · ' : 'Plans for ') + gen.MONTHS[no ? 'no' : 'en'][mm], {
          prompts: no ? ['Mål for måneden', 'Temaer og opplegg', 'Elever som trenger ekstra oppfølging'] : ['Goals for the month', 'Themes and lesson plans', 'Students who need extra follow-up'],
        }));
      }
    }
    if (kind === 'weekly' || kind === 'teacher' || kind === 'student') {
      var weeks = parseInt(cfg.weeks, 10) || (kind === 'weekly' ? 12 : 4);
      for (var w = 0; w < weeks; w++) pages.push(pg('week', (no ? 'Uke ' : 'Week ') + (w + 1), {}));
    }
    if (kind === 'daily') {
      var daysN = parseInt(cfg.days, 10) || 14;
      for (var d = 0; d < daysN; d++) pages.push(pg('day', (no ? 'Dag ' : 'Day ') + (d + 1), {}));
    }
    if (kind === 'goals') {
      for (var g = 0; g < 6; g++) pages.push(pg('goals', (no ? 'Mål ' : 'Goal ') + (g + 1), {}));
      pages.push(pg('habittracker', no ? 'Vanesporing, 30 dager' : 'Habit tracker, 30 days', {
        habits: no ? ['', '', '', '', '', ''] : ['', '', '', '', '', ''],
      }));
    }
    if (kind === 'habits') {
      var habits = (cfg.habitsText || '').split('\n').map(function (s) { return s.trim(); }).filter(Boolean);
      if (!habits.length) habits = no
        ? ['Drikke vann', 'Lese 10 minutter', 'Ut i frisk luft', 'Legge meg i tide', 'Rydde 5 minutter', 'Si noe snilt']
        : ['Drink water', 'Read 10 minutes', 'Fresh air', 'Bed on time', 'Tidy 5 minutes', 'Say something kind'];
      for (var hm = 0; hm < Math.max(1, months); hm++) {
        pages.push(pg('habittracker', (no ? 'Vanesporing, måned ' : 'Habit tracker, month ') + (hm + 1), { habits: habits }));
      }
      pages.push(pg('goals', no ? 'Mine mål' : 'My goals', {}));
    }
    p.pages = pages;
    BK.touch(p);
    return Promise.resolve(p);
  };

  /* =====================================================================
     MALBIBLIOTEK — 100+ profesjonelle maler
     Hver mal: forhåndsutfylt oppsett som åpner riktig skaper.
     ===================================================================== */
  var T = [];
  function tpl(cat, icon, tint, nameNo, nameEn, descNo, descEn, type, cfg) {
    T.push({ id: 'tpl' + T.length, cat: cat, icon: icon, tint: tint, name: [nameNo, nameEn], desc: [descNo, descEn], type: type, cfg: cfg });
  }
  BK.TPL_CATS = {
    childrens:  ['Barnebøker', "Children's books"],
    story:      ['Fortellinger', 'Story books'],
    edu:        ['Pedagogiske bøker', 'Educational books'],
    workbooks:  ['Arbeidsbøker', 'Workbooks'],
    montessori: ['Montessori (læreplanen)', 'Montessori (curriculum)'],
    lk20:       ['Skole (læreplanen)', 'School (curriculum)'],
    flashcards: ['Flashkort', 'Flashcards'],
    activity:   ['Aktivitetsbøker', 'Activity books'],
    puzzles:    ['Puslebøker', 'Puzzle books'],
    coloring:   ['Fargelegging', 'Coloring books'],
    journals:   ['Journaler', 'Journals'],
    planners:   ['Planleggere', 'Planners'],
    homeschool: ['Hjemmeskole', 'Homeschool'],
    language:   ['Språklæring', 'Language learning'],
    teacher:    ['Lærerressurser', 'Teacher resources'],
  };

  /* Barnebøker (8) */
  tpl('childrens', '🌳', 'tint-lime', 'Skogens hemmeligheter', 'Secrets of the Forest', 'Bildebok om livet i skogen for 3-6 år.', 'Picture book about forest life for ages 3-6.', 'book', { bookType: 'picture book', topic: 'skogen og dyrene som bor der', age: '3-6', pages: 24, characters: 'Mia og Teo' });
  tpl('childrens', '🌊', 'tint-blue', 'Havets vidundere', 'Wonders of the Sea', 'Utforsk havet med enkle fakta og undring.', 'Explore the ocean with simple facts and wonder.', 'book', { bookType: 'nature book', topic: 'havet og dyrene i det', age: '3-6', pages: 24 });
  tpl('childrens', '🐞', 'tint-pink', 'Småkrypsafari', 'Minibeast Safari', 'Bli med på insektjakt i hagen.', 'Join a bug hunt in the garden.', 'book', { bookType: 'picture book', topic: 'insekter og småkryp i hagen', age: '3-6', pages: 24 });
  tpl('childrens', '🌙', 'tint-lemon', 'God natt, lille venn', 'Good Night, Little Friend', 'Rolig leggetidsbok med myk rytme.', 'Calm bedtime book with a soft rhythm.', 'book', { bookType: 'picture book', topic: 'kveldsstell og det å falle til ro', age: '0-3', pages: 12, tone: 'rolig og trygg' });
  tpl('childrens', '🚜', 'tint-lime', 'På bondegården', 'On the Farm', 'Dyr, traktorer og livet på gården.', 'Animals, tractors and life on the farm.', 'book', { bookType: 'picture book', topic: 'livet på en bondegård', age: '3-6', pages: 24 });
  tpl('childrens', '❄️', 'tint-blue', 'Vinterens magi', 'The Magic of Winter', 'Snø, spor og stille vinterdager.', 'Snow, tracks and quiet winter days.', 'book', { bookType: 'picture book', topic: 'vinter, snø og dyrespor', age: '3-6', pages: 24 });
  tpl('childrens', '💗', 'tint-pink', 'Følelsene mine', 'My Feelings', 'En varm bok om å kjenne igjen følelser.', 'A warm book about recognising feelings.', 'book', { bookType: 'educational book', topic: 'følelser og hvordan de kjennes i kroppen', age: '3-6', pages: 24, goals: 'sette ord på følelser' });
  tpl('childrens', '🍎', 'tint-lemon', 'Fra frø til eple', 'From Seed to Apple', 'Følg eplet fra blomst til matpakke.', 'Follow the apple from blossom to lunchbox.', 'book', { bookType: 'fact book', topic: 'hvordan frukt vokser, fra frø til ferdig eple', age: '6-9', pages: 24 });

  /* Fortellinger (8) */
  tpl('story', '🏕️', 'tint-lime', 'Den store teltturen', 'The Big Camping Trip', 'Eventyrfortelling om en natt i skogen.', 'Adventure story about a night in the forest.', 'book', { bookType: 'story book', topic: 'en telttur med uventede oppdagelser', age: '6-9', pages: 32 });
  tpl('story', '🗺️', 'tint-lemon', 'Skattekartet', 'The Treasure Map', 'En skattejakt der vennskap er gullet.', 'A treasure hunt where friendship is the gold.', 'book', { bookType: 'story book', topic: 'et gammelt kart og en skattejakt i nabolaget', age: '6-9', pages: 32 });
  tpl('story', '🐉', 'tint-pink', 'Dragen som ikke kunne fly', 'The Dragon Who Could Not Fly', 'Om mot, øvelse og å tro på seg selv.', 'About courage, practice and believing in yourself.', 'book', { bookType: 'story book', topic: 'en liten drage som øver seg på å fly', age: '3-6', pages: 24 });
  tpl('story', '🚀', 'tint-blue', 'Reisen til stjernene', 'Journey to the Stars', 'Romeventyr med fakta underveis.', 'A space adventure with facts along the way.', 'book', { bookType: 'story book', topic: 'en reise gjennom solsystemet', age: '6-9', pages: 32 });
  tpl('story', '🧦', 'tint-lemon', 'Sokken som forsvant', 'The Missing Sock', 'Humoristisk hverdagsmysterium.', 'A funny everyday mystery.', 'book', { bookType: 'story book', topic: 'mysteriet med sokken som blir borte i vasken', age: '3-6', pages: 24, tone: 'leken og humoristisk' });
  tpl('story', '🌈', 'tint-pink', 'Regnbuens gåte', 'The Riddle of the Rainbow', 'Et fargerikt eventyr om vær og lys.', 'A colorful adventure about weather and light.', 'book', { bookType: 'story book', topic: 'hvordan en regnbue blir til', age: '6-9', pages: 24 });
  tpl('story', '🏰', 'tint-blue', 'Det vennlige slottet', 'The Friendly Castle', 'Riddere, vennskap og gode gjerninger.', 'Knights, friendship and good deeds.', 'book', { bookType: 'story book', topic: 'et slott der alle hjelper hverandre', age: '3-6', pages: 24 });
  tpl('story', '🐚', 'tint-lime', 'Stranden om sommeren', 'The Beach in Summer', 'En sommerdag full av små funn.', 'A summer day full of small discoveries.', 'book', { bookType: 'story book', topic: 'en dag på stranden med skjell og krabber', age: '3-6', pages: 24 });

  /* Pedagogiske bøker (8) */
  tpl('edu', '🔢', 'tint-blue', 'Tallene 1 til 10', 'Numbers 1 to 10', 'Telle-bok med konkreter fra hverdagen.', 'Counting book with everyday objects.', 'book', { bookType: 'educational book', topic: 'tallene 1 til 10 med ting fra hverdagen', age: '3-6', pages: 24, goals: 'tallforståelse 1 til 10' });
  tpl('edu', '🔤', 'tint-pink', 'Alfabetreisen', 'The Alphabet Journey', 'En bokstav per oppslag, med lyder og ord.', 'One letter per spread, with sounds and words.', 'book', { bookType: 'educational book', topic: 'alfabetet med en bokstav per side', age: '3-6', pages: 32, goals: 'bokstavkunnskap og språklyder' });
  tpl('edu', '🕐', 'tint-lemon', 'Klokka og tiden', 'The Clock and Time', 'Lær klokka steg for steg.', 'Learn to tell the time step by step.', 'book', { bookType: 'educational book', topic: 'klokka, timer og dagsrytme', age: '6-9', pages: 24, goals: 'lese klokka, hel og halv time' });
  tpl('edu', '🌍', 'tint-lime', 'Verdensdelene', 'The Continents', 'Montessori-inspirert reise rundt jorda.', 'Montessori-inspired trip around the globe.', 'book', { bookType: 'educational book', topic: 'de sju verdensdelene og dyrene der', age: '6-9', pages: 32, goals: 'kjenne igjen verdensdelene' });
  tpl('edu', '🌦️', 'tint-blue', 'Været rundt oss', 'The Weather Around Us', 'Sol, regn, vind og skyer forklart enkelt.', 'Sun, rain, wind and clouds explained simply.', 'book', { bookType: 'educational book', topic: 'værtyper og hvordan vær blir til', age: '6-9', pages: 24 });
  tpl('edu', '🫀', 'tint-pink', 'Kroppen min', 'My Body', 'Kroppens deler og hva de gjør.', 'The parts of the body and what they do.', 'book', { bookType: 'educational book', topic: 'kroppens deler og funksjoner', age: '3-6', pages: 24 });
  tpl('edu', '♻️', 'tint-lime', 'Vi tar vare på jorda', 'We Care for the Earth', 'Gjenbruk og miljø for de minste.', 'Recycling and the environment for young children.', 'book', { bookType: 'educational book', topic: 'kildesortering, gjenbruk og å ta vare på naturen', age: '3-6', pages: 24 });
  tpl('edu', '🌱', 'tint-lemon', 'Livssykluser', 'Life Cycles', 'Frø, sommerfugl og frosk: livets sirkler.', 'Seed, butterfly and frog: the circles of life.', 'book', { bookType: 'educational book', topic: 'livssykluser hos planter og dyr', age: '6-9', pages: 32 });

  /* Arbeidsbøker (9) */
  tpl('workbooks', '➕', 'tint-blue', 'Pluss og minus 0-20', 'Add & Subtract 0-20', 'Regnetrening med fasit og diplom.', 'Math practice with answer key and certificate.', 'workbook', { category: 'mathematics', topic: 'pluss og minus opp til 20', age: '6-9', count: 10 });
  tpl('workbooks', '✖️', 'tint-lemon', 'Gangetabellene', 'Times Tables', 'Multiplikasjon 1-10 med variasjon.', 'Multiplication 1-10 with variety.', 'workbook', { category: 'mathematics', topic: 'gangetabellene 1 til 10', age: '9-12', count: 12 });
  tpl('workbooks', '🔢', 'tint-pink', 'Telle og skrive tall', 'Count and Write', 'Førskole-matte med telling og tall.', 'Preschool math with counting and numerals.', 'workbook', { category: 'mathematics', topic: 'telle til 10 og skrive tall', age: '3-6', count: 8 });
  tpl('workbooks', '✍️', 'tint-lime', 'Sporing og skrift', 'Tracing and Writing', 'Skriveforberedelse med sporing.', 'Pre-writing practice with tracing.', 'workbook', { category: 'writing', topic: 'sporing av bokstaver og ord', age: '3-6', count: 10 });
  tpl('workbooks', '📖', 'tint-blue', 'Lese og forstå', 'Read and Understand', 'Lesetrening med ordleting og kobling.', 'Reading practice with word searches and matching.', 'workbook', { category: 'reading', topic: 'lesing av vanlige ord', age: '6-9', count: 10 });
  tpl('workbooks', '🧪', 'tint-lemon', 'Naturfagsboka', 'The Science Workbook', 'Utforskende oppgaver om naturen.', 'Exploratory tasks about nature.', 'workbook', { category: 'science', topic: 'naturen rundt oss', age: '6-9', count: 8 });
  tpl('workbooks', '🗺️', 'tint-lime', 'Geografi for nysgjerrige', 'Geography for the Curious', 'Kart, land og verdensdeler.', 'Maps, countries and continents.', 'workbook', { category: 'geography', topic: 'kart og verdensdeler', age: '9-12', count: 8 });
  tpl('workbooks', '🎒', 'tint-pink', 'Klar for skolen', 'Ready for School', 'Førskolepakke: tall, bokstaver og mønster.', 'Preschool pack: numbers, letters and patterns.', 'workbook', { category: 'literacy', topic: 'skoleforberedelse', age: '3-6', count: 12 });
  tpl('workbooks', '🌸', 'tint-pink', 'Montessori hjemme', 'Montessori at Home', 'Montessori-inspirerte oppgaver for hjemmebruk.', 'Montessori-inspired tasks for home.', 'workbook', { category: 'montessori', topic: 'praktisk liv og sansene', age: '3-6', count: 10 });

  /* Flashkort (8) */
  tpl('flashcards', '🐱', 'tint-pink', 'Dyrekort', 'Animal Cards', 'Trepartskort med dyr, Montessoristil.', 'Three-part animal cards, Montessori style.', 'flashcards', { mode: 'threepart', theme: 'dyr' });
  tpl('flashcards', '🌳', 'tint-lime', 'Naturkort', 'Nature Cards', 'Kort med ting fra naturen.', 'Cards with things from nature.', 'flashcards', { mode: 'threepart', theme: 'natur' });
  tpl('flashcards', '🍎', 'tint-lemon', 'Matkort', 'Food Cards', 'Mat og frukt med bilde og navn.', 'Food and fruit with picture and name.', 'flashcards', { mode: 'vocab', theme: 'mat' });
  tpl('flashcards', '🫶', 'tint-blue', 'Kroppskort', 'Body Cards', 'Kroppens deler som læringskort.', 'Parts of the body as learning cards.', 'flashcards', { mode: 'vocab', theme: 'kropp' });
  tpl('flashcards', '👨‍👩‍👧', 'tint-pink', 'Familiekort', 'Family Cards', 'Ord for familien, fine for samtale.', 'Family words, great for conversation.', 'flashcards', { mode: 'vocab', theme: 'familie' });
  tpl('flashcards', '🏫', 'tint-blue', 'Skolekort', 'School Cards', 'Ting i klasserommet som kort.', 'Classroom objects as cards.', 'flashcards', { mode: 'vocab', theme: 'skole' });
  tpl('flashcards', '🇬🇧', 'tint-lemon', 'Norsk-engelsk gloser', 'Norwegian-English Vocab', 'Tospråklige gloskort, skriv egne ord.', 'Bilingual vocabulary cards, add your own words.', 'flashcards', { mode: 'vocab', itemsText: 'hund = dog\nkatt = cat\nhus = house\nsol = sun\nvann = water\neple = apple\nbok = book\nvenn = friend' });
  tpl('flashcards', '🔤', 'tint-lime', 'Egne ordkort', 'Custom Word Cards', 'Tomt oppsett: lim inn dine egne ord.', 'Blank setup: paste your own words.', 'flashcards', { mode: 'vocab', itemsText: '' });

  /* Aktivitetsbøker (8) */
  tpl('activity', '🦊', 'tint-lime', 'Dyreaktiviteter', 'Animal Activities', 'Koble, klipp, spor og finn, alt om dyr.', 'Match, cut, trace and find, all about animals.', 'activity', { theme: 'dyr', count: 12, difficulty: 'medium' });
  tpl('activity', '🌲', 'tint-lime', 'Naturdetektiven', 'Nature Detective', 'Aktiviteter for små naturforskere.', 'Activities for little nature scientists.', 'activity', { theme: 'natur', count: 12, difficulty: 'medium' });
  tpl('activity', '🚗', 'tint-blue', 'Kjøretøy-moro', 'Vehicle Fun', 'Biler, fly og båter i lekne oppgaver.', 'Cars, planes and boats in playful tasks.', 'activity', { theme: 'kjoretoy', count: 10, difficulty: 'easy' });
  tpl('activity', '🦄', 'tint-pink', 'Fantasiverkstedet', 'Fantasy Workshop', 'Enhjørninger og drager i aktivitetsform.', 'Unicorns and dragons in activity form.', 'activity', { theme: 'fantasi', count: 10, difficulty: 'easy' });
  tpl('activity', '🍂', 'tint-lemon', 'Årstidsaktiviteter', 'Season Activities', 'Aktiviteter gjennom hele året.', 'Activities through the whole year.', 'activity', { theme: 'arstider', count: 12, difficulty: 'medium' });
  tpl('activity', '🔍', 'tint-blue', 'Finn forskjellene XL', 'Spot the Difference XL', 'En hel bok med finn-forskjeller.', 'A whole book of spot-the-difference.', 'activity', { theme: 'dyr', count: 10, types: ['spotdiff', 'findobject'], difficulty: 'medium' });
  tpl('activity', '🧠', 'tint-lime', 'Logikk for små hoder', 'Logic for Little Minds', 'Mønster, memory og logikk.', 'Patterns, memory and logic.', 'activity', { theme: 'natur', count: 10, types: ['pattern', 'memory', 'maze'], difficulty: 'medium' });
  tpl('activity', '✂️', 'tint-pink', 'Klipp og lim-boka', 'The Cut & Paste Book', 'Finmotorikk med saks og lim.', 'Fine motor skills with scissors and glue.', 'activity', { theme: 'mat', count: 10, types: ['cutpaste', 'tracing', 'matching'], difficulty: 'easy' });

  /* Puslebøker (8) */
  tpl('puzzles', '🔠', 'tint-blue', 'Ordletingsboka', 'The Word Search Book', 'Ordletinger i stigende vanskelighet.', 'Word searches in rising difficulty.', 'puzzle', { kinds: ['wordsearch'], count: 12, difficulty: 'medium', wordTheme: 'natur' });
  tpl('puzzles', '✏️', 'tint-pink', 'Kryssord for barn', 'Crosswords for Kids', 'Emoji-kryssord for lesere 6-9 år.', 'Emoji crosswords for readers 6-9.', 'puzzle', { kinds: ['crossword'], count: 8, difficulty: 'easy', wordTheme: 'dyr' });
  tpl('puzzles', '9️⃣', 'tint-lemon', 'Sudoku lett', 'Easy Sudoku', 'Mini- og vanlig sudoku for nybegynnere.', 'Mini and standard sudoku for beginners.', 'puzzle', { kinds: ['sudoku'], count: 12, difficulty: 'easy' });
  tpl('puzzles', '🧩', 'tint-blue', 'Sudoku vanskelig', 'Hard Sudoku', 'For erfarne sudoku-løsere.', 'For experienced sudoku solvers.', 'puzzle', { kinds: ['sudoku'], count: 12, difficulty: 'hard' });
  tpl('puzzles', '🌀', 'tint-lime', 'Labyrintboka', 'The Maze Book', 'Labyrinter fra lette til vriene.', 'Mazes from easy to tricky.', 'puzzle', { kinds: ['maze'], count: 12, difficulty: 'medium' });
  tpl('puzzles', '🔢', 'tint-lemon', 'Tallgåter', 'Number Riddles', 'Magiske kvadrater og tallpusling.', 'Magic squares and number puzzles.', 'puzzle', { kinds: ['numberpuzzle'], count: 10, difficulty: 'medium' });
  tpl('puzzles', '🎲', 'tint-pink', 'Den store pusleboka', 'The Big Puzzle Book', 'Blanding av alle pusletyper.', 'A mix of every puzzle type.', 'puzzle', { kinds: ['wordsearch', 'crossword', 'sudoku', 'maze', 'numberpuzzle'], count: 15, difficulty: 'medium' });
  tpl('puzzles', '✈️', 'tint-blue', 'Reisepuslerier', 'Travel Puzzles', 'Kompakt puslebok for ferieturen.', 'Compact puzzle book for the holidays.', 'puzzle', { kinds: ['wordsearch', 'sudoku', 'maze'], count: 10, difficulty: 'easy' });

  /* Fargelegging (8) */
  tpl('coloring', '🌺', 'tint-pink', 'Mandala-ro', 'Mandala Calm', 'Genererte mandalaer for ro og fokus.', 'Generated mandalas for calm and focus.', 'coloring', { theme: 'natur', count: 14 });
  tpl('coloring', '🦁', 'tint-lemon', 'Dyrenes fargebok', 'Animal Coloring', 'Dyremotiver og mønstre om hverandre.', 'Animal artwork and patterns combined.', 'coloring', { theme: 'dyr', count: 12 });
  tpl('coloring', '🌿', 'tint-lime', 'Naturens mønstre', 'Patterns of Nature', 'Blader, blomster og naturmotiver.', 'Leaves, flowers and nature motifs.', 'coloring', { theme: 'natur', count: 12 });
  tpl('coloring', '🧚', 'tint-pink', 'Eventyrfarger', 'Fairy Tale Colors', 'Fantasimotiver med feer og drager.', 'Fantasy artwork with fairies and dragons.', 'coloring', { theme: 'fantasi', count: 12 });
  tpl('coloring', '🚒', 'tint-blue', 'Kjøretøy-fargebok', 'Vehicle Coloring', 'Traktorer, tog og brannbiler.', 'Tractors, trains and fire trucks.', 'coloring', { theme: 'kjoretoy', count: 12 });
  tpl('coloring', '🍁', 'tint-lemon', 'Fire årstider', 'Four Seasons', 'Fargelegging gjennom året.', 'Coloring through the year.', 'coloring', { theme: 'arstider', count: 16 });
  tpl('coloring', '📐', 'tint-blue', 'Lærerike fargesider', 'Educational Coloring', 'Alfabet, tall og former å fargelegge.', 'Alphabet, numbers and shapes to color.', 'coloring', { theme: 'laering', count: 12 });
  tpl('coloring', '🎄', 'tint-lime', 'Høytidskos', 'Holiday Coloring', 'Sesong- og høytidsmotiver.', 'Seasonal and holiday artwork.', 'coloring', { theme: 'arstider', count: 12 });

  /* Journaler (8) */
  tpl('journals', '🙏', 'tint-pink', 'Takknemlighetsjournal', 'Gratitude Journal', '14 dager med takknemlighet.', '14 days of gratitude.', 'journal', { kind: 'gratitude', count: 14 });
  tpl('journals', '💭', 'tint-blue', 'Refleksjonsjournal', 'Reflection Journal', 'Kveldsrefleksjon med gode spørsmål.', 'Evening reflection with good questions.', 'journal', { kind: 'reflection', count: 14 });
  tpl('journals', '🌿', 'tint-lime', 'Velværejournal', 'Wellness Journal', 'Søvn, energi og humør med logg.', 'Sleep, energy and mood with tracker.', 'journal', { kind: 'wellness', count: 14 });
  tpl('journals', '📔', 'tint-lemon', 'Dagbok, 30 dager', 'Daily Journal, 30 Days', 'Enkel dagbok med variasjon.', 'A simple varied daily journal.', 'journal', { kind: 'daily', count: 30 });
  tpl('journals', '🍎', 'tint-pink', 'Lærerjournal', 'Teacher Journal', 'Observasjoner og refleksjon for pedagoger.', 'Observations and reflection for educators.', 'journal', { kind: 'teacher', count: 14 });
  tpl('journals', '🎒', 'tint-blue', 'Elevjournal', 'Student Journal', 'Daglig læringslogg for elever.', 'A daily learning log for students.', 'journal', { kind: 'student', count: 14 });
  tpl('journals', '☀️', 'tint-lemon', 'Sommerminner', 'Summer Memories', 'Ferie-dagbok for barn.', 'A holiday journal for kids.', 'journal', { kind: 'student', count: 21 });
  tpl('journals', '🤱', 'tint-pink', 'Foreldrejournal', 'Parent Journal', 'Små øyeblikk verdt å huske.', 'Small moments worth remembering.', 'journal', { kind: 'gratitude', count: 21 });

  /* Planleggere (8) */
  tpl('planners', '🗓️', 'tint-blue', 'Månedsplanlegger', 'Monthly Planner', '12 måneder med kalendere.', '12 months of calendars.', 'planner', { kind: 'monthly', months: 12 });
  tpl('planners', '📅', 'tint-lime', 'Ukeplanlegger', 'Weekly Planner', '12 ukeoppslag med fokusfelt.', '12 weekly spreads with focus box.', 'planner', { kind: 'weekly', weeks: 12 });
  tpl('planners', '⏰', 'tint-lemon', 'Dagsplanlegger', 'Daily Planner', 'Timeplan fra 07 til 20 med prioriteringer.', 'Hourly schedule from 7 to 20 with priorities.', 'planner', { kind: 'daily', days: 14 });
  tpl('planners', '🍎', 'tint-pink', 'Lærerplanlegger', 'Teacher Planner', 'Måneder + planleggingssider for pedagoger.', 'Months + planning pages for educators.', 'planner', { kind: 'teacher', months: 10 });
  tpl('planners', '🎓', 'tint-blue', 'Studentplanlegger', 'Student Planner', 'Skoleår med måneder og uker.', 'School year with months and weeks.', 'planner', { kind: 'student', months: 10 });
  tpl('planners', '🎯', 'tint-lime', 'Målplanlegger', 'Goal Planner', 'Seks mål, steg og feiring.', 'Six goals, steps and celebration.', 'planner', { kind: 'goals' });
  tpl('planners', '✅', 'tint-lemon', 'Vanesporeren', 'The Habit Tracker', '30-dagers rutenett for vaner.', '30-day habit grids.', 'planner', { kind: 'habits', months: 3 });
  tpl('planners', '👨‍👩‍👧', 'tint-pink', 'Familieplanlegger', 'Family Planner', 'Ukeoversikt for hele familien.', 'Weekly overview for the whole family.', 'planner', { kind: 'weekly', weeks: 8 });

  /* Hjemmeskole (8) */
  tpl('homeschool', '🏡', 'tint-lime', 'Hjemmeskole-uka', 'The Homeschool Week', 'Ukeplan tilpasset hjemmeundervisning.', 'Weekly plan adapted to homeschooling.', 'planner', { kind: 'weekly', weeks: 12 });
  tpl('homeschool', '🌸', 'tint-pink', 'Montessorimorgener', 'Montessori Mornings', 'Arbeidsbok for rolige hjemmeøkter.', 'Workbook for calm sessions at home.', 'workbook', { category: 'montessori', topic: 'praktisk liv hjemme', age: '3-6', count: 10 });
  tpl('homeschool', '🔬', 'tint-blue', 'Forskerklubben', 'The Science Club', 'Naturfag hjemme med undring.', 'Science at home with wonder.', 'workbook', { category: 'science', topic: 'eksperimenter og naturen hjemme', age: '6-9', count: 8 });
  tpl('homeschool', '📚', 'tint-lemon', 'Lesestund-loggen', 'Reading Log', 'Journal for daglig lesing.', 'A journal for daily reading.', 'journal', { kind: 'student', count: 21 });
  tpl('homeschool', '🧮', 'tint-blue', 'Matte i hverdagen', 'Everyday Math', 'Praktiske matteoppgaver hjemmefra.', 'Practical math from daily life.', 'workbook', { category: 'mathematics', topic: 'matte i hverdagen', age: '6-9', count: 10 });
  tpl('homeschool', '🌳', 'tint-lime', 'Uteskole-boka', 'The Outdoor School Book', 'Aktiviteter for læring ute.', 'Activities for learning outdoors.', 'activity', { theme: 'natur', count: 12, difficulty: 'medium' });
  tpl('homeschool', '🗂️', 'tint-pink', 'Temauke-planlegger', 'Unit Study Planner', 'Planlegg temauker måned for måned.', 'Plan unit studies month by month.', 'planner', { kind: 'teacher', months: 6 });
  tpl('homeschool', '🏅', 'tint-lemon', 'Mestringsjournal', 'Mastery Journal', 'Følg barnets fremgang og seire.', "Track your child's progress and wins.", 'journal', { kind: 'teacher', count: 14 });

  /* Språklæring (8) */
  tpl('language', '🇳🇴', 'tint-pink', 'Norsk for nybegynnere', 'Norwegian for Beginners', 'Glosekort norsk-engelsk.', 'Norwegian-English vocabulary cards.', 'flashcards', { mode: 'vocab', itemsText: 'hei = hello\ntakk = thank you\nja = yes\nnei = no\nvenn = friend\nmat = food\nvann = water\nhus = house' });
  tpl('language', '🗣️', 'tint-blue', 'De første 100 ordene', 'First 100 Words', 'Bok med hverdagsord per tema.', 'A book of everyday words by theme.', 'book', { bookType: 'language learning book', topic: 'de første hverdagsordene, tema for tema', age: '3-6', pages: 32 });
  tpl('language', '✍️', 'tint-lime', 'Skrivetrening, ord', 'Word Writing Practice', 'Sporing av høyfrekvente ord.', 'Tracing high-frequency words.', 'workbook', { category: 'writing', topic: 'vanlige ord', age: '6-9', count: 10 });
  tpl('language', '🔤', 'tint-lemon', 'Ordleting på engelsk', 'English Word Searches', 'Engelske gloser som ordleting.', 'English vocabulary as word searches.', 'puzzle', { kinds: ['wordsearch'], count: 10, difficulty: 'easy', wordTheme: 'skole', lang: 'en' });
  tpl('language', '🎴', 'tint-pink', 'Tematiske glosekort', 'Themed Vocab Cards', 'Kort for mat, kropp og familie.', 'Cards for food, body and family.', 'flashcards', { mode: 'vocab', theme: 'mat' });
  tpl('language', '📖', 'tint-blue', 'Tospråklig fortelling', 'Bilingual Story', 'Historie å lese på to språk.', 'A story to read in two languages.', 'book', { bookType: 'language learning book', topic: 'en enkel hverdagshistorie for språktrening', age: '6-9', pages: 24 });
  tpl('language', '🧩', 'tint-lime', 'Glose-kryssord', 'Vocabulary Crosswords', 'Kryssord med emoji-hint.', 'Crosswords with emoji clues.', 'puzzle', { kinds: ['crossword'], count: 8, difficulty: 'easy', wordTheme: 'mat' });
  tpl('language', '🌍', 'tint-lemon', 'Språkdagboka', 'The Language Journal', 'Daglig logg for nye ord.', 'A daily log for new words.', 'journal', { kind: 'student', count: 21 });

  /* Lærerressurser (8) */
  tpl('teacher', '🍎', 'tint-pink', 'Klasseromsplanlegger', 'Classroom Planner', 'Skoleåret: måneder, uker og notater.', 'The school year: months, weeks and notes.', 'planner', { kind: 'teacher', months: 10 });
  tpl('teacher', '📋', 'tint-blue', 'Observasjonsjournal', 'Observation Journal', 'Strukturert barneobservasjon.', 'Structured child observation.', 'journal', { kind: 'teacher', count: 20 });
  tpl('teacher', '🏅', 'tint-lemon', 'Diplom og belønning', 'Certificates & Rewards', 'Arbeidsbok som ender i diplom.', 'A workbook that ends with a certificate.', 'workbook', { category: 'literacy', topic: 'repetisjon og mestring', age: '6-9', count: 6 });
  tpl('teacher', '🔢', 'tint-lime', 'Stasjonsoppgaver matte', 'Math Station Tasks', 'Regneark for stasjonsarbeid.', 'Math sheets for station work.', 'workbook', { category: 'mathematics', topic: 'stasjonsarbeid', age: '6-9', count: 12 });
  tpl('teacher', '🎲', 'tint-blue', 'Tidlig ferdig-boksen', 'Early Finisher Box', 'Puslerier for elever som blir tidlig ferdige.', 'Puzzles for early finishers.', 'puzzle', { kinds: ['wordsearch', 'maze', 'numberpuzzle'], count: 12, difficulty: 'medium' });
  tpl('teacher', '🃏', 'tint-pink', 'Klassesett med kort', 'Classroom Card Set', 'Trepartskort til samlingsstund.', 'Three-part cards for circle time.', 'flashcards', { mode: 'threepart', theme: 'natur' });
  tpl('teacher', '🧘', 'tint-lime', 'Rolig start-sider', 'Calm Start Pages', 'Mandala-sider til rolig oppstart.', 'Mandala pages for a calm start.', 'coloring', { theme: 'natur', count: 10 });
  tpl('teacher', '📊', 'tint-lemon', 'Vaner i klassen', 'Class Habit Tracker', 'Felles vaner og rutiner som rutenett.', 'Shared habits and routines as grids.', 'planner', { kind: 'habits', months: 2 });
  tpl('teacher', '💼', 'tint-pink', 'Kurshefte (FEA-stil)', 'Course Booklet (FEA style)', 'Kurshefte for voksne i FEA-stil: moduler, refleksjon, sjekklister og handlingssteg.', 'Course booklet for adults in FEA style: modules, reflection, checklists and action steps.', 'workbook', { category: 'course', topic: 'kurshefte i varm og motiverende FEA-stil (Carrie Green): velkomst fra kursholderen, moduler med kort leksjonstekst, refleksjonsspørsmål, sjekklister og konkrete handlingssteg per modul', age: 'voksne', count: 12 });
  tpl('teacher', '📔', 'tint-blue', 'Observasjonsjournal for pedagoger', 'Observation Journal for Educators', 'Utvidet observasjonsjournal: barnets valg, konsentrasjon, sosialt samspill og oppfølging.', 'Extended observation journal: the child\'s choices, concentration, social interaction and follow-up.', 'journal', { kind: 'teacher', count: 30 });

  /* Montessori (læreplanen): områdene i Montessoripedagogikken (8) */
  tpl('montessori', '🧺', 'tint-pink', 'Praktisk liv', 'Practical Life', 'Øvelser i praktisk liv: helle, øse, kle på seg og dekke bord.', 'Practical life exercises: pouring, spooning, dressing and setting the table.', 'workbook', { category: 'montessori', topic: 'praktisk liv: helle, øse, kle på seg, dekke bord og hjelpe til hjemme', age: '3-6', count: 10 });
  tpl('montessori', '👐', 'tint-blue', 'Sansene', 'The Senses', 'Sansetrening: se, høre, kjenne, lukte og smake.', 'Sensorial work: seeing, hearing, touching, smelling and tasting.', 'workbook', { category: 'montessori', topic: 'sansene og sansematerialer: sortere, gradere og beskrive', age: '3-6', count: 10 });
  tpl('montessori', '🔤', 'tint-lemon', 'Språk: lyder og bokstaver', 'Language: Sounds and Letters', 'Språkarbeid i Montessorirekkefølge: lyder først, så bokstaver og ord.', 'Language work in Montessori order: sounds first, then letters and words.', 'workbook', { category: 'literacy', topic: 'språklyder, sandpapirbokstaver og de første ordene, i Montessorirekkefølge', age: '3-6', count: 12 });
  tpl('montessori', '🔢', 'tint-lime', 'Matematikk med konkreter', 'Math with Materials', 'Mengder og tall slik Montessorimatematikken bygger dem opp.', 'Quantities and numerals the way Montessori math builds them.', 'workbook', { category: 'mathematics', topic: 'mengder og tall 0 til 10 med konkreter, i Montessorirekkefølge', age: '3-6', count: 12 });
  tpl('montessori', '🌌', 'tint-blue', 'De store fortellingene', 'The Great Lessons', 'Kosmisk utdanning: universet, livet og menneskene.', 'Cosmic education: the universe, life and human beings.', 'book', { bookType: 'educational book', topic: 'de store fortellingene i kosmisk utdanning: universet blir til, livet utvikler seg og menneskene kommer', age: '6-9', pages: 32 });
  tpl('montessori', '🌱', 'tint-lime', 'Botanikk: plantene', 'Botany: Plants', 'Plantens deler, frø og vekst.', 'Parts of the plant, seeds and growth.', 'workbook', { category: 'science', topic: 'botanikk: plantens deler, frø som spirer og det planter trenger', age: '3-6', count: 10 });
  tpl('montessori', '🐾', 'tint-pink', 'Zoologi: trepartskort', 'Zoology: Three-Part Cards', 'Klassiske trepartskort med dyr.', 'Classic three-part cards with animals.', 'flashcards', { mode: 'threepart', theme: 'dyr' });
  tpl('montessori', '🕊️', 'tint-lemon', 'Fred og høflighet', 'Grace and Courtesy', 'Grace and courtesy: vennlighet, hensyn og fred.', 'Grace and courtesy: kindness, consideration and peace.', 'book', { bookType: 'educational book', topic: 'høflighet, vennlighet og fredsarbeid i hverdagen (grace and courtesy)', age: '3-6', pages: 24 });

  /* Skole (læreplanen LK20): fagene og de tverrfaglige temaene (8) */
  tpl('lk20', '📖', 'tint-pink', 'Norsk: lese og skrive', 'Norwegian: Read and Write', 'Bokstaver, lesing og skriving for begynneropplæringen.', 'Letters, reading and writing for early literacy.', 'workbook', { category: 'literacy', topic: 'begynneropplæring i norsk: bokstaver, lesing og skriving', age: '6-9', count: 12 });
  tpl('lk20', '➕', 'tint-blue', 'Matematikk 1.-4. trinn', 'Math Grades 1-4', 'Tall, regning og problemløsing etter læreplanen.', 'Numbers, arithmetic and problem solving per the curriculum.', 'workbook', { category: 'mathematics', topic: 'tall, de fire regneartene og problemløsing for småtrinnet', age: '6-9', count: 12 });
  tpl('lk20', '🇬🇧', 'tint-lemon', 'Engelsk: første ord', 'English: First Words', 'Engelske gloser som læringskort.', 'English vocabulary as learning cards.', 'flashcards', { mode: 'vocab', itemsText: 'hund = dog\nkatt = cat\nskole = school\nvenn = friend\nbok = book\nlærer = teacher\nfamilie = family\nhus = house' });
  tpl('lk20', '🔬', 'tint-lime', 'Naturfag: utforskeren', 'Science: The Explorer', 'Utforskende arbeidsmåter: undre, undersøke og forklare.', 'Inquiry-based science: wonder, investigate and explain.', 'workbook', { category: 'science', topic: 'utforskende arbeidsmåter i naturfag: observere, stille spørsmål og undersøke', age: '6-9', count: 10 });
  tpl('lk20', '🏘️', 'tint-blue', 'Samfunnsfag: meg og fellesskapet', 'Social Studies: Me and Community', 'Familie, klasse og lokalsamfunn.', 'Family, class and local community.', 'book', { bookType: 'educational book', topic: 'meg selv, familien, klassen og lokalsamfunnet', age: '6-9', pages: 24 });
  tpl('lk20', '💛', 'tint-pink', 'Livsmestring', 'Life Skills', 'Tverrfaglig tema: følelser, vennskap og gode valg.', 'Cross-curricular theme: feelings, friendship and good choices.', 'workbook', { category: 'montessori', topic: 'folkehelse og livsmestring: følelser, vennskap, kropp og gode valg', age: '6-9', count: 10 });
  tpl('lk20', '♻️', 'tint-lime', 'Bærekraftig utvikling', 'Sustainable Development', 'Tverrfaglig tema: miljø og bærekraft i hverdagen.', 'Cross-curricular theme: environment and sustainability in daily life.', 'workbook', { category: 'science', topic: 'bærekraftig utvikling: kildesortering, forbruk og å ta vare på naturen', age: '6-9', count: 10 });
  tpl('lk20', '🗳️', 'tint-lemon', 'Demokrati og medborgerskap', 'Democracy and Citizenship', 'Tverrfaglig tema: medvirkning, regler og fellesskap.', 'Cross-curricular theme: participation, rules and community.', 'book', { bookType: 'educational book', topic: 'demokrati og medborgerskap for barn: stemme, regler og fellesskap', age: '9-12', pages: 24 });

  /* Eier-eksklusivt innhold (Renates Bokbygger): laereplan-kategoriene og
     FEA-kursheftemalen vises kun for eierkontoen, aldri for vanlige
     Bookly-brukere. */
  BK.OWNER_TPL_CATS = { montessori: 1, lk20: 1 };
  T.forEach(function (tp) {
    if (BK.OWNER_TPL_CATS[tp.cat] || tp.name[0].indexOf('FEA') !== -1) tp.own = true;
  });
  BK.isOwner = function () { return !!(BK.state.user && BK.state.user.role === 'owner'); };
  BK.visibleTemplates = function () {
    var own = BK.isOwner();
    return T.filter(function (tp) { return !tp.own || own; });
  };

  BK.TEMPLATES = T;

  /* Bruk en mal: åpner riktig skaper med forhåndsutfylt oppsett. */
  BK.useTemplate = function (id) {
    var t = null;
    for (var i = 0; i < T.length; i++) if (T[i].id === id) t = T[i];
    if (!t) return;
    if (t.own && !BK.isOwner()) return;
    BK.pendingTemplate = t;
    var routeMap = { book: 'book', workbook: 'workbook', activity: 'activity', puzzle: 'puzzle', flashcards: 'flashcards', coloring: 'coloring', journal: 'journal', planner: 'planner' };
    BK.go('/create/' + routeMap[t.type]);
  };
})();
