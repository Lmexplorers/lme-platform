# -*- coding: utf-8 -*-
"""Genererer LME-hekleoppskrift 'Woodland Fluffy Skirt' (norsk + engelsk) som
HTML, klar for PDF-print med Chromium. Heklet del av strikkekolleksjonen
LME Woodland Dreams (Basisbody + 6 tilbehørsdeler + dette skjørtet).

Helt original LME-konstruksjon, ikke en kopi av noe eksisterende mønster:
heklet ovenfra og ned, elastisk linning, lett A-fasong kropp, tre
kaskaderende fluffy volanglag med luftig fall, pyntekant. Fasthet 20
staver = 10 cm / 30 omganger = 15 cm på heklenål 4 mm, Sandnes Garn
Alpakka. Alle graderingstall er beregnet og verifisert separat (se
sizes.json og grading_skirt.py), ikke frihåndstall.
"""
import pathlib, sys, json

BASE = pathlib.Path(__file__).parent
sys.path.insert(0, str(BASE.parent / '_shared'))
import lme_pattern_kit as kit
from lme_pattern_kit import (banner, rosep, sagep, card, cream, cme, ul, steps, otab, abbrtab)

SIZES = json.loads(BASE.joinpath('sizes.json').read_text(encoding='utf-8'))

T = {}
def add(key, no, en=None):
    T[key] = {'no': no, 'en': en if en is not None else no}

# ---------------------------------------------------------------- SIDE 1: FORSIDE
add('doctitle', 'Woodland Fluffy Skirt, LME hekleoppskrift', 'Woodland Fluffy Skirt, LME crochet pattern')
add('ph2', 'LME HEKLEOPPSKRIFT&nbsp;&nbsp;|&nbsp;&nbsp;WOODLAND FLUFFY SKIRT',
    'LME CROCHET PATTERN&nbsp;&nbsp;|&nbsp;&nbsp;WOODLAND FLUFFY SKIRT')
add('covertag', 'LME HEKLEOPPSKRIFT - BABY OG BARN', 'LME CROCHET PATTERN - BABY AND CHILD')
add('covertitle', 'WOODLAND FLUFFY SKIRT', 'WOODLAND FLUFFY SKIRT')
add('subpill', 'LME BABY COLLECTION - WOODLAND DREAMS', 'LME BABY COLLECTION - WOODLAND DREAMS')
add('cover_desc',
    'Et lett, luftig heklet skjørt med tre myke, kaskaderende volanglag og et elegant fall, akkurat '
    'som sukkerspinn. Heklet ovenfra og ned: en elastisk linning, en lett A-fasong kropp og tre '
    'fluffy volanglag med en fin pyntekant nederst. Seksten størrelser, fra prematur til 14-16 år, '
    'laget for å passe perfekt sammen med Woodland Dreams Basisbody.',
    'A light, airy crocheted skirt with three soft, cascading ruffle tiers and an elegant fall, '
    'just like cotton candy. Crocheted top-down: an elastic waistband, a light A-line body and '
    'three fluffy ruffle tiers with a pretty finishing edge at the hem. Sixteen sizes, from preemie '
    'to 14-16 years, made to fit perfectly together with the Woodland Dreams Basisbody.')
add('by1', 'Av Renate Dahl', 'By Renate Dahl')
add('by2', 'Little Montessori Explorers', 'Little Montessori Explorers')
add('by3', 'lmexplorers.com', 'lmexplorers.com')
add('cover_tip',
    'TIPS: Les hele oppskriften og størrelsestabellen på side 4 før du starter, og hekle en '
    'prøvelapp på 10 x 10 cm i staver for å sjekke heklefastheten din.',
    'TIP: Read through the whole pattern and the size chart on page 4 before you start, and crochet '
    'a 10 x 10 cm gauge swatch in double crochet to check your tension.')

# ---------------------------------------------------------------- SIDE 2: OM
add('banner_om', 'OM WOODLAND FLUFFY SKIRT', 'ABOUT THE WOODLAND FLUFFY SKIRT')
add('pill_kolleksjon0', 'DEL AV KOLLEKSJONEN', 'PART OF THE COLLECTION')
add('om_kolleksjon0',
    'Woodland Fluffy Skirt er den heklede delen av LME Woodland Dreams, laget for å passe perfekt '
    'sammen med den strikkede Basisbodyen. Skjørtet er ikke en kopi av noe eksisterende design, '
    'det er tegnet og gradert fra bunnen av, inspirert av et lett, fluffy volangskjørt.',
    'The Woodland Fluffy Skirt is the crocheted piece in LME Woodland Dreams, made to fit perfectly '
    "together with the knitted Basisbody. The skirt is not a copy of any existing design, it's "
    'drafted and graded from scratch, inspired by a light, fluffy ruffle skirt.')
add('pill_stil', 'STIL', 'STYLE')
add('om_stil',
    'Skandinavisk, tidløst og eksklusivt, med et lett og luftig uttrykk. Myke volanger, et elegant '
    'fall, og et rolig, minimalistisk formspråk, uten tunge eller tette masker som drar skjørtet '
    'ned.',
    'Scandinavian, timeless and exclusive, with a light and airy feel. Soft ruffles, an elegant '
    'fall, and a calm, minimalist shape, with no heavy or dense stitches weighing the skirt down.')
add('pill_passform', 'PASSFORM', 'FIT')
add('om_passform',
    'En elastisk linning gjør skjørtet komfortabelt og enkelt å ta på, mens den lette A-fasongen '
    'gir bevegelsesfrihet. De tre volanglagene er hver for seg heklet luftig med multipliserte '
    'masker, ikke tett og tung, så det kaskaderende fallet blir lett selv i de største '
    'størrelsene.',
    'An elastic waistband makes the skirt comfortable and easy to put on, while the light A-line '
    'shape gives freedom of movement. Each of the three ruffle tiers is crocheted airily with '
    'multiplied stitches, not dense and heavy, so the cascading fall stays light even in the '
    'largest sizes.')

# ---------------------------------------------------------------- SIDE 3: MATERIALER
add('banner_mat', 'MATERIALER', 'MATERIALS')
add('pill_garn', 'GARN', 'YARN')
add('garn_txt',
    'Sandnes Garn Alpakka (100 % alpakka), eller et tilsvarende garn med samme fasthet. Skjørtet '
    'kan hekles i en av kolleksjonens rolige naturfarger (krem, lin, sand, havre, beige) for et '
    'stillferdig uttrykk, eller i en av tilbehørsfargene (salviegrønn, dusty rose, smørgul, myk '
    'blå, oliven, terrakotta) for et fargesterkere uttrykk sammen med Basisbodyen.',
    "Sandnes Garn Alpakka (100% alpaca), or an equivalent yarn with the same gauge. The skirt can "
    "be crocheted in one of the collection's calm natural colours (cream, linen, sand, oatmeal, "
    'beige) for a quiet look, or in one of the accessory colours (sage green, dusty rose, butter '
    'yellow, soft blue, olive, terracotta) for a more colourful look together with the Basisbody.')
GARNFORBRUK = [
    ('Prematur', '70-80 g'), ('Nyfødt', '80-90 g'), ('0-3 mnd', '90-100 g'), ('3-6 mnd', '100-115 g'),
    ('6-9 mnd', '115-130 g'), ('9-12 mnd', '130-145 g'), ('1-2 år', '150-165 g'), ('2-3 år', '170-190 g'),
    ('3-4 år', '195-215 g'), ('4-5 år', '215-235 g'), ('5-6 år', '235-260 g'), ('6-8 år', '260-285 g'),
    ('8-10 år', '285-310 g'), ('10-12 år', '310-340 g'), ('12-14 år', '340-370 g'), ('14-16 år', '370-400 g'),
]
add('pill_forbruk', 'GARNFORBRUK', 'YARN REQUIREMENTS')
add('pill_utstyr', 'UTSTYR', 'EQUIPMENT')
add('utstyr_txt',
    'Heklenål 4 mm. Myk, flat elastikk 1-1,5 cm bred, kuttet til midjemål minus 2 cm (se '
    'størrelsestabellen). Synål og en sikkerhetsnål eller en liten heklenål til å tre elastikken '
    'gjennom linningkanalen.',
    '4 mm crochet hook. Soft, flat elastic 1-1.5 cm wide, cut to waist measurement minus 2 cm (see '
    'the size chart). A tapestry needle and a safety pin or a small crochet hook to thread the '
    'elastic through the waistband channel.')

# ---------------------------------------------------------------- SIDE 4: STØRRELSESTABELL
add('banner_storrelse', 'STØRRELSESTABELL', 'SIZE CHART')
add('storrelse_lead',
    'Ferdige mål. Velg størrelse etter midjemål, eller test linningen rundt midjen på barnet før '
    'du hekler videre.',
    "Finished measurements. Choose size by waist measurement, or test the waistband around the "
    "child's waist before crocheting on.")
storrelse_head = {'no': ['Størrelse', 'Midjemål (barn)', 'Skjørtlengde', 'Elastikklengde'],
                   'en': ['Size', "Waist (child's)", 'Skirt length', 'Elastic length']}
add('storrelse_head', storrelse_head['no'], storrelse_head['en'])
storrelse_rows = []
for s in SIZES:
    elastic_len = s['waist_actual_cm'] - 2
    storrelse_rows.append((s['no'], f"{s['waist_actual_cm']} cm", f"{s['skirt_length_cm']} cm",
                            f"{elastic_len} cm"))
add('storrelse_rows_data', storrelse_rows)
add('storrelse_note',
    'Midjemål er barnets faktiske mål. Selve linningen hekles litt trangere enn dette (se del 1), '
    'siden elastikken skal strekke den ut til en god, sittende passform.',
    "Waist measurement is the child's actual measurement. The waistband itself is crocheted a "
    'little smaller than this (see part 1), since the elastic stretches it out to a good, snug '
    'fit.')

# ---------------------------------------------------------------- SIDE 5: FASTHET
add('banner_fasthet', 'HEKLEFASTHET OG VANSKELIGHETSGRAD', 'GAUGE AND DIFFICULTY LEVEL')
add('pill_fasthet', 'FASTHET', 'GAUGE')
add('fasthet_txt',
    '20 staver og 30 omganger = 10 x 15 cm, på heklenål 4 mm. Denne fastheten er brukt i alle '
    'beregninger i oppskriften. Hekle alltid en prøvelapp først: hekle en luftmaskerekke, hekle '
    'staver i ca. 12 cm bredde og 15 cm høyde, press lett. Stemmer ikke fastheten din, bytt til '
    'tynnere eller tykkere nål til den stemmer.',
    '20 double crochets and 30 rounds = 10 x 15 cm, on a 4 mm hook. This gauge is used in every '
    'calculation in the pattern. Always crochet a swatch first: chain a foundation row, work double '
    'crochet for approx. 12 cm wide and 15 cm tall, block lightly. If your gauge does not match, '
    'change to a smaller or larger hook until it does.')
add('pill_vanskelig', 'VANSKELIGHETSGRAD', 'DIFFICULTY LEVEL')
add('vanskelig_txt',
    'Middels. Du bør beherske å hekle i rundt, øke jevnt fordelt, og hekle staver og '
    'multipliserte masker. Ingen kompliserte mønsterrapporter, hele skjørtet hekles i faste '
    'stavomganger.',
    'Medium. You should be comfortable crocheting in the round, increasing evenly spaced, and '
    'working double crochets and multiplied stitches. No complicated stitch repeats, the whole '
    'skirt is worked in plain rounds of double crochet.')

# ---------------------------------------------------------------- SIDE 6: FORKORTELSER
add('banner_ord', 'FORKORTELSER', 'ABBREVIATIONS')
add('ord_lead',
    'Norske hekleuttrykk med amerikanske hekletermer ved siden av.',
    'Norwegian crochet terms with US crochet terms alongside.')
ord_head = {'no': ['Norsk', 'US', 'Betyr'], 'en': ['Norwegian', 'US', 'Meaning']}
add('ord_head', ord_head['no'], ord_head['en'])
ord_rows = [
    ('lm', 'ch', 'luftmaske'),
    ('fm', 'sc', 'fastmaske'),
    ('stav', 'dc', 'stav (double crochet)'),
    ('halvstav', 'hdc', 'halv stav (half double crochet)'),
    ('m', 'st(s)', 'maske(r)'),
    ('omg', 'rnd', 'omgang'),
    ('øk', 'inc', 'øk (hekle 2 m i samme maske)'),
    ('felle', 'dec', 'felle (hekle 2 m sammen til 1)'),
    ('kjedemaske', 'sl st', 'kjedemaske / slip stitch'),
    ('picot', 'picot', '3 lm, kjedemaske i 1. lm, en liten "tagg"'),
    ('magisk ring', 'magic ring', 'justerbar startring'),
]
add('ord_rows', ord_rows)
add('pill_tips', 'TIPS', 'TIPS')
tips_no = [
    'Sett en maskemarkør ved start av hver omgang, det er lett å miste tellingen i en lang '
    'rundhekling.',
    'Hekle alltid en prøvelapp, selv i staver, alpakka oppfører seg litt annerledes enn bomull '
    'eller ull.',
    'Tell maskene dine ved hver kontroll i tabellene, det er lettere å rette opp 4 omganger enn '
    '40.',
]
tips_en = [
    'Place a stitch marker at the start of every round, it is easy to lose count in a long piece '
    'worked in the round.',
    'Always crochet a swatch, even in double crochet, alpaca behaves a little differently from '
    'cotton or wool.',
    'Count your stitches at every checkpoint in the tables, it is easier to fix 4 rounds back than '
    '40.',
]
add('tips', tips_no, tips_en)

# ---------------------------------------------------------------- SIDE 7: KONSTRUKSJONSOVERSIKT
add('banner_oversikt', 'SLIK ER SKJØRTET BYGD OPP', 'HOW THE SKIRT IS CONSTRUCTED')
add('oversikt_lead',
    'Skjørtet hekles ovenfra og ned, i ett stykke, i fire enkle deler:',
    'The skirt is crocheted top-down, in one piece, in four simple parts:')
oversikt_deler = [
    ('1. Linningen', 'En fast, smal fm-kanal for elastikken, heklet litt trangere enn midjemålet.',
     '1. The waistband', 'A firm, narrow sc channel for the elastic, crocheted a little smaller '
     'than the waist measurement.'),
    ('2. A-kroppen', 'Staver i jevne omganger, med spredte økeomganger som gir skjørtet sin lette '
     'A-fasong.', '2. The A-line body', 'Double crochets in plain rounds, with spread-out increase '
     'rounds that give the skirt its light A-line shape.'),
    ('3. De tre volanglagene', 'Maskene multipliseres i tre egne omganger, ett kaskaderende lag om '
     'gangen, for et luftig, fluffy fall.', '3. The three ruffle tiers', 'The stitches are '
     'multiplied over three separate rounds, one cascading tier at a time, for an airy, fluffy '
     'fall.'),
    ('4. Kanten', 'Avsluttes med en liten picot-kant nederst på siste volanglag.', '4. The edge',
     'Finished with a small picot edge at the bottom of the last ruffle tier.'),
]
add('oversikt_deler_data', oversikt_deler)

# ---------------------------------------------------------------- SIDE 8: LINNINGEN
add('banner_linning', 'DEL 1: LINNINGEN', 'PART 1: THE WAISTBAND')
add('linning_lead',
    'Skjørtet starter øverst, i linningen. Hekle en luftmaskerekke og lukk til en ring med en '
    'kjedemaske, eller start med en magisk ring, slik du foretrekker.',
    'The skirt starts at the top, at the waistband. Crochet a foundation chain and join it into a '
    'ring with a slip stitch, or start with a magic ring, whichever you prefer.')
add('linning_metode',
    'Hekle {linning_rounds} omganger fastmasker rundt, uten øking. Dette gir en fast, tett kanal '
    'som elastikken senere skal trekkes gjennom.',
    'Work {linning_rounds} rounds of single crochet around, with no increasing. This gives a firm, '
    'tight channel that the elastic will later be threaded through.')
linning_head = {'no': ['Størrelse', 'Legg opp (fm rundt)', 'Omg. i linningen', 'Elastikklengde'],
                 'en': ['Size', 'Foundation (sc around)', 'Rounds in waistband', 'Elastic length']}
add('linning_head', linning_head['no'], linning_head['en'])
linning_rows = []
for s in SIZES:
    elastic_len = s['waist_actual_cm'] - 2
    linning_rows.append((s['no'], str(s['waist_sts']), str(s['linning_rounds']), f"{elastic_len} cm"))
add('linning_rows_data', linning_rows)
add('linning_ferdig',
    'Kontroll: legg linningen flatt, tell maskene rundt. De skal stemme med tallet i kolonnen '
    '"Legg opp" for din størrelse, før du går videre til del 2.',
    'Check: lay the waistband flat, count the stitches around. They should match the number in the '
    '"Foundation" column for your size, before you move on to part 2.')

# ---------------------------------------------------------------- SIDE 9: A-KROPPEN
add('banner_kropp', 'DEL 2: A-KROPPEN', 'PART 2: THE A-LINE BODY')
add('kropp_lead',
    'Bytt til staver. Nå hekles kroppen av skjørtet, med jevnt spredte økeomganger som gir den '
    'lette A-fasongen. Konstruksjonen er lik for alle størrelser, det er bare tallene som endrer '
    'seg, se graderingstabellen under.',
    'Switch to double crochet. Now the body of the skirt is worked, with evenly spread increase '
    'rounds that give it the light A-line shape. The construction is the same for every size, only '
    'the numbers change, see the grading table below.')
add('kropp_metode',
    'Fordel {n_inc_rounds} økeomganger jevnt utover de {body_plain_rounds} omgangene i denne '
    'delen (for eksempel omtrent hver {spacing}. omgang, juster litt etter behov slik at siste '
    'økeomgang faller nær slutten av delen). I en økeomgang: hekle 2 staver i hver fjerde maske '
    'rundt (4 økepunkter jevnt fordelt), vanlig stav i de øvrige maskene. Utenom økeomgangene, '
    'hekle vanlig, uten øking.',
    'Spread {n_inc_rounds} increase rounds evenly across the {body_plain_rounds} rounds in this '
    'part (roughly every {spacing} rounds, adjust slightly so the last increase round falls near '
    'the end of the section). On an increase round: work 2 double crochets in every fourth stitch '
    'around (4 increase points evenly spaced), plain double crochet in the remaining stitches. '
    'Outside the increase rounds, crochet plain, with no increasing.')
kropp_head = {'no': ['Størrelse', 'Start (fra linning)', 'Antall økeomg.', 'Omg. i denne delen', 'Slutt (til volang)'],
               'en': ['Size', 'Start (from waistband)', 'Increase rounds', 'Rounds in this part', 'End (to ruffle)']}
add('kropp_head', kropp_head['no'], kropp_head['en'])
kropp_rows = []
for s in SIZES:
    kropp_rows.append((s['no'], str(s['waist_sts']), str(s['n_inc_rounds']),
                        str(s['body_plain_rounds']), str(s['body_target_sts'])))
add('kropp_rows_data', kropp_rows)
add('kropp_ferdig',
    'Kontroll: tell maskene dine. De skal stemme med tallet i kolonnen "Slutt" for din størrelse, '
    'før du går videre til del 3.',
    'Check: count your stitches. They should match the number in the "End" column for your size, '
    'before you move on to part 3.')

# ---------------------------------------------------------------- SIDE 10: DE TRE VOLANGLAGENE
add('banner_volang', 'DEL 3: DE TRE VOLANGLAGENE', 'PART 3: THE THREE RUFFLE TIERS')
add('volang_lead',
    'Her skjer det fluffy: i stedet for én stor volang hekles tre egne, kaskaderende volanglag '
    'etter hverandre, akkurat som ekte sukkerspinn. Hvert lag starter med en '
    'multipliseringsomgang, som gir et luftig, bølgende fall, etterfulgt av noen omganger vanlig '
    'stav på det nye, større masketallet, før neste lag starter med en ny multipliseringsomgang.',
    "This is where the fluffy magic happens: instead of one big ruffle, three separate, cascading "
    'tiers are crocheted one after another, just like real cotton candy. Each tier starts with a '
    'multiplying round, giving an airy, wavy fall, followed by a few plain rounds of double '
    'crochet on the new, larger stitch count, before the next tier starts with a new multiplying '
    'round.')
add('volang_metode',
    'Multipliseringsomgang: hekle om lag {mult} staver i hver maske rundt (juster med 1 opp eller '
    'ned pr maske slik at sluttallet stemmer nøyaktig med tabellen), til du har {end_sts} masker. '
    'Hekle deretter {plain_rounds} omganger vanlig stav, uten øking, på det nye masketallet. Dette '
    'er ett volanglag ferdig. Gjenta hele denne oppskriften ({n_tiers} multipliseringsomganger med '
    'vanlig stav imellom) for de neste lagene, med tallene fra tabellen under for din størrelse, '
    'før avslutningskanten på neste side.',
    'Multiplying round: work approximately {mult} double crochets in each stitch around (adjust '
    'by 1 up or down per stitch so the final count matches the table exactly), until you have '
    '{end_sts} stitches. Then work {plain_rounds} plain rounds of double crochet, with no '
    'increasing, on the new stitch count. That is one ruffle tier done. Repeat this same recipe '
    '({n_tiers} multiplying rounds with plain double crochet in between) for the remaining tiers, '
    'using the numbers from the table below for your size, before the finishing edge on the next '
    'page.')
volang_head = {'no': ['Størrelse', 'Start (fra kropp)', 'Volanglag 1', 'Volanglag 2', 'Volanglag 3 (hem)'],
                'en': ['Size', 'Start (from body)', 'Ruffle tier 1', 'Ruffle tier 2', 'Ruffle tier 3 (hem)']}
add('volang_head', volang_head['no'], volang_head['en'])

# ---------------------------------------------------------------- SIDE 11: AVSLUTNINGSKANTEN
add('banner_kant', 'AVSLUTNINGSKANTEN', 'THE FINISHING EDGE')
add('kant_lead',
    'En liten pyntekant fullfører volangen og hindrer kanten i å rulle seg.',
    'A small decorative edge finishes the ruffle and keeps the edge from curling.')
add('kant_txt',
    'Hekle 1 omgang fastmasker rundt, jevnt fordelt (ingen øking eller felling denne omgangen). '
    'Hekle deretter picot-kanten: *1 fm i hver av de neste 2 maskene, picot (3 lm, kjedemaske i '
    'den første av de 3 luftmaskene)*, gjenta fra * til * rundt. Fest av og gjem tråden.',
    'Work 1 round of single crochet around, evenly spaced (no increasing or decreasing this '
    'round). Then work the picot edge: *1 sc in each of the next 2 stitches, picot (ch 3, slip '
    'stitch in the first of the 3 chains)*, repeat from * to * around. Fasten off and weave in the '
    'end.')

# ---------------------------------------------------------------- SIDE 12: MONTERING
add('banner_montering', 'MONTERING', 'FINISHING')
montering_no = [
    'Klipp elastikken til lengden som er oppgitt for din størrelse i størrelsestabellen '
    '(midjemål minus 2 cm).',
    'Fest en sikkerhetsnål eller en liten heklenål i den ene enden av elastikken, og tre den '
    'gjennom linningkanalen hele veien rundt.',
    'Overlapp de to endene av elastikken med 1-2 cm, og sy dem godt sammen med synål og tråd, '
    'flere ganger fram og tilbake.',
    'La linningen gli tilbake slik at skjøten på elastikken skjules inni kanalen.',
    'Fest alle løse tråder godt på vrangen, og klipp dem korte.',
    'Damp press skjørtet lett, unngå å presse direkte på volangen, den skal beholde luftigheten '
    'sin.',
]
montering_en = [
    'Cut the elastic to the length given for your size in the size chart (waist measurement minus '
    '2 cm).',
    'Attach a safety pin or a small crochet hook to one end of the elastic, and thread it through '
    'the waistband channel all the way around.',
    'Overlap the two ends of the elastic by 1-2 cm, and sew them securely together with a tapestry '
    'needle and thread, back and forth several times.',
    'Let the waistband slide back so the elastic join is hidden inside the channel.',
    'Weave in all loose ends securely on the wrong side, and trim them short.',
    'Lightly steam-block the skirt, avoid pressing directly on the ruffle, it should keep its '
    'airiness.',
]
add('montering_steg', montering_no, montering_en)

# ---------------------------------------------------------------- SIDE 13: SIKKERHET OG STELL
add('banner_sikkerhet', 'SIKKERHET OG STELL', 'SAFETY AND CARE')
add('pill_sikkerhet', 'SIKKERHET', 'SAFETY')
sik_no = [
    'Bruk myk, flat elastikk uten skarpe kanter, og sjekk skjøten jevnlig, spesielt etter vask.',
    'Denne oppskriften er ikke ment for barn som putter små gjenstander i munnen uten tilsyn.',
    'Alle mål og masketall er beregnet for en romslig, komfortabel passform, følg alltid '
    'gjeldende sikkerhetsanbefalinger for barneklær.',
]
sik_en = [
    'Use soft, flat elastic with no sharp edges, and check the join regularly, especially after '
    'washing.',
    'This pattern is not intended for children who put small objects in their mouth unsupervised.',
    'All measurements and stitch counts are calculated for a roomy, comfortable fit, always follow '
    "current safety recommendations for children's clothing.",
]
add('sikkerhet_txt', sik_no, sik_en)
add('pill_stell', 'VASKERÅD', 'CARE INSTRUCTIONS')
add('stell_txt',
    'Håndvask forsiktig i lunkent vann med ullvask, eller maskinvask på ullprogram 30 grader. '
    'Press ut vannet, trekk volangen forsiktig i fasong, og tørk liggende flatt på et håndkle.',
    'Hand wash gently in lukewarm water with wool wash, or machine wash on a wool cycle at 30 '
    'degrees. Press out the water, gently ease the ruffle into shape, and dry lying flat on a '
    'towel.')

# ---------------------------------------------------------------- SIDE 14: FERDIG
add('banner_ferdig', 'FERDIG!', 'ALL DONE!')
add('ferdig_txt',
    'Gratulerer, Woodland Fluffy Skirt er ferdig! Kombiner den med Basisbodyen og en av '
    'tilbehørsdelene for et komplett, gjennomført Woodland Dreams-antrekk.',
    'Congratulations, your Woodland Fluffy Skirt is finished! Combine it with the Basisbody and '
    'one of the accessory patterns for a complete, coordinated Woodland Dreams outfit.')
add('pill_kolleksjon', 'RESTEN AV KOLLEKSJONEN', 'THE REST OF THE COLLECTION')
kolliste_no = [
    'Woodland Dreams Basisbody, den strikkede grunnmuren i kolleksjonen.',
    'Blondekrage, en løs krage som hekter bak.',
    'Rysjekrage, samme feste, litt mer romantisk.',
    'Peter Pan-krage, en klassisk avrundet krage.',
    'Smekke, som knytes med i-cord eller en knapp.',
    'I-cord-seler, kolleksjonens signaturdel, justerbare og krysser bak.',
    'Kort vest, med treknapper foran, brukes utenpå bodyen.',
]
kolliste_en = [
    'Woodland Dreams Basisbody, the knitted foundation of the collection.',
    'Lace collar, a loose collar that fastens at the back.',
    'Ruffle collar, the same fastening, a little more romantic.',
    'Peter Pan collar, a classic rounded collar.',
    'Bib, tied with an i-cord or a button.',
    "I-cord suspenders, the collection's signature piece, adjustable and crossing at the back.",
    'Short vest, with wooden buttons at the front, worn over the body.',
]
add('kolleksjon_liste', kolliste_no, kolliste_en)
add('pill_copyright', 'OPPHAVSRETT', 'COPYRIGHT')
add('copyright_txt',
    '(c) Renate Dahl, Little Montessori Explorers. Denne oppskriften er et helt originalt '
    'LME-design. Du står fritt til å selge ferdige plagg du lager etter denne oppskriften, i '
    'liten, personlig skala, forutsatt at det ferdige produktet er sjekket mot gjeldende '
    'sikkerhetskrav. Selve oppskriften, teksten og bildene, kan ikke deles, kopieres eller selges '
    'videre.',
    '(c) Renate Dahl, Little Montessori Explorers. This pattern is a fully original LME design. '
    'You are welcome to sell finished garments you make from this pattern, on a small personal '
    'scale, provided the finished product is checked against current safety requirements. The '
    'pattern itself, its text and images, may not be shared, copied or resold.')

# ================================================================== BYGG SIDENE

def build(lang):
    RIGHT = {'no': 'LME HEKLING', 'en': 'LME CROCHET'}[lang]
    def t(key): return T[key][lang]
    PH2 = t('ph2')
    def pg(body, num): return kit.page(body, num, RIGHT, PH2, t('doctitle'))
    pages = []

    pages.append(pg(f'''
<div class="covertag">{t('covertag')}</div>
<div class="coverbanner"><h1 class="covertitle">{t('covertitle')}</h1></div>
<div class="subpill">{t('subpill')}</div>
{card('<p class="center">' + t('cover_desc') + '</p>')}
<div class="byline">
  <div class="by1">{t('by1')}</div>
  <div class="by2">{t('by2')}</div>
  <div class="by3">{t('by3')}</div>
</div>
<div class="notecard"><span class="noteemo">&#127752;</span><p><i>{t('cover_tip')}</i></p></div>
''', 1))

    pages.append(pg(f'''
{banner(t('banner_om'))}
{rosep(t('pill_kolleksjon0'))}
{card('<p>' + t('om_kolleksjon0') + '</p>')}
{sagep(t('pill_stil'))}
{card('<p>' + t('om_stil') + '</p>')}
{rosep(t('pill_passform'))}
{cme(t('om_passform'))}
''', 2))

    forbruk_html = '<table class="t"><tr><th>' + {'no':'Størrelse','en':'Size'}[lang] + '</th><th>' + \
        {'no':'Garnforbruk','en':'Yarn amount'}[lang] + '</th></tr>' + \
        ''.join(f'<tr><td><b>{a}</b></td><td>{b}</td></tr>' for a, b in GARNFORBRUK) + '</table>'
    pages.append(pg(f'''
{banner(t('banner_mat'))}
{rosep(t('pill_garn'))}
{card('<p>' + t('garn_txt') + '</p>')}
{sagep(t('pill_forbruk'))}
{card(forbruk_html)}
{rosep(t('pill_utstyr'))}
{cme(t('utstyr_txt'))}
''', 3))

    st_table = '<table class="t"><tr><th>' + '</th><th>'.join(t('storrelse_head')) + '</th></tr>' + \
        ''.join(f'<tr><td><b>{a}</b></td><td>{b}</td><td>{c}</td><td>{d}</td></tr>'
                for a, b, c, d in T['storrelse_rows_data']['no']) + '</table>'
    pages.append(pg(f'''
{banner(t('banner_storrelse'))}
<p>{t('storrelse_lead')}</p>
{card(st_table)}
{cme(t('storrelse_note'))}
''', 4))

    pages.append(pg(f'''
{banner(t('banner_fasthet'))}
{rosep(t('pill_fasthet'))}
{card('<p>' + t('fasthet_txt') + '</p>')}
{sagep(t('pill_vanskelig'))}
{cme(t('vanskelig_txt'))}
''', 5))

    ord_table = abbrtab(T['ord_rows']['no'], t('ord_head'))
    pages.append(pg(f'''
{banner(t('banner_ord'))}
<p>{t('ord_lead')}</p>
{card(ord_table)}
{sagep(t('pill_tips'))}
{card(ul(t('tips')))}
''', 6))

    deler_html = '<div class="deler-grid">' + ''.join(
        f'<div class="di"><b>{a}</b><br>{b}</div>'
        for a, b, c, d in T['oversikt_deler_data']['no']) + '</div>' if lang == 'no' else \
        '<div class="deler-grid">' + ''.join(
        f'<div class="di"><b>{c}</b><br>{d}</div>'
        for a, b, c, d in T['oversikt_deler_data']['no']) + '</div>'
    pages.append(pg(f'''
{banner(t('banner_oversikt'))}
{card('<p>' + t('oversikt_lead') + '</p>' + deler_html)}
''', 7))

    linning_txt = t('linning_metode').format(linning_rounds=4)
    linning_table = '<table class="t"><tr><th>' + '</th><th>'.join(t('linning_head')) + '</th></tr>' + \
        ''.join(f'<tr><td><b>{a}</b></td><td>{b}</td><td>{c}</td><td>{d}</td></tr>'
                for a, b, c, d in T['linning_rows_data']['no']) + '</table>'
    pages.append(pg(f'''
{banner(t('banner_linning'))}
<p>{t('linning_lead')}</p>
{card('<p>' + linning_txt + '</p>')}
{card(linning_table)}
{cme(t('linning_ferdig'))}
''', 8))

    s0 = SIZES[0]
    spacing0 = max(round(s0['body_plain_rounds'] / max(s0['n_inc_rounds'], 1)), 1)
    kropp_txt = t('kropp_metode').format(n_inc_rounds=s0['n_inc_rounds'],
                                          body_plain_rounds=s0['body_plain_rounds'], spacing=spacing0)
    kropp_table = '<table class="t"><tr><th>' + '</th><th>'.join(t('kropp_head')) + '</th></tr>' + \
        ''.join(f'<tr><td><b>{a}</b></td><td>{b}</td><td>{c}</td><td>{d}</td><td>{e}</td></tr>'
                for a, b, c, d, e in T['kropp_rows_data']['no']) + '</table>'
    ex_label = {'no': 'Eksempel med tall for prematur:', 'en': 'Example with numbers for preemie:'}[lang]
    pages.append(pg(f'''
{banner(t('banner_kropp'))}
<p>{t('kropp_lead')}</p>
{card('<p><b>' + ex_label + '</b> ' + kropp_txt + '</p>')}
{card(kropp_table)}
{cme(t('kropp_ferdig'))}
''', 9))

    t1_0 = s0['tiers'][0]
    volang_txt = t('volang_metode').format(
        mult=round(t1_0['end_sts'] / t1_0['start_sts'], 2),
        end_sts=t1_0['end_sts'], plain_rounds=t1_0['plain_rounds'], n_tiers=s0['n_ruffle_tiers'])

    def tier_cell(tr):
        return (f"{tr['end_sts']} m ({tr['plain_rounds']} omg)" if lang == 'no'
                else f"{tr['end_sts']} sts ({tr['plain_rounds']} rnds)")

    volang_table = '<table class="t"><tr><th>' + '</th><th>'.join(t('volang_head')) + '</th></tr>' + \
        ''.join(
            f"<tr><td><b>{s['no'] if lang == 'no' else s['en']}</b></td>"
            f"<td>{s['body_target_sts']}</td>"
            f"<td>{tier_cell(s['tiers'][0])}</td>"
            f"<td>{tier_cell(s['tiers'][1])}</td>"
            f"<td>{tier_cell(s['tiers'][2])}</td></tr>"
            for s in SIZES
        ) + '</table>'
    pages.append(pg(f'''
{banner(t('banner_volang'))}
<p>{t('volang_lead')}</p>
{card('<p><b>' + ex_label + '</b> ' + volang_txt + '</p>')}
{card(volang_table)}
''', 10))

    pages.append(pg(f'''
{banner(t('banner_kant'))}
<p>{t('kant_lead')}</p>
{card('<p>' + t('kant_txt') + '</p>')}
''', 11))

    pages.append(pg(f'''
{banner(t('banner_montering'))}
{card(steps(t('montering_steg')))}
''', 12))

    pages.append(pg(f'''
{banner(t('banner_sikkerhet'))}
{rosep(t('pill_sikkerhet'))}
{card(ul(t('sikkerhet_txt')))}
{sagep(t('pill_stell'))}
{cme(t('stell_txt'))}
''', 13))

    pages.append(pg(f'''
{banner(t('banner_ferdig'))}
{cream('<p class="creamtitle">' + t('ferdig_txt') + '</p>')}
{sagep(t('pill_kolleksjon'))}
{card(ul(t('kolleksjon_liste')))}
{rosep(t('pill_copyright'))}
{card('<p class="small center">' + t('copyright_txt') + '</p>')}
<div class="byline">
  <div class="by2">{t('by1')} &middot; {t('by2')} &middot; {t('by3')}</div>
</div>
''', 14))

    return pages

for lang in ('no', 'en'):
    html_doc = kit.doc(lang, T['doctitle'][lang], None, build(lang))
    out = BASE / f'fluffy_skirt_{lang}.html'
    out.write_text(html_doc, encoding='utf-8')
    print('OK', lang, len(html_doc), 'tegn/chars')
