# -*- coding: utf-8 -*-
"""
Jordbærdrøm genser og skjørt, gradert i ni størrelser (44 til 92).

Et matchende todelt sett: toppstrikket genser med rundt bærestykke og lange
ermer, og et separat skjørt med grønn ribb i livet. Begge plaggene har det samme
blad- og frømønsteret.

Alle masketall leses fra sizes.json, som skrives av grading_jordbaerdrom.py.
"""
import _jordbaer_felles as f
from _jordbaer_felles import (PLAGG, banner, rosep, sagep, card, cme, ul,
                              tabell, str_head, side, L)

PH2_NO = 'LME STRIKKEOPPSKRIFT   |   GENSER OG SKJØRT'
PH2_EN = 'LME KNITTING PATTERN   |   JUMPER AND SKIRT'

# Genser og skjørt regnes hver for seg, og garnmengden er summen av de to.
GARN = [[p['str_nr'],
         '%d g' % (5 * round(((p['bol_genser'] * p['bol_genser_cm']
                               + 2 * p['erme_overarm'] * p['erme_lengde_cm']
                               + p['skjort_vidde'] * p['skjort_lengde_cm']) * 0.20 + 50) / 5)),
         '%d g' % (5 * round((p['yoke'] * 0.28 + p['skjort_liv'] * 0.30 + 12) / 5)), '5 g']
        for p in PLAGG]

EKSTRA_NO = [['Pinne 4 mm', 'settpinner eller Magic Loop til hals, ermer og linning'],
             ['Myk elastikk', 'ca. 1 cm bred, valgfritt til skjørtets linning'],
             ['Stoppenål', 'til å feste tråder og sy ned linningen'],
             ['Maskemarkør', 'til å merke omgangens begynnelse og hver ermeside']]
EKSTRA_EN = [['4 mm needles', 'double-pointed or Magic Loop for neck, sleeves and waistband'],
             ['Soft elastic', 'approx. 1 cm wide, optional for the skirt waistband'],
             ['Darning needle', 'for weaving in ends and sewing down the waistband'],
             ['Stitch marker', 'to mark the beginning of the round and each sleeve side']]


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
        L(lang, 'JORDBÆRDRØM SETT', 'STRAWBERRY DREAM SET'),
        L(lang, 'GENSER OG SKJØRT · STØRRELSE 44 TIL 92',
          'JUMPER AND SKIRT · SIZES 44 TO 92'),
        L(lang,
          'Et matchende todelt sett: toppstrikket genser med rundt bærestykke og lange '
          'ermer, og et separat skjørt med grønn ribb i livet. Begge delene har det samme '
          'blad- og frømønsteret, og begge avsluttes med buekant og en smal grønn kant. Gradert i ni '
          'størrelser, fra liten nyfødt og opp til to år.',
          'A matching two-piece set: a top-down jumper with a round yoke and long sleeves, '
          'and a separate skirt with a green rib at the waist. Both pieces share the same '
          'leaf and seed pattern, and both end in a scalloped hem with a narrow green edge. Graded in nine sizes, '
          'from small newborn to two years.'), bilde='genser.jpg'), 1))

    # ---------------------------------------------------------- 2 FØR DU BEGYNNER
    P.append(pg(
        banner(L(lang, 'FØR DU BEGYNNER', 'BEFORE YOU START')) +
        card('<p>' + L(lang,
             'Genseren strikkes ovenfra og ned med rundt bærestykke og lange ermer, uten '
             'åpning i nakken. '
             'Skjørtet strikkes separat, også ovenfra og ned, med en brettet linning som '
             'grønn ribb i livet. De to delene deler diagram, fasthet '
             'og farger, men strikkes helt uavhengig av hverandre.',
             'The jumper is knitted top-down with a round yoke and long sleeves, with no '
             'neck opening. The skirt '
             'is knitted separately, also from the top down, with a folded waistband that a '
             'a green rib at the waist. The two pieces share the charts, '
             'the gauge and the colours, but are knitted entirely independently.') + '</p>') +
        rosep(L(lang, 'DETTE LÆRER DU', 'WHAT YOU WILL LEARN')) +
        card(ul(L(lang,
                  ['å strikke en genser med rundt bærestykke',
                   'å dele til bol og ermer, og strikke ermene i runden',
                   'å strikke et skjørt med ribbet linning og buekant',
                   'å strikke buekant med grønn kant på bol og ermer'],
                  ['knitting a jumper with a round yoke',
                   'dividing for body and sleeves, and working sleeves in the round',
                   'knitting a skirt with a ribbed waistband and a scalloped hem',
                   'working a scalloped hem with a green edge on body and sleeves']))) +
        sagep(L(lang, 'VANSKELIGHETSGRAD', 'DIFFICULTY')) +
        cme(L(lang,
              'Lett til litt øvet. Ermene er den eneste delen med få masker på pinnen, og '
              'der er Magic Loop eller settpinner til god hjelp.',
              'Easy to slightly experienced. The sleeves are the only part with few '
              'stitches on the needle, and there Magic Loop or double-pointed needles '
              'help.')), 2))

    # ------------------------------------------------------------- 3 STØRRELSER
    mh = [S] + L(lang, ['Genser brystvidde', 'Genser lengde', 'Ermelengde', 'Skjørt livvidde',
                        'Skjørt lengde'],
                 ['Jumper chest', 'Jumper length', 'Sleeve length', 'Skirt waist',
                  'Skirt length'])
    mr = [[p['str_nr'], komma(p['bryst_genser_cm']) + ' cm',
           str(p['genser_lengde_cm']) + ' cm', str(p['erme_lengde_cm']) + ' cm',
           komma(p['skjort_liv_cm']) + ' cm',
           str(p['skjort_lengde_cm'] + 3) + ' cm'] for p in PLAGG]
    for i, kropp in enumerate(f.side_storrelser(lang, 'settet', mr, mh)):
        P.append(pg(kropp, 3 + i))

    # ------------------------------------------------------------------- 4 GARN
    P.append(pg(f.side_garn(lang, GARN, L(lang, EKSTRA_NO, EKSTRA_EN)), 5))

    # ---------------------------------------------------------------- 5 DIAGRAM
    P.append(pg(f.side_diagram(lang), 6))

    # ------------------------------------------------- 6 GENSER, HALS OG BÆRESTYKKE
    hals_h = [S] + L(lang, ['Legg opp', 'Per felt', 'Økeomg.', 'Jevne omg.', 'Bærestykke',
                            'Bladrapp.'],
                     ['Cast on', 'Per section', 'Inc. rnds', 'Even rnds', 'Yoke',
                      'Leaf rep.'])
    hals_r = [[p['str_nr'], str(p['hals_co']) + m, p['hals_per_felt'], p['oke_omganger'],
               p['yoke_jevne'], str(p['yoke']) + m, str(p['blad_rapporter']) + ' x']
              for p in PLAGG]
    P.append(pg(
        banner(L(lang, 'GENSER · 1 · HALS OG BÆRESTYKKE', 'JUMPER · 1 · NECK AND YOKE')) +
        card('<p>' + L(lang,
             'Legg opp med grønt på pinne 4 mm med en elastisk oppleggingskant, samle til '
             'en omgang og strikk 5 omganger vridd ribb. Genseren har ingen åpning i '
             'nakken, så halsen skal tres over hodet, og da er det oppleggingskanten som '
             'avgjør. Legg opp løst, gjerne over to pinner holdt sammen. Del så maskene i '
             '8 like felt, sett en markør mellom hvert felt, og øk 1 maske i hvert felt på '
             'annenhver omgang, altså 8 masker per økeomgang, til du har masketallet i '
             'kolonnen din. Strikk de jevne omgangene i siste kolonne, og deretter '
             'bladrapporten fra side 5 over 8 masker. Avslutt med 1 omgang rosa.',
             'Cast on in green on 4 mm needles with a stretchy cast-on, join in the round '
             'and work 5 rounds of twisted rib. The jumper has no neck opening, so the '
             'neck has to pass over the head, and there the cast-on edge decides. Cast on '
             'loosely, for instance over two needles held together. Then divide the '
             'stitches into 8 equal sections, place a marker between each, and increase 1 '
             'stitch in each section every other round, that is 8 stitches per increase '
             'round, until you have the stitch count in your column. Work the even rounds '
             'in the last column, then the leaf repeat from page 5 over 8 stitches. Finish '
             'with 1 round in pink.') + '</p>') +
        card(tabell(hals_h, hals_r, min_index=0)) +
        cme(L(lang,
              'Halsen er regnet ut fra hodet, ikke gjettet: den ligger på 80 til 87 % av '
              'hodeomkretsen i hver størrelse. Ribben strekker resten når genseren tres '
              'på, og trekker seg sammen igjen etterpå. Kjennes den likevel stram, er det '
              'nesten alltid oppleggingskanten som er for hard, ikke masketallet.',
              'The neck is calculated from the head, not guessed: it sits at 80 to 87 % of '
              'the head circumference in every size. The rib stretches the rest as the '
              'jumper goes on, and draws back in afterwards. If it still feels tight, it '
              'is almost always the cast-on edge that is too firm, not the stitch '
              'count.')), 7))

    # ------------------------------------------------ 7 GENSER, DEL TIL BOL OG ERMER
    del_h = [S] + L(lang, ['Forstykke', 'Sett av til erme', 'Legg opp', 'Bakstykke', 'Bol'],
                    ['Front', 'Hold for sleeve', 'Cast on', 'Back', 'Body'])
    del_r = [[p['str_nr'], p['front'], p['sleeve'], p['underarm_genser'], p['back'],
              str(p['bol_genser']) + m] for p in PLAGG]
    P.append(pg(
        banner(L(lang, 'GENSER · 2 · DEL TIL BOL OG ERMER',
                 'JUMPER · 2 · DIVIDE FOR BODY AND SLEEVES')) +
        '<p>' + L(lang,
        'Les raden for din størrelse fra venstre mot høyre, i den rekkefølgen du strikker: '
        'forstykket, maskene du setter på en tråd til første erme, maskene du legger opp '
        'under armen, bakstykket, og så det samme ermet på den andre siden. Genseren legger '
        'opp 4 masker under hver arm, altså to mer enn kjolen og romperen, fordi et erme '
        'trenger litt ekstra vidde under armen.',
        'Read the row for your size from left to right, in the order you knit: the front, '
        'the stitches you place on hold for the first sleeve, the stitches you cast on under '
        'the arm, the back, then the same sleeve on the other side. The jumper casts on 4 '
        'stitches under each arm, two more than the dress and the romper, because a sleeve '
        'needs a little extra width at the underarm.') + '</p>' +
        card(tabell(del_h, del_r, min_index=0)), 8))

    # ------------------------------------------------------------- 8 GENSER, BOL
    bol_h = [S] + L(lang, ['Masker i bolen', 'Brystvidde', 'Lengde fra under armen',
                           'Omganger ribb'],
                    ['Body stitches', 'Chest', 'Length from underarm', 'Rounds of rib'])
    bol_r = [[p['str_nr'], str(p['bol_genser']) + m, komma(p['bryst_genser_cm']) + ' cm',
              str(p['bol_genser_cm']) + ' cm', 6] for p in PLAGG]
    P.append(pg(
        banner(L(lang, 'GENSER · 3 · BOLEN', 'JUMPER · 3 · THE BODY')) +
        '<p>' + L(lang,
        'Strikk rosa glattstrikk rundt med frø. ' + 'Frøene strikkes inn hele veien ned, ikke bare her. Rytmen er den samme overalt: frøomgang A, 4 omganger rosa, frøomgang B, 4 omganger rosa, og så om igjen. Begynn med en gang det rosa begynner, rett etter bladpartiet.' + ' '
        'Strikk til bolen måler lengden i '
        'kolonnen din, målt rett ned fra under armen. Bytt så til grønt og strikk '
        'buekanten, som står på neste side.',
        'Work in pink stocking stitch in the round with seeds. '
        'The seeds are knitted in all the way down, not just here. The rhythm is the same everywhere: seed round A, 4 rounds in pink, seed round B, 4 rounds in pink, and so on. Start as soon as the pink starts, right after the leaf panel. Work until the '
        'body measures the length in your column, measured straight down from the underarm. '
        'Then work the scalloped hem, which is on the next page.') + '</p>' +
        card(tabell(bol_h, bol_r, min_index=0)) +
        cme(L(lang,
              'Bolen avsluttes med buekanten på neste side. Fell aldri av i buerunden, alltid '
              'i den grønne kanten etter den, og fell svært løst. En stram avfelling '
              'trekker buene sammen, og da blir kanten rett.',
              'The body ends with the scalloped hem on the next page. Never cast off in a '
              'scallop round, always in the green edge after it, and cast off very '
              'loosely. A tight cast-off pulls the scallops together, and then the edge '
              'comes out straight.')), 9))

    # ----------------------------------------------------------- 9 GENSER, ERMER
    erme_h = [S] + L(lang, ['Hvilende masker', 'Plukk opp', 'Overarm', 'Felleomganger',
                            'Mansjett', 'Ermelengde'],
                     ['Held stitches', 'Pick up', 'Upper arm', 'Decrease rounds', 'Cuff',
                      'Sleeve length'])
    erme_r = [[p['str_nr'], p['sleeve'], p['underarm_genser'], str(p['erme_overarm']) + m,
               p['erme_fellinger'], str(p['erme_mansjett']) + m,
               str(p['erme_lengde_cm']) + ' cm'] for p in PLAGG]
    P.append(pg(
        banner(L(lang, 'GENSER · 4 · ERMENE', 'JUMPER · 4 · THE SLEEVES')) +
        '<p>' + L(lang,
        'Sett de hvilende ermemaskene på pinnen og plukk opp maskene under armen. Sett en '
        'markør midt under armen. Strikk rosa glattstrikk rundt, med noen få frø med god '
        'avstand. Fell 1 maske på hver side av markøren, altså 2 masker per felleomgang, '
        'fordelt jevnt over ermets lengde. Antall felleomganger står i kolonnen din.',
        'Place the held sleeve stitches on the needle and pick up the stitches under the '
        'arm. Place a marker at the centre of the underarm. Work in pink stocking stitch in '
        'the round, with a few seeds spaced well apart. Decrease 1 stitch at each side of '
        'the marker, that is 2 stitches per decrease round, spread evenly over the length of '
        'the sleeve. The number of decrease rounds is given in your column.') + '</p>' +
        card(tabell(erme_h, erme_r, min_index=0)) +
        sagep(L(lang, 'MANSJETTEN', 'THE CUFF')) +
        cme(L(lang,
              'Når ermet er så langt at det bare mangler kantens dybde, strikker du buekanten '
              'fra neste side, akkurat som på bolen. '
              'Dybden står i tabellen der. Strikk det andre ermet helt likt, og tell '
              'omgangene i stedet for å måle, så blir de to like lange.',
              'When the sleeve is long enough that only the depth of the wave edge is '
              'missing, work the scalloped hem from the next page, exactly as on the body. '
              'The depth is in the table there. Work the second sleeve the '
              'same, and count the rounds rather than measuring, so the two come out the '
              'same length.')), 10))

    # ------------------------------------------------------ 11 GRØNN BØLGEKANT
    bo_h = [S] + L(lang, ['Bol, masker', 'Bol, øk til', 'Buer', 'Erme, masker',
                          'Erme, øk til', 'Buer'],
                   ['Body stitches', 'Body, increase to', 'Scallops', 'Sleeve stitches',
                    'Sleeve, increase to', 'Scallops'])
    bo_r = [[p['str_nr'], str(p['bol_genser']) + m, str(p['genser_bolge']) + m,
             str(p['genser_bolge_buer']) + ' x', str(p['erme_mansjett']) + m,
             str(p['erme_bolge']) + m, str(p['erme_bolge_buer']) + ' x'] for p in PLAGG]
    P.append(pg(
        banner(L(lang, 'GENSER · 5 · KLARGJØR BUEKANTEN',
                 'JUMPER · 5 · PREPARING THE SCALLOPED HEM')) +
        '<p>' + L(lang,
        'Bol og ermer avsluttes med den samme buekanten. Bytt til grønt og '
        'strikk 1 omgang rett, og øk samtidig jevnt fordelt til masketallet i kolonnen '
        'din. Det er bare noen få masker, og de er der for at buene skal gå opp rundt. '
        'Strikk 1 omgang rett til, og gå så videre til neste side.',
        'The body and the sleeves both end with the same scalloped hem. Change to green '
        'and work 1 round in knit, increasing evenly to the stitch count in your column as '
        'you go. It is only a few stitches, and they are there so the scallops come out even '
        'all the way round. Work 1 more round in knit, then go on to the next page.') +
        '</p>' + card(tabell(bo_h, bo_r, min_index=0)) +
        cme(L(lang,
             'Fordel økingene jevnt rundt, ikke samlet på ett sted. Samler du dem, får '
             'genseren en pose akkurat der, og den synes når plagget henger.',
             'Spread the increases evenly round, not gathered in one place. Gathered, the '
             'jumper gets a pouch right there, and it shows when the garment hangs.')), 11))

    # -------------------------------------------------------------- 12 BØLGEN
    bd_h = [S] + L(lang, ['Buerunder', 'Omganger i alt', 'Kantens dybde'],
                   ['Scallop rounds', 'Rounds in all', 'Depth of the edge'])
    bd_r = [[p['str_nr'], str(p['bolge_gjent']) + ' x', str(p['bolge_omganger']) + ' x',
             komma(p['bolge_cm']) + ' cm'] for p in PLAGG]
    P.append(pg(
        banner(L(lang, 'GENSER · 6 · BUEKANTEN', 'JUMPER · 6 · THE WAVE')) +
        '<p>' + L(lang,
        'Buen er 6 masker og gjentas rundt. Strikk disse tre omgangene:',
        'The scallop is 6 stitches and is repeated round. Work these three rounds:') +
        '</p>' + card(ul(L(lang,
        ['Omgang 1, buerunden, i ROSA: *2 rett sammen vridd, 1 økning, 2 rett, 1 økning, '
         '2 rett sammen*, gjentatt rundt. Masketallet står stille, men kanten former seg '
         'i runde buer.',
         'Omgang 2: rett.',
         'Omgang 3: rett.'],
        ['Round 1, the scallop round, in PINK: *ssk, M1R, k2, M1L, k2tog*, repeated '
         'round. The stitch count stays the same, but the edge shapes itself into '
         'rounded scallops.',
         'Round 2: knit.',
         'Round 3: knit.']))) +
        '<p>' + L(lang,
        'Gjenta de tre omgangene så mange ganger som kolonnen din sier. Bytt så til '
        'grønt, strikk 3 omganger rett, og fell svært løst av. Den grønne kanten legger '
        'seg som en smal strek langs buekurven, også ned i dalene.',
        'Repeat the three rounds as many times as your column says. Then change to green, '
        'work 3 rounds in knit, and cast off very loosely. The green edge sits as a '
        'narrow line along the curve of the scallops, down into the valleys too.') +
        '</p>' +
        card(tabell(bd_h, bd_r, min_index=0)) +
        cme(L(lang,
             'Fellingene står i dalen mellom buene og økingene midt i buen. Det er det '
             'som former kanten. Økingene er lukkede, ikke kast: designbildene viser en '
             'hel kant uten hull.',
             'The decreases sit in the valley between the scallops and the increases at '
             'the centre of each. That is what shapes the edge. The increases are closed, '
             'not yarn overs: the design images show a solid edge with no holes.')), 12))

    # -------------------------------------------------------- 10 SKJØRT, LINNING
    lin_h = [S] + L(lang, ['Legg opp', 'Bladrapporter', 'Livvidde', 'Ribb', 'Grønt over ribben'],
                    ['Cast on', 'Leaf repeats', 'Waist', 'Rib', 'Green above the rib'])
    lin_r = [[p['str_nr'], str(p['skjort_liv']) + m, str(p['skjort_rapporter']) + ' x',
              komma(p['skjort_liv_cm']) + ' cm', L(lang, '3 cm', '3 cm'),
              L(lang, '2 cm', '2 cm')] for p in PLAGG]
    P.append(pg(
        banner(L(lang, 'SKJØRT · 5 · LINNINGEN', 'SKIRT · 5 · THE WAISTBAND')) +
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
              'nederst på side 7.',
              'Cast on loosely. The rib must stretch over the hips, and a tight cast-on '
              'edge is the most common reason a baby skirt will not go on. If you want '
              'elastic at the waist, the other way of working the waistband is at the '
              'bottom of page 7.')), 13))

    # ------------------------------------------------------ 11 SKJØRT, BLAD OG VIDDE
    sk_h = [S] + L(lang, ['Masker i linningen', 'Bladrapporter', '*2 r, M1* gir',
                          'Skjørtevidde', 'Lengde fra linningen'],
                   ['Waistband stitches', 'Leaf repeats', '*k2, M1* gives', 'Skirt width',
                    'Length from waistband'])
    sk_r = [[p['str_nr'], str(p['skjort_liv']) + m, str(p['skjort_rapporter']) + ' x',
             str(p['skjort_vidde']) + m, komma(p['skjort_vidde_cm']) + ' cm',
             str(p['skjort_lengde_cm']) + ' cm'] for p in PLAGG]
    P.append(pg(
        banner(L(lang, 'SKJØRT · 6 · BLAD, VIDDE OG LENGDE',
                 'SKIRT · 6 · LEAVES, WIDTH AND LENGTH')) +
        '<p>' + L(lang,
        'Strikk bladrapporten fra side 5 over 8 masker, gjentatt så mange ganger som '
        'kolonnen din sier. Bytt så til rosa og strikk *2 rett, 1 økning*, gjenta rundt. Nå '
        'er skjørtet ute i full vidde. Fortsett i rosa glattstrikk, og hold frørytmen '
        'gående uavbrutt nedover hele skjørtet, til '
        'skjørtet måler lengden i siste kolonne, målt nedenfor linningen.',
        'Work the leaf repeat from page 5 over 8 stitches, repeated as many times as your '
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
              'two pieces match when worn together.')), 14))

    # -------------------------------------------- 12 SKJØRT, BØLGEKANT OG ELASTIKK
    bue_h = [S] + L(lang, ['Masker nederst', 'Buer', 'Masker per bue', 'Buerunder',
                           'Grønne omganger'],
                    ['Stitches at hem', 'Scallops', 'Sts per scallop', 'Scallop rounds',
                     'Green rounds'])
    bue_r = [[p['str_nr'], str(p['skjort_vidde']) + m, str(p['skjort_buer']) + ' x',
              p['bue_bredde'], p['bue_omganger'], p['gronn_kant_omg']] for p in PLAGG]
    P.append(pg(
        banner(L(lang, 'SKJØRT · 7 · BUEKANT OG VALGFRI ELASTIKK',
                 'SKIRT · 7 · SCALLOPED HEM AND OPTIONAL ELASTIC')) +
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
              'later if needed.')), 15))

    # ------------------------------------------------------------- 13 TESTSTRIKK
    P.append(pg(f.side_teststrikk(lang, 'settet', 'set'), 16))

    # -------------------------------------------------------------- 14 MONTERING
    P.append(pg(f.side_montering(
        lang,
        'Kontroller at linningen sitter mykt og ikke lager merker etter en times bruk.',
        'Check that the waistband sits softly and leaves no marks after an hour of wear.'), 17))

    # ------------------------------------------------------------- 15 AVSLUTNING
    P.append(pg(f.side_avslutning(lang), 18))
    return P


f.skriv('genser og skjørt',
        {'no': 'Jordbærdrøm genser og skjørt, LME strikkeoppskrift',
         'en': 'Strawberry Dream jumper and skirt, LME knitting pattern'},
        sider, 'genser_skjort')
