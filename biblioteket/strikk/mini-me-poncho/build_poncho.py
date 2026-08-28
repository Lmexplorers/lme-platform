# -*- coding: utf-8 -*-
"""LME Mini & Me Poncho, strikkeoppskrift, i tre separate oppskrifter:
voksen, barn og baby (med hette). Bygget om fra et ChatGPT-utkast til riktig
LME-mal (Sasson Montessori/Playpen Sans, samme sidestruktur som resten av
biblioteket). Tallene i voksen/barn er hentet direkte fra utkastet og
verifisert (legg opp + 8 x økningsomganger = masker etter økning, stopp ved
= hel lengde - 1,5 cm, knapp/knapphull-plassering = sidemidt +/- masker).
Baby-varianten er ny design: samme konstruksjon, men med en heklet/strikket
hette først i stedet for lav ribbehals. Kjør: python3 build_poncho.py"""
import base64, pathlib

BASE = pathlib.Path(__file__).parent

TEAL, RED, NAVY, WHITE, CREAM, INK, PINK, CERISE = (
    '#4aa7a4', '#C8102E', '#00205B', '#FFFFFF', '#F8F4EA', '#3f3f3f', '#df5f93', '#E91E89')


def mm_logo():
    return base64.b64encode((BASE / 'lme-logo.png').read_bytes()).decode()


LOGO_SRC = 'data:image/png;base64,' + mm_logo()


def photo_src(name):
    return 'data:image/jpeg;base64,' + base64.b64encode((BASE / name).read_bytes()).decode()


def make_page(ph2, right_label):
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
def byline(name_line, company='Little Montessori Explorers', site='lmexplorers.com'):
    return ('<div class="byline">'
            f'<img class="logo" src="{LOGO_SRC}" alt="Little Montessori Explorers">'
            f'<div class="by1">{name_line}</div>'
            f'<div class="by2">{company}</div>'
            f'<div class="by3">{site}</div></div>')


def hood_schematic(L):
    return f'''
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 340" style="width:100%">
  <defs><marker id="ah2" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">
    <path d="M0,0 L8,4 L0,8 z" fill="#777"/></marker></defs>
  <path d="M170,40 Q170,20 240,20 Q310,20 310,40 L310,150 L260,150 L260,175 L220,175 L220,150 L170,150 Z"
        fill="#dbe7ea" stroke="#8aa0a6" stroke-width="2"/>
  <path d="M120,185 L360,185 L300,320 L180,320 Z" fill="{RED}" opacity=".14" stroke="{PINK}" stroke-width="2"/>
  <line x1="90" y1="30" x2="90" y2="175" stroke="#777" stroke-width="2" marker-start="url(#ah2)" marker-end="url(#ah2)"/>
  <text x="70" y="102" font-size="13" font-family="Sasson Montessori, sans-serif" fill="#555" text-anchor="middle" transform="rotate(-90 70 102)">{L('hettehøyde','hood height')}</text>
  <line x1="240" y1="14" x2="240" y2="330" stroke="#aaa" stroke-width="1" stroke-dasharray="4 3"/>
  <text x="240" y="10" text-anchor="middle" font-size="12" font-family="Sasson Montessori, sans-serif" fill="#888">{L('brettes her, midt bak','folded here, centre back')}</text>
  <line x1="380" y1="185" x2="380" y2="320" stroke="#777" stroke-width="2" marker-start="url(#ah2)" marker-end="url(#ah2)"/>
  <text x="400" y="257" font-size="13" font-family="Sasson Montessori, sans-serif" fill="#555">{L('kroppslengde','body length')}</text>
  <text x="240" y="335" text-anchor="middle" font-size="12" font-family="Sasson Montessori, sans-serif" fill="#888">{L('nederkant med i-cordkant','hem with i-cord edge')}</text>
</svg>'''


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
table.t th { font-family:var(--font-head); font-weight:700; font-size:11pt; color:''' + PINK + '''; text-align:left; padding:.7mm 1.4mm; border-bottom:2px solid #f2bfd4; }
table.t td { font-size:11.2pt; padding:.55mm 1.4mm; border-bottom:1px solid #f6dbe7; line-height:1.1; }
table.tl td:first-child { white-space:nowrap; }
table.sz th, table.sz td { text-align:center; }
table.sz td:first-child, table.sz th:first-child { font-weight:700; }
.dot { display:inline-block; width:3.5mm; height:3.5mm; border-radius:50%; vertical-align:-0.5mm; margin-right:1.5mm; border:1px solid rgba(0,0,0,.15); }
.coverimg { text-align:center; margin:2.4mm 0 2.4mm; }
.coverimg img { width:82mm; max-height:100mm; object-fit:cover; border-radius:14px; border:3mm solid #fff; }
.covertag { text-align:center; font-family:var(--font-head); font-size:10.5pt; letter-spacing:2.3px; color:#8a8a8a; margin:1mm 0 2mm; }
.coverbanner { display:flex; align-items:center; justify-content:center; gap:5mm; background:#f5efb2; border-radius:16px; padding:2.6mm 6mm; }
.covertitle { font-family:var(--font-head); font-weight:800; font-size:23pt; color:''' + INK + '''; letter-spacing:.5px; text-align:center; line-height:1.18; }
.subpill { margin:2.6mm auto; width:fit-content; background:#fdf9e3; border:2.5px solid ''' + INK + '''; border-radius:999px; padding:1.4mm 7mm; font-family:var(--font-head); font-weight:700; font-size:12pt; color:''' + INK + '''; letter-spacing:.4px; text-align:center; }
.byline { text-align:center; margin-top:1.2mm; }
.byline .logo { width:26mm; height:26mm; object-fit:contain; margin-bottom:1mm; }
.by1 { font-family:var(--font-head); font-weight:700; font-size:19pt; color:''' + CERISE + '''; }
.by2 { font-size:14pt; color:#8a8a8a; margin-top:1mm; }
.by3 { font-family:var(--font-head); font-weight:600; font-size:13pt; color:''' + CERISE + '''; margin-top:.7mm; }
.notecard { display:flex; gap:3mm; align-items:center; background:rgba(255,255,255,.8); border-radius:12px; padding:2.2mm 5mm; margin-top:2.4mm; }
.notecard p { font-size:12pt; color:#777; margin:0; }
.noteemo { font-size:15pt; }
.congrats { font-family:var(--font-head); font-weight:800; font-size:17pt; color:''' + INK + '''; text-align:center; margin:1.5mm 0 1mm; }
.copyright { font-size:9.5pt; color:#9a9a9a; text-align:center; margin-top:1.5mm; line-height:1.25; }
.cflag { line-height:0; }
'''

# ---------- data ----------
BARN = dict(
    slug='barn', title_no='TIL BARN', title_en='FOR KIDS',
    photo='poncho_barn_ref.jpg', has_hood=False, size_span='92&ndash;176',
    codes=['92', '98', '104', '110', '116', '122', '128', '134', '140', '146', '152', '158', '164', '170', '176'],
    age_no=['2 år', '3 år', '4 år', '5 år', '6 år', '7 år', '8 år', '9 år', '10 år', '11 år', '12 år',
            '13 år', '14 år', '15 år', '16 år'],
    age_en=['2 yr', '3 yr', '4 yr', '5 yr', '6 yr', '7 yr', '8 yr', '9 yr', '10 yr', '11 yr', '12 yr',
            '13 yr', '14 yr', '15 yr', '16 yr'],
    legg_opp=[64, 64, 64, 64, 72, 72, 72, 72, 72, 72, 72, 80, 80, 80, 80],
    felt=[8, 8, 8, 8, 9, 9, 9, 9, 9, 9, 9, 10, 10, 10, 10],
    ribbhoyde=['2.5 cm'] * 10 + ['3 cm'] * 5,
    okn=[9, 9, 10, 10, 10, 11, 11, 12, 12, 13, 13, 13, 14, 14, 15],
    final=[208, 208, 224, 224, 232, 248, 248, 264, 264, 280, 280, 288, 304, 304, 320],
    okn_lengde=[12, 13, 14, 14, 14, 15, 15, 17, 17, 18, 18, 18, 19, 20, 21],
    bredde=[61, 61, 66, 66, 68, 73, 73, 78, 78, 82, 82, 85, 89, 89, 94],
    lengde=[36, 37, 38, 40, 42, 43, 45, 46, 48, 50, 52, 53, 54, 56, 58],
    armapning=[16, 16, 16, 18, 19, 19, 19, 20, 21, 21, 21, 22, 24, 24, 24],
    stopp=[34.5, 35.5, 36.5, 38.5, 40.5, 41.5, 43.5, 44.5, 46.5, 48.5, 50.5, 51.5, 52.5, 54.5, 56.5],
    side_masker=[14, 14, 14, 15, 16, 16, 16, 17, 18, 18, 18, 19, 20, 20, 20],
    kh1=[38, 38, 42, 41, 42, 46, 46, 49, 48, 52, 52, 53, 56, 56, 60],
    kn1=[66, 66, 70, 71, 74, 78, 78, 83, 84, 88, 88, 91, 96, 96, 100],
    kn2=[142, 142, 154, 153, 158, 170, 170, 181, 180, 192, 192, 197, 208, 208, 220],
    kh2=[170, 170, 182, 183, 190, 202, 202, 215, 216, 228, 228, 235, 248, 248, 260],
    mengde=[200, 200, 200, 200, 250, 250, 250, 300, 300, 300, 300, 300, 350, 350, 350],
    noster=[4, 4, 4, 4, 5, 5, 5, 6, 6, 6, 6, 6, 7, 7, 7],
)
VOKSEN = dict(
    slug='voksen', title_no='TIL VOKSEN', title_en='FOR ADULTS',
    photo='poncho_voksen_ref.jpg', has_hood=False, size_span='XS&ndash;4XL', show_age=False,
    codes=['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL'],
    age_no=['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL'],
    age_en=['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL'],
    legg_opp=[80, 80, 88, 88, 88, 88, 96, 96], felt=[10, 10, 11, 11, 11, 11, 12, 12],
    ribbhoyde=['3 cm'] * 8,
    okn=[16, 17, 17, 18, 19, 20, 21, 22], final=[336, 352, 360, 376, 392, 408, 432, 448],
    okn_lengde=[22, 24, 24, 25, 26, 28, 29, 30],
    bredde=[99, 104, 106, 111, 115, 120, 127, 132], lengde=[62, 66, 68, 72, 75, 78, 82, 84],
    armapning=[28, 28, 31, 31, 33, 33, 35, 35],
    stopp=[60.5, 64.5, 66.5, 70.5, 73.5, 76.5, 80.5, 82.5], side_masker=[24, 24, 26, 26, 28, 28, 30, 30],
    kh1=[60, 64, 64, 68, 70, 74, 78, 82], kn1=[108, 112, 116, 120, 126, 130, 138, 142],
    kn2=[228, 240, 244, 256, 266, 278, 294, 306], kh2=[276, 288, 296, 308, 322, 334, 354, 366],
    mengde=[450, 450, 500, 500, 550, 550, 600, 600], noster=[9, 9, 10, 10, 11, 11, 12, 12],
)
BABY = dict(
    slug='baby', title_no='TIL BABY, MED HETTE', title_en='FOR BABY, WITH HOOD',
    photo='poncho_baby_ref.jpg', has_hood=True,
    codes=['50', '56', '62', '68', '74', '80', '86', '92'],
    age_no=['nyfødt', '0&ndash;1 mnd', '1&ndash;3 mnd', '3&ndash;6 mnd', '6&ndash;9 mnd', '9&ndash;12 mnd',
            '12&ndash;18 mnd', '18&ndash;24 mnd'],
    age_en=['newborn', '0&ndash;1 mo', '1&ndash;3 mo', '3&ndash;6 mo', '6&ndash;9 mo', '9&ndash;12 mo',
            '12&ndash;18 mo', '18&ndash;24 mo'],
    legg_opp=[56, 56, 64, 64, 64, 72, 72, 72], felt=[7, 7, 8, 8, 8, 9, 9, 9],
    ribbhoyde=['2 cm', '2 cm', '2 cm', '2 cm', '2.5 cm', '2.5 cm', '2.5 cm', '2.5 cm'],
    okn=[6, 6, 6, 7, 8, 9, 10, 11], final=[152, 152, 160, 176, 192, 216, 232, 248],
    okn_lengde=[7, 7, 8, 9, 10, 11, 12, 13],
    bredde=[45, 45, 47, 52, 56, 64, 68, 73], lengde=[20, 22, 24, 27, 30, 33, 36, 39],
    hette=[16, 17, 18, 19, 20, 21, 22, 23],
    gjenta=[2, 2, 3, 3, 4, 4, 5, 5],
    armapning=[None] * 8, stopp=[18.5, 20.5, 22.5, 25.5, 28.5, 31.5, 34.5, 37.5],
    side_masker=[8, 9, 10, 11, 12, 13, 14, 15],
    kh1=[30, 29, 30, 33, 36, 41, 44, 47], kn1=[46, 47, 50, 55, 60, 67, 72, 77],
    kn2=[106, 105, 110, 121, 132, 149, 160, 171], kh2=[122, 123, 130, 143, 156, 175, 188, 201],
    mengde=[100, 100, 150, 150, 200, 200, 250, 250], noster=[2, 2, 3, 3, 4, 4, 5, 5],
)


def build(kind):
    codes = kind['codes']
    n = len(codes)
    size_span = kind.get('size_span', codes[0] + '&ndash;' + codes[-1])
    show_age = kind.get('show_age', True)

    def build_lang(LANG):
        def L(no, en): return en if LANG == 'en' else no
        right = L('LME STRIKK', 'LME KNIT')
        title_no = 'LME MINI & ME PONCHO'
        title_en = 'LME MINI & ME PONCHO'
        sub_title = kind['title_no'] if LANG == 'no' else kind['title_en']
        ph2 = L('LME STRIKKEOPPSKRIFT&nbsp;&nbsp;|&nbsp;&nbsp;MINI &amp; ME PONCHO ' + kind['title_no'],
                'LME KNITTING PATTERN&nbsp;&nbsp;|&nbsp;&nbsp;MINI &amp; ME PONCHO ' + kind['title_en'])
        ph = make_page(ph2, right)
        pages = []
        pnum = [0]
        def add(body):
            pnum[0] += 1
            pages.append(ph(body, pnum[0]))

        # ---------- cover ----------
        alt = kind['title_no'] if LANG == 'no' else kind['title_en']
        if kind['photo']:
            cover_media = f'<div class="coverimg"><img src="{photo_src(kind["photo"])}" alt="{alt}"></div>'
        else:
            cover_media = '<div class="coverimg" style="padding:4mm 0;">' + hood_schematic(L) + '</div>'

        intro_no = ('En myk og lettstrikket babyponcho med hette. Selve ponchoen strikkes rundt ovenfra og '
                     'ned som ett sammenhengende stykke, akkurat som barne- og voksenversjonen: med åtte '
                     'jevne økningslinjer, sammenhengende i-cordkant og én knepping i hver side. Til slutt '
                     'plukkes masker opp langs halsen, og hetten strikkes rett på, fram og tilbake. Ingen '
                     'løse snorer og ingen separate deler som skal sys på.' if kind['has_hood'] else
                     'En lettstrikket poncho med lav ribbehals og rund økningsdel. Hele plagget strikkes '
                     'rundt ovenfra og ned som ett sammenhengende stykke. Ingen splitt og ingen sammensying. '
                     'Ponchoen avsluttes med en sammenhengende i-cordkant og én knepping i hver side.')
        intro_en = ('A soft, easy-knit baby poncho with a hood. The poncho itself is knitted in the round '
                     'from the top down as one continuous piece, exactly like the kids&rsquo; and adult '
                     'versions: with eight even increase lines, a continuous i-cord edge and one fastening '
                     'on each side. At the end, stitches are picked up along the neckline and the hood is '
                     'knitted straight on, back and forth. No loose ties and no separate pieces to sew on.'
                     if kind['has_hood'] else
                     'An easy-knit poncho with a low ribbed neckline and a round increase section. The whole '
                     'garment is knitted in the round from the top down as one continuous piece. No splits '
                     'and no seaming. The poncho finishes with a continuous i-cord edge and one fastening on '
                     'each side.')

        add(
            cover_media
            + f'<div class="covertag">{L("LME STRIKKEOPPSKRIFT", "LME KNITTING PATTERN")}</div>'
            + '<div class="coverbanner">'
            + f'<h1 class="covertitle">LME MINI &amp; ME PONCHO<br>{sub_title}</h1>'
            + '</div>'
            + f'<div class="subpill">{L("STR. " + size_span, "SIZE " + size_span)}</div>'
            + card(pc(intro_no, intro_en, L))
            + byline(L('Av Renate Dahl', 'By Renate Dahl'))
            + tip(L('Les hele oppskriften én gang før du legger opp. Strikk alltid en prøvelapp først, se side 3.',
                    'Read the whole pattern once before you cast on. Always knit a gauge swatch first, see page 3.'))
        )

        # ---------- før du begynner ----------
        laer_no = ['å strikke en lav, myk ribbehals i 1 rett, 1 vrang', 'å strikke rundt på rundpinne',
                    'å øke jevnt i åtte felt', 'å lage et enkelt knapphull i hver side',
                    'å felle av med i-cord rundt hele nederkanten']
        if kind['has_hood']:
            laer_no.append('å plukke opp masker langs halsen og strikke en enkel hette rett på')
        laer_en = ['to knit a low, soft ribbed neckline in 1 knit, 1 purl', 'to knit in the round on a circular needle',
                   'to increase evenly in eight sections', 'to make a simple buttonhole on each side',
                   'to bind off with i-cord all round the hem']
        if kind['has_hood']:
            laer_en.append('to pick up stitches along the neckline and knit a simple hood straight on')
        intro2_no = ('Først strikkes en lav, myk ribbehals. Deretter formes ponchoen rundt med åtte jevne '
                     'økningslinjer. Etter siste økning strikkes videre rundt til nederkanten. Til slutt '
                     'plukkes masker opp langs halsen, og hetten strikkes fram og tilbake direkte på plagget.'
                     if kind['has_hood'] else
                     'Ponchoen strikkes rundt fra halsen til nederkanten. Åtte jevne økningslinjer former den '
                     'runde fasongen. Etter siste økning strikkes alle maskene videre rundt uten annen forming. '
                     'Knapphullene lages på den bakre delen av det samme runde stykket, rett over nederkanten. '
                     'Knappene sys på den fremre delen.')
        intro2_en = ('First a low, soft ribbed neckline is knitted. Then the poncho is shaped in the round '
                     'with eight even increase lines. After the last increase, knitting continues in the '
                     'round to the hem. At the end, stitches are picked up along the neckline, and the hood '
                     'is knitted back and forth straight onto the garment.' if kind['has_hood'] else
                     'The poncho is knitted in the round from the neckline to the hem. Eight even increase '
                     'lines shape the round silhouette. After the last increase, all stitches are knitted '
                     'plain in the round with no further shaping. The buttonholes are made on the back part '
                     'of the same round piece, right above the hem. The buttons are sewn on the front part.')

        add(
            banner(L('FØR DU BEGYNNER', 'BEFORE YOU START'))
            + p(intro2_no, intro2_en, L)
            + tealp(L('DETTE LÆRER DU', 'WHAT YOU LEARN'))
            + card(ul([L(a, b) for a, b in zip(laer_no, laer_en)]))
            + pink(L('HVOR VANSKELIG ER DET?', 'HOW HARD IS IT?'))
            + card(p('Lett til litt øvet. Du bør kunne legge opp masker, strikke rett og vrang og strikke '
                     'rundt. Økning, knapphull og i-cordavfelling forklares steg for steg.' +
                     (' Hettefellingen og sammenstrikkingen i toppen forklares også steg for steg.' if kind['has_hood'] else ''),
                     'Easy to a little practised. You should be able to cast on, knit and purl, and knit in '
                     'the round. Increases, buttonholes and i-cord bind-off are explained step by step.' +
                     (' The hood shaping and joining the top are also explained step by step.' if kind['has_hood'] else ''), L))
            + ctitle('Ett steg om gangen, så blir det poncho til slutt.',
                     'One step at a time, and in the end you have a poncho.', L)
        )

        # ---------- dette trenger du ----------
        yarn_rows = ''.join(
            f'<tr><td><b>{c}</b></td><td>{m} g</td><td>{ns}</td></tr>'
            for c, m, ns in zip(codes, kind['mengde'], kind['noster']))
        needle_items_no = (['rundpinne 4,5 mm, 40 cm, til halsen',
                             'rundpinne 5 mm, 60&ndash;100 cm, til ponchoen og hetten',
                             'eventuelt strømpepinner eller magic loop'] if kind['has_hood'] else
                            ['rundpinne 4,5 mm, 40&ndash;60 cm, til halsen',
                             'rundpinne 5 mm, 80&ndash;120 cm, til resten av ponchoen'])
        needle_items_en = (['4.5 mm circular needle, 40 cm, for the neckline',
                             '5 mm circular needle, 60&ndash;100 cm, for the poncho and the hood',
                             'double-pointed needles or magic loop, if you prefer'] if kind['has_hood'] else
                            ['4.5 mm circular needle, 40&ndash;60 cm, for the neckline',
                             '5 mm circular needle, 80&ndash;120 cm, for the rest of the poncho'])
        button_no = '2 flate knapper, ca. 15&ndash;18 mm, sydd svært godt fast' if kind['has_hood'] else '2 flate knapper, ca. 18&ndash;25 mm'
        button_en = '2 flat buttons, approx. 15&ndash;18 mm, sewn on very securely' if kind['has_hood'] else '2 flat buttons, approx. 18&ndash;25 mm'
        add(
            banner(L('DETTE TRENGER DU', 'WHAT YOU NEED'))
            + tealp(L('GARN', 'YARN'))
            + card(p('DROPS Air (65 % alpakka, 28 % polyamid, 7 % ull, 50 g = ca. 150 m). Ponchoen strikkes '
                     'med én tråd.',
                     'DROPS Air (65% alpaca, 28% polyamide, 7% wool, 50 g = approx. 150 m). The poncho is '
                     'knitted with one strand.', L)
                   + '<table class="t"><tr><th>' + L('Str.', 'Size') + '</th><th>' + L('Mengde', 'Amount')
                   + '</th><th>' + L('Nøster', 'Skeins') + '</th></tr>' + yarn_rows + '</table>')
            + pink(L('PINNER OG UTSTYR', 'NEEDLES AND KIT'))
            + card(ul([L(a, b) for a, b in zip(needle_items_no, needle_items_en)] + [
                L('8 maskemarkører og 4 avtakbare markører', '8 stitch markers and 4 removable markers'),
                L(button_no, button_en),
                L('stoppenål og målebånd', 'tapestry needle and tape measure'),
            ]))
            + tealp(L('STRIKKEFASTHET', 'GAUGE'))
            + card(p('17 masker og 22 omganger glattstrikk = 10 &times; 10 cm på pinne 5 mm etter vask og '
                     'tørk. Strikk en prøvelapp. Bytt pinne dersom fastheten ikke stemmer.',
                     '17 stitches and 22 rows in stockinette = 10 &times; 10 cm on 5 mm needles after washing '
                     'and drying. Knit a swatch. Change needle size if your gauge does not match.', L))
        )

        # ---------- størrelser og mål ----------
        size_rows = []
        for i in range(n):
            row = [codes[i]]
            if show_age:
                row.append(kind['age_no'][i] if LANG == 'no' else kind['age_en'][i])
            row += [str(kind['final'][i]), f'ca. {kind["bredde"][i]} cm', f'ca. {kind["lengde"][i]} cm']
            if kind['has_hood']:
                row.append(f'ca. {kind["hette"][i]} cm')
            else:
                row.append(f'ca. {kind["armapning"][i]} cm')
            size_rows.append(row)
        header = [L('Str.', 'Size')] + ([L('Alder', 'Age')] if show_age else []) + \
                 [L('Masker', 'Stitches'), L('Bredde', 'Width'),
                  L('Lengde', 'Length')] + [L('Hette', 'Hood') if kind['has_hood'] else L('Armåpning', 'Arm opening')]
        lengde_note_no = ('Størrelsene følger barnets kroppslengde. Hel lengde måles fra halskanten til '
                           'nederkanten. Bredde måles flatt tvers over den uknappede ponchoen. Hettehøyden '
                           'måles fra halskanten til toppen.' if kind['has_hood'] else
                           'Hel lengde måles fra øverst på halskanten til nederkanten.')
        lengde_note_en = ('Sizes follow the child&rsquo;s body length. Full length is measured from the '
                           'neckline to the hem. Width is measured flat across the unbuttoned poncho. Hood '
                           'height is measured from the neckline to the top.' if kind['has_hood'] else
                           'Full length is measured from the top of the neckline to the hem.')
        add(
            banner(L('STØRRELSER OG MÅL', 'SIZES AND MEASUREMENTS'))
            + tealp(L('FRA NYFØDT TIL 2 ÅR', 'FROM NEWBORN TO 2 YEARS') if kind['has_hood'] else
                    L('HVILKEN STØRRELSE?', 'WHICH SIZE?'))
            + card(p('Velg først etter alder eller vanlig størrelse. Ponchoen har god bevegelsesvidde. ' +
                     lengde_note_no,
                     'Choose first by age or usual size. The poncho has plenty of ease. ' + lengde_note_en, L))
            + sizetable(header, size_rows)
            + (pink(L('SIKKERHET FOR BABY', 'SAFETY FOR BABY')) + card(check([
                   L('Hetten har ingen snorer eller dusker.', 'The hood has no ties or tassels.'),
                   L('Knapper skal sys ekstra godt fast og kontrolleres før hver bruk.',
                     'Buttons must be sewn on extra securely and checked before every use.'),
                   L('Plagget skal ikke brukes under søvn eller uten tilsyn.',
                     'The garment should not be used during sleep or unsupervised.'),
                   L('Ta av ponchoen i bilstol og andre selesystemer.',
                     'Take the poncho off in a car seat and other harness systems.'),
                   L('Pass på at hette og hals aldri dekker barnets ansikt.',
                     'Make sure the hood and neckline never cover the child&rsquo;s face.'),
               ])) if kind['has_hood'] else
               pink(L('VIKTIG OM KONSTRUKSJONEN', 'IMPORTANT ABOUT THE CONSTRUCTION'))
               + card(p('Alle størrelsene strikkes som ett rundt stykke. Det er ingen sideåpning som klippes '
                        'eller strikkes separat. Armåpningen dannes først når et punkt på fremre del kneppes '
                        'til et punkt på bakre del i hver side.',
                        'All sizes are knitted as one round piece. There is no side opening that is cut or '
                        'knitted separately. The arm opening is only formed once a point on the front part is '
                        'buttoned to a point on the back part on each side.', L)))
            + ctitle('Prøv ponchoen underveis. Lengden kan enkelt justeres før knapphullene strikkes.',
                     'Try the poncho on as you go. The length can easily be adjusted before the buttonholes '
                     'are knitted.', L)
        )

        # ---------- teknikker / hette eller hals ----------
        ordliste_rows_no = [
            ('m', 'maske'), ('omg', 'omgang'), ('r / vr', 'rett / vrang'),
            ('øke 1, venstrehellende', 'stikk venstre pinne inn forfra under tråden mellom to masker og '
                                       'strikk den vridd, gjennom bakre maskeledd'),
            ('øke 1, høyrehellende', 'stikk venstre pinne inn bakfra under tråden mellom to masker og '
                                      'strikk den gjennom fremre maskeledd, ikke vridd'),
            ('glattstrikk rundt', 'alle masker strikkes rett'), ('i-cord', 'smal strikket snorkant'),
        ]
        ordliste_rows_en = [
            ('st', 'stitch'), ('rnd', 'round'), ('k / p', 'knit / purl'),
            ('inc 1, leaning left', 'insert the left needle from the front under the strand between two '
                                     'stitches and knit it twisted, through the back loop'),
            ('inc 1, leaning right', 'insert the left needle from the back under the strand between two '
                                      'stitches and knit it through the front loop, not twisted'),
            ('stockinette in the round', 'all stitches knitted plain'), ('i-cord', 'narrow knitted cord edge'),
        ]
        ord_html = '<table class="t tl"><tr><th>' + L('Ord', 'Term') + '</th><th>' + L('Betyr', 'Means') + '</th></tr>'
        for (a, b), (a2, b2) in zip(ordliste_rows_no, ordliste_rows_en):
            ord_html += f'<tr><td><b>{L(a, a2)}</b></td><td>{L(b, b2)}</td></tr>'
        ord_html += '</table>'

        legg_rows = [[c, f'{lo} m', rh] for c, lo, rh in zip(codes, kind['legg_opp'], kind['ribbhoyde'])]
        add(
            banner(L('TEKNIKKER OG HALS', 'TECHNIQUES AND NECKLINE'))
            + tealp(L('ORDLISTE', 'GLOSSARY'))
            + card(ord_html)
            + pink(L('1 &ndash; HALS', '1 &ndash; NECKLINE'))
            + card(p('Legg opp på rundpinne 4,5 mm:', 'Cast on with the 4.5 mm circular needle:', L)
                   + sizetable([L('Str.', 'Size'), L('Legg opp', 'Cast on'), L('Ribbhøyde', 'Rib height')], legg_rows)
                   + p('Sett sammen til en omgang uten å vri arbeidet. Sett en tydelig omgangsmarkør midt '
                       'bak. Strikk *1 rett, 1 vrang* rundt til halsen har oppgitt høyde. Bytt til pinne '
                       '5 mm og strikk 1 omgang rett.',
                       'Join in the round without twisting the work. Place a clear round marker at centre '
                       'back. Knit *1 knit, 1 purl* in the round until the neckline has the given height. '
                       'Switch to the 5 mm needle and knit 1 plain round.', L))
        )

        # ---------- rund økningsdel ----------
        felt_rows = [[c, f] for c, f in zip(codes, kind['felt'])]
        okn_rows = [[c, o, str(f), f'ca. {ol} cm'] for c, o, f, ol in
                    zip(codes, kind['okn'], kind['final'], kind['okn_lengde'])]
        add(
            banner(L('RUND ØKNINGSDEL', 'ROUND INCREASE SECTION'))
            + tealp(L('2 &ndash; PLASSER MARKØRENE', '2 &ndash; PLACE THE MARKERS'))
            + card(p('Del maskene inn i 8 like felt med markører. Omgangsmarkøren er også første '
                       'økningsmarkør.',
                       'Divide the stitches into 8 equal sections with markers. The round marker is also '
                       'the first increase marker.', L)
                   + sizetable([L('Str.', 'Size'), L('Masker i hvert felt', 'Stitches per section')], felt_rows))
        )
        add(
            banner(L('ØKNINGSOMGANG', 'INCREASE ROUND'))
            + pink(L('3 &ndash; ØKNINGSOMGANG', '3 &ndash; INCREASE ROUND'))
            + card(p('*Strikk til 1 maske før markøren. Øk 1 maske som heller mot venstre. Flytt markøren '
                     'over. Øk 1 maske som heller mot høyre.* Gjenta ved alle 8 markører. Det økes 16 '
                     'masker.',
                     '*Knit to 1 stitch before the marker. Increase 1 stitch leaning left. Move the marker '
                     'over. Increase 1 stitch leaning right.* Repeat at all 8 markers. This increases 16 '
                     'stitches.', L)
                   + p('Strikk deretter 1 hel omgang rett uten økninger. Gjenta disse to omgangene til '
                       'riktig masketall er nådd:',
                       'Then knit 1 whole round plain with no increases. Repeat these two rounds until the '
                       'right stitch count is reached:', L)
                   + sizetable([L('Str.', 'Size'), L('Økningsomganger', 'Increase rounds'),
                                L('Masker etter økning', 'Stitches after increases'), L('Ca. lengde', 'Approx. length')],
                               okn_rows))
            + tip(L('Slik økes det: Til en maske som heller mot venstre, stikk venstre pinne inn forfra '
                    'under tråden mellom to masker og strikk den vridd, gjennom bakre maskeledd. Til en '
                    'maske som heller mot høyre, stikk venstre pinne inn bakfra under tråden mellom to '
                    'masker og strikk den gjennom fremre maskeledd, ikke vridd. Da heller de to nye '
                    'maskene bort fra hverandre, og du får en fin, symmetrisk linje ut fra hver markør.',
                    'How to increase: For a stitch leaning left, insert the left needle from the front '
                    'under the strand between two stitches and knit it twisted, through the back loop. For '
                    'a stitch leaning right, insert the left needle from the back under the strand between '
                    'two stitches and knit it through the front loop, not twisted. The two new stitches '
                    'then lean away from each other, giving a neat, symmetrical line out from each '
                    'marker.'))
            + ctitle('Kontrollpunkt: Riktig masketall er viktigst. Hvis høyden avviker, strikker du videre '
                     'uten økninger til arbeidet har oppgitt lengde.',
                     'Checkpoint: The right stitch count matters most. If the height is off, keep knitting '
                     'with no increases until the work has the given length.', L)
        )

        # ---------- strikk videre rundt / sideknepping ----------
        stopp_rows = [[c, f'{s} cm'] for c, s in zip(codes, kind['stopp'])]
        side_rows = [[c, m] for c, m in zip(codes, kind['side_masker'])]
        add(
            banner(L('STRIKK VIDERE RUNDT', 'KNIT ON IN THE ROUND'))
            + tealp(L('4 &ndash; HELE PONCHOEN', '4 &ndash; THE WHOLE PONCHO'))
            + card(p('Fjern de 7 vanlige økningsmarkørene, men behold omgangsmarkøren midt bak. Strikk alle '
                     'maskene rett rundt uten flere økninger. Fortsett til arbeidet måler ca. 1,5 cm mindre '
                     'enn oppgitt hel lengde.',
                     'Remove the 7 ordinary increase markers, but keep the round marker at centre back. Knit '
                     'all stitches plain in the round with no more increases. Continue until the work measures '
                     'approx. 1.5 cm less than the given full length.', L)
                   + sizetable([L('Str.', 'Size'), L('Stopp ved', 'Stop at')], stopp_rows))
        )
        add(
            banner(L('SIDEKNEPPING', 'SIDE FASTENING'))
            + pink(L('5 &ndash; SIDEKNEPPING', '5 &ndash; SIDE FASTENING'))
            + card(p('Legg arbeidet flatt med omgangsmarkøren midt bak. Finn midten av hver side.',
                     'Lay the work flat with the round marker at centre back. Find the middle of each side.', L)
                   + p('Tell oppgitt antall masker fra sidemidt mot fronten og sett en markør til knappen. '
                       'Tell samme antall masker mot ryggen og sett en markør til knapphullet.',
                       'Count the given number of stitches from the side middle towards the front and place a '
                       'marker for the button. Count the same number of stitches towards the back and place a '
                       'marker for the buttonhole.', L)
                   + sizetable([L('Str.', 'Size'), L('Masker', 'Stitches')], side_rows))
            + ctitle('Arbeidet er fortsatt én hel, ubrutt sirkel. Ingenting deles.',
                     'The work is still one whole, unbroken circle. Nothing is split.', L)
        )

        # ---------- knapphull og i-cord ----------
        plass_rows = []
        for i in range(n):
            plass_rows.append([codes[i], kind['kh1'][i], kind['kn1'][i], kind['kn2'][i], kind['kh2'][i]])
        add(
            banner(L('KNAPPHULL OG I-CORDKANT', 'BUTTONHOLE AND I-CORD EDGE'))
            + tealp(L('PLASSERING FRA MIDT BAK', 'PLACEMENT FROM CENTRE BACK'))
            + card(sizetable([L('Punkt', 'Point'), 'Knapphull 1', 'Knapp 1', 'Knapp 2', 'Knapphull 2'], plass_rows))
            + pink(L('6 &ndash; KNAPPHULL', '6 &ndash; BUTTONHOLE'))
            + card(p('Strikk til første knapphullsmarkør: 1 kast, 2 rett sammen. Strikk til neste '
                     'knapphullsmarkør og gjenta. Strikk omgangen ferdig. Strikk deretter 1 hel omgang rett, '
                     'også over kastene.',
                     'Knit to the first buttonhole marker: yarn over, k2tog. Knit to the next buttonhole '
                     'marker and repeat. Finish the round. Then knit 1 whole plain round, also across the '
                     'yarn overs.', L))
            + tealp(L('7 &ndash; I-CORDKANT', '7 &ndash; I-CORD EDGE'))
            + card(p('Legg opp 3 nye masker på venstre pinne. Strikk 2 rett. Strikk neste i-cordmaske og '
                     'neste maske fra ponchoen vridd rett sammen. Flytt de 3 maskene tilbake uten å snu. '
                     'Gjenta rundt hele nederkanten. Sy begynnelsen og slutten pent sammen.',
                     'Cast on 3 new stitches on the left needle. Knit 2. Knit the next i-cord stitch together '
                     'with the next poncho stitch through the back loop. Slide the 3 stitches back without '
                     'turning. Repeat all round the hem. Sew the beginning and end neatly together.', L))
            + ctitle('I-cordkanten går sammenhengende rundt hele ponchoen.',
                     'The i-cord edge runs continuously all round the poncho.', L)
        )

        # ---------- hetten (kun baby) ----------
        if kind['has_hood']:
            hette_pickup_rows = [[c, f'{lo} m'] for c, lo in zip(codes, kind['legg_opp'])]
            top_rows = [[c, L(f'{g} ganger', f'{g} times'), f'{hh} cm']
                        for c, g, hh in zip(codes, kind['gjenta'], kind['hette'])]
            add(
                banner(L('HETTEN', 'THE HOOD'))
                + tealp(L('8 &ndash; PLUKK OPP MASKER', '8 &ndash; PICK UP STITCHES'))
                + card(p('Begynn midt foran i halskanten med pinne 5 mm. Plukk opp 1 maske i hver '
                         'oppleggsmaskes ytterste ledd rundt hele halsen. Du skal ha samme masketall som '
                         'ved opplegg:',
                         'Start at centre front of the neckline with the 5 mm needle. Pick up 1 stitch in '
                         'the outer strand of every cast-on stitch all round the neckline. You should end up '
                         'with the same stitch count as your cast-on:', L)
                       + sizetable([L('Str.', 'Size'), L('Masker til hette', 'Stitches for hood')], hette_pickup_rows)
                       + p('Hetten strikkes nå fram og tilbake. Strikk de første og siste 4 maskene rett på '
                           'alle pinner. Mellom kantmaskene strikkes glattstrikk.',
                           'The hood is now knitted back and forth. Knit the first and last 4 stitches plain '
                           'on every row. Between the edge stitches, knit stockinette.', L))
                + pink(L('9 &ndash; FORM TOPPEN', '9 &ndash; SHAPE THE TOP'))
                + card(p('Sett en markør etter en fjerdedel av maskene og en markør etter tre fjerdedeler av '
                         'maskene. Strikk til hetten måler ca. 4 cm mindre enn ferdig høyde.',
                         'Place a marker after a quarter of the stitches, and a marker after three quarters '
                         'of the stitches. Knit until the hood measures approx. 4 cm less than the finished '
                         'height.', L)
                       + p('På neste pinne fra retten: *strikk til 2 masker før markøren, 2 rett sammen, '
                           'flytt markøren, ta 1 maske løst av, strikk 1 rett og trekk den løse maska over.* '
                           'Gjenta ved begge markørene. Det felles 4 masker. Gjenta denne pinnen på hver '
                           'rettside, antall ganger fra tabellen:',
                           'On the next right-side row: *knit to 2 stitches before the marker, k2tog, move '
                           'the marker, slip 1 stitch, knit 1, pass the slipped stitch over.* Repeat at both '
                           'markers. This decreases 4 stitches. Repeat this row on every right-side row, the '
                           'number of times given in the table:', L)
                       + sizetable([L('Str.', 'Size'), L('Gjenta på hver rettside', 'Repeat on every RS row'),
                                    L('Ferdig hettehøyde', 'Finished hood height')], top_rows))
            )

            add(
                banner(L('LUKK HETTEN', 'CLOSE THE HOOD'))
                + tealp(L('10 &ndash; TOPPSØM', '10 &ndash; TOP SEAM'))
                + card(p('Strikk videre uten felling til ferdig høyde. Fordel maskene likt på to pinner. '
                         'Brett hetten med rettsiden inn, slik at de to ansiktskantene ligger over hverandre. '
                         'Fell sammen toppen med 3-pinners avfelling. Fest tråden og vreng hetten tilbake.',
                         'Continue knitting with no more decreases until the finished height. Divide the '
                         'stitches evenly onto two needles. Fold the hood with right sides together, so the '
                         'two face-opening edges line up. Bind off the top together with a 3-needle bind-off. '
                         'Fasten off and turn the hood right side out again.', L))
                + ctitle('3-pinners avfelling: to masker strikkes sammen (én fra hver pinne) og felles av '
                         'samtidig, hele veien over.',
                         '3-needle bind-off: two stitches are knitted together (one from each needle) and '
                         'bound off at the same time, all the way across.', L)
            )

        # ---------- montering ----------
        knapp_step_no = 'SY I KNAPPENE' if kind['has_hood'] else 'KNAPPENE'
        knapp_num = '11' if kind['has_hood'] else '8'
        add(
            banner(L('MONTERING OG ETTERBEHANDLING', 'FINISHING'))
            + pink(L(knapp_num + ' &ndash; ' + knapp_step_no, knapp_num + ' &ndash; THE BUTTONS'))
            + card(p('Sy én knapp godt fast ved hver markør på fremre del, rett over i-cordkanten. Knepp '
                     'hver knapp gjennom knapphullet på bakre del i samme side. Bakre del ligger over fremre '
                     'del.' + (' Bruk sterk sytråd eller garnet dobbelt. Sy gjennom knapphullene mange ganger '
                     'og fest på vrangen. Kontroller at barnet ikke kan trekke knappen løs.' if kind['has_hood'] else
                     ' Fest tråder, vask forsiktig og tørk flatt.'),
                     'Sew one button on securely at each marker on the front part, right above the i-cord '
                     'edge. Button each one through the buttonhole on the back part on the same side. The '
                     'back part lies over the front part.' + (' Use strong sewing thread or double strands of '
                     'yarn. Sew through the buttonholes many times and fasten off on the wrong side. Check '
                     'that the child cannot pull the button loose.' if kind['has_hood'] else
                     ' Weave in ends, wash gently and dry flat.'), L))
            + tealp(L('ETTERBEHANDLING', 'FINISHING TOUCHES'))
            + card(check([
                L('Fest alle tråder på vrangen.', 'Weave in all ends on the wrong side.'),
                L('Legg plagget i lunkent vann med ullvaskemiddel. Ikke gni eller vri.',
                  'Soak the garment in lukewarm water with wool wash. Do not rub or wring.'),
                L('Klem ut vannet i et håndkle.' + (' Form hette, hals og nederkant, og tørk flatt.' if kind['has_hood'] else ' Tørk flatt til oppgitte mål.'),
                  'Press the water out in a towel.' + (' Shape the hood, neckline and hem, and dry flat.' if kind['has_hood'] else ' Dry flat to the given measurements.')),
                L('Kontroller knappene etter tørk' + (' og før hver bruk.' if kind['has_hood'] else '.') + ' Sy dem ekstra godt fast.',
                  'Check the buttons after drying' + (' and before every use.' if kind['has_hood'] else '.') + ' Sew them extra securely.'),
            ]))
            + (pink(L('VIKTIG', 'IMPORTANT')) + card(p(
                   'Dette er et ytterplagg for bruk under oppsyn. Barnet skal ikke sove med ponchoen eller '
                   'bruke den i bilstol. Hetten skal aldri dekke ansiktet. Fjern plagget straks dersom en '
                   'knapp eller tråd løsner.',
                   'This is an outer garment for supervised use. The child should not sleep in the poncho or '
                   'wear it in a car seat. The hood should never cover the face. Remove the garment '
                   'immediately if a button or thread comes loose.', L)) if kind['has_hood'] else '')
            + ctitle('Før oppskriften selges: alle størrelser må teststrikkes, måles etter vask og teknisk '
                     'kontrolleres.',
                     'Before this pattern is sold: every size must be test-knitted, measured after washing '
                     'and technically checked.', L)
            + '<div class="congrats">' + L('God strikkelyst!', 'Happy knitting!') + '</div>'
            + byline('Renate Dahl')
            + '<p class="copyright">' + L('&copy; 2026 Little Montessori Explorers. Oppskriften er kun til '
              'personlig bruk. Oppskriften kan ikke kopieres, deles, videreselges eller publiseres. Ferdige '
              'produkter kan selges i liten skala med kreditering til Little Montessori Explorers.',
              '&copy; 2026 Little Montessori Explorers. This pattern is for personal use only. The pattern '
              'may not be copied, shared, resold or published. Finished items may be sold on a small scale '
              'with credit to Little Montessori Explorers.') + '</p>'
        )

        title_tag = 'LME Mini & Me Poncho, ' + sub_title
        doc = ('<!DOCTYPE html><html lang="' + LANG + '"><head><meta charset="utf-8">'
               '<title>' + title_tag + '</title><style>' + css + '</style></head>'
               '<body>' + ''.join(pages) + '</body></html>')
        return doc

    slug = kind['slug']
    (BASE / f'poncho_{slug}_no.html').write_text(build_lang('no'), encoding='utf-8')
    (BASE / f'poncho_{slug}_en.html').write_text(build_lang('en'), encoding='utf-8')
    print('OK', slug)


if __name__ == '__main__':
    for k in (VOKSEN, BARN, BABY):
        build(k)
