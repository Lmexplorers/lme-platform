# -*- coding: utf-8 -*-
"""Genererer LME-strikkeoppskrift 'Woodland Dreams Smekke' (norsk + engelsk)
som HTML, klar for PDF-print med Chromium. Del to av strikkekolleksjonen
LME Woodland Dreams (basisbody + 6 tilbehørsdeler + Woodland Fluffy Skirt).

Helt original LME-konstruksjon: en myk, avrundet trapesformet smekk som
strikkes flatt ovenfra og ned, fra halskanten og ut til bredeste punkt over
brystet, med en rettstrikk-kant hele veien rundt for en flat, ikke-rullende
finish. Lukkes enten med i-cord-bånd som knytes i sløyfe bak i nakken, eller
med én treknapp og en løkke. Fasthet 22 m = 10 cm / 30 o = 10 cm på 4 mm
pinne, Sandnes Garn Alpakka, samme fasthet som basisbodyen.

Graderingstallene er beregnet og verifisert i calc_sizes.py (skriver
sizes.json), ikke frihåndstall. Se calc_sizes.py og README.md for
utregningen og konsistenssjekkene.
"""
import pathlib, sys, json

BASE = pathlib.Path(__file__).parent
sys.path.insert(0, str(BASE.parent.parent / 'hekle' / '_shared'))
import lme_pattern_kit as kit
from lme_pattern_kit import (banner, rosep, sagep, card, cream, cme, ul, steps, abbrtab)

SIZES = json.loads(BASE.joinpath('sizes.json').read_text(encoding='utf-8'))

T = {}
def add(key, no, en=None):
    T[key] = {'no': no, 'en': en if en is not None else no}

# ---------------------------------------------------------------- SIDE 1: FORSIDE
add('doctitle', 'Woodland Dreams Smekke, LME strikkeoppskrift', 'Woodland Dreams Bib, LME knitting pattern')
add('ph2', 'LME STRIKKEOPPSKRIFT&nbsp;&nbsp;|&nbsp;&nbsp;WOODLAND DREAMS SMEKKE',
    'LME KNITTING PATTERN&nbsp;&nbsp;|&nbsp;&nbsp;WOODLAND DREAMS BIB')
add('covertag', 'LME STRIKKEOPPSKRIFT - BABY', 'LME KNITTING PATTERN - BABY')
add('covertitle', 'WOODLAND DREAMS SMEKKE', 'WOODLAND DREAMS BIB')
add('subpill', 'LME BABY COLLECTION - WOODLAND DREAMS', 'LME BABY COLLECTION - WOODLAND DREAMS')
add('cover_desc',
    'En myk, avrundet smekk i glattstrikk med rettstrikk-kant hele veien rundt: strikkes flatt '
    'ovenfra og ned, fra halskanten og ut til et rundet, brystdekkende parti. Lukkes enten med to '
    'i-cord-bånd som knytes i sløyfe bak i nakken, eller med én treknapp og en løkke for raskt av og '
    'på. Syv størrelser, fra 0-1 til 18-24 måneder, alle tilpasset halsmålet på Woodland Dreams '
    'basisbody. Smekken er tilbehørsdel nummer fire i kolleksjonen, strikket i en av '
    'kolleksjonens fargesterke tilbehørsfarger, som en fin kontrast til basisbodyens rolige '
    'naturfarger.',
    'A soft, rounded bib in stockinette stitch with a garter-stitch border all the way around: '
    'knitted flat, top-down, from the neck edge out to a rounded, chest-covering section. Closes '
    'either with two i-cord ties tied in a bow at the back of the neck, or with a single wooden '
    'button and loop for quick on and off. Seven sizes, from 0-1 to 18-24 months, each fitted to the '
    'neck size of the Woodland Dreams basisbody. The bib is accessory piece number four in the '
    "collection, knitted in one of the collection's bolder accessory colours, as a nice contrast to "
    "the basisbody's calm natural colours.")
add('by1', 'Av Renate Dahl', 'By Renate Dahl')
add('by2', 'Little Montessori Explorers', 'Little Montessori Explorers')
add('by3', 'lmexplorers.com', 'lmexplorers.com')
add('cover_tip',
    'TIPS: Les hele oppskriften og størrelsestabellen på side 4 før du starter, og strikk en '
    'prøvelapp på 15 x 15 cm for å sjekke strikkefastheten din, før du legger opp til selve smekken.',
    'TIP: Read through the whole pattern and the size chart on page 4 before you start, and knit a '
    '15 x 15 cm gauge swatch to check your tension, before casting on the bib itself.')

# ---------------------------------------------------------------- SIDE 2: OM
add('banner_om', 'OM WOODLAND DREAMS SMEKKE', 'ABOUT THE WOODLAND DREAMS BIB')
add('pill_del', 'EN DEL AV KOLLEKSJONEN', 'PART OF THE COLLECTION')
add('om_del',
    'Smekken er strikket for å passe rett på Woodland Dreams basisbody, halskanten er tilpasset '
    'basisbodyens halsmål for hver av de syv størrelsene, slik at smekken sitter pent rundt halsen '
    'uten å stramme eller gape.',
    "The bib is knitted to fit right over the Woodland Dreams basisbody, the neck edge is matched to "
    "the basisbody's neck measurement for each of the seven sizes, so the bib sits neatly around the "
    'neck without pulling tight or gaping.')
add('pill_stil', 'STIL', 'STYLE')
add('om_stil',
    'En enkel, avrundet trapesform uten mønster eller pynt, bare glattstrikk med en jevn '
    'rettstrikk-kant hele veien rundt. Formen er myk og lekent avrundet i de to nedre hjørnene, '
    'i stedet for skarpe hjørner.',
    'A simple, rounded trapezoid shape with no pattern or decoration, just stockinette stitch with '
    'an even garter-stitch border all the way around. The shape is soft and playfully rounded at the '
    'two lower corners, instead of sharp corners.')
add('pill_lukking0', 'TO MÅTER Å LUKKE PÅ', 'TWO WAYS TO CLOSE IT')
add('om_lukking0',
    'Velg selv hvordan smekken skal lukkes bak i nakken: to i-cord-bånd som knytes i sløyfe, eller '
    'én treknapp med en løkke, for et raskere av og på. Begge løsningene er beskrevet i detalj '
    'senere i oppskriften, sammen med et eget avsnitt om sikkerhet rundt knytebånd og knapper.',
    'Choose how the bib should close at the back of the neck: two i-cord ties tied in a bow, or a '
    'single wooden button with a loop, for a quicker on and off. Both options are described in '
    'detail later in the pattern, together with a dedicated section on safety around neck ties and '
    'buttons.')

# ---------------------------------------------------------------- SIDE 3: MATERIALER
add('banner_mat', 'MATERIALER', 'MATERIALS')
add('pill_garn', 'GARN', 'YARN')
add('garn_txt',
    'Sandnes Garn Alpakka (100 % alpakka), eller et tilsvarende garn med samme fasthet. Smekken er '
    'en tilbehørsdel, så velg en av kolleksjonens fargesterke tilbehørsfarger: salvie, gammelrosa, '
    'smørgul, dus blå, oliven eller terrakotta, gjerne en som kontrasterer med basisbodyens rolige '
    'naturfarge.',
    'Sandnes Garn Alpakka (100% alpaca), or an equivalent yarn with the same gauge. The bib is an '
    "accessory piece, so choose one of the collection's bolder accessory colours: sage, dusty rose, "
    'butter yellow, soft blue, olive or terracotta, ideally one that contrasts with the colour of '
    'the basisbody.')
add('pill_forbruk', 'GARNFORBRUK', 'YARN REQUIREMENTS')
add('pill_pinner', 'PINNER OG TILBEHØR', 'NEEDLES AND NOTIONS')
add('pinner_txt',
    'Rettpinner eller en kort rundpinne 4 mm (smekken strikkes flatt, fram og tilbake, aldri rundt). '
    'Synål til montering. Til knapp-og-løkke-lukkingen: én liten, rund treknapp (ca. 12-15 mm i '
    'diameter) og en heklenål 3 mm til å hekle løkken. Maskemarkør er valgfritt, men greit å ha til '
    'å markere start på hjørneavrundingen.',
    'Straight needles or a short circular needle 4 mm (the bib is knitted flat, back and forth, '
    'never in the round). A tapestry needle for finishing. For the button-and-loop closure: one '
    'small, round wooden button (approx. 12-15 mm in diameter) and a 3 mm crochet hook to crochet '
    'the loop. A stitch marker is optional, but handy for marking the start of the corner rounding.')
add('pill_provelapp', 'PRØVELAPP', 'GAUGE SWATCH')
add('provelapp_txt',
    'Legg opp 26 masker, strikk glattstrikk i ca. 12 cm, fell av og press lett. Stemmer ikke '
    'fastheten din med 22 masker og 30 omganger = 10 x 10 cm, bytt til tynnere eller tykkere pinne '
    'til den stemmer, se side 5.',
    'Cast on 26 stitches, work stockinette stitch for approx. 12 cm, bind off and block lightly. If '
    'your gauge does not match 22 stitches and 30 rows = 10 x 10 cm, change to a smaller or larger '
    'needle until it does, see page 5.')

# ---------------------------------------------------------------- SIDE 4: STØRRELSESTABELL
add('banner_storrelse', 'STØRRELSESTABELL', 'SIZE CHART')
add('storrelse_lead',
    'Ferdige mål, målt flatt liggende. Velg størrelse etter hvilken basisbody-størrelse smekken '
    'skal brukes sammen med, halsmålet i tabellen under er det samme som halsmålet på tilsvarende '
    'basisbody-størrelse.',
    "Finished measurements, measured lying flat. Choose size according to which basisbody size the "
    "bib will be worn with, the neck measurement in the table below is the same as the neck "
    "measurement on the matching basisbody size.")
storrelse_head = {'no': ['Størrelse', 'Bredde ved bryst', 'Ferdig lengde', 'Bredde øverst', 'Halsmål (basisbody)'],
                   'en': ['Size', 'Width at chest', 'Finished length', 'Width at top edge', 'Neck size (basisbody)']}
add('storrelse_head', storrelse_head['no'], storrelse_head['en'])
storrelse_rows = []
for s in SIZES:
    storrelse_rows.append((s['no'], f"{s['widest_cm']} cm", f"{s['length_cm']} cm",
                            f"{s['top_edge_cm']} cm", f"{s['neck_circ_cm']} cm"))
add('storrelse_rows_data', storrelse_rows)
add('storrelse_note',
    'Bredden ved bryst er ca. 60 % av basisbodyens brystvidde for tilsvarende størrelse, smekken '
    'skal dekke brystpartiet foran, ikke gå hele veien rundt.',
    "The width at the chest is approx. 60% of the basisbody's chest width for the matching size, the "
    'bib is meant to cover the front of the chest, not go all the way around.')

# ---------------------------------------------------------------- SIDE 5: FASTHET
add('banner_fasthet', 'STRIKKEFASTHET OG VANSKELIGHETSGRAD', 'GAUGE AND DIFFICULTY LEVEL')
add('pill_fasthet', 'FASTHET', 'GAUGE')
add('fasthet_txt',
    '22 masker og 30 omganger glattstrikk = 10 x 10 cm, på pinne 4 mm, samme fasthet som Woodland '
    'Dreams basisbody. Denne fastheten er brukt i alle beregninger i oppskriften. Strikk alltid en '
    'prøvelapp først, se side 3. Stemmer ikke fastheten din, bytt til tynnere eller tykkere pinne '
    'til den stemmer, ikke bare til garnet.',
    '22 stitches and 30 rows in stockinette stitch = 10 x 10 cm, on 4 mm needles, the same gauge as '
    'the Woodland Dreams basisbody. This gauge is used in every calculation in the pattern. Always '
    'knit a swatch first, see page 3. If your gauge does not match, change to a smaller or larger '
    'needle until it does, not just to match the yarn.')
add('pill_vanskelig', 'VANSKELIGHETSGRAD', 'DIFFICULTY LEVEL')
add('vanskelig_txt',
    'Lett til middels. Smekken har ingen komplisert form, du trenger bare å beherske glattstrikk, '
    'rettstrikk, enkel øking og felling, og strikking fram og tilbake på rettpinne. Et fint '
    'nybegynnerprosjekt etter basisbodyen.',
    'Easy to medium. The bib has no complicated shaping, you only need to be comfortable with '
    'stockinette stitch, garter stitch, simple increasing and decreasing, and knitting back and '
    'forth on straight needles. A nice beginner project to follow the basisbody.')

# ---------------------------------------------------------------- SIDE 6: FORKORTELSER
add('banner_ord', 'FORKORTELSER', 'ABBREVIATIONS')
add('ord_lead',
    'Norske strikkeuttrykk med engelske termer ved siden av.',
    'Norwegian knitting terms with the English terms alongside.')
ord_head = {'no': ['Norsk', 'Engelsk', 'Betyr'], 'en': ['Norwegian', 'English', 'Meaning']}
add('ord_head', ord_head['no'], ord_head['en'])
ord_rows = [
    ('r', 'K', 'rett'),
    ('rettstrikk', 'garter st', 'strikk rett på begge sider (rader)'),
    ('glattstrikk', 'stockinette st', 'r på retten, vr på vrangen'),
    ('m', 'st(s)', 'maske(r)'),
    ('rad', 'row', 'rad (fram-og-tilbake-strikking)'),
    ('øk', 'inc/M1', 'øk (ta opp én tilleggsmaske)'),
    ('felle', 'dec', 'felle (strikk to masker sammen)'),
    ('r-felling', 'k2tog', 'strikk 2 r sammen (hellende høyre)'),
    ('vr-felling', 'ssk', 'løft av, løft av, strikk sammen (hellende venstre)'),
    ('i-cord', 'i-cord', 'strikket "snor" på 3-4 masker, strikket rett hver rad, aldri snudd'),
    ('fell av', 'BO', 'fell av / bind off'),
    ('legg opp', 'CO', 'legg opp masker'),
    ('rettpinne', 'straight needle', 'rett/enkeltpinne'),
    ('rundpinne', 'circular needle', 'rundpinne'),
    ('maskemarkør', 'st marker', 'maskemarkør'),
]
add('ord_rows', ord_rows)
add('pill_tips', 'TIPS', 'TIPS')
tips_no = [
    'Hold de ytterste maskene på hver side i rettstrikk gjennom hele smekken, uansett hvilken '
    'seksjon du er i, det er det som gir den flate, ikke-rullende kanten.',
    'Øk eller fell alltid rett innenfor kantmaskene, aldri i selve kanten, da beholder kanten samme '
    'bredde fra topp til bunn.',
    'Tell maskene dine ved hvert kontrollpunkt i tabellene. Det er lettere å rette en feil på 4 '
    'rader enn på 40.',
]
tips_en = [
    'Keep the outermost stitches on each side in garter stitch through the whole bib, no matter '
    'which section you are in, that is what gives the flat, non-curling border.',
    'Always increase or decrease just inside the border stitches, never in the border itself, that '
    'way the border keeps the same width from top to bottom.',
    'Count your stitches at every checkpoint in the tables. It is easier to fix a mistake 4 rows '
    'back than 40.',
]
add('tips', tips_no, tips_en)

# ---------------------------------------------------------------- SIDE 7: KONSTRUKSJONSOVERSIKT
add('banner_oversikt', 'SLIK ER SMEKKEN BYGD OPP', 'HOW THE BIB IS CONSTRUCTED')
add('oversikt_lead',
    'Smekken strikkes flatt, i ett stykke, ovenfra og ned. Fire enkle deler, i denne rekkefølgen:',
    'The bib is knitted flat, in one piece, top-down. Four simple parts, in this order:')
oversikt_deler = [
    ('1. Øverste kant', 'Legg opp i halskanten, strikk noen rader rettstrikk.',
     '1. Top edge', 'Cast on at the neck edge, work a few rows of garter stitch.'),
    ('2. Øking til bredeste punkt', 'Øk jevnt på hver side, hver rad, til smekken dekker brystet.',
     '2. Increase to the widest point', 'Increase evenly on each side, every row, until the bib '
     'covers the chest.'),
    ('3. Rett strikking og hjørneavrunding', 'Strikk rett fram, rund så av de to nedre hjørnene og '
     'fell av.', '3. Straight section and corner rounding', 'Knit straight, then round off the two '
     'lower corners and bind off.'),
    ('4. Lukking', 'Fest i-cord-bånd i de øvre hjørnene, eller strikk en knapp-og-løkke-lukking bak '
     'i nakken.', '4. Closure', 'Attach i-cord ties at the top corners, or knit a button-and-loop '
     'closure at the back of the neck.'),
]
add('oversikt_deler_data', oversikt_deler)

# ---------------------------------------------------------------- SIDE 8: DEL 1, ØVERSTE KANT
add('banner_topp', 'DEL 1: ØVERSTE KANT', 'PART 1: THE TOP EDGE')
add('topp_lead',
    'Smekken legges opp øverst, ved halskanten, og strikkes flatt fram og tilbake, aldri rundt. '
    'Legg opp masketallet for din størrelse fra tabellen på neste side. De ytterste {border_sts} '
    'maskene på hver side strikkes i rettstrikk gjennom HELE smekken, uansett hvilken seksjon du er '
    'i, det er disse kantmaskene som gir den flate, ikke-rullende finishen rundt hele plagget.',
    'The bib is cast on at the top, at the neck edge, and knitted flat, back and forth, never in the '
    'round. Cast on the stitch count for your size from the table on the next page. The outermost '
    '{border_sts} stitches on each side are worked in garter stitch through the WHOLE bib, no matter '
    'which section you are in, these border stitches are what gives the flat, non-curling finish '
    'around the whole piece.')
add('topp_eksempel',
    'Eksempel, {no}: legg opp {top_co} masker. Strikk rett i {border_rows_top} rader (rettstrikk), '
    'dette blir den øverste kanten som møter halsen.',
    'Example, {en}: cast on {top_co} stitches. Knit plain for {border_rows_top} rows (garter '
    'stitch), this becomes the top edge that meets the neck.')
add('topp_note',
    'Nøyaktig masketall for din størrelse finner du i graderingstabellen på neste side.',
    'The exact stitch count for your size is in the grading table on the next page.')

# ---------------------------------------------------------------- SIDE 9: DEL 2, ØKING
add('banner_oking', 'DEL 2: ØKING TIL BREDESTE PUNKT', 'PART 2: INCREASE TO THE WIDEST POINT')
add('oking_lead',
    'Bytt til glattstrikk over midtpartiet, men behold de {border_sts} kantmaskene på hver side i '
    'rettstrikk. Nå økes det jevnt på hver side, til smekken er bred nok til å dekke brystet. '
    'Konstruksjonen er lik for alle størrelser, det er bare tallene som endrer seg, se '
    'graderingstabellen under.',
    'Switch to stockinette stitch over the centre section, but keep the {border_sts} border '
    'stitches on each side in garter stitch. Now increase evenly on each side, until the bib is '
    'wide enough to cover the chest. The construction is the same for every size, only the numbers '
    'change, see the grading table below.')
add('oking_metode',
    'Økerad (hver rad, både rett- og vrangsiden): strikk kantmaskene, øk 1 maske, strikk til det '
    'gjenstår like mange masker som kantbredden, øk 1 maske til, strikk kantmaskene. Det økes altså '
    '1 maske på hver side, hver eneste rad, ingen "hvilerader" imellom, dette gir en jevn, diagonal '
    'kantlinje uten trappetrinn.',
    'Increase row (every row, both the right and wrong side): work the border stitches, increase 1 '
    'stitch, knit until the same number of stitches as the border width remain, increase 1 more '
    'stitch, work the border stitches. So 1 stitch is increased on each side, every single row, with '
    'no plain rows in between, this gives a smooth, diagonal edge line with no stair-stepping.')
oking_head = {'no': ['Størrelse', 'Legg opp øverst', 'Antall økerader', 'Masker v/bredeste punkt', 'Bredde v/bredeste punkt'],
              'en': ['Size', 'Cast on at top', 'Increase rows', 'Sts at widest point', 'Width at widest point']}
add('oking_head', oking_head['no'], oking_head['en'])
oking_rows = []
for s in SIZES:
    oking_rows.append((s['no'], str(s['top_co']), str(s['inc_rows_count']), str(s['widest_sts']),
                        f"{s['widest_cm']} cm"))
add('oking_rows_data', oking_rows)
add('oking_ferdig',
    'Kontroll: tell maskene dine. De skal stemme med tallet i kolonnen "Masker v/bredeste punkt" '
    'for din størrelse, før du går videre til del 3.',
    'Check: count your stitches. They should match the number in the "Sts at widest point" column '
    'for your size, before you move on to part 3.')

# ---------------------------------------------------------------- SIDE 10: DEL 3, RETT STRIKKING OG AVRUNDING
add('banner_rett', 'DEL 3: RETT STRIKKING, HJØRNEAVRUNDING OG AVFELLING', 'PART 3: STRAIGHT SECTION, CORNER ROUNDING AND BIND-OFF')
add('rett_lead',
    'Strikk nå rett fram, uten øking eller felling, i det antall rader som står i tabellen for din '
    'størrelse. Dette er partiet som dekker det meste av brystet.',
    'Now knit straight, with no increasing or decreasing, for the number of rows given in the table '
    'for your size. This is the section that covers most of the chest.')
add('rett_avrunding',
    'Hjørneavrunding: fell 1 maske rett innenfor kantmaskene på hver side, hver rad, i det antall '
    'rader som står i tabellen. Dette runder av de to nedre hjørnene på smekken, i stedet for '
    'skarpe rette vinkler.',
    'Corner rounding: decrease 1 stitch just inside the border stitches on each side, every row, for '
    'the number of rows given in the table. This rounds off the two lower corners of the bib, '
    'instead of sharp right angles.')
add('rett_avfelling',
    'Strikk til slutt rett i det antall rader som står i kolonnen "Rader nederste kant", dette blir '
    'en rettstrikk-kant langs bunnen, i tillegg til sidekantene. Fell av alle masker rett, ikke for '
    'stramt, slik at bunnkanten ligger flatt.',
    'Finally knit plain for the number of rows given in the "Rows at bottom edge" column, this '
    'becomes a garter-stitch border along the bottom, in addition to the side borders. Bind off all '
    'stitches knitwise, not too tightly, so the bottom edge lies flat.')
rett_head = {'no': ['Størrelse', 'Rader rett strikking', 'Rader hjørneavrunding', 'Masker etter avrunding', 'Rader nederste kant', 'Ferdig lengde'],
             'en': ['Size', 'Rows straight', 'Rows corner rounding', 'Sts after rounding', 'Rows at bottom edge', 'Finished length']}
add('rett_head', rett_head['no'], rett_head['en'])
rett_rows = []
for s in SIZES:
    rett_rows.append((s['no'], str(s['straight_rows']), str(s['taper_rows']), str(s['bottom_sts']),
                       str(s['border_rows_bottom']), f"{s['length_cm']} cm"))
add('rett_rows_data', rett_rows)

# ---------------------------------------------------------------- SIDE 11: LUKKING
add('banner_lukking', 'LUKKING: I-CORD-BÅND ELLER KNAPP OG LØKKE', 'CLOSURE: I-CORD TIES OR BUTTON AND LOOP')
add('lukking_lead',
    'Velg én av de to løsningene under. Begge festes til de to øverste hjørnene av smekken (der '
    'oppleggingen var), rett ved halskanten. Les alltid sikkerhetsavsnittet på side 13 før du '
    'bestemmer deg, spesielt om smekken skal brukes uten tilsyn i korte perioder.',
    'Choose one of the two options below. Both are attached to the two top corners of the bib '
    '(where the cast-on was), right at the neck edge. Always read the safety section on page 13 '
    'before deciding, especially if the bib will be worn unsupervised for short periods.')
add('pill_icord', 'ALTERNATIV A: I-CORD-BÅND', 'OPTION A: I-CORD TIES')
add('icord_txt',
    'Ta opp 3 masker i hvert av de to øvre hjørnene. Strikk i-cord (strikk rett, skyv maskene '
    'tilbake til venstre pinneende uten å snu arbeidet, strikk rett igjen, gjenta) til båndet måler '
    'lengden som står i tabellen under for din størrelse. Fell av. Gjenta på det andre hjørnet. '
    'Båndene knytes i en enkel sløyfe bak i nakken når smekken tas på.',
    'Pick up 3 stitches at each of the two top corners. Work i-cord (knit, slide the stitches back '
    'to the left needle tip without turning the work, knit again, repeat) until the tie measures the '
    'length given in the table below for your size. Bind off. Repeat at the other corner. The ties '
    'are tied in a simple bow at the back of the neck when the bib is put on.')
icord_head = {'no': ['Størrelse', 'Anbefalt lengde pr. bånd', 'Halsmål (basisbody)'],
              'en': ['Size', 'Recommended length per tie', 'Neck size (basisbody)']}
add('icord_head', icord_head['no'], icord_head['en'])
icord_rows = []
for s in SIZES:
    icord_rows.append((s['no'], f"{s['tie_length_cm']} cm", f"{s['neck_circ_cm']} cm"))
add('icord_rows_data', icord_rows)
add('pill_knapp', 'ALTERNATIV B: KNAPP OG LØKKE', 'OPTION B: BUTTON AND LOOP')
add('knapp_txt',
    'Rask å ta på og av, fin til hverdagsbruk. På det ene øvre hjørnet, hekle en liten løkke '
    '(ca. 2,5 cm) med heklenål 3 mm, stor nok til å gå rundt treknappen. På det andre øvre hjørnet, '
    'sy fast én liten, rund treknapp. Løkken og knappen møtes bak i nakken når smekken tas på. '
    'Samme løkkestørrelse brukes for alle størrelser, den tilpasses etter knappens diameter, ikke '
    'barnets størrelse.',
    'Quick to put on and take off, nice for everyday use. At one of the top corners, crochet a '
    'small loop (approx. 2.5 cm) with a 3 mm crochet hook, large enough to fit around the wooden '
    'button. At the other top corner, sew on one small, round wooden button. The loop and button '
    'meet at the back of the neck when the bib is put on. The same loop size is used for every '
    'size, it is sized to the button, not to the size of the child.')

# ---------------------------------------------------------------- SIDE 12: MONTERING
add('banner_montering', 'MONTERING', 'FINISHING')
montering_no = [
    'Fest alle løse tråder godt på vrangen, og klipp dem korte.',
    'Fest i-cord-båndene eller sy på knappen og løkken, se forrige side for din valgte løsning.',
    'Damp press smekken lett på vrangen, unngå å presse direkte på rettstrikk-kantene, de skal '
    'beholde den flate, ikke-rullende finishen sin.',
    'Kontroller til slutt at knappen (om brukt) sitter godt fast, og at i-cord-båndene (om brukt) '
    'er festet forsvarlig i begge hjørner.',
]
montering_en = [
    'Weave in all loose ends securely on the wrong side, and trim them short.',
    'Attach the i-cord ties or sew on the button and loop, see the previous page for your chosen '
    'option.',
    'Lightly steam-block the bib on the wrong side, avoid pressing directly on the garter-stitch '
    'borders, they should keep their flat, non-curling finish.',
    'Finally, check that the button (if used) is securely attached, and that the i-cord ties (if '
    'used) are firmly fastened at both corners.',
]
add('montering_steg', montering_no, montering_en)

# ---------------------------------------------------------------- SIDE 13: SIKKERHET OG STELL
add('banner_sikkerhet', 'SIKKERHET OG STELL', 'SAFETY AND CARE')
add('pill_sikkerhet', 'SIKKERHET', 'SAFETY')
sik_no = [
    'Et plagg som knytes eller festes rundt halsen er ALDRI ment å bæres uten tilsyn, verken i '
    'lek, i vogn, i bilstol, i seng eller under søvn/hvile. Ta alltid av smekken før barnet legges '
    'til å sove eller er alene.',
    'I-cord-båndene skal aldri knytes strammere enn at du enkelt får to fingre inn mellom båndet og '
    'halsen, og sløyfen skal alltid være løs nok til å kunne dras opp igjen med én bevegelse hvis '
    'noe skjer.',
    'Foretrekker du en løsning uten lange bånd som kan floke seg eller strammes til, velg '
    'knapp-og-løkke-alternativet i stedet for i-cord-bånd.',
    'Bruk alltid en liten, godt festet treknapp, sy den fast med dobbel tråd, flere ganger gjennom '
    'hvert hull, og kontroller den jevnlig, spesielt etter vask.',
    'Denne oppskriften er ikke ment for barn som putter små gjenstander i munnen uten tilsyn. La '
    'aldri barnet være alene med smekken på uten oppsyn.',
    'Alle mål og masketall i denne oppskriften er beregnet for en komfortabel passform, ikke en '
    'sikkerhetstestet passform, følg alltid gjeldende sikkerhetsanbefalinger for barneklær og '
    'plagg som festes rundt halsen.',
]
sik_en = [
    'A garment that ties or fastens around the neck is NEVER meant to be worn unsupervised, whether '
    'during play, in a stroller, in a car seat, in bed, or during sleep/rest. Always remove the bib '
    'before the baby is put down to sleep or left alone.',
    'The i-cord ties should never be tied tighter than you can easily fit two fingers between the '
    'tie and the neck, and the bow should always be loose enough to be pulled open again in one '
    'motion if something happens.',
    'If you prefer an option without long ties that could tangle or tighten, choose the '
    'button-and-loop option instead of the i-cord ties.',
    'Always use a small, securely attached wooden button, sew it on with double thread, several '
    'times through each hole, and check it regularly, especially after washing.',
    'This pattern is not intended for children who put small objects in their mouth unsupervised. '
    'Never leave a baby alone and unsupervised while wearing the bib.',
    'All measurements and stitch counts in this pattern are calculated for a comfortable fit, not a '
    'safety-tested fit, always follow current safety recommendations for children\'s clothing and '
    'garments that fasten around the neck.',
]
add('sikkerhet_txt', sik_no, sik_en)
add('pill_stell', 'VASKERÅD', 'CARE INSTRUCTIONS')
add('stell_txt',
    'Håndvask forsiktig i lunkent vann med ullvask, eller maskinvask på ullprogram 30 grader. Press '
    'ut vannet, trekk i fasong, og tørk liggende flatt på et håndkle. Unngå å henge smekken til '
    'tørk, alpakka kan strekke seg.',
    'Hand wash gently in lukewarm water with wool wash, or machine wash on a wool cycle at 30 '
    'degrees. Press out the water, ease into shape, and dry lying flat on a towel. Avoid hanging '
    'the bib up to dry, alpaca can stretch out of shape.')

# ---------------------------------------------------------------- SIDE 14: FERDIG
add('banner_ferdig', 'FERDIG!', 'ALL DONE!')
add('ferdig_txt',
    'Gratulerer, smekken din er ferdig! Den er laget for å passe sammen med basisbodyen, og for å '
    'bli en del av hele «Woodland Dreams»-kolleksjonen.',
    'Congratulations, your bib is finished! It is made to fit together with the basisbody, and to '
    'be part of the whole «Woodland Dreams» collection.')
add('pill_kolleksjon', 'RESTEN AV KOLLEKSJONEN', 'THE REST OF THE COLLECTION')
kolliste_no = [
    'Basisbody, grunnmuren i kolleksjonen, en tidløs, unisex body i glattstrikk.',
    'Blondekrage, en løs krage som hekter bak.',
    'Rysjekrage, samme feste, litt mer romantisk.',
    'Peter Pan-krage, en klassisk avrundet krage.',
    'I-cord-seler, kolleksjonens signaturdel, justerbare og krysser bak.',
    'Kort vest, med treknapper foran, brukes utenpå bodyen.',
    'Woodland Fluffy Skirt, et heklet skjørt laget for å matche bodyen.',
]
kolliste_en = [
    'Basisbody, the foundation of the collection, a timeless, unisex body in stockinette stitch.',
    'Lace collar, a loose collar that fastens at the back.',
    'Ruffle collar, the same fastening, a little more romantic.',
    'Peter Pan collar, a classic rounded collar.',
    "I-cord suspenders, the collection's signature piece, adjustable and crossing at the back.",
    'Short vest, with wooden buttons at the front, worn over the body.',
    'Woodland Fluffy Skirt, a crocheted skirt made to match the body.',
]
add('kolleksjon_liste', kolliste_no, kolliste_en)
add('pill_copyright', 'OPPHAVSRETT', 'COPYRIGHT')
add('copyright_txt',
    '(c) Renate Dahl, Little Montessori Explorers. Denne oppskriften er et helt originalt '
    'LME-design. Du står fritt til å selge ferdige plagg du lager etter denne oppskriften, i liten, '
    'personlig skala, forutsatt at det ferdige produktet er sjekket mot gjeldende '
    'sikkerhetskrav. Selve oppskriften, teksten og bildene, kan ikke deles, kopieres eller selges '
    'videre.',
    '(c) Renate Dahl, Little Montessori Explorers. This pattern is a fully original LME design. You '
    'are welcome to sell finished garments you make from this pattern, on a small personal scale, '
    'provided the finished product is checked against current safety requirements. The pattern '
    'itself, its text and images, may not be shared, copied or resold.')

# ================================================================== BYGG SIDENE

def build(lang):
    RIGHT = {'no': 'LME STRIKKING', 'en': 'LME KNITTING'}[lang]
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
<div class="notecard"><span class="noteemo">&#129517;</span><p><i>{t('cover_tip')}</i></p></div>
''', 1))

    pages.append(pg(f'''
{banner(t('banner_om'))}
{rosep(t('pill_del'))}
{card('<p>' + t('om_del') + '</p>')}
{sagep(t('pill_stil'))}
{card('<p>' + t('om_stil') + '</p>')}
{rosep(t('pill_lukking0'))}
{cme(t('om_lukking0'))}
''', 2))

    forbruk_html = '<table class="t"><tr><th>' + {'no':'Størrelse','en':'Size'}[lang] + '</th><th>' + \
        {'no':'Garnforbruk','en':'Yarn amount'}[lang] + '</th></tr>' + \
        ''.join(f"<tr><td><b>{s['no'] if lang=='no' else s['en']}</b></td><td>{s['yarn_g_low']}-{s['yarn_g_high']} g</td></tr>"
                for s in SIZES) + '</table>'
    pages.append(pg(f'''
{banner(t('banner_mat'))}
{rosep(t('pill_garn'))}
{card('<p>' + t('garn_txt') + '</p>')}
{sagep(t('pill_forbruk'))}
{card(forbruk_html)}
{rosep(t('pill_pinner'))}
{card('<p>' + t('pinner_txt') + '</p>')}
{sagep(t('pill_provelapp'))}
{cme(t('provelapp_txt'))}
''', 3))

    st_table = '<table class="t"><tr><th>' + '</th><th>'.join(t('storrelse_head')) + '</th></tr>' + \
        ''.join(f'<tr><td><b>{a}</b></td><td>{b}</td><td>{c}</td><td>{d}</td><td>{e}</td></tr>'
                for a, b, c, d, e in T['storrelse_rows_data']['no']) + '</table>'
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

    s0 = SIZES[0]
    topp_lead = t('topp_lead').format(border_sts=s0['border_sts'])
    label0 = s0['no'] if lang == 'no' else s0['en']
    topp_ex = t('topp_eksempel').format(no=label0, en=label0, top_co=s0['top_co'],
                                         border_rows_top=s0['border_rows_top'])
    pages.append(pg(f'''
{banner(t('banner_topp'))}
<p>{topp_lead}</p>
{card('<p>' + topp_ex + '</p>')}
<p class="small center">{t('topp_note')}</p>
''', 8))

    oking_lead = t('oking_lead').format(border_sts=s0['border_sts'])
    oking_table = '<table class="t"><tr><th>' + '</th><th>'.join(t('oking_head')) + '</th></tr>' + \
        ''.join(f'<tr><td><b>{a}</b></td><td>{b}</td><td>{c}</td><td>{d}</td><td>{e}</td></tr>'
                for a, b, c, d, e in T['oking_rows_data']['no']) + '</table>'
    pages.append(pg(f'''
{banner(t('banner_oking'))}
<p>{oking_lead}</p>
{card('<p>' + t('oking_metode') + '</p>')}
{card(oking_table)}
{cme(t('oking_ferdig'))}
''', 9))

    rett_table = '<table class="t"><tr><th>' + '</th><th>'.join(t('rett_head')) + '</th></tr>' + \
        ''.join(f'<tr><td><b>{a}</b></td><td>{b}</td><td>{c}</td><td>{d}</td><td>{e}</td><td>{f}</td></tr>'
                for a, b, c, d, e, f in T['rett_rows_data']['no']) + '</table>'
    pages.append(pg(f'''
{banner(t('banner_rett'))}
<p>{t('rett_lead')}</p>
{card('<p>' + t('rett_avrunding') + '</p>')}
{card(rett_table)}
{cme(t('rett_avfelling'))}
''', 10))

    icord_table = '<table class="t"><tr><th>' + '</th><th>'.join(t('icord_head')) + '</th></tr>' + \
        ''.join(f'<tr><td><b>{a}</b></td><td>{b}</td><td>{c}</td></tr>'
                for a, b, c in T['icord_rows_data']['no']) + '</table>'
    pages.append(pg(f'''
{banner(t('banner_lukking'))}
<p>{t('lukking_lead')}</p>
{rosep(t('pill_icord'))}
{card('<p>' + t('icord_txt') + '</p>' + icord_table)}
{sagep(t('pill_knapp'))}
{cme(t('knapp_txt'))}
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
    out = BASE / f'smekke_{lang}.html'
    out.write_text(html_doc, encoding='utf-8')
    print('OK', lang, len(html_doc), 'tegn/chars')
