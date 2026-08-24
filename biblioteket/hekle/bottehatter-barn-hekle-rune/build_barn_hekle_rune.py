# -*- coding: utf-8 -*-
"""Genererer LME-hekleoppskrift (Bøttehatter barn, runeskrift) som HTML klar for PDF-print."""
import base64, html, pathlib

BASE = pathlib.Path(__file__).parent
PHOTO = BASE / 'barn_hekle_ref.jpg'
LOGO = BASE / 'lme-logo.png'

# ---------- farger ----------
TEAL   = '#4aa7a4'
RED    = '#C8102E'
NAVY   = '#00205B'
WHITE  = '#FFFFFF'
CREAM  = '#F8F4EA'
INK    = '#3f3f3f'
PINK   = '#df5f93'
CERISE = '#E91E89'


def runeword(word, box=48):
    """Ordet satt i den ekte 'Norse'-fonten, kremhvitt på rødt panel."""
    fs = box * 1.30
    padx = box * 0.55
    pady = box * 0.34
    lsp = box * 0.05
    txt = (f"display:inline-block;font-family:'Norse';font-weight:700;color:{CREAM};"
           f"font-size:{fs:.0f}px;line-height:1.02;letter-spacing:{lsp:.0f}px;white-space:nowrap;")
    wrap = (f"display:inline-block;background:{RED};border-radius:{box*0.30:.0f}px;"
            f"padding:{pady:.0f}px {padx:.0f}px;max-width:100%;")
    return f'<div style="{wrap}"><span style="{txt}">{word}</span></div>'


def mini_flag(w=34):
    h = round(w * 10 / 13)
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 26 20" '
            f'style="width:{w}px;height:{h}px;border-radius:3px">'
            f'<rect width="26" height="20" fill="{RED}"/>'
            f'<rect x="6" width="6" height="20" fill="#fff"/><rect y="7" width="26" height="6" fill="#fff"/>'
            f'<rect x="7.5" width="3" height="20" fill="{NAVY}"/><rect y="8.5" width="26" height="3" fill="{NAVY}"/>'
            f'</svg>')


photo_src = f'data:image/jpeg;base64,{base64.b64encode(PHOTO.read_bytes()).decode()}'
logo_src = f'data:image/png;base64,{base64.b64encode(LOGO.read_bytes()).decode()}'


def make_page(ph2, right_label='LME HEKLE'):
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

# topp (samme oppbygging som den charted barnehekle-oppskriften)
STD_ROUND = [8, 8, 9, 9, 10, 10, 11, 11, 11, 12,
             12, 12, 12, 12, 12, 12, 12, 13, 13, 13, 13]
EXTRA = [0, 3, 0, 3, 0, 3, 0, 2, 4, 0,
         1, 2, 2, 3, 4, 4, 5, 0, 0, 1, 2]
FINAL = [48, 51, 54, 57, 60, 63, 66, 68, 70, 72,
         73, 74, 74, 75, 76, 76, 77, 78, 78, 79, 80]
FERDIG_OMKR = ["34.3", "36.4", "38.6", "40.7", "42.9", "45.0", "47.1", "48.6", "50.0", "51.4",
               "52.0", "52.5", "53.0", "53.5", "54.0", "54.5", "55.0", "55.5", "56.0", "56.5", "57.0"]
TOPPDIAM = ["10.9", "11.6", "12.3", "13.0", "13.6", "14.3", "15.0", "15.5", "15.9", "16.4",
            "16.6", "16.8", "16.8", "17.1", "17.3", "17.3", "17.5", "17.7", "17.7", "18.0", "18.2"]

# sidene: heltall rett ned, ingen fargeomganger, bokstavene hekles på etterpå
SIDEOMG = [12, 13, 14, 14, 15, 16, 17, 18, 18, 19,
           20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30]
SIDE_CM = ["7.5", "8.1", "8.75", "8.75", "9.4", "10", "10.6", "11.25", "11.25", "11.9",
           "12.5", "13.1", "13.75", "14.4", "15", "15.6", "16.25", "16.9", "17.5", "18.1", "18.75"]
LETTER_H = ["3.5", "4", "4.4", "4.4", "4.7", "5", "5.3", "5.6", "5.6", "5.9",
            "6.2", "6.6", "6.9", "7.2", "7.5", "7.8", "8.1", "8.4", "8.8", "9.1", "9.4"]
LETTER_MARG = ["1.9", "2", "2.2", "2.2", "2.3", "2.5", "2.7", "2.8", "2.8", "3",
               "3.1", "3.3", "3.4", "3.6", "3.8", "3.9", "4.1", "4.2", "4.3", "4.5", "4.7"]

# bremmen
BREMOMG = [6, 6, 7, 7, 8, 8, 9, 9, 10, 10,
           11, 11, 12, 12, 13, 13, 14, 14, 15, 15, 16]
OK_PA = ["2, 4, 6", "2, 4, 6", "2, 4, 6", "2, 4, 6", "2, 4, 6, 8", "2, 4, 6, 8", "2, 4, 6, 8",
         "2, 4, 6, 8", "2, 4, 6, 8, 10", "2, 4, 6, 8, 10",
         "2, 4, 6, 8, 10", "2, 4, 6, 8, 10", "2, 4, 6, 8, 10", "2, 4, 6, 8, 10", "2, 4, 6, 8, 10",
         "2, 4, 6, 8, 10", "2, 4, 6, 8, 10", "2, 4, 6, 8, 10", "2, 4, 6, 8, 10", "2, 4, 6, 8, 10", "2, 4, 6, 8, 10"]
OKN_HVER = [6, 6, 7, 7, 8, 8, 8, 9, 9, 9,
            9, 9, 10, 10, 10, 11, 11, 11, 12, 12, 12]
CA_SLUTT = [66, 69, 75, 78, 92, 95, 98, 104, 115, 117,
            119, 120, 120, 122, 124, 124, 125, 127, 127, 128, 130]

pages = []

# ============ SIDE 1: FORSIDE ============
pages.append(make_page('LME HEKLEOPPSKRIFT&nbsp;&nbsp;|&nbsp;&nbsp;BØTTEHATTER BARN, RUNESKRIFT')('''
<div class="coverimg coverrune">''' + runeword('NORGE', box=54) + '''</div>
<div class="covertag">LME HEKLEOPPSKRIFT</div>
<div class="coverbanner">
  <h1 class="covertitle">BØTTEHATTER TIL BABY<br>OG BARN, RUNESKRIFT</h1>
</div>
<div class="subpill">NORGE &middot; NORWAY &middot; STØRRELSE 50&ndash;170</div>
''' + card('<p class="center">Samme bøttehatt som NORGE-runehatt-oppskriften for voksne, heklet i fastmasker '
      'og gradert helt fra bunnen av til tjueen babyer-, barne- og ungdomsstørrelser, 50 til 170. Du hekler hele hatten '
      'ensfarget, og hekler så "NORGE" (eller "NORWAY") på til slutt i lesbare runestil-bokstaver, pluss et '
      'lite norsk flagg på toppen. Denne oppskriften er komplett i seg selv, du trenger ikke eie noen annen '
      'LME-oppskrift for å hekle den.</p>') + '''
''' + byline('Av Renate Dahl') + '''
''' + tip('Les hele oppskriften én gang før du starter. Hekl alltid en prøvelapp først, se side 4.') + '''
''', 1))

# ============ SIDE 2: FØR DU BEGYNNER ============
pages.append(make_page('LME HEKLEOPPSKRIFT&nbsp;&nbsp;|&nbsp;&nbsp;BØTTEHATTER BARN, RUNESKRIFT')(
    banner('FØR DU BEGYNNER') +
    '<p>Bøttehatten hekles i spiral (ikke sammenføyde omganger) med fastmasker, fra toppen og ned, helt '
    'ensfarget. Du hekler først en rundet topp som vokser fra en liten ring, deretter sidene rett ned, og '
    'til slutt en brem som vokser utover og bølger. Helt til slutt hekler du bokstavene og flagget på '
    'overflaten. Denne oppskriften dekker to ord, velg det du vil lage:</p>' +
    card(ul([
        '<b>NORGE</b>: ordet i runestil-bokstaver, tvers over pannen',
        '<b>NORWAY</b>: samme som NORGE, men med det engelske navnet',
    ])) +
    tealp('DETTE LÆRER DU') +
    card(ul([
        'Å hekle i spiral fra en magic ring',
        'Å øke jevnt fordelt for å hekle en flat, rundet topp',
        'Å hekle overflate-hekling: kjedemasker heklet oppå hatten, som lager opphøyde bokstaver',
        'Å hekle en bølget brem med en økeomgang',
    ])) +
    pink('HVOR VANSKELIG ER DET?') +
    card('<p>Nybegynnervennlig. Du bør kunne hekle fastmasker, kjenne til magic ring og hekle kjedemasker. '
         'Selve hatten hekles i kun én farge, bokstavene kommer på etterpå med heklenålen rett i overflaten, '
         'og alt er forklart trinn for trinn i denne oppskriften.</p>') +
    cream('<p class="creamtitle">Bruk maskemarkør (en sikkerhetsnål eller tråd i annen farge fungerer fint) '
          'i den første maska i hver omgang, så mister du ikke tellingen i spiralen.</p>')
, 2))

# ============ SIDE 3: STØRRELSER OG PASSFORM ============
pages.append(make_page('LME HEKLEOPPSKRIFT&nbsp;&nbsp;|&nbsp;&nbsp;BØTTEHATTER BARN, RUNESKRIFT')(
    banner('STØRRELSER OG RIKTIG PASSFORM') +
    '<p>Klesstørrelsen er bare en veiledning. Mål alltid rundt barnets hode, over ørene og øyenbrynene. '
    'Velg etter hodemålet dersom målet og klesstørrelsen peker mot ulike størrelser.</p>' +
    sizetable(['Str.', 'Ca. alder', 'Hodemål (cm)'], list(zip(SIZES, AGE, HEAD))) +
    tealp('SIKKER BRUK FOR DE MINSTE') +
    card('<p>Hatten er et plagg for våken bruk under tilsyn. Den skal ikke brukes under søvn, i seng, i '
         'vogn uten oppsyn, eller dersom bremmen dekker øyne, nese eller munn. Kontroller alltid at ingen '
         'løse tråder på innsiden kan hekte seg fast i fingre.</p>') +
    cream('<p class="creamtitle">Barn vokser ulikt. Faktisk hodemål går alltid foran alder, mål på nytt '
          'hver gang du er usikker.</p>')
, 3))

# ============ SIDE 4: DETTE TRENGER DU ============
pages.append(make_page('LME HEKLEOPPSKRIFT&nbsp;&nbsp;|&nbsp;&nbsp;BØTTEHATTER BARN, RUNESKRIFT')(
    banner('DETTE TRENGER DU') +
    tealp('GARN') +
    card('<p>Et glatt bomullsgarn (aran/tykkelse 4) som gir 14 fastmasker x 16 omganger = 10 x 10 cm, '
         'heklet i spiral. Reynolds Saucy, Rico Design Creative Cotton Aran og Hobbii Amigo er alle gode '
         'valg, i rødt og hvitt (eller den fargen du vil ha bokstavene i).</p>'
         '<table class="t"><tr><th>Farge</th><th>Bruk</th></tr>'
         f'<tr><td><span class="dot" style="background:{RED}"></span> Rød</td><td>hovedfarge, hele hatten</td></tr>'
         f'<tr><td><span class="dot" style="background:{WHITE};border-color:#ccc;"></span> Hvit</td><td>bokstavene og flagget</td></tr>'
         f'<tr><td><span class="dot" style="background:{NAVY}"></span> Marineblå</td><td>det lille korset i flagget</td></tr></table>'
         '<p class="small">Ha rikelig av rød hovedfarge (nesten hele hatten er heklet i rødt) og litt hvitt '
         'og marineblått, de brukes bare til bokstavene og flagget.</p>') +
    pink('HEKLENÅL OG UTSTYR') +
    card(ul([
        'Heklenål som gir oppgitt fasthet, ofte 3,5&ndash;4 mm for et aran-garn',
        '<b>Stoppenål med butt spiss</b> hvis du sier bokstavene med snor (se side 8)',
        'Saks og målebånd',
        'Maskemarkør til første maske i hver omgang',
    ])) +
    cream('<p class="creamtitle">Hekler du fast, prøv en større nål. Hekler du løst, prøv en mindre. Målet '
          'er alltid 14 fastmasker på 10 cm.</p>')
, 4))

# ============ SIDE 5: HEKLEFASTHET OG ORDLISTE ============
pages.append(make_page('LME HEKLEOPPSKRIFT&nbsp;&nbsp;|&nbsp;&nbsp;BØTTEHATTER BARN, RUNESKRIFT')(
    banner('HEKLEFASTHET, DEN VIKTIGE NØKKELEN') +
    tealp('HEKL EN PRØVELAPP FØRST') +
    card('<p>Hekle en firkant på minst 12 x 12 cm i fastmasker med hovedfargen. Vask og tørk den slik du '
         'vil behandle hatten, mål deretter midt på lappen.</p>' +
         ul([
             'Flere enn 14 fm på 10 cm: prøv en større nål.',
             'Færre enn 14 fm på 10 cm: prøv en mindre nål.',
             'Nøyaktig 14 fm: bruk nålen din og sett i gang.',
         ])) +
    pink('ORDLISTE') +
    card('<table class="t tl"><tr><th>Ord</th><th>Betyr</th></tr>'
         '<tr><td><b>fm</b></td><td>fastmaske</td></tr>'
         '<tr><td><b>omg</b></td><td>omgang, én hel runde rundt</td></tr>'
         '<tr><td><b>øk</b></td><td>økning, 2 fm i samme maske</td></tr>'
         '<tr><td><b>kjm</b></td><td>kjedemaske</td></tr>'
         '<tr><td><b>HF</b></td><td>hovedfarge (rød)</td></tr>'
         '<tr><td><b>spiral</b></td><td>omgangene hekles i én sammenhengende runde, uten kjedemaske og '
         'oppstart, følg maskemarkøren</td></tr>'
         '<tr><td><b>overflate-hekling</b></td><td>kjedemasker heklet oppå den ferdige hatten, lager '
         'opphøyde bokstaver</td></tr></table>')
, 5))

# ============ SIDE 6: DEL 1 TOPPEN ============
pages.append(make_page('LME HEKLEOPPSKRIFT&nbsp;&nbsp;|&nbsp;&nbsp;BØTTEHATTER BARN, RUNESKRIFT')(
    banner('DEL 1: TOPPEN') +
    steps([
        'Hekle 6 fm i en magic ring med rød hovedfarge. Dra ringen sammen. Sett en maskemarkør i den '
        'første masken, flytt markøren opp én maske for hver ny omgang. Fra nå av hekles alt i spiral, '
        'uten kjedemaske.',
        'Omg 2: øk (2 fm) i hver maske rundt = 12 masker.',
        'Omg 3: *øk, 1 fm*, gjenta rundt = 18 masker.',
        'Omg 4: *øk, 1 fm, 1 fm*, gjenta rundt = 24 masker. Fortsett etter samme mønster: hver ny omgang '
        'økes 6 masker jevnt fordelt, med &eacute;n vanlig fm mer mellom hver økning enn omgangen før.',
        'Finn tallet for din størrelse i kolonnen &laquo;Standardomgang&raquo; i tabellen på neste side. '
        'Fortsett å øke etter mønsteret over til du har heklet akkurat denne omgangen.',
        'Har størrelsen din et tall i kolonnen &laquo;Ekstra&raquo; som ikke er 0, hekler du &eacute;n '
        'omgang til: fordel det oppgitte antallet økninger jevnt utover omgangen (for eksempel hver '
        'sjette/sjuende maske), resten vanlige fm. Da lander du nøyaktig på tallet i kolonnen '
        '&laquo;Totalt&raquo;.',
    ]) +
    cream('<p class="creamtitle">Kontroller diameteren mot tabellen på neste side, ikke bare '
          'maskeantallet. Er du mer enn 0,5 cm unna, juster nålstørrelsen før du fortsetter.</p>')
, 6))

pages.append(make_page('LME HEKLEOPPSKRIFT&nbsp;&nbsp;|&nbsp;&nbsp;BØTTEHATTER BARN, RUNESKRIFT')(
    banner('TABELL: TOPPEN, ALLE STØRRELSER') +
    sizetable(['Str.', 'Standardomgang', 'Ekstra', 'Totalt masker', 'Toppdiam. (cm)'],
              list(zip(SIZES, STD_ROUND, EXTRA, FINAL, TOPPDIAM)))
, 7))

# ============ SIDE 8: DEL 2 SIDENE ============
pages.append(make_page('LME HEKLEOPPSKRIFT&nbsp;&nbsp;|&nbsp;&nbsp;BØTTEHATTER BARN, RUNESKRIFT')(
    banner('DEL 2: SIDENE') +
    steps([
        'Når toppen har riktig maskeantall, hekler du rett ned uten flere økninger. Behold maskeantallet '
        'fra tabellen på forrige side gjennom hele denne delen, det er nå sidene på hatten.',
        'Hekle antall omganger oppgitt i kolonnen &laquo;Sideomg.&raquo; i tabellen under, i hovedfargen. '
        'Ikke tenk på bokstavene ennå, de hekler du på overflaten til slutt, se Del 3 på neste side.',
    ]) +
    tealp('TABELL: SIDENE') +
    sizetable(['Str.', 'Sideomg.', 'Sidenes høyde (cm)'], list(zip(SIZES, SIDEOMG, SIDE_CM))) +
    cream('<p class="creamtitle">Bokstavene hekles på midt i sidenes høyde til slutt, se tabellen på neste '
          'side for nøyaktig plassering.</p>')
, 8))

# ============ SIDE 9: DEL 3 HEKLE BOKSTAVENE PÅ ============
pages.append(make_page('LME HEKLEOPPSKRIFT&nbsp;&nbsp;|&nbsp;&nbsp;BØTTEHATTER BARN, RUNESKRIFT')(
    banner('DEL 3: HEKLE BOKSTAVENE PÅ') +
    '<p>Sidene er nå ferdig heklet, helt ensfarget. Bokstavene hekler du rett på den røde flaten med hvit '
    'tråd, så de blir opphøyde, akkurat som på den voksne runehatten. Du kan gjøre det på to måter, velg '
    'den du liker best.</p>' +
    tealp('MÅTE 1: OVERFLATE-HEKLING, ANBEFALT') +
    card(steps([
        'Hold den hvite tråden på innsiden av hatten. Stikk heklenålen gjennom hatten fra utsiden, der '
        'bokstaven skal begynne, og hent opp en løkke hvit.',
        'Stikk nålen inn litt lenger langs streken, hent opp en ny løkke og trekk den gjennom løkka som alt '
        'er på nålen. Det er én kjedemaske på overflaten.',
        'Fortsett kjedemaske etter kjedemaske langs alle strekene i bokstaven, følg malen to sider frem. '
        'Hold jevn avstand, ikke stram.',
        'Fest tråden på innsiden når bokstaven er ferdig, og gå videre til neste bokstav.',
    ])) +
    tealp('MÅTE 2: HEKLE EN SNOR OG SY DEN PÅ') +
    card('<p>Hekle en lang luftmaskekjede i hvitt og hekle en omgang kjedemasker tilbake langs den, så du '
         'får en fast snor. Form snoren til hver bokstav etter malen og sy den fast på hatten med hvit '
         'tråd og stoppenålen. Da blir bokstavene tydelige og opphøyde.</p>')
, 9))

# ============ SIDE 10: STØRRELSE OG PLASSERING ============
pages.append(make_page('LME HEKLEOPPSKRIFT&nbsp;&nbsp;|&nbsp;&nbsp;BØTTEHATTER BARN, RUNESKRIFT')(
    banner('STØRRELSE OG PLASSERING, ALLE STØRRELSER') +
    sizetable(['Str.', 'Bokstavhøyde (cm)', 'Margin over/under (cm)'],
              list(zip(SIZES, LETTER_H, LETTER_MARG))) +
    cream('<p class="creamtitle">Tips: tegn bokstavene lett med et vannløselig tusjmerke eller sett '
          'knappenåler først, så treffer du formen.</p>')
, 10))

# ============ SIDE 11: BOKSTAVMALEN + FLAGGET ============
pages.append(make_page('LME HEKLEOPPSKRIFT&nbsp;&nbsp;|&nbsp;&nbsp;BØTTEHATTER BARN, RUNESKRIFT')(
    banner('BOKSTAVMALEN OG FLAGGET') +
    '<p>Her er bokstavene i runestil. Hekle dem på i én sammenhengende linje, sentrert midt foran, med '
    'bunnen av bokstavene i midten av sidenes høyde (se tabellen på forrige side).</p>' +
    '<p style="background:#fdf9e3;border:2px solid #df5f93;border-radius:12px;padding:2.5mm 5mm;'
    'font-weight:600;color:#3f3f3f;">Malen vises opp ned, fordi hatten hekles ovenfra og ned. Følg '
    'bokstavene slik de står her, så kommer de riktig vei på den ferdige hatten.</p>' +
    pink('NORGE') +
    card('<div class="stripwrap" style="transform:rotate(180deg);text-align:center">' + runeword('NORGE', box=44) + '</div>') +
    pink('NORWAY') +
    card('<div class="stripwrap" style="transform:rotate(180deg);text-align:center">' + runeword('NORWAY', box=40) + '</div>') +
    tealp('FLAGGET PÅ TOPPEN') +
    '<div class="flagbig">' + mini_flag(90) + '</div>' +
    card(ul([
        'Finn midten av toppen der den magiske ringen var. Lag et hvitt kors med overflate-hekling eller en '
        'sydd snor: en arm framover, en bakover og en til hver side.',
        'Lag så et blått kors oppå midten av det hvite, litt smalere, så det hvite lyser rundt det blå.',
        'Fest alle tråder godt på innsiden.',
    ]))
, 11))

# ============ SIDE 12: DEL 4 BREMMEN ============
pages.append(make_page('LME HEKLEOPPSKRIFT&nbsp;&nbsp;|&nbsp;&nbsp;BØTTEHATTER BARN, RUNESKRIFT')(
    banner('DEL 4: BREMMEN') +
    steps([
        'Bytt til hvitt (eller behold rødt om du vil ha en ensfarget brem).',
        'Hekle &eacute;n omgang uten økning i den nye fargen.',
        'Finn kolonnen &laquo;Øk på omg.&raquo; i tabellen på neste side. På hver av disse omgangnumrene '
        '(talt fra starten av bremmen) fordeler du antall økninger fra kolonnen &laquo;Økn. hver gang&raquo; '
        'jevnt utover omgangen. På omgangene mellom økningene hekler du &eacute;n vanlig fm i hver maske.',
        'Fortsett til bremmen har heklet i antall omganger fra kolonnen &laquo;Bremomg.&raquo;. '
        'Sluttresultatet blir omtrent tallet i kolonnen &laquo;Ca. slutt&raquo;.',
    ])
, 12))

# ============ SIDE 13: TABELL BREMMEN ============
pages.append(make_page('LME HEKLEOPPSKRIFT&nbsp;&nbsp;|&nbsp;&nbsp;BØTTEHATTER BARN, RUNESKRIFT')(
    banner('TABELL: BREMMEN, ALLE STØRRELSER') +
    sizetable(['Str.', 'Bremomg.', 'Øk på omg.', 'Økn. hver gang', 'Ca. slutt (m)'],
              list(zip(SIZES, BREMOMG, OK_PA, OKN_HVER, CA_SLUTT))) +
    pink('BØLGET AVSLUTNING') +
    card('<p>For en rolig bølge: avslutt med kjedemasker eller krepsemasker. For en tydeligere bølge: '
         '*3 fm i neste maske, 1 fm, hopp over 2 masker*, gjenta rundt. På de minste størrelsene (50&ndash;'
         '68) anbefales den rolige avslutningen, slik at bremmen ikke blir tung foran ansiktet.</p>')
, 13))

# ============ SIDE 14: STELL OG SISTE SJEKK ============
pages.append(make_page('LME HEKLEOPPSKRIFT&nbsp;&nbsp;|&nbsp;&nbsp;BØTTEHATTER BARN, RUNESKRIFT')(
    banner('STELL OG SISTE SJEKK') +
    tealp('AVSLUTNING') +
    card('<p>Klipp av tråden med god margin og fest den godt på innsiden. Fest alle løse tråder, spesielt '
         'ved bokstavene og flagget.</p>') +
    tealp('STELL') +
    card('<p>Vask etter garnets anbefaling, ofte 30&deg;C på skånsomt program i vaskepose, eller for hånd. '
         'Ikke bruk tørketrommel. Form hatten over en bolle eller et glass i riktig størrelse og la den '
         'tørke flatt eller på formen.</p>') +
    pink('SJEKKLISTE') +
    card(check([
        'Hodemålet er kontrollert, ikke bare alder',
        'Prøvelappen stemmer med 14 fm x 16 omganger på 10 cm',
        'Toppens diameter stemmer med tabellen på side 7',
        'Bokstavene er heklet på midt foran, sentrert',
        'Det lille flagget sitter på toppen',
        'Bremmen er heklet i angitt antall omganger og har fasongen fra tabellen',
    ])) +
    '<div class="congrats">Gratulerer, du har heklet din egen barnebøttehatt med runeskrift!</div>' +
    byline('Renate Dahl') +
    '<p class="copyright">&copy; 2026 Little Montessori Explorers. Oppskriften er kun til personlig '
    'bruk. Oppskriften og malene kan ikke kopieres, deles, videreselges eller publiseres. '
    'Ferdige produkter kan selges i liten skala med kreditering til Little Montessori Explorers.</p>' +
    '<p style="font-size:11pt;color:#c0392b;text-align:center;margin-top:2mm;">Hatten er et plagg for '
    'våken bruk under tilsyn. Skal ikke brukes under søvn eller i vogn uten oppsyn.</p>'
, 14))

pages_no = pages

# ===========================================================================
# ENGELSK VERSJON
# ===========================================================================
pages = []
page = make_page('LME CROCHET PATTERN&nbsp;&nbsp;|&nbsp;&nbsp;KIDS BUCKET HATS, RUNE LETTERS', 'LME CROCHET')

EN_AGE = ["0-1 mo", "1-2 mo", "2-4 mo", "4-6 mo", "6-9 mo", "9-12 mo", "12-18 mo", "18-24 mo", "2-3 yr", "3-4 yr"]

# ============ PAGE 1: COVER ============
pages.append(page('''
<div class="coverimg coverrune">''' + runeword('NORWAY', box=48) + '''</div>
<div class="covertag">LME CROCHET PATTERN</div>
<div class="coverbanner">
  <h1 class="covertitle">BUCKET HATS FOR BABY<br>AND CHILD, RUNE LETTERS</h1>
</div>
<div class="subpill">NORGE &middot; NORWAY &middot; SIZE 50&ndash;170</div>
''' + card('<p class="center">The same bucket hat as the adult NORGE rune hat pattern, crocheted in single '
      'crochet and graded completely from scratch into twenty-one baby, child and teen sizes, 50 to 170. You crochet the '
      'whole hat in one colour, then crochet &ldquo;NORGE&rdquo; (or &ldquo;NORWAY&rdquo;) on at the end in '
      'readable rune-style letters, plus a small Norwegian flag on the top. This pattern is complete on its '
      'own, you do not need any other LME pattern to crochet it.</p>') + '''
''' + byline('By Renate Dahl') + '''
''' + tip('Read the whole pattern once before you start. Always crochet a gauge swatch first, see page 4.') + '''
''', 1))

# ============ PAGE 2: BEFORE YOU START ============
pages.append(page(
    banner('BEFORE YOU START') +
    '<p>The bucket hat is crocheted in a spiral (not joined rounds) in single crochet, from the top down, '
    'in a single colour throughout. You start with a rounded crown that grows from a small ring, then the '
    'sides straight down, and finally a brim that flares out and waves. Right at the end you crochet the '
    'letters and the flag onto the surface. This pattern covers two words, pick the one you want to '
    'make:</p>' +
    card(ul([
        '<b>NORGE</b>: the word in rune-style letters, across the forehead',
        '<b>NORWAY</b>: the same, but with the English name',
    ])) +
    tealp('WHAT YOU LEARN') +
    card(ul([
        'To crochet in a spiral from a magic ring',
        'To increase evenly to crochet a flat, rounded top',
        'To crochet surface crochet: slip stitches worked on top of the hat, making raised letters',
        'To crochet a flared, wavy brim with an increase round',
    ])) +
    pink('HOW HARD IS IT?') +
    card('<p>Beginner friendly. You should be able to single crochet, know a magic ring and crochet slip '
         'stitches. The hat itself is crocheted in just one colour, the letters go on afterwards with the '
         'hook right on the surface, and every step is spelled out in this pattern.</p>') +
    cream('<p class="creamtitle">Use a stitch marker (a safety pin or a length of thread in another colour '
          'works fine) in the first stitch of every round, so you do not lose count in the spiral.</p>')
, 2))

# ============ PAGE 3: SIZES AND FIT ============
pages.append(page(
    banner('SIZES AND GETTING THE FIT RIGHT') +
    '<p>The clothing size is only a guide. Always measure around the child&rsquo;s head, above the ears and '
    'eyebrows. Go by the head measurement if it and the clothing size point to different sizes.</p>' +
    sizetable(['Size', 'Approx. age', 'Head (cm)'], list(zip(SIZES, EN_AGE, HEAD))) +
    tealp('SAFE USE FOR THE YOUNGEST') +
    card('<p>The hat is a garment for supervised, awake use. It should not be used during sleep, in a cot, '
         'in a pram unattended, or if the brim covers the eyes, nose or mouth. Always check that no loose '
         'threads on the inside can catch on little fingers.</p>') +
    cream('<p class="creamtitle">Children grow at different rates. The actual head measurement always beats '
          'age, measure again whenever you are unsure.</p>')
, 3))

# ============ PAGE 4: WHAT YOU NEED ============
pages.append(page(
    banner('WHAT YOU NEED') +
    tealp('YARN') +
    card('<p>A smooth cotton yarn (aran weight) that gives 14 single crochet x 16 rounds = 10 x 10 cm, '
         'crocheted in a spiral. Reynolds Saucy, Rico Design Creative Cotton Aran and Hobbii Amigo are all '
         'good choices, in red and white (or whichever colour you want the letters in).</p>'
         '<table class="t"><tr><th>Colour</th><th>Use</th></tr>'
         f'<tr><td><span class="dot" style="background:{RED}"></span> Red</td><td>main colour, whole hat</td></tr>'
         f'<tr><td><span class="dot" style="background:{WHITE};border-color:#ccc;"></span> White</td><td>the letters and the flag</td></tr>'
         f'<tr><td><span class="dot" style="background:{NAVY}"></span> Navy</td><td>the small cross in the flag</td></tr></table>'
         '<p class="small">Have plenty of red main colour (almost the whole hat is crocheted in red) and a '
         'little white and navy, they are only used for the letters and the flag.</p>') +
    pink('HOOK AND KIT') +
    card(ul([
        'A hook that gives the stated gauge, often 3.5&ndash;4 mm for an aran yarn',
        '<b>Tapestry needle with a blunt tip</b> if you sew the letters on as a cord (see page 8)',
        'Scissors and tape measure',
        'Stitch marker for the first stitch of every round',
    ])) +
    cream('<p class="creamtitle">If you crochet tightly, try a bigger hook. If you crochet loosely, try a '
          'smaller hook. The target is always 14 sc over 10 cm.</p>')
, 4))

# ============ PAGE 5: GAUGE AND GLOSSARY ============
pages.append(page(
    banner('GAUGE, THE IMPORTANT KEY') +
    tealp('CROCHET A SWATCH FIRST') +
    card('<p>Crochet a square at least 12 x 12 cm in single crochet with the main colour. Wash and dry it '
         'the way you plan to treat the hat, then measure across the middle.</p>' +
         ul([
             'More than 14 sc over 10 cm: try a bigger hook.',
             'Fewer than 14 sc over 10 cm: try a smaller hook.',
             'Exactly 14 sc: use your hook and get going.',
         ])) +
    pink('GLOSSARY') +
    card('<table class="t tl"><tr><th>Term</th><th>Means</th></tr>'
         '<tr><td><b>sc</b></td><td>single crochet</td></tr>'
         '<tr><td><b>rnd</b></td><td>round, one whole lap around</td></tr>'
         '<tr><td><b>inc</b></td><td>increase, 2 sc in the same stitch</td></tr>'
         '<tr><td><b>sl st</b></td><td>slip stitch</td></tr>'
         '<tr><td><b>MC</b></td><td>main colour (red)</td></tr>'
         '<tr><td><b>spiral</b></td><td>the rounds are crocheted in one continuous round, without a slip '
         'stitch join, follow the stitch marker</td></tr>'
         '<tr><td><b>surface crochet</b></td><td>slip stitches worked on top of the finished hat, making '
         'raised letters</td></tr></table>')
, 5))

# ============ PAGE 6: PART 1 THE TOP ============
pages.append(page(
    banner('PART 1: THE TOP') +
    steps([
        'Crochet 6 sc into a magic ring in red main colour. Pull the ring tight. Place a stitch marker in '
        'the first stitch, move the marker up one stitch for every new round. From now on everything is '
        'crocheted in a spiral, with no slip stitch join.',
        'Rnd 2: inc (2 sc) in every stitch around = 12 stitches.',
        'Rnd 3: *inc, 1 sc*, repeat around = 18 stitches.',
        'Rnd 4: *inc, 1 sc, 1 sc*, repeat around = 24 stitches. Continue the same way: each new round '
        'increases 6 stitches evenly spaced, with one more plain sc between each increase than the round '
        'before.',
        'Find the number for your size in the &laquo;Standard round&raquo; column in the table on the next '
        'page. Keep increasing this way until you have crocheted exactly that round.',
        'If your size has a number other than 0 in the &laquo;Extra&raquo; column, crochet one more round: '
        'spread the given number of increases evenly around the round (for example every sixth/seventh '
        'stitch), the rest plain sc. That lands you exactly on the &laquo;Total&raquo; column number.',
    ]) +
    cream('<p class="creamtitle">Check the diameter against the table on the next page, not just the '
          'stitch count. If you are more than 0.5 cm off, adjust your hook size before continuing.</p>')
, 6))

pages.append(page(
    banner('TABLE: THE TOP, ALL SIZES') +
    sizetable(['Size', 'Standard round', 'Extra', 'Total stitches', 'Top diam. (cm)'],
              list(zip(SIZES, STD_ROUND, EXTRA, FINAL, TOPPDIAM)))
, 7))

# ============ PAGE 8: PART 2 THE SIDES ============
pages.append(page(
    banner('PART 2: THE SIDES') +
    steps([
        'When the top has the right stitch count, crochet straight down with no more increases. Keep the '
        'stitch count from the table on the previous page throughout this part, this is now the sides of '
        'the hat.',
        'Crochet the number of rounds given in the &laquo;Side rounds&raquo; column in the table below, in '
        'the main colour. Do not worry about the letters yet, you crochet those onto the surface at the '
        'end, see Part 3 on the next page.',
    ]) +
    tealp('TABLE: THE SIDES') +
    sizetable(['Size', 'Side rounds', 'Height of sides (cm)'], list(zip(SIZES, SIDEOMG, SIDE_CM))) +
    cream('<p class="creamtitle">The letters are crocheted onto the surface in the middle of the sides at '
          'the end, see the table on the next page for the exact placement.</p>')
, 8))

# ============ PAGE 9: PART 3 CROCHET THE LETTERS ON ============
pages.append(page(
    banner('PART 3: CROCHET THE LETTERS ON') +
    '<p>The sides are now fully crocheted, all one colour. You crochet the letters right onto the red '
    'surface with white yarn, so they stand up, just like on the adult rune hat. You can do it in two ways, '
    'pick the one you like best.</p>' +
    tealp('WAY 1: SURFACE CROCHET, RECOMMENDED') +
    card(steps([
        'Hold the white yarn on the inside of the hat. Put the hook through the hat from the outside, '
        'where the letter is to begin, and pull up a white loop.',
        'Put the hook in a little further along the line, pull up a new loop and draw it through the loop '
        'already on the hook. That is one slip stitch on the surface.',
        'Continue slip stitch after slip stitch along all the lines of the letter, following the template '
        'on the next page. Keep the spacing even, do not pull tight.',
        'Fasten the yarn on the inside when the letter is done, and move on to the next letter.',
    ])) +
    tealp('WAY 2: CROCHET A CORD AND SEW IT ON') +
    card('<p>Crochet a long chain in white and work a row of slip stitches back along it, so you get a firm '
         'cord. Shape the cord into each letter following the template and sew it onto the hat with white '
         'yarn and the tapestry needle. That makes the letters clear and raised.</p>')
, 9))

# ============ PAGE 10: SIZE AND PLACEMENT ============
pages.append(page(
    banner('SIZE AND PLACEMENT, ALL SIZES') +
    sizetable(['Size', 'Letter height (cm)', 'Margin above/below (cm)'],
              list(zip(SIZES, LETTER_H, LETTER_MARG))) +
    cream('<p class="creamtitle">Tip: draw the letters lightly with a water-soluble marker or place pins '
          'first, so you hit the shape.</p>')
, 10))

# ============ PAGE 11: THE LETTER TEMPLATE + FLAG ============
pages.append(page(
    banner('THE LETTER TEMPLATE AND THE FLAG') +
    '<p>Here are the letters in rune style. Crochet them on in one continuous line, centred at the front, '
    'with the bottom of the letters in the middle of the sides&rsquo; height (see the table on the previous '
    'page).</p>' +
    '<p style="background:#fdf9e3;border:2px solid #df5f93;border-radius:12px;padding:2.5mm 5mm;'
    'font-weight:600;color:#3f3f3f;">The template is shown upside down, because the hat is crocheted from '
    'the top down. Follow the letters as they appear here, and they will come out the right way on the '
    'finished hat.</p>' +
    pink('NORGE') +
    card('<div class="stripwrap" style="transform:rotate(180deg);text-align:center">' + runeword('NORGE', box=44) + '</div>') +
    pink('NORWAY') +
    card('<div class="stripwrap" style="transform:rotate(180deg);text-align:center">' + runeword('NORWAY', box=40) + '</div>') +
    tealp('THE FLAG ON THE TOP') +
    '<div class="flagbig">' + mini_flag(90) + '</div>' +
    card(ul([
        'Find the middle of the top where the magic ring was. Make a white cross with surface crochet or a '
        'sewn cord: one arm forward, one back and one to each side.',
        'Then make a blue cross on top of the middle of the white, a little narrower, so the white shows '
        'around the blue.',
        'Fasten all ends well on the inside.',
    ]))
, 11))

# ============ PAGE 12: PART 4 THE BRIM ============
pages.append(page(
    banner('PART 4: THE BRIM') +
    steps([
        'Switch to white (or keep red if you want a solid-colour brim).',
        'Crochet one round with no increase in the new colour.',
        'Find the &laquo;Increase on rnd&raquo; column in the table on the next page. On each of these round '
        'numbers (counted from the start of the brim) you spread the number of increases from the &laquo;'
        'Increases each time&raquo; column evenly around the round. On the rounds in between you crochet one '
        'plain sc in every stitch.',
        'Continue until the brim has been crocheted for the number of rounds in the &laquo;Brim rnds&raquo; '
        'column. The final result will be about the number in the &laquo;Approx. finish&raquo; column.',
    ])
, 12))

# ============ PAGE 13: TABLE THE BRIM ============
pages.append(page(
    banner('TABLE: THE BRIM, ALL SIZES') +
    sizetable(['Size', 'Brim rnds', 'Increase on rnd', 'Increases each time', 'Approx. finish (st)'],
              list(zip(SIZES, BREMOMG, OK_PA, OKN_HVER, CA_SLUTT))) +
    pink('THE WAVY FINISH') +
    card('<p>For a gentle wave: finish with slip stitches or reverse single crochet (crab stitch). For a '
         'more pronounced wave: *3 sc in the next stitch, 1 sc, skip 2 stitches*, repeat around. For the '
         'smallest sizes (50&ndash;68) the gentle finish is recommended, so the brim does not hang heavy in '
         'front of the face.</p>')
, 13))

# ============ PAGE 14: CARE AND FINAL CHECK ============
pages.append(page(
    banner('CARE AND FINAL CHECK') +
    tealp('FINISHING') +
    card('<p>Cut the yarn leaving a generous tail and fasten it well on the inside. Weave in all loose '
         'ends, especially around the letters and the flag.</p>') +
    tealp('CARE') +
    card('<p>Wash following the yarn&rsquo;s recommendation, often 30&deg;C on a gentle cycle in a wash bag, '
         'or by hand. Do not tumble dry. Shape the hat over a bowl or glass of the right size and let it '
         'dry flat or on the form.</p>') +
    pink('CHECKLIST') +
    card(check([
        'The head measurement has been checked, not just age',
        'The swatch matches 14 sc x 16 rounds over 10 cm',
        'The top&rsquo;s diameter matches the table on page 7',
        'The letters are crocheted on at centre front, centred',
        'The little flag sits on the top',
        'The brim is crocheted for the stated number of rounds and has the shape from the table',
    ])) +
    '<div class="congrats">Congratulations, you have crocheted your very own kids&rsquo; rune-letter bucket hat!</div>' +
    byline('Renate Dahl') +
    '<p class="copyright">&copy; 2026 Little Montessori Explorers. This pattern is for personal use '
    'only. The pattern and templates may not be copied, shared, resold or published. Finished items may '
    'be sold on a small scale with credit to Little Montessori Explorers.</p>' +
    '<p style="font-size:11pt;color:#c0392b;text-align:center;margin-top:2mm;">The hat is a garment for '
    'supervised, awake use. Do not use during sleep or in a pram unattended.</p>'
, 14))

pages_en = pages

# ---------- CSS ----------
css = f'''
@font-face {{ font-family:'Norse'; src:url('fonts/Norse-Bold.otf'); font-weight:700; }}
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
.banner h1 {{ font-family:var(--font-head); font-weight:800; font-size:19pt; color:{INK};
  letter-spacing:.4px; text-transform:uppercase; }}
.pillwrap {{ text-align:center; margin:2.4mm 0 1.6mm; }}
.pill {{ display:inline-block; border-radius:999px; padding:1.5mm 7mm;
  font-family:var(--font-head); font-weight:700; font-size:13pt; color:#fff;
  letter-spacing:.4px; text-transform:uppercase; }}
.pinkpill {{ background:{PINK}; }}
.tealpill {{ background:{TEAL}; }}
.card {{ background:rgba(255,255,255,.93); border:2px solid #f2bfd4; border-radius:16px;
  padding:2.2mm 5mm; margin:0 0 2mm; }}
.cream {{ background:{CREAM}; border:2px solid #f2bfd4; border-radius:16px;
  padding:2.2mm 5mm; margin:2mm 0; text-align:center; }}
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
ol.steps li {{ display:flex; gap:2.6mm; align-items:flex-start; background:rgba(255,255,255,.93);
  border:2px solid #f2bfd4; border-radius:14px; padding:1.6mm 4mm; margin-bottom:1.1mm; }}
ol.steps li div {{ font-size:13.5pt; line-height:1.2; }}
.snum {{ flex:0 0 auto; width:7.5mm; height:7.5mm; border-radius:50%; background:{PINK}; color:#fff;
  font-family:var(--font-head); font-weight:700; font-size:13pt; display:flex;
  align-items:center; justify-content:center; margin-top:.5mm; }}
table.t {{ width:100%; border-collapse:collapse; margin:1mm 0; }}
table.t th {{ font-family:var(--font-head); font-weight:700; font-size:12pt; color:{PINK};
  text-align:left; padding:.8mm 2mm; border-bottom:2px solid #f2bfd4; }}
table.t td {{ font-size:12.5pt; padding:.7mm 2mm; border-bottom:1px solid #f6dbe7; line-height:1.16; }}
table.tl td:first-child {{ white-space:nowrap; }}
table.sz th, table.sz td {{ text-align:center; }}
table.sz td:first-child, table.sz th:first-child {{ font-weight:700; }}
.dot {{ display:inline-block; width:3.5mm; height:3.5mm; border-radius:50%; vertical-align:-0.5mm;
  margin-right:1.5mm; border:1px solid rgba(0,0,0,.15); }}

.coverrune {{ text-align:center; margin:4mm 0; }}
.flagbig {{ text-align:center; margin:3mm 0; }}
.stripwrap {{ margin:1mm 0 2mm; }}
.coverimg {{ text-align:center; margin:2.4mm 0 2.4mm; }}
.coverimg img {{ width:82mm; border-radius:14px; border:3mm solid #fff; }}
.covertag {{ text-align:center; font-family:var(--font-head); font-size:10.5pt; letter-spacing:2.3px;
  color:#8a8a8a; margin:1mm 0 2mm; }}
.coverbanner {{ display:flex; align-items:center; justify-content:center; gap:5mm;
  background:#f5efb2; border-radius:16px; padding:2.6mm 6mm; }}
.covertitle {{ font-family:var(--font-head); font-weight:800; font-size:23pt; color:{INK};
  letter-spacing:.5px; text-align:center; line-height:1.18; }}
.subpill {{ margin:2.6mm auto; width:fit-content; background:#fdf9e3; border:2.5px solid {INK};
  border-radius:999px; padding:1.4mm 7mm; font-family:var(--font-head); font-weight:700;
  font-size:12pt; color:{INK}; letter-spacing:.4px; text-align:center; }}
.byline {{ text-align:center; margin-top:1.2mm; }}
.byline .logo {{ width:26mm; height:26mm; object-fit:contain; margin-bottom:1mm; }}
.by1 {{ font-family:var(--font-head); font-weight:700; font-size:19pt; color:{CERISE}; }}
.by2 {{ font-size:14pt; color:#8a8a8a; margin-top:1mm; }}
.by3 {{ font-family:var(--font-head); font-weight:600; font-size:13pt; color:{CERISE}; margin-top:.7mm; }}
.notecard {{ display:flex; gap:3mm; align-items:center; background:rgba(255,255,255,.8);
  border-radius:12px; padding:2.2mm 5mm; margin-top:2.4mm; }}
.notecard p {{ font-size:12pt; color:#777; margin:0; }}
.noteemo {{ font-size:15pt; }}

.chartrow {{ display:flex; gap:6mm; justify-content:center; align-items:flex-end;
  flex-wrap:wrap; margin:1mm 0 1.8mm; }}
.chartbox {{ text-align:center; }}
.chartttl {{ font-family:var(--font-head); font-weight:700; font-size:11pt; color:{PINK};
  margin-bottom:1.1mm; letter-spacing:.3px; }}
.congrats {{ font-family:var(--font-head); font-weight:800; font-size:17pt; color:{INK};
  text-align:center; margin:1.5mm 0 1mm; }}
.copyright {{ font-size:9.5pt; color:#9a9a9a; text-align:center; margin-top:1.5mm; line-height:1.25; }}
'''

doc_no = f'''<!DOCTYPE html>
<html lang="no"><head><meta charset="utf-8">
<title>Bøttehatter til baby og barn, runeskrift, LME hekleoppskrift</title>
<style>{css}</style></head>
<body>{''.join(pages_no)}</body></html>'''

doc_en = f'''<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8">
<title>Bucket hats for baby and child, rune letters, LME crochet pattern</title>
<style>{css}</style></head>
<body>{''.join(pages_en)}</body></html>'''

(BASE / 'barn_hekle_rune_no.html').write_text(doc_no, encoding='utf-8')
(BASE / 'barn_hekle_rune_en.html').write_text(doc_en, encoding='utf-8')
print('OK', len(doc_no), 'tegn (no),', len(doc_en), 'tegn (en)')
