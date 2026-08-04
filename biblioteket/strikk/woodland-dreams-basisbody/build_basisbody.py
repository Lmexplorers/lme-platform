# -*- coding: utf-8 -*-
"""Genererer LME-strikkeoppskrift 'Woodland Dreams Basisbody' (norsk + engelsk)
som HTML, klar for PDF-print med Chromium. Første del av strikkekolleksjonen
LME Woodland Dreams (basisbody + 6 tilbehørsdeler + Woodland Fluffy Skirt).

Helt original LME-konstruksjon: topp-ned raglan, rund hals, glattstrikk,
ribb i hals/erme/legg, knapper i skrittet, skulderåpning med knapper på de
tre minste størrelsene. Fasthet 22 m = 10 cm / 30 o = 10 cm på 4 mm pinne,
Sandnes Garn Alpakka. Graderingstallene er beregnet og verifisert separat
(se scratchpad/basisbody/grading3.py), ikke frihåndstall.
"""
import pathlib, sys, json

BASE = pathlib.Path(__file__).parent
sys.path.insert(0, str(BASE.parent.parent / 'hekle' / '_shared'))
import lme_pattern_kit as kit
from lme_pattern_kit import (banner, rosep, sagep, card, cream, cme, ul, steps, otab, abbrtab)

SIZES = json.loads(BASE.joinpath('sizes.json').read_text(encoding='utf-8')) if BASE.joinpath('sizes.json').exists() else None

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
    'En tidløs, unisex basisbody i glattstrikk: rund hals, raglanermer, ribb i hals, mansjett og '
    'legg, og knapper i skrittet for enkelt bleiebytte. Syv størrelser, fra 0-1 til 18-24 måneder. '
    'Basisbodyen er selve grunnmuren i «Woodland Dreams»-kolleksjonen, og er laget for å kunne '
    'kombineres med alle seks tilbehørsdelene: blondekrage, rysjekrage, Peter Pan-krage, smekke, '
    'i-cord-seler og kort vest.',
    'A timeless, unisex basisbody in stockinette stitch: round neck, raglan sleeves, ribbing at the '
    'neck, cuffs and hem, and buttons at the crotch for easy nappy changes. Seven sizes, from 0-1 to '
    '18-24 months. The basisbody is the foundation of the «Woodland Dreams» collection, designed to '
    'be combined with all six accessory patterns: lace collar, ruffle collar, Peter Pan collar, bib, '
    'i-cord suspenders and short vest.')
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
    'skandinavisk, tidløs stil. Tanken er enkel: én godt sittende body, som kan bygges videre på '
    'med ulike krager, en smekke, seler eller en liten vest, uten å måtte strikke en ny body for '
    'hvert antrekk.',
    'The basisbody is the first piece in LME Woodland Dreams, a modular knitting collection in a '
    'Scandinavian, timeless style. The idea is simple: one well-fitting body, that can be built on '
    'with different collars, a bib, suspenders or a little vest, without knitting a new body for '
    'every outfit.')
add('pill_stil', 'STIL', 'STYLE')
add('om_stil',
    'Rene linjer, myke overganger og rolige naturfarger: krem, lin, sand, havre og beige. Ingen '
    'fast kant eller pynt på selve bodyen, den skal være det stillferdige grunnlaget som fargen og '
    'formen i tilbehøret får lov til å løfte.',
    'Clean lines, soft transitions and calm natural colours: cream, linen, sand, oatmeal and beige. '
    'No fixed trim or decoration on the body itself, it is meant to be the quiet foundation that '
    'the colour and shape of the accessories are allowed to lift.')
add('pill_passform', 'ROMSLIG, BLEIEVENNLIG PASSFORM', 'A ROOMY, NAPPY-FRIENDLY FIT')
add('om_passform',
    'Strikket med litt ekstra vidde over brystet og god lengde i kroppen, så det er plass til '
    'bleie uten at bodyen strammer. Lange ermer året rundt, og et sett med knapper i skrittet gjør '
    'bleiebytte raskt, uten å kle av hele barnet.',
    'Knitted with a little extra width over the chest and good body length, so there is room for a '
    'nappy without the body pulling tight. Long sleeves all year round, and a set of buttons at the '
    'crotch make nappy changes quick, without undressing the whole baby.')

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
    ('0-1 mnd', '90-100 g'), ('1-3 mnd', '105-115 g'), ('3-6 mnd', '120-135 g'),
    ('6-9 mnd', '140-155 g'), ('9-12 mnd', '160-175 g'), ('12-18 mnd', '180-200 g'),
    ('18-24 mnd', '210-230 g'),
]
add('pill_forbruk', 'GARNFORBRUK', 'YARN REQUIREMENTS')
add('pill_pinner', 'PINNER OG TILBEHØR', 'NEEDLES AND NOTIONS')
add('pinner_txt',
    'Rundpinne 4 mm (40 cm og 60 cm), pluss strømpepinner eller en kort rundpinne 4 mm til '
    'ermene. Tre små, runde treknapper til skrittet (og to ekstra små treknapper til '
    'skulderåpningen på de tre minste størrelsene). Maskemarkører (minst 4, gjerne i fire ulike '
    'farger til de fire raglanlinjene), synål, og en heklenål 3 mm til å hekle løkker for '
    'knapphullene.',
    'Circular needle 4 mm (40 cm and 60 cm), plus double-pointed needles or a short circular '
    'needle 4 mm for the sleeves. Three small round wooden buttons for the crotch (and two extra '
    'small wooden buttons for the shoulder opening on the three smallest sizes). Stitch markers '
    '(at least 4, ideally in four different colours for the four raglan lines), a tapestry needle, '
    'and a 3 mm crochet hook for crocheting the buttonhole loops.')

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
    'oppskriften er beregnet med, ikke barnets faktiske brystmål.',
    "The measurements are the finished chest width (full circumference), i.e. including the roomy "
    "fit the pattern is calculated with, not the baby's actual chest measurement.")

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
    'Middels. Du bør beherske å strikke i rundt, øke og felle, ta opp masker, og strikke enkle '
    'knapphull. Ingen kompliserte mønster, hele bodyen er glattstrikk og ribb.',
    'Medium. You should be comfortable knitting in the round, increasing and decreasing, picking '
    'up stitches, and working simple buttonholes. No complicated stitch patterns, the whole body is '
    'stockinette stitch and rib.')

# ---------------------------------------------------------------- SIDE 6: FORKORTELSER
add('banner_ord', 'FORKORTELSER', 'ABBREVIATIONS')
add('ord_lead',
    'Norske strikkeuttrykk med engelske termer ved siden av.',
    'Norwegian knitting terms with the English terms alongside.')
ord_head = {'no': ['Norsk', 'Engelsk', 'Betyr'], 'en': ['Norwegian', 'English', 'Meaning']}
add('ord_head', ord_head['no'], ord_head['en'])
ord_rows = [
    ('r', 'K', 'rett'),
    ('vr', 'P', 'vrangbord/vrang'),
    ('m', 'st(s)', 'maske(r)'),
    ('o', 'rnd', 'omgang'),
    ('øk', 'inc', 'øk (ta opp én tilleggsmaske)'),
    ('felle', 'dec', 'felle (strikk to masker sammen)'),
    ('r-felling', 'k2tog', 'strikk 2 r sammen (hellende høyre)'),
    ('vr-felling', 'ssk', 'løft av, løft av, strikk sammen (hellende venstre)'),
    ('ta opp m', 'pick up sts', 'ta opp masker langs en kant'),
    ('fell av', 'BO', 'fell av / bind off'),
    ('legg opp', 'CO', 'legg opp masker'),
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
    'Bodyen strikkes ovenfra og ned, i ett stykke, med raglanermer. Fire enkle deler, i denne '
    'rekkefølgen:',
    'The body is knitted top-down, in one piece, with raglan sleeves. Four simple parts, in this '
    'order:')
oversikt_deler = [
    ('1. Halskant og bæreparti', 'Legg opp i halsen, strikk ribb, øk fire raglanlinjer jevnt til '
     'bæreamål er nådd.', '1. Neck and yoke', 'Cast on at the neck, work rib, increase four raglan '
     'lines evenly until the yoke width is reached.'),
    ('2. Del til erme og kropp', 'Sett ermemaskene til hvile på en tråd, legg opp noen få nye '
     'masker under hver arm, fortsett rundt på kroppen alene.', '2. Divide for sleeves and body',
     'Put the sleeve stitches on hold, cast on a few new stitches under each arm, continue in the '
     'round on the body alone.'),
    ('3. Kroppen ned til skrittet', 'Strikk glattstrikk rett ned, avslutt med ribb og en '
     'knappeløsning i skrittet.', '3. The body down to the crotch', 'Knit stockinette straight '
     'down, finish with rib and a button opening at the crotch.'),
    ('4. Ermene ned til mansjett', 'Ta ermemaskene av tråden, strikk rundt nedover armen, avslutt '
     'med ribb i mansjetten.', '4. The sleeves down to the cuff', 'Put the sleeve stitches back on '
     'the needle, knit around down the arm, finish with rib at the cuff.'),
]
add('oversikt_deler_data', oversikt_deler)

# ---------------------------------------------------------------- SIDE 8: HALSKANT
add('banner_hals', 'DEL 1: HALSKANT', 'PART 1: THE NECK OPENING')
add('hals_lead',
    'Bodyen legges opp i halsen og strikkes ovenfra og ned. På de tre minste størrelsene (0-1, '
    '1-3 og 3-6 måneder) legges det opp flatt, med en liten åpning ved venstre skulder som lukkes '
    'med to knapper, slik at hodet lettere kommer gjennom. På de fire største størrelsene '
    '(6-9 til 18-24 måneder) legges det opp rundt, uten åpning, siden halsen da er stor nok i seg '
    'selv.',
    'The body is cast on at the neck and knitted top-down. On the three smallest sizes (0-1, 1-3 '
    'and 3-6 months) it is cast on flat, with a small opening at the left shoulder that closes with '
    'two buttons, so the head passes through more easily. On the four largest sizes (6-9 to 18-24 '
    'months) it is cast on in the round, with no opening, since the neck is then wide enough on its '
    'own.')
add('hals_smaa_txt',
    'De tre minste størrelsene: legg opp {neck_co} masker flatt på rundpinne 4 mm (jobb fram og '
    'tilbake, ikke rundt, de første {rib_rows} omgangene). Sett en maskemarkør etter maske {mk1}, '
    'etter maske {mk2}, etter maske {mk3} og etter maske {mk4}, disse markerer de fire '
    'raglanlinjene (bak-venstre erme, venstre erme-front, front-høyre erme, høyre erme-bak).',
    'The three smallest sizes: cast on {neck_co} stitches flat on a 4 mm circular needle (work back '
    'and forth, not in the round, for the first {rib_rows} rows). Place a stitch marker after '
    'stitch {mk1}, after stitch {mk2}, after stitch {mk3} and after stitch {mk4}, these mark the '
    'four raglan lines (back-left sleeve, left sleeve-front, front-right sleeve, right sleeve-'
    'back).')
add('hals_store_txt',
    'De fire største størrelsene: legg opp {neck_co} masker rundt på rundpinne 4 mm, sett en '
    'markør for start av omgang. Sett en maskemarkør etter maske {mk1}, etter maske {mk2}, etter '
    'maske {mk3} og etter maske {mk4}, som over.',
    'The four largest sizes: cast on {neck_co} stitches in the round on a 4 mm circular needle, '
    'place a marker for the start of the round. Place a stitch marker after stitch {mk1}, after '
    'stitch {mk2}, after stitch {mk3} and after stitch {mk4}, as above.')
add('hals_ribb_txt',
    'Strikk vrangbord r1 vr1 i {rib_rows} omganger/rader.',
    'Work k1, p1 rib for {rib_rows} rounds/rows.')

# ---------------------------------------------------------------- SIDE 9: RAGLANØKING
add('banner_raglan', 'DEL 2: RAGLANØKING', 'PART 2: RAGLAN INCREASES')
add('raglan_lead',
    'Bytt til glattstrikk. Nå økes det jevnt langs alle fire raglanlinjer, til bæreamålet er nådd. '
    'Konstruksjonen er lik for alle størrelser, det er bare tallene som endrer seg, se '
    'graderingstabellen under.',
    'Switch to stockinette stitch. Now increase evenly along all four raglan lines, until the yoke '
    'width is reached. The construction is the same for every size, only the numbers change, see '
    'the grading table below.')
add('raglan_metode',
    'Økeomgang (hver 2. omgang/rad): øk 1 maske rett før og 1 maske rett etter hver av de fire '
    'raglanmarkørene (8 masker økt totalt pr økeomgang). Strikk vanlig, uten øking, på omgangen/'
    'raden mellom.',
    'Increase round (every 2nd round/row): increase 1 stitch right before and 1 stitch right after '
    'each of the four raglan markers (8 stitches increased in total per increase round). Knit '
    'plain, with no increases, on the round/row in between.')
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

# ---------------------------------------------------------------- SIDE 10: DEL TIL KROPP OG ERME
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

# ---------------------------------------------------------------- SIDE 11: KROPPEN
add('banner_kropp', 'DEL 4: KROPPEN NED TIL SKRITTET', 'PART 4: THE BODY DOWN TO THE CROTCH')
add('kropp_lead',
    'Strikk glattstrikk rett ned, i rundt, uten øking eller felling, til bodyen har ønsket lengde. '
    'Se tabellen under for hvor mange omganger som skal strikkes for din størrelse.',
    'Knit stockinette stitch straight down, in the round, with no increasing or decreasing, until '
    "the body reaches the desired length. See the table below for how many rounds to work for "
    'your size.')
kropp_head = {'no': ['Størrelse', 'Masker på kroppen', 'Omg. glattstrikk', 'Omg. ribb i legg', 'Ferdig lengde'],
               'en': ['Size', 'Body stitches', 'Rounds stockinette', 'Rounds rib at hem', 'Finished length']}
add('kropp_head', kropp_head['no'], kropp_head['en'])
kropp_rows = []
for s in SIZES:
    body_total = s['body_after_divide']
    plain_rows = s['body_rows_below_underarm'] - 7
    kropp_rows.append((s['no'], str(body_total), str(plain_rows), '7', f"{s['body_length_cm']} cm"))
add('kropp_rows_data', kropp_rows)
add('kropp_ribb',
    'Bytt til vrangbord r1 vr1 og strikk 7 omganger. Fell av alle masker løst i vrangbordmønster, '
    'slik at leggkanten forblir elastisk.',
    'Switch to k1, p1 rib and work 7 rounds. Bind off all stitches loosely in rib pattern, so the '
    'hem edge stays stretchy.')
add('pill_skritt', 'KNAPPER I SKRITTET', 'BUTTONS AT THE CROTCH')
add('skritt_txt',
    'Legg en 4-5 cm lang splitt midt front, rett over ribbekanten, ved å strikke fram og tilbake i '
    'stedet for rundt de siste omgangene før avfelling. Kant begge sider av splitten med 2 omganger '
    'r, hekle så tre små løkker (knapphull) på den ene siden med heklenål 3 mm, og sy på tre '
    'treknapper på den andre siden, rett overfor løkkene. Splitten gjør det raskt å bytte bleie '
    'uten å kle av barnet.',
    'Work a 4-5 cm long placket at centre front, right above the rib hem, by knitting back and forth '
    'instead of in the round for the last few rounds before binding off. Edge both sides of the '
    'placket with 2 rows of garter stitch, then crochet three small loops (buttonholes) on one side '
    'with a 3 mm crochet hook, and sew three wooden buttons onto the other side, directly opposite '
    'the loops. The placket makes nappy changes quick without undressing the baby.')

# ---------------------------------------------------------------- SIDE 12: ERMENE
add('banner_erme', 'DEL 5: ERMENE', 'PART 5: THE SLEEVES')
add('erme_lead',
    'Ta ermemaskene tilbake fra tråden/hvilepinnen, ett erme om gangen. Ta i tillegg opp de 2 '
    'maskene som ble lagt opp under armen i del 3, slik at du strikker rundt i ett stykke.',
    'Put the sleeve stitches back onto the needle from the holder, one sleeve at a time. Also pick '
    'up the 2 stitches that were cast on under the arm in part 3, so you knit in the round in one '
    'piece.')
erme_head = {'no': ['Størrelse', 'Masker pr erme', 'Omg. glattstrikk', 'Omg. ribb i mansjett', 'Ferdig ermelengde'],
              'en': ['Size', 'Sts per sleeve', 'Rounds stockinette', 'Rounds rib at cuff', 'Finished sleeve length']}
add('erme_head', erme_head['no'], erme_head['en'])
erme_rows = []
for s in SIZES:
    sleeve_total = s['sleeve_after_divide']
    plain_rows = s['sleeve_rows_total'] - 6
    erme_rows.append((s['no'], str(sleeve_total), str(plain_rows), '6', f"{s['sleeve_length_cm']} cm"))
add('erme_rows_data', erme_rows)
add('erme_ferdig',
    'Bytt til vrangbord r1 vr1 og strikk 6 omganger. Fell av løst i vrangbordmønster. Gjenta likt '
    'for det andre ermet.',
    'Switch to k1, p1 rib and work 6 rounds. Bind off loosely in rib pattern. Repeat the same way '
    'for the other sleeve.')

# ---------------------------------------------------------------- SIDE 13: SKULDERÅPNING
add('banner_skulder', 'SKULDERÅPNING (0-1, 1-3 OG 3-6 MÅNEDER)', 'SHOULDER OPENING (0-1, 1-3 AND 3-6 MONTHS)')
add('skulder_lead',
    'Bare for de tre minste størrelsene. De fire største størrelsene hoppes rett fra ermene til '
    'montering på neste side.',
    'Only for the three smallest sizes. The four largest sizes skip straight from the sleeves to '
    'finishing on the next page.')
add('skulder_txt',
    'Åpningen ved venstre skulder (fra halskanten flatstrikking i del 1) kantes med 2 omganger r '
    'på hver side. Hekle to små løkker (knapphull) på fremre kant med heklenål 3 mm, og sy to '
    'treknapper på bakre kant, rett overfor løkkene. Kne knappene igjennom når bodyen er ferdig '
    'strikket og skal tas på.',
    'The opening at the left shoulder (from the flat neck knitting in part 1) is edged with 2 rows '
    'of garter stitch on each side. Crochet two small loops (buttonholes) on the front edge with a '
    '3 mm crochet hook, and sew two wooden buttons onto the back edge, directly opposite the loops. '
    'Button the shoulder closed once the body is finished and ready to put on.')

# ---------------------------------------------------------------- SIDE 14: MONTERING
add('banner_montering', 'MONTERING', 'FINISHING')
montering_no = [
    'Sy sammen de 2 maskene som ble lagt opp under hver arm, med en liten, tett søm, så det ikke '
    'blir hull.',
    'Fest alle løse tråder godt på vrangen, og klipp dem korte.',
    'Sy på knappene i skrittet og (for de tre minste størrelsene) ved skulderen, se del 4 og '
    'skulderåpning-siden.',
    'Damp press bodyen lett på vrangen, unngå å presse direkte på ribbekantene, de skal beholde '
    'strekket sitt.',
    'Kontroller til slutt at alle knapper sitter godt fast, og at ingen løse tråder eller masker '
    'kan løsne.',
]
montering_en = [
    'Sew together the 2 stitches that were cast on under each arm, with a small, neat seam, so no '
    'hole is left.',
    'Weave in all loose ends securely on the wrong side, and trim them short.',
    'Sew on the buttons at the crotch and (for the three smallest sizes) at the shoulder, see part '
    '4 and the shoulder opening page.',
    'Lightly steam-block the body on the wrong side, avoid pressing directly on the ribbed edges, '
    'they should keep their stretch.',
    'Finally, check that every button is securely attached, and that no loose threads or stitches '
    'can come undone.',
]
add('montering_steg', montering_no, montering_en)

# ---------------------------------------------------------------- SIDE 15: SIKKERHET OG STELL
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

# ---------------------------------------------------------------- SIDE 16: FERDIG
add('banner_ferdig', 'FERDIG!', 'ALL DONE!')
add('ferdig_txt',
    'Gratulerer, basisbodyen din er ferdig! Den er laget for å bli grunnmuren i hele «Woodland '
    'Dreams»-kolleksjonen, klar til å kombineres med kragene, smekken, selene eller vesten.',
    'Congratulations, your basisbody is finished! It is made to be the foundation of the whole '
    '«Woodland Dreams» collection, ready to be combined with the collars, the bib, the suspenders '
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
    vals = dict(neck_co=s['neck_co'], rib_rows=7,
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

    # side 8: halskant, felles tekst m/eksempel-tall for 0-1 mnd (base-størrelse)
    s0 = SIZES[0]
    hals_smaa = sized_text(t('hals_smaa_txt'), s0)
    hals_store = sized_text(t('hals_store_txt'), SIZES[3])
    hals_ribb = t('hals_ribb_txt').format(rib_rows=7)
    hals_note = {'no': 'Nøyaktig masketall for din størrelse finner du i graderingstabellen på neste side.',
                 'en': 'The exact stitch count for your size is in the grading table on the next page.'}[lang]
    pages.append(pg(f'''
{banner(t('banner_hals'))}
<p>{t('hals_lead')}</p>
{card('<p><b>' + {'no':'Eksempel, 0-1 mnd:','en':'Example, 0-1 months:'}[lang] + '</b> ' + hals_smaa + '</p>')}
{card('<p><b>' + {'no':'Eksempel, 6-9 mnd:','en':'Example, 6-9 months:'}[lang] + '</b> ' + hals_store + '</p>')}
{cme(hals_ribb)}
<p class="small center">{hals_note}</p>
''', 8))

    raglan_table = '<table class="t"><tr><th>' + '</th><th>'.join(t('raglan_head')) + '</th></tr>' + \
        ''.join(f'<tr><td><b>{a}</b></td><td>{b}</td><td>{c}</td><td>{d}</td><td>{e}</td></tr>'
                for a, b, c, d, e in T['raglan_rows_data']['no']) + '</table>'
    pages.append(pg(f'''
{banner(t('banner_raglan'))}
<p>{t('raglan_lead')}</p>
{card('<p>' + t('raglan_metode') + '</p>')}
{card(raglan_table)}
{cme(t('raglan_ferdig'))}
''', 9))

    s_ex = SIZES[0]
    del_html = ul([step.format(front=s_ex['front'], back=s_ex['back'], sleeve=s_ex['S'],
                                body_total=s_ex['body_after_divide'])
                   for step in t('del_steps')])
    pages.append(pg(f'''
{banner(t('banner_del'))}
<p>{t('del_lead')}</p>
{card('<p class="small">' + {'no':'Eksempel med tall for 0-1 mnd, bruk dine egne tall fra tabellen på forrige side.','en':'Example with numbers for 0-1 months, use your own numbers from the table on the previous page.'}[lang] + '</p>' + del_html)}
''', 10))

    kropp_table = '<table class="t"><tr><th>' + '</th><th>'.join(t('kropp_head')) + '</th></tr>' + \
        ''.join(f'<tr><td><b>{a}</b></td><td>{b}</td><td>{c}</td><td>{d}</td><td>{e}</td></tr>'
                for a, b, c, d, e in T['kropp_rows_data']['no']) + '</table>'
    pages.append(pg(f'''
{banner(t('banner_kropp'))}
<p>{t('kropp_lead')}</p>
{card(kropp_table)}
{cme(t('kropp_ribb'))}
{rosep(t('pill_skritt'))}
{card('<p>' + t('skritt_txt') + '</p>')}
''', 11))

    erme_table = '<table class="t"><tr><th>' + '</th><th>'.join(t('erme_head')) + '</th></tr>' + \
        ''.join(f'<tr><td><b>{a}</b></td><td>{b}</td><td>{c}</td><td>{d}</td><td>{e}</td></tr>'
                for a, b, c, d, e in T['erme_rows_data']['no']) + '</table>'
    pages.append(pg(f'''
{banner(t('banner_erme'))}
<p>{t('erme_lead')}</p>
{card(erme_table)}
{cme(t('erme_ferdig'))}
''', 12))

    pages.append(pg(f'''
{banner(t('banner_skulder'))}
<p>{t('skulder_lead')}</p>
{card('<p>' + t('skulder_txt') + '</p>')}
''', 13))

    pages.append(pg(f'''
{banner(t('banner_montering'))}
{card(steps(t('montering_steg')))}
''', 14))

    pages.append(pg(f'''
{banner(t('banner_sikkerhet'))}
{rosep(t('pill_sikkerhet'))}
{card(ul(t('sikkerhet_txt')))}
{sagep(t('pill_stell'))}
{cme(t('stell_txt'))}
''', 15))

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
''', 16))

    return pages

for lang in ('no', 'en'):
    html_doc = kit.doc(lang, T['doctitle'][lang], None, build(lang))
    out = BASE / f'basisbody_{lang}.html'
    out.write_text(html_doc, encoding='utf-8')
    print('OK', lang, len(html_doc), 'tegn/chars')
