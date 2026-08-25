# -*- coding: utf-8 -*-
"""RETTELSE: RO-bøttehatt barn skal være samme design som RO-bøttehatt for VOKSNE
(hvit hoveddel, blå bølgende brem, RO+flagg foran, bølger bak), ikke en rød
bokstav-hatt som NORGE/NORWAY. Denne overskriver kun RO-varianten fra
_build_barn_strikk_split.py, NORGE og NORWAY er allerede riktige og rørt ikke."""
import base64, html, pathlib

BASE = pathlib.Path(__file__).parent
OUT_DIR = BASE / 'bottehatter-barn-strikk-ro'
PHOTO = OUT_DIR / 'ro_adult_ref.jpg'
LOGO = OUT_DIR / 'lme-logo.png'

TEAL, RED, NAVY, WHITE, CREAM, INK, PINK, CERISE = (
    '#4aa7a4', '#C8102E', '#00205B', '#FFFFFF', '#F8F4EA', '#3f3f3f', '#df5f93', '#E91E89')
BLUE = '#1f5fbf'  # kongeblå til RO-hatten, som hos voksen

# ---------- diagramdata, hentet direkte fra voksenoppskriften (ro-bottehatt/build_ro.py) ----------
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
LEGG_OPP = [116, 122, 130, 136, 144, 150, 156, 162, 166, 170,
            172, 174, 176, 178, 178, 180, 182, 184, 186, 188, 190]
BREMOMG = [6, 7, 8, 9, 10, 11, 12, 13, 13, 13,
           13, 13, 14, 14, 14, 15, 15, 15, 15, 16, 16]
HOVEDDEL = [58, 61, 65, 68, 72, 75, 78, 81, 83, 85,
            86, 87, 88, 89, 89, 90, 91, 92, 93, 94, 95]
TIL_TOPP = ["5.5 cm", "6 cm", "6.5 cm", "7 cm", "7.5 cm", "8 cm", "8.5 cm", "9 cm", "9 cm", "9 cm",
            "9.5 cm", "9.5 cm", "10 cm", "10 cm", "10.5 cm", "10.5 cm", "10.5 cm", "11 cm", "11 cm", "11 cm", "11 cm"]
OPPSETT_FELL = ["Fell 2 m", "Fell 5 m", "Fell 2 m", "Fell 5 m", "Fell 2 m", "Fell 5 m", "Fell 1 m", "Fell 4 m", "Fell 6 m", "Fell 1 m",
                "Fell 2 m", "Fell 3 m", "Fell 4 m", "Fell 5 m", "Fell 5 m", "Fell 6 m", "Ingen felling", "Fell 1 m", "Fell 2 m", "Fell 3 m", "Fell 4 m"]
ETTER_OPPSETT = [56, 56, 63, 63, 70, 70, 77, 77, 77, 84,
                 84, 84, 84, 84, 84, 84, 91, 91, 91, 91, 91]
EN_AGE = ["0-1 mo", "1-2 mo", "2-4 mo", "4-6 mo", "6-9 mo", "9-12 mo", "12-18 mo", "18-24 mo", "2-3 yr", "3-4 yr",
          "4-5 yr", "5-6 yr", "6-7 yr", "7-8 yr", "8-9 yr", "9-10 yr", "10-11 yr", "11-12 yr", "12-13 yr", "13-14 yr", "14-16 yr"]
EN_OPPSETT_FELL = ["Dec 2 st", "Dec 5 st", "Dec 2 st", "Dec 5 st", "Dec 2 st", "Dec 5 st", "Dec 1 st", "Dec 4 st", "Dec 6 st", "Dec 1 st",
                    "Dec 2 st", "Dec 3 st", "Dec 4 st", "Dec 5 st", "Dec 5 st", "Dec 6 st", "No decrease", "Dec 1 st", "Dec 2 st", "Dec 3 st", "Dec 4 st"]

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
ol.steps li div {{ font-size:13.5pt; line-height:1.2; }}
.snum {{ flex:0 0 auto; width:7.5mm; height:7.5mm; border-radius:50%; background:{PINK}; color:#fff; font-family:var(--font-head); font-weight:700; font-size:13pt; display:flex; align-items:center; justify-content:center; margin-top:.5mm; }}
table.t {{ width:100%; border-collapse:collapse; margin:1mm 0; }}
table.t th {{ font-family:var(--font-head); font-weight:700; font-size:12pt; color:{PINK}; text-align:left; padding:.8mm 2mm; border-bottom:2px solid #f2bfd4; }}
table.t td {{ font-size:12.5pt; padding:.7mm 2mm; border-bottom:1px solid #f6dbe7; line-height:1.16; }}
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

ph_no = make_page('LME STRIKKEOPPSKRIFT&nbsp;&nbsp;|&nbsp;&nbsp;RO-BØTTEHATT BARN', 'LME STRIKK')
pages = []

pages.append(ph_no('''
<div class="coverimg"><img src="''' + photo_src + '''" alt="Hvit RO-bøttehatt med flagg og RO foran, bølger bak, blå brem"></div>
<div class="covertag">LME STRIKKEOPPSKRIFT</div>
<div class="coverbanner">
  <div class="cflag">''' + mini_flag(34) + '''</div>
  <h1 class="covertitle">RO-BØTTEHATT<br>TIL BABY OG BARN</h1>
  <div class="cflag">''' + mini_flag(34) + '''</div>
</div>
<div class="subpill">HVIT MED BLÅ RO, FLAGG OG BØLGER &middot; STØRRELSE 50&ndash;170</div>
''' + card('<p class="center">Samme RO-bøttehatt som oppskriften for voksne: hvit bomullshatt med det norske flagget og '
      '"RO" i blått foran, og to blå bølgeskvulp bak, med en solid blå brem som bølger i kanten. Gradert helt fra bunnen '
      'av til tjueen babyer-, barne- og ungdomsstørrelser, 50 til 170. Denne oppskriften er komplett i seg selv, du '
      'trenger ikke eie noen annen LME-oppskrift for å strikke den.</p>') + '''
''' + byline('Av Renate Dahl') + '''
''' + tip('Les hele oppskriften én gang før du legger opp. Strikk alltid en prøvelapp først, se side 4.') + '''
''', 1))

pages.append(ph_no(
    banner('FØR DU BEGYNNER') +
    '<p>Bøttehatten strikkes rundt på rundpinne eller strømpepinner, nedenfra og opp, i hvit hovedfarge. Du strikker '
    'først en blå brem som bølger nedover, deretter hoveddelen med "RO" og flagget foran og to bølger bak, strikket '
    'inn med flerfargestrikk, og til slutt felles toppen ned til en liten rundet topp.</p>' +
    tealp('DETTE LÆRER DU') +
    card(ul([
        'Å strikke en lue/hatt rundt på rundpinne eller strømpepinner',
        'Å strikke en blå brem som bølger, med en sammenstrikkingsomgang',
        'Å plassere og strikke to ulike motiver (RO+flagg foran, bølger bak) fra rutediagram',
        'Å felle en rundet topp jevnt ned til få masker',
    ])) +
    pink('HVOR VANSKELIG ER DET?') +
    card('<p>Nybegynnervennlig, med litt øvelse på flerfargestrikk. Du bør kunne legge opp, strikke glattstrikk rundt '
         'og bytte farge. Motivene strikkes med to farger av gangen, og alt er forklart trinn for trinn.</p>') +
    cream('<p class="creamtitle">Bruk strømpepinner eller magic loop på de minste størrelsene (50&ndash;86). '
          'En vanlig rundpinne er ofte for lang til at maskene når rundt.</p>')
, 2))

pages.append(ph_no(
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

pages.append(ph_no(
    banner('DETTE TRENGER DU') +
    tealp('GARN') +
    card('<p>Et glatt bomullsgarn (aran/tykkelse 4) som gir 17 masker x 22 omganger glattstrikk = 10 x 10 cm '
         'på pinne 5 mm. Reynolds Saucy, Rico Design Creative Cotton Aran og Hobbii Amigo er alle gode valg, '
         'i hvitt/natur, kongeblått og litt rødt.</p>'
         '<table class="t"><tr><th>Farge</th><th>Bruk</th></tr>'
         f'<tr><td><span class="dot" style="background:{WHITE};border-color:#ccc;"></span> Hvit/natur</td><td>hovedfarge, hele hoveddelen</td></tr>'
         f'<tr><td><span class="dot" style="background:{BLUE}"></span> Kongeblå</td><td>hele bremmen, RO, bølgene</td></tr>'
         f'<tr><td><span class="dot" style="background:{RED}"></span> Rød</td><td>flagget</td></tr>'
         f'<tr><td><span class="dot" style="background:{NAVY}"></span> Marineblå</td><td>flagget</td></tr></table>'
         '<p class="small">Ha rikelig av hvit hovedfarge (nesten hele hatten) og litt kongeblått, rødt og '
         'marineblått til bremmen og motivene.</p>') +
    pink('PINNER OG UTSTYR') +
    card(ul([
        'Rundpinne 5 mm, 40 cm, eller strømpepinner/magic loop-sett 5 mm',
        'Stoppenål, saks og målebånd',
        'Maskemarkør (valgfritt, for å holde styr på midt foran og midt bak)',
    ])) +
    cream('<p class="creamtitle">Strikker du fast, prøv pinne 5,5 mm. Strikker du løst, prøv 4,5 mm. Målet er '
          'alltid 17 masker på 10 cm.</p>')
, 4))

pages.append(ph_no(
    banner('STRIKKEFASTHET, DEN VIKTIGE NØKKELEN') +
    tealp('STRIKK EN PRØVELAPP FØRST') +
    card('<p>Legg opp 30 masker med hvit hovedfarge. Strikk glattstrikk rundt (eller frem og tilbake med en '
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
         '<tr><td><b>HF</b></td><td>hovedfarge (hvit)</td></tr>'
         '<tr><td><b>flott</b></td><td>tråden som løper på innsiden når fargen ikke brukes</td></tr>'
         '<tr><td><b>jevnt fordelt</b></td><td>spredt likt utover hele omgangen, ikke samlet ett sted</td></tr></table>')
, 5))

pages.append(ph_no(
    banner('DEL 1: LEGG OPP OG STRIKK BREMMEN') +
    steps([
        'Finn tallet for din størrelse i kolonnen "Legg opp" i tabellen på neste side. Legg opp '
        'akkurat så mange masker med kongeblå.',
        'Kontroller at oppleggskanten ikke er vridd rundt pinnen. Sett sammen til en ring og plasser en '
        'maskemarkør ved omgangens begynnelse (midt bak), det er her hver omgang starter og slutter.',
        'Strikk hele bremmen i kongeblått, glattstrikk rundt (bare rette masker), i antall omganger fra '
        'kolonnen "Bremomg." i tabellen på neste side. Ingen fargeskift i bremmen.',
        'På aller siste bremomgang strikker du 2 rette masker sammen, hele veien rundt (maske 1 og 2 '
        'sammen, maske 3 og 4 sammen, og så videre). Det halverer maskeantallet nøyaktig, fra tallet du la '
        'opp til tallet i kolonnen "Hoveddel" på neste side. Det er denne omgangen som lager '
        'den bølgete kanten.',
        'Bytt til hvit hovedfarge. Nå strikker du resten av hatten hvit, med unntak av motivene.',
    ]) +
    pink('DEN BØLGETE KANTEN') +
    card('<p>Sammenstrikkingsomgangen er det som gir bremmen den karakteristiske bølgekanten når hatten '
         'ikke er strukket ut, det er riktig at kanten krøller seg litt inntil hatten er tatt i bruk.</p>')
, 6))

pages.append(ph_no(
    banner('TABELL: BREMMEN, ALLE STØRRELSER') +
    sizetable(['Str.', 'Legg opp', 'Bremomg.', 'Bremfarge'],
              list(zip(SIZES, LEGG_OPP, BREMOMG, ['Kongeblå, ensfarget'] * len(SIZES)))) +
    cream('<p class="creamtitle">Bruk strømpepinner eller magic loop under hele bremmen på de minste '
          'størrelsene, den er for smal for en vanlig rundpinne.</p>')
, 7))

pages.append(ph_no(
    banner('DEL 2: HOVEDDELEN') +
    steps([
        'Etter sammenstrikkingsomgangen strikker du glattstrikk rundt i hvit hovedfarge. Dette er nå hoveddelen '
        'av hatten, den delen som synes best.',
        'Strikk rett fram uten mønster til arbeidet måler ca. halvparten av målet i kolonnen "Til '
        'topp" i tabellen på neste side, det er her motivene skal begynne.',
        'Strikk inn "RO" og flagget midt foran, og de to bølgene midt bak, se Del 3 på neste oppslag. Begge '
        'motivene starter på samme omgang.',
        'Fortsett rett i hvit hovedfarge etter motivene til hele hoveddelen måler målet i "Til '
        'topp", målt fra sammenstrikkingsomgangen.',
    ], start=1) +
    tealp('TABELL: HOVEDDEL') +
    sizetable(['Str.', 'Masker (hoveddel)', 'Høyde til topp'], list(zip(SIZES, HOVEDDEL, TIL_TOPP))) +
    cream('<p class="creamtitle">Motivene skal sitte midt i hoveddelen i høyden, ikke helt nederst mot '
          'bremmen og ikke helt oppe ved toppen.</p>')
, 8))

pages.append(ph_no(
    banner('DEL 3: MOTIVENE, FORAN OG BAK') +
    '<p>Motivene er strikket med kongeblått, rødt og marineblått på hvit bunn, med teknikken flerfargestrikk '
    '(fair isle): du strikker med to farger i samme omgang og lar den ubrukte fargen "flyte" løst '
    'på innsiden.</p>' +
    tealp('SLIK PLASSERER DU MOTIVENE') +
    card('<p>Tell maskene rundt og finn midt foran (motsatt av maskemarkøren, som er midt bak). RO er 15 masker '
         'bredt, sentrer det rundt midt foran. Flagget strikkes ca. 2 omganger over RO, midt på. Bølgene strikkes '
         'på samme omgang som RO, én på hver side av midt bak (maskemarkøren), med litt hvit imellom.</p>') +
    tealp('DIAGRAM: RO (7 masker per bokstav x 9 omganger)') +
    f'<div class="chartrow">{chart_svg(BIG_R, cell=18, numbers=True)}{chart_svg(BIG_O, cell=18, numbers=True)}</div>' +
    tealp('DIAGRAM: FLAGGET (13 masker x 10 omganger)') +
    f'<div class="chartrow">{chart_svg(FLAG, cell=15, numbers=True)}</div>' +
    tealp('DIAGRAM: BØLGENE, BAK (11 masker x 8 omganger, én speilvendt)') +
    f'<div class="chartrow">{chart_svg(WAVE, cell=17, numbers=True)}{chart_svg(WAVE_M, cell=17, numbers=True)}</div>' +
    '<p class="small">Les alle diagrammene nedenfra og opp. Fordi du strikker rundt, leses hver omgang fra '
    'høyre mot venstre. Blå/rød/marineblå rute = strikk med den fargen. Hvit rute = strikk med hovedfargen.</p>'
, 9))

pages.append(ph_no(
    banner('DEL 4: TOPPEN') +
    steps([
        'Når hoveddelen måler målet i tabellen på side 8, strikker du én oppsettomgang: fell antall masker '
        'oppgitt i kolonnen "Fell" i tabellen på neste side, jevnt fordelt rundt hele '
        'omgangen. Står det "Ingen felling", hopper du over denne omgangen og går rett til '
        'neste steg.',
        'Del de gjenværende maskene i 7 like store felt. Sett en maskemarkør mellom hvert felt (7 markører '
        'totalt, i tillegg til den ved omgangens start).',
        'Strikk til 2 masker gjenstår før hver markør, strikk disse 2 sammen. Gjenta ved alle 7 markørene, '
        'det gir 7 minkinger per omgang.',
        'Str. 50&ndash;68: strikk 1 vanlig omgang uten minking etter de 3 første minkeomgangene, fortsett '
        'deretter å minke på hver omgang. Str. 74&ndash;170: strikk 1 vanlig omgang etter de 4 første '
        'minkeomgangene, fortsett deretter å minke på hver omgang.',
        'Fortsett til 7 masker (én per felt) gjenstår. Klipp av tråden med god margin, tre den gjennom de '
        'gjenværende maskene med en stoppenål, dra sammen og fest godt på innsiden.',
    ])
, 10))

pages.append(ph_no(
    banner('TABELL: OPPSETT FØR TOPP, ALLE STØRRELSER') +
    sizetable(['Str.', 'Masker før topp', 'Fell', 'Masker etter'],
              list(zip(SIZES, HOVEDDEL, OPPSETT_FELL, ETTER_OPPSETT)))
, 11))

pages.append(ph_no(
    banner('STELL OG SISTE SJEKK') +
    tealp('AVSLUTNING') +
    card('<p>Fest alle løse tråder godt på innsiden, spesielt ved fargebyttene rundt motivene og i bremmen. '
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
        'RO og flagget er sentrert midt foran, bølgene midt bak',
        'Alle flotter på innsiden ligger løst',
        'Toppen er dratt sammen og godt festet',
    ])) +
    '<div class="congrats">Gratulerer, du har strikket din egen RO-bøttehatt!</div>' +
    byline('Renate Dahl') +
    '<p class="copyright">&copy; 2026 Little Montessori Explorers. Oppskriften er kun til personlig '
    'bruk. Oppskriften og diagrammene kan ikke kopieres, deles, videreselges eller publiseres. '
    'Ferdige produkter kan selges i liten skala med kreditering til Little Montessori Explorers.</p>' +
    '<p style="font-size:11pt;color:#c0392b;text-align:center;margin-top:2mm;">Hatten er et plagg for '
    'våken bruk under tilsyn. Skal ikke brukes under søvn eller i vogn uten oppsyn.</p>'
, 12))

pages_no = pages

ph_en = make_page('LME KNITTING PATTERN&nbsp;&nbsp;|&nbsp;&nbsp;RO BUCKET HAT KIDS', 'LME KNIT')
pages = []

pages.append(ph_en('''
<div class="coverimg"><img src="''' + photo_src + '''" alt="White RO bucket hat with flag and RO in front, waves at back, blue brim"></div>
<div class="covertag">LME KNITTING PATTERN</div>
<div class="coverbanner">
  <div class="cflag">''' + mini_flag(34) + '''</div>
  <h1 class="covertitle">RO BUCKET HAT<br>FOR BABY AND CHILD</h1>
  <div class="cflag">''' + mini_flag(34) + '''</div>
</div>
<div class="subpill">WHITE WITH BLUE RO, FLAG AND WAVES &middot; SIZE 50&ndash;170</div>
''' + card('<p class="center">The same RO bucket hat as the pattern for adults: a white cotton hat with the Norwegian '
      'flag and "RO" in blue at the front, and two blue waves at the back, with a solid blue brim that '
      'flares at the edge. Graded completely from scratch into twenty-one baby, child and teen sizes, 50 to 170. This '
      'pattern is complete on its own, you do not need any other LME pattern to knit it.</p>') + '''
''' + byline('By Renate Dahl') + '''
''' + tip('Read the whole pattern once before you cast on. Always knit a gauge swatch first, see page 4.') + '''
''', 1))

pages.append(ph_en(
    banner('BEFORE YOU START') +
    '<p>The bucket hat is knitted in the round on a circular needle or double-pointed needles, from the '
    'bottom up, in white main colour. You start with a blue brim that flares, then the main body with "RO" '
    'and the flag at the front and two waves at the back, knitted in with stranded colourwork, and finally decrease '
    'the crown down to a small rounded top.</p>' +
    tealp('WHAT YOU LEARN') +
    card(ul([
        'To knit a hat in the round on a circular needle or double-pointed needles',
        'To knit a blue, flared brim with a decrease round',
        'To place and knit two different motifs (RO+flag at front, waves at back) from charts',
        'To decrease a rounded crown evenly down to a few stitches',
    ])) +
    pink('HOW HARD IS IT?') +
    card('<p>Beginner friendly, with a little practice at stranded colourwork. You should be able to cast on, '
         'knit stockinette in the round and change colour. The motifs are knitted with two colours at a time, '
         'and every step is spelled out in this pattern.</p>') +
    cream('<p class="creamtitle">Use double-pointed needles or magic loop for the smallest sizes '
          '(50&ndash;86). An ordinary circular needle is often too long for the stitches to reach round.</p>')
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
    cream('<p class="creamtitle">Children grow at different rates. The actual head measurement always beats '
          'age, measure again whenever you are unsure.</p>')
, 3))

pages.append(ph_en(
    banner('WHAT YOU NEED') +
    tealp('YARN') +
    card('<p>A smooth cotton yarn (aran weight) that gives 17 stitches x 22 rounds in stockinette = 10 x 10 '
         'cm on 5 mm needles. Reynolds Saucy, Rico Design Creative Cotton Aran and Hobbii Amigo are all good '
         'choices, in white/natural, royal blue and a little red.</p>'
         '<table class="t"><tr><th>Colour</th><th>Use</th></tr>'
         f'<tr><td><span class="dot" style="background:{WHITE};border-color:#ccc;"></span> White/natural</td><td>main colour, whole main body</td></tr>'
         f'<tr><td><span class="dot" style="background:{BLUE}"></span> Royal blue</td><td>whole brim, RO, the waves</td></tr>'
         f'<tr><td><span class="dot" style="background:{RED}"></span> Red</td><td>the flag</td></tr>'
         f'<tr><td><span class="dot" style="background:{NAVY}"></span> Navy</td><td>the flag</td></tr></table>'
         '<p class="small">Have plenty of white main colour (almost the whole hat) and a little royal blue, '
         'red and navy for the brim and the motifs.</p>') +
    pink('NEEDLES AND KIT') +
    card(ul([
        '5 mm circular needle, 40 cm, or 5 mm double-pointed needles/magic loop set',
        'Tapestry needle, scissors and tape measure',
        'Stitch marker (optional, to track centre front and centre back)',
    ])) +
    cream('<p class="creamtitle">If you knit tightly, try 5.5 mm needles. If you knit loosely, try 4.5 mm. '
          'The target is always 17 stitches over 10 cm.</p>')
, 4))

pages.append(ph_en(
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
         '<tr><td><b>MC</b></td><td>main colour (white)</td></tr>'
         '<tr><td><b>float</b></td><td>the thread that runs on the inside when the colour is not in use</td></tr>'
         '<tr><td><b>evenly spaced</b></td><td>spread equally around the round, not bunched in one spot</td></tr></table>')
, 5))

pages.append(ph_en(
    banner('PART 1: CAST ON AND KNIT THE BRIM') +
    steps([
        'Find the number for your size in the "Cast on" column in the table on the next page. '
        'Cast on exactly that many stitches in royal blue.',
        'Check that the cast-on edge is not twisted around the needle. Join in the round and place a stitch '
        'marker at the start of the round (centre back), this is where every round begins and ends.',
        'Knit the whole brim in royal blue, in stockinette in the round (knit every stitch), for the number '
        'of rounds in the "Brim rounds" column on the next page. No colour changes in the brim.',
        'On the very last brim round, knit 2 stitches together all the way round (stitch 1 and 2 together, '
        'stitch 3 and 4 together, and so on). This halves the stitch count exactly, from your cast-on '
        'number down to the "Main body" number on the next page. This round is what creates '
        'the flared edge.',
        'Switch to white main colour. From here you knit the rest of the hat in white, except for the '
        'motifs.',
    ]) +
    pink('THE FLARED EDGE') +
    card('<p>The decrease round is what gives the brim its characteristic flared, wavy edge, it is normal '
         'for the edge to curl in a little until the hat has been worn a few times.</p>')
, 6))

pages.append(ph_en(
    banner('TABLE: THE BRIM, ALL SIZES') +
    sizetable(['Size', 'Cast on', 'Brim rounds', 'Brim colour'],
              list(zip(SIZES, LEGG_OPP, BREMOMG, ['Royal blue, solid'] * len(SIZES)))) +
    cream('<p class="creamtitle">Use double-pointed needles or magic loop for the whole brim on the smallest '
          'sizes, it is too narrow for an ordinary circular needle.</p>')
, 7))

pages.append(ph_en(
    banner('PART 2: THE MAIN BODY') +
    steps([
        'After the decrease round, knit stockinette in the round in white main colour. This is now the main '
        'body of the hat, the part that shows the most.',
        'Knit plain, no pattern, until the work measures about half of the "Height to top" value '
        'in the table on the next page, this is where the motifs should begin.',
        'Knit "RO" and the flag at centre front, and the two waves at centre back, see Part 3 on '
        'the next spread. Both motifs start on the same round.',
        'Continue plain in white main colour after the motifs until the whole main body measures the '
        '"Height to top" value, measured from the decrease round.',
    ], start=1) +
    tealp('TABLE: MAIN BODY') +
    sizetable(['Size', 'Stitches (main body)', 'Height to top'], list(zip(SIZES, HOVEDDEL, TIL_TOPP))) +
    cream('<p class="creamtitle">The motifs should sit in the middle of the main body height, not right down '
          'against the brim and not right up at the top.</p>')
, 8))

pages.append(ph_en(
    banner('PART 3: THE MOTIFS, FRONT AND BACK') +
    '<p>The motifs are knitted in royal blue, red and navy on a white background, using stranded colourwork '
    '(fair isle): you knit with two colours in the same round and let the unused colour float loosely on the '
    'inside.</p>' +
    tealp('HOW TO PLACE THE MOTIFS') +
    card('<p>Count the stitches around and find centre front (opposite the stitch marker, which sits at '
         'centre back). RO is 15 stitches wide, centre it around centre front. Knit the flag about 2 rounds '
         'above RO, centred. Knit the waves on the same round as RO, one on each side of centre back (the '
         'stitch marker), with a little white in between.</p>') +
    tealp('CHART: RO (7 stitches per letter x 9 rounds)') +
    f'<div class="chartrow">{chart_svg(BIG_R, cell=18, numbers=True)}{chart_svg(BIG_O, cell=18, numbers=True)}</div>' +
    tealp('CHART: THE FLAG (13 stitches x 10 rounds)') +
    f'<div class="chartrow">{chart_svg(FLAG, cell=15, numbers=True)}</div>' +
    tealp('CHART: THE WAVES, BACK (11 stitches x 8 rounds, one mirrored)') +
    f'<div class="chartrow">{chart_svg(WAVE, cell=17, numbers=True)}{chart_svg(WAVE_M, cell=17, numbers=True)}</div>' +
    '<p class="small">Read all charts from the bottom up. Because you are knitting in the round, each round '
    'is read from right to left. Blue/red/navy square = knit that colour. White square = knit main colour.</p>'
, 9))

pages.append(ph_en(
    banner('PART 4: THE CROWN') +
    steps([
        'When the main body measures the value in the table on page 8, knit one setup round: decrease the '
        'number of stitches given in the "Decrease" column in the table on the next page, '
        'evenly spaced around the whole round. If it says "No decrease", skip this round and go '
        'straight to the next step.',
        'Divide the remaining stitches into 7 equal sections. Place a stitch marker between each section (7 '
        'markers in total, plus the one at the start of the round).',
        'Knit to 2 stitches before each marker, knit these 2 together. Repeat at all 7 markers, giving 7 '
        'decreases per round.',
        'Sizes 50&ndash;68: knit 1 plain round with no decreases after the first 3 decrease rounds, then '
        'decrease on every round after that. Sizes 74&ndash;170: knit 1 plain round after the first 4 '
        'decrease rounds, then decrease every round after that.',
        'Continue until 7 stitches (one per section) remain. Cut the yarn leaving a generous tail, thread it '
        'through the remaining stitches with a tapestry needle, pull tight and fasten off securely on the '
        'inside.',
    ])
, 10))

pages.append(ph_en(
    banner('TABLE: SETUP BEFORE THE CROWN, ALL SIZES') +
    sizetable(['Size', 'Stitches before top', 'Decrease', 'Stitches after'],
              list(zip(SIZES, HOVEDDEL, EN_OPPSETT_FELL, ETTER_OPPSETT)))
, 11))

pages.append(ph_en(
    banner('CARE AND FINAL CHECK') +
    tealp('FINISHING') +
    card('<p>Weave in all loose ends securely on the inside, especially at the colour changes around the '
         'motifs and in the brim. Check that the floats on the inside lie loose, not tight, or the hat will '
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
        'RO and the flag are centred at centre front, the waves at centre back',
        'All floats on the inside lie loose',
        'The top is pulled tight and well fastened off',
    ])) +
    '<div class="congrats">Congratulations, you have knitted your very own RO bucket hat!</div>' +
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
<title>RO-bøttehatt barn, LME strikkeoppskrift</title>
<style>{css}</style></head>
<body>{''.join(pages_no)}</body></html>'''
doc_en = f'''<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8">
<title>RO bucket hat kids, LME knitting pattern</title>
<style>{css}</style></head>
<body>{''.join(pages_en)}</body></html>'''

(OUT_DIR / 'barn_strikk_ro_no.html').write_text(doc_no, encoding='utf-8')
(OUT_DIR / 'barn_strikk_ro_en.html').write_text(doc_en, encoding='utf-8')
print('OK', len(doc_no), 'tegn (no),', len(doc_en), 'tegn (en)')
