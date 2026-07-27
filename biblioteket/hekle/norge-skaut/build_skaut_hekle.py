# -*- coding: utf-8 -*-
"""Genererer LME-hekleoppskrift (Norge-skaut), norsk + engelsk. Bruk: python3 build_skaut_hekle.py [no|en]"""
import base64, html, pathlib, sys

BASE = pathlib.Path(__file__).parent
PHOTO = pathlib.Path(__file__).with_name('skaut-hekle.png')
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

# ---------- tapestry-paneler (heklet flerfarge) ----------
def tapestry_panels():
    def tag(cx, text, w=None):
        w = w or (len(text)*6.1 + 14)
        x = cx - w/2
        return (f'<rect x="{x}" y="6" width="{w}" height="17" rx="8.5" fill="#e9f6f5" '
                f'stroke="{TEAL}" stroke-width="1.5"/>'
                f'<text x="{cx}" y="18.4" text-anchor="middle" font-size="11" '
                f'font-family="Sasson Montessori, sans-serif" font-weight="bold" fill="#2e8e8a">{html.escape(text)}</text>')
    def fm_row(colors, sw=21, ox=19, oy=42, sh=22):
        out = []
        for i, c in enumerate(colors):
            x = ox + i*sw
            out.append(f'<rect x="{x}" y="{oy}" width="{sw-3}" height="{sh}" rx="4" '
                       f'fill="{c}" stroke="rgba(0,0,0,.25)" stroke-width="1"/>')
        return ''.join(out)
    panels = []
    g1 = fm_row([RED, RED, '#fff', '#fff', '#fff', RED]) + tag(78, L('forsiden','front'))
    panels.append((1, L('Hekle hver fastmaske i fargen ruten viser. Rød er bunnen, hvit eller blå er '
                        'mønsteret.',
                        'Crochet each single crochet in the colour the square shows. Red is the '
                        'background, white or blue is the pattern.'), g1))
    y0 = 40
    g2 = tag(78, L('bytt farge','change colour'))
    g2 += fm_row([RED, RED, RED], ox=19, oy=y0)
    g2 += fm_row(['#fff', '#fff', '#fff'], ox=82, oy=y0)
    g2 += f'<circle cx="76" cy="{y0+11}" r="7" fill="none" stroke="{TEAL}" stroke-width="2.5"/>'
    panels.append((2, L('Bytt farge i siste bevegelse på masken før: hent den nye fargen gjennom de to '
                        'siste løkkene på nålen. Da blir skiftet reint.',
                        'Change colour on the last step of the stitch before: pull the new colour '
                        'through the last two loops on the hook. That keeps the change clean.'), g2))
    y1 = 44
    g3 = tag(78, L('tråden inni','yarn inside'))
    for i in range(6):
        x = 20 + i*22
        g3 += f'<rect x="{x}" y="{y1}" width="18" height="20" rx="4" fill="{RED}" stroke="rgba(0,0,0,.2)" stroke-width="1"/>'
    g3 += (f'<path d="M22,{y1+10} L134,{y1+10}" stroke="#fff" stroke-width="4" '
           f'stroke-linecap="round" opacity="0.9"/>')
    panels.append((3, L('Fargen du ikke hekler med, legger du oppå omgangen og hekler rundt. Da ligger '
                        'den gjemt inni, klar til bruk. Hold den løs, ikke stram.',
                        'The colour you are not using, lay it on top of the row and crochet around '
                        'it. Then it stays hidden inside, ready to use. Keep it loose, not tight.'), g3))
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
    right_label = right_label or L('LME HEKLE', 'LME CROCHET')
    ph2 = L('LME HEKLEOPPSKRIFT&nbsp;&nbsp;|&nbsp;&nbsp;NORGE-SKAUT',
            'LME CROCHET PATTERN&nbsp;&nbsp;|&nbsp;&nbsp;NORWAY KERCHIEF')
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
<div class="coverimg"><img src="{photo_src}" alt="{L('Heklet Norge-skaut med flagg og bølgekant','Crocheted Norway kerchief with flag and wavy edge')}"></div>
<div class="covertag">{L('LME HEKLEOPPSKRIFT','LME CROCHET PATTERN')}</div>
<div class="coverbanner">
  <div class="cflag">{mini_flag(40)}</div>
  <h1 class="covertitle">{L('NORGE-SKAUT','NORWAY KERCHIEF')}</h1>
  <div class="cflag">{mini_flag(40)}</div>
</div>
<div class="subpill">{L('TREKANTSKAUT · FLAGG FORAN ELLER BAK','TRIANGLE KERCHIEF · FLAG FRONT OR BACK')}</div>
{card(L('<p class="center">Et rødt skaut som passer til hatten. Det er en trekant med bølget '
        'kant, flaggstriper og et norsk flagg. To snorer knyter du bak i nakken. Lett å hekle, '
        'og fint å ha på 17. mai og til fotball-VM.</p>'
        '<p class="center"><b>To varianter i én oppskrift:</b> du velger selv om flagget skal sitte '
        'foran (over pannen) eller bak (nede mot spissen). Resten hekler du helt likt.</p>',
        '<p class="center">A red kerchief that matches the hat. It is a triangle with a wavy edge, '
        'flag stripes and a Norwegian flag. Two ties fasten at the back of the neck. Easy to '
        'crochet, and lovely for the 17th of May and the football World Cup.</p>'
        '<p class="center"><b>Two versions in one pattern:</b> you choose whether the flag sits at '
        'the front (over the forehead) or the back (down near the point). The rest is crocheted '
        'exactly the same.</p>'))}
<div class="byline">
  <div class="by1">{L('Av Renate Dahl','By Renate Dahl')}</div>
  <div class="by2">Little Montessori Explorers</div>
  <div class="by3">lmexplorers.com</div>
</div>
<div class="notecard"><span class="noteemo">&#129525;</span>
  <p><i>{L('TIPS: Les hele oppskriften en gang først. Hekle gjerne en liten prøvelapp, så blir '
           'skautet passe stort.',
           'TIP: Read the whole pattern through once first. Crochet a little gauge swatch, so the '
           'kerchief comes out the right size.')}</i></p>
</div>
''', 1))

# ============ SIDE 2: FØR DU BEGYNNER ============
pages.append(page(f'''
{banner(L('FØR DU BEGYNNER','BEFORE YOU START'))}
<p>{L('Et skaut er lett å hekle. Du starter nede i spissen med noen få masker. Så øker du litt og '
      'litt, til trekanten er stor nok. Rundt hele skautet hekler du en bølget kant med '
      'flaggstriper. Vil du, hekler du også inn et flagg på midten. Til slutt lager du to snorer å '
      'knyte med.',
      'A kerchief is easy to crochet. You start at the point with just a few stitches. Then you '
      'increase little by little, until the triangle is big enough. Around the whole kerchief you '
      'crochet a wavy edge with flag stripes. If you like, you also crochet a flag in the middle. '
      'At the end you make two ties to fasten with.')}</p>
{tealp(L('DETTE LÆRER DU','WHAT YOU LEARN'))}
{card(ul([
  L('Å hekle en trekant med fastmasker','To crochet a triangle in single crochet'),
  L('Å øke masker i sidene','To increase stitches at the sides'),
  L('Å hekle inn et flagg med to farger (valgfritt)','To crochet a flag in two colours (optional)'),
  L('Å hekle en snor','To crochet a tie'),
  L('Å lage en bølget kant','To make a wavy edge'),
]))}
{pink(L('ER DET VANSKELIG?','IS IT HARD?'))}
{card(L('<p><b>Nybegynner.</b> Kan du hekle luftmasker og fastmasker og øke, klarer du dette. '
        'Alt annet står steg for steg. Spør en voksen hvis du står fast.</p>',
        '<p><b>Beginner.</b> If you can crochet chains and single crochet and increase, you can do '
        'this. Everything else is given step by step. Ask a grown-up if you get stuck.</p>'))}
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
{card(L('<p><b>DROPS Paris</b> (100 % bomull). Et tykt, mykt bomullsgarn. Du hekler med nål 5.</p>',
        '<p><b>DROPS Paris</b> (100% cotton). A thick, soft cotton yarn. You crochet with a 5 mm '
        'hook.</p>')
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
  L('En <b>heklenål 5 mm</b>','A <b>5 mm crochet hook</b>'),
  L('En <b>maskemarkør</b> (eller en liten trådløkke)','A <b>stitch marker</b> (or a little loop of yarn)'),
  L('En <b>stoppenål</b> med butt spiss','A <b>tapestry needle</b> with a blunt tip'),
  L('Saks','Scissors'),
]))}
{pink(L('PRØVELAPP','GAUGE SWATCH'))}
{card(L('<p>Hekle en liten lapp først. Hekle 20 fastmasker fram og tilbake til lappen er 10 cm høy. '
        'Legg den flatt. Er 10 cm like langt som 14 fastmasker? Da er du klar. Er det flere masker, '
        'bytt til nål 5,5. Er det færre, bytt til nål 4,5.</p>',
        '<p>Crochet a little swatch first. Crochet 20 single crochet back and forth until the '
        'swatch is 10 cm tall. Lay it flat. Is 10 cm the same as 14 single crochet? Then you are '
        'ready. If there are more stitches, switch to a 5.5 mm hook. If there are fewer, switch to '
        'a 4.5 mm hook.</p>'))}
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
          '<tr><td><b>lm</b></td><td>luftmaske</td></tr>'
          '<tr><td><b>fm</b></td><td>fastmaske, den vanligste masken</td></tr>'
          '<tr><td><b>kjm</b></td><td>kjedemaske, en flat maske som binder sammen</td></tr>'
          '<tr><td><b>rad</b></td><td>en tur, når du har heklet bort og snudd</td></tr>'
          '<tr><td><b>øke</b></td><td>lage flere masker. Her: hekle 2 fm i samme maske, så blir det '
          'en maske mer.</td></tr>'
          '<tr><td><b>snu</b></td><td>vende arbeidet og hekle tilbake den andre veien</td></tr>'
          '<tr><td><b>tapestry</b></td><td>å hekle inn flere farger, og la fargen du ikke bruker '
          'ligge gjemt inni</td></tr>',
          '<tr><td><b>st</b></td><td>stitch</td></tr>'
          '<tr><td><b>ch</b></td><td>chain</td></tr>'
          '<tr><td><b>sc</b></td><td>single crochet, the most common stitch</td></tr>'
          '<tr><td><b>sl st</b></td><td>slip stitch, a flat stitch that joins</td></tr>'
          '<tr><td><b>row</b></td><td>one pass, when you have crocheted across and turned</td></tr>'
          '<tr><td><b>increase</b></td><td>make more stitches. Here: crochet 2 sc in the same '
          'stitch, so you get one more stitch.</td></tr>'
          '<tr><td><b>turn</b></td><td>turn the work and crochet back the other way</td></tr>'
          '<tr><td><b>tapestry</b></td><td>crocheting in several colours, letting the colour you '
          'are not using stay hidden inside</td></tr>')
      + '</table>')}
{pink(L('SLIK ER SKAUTET BYGGET OPP','HOW THE KERCHIEF IS BUILT UP'))}
{card(steps([
  L('<b>Trekanten:</b> Du starter i spissen og øker til trekanten er stor nok. Vil du ha flagg, hekler du det inn midt på.',
    '<b>The triangle:</b> You start at the point and increase until the triangle is big enough. If you want a flag, you crochet it in the middle.'),
  L('<b>Bølgekanten:</b> Rundt hele skautet hekler du en bølget kant med hvite og blå striper.',
    '<b>The wavy edge:</b> Around the whole kerchief you crochet a wavy edge with white and blue stripes.'),
  L('<b>Snorene:</b> Til slutt hekler du to snorer å knyte bak i nakken.',
    '<b>The ties:</b> At the end you crochet two ties to fasten at the back of the neck.'),
]))}
''', 5))

# ============ SIDE 6: FLERFARGE / TAPESTRY ============
pages.append(page(f'''
{banner(L('SLIK HEKLER DU INN FLAGGET','HOW TO CROCHET IN THE FLAG'))}
<p>{L('Denne siden trenger du bare hvis du vil ha flagget på (den enkle varianten hopper over dette). '
      'Flagget hekler du inn med to farger med tapestry-teknikk. Du hekler med rød der ruten er rød, '
      'og med hvit eller blå der ruten er hvit eller blå. Fargen du ikke bruker, legger du oppå '
      'omgangen og hekler rundt, så den ligger gjemt inni. Flaggdiagrammet står på side 10.',
      'You only need this page if you want the flag (the simple version skips it). You crochet the '
      'flag in two colours with the tapestry technique. You crochet with red where the square is '
      'red, and with white or blue where the square is white or blue. The colour you are not using, '
      'you lay on top of the row and crochet around, so it stays hidden inside. The flag chart is '
      'on page 10.')}</p>
{tealp(L('TRE TING Å HUSKE','THREE THINGS TO REMEMBER'))}
{card(tapestry_panels())}
{pink(L('GODE RÅD','GOOD ADVICE'))}
{card(ul([
  L('Hold tråden inni løs. Strammer du for hardt, buler heklingen. Heller for løst enn for stramt.',
    'Keep the yarn inside loose. If you pull too hard, the crochet bulges. Better too loose than too tight.'),
  L('Les hver rad nedenfra og opp. Snur du arbeidet, leser du annenhver rad motsatt vei.',
    'Read each row from the bottom up. When you turn the work, you read every other row the opposite way.'),
  L('Tell rutene i diagrammet og maskene på skautet. Å telle riktig er halve jobben.',
    'Count the squares in the chart and the stitches on the kerchief. Counting right is half the job.'),
  L('Hekle gjerne en liten prøvelapp med to farger først.',
    'Crochet a little swatch in two colours first if you like.'),
]))}
''', 6))

# ============ SIDE 7: DEL 1 TREKANTEN ============
pages.append(page(f'''
{banner(L('DEL 1: TREKANTEN','PART 1: THE TRIANGLE'))}
<p>{L('Husk: barn (voksen). Du hekler fastmasker fram og tilbake, og snur for hver rad.',
      'Remember: child (adult). You crochet single crochet back and forth, turning at each row.')}</p>
{steps([
  L('Start i spissen med rødt. Hekle <b>2 luftmasker</b>, og hekle <b>2 fastmasker</b> i den '
    'første luftmaska. Nå har du 2 masker. Denne spissen havner bak i nakken.',
    'Start at the point with red. Chain <b>2</b>, and crochet <b>2 single crochet</b> in the first '
    'chain. Now you have 2 stitches. This point ends up at the back of the neck.'),
  L('Snu med 1 luftmaske. Hekle 1 fm i hver maske tilbake.',
    'Turn with 1 chain. Crochet 1 sc in each stitch back.'),
  L('Nå øker du i begge ender. På hver rad: hekle 1 fm i første maske, <b>2 fm i neste</b> (økning), '
    'fm bortover til det er 1 maske igjen, <b>2 fm i den siste</b>. Snu med 1 luftmaske. '
    'Da blir det 2 masker mer for hver rad.',
    'Now you increase at both ends. On each row: crochet 1 sc in the first stitch, <b>2 sc in the '
    'next</b> (increase), sc across until 1 stitch remains, <b>2 sc in the last</b>. Turn with 1 '
    'chain. That gives 2 more stitches each row.'),
  L('Fortsett slik. Trekanten blir større og større. Hekle til den brede <b>forkanten</b> måler '
    '<b>34 (44) cm</b>. Det er kanten som skal ligge over pannen.',
    'Keep going like this. The triangle grows bigger and bigger. Crochet until the wide <b>front '
    'edge</b> measures <b>34 (44) cm</b>. That is the edge that lies over the forehead.'),
  L('Vil du ha flagg? Velg hvor det skal sitte. <b>Flagg foran:</b> hekle det inn på midten når det '
    'er ca. 5 cm igjen før den brede forkanten. Da havner flagget oppe over pannen. <b>Flagg bak:</b> '
    'hekle det inn på midten litt etter at du startet trekanten, mens den fortsatt er smal (ca. 13 '
    'til 16 masker bred). Da havner flagget nede mot spissen, som ligger bak i nakken. Følg '
    'flaggdiagrammet på side 10. Vil du ha det enkelt, hopper du over flagget.',
    'Want a flag? Choose where it goes. <b>Flag at the front:</b> crochet it in the middle when '
    'about 5 cm remain before the wide front edge. Then the flag ends up high, over the forehead. '
    '<b>Flag at the back:</b> crochet it in the middle a little after you started the triangle, '
    'while it is still narrow (about 13 to 16 stitches wide). Then the flag ends up down near the '
    'point, at the back of the neck. Follow the flag chart on page 10. If you want it simple, skip '
    'the flag.'),
  L('Fest tråden når forkanten er ferdig, eller la masken stå om du går rett videre til kanten.',
    'Fasten off when the front edge is done, or leave the loop if you go straight on to the edge.'),
])}
{cream('<p class="creamtitle">' + L('Mistet du en maske? Ta det med ro. Rekk opp noen masker og hekle '
       'igjen, eller be en voksen om hjelp. Ingenting er ødelagt.',
       'Dropped a stitch? Take it easy. Undo a few stitches and crochet again, or ask a grown-up '
       'for help. Nothing is ruined.') + '</p>')}
''', 7))

# ============ SIDE 8: DEL 2 BØLGEKANTEN ============
pages.append(page(f'''
{banner(L('DEL 2: BØLGEKANT RUNDT HELE','PART 2: WAVY EDGE ALL AROUND'))}
<p>{L('Nå lager du den bølgete kanten med flaggstriper <b>rundt hele skautet</b>. Bølgene kommer av '
      'at du hekler mange masker på lite plass.',
      'Now you make the wavy edge with flag stripes <b>around the whole kerchief</b>. The waves '
      'come from crocheting many stitches into a small space.')}</p>
{steps([
  L('Hekle fastmasker med rødt <b>rundt hele kanten</b>: langs den brede forkanten, ned den '
    'ene siden til spissen, og opp den andre siden tilbake. Hekle ca. 3 masker for hver 4 du '
    'går forbi. I spissen og i de to fremre hjørnene hekler du 3 fm i samme maske, så det ikke '
    'strammer. Avslutt omgangen med 1 kjedemaske i den første masken.',
    'Crochet single crochet in red <b>around the whole edge</b>: along the wide front edge, down '
    'one side to the point, and up the other side back. Crochet about 3 stitches for every 4 you '
    'pass. At the point and at the two front corners, crochet 3 sc in the same stitch so it does '
    'not pull tight. End the round with 1 slip stitch in the first stitch.'),
  L('Øk til <b>omtrent dobbelt så mange</b> masker: hekle 2 fm i annenhver maske hele veien rundt. '
    'Nå begynner kanten å bukte seg.',
    'Increase to <b>about twice as many</b> stitches: crochet 2 sc in every other stitch all the '
    'way around. Now the edge starts to ripple.'),
  L('Hekle striper: <b>1 omgang hvit, 1 omgang marineblå, 1 omgang hvit</b>. Bytt farge med en '
    'kjedemaske på slutten av hver omgang.',
    'Crochet stripes: <b>1 round white, 1 round navy blue, 1 round white</b>. Change colour with a '
    'slip stitch at the end of each round.'),
  L('Bølgeomgang med rødt: <b>3 fm i samme maske, hopp over 1 maske</b>, og gjenta hele veien rundt. '
    'Da bukter kanten seg fint.',
    'Wave round in red: <b>3 sc in the same stitch, skip 1 stitch</b>, and repeat all the way '
    'around. That makes the edge ripple nicely.'),
  L('Fest tråden godt. Hekle løst, så blir bølgene myke.',
    'Fasten off well. Crochet loosely, so the waves stay soft.'),
])}
{cream('<p class="creamtitle">' + L('ENKEL VARIANT (fin for de yngste, ca. 8 år):<br>'
       'Hopp over flagget i Del 1. Hekle bare den røde trekanten, og lag denne bølgekanten med '
       'stripene. Da trenger du aldri to farger på en gang, bare én farge om gangen. Like fint!',
       'SIMPLE VERSION (great for the youngest, about 8 years):<br>'
       'Skip the flag in Part 1. Crochet just the red triangle, and make this wavy edge with the '
       'stripes. Then you never need two colours at once, only one colour at a time. Just as '
       'lovely!') + '</p>')}
''', 8))

# ============ SIDE 9: DEL 3 SNORENE ============
pages.append(page(f'''
{banner(L('DEL 3: SNORENE TIL Å KNYTE MED','PART 3: THE TIES TO FASTEN WITH'))}
<p>{L('Snorene er lette å hekle. Du lager to like snorer av luftmasker, en til hvert fremre hjørne.',
      'The ties are easy to crochet. You make two matching ties of chains, one for each front '
      'corner.')}</p>
{tealp(L('SLIK LAGER DU EN SNOR','HOW TO MAKE A TIE'))}
{card(steps([
  L('Fest rødt garn i det ene <b>fremre hjørnet</b> (der forkanten møter siden).',
    'Attach red yarn in one <b>front corner</b> (where the front edge meets the side).'),
  L('Hekle en lang rekke <b>luftmasker</b> til snoren er <b>30 (35) cm</b>.',
    'Crochet a long row of <b>chains</b> until the tie is <b>30 (35) cm</b>.'),
  L('Vil du ha en fastere, rundere snor, hekler du 1 kjedemaske tilbake i hver luftmaske. Da blir '
    'snoren tykkere og fin.',
    'For a firmer, rounder tie, crochet 1 slip stitch back into each chain. That makes the tie '
    'thicker and nice.'),
  L('Fest tråden godt, og sy enden inn med stoppenålen.',
    'Fasten off well, and sew the end in with the tapestry needle.'),
]))}
{pink(L('SETT SNORENE PÅ','ATTACH THE TIES'))}
{card(ul([
  L('Lag <b>to snorer</b>, en i hvert fremre hjørne.','Make <b>two ties</b>, one in each front corner.'),
  L('Legg skautet på hodet: den brede forkanten over pannen, spissen ned bak i nakken.',
    'Put the kerchief on the head: the wide front edge over the forehead, the point down at the back of the neck.'),
  L('Før de to snorene bak og knyt dem sammen <b>bak, under spissen</b>.',
    'Bring the two ties round the back and tie them together <b>behind, under the point</b>.'),
  L('Vil du, kan du lage en liten dusk eller knute i enden av hver snor.',
    'If you like, make a little tassel or knot at the end of each tie.'),
]))}
''', 9))

# ============ SIDE 10: DIAGRAM FLAGGET ============
pages.append(page(f'''
{banner(L('DIAGRAM: FLAGGET','CHART: THE FLAG'))}
<p>{L('Flagget er valgfritt. Vil du ha det, hekler du det inn på midten av trekanten. En rute er en '
      'maske. Hvit rute: hekle med hvit. Blå rute: hekle med blå. Rød rute: hekle med rød. Les '
      'nedenfra og opp. Den blå streken i korset skal gå helt gjennom, uten brudd.',
      'The flag is optional. If you want it, you crochet it in the middle of the triangle. One '
      'square is one stitch. White square: crochet with white. Blue square: crochet with blue. Red '
      'square: crochet with red. Read from the bottom up. The blue line in the cross should run all '
      'the way through, unbroken.')}</p>
<p style="background:#fdf9e3;border:2px solid #df5f93;border-radius:12px;padding:2.5mm 5mm;font-weight:600;color:#3f3f3f;">{L('Diagrammet vises opp ned, fordi skautet begynner på spissen og hekles oppover. Hekle etter diagrammet slik det står her, så kommer flagget riktig vei på det ferdige skautet.','The chart is shown upside down, because the kerchief begins at the point and is worked upwards. Crochet from the chart as it appears here, and the flag will come out the right way on the finished kerchief.')}</p>
<div class="chartrow">
{chart_svg(flip180(FLAG), cell=26, numbers=True, title=L('FLAGGET, OPP NED (13 RUTER BREDT, 10 RUTER HØYT)','THE FLAG, UPSIDE DOWN (13 SQUARES WIDE, 10 SQUARES TALL)'))}
</div>
{pink(L('HVOR PÅ SKAUTET? VELG SELV','WHERE ON THE KERCHIEF? YOU CHOOSE'))}
{card(L('<p>Flagget skal alltid sitte midt mellom de to sidene. Du velger om det skal være foran '
        'eller bak:</p>',
        '<p>The flag always sits in the middle, between the two sides. You choose whether it goes '
        'at the front or the back:</p>') + ul([
  L('<b>Flagg foran (over pannen):</b> hekle flagget inn når det er ca. 5 cm igjen før den brede '
    'forkanten. Da er trekanten bred nok, og flagget havner høyt oppe.',
    '<b>Flag at the front (over the forehead):</b> crochet the flag in when about 5 cm remain '
    'before the wide front edge. Then the triangle is wide enough, and the flag sits high up.'),
  L('<b>Flagg bak (mot spissen):</b> hekle flagget inn tidlig, mens trekanten er ca. 13 til 16 '
    'masker bred. Da havner flagget nede ved spissen, som ligger bak i nakken.',
    '<b>Flag at the back (near the point):</b> crochet the flag in early, while the triangle is '
    'about 13 to 16 stitches wide. Then the flag sits down near the point, at the back of the neck.'),
  L('Uansett hvor: hekle rødt under, over og rundt flagget.',
    'Either way: crochet red below, above and around the flag.'),
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
  L('Kanten bølger','The edge ripples'),
  L('De to snorene sitter godt fast','The two ties are firmly attached'),
]))}
{cream('<p class="creamtitle">' + L('Gratulerer! Nå har du heklet ditt eget skaut.<br>'
       'Bruk det sammen med hatten, heia Norge!',
       'Congratulations! Now you have crocheted your very own kerchief.<br>'
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
title = L('Norge-skaut, LME hekleoppskrift', 'Norway kerchief, LME crochet pattern')
doc = f'''<!DOCTYPE html>
<html lang="{lang_attr}"><head><meta charset="utf-8">
<title>{title}</title>
<style>{css}</style></head>
<body>{''.join(pages)}</body></html>'''

outname = 'skaut_hekle_en.html' if LANG == 'en' else 'skaut_hekle.html'
(BASE / outname).write_text(doc, encoding='utf-8')
print('OK', LANG, len(doc), 'tegn ->', outname)
