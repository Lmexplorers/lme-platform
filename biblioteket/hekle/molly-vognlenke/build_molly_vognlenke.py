# -*- coding: utf-8 -*-
"""Genererer LME-hekleoppskrift 'Mollys vognlenke' (norsk + engelsk) som HTML,
klar for PDF-print med Chromium. Del av LME Baby Collection 'Woodland Dreams'."""
import base64, pathlib, sys

BASE = pathlib.Path(__file__).parent
sys.path.insert(0, str(BASE.parent / '_shared'))
import lme_pattern_kit as kit
from lme_pattern_kit import (banner, rosep, sagep, card, cream, cme, ul, steps, otab, abbrtab,
                              photo_row, qr_placeholder)

REF = BASE / 'molly_ref.jpg'
ref_b64 = base64.b64encode(REF.read_bytes()).decode()
ref_src = f'data:image/jpeg;base64,{ref_b64}'

YELLOW = '#EDD283'
YELLOW_DARK = '#C9A94E'

T = {}
def add(key, no, en=None):
    T[key] = {'no': no, 'en': en if en is not None else no}

head3 = {'no': ['Omg', 'Beskrivelse', 'Masker'], 'en': ['Rnd', 'Description', 'Sts']}

# ---------------------------------------------------------------- SIDE 1
add('doctitle', 'Mollys vognlenke, LME hekleoppskrift', "Molly's Stroller Toy, LME crochet pattern")
add('ph2', 'LME HEKLEOPPSKRIFT&nbsp;&nbsp;|&nbsp;&nbsp;MOLLYS VOGNLENKE',
    "LME CROCHET PATTERN&nbsp;&nbsp;|&nbsp;&nbsp;MOLLY'S STROLLER TOY")
add('covertag', 'LME HEKLEOPPSKRIFT - BABY', 'LME CROCHET PATTERN - BABY')
add('covertitle', 'MOLLYS VOGNLENKE', "MOLLY'S STROLLER TOY")
add('subpill', 'LME BABY COLLECTION - WOODLAND DREAMS', 'LME BABY COLLECTION - WOODLAND DREAMS')
add('cover_desc',
    'En liten vognlenke med Molly midt på, omgitt av sky, sol, blad, blomst, stjerne og '
    'sommerfugl, pluss to sideringer i tre med en liten heklet kule dinglende inni hver. Festes '
    'med to klips eller ringer over barnevognens bøyle. Heklet i de samme naturfargene som '
    'resten av kolleksjonen, med lengde satt bevisst kort av sikkerhetshensyn.',
    "A little stroller toy with Molly in the middle, surrounded by a cloud, sun, leaf, flower, "
    "star and butterfly, plus two wooden side rings with a small crocheted ball dangling inside "
    "each one. Attached with two clips or rings across the stroller's bar. Crocheted in the "
    "same natural colours as the rest of the collection, with a length kept deliberately short "
    "for safety.")
add('by1', 'Av Renate Dahl', 'By Renate Dahl')
add('by2', 'Little Montessori Explorers', 'Little Montessori Explorers')
add('by3', 'lmexplorers.com', 'lmexplorers.com')
add('cover_tip',
    'VIKTIG: Les sikkerhetssiden nøye før du begynner. Total lengde og hvor løst delene '
    'henger er de viktigste tallene i denne oppskriften.',
    'IMPORTANT: Read the safety page carefully before you start. Total length and how loosely '
    'the pieces hang are the most important numbers in this pattern.')

# ---------------------------------------------------------------- SIDE 2
add('banner_om', 'OM MOLLYS VOGNLENKE', "ABOUT MOLLY'S STROLLER TOY")
add('pill_historien', 'DEL AV ELLIES VERDEN', "PART OF ELLIE'S WORLD")
add('om_historien',
    "Mollys vognlenke hører til LME Baby Collection \"Woodland Dreams\". Molly henger midt på "
    'lenken, omgitt av tingene hun elsker fra blomsterengen og himmelen over skogen: sol, sky, '
    'stjerner, blomster, blader og en liten sommerfugl.',
    'Molly\'s stroller toy belongs to the LME Baby Collection "Woodland Dreams". Molly hangs in '
    'the middle of the toy, surrounded by the things she loves from the flower meadow and the '
    'sky above the forest: sun, cloud, stars, flowers, leaves and a little butterfly.')
add('pill_stil', 'STIL', 'STYLE')
add('om_stil',
    'Skandinavisk og Montessori-inspirert, i de samme naturfargene som resten av kolleksjonen. '
    'Enkle, flate motiver som er lette å kjenne igjen for et lite barn som ligger og ser opp.',
    'Scandinavian and Montessori-inspired, in the same natural colours as the rest of the '
    'collection. Simple, flat motifs that are easy for a small child lying and looking up to '
    'recognise.')
add('pill_sikkerhet_kort', 'VIKTIGST AV ALT: SIKKERHET', 'MOST IMPORTANT OF ALL: SAFETY')
add('om_sikkerhet_kort',
    'En vognlenke henger over barnet, ofte uten at en voksen ser på hele tiden. Derfor er '
    'lengden på denne oppskriften bevisst kort, og hele side 14 er viet sikkerhet. Les den '
    'siden før du hekler videre.',
    "A stroller toy hangs over the child, often without an adult watching all the time. That's "
    "why this pattern's length is deliberately short, and all of page 14 is dedicated to "
    "safety. Read that page before you crochet on.")

# ---------------------------------------------------------------- SIDE 3
add('banner_mat', 'MATERIALER OG GARNALTERNATIVER', 'MATERIALS AND YARN ALTERNATIVES')
add('pill_garn', 'GARN', 'YARN')
add('garn_txt',
    'Bystrikk Merino (kremhvitt og smørgult) og rester av pudderrosa og salviegrønt, pluss '
    "litt gult til solen, samme garnfamilie som resten av Mollys oppskrift.",
    "Bystrikk Merino (cream and butter yellow) and leftover powder pink and sage green, plus a "
    "little yellow for the sun, the same yarn family as the rest of Molly's pattern.")
add('garn_alt',
    'Alternativt garn: enhver myk bomullsblanding i DK-tykkelse fungerer fint, for eksempel '
    'DROPS Safran eller Hobbii Amigo.',
    'Alternative yarn: any soft cotton-blend DK-weight yarn works well, for example DROPS '
    'Safran or Hobbii Amigo.')
add('pill_utstyr', 'UTSTYR OG TILBEHØR', 'TOOLS AND SUPPLIES')
add('utstyr', [
    ('Heklenål 3 eller 3,5 mm', ''),
    ('Litt polyesterfiber til fyll', 'kun til Molly-medaljongen'),
    ('Kort, sterk bomullssnor eller flettet bomullsbånd', 'til selve strengen mellom motivene'),
    ('To feste-punkter: treklips, plastklips eller treringer', 'BPA-frie/CE-merket, se side om '
     'sikkerhet for valg og lengde'),
    ('To små trerelaterte teetheringer', 'umalt/BPA-fri, CE-merket, beregnet for barn, til '
     'sideringene med kuler'),
    ('Stoppenål med butt spiss og tvinnet bomullstråd', 'til all somming'),
    ('Saks og målebånd', ''),
])
add('pill_oppheng', 'VALG AV OPPHENG', 'CHOOSING THE ATTACHMENT')
add('oppheng_txt',
    ['Treklips: to runde eller flate treklyper uten metallfjær, sys godt fast i hver ende av '
     'lenken.',
     'Plastklips: BPA-frie plastklyper beregnet for barnevogn/lekety, følg produsentens egen '
     'monteringsanvisning.',
     'Treringer: to treringer sys fast i hver ende, og en løkke eller stropp på vognen tres '
     'gjennom ringene.'],
    ['Wooden clips: two round or flat wooden clips with no metal spring, sewn securely onto '
     'each end of the toy.',
     'Plastic clips: BPA-free plastic clips intended for prams/toys, follow the '
     "manufacturer's own fitting instructions.",
     'Wooden rings: two wooden rings sewn onto each end, with a loop or strap on the stroller '
     'threaded through the rings.'])

# ---------------------------------------------------------------- SIDE 4
add('banner_klar', 'VANSKELIGHETSGRAD, MÅL OG FASTHET', 'DIFFICULTY, SIZE AND GAUGE')
add('pill_vanskelig', 'VANSKELIGHETSGRAD', 'DIFFICULTY')
add('vanskelig_txt', 'Lett til middels. Mange små, enkle motiver som er fine å hekle om '
    'kvelden.', 'Easy to medium. Lots of small, simple motifs that are nice to crochet in the '
    'evening.')
add('pill_mal', 'ANBEFALT MAKS LENGDE', 'RECOMMENDED MAX LENGTH')
add('mal_txt',
    'LME anbefaler maks 35 til 40 cm mellom de to festepunktene, strukket helt ut, og at ingen '
    'enkeltmotiv henger løst mer enn ca. 6 til 8 cm ned fra hovedstrengen. Se side om sikkerhet '
    'for full forklaring.',
    'LME recommends a maximum of 35 to 40 cm between the two attachment points, fully '
    'stretched out, and that no single motif hangs loose more than approx. 6 to 8 cm from the '
    'main strand. See the safety page for the full explanation.')
add('pill_fasthet', 'HEKLEFASTHET', 'GAUGE')
add('fasthet_txt',
    'Hekle stramt, amigurumi-fasthet: ca. 20 fm x 22 omganger = 10 x 10 cm på nål 3 mm.',
    'Crochet tightly, amigurumi tension: approx. 20 sc x 22 rounds = 10 x 10 cm on a 3 mm hook.')

# ---------------------------------------------------------------- SIDE 5
add('banner_ord', 'FORKORTELSER (NORSK OG US)', 'ABBREVIATIONS (NORWEGIAN AND US)')
add('ord_lead',
    'Motivene bruker fastmasker, stav og halvstav, i tillegg til løkkemasker på ulltoppen, '
    'akkurat som Mollys smokkelenke.',
    "The motifs use single, double and half double crochet, plus loop stitches on the wool "
    "topknot, just like Molly's pacifier clip.")
add('ord_head', ['Norsk', 'US', 'Betyr'], ['Norwegian', 'US', 'Means'])
add('ord_rows', [
    ('lm', 'ch', 'luftmaske / chain'),
    ('fm', 'sc', 'fastmaske / single crochet'),
    ('halvstav', 'hdc', 'halv stav / half double crochet'),
    ('stav', 'dc', 'stav / double crochet'),
    ('kjm', 'sl st', 'kjedemaske / slip stitch'),
    ('løkkm', 'loop st', 'løkkemaske: se Mollys egen oppskrift for full forklaring'),
    ('magisk ring', 'magic ring', 'justerbar startring uten hull i midten'),
    ('økn', 'inc', 'økning: 2 fm i samme maske. Gir én maske mer.'),
    ('m', 'st(s)', 'maske(r)'),
    ('*...*', '*...*', 'gjenta det mellom stjernene så mange ganger som står bak'),
])
add('pill_tips', 'TIPS FØR DU BEGYNNER', 'TIPS BEFORE YOU START')
add('tips',
    ['Hekle alle motivene ferdig først, og legg dem ut i ønsket rekkefølge før du monterer.',
     'Bruk stoppeklokke-metoden: mål alt strukket helt ut, ikke avslappet, når du sjekker '
     'lengden.',
     'Fest motivene tett inntil hovedstrengen, ikke på egne lange tråder.'],
    ['Crochet all the motifs first, and lay them out in the order you want before assembling.',
     'Always measure everything fully stretched out, not relaxed, when checking the length.',
     'Attach the motifs close against the main strand, not on their own long threads.'])

# ---------------------------------------------------------------- SIDE 6
add('banner_oversikt', 'SLIK ER VOGNLENKEN BYGGET OPP', 'HOW THE STROLLER TOY IS BUILT')
add('oversikt_lead',
    'Syv motiver hekles hver for seg og festes tett langs en kort hovedstreng, med Molly i '
    'midten, pluss to sideringer med kuler:',
    'Seven motifs are crocheted separately and attached close together along a short main '
    'strand, with Molly in the middle, plus two side rings with balls:')
add('oversikt_deler', [
    ('1. Molly-medaljongen', 'midtmotivet, med en mini ulltopp og sløyfe', '1. The Molly '
     'medallion', 'the centre motif, with a mini wool topknot and bow'),
    ('2. Skyen', 'kremhvit', '2. The cloud', 'cream'),
    ('3. Solen', 'gul, med stråler', '3. The sun', 'yellow, with rays'),
    ('4. Bladet', 'salviegrønt', '4. The leaf', 'sage green'),
    ('5. Blomsten', 'pudderrosa', '5. The flower', 'powder pink'),
    ('6. Stjernen', 'kremhvit', '6. The star', 'cream'),
    ('7. Sommerfuglen', 'pudderrosa og kremhvitt', '7. The butterfly', 'powder pink and '
     'cream'),
    ('8. Sideringene', 'to treringer med en dinglende kule i hver', '8. The side rings',
     'two wooden rings with a dangling ball in each'),
])

# ---------------------------------------------------------------- SIDE 7: MOLLY-MEDALJONGEN
add('banner_medaljong', 'DEL 1: MOLLY-MEDALJONGEN', 'PART 1: THE MOLLY MEDALLION')
add('medaljong_lead',
    'Midtmotivet er en liten, flat utgave av Mollys hode, kremhvit, lett stoppet slik at den '
    'får litt form uten å bli tung.',
    "The centre motif is a small, flat version of Molly's head, cream, lightly stuffed so it "
    "gets a little shape without becoming heavy.")
add('medaljong_rows', [
    ('1', '6 fm i magisk ring, kremhvitt', 6),
    ('2', 'økn x 6', 12),
    ('3', '(1 fm, økn) x 6', 18),
    ('4', '(2 fm, økn) x 6', 24),
    ('5 til 6', '24 fm, 2 omganger', 24),
    ('7', '(2 fm, mink) x 6 - fyll svært lett', 18),
    ('8', 'mink x 6', 9),
])
add('medaljong_rows_en', [
    ('1', '6 sc in a magic ring, cream', 6),
    ('2', 'inc x 6', 12),
    ('3', '(1 sc, inc) x 6', 18),
    ('4', '(2 sc, inc) x 6', 24),
    ('5 to 6', '24 sc, 2 rounds', 24),
    ('7', '(2 sc, dec) x 6 - stuff very lightly', 18),
    ('8', 'dec x 6', 9),
])
add('medaljong_ferdig',
    'Klipp av med god tråd igjen. Sy to små myke ører (6 fm i magisk ring, økn x 6 (12), '
    'avslutt, hekle 2 stk) øverst, hekle en liten tett ulltopp (6 til 8 løkkemasker rett inn '
    'på overflaten mellom ørene) og en mini sløyfe i smørgult (legg opp 8 lm + 1 vendemaske, 1 '
    'rad fm, fold og sy fast oppå ulltoppen), og brodér et lite ansikt akkurat som på rangelen '
    'og smokkelenken.',
    'Cut, leaving a long tail. Sew on two small soft ears (6 sc in a magic ring, inc x 6 (12), '
    'fasten off, make 2) on top, crochet a small dense wool topknot (6 to 8 loop stitches '
    'directly onto the surface between the ears) and a mini bow in butter yellow (chain 8 + 1 '
    'turning chain, 1 row of sc, fold and sew on top of the wool topknot), and embroider a '
    "small face just like on the rattle and pacifier clip.")

# ---------------------------------------------------------------- SIDE 8: SKY OG SOL
add('banner_sky_sol', 'DEL 2: SKYEN OG SOLEN', 'PART 2: THE CLOUD AND THE SUN')
add('pill_sky', 'SKYEN (KREMHVIT)', 'THE CLOUD (CREAM)')
add('sky_txt',
    'Hekle tre flate sirkler i ulik størrelse: (a) 6 fm i magisk ring, avslutt. (b) 6 fm i '
    'magisk ring, økn x 6 (12), avslutt. (c) 6 fm i magisk ring, økn x 6 (12), (1 fm, økn) x 6 '
    '(18), avslutt. Overlapp de tre sirklene og sy dem sammen til en liten skyform.',
    'Crochet three flat circles in different sizes: (a) 6 sc in a magic ring, fasten off. (b) '
    '6 sc in a magic ring, inc x 6 (12), fasten off. (c) 6 sc in a magic ring, inc x 6 (12), '
    '(1 sc, inc) x 6 (18), fasten off. Overlap the three circles and sew them together into a '
    'small cloud shape.')
add('pill_sol', 'SOLEN (GUL)', 'THE SUN (YELLOW)')
add('sol_txt',
    'Hekle 6 fm i magisk ring, økn x 6 (12), (1 fm, økn) x 6 (18). Uten å lukke omgangen, '
    'fortsett rett inn i strålene: *1 fm, 3 lm, kjm i samme maske*, gjenta rundt til alle 18 '
    'maskene har en liten stråle. Avslutt og klipp av.',
    'Crochet 6 sc in a magic ring, inc x 6 (12), (1 sc, inc) x 6 (18). Without joining the '
    'round, continue straight into the rays: *1 sc, 3 ch, sl st in the same stitch*, repeat '
    'around until all 18 stitches have a little ray. Fasten off and cut.')

# ---------------------------------------------------------------- SIDE 9: BLAD OG BLOMST
add('banner_blad_blomst', 'DEL 3: BLADET OG BLOMSTEN', 'PART 3: THE LEAF AND THE FLOWER')
add('pill_blad', 'BLADET (SALVIEGRØNT)', 'THE LEAF (SAGE GREEN)')
add('blad_txt',
    'Legg opp 7 lm. Start i 2. lm fra nålen: 1 kjm, 1 fm, 1 halvstav, 2 stav i siste lm '
    '(tuppen), snu og fortsett på den andre siden av kjeden: 1 halvstav, 1 fm, 1 kjm. Avslutt '
    'og klipp av med god tråd igjen.',
    'Chain 7. Starting in the 2nd ch from the hook: 1 sl st, 1 sc, 1 hdc, 2 dc in the last ch '
    '(the tip), turn and continue along the other side of the chain: 1 hdc, 1 sc, 1 sl st. '
    'Fasten off, leaving a long tail.')
add('pill_blomst', 'BLOMSTEN (PUDDERROSA)', 'THE FLOWER (POWDER PINK)')
add('blomst_txt',
    'Hekle 12 fm i magisk ring. Uten å lukke omgangen, fortsett rett inn i kronbladene: '
    '*hopp over 1 m, i neste m: 1 kjm, 1 lm, 3 stav, 1 lm, 1 kjm*, gjenta rundt til du har seks '
    'kronblad. Avslutt med kjedemaske og klipp av med god tråd igjen.',
    'Crochet 12 sc in a magic ring. Without joining the round, continue straight into the '
    'petals: *skip 1 st, in the next st: 1 sl st, 1 ch, 3 dc, 1 ch, 1 sl st*, repeat around '
    'until you have six petals. Finish with a slip stitch and cut, leaving a long tail.')

# ---------------------------------------------------------------- SIDE 10: STJERNE OG SOMMERFUGL
add('banner_stjerne_sommerfugl', 'DEL 4: STJERNEN OG SOMMERFUGLEN', 'PART 4: THE STAR AND THE BUTTERFLY')
add('pill_stjerne', 'STJERNEN (KREMHVIT)', 'THE STAR (CREAM)')
add('stjerne_txt',
    'Hekle 5 fm i magisk ring. Uten å lukke omgangen, fortsett rett inn i takkene: *1 fm, 3 lm, '
    'kjm i samme maske*, gjenta rundt til alle 5 maskene har en takk. Avslutt og klipp av med '
    'god tråd igjen.',
    'Crochet 5 sc in a magic ring. Without joining the round, continue straight into the '
    'points: *1 sc, 3 ch, sl st in the same stitch*, repeat around until all 5 stitches have a '
    'point. Fasten off, leaving a long tail.')
add('pill_sommerfugl', 'SOMMERFUGLEN (VINGER OG KROPP)', 'THE BUTTERFLY (WINGS AND BODY)')
add('sommerfugl_txt',
    'Hekle to like vinger i pudderrosa: 6 fm i magisk ring, økn x 6 (12), avslutt (hekle 2 '
    'stk). Hekle en liten kropp i kremhvitt: 5 lm, kjm i hver lm tilbake. Legg kroppen mellom '
    'de to vingene og sy alt sammen på midten. Brodér to korte antenner i svart tråd øverst på '
    'kroppen.',
    'Crochet two matching wings in powder pink: 6 sc in a magic ring, inc x 6 (12), fasten off '
    '(make 2). Crochet a small body in cream: 5 ch, sl st in each ch back across. Place the '
    'body between the two wings and sew everything together in the middle. Embroider two '
    'short antennae in black thread at the top of the body.')

# ---------------------------------------------------------------- SIDE 11: SIDERINGENE
add('banner_sideringer', 'DEL 5: SIDERINGENE MED KULER', 'PART 5: THE SIDE RINGS WITH BALLS')
add('sideringer_lead',
    'To små treringer med en dinglende, heklet kule inni hver, festet et stykke ut på hver '
    'side av Molly-medaljongen.',
    "Two small wooden rings with a dangling crocheted ball inside each, attached partway "
    "along the strand on each side of the Molly medallion.")
add('sideringer_txt',
    "Kulene: hekle to kuler, samme oppskrift som på Mollys smokkelenke: 6 fm i magisk ring, "
    'økn x 6 (12), 12 fm i 2 omganger, mink x 6 (6), fyll lett, fest av med god tråd igjen.',
    "The balls: crochet two balls, the same pattern as on Molly's pacifier clip: 6 sc in a "
    'magic ring, inc x 6 (12), 12 sc for 2 rounds, dec x 6 (6), stuff lightly, fasten off '
    'leaving a long tail.')
add('sideringer_ferdig',
    'Heng hver kule inni en trering på en kort, sydd løkke, maks 6 til 8 cm, aldri løsere. Sy '
    'selve ringen godt fast tett inntil hovedstrengen på hver side av Molly, med flere runder '
    'overstingsøm, ikke bare tredd løst gjennom snoren.',
    'Hang each ball inside a wooden ring on a short, sewn loop, no more than 6 to 8 cm, never '
    'looser. Sew the ring itself securely close against the main strand on each side of '
    'Molly, with several rounds of whip stitching, not just threaded loosely onto the cord.')

# ---------------------------------------------------------------- SIDE 12: MONTERING
add('banner_montering', 'MONTERING, STEG FOR STEG', 'ASSEMBLY, STEP BY STEP')
add('montering_lead',
    'Legg alle sju motivene og de to sideringene ut i den rekkefølgen du vil ha dem, med '
    'Molly i midten, før du fester noe permanent.',
    'Lay out all seven motifs and the two side rings in the order you want, with Molly in '
    'the middle, before you attach anything permanently.')
add('montering_steg', [
    'Klipp en kort, sterk bomullssnor eller flett et bomullsbånd i ønsket lengde (se side om '
    'sikkerhet for maks lengde).',
    'Sy Molly-medaljongen fast midt på snoren.',
    'Fordel de seks andre motivene jevnt på hver side av Molly, tett inntil hovedstrengen, og '
    'sy dem godt fast.',
    'Fest de to sideringene med kulene et stykke lenger ut på hver side, godt fast med '
    'overstingsøm.',
    'Fest et treklips, plastklips eller en trering i hver ende av snoren.',
    'Mål hele lenken strukket helt ut en siste gang, og sjekk at ingen motiv eller ring henger '
    'løsere enn anbefalt.',
    'Fest alle løse tråder godt på innsiden av delene, og klipp av det som er igjen.',
])
add('montering_steg_en', [
    'Cut a short, strong cotton cord or braid a cotton strap to the length you want (see the '
    'safety page for the maximum length).',
    'Sew the Molly medallion onto the middle of the cord.',
    'Distribute the other six motifs evenly on each side of Molly, close against the main '
    'strand, and sew them on securely.',
    'Attach the two side rings with the balls a little further out on each side, securely with '
    'whip stitching.',
    'Attach a wooden clip, plastic clip or wooden ring to each end of the cord.',
    'Measure the whole toy fully stretched out one last time, and check that no motif or ring '
    'hangs looser than recommended.',
    'Fasten every loose end securely on the inside of the pieces, and trim what is left.',
])

# ---------------------------------------------------------------- SIDE 13: FOTOVEILEDNING
add('banner_foto', 'FOTOVEILEDNING', 'PHOTO GUIDE')
add('foto_lead',
    'Sett inn egne bilder av hvert steg her når du har heklet vognlenken selv.',
    'Add your own photos of each step here once you have crocheted the stroller toy yourself.')
add('foto_captions',
    ['Alle sju motivene', 'Molly midt på snoren', 'Motivene fordelt', 'Ferdig montert lenke'],
    ['All seven motifs', 'Molly in the middle of the cord', 'The motifs spread out',
     'The fully assembled toy'])

# ---------------------------------------------------------------- SIDE 14: SIKKERHET
add('banner_sikkerhet', 'SIKKERHET', 'SAFETY')
add('pill_lengde', 'HVORFOR LENGDEN ER SÅ VIKTIG', 'WHY THE LENGTH MATTERS SO MUCH')
add('lengde_txt',
    'En vognlenke som festes med begge ender til barnevognen danner en løkke over barnet. '
    'Generelle sikkerhetsprinsipper for leketøy beregnet på barn under 36 måneder (blant annet '
    'i den europeiske leketøystandarden EN 71) sier at snorer og bånd skal holdes så korte som '
    'praktisk mulig, nettopp for å unngå at en slik løkke kan havne rundt halsen. LME anbefaler '
    'derfor maks 35 til 40 cm mellom festepunktene, strukket helt ut, og at hvert motiv henger '
    'kort og tett inntil hovedstrengen, aldri på egne lange tråder. Dette er en forsiktig '
    'LME-anbefaling, ikke et sitat fra et bestemt paragrafnummer, så sjekk alltid ferdig '
    'produkt mot gjeldende og oppdaterte lokale krav før det tas i bruk eller selges.',
    'A stroller toy attached at both ends to the pram forms a loop over the child. General '
    'safety principles for toys intended for children under 36 months (including in the '
    'European toy standard EN 71) state that cords and straps should be kept as short as '
    'practically possible, precisely to avoid such a loop ending up around the neck. LME '
    'therefore recommends a maximum of 35 to 40 cm between the attachment points, fully '
    'stretched out, and that each motif hangs short and close against the main strand, never '
    'on its own long threads. This is a cautious LME recommendation, not a quote from a '
    'specific clause number, so always check the finished product against current, updated '
    'local requirements before use or sale.')
add('pill_regler', 'FLERE VIKTIGE REGLER', 'MORE IMPORTANT RULES')
add('regler',
    ['Brukes alltid under tilsyn av en voksen. Ta av vognlenken når barnet sover, eller når '
     'ingen voksen er i nærheten.',
     'Fest lenken godt på tvers av vognens bøyle, aldri løst hengende ned mot barnets ansikt '
     'eller hals.',
     'Ingen deler limes. Alt sys fast med sterk, tvinnet bomullstråd og mange, tette sting.',
     'Bruk kun festeklips/-ringer som er BPA-frie/CE-merket og beregnet for barneprodukter.',
     'Kulene i sideringene skal henge på en kort, sydd løkke, maks 6 til 8 cm, aldri løsere, og '
     'ringene skal sys fast, ikke bare tres løst på snoren.',
     'Løkkemaskene i ulltoppen er myke og ufarlige, men bør sjekkes jevnlig for å se at ingen '
     'løkke har blitt så løs at et lite barn kan få en finger fast i den.',
     'Sjekk lenken jevnlig for slitasje: løse tråder, motiver eller sideringer som henger løst, '
     'eller festepunkter som er svekket. Kast lenken umiddelbart hvis noe er galt.',
     'Denne oppskriften er en veiledning for hjemmebruk. Skal det ferdige produktet selges, må '
     'det alltid kontrolleres, testes og eventuelt merkes i henhold til gjeldende lokale '
     'sikkerhetskrav og regelverk for barneprodukter/leketøy.'],
    ['Always use under adult supervision. Remove the stroller toy when the child is sleeping, '
     'or when no adult is nearby.',
     "Attach the toy securely across the pram's bar, never hanging loosely down towards the "
     "child's face or neck.",
     'No parts are glued. Everything is sewn on with strong, twisted cotton thread and plenty '
     'of tight stitches.',
     'Use only attachment clips/rings that are BPA-free/CE-marked and intended for '
     "children's products.",
     'The balls in the side rings must hang on a short, sewn loop, no more than 6 to 8 cm, '
     'never looser, and the rings must be sewn on, not just threaded loosely onto the cord.',
     "The loop stitches in the wool topknot are soft and harmless, but should be checked "
     "regularly to make sure no loop has become so loose that a small child's finger could "
     "get caught in it.",
     'Check the toy regularly for wear: loose threads, motifs or side rings hanging loose, or '
     'weakened attachment points. Discard the toy immediately if anything is wrong.',
     'This pattern is a guide for home use. If the finished product is sold, it must always be '
     'checked, tested and marked as required under current local safety requirements and '
     "regulations for children's products/toys."])

# ---------------------------------------------------------------- SIDE 15: STELL
add('banner_stell', 'STELL OG VASK', 'CARE AND WASHING')
add('stell_txt',
    'Håndvask i lunkent vann med litt mild såpe. Skyll godt. Klem forsiktig ut vannet i et '
    'håndkle, ikke vri. Legg til tørk flatt, formet pent, unna direkte sollys.',
    'Hand wash in lukewarm water with a little mild soap. Rinse well. Gently press out the '
    'water in a towel, do not wring. Lay flat to dry, neatly shaped, away from direct sunlight.')
add('pill_qr', 'VIDEOVEILEDNING', 'VIDEO GUIDE')
add('qr_caption', 'QR-kode til videoveiledning (legges til)', 'QR code to video guide (to be added)')

# ---------------------------------------------------------------- SIDE 16: FERDIG
add('banner_ferdig', 'GRATULERER, VOGNLENKEN ER FERDIG!', 'CONGRATULATIONS, THE STROLLER TOY IS DONE!')
add('ferdig_txt',
    'Nå har du heklet en liten Molly-vognlenke. Husk å sjekke lengden en siste gang før den '
    'festes til vognen!',
    "Now you have crocheted a little Molly stroller toy. Remember to check the length one "
    "last time before attaching it to the pram!")
add('pill_kolleksjon', 'RESTEN AV LME BABY COLLECTION', 'THE REST OF THE LME BABY COLLECTION')
add('kolleksjon_liste',
    ['Ellie, det lille dådyret', 'Pip, det lille pinnsvinet', 'Felix, den lille reven',
     'Molly, det lille lammet', 'Luna, den lille kaninen', 'Oliver, den lille bjørnen',
     'Ellies smokkelenke', 'Pips smokkelenke', "Felix' smokkelenke", 'Mollys smokkelenke',
     'Lunas smokkelenke', 'Olivers smokkelenke', 'Pips rangle', "Felix' rangle",
     'Mollys rangle', 'Lunas rangle', 'Olivers rangle', 'Ellies rangle', 'Pips vognlenke',
     "Felix' vognlenke", 'Ellies vognlenke', 'Ellies ballerinasko', 'Ellies aktivitetsleke'],
    ['Ellie, the little fawn', 'Pip, the little hedgehog', 'Felix, the little fox',
     'Molly, the little lamb', 'Luna, the little bunny', 'Oliver, the little bear',
     "Ellie's pacifier clip", "Pip's pacifier clip", "Felix's pacifier clip",
     "Molly's pacifier clip", "Luna's pacifier clip", "Oliver's pacifier clip",
     "Pip's rattle", "Felix's rattle", "Molly's rattle", "Luna's rattle", "Oliver's rattle",
     "Ellie's rattle", "Pip's stroller toy", "Felix's stroller toy", "Ellie's stroller toy",
     "Ellie's ballerina shoes", "Ellie's activity toy"])
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
<div class="coverimg"><img src="{ref_src}" alt="Molly, stiluttrykk-referanse"></div>
<p class="small center" style="margin-top:-2mm;">{'Bildet viser Molly som stiluttrykk-referanse, ikke selve vognlenken.' if lang == 'no' else 'Photo shows Molly as a style reference, not the stroller toy itself.'}</p>
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

    oppheng_items = T['oppheng_txt']['no'] if lang == 'no' else T['oppheng_txt']['en']
    utstyr_list = ul([f'<b>{a}</b>' + (f' &middot; {b}' if b else '') for a, b in T['utstyr']['no']])
    pages.append(pg(f'''
{banner(t('banner_mat'))}
{rosep(t('pill_garn'))}
{card('<p>' + t('garn_txt') + '</p><p class="small">' + t('garn_alt') + '</p>')}
{sagep(t('pill_utstyr'))}
{card(utstyr_list)}
{rosep(t('pill_oppheng'))}
{card(ul(oppheng_items))}
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
{sagep('ANBEFALT MAKS LENGDE' if lang == 'no' else 'RECOMMENDED MAX LENGTH')}
{cme(t('mal_txt'))}
''', 6))

    med_rows = T['medaljong_rows']['no'] if lang == 'no' else T['medaljong_rows_en']['no']
    pages.append(pg(f'''
{banner(t('banner_medaljong'))}
<p>{t('medaljong_lead')}</p>
{card(otab(med_rows, head3[lang]))}
{cme(t('medaljong_ferdig'))}
''', 7))

    pages.append(pg(f'''
{banner(t('banner_sky_sol'))}
{rosep(t('pill_sky'))}
{card('<p>' + t('sky_txt') + '</p>')}
{sagep(t('pill_sol'))}
{card('<p>' + t('sol_txt') + '</p>')}
''', 8))

    pages.append(pg(f'''
{banner(t('banner_blad_blomst'))}
{sagep(t('pill_blad'))}
{card('<p>' + t('blad_txt') + '</p>')}
{rosep(t('pill_blomst'))}
{card('<p>' + t('blomst_txt') + '</p>')}
''', 9))

    pages.append(pg(f'''
{banner(t('banner_stjerne_sommerfugl'))}
{sagep(t('pill_stjerne'))}
{card('<p>' + t('stjerne_txt') + '</p>')}
{rosep(t('pill_sommerfugl'))}
{card('<p>' + t('sommerfugl_txt') + '</p>')}
''', 10))

    pages.append(pg(f'''
{banner(t('banner_sideringer'))}
<p>{t('sideringer_lead')}</p>
{card('<p>' + t('sideringer_txt') + '</p>')}
{cme(t('sideringer_ferdig'))}
''', 11))

    mo_steg = T['montering_steg']['no'] if lang == 'no' else T['montering_steg_en']['no']
    pages.append(pg(f'''
{banner(t('banner_montering'))}
<p>{t('montering_lead')}</p>
{card(steps(mo_steg))}
''', 12))

    foto_caps = T['foto_captions']['no'] if lang == 'no' else T['foto_captions']['en']
    pages.append(pg(f'''
{banner(t('banner_foto'))}
{card('<p class="center">' + t('foto_lead') + '</p>')}
{photo_row(foto_caps)}
''', 13))

    regler = T['regler']['no'] if lang == 'no' else T['regler']['en']
    pages.append(pg(f'''
{banner(t('banner_sikkerhet'))}
{rosep(t('pill_lengde'))}
{card('<p>' + t('lengde_txt') + '</p>')}
{sagep(t('pill_regler'))}
{card(ul(regler))}
''', 14))

    pages.append(pg(f'''
{banner(t('banner_stell'))}
{cme(t('stell_txt'))}
{rosep(t('pill_qr'))}
{qr_placeholder(t('qr_caption'))}
''', 15))

    kolliste = T['kolleksjon_liste']['no'] if lang == 'no' else T['kolleksjon_liste']['en']
    kolliste_html = ('<ul class="dots" style="columns:2;column-gap:8mm;">'
                      + ''.join(f'<li>{i}</li>' for i in kolliste) + '</ul>')
    pages.append(pg(f'''
{banner(t('banner_ferdig'))}
{cream('<p class="creamtitle">' + t('ferdig_txt') + '</p>')}
{sagep(t('pill_kolleksjon'))}
{card(kolliste_html)}
{rosep(t('pill_copyright'))}
{card('<p class="small center">' + t('copyright_txt') + '</p>')}
<div class="byline">
  <div class="by2">{t('by1')} &middot; {t('by2')} &middot; {t('by3')}</div>
</div>
''', 16))

    return pages

for lang in ('no', 'en'):
    html_doc = kit.doc(lang, T['doctitle'][lang], None, build(lang))
    out = BASE / f'vognlenke_{lang}.html'
    out.write_text(html_doc, encoding='utf-8')
    print('OK', lang, len(html_doc), 'tegn/chars')
