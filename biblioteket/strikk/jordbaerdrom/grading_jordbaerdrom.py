# -*- coding: utf-8 -*-
"""
Jordbærdrøm, graderingsberegning for hele kolleksjonen.

Ni størrelser: 44, 50, 56, 62, 68, 74, 80, 86 og 92, altså fra liten nyfødt
til to år. Str 44 er den minste som finnes til premature og små nyfødte, og
str 92 svarer til to år.

Utgangspunktet var fem PDF-er i én størrelse, laget med ChatGPT og aldri
strikket av noen. De ga konstruksjonen og stilen, altså det runde
bærestykket delt i 8 felt, bladrapporten, frøene og picotkanten. Tallene er
regnet ut på nytt her, fra barnas mål og fastheten.

FASTHET
21 m og 28 omg glattstrikk = 10 x 10 cm, pinne 4 mm, DROPS Merino Extra
Fine. Brukt i alle beregninger.

BINDINGEN SOM STYRER ALT: BLADRAPPORTEN ER 8 MASKER
Bladmønsteret går rundt hele bærestykket, så masketallet der må være delelig
med 8 i hver eneste størrelse. Halsen deles i 8 felt, og hver økeomgang
legger til nøyaktig 8 masker, så halsoppligget må også være delelig med 8.

Bærestykket = 2 x forstykke + 2 x erme, så kravet «delelig med 8» betyr at
forstykke + erme må være delelig med 4. Over ni størrelser er det ikke mulig
å treffe alle brystmål på frihånd innenfor den bindingen. Derfor SØKER
skriptet under etter det paret (forstykke, erme) som ligger nærmest de
ønskede målene og samtidig oppfyller alle kravene. Ingen tall er valgt for
hånd.

HVORFOR VOTTER OG TØFLER HAR FÆRRE STØRRELSER
Samme binding slår ut motsatt vei på de små delene: en bladrapport er ca.
3,8 cm i omkrets, mens en hånd eller fot vokser langt mindre enn det mellom
to nabostørrelser. Vottene har derfor 2 størrelser og tøflene 4, og hver av
dem dekker et oppgitt spenn av plaggstørrelsene.

Vottene er uten tommel. Det er riktig på en baby, men et barn på over ett år
vil ha tommel, så vottene stopper med vilje ved str 74.

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
# (str, no-tillegg, en-tillegg, barnets brystmål cm, ønsket overarm cm,
#  halsoppligg m)
#
# Brystmålene er vanlige norske barnemål. Ønsket overarm er armens omkrets
# med litt slark. Halsoppligget må være delelig med 8, så det finnes bare
# 48, 56, 64 og 72 å velge mellom i dette spennet: halsen holdes derfor på
# samme masketall over flere størrelser, og antall økeomganger tar resten av
# veksten. Halsen MÅ vokse: genseren har ingen åpning i nakken og skal over
# hodet, og hodet vokser raskere enn brystet.
SIZES = [
    (44, "liten nyfødt / prematur", "small newborn / preemie", 32.0, 11.0, 48),
    (50, "nyfødt, 0-1 mnd",         "newborn, 0-1 mo",         35.0, 12.0, 48),
    (56, "1-2 mnd",                 "1-2 mo",                  38.0, 13.0, 56),
    (62, "2-4 mnd",                 "2-4 mo",                  41.0, 14.0, 56),
    (68, "4-6 mnd",                 "4-6 mo",                  43.0, 15.0, 56),
    (74, "6-9 mnd",                 "6-9 mo",                  45.0, 16.0, 64),
    (80, "9-12 mnd",                "9-12 mo",                 47.0, 17.0, 64),
    (86, "12-18 mnd",               "12-18 mo",                49.0, 18.0, 64),
    (92, "18-24 mnd, 2 år",         "18-24 mo, 2 years",       51.0, 19.0, 72),
]

ROMSLIGHET = 6.0       # cm romslighet over brystet på den ermeløse bolen
UNDERARM_ERMELOS = 2   # masker lagt opp under armen på kjole og romper
UNDERARM_GENSER = 4    # masker lagt opp under armen på genseren
HALS_RIBB_OMG = 5      # vridd ribb i halsen før økingene

# Lengder i cm per størrelse, i samme rekkefølge som SIZES.
BOL_KJOLE      = [9, 10, 11, 12, 13, 14, 15, 16, 17]    # under armen til livet
SKJORT_KJOLE   = [17, 19, 21, 23, 25, 27, 29, 31, 33]   # fra livet og ned
BOL_ROMPER     = [10, 11, 12, 13, 14, 15, 16, 17, 18]   # under armen til livet
SKJORT_ROMPER  = [8, 9, 10, 11, 12, 13, 14, 15, 16]     # kort overskjørt
BLEIE_ROMPER   = [8, 9, 10, 11, 12, 13, 14, 15, 16]     # livet til delingen
BOL_GENSER     = [11, 12, 13, 14, 15, 16, 17, 18, 19]   # under armen til ribben
ERME_GENSER    = [14, 16, 18, 20, 21, 22, 23, 24, 25]   # under armen og ut
SKJORT_LENGDE  = [16, 18, 20, 22, 24, 26, 28, 30, 32]   # løst skjørt fra linningen

# Bærestykkets dybde, fra halskanten ned til under armen. Denne styres av
# barnets mål og IKKE av antall økeomganger. Grunnen: halsoppligget kan bare
# være 48, 56, 64 eller 72, så der halsen hopper opp et trinn, blir det
# færre økeomganger igjen til å nå samme bærestykke. Uten et eget mål ville
# bærestykket da stå stille i dybde akkurat der barnet blir større, og
# armhullet havne for høyt. Differansen mellom målet og økingene fylles
# med jevne omganger uten økinger, rett før bladpartiet.
YOKE_DYBDE     = [10.0, 11.5, 12.0, 13.0, 13.5, 14.0, 14.5, 15.0, 15.5]


# ------------------------------------------------------- SØK ETTER MASKETALLENE
def finn_par(mal_bryst_m, mal_erme_m, min_front, min_erme):
    """Finner (forstykke, erme) nærmest målet, innenfor bindingene.

    Kravene, i rekkefølge:
      * begge må være partall, ellers går ikke ribben i mansjetten opp
      * forstykke + erme må være delelig med 4, slik at bærestykket
        (2 x forstykke + 2 x erme) blir delelig med 8 og bladrapporten går opp
      * begge må være strengt større enn forrige størrelse
    Blant kandidatene velges den som ligger nærmest de ønskede maskene, med
    dobbel vekt på brystet, siden det er målet som avgjør om plagget passer.
    """
    beste, beste_avvik = None, None
    for front in range(min_front, min_front + 40, 2):
        for erme in range(min_erme, min_erme + 24, 2):
            if (front + erme) % 4 != 0:
                continue
            bol = 2 * front + 2 * UNDERARM_ERMELOS
            avvik = 2 * abs(bol - mal_bryst_m) + abs(erme + UNDERARM_GENSER - mal_erme_m)
            if beste_avvik is None or avvik < beste_avvik:
                beste, beste_avvik = (front, erme), avvik
    return beste


rows = []
prev_front, prev_erme, prev_mansjett = 0, 0, 0
for i, (nr, tno, ten, kropp_bryst, overarm_cm, hals) in enumerate(SIZES):
    mal_bryst_m = (kropp_bryst + ROMSLIGHET) * GAUGE_ST_CM
    mal_erme_m = overarm_cm * GAUGE_ST_CM
    front, sleeve = finn_par(mal_bryst_m, mal_erme_m, prev_front + 2, prev_erme + 2)
    prev_front, prev_erme = front, sleeve
    back = front
    yoke = 2 * front + 2 * sleeve

    # Antall økeomganger følger av halsen og bærestykket: hver økeomgang
    # legger til nøyaktig 8 masker, én i hvert av de 8 feltene.
    assert (yoke - hals) % 8 == 0, f"str {nr}: hals og bærestykke går ikke opp i 8 felt"
    inc = (yoke - hals) // 8

    bol_ermelos = front + back + 2 * UNDERARM_ERMELOS
    bol_genser = front + back + 2 * UNDERARM_GENSER
    erme_overarm = sleeve + UNDERARM_GENSER

    # Ermefellinger: 2 masker per felleomgang. Mansjetten skal bli ca. 70 % av
    # overarmen, avrundet til et partall så ribben går opp. Avrundingen kan gi
    # samme mansjett i to nabostørrelser (overarmen vokser bare 2 masker om
    # gangen i deler av spennet), og en mansjett som står stille mens armen
    # vokser blir for trang. Derfor tvinges den opp minst 2 masker per
    # størrelse.
    erme_mansjett = max(2 * round(erme_overarm * 0.70 / 2), prev_mansjett + 2)
    prev_mansjett = erme_mansjett
    erme_fellinger = (erme_overarm - erme_mansjett) // 2

    # Bærestykkets dybde settes av målet over, ikke av økingene. Økingene tar
    # inc x 2 omganger (annenhver omgang), bladdiagrammet tar BLAD_OMG, og
    # til slutt kommer én utjevningsomgang i rosa. Det som er igjen opp til
    # måldybden, strikkes som jevne omganger uten økinger rett før bladene.
    yoke_omg = round(YOKE_DYBDE[i] * GAUGE_ROW_CM)
    yoke_jevne = yoke_omg - inc * 2 - BLAD_OMG - 1
    yoke_cm = round(yoke_omg / GAUGE_ROW_CM, 1)

    # Armhullskant: de hvilende ermemaskene, maskene lagt opp under armen og
    # 2 masker plukket opp i hjørnene. Alltid et partall, siden kanten
    # strikkes i vridd ribb med 1 vridd rett og 1 vrang.
    armhull_ermelos = sleeve + UNDERARM_ERMELOS + 2

    # Skjørt: *2 r, M1* gir halvannen gang vidden, deretter en jevn øking til.
    kjole_skjort_1 = bol_ermelos + bol_ermelos // 2
    kjole_skjort_2 = kjole_skjort_1 + 6 * (3 + i)
    romper_skjort = bol_ermelos + bol_ermelos // 2

    # Bleiedelen på romperen: bolen deles i to like halvdeler, og hver del
    # felles inn til en skrittbredde som vokser med størrelsen.
    bleie_halv = bol_ermelos // 2
    skritt_m = 20 + 2 * i

    # Løst skjørt til genseren: linningen legges opp direkte på et masketall
    # som er delelig med 8, slik at bladrapporten går opp uten justering.
    skjort_liv = 72 + 8 * i
    skjort_vidde = skjort_liv + skjort_liv // 2

    rows.append(dict(
        str_nr=nr, tillegg_no=tno, tillegg_en=ten,
        kropp_bryst_cm=kropp_bryst,
        hals_co=hals, hals_felt=8, hals_per_felt=hals // 8,
        oke_omganger=inc, oke_pinner=inc * 2,
        yoke=yoke, blad_rapporter=yoke // BLAD_RAPPORT,
        yoke_omganger=yoke_omg, yoke_jevne=yoke_jevne, yoke_cm=yoke_cm,
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
# Egne, grovere størrelsestrinn, se modul-docstringen. dekker = hvilke
# plaggstørrelser hvert trinn er beregnet for.
VOTTER = []
for navn_no, navn_en, dekker, m, ribb_cm, hand_cm, snor_cm in [
    ("Liten", "Small", "44-56", 24, 5, 4.5, 40),
    ("Stor",  "Large", "62-74", 32, 6, 6.0, 50),
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
    ("Liten",       "Small",       "44-50", 24, 5, 7.5,  9, 12, 6, 30),
    ("Medium",      "Medium",      "56-68", 32, 6, 10.0, 11, 14, 7, 36),
    ("Stor",        "Large",       "74-86", 40, 7, 12.5, 13, 17, 9, 42),
    ("Ekstra stor", "Extra large", "92",    48, 8, 14.5, 15, 20, 11, 48),
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

assert len(rows) == 9

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
    assert r['erme_fellinger'] >= 2
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
    # Bærestykket må være dypt nok til å nå ned under armen, men ikke så dypt
    # at armhullet havner nede på magen.
    assert 8.0 <= r['yoke_cm'] <= 18.0, f"str {r['str_nr']}: bærestykke {r['yoke_cm']} cm urimelig"
    # Det må være plass til økingene, bladpartiet og minst én jevn omgang
    # innenfor den dybden bærestykket skal ha.
    assert r['yoke_jevne'] >= 1, (
        f"str {r['str_nr']}: bærestykket er for grunt til økingene og bladpartiet, "
        f"mangler {1 - r['yoke_jevne']} omgang(er)")
    assert r['yoke_omganger'] == r['oke_pinner'] + r['yoke_jevne'] + BLAD_OMG + 1

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

# Str 44 er festet med et eksplisitt tall, slik at en endring i inndataene
# øverst ikke kan flytte den ubemerket. Endrer du den bevisst, endrer du
# tallet her samtidig, og da er det et valg og ikke et uhell.
p = rows[0]
assert (p['hals_co'], p['yoke'], p['bol_ermelos']) == (48, 112, 80), \
    f"str 44 har flyttet seg til {(p['hals_co'], p['yoke'], p['bol_ermelos'])}, kontroller at det er ment"

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
print(f"{'str':>4} {'hals':>5} {'øk':>3} {'bær':>5} {'rapp':>5} {'bol':>5} {'bryst':>8} "
      f"{'romsl':>6} {'bær cm':>7} {'jevne':>6} {'erme':>5} {'mansj':>6}")
for r in rows:
    romsl = round(r['bryst_ermelos_cm'] - r['kropp_bryst_cm'], 1)
    print(f"{r['str_nr']:>4} {r['hals_co']:>5} {r['oke_omganger']:>3} {r['yoke']:>5} "
          f"{r['blad_rapporter']:>5} {r['bol_ermelos']:>5} {r['bryst_ermelos_cm']:>6} cm "
          f"{romsl:>5} {r['yoke_cm']:>6} {r['yoke_jevne']:>6} {r['erme_overarm']:>5} "
          f"{r['erme_mansjett']:>6}")
print()
for v in VOTTER:
    print(f"  votter {v['navn_no']:>12} (str {v['dekker']}): {v['masker']} m, "
          f"{v['omkrets_cm']} cm, felling {v['fellinger']}")
for s in TOFLER:
    print(f"  tøfler {s['navn_no']:>12} (str {s['dekker']}): {s['masker']} m, "
          f"fot {s['fot_cm']} cm, {s['etter_plukk']} m etter oppplukking")
