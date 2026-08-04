# -*- coding: utf-8 -*-
"""Genererer LME-strikkeoppskrift 'Woodland Dreams Peter Pan-krage'
(norsk + engelsk) som HTML, klar for PDF-print med Chromium. Tredje del
av strikkekolleksjonen LME Woodland Dreams (basisbody + 6 tilbehørsdeler
+ Woodland Fluffy Skirt).

Helt original LME-konstruksjon: en løs, avrundet Peter Pan-krage som
festes bak med knapp og heklet løkke. Strikkes flatt i to like halvdeler,
sidelengs (radene følger halskanten, masketallet pr rad er kragedybden),
med garterstrikk-kant rundt hele ytterkanten. Fasthet 22 m = 10 cm /
30 o = 10 cm på 4 mm pinne, Sandnes Garn Alpakka, samme fasthet som
basisbodyen. Graderingstallene er beregnet og verifisert i grading.py
(se sizes_collar.json), ikke frihåndstall.
"""
import pathlib, sys, json

BASE = pathlib.Path(__file__).parent
sys.path.insert(0, str(BASE.parent.parent / 'hekle' / '_shared'))
import lme_pattern_kit as kit
from lme_pattern_kit import (banner, rosep, sagep, card, cream, cme, ul, steps, abbrtab)

SIZES = json.loads(BASE.joinpath('sizes_collar.json').read_text(encoding='utf-8'))

T = {}
def add(key, no, en=None):
    T[key] = {'no': no, 'en': en if en is not None else no}

# ---------------------------------------------------------------- SIDE 1: FORSIDE
add('doctitle', 'Woodland Dreams Peter Pan-krage, LME strikkeoppskrift',
    'Woodland Dreams Peter Pan Collar, LME knitting pattern')
add('ph2', 'LME STRIKKEOPPSKRIFT&nbsp;&nbsp;|&nbsp;&nbsp;WOODLAND DREAMS PETER PAN-KRAGE',
    'LME KNITTING PATTERN&nbsp;&nbsp;|&nbsp;&nbsp;WOODLAND DREAMS PETER PAN COLLAR')
add('covertag', 'LME STRIKKEOPPSKRIFT - TILBEHØR', 'LME KNITTING PATTERN - ACCESSORY')
add('covertitle', 'PETER PAN-KRAGE', 'PETER PAN COLLAR')
add('subpill', 'LME BABY COLLECTION - WOODLAND DREAMS', 'LME BABY COLLECTION - WOODLAND DREAMS')
add('cover_desc',
    'En klassisk, avrundet krage i glattstrikk med garterstrikk-kant: strikkes i to '
    'like, avrundede halvdeler som møter hverandre midt front, og festes bak med en '
    'liten treknapp og en heklet løkke. Kragen er løs, ikke tettsittende, og legges '
    'over halsen og skuldrene på Woodland Dreams-basisbodyen. Syv størrelser, fra '
    '0-1 til 18-24 måneder, tilpasset basisbodyens egen halsvidde i hver størrelse.',
    'A classic, rounded collar in stockinette stitch with a garter-stitch border: '
    'knitted in two matching rounded halves that meet at centre front, and fastens at '
    'the back with a small wooden button and a crocheted loop. The collar is loose, '
    'not close-fitting, and sits over the neck and shoulders of the Woodland Dreams '
    'basisbody. Seven sizes, from 0-1 to 18-24 months, matched to the '
    "basisbody's own neck width in every size.")
add('by1', 'Av Renate Dahl', 'By Renate Dahl')
add('by2', 'Little Montessori Explorers', 'Little Montessori Explorers')
add('by3', 'lmexplorers.com', 'lmexplorers.com')
add('cover_tip',
    'TIPS: Les hele oppskriften og størrelsestabellen på side 4 før du starter, og '
    'strikk en prøvelapp på 15 x 15 cm for å sjekke strikkefastheten din, siden all '
    'gradering i denne oppskriften er beregnet ut fra nettopp denne fastheten.',
    'TIP: Read through the whole pattern and the size chart on page 4 before you '
    'start, and knit a 15 x 15 cm gauge swatch to check your tension, since every '
    'size in this pattern is calculated directly from this gauge.')

# ---------------------------------------------------------------- SIDE 2: OM
add('banner_om', 'OM PETER PAN-KRAGEN', 'ABOUT THE PETER PAN COLLAR')
add('pill_del', 'DEL AV KOLLEKSJONEN', 'PART OF THE COLLECTION')
add('om_del',
    'Peter Pan-kragen er tredje del av LME Woodland Dreams, etter basisbodyen og '
    'blondekragen. Den er den mest klassiske av kragene i kolleksjonen: en flat, '
    'avrundet form med to myke fliker som møter hverandre midt front, samme fasong '
    'som en tradisjonell skjortekrage på barneklær.',
    'The Peter Pan collar is the third piece in LME Woodland Dreams, after the '
    'basisbody and the lace collar. It is the most classic of the collars in the '
    'collection: a flat, rounded shape with two soft lobes meeting at centre front, '
    'the same silhouette as a traditional shirt collar on childrenswear.')
add('pill_stil', 'STIL', 'STYLE')
add('om_stil',
    'Rolig og tidløs, uten volanger eller hulmønster, bare den rene, avrundede '
    'formen selv. Kragen strikkes i en av kolleksjonens tilbehørsfarger, som kontrast '
    'til basisbodyens rolige nyanser.',
    'Calm and timeless, with no ruffles or lace pattern, just the clean, rounded '
    "shape itself. The collar is knitted in one of the collection's accessory "
    "colours, as a contrast to the basisbody's calm neutral shades.")
add('pill_passform', 'LØS PASSFORM, FESTES BAK', 'A LOOSE FIT, FASTENS AT THE BACK')
add('om_passform',
    'Kragen er ikke strikket tettsittende rundt halsen, den er løs og hviler over '
    'skuldrene, akkurat som en løst påført krage over et plagg. Den lukkes bak med en '
    'liten treknapp og en heklet løkke, så den er enkel å ta av og på uten å dra den '
    'over hodet.',
    'The collar is not knitted close-fitting around the neck, it is loose and rests '
    'over the shoulders, just like a collar layered on top of a garment. It closes '
    'at the back with a small wooden button and a crocheted loop, so it is easy to '
    "put on and take off without pulling it over the baby's head.")

# ---------------------------------------------------------------- SIDE 3: MATERIALER
add('banner_mat', 'MATERIALER', 'MATERIALS')
add('pill_garn', 'GARN OG FARGE', 'YARN AND COLOUR')
add('garn_txt',
    'Sandnes Garn Alpakka (100 % alpakka), eller et tilsvarende garn med samme '
    'fasthet, samme garn som basisbodyen. Siden kragen er et tilbehør, velges den i '
    'en av kolleksjonens tilbehørsfarger: salviegrønn, dusty rose, smørgul, lyseblå, '
    'oliven eller terrakotta, som en fin kontrast til bodyens rolige nyanser (krem, '
    'lin, sand, havre eller beige).',
    'Sandnes Garn Alpakka (100% alpaca), or an equivalent yarn with the same gauge, '
    "the same yarn as the basisbody. Since the collar is an accessory, it is knitted "
    'in one of the collection\'s accessory colours: sage green, dusty rose, butter '
    'yellow, soft blue, olive or terracotta, as a nice contrast to the '
    "body's calm neutral shades (cream, linen, sand, oatmeal or beige).")
GARNFORBRUK = [(s['no'], f"{s['yarn_g_low']}-{s['yarn_g_high']} g") for s in SIZES]
add('pill_forbruk', 'GARNFORBRUK', 'YARN REQUIREMENTS')
add('pill_pinner', 'PINNER OG TILBEHØR', 'NEEDLES AND NOTIONS')
add('pinner_txt',
    'Rettpinner eller rundpinne 4 mm (kragen strikkes flatt, fram og tilbake). En '
    'liten, rund treknapp. Heklenål 3 mm til knappeløkka. Synål til sammensying og '
    'festing av knapp. Maskemarkører er ikke nødvendig, det er ingen omganger å '
    'holde styr på.',
    'Straight needles or a circular needle 4 mm (the collar is worked flat, back and '
    'forth). One small, round wooden button. A 3 mm crochet hook for the button '
    'loop. A tapestry needle for seaming and attaching the button. Stitch markers '
    'are not needed, there are no rounds to keep track of.')
add('pill_swatch', 'PRØVELAPP', 'GAUGE SWATCH')
add('swatch_txt',
    'Legg opp 26 masker, strikk glattstrikk i ca. 12 cm, fell av og press lett. Tell '
    'maskene dine over 10 cm. Stemmer ikke fastheten din med 22 m = 10 cm, bytt til '
    'tynnere eller tykkere pinne til den stemmer.',
    'Cast on 26 stitches, work stockinette stitch for approx. 12 cm, bind off and '
    'block lightly. Count your stitches over 10 cm. If your gauge does not match 22 '
    'sts = 10 cm, change to a smaller or larger needle until it does.')

# ---------------------------------------------------------------- SIDE 4: STØRRELSESTABELL
add('banner_storrelse', 'STØRRELSESTABELL', 'SIZE CHART')
add('storrelse_lead',
    'Kragen er tilpasset halsvidden på Woodland Dreams-basisbodyen i samme '
    'størrelse. Velg samme størrelse på kragen som på bodyen den skal brukes til.',
    'The collar is matched to the neck width of the Woodland Dreams basisbody in the '
    'same size. Choose the same size for the collar as for the body it will be worn '
    'with.')
storrelse_head = {'no': ['Størrelse', 'Bodyens halsvidde', 'Ferdig kragedybde', 'Rader pr halvdel'],
                   'en': ['Size', "Body's neck width", 'Finished collar depth', 'Rows per half']}
add('storrelse_head', storrelse_head['no'], storrelse_head['en'])
storrelse_rows = [(s['no'], f"{s['neck_circ_cm']} cm", f"{s['finished_depth_total_cm']} cm",
                    str(s['half_neck_rows'])) for s in SIZES]
add('storrelse_rows_data', storrelse_rows)
add('storrelse_note',
    'Kragedybden er målt fra halskanten til ytterkanten, inkludert garterstrikk-'
    'kanten. Kragen er løs og skal ikke stramme rundt halsen, målene er derfor ikke '
    'en "sitter tett"-passform, men den løst hengende kragens egne mål.',
    'The collar depth is measured from the neck edge to the outer edge, including '
    'the garter-stitch border. The collar is loose and should not pull tight around '
    'the neck, so the measurements are not a "snug fit" but the loose, draped '
    "collar's own measurements.")

# ---------------------------------------------------------------- SIDE 5: FASTHET
add('banner_fasthet', 'STRIKKEFASTHET OG VANSKELIGHETSGRAD', 'GAUGE AND DIFFICULTY LEVEL')
add('pill_fasthet', 'FASTHET', 'GAUGE')
add('fasthet_txt',
    '22 masker og 30 rader glattstrikk = 10 x 10 cm, på pinne 4 mm, samme fasthet '
    'som resten av Woodland Dreams-kolleksjonen. Denne fastheten er brukt i alle '
    'beregninger i oppskriften, både masketallene på hver rad og radtallet pr '
    'kragehalvdel. Strikk alltid en prøvelapp først, se materialer-siden.',
    '22 stitches and 30 rows in stockinette stitch = 10 x 10 cm, on 4 mm needles, '
    'the same gauge as the rest of the Woodland Dreams collection. This gauge is '
    'used in every calculation in the pattern, both the stitch counts on each row '
    'and the number of rows per collar half. Always knit a swatch first, see the '
    'materials page.')
add('pill_vanskelig', 'VANSKELIGHETSGRAD', 'DIFFICULTY LEVEL')
add('vanskelig_txt',
    'Lett til middels. Du bør beherske å strikke og strikke sammen (felle) i '
    'glattstrikk flatt fram og tilbake, ta opp masker langs en kant, og hekle en '
    'enkel luftmaskeløkke. Ingen mønsterstrikk, kragen er glattstrikk og '
    'garterstrikk.',
    'Easy to medium. You should be comfortable knitting and decreasing in '
    'stockinette stitch flat, back and forth, picking up stitches along an edge, '
    'and crocheting a simple chain loop. No stitch pattern, the collar is '
    'stockinette stitch and garter stitch.')

# ---------------------------------------------------------------- SIDE 6: FORKORTELSER
add('banner_ord', 'FORKORTELSER', 'ABBREVIATIONS')
add('ord_lead',
    'Norske strikke- og hekleuttrykk med engelske termer ved siden av.',
    'Norwegian knitting and crochet terms with the English terms alongside.')
ord_head = {'no': ['Norsk', 'Engelsk', 'Betyr'], 'en': ['Norwegian', 'English', 'Meaning']}
add('ord_head', ord_head['no'], ord_head['en'])
ord_rows = [
    ('r', 'K', 'rett'),
    ('vr', 'P', 'vrang'),
    ('garterstrikk', 'garter st', 'rett på alle rader (både RS og VS)'),
    ('m', 'st(s)', 'maske(r)'),
    ('rad', 'row', 'rad'),
    ('RS', 'RS', 'rettsiden av arbeidet'),
    ('VS', 'WS', 'vrangsiden av arbeidet'),
    ('øk', 'inc', 'øk (ta opp én tilleggsmaske)'),
    ('felle', 'dec', 'felle (strikk to masker sammen)'),
    ('ta opp m', 'pick up sts', 'ta opp masker langs en kant'),
    ('fell av', 'BO', 'fell av / bind off'),
    ('legg opp', 'CO', 'legg opp masker'),
    ('luftmaske', 'chain (ch)', 'heklet luftmaske'),
    ('heklenål', 'crochet hook', 'heklenål'),
]
add('ord_rows', ord_rows)
add('pill_tips', 'TIPS', 'TIPS')
tips_no = [
    'Strikk begge kragehalvdelene etter hverandre og legg dem ved siden av '
    'hverandre før du fester av, så ser du med en gang om de er like store.',
    'Radtallet i tabellene er nøyaktig fra graderingsberegningen, men tell alltid '
    'maskene dine ved det bredeste punktet (se kontroll i del 1) før du begynner å '
    'felle, det er lettere å rette opp der enn etter kanten er strikket ferdig.',
    'Bruk gjerne en avvikende hjelpetråd for å markere hver 10. rad mens du '
    'strikker økefeltet, det gjør det raskt å telle seg fram uten å telle helt fra '
    'start hver gang.',
]
tips_en = [
    'Knit both collar halves one after another and lay them side by side before '
    'weaving in ends, so you can see right away if they match in size.',
    'The row counts in the tables are exact from the grading calculation, but '
    'always count your stitches at the widest point (see the check in part 1) '
    'before you start decreasing, it is easier to fix there than after the edge is '
    'finished.',
    'Use a contrasting scrap of yarn to mark every 10th row while you knit the '
    'increase section, it makes it quick to count your place without starting from '
    'the beginning every time.',
]
add('tips', tips_no, tips_en)

# ---------------------------------------------------------------- SIDE 7: KONSTRUKSJONSOVERSIKT
add('banner_oversikt', 'SLIK ER KRAGEN BYGD OPP', 'HOW THE COLLAR IS CONSTRUCTED')
add('oversikt_lead',
    'Kragen strikkes flatt, i to like halvdeler, "sidelengs": hver rad du strikker '
    'følger halskanten (fra midt bak mot midt front), og antall masker på raden er '
    'kragens DYBDE i akkurat det punktet, ikke lengden langs halsen. Det er denne '
    'veksten og nedgangen i masketall, ikke i radtall, som lager den avrundede '
    'flik-fasongen. Fem enkle deler, i denne rekkefølgen:',
    'The collar is knitted flat, in two matching halves, "sideways": every row you '
    'knit follows the neck edge (from centre back towards centre front), and the '
    'number of stitches on the row is the collar\'s DEPTH at that exact point, not '
    'the length along the neck. It is this growth and shrinkage in stitch count, not '
    'row count, that creates the rounded lobe shape. Five simple parts, in this '
    'order:')
oversikt_deler = [
    ('1. Legg opp og øk', 'Legg opp ved bakhalskanten, øk jevnt ved ytterkanten til '
     'bredeste punkt (ved skulderen).', '1. Cast on and increase', 'Cast on at the '
     'back-neck edge, increase evenly at the outer edge until the widest point (at '
     'the shoulder).'),
    ('2. Bredeste punkt og felling', 'Strikk noen rader rett fram, fell så jevnt '
     'ned igjen til midt front.', '2. Widest point and decrease', 'Knit a few rows '
     'even, then decrease evenly back down towards centre front.'),
    ('3. Andre halvdel', 'Strikk en identisk halvdel til, sy de to sammen midt '
     'front.', '3. Second half', 'Knit an identical second half, sew the two '
     'together at centre front.'),
    ('4. Kant rundt ytterkanten', 'Ta opp masker langs hele ytterkanten, strikk en '
     'garterstrikk-kant, fell av.', '4. Border around the outer edge', 'Pick up '
     'stitches along the whole outer edge, knit a garter-stitch border, bind off.'),
    ('5. Lukking bak', 'Sy på knapp på den ene bakhalskanten, hekle en løkke på '
     'den andre.', '5. Back closure', 'Sew a button onto one back-neck edge, '
     'crochet a loop onto the other.'),
]
add('oversikt_deler_data', oversikt_deler)

# ---------------------------------------------------------------- SIDE 8: DEL 1 (LEGG OPP OG ØK)
add('banner_del1', 'DEL 1: LEGG OPP OG ØK', 'PART 1: CAST ON AND INCREASE')
add('del1_lead',
    'Legg opp {co_sts} masker (likt for alle størrelser). Dette er den lille, '
    'rette kanten som blir liggende ved bakhalsen. Strikk flatt, fram og tilbake, i '
    'glattstrikk (r på RS, vr på VS).',
    'Cast on {co_sts} stitches (the same for every size). This is the small, straight '
    'edge that sits at the back neck. Work flat, back and forth, in stockinette '
    'stitch (k on RS, p on WS).')
add('del1_metode',
    'Rad 1 (RS): strikk vanlig, uten øking. Deretter gjentas økefeltet: økerad '
    '(RS): øk 1 maske i enden ved YTTERKANTEN (den ene kortsiden av raden, ikke '
    'halskant-siden), strikk resten av raden vanlig; rad mellom (VS): strikk/vrang '
    'vanlig, uten øking. Halskant-siden holdes hele veien rett, uten øking eller '
    'felling, det er den kanten som blir liggende innerst.',
    'Row 1 (RS): knit plain, with no increase. Then repeat the increase section: '
    'increase row (RS): increase 1 stitch at the end at the OUTER EDGE (the one '
    'short side of the row, not the neck-edge side), knit the rest of the row '
    'plain; row in between (WS): knit/purl plain, with no increase. The neck-edge '
    'side is kept straight the whole time, with no increase or decrease, it is the '
    'edge that sits innermost.')
add('pill_del1_kontroll', 'ANTALL ØKINGER PR STØRRELSE', 'NUMBER OF INCREASES PER SIZE')
del1_head = {'no': ['Størrelse', 'Legg opp', 'Antall økeganger', 'Masker ved bredeste punkt'],
             'en': ['Size', 'Cast on', 'Number of increases', 'Sts at widest point']}
add('del1_head', del1_head['no'], del1_head['en'])
del1_rows = [(s['no'], str(s['co_sts']), str(s['inc_count']), str(s['max_depth_sts'])) for s in SIZES]
add('del1_rows_data', del1_rows)
add('del1_ferdig',
    'Kontroll: når du har gjentatt økefeltet riktig antall ganger for din '
    'størrelse, skal du ha akkurat så mange masker på pinnen som står i kolonnen '
    '"Masker ved bredeste punkt" over.',
    'Check: once you have repeated the increase section the correct number of times '
    'for your size, you should have exactly as many stitches on the needle as shown '
    'in the "Sts at widest point" column above.')

# ---------------------------------------------------------------- SIDE 9: DEL 2 (BREDESTE PUNKT OG FELLING)
add('banner_del2', 'DEL 2: BREDESTE PUNKT OG FELLING', 'PART 2: WIDEST POINT AND DECREASE')
add('del2_lead',
    'Dette punktet er skulderen på kragen, det bredeste stedet mellom halskant og '
    'ytterkant. Strikk noen rader rett fram, uten forandring, før du begynner å '
    'felle ned igjen mot midt front.',
    "This point is the shoulder of the collar, the widest place between the neck "
    'edge and the outer edge. Knit a few rows even, with no shaping, before you '
    'start decreasing back down towards centre front.')
add('del2_metode',
    'Fellefeltet er et speilbilde av økefeltet i del 1: fellerad (RS): fell 1 '
    'maske i enden ved ytterkanten (strikk 2 sammen), strikk resten av raden vanlig; '
    'rad mellom (VS): strikk/vrang vanlig, uten felling. Gjenta til du har '
    '{co_sts} masker igjen, det samme tallet du la opp med i del 1.',
    'The decrease section mirrors the increase section in part 1: decrease row '
    '(RS): decrease 1 stitch at the end at the outer edge (knit 2 together), knit '
    'the rest of the row plain; row in between (WS): knit/purl plain, with no '
    'decrease. Repeat until you have {co_sts} stitches left, the same number you '
    'cast on with in part 1.')
del2_head = {'no': ['Størrelse', 'Rader rett fram', 'Antall felleganger', 'Rader pr halvdel totalt'],
             'en': ['Size', 'Rows worked even', 'Number of decreases', 'Total rows per half']}
add('del2_head', del2_head['no'], del2_head['en'])
del2_rows = [(s['no'], str(s['plateau_rows']), str(s['inc_count']), str(s['half_neck_rows'])) for s in SIZES]
add('del2_rows_data', del2_rows)
add('del2_ferdig',
    'Fell av de {co_sts} siste maskene. Dette lille punktet er midt front på '
    'denne kragehalvdelen. Radtallet i siste kolonne over er kontrolltallet for '
    'hele halvdelen, fra legg-opp-raden til avfellingen.',
    'Bind off the last {co_sts} stitches. This small point is the centre front of '
    'this collar half. The row count in the last column above is the check number '
    'for the whole half, from the cast-on row to the bind-off.')

# ---------------------------------------------------------------- SIDE 10: DEL 3 (ANDRE HALVDEL)
add('banner_del3', 'DEL 3: ANDRE HALVDEL OG SAMMENSYING', 'PART 3: SECOND HALF AND SEAMING')
add('del3_lead',
    'Strikk en til, helt identisk halvdel, følg del 1 og del 2 på nytt for din '
    'størrelse. De to halvdelene skal være speilvendte i bruk, men strikkes helt '
    'likt, det er sammensyingen som gjør dem til et speilbilde av hverandre.',
    'Knit one more, completely identical half, follow part 1 and part 2 again for '
    'your size. The two halves are mirror images in use, but are knitted exactly '
    'the same way, it is the seaming that turns them into a mirror image of each '
    'other.')
add('del3_metode',
    'Legg de to ferdige halvdelene ved siden av hverandre, med de smale '
    'avfellings-punktene (midt front) inntil hverandre og halskant-sidene vendt '
    'samme vei. Sy sammen de {co_sts} avfelte maskene fra hver halvdel med en tett '
    'søm (madrassøm), fra ytterkant og inn til halskant. Dette lille punktet blir '
    'kragens midt-front-spiss.',
    'Lay the two finished halves side by side, with the narrow bind-off points '
    '(centre front) against each other and the neck-edge sides facing the same way. '
    'Sew the {co_sts} bound-off stitches from each half together with a neat seam '
    '(mattress stitch), working from the outer edge in towards the neck edge. This '
    'small point becomes the collar\'s centre-front tip.')

# ---------------------------------------------------------------- SIDE 11: DEL 4 (KANT)
add('banner_del4', 'DEL 4: KANT RUNDT YTTERKANTEN', 'PART 4: BORDER AROUND THE OUTER EDGE')
add('del4_lead',
    'Nå tas det opp masker langs hele ytterkanten, fra bakhalskanten på den ene '
    'halvdelen, rundt midt front, til bakhalskanten på den andre halvdelen, og '
    'strikkes en garterstrikk-kant. Garterstrikk ligger flatt og krøller seg ikke, '
    'og gir kragen en ren, tydelig ytterkant.',
    'Now stitches are picked up along the whole outer edge, from the back-neck edge '
    'of one half, around centre front, to the back-neck edge of the other half, and '
    'a garter-stitch border is worked. Garter stitch lies flat and does not curl, '
    'giving the collar a clean, defined outer edge.')
add('del4_metode',
    'Med retten vendt ut, ta opp 1 maske for hver rad langs ytterkanten (den buede '
    'kanten der økingen og fellingen ble strikket), først på den ene halvdelen, så '
    'videre rundt den andre. Strikk garterstrikk (r på alle rader, både RS og VS) i '
    '{border_rows} rader. Fell av alle masker løst, så kanten ikke strammer.',
    'With the right side facing out, pick up 1 stitch for every row along the outer '
    'edge (the curved edge where the increases and decreases were worked), first '
    'along one half, then on around the other. Work garter stitch (knit every row, '
    'both RS and WS) for {border_rows} rows. Bind off all stitches loosely, so the '
    'edge does not pull tight.')
del4_head = {'no': ['Størrelse', 'Tatt opp pr halvdel', 'Masker totalt rundt kanten', 'Kantrader'],
             'en': ['Size', 'Picked up per half', 'Total sts around the edge', 'Border rows']}
add('del4_head', del4_head['no'], del4_head['en'])
del4_rows = [(s['no'], str(s['border_pickup_per_half']), str(2 * s['border_pickup_per_half']),
              str(s['border_rows'])) for s in SIZES]
add('del4_rows_data', del4_rows)

# ---------------------------------------------------------------- SIDE 12: LUKKING BAK
add('banner_lukking', 'LUKKING BAK: KNAPP OG LØKKE', 'BACK CLOSURE: BUTTON AND LOOP')
add('lukking_lead',
    'De to bakhalskantene (legg-opp-kantene fra del 1, en på hver halvdel) blir '
    'liggende ved siden av hverandre bak på barnet, uten å være sydd sammen. Der '
    'festes kragen med en liten treknapp på den ene siden og en heklet løkke på '
    'den andre.',
    'The two back-neck edges (the cast-on edges from part 1, one on each half) sit '
    "side by side at the back of the baby's neck, without being sewn together. The "
    'collar fastens there with a small wooden button on one side and a crocheted '
    'loop on the other.')
lukking_no = [
    'Sy en liten, rund treknapp godt fast på bakhalskanten av den ene '
    'kragehalvdelen, ca. 0,5 cm inn fra selve kanten.',
    'Med heklenål 3 mm og en kort tråd, fest trådenden i bakhalskanten på den '
    'andre halvdelen, hekle en luftmaskeløkke på ca. 8-10 luftmasker (prøv den mot '
    'knappen underveis, den skal akkurat gli gjennom uten å være løs), fest av med '
    'en fastmaske.',
    'Prøv at knapp og løkke møter hverandre godt når kragen legges bak på barnet, '
    'juster antall luftmasker om nødvendig for din knapp.',
]
lukking_en = [
    'Sew a small, round wooden button securely onto the back-neck edge of one '
    'collar half, about 0.5 cm in from the edge itself.',
    'With a 3 mm crochet hook and a short length of yarn, secure the yarn end at '
    'the back-neck edge of the other half, crochet a chain loop of about 8-10 '
    'chain stitches (test it against the button as you go, it should just slide '
    'through without being loose), fasten off with a slip stitch.',
    'Check that the button and loop meet neatly when the collar is placed at the '
    "back of the baby's neck, adjust the number of chain stitches if needed for "
    'your button.',
]
add('lukking_steg', lukking_no, lukking_en)

# ---------------------------------------------------------------- SIDE 13: MONTERING
add('banner_montering', 'MONTERING', 'FINISHING')
montering_no = [
    'Fest alle løse tråder godt på vrangen, og klipp dem korte.',
    'Damp press kragen lett på vrangen, unngå å presse garterstrikk-kanten flat, '
    'den skal beholde litt struktur.',
    'Sy på knappen og hekle løkka, se forrige side.',
    'Kontroller til slutt at knappen sitter godt fast, at løkka ikke er for løs, '
    'og at ingen løse tråder eller masker kan løsne.',
    'Legg kragen over halsen og skuldrene på den ferdige Woodland Dreams-'
    'basisbodyen i samme størrelse, og lukk knappen bak.',
]
montering_en = [
    'Weave in all loose ends securely on the wrong side, and trim them short.',
    'Lightly steam-block the collar on the wrong side, avoid pressing the '
    'garter-stitch border flat, it should keep a little texture.',
    'Sew on the button and crochet the loop, see the previous page.',
    'Finally, check that the button is securely attached, that the loop is not too '
    'loose, and that no loose threads or stitches can come undone.',
    'Place the collar over the neck and shoulders of the finished Woodland Dreams '
    'basisbody in the same size, and close the button at the back.',
]
add('montering_steg', montering_no, montering_en)

# ---------------------------------------------------------------- SIDE 14: SIKKERHET OG STELL
add('banner_sikkerhet', 'SIKKERHET OG STELL', 'SAFETY AND CARE')
add('pill_sikkerhet', 'SIKKERHET', 'SAFETY')
sik_no = [
    'Bruk alltid en liten, godt festet knapp, og sy den fast med dobbel tråd, '
    'flere ganger gjennom hvert hull.',
    'Kontroller knappen og løkka jevnlig, spesielt etter vask, og fest dem på '
    'nytt ved første tegn til løshet.',
    'Denne oppskriften er ikke ment for barn som putter små gjenstander i munnen '
    'uten tilsyn, la aldri barnet være alene med kragen på uten oppsyn den første '
    'tiden.',
    'Fordi kragen er løs og festes med bare én knapp bak, må den aldri strammes '
    'rundt halsen eller brukes som noe barnet kan bli hengende fast i, følg alltid '
    'gjeldende sikkerhetsanbefalinger for barneklær.',
]
sik_en = [
    'Always use a small, securely attached button, and sew it on with double '
    'thread, several times through each hole.',
    'Check the button and loop regularly, especially after washing, and reattach '
    'them at the first sign of looseness.',
    'This pattern is not intended for children who put small objects in their '
    'mouth unsupervised, never leave a baby alone and unsupervised in the collar '
    'during the first while of wearing it.',
    'Because the collar is loose and fastens with just one button at the back, it '
    'must never be tightened around the neck or used as anything a baby could get '
    'caught on, always follow current safety recommendations for children\'s '
    'clothing.',
]
add('sikkerhet_txt', sik_no, sik_en)
add('pill_stell', 'VASKERÅD', 'CARE INSTRUCTIONS')
add('stell_txt',
    'Håndvask forsiktig i lunkent vann med ullvask, eller maskinvask på '
    'ullprogram 30 grader. Press ut vannet, trekk i fasong, og tørk liggende '
    'flatt på et håndkle. Unngå å henge kragen til tørk, alpakka kan strekke seg.',
    'Hand wash gently in lukewarm water with wool wash, or machine wash on a wool '
    'cycle at 30 degrees. Press out the water, ease into shape, and dry lying flat '
    'on a towel. Avoid hanging the collar up to dry, alpaca can stretch out of '
    'shape.')

# ---------------------------------------------------------------- SIDE 15: FERDIG
add('banner_ferdig', 'FERDIG!', 'ALL DONE!')
add('ferdig_txt',
    'Gratulerer, Peter Pan-kragen din er ferdig! Legg den over halsen og '
    'skuldrene på Woodland Dreams-basisbodyen for en klassisk, avrundet detalj '
    'som passer til hele kolleksjonen.',
    'Congratulations, your Peter Pan collar is finished! Place it over the neck and '
    'shoulders of the Woodland Dreams basisbody for a classic, rounded detail that '
    'matches the whole collection.')
add('pill_kolleksjon', 'RESTEN AV KOLLEKSJONEN', 'THE REST OF THE COLLECTION')
kolliste_no = [
    'Basisbody, kolleksjonens grunnmur.',
    'Blondekrage, en løs krage som hekter bak.',
    'Rysjekrage, samme feste, litt mer romantisk.',
    'Smekke, som knytes med i-cord eller en knapp.',
    'I-cord-seler, kolleksjonens signaturdel, justerbare og krysser bak.',
    'Kort vest, med treknapper foran, brukes utenpå bodyen.',
    'Woodland Fluffy Skirt, et heklet skjørt laget for å matche bodyen.',
]
kolliste_en = [
    'Basisbody, the foundation of the collection.',
    'Lace collar, a loose collar that fastens at the back.',
    'Ruffle collar, the same fastening, a little more romantic.',
    'Bib, tied with an i-cord or a button.',
    "I-cord suspenders, the collection's signature piece, adjustable and crossing "
    'at the back.',
    'Short vest, with wooden buttons at the front, worn over the body.',
    'Woodland Fluffy Skirt, a crocheted skirt made to match the body.',
]
add('kolleksjon_liste', kolliste_no, kolliste_en)
add('pill_copyright', 'OPPHAVSRETT', 'COPYRIGHT')
add('copyright_txt',
    '(c) Renate Dahl, Little Montessori Explorers. Denne oppskriften er et helt '
    'originalt LME-design. Du står fritt til å selge ferdige plagg du lager etter '
    'denne oppskriften, i liten, personlig skala, forutsatt at det ferdige '
    'produktet er sjekket mot gjeldende sikkerhetskrav. Selve oppskriften, '
    'teksten og bildene, kan ikke deles, kopieres eller selges videre.',
    '(c) Renate Dahl, Little Montessori Explorers. This pattern is a fully original '
    'LME design. You are welcome to sell finished garments you make from this '
    'pattern, on a small personal scale, provided the finished product is checked '
    'against current safety requirements. The pattern itself, its text and images, '
    'may not be shared, copied or resold.')

# ================================================================== BYGG SIDENE

def sized_text(template, s, **extra):
    vals = dict(co_sts=s['co_sts'], border_rows=s['border_rows'])
    vals.update(extra)
    return template.format(**vals)


def rows_table(head, rows):
    return '<table class="t"><tr><th>' + '</th><th>'.join(head) + '</th></tr>' + \
        ''.join('<tr><td><b>' + row[0] + '</b></td>' +
                ''.join(f'<td>{c}</td>' for c in row[1:]) + '</tr>' for row in rows) + '</table>'


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
{rosep(t('pill_pinner'))}
{card('<p>' + t('pinner_txt') + '</p>')}
{sagep(t('pill_swatch'))}
{cme(t('swatch_txt'))}
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

    s0 = SIZES[0]
    del1_lead = sized_text(t('del1_lead'), s0)
    del1_metode = t('del1_metode')
    del1_table = rows_table(t('del1_head'), T['del1_rows_data']['no'])
    pages.append(pg(f'''
{banner(t('banner_del1'))}
<p>{del1_lead}</p>
{card('<p>' + del1_metode + '</p>')}
{rosep(t('pill_del1_kontroll'))}
{card(del1_table)}
{cme(t('del1_ferdig'))}
''', 8))

    del2_metode = sized_text(t('del2_metode'), s0)
    del2_table = rows_table(t('del2_head'), T['del2_rows_data']['no'])
    del2_ferdig = sized_text(t('del2_ferdig'), s0)
    pages.append(pg(f'''
{banner(t('banner_del2'))}
<p>{t('del2_lead')}</p>
{card('<p>' + del2_metode + '</p>')}
{card(del2_table)}
{cme(del2_ferdig)}
''', 9))

    del3_metode = sized_text(t('del3_metode'), s0)
    pages.append(pg(f'''
{banner(t('banner_del3'))}
<p>{t('del3_lead')}</p>
{card('<p>' + del3_metode + '</p>')}
''', 10))

    del4_metode = sized_text(t('del4_metode'), s0)
    del4_table = rows_table(t('del4_head'), T['del4_rows_data']['no'])
    pages.append(pg(f'''
{banner(t('banner_del4'))}
<p>{t('del4_lead')}</p>
{card('<p>' + del4_metode + '</p>')}
{card(del4_table)}
''', 11))

    pages.append(pg(f'''
{banner(t('banner_lukking'))}
<p>{t('lukking_lead')}</p>
{card(steps(t('lukking_steg')))}
''', 12))

    pages.append(pg(f'''
{banner(t('banner_montering'))}
{card(steps(t('montering_steg')))}
''', 13))

    pages.append(pg(f'''
{banner(t('banner_sikkerhet'))}
{rosep(t('pill_sikkerhet'))}
{card(ul(t('sikkerhet_txt')))}
{sagep(t('pill_stell'))}
{cme(t('stell_txt'))}
''', 14))

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
''', 15))

    return pages


for lang in ('no', 'en'):
    html_doc = kit.doc(lang, T['doctitle'][lang], None, build(lang))
    out = BASE / f'peter_pan_krage_{lang}.html'
    out.write_text(html_doc, encoding='utf-8')
    print('OK', lang, len(html_doc), 'tegn/chars')
