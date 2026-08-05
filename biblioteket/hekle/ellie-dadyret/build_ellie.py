# -*- coding: utf-8 -*-
"""Genererer LME-hekleoppskrift 'Ellie - det lille dådyret' (amigurumi) som HTML,
klar for PDF-print med Chromium. Bygger norsk og engelsk versjon fra samme kilde.

Kjor:
    python3 build_ellie.py
    /opt/pw-browsers/chromium-1194/chrome-linux/chrome --headless --no-pdf-header-footer \
        --print-to-pdf=ellie-hekleoppskrift-no.pdf ellie_no.html
    /opt/pw-browsers/chromium-1194/chrome-linux/chrome --headless --no-pdf-header-footer \
        --print-to-pdf=ellie-hekleoppskrift-en.pdf ellie_en.html
"""
import base64, html, pathlib

BASE = pathlib.Path(__file__).parent
HERO = BASE / 'ellie_hero.png'
BACKPHOTO = BASE / 'ellie_back.png'
FACEPHOTO = BASE / 'ellie_face.png'

# ---------- farger (LME Baby Collection, Woodland Dreams) ----------
BROWN      = '#A8734A'
BROWN_MID  = '#C79A6C'
BROWN_DARK = '#5C3A24'
CREAM      = '#F8F1E4'
CREAM_DEEP = '#F0E4D0'
ROSE       = '#E48FA6'
SAGE       = '#8FA681'
INK        = '#4a4a4a'

def b64(path):
    return base64.b64encode(path.read_bytes()).decode()

hero_src = f'data:image/png;base64,{b64(HERO)}'
back_src = f'data:image/png;base64,{b64(BACKPHOTO)}'
face_src = f'data:image/png;base64,{b64(FACEPHOTO)}'

# ---------- tekst: alt innhold tospraklig { 'no': ..., 'en': ... } ----------
T = {}
def add(key, no, en=None):
    # Når 'en' er utelatt, ligger begge sprak allerede sammen i 'no'-verdien
    # (tuple-lister med bade norske og engelske felt), og innholdet hentes
    # eksplisitt derfra av byggefunksjonene under.
    T[key] = {'no': no, 'en': en if en is not None else no}

# ======================================================================
# SIDE 1: FORSIDE
# ======================================================================
add('doctitle', 'Ellie - det lille dådyret, LME hekleoppskrift',
    "Ellie the Little Fawn, LME crochet pattern")
add('ph2', 'LME HEKLEOPPSKRIFT&nbsp;&nbsp;|&nbsp;&nbsp;ELLIE - DET LILLE DÅDYRET',
    'LME CROCHET PATTERN&nbsp;&nbsp;|&nbsp;&nbsp;ELLIE - THE LITTLE FAWN')
add('covertag', 'LME HEKLEOPPSKRIFT - AMIGURUMI', 'LME CROCHET PATTERN - AMIGURUMI')
add('covertitle', 'ELLIE', 'ELLIE')
add('subpill', 'LME BABY COLLECTION - WOODLAND DREAMS', 'LME BABY COLLECTION - WOODLAND DREAMS')
add('cover_desc',
    'Ellie er et lite, nysgjerrig dådyr som elsker blomsterenger, sommerfugler og skogens små '
    'hemmeligheter. Hun er heklet i myke naturfarger, med store uttrykksfulle øyne og en avtakbar '
    'sløyfe. Et helt originalt LME-design, ferdig ca. 18 til 20 cm sittende. Middels vanskelighetsgrad.',
    "Ellie is a curious little fawn who loves flower meadows, butterflies and the small secrets of "
    "the forest. She is crocheted in soft natural colours, with big expressive eyes and a removable "
    "bow. A fully original LME design, finished size approx. 18 to 20 cm sitting. Medium difficulty.")
add('by1', 'Av Renate Dahl', 'By Renate Dahl')
add('by2', 'Little Montessori Explorers', 'Little Montessori Explorers')
add('by3', 'lmexplorers.com', 'lmexplorers.com')
add('cover_tip',
    'TIPS: Les hele oppskriften en gang før du begynner. Hekle en liten prøvelapp først, så blir '
    'Ellie akkurat passe fast og fin i formen.',
    "TIP: Read through the whole pattern once before you start. Crochet a small gauge swatch first, "
    "so Ellie comes out just the right firmness and shape.")

# ======================================================================
# SIDE 2: OM ELLIE
# ======================================================================
add('banner_om', 'OM ELLIE', 'ABOUT ELLIE')
add('pill_historien', 'HISTORIEN', 'THE STORY')
add('om_historien',
    'Ellie er et lite nysgjerrig dådyr som elsker blomsterenger, sommerfugler og skogens små '
    'hemmeligheter. Hun er rolig, omsorgsfull og modig, og blir raskt en trygg kosevenn for små barn. '
    'Ellie hører til LME Baby Collection "Woodland Dreams", en samling myke skogsvenner i de samme '
    'naturfargene og med det samme uttrykket.',
    'Ellie is a curious little fawn who loves flower meadows, butterflies and the small secrets of '
    'the forest. She is calm, caring and brave, and quickly becomes a safe cuddle friend for small '
    'children. Ellie belongs to the LME Baby Collection "Woodland Dreams", a set of soft woodland '
    'friends in the same natural colours and with the same look.')
add('pill_stil', 'STIL OG UTTRYKK', 'STYLE AND LOOK')
add('om_stil_lead',
    'Ellie er et helt originalt LME-design, ikke en kopi eller nær etterligning av Bambi eller andre '
    'kjente figurer. Slik kjenner du igjen stilen i hele LME Baby Collection:',
    "Ellie is a fully original LME design, not a copy or close imitation of Bambi or other known "
    "characters. This is how you recognise the style across the whole LME Baby Collection:")
add('om_stil', [
    ('Skandinavisk og Montessori-inspirert', 'Rolige, naturlige farger og enkle, rene former.',
     'Scandinavian and Montessori-inspired', 'Calm, natural colours and simple, clean shapes.'),
    ('Større proporsjoner på hodet', 'Stort rundt hode og søte, avrundede proporsjoner, aldri overdrevet.',
     'Bigger head proportions', 'A big round head and cute, rounded proportions, never exaggerated.'),
    ('Store uttrykksfulle øyne', 'Store, myke øyne med lange vipper gir Ellie et varmt, snilt blikk.',
     'Big expressive eyes', 'Big, soft eyes with long lashes give Ellie a warm, gentle look.'),
    ('Premium handlaget følelse', 'Tett amigurumi-fasthet, rene sømmer og fin passform mellom delene.',
     'Premium handmade feel', 'Firm amigurumi tension, neat seams and a precise fit between the pieces.'),
])
add('om_ikke', 'Ellie er IKKE Disney-stil, ikke realistisk, ikke anime og ikke overdrevet i formen.',
    'Ellie is NOT Disney-style, not realistic, not anime, and not exaggerated in shape.')

# ======================================================================
# SIDE 3: STØRRELSE OG MATERIALER
# ======================================================================
add('banner_mat', 'STØRRELSE OG MATERIALER', 'SIZE AND MATERIALS')
add('pill_storrelse', 'FERDIG STØRRELSE', 'FINISHED SIZE')
add('storrelse_txt', 'Ca. 18 til 20 cm høy, sittende.', 'Approx. 18 to 20 cm tall, sitting.')
add('pill_garn', 'GARN', 'YARN')
add('garn_lead',
    'Bystrikk Merino og DROPS Cotton Merino (eller tilsvarende) gir en myk, tett amigurumi-overflate.',
    'Bystrikk Merino and DROPS Cotton Merino (or similar) give a soft, firm amigurumi surface.')
add('garn_tabell_head', ['Farge', 'Til', 'Mengde'], ['Colour', 'For', 'Amount'])
add('garn_rows', [
    ('Bystrikk Merino, brun (hovedfarge)', 'hode, kropp, ben, ansiktsfelt-kant, ører, hale', 'ca. 2 nosler',
     'Bystrikk Merino, brown (main colour)', 'head, body, arms, ears, tail', 'approx. 2 skeins'),
    ('Bystrikk Merino, mørkebrun', 'klover på bena (klovtupper)', 'rest',
     'Bystrikk Merino, dark brown', 'hooves at the base of the legs', 'small amount'),
    ('DROPS Cotton Merino, naturhvit', 'ansiktsfelt, magepanel, ørenes innside, halens underside, prikker',
     'ca. 1 nosle',
     'DROPS Cotton Merino, off-white', 'face patch, belly panel, ear insides, tail underside, spots',
     'approx. 1 skein'),
    ('Rest, pudderrosa', 'sløyfen (avtakbar)', 'litt',
     'Leftover, powder pink', 'the bow (removable)', 'small amount'),
    ('Svart broderigarn', 'nese og munn (hvis du broderer, se side om ansiktet)', 'litt',
     'Black embroidery thread', 'nose and mouth (if embroidered, see the face page)', 'small amount'),
])
add('garn_alt',
    'Alternativt garn: Enhver myk bomull/akryl-blanding i DK/aran-tykkelse (fx. Hobbii Amigo, Rico '
    'Ricorumi, Paintbox Simply DK) fungerer fint til amigurumi, så lenge du hekler stramt nok til at '
    'fyllet ikke synes. Sjekk alltid heklefastheten.',
    'Alternative yarn: any soft cotton/acrylic-blend DK/aran-weight yarn (e.g. Hobbii Amigo, Rico '
    'Ricorumi, Paintbox Simply DK) works well for amigurumi, as long as you crochet tightly enough '
    'that the stuffing does not show. Always check your gauge.')
add('pill_utstyr', 'HEKLENÅL OG UTSTYR', 'HOOK AND TOOLS')
add('utstyr', [
    ('Heklenål 3,5 mm eller 4 mm', 'avhengig av hvor stramt du hekler'),
    ('Polyesterfiber til fyll', 'ren, vaskbar leketoyfyll'),
    ('To 16 mm sikkerhetsøyne (versjon A), eller svart broderigarn (versjon B)', 'se side om ansiktet'),
    ('Stoppenål med butt spiss', 'til all sommig'),
    ('Maskemarkør', 'en, eller en løkke garn i annen farge'),
    ('Nål og tvinnet bomullstråd', 'til å sy på ører, sløyfetapp og prikker'),
    ('Målebånd og saks', ''),
]
+ [])
add('utstyr_en', [
    ('Crochet hook 3.5 mm or 4 mm', 'depending on how tightly you crochet'),
    ('Polyester fibrefill', 'clean, washable toy stuffing'),
    ('Two 16 mm safety eyes (version A), or black embroidery thread (version B)', 'see the face page'),
    ('Yarn needle with a blunt tip', 'for all sewing'),
    ('Stitch marker', 'one, or a loop of contrast yarn'),
    ('Needle and strong sewing thread', 'for attaching ears, the bow tab and spots'),
    ('Measuring tape and scissors', ''),
])

# ======================================================================
# SIDE 4: HEKLEFASTHET OG ORDLISTE
# ======================================================================
add('banner_fasthet', 'HEKLEFASTHET OG ORDLISTE', 'GAUGE AND GLOSSARY')
add('pill_fasthet', 'HEKLEFASTHET, DEN VIKTIGE NØKKELEN', 'GAUGE, THE IMPORTANT KEY')
add('fasthet_txt',
    'Ca. 18 fm x 20 omganger = 10 x 10 cm, heklet STRAMT (amigurumi-fasthet) på nål 3,5 mm. Hekler du '
    'løsere enn dette, synes fyllet gjennom maskene og Ellie blir myk og ustødig i stedet for fin og '
    'fast. Hekle en liten prøvelapp først: 12 fm i magisk ring, øk rundt til du har heklet 4 omganger, '
    'og se om maskene lukker seg tett rundt fingeren din.',
    'Approx. 18 sc x 20 rounds = 10 x 10 cm, crocheted TIGHTLY (amigurumi tension) on a 3.5 mm hook. '
    'If you crochet looser than this, the stuffing shows through the stitches and Ellie turns out '
    'soft and floppy instead of neat and firm. Crochet a small swatch first: 12 sc in a magic ring, '
    'increase around for 4 rounds, and check that the stitches close snugly around your finger.')
add('pill_ordliste', 'ORDLISTE OG FORKORTELSER', 'GLOSSARY AND ABBREVIATIONS')
add('ord_head', ['Kort', 'Betyr'], ['Short', 'Means'])
add('ord_rows', [
    ('lm', 'luftmaske', 'ch', 'chain stitch'),
    ('fm', 'fastmaske', 'sc', 'single crochet (UK: double crochet)'),
    ('kjm', 'kjedemaske', 'sl st', 'slip stitch'),
    ('magisk ring', 'en justerbar startring som lukkes helt igjen, uten hull i midten',
     'magic ring', 'an adjustable starting ring that closes with no hole in the middle'),
    ('økn', 'økning: 2 fm i samme maske. Gir en maske mer.',
     'inc', 'increase: 2 sc in the same stitch. Adds one stitch.'),
    ('mink', 'minking: stikk nålen gjennom to masker samtidig og hekle dem som en fm. Gir en maske mindre.',
     'dec', 'decrease: insert the hook through two stitches at once and crochet them together as one '
     'sc. Removes one stitch.'),
    ('m', 'maske(r)', 'st(s)', 'stitch(es)'),
    ('omg', 'omgang, en hel runde rundt i spiral', 'rnd', 'round, a full round worked in a spiral'),
    ('( )', 'tallet i parentes til slutt i raden er totalt antall masker på den omgangen',
     '( )', 'the number in brackets at the end of the row is the total stitch count for that round'),
    ('*...*', 'gjenta det som står mellom stjernene så mange ganger som står bak',
     '*...*', 'repeat what is between the stars as many times as stated afterwards'),
])
add('ord_note',
    'Hele Ellie hekles i spiral med fastmasker, uten å avslutte omgangene og uten å snu arbeidet, '
    'bortsett fra sløyfen som hekles frem og tilbake. Sett gjerne en maskemarkør i første maske på '
    'hver del, og flytt den opp for hver omgang, så du alltid vet hvor omgangen begynner.',
    'All of Ellie is crocheted in a spiral of single crochet, without joining the rounds and without '
    'turning the work, except for the bow which is worked back and forth in rows. Place a stitch '
    'marker in the first stitch of each piece and move it up every round, so you always know where '
    'the round begins.')

# ======================================================================
# SIDE 5: SLIK ER ELLIE BYGGET OPP
# ======================================================================
add('banner_oversikt', 'SLIK ER ELLIE BYGGET OPP', 'HOW ELLIE IS BUILT')
add('oversikt_lead',
    'Ellie hekles i ni deler, som sys sammen helt til slutt. Ingen deler limes, og alt sys godt fast '
    'slik at ingenting løsner. Gjør deg kjent med delene før du begynner:',
    'Ellie is crocheted in nine pieces, which are all sewn together at the very end. No pieces are '
    'glued, and everything is sewn securely so that nothing comes loose. Get to know the pieces '
    'before you begin:')
add('oversikt_deler', [
    ('1. Hodet', 'stort og rundt, med et lyst ansiktsfelt', '1. The head', 'big and round, with a light face patch'),
    ('2. Snuten', 'liten oval snute midt i ansiktsfeltet', '2. The muzzle', 'a small oval muzzle in the middle of the face patch'),
    ('3. Ørene (x2)', 'store, runde, med lys innside', '3. The ears (x2)', 'big, round, with a light inside'),
    ('4. Kroppen', 'liten oval kropp med magepanel', '4. The body', 'a small oval body with a belly panel'),
    ('5. Armene (x2)', 'små og myke, korte', '5. The arms (x2)', 'small and soft, short'),
    ('6. Bena (x2)', 'små, faste, med mørk klov', '6. The legs (x2)', 'small, firm, with a dark hoof'),
    ('7. Halen', 'kort og myk, kremhvit underside', '7. The tail', 'short and soft, cream underside'),
    ('8. Ryggprikkene', 'små kremhvite prikker, valgfritt antall', '8. The back spots', 'small cream spots, any number you like'),
    ('9. Sløyfen', 'avtakbar, pudderrosa', '9. The bow', 'removable, powder pink'),
])
add('schematic_caption',
    'Målskisse: Ellie sittende, ca. 18 til 20 cm høy og ca. 12 cm bred over armene.',
    'Size sketch: Ellie sitting, approx. 18 to 20 cm tall and approx. 12 cm wide across the arms.')

# ======================================================================
# SIDE 6: DEL 1 HODET
# ======================================================================
add('banner_hode', 'DEL 1: HODET', 'PART 1: THE HEAD')
add('hode_lead',
    'Hodet hekles i spiral, ovenfra og ned, i brunt. Det starter smalt, øker ut til bredest midt på, '
    'står rett en stund, og minker så ned igjen mot halsen.',
    'The head is crocheted in a spiral, from the top down, in brown. It starts narrow, increases out '
    'to its widest point in the middle, stays even for a while, then decreases back down towards the '
    'neck.')
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
    ('18', '42 fm', 42),
    ('19', '(5 fm, mink) x 6', 36),
    ('20', '36 fm', 36),
    ('21', '(4 fm, mink) x 6 - begynn å fylle godt og jevnt herfra', 30),
    ('22', '(3 fm, mink) x 6', 24),
    ('23', '(2 fm, mink) x 6', 18),
    ('24', '(1 fm, mink) x 6 - fyll siste rest', 12),
    ('25', 'mink x 6', 6),
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
    ('18', '42 sc', 42),
    ('19', '(5 sc, dec) x 6', 36),
    ('20', '36 sc', 36),
    ('21', '(4 sc, dec) x 6 - start stuffing firmly and evenly from here', 30),
    ('22', '(3 sc, dec) x 6', 24),
    ('23', '(2 sc, dec) x 6', 18),
    ('24', '(1 sc, dec) x 6 - stuff the last bit', 12),
    ('25', 'dec x 6', 6),
])
add('hode_ferdig',
    'Ikke klipp av trådenden. Trekk den forsiktig sammen gjennom de siste 6 maskene og bruk den samme '
    'trådenden til å feste hodet på kroppen senere (se montering). Hodet skal nå være fast og rundt, '
    'ca. 9 cm i diameter.',
    'Do not cut the yarn. Gently gather it through the last 6 stitches and use that same yarn tail to '
    'attach the head to the body later (see assembly). The head should now be firm and round, approx. '
    '9 cm in diameter.')

# ======================================================================
# SIDE 7: ANSIKTSFELTET OG SNUTEN
# ======================================================================
add('banner_snute', 'DEL 2: ANSIKTSFELTET OG SNUTEN', 'PART 2: THE FACE PATCH AND MUZZLE')
add('snute_lead',
    'Den lyse "masken" rundt Ellies snute er en egen flat del som sys oppå hodet. Den lille runde '
    'snuten sys så oppå igjen, midt i feltet. Begge deler hekles i kremhvitt.',
    "The light coloured 'mask' around Ellie's muzzle is a separate flat piece sewn onto the head. The "
    "small round muzzle is then sewn on top of that, right in the middle of the patch. Both pieces "
    "are crocheted in cream.")
add('pill_ansiktsfelt', 'ANSIKTSFELTET (KREMHVITT)', 'THE FACE PATCH (CREAM)')
add('ansiktsfelt_rows', [
    ('1', '6 fm i magisk ring', 6),
    ('2', 'økn x 6', 12),
    ('3', '(1 fm, økn) x 6', 18),
    ('4', '(2 fm, økn) x 6', 24),
    ('5', '(3 fm, økn) x 6', 30),
    ('6', '(4 fm, økn) x 6', 36),
])
add('ansiktsfelt_rows_en', [
    ('1', '6 sc in a magic ring', 6),
    ('2', 'inc x 6', 12),
    ('3', '(1 sc, inc) x 6', 18),
    ('4', '(2 sc, inc) x 6', 24),
    ('5', '(3 sc, inc) x 6', 30),
    ('6', '(4 sc, inc) x 6', 36),
])
add('ansiktsfelt_ferdig',
    'Avslutt og klipp av, la ca. 20 cm tråd igjen. Ikke fyll denne delen, den skal ligge flat. Sy den '
    'flatt fast på nedre halvdel av hodet, fra litt over midten og ned mot haken, så den danner en lys '
    'oval "maske".',
    'Fasten off, leaving a tail of approx. 20 cm. Do not stuff this piece, it should lie flat. Sew it '
    'flat onto the lower half of the head, from just above the middle down towards the chin, so it '
    'forms a light oval "mask".')
add('pill_snuten', 'SNUTEN (KREMHVIT)', 'THE MUZZLE (CREAM)')
add('snuten_rows', [
    ('1', '6 fm i magisk ring', 6),
    ('2', 'økn x 6', 12),
    ('3', '(1 fm, økn) x 6', 18),
    ('4 til 5', '18 fm, 2 omganger', 18),
])
add('snuten_rows_en', [
    ('1', '6 sc in a magic ring', 6),
    ('2', 'inc x 6', 12),
    ('3', '(1 sc, inc) x 6', 18),
    ('4 to 5', '18 sc, 2 rounds', 18),
])
add('snuten_ferdig',
    'Avslutt og klipp av, la ca. 20 cm tråd igjen. Stopp en liten dott fyll inn i snuten så den blir '
    'lett høy og rund, og sy den fast midt nederst i ansiktsfeltet.',
    'Fasten off, leaving a tail of approx. 20 cm. Tuck a small bit of stuffing into the muzzle so it '
    'is gently domed, and sew it in place in the lower centre of the face patch.')

# ======================================================================
# SIDE 8: ØRENE
# ======================================================================
add('banner_orer', 'DEL 3: ØRENE (2 STK)', 'PART 3: THE EARS (MAKE 2)')
add('orer_lead',
    'Hvert øre hekles i to lag: en stor sirkel i brunt (utsiden) og en mindre sirkel i kremhvitt '
    '(innsiden), som sys sammen. Hekle to av hver.',
    'Each ear is crocheted in two layers: a big circle in brown (the outside) and a smaller circle in '
    'cream (the inside), which are sewn together. Crochet two of each.')
add('pill_ore_ute', 'YTTERSIDEN (BRUNT) - HEKLE 2', 'THE OUTSIDE (BROWN) - MAKE 2')
add('ore_ute_rows', [
    ('1', '6 fm i magisk ring', 6),
    ('2', 'økn x 6', 12),
    ('3', '(1 fm, økn) x 6', 18),
    ('4', '(2 fm, økn) x 6', 24),
    ('5', '(3 fm, økn) x 6', 30),
    ('6', '30 fm', 30),
])
add('ore_ute_rows_en', [
    ('1', '6 sc in a magic ring', 6),
    ('2', 'inc x 6', 12),
    ('3', '(1 sc, inc) x 6', 18),
    ('4', '(2 sc, inc) x 6', 24),
    ('5', '(3 sc, inc) x 6', 30),
    ('6', '30 sc', 30),
])
add('pill_ore_inne', 'INNSIDEN (KREMHVIT) - HEKLE 2', 'THE INSIDE (CREAM) - MAKE 2')
add('ore_inne_rows', [
    ('1', '6 fm i magisk ring', 6),
    ('2', 'økn x 6', 12),
    ('3', '(1 fm, økn) x 6', 18),
    ('4', '(2 fm, økn) x 6', 24),
])
add('ore_inne_rows_en', [
    ('1', '6 sc in a magic ring', 6),
    ('2', 'inc x 6', 12),
    ('3', '(1 sc, inc) x 6', 18),
    ('4', '(2 sc, inc) x 6', 24),
])
add('orer_ferdig',
    'Klipp av begge delene, la ca. 20 cm tråd igjen. Ikke fyll ørene, de skal være flate. Legg den '
    'kremhvite sirkelen midt oppå den brune og sy den fast med heftesting, så det står en jevn brun '
    'kant rundt. Brett hvert øre lett sammen forfra og bakover (en liten fold nederst) før du syr det '
    'fast på hodet, det gir den myke, litt bøyde formen.',
    'Cut both pieces, leaving a tail of approx. 20 cm. Do not stuff the ears, they should be flat. '
    'Place the cream circle in the middle of the brown one and sew it on with running stitch, leaving '
    'an even brown rim showing. Fold each ear gently front to back (a small pinch at the bottom) '
    'before sewing it to the head, this gives the soft, slightly bent shape.')
add('orer_plassering',
    'Sy ørene ovenpå hodet, ett på hver side, litt bak midten, med god avstand mellom dem så de står '
    'oppreist og synlige forfra.',
    'Sew the ears on top of the head, one on each side, slightly behind the centre, with enough space '
    'between them so they stand up and are visible from the front.')

# ======================================================================
# SIDE 9: ANSIKTET
# ======================================================================
add('banner_ansikt', 'ANSIKTET', 'THE FACE')
add('ansikt_lead',
    'Ansiktet er det som gir Ellie liv. Ta deg god tid her, og prøv gjerne med knappenåler først før '
    'du syr eller fester noe fast.',
    "The face is what brings Ellie to life. Take your time here, and try pinning things in place with "
    "safety pins before you sew or fasten anything.")
add('pill_ojne', 'ØYNE - TO VERSJONER', 'EYES - TWO VERSIONS')
add('ojne_a_tit', 'Versjon A: sikkerhetsøyne (fra 3 år)', 'Version A: safety eyes (age 3+)')
add('ojne_a',
    'Bruk 16 mm sikkerhetsøyne. Sett dem inn ca. 2 cm fra hverandre, i overkanten av ansiktsfeltet, '
    'omtrent midt på hodet i høyden. Skyv baksiden godt på plass FØR du fyller hodet ferdig, så det '
    'ikke er mulig å trekke øyet ut igjen fra innsiden.',
    'Use 16 mm safety eyes. Insert them approx. 2 cm apart, at the top edge of the face patch, roughly '
    'in the middle of the head vertically. Push the backing washer firmly into place BEFORE you finish '
    'stuffing the head, so the eye cannot be pulled back out from the inside.')
add('ojne_b_tit', 'Versjon B: broderte øyne (babyvennlig, 0 år+)', 'Version B: embroidered eyes (baby-friendly, 0+)')
add('ojne_b',
    'For de aller minste: brodér øynene i stedet, med svart broderigarn. Sy en tett liten oval eller '
    'sirkel (satengsting) på hvert øyepunkt, og la en liten lys glimt stå ubrodert øverst i øyet for '
    'et levende uttrykk. Fest trådene ekstra godt inni hodet.',
    'For the very youngest: embroider the eyes instead, with black embroidery thread. Sew a small, '
    'dense oval or circle (satin stitch) at each eye point, leaving a tiny unstitched highlight near '
    'the top of the eye for a lively look. Fasten the threads extra securely inside the head.')
add('pill_resten', 'NESE, MUNN, VIPPER OG KINN', 'NOSE, MOUTH, LASHES AND CHEEKS')
add('ansikt_resten', [
    ('Nese', 'Brodér en liten svart trekant eller oval nese ovenfor midten av snuten, i tett '
     'satengsting.',
     'Nose', 'Embroider a small black triangle or oval nose above the centre of the muzzle, in dense '
     'satin stitch.'),
    ('Munn', 'Fra bunnen av nesen, brodér et lite "Y" eller smil nedover og ut til hver side i '
     'stikksom med svart tråd.',
     'Mouth', 'From the base of the nose, embroider a small "Y" or smile shape downward and out to '
     'each side in backstitch, using black thread.'),
    ('Vipper', 'Brodér 2 til 3 korte, buede sting med svart tråd over ytre hjørne av hvert øye, så '
     'Ellie får det myke, litt drømmende blikket.',
     'Lashes', 'Embroider 2 to 3 short, curved stitches with black thread above the outer corner of '
     'each eye, to give Ellie her soft, slightly dreamy look.'),
    ('Kinn', 'Hekle to små flate sirkler i pudderrosa (6 fm i magisk ring, avslutt), og sy dem lett '
     'fast på kinnene under hvert øye. Et alternativ er å borste litt tort rouge på kinnene, men da '
     'kan fargen falme i vask.',
     'Cheeks', 'Crochet two small flat circles in powder pink (6 sc in a magic ring, fasten off), and '
     'sew them lightly onto the cheeks below each eye. An alternative is to brush a little dry blusher '
     'onto the cheeks, but that colour can fade in the wash.'),
])
add('ansikt_bilde_caption',
    'Slik kan det ferdige ansiktet se ut: sikkerhetsøyne, brodert nese og munn, vipper og rosa kinn.',
    "This is roughly how the finished face can look: safety eyes, embroidered nose and mouth, lashes "
    "and pink cheeks.")

# ======================================================================
# SIDE 10: KROPPEN
# ======================================================================
add('banner_kropp', 'DEL 4: KROPPEN', 'PART 4: THE BODY')
add('kropp_lead',
    'Kroppen er liten og oval, akkurat stor nok til at Ellie kan sitte stødig. Hekles i brunt, med et '
    'eget magepanel i kremhvitt sydd på forsiden.',
    'The body is small and oval, just big enough for Ellie to sit steadily. Crocheted in brown, with '
    'a separate cream belly panel sewn onto the front.')
add('pill_kropp', 'KROPPEN (BRUNT)', 'THE BODY (BROWN)')
add('kropp_rows', [
    ('1', '6 fm i magisk ring', 6),
    ('2', 'økn x 6', 12),
    ('3', '(1 fm, økn) x 6', 18),
    ('4', '(2 fm, økn) x 6', 24),
    ('5', '(3 fm, økn) x 6', 30),
    ('6', '(4 fm, økn) x 6', 36),
    ('7 til 14', '36 fm, 8 omganger uten økning', 36),
    ('15', '(4 fm, mink) x 6', 30),
    ('16', '30 fm', 30),
    ('17', '(3 fm, mink) x 6 - fyll kroppen jevnt og godt nå', 24),
    ('18', '24 fm', 24),
    ('19', '(2 fm, mink) x 6', 18),
])
add('kropp_rows_en', [
    ('1', '6 sc in a magic ring', 6),
    ('2', 'inc x 6', 12),
    ('3', '(1 sc, inc) x 6', 18),
    ('4', '(2 sc, inc) x 6', 24),
    ('5', '(3 sc, inc) x 6', 30),
    ('6', '(4 sc, inc) x 6', 36),
    ('7 to 14', '36 sc, 8 rounds with no increases', 36),
    ('15', '(4 sc, dec) x 6', 30),
    ('16', '30 sc', 30),
    ('17', '(3 sc, dec) x 6 - stuff the body evenly and firmly now', 24),
    ('18', '24 sc', 24),
    ('19', '(2 sc, dec) x 6', 18),
])
add('kropp_ferdig',
    'Ikke klipp av. Kontroller at kroppen er godt og jevnt fylt (spesielt i bunnen, så Ellie sitter '
    'stødig), og bruk så den samme trådenden til å feste hodet oppå kroppen (se montering).',
    'Do not cut the yarn. Check that the body is filled evenly and firmly (especially at the bottom, '
    'so Ellie sits steadily), then use that same yarn tail to attach the head on top of the body (see '
    'assembly).')
add('pill_mage', 'MAGEPANELET (KREMHVITT)', 'THE BELLY PANEL (CREAM)')
add('mage_rows', [
    ('1', '6 fm i magisk ring', 6),
    ('2', 'økn x 6', 12),
    ('3', '(1 fm, økn) x 6', 18),
    ('4', '(2 fm, økn) x 6', 24),
    ('5', '(3 fm, økn) x 6', 30),
])
add('mage_rows_en', [
    ('1', '6 sc in a magic ring', 6),
    ('2', 'inc x 6', 12),
    ('3', '(1 sc, inc) x 6', 18),
    ('4', '(2 sc, inc) x 6', 24),
    ('5', '(3 sc, inc) x 6', 30),
])
add('mage_ferdig',
    'Avslutt og klipp av. Ikke fyll denne, den skal ligge flat. Sy magepanelet flatt fast på forsiden '
    'av kroppen, fra like under halsen og nedover.',
    'Fasten off. Do not stuff this piece, it should lie flat. Sew the belly panel flat onto the front '
    'of the body, from just below the neck and downward.')

# ======================================================================
# SIDE 11: ARMENE OG BENA
# ======================================================================
add('banner_lemmer', 'DEL 5: ARMENE OG BENA', 'PART 5: THE ARMS AND LEGS')
add('lemmer_lead',
    'Armene er korte og myke. Bena er litt lengre og fylles fastere, så Ellie står og sitter godt. '
    'Hver fot har en liten mørkebrun "klov" nederst.',
    "The arms are short and soft. The legs are a little longer and stuffed firmer, so Ellie sits and "
    "stands well. Each foot has a small dark brown 'hoof' at the base.")
add('pill_armer', 'ARMENE (BRUNT) - HEKLE 2', 'THE ARMS (BROWN) - MAKE 2')
add('armer_rows', [
    ('1', '6 fm i magisk ring', 6),
    ('2', 'økn x 6', 12),
    ('3 til 10', '12 fm, 8 omganger', 12),
])
add('armer_rows_en', [
    ('1', '6 sc in a magic ring', 6),
    ('2', 'inc x 6', 12),
    ('3 to 10', '12 sc, 8 rounds', 12),
])
add('armer_ferdig',
    'Klipp av, la ca. 20 cm tråd igjen. Fyll svakt og løst, armene skal være myke og litt bøyelige, '
    'ikke stive.',
    'Cut the yarn, leaving a tail of approx. 20 cm. Stuff lightly and loosely, the arms should be '
    'soft and a little floppy, not stiff.')
add('pill_bena', 'BENA (MØRKEBRUNT + BRUNT) - HEKLE 2', 'THE LEGS (DARK BROWN + BROWN) - MAKE 2')
add('bena_rows', [
    ('1', '6 fm i magisk ring, mørkebrunt (kloven)', 6),
    ('2', '6 fm mørkebrunt', 6),
    ('3', 'bytt til hovedbrunt: økn x 6', 12),
    ('4', '(1 fm, økn) x 6', 18),
    ('5 til 13', '18 fm, 9 omganger', 18),
])
add('bena_rows_en', [
    ('1', '6 sc in a magic ring, dark brown (the hoof)', 6),
    ('2', '6 sc dark brown', 6),
    ('3', 'switch to main brown: inc x 6', 12),
    ('4', '(1 sc, inc) x 6', 18),
    ('5 to 13', '18 sc, 9 rounds', 18),
])
add('bena_ferdig',
    'Klipp av, la ca. 20 cm tråd igjen. Fyll godt og fast, spesielt nederst, så bena kan bære '
    'kroppen når Ellie sitter.',
    'Cut the yarn, leaving a tail of approx. 20 cm. Stuff firmly, especially at the bottom, so the '
    'legs can support the body when Ellie is sitting.')

# ======================================================================
# SIDE 12: HALEN OG RYGGPRIKKENE
# ======================================================================
add('banner_hale', 'DEL 6: HALEN OG RYGGPRIKKENE', 'PART 6: THE TAIL AND BACK SPOTS')
add('pill_hale', 'HALEN', 'THE TAIL')
add('hale_rows', [
    ('1', '6 fm i magisk ring, kremhvitt', 6),
    ('2', 'bytt til hovedbrunt: økn x 6', 12),
    ('3', '(1 fm, økn) x 6', 18),
    ('4', '18 fm', 18),
    ('5', '(1 fm, mink) x 6', 12),
])
add('hale_rows_en', [
    ('1', '6 sc in a magic ring, cream', 6),
    ('2', 'switch to main brown: inc x 6', 12),
    ('3', '(1 sc, inc) x 6', 18),
    ('4', '18 sc', 18),
    ('5', '(1 sc, dec) x 6', 12),
])
add('hale_ferdig',
    'Klipp av, la ca. 20 cm tråd igjen. Fyll lett. Sy halen fast på ryggen, rett over der bena skal '
    'sitte, med den kremhvite runden pekende ned og litt bakover.',
    'Cut the yarn, leaving a tail of approx. 20 cm. Stuff lightly. Sew the tail onto the back, right '
    'above where the legs will sit, with the cream round facing down and slightly backward.')
add('pill_prikker', 'RYGGPRIKKENE (KREMHVITT, VALGFRITT ANTALL)', 'THE BACK SPOTS (CREAM, ANY NUMBER)')
add('prikker_txt',
    'Hekle 5 til 9 små sirkler i kremhvitt: 6 fm i magisk ring, avslutt (for de minste prikkene), '
    'eller 6 fm i magisk ring + 1 omgang økn x 6 = 12 m (for litt større prikker). Klipp av med god '
    'trådende, ikke fyll dem. Sy prikkene spredt over øvre del av ryggen, gjerne flest ovenfor og '
    'færre nedover, akkurat som ekte dådyrflekker.',
    'Crochet 5 to 9 small circles in cream: 6 sc in a magic ring, fasten off (for the smallest spots), '
    'or 6 sc in a magic ring + 1 round of inc x 6 = 12 sts (for slightly bigger spots). Cut with a '
    'long tail, do not stuff them. Sew the spots scattered across the upper back, with more spots '
    'higher up and fewer further down, just like a real fawn.')
add('prikker_bilde_caption',
    'Ryggprikkene og halen sett bakfra.', 'The back spots and tail seen from behind.')

# ======================================================================
# SIDE 13: SLØYFEN
# ======================================================================
add('banner_sloyfe', 'DEL 7: SLØYFEN (AVTAKBAR)', 'PART 7: THE BOW (REMOVABLE)')
add('sloyfe_lead',
    'Sløyfen er avtakbar, slik at en voksen kan bytte den ut med en annen farge, eller ta den av under '
    'stell. Den hekles frem og tilbake, ikke i spiral. Bruk pudderrosa (eller en annen farge du liker).',
    "The bow is removable, so an adult can swap it for a different colour, or take it off during "
    "washing. It is crocheted back and forth, not in a spiral. Use powder pink (or any colour you "
    "like).")
add('pill_sloyfebiter', 'TO LIKE REKTANGLER', 'TWO MATCHING RECTANGLES')
add('sloyfe_rows', [
    ('1', '12 lm + 1 vendemaske', 12),
    ('2 til 8', 'fm i hver maske tilbake, 7 omganger', 12),
])
add('sloyfe_rows_en', [
    ('1', '12 ch + 1 turning chain', 12),
    ('2 to 8', 'sc in each stitch back across, 7 rows', 12),
])
add('sloyfe_biter_ferdig',
    'Hekle to like rektangler slik. Klipp av med god trådende på begge.',
    'Crochet two matching rectangles like this. Cut with a long tail on both.')
add('pill_sloyfe_sy', 'SY SAMMEN TIL SLØYFE', 'SEW INTO A BOW')
add('sloyfe_steg', [
    'Legg de to rektanglene oppå hverandre og brett begge kortendene inn mot midten, så det blir en '
    'liten sløyfeform.',
    'Sy et lite stykke garn stramt rundt midten flere ganger, så sløyfen snores sammen der.',
    'Hekle en smal strimmel (ca. 6 lm + 1 omgang fm) og sy den rundt midjen av sløyfen, over knuten, '
    'for et pent utseende.',
    'Hekle en liten løkke (kjed på ca. 8 lm, lukk til ring med en kjedemaske) og sy den godt fast på '
    'baksiden av sløyfen.',
]
, )
add('sloyfe_steg_en', [
    'Lay the two rectangles on top of each other and fold both short ends in towards the middle, so '
    'it forms a small bow shape.',
    'Wrap a short length of yarn tightly around the centre a few times, to cinch the bow together '
    'there.',
    'Crochet a narrow strip (approx. 6 ch + 1 row of sc) and sew it around the waist of the bow, over '
    'the knot, for a neat finish.',
    'Crochet a small loop (a chain of approx. 8 ch, closed into a ring with a slip stitch) and sew it '
    'securely onto the back of the bow.',
])
add('pill_sloyfe_feste', 'FESTEKNAPPEN PÅ HODET', 'THE ATTACHMENT TAB ON THE HEAD')
add('sloyfe_feste',
    'Hekle en liten flat "knapp": 6 fm i magisk ring, avslutt. Sy den godt og fast mellom ørene på '
    'hodet, med mange sting så den ikke kan løsne. Tre sløyfens løkke over denne knappen, som en løkke '
    'over en toppeknapp. Sløyfen sitter nå godt fast under lek, men en voksen kan lofte løkken av og '
    'bytte sløyfen ved behov. Sy ALDRI på losfor små deler (perler, band, metallspenner) direkte på '
    'sløyfen, det er ikke trygt for småbarn.',
    'Crochet a small flat "tab": 6 sc in a magic ring, fasten off. Sew it firmly onto the head between '
    "the ears, with plenty of stitches so it cannot come loose. Slip the bow's loop over this tab, "
    "like a loop over a toggle button. The bow now stays firmly in place during play, but an adult can "
    "lift the loop off and swap the bow when needed. NEVER sew loose small parts (beads, ribbon, metal "
    "clasps) directly onto the bow, that is not safe for small children.")

# ======================================================================
# SIDE 14: MONTERING
# ======================================================================
add('banner_montering', 'MONTERING', 'ASSEMBLY')
add('montering_lead',
    'Nå skal alle delene bli til Ellie. Bruk knappenåler til å prøve plasseringen først, så syr du for '
    'godt til slutt. Alt sys fast med tett heftesting eller stikksom og god, tvinnet tråd, ingenting '
    'limes.',
    'Now all the pieces become Ellie. Use safety pins to test the placement first, then sew everything '
    'firmly at the end. Everything is sewn on with tight running stitch or backstitch and strong, '
    'twisted thread, nothing is glued.')
add('montering_steg', [
    'Sy magepanelet fast på forsiden av kroppen (hvis ikke gjort allerede).',
    'Sy bena fast under kroppen, ca. 1 til 2 cm fra hverandre, så Ellie står stødig når hun sitter.',
    'Sy armene fast på hver side av kroppen, litt nedenfor der halsen skal være.',
    'Sy ansiktsfeltet og snuten fast på hodet (hvis ikke gjort allerede), og sett inn øyne, nese, munn, '
    'vipper og kinn (se side om ansiktet).',
    'Sy hodet fast oppå kroppen, midt over halsen. Sjekk at hodet sitter rett frem før du syr helt '
    'ferdig.',
    'Sy ørene fast oppå hodet, ett på hver side (se side om ører for plassering).',
    'Sy halen fast på ryggen, rett over bena.',
    'Sy ryggprikkene fast, spredt over øvre del av ryggen.',
    'Hekle og fest sløyfeknappen mellom ørene, og tre på sløyfen til slutt.',
])
add('montering_steg_en', [
    'Sew the belly panel onto the front of the body (if not already done).',
    'Sew the legs onto the bottom of the body, approx. 1 to 2 cm apart, so Ellie sits steadily.',
    'Sew the arms onto each side of the body, a little below where the neck will be.',
    'Sew the face patch and muzzle onto the head (if not already done), and add the eyes, nose, mouth, '
    'lashes and cheeks (see the face page).',
    "Sew the head onto the body, centred over the neck. Check that the head faces forward before you "
    "sew it on completely.",
    'Sew the ears onto the head, one on each side (see the ears page for placement).',
    'Sew the tail onto the back, right above the legs.',
    'Sew the back spots on, scattered across the upper back.',
    'Crochet and attach the bow tab between the ears, then slip the bow on last.',
])

# ======================================================================
# SIDE 15: ETTERARBEID, SIKKERHET OG STELL
# ======================================================================
add('banner_sikkerhet', 'ETTERARBEID, SIKKERHET OG STELL', 'FINISHING, SAFETY AND CARE')
add('pill_etterarbeid', 'HELT TIL SLUTT', 'FINISHING TOUCHES')
add('etterarbeid', [
    'Fest alle løse tråder godt på innsiden av delene: vev dem frem og tilbake gjennom noen masker med '
    'stoppenålen, og klipp av det som er igjen.',
    'Se over alle sømmer. Er noen masker løse eller har hull, sy over med noen ekstra sting.',
    'Klipp bort eventuelle lo/loer fra garnet forsiktig med en liten saks.',
]
,)
add('etterarbeid_en', [
    'Fasten every loose end securely on the inside of the pieces: weave it back and forth through a '
    'few stitches with the yarn needle, then trim what is left.',
    'Check over every seam. If any stitches are loose or there are gaps, sew over them with a few '
    'extra stitches.',
    'Carefully trim away any loose fuzz from the yarn with small scissors.',
])
add('pill_sikkerhet', 'SIKKERHET', 'SAFETY')
add('sikkerhet_txt', [
    'Ingen deler limes, alt sys godt fast med tett tråd. Dobbeltsjekk sømmene på øyne, nese, ører, '
    'armer og ben, dette er stedene som får mest drahjelp under lek.',
    'Bruker du sikkerhetsøyne (versjon A), er Ellie beregnet for barn fra 3 år, siden smådeler kan '
    'løsne over tid ved hard bruk. For de aller minste, bruk versjon B med broderte øyne i stedet.',
    'Vask alltid gamle sømmer og fest på nytt hvis du ser tegn til slitasje. Kast Ellie hvis fyll '
    'begynner å komme ut, eller hvis en del løsner og ikke kan syes trygt fast igjen.',
    'La aldri et lite barn leke uten tilsyn med små deler som sløyfeknappen. Sløyfen er ment å byttes '
    'av en voksen, ikke å løses av barnet selv.',
]
,)
add('sikkerhet_txt_en', [
    'No parts are glued, everything is sewn securely with strong thread. Double-check the seams on the '
    'eyes, nose, ears, arms and legs, these are the spots that get the most tugging during play.',
    'If you use safety eyes (version A), Ellie is intended for children aged 3 and up, since small '
    'parts can loosen over time with heavy use. For the very youngest, use version B with embroidered '
    'eyes instead.',
    'Always check old seams and re-sew them if you see signs of wear. Retire Ellie if stuffing starts '
    'to come out, or if a piece comes loose and cannot be sewn safely back on.',
    'Never let a small child play unsupervised with small parts such as the bow tab. The bow is meant '
    'to be swapped by an adult, not removed by the child.',
])
add('pill_stell', 'VASK OG STELL', 'WASHING AND CARE')
add('stell_txt',
    'Handvask i lunkent vann med litt mild sape, eller vask på 30 grader i vaskepose. Klem forsiktig '
    'ut vannet i et handkle, ikke vri. Form Ellie pent og legg henne til tørk flatt, gjerne med litt '
    'ekstra fyll dyttet på plass mens hun er fuktig.',
    'Hand wash in lukewarm water with a little mild soap, or machine wash at 30 degrees in a wash bag. '
    'Gently press out the water in a towel, do not wring. Reshape Ellie neatly and lay her flat to dry, '
    'pushing a little extra stuffing back into place while she is still damp.')

# ======================================================================
# SIDE 16: FERDIG
# ======================================================================
add('banner_ferdig', 'GRATULERER, ELLIE ER FERDIG!', 'CONGRATULATIONS, ELLIE IS DONE!')
add('ferdig_txt',
    'Nå har du heklet din helt egen Ellie, det lille dådyret. Vis henne gjerne frem i #lmebabycollection, '
    'jeg elsker å se hva dere skaper!',
    "Now you have crocheted your very own Ellie, the little fawn. Feel free to show her off in "
    "#lmebabycollection, I love seeing what you make!")
add('pill_kolleksjon', 'RESTEN AV LME BABY COLLECTION', 'THE REST OF THE LME BABY COLLECTION')
add('kolleksjon_lead',
    'Ellie er den første i "Woodland Dreams", en hel liten samling i samme uttrykk, garnvalg og '
    'fargepalett:',
    'Ellie is the first in "Woodland Dreams", a whole little collection in the same look, yarn '
    'choice and colour palette:')
add('kolleksjon_liste',
    ['Pip, det lille pinnsvinet', 'Felix, den lille reven', 'Molly, det lille lammet',
     'Luna, den lille kaninen', 'Oliver, den lille bjørnen', 'Ellies smokkelenke',
     'Pips smokkelenke', "Felix' smokkelenke", 'Mollys smokkelenke', 'Lunas smokkelenke',
     'Olivers smokkelenke', 'Ellies rangle', 'Pips rangle', "Felix' rangle", 'Mollys rangle',
     'Lunas rangle', 'Olivers rangle', 'Ellies vognlenke', 'Pips vognlenke',
     "Felix' vognlenke", 'Mollys vognlenke', 'Lunas vognlenke', 'Olivers vognlenke',
     'Ellies ballerinasko', 'Ellies aktivitetsleke'],
    ['Pip, the little hedgehog', 'Felix, the little fox', 'Molly, the little lamb',
     'Luna, the little bunny', 'Oliver, the little bear', "Ellie's pacifier clip",
     "Pip's pacifier clip", "Felix's pacifier clip", "Molly's pacifier clip",
     "Luna's pacifier clip", "Oliver's pacifier clip", "Ellie's rattle", "Pip's rattle",
     "Felix's rattle", "Molly's rattle", "Luna's rattle", "Oliver's rattle",
     "Ellie's stroller toy", "Pip's stroller toy", "Felix's stroller toy",
     "Molly's stroller toy", "Luna's stroller toy", "Oliver's stroller toy",
     "Ellie's ballerina shoes", "Ellie's activity toy"])
add('pill_copyright', 'COPYRIGHT', 'COPYRIGHT')
add('copyright_txt',
    'Denne oppskriften er et helt originalt LME-design (c) Renate Dahl, Little Montessori Explorers. '
    'Du kan gjerne selge amigurumier du hekler etter denne oppskriften i din egen, lille skala. '
    'Oppskriften i seg selv, teksten og bildene, skal ikke deles, kopieres eller videreselges.',
    '(c) Renate Dahl, Little Montessori Explorers. This pattern is a fully original LME design. You '
    'are welcome to sell finished amigurumi you make from this pattern, on a small personal scale. '
    'The pattern itself, its text and images, may not be shared, copied or resold.')

# ======================================================================
# SVG-illustrasjoner
# ======================================================================

def schematic(lang):
    ah = 'ah'
    txt = {
        'height': {'no': 'h. ca. 18-20 cm', 'en': 'h. approx. 18-20 cm'},
        'width': {'no': 'br. ca. 12 cm', 'en': 'w. approx. 12 cm'},
        'head': {'no': '1. hodet', 'en': '1. head'},
        'ears': {'no': '2. ørene', 'en': '2. ears'},
        'body': {'no': '3. kroppen', 'en': '3. body'},
        'arms': {'no': '4. armene', 'en': '4. arms'},
        'legs': {'no': '5. bena', 'en': '5. legs'},
        'tail': {'no': '6. halen', 'en': '6. tail'},
    }
    def t(k): return html.escape(txt[k][lang])
    return f'''
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 520 380" style="width:100%">
  <defs>
    <marker id="{ah}" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">
      <path d="M0,0 L8,4 L0,8 z" fill="#8a8a8a"/>
    </marker>
  </defs>
  <line x1="60" y1="30" x2="60" y2="330" stroke="#8a8a8a" stroke-width="2" marker-start="url(#{ah})" marker-end="url(#{ah})"/>
  <text x="40" y="180" text-anchor="middle" font-size="14" font-family="sans-serif" fill="#666" transform="rotate(-90 40 180)">{t('height')}</text>
  <ellipse cx="260" cy="90" rx="34" ry="26" fill="{BROWN_MID}" stroke="{BROWN_DARK}" stroke-width="2"/>
  <ellipse cx="222" cy="62" rx="17" ry="24" fill="{BROWN_MID}" stroke="{BROWN_DARK}" stroke-width="2"/>
  <ellipse cx="222" cy="62" rx="9" ry="15" fill="{CREAM}"/>
  <ellipse cx="298" cy="62" rx="17" ry="24" fill="{BROWN_MID}" stroke="{BROWN_DARK}" stroke-width="2"/>
  <ellipse cx="298" cy="62" rx="9" ry="15" fill="{CREAM}"/>
  <ellipse cx="260" cy="103" rx="24" ry="16" fill="{CREAM}"/>
  <circle cx="248" cy="88" r="4" fill="#3a2a1e"/>
  <circle cx="272" cy="88" r="4" fill="#3a2a1e"/>
  <ellipse cx="260" cy="220" rx="46" ry="52" fill="{BROWN}" stroke="{BROWN_DARK}" stroke-width="2"/>
  <ellipse cx="260" cy="222" rx="22" ry="34" fill="{CREAM}"/>
  <ellipse cx="205" cy="205" rx="13" ry="34" fill="{BROWN}" stroke="{BROWN_DARK}" stroke-width="2" transform="rotate(-14 205 205)"/>
  <ellipse cx="315" cy="205" rx="13" ry="34" fill="{BROWN}" stroke="{BROWN_DARK}" stroke-width="2" transform="rotate(14 315 205)"/>
  <ellipse cx="228" cy="298" rx="15" ry="34" fill="{BROWN}" stroke="{BROWN_DARK}" stroke-width="2"/>
  <ellipse cx="228" cy="326" rx="15" ry="10" fill="{BROWN_DARK}"/>
  <ellipse cx="292" cy="298" rx="15" ry="34" fill="{BROWN}" stroke="{BROWN_DARK}" stroke-width="2"/>
  <ellipse cx="292" cy="326" rx="15" ry="10" fill="{BROWN_DARK}"/>
  <ellipse cx="330" cy="255" rx="13" ry="17" fill="{BROWN}" stroke="{BROWN_DARK}" stroke-width="2"/>
  <ellipse cx="332" cy="262" rx="6" ry="8" fill="{CREAM}"/>
  <line x1="120" y1="30" x2="400" y2="30" stroke="#8a8a8a" stroke-width="2" marker-start="url(#{ah})" marker-end="url(#{ah})"/>
  <text x="260" y="20" text-anchor="middle" font-size="14" font-family="sans-serif" fill="#666">{t('width')}</text>
  <text x="452" y="65" font-size="13" font-family="sans-serif" fill="#555">{t('ears')}</text>
  <line x1="448" y1="61" x2="310" y2="60" stroke="#bbb" stroke-width="1.5"/>
  <text x="452" y="95" font-size="13" font-family="sans-serif" fill="#555">{t('head')}</text>
  <line x1="448" y1="91" x2="292" y2="90" stroke="#bbb" stroke-width="1.5"/>
  <text x="452" y="222" font-size="13" font-family="sans-serif" fill="#555">{t('body')}</text>
  <line x1="448" y1="218" x2="304" y2="218" stroke="#bbb" stroke-width="1.5"/>
  <text x="452" y="200" font-size="13" font-family="sans-serif" fill="#555">{t('arms')}</text>
  <line x1="448" y1="196" x2="322" y2="196" stroke="#bbb" stroke-width="1.5"/>
  <text x="452" y="300" font-size="13" font-family="sans-serif" fill="#555">{t('legs')}</text>
  <line x1="448" y1="296" x2="304" y2="296" stroke="#bbb" stroke-width="1.5"/>
  <text x="452" y="258" font-size="13" font-family="sans-serif" fill="#555">{t('tail')}</text>
  <line x1="448" y1="254" x2="342" y2="255" stroke="#bbb" stroke-width="1.5"/>
</svg>'''

def face_diagram(lang):
    return f'''
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 280" style="width:78mm">
  <circle cx="150" cy="130" r="115" fill="{BROWN_MID}" stroke="{BROWN_DARK}" stroke-width="2.5"/>
  <ellipse cx="150" cy="185" rx="82" ry="78" fill="{CREAM}" opacity="0.95"/>
  <ellipse cx="150" cy="205" rx="42" ry="30" fill="{CREAM_DEEP}" stroke="#e3d2b8" stroke-width="1.5"/>
  <circle cx="103" cy="150" r="15" fill="#fff" stroke="{BROWN_DARK}" stroke-width="2" stroke-dasharray="3 3"/>
  <circle cx="197" cy="150" r="15" fill="#fff" stroke="{BROWN_DARK}" stroke-width="2" stroke-dasharray="3 3"/>
  <circle cx="103" cy="150" r="8" fill="#241a12"/>
  <circle cx="197" cy="150" r="8" fill="#241a12"/>
  <circle cx="106" cy="147" r="2.4" fill="#fff"/>
  <circle cx="200" cy="147" r="2.4" fill="#fff"/>
  <path d="M85,132 Q95,124 112,130" stroke="#241a12" stroke-width="2.4" fill="none" stroke-linecap="round"/>
  <path d="M215,132 Q205,124 188,130" stroke="#241a12" stroke-width="2.4" fill="none" stroke-linecap="round"/>
  <ellipse cx="150" cy="200" rx="14" ry="9" fill="#241a12"/>
  <path d="M150,209 Q140,222 128,218 M150,209 Q160,222 172,218" stroke="#241a12" stroke-width="2.2" fill="none" stroke-linecap="round"/>
  <circle cx="112" cy="182" r="9" fill="{ROSE}" opacity="0.55"/>
  <circle cx="188" cy="182" r="9" fill="{ROSE}" opacity="0.55"/>
  <ellipse cx="72" cy="70" rx="9" ry="7" fill="{CREAM}"/>
  <ellipse cx="150" cy="52" rx="8" ry="6" fill="{CREAM}"/>
  <ellipse cx="228" cy="70" rx="9" ry="7" fill="{CREAM}"/>
</svg>'''

# ======================================================================
# CSS / sidemal (delt for begge sprak)
# ======================================================================

def page(body, num, right_label, ph2):
    return f'''<div class="page">
  <div class="band"><span>LITTLE MONTESSORI EXPLORERS</span></div>
  <div class="rside"><span>{right_label}</span></div>
  <div class="phead">
    <div class="ph1">LITTLE MONTESSORI EXPLORERS</div>
    <div class="ph2">{ph2}</div>
  </div>
  <div class="content">{body}</div>
  <div class="pfoot">&mdash;&nbsp;{num}&nbsp;&mdash;</div>
</div>'''

def banner(t):     return f'<div class="banner"><h1>{t}</h1></div>'
def rosep(t):       return f'<div class="pillwrap"><div class="pill rosepill">{t}</div></div>'
def sagep(t):      return f'<div class="pillwrap"><div class="pill sagepill">{t}</div></div>'
def card(inner):   return f'<div class="card">{inner}</div>'
def cream(inner):  return f'<div class="cream">{inner}</div>'
def ul(items):     return '<ul class="dots">' + ''.join(f'<li>{i}</li>' for i in items) + '</ul>'
def steps(items, start=1):
    return '<ol class="steps">' + ''.join(
        f'<li><span class="snum">{start+i}</span><div>{t}</div></li>' for i, t in enumerate(items)) + '</ol>'
def otab(rows, head):
    h = '<tr><th>' + '</th><th>'.join(head) + '</th></tr>'
    body = ''.join('<tr><td><b>' + str(a) + '</b></td><td>' + b + '</td><td>' + str(c) + '</td></tr>' for a, b, c in rows)
    return '<table class="t">' + h + body + '</table>'
def cme(t): return cream('<p class="creamtitle">' + t + '</p>')

CSS = f'''
@font-face {{ font-family:'Sasson Montessori'; src:url('fonts/SassoonMontessori.ttf'); font-weight:normal; }}
@font-face {{ font-family:'Playpen Sans'; src:url('fonts/PlaypenSans-400.ttf'); font-weight:400; }}
@font-face {{ font-family:'Playpen Sans'; src:url('fonts/PlaypenSans-600.ttf'); font-weight:600; }}
@font-face {{ font-family:'Playpen Sans'; src:url('fonts/PlaypenSans-700.ttf'); font-weight:700; }}
@font-face {{ font-family:'Playpen Sans'; src:url('fonts/PlaypenSans-800.ttf'); font-weight:800; }}
* {{ margin:0; padding:0; box-sizing:border-box; }}
:root {{
  --font-head:'Playpen Sans',system-ui,sans-serif;
  --font-body:'Sasson Montessori','Playpen Sans',system-ui,sans-serif;
}}
@page {{ size:A4; margin:0; }}
body {{ font-family:var(--font-body); color:#4a4a4a; }}
.page {{
  position:relative; width:210mm; height:296.5mm; overflow:hidden;
  page-break-after:always;
  background:
    repeating-linear-gradient(0deg, rgba(255,255,255,.45) 0, rgba(255,255,255,.45) .4mm, transparent .4mm, transparent 8mm),
    repeating-linear-gradient(90deg, rgba(255,255,255,.45) 0, rgba(255,255,255,.45) .4mm, transparent .4mm, transparent 8mm),
    linear-gradient(165deg,#f3e8d8 0%,#f6ecec 45%,#f3dde6 100%);
}}
.band {{ position:absolute; left:0; top:0; bottom:0; width:11mm;
  background:linear-gradient(180deg,{BROWN_MID},{ROSE}); }}
.band span {{ position:absolute; left:50%; top:75%; transform:translate(-50%,-50%);
  writing-mode:vertical-rl; text-orientation:mixed; rotate:180deg;
  font-family:var(--font-head); font-size:6.5pt; letter-spacing:3.5px; color:#fff; white-space:nowrap; }}
.rside {{ position:absolute; right:2.5mm; top:40%; }}
.rside span {{ writing-mode:vertical-rl; font-family:var(--font-head); font-size:6pt;
  letter-spacing:2.5px; color:#9a9a9a; white-space:nowrap; }}
.phead {{ text-align:center; padding-top:9mm; }}
.ph1 {{ font-family:var(--font-head); font-weight:600; font-size:7pt; letter-spacing:4px; color:#8a7460; }}
.ph2 {{ font-family:var(--font-head); font-weight:600; font-size:6.3pt; letter-spacing:2.4px; color:{ROSE}; margin-top:1.6mm; }}
.content {{ padding:5mm 16mm 0 20mm; }}
.pfoot {{ position:absolute; bottom:6.5mm; left:0; right:0; text-align:center;
  font-family:var(--font-head); font-weight:700; font-size:10pt; color:#8a8a8a; }}

.banner {{ background:#f5e5b2; border-radius:14px; padding:3.6mm 6mm; margin:2mm 0 4.5mm;
  box-shadow:0 1px 4px rgba(0,0,0,.08); text-align:center; }}
.banner h1 {{ font-family:var(--font-head); font-weight:800; font-size:16.5pt; color:{INK};
  letter-spacing:.4px; text-transform:uppercase; }}
.pillwrap {{ text-align:center; margin:4.5mm 0 3mm; }}
.pill {{ display:inline-block; border-radius:999px; padding:2.4mm 9mm;
  font-family:var(--font-head); font-weight:700; font-size:10.5pt; color:#fff;
  letter-spacing:.4px; text-transform:uppercase; box-shadow:0 1px 4px rgba(0,0,0,.12); }}
.rosepill {{ background:{ROSE}; }}
.sagepill {{ background:{SAGE}; }}
.card {{ background:rgba(255,255,255,.93); border:2px solid #ecd2c0; border-radius:16px;
  padding:4mm 6mm; margin:0 0 4mm; box-shadow:0 1px 5px rgba(0,0,0,.06); }}
.cream {{ background:#fbf3e8; border:2px solid #ecd2c0; border-radius:16px;
  padding:4mm 6mm; margin:4mm 0; text-align:center; }}
.creamtitle {{ font-family:var(--font-head); font-weight:700; font-size:11pt; color:{SAGE}; }}
p {{ font-size:10.6pt; line-height:1.52; margin-bottom:2.2mm; }}
p.small, .small {{ font-size:9.5pt; color:#777; }}
p.center {{ text-align:center; }}
ul.dots {{ list-style:none; }}
ul.dots li {{ font-size:10.6pt; line-height:1.48; padding-left:5.5mm; position:relative; margin:1.6mm 0; }}
ul.dots li::before {{ content:'•'; position:absolute; left:1mm; color:{ROSE}; font-weight:bold; }}
ol.steps {{ list-style:none; }}
ol.steps li {{ display:flex; gap:3.5mm; align-items:flex-start; background:rgba(255,255,255,.93);
  border:2px solid #ecd2c0; border-radius:14px; padding:3mm 5mm; margin-bottom:2.4mm; }}
ol.steps li div {{ font-size:10.4pt; line-height:1.46; }}
.snum {{ flex:0 0 auto; width:7.5mm; height:7.5mm; border-radius:50%; background:{ROSE}; color:#fff;
  font-family:var(--font-head); font-weight:700; font-size:11pt; display:flex;
  align-items:center; justify-content:center; margin-top:.5mm; }}
table.t {{ width:100%; border-collapse:collapse; margin:2.5mm 0; }}
table.t th {{ font-family:var(--font-head); font-weight:700; font-size:9.3pt; color:{ROSE};
  text-align:left; padding:1.5mm 2.5mm; border-bottom:2px solid #ecd2c0; }}
table.t td {{ font-size:9.7pt; padding:1.4mm 2.5mm; border-bottom:1px solid #f2e3d8; line-height:1.38; }}
table.tl td:first-child {{ white-space:nowrap; }}
.dot {{ display:inline-block; width:3.5mm; height:3.5mm; border-radius:50%; vertical-align:-0.5mm; margin-right:1.5mm; }}

.coverimg {{ text-align:center; margin:3mm 0 3mm; }}
.coverimg img {{ width:98mm; border-radius:14px; box-shadow:0 3px 10px rgba(0,0,0,.18);
  border:3mm solid #fff; }}
.covertag {{ text-align:center; font-family:var(--font-head); font-size:8pt; letter-spacing:2.6px;
  color:#8a8a8a; margin:1mm 0 2.5mm; }}
.coverbanner {{ display:flex; align-items:center; justify-content:center; gap:5mm;
  background:#f5e5b2; border-radius:16px; padding:3.4mm 6mm; box-shadow:0 1px 5px rgba(0,0,0,.1); }}
.covertitle {{ font-family:var(--font-head); font-weight:800; font-size:27pt; color:{INK}; letter-spacing:1px; }}
.subpill {{ margin:3.6mm auto; width:fit-content; background:#fdf9e3; border:2.5px solid {INK};
  border-radius:999px; padding:1.8mm 8mm; font-family:var(--font-head); font-weight:700;
  font-size:10pt; color:{INK}; letter-spacing:.4px; }}
.byline {{ text-align:center; margin-top:3.5mm; }}
.by1 {{ font-family:var(--font-head); font-weight:700; font-size:12.5pt; color:{SAGE}; }}
.by2 {{ font-size:10.2pt; color:#8a8a8a; margin-top:.8mm; }}
.by3 {{ font-family:var(--font-head); font-weight:600; font-size:9.6pt; color:{ROSE}; margin-top:.5mm; }}
.notecard {{ display:flex; gap:4mm; align-items:center; background:rgba(255,255,255,.8);
  border-radius:12px; padding:3.2mm 6mm; margin-top:4mm; }}
.notecard p {{ font-size:9.3pt; color:#777; margin:0; }}
.noteemo {{ font-size:16pt; }}

.twocol {{ display:flex; gap:6mm; align-items:flex-start; }}
.twocol > div {{ flex:1; }}
.figwrap {{ text-align:center; }}
.figwrap img {{ width:44mm; border-radius:12px; box-shadow:0 2px 6px rgba(0,0,0,.14); border:2mm solid #fff; }}
.figcap {{ font-size:9pt; color:#888; text-align:center; margin-top:1.5mm; }}
.schematic {{ margin:2mm 0 1mm; }}
.deler-grid {{ display:grid; grid-template-columns:1fr 1fr; gap:2.4mm 6mm; margin:1mm 0 2mm; }}
.deler-grid .di {{ font-size:10pt; line-height:1.4; padding:1.6mm 0; border-bottom:1px dashed #e6d3c4; }}
.deler-grid .di b {{ color:{SAGE}; font-family:var(--font-head); }}
'''

def doc(lang, pages):
    return f'''<!DOCTYPE html>
<html lang="{lang}"><head><meta charset="utf-8">
<title>{T['doctitle'][lang]}</title>
<style>{CSS}</style></head>
<body>{''.join(pages)}</body></html>'''

# ======================================================================
# Bygg sidene for et gitt sprak
# ======================================================================

def build(lang):
    RIGHT = {'no': 'LME HEKLING', 'en': 'LME CROCHET'}[lang]
    def t(key): return T[key][lang]
    PH2 = t('ph2')
    def pg(body, num): return page(body, num, RIGHT, PH2)
    pages = []

    # ---- SIDE 1: FORSIDE ----
    pages.append(pg(f'''
<div class="coverimg"><img src="{hero_src}" alt="Ellie, det lille dådyret"></div>
<div class="covertag">{t('covertag')}</div>
<div class="coverbanner"><h1 class="covertitle">{t('covertitle')}</h1></div>
<div class="subpill">{t('subpill')}</div>
{card('<p class="center">' + t('cover_desc') + '</p>')}
<div class="byline">
  <div class="by1">{t('by1')}</div>
  <div class="by2">{t('by2')}</div>
  <div class="by3">{t('by3')}</div>
</div>
<div class="notecard"><span class="noteemo">&#129717;</span><p><i>{t('cover_tip')}</i></p></div>
''', 1))

    # ---- SIDE 2: OM ELLIE ----
    stil_items = [f"<b>{a}</b> {b}" for (a, b, _, _) in T['om_stil']['no']] if lang == 'no' else \
                 [f"<b>{c}</b> {d}" for (_, _, c, d) in T['om_stil']['no']]
    pages.append(pg(f'''
{banner(t('banner_om'))}
{rosep(t('pill_historien'))}
{card('<p>' + t('om_historien') + '</p>')}
{sagep(t('pill_stil'))}
{card('<p>' + t('om_stil_lead') + '</p>' + ul(stil_items))}
{cme(t('om_ikke'))}
''', 2))

    # ---- SIDE 3: STØRRELSE OG MATERIALER ----
    garn_head = T['garn_tabell_head'][lang]
    if lang == 'no':
        garn_rows = [(r[0], r[1], r[2]) for r in T['garn_rows']['no']]
        utstyr = T['utstyr']['no']
    else:
        garn_rows = [(r[3], r[4], r[5]) for r in T['garn_rows']['no']]
        utstyr = T['utstyr_en']['no']
    garn_table = '<table class="t"><tr><th>' + '</th><th>'.join(garn_head) + '</th></tr>' + \
        ''.join(f'<tr><td>{a}</td><td>{b}</td><td>{c}</td></tr>' for a, b, c in garn_rows) + '</table>'
    utstyr_list = ul([f'<b>{a}</b>' + (f' &middot; {b}' if b else '') for a, b in utstyr])
    pages.append(pg(f'''
{banner(t('banner_mat'))}
{rosep(t('pill_storrelse'))}
{card('<p class="center"><b>' + t('storrelse_txt') + '</b></p>')}
{sagep(t('pill_garn'))}
{card('<p>' + t('garn_lead') + '</p>' + garn_table + '<p class="small">' + t('garn_alt') + '</p>')}
{rosep(t('pill_utstyr'))}
{card(utstyr_list)}
''', 3))

    # ---- SIDE 4: HEKLEFASTHET OG ORDLISTE ----
    ord_head = T['ord_head'][lang]
    if lang == 'no':
        ord_rows = [(r[0], r[1]) for r in T['ord_rows']['no']]
    else:
        ord_rows = [(r[2], r[3]) for r in T['ord_rows']['no']]
    ord_table = '<table class="t tl"><tr><th>' + '</th><th>'.join(ord_head) + '</th></tr>' + \
        ''.join(f'<tr><td><b>{a}</b></td><td>{b}</td></tr>' for a, b in ord_rows) + '</table>'
    pages.append(pg(f'''
{banner(t('banner_fasthet'))}
{rosep(t('pill_fasthet'))}
{card('<p>' + t('fasthet_txt') + '</p>')}
{sagep(t('pill_ordliste'))}
{card(ord_table)}
{cme(t('ord_note'))}
''', 4))

    # ---- SIDE 5: OVERSIKT ----
    if lang == 'no':
        deler = [(a, b) for (a, b, _, _) in T['oversikt_deler']['no']]
    else:
        deler = [(c, d) for (_, _, c, d) in T['oversikt_deler']['no']]
    deler_html = '<div class="deler-grid">' + ''.join(
        f'<div class="di"><b>{a}</b><br>{b}</div>' for a, b in deler) + '</div>'
    pages.append(pg(f'''
{banner(t('banner_oversikt'))}
{card('<p>' + t('oversikt_lead') + '</p>' + deler_html)}
<div class="schematic">{schematic(lang)}</div>
<p class="figcap center small">{t('schematic_caption')}</p>
''', 5))

    # ---- SIDE 6: HODET ----
    hode_rows = T['hode_rows']['no'] if lang == 'no' else T['hode_rows_en']['no']
    pages.append(pg(f'''
{banner(t('banner_hode'))}
<p>{t('hode_lead')}</p>
{card(otab(hode_rows, {'no': ['Omg', 'Beskrivelse', 'Masker'], 'en': ['Rnd', 'Description', 'Sts']}[lang]))}
{cme(t('hode_ferdig'))}
''', 6))

    # ---- SIDE 7: ANSIKTSFELT OG SNUTE ----
    af_rows = T['ansiktsfelt_rows']['no'] if lang == 'no' else T['ansiktsfelt_rows_en']['no']
    sn_rows = T['snuten_rows']['no'] if lang == 'no' else T['snuten_rows_en']['no']
    head3 = {'no': ['Omg', 'Beskrivelse', 'Masker'], 'en': ['Rnd', 'Description', 'Sts']}[lang]
    pages.append(pg(f'''
{banner(t('banner_snute'))}
<p>{t('snute_lead')}</p>
{rosep(t('pill_ansiktsfelt'))}
{card(otab(af_rows, head3))}
{cme(t('ansiktsfelt_ferdig'))}
{sagep(t('pill_snuten'))}
{card(otab(sn_rows, head3))}
{cme(t('snuten_ferdig'))}
''', 7))

    # ---- SIDE 8: ORER ----
    ou_rows = T['ore_ute_rows']['no'] if lang == 'no' else T['ore_ute_rows_en']['no']
    oi_rows = T['ore_inne_rows']['no'] if lang == 'no' else T['ore_inne_rows_en']['no']
    pages.append(pg(f'''
{banner(t('banner_orer'))}
<p>{t('orer_lead')}</p>
{rosep(t('pill_ore_ute'))}
{card(otab(ou_rows, head3))}
{sagep(t('pill_ore_inne'))}
{card(otab(oi_rows, head3))}
{cme(t('orer_ferdig'))}
<p class="small center">{t('orer_plassering')}</p>
''', 8))

    # ---- SIDE 9: ANSIKTET ----
    resten = T['ansikt_resten']['no'] if lang == 'no' else None
    if lang == 'no':
        resten_items = [f"<b>{a}:</b> {b}" for (a, b, _, _) in T['ansikt_resten']['no']]
    else:
        resten_items = [f"<b>{c}:</b> {d}" for (_, _, c, d) in T['ansikt_resten']['no']]
    pages.append(pg(f'''
{banner(t('banner_ansikt'))}
<p>{t('ansikt_lead')}</p>
<div class="twocol">
  <div>
    {rosep(t('pill_ojne'))}
    {card('<p><b>' + t('ojne_a_tit') + '</b><br>' + t('ojne_a') + '</p>'
          '<p style="margin-top:2.4mm"><b>' + t('ojne_b_tit') + '</b><br>' + t('ojne_b') + '</p>')}
  </div>
  <div class="figwrap">{face_diagram(lang)}</div>
</div>
{sagep(t('pill_resten'))}
{card(ul(resten_items))}
<div class="twocol">
  <div class="figwrap"><img src="{face_src}" alt="Ellie ansikt"><div class="figcap">{t('ansikt_bilde_caption')}</div></div>
  <div class="figwrap"><img src="{back_src}" alt="Ellie bakfra"><div class="figcap">{t('prikker_bilde_caption')}</div></div>
</div>
''', 9))

    # ---- SIDE 10: KROPPEN ----
    kr_rows = T['kropp_rows']['no'] if lang == 'no' else T['kropp_rows_en']['no']
    mg_rows = T['mage_rows']['no'] if lang == 'no' else T['mage_rows_en']['no']
    pages.append(pg(f'''
{banner(t('banner_kropp'))}
<p>{t('kropp_lead')}</p>
{rosep(t('pill_kropp'))}
{card(otab(kr_rows, head3))}
{cme(t('kropp_ferdig'))}
''', 10))

    # ---- SIDE 11: MAGEPANELET ----
    pages.append(pg(f'''
{banner(t('banner_kropp'))}
{sagep(t('pill_mage'))}
{card(otab(mg_rows, head3))}
{cme(t('mage_ferdig'))}
''', 11))

    # ---- SIDE 12: ARMER OG BEN ----
    ar_rows = T['armer_rows']['no'] if lang == 'no' else T['armer_rows_en']['no']
    be_rows = T['bena_rows']['no'] if lang == 'no' else T['bena_rows_en']['no']
    pages.append(pg(f'''
{banner(t('banner_lemmer'))}
<p>{t('lemmer_lead')}</p>
{rosep(t('pill_armer'))}
{card(otab(ar_rows, head3))}
{cme(t('armer_ferdig'))}
{sagep(t('pill_bena'))}
{card(otab(be_rows, head3))}
{cme(t('bena_ferdig'))}
''', 12))

    # ---- SIDE 13: HALE OG PRIKKER ----
    ha_rows = T['hale_rows']['no'] if lang == 'no' else T['hale_rows_en']['no']
    pages.append(pg(f'''
{banner(t('banner_hale'))}
{rosep(t('pill_hale'))}
{card(otab(ha_rows, head3))}
{cme(t('hale_ferdig'))}
{sagep(t('pill_prikker'))}
{card('<p>' + t('prikker_txt') + '</p>')}
''', 13))

    # ---- SIDE 14: SLØYFE ----
    sl_rows = T['sloyfe_rows']['no'] if lang == 'no' else T['sloyfe_rows_en']['no']
    sl_steg = T['sloyfe_steg']['no'] if lang == 'no' else T['sloyfe_steg_en']['no']
    pages.append(pg(f'''
{banner(t('banner_sloyfe'))}
<p>{t('sloyfe_lead')}</p>
{rosep(t('pill_sloyfebiter'))}
{card(otab(sl_rows, {'no': ['Rad', 'Beskrivelse', 'Masker'], 'en': ['Row', 'Description', 'Sts']}[lang]) + '<p class="small">' + t('sloyfe_biter_ferdig') + '</p>')}
{sagep(t('pill_sloyfe_sy'))}
{card(steps(sl_steg))}
{rosep(t('pill_sloyfe_feste'))}
{cme(t('sloyfe_feste'))}
''', 14))

    # ---- SIDE 15: MONTERING ----
    mo_steg = T['montering_steg']['no'] if lang == 'no' else T['montering_steg_en']['no']
    pages.append(pg(f'''
{banner(t('banner_montering'))}
<p>{t('montering_lead')}</p>
{card(steps(mo_steg))}
''', 15))

    # ---- SIDE 16: SIKKERHET ----
    ea = T['etterarbeid']['no'] if lang == 'no' else T['etterarbeid_en']['no']
    sk = T['sikkerhet_txt']['no'] if lang == 'no' else T['sikkerhet_txt_en']['no']
    pages.append(pg(f'''
{banner(t('banner_sikkerhet'))}
{rosep(t('pill_etterarbeid'))}
{card(ul(ea))}
{sagep(t('pill_sikkerhet'))}
{card(ul(sk))}
{rosep(t('pill_stell'))}
{cme(t('stell_txt'))}
''', 16))

    # ---- SIDE 17: FERDIG ----
    kolliste = T['kolleksjon_liste']['no'] if lang == 'no' else T['kolleksjon_liste']['en']
    kolliste_html = ('<ul class="dots" style="columns:2;column-gap:8mm;">'
                      + ''.join(f'<li>{i}</li>' for i in kolliste) + '</ul>')
    pages.append(pg(f'''
{banner(t('banner_ferdig'))}
{cream('<p class="creamtitle">' + t('ferdig_txt') + '</p>')}
{sagep(t('pill_kolleksjon'))}
{card('<p>' + t('kolleksjon_lead') + '</p>' + kolliste_html)}
{rosep(t('pill_copyright'))}
{card('<p class="small center">' + t('copyright_txt') + '</p>')}
<div class="byline">
  <div class="by2">{t('by1')} &middot; {t('by2')} &middot; {t('by3')}</div>
</div>
''', 17))

    return pages

for lang in ('no', 'en'):
    html_doc = doc(lang, build(lang))
    out = BASE / f'ellie_{lang}.html'
    out.write_text(html_doc, encoding='utf-8')
    print('OK', lang, len(html_doc), 'tegn/chars')
