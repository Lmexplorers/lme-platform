# -*- coding: utf-8 -*-
"""Genererer LME-hekleoppskrift 'Ellies smokkelenke' (norsk + engelsk) som HTML,
klar for PDF-print med Chromium. Del av LME Baby Collection 'Woodland Dreams'."""
import base64, pathlib, sys

BASE = pathlib.Path(__file__).parent
sys.path.insert(0, str(BASE.parent / '_shared'))
import lme_pattern_kit as kit
from lme_pattern_kit import (BROWN, BROWN_MID, BROWN_DARK, CREAM, CREAM_DEEP, ROSE, SAGE, INK,
                              banner, rosep, sagep, card, cream, cme, ul, steps, otab, abbrtab,
                              photo_row, qr_placeholder)

FACE_REF = BASE / 'ellie_face_ref.png'
face_b64 = base64.b64encode(FACE_REF.read_bytes()).decode()
face_src = f'data:image/png;base64,{face_b64}'

T = {}
def add(key, no, en=None):
    T[key] = {'no': no, 'en': en if en is not None else no}

# ---------------------------------------------------------------- SIDE 1
add('doctitle', 'Ellies smokkelenke, LME hekleoppskrift', 'Ellie\'s Pacifier Clip, LME crochet pattern')
add('ph2', 'LME HEKLEOPPSKRIFT&nbsp;&nbsp;|&nbsp;&nbsp;ELLIES SMOKKELENKE',
    'LME CROCHET PATTERN&nbsp;&nbsp;|&nbsp;&nbsp;ELLIE\'S PACIFIER CLIP')
add('covertag', 'LME HEKLEOPPSKRIFT - BABY', 'LME CROCHET PATTERN - BABY')
add('covertitle', 'ELLIES SMOKKELENKE', "ELLIE'S PACIFIER CLIP")
add('subpill', 'LME BABY COLLECTION - WOODLAND DREAMS', 'LME BABY COLLECTION - WOODLAND DREAMS')
add('cover_desc',
    'En liten smokkelenke med et forenklet dådyrhode inspirert av Ellie, en blomst, et blad og '
    'noen myke heklede kuler. Heklet i de samme naturfargene som resten av kolleksjonen. Maks '
    'lengde er satt for å følge gjeldende sikkerhetsanbefaling for smokkeholdere.',
    "A little pacifier clip with a simplified deer head inspired by Ellie, a flower, a leaf and a "
    "few soft crocheted balls. Crocheted in the same natural colours as the rest of the "
    "collection. Maximum length follows current safety guidance for soother holders.")
add('by1', 'Av Renate Dahl', 'By Renate Dahl')
add('by2', 'Little Montessori Explorers', 'Little Montessori Explorers')
add('by3', 'lmexplorers.com', 'lmexplorers.com')
add('cover_tip',
    'VIKTIG: Les sikkerhetssiden nøye før du begynner, og kontroller alltid ferdig lenke mot '
    'gjeldende lokale sikkerhetskrav for smokkeholdere før den tas i bruk eller selges.',
    'IMPORTANT: Read the safety page carefully before you start, and always check the finished '
    'clip against current local safety requirements for soother holders before use or sale.')

# ---------------------------------------------------------------- SIDE 2
add('banner_om', 'OM ELLIES SMOKKELENKE', "ABOUT ELLIE'S PACIFIER CLIP")
add('pill_historien', 'DEL AV ELLIES VERDEN', "PART OF ELLIE'S WORLD")
add('om_historien',
    'Ellies smokkelenke hører til LME Baby Collection "Woodland Dreams", samme skogsunivers som '
    'Ellie, det lille dådyret. Det lille dådyrhodet på lenken er en forenklet utgave av Ellie, '
    'akkurat stor nok til å henge trygt og lekent ved siden av smokken. Blomsten og bladet er '
    'hentet fra den samme blomsterengen Ellie elsker å utforske.',
    'Ellie\'s pacifier clip belongs to the LME Baby Collection "Woodland Dreams", the same '
    'woodland world as Ellie, the little fawn. The small deer head on the clip is a simplified '
    'version of Ellie, just the right size to hang safely and playfully next to the pacifier. '
    'The flower and leaf are picked from the same flower meadow Ellie loves to explore.')
add('pill_stil', 'STIL', 'STYLE')
add('om_stil',
    'Minimalistisk, Montessori-inspirert og skandinavisk, i de samme naturfargene som Ellie: '
    'brunt, kremhvitt, pudderrosa og salviegrønt. Rolig og enkelt, aldri overlesset.',
    'Minimalist, Montessori-inspired and Scandinavian, in the same natural colours as Ellie: '
    'brown, cream, powder pink and sage green. Calm and simple, never cluttered.')
add('pill_sikkerhet_kort', 'VIKTIGST AV ALT: SIKKERHET', 'MOST IMPORTANT OF ALL: SAFETY')
add('om_sikkerhet_kort',
    'En smokkelenke er noe barnet har tett på ansiktet, ofte alene i vogn eller seng. Derfor er '
    'lengden på denne oppskriften bevisst kort, og hele side 14 er viet sikkerhet. Les den siden '
    'før du hekler videre.',
    "A pacifier clip is something a baby has close to their face, often alone in a pram or bed. "
    "That's why this pattern's length is deliberately short, and all of page 14 is dedicated to "
    "safety. Read that page before you crochet on.")

# ---------------------------------------------------------------- SIDE 3
add('banner_mat', 'MATERIALER OG GARNALTERNATIVER', 'MATERIALS AND YARN ALTERNATIVES')
add('pill_garn', 'GARN', 'YARN')
add('garn_txt',
    'Bystrikk Merino (brun og kremhvit), rester av pudderrosa og salviegrønt til blomst og blad. '
    'Samme garn som resten av Ellie-kolleksjonen, så restene fra de andre oppskriftene ofte '
    'strekker til.',
    'Bystrikk Merino (brown and cream), leftover powder pink and sage green for the flower and '
    'leaf. Same yarn as the rest of the Ellie collection, so leftovers from the other patterns '
    'often stretch to cover this.')
add('garn_alt',
    'Alternativt garn: Enhver myk bomullsblanding i DK-tykkelse (fx. DROPS Safran, Hobbii Amigo, '
    'Rico Ricorumi) fungerer fint. Unngå akryl helt nær munnen, bomull er lettest å vaske rent.',
    'Alternative yarn: any soft cotton-blend DK-weight yarn (e.g. DROPS Safran, Hobbii Amigo, '
    'Rico Ricorumi) works well. Avoid acrylic close to the mouth, cotton is easiest to wash clean.')
add('pill_utstyr', 'UTSTYR OG TILBEHØR', 'TOOLS AND SUPPLIES')
add('utstyr', [
    ('Heklenål 3 eller 3,5 mm', 'litt tettere enn Ellie selv, siden delene er små'),
    ('Polyesterfiber til fyll', 'liten mengde'),
    ('Stoppenål med butt spiss', 'til all somming'),
    ('Rund treklips uten metallfjær', 'BPA-fri, beregnet for barn (se side om sikkerhet)'),
    ('Trering, ca. 3 cm', 'valgfri, mellom lenken og smokken'),
    ('Tvinnet bomullstråd og nål', 'til å sy delene godt fast'),
    ('Saks og målebånd', ''),
])
add('pill_perler', 'MED ELLER UTEN PERLER', 'WITH OR WITHOUT BEADS')
add('perler_txt',
    'Denne oppskriften kan hekles helt uten perler (kun heklede kuler), eller varieres med '
    'perler mellom de heklede delene:',
    'This pattern can be crocheted entirely without beads (crocheted balls only), or varied with '
    'beads between the crocheted pieces:')
add('perler_alt', [
    ('Uten perler', 'kun heklede kuler og motiver. Tryggest og enklest, anbefalt for de minste.',
     'Without beads', 'crocheted balls and motifs only. Safest and simplest, recommended for the youngest babies.'),
    ('Med treperler', 'umalte, CE-merkede treperler beregnet for barn, med hull stort nok for tykk tråd.',
     'With wooden beads', 'unpainted, CE-marked wooden beads intended for children, with a hole wide enough for thick cord.'),
    ('Med silikonperler', 'matte, BPA-frie silikonperler beregnet for tyggelenker/babyprodukter.',
     'With silicone beads', 'matte, BPA-free silicone beads intended for teething/baby products.'),
])

# ---------------------------------------------------------------- SIDE 4
add('banner_klar', 'VANSKELIGHETSGRAD, MÅL OG FASTHET', 'DIFFICULTY, SIZE AND GAUGE')
add('pill_vanskelig', 'VANSKELIGHETSGRAD', 'DIFFICULTY')
add('vanskelig_txt', 'Lett til middels. Fin som første amigurumi-prosjekt.',
    'Easy to medium. A good first amigurumi project.')
add('pill_mal', 'FERDIG LENGDE', 'FINISHED LENGTH')
add('mal_txt',
    'Maks 22 cm total lengde, strukket ut fra klips til smokk-feste, i tråd med EN 12586. Se '
    'side om sikkerhet for full forklaring. Hekle aldri lenken lengre enn dette, uansett alder.',
    'Max 22 cm total length, stretched out from the clip to the pacifier loop, in line with '
    'EN 12586. See the safety page for the full explanation. Never crochet the clip longer than '
    'this, regardless of age.')
add('pill_fasthet', 'HEKLEFASTHET', 'GAUGE')
add('fasthet_txt',
    'Hekle stramt, amigurumi-fasthet: ca. 20 fm x 22 omganger = 10 x 10 cm på nål 3 mm. Fyllet '
    'skal ikke synes gjennom maskene på de heklede kulene og dådyrhodet.',
    'Crochet tightly, amigurumi tension: approx. 20 sc x 22 rounds = 10 x 10 cm on a 3 mm hook. '
    'The stuffing should not show through the stitches on the crocheted balls and deer head.')

# ---------------------------------------------------------------- SIDE 5
add('banner_ord', 'FORKORTELSER (NORSK OG US)', 'ABBREVIATIONS (NORWEGIAN AND US)')
add('ord_lead',
    'Denne oppskriften bruker litt flere hekleteknikker enn en ren amigurumi-figur, siden '
    'blomsten og bladet trenger stav og halvstav. Her er alle forkortelsene, med de vanlige '
    'amerikanske hekletermene ved siden av.',
    'This pattern uses a few more crochet techniques than a plain amigurumi figure, since the '
    'flower and leaf need double and half double crochet. Here are all the abbreviations, with '
    'the common US crochet terms alongside.')
add('ord_head', ['Norsk', 'US', 'Betyr'], ['Norwegian', 'US', 'Means'])
add('ord_rows', [
    ('lm', 'ch', 'luftmaske / chain'),
    ('fm', 'sc', 'fastmaske / single crochet'),
    ('halvstav', 'hdc', 'halv stav / half double crochet'),
    ('stav', 'dc', 'stav / double crochet'),
    ('kjm', 'sl st', 'kjedemaske / slip stitch'),
    ('magisk ring', 'magic ring', 'justerbar startring uten hull i midten'),
    ('økn', 'inc', 'økning: 2 fm i samme maske. Gir én maske mer.'),
    ('mink', 'dec', 'minking: 2 fm sammen. Gir én maske mindre.'),
    ('m', 'st(s)', 'maske(r)'),
    ('( )', '( )', 'totalt antall masker på omgangen'),
    ('*...*', '*...*', 'gjenta det mellom stjernene så mange ganger som står bak'),
])
add('pill_tips', 'TIPS FØR DU BEGYNNER', 'TIPS BEFORE YOU START')
add('tips', [
    'Legg alle delene ved siden av hverandre før du monterer, så du ser hvordan lengden blir.',
    'Mål alltid den ferdige lenken strukket helt ut, ikke avslappet, når du sjekker lengden.',
    'Hekle gjerne et par ekstra kuler i reserve, i tilfelle du vil justere lengden underveis.',
    'Bruk kun tvinnet, sterk bomullstråd til monteringen, aldri tynn synål-tråd.',
])
add('tips_en', [
    'Lay all the pieces out side by side before assembling, so you can see how the length works out.',
    'Always measure the finished clip fully stretched out, not relaxed, when checking the length.',
    'Crochet a couple of spare balls, in case you want to adjust the length as you go.',
    'Use only strong, twisted cotton thread for assembly, never thin sewing thread.',
])

# ---------------------------------------------------------------- SIDE 6
add('banner_oversikt', 'SLIK ER SMOKKELENKEN BYGGET OPP', 'HOW THE PACIFIER CLIP IS BUILT')
add('oversikt_lead',
    'Fire typer deler hekles hver for seg og tres/sys sammen til slutt langs en kort snor eller '
    'direkte til hverandre:',
    'Four types of pieces are crocheted separately, then threaded or sewn together at the end '
    'along a short cord, or directly to each other:')
add('oversikt_deler', [
    ('1. Det lille dådyrhodet', 'forenklet Ellie, én per lenke', '1. The little deer head', 'a simplified Ellie, one per clip'),
    ('2. Blomsten', 'flat, seks kronblad', '2. The flower', 'flat, six petals'),
    ('3. Bladet', 'flatt, salviegrønt', '3. The leaf', 'flat, sage green'),
    ('4. De heklede kulene', 'så mange du trenger for å fylle ut lengden', '4. The crocheted balls', 'as many as you need to fill out the length'),
])

# ---------------------------------------------------------------- SIDE 7: DÅDYRHODET
add('banner_hode', 'DEL 1: DET LILLE DÅDYRHODET', 'PART 1: THE LITTLE DEER HEAD')
add('hode_lead',
    'En forenklet, liten utgave av Ellies hode, uten egne ører eller ansiktsfelt. Hekles i '
    'spiral, brunt.',
    "A simplified, small version of Ellie's head, without separate ears or a face patch. "
    "Crocheted in a spiral, brown.")
head3 = {'no': ['Omg', 'Beskrivelse', 'Masker'], 'en': ['Rnd', 'Description', 'Sts']}
add('hode_rows', [
    ('1', '6 fm i magisk ring', 6),
    ('2', 'økn x 6', 12),
    ('3', '(1 fm, økn) x 6', 18),
    ('4', '(2 fm, økn) x 6', 24),
    ('5 til 8', '24 fm, 4 omganger uten økning', 24),
    ('9', '(2 fm, mink) x 6 - fyll godt herfra', 18),
    ('10', '(1 fm, mink) x 6', 12),
    ('11', 'mink x 6', 6),
])
add('hode_rows_en', [
    ('1', '6 sc in a magic ring', 6),
    ('2', 'inc x 6', 12),
    ('3', '(1 sc, inc) x 6', 18),
    ('4', '(2 sc, inc) x 6', 24),
    ('5 to 8', '24 sc, 4 rounds with no increases', 24),
    ('9', '(2 sc, dec) x 6 - stuff firmly from here', 18),
    ('10', '(1 sc, dec) x 6', 12),
    ('11', 'dec x 6', 6),
])
add('hode_ferdig',
    'Klipp av, la ca. 20 cm trådende igjen. Diameter ca. 3,5 til 4 cm.',
    'Cut the yarn, leaving a tail of approx. 20 cm. Diameter approx. 3.5 to 4 cm.')
add('pill_orer_mini', 'TO SMÅ ØRER', 'TWO SMALL EARS')
add('orer_mini_txt',
    'Hekle to små flate sirkler i brunt: 5 fm i magisk ring, avslutt. Sy dem fast øverst på '
    'hodet, med litt avstand mellom.',
    'Crochet two small flat circles in brown: 5 sc in a magic ring, fasten off. Sew them onto '
    'the top of the head, with a little space between.')
add('pill_ansikt_mini', 'ANSIKTET, BRODERT', 'THE FACE, EMBROIDERED')
add('ansikt_mini_txt',
    'Brodér to små, runde øyne i svart satengsting og en liten trekantet nese under. Ikke bruk '
    'sikkerhetsøyne med plastdeler her, siden lenken skal være helt uten harde eller løse deler. '
    'Se referansebildet fra Ellie for inspirasjon til uttrykket, i miniatyr.',
    'Embroider two small, round eyes in black satin stitch and a tiny triangular nose below. Do '
    'not use plastic safety eyes here, since the clip must be entirely free of hard or loose '
    'parts. See the reference photo from Ellie for inspiration on the expression, in miniature.')

# ---------------------------------------------------------------- SIDE 8: BLOMST OG BLAD
add('banner_blomst', 'DEL 2: BLOMSTEN OG BLADET', 'PART 2: THE FLOWER AND THE LEAF')
add('pill_blomst', 'BLOMSTEN (PUDDERROSA)', 'THE FLOWER (POWDER PINK)')
add('blomst_txt',
    'Hekle 12 fm i magisk ring. Ikke lukk omgangen, fortsett rett inn i kronbladene: '
    '*hopp over 1 m, i neste m: 1 kjm, 1 lm, 3 stav, 1 lm, 1 kjm*, gjenta rundt til du har seks '
    'kronblad. Avslutt med kjedemaske og klipp av med god tråd igjen.',
    'Crochet 12 sc in a magic ring. Do not join the round, continue straight into the petals: '
    '*skip 1 st, in the next st: 1 sl st, 1 ch, 3 dc, 1 ch, 1 sl st*, repeat around until you '
    'have six petals. Finish with a slip stitch and cut, leaving a long tail.')
add('pill_blad', 'BLADET (SALVIEGRØNT)', 'THE LEAF (SAGE GREEN)')
add('blad_txt',
    'Legg opp 7 lm. Start i 2. lm fra nålen: 1 kjm, 1 fm, 1 halvstav, 2 stav i siste lm '
    '(tuppen), snu og fortsett på den andre siden av kjeden: 1 halvstav, 1 fm, 1 kjm. Avslutt og '
    'klipp av med god tråd igjen.',
    'Chain 7. Starting in the 2nd ch from the hook: 1 sl st, 1 sc, 1 hdc, 2 dc in the last ch '
    '(the tip), turn and continue along the other side of the chain: 1 hdc, 1 sc, 1 sl st. '
    'Fasten off, leaving a long tail.')
add('pill_montering_motiv', 'FEST BLOMST OG BLAD TIL HODET', 'ATTACH THE FLOWER AND LEAF TO THE HEAD')
add('montering_motiv_txt',
    'Sy blomsten og bladet sammen, og fest dem godt til siden av dådyrhodet eller rett ved '
    'siden av på snoren, akkurat som Ellies egen sløyfe. Bruk mange, tette sting.',
    "Sew the flower and leaf together, and attach them securely to the side of the deer head or "
    "right next to it on the cord, just like Ellie's own bow. Use plenty of tight stitches.")

# ---------------------------------------------------------------- SIDE 9: KULENE
add('banner_kuler', 'DEL 3: DE HEKLEDE KULENE', 'PART 3: THE CROCHETED BALLS')
add('kuler_lead',
    'Hekle så mange kuler du trenger for å fylle ut lengden mellom klipsen og dådyrhodet, '
    'gjerne i en rytme av brunt og kremhvitt. Husk: total lengde skal aldri bli mer enn 22 cm.',
    'Crochet as many balls as you need to fill out the length between the clip and the deer '
    'head, for example alternating brown and cream. Remember: the total length must never '
    'exceed 22 cm.')
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
    'Fyll lett, klipp av med god tråd igjen på hver kule. Diameter ca. 1,5 cm. Antall kuler '
    'avhenger av hvor stor trering og klips du bruker, tell alltid opp hele lenken før du fester '
    'noe permanent.',
    'Stuff lightly, cut with a long tail on each ball. Diameter approx. 1.5 cm. The number of '
    'balls depends on the size of the wooden ring and clip you use, always lay out the whole '
    'clip before attaching anything permanently.')

# ---------------------------------------------------------------- SIDE 10: MONTERING
add('banner_montering', 'MONTERING, STEG FOR STEG', 'ASSEMBLY, STEP BY STEP')
add('montering_lead',
    'Legg alle delene ut i den rekkefølgen du vil ha dem, og mål hele lenken strukket ut før du '
    'syr eller knyter noe fast.',
    'Lay out all the pieces in the order you want them, and measure the whole clip fully '
    'stretched out before you sew or tie anything in place.')
add('montering_steg', [
    'Tre eller sy kulene (og eventuelle perler) i ønsket rekkefølge på en kort, sterk bomullssnor '
    'eller direkte sammen med tett heftesting mellom hver del.',
    'Fest dådyrhodet i den ene enden, og sy blomsten og bladet ved siden av det.',
    'Fest en trering (hvis du bruker det) i den andre enden, som festepunkt for smokken.',
    'Mål hele lenken strukket helt ut. Er den lengre enn 22 cm, ta bort en kule eller to.',
    'Sy den ferdige lenken godt fast i den runde treklipsen, med mange, tette sting eller en '
    'sikker metallfri festemekanisme beregnet for smokkeholdere.',
    'Fest alle løse tråder godt på innsiden av delene, og klipp av det som er igjen.',
])
add('montering_steg_en', [
    'Thread or sew the balls (and any beads) in the order you want, on a short, strong cotton '
    'cord, or sew them directly together with tight running stitch between each piece.',
    'Attach the deer head at one end, and sew the flower and leaf on next to it.',
    'Attach a wooden ring (if using one) at the other end, as the pacifier attachment point.',
    'Measure the whole clip fully stretched out. If it is longer than 22 cm, remove a ball or two.',
    'Sew the finished clip securely onto the round wooden clip, with plenty of tight stitches or '
    'a secure, metal-free fastening mechanism designed for soother holders.',
    'Fasten every loose end securely on the inside of the pieces, and trim what is left.',
])

# ---------------------------------------------------------------- SIDE 11: FOTOVEILEDNING
add('banner_foto', 'FOTOVEILEDNING', 'PHOTO GUIDE')
add('foto_lead',
    'Sett inn egne bilder av hvert steg her når du har heklet lenken selv, det gjør oppskriften '
    'enda lettere å følge for neste hekler.',
    'Add your own photos of each step here once you have crocheted the clip yourself, it makes '
    'the pattern even easier to follow for the next crocheter.')
add('foto_captions',
    ['Dådyrhodet ferdig', 'Blomst og blad', 'Kulene på rekke', 'Ferdig montert lenke'],
    ['The finished deer head', 'Flower and leaf', 'The balls in a row', 'The fully assembled clip'])

# ---------------------------------------------------------------- SIDE 12: SIKKERHET (kritisk)
add('banner_sikkerhet', 'SIKKERHET, DEN VIKTIGSTE SIDEN', 'SAFETY, THE MOST IMPORTANT PAGE')
add('pill_lengde', 'MAKS LENGDE: 22 CM', 'MAX LENGTH: 22 CM')
add('lengde_txt',
    'Denne oppskriften følger prinsippet i den europeiske standarden EN 12586 for '
    'smokkeholdere: en enkel smokkelenke (klips + snor/lenke uten andre feste- eller '
    'opphengsfunksjoner) skal ikke være lengre enn 220 mm (22 cm) strukket helt ut. Formålet er '
    'å gjøre det umulig for lenken å danne en løkke rundt barnets hals. Hekle aldri en lenke '
    'lengre enn dette, uansett hvor gammelt barnet er.',
    'This pattern follows the principle in the European standard EN 12586 for soother holders: '
    'a simple pacifier clip (clip + strap/chain with no other attachment features) must not be '
    'longer than 220 mm (22 cm) fully stretched out. The purpose is to make it impossible for '
    'the strap to form a loop around the child\'s neck. Never crochet a clip longer than this, '
    'regardless of the child\'s age.')
add('pill_regler', 'FLERE VIKTIGE REGLER', 'MORE IMPORTANT RULES')
add('regler', [
    'Brukes alltid under tilsyn av en voksen. Ta av smokkelenken når barnet sover, ligger alene '
    'i vogn eller seng, eller er uten tilsyn.',
    'Ingen deler limes. Alt sys eller knytes fast med sterk, tvinnet bomullstråd og dobbel knute.',
    'Bruk kun umalte/CE-merkede treperler eller BPA-frie silikonperler beregnet for barn, aldri '
    'perler eller pynt beregnet for voksne smykker.',
    'Bruk en treklips uten metallfjær eller skarpe kanter, og fest lenken til klipsen med mange, '
    'tette sting.',
    'Sjekk lenken jevnlig for slitasje: løse tråder, sprekker i perler, eller deler som har '
    'blitt myke eller løse. Kast lenken umiddelbart hvis noe er galt.',
    'Denne oppskriften er en veiledning for hjemmebruk. Skal det ferdige produktet selges, må '
    'det alltid kontrolleres, testes og eventuelt merkes i henhold til gjeldende lokale '
    'sikkerhetskrav og regelverk for barneprodukter, som kan avvike fra og oppdateres utover '
    'det som er beskrevet her.',
])
add('regler_en', [
    'Always use under adult supervision. Remove the pacifier clip when the child is sleeping, '
    'lying alone in a pram or bed, or unsupervised.',
    'No parts are glued. Everything is sewn or tied on with strong, twisted cotton thread and a '
    'double knot.',
    'Use only unpainted/CE-marked wooden beads or BPA-free silicone beads intended for children, '
    'never beads or trim intended for adult jewellery.',
    'Use a wooden clip with no metal spring or sharp edges, and attach the clip with plenty of '
    'tight stitches.',
    'Check the clip regularly for wear: loose threads, cracked beads, or parts that have gone '
    'soft or loose. Discard the clip immediately if anything is wrong.',
    'This pattern is a guide for home use. If the finished product is sold, it must always be '
    'checked, tested and marked as required under current local safety requirements and '
    'regulations for children\'s products, which may differ from and be updated beyond what is '
    'described here.',
])

# ---------------------------------------------------------------- SIDE 13: STELL
add('banner_stell', 'STELL OG VASK', 'CARE AND WASHING')
add('stell_txt',
    'Håndvask i lunkent vann med litt mild såpe. Skyll godt. Klem forsiktig ut vannet i et '
    'håndkle, ikke vri. Legg til tørk flatt. Unngå maskinvask, siden trevirke og perler kan ta '
    'skade.',
    'Hand wash in lukewarm water with a little mild soap. Rinse well. Gently press out the '
    'water in a towel, do not wring. Lay flat to dry. Avoid machine washing, since wood and '
    'beads can be damaged.')
add('pill_qr', 'VIDEOVEILEDNING', 'VIDEO GUIDE')
add('qr_caption', 'QR-kode til videoveiledning (legges til)', 'QR code to video guide (to be added)')

# ---------------------------------------------------------------- SIDE 14: FERDIG
add('banner_ferdig', 'GRATULERER, LENKEN ER FERDIG!', 'CONGRATULATIONS, THE CLIP IS DONE!')
add('ferdig_txt',
    'Nå har du heklet din egen smokkelenke til Ellie-kolleksjonen. Husk å sjekke lengden en '
    'siste gang før den tas i bruk!',
    "Now you have crocheted your own pacifier clip for the Ellie collection. Remember to check "
    "the length one last time before it's used!")
add('pill_kolleksjon', 'RESTEN AV LME BABY COLLECTION', 'THE REST OF THE LME BABY COLLECTION')
add('kolleksjon_liste',
    ['Ellie, det lille dådyret', 'Ellies aktivitetsleke', 'Ellies rangle', 'Ellies vognlenke',
     'Ellies ballerinasko med sløyfe'],
    ['Ellie, the little fawn', "Ellie's activity toy", "Ellie's rattle", "Ellie's stroller toy",
     "Ellie's ballerina shoes with a bow"])
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

    perler_items = [f"<b>{a}:</b> {b}" for (a, b, _, _) in T['perler_alt']['no']] if lang == 'no' else \
                   [f"<b>{c}:</b> {d}" for (_, _, c, d) in T['perler_alt']['no']]
    utstyr_list = ul([f'<b>{a}</b>' + (f' &middot; {b}' if b else '') for a, b in T['utstyr']['no']])
    pages.append(pg(f'''
{banner(t('banner_mat'))}
{rosep(t('pill_garn'))}
{card('<p>' + t('garn_txt') + '</p><p class="small">' + t('garn_alt') + '</p>')}
{sagep(t('pill_utstyr'))}
{card(utstyr_list)}
{rosep(t('pill_perler'))}
{card('<p>' + t('perler_txt') + '</p>' + ul(perler_items))}
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

    ord_rows = T['ord_rows']['no']
    ord_table = abbrtab(ord_rows, T['ord_head'][lang])
    tips_items = T['tips']['no'] if lang == 'no' else T['tips_en']['no']
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
{sagep('MÅL' if lang == 'no' else 'SIZE')}
{cme(t('mal_txt'))}
''', 6))

    hode_rows = T['hode_rows']['no'] if lang == 'no' else T['hode_rows_en']['no']
    pages.append(pg(f'''
{banner(t('banner_hode'))}
<p>{t('hode_lead')}</p>
{card(otab(hode_rows, head3[lang]))}
{cme(t('hode_ferdig'))}
{rosep(t('pill_orer_mini'))}
{card('<p>' + t('orer_mini_txt') + '</p>')}
{sagep(t('pill_ansikt_mini'))}
<div class="twocol">
  <div>{card('<p>' + t('ansikt_mini_txt') + '</p>')}</div>
  <div class="figwrap"><img src="{face_src}" alt="Ellie ansikt, referanse"><div class="figcap small">{'Referanse: Ellies ansiktsuttrykk' if lang == 'no' else "Reference: Ellie's expression"}</div></div>
</div>
''', 7))

    pages.append(pg(f'''
{banner(t('banner_blomst'))}
{rosep(t('pill_blomst'))}
{card('<p>' + t('blomst_txt') + '</p>')}
{sagep(t('pill_blad'))}
{card('<p>' + t('blad_txt') + '</p>')}
{rosep(t('pill_montering_motiv'))}
{cme(t('montering_motiv_txt'))}
''', 8))

    kuler_rows = T['kuler_rows']['no'] if lang == 'no' else T['kuler_rows_en']['no']
    pages.append(pg(f'''
{banner(t('banner_kuler'))}
<p>{t('kuler_lead')}</p>
{card(otab(kuler_rows, head3[lang]))}
{cme(t('kuler_ferdig'))}
''', 9))

    mo_steg = T['montering_steg']['no'] if lang == 'no' else T['montering_steg_en']['no']
    pages.append(pg(f'''
{banner(t('banner_montering'))}
<p>{t('montering_lead')}</p>
{card(steps(mo_steg))}
''', 10))

    foto_caps = T['foto_captions']['no'] if lang == 'no' else T['foto_captions']['en']
    pages.append(pg(f'''
{banner(t('banner_foto'))}
{card('<p class="center">' + t('foto_lead') + '</p>')}
{photo_row(foto_caps)}
''', 11))

    regler = T['regler']['no'] if lang == 'no' else T['regler_en']['no']
    pages.append(pg(f'''
{banner(t('banner_sikkerhet'))}
{rosep(t('pill_lengde'))}
{card('<p>' + t('lengde_txt') + '</p>')}
{sagep(t('pill_regler'))}
{card(ul(regler))}
''', 12))

    pages.append(pg(f'''
{banner(t('banner_stell'))}
{cme(t('stell_txt'))}
{rosep(t('pill_qr'))}
{qr_placeholder(t('qr_caption'))}
''', 13))

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
''', 14))

    return pages

for lang in ('no', 'en'):
    html_doc = kit.doc(lang, T['doctitle'][lang], None, build(lang))
    out = BASE / f'smokkelenke_{lang}.html'
    out.write_text(html_doc, encoding='utf-8')
    print('OK', lang, len(html_doc), 'tegn/chars')
