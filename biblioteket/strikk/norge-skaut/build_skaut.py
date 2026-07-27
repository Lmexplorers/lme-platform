# -*- coding: utf-8 -*-
"""Genererer LME-strikkeoppskrift (Norge-skaut), norsk + engelsk. Bruk: python3 build_skaut.py [no|en]"""
import base64, html, pathlib, sys

BASE = pathlib.Path(__file__).parent
PHOTO = pathlib.Path(__file__).with_name('skaut-strikk.png')
LANG = sys.argv[1] if len(sys.argv) > 1 else 'no'
def L(no, en): return en if LANG == 'en' else no

# ---------- farger ----------
RED   = '#C8102E'
NAVY  = '#00205B'
CREAM = '#F8F4EA'
INK   = '#3f3f3f'
PINK  = '#df5f93'
TEAL  = '#4aa7a4'

FLAG = [
    "RRRWBBWRRRRRR","RRRWBBWRRRRRR","RRRWBBWRRRRRR",
    "WWWWBBWWWWWWW","BBBBBBBBBBBBB","BBBBBBBBBBBBB","WWWWBBWWWWWWW",
    "RRRWBBWRRRRRR","RRRWBBWRRRRRR","RRRWBBWRRRRRR",
]
CMAP = {'.': RED, '#': CREAM, 'R': RED, 'W': '#ffffff', 'B': NAVY}
# Skautet begynner paa spissen, saa flaggdiagrammet vises opp ned (180 grader),
# slik at flagget kommer riktig vei paa det ferdige skautet.
def flip180(rows): return [r[::-1] for r in rows[::-1]]

def chart_svg(rows, cell=22, numbers=False, title=None):
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

def mini_flag(w=34):
    h = round(w*10/13)
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 26 20" '
            f'style="width:{w}px;height:{h}px;border-radius:3px;box-shadow:0 1px 3px rgba(0,0,0,.25)">'
            f'<rect width="26" height="20" fill="{RED}"/>'
            f'<rect x="6" width="6" height="20" fill="#fff"/><rect y="7" width="26" height="6" fill="#fff"/>'
            f'<rect x="7.5" width="3" height="20" fill="{NAVY}"/><rect y="8.5" width="26" height="3" fill="{NAVY}"/>'
            f'</svg>')

def flag_rects(fx, fy, fw, fh):
    # Norsk flagg, korrekte proporsjoner (13x10): korset forskjovet mot venstre,
    # med hvit kant paa BEGGE sider av den blaa armen (vertikal og horisontal).
    ux = fw / 13.0
    uy = fh / 10.0
    return (f'<rect x="{fx}" y="{fy}" width="{fw}" height="{fh}" fill="{RED}"/>'
            f'<rect x="{fx+3*ux}" y="{fy}" width="{4*ux}" height="{fh}" fill="#fff"/>'
            f'<rect x="{fx}" y="{fy+3*uy}" width="{fw}" height="{4*uy}" fill="#fff"/>'
            f'<rect x="{fx+4*ux}" y="{fy}" width="{2*ux}" height="{fh}" fill="{NAVY}"/>'
            f'<rect x="{fx}" y="{fy+4*uy}" width="{fw}" height="{2*uy}" fill="{NAVY}"/>'
            f'<rect x="{fx}" y="{fy}" width="{fw}" height="{fh}" fill="none" stroke="#8f0a20" stroke-width="1"/>')

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
  <text x="240" y="64" text-anchor="middle" font-size="14" font-family="Sasson Montessori, sans-serif" fill="#555">{L('forkanten (over pannen): 34 (44) cm','front edge (over forehead): 34 (44) cm')}</text>
  <line x1="392" y1="90" x2="392" y2="285" stroke="#777" stroke-width="2" marker-start="url(#ah)" marker-end="url(#ah)"/>
  <text x="400" y="188" font-size="14" font-family="Sasson Montessori, sans-serif" fill="#555">{L('ned til','down to')}</text>
  <text x="400" y="206" font-size="14" font-family="Sasson Montessori, sans-serif" fill="#555">{L('spissen:','the point:')}</text>
  <text x="400" y="224" font-size="14" font-family="Sasson Montessori, sans-serif" fill="#555">24 (31) cm</text>
  <text x="66" y="222" text-anchor="middle" font-size="12" font-family="Sasson Montessori, sans-serif" fill="#444">{L('bølgekant og','wavy edge and')}</text>
  <text x="66" y="237" text-anchor="middle" font-size="12" font-family="Sasson Montessori, sans-serif" fill="#444">{L('striper rundt','stripes all')}</text>
  <text x="66" y="252" text-anchor="middle" font-size="12" font-family="Sasson Montessori, sans-serif" fill="#444">{L('hele kanten','the way round')}</text>
  <text x="70" y="150" font-size="12.5" font-family="Sasson Montessori, sans-serif" fill="#555" text-anchor="middle">{L('snor festes','tie attaches')}</text>
  <text x="70" y="165" font-size="12.5" font-family="Sasson Montessori, sans-serif" fill="#555" text-anchor="middle">{L('her (foran)','here (front)')}</text>
  <text x="240" y="302" text-anchor="middle" font-size="13" font-family="Sasson Montessori, sans-serif" fill="#888">{L('spissen bak i nakken (snorene knytes bak, under den)','the point at the back of the neck (ties fasten behind, under it)')}</text>
</svg>'''

# ---------- flerfargestrikk-paneler ----------
def stranded_panels():
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
    cols = [RED, RED, CREAM, CREAM, CREAM, RED]
    g, ox, sw, oy, sh = vrow(cols)
    g1 = g + tag(78, L('forsiden','front'))
    panels.append((1, L('Strikk hver maske i fargen diagrammet viser. Rød er bunnen, hvit (eller blå) er mønsteret.',
                        'Knit each stitch in the colour the chart shows. Red is the background, white (or blue) is the pattern.'), g1))
    y0 = 40
    g2 = tag(78, L('baksiden','back'))
    for i in range(6):
        x = 20 + i*22
        g2 += f'<path d="M{x},{y0} q6,-9 12,0" fill="none" stroke="#e2b7c6" stroke-width="4" stroke-linecap="round"/>'
    g2 += (f'<path d="M22,{y0+22} q11,7 22,0 q11,-7 22,0 q11,7 22,0 q11,-7 22,0 q11,7 22,0" '
           f'fill="none" stroke="{CREAM}" stroke-width="5" stroke-linecap="round"/>')
    g2 += (f'<path d="M22,{y0+22} q11,7 22,0 q11,-7 22,0 q11,7 22,0 q11,-7 22,0 q11,7 22,0" '
           f'fill="none" stroke="#d9d2be" stroke-width="1.5" stroke-linecap="round" opacity="0.7"/>')
    panels.append((2, L('Fargen du ikke strikker med, henger løst på baksiden. Det kalles en flott. Hold den løs, ikke stram!',
                        'The colour you are not knitting with hangs loosely on the back. It is called a float. Keep it loose, not tight!'), g2))
    y1 = 40
    g3 = tag(78, L('lange flott','long floats'))
    for i in range(6):
        x = 20 + i*22
        g3 += f'<path d="M{x},{y1} q6,-9 12,0" fill="none" stroke="#e2b7c6" stroke-width="4" stroke-linecap="round"/>'
    g3 += (f'<path d="M22,{y1+20} L64,{y1+20} Q78,{y1+30} 92,{y1+20} L134,{y1+20}" '
           f'fill="none" stroke="{CREAM}" stroke-width="5" stroke-linecap="round"/>')
    g3 += f'<circle cx="78" cy="{y1+27}" r="5" fill="none" stroke="{TEAL}" stroke-width="2.5"/>'
    panels.append((3, L('Er det mer enn 5 masker mellom fargene, fanger du den lange flotten under en maske på veien. Da blir den ikke hengende.',
                        'If there are more than 5 stitches between the colours, catch the long float under a stitch along the way. Then it does not hang loose.'), g3))
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

# ---------- foto ----------
photo_b64 = base64.b64encode(PHOTO.read_bytes()).decode()
photo_src = f'data:image/png;base64,{photo_b64}'

# ---------- byggeklosser ----------
def page(body, num, right_label=None):
    right_label = right_label or L('LME STRIKK', 'LME KNIT')
    ph2 = L('LME STRIKKEOPPSKRIFT&nbsp;&nbsp;|&nbsp;&nbsp;NORGE-SKAUT',
            'LME KNITTING PATTERN&nbsp;&nbsp;|&nbsp;&nbsp;NORWAY KERCHIEF')
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

# ============ SIDE 1: FORSIDE ============
pages.append(page(f'''
<div class="coverimg"><img src="{photo_src}" alt="{L('Strikket Norge-skaut med flagg og bølgekant','Knitted Norway kerchief with flag and wavy edge')}"></div>
<div class="covertag">{L('LME STRIKKEOPPSKRIFT','LME KNITTING PATTERN')}</div>
<div class="coverbanner">
  <div class="cflag">{mini_flag(40)}</div>
  <h1 class="covertitle">{L('NORGE-SKAUT','NORWAY KERCHIEF')}</h1>
  <div class="cflag">{mini_flag(40)}</div>
</div>
<div class="subpill">{L('TREKANTSKAUT · FLAGG FORAN ELLER BAK','TRIANGLE KERCHIEF · FLAG FRONT OR BACK')}</div>
{card(L('<p class="center">Et rødt skaut som passer til hatten. Det er en trekant med bølget '
        'kant, flaggstriper og et norsk flagg. To snorer knyter du bak i nakken. Lett å strikke, '
        'og fint å ha på 17. mai og til fotball-VM.</p>'
        '<p class="center"><b>To varianter i én oppskrift:</b> du velger selv om flagget skal sitte '
        'foran (over pannen) eller bak (nede mot spissen). Resten strikker du helt likt.</p>',
        '<p class="center">A red kerchief that matches the hat. It is a triangle with a wavy edge, '
        'flag stripes and a Norwegian flag. Two ties fasten at the back of the neck. Easy to knit, '
        'and lovely for the 17th of May and the football World Cup.</p>'
        '<p class="center"><b>Two versions in one pattern:</b> you choose whether the flag sits at '
        'the front (over the forehead) or the back (down near the point). The rest is knitted '
        'exactly the same.</p>'))}
<div class="byline">
  <div class="by1">{L('Av Renate Dahl','By Renate Dahl')}</div>
  <div class="by2">Little Montessori Explorers</div>
  <div class="by3">lmexplorers.com</div>
</div>
<div class="notecard"><span class="noteemo">&#129525;</span>
  <p><i>{L('TIPS: Les hele oppskriften en gang først. Strikk gjerne en liten prøvelapp, så blir '
           'skautet passe stort.',
           'TIP: Read the whole pattern through once first. Knit a little gauge swatch, so the '
           'kerchief comes out the right size.')}</i></p>
</div>
''', 1))

# ============ SIDE 2: FØR DU BEGYNNER ============
pages.append(page(f'''
{banner(L('FØR DU BEGYNNER','BEFORE YOU START'))}
<p>{L('Et skaut er lett å strikke. Du starter nede i spissen med noen få masker. Så øker du litt og '
      'litt, til trekanten er stor nok. Rundt hele skautet lager du en bølget kant med flaggstriper. '
      'Vil du, strikker du også inn et flagg på midten. Til slutt lager du to snorer å knyte med.',
      'A kerchief is easy to knit. You start at the point with just a few stitches. Then you '
      'increase little by little, until the triangle is big enough. Around the whole kerchief you '
      'make a wavy edge with flag stripes. If you like, you also knit in a flag in the middle. At '
      'the end you make two ties to fasten with.')}</p>
{tealp(L('DETTE LÆRER DU','WHAT YOU LEARN'))}
{card(ul([
  L('Å strikke en trekant','To knit a triangle'),
  L('Å øke masker i sidene','To increase stitches at the sides'),
  L('Å strikke inn et flagg med to farger (valgfritt)','To knit in a flag in two colours (optional)'),
  L('Å lage en snor (I-cord)','To make a tie (I-cord)'),
  L('Å lage en bølget kant','To make a wavy edge'),
]))}
{pink(L('ER DET VANSKELIG?','IS IT HARD?'))}
{card(L('<p><b>Nybegynner.</b> Kan du legge opp masker, strikke rett og øke, klarer du dette. '
        'Alt annet står steg for steg. Spør en voksen hvis du står fast.</p>',
        '<p><b>Beginner.</b> If you can cast on, knit and increase, you can do this. Everything '
        'else is given step by step. Ask a grown-up if you get stuck.</p>'))}
{pink(L('SLIK LESER DU TALLENE','HOW TO READ THE NUMBERS'))}
{card(L('<p>Skautet kommer i to størrelser. Tallene står slik:</p>'
        '<p class="center bignum">barn (voksen)</p>'
        '<p>Til barn bruker du det første tallet. Til voksen bruker du tallet i parentes.</p>',
        '<p>The kerchief comes in two sizes. The numbers are written like this:</p>'
        '<p class="center bignum">child (adult)</p>'
        '<p>For a child use the first number. For an adult use the number in brackets.</p>'))}
{cream('<p class="creamtitle">' + L('Ett steg om gangen. Så blir det et skaut til slutt.',
       'One step at a time. And it becomes a kerchief in the end.') + '</p>')}
''', 2))

# ============ SIDE 3: DETTE TRENGER DU ============
pages.append(page(f'''
{banner(L('DETTE TRENGER DU','WHAT YOU NEED'))}
{tealp(L('GARN','YARN'))}
{card(L('<p><b>DROPS Paris</b> (100 % bomull). Et tykt, mykt bomullsgarn. Du strikker på pinne 5.</p>',
        '<p><b>DROPS Paris</b> (100% cotton). A thick, soft cotton yarn. You knit on 5 mm needles.</p>')
      + '<table class="t"><tr><th>' + L('Farge','Colour') + '</th><th>' + L('Barn','Child')
      + '</th><th>' + L('Voksen','Adult') + '</th></tr>'
      '<tr><td><span class="dot" style="background:'+RED+'"></span> ' + L('Rød','Red')
      + '</td><td>' + L('1 nøste','1 ball') + '</td><td>' + L('2 nøster','2 balls') + '</td></tr>'
      '<tr><td><span class="dot" style="background:#fff;border:1px solid #bbb"></span> ' + L('Hvit','White')
      + '</td><td>' + L('1 nøste','1 ball') + '</td><td>' + L('1 nøste','1 ball') + '</td></tr>'
      '<tr><td><span class="dot" style="background:'+NAVY+'"></span> ' + L('Marineblå','Navy blue')
      + '</td><td>' + L('1 nøste','1 ball') + '</td><td>' + L('1 nøste','1 ball') + '</td></tr></table>')}
{tealp(L('DETTE OGSÅ','ALSO THIS'))}
{card(ul([
  L('<b>rundpinne 5 mm</b> (den er lang, så det er plass til mange masker)',
    'A <b>5 mm circular needle</b> (it is long, so there is room for many stitches)'),
  L('To <b>strømpepinner 5 mm</b> til snorene','Two <b>5 mm double-pointed needles</b> for the ties'),
  L('En <b>maskemarkør</b> (eller en liten trådløkke)','A <b>stitch marker</b> (or a little loop of yarn)'),
  L('En <b>stoppenål</b> med butt spiss','A <b>tapestry needle</b> with a blunt tip'),
  L('Saks','Scissors'),
]))}
{pink(L('PRØVELAPP','GAUGE SWATCH'))}
{card(L('<p>Strikk en liten lapp først. Legg opp 20 masker og strikk rett fram og tilbake til '
        'lappen er 10 cm høy. Legg den flatt. Er 10 cm like langt som 17 masker? Da er du klar. '
        'Er det flere masker, bytt til pinne 5,5. Er det færre, bytt til pinne 4,5.</p>',
        '<p>Knit a little swatch first. Cast on 20 stitches and knit garter stitch back and forth '
        'until the swatch is 10 cm tall. Lay it flat. Is 10 cm the same as 17 stitches? Then you '
        'are ready. If there are more stitches, switch to 5.5 mm needles. If there are fewer, '
        'switch to 4.5 mm needles.</p>'))}
''', 3))

# ============ SIDE 4: STØRRELSER OG MÅL ============
pages.append(page(f'''
{banner(L('STØRRELSER OG MÅL','SIZES AND MEASUREMENTS'))}
{tealp(L('HVOR STORT?','HOW BIG?'))}
{card(L('<p>Skautet er en trekant. Den brede forkanten ligger over pannen. Spissen henger ned bak i '
        'nakken. Snorene festes i de to fremre hjørnene og knytes bak, under spissen.</p>',
        '<p>The kerchief is a triangle. The wide front edge lies over the forehead. The point hangs '
        'down at the back of the neck. The ties attach at the two front corners and fasten at the '
        'back, under the point.</p>')
      + '<table class="t"><tr><th></th><th>' + L('Barn','Child') + '</th><th>' + L('Voksen','Adult')
      + '</th></tr>'
      '<tr><td>' + L('Forkanten (over pannen)','Front edge (over forehead)')
      + '</td><td>' + L('ca. 34 cm','approx. 34 cm') + '</td><td>' + L('ca. 44 cm','approx. 44 cm') + '</td></tr>'
      '<tr><td>' + L('Ned til spissen','Down to the point')
      + '</td><td>' + L('ca. 24 cm','approx. 24 cm') + '</td><td>' + L('ca. 31 cm','approx. 31 cm') + '</td></tr>'
      '<tr><td>' + L('Hver snor','Each tie')
      + '</td><td>' + L('ca. 30 cm','approx. 30 cm') + '</td><td>' + L('ca. 35 cm','approx. 35 cm') + '</td></tr></table>')}
{card(scarf_schematic())}
{cream('<p class="creamtitle">' + L('Snorene kan du gjøre lengre om du vil. Da er de lette å knyte.',
       'You can make the ties longer if you like. Then they are easy to tie.') + '</p>')}
''', 4))

# ============ SIDE 5: ORDLISTE ============
pages.append(page(f'''
{banner(L('ORDLISTE','GLOSSARY'))}
{card('<table class="t tl"><tr><th>' + L('Ord','Term') + '</th><th>' + L('Betyr','Means') + '</th></tr>'
      + L('<tr><td><b>m</b></td><td>maske</td></tr>'
          '<tr><td><b>r</b></td><td>rett, en vanlig maske</td></tr>'
          '<tr><td><b>pinne</b></td><td>en rad, når du har strikket bort og tilbake</td></tr>'
          '<tr><td><b>legge opp</b></td><td>lage de første maskene</td></tr>'
          '<tr><td><b>øke</b></td><td>lage flere masker. Her: strikk 2 masker i 1 maske, så blir det '
          'en maske mer.</td></tr>'
          '<tr><td><b>felle av</b></td><td>ta maskene av pinnen så strikkingen ikke løser seg opp</td></tr>'
          '<tr><td><b>I-cord</b></td><td>en liten, rund snor du strikker (side 9)</td></tr>'
          '<tr><td><b>flott</b></td><td>tråden i fargen du ikke bruker akkurat nå, som ligger bak</td></tr>',
          '<tr><td><b>st</b></td><td>stitch</td></tr>'
          '<tr><td><b>k</b></td><td>knit, an ordinary stitch</td></tr>'
          '<tr><td><b>row</b></td><td>one row, when you have knitted across and back</td></tr>'
          '<tr><td><b>cast on</b></td><td>make the first stitches</td></tr>'
          '<tr><td><b>increase</b></td><td>make more stitches. Here: knit 2 stitches in 1 stitch, so '
          'you get one more stitch.</td></tr>'
          '<tr><td><b>bind off</b></td><td>take the stitches off the needle so the knitting does not '
          'unravel</td></tr>'
          '<tr><td><b>I-cord</b></td><td>a little, round cord you knit (page 9)</td></tr>'
          '<tr><td><b>float</b></td><td>the yarn in the colour you are not using right now, lying at '
          'the back</td></tr>')
      + '</table>')}
{pink(L('SLIK ER SKAUTET BYGGET OPP','HOW THE KERCHIEF IS BUILT UP'))}
{card(steps([
  L('<b>Trekanten:</b> Du starter i spissen og øker til trekanten er stor nok. Vil du ha flagg, strikker du det inn litt oppe foran.',
    '<b>The triangle:</b> You start at the point and increase until the triangle is big enough. If you want a flag, you knit it in the middle.'),
  L('<b>Bølgekanten:</b> Rundt hele skautet lager du en bølget kant med hvite og blå striper.',
    '<b>The wavy edge:</b> Around the whole kerchief you make a wavy edge with white and blue stripes.'),
  L('<b>Snorene:</b> Til slutt lager du to snorer å knyte bak i nakken.',
    '<b>The ties:</b> At the end you make two ties to fasten at the back of the neck.'),
]))}
''', 5))

# ============ SIDE 6: FLERFARGESTRIKK ============
pages.append(page(f'''
{banner(L('SLIK STRIKKER DU INN FLAGGET','HOW TO KNIT IN THE FLAG'))}
<p>{L('Denne siden trenger du bare hvis du vil ha flagget på (den enkle varianten hopper over dette). '
      'Flagget strikker du inn med to farger på samme pinne. Du strikker med rød der ruten er rød, '
      'og med hvit eller blå der ruten er hvit eller blå. Fargen du ikke bruker, lar du henge løst '
      'bak. Flaggdiagrammet står på side 10.',
      'You only need this page if you want the flag (the simple version skips it). You knit the '
      'flag in two colours on the same needle. You knit with red where the square is red, and with '
      'white or blue where the square is white or blue. The colour you are not using, you let hang '
      'loosely at the back. The flag chart is on page 10.')}</p>
{tealp(L('TRE TING Å HUSKE','THREE THINGS TO REMEMBER'))}
{card(stranded_panels())}
{pink(L('GODE RÅD','GOOD ADVICE'))}
{card(ul([
  L('Hold tråden bak løs. Strammer du for hardt, buler strikken. Heller for løst enn for stramt.',
    'Keep the yarn at the back loose. If you pull too hard, the knitting bulges. Better too loose than too tight.'),
  L('Les hver rad nedenfra og opp, og fra høyre mot venstre.',
    'Read each row from the bottom up, and from right to left.'),
  L('Tell rutene i diagrammet og maskene på skautet. Å telle riktig er halve jobben.',
    'Count the squares in the chart and the stitches on the kerchief. Counting right is half the job.'),
  L('Strikk gjerne en liten prøvelapp med to farger først.',
    'Knit a little swatch in two colours first if you like.'),
]))}
''', 6))

# ============ SIDE 7: DEL 1 TREKANTEN ============
pages.append(page(f'''
{banner(L('DEL 1: TREKANTEN','PART 1: THE TRIANGLE'))}
<p>{L('Husk: barn (voksen). Du strikker rett fram og tilbake hele tiden.',
      'Remember: child (adult). You knit garter stitch back and forth the whole time.')}</p>
{steps([
  L('Legg opp <b>4 masker</b> med rødt. Dette er spissen. Den havner bak i nakken.',
    'Cast on <b>4 stitches</b> in red. This is the point. It ends up at the back of the neck.'),
  L('Strikk 2 pinner rett.','Knit 2 rows.'),
  L('Nå øker du. På <b>hver 2. pinne</b> øker du 1 maske i hver ende: strikk 1, øk i neste maske, '
    'strikk til det er 2 masker igjen, øk, strikk 1. Da blir det 2 masker mer hver gang.',
    'Now you increase. On <b>every 2nd row</b> you increase 1 stitch at each end: knit 1, increase '
    'in the next stitch, knit until 2 stitches remain, increase, knit 1. That gives 2 more '
    'stitches each time.'),
  L('Fortsett slik. Trekanten blir større og større. Strikk til den brede <b>forkanten</b> måler '
    '<b>34 (44) cm</b>. Det er kanten som skal ligge over pannen.',
    'Keep going like this. The triangle grows bigger and bigger. Knit until the wide <b>front '
    'edge</b> measures <b>34 (44) cm</b>. That is the edge that lies over the forehead.'),
  L('Vil du ha flagg? Velg hvor det skal sitte. <b>Flagg foran:</b> strikk det inn på midten når det '
    'er ca. 5 cm igjen før den brede forkanten. Da havner flagget oppe over pannen. <b>Flagg bak:</b> '
    'strikk det inn på midten litt etter at du startet trekanten, mens den fortsatt er smal (ca. 13 '
    'til 16 masker bred). Da havner flagget nede mot spissen, som ligger bak i nakken. Følg '
    'flaggdiagrammet på side 10. Vil du ha det enkelt, hopper du over flagget.',
    'Want a flag? Choose where it goes. <b>Flag at the front:</b> knit it in the middle when about '
    '5 cm remain before the wide front edge. Then the flag ends up high, over the forehead. '
    '<b>Flag at the back:</b> knit it in the middle a little after you started the triangle, while '
    'it is still narrow (about 13 to 16 stitches wide). Then the flag ends up down near the point, '
    'at the back of the neck. Follow the flag chart on page 10. If you want it simple, skip the flag.'),
  L('Fell av den brede forkanten løst.','Bind off the wide front edge loosely.'),
])}
{cream('<p class="creamtitle">' + L('Mistet du en maske? Ta det med ro. Løft den opp igjen, eller be en '
       'voksen om hjelp. Ingenting er ødelagt.',
       'Dropped a stitch? Take it easy. Lift it back up, or ask a grown-up for help. Nothing is '
       'ruined.') + '</p>')}
''', 7))

# ============ SIDE 8: DEL 2 BØLGEKANTEN ============
pages.append(page(f'''
{banner(L('DEL 2: BØLGEKANT RUNDT HELE','PART 2: WAVY EDGE ALL AROUND'))}
<p>{L('Nå lager du den bølgete kanten med flaggstriper <b>rundt hele skautet</b>. Bølgene kommer av '
      'at du får mange masker på lite plass.',
      'Now you make the wavy edge with flag stripes <b>around the whole kerchief</b>. The waves '
      'come from getting many stitches into a small space.')}</p>
{steps([
  L('Plukk opp masker med rundpinnen <b>rundt hele kanten</b>: langs den brede forkanten, ned den '
    'ene siden til spissen, og opp den andre siden tilbake. Plukk opp ca. 3 masker for hver 4 du '
    'går forbi. I spissen og i de to fremre hjørnene plukker du opp 1 ekstra, så det ikke strammer.',
    'Pick up stitches with the circular needle <b>around the whole edge</b>: along the wide front '
    'edge, down one side to the point, and up the other side back. Pick up about 3 stitches for '
    'every 4 you pass. At the point and at the two front corners, pick up 1 extra so it does not '
    'pull tight.'),
  L('Sett en maskemarkør der du startet, og strikk rundt og rundt. Strikk 1 omgang rødt.',
    'Place a stitch marker where you started, and knit round and round. Knit 1 round in red.'),
  L('Øk til <b>dobbelt så mange</b> masker: strikk 1, øk i neste, hele veien rundt. Nå bukter kanten seg.',
    'Increase to <b>twice as many</b> stitches: knit 1, increase in the next, all the way around. Now the edge ripples.'),
  L('Strikk striper: <b>2 omganger hvit, 2 omganger marineblå, 2 omganger hvit</b>.',
    'Knit stripes: <b>2 rounds white, 2 rounds navy blue, 2 rounds white</b>.'),
  L('Fell av løst med rødt. Strammer du, blir kanten stiv. Løst gir fine bølger.',
    'Bind off loosely in red. If you pull tight, the edge stiffens. Loose gives nice waves.'),
])}
{cream('<p class="creamtitle">' + L('ENKEL VARIANT (fin for de yngste, ca. 8 år):<br>'
       'Hopp over flagget i Del 1. Strikk bare den røde trekanten, og lag denne bølgekanten med '
       'stripene. Da trenger du aldri to farger på en gang, bare én farge om gangen. Like fint!',
       'SIMPLE VERSION (great for the youngest, about 8 years):<br>'
       'Skip the flag in Part 1. Knit just the red triangle, and make this wavy edge with the '
       'stripes. Then you never need two colours at once, only one colour at a time. Just as '
       'lovely!') + '</p>')}
''', 8))

# ============ SIDE 9: DEL 3 SNORENE ============
pages.append(page(f'''
{banner(L('DEL 3: SNORENE TIL Å KNYTE MED','PART 3: THE TIES TO FASTEN WITH'))}
<p>{L('Snorene heter I-cord. Det er en liten, rund snor. Den er lett å lage når du kan trikset.',
      'The ties are called I-cord. It is a little, round cord. It is easy to make once you know the trick.')}</p>
{tealp(L('SLIK LAGER DU EN I-CORD','HOW TO MAKE AN I-CORD'))}
{card(steps([
  L('Legg opp <b>3 masker</b> på en strømpepinne.','Cast on <b>3 stitches</b> on a double-pointed needle.'),
  L('Strikk 3 rett. <b>Ikke snu strikkingen.</b>','Knit 3. <b>Do not turn the work.</b>'),
  L('Skyv de 3 maskene til den andre enden av pinnen. Ta garnet stramt bak.',
    'Slide the 3 stitches to the other end of the needle. Pull the yarn tight across the back.'),
  L('Strikk 3 rett igjen. Gjenta og gjenta. Nå ruller snoren seg rund helt av seg selv!',
    'Knit 3 again. Repeat and repeat. Now the cord rolls up round all by itself!'),
  L('Strikk til snoren er <b>30 (35) cm</b>. Fell av. Den skal nå rundt til nakken.',
    'Knit until the cord is <b>30 (35) cm</b>. Bind off. It needs to reach round to the neck.'),
]))}
{pink(L('SETT SNORENE PÅ','ATTACH THE TIES'))}
{card(ul([
  L('Lag <b>to snorer</b>.','Make <b>two ties</b>.'),
  L('Fest en snor godt i hvert av de to <b>fremre hjørnene</b> (der forkanten møter sidene). Sy '
    'enden fast med stoppenålen.',
    'Attach one tie firmly in each of the two <b>front corners</b> (where the front edge meets the '
    'sides). Sew the end fast with the tapestry needle.'),
  L('Legg skautet på hodet: den brede forkanten over pannen, spissen ned bak i nakken.',
    'Put the kerchief on the head: the wide front edge over the forehead, the point down at the back of the neck.'),
  L('Før de to snorene bak og knyt dem sammen <b>bak, under spissen</b>.',
    'Bring the two ties round the back and tie them together <b>behind, under the point</b>.'),
]))}
''', 9))

# ============ SIDE 10: DIAGRAM FLAGGET ============
pages.append(page(f'''
{banner(L('DIAGRAM: FLAGGET','CHART: THE FLAG'))}
<p>{L('Flagget er valgfritt. Vil du ha det, strikker du det inn på midten av trekanten. En rute er en '
      'maske. Hvit rute: strikk med hvit. Blå rute: strikk med blå. Rød rute: strikk med rød. Les '
      'nedenfra og opp, fra høyre mot venstre. Den blå streken i korset skal gå helt gjennom, uten '
      'brudd.',
      'The flag is optional. If you want it, you knit it in the middle of the triangle. One square '
      'is one stitch. White square: knit with white. Blue square: knit with blue. Red square: knit '
      'with red. Read from the bottom up, from right to left. The blue line in the cross should run '
      'all the way through, unbroken.')}</p>
<p style="background:#fdf9e3;border:2px solid #df5f93;border-radius:12px;padding:2.5mm 5mm;font-weight:600;color:#3f3f3f;">{L('Diagrammet vises opp ned, fordi skautet begynner på spissen og strikkes oppover. Strikk etter diagrammet slik det står her, så kommer flagget riktig vei på det ferdige skautet.','The chart is shown upside down, because the kerchief begins at the point and is worked upwards. Knit from the chart as it appears here, and the flag will come out the right way on the finished kerchief.')}</p>
<div class="chartrow">
{chart_svg(flip180(FLAG), cell=26, numbers=True, title=L('FLAGGET, OPP NED (13 RUTER BREDT, 10 RUTER HØYT)','THE FLAG, UPSIDE DOWN (13 SQUARES WIDE, 10 SQUARES TALL)'))}
</div>
{pink(L('HVOR PÅ SKAUTET? VELG SELV','WHERE ON THE KERCHIEF? YOU CHOOSE'))}
{card(L('<p>Flagget skal alltid sitte midt mellom de to sidene. Du velger om det skal være foran '
        'eller bak:</p>',
        '<p>The flag always sits in the middle, between the two sides. You choose whether it goes '
        'at the front or the back:</p>') + ul([
  L('<b>Flagg foran (over pannen):</b> strikk flagget inn når det er ca. 5 cm igjen før den brede '
    'forkanten. Da er trekanten bred nok, og flagget havner høyt oppe.',
    '<b>Flag at the front (over the forehead):</b> knit the flag in when about 5 cm remain before '
    'the wide front edge. Then the triangle is wide enough, and the flag sits high up.'),
  L('<b>Flagg bak (mot spissen):</b> strikk flagget inn tidlig, mens trekanten er ca. 13 til 16 '
    'masker bred. Da havner flagget nede ved spissen, som ligger bak i nakken.',
    '<b>Flag at the back (near the point):</b> knit the flag in early, while the triangle is about '
    '13 to 16 stitches wide. Then the flag sits down near the point, at the back of the neck.'),
  L('Uansett hvor: strikk rødt under, over og rundt flagget.',
    'Either way: knit red below, above and around the flag.'),
]))}
''', 10))

# ============ SIDE 11: MONTERING ============
pages.append(page(f'''
{banner(L('FERDIG OG STELL','FINISHING AND CARE'))}
{tealp(L('HELT TIL SLUTT','RIGHT AT THE END'))}
{steps([
  L('Fest alle løse tråder på baksiden med stoppenålen. Klipp av det som er igjen.',
    'Weave in all loose ends on the back with the tapestry needle. Trim what is left.'),
  L('Skyll skautet i lunkent vann, eller vask på 40 grader (bomull tåler det).',
    'Rinse the kerchief in lukewarm water, or wash at 40 degrees (cotton can take it).'),
  L('Klem ut vannet i et håndkle. Ikke vri!','Squeeze out the water in a towel. Do not wring!'),
  L('Legg skautet flatt til tørk. Form den bølgete kanten fint mens det er vått.',
    'Lay the kerchief flat to dry. Shape the wavy edge nicely while it is wet.'),
])}
{pink(L('SJEKKLISTE','CHECKLIST'))}
{card(ul([
  L('Alle tråder er festet','All ends are woven in'),
  L('Flagget står midt på','The flag sits in the middle'),
  L('Toppkanten bølger','The top edge ripples'),
  L('De to snorene sitter godt fast','The two ties are firmly attached'),
]))}
{cream('<p class="creamtitle">' + L('Gratulerer! Nå har du strikket ditt eget skaut.<br>'
       'Bruk det sammen med hatten, heia Norge!',
       'Congratulations! Now you have knitted your very own kerchief.<br>'
       'Wear it with the hat, go Norway!') + '</p>')}
<div class="endflag">{mini_flag(64)}</div>
<div class="byline">
  <div class="by1">{L('God sommer!','Happy summer!')}</div>
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
title = L('Norge-skaut, LME strikkeoppskrift', 'Norway kerchief, LME knitting pattern')
doc = f'''<!DOCTYPE html>
<html lang="{lang_attr}"><head><meta charset="utf-8">
<title>{title}</title>
<style>{css}</style></head>
<body>{''.join(pages)}</body></html>'''

outname = 'skaut_en.html' if LANG == 'en' else 'skaut.html'
(BASE / outname).write_text(doc, encoding='utf-8')
print('OK', LANG, len(doc), 'tegn ->', outname)
