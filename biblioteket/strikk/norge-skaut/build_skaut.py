# -*- coding: utf-8 -*-
"""Genererer LME-strikkeoppskrift (Norge-bøttehatt) som HTML klar for PDF-print."""
import base64, html, pathlib

BASE = pathlib.Path(__file__).parent
PHOTO = pathlib.Path('/root/.claude/uploads/8a2defc1-69f7-5b9a-9a21-28d0d3730f69/049ddb67-1D776597B8634D3C8B8C745077B4BCAD.png')

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
    <div class="ph2">LME STRIKKEOPPSKRIFT&nbsp;&nbsp;|&nbsp;&nbsp;NORGE-SKAUT</div>
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

def flag_rects(fx, fy, fw, fh):
    """Tegner et norsk flagg (rektangler), kryss forskjøvet mot venstre, ubrutt blå arm."""
    u = fw / 16.0  # bredde-enheter 4-1-2-1-8
    vx1 = fx + 4*u          # hvit loddrett start
    vx2 = fx + 5*u          # blå loddrett start
    hy = fy + fh*3/10.0     # hvit vannrett start
    hb = fy + fh*4/10.0     # blå vannrett start
    return (f'<rect x="{fx}" y="{fy}" width="{fw}" height="{fh}" fill="{RED}"/>'
            f'<rect x="{vx1}" y="{fy}" width="{2*u}" height="{fh}" fill="#fff"/>'
            f'<rect x="{fx}" y="{hy}" width="{fw}" height="{fh*4/10}" fill="#fff"/>'
            f'<rect x="{vx2}" y="{fy}" width="{u}" height="{fh}" fill="{NAVY}"/>'
            f'<rect x="{fx}" y="{hb}" width="{fw}" height="{fh*2/10}" fill="{NAVY}"/>'
            f'<rect x="{fx}" y="{fy}" width="{fw}" height="{fh}" fill="none" stroke="#8f0a20" stroke-width="1"/>')

def cover_illustration():
    W, H = 460, 360
    TLx, TLy, TRx, TRy, PXx, PYy = 74, 116, 386, 116, 230, 316
    ctx, cty = (TLx+TRx+PXx)/3.0, (TLy+TRy+PYy)/3.0
    def scallop(ax, ay, bx, by, bump=8, seg=19):
        dx, dy = bx-ax, by-ay
        L = (dx*dx+dy*dy)**0.5
        n = max(2, int(round(L/seg)))
        nx, ny = -dy/L, dx/L
        # pek utover (bort fra sentrum)
        mx0, my0 = (ax+bx)/2, (ay+by)/2
        if (mx0+nx-ctx)**2 + (my0+ny-cty)**2 < (mx0-ctx)**2 + (my0-cty)**2:
            nx, ny = -nx, -ny
        d = ''
        for i in range(n):
            t1 = (i+1)/n
            x1, y1 = ax+dx*t1, ay+dy*t1
            mxx = ax+dx*(i+0.5)/n + nx*bump
            myy = ay+dy*(i+0.5)/n + ny*bump
            d += f' Q{mxx:.1f},{myy:.1f} {x1:.1f},{y1:.1f}'
        return d
    p = [f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" style="width:116mm">']
    p.append(f'<defs><clipPath id="tri"><path d="M{TLx},{TLy} L{TRx},{TRy} L{PXx},{PYy} Z"/></clipPath></defs>')
    # I-cord-snorer bak (fra topphjørnene)
    for sx, ex, c1, c2 in [(TLx, 44, 40, 20), (TRx, 416, 420, 440)]:
        p.append(f'<path d="M{sx},{TLy+2} C{c1},112 {c2},148 {ex},176" fill="none" stroke="{RED}" stroke-width="9" stroke-linecap="round"/>')
    # trekanten
    p.append(f'<path d="M{TLx},{TLy} L{TRx},{TRy} L{PXx},{PYy} Z" fill="{RED}" stroke="#8f0a20" stroke-width="2"/>')
    # flagg litt oppe foran (nær den brede forkanten)
    p.append('<g clip-path="url(#tri)">')
    p.append(flag_rects(198, 138, 64, 46))
    p.append('</g>')
    # flaggstriper rundt HELE kanten (lukket trekant)
    for inset, col, wdt in [(9, '#fff', 5), (15, NAVY, 6), (21, '#fff', 5)]:
        k = 1 - inset/95.0
        ix1, iy1 = ctx+(TLx-ctx)*k, cty+(TLy-cty)*k
        ix2, iy2 = ctx+(TRx-ctx)*k, cty+(TRy-cty)*k
        ix3, iy3 = ctx+(PXx-ctx)*k, cty+(PYy-cty)*k
        p.append(f'<path d="M{ix1:.1f},{iy1:.1f} L{ix2:.1f},{iy2:.1f} L{ix3:.1f},{iy3:.1f} Z" fill="none" stroke="{col}" stroke-width="{wdt}" stroke-linejoin="round"/>')
    # bølgekant rundt HELE
    edge = f'M{TLx},{TLy}' + scallop(TLx,TLy,TRx,TRy) + scallop(TRx,TRy,PXx,PYy) + scallop(PXx,PYy,TLx,TLy)
    p.append(f'<path d="{edge}" fill="none" stroke="{RED}" stroke-width="7" stroke-linejoin="round" stroke-linecap="round"/>')
    p.append('</svg>')
    return ''.join(p)

def scarf_schematic():
    return f'''
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 330" style="width:100%">
  <defs><marker id="ah" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">
    <path d="M0,0 L8,4 L0,8 z" fill="#777"/></marker></defs>
  <path d="M110,90 L370,90 L240,285 Z" fill="{RED}" stroke="#8f0a20" stroke-width="2"/>
  {flag_rects(214, 112, 52, 40)}
  <path d="M123,97 L357,97 L240,272 Z" fill="none" stroke="#fff" stroke-width="5" stroke-linejoin="round"/>
  <path d="M130,101 L350,101 L240,266 Z" fill="none" stroke="{NAVY}" stroke-width="6" stroke-linejoin="round"/>
  <path d="M137,104 L343,104 L240,260 Z" fill="none" stroke="#fff" stroke-width="5" stroke-linejoin="round"/>
  <path d="M96,80 C70,86 58,110 74,132" fill="none" stroke="{RED}" stroke-width="8" stroke-linecap="round"/>
  <path d="M384,80 C410,86 422,110 406,132" fill="none" stroke="{RED}" stroke-width="8" stroke-linecap="round"/>
  <circle cx="110" cy="90" r="5" fill="{RED}"/><circle cx="370" cy="90" r="5" fill="{RED}"/>
  <line x1="110" y1="72" x2="370" y2="72" stroke="#777" stroke-width="2" marker-start="url(#ah)" marker-end="url(#ah)"/>
  <text x="240" y="64" text-anchor="middle" font-size="14" font-family="sans-serif" fill="#555">forkanten (over pannen): 34 (44) cm</text>
  <line x1="392" y1="90" x2="392" y2="285" stroke="#777" stroke-width="2" marker-start="url(#ah)" marker-end="url(#ah)"/>
  <text x="400" y="188" font-size="14" font-family="sans-serif" fill="#555">ned til</text>
  <text x="400" y="206" font-size="14" font-family="sans-serif" fill="#555">spissen:</text>
  <text x="400" y="224" font-size="14" font-family="sans-serif" fill="#555">24 (31) cm</text>
  <text x="240" y="182" text-anchor="middle" font-size="12.5" font-family="sans-serif" fill="#fff">bølgekant + striper</text>
  <text x="240" y="196" text-anchor="middle" font-size="12.5" font-family="sans-serif" fill="#fff">rundt hele kanten</text>
  <text x="70" y="150" font-size="12.5" font-family="sans-serif" fill="#555" text-anchor="middle">snor festes</text>
  <text x="70" y="165" font-size="12.5" font-family="sans-serif" fill="#555" text-anchor="middle">her (foran)</text>
  <text x="240" y="302" text-anchor="middle" font-size="13" font-family="sans-serif" fill="#888">spissen bak i nakken (snorene knytes bak, under den)</text>
</svg>'''

# ============ SIDE 1: FORSIDE ============
pages.append(page(f'''
<div class="coverimg"><img src="{photo_src}" alt="Strikket Norge-skaut med flagg og bølgekant"></div>
<div class="covertag">LME STRIKKEOPPSKRIFT</div>
<div class="coverbanner">
  <div class="cflag">{mini_flag(40)}</div>
  <h1 class="covertitle">NORGE-SKAUT</h1>
  <div class="cflag">{mini_flag(40)}</div>
</div>
<div class="subpill">TREKANTSKAUT MED FLAGG</div>
{card('<p class="center">Et rødt skaut som passer til hatten. Det er en trekant med bølget '
      'kant, flaggstriper og et norsk flagg. To snorer knyter du bak i nakken. Lett å strikke, '
      'og fint å ha på 17. mai og til fotball-VM.</p>')}
<div class="byline">
  <div class="by1">Av Renate Dahl</div>
  <div class="by2">Little Montessori Explorers</div>
  <div class="by3">lmexplorers.com</div>
</div>
<div class="notecard"><span class="noteemo">&#129525;</span>
  <p><i>TIPS: Les hele oppskriften en gang først. Strikk gjerne en liten prøvelapp, så blir
  skautet passe stort.</i></p>
</div>
''', 1))

# ============ SIDE 2: FØR DU BEGYNNER ============
pages.append(page(f'''
{banner('FØR DU BEGYNNER')}
<p>Et skaut er lett å strikke. Du starter nede i spissen med noen få masker. Så øker du litt og
litt, til trekanten er stor nok. Rundt hele skautet lager du en bølget kant med flaggstriper. Vil du, strikker du også inn et flagg på midten. Til slutt lager du to snorer å knyte med.</p>
{tealp('DETTE LÆRER DU')}
{card(ul([
  'Å strikke en trekant',
  'Å øke masker i sidene',
  'Å strikke inn et flagg med to farger (valgfritt)',
  'Å lage en snor (I-cord)',
  'Å lage en bølget kant',
]))}
{pink('ER DET VANSKELIG?')}
{card('<p><b>Nybegynner.</b> Kan du legge opp masker, strikke rett og øke, klarer du dette. '
      'Alt annet står steg for steg. Spør en voksen hvis du står fast.</p>')}
{pink('SLIK LESER DU TALLENE')}
{card('<p>Skautet kommer i to størrelser. Tallene står slik:</p>'
      '<p class="center bignum">barn (voksen)</p>'
      '<p>Til barn bruker du det første tallet. Til voksen bruker du tallet i parentes.</p>')}
{cream('<p class="creamtitle">Ett steg om gangen. Så blir det et skaut til slutt.</p>')}
''', 2))

# ============ SIDE 3: DETTE TRENGER DU ============
pages.append(page(f'''
{banner('DETTE TRENGER DU')}
{tealp('GARN')}
{card('<p><b>DROPS Paris</b> (100 % bomull). Et tykt, mykt bomullsgarn. Du strikker på pinne 5.</p>'
      '<table class="t"><tr><th>Farge</th><th>Barn</th><th>Voksen</th></tr>'
      '<tr><td><span class="dot" style="background:'+RED+'"></span> Rød</td><td>1 nøste</td><td>2 nøster</td></tr>'
      '<tr><td><span class="dot" style="background:#fff;border:1px solid #bbb"></span> Hvit</td><td>1 nøste</td><td>1 nøste</td></tr>'
      '<tr><td><span class="dot" style="background:'+NAVY+'"></span> Marineblå</td><td>1 nøste</td><td>1 nøste</td></tr></table>')}
{tealp('DETTE OGSÅ')}
{card(ul([
  '<b>rundpinne 5 mm</b> (den er lang, så det er plass til mange masker)',
  'To <b>strømpepinner 5 mm</b> til snorene',
  'En <b>maskemarkør</b> (eller en liten trådløkke)',
  'En <b>stoppenål</b> med butt spiss',
  'Saks',
]))}
{pink('PRØVELAPP')}
{card('<p>Strikk en liten lapp først. Legg opp 20 masker og strikk rett fram og tilbake til '
      'lappen er 10 cm høy. Legg den flatt. Er 10 cm like langt som 17 masker? Da er du klar. '
      'Er det flere masker, bytt til pinne 5,5. Er det færre, bytt til pinne 4,5.</p>')}
''', 3))

# ============ SIDE 4: STØRRELSER OG MÅL ============
pages.append(page(f'''
{banner('STØRRELSER OG MÅL')}
{tealp('HVOR STORT?')}
{card('<p>Skautet er en trekant. Den brede forkanten ligger over pannen. Spissen henger ned bak i '
      'nakken. Snorene festes i de to fremre hjørnene og knytes bak, under spissen.</p>'
      '<table class="t"><tr><th></th><th>Barn</th><th>Voksen</th></tr>'
      '<tr><td>Forkanten (over pannen)</td><td>ca. 34 cm</td><td>ca. 44 cm</td></tr>'
      '<tr><td>Ned til spissen</td><td>ca. 24 cm</td><td>ca. 31 cm</td></tr>'
      '<tr><td>Hver snor</td><td>ca. 30 cm</td><td>ca. 35 cm</td></tr></table>')}
{card(scarf_schematic())}
{cream('<p class="creamtitle">Snorene kan du gjøre lengre om du vil. Da er de lette å knyte.</p>')}
''', 4))

# ============ SIDE 5: ORDLISTE ============
pages.append(page(f'''
{banner('ORDLISTE')}
{card('<table class="t tl"><tr><th>Ord</th><th>Betyr</th></tr>'
      '<tr><td><b>m</b></td><td>maske</td></tr>'
      '<tr><td><b>r</b></td><td>rett, en vanlig maske</td></tr>'
      '<tr><td><b>pinne</b></td><td>en rad, når du har strikket bort og tilbake</td></tr>'
      '<tr><td><b>legge opp</b></td><td>lage de første maskene</td></tr>'
      '<tr><td><b>øke</b></td><td>lage flere masker. Her: strikk 2 masker i 1 maske, så blir det '
      'en maske mer.</td></tr>'
      '<tr><td><b>felle av</b></td><td>ta maskene av pinnen så strikkingen ikke løser seg opp</td></tr>'
      '<tr><td><b>I-cord</b></td><td>en liten, rund snor du strikker (side 9)</td></tr>'
      '<tr><td><b>flott</b></td><td>tråden i fargen du ikke bruker akkurat nå, som ligger bak</td></tr></table>')}
{pink('SLIK ER SKAUTET BYGGET OPP')}
{card(steps([
  '<b>Trekanten:</b> Du starter i spissen og øker til trekanten er stor nok. Vil du ha flagg, strikker du det inn litt oppe foran.',
  '<b>Bølgekanten:</b> Rundt hele skautet lager du en bølget kant med hvite og blå striper.',
  '<b>Snorene:</b> Til slutt lager du to snorer å knyte bak i nakken.',
]))}
''', 5))

# ============ SIDE 6: FLERFARGESTRIKK ============
pages.append(page(f'''
{banner('SLIK STRIKKER DU INN FLAGGET')}
<p>Denne siden trenger du bare hvis du vil ha flagget på (den enkle varianten hopper over dette). Flagget strikker du inn med to farger på samme pinne. Du strikker med rød der ruten er rød,
og med hvit eller blå der ruten er hvit eller blå. Fargen du ikke bruker, lar du henge løst bak.
Flaggdiagrammet står på side 10.</p>
{tealp('TRE TING Å HUSKE')}
{card(stranded_panels())}
{pink('GODE RÅD')}
{card(ul([
  'Hold tråden bak løs. Strammer du for hardt, buler strikken. Heller for løst enn for stramt.',
  'Les hver rad nedenfra og opp, og fra høyre mot venstre.',
  'Tell rutene i diagrammet og maskene på skautet. Å telle riktig er halve jobben.',
  'Strikk gjerne en liten prøvelapp med to farger først.',
]))}
''', 6))

# ============ SIDE 7: DEL 1 TREKANTEN ============
pages.append(page(f'''
{banner('DEL 1: TREKANTEN')}
<p>Husk: barn (voksen). Du strikker rett fram og tilbake hele tiden.</p>
{steps([
  'Legg opp <b>4 masker</b> med rødt. Dette er spissen. Den havner bak i nakken.',
  'Strikk 2 pinner rett.',
  'Nå øker du. På <b>hver 2. pinne</b> øker du 1 maske i hver ende: strikk 1, øk i neste maske, '
  'strikk til det er 2 masker igjen, øk, strikk 1. Da blir det 2 masker mer hver gang.',
  'Fortsett slik. Trekanten blir større og større. Strikk til den brede <b>forkanten</b> måler '
  '<b>34 (44) cm</b>. Det er kanten som skal ligge over pannen.',
  'Vil du ha flagg? Strikk det inn litt oppe, nær den brede forkanten, midt på. Start flagget når '
  'det er ca. 5 cm igjen. Følg flaggdiagrammet på side 10. Vil du ha det enkelt, hopper du over flagget.',
  'Fell av den brede forkanten løst.',
])}
{cream('<p class="creamtitle">Mistet du en maske? Ta det med ro. Løft den opp igjen, eller be en '
       'voksen om hjelp. Ingenting er ødelagt.</p>')}
''', 7))

# ============ SIDE 8: DEL 2 BØLGEKANTEN ============
pages.append(page(f'''
{banner('DEL 2: BØLGEKANT RUNDT HELE')}
<p>Nå lager du den bølgete kanten med flaggstriper <b>rundt hele skautet</b>. Bølgene kommer av
at du får mange masker på lite plass.</p>
{steps([
  'Plukk opp masker med rundpinnen <b>rundt hele kanten</b>: langs den brede forkanten, ned den '
  'ene siden til spissen, og opp den andre siden tilbake. Plukk opp ca. 3 masker for hver 4 du '
  'går forbi. I spissen og i de to fremre hjørnene plukker du opp 1 ekstra, så det ikke strammer.',
  'Sett en maskemarkør der du startet, og strikk rundt og rundt. Strikk 1 omgang rødt.',
  'Øk til <b>dobbelt så mange</b> masker: strikk 1, øk i neste, hele veien rundt. Nå bukter kanten seg.',
  'Strikk striper: <b>2 omganger hvit, 2 omganger marineblå, 2 omganger hvit</b>.',
  'Fell av løst med rødt. Strammer du, blir kanten stiv. Løst gir fine bølger.',
])}
{cream('<p class="creamtitle">ENKEL VARIANT (fin for de yngste, ca. 8 år):<br>'
       'Hopp over flagget i Del 1. Strikk bare den røde trekanten, og lag denne bølgekanten med '
       'stripene. Da trenger du aldri to farger på en gang, bare én farge om gangen. Like fint!</p>')}
''', 8))

# ============ SIDE 9: DEL 3 SNORENE ============
pages.append(page(f'''
{banner('DEL 3: SNORENE TIL Å KNYTE MED')}
<p>Snorene heter I-cord. Det er en liten, rund snor. Den er lett å lage når du kan trikset.</p>
{tealp('SLIK LAGER DU EN I-CORD')}
{card(steps([
  'Legg opp <b>3 masker</b> på en strømpepinne.',
  'Strikk 3 rett. <b>Ikke snu strikkingen.</b>',
  'Skyv de 3 maskene til den andre enden av pinnen. Ta garnet stramt bak.',
  'Strikk 3 rett igjen. Gjenta og gjenta. Nå ruller snoren seg rund helt av seg selv!',
  'Strikk til snoren er <b>30 (35) cm</b>. Fell av. Den skal nå rundt til nakken.',
]))}
{pink('SETT SNORENE PÅ')}
{card(ul([
  'Lag <b>to snorer</b>.',
  'Fest en snor godt i hvert av de to <b>fremre hjørnene</b> (der forkanten møter sidene). Sy '
  'enden fast med stoppenålen.',
  'Legg skautet på hodet: den brede forkanten over pannen, spissen ned bak i nakken.',
  'Før de to snorene bak og knyt dem sammen <b>bak, under spissen</b>.',
]))}
''', 9))

# ============ SIDE 10: DIAGRAM FLAGGET ============
pages.append(page(f'''
{banner('DIAGRAM: FLAGGET')}
<p>Flagget er valgfritt. Vil du ha det, strikker du det inn på midten av trekanten. En rute er en maske. Hvit rute: strikk med hvit. Blå rute: strikk med blå. Rød rute: strikk
med rød. Les nedenfra og opp, fra høyre mot venstre. Den blå streken i korset skal gå helt
gjennom, uten brudd.</p>
<div class="chartrow">
{chart_svg(FLAG, cell=26, numbers=True, title='FLAGGET (13 RUTER BREDT, 10 RUTER HØYT)')}
</div>
{pink('HVOR PÅ SKAUTET?')}
{card(ul([
  'Flagget sitter litt oppe foran, midt mellom de to sidene.',
  'Strikk det inn når det er ca. 5 cm igjen før toppen er ferdig. Da er trekanten bred nok (mer '
  'enn 13 masker), og flagget havner litt oppe, som på bildet.',
  'Strikk rødt under, over og rundt flagget.',
]))}
''', 10))

# ============ SIDE 11: MONTERING ============
pages.append(page(f'''
{banner('FERDIG OG STELL')}
{tealp('HELT TIL SLUTT')}
{steps([
  'Fest alle løse tråder på baksiden med stoppenålen. Klipp av det som er igjen.',
  'Skyll skautet i lunkent vann, eller vask på 40 grader (bomull tåler det).',
  'Klem ut vannet i et håndkle. Ikke vri!',
  'Legg skautet flatt til tørk. Form den bølgete kanten fint mens det er vått.',
])}
{pink('SJEKKLISTE')}
{card(ul([
  'Alle tråder er festet',
  'Flagget står midt på',
  'Toppkanten bølger',
  'De to snorene sitter godt fast',
]))}
{cream('<p class="creamtitle">Gratulerer! Nå har du strikket ditt eget skaut.<br>'
       'Bruk det sammen med hatten, heia Norge!</p>')}
<div class="endflag">{mini_flag(64)}</div>
<div class="byline">
  <div class="by1">God sommer!</div>
  <div class="by2">Renate Dahl &middot; Little Montessori Explorers</div>
  <div class="by3">lmexplorers.com</div>
</div>
''', 11))

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
<title>Norge-skaut, LME strikkeoppskrift</title>
<style>{css}</style></head>
<body>{''.join(pages)}</body></html>'''

(BASE / 'skaut.html').write_text(doc, encoding='utf-8')
print('OK', len(doc), 'tegn')
