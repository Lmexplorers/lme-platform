# -*- coding: utf-8 -*-
"""Genererer LME-hekleoppskrift 'Ellies aktivitetsleke' (norsk + engelsk) som HTML,
klar for PDF-print med Chromium. Del av LME Baby Collection 'Woodland Dreams'.
Aktivitetslek en er en myk aktivitetskube med seks sider."""
import base64, pathlib, sys

BASE = pathlib.Path(__file__).parent
sys.path.insert(0, str(BASE.parent / '_shared'))
import lme_pattern_kit as kit
from lme_pattern_kit import (banner, rosep, sagep, card, cream, cme, ul, steps, otab, abbrtab,
                              photo_row, qr_placeholder)

REF = BASE / 'aktivitetsleke_ref.jpg'
ref_b64 = base64.b64encode(REF.read_bytes()).decode()
ref_src = f'data:image/jpeg;base64,{ref_b64}'

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
    'En myk aktivitetskube, ca. 11 til 12 cm per side, full av ting å utforske på hver av de '
    'seks sidene: Ellie med sløyfe, et babysikkert speil i en blomsterramme, fire enkle former, '
    'Ellie som titter opp av en liten lomme, og en knitreside med en liten sky som knitrer når '
    'man klemmer den. To hjørneringer i tre og en perlekant på toppen fullfører kuben.',
    'A soft activity cube, approx. 11 to 12 cm per side, full of things to explore on each of '
    'the six sides: Ellie with a bow, a baby-safe mirror in a flower frame, four simple shapes, '
    'Ellie peeking out of a little pocket, and a crinkle side with a little cloud that crinkles '
    'when you squeeze it. Two wooden corner rings and a bead trim along the top complete the '
    'cube.')
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
    'Ellies aktivitetsleke hører til LME Baby Collection "Woodland Dreams". Kuben samler hele '
    'Ellies verden på seks små sider: Ellie selv med sløyfen sin, speilet der barnet møter sitt '
    'eget speilbilde, formene fra skogens ting, lommen der Ellie titter frem, og skyen som '
    'knitrer på knitresiden.',
    'Ellie\'s activity toy belongs to the LME Baby Collection "Woodland Dreams". The cube '
    'gathers Ellie\'s whole world across six small sides: Ellie herself with her bow, the '
    'mirror where the child meets their own reflection, shapes from the forest, the pocket '
    'where Ellie peeks out, and the cloud that crinkles on the crinkle side.')
add('pill_stil', 'STIL OG SANSER', 'STYLE AND SENSES')
add('om_stil',
    'Skandinavisk og Montessori-inspirert, i de samme naturfargene som resten av kolleksjonen. '
    'Hver side har sin egen oppgave å utforske, fra å kjenne igjen former til å høre en liten '
    'sky knitre, akkurat den typen sanselige, hands-on lek Montessori-filosofien bygger på.',
    'Scandinavian and Montessori-inspired, in the same natural colours as the rest of the '
    'collection. Each side has its own task to explore, from recognising shapes to hearing a '
    'little cloud crinkle, exactly the kind of sensory, hands-on play the Montessori philosophy '
    'is built on.')
add('pill_sikkerhet_kort', 'VIKTIGST AV ALT: SIKKERHET', 'MOST IMPORTANT OF ALL: SAFETY')
add('om_sikkerhet_kort',
    'Denne leken har flere små deler enn noen annen oppskrift i kolleksjonen, og inneholder '
    'også et lite speil, to treringer og knitrefolie. Alt skal sys fast med dobbel styrke, og '
    'side 18 er viet sikkerhet i sin helhet. Les den siden nøye før du begynner.',
    'This toy has more small parts than any other pattern in the collection, and also includes '
    'a small mirror, two wooden rings and a crinkle sheet. Everything must be sewn on with '
    'double strength, and page 18 is entirely dedicated to safety. Read that page carefully '
    'before you begin.')

# ---------------------------------------------------------------- SIDE 3
add('banner_mat', 'MATERIALER OG GARNALTERNATIVER', 'MATERIALS AND YARN ALTERNATIVES')
add('pill_garn', 'GARN', 'YARN')
add('garn_txt',
    'Bystrikk Merino i kremhvitt (kubens sider) og lyst brunt (kantfarge og Ellies hode), pluss '
    'rester av pudderrosa, salviegrønt, gult og lys himmelblå, samme garnfamilie som resten av '
    'Ellie-kolleksjonen.',
    'Bystrikk Merino in cream (the cube sides) and light brown (the edging colour and Ellie\'s '
    'head), plus leftover powder pink, sage green, yellow and light sky blue, the same yarn '
    'family as the rest of the Ellie collection.')
add('garn_alt',
    'Alternativt garn: enhver myk bomullsblanding i DK-tykkelse fungerer fint, for eksempel '
    'DROPS Safran eller Hobbii Amigo.',
    'Alternative yarn: any soft cotton-blend DK-weight yarn works well, for example DROPS '
    'Safran or Hobbii Amigo.')
add('pill_utstyr', 'UTSTYR OG TILBEHØR', 'TOOLS AND SUPPLIES')
add('utstyr', [
    ('Heklenål 3 eller 3,5 mm', ''),
    ('Seks tynne skumkvadrater eller stiv filtplate, ca. 10 x 10 cm', 'BPA-fri, til å gi kuben '
     'form, skal alltid være helt innsydd'),
    ('Polyesterfiber til fyll', 'til hjørner/kanter og til Ellie-motivene'),
    ('Babysikkert speil (akryl/plast, ikke glass)', 'liten, rund speilplate beregnet for '
     'babyprodukter, se side om speilet'),
    ('To trerelaterte teetheringer', 'umalt/BPA-fri, CE-merket, beregnet for barn, til '
     'hjørnene'),
    ('Runde treperler i noen få størrelser', 'BPA-frie, til topphåndtaket og hjørneduskene'),
    ('Knitrefolie beregnet for babyprodukter (liten bit)', 'til knitresiden, se side om '
     'knitresiden'),
    ('Stoppenål med butt spiss og tvinnet bomullstråd', 'til all somming'),
    ('Saks og målebånd', ''),
])

# ---------------------------------------------------------------- SIDE 4
add('banner_klar', 'VANSKELIGHETSGRAD, MÅL OG FASTHET', 'DIFFICULTY, SIZE AND GAUGE')
add('pill_vanskelig', 'VANSKELIGHETSGRAD', 'DIFFICULTY')
add('vanskelig_txt',
    'Middels til utfordrende: mange små deler, seks paneler som skal måle likt, og en helt ny '
    'teknikk i kolleksjonen, å sy panelene sammen til en tredimensjonal kube. Fin oppskrift når '
    'du har heklet minst én av de andre Ellie-oppskriftene først.',
    'Medium to challenging: many small parts, six panels that must all match in size, and a '
    'technique new to the collection, sewing the panels together into a three-dimensional cube. '
    'A good pattern once you have crocheted at least one of the other Ellie patterns first.')
add('pill_mal', 'FERDIG MÅL', 'FINISHED SIZE')
add('mal_txt',
    'Kuben er ca. 11 til 12 cm per side, avhengig av heklefasthet og tykkelsen på den indre '
    'stivingen.',
    'The cube is approx. 11 to 12 cm per side, depending on your gauge and the thickness of the '
    'inner stiffening.')
add('pill_fasthet', 'HEKLEFASTHET', 'GAUGE')
add('fasthet_txt',
    'Hekle stramt, amigurumi-fasthet: ca. 20 fm x 22 rader = 10 x 10 cm på nål 3 mm.',
    'Crochet tightly, amigurumi tension: approx. 20 sc x 22 rows = 10 x 10 cm on a 3 mm hook.')

# ---------------------------------------------------------------- SIDE 5
add('banner_ord', 'FORKORTELSER (NORSK OG US)', 'ABBREVIATIONS (NORWEGIAN AND US)')
add('ord_lead',
    'Her er alle forkortelsene som brukes i denne oppskriften, med de vanlige amerikanske '
    'hekletermene ved siden av.',
    'Here are all the abbreviations used in this pattern, with the common US crochet terms '
    'alongside.')
add('ord_head', ['Norsk', 'US', 'Betyr'], ['Norwegian', 'US', 'Means'])
add('ord_rows', [
    ('lm', 'ch', 'luftmaske / chain'),
    ('fm', 'sc', 'fastmaske / single crochet'),
    ('halvstav', 'hdc', 'halv stav / half double crochet'),
    ('stav', 'dc', 'stav / double crochet'),
    ('kjm', 'sl st', 'kjedemaske / slip stitch'),
    ('økn', 'inc', 'økning: 2 fm i samme maske'),
    ('mink', 'dec', 'minking: 2 fm sammen'),
    ('m', 'st(s)', 'maske(r)'),
    ('*...*', '*...*', 'gjenta det mellom stjernene så mange ganger som står bak'),
])
add('pill_tips', 'TIPS FØR DU BEGYNNER', 'TIPS BEFORE YOU START')
add('tips',
    ['Hekle alle seks grunnkvadratene først, og kontroller at de er nøyaktig like store før du '
     'begynner på pyntemotivene.',
     'Legg gjerne alle de ferdige sidene ved siden av hverandre og planlegg hvilken side som '
     'skal vende hvilken vei, før du syr noe sammen.',
     'Sett inn skumkvadratene til slutt, rett før du syr igjen siste søm, så holder kuben '
     'fasongen uten at det blir vanskelig å sy.'],
    ['Crochet all six base squares first, and check that they are exactly the same size before '
     'starting on the decorative motifs.',
     'Lay all the finished sides next to each other and plan which side should face which way, '
     'before sewing anything together.',
     'Insert the foam squares last, right before sewing the final seam closed, so the cube '
     'holds its shape without making the sewing difficult.'])

# ---------------------------------------------------------------- SIDE 6
add('banner_oversikt', 'SLIK ER AKTIVITETSKUBEN BYGGET OPP', 'HOW THE ACTIVITY CUBE IS BUILT')
add('oversikt_lead',
    'Kuben har seks sider. Fem av dem har hvert sitt motiv, den siste er bunnen og holdes helt '
    'enkel:',
    'The cube has six sides. Five of them each have their own motif, the last is the bottom and '
    'is kept completely plain:')
add('oversikt_deler', [
    ('1. Grunnkvadratene', 'seks like paneler med kantfarge', '1. The base squares',
     'six matching panels with an edging colour'),
    ('2. Ellie-siden', 'forsiden, med sløyfe og volangkrage', '2. The Ellie side',
     'the front, with a bow and a ruffled collar'),
    ('3. Speil-siden', 'babysikkert speil i blomsterramme', '3. The mirror side',
     'baby-safe mirror in a flower frame'),
    ('4. Form-siden', 'hjerte, stjerne, sirkel og trekant', '4. The shapes side',
     'heart, star, circle and triangle'),
    ('5. Lomme-siden', 'miniatyr-Ellie titter opp av en lomme', '5. The pocket side',
     'a miniature Ellie peeking out of a pocket'),
    ('6. Knitre-siden', 'en liten sky med knitrende stoff inni, som knitrer når man klemmer',
     '6. The crinkle side', 'a little cloud with crinkling material inside, that crinkles when '
     'squeezed'),
    ('7. Bunnen', 'enkel, uten pynt', '7. The bottom', 'plain, without decoration'),
    ('8. Sammensying og stiving', 'de seks sidene syde til en kube', '8. Assembly and stiffening',
     'the six sides sewn into a cube'),
    ('9. Topphåndtaket', 'perlekant langs den øverste sømmen', '9. The top handle',
     'a bead trim along the top seam'),
    ('10. Hjørneringene og duskene', 'to treringer og to perledusker', '10. The corner rings '
     'and tassels', 'two wooden rings and two bead tassels'),
])

# ---------------------------------------------------------------- SIDE 7: GRUNNKVADRATENE
add('banner_kvadrat', 'DEL 1: GRUNNKVADRATENE', 'PART 1: THE BASE SQUARES')
add('kvadrat_lead',
    'Alle seks sidene av kuben starter som det samme, enkle kvadratet. Hekle motivene på til '
    'slutt, side for side.',
    'All six sides of the cube start as the same simple square. Crochet the motifs onto them '
    'afterwards, side by side.')
add('kvadrat_txt',
    'Legg opp 24 lm + 1 vendemaske i kremhvitt. Rad 1: 24 fm. Gjenta rad 1 (snu mellom hver '
    'rad) til stykket er kvadratisk, ca. 11 x 11 cm, omtrent 22 til 24 rader avhengig av din '
    'fasthet. Fest av. Hekle seks like kvadrater totalt.',
    'Chain 24 + 1 turning chain in cream. Row 1: 24 sc. Repeat row 1 (turning between each row) '
    'until the piece is square, approx. 11 x 11 cm, roughly 22 to 24 rows depending on your '
    'gauge. Fasten off. Crochet six matching squares in total.')
add('kvadrat_kant',
    'Rund av hvert kvadrat med én omgang fm i lyst brunt rundt hele kanten (fm jevnt langs '
    'sidene, 3 fm i hvert hjørne for at det skal ligge flatt). Fest av og gjem tråden. Dette gir '
    'den lyse kantstripen du ser rundt hver side i referansebildet.',
    'Edge each square with one round of sc in light brown all the way around (sc evenly along '
    'the sides, 3 sc in each corner so it lies flat). Fasten off and weave in the end. This '
    'gives the light border you see around each side in the reference photo.')

# ---------------------------------------------------------------- SIDE 8: ELLIE-SIDEN
add('banner_ellie', 'DEL 2: ELLIE-SIDEN', 'PART 2: THE ELLIE SIDE')
add('ellie_lead',
    'Forsiden av kuben er Ellie selv, med sløyfe og en liten volangkrage, samme teknikk som på '
    'rangelen og vognlenkens medaljong.',
    "The front of the cube is Ellie herself, with a bow and a little ruffled collar, the same "
    "technique as on the rattle and the stroller toy's medallion.")
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
    'øverst, og brodér et lite ansikt.',
    'Cut, leaving a long tail. Sew on two small ears (5 sc in a magic ring, fasten off, make 2) '
    'on top, and embroider a small face.')
add('ellie_sloyfe',
    'Sløyfen: hekle en smal strimmel i pudderrosa, legg opp 16 lm + 1 vendemaske, 1 rad fm (16 '
    'fm). Fold strimmelen til en sløyfeform og sy stramt sammen på midten flere ganger, som '
    'beskrevet i Ellies egen hovedoppskrift. Sy sløyfen fast permanent og flatt, øverst mellom '
    'ørene. I motsetning til på selve Ellie-dyret skal sløyfen her IKKE være avtakbar, siden den '
    'sys rett på et flatt panel.',
    'The bow: crochet a narrow strip in powder pink, chain 16 + 1 turning chain, 1 row of sc (16 '
    'sc). Fold the strip into a bow shape and sew it tightly together at the centre several '
    'times, as described in Ellie\'s own main pattern. Sew the bow on permanently and flat, at '
    'the top between the ears. Unlike on the Ellie toy itself, this bow should NOT be '
    'removable, since it is sewn directly onto a flat panel.')
add('ellie_krage',
    'Volangkragen: fest pudderrosa tråd i nedre kant av hodet. *1 fm i neste maske, hopp over 1 '
    'maske, 5 stav i neste maske (en liten vifte), hopp over 1 maske*, gjenta hele veien rundt '
    'underkanten. Fest av. Sy til slutt Ellies hode godt fast midt på panelet.',
    'The ruffled collar: attach powder pink yarn at the bottom edge of the head. *1 sc in the '
    'next stitch, skip 1 stitch, 5 dc in the next stitch (a little fan), skip 1 stitch*, repeat '
    'all the way around the bottom edge. Fasten off. Finally, sew Ellie\'s head securely onto '
    'the middle of the panel.')

# ---------------------------------------------------------------- SIDE 9: SPEIL-SIDEN
add('banner_speil', 'DEL 3: SPEIL-SIDEN (BABYSIKKERT)', 'PART 3: THE MIRROR SIDE (BABY-SAFE)')
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
add('speil_ramme',
    'Blomsterrammen: fest pudderrosa tråd direkte i ytterkanten av den innsydde speilsirkelen, '
    'og hekle en omgang: 24 fm rundt hele kanten. Fortsett rett inn i kronbladene, uten å lukke '
    'omgangen: *hopp over 1 m, i neste m: 1 kjm, 2 lm, 3 stav, 2 lm, 1 kjm*, gjenta til du har '
    'åtte kronblad rundt hele speilet. Fest av og gjem tråden. Sy speilet med blomsterrammen '
    'godt fast midt på panelet.',
    'The flower frame: attach powder pink yarn directly into the outer edge of the sewn-in '
    'mirror circle, and crochet one round: 24 sc all the way around. Continue straight into the '
    'petals, without joining the round: *skip 1 st, in the next st: 1 sl st, 2 ch, 3 dc, 2 ch, 1 '
    'sl st*, repeat until you have eight petals all the way around the mirror. Fasten off and '
    'weave in the end. Sew the mirror with its flower frame securely onto the middle of the '
    'panel.')
add('speil_note',
    'Bruk kun et fleksibelt, ubrytelig babysikkert speil beregnet for barneprodukter, aldri '
    'ekte glass. Sjekk at speilplaten ikke har skarpe kanter før du setter den inn.',
    'Use only a flexible, unbreakable baby-safe mirror intended for children\'s products, '
    'never real glass. Check that the mirror disc has no sharp edges before you insert it.')

# ---------------------------------------------------------------- SIDE 10: FORM-SIDEN
add('banner_form', 'DEL 4: FORM-SIDEN', 'PART 4: THE SHAPES SIDE')
add('form_lead',
    'Fire enkle, gjenkjennelige former, en fin start på formgjenkjenning for de minste.',
    'Four simple, recognisable shapes, a nice start to shape recognition for little ones.')
add('pill_hjerte', 'HJERTET (PUDDERROSA)', 'THE HEART (POWDER PINK)')
add('hjerte_txt',
    'Hekle to like halvdeler: 6 fm i magisk ring, økn x 6 (12), fest av (hekle 2 stk). Sy de to '
    'halvdelene sammen langs en rett kant øverst, og press dem lett ned mot en spiss nederst, '
    'til en hjerteform. Press flatt og sy fast.',
    'Crochet two matching halves: 6 sc in a magic ring, inc x 6 (12), fasten off (make 2). Sew '
    'the two halves together along a straight edge at the top, and gently press them down '
    'towards a point at the bottom, into a heart shape. Press flat and sew on.')
add('pill_stjerne_form', 'STJERNEN (SALVIEGRØNT)', 'THE STAR (SAGE GREEN)')
add('stjerne_form_txt',
    'Hekle 5 fm i magisk ring. Fortsett rett inn i takkene: *1 fm, 3 lm, kjm i samme maske*, '
    'gjenta til alle 5 maskene har en takk. Fest av med god tråd igjen, press flatt og sy fast.',
    'Crochet 5 sc in a magic ring. Continue straight into the points: *1 sc, 3 ch, sl st in the '
    'same stitch*, repeat until all 5 stitches have a point. Fasten off, leaving a long tail, '
    'press flat and sew on.')
add('pill_sirkel', 'SIRKELEN (GULT)', 'THE CIRCLE (YELLOW)')
add('sirkel_txt',
    'Hekle 6 fm i magisk ring, økn x 6 (12), (1 fm, økn) x 6 (18). Fest av, press flatt. '
    'Brodér gjerne en liten spiral i midten med kontrastfarget tråd, akkurat som i '
    'referansebildet, før du syr sirkelen fast.',
    'Crochet 6 sc in a magic ring, inc x 6 (12), (1 sc, inc) x 6 (18). Fasten off, press flat. '
    'Feel free to embroider a small spiral in the centre with contrasting thread, just like in '
    'the reference photo, before sewing the circle on.')
add('pill_trekant', 'TREKANTEN (LYS HIMMELBLÅ)', 'THE TRIANGLE (LIGHT SKY BLUE)')
add('trekant_txt',
    'Legg opp 7 lm. Rad 1: fm i 2. lm fra nålen og resten bortover (6 fm). Rad 2: mink 1 i hver '
    'ende (4 fm). Rad 3: mink 1 i hver ende (2 fm). Rad 4: mink de to siste maskene sammen til '
    'én (1 fm). Fest av, press flatt og sy fast.',
    'Chain 7. Row 1: sc in the 2nd ch from the hook and along the rest (6 sc). Row 2: dec 1 at '
    'each end (4 sc). Row 3: dec 1 at each end (2 sc). Row 4: dec the last two stitches together '
    'into one (1 sc). Fasten off, press flat and sew on.')

# ---------------------------------------------------------------- SIDE 11: LOMME-SIDEN
add('banner_lomme', 'DEL 5: LOMME-SIDEN', 'PART 5: THE POCKET SIDE')
add('lomme_lead',
    'En liten miniatyr-Ellie titter opp av en lomme nederst på panelet, en liten '
    'tittelek-overraskelse.',
    'A tiny miniature Ellie peeks up out of a pocket at the bottom of the panel, a little '
    'peekaboo surprise.')
add('lomme_txt',
    'Lommen: legg opp 12 lm + 1 vendemaske i salviegrønt. Rad 1: 12 fm. Gjenta rad 1 i 8 rader '
    'totalt. Fold stykket dobbelt og sy sammen langs de to kortsidene og bunnen, slik at det '
    'blir en liten, åpen lomme. Sy lommens bunnkant fast nederst på panelet, med åpningen vendt '
    'opp.',
    'The pocket: chain 12 + 1 turning chain in sage green. Row 1: 12 sc. Repeat row 1 for 8 '
    'rows in total. Fold the piece in half and sew together along the two short sides and the '
    'bottom, so it becomes a small, open pocket. Sew the pocket\'s bottom edge onto the bottom '
    'of the panel, with the opening facing up.')
add('lomme_ellie',
    'Miniatyr-Ellie: 6 fm i magisk ring, brunt (6), økn x 6 (12), (1 fm, økn) x 6 (18), 1 '
    'omgang rett (18), mink x 6 (9), fyll svært lett. Fest av med god tråd igjen. Sy to '
    'bittesmå ører og brodér et lite ansikt, akkurat som på Ellie-siden.',
    'Miniature Ellie: 6 sc in a magic ring, brown (6), inc x 6 (12), (1 sc, inc) x 6 (18), 1 '
    'round straight (18), dec x 6 (9), stuff very lightly. Fasten off, leaving a long tail. Sew '
    'on two tiny ears and embroider a small face, just like on the Ellie side.')
add('lomme_montering',
    'Sy miniatyr-Ellie godt fast rett bak lommeåpningen, litt høyere enn selve lommen, slik at '
    'bare hodet stikker opp av lommen, som om hun titter frem. Ellie skal sys helt fast til '
    'panelet, ikke bare ligge løst nedi lommen.',
    'Sew the miniature Ellie securely just behind the pocket opening, a little higher than the '
    'pocket itself, so that only the head pokes up out of the pocket, as if she is peeking out. '
    'Ellie must be sewn completely onto the panel, not just placed loosely inside the pocket.')

# ---------------------------------------------------------------- SIDE 12: KNITRE-SIDEN
add('banner_flette', 'DEL 6: KNITRE-SIDEN', 'PART 6: THE CRINKLE SIDE')
add('flette_lead',
    'Denne siden gir en helt annen sans å utforske: lyd. Inni den lille, myke skyen legger du et '
    'knitrende stoff, en knitrefolie beregnet for babyprodukter, trygt sydd helt inne i skyen, '
    'slik at det knitrer akkurat der barnet klemmer på den.',
    'This side offers a completely different sense to explore: sound. Inside the little, soft '
    'cloud you place a crinkling material, a crinkle sheet intended for baby products, safely '
    'sewn completely inside the cloud, so that it crinkles right where the child squeezes it.')
add('flette_hull',
    'Skyen, front og bak: hekle to like sett av tre overlappende sirkler i kremhvitt, samme '
    'metode som skyen på Ellies vognlenke: (a) 6 fm i magisk ring. (b) 6 fm i magisk ring, økn x '
    '6 (12). (c) 6 fm i magisk ring, økn x 6 (12), (1 fm, økn) x 6 (18). Overlapp og sy sammen '
    'de tre sirklene til en skyform. Hekle to like skyer totalt, én for framsiden og én for '
    'baksiden av puten.',
    'The cloud, front and back: crochet two matching sets of three overlapping circles in '
    'cream, the same method as the cloud on Ellie\'s stroller toy: (a) 6 sc in a magic ring. '
    '(b) 6 sc in a magic ring, inc x 6 (12). (c) 6 sc in a magic ring, inc x 6 (12), (1 sc, inc) '
    'x 6 (18). Overlap and sew the three circles together into a cloud shape. Crochet two '
    'matching clouds in total, one for the front and one for the back of the pillow.')
add('flette_snor',
    'Legg et lite ark med knitrende stoff, en knitrefolie beregnet for babyprodukter, mellom de '
    'to skyene, og sy dem sammen rundt hele kanten med tette sting, slik at folien er '
    'fullstendig innelukket og ikke kan tas ut. Dette er selve knitrelyden: når skyen klemmes '
    'på, krøller knitrefolien seg inni og lager den sprø, knitrende lyden barnet skal oppdage. '
    'Sy den ferdige, fylte skyen godt fast midt på panelet. LME anbefaler at knitrefolien aldri '
    'ligger løst, kun sydd fast i en helt lukket lomme, akkurat som speilet.',
    'Place a small sheet of crinkling material, a crinkle sheet intended for baby products, '
    'between the two clouds, and sew them together around the entire edge with tight stitches, '
    'so the sheet is fully enclosed and cannot be removed. This is what makes the crinkle sound: '
    'when the cloud is squeezed, the crinkle sheet inside crumples and makes the crisp, '
    'crinkling sound the child will discover. Sew the finished, filled cloud securely onto the '
    'middle of the panel. LME recommends that the crinkle sheet is never left loose, only sewn '
    'into a fully closed pocket, just like the mirror.')

# ---------------------------------------------------------------- SIDE 13: SAMMENSYING
add('banner_sammensying', 'DEL 7: SAMMENSYING TIL KUBE', 'PART 7: ASSEMBLING THE CUBE')
add('sammensying_lead',
    'Bunnen holdes helt enkel, uten pynt, i kremhvitt med samme kantfarge som de andre. Deretter '
    'syr du alle seks sidene sammen til en kube.',
    'The bottom is kept completely plain, without decoration, in cream with the same edging '
    'colour as the others. Then you sew all six sides together into a cube.')
add('sammensying_steg', [
    'Legg de seks ferdige panelene ut i den rekkefølgen du vil ha dem: Ellie-siden foran, '
    'knitre-siden bak, speil-siden og form-siden på hver sin side, lomme-siden øverst, og '
    'bunnen nederst.',
    'Sy sammen fem av de seks sømmene med tett kanthekling eller overstingsøm, rett sider ut, '
    'slik at du får en åpen kube med kun ett hull igjen.',
    'Sett inn de seks skumkvadratene, ett i hver side, gjennom det siste åpne hullet, sammen '
    'med litt løs fyllwatt i hjørnene for en myk følelse.',
    'Sy igjen det siste hullet like tett og sikkert som de andre fem sømmene.',
    'Gå gjennom alle seks sømmene en gang til utenpå, med tette sting, for ekstra styrke der '
    'barnehender skal dra og klemme.',
], [
    'Lay out the six finished panels in the order you want them: the Ellie side at the front, '
    'the crinkle side at the back, the mirror side and the shapes side on either side, the '
    'pocket side on top, and the bottom underneath.',
    'Sew together five of the six seams with tight edging stitches or a whip stitch, right '
    'sides out, so you have an open cube with only one hole left.',
    'Insert the six foam squares, one into each side, through the last open hole, along with a '
    'little loose stuffing in the corners for a soft feel.',
    'Sew the last hole closed just as tightly and securely as the other five seams.',
    'Go over all six seams once more on the outside, with tight stitches, for extra strength '
    'where little hands will pull and squeeze.',
])

# ---------------------------------------------------------------- SIDE 14: TOPPHÅNDTAKET
add('banner_handtak', 'DEL 8: TOPPHÅNDTAKET', 'PART 8: THE TOP HANDLE')
add('handtak_txt',
    'Tre et utvalg runde treperler og garnkledde kuler (pudderrosa, salviegrønt, kremhvitt, lys '
    'himmelblå og gult, akkurat som på Ellies vognlenke) på en kort, sterk bomullssnor, i den '
    'rekkefølgen du liker. Sy begge endene av snoren godt fast langs den øverste sømmen, mellom '
    'Ellie-siden og lomme-siden, slik at perlerekken danner en liten bue over toppen, som et '
    'håndtak.',
    "Thread a selection of round wooden beads and yarn-covered balls (powder pink, sage green, "
    "cream, light sky blue and yellow, just like on Ellie's stroller toy) onto a short, sturdy "
    "cotton cord, in whatever order you like. Sew both ends of the cord securely along the top "
    "seam, between the Ellie side and the pocket side, so the row of beads forms a small arch "
    "over the top, like a handle.")
add('handtak_note',
    'Perlekulene hekles akkurat som kulene på smokkelenken: 6 fm i magisk ring, økn x 6 (12), '
    '12 fm i 2 omganger, mink x 6 (6), fyll lett og fest av.',
    "The bead balls are crocheted just like the balls on the pacifier clip: 6 sc in a magic "
    "ring, inc x 6 (12), 12 sc for 2 rounds, dec x 6 (6), stuff lightly and fasten off.")

# ---------------------------------------------------------------- SIDE 15: HJØRNERINGENE
add('banner_hjorner', 'DEL 9: HJØRNERINGENE OG DUSKENE', 'PART 9: THE CORNER RINGS AND TASSELS')
add('hjorner_txt',
    'Sy en treteetheringe godt fast i hver av de to loddrette sømmene som flankerer Ellie-siden '
    '(sømmen mot speil-siden på den ene siden, sømmen mot form-siden på den andre), slik at '
    'ringene henger som i referansebildet. Ringen skal sys fast med flere runder tett '
    'overstingsøm, ikke bare tres løst gjennom sømmen.',
    "Sew a wooden teething ring securely into each of the two vertical seams flanking the Ellie "
    "side (the seam towards the mirror side on one side, the seam towards the shapes side on "
    "the other), so the rings hang as in the reference photo. Each ring must be sewn on with "
    "several rounds of tight whip stitching, not just threaded loosely through the seam.")
add('dusker_txt',
    'Lag to korte perledusker: tre 2 til 3 kuler/perler (for eksempel én garnkledd kule, én '
    'treperle, én garnkledd kule) på en kort bomullssnor, maks 6 til 8 cm lang, og sy det faste '
    'festepunktet godt fast like ved hver hjørnering. Ingen løkke skal være løs eller lang nok '
    'til å kunne strekkes ut over 8 cm.',
    'Make two short bead tassels: thread 2 to 3 balls/beads (for example one yarn-covered ball, '
    'one wooden bead, one yarn-covered ball) onto a short cotton cord, no more than 6 to 8 cm '
    'long, and sew the fixed attachment point securely right next to each corner ring. No loop '
    'should be loose or long enough to stretch out beyond 8 cm.')

# ---------------------------------------------------------------- SIDE 16: MONTERING
add('banner_montering', 'MONTERING, STEG FOR STEG', 'ASSEMBLY, STEP BY STEP')
add('montering_steg', [
    'Hekle de seks grunnkvadratene og kant dem alle i lyst brunt.',
    'Hekle Ellie-siden, speil-siden, form-siden, lomme-siden og knitre-siden, hver på sitt eget '
    'grunnkvadrat. La bunnen være enkel.',
    'Sy fem av sømmene sammen til en åpen kube, sett inn skumkvadratene og litt fyll, og sy '
    'igjen den siste sømmen.',
    'Fest topphåndtaket langs den øverste sømmen.',
    'Fest de to hjørneringene og de to perleduskene i sømmene som flankerer Ellie-siden.',
    'Sy knitrefolien trygt inn mellom de to skyene, og fest den ferdige skyen midt på '
    'knitre-siden.',
    'Fest alle løse tråder godt på innsiden av delene, og klipp av det som er igjen.',
    'Dra forsiktig i hver eneste del, ring og dusk, og trykk lett på skyen, for å kontrollere '
    'at ingenting løsner, før leken tas i bruk.',
])
add('montering_steg_en', [
    'Crochet the six base squares and edge them all in light brown.',
    'Crochet the Ellie side, the mirror side, the shapes side, the pocket side and the crinkle '
    'side, each onto its own base square. Leave the bottom plain.',
    'Sew five of the seams together into an open cube, insert the foam squares and a little '
    'stuffing, and sew the last seam closed.',
    'Attach the top handle along the top seam.',
    'Attach the two corner rings and the two bead tassels into the seams flanking the Ellie '
    'side.',
    'Sew the crinkle sheet securely between the two clouds, and attach the finished cloud to '
    'the middle of the crinkle side.',
    'Fasten every loose end securely on the inside of the pieces, and trim what is left.',
    'Gently tug on every single part, ring and tassel, and press lightly on the cloud, to '
    'check that nothing comes loose, before the toy is used.',
])

# ---------------------------------------------------------------- SIDE 17: FOTOVEILEDNING
add('banner_foto', 'FOTOVEILEDNING', 'PHOTO GUIDE')
add('foto_lead',
    'Sett inn egne bilder av hvert steg her når du har heklet aktivitetskuben selv.',
    'Add your own photos of each step here once you have crocheted the activity cube yourself.')
add('foto_captions',
    ['De seks sidene, ferdig heklet', 'Kuben sydd sammen', 'Hjørneringer og topphåndtak',
     'Ferdig kube'],
    ['The six sides, crocheted', 'The cube sewn together', 'Corner rings and top handle',
     'The finished cube'])

# ---------------------------------------------------------------- SIDE 18: SIKKERHET
add('banner_sikkerhet', 'SIKKERHET, DEN VIKTIGSTE SIDEN', 'SAFETY, THE MOST IMPORTANT PAGE')
add('pill_smadeler', 'MANGE SMÅ DELER, ÉN REGEL: ALT SYS FAST', 'MANY SMALL PARTS, ONE RULE: SEW EVERYTHING ON')
add('smadeler_txt',
    'Denne leken har flere motiver og flere ulike materialer (garn, tre, speil, snor) enn noen '
    'annen oppskrift i Ellie-kolleksjonen. Hvert eneste motiv, hver ring og hver perle skal sys '
    'fast med sterk, tvinnet bomullstråd og mange, tette sting, gjennomgått minst to ganger. '
    'Speilet skal alltid være helt innsydd i en lukket lomme, aldri løst i det vanlige fyllet.',
    'This toy has more motifs and more different materials (yarn, wood, mirror, cord) than any '
    'other pattern in the Ellie collection. Every single motif, every ring and every bead must '
    'be sewn on with strong, twisted cotton thread and plenty of tight stitches, going around '
    'at least twice. The mirror must always be fully enclosed in a closed pocket, never loose '
    'in the regular stuffing.')
add('pill_regler', 'FLERE VIKTIGE REGLER', 'MORE IMPORTANT RULES')
add('regler',
    ['Brukes alltid under tilsyn av en voksen, spesielt de første gangene, til du er trygg på '
     'at alle sømmer holder.',
     'Ingen deler limes. Alt sys fast, ingenting festes med binders, sikkerhetsnåler eller '
     'lignende.',
     'Bruk kun et babysikkert speil i akryl/plast, aldri ekte glass eller speil beregnet for '
     'voksne.',
     'Knitrefolien skal alltid være helt innsydd mellom de to skylagene, aldri løs i det '
     'vanlige fyllet, og aldri tilgjengelig gjennom en åpen søm.',
     'Hjørneringenes perledusker skal aldri være lengre enn ca. 6 til 8 cm, og skal sys fast, '
     'ikke bare tres løst.',
     'Skumkvadratene skal alltid være helt innsydd inni kuben, aldri tilgjengelige eller synlige '
     'i en åpen søm.',
     'Sjekk leken jevnlig, og spesielt før hver bruk: dra forsiktig i alle motivene og ringene, '
     'og trykk lett på skyen. Kast eller reparer umiddelbart hvis noe er løst.',
     'Denne oppskriften er en veiledning for hjemmebruk. Skal det ferdige produktet selges, må '
     'det alltid kontrolleres, testes og eventuelt merkes i henhold til gjeldende lokale '
     'sikkerhetskrav og regelverk for barneprodukter/leketøy, som stiller strenge krav til '
     'nettopp leker med mange små, påsydde deler og snorer.'],
    ['Always use under adult supervision, especially the first few times, until you are '
     'confident every seam holds.',
     'No parts are glued. Everything is sewn on, nothing is attached with paperclips, safety '
     'pins or similar.',
     'Use only a baby-safe acrylic/plastic mirror, never real glass or a mirror intended for '
     'adults.',
     'The crinkle sheet must always be fully enclosed between the two cloud layers, never loose '
     'in the regular stuffing, and never accessible through an open seam.',
     'The corner rings\' bead tassels must never be longer than approx. 6 to 8 cm, and must be '
     'sewn on, not just threaded loosely.',
     'The foam squares must always be fully enclosed inside the cube, never accessible or '
     'visible through an open seam.',
     'Check the toy regularly, and especially before every use: gently tug on every motif and '
     'ring, and press lightly on the cloud. Discard or repair immediately if anything is loose.',
     'This pattern is a guide for home use. If the finished product is sold, it must always be '
     'checked, tested and marked as required under current local safety requirements and '
     "regulations for children's products/toys, which set strict requirements specifically for "
     'toys with many small, sewn-on parts and cords.'])

# ---------------------------------------------------------------- SIDE 19: STELL
add('banner_stell', 'STELL OG VASK', 'CARE AND WASHING')
add('stell_txt',
    'Håndvask forsiktig i lunkent vann med litt mild såpe, siden kuben har mange sydde deler og '
    'en indre stiving. Skyll godt. Klem forsiktig ut vannet i et håndkle, ikke vri. Legg til '
    'tørk flatt, med god tid til at den indre stivingen tørker helt, og sjekk alle sømmer nøye '
    'før leken tas i bruk igjen.',
    'Hand wash gently in lukewarm water with a little mild soap, since the cube has many sewn '
    'parts and an inner stiffening. Rinse well. Gently press out the water in a towel, do not '
    'wring. Lay flat to dry, allowing plenty of time for the inner stiffening to dry completely, '
    'and check every seam carefully before using the toy again.')
add('pill_qr', 'VIDEOVEILEDNING', 'VIDEO GUIDE')
add('qr_caption', 'QR-kode til videoveiledning (legges til)', 'QR code to video guide (to be added)')

# ---------------------------------------------------------------- SIDE 20: FERDIG
add('banner_ferdig', 'GRATULERER, AKTIVITETSKUBEN ER FERDIG!', 'CONGRATULATIONS, THE ACTIVITY CUBE IS DONE!')
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
<div class="coverimg"><img src="{ref_src}" alt="Ellies aktivitetsleke, stiluttrykk-referanse"></div>
<p class="small center" style="margin-top:-2mm;">{'Bildet viser stiluttrykk-referansen for aktivitetskuben, ikke det ferdige heklede produktet.' if lang == 'no' else 'Photo shows the style reference for the activity cube, not the finished crocheted product.'}</p>
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
{banner(t('banner_kvadrat'))}
<p>{t('kvadrat_lead')}</p>
{card('<p>' + t('kvadrat_txt') + '</p>')}
{cme(t('kvadrat_kant'))}
''', 7))

    ellie_rows = T['ellie_rows']['no'] if lang == 'no' else T['ellie_rows_en']['no']
    pages.append(pg(f'''
{banner(t('banner_ellie'))}
<p>{t('ellie_lead')}</p>
{card(otab(ellie_rows, head3[lang]))}
{cme(t('ellie_ferdig'))}
{card('<p>' + t('ellie_sloyfe') + '</p>')}
{card('<p>' + t('ellie_krage') + '</p>')}
''', 8))

    pages.append(pg(f'''
{banner(t('banner_speil'))}
<p>{t('speil_lead')}</p>
{card('<p>' + t('speil_txt') + '</p>')}
{card('<p>' + t('speil_ramme') + '</p>')}
{cme(t('speil_note'))}
''', 9))

    pages.append(pg(f'''
{banner(t('banner_form'))}
<p>{t('form_lead')}</p>
{rosep(t('pill_hjerte'))}
{card('<p>' + t('hjerte_txt') + '</p>')}
{sagep(t('pill_stjerne_form'))}
{card('<p>' + t('stjerne_form_txt') + '</p>')}
''', 10))

    pages.append(pg(f'''
{rosep(t('pill_sirkel'))}
{card('<p>' + t('sirkel_txt') + '</p>')}
{sagep(t('pill_trekant'))}
{card('<p>' + t('trekant_txt') + '</p>')}
''', 11))

    pages.append(pg(f'''
{banner(t('banner_lomme'))}
<p>{t('lomme_lead')}</p>
{card('<p>' + t('lomme_txt') + '</p>')}
{card('<p>' + t('lomme_ellie') + '</p>')}
{cme(t('lomme_montering'))}
''', 12))

    pages.append(pg(f'''
{banner(t('banner_flette'))}
<p>{t('flette_lead')}</p>
{card('<p>' + t('flette_hull') + '</p>')}
{cme(t('flette_snor'))}
''', 13))

    ss_steg = T['sammensying_steg']['no'] if lang == 'no' else T['sammensying_steg']['en']
    pages.append(pg(f'''
{banner(t('banner_sammensying'))}
<p>{t('sammensying_lead')}</p>
{card(steps(ss_steg))}
''', 14))

    pages.append(pg(f'''
{banner(t('banner_handtak'))}
{card('<p>' + t('handtak_txt') + '</p>')}
{cme(t('handtak_note'))}
''', 15))

    pages.append(pg(f'''
{banner(t('banner_hjorner'))}
{card('<p>' + t('hjorner_txt') + '</p>')}
{cme(t('dusker_txt'))}
''', 16))

    mo_steg = T['montering_steg']['no'] if lang == 'no' else T['montering_steg_en']['no']
    pages.append(pg(f'''
{banner(t('banner_montering'))}
{card(steps(mo_steg))}
''', 17))

    foto_caps = T['foto_captions']['no'] if lang == 'no' else T['foto_captions']['en']
    pages.append(pg(f'''
{banner(t('banner_foto'))}
{card('<p class="center">' + t('foto_lead') + '</p>')}
{photo_row(foto_caps)}
''', 18))

    regler = T['regler']['no'] if lang == 'no' else T['regler']['en']
    pages.append(pg(f'''
{banner(t('banner_sikkerhet'))}
{rosep(t('pill_smadeler'))}
{card('<p>' + t('smadeler_txt') + '</p>')}
{sagep(t('pill_regler'))}
{card(ul(regler))}
''', 19))

    pages.append(pg(f'''
{banner(t('banner_stell'))}
{cme(t('stell_txt'))}
{rosep(t('pill_qr'))}
{qr_placeholder(t('qr_caption'))}
''', 20))

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
''', 21))

    return pages

for lang in ('no', 'en'):
    html_doc = kit.doc(lang, T['doctitle'][lang], None, build(lang))
    out = BASE / f'aktivitetsleke_{lang}.html'
    out.write_text(html_doc, encoding='utf-8')
    print('OK', lang, len(html_doc), 'tegn/chars')
