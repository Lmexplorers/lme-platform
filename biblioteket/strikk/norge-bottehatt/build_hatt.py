# -*- coding: utf-8 -*-
"""Genererer LME-strikkeoppskrift (Norge-bøttehatt) som HTML klar for PDF-print."""
import base64, html, pathlib

BASE = pathlib.Path(__file__).parent
PHOTO = pathlib.Path('/root/.claude/uploads/8a2defc1-69f7-5b9a-9a21-28d0d3730f69/b8b7ff33-68A59211EA214E259FFBB7B58EDAC827.png')

# ---------- farger ----------
RED   = '#C8102E'
NAVY  = '#00205B'
CREAM = '#F8F4EA'
INK   = '#3f3f3f'
PINK  = '#df5f93'
TEAL  = '#4aa7a4'

# ---------- diagramdata ----------
LETTERS5 = {
    'N': ["#....#","##...#","#.#..#","#.#..#","#..#.#","#..#.#","#...##","#....#"],
    'O': [".####.","#....#","#....#","#....#","#....#","#....#","#....#",".####."],
    'R': ["#####.","#....#","#....#","#####.","#.#...","#..#..","#..#..","#...#."],
    'G': [".####.","#....#","#.....","#.....","#..###","#....#","#....#",".####."],
    'E': ["######","#.....","#.....","#####.","#.....","#.....","#.....","######"],
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
    <div class="ph2">LME STRIKKEOPPSKRIFT&nbsp;&nbsp;|&nbsp;&nbsp;NORGE-BØTTEHATT</div>
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

# ============ SIDE 1: FORSIDE ============
pages.append(page(f'''
<div class="coverimg"><img src="{photo_src}" alt="Rød bøttehatt med Norge foran og Ro med bølger bak"></div>
<div class="covertag">LME STRIKKEOPPSKRIFT</div>
<div class="coverbanner">
  <div class="cflag">{mini_flag(40)}</div>
  <h1 class="covertitle">NORGE-BØTTEHATT</h1>
  <div class="cflag">{mini_flag(40)}</div>
</div>
<div class="subpill">STRIKKEOPPSKRIFT MED BØLGET BREM</div>
{card('<p class="center">En sommerhatt i rød bomull med "Norge" og flagget foran, og "Ro" med to bølgeskvulp bak. '
      'Bremmen bølger som små skvulp i vannkanten. Oppskriften passer barn, dame og herre, '
      'og er skrevet så enkelt at du kan strikke den selv om du er 10 år.</p>')}
<div class="byline">
  <div class="by1">Av Renate Dahl</div>
  <div class="by2">Little Montessori Explorers</div>
  <div class="by3">lmexplorers.com</div>
</div>
<div class="notecard"><span class="noteemo">&#129525;</span>
  <p><i>TIPS: Les hele oppskriften en gang før du begynner, og strikk en liten prøvelapp først.
  Da blir hatten akkurat passe stor.</i></p>
</div>
''', 1))

# ============ SIDE 2: FØR DU BEGYNNER ============
pages.append(page(f'''
{banner('FØR DU BEGYNNER')}
<p>Denne hatten strikkes rundt og rundt på rundpinne, nedenfra og opp. Du begynner med den
bølgete bremmen, strikker striper i hvitt og marineblått, fortsetter rett opp og feller til slutt
sammen toppen. Bokstavene, flagget og bølgene broderer du på helt til slutt. Det kalles
maskesting og er mye enklere enn det ser ut.</p>
{tealp('DETTE LÆRER DU')}
{card(ul([
  'å strikke rundt på rundpinne',
  'å lage en bølgekant (den er nesten magisk enkel)',
  'å strikke striper i flere farger',
  'å felle masker så toppen blir fin og rund',
  'å brodere med maskesting, sting som ser ut som strikkede masker',
]))}
{pink('HVOR VANSKELIG ER DET?')}
{card('<p><b>Nybegynner pluss.</b> Du bør kunne legge opp masker, strikke rett og strikke to masker '
      'sammen. Alt annet forklares steg for steg. Spør gjerne en voksen om hjelp første gangen du '
      'skal sette sammen rundpinnen eller bytte til strømpepinner.</p>')}
{pink('SLIK LESER DU TALLENE')}
{card('<p>Oppskriften har tre størrelser. Tallene skrives alltid slik:</p>'
      '<p class="center bignum">barn (dame) herre &nbsp;&rarr;&nbsp; for eksempel 84 (91) 98 masker</p>'
      '<p>Strikker du barnestørrelsen, bruker du det første tallet. Dame bruker tallet i parentes, '
      'og herre bruker det siste. Tips: Sett en ring rundt tallene dine med blyant før du begynner.</p>')}
{cream('<p class="creamtitle">Ett steg om gangen, så blir det hatt til slutt.</p>')}
''', 2))

# ============ SIDE 3: DETTE TRENGER DU ============
pages.append(page(f'''
{banner('DETTE TRENGER DU')}
{tealp('GARN')}
{card('<p><b>DROPS Paris</b> (100 % bomull, 50 g = ca. 75 m). Et tykt og mykt bomullsgarn som '
      'strikkes på pinne 5, akkurat passe for denne hatten.</p>'
      '<table class="t"><tr><th>Farge</th><th>Barn</th><th>Dame</th><th>Herre</th></tr>'
      '<tr><td><span class="dot" style="background:'+RED+'"></span> Rød (hovedfarge)</td><td>2 nøster</td><td>3 nøster</td><td>3 nøster</td></tr>'
      '<tr><td><span class="dot" style="background:#fff;border:1px solid #bbb"></span> Hvit eller natur</td><td>1 nøste</td><td>1 nøste</td><td>1 nøste</td></tr>'
      '<tr><td><span class="dot" style="background:'+NAVY+'"></span> Marineblå</td><td>1 nøste</td><td>1 nøste</td><td>1 nøste</td></tr></table>'
      '<p class="small">Du kan også bruke et annet bomullsgarn der det står pinne 4,5 til 5 på '
      'banderolen, for eksempel Hobbii Rainbow Cotton 8/8. Sjekk alltid strikkefastheten!</p>')}
{tealp('PINNER OG UTSTYR')}
{card(ul([
  '<b>rundpinne 5 mm</b>, 40 cm lang (hele hatten strikkes på denne)',
  '<b>strømpepinner 5 mm</b> til toppen, når det blir for trangt på rundpinnen',
  'rundpinne 4,5 mm hvis du strikker løst (prøvelappen forteller deg det)',
  'en <b>maskemarkør</b> (eller en liten løkke av garn i en annen farge)',
  'en <b>stoppenål med butt spiss</b> til broderiet og trådfestene',
  'målebånd og saks',
]))}
{pink('STRIKKEFASTHET, DEN HEMMELIGE NØKKELEN')}
{card('<p><b>17 masker og 22 omganger glattstrikk på pinne 5 skal bli 10 &times; 10 cm.</b></p>'
      '<p>Slik sjekker du: Legg opp 22 masker og strikk glatt (frem og tilbake: en pinne rett, '
      'en pinne vrang) til lappen er ca. 12 cm høy. Legg lappen flatt og mål hvor mange masker '
      'det er på 10 cm på midten.</p>'
      + ul(['flere enn 17 masker: bytt til tykkere pinne (5,5 mm)',
            'færre enn 17 masker: bytt til tynnere pinne (4,5 mm)',
            'akkurat 17 masker: perfekt, sett i gang!']))}
''', 3))

# ============ SIDE 4: STØRRELSER OG MÅL ============
pages.append(page(f'''
{banner('STØRRELSER OG MÅL')}
{tealp('HVILKEN STØRRELSE?')}
{card('<p>Mål rundt hodet med et målebånd, rett over ørene og øyenbrynene. Velg størrelsen som '
      'passer hodemålet. Hatten skal være 3 til 4 cm mindre enn hodet, for strikk strekker seg.</p>'
      '<table class="t"><tr><th></th><th>Barn</th><th>Dame</th><th>Herre</th></tr>'
      '<tr><td>Passer hodemål</td><td>50&ndash;53 cm</td><td>54&ndash;57 cm</td><td>58&ndash;61 cm</td></tr>'
      '<tr><td>Omkrets på hatten</td><td>ca. 49 cm</td><td>ca. 53 cm</td><td>ca. 57 cm</td></tr>'
      '<tr><td>Høyde (uten brem)</td><td>ca. 16 cm</td><td>ca. 17 cm</td><td>ca. 18 cm</td></tr>'
      '<tr><td>Masker i hoveddelen</td><td>84</td><td>91</td><td>98</td></tr></table>')}
{card(hat_schematic())}
{cream('<p class="creamtitle">Usikker på størrelsen? Velg den største, en bøttehatt kler å sitte litt løst.</p>')}
''', 4))

# ============ SIDE 5: ORDLISTE + OPPBYGGING ============
pages.append(page(f'''
{banner('ORDLISTE')}
{card('<table class="t tl"><tr><th>Ord</th><th>Betyr</th></tr>'
      '<tr><td><b>m</b></td><td>maske</td></tr>'
      '<tr><td><b>omg</b></td><td>omgang, en hel runde rundt hatten</td></tr>'
      '<tr><td><b>r</b></td><td>rett, vanlige rette masker</td></tr>'
      '<tr><td><b>2 r sammen</b></td><td>stikk pinnen gjennom to masker samtidig og strikk dem '
      'som en. Da blir det en maske mindre.</td></tr>'
      '<tr><td><b>legge opp</b></td><td>lage de første maskene på pinnen</td></tr>'
      '<tr><td><b>felle</b></td><td>gjøre antall masker mindre, slik at hatten blir smalere</td></tr>'
      '<tr><td><b>glattstrikk rundt</b></td><td>når du strikker rundt og strikker rett på alle '
      'omganger, blir det glatt og fint. Lettere enn å strikke lue frem og tilbake!</td></tr>'
      '<tr><td><b>maskesting</b></td><td>broderi som legger seg oppå maskene og ser strikket ut</td></tr></table>')}
{pink('SLIK ER HATTEN BYGGET OPP')}
{card(steps([
  '<b>Bølgekanten:</b> Du legger opp dobbelt så mange masker som du trenger og strikker striper. '
  'Når du etterpå strikker to og to masker sammen, folder kanten seg i myke bølger helt av seg selv.',
  '<b>Stripene:</b> hvit, marineblå og hvit, som en liten hilsen til flagget.',
  '<b>Hoveddelen:</b> bare rett rundt og rundt. Her kan du nesten strikke med lukkede øyne.',
  '<b>Toppen:</b> Du feller jevnt sju steder, så toppen blir rund som en bolle.',
  '<b>Broderiet:</b> Til slutt broderer du "NORGE", flagget, "RO" og bølgene med maskesting.',
]))}
''', 5))

# ============ SIDE 6: DEL 1 BREMMEN ============
pages.append(page(f'''
{banner('DEL 1: BREMMEN MED BØLGER')}
<p>Nå begynner vi! Husk: barn (dame) herre. Hele bremmen strikkes rett, altså glattstrikk rundt.</p>
{steps([
  'Legg opp <b>168 (182) 196 m</b> med rød på rundpinne 5 mm. Ja, det er mange masker, '
  'men det er dobbelt med vilje: Det er det som lager bølgene til slutt.',
  'Sett maskemarkøren på pinnen. Den viser hvor omgangen starter, og den blir midt bak på hatten.',
  'Legg strikketøyet på bordet og se at oppleggskanten ikke er vridd rundt pinnen. Alle maskene '
  'skal peke samme vei, som en rett togskinne. Strikk så den første masken, nå er ringen lukket!',
  'Strikk rett rundt i striper, slik: <b>4 omg rød, 3 omg hvit, 3 omg marineblå, 3 omg hvit</b>. '
  'Når du bytter farge, lar du den gamle tråden bare hvile på baksiden. Ikke klipp den røde, '
  'du trenger den igjen straks.',
  '<b>Bølgeomgangen (med rød):</b> Strikk 2 r sammen hele omgangen. Tell etterpå: Nå har du '
  '<b>84 (91) 98 m</b>, og bremmen buer seg ut i fine bølgeskvulp. Magisk!',
])}
{cream('<p class="creamtitle">Mistet du en maske? Ta det med ro. Stikk pinnen inn igjen og løft den opp, '
       'eller be en voksen om hjelp. Ingenting er ødelagt.</p>')}
{pink('SJEKKPUNKT')}
{card(ul(['Har du 84 (91) 98 masker på pinnen?',
          'Ser du tre striper: hvit, blå, hvit?',
          'Bølger kanten seg? Da er du klar for del 2!']))}
''', 6))

# ============ SIDE 7: DEL 2 + DEL 3 ============
pages.append(page(f'''
{banner('DEL 2: HOVEDDELEN')}
{steps([
  'Fortsett med rød og strikk rett rundt og rundt, uten å felle noe.',
  'Strikk til hoveddelen måler <b>9 (10) 11 cm</b> fra bølgeomgangen. Mål fra bølgeomgangen og '
  'opp til pinnen, ikke fra kanten av bremmen.',
])}
{banner('DEL 3: TOPPEN')}
<p>Nå skal hatten bli smalere og smalere, helt til den lukker seg på toppen. Du feller sju
steder på hver felleomgang. Etter felleomgang 1, 2, 3 og 4 strikker du en vanlig omgang uten
felling. Fra felleomgang 5 feller du på hver omgang.</p>
{card('<table class="t"><tr><th>Felleomgang</th><th>Barn (84 m)</th><th>Dame (91 m)</th><th>Herre (98 m)</th></tr>'
  '<tr><td>1</td><td>*10 r, 2 r sammen* = 77 m</td><td>*11 r, 2 r sammen* = 84 m</td><td>*12 r, 2 r sammen* = 91 m</td></tr>'
  '<tr><td>2</td><td>*9 r, 2 r sammen* = 70 m</td><td>*10 r, 2 r sammen* = 77 m</td><td>*11 r, 2 r sammen* = 84 m</td></tr>'
  '<tr><td>3</td><td>*8 r, 2 r sammen* = 63 m</td><td>*9 r, 2 r sammen* = 70 m</td><td>*10 r, 2 r sammen* = 77 m</td></tr>'
  '<tr><td>osv.</td><td colspan="3">strikk en maske mindre mellom fellingene for hver felleomgang</td></tr>'
  '<tr><td>nest siste</td><td colspan="3">*1 r, 2 r sammen* hele omgangen = 14 m</td></tr>'
  '<tr><td>siste</td><td colspan="3">2 r sammen hele omgangen = 7 m</td></tr></table>'
  '<p class="small">Stjernene betyr: Gjenta det som står mellom dem, hele omgangen ut. '
  'Når det blir for trangt på rundpinnen, deler du maskene på tre eller fire strømpepinner '
  'og strikker videre akkurat som før.</p>')}
{steps([
  'Klipp av garnet, men la det være igjen ca. 30 cm.',
  'Tre enden i stoppenålen og træ den gjennom de siste 7 maskene mens du løfter dem av pinnen.',
  'Dra til så hullet lukker seg, og fest tråden godt på innsiden. Selve hatten er ferdig!',
], start=1)}
''', 7))

# ============ SIDE 8: MASKESTING ============
pages.append(page(f'''
{banner('DEL 4: BRODERIET MED MASKESTING')}
<p>Se godt på strikken din: Hver maske ser ut som en liten V. Med maskesting legger du en ny V
i en annen farge oppå. En rute i diagrammet er en maske på hatten. Bruk stoppenålen med butt
spiss og en garnlengde på ca. 50 cm.</p>
{tealp('SLIK GJØR DU ETT STING')}
{card(dupstitch_panels())}
{pink('GODE RÅD')}
{card(ul([
  'Ikke stram garnet. V-en skal ligge løst og lat oppå masken, som en katt i sola.',
  'Brodér rad for rad: Gjør deg ferdig med en vannrett rad i diagrammet før du går videre oppover.',
  'Start og slutt med å la 5 cm garn henge på innsiden. Fest endene når du er ferdig.',
  'Tell ruter i diagrammet og masker på hatten med fingeren, gjerne to ganger. Å telle riktig er '
  'halve jobben!',
]))}
{cream('<p class="creamtitle">Blir et sting feil? Bare dra det forsiktig ut igjen og prøv en gang til.</p>')}
''', 8))

# ============ SIDE 9: DIAGRAM NORGE + FLAGG ============
front_strip = strip_svg([
    ('N',6,'x'),('',1,'sp'),('O',6,'x'),('',1,'sp'),('R',6,'x'),('',1,'sp'),
    ('G',6,'x'),('',1,'sp'),('E',6,'x'),('',2,'sp'),('FLAGG',13,'x'),
], 'Til sammen 49 masker bredt')
pages.append(page(f'''
{banner('DIAGRAM: NORGE OG FLAGGET')}
<p>En rute = en maske. Hvit rute = brodér med hvit. Blå rute = brodér med blå. Rød rute = hopp
over, der får den røde hatten synes. Begynn nederst til venstre i hvert diagram.</p>
{tealp('BOKSTAVENE (6 ruter brede, 8 ruter høye)')}
<div class="chartrow tight">
{chart_svg(LETTERS5['N'], cell=16)}{chart_svg(LETTERS5['O'], cell=16)}{chart_svg(LETTERS5['R'], cell=16)}{chart_svg(LETTERS5['G'], cell=16)}{chart_svg(LETTERS5['E'], cell=16)}
</div>
<div class="chartrow tight">
{chart_svg(FLAG, cell=19, numbers=True, title='FLAGGET (13 ruter bredt, 10 ruter høyt)')}
</div>
{pink('HVOR PÅ HATTEN?')}
{card(f'<div class="stripwrap">{front_strip}</div>'
  + ul([
  '<b>Bortover:</b> Midt foran er rett overfor maskemarkøren. Tell 24 masker til venstre for '
  'midten. Der starter N-en. La det være 1 maske luft mellom bokstavene og 2 før flagget.',
  '<b>Oppover:</b> Tell 8 omganger opp fra bølgeomgangen. Der broderer du nederste rad av '
  'bokstavene. Flagget starter 2 omganger lenger ned (på omgang 6), for det er litt høyere.',
  'På barnestørrelsen fyller mønsteret nesten hele forsiden. Det skal det!',
]))}
''', 9))

# ============ SIDE 10: DIAGRAM RO + BØLGER ============
back_strip = strip_svg([
    ('BØLGE',11,'x'),('',3,'sp'),('R',7,'x'),('',1,'sp'),('O',7,'x'),('',3,'sp'),('BØLGE',11,'x'),
], 'Til sammen 43 masker bredt')
pages.append(page(f'''
{banner('DIAGRAM: RO OG BØLGENE')}
<p>Bak på hatten står det "RO", med et bølgeskvulp på hver side. Ro betyr både stille og rolig,
og det du gjør med årene i en robåt. Begge deler passer en sommerdag ved sjøen.</p>
<div class="chartrow">
{chart_svg(BIG_R, cell=24, title='R (7 x 9)')}{chart_svg(BIG_O, cell=24, title='O (7 x 9)')}
</div>
<div class="chartrow">
{chart_svg(WAVE, cell=22, title='BØLGE VENSTRE (11 x 8)')}{chart_svg(WAVE_M, cell=22, title='BØLGE HØYRE (speilvendt)')}
</div>
{pink('HVOR PÅ HATTEN?')}
{card(f'<div class="stripwrap">{back_strip}</div>'
  + ul([
  '<b>Bortover:</b> Midt bak er ved maskemarkøren. Tell 21 masker til venstre for markøren. '
  'Der starter den venstre bølgen.',
  '<b>Oppover:</b> Bølgene starter 5 omganger over bølgeomgangen. Bokstavene R og O starter på '
  'omgang 8, akkurat som NORGE foran.',
  'De små prikkene øverst i bølgediagrammet er sjøsprøyt. Ikke glem dem, de er prikken over i-en!',
]))}
''', 10))

# ============ SIDE 11: MONTERING ============
pages.append(page(f'''
{banner('MONTERING OG STELL')}
{tealp('HELT TIL SLUTT')}
{steps([
  'Fest alle løse tråder på innsiden av hatten: Vev dem frem og tilbake gjennom baksiden av '
  'maskene med stoppenålen, og klipp av det som er igjen.',
  'Skyll hatten i lunkent vann, eller vask den på 40 grader i maskinen (bomull tåler det fint).',
  'Klem forsiktig ut vannet med et håndkle. Ikke vri!',
  'Legg hatten til tørk flatt, og form bremmen i fine bølger mens den er våt. Slik den tørker, '
  'slik blir den.',
])}
{pink('SJEKKLISTE FOR EN FERDIG HATT')}
{card(ul([
  'alle tråder er festet på innsiden',
  '"NORGE" og flagget sitter foran, "RO" og bølgene bak',
  'bremmen bølger og toppen er rund',
  'hatten er tørr og klar for sommer, sjø og softis',
]))}
{cream('<p class="creamtitle">Gratulerer, du har strikket din egen Norge-hatt!<br>'
       'Vis den frem 17. mai, på hytta og i båten.</p>')}
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
<title>Norge-bøttehatt, LME strikkeoppskrift</title>
<style>{css}</style></head>
<body>{''.join(pages)}</body></html>'''

(BASE / 'hatt.html').write_text(doc, encoding='utf-8')
print('OK', len(doc), 'tegn')
