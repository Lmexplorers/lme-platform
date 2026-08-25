# -*- coding: utf-8 -*-
"""RETTELSE: RO-bøttehatt barn, heklet, skal være samme design som RO-bøttehatt
for VOKSNE (hvit hoveddel, blå brem med økninger og bølget kant, RO+flagg foran,
bølger bak, heklet rett inn med fastmasker), ikke en rød bokstav-hatt som
NORGE/NORWAY. Denne overskriver kun RO-varianten fra _build_barn_hekle_split.py,
NORGE og NORWAY er allerede riktige og rørt ikke. Struktur og fargevalg hentet
direkte fra voksenoppskriften (ro-bottehatt/build_hekle_ro.py)."""
import base64, html, pathlib

BASE = pathlib.Path(__file__).parent
OUT_DIR = BASE / 'bottehatter-barn-hekle-ro'
PHOTO = OUT_DIR / 'ro_adult_ref.jpg'
LOGO = OUT_DIR / 'lme-logo.png'

TEAL, RED, NAVY, WHITE, CREAM, INK, PINK, CERISE = (
    '#4aa7a4', '#C8102E', '#00205B', '#FFFFFF', '#F8F4EA', '#3f3f3f', '#df5f93', '#E91E89')
BLUE = '#1f5fbf'  # kongeblå til RO-hatten, som hos voksen

# ---------- diagramdata, hentet direkte fra voksenoppskriften (ro-bottehatt/build_hekle_ro.py) ----------
BIG_R = ["######.","#.....#","#.....#","#.....#","######.","#..#...","#...#..","#....#.","#.....#"]
BIG_O = ["..###..",".#...#.","#.....#","#.....#","#.....#","#.....#","#.....#",".#...#.","..###.."]
FLAG = [
    "RRRWBBWRRRRRR", "RRRWBBWRRRRRR", "RRRWBBWRRRRRR",
    "WWWWBBWWWWWWW", "BBBBBBBBBBBBB", "BBBBBBBBBBBBB", "WWWWBBWWWWWWW",
    "RRRWBBWRRRRRR", "RRRWBBWRRRRRR", "RRRWBBWRRRRRR",
]
WAVE = [
    "...##...#.#",
    "..#####....",
    ".######.##.",
    ".######..#.",
    "########...",
    "#########..",
    "##########.",
    "###########",
]
WAVE_M = [r[::-1] for r in WAVE]
CMAP = {'.': CREAM, '#': BLUE, 'R': RED, 'W': '#ffffff', 'B': NAVY}


def chart_svg(rows, cell=18, numbers=False):
    w, h = len(rows[0]), len(rows)
    pad_r = 26 if numbers else 4
    W, H = w * cell + 8 + pad_r, h * cell + 12
    p = [f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" '
         f'style="width:{W*0.28}mm;height:{H*0.28}mm">']
    for y, row in enumerate(rows):
        for x, ch in enumerate(row):
            p.append(f'<rect x="{4+x*cell}" y="{4+y*cell}" width="{cell}" height="{cell}" '
                     f'fill="{CMAP[ch]}" stroke="rgba(0,0,0,0.28)" stroke-width="1"/>')
    p.append(f'<rect x="4" y="4" width="{w*cell}" height="{h*cell}" fill="none" '
             f'stroke="#3f3f3f" stroke-width="2.5" rx="1"/>')
    if numbers:
        for y in range(h):
            n = h - y
            yy = 4 + y*cell + cell/2 + 4
            p.append(f'<text x="{4+w*cell+8}" y="{yy}" font-size="12" fill="#666" '
                     f'font-family="sans-serif">{n}</text>')
    p.append('</svg>')
    return f'<div class="chartbox">{"".join(p)}</div>'


def mini_flag(w=34):
    h = round(w * 10 / 13)
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 26 20" '
            f'style="width:{w}px;height:{h}px;border-radius:3px">'
            f'<rect width="26" height="20" fill="{RED}"/>'
            f'<rect x="6" width="6" height="20" fill="#fff"/><rect y="7" width="26" height="6" fill="#fff"/>'
            f'<rect x="7.5" width="3" height="20" fill="{NAVY}"/><rect y="8.5" width="26" height="3" fill="{NAVY}"/>'
            f'</svg>')


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
TOPPDIAM = ["10.9", "11.6", "12.3", "13.0", "13.6", "14.3", "15.0", "15.5", "15.9", "16.4",
            "16.6", "16.8", "16.8", "17.1", "17.3", "17.3", "17.5", "17.7", "17.7", "18.0", "18.2"]
FERDIG_OMKR = ["34.3", "36.4", "38.6", "40.7", "42.9", "45.0", "47.1", "48.6", "50.0", "51.4",
               "52.0", "52.5", "53.0", "53.5", "54.0", "54.5", "55.0", "55.5", "56.0", "56.5", "57.0"]
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
.cflag {{ line-height:0; }}
'''

ph_no = make_page('LME HEKLEOPPSKRIFT&nbsp;&nbsp;|&nbsp;&nbsp;RO-BØTTEHATT BARN', 'LME HEKLE')
pages = []

pages.append(ph_no('''
<div class="coverimg"><img src="''' + photo_src + '''" alt="Hvit RO-bøttehatt med flagg og RO foran, bølger bak, blå brem"></div>
<div class="covertag">LME HEKLEOPPSKRIFT</div>
<div class="coverbanner">
  <div class="cflag">''' + mini_flag(34) + '''</div>
  <h1 class="covertitle">RO-BØTTEHATT<br>TIL BABY OG BARN</h1>
  <div class="cflag">''' + mini_flag(34) + '''</div>
</div>
<div class="subpill">HVIT MED BLÅ RO, FLAGG OG BØLGER &middot; STØRRELSE 50&ndash;170</div>
''' + card('<p class="center">Samme RO-bøttehatt som oppskriften for voksne: hvit bomullshatt med det norske flagget og '
      '"RO" i blått foran, og to blå bølgeskvulp bak, med en blå brem med økninger som avsluttes i en bølget kant. '
      'Gradert helt fra bunnen av til tjueen babyer-, barne- og ungdomsstørrelser, 50 til 170. Denne oppskriften er '
      'komplett i seg selv, du trenger ikke eie noen annen LME-oppskrift for å hekle den.</p>') + '''
''' + byline('Av Renate Dahl') + '''
''' + tip('Les hele oppskriften én gang før du starter. Hekl alltid en prøvelapp først, se side 4.') + '''
''', 1))

pages.append(ph_no(
    banner('FØR DU BEGYNNER') +
    '<p>Bøttehatten hekles i spiral (ikke sammenføyde omganger) med fastmasker, fra toppen og ned, i hvit '
    'hovedfarge. Du hekler først en rundet topp som vokser fra en liten ring, deretter sidene rett ned med "RO" '
    'og flagget foran og to bølger bak, hekling rett inn med fastmasker, og til slutt en blå brem med '
    'økninger som avsluttes i en bølget kant.</p>' +
    tealp('DETTE LÆRER DU') +
    card(ul([
        'Å hekle i spiral fra en magic ring',
        'Å øke jevnt fordelt for å hekle en flat, rundet topp',
        'Å plassere og hekle to ulike motiver (RO+flagg foran, bølger bak) fra rutediagram',
        'Å hekle en blå brem med økninger og en bølget avslutning',
    ])) +
    pink('HVOR VANSKELIG ER DET?') +
    card('<p>Nybegynnervennlig, med litt øvelse på fargeskift. Du bør kunne hekle fastmasker, kjenne til magic '
         'ring og bytte farge. Motivene hekles med kun to farger av gangen, og alt er forklart trinn for '
         'trinn i denne oppskriften.</p>') +
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
         'valg, i hvitt/natur, kongeblått og litt rødt.</p>'
         '<table class="t"><tr><th>Farge</th><th>Bruk</th></tr>'
         f'<tr><td><span class="dot" style="background:{WHITE};border-color:#ccc;"></span> Hvit/natur</td><td>hovedfarge, toppen og sidene</td></tr>'
         f'<tr><td><span class="dot" style="background:{BLUE}"></span> Kongeblå</td><td>hele bremmen, RO, bølgene</td></tr>'
         f'<tr><td><span class="dot" style="background:{RED}"></span> Rød</td><td>flagget</td></tr>'
         f'<tr><td><span class="dot" style="background:{NAVY}"></span> Marineblå</td><td>flagget</td></tr></table>'
         '<p class="small">Ha rikelig av hvit hovedfarge (nesten hele hatten) og litt kongeblått, rødt og '
         'marineblått til bremmen og motivene.</p>') +
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
    card('<p>Hekle en firkant på minst 12 x 12 cm i fastmasker med hvit hovedfarge. Vask og tørk den slik du '
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
         '<tr><td><b>HF</b></td><td>hovedfarge (hvit)</td></tr>'
         '<tr><td><b>spiral</b></td><td>omgangene hekles i én sammenhengende runde, uten kjedemaske og '
         'oppstart, følg maskemarkøren</td></tr>'
         '<tr><td><b>flott</b></td><td>tråden som løper på innsiden når fargen ikke brukes</td></tr></table>')
, 5))

pages.append(ph_no(
    banner('DEL 1: TOPPEN') +
    steps([
        'Hekle 6 fm i en magic ring med hvit hovedfarge. Dra ringen sammen. Sett en maskemarkør i den '
        'første masken, flytt markøren opp én maske for hver ny omgang. Fra nå av hekles alt i spiral, '
        'uten kjedemaske.',
        'Omg 2: øk (2 fm) i hver maske rundt = 12 masker.',
        'Omg 3: *øk, 1 fm*, gjenta rundt = 18 masker.',
        'Omg 4: *øk, 1 fm, 1 fm*, gjenta rundt = 24 masker. Fortsett etter samme mønster: hver ny omgang '
        'økes 6 masker jevnt fordelt, med &eacute;n vanlig fm mer mellom hver økning enn omgangen før.',
        'Finn tallet for din størrelse i kolonnen "Standardomgang" i tabellen på neste side. '
        'Fortsett å øke etter mønsteret over til du har heklet akkurat denne omgangen.',
        'Har størrelsen din et tall i kolonnen "Ekstra" som ikke er 0, hekler du &eacute;n '
        'omgang til: fordel det oppgitte antallet økninger jevnt utover omgangen (for eksempel hver '
        'sjette/sjuende maske), resten vanlige fm. Da lander du nøyaktig på tallet i kolonnen "Totalt".',
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
    banner('DEL 2: SIDENE MED RO OG BØLGENE') +
    steps([
        'Når toppen har riktig maskeantall, hekler du rett ned uten flere økninger. Behold maskeantallet '
        'fra tabellen på forrige side gjennom hele denne delen, det er nå sidene på hatten.',
        'Hekle antall omganger oppgitt i kolonnen "Før motiv" i tabellen under, i hvit hovedfarge.',
        'Hekle inn "RO" og flagget foran, og de to bølgene bak, samtidig, 7 omganger, se diagrammene på '
        'neste side. Viktig: siden hatten hekles fra toppen og ned, hekler du diagrammene <b>nedenfra og '
        'opp</b>, akkurat som i strikkeversjonen.',
        'Fortsett rett i hvit hovedfarge etter motivene, i antall omganger fra kolonnen "Etter motiv".',
    ]) +
    pink('VIKTIG: HEKLE MOTIVET RETT INN') +
    card('<p>Motivene hekles rett inn i sidene mens du hekler, ikke brodert på etterpå. Legg fargen du '
         'ikke bruker oppå omgangen og hekle de hvite maskene rundt den, så den ligger gjemt inni. Der et '
         'motiv skal være, henter du opp fargen fra diagrammet og hekler med den i stedet. Bytt farge i '
         'den siste bevegelsen på masken før, så blir skiftet reint. Hold tråden som ligger inni løs, så '
         'hatten ikke strammer.</p>') +
    tealp('TABELL: SIDENE') +
    sizetable(['Str.', 'Før motiv (omg)', 'Motiv (omg)', 'Etter motiv (omg)', 'Ferdig omkrets (cm)'],
              [[s, fm, 7, em, fo] for s, fm, em, fo in zip(SIZES, FOR_MOTIV, ETTER_MOTIV, FERDIG_OMKR)])
, 8))

pages.append(ph_no(
    banner('DIAGRAMMENE, FORAN OG BAK') +
    '<p>Motivene hekles med kongeblått, rødt og marineblått på hvit bunn: hver rute i diagrammet er '
    'nøyaktig én fastmaske og én omgang.</p>' +
    tealp('SLIK PLASSERER DU MOTIVENE') +
    card('<p>Tell maskene rundt og finn midt foran (rett overfor maskemarkøren, som er midt bak). RO er 15 '
         'masker bredt, sentrer det rundt midt foran. Flagget hekles ca. 2 omganger over RO, midt på. '
         'Bølgene hekles på samme omgang som RO, én på hver side av midt bak (maskemarkøren), med litt '
         'hvit imellom.</p>') +
    tealp('DIAGRAM: RO (7 masker per bokstav x 9 omganger)') +
    f'<div class="chartrow">{chart_svg(BIG_R, cell=18, numbers=True)}{chart_svg(BIG_O, cell=18, numbers=True)}</div>' +
    tealp('DIAGRAM: FLAGGET (13 masker x 10 omganger)') +
    f'<div class="chartrow">{chart_svg(FLAG, cell=15, numbers=True)}</div>' +
    tealp('DIAGRAM: BØLGENE, BAK (11 masker x 8 omganger, én speilvendt)') +
    f'<div class="chartrow">{chart_svg(WAVE, cell=17, numbers=True)}{chart_svg(WAVE_M, cell=17, numbers=True)}</div>' +
    '<p class="small">Les alle diagrammene nedenfra og opp. Fordi du hekler rundt, leses hver omgang fra '
    'høyre mot venstre. Blå/rød/marineblå rute = hekle med den fargen. Hvit rute = hekle med hovedfargen.</p>'
, 9))

pages.append(ph_no(
    banner('DEL 3: BREMMEN') +
    steps([
        'Bytt til kongeblått, det er den eneste fargen bremmen hekles i. Hekle &eacute;n omgang uten '
        'økning i den nye fargen.',
        'Finn kolonnen "Øk på omg." i tabellen på neste side. På hver av disse omgangnumrene '
        '(talt fra starten av bremmen) fordeler du antall økninger fra kolonnen "Økn. hver gang" '
        'jevnt utover omgangen. På omgangene mellom økningene hekler du &eacute;n vanlig fm i hver maske.',
        'Fortsett til bremmen har heklet i antall omganger fra kolonnen "Bremomg." på side 3, hele '
        'veien i kongeblått. Sluttresultatet blir omtrent tallet i kolonnen "Ca. slutt".',
        'Helt ytterst avslutter du med den bølgete kanten, fortsatt i kongeblått: for en rolig bølge, '
        'avslutt med kjedemasker eller krepsemasker. For en tydeligere bølge: *3 fm i neste maske, 1 fm, '
        'hopp over 2 masker*, gjenta rundt.',
    ]) +
    cream('<p class="creamtitle">På de minste størrelsene (50&ndash;68) anbefales den rolige avslutningen, '
          'slik at bremmen ikke blir tung foran ansiktet.</p>')
, 10))

pages.append(ph_no(
    banner('TABELL: BREMMEN, ALLE STØRRELSER') +
    sizetable(['Str.', 'Bremomg.', 'Øk på omg.', 'Økn. hver gang', 'Ca. slutt (m)'],
              list(zip(SIZES, BREMOMG, OK_PA, OKN_HVER, CA_SLUTT)))
, 11))

pages.append(ph_no(
    banner('STELL OG SISTE SJEKK') +
    tealp('AVSLUTNING') +
    card('<p>Klipp av tråden med god margin og fest den godt på innsiden. Fest alle løse tråder, '
         'spesielt ved fargebyttene rundt motivene og i bremmen. Kontroller at flottene på innsiden '
         'ligger løst.</p>') +
    tealp('STELL') +
    card('<p>Vask etter garnets anbefaling, ofte 30&deg;C på skånsomt program i vaskepose, eller for hånd. '
         'Ikke bruk tørketrommel. Form hatten over en bolle eller et glass i riktig størrelse og la den '
         'tørke flatt eller på formen.</p>') +
    pink('SJEKKLISTE') +
    card(check([
        'Hodemålet er kontrollert, ikke bare alder',
        'Prøvelappen stemmer med 14 fm x 16 omganger på 10 cm',
        'Toppens diameter stemmer med tabellen på side 7',
        'RO og flagget er sentrert midt foran, bølgene midt bak',
        'Alle flotter på innsiden ligger løst',
        'Bremmen er heklet i angitt antall omganger og har den bølgete kanten',
    ])) +
    '<div class="congrats">Gratulerer, du har heklet din egen RO-bøttehatt!</div>' +
    byline('Renate Dahl') +
    '<p class="copyright">&copy; 2026 Little Montessori Explorers. Oppskriften er kun til personlig '
    'bruk. Oppskriften og diagrammene kan ikke kopieres, deles, videreselges eller publiseres. '
    'Ferdige produkter kan selges i liten skala med kreditering til Little Montessori Explorers.</p>' +
    '<p style="font-size:11pt;color:#c0392b;text-align:center;margin-top:2mm;">Hatten er et plagg for '
    'våken bruk under tilsyn. Skal ikke brukes under søvn eller i vogn uten oppsyn.</p>'
, 12))

pages_no = pages

ph_en = make_page('LME CROCHET PATTERN&nbsp;&nbsp;|&nbsp;&nbsp;RO BUCKET HAT KIDS', 'LME CROCHET')
pages = []

pages.append(ph_en('''
<div class="coverimg"><img src="''' + photo_src + '''" alt="White RO bucket hat with flag and RO in front, waves at back, blue brim"></div>
<div class="covertag">LME CROCHET PATTERN</div>
<div class="coverbanner">
  <div class="cflag">''' + mini_flag(34) + '''</div>
  <h1 class="covertitle">RO BUCKET HAT<br>FOR BABY AND CHILD</h1>
  <div class="cflag">''' + mini_flag(34) + '''</div>
</div>
<div class="subpill">WHITE WITH BLUE RO, FLAG AND WAVES &middot; SIZE 50&ndash;170</div>
''' + card('<p class="center">The same RO bucket hat as the pattern for adults: a white cotton hat with the Norwegian '
      'flag and "RO" in blue at the front, and two blue waves at the back, with a blue brim with increases that '
      'finishes in a wavy edge. Graded completely from scratch into twenty-one baby, child and teen sizes, 50 to 170. '
      'This pattern is complete on its own, you do not need any other LME pattern to crochet it.</p>') + '''
''' + byline('By Renate Dahl') + '''
''' + tip('Read the whole pattern once before you start. Always crochet a gauge swatch first, see page 4.') + '''
''', 1))

pages.append(ph_en(
    banner('BEFORE YOU START') +
    '<p>The bucket hat is crocheted in a spiral (not joined rounds) in single crochet, from the top down, in '
    'white main colour. You first crochet a rounded top that grows from a small ring, then the sides straight '
    'down with "RO" and the flag at the front and two waves at the back, crocheted right in with single '
    'crochet, and finally a blue brim with increases that finishes in a wavy edge.</p>' +
    tealp('WHAT YOU LEARN') +
    card(ul([
        'To crochet in a spiral from a magic ring',
        'To increase evenly to crochet a flat, rounded top',
        'To place and crochet two different motifs (RO+flag at front, waves at back) from charts',
        'To crochet a blue brim with increases and a wavy finish',
    ])) +
    pink('HOW HARD IS IT?') +
    card('<p>Beginner friendly, with a little practice at colour changes. You should be able to single '
         'crochet, know how to start a magic ring, and change colour. The motifs are crocheted with only two '
         'colours at a time, and every step is spelled out in this pattern.</p>') +
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
         'good choices, in white/natural, royal blue and a little red.</p>'
         '<table class="t"><tr><th>Colour</th><th>Use</th></tr>'
         f'<tr><td><span class="dot" style="background:{WHITE};border-color:#ccc;"></span> White/natural</td><td>main colour, top and sides</td></tr>'
         f'<tr><td><span class="dot" style="background:{BLUE}"></span> Royal blue</td><td>whole brim, RO, the waves</td></tr>'
         f'<tr><td><span class="dot" style="background:{RED}"></span> Red</td><td>the flag</td></tr>'
         f'<tr><td><span class="dot" style="background:{NAVY}"></span> Navy</td><td>the flag</td></tr></table>'
         '<p class="small">Have plenty of white main colour (almost the whole hat) and a little royal blue, '
         'red and navy for the brim and the motifs.</p>') +
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
    card('<p>Crochet a square at least 12 x 12 cm in single crochet with the white main colour. Wash and dry '
         'it the way you plan to treat the hat, then measure across the middle.</p>' +
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
         '<tr><td><b>MC</b></td><td>main colour (white)</td></tr>'
         '<tr><td><b>spiral</b></td><td>the rounds are worked as one continuous round, no slip stitch or '
         'chain-up, follow the stitch marker</td></tr>'
         '<tr><td><b>float</b></td><td>the thread that runs on the inside when the colour is not in use</td></tr></table>')
, 5))

pages.append(ph_en(
    banner('PART 1: THE TOP') +
    steps([
        'Crochet 6 sc into a magic ring in white main colour. Pull the ring closed. Place a stitch marker in '
        'the first stitch, move the marker up one stitch for every new round. From now on everything is '
        'worked in a spiral, no slip stitch.',
        'Round 2: inc (2 sc) in every stitch around = 12 stitches.',
        'Round 3: *inc, 1 sc*, repeat around = 18 stitches.',
        'Round 4: *inc, 1 sc, 1 sc*, repeat around = 24 stitches. Continue the same way: every new round '
        'increases 6 stitches evenly spaced, with one more plain sc between each increase than the round '
        'before.',
        'Find the number for your size in the "Standard round" column in the table on the next page. Keep '
        'increasing this way until you have crocheted exactly that round.',
        'If your size has a number other than 0 in the "Extra" column, crochet one more round: spread that '
        'many increases evenly around the round (for example every sixth or seventh stitch), plain sc the '
        'rest. That lands you exactly on the "Total" number.',
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
    banner('PART 2: THE SIDES WITH RO AND THE WAVES') +
    steps([
        'Once the top has the right stitch count, crochet straight down with no more increases. Keep the '
        'stitch count from the table on the previous page through this whole part, this is now the sides '
        'of the hat.',
        'Crochet the number of rounds given in the "Before motif" column in the table below, in white main '
        'colour.',
        'Crochet "RO" and the flag at the front, and the two waves at the back, at the same time, 7 rounds, '
        'see the charts on the next page. Important: because the hat is crocheted from the top down, you '
        'work the charts <b>bottom to top</b>, just like the knitting pattern.',
        'Continue plain in white main colour after the motifs, for the number of rounds in the "After '
        'motif" column.',
    ]) +
    pink('IMPORTANT: CROCHET THE MOTIF RIGHT IN') +
    card('<p>The motifs are crocheted right into the sides as you go, not embroidered on afterwards. Carry '
         'the colour you are not using on top of the round and crochet the white stitches around it, so it '
         'stays hidden inside. Where a motif should be, pick up the colour from the chart and crochet with '
         'that instead. Change colour on the last pull-through of the stitch before, so the change comes out '
         'clean. Keep the carried thread loose on the inside, or the hat will pull tight.</p>') +
    tealp('TABLE: THE SIDES') +
    sizetable(['Size', 'Before motif (rnds)', 'Motif (rnds)', 'After motif (rnds)', 'Finished circ. (cm)'],
              [[s, fm, 7, em, fo] for s, fm, em, fo in zip(SIZES, FOR_MOTIV, ETTER_MOTIV, FERDIG_OMKR)])
, 8))

pages.append(ph_en(
    banner('THE CHARTS, FRONT AND BACK') +
    '<p>The motifs are crocheted in royal blue, red and navy on a white background: each square in the '
    'chart is exactly one single crochet and one round.</p>' +
    tealp('HOW TO PLACE THE MOTIFS') +
    card('<p>Count the stitches around and find centre front (directly opposite the stitch marker, which '
         'sits at centre back). RO is 15 stitches wide, centre it around centre front. Crochet the flag '
         'about 2 rounds above RO, centred. Crochet the waves on the same round as RO, one on each side of '
         'centre back (the stitch marker), with a little white in between.</p>') +
    tealp('CHART: RO (7 stitches per letter x 9 rounds)') +
    f'<div class="chartrow">{chart_svg(BIG_R, cell=18, numbers=True)}{chart_svg(BIG_O, cell=18, numbers=True)}</div>' +
    tealp('CHART: THE FLAG (13 stitches x 10 rounds)') +
    f'<div class="chartrow">{chart_svg(FLAG, cell=15, numbers=True)}</div>' +
    tealp('CHART: THE WAVES, BACK (11 stitches x 8 rounds, one mirrored)') +
    f'<div class="chartrow">{chart_svg(WAVE, cell=17, numbers=True)}{chart_svg(WAVE_M, cell=17, numbers=True)}</div>' +
    '<p class="small">Read all charts from the bottom up. Because you are crocheting in the round, each '
    'round is read from right to left. Blue/red/navy square = crochet that colour. White square = crochet '
    'the main colour.</p>'
, 9))

pages.append(ph_en(
    banner('PART 3: THE BRIM') +
    steps([
        'Switch to royal blue, the only colour the brim is crocheted in. Crochet one round with no increase '
        'in the new colour.',
        'Find the "Increase on rnd" column in the table on the next page. On each of these round numbers '
        '(counted from the start of the brim), spread the number of increases from the "Increases each '
        'time" column evenly around the round. On the rounds in between, crochet one plain sc in every '
        'stitch.',
        'Continue until the brim has been crocheted for the number of rounds in the "Brim rounds" column on '
        'page 3, all the way in royal blue. The end result comes out at about the "Approx. total" number.',
        'Right at the outer edge, finish with the wavy edge, still in royal blue: for a calm wave, finish '
        'with slip stitches or crab stitch. For a more pronounced wave: *3 sc in the next stitch, 1 sc, skip '
        '2 stitches*, repeat around.',
    ]) +
    cream('<p class="creamtitle">For the smallest sizes (50&ndash;68) the calm finish is recommended, so the '
          'brim does not sit heavy in front of the face.</p>')
, 10))

pages.append(ph_en(
    banner('TABLE: THE BRIM, ALL SIZES') +
    sizetable(['Size', 'Brim rnds', 'Increase on rnd', 'Increases each time', 'Approx. total (st)'],
              list(zip(SIZES, BREMOMG, OK_PA, OKN_HVER, CA_SLUTT)))
, 11))

pages.append(ph_en(
    banner('CARE AND FINAL CHECK') +
    tealp('FINISHING') +
    card('<p>Cut the yarn leaving a generous tail and fasten it off securely on the inside. Weave in all '
         'loose ends, especially at the colour changes around the motifs and in the brim. Check that the '
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
        'RO and the flag are centred at centre front, the waves at centre back',
        'All floats on the inside lie loose',
        'The brim has been crocheted for the stated number of rounds and has the wavy edge',
    ])) +
    '<div class="congrats">Congratulations, you have crocheted your very own RO bucket hat!</div>' +
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
<title>RO-bøttehatt barn, LME hekleoppskrift</title>
<style>{css}</style></head>
<body>{''.join(pages_no)}</body></html>'''
doc_en = f'''<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8">
<title>RO bucket hat kids, LME crochet pattern</title>
<style>{css}</style></head>
<body>{''.join(pages_en)}</body></html>'''

(OUT_DIR / 'barn_hekle_ro_no.html').write_text(doc_no, encoding='utf-8')
(OUT_DIR / 'barn_hekle_ro_en.html').write_text(doc_en, encoding='utf-8')
print('OK', len(doc_no), 'tegn (no),', len(doc_en), 'tegn (en)')
