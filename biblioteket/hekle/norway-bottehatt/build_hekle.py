# -*- coding: utf-8 -*-
"""Genererer LME-strikkeoppskrift (Norge-bøttehatt) som HTML klar for PDF-print."""
import base64, html, pathlib

BASE = pathlib.Path(__file__).parent
PHOTO = pathlib.Path('/root/.claude/uploads/8a2defc1-69f7-5b9a-9a21-28d0d3730f69/7785364c-4E168E657A324A48BB6B5D4B9B2FD459.png')

# ---------- farger ----------
RED   = '#C8102E'
NAVY  = '#00205B'
CREAM = '#F8F4EA'
INK   = '#3f3f3f'
PINK  = '#df5f93'
TEAL  = '#4aa7a4'

# ---------- diagramdata ----------
LETTERS5 = {
    'N': ["####...##","####...##","##.##..##","##.##..##","##..##.##","##..##.##","##..##.##","##...####","##...####","##....###","##....###"],
    'O': [".#######.","#########","##.....##","##.....##","##.....##","##.....##","##.....##","##.....##","##.....##","#########",".#######."],
    'R': ["########.","#########","##.....##","##.....##","##.....##","#########","########.","##.###...","##..###..","##...###.","##....###"],
    'W': ["##.....##","##.....##","##.....##","##.....##","##.....##","##.....##","##..#..##","##.###.##","####.####","###...###","##.....##"],
    'A': [".#######.","#########","##.....##","##.....##","#########","#########","##.....##","##.....##","##.....##","##.....##","##.....##"],
    'Y': ["##.....##","##.....##",".##...##.","..##.##..","..#####..","...###...","...###...","...###...","...###...","...###...","...###..."],
    'G': [".#######.","#########","##.....##","##.......","##.......","##...####","##...####","##.....##","##.....##","#########",".#######."],
    'E': ["#########","#########","##.......","##.......","#######..","#######..","##.......","##.......","##.......","#########","#########"],
}
BIG_R = ["######.","#.....#","#.....#","#.....#","######.","#..#...","#...#..","#....#.","#.....#"]
BIG_O = ["..###..",".#...#.","#.....#","#.....#","#.....#","#.....#","#.....#",".#...#.","..###.."]
FLAG = [
    "RRRWBBWRRRRRR","RRRWBBWRRRRRR","RRRWBBWRRRRRR",
    "WWWWBBWWWWWWW","BBBBBBBBBBBBB","BBBBBBBBBBBBB","WWWWBBWWWWWWW",
    "RRRWBBWRRRRRR","RRRWBBWRRRRRR","RRRWBBWRRRRRR",
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

CMAP = {'.': RED, '#': CREAM, 'R': RED, 'W': '#ffffff', 'B': NAVY}

def chart_svg(rows, cell=22, numbers=False, title=None):
    """Rutediagram som SVG. rows: liste med strenger, topp til bunn."""
    w, h = len(rows[0]), len(rows)
    pad_b = 26 if numbers else 4
    pad_r = 26 if numbers else 4
    W, H = w*cell + 8 + pad_r, h*cell + 8 + pad_b
    p = [f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" '
         f'style="width:{W*0.28}mm;height:{H*0.28}mm">']
    for y, row in enumerate(rows):
        for x, ch in enumerate(row):
            p.append(f'<rect x="{4+x*cell}" y="{4+y*cell}" width="{cell}" height="{cell}" '
                     f'fill="{CMAP[ch]}" stroke="rgba(0,0,0,0.28)" stroke-width="1"/>')
    p.append(f'<rect x="4" y="4" width="{w*cell}" height="{h*cell}" fill="none" '
             f'stroke="#3f3f3f" stroke-width="2.5" rx="1"/>')
    if numbers:
        for x in range(w):
            p.append(f'<text x="{4+x*cell+cell/2}" y="{4+h*cell+16}" font-size="11" '
                     f'text-anchor="middle" fill="#666" font-family="sans-serif">{x+1}</text>')
        for y in range(h):
            yy = 4 + y*cell + cell/2 + 4
            p.append(f'<text x="{4+w*cell+8}" y="{yy}" font-size="11" fill="#666" '
                     f'font-family="sans-serif">{h-y}</text>')
    p.append('</svg>')
    svg = ''.join(p)
    if title:
        return (f'<div class="chartbox"><div class="chartttl">{html.escape(title)}</div>{svg}</div>')
    return f'<div class="chartbox">{svg}</div>'

def strip_svg(parts, total_label):
    """Plasseringsstripe: bokser med bredde etter maskeantall."""
    scale = 9.5
    gap = 0
    x = 6
    boxes = []
    for label, m, kind in parts:
        wpx = m*scale
        fill = '#fdeef4' if kind == 'sp' else '#ffffff'
        stroke = '#e9b6cc' if kind == 'sp' else PINK
        boxes.append(f'<rect x="{x}" y="8" width="{wpx}" height="46" rx="8" fill="{fill}" '
                     f'stroke="{stroke}" stroke-width="2"/>')
        fs = 13 if kind != 'sp' else 11
        boxes.append(f'<text x="{x+wpx/2}" y="30" text-anchor="middle" font-size="{fs}" '
                     f'font-family="sans-serif" font-weight="bold" fill="{"#c2688f" if kind=="sp" else "#3f3f3f"}">{html.escape(label)}</text>')
        boxes.append(f'<text x="{x+wpx/2}" y="47" text-anchor="middle" font-size="11" '
                     f'font-family="sans-serif" fill="#888">{m} m</text>')
        x += wpx + gap
    W = x + 6
    svg = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} 84" style="width:100%">'
           + ''.join(boxes) +
           f'<text x="{W/2}" y="76" text-anchor="middle" font-size="13" font-family="sans-serif" '
           f'font-weight="bold" fill="#c2688f">{html.escape(total_label)}</text></svg>')
    return svg

def mini_flag(w=34):
    h = round(w*10/13)
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 26 20" '
            f'style="width:{w}px;height:{h}px;border-radius:3px;box-shadow:0 1px 3px rgba(0,0,0,.25)">'
            f'<rect width="26" height="20" fill="{RED}"/>'
            f'<rect x="6" width="6" height="20" fill="#fff"/><rect y="7" width="26" height="6" fill="#fff"/>'
            f'<rect x="7.5" width="3" height="20" fill="{NAVY}"/><rect y="8.5" width="26" height="3" fill="{NAVY}"/>'
            f'</svg>')

# ---------- hatteskisse ----------
def hat_schematic():
    return f'''
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 350" style="width:100%">
  <defs>
    <marker id="ah" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">
      <path d="M0,0 L8,4 L0,8 z" fill="#777"/>
    </marker>
  </defs>
  <!-- mål: omkrets (over hatten) -->
  <line x1="190" y1="42" x2="450" y2="42" stroke="#777" stroke-width="2" marker-start="url(#ah)" marker-end="url(#ah)"/>
  <text x="320" y="34" text-anchor="middle" font-size="15" font-family="sans-serif" fill="#555">omkrets rundt: 49 (53) 57 cm</text>
  <!-- kroppen -->
  <path d="M190,235 L190,180 Q190,88 320,88 Q450,88 450,180 L450,235 Z" fill="{RED}" stroke="#8f0a20" stroke-width="2"/>
  <!-- fellelinjer på toppen -->
  <path d="M320,88 Q290,130 272,180 M320,88 Q320,135 320,180 M320,88 Q350,130 368,180 M320,88 Q255,125 218,168 M320,88 Q385,125 422,168" stroke="#a30d24" stroke-width="2" fill="none"/>
  <!-- striper -->
  <rect x="190" y="206" width="260" height="9" fill="#fff"/>
  <rect x="190" y="215" width="260" height="10" fill="{NAVY}"/>
  <rect x="190" y="225" width="260" height="9" fill="#fff"/>
  <!-- brem med bølgekant -->
  <path d="M190,235 L140,292 Q152,306 164,292 Q176,278 188,292 Q200,306 212,292 Q224,278 236,292 Q248,306 260,292 Q272,278 284,292 Q296,306 308,292 Q320,278 332,292 Q344,306 356,292 Q368,278 380,292 Q392,306 404,292 Q416,278 428,292 Q440,306 452,292 Q464,278 476,292 Q488,306 500,292 L450,235 Z" fill="{RED}" stroke="#8f0a20" stroke-width="2"/>
  <path d="M181,245 L162,267 L478,267 L459,245 Z" fill="#ffffff" opacity="0.92"/>
  <path d="M173,254 L166,262 L474,262 L467,254 Z" fill="{NAVY}"/>
  <!-- mål: høyde -->
  <line x1="512" y1="88" x2="512" y2="235" stroke="#777" stroke-width="2" marker-start="url(#ah)" marker-end="url(#ah)"/>
  <text x="522" y="156" font-size="15" font-family="sans-serif" fill="#555">høyde</text>
  <text x="522" y="175" font-size="15" font-family="sans-serif" fill="#555">ca. 16</text>
  <text x="522" y="194" font-size="15" font-family="sans-serif" fill="#555">(17) 18 cm</text>
  <!-- deler -->
  <text x="150" y="100" font-size="15" font-family="sans-serif" fill="#555" text-anchor="end">4. toppen</text>
  <line x1="156" y1="96" x2="280" y2="105" stroke="#aaa" stroke-width="1.5"/>
  <text x="118" y="190" font-size="15" font-family="sans-serif" fill="#555" text-anchor="end">3. hoveddelen</text>
  <line x1="124" y1="186" x2="192" y2="190" stroke="#aaa" stroke-width="1.5"/>
  <text x="116" y="226" font-size="15" font-family="sans-serif" fill="#555" text-anchor="end">2. stripene</text>
  <line x1="122" y1="222" x2="190" y2="218" stroke="#aaa" stroke-width="1.5"/>
  <text x="110" y="292" font-size="15" font-family="sans-serif" fill="#555" text-anchor="end">1. bølgekanten</text>
  <line x1="116" y1="288" x2="146" y2="282" stroke="#aaa" stroke-width="1.5"/>
  <text x="320" y="332" text-anchor="middle" font-size="14" font-family="sans-serif" fill="#888">Tallene står slik: barn (dame) herre</text>
</svg>'''

# ---------- maskesting-illustrasjon ----------
def vgrid(cols, rows, sw=34, sh=26, ox=10, oy=14, hi=None, done=None):
    """Rutenett av strikke-V-er. hi: (c,r) som markeres. done: (c,r) ferdig hvit V."""
    out = []
    for r in range(rows):
        for c in range(cols):
            x = ox + c*sw
            y = oy + r*sh
            col = RED
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

def stranded_panels():
    """Tre paneler som viser flerfargestrikk: strikk etter diagram, flott bak, fest lange flott."""
    def darker(c):
        return {'#C8102E': '#a30d24', '#F8F4EA': '#d9d2be', '#00205B': '#001640', '#ffffff': '#cccccc'}.get(c, '#999')
    def vrow(colors, sw=21, sh=24, ox=19, oy=34):
        out = []
        for i, c in enumerate(colors):
            x = ox + i*sw; y = oy
            wpath = (f'M{x+3},{y+sh-2} Q{x+sw*0.30},{y+sh*0.35} {x+sw/2},{y+2} '
                     f'Q{x+sw*0.70},{y+sh*0.35} {x+sw-3},{y+sh-2}')
            out.append(f'<path d="{wpath}" fill="none" stroke="{darker(c)}" stroke-width="8" stroke-linecap="round"/>')
            out.append(f'<path d="{wpath}" fill="none" stroke="{c}" stroke-width="6" stroke-linecap="round"/>')
        return ''.join(out), ox, sw, oy, sh
    def tag(cx, text, w=None):
        w = w or (len(text)*6.1 + 14)
        x = cx - w/2
        return (f'<rect x="{x}" y="6" width="{w}" height="17" rx="8.5" fill="#e9f6f5" '
                f'stroke="{TEAL}" stroke-width="1.5"/>'
                f'<text x="{cx}" y="18.4" text-anchor="middle" font-size="11" '
                f'font-family="sans-serif" font-weight="bold" fill="#2e8e8a">{html.escape(text)}</text>')
    panels = []

    # Panel 1: forsiden, strikk hver maske i fargen diagrammet viser
    cols = [RED, RED, CREAM, CREAM, CREAM, RED]
    g, ox, sw, oy, sh = vrow(cols)
    g1 = g + tag(78, 'forsiden')
    panels.append((1, 'Strikk hver maske i fargen diagrammet viser. Rød er bunnen, hvit (eller blå) er mønsteret.', g1))

    # Panel 2: baksiden, flott ligger løst bak
    y0 = 40
    g2 = tag(78, 'baksiden')
    # stitch-topper
    for i in range(6):
        x = 20 + i*22
        g2 += f'<path d="M{x},{y0} q6,-9 12,0" fill="none" stroke="#e2b7c6" stroke-width="4" stroke-linecap="round"/>'
    # flott (løs tråd) som bukter seg bak
    g2 += (f'<path d="M22,{y0+22} q11,7 22,0 q11,-7 22,0 q11,7 22,0 q11,-7 22,0 q11,7 22,0" '
           f'fill="none" stroke="{CREAM}" stroke-width="5" stroke-linecap="round"/>')
    g2 += (f'<path d="M22,{y0+22} q11,7 22,0 q11,-7 22,0 q11,7 22,0 q11,-7 22,0 q11,7 22,0" '
           f'fill="none" stroke="#d9d2be" stroke-width="1.5" stroke-linecap="round" opacity="0.7"/>')
    panels.append((2, 'Fargen du ikke strikker med, henger løst på baksiden. Det kalles en flott. Hold den løs, ikke stram!', g2))

    # Panel 3: fest lange flott (over 5 masker)
    y1 = 40
    g3 = tag(78, 'lange flott')
    for i in range(6):
        x = 20 + i*22
        g3 += f'<path d="M{x},{y1} q6,-9 12,0" fill="none" stroke="#e2b7c6" stroke-width="4" stroke-linecap="round"/>'
    # lang flott som fanges under en maske på midten
    g3 += (f'<path d="M22,{y1+20} L64,{y1+20} Q78,{y1+30} 92,{y1+20} L134,{y1+20}" '
           f'fill="none" stroke="{CREAM}" stroke-width="5" stroke-linecap="round"/>')
    g3 += f'<circle cx="78" cy="{y1+27}" r="5" fill="none" stroke="{TEAL}" stroke-width="2.5"/>'
    panels.append((3, 'Er det mer enn 5 masker mellom fargene, fanger du den lange flotten under en maske på veien. Da blir den ikke hengende.', g3))

    out = ['<div class="dsteps">']
    for n, txt, g in panels:
        out.append(f'''<div class="dstep">
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 156 108" style="width:100%">
    <rect x="1" y="1" width="154" height="106" rx="10" fill="#fff" stroke="#f2bfd4" stroke-width="2"/>
    {g}
  </svg>
  <div class="dnum">{n}</div>
  <p>{txt}</p>
</div>''')
    out.append('</div>')
    return ''.join(out)

def dupstitch_panels():
    sw, sh, ox, oy = 32, 26, 12, 30
    def pt(c, r, fx, fy):  # punkt i maske (c,r); fx,fy 0..1
        return ox + c*sw + fx*sw, oy + r*sh + fy*sh
    def tag(cx, text, w=None):  # hvit etikett-pille øverst i panelet
        w = w or (len(text)*6.3 + 14)
        x = cx - w/2
        return (f'<rect x="{x}" y="6" width="{w}" height="17" rx="8.5" fill="#e9f6f5" '
                f'stroke="{TEAL}" stroke-width="1.5"/>'
                f'<text x="{cx}" y="18.4" text-anchor="middle" font-size="11" '
                f'font-family="sans-serif" font-weight="bold" fill="#2e8e8a">{html.escape(text)}</text>')
    panels = []

    # Panel 1: nålen opp i roten av masken (midt nederst)
    bx, by = pt(1, 1, 0.5, 1.0)
    g1 = vgrid(4, 3, sw=sw, sh=sh, ox=ox, oy=oy, hi=(1, 1))
    g1 += f'<circle cx="{bx}" cy="{by-2}" r="6" fill="{TEAL}"/>'
    g1 += f'<path d="M{bx},{by+24} L{bx},{by+5}" stroke="{TEAL}" stroke-width="3" marker-end="url(#at)"/>'
    g1 += tag(78, 'stikk opp her')
    panels.append((1, 'Stikk nålen opp nedenfra, i bunnen av masken (roten av V-en).', g1))

    # Panel 2: under begge beina til masken over
    lx, ly = pt(1, 0, 0.14, 0.92)
    rx, ry = pt(1, 0, 0.86, 0.92)
    g2 = vgrid(4, 3, sw=sw, sh=sh, ox=ox, oy=oy, hi=(1, 1))
    g2 += (f'<path d="M{bx},{by-2} Q{lx-14},{ly-8} {lx-2},{ly-14} '
           f'M{rx+2},{ry-14} Q{rx+16},{ry-6} {rx+10},{ry+4}" '
           f'stroke="{CREAM}" stroke-width="5" fill="none" stroke-linecap="round"/>')
    g2 += (f'<path d="M{lx+2},{ly-10} L{rx-2},{ry-10}" stroke="#c9a94e" stroke-width="4" '
           f'stroke-linecap="round" stroke-dasharray="5 4"/>')
    g2 += f'<path d="M{rx+10},{ry+4} L{rx+13},{ry+14}" stroke="{TEAL}" stroke-width="3" marker-end="url(#at)"/>'
    g2 += tag(78, 'under masken over')
    panels.append((2, 'Før nålen inn under begge beina til masken rett over. Dra garnet gjennom.', g2))

    # Panel 3: ned i samme hull, ferdig V
    g3 = vgrid(4, 3, sw=sw, sh=sh, ox=ox, oy=oy, hi=(1, 1), done=(1, 1))
    g3 += f'<path d="M{bx+16},{by+16} L{bx+3},{by+1}" stroke="{TEAL}" stroke-width="3" marker-end="url(#at)"/>'
    g3 += tag(78, 'ned i samme hull')
    panels.append((3, 'Stikk nålen ned i samme hull som du kom opp. Ferdig! Den hvite V-en ligger nå oppå den røde masken.', g3))

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

# ---------- foto ----------
photo_b64 = base64.b64encode(PHOTO.read_bytes()).decode()
photo_src = f'data:image/png;base64,{photo_b64}'

# ---------- byggeklosser ----------
def page(body, num, right_label='LME STRIKK'):
    return f'''<div class="page">
  <div class="band"><span>LITTLE MONTESSORI EXPLORERS</span></div>
  <div class="rside"><span>{right_label}</span></div>
  <div class="phead">
    <div class="ph1">LITTLE MONTESSORI EXPLORERS</div>
    <div class="ph2">LME HEKLEOPPSKRIFT&nbsp;&nbsp;|&nbsp;&nbsp;NORWAY-BØTTEHATT</div>
  </div>
  <div class="content">{body}</div>
  <div class="pfoot">&mdash;&nbsp;{num}&nbsp;&mdash;</div>
</div>'''

def banner(t):   return f'<div class="banner"><h1>{t}</h1></div>'
def pink(t):     return f'<div class="pillwrap"><div class="pill pinkpill">{t}</div></div>'
def tealp(t):    return f'<div class="pillwrap"><div class="pill tealpill">{t}</div></div>'
def card(inner): return f'<div class="card">{inner}</div>'
def cream(inner):return f'<div class="cream">{inner}</div>'
def ul(items):   return '<ul class="dots">' + ''.join(f'<li>{i}</li>' for i in items) + '</ul>'
def steps(items, start=1):
    return '<ol class="steps">' + ''.join(
        f'<li><span class="snum">{start+i}</span><div>{t}</div></li>' for i, t in enumerate(items)) + '</ol>'

pages = []

def word_cells(word, x0, y0, cell, gap, color=CREAM):
    out = []
    x = x0
    for ch in word:
        rows = LETTERS5[ch]
        for r, row in enumerate(rows):
            for c, v in enumerate(row):
                if v == '#':
                    out.append(f'<rect x="{x+c*cell:.1f}" y="{y0+r*cell:.1f}" width="{cell:.1f}" height="{cell:.1f}" fill="{color}"/>')
        x += 9*cell + gap
    return ''.join(out), x - gap  # returnerer svg + slutt-x

def cover_illustration():
    W, H = 460, 350
    p = [f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" style="width:118mm">']
    # dome
    p.append(f'<path d="M80,215 L80,150 Q80,48 230,48 Q380,48 380,150 L380,215 Z" fill="{RED}" stroke="#8f0a20" stroke-width="2.5"/>')
    p.append(f'<path d="M230,48 Q188,112 165,210 M230,48 Q230,125 230,210 M230,48 Q272,112 295,210 M230,48 Q150,108 100,196 M230,48 Q310,108 360,196" stroke="#a30d24" stroke-width="1.5" fill="none" opacity="0.6"/>')
    # NORWAY på kappen (hvite blokkbokstaver)
    cell = 3.0; gap = cell
    total = 6*9*cell + 5*gap
    svg, _ = word_cells('NORWAY', W/2 - total/2, 110, cell, gap)
    p.append(svg)
    # striper
    p.append(f'<rect x="80" y="188" width="300" height="9" fill="#fff"/>')
    p.append(f'<rect x="80" y="197" width="300" height="10" fill="{NAVY}"/>')
    p.append(f'<rect x="80" y="207" width="300" height="9" fill="#fff"/>')
    # brem med bølgekant
    wave = 'M80,215 L44,270'
    xw = 44
    up = True
    while xw < 416:
        nxt = xw + 24
        cx = xw + 12
        wave += f' Q{cx},{283 if up else 257} {nxt},270'
        xw = nxt; up = not up
    wave += ' L380,215 Z'
    p.append(f'<path d="{wave}" fill="{RED}" stroke="#8f0a20" stroke-width="2.5"/>')
    p.append(f'<path d="M70,226 L52,248 L408,248 L390,226 Z" fill="#ffffff" opacity="0.92"/>')
    p.append(f'<path d="M62,235 L55,243 L405,243 L398,235 Z" fill="{NAVY}"/>')
    p.append('</svg>')
    return ''.join(p)

def otab(rows):
    h = '<tr><th>Omg</th><th>Beskrivelse</th><th>Masker</th></tr>'
    body = ''.join('<tr><td><b>' + str(a) + '</b></td><td>' + b + '</td><td>' + str(c) + '</td></tr>' for a, b, c in rows)
    return '<table class="t">' + h + body + '</table>'

def cme(t):
    return cream('<p class="creamtitle">' + t + '</p>')

# ============ SIDE 1: FORSIDE ============
pages.append(page(f'''
<div class="coverimg">{cover_illustration()}</div>
<div class="covertag">LME HEKLEOPPSKRIFT</div>
<div class="coverbanner">
  <div class="cflag">{mini_flag(40)}</div>
  <h1 class="covertitle">NORWAY-BØTTEHATT</h1>
  <div class="cflag">{mini_flag(40)}</div>
</div>
<div class="subpill">HEKLET, MED BØLGET BREM</div>
{card('<p class="center">En rød bøttehatt heklet i bomull, med "NORWAY" i hvite blokkbokstaver '
      'rundt, flaggstriper og en bølget brem. Bokstavene hekles rett inn med tapestry-heikling. '
      'Passer voksen (hodeomkrets 54 til 57 cm). En fin heiahatt til 17. mai og fotball-VM.</p>')}
<div class="byline">
  <div class="by1">Av Renate Dahl</div>
  <div class="by2">Little Montessori Explorers</div>
  <div class="by3">lmexplorers.com</div>
</div>
<div class="notecard"><span class="noteemo">&#129525;</span>
  <p><i>TIPS: Les hele oppskriften en gang først. Heklefastheten avgjør størrelsen, så lag gjerne
  en liten prøvelapp.</i></p>
</div>
''', 1))

# ============ SIDE 2: STØRRELSE OG MATERIALER ============
pages.append(page(f'''
{banner('STØRRELSE OG MATERIALER')}
{tealp('STØRRELSE')}
{card('<p>Passer hodeomkrets <b>54 til 57 cm</b> (voksen).</p>'
      '<table class="t"><tr><th>Ferdig mål</th><th></th></tr>'
      '<tr><td>Omkrets</td><td>ca. 56 cm</td></tr>'
      '<tr><td>Høyde (sidene, uten brem)</td><td>ca. 20 til 21 cm</td></tr>'
      '<tr><td>Brembredde (når bølget)</td><td>ca. 7 til 8 cm</td></tr>'
      '<tr><td>Diameter på toppen</td><td>ca. 16 cm</td></tr></table>')}
{tealp('MATERIALER')}
{card('<p><b>DROPS Paris</b> (100 % bomull):</p>'
      '<table class="t"><tr><th>Farge</th><th>Mengde</th></tr>'
      '<tr><td><span class="dot" style="background:'+RED+'"></span> Rød (06)</td><td>4 nøster</td></tr>'
      '<tr><td><span class="dot" style="background:#fff;border:1px solid #bbb"></span> Hvit (01)</td><td>1 nøste</td></tr>'
      '<tr><td><span class="dot" style="background:'+NAVY+'"></span> Marineblå (17)</td><td>1 nøste</td></tr></table>'
      + ul(['heklenål <b>5 mm</b>', 'maskemarkører', 'stoppenål', 'saks']))}
''', 2))

# ============ SIDE 3: HEKLEFASTHET OG FORKORTELSER ============
pages.append(page(f'''
{banner('HEKLEFASTHET OG ORDLISTE')}
{pink('HEKLEFASTHET, DEN VIKTIGE NØKKELEN')}
{card('<p><b>14 fm x 16 omganger = 10 x 10 cm</b> (heklet i spiral med fastmasker på nål 5 mm).</p>'
      '<p>Hekle en liten prøvelapp og mål. Er lappen for stor, bytt til tynnere nål. For liten, '
      'bytt til tykkere nål. Riktig fasthet gir riktig størrelse.</p>')}
{tealp('FORKORTELSER')}
{card('<table class="t tl"><tr><th>Kort</th><th>Betyr</th></tr>'
      '<tr><td><b>lm</b></td><td>luftmaske</td></tr>'
      '<tr><td><b>fm</b></td><td>fastmaske</td></tr>'
      '<tr><td><b>kjm</b></td><td>kjedemaske</td></tr>'
      '<tr><td><b>økn</b></td><td>økning (2 fm i samme maske)</td></tr>'
      '<tr><td><b>m</b></td><td>maske(r)</td></tr>'
      '<tr><td><b>( )</b></td><td>totalt antall masker på omgangen</td></tr></table>')}
{cme('Hele hatten hekles i spiral med fastmasker, uten å avslutte omgangene.')}
''', 3))

# ============ SIDE 4: DEL 1 TOPPEN ============
pages.append(page(f'''
{banner('DEL 1: TOPPEN')}
<p>Toppen hekles i spiral (rundt) med fastmasker, nedenfra magisk ring og utover. Sett en
maskemarkør i første maske, og flytt den opp for hver omgang.</p>
{card(otab([
  (1, '6 fm i magisk ring', 6),
  (2, 'økn x 6', 12),
  (3, '(1 fm, økn) x 6', 18),
  (4, '(2 fm, økn) x 6', 24),
  (5, '(3 fm, økn) x 6', 30),
  (6, '(4 fm, økn) x 6', 36),
  (7, '(5 fm, økn) x 6', 42),
  (8, '(6 fm, økn) x 6', 48),
  (9, '(7 fm, økn) x 6', 54),
  (10, '(8 fm, økn) x 6', 60),
  (11, '(9 fm, økn) x 6', 66),
  (12, '(10 fm, økn) x 6', 72),
  (13, '(11 fm, økn) x 6', 78),
]))}
{cme('Toppen er ferdig. Diameter ca. 16 cm. Du har nå 78 masker.')}
''', 4))

# ============ SIDE 5: DEL 2 SIDENE ============
pages.append(page(f'''
{banner('DEL 2: SIDENE MED NORWAY')}
<p>Nå hekler du rett opp i spiral, uten økninger. Du har 78 masker på hver omgang.</p>
{card(otab([
  ('14 til 18', '78 fm med rød', 78),
  ('19 til 28', 'Hekle inn NORWAY med hvitt (se side 6)', 78),
  ('29 til 31', '78 fm med rød', 78),
]))}
{pink('VIKTIG: TAPESTRY-HEIKLING')}
{card('<p>"NORWAY" hekles rett inn i sidene med tapestry-heikling (innheklede masker), ikke '
      'brodert på etterpå.</p>'
      + ul([
      'Legg den hvite tråden oppå omgangen og hekle de røde maskene rundt den, så den ligger '
      'gjemt inni.',
      'Der en bokstav skal være, henter du opp den hvite tråden og hekler med hvit i stedet.',
      'Bytt farge i den <b>siste bevegelsen</b> på masken før: hent den nye fargen gjennom de to '
      'siste løkkene. Da blir skiftet reint.',
      'Hold tråden som ligger inni løs, så hatten ikke strammer.',
      ]))}
''', 5))

# ============ SIDE 6: DIAGRAM NORWAY ============
front_strip = strip_svg([
    ('7 m rød',7,'sp'),('N',9,'x'),('',2,'sp'),('O',9,'x'),('',2,'sp'),('R',9,'x'),('',2,'sp'),
    ('W',9,'x'),('',2,'sp'),('A',9,'x'),('',2,'sp'),('Y',9,'x'),('7 m rød',7,'sp'),
], 'Til sammen 78 masker rundt')
pages.append(page(f'''
{banner('DIAGRAM: NORWAY')}
<p>Hver rute = 1 maske x 1 omgang. Hvit rute: hekle med hvit. Rød rute: hekle med rød. Hver
bokstav er 9 ruter bred, og det er 2 røde masker mellom bokstavene. Les nedenfra og opp.</p>
{tealp('BOKSTAVENE')}
<div class="chartrow tight">
{chart_svg(LETTERS5['N'], cell=12)}{chart_svg(LETTERS5['O'], cell=12)}{chart_svg(LETTERS5['R'], cell=12)}
</div>
<div class="chartrow tight">
{chart_svg(LETTERS5['W'], cell=12)}{chart_svg(LETTERS5['A'], cell=12)}{chart_svg(LETTERS5['Y'], cell=12)}
</div>
{pink('PLASSERING RUNDT (78 MASKER)')}
{card(f'<div class="stripwrap">{front_strip}</div>'
  + ul([
  'Start ved maskemarkøren (midt bak). Hekle først 7 røde masker.',
  'Så hekler du bokstavene med 2 røde masker mellom hver, og avslutter med 7 røde masker.',
  'Nederste rad av bokstavene er omgang 19. Fortsett oppover til omgang 28.',
  ]))}
''', 6))

# ============ SIDE 7: DEL 3 BREM ============
pages.append(page(f'''
{banner('DEL 3: BREMMEN (ØKNINGER)')}
<p>Nå bøyer bremmen seg utover. Du øker jevnt annenhver omgang.</p>
{card(otab([
  (32, '78 fm med rød', 78),
  (33, 'økn x 12 jevnt fordelt', 90),
  (34, '90 fm med rød', 90),
  (35, 'økn x 12 jevnt fordelt', 102),
  (36, '102 fm med rød', 102),
  (37, 'økn x 12 jevnt fordelt', 114),
  (38, '114 fm med rød', 114),
]))}
{cme('"Jevnt fordelt" betyr at du deler økningene likt rundt. Omgang 33: øk omtrent for hver '
     '6. maske. Det trenger ikke bli helt nøyaktig.')}
''', 7))

# ============ SIDE 8: DEL 4 OG 5 ============
pages.append(page(f'''
{banner('DEL 4: FLAGGSTRIPER')}
<p>Bytt farge på hver omgang. Hekle 1 hel omgang i hver farge.</p>
{card(otab([
  (39, 'Hvit', 114),
  (40, 'Marineblå', 114),
  (41, 'Hvit', 114),
  (42, 'Rød', 114),
]))}
{banner('DEL 5: BØLGET KANT')}
<p>Helt ytterst lager du den bølgete kanten.</p>
{card(otab([
  (43, 'økn x 18 jevnt fordelt', 132),
  (44, '132 fm', 132),
  (45, 'Avslutt med kjedemasker (eller krepsemasker, valgfritt)', 132),
]))}
{cme('Vil du ha ekstra tydelige bølger? Avslutt slik rundt: 3 fm i samme maske, 1 fm, hopp over '
     '2 masker, og gjenta. Da bukter kanten seg fint.')}
''', 8))

# ============ SIDE 9: FERDIG OG STELL ============
pages.append(page(f'''
{banner('FERDIG OG STELL')}
{tealp('SLIK BLIR DET UNDERVEIS')}
{card(ul([
  '<b>1. Toppen:</b> en flat, rund skive (ca. 16 cm).',
  '<b>2. Sidene:</b> rett opp, med NORWAY heklet inn.',
  '<b>3. Bremmen:</b> begynner å bøye seg utover.',
  '<b>4. Flaggstriper:</b> hvit, blå, hvit, rød.',
  '<b>5. Bølget kant:</b> ytterst, som små skvulp.',
]))}
{pink('VASK OG PLEIE')}
{card(ul([
  'Håndvask eller ullprogram på 30 grader.',
  'Bruk gjerne vaskepose.',
  'Tørkes flatt. Form den bølgete bremmen mens den er våt.',
  'Ikke vri.',
]))}
{cme('Gratulerer! Nå har du heklet din egen NORWAY-hatt. Heia Norge!')}
<div class="endflag">{mini_flag(64)}</div>
<div class="byline">
  <div class="by2">Renate Dahl &middot; Little Montessori Explorers &middot; lmexplorers.com</div>
</div>
''', 9))

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
.band span {{ position:absolute; left:50%; top:75%; transform:translate(-50%,-50%) ;
  writing-mode:vertical-rl; text-orientation:mixed; rotate:180deg;
  font-family:var(--font-head); font-size:6.5pt; letter-spacing:3.5px; color:#fff; white-space:nowrap; }}
.rside {{ position:absolute; right:2.5mm; top:40%; }}
.rside span {{ writing-mode:vertical-rl; font-family:var(--font-head); font-size:6pt;
  letter-spacing:2.5px; color:#9a9a9a; white-space:nowrap; }}
.phead {{ text-align:center; padding-top:9mm; }}
.ph1 {{ font-family:var(--font-head); font-weight:600; font-size:7pt; letter-spacing:4px; color:#7f96a8; }}
.ph2 {{ font-family:var(--font-head); font-weight:600; font-size:6.3pt; letter-spacing:3px; color:#d795ae; margin-top:1.6mm; }}
.content {{ padding:5mm 16mm 0 20mm; }}
.pfoot {{ position:absolute; bottom:6.5mm; left:0; right:0; text-align:center;
  font-family:var(--font-head); font-weight:700; font-size:10pt; color:#8a8a8a; }}

.banner {{ background:#f5efb2; border-radius:14px; padding:3.6mm 6mm; margin:2mm 0 4.5mm;
  box-shadow:0 1px 4px rgba(0,0,0,.08); text-align:center; }}
.banner h1 {{ font-family:var(--font-head); font-weight:800; font-size:17.5pt; color:{INK};
  letter-spacing:.5px; text-transform:uppercase; }}
.pillwrap {{ text-align:center; margin:4.5mm 0 3mm; }}
.pill {{ display:inline-block; border-radius:999px; padding:2.4mm 9mm;
  font-family:var(--font-head); font-weight:700; font-size:11pt; color:#fff;
  letter-spacing:.5px; text-transform:uppercase; box-shadow:0 1px 4px rgba(0,0,0,.12); }}
.pinkpill {{ background:{PINK}; }}
.tealpill {{ background:{TEAL}; }}
.card {{ background:rgba(255,255,255,.93); border:2px solid #f2bfd4; border-radius:16px;
  padding:4mm 6mm; margin:0 0 4mm; box-shadow:0 1px 5px rgba(0,0,0,.06); }}
.cream {{ background:#fdf3ec; border:2px solid #f2bfd4; border-radius:16px;
  padding:4mm 6mm; margin:4mm 0; text-align:center; }}
.creamtitle {{ font-family:var(--font-head); font-weight:700; font-size:11.5pt; color:{TEAL}; }}
p {{ font-size:11pt; line-height:1.55; margin-bottom:2.2mm; }}
p.small, .small {{ font-size:9.5pt; color:#777; }}
p.center {{ text-align:center; }}
.bignum {{ font-family:var(--font-head); font-weight:700; color:{PINK}; font-size:12pt; }}
ul.dots {{ list-style:none; }}
ul.dots li {{ font-size:11pt; line-height:1.5; padding-left:5.5mm; position:relative; margin:1.6mm 0; }}
ul.dots li::before {{ content:'•'; position:absolute; left:1mm; color:{PINK}; font-weight:bold; }}
ol.steps {{ list-style:none; }}
ol.steps li {{ display:flex; gap:3.5mm; align-items:flex-start; background:rgba(255,255,255,.93);
  border:2px solid #f2bfd4; border-radius:14px; padding:3mm 5mm; margin-bottom:2.6mm; }}
ol.steps li div {{ font-size:10.8pt; line-height:1.5; }}
.snum {{ flex:0 0 auto; width:7.5mm; height:7.5mm; border-radius:50%; background:{PINK}; color:#fff;
  font-family:var(--font-head); font-weight:700; font-size:11pt; display:flex;
  align-items:center; justify-content:center; margin-top:.5mm; }}
table.t {{ width:100%; border-collapse:collapse; margin:2.5mm 0; }}
table.t th {{ font-family:var(--font-head); font-weight:700; font-size:9.5pt; color:{PINK};
  text-align:left; padding:1.6mm 2.5mm; border-bottom:2px solid #f2bfd4; }}
table.t td {{ font-size:10pt; padding:1.6mm 2.5mm; border-bottom:1px solid #f6dbe7; line-height:1.4; }}
table.tl td:first-child {{ white-space:nowrap; }}
.dot {{ display:inline-block; width:3.5mm; height:3.5mm; border-radius:50%; vertical-align:-0.5mm; margin-right:1.5mm; }}

.coverimg {{ text-align:center; margin:3mm 0 3mm; }}
.coverimg img {{ width:104mm; border-radius:14px; box-shadow:0 3px 10px rgba(0,0,0,.18);
  border:3mm solid #fff; }}
.covertag {{ text-align:center; font-family:var(--font-head); font-size:8pt; letter-spacing:3px;
  color:#8a8a8a; margin:1mm 0 2.5mm; }}
.coverbanner {{ display:flex; align-items:center; justify-content:center; gap:5mm;
  background:#f5efb2; border-radius:16px; padding:4mm 6mm; box-shadow:0 1px 5px rgba(0,0,0,.1); }}
.covertitle {{ font-family:var(--font-head); font-weight:800; font-size:26pt; color:{INK}; letter-spacing:1px; }}
.subpill {{ margin:4mm auto; width:fit-content; background:#fdf9e3; border:2.5px solid {INK};
  border-radius:999px; padding:2.2mm 10mm; font-family:var(--font-head); font-weight:700;
  font-size:11.5pt; color:{INK}; letter-spacing:.5px; }}
.byline {{ text-align:center; margin-top:4.5mm; }}
.by1 {{ font-family:var(--font-head); font-weight:700; font-size:13pt; color:{TEAL}; }}
.by2 {{ font-size:10.5pt; color:#8a8a8a; margin-top:1mm; }}
.by3 {{ font-family:var(--font-head); font-weight:600; font-size:10pt; color:{PINK}; margin-top:.6mm; }}
.notecard {{ display:flex; gap:4mm; align-items:center; background:rgba(255,255,255,.8);
  border-radius:12px; padding:3.5mm 6mm; margin-top:5mm; }}
.notecard p {{ font-size:9.5pt; color:#777; margin:0; }}
.noteemo {{ font-size:16pt; }}
.cflag {{ line-height:0; }}

.chartrow {{ display:flex; gap:6mm; justify-content:center; align-items:flex-end;
  flex-wrap:wrap; margin:2.5mm 0 4mm; }}
.chartrow.tight {{ gap:4mm; margin:1.5mm 0 2.5mm; }}
.chartbox {{ text-align:center; }}
.chartttl {{ font-family:var(--font-head); font-weight:700; font-size:9pt; color:{PINK};
  margin-bottom:1.5mm; letter-spacing:.3px; }}
.stripwrap {{ margin:1mm 0 2mm; }}
.dsteps {{ display:flex; gap:4mm; }}
.dstep {{ flex:1; text-align:center; position:relative; }}
.dstep p {{ font-size:9.3pt; line-height:1.45; margin-top:1.5mm; text-align:left; }}
.dnum {{ position:absolute; top:-2.5mm; left:-1.5mm; width:7mm; height:7mm; border-radius:50%;
  background:{PINK}; color:#fff; font-family:var(--font-head); font-weight:700; font-size:10.5pt;
  display:flex; align-items:center; justify-content:center; box-shadow:0 1px 3px rgba(0,0,0,.2); }}
.endflag {{ text-align:center; margin:4mm 0 2mm; }}
'''

doc = f'''<!DOCTYPE html>
<html lang="no"><head><meta charset="utf-8">
<title>NORWAY-bøttehatt, LME hekleoppskrift</title>
<style>{css}</style></head>
<body>{''.join(pages)}</body></html>'''

(BASE / 'hekle.html').write_text(doc, encoding='utf-8')
print('OK', len(doc), 'tegn')
