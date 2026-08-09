# -*- coding: utf-8 -*-
"""Genererer LME-hekleoppskrift 'Felix' aktivitetsleke' (norsk + engelsk) som HTML,
klar for PDF-print med Chromium. Del av LME Baby Collection 'Woodland Dreams'.
Aktivitetsleken er en myk aktivitetskube med seks sider, alle pyntet, i motsetning
til Ellies kube som har en enkel, upyntet bunn. Se README.md for begrunnelse."""
import base64, pathlib, sys

BASE = pathlib.Path(__file__).parent
sys.path.insert(0, str(BASE.parent / '_shared'))
import lme_pattern_kit as kit
from lme_pattern_kit import (banner, rosep, sagep, card, cream, cme, ul, steps, otab, abbrtab)

REF = BASE / 'felix_aktivitetsleke_real.jpg'
ref_b64 = base64.b64encode(REF.read_bytes()).decode()
ref_src = f'data:image/jpeg;base64,{ref_b64}'

def img_src(filename):
    data = (BASE / filename).read_bytes()
    return f'data:image/jpeg;base64,{base64.b64encode(data).decode()}'

alle_sider_src = img_src('felix_alle_sider.jpg')
speil_src = img_src('felix_speil.jpg')
form_src = img_src('felix_form.jpg')
form_full_src = img_src('felix_form_full.jpg')
lomme_src = img_src('felix_lomme.jpg')
knitre_src = img_src('felix_knitre.jpg')

T = {}
def add(key, no, en=None):
    T[key] = {'no': no, 'en': en if en is not None else no}

add('caption_alle_sider', 'Stiluttrykk-referanse for alle sidene, ikke det ferdige heklede produktet.',
    'Style reference for all the sides, not the finished crocheted product.')
add('caption_speil', 'Speil-siden, stiluttrykk-referanse.', 'The mirror side, style reference.')
add('caption_form', 'Stjernen, stiluttrykk-referanse.', 'The star, style reference.')
add('caption_form_full', 'Form-siden med hjerte, blad, minispeil og minisky, stiluttrykk-referanse.',
    'The shapes side with heart, leaf, mini mirror and mini cloud, style reference.')
add('caption_lomme', 'Lomme-siden med miniatyr-Felix, stiluttrykk-referanse.',
    'The pocket side with miniature Felix, style reference.')
add('caption_knitre', 'Knitre-siden, stiluttrykk-referanse.', 'The crinkle side, style reference.')

head3 = {'no': ['Omg', 'Beskrivelse', 'Masker'], 'en': ['Rnd', 'Description', 'Sts']}
rowhead = {'no': ['Rad', 'Beskrivelse', 'Masker'], 'en': ['Row', 'Description', 'Sts']}

# ---------------------------------------------------------------- SIDE 1
add('doctitle', "Felix' aktivitetsleke, LME hekleoppskrift", "Felix's Activity Toy, LME crochet pattern")
add('ph2', 'LME HEKLEOPPSKRIFT&nbsp;&nbsp;|&nbsp;&nbsp;FELIX\' AKTIVITETSLEKE',
    "LME CROCHET PATTERN&nbsp;&nbsp;|&nbsp;&nbsp;FELIX'S ACTIVITY TOY")
add('covertag', 'LME HEKLEOPPSKRIFT - BABY', 'LME CROCHET PATTERN - BABY')
add('covertitle', "FELIX' AKTIVITETSLEKE", "FELIX'S ACTIVITY TOY")
add('subpill', 'LME BABY COLLECTION - WOODLAND DREAMS', 'LME BABY COLLECTION - WOODLAND DREAMS')
add('cover_desc',
    'En myk aktivitetskube, ca. 11 til 12 cm per side, med alle seks sidene pyntet: Felix selv '
    'med en salviegrønn volangkrage, en stjerneside med en stor pudderrosa stjerne, en side med '
    'fire små motiver (hjerte, blad, speil og sky), et større babysikkert speil i en '
    'salviegrønn takket ramme, Felix som titter opp av en liten salviegrønn lomme med en bitte liten '
    'blomst, og en knitreside med en stor, søvnig sky som knitrer når man klemmer den. Kanten '
    'rundt hver side er salviegrønn. To hjørneringer i tre, den ene formet som et lite '
    'blomsterhjul, og en perlekant på toppen fullfører kuben.',
    'A soft activity cube, approx. 11 to 12 cm per side, with all six sides decorated: Felix '
    'himself in a sage green ruffled collar, a star side with a big powder pink star, a side '
    'with four small motifs (a heart, a leaf, a mirror and a cloud), a bigger baby-safe mirror '
    'in a sage green scalloped frame, Felix peeking out of a little sage green pocket '
    'with a tiny flower, and a crinkle side with a big, sleepy cloud that crinkles when you '
    'squeeze it. The edging around every side is sage green. Two wooden corner rings, one '
    'shaped like a little flower wheel, and a bead trim along the top complete the cube.')
add('by1', 'Av Renate Dahl', 'By Renate Dahl')
add('by2', 'Little Montessori Explorers', 'Little Montessori Explorers')
add('by3', 'lmexplorers.com', 'lmexplorers.com')
add('cover_tip',
    'VIKTIG: Denne leken har mange små deler. Les hele sikkerhetssiden nøye før du begynner, '
    'og sy absolutt alt fast med tette, doble sting.',
    "IMPORTANT: This toy has many small parts. Read the whole safety page carefully before you "
    "start, and sew absolutely everything on with tight, double stitching.")

# ---------------------------------------------------------------- SIDE 2
add('banner_om', "OM FELIX' AKTIVITETSLEKE", "ABOUT FELIX'S ACTIVITY TOY")
add('pill_historien', 'DEL AV FELIX SIN VERDEN', "PART OF FELIX'S WORLD")
add('om_historien',
    "Felix' aktivitetsleke hører til LME Baby Collection \"Woodland Dreams\". Der Ellies kube "
    'har én enkel, upyntet bunnside, har Felix\' kube noe å utforske på alle seks sidene: Felix '
    'selv med volangkragen sin, en stor stjerne å kjenne på, speilet der barnet møter sitt eget '
    'speilbilde, fire små motiver fra skogkanten han elsker, lommen der Felix titter frem, og '
    'skyen som knitrer på knitresiden.',
    "Felix's activity toy belongs to the LME Baby Collection \"Woodland Dreams\". Where Ellie's "
    "cube has one simple, undecorated bottom side, Felix's cube has something to explore on all "
    "six sides: Felix himself with his ruffled collar, a big star to feel, the mirror where the "
    "child meets their own reflection, four small motifs from the forest edge he loves, the "
    "pocket where Felix peeks out, and the cloud that crinkles on the crinkle side.")
add('pill_stil', 'STIL OG SANSER', 'STYLE AND SENSES')
add('om_stil',
    'Skandinavisk og Montessori-inspirert, med salviegrønn kanting rundt hver side og '
    'salviegrønt på Felix sin egen krage. Hver side har sin egen oppgave å utforske, fra å '
    'kjenne igjen former til å høre en liten sky knitre, akkurat den typen sanselige, hands-on '
    'lek Montessori-filosofien bygger på.',
    'Scandinavian and Montessori-inspired, with sage green edging around every side and '
    "sage green on Felix's own collar. Each side has its own task to explore, from recognising "
    'shapes to hearing a little cloud crinkle, exactly the kind of sensory, hands-on play the '
    'Montessori philosophy is built on.')
add('pill_sikkerhet_kort', 'VIKTIGST AV ALT: SIKKERHET', 'MOST IMPORTANT OF ALL: SAFETY')
add('om_sikkerhet_kort',
    'Denne leken har flere små deler enn noen annen oppskrift i Felix-kolleksjonen, og '
    'inneholder også et lite speil, to treringer og knitrefolie. Alt skal sys fast med dobbel '
    'styrke, og side 18 er viet sikkerhet i sin helhet. Les den siden nøye før du begynner.',
    'This toy has more small parts than any other pattern in the Felix collection, and also '
    'includes a small mirror, two wooden rings and a crinkle sheet. Everything must be sewn on '
    'with double strength, and page 18 is entirely dedicated to safety. Read that page '
    'carefully before you begin.')

# ---------------------------------------------------------------- SIDE 3
add('banner_mat', 'MATERIALER OG GARNALTERNATIVER', 'MATERIALS AND YARN ALTERNATIVES')
add('pill_garn', 'GARN', 'YARN')
add('garn_txt',
    'Bystrikk Merino i kremhvitt (kubens sider) og salviegrønn (kantfarge og speilrammen), '
    'pluss rester av rustoransje til Felix sitt hode, salviegrønt til kragen og bladet, '
    'pudderrosa til stjernen og hjertet, og gult/mustard til den lille speilrammen, samme '
    "garnfamilie som resten av Felix' oppskrift.",
    "Bystrikk Merino in cream (the cube sides) and sage green (the edging colour and the "
    "mirror frame), plus leftover rust orange for Felix's head, sage green for the collar and "
    "the leaf, powder pink for the star and the heart, and yellow/mustard for the little "
    "mirror frame, the same yarn family as the rest of Felix's pattern.")
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
    ('Polyesterfiber til fyll', 'til hjørner/kanter og til Felix-motivene'),
    ('Babysikkert speil (akryl/plast, ikke glass)', 'liten, rund speilplate beregnet for '
     'babyprodukter, se side om speilet'),
    ('To trerelaterte teetheringer', 'umalt/BPA-fri, CE-merket, beregnet for barn, til '
     'hjørnene, gjerne én formet som et lite blomsterhjul, som i referansebildet'),
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
    'du har heklet minst én av de andre Felix-oppskriftene først.',
    'Medium to challenging: many small parts, six panels that must all match in size, and a '
    'technique new to the collection, sewing the panels together into a three-dimensional cube. '
    'A good pattern once you have crocheted at least one of the other Felix patterns first.')
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
    'Kuben har seks sider, og i motsetning til Ellies kube har Felix sin versjon noe å '
    'utforske på hver eneste side, ingen av dem holdes enkle og upyntet:',
    "The cube has six sides, and unlike Ellie's cube, Felix's version has something to explore "
    "on every single side, none of them are kept plain and undecorated:")
add('oversikt_deler', [
    ('1. Grunnkvadratene', 'seks like paneler med salviegrønn kantfarge', '1. The base squares',
     'six matching panels with a sage green edging colour'),
    ('2. Felix-siden', 'forsiden, med salviegrønn volangkrage', '2. The Felix side',
     'the front, with a sage green ruffled collar'),
    ('3. Speil-siden', 'babysikkert speil i salviegrønn takket ramme', '3. The mirror side',
     'baby-safe mirror in a sage green scalloped frame'),
    ('4. Stjerne-siden', 'en stor pudderrosa stjerne', '4. The star side',
     'a big powder pink star'),
    ('5. Form-siden', 'hjerte, blad, lite speil og liten sky', '5. The shapes side',
     'a heart, a leaf, a small mirror and a small cloud'),
    ('6. Lomme-siden', 'miniatyr-Felix titter opp av en salviegrønn lomme', '6. The pocket side',
     'a miniature Felix peeking out of a sage green pocket'),
    ('7. Knitre-siden', 'en stor, søvnig sky med knitrende stoff inni, som knitrer når man '
     'klemmer', '7. The crinkle side', 'a big, sleepy cloud with crinkling material inside, '
     'that crinkles when squeezed'),
    ('8. Sammensying og stiving', 'de seks sidene sydd til en kube', '8. Assembly and stiffening',
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
    'Rund av hvert kvadrat med én omgang fm i salviegrønn rundt hele kanten (fm jevnt langs '
    'sidene, 3 fm i hvert hjørne for at det skal ligge flatt). Fest av og gjem tråden. Dette gir '
    'den blå kantstripen du ser rundt hver side i referansebildet.',
    'Edge each square with one round of sc in sage green all the way around (sc evenly '
    'along the sides, 3 sc in each corner so it lies flat). Fasten off and weave in the end. '
    'This gives the blue border you see around each side in the reference photo.')

# ---------------------------------------------------------------- SIDE 8: FELIX-SIDEN
add('banner_felix', 'DEL 2: FELIX-SIDEN', 'PART 2: THE FELIX SIDE')
add('felix_lead',
    'Forsiden av kuben er Felix selv, med en liten volangkrage, samme teknikk som på hans '
    'rangel og vognlenkens medaljong. I motsetning til Ellie bærer Felix ingen sløyfe.',
    "The front of the cube is Felix himself, with a little ruffled collar, the same technique "
    "as on his rattle and the stroller toy's medallion. Unlike Ellie, Felix does not wear a bow.")
add('felix_rows', [
    ('1', '6 fm i magisk ring, rustoransje', 6),
    ('2', 'økn x 6', 12),
    ('3', '(1 fm, økn) x 6', 18),
    ('4', '(2 fm, økn) x 6', 24),
    ('5 til 6', '24 fm, 2 omganger', 24),
    ('7', '(2 fm, mink) x 6 - fyll svært lett', 18),
    ('8', 'mink x 6', 9),
])
add('felix_rows_en', [
    ('1', '6 sc in a magic ring, rust orange', 6),
    ('2', 'inc x 6', 12),
    ('3', '(1 sc, inc) x 6', 18),
    ('4', '(2 sc, inc) x 6', 24),
    ('5 to 6', '24 sc, 2 rounds', 24),
    ('7', '(2 sc, dec) x 6 - stuff very lightly', 18),
    ('8', 'dec x 6', 9),
])
add('felix_ferdig',
    'Klipp av med god tråd igjen. Sy to små, spisse, foldede ører (rustoransje utenpå, '
    'kremhvitt inni, samme teknikk som på Felix selv) øverst, og brodér et lite ansikt.',
    'Cut, leaving a long tail. Sew on two small, pointed, folded ears (rust orange outside, '
    "cream inside, the same technique as on Felix himself) on top, and embroider a small face.")
add('felix_minihale',
    'Minihalen: i stedet for en sløyfe har Felix sin egen signaturdetalj. Hekle en liten, '
    'tofarget hale (6 fm i magisk ring rustoransje, økn x 6, 2 omganger 12 fm, bytt til '
    'kremhvitt, 1 omgang 12 fm, mink x 6, fyll lett) og sy den fast øverst på baksiden av '
    'panelet, rett bak der hodet skal sys på, slik at den ikke synes forfra, akkurat som halen '
    'skjules bak Felix sin egen kropp. Dette er en tilpasning av signaturdetaljen hans til en '
    'flat panelform, siden en fullt synlig hale ikke ville vist seg på et rett forfra-bilde.',
    "The mini tail: instead of a bow, Felix has his own signature detail. Crochet a little "
    "two-tone tail (6 sc in a magic ring rust orange, inc x 6, 2 rounds of 12 sc, switch to "
    "cream, 1 round of 12 sc, dec x 6, stuff lightly) and sew it onto the top of the back of "
    "the panel, right behind where the head will be sewn on, so it does not show from the "
    "front, just like the tail is hidden behind Felix's own body. This is an adaptation of his "
    "signature detail to a flat panel shape, since a fully visible tail would not show in a "
    "straight-on front photo.")
add('pill_krage', 'VOLANGKRAGEN (SALVIEGRØNN)', 'THE RUFFLED COLLAR (SAGE GREEN)')
add('krage_txt',
    'Fest salviegrønn tråd rundt kanten der hodet er som smalest, nederst. *1 fm i neste maske, '
    'hopp over 1 maske, 5 stav i neste maske (en liten vifte), hopp over 1 maske*, gjenta hele '
    'veien rundt underkanten. Fest av. Sy til slutt Felix sitt hode godt fast midt på panelet, '
    'over minihalen.',
    'The ruffled collar: attach sage green yarn at the bottom edge of the head. *1 sc in the '
    'next stitch, skip 1 stitch, 5 dc in the next stitch (a little fan), skip 1 stitch*, repeat '
    "all the way around the bottom edge. Fasten off. Finally, sew Felix's head securely onto "
    'the middle of the panel, over the mini tail.')

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
    'Den takkede rammen: fest salviegrønn tråd direkte i ytterkanten av den innsydde '
    'speilsirkelen, og hekle en omgang: 24 fm rundt hele kanten. Fortsett rett inn i takkene, '
    'uten å lukke omgangen: *hopp over 1 m, i neste m: 1 kjm, 2 lm, 3 stav, 2 lm, 1 kjm*, gjenta '
    'til du har åtte takker rundt hele speilet, akkurat som den scalloped rammen i '
    'referansebildet. Fest av og gjem tråden. Sy speilet med rammen godt fast midt på panelet.',
    'The scalloped frame: attach sage green yarn directly into the outer edge of the sewn-in '
    'mirror circle, and crochet one round: 24 sc all the way around. Continue straight into the '
    'scallops, without joining the round: *skip 1 st, in the next st: 1 sl st, 2 ch, 3 dc, 2 ch, '
    '1 sl st*, repeat until you have eight scallops all the way around the mirror, just like '
    'the scalloped frame in the reference photo. Fasten off and weave in the end. Sew the '
    'mirror with its frame securely onto the middle of the panel.')
add('speil_note',
    'Bruk kun et fleksibelt, ubrytelig babysikkert speil beregnet for barneprodukter, aldri '
    'ekte glass. Sjekk at speilplaten ikke har skarpe kanter før du setter den inn.',
    'Use only a flexible, unbreakable baby-safe mirror intended for children\'s products, '
    'never real glass. Check that the mirror disc has no sharp edges before you insert it.')

# ---------------------------------------------------------------- SIDE 10: STJERNE-SIDEN
add('banner_stjerne', 'DEL 4: STJERNE-SIDEN', 'PART 4: THE STAR SIDE')
add('stjerne_lead',
    'En egen side med en stor, søvnig stjerne, en fin, myk flate å kjenne på for de minste.',
    'A dedicated side with a big, sleepy star, a nice soft surface for little ones to feel.')
add('stjerne_txt',
    'Hekle to like stjerner i pudderrosa: hekle 5 fm i magisk ring. Fortsett rett inn i '
    'takkene: *1 fm, 1 lm, 2 stav, 1 lm, kjm i samme maske*, gjenta til alle 5 maskene har en '
    'takk. Fest av med god tråd igjen (hekle 2 stk). Legg de to stjernene sammen, fyll svært '
    'lett, og sy dem sammen rundt hele kanten. Brodér gjerne et lite sovende ansikt (to lukkede '
    'øyne og rosa kinn) midt på stjernen, akkurat som i referansebildet, før du syr den fast '
    'midt på panelet.',
    'Crochet two matching stars in powder pink: crochet 5 sc in a magic ring. Continue straight '
    'into the points: *1 sc, 1 ch, 2 dc, 1 ch, sl st in the same stitch*, repeat until all 5 '
    'stitches have a point. Fasten off, leaving a long tail (make 2). Place the two stars '
    'together, stuff very lightly, and sew them together around the entire edge. Feel free to '
    'embroider a small sleepy face (two closed eyes and pink cheeks) in the middle of the star, '
    'just like in the reference photo, before sewing it onto the middle of the panel.')

# ---------------------------------------------------------------- SIDE 11: FORM-SIDEN
add('banner_form', 'DEL 5: FORM-SIDEN', 'PART 5: THE SHAPES SIDE')
add('form_lead',
    'Fire enkle, gjenkjennelige motiver på ett panel: et hjerte, et blad, et lite speil og en '
    'liten sky, en fin start på formgjenkjenning for de minste.',
    'Four simple, recognisable motifs on one panel: a heart, a leaf, a small mirror and a '
    'small cloud, a nice start to shape recognition for little ones.')
add('pill_hjerte', 'HJERTET (PUDDERROSA)', 'THE HEART (POWDER PINK)')
add('hjerte_txt',
    'Hekle to like halvdeler: 6 fm i magisk ring, økn x 6 (12), fest av (hekle 2 stk). Sy de to '
    'halvdelene sammen langs en rett kant øverst, og press dem lett ned mot en spiss nederst, '
    'til en hjerteform. Press flatt og sy fast.',
    'Crochet two matching halves: 6 sc in a magic ring, inc x 6 (12), fasten off (make 2). Sew '
    'the two halves together along a straight edge at the top, and gently press them down '
    'towards a point at the bottom, into a heart shape. Press flat and sew on.')
add('pill_blad_form', 'BLADET (SALVIEGRØNT)', 'THE LEAF (SAGE GREEN)')
add('blad_form_txt',
    'Legg opp 7 lm. Start i 2. lm fra nålen: 1 kjm, 1 fm, 1 halvstav, 2 stav i siste lm '
    '(tuppen), snu og fortsett på den andre siden av kjeden: 1 halvstav, 1 fm, 1 kjm. Avslutt '
    'og klipp av med god tråd igjen, press flatt og sy fast.',
    'Chain 7. Starting in the 2nd ch from the hook: 1 sl st, 1 sc, 1 hdc, 2 dc in the last ch '
    '(the tip), turn and continue along the other side of the chain: 1 hdc, 1 sc, 1 sl st. '
    'Fasten off, leaving a long tail, press flat and sew on.')
add('pill_minispeil', 'DET LILLE SPEILET (GULT)', 'THE SMALL MIRROR (YELLOW)')
add('minispeil_txt',
    'Hekle 6 fm i magisk ring, økn x 6 (12), (1 fm, økn) x 6 (18) i gult/mustard, som ramme '
    'rundt en liten babysikkert speilbit. Fest av, press flatt, legg speilbiten inni og sy '
    'kanten godt igjen, akkurat som den store speil-siden, bare i miniatyr.',
    'Crochet 6 sc in a magic ring, inc x 6 (12), (1 sc, inc) x 6 (18) in yellow/mustard, as a '
    'frame around a small baby-safe mirror piece. Fasten off, press flat, place the mirror '
    'piece inside and sew the edge securely closed, just like the big mirror side, only in '
    'miniature.')
add('pill_minisky', 'DEN LILLE SKYEN (SALVIEGRØNN)', 'THE SMALL CLOUD (SAGE GREEN)')
add('minisky_txt',
    'Hekle tre overlappende sirkler i salviegrønn: (a) 6 fm i magisk ring. (b) 6 fm i magisk '
    'ring, økn x 6 (12). (c) 6 fm i magisk ring, økn x 6 (12), (1 fm, økn) x 6 (18). Overlapp og '
    'sy sammen de tre sirklene til en liten skyform. Press flatt og sy fast, gjerne med noen '
    'bittesmå brodert stjerner rundt, som i referansebildet.',
    'Crochet three overlapping circles in sage green: (a) 6 sc in a magic ring. (b) 6 sc in a '
    'magic ring, inc x 6 (12). (c) 6 sc in a magic ring, inc x 6 (12), (1 sc, inc) x 6 (18). '
    'Overlap and sew the three circles together into a small cloud shape. Press flat and sew '
    'on, with a few tiny embroidered stars around it if you like, as in the reference photo.')

# ---------------------------------------------------------------- SIDE 12: LOMME-SIDEN
add('banner_lomme', 'DEL 6: LOMME-SIDEN', 'PART 6: THE POCKET SIDE')
add('lomme_lead',
    'En liten miniatyr-Felix titter opp av en salviegrønn lomme nederst på panelet, en liten '
    'tittelek-overraskelse.',
    'A tiny miniature Felix peeks up out of a sage green pocket at the bottom of the '
    'panel, a little peekaboo surprise.')
add('lomme_txt',
    'Lommen: legg opp 12 lm + 1 vendemaske i salviegrønt. Rad 1: 12 fm. Gjenta rad 1 i 8 rader '
    'totalt. Fold stykket dobbelt og sy sammen langs de to kortsidene og bunnen, slik at det '
    'blir en liten, åpen lomme. Sy gjerne en bitte liten hvit blomst fast på lommen, som i '
    'referansebildet. Sy lommens bunnkant fast nederst på panelet, med åpningen vendt opp.',
    'The pocket: chain 12 + 1 turning chain in sage green. Row 1: 12 sc. Repeat row 1 for 8 '
    'rows in total. Fold the piece in half and sew together along the two short sides and the '
    'bottom, so it becomes a small, open pocket. Feel free to sew a tiny white flower onto the '
    "pocket, as in the reference photo. Sew the pocket's bottom edge onto the bottom of the "
    'panel, with the opening facing up.')
add('lomme_felix',
    'Miniatyr-Felix: 6 fm i magisk ring, rustoransje (6), økn x 6 (12), (1 fm, økn) x 6 (18), 1 '
    'omgang rett (18), mink x 6 (9), fyll svært lett. Fest av med god tråd igjen. Sy to '
    'bittesmå, spisse ører og brodér et lite ansikt, akkurat som på Felix-siden.',
    'Miniature Felix: 6 sc in a magic ring, rust orange (6), inc x 6 (12), (1 sc, inc) x 6 (18), '
    '1 round straight (18), dec x 6 (9), stuff very lightly. Fasten off, leaving a long tail. '
    'Sew on two tiny, pointed ears and embroider a small face, just like on the Felix side.')
add('lomme_montering',
    'Sy miniatyr-Felix godt fast rett bak lommeåpningen, litt høyere enn selve lommen, slik at '
    'bare hodet stikker opp av lommen, som om han titter frem. Felix skal sys helt fast til '
    'panelet, ikke bare ligge løst nedi lommen.',
    'Sew the miniature Felix securely just behind the pocket opening, a little higher than the '
    'pocket itself, so that only the head pokes up out of the pocket, as if he is peeking out. '
    'Felix must be sewn completely onto the panel, not just placed loosely inside the pocket.')

# ---------------------------------------------------------------- SIDE 13: KNITRE-SIDEN
add('banner_flette', 'DEL 7: KNITRE-SIDEN', 'PART 7: THE CRINKLE SIDE')
add('flette_lead',
    'Denne siden gir en helt annen sans å utforske: lyd. Inni den store, myke, søvnige skyen '
    'legger du et knitrende stoff, en knitrefolie beregnet for babyprodukter, trygt sydd helt '
    'inne i skyen, slik at det knitrer akkurat der barnet klemmer på den.',
    'This side offers a completely different sense to explore: sound. Inside the big, soft, '
    'sleepy cloud you place a crinkling material, a crinkle sheet intended for baby products, '
    'safely sewn completely inside the cloud, so that it crinkles right where the child '
    'squeezes it.')
add('flette_hull',
    'Skyen, front og bak: hekle to like sett av tre overlappende sirkler i kremhvitt, samme '
    'metode som skyen på Felix\' vognlenke: (a) 6 fm i magisk ring. (b) 6 fm i magisk ring, økn '
    'x 6 (12). (c) 6 fm i magisk ring, økn x 6 (12), (1 fm, økn) x 6 (18). Overlapp og sy '
    'sammen de tre sirklene til en skyform. Hekle to like skyer totalt, én for framsiden og én '
    'for baksiden av puten. Brodér gjerne et lite sovende ansikt (lukkede øyne, rosa kinn), '
    'noen bittesmå stjerner og et lite hjerte rundt skyen, akkurat som i referansebildet.',
    'The cloud, front and back: crochet two matching sets of three overlapping circles in '
    "cream, the same method as the cloud on Felix's stroller toy: (a) 6 sc in a magic ring. "
    '(b) 6 sc in a magic ring, inc x 6 (12). (c) 6 sc in a magic ring, inc x 6 (12), (1 sc, inc) '
    'x 6 (18). Overlap and sew the three circles together into a cloud shape. Crochet two '
    'matching clouds in total, one for the front and one for the back of the pillow. Feel free '
    'to embroider a small sleepy face (closed eyes, pink cheeks), a few tiny stars and a small '
    'heart around the cloud, just like in the reference photo.')
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

# ---------------------------------------------------------------- SIDE 14: SAMMENSYING
add('banner_sammensying', 'DEL 8: SAMMENSYING TIL KUBE', 'PART 8: ASSEMBLING THE CUBE')
add('sammensying_lead',
    'I motsetning til Ellies kube har alle seks sidene på Felix sin kube et eget motiv. Du '
    'syr dem sammen til en kube på nøyaktig samme måte likevel.',
    "Unlike Ellie's cube, all six sides of Felix's cube have their own motif. You still sew "
    "them together into a cube in exactly the same way.")
add('sammensying_steg', [
    'Legg de seks ferdige panelene ut i den rekkefølgen du vil ha dem: Felix-siden foran, '
    'knitre-siden bak, speil-siden og stjerne-siden på hver sin side, lomme-siden øverst, og '
    'form-siden nederst.',
    'Sy sammen fem av de seks sømmene med tett kanthekling eller overstingsøm, rett sider ut, '
    'slik at du får en åpen kube med kun ett hull igjen.',
    'Sett inn de seks skumkvadratene, ett i hver side, gjennom det siste åpne hullet, sammen '
    'med litt løs fyllwatt i hjørnene for en myk følelse.',
    'Sy igjen det siste hullet like tett og sikkert som de andre fem sømmene.',
    'Gå gjennom alle seks sømmene en gang til utenpå, med tette sting, for ekstra styrke der '
    'barnehender skal dra og klemme.',
], [
    'Lay out the six finished panels in the order you want them: the Felix side at the front, '
    'the crinkle side at the back, the mirror side and the star side on either side, the '
    'pocket side on top, and the shapes side underneath.',
    'Sew together five of the six seams with tight edging stitches or a whip stitch, right '
    'sides out, so you have an open cube with only one hole left.',
    'Insert the six foam squares, one into each side, through the last open hole, along with a '
    'little loose stuffing in the corners for a soft feel.',
    'Sew the last hole closed just as tightly and securely as the other five seams.',
    'Go over all six seams once more on the outside, with tight stitches, for extra strength '
    'where little hands will pull and squeeze.',
])

# ---------------------------------------------------------------- SIDE 15: TOPPHÅNDTAKET
add('banner_handtak', 'DEL 9: TOPPHÅNDTAKET', 'PART 9: THE TOP HANDLE')
add('handtak_txt',
    'Tre et utvalg runde treperler og garnkledde kuler (pudderrosa, salviegrønt, lys himmelblå '
    'og gult/mustard, akkurat som på referansebildet) på en kort, sterk bomullssnor, i den '
    'rekkefølgen du liker. Sy begge endene av snoren godt fast langs den øverste sømmen, mellom '
    'Felix-siden og lomme-siden, slik at perlerekken danner en liten bue over toppen, som et '
    'håndtak.',
    "Thread a selection of round wooden beads and yarn-covered balls (powder pink, sage green, "
    "sage green and yellow/mustard, just like in the reference photo) onto a short, sturdy "
    "cotton cord, in whatever order you like. Sew both ends of the cord securely along the top "
    "seam, between the Felix side and the pocket side, so the row of beads forms a small arch "
    "over the top, like a handle.")
add('handtak_note',
    'Perlekulene hekles akkurat som kulene på smokkelenken: 6 fm i magisk ring, økn x 6 (12), '
    '12 fm i 2 omganger, mink x 6 (6), fyll lett og fest av.',
    "The bead balls are crocheted just like the balls on the pacifier clip: 6 sc in a magic "
    "ring, inc x 6 (12), 12 sc for 2 rounds, dec x 6 (6), stuff lightly and fasten off.")

# ---------------------------------------------------------------- SIDE 16: HJØRNERINGENE
add('banner_hjorner', 'DEL 10: HJØRNERINGENE OG DUSKENE', 'PART 10: THE CORNER RINGS AND TASSELS')
add('hjorner_txt',
    'Sy en treteetheringe godt fast i hver av de to loddrette sømmene som flankerer Felix-siden '
    '(sømmen mot speil-siden på den ene siden, sømmen mot stjerne-siden på den andre), slik at '
    'ringene henger som i referansebildet. Gjerne én av ringene formet som et lite '
    'blomsterhjul, for litt ekstra struktur å kjenne på. Ringen skal sys fast med flere runder '
    'tett overstingsøm, ikke bare tres løst gjennom sømmen.',
    "Sew a wooden teething ring securely into each of the two vertical seams flanking the "
    "Felix side (the seam towards the mirror side on one side, the seam towards the star side "
    "on the other), so the rings hang as in the reference photo. Feel free to make one of the "
    "rings shaped like a little flower wheel, for a bit of extra texture to feel. Each ring "
    "must be sewn on with several rounds of tight whip stitching, not just threaded loosely "
    "through the seam.")
add('dusker_txt',
    'Lag to korte perledusker i pudderrosa og salviegrønt: tre 2 til 3 kuler/perler (for '
    'eksempel én garnkledd kule i pudderrosa, én i salviegrønt) på en kort bomullssnor, maks 6 '
    'til 8 cm lang, og sy det faste festepunktet godt fast like ved hver hjørnering. Ingen '
    'løkke skal være løs eller lang nok til å kunne strekkes ut over 8 cm.',
    'Make two short bead tassels in powder pink and sage green: thread 2 to 3 balls/beads (for '
    'example one yarn-covered ball in powder pink, one in sage green) onto a short cotton cord, '
    'no more than 6 to 8 cm long, and sew the fixed attachment point securely right next to '
    'each corner ring. No loop should be loose or long enough to stretch out beyond 8 cm.')

# ---------------------------------------------------------------- SIDE 17: MONTERING
add('banner_montering', 'MONTERING, STEG FOR STEG', 'ASSEMBLY, STEP BY STEP')
add('montering_steg', [
    'Hekle de seks grunnkvadratene og kant dem alle i salviegrønn.',
    'Hekle Felix-siden, speil-siden, stjerne-siden, form-siden, lomme-siden og knitre-siden, '
    'hver på sitt eget grunnkvadrat.',
    'Sy fem av sømmene sammen til en åpen kube, sett inn skumkvadratene og litt fyll, og sy '
    'igjen den siste sømmen.',
    'Fest topphåndtaket langs den øverste sømmen.',
    'Fest de to hjørneringene og de to perleduskene i sømmene som flankerer Felix-siden.',
    'Sy knitrefolien trygt inn mellom de to skyene, og fest den ferdige skyen midt på '
    'knitre-siden.',
    'Fest alle løse tråder godt på innsiden av delene, og klipp av det som er igjen.',
    'Dra forsiktig i hver eneste del, ring og dusk, og trykk lett på skyen, for å kontrollere '
    'at ingenting løsner, før leken tas i bruk.',
])
add('montering_steg_en', [
    'Crochet the six base squares and edge them all in sage green.',
    'Crochet the Felix side, the mirror side, the star side, the shapes side, the pocket side '
    'and the crinkle side, each onto its own base square.',
    'Sew five of the seams together into an open cube, insert the foam squares and a little '
    'stuffing, and sew the last seam closed.',
    'Attach the top handle along the top seam.',
    'Attach the two corner rings and the two bead tassels into the seams flanking the Felix '
    'side.',
    'Sew the crinkle sheet securely between the two clouds, and attach the finished cloud to '
    'the middle of the crinkle side.',
    'Fasten every loose end securely on the inside of the pieces, and trim what is left.',
    'Gently tug on every single part, ring and tassel, and press lightly on the cloud, to '
    'check that nothing comes loose, before the toy is used.',
])

# ---------------------------------------------------------------- SIDE 18: SIKKERHET
add('banner_sikkerhet', 'SIKKERHET, DEN VIKTIGSTE SIDEN', 'SAFETY, THE MOST IMPORTANT PAGE')
add('pill_smadeler', 'MANGE SMÅ DELER, ÉN REGEL: ALT SYS FAST', 'MANY SMALL PARTS, ONE RULE: SEW EVERYTHING ON')
add('smadeler_txt',
    'Denne leken har flere motiver og flere ulike materialer (garn, tre, speil, snor) enn noen '
    'annen oppskrift i Felix-kolleksjonen. Hvert eneste motiv, hver ring og hver perle skal sys '
    'fast med sterk, tvinnet bomullstråd og mange, tette sting, gjennomgått minst to ganger. '
    'Speilet skal alltid være helt innsydd i en lukket lomme, aldri løst i det vanlige fyllet.',
    'This toy has more motifs and more different materials (yarn, wood, mirror, cord) than any '
    'other pattern in the Felix collection. Every single motif, every ring and every bead must '
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
     'og trykk lett på skyen og stjernen. Kast eller reparer umiddelbart hvis noe er løst.',
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
     'ring, and press lightly on the cloud and the star. Discard or repair immediately if '
     'anything is loose.',
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
# ---------------------------------------------------------------- SIDE 20: FERDIG
add('banner_ferdig', 'GRATULERER, AKTIVITETSKUBEN ER FERDIG!', 'CONGRATULATIONS, THE ACTIVITY CUBE IS DONE!')
add('ferdig_txt',
    'Nå har du heklet den mest detaljerte oppskriften i hele Felix-kolleksjonen. Godt jobbet, '
    'og god utforskning!',
    'Now you have crocheted the most detailed pattern in the whole Felix collection. Well '
    'done, and happy exploring!')
add('pill_kolleksjon', 'RESTEN AV LME BABY COLLECTION', 'THE REST OF THE LME BABY COLLECTION')
add('kolleksjon_liste',
    ['Ellie, det lille dådyret', 'Felix, den lille reven', "Felix' smokkelenke", "Felix' rangle",
     "Felix' vognlenke", "Felix' ballerinasko med minihale"],
    ['Ellie, the little fawn', 'Felix, the little fox', "Felix's pacifier clip",
     "Felix's rattle", "Felix's stroller toy", "Felix's ballerina shoes with a mini tail"])
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
<div class="coverimg"><img src="{ref_src}" alt="Felix' aktivitetsleke, produktbilde"></div>
<p class="small center" style="margin-top:-2mm;">{'Bildet viser det ferdige produktet.' if lang == 'no' else 'Photo shows the finished product.'}</p>
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
<div class="figwrap"><img src="{alle_sider_src}" alt="Felix aktivitetsleke, alle sidene" style="width:100mm"><div class="figcap">{t('caption_alle_sider')}</div></div>
''', 6))

    pages.append(pg(f'''
{banner(t('banner_kvadrat'))}
<p>{t('kvadrat_lead')}</p>
{card('<p>' + t('kvadrat_txt') + '</p>')}
{cme(t('kvadrat_kant'))}
''', 7))

    felix_rows = T['felix_rows']['no'] if lang == 'no' else T['felix_rows_en']['no']
    pages.append(pg(f'''
{banner(t('banner_felix'))}
<p>{t('felix_lead')}</p>
{card(otab(felix_rows, head3[lang]))}
{cme(t('felix_ferdig'))}
{card('<p>' + t('felix_minihale') + '</p>')}
{sagep(t('pill_krage'))}
{card('<p>' + t('krage_txt') + '</p>')}
''', 8))

    pages.append(pg(f'''
{banner(t('banner_speil'))}
<p>{t('speil_lead')}</p>
{card('<p>' + t('speil_txt') + '</p>')}
{card('<p>' + t('speil_ramme') + '</p>')}
{cme(t('speil_note'))}
<div class="figwrap"><img src="{speil_src}" alt="Speil-siden" style="width:44mm"><div class="figcap">{t('caption_speil')}</div></div>
''', 9))

    pages.append(pg(f'''
{banner(t('banner_stjerne'))}
<p>{t('stjerne_lead')}</p>
{card('<p>' + t('stjerne_txt') + '</p>')}
<div class="figwrap"><img src="{form_src}" alt="Stjernen" style="width:44mm"><div class="figcap">{t('caption_form')}</div></div>
''', 10))

    pages.append(pg(f'''
{banner(t('banner_form'))}
<p>{t('form_lead')}</p>
{rosep(t('pill_hjerte'))}
{card('<p>' + t('hjerte_txt') + '</p>')}
{sagep(t('pill_blad_form'))}
{card('<p>' + t('blad_form_txt') + '</p>')}
{sagep(t('pill_minispeil'))}
{card('<p>' + t('minispeil_txt') + '</p>')}
{rosep(t('pill_minisky'))}
{card('<p>' + t('minisky_txt') + '</p>')}
<div class="figwrap" style="margin-top:1mm"><img src="{form_full_src}" alt="Form-siden" style="width:34mm"><div class="figcap">{t('caption_form_full')}</div></div>
''', 11))

    pages.append(pg(f'''
{banner(t('banner_lomme'))}
<p>{t('lomme_lead')}</p>
{card('<p>' + t('lomme_txt') + '</p>')}
{card('<p>' + t('lomme_felix') + '</p>')}
{cme(t('lomme_montering'))}
<div class="figwrap"><img src="{lomme_src}" alt="Lomme-siden" style="width:44mm"><div class="figcap">{t('caption_lomme')}</div></div>
''', 12))

    pages.append(pg(f'''
{banner(t('banner_flette'))}
<p>{t('flette_lead')}</p>
{card('<p>' + t('flette_hull') + '</p>')}
{cme(t('flette_snor'))}
<div class="figwrap"><img src="{knitre_src}" alt="Knitre-siden" style="width:44mm"><div class="figcap">{t('caption_knitre')}</div></div>
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

    regler = T['regler']['no'] if lang == 'no' else T['regler']['en']
    pages.append(pg(f'''
{banner(t('banner_sikkerhet'))}
{rosep(t('pill_smadeler'))}
{card('<p>' + t('smadeler_txt') + '</p>')}
{sagep(t('pill_regler'))}
{card(ul(regler))}
''', 18))

    pages.append(pg(f'''
{banner(t('banner_stell'))}
{cme(t('stell_txt'))}
''', 19))

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
''', 20))

    return pages

for lang in ('no', 'en'):
    html_doc = kit.doc(lang, T['doctitle'][lang], None, build(lang))
    out = BASE / f'aktivitetsleke_{lang}.html'
    out.write_text(html_doc, encoding='utf-8')
    print('OK', lang, len(html_doc), 'tegn/chars')
