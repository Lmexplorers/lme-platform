# -*- coding: utf-8 -*-
"""Genererer 3 separate LME-hekleoppskrifter (NORGE / NORWAY / RO, hver for seg) for
bøttehatter barn, som erstatning for den gamle samle-PDF-en."""
import base64, html, pathlib

BASE = pathlib.Path(__file__).parent
SRC = BASE / 'bottehatter-barn-hekle'
PHOTO = SRC / 'barn_hekle_ref.jpg'
LOGO = SRC / 'lme-logo.png'

TEAL, RED, NAVY, WHITE, CREAM, INK, PINK, CERISE = (
    '#4aa7a4', '#C8102E', '#00205B', '#FFFFFF', '#F8F4EA', '#3f3f3f', '#df5f93', '#E91E89')

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


def chart_svg(rows, cmap, cell=22, numbers=False):
    w, h = len(rows[0]), len(rows)
    pad_r = 30 if numbers else 4
    W, H = w * cell + 8 + pad_r, h * cell + 12
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
    return f'<div class="chartbox">{"".join(p)}</div>'


photo_src = f'data:image/jpeg;base64,{base64.b64encode(PHOTO.read_bytes()).decode()}'
logo_src = f'data:image/png;base64,{base64.b64encode(LOGO.read_bytes()).decode()}'


def make_page(ph2, right_label):
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


SIZES = ["50", "56", "62", "68", "74", "80", "86", "92", "98", "104",
         "110", "116", "122", "128", "134", "140", "146", "152", "158", "164", "170"]
AGE = ["0-1 mnd", "1-2 mnd", "2-4 mnd", "4-6 mnd", "6-9 mnd", "9-12 mnd", "12-18 mnd", "18-24 mnd", "2-3 år", "3-4 år",
       "4-5 år", "5-6 år", "6-7 år", "7-8 år", "8-9 år", "9-10 år", "10-11 år", "11-12 år", "12-13 år", "13-14 år", "14-16 år"]
HEAD = ["34-36", "36-38", "38-40", "40-42", "42-44", "44-46", "46-48", "48-50", "49-51", "50-52",
        "51-53", "52-53", "52-54", "53-54", "53-55", "54-55", "54-56", "55-56", "55-57", "56-57", "56-58"]
EN_AGE = ["0-1 mo", "1-2 mo", "2-4 mo", "4-6 mo", "6-9 mo", "9-12 mo", "12-18 mo", "18-24 mo", "2-3 yr", "3-4 yr",
          "4-5 yr", "5-6 yr", "6-7 yr", "7-8 yr", "8-9 yr", "9-10 yr", "10-11 yr", "11-12 yr", "12-13 yr", "13-14 yr", "14-16 yr"]

STD_ROUND = [8, 8, 9, 9, 10, 10, 11, 11, 11, 12,
             12, 12, 12, 12, 12, 12, 12, 13, 13, 13, 13]
EXTRA = [0, 3, 0, 3, 0, 3, 0, 2, 4, 0,
         1, 2, 2, 3, 4, 4, 5, 0, 0, 1, 2]
FINAL = [48, 51, 54, 57, 60, 63, 66, 68, 70, 72,
         73, 74, 74, 75, 76, 76, 77, 78, 78, 79, 80]
FERDIG_OMKR = ["34.3", "36.4", "38.6", "40.7", "42.9", "45.0", "47.1", "48.6", "50.0", "51.4",
               "52.0", "52.5", "53.0", "53.5", "54.0", "54.5", "55.0", "55.5", "56.0", "56.5", "57.0"]
TOPPDIAM = ["10.9", "11.6", "12.3", "13.0", "13.6", "14.3", "15.0", "15.5", "15.9", "16.4",
            "16.6", "16.8", "16.8", "17.1", "17.3", "17.3", "17.5", "17.7", "17.7", "18.0", "18.2"]
SIDEOMG = [12, 13, 14, 14, 15, 16, 17, 18, 18, 19,
           20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30]
FOR_MOTIV = [2, 2, 3, 3, 4, 4, 4, 4, 4, 4,
             4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4]
ETTER_MOTIV = [3, 4, 4, 4, 4, 5, 6, 7, 7, 8,
               9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19]
BREMOMG = [6, 6, 7, 7, 8, 8, 9, 9, 10, 10,
           11, 11, 12, 12, 13, 13, 14, 14, 15, 15, 16]
OK_PA = ["2, 4, 6", "2, 4, 6", "2, 4, 6", "2, 4, 6", "2, 4, 6, 8", "2, 4, 6, 8", "2, 4, 6, 8",
         "2, 4, 6, 8", "2, 4, 6, 8, 10", "2, 4, 6, 8, 10",
         "2, 4, 6, 8, 10", "2, 4, 6, 8, 10", "2, 4, 6, 8, 10", "2, 4, 6, 8, 10", "2, 4, 6, 8, 10",
         "2, 4, 6, 8, 10", "2, 4, 6, 8, 10", "2, 4, 6, 8, 10", "2, 4, 6, 8, 10", "2, 4, 6, 8, 10", "2, 4, 6, 8, 10"]
OKN_HVER = [6, 6, 7, 7, 8, 8, 8, 9, 9, 9,
            9, 9, 10, 10, 10, 11, 11, 11, 12, 12, 12]
CA_SLUTT = [66, 69, 75, 78, 92, 95, 98, 104, 115, 117,
            119, 120, 120, 122, 124, 124, 125, 127, 127, 128, 130]

css = f'''
@font-face {{ font-family:'Sasson Montessori'; src:url('fonts/SassoonMontessori.ttf'); font-weight:normal; }}
@font-face {{ font-family:'Playpen Sans'; src:url('fonts/PlaypenSans-400.ttf'); font-weight:400; }}
@font-face {{ font-family:'Playpen Sans'; src:url('fonts/PlaypenSans-600.ttf'); font-weight:600; }}
@font-face {{ font-family:'Playpen Sans'; src:url('fonts/PlaypenSans-700.ttf'); font-weight:700; }}
@font-face {{ font-family:'Playpen Sans'; src:url('fonts/PlaypenSans-800.ttf'); font-weight:800; }}
* {{ margin:0; padding:0; box-sizing:border-box; }}
:root {{ --font-head:'Playpen Sans',system-ui,sans-serif; --font-body:'Sasson Montessori','Playpen Sans',system-ui,sans-serif; }}
@page {{ size:A4; margin:0; }}
body {{ font-family:var(--font-body); color:#4a4a4a; }}
.page {{ position:relative; width:210mm; height:296.5mm; overflow:hidden; page-break-after:always;
  background: repeating-linear-gradient(0deg, rgba(255,255,255,.45) 0, rgba(255,255,255,.45) .4mm, transparent .4mm, transparent 8mm),
    repeating-linear-gradient(90deg, rgba(255,255,255,.45) 0, rgba(255,255,255,.45) .4mm, transparent .4mm, transparent 8mm),
    linear-gradient(165deg,#cde8ef 0%,#e3ddea 45%,#f5d2de 100%); }}
.band {{ position:absolute; left:0; top:0; bottom:0; width:11mm; background:linear-gradient(180deg,#9fd4dd,#f0b9ca); }}
.band span {{ position:absolute; left:50%; top:75%; transform:translate(-50%,-50%); writing-mode:vertical-rl; text-orientation:mixed; rotate:180deg;
  font-family:var(--font-head); font-size:6.5pt; letter-spacing:3.5px; color:#fff; white-space:nowrap; }}
.rside {{ position:absolute; right:2.5mm; top:40%; }}
.rside span {{ writing-mode:vertical-rl; font-family:var(--font-head); font-size:6pt; letter-spacing:2.5px; color:#9a9a9a; white-space:nowrap; }}
.phead {{ text-align:center; padding-top:7mm; }}
.ph1 {{ font-family:var(--font-head); font-weight:600; font-size:9pt; letter-spacing:3.5px; color:#7f96a8; }}
.ph2 {{ font-family:var(--font-head); font-weight:600; font-size:8.5pt; letter-spacing:2.2px; color:{PINK}; margin-top:1.4mm; }}
.content {{ padding:2mm 12mm 0 15mm; }}
.pfoot {{ position:absolute; bottom:3mm; left:0; right:0; text-align:center; font-family:var(--font-head); font-weight:700; font-size:13pt; color:#8a8a8a; }}
.banner {{ background:#f5efb2; border-radius:14px; padding:2.2mm 6mm; margin:.6mm 0 2.4mm; text-align:center; }}
.banner h1 {{ font-family:var(--font-head); font-weight:800; font-size:19pt; color:{INK}; letter-spacing:.4px; text-transform:uppercase; }}
.pillwrap {{ text-align:center; margin:2.4mm 0 1.6mm; }}
.pill {{ display:inline-block; border-radius:999px; padding:1.5mm 7mm; font-family:var(--font-head); font-weight:700; font-size:13pt; color:#fff; letter-spacing:.4px; text-transform:uppercase; }}
.pinkpill {{ background:{PINK}; }}
.tealpill {{ background:{TEAL}; }}
.card {{ background:rgba(255,255,255,.93); border:2px solid #f2bfd4; border-radius:16px; padding:2.2mm 5mm; margin:0 0 2mm; }}
.cream {{ background:{CREAM}; border:2px solid #f2bfd4; border-radius:16px; padding:2.2mm 5mm; margin:2mm 0; text-align:center; }}
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
ol.steps li {{ display:flex; gap:2.6mm; align-items:flex-start; background:rgba(255,255,255,.93); border:2px solid #f2bfd4; border-radius:14px; padding:1.6mm 4mm; margin-bottom:1.1mm; }}
ol.steps li div {{ font-size:13pt; line-height:1.2; }}
.snum {{ flex:0 0 auto; width:7.5mm; height:7.5mm; border-radius:50%; background:{PINK}; color:#fff; font-family:var(--font-head); font-weight:700; font-size:13pt; display:flex; align-items:center; justify-content:center; margin-top:.5mm; }}
table.t {{ width:100%; border-collapse:collapse; margin:1mm 0; }}
table.t th {{ font-family:var(--font-head); font-weight:700; font-size:11.5pt; color:{PINK}; text-align:left; padding:.8mm 2mm; border-bottom:2px solid #f2bfd4; }}
table.t td {{ font-size:12pt; padding:.7mm 2mm; border-bottom:1px solid #f6dbe7; line-height:1.16; }}
table.tl td:first-child {{ white-space:nowrap; }}
table.sz th, table.sz td {{ text-align:center; }}
table.sz td:first-child, table.sz th:first-child {{ font-weight:700; }}
.dot {{ display:inline-block; width:3.5mm; height:3.5mm; border-radius:50%; vertical-align:-0.5mm; margin-right:1.5mm; border:1px solid rgba(0,0,0,.15); }}
.coverimg {{ text-align:center; margin:2.4mm 0 2.4mm; }}
.coverimg img {{ width:82mm; border-radius:14px; border:3mm solid #fff; }}
.covertag {{ text-align:center; font-family:var(--font-head); font-size:10.5pt; letter-spacing:2.3px; color:#8a8a8a; margin:1mm 0 2mm; }}
.coverbanner {{ display:flex; align-items:center; justify-content:center; gap:5mm; background:#f5efb2; border-radius:16px; padding:2.6mm 6mm; }}
.covertitle {{ font-family:var(--font-head); font-weight:800; font-size:23pt; color:{INK}; letter-spacing:.5px; text-align:center; line-height:1.18; }}
.subpill {{ margin:2.6mm auto; width:fit-content; background:#fdf9e3; border:2.5px solid {INK}; border-radius:999px; padding:1.4mm 7mm; font-family:var(--font-head); font-weight:700; font-size:12pt; color:{INK}; letter-spacing:.4px; text-align:center; }}
.byline {{ text-align:center; margin-top:1.2mm; }}
.byline .logo {{ width:26mm; height:26mm; object-fit:contain; margin-bottom:1mm; }}
.by1 {{ font-family:var(--font-head); font-weight:700; font-size:19pt; color:{CERISE}; }}
.by2 {{ font-size:14pt; color:#8a8a8a; margin-top:1mm; }}
.by3 {{ font-family:var(--font-head); font-weight:600; font-size:13pt; color:{CERISE}; margin-top:.7mm; }}
.notecard {{ display:flex; gap:3mm; align-items:center; background:rgba(255,255,255,.8); border-radius:12px; padding:2.2mm 5mm; margin-top:2.4mm; }}
.notecard p {{ font-size:12pt; color:#777; margin:0; }}
.noteemo {{ font-size:15pt; }}
.chartrow {{ display:flex; gap:6mm; justify-content:center; align-items:flex-end; flex-wrap:wrap; margin:1mm 0 1.8mm; }}
.chartbox {{ text-align:center; }}
.chartttl {{ font-family:var(--font-head); font-weight:700; font-size:11pt; color:{PINK}; margin-bottom:1.1mm; letter-spacing:.3px; }}
.congrats {{ font-family:var(--font-head); font-weight:800; font-size:17pt; color:{INK}; text-align:center; margin:1.5mm 0 1mm; }}
.copyright {{ font-size:9.5pt; color:#9a9a9a; text-align:center; margin-top:1.5mm; line-height:1.25; }}
'''

VARIANTS = [
    dict(slug='norge', is_striped=True, chart=NORGE_CHART, cmap=CMAP_LETTERS, cell=19, stitches=29,
         no_word='NORGE', no_title='NORGE-BØTTEHATT<br>TIL BABY OG BARN',
         no_desc='Ordet «NORGE» heklet i hvitt tvers over pannen, med en bølget brem som avsluttes i rødt/hvitt/marineblått.',
         en_word='NORGE', en_title='NORGE BUCKET HAT<br>FOR BABY AND CHILD',
         en_desc='The word &laquo;NORGE&raquo; crocheted in white across the forehead, with a wavy brim finishing in red/white/navy.'),
    dict(slug='norway', is_striped=True, chart=NORWAY_CHART, cmap=CMAP_LETTERS, cell=16, stitches=35,
         no_word='NORWAY', no_title='NORWAY-BØTTEHATT<br>TIL BABY OG BARN',
         no_desc='Ordet «NORWAY» heklet i hvitt tvers over pannen, med en bølget brem som avsluttes i rødt/hvitt/marineblått.',
         en_word='NORWAY', en_title='NORWAY BUCKET HAT<br>FOR BABY AND CHILD',
         en_desc='The word &laquo;NORWAY&raquo; crocheted in white across the forehead, with a wavy brim finishing in red/white/navy.'),
    dict(slug='ro', is_striped=False, chart=RO_FLAG_CHART, cmap=CMAP_ROFLAG, cell=19, stitches=25,
         no_word='RO', no_title='RO-BØTTEHATT<br>TIL BABY OG BARN',
         no_desc='Bokstavene «RO» pluss et lite norsk flagg heklet i hvitt/marineblått, med en ensfarget marineblå brem.',
         en_word='RO', en_title='RO BUCKET HAT<br>FOR BABY AND CHILD',
         en_desc='The letters &laquo;RO&raquo; plus a small Norwegian flag crocheted in white/navy, with a solid navy brim.'),
]


def build(v):
    slug = v['slug']
    out_dir = BASE / f'bottehatter-barn-hekle-{slug}'
    ph_no = make_page('LME HEKLEOPPSKRIFT&nbsp;&nbsp;|&nbsp;&nbsp;BØTTEHATT BARN', 'LME HEKLE')
    pages = []

    pages.append(ph_no('''
<div class="coverimg"><img src="''' + photo_src + f'''" alt="{v['no_word']}-bøttehatt til baby og barn, heklet"></div>
<div class="covertag">LME HEKLEOPPSKRIFT</div>
<div class="coverbanner"><h1 class="covertitle">{v['no_title']}</h1></div>
<div class="subpill">{v['no_word']} &middot; STØRRELSE 50&ndash;170</div>
''' + card(f'<p class="center">Samme bøttehatt som {v["no_word"]}-oppskriften for voksne, heklet i fastmasker '
      'og gradert helt fra bunnen av til tjueen babyer-, barne- og ungdomsstørrelser, 50 til 170. Egne, mindre '
      'bokstaver er laget spesielt for de minste hodene. Denne oppskriften er komplett i seg selv, du trenger '
      f'ikke eie noen annen LME-oppskrift for å hekle den. {v["no_desc"]}</p>') + '''
''' + byline('Av Renate Dahl') + '''
''' + tip('Les hele oppskriften én gang før du starter. Hekl alltid en prøvelapp først, se side 4.') + '''
''', 1))

    pages.append(ph_no(
        banner('FØR DU BEGYNNER') +
        '<p>Bøttehatten hekles i spiral (ikke sammenføyde omganger) med fastmasker, fra toppen og ned. Du '
        'hekler først en rundet topp som vokser fra en liten ring, deretter sidene rett ned med motivet i '
        f'midten, og til slutt en {"bølget" if v["is_striped"] else "ensfarget"} brem.</p>' +
        card(f'<p>{v["no_desc"]}</p>') +
        tealp('DETTE LÆRER DU') +
        card(ul([
            'Å hekle i spiral fra en magic ring',
            'Å øke jevnt fordelt for å hekle en flat, rundet topp',
            'Å plassere og hekle et lite bokstav- eller flaggmotiv fra et rutediagram',
            'Å hekle en bølget brem med en økeomgang',
        ])) +
        pink('HVOR VANSKELIG ER DET?') +
        card('<p>Nybegynnervennlig. Du bør kunne hekle fastmasker, kjenne til magic ring og bytte farge. '
             'Motivet hekles med kun to farger av gangen, og alt er forklart trinn for trinn i denne '
             'oppskriften.</p>') +
        cream('<p class="creamtitle">Bruk maskemarkør (en sikkerhetsnål eller tråd i annen farge fungerer fint) '
              'i den første maska i hver omgang, så mister du ikke tellingen i spiralen.</p>')
    , 2))

    pages.append(ph_no(
        banner('STØRRELSER OG RIKTIG PASSFORM') +
        '<p>Klesstørrelsen er bare en veiledning. Mål alltid rundt barnets hode, over ørene og øyenbrynene. '
        'Velg etter hodemålet dersom målet og klesstørrelsen peker mot ulike størrelser.</p>' +
        sizetable(['Str.', 'Ca. alder', 'Hodemål (cm)'], list(zip(SIZES, AGE, HEAD))) +
        tealp('SIKKER BRUK FOR DE MINSTE') +
        card('<p>Hatten er et plagg for våken bruk under tilsyn. Den skal ikke brukes under søvn, i seng, i '
             'vogn uten oppsyn, eller dersom bremmen dekker øyne, nese eller munn. Kontroller alltid at ingen '
             'løse tråder eller lange flotter på innsiden kan hekte seg fast i fingre.</p>') +
        cream('<p class="creamtitle">Barn vokser ulikt. Faktisk hodemål går alltid foran alder, mål på nytt '
              'hver gang du er usikker.</p>')
    , 3))

    pages.append(ph_no(
        banner('DETTE TRENGER DU') +
        tealp('GARN') +
        card('<p>Et glatt bomullsgarn (aran/tykkelse 4) som gir 14 fastmasker x 16 omganger = 10 x 10 cm, '
             'heklet i spiral. Reynolds Saucy, Rico Design Creative Cotton Aran og Hobbii Amigo er alle gode '
             'valg, i rødt, hvitt og marineblått.</p>'
             '<table class="t"><tr><th>Farge</th><th>Bruk</th></tr>'
             f'<tr><td><span class="dot" style="background:{RED}"></span> Rød</td><td>hovedfarge</td></tr>'
             f'<tr><td><span class="dot" style="background:{WHITE};border-color:#ccc;"></span> Hvit</td><td>bokstaver{", brem" if v["is_striped"] else ""}</td></tr>'
             f'<tr><td><span class="dot" style="background:{NAVY}"></span> Marineblå</td><td>{"brem, flagg" if v["is_striped"] else "hele bremmen, flagg"}</td></tr></table>'
             '<p class="small">Ha rikelig av rød hovedfarge (nesten hele hatten) og ett lite nøste hver av '
             'hvitt og marineblått, de brukes bare i bremmen og motivet.</p>') +
        pink('HEKLENÅL OG UTSTYR') +
        card(ul([
            'Heklenål som gir oppgitt fasthet, ofte 3,5&ndash;4 mm for et aran-garn',
            'Stoppenål, saks og målebånd',
            'Maskemarkør til første maske i hver omgang',
        ])) +
        cream('<p class="creamtitle">Hekler du fast, prøv en større nål. Hekler du løst, prøv en mindre. Målet '
              'er alltid 14 fastmasker på 10 cm.</p>')
    , 4))

    pages.append(ph_no(
        banner('HEKLEFASTHET, DEN VIKTIGE NØKKELEN') +
        tealp('HEKL EN PRØVELAPP FØRST') +
        card('<p>Hekle en firkant på minst 12 x 12 cm i fastmasker med hovedfargen. Vask og tørk den slik du '
             'vil behandle hatten, mål deretter midt på lappen.</p>' +
             ul([
                 'Flere enn 14 fm på 10 cm: prøv en større nål.',
                 'Færre enn 14 fm på 10 cm: prøv en mindre nål.',
                 'Nøyaktig 14 fm: bruk nålen din og sett i gang.',
             ])) +
        pink('ORDLISTE') +
        card('<table class="t tl"><tr><th>Ord</th><th>Betyr</th></tr>'
             '<tr><td><b>fm</b></td><td>fastmaske</td></tr>'
             '<tr><td><b>omg</b></td><td>omgang, én hel runde rundt</td></tr>'
             '<tr><td><b>øk</b></td><td>økning, 2 fm i samme maske</td></tr>'
             '<tr><td><b>2 fm sammen</b></td><td>hekle 2 masker som &eacute;n, minker &eacute;n maske</td></tr>'
             '<tr><td><b>HF</b></td><td>hovedfarge (rød)</td></tr>'
             '<tr><td><b>spiral</b></td><td>omgangene hekles i én sammenhengende runde, uten kjedemaske og '
             'oppstart, følg maskemarkøren</td></tr>'
             '<tr><td><b>flott</b></td><td>tråden som løper på innsiden når fargen ikke brukes</td></tr></table>')
    , 5))

    pages.append(ph_no(
        banner('DEL 1: TOPPEN') +
        steps([
            'Hekle 6 fm i en magic ring med rød hovedfarge. Dra ringen sammen. Sett en maskemarkør i den '
            'første masken, flytt markøren opp én maske for hver ny omgang. Fra nå av hekles alt i spiral, '
            'uten kjedemaske.',
            'Omg 2: øk (2 fm) i hver maske rundt = 12 masker.',
            'Omg 3: *øk, 1 fm*, gjenta rundt = 18 masker.',
            'Omg 4: *øk, 1 fm, 1 fm*, gjenta rundt = 24 masker. Fortsett etter samme mønster: hver ny omgang '
            'økes 6 masker jevnt fordelt, med &eacute;n vanlig fm mer mellom hver økning enn omgangen før.',
            'Finn tallet for din størrelse i kolonnen &laquo;Standardomgang&raquo; i tabellen på neste side. '
            'Fortsett å øke etter mønsteret over til du har heklet akkurat denne omgangen.',
            'Har størrelsen din et tall i kolonnen &laquo;Ekstra&raquo; som ikke er 0, hekler du &eacute;n '
            'omgang til: fordel det oppgitte antallet økninger jevnt utover omgangen (for eksempel hver '
            'sjette/sjuende maske), resten vanlige fm. Da lander du nøyaktig på tallet i kolonnen '
            '&laquo;Totalt&raquo;.',
        ]) +
        cream('<p class="creamtitle">Kontroller diameteren mot tabellen på neste side, ikke bare '
              'maskeantallet. Er du mer enn 0,5 cm unna, juster nålstørrelsen før du fortsetter.</p>')
    , 6))

    pages.append(ph_no(
        banner('TABELL: TOPPEN, ALLE STØRRELSER') +
        sizetable(['Str.', 'Standardomgang', 'Ekstra', 'Totalt masker', 'Toppdiam. (cm)'],
                  list(zip(SIZES, STD_ROUND, EXTRA, FINAL, TOPPDIAM)))
    , 7))

    pages.append(ph_no(
        banner('DEL 2: SIDENE OG MOTIVET') +
        steps([
            'Når toppen har riktig maskeantall, hekler du rett ned uten flere økninger. Behold maskeantallet '
            'fra tabellen på forrige side gjennom hele denne delen, det er nå sidene på hatten.',
            'Hekle antall omganger oppgitt i kolonnen &laquo;Før motiv&raquo; i tabellen under, i hovedfargen.',
            'Hekle inn motivet ditt her, 7 omganger, se diagrammet på neste side. Viktig: siden hatten hekles '
            'fra toppen og ned, hekler du diagrammet <b>ovenfra og ned</b> (omgang 7 først, omgang 1 sist), '
            'motsatt rekkefølge av strikkeversjonen.',
            'Fortsett rett i hovedfargen etter motivet, i antall omganger fra kolonnen &laquo;Etter motiv&raquo;.',
        ]) +
        tealp('TABELL: SIDENE') +
        sizetable(['Str.', 'Før motiv (omg)', 'Motiv (omg)', 'Etter motiv (omg)', 'Ferdig omkrets (cm)'],
                  [[s, fm, 7, em, fo] for s, fm, em, fo in zip(SIZES, FOR_MOTIV, ETTER_MOTIV, FERDIG_OMKR)])
    , 8))

    pages.append(ph_no(
        banner('MOTIVDIAGRAMMET') +
        '<p>Motivet hekles med hvitt eller marineblått på rød bunn, i fastmasker: hver rute i diagrammet er '
        'nøyaktig én fastmaske og én omgang.</p>' +
        tealp('SLIK PLASSERER DU MOTIVET') +
        card('<p>Tell maskene rundt og finn midten (halvparten av det totale maskeantallet fra tabellen på '
             'side 7), det blir midt foran, midt på pannen. Sentrer diagrammet rundt dette punktet, med like '
             'mange bakgrunnsmasker på hver side. Hold den medløpende tråden løs på innsiden.</p>') +
        tealp(f'DIAGRAM: {v["no_word"]} ({v["stitches"]} masker x 7 omganger)') +
        f'<div class="chartrow">{chart_svg(v["chart"], v["cmap"], cell=v["cell"], numbers=True)}</div>' +
        cream('<p class="creamtitle">Les diagrammet ovenfra og ned</p>'
              '<p>Omgang 7, &oslash;verst i diagrammet, hekles f&oslash;rst, omgang 1, nederst, sist. Gj&oslash;r '
              'du det motsatt, blir bokstavene opp-ned.</p>')
    , 9))

    if v['is_striped']:
        del3_steps = [
            'Bytt til hvitt. Hekle &eacute;n omgang uten økning i den nye fargen.',
            'Finn kolonnen &laquo;Øk på omg.&raquo; i tabellen på neste side. På hver av disse omgangnumrene '
            '(talt fra starten av bremmen) fordeler du antall økninger fra kolonnen &laquo;Økn. hver gang&raquo; '
            'jevnt utover omgangen. På omgangene mellom økningene hekler du &eacute;n vanlig fm i hver maske.',
            'Fortsett til bremmen har heklet i antall omganger fra kolonnen &laquo;Bremomg.&raquo; på side 3. '
            'Sluttresultatet blir omtrent tallet i kolonnen &laquo;Ca. slutt&raquo;.',
            'Legg hvit&ndash;marineblå&ndash;hvit&ndash;rød på de siste fire bremomgangene. Har størrelsen '
            'f&aelig;rre enn fire igjen, begynner stripene tilsvarende tidligere.',
        ]
    else:
        del3_steps = [
            'Bytt til marineblått, det er den eneste fargen bremmen hekles i. Hekle &eacute;n omgang uten '
            'økning i den nye fargen.',
            'Finn kolonnen &laquo;Øk på omg.&raquo; i tabellen på neste side. På hver av disse omgangnumrene '
            '(talt fra starten av bremmen) fordeler du antall økninger fra kolonnen &laquo;Økn. hver gang&raquo; '
            'jevnt utover omgangen. På omgangene mellom økningene hekler du &eacute;n vanlig fm i hver maske.',
            'Fortsett til bremmen har heklet i antall omganger fra kolonnen &laquo;Bremomg.&raquo; på side 3, '
            'hele veien i marineblått. Sluttresultatet blir omtrent tallet i kolonnen &laquo;Ca. slutt&raquo;.',
        ]
    pages.append(ph_no(
        banner('DEL 3: BREMMEN') +
        steps(del3_steps)
    , 10))

    pages.append(ph_no(
        banner('TABELL: BREMMEN, ALLE STØRRELSER') +
        sizetable(['Str.', 'Bremomg.', 'Øk på omg.', 'Økn. hver gang', 'Ca. slutt (m)'],
                  list(zip(SIZES, BREMOMG, OK_PA, OKN_HVER, CA_SLUTT))) +
        pink('BØLGET AVSLUTNING' if v['is_striped'] else 'AVSLUTNING') +
        card('<p>For en rolig bølge: avslutt med kjedemasker eller krepsemasker. For en tydeligere bølge: '
             '*3 fm i neste maske, 1 fm, hopp over 2 masker*, gjenta rundt. På de minste størrelsene (50&ndash;'
             '68) anbefales den rolige avslutningen, slik at bremmen ikke blir tung foran ansiktet.</p>')
    , 11))

    pages.append(ph_no(
        banner('STELL OG SISTE SJEKK') +
        tealp('AVSLUTNING') +
        card('<p>Klipp av tråden med god margin og fest den godt på innsiden. Fest alle løse tråder, spesielt '
             'ved fargebyttene i bremmen og rundt motivet. Kontroller at flottene på innsiden ligger løst.</p>') +
        tealp('STELL') +
        card('<p>Vask etter garnets anbefaling, ofte 30&deg;C på skånsomt program i vaskepose, eller for hånd. '
             'Ikke bruk tørketrommel. Form hatten over en bolle eller et glass i riktig størrelse og la den '
             'tørke flatt eller på formen.</p>') +
        pink('SJEKKLISTE') +
        card(check([
            'Hodemålet er kontrollert, ikke bare alder',
            'Prøvelappen stemmer med 14 fm x 16 omganger på 10 cm',
            'Toppens diameter stemmer med tabellen på side 7',
            'Motivet er sentrert midt foran',
            'Alle flotter på innsiden ligger løst',
            'Bremmen er heklet i angitt antall omganger og har fasongen fra tabellen',
        ])) +
        '<div class="congrats">Gratulerer, du har heklet din egen barnebøttehatt!</div>' +
        byline('Renate Dahl') +
        '<p class="copyright">&copy; 2026 Little Montessori Explorers. Oppskriften er kun til personlig '
        'bruk. Oppskriften og diagrammene kan ikke kopieres, deles, videreselges eller publiseres. '
        'Ferdige produkter kan selges i liten skala med kreditering til Little Montessori Explorers.</p>' +
        '<p style="font-size:11pt;color:#c0392b;text-align:center;margin-top:2mm;">Hatten er et plagg for '
        'våken bruk under tilsyn. Skal ikke brukes under søvn eller i vogn uten oppsyn.</p>'
    , 12))

    pages_no = pages

    ph_en = make_page('LME CROCHET PATTERN&nbsp;&nbsp;|&nbsp;&nbsp;KIDS BUCKET HAT', 'LME CROCHET')
    pages = []

    pages.append(ph_en('''
<div class="coverimg"><img src="''' + photo_src + f'''" alt="{v['en_word']} bucket hat for baby and child, crochet"></div>
<div class="covertag">LME CROCHET PATTERN</div>
<div class="coverbanner"><h1 class="covertitle">{v['en_title']}</h1></div>
<div class="subpill">{v['en_word']} &middot; SIZE 50&ndash;170</div>
''' + card(f'<p class="center">The same bucket hat as the {v["en_word"]} pattern for adults, crocheted in '
      'single crochet and graded completely from scratch into twenty-one baby, child and teen sizes, 50 to 170. '
      'Smaller letters were designed just for the smallest heads. This pattern is complete on its own, you do '
      f'not need any other LME pattern to crochet it. {v["en_desc"]}</p>') + '''
''' + byline('By Renate Dahl') + '''
''' + tip('Read the whole pattern once before you start. Always crochet a gauge swatch first, see page 4.') + '''
''', 1))

    pages.append(ph_en(
        banner('BEFORE YOU START') +
        '<p>The bucket hat is crocheted in a spiral (not joined rounds) in single crochet, from the top down. '
        'You first crochet a rounded top that grows from a small ring, then the sides straight down with the '
        f'motif in the middle, and finally a {"wavy, flared" if v["is_striped"] else "solid-coloured"} brim.</p>' +
        card(f'<p>{v["en_desc"]}</p>') +
        tealp('WHAT YOU LEARN') +
        card(ul([
            'To crochet in a spiral from a magic ring',
            'To increase evenly to crochet a flat, rounded top',
            'To place and crochet a small letter or flag motif from a chart',
            'To crochet a {} brim with an increase round'.format('flared, wavy' if v['is_striped'] else 'solid'),
        ])) +
        pink('HOW HARD IS IT?') +
        card('<p>Beginner friendly. You should be able to single crochet, know how to start a magic ring, and '
             'change colour. The motif is crocheted with only two colours at a time, and every step is spelled '
             'out in this pattern.</p>') +
        cream('<p class="creamtitle">Use a stitch marker (a safety pin or a bit of contrast yarn works fine) in '
              'the first stitch of every round, so you do not lose count in the spiral.</p>')
    , 2))

    pages.append(ph_en(
        banner('SIZES AND GETTING THE FIT RIGHT') +
        '<p>The clothing size is only a guide. Always measure around the child&rsquo;s head, above the ears and '
        'eyebrows. Go by the head measurement if it and the clothing size point to different sizes.</p>' +
        sizetable(['Size', 'Approx. age', 'Head (cm)'], list(zip(SIZES, EN_AGE, HEAD))) +
        tealp('SAFE USE FOR THE YOUNGEST') +
        card('<p>The hat is a garment for supervised, awake use. It should not be used during sleep, in a cot, '
             'in a pram unattended, or if the brim covers the eyes, nose or mouth. Always check that no loose '
             'threads or long floats on the inside can catch on little fingers.</p>') +
        cream('<p class="creamtitle">Children grow at different rates. The actual head measurement always '
              'beats age, measure again whenever you are unsure.</p>')
    , 3))

    pages.append(ph_en(
        banner('WHAT YOU NEED') +
        tealp('YARN') +
        card('<p>A smooth cotton yarn (aran weight) that gives 14 single crochet x 16 rounds = 10 x 10 cm, '
             'crocheted in a spiral. Reynolds Saucy, Rico Design Creative Cotton Aran and Hobbii Amigo are all '
             'good choices, in red, white and navy.</p>'
             '<table class="t"><tr><th>Colour</th><th>Use</th></tr>'
             f'<tr><td><span class="dot" style="background:{RED}"></span> Red</td><td>main colour</td></tr>'
             f'<tr><td><span class="dot" style="background:{WHITE};border-color:#ccc;"></span> White</td><td>letters{", brim" if v["is_striped"] else ""}</td></tr>'
             f'<tr><td><span class="dot" style="background:{NAVY}"></span> Navy</td><td>{"brim, flag" if v["is_striped"] else "whole brim, flag"}</td></tr></table>'
             '<p class="small">Have plenty of red main colour (almost the whole hat) and one small ball each of '
             'white and navy, they are only used in the brim and the motif.</p>') +
        pink('HOOK AND KIT') +
        card(ul([
            'A crochet hook that gives the stated gauge, often 3.5&ndash;4 mm for an aran yarn',
            'Tapestry needle, scissors and tape measure',
            'Stitch marker for the first stitch of every round',
        ])) +
        cream('<p class="creamtitle">If you crochet tightly, try a bigger hook. If you crochet loosely, try a '
              'smaller one. The target is always 14 single crochet over 10 cm.</p>')
    , 4))

    pages.append(ph_en(
        banner('GAUGE, THE SECRET KEY') +
        tealp('CROCHET A SWATCH FIRST') +
        card('<p>Crochet a square at least 12 x 12 cm in single crochet with the main colour. Wash and dry it '
             'the way you plan to treat the hat, then measure across the middle.</p>' +
             ul([
                 'More than 14 sc over 10 cm: try a bigger hook.',
                 'Fewer than 14 sc over 10 cm: try a smaller hook.',
                 'Exactly 14 sc: use your hook and get going.',
             ])) +
        pink('GLOSSARY') +
        card('<table class="t tl"><tr><th>Term</th><th>Means</th></tr>'
             '<tr><td><b>sc</b></td><td>single crochet</td></tr>'
             '<tr><td><b>round</b></td><td>one whole lap around</td></tr>'
             '<tr><td><b>inc</b></td><td>increase, 2 sc in the same stitch</td></tr>'
             '<tr><td><b>sc2tog</b></td><td>crochet 2 stitches together, decreases one stitch</td></tr>'
             '<tr><td><b>MC</b></td><td>main colour (red)</td></tr>'
             '<tr><td><b>spiral</b></td><td>the rounds are worked as one continuous round, no slip stitch or '
             'chain-up, follow the stitch marker</td></tr>'
             '<tr><td><b>float</b></td><td>the thread that runs on the inside when the colour is not in use</td></tr></table>')
    , 5))

    pages.append(ph_en(
        banner('PART 1: THE TOP') +
        steps([
            'Crochet 6 sc into a magic ring in red main colour. Pull the ring closed. Place a stitch marker in '
            'the first stitch, move the marker up one stitch for every new round. From now on everything is '
            'worked in a spiral, no slip stitch.',
            'Round 2: inc (2 sc) in every stitch around = 12 stitches.',
            'Round 3: *inc, 1 sc*, repeat around = 18 stitches.',
            'Round 4: *inc, 1 sc, 1 sc*, repeat around = 24 stitches. Continue the same way: every new round '
            'increases 6 stitches evenly spaced, with one more plain sc between each increase than the round '
            'before.',
            'Find the number for your size in the &laquo;Standard round&raquo; column in the table on the next '
            'page. Keep increasing this way until you have crocheted exactly that round.',
            'If your size has a number other than 0 in the &laquo;Extra&raquo; column, crochet one more round: '
            'spread that many increases evenly around the round (for example every sixth or seventh stitch), '
            'plain sc the rest. That lands you exactly on the &laquo;Total&raquo; number.',
        ]) +
        cream('<p class="creamtitle">Check the diameter against the table on the next page, not just the '
              'stitch count. If you are more than 0.5 cm off, adjust your hook size before continuing.</p>')
    , 6))

    pages.append(ph_en(
        banner('TABLE: THE TOP, ALL SIZES') +
        sizetable(['Size', 'Standard round', 'Extra', 'Total stitches', 'Top diam. (cm)'],
                  list(zip(SIZES, STD_ROUND, EXTRA, FINAL, TOPPDIAM)))
    , 7))

    pages.append(ph_en(
        banner('PART 2: THE SIDES AND THE MOTIF') +
        steps([
            'Once the top has the right stitch count, crochet straight down with no more increases. Keep the '
            'stitch count from the table on the previous page through this whole part, this is now the sides '
            'of the hat.',
            'Crochet the number of rounds given in the &laquo;Before motif&raquo; column in the table below, in '
            'the main colour.',
            'Crochet your motif here, 7 rounds, see the chart on the next page. Important: because the hat is '
            'crocheted from the top down, you work the chart <b>top to bottom</b> (round 7 first, round 1 '
            'last), the opposite order from the knitting pattern.',
            'Continue plain in the main colour after the motif, for the number of rounds in the &laquo;After '
            'motif&raquo; column.',
        ]) +
        tealp('TABLE: THE SIDES') +
        sizetable(['Size', 'Before motif (rnds)', 'Motif (rnds)', 'After motif (rnds)', 'Finished circ. (cm)'],
                  [[s, fm, 7, em, fo] for s, fm, em, fo in zip(SIZES, FOR_MOTIV, ETTER_MOTIV, FERDIG_OMKR)])
    , 8))

    pages.append(ph_en(
        banner('THE MOTIF CHART') +
        '<p>The motif is crocheted in white or navy on a red background, in single crochet: each square in '
        'the chart is exactly one single crochet and one round.</p>' +
        tealp('HOW TO PLACE THE MOTIF') +
        card('<p>Count the stitches around and find the middle (half of the total stitch count from the table '
             'on page 7), that becomes centre front, the middle of the forehead. Centre the chart around this '
             'point, with the same number of background stitches on each side. Keep the carried thread loose '
             'on the inside.</p>') +
        tealp(f'CHART: {v["en_word"]} ({v["stitches"]} stitches x 7 rounds)') +
        f'<div class="chartrow">{chart_svg(v["chart"], v["cmap"], cell=v["cell"], numbers=True)}</div>' +
        cream('<p class="creamtitle">Read the chart top to bottom</p>'
              '<p>Round 7, at the top of the chart, is worked first, round 1, at the bottom, is worked last. '
              'Work it the other way round and the letters come out upside down.</p>')
    , 9))

    if v['is_striped']:
        en_del3_steps = [
            'Switch to white. Crochet one round with no increase in the new colour.',
            'Find the &laquo;Increase on rnd&raquo; column in the table on the next page. On each of these round '
            'numbers (counted from the start of the brim), spread the number of increases from the &laquo;'
            'Increases each time&raquo; column evenly around the round. On the rounds in between, crochet one '
            'plain sc in every stitch.',
            'Continue until the brim has been crocheted for the number of rounds in the &laquo;Brim rounds&raquo; '
            'column on page 3. The end result comes out at about the &laquo;Approx. total&raquo; number.',
            'Work white&ndash;navy&ndash;white&ndash;red over the last four brim rounds. If your size has fewer '
            'than four rounds left, the stripes start correspondingly earlier.',
        ]
    else:
        en_del3_steps = [
            'Switch to navy, the only colour the brim is crocheted in. Crochet one round with no increase in '
            'the new colour.',
            'Find the &laquo;Increase on rnd&raquo; column in the table on the next page. On each of these round '
            'numbers (counted from the start of the brim), spread the number of increases from the &laquo;'
            'Increases each time&raquo; column evenly around the round. On the rounds in between, crochet one '
            'plain sc in every stitch.',
            'Continue until the brim has been crocheted for the number of rounds in the &laquo;Brim rounds&raquo; '
            'column on page 3, all the way in navy. The end result comes out at about the &laquo;Approx. '
            'total&raquo; number.',
        ]
    pages.append(ph_en(
        banner('PART 3: THE BRIM') +
        steps(en_del3_steps)
    , 10))

    pages.append(ph_en(
        banner('TABLE: THE BRIM, ALL SIZES') +
        sizetable(['Size', 'Brim rnds', 'Increase on rnd', 'Increases each time', 'Approx. total (st)'],
                  list(zip(SIZES, BREMOMG, OK_PA, OKN_HVER, CA_SLUTT))) +
        pink('THE WAVY FINISH' if v['is_striped'] else 'FINISHING') +
        card('<p>For a calm wave: finish with slip stitches or crab stitch. For a more pronounced wave: '
             '*3 sc in the next stitch, 1 sc, skip 2 stitches*, repeat around. For the smallest sizes (50'
             '&ndash;68) the calm finish is recommended, so the brim does not sit heavy in front of the face.</p>')
    , 11))

    pages.append(ph_en(
        banner('CARE AND FINAL CHECK') +
        tealp('FINISHING') +
        card('<p>Cut the yarn leaving a generous tail and fasten it off securely on the inside. Weave in all '
             'loose ends, especially at the colour changes in the brim and around the motif. Check that the '
             'floats on the inside lie loose.</p>') +
        tealp('CARE') +
        card('<p>Wash following the yarn&rsquo;s recommendation, often 30&deg;C on a gentle cycle in a wash '
             'bag, or by hand. Do not tumble dry. Shape the hat over a bowl or glass of the right size and let '
             'it dry flat or on the form.</p>') +
        pink('CHECKLIST') +
        card(check([
            'The head measurement has been checked, not just age',
            'The swatch matches 14 sc x 16 rounds over 10 cm',
            'The top&rsquo;s diameter matches the table on page 7',
            'The motif is centred at centre front',
            'All floats on the inside lie loose',
            'The brim has been crocheted for the stated number of rounds and has the shape from the table',
        ])) +
        '<div class="congrats">Congratulations, you have crocheted your very own kids&rsquo; bucket hat!</div>' +
        byline('Renate Dahl') +
        '<p class="copyright">&copy; 2026 Little Montessori Explorers. This pattern is for personal use '
        'only. The pattern and charts may not be copied, shared, resold or published. Finished items may '
        'be sold on a small scale with credit to Little Montessori Explorers.</p>' +
        '<p style="font-size:11pt;color:#c0392b;text-align:center;margin-top:2mm;">The hat is a garment for '
        'supervised, awake use. Do not use during sleep or in a pram unattended.</p>'
    , 12))

    pages_en = pages

    doc_no = f'''<!DOCTYPE html>
<html lang="no"><head><meta charset="utf-8">
<title>{v['no_word']}-bøttehatt barn, LME hekleoppskrift</title>
<style>{css}</style></head>
<body>{''.join(pages_no)}</body></html>'''
    doc_en = f'''<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8">
<title>{v['en_word']} bucket hat kids, LME crochet pattern</title>
<style>{css}</style></head>
<body>{''.join(pages_en)}</body></html>'''

    (out_dir / 'barn_hekle_no.html').write_text(doc_no, encoding='utf-8')
    (out_dir / 'barn_hekle_en.html').write_text(doc_en, encoding='utf-8')
    print('OK', slug, len(doc_no), 'tegn (no),', len(doc_en), 'tegn (en)')


for v in VARIANTS:
    build(v)
