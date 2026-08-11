# -*- coding: utf-8 -*-
"""Genererer LME-strikkeoppskrift (Fotballpute RO RO RO) som HTML klar for PDF-print."""
import base64, html, pathlib

BASE = pathlib.Path(__file__).parent
PHOTO = BASE / 'fotballpute_alt_wnr.jpg'
ORIG_PHOTO = BASE / 'fotballpute_ref.jpg'
LOGO = BASE / 'lme-logo.png'
ALT_RWB = BASE / 'fotballpute_alt_rwb.jpg'
ALT_BWR = BASE / 'fotballpute_alt_bwr.jpg'

# ---------- farger ----------
# TEAL/PINK/CERISE er LMEs faste designfarger (bannere, pills, logosignatur) og skal ALDRI
# endres etter garnfargen i selve oppskriften, de er faste uansett hvilket fargevalg puten vises i.
TEAL   = '#4aa7a4'   # LME-merkefarge, kun til design (pills/kort), ikke garnfarge
CREAM  = '#F8F4EA'
INK    = '#3f3f3f'
PINK   = '#df5f93'
CERISE = '#E91E89'   # LME sin faste merkefarge, brukes til logosignaturen nederst

# Garnfargene i selve oppskriften: hvit/marineblå/rød, som på forsidebildet (Renates mammas
# original). WHITE er nettets/prikkbordets kontrastfarge, samme i alle fargekombinasjoner.
YARN_WHITE = '#FBF9F3'   # hvit hovedfarge
YARN_NAVY  = '#1E3A6E'   # marineblå: RO-bokstavene og fotballnettet
YARN_RED   = '#C8172B'   # rød: tribunetoppene og prikkbord/border
WHITE      = '#FFFFFF'   # nøytral kontrastfarge (nettlinjer, prikker)

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

CMAP_RO = {'T': YARN_WHITE, 'Y': YARN_NAVY}
# RO_UPPERs rutedata er speilvendt av RO_LOWER (samme knep som ga fargebytte i turkisversjonen).
# I hvit/marineblå/rødt skal begge RO-bordene se like ut (marineblå bokstaver på hvitt), så
# CMAP_RO_UPPER er byttet om for å oppheve speilingen i selve dataene.
CMAP_RO_UPPER = {'T': YARN_NAVY, 'Y': YARN_WHITE}
CMAP_NET = {'W': WHITE, 'G': YARN_NAVY}
CMAP_STANDS = {'T': YARN_WHITE, 'G': YARN_RED}


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
            txt_col = '#2a2a2a' if fill in (WHITE, YARN_WHITE) else '#ffffff'
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
orig_photo_src = f'data:image/jpeg;base64,{base64.b64encode(ORIG_PHOTO.read_bytes()).decode()}'
logo_b64 = base64.b64encode(LOGO.read_bytes()).decode()
logo_src = f'data:image/png;base64,{logo_b64}'
alt_rwb_src = f'data:image/jpeg;base64,{base64.b64encode(ALT_RWB.read_bytes()).decode()}'
alt_bwr_src = f'data:image/jpeg;base64,{base64.b64encode(ALT_BWR.read_bytes()).decode()}'

# ---------- byggeklosser ----------
def make_page(ph2, right_label='LME STRIKK'):
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

page = make_page('LME STRIKKEOPPSKRIFT&nbsp;&nbsp;|&nbsp;&nbsp;FOTBALLPUTE RO RO RO', 'LME STRIKK')

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
def byline(name_line, company='Little Montessori Explorers', site='lmexplorers.com'):
    return f'''<div class="byline">
  <img class="logo" src="{logo_src}" alt="Little Montessori Explorers">
  <div class="by1">{name_line}</div>
  <div class="by2">{company}</div>
  <div class="by3">{site}</div>
</div>'''

pages = []

# ============ SIDE 1: FORSIDE ============
pages.append(page(f'''
<div class="coverimg"><img src="{photo_src}" alt="Fotballpute RO RO RO i hvitt, marineblått og rødt"></div>
<div class="covertag">LME STRIKKEOPPSKRIFT</div>
<div class="coverbanner">
  <span class="cball">&#9917;</span>
  <h1 class="covertitle">FOTBALLPUTE<br>RO RO RO</h1>
  <span class="cball">&#9917;</span>
</div>
<div class="subpill">FOTBALLNETT, TRIBUNER OG RO RO RO</div>
{card('<p class="center">En myk supporterpute med fotballnett, tribuner og &laquo;RO RO RO&raquo; strikket '
      'rundt hele puten. Mønsteret går rundt, slik at begge sider blir like. Oppskriften under er '
      'skrevet for hvitt, marineblått og rødt, som på originalputa. Se side 3 for andre '
      'fargekombinasjoner, blant annet turkis.</p>')}
{byline('Av Renate Dahl')}
<p class="rekonstruert">Rekonstruert etter originalpute strikket av Renates mamma</p>
{tip('Les hele oppskriften før du begynner. Strikk en prøvelapp, særlig når du bytter garn, '
     'fordi bomull og akryl kan oppføre seg ulikt.')}
''', 1))

# ============ SIDE 2: FØR DU BEGYNNER ============
pages.append(page(f'''
{banner('FØR DU BEGYNNER')}
<p>Putetrekket strikkes rundt på rundpinne, nedenfra og opp. Først strikker du et ensfarget
innbrett på ca. 12 cm. Deretter kommer nederste RO-bord, fotballnettet, de røde
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
{cream('<p class="creamtitle">Sett en markør ved omgangens begynnelse og en ny markør etter 80 masker. '
       'Da ser du tydelig hvor hver puteside begynner.</p>')}
''', 2))

# ============ SIDE 3: OM REKONSTRUKSJONEN OG FARGER ============
pages.append(page(f'''
{banner('OM REKONSTRUKSJONEN OG FARGER')}
{pink('OM REKONSTRUKSJONEN')}
{card('<p>Originalmønsteret ble til underveis mens puten ble strikket. Oppskriften er derfor '
      'rekonstruert fra den ferdige puten og opplysningene fra den som strikket den. Mål alltid '
      'underveis og tilpass høyden til innerputen.</p>')}
{tealp('ANDRE FARGEKOMBINASJONER')}
<div class="colorrow">
  <img src="{orig_photo_src}" alt="Fotballpute i turkis, gult og grønt">
  <img src="{alt_rwb_src}" alt="Fotballpute i rødt, hvitt og blått">
  <img src="{alt_bwr_src}" alt="Fotballpute i blått, rødt og hvitt">
</div>
<p class="colorcap">Forsiden viser puten i hvitt, marineblått og rødt, fargene oppskriften under er
skrevet for. Mønsteret fungerer like fint i turkis, gult og grønt (originalens aller første
fargevalg) eller andre kombinasjoner, for eksempel rødt, hvitt og blått som de norske
flaggfargene.</p>
''', 3))

# ============ SIDE 4: DETTE TRENGER DU ============
pages.append(page(f'''
{banner('DETTE TRENGER DU')}
{tealp('GARN')}
{card('<p><b>Reynolds Saucy</b>, 100 % mercerisert bomull. Amerikansk garn produsert i Brasil. '
      'Originalgarnets banderole anbefaler pinne 5 mm. Originalputen er strikket på 4,5 mm fordi '
      'strikkeren strikker litt løst.</p>'
      '<table class="t"><tr><th>Farge</th><th>Bruk</th></tr>'
      f'<tr><td><span class="dot" style="background:{YARN_WHITE}"></span> Hvit</td><td>hovedfarge</td></tr>'
      f'<tr><td><span class="dot" style="background:{YARN_NAVY}"></span> Marineblå</td><td>RO-bokstavene og fotballnettet</td></tr>'
      f'<tr><td><span class="dot" style="background:{YARN_RED}"></span> Rød</td><td>tribunetoppene og prikkbord</td></tr></table>'
      '<p><b>Holly fra Rusta</b>, 100 % akryl, 50 g. Mykt, nuppefritt garn, omtrent like tykt som '
      'Saucy. Fint å bruke til en av mønsterfargene hvis du vil blande inn litt akryl.</p>'
      '<p class="small">Garnmengden fra originalarbeidet ble ikke notert. Ha rikelig av hvit '
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
  'Valgfritt, til lukkingen: trykknapper, bånd (kjøpt eller heklet), eller bare tråd og nål',
  'Valgfritt: ferdig fotballmerke',
]))}
{cream('<p class="creamtitle">Garnet anbefaler pinne 5, men pinne 4,5 mm ga riktig uttrykk i '
       'originalen. Strikker du fast, kan 5 mm passe bedre.</p>')}
''', 4))

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
''', 5))

# ============ SIDE 5: ORDLISTE OG OPPBYGGING ============
pages.append(page(f'''
{banner('ORDLISTE OG OPPBYGGING')}
{card('<table class="t tl"><tr><th>Ord</th><th>Betyr</th></tr>'
      '<tr><td><b>m</b></td><td>maske</td></tr>'
      '<tr><td><b>omg</b></td><td>omgang, &eacute;n hel runde</td></tr>'
      '<tr><td><b>r</b></td><td>rett</td></tr>'
      '<tr><td><b>vr</b></td><td>vrang</td></tr>'
      '<tr><td><b>HF</b></td><td>hvit hovedfarge</td></tr>'
      '<tr><td><b>flott</b></td><td>tr&aring;den som l&oslash;per p&aring; baksiden n&aring;r fargen ikke brukes</td></tr>'
      '<tr><td><b>rapport</b></td><td>maskene eller omgangene som gjentas</td></tr></table>')}
{pink('SLIK ER PUTEN BYGGET OPP')}
{card(steps([
  '12 cm ensfarget innbrett til puteråpningen',
  'Nederste hvite felt med marineblå RO-motiver',
  'Marineblått fotballnett med hvite ruter',
  'Røde tribunetopper mot hvit bakgrunn',
  'Øverste hvite bord med marineblå RO-motiver',
  'Hvit topp som felles av og hekles eller sys sammen',
]))}
''', 6))

# ============ SIDE 6: DEL 1 INNBRETT OG NEDERKANT ============
pages.append(page(f'''
{banner('DEL 1: INNBRETT OG NEDERKANT')}
{steps([
  'Legg opp 160 masker med hvit hovedfarge på rundpinne 4,5 mm.',
  'Kontroller at oppleggskanten ikke er vridd. Sett sammen til en ring og plasser en markør '
  'ved omgangens begynnelse.',
  'Strikk 80 masker, og sett en markør til. Nå er arbeidet delt i to like sider med 80 masker '
  'på hver.',
  'Strikk glattstrikk rundt med hvitt til arbeidet måler ca. 12 cm. Dette blir innbretten '
  'på innsiden av putetrekket.',
  'Strikk 1 omgang vrang som brettekant. Herfra måles den synlige putedelen.',
  'Strikk 2 omganger rett med hvitt.',
])}
{pink('ÅPNINGEN NEDERST')}
{card('<p>Når puten er ferdig, brettes de 12 ensfargede centimeterne inn. Lukk åpningen slik du '
      'foretrekker, alle tre måtene fungerer like fint: fest innbretten med noen få sting i hver '
      'side, sy i 2&ndash;3 trykknapper, eller bruk bånd (kjøpt eller heklet) som knytes i sløyfe. '
      'Ingen sammensying trengs utover det du selv velger.</p>')}
{cream('<p class="creamtitle">Ikke sy igjen hele nederkanten. Trekket skal kunne tas av og '
       'brukes som et vanlig putevar.</p>')}
''', 7))

# ============ SIDE 7: DEL 2 NEDERSTE RO-BORD ============
pages.append(page(f'''
{banner('DEL 2: NEDERSTE RO-BORD')}
<p>Bokstavene strikkes med marineblått p&aring; hvit bakgrunn. Hvert RO-motiv er 8 masker bredt
og 7 omganger h&oslash;yt.</p>
{tealp('PLASSERING PÅ HVER SIDE')}
{card('<p>10 hvite m &ndash; RO &ndash; 5 hvite m &ndash; RO &ndash; 5 hvite m &ndash; RO '
      '&ndash; 5 hvite m &ndash; RO &ndash; 5 hvite m &ndash; RO &ndash; 10 hvite m</p>'
      '<p>Dette blir n&oslash;yaktig 80 masker. Gjenta samme plassering p&aring; den andre siden.</p>')}
{tealp('DIAGRAM: MARINEBLÅTT RO PÅ HVIT')}
<div class="chartrow">{chart_svg(RO_LOWER, CMAP_RO, cell=26, numbers=True)}</div>
<p>Les diagrammet nedenfra og opp. Fordi du strikker rundt, leses hver omgang fra h&oslash;yre
mot venstre.</p>
{pink('ETTER BORDEN')}
{card('<p>Strikk 1 omgang hvitt, 1 omgang vekselvis 1 marineblå og 1 hvit maske, deretter hvitt '
      'til feltet over bokstavene m&aring;ler ca. 7&ndash;8 cm.</p>')}
{cream('<p class="creamtitle">Fang flottene dersom de blir lengre enn fem masker. Hold dem l&oslash;se, '
       'ellers trekker puten seg sammen.</p>')}
''', 8))

# ============ SIDE 8: DEL 3 FOTBALLNETTET ============
pages.append(page(f'''
{banner('DEL 3: FOTBALLNETTET')}
<p>Bytt til marineblått. Strikk 2 omganger marineblått, deretter 1 omgang hvitt og 1 omgang marineblått.</p>
{tealp('NETTRAPPORT')}
{card('<p>Rapporten er 5 masker bred og 5 omganger h&oslash;y. Gjenta rapporten 32 ganger rundt og '
      '6 ganger i h&oslash;yden.</p>')}
<div class="chartrow">{chart_svg(NET, CMAP_NET, cell=30, numbers=True)}</div>
<p>P&aring; de fire nederste omgangene i hver rapport strikkes 1 hvit, 4 marineblå rundt. P&aring;
den femte omgangen strikkes alle maskene hvite. Dette danner &eacute;n vannrett nettlinje.</p>
<p>Gjenta disse fem omgangene seks ganger, eller til nettfeltet m&aring;ler omtrent 13&ndash;14 cm.</p>
<p>Avslutt med 1 omgang 1 hvit/4 marineblå, 1 omgang hvit og 2 omganger marineblått.</p>
{cream('<p class="creamtitle">De hvite, loddrette maskene ligger rett over hverandre. Tell fra '
       'omgangens begynnelse, s&aring; forskyves ikke nettet.</p>')}
''', 9))

# ============ SIDE 9: DEL 4 TRIBUNER OG PRIKKBORD ============
pages.append(page(f'''
{banner('DEL 4: TRIBUNER OG PRIKKBORD')}
<p>Over nettet strikkes r&oslash;de topper mot hvit bakgrunn. Rapporten g&aring;r over 10
masker og gjentas 16 ganger rundt.</p>
{tealp('DIAGRAM: RØDE TOPPER')}
<div class="chartrow">{chart_svg(STANDS, CMAP_STANDS, cell=26, numbers=True)}</div>
<p>Strikk diagrammet nedenfra og opp. For &aring; f&aring; det h&aring;ndlagde, ujevne uttrykket fra
originalputa kan annenhver topp strikkes &eacute;n omgang h&oslash;yere.</p>
{pink('FORTSETT MED HVITT')}
{card('<p>Strikk 8&ndash;10 omganger hvitt. Strikk deretter en prikkbord: 1 r&oslash;d maske, 3 hvite '
      'masker rundt. Strikk videre 5&ndash;6 omganger hvitt.</p>'
      '<p>Legg arbeidet flatt og kontroller h&oslash;yden f&oslash;r du starter &oslash;verste RO-bord.</p>')}
''', 10))

# ============ SIDE 10: DEL 5 ØVERSTE RO-BORD ============
pages.append(page(f'''
{banner('DEL 5: ØVERSTE RO-BORD')}
<p>Samme fargesetting som nederste bord: bokstavene strikkes med marineblått p&aring; hvit
bakgrunn.</p>
{tealp('PLASSERING PÅ HVER SIDE')}
{card('<p>10 hvite m &ndash; RO &ndash; 5 hvite m &ndash; RO &ndash; 5 hvite m &ndash; RO '
      '&ndash; 5 hvite m &ndash; RO &ndash; 5 hvite m &ndash; RO &ndash; 10 hvite m</p>'
      '<p>Gjenta samme plassering p&aring; side nummer to.</p>')}
{tealp('DIAGRAM: MARINEBLÅTT RO PÅ HVIT')}
<div class="chartrow">{chart_svg(RO_UPPER, CMAP_RO_UPPER, cell=26, numbers=True)}</div>
<p>Etter diagrammet strikkes 2 omganger hvitt, 2 omganger marineblått og 1 prikkbord med 1 marineblå
og 3 hvite masker rundt.</p>
<p>Fortsett med hvitt til den synlige delen, m&aring;lt fra vrangomgangen ved brettekanten, er
ca. 45 cm.</p>
''', 11))

# ============ SIDE 11: DEL 6 AVSLUTNING OG MONTERING ============
pages.append(page(f'''
{banner('DEL 6: AVSLUTNING OG MONTERING')}
{steps([
  'Fell l&oslash;st av alle 160 maskene.',
  'Legg trekket flatt med markørene i hver side. Kontroller at 80 masker ligger p&aring; '
  'forsiden og 80 p&aring; baksiden.',
  'Hekle sammen den avfelte kanten p&aring; forsiden og baksiden med en heklen&aring;l: sett '
  'n&aring;len gjennom begge lag og hekle fast maske hele veien over toppen. Foretrekker du '
  'n&aring;l og tr&aring;d, kan du sy dem sammen med madrassting i stedet, det gir samme '
  'resultat.',
  'Fest alle l&oslash;se tr&aring;der p&aring; innsiden. Kontroller at flottene ligger l&oslash;st '
  'og ikke trekker m&oslash;nsteret sammen.',
  'Brett den ensfargede delen p&aring; ca. 12 cm inn i putetrekket.',
  'Sett inn innerputen. Lukk &aring;pningen slik du valgte i del 1: noen f&aring; sting, '
  'trykknapper, eller b&aring;nd som knytes i sl&oslash;yfe.',
])}
{pink('VALGFRITT MERKE')}
{card('<p>Originalputa har et ferdig fotballmerke med norsk flagg sydd p&aring; den ene siden. '
      'Merket er dekorasjon og inng&aring;r ikke i selve strikkem&oslash;nsteret.</p>')}
''', 12))

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
  'Toppen er pent heklet eller sydd sammen',
  'Innbretten er festet i sidene og &aring;pningen fungerer',
]))}
{cream('<p class="creamtitle">Før oppskriften legges ut for salg, anbefales én kontrollstrikk av '
       'diagrammene og veiing av garnforbruket. Da kan eksakte garnmengder føres inn i neste '
       'utgave.</p>')}
<div class="congrats">Gratulerer, du har strikket din egen fotballpute!</div>
{byline('Renate Dahl')}
<p class="copyright">&copy; 2026 Little Montessori Explorers. Oppskriften er kun til personlig
bruk. Oppskriften og diagrammene kan ikke kopieres, deles, videreselges eller publiseres.
Ferdige produkter kan selges i liten skala med kreditering til Little Montessori Explorers.</p>
''', 13))

pages_no = pages

# ===========================================================================
# ENGELSK VERSJON
# ===========================================================================
pages = []
page = make_page('LME KNITTING PATTERN&nbsp;&nbsp;|&nbsp;&nbsp;RO RO RO FOOTBALL CUSHION', 'LME KNIT')

# ============ PAGE 1: COVER ============
pages.append(page(f'''
<div class="coverimg"><img src="{photo_src}" alt="Football cushion RO RO RO in white, navy and red"></div>
<div class="covertag">LME KNITTING PATTERN</div>
<div class="coverbanner">
  <span class="cball">&#9917;</span>
  <h1 class="covertitle">RO RO RO<br>FOOTBALL CUSHION</h1>
  <span class="cball">&#9917;</span>
</div>
<div class="subpill">FOOTBALL NET, TERRACES AND RO RO RO</div>
{card('<p class="center">A soft supporter&rsquo;s cushion with a football net, terraces and &laquo;RO RO RO&raquo; '
      'knitted all the way around the cushion. The pattern runs right round, so both sides come out the same. '
      'The pattern below is written for white, navy and red, like the original cushion. See page 3 '
      'for other colour combinations.</p>')}
{byline('By Renate Dahl')}
<p class="rekonstruert">Reconstructed from an original cushion knitted by Renate&rsquo;s mum</p>
{tip('Read the whole pattern through before you start. Knit a gauge swatch, especially when you '
     'switch yarn, because cotton and acrylic can behave differently.')}
''', 1))

# ============ PAGE 2: BEFORE YOU START ============
pages.append(page(f'''
{banner('BEFORE YOU START')}
<p>The cushion cover is knitted in the round on a circular needle, from the bottom up. First you
knit a plain flap about 12 cm long. Then comes the lower RO band, the football net, the red
terrace tops and the upper RO band. The pattern runs all the way round the cushion, so both
sides come out the same.</p>
{tealp('WHAT YOU LEARN')}
{card(ul([
  'To knit a cushion cover in the round on a circular needle',
  'To combine cotton and acrylic of the same thickness',
  'To follow simple colour charts',
  'To knit vertical and horizontal lines that form a football net',
  'To make a practical cushion opening with an inner flap',
]))}
{pink('HOW HARD IS IT?')}
{card('<p>A little practised. You should be able to cast on, knit stockinette in the round, '
      'change colour and follow a chart. The long stretches in the net need the floats kept loose.</p>')}
{cream('<p class="creamtitle">Place a marker at the start of the round and a second marker after '
       '80 stitches. Then you can always see where each side of the cushion begins.</p>')}
''', 2))

# ============ PAGE 3: ABOUT THE RECONSTRUCTION AND COLOURS ============
pages.append(page(f'''
{banner('ABOUT THE RECONSTRUCTION AND COLOURS')}
{pink('ABOUT THE RECONSTRUCTION')}
{card('<p>The original pattern took shape as the cushion was being knitted. The pattern has '
      'therefore been reconstructed from the finished cushion and information from the person '
      'who knitted it. Always measure as you go and fit the height to your inner cushion pad.</p>')}
{tealp('OTHER COLOUR COMBINATIONS')}
<div class="colorrow">
  <img src="{orig_photo_src}" alt="Football cushion in teal, yellow and green">
  <img src="{alt_rwb_src}" alt="Football cushion in red, white and blue">
  <img src="{alt_bwr_src}" alt="Football cushion in blue, red and white">
</div>
<p class="colorcap">The cover shows the cushion in white, navy and red, the colours the pattern below
is written for. It works just as well in teal, yellow and green (the very first colourway) or other
combinations, for example red, white and blue like the Norwegian flag.</p>
''', 3))

# ============ PAGE 4: WHAT YOU NEED ============
pages.append(page(f'''
{banner('WHAT YOU NEED')}
{tealp('YARN')}
{card('<p><b>Reynolds Saucy</b>, 100% mercerised cotton. American yarn made in Brazil. The '
      'original yarn&rsquo;s label recommends 5 mm needles. The original cushion is knitted on '
      '4.5 mm because the knitter knits a little loosely.</p>'
      '<table class="t"><tr><th>Colour</th><th>Use</th></tr>'
      f'<tr><td><span class="dot" style="background:{YARN_WHITE}"></span> White</td><td>main colour</td></tr>'
      f'<tr><td><span class="dot" style="background:{YARN_NAVY}"></span> Navy</td><td>RO letters and football net</td></tr>'
      f'<tr><td><span class="dot" style="background:{YARN_RED}"></span> Red</td><td>terrace tops and dot band</td></tr></table>'
      '<p><b>Holly from Rusta</b>, 100% acrylic, 50 g. Soft, lint-free yarn, about the same '
      'thickness as Saucy. Nice for one of the pattern colours if you want to mix in some acrylic.</p>'
      '<p class="small">The yarn amount from the original piece was not recorded. Have plenty of '
      'white main colour and at least one ball of each pattern colour. If you sell yarn kits, the '
      'usage must be checked by a test swatch and weighed first.</p>')}
{pink('ALTERNATIVE YARN')}
{card('<p>Use a smooth cotton or acrylic yarn that gives the same gauge. Choose a yarn meant for '
      '4.5&ndash;5 mm needles. All the colours should be about the same thickness.</p>')}
{tealp('NEEDLES AND KIT')}
{card(ul([
  '4.5 mm circular needle, 80 cm',
  'Tapestry needle, scissors and tape measure',
  'Two stitch markers',
  '45 &times; 45 cm inner cushion pad',
  'Optional, for closing: snap fasteners, ribbon (bought or crocheted), or just needle and thread',
  'Optional: ready-made football badge',
]))}
{cream('<p class="creamtitle">The yarn label recommends 5 mm needles, but 4.5 mm gave the right '
       'look in the original. If you knit tightly, 5 mm may suit you better.</p>')}
''', 4))

# ============ PAGE 4: GAUGE AND MEASUREMENTS ============
pages.append(page(f'''
{banner('GAUGE AND MEASUREMENTS')}
{tealp('GAUGE, THE SECRET KEY')}
{card('<p>About 18 stitches = 10 cm in stockinette in the round. With 80 stitches on each side '
      'the cushion cover comes out about 44&ndash;45 cm wide.</p>'
      '<p>Knit a swatch at least 12 &times; 12 cm. Wash and dry it the way you plan to treat the '
      'cushion cover. Then measure across the middle of the swatch.</p>'
      + ul([
          'More than 18 stitches over 10 cm: try 5 mm needles.',
          'Fewer than 18 stitches over 10 cm: try 4 mm needles.',
          'About 18 stitches: use 4.5 mm needles and get going.',
      ]))}
{card('<table class="t"><tr><th>Measurement</th><th>Value</th></tr>'
  '<tr><td>Inner cushion pad</td><td>45 &times; 45 cm</td></tr>'
  '<tr><td>Width, each side</td><td>approx. 44&ndash;45 cm</td></tr>'
  '<tr><td>Visible height</td><td>approx. 45 cm</td></tr>'
  '<tr><td>Inner flap</td><td>approx. 12 cm</td></tr>'
  '<tr><td>Stitches around</td><td>160 st = 80 st per side</td></tr></table>')}
{cream('<p class="creamtitle">Measure the height while the cover lies flat. Stop when the visible '
       'part from the fold edge to the top is 45 cm.</p>')}
''', 5))

# ============ PAGE 5: GLOSSARY AND STRUCTURE ============
pages.append(page(f'''
{banner('GLOSSARY AND STRUCTURE')}
{card('<table class="t tl"><tr><th>Term</th><th>Means</th></tr>'
      '<tr><td><b>st</b></td><td>stitch</td></tr>'
      '<tr><td><b>round</b></td><td>one whole lap around</td></tr>'
      '<tr><td><b>k</b></td><td>knit</td></tr>'
      '<tr><td><b>p</b></td><td>purl</td></tr>'
      '<tr><td><b>MC</b></td><td>white main colour</td></tr>'
      '<tr><td><b>float</b></td><td>the thread that runs on the back when the colour is not in use</td></tr>'
      '<tr><td><b>repeat</b></td><td>the stitches or rounds that are repeated</td></tr></table>')}
{pink('HOW THE CUSHION IS BUILT UP')}
{card(steps([
  '12 cm plain flap for the cushion opening',
  'Lower white field with navy RO motifs',
  'Navy football net with white squares',
  'Red terrace tops against a white background',
  'Upper white band with navy RO motifs',
  'White top, cast off and crocheted or sewn together',
]))}
''', 6))

# ============ PAGE 6: PART 1 FLAP AND LOWER EDGE ============
pages.append(page(f'''
{banner('PART 1: FLAP AND LOWER EDGE')}
{steps([
  'Cast on 160 stitches in white main colour on a 4.5 mm circular needle.',
  'Check that the cast-on edge is not twisted. Join in the round and place a marker at the '
  'start of the round.',
  'Knit 80 stitches, and place a second marker. The work is now divided into two matching '
  'sides of 80 stitches each.',
  'Knit stockinette in the round in white until the work measures about 12 cm. This becomes '
  'the flap on the inside of the cushion cover.',
  'Knit 1 round purl as a fold edge. From here the visible part of the cushion is measured.',
  'Knit 2 rounds knit in white.',
])}
{pink('THE OPENING AT THE BOTTOM')}
{card('<p>When the cushion is finished, the plain 12 cm section is folded inward. Close it however '
      'you like, all three work equally well: fasten the flap with a few stitches on each side, sew '
      'on 2&ndash;3 snap fasteners, or use ribbon (bought or crocheted) tied in a bow. No sewing '
      'is required beyond whichever you choose.</p>')}
{cream('<p class="creamtitle">Do not sew the whole lower edge shut. The cover should be removable '
       'and used like an ordinary cushion cover.</p>')}
''', 7))

# ============ PAGE 7: PART 2 LOWER RO BAND ============
pages.append(page(f'''
{banner('PART 2: LOWER RO BAND')}
<p>The letters are knitted in navy on a white background. Each RO motif is 8 stitches wide
and 7 rounds tall.</p>
{tealp('PLACEMENT ON EACH SIDE')}
{card('<p>10 white st &ndash; RO &ndash; 5 white st &ndash; RO &ndash; 5 white st &ndash; RO &ndash; '
      '5 white st &ndash; RO &ndash; 5 white st &ndash; RO &ndash; 10 white st</p>'
      '<p>That comes to exactly 80 stitches. Repeat the same placement on the other side.</p>')}
{tealp('CHART: NAVY RO ON WHITE')}
<div class="chartrow">{chart_svg(RO_LOWER, CMAP_RO, cell=26, numbers=True)}</div>
<p>Read the chart from the bottom up. Because you are knitting in the round, each round is read
from right to left.</p>
{pink('AFTER THE BAND')}
{card('<p>Knit 1 round white, 1 round alternating 1 navy and 1 white stitch, then white until '
      'the section above the letters measures about 7&ndash;8 cm.</p>')}
{cream('<p class="creamtitle">Catch the floats if they run longer than five stitches. Keep them '
       'loose, or the cushion will pull itself in.</p>')}
''', 8))

# ============ PAGE 8: PART 3 THE FOOTBALL NET ============
pages.append(page(f'''
{banner('PART 3: THE FOOTBALL NET')}
<p>Switch to navy. Knit 2 rounds navy, then 1 round white and 1 round navy.</p>
{tealp('NET REPEAT')}
{card('<p>The repeat is 5 stitches wide and 5 rounds tall. Repeat it 32 times around and 6 times '
      'in height.</p>')}
<div class="chartrow">{chart_svg(NET, CMAP_NET, cell=30, numbers=True)}</div>
<p>On the four bottom rounds of each repeat, knit 1 white, 4 navy all the way round. On the fifth
round, knit every stitch white. This forms one horizontal net line.</p>
<p>Repeat these five rounds six times, or until the net section measures about 13&ndash;14 cm.</p>
<p>Finish with 1 round of 1 white/4 navy, 1 round white and 2 rounds navy.</p>
{cream('<p class="creamtitle">The white, vertical stitches sit directly above one another. Count '
       'from the start of the round so the net does not shift.</p>')}
''', 9))

# ============ PAGE 9: PART 4 TERRACES AND DOT BAND ============
pages.append(page(f'''
{banner('PART 4: TERRACES AND DOT BAND')}
<p>Above the net you knit red tops against a white background. The repeat runs over 10 stitches
and is repeated 16 times around.</p>
{tealp('CHART: RED TOPS')}
<div class="chartrow">{chart_svg(STANDS, CMAP_STANDS, cell=26, numbers=True)}</div>
<p>Knit the chart from the bottom up. To get the handmade, uneven look of the original cushion,
you can knit every other top one round taller.</p>
{pink('CONTINUE IN WHITE')}
{card('<p>Knit 8&ndash;10 rounds white. Then knit a dot band: 1 red stitch, 3 white stitches '
      'around. Knit a further 5&ndash;6 rounds white.</p>'
      '<p>Lay the work flat and check the height before you start the upper RO band.</p>')}
''', 10))

# ============ PAGE 10: PART 5 UPPER RO BAND ============
pages.append(page(f'''
{banner('PART 5: UPPER RO BAND')}
<p>Same colours as the lower band: the letters are knitted in navy on a white background.</p>
{tealp('PLACEMENT ON EACH SIDE')}
{card('<p>10 white st &ndash; RO &ndash; 5 white st &ndash; RO &ndash; 5 white '
      'st &ndash; RO &ndash; 5 white st &ndash; RO &ndash; 5 white st &ndash; RO '
      '&ndash; 10 white st</p>'
      '<p>Repeat the same placement on side number two.</p>')}
{tealp('CHART: NAVY RO ON WHITE')}
<div class="chartrow">{chart_svg(RO_UPPER, CMAP_RO_UPPER, cell=26, numbers=True)}</div>
<p>After the chart, knit 2 rounds white, 2 rounds navy and 1 dot band with 1 navy and
3 white stitches around.</p>
<p>Carry on in white until the visible section, measured from the purl round at the fold edge, is
about 45 cm.</p>
''', 11))

# ============ PAGE 11: PART 6 FINISHING AND ASSEMBLY ============
pages.append(page(f'''
{banner('PART 6: FINISHING AND ASSEMBLY')}
{steps([
  'Cast off loosely across all 160 stitches.',
  'Lay the cover flat with the markers on each side. Check that 80 stitches lie on the front '
  'and 80 on the back.',
  'Crochet the cast-off edge of the front and back together with a crochet hook: work the hook '
  'through both layers and single crochet all the way across the top. If you prefer a needle and '
  'thread, you can sew them together with mattress stitch instead, it gives the same result.',
  'Weave in all loose ends on the inside. Check that the floats lie loose and do not pull the '
  'pattern in.',
  'Fold the plain section, about 12 cm, into the cushion cover.',
  'Insert the cushion pad. Close the opening however you chose in part 1: a few stitches, snap '
  'fasteners, or ribbon tied in a bow.',
])}
{pink('OPTIONAL BADGE')}
{card('<p>The original cushion has a ready-made football badge with the Norwegian flag sewn onto '
      'one side. The badge is decoration and is not part of the knitting pattern itself.</p>')}
''', 12))

# ============ PAGE 12: CARE AND FINAL CHECK ============
pages.append(page(f'''
{banner('CARE AND FINAL CHECK')}
{tealp('CARE')}
{card('<p>Because the cushion combines mercerised cotton and acrylic, it should be washed '
      'following the gentlest yarn&rsquo;s recommendation. Wash the cover separately on a gentle '
      'cycle, about 30&deg;C. Use a wash bag. Do not tumble dry. Shape the cover and let it dry '
      'flat.</p>')}
{pink('CHECKLIST')}
{card(check([
  'The cover measures about 45 &times; 45 cm without the flap',
  'The pattern runs all the way round and matches on both sides',
  'There are five RO motifs on each side in both bands',
  'The football net has straight, white lines',
  'The floats lie loose on the inside',
  'The top is neatly crocheted or sewn together',
  'The flap is fastened at the sides and the opening works',
]))}
{cream('<p class="creamtitle">Before the pattern goes on sale, one test knit of the charts and a '
       'weigh-in of the yarn usage is recommended. Then exact yarn amounts can be added to the '
       'next edition.</p>')}
<div class="congrats">Congratulations, you have knitted your very own football cushion!</div>
{byline('Renate Dahl')}
<p class="copyright">&copy; 2026 Little Montessori Explorers. This pattern is for personal use
only. The pattern and charts may not be copied, shared, resold or published. Finished items may
be sold on a small scale with credit to Little Montessori Explorers.</p>
''', 13))

pages_en = pages

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
.band span {{ position:absolute; left:50%; top:75%; transform:translate(-50%,-50%);
  writing-mode:vertical-rl; text-orientation:mixed; rotate:180deg;
  font-family:var(--font-head); font-size:6.5pt; letter-spacing:3.5px; color:#fff; white-space:nowrap; }}
.rside {{ position:absolute; right:2.5mm; top:40%; }}
.rside span {{ writing-mode:vertical-rl; font-family:var(--font-head); font-size:6pt;
  letter-spacing:2.5px; color:#9a9a9a; white-space:nowrap; }}
.phead {{ text-align:center; padding-top:7mm; }}
.ph1 {{ font-family:var(--font-head); font-weight:600; font-size:9pt; letter-spacing:3.5px; color:#7f96a8; }}
.ph2 {{ font-family:var(--font-head); font-weight:600; font-size:8.5pt; letter-spacing:2.2px; color:{PINK}; margin-top:1.4mm; }}
.content {{ padding:2mm 12mm 0 15mm; }}
.pfoot {{ position:absolute; bottom:3mm; left:0; right:0; text-align:center;
  font-family:var(--font-head); font-weight:700; font-size:13pt; color:#8a8a8a; }}

.banner {{ background:#f5efb2; border-radius:14px; padding:2.2mm 6mm; margin:.6mm 0 2.4mm; text-align:center; }}
.banner h1 {{ font-family:var(--font-head); font-weight:800; font-size:21pt; color:{INK};
  letter-spacing:.4px; text-transform:uppercase; }}
.pillwrap {{ text-align:center; margin:2.4mm 0 1.6mm; }}
.pill {{ display:inline-block; border-radius:999px; padding:1.5mm 7mm;
  font-family:var(--font-head); font-weight:700; font-size:14pt; color:#fff;
  letter-spacing:.4px; text-transform:uppercase; }}
.pinkpill {{ background:{PINK}; }}
.tealpill {{ background:{TEAL}; }}
.card {{ background:rgba(255,255,255,.93); border:2px solid #f2bfd4; border-radius:16px;
  padding:2.2mm 5mm; margin:0 0 2mm; }}
.cream {{ background:{CREAM}; border:2px solid #f2bfd4; border-radius:16px;
  padding:2.2mm 5mm; margin:2mm 0; text-align:center; }}
.creamtitle {{ font-family:var(--font-head); font-weight:700; font-size:15.5pt; color:{TEAL}; }}
p {{ font-size:15.5pt; line-height:1.28; margin-bottom:1.1mm; }}
p.small, .small {{ font-size:13pt; color:#777; }}
p.center {{ text-align:center; }}
ul.dots {{ list-style:none; }}
ul.dots li {{ font-size:15.5pt; line-height:1.24; padding-left:5.5mm; position:relative; margin:.6mm 0; }}
ul.dots li::before {{ content:'•'; position:absolute; left:1mm; color:{PINK}; font-weight:bold; }}
ul.checks {{ list-style:none; }}
ul.checks li {{ font-size:15.5pt; line-height:1.24; padding-left:7mm; position:relative; margin:.7mm 0; }}
ul.checks li::before {{ content:'\\2610'; position:absolute; left:0; color:{TEAL}; font-size:15pt; }}
ol.steps {{ list-style:none; }}
ol.steps li {{ display:flex; gap:2.6mm; align-items:flex-start; background:rgba(255,255,255,.93);
  border:2px solid #f2bfd4; border-radius:14px; padding:1.6mm 4mm; margin-bottom:1.1mm; }}
ol.steps li div {{ font-size:15pt; line-height:1.22; }}
.snum {{ flex:0 0 auto; width:8mm; height:8mm; border-radius:50%; background:{PINK}; color:#fff;
  font-family:var(--font-head); font-weight:700; font-size:14pt; display:flex;
  align-items:center; justify-content:center; margin-top:.5mm; }}
table.t {{ width:100%; border-collapse:collapse; margin:1mm 0; }}
table.t th {{ font-family:var(--font-head); font-weight:700; font-size:13pt; color:{PINK};
  text-align:left; padding:.8mm 2mm; border-bottom:2px solid #f2bfd4; }}
table.t td {{ font-size:13.5pt; padding:.7mm 2mm; border-bottom:1px solid #f6dbe7; line-height:1.18; }}
table.tl td:first-child {{ white-space:nowrap; }}
.dot {{ display:inline-block; width:3.5mm; height:3.5mm; border-radius:50%; vertical-align:-0.5mm;
  margin-right:1.5mm; border:1px solid rgba(0,0,0,.15); }}

.coverimg {{ text-align:center; margin:2.4mm 0 2.4mm; }}
.coverimg img {{ width:82mm; border-radius:14px; border:3mm solid #fff; }}
.covertag {{ text-align:center; font-family:var(--font-head); font-size:10.5pt; letter-spacing:2.3px;
  color:#8a8a8a; margin:1mm 0 2mm; }}
.coverbanner {{ display:flex; align-items:center; justify-content:center; gap:5mm;
  background:#f5efb2; border-radius:16px; padding:2.6mm 6mm; }}
.covertitle {{ font-family:var(--font-head); font-weight:800; font-size:25pt; color:{INK};
  letter-spacing:.5px; text-align:center; line-height:1.18; }}
.cball {{ font-size:22pt; line-height:1; }}
.subpill {{ margin:2.6mm auto; width:fit-content; background:#fdf9e3; border:2.5px solid {INK};
  border-radius:999px; padding:1.4mm 7mm; font-family:var(--font-head); font-weight:700;
  font-size:13pt; color:{INK}; letter-spacing:.4px; text-align:center; }}
.byline {{ text-align:center; margin-top:1.2mm; }}
.byline .logo {{ width:28mm; height:28mm; object-fit:contain; margin-bottom:1mm; }}
.by1 {{ font-family:var(--font-head); font-weight:700; font-size:21pt; color:{CERISE}; }}
.by2 {{ font-size:16pt; color:#8a8a8a; margin-top:1mm; }}
.by3 {{ font-family:var(--font-head); font-weight:600; font-size:15pt; color:{CERISE}; margin-top:.7mm; }}
.rekonstruert {{ text-align:center; font-size:12pt; color:#9a9a9a; font-style:italic; margin-top:1.2mm; }}
.notecard {{ display:flex; gap:3mm; align-items:center; background:rgba(255,255,255,.8);
  border-radius:12px; padding:2.2mm 5mm; margin-top:2.4mm; }}
.notecard p {{ font-size:13pt; color:#777; margin:0; }}
.noteemo {{ font-size:16pt; }}
.colorrow {{ display:flex; gap:4mm; justify-content:center; margin:2.4mm 0 1.6mm; flex-wrap:wrap; }}
.colorrow img {{ width:47mm; border-radius:12px; border:2mm solid #fff;
  box-shadow:0 3px 10px rgba(0,0,0,.12); }}
.colorcap {{ font-size:11.5pt; color:#777; text-align:center; margin-top:1mm; }}

.chartrow {{ display:flex; gap:6mm; justify-content:center; align-items:flex-end;
  flex-wrap:wrap; margin:1.6mm 0 2.4mm; }}
.chartbox {{ text-align:center; }}
.chartttl {{ font-family:var(--font-head); font-weight:700; font-size:12pt; color:{PINK};
  margin-bottom:1.3mm; letter-spacing:.3px; }}
.congrats {{ font-family:var(--font-head); font-weight:800; font-size:19pt; color:{INK};
  text-align:center; margin:1.5mm 0 1mm; }}
.copyright {{ font-size:10pt; color:#9a9a9a; text-align:center; margin-top:1.5mm; line-height:1.25; }}
'''

doc_no = f'''<!DOCTYPE html>
<html lang="no"><head><meta charset="utf-8">
<title>Fotballpute RO RO RO, LME strikkeoppskrift</title>
<style>{css}</style></head>
<body>{''.join(pages_no)}</body></html>'''

doc_en = f'''<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8">
<title>RO RO RO Football Cushion, LME knitting pattern</title>
<style>{css}</style></head>
<body>{''.join(pages_en)}</body></html>'''

(BASE / 'fotballpute_ro_no.html').write_text(doc_no, encoding='utf-8')
(BASE / 'fotballpute_ro_en.html').write_text(doc_en, encoding='utf-8')
print('OK', len(doc_no), 'tegn (no),', len(doc_en), 'tegn (en)')
