# -*- coding: utf-8 -*-
"""Genererer LME-hekleoppskrift 'Felix, den lille reven' (norsk + engelsk) som HTML,
klar for PDF-print med Chromium. Del av LME Baby Collection 'Woodland Dreams',
Ellies skogvenn."""
import base64, pathlib, sys

BASE = pathlib.Path(__file__).parent
sys.path.insert(0, str(BASE.parent / '_shared'))
import lme_pattern_kit as kit
from lme_pattern_kit import (banner, rosep, sagep, card, cream, cme, ul, steps, otab, abbrtab,
                              BROWN, BROWN_MID, BROWN_DARK, CREAM,
                              CREAM_DEEP, ROSE, SAGE, INK)

HERO = BASE / 'felix_hero.jpg'
FACE = BASE / 'felix_face.jpg'
hero_src = f'data:image/jpeg;base64,{base64.b64encode(HERO.read_bytes()).decode()}'
face_src = f'data:image/jpeg;base64,{base64.b64encode(FACE.read_bytes()).decode()}'

RUST = '#C9772E'       # hovedfarge, rustoransje
RUST_DARK = '#8B4A1F'  # kant/skygge til rustoransje

T = {}
def add(key, no, en=None):
    T[key] = {'no': no, 'en': en if en is not None else no}

head3 = {'no': ['Omg', 'Beskrivelse', 'Masker'], 'en': ['Rnd', 'Description', 'Sts']}
rowhead = {'no': ['Rad', 'Beskrivelse', 'Masker'], 'en': ['Row', 'Description', 'Sts']}

# ---------------------------------------------------------------- SIDE 1: FORSIDE
add('doctitle', 'Felix, den lille reven, LME hekleoppskrift', 'Felix, the Little Fox, LME crochet pattern')
add('ph2', 'LME HEKLEOPPSKRIFT&nbsp;&nbsp;|&nbsp;&nbsp;FELIX, DEN LILLE REVEN',
    "LME CROCHET PATTERN&nbsp;&nbsp;|&nbsp;&nbsp;FELIX, THE LITTLE FOX")
add('covertag', 'LME HEKLEOPPSKRIFT - AMIGURUMI', 'LME CROCHET PATTERN - AMIGURUMI')
add('covertitle', 'FELIX', 'FELIX')
add('subpill', 'LME BABY COLLECTION - WOODLAND DREAMS', 'LME BABY COLLECTION - WOODLAND DREAMS')
add('cover_desc',
    'Felix er en liten, rolig rev med spisse ører, en flat snuteflekk og en stor, buskete hale i '
    'to farger, akkurat i samme uttrykk som Ellie og Pip. Ingen sløyfe her, kun en salviegrønn '
    'volangkrage. Heklet i de samme varme naturfargene som resten av kolleksjonen. Et helt '
    'originalt LME-design, ferdig ca. 20 til 22 cm sittende. Middels vanskelighetsgrad.',
    'Felix is a small, calm fox with pointed ears, a flat muzzle patch and a big, bushy two-tone '
    'tail, in the very same look as Ellie and Pip. No bow here, only a sage green ruffled '
    'collar. Crocheted in the same warm natural colours as the rest of the collection. A fully '
    'original LME design, finished size approx. 20 to 22 cm sitting. Medium difficulty.')
add('by1', 'Av Renate Dahl', 'By Renate Dahl')
add('by2', 'Little Montessori Explorers', 'Little Montessori Explorers')
add('by3', 'lmexplorers.com', 'lmexplorers.com')
add('cover_tip',
    'TIPS: Les hele oppskriften én gang før du begynner, spesielt siden om halen, som hekles '
    'stor og buttet, ikke flat.',
    "TIP: Read through the whole pattern once before you start, especially the page about the "
    "tail, which is crocheted big and plump, not flat.")

# ---------------------------------------------------------------- SIDE 2: OM FELIX
add('banner_om', 'OM FELIX', 'ABOUT FELIX')
add('pill_historien', 'DEL AV ELLIES VERDEN', "PART OF ELLIE'S WORLD")
add('om_historien',
    'Felix er den tredje figuren i LME Baby Collection "Woodland Dreams", en av Ellies gode '
    'venner i skogen. Der Pip er den rolige typen som snuser seg fram til den mykeste mosen, er '
    'Felix den nysgjerrige oppdageren som alltid vet hvor bekken går og hvilken stein som er '
    'best å sitte på. Flere skogvenner er på vei inn i kolleksjonen etter hvert.',
    'Felix is the third figure in the LME Baby Collection "Woodland Dreams", one of Ellie\'s good '
    'friends in the forest. Where Pip is the calm type who noses his way to the softest moss, '
    'Felix is the curious explorer who always knows where the stream goes and which rock is '
    'best to sit on. More woodland friends are on their way into the collection over time.')
add('pill_stil', 'STIL', 'STYLE')
add('om_stil',
    'Samme premium amigurumi-uttrykk som Ellie og Pip: store former, myke overganger, rolige '
    'fargeskift og et vennlig, avrundet blikk. Felix er IKKE spiss eller listig i uttrykket, '
    'IKKE realistisk, og halen er heklet stor og myk, ikke stiv, slik at han er trygg og god å '
    'klemme.',
    'The same premium amigurumi look as Ellie and Pip: big shapes, soft transitions, calm colour '
    'changes and a friendly, rounded gaze. Felix does NOT look sly or sharp-featured, is NOT '
    'realistic, and the tail is crocheted big and soft, not stiff, so he is safe and nice to '
    'cuddle.')
add('pill_montessori', 'MONTESSORI-INSPIRERT', 'MONTESSORI-INSPIRED')
add('om_montessori',
    'Store, enkle former og rolige fargeblokker gjør Felix fin å kjenne på og lett å gjenkjenne '
    'for de minste, akkurat den typen konkrete, sanselige lek Montessori-filosofien bygger på.',
    'Big, simple shapes and calm blocks of colour make Felix nice to feel and easy for little '
    'ones to recognise, exactly the kind of concrete, sensory play the Montessori philosophy is '
    'built on.')

# ---------------------------------------------------------------- SIDE 3: STØRRELSE OG MATERIALER
add('banner_mat', 'STØRRELSE OG MATERIALER', 'SIZE AND MATERIALS')
add('pill_storrelse', 'FERDIG STØRRELSE', 'FINISHED SIZE')
add('storrelse_txt', 'Ca. 20 til 22 cm høy, sittende.', 'Approx. 20 to 22 cm tall, sitting.')
add('pill_garn', 'GARN', 'YARN')
add('garn_lead',
    'Bystrikk Merino gir en myk, tett amigurumi-overflate, godt egnet til den buskete halen.',
    'Bystrikk Merino gives a soft, firm amigurumi surface, well suited to the bushy tail.')
add('garn_tabell_head', ['Farge', 'Til', 'Mengde'], ['Colour', 'For', 'Amount'])
add('garn_rows', [
    ('Bystrikk Merino, rustoransje (hovedfarge)', 'hodet, ørenes utside, kroppen, armene, bena, '
     'mesteparten av halen', 'ca. 2 nøster',
     'Bystrikk Merino, rust orange (main colour)', "the head, the outside of the ears, the body, "
     'the arms, the legs, most of the tail', 'approx. 2 skeins'),
    ('Bystrikk Merino, kremhvit', 'snuteflekken, ørenes innside, magebeltet, potene, halespissen',
     'ca. 1 nøste',
     'Bystrikk Merino, cream', 'the muzzle patch, the inside of the ears, the belly patch, the '
     'paws, the tail tip', 'approx. 1 skein'),
    ('Bystrikk Merino, salviegrønt', 'volangkragen', 'litt',
     'Bystrikk Merino, sage green', 'the ruffled collar', 'small amount'),
    ('Rest, mørkt brunt', 'nesen og de nedre delene av armer/ben', 'litt',
     'Leftover, dark brown', 'the nose and the lower parts of the arms/legs', 'small amount'),
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
    ('Polyesterfiber til fyll', 'ren, vaskbar leketøyfyll, ekstra mye til den buskete halen'),
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
    'Hekler du løsere enn dette, synes fyllet gjennom maskene og Felix blir myk og ustødig i '
    'stedet for fin og fast.',
    'Approx. 16 sc x 18 rounds = 10 x 10 cm, crocheted TIGHTLY (amigurumi tension) on a 4 mm '
    'hook. If you crochet looser than this, the stuffing shows through the stitches and Felix '
    'turns out soft and floppy instead of neat and firm.')
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
    'Hodet, kroppen, armene, bena og halen hekles i spiral med fastmasker, uten å avslutte '
    'omgangene. Kragen hekles frem og tilbake i rader. Sett gjerne en maskemarkør i første '
    'maske på hver spiraldel.',
    'The head, body, arms, legs and tail are crocheted in a spiral of single crochet, without '
    'joining the rounds. The collar is crocheted back and forth in rows. Place a stitch marker '
    'in the first stitch of each spiral piece.')

# ---------------------------------------------------------------- SIDE 5: TIPS OG OVERSIKT
add('banner_oversikt', 'TIPS OG SLIK ER FELIX BYGGET OPP', "TIPS AND HOW FELIX IS BUILT")
add('pill_tips', 'TIPS FØR DU BEGYNNER', 'TIPS BEFORE YOU START')
add('tips',
    ['Hekle halen først, den tar lengst tid og bruker mest fyll, så vet du tidlig om du har nok '
     'garn igjen til resten.',
     'Legg alle delene ved siden av hverandre før du syr noe fast, så du ser at Felix blir '
     'symmetrisk.',
     'Fyll litt og litt underveis i stedet for helt til slutt, det gir en jevnere, penere form, '
     'spesielt i halen.'],
    ['Crochet the tail first, it takes the longest and uses the most stuffing, so you will know '
     'early whether you have enough yarn left for the rest.',
     'Lay all the pieces out next to each other before sewing anything on, so you can see that '
     'Felix turns out symmetrical.',
     'Stuff a little at a time as you go, rather than all at once at the end, it gives a more '
     'even, neater shape, especially in the tail.'])
add('oversikt_lead',
    'Felix hekles i åtte deler, som sys sammen helt til slutt. Ingen deler limes, og alt sys '
    'godt fast slik at ingenting løsner. Gjør deg kjent med delene før du begynner:',
    'Felix is crocheted in eight pieces, which are all sewn together at the very end. No pieces '
    'are glued, and everything is sewn securely so that nothing comes loose. Get to know the '
    'pieces before you begin:')
add('oversikt_deler', [
    ('1. Hodet', 'stort og rundt, rustoransje', '1. The head', 'big and round, rust orange'),
    ('2. Snuteflekken', 'liten, flat, kremhvit', '2. The muzzle patch', 'small, flat, cream'),
    ('3. Ørene (x2)', 'spisse, med lys innside', '3. The ears (x2)', 'pointed, with a light inside'),
    ('4. Kroppen', 'rund, rustoransje med et kremhvitt magebelte', '4. The body',
     'round, rust orange with a cream belly patch'),
    ('5. Armene (x2)', 'oransje med mørke potetupper', '5. The arms (x2)',
     'orange with dark paw tips'),
    ('6. Bena (x2)', 'oransje med mørke potetupper og kremhvite poteputer', '6. The legs (x2)',
     'orange with dark paw tips and cream paw pads'),
    ('7. Halen', 'stor og buskete, oransje med kremhvit spiss', '7. The tail',
     'big and bushy, orange with a cream tip'),
    ('8. Kragen', 'salviegrønn volangkrage, ingen sløyfe', '8. The collar',
     'a sage green ruffled collar, no bow'),
])
add('schematic_caption',
    'Målskisse: Felix sittende, ca. 20 til 22 cm høy og ca. 13 cm bred over armene.',
    'Size sketch: Felix sitting, approx. 20 to 22 cm tall and approx. 13 cm wide across the arms.')

# ---------------------------------------------------------------- SIDE 6: KROPPENS PROPORSJONER (diagram)
add('banner_proporsjoner', 'KROPPENS PROPORSJONER', 'BODY PROPORTIONS')
add('proporsjoner_lead',
    'Bruk denne skissen som en rettesnor mens du hekler, spesielt for å se hvor stor halen skal '
    'være i forhold til resten av kroppen.',
    "Use this sketch as a guide while you crochet, especially to see how big the tail should be "
    "compared to the rest of the body.")

# ---------------------------------------------------------------- SIDE 7: DEL 1 HODET
add('banner_hode', 'DEL 1: HODET', 'PART 1: THE HEAD')
add('hode_lead',
    'Hodet hekles i spiral, ovenfra og ned, helt i rustoransje. Det starter smalt, øker ut til '
    'bredest midt på, står rett en stund, og minker så ned igjen mot halsen.',
    'The head is crocheted in a spiral, from the top down, entirely in rust orange. It starts '
    'narrow, increases out to its widest point in the middle, stays even for a while, then '
    'decreases back down towards the neck.')
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

# ---------------------------------------------------------------- SIDE 8: DEL 2 SNUTEFLEKKEN
add('banner_snute', 'DEL 2: SNUTEFLEKKEN', 'PART 2: THE MUZZLE PATCH')
add('snute_lead',
    'I motsetning til Pips spisse, fremstikkende snute er Felix sin snuteflekk en liten, flat '
    'del som sys oppå den nedre delen av ansiktet, akkurat som Ellies ansiktsfelt. Hekles i '
    'kremhvitt.',
    "Unlike Pip's pointed, projecting snout, Felix's muzzle patch is a small, flat piece sewn "
    "onto the lower part of the face, just like Ellie's face patch. Crocheted in cream.")
add('snuten_rows', [
    ('1', '6 fm i magisk ring', 6),
    ('2', 'økn x 6', 12),
    ('3', '(1 fm, økn) x 6', 18),
    ('4', '(2 fm, økn) x 6', 24),
])
add('snuten_rows_en', [
    ('1', '6 sc in a magic ring', 6),
    ('2', 'inc x 6', 12),
    ('3', '(1 sc, inc) x 6', 18),
    ('4', '(2 sc, inc) x 6', 24),
])
add('snuten_ferdig',
    'Klipp av, la ca. 20 cm tråd igjen. Ikke fyll, snuteflekken skal være flat. Sy den fast '
    'nederst midt på hodet, flatt mot ansiktet, ikke fremoverstikkende, se side om ansiktet for '
    'nøyaktig plassering.',
    'Cut, leaving a tail of approx. 20 cm. Do not stuff, the muzzle patch should be flat. Sew it '
    'on at the bottom centre of the head, flat against the face, not projecting forward, see the '
    'face page for exact placement.')

# ---------------------------------------------------------------- SIDE 9: DEL 3 ØRENE
add('banner_orer', 'DEL 3: ØRENE (2 STK)', 'PART 3: THE EARS (MAKE 2)')
add('orer_lead',
    'Hvert øre hekles i to lag akkurat som på Pip, en litt større del i rustoransje (utsiden) og '
    'en litt mindre i kremhvitt (innsiden), som sys sammen. I stedet for å la dem være runde og '
    'flate, brettes Felix sine ører i to og sys langs én side, slik at de blir spisse og '
    'trekantede. Hekle to av hver.',
    'Each ear is crocheted in two layers, just like on Pip: a slightly bigger piece in rust '
    'orange (the outside) and a slightly smaller one in cream (the inside), which are sewn '
    "together. Instead of leaving them round and flat, Felix's ears are folded in half and "
    'sewn along one side, so they become pointed and triangular. Crochet two of each.')
add('pill_ore_ute', 'YTTERSIDEN (RUSTORANSJE) - HEKLE 2', 'THE OUTSIDE (RUST ORANGE) - MAKE 2')
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
    'den kremhvite sirkelen midt oppå den rustoransje og sy den fast med heftesting, så det står '
    'en jevn oransje kant rundt. Brett så hvert øre dobbelt sammen fra side til side, slik at det '
    'kremhvite innsiden vises som en trekant foran, og sy langs den nederste kanten for å låse '
    'formen som en spiss.',
    'Cut both pieces, leaving a tail of approx. 20 cm. Do not stuff the ears, they should be '
    'flat. Place the cream circle in the middle of the rust orange one and sew it on with '
    'running stitch, leaving an even orange rim showing. Then fold each ear in half from side to '
    'side, so the cream inside shows as a triangle at the front, and sew along the bottom edge '
    'to lock in the pointed shape.')
add('orer_plassering',
    'Sy ørene høyt på hodet, ett på hver side, med spissen pekende litt utover, se side om '
    'ansiktet for nøyaktig plassering.',
    'Sew the ears on high up on the head, one on each side, with the point angled slightly '
    'outward, see the face page for exact placement.')

# ---------------------------------------------------------------- SIDE 10: ANSIKTET (diagram)
add('banner_ansikt', 'ANSIKTET', 'THE FACE')
add('ansikt_lead',
    'Ansiktet er det som gir Felix liv. Ta deg god tid her, og prøv gjerne med knappenåler først '
    'før du syr eller fester noe fast.',
    "The face is what brings Felix to life. Take your time here, and try pinning things in place "
    "with safety pins before you sew or fasten anything.")
add('pill_ojne', 'ØYNE, TO VERSJONER', 'EYES, TWO VERSIONS')
add('ojne_a_tit', 'Versjon A: sikkerhetsøyne (fra 3 år)', 'Version A: safety eyes (age 3+)')
add('ojne_a',
    'Bruk 16 mm sikkerhetsøyne. Sett dem inn ca. 2 cm fra hverandre, litt over midten av der '
    'snuteflekken skal sitte. Skyv baksiden godt på plass FØR du fyller hodet ferdig, så det '
    'ikke er mulig å trekke øyet ut igjen fra innsiden.',
    'Use 16 mm safety eyes. Insert them approx. 2 cm apart, a little above where the muzzle '
    'patch will sit. Push the backing washer firmly into place BEFORE you finish stuffing the '
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
    ('Nese', 'Brodér en liten mørk brun trekantet nese midt på snuteflekken, i tett satengsting.'),
    ('Munn', 'Fra bunnen av nesen, brodér et lite smil nedover og ut til hver side i '
     'stikksøm med svart tråd.'),
    ('Vipper', 'Brodér en kort, buet strek med svart tråd over ytre hjørne av hvert øye, for '
     'det våkne, nysgjerrige blikket.'),
    ('Kinn', 'Hekle to små flate sirkler i pudderrosa (6 fm i magisk ring, avslutt), og sy dem '
     'lett fast på kinnene under hvert øye, litt ut mot siden av snuteflekken.'),
], [
    ('Nose', 'Embroider a small dark brown triangular nose in the middle of the muzzle patch, in '
     'dense satin stitch.'),
    ('Mouth', 'From the base of the nose, embroider a small smile downward and out to each '
     'side in backstitch, using black thread.'),
    ('Lashes', 'Embroider one short, curved stroke with black thread above the outer corner of '
     'each eye, for the alert, curious look.'),
    ('Cheeks', 'Crochet two small flat circles in powder pink (6 sc in a magic ring, fasten '
     'off), and sew them lightly onto the cheeks below each eye, slightly out towards the side '
     'of the muzzle patch.'),
])
add('ansikt_bilde_caption',
    'Slik kan det ferdige ansiktet se ut: spisse ører, flat snuteflekk med stiplet plassering, '
    'sikkerhetsøyne, brodert nese og munn.',
    'This is roughly how the finished face can look: pointed ears, a flat muzzle patch with '
    'dashed placement, safety eyes, embroidered nose and mouth.')

# ---------------------------------------------------------------- SIDE 11: DEL 4 KROPPEN
add('banner_kropp', 'DEL 4: KROPPEN', 'PART 4: THE BODY')
add('kropp_lead',
    'Kroppen hekles i rustoransje, akkurat stor nok til at Felix kan sitte stødig. En egen, flat '
    'kremhvit magebelte-lapp hekles for seg og sys på foran til slutt, i stedet for å hekle den '
    'inn som fargeskift underveis.',
    "The body is crocheted in rust orange, just big enough for Felix to sit steadily. A "
    'separate, flat cream belly patch is crocheted on its own and sewn onto the front at the '
    'end, instead of being worked in as a colour change along the way.')
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
    'Ikke klipp av. Kontroller at kroppen er godt og jevnt fylt, spesielt i bunnen, så Felix '
    'sitter stødig, og bruk så den samme trådenden til å feste hodet oppå kroppen senere.',
    'Do not cut the yarn. Check that the body is filled evenly and firmly, especially at the '
    'bottom, so Felix sits steadily, then use that same yarn tail to attach the head on top of '
    'the body later.')
add('pill_magebelte', 'MAGEBELTET, KREMHVIT', 'THE BELLY PATCH, CREAM')
add('magebelte_txt',
    'Hekle 6 fm i magisk ring, økn x 6 (12), (1 fm, økn) x 6 (18), (2 fm, økn) x 6 (24). Klipp '
    'av, la ca. 20 cm tråd igjen. Ikke fyll, den skal være flat. Sy den fast midt på magen, fra '
    'like under kragen og nedover.',
    'Crochet 6 sc in a magic ring, inc x 6 (12), (1 sc, inc) x 6 (18), (2 sc, inc) x 6 (24). Cut '
    'the yarn, leaving a tail of approx. 20 cm. Do not stuff, it should be flat. Sew it onto the '
    'middle of the belly, from just below the collar and downward.')

# ---------------------------------------------------------------- SIDE 12: DEL 5 ARMENE
add('banner_armer', 'DEL 5: ARMENE (2 STK)', 'PART 5: THE ARMS (MAKE 2)')
add('armer_lead',
    'Armene starter i mørkt brunt nederst, som en liten potetupp, og skifter så til rustoransje '
    'for resten av armen opp mot skulderen.',
    'The arms start in dark brown at the bottom, like a little paw tip, then switch to rust '
    'orange for the rest of the arm up towards the shoulder.')
add('armer_rows', [
    ('1', '6 fm i magisk ring, mørkt brunt', 6),
    ('2', 'økn x 6', 12),
    ('3 til 4', '12 fm, 2 omganger', 12),
    ('5', 'bytt til rustoransje, 12 fm', 12),
    ('6 til 11', '12 fm, 6 omganger', 12),
])
add('armer_rows_en', [
    ('1', '6 sc in a magic ring, dark brown', 6),
    ('2', 'inc x 6', 12),
    ('3 to 4', '12 sc, 2 rounds', 12),
    ('5', 'switch to rust orange, 12 sc', 12),
    ('6 to 11', '12 sc, 6 rounds', 12),
])
add('armer_ferdig',
    'Klipp av, la ca. 20 cm tråd igjen. Fyll svakt og løst, armene skal være myke og litt '
    'bøyelige, ikke stive.',
    'Cut the yarn, leaving a tail of approx. 20 cm. Stuff lightly and loosely, the arms should '
    'be soft and a little floppy, not stiff.')

# ---------------------------------------------------------------- SIDE 13: DEL 6 BENA OG POTENE
add('banner_bena', 'DEL 6: BENA OG POTENE (2 STK)', 'PART 6: THE LEGS AND PAWS (MAKE 2)')
add('bena_lead',
    'Samme prinsipp som armene: mørkt brunt nederst, rustoransje resten av veien opp. Hver fot '
    'får i tillegg en liten, sydd potepute i kremhvitt med salviegrønne detaljer.',
    'Same principle as the arms: dark brown at the bottom, rust orange the rest of the way up. '
    'Each foot also gets a little sewn-on paw pad in cream with sage green details.')
add('bena_rows', [
    ('1', '6 fm i magisk ring, mørkt brunt', 6),
    ('2', 'økn x 6', 12),
    ('3', '(1 fm, økn) x 6', 18),
    ('4 til 5', '18 fm, 2 omganger', 18),
    ('6', 'bytt til rustoransje, 18 fm', 18),
    ('7 til 14', '18 fm, 8 omganger', 18),
])
add('bena_rows_en', [
    ('1', '6 sc in a magic ring, dark brown', 6),
    ('2', 'inc x 6', 12),
    ('3', '(1 sc, inc) x 6', 18),
    ('4 to 5', '18 sc, 2 rounds', 18),
    ('6', 'switch to rust orange, 18 sc', 18),
    ('7 to 14', '18 sc, 8 rounds', 18),
])
add('bena_ferdig',
    'Klipp av, la ca. 20 cm tråd igjen. Fyll godt og fast, spesielt nederst, så bena kan bære '
    'kroppen når Felix sitter.',
    'Cut the yarn, leaving a tail of approx. 20 cm. Stuff firmly, especially at the bottom, so '
    'the legs can support the body when Felix is sitting.')
add('pill_poter', 'POTEPUTENE, SYDD PÅ', 'THE PAW PADS, SEWN ON')
add('poter_txt',
    'Hekle en liten flat sirkel i kremhvitt (6 fm i magisk ring, avslutt) for hver fot, og sy '
    'den fast nederst framme på foten, over den mørke brune tuppen. Brodér 4 til 5 små, ovale '
    'sting i salviegrønt oppå puten, som fire små tær.',
    'Crochet a small flat circle in cream (6 sc in a magic ring, fasten off) for each foot, and '
    'sew it onto the front bottom of the foot, over the dark brown tip. Embroider 4 to 5 small, '
    'oval stitches in sage green on top of the pad, like four little toes.')

# ---------------------------------------------------------------- SIDE 14: DEL 7 HALEN
add('banner_hale', 'DEL 7: HALEN', 'PART 7: THE TAIL')
add('hale_lead',
    'Dette er Felix sin signaturdel: en stor, buskete hale i rustoransje som går over i '
    'kremhvitt mot spissen. I motsetning til Pips flate piggfelt hekles halen som en fast, '
    'stoppet form, ikke et flatt felt, så den holder fasongen og kan klemmes på.',
    "This is Felix's signature part: a big, bushy tail in rust orange that fades into cream "
    "towards the tip. Unlike Pip's flat spike panel, the tail is crocheted as a firm, stuffed "
    "shape, not a flat panel, so it holds its form and can be squeezed.")
add('hale_rows', [
    ('1', '6 fm i magisk ring, rustoransje', 6),
    ('2', 'økn x 6', 12),
    ('3', '(1 fm, økn) x 6', 18),
    ('4', '(2 fm, økn) x 6', 24),
    ('5', '(3 fm, økn) x 6', 30),
    ('6 til 14', '30 fm, 9 omganger - fyll litt og litt underveis', 30),
    ('15', 'bytt til kremhvit, (3 fm, mink) x 6', 24),
    ('16', '24 fm', 24),
    ('17', '(2 fm, mink) x 6', 18),
    ('18', '18 fm', 18),
    ('19', '(1 fm, mink) x 6 - fyll godt og fast', 12),
    ('20', 'mink x 6', 6),
])
add('hale_rows_en', [
    ('1', '6 sc in a magic ring, rust orange', 6),
    ('2', 'inc x 6', 12),
    ('3', '(1 sc, inc) x 6', 18),
    ('4', '(2 sc, inc) x 6', 24),
    ('5', '(3 sc, inc) x 6', 30),
    ('6 to 14', '30 sc, 9 rounds - stuff a little at a time as you go', 30),
    ('15', 'switch to cream, (3 sc, dec) x 6', 24),
    ('16', '24 sc', 24),
    ('17', '(2 sc, dec) x 6', 18),
    ('18', '18 sc', 18),
    ('19', '(1 sc, dec) x 6 - stuff firmly', 12),
    ('20', 'dec x 6', 6),
])
add('hale_ferdig',
    'Klipp av, la ca. 25 cm tråd igjen. Fyll godt og jevnt hele veien, halen skal være fast og '
    'buttet, akkurat som en ekte revehale, med en tydelig kremhvit spiss.',
    'Cut, leaving a tail of approx. 25 cm. Stuff firmly and evenly all the way through, the tail '
    'should be firm and plump, just like a real fox tail, with a clear cream tip.')
add('hale_plassering',
    'Sy halen fast nederst på ryggen, litt skrått oppover, rett over der bena sitter. Sy rundt '
    'hele festepunktet med tette sting, slik at den tåler at et lite barn drar i den.',
    'Sew the tail onto the base of the back, angled slightly upward, right above where the legs '
    'sit. Sew all the way around the attachment point with tight stitches, so it can withstand a '
    'small child pulling on it.')

# ---------------------------------------------------------------- SIDE 15: KROPPEN OG HALEN, SETT BAKFRA (diagram)
add('banner_hale_bak', 'KROPPEN OG HALEN, SETT BAKFRA', 'THE BODY AND TAIL, SEEN FROM BEHIND')
add('hale_bak_lead',
    'Denne skissen viser hvor halen skal festes når du ser Felix bakfra: nederst på ryggen, '
    'skrått oppover og litt til siden, aldri rett ut fra midten.',
    "This sketch shows where the tail should be attached when you look at Felix from behind: at "
    "the base of the back, angled upward and slightly to the side, never straight out from the "
    "centre.")

# ---------------------------------------------------------------- SIDE 16: DEL 8 KRAGEN
add('banner_krage', 'DEL 8: KRAGEN', 'PART 8: THE COLLAR')
add('krage_lead',
    'Den salviegrønne volangkragen er felles for hele skogvenn-familien, samme modell hver '
    'gang. Den hekles direkte rundt halsen, der hodet skal møte kroppen. Felix får ingen sløyfe '
    'oppå, kun selve kragen.',
    'The sage green ruffled collar is shared by the whole woodland friends family, the same '
    'model every time. It is crocheted directly around the neck, where the head will meet the '
    'body. Felix gets no bow on top, just the collar itself.')
add('krage_txt',
    'Før du syr hodet fast på kroppen: fest salviegrønn tråd i kroppens øverste kant, der halsen '
    'skal være (18 m). *1 fm i neste maske, hopp over 1 maske, 4 stav i neste maske (en liten '
    'vifte), hopp over 1 maske*, gjenta rundt hele kanten (6 vifter totalt). Fest av og gjem '
    'tråden.',
    'Before sewing the head onto the body: attach sage green yarn at the top edge of the body, '
    'where the neck will be (18 sts). *1 sc in the next stitch, skip 1 stitch, 4 dc in the next '
    'stitch (a little fan), skip 1 stitch*, repeat all the way around the edge (6 fans in '
    'total). Fasten off and weave in the end.')
add('krage_plassering',
    'Kragen skal ligge som en liten volangkant rundt halsen, med hodet syd fast oppå, midt over '
    'kragen, akkurat som på Ellie og Pip.',
    "The collar should sit as a little ruffled edge around the neck, with the head sewn on top, "
    "centred over the collar, just like on Ellie and Pip.")

# ---------------------------------------------------------------- SIDE 17: KRAGEN OG HALEN, SETT FRA SIDEN (diagram)
add('banner_side', 'KRAGEN OG HALEN, SETT FRA SIDEN', 'THE COLLAR AND TAIL, SEEN FROM THE SIDE')
add('side_lead',
    'Denne skissen viser Felix fra siden: hvordan halen kurver oppover fra ryggen, og hvordan '
    'kragen sitter rett under haken, langt framme, foran der halen starter.',
    "This sketch shows Felix from the side: how the tail curves upward from the back, and how "
    "the collar sits right under the chin, far to the front, well ahead of where the tail "
    "starts.")

# ---------------------------------------------------------------- SIDE 18: MONTERING
add('banner_montering', 'MONTERING', 'ASSEMBLY')
add('montering_lead',
    'Nå skal alle delene bli til Felix. Bruk knappenåler til å prøve plasseringen først, så syr '
    'du for godt til slutt. Alt sys fast med tett heftesting eller stikksøm og god, tvinnet '
    'tråd, ingenting limes.',
    'Now all the pieces become Felix. Use safety pins to test the placement first, then sew '
    'everything firmly at the end. Everything is sewn on with tight running stitch or '
    'backstitch and strong, twisted thread, nothing is glued.')
add('montering_steg', [
    'Sy bena fast under kroppen, ca. 1 til 2 cm fra hverandre, så Felix står stødig når han '
    'sitter, og sy på poteputene.',
    'Sy armene fast på hver side av kroppen, litt nedenfor der halsen skal være.',
    'Sy magebeltet fast midt på magen, fra like under der kragen skal være og nedover.',
    'Hekle volangkragen rundt kroppens øverste kant, der halsen skal være.',
    'Sy snuteflekken fast nederst midt på hodet, flatt mot ansiktet, før du setter inn øyne, '
    'nese, munn, vipper og kinn (se side om ansiktet).',
    'Sy hodet fast oppå kroppen, midt over kragen. Sjekk at hodet sitter rett frem før du syr '
    'helt ferdig.',
    'Sy ørene fast høyt på hodet, ett på hver side, spissene pekende litt utover.',
    'Sy halen fast nederst på ryggen, skrått oppover (se side om halens plassering).',
    'Fest alle løse tråder godt på innsiden av delene, og klipp av det som er igjen.',
])
add('montering_steg_en', [
    "Sew the legs onto the bottom of the body, approx. 1 to 2 cm apart, so Felix sits steadily, "
    "and sew on the paw pads.",
    'Sew the arms onto each side of the body, a little below where the neck will be.',
    'Sew the belly patch onto the middle of the belly, from just below where the collar will '
    'be and downward.',
    'Crochet the ruffled collar around the top edge of the body, where the neck will be.',
    'Sew the muzzle patch onto the bottom centre of the head, flat against the face, before '
    'adding the eyes, nose, mouth, lashes and cheeks (see the face page).',
    'Sew the head onto the body, centred over the collar. Check that the head faces forward '
    'before you sew it on completely.',
    'Sew the ears onto the head, high up, one on each side, with the points angled slightly '
    'outward.',
    'Sew the tail onto the base of the back, angled upward (see the page about the placement of '
    'the tail).',
    'Fasten every loose end securely on the inside of the pieces, and trim what is left.',
])

# ---------------------------------------------------------------- SIDE 19: SIKKERHET OG STELL
add('banner_sikkerhet', 'ETTERARBEID, SIKKERHET OG STELL', 'FINISHING, SAFETY AND CARE')
add('pill_etterarbeid', 'HELT TIL SLUTT', 'FINISHING TOUCHES')
add('etterarbeid', [
    'Fest alle løse tråder godt på innsiden av delene: vev dem fram og tilbake gjennom noen '
    'masker med stoppenålen, og klipp av det som er igjen.',
    'Se over alle sømmer, spesielt der halen festes til kroppen, det er stedet som får mest '
    'drahjelp under lek. Er noen masker løse eller har hull, sy over med noen ekstra sting.',
    'Kontroller at snuteflekken, ørene og poteputene sitter helt flatt og godt fast, uten '
    'løse kanter et lite barn kan plukke i.'],
    ['Fasten every loose end securely on the inside of the pieces: weave it back and forth '
     'through a few stitches with the yarn needle, then trim what is left.',
     'Check over every seam, especially where the tail attaches to the body, that is the spot '
     'that gets the most tugging during play. If any stitches are loose or there are gaps, sew '
     'over them with a few extra stitches.',
     'Check that the muzzle patch, the ears and the paw pads sit completely flat and securely, '
     'with no loose edges a small child could pick at.'])
add('pill_sikkerhet', 'SIKKERHET', 'SAFETY')
add('sikkerhet_txt', [
    'Ingen deler limes, alt sys godt fast med tett tråd. Dobbeltsjekk sømmene på øyne, nese, '
    'ører, snuteflekk, armer, ben og spesielt halen, siden det er den tyngste og mest utsatte '
    'delen.',
    'Bruker du sikkerhetsøyne (versjon A), er Felix beregnet for barn fra 3 år, siden smådeler '
    'kan løsne over tid ved hard bruk. For de aller minste, bruk versjon B med broderte øyne i '
    'stedet.',
    'Halen er stoppet fast og tåler klemming, men bør sjekkes jevnlig for å se at festepunktet '
    'til kroppen fortsatt sitter helt sikkert.',
    'Vask alltid gamle sømmer og fest på nytt hvis du ser tegn til slitasje. Kast Felix hvis '
    'fyll begynner å komme ut, eller hvis en del løsner og ikke kan syes trygt fast igjen.'],
    ['No parts are glued, everything is sewn securely with strong thread. Double-check the '
     'seams on the eyes, nose, ears, muzzle patch, arms, legs and especially the tail, since it '
     'is the heaviest and most exposed part.',
     'If you use safety eyes (version A), Felix is intended for children aged 3 and up, since '
     'small parts can loosen over time with heavy use. For the very youngest, use version B '
     'with embroidered eyes instead.',
     'The tail is stuffed firmly and can handle squeezing, but should be checked regularly to '
     'make sure the attachment point to the body is still completely secure.',
     'Always check old seams and re-sew them if you see signs of wear. Retire Felix if stuffing '
     'starts to come out, or if a piece comes loose and cannot be sewn safely back on.'])
add('pill_stell', 'VASK OG STELL', 'WASHING AND CARE')
add('stell_txt',
    'Håndvask i lunkent vann med litt mild såpe, eller vask på 30 grader i vaskepose. Klem '
    'forsiktig ut vannet i et håndkle, ikke vri. Form Felix pent og legg ham til tørk flatt, og '
    'klem halen forsiktig i form mens den er fuktig, slik at den beholder sin buskete fasong.',
    'Hand wash in lukewarm water with a little mild soap, or machine wash at 30 degrees in a '
    'wash bag. Gently press out the water in a towel, do not wring. Reshape Felix neatly and '
    'lay him flat to dry, gently squeezing the tail back into shape while it is still damp, so '
    'it keeps its bushy form.')

# ---------------------------------------------------------------- SIDE 20: FERDIG
add('banner_ferdig', 'GRATULERER, FELIX ER FERDIG!', 'CONGRATULATIONS, FELIX IS DONE!')
add('ferdig_txt',
    'Nå har du heklet din helt egen Felix, den lille reven. Vis ham gjerne fram i '
    '#lmebabycollection, jeg elsker å se hva dere skaper!',
    "Now you have crocheted your very own Felix, the little fox. Feel free to show him off in "
    "#lmebabycollection, I love seeing what you make!")
add('pill_kolleksjon', 'RESTEN AV LME BABY COLLECTION', 'THE REST OF THE LME BABY COLLECTION')
add('kolleksjon_lead',
    'Felix er den tredje figuren i "Woodland Dreams", i samme uttrykk, garnvalg og fargepalett '
    'som resten av kolleksjonen:',
    'Felix is the third figure in "Woodland Dreams", in the same look, yarn choice and colour '
    'palette as the rest of the collection:')
add('kolleksjon_liste',
    ['Ellie, det lille dådyret', 'Pip, det lille pinnsvinet', 'Molly, det lille lammet',
     'Luna, den lille kaninen', 'Oliver, den lille bjørnen', 'Ellies smokkelenke',
     'Pips smokkelenke', "Felix' smokkelenke", 'Mollys smokkelenke', 'Lunas smokkelenke',
     'Olivers smokkelenke', 'Ellies rangle', 'Pips rangle', "Felix' rangle", 'Mollys rangle',
     'Lunas rangle', 'Olivers rangle', 'Ellies vognlenke', 'Pips vognlenke',
     "Felix' vognlenke", 'Mollys vognlenke', 'Lunas vognlenke', 'Olivers vognlenke',
     'Ellies ballerinasko', 'Ellies aktivitetsleke'],
    ['Ellie, the little fawn', 'Pip, the little hedgehog', 'Molly, the little lamb',
     'Luna, the little bunny', 'Oliver, the little bear', "Ellie's pacifier clip",
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
        'ears': {'no': '1. ørene', 'en': '1. ears'},
        'tail': {'no': '2. halen', 'en': '2. tail'},
        'snout': {'no': '3. snuten', 'en': '3. muzzle'},
        'collar': {'no': '4. kragen', 'en': '4. collar'},
        'arms': {'no': '5. armene', 'en': '5. arms'},
        'legs': {'no': '6. bena', 'en': '6. legs'},
    }
    def t(k): return txt[k][lang]
    return f'''
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 520 380" style="width:100%">
  <line x1="60" y1="30" x2="60" y2="330" stroke="#8a8a8a" stroke-width="2"/>
  <text x="40" y="180" text-anchor="middle" font-size="14" font-family="sans-serif" fill="#666" transform="rotate(-90 40 180)">{t('height')}</text>
  <path d="M330,270 Q400,250 420,200 Q432,165 415,140 Q440,155 445,190 Q450,235 420,275 Q390,300 340,290 Z"
        fill="{RUST}" stroke="{RUST_DARK}" stroke-width="2"/>
  <ellipse cx="418" cy="150" rx="16" ry="22" fill="{CREAM}" stroke="{BROWN_MID}" stroke-width="1.5" transform="rotate(25 418 150)"/>
  <ellipse cx="260" cy="235" rx="52" ry="58" fill="{RUST}" stroke="{RUST_DARK}" stroke-width="2"/>
  <ellipse cx="260" cy="248" rx="30" ry="38" fill="{CREAM}" stroke="#e3d2b8" stroke-width="1.5"/>
  <ellipse cx="200" cy="220" rx="14" ry="32" fill="{RUST}" stroke="{RUST_DARK}" stroke-width="2" transform="rotate(-16 200 220)"/>
  <ellipse cx="320" cy="220" rx="14" ry="32" fill="{RUST}" stroke="{RUST_DARK}" stroke-width="2" transform="rotate(16 320 220)"/>
  <ellipse cx="192" cy="246" rx="10" ry="12" fill="{BROWN_DARK}" transform="rotate(-16 192 246)"/>
  <ellipse cx="328" cy="246" rx="10" ry="12" fill="{BROWN_DARK}" transform="rotate(16 328 246)"/>
  <ellipse cx="232" cy="308" rx="19" ry="21" fill="{RUST}" stroke="{RUST_DARK}" stroke-width="2"/>
  <ellipse cx="288" cy="308" rx="19" ry="21" fill="{RUST}" stroke="{RUST_DARK}" stroke-width="2"/>
  <ellipse cx="232" cy="322" rx="13" ry="9" fill="{BROWN_DARK}"/>
  <ellipse cx="288" cy="322" rx="13" ry="9" fill="{BROWN_DARK}"/>
  <path d="M210,176 Q260,192 310,176" fill="none" stroke="{SAGE}" stroke-width="11" stroke-linecap="round"/>
  <circle cx="260" cy="100" r="46" fill="{RUST}" stroke="{RUST_DARK}" stroke-width="2"/>
  <path d="M222,66 Q214,32 232,20 Q248,34 244,64 Z" fill="{RUST}" stroke="{RUST_DARK}" stroke-width="2"/>
  <path d="M225,60 Q220,36 232,28 Q242,38 240,58 Z" fill="{CREAM}"/>
  <path d="M298,66 Q306,32 288,20 Q272,34 276,64 Z" fill="{RUST}" stroke="{RUST_DARK}" stroke-width="2"/>
  <path d="M295,60 Q300,36 288,28 Q278,38 280,58 Z" fill="{CREAM}"/>
  <ellipse cx="260" cy="118" rx="26" ry="21" fill="{CREAM}" stroke="#e3d2b8" stroke-width="1.5"/>
  <circle cx="244" cy="98" r="4.5" fill="#3a2a1e"/>
  <circle cx="276" cy="98" r="4.5" fill="#3a2a1e"/>
  <ellipse cx="260" cy="118" rx="6" ry="4.5" fill="{BROWN_DARK}"/>
  <line x1="120" y1="30" x2="400" y2="30" stroke="#8a8a8a" stroke-width="2"/>
  <text x="260" y="20" text-anchor="middle" font-size="14" font-family="sans-serif" fill="#666">{t('width')}</text>
  <text x="452" y="52" font-size="13" font-family="sans-serif" fill="#555">{t('ears')}</text>
  <line x1="448" y1="48" x2="280" y2="25" stroke="#bbb" stroke-width="1.5"/>
  <text x="452" y="75" font-size="13" font-family="sans-serif" fill="#555">{t('tail')}</text>
  <line x1="448" y1="71" x2="415" y2="145" stroke="#bbb" stroke-width="1.5"/>
  <text x="452" y="132" font-size="13" font-family="sans-serif" fill="#555">{t('snout')}</text>
  <line x1="448" y1="128" x2="270" y2="118" stroke="#bbb" stroke-width="1.5"/>
  <text x="452" y="182" font-size="13" font-family="sans-serif" fill="#555">{t('collar')}</text>
  <line x1="448" y1="178" x2="300" y2="180" stroke="#bbb" stroke-width="1.5"/>
  <text x="452" y="220" font-size="13" font-family="sans-serif" fill="#555">{t('arms')}</text>
  <line x1="448" y1="216" x2="330" y2="220" stroke="#bbb" stroke-width="1.5"/>
  <text x="452" y="310" font-size="13" font-family="sans-serif" fill="#555">{t('legs')}</text>
  <line x1="448" y1="306" x2="303" y2="308" stroke="#bbb" stroke-width="1.5"/>
</svg>'''

def face_diagram(lang):
    cap = {'no': 'stiplet = snuteflekken og øyeplassering',
           'en': 'dashed = muzzle patch and eye placement'}
    return f'''
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 280" style="width:78mm">
  <circle cx="150" cy="150" r="105" fill="{RUST}" stroke="{RUST_DARK}" stroke-width="2.5"/>
  <path d="M95,90 Q80,30 115,10 Q150,32 143,88 Z" fill="{RUST}" stroke="{RUST_DARK}" stroke-width="2"/>
  <path d="M101,80 Q92,38 115,24 Q136,40 132,76 Z" fill="{CREAM}"/>
  <path d="M205,90 Q220,30 185,10 Q150,32 157,88 Z" fill="{RUST}" stroke="{RUST_DARK}" stroke-width="2"/>
  <path d="M199,80 Q208,38 185,24 Q164,40 168,76 Z" fill="{CREAM}"/>
  <ellipse cx="150" cy="188" rx="62" ry="52" fill="{CREAM}" stroke="#e3d2b8" stroke-width="1.5" stroke-dasharray="4 4"/>
  <ellipse cx="103" cy="128" r="15" fill="#fff" stroke="{BROWN_DARK}" stroke-width="2" stroke-dasharray="3 3"/>
  <ellipse cx="197" cy="128" r="15" fill="#fff" stroke="{BROWN_DARK}" stroke-width="2" stroke-dasharray="3 3"/>
  <circle cx="103" cy="128" r="8" fill="#241a12"/>
  <circle cx="197" cy="128" r="8" fill="#241a12"/>
  <circle cx="106" cy="125" r="2.4" fill="#fff"/>
  <circle cx="200" cy="125" r="2.4" fill="#fff"/>
  <path d="M85,110 Q95,102 112,108" stroke="#241a12" stroke-width="2.4" fill="none" stroke-linecap="round"/>
  <path d="M215,110 Q205,102 188,108" stroke="#241a12" stroke-width="2.4" fill="none" stroke-linecap="round"/>
  <ellipse cx="150" cy="186" rx="13" ry="9" fill="{BROWN_DARK}"/>
  <path d="M150,195 Q140,208 128,204 M150,195 Q160,208 172,204" stroke="#241a12" stroke-width="2.2" fill="none" stroke-linecap="round"/>
  <circle cx="108" cy="168" r="9" fill="{ROSE}" opacity="0.55"/>
  <circle cx="192" cy="168" r="9" fill="{ROSE}" opacity="0.55"/>
  <text x="150" y="270" text-anchor="middle" font-size="12" font-family="sans-serif" fill="#888">{cap[lang]}</text>
</svg>'''

def back_diagram(lang):
    cap = {'no': 'kroppen og halen, sett bakfra', 'en': 'the body and tail, seen from behind'}
    return f'''
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 340" style="width:70mm">
  <ellipse cx="150" cy="150" rx="95" ry="105" fill="{RUST}" stroke="{RUST_DARK}" stroke-width="2.5"/>
  <ellipse cx="95" cy="105" rx="11" ry="15" fill="{RUST}" stroke="{RUST_DARK}" stroke-width="2" transform="rotate(-20 95 105)"/>
  <ellipse cx="205" cy="105" rx="11" ry="15" fill="{RUST}" stroke="{RUST_DARK}" stroke-width="2" transform="rotate(20 205 105)"/>
  <path d="M150,225 Q175,215 185,235 Q220,260 222,210 Q224,160 200,140 Q225,150 235,190 Q245,235 215,275
           Q190,300 155,285 Q135,275 140,250 Z"
        fill="{RUST}" stroke="{RUST_DARK}" stroke-width="2"/>
  <path d="M200,140 Q225,150 235,190 Q245,235 215,275 Q205,283 192,285 Q210,255 205,215 Q200,175 185,150 Z"
        fill="{CREAM}" opacity="0.9"/>
  <text x="150" y="320" text-anchor="middle" font-size="13" font-family="sans-serif" fill="#888">{cap[lang]}</text>
</svg>'''

def side_diagram(lang):
    cap = {'no': 'kragen og halen, sett fra siden', 'en': 'the collar and tail, seen from the side'}
    return f'''
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 340" style="width:70mm">
  <ellipse cx="175" cy="245" rx="82" ry="78" fill="{RUST}" stroke="{RUST_DARK}" stroke-width="2.5"/>
  <ellipse cx="175" cy="252" rx="46" ry="55" fill="{CREAM}" stroke="#e3d2b8" stroke-width="1.5"/>
  <path d="M235,300 Q290,280 305,225 Q315,185 295,155 Q325,168 332,215 Q338,270 300,308 Q265,330 225,315 Z"
        fill="{RUST}" stroke="{RUST_DARK}" stroke-width="2"/>
  <path d="M295,155 Q325,168 332,215 Q338,270 300,308 Q288,318 272,318 Q298,282 292,232 Q286,185 268,158 Z"
        fill="{CREAM}" opacity="0.9"/>
  <ellipse cx="120" cy="255" rx="20" ry="30" fill="{RUST}" stroke="{RUST_DARK}" stroke-width="2" transform="rotate(-15 120 255)"/>
  <circle cx="118" cy="122" r="64" fill="{RUST}" stroke="{RUST_DARK}" stroke-width="2.5"/>
  <ellipse cx="72" cy="130" rx="26" ry="20" fill="{CREAM}" stroke="#e3d2b8" stroke-width="1.5"/>
  <ellipse cx="48" cy="130" rx="7" ry="6" fill="{BROWN_DARK}"/>
  <circle cx="80" cy="112" r="6" fill="#241a12"/>
  <path d="M60,140 Q70,148 82,142" stroke="#241a12" stroke-width="2" fill="none" stroke-linecap="round"/>
  <path d="M92,66 Q84,32 108,18 Q128,34 122,64 Z" fill="{RUST}" stroke="{RUST_DARK}" stroke-width="2"/>
  <path d="M97,58 Q92,38 108,28 Q120,40 116,56 Z" fill="{CREAM}"/>
  <ellipse cx="150" cy="178" rx="30" ry="14" fill="{SAGE}" stroke="#6d8560" stroke-width="1.5" transform="rotate(-18 150 178)"/>
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
<div class="coverimg"><img src="{hero_src}" alt="Felix, den lille reven, stiluttrykk-referanse"></div>
<p class="small center" style="margin-top:-2mm;">{'Bildet viser stiluttrykk-referansen for Felix, ikke det ferdige heklede produktet.' if lang == 'no' else 'Photo shows the style reference for Felix, not the finished crocheted product.'}</p>
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
{sagep('SLIK ER FELIX BYGGET OPP' if lang == 'no' else 'HOW FELIX IS BUILT')}
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

    snuten_rows = T['snuten_rows']['no'] if lang == 'no' else T['snuten_rows_en']['no']
    pages.append(pg(f'''
{banner(t('banner_snute'))}
<p>{t('snute_lead')}</p>
{card(otab(snuten_rows, head3[lang]))}
{cme(t('snuten_ferdig'))}
''', 8))

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
{rosep(t('pill_magebelte'))}
{card('<p>' + t('magebelte_txt') + '</p>')}
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

    hale_rows = T['hale_rows']['no'] if lang == 'no' else T['hale_rows_en']['no']
    pages.append(pg(f'''
{banner(t('banner_hale'))}
<p>{t('hale_lead')}</p>
{card(otab(hale_rows, head3[lang]))}
{cme(t('hale_ferdig'))}
''', 14))

    pages.append(pg(f'''
{card('<p>' + t('hale_plassering') + '</p>')}
{banner(t('banner_hale_bak'))}
<p>{t('hale_bak_lead')}</p>
<div class="schematic" style="text-align:center;">{back_diagram(lang)}</div>
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
''', 20))

    return pages

for lang in ('no', 'en'):
    html_doc = kit.doc(lang, T['doctitle'][lang], None, build(lang))
    out = BASE / f'felix_{lang}.html'
    out.write_text(html_doc, encoding='utf-8')
    print('OK', lang, len(html_doc), 'tegn/chars')
