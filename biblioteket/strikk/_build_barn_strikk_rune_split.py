# -*- coding: utf-8 -*-
"""Genererer 2 separate LME-strikkeoppskrifter (NORGE / NORWAY, hver for seg),
runehatt for baby og barn, gradert 50-170. Samme runeskrift-design (Norse-font
+ kjedesting) som den nye voksenoppskriften (norge-rune-bottehatt/build_rune_strikk.py),
samme byggeklosser som familien for øvrig (bølget, stripet brem, rett hoveddel,
felt topp), bare med kjedesting-broderi av bokstavene til slutt i stedet for
strikket-inn/grid-baserte bokstaver."""
import base64, html, pathlib

BASE = pathlib.Path(__file__).parent

RED, NAVY, WHITE, CREAM, INK, PINK, TEAL, CERISE = (
    '#C8102E', '#00205B', '#FFFFFF', '#F8F4EA', '#3f3f3f', '#df5f93', '#4aa7a4', '#E91E89')


def runeword(word, box=48, stroke=CREAM):
    fs = box * 1.30
    padx = box * 0.55; pady = box * 0.34
    lsp = box * 0.05
    txt = ("display:inline-block;font-family:'Norse';font-weight:700;color:" + stroke + ";"
           "font-size:" + f"{fs:.0f}" + "px;line-height:1.02;letter-spacing:" + f"{lsp:.0f}" + "px;white-space:nowrap;")
    wrap = ("display:inline-block;background:" + RED + ";border-radius:" + f"{box*0.30:.0f}" + "px;"
            "padding:" + f"{pady:.0f}" + "px " + f"{padx:.0f}" + "px;max-width:100%;")
    return '<div style="' + wrap + '"><span style="' + txt + '">' + word + '</span></div>'


def mini_flag(w=34):
    h = round(w * 10 / 13)
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 26 20" '
            f'style="width:{w}px;height:{h}px;border-radius:3px">'
            f'<rect width="26" height="20" fill="{RED}"/>'
            f'<rect x="6" width="6" height="20" fill="#fff"/><rect y="7" width="26" height="6" fill="#fff"/>'
            f'<rect x="7.5" width="3" height="20" fill="{NAVY}"/><rect y="8.5" width="26" height="3" fill="{NAVY}"/>'
            f'</svg>')


def vgrid(cols, rows, sw=34, sh=26, ox=10, oy=14, hi=None):
    out = []
    for r in range(rows):
        for c in range(cols):
            x = ox + c * sw; y = oy + r * sh
            wpath = (f'M{x+3},{y+sh-2} Q{x+sw*0.30},{y+sh*0.35} {x+sw/2},{y+2} '
                     f'Q{x+sw*0.70},{y+sh*0.35} {x+sw-3},{y+sh-2}')
            out.append(f'<path d="{wpath}" fill="none" stroke="#a30d24" stroke-width="7" stroke-linecap="round"/>')
            out.append(f'<path d="{wpath}" fill="none" stroke="{RED}" stroke-width="5" stroke-linecap="round"/>')
    if hi:
        c, r = hi
        x = ox + c * sw; y = oy + r * sh
        out.append(f'<rect x="{x-2}" y="{y-4}" width="{sw+4}" height="{sh+8}" rx="6" fill="none" stroke="{TEAL}" stroke-width="2.5" stroke-dasharray="5 4"/>')
    return ''.join(out)


def chainstitch_panels(L):
    def tag(cx, text, w=None):
        w = w or (len(text) * 6.3 + 14)
        x = cx - w / 2
        return (f'<rect x="{x}" y="6" width="{w}" height="17" rx="8.5" fill="#e9f6f5" '
                f'stroke="{TEAL}" stroke-width="1.5"/>'
                f'<text x="{cx}" y="18.4" text-anchor="middle" font-size="11" '
                f'font-family="sans-serif" font-weight="bold" fill="#2e8e8a">{html.escape(text)}</text>')
    panels = []
    g1 = vgrid(4, 3, hi=(1, 1))
    g1 += f'<circle cx="62" cy="60" r="6" fill="{TEAL}"/>'
    g1 += f'<path d="M62,86 L62,66" stroke="{TEAL}" stroke-width="3" marker-end="url(#at)"/>'
    g1 += tag(78, L('nål opp her', 'needle up here'))
    panels.append((1, L('Stikk nålen opp gjennom strikketøyet, der bokstaven skal begynne, langs streken på malen.',
                        'Bring the needle up through the knitting, where the letter is to begin, along the line on the template.'), g1))
    g2 = vgrid(4, 3, hi=(1, 1))
    g2 += f'<circle cx="62" cy="60" r="6" fill="none" stroke="{TEAL}" stroke-width="2.5"/>'
    g2 += (f'<path d="M62,60 Q80,42 96,60" fill="none" stroke="{CREAM}" stroke-width="5" stroke-linecap="round"/>')
    g2 += f'<circle cx="96" cy="60" r="4" fill="{TEAL}"/>'
    g2 += tag(78, L('løkke og hold', 'loop and hold'))
    panels.append((2, L('Legg en løkke av garnet foran nålen, hold den løst med tommelen, og stikk nålen ned igjen '
                        'et lite hakk lenger fram langs streken.',
                        'Lay a loop of yarn in front of the needle, hold it loosely with your thumb, and take the needle back down a small step further along the line.'), g2))
    g3 = vgrid(4, 3, hi=(1, 1))
    g3 += (f'<path d="M40,60 Q62,50 84,60 Q100,66 112,58" fill="none" stroke="{CREAM}" stroke-width="5" stroke-linecap="round"/>')
    g3 += f'<path d="M112,58 L120,50" stroke="{TEAL}" stroke-width="3" marker-end="url(#at)"/>'
    g3 += tag(78, L('gjenta langs streken', 'repeat along the line'))
    panels.append((3, L('Kom opp igjen inni løkka og dra til, akkurat stramt nok. Gjenta lenke for lenke langs hele '
                        'bokstaven, det kalles kjedesting.',
                        'Come back up inside the loop and pull snug, just tight enough. Repeat link after link along the whole letter, this is called chain stitch.'), g3))
    out = ['<div class="dsteps">']
    for n, txt, g in panels:
        out.append(f'''<div class="dstep">
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 156 124" style="width:100%">
    <defs><marker id="at" markerWidth="7" markerHeight="7" refX="3.5" refY="3.5" orient="auto">
      <path d="M0,0 L7,3.5 L0,7 z" fill="{TEAL}"/></marker></defs>
    <rect x="1" y="1" width="154" height="122" rx="10" fill="#fff" stroke="#f2bfd4" stroke-width="2"/>
    {g}
  </svg>
  <div class="dnum">{n}</div>
  <p>{txt}</p>
</div>''')
    out.append('</div>')
    return ''.join(out)


def make_page(ph2, right_label, logo_src):
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
def tip(text):
    return f'<div class="notecard"><span class="noteemo">&#129525;</span><p><i>TIPS: {text}</i></p></div>'
def byline(logo_src, name_line, company='Little Montessori Explorers', site='lmexplorers.com'):
    logo_html = f'<img class="logo" src="{logo_src}" alt="Little Montessori Explorers">' if logo_src else ''
    return f'''<div class="byline">
  {logo_html}
  <div class="by1">{name_line}</div>
  <div class="by2">{company}</div>
  <div class="by3">{site}</div>
</div>'''
def sizetable(header, rows):
    head = ''.join(f'<th>{h}</th>' for h in header)
    body = ''.join('<tr>' + ''.join(f'<td>{c}</td>' for c in r) + '</tr>' for r in rows)
    return f'<table class="t sz"><tr>{head}</tr>{body}</table>'
def p(no, en, L): return '<p>' + L(no, en) + '</p>'
def pc(no, en, L): return '<p class="center">' + L(no, en) + '</p>'
def ctitle(no, en, L): return cream('<p class="creamtitle">' + L(no, en) + '</p>')


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
STRIPES = ["2 rød, 1 hvit, 1 blå, 1 hvit, resten rød"] * 2 + \
          ["2 rød, 2 hvit, 2 blå, 1 hvit, resten rød"] * 3 + \
          ["3 rød, 2 hvit, 3 blå, 2 hvit, resten rød"] * 16
EN_AGE = ["0-1 mo", "1-2 mo", "2-4 mo", "4-6 mo", "6-9 mo", "9-12 mo", "12-18 mo", "18-24 mo", "2-3 yr", "3-4 yr",
          "4-5 yr", "5-6 yr", "6-7 yr", "7-8 yr", "8-9 yr", "9-10 yr", "10-11 yr", "11-12 yr", "12-13 yr", "13-14 yr", "14-16 yr"]
EN_STRIPES = ["2 red, 1 white, 1 blue, 1 white, rest red"] * 2 + \
             ["2 red, 2 white, 2 blue, 1 white, rest red"] * 3 + \
             ["3 red, 2 white, 3 blue, 2 white, rest red"] * 16
EN_OPPSETT_FELL = ["Dec 2 st", "Dec 5 st", "Dec 2 st", "Dec 5 st", "Dec 2 st", "Dec 5 st", "Dec 1 st", "Dec 4 st", "Dec 6 st", "Dec 1 st",
                    "Dec 2 st", "Dec 3 st", "Dec 4 st", "Dec 5 st", "Dec 5 st", "Dec 6 st", "No decrease", "Dec 1 st", "Dec 2 st", "Dec 3 st", "Dec 4 st"]

css = f'''
@font-face {{ font-family:'Norse'; src:url('fonts/Norse-Bold.otf'); font-weight:700; }}
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
.coverrune {{ text-align:center; margin:3mm 0; }}
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
.congrats {{ font-family:var(--font-head); font-weight:800; font-size:17pt; color:{INK}; text-align:center; margin:1.5mm 0 1mm; }}
.copyright {{ font-size:9.5pt; color:#9a9a9a; text-align:center; margin-top:1.5mm; line-height:1.25; }}
.cflag {{ line-height:0; }}
.dsteps {{ display:flex; gap:4mm; }}
.dstep {{ flex:1; text-align:center; position:relative; }}
.dstep p {{ font-size:11pt; line-height:1.3; margin-top:1.5mm; text-align:left; }}
.dnum {{ position:absolute; top:-2.5mm; left:-1.5mm; width:7mm; height:7mm; border-radius:50%; background:{PINK}; color:#fff; font-family:var(--font-head); font-weight:700; font-size:10.5pt; display:flex; align-items:center; justify-content:center; }}
'''

VARIANTS = [
    dict(slug='norge', box=44, word='NORGE'),
    dict(slug='norway', box=38, word='NORWAY'),
]


def build(v):
    slug = v['slug']; word = v['word']; box = v['box']
    out_dir = BASE / f'bottehatter-barn-strikk-rune-{slug}'
    PHOTO = out_dir / 'rune_strikk_barn_ref.jpg'
    LOGO = out_dir / 'lme-logo.png'
    photo_src = f'data:image/jpeg;base64,{base64.b64encode(PHOTO.read_bytes()).decode()}'
    logo_src = f'data:image/png;base64,{base64.b64encode(LOGO.read_bytes()).decode()}' if LOGO.exists() else ''

    def build_lang(LANG):
        def L(no, en): return en if LANG == 'en' else no
        right = L('LME STRIKK', 'LME KNIT')
        ph2 = L('LME STRIKKEOPPSKRIFT&nbsp;&nbsp;|&nbsp;&nbsp;' + word + '-RUNEHATT BARN',
                'LME KNITTING PATTERN&nbsp;&nbsp;|&nbsp;&nbsp;' + word + ' RUNE HAT KIDS')
        ph = make_page(ph2, right, logo_src)
        pages = []

        cover_alt = L(word + '-runehatt barn, strikket, rød med stripet brem', word + ' rune hat kids, knitted, red with striped brim')
        pages.append(ph((
            f'<div class="coverimg"><img src="{photo_src}" alt="{cover_alt}"></div>'
            + f'<div class="covertag">{L("LME STRIKKEOPPSKRIFT", "LME KNITTING PATTERN")}</div>'
            + '<div class="coverbanner">'
            + f'<div class="cflag">{mini_flag(34)}</div>'
            + f'<h1 class="covertitle">{word}-{L("RUNEHATT", "RUNE HAT")}<br>{L("TIL BABY OG BARN", "FOR BABY AND CHILD")}</h1>'
            + f'<div class="cflag">{mini_flag(34)}</div>'
            + '</div>'
            + f'<div class="subpill">{L("RØD MED RUNESTIL-BOKSTAVER &middot; STRIPET BREM &middot; STØRRELSE 50&ndash;170", "RED WITH RUNE-STYLE LETTERS &middot; STRIPED BRIM &middot; SIZE 50&ndash;170")}</div>'
            + card(pc(
                'Samme ' + word + '-runehatt som oppskriften for voksne: rød bomullshatt strikket rundt, med en stripet '
                'brem i rødt, hvitt og blått, og "' + word + '" i runeskrift brodert på med kjedesting, i én '
                'sammenhengende linje foran, pluss et lite norsk flagg på toppen. Gradert helt fra bunnen av til '
                'tjueen babyer-, barne- og ungdomsstørrelser, 50 til 170. Denne oppskriften er komplett i seg selv, '
                'du trenger ikke eie noen annen LME-oppskrift for å strikke den.',
                'The same ' + word + ' rune hat as the pattern for adults: a red cotton hat knitted in the round, with '
                'a striped brim in red, white and blue, and "' + word + '" in runes embroidered on with chain stitch, '
                'in one continuous line at the front, plus a little Norwegian flag on the top. Graded completely '
                'from scratch into twenty-one baby, child and teen sizes, 50 to 170. This pattern is complete on '
                'its own, you do not need any other LME pattern to knit it.', L))
            + byline(logo_src, L('Av Renate Dahl', 'By Renate Dahl'))
            + tip(L('Les hele oppskriften én gang før du legger opp. Strikk alltid en prøvelapp først, se side 4.',
                     'Read the whole pattern once before you cast on. Always knit a gauge swatch first, see page 4.'))
        ), 1))

        pages.append(ph((
            banner(L('FØR DU BEGYNNER', 'BEFORE YOU START'))
            + p('Bøttehatten strikkes rundt på rundpinne eller strømpepinner, nedenfra og opp, i rødt. Du strikker '
                'først en stripet brem som bølger nedover, deretter hoveddelen rett opp, og til slutt felles toppen '
                'ned til en liten rundet topp. Helt til slutt broderer du "' + word + '" og flagget på med kjedesting.',
                'The bucket hat is knitted in the round on a circular needle or double-pointed needles, from the '
                'bottom up, in red. You start with a striped brim that flares, then the main body straight up, and '
                'finally decrease the crown down to a small rounded top. Right at the end you embroider "' + word +
                '" and the flag on with chain stitch.', L)
            + tealp(L('DETTE LÆRER DU', 'WHAT YOU LEARN'))
            + card(ul([
                L('Å strikke en lue/hatt rundt på rundpinne eller strømpepinner', 'To knit a hat in the round on a circular needle or double-pointed needles'),
                L('Å strikke en stripet, bølget brem med en sammenstrikkingsomgang', 'To knit a striped, flared brim with a decrease round'),
                L('Å brodere runestil-bokstaver med kjedesting, etter en skriftmal', 'To embroider rune-style letters with chain stitch, following a font template'),
                L('Å felle en rundet topp jevnt ned til få masker', 'To decrease a rounded crown evenly down to a few stitches'),
            ]))
            + pink(L('HVOR VANSKELIG ER DET?', 'HOW HARD IS IT?'))
            + card(p('Nybegynnervennlig. Du bør kunne legge opp, strikke glattstrikk rundt og bytte farge. Selve '
                     'hatten strikkes i kun rødt (pluss stripene i bremmen), bokstavene kommer på etterpå med nål '
                     'og tråd, og alt er forklart trinn for trinn.',
                     'Beginner friendly. You should be able to cast on, knit stockinette in the round and change '
                     'colour. The hat itself is knitted in just red (plus the brim stripes), the letters come on '
                     'afterwards with a needle and thread, and every step is spelled out in this pattern.', L))
            + ctitle('Bruk strømpepinner eller magic loop på de minste størrelsene (50&ndash;86). En vanlig '
                     'rundpinne er ofte for lang til at maskene når rundt.',
                     'Use double-pointed needles or magic loop for the smallest sizes (50&ndash;86). An ordinary '
                     'circular needle is often too long for the stitches to reach round.', L)
        ), 2))

        pages.append(ph((
            banner(L('STØRRELSER OG RIKTIG PASSFORM', 'SIZES AND GETTING THE FIT RIGHT'))
            + p('Klesstørrelsen er bare en veiledning. Mål alltid rundt barnets hode, over ørene og øyenbrynene. '
                'Velg etter hodemålet dersom målet og klesstørrelsen peker mot ulike størrelser.',
                'The clothing size is only a guide. Always measure around the child&rsquo;s head, above the ears '
                'and eyebrows. Go by the head measurement if it and the clothing size point to different sizes.', L)
            + sizetable([L('Str.', 'Size'), L('Ca. alder', 'Approx. age'), L('Hodemål (cm)', 'Head (cm)')],
                        list(zip(SIZES, AGE if LANG == 'no' else EN_AGE, HEAD)))
            + tealp(L('SIKKER BRUK FOR DE MINSTE', 'SAFE USE FOR THE YOUNGEST'))
            + card(p('Hatten er et plagg for våken bruk under tilsyn. Den skal ikke brukes under søvn, i seng, i '
                     'vogn uten oppsyn, eller dersom bremmen dekker øyne, nese eller munn. Kontroller alltid at '
                     'ingen løse tråder eller lange flotter på innsiden kan hekte seg fast i fingre.',
                     'The hat is a garment for supervised, awake use. It should not be used during sleep, in a '
                     'cot, in a pram unattended, or if the brim covers the eyes, nose or mouth. Always check that '
                     'no loose threads or long floats on the inside can catch on little fingers.', L))
            + ctitle('Barn vokser ulikt. Faktisk hodemål går alltid foran alder, mål på nytt hver gang du er usikker.',
                     'Children grow at different rates. The actual head measurement always beats age, measure '
                     'again whenever you are unsure.', L)
        ), 3))

        yarn_table = (
            '<table class="t"><tr><th>' + L('Farge', 'Colour') + '</th><th>' + L('Bruk', 'Use') + '</th></tr>'
            + f'<tr><td><span class="dot" style="background:{RED}"></span> ' + L('Rød', 'Red') + '</td><td>' + L('hovedfarge, hele hatten', 'main colour, whole hat') + '</td></tr>'
            + f'<tr><td><span class="dot" style="background:{WHITE};border-color:#ccc;"></span> ' + L('Hvit', 'White') + '</td><td>' + L('striper i bremmen', 'stripes in the brim') + '</td></tr>'
            + f'<tr><td><span class="dot" style="background:{NAVY}"></span> ' + L('Marineblå', 'Navy') + '</td><td>' + L('striper i bremmen, flagget', 'stripes in the brim, the flag') + '</td></tr></table>')
        pages.append(ph((
            banner(L('DETTE TRENGER DU', 'WHAT YOU NEED'))
            + tealp(L('GARN', 'YARN'))
            + card(p('Et glatt bomullsgarn (aran/tykkelse 4) som gir 17 masker x 22 omganger glattstrikk = 10 x 10 cm '
                     'på pinne 5 mm. Reynolds Saucy, Rico Design Creative Cotton Aran og Hobbii Amigo er alle gode '
                     'valg, i rødt, hvitt og marineblått.',
                     'A smooth cotton yarn (aran weight) that gives 17 stitches x 22 rounds in stockinette = 10 x '
                     '10 cm on 5 mm needles. Reynolds Saucy, Rico Design Creative Cotton Aran and Hobbii Amigo are '
                     'all good choices, in red, white and navy.', L) + yarn_table
                  + '<p class="small">' + L('Ha rikelig av rød hovedfarge (nesten hele hatten) og ett lite nøste hver av hvitt og marineblått, de brukes bare i bremmen.',
                                             'Have plenty of red main colour (almost the whole hat) and one small ball each of white and navy, they are only used in the brim.') + '</p>')
            + pink(L('PINNER OG UTSTYR', 'NEEDLES AND KIT'))
            + card(ul([
                L('Rundpinne 5 mm, 40 cm, eller strømpepinner/magic loop-sett 5 mm', '5 mm circular needle, 40 cm, or 5 mm double-pointed needles/magic loop set'),
                L('<b>Stoppenål med butt spiss</b> til broderiet', '<b>Tapestry needle with a blunt tip</b> for the embroidery'),
                L('Saks og målebånd', 'Scissors and tape measure'),
                L('Maskemarkør (valgfritt, for å holde styr på midt foran)', 'Stitch marker (optional, to track centre front)'),
            ]))
            + ctitle('Strikker du fast, prøv pinne 5,5 mm. Strikker du løst, prøv 4,5 mm. Målet er alltid 17 masker på 10 cm.',
                     'If you knit tightly, try 5.5 mm needles. If you knit loosely, try 4.5 mm. The target is always 17 stitches over 10 cm.', L)
        ), 4))

        pages.append(ph((
            banner(L('STRIKKEFASTHET, DEN VIKTIGE NØKKELEN', 'GAUGE, THE SECRET KEY'))
            + tealp(L('STRIKK EN PRØVELAPP FØRST', 'KNIT A SWATCH FIRST'))
            + card(p('Legg opp 30 masker med hovedfargen. Strikk glattstrikk rundt (eller frem og tilbake med en '
                     'kant) til lappen er minst 12 x 12 cm. Vask og tørk den slik du vil behandle hatten, mål '
                     'deretter midt på lappen.',
                     'Cast on 30 stitches in the main colour. Knit stockinette in the round (or back and forth '
                     'with an edge) until the swatch is at least 12 x 12 cm. Wash and dry it the way you plan to '
                     'treat the hat, then measure across the middle.', L)
                  + ul([
                      L('Flere enn 17 masker på 10 cm: prøv en tykkere pinne.', 'More than 17 stitches over 10 cm: try a thicker needle.'),
                      L('Færre enn 17 masker på 10 cm: prøv en tynnere pinne.', 'Fewer than 17 stitches over 10 cm: try a thinner needle.'),
                      L('Nøyaktig 17 masker: bruk pinne 5 mm og sett i gang.', 'Exactly 17 stitches: use 5 mm needles and get going.'),
                  ]))
            + pink(L('ORDLISTE', 'GLOSSARY'))
            + card('<table class="t tl"><tr><th>' + L('Ord', 'Term') + '</th><th>' + L('Betyr', 'Means') + '</th></tr>'
                   + '<tr><td><b>' + L('m', 'st') + '</b></td><td>' + L('maske', 'stitch') + '</td></tr>'
                   + '<tr><td><b>' + L('omg', 'round') + '</b></td><td>' + L('omgang, én hel runde rundt', 'one whole lap around') + '</td></tr>'
                   + '<tr><td><b>' + L('r', 'k') + '</b></td><td>' + L('rett', 'knit') + '</td></tr>'
                   + '<tr><td><b>' + L('2 r sammen', 'k2tog') + '</b></td><td>' + L('strikk 2 masker som én, minker én maske', 'knit 2 stitches together, decreases one stitch') + '</td></tr>'
                   + '<tr><td><b>HF</b></td><td>' + L('hovedfarge (rød)', 'main colour (red)') + '</td></tr>'
                   + '<tr><td><b>' + L('kjedesting', 'chain stitch') + '</b></td><td>' + L('broderiteknikk som lager en kjede av løkker langs en linje', 'embroidery technique that makes a chain of loops along a line') + '</td></tr></table>')
        ), 5))

        pages.append(ph((
            banner(L('DEL 1: LEGG OPP OG STRIKK BREMMEN', 'PART 1: CAST ON AND KNIT THE BRIM'))
            + steps([
                L('Finn tallet for din størrelse i kolonnen "Legg opp" i tabellen på neste side. Legg opp akkurat så mange masker med rød hovedfarge.',
                  'Find the number for your size in the "Cast on" column in the table on the next page. Cast on exactly that many stitches in red main colour.'),
                L('Kontroller at oppleggskanten ikke er vridd rundt pinnen. Sett sammen til en ring og plasser en maskemarkør ved omgangens begynnelse.',
                  'Check that the cast-on edge is not twisted around the needle. Join in the round and place a stitch marker at the start of the round.'),
                L('Strikk bremmen i glattstrikk rundt (bare rette masker), i antall omganger fra kolonnen "Bremomg.". Bytt farge etter fargeforslaget i tabellen: strikk hver stripe i angitt antall omganger før du bytter til neste farge i rekken.',
                  'Knit the brim in stockinette in the round (knit every stitch), for the number of rounds in the "Brim rounds" column. Change colour following the stripe suggestion in the table: knit each stripe for the stated number of rounds before switching to the next colour.'),
                L('På aller siste bremomgang strikker du 2 rette masker sammen, hele veien rundt. Det halverer maskeantallet nøyaktig, fra tallet du la opp til tallet i kolonnen "Hoveddel" på neste side.',
                  'On the very last brim round, knit 2 stitches together all the way round. This halves the stitch count exactly, from your cast-on number down to the "Main body" number on the next page.'),
            ])
            + pink(L('DEN BØLGETE KANTEN', 'THE FLARED EDGE'))
            + card(p('Sammenstrikkingsomgangen er det som gir bremmen den karakteristiske bølgekanten når hatten '
                     'ikke er strukket ut, det er riktig at kanten krøller seg litt inntil hatten er tatt i bruk.',
                     'The decrease round is what gives the brim its characteristic flared, wavy edge, it is normal '
                     'for the edge to curl in a little until the hat has been worn a few times.', L))
        ), 6))

        pages.append(ph((
            banner(L('TABELL: BREMMEN, ALLE STØRRELSER', 'TABLE: THE BRIM, ALL SIZES'))
            + sizetable([L('Str.', 'Size'), L('Legg opp', 'Cast on'), L('Bremomg.', 'Brim rounds'), L('Stripefordeling', 'Stripe order')],
                        list(zip(SIZES, LEGG_OPP, BREMOMG, STRIPES if LANG == 'no' else EN_STRIPES)))
            + ctitle('Bruk strømpepinner eller magic loop under hele bremmen på de minste størrelsene, den er for smal for en vanlig rundpinne.',
                     'Use double-pointed needles or magic loop for the whole brim on the smallest sizes, it is too narrow for an ordinary circular needle.', L)
        ), 7))

        pages.append(ph((
            banner(L('DEL 2: HOVEDDELEN', 'PART 2: THE MAIN BODY'))
            + steps([
                L('Etter sammenstrikkingsomgangen strikker du glattstrikk rundt i hovedfargen, hele veien, uten noe mønster. Dette er nå hoveddelen av hatten, den delen som synes best.',
                  'After the decrease round, knit stockinette in the round in the main colour, all the way, with no pattern. This is now the main body of the hat, the part that shows the most.'),
                L('Strikk rett fram til hele hoveddelen måler målet i kolonnen "Til topp" i tabellen på neste side, målt fra sammenstrikkingsomgangen. Ikke tenk på bokstavene ennå, de broderer du på til slutt, se Del 3.',
                  'Knit plain until the whole main body measures the "Height to top" value in the table on the next page, measured from the decrease round. Do not worry about the letters yet, you embroider those on at the end, see Part 3.'),
            ], start=1)
            + tealp(L('TABELL: HOVEDDEL', 'TABLE: MAIN BODY'))
            + sizetable([L('Str.', 'Size'), L('Masker (hoveddel)', 'Stitches (main body)'), L('Høyde til topp', 'Height to top')], list(zip(SIZES, HOVEDDEL, TIL_TOPP)))
            + ctitle('Bokstavene skal sitte midt i hoveddelen i høyden, ikke helt nederst mot bremmen og ikke helt oppe ved toppen. Mer om det på neste side.',
                     'The letters are embroidered in the middle of the main body height, not right down against the brim and not right up at the top. More about that on the next page.', L)
        ), 8))

        pages.append(ph((
            banner(L('DEL 3: SLIK BRODERER DU BOKSTAVENE', 'PART 3: HOW TO EMBROIDER THE LETTERS'))
            + p('Hatten er nå ferdig strikket, helt rød med stripet brem. Bokstavene stikker du på med kjedesting: '
                'en lenke av løkker som følger streken på skriftmalen på neste side, og legger seg oppå strikken '
                'som en tydelig, opphøyd linje.',
                'The hat is now fully knitted, all red with a striped brim. You add the letters with chain '
                'stitch: a chain of loops that follows the line on the font template on the next page, and sits '
                'on top of the knitting as a clear, raised line.', L)
            + tealp(L('SLIK GJØR DU KJEDESTING', 'HOW TO WORK CHAIN STITCH'))
            + card(chainstitch_panels(L))
            + pink(L('GODE RÅD', 'GOOD TIPS'))
            + card(ul([
                L('Ikke stram garnet. Løkkene skal ligge løst og lat oppå strikken, ikke stramt.', 'Do not pull the yarn tight. The loops should sit loose and relaxed on top of the knitting, not tight.'),
                L('Tegn bokstavene lett med et vannløselig tusjmerke etter malen først, så treffer du formen.', 'Trace the letters lightly with a water-soluble marker following the template first, so you hit the shape.'),
                L('Start og slutt med å la 5 cm garn henge på innsiden, fest endene når du er ferdig.', 'Leave a 5 cm tail hanging on the inside at the start and end, weave in the ends when you are done.'),
            ]))
            + ctitle('Blir en lenke feil? Bare dra den forsiktig ut igjen og prøv en gang til.',
                     'A link come out wrong? Just pull it gently back out and try again.', L)
        ), 9))

        pages.append(ph((
            banner(L('BOKSTAVMALEN OG FLAGGET', 'THE LETTER TEMPLATE AND THE FLAG'))
            + p('Her er ' + word + ' i runestil. Brodér ordet på i én sammenhengende linje, sentrert midt foran. '
                'Bunnen av bokstavene ligger midt i hoveddelen i høyden, se side 8.',
                'Here is ' + word + ' in rune style. Embroider the word on in one continuous line, centred at the '
                'front. The bottom of the letters sits in the middle of the main body height, see page 8.', L)
            + card('<div class="coverrune">' + runeword(word, box=box) + '</div>')
            + tealp(L('FLAGGET PÅ TOPPEN', 'THE FLAG ON THE TOP'))
            + '<div class="flagbig" style="text-align:center;margin:3mm 0;">' + mini_flag(80) + '</div>'
            + card(ul([
                L('<b>Midt foran:</b> Ordet sentreres midt foran, rett overfor maskemarkøren (som er midt bak).',
                  '<b>Centre front:</b> The word is centred at the front, directly opposite the stitch marker (which sits at centre back).'),
                L('<b>Flagget:</b> Finn midten av toppen der maskene ble dratt sammen. Brodér først et hvitt kors med kjedesting, så et litt smalere blått kors oppå midten.',
                  '<b>The flag:</b> Find the middle of the top where the stitches were pulled together. Embroider a white cross with chain stitch first, then a slightly narrower blue cross on top of the middle.'),
            ]))
        ), 10))

        pages.append(ph((
            banner(L('DEL 4: TOPPEN', 'PART 4: THE CROWN'))
            + steps([
                L('Når hoveddelen måler målet i tabellen på side 8, strikker du én oppsettomgang: fell antall masker oppgitt i kolonnen "Fell" i tabellen på neste side, jevnt fordelt rundt hele omgangen. Står det "Ingen felling", hopper du over denne omgangen og går rett til neste steg.',
                  'When the main body measures the value in the table on page 8, knit one setup round: decrease the number of stitches given in the "Decrease" column in the table on the next page, evenly spaced around the whole round. If it says "No decrease", skip this round and go straight to the next step.'),
                L('Del de gjenværende maskene i 7 like store felt. Sett en maskemarkør mellom hvert felt (7 markører totalt, i tillegg til den ved omgangens start).',
                  'Divide the remaining stitches into 7 equal sections. Place a stitch marker between each section (7 markers in total, plus the one at the start of the round).'),
                L('Strikk til 2 masker gjenstår før hver markør, strikk disse 2 sammen. Gjenta ved alle 7 markørene, det gir 7 minkinger per omgang.',
                  'Knit to 2 stitches before each marker, knit these 2 together. Repeat at all 7 markers, giving 7 decreases per round.'),
                L('Str. 50&ndash;68: strikk 1 vanlig omgang uten minking etter de 3 første minkeomgangene, fortsett deretter å minke på hver omgang. Str. 74&ndash;170: strikk 1 vanlig omgang etter de 4 første minkeomgangene, fortsett deretter å minke på hver omgang.',
                  'Sizes 50&ndash;68: knit 1 plain round with no decreases after the first 3 decrease rounds, then decrease on every round after that. Sizes 74&ndash;170: knit 1 plain round after the first 4 decrease rounds, then decrease every round after that.'),
                L('Fortsett til 7 masker (én per felt) gjenstår. Klipp av tråden med god margin, tre den gjennom de gjenværende maskene med en stoppenål, dra sammen og fest godt på innsiden.',
                  'Continue until 7 stitches (one per section) remain. Cut the yarn leaving a generous tail, thread it through the remaining stitches with a tapestry needle, pull tight and fasten off securely on the inside.'),
            ])
        ), 11))

        pages.append(ph((
            banner(L('TABELL: OPPSETT FØR TOPP, ALLE STØRRELSER', 'TABLE: SETUP BEFORE THE CROWN, ALL SIZES'))
            + sizetable([L('Str.', 'Size'), L('Masker før topp', 'Stitches before top'), L('Fell', 'Decrease'), L('Masker etter', 'Stitches after')],
                        list(zip(SIZES, HOVEDDEL, OPPSETT_FELL if LANG == 'no' else EN_OPPSETT_FELL, ETTER_OPPSETT)))
        ), 12))

        congrats = L('Gratulerer, du har strikket din egen ' + word + '-runehatt!', 'Congratulations, you have knitted your very own ' + word + ' rune hat!')
        pages.append(ph((
            banner(L('STELL OG SISTE SJEKK', 'CARE AND FINAL CHECK'))
            + tealp(L('AVSLUTNING', 'FINISHING'))
            + card(p('Fest alle løse tråder godt på innsiden, spesielt ved fargebyttene i bremmen og rundt broderiet. Kontroller at broderisømmene ligger løst, ikke stramme.',
                     'Weave in all loose ends securely on the inside, especially at the colour changes in the brim and around the embroidery. Check that the embroidered stitches lie loose, not tight.', L))
            + tealp(L('STELL', 'CARE'))
            + card(p('Vask etter garnets anbefaling, ofte 30&deg;C på skånsomt program i vaskepose, eller for hånd. Ikke bruk tørketrommel. Form hatten over en bolle eller et glass i riktig størrelse og la den tørke flatt eller på formen.',
                     'Wash following the yarn&rsquo;s recommendation, often 30&deg;C on a gentle cycle in a wash bag, or by hand. Do not tumble dry. Shape the hat over a bowl or glass of the right size and let it dry flat or on the form.', L))
            + pink(L('SJEKKLISTE', 'CHECKLIST'))
            + card(check([
                L('Hodemålet er kontrollert, ikke bare alder', 'The head measurement has been checked, not just age'),
                L('Prøvelappen stemmer med 17 masker x 22 omganger på 10 cm', 'The swatch matches 17 stitches x 22 rounds over 10 cm'),
                L('Bremmen har den bølgete kanten fra sammenstrikkingsomgangen', 'The brim has the flared edge from the decrease round'),
                L(word + ' står i runestil på én linje midt foran', word + ' is in rune style on one line at the centre front'),
                L('Alle broderisting ligger løst, ikke stramme', 'All embroidered stitches lie loose, not tight'),
                L('Toppen er dratt sammen og godt festet', 'The top is pulled tight and well fastened off'),
            ]))
            + '<div class="congrats">' + congrats + '</div>'
            + byline(logo_src, 'Renate Dahl')
            + '<p class="copyright">' + L(
                '&copy; 2026 Little Montessori Explorers. Oppskriften er kun til personlig bruk. Oppskriften og '
                'malene kan ikke kopieres, deles, videreselges eller publiseres. Ferdige produkter kan selges i '
                'liten skala med kreditering til Little Montessori Explorers.',
                '&copy; 2026 Little Montessori Explorers. This pattern is for personal use only. The pattern and '
                'templates may not be copied, shared, resold or published. Finished items may be sold on a small '
                'scale with credit to Little Montessori Explorers.') + '</p>'
            + '<p style="font-size:11pt;color:#c0392b;text-align:center;margin-top:2mm;">' + L(
                'Hatten er et plagg for våken bruk under tilsyn. Skal ikke brukes under søvn eller i vogn uten oppsyn.',
                'The hat is a garment for supervised, awake use. Do not use during sleep or in a pram unattended.') + '</p>'
        ), 13))

        title = L(word + '-runehatt barn, LME strikkeoppskrift', word + ' rune hat kids, LME knitting pattern')
        lang_attr = 'en' if LANG == 'en' else 'no'
        return ('<!DOCTYPE html>\n<html lang="' + lang_attr + '"><head><meta charset="utf-8">\n'
                '<title>' + title + '</title>\n<style>' + css + '</style></head>\n'
                '<body>' + ''.join(pages) + '</body></html>')

    doc_no = build_lang('no')
    doc_en = build_lang('en')
    (out_dir / f'barn_strikk_rune_{slug}_no.html').write_text(doc_no, encoding='utf-8')
    (out_dir / f'barn_strikk_rune_{slug}_en.html').write_text(doc_en, encoding='utf-8')
    print('OK', slug, len(doc_no), 'tegn (no),', len(doc_en), 'tegn (en)')


for v in VARIANTS:
    build(v)
