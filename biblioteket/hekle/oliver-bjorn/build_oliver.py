# -*- coding: utf-8 -*-
"""Genererer LME-hekleoppskrift 'Oliver, den lille bjornen' (norsk + engelsk) som HTML,
klar for PDF-print med Chromium. Del av LME Baby Collection 'Woodland Dreams',
Ellies skogvenn."""
import base64, pathlib, sys

BASE = pathlib.Path(__file__).parent
sys.path.insert(0, str(BASE.parent / '_shared'))
import lme_pattern_kit as kit
from lme_pattern_kit import (banner, rosep, sagep, card, cream, cme, ul, steps, otab, abbrtab,
                              BROWN, BROWN_MID, BROWN_DARK, CREAM,
                              CREAM_DEEP, ROSE, SAGE, INK)

HERO = BASE / 'oliver_hero.jpg'
FACE = BASE / 'oliver_face.jpg'
hero_src = f'data:image/jpeg;base64,{base64.b64encode(HERO.read_bytes()).decode()}'
face_src = f'data:image/jpeg;base64,{base64.b64encode(FACE.read_bytes()).decode()}'

TAN = '#C79A6C'        # hovedfarge, varmt lyst brunt
TAN_DARK = '#8a6339'   # kant/skygge til tan
BLUE = '#A9C6DE'       # lys bla, krage
BLUE_DARK = '#7fa7c9'  # kant/skygge til bla

T = {}
def add(key, no, en=None):
    T[key] = {'no': no, 'en': en if en is not None else no}

head3 = {'no': ['Omg', 'Beskrivelse', 'Masker'], 'en': ['Rnd', 'Description', 'Sts']}
rowhead = {'no': ['Rad', 'Beskrivelse', 'Masker'], 'en': ['Row', 'Description', 'Sts']}

# ---------------------------------------------------------------- SIDE 1: FORSIDE
add('doctitle', 'Oliver, den lille bjørnen, LME hekleoppskrift', 'Oliver, the Little Bear, LME crochet pattern')
add('ph2', 'LME HEKLEOPPSKRIFT&nbsp;&nbsp;|&nbsp;&nbsp;OLIVER, DEN LILLE BJØRNEN',
    "LME CROCHET PATTERN&nbsp;&nbsp;|&nbsp;&nbsp;OLIVER, THE LITTLE BEAR")
add('covertag', 'LME HEKLEOPPSKRIFT - AMIGURUMI', 'LME CROCHET PATTERN - AMIGURUMI')
add('covertitle', 'OLIVER', 'OLIVER')
add('subpill', 'LME BABY COLLECTION - WOODLAND DREAMS', 'LME BABY COLLECTION - WOODLAND DREAMS')
add('cover_desc',
    'Oliver er den rundeste og mykeste i skogvenn-familien, en liten, varmt brun bjørn med en '
    'ekstra rund mage, enkle runde ører og en lyseblå volangkrage. Ingen sløyfe, ingen '
    'ekstravagante deler, bare den klassiske, myke bamseformen heklet i store, rolige '
    'fargeblokker. Heklet i de samme varme naturfargene som resten av kolleksjonen. Et helt '
    'originalt LME-design, ferdig ca. 20 til 22 cm sittende. Middels vanskelighetsgrad.',
    'Oliver is the roundest and softest of the woodland friends family, a small, warm brown '
    'bear with an extra round belly, simple round ears and a light blue ruffled collar. No '
    'bow, no extravagant parts, just the classic, soft teddy bear shape crocheted in big, calm '
    'blocks of colour. Crocheted in the same warm natural colours as the rest of the '
    'collection. A fully original LME design, finished size approx. 20 to 22 cm sitting. '
    'Medium difficulty.')
add('by1', 'Av Renate Dahl', 'By Renate Dahl')
add('by2', 'Little Montessori Explorers', 'Little Montessori Explorers')
add('by3', 'lmexplorers.com', 'lmexplorers.com')
add('cover_tip',
    'TIPS: Les hele oppskriften én gang før du begynner, spesielt siden om kroppen, der den '
    'runde magen fylles ekstra godt for å gi Oliver sin karakteristiske, pussete form.',
    "TIP: Read through the whole pattern once before you start, especially the page about the "
    "body, where the round belly is stuffed extra firmly to give Oliver his characteristic, "
    "plump shape.")

# ---------------------------------------------------------------- SIDE 2: OM OLIVER
add('banner_om', 'OM OLIVER', 'ABOUT OLIVER')
add('pill_historien', 'DEL AV ELLIES VERDEN', "PART OF ELLIE'S WORLD")
add('om_historien',
    'Oliver er den sjette figuren i LME Baby Collection "Woodland Dreams", en av Ellies gode '
    'venner i skogen. Der Luna alltid hopper først, er Oliver den rolige, som helst vil gi '
    'gode klemmer og sove lenge i solveggen. Flere skogvenner er på vei inn i kolleksjonen '
    'etter hvert.',
    'Oliver is the sixth figure in the LME Baby Collection "Woodland Dreams", one of Ellie\'s '
    'good friends in the forest. Where Luna always hops first, Oliver is the calm one, who '
    'would rather give good hugs and nap in a sunny spot. More woodland friends are on their '
    'way into the collection over time.')
add('pill_stil', 'STIL', 'STYLE')
add('om_stil',
    'Samme premium amigurumi-uttrykk som resten av familien: store former, myke overganger, '
    'rolige fargeskift og et vennlig, avrundet blikk. Oliver er IKKE en realistisk bjørn, IKKE '
    'stiv eller kantete, og den runde magen er fylt myk, ikke hard, slik at han er trygg og '
    'god å klemme.',
    'The same premium amigurumi look as the rest of the family: big shapes, soft transitions, '
    'calm colour changes and a friendly, rounded gaze. Oliver is NOT a realistic bear, NOT '
    'stiff or angular, and the round belly is stuffed soft, not hard, so he is safe and nice '
    'to cuddle.')
add('pill_montessori', 'MONTESSORI-INSPIRERT', 'MONTESSORI-INSPIRED')
add('om_montessori',
    'Store, enkle former og rolige fargeblokker gjør Oliver fin å kjenne på og lett å '
    'gjenkjenne for de minste, akkurat den typen konkrete, sanselige lek Montessori-'
    'filosofien bygger på.',
    'Big, simple shapes and calm blocks of colour make Oliver nice to feel and easy for little '
    'ones to recognise, exactly the kind of concrete, sensory play the Montessori philosophy '
    'is built on.')

# ---------------------------------------------------------------- SIDE 3: STØRRELSE OG MATERIALER
add('banner_mat', 'STØRRELSE OG MATERIALER', 'SIZE AND MATERIALS')
add('pill_storrelse', 'FERDIG STØRRELSE', 'FINISHED SIZE')
add('storrelse_txt', 'Ca. 20 til 22 cm høy, sittende.', 'Approx. 20 to 22 cm tall, sitting.')
add('pill_garn', 'GARN', 'YARN')
add('garn_lead',
    'Bystrikk Merino gir en myk, tett amigurumi-overflate, godt egnet til å holde formen i den '
    'ekstra rundt fylte magen.',
    'Bystrikk Merino gives a soft, firm amigurumi surface, well suited to holding its shape in '
    'the extra firmly stuffed belly.')
add('garn_tabell_head', ['Farge', 'Til', 'Mengde'], ['Colour', 'For', 'Amount'])
add('garn_rows', [
    ('Bystrikk Merino, varmt lyst brunt (hovedfarge)', 'hodet, ørenes utside, kroppen, '
     'armene, bena', 'ca. 2 nøster',
     'Bystrikk Merino, warm light brown (main colour)', 'the head, the outside of the ears, '
     'the body, the arms, the legs', 'approx. 2 skeins'),
    ('Bystrikk Merino, kremhvit', 'snuteflekken, ørenes innside, potene', 'ca. 1 nøste',
     'Bystrikk Merino, cream', 'the muzzle patch, the inside of the ears, the paws',
     'approx. 1 skein'),
    ('Bystrikk Merino, lys blått', 'volangkragen', 'litt',
     'Bystrikk Merino, light blue', 'the ruffled collar', 'small amount'),
    ('Rest, mørkt brunt', 'nesen', 'litt',
     'Leftover, dark brown', 'the nose', 'small amount'),
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
    ('Polyesterfiber til fyll', 'ren, vaskbar leketøyfyll, ekstra mye til den runde magen'),
    ('To 16 mm sikkerhetsøyne (versjon A), eller svart broderigarn (versjon B)', 'se side om '
     'ansiktet'),
    ('Stoppenål med butt spiss', 'til all somming'),
    ('Maskemarkør', 'en, eller en løkke garn i annen farge'),
    ('Nål og tvinnet bomullstråd', 'til å sy på ører, snuteflekk og krage'),
    ('Målebånd og saks', ''),
])

# ---------------------------------------------------------------- SIDE 4: FASTHET OG ORDLISTE
add('banner_fasthet', 'HEKLEFASTHET OG ORDLISTE', 'GAUGE AND GLOSSARY')
add('pill_fasthet', 'HEKLEFASTHET', 'GAUGE')
add('fasthet_txt',
    'Ca. 16 fm x 18 omganger = 10 x 10 cm, heklet STRAMT (amigurumi-fasthet) på nål 4 mm. '
    'Hekler du løsere enn dette, synes fyllet gjennom maskene og Oliver blir myk og ustødig i '
    'stedet for fin og fast.',
    'Approx. 16 sc x 18 rounds = 10 x 10 cm, crocheted TIGHTLY (amigurumi tension) on a 4 mm '
    'hook. If you crochet looser than this, the stuffing shows through the stitches and '
    'Oliver turns out soft and floppy instead of neat and firm.')
add('pill_ordliste', 'ORDLISTE OG FORKORTELSER', 'GLOSSARY AND ABBREVIATIONS')
add('ord_head', ['Kort', 'Betyr'], ['Short', 'Means'])
add('ord_rows', [
    ('lm', 'luftmaske', 'ch', 'chain stitch'),
    ('fm', 'fastmaske', 'sc', 'single crochet (UK: double crochet)'),
    ('halvstav', 'halv stav', 'hdc', 'half double crochet'),
    ('stav', 'stav', 'dc', 'double crochet'),
    ('kjm', 'kjedemaske', 'sl st', 'slip stitch'),
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
    'Hodet, ørene, kroppen, armene og bena hekles i spiral med fastmasker, uten å avslutte '
    'omgangene. Kragen hekles frem og tilbake i rader. Sett gjerne en maskemarkør i første '
    'maske på hver spiraldel.',
    'The head, ears, body, arms and legs are crocheted in a spiral of single crochet, without '
    'joining the rounds. The collar is crocheted back and forth in rows. Place a stitch marker '
    'in the first stitch of each spiral piece.')

# ---------------------------------------------------------------- SIDE 5: TIPS OG OVERSIKT
add('banner_oversikt', 'TIPS OG SLIK ER OLIVER BYGGET OPP', "TIPS AND HOW OLIVER IS BUILT")
add('pill_tips', 'TIPS FØR DU BEGYNNER', 'TIPS BEFORE YOU START')
add('tips',
    ['Hekle kroppen med ekstra fyll for hånden, den runde magen er det som gir Oliver sitt '
     'kjennetegn.',
     'Legg alle delene ved siden av hverandre før du syr noe fast, så du ser at Oliver blir '
     'symmetrisk.',
     'Fyll litt og litt underveis i stedet for helt til slutt, det gir en jevnere, penere '
     'form.'],
    ['Crochet the body with extra stuffing close at hand, the round belly is what gives Oliver '
     'his signature look.',
     'Lay all the pieces out next to each other before sewing anything on, so you can see that '
     'Oliver turns out symmetrical.',
     'Stuff a little at a time as you go, rather than all at once at the end, it gives a more '
     'even, neater shape.'])
add('oversikt_lead',
    'Oliver hekles i sju deler, som sys sammen helt til slutt. Ingen deler limes, og alt sys '
    'godt fast slik at ingenting løsner. Gjør deg kjent med delene før du begynner:',
    'Oliver is crocheted in seven pieces, which are all sewn together at the very end. No '
    'pieces are glued, and everything is sewn securely so that nothing comes loose. Get to '
    'know the pieces before you begin:')
add('oversikt_deler', [
    ('1. Hodet', 'stort og rundt, varmt lyst brunt', '1. The head', 'big and round, warm light '
     'brown'),
    ('2. Ørene (x2)', 'enkle og runde, todelt', '2. The ears (x2)', 'simple and round, two '
     'layers'),
    ('3. Snuteflekken', 'stor, flat, kremhvit', '3. The muzzle patch', 'big, flat, cream'),
    ('4. Kroppen', 'ekstra rund og godt fylt', '4. The body', 'extra round and firmly stuffed'),
    ('5. Armene (x2)', 'små og myke, korte', '5. The arms (x2)', 'small and soft, short'),
    ('6. Bena (x2)', 'runde, med kremhvite poter', '6. The legs (x2)', 'round, with cream '
     'paws'),
    ('7. Kragen', 'lyseblå volangkrage', '7. The collar', 'a light blue ruffled collar'),
])
add('schematic_caption',
    'Målskisse: Oliver sittende, ca. 20 til 22 cm høy og ca. 14 cm bred over armene.',
    'Size sketch: Oliver sitting, approx. 20 to 22 cm tall and approx. 14 cm wide across the '
    'arms.')

# ---------------------------------------------------------------- SIDE 6: KROPPENS PROPORSJONER (diagram)
add('banner_proporsjoner', 'KROPPENS PROPORSJONER', 'BODY PROPORTIONS')
add('proporsjoner_lead',
    'Bruk denne skissen som en rettesnor mens du hekler, spesielt for å se hvor rund og full '
    'magen skal være i forhold til resten av kroppen.',
    "Use this sketch as a guide while you crochet, especially to see how round and full the "
    "belly should be compared to the rest of the body.")

# ---------------------------------------------------------------- SIDE 7: DEL 1 HODET
add('banner_hode', 'DEL 1: HODET', 'PART 1: THE HEAD')
add('hode_lead',
    'Hodet hekles i spiral, ovenfra og ned, helt i varmt lyst brunt. Det starter smalt, øker '
    'ut til bredest midt på, står rett en stund, og minker så ned igjen mot halsen.',
    'The head is crocheted in a spiral, from the top down, entirely in warm light brown. It '
    'starts narrow, increases out to its widest point in the middle, stays even for a while, '
    'then decreases back down towards the neck.')
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
    'Ikke klipp av trådenden. Trekk den forsiktig sammen gjennom de siste 6 maskene og bruk '
    'den samme trådenden til å feste hodet på kroppen senere. Hodet skal nå være fast og '
    'rundt, ca. 9 cm i diameter.',
    'Do not cut the yarn. Gently gather it through the last 6 stitches and use that same yarn '
    'tail to attach the head to the body later. The head should now be firm and round, approx. '
    '9 cm in diameter.')

# ---------------------------------------------------------------- SIDE 8: DEL 2 ØRENE
add('banner_orer', 'DEL 2: ØRENE (2 STK)', 'PART 2: THE EARS (MAKE 2)')
add('orer_lead',
    'Oliver sine ører holdes enkle og runde, uten spiss eller lang flopp, den klassiske '
    'bamseformen. Hekles i to lag, akkurat som på Pip, en litt større del i varmt lyst brunt '
    '(utsiden) og en litt mindre i kremhvitt (innsiden), sydd sammen. Hekle to av hver.',
    "Oliver's ears are kept simple and round, with no point and no long flop, the classic "
    'teddy bear shape. Crocheted in two layers, just like on Pip, a slightly bigger piece in '
    'warm light brown (the outside) and a slightly smaller one in cream (the inside), sewn '
    'together. Crochet two of each.')
add('pill_ore_ute', 'YTTERSIDEN (VARMT LYST BRUNT) - HEKLE 2', 'THE OUTSIDE (WARM LIGHT BROWN) - MAKE 2')
add('ore_ute_rows', [
    ('1', '6 fm i magisk ring', 6),
    ('2', 'økn x 6', 12),
    ('3', '(1 fm, økn) x 6', 18),
    ('4', '(2 fm, økn) x 6', 24),
])
add('ore_ute_rows_en', [
    ('1', '6 sc in a magic ring', 6),
    ('2', 'inc x 6', 12),
    ('3', '(1 sc, inc) x 6', 18),
    ('4', '(2 sc, inc) x 6', 24),
])
add('pill_ore_inne', 'INNSIDEN (KREMHVIT) - HEKLE 2', 'THE INSIDE (CREAM) - MAKE 2')
add('ore_inne_rows', [
    ('1', '6 fm i magisk ring', 6),
    ('2', 'økn x 6', 12),
    ('3', '(1 fm, økn) x 6', 18),
])
add('ore_inne_rows_en', [
    ('1', '6 sc in a magic ring', 6),
    ('2', 'inc x 6', 12),
    ('3', '(1 sc, inc) x 6', 18),
])
add('orer_ferdig',
    'Klipp av begge delene, la ca. 20 cm tråd igjen. Ikke fyll ørene, de skal være flate. Legg '
    'den kremhvite sirkelen midt oppå den varmt brune og sy den fast med heftesting, så det '
    'står en jevn brun kant rundt. Ikke brett ørene, de skal holdes helt runde og flate, litt '
    'buet ut fra hodet når de sys på.',
    'Cut both pieces, leaving a tail of approx. 20 cm. Do not stuff the ears, they should be '
    'flat. Place the cream circle in the middle of the warm brown one and sew it on with '
    'running stitch, leaving an even brown rim showing. Do not fold the ears, they should '
    'stay completely round and flat, curving slightly outward from the head when sewn on.')
add('orer_plassering',
    'Sy ørene fast høyt på hodet, ett på hver side, se side om ansiktet for nøyaktig '
    'plassering.',
    'Sew the ears on high up on the head, one on each side, see the face page for exact '
    'placement.')

# ---------------------------------------------------------------- SIDE 9: ØRENE, TODELT (diagram)
add('banner_orer_konstruksjon', 'ØRENE, TODELT KONSTRUKSJON', 'THE EARS, TWO-LAYER CONSTRUCTION')
add('orer_konstruksjon_lead',
    'Denne skissen viser hvordan de to lagene i hvert øre settes sammen: den kremhvite '
    'innsiden sys midt oppå den varmt brune utsiden, slik at det står en jevn brun kant '
    'synlig rundt hele veien.',
    "This sketch shows how the two layers in each ear are put together: the cream inside is "
    "sewn in the middle of the warm brown outside, so an even brown rim shows all the way "
    "around.")

# ---------------------------------------------------------------- SIDE 10: DEL 3 SNUTEFLEKKEN
add('banner_snute', 'DEL 3: SNUTEFLEKKEN', 'PART 3: THE MUZZLE PATCH')
add('snute_lead',
    'Snuteflekken er en stor, flat del som dekker mesteparten av den nedre delen av ansiktet, '
    'akkurat som på Felix og Luna. Hekles i kremhvitt.',
    "The muzzle patch is a big, flat piece that covers most of the lower part of the face, "
    "just like on Felix and Luna. Crocheted in cream.")
add('snuten_rows', [
    ('1', '6 fm i magisk ring', 6),
    ('2', 'økn x 6', 12),
    ('3', '(1 fm, økn) x 6', 18),
    ('4', '(2 fm, økn) x 6', 24),
    ('5', '(3 fm, økn) x 6', 30),
])
add('snuten_rows_en', [
    ('1', '6 sc in a magic ring', 6),
    ('2', 'inc x 6', 12),
    ('3', '(1 sc, inc) x 6', 18),
    ('4', '(2 sc, inc) x 6', 24),
    ('5', '(3 sc, inc) x 6', 30),
])
add('snuten_ferdig',
    'Klipp av, la ca. 20 cm tråd igjen. Ikke fyll, snuteflekken skal være flat. Sy den fast '
    'nederst midt på hodet, flatt mot ansiktet, se side om ansiktet for nøyaktig plassering.',
    'Cut, leaving a tail of approx. 20 cm. Do not stuff, the muzzle patch should be flat. Sew '
    'it on at the bottom centre of the head, flat against the face, see the face page for '
    'exact placement.')

# ---------------------------------------------------------------- SIDE 11: ANSIKTET (diagram)
add('banner_ansikt', 'ANSIKTET', 'THE FACE')
add('ansikt_lead',
    'Ansiktet er det som gir Oliver liv. Ta deg god tid her, og prøv gjerne med knappenåler '
    'først før du syr eller fester noe fast.',
    "The face is what brings Oliver to life. Take your time here, and try pinning things in "
    "place with safety pins before you sew or fasten anything.")
add('pill_ojne', 'ØYNE, TO VERSJONER', 'EYES, TWO VERSIONS')
add('ojne_a_tit', 'Versjon A: sikkerhetsøyne (fra 3 år)', 'Version A: safety eyes (age 3+)')
add('ojne_a',
    'Bruk 16 mm sikkerhetsøyne. Sett dem inn ca. 2,2 cm fra hverandre, litt over midten av der '
    'snuteflekken skal sitte. Skyv baksiden godt på plass FØR du fyller hodet ferdig, så det '
    'ikke er mulig å trekke øyet ut igjen fra innsiden.',
    'Use 16 mm safety eyes. Insert them approx. 2.2 cm apart, a little above the middle of '
    'where the muzzle patch will sit. Push the backing washer firmly into place BEFORE you '
    'finish stuffing the head, so the eye cannot be pulled back out from the inside.')
add('ojne_b_tit', 'Versjon B: broderte øyne (babyvennlig, 0 år+)', 'Version B: embroidered eyes (baby-friendly, 0+)')
add('ojne_b',
    'For de aller minste: brodér øynene i stedet, med svart broderigarn. Sy en tett liten '
    'oval eller sirkel (satengsting) på hvert øyepunkt, og la et lite lyst glimt stå ubrodert '
    'øverst for et levende uttrykk. Fest trådene ekstra godt inni hodet.',
    'For the very youngest: embroider the eyes instead, with black embroidery thread. Sew a '
    'small, dense oval or circle (satin stitch) at each eye point, leaving a tiny unstitched '
    'highlight near the top for a lively look. Fasten the threads extra securely inside the '
    'head.')
add('pill_resten', 'NESE, MUNN, VIPPER OG KINN', 'NOSE, MOUTH, LASHES AND CHEEKS')
add('ansikt_resten', [
    ('Nese', 'Brodér en liten mørk brun oval nese midt på snuteflekken, i tett satengsting.'),
    ('Munn', 'Fra bunnen av nesen, brodér et lite smil nedover og ut til hver side i '
     'stikksøm med svart tråd.'),
    ('Vipper', 'Brodér 2 til 3 korte, buede sting med svart tråd over ytre hjørne av hvert '
     'øye, for det rolige, blide blikket.'),
    ('Kinn', 'Hekle to små flate sirkler i pudderrosa (6 fm i magisk ring, avslutt), og sy '
     'dem lett fast på kinnene under hvert øye.'),
], [
    ('Nose', 'Embroider a small dark brown oval nose in the middle of the muzzle patch, in '
     'dense satin stitch.'),
    ('Mouth', 'From the base of the nose, embroider a small smile downward and out to each '
     'side in backstitch, using black thread.'),
    ('Lashes', 'Embroider 2 to 3 short, curved stitches with black thread above the outer '
     'corner of each eye, for the calm, cheerful look.'),
    ('Cheeks', 'Crochet two small flat circles in powder pink (6 sc in a magic ring, fasten '
     'off), and sew them lightly onto the cheeks below each eye.'),
])
add('ansikt_bilde_caption',
    'Slik kan det ferdige ansiktet se ut: runde ører, flat snuteflekk med stiplet '
    'plassering, sikkerhetsøyne, brodert nese og munn.',
    'This is roughly how the finished face can look: round ears, a flat muzzle patch with '
    'dashed placement, safety eyes, embroidered nose and mouth.')

# ---------------------------------------------------------------- SIDE 12: DEL 4 KROPPEN
add('banner_kropp', 'DEL 4: KROPPEN', 'PART 4: THE BODY')
add('kropp_lead',
    'Dette er Oliver sin signaturdel: en kropp som holdes rundere og fylles fastere enn på '
    'resten av familien, for den klassiske, pussete bamseformen. Hekles helt i varmt lyst '
    'brunt, uten eget magepanel.',
    "This is Oliver's signature part: a body kept rounder and stuffed more firmly than on the "
    "rest of the family, for the classic, plump teddy bear shape. Crocheted entirely in warm "
    "light brown, with no separate belly panel.")
add('kropp_rows', [
    ('1', '6 fm i magisk ring', 6),
    ('2', 'økn x 6', 12),
    ('3', '(1 fm, økn) x 6', 18),
    ('4', '(2 fm, økn) x 6', 24),
    ('5', '(3 fm, økn) x 6', 30),
    ('6', '(4 fm, økn) x 6', 36),
    ('7', '(5 fm, økn) x 6', 42),
    ('8', '(6 fm, økn) x 6', 48),
    ('9 til 18', '48 fm, 10 omganger uten økning - fyll ekstra godt og jevnt underveis', 48),
    ('19', '(6 fm, mink) x 6', 42),
    ('20', '42 fm', 42),
    ('21', '(5 fm, mink) x 6', 36),
    ('22', '(4 fm, mink) x 6', 30),
    ('23', '(3 fm, mink) x 6', 24),
])
add('kropp_rows_en', [
    ('1', '6 sc in a magic ring', 6),
    ('2', 'inc x 6', 12),
    ('3', '(1 sc, inc) x 6', 18),
    ('4', '(2 sc, inc) x 6', 24),
    ('5', '(3 sc, inc) x 6', 30),
    ('6', '(4 sc, inc) x 6', 36),
    ('7', '(5 sc, inc) x 6', 42),
    ('8', '(6 sc, inc) x 6', 48),
    ('9 to 18', '48 sc, 10 rounds with no increases - stuff extra firmly and evenly as you go',
     48),
    ('19', '(6 sc, dec) x 6', 42),
    ('20', '42 sc', 42),
    ('21', '(5 sc, dec) x 6', 36),
    ('22', '(4 sc, dec) x 6', 30),
    ('23', '(3 sc, dec) x 6', 24),
])
add('kropp_ferdig',
    'Ikke klipp av. Kontroller at magen er godt og jevnt fylt hele veien rundt, den skal '
    'kjennes fast og rund, det er dette som gir Oliver hans karakteristiske form, og bruk så '
    'den samme trådenden til å feste hodet oppå kroppen senere.',
    'Do not cut the yarn. Check that the belly is filled evenly and firmly all the way around, '
    'it should feel firm and round, this is what gives Oliver his characteristic shape, then '
    'use that same yarn tail to attach the head on top of the body later.')

# ---------------------------------------------------------------- SIDE 13: DEL 5 ARMENE
add('banner_armer', 'DEL 5: ARMENE (2 STK)', 'PART 5: THE ARMS (MAKE 2)')
add('armer_lead',
    'Armene er korte og myke, varmt lyst brune, akkurat som resten av kroppen.',
    'The arms are short and soft, warm light brown, just like the rest of the body.')
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

# ---------------------------------------------------------------- SIDE 14: DEL 6 BENA OG POTENE
add('banner_bena', 'DEL 6: BENA OG POTENE (2 STK)', 'PART 6: THE LEGS AND PAWS (MAKE 2)')
add('bena_lead',
    'Bena starter i varmt lyst brunt, og skifter til kremhvitt nederst for de siste '
    'omgangene, som blir en enkel, lys pote.',
    'The legs start in warm light brown, and switch to cream at the bottom for the last '
    'rounds, which become a simple, light paw.')
add('bena_rows', [
    ('1', '6 fm i magisk ring, varmt lyst brunt', 6),
    ('2', 'økn x 6', 12),
    ('3', '(1 fm, økn) x 6', 18),
    ('4 til 11', '18 fm, 8 omganger', 18),
    ('12', 'bytt til kremhvit, 18 fm', 18),
    ('13 til 14', '18 fm, 2 omganger', 18),
])
add('bena_rows_en', [
    ('1', '6 sc in a magic ring, warm light brown', 6),
    ('2', 'inc x 6', 12),
    ('3', '(1 sc, inc) x 6', 18),
    ('4 to 11', '18 sc, 8 rounds', 18),
    ('12', 'switch to cream, 18 sc', 18),
    ('13 to 14', '18 sc, 2 rounds', 18),
])
add('bena_ferdig',
    'Klipp av, la ca. 20 cm tråd igjen. Fyll godt og fast, spesielt nederst, så bena kan bære '
    'kroppen når Oliver sitter.',
    'Cut the yarn, leaving a tail of approx. 20 cm. Stuff firmly, especially at the bottom, so '
    'the legs can support the body when Oliver is sitting.')

# ---------------------------------------------------------------- SIDE 15: DEL 7 KRAGEN
add('banner_krage', 'DEL 7: KRAGEN', 'PART 7: THE COLLAR')
add('krage_lead',
    'Den lyseblå volangkragen hekles direkte rundt halsen, der hodet skal møte kroppen, samme '
    'modell som resten av familien bruker, bare i en annen farge.',
    'The light blue ruffled collar is crocheted directly around the neck, where the head will '
    'meet the body, the same model the rest of the family uses, just in a different colour.')
add('krage_txt',
    'Før du syr hodet fast på kroppen: fest lys blå tråd i kroppens øverste kant, der halsen '
    'skal være (18 m). *1 fm i neste maske, hopp over 1 maske, 4 stav i neste maske (en liten '
    'vifte), hopp over 1 maske*, gjenta rundt hele kanten (6 vifter totalt). Fest av og gjem '
    'tråden.',
    'Before sewing the head onto the body: attach light blue yarn at the top edge of the '
    'body, where the neck will be (18 sts). *1 sc in the next stitch, skip 1 stitch, 4 dc in '
    'the next stitch (a little fan), skip 1 stitch*, repeat all the way around the edge (6 '
    'fans in total). Fasten off and weave in the end.')
add('krage_plassering',
    'Kragen skal ligge som en liten volangkant rundt halsen, med hodet syd fast oppå, midt '
    'over kragen, akkurat som på resten av familien.',
    "The collar should sit as a little ruffled edge around the neck, with the head sewn on "
    "top, centred over the collar, just like on the rest of the family.")

# ---------------------------------------------------------------- SIDE 16: KRAGEN OG DEN RUNDE MAGEN, SETT FRA SIDEN (diagram)
add('banner_side', 'KRAGEN OG DEN RUNDE MAGEN, SETT FRA SIDEN', 'THE COLLAR AND ROUND BELLY, SEEN FROM THE SIDE')
add('side_lead',
    'Denne skissen viser Oliver fra siden: hvor rund og full magen skal være, og hvordan '
    'kragen sitter rett under haken.',
    "This sketch shows Oliver from the side: how round and full the belly should be, and how "
    "the collar sits right under the chin.")

# ---------------------------------------------------------------- SIDE 17: MONTERING
add('banner_montering', 'MONTERING', 'ASSEMBLY')
add('montering_lead',
    'Nå skal alle delene bli til Oliver. Bruk knappenåler til å prøve plasseringen først, så '
    'syr du for godt til slutt. Alt sys fast med tett heftesting eller stikksøm og god, '
    'tvinnet tråd, ingenting limes.',
    'Now all the pieces become Oliver. Use safety pins to test the placement first, then sew '
    'everything firmly at the end. Everything is sewn on with tight running stitch or '
    'backstitch and strong, twisted thread, nothing is glued.')
add('montering_steg', [
    'Sy bena fast under kroppen, ca. 1 til 2 cm fra hverandre, så Oliver står stødig når han '
    'sitter.',
    'Sy armene fast på hver side av kroppen, litt nedenfor der halsen skal være.',
    'Hekle volangkragen rundt kroppens øverste kant, der halsen skal være.',
    'Sy snuteflekken fast nederst midt på hodet, flatt mot ansiktet, før du setter inn øyne, '
    'nese, munn, vipper og kinn (se side om ansiktet).',
    'Sy hodet fast oppå kroppen, midt over kragen. Sjekk at hodet sitter rett frem før du syr '
    'helt ferdig.',
    'Sy ørene fast høyt på hodet, ett på hver side.',
    'Fest alle løse tråder godt på innsiden av delene, og klipp av det som er igjen.',
])
add('montering_steg_en', [
    "Sew the legs onto the bottom of the body, approx. 1 to 2 cm apart, so Oliver stands "
    "steadily when he sits.",
    'Sew the arms onto each side of the body, a little below where the neck will be.',
    'Crochet the ruffled collar around the top edge of the body, where the neck will be.',
    'Sew the muzzle patch onto the bottom centre of the head, flat against the face, before '
    'adding the eyes, nose, mouth, lashes and cheeks (see the face page).',
    'Sew the head onto the body, centred over the collar. Check that the head faces forward '
    'before you sew it on completely.',
    'Sew the ears onto the head, high up, one on each side.',
    'Fasten every loose end securely on the inside of the pieces, and trim what is left.',
])

# ---------------------------------------------------------------- SIDE 18: SIKKERHET OG STELL
add('banner_sikkerhet', 'ETTERARBEID, SIKKERHET OG STELL', 'FINISHING, SAFETY AND CARE')
add('pill_etterarbeid', 'HELT TIL SLUTT', 'FINISHING TOUCHES')
add('etterarbeid', [
    'Fest alle løse tråder godt på innsiden av delene: vev dem fram og tilbake gjennom noen '
    'masker med stoppenålen, og klipp av det som er igjen.',
    'Se over alle sømmer, spesielt der kroppen møter hodet, det er stedet som bærer mest '
    'vekt. Er noen masker løse eller har hull, sy over med noen ekstra sting.',
    'Kontroller at snuteflekken og ørene sitter helt flatt og godt fast, uten løse kanter et '
    'lite barn kan plukke i.'],
    ['Fasten every loose end securely on the inside of the pieces: weave it back and forth '
     'through a few stitches with the yarn needle, then trim what is left.',
     'Check over every seam, especially where the body meets the head, that is the spot that '
     'carries the most weight. If any stitches are loose or there are gaps, sew over them '
     'with a few extra stitches.',
     'Check that the muzzle patch and the ears sit completely flat and securely, with no '
     'loose edges a small child could pick at.'])
add('pill_sikkerhet', 'SIKKERHET', 'SAFETY')
add('sikkerhet_txt', [
    'Ingen deler limes, alt sys godt fast med tett tråd. Dobbeltsjekk sømmene på øyne, nese, '
    'ører, snuteflekk, armer og ben, dette er stedene som får mest drahjelp under lek.',
    'Bruker du sikkerhetsøyne (versjon A), er Oliver beregnet for barn fra 3 år, siden '
    'smådeler kan løsne over tid ved hard bruk. For de aller minste, bruk versjon B med '
    'broderte øyne i stedet.',
    'Den godt fylte magen tåler klemming fint, men bør sjekkes jevnlig for å se at sømmene '
    'fortsatt sitter helt sikkert rundt hele kroppen.',
    'Vask alltid gamle sømmer og fest på nytt hvis du ser tegn til slitasje. Kast Oliver hvis '
    'fyll begynner å komme ut, eller hvis en del løsner og ikke kan syes trygt fast igjen.'],
    ['No parts are glued, everything is sewn securely with strong thread. Double-check the '
     'seams on the eyes, nose, ears, muzzle patch, arms and legs, these are the spots that '
     'get the most tugging during play.',
     'If you use safety eyes (version A), Oliver is intended for children aged 3 and up, '
     'since small parts can loosen over time with heavy use. For the very youngest, use '
     'version B with embroidered eyes instead.',
     'The firmly stuffed belly handles squeezing well, but should be checked regularly to '
     'make sure the seams are still completely secure all the way around the body.',
     'Always check old seams and re-sew them if you see signs of wear. Retire Oliver if '
     'stuffing starts to come out, or if a piece comes loose and cannot be sewn safely back '
     'on.'])
add('pill_stell', 'VASK OG STELL', 'WASHING AND CARE')
add('stell_txt',
    'Håndvask i lunkent vann med litt mild såpe, eller vask på 30 grader i vaskepose. Klem '
    'forsiktig ut vannet i et håndkle, ikke vri. Form Oliver pent og legg ham til tørk flatt, '
    'og klem magen forsiktig i form mens den er fuktig, slik at han beholder sin runde fasong.',
    'Hand wash in lukewarm water with a little mild soap, or machine wash at 30 degrees in a '
    'wash bag. Gently press out the water in a towel, do not wring. Reshape Oliver neatly and '
    'lay him flat to dry, gently squeezing the belly back into shape while it is still damp, '
    'so he keeps his round form.')

# ---------------------------------------------------------------- SIDE 19: FERDIG
add('banner_ferdig', 'GRATULERER, OLIVER ER FERDIG!', 'CONGRATULATIONS, OLIVER IS DONE!')
add('ferdig_txt',
    'Nå har du heklet din helt egen Oliver, den lille bjørnen. Vis ham gjerne fram i '
    '#lmebabycollection, jeg elsker å se hva dere skaper!',
    "Now you have crocheted your very own Oliver, the little bear. Feel free to show him off "
    "in #lmebabycollection, I love seeing what you make!")
add('pill_kolleksjon', 'RESTEN AV LME BABY COLLECTION', 'THE REST OF THE LME BABY COLLECTION')
add('kolleksjon_lead',
    'Oliver er den sjette figuren i "Woodland Dreams", i samme uttrykk, garnvalg og '
    'fargepalett som resten av familien.',
    'Oliver is the sixth figure in "Woodland Dreams", in the same look, yarn choice and '
    'colour palette as the rest of the family.')
add('kolleksjon_liste',
    ['Ellie, det lille dådyret', 'Pip, det lille pinnsvinet', 'Felix, den lille reven',
     'Molly, det lille lammet', 'Luna, den lille kaninen', 'Ellies smokkelenke',
     'Pips smokkelenke', "Felix' smokkelenke", 'Mollys smokkelenke', 'Lunas smokkelenke',
     'Olivers smokkelenke', 'Ellies rangle', 'Pips rangle', "Felix' rangle", 'Mollys rangle',
     'Lunas rangle', 'Olivers rangle', 'Ellies vognlenke', 'Pips vognlenke',
     "Felix' vognlenke", 'Mollys vognlenke', 'Lunas vognlenke', 'Olivers vognlenke',
     'Ellies ballerinasko', 'Ellies aktivitetsleke'],
    ['Ellie, the little fawn', 'Pip, the little hedgehog', 'Felix, the little fox',
     'Molly, the little lamb', 'Luna, the little bunny', "Ellie's pacifier clip",
     "Pip's pacifier clip", "Felix's pacifier clip", "Molly's pacifier clip",
     "Luna's pacifier clip", "Oliver's pacifier clip", "Ellie's rattle", "Pip's rattle",
     "Felix's rattle", "Molly's rattle", "Luna's rattle", "Oliver's rattle",
     "Ellie's stroller toy", "Pip's stroller toy", "Felix's stroller toy",
     "Molly's stroller toy", "Luna's stroller toy", "Oliver's stroller toy",
     "Ellie's ballerina shoes", "Ellie's activity toy"])
add('pill_copyright', 'COPYRIGHT', 'COPYRIGHT')
add('copyright_txt',
    'Denne oppskriften er et helt originalt LME-design (c) Renate Dahl, Little Montessori '
    'Explorers. Du kan gjerne selge amigurumier du hekler etter denne oppskriften i din egen, '
    'lille skala. Oppskriften i seg selv, teksten og bildene, skal ikke deles, kopieres '
    'eller videreselges.',
    '(c) Renate Dahl, Little Montessori Explorers. This pattern is a fully original LME '
    'design. You are welcome to sell finished amigurumi you make from this pattern, on a '
    'small personal scale. The pattern itself, its text and images, may not be shared, '
    'copied or resold.')

# ======================================================================
# SVG-illustrasjoner
# ======================================================================

def schematic(lang):
    txt = {
        'height': {'no': 'h. ca. 20-22 cm', 'en': 'h. approx. 20-22 cm'},
        'width': {'no': 'br. ca. 14 cm', 'en': 'w. approx. 14 cm'},
        'ears': {'no': '1. ørene', 'en': '1. ears'},
        'snout': {'no': '2. snuten', 'en': '2. muzzle'},
        'collar': {'no': '3. kragen', 'en': '3. collar'},
        'belly': {'no': '4. magen', 'en': '4. belly'},
        'arms': {'no': '5. armene', 'en': '5. arms'},
        'legs': {'no': '6. bena', 'en': '6. legs'},
    }
    def t(k): return txt[k][lang]
    return f'''
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 520 380" style="width:100%">
  <line x1="60" y1="30" x2="60" y2="330" stroke="#8a8a8a" stroke-width="2"/>
  <text x="40" y="180" text-anchor="middle" font-size="14" font-family="sans-serif" fill="#666" transform="rotate(-90 40 180)">{t('height')}</text>
  <ellipse cx="260" cy="240" rx="58" ry="62" fill="{TAN}" stroke="{TAN_DARK}" stroke-width="2"/>
  <ellipse cx="260" cy="255" rx="34" ry="40" fill="{CREAM}" stroke="#e3d2b8" stroke-width="1.5"/>
  <ellipse cx="196" cy="222" rx="14" ry="32" fill="{TAN}" stroke="{TAN_DARK}" stroke-width="2" transform="rotate(-16 196 222)"/>
  <ellipse cx="324" cy="222" rx="14" ry="32" fill="{TAN}" stroke="{TAN_DARK}" stroke-width="2" transform="rotate(16 324 222)"/>
  <ellipse cx="234" cy="312" rx="20" ry="22" fill="{TAN}" stroke="{TAN_DARK}" stroke-width="2"/>
  <ellipse cx="286" cy="312" rx="20" ry="22" fill="{TAN}" stroke="{TAN_DARK}" stroke-width="2"/>
  <ellipse cx="234" cy="322" rx="10" ry="7" fill="{CREAM}" stroke="#e3d2b8" stroke-width="1"/>
  <ellipse cx="286" cy="322" rx="10" ry="7" fill="{CREAM}" stroke="#e3d2b8" stroke-width="1"/>
  <path d="M208,178 Q260,194 312,178" fill="none" stroke="{BLUE}" stroke-width="11" stroke-linecap="round"/>
  <circle cx="260" cy="105" r="48" fill="{TAN}" stroke="{TAN_DARK}" stroke-width="2"/>
  <circle cx="216" cy="70" r="17" fill="{TAN}" stroke="{TAN_DARK}" stroke-width="2"/>
  <circle cx="216" cy="71" r="9" fill="{CREAM}"/>
  <circle cx="304" cy="70" r="17" fill="{TAN}" stroke="{TAN_DARK}" stroke-width="2"/>
  <circle cx="304" cy="71" r="9" fill="{CREAM}"/>
  <ellipse cx="260" cy="124" rx="27" ry="22" fill="{CREAM}" stroke="#e3d2b8" stroke-width="1.5"/>
  <circle cx="244" cy="102" r="4.5" fill="#3a2a1e"/>
  <circle cx="276" cy="102" r="4.5" fill="#3a2a1e"/>
  <ellipse cx="260" cy="124" rx="6" ry="4.5" fill="{BROWN_DARK}"/>
  <line x1="120" y1="30" x2="400" y2="30" stroke="#8a8a8a" stroke-width="2"/>
  <text x="260" y="20" text-anchor="middle" font-size="14" font-family="sans-serif" fill="#666">{t('width')}</text>
  <text x="452" y="52" font-size="13" font-family="sans-serif" fill="#555">{t('ears')}</text>
  <line x1="448" y1="48" x2="312" y2="72" stroke="#bbb" stroke-width="1.5"/>
  <text x="452" y="75" font-size="13" font-family="sans-serif" fill="#555">{t('snout')}</text>
  <line x1="448" y1="71" x2="286" y2="124" stroke="#bbb" stroke-width="1.5"/>
  <text x="452" y="134" font-size="13" font-family="sans-serif" fill="#555">{t('collar')}</text>
  <line x1="448" y1="130" x2="300" y2="180" stroke="#bbb" stroke-width="1.5"/>
  <text x="452" y="184" font-size="13" font-family="sans-serif" fill="#555">{t('belly')}</text>
  <line x1="448" y1="180" x2="288" y2="250" stroke="#bbb" stroke-width="1.5"/>
  <text x="452" y="224" font-size="13" font-family="sans-serif" fill="#555">{t('arms')}</text>
  <line x1="448" y1="220" x2="334" y2="222" stroke="#bbb" stroke-width="1.5"/>
  <text x="452" y="314" font-size="13" font-family="sans-serif" fill="#555">{t('legs')}</text>
  <line x1="448" y1="310" x2="306" y2="312" stroke="#bbb" stroke-width="1.5"/>
</svg>'''

def face_diagram(lang):
    cap = {'no': 'stiplet = snuteflekken og øyeplassering',
           'en': 'dashed = muzzle patch and eye placement'}
    return f'''
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 280" style="width:78mm">
  <circle cx="150" cy="150" r="105" fill="{TAN}" stroke="{TAN_DARK}" stroke-width="2.5"/>
  <circle cx="95" cy="98" r="30" fill="{TAN}" stroke="{TAN_DARK}" stroke-width="2"/>
  <circle cx="95" cy="100" r="16" fill="{CREAM}"/>
  <circle cx="205" cy="98" r="30" fill="{TAN}" stroke="{TAN_DARK}" stroke-width="2"/>
  <circle cx="205" cy="100" r="16" fill="{CREAM}"/>
  <ellipse cx="150" cy="185" rx="65" ry="55" fill="{CREAM}" stroke="#e3d2b8" stroke-width="1.5" stroke-dasharray="4 4"/>
  <ellipse cx="103" cy="128" r="15" fill="#fff" stroke="{BROWN_DARK}" stroke-width="2" stroke-dasharray="3 3"/>
  <ellipse cx="197" cy="128" r="15" fill="#fff" stroke="{BROWN_DARK}" stroke-width="2" stroke-dasharray="3 3"/>
  <circle cx="103" cy="128" r="8" fill="#241a12"/>
  <circle cx="197" cy="128" r="8" fill="#241a12"/>
  <circle cx="106" cy="125" r="2.4" fill="#fff"/>
  <circle cx="200" cy="125" r="2.4" fill="#fff"/>
  <path d="M85,110 Q95,102 112,108" stroke="#241a12" stroke-width="2.4" fill="none" stroke-linecap="round"/>
  <path d="M215,110 Q205,102 188,108" stroke="#241a12" stroke-width="2.4" fill="none" stroke-linecap="round"/>
  <ellipse cx="150" cy="182" rx="13" ry="9" fill="{BROWN_DARK}"/>
  <path d="M150,191 Q140,204 128,200 M150,191 Q160,204 172,200" stroke="#241a12" stroke-width="2.2" fill="none" stroke-linecap="round"/>
  <circle cx="105" cy="162" r="9" fill="{ROSE}" opacity="0.55"/>
  <circle cx="195" cy="162" r="9" fill="{ROSE}" opacity="0.55"/>
  <text x="150" y="266" text-anchor="middle" font-size="12" font-family="sans-serif" fill="#888">{cap[lang]}</text>
</svg>'''

def ear_diagram(lang):
    cap = {'no': ['ørene, todelt: kremhvit innside sydd', 'midt oppå den brune utsiden'],
           'en': ['the ears, two layers: cream inside sewn', 'in the middle of the brown outside']}
    outside = {'no': 'ytterside', 'en': 'outside'}
    inside = {'no': 'innside', 'en': 'inside'}
    return f'''
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 320" style="width:70mm">
  <circle cx="105" cy="120" r="62" fill="{TAN}" stroke="{TAN_DARK}" stroke-width="2.5"/>
  <text x="105" y="200" text-anchor="middle" font-size="13" font-family="sans-serif" fill="{TAN_DARK}">{outside[lang]}</text>
  <path d="M175,120 L215,120" stroke="#bbb" stroke-width="2" marker-end="url(#ea1)"/>
  <defs><marker id="ea1" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 z" fill="#bbb"/></marker></defs>
  <circle cx="195" cy="120" r="62" fill="{TAN}" stroke="{TAN_DARK}" stroke-width="2.5" opacity="0.35"/>
  <circle cx="195" cy="122" r="33" fill="{CREAM}" stroke="#e3d2b8" stroke-width="2"/>
  <text x="195" y="200" text-anchor="middle" font-size="13" font-family="sans-serif" fill="{TAN_DARK}">{inside[lang]}</text>
  <text x="150" y="290" text-anchor="middle" font-size="13" font-family="sans-serif" fill="#888">{cap[lang][0]}</text>
  <text x="150" y="306" text-anchor="middle" font-size="13" font-family="sans-serif" fill="#888">{cap[lang][1]}</text>
</svg>'''

def side_diagram(lang):
    cap = {'no': 'kragen og den runde magen, sett fra siden',
           'en': 'the collar and round belly, seen from the side'}
    return f'''
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 340" style="width:70mm">
  <ellipse cx="175" cy="245" rx="86" ry="80" fill="{TAN}" stroke="{TAN_DARK}" stroke-width="2.5"/>
  <ellipse cx="178" cy="255" rx="52" ry="58" fill="{CREAM}" stroke="#e3d2b8" stroke-width="1.5"/>
  <ellipse cx="120" cy="255" rx="20" ry="30" fill="{TAN}" stroke="{TAN_DARK}" stroke-width="2" transform="rotate(-15 120 255)"/>
  <circle cx="118" cy="122" r="66" fill="{TAN}" stroke="{TAN_DARK}" stroke-width="2.5"/>
  <ellipse cx="72" cy="130" rx="30" ry="24" fill="{CREAM}" stroke="#e3d2b8" stroke-width="1.5"/>
  <circle cx="80" cy="112" r="6" fill="#241a12"/>
  <path d="M60,140 Q70,148 82,142" stroke="#241a12" stroke-width="2" fill="none" stroke-linecap="round"/>
  <ellipse cx="48" cy="128" rx="8" ry="6" fill="{BROWN_DARK}"/>
  <circle cx="105" cy="65" r="17" fill="{TAN}" stroke="{TAN_DARK}" stroke-width="2"/>
  <circle cx="105" cy="67" r="9" fill="{CREAM}"/>
  <ellipse cx="150" cy="178" rx="30" ry="14" fill="{BLUE}" stroke="{BLUE_DARK}" stroke-width="1.5" transform="rotate(-18 150 178)"/>
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
<div class="coverimg"><img src="{hero_src}" alt="Oliver, den lille bjørnen, stiluttrykk-referanse"></div>
<p class="small center" style="margin-top:-2mm;">{'Bildet viser stiluttrykk-referansen for Oliver, ikke det ferdige heklede produktet.' if lang == 'no' else 'Photo shows the style reference for Oliver, not the finished crocheted product.'}</p>
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
{sagep('SLIK ER OLIVER BYGGET OPP' if lang == 'no' else 'HOW OLIVER IS BUILT')}
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

    ore_ute = T['ore_ute_rows']['no'] if lang == 'no' else T['ore_ute_rows_en']['no']
    ore_inne = T['ore_inne_rows']['no'] if lang == 'no' else T['ore_inne_rows_en']['no']
    pages.append(pg(f'''
{banner(t('banner_orer'))}
<p>{t('orer_lead')}</p>
{rosep(t('pill_ore_ute'))}
{card(otab(ore_ute, head3[lang]))}
{sagep(t('pill_ore_inne'))}
{card(otab(ore_inne, head3[lang]))}
{cme(t('orer_ferdig'))}
<p class="small center">{t('orer_plassering')}</p>
''', 8))

    pages.append(pg(f'''
{banner(t('banner_orer_konstruksjon'))}
<p>{t('orer_konstruksjon_lead')}</p>
<div class="schematic" style="text-align:center;">{ear_diagram(lang)}</div>
''', 9))

    snuten_rows = T['snuten_rows']['no'] if lang == 'no' else T['snuten_rows_en']['no']
    pages.append(pg(f'''
{banner(t('banner_snute'))}
<p>{t('snute_lead')}</p>
{card(otab(snuten_rows, head3[lang]))}
{cme(t('snuten_ferdig'))}
''', 10))

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
''', 11))

    kropp_rows = T['kropp_rows']['no'] if lang == 'no' else T['kropp_rows_en']['no']
    pages.append(pg(f'''
{banner(t('banner_kropp'))}
<p>{t('kropp_lead')}</p>
{card(otab(kropp_rows, head3[lang]))}
{cme(t('kropp_ferdig'))}
''', 12))

    armer_rows = T['armer_rows']['no'] if lang == 'no' else T['armer_rows_en']['no']
    pages.append(pg(f'''
{banner(t('banner_armer'))}
<p>{t('armer_lead')}</p>
{card(otab(armer_rows, head3[lang]))}
{cme(t('armer_ferdig'))}
''', 13))

    bena_rows = T['bena_rows']['no'] if lang == 'no' else T['bena_rows_en']['no']
    pages.append(pg(f'''
{banner(t('banner_bena'))}
<p>{t('bena_lead')}</p>
{card(otab(bena_rows, head3[lang]))}
{cme(t('bena_ferdig'))}
''', 14))

    pages.append(pg(f'''
{banner(t('banner_krage'))}
<p>{t('krage_lead')}</p>
{card('<p>' + t('krage_txt') + '</p>')}
{cme(t('krage_plassering'))}
''', 15))

    pages.append(pg(f'''
{banner(t('banner_side'))}
<p>{t('side_lead')}</p>
<div class="schematic" style="text-align:center;">{side_diagram(lang)}</div>
''', 16))

    mo_steg = T['montering_steg']['no'] if lang == 'no' else T['montering_steg_en']['no']
    pages.append(pg(f'''
{banner(t('banner_montering'))}
<p>{t('montering_lead')}</p>
{card(steps(mo_steg))}
''', 17))

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
''', 18))

    kolliste = T['kolleksjon_liste']['no'] if lang == 'no' else T['kolleksjon_liste']['en']
    kolliste_html = ('<ul class="dots" style="columns:2;column-gap:8mm;">'
                      + ''.join(f'<li>{i}</li>' for i in kolliste) + '</ul>')
    pages.append(pg(f'''
{banner(t('banner_ferdig'))}
{cream('<p class="creamtitle">' + t('ferdig_txt') + '</p>')}
{sagep(t('pill_kolleksjon'))}
<p class="small">{t('kolleksjon_lead')}</p>
{card(kolliste_html)}
{rosep(t('pill_copyright'))}
{card('<p class="small center">' + t('copyright_txt') + '</p>')}
<div class="byline">
  <div class="by2">{t('by1')} &middot; {t('by2')} &middot; {t('by3')}</div>
</div>
''', 19))

    return pages

for lang in ('no', 'en'):
    html_doc = kit.doc(lang, T['doctitle'][lang], None, build(lang))
    out = BASE / f'oliver_{lang}.html'
    out.write_text(html_doc, encoding='utf-8')
    print('OK', lang, len(html_doc), 'tegn/chars')
