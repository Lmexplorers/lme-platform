# -*- coding: utf-8 -*-
"""
Jordbærdrøm tøfler med knyting, gradert i tre størrelser.

Klassiske babytøfler med rund fot, brettet ribb, bladspisser og
i-cord-knyting rundt ankelen.

Tøflene har tre størrelser, ikke fem som plaggene. Grunnen står i
grading_jordbaerdrom.py: bladrapporten er 8 masker, altså ca. 3,8 cm i
omkrets, og ankelen har bare tre reelle trinn å gå på i dette spennet.
"""
import _jordbaer_felles as f
from _jordbaer_felles import (TOFLER, banner, rosep, sagep, card, cme, ul,
                              tabell, side, L)

PH2_NO = 'LME STRIKKEOPPSKRIFT   |   TØFLER'
PH2_EN = 'LME KNITTING PATTERN   |   BOOTIES'


def komma(x):
    return str(x).replace('.', ',')


def navn(s, lang):
    return s['navn_no'] if lang == 'no' else s['navn_en']


def bar(lang):
    return f.storrelsesbar_liste(
        [(navn(s, lang), L(lang, 'str ', 'size ') + s['dekker']) for s in TOFLER])


def sider(lang):
    def pg(body, num):
        return side(body, num, lang, PH2_NO, PH2_EN)
    Sh = L(lang, 'Størrelse', 'Size')
    m = L(lang, ' m', ' sts')
    P = []

    # --------------------------------------------------------------- 1 FORSIDE
    P.append(pg(f.forside(
        lang,
        L(lang, 'JORDBÆRDRØM TØFLER', 'STRAWBERRY DREAM BOOTIES'),
        L(lang, 'PREMATUR TIL 2 MÅNEDER', 'PREEMIE TO 2 MONTHS'),
        L(lang,
          'Klassiske babytøfler med rund fot, brettet ribb, bladspisser og '
          'i-cord-knyting rundt ankelen. Gradert i tre størrelser som dekker hele '
          'Jordbærdrøm-kolleksjonen.',
          'Classic baby booties with a rounded foot, a folded rib cuff, leaf tips and i-cord '
          'ties at the ankle. Graded in three sizes covering the whole Strawberry Dream '
          'collection.'),
        bar=bar(lang)), 1))

    # ---------------------------------------------------------- 2 FØR DU BEGYNNER
    P.append(pg(
        banner(L(lang, 'FØR DU BEGYNNER', 'BEFORE YOU START')) +
        card('<p>' + L(lang,
             'Tøflene strikkes ovenfra og ned. Den høye ribben brettes utover ved bruk. '
             'Etter knytehullene og bladpartiet strikkes oversiden av foten frem og tilbake '
             'som en liten klaff. Deretter plukkes det opp masker langs begge sidene av '
             'klaffen, og foten og sålen formes med fellinger.',
             'The booties are knitted from the top down. The deep rib folds outwards in '
             'wear. After the eyelet round and the leaf panel, the instep is worked back and '
             'forth as a small flap. Stitches are then picked up along both sides of the '
             'flap, and the foot and sole are shaped with decreases.') + '</p>') +
        rosep(L(lang, 'DETTE LÆRER DU', 'WHAT YOU WILL LEARN')) +
        card(ul(L(lang,
                  ['å strikke en høy, brettet ribb',
                   'å lage en hullrad til i-cord-knyting',
                   'å forme overside, hæl og såle',
                   'å strikke to helt like tøfler'],
                  ['knitting a deep, folded rib cuff',
                   'making an eyelet round for i-cord ties',
                   'shaping the instep, heel and sole',
                   'knitting two identical booties']))) +
        sagep(L(lang, 'VANSKELIGHETSGRAD', 'DIFFICULTY')) +
        cme(L(lang,
              'Lett til litt øvet. Oppplukkingen langs klaffen er det eneste nye, og den '
              'blir jevnest om du plukker opp i den ytterste hele masken, ikke i kanttråden.',
              'Easy to slightly experienced. Picking up along the flap is the only new step, '
              'and it comes out most even if you pick up in the outermost whole stitch, not '
              'in the edge thread.')), 2))

    # ------------------------------------------------------------- 3 STØRRELSER
    khead = [Sh] + L(lang, ['Passer til plaggstørrelse', 'Fotlengde', 'Ankelomkrets'],
                     ['Fits garment size', 'Foot length', 'Ankle circumference'])
    krow = [[navn(s, lang), s['dekker'], komma(s['fot_cm']) + ' cm',
             komma(s['ankel_cm']) + ' cm'] for s in TOFLER]
    mhead = [Sh] + L(lang, ['Legg opp', 'Bladrapporter', 'Ribb før bretting', 'I-cord per tøffel'],
                     ['Cast on', 'Leaf repeats', 'Cuff before folding', 'I-cord per bootie'])
    mrow = [[navn(s, lang), str(s['masker']) + m, str(s['rapporter']) + ' x',
             str(s['ribb_cm']) + ' cm', str(s['icord_cm']) + ' cm'] for s in TOFLER]
    P.append(pg(f.side_storrelser_smaadel(
        lang,
        L(lang,
          'Tøflene er gradert i tre størrelser, ikke fem som plaggene. En bladrapport er 8 '
          'masker, altså ca. 3,8 cm rundt ankelen, og det gir bare tre reelle trinn i dette '
          'spennet. Mål foten fra hælen til lengste tå, og velg den størrelsen som er '
          'nærmest over målet.',
          'The booties are graded in three sizes, not five like the garments. One leaf '
          'repeat is 8 stitches, approx. 3.8 cm round the ankle, which gives only three real '
          'steps in this range. Measure the foot from heel to longest toe, and choose the '
          'size just above that measurement.'),
        khead, krow, mhead, mrow,
        [(navn(s, lang), L(lang, 'str ', 'size ') + s['dekker']) for s in TOFLER],
        L(lang,
          'Fotlengden er det målet som betyr noe. Ankelomkretsen er romslig med vilje, '
          'siden ribben skal brettes og knytes inn til riktig vidde.',
          'The foot length is the measurement that matters. The ankle circumference is '
          'deliberately generous, since the rib is folded and the ties draw it in to the '
          'right width.')), 3))

    # ------------------------------------------------------------------- 4 GARN
    garn = [[navn(s, lang), '%d g' % (15 + 5 * i), '%d g' % (15 + 5 * i), '5 g']
            for i, s in enumerate(TOFLER)]
    ekstra = L(lang,
               [['Pinne 4 mm', 'settpinner eller Magic Loop, omgangene er svært små'],
                ['Stoppenål', 'til å feste tråder og maske sammen tåen'],
                ['2 maskemarkører', 'til omgangens begynnelse og midt foran']],
               [['4 mm needles', 'double-pointed or Magic Loop, the rounds are very small'],
                ['Darning needle', 'for weaving in ends and grafting the toe'],
                ['2 stitch markers', 'for the beginning of the round and centre front']])
    P.append(pg(f.side_garn(lang, garn, ekstra), 4))

    # ---------------------------------------------------------------- 5 DIAGRAM
    P.append(pg(f.side_diagram(lang), 5))

    # -------------------------------------------------------- 6 RIBB OG HULLRAD
    ribb_h = [Sh] + L(lang, ['Legg opp', 'Ribb', 'Bladrapporter rundt'],
                      ['Cast on', 'Rib', 'Leaf repeats round'])
    ribb_r = [[navn(s, lang), str(s['masker']) + m, str(s['ribb_cm']) + ' cm',
               str(s['rapporter']) + ' x'] for s in TOFLER]
    P.append(pg(
        banner(L(lang, '1 · RIBB, HULLRAD OG BLAD', '1 · RIB, EYELETS AND LEAVES')) +
        card('<p>' + L(lang,
             'Legg opp med grønt, samle til en omgang og strikk *2 rett, 2 vrang* til ribben '
             'måler høyden i kolonnen din. Ribben skal senere brettes utover. Strikk 1 '
             'omgang rett.',
             'Cast on in green, join in the round and work *k2, p2* until the rib measures '
             'the height in your column. The rib will later be folded outwards. Work 1 round '
             'in knit.') + '</p>') +
        card(tabell(ribb_h, ribb_r, min_index=0)) +
        rosep(L(lang, 'HULLRAD OG BLADSPISSER', 'EYELETS AND LEAF TIPS')) +
        card('<p>' + L(lang,
             'Strikk hullraden: *2 rett sammen, 1 kast, 2 rett*, gjenta rundt. Strikk 1 '
             'omgang grønt. Strikk så bladrapporten fra side 5 over 8 masker, gjentatt så '
             'mange ganger som kolonnen din sier, slik at det grønne smalner ned mot den '
             'rosa foten. Strikk 2 omganger rosa.',
             'Work the eyelet round: *k2tog, yarn over, k2*, repeat round. Work 1 round in '
             'green. Then work the leaf repeat from page 5 over 8 stitches, repeated as many '
             'times as your column says, so that the green narrows down towards the pink '
             'foot. Work 2 rounds in pink.') + '</p>'), 6))

    # ------------------------------------------------------------- 7 OVERFOTEN
    ov_h = [Sh] + L(lang, ['Masker rundt', 'Midt foran', 'Hvilende', 'Pinner frem og tilbake'],
                    ['Stitches round', 'Centre front', 'On hold', 'Rows back and forth'])
    ov_r = [[navn(s, lang), str(s['masker']) + m, str(s['overfot_m']) + m,
             str(s['hvilende']) + m, s['overfot_pinner']] for s in TOFLER]
    P.append(pg(
        banner(L(lang, '2 · OVERFOTEN', '2 · THE INSTEP')) +
        '<p>' + L(lang,
        'Sett maskene midt foran på én pinne og la resten hvile. Strikk glattstrikk frem og '
        'tilbake over disse maskene i antall pinner fra kolonnen din. Strikk 2-3 kremhvite '
        'frø underveis, spredt utover klaffen. Avslutt med en rettsidepinne.',
        'Place the centre front stitches on one needle and leave the rest on hold. Work in '
        'stocking stitch back and forth over these stitches for the number of rows in your '
        'column. Work 2-3 cream seeds as you go, scattered over the flap. End with a right '
        'side row.') + '</p>' +
        card(tabell(ov_h, ov_r, min_index=0)) +
        cme(L(lang,
              'Klaffen er tøffelens overside, altså den delen som synes mest. Frøene bør '
              'derfor sitte midt på den, ikke helt ute i kantene.',
              'The flap is the top of the bootie, the part that shows most. The seeds should '
              'therefore sit in the middle of it, not right out at the edges.')), 7))

    # -------------------------------------------------------- 8 PLUKK OPP OG FELL
    pl_h = [Sh] + L(lang, ['Klaff', 'Plukk opp hver side', 'Hvilende', 'Til sammen',
                           'Etter 3 felleomganger'],
                    ['Flap', 'Pick up each side', 'On hold', 'Total', 'After 3 decrease rounds'])
    pl_r = [[navn(s, lang), str(s['overfot_m']) + m, str(s['plukk']) + m,
             str(s['hvilende']) + m, str(s['etter_plukk']) + m,
             str(s['etter_felling']) + m] for s in TOFLER]
    P.append(pg(
        banner(L(lang, '3 · PLUKK OPP OG FORM FOTEN', '3 · PICK UP AND SHAPE THE FOOT')) +
        '<p>' + L(lang,
        'Strikk klaffens masker, plukk opp langs den første siden av klaffen, strikk de '
        'hvilende maskene, og plukk opp langs den andre siden. Sett omgangsmarkøren midt bak. '
        'Strikk 4 omganger rosa rundt.',
        'Work the flap stitches, pick up along the first side of the flap, work the held '
        'stitches, and pick up along the second side. Place the round marker at centre back. '
        'Work 4 rounds in pink.') + '</p>' +
        card(tabell(pl_h, pl_r, min_index=0)) +
        rosep(L(lang, 'FELLINGENE', 'THE DECREASES')) +
        card('<p>' + L(lang,
             'Fell i klaffens fire hjørner: strikk 2 rett sammen før hvert hjørne og 2 rett '
             'sammen vridd etter hvert hjørne. Det er 4 masker per felleomgang. Gjenta '
             'annenhver omgang, 3 felleomganger i alt, til du har masketallet i siste '
             'kolonne. Strikk 1 omgang rett.',
             'Decrease at the four corners of the flap: knit 2 together before each corner '
             'and ssk after each corner. That is 4 stitches per decrease round. Repeat every '
             'other round, 3 decrease rounds in all, until you have the stitch count in the '
             'last column. Work 1 round in knit.') + '</p>'), 8))

    # ---------------------------------------------------------- 9 SÅLE OG I-CORD
    sa_h = [Sh] + L(lang, ['Masker igjen', 'Overside / såle', 'Fell tåen til', 'Fotlengde'],
                    ['Stitches left', 'Top / sole', 'Decrease toe to', 'Foot length'])
    sa_r = [[navn(s, lang), str(s['etter_felling']) + m,
             str(s['halv']) + ' / ' + str(s['halv']) + m,
             '2 x ' + str(s['ta_m']) + m, komma(s['fot_cm']) + ' cm'] for s in TOFLER]
    P.append(pg(
        banner(L(lang, '4 · SÅLEN OG KNYTINGEN', '4 · THE SOLE AND THE TIES')) +
        '<p>' + L(lang,
        'Fordel maskene likt på overside og såle. Fell tåen ved å strikke 2 rett sammen i '
        'hver side på annenhver omgang, til det står igjen antallet i kolonnen din på hver '
        'del. Kontroller fotlengden mot siste kolonne før du feller ferdig. Vend tøffelen på '
        'vrangen og mask de to delene sammen, eller fell av og sy dem sammen med maskesting.',
        'Divide the stitches evenly between the top and the sole. Shape the toe by knitting 2 '
        'together at each side every other round, until the number in your column remains on '
        'each part. Check the foot length against the last column before finishing the '
        'decreases. Turn the bootie inside out and graft the two parts together, or cast off '
        'and sew them with mattress stitch.') + '</p>' +
        card(tabell(sa_h, sa_r, min_index=0)) +
        sagep(L(lang, 'I-CORD OG ANDRE TØFFEL', 'I-CORD AND SECOND BOOTIE')) +
        cme(L(lang,
              'Legg opp 3 masker med grønt og strikk en i-cord i lengden fra '
              'størrelsestabellen. Tre den gjennom hullraden og knyt en løs sløyfe foran. '
              'Strikk den andre tøffelen helt likt, og kontroller at klaffen har like mange '
              'pinner på begge.',
              'Cast on 3 stitches in green and work an i-cord to the length in the size '
              'table. Thread it through the eyelet round and tie a loose bow at the front. '
              'Work the second bootie exactly the same, and check that the flap has the same '
              'number of rows on both.')), 9))

    # ------------------------------------------------------------- 10 TESTSTRIKK
    P.append(pg(f.side_teststrikk(lang, 'tøflene', 'booties'), 10))

    # -------------------------------------------------------------- 11 MONTERING
    P.append(pg(f.side_montering(
        lang,
        'Knytesnorene brukes bare under oppsyn, og skal knytes løst, aldri strammes.',
        'The ties are used under supervision only, and are tied loosely, never tightened.'), 11))

    # ------------------------------------------------------------- 12 AVSLUTNING
    P.append(pg(f.side_avslutning(lang), 12))
    return P


f.skriv('tøfler',
        {'no': 'Jordbærdrøm tøfler med knyting, LME strikkeoppskrift',
         'en': 'Strawberry Dream booties with ties, LME knitting pattern'},
        sider, 'tofler')
