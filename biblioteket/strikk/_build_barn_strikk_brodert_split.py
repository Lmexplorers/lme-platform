# -*- coding: utf-8 -*-
"""Genererer 3 separate LME-strikkeoppskrifter (brodert/maskesting, NORGE / NORWAY / RO,
hver for seg) for bøttehatter barn, som erstatning for den gamle samle-PDF-en."""
import base64, html, pathlib

BASE = pathlib.Path(__file__).parent
SRC = BASE / 'bottehatter-barn-strikk-brodert'
PHOTO = SRC / 'barn_strikk_ref.jpg'
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


def vgrid(cols, rows, sw=34, sh=26, ox=10, oy=14, hi=None, done=None):
    out = []
    for r in range(rows):
        for c in range(cols):
            x = ox + c*sw
            y = oy + r*sh
            wpath = (f'M{x+3},{y+sh-2} Q{x+sw*0.30},{y+sh*0.35} {x+sw/2},{y+2} '
                     f'Q{x+sw*0.70},{y+sh*0.35} {x+sw-3},{y+sh-2}')
            out.append(f'<path d="{wpath}" fill="none" stroke="#a30d24" stroke-width="7" stroke-linecap="round"/>')
            out.append(f'<path d="{wpath}" fill="none" stroke="{RED}" stroke-width="5" stroke-linecap="round"/>')
    if hi:
        c, r = hi
        x = ox + c*sw; y = oy + r*sh
        out.append(f'<rect x="{x-2}" y="{y-4}" width="{sw+4}" height="{sh+8}" rx="6" fill="none" stroke="{TEAL}" stroke-width="2.5" stroke-dasharray="5 4"/>')
    if done:
        c, r = done
        x = ox + c*sw; y = oy + r*sh
        wpath = (f'M{x+3},{y+sh-2} Q{x+sw*0.30},{y+sh*0.35} {x+sw/2},{y+2} '
                 f'Q{x+sw*0.70},{y+sh*0.35} {x+sw-3},{y+sh-2}')
        out.append(f'<path d="{wpath}" fill="none" stroke="#d9d2be" stroke-width="7" stroke-linecap="round"/>')
        out.append(f'<path d="{wpath}" fill="none" stroke="{CREAM}" stroke-width="5.5" stroke-linecap="round"/>')
    return ''.join(out)


def dupstitch_panels(L):
    sw, sh, ox, oy = 32, 26, 12, 30
    def pt(c, r, fx, fy):
        return ox + c*sw + fx*sw, oy + r*sh + fy*sh
    def tag(cx, text, w=None):
        w = w or (len(text)*6.3 + 14)
        x = cx - w/2
        return (f'<rect x="{x}" y="6" width="{w}" height="17" rx="8.5" fill="#e9f6f5" '
                f'stroke="{TEAL}" stroke-width="1.5"/>'
                f'<text x="{cx}" y="18.4" text-anchor="middle" font-size="11" '
                f'font-family="sans-serif" font-weight="bold" fill="#2e8e8a">{html.escape(text)}</text>')
    panels = []
    bx, by = pt(1, 1, 0.5, 1.0)
    g1 = vgrid(4, 3, sw=sw, sh=sh, ox=ox, oy=oy, hi=(1, 1))
    g1 += f'<circle cx="{bx}" cy="{by-2}" r="6" fill="{TEAL}"/>'
    g1 += f'<path d="M{bx},{by+24} L{bx},{by+5}" stroke="{TEAL}" stroke-width="3" marker-end="url(#at)"/>'
    g1 += tag(78, L('stikk opp her', 'come up here'))
    panels.append((1, L('Stikk nålen opp nedenfra, i bunnen av masken (roten av V-en).',
                        'Bring the needle up from below, at the base of the stitch (the root of the V).'), g1))

    lx, ly = pt(1, 0, 0.14, 0.92)
    rx, ry = pt(1, 0, 0.86, 0.92)
    g2 = vgrid(4, 3, sw=sw, sh=sh, ox=ox, oy=oy, hi=(1, 1))
    g2 += (f'<path d="M{bx},{by-2} Q{lx-14},{ly-8} {lx-2},{ly-14} '
           f'M{rx+2},{ry-14} Q{rx+16},{ry-6} {rx+10},{ry+4}" '
           f'stroke="{CREAM}" stroke-width="5" fill="none" stroke-linecap="round"/>')
    g2 += (f'<path d="M{lx+2},{ly-10} L{rx-2},{ry-10}" stroke="#c9a94e" stroke-width="4" '
           f'stroke-linecap="round" stroke-dasharray="5 4"/>')
    g2 += f'<path d="M{rx+10},{ry+4} L{rx+13},{ry+14}" stroke="{TEAL}" stroke-width="3" marker-end="url(#at)"/>'
    g2 += tag(78, L('under masken over', 'under the stitch above'))
    panels.append((2, L('Før nålen inn under begge beina til masken rett over. Dra garnet gjennom.',
                        'Pass the needle under both legs of the stitch right above. Pull the yarn through.'), g2))

    g3 = vgrid(4, 3, sw=sw, sh=sh, ox=ox, oy=oy, hi=(1, 1), done=(1, 1))
    g3 += f'<path d="M{bx+16},{by+16} L{bx+3},{by+1}" stroke="{TEAL}" stroke-width="3" marker-end="url(#at)"/>'
    g3 += tag(78, L('ned i samme hull', 'down the same hole'))
    panels.append((3, L('Stikk nålen ned i samme hull som du kom opp. Ferdig! Den hvite V-en ligger nå oppå den røde masken.',
                        'Bring the needle down into the same hole you came up. Done! The white V now lies on top of the red stitch.'), g3))

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
.dsteps {{ display:flex; gap:4mm; }}
.dstep {{ flex:1; text-align:center; position:relative; }}
.dstep p {{ font-size:11pt; line-height:1.3; margin-top:1.5mm; text-align:left; }}
.dnum {{ position:absolute; top:-2.5mm; left:-1.5mm; width:7mm; height:7mm; border-radius:50%; background:{PINK}; color:#fff; font-family:var(--font-head); font-weight:700; font-size:10.5pt; display:flex; align-items:center; justify-content:center; }}
'''

VARIANTS = [
    dict(slug='norge', is_striped=True, chart=NORGE_CHART, cmap=CMAP_LETTERS, cell=20, stitches=29,
         no_word='NORGE', no_title='NORGE-BØTTEHATT<br>TIL BABY OG BARN, BRODERT',
         no_desc='Ordet «NORGE» broderes i hvitt tvers over pannen med maskesting, på en hatt med stripet brem i rødt/hvitt/marineblått.',
         en_word='NORGE', en_title='NORGE BUCKET HAT<br>FOR BABY AND CHILD, DUPLICATE STITCH',
         en_desc='The word &laquo;NORGE&raquo; is embroidered in white across the forehead with duplicate stitch, on a hat with a striped red/white/navy brim.'),
    dict(slug='norway', is_striped=True, chart=NORWAY_CHART, cmap=CMAP_LETTERS, cell=17, stitches=35,
         no_word='NORWAY', no_title='NORWAY-BØTTEHATT<br>TIL BABY OG BARN, BRODERT',
         no_desc='Ordet «NORWAY» broderes i hvitt tvers over pannen med maskesting, på en hatt med stripet brem i rødt/hvitt/marineblått.',
         en_word='NORWAY', en_title='NORWAY BUCKET HAT<br>FOR BABY AND CHILD, DUPLICATE STITCH',
         en_desc='The word &laquo;NORWAY&raquo; is embroidered in white across the forehead with duplicate stitch, on a hat with a striped red/white/navy brim.'),
    dict(slug='ro', is_striped=False, chart=RO_FLAG_CHART, cmap=CMAP_ROFLAG, cell=20, stitches=25,
         no_word='RO', no_title='RO-BØTTEHATT<br>TIL BABY OG BARN, BRODERT',
         no_desc='Bokstavene «RO» pluss et lite norsk flagg broderes i hvitt/marineblått med maskesting, på en hatt med ensfarget marineblå brem.',
         en_word='RO', en_title='RO BUCKET HAT<br>FOR BABY AND CHILD, DUPLICATE STITCH',
         en_desc='The letters &laquo;RO&raquo; plus a small Norwegian flag are embroidered in white/navy with duplicate stitch, on a hat with a solid navy brim.'),
]


def build(v):
    slug = v['slug']
    out_dir = BASE / f'bottehatter-barn-strikk-brodert-{slug}'
    ph_no = make_page('LME STRIKKEOPPSKRIFT&nbsp;&nbsp;|&nbsp;&nbsp;BØTTEHATT BARN, BRODERT', 'LME STRIKK')
    pages = []

    pages.append(ph_no('''
<div class="coverimg"><img src="''' + photo_src + f'''" alt="{v['no_word']}-bøttehatt til baby og barn, strikket og brodert"></div>
<div class="covertag">LME STRIKKEOPPSKRIFT</div>
<div class="coverbanner"><h1 class="covertitle">{v['no_title']}</h1></div>
<div class="subpill">{v['no_word']} &middot; STØRRELSE 50&ndash;170</div>
''' + card(f'<p class="center">Samme bøttehatt som {v["no_word"]}-oppskriften for voksne, gradert helt fra bunnen av til '
      'tjueen babyer-, barne- og ungdomsstørrelser, 50 til 170. Her strikker du hele hatten ensfarget først, og broderer '
      'motivet på til slutt med maskesting (duplikatsting). Egne, mindre bokstaver er laget spesielt for de minste '
      f'hodene. Denne oppskriften er komplett i seg selv, du trenger ikke eie noen annen LME-oppskrift for å strikke den. {v["no_desc"]}</p>') + '''
''' + byline('Av Renate Dahl') + '''
''' + tip('Les hele oppskriften én gang før du legger opp. Strikk alltid en prøvelapp først, se side 4.') + '''
''', 1))

    pages.append(ph_no(
        banner('FØR DU BEGYNNER') +
        '<p>Bøttehatten strikkes rundt på rundpinne eller strømpepinner, nedenfra og opp, helt ensfarget. Du '
        f'strikker først en {"stripet" if v["is_striped"] else "ensfarget"} brem som bølger nedover, deretter hoveddelen rett opp, og til slutt felles '
        'toppen ned til en liten rundet topp. Helt til slutt broderer du motivet på med maskesting (kalles også '
        'duplikatsting), en søm som legger seg oppå strikken og ser strikket ut.</p>' +
        card(f'<p>{v["no_desc"]}</p>') +
        tealp('DETTE LÆRER DU') +
        card(ul([
            'Å strikke en lue/hatt rundt på rundpinne eller strømpepinner',
            'Å strikke en {} brem, med en sammenstrikkingsomgang'.format('stripet' if v['is_striped'] else 'ensfarget'),
            'Å brodere et bokstav- eller flaggmotiv med maskesting, sting for sting etter et rutediagram',
            'Å felle en rundet topp jevnt ned til få masker',
        ])) +
        pink('HVOR VANSKELIG ER DET?') +
        card('<p>Nybegynnervennlig. Du bør kunne legge opp, strikke glattstrikk rundt og bytte farge. Selve '
             'hatten strikkes i kun én farge om gangen, motivet kommer på etterpå med nål og tråd, og alt er '
             'forklart trinn for trinn i denne oppskriften.</p>') +
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
             'i rødt, hvitt og marineblått.</p>'
             '<table class="t"><tr><th>Farge</th><th>Bruk</th></tr>'
             f'<tr><td><span class="dot" style="background:{RED}"></span> Rød</td><td>hovedfarge, hele hatten</td></tr>'
             f'<tr><td><span class="dot" style="background:{WHITE};border-color:#ccc;"></span> Hvit</td><td>broderi: bokstaver{", striper" if v["is_striped"] else ""}</td></tr>'
             f'<tr><td><span class="dot" style="background:{NAVY}"></span> Marineblå</td><td>{"striper, broderi: flagg" if v["is_striped"] else "hele bremmen, broderi: flagg"}</td></tr></table>'
             '<p class="small">Ha rikelig av rød hovedfarge (nesten hele hatten er strikket i rødt) og ett lite '
             'nøste hver av hvitt og marineblått, de brukes bare i bremmen og til broderiet.</p>') +
        pink('PINNER OG UTSTYR') +
        card(ul([
            'Rundpinne 5 mm, 40 cm, eller strømpepinner/magic loop-sett 5 mm',
            '<b>Stoppenål med butt spiss</b> til broderiet, en skarp nål kan splitte garnet',
            'Saks og målebånd',
            'Maskemarkør (valgfritt, for å holde styr på midt foran)',
        ])) +
        cream('<p class="creamtitle">Strikker du fast, prøv pinne 5,5 mm. Strikker du løst, prøv 4,5 mm. Målet er '
              'alltid 17 masker på 10 cm.</p>')
    , 4))

    pages.append(ph_no(
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
             '<tr><td><b>maskesting</b></td><td>broderi som legger seg oppå maskene og ser strikket ut, '
             'kalles også duplikatsting</td></tr>'
             '<tr><td><b>jevnt fordelt</b></td><td>spredt likt utover hele omgangen, ikke samlet ett sted</td></tr></table>')
    , 5))

    if v['is_striped']:
        brim_step = ('Strikk bremmen i glattstrikk rundt (bare rette masker), i antall omganger fra kolonnen '
                      '&laquo;Bremomg.&raquo;. Bytt farge etter fargeforslaget i tabellen: strikk hver stripe i angitt '
                      'antall omganger før du bytter til neste farge i rekken.')
    else:
        brim_step = ('Strikk hele bremmen i marineblått, glattstrikk rundt (bare rette masker), i antall omganger '
                      'fra kolonnen &laquo;Bremomg.&raquo; i tabellen på neste side. Ingen fargeskift underveis.')
    pages.append(ph_no(
        banner('DEL 1: LEGG OPP OG STRIKK BREMMEN') +
        steps([
            'Finn tallet for din størrelse i kolonnen &laquo;Legg opp&raquo; i tabellen på neste side. Legg opp '
            'akkurat så mange masker med rød hovedfarge.',
            'Kontroller at oppleggskanten ikke er vridd rundt pinnen. Sett sammen til en ring og plasser en '
            'maskemarkør ved omgangens begynnelse, det er her hver omgang starter og slutter.',
            brim_step,
            'På aller siste bremomgang strikker du 2 rette masker sammen, hele veien rundt (maske 1 og 2 '
            'sammen, maske 3 og 4 sammen, og så videre). Det halverer maskeantallet nøyaktig, fra tallet du la '
            'opp til tallet i kolonnen &laquo;Hoveddel&raquo; på neste side.',
        ]) +
        pink('DEN BØLGETE KANTEN') +
        card('<p>Sammenstrikkingsomgangen er det som gir bremmen den karakteristiske bølgekanten når hatten '
             'ikke er strukket ut, det er riktig at kanten krøller seg litt inntil hatten er tatt i bruk.</p>')
    , 6))

    stripe_header = 'Stripefordeling' if v['is_striped'] else 'Bremfarge'
    stripe_col = STRIPES if v['is_striped'] else ['Marineblå, ensfarget'] * len(SIZES)
    pages.append(ph_no(
        banner('TABELL: BREMMEN, ALLE STØRRELSER') +
        sizetable(['Str.', 'Legg opp', 'Bremomg.', stripe_header],
                  list(zip(SIZES, LEGG_OPP, BREMOMG, stripe_col))) +
        cream('<p class="creamtitle">Bruk strømpepinner eller magic loop under hele bremmen på de minste '
              'størrelsene, den er for smal for en vanlig rundpinne.</p>')
    , 7))

    pages.append(ph_no(
        banner('DEL 2: HOVEDDELEN') +
        steps([
            'Etter sammenstrikkingsomgangen strikker du glattstrikk rundt i hovedfargen, hele veien, uten noe '
            'mønster. Dette er nå hoveddelen av hatten, den delen som synes best.',
            'Strikk rett fram til hele hoveddelen måler målet i kolonnen &laquo;Til topp&raquo; i tabellen på '
            'neste side, målt fra sammenstrikkingsomgangen. Ikke tenk på motivet ennå, det broderer du på til '
            'slutt, se Del 3 på neste oppslag.',
        ], start=1) +
        tealp('TABELL: HOVEDDEL') +
        sizetable(['Str.', 'Masker (hoveddel)', 'Høyde til topp'], list(zip(SIZES, HOVEDDEL, TIL_TOPP))) +
        cream('<p class="creamtitle">Motivet broderes midt i hoveddelen i høyden, ikke helt nederst mot '
              'bremmen og ikke helt oppe ved toppen. Mer om det på neste side.</p>')
    , 8))

    pages.append(ph_no(
        banner('DEL 3: SLIK BRODERER DU MOTIVET') +
        '<p>Hatten er nå ferdig strikket, helt ensfarget. Motivet legger du til med maskesting: en søm som legger '
        'seg oppå de strikkede maskene og ser strikket ut. En rute i diagrammet på neste side er én maske på '
        'hatten. Bruk stoppenålen med butt spiss og en garnlengde på ca. 40&ndash;50 cm.</p>' +
        tealp('SLIK GJØR DU ETT STING') +
        card(dupstitch_panels(lambda no, en: no)) +
        pink('GODE RÅD') +
        card(ul([
            'Ikke stram garnet. V-en skal ligge løst og lat oppå masken, ikke stram til.',
            'Brodér rad for rad: gjør deg ferdig med én vannrett rad i diagrammet før du går videre oppover.',
            'Start og slutt med å la 5 cm garn henge på innsiden, fest endene når du er ferdig.',
            'Tell ruter i diagrammet og masker på hatten med fingeren, gjerne to ganger, riktig telling er '
            'halve jobben.',
        ])) +
        cream('<p class="creamtitle">Blir et sting feil? Bare dra det forsiktig ut igjen og prøv en gang til.</p>')
    , 9))

    pages.append(ph_no(
        banner('DIAGRAMMET OG PLASSERINGEN') +
        tealp('SLIK PLASSERER DU MOTIVET') +
        card('<p>Tell maskene rundt og finn midten (halvparten av tallet i kolonnen &laquo;Hoveddel&raquo; på '
             'side 8), det blir midt foran, midt på pannen. Sentrer diagrammet rundt dette punktet, med like '
             'mange bakgrunnsmasker på hver side. Broder rad 1 (nederst i diagrammet) midt i hoveddelen i høyden, '
             'se side 8.</p>') +
        tealp(f'DIAGRAM: {v["no_word"]} ({v["stitches"]} masker x 7 omganger)') +
        f'<div class="chartrow">{chart_svg(v["chart"], v["cmap"], cell=v["cell"], numbers=True)}</div>' +
        '<p class="small">Les diagrammet nedenfra og opp, akkurat som maskene i strikketøyet. Hver rad '
        'broderes fra høyre mot venstre. Hvit rute = brodér med hvitt (eller marineblått for RO-brem). Farget '
        'rute = hopp over, der får hovedfargen synes.</p>'
    , 10))

    pages.append(ph_no(
        banner('DEL 4: TOPPEN') +
        steps([
            'Når hoveddelen måler målet i tabellen på side 8, strikker du én oppsettomgang: fell antall masker '
            'oppgitt i kolonnen &laquo;Fell&raquo; i tabellen på neste side, jevnt fordelt rundt hele '
            'omgangen. Står det &laquo;Ingen felling&raquo;, hopper du over denne omgangen og går rett til '
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
    , 11))

    pages.append(ph_no(
        banner('TABELL: OPPSETT FØR TOPP, ALLE STØRRELSER') +
        sizetable(['Str.', 'Masker før topp', 'Fell', 'Masker etter'],
                  list(zip(SIZES, HOVEDDEL, OPPSETT_FELL, ETTER_OPPSETT)))
    , 12))

    pages.append(ph_no(
        banner('STELL OG SISTE SJEKK') +
        tealp('AVSLUTNING') +
        card('<p>Fest alle løse tråder godt på innsiden, både etter bremmen og etter broderiet. '
             'Kontroller at broderisømmene ligger løst og lat oppå maskene, ikke stramme.</p>') +
        tealp('STELL') +
        card('<p>Vask etter garnets anbefaling, ofte 30&deg;C på skånsomt program i vaskepose, eller for hånd. '
             'Ikke bruk tørketrommel. Form hatten over en bolle eller et glass i riktig størrelse og la den '
             'tørke flatt eller på formen.</p>') +
        pink('SJEKKLISTE') +
        card(check([
            'Hodemålet er kontrollert, ikke bare alder',
            'Prøvelappen stemmer med 17 masker x 22 omganger på 10 cm',
            'Bremmen har den {} kanten'.format('bølgete' if v['is_striped'] else 'jevne'),
            'Motivet er brodert med maskesting, sentrert midt foran',
            'Alle broderisting ligger løst, ikke stramme',
            'Toppen er dratt sammen og godt festet',
        ])) +
        '<div class="congrats">Gratulerer, du har strikket og brodert din egen barnebøttehatt!</div>' +
        byline('Renate Dahl') +
        '<p class="copyright">&copy; 2026 Little Montessori Explorers. Oppskriften er kun til personlig '
        'bruk. Oppskriften og diagrammene kan ikke kopieres, deles, videreselges eller publiseres. '
        'Ferdige produkter kan selges i liten skala med kreditering til Little Montessori Explorers.</p>' +
        '<p style="font-size:11pt;color:#c0392b;text-align:center;margin-top:2mm;">Hatten er et plagg for '
        'våken bruk under tilsyn. Skal ikke brukes under søvn eller i vogn uten oppsyn.</p>'
    , 13))

    pages_no = pages

    ph_en = make_page('LME KNITTING PATTERN&nbsp;&nbsp;|&nbsp;&nbsp;KIDS BUCKET HAT, DUPLICATE STITCH', 'LME KNIT')
    pages = []

    pages.append(ph_en('''
<div class="coverimg"><img src="''' + photo_src + f'''" alt="{v['en_word']} bucket hat for baby and child, knitted and embroidered"></div>
<div class="covertag">LME KNITTING PATTERN</div>
<div class="coverbanner"><h1 class="covertitle">{v['en_title']}</h1></div>
<div class="subpill">{v['en_word']} &middot; SIZE 50&ndash;170</div>
''' + card(f'<p class="center">The same bucket hat as the {v["en_word"]} pattern for adults, graded completely '
      'from scratch into twenty-one baby, child and teen sizes, 50 to 170. Here you knit the whole hat in one colour '
      'first, then embroider the motif on afterwards with duplicate stitch. Smaller letters were designed just for '
      f'the smallest heads. This pattern is complete on its own, you do not need any other LME pattern to knit it. {v["en_desc"]}</p>') + '''
''' + byline('By Renate Dahl') + '''
''' + tip('Read the whole pattern once before you cast on. Always knit a gauge swatch first, see page 4.') + '''
''', 1))

    pages.append(ph_en(
        banner('BEFORE YOU START') +
        '<p>The bucket hat is knitted in the round on a circular needle or double-pointed needles, from the '
        f'bottom up, in a single colour throughout. You start with a {"striped, flared" if v["is_striped"] else "solid-coloured"} brim, then the main '
        'body straight up, and finally decrease the crown down to a small rounded top. Right at the end you '
        'embroider the motif on with duplicate stitch (also called Swiss darning), a stitch that sits on top '
        'of the knitting and looks knitted in.</p>' +
        card(f'<p>{v["en_desc"]}</p>') +
        tealp('WHAT YOU LEARN') +
        card(ul([
            'To knit a hat in the round on a circular needle or double-pointed needles',
            'To knit a {} brim, with a decrease round'.format('striped, flared' if v['is_striped'] else 'solid'),
            'To embroider a letter or flag motif with duplicate stitch, following a chart',
            'To decrease a rounded crown evenly down to a few stitches',
        ])) +
        pink('HOW HARD IS IT?') +
        card('<p>Beginner friendly. You should be able to cast on, knit stockinette in the round and change '
             'colour. The hat itself is knitted in just one colour at a time, the motif comes on afterwards '
             'with a needle and thread, and every step is spelled out in this pattern.</p>') +
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
             'choices, in red, white and navy.</p>'
             '<table class="t"><tr><th>Colour</th><th>Use</th></tr>'
             f'<tr><td><span class="dot" style="background:{RED}"></span> Red</td><td>main colour, whole hat</td></tr>'
             f'<tr><td><span class="dot" style="background:{WHITE};border-color:#ccc;"></span> White</td><td>embroidery: letters{", stripes" if v["is_striped"] else ""}</td></tr>'
             f'<tr><td><span class="dot" style="background:{NAVY}"></span> Navy</td><td>{"stripes, embroidery: flag" if v["is_striped"] else "whole brim, embroidery: flag"}</td></tr></table>'
             '<p class="small">Have plenty of red main colour (almost the whole hat is knitted in red) and one '
             'small ball each of white and navy, they are only used in the brim and the embroidery.</p>') +
        pink('NEEDLES AND KIT') +
        card(ul([
            '5 mm circular needle, 40 cm, or 5 mm double-pointed needles/magic loop set',
            '<b>Tapestry needle with a blunt tip</b> for the embroidery, a sharp needle can split the yarn',
            'Scissors and tape measure',
            'Stitch marker (optional, to track centre front)',
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
             '<tr><td><b>MC</b></td><td>main colour (red)</td></tr>'
             '<tr><td><b>duplicate stitch</b></td><td>embroidery that sits on top of the knit stitches and '
             'looks knitted in, also called Swiss darning</td></tr>'
             '<tr><td><b>evenly spaced</b></td><td>spread equally around the round, not bunched in one spot</td></tr></table>')
    , 5))

    if v['is_striped']:
        en_brim_step = ('Knit the brim in stockinette in the round (knit every stitch), for the number of rounds in the '
                         '&laquo;Brim rounds&raquo; column. Change colour following the stripe suggestion in the table: knit '
                         'each stripe for the stated number of rounds before switching to the next colour.')
    else:
        en_brim_step = ('Knit the whole brim in navy, in stockinette in the round (knit every stitch), for the number of '
                         'rounds in the &laquo;Brim rounds&raquo; column on the next page. No colour changes.')
    pages.append(ph_en(
        banner('PART 1: CAST ON AND KNIT THE BRIM') +
        steps([
            'Find the number for your size in the &laquo;Cast on&raquo; column in the table on the next page. '
            'Cast on exactly that many stitches in red main colour.',
            'Check that the cast-on edge is not twisted around the needle. Join in the round and place a stitch '
            'marker at the start of the round, this is where every round begins and ends.',
            en_brim_step,
            'On the very last brim round, knit 2 stitches together all the way round (stitch 1 and 2 together, '
            'stitch 3 and 4 together, and so on). This halves the stitch count exactly, from your cast-on '
            'number down to the &laquo;Main body&raquo; number on the next page.',
        ]) +
        pink('THE FLARED EDGE') +
        card('<p>The decrease round is what gives the brim its characteristic flared, wavy edge, it is normal '
             'for the edge to curl in a little until the hat has been worn a few times.</p>')
    , 6))

    en_stripe_header = 'Stripe order' if v['is_striped'] else 'Brim colour'
    en_stripe_col = EN_STRIPES if v['is_striped'] else ['Navy, solid'] * len(SIZES)
    pages.append(ph_en(
        banner('TABLE: THE BRIM, ALL SIZES') +
        sizetable(['Size', 'Cast on', 'Brim rounds', en_stripe_header],
                  list(zip(SIZES, LEGG_OPP, BREMOMG, en_stripe_col))) +
        cream('<p class="creamtitle">Use double-pointed needles or magic loop for the whole brim on the smallest '
              'sizes, it is too narrow for an ordinary circular needle.</p>')
    , 7))

    pages.append(ph_en(
        banner('PART 2: THE MAIN BODY') +
        steps([
            'After the decrease round, knit stockinette in the round in the main colour, all the way, with no '
            'pattern. This is now the main body of the hat, the part that shows the most.',
            'Knit plain until the whole main body measures the &laquo;Height to top&raquo; value in the table on '
            'the next page, measured from the decrease round. Do not worry about the motif yet, you embroider '
            'that on at the end, see Part 3 on the next spread.',
        ], start=1) +
        tealp('TABLE: MAIN BODY') +
        sizetable(['Size', 'Stitches (main body)', 'Height to top'], list(zip(SIZES, HOVEDDEL, TIL_TOPP))) +
        cream('<p class="creamtitle">The motif is embroidered in the middle of the main body height, not right '
              'down against the brim and not right up at the top. More about that on the next page.</p>')
    , 8))

    pages.append(ph_en(
        banner('PART 3: HOW TO EMBROIDER THE MOTIF') +
        '<p>The hat is now fully knitted, all one colour. You add the motif with duplicate stitch: a stitch that '
        'sits on top of the knitted stitches and looks knitted in. One square in the chart on the next page is '
        'one stitch on the hat. Use the blunt tapestry needle and a length of yarn about 40&ndash;50 cm.</p>' +
        tealp('HOW TO WORK ONE STITCH') +
        card(dupstitch_panels(lambda no, en: en)) +
        pink('GOOD TIPS') +
        card(ul([
            'Do not pull the yarn tight. The V should sit loose and relaxed on top of the stitch, not tight.',
            'Embroider row by row: finish one horizontal row of the chart before moving up to the next.',
            'Leave a 5 cm tail hanging on the inside at the start and end, weave in the ends when you are done.',
            'Count squares in the chart and stitches on the hat with your finger, twice if needed. Counting '
            'right is half the job.',
        ])) +
        cream('<p class="creamtitle">A stitch come out wrong? Just pull it gently back out and try again.</p>')
    , 9))

    pages.append(ph_en(
        banner('THE CHART AND PLACEMENT') +
        tealp('HOW TO PLACE THE MOTIF') +
        card('<p>Count the stitches around and find the middle (half of the &laquo;Main body&raquo; number on '
             'page 8), that becomes centre front, the middle of the forehead. Centre the chart around this '
             'point, with the same number of background stitches on each side. Embroider row 1 (the bottom of '
             'the chart) in the middle of the main body height, see page 8.</p>') +
        tealp(f'CHART: {v["en_word"]} ({v["stitches"]} stitches x 7 rounds)') +
        f'<div class="chartrow">{chart_svg(v["chart"], v["cmap"], cell=v["cell"], numbers=True)}</div>' +
        '<p class="small">Read the chart from the bottom up, just like the stitches in the knitting. Work each '
        'row from right to left. White square = embroider white (or navy for the RO brim). Coloured square = '
        'skip it, that is where the main colour shows through.</p>'
    , 10))

    pages.append(ph_en(
        banner('PART 4: THE CROWN') +
        steps([
            'When the main body measures the value in the table on page 8, knit one setup round: decrease the '
            'number of stitches given in the &laquo;Decrease&raquo; column in the table on the next page, '
            'evenly spaced around the whole round. If it says &laquo;No decrease&raquo;, skip this round and go '
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
    , 11))

    pages.append(ph_en(
        banner('TABLE: SETUP BEFORE THE CROWN, ALL SIZES') +
        sizetable(['Size', 'Stitches before top', 'Decrease', 'Stitches after'],
                  list(zip(SIZES, HOVEDDEL, EN_OPPSETT_FELL, ETTER_OPPSETT)))
    , 12))

    pages.append(ph_en(
        banner('CARE AND FINAL CHECK') +
        tealp('FINISHING') +
        card('<p>Weave in all loose ends securely on the inside, both after the brim and after the embroidery. '
             'Check that the embroidered stitches lie loose on top of the knitting, not tight.</p>') +
        tealp('CARE') +
        card('<p>Wash following the yarn&rsquo;s recommendation, often 30&deg;C on a gentle cycle in a wash bag, '
             'or by hand. Do not tumble dry. Shape the hat over a bowl or glass of the right size and let it dry '
             'flat or on the form.</p>') +
        pink('CHECKLIST') +
        card(check([
            'The head measurement has been checked, not just age',
            'The swatch matches 17 stitches x 22 rounds over 10 cm',
            'The brim has the {} edge'.format('flared' if v['is_striped'] else 'even'),
            'The motif is embroidered with duplicate stitch, centred at centre front',
            'All embroidered stitches lie loose, not tight',
            'The top is pulled tight and well fastened off',
        ])) +
        '<div class="congrats">Congratulations, you have knitted and embroidered your very own kids&rsquo; bucket hat!</div>' +
        byline('Renate Dahl') +
        '<p class="copyright">&copy; 2026 Little Montessori Explorers. This pattern is for personal use '
        'only. The pattern and charts may not be copied, shared, resold or published. Finished items may '
        'be sold on a small scale with credit to Little Montessori Explorers.</p>' +
        '<p style="font-size:11pt;color:#c0392b;text-align:center;margin-top:2mm;">The hat is a garment for '
        'supervised, awake use. Do not use during sleep or in a pram unattended.</p>'
    , 13))

    pages_en = pages

    doc_no = f'''<!DOCTYPE html>
<html lang="no"><head><meta charset="utf-8">
<title>{v['no_word']}-bøttehatt barn, brodert, LME strikkeoppskrift</title>
<style>{css}</style></head>
<body>{''.join(pages_no)}</body></html>'''
    doc_en = f'''<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8">
<title>{v['en_word']} bucket hat kids, duplicate stitch, LME knitting pattern</title>
<style>{css}</style></head>
<body>{''.join(pages_en)}</body></html>'''

    (out_dir / 'barn_strikk_brodert_no.html').write_text(doc_no, encoding='utf-8')
    (out_dir / 'barn_strikk_brodert_en.html').write_text(doc_en, encoding='utf-8')
    print('OK', slug, len(doc_no), 'tegn (no),', len(doc_en), 'tegn (en)')


for v in VARIANTS:
    build(v)
