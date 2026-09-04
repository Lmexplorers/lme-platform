# -*- coding: utf-8 -*-
"""
Jordbærdrøm skjørt, gradert i ni størrelser (44 til 92).

Toppstrikket skjørt med grønn ribb i livet, bladparti øverst, frø innstrikket
i det rosa hele veien ned, og buekant med en smal grønn kant nederst.

Genseren er en egen oppskrift, i build_genser.py. Renate 3. september 2026:
genseren og skjørtet skal være hver sin oppskrift, ikke ett felles hefte.

Alle masketall leses fra sizes.json, som skrives av grading_jordbaerdrom.py.
"""
import _jordbaer_felles as f
from _jordbaer_felles import (PLAGG, banner, rosep, sagep, card, cme, ul,
                              tabell, str_head, side, L)

PH2_NO = 'LME STRIKKEOPPSKRIFT   |   SKJØRT'
PH2_EN = 'LME KNITTING PATTERN   |   SKIRT'

# Garnmengden er bare skjørtets: den rosa vidden og den grønne linningen.
GARN = [[p['str_nr'],
         '%d g' % (5 * round((p['skjort_vidde'] * p['skjort_lengde_cm'] * 0.20 + 30) / 5)),
         '%d g' % (5 * round((p['skjort_liv'] * 0.30 + 12) / 5)), '5 g']
        for p in PLAGG]

EKSTRA_NO = [['Pinne 4 mm', 'rundpinne, 40 cm, til livet og hele skjørtet'],
             ['Myk elastikk', 'ca. 1 cm bred, valgfritt til linningen'],
             ['Stoppenål', 'til å feste tråder og eventuelt sy ned linningen'],
             ['Maskemarkør', 'til å merke omgangens begynnelse']]
EKSTRA_EN = [['4 mm needles', 'circular, 40 cm, for the waist and the whole skirt'],
             ['Soft elastic', 'approx. 1 cm wide, optional for the waistband'],
             ['Darning needle', 'for weaving in ends and sewing down the waistband'],
             ['Stitch marker', 'to mark the beginning of the round']]


def komma(x):
    return str(x).replace('.', ',')


def sider(lang):
    def pg(body, num):
        return side(body, num, lang, PH2_NO, PH2_EN)
    S = str_head(lang)
    m = L(lang, ' m', ' sts')
    P = []

    # --------------------------------------------------------------- 1 FORSIDE
    P.append(pg(f.forside(
        lang,
        L(lang, 'JORDBÆRDRØM SKJØRT', 'STRAWBERRY DREAM SKIRT'),
        L(lang, 'SKJØRT · STØRRELSE 44 TIL 92', 'SKIRT · SIZES 44 TO 92'),
        L(lang,
          'Toppstrikket skjørt med grønn ribb i livet og bladpartiet rett under. Frøene '
          'strikkes inn i det rosa hele veien ned, og skjørtet ender i buekant med en smal '
          'grønn kant. Kanten er halvannen gang livvidden, så skjørtet svinger ut uten å '
          'bli tungt. Gradert i ni størrelser, fra liten nyfødt og opp til to år.',
          'A top-down skirt with a green rib at the waist and the leaf panel right below '
          'it. The seeds are knitted into the pink all the way down, and the skirt ends in '
          'a scalloped hem with a narrow green edge. The hem is one and a half times the '
          'waist, so the skirt flares without becoming heavy. Graded in nine sizes, from '
          'small newborn to two years.'),
        bilde='skjort.jpg'), 1))

    # ---------------------------------------------------------- 2 FØR DU BEGYNNER
    P.append(pg(
        banner(L(lang, 'FØR DU BEGYNNER', 'BEFORE YOU START')) +
        card('<p>' + L(lang,
             'Skjørtet strikkes ovenfra og ned i runden, fra livet mot kanten. Det legges '
             'opp med grønt, får en ribb i livet, og deretter bladpartiet. Så økes det til '
             'full vidde i én omgang, og resten er rosa glattstrikk med frø ned til '
             'buekanten. Alt strikkes i ett stykke, uten sømmer.',
             'The skirt is knitted top-down in the round, from the waist towards the hem. '
             'It is cast on in green, gets a rib at the waist, and then the leaf panel. '
             'Then it is increased to full width in one round, and the rest is pink '
             'stocking stitch with seeds down to the scalloped hem. It is all worked in '
             'one piece, with no seams.') + '</p>') +
        rosep(L(lang, 'DETTE LÆRER DU', 'WHAT YOU WILL LEARN')) +
        card(ul(L(lang,
                  ['å strikke et skjørt ovenfra og ned i runden',
                   'å strikke ribbet linning som tåler å strekkes over hoftene',
                   'å øke til full vidde i én omgang, jevnt fordelt',
                   'å strikke buekant med en smal grønn kant'],
                  ['knitting a skirt top-down in the round',
                   'working a ribbed waistband that will stretch over the hips',
                   'increasing to full width in one round, evenly spread',
                   'working a scalloped hem with a narrow green edge']))) +
        sagep(L(lang, 'VANSKELIGHETSGRAD', 'DIFFICULTY')) +
        cme(L(lang,
              'Lett. Skjørtet er det enkleste plagget i kolleksjonen, og et fint sted å '
              'begynne hvis du er ny til å strikke i runden. Vil du ha en matchende '
              'genser, finnes Jordbærdrøm genser som egen oppskrift.',
              'Easy. The skirt is the simplest garment in the collection, and a good place '
              'to start if you are new to knitting in the round. If you want a matching '
              'jumper, Strawberry Dream jumper is available as a pattern of its own.')), 2))

    # ------------------------------------------------------------- 3 STØRRELSER
    mh = [S] + L(lang, ['Livvidde', 'Vidde nederst', 'Skjørtelengde', 'Med linning'],
                 ['Waist', 'Width at the hem', 'Skirt length', 'With the waistband'])
    mr = [[p['str_nr'], komma(p['skjort_liv_cm']) + ' cm',
           komma(p['skjort_vidde_cm']) + ' cm', str(p['skjort_lengde_cm']) + ' cm',
           str(p['skjort_lengde_cm'] + 3) + ' cm'] for p in PLAGG]
    for i, kropp in enumerate(f.side_storrelser(lang, 'skjørtet', mr, mh)):
        P.append(pg(kropp, 3 + i))

    # ------------------------------------------------------------------- 4 GARN
    P.append(pg(f.side_garn(lang, GARN, L(lang, EKSTRA_NO, EKSTRA_EN)), 5))

    # ---------------------------------------------------------------- 5 DIAGRAM
    P.append(pg(f.side_diagram(lang), 6))

    # -------------------------------------------------------- 10 SKJØRT, LINNING
    lin_h = [S] + L(lang, ['Legg opp', 'Bladrapporter', 'Livvidde', 'Ribb', 'Grønt over ribben'],
                    ['Cast on', 'Leaf repeats', 'Waist', 'Rib', 'Green above the rib'])
    lin_r = [[p['str_nr'], str(p['skjort_liv']) + m, str(p['skjort_rapporter']) + ' x',
              komma(p['skjort_liv_cm']) + ' cm', L(lang, '3 cm', '3 cm'),
              L(lang, '2 cm', '2 cm')] for p in PLAGG]
    P.append(pg(
        banner(L(lang, 'SKJØRT · 1 · LINNINGEN', 'SKIRT · 1 · THE WAISTBAND')) +
        '<p>' + L(lang,
        'Legg løst opp med grønt og samle til en omgang. Masketallet er alt delelig med 8, '
        'så bladrapporten går opp uten justering. Strikk *1 rett, 1 vrang* rundt i 3 cm, og '
        'deretter 2 cm grønn glattstrikk. Der begynner bladrapporten, som står på neste '
        'side.',
        'Cast on loosely in green and join in the round. The stitch count already divides by '
        '8, so the leaf repeat comes out even without adjustment. Work *k1, p1* in the round '
        'for 3 cm, then 2 cm of green stocking stitch. That is where the leaf repeat '
        'starts, on the next page.') +
        '</p>' + f.sidebilde('skjort.jpg') +
        card(tabell(lin_h, lin_r, min_index=0)) +
        cme(L(lang,
              'Legg opp løst. Ribben skal kunne strekkes over hoftene, og en stram '
              'oppleggingskant er den vanligste grunnen til at et babyskjørt ikke går på. '
              'Vil du ha elastikk i livet, står den andre måten å strikke linningen på '
              'nederst på side 9.',
              'Cast on loosely. The rib must stretch over the hips, and a tight cast-on '
              'edge is the most common reason a baby skirt will not go on. If you want '
              'elastic at the waist, the other way of working the waistband is at the '
              'bottom of page 9.')), 7))

    # ------------------------------------------------------ 11 SKJØRT, BLAD OG VIDDE
    sk_h = [S] + L(lang, ['Masker i linningen', 'Bladrapporter', '*2 r, M1* gir',
                          'Skjørtevidde', 'Lengde fra linningen'],
                   ['Waistband stitches', 'Leaf repeats', '*k2, M1* gives', 'Skirt width',
                    'Length from waistband'])
    sk_r = [[p['str_nr'], str(p['skjort_liv']) + m, str(p['skjort_rapporter']) + ' x',
             str(p['skjort_vidde']) + m, komma(p['skjort_vidde_cm']) + ' cm',
             str(p['skjort_lengde_cm']) + ' cm'] for p in PLAGG]
    P.append(pg(
        banner(L(lang, 'SKJØRT · 2 · BLAD, VIDDE OG LENGDE',
                 'SKIRT · 2 · LEAVES, WIDTH AND LENGTH')) +
        '<p>' + L(lang,
        'Strikk bladrapporten fra side 6 over 8 masker, gjentatt så mange ganger som '
        'kolonnen din sier. Bytt så til rosa og strikk *2 rett, 1 økning*, gjenta rundt. Nå '
        'er skjørtet ute i full vidde. Fortsett i rosa glattstrikk, og hold frørytmen '
        'gående uavbrutt nedover hele skjørtet, til '
        'skjørtet måler lengden i siste kolonne, målt nedenfor linningen.',
        'Work the leaf repeat from page 6 over 8 stitches, repeated as many times as your '
        'column says. Then change to pink and work *k2, M1*, repeat round. The skirt is now '
        'at full width. Continue in pink stocking stitch, keeping the seed rhythm '
        'running unbroken all the way down the skirt, until the '
        'skirt measures the length in the last column, measured below the waistband.') +
        '</p>' +
        card(tabell(sk_h, sk_r, min_index=0)) +
        cme(L(lang,
              'Bladene på skjørtet peker nedover, akkurat som på genserens bærestykke, så '
              'de to delene ser like ut når de brukes sammen.',
              'The leaves on the skirt point downwards, just as on the jumper yoke, so the '
              'two pieces match when worn together.')), 8))

    # -------------------------------------------- 12 SKJØRT, BØLGEKANT OG ELASTIKK
    bue_h = [S] + L(lang, ['Masker nederst', 'Buer', 'Masker per bue', 'Buerunder',
                           'Grønne omganger'],
                    ['Stitches at hem', 'Scallops', 'Sts per scallop', 'Scallop rounds',
                     'Green rounds'])
    bue_r = [[p['str_nr'], str(p['skjort_vidde']) + m, str(p['skjort_buer']) + ' x',
              p['bue_bredde'], p['bue_omganger'], p['gronn_kant_omg']] for p in PLAGG]
    P.append(pg(
        banner(L(lang, 'SKJØRT · 3 · BUEKANT OG VALGFRI ELASTIKK',
                 'SKIRT · 3 · SCALLOPED HEM AND OPTIONAL ELASTIC')) +
        rosep(L(lang, 'BUEKANTEN MED GRØNN KANT', 'THE SCALLOPED HEM WITH A GREEN EDGE')) +
        card('<p>' + L(lang,
             'Skjørtet avsluttes med samme buekant som kjolen og romperen, med buer '
             'på 10 masker. Masketallet går opp i hele buer allerede, så her økes det '
             'ikke. Strikk buerunden i ROSA: *2 rett sammen vridd, 2 rett, 1 økning, 2 '
             'rett, 1 økning, 2 rett, 2 rett sammen*, gjentatt rundt, og gjenta den i alt '
             '5 ganger. Bytt så til grønt, strikk 3 omganger rett, og fell svært løst av.',
             'The skirt ends with the same scalloped hem as the dress and the romper, '
             'with scallops of 10 stitches. The stitch count already divides into whole '
             'scallops, so there is no increasing here. Work the scallop round in PINK: '
             '*ssk, k2, M1R, k2, M1L, k2, k2tog*, repeated round, and repeat it 5 times '
             'in all. Then change to green, work 3 rounds in knit, and cast off very '
             'loosely.') + '</p>' +
             tabell(bue_h, bue_r, min_index=0)) +
        sagep(L(lang, 'ELASTIKK I LIVET, VALGFRITT',
                 'ELASTIC AT THE WAIST, OPTIONAL')) +
        card('<p>' + L(lang,
             'Skjørtet i oppskriften har grønn ribb i livet, uten elastikk, slik '
             'designbildet viser. Vil du ha elastikk i stedet, strikker du linningen som '
             'en brettet kant: legg opp med grønt, strikk 2,5 cm glattstrikk, 1 omgang '
             'vrang til brettekant, og 2,5 cm glattstrikk til. Sett oppleggingskanten på '
             'en ekstra pinne og strikk én maske fra hver pinne sammen rundt, men la en '
             'åpning på 2 cm stå igjen. Mål så barnets liv, klipp en myk elastikk 1 cm '
             'kortere enn målet, tre den gjennom med en sikkerhetsnål, sy endene godt '
             'sammen og sy åpningen igjen. Kjenn etter med en finger: du skal komme lett '
             'inn under linningen.',
             'The skirt in this pattern has a green rib at the waist, with no elastic, as '
             'the design photo shows. If you would rather have elastic, work the waistband '
             'as a folded edge instead: cast on in green, work 2.5 cm in stocking stitch, '
             '1 purl round for the fold line, and another 2.5 cm in stocking stitch. Place '
             'the cast-on edge on a spare needle and knit one stitch from each needle '
             'together round, leaving an opening of 2 cm. Then measure the baby\'s waist, '
             'cut a soft elastic 1 cm shorter than the measurement, thread it through with '
             'a safety pin, sew the ends firmly together and close the opening. Check with '
             'a finger: you should slip easily under the waistband.') + '</p>') +
        cme(L(lang,
              'Velger du elastikk, husk at huden på de minste barna er ekstra sart. Er du '
              'i tvil, velger du den løseste elastikken, og heller strammer den senere.',
              'If you choose elastic, remember that the skin on the smallest children is '
              'especially delicate. If in doubt, choose the looser elastic and tighten it '
              'later if needed.')), 9))


    # ------------------------------------------------------------- 10 TESTSTRIKK
    P.append(pg(f.side_teststrikk(lang, 'skjørtet', 'the skirt'), 10))

    # -------------------------------------------------------------- 11 MONTERING
    P.append(pg(f.side_montering(
        lang,
        'Kontroller at linningen sitter mykt og ikke lager merker etter en times bruk.',
        'Check that the waistband sits softly and leaves no marks after an hour of '
        'wear.'), 11))

    # ------------------------------------------------------------- 12 AVSLUTNING
    P.append(pg(f.side_avslutning(lang), 12))
    return P


f.skriv('skjørt',
        {'no': 'Jordbærdrøm skjørt, LME strikkeoppskrift',
         'en': 'Strawberry Dream skirt, LME knitting pattern'},
        sider, 'skjort')
