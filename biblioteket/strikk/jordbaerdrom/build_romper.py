# -*- coding: utf-8 -*-
"""
Jordbærdrøm romper med skjørt, gradert i ni størrelser (44 til 92).

Ermeløs romper med innstrikket bladparti, frø, integrert skjørt og
knappåpning mellom beina. Bygger HTML for norsk og engelsk, klar for
PDF-print med Chromium.

Alle masketall leses fra sizes.json, som skrives av grading_jordbaerdrom.py.
"""
import _jordbaer_felles as f
from _jordbaer_felles import (PLAGG, banner, rosep, sagep, card, cme, ul,
                              tabell, str_head, side, L)

PH2_NO = 'LME STRIKKEOPPSKRIFT   |   ROMPER MED SKJØRT'
PH2_EN = 'LME KNITTING PATTERN   |   ROMPER WITH SKIRT'

GARN = [[p['str_nr'],
         '%d g' % (5 * round((p['bol_ermelos'] * (p['bol_romper_cm'] + p['skjort_romper_cm']
                                                  + p['bleie_romper_cm']) * 0.20 + 40) / 5)),
         '%d g' % (5 * round((p['yoke'] * 0.28 + 8) / 5)), '5 g'] for p in PLAGG]

EKSTRA_NO = [['Pinne 4 mm', 'settpinner eller Magic Loop til hals, armhull og skritt'],
             ['4 flate knapper', 'ca. 10-12 mm, 3 i skrittet og 1 i nakken'],
             ['Stoppenål', 'til å feste tråder og sy ned picotkanten'],
             ['Maskemarkør', 'til å merke omgangens begynnelse og livet']]
EKSTRA_EN = [['4 mm needles', 'double-pointed or Magic Loop for neck, armholes and crotch'],
             ['4 flat buttons', 'approx. 10-12 mm, 3 at the crotch and 1 at the neck'],
             ['Darning needle', 'for weaving in ends and sewing down the picot edge'],
             ['Stitch marker', 'to mark the beginning of the round and the waist']]


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
        L(lang, 'JORDBÆRDRØM ROMPER', 'STRAWBERRY DREAM ROMPER'),
        L(lang, 'STØRRELSE 44 TIL 92', 'SIZES 44 TO 92'),
        L(lang,
          'Ermeløs romper med innstrikket bladparti, frø, integrert skjørt og knappåpning '
          'mellom beina. Gradert i ni størrelser, fra liten nyfødt og opp til to år.',
          'A sleeveless romper with a knitted-in leaf yoke, seeds, an integrated skirt and '
          'a buttoned opening at the crotch. Graded in nine sizes, from small newborn up '
          'to two years.')), 1))

    # ---------------------------------------------------------- 2 FØR DU BEGYNNER
    P.append(pg(
        banner(L(lang, 'FØR DU BEGYNNER', 'BEFORE YOU START')) +
        card('<p>' + L(lang,
             'Romperen strikkes ovenfra og ned. Bærestykket strikkes først frem og tilbake '
             'for en liten åpning midt bak, før arbeidet samles til en omgang. Maskene til '
             'armhullene settes til side, kroppen strikkes rundt ned til livet, og skjørtet '
             'strikkes ut derfra. Til slutt brettes skjørtet opp, og for- og bakstykke '
             'formes til bleiedelen.',
             'The romper is knitted top-down. The yoke is first worked back and forth for a '
             'small opening at centre back, then joined in the round. The armhole stitches '
             'are set aside, the body is worked in the round down to the waist, and the '
             'skirt is worked out from there. Finally the skirt is folded up and the front '
             'and back are shaped into the nappy panel.') + '</p>') +
        rosep(L(lang, 'DETTE LÆRER DU', 'WHAT YOU WILL LEARN')) +
        card(ul(L(lang,
                  ['å strikke et rundt bærestykke ovenfra og ned',
                   'å strikke blad- og frømønster med to farger',
                   'å forme armhull og bleiedel',
                   'å lage knapphull og plukke opp kanter'],
                  ['knitting a round yoke from the top down',
                   'working leaf and seed charts in two colours',
                   'shaping armholes and a nappy panel',
                   'making buttonholes and picking up edgings']))) +
        sagep(L(lang, 'VANSKELIGHETSGRAD', 'DIFFICULTY')) +
        cme(L(lang,
              'Lett til litt øvet. Bleiedelen er den eneste delen som strikkes frem og '
              'tilbake, og der felles det i hver side på hver rettsidepinne.',
              'Easy to slightly experienced. The nappy panel is the only part worked back '
              'and forth, and there you decrease at each side on every right side row.')), 2))

    # ------------------------------------------------------------- 3 STØRRELSER
    mh = [S] + L(lang, ['Brystvidde', 'Hel lengde', 'Bærestykke', 'Skjørt'],
                 ['Chest', 'Total length', 'Yoke depth', 'Skirt'])
    mr = [[p['str_nr'], komma(p['bryst_ermelos_cm']) + ' cm',
           str(p['romper_lengde_cm']) + ' cm', komma(p['yoke_cm']) + ' cm',
           str(p['skjort_romper_cm']) + ' cm'] for p in PLAGG]
    for i, kropp in enumerate(f.side_storrelser(lang, 'romperen', mr, mh)):
        P.append(pg(kropp, 3 + i))

    # ------------------------------------------------------------------- 4 GARN
    P.append(pg(f.side_garn(lang, GARN, L(lang, EKSTRA_NO, EKSTRA_EN)), 5))

    # ---------------------------------------------------------------- 5 DIAGRAM
    P.append(pg(f.side_diagram(lang), 6))

    # ------------------------------------------------------- 6 HALS OG BÆRESTYKKE
    hals_h = [S] + L(lang, ['Legg opp', 'Per felt', 'Økeomganger', 'Etter økingene',
                            'Jevne omg. etter'],
                     ['Cast on', 'Per section', 'Increase rounds', 'After increases',
                      'Even rnds after'])
    hals_r = [[p['str_nr'], str(p['hals_co']) + m, p['hals_per_felt'],
               p['oke_omganger'], str(p['yoke']) + m, p['yoke_jevne']] for p in PLAGG]
    P.append(pg(
        banner(L(lang, '1 · HALS OG ÅPNING', '1 · NECK AND OPENING')) +
        card('<p>' + L(lang,
             'Legg opp med grønt på pinne 4 mm og strikk 4 pinner vridd ribb frem og '
             'tilbake, altså 1 vridd rett og 1 vrang. På pinne 3 lager du ett lite '
             'knapphull 3 masker innenfor kanten: 2 rett sammen, 1 kast. Fortsett i '
             'glattstrikk frem og tilbake.',
             'Cast on in green on 4 mm needles and work 4 rows of twisted rib back and '
             'forth, that is 1 twisted knit, 1 purl. On row 3 make one small buttonhole 3 '
             'stitches in from the edge: knit 2 together, yarn over. Continue in stocking '
             'stitch back and forth.') + '</p>') +
        rosep(L(lang, 'ØKINGENE', 'THE INCREASES')) +
        card('<p>' + L(lang,
             'Del maskene i 8 like felt og sett en markør mellom hvert felt. Øk 1 maske i '
             'hvert felt på annenhver pinne, altså 8 masker per økeomgang. Når åpningen bak '
             'måler ca. 4 cm, legger du opp 2 masker over åpningen og samler arbeidet til '
             'en omgang. Fortsett økingene rundt til du har masketallet i kolonnen din.',
             'Divide the stitches into 8 equal sections and place a marker between each. '
             'Increase 1 stitch in each section every other row, that is 8 stitches per '
             'increase round. When the back opening measures approx. 4 cm, cast on 2 '
             'stitches over the opening and join to work in the round. Continue the '
             'increases in the round until you have the stitch count in your column.') +
             '</p>') +
        card(tabell(hals_h, hals_r, min_index=0)) +
        cme(L(lang,
              'Når økingene er ferdige, strikker du antallet jevne omganger i siste '
              'kolonne uten å øke. De gir bærestykket den dybden det skal ha.',
              'When the increases are done, work the number of even rounds in the last '
              'column without increasing. They give the yoke the depth it needs.')), 7))

    # ------------------------------------------------------------- 7 BLADSPISSER
    blad_h = [S] + L(lang, ['Masker i bærestykket', 'Bladrapporter rundt', 'Bærestykkets dybde'],
                     ['Stitches in yoke', 'Leaf repeats round', 'Yoke depth'])
    blad_r = [[p['str_nr'], str(p['yoke']) + m, str(p['blad_rapporter']) + ' x',
               komma(p['yoke_cm']) + ' cm'] for p in PLAGG]
    P.append(pg(
        banner(L(lang, '2 · BLADSPISSENE', '2 · THE LEAF TIPS')) +
        '<p>' + L(lang,
        'Strikk bladrapporten fra side 5 over 8 masker, og gjenta den så mange ganger som '
        'kolonnen din sier. Første omgang ligger øverst på plagget, men diagrammet leses '
        'likevel nedenfra og opp, fordi det er snudd for topp-ned-strikking. Avslutt med 1 '
        'omgang rosa.',
        'Work the leaf repeat from page 5 over 8 stitches, and repeat it as many times as '
        'your column says. The first round sits at the top of the garment, but the chart is '
        'still read from the bottom up, because it is turned for top-down knitting. Finish '
        'with 1 round in pink.') + '</p>' +
        card(tabell(blad_h, blad_r, min_index=0)) +
        cme(L(lang,
              'Kontroller masketallet før du deler til armhullene. Går ikke bladrapporten '
              'opp, har det sneket seg inn en øking for mye eller for lite lenger oppe.',
              'Check the stitch count before dividing for the armholes. If the leaf repeat '
              'does not come out even, an increase has slipped in or been missed higher '
              'up.')), 8))

    # ---------------------------------------------------------- 8 DEL TIL ARMHULL
    del_h = [S] + L(lang, ['Forstykke', 'Sett av til erme', 'Legg opp', 'Bakstykke', 'Kropp'],
                    ['Front', 'Hold for armhole', 'Cast on', 'Back', 'Body'])
    del_r = [[p['str_nr'], p['front'], p['sleeve'], p['underarm_ermelos'], p['back'],
              str(p['bol_ermelos']) + m] for p in PLAGG]
    P.append(pg(
        banner(L(lang, '3 · DEL TIL ARMHULL', '3 · DIVIDE FOR ARMHOLES')) +
        '<p>' + L(lang,
        'Les raden for din størrelse fra venstre mot høyre, i den rekkefølgen du strikker: '
        'forstykket, maskene du setter på en tråd til første armhull, maskene du legger opp '
        'under armen, bakstykket, og så det samme armhullet på den andre siden.',
        'Read the row for your size from left to right, in the order you knit: the front, '
        'the stitches you place on hold for the first armhole, the stitches you cast on '
        'under the arm, the back, then the same armhole on the other side.') + '</p>' +
        card(tabell(del_h, del_r, min_index=0)) +
        sagep(L(lang, 'KROPPEN', 'THE BODY')) +
        card('<p>' + L(lang,
             'Strikk rosa glattstrikk rundt. Strø inn frø: frøomgang A, 2-3 omganger rosa, '
             'så frøomgang B. Strikk til kroppen måler lengden i tabellen på neste side, '
             'målt rett ned fra under armen, og sett en markør i omgangen. Den markøren er '
             'livet.',
             'Work in pink stocking stitch in the round. Scatter seeds: seed round A, 2-3 '
             'rounds in pink, then seed round B. Work until the body measures the length in '
             'the table on the next page, measured straight down from the underarm, and '
             'place a marker in the round. That marker is the waist.') + '</p>'), 9))

    # ---------------------------------------------------------------- 9 SKJØRTET
    sk_h = [S] + L(lang, ['Kropp fra under armen', 'Masker i kroppen', '*2 r, M1* gir',
                          'Skjørtevidde', 'Skjørtelengde'],
                   ['Body from underarm', 'Body stitches', '*k2, M1* gives', 'Skirt width',
                    'Skirt length'])
    sk_r = [[p['str_nr'], str(p['bol_romper_cm']) + ' cm', str(p['bol_ermelos']) + m,
             str(p['romper_skjort']) + m, komma(p['romper_skjort_vidde_cm']) + ' cm',
             str(p['skjort_romper_cm']) + ' cm'] for p in PLAGG]
    P.append(pg(
        banner(L(lang, '4 · SKJØRTET', '4 · THE SKIRT')) +
        '<p>' + L(lang,
        'Fra livmarkøren strikker du *2 rett, 1 økning*, gjenta rundt. Fortsett i rosa '
        'glattstrikk med spredte frø til skjørtet måler lengden i siste kolonne. Strikk så '
        '3 omganger rosa, 1 hullomgang *1 kast, 2 rett sammen*, og 3 omganger rosa. Fell '
        'løst av. Brett langs hullomgangen mot vrangen og sy ned til en myk picotkant.',
        'From the waist marker work *k2, M1*, repeat round. Continue in pink stocking stitch '
        'with scattered seeds until the skirt measures the length in the last column. Then '
        'work 3 rounds in pink, 1 eyelet round *yarn over, k2tog*, and 3 rounds in pink. '
        'Cast off loosely. Fold along the eyelet round to the wrong side and sew down into a '
        'soft picot edge.') + '</p>' +
        card(tabell(sk_h, sk_r, min_index=0)) +
        cme(L(lang,
              'Skjørtet er kort med vilje. Det skal ligge over bleiedelen, ikke under den, '
              'og et langt skjørt ville kommet i veien ved bleieskift.',
              'The skirt is deliberately short. It sits over the nappy panel, not under it, '
              'and a long skirt would get in the way at nappy changes.')), 10))

    # --------------------------------------------------------------- 10 BLEIEDEL
    bl_h = [S] + L(lang, ['Kroppsmasker', 'Lengde fra livet', 'Del i to', 'Fell til'],
                   ['Body stitches', 'Length from waist', 'Split into two', 'Decrease to'])
    bl_r = [[p['str_nr'], str(p['bol_ermelos']) + m, str(p['bleie_romper_cm']) + ' cm',
             '2 x ' + str(p['bleie_halv']) + m, str(p['skritt_m']) + m] for p in PLAGG]
    P.append(pg(
        banner(L(lang, '5 · BLEIEDELEN', '5 · THE NAPPY PANEL')) +
        '<p>' + L(lang,
        'Brett skjørtet opp så det ikke er i veien. Fortsett rundt på kroppsmaskene fra '
        'livmarkøren og strikk rosa glattstrikk i lengden i kolonnen din. Del deretter '
        'arbeidet i to like halvdeler, forstykke og bakstykke, og strikk delene hver for seg '
        'frem og tilbake. Fell 1 maske i hver side på hver rettsidepinne til det står igjen '
        'antallet i siste kolonne.',
        'Fold the skirt up out of the way. Continue in the round on the body stitches from '
        'the waist marker and work pink stocking stitch for the length in your column. Then '
        'divide the work into two equal halves, front and back, and work each half '
        'separately back and forth. Decrease 1 stitch at each side on every right side row '
        'until the number in the last column remains.') + '</p>' +
        card(tabell(bl_h, bl_r, min_index=0)) +
        cme(L(lang,
              'Strikk bakstykket 4 pinner lengre enn forstykket. Da havner knappene under '
              'barnet og ikke oppå, og skrittet lukker seg glatt.',
              'Work the back 4 rows longer than the front. That puts the buttons underneath '
              'the baby rather than on top, and the crotch closes smoothly.')), 11))

    # ---------------------------------------------------- 11 KNAPPEBÅND OG ARMHULL
    kn_h = [S] + L(lang, ['Masker i skrittet', 'Knapphull', 'Plukk opp per armhull'],
                   ['Crotch stitches', 'Buttonholes', 'Pick up per armhole'])
    kn_r = [[p['str_nr'], str(p['skritt_m']) + m, 3, str(p['armhull_ermelos']) + m]
            for p in PLAGG]
    P.append(pg(
        banner(L(lang, '6 · KNAPPEBÅND OG KANTER', '6 · BUTTON BANDS AND EDGINGS')) +
        rosep(L(lang, 'SKRITTET', 'THE CROTCH')) +
        card('<p>' + L(lang,
             'Strikk 6 pinner vridd ribb over skrittmaskene på begge deler. På forstykkets '
             'pinne 3 lager du 3 knapphull jevnt fordelt: 1 kast, 2 rett sammen. Fell av i '
             'ribb. Sy de 3 knappene på bakstykket, rett under knapphullene.',
             'Work 6 rows of twisted rib over the crotch stitches on both pieces. On row 3 '
             'of the front, make 3 buttonholes evenly spaced: yarn over, k2tog. Cast off in '
             'rib. Sew the 3 buttons onto the back, directly under the buttonholes.') +
             '</p>') +
        sagep(L(lang, 'ARMHULL OG NAKKE', 'ARMHOLES AND NECK')) +
        card('<p>' + L(lang,
             'Plukk opp maskene i kolonnen din rundt hvert armhull med grønt: de hvilende '
             'ermemaskene, maskene du la opp under armen, og 1 maske i hvert av de to '
             'hjørnene. Strikk 4 omganger vridd ribb og fell elastisk av. Sy til slutt den '
             'fjerde knappen i nakken.',
             'Pick up the stitches in your column round each armhole in green: the held '
             'sleeve stitches, the stitches you cast on under the arm, and 1 stitch in each '
             'of the two corners. Work 4 rounds of twisted rib and cast off with stretch. '
             'Finally sew the fourth button at the neck.') + '</p>' +
             tabell(kn_h, kn_r, min_index=0)), 12))

    # ------------------------------------------------------------- 12 TESTSTRIKK
    P.append(pg(f.side_teststrikk(lang, 'romperen', 'romper'), 13))

    # -------------------------------------------------------------- 13 MONTERING
    P.append(pg(f.side_montering(
        lang,
        'Kjenn etter at knappene i skrittet ikke ligger hardt an når barnet ligger på rygg.',
        'Check that the crotch buttons do not press when the baby lies on its back.'), 14))

    # ------------------------------------------------------------- 14 AVSLUTNING
    P.append(pg(f.side_avslutning(lang), 15))
    return P


f.skriv('romper',
        {'no': 'Jordbærdrøm romper med skjørt, LME strikkeoppskrift',
         'en': 'Strawberry Dream romper with skirt, LME knitting pattern'},
        sider, 'romper')
