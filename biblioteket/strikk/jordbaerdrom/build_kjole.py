# -*- coding: utf-8 -*-
"""
Jordbærdrøm kjole, gradert i ni størrelser (44 til 92, liten nyfødt til 2 år).

Ermeløs, toppstrikket babykjole med bladparti i bærestykket, innstrikkede frø
og et mykt utsvingt skjørt. Bygger HTML for norsk og engelsk, klar for
PDF-print med Chromium.

Alle masketall leses fra sizes.json, som skrives av grading_jordbaerdrom.py.
Ingen tall er skrevet inn for hånd her.
"""
import _jordbaer_felles as f
from _jordbaer_felles import (PLAGG, banner, rosep, sagep, card, cme, ul,
                              tabell, str_head, side, L)

PH2_NO = 'LME STRIKKEOPPSKRIFT   |   KJOLE'
PH2_EN = 'LME KNITTING PATTERN   |   DRESS'

# Garnmengde per størrelse, beregnet fra plaggets flate og rundet opp til
# nærmeste 5 gram, med margin til prøvelapp og montering.
GARN = [[p['str_nr'],
         '%d g' % (5 * round((p['bol_ermelos'] * (p['bol_kjole_cm'] + p['skjort_kjole_cm'])
                              * 0.20 + 45) / 5)),
         '%d g' % (5 * round((p['yoke'] * 0.28 + 8) / 5)), '5 g'] for p in PLAGG]

EKSTRA_NO = [['Pinne 4 mm', 'settpinner eller Magic Loop til hals, armhull og skjørt'],
             ['1 flat knapp', 'ca. 10-12 mm, til nakkeåpningen'],
             ['Stoppenål', 'til å feste tråder og jevne ut buekanten'],
             ['Maskemarkør', 'til å merke omgangens begynnelse midt bak']]
EKSTRA_EN = [['4 mm needles', 'double-pointed or Magic Loop for neck, armholes and skirt'],
             ['1 flat button', 'approx. 10-12 mm, for the back neck opening'],
             ['Darning needle', 'for weaving in ends and evening out the scalloped edge'],
             ['Stitch marker', 'to mark the beginning of the round at centre back']]


def komma(x):
    return str(x).replace('.', ',')


def mal(lang):
    head = [str_head(lang)] + L(lang,
                                ['Brystvidde', 'Hel lengde', 'Bærestykke', 'Skjørt fra livet'],
                                ['Chest', 'Total length', 'Yoke depth', 'Skirt from waist'])
    rader = [[p['str_nr'], komma(p['bryst_ermelos_cm']) + ' cm',
              str(p['kjole_lengde_cm']) + ' cm', komma(p['yoke_cm']) + ' cm',
              str(p['skjort_kjole_cm']) + ' cm'] for p in PLAGG]
    return head, rader


def sider(lang):
    def pg(body, num):
        return side(body, num, lang, PH2_NO, PH2_EN)
    S = str_head(lang)
    m = L(lang, ' m', ' sts')
    P = []

    # --------------------------------------------------------------- 1 FORSIDE
    P.append(pg(f.forside(
        lang,
        L(lang, 'JORDBÆRDRØM KJOLE', 'STRAWBERRY DREAM DRESS'),
        L(lang, 'STØRRELSE 44 TIL 92', 'SIZES 44 TO 92'),
        L(lang,
          'Ermeløs, toppstrikket kjole med bladparti, innstrikkede frø og et mykt '
          'utsvingt skjørt. Gradert i ni størrelser, fra liten nyfødt og opp til to år.',
          'A sleeveless, top-down dress with a leaf yoke, knitted-in seeds and a soft '
          'flared skirt. Graded in nine sizes, from small newborn up to two years.'), bilde='kjole.jpg'), 1))

    # ---------------------------------------------------------- 2 FØR DU BEGYNNER
    P.append(pg(
        banner(L(lang, 'FØR DU BEGYNNER', 'BEFORE YOU START')) +
        card('<p>' + L(lang,
             'Kjolen strikkes ovenfra og ned med en liten knappåpning bak i nakken. Halsen '
             'legges opp i grønt og deles i 8 felt, og økingene former det runde '
             'bærestykket. Etter bladpartiet settes armhullsmaskene til side, bolen '
             'strikkes rundt ned til livet, og der økes det ut til et lett og fyldig '
             'skjørt.',
             'The dress is knitted top-down with a small buttoned opening at the back '
             'neck. The neck is cast on in green and divided into 8 sections, and the '
             'increases shape the round yoke. After the leaf panel the armhole stitches '
             'are set aside, the body is worked in the round down to the waist, and there '
             'it is increased out into a light, full skirt.') + '</p>') +
        rosep(L(lang, 'DETTE LÆRER DU', 'WHAT YOU WILL LEARN')) +
        card(ul(L(lang,
                  ['å strikke et ermeløst bærestykke ovenfra og ned',
                   'å strikke inn bladspisser og frø i to farger',
                   'å øke jevnt fra liv til skjørt',
                   'å strikke buekant og armhullskanter'],
                  ['knitting a sleeveless yoke from the top down',
                   'working leaf tips and seeds in two colours',
                   'increasing evenly from waist into a skirt',
                   'working a scalloped edge and armhole edgings']))) +
        sagep(L(lang, 'VANSKELIGHETSGRAD', 'DIFFICULTY')) +
        cme(L(lang,
              'Lett til litt øvet. Du bør kunne strikke rundt, øke, felle og holde to '
              'farger i samme omgang.',
              'Easy to slightly experienced. You should be able to knit in the round, '
              'increase, decrease and carry two colours in the same round.')), 2))

    # ------------------------------------------------------------- 3 STØRRELSER
    mh, mr = mal(lang)
    for i, kropp in enumerate(f.side_storrelser(lang, 'kjolen', mr, mh)):
        P.append(pg(kropp, 3 + i))

    # ------------------------------------------------------------------- 4 GARN
    P.append(pg(f.side_garn(lang, GARN, L(lang, EKSTRA_NO, EKSTRA_EN)), 5))

    # ---------------------------------------------------------------- 5 DIAGRAM
    P.append(pg(f.side_diagram(lang), 6))

    # --------------------------------------------------------- 6 HALS OG ØKINGER
    hals_h = [S] + L(lang,
                     ['Legg opp', 'Per felt', 'Økeomganger', 'Etter økingene',
                      'Jevne omg. etter'],
                     ['Cast on', 'Per section', 'Increase rounds', 'After increases',
                      'Even rnds after'])
    hals_r = [[p['str_nr'], str(p['hals_co']) + m, p['hals_per_felt'],
               p['oke_omganger'], str(p['yoke']) + m, p['yoke_jevne']] for p in PLAGG]
    P.append(pg(
        banner(L(lang, '1 · HALS OG BÆRESTYKKE', '1 · NECK AND YOKE')) +
        card('<p>' + L(lang,
             'Legg opp med grønt på pinne 4 mm og strikk 4 pinner vridd ribb frem og '
             'tilbake, altså 1 vridd rett og 1 vrang. På pinne 3 lager du ett knapphull 3 '
             'masker innenfor kanten: 2 rett sammen, 1 kast. Fortsett i glattstrikk frem '
             'og tilbake.',
             'Cast on in green on 4 mm needles and work 4 rows of twisted rib back and '
             'forth, that is 1 twisted knit, 1 purl. On row 3 make one buttonhole 3 '
             'stitches in from the edge: knit 2 together, yarn over. Continue in stocking '
             'stitch back and forth.') + '</p>') +
        rosep(L(lang, 'ØKINGENE', 'THE INCREASES')) +
        card('<p>' + L(lang,
             'Del maskene i 8 like felt og sett en markør mellom hvert felt. Øk 1 maske i '
             'hvert felt på annenhver pinne, altså 8 masker per økeomgang. Når åpningen '
             'bak måler ca. 4 cm, legger du opp 2 masker over åpningen og samler arbeidet '
             'til en omgang. Fortsett økingene rundt til du har masketallet i kolonnen '
             'din.',
             'Divide the stitches into 8 equal sections and place a marker between each. '
             'Increase 1 stitch in each section every other row, that is 8 stitches per '
             'increase round. When the back opening measures approx. 4 cm, cast on 2 '
             'stitches over the opening and join to work in the round. Continue the '
             'increases in the round until you have the stitch count in your column.') +
             '</p>') +
        card(tabell(hals_h, hals_r, min_index=0)) +
        cme(L(lang,
              'Når økingene er ferdige, strikker du antallet jevne omganger i siste '
              'kolonne uten å øke. De gir bærestykket den dybden det skal ha, slik at '
              'armhullet havner riktig, og de er derfor ulike fra størrelse til '
              'størrelse.',
              'When the increases are done, work the number of even rounds in the last '
              'column without increasing. They give the yoke the depth it needs so the '
              'armhole sits correctly, and they therefore differ from size to '
              'size.')), 7))

    # ------------------------------------------------------------- 7 BLADPARTIET
    blad_h = [S] + L(lang,
                     ['Masker i bærestykket', 'Bladrapporter rundt', 'Bærestykkets dybde'],
                     ['Stitches in yoke', 'Leaf repeats round', 'Yoke depth'])
    blad_r = [[p['str_nr'], str(p['yoke']) + m, str(p['blad_rapporter']) + ' x',
               komma(p['yoke_cm']) + ' cm'] for p in PLAGG]
    P.append(pg(
        banner(L(lang, '2 · BLADPARTIET', '2 · THE LEAF PANEL')) +
        '<p>' + L(lang,
        'Nå er alle økingene ferdige, og masketallet er delelig med 8 i alle størrelser. '
        'Strikk bladrapporten fra side 5 over 8 masker, og gjenta den så mange ganger som '
        'kolonnen din sier. Diagrammet leses nedenfra og opp, selv om plagget strikkes '
        'ovenfra og ned. Det er fordi bladene skal peke nedover på det ferdige plagget.',
        'All the increases are done now, and the stitch count divides by 8 in every size. '
        'Work the leaf repeat from page 5 over 8 stitches, and repeat it as many times as '
        'your column says. The chart is read from the bottom up even though the garment is '
        'knitted from the top down. That is so the leaves point downwards on the finished '
        'garment.') + '</p>' +
        card(tabell(blad_h, blad_r, min_index=0)) +
        sagep(L(lang, 'ETTER BLADENE', 'AFTER THE LEAVES')) +
        cme(L(lang,
              'Strikk 1 omgang jevnt i rosa. Da er bærestykket ferdig, og hele plagget er '
              'rosa fra her og ned, bortsett fra frøene og kantene.',
              'Work 1 even round in pink. The yoke is now finished, and the whole garment '
              'is pink from here down apart from the seeds and the edgings.')), 8))

    # ---------------------------------------------------------- 8 DEL TIL ARMHULL
    del_h = [S] + L(lang,
                    ['Forstykke', 'Sett av til erme', 'Legg opp', 'Bakstykke', 'Bol'],
                    ['Front', 'Hold for armhole', 'Cast on', 'Back', 'Body'])
    del_r = [[p['str_nr'], p['front'], p['sleeve'], p['underarm_ermelos'], p['back'],
              str(p['bol_ermelos']) + m] for p in PLAGG]
    P.append(pg(
        banner(L(lang, '3 · DEL TIL ARMHULL OG BOL', '3 · DIVIDE FOR ARMHOLES AND BODY')) +
        '<p>' + L(lang,
        'Les raden for din størrelse fra venstre mot høyre, i den rekkefølgen du strikker: '
        'forstykket, maskene du setter på en tråd til første armhull, maskene du legger '
        'opp under armen, bakstykket, og så det samme armhullet på den andre siden. Til '
        'slutt står bolen igjen på pinnen.',
        'Read the row for your size from left to right, in the order you knit: the front, '
        'the stitches you place on hold for the first armhole, the stitches you cast on '
        'under the arm, the back, then the same armhole on the other side. The body '
        'remains on the needle.') + '</p>' +
        card(tabell(del_h, del_r, min_index=0)) +
        cme(L(lang,
              'Kontroller masketallet før du går videre. Forstykke og bakstykke skal være '
              'like, og de to armhullene skal ha nøyaktig like mange masker på tråden.',
              'Check the stitch count before going on. Front and back should be equal, and '
              'the two armholes should hold exactly the same number of stitches.')), 9))

    # -------------------------------------------------------------------- 9 BOL
    bol_h = [S] + L(lang,
                    ['Masker i bolen', 'Lengde fra under armen', 'Omganger, ca.'],
                    ['Body stitches', 'Length from underarm', 'Rounds, approx.'])
    bol_r = [[p['str_nr'], str(p['bol_ermelos']) + m, str(p['bol_kjole_cm']) + ' cm',
              round(p['bol_kjole_cm'] * 2.8)] for p in PLAGG]
    P.append(pg(
        banner(L(lang, '4 · BOLEN NED TIL LIVET', '4 · BODY DOWN TO THE WAIST')) +
        '<p>' + L(lang,
        'Sett omgangsmarkøren midt bak og strikk rosa glattstrikk rundt. Strø inn frø '
        'underveis: strikk frøomgang A, deretter 2-3 omganger rosa, så frøomgang B. Gjenta '
        'så tett eller spredt du vil. Strikk til bolen måler lengden i kolonnen din, målt '
        'rett ned fra under armen.',
        'Place the round marker at centre back and work in pink stocking stitch in the '
        'round. Scatter seeds as you go: work seed round A, then 2-3 rounds in pink, then '
        'seed round B. Repeat as densely or sparsely as you like. Work until the body '
        'measures the length in your column, measured straight down from the underarm.') +
        '</p>' +
        card(tabell(bol_h, bol_r, min_index=0)) +
        sagep(L(lang, 'MERK LIVET', 'MARK THE WAIST')) +
        cme(L(lang,
              'Sett en markør i omgangen når bolen er ferdig. Den markøren er livet, og '
              'alle skjørtemål regnes fra den.',
              'Place a marker in the round when the body is finished. That marker is the '
              'waist, and all skirt measurements are taken from it.')), 10))

    # ---------------------------------------------------------------- 10 SKJØRT
    sk_h = [S] + L(lang,
                   ['*2 r, M1* gir', 'Øk jevnt til', 'Skjørtevidde', 'Lengde fra livet'],
                   ['*k2, M1* gives', 'Increase evenly to', 'Skirt width',
                    'Length from waist'])
    sk_r = [[p['str_nr'], str(p['kjole_skjort_1']) + m, str(p['kjole_skjort_2']) + m,
             komma(p['kjole_skjort_vidde_cm']) + ' cm',
             str(p['skjort_kjole_cm']) + ' cm'] for p in PLAGG]
    P.append(pg(
        banner(L(lang, '5 · SKJØRTET', '5 · THE SKIRT')) +
        '<p>' + L(lang,
        'Strikk *2 rett, 1 økning*, gjenta rundt. Det gir tallet i den første kolonnen. '
        'Strikk 4 omganger rett, og øk så jevnt fordelt opp til tallet i den andre '
        'kolonnen. Da er skjørtet ute i full vidde. Fortsett i rosa glattstrikk med '
        'spredte frø til skjørtet måler lengden i den siste kolonnen, målt fra '
        'livmarkøren.',
        'Work *k2, M1*, repeat round. That gives the number in the first column. Work 4 '
        'rounds even, then increase evenly up to the number in the second column. The '
        'skirt is now at full width. Continue in pink stocking stitch with scattered seeds '
        'until the skirt measures the length in the last column, measured from the waist '
        'marker.') + '</p>' +
        card(tabell(sk_h, sk_r, min_index=0)) +
        cme(L(lang,
              'Vil du ha kjolen lengre eller kortere, er det her du bestemmer det. '
              'Skjørtelengden kan endres fritt uten at noe annet i oppskriften påvirkes.',
              'If you want the dress longer or shorter, this is where you decide. The '
              'skirt length can be changed freely without affecting anything else in the '
              'pattern.')), 11))

    # ---------------------------------------------------------------- 11 KANTER
    kant_h = [S] + L(lang, ['Plukk opp per armhull', 'Omganger vridd ribb'],
                     ['Pick up per armhole', 'Rounds of twisted rib'])
    kant_r = [[p['str_nr'], str(p['armhull_ermelos']) + m, 4] for p in PLAGG]
    bue_h = [S] + L(lang, ['Masker nederst', 'Buer', 'Masker per bue', 'Bueomganger'],
                    ['Stitches at hem', 'Scallops', 'Sts per scallop', 'Scallop rounds'])
    bue_r = [[p['str_nr'], str(p['kjole_skjort_2']) + m, p['kjole_buer'],
              p['bue_bredde'], p['bue_omganger']] for p in PLAGG]
    P.append(pg(
        banner(L(lang, '6 · BUEKANTEN NEDERST', '6 · THE SCALLOPED HEM')) +
        '<p>' + L(lang,
        'Kjolen ender i en buekant, ikke en rett kant. Buen lages med fellinger i dalen '
        'mellom buene og økinger midt i hver bue, like mange av hver, så masketallet står '
        'stille mens kanten bølger.',
        'The dress ends in a scalloped edge, not a straight one. The scallop is made with '
        'decreases in the valley between the scallops and increases at the centre of each, '
        'the same number of both, so the stitch count stays put while the edge waves.') +
        '</p>' +
        card('<p>' + L(lang,
             'Del kanten i buer med en markør mellom hver bue. Hver bue er 10 masker. '
             'Strikk så buerunden: *2 rett sammen vridd, 2 rett, 1 økning, 2 rett, '
             '1 økning, 2 rett, 2 rett sammen*, og gjenta rundt. Gjenta buerunden i alt '
             '5 ganger, og fell så løst av.',
             'Divide the edge into scallops with a marker between each. Every scallop is '
             '10 stitches. Then work the scallop round: *ssk, k2, M1R, k2, M1L, k2, '
             'k2tog*, repeat round. Repeat the scallop round 5 times in all, then cast '
             'off loosely.') + '</p>' + tabell(bue_h, bue_r, min_index=0)) +
        cme(L(lang,
              'Fell av løst. En stram avfelling retter ut buene, og da forsvinner hele '
              'poenget med kanten.',
              'Cast off loosely. A tight cast-off straightens the scallops out, and then '
              'the whole point of the edge is lost.')), 12))

    # ------------------------------------------------------------ 13 ARMHULLENE
    P.append(pg(
        banner(L(lang, '7 · ARMHULLSKANTENE', '7 · THE ARMHOLE EDGINGS')) +
        card('<p>' + L(lang,
             'Plukk opp maskene i kolonnen din rundt hvert armhull med grønt: de hvilende '
             'ermemaskene, maskene du la opp under armen, og 1 maske i hvert av de to '
             'hjørnene. Strikk 4 omganger vridd ribb og fell elastisk av.',
             'Pick up the stitches in your column round each armhole in green: the held '
             'sleeve stitches, the stitches you cast on under the arm, and 1 stitch in '
             'each of the two corners. Work 4 rounds of twisted rib and cast off with '
             'stretch.') + '</p>' + tabell(kant_h, kant_r, min_index=0)) +
        cme(L(lang,
              'Sy knappen på nakkeåpningen til slutt, og kontroller at knapphullet ikke '
              'er blitt for stort etter vask.',
              'Sew the button on the back neck opening last, and check that the '
              'buttonhole has not stretched after washing.')), 13))

    # ------------------------------------------------------------- 12 TESTSTRIKK
    P.append(pg(f.side_teststrikk(lang, 'kjolen', 'dress'), 14))

    # -------------------------------------------------------------- 13 MONTERING
    P.append(pg(f.side_montering(lang), 15))

    # ------------------------------------------------------------- 14 AVSLUTNING
    P.append(pg(f.side_avslutning(lang), 16))
    return P


f.skriv('kjole',
        {'no': 'Jordbærdrøm kjole, LME strikkeoppskrift',
         'en': 'Strawberry Dream dress, LME knitting pattern'},
        sider, 'kjole')
