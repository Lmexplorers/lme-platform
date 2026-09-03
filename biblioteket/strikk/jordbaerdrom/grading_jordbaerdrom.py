# -*- coding: utf-8 -*-
"""
Jordbærdrøm, graderingsberegning for hele kolleksjonen.

Ni størrelser: 44, 50, 56, 62, 68, 74, 80, 86 og 92, altså fra liten nyfødt
til to år. Str 44 er den minste som finnes til premature og små nyfødte, og
str 92 svarer til to år.

Utgangspunktet var fem PDF-er i én størrelse, laget med ChatGPT og aldri
strikket av noen. De ga konstruksjonen og stilen, altså det runde
bærestykket delt i 8 felt, bladrapporten, frøene og kantene. Tallene er
regnet ut på nytt her, fra barnas mål og fastheten.

FASTHET
21 m og 28 omg glattstrikk = 10 x 10 cm, pinne 4 mm, DROPS Merino Extra
Fine. Brukt i alle beregninger.

BINDINGEN SOM STYRER ALT: BLADRAPPORTEN ER 8 MASKER
Bladmønsteret går rundt hele bærestykket, så masketallet der må være delelig
med 8 i hver eneste størrelse. Halsen deles i 8 felt, og hver økeomgang
legger til nøyaktig 8 masker, så halsoppligget må også være delelig med 8.

Bærestykket = 2 x forstykke + 2 x erme, så kravet "delelig med 8" betyr at
forstykke + erme må være delelig med 4. Over ni størrelser er det ikke mulig
å treffe alle brystmål på frihånd innenfor den bindingen. Derfor SØKER
skriptet under etter det paret (forstykke, erme) som ligger nærmest de
ønskede målene og samtidig oppfyller alle kravene. Ingen tall er valgt for
hånd.

HVORFOR VOTTER OG TØFLER HAR FÆRRE STØRRELSER
De små delene bruker den lille jordbærhetten, 4 masker x 4 omganger, ikke
den store bladrapporten. Grunnen til færre størrelser er derfor ikke
mønsteret, men barnet: en hånd eller fot vokser lite mellom to
nabostørrelser, og brettet ribb og knyting tar opp resten. Vottene har
2 størrelser og tøflene 4, og hver av dem dekker et oppgitt spenn av
plaggstørrelsene.

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
SMABLAD_RAPPORT = 4            # masker i den lille jordbærhetten
SMABLAD_OMG = 4                # omganger i den lille jordbærhetten

# ------------------------------------------------------------------ STØRRELSER
# (str, no-tillegg, en-tillegg, barnets brystmål cm, ønsket overarm cm,
#  hodeomkrets cm, halsoppligg m)
#
# HALSEN ER REGNET FRA HODET, IKKE GJETTET
# Genseren har ingen åpning i nakken, så halsen må gå over hodet og likevel
# ligge pent etterpå. Tommelfingerregelen i strikking er at en ribbehals,
# avslappet, skal være ca. 80 til 85 % av hodeomkretsen: ribben strekker
# resten når plagget tres på, og trekker seg sammen igjen etterpå.
#
# Halsoppligget må i tillegg være delelig med 8, siden halsen deles i 8 felt.
# Tallene under er derfor det multiplumet av 8 som lander innenfor det
# spennet, og forholdet kontrolleres eksplisitt lenger nede.
#
# Dette var opprinnelig feil: halsen sto på 48 masker i alle størrelser,
# arvet uendret fra utkastet, og det er altfor trangt (48 m = 22,9 cm, altså
# 65 % av et nyfødt hode). Feilen var ikke at genseren manglet knapp, men at
# ingen hadde regnet halsen mot hodet.
SIZES = [
    (44, "liten nyfødt / prematur", "small newborn / preemie", 32.0, 11.0, 32.0, 56),
    (50, "nyfødt, 0-1 mnd",         "newborn, 0-1 mo",         35.0, 12.0, 35.0, 64),
    (56, "1-2 mnd",                 "1-2 mo",                  38.0, 13.0, 38.0, 64),
    (62, "2-4 mnd",                 "2-4 mo",                  41.0, 14.0, 41.0, 72),
    (68, "4-6 mnd",                 "4-6 mo",                  43.0, 15.0, 43.0, 72),
    (74, "6-9 mnd",                 "6-9 mo",                  45.0, 16.0, 45.0, 80),
    (80, "9-12 mnd",                "9-12 mo",                 47.0, 17.0, 46.0, 80),
    (86, "12-18 mnd",               "12-18 mo",                49.0, 18.0, 47.0, 80),
    (92, "18-24 mnd, 2 år",         "18-24 mo, 2 years",       51.0, 19.0, 48.0, 88),
]

# Hvor stor andel av hodeomkretsen halsen skal være, avslappet.
HALS_AV_HODE_MIN = 0.78
HALS_AV_HODE_MAX = 0.90

# BUEKANTEN NEDERST
# Kjolen, romperens skjørt og det løse skjørtet ender i en buekant, slik
# designbildene viser: myke, runde buer, ikke picotspisser. Buen lages med
# fellinger i dalen mellom buene og økinger midt i hver bue, like mange av
# hver, så masketallet står stille mens kanten bølger.
#
# Hver bue er BUE_BREDDE masker. Da må masketallet nederst være delelig med
# BUE_BREDDE, og derfor rundes skjørtenes sluttmasketall av til nærmeste
# multiplum, i stedet for å la buene "nesten" gå opp.
BUE_BREDDE = 10        # masker per bue, ca. 4,8 cm
# Genserens bol og ermer ender i en grønn bølgekant, etter designet Renate
# sendte 3. september 2026. Rapporten er 6 masker, ikke 8 eller 10: den må gå
# opp både på en bol på 84 masker og på en mansjett på 16, og en bredere
# rapport ville gitt de minste mansjettene bare to bølger, eller tvunget dem
# opp i en krage. 6 masker er ca. 2,9 cm, altså en liten bølge som passer
# skalaen på den lille jordbærhetten.
#
# Bølgeomgangen er maskenøytral: 2 fellinger og 2 kast per rapport. Bølgen
# kommer av at fellingene står samlet i dalen og kastene samlet på toppen,
# ikke av at masketallet vokser. Utkastet Renate sendte spredte fellingene og
# kastene utover rapporten, og da bølger kanten nesten ikke.
BOLGE_RAPPORT = 6      # masker per bølge, ca. 2,9 cm
BOLGE_OMG_PER = 3      # omganger per bølgegjentakelse: bølgeomgang + 2 rette
BUE_OMGANGER = 5       # omganger buekanten strikkes over

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
prev_kjole_skjort = prev_romper_skjort = prev_skjort_vidde = 0
for i, (nr, tno, ten, kropp_bryst, overarm_cm, hode_cm, hals) in enumerate(SIZES):
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

    # Skjørt: *2 r, M1* gir halvannen gang vidden, deretter en jevn øking til
    # et masketall som er delelig med buebredden, slik at buekanten går opp.
    # Avrundingen må aldri gjøre et skjørt smalere enn i størrelsen under, så
    # den runder opp til neste hele bue når det trengs.
    def til_bue(m, forrige):
        n = BUE_BREDDE * round(m / BUE_BREDDE)
        while n <= forrige:
            n += BUE_BREDDE
        return n

    kjole_skjort_1 = bol_ermelos + bol_ermelos // 2
    kjole_skjort_2 = til_bue(kjole_skjort_1 + 6 * (3 + i), prev_kjole_skjort)
    romper_skjort = til_bue(bol_ermelos + bol_ermelos // 2, prev_romper_skjort)
    prev_kjole_skjort, prev_romper_skjort = kjole_skjort_2, romper_skjort

    # Bleiedelen på romperen: bolen deles i to like halvdeler, og hver del
    # felles inn til en skrittbredde som vokser med størrelsen.
    bleie_halv = bol_ermelos // 2
    skritt_m = 20 + 2 * i

    # Løst skjørt til genseren: linningen legges opp direkte på et masketall
    # som er delelig med 8, slik at bladrapporten går opp uten justering.
    skjort_liv = 72 + 8 * i
    skjort_vidde = til_bue(skjort_liv + skjort_liv // 2, prev_skjort_vidde)
    prev_skjort_vidde = skjort_vidde

    # BØLGEKANTEN PÅ GENSEREN
    # Masketallet rundes OPP til nærmeste hele bølge. Det gir samtidig den lille
    # vidden kanten trenger for å legge seg utover, uten at den blir en rynke.
    def til_bolge(m):
        return BOLGE_RAPPORT * -(-m // BOLGE_RAPPORT)
    genser_bolge = til_bolge(bol_genser)
    erme_bolge = til_bolge(erme_mansjett)
    # Skjørtet i settet fikk samme grønne bølgekant 3. september 2026, etter
    # ønske fra Renate. Kjolen og romperen beholder buekanten sin.
    skjort_bolge = til_bolge(skjort_vidde)
    # Antall gjentakelser vokser med størrelsen, så kanten ikke blir like dyp
    # på en prematur som på en toåring.
    bolge_gjent = 2 if i <= 2 else (3 if i <= 6 else 4)

    rows.append(dict(
        str_nr=nr, tillegg_no=tno, tillegg_en=ten,
        kropp_bryst_cm=kropp_bryst, hode_cm=hode_cm,
        hals_co=hals, hals_felt=8, hals_per_felt=hals // 8,
        hals_cm=round(hals / GAUGE_ST_CM, 1),
        hals_av_hode=round(hals / GAUGE_ST_CM / hode_cm, 2),
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
        bue_bredde=BUE_BREDDE, bue_omganger=BUE_OMGANGER,
        bolge_rapport=BOLGE_RAPPORT,
        genser_bolge=genser_bolge, genser_bolge_buer=genser_bolge // BOLGE_RAPPORT,
        genser_bolge_oke=genser_bolge - bol_genser,
        erme_bolge=erme_bolge, erme_bolge_buer=erme_bolge // BOLGE_RAPPORT,
        erme_bolge_oke=erme_bolge - erme_mansjett,
        bolge_gjent=bolge_gjent,
        bolge_omganger=bolge_gjent * BOLGE_OMG_PER + 2,
        bolge_cm=round((bolge_gjent * BOLGE_OMG_PER + 2) / GAUGE_ROW_CM, 1),
        kjole_buer=kjole_skjort_2 // BUE_BREDDE,
        romper_buer=romper_skjort // BUE_BREDDE,
        skjort_bolge=skjort_bolge, skjort_bolge_buer=skjort_bolge // BOLGE_RAPPORT,
        skjort_bolge_oke=skjort_bolge - skjort_vidde,
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

# ---------------------------------------------------------------------- LUER
# Jordbærluen: brettet ribb, rosa glattstrikk med frø, en krans av små
# jordbærhetter, og en grønn topp med i-cord-stilk. Knytebånd i i-cord.
#
# HVORFOR FEM STØRRELSER OG IKKE NI
# Frødiagrammet er 8 masker, så masketallet rundt luen må være delelig med 8.
# Ett slikt trinn er 3,8 cm i omkrets, mens et barnehode vokser 1 til 3 cm
# mellom to nabostørrelser. Ni luestørrelser hadde derfor blitt de samme fem
# tallene med ni navn. Fem trinn er fem reelle mål.
#
# Luen skal ligge inntil, ikke stramme. Ribben strekker seg, så omkretsen
# ligger med vilje under hodemålet. Forholdet kontrolleres nedenfor.
LUER = []
for navn_no, navn_en, dekker, hoder, m, ribb_cm, rosa_cm, band_cm in [
    ("Liten",       "Small",       "44",    [32.0],       56, 4, 4.0, 22),
    ("Medium",      "Medium",      "50-56", [35.0, 38.0], 64, 5, 4.5, 25),
    ("Stor",        "Large",       "62-68", [41.0, 43.0], 72, 5, 5.5, 28),
    ("Ekstra stor", "Extra large", "74-80", [45.0, 46.0], 80, 6, 6.0, 30),
    ("XXL",         "XXL",         "86-92", [47.0, 48.0], 88, 6, 6.5, 32),
]:
    # Toppen felles i 8 felt, én felling per felt, annenhver omgang, til 8 m.
    fell_omg = (m - 8) // 8
    fell_cm = round(2 * fell_omg / GAUGE_ROW_CM, 1)
    # Kransen med jordbærhetter er 4 omganger, som i votter og tøfler.
    krans_cm = round(SMABLAD_OMG / GAUGE_ROW_CM, 1)
    # Ferdig høyde: halv ribb (den brettes dobbel), rosa, krans, toppfelling.
    hoyde_cm = round(ribb_cm / 2 + rosa_cm + krans_cm + fell_cm, 1)
    LUER.append(dict(
        navn_no=navn_no, navn_en=navn_en, dekker=dekker, hoder=hoder, masker=m,
        spisser=m // SMABLAD_RAPPORT,
        fro_rapporter=m // BLAD_RAPPORT,
        omkrets_cm=round(m / GAUGE_ST_CM, 1),
        ribb_cm=ribb_cm, rosa_cm=rosa_cm, krans_cm=krans_cm,
        fell_omganger=fell_omg, fell_cm=fell_cm, hoyde_cm=hoyde_cm,
        band_cm=band_cm, stilk_cm=4 + (m - 56) // 16,
    ))

# --------------------------------------------------------------------- SOKKER
# Sokker strikket ovenfra og ned: grønn vridd ribb, en krans av jordbærhetter,
# rosa legg med frø, hællapp med hælvending, kile, fot og båttå som maskes
# sammen.
#
# HVORFOR SOKKENE IKKE FØLGER 8-MASKERS-REGELEN
# Alle de andre delene har et masketall delelig med 8, fordi frødiagrammet er
# 8 masker. En sokk skal sitte tett, og 8 masker er 3,8 cm i omkrets. Med bare
# multipler av 8 hopper sokken fra 11,4 til 15,2 cm, og det er for grovt for
# en fot. Sokkene er derfor delelig med 4, som jordbærhetten krever, og frøene
# får en egen rapport per størrelse som går opp i akkurat det masketallet.
# Rapporten står i oppskriften, så strikkeren slipper å regne.
#
# HÆLVENDINGEN ER SIMULERT, IKKE GJETTET
# Tallene i hælvendingen er regnet ut av funksjonen under, som teller masker
# rad for rad på samme måte som strikkeren gjør. Da kan ikke oppskriften be om
# en hælvending som ikke går opp.
def hael_vending(H):
    """Klassisk rund hælvending over H masker. Returnerer (a, b, rader, igjen).

    a = masker strikket etter den første omslagsmasken på rad 1
    b = masker vrangt etter omslagsmasken på rad 2
    rader = antall vendinger i alt
    igjen = masker igjen på hælen når vendingen er ferdig
    """
    a = H // 2
    brukt = 1 + a + 2 + 1          # omslagsmaske, a rett, 2 r sm, 1 rett
    ubearbeidet = H - brukt        # masker igjen på den siden
    levende = 1 + a + 1 + 1        # masker i den bearbeidede midten
    b = levende - ubearbeidet - 4  # samme antall skal stå igjen på andre siden
    # Etter de to første radene spises 2 masker per side per rad, 1 på siste.
    rader = 2 + 2 * -(-ubearbeidet // 2)
    igjen = H - rader
    return a, b, rader, igjen


SOKKER = []
for navn_no, navn_en, dekker, m, fro_rap, ribb_cm, legg_cm, fot_cm, ta_slutt in [
    ("Liten",       "Small",       "44-50", 24, 8, 3.0, 3.5, 7.5,  12),
    ("Medium",      "Medium",      "56-68", 28, 7, 3.5, 4.5, 10.0, 12),
    ("Stor",        "Large",       "74-86", 32, 8, 4.0, 5.5, 12.5, 12),
    ("Ekstra stor", "Extra large", "92",    36, 9, 4.0, 6.5, 14.5, 16),
]:
    hael_m = m // 2                       # hælen er halve omgangen
    vrist_m = m - hael_m
    hael_rader = hael_m                   # like mange rader som masker
    plukk = hael_rader // 2               # kantmasker langs hver side av lappen
    a, b, vend_rader, hael_igjen = hael_vending(hael_m)
    etter_plukk = hael_igjen + 2 * plukk + vrist_m
    kile_omg = (etter_plukk - m) // 2     # 2 masker felt per felleomgang
    ta_omg = (m - ta_slutt) // 4          # 4 masker felt per felleomgang
    ta_cm = round(2 * ta_omg / GAUGE_ROW_CM, 1)
    krans_cm = round(SMABLAD_OMG / GAUGE_ROW_CM, 1)
    SOKKER.append(dict(
        navn_no=navn_no, navn_en=navn_en, dekker=dekker, masker=m,
        spisser=m // SMABLAD_RAPPORT, fro_rapport=fro_rap,
        fro_antall=m // fro_rap,
        omkrets_cm=round(m / GAUGE_ST_CM, 1),
        ribb_cm=ribb_cm, legg_cm=legg_cm, krans_cm=krans_cm, fot_cm=fot_cm,
        hael_m=hael_m, vrist_m=vrist_m, hael_rader=hael_rader, plukk=plukk,
        vend_a=a, vend_b=b, vend_rader=vend_rader, hael_igjen=hael_igjen,
        etter_plukk=etter_plukk, kile_omganger=kile_omg,
        ta_omganger=ta_omg, ta_slutt=ta_slutt, ta_cm=ta_cm,
        fot_for_ta_cm=round(fot_cm - ta_cm, 1),
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
    # Genseren har ingen åpning i nakken. Halsen må derfor gå over hodet, og
    # det er dette forholdet som avgjør det, ikke en magefølelse.
    assert HALS_AV_HODE_MIN <= r['hals_av_hode'] <= HALS_AV_HODE_MAX, (
        f"str {r['str_nr']}: halsen er {r['hals_cm']} cm mot et hode på "
        f"{r['hode_cm']} cm, altså {r['hals_av_hode'] * 100:.0f} %. "
        f"Skal ligge mellom {HALS_AV_HODE_MIN * 100:.0f} og "
        f"{HALS_AV_HODE_MAX * 100:.0f} %, ellers går genseren enten ikke over "
        f"hodet eller henger løst rundt halsen.")
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
    # Bølgekanten på genseren: må gå opp i hele bølger, både på bol og erme.
    for felt, buer, fra in (('genser_bolge', 'genser_bolge_buer', 'bol_genser'),
                            ('erme_bolge', 'erme_bolge_buer', 'erme_mansjett'),
                            ('skjort_bolge', 'skjort_bolge_buer', 'skjort_vidde')):
        assert r[felt] % BOLGE_RAPPORT == 0, (
            f"str {r['str_nr']}: {felt} = {r[felt]} går ikke opp i bølger à {BOLGE_RAPPORT}")
        assert r[buer] * BOLGE_RAPPORT == r[felt]
        # Kanten må ikke være smalere enn det den strikkes ut fra.
        assert r[felt] >= r[fra], f"str {r['str_nr']}: {felt} er smalere enn {fra}"
        # Og den må ikke bli en rynke. Mer enn en drøy fjerdedel ekstra, og
        # kanten står ut i stedet for å legge seg.
        assert r[felt] - r[fra] < BOLGE_RAPPORT, (
            f"str {r['str_nr']}: {felt} øker {r[felt] - r[fra]} masker, det er en hel bølge for mye")
    # Færre enn tre bølger rundt leses ikke som en bølgekant, bare som en skjev kant.
    assert r['erme_bolge_buer'] >= 3, f"str {r['str_nr']}: bare {r['erme_bolge_buer']} bølger på ermet"
    assert r['genser_bolge_buer'] >= 12, f"str {r['str_nr']}: bare {r['genser_bolge_buer']} bølger på bolen"
    assert r['skjort_bolge_buer'] >= 12, f"str {r['str_nr']}: bare {r['skjort_bolge_buer']} bølger på skjørtet"

    # Buekanten: hver bue er BUE_BREDDE masker, så kanten må gå opp i hele
    # buer. Gjør den ikke det, ender strikkeren med en halv bue midt bak.
    # Kjolen og romperen ender i buekant. Skjørtet gjør det ikke lenger.
    for felt, buer in (('kjole_skjort_2', 'kjole_buer'), ('romper_skjort', 'romper_buer')):
        assert r[felt] % BUE_BREDDE == 0, (
            f"str {r['str_nr']}: {felt} = {r[felt]} går ikke opp i buer à {BUE_BREDDE}")
        assert r[buer] * BUE_BREDDE == r[felt]
        assert r[buer] >= 10, f"str {r['str_nr']}: for få buer ({r[buer]}) til at kanten ser ut som en bue"
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
    for felt in ('genser_bolge', 'erme_bolge', 'skjort_bolge', 'genser_bolge_buer',
                 'erme_bolge_buer', 'skjort_bolge_buer', 'bolge_omganger'):
        assert b[felt] >= a[felt], f"str {b['str_nr']}: {felt} krymper ({a[felt]} -> {b[felt]})"

# Str 44 er festet med et eksplisitt tall, slik at en endring i inndataene
# øverst ikke kan flytte den ubemerket. Endrer du den bevisst, endrer du
# tallet her samtidig, og da er det et valg og ikke et uhell.
p = rows[0]
assert (p['hals_co'], p['yoke'], p['bol_ermelos']) == (56, 112, 80), \
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

for lue in LUER:
    # Frøomgangene er 8 masker brede, jordbærhettene 4. Begge må gå opp rundt.
    assert lue['masker'] % BLAD_RAPPORT == 0, f"lue {lue['navn_no']}: frøomgangen går ikke opp"
    assert lue['masker'] % SMABLAD_RAPPORT == 0, f"lue {lue['navn_no']}: hettene går ikke opp"
    # Toppen felles i 8 felt og skal ende på nøyaktig 8 masker.
    assert lue['masker'] - 8 * lue['fell_omganger'] == 8, \
        f"lue {lue['navn_no']}: toppfellingen ender ikke på 8 masker"
    # Luen skal ligge inntil hodet uten å stramme. Ribben strekker seg, så
    # omkretsen ligger under hodemålet, men ikke hvor som helst under.
    for hode in lue['hoder']:
        andel = lue['omkrets_cm'] / hode
        assert 0.78 <= andel <= 0.92, \
            f"lue {lue['navn_no']}: {lue['omkrets_cm']} cm er {andel:.0%} av hode {hode} cm"
    # Høyden må dekke ørene uten at luen blir en pose.
    for hode in lue['hoder']:
        assert 0.31 <= lue['hoyde_cm'] / hode <= 0.42, \
            f"lue {lue['navn_no']}: høyde {lue['hoyde_cm']} cm passer ikke hode {hode} cm"
for a, b in zip(LUER, LUER[1:]):
    for felt in ('masker', 'hoyde_cm', 'band_cm', 'fell_omganger'):
        assert b[felt] > a[felt], f"lue {b['navn_no']}: {felt} vokser ikke"

for sk in SOKKER:
    # Jordbærhetten er 4 masker og må gå opp rundt.
    assert sk['masker'] % SMABLAD_RAPPORT == 0, f"sokk {sk['navn_no']}: hettene går ikke opp"
    # Frørapporten er egen per størrelse, og MÅ gå opp i akkurat det masketallet.
    assert sk['masker'] % sk['fro_rapport'] == 0, \
        f"sokk {sk['navn_no']}: frørapporten {sk['fro_rapport']} går ikke opp i {sk['masker']} m"
    assert 6 <= sk['fro_rapport'] <= 9, f"sokk {sk['navn_no']}: frøene står for tett eller for spredt"
    # Hælen er halve omgangen, vristen den andre halvparten.
    assert sk['hael_m'] + sk['vrist_m'] == sk['masker']
    assert sk['hael_m'] % 2 == 0, f"sokk {sk['navn_no']}: hælen er ikke delelig i to"
    # Hælvendingen må ende på et partall, ellers går ikke kilefellingen opp.
    assert sk['hael_igjen'] % 2 == 0, \
        f"sokk {sk['navn_no']}: hælvendingen ender på {sk['hael_igjen']} masker, ikke et partall"
    assert 0 < sk['hael_igjen'] < sk['hael_m']
    assert sk['vend_b'] >= 1, f"sokk {sk['navn_no']}: rad 2 i hælvendingen går ikke opp"
    # Kilen må felle tilbake til nøyaktig det masketallet sokken hadde.
    assert sk['etter_plukk'] - 2 * sk['kile_omganger'] == sk['masker'], \
        f"sokk {sk['navn_no']}: kilen feller ikke tilbake til {sk['masker']} masker"
    assert sk['kile_omganger'] > 0
    # Tåen felles med 4 masker per omgang og må ende på nøyaktig ta_slutt.
    assert sk['masker'] - 4 * sk['ta_omganger'] == sk['ta_slutt'], \
        f"sokk {sk['navn_no']}: tåen ender ikke på {sk['ta_slutt']} masker"
    assert sk['ta_slutt'] % 4 == 0
    # Foten må være lengre enn tåen, ellers er tåen ferdig før foten er begynt.
    assert sk['fot_for_ta_cm'] > 2.0, \
        f"sokk {sk['navn_no']}: bare {sk['fot_for_ta_cm']} cm fot før tåfellingen"
for a, b in zip(SOKKER, SOKKER[1:]):
    for felt in ('masker', 'fot_cm', 'legg_cm', 'hael_m', 'etter_plukk'):
        assert b[felt] > a[felt], f"sokk {b['navn_no']}: {felt} vokser ikke"

# Sokker og tøfler er gradert etter samme fotlengder, og skal dekke de samme
# plaggstørrelsene. Ellers vil et barn ha én størrelse på foten og en annen i
# tøffelen utenpå.
assert [sk['dekker'] for sk in SOKKER] == [t['dekker'] for t in TOFLER], \
    'sokker og tøfler dekker ikke de samme størrelsene'
assert [sk['fot_cm'] for sk in SOKKER] == [t['fot_cm'] for t in TOFLER], \
    'sokker og tøfler er gradert etter ulike fotlengder'

# Hver plaggstørrelse skal ha nøyaktig én lue. Ingen hull, ingen dobbeltdekning.
dekket = []
for lue in LUER:
    d = lue['dekker'].split('-')
    dekket += [int(x) for x in d] if len(d) == 2 else [int(d[0])]
alle = [r['str_nr'] for r in rows]
lue_str = []
for lue in LUER:
    d = lue['dekker'].split('-')
    if len(d) == 1:
        lue_str.append(int(d[0]))
    else:
        lo, hi = int(d[0]), int(d[1])
        lue_str += [n for n in alle if lo <= n <= hi]
assert lue_str == alle, f"luene dekker {lue_str}, ikke alle ni plaggstørrelsene"

out = BASE / 'sizes.json'
out.write_text(json.dumps(
    dict(gauge_st=21, gauge_row=28, blad_rapport=BLAD_RAPPORT, blad_omg=BLAD_OMG,
         hals_ribb_omg=HALS_RIBB_OMG,
         plagg=rows, votter=VOTTER, tofler=TOFLER, luer=LUER, sokker=SOKKER),
    ensure_ascii=False, indent=2), encoding='utf-8')

print('OK, skrev', out.name, 'for', len(rows), 'plaggstørrelser.')
print('Alle konsistenssjekk består.\n')
print(f"{'str':>4} {'hals':>5} {'hals cm':>8} {'hode':>5} {'%':>4} {'øk':>3} {'bær':>5} "
      f"{'bol':>5} {'bryst':>8} {'romsl':>6} {'bær cm':>7} {'jevne':>6}")
for r in rows:
    romsl = round(r['bryst_ermelos_cm'] - r['kropp_bryst_cm'], 1)
    print(f"{r['str_nr']:>4} {r['hals_co']:>5} {r['hals_cm']:>7} {r['hode_cm']:>5.0f} "
          f"{r['hals_av_hode'] * 100:>3.0f}% {r['oke_omganger']:>3} {r['yoke']:>5} "
          f"{r['bol_ermelos']:>5} {r['bryst_ermelos_cm']:>6} cm {romsl:>5} "
          f"{r['yoke_cm']:>6} {r['yoke_jevne']:>6}")
print()
for v in VOTTER:
    print(f"  votter {v['navn_no']:>12} (str {v['dekker']}): {v['masker']} m, "
          f"{v['omkrets_cm']} cm, felling {v['fellinger']}")
for s in TOFLER:
    print(f"  tøfler {s['navn_no']:>12} (str {s['dekker']}): {s['masker']} m, "
          f"fot {s['fot_cm']} cm, {s['etter_plukk']} m etter oppplukking")
for lue in LUER:
    print(f"  lue    {lue['navn_no']:>12} (str {lue['dekker']}): {lue['masker']} m, "
          f"{lue['omkrets_cm']} cm rundt, {lue['hoyde_cm']} cm høy, "
          f"{lue['fell_omganger']} felleomganger")
for sk in SOKKER:
    print(f"  sokk   {sk['navn_no']:>12} (str {sk['dekker']}): {sk['masker']} m, "
          f"fot {sk['fot_cm']} cm, hæl {sk['hael_m']} m -> {sk['hael_igjen']} m, "
          f"{sk['etter_plukk']} m etter oppplukking, {sk['kile_omganger']} kileomg")
