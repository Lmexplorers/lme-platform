# -*- coding: utf-8 -*-
"""
Felles byggeklosser for de fem Jordbærdrøm-oppskriftene.

Alt som er likt i alle fem heftene ligger her: fargene, blad- og
frødiagrammet, garn- og fasthetssidene, størrelsestabellen, teststrikkarkets
tekst, monteringssjekklisten og opphavsrettsteksten. Hver build_*.py legger
bare til sine egne, plaggspesifikke sider.

Selve sidemalen, CSS-en og fontene kommer fra det delte LME-byggesettet i
../../hekle/_shared/lme_pattern_kit.py, samme som Woodland Dreams-serien.

Diagrammene tegnes som SVG rett i koden, ikke som bildefiler. Da kan de ikke
komme i utakt med masketallene, de skalerer skarpt i PDF-en, og de veier
ingenting.
"""
import json
import pathlib
import sys

BASE = pathlib.Path(__file__).parent
sys.path.insert(0, str(BASE.parent.parent / 'hekle' / '_shared'))
import lme_pattern_kit as kit  # noqa: E402
from lme_pattern_kit import banner, rosep, sagep, card, cream, cme, ul  # noqa: E402,F401

DATA = json.loads(BASE.joinpath('sizes.json').read_text(encoding='utf-8'))
PLAGG = DATA['plagg']
VOTTER = DATA['votter']
TOFLER = DATA['tofler']
LUER = DATA['luer']
SOKKER = DATA['sokker']

# ---------------------------------------------------------------------- FARGER
# Jordbærdrøm bruker LME-paletten, men med jordbærrosa og bladgrønn som de
# to garnfargene i selve mønsteret.
ROSA = '#E48FA6'      # jordbærrosa, hovedfargen
GRONN = '#8FA681'     # bladgrønn
KREM = '#FBF3E8'      # kremhvit, frøene
KANT = '#c9b3a0'

VERSJON = 'Teststrikkversjon 1.0'
VERSJON_EN = 'Test knit version 1.0'
AAR = '2026'

# ------------------------------------------------------------------ DIAGRAMMER
# Bladrapporten, 8 masker x 10 omganger. Leses nedenfra og opp, fra høyre mot
# venstre, akkurat som arbeidet strikkes. G = bladgrønn, R = jordbærrosa.
# Omgang 1 nederst er den som strikkes først, rett etter økingene, og er helt
# grønn. Bladet smalner nedover mot den rosa bolen, derfor blir omgangene
# mer og mer rosa oppover i diagrammet.
BLAD = [
    'RRRRRRRR',   # omgang 10, siste
    'RRRGGRRR',
    'RRRGGRRR',
    'RRGGGGRR',
    'RRGGGGRR',
    'RGGGGGGR',
    'RGGGGGGR',
    'GGGGGGGG',
    'GGGGGGGG',
    'GGGGGGGG',   # omgang 1, første
]

# Den lille jordbærhetten, 4 masker x 4 omganger, til votter og tøfler.
# Det store bladdiagrammet er 8 masker og 10 omganger, altså 3,8 cm bredt og
# 3,6 cm høyt. På en vott som bare er 11,4 cm rundt blir det en hette som
# dekker nesten hele håndbaken, og designbildene viser noe helt annet: små,
# korte spisser. Denne rapporten er halvparten så bred og under halvparten så
# høy, og går opp i alle vott- og tøffelstørrelsene (24, 32, 40 og 48 masker).
SMABLAD = [
    'RRRR',   # omgang 4, siste
    'RGGR',
    'RGGR',
    'GGGG',   # omgang 1, første
]

# Den samme hetten snudd, til luen. Luen strikkes nedenfra og opp, og der
# ligger det grønne OVER det rosa, motsatt av votter, tøfler og sokker. Da må
# omgangene komme i motsatt rekkefølge: omgang 1 er den siste rosa omgangen,
# spissene vokser opp av det rosa, og omgang 4 er helt grønn og går rett over
# i den grønne toppen. Samme hette, samme antall masker, bare snudd.
SMABLAD_SNUDD = [
    'GGGG',   # omgang 4, siste
    'RGGR',
    'RGGR',
    'RRRR',   # omgang 1, første
]

# Frørapporten, 8 masker. To omganger, A og B, med 2-3 rosa omganger mellom.
# K = kremhvit, den ene innstrikkede masken som blir et jordbærfrø.
FRO_A = 'RRRKRRRR'    # *3 rosa, 1 kremhvit, 4 rosa*
FRO_B = 'RRRRRRRK'    # *7 rosa, 1 kremhvit*

FARGE = {'R': ROSA, 'G': GRONN, 'K': KREM}


def _rute(x, y, s, farge):
    return (f'<rect x="{x}" y="{y}" width="{s}" height="{s}" '
            f'fill="{farge}" stroke="{KANT}" stroke-width="0.7"/>')


def diagram(rader, tall_no, hoyre_tekst, bredde_mm=62, vis_omgang=True):
    """Tegner et mønsterdiagram. rader[0] er den øverste omgangen.

    bredde_mm er diagrammets ferdige bredde på arket. Rutene skaleres etter
    den, slik at et 10-omgangers bladdiagram og et 1-omgangs frødiagram får
    samme rutestørrelse og kan stå ved siden av hverandre."""
    s = 7.6
    n = len(rader[0])
    marg_v, marg_h, marg_t, marg_b = 15, 22, 11, 14
    b = marg_v + n * s + marg_h
    h = marg_t + len(rader) * s + marg_b
    ut = [f'<svg viewBox="0 0 {b} {h}" width="{bredde_mm}mm" '
          f'xmlns="http://www.w3.org/2000/svg">']
    for ri, rad in enumerate(rader):
        y = marg_t + ri * s
        for ci, c in enumerate(rad):
            ut.append(_rute(marg_v + ci * s, y, s, FARGE[c]))
        if vis_omgang:
            nr = len(rader) - ri
            ut.append(f'<text x="{marg_v - 2.5}" y="{y + s * 0.72}" font-size="4.4" '
                      f'text-anchor="end" fill="#8a8a8a">{nr}</text>')
    # Masketall langs bunnen, lest fra høyre mot venstre slik det strikkes.
    for ci in range(n):
        ut.append(f'<text x="{marg_v + ci * s + s / 2}" y="{marg_t + len(rader) * s + 6}" '
                  f'font-size="4.4" text-anchor="middle" fill="#8a8a8a">{n - ci}</text>')
    ut.append(f'<text x="{marg_v + n * s + 2}" y="{marg_t + 5}" font-size="4.6" '
              f'fill="#8a8a8a">{hoyre_tekst}</text>')
    ut.append('</svg>')
    return f'<div class="diag"><div class="diagtitle">{tall_no}</div>' + ''.join(ut) + '</div>'


def forklaring(lang):
    par = [(GRONN, {'no': 'bladgrønn', 'en': 'leaf green'}[lang]),
           (ROSA, {'no': 'jordbærrosa', 'en': 'strawberry pink'}[lang]),
           (KREM, {'no': 'kremhvit, ett frø', 'en': 'cream white, one seed'}[lang])]
    return '<p class="center small">' + ' &nbsp; '.join(
        f'<span class="dot" style="background:{f};border:1px solid {KANT}"></span>{t}'
        for f, t in par) + '</p>'


DIAG_CSS = f'''
.coverimg {{ text-align:center; margin:3mm 0 1mm; }}
.coverimg img {{ width:84mm; height:84mm; object-fit:cover; border-radius:14px;
  border:2.5mm solid #fff; box-shadow:0 2mm 6mm rgba(0,0,0,.10); }}
.diag {{ text-align:center; margin:2mm 0 3mm; }}
.diagtitle {{ font-family:var(--font-head); font-weight:700; font-size:10pt;
  color:{GRONN}; margin-bottom:1.5mm; }}
.diag svg {{ display:block; margin:0 auto; }}
.diagrow {{ display:flex; gap:6mm; justify-content:center; align-items:flex-start; }}
.diagrow .diag {{ margin:1mm 0 0; }}
table.t td.num {{ font-variant-numeric:tabular-nums; white-space:nowrap; }}
table.t tr.min td {{ background:#fdf1f4; }}
.strbar {{ display:flex; gap:2mm; justify-content:center; flex-wrap:wrap; margin:2.5mm 0 1mm; }}
.strbox {{ border:2px solid #ecd2c0; border-radius:10px; background:rgba(255,255,255,.9);
  padding:1.6mm 3.4mm; text-align:center; min-width:20mm; }}
.strbox b {{ font-family:var(--font-head); font-size:11pt; color:{ROSA}; display:block; }}
.strbox span {{ font-size:7.6pt; color:#8a8a8a; }}
.tk {{ background:#fdf1f4; border:2px solid {ROSA}; border-radius:16px; padding:4mm 6mm; margin:3mm 0; }}
.tk h3 {{ font-family:var(--font-head); font-weight:700; font-size:11pt; color:{ROSA}; margin-bottom:1.8mm; }}
.line {{ border-bottom:1.2px dashed #c9b3a0; height:4.6mm; margin:0.8mm 0 1.6mm; }}
.linelab {{ font-size:9pt; color:#7a7a7a; }}
.tkgrid {{ display:grid; grid-template-columns:1fr 1fr; gap:0 7mm; }}
'''


def tabell(head, rows, min_index=None):
    """Tabell der hver rad er en størrelse. min_index markerer minste størrelse."""
    h = '<tr><th>' + '</th><th>'.join(head) + '</th></tr>'
    body = []
    for i, r in enumerate(rows):
        klasse = ' class="min"' if min_index is not None and i == min_index else ''
        celler = ''.join(f'<td class="num">{c}</td>' for c in r[1:])
        body.append(f'<tr{klasse}><td class="num"><b>{r[0]}</b></td>{celler}</tr>')
    return '<table class="t">' + h + ''.join(body) + '</table>'


def str_head(lang):
    return {'no': 'Str', 'en': 'Size'}[lang]


def storrelsesbar(lang):
    return '<div class="strbar">' + ''.join(
        f'<div class="strbox"><b>{p["str_nr"]}</b>'
        f'<span>{p["tillegg_no" if lang == "no" else "tillegg_en"]}</span></div>'
        for p in PLAGG) + '</div>'


# ------------------------------------------------------------- FELLES SIDETEKST
def side_storrelser(lang, plaggnavn, malrader, malhead):
    """To sider: barnets mål på den første, plaggets ferdige mål på den andre.

    Med ni størrelser blir det ni rader i hver tabell, og de to tabellene får
    ikke plass på samme ark. Sidemalen klipper i stillhet det som ikke får
    plass, så de må deles. Returnerer en liste med to sidekropper.
    """
    t = {'no': dict(
        b1='STØRRELSER',
        b2='FERDIGE MÅL PÅ PLAGGET',
        lead=('Oppskriften er gradert i ni størrelser, fra 44 til 92, altså fra liten '
              'nyfødt til to år. Velg størrelse etter barnets brystmål, ikke etter '
              'alder. Aldersangivelsene er bare en pekepinn, og et barn som kom for '
              'tidlig følger sin egen kurve. Er du mellom to størrelser, velger du den '
              'største, siden et plagg som er litt for stort kan brukes lenger.'),
        p1='BARNETS MÅL', p2='SLIK LESER DU TABELLENE',
        khead=[str_head(lang), 'Passer til', 'Barnets brystmål', 'Romslighet'],
        note=('Alle tall i oppskriften er oppgitt i egne kolonner per størrelse. Finn din '
              'kolonne én gang, marker den med en penn, og les bare den videre.'),
        note2=('Målene under er plagget slik det skal være etter vask og flat tørking. '
               'Får du andre mål, er det som regel strikkefastheten det står på, ikke '
               'oppskriften.'))}
    t['en'] = dict(
        b1='SIZES',
        b2='FINISHED MEASUREMENTS',
        lead=('The pattern is graded in nine sizes, from 44 to 92, that is from small '
              'newborn to two years. Choose by the child\'s chest measurement, not by '
              'age. The ages are only a guide, and a baby born early follows its own '
              'curve. Between two sizes, take the larger one, since a garment that is '
              'slightly big lasts longer.'),
        p1='THE CHILD\'S MEASUREMENTS', p2='HOW TO READ THE TABLES',
        khead=[str_head(lang), 'Suits', 'Child chest', 'Ease'],
        note=('Every number in the pattern is given in its own column per size. Find your '
              'column once, mark it with a pen, and read only that one from there on.'),
        note2=('The measurements below are the garment as it should be after washing and '
               'drying flat. If you get different measurements, it is usually the gauge '
               'and not the pattern.'))
    tt = t[lang]
    krow = [[p['str_nr'], p['tillegg_no' if lang == 'no' else 'tillegg_en'],
             f"{p['kropp_bryst_cm']:.0f} cm".replace('.', ','),
             f"{round(p['bryst_ermelos_cm'] - p['kropp_bryst_cm'], 1)} cm".replace('.', ',')]
            for p in PLAGG]
    side_a = f"""
{banner(tt['b1'])}
<p>{tt['lead']}</p>
{rosep(tt['p1'])}
{card(tabell(tt['khead'], krow, min_index=0))}
{sagep(tt['p2'])}
{cme(tt['note'])}
"""
    side_b = f"""
{banner(tt['b2'])}
{card(tabell(malhead, malrader, min_index=0))}
{cme(tt['note2'])}
"""
    return [side_a, side_b]


def side_garn(lang, garnmengder, ekstra_rader):
    """Garn, pinner og fasthet. garnmengder = [[str, rosa, grønt, kremhvit], ...]."""
    t = {'no': dict(
        b='GARN, UTSTYR OG FASTHET', p1='GARN OG PINNER', p2='GARNMENGDE',
        p3='STRIKKEFASTHET',
        garn=('DROPS Merino Extra Fine, 50 g = ca. 105 m, i jordbærrosa, bladgrønn og en '
              'liten rest kremhvit. Garnmengden under er beregnet med god margin, og '
              'gjelder per størrelse.'),
        ghead=[str_head(lang), 'Rosa', 'Grønt', 'Kremhvit'],
        fasthet=('21 masker og 28 omganger glattstrikk = 10 x 10 cm på pinne 4 mm. Strikk '
                 'prøvelappen rundt, ikke frem og tilbake, og mål den etter vask og flat '
                 'tørking. Flere masker enn 21 betyr én pinne opp, færre betyr én ned. '
                 'Fastheten avgjør alle mål i oppskriften.'),
        ehead=['Utstyr', 'Til hva'])}
    t['en'] = dict(
        b='YARN, TOOLS AND GAUGE', p1='YARN AND NEEDLES', p2='YARN AMOUNT', p3='GAUGE',
        garn=('DROPS Merino Extra Fine, 50 g = approx. 105 m, in strawberry pink, leaf '
              'green and a small amount of cream white. The amounts below include a good '
              'margin, and are given per size.'),
        ghead=[str_head(lang), 'Pink', 'Green', 'Cream'],
        fasthet=('21 stitches and 28 rounds in stocking stitch = 10 x 10 cm on 4 mm '
                 'needles. Knit your swatch in the round, not flat, and measure it after '
                 'washing and drying flat. More than 21 stitches means one needle size up, '
                 'fewer means one down. The gauge decides every measurement here.'),
        ehead=['Tools', 'For what'])
    tt = t[lang]
    return f'''
{banner(tt['b'])}
{rosep(tt['p1'])}
{card('<p>' + tt['garn'] + '</p>' + tabell(tt['ehead'], ekstra_rader))}
{sagep(tt['p2'])}
{card(tabell(tt['ghead'], garnmengder, min_index=0))}
{rosep(tt['p3'])}
{cme(tt['fasthet'])}
'''


def side_diagram(lang, smaa=False, snudd=False):
    """Diagramsiden. smaa=True bytter det store bladet mot den lille hetten,
    som brukes på votter, tøfler, sokker og lue. snudd=True snur hetten, og
    brukes på luen, der det grønne ligger over det rosa og omgangene derfor
    må komme i motsatt rekkefølge."""
    t = {'no': dict(
        b='JORDBÆRHETTE OG FRØ' if smaa else 'BLAD- OG FRØMØNSTER',
        lead=(('Omgangene strikkes i den rekkefølgen de er nummerert, omgang 1 først, '
               'og hver omgang leses fra høyre mot venstre, samme vei som du strikker. '
               'Jordbærhetten er 4 masker og gjentas rundt. Den er med vilje mindre enn '
               'bladet på de store plaggene: på en vott eller en sokk ville det store '
               'bladet dekket nesten hele flaten.')
              if smaa else
              ('Omgangene strikkes i den rekkefølgen de er nummerert, omgang 1 først, '
               'og hver omgang leses fra høyre mot venstre, samme vei som du strikker. '
               'Bladrapporten er 8 masker og gjentas rundt hele bærestykket. Antall '
               'gjentakelser står i din egen størrelse lenger bak.')),
        blad='JORDBÆRHETTE, 4 MASKER x 4 OMGANGER' if smaa
             else 'BLAD, 8 MASKER x 10 OMGANGER',
        fro='FRØ, 8 MASKER',
        frotxt=('Frøene er enkeltmasker i kremhvit, strødd utover det rosa. Strikk omgang '
                'A, deretter 2-3 omganger rosa, og så omgang B. Gjenta dette så tett eller '
                'spredt du selv vil.'),
        tips=('Trådspranget bak arbeidet blir aldri lengre enn 3 masker i noen av '
              'diagrammene. Det er med vilje: lange løse tråder på innsiden er både '
              'ubehagelig mot huden og noe små fingre kan sette seg fast i. Hold den '
              'løpende tråden løs nok til at arbeidet ikke snurper seg sammen.'))}
    t['en'] = dict(
        b='STRAWBERRY TOP AND SEEDS' if smaa else 'LEAF AND SEED CHARTS',
        lead=(('The rounds are worked in the order they are numbered, round 1 first, '
               'and each round is read from right to left, the same way you knit. The '
               'strawberry top is 4 stitches and is repeated round. It is deliberately '
               'smaller than the leaf on the larger garments: on a mitten or a sock the '
               'large leaf would cover almost the whole surface.')
              if smaa else
              ('The rounds are worked in the order they are numbered, round 1 first, '
               'and each round is read from right to left, the same way you knit. The '
               'leaf repeat is 8 stitches and is repeated all the way round the yoke. '
               'The number of repeats for your size is given further on.')),
        blad='STRAWBERRY TOP, 4 STITCHES x 4 ROUNDS' if smaa
             else 'LEAF, 8 STITCHES x 10 ROUNDS',
        fro='SEED, 8 STITCHES',
        frotxt=('The seeds are single cream white stitches scattered over the pink. Work '
                'round A, then 2-3 rounds in pink, then round B. Repeat as densely or as '
                'sparsely as you like.'),
        tips=('The float behind the work is never longer than 3 stitches in either chart. '
              'That is deliberate: long loose strands on the inside are both uncomfortable '
              'against the skin and something small fingers can catch in. Keep the '
              'carried yarn loose enough that the work does not pucker.'))
    tt = t[lang]
    fro_lab = {'no': 'omg', 'en': 'rnd'}[lang]
    fro = ('<div class="diagrow">'
           + diagram([FRO_A], 'A', fro_lab + ' A', bredde_mm=54, vis_omgang=False)
           + diagram([FRO_B], 'B', fro_lab + ' B', bredde_mm=54, vis_omgang=False)
           + '</div>')
    return f'''
{banner(tt['b'])}
<p>{tt['lead']}</p>
{card(diagram((SMABLAD_SNUDD if snudd else SMABLAD) if smaa else BLAD, tt['blad'], {'no': 'omg', 'en': 'rnd'}[lang],
              bredde_mm=34 if smaa else 62) + forklaring(lang))}
{sagep(tt['fro'])}
{card(fro + '<p class="small center">' + tt['frotxt'] + '</p>')}
{cme(tt['tips'])}
'''


def side_teststrikk(lang, plaggnavn_no, plaggnavn_en):
    plagg = plaggnavn_no if lang == 'no' else plaggnavn_en
    t = {'no': dict(
        b='TIL DEG SOM TESTSTRIKKER',
        lead=(f'Denne utgaven av {plagg} er en teststrikkversjon. Alle masketall er '
              'regnet ut fra barnas mål og strikkefastheten, og kontrollert mot '
              'hverandre, men ingen har strikket etter oppskriften ennå. Du er den '
              'første. Det betyr at du kan støte på ting jeg ikke har sett, og det er '
              'nettopp derfor jeg trenger deg.'),
        p1='DETTE TRENGER JEG FRA DEG',
        liste=['Hvilken størrelse du strikket, og hvilket garn og hvilken pinne du brukte.',
               'Din egen strikkefasthet, målt på en vasket og flattørket prøvelapp.',
               'De ferdige målene på plagget, målt etter vask, med tallene i skjemaet under.',
               'Alt som var uklart: en setning du måtte lese tre ganger, et masketall som '
               'ikke gikk opp, et sted du måtte gjette.',
               'Et bilde av det ferdige plagget, gjerne på barnet, hvis du vil.',
               'Si fra hvis mønsteret minner deg om en oppskrift du har sett før. '
               'Jordbærdrøm er tegnet for LME, og jeg vil vite det med en gang hvis '
               'noe likevel ligger for tett på noe annet.'],
        p2='MÅLESKJEMA, FYLLES UT ETTER VASK',
        p3='SLIK SENDER DU INN',
        send=('Send skjemaet, kommentarene og eventuelle bilder til '
              'https://lmexplorers.com/teststrikk. Fristen står i e-posten du fikk '
              'oppskriften i.'),
        takk=('Ingenting er for smått til å nevnes. Det du snublet i, snubler den neste i '
              'også, og det er lettere å rette nå enn etterpå.'))}
    t['en'] = dict(
        b='FOR YOU, THE TEST KNITTER',
        lead=(f'This edition of the {plagg} is a test knit version. Every stitch count '
              'has been calculated from the babies\' measurements and the gauge, and '
              'checked against the others, but nobody has knitted from the pattern yet. '
              'You are the first. That means you may run into things I have not seen, '
              'and that is exactly why I need you.'),
        p1='WHAT I NEED FROM YOU',
        liste=['Which size you knitted, and which yarn and needles you used.',
               'Your own gauge, measured on a washed swatch dried flat.',
               'The finished measurements of the garment after washing, in the form below.',
               'Anything unclear: a sentence you had to read three times, a stitch count '
               'that did not add up, a place where you had to guess.',
               'A photo of the finished garment, on the baby if you like.',
               'Tell me if the pattern reminds you of one you have seen before. '
               'Strawberry Dream is drawn for LME, and I want to know straight away if '
               'something still sits too close to something else.'],
        p2='MEASUREMENT FORM, FILL IN AFTER WASHING',
        p3='HOW TO SEND IT IN',
        send=('Send the form, your comments and any photos to '
              'https://lmexplorers.com/teststrikk. The deadline is given in the email the '
              'pattern came in.'),
        takk=('Nothing is too small to mention. Whatever tripped you up will trip up the '
              'next knitter too, and it is far easier to fix now than later.'))
    tt = t[lang]
    felt = {'no': ['Størrelse strikket', 'Min strikkefasthet, masker per 10 cm',
                   'Min strikkefasthet, omganger per 10 cm', 'Garn og pinne',
                   'Brystvidde etter vask', 'Hel lengde etter vask',
                   'Tid brukt, omtrent', 'Garnforbruk, gram'],
            'en': ['Size knitted', 'My gauge, stitches per 10 cm',
                   'My gauge, rounds per 10 cm', 'Yarn and needles',
                   'Chest after washing', 'Total length after washing',
                   'Time taken, roughly', 'Yarn used, grams']}[lang]
    skjema = ('<div class="tkgrid">' + ''.join(
        f'<div><div class="linelab">{f}</div><div class="line"></div></div>' for f in felt)
        + '</div>')
    return f'''
{banner(tt['b'])}
<p>{tt['lead']}</p>
{rosep(tt['p1'])}
{card(ul(tt['liste']))}
{sagep(tt['p2'])}
<div class="tk">{skjema}</div>
{rosep(tt['p3'])}
{card('<p>' + tt['send'] + '</p>')}
{cme(tt['takk'])}
'''


def side_montering(lang, ekstra_no=None, ekstra_en=None):
    t = {'no': dict(
        b='MONTERING OG ETTERBEHANDLING', p1='SJEKKLISTE',
        liste=['Fest alle tråder flatt og godt på vrangen. Klipp dem ikke helt inntil.',
               'Legg arbeidet i lunkent vann med ullvaskemiddel. Ikke gni og ikke vri.',
               'Klem vannet ut i et håndkle, og tørk plagget flatt til de oppgitte målene.',
               'Kontroller alle knapper, snorer, kanter og løse tråder før plagget brukes.',
               'Mål plagget etter vask og skriv tallene i skjemaet på forrige side.'],
        p2='SIKKERHET',
        sikker=('Knapper og snorer på barneplagg skal alltid kontrolleres før bruk, og '
                'plagget brukes bare under oppsyn. Sy knappene med sterk tråd og gå over '
                'dem igjen etter hver vask. På de minste størrelsene ligger plagget tett '
                'inntil huden, så kjenn etter at ingen søm eller knute ligger hardt an.'),
        takk='God strikkelyst!')}
    t['en'] = dict(
        b='FINISHING AND AFTERCARE', p1='CHECKLIST',
        liste=['Weave in all ends flat and firmly on the wrong side. Do not cut them flush.',
               'Soak the work in lukewarm water with wool detergent. Do not rub or wring.',
               'Press the water out in a towel and dry the garment flat to the given '
               'measurements.',
               'Check all buttons, ties, edges and loose ends before the garment is worn.',
               'Measure the garment after washing and write the numbers in the form on '
               'the previous page.'],
        p2='SAFETY',
        sikker=('Buttons and ties on children\'s garments must always be checked before '
                'use, and the garment worn only under supervision. Sew buttons on with '
                'strong thread and go over them again after every wash. In the smallest '
                'sizes the garment sits right against the skin, so feel that no seam or '
                'knot presses hard.'),
        takk='Happy knitting!')
    tt = t[lang]
    liste = list(tt['liste'])
    if lang == 'no' and ekstra_no:
        liste.insert(4, ekstra_no)
    if lang == 'en' and ekstra_en:
        liste.insert(4, ekstra_en)
    return f'''
{banner(tt['b'])}
{rosep(tt['p1'])}
{card(ul(liste))}
{sagep(tt['p2'])}
{card('<p>' + tt['sikker'] + '</p>')}
{cme(tt['takk'])}
'''


def side_avslutning(lang):
    t = {'no': dict(
        b='JORDBÆRDRØM', p1='HELE KOLLEKSJONEN',
        liste=['Jordbærdrøm kjole, ermeløs kjole med bladparti og utsvingt skjørt.',
               'Jordbærdrøm romper med skjørt, med bleiedel og knapper i skrittet.',
               'Jordbærdrøm genser og skjørt, et todelt sett med elastisk liv i skjørtet.',
               'Jordbærdrøm votter, uten tommel, med sammenbindingssnor, str 44 til 74.',
               'Jordbærdrøm tøfler, med brettet ribb og knyting rundt ankelen, '
               'str 44 til 92.'],
        p2='OPPHAVSRETT',
        opph=(f'(c) {AAR} Renate Dahl, Little Montessori Explorers. Jordbærdrøm er et helt '
              'originalt LME-design. Oppskriften er kun til personlig bruk, og kan ikke '
              'kopieres, deles, videreselges eller publiseres. Ferdige plagg du strikker '
              'etter oppskriften kan selges i liten skala med kreditering til Little '
              'Montessori Explorers, forutsatt at det ferdige plagget er kontrollert mot '
              'gjeldende sikkerhetskrav.'),
        by='Renate Dahl · Little Montessori Explorers · lmexplorers.com')}
    t['en'] = dict(
        b='STRAWBERRY DREAM', p1='THE WHOLE COLLECTION',
        liste=['Strawberry Dream dress, sleeveless with a leaf yoke and a flared skirt.',
               'Strawberry Dream romper with skirt, with a nappy panel and buttons at the '
               'crotch.',
               'Strawberry Dream jumper and skirt, a two-piece set with an elasticated '
               'waist.',
               'Strawberry Dream mittens, thumbless, with a connecting cord, '
               'sizes 44 to 74.',
               'Strawberry Dream booties, with a folded rib cuff and ties at the ankle, '
               'sizes 44 to 92.'],
        p2='COPYRIGHT',
        opph=(f'(c) {AAR} Renate Dahl, Little Montessori Explorers. Strawberry Dream is a '
              'fully original LME design. The pattern is for personal use only, and may '
              'not be copied, shared, resold or published. Finished garments you knit from '
              'the pattern may be sold on a small scale with credit to Little Montessori '
              'Explorers, provided the finished garment is checked against current safety '
              'requirements.'),
        by='Renate Dahl · Little Montessori Explorers · lmexplorers.com')
    tt = t[lang]
    return f'''
{banner(tt['b'])}
{rosep(tt['p1'])}
{card(ul(tt['liste']))}
{sagep(tt['p2'])}
{card('<p class="small center">' + tt['opph'] + '</p>')}
<div class="byline"><div class="by2">{tt['by']}</div></div>
'''


def forside(lang, tittel, undertittel, beskrivelse, bar=None, bilde=None):
    t = {'no': dict(
        tag='LITTLE MONTESSORI EXPLORERS',
        by1='Av Renate Dahl', by2='Little Montessori Explorers', by3='lmexplorers.com',
        tips=('Les hele oppskriften før du begynner, og strikk en prøvelapp. Marker din '
              'egen størrelse i tabellene, så slipper du å lete underveis.'),
        vers=VERSJON)}
    t['en'] = dict(
        tag='LITTLE MONTESSORI EXPLORERS',
        by1='By Renate Dahl', by2='Little Montessori Explorers', by3='lmexplorers.com',
        tips=('Read the whole pattern before you start, and knit a gauge swatch. Mark your '
              'own size in the tables so you do not have to search as you go.'),
        vers=VERSJON_EN)
    tt = t[lang]
    return f'''
<div class="covertag">{tt['tag']}</div>
<div class="coverbanner"><h1 class="covertitle">{tittel}</h1></div>
<div class="subpill">{undertittel}</div>
{('<div class="coverimg"><img src="bilder/' + bilde + '" alt=""></div>') if bilde else ''}
{card('<p class="center">' + beskrivelse + '</p>')}
{bar if bar is not None else storrelsesbar(lang)}
<div class="byline">
  <div class="by1">{tt['by1']}</div>
  <div class="by2">{tt['by2']}</div>
  <div class="by3">{tt['by3']}</div>
</div>
<div class="notecard"><span class="noteemo">&#127827;</span><p><i>{tt['tips']}</i> &nbsp;<b>{tt['vers']}</b></p></div>
'''


def skriv(navn, lang_titler, sider_fn, filnavn):
    """Bygger og skriver NO- og EN-HTML for ett plagg."""
    for lang in ('no', 'en'):
        sider = sider_fn(lang)
        html_doc = kit.doc(lang, lang_titler[lang], DIAG_CSS, sider)
        ut = BASE / f'{filnavn}_{lang}.html'
        ut.write_text(html_doc, encoding='utf-8')
        print(f'  OK {navn} {lang}: {len(sider)} sider, {len(html_doc)} tegn')


def side(body, num, lang, ph2_no, ph2_en):
    hoyre = {'no': 'LME STRIKK', 'en': 'LME KNITTING'}[lang]
    return kit.page(body, num, hoyre, ph2_no if lang == 'no' else ph2_en, '')


def L(lang, no, en):
    """Velger norsk eller engelsk tekst. Finnes for at build_*.py skal slippe
    nøstede fnutter inne i f-strenger, som Python 3.11 ikke tillater."""
    return no if lang == 'no' else en


# ------------------------------------------------- STØRRELSER FOR SMÅDELENE
# Votter og tøfler har egne, grovere størrelsestrinn enn plaggene, se
# forklaringen i grading_jordbaerdrom.py. Derfor har de sin egen
# størrelsesbar og sin egen størrelsesside.
def storrelsesbar_liste(par):
    return '<div class="strbar">' + ''.join(
        f'<div class="strbox"><b>{a}</b><span>{b}</span></div>' for a, b in par) + '</div>'


def side_storrelser_smaadel(lang, lead, khead, krow, malhead, malrader, par, note):
    b = L(lang, 'STØRRELSER OG FERDIGE MÅL', 'SIZES AND FINISHED MEASUREMENTS')
    p1 = L(lang, 'HVILKEN STØRRELSE VELGER DU', 'WHICH SIZE TO CHOOSE')
    p2 = L(lang, 'FERDIGE MÅL', 'FINISHED MEASUREMENTS')
    return (banner(b) + '<p>' + lead + '</p>' + storrelsesbar_liste(par) +
            rosep(p1) + card(tabell(khead, krow, min_index=0)) +
            sagep(p2) + card(tabell(malhead, malrader, min_index=0)) + cme(note))
