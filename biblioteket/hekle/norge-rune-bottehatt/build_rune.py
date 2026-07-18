# -*- coding: utf-8 -*-
'''Genererer LME-hekleoppskrift (Norge-bøttehatt), norsk + engelsk. Bruk: python3 build_hekle_norge.py [no|en]'''
import base64, html, pathlib, sys, math, random

BASE = pathlib.Path(__file__).parent
PHOTO = pathlib.Path('/root/.claude/uploads/8a2defc1-69f7-5b9a-9a21-28d0d3730f69/07bb5622-IMG_2697.png')
LANG = sys.argv[1] if len(sys.argv) > 1 else 'no'
def L(no, en): return en if LANG == 'en' else no

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

# ---------- Runeskrift: grov, handhugget stil (Ancientskin-look) ----------
# Lesbare bokstaver tegnet som fylte, ujevne "hugde" streker i en 0..1-boks.
RUNES={
 'N':[[(0.14,1.0),(0.14,0.0)],[(0.14,0.0),(0.86,1.0)],[(0.86,1.0),(0.86,0.0)]],
 'O':[[(0.5,0.0),(0.9,0.5),(0.5,1.0),(0.1,0.5),(0.5,0.0)]],
 'R':[[(0.16,1.0),(0.16,0.0),(0.74,0.0),(0.88,0.14),(0.88,0.36),(0.74,0.5),(0.16,0.5)],[(0.5,0.5),(0.9,1.0)]],
 'G':[[(0.9,0.14),(0.72,0.0),(0.28,0.0),(0.1,0.16),(0.1,0.84),(0.28,1.0),(0.74,1.0),(0.9,0.86),(0.9,0.55),(0.58,0.55)]],
 'E':[[(0.9,0.0),(0.14,0.0),(0.14,1.0),(0.9,1.0)],[(0.14,0.5),(0.66,0.5)]],
 'W':[[(0.05,0.0),(0.27,1.0),(0.5,0.35),(0.73,1.0),(0.95,0.0)]],
 'A':[[(0.1,1.0),(0.5,0.0),(0.9,1.0)],[(0.26,0.62),(0.74,0.62)]],
 'Y':[[(0.1,0.0),(0.5,0.55),(0.9,0.0)],[(0.5,0.55),(0.5,1.0)]],
}
def _rough_stroke(pts, box, w, ox, oy, rnd, stroke=CREAM):
    # fylt polygon langs streken, med ujevne kanter (hugd/handlaget look)
    P=[(ox+x*box, oy+y*box*1.28) for x,y in pts]
    left=[]; right=[]
    for i,(x,y) in enumerate(P):
        if i==0: dx,dy=P[1][0]-x,P[1][1]-y
        elif i==len(P)-1: dx,dy=x-P[i-1][0],y-P[i-1][1]
        else: dx,dy=P[i+1][0]-P[i-1][0],P[i+1][1]-P[i-1][1]
        Ln=math.hypot(dx,dy) or 1; nx,ny=-dy/Ln,dx/Ln
        hw=w*(0.55+rnd.uniform(-0.18,0.22))
        jx,jy=rnd.uniform(-w*0.18,w*0.18),rnd.uniform(-w*0.18,w*0.18)
        left.append((x+nx*hw+jx, y+ny*hw+jy))
        right.append((x-nx*hw+jx, y-ny*hw+jy))
    poly=left+right[::-1]
    d='M'+' L'.join(f'{px:.1f},{py:.1f}' for px,py in poly)+' Z'
    return f'<path d="{d}" fill="{stroke}"/>'
def rune_glyph(ch, box, sw, ox, oy, seed, stroke=CREAM):
    rnd=random.Random(seed)
    return ''.join(_rough_stroke(s, box, sw, ox, oy, rnd, stroke) for s in RUNES[ch])
def runeword(word, box=48, sw=None, gap=None, pad=14, panel=True, stroke=CREAM):
    sw=sw or box*0.17; gap=gap if gap is not None else box*0.34
    H=box*1.28+pad*2
    x=pad; glyphs=[]
    for i,ch in enumerate(word):
        glyphs.append(rune_glyph(ch, box, sw, x, pad, seed=i*17+ord(ch), stroke=stroke))
        x+=box+gap
    W=x-gap+pad
    rect=f'<rect x="0" y="0" width="{W:.0f}" height="{H:.0f}" rx="{box*0.2:.0f}" fill="{RED}"/>' if panel else ''
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W:.0f} {H:.0f}" '
            f'style="max-width:100%;height:auto">{rect}{"".join(glyphs)}</svg>')


# Hekles ovenfra og ned: hele mönsteret roteres 180° (som Helene Spillings
# Ödegaard-diagram), saa bokstavene blir riktig vei paa den ferdige hatten.
def flip180(rows): return [r[::-1] for r in rows[::-1]]
def word_rows(word, gap=2):
    h = len(LETTERS5[word[0]])
    out = []
    for i in range(h):
        seg = []
        for j, ch in enumerate(word):
            if j: seg.append('.' * gap)
            seg.append(LETTERS5[ch][i])
        out.append(''.join(seg))
    return out

CMAP = {'.': RED, '#': CREAM, 'R': RED, 'W': '#ffffff', 'B': NAVY}

def chart_svg(rows, cell=22, numbers=False, title=None):
    '''Rutediagram som SVG. rows: liste med strenger, topp til bunn.'''
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
                     f'text-anchor="middle" fill="#666" font-family="Sasson Montessori, sans-serif">{x+1}</text>')
        for y in range(h):
            yy = 4 + y*cell + cell/2 + 4
            p.append(f'<text x="{4+w*cell+8}" y="{yy}" font-size="11" fill="#666" '
                     f'font-family="Sasson Montessori, sans-serif">{h-y}</text>')
    p.append('</svg>')
    svg = ''.join(p)
    if title:
        return (f'<div class="chartbox"><div class="chartttl">{html.escape(title)}</div>{svg}</div>')
    return f'<div class="chartbox">{svg}</div>'

def strip_svg(parts, total_label):
    '''Plasseringsstripe: bokser med bredde etter maskeantall.'''
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
                     f'font-family="Sasson Montessori, sans-serif" font-weight="bold" fill="{"#c2688f" if kind=="sp" else "#3f3f3f"}">{html.escape(label)}</text>')
        boxes.append(f'<text x="{x+wpx/2}" y="47" text-anchor="middle" font-size="11" '
                     f'font-family="Sasson Montessori, sans-serif" fill="#888">{m} {L("m","st")}</text>')
        x += wpx + gap
    W = x + 6
    svg = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} 84" style="width:100%">'
           + ''.join(boxes) +
           f'<text x="{W/2}" y="76" text-anchor="middle" font-size="13" font-family="Sasson Montessori, sans-serif" '
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
  <text x="320" y="34" text-anchor="middle" font-size="15" font-family="Sasson Montessori, sans-serif" fill="#555">{L('omkrets rundt: 49 (53) 57 cm','circumference around: 49 (53) 57 cm')}</text>
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
  <text x="522" y="156" font-size="15" font-family="Sasson Montessori, sans-serif" fill="#555">{L('høyde','height')}</text>
  <text x="522" y="175" font-size="15" font-family="Sasson Montessori, sans-serif" fill="#555">{L('ca. 16','approx. 16')}</text>
  <text x="522" y="194" font-size="15" font-family="Sasson Montessori, sans-serif" fill="#555">{L('(17) 18 cm','(17) 18 cm')}</text>
  <!-- deler -->
  <text x="150" y="100" font-size="15" font-family="Sasson Montessori, sans-serif" fill="#555" text-anchor="end">{L('4. toppen','4. the top')}</text>
  <line x1="156" y1="96" x2="280" y2="105" stroke="#aaa" stroke-width="1.5"/>
  <text x="118" y="190" font-size="15" font-family="Sasson Montessori, sans-serif" fill="#555" text-anchor="end">{L('3. hoveddelen','3. the main part')}</text>
  <line x1="124" y1="186" x2="192" y2="190" stroke="#aaa" stroke-width="1.5"/>
  <text x="116" y="226" font-size="15" font-family="Sasson Montessori, sans-serif" fill="#555" text-anchor="end">{L('2. stripene','2. the stripes')}</text>
  <line x1="122" y1="222" x2="190" y2="218" stroke="#aaa" stroke-width="1.5"/>
  <text x="110" y="292" font-size="15" font-family="Sasson Montessori, sans-serif" fill="#555" text-anchor="end">{L('1. bølgekanten','1. the wavy edge')}</text>
  <line x1="116" y1="288" x2="146" y2="282" stroke="#aaa" stroke-width="1.5"/>
  <text x="320" y="332" text-anchor="middle" font-size="14" font-family="Sasson Montessori, sans-serif" fill="#888">{L('Tallene står slik: barn (dame) herre','The numbers read: child (woman) man')}</text>
</svg>'''

# ---------- maskesting-illustrasjon ----------
def vgrid(cols, rows, sw=34, sh=26, ox=10, oy=14, hi=None, done=None):
    '''Rutenett av strikke-V-er. hi: (c,r) som markeres. done: (c,r) ferdig hvit V.'''
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
    '''Tre paneler som viser flerfargestrikk: strikk etter diagram, flott bak, fest lange flott.'''
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
                f'font-family="Sasson Montessori, sans-serif" font-weight="bold" fill="#2e8e8a">{html.escape(text)}</text>')
    panels = []

    # Panel 1: forsiden, strikk hver maske i fargen diagrammet viser
    cols = [RED, RED, CREAM, CREAM, CREAM, RED]
    g, ox, sw, oy, sh = vrow(cols)
    g1 = g + tag(78, L('forsiden','the front'))
    panels.append((1, L('Strikk hver maske i fargen diagrammet viser. Rød er bunnen, hvit (eller blå) er mønsteret.',
                        'Knit each stitch in the colour the chart shows. Red is the background, white (or blue) is the pattern.'), g1))

    # Panel 2: baksiden, flott ligger løst bak
    y0 = 40
    g2 = tag(78, L('baksiden','the back'))
    # stitch-topper
    for i in range(6):
        x = 20 + i*22
        g2 += f'<path d="M{x},{y0} q6,-9 12,0" fill="none" stroke="#e2b7c6" stroke-width="4" stroke-linecap="round"/>'
    # flott (løs tråd) som bukter seg bak
    g2 += (f'<path d="M22,{y0+22} q11,7 22,0 q11,-7 22,0 q11,7 22,0 q11,-7 22,0 q11,7 22,0" '
           f'fill="none" stroke="{CREAM}" stroke-width="5" stroke-linecap="round"/>')
    g2 += (f'<path d="M22,{y0+22} q11,7 22,0 q11,-7 22,0 q11,7 22,0 q11,-7 22,0 q11,7 22,0" '
           f'fill="none" stroke="#d9d2be" stroke-width="1.5" stroke-linecap="round" opacity="0.7"/>')
    panels.append((2, L('Fargen du ikke strikker med, henger løst på baksiden. Det kalles en flott. Hold den løs, ikke stram!',
                        'The colour you are not knitting with hangs loosely on the back. It is called a float. Keep it loose, not tight!'), g2))

    # Panel 3: fest lange flott (over 5 masker)
    y1 = 40
    g3 = tag(78, L('lange flott','long floats'))
    for i in range(6):
        x = 20 + i*22
        g3 += f'<path d="M{x},{y1} q6,-9 12,0" fill="none" stroke="#e2b7c6" stroke-width="4" stroke-linecap="round"/>'
    # lang flott som fanges under en maske på midten
    g3 += (f'<path d="M22,{y1+20} L64,{y1+20} Q78,{y1+30} 92,{y1+20} L134,{y1+20}" '
           f'fill="none" stroke="{CREAM}" stroke-width="5" stroke-linecap="round"/>')
    g3 += f'<circle cx="78" cy="{y1+27}" r="5" fill="none" stroke="{TEAL}" stroke-width="2.5"/>'
    panels.append((3, L('Er det mer enn 5 masker mellom fargene, fanger du den lange flotten under en maske på veien. Da blir den ikke hengende.',
                        'If there are more than 5 stitches between colours, you catch the long float under a stitch along the way. Then it does not hang loose.'), g3))

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
                f'font-family="Sasson Montessori, sans-serif" font-weight="bold" fill="#2e8e8a">{html.escape(text)}</text>')
    panels = []

    # Panel 1: nålen opp i roten av masken (midt nederst)
    bx, by = pt(1, 1, 0.5, 1.0)
    g1 = vgrid(4, 3, sw=sw, sh=sh, ox=ox, oy=oy, hi=(1, 1))
    g1 += f'<circle cx="{bx}" cy="{by-2}" r="6" fill="{TEAL}"/>'
    g1 += f'<path d="M{bx},{by+24} L{bx},{by+5}" stroke="{TEAL}" stroke-width="3" marker-end="url(#at)"/>'
    g1 += tag(78, L('stikk opp her','come up here'))
    panels.append((1, L('Stikk nålen opp nedenfra, i bunnen av masken (roten av V-en).',
                        'Bring the needle up from below, at the base of the stitch (the root of the V).'), g1))

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
    g2 += tag(78, L('under masken over','under the stitch above'))
    panels.append((2, L('Før nålen inn under begge beina til masken rett over. Dra garnet gjennom.',
                        'Pass the needle under both legs of the stitch right above. Pull the yarn through.'), g2))

    # Panel 3: ned i samme hull, ferdig V
    g3 = vgrid(4, 3, sw=sw, sh=sh, ox=ox, oy=oy, hi=(1, 1), done=(1, 1))
    g3 += f'<path d="M{bx+16},{by+16} L{bx+3},{by+1}" stroke="{TEAL}" stroke-width="3" marker-end="url(#at)"/>'
    g3 += tag(78, L('ned i samme hull','down the same hole'))
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

# ---------- foto ----------
photo_b64 = base64.b64encode(PHOTO.read_bytes()).decode()
photo_src = f'data:image/png;base64,{photo_b64}'

# ---------- byggeklosser ----------
def page(body, num, right_label=None):
    right_label = right_label or L('LME HEKLE', 'LME CROCHET')
    ph2 = L('LME HEKLEOPPSKRIFT&nbsp;&nbsp;|&nbsp;&nbsp;NORGE-BØTTEHATT',
            'LME CROCHET PATTERN&nbsp;&nbsp;|&nbsp;&nbsp;NORWAY BUCKET HAT')
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
    total = 5*9*cell + 4*gap
    svg, _ = word_cells('NORGE', W/2 - total/2, 110, cell, gap)
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
    h = ('<tr><th>' + L('Omg', 'Rnd') + '</th><th>' + L('Beskrivelse', 'Description')
         + '</th><th>' + L('Masker', 'Sts') + '</th></tr>')
    body = ''.join('<tr><td><b>' + str(a) + '</b></td><td>' + b + '</td><td>' + str(c) + '</td></tr>' for a, b, c in rows)
    return '<table class="t">' + h + body + '</table>'

def cme(t):
    return cream('<p class="creamtitle">' + t + '</p>')

# ============ SIDE 1: FORSIDE ============
pages.append(page(f'''
<div class="coverimg coverrune">{runeword('NORGE' if LANG=='no' else 'NORWAY', box=64)}</div>
<div class="covertag">{L('LME HEKLEOPPSKRIFT','LME CROCHET PATTERN')}</div>
<div class="coverbanner">
  <div class="cflag">{mini_flag(40)}</div>
  <h1 class="covertitle">{L('NORGE-BØTTEHATT','NORWAY BUCKET HAT')}</h1>
  <div class="cflag">{mini_flag(40)}</div>
</div>
<div class="subpill">{L('RUNESTIL-BOKSTAVER HEKLET PÅ · STRIPET BREM','RUNE-STYLE LETTERS CROCHETED ON · STRIPED BRIM')}</div>
{card(L('<p class="center">En rød bøttehatt heklet i bomull. Du hekler hele hatten i rødt, med en '
        'stripet brem i rødt, hvitt og blått nederst. Så hekler du "NORGE" på i lesbare '
        'runestil-bokstaver, én sammenhengende linje rundt forsiden, og et lite norsk flagg på '
        'toppen. Vil du heller ha "NORWAY", finner du den malen på samme side. Størrelser fra barn til herre.</p>',
        '<p class="center">A red bucket hat crocheted in cotton. You crochet the whole hat in red, '
        'with a striped brim in red, white and blue at the bottom. Then you crochet "NORWAY" on in '
        'readable rune-style letters, one continuous line around the front, and a little Norwegian '
        'flag on the top. If you would rather have "NORGE", the template is on the same page. Sizes from child to man.</p>'))}
<div class="byline">
  <div class="by1">{L('Av Renate Dahl','By Renate Dahl')}</div>
  <div class="by2">Little Montessori Explorers</div>
  <div class="by3">lmexplorers.com</div>
</div>
<div class="notecard"><span class="noteemo">&#129525;</span>
  <p><i>{L('TIPS: Les hele oppskriften en gang først. Heklefastheten avgjør størrelsen, så lag gjerne '
           'en liten prøvelapp.',
           'TIP: Read the whole pattern through once first. The gauge decides the size, so crochet a '
           'little gauge swatch.')}</i></p>
</div>
''', 1))

# ============ SIDE 2: STØRRELSE OG MATERIALER ============
pages.append(page(f'''
{banner(L('STØRRELSE OG MATERIALER','SIZE AND MATERIALS'))}
{tealp(L('STØRRELSE','SIZE'))}
{card(L('<p>Mål rundt hodet og velg størrelsen som passer. Du hekler toppen til du har '
        'maskeantallet for din størrelse, resten er likt for alle.</p>',
        '<p>Measure around the head and choose the size that fits. You crochet the top until you have '
        'the stitch count for your size, the rest is the same for everyone.</p>')
      + '<table class="t"><tr><th>' + L('Størrelse','Size') + '</th><th>' + L('Masker rundt','Stitches around')
      + '</th><th>' + L('Passer hodemål','Fits head size') + '</th></tr>'
      + L('<tr><td>Barn</td><td>66</td><td>48-51 cm</td></tr>'
          '<tr><td>Dame S</td><td>72</td><td>52-54 cm</td></tr>'
          '<tr><td>Dame M</td><td>78</td><td>54-56 cm</td></tr>'
          '<tr><td>Dame L / Herre S</td><td>84</td><td>56-58 cm</td></tr>'
          '<tr><td>Herre M</td><td>90</td><td>58-61 cm</td></tr>'
          '<tr><td>Herre L</td><td>96</td><td>61-63 cm</td></tr>',
          '<tr><td>Child</td><td>66</td><td>48-51 cm</td></tr>'
          '<tr><td>Woman S</td><td>72</td><td>52-54 cm</td></tr>'
          '<tr><td>Woman M</td><td>78</td><td>54-56 cm</td></tr>'
          '<tr><td>Woman L / Man S</td><td>84</td><td>56-58 cm</td></tr>'
          '<tr><td>Man M</td><td>90</td><td>58-61 cm</td></tr>'
          '<tr><td>Man L</td><td>96</td><td>61-63 cm</td></tr>')
      + '</table>')}
{tealp(L('MATERIALER','MATERIALS'))}
{card(L('<p><b>DROPS Paris</b> (100 % bomull):</p>','<p><b>DROPS Paris</b> (100% cotton):</p>')
      + '<table class="t"><tr><th>' + L('Farge','Colour') + '</th><th>' + L('Mengde','Amount') + '</th></tr>'
      '<tr><td><span class="dot" style="background:'+RED+'"></span> ' + L('Rød (hovedfarge)','Red (main colour)')
      + '</td><td>' + L('3 til 4 nøster','3 to 4 balls') + '</td></tr>'
      '<tr><td><span class="dot" style="background:#fff;border:1px solid #bbb"></span> ' + L('Hvit','White')
      + '</td><td>' + L('1 nøste','1 ball') + '</td></tr>'
      '<tr><td><span class="dot" style="background:'+NAVY+'"></span> ' + L('Marineblå','Navy blue')
      + '</td><td>' + L('1 nøste','1 ball') + '</td></tr></table>'
      + ul([L('Heklenål <b>5 mm</b> (eller den som gir riktig fasthet)','Crochet hook <b>5 mm</b> (or the one that gives the right gauge)'),
            L('Maskemarkør','Stitch marker'),
            L('<b>Stoppenål med butt spiss</b> til bokstavene og flagget','<b>Tapestry needle with a blunt tip</b> for the letters and the flag'),
            L('Saks','Scissors')]))}
''', 2))

# ============ SIDE 3: HEKLEFASTHET OG ORDLISTE ============
pages.append(page(f'''
{banner(L('HEKLEFASTHET OG ORDLISTE','GAUGE AND GLOSSARY'))}
{pink(L('HEKLEFASTHET, DEN VIKTIGE NØKKELEN','GAUGE, THE IMPORTANT KEY'))}
{card(L('<p><b>14 staver x 8 omganger = 10 x 10 cm</b> (heklet i spiral med staver på nål 5 mm).</p>'
        '<p>Hekle en liten prøvelapp og mål. Er lappen for stor, bytt til tynnere nål. For liten, '
        'bytt til tykkere nål. Riktig fasthet gir riktig størrelse.</p>',
        '<p><b>14 dc x 8 rounds = 10 x 10 cm</b> (crocheted in a spiral in double crochet on a 5 mm '
        'hook).</p><p>Crochet a little gauge swatch and measure. If the swatch is too big, switch to a '
        'thinner hook. Too small, switch to a thicker hook. The right gauge gives the right size.</p>'))}
{tealp(L('FORKORTELSER','ABBREVIATIONS'))}
{card('<table class="t tl"><tr><th>' + L('Kort','Short') + '</th><th>' + L('Betyr','Means') + '</th></tr>'
      + L('<tr><td><b>lm</b></td><td>luftmaske</td></tr>'
          '<tr><td><b>stav</b></td><td>stav (dobbel heklemaske)</td></tr>'
          '<tr><td><b>kjm</b></td><td>kjedemaske</td></tr>'
          '<tr><td><b>økn</b></td><td>økning (2 staver i samme maske)</td></tr>'
          '<tr><td><b>m</b></td><td>maske(r)</td></tr>'
          '<tr><td><b>overflate-hekling</b></td><td>kjedemasker heklet oppå hatten, lager opphøyde bokstaver</td></tr>'
          '<tr><td><b>( )</b></td><td>totalt antall masker på omgangen</td></tr>',
          '<tr><td><b>ch</b></td><td>chain</td></tr>'
          '<tr><td><b>dc</b></td><td>double crochet</td></tr>'
          '<tr><td><b>sl st</b></td><td>slip stitch</td></tr>'
          '<tr><td><b>inc</b></td><td>increase (2 dc in the same stitch)</td></tr>'
          '<tr><td><b>st</b></td><td>stitch(es)</td></tr>'
          '<tr><td><b>surface crochet</b></td><td>slip stitches crocheted on top of the hat, making raised letters</td></tr>'
          '<tr><td><b>( )</b></td><td>total number of stitches in the round</td></tr>')
      + '</table>')}
{cme(L('Hele hatten hekles i spiral med staver, uten å avslutte omgangene. Bokstavene og flagget '
       'hekles på til slutt.',
       'The whole hat is crocheted in a spiral in double crochet, without closing off the rounds. The '
       'letters and the flag are crocheted on at the end.'))}
''', 3))

# ============ SIDE 4: DEL 1 TOPPEN ============
pages.append(page(f'''
{banner(L('DEL 1: TOPPEN','PART 1: THE TOP'))}
<p>{L('Toppen hekles i spiral med staver, fra en magisk ring og utover. Sett en maskemarkør i '
      'første maske og flytt den opp for hver omgang. <b>Hekle økningsomgangene til du har '
      'maskeantallet for din størrelse</b> (se tabellen på side 2), og gå så til DEL 2.',
      'The top is crocheted in a spiral in double crochet, from a magic ring and outwards. Put a '
      'stitch marker in the first stitch and move it up each round. <b>Crochet the increase rounds '
      'until you have the stitch count for your size</b> (see the table on page 2), then go to PART 2.')}</p>
{card(otab([
  (1, L('12 staver i magisk ring','12 dc in magic ring'), 12),
  (2, L('økn x 12','inc x 12'), 24),
  (3, L('(1 stav, økn) x 12','(1 dc, inc) x 12'), 36),
  (4, L('(2 staver, økn) x 12','(2 dc, inc) x 12'), 48),
  (5, L('(3 staver, økn) x 12','(3 dc, inc) x 12'), 60),
  (6, L('(9 staver, økn) x 6  &rarr; Barn','(9 dc, inc) x 6  &rarr; Child'), 66),
  (7, L('(10 staver, økn) x 6  &rarr; Dame S','(10 dc, inc) x 6  &rarr; Woman S'), 72),
  (8, L('(11 staver, økn) x 6  &rarr; Dame M','(11 dc, inc) x 6  &rarr; Woman M'), 78),
  (9, L('(12 staver, økn) x 6  &rarr; Dame L / Herre S','(12 dc, inc) x 6  &rarr; Woman L / Man S'), 84),
  (10, L('(13 staver, økn) x 6  &rarr; Herre M','(13 dc, inc) x 6  &rarr; Man M'), 90),
  (11, L('(14 staver, økn) x 6  &rarr; Herre L','(14 dc, inc) x 6  &rarr; Man L'), 96),
]))}
{cme(L('De første omgangene øker du mye (flat sirkel), så øker du saktere så toppen begynner å bue '
       'seg nedover. Stopp økningene på ditt maskeantall.',
       'The first rounds increase a lot (flat circle), then you increase more slowly so the top starts '
       'to curve downwards. Stop the increases at your stitch count.'))}
''', 4))

# ============ SIDE 5: DEL 2 SIDENE ============
pages.append(page(f'''
{banner(L('DEL 2: SIDENE','PART 2: THE SIDES'))}
<p>{L('Nå hekler du rett opp i spiral med rød, uten økninger. Du har samme maskeantall som toppen '
      'endte på, på hver omgang. Sidene skal være helt røde, bokstavene hekles på til slutt.',
      'Now you crochet straight up in a spiral in red, without increases. You have the same stitch '
      'count that the top ended on, on each round. The sides are all red, the letters are crocheted '
      'on at the end.')}</p>
{card(L('<p>Hekle staver rundt og rundt til sidene måler:</p>'
        '<table class="t"><tr><th>Barn</th><th>Dame</th><th>Herre</th></tr>'
        '<tr><td>ca. 14 cm</td><td>ca. 18 cm</td><td>ca. 19 til 20 cm</td></tr></table>'
        '<p class="small">Mål fra der toppen buet seg og ned til nålen. Hatten skal dekke godt over '
        'ørene.</p>',
        '<p>Crochet dc round and round until the sides measure:</p>'
        '<table class="t"><tr><th>Child</th><th>Woman</th><th>Man</th></tr>'
        '<tr><td>approx. 14 cm</td><td>approx. 18 cm</td><td>approx. 19 to 20 cm</td></tr></table>'
        '<p class="small">Measure from where the top curved down to the hook. The hat should cover '
        'well over the ears.</p>'))}
{cme(L('Prøv hatten underveis. Vil du ha den dypere, hekler du et par omganger til før bremmen.',
       'Try the hat on as you go. If you want it deeper, crochet a couple more rounds before the brim.'))}
''', 5))

# ============ SIDE 6: DEL 3 BREMMEN ============
pages.append(page(f'''
{banner(L('DEL 3: DEN STRIPETE BREMMEN','PART 3: THE STRIPED BRIM'))}
<p>{L('Bremmen bøyer seg utover og får striper i flaggets farger: rød, hvit og blå. Du øker jevnt '
      'på noen av omgangene, så bremmen flarer pent ut. Bytt farge i siste bevegelse på masken før '
      'fargeskiftet, så blir det reint.',
      'The brim curves outwards and gets stripes in the flag colours: red, white and blue. You '
      'increase evenly on some of the rounds, so the brim flares out nicely. Change colour on the '
      'last step of the stitch before the change, so it stays clean.')}</p>
{card(otab([
  (L('brem 1','brim 1'), L('øk jevnt: ca. hver 6. maske, RØD','inc evenly: about every 6th stitch, RED'), L('+ca. 1/6','+approx. 1/6')),
  (L('brem 2','brim 2'), L('staver hele omgangen, RØD','dc all the way around, RED'), '='),
  (L('brem 3','brim 3'), L('øk jevnt: ca. hver 7. maske, HVIT','inc evenly: about every 7th stitch, WHITE'), L('+ca. 1/7','+approx. 1/7')),
  (L('brem 4','brim 4'), L('staver hele omgangen, HVIT','dc all the way around, WHITE'), '='),
  (L('brem 5','brim 5'), L('øk jevnt: ca. hver 8. maske, BLÅ','inc evenly: about every 8th stitch, BLUE'), L('+ca. 1/8','+approx. 1/8')),
  (L('brem 6','brim 6'), L('staver hele omgangen, BLÅ','dc all the way around, BLUE'), '='),
  (L('brem 7','brim 7'), L('staver hele omgangen, RØD','dc all the way around, RED'), '='),
  (L('brem 8','brim 8'), L('kjm rundt for en fast kant, RØD','sl st around for a firm edge, RED'), '='),
]))}
{cme(L('Vil du ha bredere brem, gjentar du et stripepar til (to omg hvit, to omg blå) med en '
       'økningsomgang i mellom. Fest tråden godt til slutt.',
       'Want a wider brim? Repeat one more stripe pair (two rounds white, two rounds blue) with an '
       'increase round in between. Fasten off well at the end.'))}
''', 6))

# ============ SIDE 7: DEL 4 HEKLE BOKSTAVENE ============
pages.append(page(
  banner(L('DEL 4: HEKLE BOKSTAVENE PÅ','PART 4: CROCHET THE LETTERS ON'))
  + '<p>' + L('Nå er selve hatten ferdig. Bokstavene hekles rett på den røde flaten med hvit tråd, så '
             'de blir opphøyde, akkurat som på original-hatten. Du kan gjøre det på to måter, velg '
             'den du liker best.',
             'Now the hat itself is done. The letters are crocheted right onto the red surface with '
             'white yarn, so they stand up, just like on the original hat. You can do it in two ways, '
             'pick the one you like best.') + '</p>'
  + tealp(L('MÅTE 1: OVERFLATE-HEKLING, ANBEFALT','WAY 1: SURFACE CROCHET, RECOMMENDED'))
  + card(steps([
      L('Hold den hvite tråden på innsiden av hatten. Stikk heklenålen gjennom hatten fra utsiden, '
        'der bokstaven skal begynne, og hent opp en løkke hvit.',
        'Hold the white yarn on the inside of the hat. Put the hook through the hat from the outside, '
        'where the letter is to begin, and pull up a white loop.'),
      L('Stikk nålen inn litt lenger langs streken, hent opp en ny løkke og trekk den gjennom løkka '
        'som alt er på nålen. Det er én kjedemaske på overflaten.',
        'Put the hook in a little further along the line, pull up a new loop and draw it through the '
        'loop already on the hook. That is one slip stitch on the surface.'),
      L('Fortsett kjedemaske etter kjedemaske langs alle strekene i bokstaven, følg malen på side 8. '
        'Hold jevn avstand, ikke stram.',
        'Continue slip stitch after slip stitch along all the lines of the letter, follow the '
        'template on page 8. Keep the spacing even, do not pull tight.'),
      L('Fest tråden på innsiden når bokstaven er ferdig, og gå videre til neste bokstav.',
        'Fasten the yarn on the inside when the letter is done, and move on to the next letter.'),
  ]))
  + tealp(L('MÅTE 2: HEKLE EN SNOR OG SY DEN PÅ','WAY 2: CROCHET A CORD AND SEW IT ON'))
  + card(L('<p>Hekle en lang luftmaskekjede i hvitt og hekle en omgang kjedemasker tilbake langs den, '
           'så du får en fast snor. Form snoren til hver bokstav etter malen og sy den fast på hatten '
           'med hvit tråd. Da blir bokstavene tydelige og opphøyde.</p>',
           '<p>Crochet a long chain in white and work a row of slip stitches back along it, so you get '
           'a firm cord. Shape the cord into each letter following the template and sew it onto the '
           'hat with white yarn. That makes the letters clear and raised.</p>'))
  + cme(L('Tips: tegn bokstavene lett med et vannløselig tusjmerke eller sett knappenåler først, så '
          'treffer du formen. Bokstavene er i runestil, men fullt lesbare, akkurat som på hatten din.',
          'Tip: draw the letters lightly with a water-soluble marker or place pins first, so you hit '
          'the shape. The letters are in a rune style, but fully readable, just like on your hat.'))
, 7))

# ============ SIDE 8: BOKSTAV-MAL (NORGE + NORWAY) ============
pages.append(page(
  banner(L('BOKSTAVENE: NORGE OG NORWAY','THE LETTERS: NORGE AND NORWAY'))
  + '<p>' + L('Her er bokstavene i runestil, både NORGE og NORWAY. Hekle dem på i én sammenhengende '
             'linje, sentrert midt foran. Hver bokstav er ca. 5 til 6 cm høy. Bunnen av bokstavene '
             'ligger ca. 3 til 4 cm over den stripete bremmen.',
             'Here are the letters in rune style, both NORGE and NORWAY. Crochet them on in one '
             'continuous line, centred at the front. Each letter is about 5 to 6 cm tall. The bottom '
             'of the letters sits about 3 to 4 cm above the striped brim.') + '</p>'
  + pink('NORGE')
  + card('<div class="stripwrap">' + runeword('NORGE', box=54) + '</div>')
  + pink('NORWAY')
  + card('<div class="stripwrap">' + runeword('NORWAY', box=48) + '</div>')
  + card(ul([
      L('<b>Midt foran:</b> Ordet sentreres midt foran, rett overfor skjøten/markøren midt bak. Alle '
        'bokstavene står på <b>samme linje</b>, aldri delt i to rader.',
        '<b>Centre front:</b> The word is centred at the front, directly opposite the seam/marker at '
        'the centre back. All the letters are on the <b>same line</b>, never split into two rows.'),
      L('<b>Mellomrom:</b> hold like stort mellomrom mellom bokstavene, ca. én bokstavbredde. Ordet '
        'går litt rundt mot sidene, det skal det.',
        '<b>Spacing:</b> keep an even gap between the letters, about one letter width. The word wraps '
        'a little towards the sides, and it is meant to.'),
  ]))
, 8))

# ============ SIDE 9: FLAGG PÅ TOPPEN ============
pages.append(page(
  banner(L('FLAGGET PÅ TOPPEN','THE FLAG ON THE TOP'))
  + '<p>' + L('På toppen av hatten lager du et lite norsk flagg: et hvitt kors med et blått kors oppi, '
             'på den røde bunnen. Korset ligger midt på toppen og deler den i fire.',
             'On the top of the hat you make a small Norwegian flag: a white cross with a blue cross '
             'inside, on the red background. The cross sits in the middle of the top and divides it '
             'into four.') + '</p>'
  + '<div class="flagbig">' + mini_flag(150) + '</div>'
  + pink(L('SLIK GJØR DU','HOW TO DO IT'))
  + card(ul([
      L('Finn midten av toppen der den magiske ringen var. Tenk deg et kors som deler toppen i fire.',
        'Find the middle of the top where the magic ring was. Imagine a cross dividing the top into four.'),
      L('Lag først det <b>hvite korset</b> med overflate-hekling, eller sy en hvit snor på: en arm '
        'framover, en bakover og en til hver side. Gjør de hvite linjene litt brede.',
        'Make the <b>white cross</b> first with surface crochet, or sew on a white cord: one arm '
        'forward, one back and one to each side. Make the white lines a little wide.'),
      L('Lag så det <b>blå korset</b> oppå midten av det hvite, litt smalere, så det hvite lyser '
        'rundt det blå. Da ser flagget riktig ut.',
        'Then make the <b>blue cross</b> on top of the middle of the white, a little narrower, so the '
        'white shows around the blue. Then the flag looks right.'),
      L('Fest alle tråder godt på innsiden.','Fasten all ends well on the inside.'),
  ]))
, 9))

# ============ SIDE 10: MONTERING ============
pages.append(page(f'''
{banner(L('FERDIG OG STELL','FINISHED AND CARE'))}
{pink(L('SJEKKLISTE','CHECKLIST'))}
{card(ul([
  L('Hatten er helt rød, med stripet brem i rødt, hvitt og blått','The hat is all red, with a striped brim in red, white and blue'),
  L('NORGE står i runeskrift på én linje midt foran','NORGE is in runes on one line at the centre front'),
  L('Et lite norsk flagg er heklet på toppen','A little Norwegian flag is crocheted on the top'),
  L('Alle tråder er festet på innsiden','All ends are woven in on the inside'),
]))}
{tealp(L('STELL','CARE'))}
{card(ul([
  L('Håndvask lunkent, eller maskinvask 40 grader (bomull tåler det fint).','Hand wash lukewarm, or machine wash at 40 degrees (cotton takes it fine).'),
  L('Klem ut vannet i et håndkle, ikke vri. Legg flatt til tørk og form bremmen.','Squeeze the water out in a towel, do not wring. Lay flat to dry and shape the brim.'),
]))}
{cme(L('Gratulerer! Du har heklet en NORGE-runehatt, klar for 17. mai og alt vi feirer for Norge.',
       'Congratulations! You have crocheted a NORWAY rune hat, ready for the 17th of May and '
       'everything we celebrate for Norway.'))}
<div class="endflag">{mini_flag(64)}</div>
<div class="byline">
  <div class="by2">Renate Dahl &middot; Little Montessori Explorers &middot; lmexplorers.com</div>
</div>
''', 10))

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
  font-family:var(--font-body); font-size:6.5pt; letter-spacing:3.5px; color:#fff; white-space:nowrap; }}
.rside {{ position:absolute; right:2.5mm; top:40%; }}
.rside span {{ writing-mode:vertical-rl; font-family:var(--font-body); font-size:6pt;
  letter-spacing:2.5px; color:#9a9a9a; white-space:nowrap; }}
.phead {{ text-align:center; padding-top:9mm; }}
.ph1 {{ font-family:var(--font-body); font-weight:600; font-size:7pt; letter-spacing:4px; color:#7f96a8; }}
.ph2 {{ font-family:var(--font-body); font-weight:600; font-size:6.3pt; letter-spacing:3px; color:#d795ae; margin-top:1.6mm; }}
.content {{ padding:5mm 16mm 0 20mm; }}
.pfoot {{ position:absolute; bottom:6.5mm; left:0; right:0; text-align:center;
  font-family:var(--font-body); font-weight:700; font-size:10pt; color:#8a8a8a; }}

.banner {{ background:#f5efb2; border-radius:14px; padding:3.6mm 6mm; margin:2mm 0 4.5mm;
  box-shadow:0 1px 4px rgba(0,0,0,.08); text-align:center; }}
.banner h1 {{ font-family:var(--font-head); font-weight:800; font-size:17.5pt; color:{INK};
  letter-spacing:.5px; text-transform:uppercase; }}
.pillwrap {{ text-align:center; margin:4.5mm 0 3mm; }}
.pill {{ display:inline-block; border-radius:999px; padding:2.4mm 9mm;
  font-family:var(--font-body); font-weight:700; font-size:11pt; color:#fff;
  letter-spacing:.5px; text-transform:uppercase; box-shadow:0 1px 4px rgba(0,0,0,.12); }}
.pinkpill {{ background:{PINK}; }}
.tealpill {{ background:{TEAL}; }}
.card {{ background:rgba(255,255,255,.93); border:2px solid #f2bfd4; border-radius:16px;
  padding:4mm 6mm; margin:0 0 4mm; box-shadow:0 1px 5px rgba(0,0,0,.06); }}
.cream {{ background:#fdf3ec; border:2px solid #f2bfd4; border-radius:16px;
  padding:4mm 6mm; margin:4mm 0; text-align:center; }}
.creamtitle {{ font-family:var(--font-body); font-weight:700; font-size:11.5pt; color:{TEAL}; }}
p {{ font-size:11pt; line-height:1.55; margin-bottom:2.2mm; }}
p.small, .small {{ font-size:9.5pt; color:#777; }}
p.center {{ text-align:center; }}
.bignum {{ font-family:var(--font-body); font-weight:700; color:{PINK}; font-size:12pt; }}
ul.dots {{ list-style:none; }}
ul.dots li {{ font-size:11pt; line-height:1.5; padding-left:5.5mm; position:relative; margin:1.6mm 0; }}
ul.dots li::before {{ content:'•'; position:absolute; left:1mm; color:{PINK}; font-weight:bold; }}
ol.steps {{ list-style:none; }}
ol.steps li {{ display:flex; gap:3.5mm; align-items:flex-start; background:rgba(255,255,255,.93);
  border:2px solid #f2bfd4; border-radius:14px; padding:3mm 5mm; margin-bottom:2.6mm; }}
ol.steps li div {{ font-size:10.8pt; line-height:1.5; }}
.snum {{ flex:0 0 auto; width:7.5mm; height:7.5mm; border-radius:50%; background:{PINK}; color:#fff;
  font-family:var(--font-body); font-weight:700; font-size:11pt; display:flex;
  align-items:center; justify-content:center; margin-top:.5mm; }}
table.t {{ width:100%; border-collapse:collapse; margin:2.5mm 0; }}
table.t th {{ font-family:var(--font-body); font-weight:700; font-size:9.5pt; color:{PINK};
  text-align:left; padding:1.6mm 2.5mm; border-bottom:2px solid #f2bfd4; }}
table.t td {{ font-size:10pt; padding:1.6mm 2.5mm; border-bottom:1px solid #f6dbe7; line-height:1.4; }}
table.tl td:first-child {{ white-space:nowrap; }}
.dot {{ display:inline-block; width:3.5mm; height:3.5mm; border-radius:50%; vertical-align:-0.5mm; margin-right:1.5mm; }}

.coverrune {{ text-align:center; margin:4mm 0; }}
.runerow {{ display:flex; gap:4mm; justify-content:center; flex-wrap:wrap; margin:2mm 0; }}
.runecell {{ text-align:center; }}
.runecell svg {{ width:20mm; }}
.runelab {{ font-family:var(--font-body); font-size:10pt; color:#777; margin-top:1mm; }}
.flagbig {{ text-align:center; margin:3mm 0; }}
.coverimg {{ text-align:center; margin:3mm 0 3mm; }}
.coverimg img {{ width:104mm; border-radius:14px; box-shadow:0 3px 10px rgba(0,0,0,.18);
  border:3mm solid #fff; }}
.covertag {{ text-align:center; font-family:var(--font-body); font-size:8pt; letter-spacing:3px;
  color:#8a8a8a; margin:1mm 0 2.5mm; }}
.coverbanner {{ display:flex; align-items:center; justify-content:center; gap:5mm;
  background:#f5efb2; border-radius:16px; padding:4mm 6mm; box-shadow:0 1px 5px rgba(0,0,0,.1); }}
.covertitle {{ font-family:var(--font-head); font-weight:800; font-size:26pt; color:{INK}; letter-spacing:1px; }}
.subpill {{ margin:4mm auto; width:fit-content; background:#fdf9e3; border:2.5px solid {INK};
  border-radius:999px; padding:2.2mm 10mm; font-family:var(--font-body); font-weight:700;
  font-size:11.5pt; color:{INK}; letter-spacing:.5px; }}
.byline {{ text-align:center; margin-top:4.5mm; }}
.by1 {{ font-family:var(--font-body); font-weight:700; font-size:13pt; color:{TEAL}; }}
.by2 {{ font-size:10.5pt; color:#8a8a8a; margin-top:1mm; }}
.by3 {{ font-family:var(--font-body); font-weight:600; font-size:10pt; color:{PINK}; margin-top:.6mm; }}
.notecard {{ display:flex; gap:4mm; align-items:center; background:rgba(255,255,255,.8);
  border-radius:12px; padding:3.5mm 6mm; margin-top:5mm; }}
.notecard p {{ font-size:9.5pt; color:#777; margin:0; }}
.noteemo {{ font-size:16pt; }}
.cflag {{ line-height:0; }}

.chartrow {{ display:flex; gap:6mm; justify-content:center; align-items:flex-end;
  flex-wrap:wrap; margin:2.5mm 0 4mm; }}
.chartrow.tight {{ gap:4mm; margin:1.5mm 0 2.5mm; }}
.chartbox {{ text-align:center; }}
.chartttl {{ font-family:var(--font-body); font-weight:700; font-size:9pt; color:{PINK};
  margin-bottom:1.5mm; letter-spacing:.3px; }}
.stripwrap {{ margin:1mm 0 2mm; }}
.dsteps {{ display:flex; gap:4mm; }}
.dstep {{ flex:1; text-align:center; position:relative; }}
.dstep p {{ font-size:9.3pt; line-height:1.45; margin-top:1.5mm; text-align:left; }}
.dnum {{ position:absolute; top:-2.5mm; left:-1.5mm; width:7mm; height:7mm; border-radius:50%;
  background:{PINK}; color:#fff; font-family:var(--font-body); font-weight:700; font-size:10.5pt;
  display:flex; align-items:center; justify-content:center; box-shadow:0 1px 3px rgba(0,0,0,.2); }}
.endflag {{ text-align:center; margin:4mm 0 2mm; }}
'''

lang_attr = 'en' if LANG == 'en' else 'no'
title = L('NORGE-bøttehatt, LME hekleoppskrift', 'NORGE bucket hat, LME crochet pattern')
doc = f'''<!DOCTYPE html>
<html lang="{lang_attr}"><head><meta charset="utf-8">
<title>{title}</title>
<style>{css}</style></head>
<body>{''.join(pages)}</body></html>'''

outname = 'hekle_rune_en.html' if LANG == 'en' else 'hekle_rune.html'
(BASE / outname).write_text(doc, encoding='utf-8')
print('OK', LANG, len(doc), 'tegn ->', outname)
