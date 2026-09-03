# -*- coding: utf-8 -*-
"""
Jordbærdrøm lue, gradert i fem størrelser (dekker plaggstørrelse 44 til 92).

Rund lue strikket nedenfra og opp: grønn buekant nederst, rosa glattstrikk med
frø, rosa toppfelling, og en grønn kalyks av seks begerblad med i-cord-stilk
som sys over toppen. Øreklaffer med i-cord-bånd.

Luen har fem størrelser, ikke ni som plaggene. Grunnen står i
grading_jordbaerdrom.py: frødiagrammet er 8 masker, altså 3,8 cm i omkrets,
mens et barnehode vokser 1 til 3 cm mellom to nabostørrelser. Ni luer hadde
blitt de samme fem tallene med ni navn.

Hver av de ni plaggstørrelsene er dekket av nøyaktig én lue. Det kontrolleres
med en assert i graderingen, så et hull eller en dobbeltdekning stopper
byggingen i stedet for å ende i en oppskrift.
"""
import _jordbaer_felles as f
from _jordbaer_felles import (LUER, banner, rosep, sagep, card, cme, ul,
                              tabell, side, L)

PH2_NO = 'LME STRIKKEOPPSKRIFT   |   LUE'
PH2_EN = 'LME KNITTING PATTERN   |   HAT'


def komma(x):
    return str(x).replace('.', ',')


def navn(v, lang):
    return v['navn_no'] if lang == 'no' else v['navn_en']


def bar(lang):
    return f.storrelsesbar_liste(
        [(navn(v, lang), L(lang, 'str ', 'size ') + v['dekker']) for v in LUER])


def sider(lang):
    def pg(body, num):
        return side(body, num, lang, PH2_NO, PH2_EN)
    Sh = L(lang, 'Størrelse', 'Size')
    m = L(lang, ' m', ' sts')
    P = []

    # --------------------------------------------------------------- 1 FORSIDE
    P.append(pg(f.forside(
        lang,
        L(lang, 'JORDBÆRDRØM LUE', 'STRAWBERRY DREAM HAT'),
        L(lang, 'STØRRELSE 44 TIL 92', 'SIZES 44 TO 92'),
        L(lang,
          'Rund lue med grønn buekant nederst, innstrikkede frø, øreklaffer med bånd, og '
          'en grønn kalyks av seks begerblad med i-cord-stilk på toppen. Fem størrelser, som '
          'dekker plaggstørrelse 44 til 92.',
          'A round hat with a green scalloped edge, knitted-in seeds, ear flaps with ties, '
          'and a green calyx of six sepals with an i-cord stalk on top. Five sizes, '
          'covering garment sizes 44 to 92.'),
        bar=bar(lang), bilde='lue.jpg'), 1))

    # ------------------------------------------------------- 2 FØR DU BEGYNNER
    P.append(pg(
        banner(L(lang, 'FØR DU BEGYNNER', 'BEFORE YOU START')) +
        card('<p>' + L(lang,
             'Luen strikkes rundt nedenfra og opp. Den begynner med den grønne '
             'buekanten, og resten av luen er rosa: legg og toppfelling. Frøene strikkes inn i legget. Når luen er ferdig, strikkes '
             'kalyksen som en egen del i grønt, seks spisse begerblad rundt en '
             'i-cord-stilk, og den sys fast over toppen. Til slutt plukkes '
             'øreklaffene opp rett over den grønne kanten, felles til en spiss, og båndet '
             'fortsetter '
             'rett ut av spissen som i-cord.',
             'The hat is worked in the round from the bottom up. It begins with the '
             'green scalloped edge, and the rest of the hat is pink: body and crown. The seeds are knitted into the body. When the '
             'hat is finished, the calyx is worked as a separate piece in green, six '
             'pointed sepals round an i-cord stalk, and sewn over the top. Finally the '
             'ear flaps are picked up just above the green edge, decreased to a point, and '
             'the tie '
             'continues straight out of the point as an i-cord.') + '</p>') +
        rosep(L(lang, 'DETTE LÆRER DU', 'WHAT YOU WILL LEARN')) +
        card(ul(L(lang,
                  ['å strikke buekant med grønn kant',
                   'å strø enkeltmasker i en annen farge uten lange trådsprang',
                   'å felle en rund topp i åtte felt',
                   'å strikke spisse blad som felles til én maske',
                   'å plukke opp øreklaffer og felle dem til en spiss',
                   'å strikke i-cord til både stilk og knytebånd'],
                  ['working a scalloped edge with a green finish',
                   'scattering single stitches in another colour without long floats',
                   'decreasing a round crown in eight sections',
                   'knitting pointed leaves decreased to a single stitch',
                   'picking up ear flaps and decreasing them to a point',
                   'knitting i-cord for both the stalk and the ties']))) +
        sagep(L(lang, 'VANSKELIGHETSGRAD', 'DIFFICULTY')) +
        cme(L(lang,
              'Lett. Luen er den raskeste delen i kolleksjonen og et fint sted å '
              'begynne. Den bruker de samme diagrammene som de andre plaggene, men '
              'over så få masker at en feil er rettet på minutter.',
              'Easy. The hat is the quickest piece in the collection and a good place '
              'to start. It uses the same charts as the other pieces, but over so few '
              'stitches that a mistake is put right in minutes.')), 2))

    # ------------------------------------------------------------ 3 STØRRELSER
    khead = [Sh] + L(lang, ['Passer til plaggstørrelse', 'Hodeomkrets'],
                     ['Fits garment size', 'Head circumference'])
    krow = []
    for v in LUER:
        h = v['hoder']
        hs = komma(h[0]) if len(h) == 1 else komma(h[0]) + ' til ' + komma(h[-1])
        if lang == 'en':
            hs = hs.replace(',', '.').replace(' til ', ' to ')
        krow.append([navn(v, lang), v['dekker'], hs + ' cm'])
    mhead = [Sh] + L(lang, ['Masker rundt', 'Omkrets', 'Høyde', 'Bladlengde'],
                     ['Stitches round', 'Circumference', 'Height', 'Leaf length'])
    mrow = [[navn(v, lang), str(v['masker']) + m, komma(v['omkrets_cm']) + ' cm',
             komma(v['hoyde_cm']) + ' cm', komma(v['blad_cm']) + ' cm'] for v in LUER]
    P.append(pg(f.side_storrelser_smaadel(
        lang,
        L(lang,
          'Luen er gradert i fem størrelser, ikke ni som plaggene. Frødiagrammet er 8 '
          'masker, altså 3,8 cm rundt, mens et barnehode vokser 1 til 3 cm mellom to '
          'nabostørrelser. Ni luer hadde derfor blitt de samme fem tallene med ni '
          'navn. Mål hodet der luen skal sitte, altså rundt pannen og over ørene, og '
          'velg etter det målet. Hver plaggstørrelse har nøyaktig én lue.',
          'The hat is graded in five sizes, not nine like the garments. The seed chart '
          'is 8 stitches, that is 3.8 cm round, while a child head grows 1 to 3 cm '
          'between two neighbouring sizes. Nine hats would therefore have been the '
          'same five numbers under nine names. Measure the head where the hat will '
          'sit, round the forehead and over the ears, and choose by that measurement. '
          'Each garment size has exactly one hat.'),
        khead, krow, mhead, mrow,
        [(navn(v, lang), L(lang, 'str ', 'size ') + v['dekker']) for v in LUER],
        L(lang,
          'Omkretsen er med vilje mindre enn hodet, så luen ligger inntil. Merk at '
          'denne luen ikke har ribb: buekanten strekker seg når luen tres på, men den '
          'trekker seg ikke sammen igjen slik en ribb gjør. Det er knytebåndene som '
          'holder luen på plass, ikke kanten. Legg derfor opp svært løst, og bruk alltid '
          'båndene på de minste.',
          'The circumference is deliberately smaller than the head, so the hat sits '
          'close. Note that this hat has no rib: the scalloped edge stretches as the hat '
          'goes on, but it does not draw back in the way a rib does. It is the ties that '
          'hold the hat in place, not the edge. So cast on very loosely, and always use '
          'the ties on the smallest sizes.')), 3))

    # ------------------------------------------------------------------ 4 GARN
    garn = [[navn(v, lang), '%d g' % (20 + 5 * i), '%d g' % (10 + 5 * i), '5 g']
            for i, v in enumerate(LUER)]
    ekstra = L(lang,
               [['Pinne 4 mm', 'kort rundpinne, settpinner eller Magic Loop'],
                ['Stoppenål', 'til å feste tråder og sy fast knytebåndene'],
                ['Maskemarkører', 'åtte, til å merke feltene i toppfellingen']],
               [['4 mm needles', 'short circular, double-pointed or Magic Loop'],
                ['Darning needle', 'for weaving in ends and sewing on the ties'],
                ['Stitch markers', 'eight, to mark the sections in the crown']])
    P.append(pg(f.side_garn(lang, garn, ekstra), 4))

    # --------------------------------------------------------------- 5 DIAGRAM
    P.append(pg(f.side_diagram(lang, smaa=True), 5))

    # ------------------------------------------------------------- 6 BUEKANTEN
    ribb_h = [Sh] + L(lang, ['Legg opp', 'Buer', 'Masker per bue', 'Grønne omganger',
                             'Buerunder', 'Kantens høyde'],
                      ['Cast on', 'Scallops', 'Sts per scallop', 'Green rounds',
                       'Scallop rounds', 'Height of the edge'])
    ribb_r = [[navn(v, lang), str(v['masker']) + m, str(v['lue_buer']) + ' x',
               v['bue_lue'], 3, 5, komma(v['kant_cm']) + ' cm'] for v in LUER]
    P.append(pg(
        banner(L(lang, '1 · BUEKANTEN NEDERST', '1 · THE SCALLOPED EDGE')) +
        card('<p>' + L(lang,
             'Luen begynner med den samme kanten som resten av kolleksjonen, men her '
             'kommer den først, siden luen strikkes nedenfra og opp. Legg opp svært løst '
             'med GRØNT, samle til en omgang uten å vri opplegget, og sett en markør i '
             'omgangens begynnelse. Strikk 3 omganger rett i grønt.',
             'The hat begins with the same edge as the rest of the collection, but here '
             'it comes first, since the hat is worked from the bottom up. Cast on very '
             'loosely in GREEN, join in the round without twisting the cast-on, and place '
             'a marker at the beginning of the round. Work 3 rounds in knit in green.') +
             '</p>') +
        card('<p>' + L(lang,
             'Bytt til rosa. Del omgangen i buer med en markør mellom hver bue. Hver bue '
             'er 8 masker. Strikk buerunden: *2 rett sammen vridd, 1 rett, 1 økning, 2 '
             'rett, 1 økning, 1 rett, 2 rett sammen*, og gjenta rundt. Masketallet står '
             'stille, men kanten former seg i runde buer. Gjenta buerunden i alt 5 '
             'ganger, og fortsett så rett opp.',
             'Change to pink. Divide the round into scallops with a marker between each. '
             'Every scallop is 8 stitches. Work the scallop round: *ssk, k1, M1R, k2, '
             'M1L, k1, k2tog*, and repeat round. The stitch count stays the same, but the '
             'edge shapes itself into rounded scallops. Repeat the scallop round 5 times '
             'in all, then continue straight up.') + '</p>' +
             tabell(ribb_h, ribb_r, min_index=0)) +
        cme(L(lang,
              'Buen er 8 masker på luen, ikke 6 som på genseren eller 10 som på '
              'skjørtene. Grunnen er at rapporten må gå opp i alle fem luestørrelsene, '
              'og 8 er det eneste tallet som gjør det. Det gir 7 til 11 buer rundt. '
              'Legg opp svært løst: opplegget er den ytterste kanten, og et stramt '
              'oppligg trekker buene rette.',
              'The scallop is 8 stitches on the hat, not 6 as on the jumper or 10 as on '
              'the skirts. The reason is that the repeat has to divide into all five hat '
              'sizes, and 8 is the only number that does. That gives 7 to 11 scallops '
              'round. Cast on very loosely: the cast-on is the outermost edge, and a '
              'tight cast-on pulls the scallops straight.')), 6))

    # -------------------------------------------------------- 7 ROSA DEL OG FRØ
    rosa_h = [Sh] + L(lang, ['Masker', 'Rosa del', 'Frørapporter rundt'],
                      ['Stitches', 'Pink section', 'Seed repeats round'])
    rosa_r = [[navn(v, lang), str(v['masker']) + m, komma(v['rosa_cm']) + ' cm',
               str(v['fro_rapporter']) + ' x'] for v in LUER]
    P.append(pg(
        banner(L(lang, '2 · DEN ROSA DELEN OG FRØENE', '2 · THE PINK SECTION AND SEEDS')) +
        '<p>' + L(lang,
        'Fortsett i rosa glattstrikk rundt, altså rett på alle omganger. På en '
        'frøomgang strikker du frøomgang A fra side 5, altså *3 rosa, 1 kremhvit, 4 '
        'rosa*, gjentatt rundt. Strikk 3 omganger rosa. Strikk deretter frøomgang B, '
        'altså *7 rosa, 1 kremhvit*, gjentatt rundt. De to omgangene forskyver frøene '
        'i forhold til hverandre, så de ser strødd ut og ikke oppstilt.',
        'Continue in pink stocking stitch in the round, that is knit on every round. '
        'On a seed round work seed round A from page 5, that is *3 pink, 1 cream, 4 '
        'pink*, repeated round. Work 3 rounds in pink. Then work seed round B, that is '
        '*7 pink, 1 cream*, repeated round. The two rounds offset the seeds against '
        'each other, so they look scattered rather than lined up.') + '</p>' +
        card(tabell(rosa_h, rosa_r, min_index=0)) +
        cme(L(lang,
              'Mål den rosa delen fra der buerundene slutter, ikke fra opplegget. '
              'Kanten teller for seg i høydetabellen.',
              'Measure the pink section from where the scallop rounds end, not from the '
              'cast-on. The edge counts separately in the height table.')), 7))

    # ----------------------------------------------------------- 9 TOPPFELLINGEN
    fell_h = [Sh] + L(lang, ['Start', 'Felleomganger', 'Igjen etter felling',
                             'Toppens høyde'],
                      ['Start', 'Decrease rounds', 'Left after decreasing',
                       'Height of the crown'])
    fell_r = [[navn(v, lang), str(v['masker']) + m, str(v['fell_omganger']) + ' x',
               '8' + m, komma(v['fell_cm']) + ' cm'] for v in LUER]
    P.append(pg(
        banner(L(lang, '3 · TOPPFELLINGEN', '3 · SHAPING THE CROWN')) +
        '<p>' + L(lang,
        'Alt dette gjøres i ROSA. Del omgangen i 8 like felt og sett en markør ved hvert. Masketallet i hver '
        'størrelse er delelig med 8, så feltene går opp uten justering. Strikk så '
        'slik: en felleomgang der du strikker 2 rett sammen rett før hver markør, '
        'altså 8 masker felt, og deretter 1 omgang rett. Gjenta til du har 8 masker '
        'igjen. Antall felleomganger står i kolonnen din. Klipp garnet, trekk tråden '
        'gjennom de 8 maskene, stram og fest på innsiden.',
        'All of this is worked in PINK. Divide the round into 8 equal sections and place a marker at each. The stitch '
        'count in every size is divisible by 8, so the sections come out even without '
        'adjustment. Then work as follows: a decrease round where you knit 2 together '
        'just before each marker, that is 8 stitches decreased, then 1 round in knit. '
        'Repeat until 8 stitches remain. The number of decrease rounds is in your '
        'column. Cut the yarn, draw it through the 8 stitches, tighten and fasten off '
        'on the inside.') + '</p>' +
        card(tabell(fell_h, fell_r, min_index=0)) +
        cme(L(lang,
              'Fell alltid på samme sted i forhold til markøren. Da danner fellingene '
              'åtte tydelige linjer opp mot toppen, og det er den linjen som gjør at '
              'en rund lue ser rund ut og ikke skjev.',
              'Always decrease in the same place relative to the marker. The decreases '
              'then form eight clear lines up towards the top, and it is that line '
              'that makes a round hat look round rather than lopsided.')), 8))

    # ------------------------------------------------------------- 9 KALYKSEN
    ka_h = [Sh] + L(lang, ['Stilk, masker', 'Stilk', 'Øk til', 'Blad', 'Masker per blad',
                           'Felleomganger', 'Bladlengde'],
                    ['Stalk stitches', 'Stalk', 'Increase to', 'Leaves', 'Sts per leaf',
                     'Decrease rows', 'Leaf length'])
    ka_r = [[navn(v, lang), '3' + m, str(v['stilk_cm']) + ' cm', str(v['kalyks_m']) + m,
             str(v['blad_antall']) + ' x', str(v['blad_base']) + m,
             str(v['blad_felleomg']) + ' x', komma(v['blad_cm']) + ' cm'] for v in LUER]
    P.append(pg(
        banner(L(lang, '4 · KALYKSEN MED BEGERBLADENE', '4 · THE CALYX AND ITS SEPALS')) +
        '<p>' + L(lang,
        'Kalyksen er en egen del i grønt, og den strikkes ovenfra og ned: først stilken, '
        'så bladene. Til slutt sys den fast over toppen av luen.',
        'The calyx is a separate piece in green, worked from the top down: first the '
        'stalk, then the sepals. It is sewn over the top of the hat at the end.') +
        '</p>' +
        card(ul(L(lang,
        ['Legg opp 3 masker med grønt og strikk i-cord til stilken måler lengden i '
         'kolonnen din.',
         'Øk jevnt fordelt på neste omgang til masketallet i kolonnen din, og fordel '
         'maskene på 6 like felt. Hvert felt er ett begerblad.',
         'Strikk hvert blad for seg, frem og tilbake i glattstrikk: strikk 3 rader rett '
         'fram, og fell så 1 maske i hver side på hver 4. rad, til det står 1 maske '
         'igjen. Trekk tråden gjennom og fest.',
         'Gjenta til alle 6 bladene er ferdige.'],
        ['Cast on 3 stitches in green and work an i-cord until the stalk measures the '
         'length in your column.',
         'Increase evenly on the next round to the stitch count in your column, and '
         'divide the stitches into 6 equal sections. Each section is one sepal.',
         'Work each sepal separately, back and forth in stocking stitch: work 3 rows '
         'straight, then decrease 1 stitch at each side on every 4th row until 1 stitch '
         'remains. Draw the yarn through and fasten off.',
         'Repeat until all 6 sepals are done.']))) +
        card(tabell(ka_h, ka_r, min_index=0)) +
        cme(L(lang,
              'Sy kalyksen fast med små sting langs bladenes fot, ikke langs spissene. '
              'Da får bladene ligge løst utover det rosa, slik de gjør på et jordbær, i '
              'stedet for å bli sydd flatt ned.',
              'Sew the calyx down with small stitches along the base of the sepals, not '
              'along the points. That lets the sepals lie loosely out over the pink, the '
              'way they do on a strawberry, instead of being sewn down flat.')), 9))

    # -------------------------------------------------- 10 ØREKLAFFER OG BÅND
    kl_h = [Sh] + L(lang, ['Plukk opp per klaff', 'Rette rader', 'Felleomganger',
                           'Klaffens høyde', 'Bånd'],
                    ['Pick up per flap', 'Straight rows', 'Decrease rows',
                     'Height of the flap', 'Tie'])
    kl_r = [[navn(v, lang), str(v['klaff_m']) + m, '4', str(v['klaff_felleomg']) + ' x',
             komma(v['klaff_cm']) + ' cm', str(v['band_cm']) + ' cm'] for v in LUER]
    P.append(pg(
        banner(L(lang, '5 · ØREKLAFFENE OG BÅNDENE', '5 · THE EAR FLAPS AND THE TIES')) +
        '<p>' + L(lang,
        'Klaffene plukkes opp på innsiden av luen, rett OVER den grønne kanten, én på '
        'hver side. Finn midt foran og midt bak, og plasser klaffene midt mellom dem, '
        'altså rett under der øret sitter. Plukk opp med rosa det antallet masker '
        'kolonnen din sier. Plukk opp over kanten, ikke i den, så buene får henge fritt.',
        'The flaps are picked up on the inside of the hat, just ABOVE the green edge, one '
        'on each side. Find centre front and centre back, and place the flaps midway '
        'between them, that is right under where the ear sits. Pick up in pink the number '
        'of stitches your column says. Pick up above the edge, not into it, so the '
        'scallops hang free.') + '</p>' +
        card(ul(L(lang,
        ['Strikk 4 rader glattstrikk frem og tilbake.',
         'Fell så 1 maske i hver side annenhver rad, til det står 3 masker igjen.',
         'Strikk i-cord på de 3 maskene til båndet måler lengden i kolonnen din, og '
         'fell av. Båndet vokser altså rett ut av klaffens spiss, det sys ikke på.',
         'Strikk den andre klaffen helt likt.'],
        ['Work 4 rows in stocking stitch back and forth.',
         'Then decrease 1 stitch at each side every other row, until 3 stitches remain.',
         'Work an i-cord on those 3 stitches until the tie measures the length in your '
         'column, and cast off. The tie therefore grows straight out of the point of the '
         'flap, it is not sewn on.',
         'Work the second flap exactly the same.']))) +
        card(tabell(kl_h, kl_r, min_index=0)) +
        cme(L(lang,
              'Båndene knytes i en sløyfe under haken, aldri i en knute. Tell radene i '
              'stedet for å måle på den andre klaffen, så blir de to like lange.',
              'The ties are tied in a bow under the chin, never in a knot. Count the rows '
              'rather than measuring on the second flap, so the two come out the same '
              'length.')), 10))

    # ------------------------------------------------------------ 11 TESTSTRIKK
    P.append(pg(f.side_teststrikk(lang, 'luen', 'the hat'), 11))

    # ------------------------------------------------------------- 12 MONTERING
    P.append(pg(f.side_montering(
        lang,
        'Knytebånd skal alltid knytes i en sløyfe som løsner om barnet drar i den, '
        'og luen skal tas av når barnet sover.',
        'Ties must always be tied in a bow that comes undone if the child pulls at '
        'it, and the hat should be taken off when the child sleeps.'), 12))

    # ------------------------------------------------------------ 13 AVSLUTNING
    P.append(pg(f.side_avslutning(lang), 13))
    return P


f.skriv('lue',
        {'no': 'Jordbærdrøm lue, LME strikkeoppskrift',
         'en': 'Strawberry Dream hat, LME knitting pattern'},
        sider, 'lue')
