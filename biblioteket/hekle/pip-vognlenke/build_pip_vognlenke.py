# -*- coding: utf-8 -*-
"""Genererer LME-hekleoppskrift 'Pips vognlenke' (norsk + engelsk) som HTML,
klar for PDF-print med Chromium. Del av LME Baby Collection 'Woodland Dreams'."""
import base64, pathlib, sys

BASE = pathlib.Path(__file__).parent
sys.path.insert(0, str(BASE.parent / '_shared'))
import lme_pattern_kit as kit
from lme_pattern_kit import (banner, rosep, sagep, card, cream, cme, ul, steps, otab, abbrtab)

REF = BASE / 'pip_vognlenke_real.jpg'
ref_b64 = base64.b64encode(REF.read_bytes()).decode()
ref_src = f'data:image/jpeg;base64,{ref_b64}'

PIGG = '#6B4226'

T = {}
def add(key, no, en=None):
    T[key] = {'no': no, 'en': en if en is not None else no}

head3 = {'no': ['Omg', 'Beskrivelse', 'Masker'], 'en': ['Rnd', 'Description', 'Sts']}

# ---------------------------------------------------------------- SIDE 1
add('doctitle', 'Pips vognlenke, LME hekleoppskrift', "Pip's Stroller Toy, LME crochet pattern")
add('ph2', 'LME HEKLEOPPSKRIFT&nbsp;&nbsp;|&nbsp;&nbsp;PIPS VOGNLENKE',
    "LME CROCHET PATTERN&nbsp;&nbsp;|&nbsp;&nbsp;PIP'S STROLLER TOY")
add('covertag', 'LME HEKLEOPPSKRIFT - BABY', 'LME CROCHET PATTERN - BABY')
add('covertitle', 'PIPS VOGNLENKE', "PIP'S STROLLER TOY")
add('subpill', 'LME BABY COLLECTION - WOODLAND DREAMS', 'LME BABY COLLECTION - WOODLAND DREAMS')
add('cover_desc',
    'En liten vognlenke med Pip midt på i en salviegrønn volangkrage, dinglende fra en kjede '
    'av heklede kuler, treperler, en blomst og et blad, med to trering-rangler på hver side og '
    'en tre-kuleklips i hver ende som festes rett på barnevognens bøyle. Heklet i de samme '
    'naturfargene som resten av kolleksjonen, med lengde satt bevisst kort av sikkerhetshensyn.',
    "A little stroller toy with Pip in the middle in a sage green ruffled collar, hanging from "
    "a chain of crocheted balls, wooden beads, a flower and a leaf, with two wooden ring "
    "rattles on each side and a wooden ball clip at each end that attaches directly to the "
    "pram's bar. Crocheted in the same natural colours as the rest of the collection, with a "
    "length kept deliberately short for safety.")
add('by1', 'Av Renate Dahl', 'By Renate Dahl')
add('by2', 'Little Montessori Explorers', 'Little Montessori Explorers')
add('by3', 'lmexplorers.com', 'lmexplorers.com')
add('cover_tip',
    'VIKTIG: Les sikkerhetssiden nøye før du begynner. Total lengde og hvor løst delene '
    'henger er de viktigste tallene i denne oppskriften.',
    'IMPORTANT: Read the safety page carefully before you start. Total length and how loosely '
    'the pieces hang are the most important numbers in this pattern.')

# ---------------------------------------------------------------- SIDE 2
add('banner_om', 'OM PIPS VOGNLENKE', "ABOUT PIP'S STROLLER TOY")
add('pill_historien', 'DEL AV ELLIES VERDEN', "PART OF ELLIE'S WORLD")
add('om_historien',
    'Pips vognlenke hører til LME Baby Collection "Woodland Dreams". Pip henger midt på '
    'kjeden, med en liten blomst og et blad fra skogbunnen han elsker på hver side, og to '
    'trering-rangler som barnet kan gripe etter og lytte til.',
    'Pip\'s stroller toy belongs to the LME Baby Collection "Woodland Dreams". Pip hangs in '
    'the middle of the chain, with a little flower and leaf from the forest floor he loves on '
    'each side, and two wooden ring rattles the child can reach for and listen to.')
add('pill_stil', 'STIL', 'STYLE')
add('om_stil',
    'Skandinavisk og Montessori-inspirert, i de samme naturfargene som resten av kolleksjonen. '
    'En myk kjede av runde kuler og treperler, med Pip som det tydelige midtpunktet.',
    'Scandinavian and Montessori-inspired, in the same natural colours as the rest of the '
    'collection. A soft chain of round balls and wooden beads, with Pip as the clear centre '
    'point.')
add('pill_sikkerhet_kort', 'VIKTIGST AV ALT: SIKKERHET', 'MOST IMPORTANT OF ALL: SAFETY')
add('om_sikkerhet_kort',
    'En vognlenke henger over barnet, ofte uten at en voksen ser på hele tiden. Derfor er '
    'lengden på denne oppskriften bevisst kort, og hele side 12 er viet sikkerhet. Les den '
    'siden før du hekler videre.',
    "A stroller toy hangs over the child, often without an adult watching all the time. That's "
    "why this pattern's length is deliberately short, and all of page 12 is dedicated to "
    "safety. Read that page before you crochet on.")

# ---------------------------------------------------------------- SIDE 3
add('banner_mat', 'MATERIALER OG GARNALTERNATIVER', 'MATERIALS AND YARN ALTERNATIVES')
add('pill_garn', 'GARN', 'YARN')
add('garn_txt',
    'Bystrikk Merino (kremhvitt og mørkt varmt brunt) og rester av pudderrosa og salviegrønt, '
    "samme garnfamilie som resten av Pips oppskrift.",
    "Bystrikk Merino (cream and dark warm brown) and leftover powder pink and sage green, the "
    "same yarn family as the rest of Pip's pattern.")
add('garn_alt',
    'Alternativt garn: enhver myk bomullsblanding i DK-tykkelse fungerer fint, for eksempel '
    'DROPS Safran eller Hobbii Amigo.',
    'Alternative yarn: any soft cotton-blend DK-weight yarn works well, for example DROPS '
    'Safran or Hobbii Amigo.')
add('pill_utstyr', 'UTSTYR OG TILBEHØR', 'TOOLS AND SUPPLIES')
add('utstyr', [
    ('Heklenål 3 eller 3,5 mm', ''),
    ('Litt polyesterfiber til fyll', 'kun til Pip-medaljongen og kulene'),
    ('To runde tre-kuleklips med smokkelenke-mekanisme', 'kjøpt hos leverandør av '
     'smokkelenke-/vognlenke-tilbehør, med sikker, innkapslet fjærmekanisme, BPA-fri/CE-merket '
     'og beregnet spesielt for barnevogn (se side om sikkerhet)'),
    ('Ca. 10 til 12 små tre-mellomperler', 'umalt/CE-merket, hull stort nok for tykk tråd, '
     'tres inn mellom de heklede kulene i kjeden'),
    ('To trerender, ca. 5 til 6 cm i diameter', 'umalt/BPA-fri, CE-merket, beregnet for barn, '
     'til de to trering-ranglene'),
    ('Kort, sterk bomullssnor eller flettet bomullsbånd', 'til selve kjeden mellom delene'),
    ('Stoppenål med butt spiss og tvinnet bomullstråd', 'til all somming'),
    ('Saks og målebånd', ''),
])

# ---------------------------------------------------------------- SIDE 4
add('banner_klar', 'VANSKELIGHETSGRAD, MÅL OG FASTHET', 'DIFFICULTY, SIZE AND GAUGE')
add('pill_vanskelig', 'VANSKELIGHETSGRAD', 'DIFFICULTY')
add('vanskelig_txt', 'Lett til middels. Mange små, enkle deler som er fine å hekle om '
    'kvelden.', 'Easy to medium. Lots of small, simple pieces that are nice to crochet in the '
    'evening.')
add('pill_mal', 'ANBEFALT MAKS LENGDE', 'RECOMMENDED MAX LENGTH')
add('mal_txt',
    'LME anbefaler maks 35 til 40 cm mellom de to tre-kuleklipsene, strukket helt ut, og at '
    'ingen enkeltdel henger løst mer enn ca. 6 til 8 cm ned fra hovedkjeden. Se side om '
    'sikkerhet for full forklaring.',
    'LME recommends a maximum of 35 to 40 cm between the two wooden ball clips, fully '
    'stretched out, and that no single piece hangs loose more than approx. 6 to 8 cm from the '
    'main chain. See the safety page for the full explanation.')
add('pill_fasthet', 'HEKLEFASTHET', 'GAUGE')
add('fasthet_txt',
    'Hekle stramt, amigurumi-fasthet: ca. 20 fm x 22 omganger = 10 x 10 cm på nål 3 mm.',
    'Crochet tightly, amigurumi tension: approx. 20 sc x 22 rounds = 10 x 10 cm on a 3 mm hook.')

# ---------------------------------------------------------------- SIDE 5
add('banner_ord', 'FORKORTELSER (NORSK OG US)', 'ABBREVIATIONS (NORWEGIAN AND US)')
add('ord_lead',
    'Delene bruker fastmasker, stav og halvstav, i tillegg til løkkemasker på piggstripen, '
    'akkurat som Pips smokkelenke.',
    "The pieces use single, double and half double crochet, plus loop stitches on the spike "
    "stripe, just like Pip's pacifier clip.")
add('ord_head', ['Norsk', 'US', 'Betyr'], ['Norwegian', 'US', 'Means'])
add('ord_rows', [
    ('lm', 'ch', 'luftmaske / chain'),
    ('fm', 'sc', 'fastmaske / single crochet'),
    ('halvstav', 'hdc', 'halv stav / half double crochet'),
    ('stav', 'dc', 'stav / double crochet'),
    ('kjm', 'sl st', 'kjedemaske / slip stitch'),
    ('løkkm', 'loop st', 'løkkemaske: se Pips egen oppskrift for full forklaring'),
    ('magisk ring', 'magic ring', 'justerbar startring uten hull i midten'),
    ('økn', 'inc', 'økning: 2 fm i samme maske. Gir én maske mer.'),
    ('mink', 'dec', 'minking: 2 fm sammen. Gir én maske mindre.'),
    ('m', 'st(s)', 'maske(r)'),
    ('*...*', '*...*', 'gjenta det mellom stjernene så mange ganger som står bak'),
])
add('pill_tips', 'TIPS FØR DU BEGYNNER', 'TIPS BEFORE YOU START')
add('tips',
    ['Hekle alle delene ferdig først, og legg dem ut i ønsket rekkefølge før du monterer.',
     'Bruk stoppeklokke-metoden: mål alt strukket helt ut, ikke avslappet, når du sjekker '
     'lengden.',
     'Fest delene tett inntil hovedkjeden, ikke på egne lange tråder.'],
    ['Crochet all the pieces first, and lay them out in the order you want before assembling.',
     'Always measure everything fully stretched out, not relaxed, when checking the length.',
     'Attach the pieces close against the main chain, not on their own long threads.'])

# ---------------------------------------------------------------- SIDE 6
add('banner_oversikt', 'SLIK ER VOGNLENKEN BYGGET OPP', 'HOW THE STROLLER TOY IS BUILT')
add('oversikt_lead',
    'Fire deler hekles hver for seg og festes langs en kort kjede av kuler og treperler, med '
    'Pip i midten:',
    'Four pieces are crocheted separately and attached along a short chain of balls and '
    'wooden beads, with Pip in the middle:')
add('oversikt_deler', [
    ('1. Pip-medaljongen', 'midtdelen, med mini piggstripe og volangkrage', '1. The Pip '
     'medallion', 'the centre piece, with a mini spike stripe and ruffled collar'),
    ('2. Blomsten og bladet', 'pudderrosa og salviegrønt, én på hver side', '2. The flower and '
     'leaf', 'powder pink and sage green, one on each side'),
    ('3. Trering-ranglene', 'to stk, med en dinglende kule i hver', '3. The wooden ring '
     'rattles', 'two, with a dangling ball in each'),
    ('4. De heklede kulene', 'fyller ut resten av kjeden, med treperler mellom', '4. The '
     'crocheted balls', 'fill out the rest of the chain, with wooden beads in between'),
])

# ---------------------------------------------------------------- SIDE 7: PIP-MEDALJONGEN
add('banner_medaljong', 'DEL 1: PIP-MEDALJONGEN', 'PART 1: THE PIP MEDALLION')
add('medaljong_lead',
    'Midtdelen er en liten, flat utgave av Pips hode, kremhvit, lett stoppet slik at den får '
    'litt form uten å bli tung.',
    "The centre piece is a small, flat version of Pip's head, cream, lightly stuffed so it "
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
    'Klipp av med god tråd igjen. Sy to små ører i mørkt varmt brunt (5 fm i magisk ring, '
    'avslutt, hekle 2 stk) øverst, hekle en kort mini-piggstripe (legg opp 4 lm + 1 vendemaske, '
    '2 rader løkkm) og sy den langs midtlinjen bak, og brodér et lite ansikt akkurat som på '
    'rangelen og smokkelenken.',
    'Cut, leaving a long tail. Sew on two small ears in dark warm brown (5 sc in a magic ring, '
    'fasten off, make 2) on top, crochet a short mini spike stripe (chain 4 + 1 turning chain, '
    '2 rows of loop stitch) and sew it along the centre back, and embroider a small face just '
    "like on the rattle and pacifier clip.")
add('pill_krage', 'VOLANGKRAGEN (SALVIEGRØNN)', 'THE RUFFLED COLLAR (SAGE GREEN)')
add('krage_txt',
    'Fest salviegrønn tråd rundt kanten der hodet er som smalest, nederst. *1 fm i neste '
    'maske, hopp over 1 maske, 3 stav i neste maske (en liten vifte), hopp over 1 maske*, '
    'gjenta rundt hele kanten. Fest av og gjem tråden. Volangkragen hekles direkte på hodet og '
    'trenger ingen ekstra festing.',
    'Attach sage green yarn around the edge where the head is narrowest, at the bottom. '
    '*1 sc in the next stitch, skip 1 stitch, 3 dc in the next stitch (a little fan), skip 1 '
    'stitch*, repeat all the way around the edge. Fasten off and weave in the end. The '
    'ruffled collar is crocheted directly onto the head and needs no extra attaching.')

# ---------------------------------------------------------------- SIDE 8: BLAD OG BLOMST
add('banner_blad_blomst', 'DEL 2: BLADET OG BLOMSTEN', 'PART 2: THE LEAF AND THE FLOWER')
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

# ---------------------------------------------------------------- SIDE 9: TRERING-RANGLENE
add('banner_rangler', 'DEL 3: TRERING-RANGLENE', 'PART 3: THE WOODEN RING RATTLES')
add('rangler_lead',
    'To trerender med en liten, dinglende heklet kule inni hver, festet et stykke ut på hver '
    'side av Pip-medaljongen. Disse er det barnet griper etter og rasler med.',
    'Two wooden rings with a small dangling crocheted ball inside each, attached partway '
    'along the chain on each side of the Pip medallion. These are what the child reaches for '
    'and rattles.')
add('rangler_txt',
    'Kulene: hekle to kuler, samme oppskrift som på Pips smokkelenke: 6 fm i magisk ring, '
    'økn x 6 (12), 12 fm i 2 omganger, mink x 6 (6), fyll lett, fest av med god tråd igjen.',
    "The balls: crochet two balls, the same pattern as on Pip's pacifier clip: 6 sc in a "
    'magic ring, inc x 6 (12), 12 sc for 2 rounds, dec x 6 (6), stuff lightly, fasten off '
    'leaving a long tail.')
add('rangler_ferdig',
    'Heng hver kule inni en trering på en kort, sydd løkke, maks 6 til 8 cm, aldri løsere. Sy '
    'selve ringen godt fast tett inntil hovedkjeden på hver side av Pip, med flere runder '
    'overstingsøm, ikke bare tredd løst gjennom snoren.',
    'Hang each ball inside a wooden ring on a short, sewn loop, no more than 6 to 8 cm, never '
    'looser. Sew the ring itself securely close against the main chain on each side of Pip, '
    'with several rounds of whip stitching, not just threaded loosely onto the cord.')

# ---------------------------------------------------------------- SIDE 10: KULENE
add('banner_kuler', 'DEL 4: DE HEKLEDE KULENE', 'PART 4: THE CROCHETED BALLS')
add('kuler_lead',
    'Hekle så mange kuler du trenger for å fylle ut resten av kjeden, gjerne i en rytme av '
    'kremhvitt, mørkt brunt og salviegrønt, med en liten tre-mellomperle mellom hver kule. '
    'Husk: total lengde skal aldri bli mer enn 35 til 40 cm.',
    'Crochet as many balls as you need to fill out the rest of the chain, for example '
    'alternating cream, dark brown and sage green, with a small wooden spacer bead between '
    'each ball. Remember: the total length must never exceed 35 to 40 cm.')
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
    'Fyll lett, klipp av med god tråd igjen på hver kule. Diameter ca. 1,5 til 2 cm. Antall '
    'kuler avhenger av hvor langt du vil at kjeden skal bli, tell alltid opp hele lenken før '
    'du fester noe permanent.',
    'Stuff lightly, cut with a long tail on each ball. Diameter approx. 1.5 to 2 cm. The '
    'number of balls depends on how long you want the chain to be, always lay out the whole '
    'toy before attaching anything permanently.')

# ---------------------------------------------------------------- SIDE 11: MONTERING
add('banner_montering', 'MONTERING, STEG FOR STEG', 'ASSEMBLY, STEP BY STEP')
add('montering_lead',
    'Legg Pip-medaljongen, blomsten, bladet, de to trering-ranglene og alle kulene ut i den '
    'rekkefølgen du vil ha dem, før du fester noe permanent.',
    'Lay out the Pip medallion, the flower, the leaf, the two wooden ring rattles and all the '
    'balls in the order you want, before you attach anything permanently.')
add('montering_steg', [
    'Klipp en kort, sterk bomullssnor eller flett et bomullsbånd i ønsket lengde (se side om '
    'sikkerhet for maks lengde).',
    'Sy Pip-medaljongen fast midt på kjeden, med piggstripen og volangkragen ferdig heklet.',
    'Tre kulene på snoren med en liten tre-mellomperle mellom hver, jevnt fordelt på begge '
    'sider av Pip.',
    'Sy blomsten og bladet fast et stykke ut på hver side, tett inntil kjeden.',
    'Fest de to trering-ranglene med kulene lenger ut på hver side, godt fast med '
    'overstingsøm.',
    'Fest en tre-kuleklips godt fast i hver ende av kjeden, med mange, tette sting.',
    'Mål hele kjeden strukket helt ut en siste gang, og sjekk at ingen del henger løsere enn '
    'anbefalt.',
    'Fest alle løse tråder godt på innsiden av delene, og klipp av det som er igjen.',
])
add('montering_steg_en', [
    'Cut a short, strong cotton cord or braid a cotton strap to the length you want (see the '
    'safety page for the maximum length).',
    'Sew the Pip medallion onto the middle of the chain, with the spike stripe and ruffled '
    'collar already crocheted on.',
    'Thread the balls onto the cord with a small wooden spacer bead between each one, evenly '
    'distributed on both sides of Pip.',
    'Sew the flower and leaf on partway out on each side, close against the chain.',
    'Attach the two wooden ring rattles with the balls further out on each side, securely '
    'with whip stitching.',
    'Attach a wooden ball clip securely to each end of the chain, with plenty of tight '
    'stitches.',
    'Measure the whole chain fully stretched out one last time, and check that no piece hangs '
    'looser than recommended.',
    'Fasten every loose end securely on the inside of the pieces, and trim what is left.',
])

# ---------------------------------------------------------------- SIDE 12: SIKKERHET
add('banner_sikkerhet', 'SIKKERHET', 'SAFETY')
add('pill_lengde', 'HVORFOR LENGDEN ER SÅ VIKTIG', 'WHY THE LENGTH MATTERS SO MUCH')
add('lengde_txt',
    'En vognlenke som festes med begge ender til barnevognen danner en løkke over barnet. '
    'Generelle sikkerhetsprinsipper for leketøy beregnet på barn under 36 måneder (blant annet '
    'i den europeiske leketøystandarden EN 71) sier at snorer og kjeder skal holdes så korte '
    'som praktisk mulig, nettopp for å unngå at en slik løkke kan havne rundt halsen. LME '
    'anbefaler derfor maks 35 til 40 cm mellom de to tre-kuleklipsene, strukket helt ut, og at '
    'hver del henger kort og tett inntil hovedkjeden, aldri på egne lange tråder. Dette er en '
    'forsiktig LME-anbefaling, ikke et sitat fra et bestemt paragrafnummer, så sjekk alltid '
    'ferdig produkt mot gjeldende og oppdaterte lokale krav før det tas i bruk eller selges.',
    'A stroller toy attached at both ends to the pram forms a loop over the child. General '
    'safety principles for toys intended for children under 36 months (including in the '
    'European toy standard EN 71) state that cords and chains should be kept as short as '
    'practically possible, precisely to avoid such a loop ending up around the neck. LME '
    'therefore recommends a maximum of 35 to 40 cm between the two wooden ball clips, fully '
    'stretched out, and that each piece hangs short and close against the main chain, never on '
    'its own long threads. This is a cautious LME recommendation, not a quote from a specific '
    'clause number, so always check the finished product against current, updated local '
    'requirements before use or sale.')
add('pill_regler', 'FLERE VIKTIGE REGLER', 'MORE IMPORTANT RULES')
add('regler',
    ['Brukes alltid under tilsyn av en voksen. Ta av vognlenken når barnet sover, eller når '
     'ingen voksen er i nærheten.',
     'Bruk kun tre-kuleklips kjøpt spesielt til barnevogn/vognlenker, med innkapslet '
     'fjærmekanisme, BPA-fri/CE-merket, aldri en generell binders eller kontorklype. Fest '
     'klipsene godt på tvers av vognens bøyle, aldri løst hengende ned mot barnets ansikt '
     'eller hals.',
     'Ingen deler limes. Alt sys fast med sterk, tvinnet bomullstråd og mange, tette sting.',
     'Bruk kun tre-mellomperler og trerender som er umalte/CE-merket og beregnet for '
     'barneprodukter.',
     'Kulene i trering-ranglene skal henge på en kort, sydd løkke, maks 6 til 8 cm, aldri '
     'løsere, og ringene skal sys fast, ikke bare tres løst på snoren.',
     'Sjekk lenken jevnlig for slitasje: løse tråder, deler eller ringer som henger løst, eller '
     'festepunkter som er svekket. Kast lenken umiddelbart hvis noe er galt.',
     'Denne oppskriften er en veiledning for hjemmebruk. Skal det ferdige produktet selges, må '
     'det alltid kontrolleres, testes og eventuelt merkes i henhold til gjeldende lokale '
     'sikkerhetskrav og regelverk for barneprodukter/leketøy.'],
    ['Always use under adult supervision. Remove the stroller toy when the child is sleeping, '
     'or when no adult is nearby.',
     'Use only wooden ball clips bought specifically for prams/stroller toys, with an enclosed '
     'spring mechanism, BPA-free/CE-marked, never a generic binder or office clip. Attach the '
     "clips securely across the pram's bar, never hanging loosely down towards the child's "
     'face or neck.',
     'No parts are glued. Everything is sewn on with strong, twisted cotton thread and plenty '
     'of tight stitches.',
     'Use only wooden spacer beads and wooden rings that are unpainted/CE-marked and intended '
     "for children's products.",
     'The balls in the wooden ring rattles must hang on a short, sewn loop, no more than 6 to '
     '8 cm, never looser, and the rings must be sewn on, not just threaded loosely onto the '
     'cord.',
     'Check the toy regularly for wear: loose threads, pieces or rings hanging loose, or '
     'weakened attachment points. Discard the toy immediately if anything is wrong.',
     'This pattern is a guide for home use. If the finished product is sold, it must always be '
     'checked, tested and marked as required under current local safety requirements and '
     "regulations for children's products/toys."])

# ---------------------------------------------------------------- SIDE 13: STELL
add('banner_stell', 'STELL OG VASK', 'CARE AND WASHING')
add('stell_txt',
    'Håndvask i lunkent vann med litt mild såpe. Skyll godt. Klem forsiktig ut vannet i et '
    'håndkle, ikke vri. Legg til tørk flatt, formet pent, unna direkte sollys.',
    'Hand wash in lukewarm water with a little mild soap. Rinse well. Gently press out the '
    'water in a towel, do not wring. Lay flat to dry, neatly shaped, away from direct sunlight.')

# ---------------------------------------------------------------- SIDE 14: FERDIG
add('banner_ferdig', 'GRATULERER, VOGNLENKEN ER FERDIG!', 'CONGRATULATIONS, THE STROLLER TOY IS DONE!')
add('ferdig_txt',
    'Nå har du heklet en liten Pip-vognlenke. Husk å sjekke lengden en siste gang før den '
    'festes til vognen!',
    "Now you have crocheted a little Pip stroller toy. Remember to check the length one last "
    "time before attaching it to the pram!")
add('pill_kolleksjon', 'RESTEN AV LME BABY COLLECTION', 'THE REST OF THE LME BABY COLLECTION')
add('kolleksjon_liste',
    ['Ellie, det lille dådyret', 'Pip, det lille pinnsvinet', 'Felix, den lille reven',
     'Molly, det lille lammet', 'Luna, den lille kaninen', 'Oliver, den lille bjørnen',
     'Ellies smokkelenke', 'Pips smokkelenke', "Felix' smokkelenke", 'Mollys smokkelenke',
     'Lunas smokkelenke', 'Olivers smokkelenke', 'Pips rangle', "Felix' rangle",
     'Mollys rangle', 'Lunas rangle', 'Olivers rangle', 'Ellies rangle', "Felix' vognlenke",
     'Mollys vognlenke', 'Lunas vognlenke', 'Olivers vognlenke', 'Ellies vognlenke',
     'Ellies ballerinasko', 'Ellies aktivitetsleke'],
    ['Ellie, the little fawn', 'Pip, the little hedgehog', 'Felix, the little fox',
     'Molly, the little lamb', 'Luna, the little bunny', 'Oliver, the little bear',
     "Ellie's pacifier clip", "Pip's pacifier clip", "Felix's pacifier clip",
     "Molly's pacifier clip", "Luna's pacifier clip", "Oliver's pacifier clip",
     "Pip's rattle", "Felix's rattle", "Molly's rattle", "Luna's rattle", "Oliver's rattle",
     "Ellie's rattle", "Felix's stroller toy", "Molly's stroller toy", "Luna's stroller toy",
     "Oliver's stroller toy", "Ellie's stroller toy", "Ellie's ballerina shoes",
     "Ellie's activity toy"])
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
<div class="coverimg"><img src="{ref_src}" alt="Pip, stiluttrykk-referanse"></div>
<p class="small center" style="margin-top:-2mm;">{'Stiluttrykk-referanse, ikke det ferdige heklede produktet.' if lang == 'no' else 'Style reference, not the finished crocheted product.'}</p>
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
{sagep('ANBEFALT MAKS LENGDE' if lang == 'no' else 'RECOMMENDED MAX LENGTH')}
{cme(t('mal_txt'))}
''', 6))

    med_rows = T['medaljong_rows']['no'] if lang == 'no' else T['medaljong_rows_en']['no']
    pages.append(pg(f'''
{banner(t('banner_medaljong'))}
<p>{t('medaljong_lead')}</p>
{card(otab(med_rows, head3[lang]))}
{cme(t('medaljong_ferdig'))}
{rosep(t('pill_krage'))}
{card('<p>' + t('krage_txt') + '</p>')}
''', 7))

    pages.append(pg(f'''
{banner(t('banner_blad_blomst'))}
{sagep(t('pill_blad'))}
{card('<p>' + t('blad_txt') + '</p>')}
{rosep(t('pill_blomst'))}
{card('<p>' + t('blomst_txt') + '</p>')}
''', 8))

    pages.append(pg(f'''
{banner(t('banner_rangler'))}
<p>{t('rangler_lead')}</p>
{card('<p>' + t('rangler_txt') + '</p>')}
{cme(t('rangler_ferdig'))}
''', 9))

    kuler_rows = T['kuler_rows']['no'] if lang == 'no' else T['kuler_rows_en']['no']
    pages.append(pg(f'''
{banner(t('banner_kuler'))}
<p>{t('kuler_lead')}</p>
{card(otab(kuler_rows, head3[lang]))}
{cme(t('kuler_ferdig'))}
''', 10))

    mo_steg = T['montering_steg']['no'] if lang == 'no' else T['montering_steg_en']['no']
    pages.append(pg(f'''
{banner(t('banner_montering'))}
<p>{t('montering_lead')}</p>
{card(steps(mo_steg))}
''', 11))

    regler = T['regler']['no'] if lang == 'no' else T['regler']['en']
    pages.append(pg(f'''
{banner(t('banner_sikkerhet'))}
{rosep(t('pill_lengde'))}
{card('<p>' + t('lengde_txt') + '</p>')}
{sagep(t('pill_regler'))}
{card(ul(regler))}
''', 12))

    pages.append(pg(f'''
{banner(t('banner_stell'))}
{cme(t('stell_txt'))}
''', 13))

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
''', 14))

    return pages

for lang in ('no', 'en'):
    html_doc = kit.doc(lang, T['doctitle'][lang], None, build(lang))
    out = BASE / f'vognlenke_{lang}.html'
    out.write_text(html_doc, encoding='utf-8')
    print('OK', lang, len(html_doc), 'tegn/chars')
