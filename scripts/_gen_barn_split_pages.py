# -*- coding: utf-8 -*-
"""Genererer 11 produktsider (butikk/bottehatter-barn-<familie>-<variant>.html) for de
splittede barne-bøttehatt-oppskriftene, én side per hatt i stedet for én samle-side per teknikk."""
import pathlib

BASE = pathlib.Path(__file__).parent.parent / 'butikk'

LINKS = {
    "bottehatter-barn-strikk-norge": ("https://buy.stripe.com/fZu4gA3JPfzN9id5559R70b", "https://buy.stripe.com/cNi4gAgwBbjx51XeFF9R70c"),
    "bottehatter-barn-strikk-norway": ("https://buy.stripe.com/4gMcN63JPevJgKF2WX9R70d", "https://buy.stripe.com/9B628s805gDR9ideFF9R70e"),
    "bottehatter-barn-strikk-ro": ("https://buy.stripe.com/3cI8wQgwBaftcupapp9R70f", "https://buy.stripe.com/9B6cN63JPgDRgKFcxx9R70g"),
    "bottehatter-barn-strikk-brodert-norge": ("https://buy.stripe.com/14A00k4NT4V9cup8hh9R70h", "https://buy.stripe.com/fZubJ2dkp5Zdcup6999R70i"),
    "bottehatter-barn-strikk-brodert-norway": ("https://buy.stripe.com/dRm14ogwB4V92TP8hh9R70j", "https://buy.stripe.com/cNi14o3JPgDR8e9app9R70k"),
    "bottehatter-barn-strikk-brodert-ro": ("https://buy.stripe.com/8x2fZi3JPevJfGB8hh9R70l", "https://buy.stripe.com/3cI9AU1BH3R51PL9ll9R70m"),
    "bottehatter-barn-hekle-norge": ("https://buy.stripe.com/8x2aEY9494V9gKFbtt9R70n", "https://buy.stripe.com/cNi28s0xD4V951XgNN9R70o"),
    "bottehatter-barn-hekle-norway": ("https://buy.stripe.com/28E14o3JP73h6614119R70p", "https://buy.stripe.com/dRmeVe1BHaft3XTbtt9R70q"),
    "bottehatter-barn-hekle-ro": ("https://buy.stripe.com/bJe7sMa8dfzN0LHapp9R70r", "https://buy.stripe.com/14A00k6W14V98e9fJJ9R70s"),
    "bottehatter-barn-hekle-rune-norge": ("https://buy.stripe.com/00waEY0xDaftgKFfJJ9R70t", "https://buy.stripe.com/aFacN63JPaftbqlcxx9R70u"),
    "bottehatter-barn-hekle-rune-norway": ("https://buy.stripe.com/cNi9AUfsx87l8e98hh9R70v", "https://buy.stripe.com/3cI00k1BH1IX9id1ST9R70w"),
}

def esc_attr(s):
    return s.replace('"', '&quot;')

PAGE_TMPL = '''<!DOCTYPE html>
<html lang="no">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
<meta name="theme-color" content="#F8D7DA">
<title>{title_no} | LME Butikk</title>
<meta name="description" content="{meta_desc}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Playpen+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
  @font-face {{
    font-family: 'Sasson Montessori';
    src: url('/fonts/SassoonMontessori.woff2') format('woff2'),
         url('/fonts/SassoonMontessori.ttf') format('truetype');
    font-weight: normal; font-style: normal; font-display: swap;
  }}
  :root {{
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
  }}
  * {{ box-sizing: border-box; margin: 0; padding: 0; }}
  html {{ scroll-behavior: smooth; }}
  body {{ font-family: var(--font-body); background: linear-gradient(180deg,#FDF0F1 0%,var(--cream) 340px);
    color: var(--ink); -webkit-font-smoothing: antialiased; }}
  h1,h2,h3,h4 {{ font-family: var(--font-head); }}
  button,input,select,textarea {{ font-family: var(--font-body); }}
  a {{ color: inherit; }}
  .topbar {{ max-width: 1060px; margin: 0 auto; padding: 18px 20px 0;
    display: flex; align-items: center; justify-content: space-between; gap: 12px; }}
  .topbar .logo img {{ height: 52px; display: block; }}
  .topbar-right {{ display: flex; align-items: center; gap: 10px; }}
  .back-link {{ display: inline-flex; align-items: center; gap: 6px; background: #fff;
    border: 1px solid var(--line); border-radius: var(--r-pill); padding: 9px 16px;
    font-size: 13px; font-weight: 700; text-decoration: none; box-shadow: var(--shadow-sm); transition: all .2s ease; }}
  .back-link:hover {{ border-color: var(--cerise); color: var(--cerise); }}
  .lang-btn {{ background: var(--cerise); color: #fff; border: none; cursor: pointer;
    border-radius: var(--r-pill); padding: 10px 16px; font-size: 13px; font-weight: 700;
    box-shadow: var(--shadow-sm); transition: transform .2s ease; }}
  .lang-btn:hover {{ transform: translateY(-1px); }}
  main {{ max-width: 1060px; margin: 0 auto; padding: 26px 20px 70px; }}
  .crumbs {{ font-size: 13px; color: var(--ink-muted); margin-bottom: 22px; }}
  .crumbs a {{ text-decoration: none; }} .crumbs a:hover {{ color: var(--cerise); }}
  .crumbs .sep {{ margin: 0 6px; }}
  .hero {{ text-align: center; margin-bottom: 26px; }}
  .kicker {{ display: inline-block; font-size: 12px; font-weight: 700; letter-spacing: .14em;
    text-transform: uppercase; color: var(--cerise); margin-bottom: 10px; }}
  .hero h1 {{ font-size: clamp(30px,5vw,46px); line-height: 1.12; margin-bottom: 12px; }}
  .hero h1 em {{ font-style: normal; color: var(--cerise); }}
  .hero .sub {{ font-size: 17px; color: var(--ink-soft); max-width: 640px; margin: 0 auto; line-height: 1.55; }}
  .cover-card {{ background: #fff; border-radius: var(--r-lg); box-shadow: var(--shadow-lg); padding: 14px; margin-bottom: 34px; }}
  .cover-card img {{ width: 100%; height: auto; display: block; border-radius: var(--r-md); }}
  .cover-note {{ text-align: center; font-size: 12.5px; color: var(--ink-muted); padding: 10px 6px 2px; }}
  .layout {{ display: grid; grid-template-columns: 1.5fr 1fr; gap: 26px; align-items: start; }}
  .includes {{ background: #fff; border-radius: var(--r-lg); box-shadow: var(--shadow-md); padding: 28px; }}
  .includes h2 {{ font-size: 24px; margin-bottom: 6px; }}
  .includes .lead {{ font-size: 14.5px; color: var(--ink-soft); margin-bottom: 18px; line-height: 1.5; }}
  .item {{ display: flex; gap: 14px; padding: 13px 0; border-top: 1px solid var(--line); }}
  .item:first-of-type {{ border-top: none; }}
  .item .emoji {{ width: 44px; height: 44px; border-radius: var(--r-sm); background: var(--cream);
    display: grid; place-items: center; font-size: 22px; flex-shrink: 0; }}
  .item h3 {{ font-size: 16px; margin-bottom: 2px; }}
  .item p {{ font-size: 13.5px; color: var(--ink-soft); line-height: 1.45; }}
  .buy-box {{ background: #fff; border-radius: var(--r-lg); box-shadow: var(--shadow-md); padding: 26px; position: sticky; top: 20px; }}
  .buy-box .tag {{ display: inline-block; background: var(--lime); border-radius: var(--r-pill);
    font-size: 11px; font-weight: 700; letter-spacing: .1em; padding: 5px 12px; margin-bottom: 12px; }}
  .buy-box .price {{ font-size: 38px; font-weight: 700; font-family: var(--font-body); }}
  .buy-box .price-sub {{ font-size: 13px; color: var(--ink-muted); margin-bottom: 16px; }}
  .pay-label {{ font-size: 12px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase;
    color: var(--ink-muted); margin: 6px 0 10px; }}
  .pay-methods {{ font-size: 12.5px; color: var(--ink-muted); text-align: center; margin: 2px 0 4px; }}
  .btn-buy {{ display: flex; align-items: center; justify-content: center; gap: 8px; text-align: center;
    border-radius: var(--r-pill); padding: 14px 20px; font-size: 15.5px; font-weight: 700;
    text-decoration: none; box-shadow: var(--shadow-sm); transition: all .2s ease; margin-bottom: 10px; }}
  .btn-buy:hover {{ transform: translateY(-1px); }}
  .btn-vipps {{ background: var(--vipps); color: #fff; }}
  .btn-vipps:hover {{ background: var(--vipps-hover); }}
  .btn-card {{ background: var(--btn-yellow); color: var(--ink); }}
  .btn-card:hover {{ background: var(--btn-yellow-hover); }}
  .btn-paypal {{ background: #fff; color: #003087; border: 2px solid #003087; }}
  .btn-paypal:hover {{ background: #f4f7fd; }}
  .fine {{ font-size: 12.5px; color: var(--ink-muted); line-height: 1.5; margin-top: 14px; }}
  .fine li {{ margin: 6px 0 0 18px; }}
  .fact-row {{ display: flex; flex-wrap: wrap; gap: 8px; margin: 14px 0 18px; }}
  .fact {{ background: var(--cream); border-radius: var(--r-pill); padding: 7px 14px; font-size: 12.5px; font-weight: 700; }}
  footer {{ text-align: center; padding: 26px 20px 44px; font-size: 13px; color: var(--ink-muted); }}
  footer a {{ color: var(--cerise); }}
  @media (max-width: 860px) {{ .layout {{ grid-template-columns: 1fr; }} .buy-box {{ position: static; }} }}
</style>
<link rel="manifest" href="/manifest.webmanifest">
<link rel="apple-touch-icon" href="/images/app/apple-touch-icon.png">
</head>
<body>

<div class="topbar">
  <a href="/dashboard" class="logo"><img src="/images/lme-logo.png" alt="Little Montessori Explorers"></a>
  <div class="topbar-right">
    <a href="{back_href}" class="back-link" data-no="&larr; Tilbake til {back_no}" data-en="&larr; Back to {back_en}">&larr; Tilbake til {back_no}</a>
    <button class="lang-btn" id="langToggle">EN &#127760;</button>
  </div>
</div>

<main>
  <nav class="crumbs">
    <a href="/dashboard" data-no="Dashbord" data-en="Dashboard">Dashbord</a><span class="sep">/</span><a href="/butikk" data-no="Butikk" data-en="Shop">Butikk</a><span class="sep">/</span><a href="{back_href}" data-no="{back_no}" data-en="{back_en}">{back_no}</a><span class="sep">/</span><span data-no="{crumb_no}" data-en="{crumb_en}">{crumb_no}</span>
  </nav>

  <section class="hero">
    <span class="kicker" data-no="{kicker_no}" data-en="{kicker_en}">{kicker_no}</span>
    <h1 data-no="{h1_no}" data-en="{h1_en}">{h1_no_render}</h1>
    <p class="sub" data-no="{sub_no}" data-en="{sub_en}">{sub_no}</p>
  </section>

  <div class="cover-card">
    <img src="{cover}" alt="{alt_no}">
    <p class="cover-note" data-no="{cover_note_no}" data-en="{cover_note_en}">{cover_note_no}</p>
  </div>

  <div class="layout">
    <section class="includes">
      <h2 data-no="Dette f&aring;r du" data-en="What you get">Dette f&aring;r du</h2>
      <p class="lead" data-no="{lead_no}" data-en="{lead_en}">{lead_no}</p>
{items}
    </section>

    <aside class="buy-box">
      <span class="tag" data-no="{tag_no}" data-en="{tag_en}">{tag_no}</span>
      <div class="price" data-no="99 kr" data-en="$9">99 kr</div>
      <p class="price-sub" data-no="Engangskj&oslash;p &middot; digital PDF-nedlasting" data-en="One-time purchase &middot; digital PDF download">Engangskj&oslash;p &middot; digital PDF-nedlasting</p>

      <div class="fact-row">
        <span class="fact" data-no="Str. 50&ndash;170" data-en="Size 50&ndash;170">Str. 50&ndash;170</span> <span class="fact" data-no="Skriv ut selv" data-en="Print at home">Skriv ut selv</span> <span class="fact" data-no="Av Renate Dahl" data-en="By Renate Dahl">Av Renate Dahl</span>
      </div>

      <a class="btn-buy btn-card" href="{no_url}" data-no-href="{no_url}" data-en-href="{en_url}" data-no="Kj&oslash;p n&aring;, 99 kr &rarr;" data-en="Buy now, $9 &rarr;">Kj&oslash;p n&aring;, 99 kr &rarr;</a>
      <p class="pay-methods" data-no="Betal trygt med kort, Vipps eller PayPal" data-en="Pay securely with card, Vipps or PayPal">Betal trygt med kort, Vipps eller PayPal</p>

      <ul class="fine">
        <li data-no="Digital PDF i LME-stil, klar til utskrift hjemme." data-en="Digital PDF in LME style, ready to print at home.">Digital PDF i LME-stil, klar til utskrift hjemme.</li>
        <li data-no="Trygg betaling. Nedlastingen kommer rett etter kj&oslash;pet." data-en="Secure payment. The download is available right after purchase.">Trygg betaling. Nedlastingen kommer rett etter kj&oslash;pet.</li>
        <li data-no="Sp&oslash;rsm&aring;l? Svar p&aring; kvitteringen, s&aring; hjelper jeg deg." data-en="Questions? Reply to your receipt and I'll help you.">Sp&oslash;rsm&aring;l? Svar p&aring; kvitteringen, s&aring; hjelper jeg deg.</li>
      </ul>
    </aside>
  </div>
</main>

<footer>
  <span data-no="Little Montessori Explorers &middot; av Renate Dahl" data-en="Little Montessori Explorers &middot; by Renate Dahl">Little Montessori Explorers &middot; av Renate Dahl</span>
  &middot; <a href="/butikk" data-no="Tilbake til butikken" data-en="Back to the shop">Tilbake til butikken</a>
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
    toggle.textContent = lang === 'no' ? 'EN \\ud83c\\udf0d' : 'NO \\ud83c\\udded\\ud83c\\uddf4';
    document.title = lang === 'no' ? '{title_no}' : '{title_en}';
    try {{ localStorage.setItem('lme_lang', lang); }} catch (e) {{}}
  }}
  toggle.addEventListener('click', () => switchLanguage(currentLang === 'no' ? 'en' : 'no'));
  (function () {{
    const urlLang = new URLSearchParams(location.search).get('lang');
    let saved = null; try {{ saved = localStorage.getItem('lme_lang'); }} catch (e) {{}}
    const lang = urlLang || saved; if (lang === 'en') switchLanguage('en');
  }})();
</script>
<script src="/js/lme-visibility.js?v=8" defer></script>
<script src="/js/lme-account.js?v=11" defer></script>
<script src="/js/renate-widget.js?v=5" defer></script>
</body>
</html>
'''

def item(emoji, h3_no, h3_en, p_no, p_en):
    return f'''      <div class="item">
        <span class="emoji">{emoji}</span>
        <div>
          <h3 data-no="{esc_attr(h3_no)}" data-en="{esc_attr(h3_en)}">{h3_no}</h3>
          <p data-no="{esc_attr(p_no)}" data-en="{esc_attr(p_en)}">{p_no}</p>
        </div>
      </div>'''


def build(slug, cover, back_href, back_no, back_en, crumb_no, crumb_en,
          kicker_no, kicker_en, h1_no, h1_en, sub_no, sub_en,
          alt_no, cover_note_no, cover_note_en, lead_no, lead_en, items_html,
          tag_no, tag_en, title_no, title_en, meta_desc):
    no_url, en_url = LINKS[slug]
    h1_no_render = h1_no.replace('&lt;em&gt;', '<em>').replace('&lt;/em&gt;', '</em>')
    html = PAGE_TMPL.format(
        title_no=title_no, title_en=title_en, meta_desc=meta_desc,
        back_href=back_href, back_no=back_no, back_en=back_en,
        crumb_no=crumb_no, crumb_en=crumb_en,
        kicker_no=kicker_no, kicker_en=kicker_en,
        h1_no=h1_no, h1_en=h1_en, h1_no_render=h1_no_render,
        sub_no=sub_no, sub_en=sub_en,
        cover=cover, alt_no=alt_no,
        cover_note_no=cover_note_no, cover_note_en=cover_note_en,
        lead_no=lead_no, lead_en=lead_en, items=items_html,
        tag_no=tag_no, tag_en=tag_en,
        no_url=no_url, en_url=en_url,
    )
    (BASE / f'{slug}.html').write_text(html, encoding='utf-8')
    print('wrote', slug)


# ---------------------------------------------------------------------------
# STRIKK (fair isle colorwork) — norge / norway / ro
# ---------------------------------------------------------------------------
STRIKK_COVER = '/images/oppskrift-bottehatter-barn-strikk.jpg'
for word, brim_no, brim_en, motiv_no, motiv_en in [
    ('NORGE', 'stripet brem i rødt/hvitt/marineblått', 'striped red/white/navy brim',
     '«NORGE» strikket inn tvers over pannen', 'the word «NORGE» knitted in across the forehead'),
    ('NORWAY', 'stripet brem i rødt/hvitt/marineblått', 'striped red/white/navy brim',
     '«NORWAY» strikket inn tvers over pannen', 'the word «NORWAY» knitted in across the forehead'),
    ('RO', 'ensfarget marineblå brem', 'solid navy brim',
     '«RO» og et lite flagg strikket inn', 'the letters «RO» plus a small flag knitted in'),
]:
    slug = f'bottehatter-barn-strikk-{word.lower()}'
    items = '\n'.join([
        item('&#129522;', 'Flerfargestrikk (fair isle)', 'Stranded colourwork (fair isle)',
             'Motivet strikkes inn samtidig med hoveddelen, med to farger i hver omgang, forklart steg for steg.',
             'The motif is knitted in at the same time as the main body, with two colours in every round, explained step by step.'),
        item('&#127991;&#65039;', f'{word}-motiv i egen oppskrift', f'{word} motif in its own pattern',
             f'{motiv_no.capitalize()}, {brim_no}.', f'{motiv_en.capitalize()}, {brim_en}.'),
        item('&#128118;', '21 størrelser, 50–170', '21 sizes, 50–170',
             'Fra nyfødt til 14–16 år, med hodemål-tabell så du treffer riktig størrelse.',
             'From newborn to 14–16 years, with a head-measurement table so you get the right size.'),
        item('&#128207;', 'Full størrelsestabell for alt', 'Full size table for everything',
             'Bremmen og hoveddelen har egne tabeller for alle 21 størrelsene.',
             'The brim and main body both have their own tables for all 21 sizes.'),
        item('&#128196;', '12-siders PDF, komplett', '12-page PDF, complete',
             'Trinn for trinn fra opplegging til ferdig hatt. Ingen andre oppskrifter trengs.',
             'Step by step from cast-on to finished hat. No other pattern needed.'),
    ])
    build(
        slug=slug, cover=STRIKK_COVER,
        back_href='/butikk/strikk-barn', back_no='Strikk, barn', back_en='Knitting, kids',
        crumb_no=f'{word}-bøttehatt barn, strikk', crumb_en=f'{word} bucket hat kids, knit',
        kicker_no=f'STRIKKEOPPSKRIFT &middot; {word} &middot; STR. 50–170',
        kicker_en=f'KNITTING PATTERN &middot; {word} &middot; SIZE 50–170',
        h1_no=f'{word}-b&#248;ttehatt &lt;em&gt;barn&lt;/em&gt;', h1_en=f'{word} bucket hat &lt;em&gt;kids&lt;/em&gt;',
        sub_no=f'Samme bøttehatt som {word}-oppskriften for voksne, med {motiv_no} og en {brim_no}. Gradert fra bunnen av til tjueen babyer-, barne- og ungdomsstørrelser, 50 til 170. Komplett i seg selv, du trenger ikke eie noen annen LME-oppskrift.',
        sub_en=f'The same bucket hat as the {word} pattern for adults, with {motiv_en} and a {brim_en}. Graded from scratch into twenty-one baby, child and teen sizes, 50 to 170. Complete on its own, you do not need any other LME pattern.',
        alt_no=f'{word}-bøttehatt barn, strikkeoppskrift',
        cover_note_no=f'{motiv_no.capitalize()}, {brim_no}.', cover_note_en=f'{motiv_en.capitalize()}, {brim_en}.',
        lead_no='En komplett strikkeoppskrift i LME-stil, med diagram og steg for steg.',
        lead_en='A complete knitting pattern in LME style, with a chart and step by step.',
        items_html=items,
        tag_no='STRIKKEOPPSKRIFT', tag_en='KNITTING PATTERN',
        title_no=f'{word}-bøttehatt barn, strikkeoppskrift', title_en=f'{word} bucket hat kids, knitting pattern',
        meta_desc=f'{word}-bøttehatt for baby og barn, strikket i rødt/hvitt/marineblått med flerfargestrikk. Str. 50–170, komplett i seg selv med diagram og steg for steg.',
    )

# ---------------------------------------------------------------------------
# STRIKK-BRODERT (duplicate stitch) — norge / norway / ro
# ---------------------------------------------------------------------------
BRODERT_COVER = '/images/oppskrift-bottehatter-barn-strikk-brodert.jpg'
for word, brim_no, brim_en in [
    ('NORGE', 'stripet brem i rødt/hvitt/marineblatt'.replace('blatt', 'blått'), 'striped red/white/navy brim'),
    ('NORWAY', 'stripet brem i rødt/hvitt/marineblatt'.replace('blatt', 'blått'), 'striped red/white/navy brim'),
    ('RO', 'ensfarget marineblå brem', 'solid navy brim'),
]:
    slug = f'bottehatter-barn-strikk-brodert-{word.lower()}'
    items = '\n'.join([
        item('&#129498;', 'Brodert, ikke strikket inn', 'Embroidered, not knitted in',
             'Hele hatten strikkes ensfarget, motivet legges på til slutt med maskesting (duplikatsting), steg for steg.',
             'The whole hat is knitted in one colour, the motif is added at the end with duplicate stitch, step by step.'),
        item('&#127991;&#65039;', f'{word}-motiv i egen oppskrift', f'{word} motif in its own pattern',
             f'{word} brodert på tvers over pannen, {brim_no}.', f'{word} embroidered across the forehead, {brim_en}.'),
        item('&#128118;', '21 størrelser, 50–170', '21 sizes, 50–170',
             'Fra nyfødt til 14–16 år, med hodemål-tabell så du treffer riktig størrelse.',
             'From newborn to 14–16 years, with a head-measurement table so you get the right size.'),
        item('&#128207;', 'Full størrelsestabell for alt', 'Full size table for everything',
             'Bremmen og hoveddelen har egne tabeller for alle 21 størrelsene.',
             'The brim and main body both have their own tables for all 21 sizes.'),
        item('&#128196;', '13-siders PDF, komplett', '13-page PDF, complete',
             'Trinn for trinn fra opplegging til ferdig, brodert hatt. Ingen andre oppskrifter trengs.',
             'Step by step from cast-on to finished, embroidered hat. No other pattern needed.'),
    ])
    build(
        slug=slug, cover=BRODERT_COVER,
        back_href='/butikk/strikk-barn', back_no='Strikk, barn', back_en='Knitting, kids',
        crumb_no=f'{word}-bøttehatt barn, brodert', crumb_en=f'{word} bucket hat kids, duplicate stitch',
        kicker_no=f'STRIKKEOPPSKRIFT &middot; {word} &middot; BRODERT &middot; STR. 50–170',
        kicker_en=f'KNITTING PATTERN &middot; {word} &middot; DUPLICATE STITCH &middot; SIZE 50–170',
        h1_no=f'{word}-b&#248;ttehatt barn, &lt;em&gt;brodert&lt;/em&gt;', h1_en=f'{word} bucket hat kids, &lt;em&gt;duplicate stitch&lt;/em&gt;',
        sub_no=f'Samme bøttehatt som {word}-oppskriften for voksne, med bokstavene brodert på med maskesting (duplikatsting) etter at hatten er strikket ferdig, ikke strikket inn. Gradert fra bunnen av til tjueen babyer-, barne- og ungdomsstørrelser, 50 til 170. Komplett i seg selv, du trenger ikke eie noen annen LME-oppskrift.',
        sub_en=f'The same bucket hat as the {word} pattern for adults, with the letters added afterwards using duplicate stitch, not knitted in. Graded from scratch into twenty-one baby, child and teen sizes, 50 to 170. Complete on its own, you do not need any other LME pattern.',
        alt_no=f'{word}-bøttehatt barn, brodert strikkeoppskrift',
        cover_note_no=f'Ensfarget hatt, med {word} brodert på til slutt med maskesting.',
        cover_note_en=f'Solid-colour hat, with {word} embroidered on at the end with duplicate stitch.',
        lead_no='En komplett strikkeoppskrift i LME-stil, med broderidiagram og steg for steg.',
        lead_en='A complete knitting pattern in LME style, with an embroidery chart and step by step.',
        items_html=items,
        tag_no='STRIKKEOPPSKRIFT', tag_en='KNITTING PATTERN',
        title_no=f'{word}-bøttehatt barn, brodert strikkeoppskrift', title_en=f'{word} bucket hat kids, duplicate stitch pattern',
        meta_desc=f'{word}-bøttehatt for baby og barn, strikket ensfarget og brodert med maskesting. Str. 50–170, komplett i seg selv med diagram og steg for steg.',
    )

# ---------------------------------------------------------------------------
# HEKLE (single crochet colorwork) — norge / norway / ro
# ---------------------------------------------------------------------------
HEKLE_COVER = '/images/oppskrift-bottehatter-barn-hekle.jpg'
for word, brim_no, brim_en, motiv_no, motiv_en in [
    ('NORGE', 'bølget brem som avsluttes i rødt/hvitt/marineblått', 'wavy brim finishing in red/white/navy',
     '«NORGE» heklet inn tvers over pannen', 'the word «NORGE» crocheted in across the forehead'),
    ('NORWAY', 'bølget brem som avsluttes i rødt/hvitt/marineblått', 'wavy brim finishing in red/white/navy',
     '«NORWAY» heklet inn tvers over pannen', 'the word «NORWAY» crocheted in across the forehead'),
    ('RO', 'ensfarget marineblå brem', 'solid navy brim',
     '«RO» og et lite flagg heklet inn', 'the letters «RO» plus a small flag crocheted in'),
]:
    slug = f'bottehatter-barn-hekle-{word.lower()}'
    items = '\n'.join([
        item('&#129508;', 'Fastmasker i spiral', 'Single crochet in a spiral',
             'Hatten hekles i spiral fra en magic ring, ovenfra og ned, forklart steg for steg.',
             'The hat is crocheted in a spiral from a magic ring, top down, explained step by step.'),
        item('&#127991;&#65039;', f'{word}-motiv i egen oppskrift', f'{word} motif in its own pattern',
             f'{motiv_no.capitalize()}, {brim_no}.', f'{motiv_en.capitalize()}, {brim_en}.'),
        item('&#128118;', '21 størrelser, 50–170', '21 sizes, 50–170',
             'Fra nyfødt til 14–16 år, med hodemål-tabell så du treffer riktig størrelse.',
             'From newborn to 14–16 years, with a head-measurement table so you get the right size.'),
        item('&#128207;', 'Full størrelsestabell for alt', 'Full size table for everything',
             'Toppen, sidene og bremmen har egne tabeller for alle 21 størrelsene.',
             'The top, sides and brim all have their own tables for all 21 sizes.'),
        item('&#128196;', '12-siders PDF, komplett', '12-page PDF, complete',
             'Trinn for trinn fra magic ring til ferdig hatt. Ingen andre oppskrifter trengs.',
             'Step by step from magic ring to finished hat. No other pattern needed.'),
    ])
    build(
        slug=slug, cover=HEKLE_COVER,
        back_href='/butikk/hekle-barn', back_no='Hekle, barn', back_en='Crochet, kids',
        crumb_no=f'{word}-bøttehatt barn, hekle', crumb_en=f'{word} bucket hat kids, crochet',
        kicker_no=f'HEKLEOPPSKRIFT &middot; {word} &middot; STR. 50–170',
        kicker_en=f'CROCHET PATTERN &middot; {word} &middot; SIZE 50–170',
        h1_no=f'{word}-b&#248;ttehatt &lt;em&gt;barn&lt;/em&gt;', h1_en=f'{word} bucket hat &lt;em&gt;kids&lt;/em&gt;',
        sub_no=f'Samme bøttehatt som {word}-oppskriften for voksne, heklet i fastmasker, med {motiv_no} og en {brim_no}. Gradert fra bunnen av til tjueen babyer-, barne- og ungdomsstørrelser, 50 til 170. Komplett i seg selv, du trenger ikke eie noen annen LME-oppskrift.',
        sub_en=f'The same bucket hat as the {word} pattern for adults, crocheted in single crochet, with {motiv_en} and a {brim_en}. Graded from scratch into twenty-one baby, child and teen sizes, 50 to 170. Complete on its own, you do not need any other LME pattern.',
        alt_no=f'{word}-bøttehatt barn, hekleoppskrift',
        cover_note_no=f'{motiv_no.capitalize()}, {brim_no}.', cover_note_en=f'{motiv_en.capitalize()}, {brim_en}.',
        lead_no='En komplett hekleoppskrift i LME-stil, med diagram og steg for steg.',
        lead_en='A complete crochet pattern in LME style, with a chart and step by step.',
        items_html=items,
        tag_no='HEKLEOPPSKRIFT', tag_en='CROCHET PATTERN',
        title_no=f'{word}-bøttehatt barn, hekleoppskrift', title_en=f'{word} bucket hat kids, crochet pattern',
        meta_desc=f'{word}-bøttehatt for baby og barn, heklet i fastmasker i rødt/hvitt/marineblått. Str. 50–170, komplett i seg selv med diagram og steg for steg.',
    )

# ---------------------------------------------------------------------------
# HEKLE-RUNE (surface crochet rune letters) — norge / norway
# ---------------------------------------------------------------------------
RUNE_COVER = '/images/oppskrift-bottehatter-barn-hekle-rune.jpg'
for word in ['NORGE', 'NORWAY']:
    slug = f'bottehatter-barn-hekle-rune-{word.lower()}'
    items = '\n'.join([
        item('&#129508;', 'Ensfarget hekling, ovenfra og ned', 'Solid-colour crochet, top down',
             'Hele hatten hekles ensfarget i fastmasker, i spiral fra en magic ring.',
             'The whole hat is crocheted in a single colour in single crochet, in a spiral from a magic ring.'),
        item('&#9992;&#65039;', 'Runeskrift-bokstaver på overflaten', 'Rune-style letters on the surface',
             f'{word} hekles på til slutt med overflate-hekling eller en sydd snor, pluss et lite flagg på toppen.',
             f'{word} is crocheted on at the end with surface crochet or a sewn cord, plus a small flag on the top.'),
        item('&#128118;', '21 størrelser, 50–170', '21 sizes, 50–170',
             'Fra nyfødt til 14–16 år, med hodemål-tabell så du treffer riktig størrelse.',
             'From newborn to 14–16 years, with a head-measurement table so you get the right size.'),
        item('&#128207;', 'Egen bokstavmal og plassering', 'Own letter template and placement',
             'Størrelse og plassering av bokstavene er tabellert for alle 21 størrelsene.',
             'The size and placement of the letters are tabled for all 21 sizes.'),
        item('&#128196;', '14-siders PDF, komplett', '14-page PDF, complete',
             'Trinn for trinn fra magic ring til ferdig hatt med runeskrift. Ingen andre oppskrifter trengs.',
             'Step by step from magic ring to a finished rune-letter hat. No other pattern needed.'),
    ])
    build(
        slug=slug, cover=RUNE_COVER,
        back_href='/butikk/hekle-barn', back_no='Hekle, barn', back_en='Crochet, kids',
        crumb_no=f'{word}-bøttehatt barn, runeskrift', crumb_en=f'{word} bucket hat kids, rune letters',
        kicker_no=f'HEKLEOPPSKRIFT &middot; {word} &middot; RUNESKRIFT &middot; STR. 50–170',
        kicker_en=f'CROCHET PATTERN &middot; {word} &middot; RUNE LETTERS &middot; SIZE 50–170',
        h1_no=f'{word}-b&#248;ttehatt barn, &lt;em&gt;runeskrift&lt;/em&gt;', h1_en=f'{word} bucket hat kids, &lt;em&gt;rune letters&lt;/em&gt;',
        sub_no=f'Samme bøttehatt som NORGE-runehatt-oppskriften for voksne, heklet ensfarget og heklet med {word} på til slutt i lesbare runestil-bokstaver, pluss et lite norsk flagg på toppen. Gradert fra bunnen av til tjueen babyer-, barne- og ungdomsstørrelser, 50 til 170. Komplett i seg selv, du trenger ikke eie noen annen LME-oppskrift.',
        sub_en=f'The same bucket hat as the adult NORGE rune hat pattern, crocheted in a single colour, then crocheted with {word} on at the end in readable rune-style letters, plus a small Norwegian flag on the top. Graded from scratch into twenty-one baby, child and teen sizes, 50 to 170. Complete on its own, you do not need any other LME pattern.',
        alt_no=f'{word}-bøttehatt barn, runeskrift hekleoppskrift',
        cover_note_no=f'Ensfarget hatt, med {word} heklet på i runestil til slutt.',
        cover_note_en=f'Solid-colour hat, with {word} crocheted on in rune style at the end.',
        lead_no='En komplett hekleoppskrift i LME-stil, med bokstavmal og steg for steg.',
        lead_en='A complete crochet pattern in LME style, with a letter template and step by step.',
        items_html=items,
        tag_no='HEKLEOPPSKRIFT', tag_en='CROCHET PATTERN',
        title_no=f'{word}-bøttehatt barn, runeskrift hekleoppskrift', title_en=f'{word} bucket hat kids, rune letters pattern',
        meta_desc=f'{word}-bøttehatt for baby og barn, heklet ensfarget med {word} i runestil på overflaten. Str. 50–170, komplett i seg selv med bokstavmal og steg for steg.',
    )

print('done')
