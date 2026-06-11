/* =====================================================================
   LME Bookly™ — publiseringsassistent
   Norge: BoldBooks, Kolofon, Forlagshuset Vest, ebok.no
   Internasjonalt: Amazon KDP, IngramSpark, Bookvault
   Digitalsalg: Etsy, Shopify, WooCommerce, Gumroad, Teachers Pay Teachers
   Genererer metadata, nøkkelord, kategorier, forfatterbio, produkttekster,
   ISBN-sjekkliste, SEO-forslag og publiseringssjekklister.
   ===================================================================== */
(function () {
  'use strict';
  var BK = window.BK;
  var pub = (BK.pub = {});
  var L = BK.L;

  pub.PLATFORMS = {
    no: [
      { id: 'boldbooks', name: 'BoldBooks', icon: '📕', url: 'https://www.boldbooks.no',
        desc: ['Norsk selvpubliseringsplattform: print-on-demand, salg i egen bokhandel og hjelp til redaktør, korrektur og design.',
               'Norwegian self-publishing platform: print-on-demand, own bookstore sales, plus editing, proofreading and design help.'] },
      { id: 'kolofon', name: 'Kolofon', icon: '📘', url: 'https://www.kolofon.no',
        desc: ['Hjelpeforlag med lang erfaring: trykk, ISBN, kolofonside og distribusjon til norske bokhandler.',
               'Established assisted publisher: printing, ISBN, imprint page and distribution to Norwegian bookstores.'] },
      { id: 'fvest', name: 'Forlagshuset Vest', icon: '📙', url: 'https://www.forlagshusetvest.no',
        desc: ['Selvpubliseringstjenester med personlig oppfølging: ombrekking, omslag, trykk og distribusjon.',
               'Self-publishing services with personal follow-up: typesetting, covers, printing and distribution.'] },
      { id: 'ebokno', name: 'ebok.no', icon: '📱', url: 'https://www.ebok.no',
        desc: ['Norges største e-bokhandel. Få e-boka (EPUB) ut til norske lesere via distributør.',
               "Norway's largest ebook store. Reach Norwegian readers with your EPUB through a distributor."] },
    ],
    int: [
      { id: 'kdp', name: 'Amazon KDP', icon: '🅰️', url: 'https://kdp.amazon.com',
        desc: ['Paperback, hardcover og Kindle e-bok med global rekkevidde. Gratis ISBN (gjelder kun Amazon).',
               'Paperback, hardcover and Kindle ebooks with global reach. Free ISBN (Amazon only).'] },
      { id: 'ingram', name: 'IngramSpark', icon: '🌐', url: 'https://www.ingramspark.com',
        desc: ['Print-on-demand med distribusjon til over 40 000 bokhandler og bibliotek. Krever eget ISBN.',
               'Print-on-demand distributed to over 40,000 bookstores and libraries. Requires your own ISBN.'] },
      { id: 'bookvault', name: 'Bookvault', icon: '🏦', url: 'https://www.bookvault.app',
        desc: ['Britisk print-on-demand med høy kvalitet. Selg direkte via Shopify- eller API-kobling.',
               'UK print-on-demand with high quality. Sell directly through Shopify or API integration.'] },
    ],
  };

  pub.CHECKLISTS = {
    boldbooks: ['BoldBooks', [
      ['Opprett konto på boldbooks.no.', 'Create an account at boldbooks.no.'],
      ['Skaff gratis ISBN fra Nasjonalbiblioteket (nb.no).', 'Get a free ISBN from the National Library of Norway (nb.no).'],
      ['Last opp trykkeklar PDF for innmat og omslag.', 'Upload print-ready PDFs for interior and cover.'],
      ['Velg print-on-demand og salg i BoldBooks-bokhandelen.', 'Choose print-on-demand and BoldBooks bookstore sales.'],
      ['Registrer boka i Bokbasen, så norske bokhandler finner den.', 'Register the book in Bokbasen so Norwegian bookstores find it.'],
      ['Send pliktavleveringseksemplar til Nasjonalbiblioteket.', 'Send legal deposit copies to the National Library.'],
    ]],
    kolofon: ['Kolofon', [
      ['Ta kontakt med Kolofon om utgivelsen din.', 'Contact Kolofon about your release.'],
      ['Avklar pakken: trykk, ISBN, kolofonside og distribusjon.', 'Agree the package: printing, ISBN, imprint page and distribution.'],
      ['Lever manus og omslag etter spesifikasjonene deres.', 'Deliver manuscript and cover to their specifications.'],
      ['Godkjenn prøvetrykk før opplaget settes i gang.', 'Approve the proof before the print run starts.'],
      ['Husk Bokbasen-registrering og pliktavlevering.', 'Remember Bokbasen registration and legal deposit.'],
    ]],
    fvest: ['Forlagshuset Vest', [
      ['Ta kontakt for tilbud på utgivelsen din.', 'Contact them for a quote.'],
      ['Avklar tjenester: ombrekking, omslag, trykk og distribusjon.', 'Agree services: typesetting, cover, printing and distribution.'],
      ['Lever manus og bildemateriell.', 'Deliver manuscript and image material.'],
      ['Godkjenn korrektur og prøvetrykk.', 'Approve the proofread and the printed proof.'],
    ]],
    ebokno: ['ebok.no', [
      ['Lag en validert EPUB 3-fil (sjekk med EPUBCheck).', 'Create a validated EPUB 3 file (check with EPUBCheck).'],
      ['Skaff eget ISBN for e-boka (gratis fra Nasjonalbiblioteket).', 'Get a separate ebook ISBN (free from the National Library).'],
      ['Lag omslag i JPG, cirka 1600 x 2560 piksler.', 'Create a JPG cover, around 1600 x 2560 pixels.'],
      ['Lever via distributør (f.eks. Bokbasen) for synlighet på ebok.no.', 'Deliver through a distributor (e.g. Bokbasen) for visibility on ebok.no.'],
    ]],
    kdp: ['Amazon KDP', [
      ['Opprett KDP-konto og fullfør skatteintervjuet (W-8BEN for Norge).', 'Create a KDP account and complete the tax interview (W-8BEN for Norway).'],
      ['Fyll inn metadata: tittel, beskrivelse, 7 nøkkelord og opptil 3 kategorier.', 'Fill in metadata: title, description, 7 keywords and up to 3 categories.'],
      ['Velg ISBN: gratis fra KDP (kun Amazon) eller ditt eget.', 'Choose ISBN: free from KDP (Amazon only) or your own.'],
      ['Last opp innmat-PDF og omslags-PDF (bruk KDP Cover Calculator).', 'Upload interior and cover PDFs (use the KDP Cover Calculator).'],
      ['Sjekk i Previewer og bestill fysisk prøveeksemplar.', 'Check in the Previewer and order a physical proof.'],
      ['Sett pris per marked og velg royaltymodell.', 'Set prices per marketplace and choose a royalty model.'],
      ['Publiser. Gjennomgangen tar vanligvis 24 til 72 timer.', 'Publish. Review usually takes 24 to 72 hours.'],
    ]],
    ingram: ['IngramSpark', [
      ['Opprett konto og legg inn ditt eget ISBN.', 'Create an account and enter your own ISBN.'],
      ['Sett opp tittelen med metadata og BISAC-kategorier.', 'Set up the title with metadata and BISAC categories.'],
      ['Last opp PDF/X-1a-filer fra template-generatoren deres.', 'Upload PDF/X-1a files from their template generator.'],
      ['Velg rabatt (vanligvis 40-55 %) og returordning.', 'Choose a discount (usually 40-55%) and returns policy.'],
      ['Godkjenn e-proof og bestill fysisk prøveeksemplar.', 'Approve the e-proof and order a physical proof.'],
    ]],
    bookvault: ['Bookvault', [
      ['Opprett konto på bookvault.app.', 'Create an account at bookvault.app.'],
      ['Sett opp boka med format, papir og innbinding.', 'Set up the book with format, paper and binding.'],
      ['Last opp innmat- og omslags-PDF etter spec-arket.', 'Upload interior and cover PDFs per the spec sheet.'],
      ['Bestill prøveeksemplar og sjekk kvaliteten.', 'Order a proof copy and check the quality.'],
      ['Koble til nettbutikken din for direktesalg.', 'Connect your webshop for direct sales.'],
    ]],
  };

  var GENRE_DATA = {
    bildebok: {
      bisac: ['JUVENILE FICTION / General (JUV000000)', 'JUVENILE FICTION / Animals / General (JUV002000)', 'JUVENILE FICTION / Family / General (JUV013000)'],
      thema: [['YBCS (bildebøker med fortelling)', 'YBCS (picture storybooks)'], ['YBL (tidlig læring)', 'YBL (early learning)']],
      amazon: "Children's Books > Growing Up & Facts of Life / Early Learning",
    },
    aktivitetsbok: {
      bisac: ['JUVENILE NONFICTION / Activity Books / General (JNF001000)', 'JUVENILE NONFICTION / General (JNF000000)'],
      thema: [['YBG (aktivitetsbøker)', 'YBG (interactive and activity books)'], ['YBL (tidlig læring)', 'YBL (early learning)']],
      amazon: "Children's Books > Activities, Crafts & Games",
    },
    pedagogikk: {
      bisac: ['EDUCATION / General (EDU000000)', 'FAMILY & RELATIONSHIPS / Parenting / General (FAM034000)'],
      thema: [['JN (pedagogikk og utdanning)', 'JN (education)'], ['VFX (råd til foreldre)', 'VFX (advice on parenting)']],
      amazon: 'Books > Education & Teaching > Education Theory > Montessori',
    },
    skjonn: {
      bisac: ['FICTION / General (FIC000000)'],
      thema: [['FBA (moderne skjønnlitteratur)', 'FBA (modern fiction)']],
      amazon: 'Books > Literature & Fiction',
    },
    sakprosa: {
      bisac: ['EDUCATION / General (EDU000000)', 'SELF-HELP / General (SEL000000)'],
      thema: [['JN (utdanning)', 'JN (education)'], ['VS (selvhjelp og praktiske råd)', 'VS (self-help and practical advice)']],
      amazon: 'Books > Reference',
    },
  };
  pub.GENRES = GENRE_DATA;

  function fillIn() { return BK.lang() === 'no' ? '[fyll inn]' : '[fill in]'; }

  /* d: {title, subtitle, author, imprint, genre, audience, themes[], desc, bio,
         price, market: no|int|both, formats: {paperback, hardcover, ebook}} */
  pub.generate = function (d) {
    var no = BK.lang() === 'no';
    var out = {};
    var mNo = d.market !== 'int', mInt = d.market !== 'no';
    var g = GENRE_DATA[d.genre] || GENRE_DATA.bildebok;

    /* --- ISBN-sjekkliste --- */
    var isbn = [
      ['Ett ISBN per format: paperback, hardcover og e-bok trenger hvert sitt.', 'One ISBN per format: paperback, hardcover and ebook each need their own.'],
      ['ISBN på kolofonsiden og som EAN-13 strekkode på baksiden.', 'ISBN on the imprint page and as an EAN-13 barcode on the back.'],
      ['Norske ISBN er gratis fra Nasjonalbiblioteket (nb.no) og gjelder internasjonalt.', 'Norwegian ISBNs are free from the National Library (nb.no) and are valid internationally.'],
    ];
    if (mNo) isbn.push(
      ['Registrer utgivelsen i Bokbasen for synlighet i norske bokhandler.', 'Register the release in Bokbasen for visibility in Norwegian bookstores.'],
      ['Husk pliktavlevering til Nasjonalbiblioteket etter utgivelse.', 'Remember legal deposit to the National Library after release.']
    );
    if (mInt) isbn.push(
      ['Gratis KDP-ISBN gjelder kun Amazon. IngramSpark krever eget ISBN.', 'The free KDP ISBN works only on Amazon. IngramSpark requires your own.'],
      ['Bestem imprint-navnet som knyttes til ISBN-et.', 'Decide the imprint name tied to the ISBN.']
    );
    if (d.formats && d.formats.ebook) isbn.push(
      ['E-boka trenger eget ISBN for EPUB-distribusjon (Kindle bruker ASIN).', 'The ebook needs its own ISBN for EPUB distribution (Kindle uses an ASIN).']
    );
    out.isbn = isbn.map(L);

    /* --- Nøkkelord (7, KDP-stil) --- */
    var kws = [];
    function push(k) { k = k.toLowerCase().trim(); if (k && kws.indexOf(k) === -1) kws.push(k); }
    (d.themes || []).slice(0, 3).forEach(function (th) {
      push(no ? th + ' for barn' : th + ' for kids');
      push('montessori ' + th);
    });
    push(no ? 'montessori hjemme' : 'montessori at home');
    push(no ? 'aktivitetsbok barn' : 'activity book for kids');
    push(no ? 'gave til barn' : 'gift for kids');
    push(no ? 'læring gjennom lek' : 'learning through play');
    out.keywords = kws.slice(0, 7);

    /* --- Backend-nøkkelord (Amazon, lang hale) --- */
    out.backendKeywords = out.keywords.concat((d.themes || []).map(function (t) { return t.toLowerCase(); }))
      .filter(function (v, i, a) { return a.indexOf(v) === i; }).join('; ');

    /* --- Kategorier --- */
    var cats = [];
    if (mNo) cats.push({ title: no ? 'Norge (Thema, Bokbasen)' : 'Norway (Thema, Bokbasen)', lines: g.thema.map(L) });
    if (mInt) {
      cats.push({ title: no ? 'Internasjonalt (BISAC)' : 'International (BISAC)', lines: g.bisac });
      cats.push({ title: no ? 'Amazon-kategori (forslag)' : 'Amazon category (suggestion)', lines: [g.amazon] });
    }
    out.categories = cats;

    /* --- Metadata --- */
    var meta = [];
    function row(lblNo, lblEn, val) { meta.push((no ? lblNo : lblEn) + ': ' + (val || fillIn())); }
    row('Tittel', 'Title', d.title);
    if (d.subtitle) row('Undertittel', 'Subtitle', d.subtitle);
    row('Forfatter', 'Author', d.author);
    row('Forlag/imprint', 'Publisher/imprint', d.imprint || 'Little Montessori Explorers');
    row('Språk', 'Language', no ? 'Norsk (bokmål)' : 'English');
    if (d.formats && d.formats.paperback) row('ISBN (paperback)', 'ISBN (paperback)', '');
    if (d.formats && d.formats.hardcover) row('ISBN (hardcover)', 'ISBN (hardcover)', '');
    if (d.formats && d.formats.ebook) row('ISBN (e-bok)', 'ISBN (ebook)', '');
    row('Utgivelsesdato', 'Release date', '');
    row('Veiledende pris', 'List price', d.price);
    row('Målgruppe', 'Audience', d.audience);
    row('Nøkkelord', 'Keywords', out.keywords.join('; '));
    meta.push((no ? 'Beskrivelse' : 'Description') + ':');
    meta.push(d.desc || fillIn());
    out.metadata = meta.join('\n');

    /* --- Forfatterbio --- */
    out.bio = d.bio || (no
      ? (d.author || fillIn()) + ' er Montessoripedagog med over 20 års erfaring fra klasserom og skoleledelse, og skaperen av Little Montessori Explorers. ' +
        (d.author ? d.author.split(' ')[0] : 'Forfatteren') + ' lager ressurser som hjelper barn å lære gjennom undring, lek og praktisk utforsking.'
      : (d.author || fillIn()) + ' is a Montessori educator with over 20 years of classroom and school leadership experience, and the creator of Little Montessori Explorers. ' +
        (d.author ? d.author.split(' ')[0] : 'The author') + ' makes resources that help children learn through wonder, play and hands-on exploration.');

    /* --- Produktbeskrivelse --- */
    var themesList = (d.themes || []).slice(0, 4);
    out.productDesc = (no
      ? (d.desc || '[Kort om boka]') + '\n\nI denne utgivelsen finner du:\n' +
        themesList.map(function (t) { return '✓ ' + BK.cap(t); }).join('\n') +
        '\n\nPerfekt for ' + (d.audience || 'nysgjerrige barn') + '. Laget med kjærlighet av Little Montessori Explorers.'
      : (d.desc || '[Short book description]') + '\n\nInside this release you will find:\n' +
        themesList.map(function (t) { return '✓ ' + BK.cap(t); }).join('\n') +
        '\n\nPerfect for ' + (d.audience || 'curious children') + '. Made with love by Little Montessori Explorers.');

    /* --- SEO-forslag --- */
    var seo = [];
    if (mNo) {
      seo.push({
        title: no ? 'Norske SEO-forslag' : 'Norwegian SEO suggestions',
        lines: [
          (no ? 'Tittel-tagg: ' : 'Title tag: ') + (d.title || fillIn()) + ' | ' + (d.imprint || 'Little Montessori Explorers'),
          (no ? 'Meta-beskrivelse: ' : 'Meta description: ') + (d.desc || '').slice(0, 150),
          (no ? 'Søkefraser: ' : 'Search phrases: ') + (d.themes || []).map(function (t) { return t + ' bok barn'; }).join(' · '),
          no ? 'Bruk norske søkeord i Bokbasen-omtalen, det er den bokhandlene viser.' : 'Use Norwegian keywords in the Bokbasen description, that is what bookstores display.',
        ],
      });
    }
    if (mInt) {
      seo.push({
        title: no ? 'Internasjonale SEO-forslag' : 'International SEO suggestions',
        lines: [
          (no ? 'A+ innhold: vis innsidesider og bruksbilder på Amazon.' : 'A+ content: show interior pages and lifestyle images on Amazon.'),
          (no ? 'Bruk alle 7 nøkkelordfeltene, uten å gjenta ord fra tittelen.' : 'Use all 7 keyword slots, without repeating title words.'),
          (no ? 'Be lesere om anmeldelser de første 30 dagene.' : 'Ask readers for reviews in the first 30 days.'),
        ],
      });
    }
    out.seo = seo;

    /* --- Publiseringssjekkliste --- */
    var sections = [{
      name: no ? 'Før du publiserer' : 'Before you publish',
      items: (no ? [
        'Manus ferdig: språkvask og korrektur fullført',
        'Kolofonside med tittel, copyright, ISBN og utgivelsesår',
        'Omslag med forside, rygg og bakside med strekkode',
        'Pris bestemt for hvert marked',
        'Lanseringsplan: dato, nyhetsbrev og sosiale medier',
      ] : [
        'Manuscript finished: editing and proofreading done',
        'Imprint page with title, copyright, ISBN and year',
        'Cover with front, spine and barcode on the back',
        'Price decided for every market',
        'Launch plan: date, newsletter and social media',
      ]),
    }];
    var ids = [];
    if (mNo) { ids.push('boldbooks', 'kolofon', 'fvest'); if (d.formats && d.formats.ebook) ids.push('ebokno'); }
    if (mInt) { ids.push('kdp'); if (d.formats && (d.formats.paperback || d.formats.hardcover)) ids.push('ingram', 'bookvault'); }
    ids.forEach(function (id) {
      var c = pub.CHECKLISTS[id];
      sections.push({ name: c[0], items: c[1].map(L) });
    });
    out.checklist = sections;

    return out;
  };

  /* ============ DIGITALSALG (Etsy, Shopify, WooCommerce, Gumroad, TPT) ============ */
  pub.SHOPS = ['Etsy', 'Shopify', 'WooCommerce', 'Gumroad', 'Teachers Pay Teachers'];

  pub.digital = function (d) {
    var no = BK.lang() === 'no';
    var themes = (d.themes || []);
    var what = d.productType || (no ? 'printbar PDF' : 'printable PDF');
    var out = {};

    out.titles = [
      (d.title || '') + (no ? ' | Printbar PDF | ' : ' | Printable PDF | ') + (d.audience || ''),
      (no ? 'PRINTBAR ' : 'PRINTABLE ') + (d.title || '').toUpperCase() + ' · ' + themes.slice(0, 2).join(' · '),
      (d.title || '') + (no ? ' – last ned og skriv ut hjemme' : ' – instant download, print at home'),
    ].map(function (t) { return t.replace(/^[ |·–-]+|[ |·–-]+$/g, ''); });

    out.features = no ? [
      'Digital nedlasting: PDF i høy oppløsning (300 dpi)',
      'Skriv ut hjemme eller hos trykkeri, så mange ganger du vil (privat bruk)',
      'Laget av Montessoripedagog med 20+ års erfaring',
      'A4 og US Letter inkludert',
      'Umiddelbar levering: fil tilgjengelig rett etter kjøp',
    ] : [
      'Digital download: high-resolution PDF (300 dpi)',
      'Print at home or at a print shop, as many times as you like (personal use)',
      'Created by a Montessori educator with 20+ years of experience',
      'A4 and US Letter included',
      'Instant delivery: file available right after purchase',
    ];

    out.salesCopy = no
      ? 'Trenger du ' + (d.audience ? 'noe meningsfylt for ' + d.audience : 'en rolig og lærerik aktivitet') + '? ' +
        (d.title || 'Dette produktet') + ' er en ' + what + ' laget for å skape ro, mestring og læringsglede. ' +
        (d.desc || '') + '\n\nLast ned, skriv ut og kom i gang på under fem minutter. ' +
        'Perfekt hjemme, på hytta eller i klasserommet.'
      : 'Looking for ' + (d.audience ? 'something meaningful for ' + d.audience : 'a calm and educational activity') + '? ' +
        (d.title || 'This product') + ' is a ' + what + ' designed to create calm, mastery and joy of learning. ' +
        (d.desc || '') + '\n\nDownload, print and get started in under five minutes. ' +
        'Perfect at home, on holiday or in the classroom.';

    out.seoKeywords = [];
    themes.slice(0, 4).forEach(function (t) {
      out.seoKeywords.push((no ? t + ' printbar' : t + ' printable'));
      out.seoKeywords.push((no ? t + ' aktiviteter barn' : t + ' activities kids'));
    });
    out.seoKeywords.push(no ? 'montessori materiell' : 'montessori materials');
    out.seoKeywords.push(no ? 'pdf nedlasting læring' : 'educational pdf download');
    out.seoKeywords = out.seoKeywords.slice(0, 13); // Etsy har 13 tagger

    out.perShop = [
      { shop: 'Etsy', tips: no
        ? 'Bruk alle 13 taggene. Førstebildet bør vise produktet i bruk. Skriv "digital nedlasting" tydelig.'
        : 'Use all 13 tags. The first image should show the product in use. State "digital download" clearly.' },
      { shop: 'Shopify', tips: no
        ? 'Lag en egen kolleksjon for printables. Bruk Digital Downloads-appen for automatisk levering.'
        : 'Create a printables collection. Use the Digital Downloads app for automatic delivery.' },
      { shop: 'WooCommerce', tips: no
        ? 'Sett produktet som "virtuelt og nedlastbart", og begrens antall nedlastinger per kjøp.'
        : 'Set the product as "virtual and downloadable", and limit downloads per purchase.' },
      { shop: 'Gumroad', tips: no
        ? 'Kort URL med produktnavnet, og bruk "pay what you want" for å teste prisfølsomhet.'
        : 'Short URL with the product name, and try "pay what you want" to test price sensitivity.' },
      { shop: 'Teachers Pay Teachers', tips: no
        ? 'Merk med klassetrinn og fag. Last opp en gratis prøveside for å bygge følgere.'
        : 'Tag grade levels and subjects. Upload a free sample page to build followers.' },
    ];
    return out;
  };
})();
