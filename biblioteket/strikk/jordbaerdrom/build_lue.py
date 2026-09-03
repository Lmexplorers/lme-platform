# -*- coding: utf-8 -*-
"""
Jordbærdrøm lue, gradert i fem størrelser (dekker plaggstørrelse 44 til 92).

Rund lue strikket nedenfra og opp: brettet ribb, rosa glattstrikk med frø,
en krans av små jordbærhetter, grønn topp og en i-cord-stilk. Knytebånd i
i-cord under haken.

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
          'Rund lue med brettet ribb, frø i kremhvit, en krans av små jordbærhetter '
          'og en grønn topp med stilk. Knytebånd i i-cord under haken. Fem '
          'størrelser, som dekker plaggstørrelse 44 til 92.',
          'A round hat with a folded rib brim, cream seeds, a ring of small strawberry '
          'tops and a green crown with a stalk. I-cord ties under the chin. Five '
          'sizes, covering garment sizes 44 to 92.'),
        bar=bar(lang)), 1))

    # ------------------------------------------------------- 2 FØR DU BEGYNNER
    P.append(pg(
        banner(L(lang, 'FØR DU BEGYNNER', 'BEFORE YOU START')) +
        card('<p>' + L(lang,
             'Luen strikkes rundt nedenfra og opp. Du begynner med en høy ribb som '
             'brettes dobbel, så den ligger varmt over ørene. Videre går den i rosa '
             'glattstrikk med noen få frø, og øverst kommer en krans av små '
             'jordbærhetter i grønt. Toppen felles i åtte felt og avsluttes med en '
             'kort i-cord som blir stilken.',
             'The hat is worked in the round from the bottom up. You start with a deep '
             'rib that folds double, so it sits warmly over the ears. It then continues '
             'in pink stocking stitch with a few seeds, and at the top comes a ring of '
             'small strawberry tops in green. The crown is decreased in eight sections '
             'and finished with a short i-cord that becomes the stalk.') + '</p>') +
        rosep(L(lang, 'DETTE LÆRER DU', 'WHAT YOU WILL LEARN')) +
        card(ul(L(lang,
                  ['å strikke rundt med brettet dobbel ribb',
                   'å strø enkeltmasker i en annen farge uten lange trådsprang',
                   'å strikke en krans av små jordbærhetter i to farger',
                   'å felle en rund topp i åtte felt',
                   'å strikke i-cord til både stilk og knytebånd'],
                  ['working in the round with a folded double rib',
                   'scattering single stitches in another colour without long floats',
                   'working a ring of small strawberry tops in two colours',
                   'decreasing a round crown in eight sections',
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
    mhead = [Sh] + L(lang, ['Masker rundt', 'Omkrets', 'Høyde', 'Spisser rundt'],
                     ['Stitches round', 'Circumference', 'Height', 'Points round'])
    mrow = [[navn(v, lang), str(v['masker']) + m, komma(v['omkrets_cm']) + ' cm',
             komma(v['hoyde_cm']) + ' cm', str(v['spisser']) + ' x'] for v in LUER]
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
          'Omkretsen er med vilje mindre enn hodet. Ribben strekker seg når luen tres '
          'på og trekker seg sammen igjen etterpå, og det er det som holder luen på '
          'plass. En lue som måler like mye som hodet, sklir av.',
          'The circumference is deliberately smaller than the head. The rib stretches '
          'as the hat goes on and draws back in afterwards, and that is what holds it '
          'in place. A hat that measures the same as the head slides off.')), 3))

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
    P.append(pg(f.side_diagram(lang, smaa=True, snudd=True), 5))

    # ------------------------------------------------------------------ 6 RIBB
    ribb_h = [Sh] + L(lang, ['Legg opp', 'Ribb', 'Brettet ribb blir'],
                      ['Cast on', 'Rib', 'Folded brim becomes'])
    ribb_r = [[navn(v, lang), str(v['masker']) + m, str(v['ribb_cm']) + ' cm',
               komma(round(v['ribb_cm'] / 2, 1)) + ' cm'] for v in LUER]
    P.append(pg(
        banner(L(lang, '1 · RIBBEN', '1 · THE RIB')) +
        card('<p>' + L(lang,
             'Legg opp med rosa, samle til en omgang uten å vri opplegget, og sett en '
             'markør i omgangens begynnelse. Strikk vridd ribb, altså *1 rett i bakre '
             'maskebue, 1 vrang*, til ribben måler høyden i kolonnen din. Vridd ribb '
             'er strammere enn vanlig ribb og holder luen bedre på plass.',
             'Cast on in pink, join in the round without twisting the cast-on, and '
             'place a marker at the beginning of the round. Work twisted rib, that is '
             '*k1 through the back loop, p1*, until the rib measures the height in '
             'your column. Twisted rib is firmer than plain rib and holds the hat '
             'better in place.') + '</p>') +
        card(tabell(ribb_h, ribb_r, min_index=0)) +
        sagep(L(lang, 'SLIK BRETTES DEN', 'HOW IT FOLDS')) +
        cme(L(lang,
              'Ribben brettes opp dobbelt når luen er ferdig, derfor er den så høy. '
              'Den brettede kanten er den som ligger mot pannen, og den blir halvparten '
              'så høy som tallet du strikket. Ikke sy den fast: en løs brett kan '
              'rettes ut når barnet vokser, og gir luen noen ukers ekstra levetid.',
              'The rib folds up double when the hat is finished, which is why it is '
              'this deep. The folded edge is the one that sits against the forehead, '
              'and it ends up half the height you knitted. Do not sew it down: a loose '
              'fold can be let out as the child grows, and gives the hat a few extra '
              'weeks of wear.')), 6))

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
              'Mål den rosa delen fra brettekanten, ikke fra opplegget. Det er den '
              'brettede kanten som er luens nedre kant når den er på.',
              'Measure the pink section from the fold line, not from the cast-on. The '
              'folded edge is the lower edge of the hat as it is worn.')), 7))

    # ---------------------------------------------------------------- 8 KRANSEN
    krans_h = [Sh] + L(lang, ['Masker', 'Spisser rundt', 'Kransens høyde'],
                       ['Stitches', 'Points round', 'Height of the ring'])
    krans_r = [[navn(v, lang), str(v['masker']) + m, str(v['spisser']) + ' x',
                komma(v['krans_cm']) + ' cm'] for v in LUER]
    P.append(pg(
        banner(L(lang, '3 · KRANSEN MED JORDBÆRHETTER', '3 · THE RING OF STRAWBERRY TOPS')) +
        card('<p>' + L(lang,
             'Strikk jordbærhetten fra side 5 over 4 masker og gjenta den rundt så '
             'mange ganger som kolonnen din sier. På luen er hetten snudd, fordi det '
             'grønne ligger over det rosa her og ikke under. Omgang 1 er derfor den '
             'siste helt rosa omgangen, spissene vokser opp av det rosa på omgang 2 og '
             '3, og omgang 4 er helt grønn. Diagrammet på side 5 er allerede snudd '
             'riktig vei, så du strikker det som det står. Fortsett i grønt alene '
             'etterpå.',
             'Work the strawberry top from page 5 over 4 stitches and repeat it round '
             'as many times as your column says. On the hat the top is turned upside '
             'down, because the green sits above the pink here and not below. Round 1 '
             'is therefore the last fully pink round, the points grow up out of the '
             'pink on rounds 2 and 3, and round 4 is all green. The chart on page 5 is '
             'already turned the right way, so you work it exactly as it stands. '
             'Continue in green alone afterwards.') + '</p>') +
        card(tabell(krans_h, krans_r, min_index=0)) +
        cme(L(lang,
              'Hold den grønne tråden løs bak arbeidet. Trekker du den til, snurper '
              'kransen seg sammen, og luen blir smalere akkurat der den skal være '
              'videst.',
              'Keep the green yarn loose behind the work. Pulled tight, the ring draws '
              'in, and the hat becomes narrower exactly where it should be widest.')), 8))

    # ----------------------------------------------------------- 9 TOPPFELLINGEN
    fell_h = [Sh] + L(lang, ['Start', 'Felleomganger', 'Igjen etter felling',
                             'Toppens høyde'],
                      ['Start', 'Decrease rounds', 'Left after decreasing',
                       'Height of the crown'])
    fell_r = [[navn(v, lang), str(v['masker']) + m, str(v['fell_omganger']) + ' x',
               '8' + m, komma(v['fell_cm']) + ' cm'] for v in LUER]
    P.append(pg(
        banner(L(lang, '4 · TOPPFELLINGEN', '4 · SHAPING THE CROWN')) +
        '<p>' + L(lang,
        'Del omgangen i 8 like felt og sett en markør ved hvert. Masketallet i hver '
        'størrelse er delelig med 8, så feltene går opp uten justering. Strikk så '
        'slik: en felleomgang der du strikker 2 rett sammen rett før hver markør, '
        'altså 8 masker felt, og deretter 1 omgang rett. Gjenta til du har 8 masker '
        'igjen. Antall felleomganger står i kolonnen din.',
        'Divide the round into 8 equal sections and place a marker at each. The stitch '
        'count in every size is divisible by 8, so the sections come out even without '
        'adjustment. Then work as follows: a decrease round where you knit 2 together '
        'just before each marker, that is 8 stitches decreased, then 1 round in knit. '
        'Repeat until 8 stitches remain. The number of decrease rounds is in your '
        'column.') + '</p>' +
        card(tabell(fell_h, fell_r, min_index=0)) +
        cme(L(lang,
              'Fell alltid på samme sted i forhold til markøren. Da danner fellingene '
              'åtte tydelige linjer opp mot toppen, og det er den linjen som gjør at '
              'en rund lue ser rund ut og ikke skjev.',
              'Always decrease in the same place relative to the marker. The decreases '
              'then form eight clear lines up towards the top, and it is that line '
              'that makes a round hat look round rather than lopsided.')), 9))

    # ------------------------------------------------------- 10 STILK OG BÅND
    icord_h = [Sh] + L(lang, ['Stilk', 'Knytebånd, hvert'], ['Stalk', 'Ties, each'])
    icord_r = [[navn(v, lang), str(v['stilk_cm']) + ' cm', str(v['band_cm']) + ' cm']
               for v in LUER]
    P.append(pg(
        banner(L(lang, '5 · STILKEN OG KNYTEBÅNDENE', '5 · THE STALK AND THE TIES')) +
        rosep(L(lang, 'STILKEN', 'THE STALK')) +
        card('<p>' + L(lang,
             'Du har 8 masker igjen i grønt. Fell til 3 masker på neste omgang og '
             'strikk i-cord på disse til stilken måler lengden i kolonnen din. Klipp '
             'garnet, trekk tråden gjennom de 3 maskene og fest den ned gjennom '
             'stilken, så den står rett opp.',
             'You have 8 stitches left in green. Decrease to 3 stitches on the next '
             'round and work an i-cord on these until the stalk measures the length in '
             'your column. Cut the yarn, draw it through the 3 stitches and fasten it '
             'down through the stalk, so that it stands upright.') + '</p>') +
        sagep(L(lang, 'KNYTEBÅNDENE', 'THE TIES')) +
        card('<p>' + L(lang,
             'Legg opp 3 masker med rosa og strikk i-cord til båndet måler lengden i '
             'kolonnen din. Fell av. Strikk et bånd til. Sy ett bånd godt fast på '
             'innsiden av ribben ved hvert øre, med flere små sting. Båndene knytes i '
             'en sløyfe under haken, aldri i en knute.',
             'Cast on 3 stitches in pink and work an i-cord until the tie measures the '
             'length in your column. Cast off. Work a second tie. Sew one tie firmly '
             'to the inside of the rib at each ear, with several small stitches. The '
             'ties are tied in a bow under the chin, never in a knot.') + '</p>' +
             tabell(icord_h, icord_r, min_index=0)) +
        cme(L(lang,
              'Vil du heller ha luen uten bånd, hopper du over dem. Luen sitter på av '
              'ribben alene, og båndene er der for de minste, som ennå ikke drar luen '
              'av seg selv.',
              'If you would rather have the hat without ties, leave them out. The hat '
              'stays on by the rib alone, and the ties are there for the smallest, who '
              'cannot yet pull the hat off themselves.')), 10))

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
