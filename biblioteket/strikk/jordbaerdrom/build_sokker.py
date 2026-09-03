# -*- coding: utf-8 -*-
"""
Jordbærdrøm sokker, gradert i fire størrelser (dekker plaggstørrelse 44 til 92).

Ekte sokker strikket ovenfra og ned: grønn vridd ribb, en krans av små
jordbærhetter, rosa legg med frø, hællapp i slippemasker, rund hælvending,
kile, fot og båttå som maskes sammen.

Sokkene har fire størrelser, ikke ni som plaggene, og de er gradert etter
nøyaktig de samme fotlengdene som tøflene. Det kontrolleres med en assert, så
et barn ikke ender med én størrelse på foten og en annen i tøffelen utenpå.

Sokkene bryter med 8-maskers-regelen som gjelder resten av kolleksjonen. Se
grading_jordbaerdrom.py: en sokk skal sitte tett, og med bare multipler av 8
hopper omkretsen fra 11,4 til 15,2 cm. Sokkene er derfor delelig med 4, og
frøene har en egen rapport per størrelse som går opp i akkurat det
masketallet.
"""
import _jordbaer_felles as f
from _jordbaer_felles import (SOKKER, banner, rosep, sagep, card, cme, ul,
                              tabell, side, L)

PH2_NO = 'LME STRIKKEOPPSKRIFT   |   SOKKER'
PH2_EN = 'LME KNITTING PATTERN   |   SOCKS'


def komma(x):
    return str(x).replace('.', ',')


def navn(v, lang):
    return v['navn_no'] if lang == 'no' else v['navn_en']


def bar(lang):
    return f.storrelsesbar_liste(
        [(navn(v, lang), L(lang, 'str ', 'size ') + v['dekker']) for v in SOKKER])


def sider(lang):
    def pg(body, num):
        return side(body, num, lang, PH2_NO, PH2_EN)
    Sh = L(lang, 'Størrelse', 'Size')
    m = L(lang, ' m', ' sts')
    P = []

    # --------------------------------------------------------------- 1 FORSIDE
    P.append(pg(f.forside(
        lang,
        L(lang, 'JORDBÆRDRØM SOKKER', 'STRAWBERRY DREAM SOCKS'),
        L(lang, 'STØRRELSE 44 TIL 92', 'SIZES 44 TO 92'),
        L(lang,
          'Sokker strikket ovenfra og ned, med grønn vridd ribb, en krans av små '
          'jordbærhetter, frø i kremhvit, ekte hællapp med hælvending og en båttå som '
          'maskes sammen. Fire størrelser, som dekker plaggstørrelse 44 til 92.',
          'Socks worked from the top down, with a green twisted rib, a ring of small '
          'strawberry tops, cream seeds, a proper heel flap with a turned heel and a '
          'wedge toe that is grafted. Four sizes, covering garment sizes 44 to 92.'),
        bar=bar(lang), bilde='sokker.jpg'), 1))

    # ------------------------------------------------------- 2 FØR DU BEGYNNER
    P.append(pg(
        banner(L(lang, 'FØR DU BEGYNNER', 'BEFORE YOU START')) +
        card('<p>' + L(lang,
             'Dette er ekte sokker, ikke tøfler. De strikkes rundt ovenfra og ned: '
             'først den grønne ribben, så kransen med jordbærhetter, så det rosa '
             'legget med frø. Deretter deles arbeidet, og du strikker hællappen frem '
             'og tilbake over halve masketallet. Hælen vendes med korte rader, du '
             'plukker opp masker langs lappen, feller kilen tilbake til det opprinnelige '
             'masketallet, strikker foten og avslutter med en båttå som maskes sammen.',
             'These are proper socks, not booties. They are worked in the round from the '
             'top down: first the green rib, then the ring of strawberry tops, then the '
             'pink leg with seeds. The work is then divided, and you knit the heel flap '
             'back and forth over half the stitches. The heel is turned with short rows, '
             'you pick up stitches along the flap, decrease the gusset back to the '
             'original stitch count, knit the foot and finish with a wedge toe that is '
             'grafted.') + '</p>') +
        rosep(L(lang, 'DETTE LÆRER DU', 'WHAT YOU WILL LEARN')) +
        card(ul(L(lang,
                  ['å strikke en hællapp i slippemasker, som tåler slitasje',
                   'å vende en rund hæl med korte rader',
                   'å plukke opp kantmasker og felle en kile',
                   'å felle en båttå og maske den sammen usynlig'],
                  ['knitting a slip stitch heel flap that stands up to wear',
                   'turning a round heel with short rows',
                   'picking up edge stitches and decreasing a gusset',
                   'shaping a wedge toe and grafting it invisibly']))) +
        sagep(L(lang, 'VANSKELIGHETSGRAD', 'DIFFICULTY')) +
        cme(L(lang,
              'Litt øvet. Hælvendingen er det eneste virkelig nye her, og den er skrevet '
              'ut rad for rad med tall for din størrelse. Har du aldri strikket sokk '
              'før, strikk den minste størrelsen først: den er ferdig på en kveld, og da '
              'har du hele fremgangsmåten i hendene.',
              'Slightly experienced. The heel turn is the only genuinely new thing here, '
              'and it is written out row by row with the numbers for your size. If you '
              'have never knitted a sock before, work the smallest size first: it is '
              'finished in an evening, and then you have the whole method in your '
              'hands.')), 2))

    # ------------------------------------------------------------ 3 STØRRELSER
    khead = [Sh] + L(lang, ['Passer til plaggstørrelse', 'Fotlengde'],
                     ['Fits garment size', 'Foot length'])
    krow = [[navn(v, lang), v['dekker'], komma(v['fot_cm']) + ' cm'] for v in SOKKER]
    mhead = [Sh] + L(lang, ['Masker rundt', 'Omkrets', 'Ribb', 'Legg i rosa'],
                     ['Stitches round', 'Circumference', 'Rib', 'Leg in pink'])
    mrow = [[navn(v, lang), str(v['masker']) + m, komma(v['omkrets_cm']) + ' cm',
             komma(v['ribb_cm']) + ' cm', komma(v['legg_cm']) + ' cm'] for v in SOKKER]
    P.append(pg(f.side_storrelser_smaadel(
        lang,
        L(lang,
          'Sokkene er gradert etter fotlengde, ikke etter alder, og etter nøyaktig de '
          'samme fotlengdene som tøflene. Da passer sokk og tøffel til hverandre. Mål '
          'foten fra hælen til lengste tå, og velg den størrelsen som er nærmest over '
          'målet. Er foten midt mellom to størrelser, velg den minste: en sokk skal '
          'sitte tett, og en for stor sokk skrukker seg under foten.',
          'The socks are graded by foot length, not by age, and by exactly the same foot '
          'lengths as the booties. That way sock and bootie match each other. Measure '
          'the foot from heel to longest toe, and choose the size just above that '
          'measurement. If the foot falls between two sizes, choose the smaller one: a '
          'sock should sit close, and a sock that is too big wrinkles under the foot.'),
        khead, krow, mhead, mrow,
        [(navn(v, lang), L(lang, 'str ', 'size ') + v['dekker']) for v in SOKKER],
        L(lang,
          'Omkretsen er mindre enn foten, og det skal den være. En sokk holdes oppe av '
          'at den strekker seg litt. Måler sokken like mye som foten, sklir den ned i '
          'skoen og samler seg under tærne.',
          'The circumference is smaller than the foot, and it should be. A sock stays up '
          'because it stretches a little. If the sock measures the same as the foot, it '
          'slides down inside the shoe and gathers under the toes.')), 3))

    # ------------------------------------------------------------------ 4 GARN
    garn = [[navn(v, lang), '%d g' % (15 + 5 * i), '%d g' % (10 + 5 * i), '5 g']
            for i, v in enumerate(SOKKER)]
    ekstra = L(lang,
               [['Pinne 4 mm', 'settpinner eller Magic Loop, omgangene er små'],
                ['Stoppenål', 'til å maske tåen sammen og feste tråder'],
                ['Maskemarkør', 'til å merke omgangens begynnelse'],
                ['Hjelpepinne', 'til å holde vristmaskene mens hælen strikkes']],
               [['4 mm needles', 'double-pointed or Magic Loop, the rounds are small'],
                ['Darning needle', 'for grafting the toe and weaving in ends'],
                ['Stitch marker', 'to mark the beginning of the round'],
                ['Spare needle', 'to hold the instep stitches while the heel is worked']])
    P.append(pg(f.side_garn(lang, garn, ekstra), 4))

    # --------------------------------------------------------------- 5 DIAGRAM
    P.append(pg(f.side_diagram(lang, smaa=True), 5))

    # -------------------------------------------------------- 6 RIBB OG KRANS
    ribb_h = [Sh] + L(lang, ['Legg opp', 'Ribb', 'Spisser rundt', 'Kransens høyde'],
                      ['Cast on', 'Rib', 'Points round', 'Height of the ring'])
    ribb_r = [[navn(v, lang), str(v['masker']) + m, komma(v['ribb_cm']) + ' cm',
               str(v['spisser']) + ' x', komma(v['krans_cm']) + ' cm'] for v in SOKKER]
    P.append(pg(
        banner(L(lang, '1 · RIBBEN OG KRANSEN', '1 · THE RIB AND THE RING')) +
        card('<p>' + L(lang,
             'Legg opp med grønt, samle til en omgang uten å vri opplegget, og sett en '
             'markør i omgangens begynnelse. Strikk vridd ribb, altså *1 rett i bakre '
             'maskebue, 1 vrang*, til ribben måler høyden i kolonnen din.',
             'Cast on in green, join in the round without twisting the cast-on, and '
             'place a marker at the beginning of the round. Work twisted rib, that is '
             '*k1 through the back loop, p1*, until the rib measures the height in your '
             'column.') + '</p>') +
        card(tabell(ribb_h, ribb_r, min_index=0)) +
        rosep(L(lang, 'KRANSEN MED JORDBÆRHETTER', 'THE RING OF STRAWBERRY TOPS')) +
        card('<p>' + L(lang,
             'Strikk jordbærhetten fra side 5 over 4 masker og gjenta den rundt så '
             'mange ganger som kolonnen din sier. Sokken strikkes ovenfra og ned, så '
             'spissene peker nedover mot foten, akkurat som begerbladene på et jordbær. '
             'Bytt til rosa etter siste mønsteromgang.',
             'Work the strawberry top from page 5 over 4 stitches and repeat it round as '
             'many times as your column says. The sock is worked from the top down, so '
             'the points face downwards towards the foot, just like the calyx on a '
             'strawberry. Change to pink after the last chart round.') + '</p>'), 6))

    # ------------------------------------------------------------ 7 LEGG OG FRØ
    fro_h = [Sh] + L(lang, ['Masker', 'Legg i rosa', 'Frørapport', 'Frø per omgang'],
                     ['Stitches', 'Leg in pink', 'Seed repeat', 'Seeds per round'])
    fro_r = [[navn(v, lang), str(v['masker']) + m, komma(v['legg_cm']) + ' cm',
              str(v['fro_rapport']) + m, str(v['fro_antall']) + ' x'] for v in SOKKER]
    P.append(pg(
        banner(L(lang, '2 · LEGGET OG FRØENE', '2 · THE LEG AND THE SEEDS')) +
        '<p>' + L(lang,
        'Strikk rosa glattstrikk rundt til legget måler høyden i kolonnen din, målt fra '
        'kransen. Underveis strikker du to frøomganger. På en frøomgang strikker du '
        '*1 kremhvit, resten rosa*, der rapporten er masketallet i kolonnen din. Strikk '
        '4 omganger rosa, og strikk så den andre frøomgangen forskjøvet med halve '
        'rapporten, så frøene ikke står i loddrette rekker.',
        'Work in pink stocking stitch in the round until the leg measures the height in '
        'your column, measured from the ring. Along the way you work two seed rounds. On '
        'a seed round you work *1 cream, the rest pink*, where the repeat is the stitch '
        'count in your column. Work 4 rounds in pink, then work the second seed round '
        'offset by half the repeat, so the seeds do not sit in vertical columns.') +
        '</p>' + card(tabell(fro_h, fro_r, min_index=0)) +
        cme(L(lang,
              'Sokkene har sin egen frørapport, og den er ikke 8 masker som ellers i '
              'kolleksjonen. En sokk skal sitte tett, og med bare multipler av 8 hopper '
              'omkretsen fra 11,4 til 15,2 cm. Rapporten i kolonnen din går opp i akkurat '
              'ditt masketall, så du slipper å regne.',
              'The socks have their own seed repeat, and it is not 8 stitches as '
              'elsewhere in the collection. A sock must sit close, and with only '
              'multiples of 8 the circumference jumps from 11.4 to 15.2 cm. The repeat in '
              'your column divides exactly into your stitch count, so you do not have to '
              'calculate.')), 7))

    # -------------------------------------------------------------- 8 HÆLLAPPEN
    hl_h = [Sh] + L(lang, ['Hælmasker', 'Vristmasker', 'Rader i lappen', 'Kantmasker per side'],
                    ['Heel stitches', 'Instep stitches', 'Rows in the flap', 'Edge stitches each side'])
    hl_r = [[navn(v, lang), str(v['hael_m']) + m, str(v['vrist_m']) + m,
             str(v['hael_rader']) + ' x', str(v['plukk']) + m] for v in SOKKER]
    P.append(pg(
        banner(L(lang, '3 · HÆLLAPPEN', '3 · THE HEEL FLAP')) +
        '<p>' + L(lang,
        'Del arbeidet: sett halvparten av maskene på en hjelpepinne, det er vristen, og '
        'strikk videre frem og tilbake over den andre halvparten, det er hælen. '
        'Hællappen strikkes slik: rettsiden er *1 maske løs av med tråden bak, 1 rett*, '
        'gjentatt ut raden. Vrangsiden er 1 maske løs av med tråden foran, og resten '
        'vrangt. Gjenta de to radene til du har strikket like mange rader som kolonnen '
        'din sier. Avslutt med en vrangside.',
        'Divide the work: put half the stitches on a spare needle, that is the instep, '
        'and continue back and forth over the other half, that is the heel. The heel '
        'flap is worked like this: the right side is *slip 1 with the yarn behind, k1*, '
        'repeated to the end of the row. The wrong side is slip 1 with the yarn in '
        'front, then purl to the end. Repeat these two rows until you have worked as '
        'many rows as your column says. End with a wrong side row.') + '</p>' +
        card(tabell(hl_h, hl_r, min_index=0)) +
        cme(L(lang,
              'Slippemaskene gjør lappen dobbelt så tett som glattstrikk. Det er der '
              'sokken slites først, og det er hele grunnen til at en hællapp er verdt de '
              'ekstra radene. Den løse masken i hver radbegynnelse lager samtidig en '
              'kjede langs sidene, og det er den du plukker opp masker fra etterpå.',
              'The slipped stitches make the flap twice as dense as stocking stitch. That '
              'is where a sock wears through first, and it is the whole reason a heel '
              'flap is worth the extra rows. The slipped stitch at the start of each row '
              'also creates a chain along the sides, and that is what you pick the '
              'stitches up from afterwards.')), 8))

    # ----------------------------------------------------------- 9 HÆLVENDINGEN
    hv_h = [Sh] + L(lang, ['Hælmasker', 'Rad 1: rett etter løs maske', 'Rad 2: vrang etter løs maske',
                           'Vendinger', 'Igjen etter vending'],
                    ['Heel stitches', 'Row 1: knit after slipped st', 'Row 2: purl after slipped st',
                     'Turns', 'Left after turning'])
    hv_r = [[navn(v, lang), str(v['hael_m']) + m, str(v['vend_a']) + m, str(v['vend_b']) + m,
             str(v['vend_rader']) + ' x', str(v['hael_igjen']) + m] for v in SOKKER]
    P.append(pg(
        banner(L(lang, '4 · HÆLVENDINGEN', '4 · TURNING THE HEEL')) +
        '<p>' + L(lang,
        'Hælen vendes med korte rader. Les tallene i kolonnen din inn i radene under.',
        'The heel is turned with short rows. Read the numbers in your column into the '
        'rows below.') + '</p>' +
        card(ul(L(lang,
                  ['Rad 1, rettsiden: 1 maske løs av, strikk rett det antallet kolonnen '
                   'sier, 2 rett sammen vridd, 1 rett, snu arbeidet.',
                   'Rad 2, vrangsiden: 1 maske løs av, strikk vrangt det antallet '
                   'kolonnen sier, 2 vrang sammen, 1 vrang, snu arbeidet.',
                   'Rad 3: 1 maske løs av, rett til 1 maske før hullet, 2 rett sammen '
                   'vridd over hullet, 1 rett, snu.',
                   'Rad 4: 1 maske løs av, vrangt til 1 maske før hullet, 2 vrang '
                   'sammen over hullet, 1 vrang, snu.',
                   'Gjenta rad 3 og 4 til alle maskene er tatt inn. På de siste to '
                   'radene finnes det ikke alltid en maske igjen til den siste rette '
                   'eller vrange, og da snur du rett etter fellingen.'],
                  ['Row 1, right side: slip 1, knit the number your column gives, ssk, '
                   'k1, turn the work.',
                   'Row 2, wrong side: slip 1, purl the number your column gives, '
                   'p2tog, p1, turn the work.',
                   'Row 3: slip 1, knit to 1 stitch before the gap, ssk across the gap, '
                   'k1, turn.',
                   'Row 4: slip 1, purl to 1 stitch before the gap, p2tog across the '
                   'gap, p1, turn.',
                   'Repeat rows 3 and 4 until all the stitches have been taken in. On '
                   'the last two rows there is not always a stitch left for the final '
                   'knit or purl, and then you simply turn right after the '
                   'decrease.']))) +
        card(tabell(hv_h, hv_r, min_index=0)), 9))

    # --------------------------------------------------------------- 10 KILEN
    ki_h = [Sh] + L(lang, ['Etter hælen', 'Plukk opp per side', 'Masker i alt',
                           'Felleomganger', 'Tilbake til'],
                    ['After the heel', 'Pick up each side', 'Stitches in all',
                     'Decrease rounds', 'Back to'])
    ki_r = [[navn(v, lang), str(v['hael_igjen']) + m, str(v['plukk']) + m,
             str(v['etter_plukk']) + m, str(v['kile_omganger']) + ' x',
             str(v['masker']) + m] for v in SOKKER]
    P.append(pg(
        banner(L(lang, '5 · KILEN', '5 · THE GUSSET')) +
        '<p>' + L(lang,
        'Nå samler du arbeidet til en omgang igjen. Strikk over hælmaskene, plukk opp '
        'og strikk det antallet kantmasker kolonnen sier langs den ene siden av '
        'hællappen, strikk vristmaskene fra hjelpepinnen, og plukk opp like mange '
        'kantmasker langs den andre siden. Du har nå det høye masketallet i kolonnen '
        'din. Fell så slik: på hver felleomgang strikker du 2 rett sammen vridd rett '
        'før vristen og 2 rett sammen rett etter vristen, altså 2 masker felt. Strikk '
        '1 omgang rett mellom hver felleomgang, til du er tilbake på det masketallet '
        'sokken hadde i legget.',
        'Now you join the work back into a round. Knit across the heel stitches, pick up '
        'and knit the number of edge stitches your column gives along one side of the '
        'heel flap, knit the instep stitches from the spare needle, and pick up the same '
        'number of edge stitches along the other side. You now have the high stitch '
        'count in your column. Then decrease like this: on each decrease round you ssk '
        'just before the instep and k2tog just after the instep, that is 2 stitches '
        'decreased. Work 1 round in knit between each decrease round, until you are back '
        'at the stitch count the sock had in the leg.') + '</p>' +
        card(tabell(ki_h, ki_r, min_index=0)) +
        cme(L(lang,
              'Plukk opp maskene gjennom begge trådene i kjeden langs lappen, ikke bare '
              'den ytterste. Det gir en tettere overgang, og det er her sokker oftest får '
              'hull.',
              'Pick the stitches up through both strands of the chain along the flap, not '
              'just the outer one. That gives a tighter join, and this is where socks most '
              'often get holes.')), 10))

    # ---------------------------------------------------------- 11 FOT OG BÅTTÅ
    ta_h = [Sh] + L(lang, ['Masker', 'Fot før tåen', 'Felleomganger', 'Igjen til maskingen'],
                    ['Stitches', 'Foot before the toe', 'Decrease rounds', 'Left for grafting'])
    ta_r = [[navn(v, lang), str(v['masker']) + m, komma(v['fot_for_ta_cm']) + ' cm',
             str(v['ta_omganger']) + ' x', str(v['ta_slutt']) + m] for v in SOKKER]
    P.append(pg(
        banner(L(lang, '6 · FOTEN OG TÅEN', '6 · THE FOOT AND THE TOE')) +
        rosep(L(lang, 'FOTEN', 'THE FOOT')) +
        card('<p>' + L(lang,
             'Strikk rett rundt til foten måler lengden i kolonnen din, målt fra bakerst '
             'på hælen. Strikk gjerne en frøomgang til over vristen underveis.',
             'Knit round until the foot measures the length in your column, measured from '
             'the very back of the heel. You may work one more seed round over the instep '
             'along the way.') + '</p>') +
        sagep(L(lang, 'BÅTTÅEN', 'THE WEDGE TOE')) +
        card('<p>' + L(lang,
             'Del omgangen i to like halvdeler, oversiden og undersiden. På hver '
             'felleomgang feller du 2 masker i hver halvdel: 2 rett sammen vridd i '
             'begynnelsen av halvdelen og 2 rett sammen på slutten, altså 4 masker felt '
             'i alt. Strikk 1 omgang rett mellom hver felleomgang. Gjenta til du har '
             'maskene i kolonnen din igjen. Klipp garnet, og mask de to halvdelene '
             'sammen med stoppenål.',
             'Divide the round into two equal halves, the top and the sole. On each '
             'decrease round you decrease 2 stitches in each half: ssk at the start of '
             'the half and k2tog at the end, that is 4 stitches decreased in all. Work 1 '
             'round in knit between each decrease round. Repeat until you have the '
             'stitches in your column left. Cut the yarn, and graft the two halves '
             'together with a darning needle.') + '</p>' +
             tabell(ta_h, ta_r, min_index=0)) +
        cme(L(lang,
              'Masking gir en helt flat sammenføyning. En felt og avsluttet tå gir en '
              'kant tvers over tærne, og den kjennes gjennom en tynn babysokk.',
              'Grafting gives a completely flat join. A cast off toe leaves a ridge right '
              'across the toes, and that can be felt through a thin baby sock.')), 11))

    # ------------------------------------------------------------ 12 TESTSTRIKK
    P.append(pg(f.side_teststrikk(lang, 'sokkene', 'the socks'), 12))

    # ------------------------------------------------------------- 13 MONTERING
    P.append(pg(f.side_montering(
        lang,
        'Sokker til de aller minste skal ikke ha stram ribb. Kjenn etter at ribben ikke '
        'setter merker rundt ankelen.',
        'Socks for the very smallest must not have a tight rib. Check that the rib does '
        'not leave marks round the ankle.'), 13))

    # ------------------------------------------------------------ 14 AVSLUTNING
    P.append(pg(f.side_avslutning(lang), 14))
    return P


f.skriv('sokker',
        {'no': 'Jordbærdrøm sokker, LME strikkeoppskrift',
         'en': 'Strawberry Dream socks, LME knitting pattern'},
        sider, 'sokker')
