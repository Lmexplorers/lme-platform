# -*- coding: utf-8 -*-
"""Genererer LME-strikkeoppskrift (Bøttehatter barn, NORGE/NORWAY/RO) som HTML klar for PDF-print."""
import base64, html, pathlib

BASE = pathlib.Path(__file__).parent
PHOTO = BASE / 'barn_strikk_ref.jpg'
LOGO = BASE / 'lme-logo.png'

# ---------- farger ----------
TEAL   = '#4aa7a4'
RED    = '#C8102E'
NAVY   = '#00205B'
WHITE  = '#FFFFFF'
CREAM  = '#F8F4EA'
INK    = '#3f3f3f'
PINK   = '#df5f93'
CERISE = '#E91E89'

# ---------- 5x7 bokstavfont til de små barnediagrammene ----------
F5 = {
 'N': ["#...#","##..#","#.#.#","#.#.#","#.#.#","#..##","#...#"],
 'O': [".###.","#...#","#...#","#...#","#...#","#...#",".###."],
 'R': ["####.","#...#","#...#","####.","#.#..","#..#.","#...#"],
 'G': [".###.","#...#","#....","#.###","#...#","#...#",".###."],
 'E': ["#####","#....","#....","####.","#....","#....","#####"],
 'W': ["#...#","#...#","#...#","#.#.#","#.#.#","##.##","#...#"],
 'A': [".###.","#...#","#...#","#####","#...#","#...#","#...#"],
 'Y': ["#...#","#...#",".#.#.","..#..","..#..","..#..","..#.."],
}
def word_chart(word, gap=1):
    rows = ["" for _ in range(7)]
    for i, ch in enumerate(word):
        glyph = F5[ch]
        for r in range(7):
            rows[r] += glyph[r]
        if i != len(word) - 1:
            for r in range(7):
                rows[r] += "." * gap
    return rows

NORGE_CHART = word_chart("NORGE")
NORWAY_CHART = word_chart("NORWAY")

FLAG10 = [
    "RRRWBBWRRRRRR", "RRRWBBWRRRRRR", "RRRWBBWRRRRRR",
    "WWWWBBWWWWWWW", "BBBBBBBBBBBBB", "BBBBBBBBBBBBB", "WWWWBBWWWWWWW",
    "RRRWBBWRRRRRR", "RRRWBBWRRRRRR", "RRRWBBWRRRRRR",
]
FLAG7 = [FLAG10[0], FLAG10[1], FLAG10[3], FLAG10[4], FLAG10[6], FLAG10[8], FLAG10[9]]
RO_CHART = word_chart("RO")
RO_FLAG_CHART = ["".join([RO_CHART[r], ".", FLAG7[r]]) for r in range(7)]

CMAP_LETTERS = {'#': NAVY, '.': WHITE}
CMAP_ROFLAG = {'#': WHITE, '.': RED, 'R': RED, 'W': WHITE, 'B': NAVY}
# RO_CHART reuses '#'/'.' from word_chart; recolor for RO on blue brim (white letters)
RO_CHART_ON_BLUE = {'#': WHITE, '.': NAVY}


def chart_svg(rows, cmap, cell=22, numbers=False, title=None):
    w, h = len(rows[0]), len(rows)
    pad_b = 4
    pad_r = 30 if numbers else 4
    W, H = w * cell + 8 + pad_r, h * cell + 8 + pad_b
    p = [f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" '
         f'style="width:{W*0.28}mm;height:{H*0.28}mm">']
    for y, row in enumerate(rows):
        for x, ch in enumerate(row):
            fill = cmap[ch]
            p.append(f'<rect x="{4+x*cell}" y="{4+y*cell}" width="{cell}" height="{cell}" '
                     f'fill="{fill}" stroke="rgba(0,0,0,0.28)" stroke-width="1"/>')
    p.append(f'<rect x="4" y="4" width="{w*cell}" height="{h*cell}" fill="none" '
             f'stroke="#3f3f3f" stroke-width="2.5" rx="1"/>')
    if numbers:
        for y in range(h):
            n = h - y
            yy = 4 + y*cell + cell/2 + 4
            p.append(f'<text x="{4+w*cell+8}" y="{yy}" font-size="13" fill="#666" '
                     f'font-family="sans-serif">{n}</text>')
    p.append('</svg>')
    svg = ''.join(p)
    if title:
        return f'<div class="chartbox"><div class="chartttl">{html.escape(title)}</div>{svg}</div>'
    return f'<div class="chartbox">{svg}</div>'


photo_src = f'data:image/jpeg;base64,{base64.b64encode(PHOTO.read_bytes()).decode()}'
logo_src = f'data:image/png;base64,{base64.b64encode(LOGO.read_bytes()).decode()}'


def make_page(ph2, right_label='LME STRIKK'):
    def _page(body, num):
        return f'''<div class="page">
  <div class="band"><span>LITTLE MONTESSORI EXPLORERS</span></div>
  <div class="rside"><span>{right_label}</span></div>
  <div class="phead">
    <div class="ph1">LITTLE MONTESSORI EXPLORERS</div>
    <div class="ph2">{ph2}</div>
  </div>
  <div class="content">{body}</div>
  <div class="pfoot">&mdash;&nbsp;{num}&nbsp;&mdash;</div>
</div>'''
    return _page


def banner(t):    return f'<div class="banner"><h1>{t}</h1></div>'
def pink(t):       return f'<div class="pillwrap"><div class="pill pinkpill">{t}</div></div>'
def tealp(t):      return f'<div class="pillwrap"><div class="pill tealpill">{t}</div></div>'
def card(inner):  return f'<div class="card">{inner}</div>'
def cream(inner): return f'<div class="cream">{inner}</div>'
def ul(items):    return '<ul class="dots">' + ''.join(f'<li>{i}</li>' for i in items) + '</ul>'
def check(items): return '<ul class="checks">' + ''.join(f'<li>{i}</li>' for i in items) + '</ul>'
def steps(items, start=1):
    return '<ol class="steps">' + ''.join(
        f'<li><span class="snum">{start+i}</span><div>{t}</div></li>' for i, t in enumerate(items)) + '</ol>'
def tip(text):
    return f'<div class="notecard"><span class="noteemo">&#129525;</span><p><i>TIPS: {text}</i></p></div>'
def byline(name_line, company='Little Montessori Explorers', site='lmexplorers.com'):
    return f'''<div class="byline">
  <img class="logo" src="{logo_src}" alt="Little Montessori Explorers">
  <div class="by1">{name_line}</div>
  <div class="by2">{company}</div>
  <div class="by3">{site}</div>
</div>'''
def sizetable(header, rows):
    head = ''.join(f'<th>{h}</th>' for h in header)
    body = ''.join('<tr>' + ''.join(f'<td>{c}</td>' for c in r) + '</tr>' for r in rows)
    return f'<table class="t sz"><tr>{head}</tr>{body}</table>'


SIZES = ["50", "56", "62", "68", "74", "80", "86", "92", "98", "104"]
AGE = ["0-1 mnd", "1-2 mnd", "2-4 mnd", "4-6 mnd", "6-9 mnd", "9-12 mnd", "12-18 mnd", "18-24 mnd", "2-3 år", "3-4 år"]
HEAD = ["34-36", "36-38", "38-40", "40-42", "42-44", "44-46", "46-48", "48-50", "49-51", "50-52"]
LEGG_OPP = [116, 122, 130, 136, 144, 150, 156, 162, 166, 170]
BREMOMG = [6, 7, 8, 9, 10, 11, 12, 13, 13, 13]
FERDIG_OMKR = ["34.1", "35.9", "38.2", "40.0", "42.4", "44.1", "45.9", "47.6", "48.8", "50.0"]
HOVEDDEL = [58, 61, 65, 68, 72, 75, 78, 81, 83, 85]
TIL_TOPP = ["5.5 cm", "6 cm", "6.5 cm", "7 cm", "7.5 cm", "8 cm", "8.5 cm", "9 cm", "9 cm", "9 cm"]
OPPSETT_FELL = ["Fell 2 m", "Fell 5 m", "Fell 2 m", "Fell 5 m", "Fell 2 m", "Fell 5 m", "Fell 1 m", "Fell 4 m", "Fell 6 m", "Fell 1 m"]
ETTER_OPPSETT = [56, 56, 63, 63, 70, 70, 77, 77, 77, 84]
STRIPES = [
    "2 rød, 1 hvit, 1 blå, 1 hvit, resten rød",
    "2 rød, 1 hvit, 1 blå, 1 hvit, resten rød",
    "2 rød, 2 hvit, 2 blå, 1 hvit, resten rød",
    "2 rød, 2 hvit, 2 blå, 1 hvit, resten rød",
    "2 rød, 2 hvit, 2 blå, 1 hvit, resten rød",
    "3 rød, 2 hvit, 3 blå, 2 hvit, resten rød",
    "3 rød, 2 hvit, 3 blå, 2 hvit, resten rød",
    "3 rød, 2 hvit, 3 blå, 2 hvit, resten rød",
    "3 rød, 2 hvit, 3 blå, 2 hvit, resten rød",
    "3 rød, 2 hvit, 3 blå, 2 hvit, resten rød",
]


def zip_rows(*cols):
    return [list(r) for r in zip(SIZES, *cols)]


pages = []

# ============ SIDE 1: FORSIDE ============
pages.append(make_page('LME STRIKKEOPPSKRIFT&nbsp;&nbsp;|&nbsp;&nbsp;BØTTEHATTER BARN')('''
<div class="coverimg"><img src="''' + photo_src + '''" alt="Bøttehatter til baby og barn, strikket, i rødt/hvitt/marineblått"></div>
<div class="covertag">LME STRIKKEOPPSKRIFT</div>
<div class="coverbanner">
  <h1 class="covertitle">BØTTEHATTER<br>TIL BABY OG BARN</h1>
</div>
<div class="subpill">NORGE &middot; NORWAY &middot; RO &middot; STØRRELSE 50&ndash;104</div>
''' + card('<p class="center">Samme bøttehatt som NORGE- og RO-oppskriftene for voksne, gradert helt fra bunnen av til '
      'ti babyer- og barnestørrelser, 50 til 104. Egne, mindre bokstaver og et eget lite flaggmotiv er laget '
      'spesielt for de minste hodene. Denne oppskriften er komplett i seg selv, du trenger ikke eie noen '
      'annen LME-oppskrift for å strikke den.</p>') + '''
''' + byline('Av Renate Dahl') + '''
''' + tip('Les hele oppskriften én gang før du legger opp. Strikk alltid en prøvelapp først, se side 4.') + '''
''', 1))

# ============ SIDE 2: FØR DU BEGYNNER ============
pages.append(make_page('LME STRIKKEOPPSKRIFT&nbsp;&nbsp;|&nbsp;&nbsp;BØTTEHATTER BARN')(
    banner('FØR DU BEGYNNER') +
    '<p>Bøttehatten strikkes rundt på rundpinne eller strømpepinner, nedenfra og opp. Du strikker først en '
    'stripet brem som bølger nedover, deretter hoveddelen rett opp med motivet i midten, og til slutt felles '
    'toppen ned til en liten rundet topp. Denne oppskriften dekker tre motiver, velg det du vil lage:</p>' +
    card(ul([
        '<b>NORGE</b>: ordet strikket i hvitt tvers over pannen',
        '<b>NORWAY</b>: samme som NORGE, men med det engelske navnet',
        '<b>RO</b>: RO-bokstavene pluss et lite norsk flagg, ensfarget blå brem',
    ])) +
    tealp('DETTE LÆRER DU') +
    card(ul([
        'Å strikke en lue/hatt rundt på rundpinne eller strømpepinner',
        'Å strikke en stripet brem som bølger, med en sammenstrikkingsomgang',
        'Å plassere og strikke et lite bokstav- eller flaggmotiv fra et rutediagram',
        'Å felle en rundet topp jevnt ned til få masker',
    ])) +
    pink('HVOR VANSKELIG ER DET?') +
    card('<p>Nybegynnervennlig. Du bør kunne legge opp, strikke glattstrikk rundt og bytte farge. Motivet '
         'strikkes med kun to farger av gangen, og alt er forklart trinn for trinn i denne oppskriften.</p>') +
    cream('<p class="creamtitle">Bruk strømpepinner eller magic loop på de minste størrelsene (50&ndash;86). '
          'En vanlig rundpinne er ofte for lang til at maskene når rundt.</p>')
, 2))

# ============ SIDE 3: STØRRELSER OG PASSFORM ============
pages.append(make_page('LME STRIKKEOPPSKRIFT&nbsp;&nbsp;|&nbsp;&nbsp;BØTTEHATTER BARN')(
    banner('STØRRELSER OG RIKTIG PASSFORM') +
    '<p>Klesstørrelsen er bare en veiledning. Mål alltid rundt barnets hode, over ørene og øyenbrynene. Velg '
    'etter hodemålet dersom målet og klesstørrelsen peker mot ulike størrelser.</p>' +
    sizetable(['Str.', 'Ca. alder', 'Hodemål (cm)'], list(zip(SIZES, AGE, HEAD))) +
    tealp('SIKKER BRUK FOR DE MINSTE') +
    card('<p>Hatten er et plagg for våken bruk under tilsyn. Den skal ikke brukes under søvn, i seng, i vogn '
         'uten oppsyn, eller dersom bremmen dekker øyne, nese eller munn. Kontroller alltid at ingen løse '
         'tråder eller lange flotter på innsiden kan hekte seg fast i fingre.</p>') +
    cream('<p class="creamtitle">Barn vokser ulikt. Faktisk hodemål går alltid foran alder, mål på nytt hver '
          'gang du er usikker.</p>')
, 3))

# ============ SIDE 4: DETTE TRENGER DU ============
pages.append(make_page('LME STRIKKEOPPSKRIFT&nbsp;&nbsp;|&nbsp;&nbsp;BØTTEHATTER BARN')(
    banner('DETTE TRENGER DU') +
    tealp('GARN') +
    card('<p>Et glatt bomullsgarn (aran/tykkelse 4) som gir 17 masker x 22 omganger glattstrikk = 10 x 10 cm '
         'på pinne 5 mm. Reynolds Saucy, Rico Design Creative Cotton Aran og Hobbii Amigo er alle gode valg, '
         'i rødt, hvitt og marineblått.</p>'
         '<table class="t"><tr><th>Farge</th><th>Bruk</th></tr>'
         f'<tr><td><span class="dot" style="background:{RED}"></span> Rød</td><td>hovedfarge</td></tr>'
         f'<tr><td><span class="dot" style="background:{WHITE};border-color:#ccc;"></span> Hvit</td><td>bokstaver, striper</td></tr>'
         f'<tr><td><span class="dot" style="background:{NAVY}"></span> Marineblå</td><td>striper, flagg, RO-brem</td></tr></table>'
         '<p class="small">Ha rikelig av rød hovedfarge (nesten hele hatten) og ett lite nøste hver av hvitt '
         'og marineblått, de brukes bare i bremmen og motivet.</p>') +
    pink('PINNER OG UTSTYR') +
    card(ul([
        'Rundpinne 5 mm, 40 cm, eller strømpepinner/magic loop-sett 5 mm',
        'Stoppenål, saks og målebånd',
        'Maskemarkør (valgfritt, for å holde styr på midt foran)',
    ])) +
    cream('<p class="creamtitle">Strikker du fast, prøv pinne 5,5 mm. Strikker du løst, prøv 4,5 mm. Målet er '
          'alltid 17 masker på 10 cm.</p>')
, 4))

# ============ SIDE 5: STRIKKEFASTHET OG ORDLISTE ============
pages.append(make_page('LME STRIKKEOPPSKRIFT&nbsp;&nbsp;|&nbsp;&nbsp;BØTTEHATTER BARN')(
    banner('STRIKKEFASTHET, DEN VIKTIGE NØKKELEN') +
    tealp('STRIKK EN PRØVELAPP FØRST') +
    card('<p>Legg opp 30 masker med hovedfargen. Strikk glattstrikk rundt (eller frem og tilbake med en '
         'kant) til lappen er minst 12 x 12 cm. Vask og tørk den slik du vil behandle hatten, mål deretter '
         'midt på lappen.</p>' +
         ul([
             'Flere enn 17 masker på 10 cm: prøv en tykkere pinne.',
             'Færre enn 17 masker på 10 cm: prøv en tynnere pinne.',
             'Nøyaktig 17 masker: bruk pinne 5 mm og sett i gang.',
         ])) +
    pink('ORDLISTE') +
    card('<table class="t tl"><tr><th>Ord</th><th>Betyr</th></tr>'
         '<tr><td><b>m</b></td><td>maske</td></tr>'
         '<tr><td><b>omg</b></td><td>omgang, én hel runde rundt</td></tr>'
         '<tr><td><b>r</b></td><td>rett</td></tr>'
         '<tr><td><b>2 r sammen</b></td><td>strikk 2 masker som &eacute;n, minker &eacute;n maske</td></tr>'
         '<tr><td><b>HF</b></td><td>hovedfarge (rød)</td></tr>'
         '<tr><td><b>flott</b></td><td>tråden som løper på innsiden når fargen ikke brukes</td></tr>'
         '<tr><td><b>jevnt fordelt</b></td><td>spredt likt utover hele omgangen, ikke samlet ett sted</td></tr></table>')
, 5))

# ============ SIDE 6: DEL 1 LEGG OPP OG BREM ============
pages.append(make_page('LME STRIKKEOPPSKRIFT&nbsp;&nbsp;|&nbsp;&nbsp;BØTTEHATTER BARN')(
    banner('DEL 1: LEGG OPP OG STRIKK BREMMEN') +
    steps([
        'Finn tallet for din størrelse i kolonnen &laquo;Legg opp&raquo; i tabellen på neste side. Legg opp '
        'akkurat så mange masker med rød hovedfarge.',
        'Kontroller at oppleggskanten ikke er vridd rundt pinnen. Sett sammen til en ring og plasser en '
        'maskemarkør ved omgangens begynnelse, det er her hver omgang starter og slutter.',
        'Strikk bremmen i glattstrikk rundt (bare rette masker), i antall omganger fra kolonnen '
        '&laquo;Bremomg.&raquo;. Bytt farge etter fargeforslaget i tabellen: strikk hver stripe i angitt '
        'antall omganger før du bytter til neste farge i rekken.',
        'RO-hatten: hopp over stripene og strikk hele bremmen i marineblått i stedet.',
        'På aller siste bremomgang strikker du 2 rette masker sammen, hele veien rundt (maske 1 og 2 '
        'sammen, maske 3 og 4 sammen, og så videre). Det halverer maskeantallet nøyaktig, fra tallet du la '
        'opp til tallet i kolonnen &laquo;Hoveddel&raquo; på neste side.',
    ]) +
    pink('DEN BØLGETE KANTEN') +
    card('<p>Sammenstrikkingsomgangen er det som gir bremmen den karakteristiske bølgekanten når hatten '
         'ikke er strukket ut, det er riktig at kanten krøller seg litt inntil hatten er tatt i bruk.</p>')
, 6))

pages.append(make_page('LME STRIKKEOPPSKRIFT&nbsp;&nbsp;|&nbsp;&nbsp;BØTTEHATTER BARN')(
    banner('TABELL: BREMMEN, ALLE STØRRELSER') +
    sizetable(['Str.', 'Legg opp', 'Bremomg.', 'Stripefordeling (NORGE/NORWAY)'],
              list(zip(SIZES, LEGG_OPP, BREMOMG, STRIPES))) +
    cream('<p class="creamtitle">Bruk strømpepinner eller magic loop under hele bremmen på de minste '
          'størrelsene, den er for smal for en vanlig rundpinne.</p>')
, 7))

# ============ SIDE 8: DEL 2 HOVEDDELEN ============
pages.append(make_page('LME STRIKKEOPPSKRIFT&nbsp;&nbsp;|&nbsp;&nbsp;BØTTEHATTER BARN')(
    banner('DEL 2: HOVEDDELEN') +
    steps([
        'Etter sammenstrikkingsomgangen strikker du glattstrikk rundt i hovedfargen. Dette er nå hoveddelen '
        'av hatten, den delen som synes best.',
        'Strikk rett fram uten mønster til arbeidet måler ca. halvparten av målet i kolonnen &laquo;Til '
        'topp&raquo; i tabellen på neste side, det er her motivet skal begynne.',
        'Strikk inn motivet ditt her, se Del 3 på neste oppslag.',
        'Fortsett rett i hovedfargen etter motivet til hele hoveddelen måler målet i &laquo;Til topp&raquo;, '
        'målt fra sammenstrikkingsomgangen.',
    ], start=1) +
    tealp('TABELL: HOVEDDEL') +
    sizetable(['Str.', 'Masker (hoveddel)', 'Høyde til topp'], list(zip(SIZES, HOVEDDEL, TIL_TOPP))) +
    cream('<p class="creamtitle">Motivet skal sitte midt i hoveddelen i høyden, ikke helt nederst mot '
          'bremmen og ikke helt oppe ved toppen.</p>')
, 8))

# ============ SIDE 9: DEL 3 MOTIVET ============
pages.append(make_page('LME STRIKKEOPPSKRIFT&nbsp;&nbsp;|&nbsp;&nbsp;BØTTEHATTER BARN')(
    banner('DEL 3: MOTIVET') +
    '<p>Motivene er strikket med hvitt eller marineblått på rød bunn, med teknikken flerfargestrikk (fair '
    'isle): du strikker med to farger i samme omgang og lar den ubrukte fargen &laquo;flyte&raquo; løst på '
    'innsiden.</p>' +
    tealp('SLIK PLASSERER DU MOTIVET') +
    card('<p>Tell maskene rundt og finn midten (halvparten av tallet i kolonnen &laquo;Hoveddel&raquo;), det '
         'blir midt foran, midt på pannen. Sentrer diagrammet rundt dette punktet, med like mange '
         'bakgrunnsmasker på hver side.</p>') +
    tealp('DIAGRAM: NORGE (29 masker x 7 omganger)') +
    f'<div class="chartrow">{chart_svg(NORGE_CHART, CMAP_LETTERS, cell=20, numbers=True)}</div>' +
    tealp('DIAGRAM: NORWAY (35 masker x 7 omganger)') +
    f'<div class="chartrow">{chart_svg(NORWAY_CHART, CMAP_LETTERS, cell=17, numbers=True)}</div>' +
    tealp('DIAGRAM: RO + FLAGG (25 masker x 7 omganger)') +
    f'<div class="chartrow">{chart_svg(RO_FLAG_CHART, CMAP_ROFLAG, cell=20, numbers=True)}</div>' +
    '<p class="small">Les alle diagrammene nedenfra og opp. Fordi du strikker rundt, leses hver omgang fra '
    'høyre mot venstre. Hvit rute = strikk med hvitt (eller marineblått for RO-brem). Farget rute = strikk '
    'med hovedfargen.</p>'
, 9))

# ============ SIDE 10: DEL 4 TOPPEN ============
pages.append(make_page('LME STRIKKEOPPSKRIFT&nbsp;&nbsp;|&nbsp;&nbsp;BØTTEHATTER BARN')(
    banner('DEL 4: TOPPEN') +
    steps([
        'Når hoveddelen måler målet i tabellen på side 8, strikker du én oppsettomgang: fell antall masker '
        'oppgitt i kolonnen &laquo;Oppsett&raquo; i tabellen under, jevnt fordelt rundt hele omgangen.',
        'Del de gjenværende maskene i 7 like store felt. Sett en maskemarkør mellom hvert felt (7 markører '
        'totalt, i tillegg til den ved omgangens start).',
        'Strikk til 2 masker gjenstår før hver markør, strikk disse 2 sammen. Gjenta ved alle 7 markørene, '
        'det gir 7 minkinger per omgang.',
        'Str. 50&ndash;68: strikk 1 vanlig omgang uten minking etter de 3 første minkeomgangene, fortsett '
        'deretter å minke på hver omgang. Str. 74&ndash;104: strikk 1 vanlig omgang etter de 4 første '
        'minkeomgangene, fortsett deretter å minke på hver omgang.',
        'Fortsett til 7 masker (én per felt) gjenstår. Klipp av tråden med god margin, tre den gjennom de '
        'gjenværende maskene med en stoppenål, dra sammen og fest godt på innsiden.',
    ]) +
    tealp('TABELL: OPPSETT FØR TOPP') +
    sizetable(['Str.', 'Masker før topp', 'Fell', 'Masker etter'],
              list(zip(SIZES, HOVEDDEL, OPPSETT_FELL, ETTER_OPPSETT)))
, 10))

# ============ SIDE 11: STELL OG SISTE SJEKK ============
pages.append(make_page('LME STRIKKEOPPSKRIFT&nbsp;&nbsp;|&nbsp;&nbsp;BØTTEHATTER BARN')(
    banner('STELL OG SISTE SJEKK') +
    tealp('AVSLUTNING') +
    card('<p>Fest alle løse tråder godt på innsiden, spesielt ved fargebyttene i bremmen og rundt motivet. '
         'Kontroller at flottene på innsiden ligger løst, ikke stramt, ellers trekker hatten seg sammen.</p>') +
    tealp('STELL') +
    card('<p>Vask etter garnets anbefaling, ofte 30&deg;C på skånsomt program i vaskepose, eller for hånd. '
         'Ikke bruk tørketrommel. Form hatten over en bolle eller et glass i riktig størrelse og la den '
         'tørke flatt eller på formen.</p>') +
    pink('SJEKKLISTE') +
    card(check([
        'Hodemålet er kontrollert, ikke bare alder',
        'Prøvelappen stemmer med 17 masker x 22 omganger på 10 cm',
        'Bremmen har den bølgete kanten fra sammenstrikkingsomgangen',
        'Motivet er sentrert midt foran',
        'Alle flotter på innsiden ligger løst',
        'Toppen er dratt sammen og godt festet',
    ])) +
    '<div class="congrats">Gratulerer, du har strikket din egen barnebøttehatt!</div>' +
    byline('Renate Dahl') +
    '<p class="copyright">&copy; 2026 Little Montessori Explorers. Oppskriften er kun til personlig '
    'bruk. Oppskriften og diagrammene kan ikke kopieres, deles, videreselges eller publiseres. '
    'Ferdige produkter kan selges i liten skala med kreditering til Little Montessori Explorers.</p>' +
    '<p style="font-size:11pt;color:#c0392b;text-align:center;margin-top:2mm;">Hatten er et plagg for '
    'våken bruk under tilsyn. Skal ikke brukes under søvn eller i vogn uten oppsyn.</p>'
, 11))

pages_no = pages

# ===========================================================================
# ENGELSK VERSJON
# ===========================================================================
pages = []


def epage(ph2, right_label='LME KNIT'):
    return make_page(ph2, right_label)


page = epage('LME KNITTING PATTERN&nbsp;&nbsp;|&nbsp;&nbsp;KIDS BUCKET HATS')

EN_SIZES = SIZES
EN_AGE = ["0-1 mo", "1-2 mo", "2-4 mo", "4-6 mo", "6-9 mo", "9-12 mo", "12-18 mo", "18-24 mo", "2-3 yr", "3-4 yr"]
EN_STRIPES = [
    "2 red, 1 white, 1 blue, 1 white, rest red",
    "2 red, 1 white, 1 blue, 1 white, rest red",
    "2 red, 2 white, 2 blue, 1 white, rest red",
    "2 red, 2 white, 2 blue, 1 white, rest red",
    "2 red, 2 white, 2 blue, 1 white, rest red",
    "3 red, 2 white, 3 blue, 2 white, rest red",
    "3 red, 2 white, 3 blue, 2 white, rest red",
    "3 red, 2 white, 3 blue, 2 white, rest red",
    "3 red, 2 white, 3 blue, 2 white, rest red",
    "3 red, 2 white, 3 blue, 2 white, rest red",
]
EN_OPPSETT_FELL = ["Dec 2 st", "Dec 5 st", "Dec 2 st", "Dec 5 st", "Dec 2 st", "Dec 5 st", "Dec 1 st", "Dec 4 st", "Dec 6 st", "Dec 1 st"]

# ============ PAGE 1: COVER ============
pages.append(page('''
<div class="coverimg"><img src="''' + photo_src + '''" alt="Bucket hats for baby and child, knitted, in red/white/navy"></div>
<div class="covertag">LME KNITTING PATTERN</div>
<div class="coverbanner">
  <h1 class="covertitle">BUCKET HATS<br>FOR BABY AND CHILD</h1>
</div>
<div class="subpill">NORGE &middot; NORWAY &middot; RO &middot; SIZE 50&ndash;104</div>
''' + card('<p class="center">The same bucket hat as the NORGE and RO patterns for adults, graded completely '
      'from scratch into ten baby and child sizes, 50 to 104. Smaller letters and a small flag motif were '
      'designed just for the smallest heads. This pattern is complete on its own, you do not need any other '
      'LME pattern to knit it.</p>') + '''
''' + byline('By Renate Dahl') + '''
''' + tip('Read the whole pattern once before you cast on. Always knit a gauge swatch first, see page 4.') + '''
''', 1))

# ============ PAGE 2: BEFORE YOU START ============
pages.append(page(
    banner('BEFORE YOU START') +
    '<p>The bucket hat is knitted in the round on a circular needle or double-pointed needles, from the '
    'bottom up. You start with a striped brim that flares, then the main body straight up with the motif in '
    'the middle, and finally decrease the crown down to a small rounded top. This pattern covers three '
    'motifs, pick the one you want to make:</p>' +
    card(ul([
        '<b>NORGE</b>: the word knitted in white across the forehead',
        '<b>NORWAY</b>: the same, but with the English name',
        '<b>RO</b>: the RO letters plus a small Norwegian flag, solid blue brim',
    ])) +
    tealp('WHAT YOU LEARN') +
    card(ul([
        'To knit a hat in the round on a circular needle or double-pointed needles',
        'To knit a striped, flared brim with a decrease round',
        'To place and knit a small letter or flag motif from a chart',
        'To decrease a rounded crown evenly down to a few stitches',
    ])) +
    pink('HOW HARD IS IT?') +
    card('<p>Beginner friendly. You should be able to cast on, knit stockinette in the round and change '
         'colour. The motif is knitted with only two colours at a time, and every step is spelled out in '
         'this pattern.</p>') +
    cream('<p class="creamtitle">Use double-pointed needles or magic loop for the smallest sizes '
          '(50&ndash;86). An ordinary circular needle is often too long for the stitches to reach round.</p>')
, 2))

# ============ PAGE 3: SIZES AND FIT ============
pages.append(page(
    banner('SIZES AND GETTING THE FIT RIGHT') +
    '<p>The clothing size is only a guide. Always measure around the child&rsquo;s head, above the ears and '
    'eyebrows. Go by the head measurement if it and the clothing size point to different sizes.</p>' +
    sizetable(['Size', 'Approx. age', 'Head (cm)'], list(zip(EN_SIZES, EN_AGE, HEAD))) +
    tealp('SAFE USE FOR THE YOUNGEST') +
    card('<p>The hat is a garment for supervised, awake use. It should not be used during sleep, in a cot, '
         'in a pram unattended, or if the brim covers the eyes, nose or mouth. Always check that no loose '
         'threads or long floats on the inside can catch on little fingers.</p>') +
    cream('<p class="creamtitle">Children grow at different rates. The actual head measurement always beats '
          'age, measure again whenever you are unsure.</p>')
, 3))

# ============ PAGE 4: WHAT YOU NEED ============
pages.append(page(
    banner('WHAT YOU NEED') +
    tealp('YARN') +
    card('<p>A smooth cotton yarn (aran weight) that gives 17 stitches x 22 rounds in stockinette = 10 x 10 '
         'cm on 5 mm needles. Reynolds Saucy, Rico Design Creative Cotton Aran and Hobbii Amigo are all good '
         'choices, in red, white and navy.</p>'
         '<table class="t"><tr><th>Colour</th><th>Use</th></tr>'
         f'<tr><td><span class="dot" style="background:{RED}"></span> Red</td><td>main colour</td></tr>'
         f'<tr><td><span class="dot" style="background:{WHITE};border-color:#ccc;"></span> White</td><td>letters, stripes</td></tr>'
         f'<tr><td><span class="dot" style="background:{NAVY}"></span> Navy</td><td>stripes, flag, RO brim</td></tr></table>'
         '<p class="small">Have plenty of red main colour (almost the whole hat) and one small ball each of '
         'white and navy, they are only used in the brim and the motif.</p>') +
    pink('NEEDLES AND KIT') +
    card(ul([
        '5 mm circular needle, 40 cm, or 5 mm double-pointed needles/magic loop set',
        'Tapestry needle, scissors and tape measure',
        'Stitch marker (optional, to track centre front)',
    ])) +
    cream('<p class="creamtitle">If you knit tightly, try 5.5 mm needles. If you knit loosely, try 4.5 mm. '
          'The target is always 17 stitches over 10 cm.</p>')
, 4))

# ============ PAGE 5: GAUGE AND GLOSSARY ============
pages.append(page(
    banner('GAUGE, THE SECRET KEY') +
    tealp('KNIT A SWATCH FIRST') +
    card('<p>Cast on 30 stitches in the main colour. Knit stockinette in the round (or back and forth with '
         'an edge) until the swatch is at least 12 x 12 cm. Wash and dry it the way you plan to treat the '
         'hat, then measure across the middle.</p>' +
         ul([
             'More than 17 stitches over 10 cm: try a thicker needle.',
             'Fewer than 17 stitches over 10 cm: try a thinner needle.',
             'Exactly 17 stitches: use 5 mm needles and get going.',
         ])) +
    pink('GLOSSARY') +
    card('<table class="t tl"><tr><th>Term</th><th>Means</th></tr>'
         '<tr><td><b>st</b></td><td>stitch</td></tr>'
         '<tr><td><b>round</b></td><td>one whole lap around</td></tr>'
         '<tr><td><b>k</b></td><td>knit</td></tr>'
         '<tr><td><b>k2tog</b></td><td>knit 2 stitches together, decreases one stitch</td></tr>'
         '<tr><td><b>MC</b></td><td>main colour (red)</td></tr>'
         '<tr><td><b>float</b></td><td>the thread that runs on the inside when the colour is not in use</td></tr>'
         '<tr><td><b>evenly spaced</b></td><td>spread equally around the round, not bunched in one spot</td></tr></table>')
, 5))

# ============ PAGE 6: PART 1 CAST ON AND BRIM ============
pages.append(page(
    banner('PART 1: CAST ON AND KNIT THE BRIM') +
    steps([
        'Find the number for your size in the &laquo;Cast on&raquo; column in the table on the next page. '
        'Cast on exactly that many stitches in red main colour.',
        'Check that the cast-on edge is not twisted around the needle. Join in the round and place a stitch '
        'marker at the start of the round, this is where every round begins and ends.',
        'Knit the brim in stockinette in the round (knit every stitch), for the number of rounds in the '
        '&laquo;Brim rounds&raquo; column. Change colour following the stripe suggestion in the table: knit '
        'each stripe for the stated number of rounds before switching to the next colour.',
        'RO hat: skip the stripes and knit the whole brim in navy instead.',
        'On the very last brim round, knit 2 stitches together all the way round (stitch 1 and 2 together, '
        'stitch 3 and 4 together, and so on). This halves the stitch count exactly, from your cast-on '
        'number down to the &laquo;Main body&raquo; number on the next page.',
    ]) +
    pink('THE FLARED EDGE') +
    card('<p>The decrease round is what gives the brim its characteristic flared, wavy edge, it is normal '
         'for the edge to curl in a little until the hat has been worn a few times.</p>')
, 6))

pages.append(page(
    banner('TABLE: THE BRIM, ALL SIZES') +
    sizetable(['Size', 'Cast on', 'Brim rounds', 'Stripe order (NORGE/NORWAY)'],
              list(zip(EN_SIZES, LEGG_OPP, BREMOMG, EN_STRIPES))) +
    cream('<p class="creamtitle">Use double-pointed needles or magic loop for the whole brim on the smallest '
          'sizes, it is too narrow for an ordinary circular needle.</p>')
, 7))

# ============ PAGE 8: PART 2 MAIN BODY ============
pages.append(page(
    banner('PART 2: THE MAIN BODY') +
    steps([
        'After the decrease round, knit stockinette in the round in the main colour. This is now the main '
        'body of the hat, the part that shows the most.',
        'Knit plain, no pattern, until the work measures about half of the &laquo;Height to top&raquo; value '
        'in the table on the next page, this is where the motif should begin.',
        'Knit your motif in here, see Part 3 on the next spread.',
        'Continue plain in the main colour after the motif until the whole main body measures the '
        '&laquo;Height to top&raquo; value, measured from the decrease round.',
    ], start=1) +
    tealp('TABLE: MAIN BODY') +
    sizetable(['Size', 'Stitches (main body)', 'Height to top'], list(zip(EN_SIZES, HOVEDDEL, TIL_TOPP))) +
    cream('<p class="creamtitle">The motif should sit in the middle of the main body height, not right down '
          'against the brim and not right up at the top.</p>')
, 8))

# ============ PAGE 9: PART 3 THE MOTIF ============
pages.append(page(
    banner('PART 3: THE MOTIF') +
    '<p>The motifs are knitted in white or navy on a red background, using stranded colourwork (fair isle): '
    'you knit with two colours in the same round and let the unused colour float loosely on the inside.</p>' +
    tealp('HOW TO PLACE THE MOTIF') +
    card('<p>Count the stitches around and find the middle (half of the &laquo;Main body&raquo; number), '
         'that becomes centre front, the middle of the forehead. Centre the chart around this point, with '
         'the same number of background stitches on each side.</p>') +
    tealp('CHART: NORGE (29 stitches x 7 rounds)') +
    f'<div class="chartrow">{chart_svg(NORGE_CHART, CMAP_LETTERS, cell=20, numbers=True)}</div>' +
    tealp('CHART: NORWAY (35 stitches x 7 rounds)') +
    f'<div class="chartrow">{chart_svg(NORWAY_CHART, CMAP_LETTERS, cell=17, numbers=True)}</div>' +
    tealp('CHART: RO + FLAG (25 stitches x 7 rounds)') +
    f'<div class="chartrow">{chart_svg(RO_FLAG_CHART, CMAP_ROFLAG, cell=20, numbers=True)}</div>' +
    '<p class="small">Read all charts from the bottom up. Because you are knitting in the round, each round '
    'is read from right to left. White square = knit white (or navy for the RO brim). Coloured square = '
    'knit main colour.</p>'
, 9))

# ============ PAGE 10: PART 4 THE CROWN ============
pages.append(page(
    banner('PART 4: THE CROWN') +
    steps([
        'When the main body measures the value in the table on page 8, knit one setup round: decrease the '
        'number of stitches given in the &laquo;Decrease&raquo; column in the table below, evenly spaced '
        'around the whole round.',
        'Divide the remaining stitches into 7 equal sections. Place a stitch marker between each section (7 '
        'markers in total, plus the one at the start of the round).',
        'Knit to 2 stitches before each marker, knit these 2 together. Repeat at all 7 markers, giving 7 '
        'decreases per round.',
        'Sizes 50&ndash;68: knit 1 plain round with no decreases after the first 3 decrease rounds, then '
        'decrease on every round after that. Sizes 74&ndash;104: knit 1 plain round after the first 4 '
        'decrease rounds, then decrease every round after that.',
        'Continue until 7 stitches (one per section) remain. Cut the yarn leaving a generous tail, thread it '
        'through the remaining stitches with a tapestry needle, pull tight and fasten off securely on the '
        'inside.',
    ]) +
    tealp('TABLE: SETUP BEFORE THE CROWN') +
    sizetable(['Size', 'Stitches before top', 'Decrease', 'Stitches after'],
              list(zip(EN_SIZES, HOVEDDEL, EN_OPPSETT_FELL, ETTER_OPPSETT)))
, 10))

# ============ PAGE 11: CARE AND FINAL CHECK ============
pages.append(page(
    banner('CARE AND FINAL CHECK') +
    tealp('FINISHING') +
    card('<p>Weave in all loose ends securely on the inside, especially at the colour changes in the brim '
         'and around the motif. Check that the floats on the inside lie loose, not tight, or the hat will '
         'pull itself in.</p>') +
    tealp('CARE') +
    card('<p>Wash following the yarn&rsquo;s recommendation, often 30&deg;C on a gentle cycle in a wash bag, '
         'or by hand. Do not tumble dry. Shape the hat over a bowl or glass of the right size and let it dry '
         'flat or on the form.</p>') +
    pink('CHECKLIST') +
    card(check([
        'The head measurement has been checked, not just age',
        'The swatch matches 17 stitches x 22 rounds over 10 cm',
        'The brim has the flared edge from the decrease round',
        'The motif is centred at centre front',
        'All floats on the inside lie loose',
        'The top is pulled tight and well fastened off',
    ])) +
    '<div class="congrats">Congratulations, you have knitted your very own kids&rsquo; bucket hat!</div>' +
    byline('Renate Dahl') +
    '<p class="copyright">&copy; 2026 Little Montessori Explorers. This pattern is for personal use '
    'only. The pattern and charts may not be copied, shared, resold or published. Finished items may '
    'be sold on a small scale with credit to Little Montessori Explorers.</p>' +
    '<p style="font-size:11pt;color:#c0392b;text-align:center;margin-top:2mm;">The hat is a garment for '
    'supervised, awake use. Do not use during sleep or in a pram unattended.</p>'
, 11))

pages_en = pages

# ---------- CSS ----------
css = f'''
@font-face {{ font-family:'Sasson Montessori'; src:url('fonts/SassoonMontessori.ttf'); font-weight:normal; }}
@font-face {{ font-family:'Playpen Sans'; src:url('fonts/PlaypenSans-400.ttf'); font-weight:400; }}
@font-face {{ font-family:'Playpen Sans'; src:url('fonts/PlaypenSans-600.ttf'); font-weight:600; }}
@font-face {{ font-family:'Playpen Sans'; src:url('fonts/PlaypenSans-700.ttf'); font-weight:700; }}
@font-face {{ font-family:'Playpen Sans'; src:url('fonts/PlaypenSans-800.ttf'); font-weight:800; }}
* {{ margin:0; padding:0; box-sizing:border-box; }}
:root {{
  --font-head:'Playpen Sans',system-ui,sans-serif;
  --font-body:'Sasson Montessori','Playpen Sans',system-ui,sans-serif;
}}
@page {{ size:A4; margin:0; }}
body {{ font-family:var(--font-body); color:#4a4a4a; }}
.page {{
  position:relative; width:210mm; height:296.5mm; overflow:hidden;
  page-break-after:always;
  background:
    repeating-linear-gradient(0deg, rgba(255,255,255,.45) 0, rgba(255,255,255,.45) .4mm, transparent .4mm, transparent 8mm),
    repeating-linear-gradient(90deg, rgba(255,255,255,.45) 0, rgba(255,255,255,.45) .4mm, transparent .4mm, transparent 8mm),
    linear-gradient(165deg,#cde8ef 0%,#e3ddea 45%,#f5d2de 100%);
}}
.band {{ position:absolute; left:0; top:0; bottom:0; width:11mm;
  background:linear-gradient(180deg,#9fd4dd,#f0b9ca); }}
.band span {{ position:absolute; left:50%; top:75%; transform:translate(-50%,-50%);
  writing-mode:vertical-rl; text-orientation:mixed; rotate:180deg;
  font-family:var(--font-head); font-size:6.5pt; letter-spacing:3.5px; color:#fff; white-space:nowrap; }}
.rside {{ position:absolute; right:2.5mm; top:40%; }}
.rside span {{ writing-mode:vertical-rl; font-family:var(--font-head); font-size:6pt;
  letter-spacing:2.5px; color:#9a9a9a; white-space:nowrap; }}
.phead {{ text-align:center; padding-top:7mm; }}
.ph1 {{ font-family:var(--font-head); font-weight:600; font-size:9pt; letter-spacing:3.5px; color:#7f96a8; }}
.ph2 {{ font-family:var(--font-head); font-weight:600; font-size:8.5pt; letter-spacing:2.2px; color:{PINK}; margin-top:1.4mm; }}
.content {{ padding:2mm 12mm 0 15mm; }}
.pfoot {{ position:absolute; bottom:3mm; left:0; right:0; text-align:center;
  font-family:var(--font-head); font-weight:700; font-size:13pt; color:#8a8a8a; }}

.banner {{ background:#f5efb2; border-radius:14px; padding:2.2mm 6mm; margin:.6mm 0 2.4mm; text-align:center; }}
.banner h1 {{ font-family:var(--font-head); font-weight:800; font-size:19pt; color:{INK};
  letter-spacing:.4px; text-transform:uppercase; }}
.pillwrap {{ text-align:center; margin:2.4mm 0 1.6mm; }}
.pill {{ display:inline-block; border-radius:999px; padding:1.5mm 7mm;
  font-family:var(--font-head); font-weight:700; font-size:13pt; color:#fff;
  letter-spacing:.4px; text-transform:uppercase; }}
.pinkpill {{ background:{PINK}; }}
.tealpill {{ background:{TEAL}; }}
.card {{ background:rgba(255,255,255,.93); border:2px solid #f2bfd4; border-radius:16px;
  padding:2.2mm 5mm; margin:0 0 2mm; }}
.cream {{ background:{CREAM}; border:2px solid #f2bfd4; border-radius:16px;
  padding:2.2mm 5mm; margin:2mm 0; text-align:center; }}
.creamtitle {{ font-family:var(--font-head); font-weight:700; font-size:14pt; color:{TEAL}; }}
p {{ font-size:14.5pt; line-height:1.26; margin-bottom:1.1mm; }}
p.small, .small {{ font-size:12pt; color:#777; }}
p.center {{ text-align:center; }}
ul.dots {{ list-style:none; }}
ul.dots li {{ font-size:14.5pt; line-height:1.22; padding-left:5.5mm; position:relative; margin:.6mm 0; }}
ul.dots li::before {{ content:'•'; position:absolute; left:1mm; color:{PINK}; font-weight:bold; }}
ul.checks {{ list-style:none; }}
ul.checks li {{ font-size:14.5pt; line-height:1.22; padding-left:7mm; position:relative; margin:.7mm 0; }}
ul.checks li::before {{ content:'\\2610'; position:absolute; left:0; color:{TEAL}; font-size:14pt; }}
ol.steps {{ list-style:none; }}
ol.steps li {{ display:flex; gap:2.6mm; align-items:flex-start; background:rgba(255,255,255,.93);
  border:2px solid #f2bfd4; border-radius:14px; padding:1.6mm 4mm; margin-bottom:1.1mm; }}
ol.steps li div {{ font-size:13.5pt; line-height:1.2; }}
.snum {{ flex:0 0 auto; width:7.5mm; height:7.5mm; border-radius:50%; background:{PINK}; color:#fff;
  font-family:var(--font-head); font-weight:700; font-size:13pt; display:flex;
  align-items:center; justify-content:center; margin-top:.5mm; }}
table.t {{ width:100%; border-collapse:collapse; margin:1mm 0; }}
table.t th {{ font-family:var(--font-head); font-weight:700; font-size:12pt; color:{PINK};
  text-align:left; padding:.8mm 2mm; border-bottom:2px solid #f2bfd4; }}
table.t td {{ font-size:12.5pt; padding:.7mm 2mm; border-bottom:1px solid #f6dbe7; line-height:1.16; }}
table.tl td:first-child {{ white-space:nowrap; }}
table.sz th, table.sz td {{ text-align:center; }}
table.sz td:first-child, table.sz th:first-child {{ font-weight:700; }}
.dot {{ display:inline-block; width:3.5mm; height:3.5mm; border-radius:50%; vertical-align:-0.5mm;
  margin-right:1.5mm; border:1px solid rgba(0,0,0,.15); }}

.coverimg {{ text-align:center; margin:2.4mm 0 2.4mm; }}
.coverimg img {{ width:82mm; border-radius:14px; border:3mm solid #fff; }}
.covertag {{ text-align:center; font-family:var(--font-head); font-size:10.5pt; letter-spacing:2.3px;
  color:#8a8a8a; margin:1mm 0 2mm; }}
.coverbanner {{ display:flex; align-items:center; justify-content:center; gap:5mm;
  background:#f5efb2; border-radius:16px; padding:2.6mm 6mm; }}
.covertitle {{ font-family:var(--font-head); font-weight:800; font-size:23pt; color:{INK};
  letter-spacing:.5px; text-align:center; line-height:1.18; }}
.subpill {{ margin:2.6mm auto; width:fit-content; background:#fdf9e3; border:2.5px solid {INK};
  border-radius:999px; padding:1.4mm 7mm; font-family:var(--font-head); font-weight:700;
  font-size:12pt; color:{INK}; letter-spacing:.4px; text-align:center; }}
.byline {{ text-align:center; margin-top:1.2mm; }}
.byline .logo {{ width:26mm; height:26mm; object-fit:contain; margin-bottom:1mm; }}
.by1 {{ font-family:var(--font-head); font-weight:700; font-size:19pt; color:{CERISE}; }}
.by2 {{ font-size:14pt; color:#8a8a8a; margin-top:1mm; }}
.by3 {{ font-family:var(--font-head); font-weight:600; font-size:13pt; color:{CERISE}; margin-top:.7mm; }}
.notecard {{ display:flex; gap:3mm; align-items:center; background:rgba(255,255,255,.8);
  border-radius:12px; padding:2.2mm 5mm; margin-top:2.4mm; }}
.notecard p {{ font-size:12pt; color:#777; margin:0; }}
.noteemo {{ font-size:15pt; }}

.chartrow {{ display:flex; gap:6mm; justify-content:center; align-items:flex-end;
  flex-wrap:wrap; margin:1mm 0 1.8mm; }}
.chartbox {{ text-align:center; }}
.chartttl {{ font-family:var(--font-head); font-weight:700; font-size:11pt; color:{PINK};
  margin-bottom:1.1mm; letter-spacing:.3px; }}
.congrats {{ font-family:var(--font-head); font-weight:800; font-size:17pt; color:{INK};
  text-align:center; margin:1.5mm 0 1mm; }}
.copyright {{ font-size:9.5pt; color:#9a9a9a; text-align:center; margin-top:1.5mm; line-height:1.25; }}
'''

doc_no = f'''<!DOCTYPE html>
<html lang="no"><head><meta charset="utf-8">
<title>Bøttehatter til baby og barn, LME strikkeoppskrift</title>
<style>{css}</style></head>
<body>{''.join(pages_no)}</body></html>'''

doc_en = f'''<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8">
<title>Bucket hats for baby and child, LME knitting pattern</title>
<style>{css}</style></head>
<body>{''.join(pages_en)}</body></html>'''

(BASE / 'barn_strikk_no.html').write_text(doc_no, encoding='utf-8')
(BASE / 'barn_strikk_en.html').write_text(doc_en, encoding='utf-8')
print('OK', len(doc_no), 'tegn (no),', len(doc_en), 'tegn (en)')
