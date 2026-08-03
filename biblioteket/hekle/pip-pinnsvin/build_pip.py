# -*- coding: utf-8 -*-
"""Genererer LME-hekleoppskrift 'Pip, det lille pinnsvinet' (norsk + engelsk) som HTML,
klar for PDF-print med Chromium. Del av LME Baby Collection 'Woodland Dreams',
Ellies andre skogvenn."""
import base64, pathlib, sys

BASE = pathlib.Path(__file__).parent
sys.path.insert(0, str(BASE.parent / '_shared'))
import lme_pattern_kit as kit
from lme_pattern_kit import (banner, rosep, sagep, card, cream, cme, ul, steps, otab, abbrtab,
                              photo_row, qr_placeholder, BROWN, BROWN_MID, BROWN_DARK, CREAM,
                              CREAM_DEEP, ROSE, SAGE, INK)

HERO = BASE / 'pip_hero.png'
FACE = BASE / 'pip_face.png'
hero_src = f'data:image/png;base64,{base64.b64encode(HERO.read_bytes()).decode()}'
face_src = f'data:image/png;base64,{base64.b64encode(FACE.read_bytes()).decode()}'

PIGG = '#6B4226'  # morkt varmt brunt til piggene

T = {}
def add(key, no, en=None):
    T[key] = {'no': no, 'en': en if en is not None else no}

head3 = {'no': ['Omg', 'Beskrivelse', 'Masker'], 'en': ['Rnd', 'Description', 'Sts']}
rowhead = {'no': ['Rad', 'Beskrivelse', 'Masker'], 'en': ['Row', 'Description', 'Sts']}

# ---------------------------------------------------------------- SIDE 1: FORSIDE
add('doctitle', 'Pip, det lille pinnsvinet, LME hekleoppskrift', 'Pip, the Little Hedgehog, LME crochet pattern')
add('ph2', 'LME HEKLEOPPSKRIFT&nbsp;&nbsp;|&nbsp;&nbsp;PIP, DET LILLE PINNSVINET',
    "LME CROCHET PATTERN&nbsp;&nbsp;|&nbsp;&nbsp;PIP, THE LITTLE HEDGEHOG")
add('covertag', 'LME HEKLEOPPSKRIFT - AMIGURUMI', 'LME CROCHET PATTERN - AMIGURUMI')
add('covertitle', 'PIP', 'PIP')
add('subpill', 'LME BABY COLLECTION - WOODLAND DREAMS', 'LME BABY COLLECTION - WOODLAND DREAMS')
add('cover_desc',
    'Pip er et lite, nysgjerrig pinnsvin med en spiss liten snute, myke pigger som ikke stikker, '
    'og en salviegrønn volangkrage, akkurat som Ellie. Heklet i de samme varme naturfargene som '
    'resten av kolleksjonen. Et helt originalt LME-design, ferdig ca. 22 til 24 cm sittende. '
    'Middels vanskelighetsgrad.',
    'Pip is a curious little hedgehog with a small pointed snout, soft spikes that never poke, '
    'and a sage green ruffled collar, just like Ellie. Crocheted in the same warm natural '
    'colours as the rest of the collection. A fully original LME design, finished size approx. '
    '22 to 24 cm sitting. Medium difficulty.')
add('by1', 'Av Renate Dahl', 'By Renate Dahl')
add('by2', 'Little Montessori Explorers', 'Little Montessori Explorers')
add('by3', 'lmexplorers.com', 'lmexplorers.com')
add('cover_tip',
    'TIPS: Les hele oppskriften én gang før du begynner, spesielt siden om piggene, som bruker '
    'en teknikk du kanskje ikke har prøvd før.',
    "TIP: Read through the whole pattern once before you start, especially the page about the "
    "spikes, which uses a technique you may not have tried before.")

# ---------------------------------------------------------------- SIDE 2: OM PIP
add('banner_om', 'OM PIP', 'ABOUT PIP')
add('pill_historien', 'DEL AV ELLIES VERDEN', "PART OF ELLIE'S WORLD")
add('om_historien',
    'Pip er den andre figuren i LME Baby Collection "Woodland Dreams", Ellies aller beste venn i '
    'skogen. Der Ellie er nysgjerrig og lett på foten, er Pip den rolige, nysgjerrige typen som '
    'snuser seg fram til de beste blomsterengene og alltid finner den mykeste mosen å sitte på. '
    'Flere skogvenner er på vei inn i kolleksjonen etter hvert.',
    'Pip is the second figure in the LME Baby Collection "Woodland Dreams", Ellie\'s very best '
    'friend in the forest. Where Ellie is curious and quick on her feet, Pip is the calm, '
    'curious type who noses his way to the best flower meadows and always finds the softest '
    'moss to sit on. More woodland friends are on their way into the collection over time.')
add('pill_stil', 'STIL', 'STYLE')
add('om_stil',
    'Samme premium amigurumi-uttrykk som Ellie: store former, myke overganger, rolige '
    'fargeskift og et vennlig, avrundet blikk. Pip er IKKE spiky eller skummel, IKKE realistisk, '
    'og piggene er heklet myke, ikke stive, slik at han er trygg og god å klemme.',
    'The same premium amigurumi look as Ellie: big shapes, soft transitions, calm colour '
    'changes and a friendly, rounded gaze. Pip is NOT spiky or scary, NOT realistic, and the '
    'spikes are crocheted soft, not stiff, so he is safe and nice to cuddle.')
add('pill_montessori', 'MONTESSORI-INSPIRERT', 'MONTESSORI-INSPIRED')
add('om_montessori',
    'Store, enkle former og rolige fargeblokker gjør Pip fin å kjenne på og lett å gjenkjenne '
    'for de minste, akkurat den typen konkrete, sanselige lek Montessori-filosofien bygger på.',
    'Big, simple shapes and calm blocks of colour make Pip nice to feel and easy for little ones '
    'to recognise, exactly the kind of concrete, sensory play the Montessori philosophy is '
    'built on.')

# ---------------------------------------------------------------- SIDE 3: STØRRELSE OG MATERIALER
add('banner_mat', 'STØRRELSE OG MATERIALER', 'SIZE AND MATERIALS')
add('pill_storrelse', 'FERDIG STØRRELSE', 'FINISHED SIZE')
add('storrelse_txt', 'Ca. 22 til 24 cm høy, sittende.', 'Approx. 22 to 24 cm tall, sitting.')
add('pill_garn', 'GARN', 'YARN')
add('garn_lead',
    'Bystrikk Merino gir en myk, tett amigurumi-overflate som egner seg godt til de myke '
    'piggene.',
    'Bystrikk Merino gives a soft, firm amigurumi surface that works well for the soft spikes.')
add('garn_tabell_head', ['Farge', 'Til', 'Mengde'], ['Colour', 'For', 'Amount'])
add('garn_rows', [
    ('Bystrikk Merino, kremhvit (hovedfarge)', 'hode, snute, ører (innside), kropp, armer, ben',
     'ca. 2 nøster',
     'Bystrikk Merino, cream (main colour)', 'head, snout, ears (inside), body, arms, legs',
     'approx. 2 skeins'),
    ('Bystrikk Merino, mørkt varmt brunt', 'piggfeltet og ørenes utside', 'ca. 1,5 nøste',
     'Bystrikk Merino, dark warm brown', 'the spike panel and the outside of the ears',
     'approx. 1.5 skeins'),
    ('Bystrikk Merino, salviegrønt', 'volangkragen', 'litt',
     'Bystrikk Merino, sage green', 'the ruffled collar', 'small amount'),
    ('Rest, pudderrosa', 'kinnene', 'litt',
     'Leftover, powder pink', 'the cheeks', 'small amount'),
    ('Svart broderigarn', 'nese, munn, vipper og potepute-detaljer', 'litt',
     'Black embroidery thread', 'nose, mouth, lashes and paw pad details', 'small amount'),
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
    ('En linjal eller to fingre', 'som hjelp til å måle løkkene i piggfeltet, se side om piggene'),
    ('Nål og tvinnet bomullstråd', 'til å sy på ører, snute og krage'),
    ('Målebånd og saks', ''),
])

# ---------------------------------------------------------------- SIDE 4: FASTHET OG ORDLISTE
add('banner_fasthet', 'HEKLEFASTHET OG ORDLISTE', 'GAUGE AND GLOSSARY')
add('pill_fasthet', 'HEKLEFASTHET', 'GAUGE')
add('fasthet_txt',
    'Ca. 16 fm x 18 omganger = 10 x 10 cm, heklet STRAMT (amigurumi-fasthet) på nål 4 mm. '
    'Hekler du løsere enn dette, synes fyllet gjennom maskene og Pip blir myk og ustødig i '
    'stedet for fin og fast.',
    'Approx. 16 sc x 18 rounds = 10 x 10 cm, crocheted TIGHTLY (amigurumi tension) on a 4 mm '
    'hook. If you crochet looser than this, the stuffing shows through the stitches and Pip '
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
     'utsiden av arbeidet, se side om piggene.',
     'loop st', 'loop stitch: insert the hook, wrap the yarn around two fingers or a ruler to '
     'form a loop, pull the loop through and finish as a normal sc. The loop is left standing '
     'out on the right side of the work, see the page about the spikes.'),
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
    'Hodet, snuten, kroppen, armene og bena hekles i spiral med fastmasker, uten å avslutte '
    'omgangene. Piggfeltet og kragen hekles frem og tilbake i rader. Sett gjerne en '
    'maskemarkør i første maske på hver spiraldel.',
    'The head, snout, body, arms and legs are crocheted in a spiral of single crochet, without '
    'joining the rounds. The spike panel and the collar are crocheted back and forth in rows. '
    'Place a stitch marker in the first stitch of each spiral piece.')

# ---------------------------------------------------------------- SIDE 5: TIPS OG OVERSIKT
add('banner_oversikt', 'TIPS OG SLIK ER PIP BYGGET OPP', "TIPS AND HOW PIP IS BUILT")
add('pill_tips', 'TIPS FØR DU BEGYNNER', 'TIPS BEFORE YOU START')
add('tips',
    ['Hekle en liten prøvelapp med løkkemasker før du starter piggfeltet, så du finner en løkke-'
     'lengde du liker.',
     'Legg alle delene ved siden av hverandre før du syr noe fast, så du ser at Pip blir '
     'symmetrisk.',
     'Fyll litt og litt underveis i stedet for helt til slutt, det gir en jevnere, penere form.'],
    ['Crochet a small swatch with loop stitches before starting the spike panel, so you find a '
     'loop length you like.',
     'Lay all the pieces out next to each other before sewing anything on, so you can see that '
     'Pip turns out symmetrical.',
     'Stuff a little at a time as you go, rather than all at once at the end, it gives a more '
     'even, neater shape.'])
add('oversikt_lead',
    'Pip hekles i åtte deler, som sys sammen helt til slutt. Ingen deler limes, og alt sys godt '
    'fast slik at ingenting løsner. Gjør deg kjent med delene før du begynner:',
    'Pip is crocheted in eight pieces, which are all sewn together at the very end. No pieces '
    'are glued, and everything is sewn securely so that nothing comes loose. Get to know the '
    'pieces before you begin:')
add('oversikt_deler', [
    ('1. Hodet', 'stort og rundt, kremhvitt', '1. The head', 'big and round, cream'),
    ('2. Snuten', 'liten, spiss, stikker fram fra hodet', '2. The snout', 'small, pointed, projects out from the head'),
    ('3. Ørene (x2)', 'små og runde, med lys innside', '3. The ears (x2)', 'small and round, with a light inside'),
    ('4. Kroppen', 'liten og rund, kremhvit', '4. The body', 'small and round, cream'),
    ('5. Armene (x2)', 'små og myke, korte', '5. The arms (x2)', 'small and soft, short'),
    ('6. Bena (x2)', 'runde, med broderte poteputer', '6. The legs (x2)', 'round, with embroidered paw pads'),
    ('7. Piggfeltet', 'ett langt felt i løkkemasker, mørkt brunt', '7. The spike panel', 'one long panel in loop stitch, dark brown'),
    ('8. Kragen', 'salviegrønn volangkrage', '8. The collar', 'a sage green ruffled collar'),
])
add('schematic_caption',
    'Målskisse: Pip sittende, ca. 22 til 24 cm høy og ca. 14 cm bred over armene.',
    'Size sketch: Pip sitting, approx. 22 to 24 cm tall and approx. 14 cm wide across the arms.')

# ---------------------------------------------------------------- SIDE 6: KROPPENS PROPORSJONER (diagram)
add('banner_proporsjoner', 'KROPPENS PROPORSJONER', 'BODY PROPORTIONS')
add('proporsjoner_lead',
    'Bruk denne skissen som en rettesnor mens du hekler, spesielt for å se hvor stort snuten og '
    'piggfeltet skal være i forhold til resten av kroppen.',
    "Use this sketch as a guide while you crochet, especially to see how big the snout and the "
    "spike panel should be compared to the rest of the body.")

# ---------------------------------------------------------------- SIDE 7: DEL 1 HODET
add('banner_hode', 'DEL 1: HODET', 'PART 1: THE HEAD')
add('hode_lead',
    'Hodet hekles i spiral, ovenfra og ned, i kremhvitt. Det starter smalt, øker ut til bredest '
    'midt på, står rett en stund, og minker så ned igjen mot halsen.',
    'The head is crocheted in a spiral, from the top down, in cream. It starts narrow, '
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
    ('9', '(7 fm, økn) x 6', 54),
    ('10 til 17', '54 fm, 8 omganger uten økning', 54),
    ('18', '(7 fm, mink) x 6', 48),
    ('19', '48 fm', 48),
    ('20', '(6 fm, mink) x 6', 42),
    ('21', '(5 fm, mink) x 6 - begynn å fylle godt og jevnt herfra', 36),
    ('22', '(4 fm, mink) x 6', 30),
    ('23', '(3 fm, mink) x 6', 24),
    ('24', '(2 fm, mink) x 6', 18),
    ('25', '(1 fm, mink) x 6 - fyll siste rest', 12),
    ('26', 'mink x 6', 6),
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
    ('9', '(7 sc, inc) x 6', 54),
    ('10 to 17', '54 sc, 8 rounds with no increases', 54),
    ('18', '(7 sc, dec) x 6', 48),
    ('19', '48 sc', 48),
    ('20', '(6 sc, dec) x 6', 42),
    ('21', '(5 sc, dec) x 6 - start stuffing firmly and evenly from here', 36),
    ('22', '(4 sc, dec) x 6', 30),
    ('23', '(3 sc, dec) x 6', 24),
    ('24', '(2 sc, dec) x 6', 18),
    ('25', '(1 sc, dec) x 6 - stuff the last bit', 12),
    ('26', 'dec x 6', 6),
])
add('hode_ferdig',
    'Ikke klipp av trådenden. Trekk den forsiktig sammen gjennom de siste 6 maskene og bruk den '
    'samme trådenden til å feste hodet på kroppen senere. Hodet skal nå være fast og rundt, ca. '
    '10 cm i diameter.',
    'Do not cut the yarn. Gently gather it through the last 6 stitches and use that same yarn '
    'tail to attach the head to the body later. The head should now be firm and round, approx. '
    '10 cm in diameter.')

# ---------------------------------------------------------------- SIDE 8: DEL 2 SNUTEN
add('banner_snute', 'DEL 2: SNUTEN', 'PART 2: THE SNOUT')
add('snute_lead',
    'I motsetning til Ellies flate ansiktsfelt er Pips snute en liten, avlang del som stikker '
    'litt fram fra hodet, akkurat som et ekte pinnsvin. Hekles i kremhvitt.',
    "Unlike Ellie's flat face patch, Pip's snout is a small, oblong piece that projects a "
    "little out from the head, just like a real hedgehog. Crocheted in cream.")
add('snuten_rows', [
    ('1', '6 fm i magisk ring', 6),
    ('2', 'økn x 6', 12),
    ('3', '(1 fm, økn) x 6', 18),
    ('4 til 6', '18 fm, 3 omganger', 18),
    ('7', '(1 fm, mink) x 6', 12),
    ('8', 'mink x 6', 6),
])
add('snuten_rows_en', [
    ('1', '6 sc in a magic ring', 6),
    ('2', 'inc x 6', 12),
    ('3', '(1 sc, inc) x 6', 18),
    ('4 to 6', '18 sc, 3 rounds', 18),
    ('7', '(1 sc, dec) x 6', 12),
    ('8', 'dec x 6', 6),
])
add('snuten_ferdig',
    'Klipp av, la ca. 20 cm tråd igjen. Fyll lett og jevnt, snuten skal være myk, men holde '
    'formen sin. Sy den godt fast nederst midt på hodet, litt fremoverstikkende, ikke flat, se '
    'side om ansiktet for nøyaktig plassering.',
    'Cut, leaving a tail of approx. 20 cm. Stuff lightly and evenly, the snout should be soft '
    'but hold its shape. Sew it on securely at the bottom centre of the head, projecting '
    'slightly forward, not flat, see the face page for exact placement.')

# ---------------------------------------------------------------- SIDE 9: DEL 3 ØRENE
add('banner_orer', 'DEL 3: ØRENE (2 STK)', 'PART 3: THE EARS (MAKE 2)')
add('orer_lead',
    'Hvert øre hekles i to lag: en liten sirkel i mørkt brunt (utsiden) og en enda mindre sirkel '
    'i kremhvitt (innsiden), som sys sammen. Hekle to av hver.',
    'Each ear is crocheted in two layers: a small circle in dark brown (the outside) and an '
    'even smaller circle in cream (the inside), which are sewn together. Crochet two of each.')
add('pill_ore_ute', 'YTTERSIDEN (MØRKT BRUNT) - HEKLE 2', 'THE OUTSIDE (DARK BROWN) - MAKE 2')
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
    'den kremhvite sirkelen midt oppå den mørke brune og sy den fast med heftesting, så det '
    'står en jevn mørk kant rundt. Brett hvert øre lett sammen forfra og bakover, en liten fold '
    'nederst, før du syr det fast.',
    'Cut both pieces, leaving a tail of approx. 20 cm. Do not stuff the ears, they should be '
    'flat. Place the cream circle in the middle of the dark brown one and sew it on with '
    'running stitch, leaving an even dark rim showing. Fold each ear gently front to back, a '
    'small pinch at the bottom, before sewing it on.')
add('orer_plassering',
    'Sy ørene høyt på hodet, ett på hver side, rett ved kanten der piggfeltet møter det '
    'kremhvite ansiktet, se side om ansiktet for nøyaktig plassering.',
    "Sew the ears on high up on the head, one on each side, right at the edge where the spike "
    "panel meets the cream face, see the face page for exact placement.")

# ---------------------------------------------------------------- SIDE 10: ANSIKTET (diagram)
add('banner_ansikt', 'ANSIKTET', 'THE FACE')
add('ansikt_lead',
    'Ansiktet er det som gir Pip liv. Ta deg god tid her, og prøv gjerne med knappenåler først '
    'før du syr eller fester noe fast.',
    "The face is what brings Pip to life. Take your time here, and try pinning things in place "
    "with safety pins before you sew or fasten anything.")
add('pill_ojne', 'ØYNE, TO VERSJONER', 'EYES, TWO VERSIONS')
add('ojne_a_tit', 'Versjon A: sikkerhetsøyne (fra 3 år)', 'Version A: safety eyes (age 3+)')
add('ojne_a',
    'Bruk 16 mm sikkerhetsøyne. Sett dem inn ca. 2,2 cm fra hverandre, høyt i pannen, rett over '
    'der snuten skal festes. Skyv baksiden godt på plass FØR du fyller hodet ferdig, så det '
    'ikke er mulig å trekke øyet ut igjen fra innsiden.',
    'Use 16 mm safety eyes. Insert them approx. 2.2 cm apart, high on the forehead, right above '
    'where the snout will be attached. Push the backing washer firmly into place BEFORE you '
    'finish stuffing the head, so the eye cannot be pulled back out from the inside.')
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
    ('Nese', 'Brodér en liten mørk brun oval nese på tuppen av snuten, i tett satengsting.'),
    ('Munn', 'Fra bunnen av nesen, brodér et lite smil nedover og ut til hver side i '
     'stikksøm med svart tråd.'),
    ('Vipper', 'Brodér 2 til 3 korte, buede sting med svart tråd over ytre hjørne av hvert øye, '
     'for det myke, drømmende blikket.'),
    ('Kinn', 'Hekle to små flate sirkler i pudderrosa (6 fm i magisk ring, avslutt), og sy dem '
     'lett fast på kinnene under hvert øye, litt ut mot siden av snuten.'),
], [
    ('Nose', "Embroider a small dark brown oval nose on the tip of the snout, in dense satin "
     "stitch."),
    ('Mouth', 'From the base of the nose, embroider a small smile downward and out to each '
     'side in backstitch, using black thread.'),
    ('Lashes', "Embroider 2 to 3 short, curved stitches with black thread above the outer "
     "corner of each eye, for the soft, dreamy look."),
    ('Cheeks', 'Crochet two small flat circles in powder pink (6 sc in a magic ring, fasten '
     'off), and sew them lightly onto the cheeks below each eye, slightly out towards the side '
     'of the snout.'),
])
add('ansikt_bilde_caption',
    'Slik kan det ferdige ansiktet se ut: sikkerhetsøyne, brodert nese og munn, vipper og rosa '
    'kinn, med snuten stikkende mykt fram.',
    'This is roughly how the finished face can look: safety eyes, embroidered nose and mouth, '
    'lashes and pink cheeks, with the snout softly projecting forward.')

# ---------------------------------------------------------------- SIDE 11: DEL 4 KROPPEN
add('banner_kropp', 'DEL 4: KROPPEN', 'PART 4: THE BODY')
add('kropp_lead',
    'Kroppen er liten og rund, akkurat stor nok til at Pip kan sitte stødig. Hekles helt i '
    'kremhvitt, uten eget magepanel, siden pinnsvinets buk og ansikt er samme lyse farge.',
    "The body is small and round, just big enough for Pip to sit steadily. Crocheted entirely "
    "in cream, with no separate belly panel, since a hedgehog's belly and face are the same "
    "light colour.")
add('kropp_rows', [
    ('1', '6 fm i magisk ring', 6),
    ('2', 'økn x 6', 12),
    ('3', '(1 fm, økn) x 6', 18),
    ('4', '(2 fm, økn) x 6', 24),
    ('5', '(3 fm, økn) x 6', 30),
    ('6', '(4 fm, økn) x 6', 36),
    ('7', '(5 fm, økn) x 6', 42),
    ('8 til 17', '42 fm, 10 omganger uten økning', 42),
    ('18', '(5 fm, mink) x 6', 36),
    ('19', '36 fm', 36),
    ('20', '(4 fm, mink) x 6 - fyll kroppen jevnt og godt nå', 30),
    ('21', '(3 fm, mink) x 6', 24),
    ('22', '(2 fm, mink) x 6', 18),
])
add('kropp_rows_en', [
    ('1', '6 sc in a magic ring', 6),
    ('2', 'inc x 6', 12),
    ('3', '(1 sc, inc) x 6', 18),
    ('4', '(2 sc, inc) x 6', 24),
    ('5', '(3 sc, inc) x 6', 30),
    ('6', '(4 sc, inc) x 6', 36),
    ('7', '(5 sc, inc) x 6', 42),
    ('8 to 17', '42 sc, 10 rounds with no increases', 42),
    ('18', '(5 sc, dec) x 6', 36),
    ('19', '36 sc', 36),
    ('20', '(4 sc, dec) x 6 - stuff the body evenly and firmly now', 30),
    ('21', '(3 sc, dec) x 6', 24),
    ('22', '(2 sc, dec) x 6', 18),
])
add('kropp_ferdig',
    'Ikke klipp av. Kontroller at kroppen er godt og jevnt fylt, spesielt i bunnen, så Pip '
    'sitter stødig, og bruk så den samme trådenden til å feste hodet oppå kroppen senere.',
    'Do not cut the yarn. Check that the body is filled evenly and firmly, especially at the '
    'bottom, so Pip sits steadily, then use that same yarn tail to attach the head on top of '
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
    'Bena er runde og fylles fast, så Pip sitter godt. I stedet for Ellies mørke klov får hver '
    'pote en liten brodert potepute, som på ekte pinnsvinføtter.',
    "The legs are round and stuffed firmly, so Pip sits well. Instead of Ellie's dark hoof, "
    "each paw gets a little embroidered paw pad, just like on a real hedgehog's feet.")
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
    'kroppen når Pip sitter.',
    'Cut the yarn, leaving a tail of approx. 20 cm. Stuff firmly, especially at the bottom, so '
    'the legs can support the body when Pip is sitting.')
add('pill_poter', 'POTEPUTENE, BRODERT', 'THE PAW PADS, EMBROIDERED')
add('poter_txt',
    'Når foten er sydd fast: brodér fire til fem små, ovale sting i salviegrønt eller mørkt '
    'brunt tett samlet nederst framme på hver fot, som en liten potepute-blomst. Bruk stramme, '
    'tette sting slik at de tåler klemming og lek.',
    'Once the foot is sewn on: embroider four to five small, oval stitches in sage green or '
    'dark brown, grouped closely together at the front bottom of each foot, like a little paw '
    'pad flower. Use tight, secure stitches so they hold up to squeezing and play.')

# ---------------------------------------------------------------- SIDE 14: DEL 7 PIGGENE
add('banner_pigger', 'DEL 7: PIGGENE', 'PART 7: THE SPIKES')
add('pigger_lead',
    'Dette er Pips signaturdel, og den nyeste teknikken i hele Ellie-kolleksjonen: myke '
    'løkkemasker som gir en pigget overflate uten en eneste stiv eller skarp del. Piggfeltet '
    'hekles flatt i mørkt varmt brunt, og sys på til slutt.',
    "This is Pip's signature part, and the newest technique in the whole Ellie collection: soft "
    "loop stitches that create a spiky surface without a single stiff or sharp part. The spike "
    "panel is crocheted flat in dark warm brown, and sewn on at the end.")
add('pill_lokketeknikk', 'LØKKETEKNIKKEN', 'THE LOOP STITCH TECHNIQUE')
add('lokketeknikk_txt',
    'Stikk nålen inn i masken som vanlig. Legg tråden rundt to fingre (eller en linjal, for '
    'jevnere lengde) i stedet for direkte over nålen, dra opp en løkke, og fullfør maskn som en '
    'vanlig fastmaske. Løkken blir stående igjen som en liten sløyfe på utsiden av arbeidet. '
    'Jevn løkkelengde, ca. 1,5 til 2 cm, gir det peneste resultatet.',
    'Insert the hook into the stitch as usual. Wrap the yarn around two fingers (or a ruler, '
    'for an even length) instead of taking it directly over the hook, pull up a loop, and '
    'finish the stitch as a normal single crochet. The loop stays standing as a small loop on '
    'the right side of the work. An even loop length, approx. 1.5 to 2 cm, gives the neatest '
    'result.')
add('pill_piggfelt', 'PIGGFELTET, MØRKT VARMT BRUNT', 'THE SPIKE PANEL, DARK WARM BROWN')
add('piggfelt_rows', [
    ('1', 'legg opp 7 lm + 1 vendemaske, løkkm i hver maske tilbake', 7),
    ('2', 'øk 1 løkkm i hver ende', 9),
    ('3', 'rett, løkkm i hver maske', 9),
    ('4', 'øk 1 løkkm i hver ende', 11),
    ('5', 'rett, løkkm i hver maske', 11),
    ('6', 'øk 1 løkkm i hver ende', 13),
    ('7 til 18', 'rett, løkkm i hver maske, 12 rader', 13),
    ('19', 'mink 1 i hver ende', 11),
    ('20', 'rett, løkkm i hver maske', 11),
    ('21', 'mink 1 i hver ende', 9),
    ('22', 'mink 1 i hver ende', 7),
])
add('piggfelt_rows_en', [
    ('1', 'chain 7 + 1 turning chain, loop st in each st back across', 7),
    ('2', 'inc 1 loop st at each end', 9),
    ('3', 'straight, loop st in each st', 9),
    ('4', 'inc 1 loop st at each end', 11),
    ('5', 'straight, loop st in each st', 11),
    ('6', 'inc 1 loop st at each end', 13),
    ('7 to 18', 'straight, loop st in each st, 12 rows', 13),
    ('19', 'dec 1 at each end', 11),
    ('20', 'straight, loop st in each st', 11),
    ('21', 'dec 1 at each end', 9),
    ('22', 'dec 1 at each end', 7),
])
add('piggfelt_ferdig',
    'Avslutt og klipp av, la ca. 25 cm tråd igjen. Feltet er nå formet som et langt, smalt blad, '
    'smalest i hver ende og bredest på midten. Den ene spisse enden blir pannetuppen, den andre '
    'blir enden nederst på ryggen.',
    'Fasten off, leaving a tail of approx. 25 cm. The panel is now shaped like a long, narrow '
    'leaf, narrowest at each end and widest in the middle. One pointed end becomes the point on '
    'the forehead, the other becomes the end at the base of the back.')
add('piggfelt_plassering',
    'Sy piggfeltet fast langs midtlinjen: start med den ene spissen midt i pannen, rett over der '
    'øynene sitter, før feltet over toppen av hodet, ned bakhodet og videre ned midt på ryggen, '
    'og fest den andre spissen nederst på ryggen, rett over der bena sitter. Sy langs begge '
    'sider av feltet med tette sting, slik at ingen løkker kan dras løse.',
    "Sew the spike panel on along the centre line: start with one point in the middle of the "
    "forehead, right above the eyes, carry the panel over the top of the head, down the back of "
    "the head and on down the middle of the back, and fasten the other point at the base of the "
    "back, right above where the legs sit. Sew along both sides of the panel with tight "
    "stitches, so that no loops can be pulled loose.")

# ---------------------------------------------------------------- SIDE 15: PIGGENE, SETT BAKFRA (diagram)
add('banner_pigger_bak', 'PIGGENE, SETT BAKFRA', 'THE SPIKES, SEEN FROM BEHIND')
add('pigger_bak_lead',
    'Denne skissen viser hvor piggfeltet skal ligge når du ser Pip bakfra: en smal spiss i '
    'pannen, bredt over hele bakhodet og ned hele ryggen, og smalt igjen helt nederst.',
    "This sketch shows where the spike panel should sit when you look at Pip from behind: a "
    "narrow point on the forehead, wide across the whole back of the head and down the whole "
    "back, and narrow again right at the bottom.")

# ---------------------------------------------------------------- SIDE 16: DEL 8 KRAGEN
add('banner_krage', 'DEL 8: KRAGEN', 'PART 8: THE COLLAR')
add('krage_lead',
    'Den salviegrønne volangkragen er Pips og Ellies felles kjennetegn, samme modell begge '
    'steder. Den hekles direkte rundt halsen, der hodet skal møte kroppen.',
    "The sage green ruffled collar is Pip's and Ellie's shared signature, the same model on "
    "both. It is crocheted directly around the neck, where the head will meet the body.")
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
    'kragen, akkurat som på Ellie.',
    "The collar should sit as a little ruffled edge around the neck, with the head sewn on top, "
    "centred over the collar, just like on Ellie.")

# ---------------------------------------------------------------- SIDE 17: KRAGEN, SETT FRA SIDEN (diagram)
add('banner_side', 'KRAGEN OG PIGGENE, SETT FRA SIDEN', 'THE COLLAR AND SPIKES, SEEN FROM THE SIDE')
add('side_lead',
    'Denne skissen viser Pip fra siden: hvordan piggfeltet buer over hodet og ned ryggen, og '
    'hvordan kragen sitter rett under haken, foran der piggfeltet starter.',
    "This sketch shows Pip from the side: how the spike panel curves over the head and down "
    "the back, and how the collar sits right under the chin, in front of where the spike panel "
    "starts.")

# ---------------------------------------------------------------- SIDE 18: MONTERING
add('banner_montering', 'MONTERING', 'ASSEMBLY')
add('montering_lead',
    'Nå skal alle delene bli til Pip. Bruk knappenåler til å prøve plasseringen først, så syr du '
    'for godt til slutt. Alt sys fast med tett heftesting eller stikksøm og god, tvinnet tråd, '
    'ingenting limes.',
    'Now all the pieces become Pip. Use safety pins to test the placement first, then sew '
    'everything firmly at the end. Everything is sewn on with tight running stitch or '
    'backstitch and strong, twisted thread, nothing is glued.')
add('montering_steg', [
    'Sy bena fast under kroppen, ca. 1 til 2 cm fra hverandre, så Pip står stødig når han '
    'sitter, og brodér poteputene.',
    'Sy armene fast på hver side av kroppen, litt nedenfor der halsen skal være.',
    'Hekle volangkragen rundt kroppens øverste kant, der halsen skal være.',
    'Sy snuten fast nederst midt på hodet, fremoverstikkende, før du setter inn øyne, nese, '
    'munn, vipper og kinn (se side om ansiktet).',
    'Sy hodet fast oppå kroppen, midt over kragen. Sjekk at hodet sitter rett frem før du syr '
    'helt ferdig.',
    'Sy ørene fast høyt på hodet, ett på hver side, ved kanten der piggfeltet skal ligge.',
    'Sy piggfeltet fast langs midtlinjen, fra pannen, over hodet og ned hele ryggen (se side om '
    'piggenes plassering).',
    'Fest alle løse tråder godt på innsiden av delene, og klipp av det som er igjen.',
])
add('montering_steg_en', [
    "Sew the legs onto the bottom of the body, approx. 1 to 2 cm apart, so Pip sits steadily, "
    "and embroider the paw pads.",
    'Sew the arms onto each side of the body, a little below where the neck will be.',
    'Crochet the ruffled collar around the top edge of the body, where the neck will be.',
    'Sew the snout onto the bottom centre of the head, projecting forward, before adding the '
    'eyes, nose, mouth, lashes and cheeks (see the face page).',
    'Sew the head onto the body, centred over the collar. Check that the head faces forward '
    'before you sew it on completely.',
    'Sew the ears onto the head, high up, one on each side, at the edge where the spike panel '
    'will sit.',
    'Sew the spike panel on along the centre line, from the forehead, over the head and down '
    'the whole back (see the page about the placement of the spikes).',
    'Fasten every loose end securely on the inside of the pieces, and trim what is left.',
])

# ---------------------------------------------------------------- SIDE 19: FOTOVEILEDNING
add('banner_foto', 'FOTOVEILEDNING', 'PHOTO GUIDE')
add('foto_lead',
    'Sett inn egne bilder av hvert steg her når du har heklet Pip selv.',
    'Add your own photos of each step here once you have crocheted Pip yourself.')
add('foto_captions',
    ['Hodet og snuten', 'Piggfeltet, flatt', 'Piggfeltet sydd på', 'Ferdig Pip'],
    ['The head and snout', 'The spike panel, flat', 'The spike panel sewn on', 'Finished Pip'])

# ---------------------------------------------------------------- SIDE 20: SIKKERHET OG STELL
add('banner_sikkerhet', 'ETTERARBEID, SIKKERHET OG STELL', 'FINISHING, SAFETY AND CARE')
add('pill_etterarbeid', 'HELT TIL SLUTT', 'FINISHING TOUCHES')
add('etterarbeid', [
    'Fest alle løse tråder godt på innsiden av delene: vev dem fram og tilbake gjennom noen '
    'masker med stoppenålen, og klipp av det som er igjen.',
    'Se over alle sømmer, spesielt langs piggfeltets kanter. Er noen masker løse eller har '
    'hull, sy over med noen ekstra sting.',
    'Klipp bort eventuelle løse lo-tråder fra løkkemaskene forsiktig med en liten saks, men '
    'aldri selve løkkene.'],
    ['Fasten every loose end securely on the inside of the pieces: weave it back and forth '
     'through a few stitches with the yarn needle, then trim what is left.',
     "Check over every seam, especially along the edges of the spike panel. If any stitches "
     "are loose or there are gaps, sew over them with a few extra stitches.",
     'Carefully trim away any stray loose threads from the loop stitches with small scissors, '
     'but never the loops themselves.'])
add('pill_sikkerhet', 'SIKKERHET', 'SAFETY')
add('sikkerhet_txt', [
    'Ingen deler limes, alt sys godt fast med tett tråd. Dobbeltsjekk sømmene på øyne, nese, '
    'ører, snute, armer, ben og piggfeltet, dette er stedene som får mest drahjelp under lek.',
    'Bruker du sikkerhetsøyne (versjon A), er Pip beregnet for barn fra 3 år, siden smådeler '
    'kan løsne over tid ved hard bruk. For de aller minste, bruk versjon B med broderte øyne i '
    'stedet.',
    'Piggfeltets løkker er myke og ufarlige, men bør sjekkes jevnlig for å se at ingen løkke har '
    'blitt så løs at et lite barn kan få en finger fast i den. Stram opp eller sy over ved '
    'behov.',
    'Vask alltid gamle sømmer og fest på nytt hvis du ser tegn til slitasje. Kast Pip hvis fyll '
    'begynner å komme ut, eller hvis en del løsner og ikke kan syes trygt fast igjen.'],
    ['No parts are glued, everything is sewn securely with strong thread. Double-check the '
     'seams on the eyes, nose, ears, snout, arms, legs and the spike panel, these are the spots '
     'that get the most tugging during play.',
     'If you use safety eyes (version A), Pip is intended for children aged 3 and up, since '
     'small parts can loosen over time with heavy use. For the very youngest, use version B '
     'with embroidered eyes instead.',
     "The spike panel's loops are soft and harmless, but should be checked regularly to make "
     "sure no loop has become so loose that a small child's finger could get caught in it. "
     "Tighten or sew over as needed.",
     'Always check old seams and re-sew them if you see signs of wear. Retire Pip if stuffing '
     'starts to come out, or if a piece comes loose and cannot be sewn safely back on.'])
add('pill_stell', 'VASK OG STELL', 'WASHING AND CARE')
add('stell_txt',
    'Håndvask i lunkent vann med litt mild såpe, eller vask på 30 grader i vaskepose. Klem '
    'forsiktig ut vannet i et håndkle, ikke vri. Form Pip pent og legg ham til tørk flatt, og '
    'krøll løkkene i piggfeltet forsiktig tilbake på plass med fingrene mens han er fuktig.',
    'Hand wash in lukewarm water with a little mild soap, or machine wash at 30 degrees in a '
    'wash bag. Gently press out the water in a towel, do not wring. Reshape Pip neatly and lay '
    'him flat to dry, gently coaxing the loops in the spike panel back into place with your '
    'fingers while he is still damp.')

# ---------------------------------------------------------------- SIDE 21: FERDIG
add('banner_ferdig', 'GRATULERER, PIP ER FERDIG!', 'CONGRATULATIONS, PIP IS DONE!')
add('ferdig_txt',
    'Nå har du heklet din helt egen Pip, det lille pinnsvinet. Vis ham gjerne fram i '
    '#lmebabycollection, jeg elsker å se hva dere skaper!',
    "Now you have crocheted your very own Pip, the little hedgehog. Feel free to show him off "
    "in #lmebabycollection, I love seeing what you make!")
add('pill_kolleksjon', 'RESTEN AV LME BABY COLLECTION', 'THE REST OF THE LME BABY COLLECTION')
add('kolleksjon_lead',
    'Pip er den andre figuren i "Woodland Dreams", i samme uttrykk, garnvalg og fargepalett som '
    'Ellie. Flere skogvenner er på vei etter hvert.',
    'Pip is the second figure in "Woodland Dreams", in the same look, yarn choice and colour '
    'palette as Ellie. More woodland friends are on their way over time.')
add('kolleksjon_liste',
    ['Ellie, det lille dådyret', 'Ellies smokkelenke', 'Ellies rangle', 'Ellies vognlenke',
     'Ellies ballerinasko', 'Ellies aktivitetsleke'],
    ['Ellie, the little fawn', "Ellie's pacifier clip", "Ellie's rattle", "Ellie's stroller toy",
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
    ah = 'ah2'
    txt = {
        'height': {'no': 'h. ca. 22-24 cm', 'en': 'h. approx. 22-24 cm'},
        'width': {'no': 'br. ca. 14 cm', 'en': 'w. approx. 14 cm'},
        'spikes': {'no': '1. piggfeltet', 'en': '1. spike panel'},
        'ears': {'no': '2. ørene', 'en': '2. ears'},
        'snout': {'no': '3. snuten', 'en': '3. snout'},
        'collar': {'no': '4. kragen', 'en': '4. collar'},
        'arms': {'no': '5. armene', 'en': '5. arms'},
        'legs': {'no': '6. bena', 'en': '6. legs'},
    }
    def t(k): return txt[k][lang]
    return f'''
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 520 380" style="width:100%">
  <defs>
    <marker id="{ah}" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">
      <path d="M0,0 L8,4 L0,8 z" fill="#8a8a8a"/>
    </marker>
  </defs>
  <line x1="60" y1="30" x2="60" y2="330" stroke="#8a8a8a" stroke-width="2" marker-start="url(#{ah})" marker-end="url(#{ah})"/>
  <text x="40" y="180" text-anchor="middle" font-size="14" font-family="sans-serif" fill="#666" transform="rotate(-90 40 180)">{t('height')}</text>
  <ellipse cx="260" cy="235" rx="52" ry="58" fill="{CREAM}" stroke="{BROWN_MID}" stroke-width="2"/>
  <ellipse cx="200" cy="220" rx="14" ry="32" fill="{CREAM}" stroke="{BROWN_MID}" stroke-width="2" transform="rotate(-16 200 220)"/>
  <ellipse cx="320" cy="220" rx="14" ry="32" fill="{CREAM}" stroke="{BROWN_MID}" stroke-width="2" transform="rotate(16 320 220)"/>
  <ellipse cx="232" cy="308" rx="19" ry="21" fill="{CREAM}" stroke="{BROWN_MID}" stroke-width="2"/>
  <ellipse cx="288" cy="308" rx="19" ry="21" fill="{CREAM}" stroke="{BROWN_MID}" stroke-width="2"/>
  <path d="M210,176 Q260,192 310,176" fill="none" stroke="{SAGE}" stroke-width="11" stroke-linecap="round"/>
  <circle cx="260" cy="100" r="46" fill="{CREAM}" stroke="{BROWN_MID}" stroke-width="2"/>
  <ellipse cx="216" cy="70" rx="14" ry="19" fill="{PIGG}" stroke="{BROWN_DARK}" stroke-width="2"/>
  <ellipse cx="216" cy="70" rx="7" ry="11" fill="{CREAM}"/>
  <ellipse cx="304" cy="70" rx="14" ry="19" fill="{PIGG}" stroke="{BROWN_DARK}" stroke-width="2"/>
  <ellipse cx="304" cy="70" rx="7" ry="11" fill="{CREAM}"/>
  <path d="M260,44 C 225,44 200,64 196,90 C 220,76 240,70 260,70 C 280,70 300,76 324,90 C 320,64 295,44 260,44 Z" fill="{PIGG}"/>
  <circle cx="244" cy="98" r="4.5" fill="#3a2a1e"/>
  <circle cx="276" cy="98" r="4.5" fill="#3a2a1e"/>
  <ellipse cx="260" cy="128" rx="17" ry="14" fill="{CREAM}" stroke="{BROWN_MID}" stroke-width="1.5"/>
  <ellipse cx="260" cy="126" rx="5" ry="4" fill="{BROWN_DARK}"/>
  <line x1="120" y1="30" x2="400" y2="30" stroke="#8a8a8a" stroke-width="2" marker-start="url(#{ah})" marker-end="url(#{ah})"/>
  <text x="260" y="20" text-anchor="middle" font-size="14" font-family="sans-serif" fill="#666">{t('width')}</text>
  <text x="452" y="52" font-size="13" font-family="sans-serif" fill="#555">{t('spikes')}</text>
  <line x1="448" y1="48" x2="300" y2="52" stroke="#bbb" stroke-width="1.5"/>
  <text x="452" y="75" font-size="13" font-family="sans-serif" fill="#555">{t('ears')}</text>
  <line x1="448" y1="71" x2="312" y2="70" stroke="#bbb" stroke-width="1.5"/>
  <text x="452" y="132" font-size="13" font-family="sans-serif" fill="#555">{t('snout')}</text>
  <line x1="448" y1="128" x2="277" y2="128" stroke="#bbb" stroke-width="1.5"/>
  <text x="452" y="182" font-size="13" font-family="sans-serif" fill="#555">{t('collar')}</text>
  <line x1="448" y1="178" x2="300" y2="180" stroke="#bbb" stroke-width="1.5"/>
  <text x="452" y="220" font-size="13" font-family="sans-serif" fill="#555">{t('arms')}</text>
  <line x1="448" y1="216" x2="330" y2="220" stroke="#bbb" stroke-width="1.5"/>
  <text x="452" y="310" font-size="13" font-family="sans-serif" fill="#555">{t('legs')}</text>
  <line x1="448" y1="306" x2="303" y2="308" stroke="#bbb" stroke-width="1.5"/>
</svg>'''

def face_diagram(lang):
    return f'''
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 280" style="width:78mm">
  <path d="M150,20 Q60,30 45,95 Q100,68 150,68 Q200,68 255,95 Q240,30 150,20 Z" fill="{PIGG}"/>
  <circle cx="150" cy="150" r="105" fill="{CREAM}" stroke="{BROWN_MID}" stroke-width="2.5"/>
  <ellipse cx="103" cy="118" r="15" fill="#fff" stroke="{BROWN_DARK}" stroke-width="2" stroke-dasharray="3 3"/>
  <ellipse cx="197" cy="118" r="15" fill="#fff" stroke="{BROWN_DARK}" stroke-width="2" stroke-dasharray="3 3"/>
  <circle cx="103" cy="118" r="8" fill="#241a12"/>
  <circle cx="197" cy="118" r="8" fill="#241a12"/>
  <circle cx="106" cy="115" r="2.4" fill="#fff"/>
  <circle cx="200" cy="115" r="2.4" fill="#fff"/>
  <path d="M85,100 Q95,92 112,98" stroke="#241a12" stroke-width="2.4" fill="none" stroke-linecap="round"/>
  <path d="M215,100 Q205,92 188,98" stroke="#241a12" stroke-width="2.4" fill="none" stroke-linecap="round"/>
  <ellipse cx="150" cy="185" rx="40" ry="32" fill="{CREAM_DEEP}" stroke="#e3d2b8" stroke-width="1.5"/>
  <ellipse cx="150" cy="180" rx="13" ry="9" fill="{BROWN_DARK}"/>
  <path d="M150,189 Q140,202 128,198 M150,189 Q160,202 172,198" stroke="#241a12" stroke-width="2.2" fill="none" stroke-linecap="round"/>
  <circle cx="112" cy="150" r="9" fill="{ROSE}" opacity="0.55"/>
  <circle cx="188" cy="150" r="9" fill="{ROSE}" opacity="0.55"/>
  <text x="150" y="270" text-anchor="middle" font-size="12" font-family="sans-serif" fill="#888">{'stiplet = plassering av øyne' if lang == 'no' else 'dashed = eye placement'}</text>
</svg>'''

def back_diagram(lang):
    cap = {'no': 'piggfeltet, sett bakfra', 'en': 'the spike panel, seen from behind'}
    return f'''
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 340" style="width:70mm">
  <ellipse cx="150" cy="150" rx="95" ry="105" fill="{CREAM}" stroke="{BROWN_MID}" stroke-width="2.5"/>
  <path d="M150,55 Q120,60 112,90 Q114,150 118,210 Q122,250 150,260 Q178,250 182,210 Q186,150 188,90 Q180,60 150,55 Z"
        fill="{PIGG}" stroke="{BROWN_DARK}" stroke-width="2"/>
  <g stroke="{BROWN_DARK}" stroke-width="1.2" opacity="0.5">
    <path d="M118,90 q16,8 32,0" fill="none"/>
    <path d="M114,120 q18,8 36,0" fill="none"/>
    <path d="M113,150 q18,8 37,0" fill="none"/>
    <path d="M115,180 q18,8 36,0" fill="none"/>
    <path d="M120,210 q15,7 30,0" fill="none"/>
  </g>
  <ellipse cx="95" cy="105" rx="11" ry="15" fill="{PIGG}" stroke="{BROWN_DARK}" stroke-width="2" transform="rotate(-20 95 105)"/>
  <ellipse cx="205" cy="105" rx="11" ry="15" fill="{PIGG}" stroke="{BROWN_DARK}" stroke-width="2" transform="rotate(20 205 105)"/>
  <text x="150" y="320" text-anchor="middle" font-size="13" font-family="sans-serif" fill="#888">{cap[lang]}</text>
</svg>'''

def side_diagram(lang):
    cap = {'no': 'kragen og piggene, sett fra siden', 'en': 'the collar and spikes, seen from the side'}
    return f'''
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 340" style="width:70mm">
  <ellipse cx="175" cy="245" rx="82" ry="78" fill="{CREAM}" stroke="{BROWN_MID}" stroke-width="2.5"/>
  <ellipse cx="120" cy="255" rx="20" ry="30" fill="{CREAM}" stroke="{BROWN_MID}" stroke-width="2" transform="rotate(-15 120 255)"/>
  <circle cx="118" cy="122" r="64" fill="{CREAM}" stroke="{BROWN_MID}" stroke-width="2.5"/>
  <ellipse cx="52" cy="132" rx="28" ry="20" fill="{CREAM}" stroke="{BROWN_MID}" stroke-width="2"/>
  <ellipse cx="30" cy="132" rx="9" ry="7" fill="{BROWN_DARK}"/>
  <circle cx="80" cy="118" r="6" fill="#241a12"/>
  <path d="M60,148 Q70,156 82,150" stroke="#241a12" stroke-width="2" fill="none" stroke-linecap="round"/>
  <ellipse cx="100" cy="66" rx="15" ry="20" fill="{PIGG}" stroke="{BROWN_DARK}" stroke-width="2" transform="rotate(-10 100 66)"/>
  <ellipse cx="100" cy="68" rx="7" ry="11" fill="{CREAM}" transform="rotate(-10 100 68)"/>
  <path d="M108,58 Q126,38 154,48 Q180,58 194,92 Q217,138 226,188 Q233,224 221,262
           Q206,255 209,220 Q201,174 179,130 Q162,96 136,83 Q118,75 108,86 Z"
        fill="{PIGG}" stroke="{BROWN_DARK}" stroke-width="2"/>
  <g stroke="{BROWN_DARK}" stroke-width="1" opacity="0.45">
    <path d="M120,64 q8,10 4,22" fill="none"/>
    <path d="M146,56 q10,14 6,30" fill="none"/>
    <path d="M172,78 q14,12 10,30" fill="none"/>
    <path d="M198,118 q16,10 14,28" fill="none"/>
    <path d="M214,163 q14,8 12,26" fill="none"/>
  </g>
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
<div class="coverimg"><img src="{hero_src}" alt="Pip, det lille pinnsvinet, stiluttrykk-referanse"></div>
<p class="small center" style="margin-top:-2mm;">{'Bildet viser stiluttrykk-referansen for Pip, ikke det ferdige heklede produktet.' if lang == 'no' else 'Photo shows the style reference for Pip, not the finished crocheted product.'}</p>
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
{sagep('SLIK ER PIP BYGGET OPP' if lang == 'no' else 'HOW PIP IS BUILT')}
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

    piggfelt_rows = T['piggfelt_rows']['no'] if lang == 'no' else T['piggfelt_rows_en']['no']
    pages.append(pg(f'''
{banner(t('banner_pigger'))}
<p>{t('pigger_lead')}</p>
{rosep(t('pill_lokketeknikk'))}
{card('<p>' + t('lokketeknikk_txt') + '</p>')}
{sagep(t('pill_piggfelt'))}
{card(otab(piggfelt_rows, rowhead[lang]))}
{cme(t('piggfelt_ferdig'))}
''', 14))

    pages.append(pg(f'''
{card('<p>' + t('piggfelt_plassering') + '</p>')}
{banner(t('banner_pigger_bak'))}
<p>{t('pigger_bak_lead')}</p>
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

    foto_caps = T['foto_captions']['no'] if lang == 'no' else T['foto_captions']['en']
    pages.append(pg(f'''
{banner(t('banner_foto'))}
{card('<p class="center">' + t('foto_lead') + '</p>')}
{photo_row(foto_caps)}
''', 19))

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
''', 20))

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
''', 21))

    return pages

for lang in ('no', 'en'):
    html_doc = kit.doc(lang, T['doctitle'][lang], None, build(lang))
    out = BASE / f'pip_{lang}.html'
    out.write_text(html_doc, encoding='utf-8')
    print('OK', lang, len(html_doc), 'tegn/chars')
