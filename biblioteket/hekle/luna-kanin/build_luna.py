# -*- coding: utf-8 -*-
"""Genererer LME-hekleoppskrift 'Luna, den lille kaninen' (norsk + engelsk) som HTML,
klar for PDF-print med Chromium. Del av LME Baby Collection 'Woodland Dreams',
Ellies skogvenn."""
import base64, pathlib, sys

BASE = pathlib.Path(__file__).parent
sys.path.insert(0, str(BASE.parent / '_shared'))
import lme_pattern_kit as kit
from lme_pattern_kit import (banner, rosep, sagep, card, cream, cme, ul, steps, otab, abbrtab,
                              BROWN, BROWN_MID, BROWN_DARK, CREAM,
                              CREAM_DEEP, ROSE, SAGE, INK)

HERO = BASE / 'luna_hero.jpg'
FACE = BASE / 'luna_face.jpg'
hero_src = f'data:image/jpeg;base64,{base64.b64encode(HERO.read_bytes()).decode()}'
face_src = f'data:image/jpeg;base64,{base64.b64encode(FACE.read_bytes()).decode()}'

GREY = '#B7AFA1'       # hovedfarge, varm gra
GREY_DARK = '#8A8274'  # kant/skygge til gra
ROSE_DARK = '#c46d86'  # kant/skygge til rosa sløyfe/krage

T = {}
def add(key, no, en=None):
    T[key] = {'no': no, 'en': en if en is not None else no}

head3 = {'no': ['Omg', 'Beskrivelse', 'Masker'], 'en': ['Rnd', 'Description', 'Sts']}
rowhead = {'no': ['Rad', 'Beskrivelse', 'Masker'], 'en': ['Row', 'Description', 'Sts']}

# ---------------------------------------------------------------- SIDE 1: FORSIDE
add('doctitle', 'Luna, den lille kaninen, LME hekleoppskrift', 'Luna, the Little Bunny, LME crochet pattern')
add('ph2', 'LME HEKLEOPPSKRIFT&nbsp;&nbsp;|&nbsp;&nbsp;LUNA, DEN LILLE KANINEN',
    "LME CROCHET PATTERN&nbsp;&nbsp;|&nbsp;&nbsp;LUNA, THE LITTLE BUNNY")
add('covertag', 'LME HEKLEOPPSKRIFT - AMIGURUMI', 'LME CROCHET PATTERN - AMIGURUMI')
add('covertitle', 'LUNA', 'LUNA')
add('subpill', 'LME BABY COLLECTION - WOODLAND DREAMS', 'LME BABY COLLECTION - WOODLAND DREAMS')
add('cover_desc',
    'Luna er en liten, myk kanin med ekstra lange, todelte ører (varmt grå utenpå, kremhvite '
    'innvendig) som henger langs hodet, akkurat i samme uttrykk som resten av skogvenn-'
    'familien. En rosa sløyfe mellom ørene og en matchende volangkrage fullfører henne. Heklet '
    'i de samme varme naturfargene som resten av kolleksjonen. Et helt originalt LME-design, '
    'ferdig ca. 21 til 23 cm sittende. Middels vanskelighetsgrad.',
    'Luna is a small, soft bunny with extra long, two-tone ears (warm grey on the outside, '
    'cream on the inside) that hang down alongside the head, in the very same look as the rest '
    'of the woodland friends family. A pink bow between the ears and a matching ruffled collar '
    'complete her. Crocheted in the same warm natural colours as the rest of the collection. A '
    'fully original LME design, finished size approx. 21 to 23 cm sitting. Medium difficulty.')
add('by1', 'Av Renate Dahl', 'By Renate Dahl')
add('by2', 'Little Montessori Explorers', 'Little Montessori Explorers')
add('by3', 'lmexplorers.com', 'lmexplorers.com')
add('cover_tip',
    'TIPS: Les hele oppskriften én gang før du begynner, spesielt siden om ørene, som er den '
    'lengste og mest detaljerte delen i hele oppskriften.',
    "TIP: Read through the whole pattern once before you start, especially the page about the "
    "ears, which is the longest and most detailed part of the whole pattern.")

# ---------------------------------------------------------------- SIDE 2: OM LUNA
add('banner_om', 'OM LUNA', 'ABOUT LUNA')
add('pill_historien', 'DEL AV ELLIES VERDEN', "PART OF ELLIE'S WORLD")
add('om_historien',
    'Luna er den femte figuren i LME Baby Collection "Woodland Dreams", en av Ellies gode '
    'venner i skogen. Der Molly helst vil ligge stille i gresset, er Luna den som alltid hopper '
    'først og ser lengst, med de lange ørene sine som fanger opp hver minste lyd i skogen. '
    'Flere skogvenner er på vei inn i kolleksjonen etter hvert.',
    'Luna is the fifth figure in the LME Baby Collection "Woodland Dreams", one of Ellie\'s good '
    'friends in the forest. Where Molly would rather lie still in the grass, Luna is the one '
    'who always hops first and sees the farthest, her long ears picking up every little sound '
    'in the forest. More woodland friends are on their way into the collection over time.')
add('pill_stil', 'STIL', 'STYLE')
add('om_stil',
    'Samme premium amigurumi-uttrykk som resten av familien: store former, myke overganger, '
    'rolige fargeskift og et vennlig, avrundet blikk. Luna er IKKE nervøs eller vill i '
    'uttrykket, IKKE realistisk, og de lange ørene er heklet myke og lett bøyelige, ikke stive, '
    'slik at hun er trygg og god å klemme.',
    'The same premium amigurumi look as the rest of the family: big shapes, soft transitions, '
    'calm colour changes and a friendly, rounded gaze. Luna does NOT look nervous or wild, is '
    'NOT realistic, and the long ears are crocheted soft and gently flexible, not stiff, so she '
    'is safe and nice to cuddle.')
add('pill_montessori', 'MONTESSORI-INSPIRERT', 'MONTESSORI-INSPIRED')
add('om_montessori',
    'Store, enkle former og rolige fargeblokker gjør Luna fin å kjenne på og lett å gjenkjenne '
    'for de minste, akkurat den typen konkrete, sanselige lek Montessori-filosofien bygger på.',
    'Big, simple shapes and calm blocks of colour make Luna nice to feel and easy for little '
    'ones to recognise, exactly the kind of concrete, sensory play the Montessori philosophy is '
    'built on.')

# ---------------------------------------------------------------- SIDE 3: STØRRELSE OG MATERIALER
add('banner_mat', 'STØRRELSE OG MATERIALER', 'SIZE AND MATERIALS')
add('pill_storrelse', 'FERDIG STØRRELSE', 'FINISHED SIZE')
add('storrelse_txt', 'Ca. 21 til 23 cm høy, sittende.', 'Approx. 21 to 23 cm tall, sitting.')
add('pill_garn', 'GARN', 'YARN')
add('garn_lead',
    'Bystrikk Merino gir en myk, tett amigurumi-overflate, godt egnet til de lange ørene, som '
    'trenger å holde formen uten å bli tunge.',
    'Bystrikk Merino gives a soft, firm amigurumi surface, well suited to the long ears, which '
    'need to hold their shape without becoming heavy.')
add('garn_tabell_head', ['Farge', 'Til', 'Mengde'], ['Colour', 'For', 'Amount'])
add('garn_rows', [
    ('Bystrikk Merino, varmt grått (hovedfarge)', "hodet, ørenes utside, kroppen, armene, "
     'bena', 'ca. 2 nøster',
     'Bystrikk Merino, warm grey (main colour)', "the head, the outside of the ears, the "
     'body, the arms, the legs', 'approx. 2 skeins'),
    ('Bystrikk Merino, kremhvit', 'snuteflekken, ørenes innside, magebeltet, potene', 'ca. 1 '
     'nøste',
     'Bystrikk Merino, cream', 'the muzzle patch, the inside of the ears, the belly patch, '
     'the paws', 'approx. 1 skein'),
    ('Bystrikk Merino, rosa', 'sløyfen og volangkragen', 'litt',
     'Bystrikk Merino, pink', 'the bow and the ruffled collar', 'small amount'),
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
    ('Polyesterfiber til fyll', 'ren, vaskbar leketøyfyll, kun litt til ørenes nederste del'),
    ('To 16 mm sikkerhetsøyne (versjon A), eller svart broderigarn (versjon B)', 'se side om '
     'ansiktet'),
    ('Stoppenål med butt spiss', 'til all somming'),
    ('Maskemarkør', 'en, eller en løkke garn i annen farge'),
    ('Nål og tvinnet bomullstråd', 'til å sy på ører, snuteflekk, sløyfe og krage'),
    ('Målebånd og saks', ''),
])

# ---------------------------------------------------------------- SIDE 4: FASTHET OG ORDLISTE
add('banner_fasthet', 'HEKLEFASTHET OG ORDLISTE', 'GAUGE AND GLOSSARY')
add('pill_fasthet', 'HEKLEFASTHET', 'GAUGE')
add('fasthet_txt',
    'Ca. 16 fm x 18 omganger = 10 x 10 cm, heklet STRAMT (amigurumi-fasthet) på nål 4 mm. '
    'Hekler du løsere enn dette, synes fyllet gjennom maskene og Luna blir myk og ustødig i '
    'stedet for fin og fast.',
    'Approx. 16 sc x 18 rounds = 10 x 10 cm, crocheted TIGHTLY (amigurumi tension) on a 4 mm '
    'hook. If you crochet looser than this, the stuffing shows through the stitches and Luna '
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
    'Hodet, kroppen, armene og bena hekles i spiral med fastmasker, uten å avslutte omgangene. '
    'Ørene, sløyfen og kragen hekles frem og tilbake i rader. Sett gjerne en maskemarkør i '
    'første maske på hver spiraldel.',
    'The head, body, arms and legs are crocheted in a spiral of single crochet, without joining '
    'the rounds. The ears, bow and collar are crocheted back and forth in rows. Place a stitch '
    'marker in the first stitch of each spiral piece.')

# ---------------------------------------------------------------- SIDE 5: TIPS OG OVERSIKT
add('banner_oversikt', 'TIPS OG SLIK ER LUNA BYGGET OPP', "TIPS AND HOW LUNA IS BUILT")
add('pill_tips', 'TIPS FØR DU BEGYNNER', 'TIPS BEFORE YOU START')
add('tips',
    ['Hekle ørene først, de er den lengste delen og tar mest tid, så vet du tidlig om du har '
     'nok garn igjen til resten.',
     'Legg alle delene ved siden av hverandre før du syr noe fast, så du ser at Luna blir '
     'symmetrisk, og at begge ørene er like lange.',
     'Fyll litt og litt underveis i stedet for helt til slutt, det gir en jevnere, penere '
     'form.'],
    ['Crochet the ears first, they are the longest part and take the most time, so you will '
     'know early whether you have enough yarn left for the rest.',
     'Lay all the pieces out next to each other before sewing anything on, so you can see that '
     'Luna turns out symmetrical, and that both ears are the same length.',
     'Stuff a little at a time as you go, rather than all at once at the end, it gives a more '
     'even, neater shape.'])
add('oversikt_lead',
    'Luna hekles i åtte deler, som sys sammen helt til slutt. Ingen deler limes, og alt sys '
    'godt fast slik at ingenting løsner. Gjør deg kjent med delene før du begynner:',
    'Luna is crocheted in eight pieces, which are all sewn together at the very end. No pieces '
    'are glued, and everything is sewn securely so that nothing comes loose. Get to know the '
    'pieces before you begin:')
add('oversikt_deler', [
    ('1. Hodet', 'stort og rundt, varmt grått', '1. The head', 'big and round, warm grey'),
    ('2. Ørene (x2)', 'ekstra lange, todelt: grått utenpå, kremhvitt inni', '2. The ears (x2)',
     'extra long, two layers: grey outside, cream inside'),
    ('3. Snuteflekken', 'stor, flat, kremhvit', '3. The muzzle patch', 'big, flat, cream'),
    ('4. Kroppen', 'rund, varmt grå med et kremhvitt magebelte', '4. The body',
     'round, warm grey with a cream belly patch'),
    ('5. Armene (x2)', 'små og myke, korte', '5. The arms (x2)', 'small and soft, short'),
    ('6. Bena (x2)', 'runde, med kremhvite poter', '6. The legs (x2)',
     'round, with cream paws'),
    ('7. Sløyfen', 'rosa, mellom ørene', '7. The bow', 'pink, between the ears'),
    ('8. Kragen', 'rosa volangkrage', '8. The collar', 'a pink ruffled collar'),
])
add('schematic_caption',
    'Målskisse: Luna sittende, ca. 21 til 23 cm høy og ca. 13 cm bred over armene, ørene ikke '
    'medregnet.',
    'Size sketch: Luna sitting, approx. 21 to 23 cm tall and approx. 13 cm wide across the '
    'arms, not counting the ears.')

# ---------------------------------------------------------------- SIDE 6: KROPPENS PROPORSJONER (diagram)
add('banner_proporsjoner', 'KROPPENS PROPORSJONER', 'BODY PROPORTIONS')
add('proporsjoner_lead',
    'Bruk denne skissen som en rettesnor mens du hekler, spesielt for å se hvor lange ørene '
    'skal være i forhold til resten av kroppen.',
    "Use this sketch as a guide while you crochet, especially to see how long the ears should "
    "be compared to the rest of the body.")

# ---------------------------------------------------------------- SIDE 7: DEL 1 HODET
add('banner_hode', 'DEL 1: HODET', 'PART 1: THE HEAD')
add('hode_lead',
    'Hodet hekles i spiral, ovenfra og ned, helt i varmt grått. Det starter smalt, øker ut til '
    'bredest midt på, står rett en stund, og minker så ned igjen mot halsen.',
    'The head is crocheted in a spiral, from the top down, entirely in warm grey. It starts '
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

# ---------------------------------------------------------------- SIDE 8: DEL 2 ØRENE
add('banner_orer', 'DEL 2: ØRENE (2 STK)', 'PART 2: THE EARS (MAKE 2)')
add('orer_lead',
    'Dette er Luna sin signaturdel: ekstra lange ører, mye lengre enn på resten av familien, '
    'heklet i to lag akkurat som Felix sine, en litt større del i varmt grått (utsiden) og en '
    'litt mindre i kremhvitt (innsiden), sydd sammen til én lang, flat form. Hekle to av hver.',
    "This is Luna's signature part: extra long ears, much longer than on the rest of the "
    'family, crocheted in two layers just like on Felix, a slightly bigger piece in warm grey '
    '(the outside) and a slightly smaller one in cream (the inside), sewn together into one '
    'long, flat shape. Crochet two of each.')
add('pill_ore_ute', 'YTTERSIDEN (VARMT GRÅTT) - HEKLE 2', 'THE OUTSIDE (WARM GREY) - MAKE 2')
add('ore_ute_rows', [
    ('1', 'legg opp 6 lm + 1 vendemaske, 6 fm tilbake', 6),
    ('2', 'økn, 4 fm, økn', 8),
    ('3 til 16', 'rett, 8 fm, 14 rader', 8),
    ('17', 'mink, 4 fm, mink', 6),
])
add('ore_ute_rows_en', [
    ('1', 'chain 6 + 1 turning chain, 6 sc back across', 6),
    ('2', 'inc, 4 sc, inc', 8),
    ('3 to 16', 'straight, 8 sc, 14 rows', 8),
    ('17', 'dec, 4 sc, dec', 6),
])
add('pill_ore_inne', 'INNSIDEN (KREMHVIT) - HEKLE 2', 'THE INSIDE (CREAM) - MAKE 2')
add('ore_inne_rows', [
    ('1', 'legg opp 5 lm + 1 vendemaske, 5 fm tilbake', 5),
    ('2', 'økn, 3 fm, økn', 7),
    ('3 til 13', 'rett, 7 fm, 11 rader', 7),
    ('14', 'mink, 3 fm, mink', 5),
])
add('ore_inne_rows_en', [
    ('1', 'chain 5 + 1 turning chain, 5 sc back across', 5),
    ('2', 'inc, 3 sc, inc', 7),
    ('3 to 13', 'straight, 7 sc, 11 rows', 7),
    ('14', 'dec, 3 sc, dec', 5),
])
add('orer_ferdig',
    'Klipp av alle fire delene, la ca. 25 cm tråd igjen. Legg den kremhvite delen midt oppå den '
    'grå, litt forskjøvet mot den ene langsiden, og sy den fast med heftesting, så det står en '
    'jevn grå kant rundt. Ikke fyll ørene helt, kun litt løs vatt i den nederste tredjedelen, '
    'slik at øret står litt av seg selv nederst men flopper mykt i den øvre delen, akkurat som '
    'på et ekte kaninøre.',
    'Cut all four pieces, leaving a tail of approx. 25 cm. Place the cream piece in the middle '
    'of the grey one, slightly offset towards one long side, and sew it on with running stitch, '
    'leaving an even grey rim showing. Do not stuff the ears fully, only a little loose stuffing '
    'in the bottom third, so the ear stands up a little on its own at the base but flops softly '
    'in the upper part, just like on a real rabbit ear.')
add('orer_plassering',
    'Sy ørene fast øverst på hver side av hodet, slik at de henger nedover langs siden av '
    'ansiktet og kroppen, se side om ørene sett bakfra for nøyaktig plassering.',
    'Sew the ears onto the top of each side of the head, so they hang downward alongside the '
    'face and body, see the ears-from-behind page for exact placement.')

# ---------------------------------------------------------------- SIDE 9: ØRENE, SETT BAKFRA (diagram)
add('banner_orer_bak', 'ØRENE, SETT BAKFRA', 'THE EARS, SEEN FROM BEHIND')
add('orer_bak_lead',
    'Denne skissen viser hvor ørene skal festes når du ser Luna bakfra: høyt oppe på hver side '
    'av hodet, hengende rett nedover langs kroppen, ikke ut til siden.',
    "This sketch shows where the ears should be attached when you look at Luna from behind: "
    "high up on each side of the head, hanging straight down alongside the body, not out to "
    "the side.")

# ---------------------------------------------------------------- SIDE 10: DEL 3 SNUTEFLEKKEN
add('banner_snute', 'DEL 3: SNUTEFLEKKEN', 'PART 3: THE MUZZLE PATCH')
add('snute_lead',
    'Snuteflekken er en stor, flat del som dekker mesteparten av den nedre delen av ansiktet, '
    'akkurat som på Felix, bare litt større. Hekles i kremhvitt.',
    "The muzzle patch is a big, flat piece that covers most of the lower part of the face, just "
    "like on Felix, only a little bigger. Crocheted in cream.")
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
    'Cut, leaving a tail of approx. 20 cm. Do not stuff, the muzzle patch should be flat. Sew it '
    'on at the bottom centre of the head, flat against the face, see the face page for exact '
    'placement.')

# ---------------------------------------------------------------- SIDE 11: ANSIKTET (diagram)
add('banner_ansikt', 'ANSIKTET', 'THE FACE')
add('ansikt_lead',
    'Ansiktet er det som gir Luna liv. Ta deg god tid her, og prøv gjerne med knappenåler først '
    'før du syr eller fester noe fast.',
    "The face is what brings Luna to life. Take your time here, and try pinning things in "
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
    ('Vipper', 'Brodér 2 til 3 korte, buede sting med svart tråd over ytre hjørne av hvert '
     'øye, for det våkne, oppmerksomme blikket.'),
    ('Kinn', 'Hekle to små flate sirkler i pudderrosa (6 fm i magisk ring, avslutt), og sy dem '
     'lett fast på kinnene under hvert øye.'),
], [
    ('Nose', 'Embroider a small dark brown triangular nose in the middle of the muzzle patch, '
     'in dense satin stitch.'),
    ('Mouth', 'From the base of the nose, embroider a small smile downward and out to each '
     'side in backstitch, using black thread.'),
    ('Lashes', 'Embroider 2 to 3 short, curved stitches with black thread above the outer '
     'corner of each eye, for the alert, attentive look.'),
    ('Cheeks', 'Crochet two small flat circles in powder pink (6 sc in a magic ring, fasten '
     'off), and sew them lightly onto the cheeks below each eye.'),
])
add('ansikt_bilde_caption',
    'Slik kan det ferdige ansiktet se ut: lange ører, flat snuteflekk med stiplet plassering, '
    'sløyfe, sikkerhetsøyne, brodert nese og munn.',
    'This is roughly how the finished face can look: long ears, a flat muzzle patch with dashed '
    'placement, bow, safety eyes, embroidered nose and mouth.')

# ---------------------------------------------------------------- SIDE 12: DEL 4 KROPPEN
add('banner_kropp', 'DEL 4: KROPPEN', 'PART 4: THE BODY')
add('kropp_lead',
    'Kroppen hekles i varmt grått, akkurat stor nok til at Luna kan sitte stødig. En egen, flat '
    'kremhvit magebelte-lapp hekles for seg og sys på foran til slutt, samme metode som på '
    'Felix.',
    "The body is crocheted in warm grey, just big enough for Luna to sit steadily. A separate, "
    'flat cream belly patch is crocheted on its own and sewn onto the front at the end, the '
    'same method as on Felix.')
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
    'Ikke klipp av. Kontroller at kroppen er godt og jevnt fylt, spesielt i bunnen, så Luna '
    'sitter stødig, og bruk så den samme trådenden til å feste hodet oppå kroppen senere.',
    'Do not cut the yarn. Check that the body is filled evenly and firmly, especially at the '
    'bottom, so Luna sits steadily, then use that same yarn tail to attach the head on top of '
    'the body later.')
add('pill_magebelte', 'MAGEBELTET, KREMHVIT', 'THE BELLY PATCH, CREAM')
add('magebelte_txt',
    'Hekle 6 fm i magisk ring, økn x 6 (12), (1 fm, økn) x 6 (18), (2 fm, økn) x 6 (24). Klipp '
    'av, la ca. 20 cm tråd igjen. Ikke fyll, den skal være flat. Sy den fast midt på magen, fra '
    'like under kragen og nedover.',
    'Crochet 6 sc in a magic ring, inc x 6 (12), (1 sc, inc) x 6 (18), (2 sc, inc) x 6 (24). Cut '
    'the yarn, leaving a tail of approx. 20 cm. Do not stuff, it should be flat. Sew it onto the '
    'middle of the belly, from just below the collar and downward.')

# ---------------------------------------------------------------- SIDE 13: DEL 5 ARMENE
add('banner_armer', 'DEL 5: ARMENE (2 STK)', 'PART 5: THE ARMS (MAKE 2)')
add('armer_lead',
    'Armene er korte og myke, varmt grå, akkurat som resten av kroppen.',
    'The arms are short and soft, warm grey, just like the rest of the body.')
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
    'Bena starter i varmt grått, og skifter til kremhvitt nederst for de siste omgangene, som '
    'blir en enkel, lys pote.',
    'The legs start in warm grey, and switch to cream at the bottom for the last rounds, which '
    'become a simple, light paw.')
add('bena_rows', [
    ('1', '6 fm i magisk ring, varmt grått', 6),
    ('2', 'økn x 6', 12),
    ('3', '(1 fm, økn) x 6', 18),
    ('4 til 11', '18 fm, 8 omganger', 18),
    ('12', 'bytt til kremhvit, 18 fm', 18),
    ('13 til 14', '18 fm, 2 omganger', 18),
])
add('bena_rows_en', [
    ('1', '6 sc in a magic ring, warm grey', 6),
    ('2', 'inc x 6', 12),
    ('3', '(1 sc, inc) x 6', 18),
    ('4 to 11', '18 sc, 8 rounds', 18),
    ('12', 'switch to cream, 18 sc', 18),
    ('13 to 14', '18 sc, 2 rounds', 18),
])
add('bena_ferdig',
    'Klipp av, la ca. 20 cm tråd igjen. Fyll godt og fast, spesielt nederst, så bena kan bære '
    'kroppen når Luna sitter.',
    'Cut the yarn, leaving a tail of approx. 20 cm. Stuff firmly, especially at the bottom, so '
    'the legs can support the body when Luna is sitting.')

# ---------------------------------------------------------------- SIDE 15: DEL 7 SLØYFEN
add('banner_sloyfe', 'DEL 7: SLØYFEN', 'PART 7: THE BOW')
add('sloyfe_lead',
    'En liten, enkel sløyfe i rosa, sydd fast mellom ørene øverst på hodet, Luna sitt eget '
    'kjennemerke.',
    "A small, simple bow in pink, sewn onto the top of the head between the ears, Luna's own "
    "signature touch.")
add('sloyfe_txt',
    'Legg opp 12 lm + 1 vendemaske. Rad 1 til 3: 12 fm, 3 rader. Klipp av, la ca. 20 cm tråd '
    'igjen. Brett stykket dobbelt sammen på midten og snør en tråd stramt rundt midten for å '
    'lage sløyfeformen, sy deretter en liten bit garn rundt midjen for å skjule snøringen.',
    'Chain 12 + 1 turning chain. Rows 1 to 3: 12 sc, 3 rows. Cut the yarn, leaving a tail of '
    'approx. 20 cm. Fold the piece in half at the middle and cinch a thread tightly around the '
    'centre to form the bow shape, then sew a small wrap of yarn around the middle to hide the '
    'cinching.')
add('sloyfe_plassering',
    'Sy sløyfen fast midt mellom ørene, øverst på hodet, rett over pannen.',
    'Sew the bow on centred between the ears, on top of the head, right above the forehead.')

# ---------------------------------------------------------------- SIDE 16: DEL 8 KRAGEN
add('banner_krage', 'DEL 8: KRAGEN', 'PART 8: THE COLLAR')
add('krage_lead',
    'Den rosa volangkragen hekles direkte rundt halsen, der hodet skal møte kroppen, samme '
    'modell som resten av familien bruker, bare i en annen farge.',
    'The pink ruffled collar is crocheted directly around the neck, where the head will meet '
    'the body, the same model the rest of the family uses, just in a different colour.')
add('krage_txt',
    'Før du syr hodet fast på kroppen: fest rosa tråd i kroppens øverste kant, der halsen skal '
    'være (18 m). *1 fm i neste maske, hopp over 1 maske, 4 stav i neste maske (en liten '
    'vifte), hopp over 1 maske*, gjenta rundt hele kanten (6 vifter totalt). Fest av og gjem '
    'tråden.',
    'Before sewing the head onto the body: attach pink yarn at the top edge of the body, where '
    'the neck will be (18 sts). *1 sc in the next stitch, skip 1 stitch, 4 dc in the next '
    'stitch (a little fan), skip 1 stitch*, repeat all the way around the edge (6 fans in '
    'total). Fasten off and weave in the end.')
add('krage_plassering',
    'Kragen skal ligge som en liten volangkant rundt halsen, med hodet syd fast oppå, midt over '
    'kragen, akkurat som på resten av familien.',
    "The collar should sit as a little ruffled edge around the neck, with the head sewn on top, "
    "centred over the collar, just like on the rest of the family.")

# ---------------------------------------------------------------- SIDE 17: KRAGEN OG ØRENE, SETT FRA SIDEN (diagram)
add('banner_side', 'KRAGEN OG ØRENE, SETT FRA SIDEN', 'THE COLLAR AND EARS, SEEN FROM THE SIDE')
add('side_lead',
    'Denne skissen viser Luna fra siden: hvordan det lange øret henger nedover langs kroppen, '
    'og hvordan kragen sitter rett under haken.',
    "This sketch shows Luna from the side: how the long ear hangs down alongside the body, and "
    "how the collar sits right under the chin.")

# ---------------------------------------------------------------- SIDE 18: MONTERING
add('banner_montering', 'MONTERING', 'ASSEMBLY')
add('montering_lead',
    'Nå skal alle delene bli til Luna. Bruk knappenåler til å prøve plasseringen først, så syr '
    'du for godt til slutt. Alt sys fast med tett heftesting eller stikksøm og god, tvinnet '
    'tråd, ingenting limes.',
    'Now all the pieces become Luna. Use safety pins to test the placement first, then sew '
    'everything firmly at the end. Everything is sewn on with tight running stitch or '
    'backstitch and strong, twisted thread, nothing is glued.')
add('montering_steg', [
    'Sy bena fast under kroppen, ca. 1 til 2 cm fra hverandre, så Luna står stødig når hun '
    'sitter.',
    'Sy armene fast på hver side av kroppen, litt nedenfor der halsen skal være.',
    'Sy magebeltet fast midt på magen, fra like under der kragen skal være og nedover.',
    'Hekle volangkragen rundt kroppens øverste kant, der halsen skal være.',
    'Sy snuteflekken fast nederst midt på hodet, flatt mot ansiktet, før du setter inn øyne, '
    'nese, munn, vipper og kinn (se side om ansiktet).',
    'Sy hodet fast oppå kroppen, midt over kragen. Sjekk at hodet sitter rett frem før du syr '
    'helt ferdig.',
    'Sy ørene fast øverst på hver side av hodet, slik at de henger nedover (se side om ørene '
    'sett bakfra).',
    'Sy sløyfen fast midt mellom ørene.',
    'Fest alle løse tråder godt på innsiden av delene, og klipp av det som er igjen.',
])
add('montering_steg_en', [
    "Sew the legs onto the bottom of the body, approx. 1 to 2 cm apart, so Luna stands "
    "steadily when she sits.",
    'Sew the arms onto each side of the body, a little below where the neck will be.',
    'Sew the belly patch onto the middle of the belly, from just below where the collar will '
    'be and downward.',
    'Crochet the ruffled collar around the top edge of the body, where the neck will be.',
    'Sew the muzzle patch onto the bottom centre of the head, flat against the face, before '
    'adding the eyes, nose, mouth, lashes and cheeks (see the face page).',
    'Sew the head onto the body, centred over the collar. Check that the head faces forward '
    'before you sew it on completely.',
    'Sew the ears onto the top of each side of the head, so they hang downward (see the '
    'ears-from-behind page).',
    'Sew the bow on centred between the ears.',
    'Fasten every loose end securely on the inside of the pieces, and trim what is left.',
])

# ---------------------------------------------------------------- SIDE 19: SIKKERHET OG STELL
add('banner_sikkerhet', 'ETTERARBEID, SIKKERHET OG STELL', 'FINISHING, SAFETY AND CARE')
add('pill_etterarbeid', 'HELT TIL SLUTT', 'FINISHING TOUCHES')
add('etterarbeid', [
    'Fest alle løse tråder godt på innsiden av delene: vev dem fram og tilbake gjennom noen '
    'masker med stoppenålen, og klipp av det som er igjen.',
    'Se over alle sømmer, spesielt der ørene festes til hodet, det er stedet som får mest '
    'drahjelp under lek. Er noen masker løse eller har hull, sy over med noen ekstra sting.',
    'Kontroller at snuteflekken sitter helt flatt og godt fast, uten løse kanter et lite barn '
    'kan plukke i.'],
    ['Fasten every loose end securely on the inside of the pieces: weave it back and forth '
     'through a few stitches with the yarn needle, then trim what is left.',
     'Check over every seam, especially where the ears attach to the head, that is the spot '
     'that gets the most tugging during play. If any stitches are loose or there are gaps, sew '
     'over them with a few extra stitches.',
     'Check that the muzzle patch sits completely flat and securely, with no loose edges a '
     'small child could pick at.'])
add('pill_sikkerhet', 'SIKKERHET', 'SAFETY')
add('sikkerhet_txt', [
    'Ingen deler limes, alt sys godt fast med tett tråd. Dobbeltsjekk sømmene på øyne, nese, '
    'ører, snuteflekk, armer, ben og spesielt ørenes festepunkt, siden det er den delen barn '
    'drar mest i.',
    'Bruker du sikkerhetsøyne (versjon A), er Luna beregnet for barn fra 3 år, siden smådeler '
    'kan løsne over tid ved hard bruk. For de aller minste, bruk versjon B med broderte øyne i '
    'stedet.',
    'De lange ørene tåler forsiktig klemming og lek, men bør sjekkes jevnlig for å se at '
    'festepunktet til hodet fortsatt sitter helt sikkert.',
    'Vask alltid gamle sømmer og fest på nytt hvis du ser tegn til slitasje. Kast Luna hvis '
    'fyll begynner å komme ut, eller hvis en del løsner og ikke kan syes trygt fast igjen.'],
    ['No parts are glued, everything is sewn securely with strong thread. Double-check the '
     'seams on the eyes, nose, ears, muzzle patch, arms, legs and especially where the ears '
     'attach, since that is the part children pull on the most.',
     'If you use safety eyes (version A), Luna is intended for children aged 3 and up, since '
     'small parts can loosen over time with heavy use. For the very youngest, use version B '
     'with embroidered eyes instead.',
     'The long ears can handle gentle squeezing and play, but should be checked regularly to '
     'make sure the attachment point to the head is still completely secure.',
     'Always check old seams and re-sew them if you see signs of wear. Retire Luna if stuffing '
     'starts to come out, or if a piece comes loose and cannot be sewn safely back on.'])
add('pill_stell', 'VASK OG STELL', 'WASHING AND CARE')
add('stell_txt',
    'Håndvask i lunkent vann med litt mild såpe, eller vask på 30 grader i vaskepose. Klem '
    'forsiktig ut vannet i et håndkle, ikke vri. Form Luna pent og legg henne til tørk flatt, '
    'med ørene lagt rett ut, ikke bøyd, slik at de tørker i riktig fasong.',
    'Hand wash in lukewarm water with a little mild soap, or machine wash at 30 degrees in a '
    'wash bag. Gently press out the water in a towel, do not wring. Reshape Luna neatly and lay '
    'her flat to dry, with the ears laid out straight, not bent, so they dry in the right '
    'shape.')

# ---------------------------------------------------------------- SIDE 20: FERDIG
add('banner_ferdig', 'GRATULERER, LUNA ER FERDIG!', 'CONGRATULATIONS, LUNA IS DONE!')
add('ferdig_txt',
    'Nå har du heklet din helt egen Luna, den lille kaninen. Vis henne gjerne fram i '
    '#lmebabycollection, jeg elsker å se hva dere skaper!',
    "Now you have crocheted your very own Luna, the little bunny. Feel free to show her off in "
    "#lmebabycollection, I love seeing what you make!")
add('pill_kolleksjon', 'RESTEN AV LME BABY COLLECTION', 'THE REST OF THE LME BABY COLLECTION')
add('kolleksjon_lead',
    'Luna er den femte figuren i "Woodland Dreams", i samme uttrykk, garnvalg og fargepalett '
    'som resten av familien:',
    'Luna is the fifth figure in "Woodland Dreams", in the same look, yarn choice and colour '
    'palette as the rest of the family:')
add('kolleksjon_liste',
    ['Ellie, det lille dådyret', 'Pip, det lille pinnsvinet', 'Felix, den lille reven',
     'Molly, det lille lammet', 'Oliver, den lille bjørnen', 'Ellies smokkelenke',
     'Pips smokkelenke', "Felix' smokkelenke", 'Mollys smokkelenke', 'Lunas smokkelenke',
     'Olivers smokkelenke', 'Ellies rangle', 'Pips rangle', "Felix' rangle", 'Mollys rangle',
     'Lunas rangle', 'Olivers rangle', 'Ellies vognlenke', 'Pips vognlenke',
     "Felix' vognlenke", 'Mollys vognlenke', 'Lunas vognlenke', 'Olivers vognlenke',
     'Ellies ballerinasko', 'Ellies aktivitetsleke'],
    ['Ellie, the little fawn', 'Pip, the little hedgehog', 'Felix, the little fox',
     'Molly, the little lamb', 'Oliver, the little bear', "Ellie's pacifier clip",
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
        'height': {'no': 'h. ca. 21-23 cm', 'en': 'h. approx. 21-23 cm'},
        'width': {'no': 'br. ca. 13 cm', 'en': 'w. approx. 13 cm'},
        'ears': {'no': '1. ørene', 'en': '1. ears'},
        'bow': {'no': '2. sløyfen', 'en': '2. bow'},
        'snout': {'no': '3. snuten', 'en': '3. muzzle'},
        'collar': {'no': '4. kragen', 'en': '4. collar'},
        'arms': {'no': '5. armene', 'en': '5. arms'},
        'legs': {'no': '6. bena', 'en': '6. legs'},
    }
    def t(k): return txt[k][lang]
    return f'''
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 520 420" style="width:100%">
  <line x1="60" y1="30" x2="60" y2="370" stroke="#8a8a8a" stroke-width="2"/>
  <text x="40" y="200" text-anchor="middle" font-size="14" font-family="sans-serif" fill="#666" transform="rotate(-90 40 200)">{t('height')}</text>
  <path d="M212,90 Q186,95 180,150 Q174,210 182,268 Q188,290 206,286 Q216,282 214,255 Q210,190 216,140 Q220,105 228,92 Z" fill="{GREY}" stroke="{GREY_DARK}" stroke-width="2"/>
  <path d="M204,110 Q194,150 192,210 Q190,250 202,272 Q208,270 206,250 Q202,190 206,140 Q208,118 212,108 Z" fill="{CREAM}"/>
  <path d="M308,90 Q334,95 340,150 Q346,210 338,268 Q332,290 314,286 Q304,282 306,255 Q310,190 304,140 Q300,105 292,92 Z" fill="{GREY}" stroke="{GREY_DARK}" stroke-width="2"/>
  <path d="M316,110 Q326,150 328,210 Q330,250 318,272 Q312,270 314,250 Q318,190 314,140 Q312,118 308,108 Z" fill="{CREAM}"/>
  <ellipse cx="260" cy="275" rx="52" ry="58" fill="{GREY}" stroke="{GREY_DARK}" stroke-width="2"/>
  <ellipse cx="260" cy="288" rx="30" ry="38" fill="{CREAM}" stroke="#e3d2b8" stroke-width="1.5"/>
  <ellipse cx="200" cy="260" rx="14" ry="32" fill="{GREY}" stroke="{GREY_DARK}" stroke-width="2" transform="rotate(-16 200 260)"/>
  <ellipse cx="320" cy="260" rx="14" ry="32" fill="{GREY}" stroke="{GREY_DARK}" stroke-width="2" transform="rotate(16 320 260)"/>
  <ellipse cx="232" cy="348" rx="19" ry="21" fill="{GREY}" stroke="{GREY_DARK}" stroke-width="2"/>
  <ellipse cx="288" cy="348" rx="19" ry="21" fill="{GREY}" stroke="{GREY_DARK}" stroke-width="2"/>
  <ellipse cx="232" cy="360" rx="9" ry="6" fill="{CREAM}" stroke="#e3d2b8" stroke-width="1"/>
  <ellipse cx="288" cy="360" rx="9" ry="6" fill="{CREAM}" stroke="#e3d2b8" stroke-width="1"/>
  <path d="M210,216 Q260,232 310,216" fill="none" stroke="{ROSE}" stroke-width="11" stroke-linecap="round"/>
  <circle cx="260" cy="140" r="46" fill="{GREY}" stroke="{GREY_DARK}" stroke-width="2"/>
  <ellipse cx="260" cy="158" rx="28" ry="23" fill="{CREAM}" stroke="#e3d2b8" stroke-width="1.5"/>
  <circle cx="244" cy="138" r="4.5" fill="#3a2a1e"/>
  <circle cx="276" cy="138" r="4.5" fill="#3a2a1e"/>
  <ellipse cx="260" cy="158" rx="6" ry="4.5" fill="#6B4423"/>
  <path d="M240,98 Q222,84 230,70 Q248,78 256,96 Z" fill="{ROSE}" stroke="{ROSE_DARK}" stroke-width="1.5"/>
  <path d="M280,98 Q298,84 290,70 Q272,78 264,96 Z" fill="{ROSE}" stroke="{ROSE_DARK}" stroke-width="1.5"/>
  <ellipse cx="260" cy="94" rx="8" ry="6" fill="{ROSE_DARK}"/>
  <line x1="120" y1="30" x2="400" y2="30" stroke="#8a8a8a" stroke-width="2"/>
  <text x="260" y="20" text-anchor="middle" font-size="14" font-family="sans-serif" fill="#666">{t('width')}</text>
  <text x="452" y="52" font-size="13" font-family="sans-serif" fill="#555">{t('ears')}</text>
  <line x1="448" y1="48" x2="330" y2="180" stroke="#bbb" stroke-width="1.5"/>
  <text x="452" y="75" font-size="13" font-family="sans-serif" fill="#555">{t('bow')}</text>
  <line x1="448" y1="71" x2="288" y2="82" stroke="#bbb" stroke-width="1.5"/>
  <text x="452" y="172" font-size="13" font-family="sans-serif" fill="#555">{t('snout')}</text>
  <line x1="448" y1="168" x2="286" y2="158" stroke="#bbb" stroke-width="1.5"/>
  <text x="452" y="222" font-size="13" font-family="sans-serif" fill="#555">{t('collar')}</text>
  <line x1="448" y1="218" x2="300" y2="220" stroke="#bbb" stroke-width="1.5"/>
  <text x="452" y="260" font-size="13" font-family="sans-serif" fill="#555">{t('arms')}</text>
  <line x1="448" y1="256" x2="330" y2="260" stroke="#bbb" stroke-width="1.5"/>
  <text x="452" y="350" font-size="13" font-family="sans-serif" fill="#555">{t('legs')}</text>
  <line x1="448" y1="346" x2="303" y2="348" stroke="#bbb" stroke-width="1.5"/>
</svg>'''

def face_diagram(lang):
    cap = {'no': 'stiplet = snuteflekken og øyeplassering',
           'en': 'dashed = muzzle patch and eye placement'}
    return f'''
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 320" style="width:78mm">
  <path d="M108,140 Q80,148 72,215 Q65,285 90,318 Q108,312 105,270 Q98,200 106,160 Z" fill="{GREY}" stroke="{GREY_DARK}" stroke-width="2"/>
  <path d="M98,162 Q90,205 88,255 Q86,290 98,310 Q104,308 102,285 Q98,220 100,168 Z" fill="{CREAM}"/>
  <path d="M192,140 Q220,148 228,215 Q235,285 210,318 Q192,312 195,270 Q202,200 194,160 Z" fill="{GREY}" stroke="{GREY_DARK}" stroke-width="2"/>
  <path d="M202,162 Q210,205 212,255 Q214,290 202,310 Q196,308 198,285 Q202,220 200,168 Z" fill="{CREAM}"/>
  <circle cx="150" cy="150" r="105" fill="{GREY}" stroke="{GREY_DARK}" stroke-width="2.5"/>
  <ellipse cx="150" cy="185" rx="62" ry="52" fill="{CREAM}" stroke="#e3d2b8" stroke-width="1.5" stroke-dasharray="4 4"/>
  <ellipse cx="103" cy="128" r="15" fill="#fff" stroke="{BROWN_DARK}" stroke-width="2" stroke-dasharray="3 3"/>
  <ellipse cx="197" cy="128" r="15" fill="#fff" stroke="{BROWN_DARK}" stroke-width="2" stroke-dasharray="3 3"/>
  <circle cx="103" cy="128" r="8" fill="#241a12"/>
  <circle cx="197" cy="128" r="8" fill="#241a12"/>
  <circle cx="106" cy="125" r="2.4" fill="#fff"/>
  <circle cx="200" cy="125" r="2.4" fill="#fff"/>
  <path d="M85,110 Q95,102 112,108" stroke="#241a12" stroke-width="2.4" fill="none" stroke-linecap="round"/>
  <path d="M215,110 Q205,102 188,108" stroke="#241a12" stroke-width="2.4" fill="none" stroke-linecap="round"/>
  <ellipse cx="150" cy="183" rx="13" ry="9" fill="#6B4423"/>
  <path d="M150,192 Q140,205 128,201 M150,192 Q160,205 172,201" stroke="#241a12" stroke-width="2.2" fill="none" stroke-linecap="round"/>
  <circle cx="108" cy="163" r="9" fill="{ROSE}" opacity="0.55"/>
  <circle cx="192" cy="163" r="9" fill="{ROSE}" opacity="0.55"/>
  <path d="M120,58 Q100,42 110,26 Q132,36 140,56 Z" fill="{ROSE}" stroke="{ROSE_DARK}" stroke-width="1.5"/>
  <path d="M180,58 Q200,42 190,26 Q168,36 160,56 Z" fill="{ROSE}" stroke="{ROSE_DARK}" stroke-width="1.5"/>
  <ellipse cx="150" cy="52" rx="9" ry="7" fill="{ROSE_DARK}"/>
  <text x="150" y="308" text-anchor="middle" font-size="12" font-family="sans-serif" fill="#888">{cap[lang]}</text>
</svg>'''

def back_diagram(lang):
    cap = {'no': 'ørene, sett bakfra', 'en': 'the ears, seen from behind'}
    return f'''
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 340" style="width:70mm">
  <ellipse cx="150" cy="150" rx="95" ry="105" fill="{GREY}" stroke="{GREY_DARK}" stroke-width="2.5"/>
  <path d="M96,68 Q68,74 60,140 Q52,210 62,278 Q68,300 88,296 Q100,292 96,262 Q90,190 98,130 Q102,90 110,72 Z" fill="{GREY}" stroke="{GREY_DARK}" stroke-width="2"/>
  <path d="M204,68 Q232,74 240,140 Q248,210 238,278 Q232,300 212,296 Q200,292 204,262 Q210,190 202,130 Q198,90 190,72 Z" fill="{GREY}" stroke="{GREY_DARK}" stroke-width="2"/>
  <g stroke="{GREY_DARK}" stroke-width="1" opacity="0.4">
    <path d="M74,110 q16,6 30,0" fill="none"/>
    <path d="M70,160 q18,6 32,0" fill="none"/>
    <path d="M72,210 q16,6 28,0" fill="none"/>
  </g>
  <text x="150" y="322" text-anchor="middle" font-size="13" font-family="sans-serif" fill="#888">{cap[lang]}</text>
</svg>'''

def side_diagram(lang):
    cap = {'no': 'kragen og ørene, sett fra siden', 'en': 'the collar and ears, seen from the side'}
    return f'''
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 380" style="width:70mm">
  <ellipse cx="175" cy="285" rx="82" ry="78" fill="{GREY}" stroke="{GREY_DARK}" stroke-width="2.5"/>
  <ellipse cx="175" cy="292" rx="46" ry="55" fill="{CREAM}" stroke="#e3d2b8" stroke-width="1.5"/>
  <ellipse cx="120" cy="295" rx="20" ry="30" fill="{GREY}" stroke="{GREY_DARK}" stroke-width="2" transform="rotate(-15 120 295)"/>
  <path d="M75,90 Q52,96 46,155 Q40,220 50,285 Q56,310 76,304 Q88,300 84,268 Q78,195 84,140 Q88,105 96,92 Z" fill="{GREY}" stroke="{GREY_DARK}" stroke-width="2"/>
  <path d="M66,110 Q58,155 56,210 Q54,255 66,280 Q72,278 70,255 Q64,195 68,140 Q70,118 74,108 Z" fill="{CREAM}"/>
  <circle cx="118" cy="162" r="64" fill="{GREY}" stroke="{GREY_DARK}" stroke-width="2.5"/>
  <ellipse cx="82" cy="172" rx="30" ry="24" fill="{CREAM}" stroke="#e3d2b8" stroke-width="1.5"/>
  <ellipse cx="56" cy="172" rx="8" ry="6" fill="#6B4423"/>
  <circle cx="80" cy="152" r="6" fill="#241a12"/>
  <path d="M60,180 Q70,188 82,182" stroke="#241a12" stroke-width="2" fill="none" stroke-linecap="round"/>
  <path d="M96,86 Q80,58 90,32 Q112,44 120,74 Z" fill="{ROSE}" stroke="{ROSE_DARK}" stroke-width="1.5"/>
  <path d="M132,86 Q148,58 138,32 Q116,44 108,74 Z" fill="{ROSE}" stroke="{ROSE_DARK}" stroke-width="1.5"/>
  <ellipse cx="114" cy="78" rx="9" ry="7" fill="{ROSE_DARK}"/>
  <ellipse cx="150" cy="218" rx="30" ry="14" fill="{ROSE}" stroke="{ROSE_DARK}" stroke-width="1.5" transform="rotate(-18 150 218)"/>
  <text x="160" y="368" text-anchor="middle" font-size="13" font-family="sans-serif" fill="#888">{cap[lang]}</text>
</svg>'''

# ================================================================== BYGG SIDENE

def build(lang):
    RIGHT = {'no': 'LME HEKLING', 'en': 'LME CROCHET'}[lang]
    def t(key): return T[key][lang]
    PH2 = t('ph2')
    def pg(body, num): return kit.page(body, num, RIGHT, PH2, t('doctitle'))
    pages = []

    pages.append(pg(f'''
<div class="coverimg"><img src="{hero_src}" alt="Luna, den lille kaninen, stiluttrykk-referanse"></div>
<p class="small center" style="margin-top:-2mm;">{'Bildet viser stiluttrykk-referansen for Luna, ikke det ferdige heklede produktet.' if lang == 'no' else 'Photo shows the style reference for Luna, not the finished crocheted product.'}</p>
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
{sagep('SLIK ER LUNA BYGGET OPP' if lang == 'no' else 'HOW LUNA IS BUILT')}
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
{card(otab(ore_ute, rowhead[lang]))}
{sagep(t('pill_ore_inne'))}
{card(otab(ore_inne, rowhead[lang]))}
{cme(t('orer_ferdig'))}
<p class="small center">{t('orer_plassering')}</p>
''', 8))

    pages.append(pg(f'''
{banner(t('banner_orer_bak'))}
<p>{t('orer_bak_lead')}</p>
<div class="schematic" style="text-align:center;">{back_diagram(lang)}</div>
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
{rosep(t('pill_magebelte'))}
{card('<p>' + t('magebelte_txt') + '</p>')}
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
{banner(t('banner_sloyfe'))}
<p>{t('sloyfe_lead')}</p>
{card('<p>' + t('sloyfe_txt') + '</p>')}
{cme(t('sloyfe_plassering'))}
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
    out = BASE / f'luna_{lang}.html'
    out.write_text(html_doc, encoding='utf-8')
    print('OK', lang, len(html_doc), 'tegn/chars')
