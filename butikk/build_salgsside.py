# -*- coding: utf-8 -*-
"""Genererer LME-salgssider (butikk/*.html) for strikke- og hekleoppskriftene.
Samme mal/CSS som butikk/plansjer.html, med kjøpsboks for Vipps, kort og PayPal."""
import html, pathlib

OUT = pathlib.Path('/home/user/lme-platform/butikk')

# ---------- felles CSS (kopiert fra butikk/plansjer.html + kjøpsknapper) ----------
CSS = """
  @font-face {
    font-family: 'Sasson Montessori';
    src: url('/fonts/SassoonMontessori.woff2') format('woff2'),
         url('/fonts/SassoonMontessori.ttf') format('truetype');
    font-weight: normal; font-style: normal; font-display: swap;
  }
  :root {
    --pink-soft: #F8D7DA; --pink-mid: #F5A8B8; --cream: #FBF6F0; --cream-deep: #F4E9DD;
    --cerise: #E91E89; --sun: #F7C72E; --sky: #3FA9F5; --lime: #A4D233;
    --ink: #1A1A1A; --ink-soft: #4A4A4A; --ink-muted: #8A8A8A; --line: rgba(26,26,26,0.08);
    --btn-yellow: #F7E76B; --btn-yellow-hover: #F0DD4F;
    --vipps: #FF5B24; --vipps-hover: #E64A16; --paypal: #F7C72E;
    --shadow-sm: 0 1px 3px rgba(26,26,26,0.04), 0 1px 2px rgba(26,26,26,0.03);
    --shadow-md: 0 4px 16px rgba(26,26,26,0.06), 0 2px 6px rgba(26,26,26,0.04);
    --shadow-lg: 0 12px 40px rgba(26,26,26,0.08), 0 4px 12px rgba(26,26,26,0.04);
    --r-sm: 12px; --r-md: 18px; --r-lg: 24px; --r-pill: 999px;
    --font-head: 'Playpen Sans', system-ui, sans-serif;
    --font-body: 'Sasson Montessori', 'Playpen Sans', system-ui, sans-serif;
  }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; }
  body { font-family: var(--font-body); background: linear-gradient(180deg,#FDF0F1 0%,var(--cream) 340px);
    color: var(--ink); -webkit-font-smoothing: antialiased; }
  h1,h2,h3,h4 { font-family: var(--font-head); }
  button,input,select,textarea { font-family: var(--font-body); }
  a { color: inherit; }
  .topbar { max-width: 1060px; margin: 0 auto; padding: 18px 20px 0;
    display: flex; align-items: center; justify-content: space-between; gap: 12px; }
  .topbar .logo img { height: 52px; display: block; }
  .topbar-right { display: flex; align-items: center; gap: 10px; }
  .back-link { display: inline-flex; align-items: center; gap: 6px; background: #fff;
    border: 1px solid var(--line); border-radius: var(--r-pill); padding: 9px 16px;
    font-size: 13px; font-weight: 700; text-decoration: none; box-shadow: var(--shadow-sm); transition: all .2s ease; }
  .back-link:hover { border-color: var(--cerise); color: var(--cerise); }
  .lang-btn { background: var(--cerise); color: #fff; border: none; cursor: pointer;
    border-radius: var(--r-pill); padding: 10px 16px; font-size: 13px; font-weight: 700;
    box-shadow: var(--shadow-sm); transition: transform .2s ease; }
  .lang-btn:hover { transform: translateY(-1px); }
  main { max-width: 1060px; margin: 0 auto; padding: 26px 20px 70px; }
  .crumbs { font-size: 13px; color: var(--ink-muted); margin-bottom: 22px; }
  .crumbs a { text-decoration: none; } .crumbs a:hover { color: var(--cerise); }
  .crumbs .sep { margin: 0 6px; }
  .hero { text-align: center; margin-bottom: 26px; }
  .kicker { display: inline-block; font-size: 12px; font-weight: 700; letter-spacing: .14em;
    text-transform: uppercase; color: var(--cerise); margin-bottom: 10px; }
  .hero h1 { font-size: clamp(30px,5vw,46px); line-height: 1.12; margin-bottom: 12px; }
  .hero h1 em { font-style: normal; color: var(--cerise); }
  .hero .sub { font-size: 17px; color: var(--ink-soft); max-width: 640px; margin: 0 auto; line-height: 1.55; }
  .cover-card { background: #fff; border-radius: var(--r-lg); box-shadow: var(--shadow-lg); padding: 14px; margin-bottom: 34px; }
  .cover-card img { width: 100%; height: auto; display: block; border-radius: var(--r-md); }
  .cover-note { text-align: center; font-size: 12.5px; color: var(--ink-muted); padding: 10px 6px 2px; }
  .layout { display: grid; grid-template-columns: 1.5fr 1fr; gap: 26px; align-items: start; }
  .includes { background: #fff; border-radius: var(--r-lg); box-shadow: var(--shadow-md); padding: 28px; }
  .includes h2 { font-size: 24px; margin-bottom: 6px; }
  .includes .lead { font-size: 14.5px; color: var(--ink-soft); margin-bottom: 18px; line-height: 1.5; }
  .item { display: flex; gap: 14px; padding: 13px 0; border-top: 1px solid var(--line); }
  .item:first-of-type { border-top: none; }
  .item .emoji { width: 44px; height: 44px; border-radius: var(--r-sm); background: var(--cream);
    display: grid; place-items: center; font-size: 22px; flex-shrink: 0; }
  .item h3 { font-size: 16px; margin-bottom: 2px; }
  .item p { font-size: 13.5px; color: var(--ink-soft); line-height: 1.45; }
  .buy-box { background: #fff; border-radius: var(--r-lg); box-shadow: var(--shadow-md); padding: 26px; position: sticky; top: 20px; }
  .buy-box .tag { display: inline-block; background: var(--lime); border-radius: var(--r-pill);
    font-size: 11px; font-weight: 700; letter-spacing: .1em; padding: 5px 12px; margin-bottom: 12px; }
  .buy-box .price { font-size: 38px; font-weight: 700; font-family: var(--font-body); }
  .buy-box .price-sub { font-size: 13px; color: var(--ink-muted); margin-bottom: 16px; }
  .pay-label { font-size: 12px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase;
    color: var(--ink-muted); margin: 6px 0 10px; }
  .pay-methods { font-size: 12.5px; color: var(--ink-muted); text-align: center; margin: 2px 0 4px; }
  .btn-buy { display: flex; align-items: center; justify-content: center; gap: 8px; text-align: center;
    border-radius: var(--r-pill); padding: 14px 20px; font-size: 15.5px; font-weight: 700;
    text-decoration: none; box-shadow: var(--shadow-sm); transition: all .2s ease; margin-bottom: 10px; }
  .btn-buy:hover { transform: translateY(-1px); }
  .btn-vipps { background: var(--vipps); color: #fff; }
  .btn-vipps:hover { background: var(--vipps-hover); }
  .btn-card { background: var(--btn-yellow); color: var(--ink); }
  .btn-card:hover { background: var(--btn-yellow-hover); }
  .btn-paypal { background: #fff; color: #003087; border: 2px solid #003087; }
  .btn-paypal:hover { background: #f4f7fd; }
  .fine { font-size: 12.5px; color: var(--ink-muted); line-height: 1.5; margin-top: 14px; }
  .fine li { margin: 6px 0 0 18px; }
  .fact-row { display: flex; flex-wrap: wrap; gap: 8px; margin: 14px 0 18px; }
  .fact { background: var(--cream); border-radius: var(--r-pill); padding: 7px 14px; font-size: 12.5px; font-weight: 700; }
  footer { text-align: center; padding: 26px 20px 44px; font-size: 13px; color: var(--ink-muted); }
  footer a { color: var(--cerise); }
  @media (max-width: 860px) { .layout { grid-template-columns: 1fr; } .buy-box { position: static; } }
"""

def bl(no, en):
    """Tospråklig element-attributter."""
    return f'data-no="{html.escape(no,quote=True)}" data-en="{html.escape(en,quote=True)}"'

def item(emoji, h_no, h_en, p_no, p_en):
    return f'''      <div class="item">
        <span class="emoji">{emoji}</span>
        <div>
          <h3 {bl(h_no,h_en)}>{html.escape(h_no)}</h3>
          <p {bl(p_no,p_en)}>{html.escape(p_no)}</p>
        </div>
      </div>'''

def paybtn(cls, no, en, href_no='#', href_en='#'):
    return (f'      <a class="btn-buy {cls}" href="{href_no}" '
            f'data-no-href="{href_no}" data-en-href="{href_en}" '
            f'{bl(no,en)}>{html.escape(no)}</a>')

def page(p):
    items = '\n'.join(item(*it) for it in p['items'])
    title_no = f"{p['tittel_no']} | LME Butikk"
    title_en = f"{p['tittel_en']} | LME Shop"
    pays = (paybtn('btn-card', f"Kjøp nå, {p['pris_no']} →", f"Buy now, {p['pris_en']} →", p['stripe_no'], p['stripe_en'])
            + '\n      <p class="pay-methods" data-no="Betal trygt med kort, Vipps eller PayPal" '
              'data-en="Pay securely with card, Vipps or PayPal">Betal trygt med kort, Vipps eller PayPal</p>')
    return f'''<!DOCTYPE html>
<html lang="no">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
<meta name="theme-color" content="#F8D7DA">
<title>{html.escape(title_no)}</title>
<meta name="description" content="{html.escape(p['sub_no'])}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Playpen+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>{CSS}</style>
<link rel="manifest" href="/manifest.webmanifest">
<link rel="apple-touch-icon" href="/images/app/apple-touch-icon.png">
</head>
<body>

<div class="topbar">
  <a href="/dashboard" class="logo"><img src="/images/lme-logo.png" alt="Little Montessori Explorers"></a>
  <div class="topbar-right">
    <a href="/butikk" class="back-link" data-no="← Tilbake til butikken" data-en="← Back to the shop">← Tilbake til butikken</a>
    <button class="lang-btn" id="langToggle">EN 🌍</button>
  </div>
</div>

<main>
  <nav class="crumbs">
    <a href="/dashboard" data-no="Dashbord" data-en="Dashboard">Dashbord</a><span class="sep">/</span><a href="/butikk" data-no="Butikk" data-en="Shop">Butikk</a><span class="sep">/</span><span {bl(p['tittel_no'],p['tittel_en'])}>{html.escape(p['tittel_no'])}</span>
  </nav>

  <section class="hero">
    <span class="kicker" {bl(p['kicker_no'],p['kicker_en'])}>{html.escape(p['kicker_no'])}</span>
    <h1 {bl(p['h1_no'],p['h1_en'])}>{p['h1_no']}</h1>
    <p class="sub" {bl(p['sub_no'],p['sub_en'])}>{html.escape(p['sub_no'])}</p>
  </section>

  <div class="cover-card">
    <img src="{p['cover']}" alt="{html.escape(p['tittel_no'])}">
    <p class="cover-note" {bl(p['cover_no'],p['cover_en'])}>{html.escape(p['cover_no'])}</p>
  </div>

  <div class="layout">
    <section class="includes">
      <h2 data-no="Dette får du" data-en="What you get">Dette får du</h2>
      <p class="lead" {bl(p['lead_no'],p['lead_en'])}>{html.escape(p['lead_no'])}</p>
{items}
    </section>

    <aside class="buy-box">
      <span class="tag" {bl(p['tag_no'],p['tag_en'])}>{html.escape(p['tag_no'])}</span>
      <div class="price" data-no="{p['pris_no']}" data-en="{p['pris_en']}">{p['pris_no']}</div>
      <p class="price-sub" data-no="Engangskjøp · digital PDF-nedlasting" data-en="One-time purchase · digital PDF download">Engangskjøp · digital PDF-nedlasting</p>

      <div class="fact-row">
        {' '.join(f'<span class="fact" {bl(a,b)}>{html.escape(a)}</span>' for a,b in p['facts'])}
      </div>

{pays}

      <ul class="fine">
        <li data-no="Digital PDF i LME-stil, klar til utskrift hjemme." data-en="Digital PDF in LME style, ready to print at home.">Digital PDF i LME-stil, klar til utskrift hjemme.</li>
        <li data-no="Trygg betaling. Nedlastingen kommer rett etter kjøpet." data-en="Secure payment. The download is available right after purchase.">Trygg betaling. Nedlastingen kommer rett etter kjøpet.</li>
        <li data-no="Spørsmål? Svar på kvitteringen, så hjelper vi deg." data-en="Questions? Reply to your receipt and we'll help you.">Spørsmål? Svar på kvitteringen, så hjelper vi deg.</li>
      </ul>
    </aside>
  </div>
</main>

<footer>
  <span data-no="Little Montessori Explorers · av Renate Dahl" data-en="Little Montessori Explorers · by Renate Dahl">Little Montessori Explorers · av Renate Dahl</span>
  · <a href="/butikk" data-no="Tilbake til butikken" data-en="Back to the shop">Tilbake til butikken</a>
</footer>

<script>
  let currentLang = 'no';
  const toggle = document.getElementById('langToggle');
  function switchLanguage(lang) {{
    currentLang = lang;
    document.documentElement.lang = lang;
    document.querySelectorAll('[data-no][data-en]').forEach(el => {{
      const text = el.getAttribute('data-' + lang);
      if (text.includes('<')) el.innerHTML = text; else el.textContent = text;
    }});
    document.querySelectorAll('[data-no-src][data-en-src]').forEach(el => {{ el.src = el.getAttribute('data-' + lang + '-src'); }});
    document.querySelectorAll('[data-no-href][data-en-href]').forEach(el => {{ el.href = el.getAttribute('data-' + lang + '-href'); }});
    toggle.textContent = lang === 'no' ? 'EN 🌍' : 'NO 🇳🇴';
    document.title = lang === 'no' ? {title_no!r} : {title_en!r};
    try {{ localStorage.setItem('lme_lang', lang); }} catch (e) {{}}
  }}
  toggle.addEventListener('click', () => switchLanguage(currentLang === 'no' ? 'en' : 'no'));
  (function () {{
    const urlLang = new URLSearchParams(location.search).get('lang');
    let saved = null; try {{ saved = localStorage.getItem('lme_lang'); }} catch (e) {{}}
    const lang = urlLang || saved; if (lang === 'en') switchLanguage('en');
  }})();
</script>
<script src="/js/lme-visibility.js" defer></script>
</body>
</html>'''

# ---------- produktdata ----------
PLACE = '#'  # betalingslenker fylles inn av Renate (Vipps/Stripe/PayPal)

PRODUCTS = [
  {
    'id': 'ro-strikk',
    'tittel_no': 'RO-bøttehatt, strikkeoppskrift', 'tittel_en': 'RO bucket hat, knitting pattern',
    'kicker_no': 'STRIKKEOPPSKRIFT · BARN, DAME OG HERRE · DIGITAL NEDLASTING',
    'kicker_en': 'KNITTING PATTERN · CHILD, WOMAN & MAN · DIGITAL DOWNLOAD',
    'h1_no': 'RO-bøttehatt, <em>strikkeoppskrift</em>', 'h1_en': 'RO bucket hat, <em>knitting pattern</em>',
    'sub_no': 'Hvit bomullshatt med blå RO og det norske flagget foran, bølgeskvulp bak og bølget blå brem. Motivene strikkes rett inn med flerfargestrikk. Tre størrelser, forklart for nybegynnere.',
    'sub_en': 'White cotton hat with blue RO and the Norwegian flag on the front, waves on the back and a wavy blue brim. The motifs are knitted in with stranded colourwork. Three sizes, explained for beginners.',
    'cover': '/images/oppskrift-ro-strikk.jpg',
    'cover_no': 'Ferdig strikket RO-hatt: RO og flagget foran, bølgene bak, og den blå bølgekanten.',
    'cover_en': 'Finished knitted RO hat: RO and the flag on the front, the waves on the back, and the wavy blue brim.',
    'lead_no': 'En komplett strikkeoppskrift i LME-stil, med mønsterdiagram og steg for steg.',
    'lead_en': 'A complete knitting pattern in LME style, with charts and step by step.',
    'tag_no': 'STRIKKEOPPSKRIFT', 'tag_en': 'KNITTING PATTERN',
    'pris_no': '99 kr', 'pris_en': '$9',
    'facts': [('Barn, dame, herre','Child, woman, man'), ('Skriv ut selv','Print at home'), ('Av Renate Dahl','By Renate Dahl')],
    'items': [
      ('🧢','Bøttehatt i tre størrelser','Bucket hat in three sizes',
       'Passer barn, dame og herre. Alle tallene står gjennom hele oppskriften.',
       'Fits child, woman and man. All the numbers run through the whole pattern.'),
      ('🇳🇴','RO og flagget foran','RO and the flag on the front',
       'Strikket rett inn med flerfargestrikk, ikke brodert på.',
       'Knitted straight in with stranded colourwork, not embroidered on.'),
      ('🌊','Bølgeskvulp bak','Wave splashes on the back',
       'To blå bølger bak, og en solid blå brem med bølget kant.',
       'Two blue waves on the back, and a solid blue brim with a wavy edge.'),
      ('📊','Mønsterdiagram','Charts',
       'Tydelige rutediagram for RO, flagget og bølgene, med plassering.',
       'Clear grid charts for RO, the flag and the waves, with placement.'),
      ('📄','12-siders PDF','12-page PDF',
       'Klar til utskrift på A4. Playpen Sans og Sasson Montessori, ekte LME-stil.',
       'Ready to print on A4. Playpen Sans and Sasson Montessori, true LME style.'),
    ],
    'vipps': PLACE, 'stripe_no': PLACE, 'stripe_en': PLACE, 'paypal': PLACE,
  },
  {
    'id': 'ro-hekle',
    'tittel_no': 'RO-bøttehatt, hekleoppskrift', 'tittel_en': 'RO bucket hat, crochet pattern',
    'kicker_no': 'HEKLEOPPSKRIFT · VOKSEN · DIGITAL NEDLASTING',
    'kicker_en': 'CROCHET PATTERN · ADULT · DIGITAL DOWNLOAD',
    'h1_no': 'RO-bøttehatt, <em>hekleoppskrift</em>', 'h1_en': 'RO bucket hat, <em>crochet pattern</em>',
    'sub_no': 'Samme hvite hatt heklet i bomull, med blå RO og det norske flagget foran og bølgeskvulp bak. Motivene hekles rett inn med tapestry-hekling. Voksenstørrelse, steg for steg.',
    'sub_en': 'The same white hat crocheted in cotton, with blue RO and the Norwegian flag on the front and waves on the back. The motifs are worked in with tapestry crochet. Adult size, step by step.',
    'cover': '/images/oppskrift-ro-hekle.jpg',
    'cover_no': 'Ferdig heklet RO-hatt: RO og flagget foran, bølgene bak, og den blå bølgekanten.',
    'cover_en': 'Finished crocheted RO hat: RO and the flag on the front, the waves on the back, and the wavy blue brim.',
    'lead_no': 'En komplett hekleoppskrift i LME-stil, med mønsterdiagram og steg for steg.',
    'lead_en': 'A complete crochet pattern in LME style, with charts and step by step.',
    'tag_no': 'HEKLEOPPSKRIFT', 'tag_en': 'CROCHET PATTERN',
    'pris_no': '99 kr', 'pris_en': '$9',
    'facts': [('Voksen','Adult'), ('Skriv ut selv','Print at home'), ('Av Renate Dahl','By Renate Dahl')],
    'items': [
      ('🧢','Heklet bøttehatt','Crocheted bucket hat',
       'Heklet i spiral med fastmasker, voksenstørrelse (54 til 57 cm).',
       'Worked in a spiral with single crochet, adult size (54 to 57 cm).'),
      ('🇳🇴','RO og flagget foran','RO and the flag on the front',
       'Heklet rett inn med tapestry-hekling, ikke brodert på.',
       'Worked straight in with tapestry crochet, not embroidered on.'),
      ('🌊','Bølgeskvulp bak','Wave splashes on the back',
       'To blå bølger bak, og en solid blå brem med bølget kant.',
       'Two blue waves on the back, and a solid blue brim with a wavy edge.'),
      ('📊','Mønsterdiagram','Charts',
       'Tydelige rutediagram for RO, flagget og bølgene, med plassering.',
       'Clear grid charts for RO, the flag and the waves, with placement.'),
      ('📄','10-siders PDF','10-page PDF',
       'Klar til utskrift på A4. Playpen Sans og Sasson Montessori, ekte LME-stil.',
       'Ready to print on A4. Playpen Sans and Sasson Montessori, true LME style.'),
    ],
    'vipps': PLACE, 'stripe_no': PLACE, 'stripe_en': PLACE, 'paypal': PLACE,
  },
  {
    'id': 'norway-strikk',
    'tittel_no': 'NORWAY-bøttehatt, strikkeoppskrift', 'tittel_en': 'NORWAY bucket hat, knitting pattern',
    'kicker_no': 'STRIKKEOPPSKRIFT · BARN, DAME OG HERRE · DIGITAL NEDLASTING',
    'kicker_en': 'KNITTING PATTERN · CHILD, WOMAN & MAN · DIGITAL DOWNLOAD',
    'h1_no': 'NORWAY-bøttehatt, <em>strikkeoppskrift</em>', 'h1_en': 'NORWAY bucket hat, <em>knitting pattern</em>',
    'sub_no': 'Rød bomullshatt med "NORWAY" i store hvite blokkbokstaver foran og det norske flagget bak. Bokstavene og flagget strikkes rett inn med flerfargestrikk. Bølget brem, tre størrelser. En fin heiahatt til fotball-VM og 17. mai.',
    'sub_en': 'Red cotton hat with "NORWAY" in large white block letters on the front and the Norwegian flag on the back. The letters and flag are knitted in with stranded colourwork. Wavy brim, three sizes. A great supporter hat for the football World Cup and 17 May.',
    'cover': '/images/oppskrift-norway-strikk.jpg',
    'cover_no': 'Ferdig strikket NORWAY-hatt: store blokkbokstaver foran, flagget bak, og den bølgete bremmen.',
    'cover_en': 'Finished knitted NORWAY hat: large block letters on the front, the flag on the back, and the wavy brim.',
    'lead_no': 'En komplett strikkeoppskrift i LME-stil, med mønsterdiagram og steg for steg.',
    'lead_en': 'A complete knitting pattern in LME style, with charts and step by step.',
    'tag_no': 'STRIKKEOPPSKRIFT', 'tag_en': 'KNITTING PATTERN',
    'pris_no': '99 kr', 'pris_en': '$9',
    'facts': [('Barn, dame, herre','Child, woman, man'), ('Skriv ut selv','Print at home'), ('Av Renate Dahl','By Renate Dahl')],
    'items': [
      ('🧢','Bøttehatt i tre størrelser','Bucket hat in three sizes',
       'Passer barn, dame og herre. Alle tallene står gjennom hele oppskriften.',
       'Fits child, woman and man. All the numbers run through the whole pattern.'),
      ('🔤','NORWAY i blokkbokstaver','NORWAY in block letters',
       'Store, tydelige hvite bokstaver strikket rett inn foran.',
       'Large, clear white letters knitted straight in on the front.'),
      ('🇳🇴','Flagget bak','The flag on the back',
       'Det norske flagget strikket inn bak, i rødt, hvitt og blått.',
       'The Norwegian flag knitted in on the back, in red, white and blue.'),
      ('📊','Mønsterdiagram','Charts',
       'Tydelige rutediagram for bokstavene og flagget, med plassering.',
       'Clear grid charts for the letters and the flag, with placement.'),
      ('📄','PDF i LME-stil','PDF in LME style',
       'Klar til utskrift på A4. Playpen Sans og Sasson Montessori.',
       'Ready to print on A4. Playpen Sans and Sasson Montessori.'),
    ],
    'vipps': PLACE, 'stripe_no': PLACE, 'stripe_en': PLACE, 'paypal': PLACE,
  },
  {
    'id': 'norway-hekle',
    'tittel_no': 'NORWAY-bøttehatt, hekleoppskrift', 'tittel_en': 'NORWAY bucket hat, crochet pattern',
    'kicker_no': 'HEKLEOPPSKRIFT · VOKSEN · DIGITAL NEDLASTING',
    'kicker_en': 'CROCHET PATTERN · ADULT · DIGITAL DOWNLOAD',
    'h1_no': 'NORWAY-bøttehatt, <em>hekleoppskrift</em>', 'h1_en': 'NORWAY bucket hat, <em>crochet pattern</em>',
    'sub_no': 'Rød bøttehatt heklet i bomull, med "NORWAY" i hvite blokkbokstaver foran og det norske flagget bak. Motivene hekles rett inn med tapestry-hekling. Bølget brem, voksenstørrelse.',
    'sub_en': 'Red bucket hat crocheted in cotton, with "NORWAY" in white block letters on the front and the Norwegian flag on the back. The motifs are worked in with tapestry crochet. Wavy brim, adult size.',
    'cover': '/images/oppskrift-norway-hekle.jpg',
    'cover_no': 'NORWAY heklet i rødt med hvite blokkbokstaver, flagget bak og bølget brem.',
    'cover_en': 'NORWAY crocheted in red with white block letters, the flag on the back and a wavy brim.',
    'lead_no': 'En komplett hekleoppskrift i LME-stil, med mønsterdiagram og steg for steg.',
    'lead_en': 'A complete crochet pattern in LME style, with charts and step by step.',
    'tag_no': 'HEKLEOPPSKRIFT', 'tag_en': 'CROCHET PATTERN',
    'pris_no': '99 kr', 'pris_en': '$9',
    'facts': [('Voksen','Adult'), ('Skriv ut selv','Print at home'), ('Av Renate Dahl','By Renate Dahl')],
    'items': [
      ('🧢','Heklet bøttehatt','Crocheted bucket hat',
       'Heklet i spiral med fastmasker, voksenstørrelse (54 til 57 cm).',
       'Worked in a spiral with single crochet, adult size (54 to 57 cm).'),
      ('🔤','NORWAY i blokkbokstaver','NORWAY in block letters',
       'Store hvite bokstaver heklet rett inn foran med tapestry-hekling.',
       'Large white letters worked straight in on the front with tapestry crochet.'),
      ('🇳🇴','Flagget bak','The flag on the back',
       'Det norske flagget heklet inn bak, i rødt, hvitt og blått.',
       'The Norwegian flag worked in on the back, in red, white and blue.'),
      ('📊','Mønsterdiagram','Charts',
       'Tydelige rutediagram for bokstavene og flagget, med plassering.',
       'Clear grid charts for the letters and the flag, with placement.'),
      ('📄','PDF i LME-stil','PDF in LME style',
       'Klar til utskrift på A4. Playpen Sans og Sasson Montessori.',
       'Ready to print on A4. Playpen Sans and Sasson Montessori.'),
    ],
    'vipps': PLACE, 'stripe_no': PLACE, 'stripe_en': PLACE, 'paypal': PLACE,
  },
  {
    'id': 'norge-skaut',
    'tittel_no': 'Norge-skaut, strikkeoppskrift', 'tittel_en': 'Norway kerchief, knitting pattern',
    'kicker_no': 'STRIKKEOPPSKRIFT · SKAUT · DIGITAL NEDLASTING',
    'kicker_en': 'KNITTING PATTERN · KERCHIEF · DIGITAL DOWNLOAD',
    'h1_no': 'Norge-skaut, <em>strikkeoppskrift</em>', 'h1_en': 'Norway kerchief, <em>knitting pattern</em>',
    'sub_no': 'Et trekantet skaut i rødt bomullsgarn, med bølger og flaggstriper rundt hele kanten og det norske flagget på. I-cord-snorer festes i sidene foran og knytes bak, under spissen. Du velger selv om flagget skal sitte foran eller bak. Passer til bøttehattene.',
    'sub_en': 'A triangular kerchief in red cotton yarn, with waves and flag stripes around the whole edge and the Norwegian flag on it. I-cord ties attach at the front sides and tie at the back, under the point. You choose whether the flag sits at the front or the back. Matches the bucket hats.',
    'cover': '/images/oppskrift-skaut-strikk.jpg',
    'cover_no': 'Trekantskaut med bølgekant og flaggstriper rundt hele, og I-cord-snorer til å knyte bak.',
    'cover_en': 'Triangular kerchief with a wavy edge and flag stripes all the way around, and I-cord ties to fasten at the back.',
    'lead_no': 'En komplett strikkeoppskrift i LME-stil, med diagram og steg for steg.',
    'lead_en': 'A complete knitting pattern in LME style, with charts and step by step.',
    'tag_no': 'STRIKKEOPPSKRIFT', 'tag_en': 'KNITTING PATTERN',
    'pris_no': '99 kr', 'pris_en': '$9',
    'facts': [('Skaut','Kerchief'), ('Skriv ut selv','Print at home'), ('Av Renate Dahl','By Renate Dahl')],
    'items': [
      ('🧣','Trekantet skaut','Triangular kerchief',
       'Strikket flatt og formet til en trekant, med snorer til å knyte bak.',
       'Knitted flat and shaped into a triangle, with ties to fasten at the back.'),
      ('🌊','Bølger og flaggstriper rundt','Waves and flag stripes all around',
       'Bølgekant og flaggstriper langs hele kanten på skautet.',
       'A wavy edge and flag stripes along the whole edge of the kerchief.'),
      ('🇳🇴','Flagget på','The flag on it',
       'Det norske flagget strikket inn, i rødt, hvitt og blått.',
       'The Norwegian flag knitted in, in red, white and blue.'),
      ('🎀','I-cord-snorer','I-cord ties',
       'Snorene festes i sidene foran og knytes bak, under spissen.',
       'The ties attach at the front sides and fasten at the back, under the point.'),
      ('📄','PDF i LME-stil','PDF in LME style',
       'Klar til utskrift på A4. Playpen Sans og Sasson Montessori.',
       'Ready to print on A4. Playpen Sans and Sasson Montessori.'),
    ],
  },
  {
    'id': 'norge-skaut-hekle',
    'tittel_no': 'Norge-skaut, hekleoppskrift', 'tittel_en': 'Norway kerchief, crochet pattern',
    'kicker_no': 'HEKLEOPPSKRIFT · SKAUT · DIGITAL NEDLASTING',
    'kicker_en': 'CROCHET PATTERN · KERCHIEF · DIGITAL DOWNLOAD',
    'h1_no': 'Norge-skaut, <em>hekleoppskrift</em>', 'h1_en': 'Norway kerchief, <em>crochet pattern</em>',
    'sub_no': 'Et trekantet skaut heklet i rødt bomullsgarn, med bølger og flaggstriper rundt hele kanten og det norske flagget på. Heklede snorer festes i sidene foran og knytes bak, under spissen. Du velger selv om flagget skal sitte foran eller bak. Passer til bøttehattene.',
    'sub_en': 'A triangular kerchief crocheted in red cotton yarn, with waves and flag stripes around the whole edge and the Norwegian flag on it. Crocheted ties attach at the front sides and tie at the back, under the point. You choose whether the flag sits at the front or the back. Matches the bucket hats.',
    'cover': '/images/oppskrift-skaut-hekle.jpg',
    'cover_no': 'Heklet trekantskaut med bølgekant og flaggstriper rundt hele, og snorer til å knyte bak.',
    'cover_en': 'Crocheted triangular kerchief with a wavy edge and flag stripes all the way around, and ties to fasten at the back.',
    'lead_no': 'En komplett hekleoppskrift i LME-stil, med diagram og steg for steg.',
    'lead_en': 'A complete crochet pattern in LME style, with charts and step by step.',
    'tag_no': 'HEKLEOPPSKRIFT', 'tag_en': 'CROCHET PATTERN',
    'pris_no': '99 kr', 'pris_en': '$9',
    'facts': [('Skaut','Kerchief'), ('Skriv ut selv','Print at home'), ('Av Renate Dahl','By Renate Dahl')],
    'items': [
      ('🧣','Trekantet skaut','Triangular kerchief',
       'Heklet flatt med fastmasker og formet til en trekant, med snorer til å knyte bak.',
       'Crocheted flat in single crochet and shaped into a triangle, with ties to fasten at the back.'),
      ('🌊','Bølger og flaggstriper rundt','Waves and flag stripes all around',
       'Bølgekant og flaggstriper langs hele kanten på skautet.',
       'A wavy edge and flag stripes along the whole edge of the kerchief.'),
      ('🇳🇴','Flagget på, foran eller bak','The flag, front or back',
       'Det norske flagget heklet inn med tapestry, i rødt, hvitt og blått. Du velger plassering.',
       'The Norwegian flag crocheted in with tapestry, in red, white and blue. You choose the placement.'),
      ('🎀','Heklede snorer','Crocheted ties',
       'Snorene festes i sidene foran og knytes bak, under spissen.',
       'The ties attach at the front sides and fasten at the back, under the point.'),
      ('📄','PDF i LME-stil','PDF in LME style',
       'Klar til utskrift på A4. Playpen Sans og Sasson Montessori.',
       'Ready to print on A4. Playpen Sans and Sasson Montessori.'),
    ],
  },
  {
    'id': 'norge-strikk',
    'tittel_no': 'NORGE-bøttehatt (maskesting), strikkeoppskrift', 'tittel_en': 'NORGE bucket hat (duplicate stitch), knitting pattern',
    'kicker_no': 'STRIKKEOPPSKRIFT · BARN, DAME OG HERRE · DIGITAL NEDLASTING',
    'kicker_en': 'KNITTING PATTERN · CHILD, WOMAN & MAN · DIGITAL DOWNLOAD',
    'h1_no': 'NORGE-bøttehatt, <em>strikkeoppskrift</em>', 'h1_en': 'NORGE bucket hat, <em>knitting pattern</em>',
    'sub_no': 'Rød bomullshatt med "NORGE" og det norske flagget foran, og "RO" med bølgeskvulp bak. Mønsteret broderes på med maskesting etter at hatten er strikket. Bølget brem, tre størrelser.',
    'sub_en': 'Red cotton hat with "NORGE" and the Norwegian flag on the front, and "RO" with waves on the back. The motif is added with duplicate stitch after the hat is knitted. Wavy brim, three sizes.',
    'cover': '/images/oppskrift-norge-strikk.jpg',
    'cover_no': 'Ferdig strikket NORGE-hatt: NORGE og flagget foran, RO og bølgene bak.',
    'cover_en': 'Finished knitted NORGE hat: NORGE and the flag on the front, RO and the waves on the back.',
    'lead_no': 'En komplett strikkeoppskrift i LME-stil, med mønsterdiagram og steg for steg.',
    'lead_en': 'A complete knitting pattern in LME style, with charts and step by step.',
    'tag_no': 'STRIKKEOPPSKRIFT', 'tag_en': 'KNITTING PATTERN',
    'pris_no': '99 kr', 'pris_en': '$9',
    'facts': [('Barn, dame, herre','Child, woman, man'), ('Skriv ut selv','Print at home'), ('Av Renate Dahl','By Renate Dahl')],
    'items': [
      ('🧢','Bøttehatt i tre størrelser','Bucket hat in three sizes',
       'Passer barn, dame og herre. Alle tallene står gjennom hele oppskriften.',
       'Fits child, woman and man. All the numbers run through the whole pattern.'),
      ('🇳🇴','NORGE og flagget foran','NORGE and the flag on the front',
       'Broderes på med maskesting, som legger seg oppå de strikkede maskene.',
       'Added with duplicate stitch, sitting on top of the knitted stitches.'),
      ('🌊','RO og bølger bak','RO and waves on the back',
       '"RO" med to bølgeskvulp bak, og en bølget brem med flaggstriper.',
       '"RO" with two waves on the back, and a wavy brim with flag stripes.'),
      ('📊','Mønsterdiagram','Charts',
       'Tydelige rutediagram for bokstavene, flagget og bølgene, med plassering.',
       'Clear grid charts for the letters, the flag and the waves, with placement.'),
      ('📄','PDF i LME-stil','PDF in LME style',
       'Klar til utskrift på A4. Playpen Sans og Sasson Montessori.',
       'Ready to print on A4. Playpen Sans and Sasson Montessori.'),
    ],
  },
  {
    'id': 'norge-blokk',
    'tittel_no': 'NORGE-bøttehatt (blokkbokstaver), strikkeoppskrift', 'tittel_en': 'NORGE bucket hat (block letters), knitting pattern',
    'kicker_no': 'STRIKKEOPPSKRIFT · BARN, DAME OG HERRE · DIGITAL NEDLASTING',
    'kicker_en': 'KNITTING PATTERN · CHILD, WOMAN & MAN · DIGITAL DOWNLOAD',
    'h1_no': 'NORGE-bøttehatt, <em>blokkbokstaver</em>', 'h1_en': 'NORGE bucket hat, <em>block letters</em>',
    'sub_no': 'Rød bomullshatt med "NORGE" i store, brede blokkbokstaver foran og det norske flagget bak. Bokstavene strikkes rett inn med flerfargestrikk. Bølget brem, tre størrelser.',
    'sub_en': 'Red cotton hat with "NORGE" in large, bold block letters on the front and the Norwegian flag on the back. The letters are knitted in with stranded colourwork. Wavy brim, three sizes.',
    'cover': '/images/oppskrift-norge-blokk.jpg',
    'cover_no': 'Ferdig strikket NORGE-hatt med store blokkbokstaver foran og flagget bak.',
    'cover_en': 'Finished knitted NORGE hat with large block letters on the front and the flag on the back.',
    'lead_no': 'En komplett strikkeoppskrift i LME-stil, med mønsterdiagram og steg for steg.',
    'lead_en': 'A complete knitting pattern in LME style, with charts and step by step.',
    'tag_no': 'STRIKKEOPPSKRIFT', 'tag_en': 'KNITTING PATTERN',
    'pris_no': '99 kr', 'pris_en': '$9',
    'facts': [('Barn, dame, herre','Child, woman, man'), ('Skriv ut selv','Print at home'), ('Av Renate Dahl','By Renate Dahl')],
    'items': [
      ('🧢','Bøttehatt i tre størrelser','Bucket hat in three sizes',
       'Passer barn, dame og herre. Alle tallene står gjennom hele oppskriften.',
       'Fits child, woman and man. All the numbers run through the whole pattern.'),
      ('🔤','NORGE i store blokkbokstaver','NORGE in large block letters',
       'Brede, tydelige bokstaver strikket rett inn foran med flerfargestrikk.',
       'Wide, clear letters knitted straight in on the front with stranded colourwork.'),
      ('🇳🇴','Flagget bak','The flag on the back',
       'Det norske flagget strikket inn bak, i rødt, hvitt og blått.',
       'The Norwegian flag knitted in on the back, in red, white and blue.'),
      ('📊','Mønsterdiagram','Charts',
       'Tydelige rutediagram for bokstavene og flagget, med plassering.',
       'Clear grid charts for the letters and the flag, with placement.'),
      ('📄','PDF i LME-stil','PDF in LME style',
       'Klar til utskrift på A4. Playpen Sans og Sasson Montessori.',
       'Ready to print on A4. Playpen Sans and Sasson Montessori.'),
    ],
  },
  {
    'id': 'norge-innstrikket',
    'tittel_no': 'NORGE-bøttehatt (innstrikket), strikkeoppskrift', 'tittel_en': 'NORGE bucket hat (knitted in), knitting pattern',
    'kicker_no': 'STRIKKEOPPSKRIFT · BARN, DAME OG HERRE · DIGITAL NEDLASTING',
    'kicker_en': 'KNITTING PATTERN · CHILD, WOMAN & MAN · DIGITAL DOWNLOAD',
    'h1_no': 'NORGE-bøttehatt, <em>innstrikket</em>', 'h1_en': 'NORGE bucket hat, <em>knitted in</em>',
    'sub_no': 'Rød bomullshatt med "NORGE" og det norske flagget foran, og "RO" med bølgeskvulp bak. Alt strikkes rett inn med flerfargestrikk, ikke brodert på. Bølget brem, tre størrelser.',
    'sub_en': 'Red cotton hat with "NORGE" and the Norwegian flag on the front, and "RO" with waves on the back. Everything is knitted straight in with stranded colourwork, not embroidered on. Wavy brim, three sizes.',
    'cover': '/images/oppskrift-norge-innstrikket.jpg',
    'cover_no': 'Ferdig strikket NORGE-hatt med innstrikket mønster foran og bak.',
    'cover_en': 'Finished knitted NORGE hat with the motif knitted in on the front and back.',
    'lead_no': 'En komplett strikkeoppskrift i LME-stil, med mønsterdiagram og steg for steg.',
    'lead_en': 'A complete knitting pattern in LME style, with charts and step by step.',
    'tag_no': 'STRIKKEOPPSKRIFT', 'tag_en': 'KNITTING PATTERN',
    'pris_no': '99 kr', 'pris_en': '$9',
    'facts': [('Barn, dame, herre','Child, woman, man'), ('Skriv ut selv','Print at home'), ('Av Renate Dahl','By Renate Dahl')],
    'items': [
      ('🧢','Bøttehatt i tre størrelser','Bucket hat in three sizes',
       'Passer barn, dame og herre. Alle tallene står gjennom hele oppskriften.',
       'Fits child, woman and man. All the numbers run through the whole pattern.'),
      ('🇳🇴','NORGE, flagg, RO og bølger','NORGE, flag, RO and waves',
       'Alt strikket rett inn med flerfargestrikk, ikke brodert på.',
       'All knitted straight in with stranded colourwork, not embroidered on.'),
      ('🧶','Flerfargestrikk forklart','Stranded colourwork explained',
       'Steg for steg med flott på baksiden, forklart for de som vil lære teknikken.',
       'Step by step with floats on the back, explained for those learning the technique.'),
      ('📊','Mønsterdiagram','Charts',
       'Tydelige rutediagram for bokstavene, flagget og bølgene, med plassering.',
       'Clear grid charts for the letters, the flag and the waves, with placement.'),
      ('📄','PDF i LME-stil','PDF in LME style',
       'Klar til utskrift på A4. Playpen Sans og Sasson Montessori.',
       'Ready to print on A4. Playpen Sans and Sasson Montessori.'),
    ],
  },
  {
    'id': 'norge-hekle',
    'tittel_no': 'NORGE-bøttehatt, hekleoppskrift', 'tittel_en': 'NORGE bucket hat, crochet pattern',
    'kicker_no': 'HEKLEOPPSKRIFT · VOKSEN · DIGITAL NEDLASTING',
    'kicker_en': 'CROCHET PATTERN · ADULT · DIGITAL DOWNLOAD',
    'h1_no': 'NORGE-bøttehatt, <em>hekleoppskrift</em>', 'h1_en': 'NORGE bucket hat, <em>crochet pattern</em>',
    'sub_no': 'Rød bøttehatt heklet i bomull, med "NORGE" i hvite blokkbokstaver foran og det norske flagget. Motivene hekles rett inn med tapestry-hekling. Bølget brem, voksenstørrelse.',
    'sub_en': 'Red bucket hat crocheted in cotton, with "NORGE" in white block letters on the front and the Norwegian flag. The motifs are worked in with tapestry crochet. Wavy brim, adult size.',
    'cover': '/images/oppskrift-norge-hekle-foto.jpg',
    'cover_no': 'NORGE heklet i rødt med hvite blokkbokstaver og bølget brem.',
    'cover_en': 'NORGE crocheted in red with white block letters and a wavy brim.',
    'lead_no': 'En komplett hekleoppskrift i LME-stil, med mønsterdiagram og steg for steg.',
    'lead_en': 'A complete crochet pattern in LME style, with charts and step by step.',
    'tag_no': 'HEKLEOPPSKRIFT', 'tag_en': 'CROCHET PATTERN',
    'pris_no': '99 kr', 'pris_en': '$9',
    'facts': [('Voksen','Adult'), ('Skriv ut selv','Print at home'), ('Av Renate Dahl','By Renate Dahl')],
    'items': [
      ('🧢','Heklet bøttehatt','Crocheted bucket hat',
       'Heklet i spiral med fastmasker, voksenstørrelse (54 til 57 cm).',
       'Worked in a spiral with single crochet, adult size (54 to 57 cm).'),
      ('🔤','NORGE i blokkbokstaver','NORGE in block letters',
       'Store hvite bokstaver heklet rett inn foran med tapestry-hekling.',
       'Large white letters worked straight in on the front with tapestry crochet.'),
      ('🇳🇴','Flagget','The flag',
       'Det norske flagget heklet inn, i rødt, hvitt og blått.',
       'The Norwegian flag worked in, in red, white and blue.'),
      ('📊','Mønsterdiagram','Charts',
       'Tydelige rutediagram for bokstavene og flagget, med plassering.',
       'Clear grid charts for the letters and the flag, with placement.'),
      ('📄','PDF i LME-stil','PDF in LME style',
       'Klar til utskrift på A4. Playpen Sans og Sasson Montessori.',
       'Ready to print on A4. Playpen Sans and Sasson Montessori.'),
    ],
  },
  {
    'id': 'norge-pakke',
    'tittel_no': 'NORGE-bøttehatt, alle 3 strikkevariantene', 'tittel_en': 'NORGE bucket hat, all 3 knitting versions',
    'kicker_no': 'PAKKE · 3 STRIKKEOPPSKRIFTER · DIGITAL NEDLASTING',
    'kicker_en': 'BUNDLE · 3 KNITTING PATTERNS · DIGITAL DOWNLOAD',
    'h1_no': 'NORGE-bøttehatt, <em>alle 3 variantene</em>', 'h1_en': 'NORGE bucket hat, <em>all 3 versions</em>',
    'sub_no': 'Alle tre strikkevariantene av NORGE-bøttehatten i én pakke: maskesting, store blokkbokstaver og innstrikket flerfargestrikk. Du får alle tre PDF-ene og sparer mot å kjøpe hver for seg.',
    'sub_en': 'All three knitting versions of the NORGE bucket hat in one bundle: duplicate stitch, large block letters, and knitted-in stranded colourwork. You get all three PDFs and save versus buying separately.',
    'cover': '/images/oppskrift-norge-blokk.jpg',
    'cover_no': 'NORGE-hatten i alle tre strikkevariantene, samlet i én pakke.',
    'cover_en': 'The NORGE hat in all three knitting versions, bundled together.',
    'lead_no': 'Tre komplette strikkeoppskrifter i LME-stil, med diagram og steg for steg.',
    'lead_en': 'Three complete knitting patterns in LME style, with charts and step by step.',
    'tag_no': 'PAKKE, 3 OPPSKRIFTER', 'tag_en': 'BUNDLE, 3 PATTERNS',
    'pris_no': '149 kr', 'pris_en': '$14',
    'facts': [('3 oppskrifter','3 patterns'), ('Barn, dame, herre','Child, woman, man'), ('Spar mot enkeltkjøp','Save vs single')],
    'items': [
      ('🪡','Maskesting-varianten','The duplicate-stitch version',
       'NORGE og flagget foran, RO og bølger bak, brodert på med maskesting.',
       'NORGE and the flag on the front, RO and waves on the back, added with duplicate stitch.'),
      ('🔤','Blokkbokstav-varianten','The block-letter version',
       'NORGE i store blokkbokstaver foran og flagget bak, strikket inn.',
       'NORGE in large block letters on the front and the flag on the back, knitted in.'),
      ('🧶','Innstrikket-varianten','The knitted-in version',
       'Alt strikket rett inn med flerfargestrikk, ikke brodert på.',
       'Everything knitted straight in with stranded colourwork, not embroidered on.'),
      ('📄','Tre PDF-er i LME-stil','Three PDFs in LME style',
       'Alle tre klare til utskrift på A4, med diagram og steg for steg.',
       'All three ready to print on A4, with charts and step by step.'),
    ],
  },
  {
    'id': 'hekle-pakke',
    'tittel_no': 'Alle hekleoppskriftene, pakke', 'tittel_en': 'All crochet patterns, bundle',
    'kicker_no': 'PAKKE · ALLE HEKLEOPPSKRIFTENE · DIGITAL NEDLASTING',
    'kicker_en': 'BUNDLE · ALL CROCHET PATTERNS · DIGITAL DOWNLOAD',
    'h1_no': 'Alle <em>hekleoppskriftene</em>', 'h1_en': 'All the <em>crochet patterns</em>',
    'sub_no': 'Alle bøttehattene i hekleutgave i én pakke: RO (hvit), NORWAY (rød) og NORGE (rød). Du får alle PDF-ene og sparer mot å kjøpe hver for seg.',
    'sub_en': 'All the bucket hats in crochet in one bundle: RO (white), NORWAY (red) and NORGE (red). You get all the PDFs and save versus buying separately.',
    'cover': '/images/oppskrift-ro-hekle.jpg',
    'cover_no': 'Alle de heklede bøttehattene, samlet i én pakke.',
    'cover_en': 'All the crocheted bucket hats, bundled together.',
    'lead_no': 'Alle hekleoppskriftene i LME-stil, med diagram og steg for steg.',
    'lead_en': 'All the crochet patterns in LME style, with charts and step by step.',
    'tag_no': 'PAKKE, ALLE HEKLE', 'tag_en': 'BUNDLE, ALL CROCHET',
    'pris_no': '149 kr', 'pris_en': '$14',
    'facts': [('Alle hekle','All crochet'), ('Voksen','Adult'), ('Spar mot enkeltkjøp','Save vs single')],
    'items': [
      ('⚪','RO-bøttehatt (hvit)','RO bucket hat (white)',
       'Hvit hatt med blå RO og flagg foran og bølger bak.',
       'White hat with blue RO and flag on the front and waves on the back.'),
      ('🔴','NORWAY-bøttehatt (rød)','NORWAY bucket hat (red)',
       'Rød hatt med NORWAY i blokkbokstaver og flagget bak.',
       'Red hat with NORWAY in block letters and the flag on the back.'),
      ('🇳🇴','NORGE-bøttehatt (rød)','NORGE bucket hat (red)',
       'Rød hatt med NORGE i blokkbokstaver og flagget.',
       'Red hat with NORGE in block letters and the flag.'),
      ('📄','Alle PDF-ene i LME-stil','All the PDFs in LME style',
       'Klare til utskrift på A4, med diagram og steg for steg.',
       'Ready to print on A4, with charts and step by step.'),
    ],
  },
  {
    'id': 'strikk-pakke',
    'tittel_no': 'Alle strikkeoppskriftene, pakke', 'tittel_en': 'All knitting patterns, bundle',
    'kicker_no': 'PAKKE · ALLE STRIKKEOPPSKRIFTENE · DIGITAL NEDLASTING',
    'kicker_en': 'BUNDLE · ALL KNITTING PATTERNS · DIGITAL DOWNLOAD',
    'h1_no': 'Alle <em>strikkeoppskriftene</em>', 'h1_en': 'All the <em>knitting patterns</em>',
    'sub_no': 'Alle strikkeoppskriftene i én pakke: RO (hvit), NORWAY (rød), NORGE i tre varianter, og skautet som passer til. Du får alle PDF-ene og sparer mot å kjøpe hver for seg.',
    'sub_en': 'All the knitting patterns in one bundle: RO (white), NORWAY (red), NORGE in three versions, and the matching kerchief. You get all the PDFs and save versus buying separately.',
    'cover': '/images/oppskrift-ro-strikk.jpg',
    'cover_no': 'Alle de strikkede bøttehattene og skautet, samlet i én pakke.',
    'cover_en': 'All the knitted bucket hats and the kerchief, bundled together.',
    'lead_no': 'Alle strikkeoppskriftene i LME-stil, med diagram og steg for steg.',
    'lead_en': 'All the knitting patterns in LME style, with charts and step by step.',
    'tag_no': 'PAKKE, ALLE STRIKK', 'tag_en': 'BUNDLE, ALL KNITTING',
    'pris_no': '149 kr', 'pris_en': '$14',
    'facts': [('6 oppskrifter','6 patterns'), ('Barn, dame, herre','Child, woman, man'), ('Spar mot enkeltkjøp','Save vs single')],
    'items': [
      ('⚪','RO-bøttehatt (hvit)','RO bucket hat (white)',
       'Hvit hatt med blå RO og flagg foran og bølger bak. Tre størrelser.',
       'White hat with blue RO and flag on the front and waves on the back. Three sizes.'),
      ('🔴','NORWAY-bøttehatt (rød)','NORWAY bucket hat (red)',
       'Rød hatt med NORWAY i blokkbokstaver og flagget bak. Tre størrelser.',
       'Red hat with NORWAY in block letters and the flag on the back. Three sizes.'),
      ('🇳🇴','NORGE-bøttehatt, 3 varianter','NORGE bucket hat, 3 versions',
       'Maskesting, blokkbokstaver og innstrikket, alle i tre størrelser.',
       'Duplicate stitch, block letters and knitted-in, all in three sizes.'),
      ('🧣','Norge-skaut','Norway kerchief',
       'Trekantet skaut med bølger og flaggstriper, som passer til hattene.',
       'Triangular kerchief with waves and flag stripes, matching the hats.'),
      ('📄','Alle PDF-ene i LME-stil','All the PDFs in LME style',
       'Klare til utskrift på A4, med diagram og steg for steg.',
       'Ready to print on A4, with charts and step by step.'),
    ],
  },
]

import json
LINKS = json.loads(pathlib.Path(__file__).with_name('stripe_links.json').read_text(encoding='utf-8'))
for p in PRODUCTS:
    p['stripe_no'] = LINKS[p['id']]['no']
    p['stripe_en'] = LINKS[p['id']]['en']
    (OUT / f"{p['id']}.html").write_text(page(p), encoding='utf-8')
    print('skrev', p['id'] + '.html  ->  NOK', p['stripe_no'], ' USD', p['stripe_en'])
