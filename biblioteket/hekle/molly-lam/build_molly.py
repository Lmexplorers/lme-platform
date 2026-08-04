# -*- coding: utf-8 -*-
"""Genererer LME-hekleoppskrift 'Molly, det lille lammet' (norsk + engelsk) som HTML,
klar for PDF-print med Chromium. Del av LME Baby Collection 'Woodland Dreams',
Ellies skogvenn."""
import base64, pathlib, sys

BASE = pathlib.Path(__file__).parent
sys.path.insert(0, str(BASE.parent / '_shared'))
import lme_pattern_kit as kit
from lme_pattern_kit import (banner, rosep, sagep, card, cream, cme, ul, steps, otab, abbrtab,
                              BROWN, BROWN_MID, BROWN_DARK, CREAM,
                              CREAM_DEEP, ROSE, SAGE, INK)

HERO = BASE / 'molly_hero.jpg'
FACE = BASE / 'molly_face.jpg'
hero_src = f'data:image/jpeg;base64,{base64.b64encode(HERO.read_bytes()).decode()}'
face_src = f'data:image/jpeg;base64,{base64.b64encode(FACE.read_bytes()).decode()}'

YELLOW = '#EDD283'       # smørgul, sløyfe og krage
YELLOW_DARK = '#C9A94E'  # kant/skygge til smorgul

T = {}
def add(key, no, en=None):
    T[key] = {'no': no, 'en': en if en is not None else no}

head3 = {'no': ['Omg', 'Beskrivelse', 'Masker'], 'en': ['Rnd', 'Description', 'Sts']}
rowhead = {'no': ['Rad', 'Beskrivelse', 'Masker'], 'en': ['Row', 'Description', 'Sts']}

# ---------------------------------------------------------------- SIDE 1: FORSIDE
add('doctitle', 'Molly, det lille lammet, LME hekleoppskrift', 'Molly, the Little Lamb, LME crochet pattern')
add('ph2', 'LME HEKLEOPPSKRIFT&nbsp;&nbsp;|&nbsp;&nbsp;MOLLY, DET LILLE LAMMET',
    "LME CROCHET PATTERN&nbsp;&nbsp;|&nbsp;&nbsp;MOLLY, THE LITTLE LAMB")
add('covertag', 'LME HEKLEOPPSKRIFT - AMIGURUMI', 'LME CROCHET PATTERN - AMIGURUMI')
add('covertitle', 'MOLLY', 'MOLLY')
add('subpill', 'LME BABY COLLECTION - WOODLAND DREAMS', 'LME BABY COLLECTION - WOODLAND DREAMS')
add('cover_desc',
    'Molly er et lite, mykt lam med lange, slappe ører og en krøllete ulltopp heklet i tette '
    'løkkemasker, akkurat i samme uttrykk som Ellie, Pip og Felix. En smørgul sløyfe mellom '
    'ørene og en matchende volangkrage fullfører henne. Heklet i de samme varme naturfargene '
    'som resten av kolleksjonen. Et helt originalt LME-design, ferdig ca. 20 til 22 cm '
    'sittende. Middels vanskelighetsgrad.',
    'Molly is a small, soft lamb with long, floppy ears and a curly wool topknot crocheted in '
    'dense loop stitches, in the very same look as Ellie, Pip and Felix. A butter yellow bow '
    'between the ears and a matching ruffled collar complete her. Crocheted in the same warm '
    'natural colours as the rest of the collection. A fully original LME design, finished size '
    'approx. 20 to 22 cm sitting. Medium difficulty.')
add('by1', 'Av Renate Dahl', 'By Renate Dahl')
add('by2', 'Little Montessori Explorers', 'Little Montessori Explorers')
add('by3', 'lmexplorers.com', 'lmexplorers.com')
add('cover_tip',
    'TIPS: Les hele oppskriften én gang før du begynner, spesielt siden om ulltoppen, som '
    'bruker samme løkketeknikk som Pips pigger, men heklet tett som en liten ullhette.',
    "TIP: Read through the whole pattern once before you start, especially the page about the "
    "wool topknot, which uses the same loop technique as Pip's spikes, but crocheted densely "
    "like a little wool cap.")

# ---------------------------------------------------------------- SIDE 2: OM MOLLY
add('banner_om', 'OM MOLLY', 'ABOUT MOLLY')
add('pill_historien', 'DEL AV ELLIES VERDEN', "PART OF ELLIE'S WORLD")
add('om_historien',
    'Molly er den fjerde figuren i LME Baby Collection "Woodland Dreams", en av Ellies gode '
    'venner i skogen. Der Felix er den nysgjerrige oppdageren, er Molly den blide, litt '
    'sjenerte typen som helst vil synge for blomstene og legge seg i gresset når solen skinner. '
    'Flere skogvenner er på vei inn i kolleksjonen etter hvert.',
    'Molly is the fourth figure in the LME Baby Collection "Woodland Dreams", one of Ellie\'s '
    'good friends in the forest. Where Felix is the curious explorer, Molly is the cheerful, a '
    'little shy type who would rather sing to the flowers and lie down in the grass when the '
    'sun is shining. More woodland friends are on their way into the collection over time.')
add('pill_stil', 'STIL', 'STYLE')
add('om_stil',
    'Samme premium amigurumi-uttrykk som resten av familien: store former, myke overganger, '
    'rolige fargeskift og et vennlig, avrundet blikk. Molly er IKKE ullete og rotete i '
    'uttrykket, IKKE realistisk, og ulltoppen er heklet tett og myk, ikke stiv, slik at hun er '
    'trygg og god å klemme.',
    'The same premium amigurumi look as the rest of the family: big shapes, soft transitions, '
    'calm colour changes and a friendly, rounded gaze. Molly does NOT look woolly or messy, is '
    'NOT realistic, and the wool topknot is crocheted densely and soft, not stiff, so she is '
    'safe and nice to cuddle.')
add('pill_montessori', 'MONTESSORI-INSPIRERT', 'MONTESSORI-INSPIRED')
add('om_montessori',
    'Store, enkle former og rolige fargeblokker gjør Molly fin å kjenne på og lett å gjenkjenne '
    'for de minste, akkurat den typen konkrete, sanselige lek Montessori-filosofien bygger på.',
    'Big, simple shapes and calm blocks of colour make Molly nice to feel and easy for little '
    'ones to recognise, exactly the kind of concrete, sensory play the Montessori philosophy is '
    'built on.')

# ---------------------------------------------------------------- SIDE 3: STØRRELSE OG MATERIALER
add('banner_mat', 'STØRRELSE OG MATERIALER', 'SIZE AND MATERIALS')
add('pill_storrelse', 'FERDIG STØRRELSE', 'FINISHED SIZE')
add('storrelse_txt', 'Ca. 20 til 22 cm høy, sittende.', 'Approx. 20 to 22 cm tall, sitting.')
add('pill_garn', 'GARN', 'YARN')
add('garn_lead',
    'Bystrikk Merino gir en myk, tett amigurumi-overflate, godt egnet til den tette, krøllete '
    'ulltoppen.',
    'Bystrikk Merino gives a soft, firm amigurumi surface, well suited to the dense, curly wool '
    'topknot.')
add('garn_tabell_head', ['Farge', 'Til', 'Mengde'], ['Colour', 'For', 'Amount'])
add('garn_rows', [
    ('Bystrikk Merino, kremhvit (hovedfarge)', 'hodet, ulltoppen, ørene, kroppen, armene, bena',
     'ca. 2,5 nøster',
     'Bystrikk Merino, cream (main colour)', 'the head, the wool topknot, the ears, the body, '
     'the arms, the legs', 'approx. 2.5 skeins'),
    ('Bystrikk Merino, smørgult', 'sløyfen og volangkragen', 'litt',
     'Bystrikk Merino, butter yellow', 'the bow and the ruffled collar', 'small amount'),
    ('Rest, lyst brunt', 'nesen og potehovene', 'litt',
     'Leftover, light brown', 'the nose and the paw hooves', 'small amount'),
    ('Rest, pudderrosa', 'kinnene', 'litt',
     'Leftover, powder pink', 'the cheeks', 'small amount'),
    ('Svart broderigarn', 'øyenbryn, munn og vipper', 'litt',
     'Black embroidery thread', 'eyebrows, mouth and lashes', 'small amount'),
])
add('garn_alt',
    'Alternativt garn: DROPS Cotton Merino, eller enhver myk bomull/akryl-blanding i DK/aran-'
    'tykkelse (f.eks. Hobbii Amigo, Rico Ricorumi, Paintbox Simply DK), så lenge du hekler '
    'stramt nok til at fyllet ikke synes.',
    'Alternative yarn: DROPS Cotton Merino, or any soft cotton/acrylic-blend DK/aran-weight '
    'yarn (e.g. Hobbii Amigo, Rico Ricorumi, Paintbox Simply DK), as long as you crochet '
    'tightly enough that the stuffing does not show.')
add('pill_utstyr', 'HEKLENÅL OG UTSTYR', 'HOOK AND TOOLS')
add('utstyr', [
    ('Heklenål 4 mm', 'eller 3,5 mm hvis du hekler løst'),
    ('Polyesterfiber til fyll', 'ren, vaskbar leketøyfyll'),
    ('To 16 mm sikkerhetsøyne (versjon A), eller svart broderigarn (versjon B)', 'se side om '
     'ansiktet'),
    ('Stoppenål med butt spiss', 'til all somming'),
    ('Maskemarkør', 'en, eller en løkke garn i annen farge'),
    ('En linjal eller to fingre', 'som hjelp til å måle løkkene i ulltoppen, se side om '
     'ulltoppen'),
    ('Nål og tvinnet bomullstråd', 'til å sy på ører, sløyfe og krage'),
    ('Målebånd og saks', ''),
])

# ---------------------------------------------------------------- SIDE 4: FASTHET OG ORDLISTE
add('banner_fasthet', 'HEKLEFASTHET OG ORDLISTE', 'GAUGE AND GLOSSARY')
add('pill_fasthet', 'HEKLEFASTHET', 'GAUGE')
add('fasthet_txt',
    'Ca. 16 fm x 18 omganger = 10 x 10 cm, heklet STRAMT (amigurumi-fasthet) på nål 4 mm. '
    'Hekler du løsere enn dette, synes fyllet gjennom maskene og Molly blir myk og ustødig i '
    'stedet for fin og fast.',
    'Approx. 16 sc x 18 rounds = 10 x 10 cm, crocheted TIGHTLY (amigurumi tension) on a 4 mm '
    'hook. If you crochet looser than this, the stuffing shows through the stitches and Molly '
    'turns out soft and floppy instead of neat and firm.')
add('pill_ordliste', 'ORDLISTE OG FORKORTELSER', 'GLOSSARY AND ABBREVIATIONS')
add('ord_head', ['Kort', 'Betyr'], ['Short', 'Means'])
add('ord_rows', [
    ('lm', 'luftmaske', 'ch', 'chain stitch'),
    ('fm', 'fastmaske', 'sc', 'single crochet (UK: double crochet)'),
    ('halvstav', 'halv stav', 'hdc', 'half double crochet'),
    ('stav', 'stav', 'dc', 'double crochet'),
    ('kjm', 'kjedemaske', 'sl st', 'slip stitch'),
    ('løkkm', 'løkkemaske: stikk inn nålen, legg tråden rundt to fingre eller en linjal for å '
     'lage en løkke, dra løkken gjennom og fullfør som en vanlig fm. Løkken blir stående ut på '
     'utsiden av arbeidet, se side om ulltoppen.',
     'loop st', 'loop stitch: insert the hook, wrap the yarn around two fingers or a ruler to '
     'form a loop, pull the loop through and finish as a normal sc. The loop is left standing '
     'out on the right side of the work, see the page about the wool topknot.'),
    ('magisk ring', 'en justerbar startring som lukkes helt igjen, uten hull i midten',
     'magic ring', 'an adjustable starting ring that closes with no hole in the middle'),
    ('økn', 'økning: 2 fm i samme maske. Gir en maske mer.',
     'inc', 'increase: 2 sc in the same stitch. Adds one stitch.'),
    ('mink', 'minking: stikk nålen gjennom to masker samtidig og hekle dem som en fm. Gir en '
     'maske mindre.',
     'dec', 'decrease: insert the hook through two stitches at once and crochet them together '
     'as one sc. Removes one stitch.'),
    ('m', 'maske(r)', 'st(s)', 'stitch(es)'),
    ('omg / rad', 'omgang (rundt i spiral) / rad (frem og tilbake)', 'rnd / row',
     'round (worked in a spiral) / row (worked back and forth)'),
    ('( )', 'tallet i parentes til slutt er totalt antall masker på den omgangen/raden',
     '( )', 'the number in brackets at the end is the total stitch count for that round/row'),
    ('*...*', 'gjenta det som står mellom stjernene så mange ganger som står bak',
     '*...*', 'repeat what is between the stars as many times as stated afterwards'),
])
add('ord_note',
    'Hodet, ulltoppen, kroppen, armene og bena hekles i spiral med fastmasker, uten å avslutte '
    'omgangene. Ørene, sløyfen og kragen hekles frem og tilbake i rader. Sett gjerne en '
    'maskemarkør i første maske på hver spiraldel.',
    'The head, wool topknot, body, arms and legs are crocheted in a spiral of single crochet, '
    'without joining the rounds. The ears, bow and collar are crocheted back and forth in rows. '
    'Place a stitch marker in the first stitch of each spiral piece.')

# ---------------------------------------------------------------- SIDE 5: TIPS OG OVERSIKT
add('banner_oversikt', 'TIPS OG SLIK ER MOLLY BYGGET OPP', "TIPS AND HOW MOLLY IS BUILT")
add('pill_tips', 'TIPS FØR DU BEGYNNER', 'TIPS BEFORE YOU START')
add('tips',
    ['Hekle en liten prøvelapp med løkkemasker før du starter ulltoppen, så du finner en '
     'løkkelengde du liker, kortere enn på Pips pigger.',
     'Legg alle delene ved siden av hverandre før du syr noe fast, så du ser at Molly blir '
     'symmetrisk.',
     'Fyll litt og litt underveis i stedet for helt til slutt, det gir en jevnere, penere '
     'form.'],
    ['Crochet a small swatch with loop stitches before starting the wool topknot, so you find a '
     'loop length you like, shorter than on Pip\'s spikes.',
     'Lay all the pieces out next to each other before sewing anything on, so you can see that '
     'Molly turns out symmetrical.',
     'Stuff a little at a time as you go, rather than all at once at the end, it gives a more '
     'even, neater shape.'])
add('oversikt_lead',
    'Molly hekles i åtte deler, som sys sammen helt til slutt. Ingen deler limes, og alt sys '
    'godt fast slik at ingenting løsner. Gjør deg kjent med delene før du begynner:',
    'Molly is crocheted in eight pieces, which are all sewn together at the very end. No pieces '
    'are glued, and everything is sewn securely so that nothing comes loose. Get to know the '
    'pieces before you begin:')
add('oversikt_deler', [
    ('1. Hodet', 'stort og rundt, kremhvitt', '1. The head', 'big and round, cream'),
    ('2. Ulltoppen', 'tett, krøllete løkkehette over issen', '2. The wool topknot',
     'a dense, curly loop-stitch cap over the crown'),
    ('3. Ørene (x2)', 'lange og slappe, kremhvite', '3. The ears (x2)',
     'long and floppy, cream'),
    ('4. Kroppen', 'liten og rund, kremhvit', '4. The body', 'small and round, cream'),
    ('5. Armene (x2)', 'små og myke, korte', '5. The arms (x2)', 'small and soft, short'),
    ('6. Bena (x2)', 'runde, med sydde potehover', '6. The legs (x2)',
     'round, with sewn-on paw hooves'),
    ('7. Sløyfen', 'smørgul, mellom ørene', '7. The bow', 'butter yellow, between the ears'),
    ('8. Kragen', 'smørgul volangkrage', '8. The collar', 'a butter yellow ruffled collar'),
])
add('schematic_caption',
    'Målskisse: Molly sittende, ca. 20 til 22 cm høy og ca. 13 cm bred over armene.',
    'Size sketch: Molly sitting, approx. 20 to 22 cm tall and approx. 13 cm wide across the '
    'arms.')

# ---------------------------------------------------------------- SIDE 6: KROPPENS PROPORSJONER (diagram)
add('banner_proporsjoner', 'KROPPENS PROPORSJONER', 'BODY PROPORTIONS')
add('proporsjoner_lead',
    'Bruk denne skissen som en rettesnor mens du hekler, spesielt for å se hvor stor ulltoppen '
    'og ørene skal være i forhold til resten av kroppen.',
    "Use this sketch as a guide while you crochet, especially to see how big the wool topknot "
    "and the ears should be compared to the rest of the body.")

# ---------------------------------------------------------------- SIDE 7: DEL 1 HODET
add('banner_hode', 'DEL 1: HODET', 'PART 1: THE HEAD')
add('hode_lead',
    'Hodet hekles i spiral, ovenfra og ned, helt i kremhvitt. Det starter smalt, øker ut til '
    'bredest midt på, står rett en stund, og minker så ned igjen mot halsen.',
    'The head is crocheted in a spiral, from the top down, entirely in cream. It starts narrow, '
    'increases out to its widest point in the middle, stays even for a while, then decreases '
    'back down towards the neck.')
add('hode_rows', [
    ('1', '6 fm i magisk ring', 6),
    ('2', 'økn x 6', 12),
    ('3', '(1 fm, økn) x 6', 18),
    ('4', '(2 fm, økn) x 6', 24),
    ('5', '(3 fm, økn) x 6', 30),
    ('6', '(4 fm, økn) x 6', 36),
    ('7', '(5 fm, økn) x 6', 42),
    ('8', '(6 fm, økn) x 6', 48),
    ('9 til 16', '48 fm, 8 omganger uten økning', 48),
    ('17', '(6 fm, mink) x 6', 42),
    ('18', '(5 fm, mink) x 6', 36),
    ('19', '(4 fm, mink) x 6 - begynn å fylle godt og jevnt herfra', 30),
    ('20', '(3 fm, mink) x 6', 24),
    ('21', '(2 fm, mink) x 6', 18),
    ('22', '(1 fm, mink) x 6 - fyll siste rest', 12),
    ('23', 'mink x 6', 6),
])
add('hode_rows_en', [
    ('1', '6 sc in a magic ring', 6),
    ('2', 'inc x 6', 12),
    ('3', '(1 sc, inc) x 6', 18),
    ('4', '(2 sc, inc) x 6', 24),
    ('5', '(3 sc, inc) x 6', 30),
    ('6', '(4 sc, inc) x 6', 36),
    ('7', '(5 sc, inc) x 6', 42),
    ('8', '(6 sc, inc) x 6', 48),
    ('9 to 16', '48 sc, 8 rounds with no increases', 48),
    ('17', '(6 sc, dec) x 6', 42),
    ('18', '(5 sc, dec) x 6', 36),
    ('19', '(4 sc, dec) x 6 - start stuffing firmly and evenly from here', 30),
    ('20', '(3 sc, dec) x 6', 24),
    ('21', '(2 sc, dec) x 6', 18),
    ('22', '(1 sc, dec) x 6 - stuff the last bit', 12),
    ('23', 'dec x 6', 6),
])
add('hode_ferdig',
    'Ikke klipp av trådenden. Trekk den forsiktig sammen gjennom de siste 6 maskene og bruk den '
    'samme trådenden til å feste hodet på kroppen senere. Hodet skal nå være fast og rundt, ca. '
    '9 cm i diameter.',
    'Do not cut the yarn. Gently gather it through the last 6 stitches and use that same yarn '
    'tail to attach the head to the body later. The head should now be firm and round, approx. '
    '9 cm in diameter.')

# ---------------------------------------------------------------- SIDE 8: DEL 2 ULLTOPPEN
add('banner_ulltopp', 'DEL 2: ULLTOPPEN', 'PART 2: THE WOOL TOPKNOT')
add('ulltopp_lead',
    'Dette er Molly sin signaturdel, samme løkketeknikk som Pips pigger, men heklet mye tettere '
    'og med kortere løkker, slik at det blir en myk, krøllete ullhette i stedet for en pigget '
    'overflate. Heklet i kremhvitt, og sys oppå issen til slutt.',
    "This is Molly's signature part, the same loop technique as Pip's spikes, but crocheted "
    "much more densely with shorter loops, so it becomes a soft, curly wool cap instead of a "
    "spiky surface. Crocheted in cream, and sewn onto the crown at the end.")
add('pill_lokketeknikk', 'LØKKETEKNIKKEN, TETT VARIANT', 'THE LOOP STITCH TECHNIQUE, DENSE VERSION')
add('lokketeknikk_txt',
    'Stikk nålen inn i masken som vanlig. Legg tråden rundt én finger (eller en tynn blyant, '
    'for jevnere lengde) i stedet for direkte over nålen, dra opp en løkke, og fullfør maskn '
    'som en vanlig fastmaske. Løkken blir stående igjen som en liten, tett krøll på utsiden av '
    'arbeidet. Kort, jevn løkkelengde, ca. 0,5 til 1 cm, gir det peneste, mest ulne resultatet, '
    'krøll gjerne løkken lett rundt fingeren når du er ferdig for et enda mer krøllete uttrykk.',
    'Insert the hook into the stitch as usual. Wrap the yarn around one finger (or a thin '
    'pencil, for an even length) instead of taking it directly over the hook, pull up a loop, '
    'and finish the stitch as a normal single crochet. The loop stays standing as a small, '
    'dense curl on the right side of the work. A short, even loop length, approx. 0.5 to 1 cm, '
    'gives the neatest, woolliest result, feel free to gently curl the loop around your finger '
    'once finished for an even curlier look.')
add('pill_ulltopp_felt', 'ULLTOPPEN, KREMHVIT', 'THE WOOL TOPKNOT, CREAM')
add('ulltopp_rows', [
    ('1', '6 fm i magisk ring', 6),
    ('2', 'økn x 6', 12),
    ('3', '(1 løkkm, økn) x 6', 18),
    ('4', '(2 løkkm, økn) x 6', 24),
    ('5', '(3 løkkm, økn) x 6', 30),
    ('6', '(4 løkkm, økn) x 6', 36),
    ('7 til 11', '36 løkkm, 5 omganger', 36),
])
add('ulltopp_rows_en', [
    ('1', '6 sc in a magic ring', 6),
    ('2', 'inc x 6', 12),
    ('3', '(1 loop st, inc) x 6', 18),
    ('4', '(2 loop st, inc) x 6', 24),
    ('5', '(3 loop st, inc) x 6', 30),
    ('6', '(4 loop st, inc) x 6', 36),
    ('7 to 11', '36 loop st, 5 rounds', 36),
])
add('ulltopp_ferdig',
    'Klipp av, la ca. 25 cm tråd igjen. Ikke fyll, ulltoppen skal ligge flatt som en liten '
    'hette. Sy den fast oppå issen, fra like over pannen og bakover, dekk et rundt felt som '
    'strekker seg ned mot der ørene skal festes på hver side, se side om ansiktet for nøyaktig '
    'plassering.',
    'Cut, leaving a tail of approx. 25 cm. Do not stuff, the topknot should lie flat like a '
    'little cap. Sew it onto the crown, from just above the forehead and backward, covering a '
    'round area that extends down towards where the ears will attach on each side, see the '
    'face page for exact placement.')

# ---------------------------------------------------------------- SIDE 9: DEL 3 ØRENE
add('banner_orer', 'DEL 3: ØRENE (2 STK)', 'PART 3: THE EARS (MAKE 2)')
add('orer_lead',
    'I motsetning til Felix sine spisse ører og Pips runde ører er Molly sine ører lange og '
    'slappe, akkurat som på et ekte lam. De hekles flatt i rader, i kremhvitt.',
    "Unlike Felix's pointed ears and Pip's round ears, Molly's ears are long and floppy, just "
    "like on a real lamb. They are crocheted flat in rows, in cream.")
add('orer_rows', [
    ('1', 'legg opp 9 lm + 1 vendemaske, 9 fm tilbake', 9),
    ('2', 'økn, 7 fm, økn', 11),
    ('3 til 8', 'rett, 11 fm, 6 rader', 11),
    ('9', 'mink, 7 fm, mink', 9),
    ('10', 'mink, 5 fm, mink', 7),
])
add('orer_rows_en', [
    ('1', 'chain 9 + 1 turning chain, 9 sc back across', 9),
    ('2', 'inc, 7 sc, inc', 11),
    ('3 to 8', 'straight, 11 sc, 6 rows', 11),
    ('9', 'dec, 7 sc, dec', 9),
    ('10', 'dec, 5 sc, dec', 7),
])
add('orer_ferdig',
    'Klipp av begge ørene, la ca. 20 cm tråd igjen. Ikke fyll, ørene skal være flate og myke. '
    'Brett det øverste hjørnet av hvert øre lett sammen og sy det fast øverst på hodet, rett '
    'ved kanten av ulltoppen, slik at resten av øret henger mykt og slapt nedover.',
    'Cut both ears, leaving a tail of approx. 20 cm. Do not stuff, the ears should be flat and '
    'soft. Fold the top corner of each ear gently together and sew it onto the top of the head, '
    'right at the edge of the wool topknot, so the rest of the ear hangs softly downward.')

# ---------------------------------------------------------------- SIDE 10: ANSIKTET (diagram)
add('banner_ansikt', 'ANSIKTET', 'THE FACE')
add('ansikt_lead',
    'Ansiktet er det som gir Molly liv. Ta deg god tid her, og prøv gjerne med knappenåler '
    'først før du syr eller fester noe fast.',
    "The face is what brings Molly to life. Take your time here, and try pinning things in "
    "place with safety pins before you sew or fasten anything.")
add('pill_ojne', 'ØYNE, TO VERSJONER', 'EYES, TWO VERSIONS')
add('ojne_a_tit', 'Versjon A: sikkerhetsøyne (fra 3 år)', 'Version A: safety eyes (age 3+)')
add('ojne_a',
    'Bruk 16 mm sikkerhetsøyne. Sett dem inn ca. 2,2 cm fra hverandre, litt nedenfor der '
    'ulltoppen slutter. Skyv baksiden godt på plass FØR du fyller hodet ferdig, så det ikke er '
    'mulig å trekke øyet ut igjen fra innsiden.',
    'Use 16 mm safety eyes. Insert them approx. 2.2 cm apart, a little below where the wool '
    'topknot ends. Push the backing washer firmly into place BEFORE you finish stuffing the '
    'head, so the eye cannot be pulled back out from the inside.')
add('ojne_b_tit', 'Versjon B: broderte øyne (babyvennlig, 0 år+)', 'Version B: embroidered eyes (baby-friendly, 0+)')
add('ojne_b',
    'For de aller minste: brodér øynene i stedet, med svart broderigarn. Sy en tett liten oval '
    'eller sirkel (satengsting) på hvert øyepunkt, og la et lite lyst glimt stå ubrodert øverst '
    'for et levende uttrykk. Fest trådene ekstra godt inni hodet.',
    'For the very youngest: embroider the eyes instead, with black embroidery thread. Sew a '
    'small, dense oval or circle (satin stitch) at each eye point, leaving a tiny unstitched '
    'highlight near the top for a lively look. Fasten the threads extra securely inside the '
    'head.')
add('pill_resten', 'NESE, MUNN, VIPPER OG KINN', 'NOSE, MOUTH, LASHES AND CHEEKS')
add('ansikt_resten', [
    ('Nese', 'Brodér en liten lyst brun oval nese midt i ansiktet, i tett satengsting.'),
    ('Munn', 'Fra bunnen av nesen, brodér et lite smil nedover og ut til hver side i '
     'stikksøm med svart tråd.'),
    ('Vipper', 'Brodér 2 til 3 korte, buede sting med svart tråd over ytre hjørne av hvert øye, '
     'for det blide, litt sjenerte blikket.'),
    ('Kinn', 'Hekle to små flate sirkler i pudderrosa (6 fm i magisk ring, avslutt), og sy dem '
     'lett fast på kinnene under hvert øye.'),
], [
    ('Nose', 'Embroider a small light brown oval nose in the middle of the face, in dense satin '
     'stitch.'),
    ('Mouth', 'From the base of the nose, embroider a small smile downward and out to each '
     'side in backstitch, using black thread.'),
    ('Lashes', "Embroider 2 to 3 short, curved stitches with black thread above the outer "
     "corner of each eye, for the cheerful, slightly shy look."),
    ('Cheeks', 'Crochet two small flat circles in powder pink (6 sc in a magic ring, fasten '
     'off), and sew them lightly onto the cheeks below each eye.'),
])
add('ansikt_bilde_caption',
    'Slik kan det ferdige ansiktet se ut: ulltopp, slappe ører, sløyfe, sikkerhetsøyne, brodert '
    'nese og munn.',
    'This is roughly how the finished face can look: wool topknot, floppy ears, bow, safety '
    'eyes, embroidered nose and mouth.')

# ---------------------------------------------------------------- SIDE 11: DEL 4 KROPPEN
add('banner_kropp', 'DEL 4: KROPPEN', 'PART 4: THE BODY')
add('kropp_lead',
    'Kroppen er liten og rund, akkurat stor nok til at Molly kan sitte stødig. Hekles helt i '
    'kremhvitt, uten eget magepanel.',
    "The body is small and round, just big enough for Molly to sit steadily. Crocheted "
    "entirely in cream, with no separate belly panel.")
add('kropp_rows', [
    ('1', '6 fm i magisk ring', 6),
    ('2', 'økn x 6', 12),
    ('3', '(1 fm, økn) x 6', 18),
    ('4', '(2 fm, økn) x 6', 24),
    ('5', '(3 fm, økn) x 6', 30),
    ('6', '(4 fm, økn) x 6', 36),
    ('7', '(5 fm, økn) x 6', 42),
    ('8 til 16', '42 fm, 9 omganger uten økning', 42),
    ('17', '(5 fm, mink) x 6', 36),
    ('18', '36 fm', 36),
    ('19', '(4 fm, mink) x 6 - fyll kroppen jevnt og godt nå', 30),
    ('20', '(3 fm, mink) x 6', 24),
    ('21', '(2 fm, mink) x 6', 18),
])
add('kropp_rows_en', [
    ('1', '6 sc in a magic ring', 6),
    ('2', 'inc x 6', 12),
    ('3', '(1 sc, inc) x 6', 18),
    ('4', '(2 sc, inc) x 6', 24),
    ('5', '(3 sc, inc) x 6', 30),
    ('6', '(4 sc, inc) x 6', 36),
    ('7', '(5 sc, inc) x 6', 42),
    ('8 to 16', '42 sc, 9 rounds with no increases', 42),
    ('17', '(5 sc, dec) x 6', 36),
    ('18', '36 sc', 36),
    ('19', '(4 sc, dec) x 6 - stuff the body evenly and firmly now', 30),
    ('20', '(3 sc, dec) x 6', 24),
    ('21', '(2 sc, dec) x 6', 18),
])
add('kropp_ferdig',
    'Ikke klipp av. Kontroller at kroppen er godt og jevnt fylt, spesielt i bunnen, så Molly '
    'sitter stødig, og bruk så den samme trådenden til å feste hodet oppå kroppen senere.',
    'Do not cut the yarn. Check that the body is filled evenly and firmly, especially at the '
    'bottom, so Molly sits steadily, then use that same yarn tail to attach the head on top of '
    'the body later.')

# ---------------------------------------------------------------- SIDE 12: DEL 5 ARMENE
add('banner_armer', 'DEL 5: ARMENE (2 STK)', 'PART 5: THE ARMS (MAKE 2)')
add('armer_lead',
    'Armene er korte og myke, kremhvite, akkurat som resten av kroppen.',
    'The arms are short and soft, cream, just like the rest of the body.')
add('armer_rows', [
    ('1', '6 fm i magisk ring', 6),
    ('2', 'økn x 6', 12),
    ('3 til 11', '12 fm, 9 omganger', 12),
])
add('armer_rows_en', [
    ('1', '6 sc in a magic ring', 6),
    ('2', 'inc x 6', 12),
    ('3 to 11', '12 sc, 9 rounds', 12),
])
add('armer_ferdig',
    'Klipp av, la ca. 20 cm tråd igjen. Fyll svakt og løst, armene skal være myke og litt '
    'bøyelige, ikke stive.',
    'Cut the yarn, leaving a tail of approx. 20 cm. Stuff lightly and loosely, the arms should '
    'be soft and a little floppy, not stiff.')

# ---------------------------------------------------------------- SIDE 13: DEL 6 BENA OG POTENE
add('banner_bena', 'DEL 6: BENA OG POTENE (2 STK)', 'PART 6: THE LEGS AND PAWS (MAKE 2)')
add('bena_lead',
    'Bena er runde og fylles fast, så Molly sitter godt. Hver fot får en liten, sydd potehov i '
    'lyst brunt, i stedet for Ellies mørke klov eller Pips broderte pute.',
    "The legs are round and stuffed firmly, so Molly sits well. Each foot gets a little "
    "sewn-on paw hoof in light brown, instead of Ellie's dark hoof or Pip's embroidered pad.")
add('bena_rows', [
    ('1', '6 fm i magisk ring, kremhvitt', 6),
    ('2', 'økn x 6', 12),
    ('3', '(1 fm, økn) x 6', 18),
    ('4 til 14', '18 fm, 11 omganger', 18),
])
add('bena_rows_en', [
    ('1', '6 sc in a magic ring, cream', 6),
    ('2', 'inc x 6', 12),
    ('3', '(1 sc, inc) x 6', 18),
    ('4 to 14', '18 sc, 11 rounds', 18),
])
add('bena_ferdig',
    'Klipp av, la ca. 20 cm tråd igjen. Fyll godt og fast, spesielt nederst, så bena kan bære '
    'kroppen når Molly sitter.',
    'Cut the yarn, leaving a tail of approx. 20 cm. Stuff firmly, especially at the bottom, so '
    'the legs can support the body when Molly is sitting.')
add('pill_poter', 'POTEHOVENE, SYDD PÅ', 'THE PAW HOOVES, SEWN ON')
add('poter_txt',
    'Hekle en liten flat oval i lyst brunt (6 fm i magisk ring, avslutt) for hver fot, og sy '
    'den fast nederst framme på foten, som en liten hov. Bruk stramme, tette sting slik at de '
    'tåler klemming og lek.',
    'Crochet a small flat oval in light brown (6 sc in a magic ring, fasten off) for each foot, '
    'and sew it onto the front bottom of the foot, like a little hoof. Use tight, secure '
    'stitches so they hold up to squeezing and play.')

# ---------------------------------------------------------------- SIDE 14: DEL 7 SLØYFEN
add('banner_sloyfe', 'DEL 7: SLØYFEN', 'PART 7: THE BOW')
add('sloyfe_lead',
    'En liten, enkel sløyfe i smørgult, sydd fast mellom ørene oppå ulltoppen, Molly sitt eget '
    'kjennemerke.',
    "A small, simple bow in butter yellow, sewn onto the top of the wool topknot between the "
    "ears, Molly's own signature touch.")
add('sloyfe_txt',
    'Legg opp 12 lm + 1 vendemaske. Rad 1 til 3: 12 fm, 3 rader. Klipp av, la ca. 20 cm tråd '
    'igjen. Brett stykket dobbelt sammen på midten og snør en tråd stramt rundt midten for å '
    'lage sløyfeformen, sy deretter en liten bit garn rundt midjen for å skjule snøringen.',
    'Chain 12 + 1 turning chain. Rows 1 to 3: 12 sc, 3 rows. Cut the yarn, leaving a tail of '
    'approx. 20 cm. Fold the piece in half at the middle and cinch a thread tightly around the '
    'centre to form the bow shape, then sew a small wrap of yarn around the middle to hide the '
    'cinching.')
add('sloyfe_plassering',
    'Sy sløyfen fast midt mellom ørene, oppå der ulltoppen møter pannen.',
    'Sew the bow on centred between the ears, on top of where the wool topknot meets the '
    'forehead.')

# ---------------------------------------------------------------- SIDE 15: ULLTOPPEN, SETT OVENFRA (diagram)
add('banner_ulltopp_topp', 'ULLTOPPEN, SETT OVENFRA', 'THE WOOL TOPKNOT, SEEN FROM ABOVE')
add('ulltopp_topp_lead',
    'Denne skissen viser hvor stort feltet med tette løkkemasker skal være når du ser Molly '
    'rett ovenfra: et rundt felt som dekker hele issen, med ørene stikkende ut på hver side '
    'utenfor feltet.',
    "This sketch shows how big the dense loop-stitch area should be when you look straight "
    "down at Molly from above: a round area covering the whole crown, with the ears sticking "
    "out on each side, outside the area.")

# ---------------------------------------------------------------- SIDE 16: DEL 8 KRAGEN
add('banner_krage', 'DEL 8: KRAGEN', 'PART 8: THE COLLAR')
add('krage_lead',
    'Den smørgule volangkragen hekles direkte rundt halsen, der hodet skal møte kroppen, samme '
    'modell som resten av familien bruker, bare i en annen farge.',
    'The butter yellow ruffled collar is crocheted directly around the neck, where the head '
    'will meet the body, the same model the rest of the family uses, just in a different '
    'colour.')
add('krage_txt',
    'Før du syr hodet fast på kroppen: fest smørgul tråd i kroppens øverste kant, der halsen '
    'skal være (18 m). *1 fm i neste maske, hopp over 1 maske, 4 stav i neste maske (en liten '
    'vifte), hopp over 1 maske*, gjenta rundt hele kanten (6 vifter totalt). Fest av og gjem '
    'tråden.',
    'Before sewing the head onto the body: attach butter yellow yarn at the top edge of the '
    'body, where the neck will be (18 sts). *1 sc in the next stitch, skip 1 stitch, 4 dc in '
    'the next stitch (a little fan), skip 1 stitch*, repeat all the way around the edge (6 fans '
    'in total). Fasten off and weave in the end.')
add('krage_plassering',
    'Kragen skal ligge som en liten volangkant rundt halsen, med hodet syd fast oppå, midt over '
    'kragen, akkurat som på resten av familien.',
    "The collar should sit as a little ruffled edge around the neck, with the head sewn on top, "
    "centred over the collar, just like on the rest of the family.")

# ---------------------------------------------------------------- SIDE 17: KRAGEN OG ULLTOPPEN, SETT FRA SIDEN (diagram)
add('banner_side', 'KRAGEN OG ULLTOPPEN, SETT FRA SIDEN', 'THE COLLAR AND WOOL TOPKNOT, SEEN FROM THE SIDE')
add('side_lead',
    'Denne skissen viser Molly fra siden: hvordan ulltoppen dekker issen med et tydelig felt, '
    'hvordan øret henger mykt nedover, og hvordan kragen sitter rett under haken.',
    "This sketch shows Molly from the side: how the wool topknot covers the crown in a clear "
    "area, how the ear hangs softly downward, and how the collar sits right under the chin.")

# ---------------------------------------------------------------- SIDE 18: MONTERING
add('banner_montering', 'MONTERING', 'ASSEMBLY')
add('montering_lead',
    'Nå skal alle delene bli til Molly. Bruk knappenåler til å prøve plasseringen først, så syr '
    'du for godt til slutt. Alt sys fast med tett heftesting eller stikksøm og god, tvinnet '
    'tråd, ingenting limes.',
    'Now all the pieces become Molly. Use safety pins to test the placement first, then sew '
    'everything firmly at the end. Everything is sewn on with tight running stitch or '
    'backstitch and strong, twisted thread, nothing is glued.')
add('montering_steg', [
    'Sy bena fast under kroppen, ca. 1 til 2 cm fra hverandre, så Molly står stødig når hun '
    'sitter, og sy på potehovene.',
    'Sy armene fast på hver side av kroppen, litt nedenfor der halsen skal være.',
    'Hekle volangkragen rundt kroppens øverste kant, der halsen skal være.',
    'Sett inn øyne, og brodér nese, munn, vipper og kinn (se side om ansiktet).',
    'Sy hodet fast oppå kroppen, midt over kragen. Sjekk at hodet sitter rett frem før du syr '
    'helt ferdig.',
    'Sy ulltoppen fast oppå issen, fra pannen og bakover (se side om ulltoppen sett ovenfra).',
    'Sy ørene fast øverst på hodet, ett på hver side, rett ved kanten av ulltoppen, så de '
    'henger mykt nedover.',
    'Sy sløyfen fast midt mellom ørene.',
    'Fest alle løse tråder godt på innsiden av delene, og klipp av det som er igjen.',
])
add('montering_steg_en', [
    "Sew the legs onto the bottom of the body, approx. 1 to 2 cm apart, so Molly stands "
    "steadily when she sits, and sew on the paw hooves.",
    'Sew the arms onto each side of the body, a little below where the neck will be.',
    'Crochet the ruffled collar around the top edge of the body, where the neck will be.',
    'Insert the eyes, and embroider the nose, mouth, lashes and cheeks (see the face page).',
    'Sew the head onto the body, centred over the collar. Check that the head faces forward '
    'before you sew it on completely.',
    'Sew the wool topknot onto the crown, from the forehead and backward (see the page about '
    'the topknot seen from above).',
    'Sew the ears onto the top of the head, one on each side, right at the edge of the wool '
    'topknot, so they hang softly downward.',
    'Sew the bow on centred between the ears.',
    'Fasten every loose end securely on the inside of the pieces, and trim what is left.',
])

# ---------------------------------------------------------------- SIDE 19: SIKKERHET OG STELL
add('banner_sikkerhet', 'ETTERARBEID, SIKKERHET OG STELL', 'FINISHING, SAFETY AND CARE')
add('pill_etterarbeid', 'HELT TIL SLUTT', 'FINISHING TOUCHES')
add('etterarbeid', [
    'Fest alle løse tråder godt på innsiden av delene: vev dem fram og tilbake gjennom noen '
    'masker med stoppenålen, og klipp av det som er igjen.',
    'Se over alle sømmer, spesielt langs ulltoppens og ørenes kanter. Er noen masker løse '
    'eller har hull, sy over med noen ekstra sting.',
    'Klipp bort eventuelle løse lo-tråder fra løkkemaskene forsiktig med en liten saks, men '
    'aldri selve løkkene.'],
    ['Fasten every loose end securely on the inside of the pieces: weave it back and forth '
     'through a few stitches with the yarn needle, then trim what is left.',
     'Check over every seam, especially along the edges of the wool topknot and the ears. If '
     'any stitches are loose or there are gaps, sew over them with a few extra stitches.',
     'Carefully trim away any stray loose threads from the loop stitches with small scissors, '
     'but never the loops themselves.'])
add('pill_sikkerhet', 'SIKKERHET', 'SAFETY')
add('sikkerhet_txt', [
    'Ingen deler limes, alt sys godt fast med tett tråd. Dobbeltsjekk sømmene på øyne, nese, '
    'ører, ulltoppen, armer, ben og sløyfen, dette er stedene som får mest drahjelp under lek.',
    'Bruker du sikkerhetsøyne (versjon A), er Molly beregnet for barn fra 3 år, siden smådeler '
    'kan løsne over tid ved hard bruk. For de aller minste, bruk versjon B med broderte øyne i '
    'stedet.',
    'Ulltoppens løkker er myke og ufarlige, men bør sjekkes jevnlig for å se at ingen løkke har '
    'blitt så løs at et lite barn kan få en finger fast i den. Stram opp eller sy over ved '
    'behov.',
    'Vask alltid gamle sømmer og fest på nytt hvis du ser tegn til slitasje. Kast Molly hvis '
    'fyll begynner å komme ut, eller hvis en del løsner og ikke kan syes trygt fast igjen.'],
    ['No parts are glued, everything is sewn securely with strong thread. Double-check the '
     'seams on the eyes, nose, ears, wool topknot, arms, legs and the bow, these are the spots '
     'that get the most tugging during play.',
     'If you use safety eyes (version A), Molly is intended for children aged 3 and up, since '
     'small parts can loosen over time with heavy use. For the very youngest, use version B '
     'with embroidered eyes instead.',
     "The wool topknot's loops are soft and harmless, but should be checked regularly to make "
     "sure no loop has become so loose that a small child's finger could get caught in it. "
     "Tighten or sew over as needed.",
     'Always check old seams and re-sew them if you see signs of wear. Retire Molly if stuffing '
     'starts to come out, or if a piece comes loose and cannot be sewn safely back on.'])
add('pill_stell', 'VASK OG STELL', 'WASHING AND CARE')
add('stell_txt',
    'Håndvask i lunkent vann med litt mild såpe, eller vask på 30 grader i vaskepose. Klem '
    'forsiktig ut vannet i et håndkle, ikke vri. Form Molly pent og legg henne til tørk flatt, '
    'og krøll løkkene i ulltoppen forsiktig tilbake på plass med fingrene mens hun er fuktig.',
    'Hand wash in lukewarm water with a little mild soap, or machine wash at 30 degrees in a '
    'wash bag. Gently press out the water in a towel, do not wring. Reshape Molly neatly and '
    'lay her flat to dry, gently coaxing the loops in the wool topknot back into place with '
    'your fingers while she is still damp.')

# ---------------------------------------------------------------- SIDE 20: FERDIG
add('banner_ferdig', 'GRATULERER, MOLLY ER FERDIG!', 'CONGRATULATIONS, MOLLY IS DONE!')
add('ferdig_txt',
    'Nå har du heklet din helt egen Molly, det lille lammet. Vis henne gjerne fram i '
    '#lmebabycollection, jeg elsker å se hva dere skaper!',
    "Now you have crocheted your very own Molly, the little lamb. Feel free to show her off in "
    "#lmebabycollection, I love seeing what you make!")
add('pill_kolleksjon', 'RESTEN AV LME BABY COLLECTION', 'THE REST OF THE LME BABY COLLECTION')
add('kolleksjon_lead',
    'Molly er den fjerde figuren i "Woodland Dreams", i samme uttrykk, garnvalg og fargepalett '
    'som resten av familien. Flere skogvenner er på vei etter hvert.',
    'Molly is the fourth figure in "Woodland Dreams", in the same look, yarn choice and colour '
    'palette as the rest of the family. More woodland friends are on their way over time.')
add('kolleksjon_liste',
    ['Ellie, det lille dådyret', 'Pip, det lille pinnsvinet', 'Felix, den lille reven',
     'Luna, den lille kaninen', 'Oliver, den lille bjørnen', 'Ellies smokkelenke',
     'Ellies rangle', 'Ellies vognlenke', 'Ellies ballerinasko', 'Ellies aktivitetsleke'],
    ['Ellie, the little fawn', 'Pip, the little hedgehog', 'Felix, the little fox',
     'Luna, the little bunny', 'Oliver, the little bear', "Ellie's pacifier clip",
     "Ellie's rattle", "Ellie's stroller toy", "Ellie's ballerina shoes",
     "Ellie's activity toy"])
add('pill_copyright', 'COPYRIGHT', 'COPYRIGHT')
add('copyright_txt',
    'Denne oppskriften er et helt originalt LME-design (c) Renate Dahl, Little Montessori '
    'Explorers. Du kan gjerne selge amigurumier du hekler etter denne oppskriften i din egen, '
    'lille skala. Oppskriften i seg selv, teksten og bildene, skal ikke deles, kopieres eller '
    'videreselges.',
    '(c) Renate Dahl, Little Montessori Explorers. This pattern is a fully original LME design. '
    'You are welcome to sell finished amigurumi you make from this pattern, on a small personal '
    'scale. The pattern itself, its text and images, may not be shared, copied or resold.')

# ======================================================================
# SVG-illustrasjoner
# ======================================================================

def schematic(lang):
    txt = {
        'height': {'no': 'h. ca. 20-22 cm', 'en': 'h. approx. 20-22 cm'},
        'width': {'no': 'br. ca. 13 cm', 'en': 'w. approx. 13 cm'},
        'wool': {'no': '1. ulltoppen', 'en': '1. wool topknot'},
        'ears': {'no': '2. ørene', 'en': '2. ears'},
        'bow': {'no': '3. sløyfen', 'en': '3. bow'},
        'collar': {'no': '4. kragen', 'en': '4. collar'},
        'arms': {'no': '5. armene', 'en': '5. arms'},
        'legs': {'no': '6. bena', 'en': '6. legs'},
    }
    def t(k): return txt[k][lang]
    return f'''
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 520 380" style="width:100%">
  <line x1="60" y1="30" x2="60" y2="330" stroke="#8a8a8a" stroke-width="2"/>
  <text x="40" y="180" text-anchor="middle" font-size="14" font-family="sans-serif" fill="#666" transform="rotate(-90 40 180)">{t('height')}</text>
  <ellipse cx="260" cy="235" rx="52" ry="58" fill="{CREAM}" stroke="{BROWN_MID}" stroke-width="2"/>
  <path d="M222,88 Q192,100 186,145 Q182,175 200,188 Q214,178 214,142 Q216,105 228,90 Z" fill="{CREAM_DEEP}" stroke="{BROWN_MID}" stroke-width="2"/>
  <path d="M298,88 Q328,100 334,145 Q338,175 320,188 Q306,178 306,142 Q304,105 292,90 Z" fill="{CREAM_DEEP}" stroke="{BROWN_MID}" stroke-width="2"/>
  <ellipse cx="200" cy="220" rx="14" ry="32" fill="{CREAM}" stroke="{BROWN_MID}" stroke-width="2" transform="rotate(-16 200 220)"/>
  <ellipse cx="320" cy="220" rx="14" ry="32" fill="{CREAM}" stroke="{BROWN_MID}" stroke-width="2" transform="rotate(16 320 220)"/>
  <ellipse cx="232" cy="308" rx="19" ry="21" fill="{CREAM}" stroke="{BROWN_MID}" stroke-width="2"/>
  <ellipse cx="288" cy="308" rx="19" ry="21" fill="{CREAM}" stroke="{BROWN_MID}" stroke-width="2"/>
  <ellipse cx="232" cy="320" rx="7" ry="5" fill="{BROWN}"/>
  <ellipse cx="288" cy="320" rx="7" ry="5" fill="{BROWN}"/>
  <path d="M210,176 Q260,192 310,176" fill="none" stroke="{YELLOW}" stroke-width="11" stroke-linecap="round"/>
  <circle cx="260" cy="100" r="46" fill="{CREAM}" stroke="{BROWN_MID}" stroke-width="2"/>
  <path d="M215,78 Q222,42 260,38 Q298,42 305,78 Q280,64 260,64 Q240,64 215,78 Z" fill="{CREAM}" stroke="{BROWN_MID}" stroke-width="2"/>
  <g fill="none" stroke="{BROWN_MID}" stroke-width="1.3" opacity="0.8">
    <circle cx="232" cy="55" r="5"/><circle cx="248" cy="46" r="5"/><circle cx="266" cy="44" r="5"/>
    <circle cx="284" cy="49" r="5"/><circle cx="298" cy="62" r="5"/><circle cx="220" cy="66" r="5"/>
    <circle cx="240" cy="60" r="5"/><circle cx="258" cy="58" r="5"/><circle cx="276" cy="60" r="5"/><circle cx="292" cy="72" r="5"/>
  </g>
  <path d="M245,42 Q232,28 238,18 Q252,24 258,38 Z" fill="{YELLOW}" stroke="{YELLOW_DARK}" stroke-width="1.5"/>
  <path d="M275,42 Q288,28 282,18 Q268,24 262,38 Z" fill="{YELLOW}" stroke="{YELLOW_DARK}" stroke-width="1.5"/>
  <ellipse cx="260" cy="38" rx="7" ry="6" fill="{YELLOW_DARK}"/>
  <circle cx="244" cy="98" r="4.5" fill="#3a2a1e"/>
  <circle cx="276" cy="98" r="4.5" fill="#3a2a1e"/>
  <ellipse cx="260" cy="118" rx="8" ry="6" fill="{BROWN_DARK}"/>
  <line x1="120" y1="30" x2="400" y2="30" stroke="#8a8a8a" stroke-width="2"/>
  <text x="260" y="20" text-anchor="middle" font-size="14" font-family="sans-serif" fill="#666">{t('width')}</text>
  <text x="452" y="52" font-size="13" font-family="sans-serif" fill="#555">{t('wool')}</text>
  <line x1="448" y1="48" x2="280" y2="50" stroke="#bbb" stroke-width="1.5"/>
  <text x="452" y="75" font-size="13" font-family="sans-serif" fill="#555">{t('ears')}</text>
  <line x1="448" y1="71" x2="330" y2="140" stroke="#bbb" stroke-width="1.5"/>
  <text x="452" y="98" font-size="13" font-family="sans-serif" fill="#555">{t('bow')}</text>
  <line x1="448" y1="94" x2="272" y2="30" stroke="#bbb" stroke-width="1.5"/>
  <text x="452" y="182" font-size="13" font-family="sans-serif" fill="#555">{t('collar')}</text>
  <line x1="448" y1="178" x2="300" y2="180" stroke="#bbb" stroke-width="1.5"/>
  <text x="452" y="220" font-size="13" font-family="sans-serif" fill="#555">{t('arms')}</text>
  <line x1="448" y1="216" x2="330" y2="220" stroke="#bbb" stroke-width="1.5"/>
  <text x="452" y="310" font-size="13" font-family="sans-serif" fill="#555">{t('legs')}</text>
  <line x1="448" y1="306" x2="303" y2="308" stroke="#bbb" stroke-width="1.5"/>
</svg>'''

def face_diagram(lang):
    cap = {'no': 'stiplet = øyeplassering', 'en': 'dashed = eye placement'}
    return f'''
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 280" style="width:78mm">
  <path d="M75,120 Q40,145 38,205 Q36,250 65,270 Q88,258 88,215 Q90,160 100,128 Z" fill="{CREAM_DEEP}" stroke="{BROWN_MID}" stroke-width="2"/>
  <path d="M225,120 Q260,145 262,205 Q264,250 235,270 Q212,258 212,215 Q210,160 200,128 Z" fill="{CREAM_DEEP}" stroke="{BROWN_MID}" stroke-width="2"/>
  <circle cx="150" cy="150" r="105" fill="{CREAM}" stroke="{BROWN_MID}" stroke-width="2.5"/>
  <path d="M75,105 Q86,55 150,48 Q214,55 225,105 Q185,82 150,82 Q115,82 75,105 Z" fill="{CREAM}" stroke="{BROWN_MID}" stroke-width="2"/>
  <g fill="none" stroke="{BROWN_MID}" stroke-width="1.6" opacity="0.85">
    <circle cx="102" cy="80" r="7"/><circle cx="126" cy="62" r="7"/><circle cx="152" cy="55" r="7"/>
    <circle cx="178" cy="62" r="7"/><circle cx="202" cy="80" r="7"/>
    <circle cx="88" cy="98" r="7"/><circle cx="115" cy="80" r="7"/><circle cx="150" cy="76" r="7"/><circle cx="185" cy="80" r="7"/><circle cx="212" cy="98" r="7"/>
  </g>
  <path d="M128,52 Q110,32 118,16 Q140,24 148,46 Z" fill="{YELLOW}" stroke="{YELLOW_DARK}" stroke-width="1.5"/>
  <path d="M172,52 Q190,32 182,16 Q160,24 152,46 Z" fill="{YELLOW}" stroke="{YELLOW_DARK}" stroke-width="1.5"/>
  <ellipse cx="150" cy="46" rx="9" ry="7" fill="{YELLOW_DARK}"/>
  <ellipse cx="103" cy="128" r="15" fill="#fff" stroke="{BROWN_DARK}" stroke-width="2" stroke-dasharray="3 3"/>
  <ellipse cx="197" cy="128" r="15" fill="#fff" stroke="{BROWN_DARK}" stroke-width="2" stroke-dasharray="3 3"/>
  <circle cx="103" cy="128" r="8" fill="#241a12"/>
  <circle cx="197" cy="128" r="8" fill="#241a12"/>
  <circle cx="106" cy="125" r="2.4" fill="#fff"/>
  <circle cx="200" cy="125" r="2.4" fill="#fff"/>
  <path d="M85,110 Q95,102 112,108" stroke="#241a12" stroke-width="2.4" fill="none" stroke-linecap="round"/>
  <path d="M215,110 Q205,102 188,108" stroke="#241a12" stroke-width="2.4" fill="none" stroke-linecap="round"/>
  <ellipse cx="150" cy="188" rx="13" ry="9" fill="{BROWN_DARK}"/>
  <path d="M150,197 Q140,210 128,206 M150,197 Q160,210 172,206" stroke="#241a12" stroke-width="2.2" fill="none" stroke-linecap="round"/>
  <circle cx="112" cy="168" r="9" fill="{ROSE}" opacity="0.55"/>
  <circle cx="188" cy="168" r="9" fill="{ROSE}" opacity="0.55"/>
  <text x="150" y="270" text-anchor="middle" font-size="12" font-family="sans-serif" fill="#888">{cap[lang]}</text>
</svg>'''

def top_diagram(lang):
    cap = {'no': 'ulltoppen, sett ovenfra', 'en': 'the wool topknot, seen from above'}
    return f'''
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300" style="width:70mm">
  <circle cx="150" cy="150" r="105" fill="{CREAM}" stroke="{BROWN_MID}" stroke-width="2.5"/>
  <path d="M150,80 Q210,90 225,150 Q210,210 150,220 Q90,210 75,150 Q90,90 150,80 Z" fill="{CREAM}" stroke="{BROWN_MID}" stroke-width="2"/>
  <g fill="none" stroke="{BROWN_MID}" stroke-width="1.4" opacity="0.85">
    <circle cx="150" cy="105" r="8"/><circle cx="178" cy="112" r="8"/><circle cx="198" cy="130" r="8"/>
    <circle cx="122" cy="112" r="8"/><circle cx="102" cy="130" r="8"/>
    <circle cx="205" cy="150" r="8"/><circle cx="95" cy="150" r="8"/>
    <circle cx="150" cy="130" r="8"/><circle cx="176" cy="140" r="8"/><circle cx="124" cy="140" r="8"/>
    <circle cx="198" cy="170" r="8"/><circle cx="102" cy="170" r="8"/>
    <circle cx="150" cy="155" r="8"/><circle cx="176" cy="165" r="8"/><circle cx="124" cy="165" r="8"/>
    <circle cx="178" cy="188" r="8"/><circle cx="122" cy="188" r="8"/><circle cx="150" cy="195" r="8"/>
  </g>
  <ellipse cx="60" cy="150" rx="14" ry="20" fill="{CREAM}" stroke="{BROWN_MID}" stroke-width="2"/>
  <ellipse cx="240" cy="150" rx="14" ry="20" fill="{CREAM}" stroke="{BROWN_MID}" stroke-width="2"/>
  <text x="150" y="280" text-anchor="middle" font-size="13" font-family="sans-serif" fill="#888">{cap[lang]}</text>
</svg>'''

def side_diagram(lang):
    cap = {'no': 'kragen og ulltoppen, sett fra siden', 'en': 'the collar and wool topknot, seen from the side'}
    return f'''
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 340" style="width:70mm">
  <ellipse cx="175" cy="245" rx="82" ry="78" fill="{CREAM}" stroke="{BROWN_MID}" stroke-width="2.5"/>
  <ellipse cx="120" cy="255" rx="20" ry="30" fill="{CREAM}" stroke="{BROWN_MID}" stroke-width="2" transform="rotate(-15 120 255)"/>
  <path d="M55,105 Q22,120 20,175 Q18,220 48,240 Q70,228 68,180 Q66,135 78,108 Z" fill="{CREAM_DEEP}" stroke="{BROWN_MID}" stroke-width="2"/>
  <circle cx="118" cy="122" r="64" fill="{CREAM}" stroke="{BROWN_MID}" stroke-width="2.5"/>
  <path d="M65,90 Q72,55 118,50 Q164,56 172,92 Q140,74 118,74 Q95,74 65,90 Z" fill="{CREAM}" stroke="{BROWN_MID}" stroke-width="2"/>
  <g fill="none" stroke="{BROWN_MID}" stroke-width="1.3" opacity="0.85">
    <circle cx="90" cy="68" r="6"/><circle cx="110" cy="58" r="6"/><circle cx="132" cy="58" r="6"/><circle cx="152" cy="70" r="6"/>
    <circle cx="75" cy="82" r="6"/><circle cx="98" cy="76" r="6"/><circle cx="122" cy="74" r="6"/><circle cx="146" cy="82" r="6"/><circle cx="163" cy="90" r="6"/>
  </g>
  <circle cx="80" cy="118" r="6" fill="#241a12"/>
  <path d="M60,140 Q70,148 82,142" stroke="#241a12" stroke-width="2" fill="none" stroke-linecap="round"/>
  <ellipse cx="48" cy="128" rx="8" ry="6" fill="{BROWN_DARK}"/>
  <path d="M100,46 Q88,28 96,14 Q116,22 122,42 Z" fill="{YELLOW}" stroke="{YELLOW_DARK}" stroke-width="1.5"/>
  <path d="M138,46 Q150,28 142,14 Q122,22 116,42 Z" fill="{YELLOW}" stroke="{YELLOW_DARK}" stroke-width="1.5"/>
  <ellipse cx="119" cy="40" rx="8" ry="6" fill="{YELLOW_DARK}"/>
  <ellipse cx="150" cy="178" rx="30" ry="14" fill="{YELLOW}" stroke="{YELLOW_DARK}" stroke-width="1.5" transform="rotate(-18 150 178)"/>
  <text x="160" y="330" text-anchor="middle" font-size="13" font-family="sans-serif" fill="#888">{cap[lang]}</text>
</svg>'''

# ================================================================== BYGG SIDENE

def build(lang):
    RIGHT = {'no': 'LME HEKLING', 'en': 'LME CROCHET'}[lang]
    def t(key): return T[key][lang]
    PH2 = t('ph2')
    def pg(body, num): return kit.page(body, num, RIGHT, PH2, t('doctitle'))
    pages = []

    pages.append(pg(f'''
<div class="coverimg"><img src="{hero_src}" alt="Molly, det lille lammet, stiluttrykk-referanse"></div>
<p class="small center" style="margin-top:-2mm;">{'Bildet viser stiluttrykk-referansen for Molly, ikke det ferdige heklede produktet.' if lang == 'no' else 'Photo shows the style reference for Molly, not the finished crocheted product.'}</p>
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
{rosep(t('pill_montessori'))}
{cme(t('om_montessori'))}
''', 2))

    garn_rows_full = T['garn_rows']['no']
    garn_table = '<table class="t"><tr><th>' + '</th><th>'.join(T['garn_tabell_head'][lang]) + '</th></tr>' + \
        ''.join(f'<tr><td><b>{a if lang=="no" else e}</b></td><td>{b if lang=="no" else f}</td><td>{c if lang=="no" else g}</td></tr>'
                for (a, b, c, e, f, g) in garn_rows_full) + '</table>'
    utstyr_list = ul([f'<b>{a}</b>' + (f' &middot; {b}' if b else '') for a, b in T['utstyr']['no']])
    pages.append(pg(f'''
{banner(t('banner_mat'))}
{rosep(t('pill_storrelse'))}
{card('<p><b>' + t('storrelse_txt') + '</b></p>')}
{sagep(t('pill_garn'))}
<p>{t('garn_lead')}</p>
{card(garn_table)}
<p class="small">{t('garn_alt')}</p>
{rosep(t('pill_utstyr'))}
{card(utstyr_list)}
''', 3))

    ord_rows_full = T['ord_rows']['no']
    ord_table = '<table class="t tl"><tr><th>' + '</th><th>'.join(T['ord_head'][lang]) + '</th></tr>' + \
        ''.join(f'<tr><td><b>{a}</b></td><td>{c if lang=="no" else d}</td></tr>' for (a, c, b2, d) in ord_rows_full) + '</table>'
    pages.append(pg(f'''
{banner(t('banner_fasthet'))}
{rosep(t('pill_fasthet'))}
{card('<p>' + t('fasthet_txt') + '</p>')}
{sagep(t('pill_ordliste'))}
{card(ord_table)}
{cme(t('ord_note'))}
''', 4))

    if lang == 'no':
        deler = [(a, b) for (a, b, _, _) in T['oversikt_deler']['no']]
    else:
        deler = [(c, d) for (_, _, c, d) in T['oversikt_deler']['no']]
    deler_html = '<div class="deler-grid">' + ''.join(
        f'<div class="di"><b>{a}</b><br>{b}</div>' for a, b in deler) + '</div>'
    tips_items = T['tips']['no'] if lang == 'no' else T['tips']['en']
    pages.append(pg(f'''
{banner(t('banner_oversikt'))}
{rosep(t('pill_tips'))}
{card(ul(tips_items))}
{sagep('SLIK ER MOLLY BYGGET OPP' if lang == 'no' else 'HOW MOLLY IS BUILT')}
{card('<p>' + t('oversikt_lead') + '</p>' + deler_html)}
''', 5))

    pages.append(pg(f'''
{banner(t('banner_proporsjoner'))}
<p>{t('proporsjoner_lead')}</p>
<div class="schematic">{schematic(lang)}</div>
<p class="small center">{t('schematic_caption')}</p>
''', 6))

    hode_rows = T['hode_rows']['no'] if lang == 'no' else T['hode_rows_en']['no']
    pages.append(pg(f'''
{banner(t('banner_hode'))}
<p>{t('hode_lead')}</p>
{card(otab(hode_rows, head3[lang]))}
{cme(t('hode_ferdig'))}
''', 7))

    ulltopp_rows = T['ulltopp_rows']['no'] if lang == 'no' else T['ulltopp_rows_en']['no']
    pages.append(pg(f'''
{banner(t('banner_ulltopp'))}
<p>{t('ulltopp_lead')}</p>
{rosep(t('pill_lokketeknikk'))}
{card('<p>' + t('lokketeknikk_txt') + '</p>')}
{sagep(t('pill_ulltopp_felt'))}
{card(otab(ulltopp_rows, head3[lang]))}
{cme(t('ulltopp_ferdig'))}
''', 8))

    orer_rows = T['orer_rows']['no'] if lang == 'no' else T['orer_rows_en']['no']
    pages.append(pg(f'''
{banner(t('banner_orer'))}
<p>{t('orer_lead')}</p>
{card(otab(orer_rows, rowhead[lang]))}
{cme(t('orer_ferdig'))}
''', 9))

    ansikt_items = T['ansikt_resten']['no'] if lang == 'no' else T['ansikt_resten']['en']
    ansikt_html = ul([f'<b>{a}:</b> {b}' for a, b in ansikt_items])
    pages.append(pg(f'''
{banner(t('banner_ansikt'))}
<p>{t('ansikt_lead')}</p>
{rosep(t('pill_ojne'))}
{card('<p><b>' + t('ojne_a_tit') + '</b><br>' + t('ojne_a') + '</p>')}
{card('<p><b>' + t('ojne_b_tit') + '</b><br>' + t('ojne_b') + '</p>')}
{sagep(t('pill_resten'))}
<div class="twocol">
  <div>{card(ansikt_html)}</div>
  <div class="figwrap">{face_diagram(lang)}<div class="figcap">{t('ansikt_bilde_caption')}</div></div>
</div>
''', 10))

    kropp_rows = T['kropp_rows']['no'] if lang == 'no' else T['kropp_rows_en']['no']
    pages.append(pg(f'''
{banner(t('banner_kropp'))}
<p>{t('kropp_lead')}</p>
{card(otab(kropp_rows, head3[lang]))}
{cme(t('kropp_ferdig'))}
''', 11))

    armer_rows = T['armer_rows']['no'] if lang == 'no' else T['armer_rows_en']['no']
    pages.append(pg(f'''
{banner(t('banner_armer'))}
<p>{t('armer_lead')}</p>
{card(otab(armer_rows, head3[lang]))}
{cme(t('armer_ferdig'))}
''', 12))

    bena_rows = T['bena_rows']['no'] if lang == 'no' else T['bena_rows_en']['no']
    pages.append(pg(f'''
{banner(t('banner_bena'))}
<p>{t('bena_lead')}</p>
{card(otab(bena_rows, head3[lang]))}
{cme(t('bena_ferdig'))}
{rosep(t('pill_poter'))}
{card('<p>' + t('poter_txt') + '</p>')}
''', 13))

    pages.append(pg(f'''
{banner(t('banner_sloyfe'))}
<p>{t('sloyfe_lead')}</p>
{card('<p>' + t('sloyfe_txt') + '</p>')}
{cme(t('sloyfe_plassering'))}
''', 14))

    pages.append(pg(f'''
{banner(t('banner_ulltopp_topp'))}
<p>{t('ulltopp_topp_lead')}</p>
<div class="schematic" style="text-align:center;">{top_diagram(lang)}</div>
''', 15))

    pages.append(pg(f'''
{banner(t('banner_krage'))}
<p>{t('krage_lead')}</p>
{card('<p>' + t('krage_txt') + '</p>')}
{cme(t('krage_plassering'))}
''', 16))

    pages.append(pg(f'''
{banner(t('banner_side'))}
<p>{t('side_lead')}</p>
<div class="schematic" style="text-align:center;">{side_diagram(lang)}</div>
''', 17))

    mo_steg = T['montering_steg']['no'] if lang == 'no' else T['montering_steg_en']['no']
    pages.append(pg(f'''
{banner(t('banner_montering'))}
<p>{t('montering_lead')}</p>
{card(steps(mo_steg))}
''', 18))

    etterarbeid = T['etterarbeid']['no'] if lang == 'no' else T['etterarbeid']['en']
    sikkerhet = T['sikkerhet_txt']['no'] if lang == 'no' else T['sikkerhet_txt']['en']
    pages.append(pg(f'''
{banner(t('banner_sikkerhet'))}
{rosep(t('pill_etterarbeid'))}
{card(ul(etterarbeid))}
{sagep(t('pill_sikkerhet'))}
{card(ul(sikkerhet))}
{rosep(t('pill_stell'))}
{cme(t('stell_txt'))}
''', 19))

    kolliste = T['kolleksjon_liste']['no'] if lang == 'no' else T['kolleksjon_liste']['en']
    pages.append(pg(f'''
{banner(t('banner_ferdig'))}
{cream('<p class="creamtitle">' + t('ferdig_txt') + '</p>')}
{sagep(t('pill_kolleksjon'))}
<p class="small">{t('kolleksjon_lead')}</p>
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
    out = BASE / f'molly_{lang}.html'
    out.write_text(html_doc, encoding='utf-8')
    print('OK', lang, len(html_doc), 'tegn/chars')
