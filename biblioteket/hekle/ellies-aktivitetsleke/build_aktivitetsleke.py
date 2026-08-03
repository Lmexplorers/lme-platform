# -*- coding: utf-8 -*-
"""Genererer LME-hekleoppskrift 'Ellies aktivitetsleke' (norsk + engelsk) som HTML,
klar for PDF-print med Chromium. Del av LME Baby Collection 'Woodland Dreams'."""
import base64, pathlib, sys

BASE = pathlib.Path(__file__).parent
sys.path.insert(0, str(BASE.parent / '_shared'))
import lme_pattern_kit as kit
from lme_pattern_kit import (banner, rosep, sagep, card, cream, cme, ul, steps, otab, abbrtab,
                              photo_row, qr_placeholder)

REF = BASE / 'ellie_ref.png'
ref_b64 = base64.b64encode(REF.read_bytes()).decode()
ref_src = f'data:image/png;base64,{ref_b64}'

T = {}
def add(key, no, en=None):
    T[key] = {'no': no, 'en': en if en is not None else no}

head3 = {'no': ['Omg', 'Beskrivelse', 'Masker'], 'en': ['Rnd', 'Description', 'Sts']}
rowhead = {'no': ['Rad', 'Beskrivelse', 'Masker'], 'en': ['Row', 'Description', 'Sts']}

# ---------------------------------------------------------------- SIDE 1
add('doctitle', 'Ellies aktivitetsleke, LME hekleoppskrift', "Ellie's Activity Toy, LME crochet pattern")
add('ph2', 'LME HEKLEOPPSKRIFT&nbsp;&nbsp;|&nbsp;&nbsp;ELLIES AKTIVITETSLEKE',
    "LME CROCHET PATTERN&nbsp;&nbsp;|&nbsp;&nbsp;ELLIE'S ACTIVITY TOY")
add('covertag', 'LME HEKLEOPPSKRIFT - BABY', 'LME CROCHET PATTERN - BABY')
add('covertitle', 'ELLIES AKTIVITETSLEKE', "ELLIE'S ACTIVITY TOY")
add('subpill', 'LME BABY COLLECTION - WOODLAND DREAMS', 'LME BABY COLLECTION - WOODLAND DREAMS')
add('cover_desc',
    'En stor, myk aktivitetsring, ca. 16 til 18 cm i diameter, full av ting å utforske: et '
    'babysikkert speil, et lite dådyr, blad, blomst, sky, stjerne, måne, regnbue og myke '
    'kuler. Rikt på tekstur, med boblemasker, ribb og popcornmasker å kjenne på.',
    'A big, soft activity ring, approx. 16 to 18 cm in diameter, full of things to explore: a '
    'baby-safe mirror, a little deer, a leaf, a flower, a cloud, a star, a moon, a rainbow and '
    'soft balls. Rich in texture, with bobble stitch, ribbing and popcorn stitch to feel.')
add('by1', 'Av Renate Dahl', 'By Renate Dahl')
add('by2', 'Little Montessori Explorers', 'Little Montessori Explorers')
add('by3', 'lmexplorers.com', 'lmexplorers.com')
add('cover_tip',
    'VIKTIG: Denne leken har mange små deler. Les hele sikkerhetssiden nøye før du begynner, '
    'og sy absolutt alt fast med tette, doble sting.',
    "IMPORTANT: This toy has many small parts. Read the whole safety page carefully before you "
    "start, and sew absolutely everything on with tight, double stitching.")

# ---------------------------------------------------------------- SIDE 2
add('banner_om', 'OM ELLIES AKTIVITETSLEKE', "ABOUT ELLIE'S ACTIVITY TOY")
add('pill_historien', 'DEL AV ELLIES VERDEN', "PART OF ELLIE'S WORLD")
add('om_historien',
    'Ellies aktivitetsleke hører til LME Baby Collection "Woodland Dreams". Ringen samler hele '
    'Ellies verden på ett sted: himmelen med sol, måne, stjerner og regnbue, blomsterengen med '
    'blad og blomst, og Ellie selv, midt iblant alt sammen.',
    'Ellie\'s activity toy belongs to the LME Baby Collection "Woodland Dreams". The ring '
    'gathers Ellie\'s whole world in one place: the sky with its moon, stars and rainbow, the '
    'flower meadow with a leaf and a flower, and Ellie herself, right in the middle of it all.')
add('pill_stil', 'STIL OG SANSER', 'STYLE AND SENSES')
add('om_stil',
    'Skandinavisk og Montessori-inspirert, i de samme naturfargene som resten av kolleksjonen. '
    'Ulike teksturer, som boblemasker, ribb og popcornmasker, gir små fingre mye å utforske og '
    'kjenne på.',
    'Scandinavian and Montessori-inspired, in the same natural colours as the rest of the '
    'collection. Different textures, such as bobble stitch, ribbing and popcorn stitch, give '
    'small fingers plenty to explore and feel.')
add('pill_sikkerhet_kort', 'VIKTIGST AV ALT: SIKKERHET', 'MOST IMPORTANT OF ALL: SAFETY')
add('om_sikkerhet_kort',
    'Denne leken har flere små deler enn noen annen oppskrift i kolleksjonen, og inneholder '
    'også et lite speil. Alt skal sys fast med dobbel styrke, og side 17 er viet sikkerhet i '
    'sin helhet. Les den siden nøye før du begynner.',
    'This toy has more small parts than any other pattern in the collection, and also includes '
    'a small mirror. Everything must be sewn on with double strength, and page 17 is entirely '
    'dedicated to safety. Read that page carefully before you begin.')

# ---------------------------------------------------------------- SIDE 3
add('banner_mat', 'MATERIALER OG GARNALTERNATIVER', 'MATERIALS AND YARN ALTERNATIVES')
add('pill_garn', 'GARN', 'YARN')
add('garn_txt',
    'Bystrikk Merino (brunt og kremhvitt), pluss rester av pudderrosa, salviegrønt og gult, '
    'samme garnfamilie som resten av Ellie-kolleksjonen.',
    'Bystrikk Merino (brown and cream), plus leftover powder pink, sage green and yellow, the '
    'same yarn family as the rest of the Ellie collection.')
add('garn_alt',
    'Alternativt garn: enhver myk bomullsblanding i DK-tykkelse fungerer fint, for eksempel '
    'DROPS Safran eller Hobbii Amigo.',
    'Alternative yarn: any soft cotton-blend DK-weight yarn works well, for example DROPS '
    'Safran or Hobbii Amigo.')
add('pill_utstyr', 'UTSTYR OG TILBEHØR', 'TOOLS AND SUPPLIES')
add('utstyr', [
    ('Aktivitetsring i tre eller plast, 16 til 18 cm i diameter', 'umalt/BPA-fri, CE-merket, '
     'beregnet for barn'),
    ('Heklenål 3 eller 3,5 mm', ''),
    ('Litt polyesterfiber til fyll', 'kun til Ellie-motivet'),
    ('Babysikkert speil (akryl/plast, ikke glass)', 'liten, rund speilplate beregnet for '
     'babyprodukter, se side om speilet'),
    ('Stoppenål med butt spiss og tvinnet bomullstråd', 'til all somming'),
    ('Valgfritt: knitrefolie beregnet for babyprodukter', 'til skyen'),
    ('Valgfritt: en liten bjelle', 'må sys inn i en helt lukket lomme, se side om sikkerhet'),
    ('Valgfritt: korte tøybånd med ulik struktur', 'satengbånd, ripsbånd, cordfløyel, med '
     'sydde/lukkede kanter'),
    ('Saks og målebånd', ''),
])

# ---------------------------------------------------------------- SIDE 4
add('banner_klar', 'VANSKELIGHETSGRAD, MÅL OG FASTHET', 'DIFFICULTY, SIZE AND GAUGE')
add('pill_vanskelig', 'VANSKELIGHETSGRAD', 'DIFFICULTY')
add('vanskelig_txt',
    'Middels til utfordrende, siden det er mange små deler og noen nye teknikker. Fin '
    'oppskrift når du har heklet minst én av de andre Ellie-oppskriftene først.',
    'Medium to challenging, since there are many small parts and a few new techniques. A good '
    'pattern once you have crocheted at least one of the other Ellie patterns first.')
add('pill_mal', 'FERDIG DIAMETER', 'FINISHED DIAMETER')
add('mal_txt', 'Ringen er ca. 16 til 18 cm i diameter, avhengig av ringen du velger.',
    'The ring is approx. 16 to 18 cm in diameter, depending on the ring you choose.')
add('pill_fasthet', 'HEKLEFASTHET', 'GAUGE')
add('fasthet_txt',
    'Hekle stramt, amigurumi-fasthet: ca. 20 fm x 22 omganger = 10 x 10 cm på nål 3 mm.',
    'Crochet tightly, amigurumi tension: approx. 20 sc x 22 rounds = 10 x 10 cm on a 3 mm hook.')

# ---------------------------------------------------------------- SIDE 5
add('banner_ord', 'FORKORTELSER (NORSK OG US)', 'ABBREVIATIONS (NORWEGIAN AND US)')
add('ord_lead',
    'Denne oppskriften har flere teknikker enn noen annen i kolleksjonen. Her er alle '
    'forkortelsene, med de vanlige amerikanske hekletermene ved siden av.',
    'This pattern uses more techniques than any other in the collection. Here are all the '
    'abbreviations, with the common US crochet terms alongside.')
add('ord_head', ['Norsk', 'US', 'Betyr'], ['Norwegian', 'US', 'Means'])
add('ord_rows', [
    ('lm', 'ch', 'luftmaske / chain'),
    ('fm', 'sc', 'fastmaske / single crochet'),
    ('halvstav', 'hdc', 'halv stav / half double crochet'),
    ('stav', 'dc', 'stav / double crochet'),
    ('kjm', 'sl st', 'kjedemaske / slip stitch'),
    ('økn', 'inc', 'økning: 2 fm i samme maske'),
    ('mink', 'dec', 'minking: 2 fm sammen'),
    ('fm-BL', 'sc-BLO', 'fastmaske i bakre løkke, gir ribbet tekstur'),
    ('boble', 'bobble', '4 ufullførte stav i samme maske, trukket sammen til én topp '
     '(se side 13)'),
    ('popcorn', 'popcorn', '5 hele stav i samme maske, trukket sammen til en liten kule '
     '(se side 13)'),
    ('m', 'st(s)', 'maske(r)'),
    ('*...*', '*...*', 'gjenta det mellom stjernene så mange ganger som står bak'),
])
add('pill_tips', 'TIPS FØR DU BEGYNNER', 'TIPS BEFORE YOU START')
add('tips',
    ['Hekle alle de små motivene først, og legg dem ut rundt ringen for å planlegge '
     'plasseringen før du syr noe fast.',
     'Øv på boblemasker og popcornmasker på en liten prøvelapp før du hekler dem inn i '
     'ringtrekket.',
     'Fordel fargene og teksturene jevnt rundt ringen, så det blir spennende å utforske uansett '
     'hvor barnet griper tak.'],
    ['Crochet all the small motifs first, and lay them out around the ring to plan the '
     'placement before sewing anything on.',
     'Practise bobble stitch and popcorn stitch on a small swatch before working them into the '
     'ring cover.',
     'Spread the colours and textures evenly around the ring, so it is interesting to explore '
     'no matter where the child grips.'])

# ---------------------------------------------------------------- SIDE 6
add('banner_oversikt', 'SLIK ER AKTIVITETSLEKEN BYGGET OPP', 'HOW THE ACTIVITY TOY IS BUILT')
add('oversikt_lead',
    'Ringen dekkes først med et heklet trekk med innebygd tekstur, og deretter festes ni '
    'motiver rundt hele ringen:',
    'The ring is first covered with a crocheted cover with built-in texture, and then nine '
    'motifs are attached all around the ring:')
add('oversikt_deler', [
    ('1. Ringtrekket', 'med boble-, ribb- og popcornfelt', '1. The ring cover', 'with bobble, rib and popcorn sections'),
    ('2. Ellie', 'lite dådyr, midtpunktet', '2. Ellie', 'the little deer, the centrepiece'),
    ('3. Speilet', 'babysikkert', '3. The mirror', 'baby-safe'),
    ('4. Bladet og blomsten', 'gjenkjent fra Ellies vognlenke', '4. The leaf and flower', "recognisable from Ellie's stroller toy"),
    ('5. Skyen og stjernen', 'gjenkjent fra Ellies vognlenke', '5. The cloud and star', "recognisable from Ellie's stroller toy"),
    ('6. Månen', 'ny, buet form', '6. The moon', 'new, curved shape'),
    ('7. Regnbuen', 'ny, fire farger', '7. The rainbow', 'new, four colours'),
    ('8. Kulene', 'gjenkjent fra Ellies smokkelenke', '8. The balls', "recognisable from Ellie's pacifier clip"),
    ('9. Valgfrie tilleggseffekter', 'knitrelyd, bjelle, tekstilbånd', '9. Optional extras', 'crinkle sound, bell, fabric ribbons'),
])

# ---------------------------------------------------------------- SIDE 7: RINGTREKKET
add('banner_ring', 'DEL 1: RINGTREKKET', 'PART 1: THE RING COVER')
add('ring_lead',
    'Dekk selve ringen ved å hekle fastmasker direkte rundt den, tett og jevnt, til hele '
    'ringen er dekket og ingenting av den underliggende ringen er synlig. Bytt gjerne farge '
    'og legg inn tekstur-felt underveis, som beskrevet på side 13.',
    'Cover the ring itself by crocheting single crochet stitches directly around it, tightly '
    'and evenly, until the whole ring is covered and none of the underlying ring shows '
    'through. Feel free to change colour and add texture sections along the way, as described '
    'on page 13.')
add('ring_txt',
    'Fest tråden til ringen med en løkke, og hekle fm rett rundt selve ringmaterialet (ikke i '
    'luften) hele veien rundt. Antall masker avhenger av ringens tykkelse og din '
    'heklefasthet, tell heller etter følelse enn et fast tall: fortsett til ringen er helt '
    'dekket uten glipper. Fest av og gjem tråden godt til slutt.',
    'Attach the yarn to the ring with a loop, and crochet sc directly around the ring material '
    'itself (not in the air) all the way around. The stitch count depends on the thickness of '
    'the ring and your gauge, count by feel rather than a fixed number: continue until the '
    'ring is completely covered with no gaps. Fasten off and weave in the end securely at the end.')

# ---------------------------------------------------------------- SIDE 8: ELLIE
add('banner_ellie', 'DEL 2: ELLIE', 'PART 2: ELLIE')
add('ellie_lead',
    'Et lite dådyrhode, samme teknikk som på rangelen og vognlenkens medaljong, festes som '
    'midtpunktet på ringen.',
    "A little deer head, the same technique as on the rattle and the stroller toy's medallion, "
    "is attached as the centrepiece on the ring.")
add('ellie_rows', [
    ('1', '6 fm i magisk ring, brunt', 6),
    ('2', 'økn x 6', 12),
    ('3', '(1 fm, økn) x 6', 18),
    ('4', '(2 fm, økn) x 6', 24),
    ('5 til 6', '24 fm, 2 omganger', 24),
    ('7', '(2 fm, mink) x 6 - fyll svært lett', 18),
    ('8', 'mink x 6', 9),
])
add('ellie_rows_en', [
    ('1', '6 sc in a magic ring, brown', 6),
    ('2', 'inc x 6', 12),
    ('3', '(1 sc, inc) x 6', 18),
    ('4', '(2 sc, inc) x 6', 24),
    ('5 to 6', '24 sc, 2 rounds', 24),
    ('7', '(2 sc, dec) x 6 - stuff very lightly', 18),
    ('8', 'dec x 6', 9),
])
add('ellie_ferdig',
    'Klipp av med god tråd igjen. Sy to små ører (5 fm i magisk ring, avslutt, hekle 2 stk) '
    'øverst, og brodér et lite ansikt. Sy Ellie godt fast midt på ringtrekket.',
    'Cut, leaving a long tail. Sew on two small ears (5 sc in a magic ring, fasten off, make 2) '
    'on top, and embroider a small face. Sew Ellie securely onto the middle of the ring cover.')

# ---------------------------------------------------------------- SIDE 9: SPEILET
add('banner_speil', 'DEL 3: SPEILET (BABYSIKKERT)', 'PART 3: THE MIRROR (BABY-SAFE)')
add('speil_lead',
    'Speilet er den eneste harde delen i denne leken, og krever ekstra forsiktighet.',
    'The mirror is the only hard part in this toy, and requires extra care.')
add('speil_txt',
    'Hekle to like sirkler i kremhvitt, litt større enn selve speilplaten: 6 fm i magisk ring, '
    'økn x 6 (12), (1 fm, økn) x 6 (18), (2 fm, økn) x 6 (24). Legg speilplaten mellom de to '
    'sirklene, og sy dem sammen rundt hele kanten med svært tette sting, slik at speilet er '
    'fullstendig omsluttet og ikke kan tas ut eller skli ut av lommen.',
    'Crochet two matching circles in cream, a little bigger than the mirror disc itself: 6 sc '
    'in a magic ring, inc x 6 (12), (1 sc, inc) x 6 (18), (2 sc, inc) x 6 (24). Place the '
    'mirror disc between the two circles, and sew them together around the entire edge with '
    'very tight stitches, so the mirror is fully enclosed and cannot be removed or slide out '
    'of the pocket.')
add('speil_note',
    'Bruk kun et fleksibelt, ubrytelig babysikkert speil beregnet for barneprodukter, aldri '
    'ekte glass. Sjekk at speilplaten ikke har skarpe kanter før du setter den inn.',
    'Use only a flexible, unbreakable baby-safe mirror intended for children\'s products, '
    'never real glass. Check that the mirror disc has no sharp edges before you insert it.')

# ---------------------------------------------------------------- SIDE 10: BLAD, BLOMST, SKY, STJERNE
add('banner_gjenkjent', 'DEL 4: BLADET, BLOMSTEN, SKYEN OG STJERNEN', 'PART 4: THE LEAF, FLOWER, CLOUD AND STAR')
add('gjenkjent_lead',
    'Disse fire motivene er de samme som på Ellies vognlenke, så barnet kjenner dem igjen fra '
    'resten av kolleksjonen.',
    "These four motifs are the same as on Ellie's stroller toy, so the child recognises them "
    "from the rest of the collection.")
add('pill_blad', 'BLADET (SALVIEGRØNT)', 'THE LEAF (SAGE GREEN)')
add('blad_txt',
    'Legg opp 7 lm. Start i 2. lm fra nålen: 1 kjm, 1 fm, 1 halvstav, 2 stav i siste lm '
    '(tuppen), snu og fortsett på den andre siden: 1 halvstav, 1 fm, 1 kjm. Avslutt og klipp '
    'av med god tråd igjen.',
    'Chain 7. Starting in the 2nd ch from the hook: 1 sl st, 1 sc, 1 hdc, 2 dc in the last ch '
    '(the tip), turn and continue along the other side: 1 hdc, 1 sc, 1 sl st. Fasten off, '
    'leaving a long tail.')
add('pill_blomst', 'BLOMSTEN (PUDDERROSA)', 'THE FLOWER (POWDER PINK)')
add('blomst_txt',
    'Hekle 12 fm i magisk ring. Fortsett rett inn i kronbladene: *hopp over 1 m, i neste m: 1 '
    'kjm, 1 lm, 3 stav, 1 lm, 1 kjm*, gjenta til du har seks kronblad. Avslutt og klipp av.',
    'Crochet 12 sc in a magic ring. Continue straight into the petals: *skip 1 st, in the next '
    'st: 1 sl st, 1 ch, 3 dc, 1 ch, 1 sl st*, repeat until you have six petals. Fasten off and '
    'cut.')
add('pill_sky', 'SKYEN (KREMHVIT)', 'THE CLOUD (CREAM)')
add('sky_txt',
    'Hekle tre flate sirkler i ulik størrelse: (a) 6 fm i magisk ring. (b) 6 fm i magisk ring, '
    'økn x 6 (12). (c) 6 fm i magisk ring, økn x 6 (12), (1 fm, økn) x 6 (18). Overlapp de tre '
    'sirklene og sy dem sammen til en liten skyform.',
    'Crochet three flat circles in different sizes: (a) 6 sc in a magic ring. (b) 6 sc in a '
    'magic ring, inc x 6 (12). (c) 6 sc in a magic ring, inc x 6 (12), (1 sc, inc) x 6 (18). '
    'Overlap the three circles and sew them together into a small cloud shape.')
add('pill_stjerne', 'STJERNEN (KREMHVIT)', 'THE STAR (CREAM)')
add('stjerne_txt',
    'Hekle 5 fm i magisk ring. Fortsett rett inn i takkene: *1 fm, 3 lm, kjm i samme maske*, '
    'gjenta til alle 5 maskene har en takk. Avslutt og klipp av med god tråd igjen.',
    'Crochet 5 sc in a magic ring. Continue straight into the points: *1 sc, 3 ch, sl st in '
    'the same stitch*, repeat until all 5 stitches have a point. Fasten off, leaving a long '
    'tail.')

# ---------------------------------------------------------------- SIDE 11: MÅNE OG REGNBUE
add('banner_mane_regnbue', 'DEL 5: MÅNEN OG REGNBUEN', 'PART 5: THE MOON AND THE RAINBOW')
add('pill_mane', 'MÅNEN (KREMHVIT, TO LIKE DELER)', 'THE MOON (CREAM, TWO MATCHING PIECES)')
add('mane_txt',
    'Legg opp 11 lm + 1 vendemaske. Rad 1: 10 fm. Rad 2: mink 1 i hver ende (8 fm). Rad 3: 8 '
    'fm rett. Rad 4: mink 1 i hver ende (6 fm). Rad 5: 6 fm rett. Avslutt. Hekle to like deler, '
    'legg dem oppå hverandre, sy sammen med en liten åpning, fyll svært lett, og sy igjen. '
    'Bøy den avlange formen forsiktig til en myk halvmåne før du syr den fast på ringen.',
    'Chain 11 + 1 turning chain. Row 1: 10 sc. Row 2: dec 1 at each end (8 sc). Row 3: 8 sc '
    'straight. Row 4: dec 1 at each end (6 sc). Row 5: 6 sc straight. Fasten off. Crochet two '
    'matching pieces, place them together, sew around leaving a small opening, stuff very '
    'lightly, and sew closed. Gently curve the oblong shape into a soft crescent before '
    'sewing it onto the ring.')
add('pill_regnbue', 'REGNBUEN (FIRE FARGER)', 'THE RAINBOW (FOUR COLOURS)')
add('regnbue_txt',
    'Hekle fire buer i avtagende størrelse, én i hver farge (pudderrosa, kremhvitt, '
    'salviegrønt, lys brunt). Bue 1 (ytterst): legg opp 12 lm, fm i 2. lm fra nålen og '
    'resten bortover, 3 fm i siste lm, avslutt (ikke fortsett tilbake andre veien). Bue 2: '
    'legg opp 10 lm, samme metode. Bue 3: legg opp 8 lm, samme metode. Bue 4 (innerst): legg '
    'opp 6 lm, samme metode. Sy de fire buene oppå hverandre, størst bakerst og minst '
    'fremst, med rett underkant, som en regnbue.',
    'Crochet four arcs in decreasing size, one in each colour (powder pink, cream, sage '
    'green, light brown). Arc 1 (outermost): chain 12, sc in the 2nd ch from the hook and '
    'along the rest, 3 sc in the last ch, fasten off (do not continue back the other way). '
    'Arc 2: chain 10, same method. Arc 3: chain 8, same method. Arc 4 (innermost): chain 6, '
    'same method. Sew the four arcs on top of each other, largest at the back and smallest '
    'at the front, with a straight bottom edge, like a rainbow.')

# ---------------------------------------------------------------- SIDE 12: KULENE
add('banner_kuler', 'DEL 6: KULENE', 'PART 6: THE BALLS')
add('kuler_lead',
    'Samme kuler som på Ellies smokkelenke, hekle så mange du vil spre rundt ringen, gjerne i '
    'en rytme av brunt og kremhvitt.',
    "The same balls as on Ellie's pacifier clip, crochet as many as you want to spread around "
    "the ring, for example alternating brown and cream.")
add('kuler_rows', [
    ('1', '6 fm i magisk ring', 6),
    ('2', 'økn x 6', 12),
    ('3 til 4', '12 fm, 2 omganger', 12),
    ('5', 'mink x 6', 6),
])
add('kuler_rows_en', [
    ('1', '6 sc in a magic ring', 6),
    ('2', 'inc x 6', 12),
    ('3 to 4', '12 sc, 2 rounds', 12),
    ('5', 'dec x 6', 6),
])
add('kuler_ferdig',
    'Fyll lett, klipp av med god tråd igjen på hver kule, og sy dem fast rundt ringen med god '
    'avstand fra hverandre.',
    'Stuff lightly, cut with a long tail on each ball, and sew them onto the ring with plenty '
    'of space between them.')

# ---------------------------------------------------------------- SIDE 13: SENSORISKE TEKNIKKER
add('banner_teknikker', 'DEL 7: SENSORISKE TEKNIKKER', 'PART 7: SENSORY TECHNIQUES')
add('teknikker_lead',
    'Legg gjerne inn ett eller flere av disse tekstur-feltene i selve ringtrekket, for '
    'eksempel som et bredt bånd et sted rundt ringen.',
    'Feel free to work one or more of these texture sections into the ring cover itself, for '
    'example as a wide band somewhere around the ring.')
add('pill_boble', 'BOBLEMASKER', 'BOBBLE STITCH')
add('boble_txt',
    'Hekle 4 ufullførte stav i samme maske (dra opp en løkke, la den siste løkken fra hver '
    'stav stå på nålen), dra så tråden gjennom alle 5 løkkene på nålen på én gang. Det gir en '
    'liten, myk topp som stikker frem fra overflaten.',
    'Work 4 incomplete double crochets in the same stitch (yarn over, pull up a loop, leaving '
    'the last loop of each dc on the hook), then pull the yarn through all 5 loops on the hook '
    'at once. This makes a small, soft bump that stands out from the surface.')
add('pill_ribb', 'RIBB', 'RIBBING')
add('ribb_txt',
    'Hekle fastmasker kun i bakre løkke (fm-BL) i stedet for begge løkkene, over en hel '
    'omgang eller rad. Det gir en tydelig, ripset tekstur som er fin å dra fingrene over.',
    'Crochet single crochet in the back loop only (sc-BLO) instead of both loops, over a '
    'whole round or row. This gives a clear, ribbed texture that is nice to run little '
    'fingers over.')
add('pill_popcorn', 'POPCORNMASKER', 'POPCORN STITCH')
add('popcorn_txt',
    'Hekle 5 hele stav i samme maske. Ta nålen ut av den siste løkken, stikk den inn i toppen '
    'av den første av de fem stavene og gjennom løkken du nettopp tok ut, dra igjennom. Det '
    'gir en tydelig, rund kule som sitter fastere og stikker lenger frem enn en boble.',
    'Work 5 whole double crochets in the same stitch. Remove the hook from the last loop, '
    'insert it into the top of the first of the five stitches and through the loop you just '
    'removed, pull through. This makes a distinct, round bump that sits firmer and stands out '
    'further than a bobble.')

# ---------------------------------------------------------------- SIDE 14: VALGFRIE EKSTRA
add('banner_ekstra', 'DEL 8: VALGFRIE TILLEGGSEFFEKTER', 'PART 8: OPTIONAL EXTRAS')
add('pill_knitrelyd', 'KNITRELYD', 'CRINKLE SOUND')
add('knitrelyd_txt',
    'Sy et lite ark med knitrefolie beregnet for babyprodukter inn i en egen, helt lukket '
    'lomme, for eksempel inni skyen, akkurat som rangleboksen i Ellies rangle. Aldri løst i '
    'det vanlige fyllet.',
    "Sew a small sheet of crinkle material intended for baby products into its own, fully "
    "enclosed pocket, for example inside the cloud, just like the rattle capsule in Ellie's "
    "rattle. Never loose in the regular stuffing.")
add('pill_bjelle', 'BJELLE', 'BELL')
add('bjelle_txt',
    'En liten bjelle kan sys inn i en egen, liten, helt lukket lomme (samme metode som '
    'speilet), aldri løst i fyllet og aldri på utsiden av en del.',
    'A small bell can be sewn into its own small, fully enclosed pocket (the same method as '
    'the mirror), never loose in the stuffing and never on the outside of a piece.')
add('pill_band', 'BÅND MED ULIK STRUKTUR', 'RIBBONS WITH DIFFERENT TEXTURES')
add('band_txt',
    'Korte biter av tøybånd i ulik struktur (for eksempel satengbånd, ripsbånd eller '
    'cordfløyel) kan sys fast rundt ringen for enda mer å utforske. Brett endene inn og sy '
    'dem godt fast med tette sting, slik at ingen tråder kan flisse opp eller løsne.',
    'Short pieces of ribbon in different textures (for example satin, grosgrain or corduroy) '
    'can be sewn onto the ring for even more to explore. Fold the ends in and sew them '
    'securely with tight stitches, so no threads can fray or come loose.')

# ---------------------------------------------------------------- SIDE 15: MONTERING
add('banner_montering', 'MONTERING, STEG FOR STEG', 'ASSEMBLY, STEP BY STEP')
add('montering_steg', [
    'Dekk hele ringen med ringtrekket, med eventuelle tekstur-felt fordelt underveis.',
    'Hekle Ellie, speilet, bladet, blomsten, skyen, stjernen, månen, regnbuen og kulene.',
    'Legg alle motivene ut rundt ringen for å planlegge plasseringen, med Ellie og speilet '
    'som de tydeligste punktene.',
    'Sy hvert motiv godt fast med tette, doble sting. Speilet og eventuell bjelle/knitrelyd '
    'skal være helt innsydd uten åpning.',
    'Fest eventuelle tekstilbånd rundt ringen, med brettede og godt sydde kanter.',
    'Fest alle løse tråder godt på innsiden av delene, og klipp av det som er igjen.',
    'Dra forsiktig i hver eneste del for å kontrollere at ingenting løsner, før leken tas i '
    'bruk.',
])
add('montering_steg_en', [
    'Cover the whole ring with the ring cover, spreading out any texture sections along the '
    'way.',
    'Crochet Ellie, the mirror, the leaf, the flower, the cloud, the star, the moon, the '
    'rainbow and the balls.',
    'Lay out all the motifs around the ring to plan the placement, with Ellie and the mirror '
    'as the most prominent points.',
    'Sew each motif on securely with tight, double stitching. The mirror and any bell/crinkle '
    'insert must be fully enclosed with no opening.',
    'Attach any fabric ribbons around the ring, with folded and securely sewn edges.',
    'Fasten every loose end securely on the inside of the pieces, and trim what is left.',
    'Gently tug on every single part to check that nothing comes loose, before the toy is '
    'used.',
])

# ---------------------------------------------------------------- SIDE 16: FOTOVEILEDNING
add('banner_foto', 'FOTOVEILEDNING', 'PHOTO GUIDE')
add('foto_lead',
    'Sett inn egne bilder av hvert steg her når du har heklet aktivitetsleken selv.',
    'Add your own photos of each step here once you have crocheted the activity toy yourself.')
add('foto_captions',
    ['Ringtrekket med tekstur', 'Ellie og speilet', 'Alle motivene fordelt', 'Ferdig ring'],
    ['The ring cover with texture', 'Ellie and the mirror', 'All the motifs spread out',
     'The finished ring'])

# ---------------------------------------------------------------- SIDE 17: SIKKERHET
add('banner_sikkerhet', 'SIKKERHET, DEN VIKTIGSTE SIDEN', 'SAFETY, THE MOST IMPORTANT PAGE')
add('pill_smadeler', 'MANGE SMÅ DELER, ÉN REGEL: ALT SYS FAST', 'MANY SMALL PARTS, ONE RULE: SEW EVERYTHING ON')
add('smadeler_txt',
    'Denne leken har flere motiver enn noen annen oppskrift i Ellie-kolleksjonen. Hvert '
    'eneste ett skal sys fast med sterk, tvinnet bomullstråd og mange, tette sting, gjennomgått '
    'minst to ganger. Speilet, en eventuell bjelle og eventuell knitrefolie skal alltid være '
    'helt innsydd i en lukket lomme, aldri løse i det vanlige fyllet.',
    'This toy has more motifs than any other pattern in the Ellie collection. Every single one '
    'must be sewn on with strong, twisted cotton thread and plenty of tight stitches, going '
    'around at least twice. The mirror, any bell and any crinkle sheet must always be fully '
    'enclosed in a closed pocket, never loose in the regular stuffing.')
add('pill_regler', 'FLERE VIKTIGE REGLER', 'MORE IMPORTANT RULES')
add('regler',
    ['Brukes alltid under tilsyn av en voksen, spesielt de første gangene, til du er trygg på '
     'at alle sømmer holder.',
     'Ingen deler limes. Alt sys fast, ingenting festes med binders, sikkerhetsnåler eller '
     'lignende.',
     'Bruk kun et babysikkert speil i akryl/plast, aldri ekte glass eller speil beregnet for '
     'voksne.',
     'Sjekk leken jevnlig, og spesielt før hver bruk: dra forsiktig i alle motivene. Kast eller '
     'reparer umiddelbart hvis noe er løst.',
     'Denne oppskriften er en veiledning for hjemmebruk. Skal det ferdige produktet selges, må '
     'det alltid kontrolleres, testes og eventuelt merkes i henhold til gjeldende lokale '
     'sikkerhetskrav og regelverk for barneprodukter/leketøy, som stiller strenge krav til '
     'nettopp leker med mange små, påsydde deler.'],
    ['Always use under adult supervision, especially the first few times, until you are '
     'confident every seam holds.',
     'No parts are glued. Everything is sewn on, nothing is attached with paperclips, safety '
     'pins or similar.',
     'Use only a baby-safe acrylic/plastic mirror, never real glass or a mirror intended for '
     'adults.',
     'Check the toy regularly, and especially before every use: gently tug on every motif. '
     'Discard or repair immediately if anything is loose.',
     'This pattern is a guide for home use. If the finished product is sold, it must always be '
     'checked, tested and marked as required under current local safety requirements and '
     "regulations for children's products/toys, which set strict requirements specifically "
     'for toys with many small, sewn-on parts.'])

# ---------------------------------------------------------------- SIDE 18: STELL
add('banner_stell', 'STELL OG VASK', 'CARE AND WASHING')
add('stell_txt',
    'Håndvask forsiktig i lunkent vann med litt mild såpe, siden ringen har mange sydde deler. '
    'Skyll godt. Klem forsiktig ut vannet i et håndkle, ikke vri. Legg til tørk flatt, og '
    'sjekk alle sømmer nøye før leken tas i bruk igjen.',
    'Hand wash gently in lukewarm water with a little mild soap, since the ring has many sewn '
    'parts. Rinse well. Gently press out the water in a towel, do not wring. Lay flat to dry, '
    'and check every seam carefully before using the toy again.')
add('pill_qr', 'VIDEOVEILEDNING', 'VIDEO GUIDE')
add('qr_caption', 'QR-kode til videoveiledning (legges til)', 'QR code to video guide (to be added)')

# ---------------------------------------------------------------- SIDE 19: FERDIG
add('banner_ferdig', 'GRATULERER, AKTIVITETSLEKEN ER FERDIG!', 'CONGRATULATIONS, THE ACTIVITY TOY IS DONE!')
add('ferdig_txt',
    'Nå har du heklet den mest detaljerte oppskriften i hele Ellie-kolleksjonen. Godt jobbet, '
    'og god utforskning!',
    'Now you have crocheted the most detailed pattern in the whole Ellie collection. Well '
    'done, and happy exploring!')
add('pill_kolleksjon', 'RESTEN AV LME BABY COLLECTION', 'THE REST OF THE LME BABY COLLECTION')
add('kolleksjon_liste',
    ['Ellie, det lille dådyret', 'Ellies smokkelenke', 'Ellies rangle', 'Ellies vognlenke',
     'Ellies ballerinasko med sløyfe'],
    ['Ellie, the little fawn', "Ellie's pacifier clip", "Ellie's rattle",
     "Ellie's stroller toy", "Ellie's ballerina shoes with a bow"])
add('pill_copyright', 'COPYRIGHT', 'COPYRIGHT')
add('copyright_txt',
    '(c) Renate Dahl, Little Montessori Explorers. Denne oppskriften er et helt originalt '
    'LME-design. Du kan gjerne selge amigurumier du hekler etter denne oppskriften i din egen, '
    'lille skala, forutsatt at ferdig produkt kontrolleres mot gjeldende sikkerhetskrav. '
    'Oppskriften i seg selv, teksten og bildene, skal ikke deles, kopieres eller videreselges.',
    '(c) Renate Dahl, Little Montessori Explorers. This pattern is a fully original LME design. '
    'You are welcome to sell finished pieces you make from this pattern, on a small personal '
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
<div class="coverimg"><img src="{ref_src}" alt="Ellie, referanse for aktivitetslekens uttrykk"></div>
<p class="small center" style="margin-top:-2mm;">{'Bildet viser Ellie, det lille dådyret, som stiluttrykk-referanse, ikke selve aktivitetsleken.' if lang == 'no' else 'Photo shows Ellie, the little fawn, as a style reference, not the activity toy itself.'}</p>
<div class="covertag">{t('covertag')}</div>
<div class="coverbanner"><h1 class="covertitle">{t('covertitle')}</h1></div>
<div class="subpill">{t('subpill')}</div>
{card('<p class="center">' + t('cover_desc') + '</p>')}
<div class="byline">
  <div class="by1">{t('by1')}</div>
  <div class="by2">{t('by2')}</div>
  <div class="by3">{t('by3')}</div>
</div>
<div class="notecard"><span class="noteemo">&#9888;&#65039;</span><p><i>{t('cover_tip')}</i></p></div>
''', 1))

    pages.append(pg(f'''
{banner(t('banner_om'))}
{rosep(t('pill_historien'))}
{card('<p>' + t('om_historien') + '</p>')}
{sagep(t('pill_stil'))}
{card('<p>' + t('om_stil') + '</p>')}
{rosep(t('pill_sikkerhet_kort'))}
{cme(t('om_sikkerhet_kort'))}
''', 2))

    utstyr_list = ul([f'<b>{a}</b>' + (f' &middot; {b}' if b else '') for a, b in T['utstyr']['no']])
    pages.append(pg(f'''
{banner(t('banner_mat'))}
{rosep(t('pill_garn'))}
{card('<p>' + t('garn_txt') + '</p><p class="small">' + t('garn_alt') + '</p>')}
{sagep(t('pill_utstyr'))}
{card(utstyr_list)}
''', 3))

    pages.append(pg(f'''
{banner(t('banner_klar'))}
{rosep(t('pill_vanskelig'))}
{card('<p class="center">' + t('vanskelig_txt') + '</p>')}
{sagep(t('pill_mal'))}
{card('<p><b>' + t('mal_txt') + '</b></p>')}
{rosep(t('pill_fasthet'))}
{card('<p>' + t('fasthet_txt') + '</p>')}
''', 4))

    ord_table = abbrtab(T['ord_rows']['no'], T['ord_head'][lang])
    tips_items = T['tips']['no'] if lang == 'no' else T['tips']['en']
    pages.append(pg(f'''
{banner(t('banner_ord'))}
<p>{t('ord_lead')}</p>
{card(ord_table)}
{sagep(t('pill_tips'))}
{card(ul(tips_items))}
''', 5))

    if lang == 'no':
        deler = [(a, b) for (a, b, _, _) in T['oversikt_deler']['no']]
    else:
        deler = [(c, d) for (_, _, c, d) in T['oversikt_deler']['no']]
    deler_html = '<div class="deler-grid">' + ''.join(
        f'<div class="di"><b>{a}</b><br>{b}</div>' for a, b in deler) + '</div>'
    pages.append(pg(f'''
{banner(t('banner_oversikt'))}
{card('<p>' + t('oversikt_lead') + '</p>' + deler_html)}
''', 6))

    pages.append(pg(f'''
{banner(t('banner_ring'))}
<p>{t('ring_lead')}</p>
{card('<p>' + t('ring_txt') + '</p>')}
''', 7))

    ellie_rows = T['ellie_rows']['no'] if lang == 'no' else T['ellie_rows_en']['no']
    pages.append(pg(f'''
{banner(t('banner_ellie'))}
<p>{t('ellie_lead')}</p>
{card(otab(ellie_rows, head3[lang]))}
{cme(t('ellie_ferdig'))}
''', 8))

    pages.append(pg(f'''
{banner(t('banner_speil'))}
<p>{t('speil_lead')}</p>
{card('<p>' + t('speil_txt') + '</p>')}
{cme(t('speil_note'))}
''', 9))

    pages.append(pg(f'''
{banner(t('banner_gjenkjent'))}
<p>{t('gjenkjent_lead')}</p>
{rosep(t('pill_blad'))}
{card('<p>' + t('blad_txt') + '</p>')}
{sagep(t('pill_blomst'))}
{card('<p>' + t('blomst_txt') + '</p>')}
''', 10))

    pages.append(pg(f'''
{rosep(t('pill_sky'))}
{card('<p>' + t('sky_txt') + '</p>')}
{sagep(t('pill_stjerne'))}
{card('<p>' + t('stjerne_txt') + '</p>')}
''', 11))

    pages.append(pg(f'''
{banner(t('banner_mane_regnbue'))}
{rosep(t('pill_mane'))}
{card('<p>' + t('mane_txt') + '</p>')}
{sagep(t('pill_regnbue'))}
{card('<p>' + t('regnbue_txt') + '</p>')}
''', 12))

    kuler_rows = T['kuler_rows']['no'] if lang == 'no' else T['kuler_rows_en']['no']
    pages.append(pg(f'''
{banner(t('banner_kuler'))}
<p>{t('kuler_lead')}</p>
{card(otab(kuler_rows, head3[lang]))}
{cme(t('kuler_ferdig'))}
''', 13))

    pages.append(pg(f'''
{banner(t('banner_teknikker'))}
<p>{t('teknikker_lead')}</p>
{rosep(t('pill_boble'))}
{card('<p>' + t('boble_txt') + '</p>')}
{sagep(t('pill_ribb'))}
{card('<p>' + t('ribb_txt') + '</p>')}
{rosep(t('pill_popcorn'))}
{card('<p>' + t('popcorn_txt') + '</p>')}
''', 14))

    pages.append(pg(f'''
{banner(t('banner_ekstra'))}
{sagep(t('pill_knitrelyd'))}
{card('<p>' + t('knitrelyd_txt') + '</p>')}
{rosep(t('pill_bjelle'))}
{card('<p>' + t('bjelle_txt') + '</p>')}
{sagep(t('pill_band'))}
{card('<p>' + t('band_txt') + '</p>')}
''', 15))

    mo_steg = T['montering_steg']['no'] if lang == 'no' else T['montering_steg_en']['no']
    pages.append(pg(f'''
{banner(t('banner_montering'))}
{card(steps(mo_steg))}
''', 16))

    foto_caps = T['foto_captions']['no'] if lang == 'no' else T['foto_captions']['en']
    pages.append(pg(f'''
{banner(t('banner_foto'))}
{card('<p class="center">' + t('foto_lead') + '</p>')}
{photo_row(foto_caps)}
''', 17))

    regler = T['regler']['no'] if lang == 'no' else T['regler']['en']
    pages.append(pg(f'''
{banner(t('banner_sikkerhet'))}
{rosep(t('pill_smadeler'))}
{card('<p>' + t('smadeler_txt') + '</p>')}
{sagep(t('pill_regler'))}
{card(ul(regler))}
''', 18))

    pages.append(pg(f'''
{banner(t('banner_stell'))}
{cme(t('stell_txt'))}
{rosep(t('pill_qr'))}
{qr_placeholder(t('qr_caption'))}
''', 19))

    kolliste = T['kolleksjon_liste']['no'] if lang == 'no' else T['kolleksjon_liste']['en']
    pages.append(pg(f'''
{banner(t('banner_ferdig'))}
{cream('<p class="creamtitle">' + t('ferdig_txt') + '</p>')}
{sagep(t('pill_kolleksjon'))}
{card(ul(kolliste))}
{rosep(t('pill_copyright'))}
{card('<p class="small center">' + t('copyright_txt') + '</p>')}
<div class="byline">
  <div class="by2">{t('by1')} &middot; {t('by2')} &middot; {t('by3')}</div>
</div>
''', 20))

    return pages

for lang in ('no', 'en'):
    html_doc = kit.doc(lang, T['doctitle'][lang], None, build(lang))
    out = BASE / f'aktivitetsleke_{lang}.html'
    out.write_text(html_doc, encoding='utf-8')
    print('OK', lang, len(html_doc), 'tegn/chars')
