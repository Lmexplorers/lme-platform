# -*- coding: utf-8 -*-
"""
Jordbærdrøm, graderingsberegning for hele kolleksjonen.

Utgangspunktet er de fem prøveoppskriftene i én størrelse (prematur / liten
nyfødt), som Renate sendte inn. Denne filen graderer den samme
konstruksjonen opp til fem størrelser, 32, 38, 44, 50 og 56, og skriver
sizes.json som alle fem build_*.py leser.

Den minste størrelsen (32) beholder prøveoppskriftens egne tall med vilje:
88 masker i bærestykket, 60 masker i bolen, 48 masker i halsen. Det som
allerede er strikket etter prøveoppskriften er dermed fortsatt gyldig.

FASTHET
21 m og 28 omg glattstrikk = 10 x 10 cm, pinne 4 mm, DROPS Merino Extra
Fine. Uendret fra prøveoppskriften, og brukt i alle beregninger her.

BINDINGEN SOM STYRER ALT: BLADRAPPORTEN ER 8 MASKER
Bladmønsteret går rundt hele bærestykket, så masketallet i bærestykket må
være delelig med 8 i hver eneste størrelse. Halsen deles i 8 felt, og hver
økeomgang legger til nøyaktig 8 masker, så halsoppligget må også være
delelig med 8. Det er derfor bærestykket vokser i sprang på 8 masker
(én bladrapport, ca. 3,8 cm), og ikke helt jevnt.

Delingen til bol og ermer er derimot fri, den trenger ikke være delelig med
8. Derfor graderes bolen raskere enn ermene i de største størrelsene, slik
at brystvidden følger barnets mål og ikke rapporten.

HVORFOR VOTTER OG TØFLER HAR FÆRRE STØRRELSER
Samme binding slår ut motsatt vei på de små delene. En bladrapport er ca.
3,8 cm i omkrets, og en babyhånd vokser mindre enn det fra prematur til to
måneder. Fem vottestørrelser ville derfor bare vært fem navn på to reelle
mål. Vottene er gradert i 2 størrelser og tøflene i 3, og hver av dem
dekker et oppgitt spenn av plaggstørrelsene.

Kjøres med:  python3 grading_jordbaerdrom.py
Skriver:     sizes.json (i denne mappen)
"""
import json
import pathlib

BASE = pathlib.Path(__file__).parent

GAUGE_ST_CM = 21 / 10          # masker per cm i glattstrikk
GAUGE_ROW_CM = 28 / 10         # omganger per cm i glattstrikk
BLAD_RAPPORT = 8               # masker i bladrapporten
BLAD_OMG = 10                  # omganger i bladdiagrammet

# ------------------------------------------------------------------ STØRRELSER
# (str, no-tillegg, en-tillegg, kroppens brystmål cm, bærestykke m, front=bak m,
#  halsoppligg m)
# Kroppsmålene er vanlige mål for premature og nyfødte. Ferdig brystvidde
# beregnes av masketallet, ikke omvendt, og romsligheten kontrolleres under.
#
# Halsoppligget må også være delelig med 8, siden halsen deles i 8 felt. Det
# gir bare 48, 56 og 64 masker å velge mellom i dette spennet, altså sprang på
# 3,8 cm. Halsen holdes derfor på samme masketall over to størrelser om
# gangen, og antall økeomganger tar resten av veksten. Halsen MÅ vokse: en
# genser uten åpning skal over hodet, og hodet vokser raskere enn brystet.
SIZES = [
    (32, "prematur, ca. 1,0-1,5 kg",  "preemie, approx. 1.0-1.5 kg", 24.0,  88, 28, 48),
    (38, "prematur, ca. 1,5-2,5 kg",  "preemie, approx. 1.5-2.5 kg", 27.0, 104, 32, 48),
    (44, "liten nyfødt, ca. 2,5-3,2 kg", "small newborn, approx. 2.5-3.2 kg", 30.0, 120, 36, 56),
    (50, "nyfødt, ca. 3,2-4,2 kg",    "newborn, approx. 3.2-4.2 kg", 33.0, 136, 40, 56),
    (56, "ca. 1-2 mnd",               "approx. 1-2 months",          36.0, 152, 44, 64),
]

# Lengder i cm per størrelse, i samme rekkefølge som SIZES.
BOL_KJOLE      = [7, 8, 9, 10, 11]      # fra under armen ned til livet
SKJORT_KJOLE   = [15, 17, 19, 21, 23]   # fra livet og ned
BOL_ROMPER     = [8, 9, 10, 11, 12]     # fra under armen ned til livet
SKJORT_ROMPER  = [7, 8, 9, 10, 11]      # kort overskjørt
BLEIE_ROMPER   = [7, 8, 9, 10, 11]      # fra livet ned til delingen
BOL_GENSER     = [9, 10, 11, 12, 13]    # fra under armen ned til ribben
ERME_GENSER    = [13, 15, 17, 19, 21]   # under armen og ut
SKJORT_LENGDE  = [14, 16, 18, 20, 22]   # løst skjørt, fra linningen og ned

UNDERARM_ERMELOS = 2   # masker lagt opp under armen på kjole og romper
UNDERARM_GENSER = 4    # masker lagt opp under armen på genseren
HALS_RIBB_OMG = 5      # vridd ribb i halsen før økingene

rows = []
for i, (nr, tno, ten, kropp_bryst, yoke, front, hals) in enumerate(SIZES):
    back = front
    sleeve = (yoke - front - back) // 2

    # Antall økeomganger følger av halsen og bærestykket: hver økeomgang
    # legger til nøyaktig 8 masker, én i hvert av de 8 feltene.
    assert (yoke - hals) % 8 == 0, f"str {nr}: hals og bærestykke går ikke opp i 8 felt"
    inc = (yoke - hals) // 8

    # Ermeløs bol (kjole, romper) og bol med ermer (genser).
    bol_ermelos = front + back + 2 * UNDERARM_ERMELOS
    bol_genser = front + back + 2 * UNDERARM_GENSER
    erme_overarm = sleeve + UNDERARM_GENSER

    # Ermefellinger: 2 masker per felleomgang, én felleomgang mer per
    # størrelse, slik at mansjetten vokser saktere enn overarmen.
    erme_fellinger = 2 + i
    erme_mansjett = erme_overarm - 2 * erme_fellinger

    # Bærestykkets dybde: økeomgangene (annenhver omgang), bladdiagrammet
    # og én utjevningsomgang i rosa.
    yoke_omg = inc * 2 + BLAD_OMG + 1
    yoke_cm = round(yoke_omg / GAUGE_ROW_CM, 1)

    # Armhullskant: de hvilende ermemaskene, maskene lagt opp under armen og
    # 2 masker plukket opp i hjørnene. Alltid et partall, siden kanten
    # strikkes i vridd ribb med 1 vridd rett og 1 vrang.
    armhull_ermelos = sleeve + UNDERARM_ERMELOS + 2

    # Skjørt: *2 r, M1* gir halvannen gang vidden, deretter en jevn øking til.
    kjole_skjort_1 = bol_ermelos + bol_ermelos // 2
    kjole_skjort_2 = kjole_skjort_1 + (18 + 6 * (i // 2))
    romper_skjort = bol_ermelos + bol_ermelos // 2

    # Bleiedelen på romperen: bolen deles i to like halvdeler, og hver del
    # felles inn til en skrittbredde som vokser med størrelsen.
    bleie_halv = bol_ermelos // 2
    skritt_m = 18 + 2 * i

    # Løst skjørt til genseren: linningen legges opp direkte på et masketall
    # som er delelig med 8, slik at bladrapporten går opp uten justering.
    skjort_liv = 64 + 8 * i
    skjort_vidde = skjort_liv + skjort_liv // 2

    rows.append(dict(
        str_nr=nr, tillegg_no=tno, tillegg_en=ten,
        kropp_bryst_cm=kropp_bryst,
        hals_co=hals, hals_felt=8, hals_per_felt=hals // 8,
        oke_omganger=inc, oke_pinner=inc * 2,
        yoke=yoke, blad_rapporter=yoke // BLAD_RAPPORT,
        yoke_omganger=yoke_omg, yoke_cm=yoke_cm,
        front=front, back=back, sleeve=sleeve,
        underarm_ermelos=UNDERARM_ERMELOS, underarm_genser=UNDERARM_GENSER,
        bol_ermelos=bol_ermelos,
        bryst_ermelos_cm=round(bol_ermelos / GAUGE_ST_CM, 1),
        bol_genser=bol_genser,
        bryst_genser_cm=round(bol_genser / GAUGE_ST_CM, 1),
        armhull_ermelos=armhull_ermelos,
        erme_overarm=erme_overarm,
        erme_overarm_cm=round(erme_overarm / GAUGE_ST_CM, 1),
        erme_fellinger=erme_fellinger, erme_mansjett=erme_mansjett,
        erme_mansjett_cm=round(erme_mansjett / GAUGE_ST_CM, 1),
        erme_lengde_cm=ERME_GENSER[i],
        erme_omganger=round(ERME_GENSER[i] * GAUGE_ROW_CM),
        bol_kjole_cm=BOL_KJOLE[i], skjort_kjole_cm=SKJORT_KJOLE[i],
        bol_romper_cm=BOL_ROMPER[i], skjort_romper_cm=SKJORT_ROMPER[i],
        bleie_romper_cm=BLEIE_ROMPER[i], bol_genser_cm=BOL_GENSER[i],
        kjole_skjort_1=kjole_skjort_1, kjole_skjort_2=kjole_skjort_2,
        kjole_skjort_vidde_cm=round(kjole_skjort_2 / GAUGE_ST_CM, 1),
        romper_skjort=romper_skjort,
        romper_skjort_vidde_cm=round(romper_skjort / GAUGE_ST_CM, 1),
        bleie_halv=bleie_halv, skritt_m=skritt_m,
        skritt_cm=round(skritt_m / GAUGE_ST_CM, 1),
        skjort_liv=skjort_liv,
        skjort_liv_cm=round(skjort_liv / GAUGE_ST_CM, 1),
        skjort_rapporter=skjort_liv // BLAD_RAPPORT,
        skjort_vidde=skjort_vidde,
        skjort_vidde_cm=round(skjort_vidde / GAUGE_ST_CM, 1),
        skjort_lengde_cm=SKJORT_LENGDE[i],
        # Ferdige lengder, summert av delene og ikke oppgitt på frihånd.
        kjole_lengde_cm=round(yoke_cm + BOL_KJOLE[i] + SKJORT_KJOLE[i]),
        romper_lengde_cm=round(yoke_cm + BOL_ROMPER[i] + BLEIE_ROMPER[i] + 3),
        genser_lengde_cm=round(yoke_cm + BOL_GENSER[i] + 2),
    ))

# ------------------------------------------------------------ VOTTER OG TØFLER
# Egne, grovere størrelsestrinn, se modul-docstringen. dekker= hvilke
# plaggstørrelser hvert trinn er beregnet for.
VOTTER = []
for navn_no, navn_en, dekker, m, ribb_cm, hand_cm, snor_cm in [
    ("Liten",  "Small", "32-44", 24, 5, 4.5, 40),
    ("Stor",   "Large", "50-56", 32, 6, 6.0, 50),
]:
    # Toppfelling: *2 r, 2 r sm*, deretter *1 r, 2 r sm*, deretter 2 r sm rundt
    # til det står få nok masker igjen til å trekke sammen.
    trinn = []
    m_n = m
    m_n = m_n - m_n // 4          # *2 r, 2 r sm*
    trinn.append(m_n)
    m_n = m_n - m_n // 3          # *1 r, 2 r sm*
    trinn.append(m_n)
    while m_n > 8:                # 2 r sm rundt, til det står få nok igjen
        m_n = m_n // 2
        trinn.append(m_n)
    VOTTER.append(dict(
        navn_no=navn_no, navn_en=navn_en, dekker=dekker, masker=m,
        rapporter=m // BLAD_RAPPORT,
        omkrets_cm=round(m / GAUGE_ST_CM, 1),
        ribb_cm=ribb_cm, hand_cm=hand_cm,
        lengde_cm=round(hand_cm + BLAD_OMG / GAUGE_ROW_CM + 2.5, 1),
        snor_cm=snor_cm, fellinger=trinn,
    ))

TOFLER = []
for navn_no, navn_en, dekker, m, ribb_cm, fot_cm, overfot_m, overfot_p, plukk, icord_cm in [
    ("Liten",  "Small",  "32-38", 24, 5, 6.5,  9, 12, 6, 30),
    ("Medium", "Medium", "44-50", 32, 6, 8.0, 11, 14, 7, 34),
    ("Stor",   "Large",  "56",    40, 7, 9.5, 13, 17, 9, 40),
]:
    hvilende = m - overfot_m
    etter_plukk = overfot_m + hvilende + 2 * plukk
    # Tre felleomganger à 4 masker, én i hvert av overfotens fire hjørner.
    etter_felling = etter_plukk - 12
    halv = etter_felling // 2
    ta_m = halv - (halv // 2)     # tåen felles til om lag halvparten
    TOFLER.append(dict(
        navn_no=navn_no, navn_en=navn_en, dekker=dekker, masker=m,
        rapporter=m // BLAD_RAPPORT,
        ankel_cm=round(m / GAUGE_ST_CM, 1),
        ribb_cm=ribb_cm, fot_cm=fot_cm,
        overfot_m=overfot_m, overfot_pinner=overfot_p,
        hvilende=hvilende, plukk=plukk, etter_plukk=etter_plukk,
        etter_felling=etter_felling, halv=halv, ta_m=ta_m,
        icord_cm=icord_cm,
    ))

# ------------------------------------------------------------- KONSISTENSSJEKK
# Alt under er tall som PDF-ene skriver ut. Slår én av dem feil, skal
# byggingen stoppe her og ikke ende i en oppskrift noen strikker etter.

assert len(rows) == 5

for r in rows:
    # Bladrapporten må gå opp i bærestykket, ellers stemmer ikke mønsteret rundt.
    assert r['yoke'] % BLAD_RAPPORT == 0, f"str {r['str_nr']}: bærestykket ikke delelig med 8"
    assert r['hals_co'] % 8 == 0, f"str {r['str_nr']}: halsoppligget ikke delelig med 8"
    assert r['blad_rapporter'] * BLAD_RAPPORT == r['yoke']
    assert r['hals_co'] + r['oke_omganger'] * 8 == r['yoke'], f"str {r['str_nr']}: økingene går ikke opp"
    assert r['front'] + r['back'] + 2 * r['sleeve'] == r['yoke'], f"str {r['str_nr']}: delingen går ikke opp"
    assert r['hals_co'] >= 48, f"str {r['str_nr']}: halsen for trang"
    assert r['oke_omganger'] >= 5
    # Ermet må gi plass til en hånd, og mansjetten må være et partall til ribben.
    assert r['erme_mansjett'] % 2 == 0, f"str {r['str_nr']}: mansjett ikke partall"
    assert r['erme_mansjett'] >= 16, f"str {r['str_nr']}: mansjetten for trang"
    assert r['erme_mansjett'] < r['erme_overarm'], f"str {r['str_nr']}: ermet smalner ikke"
    assert r['armhull_ermelos'] % 2 == 0, f"str {r['str_nr']}: armhullskant ikke partall"
    # Skjørtet må være videre enn livet det henger fra.
    assert r['kjole_skjort_2'] > r['kjole_skjort_1'] > r['bol_ermelos']
    assert r['romper_skjort'] > r['bol_ermelos']
    assert r['skjort_vidde'] > r['skjort_liv']
    assert r['skjort_liv'] % BLAD_RAPPORT == 0, f"str {r['str_nr']}: skjørtelinningen ikke delelig med 8"
    # Bleiedelen: to like halvdeler som felles inn til en smalere skrittbredde.
    assert 2 * r['bleie_halv'] == r['bol_ermelos']
    assert r['skritt_m'] < r['bleie_halv'], f"str {r['str_nr']}: skrittet felles ikke inn"
    assert r['skritt_m'] % 2 == 0
    # Romslighet: plagget må være videre enn barnet, men ikke som en sekk.
    romslighet = r['bryst_ermelos_cm'] - r['kropp_bryst_cm']
    assert 3.5 <= romslighet <= 8.5, f"str {r['str_nr']}: romslighet {romslighet} cm utenfor rimelig spenn"

# Alt som skal vokse, må vokse. Alt som ikke kan krympe, må ikke krympe.
for a, b in zip(rows, rows[1:]):
    for felt in ('yoke', 'front', 'sleeve', 'bol_ermelos', 'bol_genser',
                 'erme_overarm', 'erme_mansjett', 'erme_lengde_cm',
                 'kjole_skjort_2', 'romper_skjort', 'skjort_liv', 'skjort_vidde',
                 'skritt_m', 'yoke_omganger', 'kropp_bryst_cm',
                 'kjole_lengde_cm', 'romper_lengde_cm', 'genser_lengde_cm',
                 'armhull_ermelos'):
        assert b[felt] > a[felt], f"str {b['str_nr']}: {felt} vokser ikke ({a[felt]} -> {b[felt]})"
    assert b['hals_co'] >= a['hals_co'], f"str {b['str_nr']}: halsen krymper"

# Den minste størrelsen skal være prøveoppskriften, uendret.
p = rows[0]
assert (p['hals_co'], p['oke_omganger'], p['yoke'], p['bol_ermelos']) == (48, 5, 88, 60), \
    "str 32 skal være identisk med prøveoppskriften"

for v in VOTTER:
    assert v['masker'] % BLAD_RAPPORT == 0
    assert v['fellinger'] == sorted(v['fellinger'], reverse=True)
    assert 4 <= v['fellinger'][-1] <= 8, 'antall masker å trekke sammen til slutt er urimelig'
assert VOTTER[1]['masker'] > VOTTER[0]['masker']

for s in TOFLER:
    assert s['masker'] % BLAD_RAPPORT == 0
    assert s['overfot_m'] + s['hvilende'] == s['masker']
    assert s['etter_plukk'] == s['overfot_m'] + s['hvilende'] + 2 * s['plukk']
    assert s['etter_felling'] == 2 * s['halv'], f"tøffel {s['navn_no']}: felt masketall ikke delelig i to"
    assert 0 < s['ta_m'] < s['halv']
for a, b in zip(TOFLER, TOFLER[1:]):
    assert b['masker'] > a['masker'] and b['fot_cm'] > a['fot_cm']

out = BASE / 'sizes.json'
out.write_text(json.dumps(
    dict(gauge_st=21, gauge_row=28, blad_rapport=BLAD_RAPPORT, blad_omg=BLAD_OMG,
         hals_ribb_omg=HALS_RIBB_OMG,
         plagg=rows, votter=VOTTER, tofler=TOFLER),
    ensure_ascii=False, indent=2), encoding='utf-8')

print('OK, skrev', out.name, 'for', len(rows), 'plaggstørrelser.')
print('Alle konsistenssjekk består.\n')
print(f"{'str':>4} {'hals':>5} {'øk':>3} {'bær':>5} {'rapp':>5} {'bol':>5} {'bryst':>7} "
      f"{'romsl':>6} {'erme':>5} {'mansj':>6}")
for r in rows:
    romsl = round(r['bryst_ermelos_cm'] - r['kropp_bryst_cm'], 1)
    print(f"{r['str_nr']:>4} {r['hals_co']:>5} {r['oke_omganger']:>3} {r['yoke']:>5} "
          f"{r['blad_rapporter']:>5} {r['bol_ermelos']:>5} {r['bryst_ermelos_cm']:>6} cm "
          f"{romsl:>5} {r['erme_overarm']:>5} {r['erme_mansjett']:>6}")
print()
for v in VOTTER:
    print(f"  votter {v['navn_no']:>7} (str {v['dekker']}): {v['masker']} m, "
          f"{v['omkrets_cm']} cm, felling {v['fellinger']}")
for s in TOFLER:
    print(f"  tøfler {s['navn_no']:>7} (str {s['dekker']}): {s['masker']} m, "
          f"fot {s['fot_cm']} cm, {s['etter_plukk']} m etter oppplukking")
