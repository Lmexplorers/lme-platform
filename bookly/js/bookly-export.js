/* =====================================================================
   LME Bookly™ — eksportsystem
   PDF (via nettleserens print-til-PDF), PNG/JPG (SVG -> canvas),
   DOCX (ekte .docx via minimal zip-skriver), trykkinnstillinger og
   ryggbredde-kalkulator.
   ===================================================================== */
(function () {
  'use strict';
  var BK = window.BK;
  var exp = (BK.exp = {});

  /* ============ PDF / UTSKRIFT ============ */
  /* Rendrer alle sidene i et skjult print-område og åpner utskriftsdialogen.
     Brukeren velger "Lagre som PDF". Sidestørrelsen settes med @page. */
  exp.printProject = function (project, opts) {
    opts = opts || {};
    var size = BK.sizeOf(project);
    var pages = opts.pages || project.pages;
    var html = pages.map(function (pgObj, i) {
      return BK.gen.renderPage(project, pgObj, i, pages.length);
    }).join('');

    var holder = document.getElementById('bkPrintArea');
    if (!holder) {
      holder = document.createElement('div');
      holder.id = 'bkPrintArea';
      document.body.appendChild(holder);
    }
    holder.innerHTML = html;

    var style = document.getElementById('bkPrintStyle');
    if (!style) {
      style = document.createElement('style');
      style.id = 'bkPrintStyle';
      document.head.appendChild(style);
    }
    style.textContent =
      '@page { size: ' + size.w + 'mm ' + size.h + 'mm; margin: 0; }' +
      '@media print {' +
      ' body.bk-printing > *:not(#bkPrintArea) { display: none !important; }' +
      ' #bkPrintArea .bk-sheet { box-shadow: none !important; border-radius: 0 !important; margin: 0 !important; page-break-after: always; }' +
      '}' +
      '@media screen { #bkPrintArea { display: none; } }';

    document.body.classList.add('bk-printing');
    BK.logExport(project, 'PDF', opts.what || (BK.lang() === 'no' ? 'Innmat' : 'Interior'));
    setTimeout(function () {
      window.print();
      setTimeout(function () {
        document.body.classList.remove('bk-printing');
        holder.innerHTML = '';
      }, 400);
    }, 120);
  };

  /* ============ PNG / JPG ============ */
  /* Render en side til canvas via SVG foreignObject. Inline alt; ingen
     eksterne ressurser, så canvas forblir ren og kan eksporteres. */
  exp.pageToImage = function (project, pageIdx, format, scale) {
    return new Promise(function (resolve, reject) {
      var pages = project.pages;
      var pgObj = pages[pageIdx];
      var size = BK.sizeOf(project);
      var pxPerMm = 300 / 25.4; // 300 dpi
      var W = Math.round(size.w * pxPerMm * (scale || 1));
      var H = Math.round(size.h * pxPerMm * (scale || 1));

      var html = BK.gen.renderPage(project, pgObj, pageIdx, pages.length);
      // Fjern data-attributter og sørg for hvit bakgrunn
      var wrap = document.createElement('div');
      wrap.innerHTML = html;
      var sheetEl = wrap.firstChild;
      sheetEl.style.boxShadow = 'none';
      sheetEl.style.borderRadius = '0';
      if (!sheetEl.style.background) sheetEl.style.background = '#ffffff';

      // Kopier inn relevant CSS slik at foreignObject rendres riktig
      var css = '';
      try {
        for (var s = 0; s < document.styleSheets.length; s++) {
          var sheet = document.styleSheets[s];
          if (sheet.href && sheet.href.indexOf('bookly.css') === -1) continue;
          var rules = sheet.cssRules || [];
          for (var r = 0; r < rules.length; r++) {
            var sel = rules[r].selectorText || '';
            if (sel.indexOf('.bk-sheet') !== -1 || sel.indexOf('.pg-') !== -1 ||
                sel.indexOf('.illus-box') !== -1 || sel.indexOf('.lines') !== -1 ||
                sel.indexOf('.cellbox') !== -1 || sel.indexOf('.cal') !== -1 ||
                sel.indexOf('.story-text') !== -1 || sel.indexOf('.grid-cells') !== -1) {
              css += rules[r].cssText + '\n';
            }
          }
        }
      } catch (e) { /* cross-origin stilark hoppes over */ }

      var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="' + W + '" height="' + H + '">' +
        '<foreignObject width="100%" height="100%">' +
        '<div xmlns="http://www.w3.org/1999/xhtml" style="width:' + size.w + 'mm;height:' + size.h + 'mm;' +
        'transform:scale(' + (W / (size.w * 96 / 25.4)) + ');transform-origin:0 0;' +
        'font-family:\'Playpen Sans\',Nunito,system-ui,sans-serif">' +
        '<style>' + css + '</style>' +
        wrap.innerHTML +
        '</div></foreignObject></svg>';

      var img = new Image();
      var blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
      var url = URL.createObjectURL(blob);
      img.onload = function () {
        try {
          var canvas = document.createElement('canvas');
          canvas.width = W; canvas.height = H;
          var ctx = canvas.getContext('2d');
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, W, H);
          ctx.drawImage(img, 0, 0, W, H);
          URL.revokeObjectURL(url);
          var mime = format === 'jpg' ? 'image/jpeg' : 'image/png';
          resolve(canvas.toDataURL(mime, 0.92));
        } catch (err) { reject(err); }
      };
      img.onerror = function () { URL.revokeObjectURL(url); reject(new Error('render_failed')); };
      img.src = url;
    });
  };

  exp.downloadPageImage = function (project, pageIdx, format) {
    var name = (project.title || 'bookly').replace(/[^\wæøåÆØÅ -]/g, '').trim() || 'bookly';
    return exp.pageToImage(project, pageIdx, format, 1).then(function (dataUrl) {
      BK.download(name + '-' + (BK.lang() === 'no' ? 'side' : 'page') + (pageIdx + 1) + '.' + format, dataUrl);
      BK.logExport(project, format.toUpperCase(), (BK.lang() === 'no' ? 'Side ' : 'Page ') + (pageIdx + 1));
    }).catch(function () {
      BK.toast(BK.lang() === 'no'
        ? 'Bildeeksport støttes ikke i denne nettleseren. Bruk Skriv ut / PDF.'
        : 'Image export is not supported in this browser. Use Print / PDF.');
    });
  };

  /* ============ DOCX ============ */
  /* Ekte .docx: en zip (uten komprimering) med nødvendige deler. */
  var CRC_TABLE = (function () {
    var t = [], c;
    for (var n = 0; n < 256; n++) {
      c = n;
      for (var k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1;
      t[n] = c >>> 0;
    }
    return t;
  })();
  function crc32(bytes) {
    var c = 0xFFFFFFFF;
    for (var i = 0; i < bytes.length; i++) c = CRC_TABLE[(c ^ bytes[i]) & 0xFF] ^ (c >>> 8);
    return (c ^ 0xFFFFFFFF) >>> 0;
  }
  function strBytes(s) { return new TextEncoder().encode(s); }

  function makeZip(files) {
    // files: [{name, content(string)}] — lagres ukomprimert (store)
    var chunks = [], central = [], offset = 0;
    files.forEach(function (f) {
      var nameB = strBytes(f.name);
      var data = strBytes(f.content);
      var crc = crc32(data);
      var local = new Uint8Array(30 + nameB.length);
      var dv = new DataView(local.buffer);
      dv.setUint32(0, 0x04034b50, true);
      dv.setUint16(4, 20, true);          // versjon
      dv.setUint16(6, 0x0800, true);      // UTF-8-flagg
      dv.setUint16(8, 0, true);           // store
      dv.setUint32(14, crc, true);
      dv.setUint32(18, data.length, true);
      dv.setUint32(22, data.length, true);
      dv.setUint16(26, nameB.length, true);
      local.set(nameB, 30);
      chunks.push(local, data);

      var cent = new Uint8Array(46 + nameB.length);
      var cv = new DataView(cent.buffer);
      cv.setUint32(0, 0x02014b50, true);
      cv.setUint16(4, 20, true);
      cv.setUint16(6, 20, true);
      cv.setUint16(8, 0x0800, true);
      cv.setUint16(10, 0, true);
      cv.setUint32(16, crc, true);
      cv.setUint32(20, data.length, true);
      cv.setUint32(24, data.length, true);
      cv.setUint16(28, nameB.length, true);
      cv.setUint32(42, offset, true);
      cent.set(nameB, 46);
      central.push(cent);
      offset += local.length + data.length;
    });
    var centralSize = 0;
    central.forEach(function (c) { centralSize += c.length; });
    var end = new Uint8Array(22);
    var ev = new DataView(end.buffer);
    ev.setUint32(0, 0x06054b50, true);
    ev.setUint16(8, files.length, true);
    ev.setUint16(10, files.length, true);
    ev.setUint32(12, centralSize, true);
    ev.setUint32(16, offset, true);
    var all = chunks.concat(central, [end]);
    return new Blob(all, { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
  }

  function xmlEsc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  exp.downloadDocx = function (project) {
    var paras = [];
    function para(text, style) {
      var pr = style === 'h1' ? '<w:pPr><w:pStyle w:val="Heading1"/></w:pPr>' :
               style === 'h2' ? '<w:pPr><w:pStyle w:val="Heading2"/></w:pPr>' : '';
      paras.push('<w:p>' + pr + '<w:r><w:t xml:space="preserve">' + xmlEsc(text) + '</w:t></w:r></w:p>');
    }
    para(project.title, 'h1');
    project.pages.forEach(function (pgObj, i) {
      var d = pgObj.data || {};
      var head = pgObj.title || ((BK.lang() === 'no' ? 'Side ' : 'Page ') + (i + 1));
      para(head, 'h2');
      if (d.text) d.text.split('\n').forEach(function (line) { para(line); });
      if (d.illustration) para((BK.lang() === 'no' ? '[Illustrasjon: ' : '[Illustration: ') + d.illustration + ']');
      if (d.prompts) d.prompts.forEach(function (q) { para('• ' + q); });
      if (d.problems) d.problems.forEach(function (pr2, ix) { para((ix + 1) + ') ' + pr2.q); });
      if (d.items && pgObj.kind === 'answers') d.items.forEach(function (it) { para(it.ref + ': ' + it.ans); });
      if (d.hook) para(d.hook);
      if (pgObj.kind === 'wordsearch' && d.ws) para((BK.lang() === 'no' ? 'Ord: ' : 'Words: ') + d.ws.words.join(', '));
    });

    var doc = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
      '<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">' +
      '<w:body>' + paras.join('') +
      '<w:sectPr><w:pgSz w:w="11906" w:h="16838"/></w:sectPr></w:body></w:document>';

    var styles = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
      '<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">' +
      '<w:style w:type="paragraph" w:styleId="Heading1"><w:name w:val="heading 1"/>' +
      '<w:rPr><w:b/><w:sz w:val="40"/><w:color w:val="B02458"/></w:rPr></w:style>' +
      '<w:style w:type="paragraph" w:styleId="Heading2"><w:name w:val="heading 2"/>' +
      '<w:rPr><w:b/><w:sz w:val="28"/><w:color w:val="D6336C"/></w:rPr></w:style></w:styles>';

    var contentTypes = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
      '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">' +
      '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>' +
      '<Default Extension="xml" ContentType="application/xml"/>' +
      '<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>' +
      '<Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/></Types>';

    var rels = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
      '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
      '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>';

    var docRels = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
      '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
      '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>';

    var blob = makeZip([
      { name: '[Content_Types].xml', content: contentTypes },
      { name: '_rels/.rels', content: rels },
      { name: 'word/_rels/document.xml.rels', content: docRels },
      { name: 'word/document.xml', content: doc },
      { name: 'word/styles.xml', content: styles },
    ]);
    var name = (project.title || 'bookly').replace(/[^\wæøåÆØÅ -]/g, '').trim() || 'bookly';
    BK.download(name + '.docx', blob);
    BK.logExport(project, 'DOCX', BK.lang() === 'no' ? 'Tekstinnhold' : 'Text content');
  };

  /* ============ TRYKKINNSTILLINGER ============ */
  exp.SPINE_PER_PAGE = { white: 0.0572, cream: 0.0635, color: 0.0572, premium: 0.0596 };

  exp.spineWidth = function (pages, paper) {
    return (pages || 0) * (exp.SPINE_PER_PAGE[paper] || exp.SPINE_PER_PAGE.white);
  };

  exp.printSpec = function (project, opts) {
    opts = opts || {};
    var no = BK.lang() === 'no';
    var size = BK.sizeOf(project);
    var pages = (project.pages || []).length;
    var paper = opts.paper || 'premium';
    var bleed = opts.bleed != null ? opts.bleed : (BK.state.settings.bleed || 3);
    var spine = exp.spineWidth(pages, paper);
    var coverW = 2 * size.w + spine + 2 * bleed;
    var coverH = size.h + 2 * bleed;
    var gutter = pages <= 150 ? 9.6 : pages <= 300 ? 12.7 : pages <= 500 ? 15.9 : 19.1;
    function f(n) { var s = n.toFixed(1); return no ? s.replace('.', ',') : s; }
    return {
      lines: [
        (no ? 'Sidestørrelse: ' : 'Trim size: ') + f(size.w) + ' x ' + f(size.h) + ' mm · ' + pages + (no ? ' sider' : ' pages'),
        (no ? 'Utfallende (bleed): ' : 'Bleed: ') + f(bleed) + ' mm ' + (no ? 'på alle sider' : 'on all sides'),
        (no ? 'Ryggbredde (estimat, paperback): ' : 'Spine width (estimate, paperback): ') + f(spine) + ' mm',
        (no ? 'Helt omslag (bakside + rygg + forside, med bleed): ' : 'Full wrap cover (back + spine + front, with bleed): ') + f(coverW) + ' x ' + f(coverH) + ' mm',
        (no ? 'Innermarg (mot ryggen): minst ' : 'Gutter margin: at least ') + f(gutter) + ' mm',
        (no ? 'Ytre marger: minst 6,4 mm (9,5 mm ved utfallende bilder)' : 'Outer margins: at least 6.4 mm (9.5 mm with bleed images)'),
        (no ? 'Filer: PDF med innebygde fonter, bilder 300 dpi, CMYK' : 'Files: PDF with embedded fonts, images 300 dpi, CMYK'),
        pages < 24 ? (no ? 'NB: Amazon KDP krever minst 24 sider' : 'Note: Amazon KDP requires at least 24 pages') : null,
        pages && pages < 79 ? (no ? 'Under cirka 80 sider: ikke sett tekst på bokryggen' : 'Under about 80 pages: avoid spine text') : null,
      ].filter(Boolean),
      spine: spine, coverW: coverW, coverH: coverH, gutter: gutter, bleed: bleed,
    };
  };

  exp.printChecklist = function () {
    var no = BK.lang() === 'no';
    return no ? [
      'Riktig sidestørrelse valgt for alle sider',
      'Utfallende bilder går helt ut i bleed-sonen',
      'Ingen viktig tekst nærmere kanten enn 6 mm',
      'Alle fonter er innebygd i PDF-en',
      'Bilder holder 300 dpi i trykkstørrelse',
      'Sidetallet er delelig på 2 (helst på 4 for trykk)',
      'Omslaget er laget som en hel flate med rygg',
      'Et fysisk prøveeksemplar er bestilt og godkjent',
    ] : [
      'Correct trim size chosen for all pages',
      'Bleed images extend fully into the bleed zone',
      'No important text closer than 6 mm to the edge',
      'All fonts are embedded in the PDF',
      'Images are 300 dpi at print size',
      'Page count is divisible by 2 (ideally by 4 for print)',
      'The cover is one full wrap including the spine',
      'A physical proof copy has been ordered and approved',
    ];
  };
})();
