# -*- coding: utf-8 -*-
"""Genererer LME-hekleoppskrift 'Pips smokkelenke' (norsk + engelsk) som HTML,
klar for PDF-print med Chromium. Del av LME Baby Collection 'Woodland Dreams'."""
import base64, pathlib, sys

BASE = pathlib.Path(__file__).parent
sys.path.insert(0, str(BASE.parent / '_shared'))
import lme_pattern_kit as kit
from lme_pattern_kit import (BROWN, BROWN_MID, BROWN_DARK, CREAM, CREAM_DEEP, ROSE, SAGE, INK,
                              banner, rosep, sagep, card, cream, cme, ul, steps, otab, abbrtab)

FACE_REF = BASE / 'pip_face_ref.png'
face_b64 = base64.b64encode(FACE_REF.read_bytes()).decode()
face_src = f'data:image/png;base64,{face_b64}'

PIGG = '#6B4226'

T = {}
def add(key, no, en=None):
    T[key] = {'no': no, 'en': en if en is not None else no}

# ---------------------------------------------------------------- SIDE 1
add('doctitle', "Pips smokkelenke, LME hekleoppskrift", "Pip's Pacifier Clip, LME crochet pattern")
add('ph2', 'LME HEKLEOPPSKRIFT&nbsp;&nbsp;|&nbsp;&nbsp;PIPS SMOKKELENKE',
    "LME CROCHET PATTERN&nbsp;&nbsp;|&nbsp;&nbsp;PIP'S PACIFIER CLIP")
add('covertag', 'LME HEKLEOPPSKRIFT - BABY', 'LME CROCHET PATTERN - BABY')
add('covertitle', 'PIPS SMOKKELENKE', "PIP'S PACIFIER CLIP")
add('subpill', 'LME BABY COLLECTION - WOODLAND DREAMS', 'LME BABY COLLECTION - WOODLAND DREAMS')
add('cover_desc',
    'En liten smokkelenke med et forenklet pinnsvinhode inspirert av Pip, med en salviegrønn '
    'volangkrage rundt halsen, en liten løkkemasket "piggstripe" i stedet for sløyfe, og noen '
    'myke heklede kuler med en stjerneperle. Heklet i de samme naturfargene som resten av '
    'kolleksjonen. Maks lengde er satt for å følge gjeldende sikkerhetsanbefaling for '
    'smokkeholdere.',
    "A little pacifier clip with a simplified hedgehog head inspired by Pip, with a sage "
    "green ruffled collar around the neck, a little loop-stitch \"spike stripe\" instead of a "
    "bow, and a few soft crocheted balls with a star bead. Crocheted in the same natural "
    "colours as the rest of the collection. Maximum length follows current safety guidance "
    "for soother holders.")
add('by1', 'Av Renate Dahl', 'By Renate Dahl')
add('by2', 'Little Montessori Explorers', 'Little Montessori Explorers')
add('by3', 'lmexplorers.com', 'lmexplorers.com')
add('cover_tip',
    'VIKTIG: Les sikkerhetssiden nøye før du begynner, og kontroller alltid ferdig lenke mot '
    'gjeldende lokale sikkerhetskrav for smokkeholdere før den tas i bruk eller selges.',
    'IMPORTANT: Read the safety page carefully before you start, and always check the finished '
    'clip against current local safety requirements for soother holders before use or sale.')

# ---------------------------------------------------------------- SIDE 2
add('banner_om', 'OM PIPS SMOKKELENKE', "ABOUT PIP'S PACIFIER CLIP")
add('pill_historien', 'DEL AV ELLIES VERDEN', "PART OF ELLIE'S WORLD")
add('om_historien',
    'Pips smokkelenke hører til LME Baby Collection "Woodland Dreams", samme skogsunivers som '
    'Pip, det lille pinnsvinet. Det lille pinnsvinhodet på lenken er en forenklet utgave av '
    'Pip, akkurat stor nok til å henge trygt og lekent ved siden av smokken.',
    "Pip's pacifier clip belongs to the LME Baby Collection \"Woodland Dreams\", the same "
    "woodland world as Pip, the little hedgehog. The small hedgehog head on the clip is a "
    "simplified version of Pip, just the right size to hang safely and playfully next to the "
    "pacifier.")
add('pill_stil', 'STIL', 'STYLE')
add('om_stil',
    'Minimalistisk, Montessori-inspirert og skandinavisk, i de samme naturfargene som Pip: '
    'kremhvitt og mørkt varmt brunt. Rolig og enkelt, aldri overlesset.',
    'Minimalist, Montessori-inspired and Scandinavian, in the same natural colours as Pip: '
    'cream and dark warm brown. Calm and simple, never cluttered.')
add('pill_sikkerhet_kort', 'VIKTIGST AV ALT: SIKKERHET', 'MOST IMPORTANT OF ALL: SAFETY')
add('om_sikkerhet_kort',
    'En smokkelenke er noe barnet har tett på ansiktet, ofte alene i vogn eller seng. Derfor er '
    'lengden på denne oppskriften bevisst kort, og hele side 12 er viet sikkerhet. Les den '
    'siden før du hekler videre.',
    "A pacifier clip is something a baby has close to their face, often alone in a pram or "
    "bed. That's why this pattern's length is deliberately short, and all of page 12 is "
    "dedicated to safety. Read that page before you crochet on.")

# ---------------------------------------------------------------- SIDE 3
add('banner_mat', 'MATERIALER OG GARNALTERNATIVER', 'MATERIALS AND YARN ALTERNATIVES')
add('pill_garn', 'GARN', 'YARN')
add('garn_txt',
    'Bystrikk Merino (kremhvit og mørkt varmt brunt). Samme garn som resten av Pip sin '
    'oppskrift, så restene ofte strekker til.',
    "Bystrikk Merino (cream and dark warm brown). Same yarn as the rest of Pip's pattern, so "
    "leftovers often stretch to cover this.")
add('garn_alt',
    'Alternativt garn: Enhver myk bomullsblanding i DK-tykkelse (fx. DROPS Safran, Hobbii '
    'Amigo, Rico Ricorumi) fungerer fint. Unngå akryl helt nær munnen, bomull er lettest å '
    'vaske rent.',
    'Alternative yarn: any soft cotton-blend DK-weight yarn (e.g. DROPS Safran, Hobbii Amigo, '
    'Rico Ricorumi) works well. Avoid acrylic close to the mouth, cotton is easiest to wash '
    'clean.')
add('pill_utstyr', 'UTSTYR OG TILBEHØR', 'TOOLS AND SUPPLIES')
add('utstyr', [
    ('Heklenål 3 eller 3,5 mm', 'litt tettere enn Pip selv, siden delene er små'),
    ('Polyesterfiber til fyll', 'liten mengde'),
    ('Stoppenål med butt spiss', 'til all somming'),
    ('Rund tre-kuleklips med smokkelenke-mekanisme', 'kjøpt hos leverandør av '
     'smokkelenke-tilbehør, med sikker, innkapslet fjærmekanisme, BPA-fri/CE-merket og '
     'beregnet spesielt for smokkeholdere (se side om sikkerhet)'),
    ('Én stjerneformet treperle', 'umalt/CE-merket, samme hull-størrelse som de andre '
     'treperlene'),
    ('Smokkering eller adapterring', 'BPA-fri, beregnet for smokkeholdere, tres gjennom '
     'snorløkken i enden'),
    ('Tvinnet bomullstråd og nål', 'til å sy delene godt fast'),
    ('Saks og målebånd', ''),
])
add('pill_perler', 'MED ELLER UTEN PERLER', 'WITH OR WITHOUT BEADS')
add('perler_txt',
    'Denne oppskriften kan hekles helt uten perler (kun heklede kuler), eller varieres med '
    'perler mellom de heklede delene:',
    'This pattern can be crocheted entirely without beads (crocheted balls only), or varied '
    'with beads between the crocheted pieces:')
add('perler_alt', [
    ('Uten perler', 'kun heklede kuler og motiver. Tryggest og enklest, anbefalt for de '
     'minste.', 'Without beads', 'crocheted balls and motifs only. Safest and simplest, '
     'recommended for the youngest babies.'),
    ('Med treperler', 'umalte, CE-merkede treperler beregnet for barn, med hull stort nok for '
     'tykk tråd.', 'With wooden beads', 'unpainted, CE-marked wooden beads intended for '
     'children, with a hole wide enough for thick cord.'),
    ('Med silikonperler', 'matte, BPA-frie silikonperler beregnet for tyggelenker/'
     'babyprodukter.', 'With silicone beads', 'matte, BPA-free silicone beads intended for '
     'teething/baby products.'),
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
    'EN 12586. See the safety page for the full explanation. Never crochet the clip longer '
    'than this, regardless of age.')
add('pill_fasthet', 'HEKLEFASTHET', 'GAUGE')
add('fasthet_txt',
    'Hekle stramt, amigurumi-fasthet: ca. 20 fm x 22 omganger = 10 x 10 cm på nål 3 mm. Fyllet '
    'skal ikke synes gjennom maskene.',
    'Crochet tightly, amigurumi tension: approx. 20 sc x 22 rounds = 10 x 10 cm on a 3 mm '
    'hook. The stuffing should not show through the stitches.')

# ---------------------------------------------------------------- SIDE 5
add('banner_ord', 'FORKORTELSER (NORSK OG US)', 'ABBREVIATIONS (NORWEGIAN AND US)')
add('ord_lead',
    'Denne oppskriften bruker samme løkkemaske-teknikk som Pips pigger, i miniatyr. Her er '
    'alle forkortelsene, med de vanlige amerikanske hekletermene ved siden av.',
    "This pattern uses the same loop-stitch technique as Pip's spikes, in miniature. Here are "
    "all the abbreviations, with the common US crochet terms alongside.")
add('ord_head', ['Norsk', 'US', 'Betyr'], ['Norwegian', 'US', 'Means'])
add('ord_rows', [
    ('lm', 'ch', 'luftmaske / chain'),
    ('fm', 'sc', 'fastmaske / single crochet'),
    ('kjm', 'sl st', 'kjedemaske / slip stitch'),
    ('løkkm', 'loop st', 'løkkemaske: se Pips egen oppskrift for full forklaring'),
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
    'Lay all the pieces out side by side before assembling, so you can see how the length '
    'works out.',
    'Always measure the finished clip fully stretched out, not relaxed, when checking the '
    'length.',
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
    ('1. Det lille pinnsvinhodet', 'forenklet Pip med mini-piggstripe, én per lenke',
     '1. The little hedgehog head', 'a simplified Pip with a mini spike stripe, one per clip'),
    ('2. Volangkragen', 'salviegrønn, rundt halsen', '2. The ruffled collar', 'sage green, '
     'around the neck'),
    ('3. Piggstripen', 'liten løkkemasket stripe i stedet for sløyfe', '3. The spike stripe',
     'a little loop-stitch stripe instead of a bow'),
    ('4. De heklede kulene', 'så mange du trenger for å fylle ut lengden, med én stjerneperle',
     '4. The crocheted balls', 'as many as you need to fill out the length, with one star '
     'bead'),
])

# ---------------------------------------------------------------- SIDE 7: HODET
add('banner_hode', 'DEL 1: DET LILLE PINNSVINHODET', 'PART 1: THE LITTLE HEDGEHOG HEAD')
add('hode_lead',
    'En forenklet, liten utgave av Pips hode, kremhvit, uten egen snute.',
    "A simplified, small version of Pip's head, cream, without a separate snout.")
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
    'Hekle to små flate sirkler i mørkt varmt brunt: 5 fm i magisk ring, avslutt. Sy dem fast '
    'øverst på hodet, med litt avstand mellom, som en miniatyr av Pips egne ører.',
    "Crochet two small flat circles in dark warm brown: 5 sc in a magic ring, fasten off. Sew "
    "them onto the top of the head, with a little space between, as a miniature of Pip's own "
    "ears.")
add('pill_ansikt_mini', 'ANSIKTET, BRODERT', 'THE FACE, EMBROIDERED')
add('ansikt_mini_txt',
    'Brodér to små, runde øyne i svart satengsting og en liten trekantet nese under. Ikke bruk '
    'sikkerhetsøyne med plastdeler her, siden lenken skal være helt uten harde eller løse '
    'deler. Se referansebildet fra Pip for inspirasjon til uttrykket, i miniatyr.',
    'Embroider two small, round eyes in black satin stitch and a tiny triangular nose below. '
    'Do not use plastic safety eyes here, since the clip must be entirely free of hard or '
    "loose parts. See the reference photo from Pip for inspiration on the expression, in "
    "miniature.")

# ---------------------------------------------------------------- SIDE 8: VOLANGKRAGEN
add('banner_krage', 'DEL 2: VOLANGKRAGEN', 'PART 2: THE RUFFLED COLLAR')
add('pill_krage', 'VOLANGKRAGEN (SALVIEGRØNN)', 'THE RUFFLED COLLAR (SAGE GREEN)')
add('krage_txt',
    'Fest salviegrønn tråd rundt kanten der hodet er som smalest, nederst. *1 fm i neste '
    'maske, hopp over 1 maske, 3 stav i neste maske (en liten vifte), hopp over 1 maske*, '
    'gjenta rundt hele kanten. Fest av og gjem tråden.',
    'Attach sage green yarn around the edge where the head is narrowest, at the bottom. '
    '*1 sc in the next stitch, skip 1 stitch, 3 dc in the next stitch (a little fan), skip 1 '
    'stitch*, repeat all the way around the edge. Fasten off and weave in the end.')
add('pill_krage_fest', 'PLASSERING', 'PLACEMENT')
add('krage_fest_txt',
    'Volangkragen hekles direkte på hodet og trenger ingen ekstra festing, den sitter fast '
    'som en liten ruflete kant rundt halsen.',
    'The ruffled collar is crocheted directly onto the head and needs no extra attaching, it '
    'sits in place as a little ruffled edge around the neck.')

# ---------------------------------------------------------------- SIDE 9: PIGGSTRIPEN
add('banner_pigg', 'DEL 3: PIGGSTRIPEN', 'PART 3: THE SPIKE STRIPE')
add('pill_pigg', 'PIGGSTRIPEN (MØRKT VARMT BRUNT)', 'THE SPIKE STRIPE (DARK WARM BROWN)')
add('pigg_txt',
    'I stedet for en sløyfe får Pip sin smokkelenke en miniatyr av signaturdelen hans: legg '
    'opp 4 lm + 1 vendemaske, 1 rad løkkm (4 løkkm), akkurat samme teknikk som i Pips egen '
    'oppskrift, bare mye kortere. Klipp av med god tråd igjen.',
    "Instead of a bow, Pip's pacifier clip gets a miniature of his signature part: chain 4 + 1 "
    "turning chain, 1 row of loop st (4 loop st), the exact same technique as in Pip's own "
    "pattern, just much shorter. Cut the yarn, leaving a long tail.")
add('pill_pigg_fest', 'FEST PIGGSTRIPEN TIL HODET', 'ATTACH THE SPIKE STRIPE TO THE HEAD')
add('pigg_fest_txt',
    'Sy piggstripen fast langs midtlinjen fra pannen og bakover, akkurat som på Pip selv, med '
    'tette sting slik at ingen løkker kan dras løse.',
    "Sew the spike stripe on along the centre line from the forehead and backward, just like "
    "on Pip himself, with tight stitches so that no loops can be pulled loose.")

# ---------------------------------------------------------------- SIDE 10: KULENE
add('banner_kuler', 'DEL 4: DE HEKLEDE KULENE', 'PART 4: THE CROCHETED BALLS')
add('kuler_lead',
    'Hekle så mange kuler du trenger for å fylle ut lengden mellom klipsen og pinnsvinhodet, '
    'gjerne i en rytme av kremhvitt og mørkt brunt, med treperler mellom og én stjerneformet '
    'treperle et sted i rekken. Husk: total lengde skal aldri bli mer enn 22 cm.',
    'Crochet as many balls as you need to fill out the length between the clip and the '
    'hedgehog head, for example alternating cream and dark brown, with wooden beads in '
    'between and one star-shaped wooden bead somewhere in the row. Remember: the total '
    'length must never exceed 22 cm.')
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
    'avhenger av hvor stor smokkering og klips du bruker, tell alltid opp hele lenken før du '
    'fester noe permanent.',
    'Stuff lightly, cut with a long tail on each ball. Diameter approx. 1.5 cm. The number of '
    'balls depends on the size of the pacifier ring and clip you use, always lay out the '
    'whole clip before attaching anything permanently.')
add('pill_lokke', 'SNORLØKKEN TIL SMOKKERINGEN', 'THE CORD LOOP FOR THE PACIFIER RING')
add('lokke_txt',
    'I stedet for å feste smokkeringen rett på siste kule, hekler du en kort, fast strimmel i '
    'kremhvitt: legg opp 16 lm + 1 vendemaske, 1 rad fm tilbake (16 fm). Fold strimmelen på '
    'langs og sy sammen til en tynn, rund snor. Bøy snoren i en løkke og sy endene godt fast '
    'til siste kule i enden av lenken. Tre smokkeringen gjennom løkka før du fester det hele.',
    'Instead of attaching the pacifier ring directly to the last ball, crochet a short, firm '
    'strip in cream: chain 16 + 1 turning chain, 1 row of sc back (16 sc). Fold the strip '
    'lengthwise and sew together into a thin, round cord. Bend the cord into a loop and sew '
    'the ends securely to the last ball at the end of the clip. Thread the pacifier ring '
    'through the loop before attaching the whole piece.')

# ---------------------------------------------------------------- SIDE 10: MONTERING
add('banner_montering', 'MONTERING, STEG FOR STEG', 'ASSEMBLY, STEP BY STEP')
add('montering_lead',
    'Legg alle delene ut i den rekkefølgen du vil ha dem, og mål hele lenken strukket ut før du '
    'syr eller knyter noe fast.',
    'Lay out all the pieces in the order you want them, and measure the whole clip fully '
    'stretched out before you sew or tie anything in place.')
add('montering_steg', [
    'Hekle volangkragen rundt nederste kant av pinnsvinhodet, og sy piggstripen fast langs '
    'midtlinjen.',
    'Tre eller sy kulene og stjerneperlen (og eventuelle andre perler) i ønsket rekkefølge på '
    'en kort, sterk bomullssnor eller direkte sammen med tett heftesting mellom hver del.',
    'Fest pinnsvinhodet i den ene enden.',
    'Hekle snorløkken og sy den godt fast til siste kule i den andre enden, tre smokkeringen '
    'gjennom løkka.',
    'Mål hele lenken strukket helt ut. Er den lengre enn 22 cm, ta bort en kule eller to.',
    'Sy den ferdige lenken godt fast i tre-kuleklipsen, med mange, tette sting.',
    'Fest alle løse tråder godt på innsiden av delene, og klipp av det som er igjen.',
])
add('montering_steg_en', [
    'Crochet the ruffled collar around the bottom edge of the hedgehog head, and sew the '
    'spike stripe on along the centre line.',
    'Thread or sew the balls and the star bead (and any other beads) in the order you want, '
    'on a short, strong cotton cord, or sew them directly together with tight running stitch '
    'between each piece.',
    'Attach the hedgehog head at one end.',
    'Crochet the cord loop and sew it securely to the last ball at the other end, thread the '
    'pacifier ring through the loop.',
    'Measure the whole clip fully stretched out. If it is longer than 22 cm, remove a ball or '
    'two.',
    'Sew the finished clip securely onto the wooden ball clip, with plenty of tight stitches.',
    'Fasten every loose end securely on the inside of the pieces, and trim what is left.',
])

# ---------------------------------------------------------------- SIDE 11: SIKKERHET
add('banner_sikkerhet', 'SIKKERHET, DEN VIKTIGSTE SIDEN', 'SAFETY, THE MOST IMPORTANT PAGE')
add('pill_lengde', 'MAKS LENGDE: 22 CM', 'MAX LENGTH: 22 CM')
add('lengde_txt',
    'Denne oppskriften følger prinsippet i den europeiske standarden EN 12586 for '
    'smokkeholdere: en enkel smokkelenke (klips + snor/lenke uten andre feste- eller '
    'opphengsfunksjoner) skal ikke være lengre enn 220 mm (22 cm) strukket helt ut. Formålet '
    'er å gjøre det umulig for lenken å danne en løkke rundt barnets hals. Hekle aldri en '
    'lenke lengre enn dette, uansett hvor gammelt barnet er.',
    'This pattern follows the principle in the European standard EN 12586 for soother holders: '
    "a simple pacifier clip (clip + strap/chain with no other attachment features) must not be "
    "longer than 220 mm (22 cm) fully stretched out. The purpose is to make it impossible for "
    "the strap to form a loop around the child's neck. Never crochet a clip longer than this, "
    "regardless of the child's age.")
add('pill_regler', 'FLERE VIKTIGE REGLER', 'MORE IMPORTANT RULES')
add('regler', [
    'Brukes alltid under tilsyn av en voksen. Ta av smokkelenken når barnet sover, ligger '
    'alene i vogn eller seng, eller er uten tilsyn.',
    'Ingen deler limes. Alt sys eller knytes fast med sterk, tvinnet bomullstråd og dobbel '
    'knute.',
    'Bruk kun umalte/CE-merkede treperler eller BPA-frie silikonperler beregnet for barn, '
    'aldri perler eller pynt beregnet for voksne smykker.',
    'Bruk kun en tre-kuleklips kjøpt spesielt til smokkelenker, med innkapslet '
    'fjærmekanisme, BPA-fri/CE-merket, aldri en generell binders eller kontorklype. Fest '
    'lenken til klipsen med mange, tette sting.',
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
    'No parts are glued. Everything is sewn or tied on with strong, twisted cotton thread and '
    'a double knot.',
    'Use only unpainted/CE-marked wooden beads or BPA-free silicone beads intended for '
    'children, never beads or trim intended for adult jewellery.',
    'Use only a wooden ball clip bought specifically for pacifier clips, with an enclosed '
    'spring mechanism, BPA-free/CE-marked, never a generic binder or office clip. Attach the '
    'clip with plenty of tight stitches.',
    'Check the clip regularly for wear: loose threads, cracked beads, or parts that have gone '
    'soft or loose. Discard the clip immediately if anything is wrong.',
    'This pattern is a guide for home use. If the finished product is sold, it must always be '
    "checked, tested and marked as required under current local safety requirements and "
    "regulations for children's products, which may differ from and be updated beyond what is "
    "described here.",
])

# ---------------------------------------------------------------- SIDE 12: STELL + FERDIG
add('banner_stell', 'STELL OG VASK', 'CARE AND WASHING')
add('stell_txt',
    'Håndvask i lunkent vann med litt mild såpe. Skyll godt. Klem forsiktig ut vannet i et '
    'håndkle, ikke vri. Legg til tørk flatt. Unngå maskinvask, siden trevirke og perler kan ta '
    'skade.',
    'Hand wash in lukewarm water with a little mild soap. Rinse well. Gently press out the '
    'water in a towel, do not wring. Lay flat to dry. Avoid machine washing, since wood and '
    'beads can be damaged.')

add('banner_ferdig', 'GRATULERER, LENKEN ER FERDIG!', 'CONGRATULATIONS, THE CLIP IS DONE!')
add('ferdig_txt',
    'Nå har du heklet din egen smokkelenke inspirert av Pip. Husk å sjekke lengden en siste '
    'gang før den tas i bruk!',
    "Now you have crocheted your own pacifier clip inspired by Pip. Remember to check the "
    "length one last time before it's used!")
add('pill_kolleksjon', 'RESTEN AV LME BABY COLLECTION', 'THE REST OF THE LME BABY COLLECTION')
add('kolleksjon_liste',
    ['Ellie, det lille dådyret', 'Pip, det lille pinnsvinet', 'Felix, den lille reven',
     'Molly, det lille lammet', 'Luna, den lille kaninen', 'Oliver, den lille bjørnen',
     'Ellies smokkelenke', "Felix' smokkelenke", 'Mollys smokkelenke', 'Lunas smokkelenke',
     'Olivers smokkelenke', 'Ellies rangle', 'Ellies vognlenke', 'Ellies ballerinasko',
     'Ellies aktivitetsleke'],
    ['Ellie, the little fawn', 'Pip, the little hedgehog', 'Felix, the little fox',
     'Molly, the little lamb', 'Luna, the little bunny', 'Oliver, the little bear',
     "Ellie's pacifier clip", "Felix's pacifier clip", "Molly's pacifier clip",
     "Luna's pacifier clip", "Oliver's pacifier clip", "Ellie's rattle",
     "Ellie's stroller toy", "Ellie's ballerina shoes", "Ellie's activity toy"])
add('pill_copyright', 'COPYRIGHT', 'COPYRIGHT')
add('copyright_txt',
    '(c) Renate Dahl, Little Montessori Explorers. Denne oppskriften er et helt originalt '
    'LME-design. Du kan gjerne selge amigurumier du hekler etter denne oppskriften i din egen, '
    'lille skala, forutsatt at ferdig produkt kontrolleres mot gjeldende sikkerhetskrav. '
    'Oppskriften i seg selv, teksten og bildene, skal ikke deles, kopieres eller videreselges.',
    '(c) Renate Dahl, Little Montessori Explorers. This pattern is a fully original LME '
    'design. You are welcome to sell finished pieces you make from this pattern, on a small '
    'personal scale, provided the finished product is checked against current safety '
    'requirements. The pattern itself, its text and images, may not be shared, copied or '
    'resold.')

# ================================================================== BYGG SIDENE

def build(lang):
    RIGHT = {'no': 'LME HEKLING', 'en': 'LME CROCHET'}[lang]
    def t(key): return T[key][lang]
    PH2 = t('ph2')
    def pg(body, num): return kit.page(body, num, RIGHT, PH2, t('doctitle'))
    pages = []

    pages.append(pg(f'''
<div class="figwrap"><img src="{face_src}" style="width:98mm;border-radius:14px;box-shadow:0 3px 10px rgba(0,0,0,.18);" alt="Pip, stiluttrykk-referanse"></div>
<p class="small center" style="margin-top:-2mm;">{'Bildet viser Pip som stiluttrykk-referanse, ikke selve smokkelenken.' if lang == 'no' else 'Photo shows Pip as a style reference, not the pacifier clip itself.'}</p>
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
  <div class="figwrap"><img src="{face_src}" alt="Pip ansikt, referanse"><div class="figcap small">{'Referanse: Pips ansiktsuttrykk' if lang == 'no' else "Reference: Pip's expression"}</div></div>
</div>
''', 7))

    pages.append(pg(f'''
{banner(t('banner_krage'))}
{rosep(t('pill_krage'))}
{card('<p>' + t('krage_txt') + '</p>')}
{sagep(t('pill_krage_fest'))}
{cme(t('krage_fest_txt'))}
''', 8))

    pages.append(pg(f'''
{banner(t('banner_pigg'))}
{rosep(t('pill_pigg'))}
{card('<p>' + t('pigg_txt') + '</p>')}
{sagep(t('pill_pigg_fest'))}
{cme(t('pigg_fest_txt'))}
''', 9))

    kuler_rows = T['kuler_rows']['no'] if lang == 'no' else T['kuler_rows_en']['no']
    pages.append(pg(f'''
{banner(t('banner_kuler'))}
<p>{t('kuler_lead')}</p>
{card(otab(kuler_rows, head3[lang]))}
{cme(t('kuler_ferdig'))}
{rosep(t('pill_lokke'))}
{card('<p>' + t('lokke_txt') + '</p>')}
''', 10))

    mo_steg = T['montering_steg']['no'] if lang == 'no' else T['montering_steg_en']['no']
    pages.append(pg(f'''
{banner(t('banner_montering'))}
<p>{t('montering_lead')}</p>
{card(steps(mo_steg))}
''', 11))

    regler = T['regler']['no'] if lang == 'no' else T['regler_en']['no']
    pages.append(pg(f'''
{banner(t('banner_sikkerhet'))}
{rosep(t('pill_lengde'))}
{card('<p>' + t('lengde_txt') + '</p>')}
{sagep(t('pill_regler'))}
{card(ul(regler))}
''', 12))

    kolliste = T['kolleksjon_liste']['no'] if lang == 'no' else T['kolleksjon_liste']['en']
    pages.append(pg(f'''
{banner(t('banner_stell'))}
{cme(t('stell_txt'))}
''', 13))

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
