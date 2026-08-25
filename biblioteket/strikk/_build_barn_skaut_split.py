# -*- coding: utf-8 -*-
"""Genererer graderte LME strikkeoppskrifter for skaut (trekantskaut), barn/baby,
nyfødt til 170, i to design-varianter: NORGE (rødt flagg-skaut) og RO (hvitt med
RO+flagg+bølger i blått). Samme trekant-teknikk som voksenoppskriften
(norge-skaut/build_skaut.py): legg opp i spissen, øk i sidene, plukk opp kant til
slutt. Kjør: python3 _build_barn_skaut_split.py"""
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

# Ferdigmål (teknikkuavhengig, cm): forkant, ned til spiss, snorlengde
N_REPS = [19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 28, 28, 29, 29, 29, 29, 30, 30, 30, 31, 31]
FRONT_STS = [4 + 2 * n for n in N_REPS]
DOWN_ROWS = [2 * n for n in N_REPS]
FRONT_CM = [round(s / 1.7) for s in FRONT_STS]
DOWN_CM = [round(r / 2.25) for r in DOWN_ROWS]
TIE_CM = [22, 23, 24, 25, 26, 27, 28, 29, 29, 30, 30, 30, 31, 31, 31, 31, 32, 32, 32, 32, 32]

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
    dict(slug='norge', out='skaut-barn-strikk-norge', photo='skaut_norge_ref.jpg', word='NORGE'),
    dict(slug='ro', out='skaut-barn-strikk-ro', photo='skaut_ro_ref.jpg', word='RO'),
]


def build(v):
    slug = v['slug']
    out_dir = BASE / v['out']
    photo_src = 'data:image/jpeg;base64,' + base64.b64encode((out_dir / v['photo']).read_bytes()).decode()
    logo_src = 'data:image/png;base64,' + base64.b64encode((out_dir / 'lme-logo.png').read_bytes()).decode()
    is_ro = slug == 'ro'
    body_color = WHITE if is_ro else RED
    edge_color = BLUE if is_ro else RED

    def build_lang(LANG):
        def L(no, en): return en if LANG == 'en' else no
        right = L('LME STRIKK', 'LME KNIT')
        title_no = 'RO-SKAUT' if is_ro else 'NORGE-SKAUT'
        title_en = 'RO KERCHIEF' if is_ro else 'NORWAY KERCHIEF'
        ph2 = L('LME STRIKKEOPPSKRIFT&nbsp;&nbsp;|&nbsp;&nbsp;' + title_no + ' BARN',
                'LME KNITTING PATTERN&nbsp;&nbsp;|&nbsp;&nbsp;' + title_en + ' KIDS')
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
                    'og to strikkede snorer å knyte bak i nakken. Gradert helt fra bunnen av til tjueen babyer-, barne- '
                    'og ungdomsstørrelser, 50 til 170. Denne oppskriften er komplett i seg selv, du trenger ikke eie '
                    'noen annen LME-oppskrift for å strikke den.',
                    'The same RO kerchief as the pattern for adults: a white triangular kerchief with the Norwegian '
                    'flag and "RO" in blue, and two blue waves further down towards the point, with a solid blue '
                    'wavy edge all the way round and two knitted ties to fasten behind the neck. Graded completely '
                    'from scratch into twenty-one baby, child and teen sizes, 50 to 170. This pattern is complete '
                    'on its own, you do not need any other LME pattern to knit it.', L) if is_ro else
                 pc('Samme Norge-skaut som oppskriften for voksne: et rødt trekantskaut med det norske flagget '
                    'strikket inn nede mot spissen, og en bølgende kant i hvitt og marineblått hele veien rundt, '
                    'pluss to strikkede snorer å knyte bak i nakken. Gradert helt fra bunnen av til tjueen babyer-, '
                    'barne- og ungdomsstørrelser, 50 til 170. Denne oppskriften er komplett i seg selv, du trenger '
                    'ikke eie noen annen LME-oppskrift for å strikke den.',
                    'The same Norway kerchief as the pattern for adults: a red triangular kerchief with the '
                    'Norwegian flag knitted in down near the point, and a wavy edge in white and navy all the way '
                    'round, plus two knitted ties to fasten behind the neck. Graded completely from scratch into '
                    'twenty-one baby, child and teen sizes, 50 to 170. This pattern is complete on its own, you do '
                    'not need any other LME pattern to knit it.', L))

        pages.append(ph(
            '<div class="coverimg"><img src="' + photo_src + '" alt="' + cover_alt + '"></div>'
            + '<div class="covertag">' + L('LME STRIKKEOPPSKRIFT', 'LME KNITTING PATTERN') + '</div>'
            + '<div class="coverbanner"><div class="cflag">' + mini_flag(34) + '</div>'
            + '<h1 class="covertitle">' + (title_no if LANG == 'no' else title_en) + '<br>'
            + L('TIL BABY OG BARN', 'FOR BABY AND CHILD') + '</h1>'
            + '<div class="cflag">' + mini_flag(34) + '</div></div>'
            + '<div class="subpill">' + subpill + '</div>'
            + card(intro)
            + byline(logo_src, L('Av Renate Dahl', 'By Renate Dahl'))
            + tip(L('Les hele oppskriften én gang før du legger opp. Strikk alltid en prøvelapp først, se side 4.',
                    'Read the whole pattern once before you cast on. Always knit a gauge swatch first, see page 4.'))
        , 1))

        pages.append(ph(
            banner(L('FØR DU BEGYNNER', 'BEFORE YOU START'))
            + p('Skautet strikkes fram og tilbake, ikke rundt. Du legger opp noen få masker i spissen, som havner '
                'bak i nakken, og øker jevnt i begge sider til den brede forkanten er nådd, det er den som ligger '
                'over pannen. Til slutt plukker du opp masker rundt hele kanten og strikker en bølgende kant, '
                'og strikker to snorer som knytes bak i nakken.',
                'The kerchief is knitted back and forth, not in the round. You cast on just a few stitches at the '
                'point, which sits at the back of the neck, and increase evenly on both sides until you reach the '
                'wide front edge, the one that lies over the forehead. At the end you pick up stitches all round '
                'the edge and knit a wavy border, and knit two ties that fasten behind the neck.', L)
            + tealp(L('DETTE LÆRER DU', 'WHAT YOU LEARN'))
            + card(ul([
                L('Å strikke en trekant fram og tilbake, med jevn økning i sidene', 'To knit a triangle back and forth, with even increases at the sides'),
                (L('Å plassere og strikke RO, flagget og bølgene fra rutediagram', 'To place and knit RO, the flag and the waves from charts') if is_ro else
                 L('Å plassere og strikke flagget fra rutediagram', 'To place and knit the flag from a chart')),
                L('Å plukke opp masker rundt en kant og strikke den bølgende til slutt', 'To pick up stitches around an edge and knit it wavy at the end'),
                L('Å strikke en enkel I-cord-snor', 'To knit a simple I-cord tie'),
            ]))
            + pink(L('HVOR VANSKELIG ER DET?', 'HOW HARD IS IT?'))
            + card(p('Nybegynnervennlig. Du bør kunne legge opp, strikke rett og øke. '
                     + (L('Motivene strikkes med to farger av gangen, og alt er forklart trinn for trinn.',
                          'The motifs are knitted with two colours at a time, and every step is spelled out in this pattern.') if is_ro else
                        L('Flagget strikkes med to-tre farger av gangen, og alt er forklart trinn for trinn.',
                          'The flag is knitted with two-three colours at a time, and every step is spelled out in this pattern.')),
                     '', L))
            + ctitle('For de yngste størrelsene (50&ndash;62) kan du hoppe over motivet og strikke hele trekanten '
                     'ensfarget, det blir like fint.',
                     'For the youngest sizes (50&ndash;62) you can skip the motif and knit the whole triangle in '
                     'one colour, it looks just as nice.', L)
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

        yarn_use = (('Hvit/natur', 'hovedfarge, hele skautet') , ('Kongeblå', 'kanten, RO, bølgene'),
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
            + card(p('Et glatt bomullsgarn (aran/tykkelse 4) som gir 17 masker x 22 omganger glattstrikk = '
                     '10 x 10 cm på pinne 5 mm. Reynolds Saucy, Rico Design Creative Cotton Aran og Hobbii Amigo '
                     'er alle gode valg.',
                     'A smooth cotton yarn (aran weight) that gives 17 stitches x 22 rows in stockinette = 10 x '
                     '10 cm on 5 mm needles. Reynolds Saucy, Rico Design Creative Cotton Aran and Hobbii Amigo '
                     'are all good choices.', L)
                   + '<table class="t"><tr><th>' + L('Farge', 'Colour') + '</th><th>' + L('Bruk', 'Use') + '</th></tr>'
                   + yarn_rows + '</table>')
            + pink(L('PINNER OG UTSTYR', 'NEEDLES AND KIT'))
            + card(ul([
                L('Rundpinne eller vanlig pinne 5 mm (fram og tilbake, ikke rundt, til trekanten er ferdig)',
                  '5 mm circular or straight needles (back and forth, not in the round, until the triangle is done)'),
                L('Rundpinne 5 mm til kanten, og to strømpepinner 5 mm til snorene',
                  '5 mm circular needle for the edge, and two 5 mm double-pointed needles for the ties'),
                L('Stoppenål, saks og målebånd', 'Tapestry needle, scissors and tape measure'),
            ]))
            + ctitle('Strikker du fast, prøv pinne 5,5 mm. Strikker du løst, prøv 4,5 mm. Målet er alltid 17 '
                     'masker på 10 cm.',
                     'If you knit tightly, try 5.5 mm needles. If you knit loosely, try 4.5 mm. The target is '
                     'always 17 stitches over 10 cm.', L)
        , 4))

        pages.append(ph(
            banner(L('STRIKKEFASTHET OG ORDLISTE', 'GAUGE AND GLOSSARY'))
            + tealp(L('STRIKK EN PRØVELAPP FØRST', 'KNIT A SWATCH FIRST'))
            + card(p('Legg opp 20 masker. Strikk rett fram og tilbake til lappen er 10 cm høy. Legg den flatt. '
                     'Er 10 cm like langt som 17 masker? Da er du klar. Er det flere masker, bytt til pinne 5,5. '
                     'Er det færre, bytt til pinne 4,5.',
                     'Cast on 20 stitches. Knit garter stitch back and forth until the swatch is 10 cm tall. '
                     'Lay it flat. Is 10 cm the same length as 17 stitches? Then you are ready. More stitches, '
                     'try 5.5 mm needles. Fewer, try 4.5 mm.', L))
            + pink(L('ORDLISTE', 'GLOSSARY'))
            + card('<table class="t tl"><tr><th>' + L('Ord', 'Term') + '</th><th>' + L('Betyr', 'Means') + '</th></tr>'
                   + '<tr><td><b>' + L('m', 'st') + '</b></td><td>' + L('maske', 'stitch') + '</td></tr>'
                   + '<tr><td><b>' + L('r', 'k') + '</b></td><td>' + L('rett', 'knit') + '</td></tr>'
                   + '<tr><td><b>' + L('pinne', 'row') + '</b></td><td>' + L('én rad, når du har strikket bort og tilbake', 'one row, once you have knitted across and back') + '</td></tr>'
                   + '<tr><td><b>' + L('øke', 'increase') + '</b></td><td>' + L('lage flere masker, her: strikk 1 rett, 1 vridd rett i samme maske', 'make more stitches, here: knit 1, then knit 1 twisted into the same stitch') + '</td></tr>'
                   + '<tr><td><b>' + L('felle av', 'bind off') + '</b></td><td>' + L('ta maskene av pinnen så strikkingen ikke løser seg opp', 'take the stitches off the needle so the knitting does not unravel') + '</td></tr>'
                   + '<tr><td><b>' + L('HF', 'MC') + '</b></td><td>' + L('hovedfarge', 'main colour') + '</td></tr></table>')
        , 5))

        wave_note = (L('Strikk inn WAVE-motivet (se neste side) så snart det er minst 15 masker på pinnen, '
                       'sentrert. Fortsett i hvitt til det gjenstår ca. 20 omganger til den brede forkanten '
                       '(se tabell), strikk deretter RO-bokstavene etterfulgt av flagget, sentrert, og fortsett '
                       'rett i hvitt resten av veien.',
                       'Knit in the WAVE motif (see next page) as soon as there are at least 15 stitches on the '
                       'needle, centred. Continue in white until about 20 rows remain before the wide front edge '
                       '(see table), then knit the RO letters followed by the flag, centred, and continue plain '
                       'in white the rest of the way.') if is_ro else
                     L('Strikk inn flagget når trekanten er minst 16 masker bred, sentrert, se rutediagrammet '
                       'på neste side. Da havner flagget nede mot spissen, som ligger bak i nakken.',
                       'Knit in the flag once the triangle is at least 16 stitches wide, centred, see the chart '
                       'on the next page. That way the flag ends up down near the point, which sits at the back '
                       'of the neck.'))
        pages.append(ph(
            banner(L('DEL 1: SPISSEN OG ØKNINGEN', 'PART 1: THE POINT AND THE INCREASES'))
            + steps([
                L('Legg opp <b>4 masker</b> med ' + ('hvitt' if is_ro else 'rødt') + '. Dette er spissen, den '
                  'havner bak i nakken.',
                  'Cast on <b>4 stitches</b> in ' + ('white' if is_ro else 'red') + '. This is the point, it '
                  'ends up at the back of the neck.'),
                L('Strikk 2 pinner rett (garterstrikk hele veien, ingen glattstrikk).',
                  'Knit 2 rows (garter stitch throughout, no stockinette).'),
                L('Øk nå på <b>hver 2. pinne</b>: strikk 1, øk i neste maske, strikk til det er 2 masker igjen, '
                  'øk, strikk 1. Det blir 2 masker mer for hver økepinne.',
                  'Now increase on <b>every 2nd row</b>: knit 1, increase in the next stitch, knit until 2 '
                  'stitches remain, increase, knit 1. That gives 2 more stitches every increase row.'),
                wave_note,
                L('Fortsett til du har antall masker fra kolonnen "Masker forkant" i tabellen på neste '
                  'side, det er den brede forkanten som skal ligge over pannen. Fell av løst.',
                  'Continue until you have the stitch count from the "Front edge stitches" column in the '
                  'table on the next page, that is the wide front edge that lies over the forehead. Bind off loosely.'),
            ])
        , 6))

        pages.append(ph(
            banner(L('TABELL: TREKANTEN, ALLE STØRRELSER', 'TABLE: THE TRIANGLE, ALL SIZES'))
            + sizetable([L('Str.', 'Size'), L('Masker forkant', 'Front edge stitches'),
                         L('Pinner til forkant', 'Rows to front edge'), L('Forkant, ca.', 'Front edge, approx.'),
                         L('Ned til spiss, ca.', 'Down to point, approx.')],
                        list(zip(SIZES, FRONT_STS, DOWN_ROWS,
                                 [str(c) + ' cm' for c in FRONT_CM], [str(c) + ' cm' for c in DOWN_CM])))
            + ctitle('Antall pinner er alltid et partall, siden du øker på hver 2. pinne. "Ned til spiss" er '
                     'omtrentlig, det viktigste er å nå riktig antall masker.',
                     'The row count is always an even number, since you increase on every 2nd row. "Down to '
                     'point" is approximate, the important thing is reaching the right stitch count.', L)
        , 7))

        if is_ro:
            motif_body = (
                tealp(L('DIAGRAM: BØLGENE (11 masker x 8 omganger)', 'CHART: THE WAVES (11 stitches x 8 rows)'))
                + '<div class="chartrow">' + chart_svg(WAVE_M, CMAP_RO, cell=17, numbers=True) + '</div>'
                + tealp(L('DIAGRAM: RO (7 masker per bokstav x 9 omganger)', 'CHART: RO (7 stitches per letter x 9 rows)'))
                + '<div class="chartrow">' + chart_svg(BIG_R, CMAP_RO, cell=18, numbers=True) + chart_svg(BIG_O, CMAP_RO, cell=18, numbers=True) + '</div>'
                + tealp(L('DIAGRAM: FLAGGET (13 masker x 10 omganger)', 'CHART: THE FLAG (13 stitches x 10 rows)'))
                + '<div class="chartrow">' + chart_svg(FLAG, CMAP_RO, cell=15, numbers=True) + '</div>'
            )
        else:
            motif_body = (
                tealp(L('DIAGRAM: FLAGGET (13 masker x 10 omganger)', 'CHART: THE FLAG (13 stitches x 10 rows)'))
                + '<div class="chartrow">' + chart_svg(FLAG, CMAP_NORGE, cell=18, numbers=True) + '</div>'
            )
        pages.append(ph(
            banner(L('DEL 2: MOTIVET', 'PART 2: THE MOTIF'))
            + p('Motivet strikkes inn med flerfargestrikk (fair isle): du strikker med to farger i samme pinne '
                'og lar den ubrukte fargen "flyte" løst på vrangen. Les diagrammet nedenfra og opp, annenhver '
                'rad fra høyre mot venstre og annenhver fra venstre mot høyre (vanlig frem-og-tilbake-lesing).',
                'The motif is knitted with stranded colourwork (fair isle): you knit with two colours in the '
                'same row and let the unused colour float loosely on the wrong side. Read the chart from the '
                'bottom up, alternating right-to-left and left-to-right rows (ordinary back-and-forth reading).', L)
            + motif_body
            + '<p class="small">' + L('Farget rute = strikk med den fargen. Hvit/rød rute (bunnfargen) = strikk med hovedfargen.',
                                       'Coloured square = knit that colour. White/red square (the background) = knit with main colour.') + '</p>'
        , 8))

        if is_ro:
            edge_steps = [
                L('Med hele skautet ferdig, plukk opp masker med kongeblå <b>rundt hele kanten</b>: langs den '
                  'brede forkanten, ned den ene siden til spissen, og opp den andre siden tilbake. Plukk opp '
                  'ca. 3 masker for hver 4 du går forbi. I spissen og i de to fremre hjørnene, plukk opp 1 '
                  'ekstra maske, så det ikke strammer.',
                  'With the whole kerchief finished, pick up stitches in royal blue <b>all round the edge</b>: '
                  'along the wide front edge, down one side to the point, and back up the other side. Pick up '
                  'about 3 stitches for every 4 you pass. At the point and the two front corners, pick up 1 '
                  'extra stitch, so it does not pull tight.'),
                L('Strikk 1 pinne rett fram og tilbake med kongeblå.',
                  'Knit 1 row back and forth in royal blue.'),
                L('Øk til <b>dobbelt så mange</b> masker: strikk 1, øk i neste, hele veien. Nå bukter kanten seg.',
                  'Increase to <b>double</b> the stitch count: knit 1, increase in the next, all the way along. Now the edge starts to wave.'),
                L('Strikk 2 pinner til, fortsatt kongeblå. Fell av løst.',
                  'Knit 2 more rows, still in royal blue. Bind off loosely.'),
            ]
        else:
            edge_steps = [
                L('Med hele skautet ferdig, plukk opp masker med rødt <b>rundt hele kanten</b>: langs den brede '
                  'forkanten, ned den ene siden til spissen, og opp den andre siden tilbake. Plukk opp ca. 3 '
                  'masker for hver 4 du går forbi. I spissen og i de to fremre hjørnene, plukk opp 1 ekstra '
                  'maske, så det ikke strammer.',
                  'With the whole kerchief finished, pick up stitches in red <b>all round the edge</b>: along '
                  'the wide front edge, down one side to the point, and back up the other side. Pick up about '
                  '3 stitches for every 4 you pass. At the point and the two front corners, pick up 1 extra '
                  'stitch, so it does not pull tight.'),
                L('Strikk 1 pinne rett fram og tilbake med rødt.',
                  'Knit 1 row back and forth in red.'),
                L('Øk til <b>dobbelt så mange</b> masker: strikk 1, øk i neste, hele veien. Nå bukter kanten seg.',
                  'Increase to <b>double</b> the stitch count: knit 1, increase in the next, all the way along. Now the edge starts to wave.'),
                L('Strikk striper: <b>2 pinner hvit, 2 pinner marineblå, 2 pinner hvit</b>. Fell av løst med hvit.',
                  'Knit stripes: <b>2 rows white, 2 rows navy, 2 rows white</b>. Bind off loosely in white.'),
            ]
        pages.append(ph(
            banner(L('DEL 3: KANTEN OG SNORENE', 'PART 3: THE EDGE AND THE TIES'))
            + steps(edge_steps)
            + tealp(L('SNORENE (I-CORD)', 'THE TIES (I-CORD)'))
            + card(steps([
                L('Legg opp <b>3 masker</b> på en strømpepinne.', 'Cast on <b>3 stitches</b> on a double-pointed needle.'),
                L('Strikk 3 masker rett. Uten å snu arbeidet, skyv maskene til den andre enden av pinnen. Ta '
                  'garnet stramt bak arbeidet og strikk 3 masker rett igjen. Gjenta.',
                  'Knit 3 stitches. Without turning the work, slide the stitches to the other end of the '
                  'needle. Pull the yarn tight behind the work and knit 3 stitches again. Repeat.'),
                L('Fortsett til snoren måler tallet i "Snorlengde" i tabellen under. Fell av. Strikk en '
                  'snor til, helt lik.',
                  'Continue until the tie measures the number in "Tie length" in the table below. Bind off. '
                  'Knit a second tie, identical.'),
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
                     'Kontroller at flottene på innsiden ligger løst, ikke stramt.',
                     'Weave in all loose ends securely on the wrong side, especially at the colour changes '
                     'around the motif. Check that the floats on the inside lie loose, not tight.', L))
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
                L('Prøvelappen stemmer med 17 masker på 10 cm', 'The swatch matches 17 stitches over 10 cm'),
                L('Trekanten har riktig antall masker i forkanten', 'The triangle has the correct stitch count at the front edge'),
                (L('RO, flagget og bølgene er sentrert', 'RO, the flag and the waves are centred') if is_ro else
                 L('Flagget er sentrert nede mot spissen', 'The flag is centred down near the point')),
                L('Kanten bukter seg fra økeomgangen', 'The edge waves from the increase round'),
                L('Begge snorene er like lange og godt festet', 'Both ties are the same length and securely fastened'),
            ]))
            + '<div class="congrats">' + (L('Gratulerer, du har strikket ditt eget RO-skaut!', 'Congratulations, you have knitted your very own RO kerchief!') if is_ro else
                                            L('Gratulerer, du har strikket ditt eget Norge-skaut!', 'Congratulations, you have knitted your very own Norway kerchief!')) + '</div>'
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

        title_tag = ('RO-skaut barn, LME strikkeoppskrift' if LANG == 'no' else 'RO kerchief kids, LME knitting pattern') if is_ro else \
                    ('Norge-skaut barn, LME strikkeoppskrift' if LANG == 'no' else 'Norway kerchief kids, LME knitting pattern')
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
