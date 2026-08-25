# -*- coding: utf-8 -*-
"""Genererer graderte LME hekleoppskrifter for skaut (trekantskaut), barn/baby,
nyfødt til 170, i to design-varianter: NORGE (rødt flagg-skaut) og RO (hvitt med
RO+flagg+bølger i blått). Samme trekant-teknikk som voksenoppskriften
(norge-skaut/build_skaut_hekle.py): legg opp i spissen, øk hver rad, hekle kant
til slutt. Kjør: python3 _build_barn_skaut_split.py"""
import base64, pathlib

BASE = pathlib.Path(__file__).parent

TEAL, RED, NAVY, WHITE, CREAM, INK, PINK, CERISE = (
    '#4aa7a4', '#C8102E', '#00205B', '#FFFFFF', '#F8F4EA', '#3f3f3f', '#df5f93', '#E91E89')
BLUE = '#1f5fbf'

BIG_R = ["######.", "#.....#", "#.....#", "#.....#", "######.", "#..#...", "#...#..", "#....#.", "#.....#"]
BIG_O = ["..###..", ".#...#.", "#.....#", "#.....#", "#.....#", "#.....#", "#.....#", ".#...#.", "..###.."]
FLAG = [
    "RRRWBBWRRRRRR", "RRRWBBWRRRRRR", "RRRWBBWRRRRRR",
    "WWWWBBWWWWWWW", "BBBBBBBBBBBBB", "BBBBBBBBBBBBB", "WWWWBBWWWWWWW",
    "RRRWBBWRRRRRR", "RRRWBBWRRRRRR", "RRRWBBWRRRRRR",
]
WAVE = [
    "...##...#.#", "..#####....", ".######.##.", ".######..#.",
    "########...", "#########..", "##########.", "###########",
]
WAVE_M = [r[::-1] for r in WAVE]
CMAP_RO = {'.': CREAM, '#': BLUE, 'R': RED, 'W': '#ffffff', 'B': NAVY}
CMAP_NORGE = {'.': RED, '#': WHITE, 'R': RED, 'W': '#ffffff', 'B': NAVY}


def chart_svg(rows, cmap, cell=18, numbers=False):
    w, h = len(rows[0]), len(rows)
    pad_r = 26 if numbers else 4
    W, H = w * cell + 8 + pad_r, h * cell + 12
    p = [f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" '
         f'style="width:{W*0.28}mm;height:{H*0.28}mm">']
    for y, row in enumerate(rows):
        for x, ch in enumerate(row):
            p.append(f'<rect x="{4+x*cell}" y="{4+y*cell}" width="{cell}" height="{cell}" '
                     f'fill="{cmap[ch]}" stroke="rgba(0,0,0,0.28)" stroke-width="1"/>')
    p.append(f'<rect x="4" y="4" width="{w*cell}" height="{h*cell}" fill="none" '
             f'stroke="#3f3f3f" stroke-width="2.5" rx="1"/>')
    if numbers:
        for y in range(h):
            n = h - y
            yy = 4 + y * cell + cell / 2 + 4
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


def make_page(ph2, right_label, logo_src):
    def _page(body, num):
        return ('<div class="page">'
                '<div class="band"><span>LITTLE MONTESSORI EXPLORERS</span></div>'
                f'<div class="rside"><span>{right_label}</span></div>'
                '<div class="phead"><div class="ph1">LITTLE MONTESSORI EXPLORERS</div>'
                f'<div class="ph2">{ph2}</div></div>'
                f'<div class="content">{body}</div>'
                f'<div class="pfoot">&mdash;&nbsp;{num}&nbsp;&mdash;</div></div>')
    return _page


def banner(t): return f'<div class="banner"><h1>{t}</h1></div>'
def pink(t): return f'<div class="pillwrap"><div class="pill pinkpill">{t}</div></div>'
def tealp(t): return f'<div class="pillwrap"><div class="pill tealpill">{t}</div></div>'
def card(inner): return f'<div class="card">{inner}</div>'
def cream(inner): return f'<div class="cream">{inner}</div>'
def ul(items): return '<ul class="dots">' + ''.join(f'<li>{i}</li>' for i in items) + '</ul>'
def check(items): return '<ul class="checks">' + ''.join(f'<li>{i}</li>' for i in items) + '</ul>'
def steps(items, start=1):
    return '<ol class="steps">' + ''.join(
        f'<li><span class="snum">{start+i}</span><div>{t}</div></li>' for i, t in enumerate(items)) + '</ol>'
def tip(text): return f'<div class="notecard"><span class="noteemo">&#129525;</span><p><i>TIPS: {text}</i></p></div>'
def sizetable(header, rows):
    head = ''.join(f'<th>{h}</th>' for h in header)
    body = ''.join('<tr>' + ''.join(f'<td>{c}</td>' for c in r) + '</tr>' for r in rows)
    return f'<table class="t sz"><tr>{head}</tr>{body}</table>'
def p(no, en, L): return '<p>' + L(no, en) + '</p>'
def pc(no, en, L): return '<p class="center">' + L(no, en) + '</p>'
def ctitle(no, en, L): return cream('<p class="creamtitle">' + L(no, en) + '</p>')
def byline(logo_src, name_line, company='Little Montessori Explorers', site='lmexplorers.com'):
    return ('<div class="byline">'
            f'<img class="logo" src="{logo_src}" alt="Little Montessori Explorers">'
            f'<div class="by1">{name_line}</div>'
            f'<div class="by2">{company}</div>'
            f'<div class="by3">{site}</div></div>')


SIZES = ["50", "56", "62", "68", "74", "80", "86", "92", "98", "104",
         "110", "116", "122", "128", "134", "140", "146", "152", "158", "164", "170"]
AGE = ["0-1 mnd", "1-2 mnd", "2-4 mnd", "4-6 mnd", "6-9 mnd", "9-12 mnd", "12-18 mnd", "18-24 mnd", "2-3 år", "3-4 år",
       "4-5 år", "5-6 år", "6-7 år", "7-8 år", "8-9 år", "9-10 år", "10-11 år", "11-12 år", "12-13 år", "13-14 år", "14-16 år"]
EN_AGE = ["0-1 mo", "1-2 mo", "2-4 mo", "4-6 mo", "6-9 mo", "9-12 mo", "12-18 mo", "18-24 mo", "2-3 yr", "3-4 yr",
          "4-5 yr", "5-6 yr", "6-7 yr", "7-8 yr", "8-9 yr", "9-10 yr", "10-11 yr", "11-12 yr", "12-13 yr", "13-14 yr", "14-16 yr"]
HEAD = ["34-36", "36-38", "38-40", "40-42", "42-44", "44-46", "46-48", "48-50", "49-51", "50-52",
        "51-53", "52-53", "52-54", "53-54", "53-55", "54-55", "54-56", "55-56", "55-57", "56-57", "56-58"]

# Ferdigmål (teknikkuavhengig, cm)
FRONT_CM = [25, 26, 27, 28, 29, 31, 32, 33, 34, 35, 35, 35, 36, 36, 36, 36, 38, 38, 38, 39, 39]
TIE_CM = [22, 23, 24, 25, 26, 27, 28, 29, 29, 30, 30, 30, 31, 31, 31, 31, 32, 32, 32, 32, 32]
M_ROWS = [round((c * 1.4 - 2) / 2) for c in FRONT_CM]
FRONT_STS = [2 + 2 * m for m in M_ROWS]

css = '''
@font-face { font-family:'Sasson Montessori'; src:url('fonts/SassoonMontessori.ttf'); font-weight:normal; }
@font-face { font-family:'Playpen Sans'; src:url('fonts/PlaypenSans-400.ttf'); font-weight:400; }
@font-face { font-family:'Playpen Sans'; src:url('fonts/PlaypenSans-600.ttf'); font-weight:600; }
@font-face { font-family:'Playpen Sans'; src:url('fonts/PlaypenSans-700.ttf'); font-weight:700; }
@font-face { font-family:'Playpen Sans'; src:url('fonts/PlaypenSans-800.ttf'); font-weight:800; }
* { margin:0; padding:0; box-sizing:border-box; }
:root { --font-head:'Playpen Sans',system-ui,sans-serif; --font-body:'Sasson Montessori','Playpen Sans',system-ui,sans-serif; }
@page { size:A4; margin:0; }
body { font-family:var(--font-body); color:#4a4a4a; }
.page { position:relative; width:210mm; height:296.5mm; overflow:hidden; page-break-after:always;
  background: repeating-linear-gradient(0deg, rgba(255,255,255,.45) 0, rgba(255,255,255,.45) .4mm, transparent .4mm, transparent 8mm),
    repeating-linear-gradient(90deg, rgba(255,255,255,.45) 0, rgba(255,255,255,.45) .4mm, transparent .4mm, transparent 8mm),
    linear-gradient(165deg,#cde8ef 0%,#e3ddea 45%,#f5d2de 100%); }
.band { position:absolute; left:0; top:0; bottom:0; width:11mm; background:linear-gradient(180deg,#9fd4dd,#f0b9ca); }
.band span { position:absolute; left:50%; top:75%; transform:translate(-50%,-50%); writing-mode:vertical-rl; text-orientation:mixed; rotate:180deg;
  font-family:var(--font-head); font-size:6.5pt; letter-spacing:3.5px; color:#fff; white-space:nowrap; }
.rside { position:absolute; right:2.5mm; top:40%; }
.rside span { writing-mode:vertical-rl; font-family:var(--font-head); font-size:6pt; letter-spacing:2.5px; color:#9a9a9a; white-space:nowrap; }
.phead { text-align:center; padding-top:7mm; }
.ph1 { font-family:var(--font-head); font-weight:600; font-size:9pt; letter-spacing:3.5px; color:#7f96a8; }
.ph2 { font-family:var(--font-head); font-weight:600; font-size:8.5pt; letter-spacing:2.2px; color:''' + PINK + '''; margin-top:1.4mm; }
.content { padding:2mm 12mm 0 15mm; }
.pfoot { position:absolute; bottom:3mm; left:0; right:0; text-align:center; font-family:var(--font-head); font-weight:700; font-size:13pt; color:#8a8a8a; }
.banner { background:#f5efb2; border-radius:14px; padding:2.2mm 6mm; margin:.6mm 0 2.4mm; text-align:center; }
.banner h1 { font-family:var(--font-head); font-weight:800; font-size:19pt; color:''' + INK + '''; letter-spacing:.4px; text-transform:uppercase; }
.pillwrap { text-align:center; margin:2.4mm 0 1.6mm; }
.pill { display:inline-block; border-radius:999px; padding:1.5mm 7mm; font-family:var(--font-head); font-weight:700; font-size:13pt; color:#fff; letter-spacing:.4px; text-transform:uppercase; }
.pinkpill { background:''' + PINK + '''; }
.tealpill { background:''' + TEAL + '''; }
.card { background:rgba(255,255,255,.93); border:2px solid #f2bfd4; border-radius:16px; padding:2.2mm 5mm; margin:0 0 2mm; }
.cream { background:''' + CREAM + '''; border:2px solid #f2bfd4; border-radius:16px; padding:2.2mm 5mm; margin:2mm 0; text-align:center; }
.creamtitle { font-family:var(--font-head); font-weight:700; font-size:14pt; color:''' + TEAL + '''; }
p { font-size:14.5pt; line-height:1.26; margin-bottom:1.1mm; }
p.small, .small { font-size:12pt; color:#777; }
p.center { text-align:center; }
ul.dots { list-style:none; }
ul.dots li { font-size:14.5pt; line-height:1.22; padding-left:5.5mm; position:relative; margin:.6mm 0; }
ul.dots li::before { content:'\\2022'; position:absolute; left:1mm; color:''' + PINK + '''; font-weight:bold; }
ul.checks { list-style:none; }
ul.checks li { font-size:14.5pt; line-height:1.22; padding-left:7mm; position:relative; margin:.7mm 0; }
ul.checks li::before { content:'\\2610'; position:absolute; left:0; color:''' + TEAL + '''; font-size:14pt; }
ol.steps { list-style:none; }
ol.steps li { display:flex; gap:2.6mm; align-items:flex-start; background:rgba(255,255,255,.93); border:2px solid #f2bfd4; border-radius:14px; padding:1.6mm 4mm; margin-bottom:1.1mm; }
ol.steps li div { font-size:13.5pt; line-height:1.2; }
.snum { flex:0 0 auto; width:7.5mm; height:7.5mm; border-radius:50%; background:''' + PINK + '''; color:#fff; font-family:var(--font-head); font-weight:700; font-size:13pt; display:flex; align-items:center; justify-content:center; margin-top:.5mm; }
table.t { width:100%; border-collapse:collapse; margin:1mm 0; }
table.t th { font-family:var(--font-head); font-weight:700; font-size:11.5pt; color:''' + PINK + '''; text-align:left; padding:.8mm 1.6mm; border-bottom:2px solid #f2bfd4; }
table.t td { font-size:11.8pt; padding:.6mm 1.6mm; border-bottom:1px solid #f6dbe7; line-height:1.14; }
table.tl td:first-child { white-space:nowrap; }
table.sz th, table.sz td { text-align:center; }
table.sz td:first-child, table.sz th:first-child { font-weight:700; }
.dot { display:inline-block; width:3.5mm; height:3.5mm; border-radius:50%; vertical-align:-0.5mm; margin-right:1.5mm; border:1px solid rgba(0,0,0,.15); }
.coverimg { text-align:center; margin:2.4mm 0 2.4mm; }
.coverimg img { width:82mm; border-radius:14px; border:3mm solid #fff; }
.covertag { text-align:center; font-family:var(--font-head); font-size:10.5pt; letter-spacing:2.3px; color:#8a8a8a; margin:1mm 0 2mm; }
.coverbanner { display:flex; align-items:center; justify-content:center; gap:5mm; background:#f5efb2; border-radius:16px; padding:2.6mm 6mm; }
.covertitle { font-family:var(--font-head); font-weight:800; font-size:22pt; color:''' + INK + '''; letter-spacing:.5px; text-align:center; line-height:1.18; }
.subpill { margin:2.6mm auto; width:fit-content; background:#fdf9e3; border:2.5px solid ''' + INK + '''; border-radius:999px; padding:1.4mm 7mm; font-family:var(--font-head); font-weight:700; font-size:11.5pt; color:''' + INK + '''; letter-spacing:.4px; text-align:center; }
.byline { text-align:center; margin-top:1.2mm; }
.byline .logo { width:26mm; height:26mm; object-fit:contain; margin-bottom:1mm; }
.by1 { font-family:var(--font-head); font-weight:700; font-size:19pt; color:''' + CERISE + '''; }
.by2 { font-size:14pt; color:#8a8a8a; margin-top:1mm; }
.by3 { font-family:var(--font-head); font-weight:600; font-size:13pt; color:''' + CERISE + '''; margin-top:.7mm; }
.notecard { display:flex; gap:3mm; align-items:center; background:rgba(255,255,255,.8); border-radius:12px; padding:2.2mm 5mm; margin-top:2.4mm; }
.notecard p { font-size:12pt; color:#777; margin:0; }
.noteemo { font-size:15pt; }
.chartrow { display:flex; gap:6mm; justify-content:center; align-items:flex-end; flex-wrap:wrap; margin:1mm 0 1.8mm; }
.chartbox { text-align:center; }
.congrats { font-family:var(--font-head); font-weight:800; font-size:17pt; color:''' + INK + '''; text-align:center; margin:1.5mm 0 1mm; }
.copyright { font-size:9.5pt; color:#9a9a9a; text-align:center; margin-top:1.5mm; line-height:1.25; }
.cflag { line-height:0; }
'''

VARIANTS = [
    dict(slug='norge', out='skaut-barn-hekle-norge', photo='skaut_norge_ref.jpg', word='NORGE'),
    dict(slug='ro', out='skaut-barn-hekle-ro', photo='skaut_ro_ref.jpg', word='RO'),
]


def build(v):
    slug = v['slug']
    out_dir = BASE / v['out']
    photo_src = 'data:image/jpeg;base64,' + base64.b64encode((out_dir / v['photo']).read_bytes()).decode()
    logo_src = 'data:image/png;base64,' + base64.b64encode((out_dir / 'lme-logo.png').read_bytes()).decode()
    is_ro = slug == 'ro'

    def build_lang(LANG):
        def L(no, en): return en if LANG == 'en' else no
        right = L('LME HEKLE', 'LME CROCHET')
        title_no = 'RO-SKAUT' if is_ro else 'NORGE-SKAUT'
        title_en = 'RO KERCHIEF' if is_ro else 'NORWAY KERCHIEF'
        ph2 = L('LME HEKLEOPPSKRIFT&nbsp;&nbsp;|&nbsp;&nbsp;' + title_no + ' BARN',
                'LME CROCHET PATTERN&nbsp;&nbsp;|&nbsp;&nbsp;' + title_en + ' KIDS')
        ph = make_page(ph2, right, logo_src)
        pages = []

        cover_alt = (L('Hvitt RO-skaut med flagg, RO og bølger i blått, bølgekant',
                        'White RO kerchief with flag, RO and waves in blue, wavy edge') if is_ro else
                     L('Rødt Norge-skaut med flagg foran, hvit/marineblå bølgekant',
                        'Red Norway kerchief with flag at front, white/navy wavy edge'))
        subpill = (L('HVIT MED BLÅ RO, FLAGG OG BØLGER &middot; STØRRELSE 50&ndash;170', 'WHITE WITH BLUE RO, FLAG AND WAVES &middot; SIZE 50&ndash;170') if is_ro else
                   L('RØDT MED FLAGG OG STRIPET BØLGEKANT &middot; STØRRELSE 50&ndash;170', 'RED WITH FLAG AND STRIPED WAVY EDGE &middot; SIZE 50&ndash;170'))
        intro = (pc('Samme RO-skaut som oppskriften for voksne: et hvitt trekantskaut med det norske flagget og "RO" i '
                    'blått, og to blå bølgeskvulp lenger ned mot spissen, med en solid blå bølgekant hele veien rundt '
                    'og to heklede snorer å knyte bak i nakken. Gradert helt fra bunnen av til tjueen babyer-, barne- '
                    'og ungdomsstørrelser, 50 til 170. Denne oppskriften er komplett i seg selv, du trenger ikke eie '
                    'noen annen LME-oppskrift for å hekle den.',
                    'The same RO kerchief as the pattern for adults: a white triangular kerchief with the Norwegian '
                    'flag and "RO" in blue, and two blue waves further down towards the point, with a solid blue '
                    'wavy edge all the way round and two crocheted ties to fasten behind the neck. Graded completely '
                    'from scratch into twenty-one baby, child and teen sizes, 50 to 170. This pattern is complete '
                    'on its own, you do not need any other LME pattern to crochet it.', L) if is_ro else
                 pc('Samme Norge-skaut som oppskriften for voksne: et rødt trekantskaut med det norske flagget '
                    'heklet inn nede mot spissen, og en bølgende kant i hvitt og marineblått hele veien rundt, '
                    'pluss to heklede snorer å knyte bak i nakken. Gradert helt fra bunnen av til tjueen babyer-, '
                    'barne- og ungdomsstørrelser, 50 til 170. Denne oppskriften er komplett i seg selv, du trenger '
                    'ikke eie noen annen LME-oppskrift for å hekle den.',
                    'The same Norway kerchief as the pattern for adults: a red triangular kerchief with the '
                    'Norwegian flag crocheted in down near the point, and a wavy edge in white and navy all the '
                    'way round, plus two crocheted ties to fasten behind the neck. Graded completely from scratch '
                    'into twenty-one baby, child and teen sizes, 50 to 170. This pattern is complete on its own, '
                    'you do not need any other LME pattern to crochet it.', L))

        pages.append(ph(
            '<div class="coverimg"><img src="' + photo_src + '" alt="' + cover_alt + '"></div>'
            + '<div class="covertag">' + L('LME HEKLEOPPSKRIFT', 'LME CROCHET PATTERN') + '</div>'
            + '<div class="coverbanner"><div class="cflag">' + mini_flag(34) + '</div>'
            + '<h1 class="covertitle">' + (title_no if LANG == 'no' else title_en) + '<br>'
            + L('TIL BABY OG BARN', 'FOR BABY AND CHILD') + '</h1>'
            + '<div class="cflag">' + mini_flag(34) + '</div></div>'
            + '<div class="subpill">' + subpill + '</div>'
            + card(intro)
            + byline(logo_src, L('Av Renate Dahl', 'By Renate Dahl'))
            + tip(L('Les hele oppskriften én gang før du starter. Hekle alltid en prøvelapp først, se side 4.',
                    'Read the whole pattern once before you start. Always crochet a gauge swatch first, see page 4.'))
        , 1))

        pages.append(ph(
            banner(L('FØR DU BEGYNNER', 'BEFORE YOU START'))
            + p('Skautet hekles fram og tilbake, ikke rundt. Du starter med noen få masker i spissen, som havner '
                'bak i nakken, og øker jevnt i begge sider på hver rad til den brede forkanten er nådd, det er '
                'den som ligger over pannen. Til slutt hekler du rundt hele kanten og lager en bølgende kant, '
                'og hekler to snorer som knytes bak i nakken.',
                'The kerchief is crocheted back and forth, not in the round. You start with just a few stitches '
                'at the point, which sits at the back of the neck, and increase evenly on both sides on every '
                'row until you reach the wide front edge, the one that lies over the forehead. At the end you '
                'crochet all round the edge to make a wavy border, and crochet two ties that fasten behind the neck.', L)
            + tealp(L('DETTE LÆRER DU', 'WHAT YOU LEARN'))
            + card(ul([
                L('Å hekle en trekant fram og tilbake, med jevn økning i sidene på hver rad', 'To crochet a triangle back and forth, with even increases at the sides on every row'),
                (L('Å plassere og hekle RO, flagget og bølgene fra rutediagram', 'To place and crochet RO, the flag and the waves from charts') if is_ro else
                 L('Å plassere og hekle flagget fra rutediagram', 'To place and crochet the flag from a chart')),
                L('Å hekle rundt en kant og lage en bølgende avslutning', 'To crochet all round an edge and finish it wavy'),
                L('Å hekle en enkel luftmaskesnor', 'To crochet a simple chain tie'),
            ]))
            + pink(L('HVOR VANSKELIG ER DET?', 'HOW HARD IS IT?'))
            + card(p('Nybegynnervennlig. Du bør kunne hekle luftmasker og fastmasker, og øke. '
                     + (L('Motivene hekles med to farger av gangen, og alt er forklart trinn for trinn.',
                          'The motifs are crocheted with two colours at a time, and every step is spelled out in this pattern.') if is_ro else
                        L('Flagget hekles med to-tre farger av gangen, og alt er forklart trinn for trinn.',
                          'The flag is crocheted with two-three colours at a time, and every step is spelled out in this pattern.')),
                     '', L))
            + ctitle('For de yngste størrelsene (50&ndash;62) kan du hoppe over motivet og hekle hele trekanten '
                     'ensfarget, det blir like fint.',
                     'For the youngest sizes (50&ndash;62) you can skip the motif and crochet the whole triangle '
                     'in one colour, it looks just as nice.', L)
        , 2))

        pages.append(ph(
            banner(L('STØRRELSER OG RIKTIG PASSFORM', 'SIZES AND GETTING THE FIT RIGHT'))
            + p('Klesstørrelsen er bare en veiledning. Skautet er sydd etter alder/høyde, ikke stramt etter '
                'hodemål, siden snorene knytes til slik du ønsker. Bruk hodemålet som en ekstra sjekk.',
                'The clothing size is only a guide. The kerchief is graded by age/height, not fitted tightly to '
                'head measurement, since the ties fasten however you like. Use the head measurement as an extra check.', L)
            + sizetable([L('Str.', 'Size'), L('Ca. alder', 'Approx. age'), L('Hodemål (cm)', 'Head (cm)')],
                        list(zip(SIZES, (AGE if LANG == 'no' else EN_AGE), HEAD)))
            + tealp(L('SIKKER BRUK FOR DE MINSTE', 'SAFE USE FOR THE YOUNGEST'))
            + card(p('Skautet er et plagg for våken bruk under tilsyn. Det skal ikke brukes under søvn, i seng, '
                     'i vogn uten oppsyn, eller strammes rundt halsen. Knytes alltid løst, i sløyfe, aldri i en '
                     'fast knute barnet ikke kan få opp selv.',
                     'The kerchief is a garment for supervised, awake use. It should not be used during sleep, in '
                     'a cot, in a pram unattended, or tied tightly around the neck. Always tie it loosely, in a '
                     'bow, never in a firm knot the child cannot undo themselves.', L))
        , 3))

        yarn_use = (('Hvit/natur', 'hovedfarge, hele skautet'), ('Kongeblå', 'kanten, RO, bølgene'),
                    ('Rød', 'flagget'), ('Marineblå', 'flagget')) if is_ro else \
                   (('Rød', 'hovedfarge, hele skautet'), ('Hvit', 'flagget og kanten'), ('Marineblå', 'flagget og kanten'))
        yarn_use_en = (('White/natural', 'main colour, whole kerchief'), ('Royal blue', 'the edge, RO, the waves'),
                       ('Red', 'the flag'), ('Navy', 'the flag')) if is_ro else \
                      (('Red', 'main colour, whole kerchief'), ('White', 'the flag and the edge'), ('Navy', 'the flag and the edge'))
        dot_colors = ((WHITE, BLUE, RED, NAVY) if is_ro else (RED, WHITE, NAVY))
        yarn_rows = ''.join(
            '<tr><td><span class="dot" style="background:' + c + (';border-color:#ccc' if c == WHITE else '') + '"></span> '
            + (yu[0] if LANG == 'no' else yue[0]) + '</td><td>' + (yu[1] if LANG == 'no' else yue[1]) + '</td></tr>'
            for c, yu, yue in zip(dot_colors, yarn_use, yarn_use_en))
        pages.append(ph(
            banner(L('DETTE TRENGER DU', 'WHAT YOU NEED'))
            + tealp(L('GARN', 'YARN'))
            + card(p('Et glatt bomullsgarn (aran/tykkelse 4) som gir 14 fastmasker x 16 omganger = 10 x 10 cm '
                     'med heklenål 4,5 mm. Reynolds Saucy, Rico Design Creative Cotton Aran og Hobbii Amigo er '
                     'alle gode valg.',
                     'A smooth cotton yarn (aran weight) that gives 14 single crochets x 16 rows = 10 x 10 cm '
                     'with a 4.5 mm hook. Reynolds Saucy, Rico Design Creative Cotton Aran and Hobbii Amigo '
                     'are all good choices.', L)
                   + '<table class="t"><tr><th>' + L('Farge', 'Colour') + '</th><th>' + L('Bruk', 'Use') + '</th></tr>'
                   + yarn_rows + '</table>')
            + pink(L('HEKLENÅL OG UTSTYR', 'HOOK AND KIT'))
            + card(ul([
                L('Heklenål 4,5 mm', '4.5 mm crochet hook'),
                L('Stoppenål, saks og målebånd', 'Tapestry needle, scissors and tape measure'),
                L('Maskemarkør eller sikkerhetsnål (valgfritt)', 'Stitch marker or safety pin (optional)'),
            ])) +
            ctitle('Hekler du fast, prøv nål 5 mm. Hekler du løst, prøv 4 mm. Målet er alltid 14 fastmasker '
                   'på 10 cm.',
                   'If you crochet tightly, try a 5 mm hook. If you crochet loosely, try 4 mm. The target is '
                   'always 14 single crochets over 10 cm.', L)
        , 4))

        pages.append(ph(
            banner(L('HEKLEFASTHET OG ORDLISTE', 'GAUGE AND GLOSSARY'))
            + tealp(L('HEKLE EN PRØVELAPP FØRST', 'CROCHET A SWATCH FIRST'))
            + card(p('Hekle 20 luftmasker, snu, og hekle fastmasker fram og tilbake til lappen er 10 cm høy. '
                     'Legg den flatt. Er 10 cm like langt som 14 fastmasker? Da er du klar. Er det flere '
                     'masker, bytt til nål 5 mm. Er det færre, bytt til 4 mm.',
                     'Chain 20, turn, and single crochet back and forth until the swatch is 10 cm tall. Lay it '
                     'flat. Is 10 cm the same length as 14 single crochets? Then you are ready. More stitches, '
                     'try a 5 mm hook. Fewer, try 4 mm.', L))
            + pink(L('ORDLISTE', 'GLOSSARY'))
            + card('<table class="t tl"><tr><th>' + L('Ord', 'Term') + '</th><th>' + L('Betyr', 'Means') + '</th></tr>'
                   + '<tr><td><b>' + L('fm', 'sc') + '</b></td><td>' + L('fastmaske', 'single crochet') + '</td></tr>'
                   + '<tr><td><b>' + L('lm', 'ch') + '</b></td><td>' + L('luftmaske', 'chain') + '</td></tr>'
                   + '<tr><td><b>' + L('kjm', 'sl st') + '</b></td><td>' + L('kjedemaske', 'slip stitch') + '</td></tr>'
                   + '<tr><td><b>' + L('rad', 'row') + '</b></td><td>' + L('én rad, når du har heklet bort og tilbake', 'one row, once you have crocheted across and back') + '</td></tr>'
                   + '<tr><td><b>' + L('øke', 'increase') + '</b></td><td>' + L('hekle 2 fm i samme maske', 'crochet 2 sc into the same stitch') + '</td></tr>'
                   + '<tr><td><b>' + L('HF', 'MC') + '</b></td><td>' + L('hovedfarge', 'main colour') + '</td></tr></table>')
        , 5))

        wave_note = (L('Hekle inn WAVE-motivet (se neste side) så snart det er minst 15 fastmasker på raden, '
                       'sentrert. Fortsett i hvitt til det gjenstår ca. 15 rader til den brede forkanten (se '
                       'tabell), hekle deretter RO-bokstavene etterfulgt av flagget, sentrert, og fortsett rett '
                       'i hvitt resten av veien.',
                       'Crochet in the WAVE motif (see next page) as soon as there are at least 15 stitches on '
                       'the row, centred. Continue in white until about 15 rows remain before the wide front '
                       'edge (see table), then crochet the RO letters followed by the flag, centred, and '
                       'continue plain in white the rest of the way.') if is_ro else
                     L('Hekle inn flagget når trekanten er minst 16 masker bred, sentrert, se rutediagrammet '
                       'på neste side. Da havner flagget nede mot spissen, som ligger bak i nakken.',
                       'Crochet in the flag once the triangle is at least 16 stitches wide, centred, see the '
                       'chart on the next page. That way the flag ends up down near the point, which sits at '
                       'the back of the neck.'))
        pages.append(ph(
            banner(L('DEL 1: SPISSEN OG ØKNINGEN', 'PART 1: THE POINT AND THE INCREASES'))
            + steps([
                L('Start i spissen med ' + ('hvitt' if is_ro else 'rødt') + '. Hekle <b>2 luftmasker</b>, og '
                  'hekle <b>2 fastmasker</b> i den første luftmaska. Nå har du 2 masker. Denne spissen havner '
                  'bak i nakken.',
                  'Start at the point in ' + ('white' if is_ro else 'red') + '. Chain <b>2</b>, and crochet '
                  '<b>2 single crochets</b> into the first chain. Now you have 2 stitches. This point ends up '
                  'at the back of the neck.'),
                L('Snu. Hekle 1 lm (teller ikke som maske), og øk i hver rad: hekle 2 fm i første maske, fm '
                  'resten av raden til siste maske, hekle 2 fm i siste maske. Det blir 2 masker mer for hver rad.',
                  'Turn. Chain 1 (does not count as a stitch), and increase on every row: crochet 2 sc into the '
                  'first stitch, sc across to the last stitch, crochet 2 sc into the last stitch. That gives 2 '
                  'more stitches every row.'),
                wave_note,
                L('Fortsett til du har antall masker fra kolonnen "Masker forkant" i tabellen på neste '
                  'side, det er den brede forkanten som skal ligge over pannen.',
                  'Continue until you have the stitch count from the "Front edge stitches" column in the '
                  'table on the next page, that is the wide front edge that lies over the forehead.'),
            ])
        , 6))

        pages.append(ph(
            banner(L('TABELL: TREKANTEN, ALLE STØRRELSER', 'TABLE: THE TRIANGLE, ALL SIZES'))
            + sizetable([L('Str.', 'Size'), L('Masker forkant', 'Front edge stitches'),
                         L('Rader til forkant', 'Rows to front edge'), L('Forkant, ca.', 'Front edge, approx.')],
                        list(zip(SIZES, FRONT_STS, M_ROWS, [str(c) + ' cm' for c in FRONT_CM])))
            + ctitle('Radantallet inkluderer starten (2 fm i luftmaska regnes som rad 1). Det viktigste er å nå '
                     'riktig antall masker, ikke å telle rader helt eksakt.',
                     'The row count includes the start (the 2 sc into the chain counts as row 1). The important '
                     'thing is reaching the right stitch count, not counting rows exactly.', L)
        , 7))

        if is_ro:
            motif_body = (
                tealp(L('DIAGRAM: BØLGENE (11 masker x 8 rader)', 'CHART: THE WAVES (11 stitches x 8 rows)'))
                + '<div class="chartrow">' + chart_svg(WAVE_M, CMAP_RO, cell=17, numbers=True) + '</div>'
                + tealp(L('DIAGRAM: RO (7 masker per bokstav x 9 rader)', 'CHART: RO (7 stitches per letter x 9 rows)'))
                + '<div class="chartrow">' + chart_svg(BIG_R, CMAP_RO, cell=18, numbers=True) + chart_svg(BIG_O, CMAP_RO, cell=18, numbers=True) + '</div>'
                + tealp(L('DIAGRAM: FLAGGET (13 masker x 10 rader)', 'CHART: THE FLAG (13 stitches x 10 rows)'))
                + '<div class="chartrow">' + chart_svg(FLAG, CMAP_RO, cell=15, numbers=True) + '</div>'
            )
        else:
            motif_body = (
                tealp(L('DIAGRAM: FLAGGET (13 masker x 10 rader)', 'CHART: THE FLAG (13 stitches x 10 rows)'))
                + '<div class="chartrow">' + chart_svg(FLAG, CMAP_NORGE, cell=18, numbers=True) + '</div>'
            )
        pages.append(ph(
            banner(L('DEL 2: MOTIVET', 'PART 2: THE MOTIF'))
            + p('Fargen du ikke hekler med, legger du oppå raden og hekler fastmaskene rundt den, så den ligger '
                'gjemt inni. Bytt farge i siste trekk på masken før, så blir fargeskiftet reint. Les diagrammet '
                'nedenfra og opp, fra høyre mot venstre på rette rader og venstre mot høyre på vrangrader.',
                'Carry the colour you are not using on top of the row and crochet the single crochets around it, '
                'so it stays hidden inside. Change colour on the last pull-through of the stitch before, so the '
                'change comes out clean. Read the chart from the bottom up, right to left on right-side rows '
                'and left to right on wrong-side rows.', L)
            + motif_body
            + '<p class="small">' + L('Farget rute = hekle med den fargen. Hvit/rød rute (bunnfargen) = hekle med hovedfargen.',
                                       'Coloured square = crochet that colour. White/red square (the background) = crochet with main colour.') + '</p>'
        , 8))

        if is_ro:
            edge_steps = [
                L('Med hele skautet ferdig, hekle fastmasker med kongeblå <b>rundt hele kanten</b>: langs den '
                  'brede forkanten, ned den ene siden til spissen, og opp den andre siden tilbake. Hekle ca. '
                  '3 masker for hver 4 du går forbi. I spissen og i de to fremre hjørnene, hekle 3 fm i samme '
                  'maske, så det ikke strammer. Avslutt med 1 kjedemaske i den første masken.',
                  'With the whole kerchief finished, single crochet in royal blue <b>all round the edge</b>: '
                  'along the wide front edge, down one side to the point, and back up the other side. Crochet '
                  'about 3 stitches for every 4 you pass. At the point and the two front corners, crochet 3 sc '
                  'into the same stitch, so it does not pull tight. Finish with 1 slip stitch into the first stitch.'),
                L('Øk til <b>omtrent dobbelt så mange</b> masker: hekle 2 fm i annenhver maske hele veien rundt.',
                  'Increase to <b>about double</b> the stitch count: crochet 2 sc into every other stitch all the way round.'),
                L('Bølgeomgang med kongeblå: <b>3 fm i samme maske, hopp over 1 maske</b>, gjenta hele veien '
                  'rundt. Avslutt med 1 kjedemaske. Klipp av og fest.',
                  'Wave round in royal blue: <b>3 sc into the same stitch, skip 1 stitch</b>, repeat all the '
                  'way round. Finish with 1 slip stitch. Cut the yarn and fasten off.'),
            ]
        else:
            edge_steps = [
                L('Med hele skautet ferdig, hekle fastmasker med rødt <b>rundt hele kanten</b>: langs den brede '
                  'forkanten, ned den ene siden til spissen, og opp den andre siden tilbake. Hekle ca. 3 '
                  'masker for hver 4 du går forbi. I spissen og i de to fremre hjørnene, hekle 3 fm i samme '
                  'maske, så det ikke strammer. Avslutt med 1 kjedemaske i den første masken.',
                  'With the whole kerchief finished, single crochet in red <b>all round the edge</b>: along '
                  'the wide front edge, down one side to the point, and back up the other side. Crochet about '
                  '3 stitches for every 4 you pass. At the point and the two front corners, crochet 3 sc into '
                  'the same stitch, so it does not pull tight. Finish with 1 slip stitch into the first stitch.'),
                L('Hekle striper: <b>1 omgang hvit, 1 omgang marineblå, 1 omgang hvit</b>. Bytt farge med en '
                  'kjedemaske på slutten av hver omgang.',
                  'Crochet stripes: <b>1 round white, 1 round navy, 1 round white</b>. Change colour with a '
                  'slip stitch at the end of each round.'),
                L('Bølgeomgang med rødt: <b>3 fm i samme maske, hopp over 1 maske</b>, gjenta hele veien '
                  'rundt. Avslutt med 1 kjedemaske. Klipp av og fest.',
                  'Wave round in red: <b>3 sc into the same stitch, skip 1 stitch</b>, repeat all the way '
                  'round. Finish with 1 slip stitch. Cut the yarn and fasten off.'),
            ]
        pages.append(ph(
            banner(L('DEL 3: KANTEN OG SNORENE', 'PART 3: THE EDGE AND THE TIES'))
            + steps(edge_steps)
            + tealp(L('SNORENE', 'THE TIES'))
            + card(steps([
                L('Hekle en lang rekke <b>luftmasker</b> til snoren måler tallet i "Snorlengde" i tabellen '
                  'under.',
                  'Crochet a long row of <b>chains</b> until the tie measures the number in "Tie length" in '
                  'the table below.'),
                L('Klipp av med god margin og trekk tråden gjennom siste luftmaske. Hekle en snor til, helt lik.',
                  'Cut with a generous tail and pull the thread through the last chain. Crochet a second tie, identical.'),
                L('Fest hver snor godt i hvert av de to fremre hjørnene på skautet, med nål og tråd.',
                  'Sew each tie securely to each of the two front corners of the kerchief, with a needle and thread.'),
            ], start=1))
            + sizetable([L('Str.', 'Size'), L('Snorlengde', 'Tie length')],
                        list(zip(SIZES, [str(c) + ' cm' for c in TIE_CM])))
        , 9))

        pages.append(ph(
            banner(L('STELL OG SISTE SJEKK', 'CARE AND FINAL CHECK'))
            + tealp(L('AVSLUTNING', 'FINISHING'))
            + card(p('Fest alle løse tråder godt på vrangen, spesielt ved fargebyttene rundt motivet. '
                     'Kontroller at trådene som er lagt inni ligger løst, ikke stramt.',
                     'Weave in all loose ends securely on the wrong side, especially at the colour changes '
                     'around the motif. Check that the carried threads inside lie loose, not tight.', L))
            + tealp(L('BRUK OG STELL', 'USE AND CARE'))
            + card(p('Legg skautet på hodet med den brede forkanten over pannen, spissen ned bak i nakken. '
                     'Før de to snorene bak og knyt en løs sløyfe under spissen. Vask etter garnets '
                     'anbefaling, ofte 30&deg;C skånsomt i vaskepose, eller for hånd. Ikke bruk tørketrommel.',
                     'Put the kerchief on with the wide front edge over the forehead, the point down at the '
                     'back of the neck. Bring the two ties round the back and tie a loose bow under the point. '
                     'Wash following the yarn&rsquo;s recommendation, often 30&deg;C gentle in a wash bag, or '
                     'by hand. Do not tumble dry.', L))
            + pink(L('SJEKKLISTE', 'CHECKLIST'))
            + card(check([
                L('Prøvelappen stemmer med 14 fastmasker på 10 cm', 'The swatch matches 14 single crochets over 10 cm'),
                L('Trekanten har riktig antall masker i forkanten', 'The triangle has the correct stitch count at the front edge'),
                (L('RO, flagget og bølgene er sentrert', 'RO, the flag and the waves are centred') if is_ro else
                 L('Flagget er sentrert nede mot spissen', 'The flag is centred down near the point')),
                L('Kanten bølger fra 3-fm-skip-1-omgangen', 'The edge waves from the 3-sc-skip-1 round'),
                L('Begge snorene er like lange og godt festet', 'Both ties are the same length and securely fastened'),
            ]))
            + '<div class="congrats">' + (L('Gratulerer, du har heklet ditt eget RO-skaut!', 'Congratulations, you have crocheted your very own RO kerchief!') if is_ro else
                                            L('Gratulerer, du har heklet ditt eget Norge-skaut!', 'Congratulations, you have crocheted your very own Norway kerchief!')) + '</div>'
            + byline(logo_src, 'Renate Dahl')
            + '<p class="copyright">' + L('&copy; 2026 Little Montessori Explorers. Oppskriften er kun til personlig '
              'bruk. Oppskriften og diagrammene kan ikke kopieres, deles, videreselges eller publiseres. '
              'Ferdige produkter kan selges i liten skala med kreditering til Little Montessori Explorers.',
              '&copy; 2026 Little Montessori Explorers. This pattern is for personal use only. The pattern and '
              'charts may not be copied, shared, resold or published. Finished items may be sold on a small '
              'scale with credit to Little Montessori Explorers.') + '</p>'
            + '<p style="font-size:11pt;color:#c0392b;text-align:center;margin-top:2mm;">'
            + L('Skautet er et plagg for våken bruk under tilsyn. Skal ikke brukes under søvn eller i vogn uten oppsyn, og skal aldri strammes rundt halsen.',
                'The kerchief is a garment for supervised, awake use. Do not use during sleep or in a pram unattended, and never tie it tightly around the neck.') + '</p>'
        , 10))

        title_tag = ('RO-skaut barn, LME hekleoppskrift' if LANG == 'no' else 'RO kerchief kids, LME crochet pattern') if is_ro else \
                    ('Norge-skaut barn, LME hekleoppskrift' if LANG == 'no' else 'Norway kerchief kids, LME crochet pattern')
        doc = ('<!DOCTYPE html><html lang="' + LANG + '"><head><meta charset="utf-8">'
               '<title>' + title_tag + '</title><style>' + css + '</style></head>'
               '<body>' + ''.join(pages) + '</body></html>')
        return doc

    (out_dir / ('barn_skaut_' + slug + '_no.html')).write_text(build_lang('no'), encoding='utf-8')
    (out_dir / ('barn_skaut_' + slug + '_en.html')).write_text(build_lang('en'), encoding='utf-8')
    print('OK', slug)


if __name__ == '__main__':
    for v in VARIANTS:
        build(v)
