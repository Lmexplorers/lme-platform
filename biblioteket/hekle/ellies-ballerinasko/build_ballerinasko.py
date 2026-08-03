# -*- coding: utf-8 -*-
"""Genererer LME-hekleoppskrift 'Ellies ballerinasko' (norsk + engelsk) som HTML,
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

# ---------------------------------------------------------------- SIDE 1
add('doctitle', 'Ellies ballerinasko, LME hekleoppskrift', "Ellie's Ballerina Shoes, LME crochet pattern")
add('ph2', 'LME HEKLEOPPSKRIFT&nbsp;&nbsp;|&nbsp;&nbsp;ELLIES BALLERINASKO',
    "LME CROCHET PATTERN&nbsp;&nbsp;|&nbsp;&nbsp;ELLIE'S BALLERINA SHOES")
add('covertag', 'LME HEKLEOPPSKRIFT - BABY', 'LME CROCHET PATTERN - BABY')
add('covertitle', 'ELLIES BALLERINASKO', "ELLIE'S BALLERINA SHOES")
add('subpill', 'LME BABY COLLECTION - WOODLAND DREAMS', 'LME BABY COLLECTION - WOODLAND DREAMS')
add('cover_desc',
    'Søte, klassiske babyballerinaer med rund tå, et lite dådyransikt med sløyfe på tåpartiet, '
    'T-stropp, en fin picotkant og et hjerte brodert på sålen. Fem størrelser, fra prematur til '
    '12 måneder, pluss en matchende hårsløyfe. Heklet i de samme naturfargene som resten av '
    'Ellie-kolleksjonen.',
    'Sweet, classic baby ballerina shoes with a round toe, a little deer face with a bow on the '
    'toe, a T-bar strap, a pretty picot edge and a heart embroidered on the sole. Five sizes, '
    'from preemie to 12 months, plus a matching hair bow. Crocheted in the same natural colours '
    'as the rest of the Ellie collection.')
add('by1', 'Av Renate Dahl', 'By Renate Dahl')
add('by2', 'Little Montessori Explorers', 'Little Montessori Explorers')
add('by3', 'lmexplorers.com', 'lmexplorers.com')
add('cover_tip',
    'TIPS: Les hele oppskriften og størrelsestabellen på side 4 før du begynner, og hekle en '
    'liten prøvelapp for å sjekke heklefastheten din.',
    'TIP: Read through the whole pattern and the size chart on page 4 before you start, and '
    'crochet a small swatch to check your gauge.')

# ---------------------------------------------------------------- SIDE 2
add('banner_om', 'OM ELLIES BALLERINASKO', "ABOUT ELLIE'S BALLERINA SHOES")
add('pill_historien', 'DEL AV ELLIES VERDEN', "PART OF ELLIE'S WORLD")
add('om_historien',
    'Ellies ballerinasko hører til LME Baby Collection "Woodland Dreams". Tenk deg at Ellie '
    'selv skulle hatt et par små sko å danse rundt i blomsterengen med, akkurat sånn er disse '
    'ballerinaene tenkt: myke, søte og klare for lek.',
    'Ellie\'s ballerina shoes belong to the LME Baby Collection "Woodland Dreams". Imagine Ellie '
    'herself with a little pair of shoes to dance around the flower meadow in, that is exactly '
    'the feeling these ballerinas are meant to have: soft, sweet and ready for play.')
add('pill_stil', 'STIL', 'STYLE')
add('om_stil',
    'Klassisk ballerinasko-form med rund tå og T-stropp, i de samme naturfargene som resten av '
    'kolleksjonen: krem, pudderrosa og lys brun. Kan mikses og matches, for eksempel kremfarget '
    'sko med rosa sløyfe.',
    'A classic ballerina shoe shape with a round toe and T-bar strap, in the same natural '
    'colours as the rest of the collection: cream, powder pink and light brown. Can be mixed '
    'and matched, for example cream shoes with a pink bow.')
add('pill_passform', 'GOD PASSFORM', 'A GOOD FIT')
add('om_passform',
    'Hekles stramt, akkurat som resten av amigurumi-kolleksjonen, så skoen holder formen og '
    'sitter pent på foten uten å bli slapp eller for stor.',
    'Crocheted tightly, just like the rest of the amigurumi collection, so the shoe holds its '
    'shape and sits neatly on the foot without becoming floppy or too big.')

# ---------------------------------------------------------------- SIDE 3
add('banner_mat', 'MATERIALER OG GARNALTERNATIVER', 'MATERIALS AND YARN ALTERNATIVES')
add('pill_garn', 'GARN', 'YARN')
add('garn_txt',
    'Bystrikk Merino eller DROPS Cotton Merino i krem, pudderrosa eller lys brun til selve '
    'skoen, pluss en liten rest av pudderrosa til sløyfen og lys brunt/kremhvitt til '
    'dådyransiktet (den fargen du ikke bruker på selve skoen). Samme garnfamilie som resten av '
    'Ellie-kolleksjonen.',
    'Bystrikk Merino or DROPS Cotton Merino in cream, powder pink or light brown for the shoe '
    'itself, plus a small leftover of powder pink for the bow and light brown/cream for the '
    'deer face (whichever colour you are not using on the shoe itself). The same yarn family as '
    'the rest of the Ellie collection.')
add('garn_alt',
    'Alternativt garn: enhver myk bomullsblanding i DK-tykkelse fungerer fint, for eksempel '
    'DROPS Safran, Hobbii Amigo eller Paintbox Simply DK. Bomull er lettest å holde rent.',
    'Alternative yarn: any soft cotton-blend DK-weight yarn works well, for example DROPS '
    'Safran, Hobbii Amigo or Paintbox Simply DK. Cotton is easiest to keep clean.')
add('pill_utstyr', 'UTSTYR OG TILBEHØR', 'TOOLS AND SUPPLIES')
add('utstyr', [
    ('Heklenål 3 eller 3,5 mm', 'avhengig av hvor stramt du hekler'),
    ('Stoppenål med butt spiss', 'til all somming'),
    ('Et lite, mykt hekleknapp (se side om T-stropp)', 'eller en enkel løkkeløsning uten knapp'),
    ('Hårspenne eller myk hårstrikk uten metalldeler', 'til den matchende hårsløyfen, valgfritt'),
    ('Saks og målebånd', ''),
])

# ---------------------------------------------------------------- SIDE 4
add('banner_storrelse', 'STØRRELSESTABELL', 'SIZE CHART')
add('storrelse_lead',
    'Mål barnets fot fra hæl til stortå, og velg størrelsen som passer nærmest. Er du i tvil '
    'mellom to størrelser, velg den største, babyføtter vokser fort.',
    "Measure the child's foot from heel to big toe, and choose the closest size. If you are "
    "between two sizes, choose the larger one, baby feet grow fast.")
add('storrelse_head', ['Størrelse', 'Omtrentlig alder', 'Fotlengde'],
    ['Size', 'Approximate age', 'Foot length'])
add('storrelse_rows', [
    ('Prematur', 'prematur/liten nyfødt', 'ca. 7,5 cm'),
    ('0 til 3 mnd', '0 til 3 måneder', 'ca. 9 cm'),
    ('3 til 6 mnd', '3 til 6 måneder', 'ca. 10 cm'),
    ('6 til 9 mnd', '6 til 9 måneder', 'ca. 11 cm'),
    ('9 til 12 mnd', '9 til 12 måneder', 'ca. 12 cm'),
], [
    ('Preemie', 'preemie/small newborn', 'approx. 7.5 cm'),
    ('0 to 3 mo', '0 to 3 months', 'approx. 9 cm'),
    ('3 to 6 mo', '3 to 6 months', 'approx. 10 cm'),
    ('6 to 9 mo', '6 to 9 months', 'approx. 11 cm'),
    ('9 to 12 mo', '9 to 12 months', 'approx. 12 cm'),
])
add('storrelse_note',
    'Tallene i oppskriften står i denne rekkefølgen: prematur (0-3) 3-6 (6-9) 9-12 måneder. '
    'Sett gjerne en ring rundt tallene for din størrelse med blyant før du begynner.',
    'The numbers in the pattern are always given in this order: preemie (0-3) 3-6 (6-9) 9-12 '
    'months. Circle the numbers for your size with a pencil before you start.')

# ---------------------------------------------------------------- SIDE 5
add('banner_klar', 'VANSKELIGHETSGRAD OG FASTHET', 'DIFFICULTY AND GAUGE')
add('pill_vanskelig', 'VANSKELIGHETSGRAD', 'DIFFICULTY')
add('vanskelig_txt', 'Middels. God øvelse i å hekle en oval bunn og forme en skoform.',
    'Medium. Good practice for crocheting an oval base and shaping a shoe form.')
add('pill_fasthet', 'HEKLEFASTHET', 'GAUGE')
add('fasthet_txt',
    'Hekle stramt: ca. 20 fm x 22 omganger = 10 x 10 cm på nål 3 til 3,5 mm. Hekler du løsere, '
    'blir skoen slapp og mister formen.',
    'Crochet tightly: approx. 20 sc x 22 rounds = 10 x 10 cm on a 3 to 3.5 mm hook. If you '
    'crochet looser, the shoe goes floppy and loses its shape.')

# ---------------------------------------------------------------- SIDE 6
add('banner_ord', 'FORKORTELSER (NORSK OG US)', 'ABBREVIATIONS (NORWEGIAN AND US)')
add('ord_lead',
    'Skoene bruker fastmasker og en pigg-teknikk (picot) til kanten. Her er forkortelsene, med '
    'de vanlige amerikanske hekletermene ved siden av.',
    'The shoes use single crochet and a picot technique for the edge. Here are the '
    'abbreviations, with the common US crochet terms alongside.')
add('ord_head', ['Norsk', 'US', 'Betyr'], ['Norwegian', 'US', 'Means'])
add('ord_rows', [
    ('lm', 'ch', 'luftmaske / chain'),
    ('fm', 'sc', 'fastmaske / single crochet'),
    ('kjm', 'sl st', 'kjedemaske / slip stitch'),
    ('picot', 'picot', 'liten pigg: 3 lm, kjm tilbake i første av de tre luftmaskene'),
    ('økn', 'inc', 'økning: 2 fm i samme maske. Gir én maske mer.'),
    ('m', 'st(s)', 'maske(r)'),
    ('( )', '( )', 'totalt antall masker på omgangen'),
    ('*...*', '*...*', 'gjenta det mellom stjernene så mange ganger som står bak'),
])
add('pill_tips', 'TIPS FØR DU BEGYNNER', 'TIPS BEFORE YOU START')
add('tips',
    ['Hekle alltid en prøvesko i den minste størrelsen først, hvis du er usikker på fastheten '
     'din.',
     'Prøv skoen forsiktig på foten (eller mot en tegning av foten) underveis i overdelen.',
     'De to skoene skal være helt like, tell maskene nøye på begge før du går videre til neste '
     'del.'],
    ['Always crochet a test shoe in the smallest size first, if you are unsure of your gauge.',
     "Try the shoe gently against the foot (or a drawing of the foot) as you work the upper.",
     'The two shoes should match exactly, count the stitches carefully on both before moving '
     'on to the next part.'])

# ---------------------------------------------------------------- SIDE 7
add('banner_oversikt', 'SLIK ER SKOEN BYGGET OPP', 'HOW THE SHOE IS BUILT')
add('oversikt_lead',
    'Hver sko har seks deler. Hekle alt to ganger, én gang for hver fot.',
    'Each shoe has six parts. Crochet everything twice, once for each foot.')
add('oversikt_deler', [
    ('1. Sålen', 'oval bunn, med et brodert hjerte', '1. The sole', 'oval base, with an embroidered heart'),
    ('2. Overdelen', 'sidene og tåpartiet', '2. The upper', 'the sides and toe'),
    ('3. Dådyransiktet', 'lite hode med ører på tåpartiet', '3. The deer face', 'a little head with ears on the toe'),
    ('4. T-stroppen', 'med lukking', '4. The T-bar strap', 'with a closure'),
    ('5. Picotkanten', 'dekorativ kant øverst', '5. The picot edge', 'a decorative trim at the top'),
    ('6. Sløyfen', 'mellom ørene på hver sko', '6. The bow', 'between the ears on each shoe'),
])

# ---------------------------------------------------------------- SIDE 8: SÅLEN
add('banner_sale', 'DEL 1: SÅLEN', 'PART 1: THE SOLE')
add('sale_lead',
    'Sålen hekles flat, som en oval, og danner grunnlaget for hele skoen. Tallene står i '
    'rekkefølgen prematur (0-3) 3-6 (6-9) 9-12 måneder.',
    'The sole is crocheted flat, as an oval, and forms the base for the whole shoe. The '
    'numbers are given in the order preemie (0-3) 3-6 (6-9) 9-12 months.')
add('sale_metode',
    'Metode: Legg opp angitt antall luftmasker for din størrelse. Start i 2. luftmaske fra '
    'nålen: hekle 1 fm i hver luftmaske bortover den ene siden, hekle 3 fm i den siste '
    'luftmasken (tåtuppen), fortsett med 1 fm i hver av de gjenværende luftmaskene på den andre '
    'siden, og avslutt omgangen med 2 fm i aller første maske (hælen). Du har nå en flat, oval '
    'bunn.',
    'Method: Chain the number of stitches given for your size. Starting in the 2nd chain from '
    'the hook: work 1 sc in each chain along one side, work 3 sc in the last chain (the toe '
    'tip), continue with 1 sc in each of the remaining chains on the other side, and finish '
    'the round with 2 sc in the very first stitch (the heel). You now have a flat, oval base.')
add('sale_rows', [
    ('1', 'legg opp 8 (9) 10 (11) 12 lm, hekle oval bunn (se metode over)',
     '20 (22) 24 (26) 28'),
    ('2', 'øk jevnt fordelt i begge tuppene (ca. 6 økninger i hver)', '32 (34) 36 (38) 40'),
])
add('sale_rows_en', [
    ('1', 'chain 8 (9) 10 (11) 12, crochet the oval base (see method above)',
     '20 (22) 24 (26) 28'),
    ('2', 'inc evenly in both curved ends (approx. 6 increases in each)', '32 (34) 36 (38) 40'),
])
add('sale_ferdig',
    'Ikke klipp av. Du fortsetter rett inn i overdelen fra samme tråd. Brodér gjerne et lite '
    'hjerte midt på undersiden av sålen i en kontrastfarge, som i referansebildet, et søtt '
    'detalj som vises når babyen løfter foten.',
    'Do not cut the yarn. You continue straight into the upper from the same thread. Feel free '
    'to embroider a small heart in the middle of the underside of the sole in a contrasting '
    'colour, as in the reference photo, a sweet detail that shows when the baby lifts their '
    'foot.')

# ---------------------------------------------------------------- SIDE 9: OVERDELEN
add('banner_overdel', 'DEL 2: OVERDELEN', 'PART 2: THE UPPER')
add('overdel_lead',
    'Overdelen hekles rett opp fra sålens ytterkant, i hovedfargen du har valgt.',
    'The upper is crocheted straight up from the outer edge of the sole, in your chosen main '
    'colour.')
add('overdel_rows', [
    ('1', 'fm i hver maske rundt (samme antall som sålens siste omgang)',
     '32 (34) 36 (38) 40'),
    ('2 til slutt', 'fm rett opp uten økning, antall omganger: 3 (3) 4 (4) 5',
     '32 (34) 36 (38) 40'),
])
add('overdel_rows_en', [
    ('1', 'sc in each stitch around (same count as the last round of the sole)',
     '32 (34) 36 (38) 40'),
    ('2 to end', 'sc straight up with no increases, number of rounds: 3 (3) 4 (4) 5',
     '32 (34) 36 (38) 40'),
])
add('overdel_apning',
    'Lag åpningen for foten: På den siste omgangen hekler du kun over den bakre og de to '
    'sideste tredjedelene (hælen og sidene), og lar den fremste tredjedelen (over tærne) stå '
    'åpen og ubehklet. Avslutt og klipp av med god tråd igjen. Prøv skoen på foten her, og '
    'juster gjerne antall omganger på den andre skoen om nødvendig, slik at begge blir like.',
    "Shape the foot opening: On the last round, only crochet over the back and side two-thirds "
    "of the round (the heel and sides), leaving the front third (over the toes) open and "
    "unworked. Fasten off, leaving a long tail. Try the shoe on the foot here, and adjust the "
    "number of rounds on the second shoe if needed, so both match.")

# ---------------------------------------------------------------- SIDE 10: DÅDYRANSIKTET
add('banner_dadyr', 'DEL 3: DÅDYRANSIKTET', 'PART 3: THE DEER FACE')
add('dadyr_lead',
    'Et lite, flatt dådyrhode sys fast på tåpartiet av hver sko, i kontrastfargen til selve '
    'skoen.',
    'A little, flat deer head is sewn onto the toe of each shoe, in a colour that contrasts '
    'with the shoe itself.')
add('dadyr_rows', [
    ('1', '6 fm i magisk ring', '6'),
    ('2', 'økn x 6', '12'),
    ('3', '(1 fm, økn) x 6', '18'),
    ('4', '18 fm rett', '18'),
])
add('dadyr_rows_en', [
    ('1', '6 sc in a magic ring', '6'),
    ('2', 'inc x 6', '12'),
    ('3', '(1 sc, inc) x 6', '18'),
    ('4', '18 sc straight', '18'),
])
add('dadyr_ferdig',
    'Fest av med god tråd igjen, og press hodet flatt. Hekle to bittesmå ører (5 fm i magisk '
    'ring, fest av, hekle 2 stk per sko) og sy dem fast øverst på hodet, med litt av overkanten '
    'stikkende opp over skoens overkant, akkurat som i referansebildet. Brodér et lite ansikt '
    '(to øyne, en liten nese og gjerne rosa kinn) med samme teknikk som Ellies andre motiver. '
    'Sy dådyransiktet godt fast midt på tåpartiet av skoen.',
    'Fasten off, leaving a long tail, and press the head flat. Crochet two tiny ears (5 sc in a '
    'magic ring, fasten off, make 2 per shoe) and sew them onto the top of the head, with a bit '
    'of the top peeking up over the top edge of the shoe, just like in the reference photo. '
    'Embroider a small face (two eyes, a little nose, and pink cheeks if you like) using the '
    'same technique as Ellie\'s other motifs. Sew the deer face securely onto the middle of the '
    'toe of the shoe.')

# ---------------------------------------------------------------- SIDE 11: T-STROPP OG LUKKING
add('banner_tstropp', 'DEL 4: T-STROPPEN OG LUKKINGEN', 'PART 4: THE T-BAR STRAP AND CLOSURE')
add('tstropp_lead',
    'T-stroppen går fra midt på tåpartiet, opp og over vristen, til den ene siden.',
    'The T-bar strap runs from the middle of the toe opening, up and over the instep, to one '
    'side.')
add('tstropp_txt',
    'Fest tråden midt foran på åpningens nederste kant. Hekle en kort stropp av fastmasker '
    'rett over vristen, i en lengde som passer størrelsen (prøv mot foten). Fest stroppen på '
    'den ene siden av skoen med noen faste sting.',
    'Attach the yarn in the middle front of the bottom edge of the opening. Crochet a short '
    'strap of single crochet straight over the instep, in a length that suits the size (try it '
    'against the foot). Attach the strap to one side of the shoe with a few secure stitches.')
add('pill_lukking', 'LUKKING, TO TRYGGE VALG', 'CLOSURE, TWO SAFE OPTIONS')
add('lukking_alt',
    [('Uten knapp (anbefalt for de minste)', 'La stroppen ende i en liten heklet løkke, og sy '
      'løkken fast direkte til den andre siden av skoen. Ingen løs knapp, tryggest for de '
      'minste størrelsene.'),
     ('Med myk heklet knapp', 'Hekle en liten flat "knapp" (5 fm i magisk ring, avslutt) og sy '
      'den godt og fast til siden av skoen. Tre stroppens løkke over knappen. Bruk aldri en '
      'hard plast- eller metallknapp, og sjekk at knappen sitter godt fast før hver bruk.')],
    [('Without a button (recommended for the smallest sizes)', 'Let the strap end in a small '
      'crocheted loop, and sew the loop directly onto the other side of the shoe. No loose '
      'button, safest for the smallest sizes.'),
     ('With a soft crocheted button', 'Crochet a small flat "button" (5 sc in a magic ring, '
      'fasten off) and sew it securely onto the side of the shoe. Slip the strap\'s loop over '
      'the button. Never use a hard plastic or metal button, and check that the button is '
      'firmly attached before every use.')])

# ---------------------------------------------------------------- SIDE 12: PICOTKANT
add('banner_picot', 'DEL 5: PICOTKANTEN', 'PART 5: THE PICOT EDGE')
add('picot_lead',
    'Picotkanten gir skoen det klassiske, litt kniplingaktige ballerina-utseendet, og hekles '
    'helt til slutt rundt hele den øvre åpningen.',
    'The picot edge gives the shoe its classic, slightly lace-like ballerina look, and is '
    'crocheted last, all the way around the top opening.')
add('picot_txt',
    'Fest tråden hvor som helst langs overkanten. Hekle *1 fm i neste maske, 3 lm, kjm tilbake '
    'i den første av de tre luftmaskene (én picot laget)*, gjenta rundt hele åpningen. Avslutt '
    'med en kjedemaske og fest tråden godt på innsiden.',
    'Attach the yarn anywhere along the top edge. Crochet *1 sc in the next stitch, 3 ch, sl '
    'st back into the first of the three chains (one picot made)*, repeat all the way around '
    'the opening. Finish with a slip stitch and fasten the yarn securely on the inside.')

# ---------------------------------------------------------------- SIDE 13: SLØYFEN
add('banner_sloyfe', 'DEL 6: SLØYFEN', 'PART 6: THE BOW')
add('sloyfe_lead',
    'En liten sløyfe sys fast mellom ørene, øverst på dådyransiktet på hver sko.',
    "A small bow is sewn on between the ears, at the top of the deer face on each shoe.")
add('sloyfe_rows', [
    ('1', '10 lm + 1 vendemaske', '10'),
    ('2 til 5', 'fm i hver maske tilbake, 4 omganger', '10'),
])
add('sloyfe_rows_en', [
    ('1', '10 ch + 1 turning chain', '10'),
    ('2 to 5', 'sc in each stitch back across, 4 rows', '10'),
])
add('sloyfe_ferdig',
    'Klipp av med god tråd igjen. Brett rektangelet sammen på midten og sy et lite stykke '
    'garn stramt rundt midjen, slik at det blir en liten sløyfeform. Sy sløyfen fast mellom '
    'ørene, øverst på dådyransiktet.',
    'Cut, leaving a long tail. Fold the rectangle together in the middle and wrap a short '
    'length of yarn tightly around the waist, so it forms a small bow shape. Sew the bow on '
    'between the ears, at the top of the deer face.')

# ---------------------------------------------------------------- SIDE 13: HÅRSLØYFEN
add('banner_harsloyfe', 'DEN MATCHENDE HÅRSLØYFEN', 'THE MATCHING HAIR BOW')
add('harsloyfe_lead',
    'Samme sløyfe som på skoene, litt større, sydd på en myk hårspenne eller hårstrikk uten '
    'metalldeler.',
    'The same bow as on the shoes, a little bigger, sewn onto a soft hair clip or hair tie '
    'with no metal parts.')
add('harsloyfe_rows', [
    ('1', '14 lm + 1 vendemaske', '14'),
    ('2 til 6', 'fm i hver maske tilbake, 5 omganger', '14'),
])
add('harsloyfe_rows_en', [
    ('1', '14 ch + 1 turning chain', '14'),
    ('2 to 6', 'sc in each stitch back across, 5 rows', '14'),
])
add('harsloyfe_ferdig',
    'Brett og bind sammen akkurat som skoens sløyfe. Sy den godt fast på en myk hårspenne '
    'eller hårstrikk. Husk: hårpynt skal alltid tas av når barnet sover eller er uten tilsyn.',
    "Fold and tie together just like the shoe's bow. Sew it securely onto a soft hair clip or "
    "hair tie. Remember: hair accessories should always be removed when the child is sleeping "
    "or unsupervised.")

# ---------------------------------------------------------------- SIDE 14: MONTERING
add('banner_montering', 'MONTERING, STEG FOR STEG', 'ASSEMBLY, STEP BY STEP')
add('montering_steg', [
    'Hekle sålen og overdelen i ett, for begge skoene, og brodér gjerne et hjerte på hver såle.',
    'Hekle dådyransiktene med ører og brodér ansiktene, og sy ett fast på tåpartiet av hver sko.',
    'Hekle T-stroppen på hver sko, og fest med valgt lukking (uten knapp, eller med myk heklet '
    'knapp).',
    'Hekle picotkanten rundt overkanten på begge skoene.',
    'Hekle to sløyfer og sy dem fast mellom ørene på hvert dådyransikt.',
    'Fest alle løse tråder godt på innsiden, og klipp av det som er igjen.',
    'Prøv begge skoene på foten en siste gang, og sjekk at de er like store og sitter godt.',
])
add('montering_steg_en', [
    'Crochet the sole and upper as one piece, for both shoes, and feel free to embroider a '
    'heart on each sole.',
    'Crochet the deer faces with ears and embroider the faces, and sew one onto the toe of '
    'each shoe.',
    'Crochet the T-bar strap on each shoe, and fasten with your chosen closure (no button, or '
    'a soft crocheted button).',
    'Crochet the picot edge around the top of both shoes.',
    'Crochet two bows and sew them on between the ears on each deer face.',
    'Fasten every loose end securely on the inside, and trim what is left.',
    'Try both shoes on the foot one last time, and check they match in size and fit well.',
])

# ---------------------------------------------------------------- SIDE 15: FOTOVEILEDNING
add('banner_foto', 'FOTOVEILEDNING', 'PHOTO GUIDE')
add('foto_lead',
    'Sett inn egne bilder av hvert steg her når du har heklet skoene selv.',
    'Add your own photos of each step here once you have crocheted the shoes yourself.')
add('foto_captions',
    ['Sålen ferdig', 'Overdelen med åpning', 'T-stropp og lukking', 'Ferdige sko med sløyfe'],
    ['The finished sole', 'The upper with the opening', 'T-bar strap and closure',
     'Finished shoes with a bow'])

# ---------------------------------------------------------------- SIDE 16: SIKKERHET OG STELL
add('banner_sikkerhet', 'SIKKERHET OG STELL', 'SAFETY AND CARE')
add('pill_sikkerhet', 'SIKKERHET', 'SAFETY')
add('sikkerhet_txt',
    ['Ingen deler limes. Alt sys fast med sterk, tvinnet bomullstråd og mange, tette sting.',
     'Bruk aldri en hard plast- eller metallknapp på de minste størrelsene, velg heller '
     'løkke-løsningen uten knapp.',
     'Sjekk skoene jevnlig for slitasje: løse tråder, dådyransikt, ører, sløyfer eller knapper '
     'som sitter løst. Kast eller reparer umiddelbart hvis noe er galt.',
     'Skoene er ment for lek og kos innendørs, ikke som erstatning for såler ved gange '
     'utendørs.',
     'Denne oppskriften er en veiledning for hjemmebruk. Skal det ferdige produktet selges, må '
     'det alltid kontrolleres, testes og eventuelt merkes i henhold til gjeldende lokale '
     'sikkerhetskrav og regelverk for barneprodukter.'],
    ['No parts are glued. Everything is sewn on with strong, twisted cotton thread and plenty '
     'of tight stitches.',
     'Never use a hard plastic or metal button on the smallest sizes, choose the button-free '
     'loop closure instead.',
     'Check the shoes regularly for wear: loose threads, a loose deer face, ears, bows or '
     'buttons that feel loose. Discard or repair immediately if anything is wrong.',
     'The shoes are intended for indoor play and cosiness, not as a substitute for soles when '
     'walking outdoors.',
     'This pattern is a guide for home use. If the finished product is sold, it must always be '
     "checked, tested and marked as required under current local safety requirements and "
     "regulations for children's products."])
add('pill_stell', 'STELL OG VASK', 'CARE AND WASHING')
add('stell_txt',
    'Håndvask i lunkent vann med litt mild såpe. Klem forsiktig ut vannet i et håndkle, ikke '
    'vri. Legg til tørk flatt, formet pent.',
    'Hand wash in lukewarm water with a little mild soap. Gently press out the water in a '
    'towel, do not wring. Lay flat to dry, neatly shaped.')

# ---------------------------------------------------------------- SIDE 17: FERDIG
add('banner_ferdig', 'GRATULERER, SKOENE ER FERDIGE!', 'CONGRATULATIONS, THE SHOES ARE DONE!')
add('ferdig_txt',
    'Nå har du heklet et lite par ballerinasko til Ellie-kolleksjonen. Perfekt til bilder, '
    'gaver og hverdagskos!',
    "Now you have crocheted a little pair of ballerina shoes for the Ellie collection. Perfect "
    "for photos, gifts and everyday cosiness!")
add('pill_kolleksjon', 'RESTEN AV LME BABY COLLECTION', 'THE REST OF THE LME BABY COLLECTION')
add('kolleksjon_liste',
    ['Ellie, det lille dådyret', 'Ellies smokkelenke', 'Ellies rangle', 'Ellies vognlenke',
     'Ellies aktivitetsleke'],
    ['Ellie, the little fawn', "Ellie's pacifier clip", "Ellie's rattle",
     "Ellie's stroller toy", "Ellie's activity toy"])
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
<div class="coverimg"><img src="{ref_src}" alt="Ellie, referanse for skoenes uttrykk"></div>
<p class="small center" style="margin-top:-2mm;">{'Bildet viser Ellie, det lille dådyret, som stiluttrykk-referanse, ikke selve skoene.' if lang == 'no' else 'Photo shows Ellie, the little fawn, as a style reference, not the shoes themselves.'}</p>
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

    pages.append(pg(f'''
{banner(t('banner_om'))}
{rosep(t('pill_historien'))}
{card('<p>' + t('om_historien') + '</p>')}
{sagep(t('pill_stil'))}
{card('<p>' + t('om_stil') + '</p>')}
{rosep(t('pill_passform'))}
{cme(t('om_passform'))}
''', 2))

    utstyr_list = ul([f'<b>{a}</b>' + (f' &middot; {b}' if b else '') for a, b in T['utstyr']['no']])
    pages.append(pg(f'''
{banner(t('banner_mat'))}
{rosep(t('pill_garn'))}
{card('<p>' + t('garn_txt') + '</p><p class="small">' + t('garn_alt') + '</p>')}
{sagep(t('pill_utstyr'))}
{card(utstyr_list)}
''', 3))

    storrelse_rows = T['storrelse_rows']['no'] if lang == 'no' else T['storrelse_rows']['en']
    st_table = '<table class="t"><tr><th>' + '</th><th>'.join(T['storrelse_head'][lang]) + '</th></tr>' + \
        ''.join(f'<tr><td><b>{a}</b></td><td>{b}</td><td>{c}</td></tr>' for a, b, c in storrelse_rows) + '</table>'
    pages.append(pg(f'''
{banner(t('banner_storrelse'))}
<p>{t('storrelse_lead')}</p>
{card(st_table)}
{cme(t('storrelse_note'))}
''', 4))

    pages.append(pg(f'''
{banner(t('banner_klar'))}
{rosep(t('pill_vanskelig'))}
{card('<p class="center">' + t('vanskelig_txt') + '</p>')}
{sagep(t('pill_fasthet'))}
{card('<p>' + t('fasthet_txt') + '</p>')}
''', 5))

    ord_table = abbrtab(T['ord_rows']['no'], T['ord_head'][lang])
    tips_items = T['tips']['no'] if lang == 'no' else T['tips']['en']
    pages.append(pg(f'''
{banner(t('banner_ord'))}
<p>{t('ord_lead')}</p>
{card(ord_table)}
{sagep(t('pill_tips'))}
{card(ul(tips_items))}
''', 6))

    if lang == 'no':
        deler = [(a, b) for (a, b, _, _) in T['oversikt_deler']['no']]
    else:
        deler = [(c, d) for (_, _, c, d) in T['oversikt_deler']['no']]
    deler_html = '<div class="deler-grid">' + ''.join(
        f'<div class="di"><b>{a}</b><br>{b}</div>' for a, b in deler) + '</div>'
    pages.append(pg(f'''
{banner(t('banner_oversikt'))}
{card('<p>' + t('oversikt_lead') + '</p>' + deler_html)}
''', 7))

    sale_rows = T['sale_rows']['no'] if lang == 'no' else T['sale_rows_en']['no']
    pages.append(pg(f'''
{banner(t('banner_sale'))}
<p>{t('sale_lead')}</p>
{card('<p class="small">' + t('sale_metode') + '</p>')}
{card(otab(sale_rows, head3[lang]))}
{cme(t('sale_ferdig'))}
''', 8))

    overdel_rows = T['overdel_rows']['no'] if lang == 'no' else T['overdel_rows_en']['no']
    pages.append(pg(f'''
{banner(t('banner_overdel'))}
<p>{t('overdel_lead')}</p>
{card(otab(overdel_rows, head3[lang]))}
{cme(t('overdel_apning'))}
''', 9))

    dadyr_rows = T['dadyr_rows']['no'] if lang == 'no' else T['dadyr_rows_en']['no']
    pages.append(pg(f'''
{banner(t('banner_dadyr'))}
<p>{t('dadyr_lead')}</p>
{card(otab(dadyr_rows, head3[lang]))}
{cme(t('dadyr_ferdig'))}
''', 10))

    lukking_items = T['lukking_alt']['no'] if lang == 'no' else T['lukking_alt']['en']
    lukking_html = ul([f'<b>{a}:</b> {b}' for a, b in lukking_items])
    pages.append(pg(f'''
{banner(t('banner_tstropp'))}
<p>{t('tstropp_lead')}</p>
{card('<p>' + t('tstropp_txt') + '</p>')}
{sagep(t('pill_lukking'))}
{card(lukking_html)}
''', 11))

    pages.append(pg(f'''
{banner(t('banner_picot'))}
<p>{t('picot_lead')}</p>
{card('<p>' + t('picot_txt') + '</p>')}
''', 12))

    sl_rows = T['sloyfe_rows']['no'] if lang == 'no' else T['sloyfe_rows_en']['no']
    pages.append(pg(f'''
{banner(t('banner_sloyfe'))}
<p>{t('sloyfe_lead')}</p>
{card(otab(sl_rows, {'no': ['Rad', 'Beskrivelse', 'Masker'], 'en': ['Row', 'Description', 'Sts']}[lang]))}
{cme(t('sloyfe_ferdig'))}
''', 13))

    hs_rows = T['harsloyfe_rows']['no'] if lang == 'no' else T['harsloyfe_rows_en']['no']
    pages.append(pg(f'''
{banner(t('banner_harsloyfe'))}
<p>{t('harsloyfe_lead')}</p>
{card(otab(hs_rows, {'no': ['Rad', 'Beskrivelse', 'Masker'], 'en': ['Row', 'Description', 'Sts']}[lang]))}
{cme(t('harsloyfe_ferdig'))}
''', 14))

    mo_steg = T['montering_steg']['no'] if lang == 'no' else T['montering_steg_en']['no']
    pages.append(pg(f'''
{banner(t('banner_montering'))}
{card(steps(mo_steg))}
''', 15))

    foto_caps = T['foto_captions']['no'] if lang == 'no' else T['foto_captions']['en']
    pages.append(pg(f'''
{banner(t('banner_foto'))}
{card('<p class="center">' + t('foto_lead') + '</p>')}
{photo_row(foto_caps)}
''', 16))

    sik = T['sikkerhet_txt']['no'] if lang == 'no' else T['sikkerhet_txt']['en']
    pages.append(pg(f'''
{banner(t('banner_sikkerhet'))}
{rosep(t('pill_sikkerhet'))}
{card(ul(sik))}
{sagep(t('pill_stell'))}
{cme(t('stell_txt'))}
''', 17))

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
''', 18))

    return pages

for lang in ('no', 'en'):
    html_doc = kit.doc(lang, T['doctitle'][lang], None, build(lang))
    out = BASE / f'ballerinasko_{lang}.html'
    out.write_text(html_doc, encoding='utf-8')
    print('OK', lang, len(html_doc), 'tegn/chars')
