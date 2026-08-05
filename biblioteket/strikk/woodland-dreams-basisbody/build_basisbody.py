# -*- coding: utf-8 -*-
"""Genererer LME-strikkeoppskrift 'Woodland Dreams Basisbody' (norsk + engelsk)
som HTML, klar for PDF-print med Chromium. Første del av strikkekolleksjonen
LME Woodland Dreams (basisbody + 6 tilbehørsdeler + Woodland Fluffy Skirt).

v2, redesignet etter tilbakemelding: lett, enkel body i glattstrikk, INGEN
ribb noe sted (i-cord-kanter i stedet ved hals, ermekant og beinåpning),
korte, innebygde erme (ikke lange, ikke løse stropper), skulderåpning med
knapper på ALLE 7 størrelser (ikke bare de 3 minste, siden i-cord ikke
strekker som ribb). Topp-ned raglan, rund hals. Fasthet 22 m = 10 cm /
30 o = 10 cm på 4 mm pinne, Sandnes Garn Alpakka. Graderingstallene er
beregnet og verifisert separat (se grading_basisbody.py), ikke
frihåndstall. Helt original LME-konstruksjon, ikke en kopi av noe
eksisterende mønster eller oppskrift.
"""
import pathlib, sys, json

BASE = pathlib.Path(__file__).parent
sys.path.insert(0, str(BASE.parent.parent / 'hekle' / '_shared'))
import lme_pattern_kit as kit
from lme_pattern_kit import (banner, rosep, sagep, card, cream, cme, ul, steps, otab, abbrtab)

SIZES = json.loads(BASE.joinpath('sizes.json').read_text(encoding='utf-8'))

T = {}
def add(key, no, en=None):
    T[key] = {'no': no, 'en': en if en is not None else no}

# ---------------------------------------------------------------- SIDE 1: FORSIDE
add('doctitle', 'Woodland Dreams Basisbody, LME strikkeoppskrift', 'Woodland Dreams Basisbody, LME knitting pattern')
add('ph2', 'LME STRIKKEOPPSKRIFT&nbsp;&nbsp;|&nbsp;&nbsp;WOODLAND DREAMS BASISBODY',
    'LME KNITTING PATTERN&nbsp;&nbsp;|&nbsp;&nbsp;WOODLAND DREAMS BASISBODY')
add('covertag', 'LME STRIKKEOPPSKRIFT - BABY', 'LME KNITTING PATTERN - BABY')
add('covertitle', 'WOODLAND DREAMS BASISBODY', 'WOODLAND DREAMS BASISBODY')
add('subpill', 'LME BABY COLLECTION - WOODLAND DREAMS', 'LME BABY COLLECTION - WOODLAND DREAMS')
add('cover_desc',
    'En lett, enkel unisex basisbody i glattstrikk: rund hals, korte erme, ingen ribb noe sted, kun '
    'myke i-cord-kanter ved hals, ermer og beinåpning. Skulderåpning med knapper på alle størrelser, '
    'og knapper i skrittet for enkelt bleiebytte. Syv størrelser, fra 0-1 til 18-24 måneder. '
    'Basisbodyen er selve grunnmuren i "Woodland Dreams"-kolleksjonen, og er laget for å kunne '
    'kombineres med alle seks tilbehørsdelene: blondekrage, rysjekrage, Peter Pan-krage, smekke, '
    'i-cord-seler og kort vest.',
    'A light, simple, unisex basisbody in stockinette stitch: round neck, short sleeves, no ribbing '
    'anywhere, only soft i-cord edges at the neck, sleeves and leg openings. A button shoulder '
    'opening on every size, and buttons at the crotch for easy nappy changes. Seven sizes, from 0-1 '
    'to 18-24 months. The basisbody is the foundation of the "Woodland Dreams" collection, designed '
    'to be combined with all six accessory patterns: lace collar, ruffle collar, Peter Pan collar, '
    'bib, i-cord suspenders and short vest.')
add('by1', 'Av Renate Dahl', 'By Renate Dahl')
add('by2', 'Little Montessori Explorers', 'Little Montessori Explorers')
add('by3', 'lmexplorers.com', 'lmexplorers.com')
add('cover_tip',
    'TIPS: Les hele oppskriften og størrelsestabellen på side 4 før du starter, og strikk en '
    'prøvelapp på 15 x 15 cm for å sjekke strikkefastheten din, før du legger opp til selve bodyen.',
    'TIP: Read through the whole pattern and the size chart on page 4 before you start, and knit a '
    '15 x 15 cm gauge swatch to check your tension, before casting on the body itself.')

# ---------------------------------------------------------------- SIDE 2: OM
add('banner_om', 'OM WOODLAND DREAMS BASISBODY', 'ABOUT THE WOODLAND DREAMS BASISBODY')
add('pill_kolleksjon0', 'GRUNNMUREN I KOLLEKSJONEN', 'THE FOUNDATION OF THE COLLECTION')
add('om_kolleksjon0',
    'Basisbodyen er den første delen i LME Woodland Dreams, en modulær strikkekolleksjon i '
    'skandinavisk, tidløs stil. Tanken er enkel: én godt sittende, lett body, som kan bygges videre '
    'på med ulike krager, en smekke, seler eller en liten vest, uten å måtte strikke en ny body for '
    'hvert antrekk.',
    'The basisbody is the first piece in LME Woodland Dreams, a modular knitting collection in a '
    'Scandinavian, timeless style. The idea is simple: one well-fitting, light body, that can be '
    'built on with different collars, a bib, suspenders or a little vest, without knitting a new '
    'body for every outfit.')
add('pill_stil', 'STIL', 'STYLE')
add('om_stil',
    'Rene linjer, myke overganger og rolige naturfarger: krem, lin, sand, havre og beige. Ingen '
    'ribb noe sted, bare glattstrikk og en myk, avrundet i-cord-kant der bodyen åpner seg: ved hals, '
    'ermer og beinåpning. Enklest mulig, uten fast kant eller pynt utover dette, det stillferdige '
    'grunnlaget som fargen og formen i tilbehøret får lov til å løfte.',
    'Clean lines, soft transitions and calm natural colours: cream, linen, sand, oatmeal and beige. '
    'No ribbing anywhere, only stockinette stitch and a soft, rounded i-cord edge wherever the body '
    'opens: at the neck, sleeves and leg openings. As simple as possible, with no other fixed trim '
    'or decoration, the quiet foundation that the colour and shape of the accessories are allowed '
    'to lift.')
add('pill_passform', 'LETT OG BLEIEVENNLIG PASSFORM', 'A LIGHT, NAPPY-FRIENDLY FIT')
add('om_passform',
    'Strikket med litt ekstra vidde over brystet og god lengde i kroppen, så det er plass til bleie '
    'uten at bodyen strammer. Korte erme, ikke lange, for et lett og luftig uttrykk hele året. '
    'Skulderåpning med knapper på alle størrelser gjør det raskt å ta bodyen av og på, og et sett '
    'med knapper i skrittet gjør bleiebytte raskt, uten å kle av hele barnet.',
    'Knitted with a little extra width over the chest and good body length, so there is room for a '
    'nappy without the body pulling tight. Short sleeves, not long, for a light and airy feel all '
    'year round. A button shoulder opening on every size makes the body quick to put on and take '
    'off, and a set of buttons at the crotch make nappy changes quick, without undressing the whole '
    'baby.')

# ---------------------------------------------------------------- SIDE 3: MATERIALER
add('banner_mat', 'MATERIALER', 'MATERIALS')
add('pill_garn', 'GARN', 'YARN')
add('garn_txt',
    'Sandnes Garn Alpakka (100 % alpakka), eller et tilsvarende garn med samme fasthet. Velg en av '
    'kolleksjonens rolige naturfarger til selve bodyen: krem, lin, sand, havre eller beige.',
    'Sandnes Garn Alpakka (100% alpaca), or an equivalent yarn with the same gauge. Choose one of '
    "the collection's calm natural colours for the body itself: cream, linen, sand, oatmeal or "
    'beige.')
GARNFORBRUK = [
    ('0-1 mnd', '85-95 g'), ('1-3 mnd', '100-110 g'), ('3-6 mnd', '110-125 g'),
    ('6-9 mnd', '130-145 g'), ('9-12 mnd', '150-165 g'), ('12-18 mnd', '170-190 g'),
    ('18-24 mnd', '195-215 g'),
]
add('pill_forbruk', 'GARNFORBRUK', 'YARN REQUIREMENTS')
add('pill_pinner', 'PINNER OG TILBEHØR', 'NEEDLES AND NOTIONS')
add('pinner_txt',
    'Rundpinne 4 mm (40 cm og 60 cm), pluss strømpepinner eller en kort rundpinne 4 mm til de korte '
    'ermene. Fem små, runde treknapper: tre til skrittet og to til skulderåpningen. '
    'Maskemarkører (minst 4, gjerne i fire ulike farger til de fire raglanlinjene), synål, og en '
    'heklenål 3 mm til å hekle løkker for knapphullene.',
    'Circular needle 4 mm (40 cm and 60 cm), plus double-pointed needles or a short circular needle '
    '4 mm for the short sleeves. Five small round wooden buttons: three for the crotch and two for '
    'the shoulder opening. Stitch markers (at least 4, ideally in four different colours for the '
    'four raglan lines), a tapestry needle, and a 3 mm crochet hook for crocheting the buttonhole '
    'loops.')

# ---------------------------------------------------------------- SIDE 4: STØRRELSESTABELL
add('banner_storrelse', 'STØRRELSESTABELL', 'SIZE CHART')
add('storrelse_lead',
    'Ferdige mål, målt flatt liggende. Velg størrelse etter brystmål, eventuelt en størrelse opp '
    'om du vil ha ekstra god plass.',
    'Finished measurements, measured lying flat. Choose size by chest measurement, or one size up '
    'for extra room to grow.')
storrelse_head = {'no': ['Størrelse', 'Brystvidde', 'Lengde hals-skritt', 'Ermelengde', 'Halskant'],
                   'en': ['Size', 'Chest width', 'Neck-to-crotch length', 'Sleeve length', 'Neck opening']}
add('storrelse_head', storrelse_head['no'], storrelse_head['en'])
storrelse_rows = []
for s in SIZES:
    storrelse_rows.append((s['no'], f"{s['chest_cm']} cm", f"{s['body_length_cm']} cm",
                            f"{s['sleeve_length_cm']} cm", f"{s['neck_circ_cm']} cm"))
add('storrelse_rows_data', storrelse_rows)
add('storrelse_note',
    'Målene er ferdig brystvidde (hel omkrets), altså inkludert den romslige passformen '
    'oppskriften er beregnet med, ikke barnets faktiske brystmål. Ermelengden er målt fra der '
    'ermet deles fra kroppen (skulderlinjen) til mansjettkanten.',
    "The measurements are the finished chest width (full circumference), i.e. including the roomy "
    "fit the pattern is calculated with, not the baby's actual chest measurement. The sleeve length "
    "is measured from where the sleeve divides from the body (the shoulder line) to the cuff edge.")

# ---------------------------------------------------------------- SIDE 5: FASTHET
add('banner_fasthet', 'STRIKKEFASTHET OG VANSKELIGHETSGRAD', 'GAUGE AND DIFFICULTY LEVEL')
add('pill_fasthet', 'FASTHET', 'GAUGE')
add('fasthet_txt',
    '22 masker og 30 omganger glattstrikk = 10 x 10 cm, på pinne 4 mm. Denne fastheten er brukt i '
    'alle beregninger i oppskriften. Strikk alltid en prøvelapp først: legg opp 26 masker, strikk '
    'glattstrikk i ca. 12 cm, fell av og press lett. Stemmer ikke fastheten din, bytt til tynnere '
    'eller tykkere pinne til den stemmer, ikke bare til garnet.',
    '22 stitches and 30 rounds in stockinette stitch = 10 x 10 cm, on 4 mm needles. This gauge is '
    'used in every calculation in the pattern. Always knit a swatch first: cast on 26 stitches, '
    'work stockinette stitch for approx. 12 cm, bind off and block lightly. If your gauge does not '
    'match, change to a smaller or larger needle until it does, not just to match the yarn.')
add('pill_vanskelig', 'VANSKELIGHETSGRAD', 'DIFFICULTY LEVEL')
add('vanskelig_txt',
    'Middels. Du bør beherske å strikke i rundt, øke og felle, ta opp masker, strikke enkle '
    'knapphull og i-cord-avfelling. Ingen kompliserte mønster, hele bodyen er glattstrikk, kun '
    'kantene er i-cord.',
    'Medium. You should be comfortable knitting in the round, increasing and decreasing, picking '
    'up stitches, working simple buttonholes and an i-cord bind-off. No complicated stitch '
    'patterns, the whole body is stockinette stitch, only the edges are i-cord.')

# ---------------------------------------------------------------- SIDE 6: FORKORTELSER
add('banner_ord', 'FORKORTELSER', 'ABBREVIATIONS')
add('ord_lead',
    'Norske strikkeuttrykk med engelske termer ved siden av.',
    'Norwegian knitting terms with the English terms alongside.')
ord_head = {'no': ['Norsk', 'Engelsk', 'Betyr'], 'en': ['Norwegian', 'English', 'Meaning']}
add('ord_head', ord_head['no'], ord_head['en'])
ord_rows = [
    ('r', 'K', 'rett'),
    ('vr', 'P', 'vrang'),
    ('m', 'st(s)', 'maske(r)'),
    ('o', 'rnd', 'omgang'),
    ('øk', 'inc', 'øk (ta opp én tilleggsmaske)'),
    ('felle', 'dec', 'felle (strikk to masker sammen)'),
    ('r-felling', 'k2tog', 'strikk 2 r sammen (hellende høyre)'),
    ('vr-felling', 'ssk', 'løft av, løft av, strikk sammen (hellende venstre)'),
    ('ta opp m', 'pick up sts', 'ta opp masker langs en kant'),
    ('fell av', 'BO', 'fell av / bind off'),
    ('legg opp', 'CO', 'legg opp masker'),
    ('i-cord', 'i-cord', 'strikket rørformet kant/snor, se side 8'),
    ('rettpinne', 'straight needle', 'rett/enkeltpinne'),
    ('rundpinne', 'circular needle', 'rundpinne'),
    ('strømpepinne', 'DPN', 'strømpepinne (dobbeltspiss)'),
    ('maskemarkør', 'st marker', 'maskemarkør'),
]
add('ord_rows', ord_rows)
add('pill_tips', 'TIPS', 'TIPS')
tips_no = [
    'Bruk fire maskemarkører i ulik farge til de fire raglanlinjene, det gjør det mye enklere å '
    'holde oversikt underveis.',
    'Strikk alltid en prøvelapp, selv om du "vanligvis" strikker akkurat denne fastheten, alpakka '
    'oppfører seg litt annerledes enn ull.',
    'Tell maskene dine ved hver markert kontrollpunkt i oppskriften. Det er lettere å rette en '
    'feil på 10 omganger enn på 40.',
]
tips_en = [
    'Use four stitch markers in different colours for the four raglan lines, it makes it much '
    'easier to keep track as you go.',
    'Always knit a swatch, even if you "usually" get this gauge, alpaca behaves a little '
    'differently from wool.',
    'Count your stitches at every checkpoint marked in the pattern. It is easier to fix a mistake '
    '10 rounds back than 40.',
]
add('tips', tips_no, tips_en)

# ---------------------------------------------------------------- SIDE 7: KONSTRUKSJONSOVERSIKT
add('banner_oversikt', 'SLIK ER BODYEN BYGD OPP', 'HOW THE BODY IS CONSTRUCTED')
add('oversikt_lead',
    'Bodyen strikkes ovenfra og ned, i ett stykke, med korte raglanermer. Fem enkle deler, i denne '
    'rekkefølgen:',
    'The body is knitted top-down, in one piece, with short raglan sleeves. Five simple parts, in '
    'this order:')
oversikt_deler = [
    ('1. Halskant og skulderåpning', 'Legg opp flatt i halsen med en liten åpning ved venstre '
     'skulder, øk fire raglanlinjer jevnt til bæremålet er nådd.', '1. Neck opening and shoulder',
     'Cast on flat at the neck with a small opening at the left shoulder, increase four raglan '
     'lines evenly until the yoke width is reached.'),
    ('2. Del til erme og kropp', 'Sett ermemaskene til hvile på en tråd, legg opp noen få nye '
     'masker under hver arm, fortsett rundt på kroppen alene.', '2. Divide for sleeves and body',
     'Put the sleeve stitches on hold, cast on a few new stitches under each arm, continue in the '
     'round on the body alone.'),
    ('3. Kroppen ned til skrittet', 'Strikk glattstrikk rett ned, avslutt med i-cord-avfelling og '
     'en knappeløsning i skrittet.', '3. The body down to the crotch', 'Knit stockinette straight '
     'down, finish with an i-cord bind-off and a button opening at the crotch.'),
    ('4. De korte ermene', 'Ta ermemaskene av tråden, strikk noen få omganger nedover, avslutt med '
     'i-cord-avfelling.', '4. The short sleeves', 'Put the sleeve stitches back on the needle, '
     'knit a few rounds down, finish with an i-cord bind-off.'),
    ('5. Halskanten', 'Til slutt: ta opp masker langs hele halskanten og avslutt med samme '
     'i-cord-avfelling som resten av bodyen.', '5. The neck edge', 'Finally: pick up stitches all '
     'the way around the neck opening and finish with the same i-cord bind-off as the rest of the '
     'body.'),
]
add('oversikt_deler_data', oversikt_deler)

# ---------------------------------------------------------------- SIDE 8: I-CORD-TEKNIKKEN
add('banner_icord', 'I-CORD-TEKNIKKEN', 'THE I-CORD TECHNIQUE')
add('icord_lead',
    'Bodyen har ingen ribb noe sted. I stedet avsluttes alle åpne kanter (beinåpning, ermekant og '
    'til slutt halskanten) med den samme, myke i-cord-avfellingen. Lær teknikken én gang her, den '
    'brukes tre ganger i oppskriften.',
    'The body has no ribbing anywhere. Instead, every open edge (leg opening, sleeve cuff, and '
    'finally the neck opening) is finished with the same soft i-cord bind-off. Learn the technique '
    'once here, it is used three times in the pattern.')
add('icord_metode',
    'Legg opp 3 nye masker på venstre pinne, rett foran de levende maskene som skal avfelles. '
    '*Strikk 2 r av de 3 nye maskene. Strikk maske 3 sammen med den neste levende masken, vridd '
    'rett sammen (gjennom bakre masketråd), og sett alle 3 maskene på pinnen tilbake på venstre '
    'pinne*. Gjenta fra * til * hele veien rundt eller langs kanten, til alle de opprinnelige, '
    'levende maskene er avfelt. Fell til slutt av de 3 gjenværende i-cord-maskene på vanlig måte.',
    'Cast on 3 new stitches onto the left needle, right before the live stitches to be bound off. '
    '*Knit 2 of the 3 new stitches. Knit stitch 3 together with the next live stitch, through the '
    'back loop, and slip all 3 stitches back onto the left needle*. Repeat from * to * all the way '
    'around or along the edge, until every original, live stitch has been bound off. Finally, bind '
    'off the 3 remaining i-cord stitches as normal.')
add('icord_tips',
    'Resultatet er en liten, rund, myk snor langs hele kanten, ikke en flat avfelling. Stram '
    'jevnt, men ikke for hardt, i-cord-kanten skal ligge mykt og avrundet, ikke krølle seg.',
    'The result is a small, round, soft cord all along the edge, not a flat bind-off. Pull evenly, '
    'but not too tight, the i-cord edge should sit soft and rounded, not curl up.')

# ---------------------------------------------------------------- SIDE 9: HALSKANT OG SKULDERÅPNING
add('banner_hals', 'DEL 1: HALSKANT OG SKULDERÅPNING', 'PART 1: NECK OPENING AND SHOULDER')
add('hals_lead',
    'Bodyen legges opp i halsen og strikkes ovenfra og ned. Alle syv størrelser legges opp flatt, '
    'med en liten åpning ved venstre skulder som lukkes med to knapper, slik at hodet lettere '
    'kommer gjennom, siden i-cord-kanten (i motsetning til ribb) ikke strekker seg noe særlig.',
    'The body is cast on at the neck and knitted top-down. All seven sizes are cast on flat, with a '
    'small opening at the left shoulder that closes with two buttons, so the head passes through '
    'more easily, since the i-cord edge (unlike ribbing) does not stretch to speak of.')
add('hals_txt',
    'Legg opp {neck_co} masker flatt på rundpinne 4 mm (jobb fram og tilbake, ikke rundt, de første '
    '4 omgangene, dette blir skulderåpningen). Sett en maskemarkør etter maske {mk1}, etter maske '
    '{mk2}, etter maske {mk3} og etter maske {mk4}, disse markerer de fire raglanlinjene '
    '(bak-venstre erme, venstre erme-front, front-høyre erme, høyre erme-bak).',
    'Cast on {neck_co} stitches flat on a 4 mm circular needle (work back and forth, not in the '
    'round, for the first 4 rows, this becomes the shoulder opening). Place a stitch marker after '
    'stitch {mk1}, after stitch {mk2}, after stitch {mk3} and after stitch {mk4}, these mark the '
    'four raglan lines (back-left sleeve, left sleeve-front, front-right sleeve, right sleeve-'
    'back).')
add('hals_apning_txt',
    'Strikk glattstrikk fram og tilbake i 4 rader (dette er skulderåpningen). Fest deretter '
    'maskene til å strikkes rundt (sett en markør for start av omgang), og fortsett direkte til '
    'raglanøkingen på neste side. Halskanten selv strikkes ikke ferdig her, den avsluttes med '
    'i-cord til slutt, se del 5.',
    'Knit stockinette back and forth for 4 rows (this is the shoulder opening). Then join to knit '
    'in the round (place a marker for the start of the round), and continue straight on to the '
    'raglan increases on the next page. The neck edge itself is not finished here, it is finished '
    'with i-cord at the very end, see part 5.')
add('pill_skulder', 'SKULDERÅPNINGEN, FERDIGSTILLING', 'THE SHOULDER OPENING, FINISHING')
add('skulder_txt',
    'Når hele bodyen er ferdig strikket (se montering på side 15): kant begge sider av '
    'skulderåpningen med 1 omgang fastmaske-lignende kantmasker eller la i-cord-kanten fra '
    'halsavslutningen løpe helt ut i åpningen. Hekle to små løkker (knapphull) på fremre kant med '
    'heklenål 3 mm, og sy to treknapper på bakre kant, rett overfor løkkene.',
    'Once the whole body is finished (see finishing on page 15): edge both sides of the shoulder '
    'opening with 1 round of neat edge stitches, or let the i-cord edge from the neck finish run '
    'all the way out into the opening. Crochet two small loops (buttonholes) on the front edge with '
    'a 3 mm crochet hook, and sew two wooden buttons onto the back edge, directly opposite the '
    'loops.')

# ---------------------------------------------------------------- SIDE 10: RAGLANØKING
add('banner_raglan', 'DEL 2: RAGLANØKING', 'PART 2: RAGLAN INCREASES')
add('raglan_lead',
    'Nå økes det jevnt langs alle fire raglanlinjer, til bæremålet er nådd. Antall økeomganger er '
    'det samme for alle syv størrelser her, det er halsoppligget som gjør størrelsesforskjellen, '
    'se graderingstabellen under.',
    'Now increase evenly along all four raglan lines, until the yoke width is reached. The number '
    'of increase rounds is the same for all seven sizes here, it is the neck cast-on that makes the '
    'size difference, see the grading table below.')
add('raglan_metode',
    'Økeomgang (hver 2. omgang): øk 1 maske rett før og 1 maske rett etter hver av de fire '
    'raglanmarkørene (8 masker økt totalt pr økeomgang). Strikk vanlig, uten øking, på omgangen '
    'mellom.',
    'Increase round (every 2nd round): increase 1 stitch right before and 1 stitch right after '
    'each of the four raglan markers (8 stitches increased in total per increase round). Knit '
    'plain, with no increases, on the round in between.')
raglan_head = {'no': ['Størrelse', 'Legg opp i hals', 'Antall økeomg.', 'Omg. til bæremål', 'Masker ved bærde'],
                'en': ['Size', 'Neck cast-on', 'Increase rounds', 'Rounds to yoke depth', 'Sts at yoke depth']}
add('raglan_head', raglan_head['no'], raglan_head['en'])
raglan_rows = []
for s in SIZES:
    raglan_rows.append((s['no'], str(s['neck_co']), str(s['raglan_inc_rounds']),
                         str(s['rows_neck_to_underarm']), str(s['underarm_total'])))
add('raglan_rows_data', raglan_rows)
add('raglan_ferdig',
    'Kontroll: tell maskene dine. De skal stemme med tallet i kolonnen "Masker ved bærde" for din '
    'størrelse, før du går videre til del 3.',
    'Check: count your stitches. They should match the number in the "Sts at yoke depth" column for '
    'your size, before you move on to part 3.')

# ---------------------------------------------------------------- SIDE 11: DEL TIL KROPP OG ERME
add('banner_del', 'DEL 3: DEL TIL ERME OG KROPP', 'PART 3: DIVIDE FOR SLEEVES AND BODY')
add('del_lead',
    'Nå deles bæret i to ermer og en kropp. Gjør dette likt for alle størrelser, følg din egen '
    'radlinje for masketallene, se tabellen på forrige side.',
    'Now the yoke is divided into two sleeves and a body. Do this the same way for every size, use '
    "your own row's stitch numbers from the table on the previous page.")
del_steps_no = [
    'Strikk over de {front} maskene til front (masker mellom venstre og høyre raglanmarkør, front).',
    'Sett de neste {sleeve} maskene (venstre erme) på en tråd eller ekstra pinne, til hvile.',
    'Legg opp 2 nye masker rett over ermehullet, disse gir litt ekstra bevegelsesvidde under armen.',
    'Strikk over de {back} maskene til bak.',
    'Sett de neste {sleeve} maskene (høyre erme) på en tråd eller ekstra pinne, til hvile.',
    'Legg opp 2 nye masker over det andre ermehullet.',
    'Du har nå {body_total} masker på pinnen, i rundt, kroppen alene. Sett markør for start av '
    'omgang midt bak.',
]
del_steps_en = [
    'Knit across the {front} front stitches (stitches between the left and right raglan markers, '
    'front section).',
    'Put the next {sleeve} stitches (left sleeve) on a holder or spare needle, to rest.',
    'Cast on 2 new stitches right over the sleeve gap, these give a little extra ease under the '
    'arm.',
    'Knit across the {back} back stitches.',
    'Put the next {sleeve} stitches (right sleeve) on a holder or spare needle, to rest.',
    'Cast on 2 new stitches over the other sleeve gap.',
    'You now have {body_total} stitches on the needle, in the round, the body alone. Place a '
    'marker for the start of the round at centre back.',
]
add('del_steps', del_steps_no, del_steps_en)

# ---------------------------------------------------------------- SIDE 12: KROPPEN
add('banner_kropp', 'DEL 4: KROPPEN NED TIL SKRITTET', 'PART 4: THE BODY DOWN TO THE CROTCH')
add('kropp_lead',
    'Strikk glattstrikk rett ned, i rundt, uten øking eller felling, til bodyen har ønsket lengde. '
    'Se tabellen under for hvor mange omganger som skal strikkes for din størrelse.',
    'Knit stockinette stitch straight down, in the round, with no increasing or decreasing, until '
    "the body reaches the desired length. See the table below for how many rounds to work for "
    'your size.')
kropp_head = {'no': ['Størrelse', 'Masker på kroppen', 'Omg. glattstrikk', 'Ferdig lengde'],
               'en': ['Size', 'Body stitches', 'Rounds stockinette', 'Finished length']}
add('kropp_head', kropp_head['no'], kropp_head['en'])
kropp_rows = []
for s in SIZES:
    body_total = s['body_after_divide']
    kropp_rows.append((s['no'], str(body_total), str(s['body_rows_below_underarm']),
                        f"{s['body_length_cm']} cm"))
add('kropp_rows_data', kropp_rows)
add('kropp_icord',
    'Når kroppen har ønsket lengde: strikk fram og tilbake (ikke rundt) i 4-5 cm midt front, rett '
    'over stedet der splitten skal være (se knapper i skrittet under), for å lage åpningen. '
    'Avfell alle maskene rundt hele beinåpningen med i-cord-avfelling, som beskrevet på side 8.',
    'Once the body has the desired length: knit back and forth (not in the round) for 4-5 cm at '
    'centre front, right over where the placket should be (see buttons at the crotch below), to '
    'create the opening. Bind off all stitches all the way around the leg opening with an i-cord '
    'bind-off, as described on page 8.')
add('pill_skritt', 'KNAPPER I SKRITTET', 'BUTTONS AT THE CROTCH')
add('skritt_txt',
    'Kant begge sider av den 4-5 cm lange splitten midt front med 2 omganger r. Hekle så tre små '
    'løkker (knapphull) på den ene siden med heklenål 3 mm, og sy på tre treknapper på den andre '
    'siden, rett overfor løkkene. Splitten gjør det raskt å bytte bleie uten å kle av barnet.',
    'Edge both sides of the 4-5 cm long placket at centre front with 2 rounds of garter stitch. '
    'Then crochet three small loops (buttonholes) on one side with a 3 mm crochet hook, and sew '
    'three wooden buttons onto the other side, directly opposite the loops. The placket makes '
    'nappy changes quick without undressing the baby.')

# ---------------------------------------------------------------- SIDE 13: DE KORTE ERMENE
add('banner_erme', 'DEL 5: DE KORTE ERMENE', 'PART 5: THE SHORT SLEEVES')
add('erme_lead',
    'Ta ermemaskene tilbake fra tråden/hvilepinnen, ett erme om gangen. Ta i tillegg opp de 2 '
    'maskene som ble lagt opp under armen i del 3, slik at du strikker rundt i ett stykke. Ermene '
    'er korte, bare noen få omganger ned fra bæret.',
    'Put the sleeve stitches back onto the needle from the holder, one sleeve at a time. Also pick '
    'up the 2 stitches that were cast on under the arm in part 3, so you knit in the round in one '
    'piece. The sleeves are short, just a few rounds down from the yoke.')
erme_head = {'no': ['Størrelse', 'Masker pr erme', 'Omg. glattstrikk', 'Ferdig ermelengde'],
              'en': ['Size', 'Sts per sleeve', 'Rounds stockinette', 'Finished sleeve length']}
add('erme_head', erme_head['no'], erme_head['en'])
erme_rows = []
for s in SIZES:
    sleeve_total = s['sleeve_after_divide']
    erme_rows.append((s['no'], str(sleeve_total), str(s['sleeve_rows_total']),
                       f"{s['sleeve_length_cm']} cm"))
add('erme_rows_data', erme_rows)
add('erme_ferdig',
    'Avfell alle maskene med i-cord-avfelling, som beskrevet på side 8. Gjenta likt for det andre '
    'ermet.',
    'Bind off all stitches with an i-cord bind-off, as described on page 8. Repeat the same way for '
    'the other sleeve.')

# ---------------------------------------------------------------- SIDE 14: HALSKANTEN
add('banner_halsferdig', 'HALSKANTEN, SISTE STEG', 'THE NECK EDGE, THE FINAL STEP')
add('halsferdig_lead',
    'Til slutt, når resten av bodyen er ferdig strikket og montert (se montering på neste side): '
    'ta opp 1 maske i hver maske langs hele oppleggskanten i halsen, inkludert langs '
    'skulderåpningens to kanter, med rundpinne 4 mm.',
    'Finally, once the rest of the body is finished and assembled (see finishing on the next page): '
    'pick up 1 stitch in each stitch all the way around the neck cast-on edge, including along both '
    'edges of the shoulder opening, with a 4 mm circular needle.')
add('halsferdig_txt',
    'Strikk 1 omgang glattstrikk rett, uten øking eller felling. Avfell deretter alle maskene med '
    'i-cord-avfelling, som beskrevet på side 8. Dette gir halsen den samme myke, avrundede kanten '
    'som beinåpningen og ermene.',
    'Knit 1 round of plain stockinette, with no increasing or decreasing. Then bind off all '
    'stitches with an i-cord bind-off, as described on page 8. This gives the neck the same soft, '
    'rounded edge as the leg opening and the sleeves.')

# ---------------------------------------------------------------- SIDE 15: MONTERING
add('banner_montering', 'MONTERING', 'FINISHING')
montering_no = [
    'Sy sammen de 2 maskene som ble lagt opp under hver arm, med en liten, tett søm, så det ikke '
    'blir hull.',
    'Fest alle løse tråder godt på vrangen, og klipp dem korte.',
    'Ta opp masker og strikk i-cord-kanten rundt halsen, som beskrevet på side 14.',
    'Sy på knappene i skrittet (del 4) og ved skulderen (del 1), og hekle knapphullsløkkene om du '
    'ikke gjorde det underveis.',
    'Damp press bodyen lett på vrangen, unngå å presse direkte på i-cord-kantene, de skal beholde '
    'den runde formen sin.',
    'Kontroller til slutt at alle knapper sitter godt fast, og at ingen løse tråder eller masker '
    'kan løsne.',
]
montering_en = [
    'Sew together the 2 stitches that were cast on under each arm, with a small, neat seam, so no '
    'hole is left.',
    'Weave in all loose ends securely on the wrong side, and trim them short.',
    'Pick up stitches and knit the i-cord edge around the neck, as described on page 14.',
    'Sew on the buttons at the crotch (part 4) and at the shoulder (part 1), and crochet the '
    'buttonhole loops if you did not do so along the way.',
    'Lightly steam-block the body on the wrong side, avoid pressing directly on the i-cord edges, '
    'they should keep their rounded shape.',
    'Finally, check that every button is securely attached, and that no loose threads or stitches '
    'can come undone.',
]
add('montering_steg', montering_no, montering_en)

# ---------------------------------------------------------------- SIDE 16: SIKKERHET OG STELL
add('banner_sikkerhet', 'SIKKERHET OG STELL', 'SAFETY AND CARE')
add('pill_sikkerhet', 'SIKKERHET', 'SAFETY')
sik_no = [
    'Bruk alltid små, godt festede knapper, og sy dem fast med dobbel tråd, flere ganger gjennom '
    'hvert hull.',
    'Kontroller knappene jevnlig, spesielt etter vask, og fest dem på nytt ved første tegn til '
    'løshet.',
    'Denne oppskriften er ikke ment for barn som putter små gjenstander i munnen uten tilsyn, la '
    'aldri barnet være alene med bodyen på uten oppsyn den første tiden.',
    'Alle mål og masketall i denne oppskriften er beregnet for en romslig, komfortabel passform, '
    'ikke en stram sikkerhetspassform, følg alltid gjeldende sikkerhetsanbefalinger for barneklær.',
]
sik_en = [
    'Always use small, securely attached buttons, and sew them on with double thread, several '
    'times through each hole.',
    'Check the buttons regularly, especially after washing, and reattach them at the first sign of '
    'looseness.',
    'This pattern is not intended for children who put small objects in their mouth unsupervised, '
    'never leave a baby alone and unsupervised in the body during the first while of wearing it.',
    'All measurements and stitch counts in this pattern are calculated for a roomy, comfortable '
    'fit, not a tight safety fit, always follow current safety recommendations for children\'s '
    'clothing.',
]
add('sikkerhet_txt', sik_no, sik_en)
add('pill_stell', 'VASKERÅD', 'CARE INSTRUCTIONS')
add('stell_txt',
    'Håndvask forsiktig i lunkent vann med ullvask, eller maskinvask på ullprogram 30 grader. Press '
    'ut vannet, trekk i fasong, og tørk liggende flatt på et håndkle. Unngå å henge bodyen til '
    'tørk, alpakka kan strekke seg.',
    'Hand wash gently in lukewarm water with wool wash, or machine wash on a wool cycle at 30 '
    'degrees. Press out the water, ease into shape, and dry lying flat on a towel. Avoid hanging '
    'the body up to dry, alpaca can stretch out of shape.')

# ---------------------------------------------------------------- SIDE 17: FERDIG
add('banner_ferdig', 'FERDIG!', 'ALL DONE!')
add('ferdig_txt',
    'Gratulerer, basisbodyen din er ferdig! Den er laget for å bli grunnmuren i hele "Woodland '
    'Dreams"-kolleksjonen, klar til å kombineres med kragene, smekken, selene eller vesten.',
    'Congratulations, your basisbody is finished! It is made to be the foundation of the whole '
    '"Woodland Dreams" collection, ready to be combined with the collars, the bib, the suspenders '
    'or the vest.')
add('pill_kolleksjon', 'RESTEN AV KOLLEKSJONEN', 'THE REST OF THE COLLECTION')
kolliste_no = [
    'Blondekrage, en løs krage som hekter bak.',
    'Rysjekrage, samme feste, litt mer romantisk.',
    'Peter Pan-krage, en klassisk avrundet krage.',
    'Smekke, som knytes med i-cord eller en knapp.',
    'I-cord-seler, kolleksjonens signaturdel, justerbare og krysser bak.',
    'Kort vest, med treknapper foran, brukes utenpå bodyen.',
    'Woodland Fluffy Skirt, et heklet skjørt laget for å matche bodyen.',
]
kolliste_en = [
    'Lace collar, a loose collar that fastens at the back.',
    'Ruffle collar, the same fastening, a little more romantic.',
    'Peter Pan collar, a classic rounded collar.',
    'Bib, tied with an i-cord or a button.',
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

def sized_text(template, s, **extra):
    # Markørene settes ved oppleggingen, altså etter STARTMASKENE (før
    # raglanøkingen), ikke etter de ferdige maskene ved bæremålet.
    body_total = s['body_after_divide']
    sf, ss, sb = s['start_front'], s['start_sleeve'], s['start_back']
    vals = dict(neck_co=s['neck_co'],
                mk1=sf, mk2=sf + ss, mk3=sf + ss + sb, mk4=sf + ss + sb + ss,
                front=s['front'], back=s['back'], sleeve=s['S'], body_total=body_total)
    vals.update(extra)
    return template.format(**vals)

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
{rosep(t('pill_pinner'))}
{cme(t('pinner_txt'))}
''', 3))

    st_table = '<table class="t"><tr><th>' + '</th><th>'.join(t('storrelse_head')) + '</th></tr>' + \
        ''.join(f'<tr><td><b>{a}</b></td><td>{b}</td><td>{c}</td><td>{d}</td><td>{e}</td></tr>'
                for a, b, c, d, e in T['storrelse_rows_data']['no' if lang=='no' else 'no']) + '</table>'
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

    pages.append(pg(f'''
{banner(t('banner_icord'))}
<p>{t('icord_lead')}</p>
{card('<p>' + t('icord_metode') + '</p>')}
{cme(t('icord_tips'))}
''', 8))

    # side 9: halskant + skulderåpning, felles tekst m/eksempel-tall for 0-1 mnd
    s0 = SIZES[0]
    hals_ex = sized_text(t('hals_txt'), s0)
    pages.append(pg(f'''
{banner(t('banner_hals'))}
<p>{t('hals_lead')}</p>
{card('<p><b>' + {'no':'Eksempel, 0-1 mnd:','en':'Example, 0-1 months:'}[lang] + '</b> ' + hals_ex + '</p>')}
{cme(t('hals_apning_txt'))}
{rosep(t('pill_skulder'))}
{card('<p>' + t('skulder_txt') + '</p>')}
''', 9))

    raglan_table = '<table class="t"><tr><th>' + '</th><th>'.join(t('raglan_head')) + '</th></tr>' + \
        ''.join(f'<tr><td><b>{a}</b></td><td>{b}</td><td>{c}</td><td>{d}</td><td>{e}</td></tr>'
                for a, b, c, d, e in T['raglan_rows_data']['no']) + '</table>'
    pages.append(pg(f'''
{banner(t('banner_raglan'))}
<p>{t('raglan_lead')}</p>
{card('<p>' + t('raglan_metode') + '</p>')}
{card(raglan_table)}
{cme(t('raglan_ferdig'))}
''', 10))

    s_ex = SIZES[0]
    del_html = ul([step.format(front=s_ex['front'], back=s_ex['back'], sleeve=s_ex['S'],
                                body_total=s_ex['body_after_divide'])
                   for step in t('del_steps')])
    pages.append(pg(f'''
{banner(t('banner_del'))}
<p>{t('del_lead')}</p>
{card('<p class="small">' + {'no':'Eksempel med tall for 0-1 mnd, bruk dine egne tall fra tabellen på forrige side.','en':'Example with numbers for 0-1 months, use your own numbers from the table on the previous page.'}[lang] + '</p>' + del_html)}
''', 11))

    kropp_table = '<table class="t"><tr><th>' + '</th><th>'.join(t('kropp_head')) + '</th></tr>' + \
        ''.join(f'<tr><td><b>{a}</b></td><td>{b}</td><td>{c}</td><td>{d}</td></tr>'
                for a, b, c, d in T['kropp_rows_data']['no']) + '</table>'
    pages.append(pg(f'''
{banner(t('banner_kropp'))}
<p>{t('kropp_lead')}</p>
{card(kropp_table)}
{cme(t('kropp_icord'))}
{rosep(t('pill_skritt'))}
{card('<p>' + t('skritt_txt') + '</p>')}
''', 12))

    erme_table = '<table class="t"><tr><th>' + '</th><th>'.join(t('erme_head')) + '</th></tr>' + \
        ''.join(f'<tr><td><b>{a}</b></td><td>{b}</td><td>{c}</td><td>{d}</td></tr>'
                for a, b, c, d in T['erme_rows_data']['no']) + '</table>'
    pages.append(pg(f'''
{banner(t('banner_erme'))}
<p>{t('erme_lead')}</p>
{card(erme_table)}
{cme(t('erme_ferdig'))}
''', 13))

    pages.append(pg(f'''
{banner(t('banner_halsferdig'))}
<p>{t('halsferdig_lead')}</p>
{card('<p>' + t('halsferdig_txt') + '</p>')}
''', 14))

    pages.append(pg(f'''
{banner(t('banner_montering'))}
{card(steps(t('montering_steg')))}
''', 15))

    pages.append(pg(f'''
{banner(t('banner_sikkerhet'))}
{rosep(t('pill_sikkerhet'))}
{card(ul(t('sikkerhet_txt')))}
{sagep(t('pill_stell'))}
{cme(t('stell_txt'))}
''', 16))

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
''', 17))

    return pages

for lang in ('no', 'en'):
    html_doc = kit.doc(lang, T['doctitle'][lang], None, build(lang))
    out = BASE / f'basisbody_{lang}.html'
    out.write_text(html_doc, encoding='utf-8')
    print('OK', lang, len(html_doc), 'tegn/chars')
