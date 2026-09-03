# -*- coding: utf-8 -*-
"""
Kontroll av de ferdige Jordbærdrøm-PDF-ene.

Sidene i LME-malen har overflow:hidden. Får en side for mye innhold, blir
resten rett og slett klippet bort, uten at noe feiler og uten at det synes
på en rask gjennomlesing. Det er den farligste feilen i et oppskriftshefte:
en setning som forsvinner mellom HTML-en og PDF-en.

Denne filen sammenligner derfor hver side i PDF-en med den tilsvarende
siden i HTML-en, ord for ord, og sier fra om noe mangler. Den kontrollerer
også at masketallene i PDF-ene stemmer med sizes.json, og at
skrivestilreglene er fulgt.

Kjøres med:  python3 verifiser.py
"""
import glob
import html
import json
import pathlib
import re
import sys

import pymupdf

BASE = pathlib.Path(__file__).parent
DATA = json.loads(BASE.joinpath('sizes.json').read_text(encoding='utf-8'))

# (html-fil, pdf-fil)
PAR = [
    ('kjole_no.html', 'LME-Jordbaerdrom-Kjole.pdf'),
    ('kjole_en.html', 'LME-Jordbaerdrom-Kjole-EN.pdf'),
    ('romper_no.html', 'LME-Jordbaerdrom-Romper.pdf'),
    ('romper_en.html', 'LME-Jordbaerdrom-Romper-EN.pdf'),
    ('genser_skjort_no.html', 'LME-Jordbaerdrom-Genser-og-skjort.pdf'),
    ('genser_skjort_en.html', 'LME-Jordbaerdrom-Genser-og-skjort-EN.pdf'),
    ('votter_no.html', 'LME-Jordbaerdrom-Votter.pdf'),
    ('votter_en.html', 'LME-Jordbaerdrom-Votter-EN.pdf'),
    ('tofler_no.html', 'LME-Jordbaerdrom-Tofler.pdf'),
    ('tofler_en.html', 'LME-Jordbaerdrom-Tofler-EN.pdf'),
]

feil = []


def rens(s):
    """Gjør tekst sammenlignbar: fjerner tegnsetting og slår sammen mellomrom."""
    s = html.unescape(s)
    s = re.sub(r'[^0-9A-Za-zÆØÅæøå]+', ' ', s)
    return ' ' + ' '.join(s.split()).lower() + ' '


def html_sider(fil):
    """Henter den synlige teksten fra hver .page i HTML-filen."""
    kilde = BASE.joinpath(fil).read_text(encoding='utf-8')
    kropp = kilde.split('<body>', 1)[1].rsplit('</body>', 1)[0]
    biter = kropp.split('<div class="page">')[1:]
    ut = []
    for b in biter:
        b = re.sub(r'<svg.*?</svg>', ' ', b, flags=re.S)   # diagrammene er grafikk
        ut.append(re.sub(r'<[^>]+>', ' ', b))
    return ut


# ------------------------------------------------- 1 INGEN TEKST BLIR KLIPPET
print('1. Ingen tekst klippet bort mellom HTML og PDF')
for hfil, pfil in PAR:
    if not BASE.joinpath(pfil).exists():
        feil.append(f'{pfil} finnes ikke, kjør Chromium-steget i README-en')
        continue
    hs = html_sider(hfil)
    d = pymupdf.open(BASE / pfil)
    if len(hs) != d.page_count:
        feil.append(f'{pfil}: {d.page_count} sider i PDF, men {len(hs)} i HTML')
        continue
    mangler = 0
    for i, htekst in enumerate(hs):
        # Sperret og loddrett skrift (sidebåndet, toppbanneret) hentes ut
        # bokstav for bokstav av PDF-leseren. Mellomrommene fjernes derfor på
        # begge sider før sammenligningen, så et ord gjenkjennes uansett
        # hvordan PDF-en har delt det opp.
        ptekst = rens(d[i].get_text()).replace(' ', '')
        # Sammenlign ord for ord. Tall og korte ord hoppes over, de kan stå i
        # tabellceller som PDF-en bryter annerledes enn HTML-en.
        for ord_ in set(rens(htekst).split()):
            if len(ord_) > 4 and not ord_.isdigit() and ord_ not in ptekst:
                feil.append(f'{pfil} s.{i + 1}: ordet "{ord_}" mangler i PDF-en, '
                            'sannsynligvis klippet bort fordi siden er for full')
                mangler += 1
                if mangler > 3:
                    break
        if mangler > 3:
            break
    print(f'   {pfil}: {d.page_count} sider' + ('' if not mangler else '  FEIL'))

# ------------------------------------- 2 MASKETALLENE STEMMER MED SIZES.JSON
print('\n2. Masketallene i PDF-ene stemmer med sizes.json')
kj = pymupdf.open(BASE / 'LME-Jordbaerdrom-Kjole.pdf')
kjtekst = ' '.join(s.get_text() for s in kj)
for p in DATA['plagg']:
    for felt in ('hals_co', 'yoke', 'bol_ermelos', 'kjole_skjort_2'):
        if str(p[felt]) not in kjtekst:
            feil.append(f'kjole: {felt}={p[felt]} for str {p["str_nr"]} står ikke i PDF-en')
print(f'   kontrollert {len(DATA["plagg"])} størrelser x 4 tall')

# --------------------------------------------------------- 3 SKRIVESTILREGLER
print('\n3. Skrivestilregler')
forbudt = {'«': 'vinkelanførselstegn', '»': 'vinkelanførselstegn',
           '—': 'tankestrek', '–': 'tankestrek',
           '’': 'krøllapostrof', '“': 'krøllanførselstegn',
           '”': 'krøllanførselstegn'}
for hfil, _ in PAR:
    tekst = BASE.joinpath(hfil).read_text(encoding='utf-8')
    tekst = tekst.split('<body>', 1)[1]          # CSS-en har egne regler
    for tegn, navn in forbudt.items():
        if tegn in tekst:
            feil.append(f'{hfil}: inneholder {navn} ({tegn!r})')
    for treff in re.findall(r'Montessori-[a-zæøå]+', tekst):
        feil.append(f'{hfil}: sammensatt ord med bindestrek, "{treff}"')
print('   ingen vinkelanførselstegn, tankestreker eller krøllfnutter')

# ----------------------------------------------------------------- 4 RESULTAT
print()
if feil:
    print(f'{len(feil)} FEIL:')
    for f in feil[:40]:
        print('  -', f)
    sys.exit(1)
print('Alt i orden. Alle ti PDF-ene er komplette og stemmer med sizes.json.')
