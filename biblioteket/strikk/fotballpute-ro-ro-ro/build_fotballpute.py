# -*- coding: utf-8 -*-
"""Genererer LME-strikkeoppskrift (Fotballpute RO RO RO) som HTML klar for PDF-print."""
import base64, html, pathlib

BASE = pathlib.Path(__file__).parent
PHOTO = BASE / 'fotballpute_ref.jpg'

# ---------- farger ----------
TEAL   = '#2FA8AC'   # turkis hovedfarge
GREEN  = '#6FAE6A'   # grønn (tribuner, nett)
YELLOW = '#F5DE86'   # lysegul (RO-bordene)
WHITE  = '#FFFFFF'   # hvit (nett, prikker)
CREAM  = '#F8F4EA'
INK    = '#3f3f3f'
PINK   = '#df5f93'

# ---------- diagramdata ----------
# DEL 2: nederste RO-bord, lysegult RO på turkis (8 m bredt, 7 omg høyt)
RO_LOWER = [
    "TTTYYTTT",  # 7 (topp)
    "TYYTYTYT",  # 6
    "TYYTYTYT",  # 5
    "TTTYYTYT",  # 4
    "TYTYYTYT",  # 3
    "TYYTYTYT",  # 2
    "TYYTYTTT",  # 1 (bunn)
]
# DEL 5: øverste RO-bord, turkis RO på lysegult (8 m bredt, 7 omg høyt)
RO_UPPER = [
    "YYYTTYYY",  # 7
    "YTTYTYTY",  # 6
    "YTTYTYTY",  # 5
    "YYYTTYTY",  # 4
    "YTYTTYTY",  # 3
    "YTTYTYTY",  # 2
    "YTTYTYYY",  # 1
]
# DEL 3: fotballnettet, rapport 5 m bredt, 5 omg høyt
NET = [
    "WWWWW",  # 5
    "WGGGG",  # 4
    "WGGGG",  # 3
    "WGGGG",  # 2
    "WGGGG",  # 1
]
# DEL 4: grønne tribunetopper, rapport 10 m bredt, 5 omg høyt
STANDS = [
    "TTTTGGTTTT",  # 5
    "TTTGGGGTTT",  # 4
    "TTGGGGGGTT",  # 3
    "TGGGGGGGGT",  # 2
    "GGGGGGGGGG",  # 1 (bunn)
]

CMAP_RO = {'T': TEAL, 'Y': YELLOW}
CMAP_NET = {'W': WHITE, 'G': GREEN}
CMAP_STANDS = {'T': TEAL, 'G': GREEN}


def chart_svg(rows, cmap, cell=22, numbers=False, title=None):
    """Rutediagram som SVG. rows: liste med strenger, topp til bunn (høyest omgang først)."""
    w, h = len(rows[0]), len(rows)
    pad_b = 4
    pad_r = 30 if numbers else 4
    W, H = w * cell + 8 + pad_r, h * cell + 8 + pad_b
    p = [f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" '
         f'style="width:{W*0.28}mm;height:{H*0.28}mm">']
    for y, row in enumerate(rows):
        for x, ch in enumerate(row):
            fill = cmap[ch]
            p.append(f'<rect x="{4+x*cell}" y="{4+y*cell}" width="{cell}" height="{cell}" '
                     f'fill="{fill}" stroke="rgba(0,0,0,0.28)" stroke-width="1"/>')
            txt_col = '#2a2a2a' if fill in (WHITE, YELLOW) else '#ffffff'
            p.append(f'<text x="{4+x*cell+cell/2}" y="{4+y*cell+cell/2+4}" font-size="{cell*0.5}" '
                     f'text-anchor="middle" fill="{txt_col}" font-family="sans-serif" '
                     f'font-weight="bold">{ch}</text>')
    p.append(f'<rect x="4" y="4" width="{w*cell}" height="{h*cell}" fill="none" '
             f'stroke="#3f3f3f" stroke-width="2.5" rx="1"/>')
    if numbers:
        for y in range(h):
            n = h - y
            yy = 4 + y*cell + cell/2 + 4
            p.append(f'<text x="{4+w*cell+8}" y="{yy}" font-size="13" fill="#666" '
                     f'font-family="sans-serif">{n}</text>')
    p.append('</svg>')
    svg = ''.join(p)
    if title:
        return f'<div class="chartbox"><div class="chartttl">{html.escape(title)}</div>{svg}</div>'
    return f'<div class="chartbox">{svg}</div>'


# ---------- foto ----------
photo_b64 = base64.b64encode(PHOTO.read_bytes()).decode()
photo_src = f'data:image/jpeg;base64,{photo_b64}'

# ---------- byggeklosser ----------
def page(body, num, right_label='LME STRIKK'):
    return f'''<div class="page">
  <div class="band"><span>LITTLE MONTESSORI EXPLORERS</span></div>
  <div class="rside"><span>{right_label}</span></div>
  <div class="phead">
    <div class="ph1">LITTLE MONTESSORI EXPLORERS</div>
    <div class="ph2">LME STRIKKEOPPSKRIFT&nbsp;&nbsp;|&nbsp;&nbsp;FOTBALLPUTE RO RO RO</div>
  </div>
  <div class="content">{body}</div>
  <div class="pfoot">&mdash;&nbsp;{num}&nbsp;&mdash;</div>
</div>'''

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
    return f'<div class="notecard"><span class="noteemo">&#9917;</span><p><i>TIPS: {text}</i></p></div>'

pages = []

# ============ SIDE 1: FORSIDE ============
pages.append(page(f'''
<div class="coverimg"><img src="{photo_src}" alt="Turkis fotballpute med RO RO RO, fotballnett og grønne tribuner"></div>
<div class="covertag">LME STRIKKEOPPSKRIFT</div>
<div class="coverbanner">
  <span class="cball">&#9917;</span>
  <h1 class="covertitle">FOTBALLPUTE<br>RO RO RO</h1>
  <span class="cball">&#9917;</span>
</div>
<div class="subpill">TURKIS MED FOTBALLNETT OG GRØNNE TRIBUNER</div>
{card('<p class="center">En myk supporterpute med fotballnett, grønne tribuner og &laquo;RO RO RO&raquo; strikket '
      'rundt hele puten. Mønsteret går rundt, slik at begge sider blir like.</p>')}
<div class="byline">
  <div class="by1">Av Renate Dahl</div>
  <div class="by2">Little Montessori Explorers</div>
  <div class="by3">lmexplorers.com</div>
</div>
<p class="rekonstruert">Rekonstruert etter originalpute strikket av Renates mamma</p>
{tip('Les hele oppskriften før du begynner. Strikk en prøvelapp, særlig når du bytter garn, '
     'fordi bomull og akryl kan oppføre seg ulikt.')}
''', 1))

# ============ SIDE 2: FØR DU BEGYNNER ============
pages.append(page(f'''
{banner('FØR DU BEGYNNER')}
<p>Putetrekket strikkes rundt på rundpinne, nedenfra og opp. Først strikker du et ensfarget
innbrett på ca. 12 cm. Deretter kommer nederste RO-bord, fotballnettet, de grønne
tribunetoppene og det øverste RO-bordet. Mønsteret går rundt hele puten, slik at begge sider
blir like.</p>
{tealp('DETTE LÆRER DU')}
{card(ul([
  'Å strikke et putetrekk rundt på rundpinne',
  'Å kombinere bomull og akryl med samme tykkelse',
  'Å følge enkle fargediagrammer',
  'Å strikke vertikale og vannrette linjer som danner et fotballnett',
  'Å lage en praktisk puteråpning med innbrett',
]))}
{pink('HVOR VANSKELIG ER DET?')}
{card('<p>Litt øvet. Du bør kunne legge opp, strikke glattstrikk rundt, bytte farge og følge et '
      'diagram. De lange partiene i nettet krever at flottene holdes løse.</p>')}
{pink('OM REKONSTRUKSJONEN')}
{card('<p>Originalmønsteret ble til underveis mens puten ble strikket. Oppskriften er derfor '
      'rekonstruert fra den ferdige puten og opplysningene fra den som strikket den. Mål alltid '
      'underveis og tilpass høyden til innerputen.</p>')}
{cream('<p class="creamtitle">Sett en markør ved omgangens begynnelse og en ny markør etter 80 masker. '
       'Da ser du tydelig hvor hver puteside begynner.</p>')}
''', 2))

# ============ SIDE 3: DETTE TRENGER DU ============
pages.append(page(f'''
{banner('DETTE TRENGER DU')}
{tealp('GARN')}
{card('<p><b>Reynolds Saucy</b>, 100 % mercerisert bomull. Amerikansk garn produsert i Brasil. '
      'Originalgarnets banderole anbefaler pinne 5 mm. Originalputen er strikket på 4,5 mm fordi '
      'strikkeren strikker litt løst.</p>'
      '<table class="t"><tr><th>Farge</th><th>Bruk</th></tr>'
      f'<tr><td><span class="dot" style="background:{TEAL}"></span> Turkis</td><td>hovedfarge</td></tr>'
      f'<tr><td><span class="dot" style="background:{GREEN}"></span> Grønn</td><td>tribuner og fotballnett</td></tr>'
      f'<tr><td><span class="dot" style="background:{YELLOW}"></span> Lysegul</td><td>RO-bordene</td></tr></table>'
      '<p><b>Holly fra Rusta</b>, 100 % akryl, 50 g, i hvitt. Garnet er mykt, nuppefritt og omtrent '
      'like tykt som Saucy. Det brukes til fotballnettet og de små hvite prikkene.</p>'
      '<p class="small">Garnmengden fra originalarbeidet ble ikke notert. Ha rikelig av turkis '
      'hovedfarge og minst ett nøste av hver mønsterfarge. Ved salg av garnpakker må forbruket '
      'kontrollstrikkes og veies først.</p>')}
{pink('ALTERNATIVT GARN')}
{card('<p>Bruk et glatt bomulls- eller akrylgarn som gir samme strikkefasthet. Velg gjerne et garn '
      'beregnet for pinne 4,5&ndash;5 mm. Alle fargene bør være omtrent like tykke.</p>')}
{tealp('PINNER OG UTSTYR')}
{card(ul([
  'Rundpinne 4,5 mm, 80 cm',
  'Stoppenål, saks og målebånd',
  'To maskemarkører',
  'Innerpute 45 &times; 45 cm',
  'Valgfritt: 2&ndash;3 trykknapper eller garn til heklede knyteband',
  'Valgfritt: ferdig fotballmerke',
]))}
{cream('<p class="creamtitle">Garnet anbefaler pinne 5, men pinne 4,5 mm ga riktig uttrykk i '
       'originalen. Strikker du fast, kan 5 mm passe bedre.</p>')}
''', 3))

# ============ SIDE 4: STRIKKEFASTHET OG MÅL ============
pages.append(page(f'''
{banner('STRIKKEFASTHET OG MÅL')}
{tealp('STRIKKEFASTHET, DEN VIKTIGE NØKKELEN')}
{card('<p>Ca. 18 masker = 10 cm i glattstrikk rundt. Med 80 masker på hver side blir putetrekket '
      'ca. 44&ndash;45 cm bredt.</p>'
      '<p>Strikk en prøvelapp som er minst 12 &times; 12 cm. Vask og tørk den slik du vil behandle '
      'putetrekket. Mål deretter midt på lappen.</p>'
      + ul([
          'Flere enn 18 masker på 10 cm: prøv pinne 5 mm.',
          'Færre enn 18 masker på 10 cm: prøv pinne 4 mm.',
          'Ca. 18 masker: bruk pinne 4,5 mm og sett i gang.',
      ]))}
{card('<table class="t"><tr><th>Mål</th><th>Verdi</th></tr>'
  '<tr><td>Innerpute</td><td>45 &times; 45 cm</td></tr>'
  '<tr><td>Bredde, hver side</td><td>ca. 44&ndash;45 cm</td></tr>'
  '<tr><td>Synlig høyde</td><td>ca. 45 cm</td></tr>'
  '<tr><td>Innvendig innbrett</td><td>ca. 12 cm</td></tr>'
  '<tr><td>Masker rundt</td><td>160 m = 80 m per side</td></tr></table>')}
{cream('<p class="creamtitle">Mål høyden mens trekket ligger flatt. Stopp når den synlige delen fra '
       'brettekanten til toppen er 45 cm.</p>')}
''', 4))

# ============ SIDE 5: ORDLISTE OG OPPBYGGING ============
pages.append(page(f'''
{banner('ORDLISTE OG OPPBYGGING')}
{card('<table class="t tl"><tr><th>Ord</th><th>Betyr</th></tr>'
      '<tr><td><b>m</b></td><td>maske</td></tr>'
      '<tr><td><b>omg</b></td><td>omgang, &eacute;n hel runde</td></tr>'
      '<tr><td><b>r</b></td><td>rett</td></tr>'
      '<tr><td><b>vr</b></td><td>vrang</td></tr>'
      '<tr><td><b>HF</b></td><td>turkis hovedfarge</td></tr>'
      '<tr><td><b>flott</b></td><td>tr&aring;den som l&oslash;per p&aring; baksiden n&aring;r fargen ikke brukes</td></tr>'
      '<tr><td><b>rapport</b></td><td>maskene eller omgangene som gjentas</td></tr></table>')}
{pink('SLIK ER PUTEN BYGGET OPP')}
{card(steps([
  '12 cm ensfarget innbrett til puteråpningen',
  'Nederste turkise felt med lysegule RO-motiver',
  'Grønt fotballnett med hvite ruter',
  'Grønne tribunetopper mot turkis bakgrunn',
  'Øverste lysegule bord med turkise RO-motiver',
  'Turkis topp som felles eller sys sammen',
]))}
''', 5))

# ============ SIDE 6: DEL 1 INNBRETT OG NEDERKANT ============
pages.append(page(f'''
{banner('DEL 1: INNBRETT OG NEDERKANT')}
{steps([
  'Legg opp 160 masker med turkis på rundpinne 4,5 mm.',
  'Kontroller at oppleggskanten ikke er vridd. Sett sammen til en ring og plasser en markør '
  'ved omgangens begynnelse.',
  'Strikk 80 masker, og sett en markør til. Nå er arbeidet delt i to like sider med 80 masker '
  'på hver.',
  'Strikk glattstrikk rundt med turkis til arbeidet måler ca. 12 cm. Dette blir innbretten '
  'på innsiden av putetrekket.',
  'Strikk 1 omgang vrang som brettekant. Herfra måles den synlige putedelen.',
  'Strikk 2 omganger rett med turkis.',
])}
{pink('ÅPNINGEN NEDERST')}
{card('<p>Når puten er ferdig, brettes de 12 ensfargede centimeterne inn. Fest innbretten med '
      'noen sting i hver side. Du kan i tillegg sy i trykknapper eller hekle knyteb&aring;nd.</p>')}
{cream('<p class="creamtitle">Ikke sy igjen hele nederkanten. Trekket skal kunne tas av og '
       'brukes som et vanlig putevar.</p>')}
''', 6))

# ============ SIDE 7: DEL 2 NEDERSTE RO-BORD ============
pages.append(page(f'''
{banner('DEL 2: NEDERSTE RO-BORD')}
<p>Bokstavene strikkes med lysegult p&aring; turkis bakgrunn. Hvert RO-motiv er 8 masker bredt
og 7 omganger h&oslash;yt.</p>
{tealp('PLASSERING PÅ HVER SIDE')}
{card('<p>10 turkise m &ndash; RO &ndash; 5 turkise m &ndash; RO &ndash; 5 turkise m &ndash; RO '
      '&ndash; 5 turkise m &ndash; RO &ndash; 5 turkise m &ndash; RO &ndash; 10 turkise m</p>'
      '<p>Dette blir n&oslash;yaktig 80 masker. Gjenta samme plassering p&aring; den andre siden.</p>')}
{tealp('DIAGRAM: LYSEGULT RO PÅ TURKIS')}
<div class="chartrow">{chart_svg(RO_LOWER, CMAP_RO, cell=26, numbers=True)}</div>
<p>Les diagrammet nedenfra og opp. Fordi du strikker rundt, leses hver omgang fra h&oslash;yre
mot venstre.</p>
{pink('ETTER BORDEN')}
{card('<p>Strikk 1 omgang turkis, 1 omgang vekselvis 1 lysegul og 1 turkis maske, deretter turkis '
      'til feltet over bokstavene m&aring;ler ca. 7&ndash;8 cm.</p>')}
{cream('<p class="creamtitle">Fang flottene dersom de blir lengre enn fem masker. Hold dem l&oslash;se, '
       'ellers trekker puten seg sammen.</p>')}
''', 7))

# ============ SIDE 8: DEL 3 FOTBALLNETTET ============
pages.append(page(f'''
{banner('DEL 3: FOTBALLNETTET')}
<p>Bytt til gr&oslash;nt. Strikk 2 omganger gr&oslash;nt, deretter 1 omgang hvitt og 1 omgang gr&oslash;nt.</p>
{tealp('NETTRAPPORT')}
{card('<p>Rapporten er 5 masker bred og 5 omganger h&oslash;y. Gjenta rapporten 32 ganger rundt og '
      '6 ganger i h&oslash;yden.</p>')}
<div class="chartrow">{chart_svg(NET, CMAP_NET, cell=30, numbers=True)}</div>
<p>P&aring; de fire nederste omgangene i hver rapport strikkes 1 hvit, 4 gr&oslash;nne rundt. P&aring;
den femte omgangen strikkes alle maskene hvite. Dette danner &eacute;n vannrett nettlinje.</p>
<p>Gjenta disse fem omgangene seks ganger, eller til nettfeltet m&aring;ler omtrent 13&ndash;14 cm.</p>
<p>Avslutt med 1 omgang 1 hvit/4 gr&oslash;nne, 1 omgang hvit og 2 omganger gr&oslash;nt.</p>
{cream('<p class="creamtitle">De hvite, loddrette maskene ligger rett over hverandre. Tell fra '
       'omgangens begynnelse, s&aring; forskyves ikke nettet.</p>')}
''', 8))

# ============ SIDE 9: DEL 4 TRIBUNER OG PRIKKBORD ============
pages.append(page(f'''
{banner('DEL 4: TRIBUNER OG PRIKKBORD')}
<p>Over nettet strikkes gr&oslash;nne topper mot turkis bakgrunn. Rapporten g&aring;r over 10
masker og gjentas 16 ganger rundt.</p>
{tealp('DIAGRAM: GRØNNE TOPPER')}
<div class="chartrow">{chart_svg(STANDS, CMAP_STANDS, cell=26, numbers=True)}</div>
<p>Strikk diagrammet nedenfra og opp. For &aring; f&aring; det h&aring;ndlagde, ujevne uttrykket fra
originalputa kan annenhver topp strikkes &eacute;n omgang h&oslash;yere.</p>
{pink('FORTSETT MED TURKIS')}
{card('<p>Strikk 8&ndash;10 omganger turkis. Strikk deretter en prikkbord: 1 hvit maske, 3 turkise '
      'masker rundt. Strikk videre 5&ndash;6 omganger turkis.</p>'
      '<p>Legg arbeidet flatt og kontroller h&oslash;yden f&oslash;r du starter &oslash;verste RO-bord.</p>')}
''', 9))

# ============ SIDE 10: DEL 5 ØVERSTE RO-BORD ============
pages.append(page(f'''
{banner('DEL 5: ØVERSTE RO-BORD')}
<p>N&aring; byttes fargene: Bokstavene strikkes med turkis p&aring; lysegul bakgrunn.</p>
{tealp('PLASSERING PÅ HVER SIDE')}
{card('<p>10 lysegule m &ndash; RO &ndash; 5 lysegule m &ndash; RO &ndash; 5 lysegule m &ndash; RO '
      '&ndash; 5 lysegule m &ndash; RO &ndash; 5 lysegule m &ndash; RO &ndash; 10 lysegule m</p>'
      '<p>Gjenta samme plassering p&aring; side nummer to.</p>')}
{tealp('DIAGRAM: TURKIS RO PÅ LYSEGULT')}
<div class="chartrow">{chart_svg(RO_UPPER, CMAP_RO, cell=26, numbers=True)}</div>
<p>Etter diagrammet strikkes 2 omganger lysegult, 2 omganger turkis og 1 prikkbord med 1 lysegul
og 3 turkise masker rundt.</p>
<p>Fortsett med turkis til den synlige delen, m&aring;lt fra vrangomgangen ved brettekanten, er
ca. 45 cm.</p>
''', 10))

# ============ SIDE 11: DEL 6 AVSLUTNING OG MONTERING ============
pages.append(page(f'''
{banner('DEL 6: AVSLUTNING OG MONTERING')}
{steps([
  'Fell l&oslash;st av alle 160 maskene. La det v&aelig;re igjen en lang tr&aring;d til sammensying.',
  'Legg trekket flatt med markørene i hver side. Kontroller at 80 masker ligger p&aring; '
  'forsiden og 80 p&aring; baksiden.',
  'Sy sammen toppen med madrassting. Du kan ogs&aring; maske sammen toppen dersom maskene '
  'st&aring;r &aring;pne p&aring; pinnene.',
  'Fest alle l&oslash;se tr&aring;der p&aring; innsiden. Kontroller at flottene ligger l&oslash;st '
  'og ikke trekker m&oslash;nsteret sammen.',
  'Brett den ensfargede delen p&aring; ca. 12 cm inn i putetrekket.',
  'Sett inn innerputen. Fest innbretten med noen sting i hver side, slik at puten holdes p&aring; plass.',
])}
{pink('VALGFRI LUKKING')}
{card('<p>Sy i 2&ndash;3 trykknapper nederst, eller hekle 2&ndash;3 par knyteb&aring;nd og sy dem '
      'fast p&aring; innsiden av &aring;pningen.</p>')}
{pink('VALGFRITT MERKE')}
{card('<p>Originalputa har et ferdig fotballmerke med norsk flagg sydd p&aring; den ene siden. '
      'Merket er dekorasjon og inng&aring;r ikke i selve strikkem&oslash;nsteret.</p>')}
''', 11))

# ============ SIDE 12: STELL OG SISTE SJEKK ============
pages.append(page(f'''
{banner('STELL OG SISTE SJEKK')}
{tealp('STELL')}
{card('<p>Fordi puten kombinerer mercerisert bomull og akryl, b&oslash;r den vaskes etter det mest '
      'sk&aring;nsomme garnets anbefaling. Vask trekket separat p&aring; sk&aring;nsomt program, '
      'gjerne 30 &deg;C. Bruk vaskepose. Ikke bruk t&oslash;rketrommel. Form trekket og la det '
      't&oslash;rke flatt.</p>')}
{pink('SJEKKLISTE')}
{card(check([
  'Trekket m&aring;ler ca. 45 &times; 45 cm uten innbretten',
  'M&oslash;nsteret g&aring;r rundt hele puten og er likt p&aring; begge sider',
  'Det er fem RO-motiver p&aring; hver side i begge border',
  'Fotballnettet har rette, hvite linjer',
  'Flottene ligger l&oslash;st p&aring; innsiden',
  'Toppen er pent sydd eller masket sammen',
  'Innbretten er festet i sidene og &aring;pningen fungerer',
]))}
{cream('<p class="creamtitle">Før oppskriften legges ut for salg, anbefales én kontrollstrikk av '
       'diagrammene og veiing av garnforbruket. Da kan eksakte garnmengder føres inn i neste '
       'utgave.</p>')}
<div class="congrats">Gratulerer, du har strikket din egen fotballpute!</div>
<div class="byline">
  <div class="by1">Renate Dahl</div>
  <div class="by2">Little Montessori Explorers</div>
  <div class="by3">lmexplorers.com</div>
</div>
<p class="copyright">&copy; 2026 Little Montessori Explorers. Oppskriften er kun til personlig
bruk. Oppskriften og diagrammene kan ikke kopieres, deles, videreselges eller publiseres.
Ferdige produkter kan selges i liten skala med kreditering til Little Montessori Explorers.</p>
''', 12))

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
    linear-gradient(165deg,#d8eeee 0%,#eaf3e2 45%,#fbf3d9 100%);
}}
.band {{ position:absolute; left:0; top:0; bottom:0; width:11mm;
  background:linear-gradient(180deg,{TEAL},{GREEN}); }}
.band span {{ position:absolute; left:50%; top:75%; transform:translate(-50%,-50%);
  writing-mode:vertical-rl; text-orientation:mixed; rotate:180deg;
  font-family:var(--font-head); font-size:6.5pt; letter-spacing:3.5px; color:#fff; white-space:nowrap; }}
.rside {{ position:absolute; right:2.5mm; top:40%; }}
.rside span {{ writing-mode:vertical-rl; font-family:var(--font-head); font-size:6pt;
  letter-spacing:2.5px; color:#9a9a9a; white-space:nowrap; }}
.phead {{ text-align:center; padding-top:9mm; }}
.ph1 {{ font-family:var(--font-head); font-weight:600; font-size:7pt; letter-spacing:4px; color:#7f96a8; }}
.ph2 {{ font-family:var(--font-head); font-weight:600; font-size:6.3pt; letter-spacing:2.6px; color:{PINK}; margin-top:1.6mm; }}
.content {{ padding:5mm 16mm 0 20mm; }}
.pfoot {{ position:absolute; bottom:6.5mm; left:0; right:0; text-align:center;
  font-family:var(--font-head); font-weight:700; font-size:10pt; color:#8a8a8a; }}

.banner {{ background:#f5efb2; border-radius:14px; padding:3.6mm 6mm; margin:2mm 0 4.5mm; text-align:center; }}
.banner h1 {{ font-family:var(--font-head); font-weight:800; font-size:16.5pt; color:{INK};
  letter-spacing:.4px; text-transform:uppercase; }}
.pillwrap {{ text-align:center; margin:4.5mm 0 3mm; }}
.pill {{ display:inline-block; border-radius:999px; padding:2.4mm 9mm;
  font-family:var(--font-head); font-weight:700; font-size:10.5pt; color:#fff;
  letter-spacing:.4px; text-transform:uppercase; }}
.pinkpill {{ background:{PINK}; }}
.tealpill {{ background:{TEAL}; }}
.card {{ background:rgba(255,255,255,.93); border:2px solid #cdeceb; border-radius:16px;
  padding:4mm 6mm; margin:0 0 4mm; }}
.cream {{ background:{CREAM}; border:2px solid #cdeceb; border-radius:16px;
  padding:4mm 6mm; margin:4mm 0; text-align:center; }}
.creamtitle {{ font-family:var(--font-head); font-weight:700; font-size:11pt; color:{GREEN}; }}
p {{ font-size:10.8pt; line-height:1.53; margin-bottom:2.2mm; }}
p.small, .small {{ font-size:9.5pt; color:#777; }}
p.center {{ text-align:center; }}
ul.dots {{ list-style:none; }}
ul.dots li {{ font-size:10.8pt; line-height:1.48; padding-left:5.5mm; position:relative; margin:1.6mm 0; }}
ul.dots li::before {{ content:'•'; position:absolute; left:1mm; color:{PINK}; font-weight:bold; }}
ul.checks {{ list-style:none; }}
ul.checks li {{ font-size:10.8pt; line-height:1.48; padding-left:7mm; position:relative; margin:1.8mm 0; }}
ul.checks li::before {{ content:'\\2610'; position:absolute; left:0; color:{TEAL}; font-size:12pt; }}
ol.steps {{ list-style:none; }}
ol.steps li {{ display:flex; gap:3.5mm; align-items:flex-start; background:rgba(255,255,255,.93);
  border:2px solid #cdeceb; border-radius:14px; padding:3mm 5mm; margin-bottom:2.4mm; }}
ol.steps li div {{ font-size:10.4pt; line-height:1.46; }}
.snum {{ flex:0 0 auto; width:7.5mm; height:7.5mm; border-radius:50%; background:{PINK}; color:#fff;
  font-family:var(--font-head); font-weight:700; font-size:11pt; display:flex;
  align-items:center; justify-content:center; margin-top:.5mm; }}
table.t {{ width:100%; border-collapse:collapse; margin:2.5mm 0; }}
table.t th {{ font-family:var(--font-head); font-weight:700; font-size:9.3pt; color:{PINK};
  text-align:left; padding:1.5mm 2.5mm; border-bottom:2px solid #cdeceb; }}
table.t td {{ font-size:9.7pt; padding:1.4mm 2.5mm; border-bottom:1px solid #e4f3f2; line-height:1.38; }}
table.tl td:first-child {{ white-space:nowrap; }}
.dot {{ display:inline-block; width:3.5mm; height:3.5mm; border-radius:50%; vertical-align:-0.5mm;
  margin-right:1.5mm; border:1px solid rgba(0,0,0,.15); }}

.coverimg {{ text-align:center; margin:3mm 0 3mm; }}
.coverimg img {{ width:96mm; border-radius:14px; border:3mm solid #fff; }}
.covertag {{ text-align:center; font-family:var(--font-head); font-size:8pt; letter-spacing:2.6px;
  color:#8a8a8a; margin:1mm 0 2.5mm; }}
.coverbanner {{ display:flex; align-items:center; justify-content:center; gap:5mm;
  background:#f5efb2; border-radius:16px; padding:3mm 6mm; }}
.covertitle {{ font-family:var(--font-head); font-weight:800; font-size:21pt; color:{INK};
  letter-spacing:.5px; text-align:center; line-height:1.25; }}
.cball {{ font-size:22pt; line-height:1; }}
.subpill {{ margin:3.6mm auto; width:fit-content; background:#fdf9e3; border:2.5px solid {INK};
  border-radius:999px; padding:1.8mm 8mm; font-family:var(--font-head); font-weight:700;
  font-size:9.5pt; color:{INK}; letter-spacing:.4px; text-align:center; }}
.byline {{ text-align:center; margin-top:3.5mm; }}
.by1 {{ font-family:var(--font-head); font-weight:700; font-size:12.5pt; color:{GREEN}; }}
.by2 {{ font-size:10.2pt; color:#8a8a8a; margin-top:.8mm; }}
.by3 {{ font-family:var(--font-head); font-weight:600; font-size:9.6pt; color:{PINK}; margin-top:.5mm; }}
.rekonstruert {{ text-align:center; font-size:9pt; color:#9a9a9a; font-style:italic; margin-top:1.5mm; }}
.notecard {{ display:flex; gap:4mm; align-items:center; background:rgba(255,255,255,.8);
  border-radius:12px; padding:3.2mm 6mm; margin-top:4mm; }}
.notecard p {{ font-size:9.3pt; color:#777; margin:0; }}
.noteemo {{ font-size:16pt; }}

.chartrow {{ display:flex; gap:6mm; justify-content:center; align-items:flex-end;
  flex-wrap:wrap; margin:2.5mm 0 4mm; }}
.chartbox {{ text-align:center; }}
.chartttl {{ font-family:var(--font-head); font-weight:700; font-size:9pt; color:{PINK};
  margin-bottom:1.5mm; letter-spacing:.3px; }}
.congrats {{ font-family:var(--font-head); font-weight:800; font-size:15pt; color:{INK};
  text-align:center; margin:5mm 0 2mm; }}
.copyright {{ font-size:8pt; color:#9a9a9a; text-align:center; margin-top:6mm; line-height:1.5; }}
'''

doc = f'''<!DOCTYPE html>
<html lang="no"><head><meta charset="utf-8">
<title>Fotballpute RO RO RO, LME strikkeoppskrift</title>
<style>{css}</style></head>
<body>{''.join(pages)}</body></html>'''

(BASE / 'fotballpute_ro.html').write_text(doc, encoding='utf-8')
print('OK', len(doc), 'tegn')
