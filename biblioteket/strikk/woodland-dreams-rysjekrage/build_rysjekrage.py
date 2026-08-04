# -*- coding: utf-8 -*-
"""Genererer LME-strikkeoppskrift 'Woodland Dreams Rysjekrage' (norsk + engelsk)
som HTML, klar for PDF-print med Chromium. Del av strikkekolleksjonen
LME Woodland Dreams (basisbody + 6 tilbehørsdeler + Woodland Fluffy Skirt).

Helt original LME-konstruksjon: en løs krage strikket flatt fram og
tilbake, fra halskant til rysjekant, som lukkes bak med én liten
treknapp og en heklet løkke. Samme feste som kolleksjonens blondekrage,
men med en fyldigere rysjekant (dobling av masketallet i én rad) i
stedet for en blondekant. Fasthet 22 m = 10 cm / 30 o = 10 cm på 4 mm
pinne, Sandnes Garn Alpakka, akkurat som basisbodyen.

Graderingstallene er beregnet og verifisert i grading_rysjekrage.py
(skriver sizes.json), ikke frihåndstall. Se README.md for detaljer.
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
add('doctitle', 'Woodland Dreams Rysjekrage, LME strikkeoppskrift', 'Woodland Dreams Ruffle Collar, LME knitting pattern')
add('ph2', 'LME STRIKKEOPPSKRIFT&nbsp;&nbsp;|&nbsp;&nbsp;WOODLAND DREAMS RYSJEKRAGE',
    'LME KNITTING PATTERN&nbsp;&nbsp;|&nbsp;&nbsp;WOODLAND DREAMS RUFFLE COLLAR')
add('covertag', 'LME STRIKKEOPPSKRIFT - BABY', 'LME KNITTING PATTERN - BABY')
add('covertitle', 'WOODLAND DREAMS RYSJEKRAGE', 'WOODLAND DREAMS RUFFLE COLLAR')
add('subpill', 'LME BABY COLLECTION - WOODLAND DREAMS', 'LME BABY COLLECTION - WOODLAND DREAMS')
add('cover_desc',
    'En løs, rund krage i glattstrikk og vrangbord, som lukkes bak med én liten treknapp og en '
    'heklet løkke. Ytterkanten dobles i én enkel maskeøkingsrad, slik at kragen får en myk, '
    'rysjete fylde uten at du trenger å strikke et komplisert mønster. Syv størrelser, fra 0-1 '
    'til 18-24 måneder, tilpasset halsmålet på Woodland Dreams-basisbodyen. Rysjekragen er '
    'kolleksjonens mest romantiske tilbehørsdel, tenkt strikket i en av kolleksjonens '
    'aksentfarger: salvie, støvrosa, smørgul, himmelblå, oliven eller terrakotta, som en fin '
    'kontrast til bodyens rolige naturfarger.',
    'A loose, round collar in stockinette stitch and rib, that fastens at the back with one '
    'small wooden button and a crocheted loop. The outer edge is doubled in one simple '
    'increase row, giving the collar a soft, ruffled fullness without any complicated stitch '
    'pattern. Seven sizes, from 0-1 to 18-24 months, sized to fit the neck opening of the '
    'Woodland Dreams basisbody. The ruffle collar is the most romantic accessory in the '
    'collection, meant to be knitted in one of the collection’s accent colours: sage, '
    'dusty rose, butter yellow, soft blue, olive or terracotta, as a nice contrast to the '
    "body's calm natural colours.")
add('by1', 'Av Renate Dahl', 'By Renate Dahl')
add('by2', 'Little Montessori Explorers', 'Little Montessori Explorers')
add('by3', 'lmexplorers.com', 'lmexplorers.com')
add('cover_tip',
    'TIPS: Les hele oppskriften og størrelsestabellen på side 4 før du starter, og strikk en '
    'prøvelapp på 15 x 15 cm for å sjekke strikkefastheten din, samme fasthet som basisbodyen, '
    'før du legger opp selve kragen.',
    'TIP: Read through the whole pattern and the size chart on page 4 before you start, and '
    'knit a 15 x 15 cm gauge swatch to check your tension, the same gauge as the basisbody, '
    'before you cast on the collar itself.')

# ---------------------------------------------------------------- SIDE 2: OM
add('banner_om', 'OM WOODLAND DREAMS RYSJEKRAGE', 'ABOUT THE WOODLAND DREAMS RUFFLE COLLAR')
add('pill_del', 'DEL AV KOLLEKSJONEN', 'PART OF THE COLLECTION')
add('om_del',
    'Rysjekragen er ett av seks tilbehørsstykker i LME Woodland Dreams, laget for å strikkes '
    'separat fra, og brukes utenpå, den ferdige basisbodyen. Den er løs og lett, legges rundt '
    'halsen og lukkes bak med én liten knapp, akkurat som kolleksjonens blondekrage, men med en '
    'fyldigere, rysjete kant i stedet for en blondekant.',
    'The ruffle collar is one of six accessory pieces in LME Woodland Dreams, made to be '
    'knitted separately from, and worn on top of, the finished basisbody. It is loose and '
    'light, sits around the neck and fastens at the back with a single small button, just like '
    "the collection's lace collar, but with a fuller, ruffled edge instead of a lace edge.")
add('pill_stil', 'STIL', 'STYLE')
add('om_stil',
    'Der basisbodyen er holdt i rolige naturfarger, er rysjekragen ment å gi et lite '
    'fargeglimt. Velg en av kolleksjonens aksentfarger: salvie, støvrosa, smørgul, himmelblå, '
    'oliven eller terrakotta, og la kragen bli den lille, romantiske detaljen som løfter et '
    'ellers stillferdig antrekk.',
    "Where the basisbody is kept in calm natural colours, the ruffle collar is meant to add a "
    "small splash of colour. Choose one of the collection's accent colours: sage, dusty rose, "
    'butter yellow, soft blue, olive or terracotta, and let the collar become the small, '
    'romantic detail that lifts an otherwise quiet outfit.')
add('pill_passform', 'LØS, LETT PASSFORM', 'A LOOSE, LIGHT FIT')
add('om_passform',
    'Kragen strikkes flatt, fram og tilbake, og legges rundt halsen som et eget plagg, ikke '
    'fast i selve bodyen. Den lukkes løst bak med knapp og løkke, slik at den er enkel å ta av '
    'og på, og kan brukes sammen med flere av bodyens antrekk.',
    'The collar is knitted flat, back and forth, and worn around the neck as a separate piece, '
    'not attached to the body itself. It fastens loosely at the back with a button and loop, '
    "so it is easy to put on and take off, and can be worn with several of the body's outfits.")

# ---------------------------------------------------------------- SIDE 3: MATERIALER
add('banner_mat', 'MATERIALER', 'MATERIALS')
add('pill_garn', 'GARN', 'YARN')
add('garn_txt',
    'Sandnes Garn Alpakka (100 % alpakka), eller et tilsvarende garn med samme fasthet, samme '
    'garn som resten av kolleksjonen. Siden rysjekragen er en tilbehørsdel, velger du en av '
    'kolleksjonens aksentfarger: salvie, støvrosa, smørgul, himmelblå, oliven eller terrakotta, '
    'gjerne i kontrast til bodyens rolige naturfarge.',
    'Sandnes Garn Alpakka (100% alpaca), or an equivalent yarn with the same gauge, the same '
    "yarn as the rest of the collection. Since the ruffle collar is an accessory piece, choose "
    "one of the collection's accent colours: sage, dusty rose, butter yellow, soft blue, olive "
    "or terracotta, ideally in contrast to the body's calm natural colour.")
GARNFORBRUK = [
    ('0-1 mnd', '15-20 g'), ('1-3 mnd', '18-23 g'), ('3-6 mnd', '20-25 g'),
    ('6-9 mnd', '22-28 g'), ('9-12 mnd', '25-30 g'), ('12-18 mnd', '28-34 g'),
    ('18-24 mnd', '30-36 g'),
]
add('pill_forbruk', 'GARNFORBRUK', 'YARN REQUIREMENTS')
add('forbruk_note',
    'Kragen er en liten tilbehørsdel, én 50 g-nøste av Sandnes Garn Alpakka rekker fint til '
    'kragen i alle størrelser, med rester igjen til for eksempel den heklede løkken.',
    'The collar is a small accessory piece, one 50 g ball of Sandnes Garn Alpakka is plenty '
    'for the collar in any size, with leftovers for the crocheted loop, for example.')
add('pill_pinner', 'PINNER OG TILBEHØR', 'NEEDLES AND NOTIONS')
add('pinner_txt',
    'Rundpinne 4 mm, 40 cm er nok, kragen strikkes flatt fram og tilbake, ikke rundt. Én liten, '
    'rund treknapp. En heklenål 3 mm til å hekle knappeløkken bak. Synål til å feste tråder og '
    'sy på knappen.',
    'Circular needle 4 mm, 40 cm is enough, the collar is knitted flat, back and forth, not in '
    'the round. One small, round wooden button. A 3 mm crochet hook for crocheting the button '
    'loop at the back. A tapestry needle for weaving in ends and sewing on the button.')
add('pill_swatch', 'PRØVELAPP', 'GAUGE SWATCH')
add('swatch_txt',
    'Strikk alltid en prøvelapp før du starter. Samme fasthet som basisbodyen brukes i alle '
    'beregninger her: legg opp 26 masker, strikk glattstrikk i ca. 12 cm, fell av og press '
    'lett. Stemmer ikke fastheten din, bytt til tynnere eller tykkere pinne til den stemmer.',
    'Always knit a gauge swatch before you start. The same gauge as the basisbody is used in '
    'every calculation here: cast on 26 stitches, work stockinette stitch for approx. 12 cm, '
    'bind off and block lightly. If your gauge does not match, change to a smaller or larger '
    'needle until it does.')

# ---------------------------------------------------------------- SIDE 4: STØRRELSESTABELL
add('banner_storrelse', 'STØRRELSESTABELL', 'SIZE CHART')
add('storrelse_lead',
    'Ferdige mål, målt flatt liggende. Velg samme størrelse som du strikket basisbodyen i.',
    'Finished measurements, measured lying flat. Choose the same size as you knitted the '
    'basisbody in.')
storrelse_head = {'no': ['Størrelse', 'Halsmål (body)', 'Kragen lukket, halskant', 'Ytterkant, rysjekant', 'Kragedybde'],
                   'en': ['Size', 'Neck size (body)', 'Collar closed, neck edge', 'Outer edge, ruffle edge', 'Collar depth']}
add('storrelse_head', storrelse_head['no'], storrelse_head['en'])
storrelse_rows = [(s['no'], f"{s['neck_circ_cm']} cm", f"{s['worked_neck_cm']} cm",
                    f"{s['outer_circ_cm']} cm", f"{s['depth_cm']} cm") for s in SIZES]
add('storrelse_note',
    'Halskanten på kragen er strikket ørlite trangere enn selve halsmålet, siden knapp og '
    'løkke bak legger til noen få millimeter når de lukkes, se siden om bakåpning.',
    "The neck edge of the collar is knitted very slightly narrower than the actual neck "
    'measurement, since the button and loop at the back add a few millimetres once closed, '
    'see the back-opening page.')

# ---------------------------------------------------------------- SIDE 5: FASTHET
add('banner_fasthet', 'STRIKKEFASTHET OG VANSKELIGHETSGRAD', 'GAUGE AND DIFFICULTY LEVEL')
add('pill_fasthet', 'FASTHET', 'GAUGE')
add('fasthet_txt',
    '22 masker og 30 omganger glattstrikk = 10 x 10 cm, på pinne 4 mm, akkurat samme fasthet '
    'som basisbodyen. Denne fastheten er brukt i alle beregninger i denne oppskriften.',
    '22 stitches and 30 rows in stockinette stitch = 10 x 10 cm, on 4 mm needles, exactly the '
    'same gauge as the basisbody. This gauge is used in every calculation in this pattern.')
add('pill_vanskelig', 'VANSKELIGHETSGRAD', 'DIFFICULTY LEVEL')
add('vanskelig_txt',
    'Lett til middels. Du bør beherske å legge opp masker, strikke rett, vrang og vrangbord, '
    'øke masker med tilslag (k1fb), og hekle en enkel løkke. Et fint prosjekt om du vil øve deg '
    'på maskeøkinger før du strikker resten av kolleksjonen.',
    'Easy to medium. You should be comfortable casting on stitches, knitting and purling, '
    'working rib, increasing stitches with k1fb (knit into front and back), and crocheting a '
    'simple loop. A nice project if you want to practise stitch increases before knitting the '
    'rest of the collection.')

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
    ('rad', 'row', 'rad (strikkes fram og tilbake)'),
    ('tilslag', 'k1fb', 'strikk 1 rett i masken, så 1 rett til i samme maske (øker 1 maske)'),
    ('felle', 'dec', 'felle (strikk to masker sammen)'),
    ('fell av', 'BO', 'fell av / bind off'),
    ('legg opp', 'CO', 'legg opp masker'),
    ('rundpinne', 'circular needle', 'rundpinne'),
    ('maskemarkør', 'st marker', 'maskemarkør'),
    ('luftmaske', 'ch', 'luftmaske/kjedemaske (hekling)'),
    ('kjedeløkke', 'chain loop', 'heklet løkke til knapp'),
]
add('ord_rows', ord_rows)
add('pill_tips', 'TIPS', 'TIPS')
tips_no = [
    'Tell maskene dine rett etter doblingsraden. De skal stemme nøyaktig med tallet i tabellen '
    'for din størrelse, dette er dobbelt så mange masker som før doblingsraden.',
    'Strikk doblingsraden litt løst. Stramme masker her gjør rysjen mindre luftig.',
    'Fell av løst på siste rad. En stram avfelling flater ut rysjekanten og fjerner mye av '
    'fyldigheten.',
]
tips_en = [
    'Count your stitches right after the doubling row. They should match exactly the number in '
    'the table for your size, this is double the number of stitches you had before the '
    'doubling row.',
    'Work the doubling row a little loosely. Tight stitches here make the ruffle less airy.',
    'Bind off loosely on the last row. A tight bind-off flattens the ruffle edge and takes away '
    'much of the fullness.',
]
add('tips', tips_no, tips_en)

# ---------------------------------------------------------------- SIDE 7: KONSTRUKSJONSOVERSIKT
add('banner_oversikt', 'SLIK ER RYSJEKRAGEN BYGD OPP', 'HOW THE RUFFLE COLLAR IS CONSTRUCTED')
add('oversikt_lead',
    'Kragen strikkes flatt, fram og tilbake, i ett stykke, fra halskant til rysjekant. Fire '
    'enkle deler, i denne rekkefølgen:',
    'The collar is knitted flat, back and forth, in one piece, from the neck edge to the '
    'ruffle edge. Four simple parts, in this order:')
oversikt_deler_no = [
    ('1. Halskant', 'Legg opp langs halskanten (minus bakåpningen), strikk en kort vrangbord '
     'for struktur.'),
    ('2. Glattstrikket felt', 'Bytt til glattstrikk og strikk noen rader rett ned, uten øking.'),
    ('3. Doblingsraden (rysjen)', 'Øk hver eneste maske med tilslag i én enkel rad, masketallet '
     'dobles på et blunk.'),
    ('4. Rysjekanten og avfelling', 'Strikk noen rader til på det doblede masketallet, fell av '
     'løst.'),
]
oversikt_deler_en = [
    ('1. The neck edge', 'Cast on along the neck edge (minus the back opening), work a short '
     'rib for structure.'),
    ('2. The plain section', 'Switch to stockinette stitch and knit a few rows straight down, '
     'with no increasing.'),
    ('3. The doubling row (the ruffle)', 'Increase every single stitch with k1fb in one simple '
     'row, the stitch count doubles in an instant.'),
    ('4. The ruffle edge and bind-off', 'Knit a few more rows on the doubled stitch count, '
     'bind off loosely.'),
]

# ---------------------------------------------------------------- SIDE 8: DEL 1
add('banner_hals', 'DEL 1: LEGG OPP OG HALSKANT', 'PART 1: CASTING ON AND THE NECK EDGE')
add('hals_lead',
    'Legg opp langs det som blir halskanten, minus en liten åpning bak til lukkingen. Se '
    'tabellen under for antall masker for din størrelse. Jobb fram og tilbake (flatt), ikke '
    'rundt, gjennom hele kragen.',
    'Cast on along what will become the neck edge, minus a small opening at the back for the '
    'closure. See the table below for the number of stitches for your size. Work back and '
    'forth (flat), not in the round, through the whole collar.')
add('hals_ribb_txt',
    'Strikk vrangbord r1 vr1 i {rib_rows} rader.',
    'Work k1, p1 rib for {rib_rows} rows.')
hals_head = {'no': ['Størrelse', 'Halsmål (body)', 'Legg opp', 'Rader vrangbord'],
             'en': ['Size', 'Neck size (body)', 'Cast on', 'Rib rows']}
add('hals_head', hals_head['no'], hals_head['en'])
hals_rows = [(s['no'], f"{s['neck_circ_cm']} cm", str(s['co_sts']), str(s['rib_rows'])) for s in SIZES]
add('hals_kontroll',
    'Kontroll: Tell maskene dine etter oppleggingen og vrangborden. De skal stemme med tallet '
    'i kolonnen "Legg opp" for din størrelse, før du går videre til del 2.',
    'Check: Count your stitches after casting on and the rib. They should match the number in '
    'the "Cast on" column for your size, before you move on to part 2.')

# ---------------------------------------------------------------- SIDE 9: DEL 2
add('banner_glatt', 'DEL 2: GLATTSTRIKK OG DOBLINGSRADEN', 'PART 2: STOCKINETTE AND THE DOUBLING ROW')
add('glatt_lead',
    'Bytt til glattstrikk (r på rettsiden, vr på vrangsiden) og strikk {plain_rows} rader rett '
    'ned, uten øking eller felling. Dette gir litt fall før rysjen begynner.',
    'Switch to stockinette stitch (k on the right side, p on the wrong side) and knit '
    '{plain_rows} rows straight down, with no increasing or decreasing. This gives a little '
    'drape before the ruffle begins.')
add('rysj_metode',
    'Doblingsraden strikkes slik: På neste rettsiderad strikker du tilslag (k1fb) i hver '
    'eneste maske hele raden ut. Tilslag betyr at du strikker én rett maske i masken som '
    'vanlig, uten å ta den av pinnen, og strikker så én rett maske til i samme maske (denne '
    'gangen bak i masken), før du lar den gamle masken falle av. Hver maske blir da til to. '
    'Gjøres dette i hver eneste maske i raden, dobles masketallet nøyaktig, og det er akkurat '
    'denne fordoblingen, ikke et mønster eller en tettere fasthet, som gir kragen den myke, '
    'rysjete fylden.',
    'The doubling row is worked like this: On the next right-side row, work k1fb (knit into '
    'the front and back of the stitch) in every single stitch across the row. K1fb means you '
    'knit into the stitch as normal without slipping it off the needle, then knit into the '
    'same stitch again (this time through the back loop), before letting the old stitch drop '
    'off. Each stitch then becomes two. Worked into every stitch across the row, this doubles '
    'the stitch count exactly, and it is this doubling itself, not a stitch pattern or a '
    "tighter gauge, that gives the collar its soft, ruffled fullness.")
glatt_head = {'no': ['Størrelse', 'Rader glattstrikk', 'Masker før dobling', 'Masker etter dobling (rysj)'],
              'en': ['Size', 'Stockinette rows', 'Stitches before doubling', 'Stitches after doubling (ruffle)']}
add('glatt_head', glatt_head['no'], glatt_head['en'])
glatt_rows = [(s['no'], str(s['plain_rows']), str(s['pre_ruffle_sts']), str(s['post_ruffle_sts'])) for s in SIZES]
add('glatt_kontroll',
    'Kontroll: Tell maskene dine rett etter doblingsraden. De skal stemme nøyaktig med tallet '
    'i kolonnen "Masker etter dobling" for din størrelse, dette er dobbelt så mange masker som '
    'du hadde før doblingsraden.',
    'Check: Count your stitches right after the doubling row. They should match exactly the '
    'number in the "Stitches after doubling" column for your size, this is exactly double the '
    'number of stitches you had before the doubling row.')

# ---------------------------------------------------------------- SIDE 10: DEL 3
add('banner_rysjekant', 'DEL 3: RYSJEKANTEN OG AVFELLING', 'PART 3: THE RUFFLE EDGE AND BIND-OFF')
add('rysjekant_lead',
    'På det doblede masketallet strikker du noen rader til, dette er selve rysjekanten, før du '
    'feller av. Rillestrikk (rett på alle rader) gjør at kanten legger seg fint og ikke ruller '
    'seg.',
    'On the doubled stitch count you knit a few more rows, this is the ruffle edge itself, '
    'before binding off. Garter stitch (knit every row) makes the edge lie flat and stops it '
    'from curling.')
add('rysjekant_txt',
    'Strikk rett på alle rader (rillestrikk) i {after_rows} rader. Fell av alle masker løst i '
    'rett strikk. En stram avfelling flater ut rysjen og fjerner mye av fyldigheten.',
    'Knit every row (garter stitch) for {after_rows} rows. Bind off all stitches loosely in '
    'knit. A tight bind-off flattens the ruffle and takes away much of the fullness.')
rysjekant_head = {'no': ['Størrelse', 'Rader rillestrikk', 'Masker ved avfelling', 'Ferdig dybde', 'Ferdig ytterkant'],
                   'en': ['Size', 'Garter stitch rows', 'Stitches at bind-off', 'Finished depth', 'Finished outer edge']}
add('rysjekant_head', rysjekant_head['no'], rysjekant_head['en'])
rysjekant_rows = [(s['no'], str(s['after_rows']), str(s['post_ruffle_sts']), f"{s['depth_cm']} cm",
                    f"{s['outer_circ_cm']} cm") for s in SIZES]
add('rysjekant_note',
    'Ferdig dybde er lik for alle størrelser (5 cm), det er omkretsen, ikke lengden, som '
    'graderes opp gjennom størrelsene.',
    'The finished depth is the same for all sizes (5 cm), it is the circumference, not the '
    'length, that is graded up through the sizes.')

# ---------------------------------------------------------------- SIDE 11: BAKÅPNING
add('banner_bak', 'BAKÅPNING OG KNAPPELUKKING', 'BACK OPENING AND BUTTON CLOSURE')
add('bak_lead',
    'Kragen er strikket flatt fra ende til ende, så de to kortendene av strikketøyet '
    '(start- og sluttkanten) møtes midt bak når kragen tas på, og lukkes med knapp og løkke. '
    'Samme løsning som blondekragen i kolleksjonen, men her holder det med én knapp.',
    'The collar is knitted flat from end to end, so the two short edges of the knitting (the '
    'start and end edges) meet at centre back when the collar is worn, and close with a '
    "button and loop. The same solution as the collection's lace collar, but here one button "
    'is enough.')
bak_steps_no = [
    'Hekle en løkke med heklenål 3 mm på den ene kortenden av kragen: fest tråden i hjørnet, '
    'hekle en luftmaskekjede på ca. 8-10 luftmasker (lang nok til at knappen glir gjennom), '
    'fest kjeden i samme hjørne igjen, og fest av.',
    'Sy den lille treknappen fast på den andre kortenden, rett overfor løkken.',
    'Prøv kragen på (eller mål mot bodyens hals) og juster løkkelengden om nødvendig, før du '
    'syr fast for godt.',
]
bak_steps_en = [
    'Crochet a loop with a 3 mm hook onto one short edge of the collar: attach the yarn at the '
    'corner, crochet a chain of approx. 8-10 chain stitches (long enough for the button to '
    'slide through), fasten the chain back into the same corner, and fasten off.',
    'Sew the small wooden button onto the other short edge, directly opposite the loop.',
    "Try the collar on (or measure against the body's neck) and adjust the loop length if "
    'needed, before sewing it on for good.',
]
add('bak_steps', bak_steps_no, bak_steps_en)
add('bak_note',
    'Vil du heller ha en strikket løkke: strikk en kort i-cord på 3-4 masker, ca. 4-5 cm lang, '
    'på strømpepinner eller en liten rundpinne 4 mm, og fest endene i hvert sitt hjørne i '
    'stedet for den heklede kjeden.',
    'If you prefer a knitted loop instead: knit a short i-cord on 3-4 stitches, approx. 4-5 cm '
    'long, on double-pointed needles or a small 4 mm circular needle, and attach the ends into '
    'each corner instead of the crocheted chain.')

# ---------------------------------------------------------------- SIDE 12: MONTERING
add('banner_montering', 'MONTERING', 'FINISHING')
montering_no = [
    'Fest alle løse tråder godt på vrangen, og klipp dem korte.',
    'Sy på treknappen og hekle løkken, se forrige side.',
    'Damp press kragen lett på vrangen, unngå å presse direkte på vrangbordkanten eller '
    'rysjekanten, de skal beholde strekket og fylden sin.',
    'Legg kragen rundt halsen på bodyen og knepp den igjen bak, kontroller at knapp og løkke '
    'sitter godt fast.',
]
montering_en = [
    'Weave in all loose ends securely on the wrong side, and trim them short.',
    'Sew on the wooden button and crochet the loop, see the previous page.',
    'Lightly steam-block the collar on the wrong side, avoid pressing directly on the ribbed '
    'edge or the ruffle edge, they should keep their stretch and fullness.',
    "Put the collar around the body's neck and button it closed at the back, check that the "
    'button and loop are both securely attached.',
]
add('montering_steg', montering_no, montering_en)

# ---------------------------------------------------------------- SIDE 13: SIKKERHET OG STELL
add('banner_sikkerhet', 'SIKKERHET OG STELL', 'SAFETY AND CARE')
add('pill_sikkerhet', 'SIKKERHET', 'SAFETY')
sik_no = [
    'Bruk alltid en liten, godt festet knapp, og sy den fast med dobbel tråd, flere ganger '
    'gjennom hvert hull.',
    'Kontroller knappen og løkken jevnlig, spesielt etter vask, og fest på nytt ved første '
    'tegn til løshet.',
    'Denne oppskriften er ikke ment for barn som putter små gjenstander i munnen uten tilsyn, '
    'la aldri barnet være alene med kragen på uten oppsyn den første tiden.',
    'Alle mål og masketall i denne oppskriften er beregnet for en løs, komfortabel passform, '
    'ikke en stram sikkerhetspassform, følg alltid gjeldende sikkerhetsanbefalinger for '
    'barneklær og -tilbehør.',
]
sik_en = [
    'Always use a small, securely attached button, and sew it on with double thread, several '
    'times through each hole.',
    'Check the button and the loop regularly, especially after washing, and reattach them at '
    'the first sign of looseness.',
    'This pattern is not intended for children who put small objects in their mouth '
    'unsupervised, never leave a baby alone and unsupervised in the collar during the first '
    'while of wearing it.',
    'All measurements and stitch counts in this pattern are calculated for a loose, '
    'comfortable fit, not a tight safety fit, always follow current safety recommendations for '
    "children's clothing and accessories.",
]
add('sikkerhet_txt', sik_no, sik_en)
add('pill_stell', 'VASKERÅD', 'CARE INSTRUCTIONS')
add('stell_txt',
    'Håndvask forsiktig i lunkent vann med ullvask, eller maskinvask på ullprogram 30 grader. '
    'Press ut vannet, trekk rysjekanten forsiktig i fasong, og tørk liggende flatt på et '
    'håndkle. Unngå å henge kragen til tørk, alpakka kan strekke seg.',
    'Hand wash gently in lukewarm water with wool wash, or machine wash on a wool cycle at 30 '
    'degrees. Press out the water, ease the ruffle edge gently into shape, and dry lying flat '
    'on a towel. Avoid hanging the collar up to dry, alpaca can stretch out of shape.')

# ---------------------------------------------------------------- SIDE 14: FERDIG
add('banner_ferdig', 'FERDIG!', 'ALL DONE!')
add('ferdig_txt',
    'Gratulerer, rysjekragen din er ferdig! Den er laget for å knappes rundt halsen på '
    'Woodland Dreams-basisbodyen, som den mest romantiske av kolleksjonens tilbehørsdeler.',
    'Congratulations, your ruffle collar is finished! It is made to button around the neck of '
    'the Woodland Dreams basisbody, as the most romantic of the accessories in the collection.')
add('pill_kolleksjon', 'RESTEN AV KOLLEKSJONEN', 'THE REST OF THE COLLECTION')
kolliste_no = [
    'Basisbody, den strikkede grunnmuren, med raglanermer og knapper i skrittet.',
    'Blondekrage, en løs krage som hekter bak.',
    'Rysjekrage, samme feste, litt mer romantisk (dette heftet).',
    'Peter Pan-krage, en klassisk avrundet krage.',
    'Smekke, som knytes med i-cord eller en knapp.',
    'I-cord-seler, kolleksjonens signaturdel, justerbare og krysser bak.',
    'Kort vest, med treknapper foran, brukes utenpå bodyen.',
    'Woodland Fluffy Skirt, et heklet skjørt laget for å matche bodyen.',
]
kolliste_en = [
    'Basisbody, the knitted foundation, with raglan sleeves and buttons at the crotch.',
    'Lace collar, a loose collar that fastens at the back.',
    'Ruffle collar, the same fastening, a little more romantic (this booklet).',
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
    'LME-design. Du står fritt til å selge ferdige plagg du lager etter denne oppskriften, i '
    'liten, personlig skala, forutsatt at det ferdige produktet er sjekket mot gjeldende '
    'sikkerhetskrav. Selve oppskriften, teksten og bildene, kan ikke deles, kopieres eller '
    'selges videre.',
    '(c) Renate Dahl, Little Montessori Explorers. This pattern is a fully original LME design. '
    'You are welcome to sell finished garments you make from this pattern, on a small personal '
    'scale, provided the finished product is checked against current safety requirements. The '
    'pattern itself, its text and images, may not be shared, copied or resold.')

# ================================================================== BYGG SIDENE

def sized_text(template, s, **extra):
    vals = dict(rib_rows=s['rib_rows'], plain_rows=s['plain_rows'], after_rows=s['after_rows'])
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
<p class="small center">{t('forbruk_note')}</p>
{rosep(t('pill_pinner'))}
{card('<p>' + t('pinner_txt') + '</p>')}
{sagep(t('pill_swatch'))}
{cme(t('swatch_txt'))}
''', 3))

    st_table = '<table class="t"><tr><th>' + '</th><th>'.join(t('storrelse_head')) + '</th></tr>' + \
        ''.join(f'<tr><td><b>{a}</b></td><td>{b}</td><td>{c}</td><td>{d}</td><td>{e}</td></tr>'
                for a, b, c, d, e in storrelse_rows) + '</table>'
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

    ord_table = abbrtab(ord_rows, t('ord_head'))
    pages.append(pg(f'''
{banner(t('banner_ord'))}
<p>{t('ord_lead')}</p>
{card(ord_table)}
{sagep(t('pill_tips'))}
{card(ul(t('tips')))}
''', 6))

    deler = oversikt_deler_no if lang == 'no' else oversikt_deler_en
    deler_html = '<div class="deler-grid">' + ''.join(
        f'<div class="di"><b>{a}</b><br>{b}</div>' for a, b in deler) + '</div>'
    pages.append(pg(f'''
{banner(t('banner_oversikt'))}
{card('<p>' + t('oversikt_lead') + '</p>' + deler_html)}
''', 7))

    hals_table = '<table class="t"><tr><th>' + '</th><th>'.join(t('hals_head')) + '</th></tr>' + \
        ''.join(f'<tr><td><b>{a}</b></td><td>{b}</td><td>{c}</td><td>{d}</td></tr>'
                for a, b, c, d in hals_rows) + '</table>'
    s0 = SIZES[0]
    hals_ribb = sized_text(t('hals_ribb_txt'), s0)
    hals_ribb_note = {'no': 'Radtallet for vrangborden er likt for alle størrelser.',
                       'en': 'The rib row count is the same for every size.'}[lang]
    pages.append(pg(f'''
{banner(t('banner_hals'))}
<p>{t('hals_lead')}</p>
{card(hals_table)}
{cme(hals_ribb)}
<p class="small center">{hals_ribb_note}</p>
{cme(t('hals_kontroll'))}
''', 8))

    glatt_table = '<table class="t"><tr><th>' + '</th><th>'.join(t('glatt_head')) + '</th></tr>' + \
        ''.join(f'<tr><td><b>{a}</b></td><td>{b}</td><td>{c}</td><td>{d}</td></tr>'
                for a, b, c, d in glatt_rows) + '</table>'
    glatt_lead_txt = sized_text(t('glatt_lead'), s0)
    pages.append(pg(f'''
{banner(t('banner_glatt'))}
<p>{glatt_lead_txt}</p>
{card('<p>' + t('rysj_metode') + '</p>')}
{card(glatt_table)}
{cme(t('glatt_kontroll'))}
''', 9))

    rysjekant_table = '<table class="t"><tr><th>' + '</th><th>'.join(t('rysjekant_head')) + '</th></tr>' + \
        ''.join(f'<tr><td><b>{a}</b></td><td>{b}</td><td>{c}</td><td>{d}</td><td>{e}</td></tr>'
                for a, b, c, d, e in rysjekant_rows) + '</table>'
    rysjekant_txt = sized_text(t('rysjekant_txt'), s0)
    pages.append(pg(f'''
{banner(t('banner_rysjekant'))}
<p>{t('rysjekant_lead')}</p>
{card('<p>' + rysjekant_txt + '</p>')}
{card(rysjekant_table)}
{cme(t('rysjekant_note'))}
''', 10))

    pages.append(pg(f'''
{banner(t('banner_bak'))}
<p>{t('bak_lead')}</p>
{card(steps(t('bak_steps')))}
{cream('<p class="creamtitle">' + t('bak_note') + '</p>')}
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
    out = BASE / f'rysjekrage_{lang}.html'
    out.write_text(html_doc, encoding='utf-8')
    print('OK', lang, len(html_doc), 'tegn/chars')
