# -*- coding: utf-8 -*-
"""
Jordbærdrøm votter, gradert i seks størrelser, én per plaggstørrelse 44 til 74.

Myke votter uten tommel, med brettet ribb, bladspisser, frø og en
sammenhengende i-cord mellom de to vottene.

Vottene har to størrelser, ikke ni som plaggene. Grunnen står i
grading_jordbaerdrom.py: en babyhånd vokser svært lite mellom to
nabostørrelser, og den brettede ribben tar opp resten av forskjellen.

Vottene er uten tommel, som er det vanlige på babyvotter. Det er også
grunnen til at de stopper ved str 74: et barn på over ett år vil ha tommel,
og en tommelløs vott blir da mer til hinder enn til hjelp.
"""
import _jordbaer_felles as f
from _jordbaer_felles import (VOTTER, banner, rosep, sagep, card, cme, ul,
                              tabell, side, L)

PH2_NO = 'LME STRIKKEOPPSKRIFT   |   VOTTER'
PH2_EN = 'LME KNITTING PATTERN   |   MITTENS'


def komma(x):
    return str(x).replace('.', ',')


def navn(v, lang):
    return v['str_nr']


def sider(lang):
    def pg(body, num):
        return side(body, num, lang, PH2_NO, PH2_EN)
    Sh = L(lang, 'Størrelse', 'Size')
    m = L(lang, ' m', ' sts')
    P = []

    # --------------------------------------------------------------- 1 FORSIDE
    P.append(pg(f.forside(
        lang,
        L(lang, 'JORDBÆRDRØM VOTTER', 'STRAWBERRY DREAM MITTENS'),
        L(lang, 'STØRRELSE 44 TIL 74', 'SIZES 44 TO 74'),
        L(lang,
          'Myke votter uten tommel, med brettet ribb, bladspisser, frø og en '
          'sammenhengende i-cord mellom vottene. Seks størrelser, én per '
          'plaggstørrelse fra 44 til 74.',
          'Soft thumbless mittens with a folded rib cuff, leaf tips, seeds and a '
          'connecting i-cord between the two. Six sizes, one per garment size from 44 to '
          '74.'),
        bilde='votter.jpg'), 1))

    # ---------------------------------------------------------- 2 FØR DU BEGYNNER
    P.append(pg(
        banner(L(lang, 'FØR DU BEGYNNER', 'BEFORE YOU START')) +
        card('<p>' + L(lang,
             'Vottene strikkes rundt fra mansjetten mot fingertuppen. Den grønne ribben '
             'brettes utover ved bruk. Bladpartiet går over i rosa glattstrikk med noen få '
             'frø, og votten avsluttes med jevne fellinger. Vottene har ingen tommel, som er '
             'det vanlige på babyvotter: en tommel gir en søm og en kant der en liten hånd '
             'kan sette seg fast.',
             'The mittens are worked in the round from the cuff towards the fingertips. The '
             'green rib folds outwards in wear. The leaf panel gives way to pink stocking '
             'stitch with a few seeds, and the mitten is finished with even decreases. The '
             'mittens have no thumb, which is usual for baby mittens: a thumb creates a seam '
             'and an edge where a small hand can catch.') + '</p>') +
        rosep(L(lang, 'DETTE LÆRER DU', 'WHAT YOU WILL LEARN')) +
        card(ul(L(lang,
                  ['å strikke små omganger med Magic Loop eller settpinner',
                   'å strikke en liten jordbærhette i to farger',
                   'å forme en rund vottetopp',
                   'å strikke og feste en i-cord mellom vottene'],
                  ['knitting small rounds with Magic Loop or double-pointed needles',
                   'working a small strawberry top in two colours',
                   'shaping a rounded mitten top',
                   'knitting and attaching an i-cord between the mittens']))) +
        sagep(L(lang, 'VANSKELIGHETSGRAD', 'DIFFICULTY')) +
        cme(L(lang,
              'Lett til litt øvet. Vottene er den minste delen i kolleksjonen, og et fint '
              'sted å prøve ut både fastheten og bladdiagrammet før du setter i gang med et '
              'større plagg.',
              'Easy to slightly experienced. The mittens are the smallest piece in the '
              'collection, and a good place to try out both the gauge and the leaf chart '
              'before starting a larger garment.')), 2))

    # ------------------------------------------------------------- 3 STØRRELSER
    mal_h = [Sh] + L(lang, ['Masker rundt', 'Omkrets', 'Hånd i rosa', 'Ribb',
                            'Lengde uten ribb', 'Snor'],
                     ['Stitches round', 'Circumference', 'Hand in pink', 'Cuff',
                      'Length without cuff', 'Cord'])
    mal_r = [[v['str_nr'], str(v['masker']) + m, komma(v['omkrets_cm']) + ' cm',
              komma(v['hand_cm']) + ' cm', komma(v['ribb_cm']) + ' cm',
              komma(v['lengde_cm']) + ' cm', str(v['snor_cm']) + ' cm'] for v in VOTTER]
    P.append(pg(
        banner(L(lang, 'STØRRELSER OG FERDIGE MÅL', 'SIZES AND FINISHED MEASUREMENTS')) +
        '<p>' + L(lang,
        'Vottene har én størrelse per plaggstørrelse, fra str 44 til 74. De stopper ved '
        '74 fordi de er uten tommel: det er riktig på en baby, men et barn på over ett år '
        'vil ha tommel, og en tommelløs vott blir da mer til hinder enn til hjelp.',
        'The mittens have one size per garment size, from size 44 to 74. They stop at 74 '
        'because they are thumbless: that is right for a baby, but a child over one year '
        'wants a thumb, and a thumbless mitten then gets in the way rather than '
        'helping.') + '</p>' +
        f.storrelsesbar_liste([(v['str_nr'],
                                L(lang, v['tillegg_no'], v['tillegg_en'])) for v in VOTTER]) +
        card(tabell(mal_h, mal_r, min_index=0)) +
        cme(L(lang,
              'Noen nabostørrelser har samme masketall rundt. Det er ikke to like '
              'størrelser: en hånd blir lengre raskere enn den blir bredere, så lengden, '
              'ribben og snoren er forskjellige i hver rad. Vottene skal dessuten sitte '
              'løst, de skal kunne dras av med én hånd, og de holdes på plass av den '
              'brettede ribben, ikke av at de strammer.',
              'Some neighbouring sizes share a stitch count round. They are not two '
              'identical sizes: a hand grows longer faster than it grows wider, so the '
              'length, the cuff and the cord differ in every row. The mittens should also '
              'sit loosely, they must come off with one hand, and they are held in place '
              'by the folded cuff, not by being tight.')), 3))

    # ------------------------------------------------------------------- 4 GARN
    garn = [[navn(v, lang), '%d g' % (10 + 5 * i), '%d g' % (15 + 5 * i), '5 g']
            for i, v in enumerate(VOTTER)]
    ekstra = L(lang,
               [['Pinne 4 mm', 'settpinner eller Magic Loop, omgangene er svært små'],
                ['Stoppenål', 'til å feste tråder og sy fast i-corden'],
                ['Maskemarkør', 'til å merke omgangens begynnelse']],
               [['4 mm needles', 'double-pointed or Magic Loop, the rounds are very small'],
                ['Darning needle', 'for weaving in ends and sewing on the i-cord'],
                ['Stitch marker', 'to mark the beginning of the round']])
    P.append(pg(f.side_garn(lang, garn, ekstra), 4))

    # ---------------------------------------------------------------- 5 DIAGRAM
    P.append(pg(f.side_diagram(lang, smaa=True), 5))

    # ---------------------------------------------------------- 6 RIBB OG BLAD
    ribb_h = [Sh] + L(lang, ['Legg opp', 'Ribb', 'Spisser rundt'],
                      ['Cast on', 'Rib', 'Points round'])
    ribb_r = [[navn(v, lang), str(v['masker']) + m, str(v['ribb_cm']) + ' cm',
               str(v['masker'] // 4) + ' x'] for v in VOTTER]
    P.append(pg(
        banner(L(lang, '1 · MANSJETT OG BLADSPISSER', '1 · CUFF AND LEAF TIPS')) +
        card('<p>' + L(lang,
             'Legg opp med grønt, samle til en omgang og strikk *2 rett, 2 vrang* til ribben '
             'måler høyden i kolonnen din. Ribben brettes utover ved bruk, derfor er den så '
             'høy. Strikk 1 omgang rett.',
             'Cast on in green, join in the round and work *k2, p2* until the rib measures '
             'the height in your column. The rib folds outwards in wear, which is why it is '
             'this deep. Work 1 round in knit.') + '</p>') +
        card(tabell(ribb_h, ribb_r, min_index=0)) +
        rosep(L(lang, 'JORDBÆRHETTEN', 'THE STRAWBERRY TOP')) +
        card('<p>' + L(lang,
             'Strikk jordbærhetten fra side 5 over 4 masker og gjenta den rundt så mange '
             'ganger som kolonnen din sier. Den er bare 4 omganger høy, så hetten blir en '
             'smal krans av små grønne spisser opp i det rosa, ikke et stort bladparti. '
             'Bytt til rosa etter siste mønsteromgang og strikk 1 omgang rett.',
             'Work the strawberry top from page 5 over 4 stitches and repeat it round as '
             'many times as your column says. It is only 4 rounds deep, so it forms a '
             'narrow ring of small green points up into the pink, not a large leaf '
             'panel. Change to pink after the last chart round and work 1 round in '
             'knit.') + '</p>'), 6))

    # ------------------------------------------------------------ 7 HÅND OG FRØ
    hand_h = [Sh] + L(lang, ['Masker', 'Hånd i rosa'], ['Stitches', 'Hand in pink'])
    hand_r = [[navn(v, lang), str(v['masker']) + m, komma(v['hand_cm']) + ' cm']
              for v in VOTTER]
    P.append(pg(
        banner(L(lang, '2 · HÅNDEN OG FRØENE', '2 · THE HAND AND THE SEEDS')) +
        '<p>' + L(lang,
        'Strikk rosa glattstrikk rundt. På en frøomgang strikker du frøomgang A fra side 5, '
        'altså *3 rosa, 1 kremhvit, 4 rosa*, gjentatt rundt. Strikk 3 omganger rosa. Strikk '
        'deretter frøomgang B, altså *7 rosa, 1 kremhvit*, gjentatt rundt. Fortsett i rosa '
        'til hånden måler lengden i kolonnen din, målt fra bladspissene.',
        'Work in pink stocking stitch in the round. On a seed round work seed round A from '
        'page 5, that is *3 pink, 1 cream, 4 pink*, repeated round. Work 3 rounds in pink. '
        'Then work seed round B, that is *7 pink, 1 cream*, repeated round. Continue in pink '
        'until the hand measures the length in your column, measured from the leaf tips.') +
        '</p>' +
        card(tabell(hand_h, hand_r, min_index=0)) +
        cme(L(lang,
              'To frøomganger er nok på en så liten flate. Flere blir travelt, og hver '
              'ekstra kremhvit maske er en tråd til som skal festes på innsiden.',
              'Two seed rounds are enough on such a small area. More becomes busy, and every '
              'extra cream stitch is another end to weave in on the inside.')), 7))

    # -------------------------------------------------------------- 8 TOPPFELLING
    fell_h = [Sh] + L(lang, ['Start', '*2 r, 2 r sm*', '*1 r, 2 r sm*', '2 r sm rundt',
                             'Trekk sammen'],
                      ['Start', '*k2, k2tog*', '*k1, k2tog*', 'k2tog round', 'Draw up'])
    fell_r = []
    for v in VOTTER:
        t = v['fellinger']
        fell_r.append([navn(v, lang), str(v['masker']) + m, str(t[0]) + m, str(t[1]) + m,
                       str(t[2]) + m, str(t[-1]) + m])
    P.append(pg(
        banner(L(lang, '3 · TOPPFELLINGEN', '3 · SHAPING THE TOP')) +
        '<p>' + L(lang,
        'Fell etter tabellen, med 1 omgang rett mellom hver felleomgang. Les raden din fra '
        'venstre mot høyre: hver kolonne er masketallet du skal ha igjen etter den '
        'felleomgangen. Klipp garnet til slutt, trekk tråden gjennom de siste maskene, stram '
        'forsiktig og fest godt på innsiden.',
        'Decrease as in the table, with 1 knit round between each decrease round. Read your '
        'row from left to right: each column is the stitch count you should have after that '
        'decrease round. Cut the yarn at the end, draw it through the remaining stitches, '
        'tighten gently and fasten off firmly on the inside.') + '</p>' +
        card(tabell(fell_h, fell_r, min_index=0)) +
        cme(L(lang,
              'Stram ikke tråden hardt. En hard knute i toppen kjennes gjennom votten og '
              'ligger rett mot fingertuppene.',
              'Do not pull the yarn tight. A hard knot at the top can be felt through the '
              'mitten and sits right against the fingertips.')), 8))

    # ----------------------------------------------------- 9 ANDRE VOTT OG I-CORD
    snor_h = [Sh] + L(lang, ['I-cord, masker', 'Snorlengde'], ['I-cord stitches', 'Cord length'])
    snor_r = [[navn(v, lang), '3' + m, str(v['snor_cm']) + ' cm'] for v in VOTTER]
    P.append(pg(
        banner(L(lang, '4 · ANDRE VOTT OG SNOR', '4 · SECOND MITTEN AND CORD')) +
        rosep(L(lang, 'DEN ANDRE VOTTEN', 'THE SECOND MITTEN')) +
        card('<p>' + L(lang,
             'Strikk den andre votten helt likt. Kontroller at jordbærhetten og frøene '
             'begynner på samme sted på begge, og tell omgangene i rosa i stedet for å måle, '
             'så blir de to like lange.',
             'Work the second mitten exactly the same. Check that the strawberry top and seeds '
             'start in the same place on both, and count the rounds in pink rather than '
             'measuring, so the two come out the same length.') + '</p>') +
        sagep(L(lang, 'I-CORD', 'THE I-CORD')) +
        card('<p>' + L(lang,
             'Legg opp 3 masker med rosa og strikk i-cord til snoren måler lengden i '
             'kolonnen din. Fell av. Sy én ende godt fast på innsiden av hver mansjett, med '
             'flere små sting, men pass på at sømmen ikke blir hard mot huden.',
             'Cast on 3 stitches in pink and work an i-cord until the cord measures the '
             'length in your column. Cast off. Sew one end firmly to the inside of each '
             'cuff, with several small stitches, taking care that the seam does not press '
             'against the skin.') + '</p>' + tabell(snor_h, snor_r, min_index=0)) +
        cme(L(lang,
              'Snoren skal gå gjennom ermene, ikke rundt halsen. Tilpass lengden til plagget '
              'vottene brukes til, og bruk aldri vottene med snor uten oppsyn.',
              'The cord goes through the sleeves, never round the neck. Adjust the length to '
              'the garment the mittens are worn with, and never use corded mittens '
              'unsupervised.')), 9))

    # ------------------------------------------------------------- 10 TESTSTRIKK
    P.append(pg(f.side_teststrikk(lang, 'vottene', 'mittens'), 10))

    # -------------------------------------------------------------- 11 MONTERING
    P.append(pg(f.side_montering(
        lang,
        'Votter med sammenbindingssnor skal bare brukes under oppsyn.',
        'Mittens with a connecting cord must only be used under supervision.'), 11))

    # ------------------------------------------------------------- 12 AVSLUTNING
    P.append(pg(f.side_avslutning(lang), 12))
    return P


f.skriv('votter',
        {'no': 'Jordbærdrøm votter, LME strikkeoppskrift',
         'en': 'Strawberry Dream mittens, LME knitting pattern'},
        sider, 'votter')
