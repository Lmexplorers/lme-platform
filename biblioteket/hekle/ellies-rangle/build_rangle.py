# -*- coding: utf-8 -*-
"""Genererer LME-hekleoppskrift 'Ellies rangle' (norsk + engelsk) som HTML,
klar for PDF-print med Chromium. Del av LME Baby Collection 'Woodland Dreams'."""
import base64, pathlib, sys

BASE = pathlib.Path(__file__).parent
sys.path.insert(0, str(BASE.parent / '_shared'))
import lme_pattern_kit as kit
from lme_pattern_kit import (banner, rosep, sagep, card, cream, cme, ul, steps, otab, abbrtab,
                              photo_row, qr_placeholder)

REF = BASE / 'rangle_ref.jpg'
ref_b64 = base64.b64encode(REF.read_bytes()).decode()
ref_src = f'data:image/jpeg;base64,{ref_b64}'

T = {}
def add(key, no, en=None):
    T[key] = {'no': no, 'en': en if en is not None else no}

head3 = {'no': ['Omg', 'Beskrivelse', 'Masker'], 'en': ['Rnd', 'Description', 'Sts']}

# ---------------------------------------------------------------- SIDE 1
add('doctitle', 'Ellies rangle, LME hekleoppskrift', "Ellie's Rattle, LME crochet pattern")
add('ph2', 'LME HEKLEOPPSKRIFT&nbsp;&nbsp;|&nbsp;&nbsp;ELLIES RANGLE',
    "LME CROCHET PATTERN&nbsp;&nbsp;|&nbsp;&nbsp;ELLIE'S RATTLE")
add('covertag', 'LME HEKLEOPPSKRIFT - BABY', 'LME CROCHET PATTERN - BABY')
add('covertitle', 'ELLIES RANGLE', "ELLIE'S RATTLE")
add('subpill', 'LME BABY COLLECTION - WOODLAND DREAMS', 'LME BABY COLLECTION - WOODLAND DREAMS')
add('cover_desc',
    'En liten dådyr-rangle på en trering, ca. 13 til 15 cm høy. Hodet er formet som en '
    'miniatyrutgave av Ellie, med myke ører, en sløyfe, en volangkrage rundt halsen og en '
    'rangleboks trygt gjemt inni. Perfekt for små hender å gripe og riste.',
    'A little deer rattle on a wooden ring, approx. 13 to 15 cm tall. The head is shaped like a '
    'miniature version of Ellie, with soft ears, a bow, a ruffled collar around the neck and a '
    'rattle capsule safely tucked inside. Perfect for small hands to grip and shake.')
add('by1', 'Av Renate Dahl', 'By Renate Dahl')
add('by2', 'Little Montessori Explorers', 'Little Montessori Explorers')
add('by3', 'lmexplorers.com', 'lmexplorers.com')
add('cover_tip',
    'TIPS: Les hele oppskriften og sikkerhetssiden en gang før du begynner. Rangleboksen skal '
    'sys helt inn og skal aldri kunne tas ut igjen av barnet.',
    "TIP: Read through the whole pattern and the safety page once before you start. The rattle "
    "capsule must be sewn in completely and should never be removable by the child.")

# ---------------------------------------------------------------- SIDE 2
add('banner_om', 'OM ELLIES RANGLE', "ABOUT ELLIE'S RATTLE")
add('pill_historien', 'DEL AV ELLIES VERDEN', "PART OF ELLIE'S WORLD")
add('om_historien',
    'Ellies rangle hører til LME Baby Collection "Woodland Dreams". Dette lille dådyrhodet på en '
    'trering er tenkt som barnets aller første møte med Ellie, laget for hender som ennå er for '
    'små til å holde selve dyret.',
    'Ellie\'s rattle belongs to the LME Baby Collection "Woodland Dreams". This little deer head '
    'on a wooden ring is meant as the child\'s very first meeting with Ellie, made for hands that '
    'are still too small to hold the toy itself.')
add('pill_stil', 'STIL', 'STYLE')
add('om_stil',
    'Skandinavisk og Montessori-inspirert, i de samme naturfargene som resten av kolleksjonen: '
    'brunt, kremhvitt og salviegrønt. Rund, myk form uten skarpe kanter.',
    'Scandinavian and Montessori-inspired, in the same natural colours as the rest of the '
    'collection: brown, cream and sage green. A round, soft shape with no sharp edges.')
add('pill_funksjon', 'FUNKSJON', 'FUNCTION')
add('om_funksjon',
    'Trering gir en trygg, lett gripbar håndtak-form. Rangleboksen inni hodet lager en myk '
    'raslelyd. De myke ørene gir litt tekstur å utforske med fingrene.',
    'The wooden ring gives a safe, easy-to-grip handle shape. The rattle capsule inside the head '
    'makes a soft rustling sound. The soft ears give a little texture to explore with small fingers.')

# ---------------------------------------------------------------- SIDE 3
add('banner_mat', 'MATERIALER OG GARNALTERNATIVER', 'MATERIALS AND YARN ALTERNATIVES')
add('pill_garn', 'GARN', 'YARN')
add('garn_txt',
    'Bystrikk Merino, brunt (hovedfarge) og kremhvitt (innsiden av ørene), samme garn som '
    'resten av Ellie-kolleksjonen.',
    'Bystrikk Merino, brown (main colour) and cream (inside of the ears), the same yarn as the '
    'rest of the Ellie collection.')
add('garn_alt',
    'Alternativt garn: enhver myk bomullsblanding i DK-tykkelse fungerer fint, for eksempel '
    'DROPS Safran eller Hobbii Amigo. Bomull er lettest å vaske rent og tåler jevnlig håndvask '
    'best.',
    'Alternative yarn: any soft cotton-blend DK-weight yarn works well, for example DROPS '
    'Safran or Hobbii Amigo. Cotton is easiest to wash clean and holds up best to regular hand '
    'washing.')
add('pill_utstyr', 'UTSTYR OG TILBEHØR', 'TOOLS AND SUPPLIES')
add('utstyr', [
    ('Heklenål 3 eller 3,5 mm', 'litt tettere enn Ellie selv, siden hodet er lite'),
    ('Polyesterfiber til fyll', 'liten mengde'),
    ('Trering, ca. 6 til 7 cm i diameter', 'umalt, CE-merket, beregnet for barn'),
    ('Rangleboks eller rangleinnsats', 'en liten, lukket kapsel med rangleperler, beregnet for '
     'amigurumi/leketøy. Aldri løse perler eller bjeller direkte i fyllet'),
    ('Stoppenål med butt spiss', 'til all somming'),
    ('Tvinnet bomullstråd og nål', 'til å sy rangleboksen og ringen godt fast'),
    ('Saks og målebånd', ''),
])

# ---------------------------------------------------------------- SIDE 4
add('banner_klar', 'VANSKELIGHETSGRAD, MÅL OG FASTHET', 'DIFFICULTY, SIZE AND GAUGE')
add('pill_vanskelig', 'VANSKELIGHETSGRAD', 'DIFFICULTY')
add('vanskelig_txt', 'Lett. Et fint prosjekt for deg som akkurat har lært amigurumi.',
    'Easy. A nice project if you have just learned amigurumi.')
add('pill_mal', 'FERDIG HØYDE', 'FINISHED HEIGHT')
add('mal_txt', 'Ca. 13 til 15 cm, fra bunnen av treringen til toppen av ørene.',
    'Approx. 13 to 15 cm, from the bottom of the wooden ring to the top of the ears.')
add('pill_fasthet', 'HEKLEFASTHET', 'GAUGE')
add('fasthet_txt',
    'Hekle stramt, amigurumi-fasthet: ca. 20 fm x 22 omganger = 10 x 10 cm på nål 3 mm. Fyllet '
    'og rangleboksen skal ikke synes eller kunne kjennes skarpt gjennom maskene.',
    'Crochet tightly, amigurumi tension: approx. 20 sc x 22 rounds = 10 x 10 cm on a 3 mm hook. '
    'The stuffing and rattle capsule should not show through, or feel sharp through, the stitches.')

# ---------------------------------------------------------------- SIDE 5
add('banner_ord', 'FORKORTELSER (NORSK OG US)', 'ABBREVIATIONS (NORWEGIAN AND US)')
add('ord_lead',
    'Hele rangelen hekles med fastmasker i spiral. Her er forkortelsene, med de vanlige '
    'amerikanske hekletermene ved siden av.',
    'The whole rattle is crocheted with single crochet in a spiral. Here are the abbreviations, '
    'with the common US crochet terms alongside.')
add('ord_head', ['Norsk', 'US', 'Betyr'], ['Norwegian', 'US', 'Means'])
add('ord_rows', [
    ('lm', 'ch', 'luftmaske / chain'),
    ('fm', 'sc', 'fastmaske / single crochet'),
    ('kjm', 'sl st', 'kjedemaske / slip stitch'),
    ('magisk ring', 'magic ring', 'justerbar startring uten hull i midten'),
    ('økn', 'inc', 'økning: 2 fm i samme maske. Gir én maske mer.'),
    ('mink', 'dec', 'minking: 2 fm sammen. Gir én maske mindre.'),
    ('m', 'st(s)', 'maske(r)'),
    ('omg', 'rnd', 'omgang, en hel runde rundt i spiral'),
    ('( )', '( )', 'totalt antall masker på omgangen'),
    ('*...*', '*...*', 'gjenta det mellom stjernene så mange ganger som står bak'),
])
add('pill_tips', 'TIPS FØR DU BEGYNNER', 'TIPS BEFORE YOU START')
add('tips',
    ['Kjøp rangleboksen før du begynner, så du vet at den passer inn i hodet før du hekler '
     'ferdig.',
     'Stopp fyll rundt rangleboksen på alle sider, så den ikke kan skli og skrangle løst inni.',
     'Prøv ringen mot hodet underveis for å se at proporsjonene blir fine.'],
    ['Buy the rattle capsule before you start, so you know it fits inside the head before you '
     'finish crocheting.',
     'Stuff filling around the rattle capsule on all sides, so it cannot slide and rattle '
     'loosely inside.',
     'Hold the ring up against the head as you go, to check the proportions look right.'])

# ---------------------------------------------------------------- SIDE 6
add('banner_oversikt', 'SLIK ER RANGELEN BYGGET OPP', 'HOW THE RATTLE IS BUILT')
add('oversikt_lead',
    'Fire deler hekles hver for seg og sys sammen rundt treringen til slutt:',
    'Four pieces are crocheted separately, then sewn together around the wooden ring at the end:')
add('oversikt_deler', [
    ('1. Hodet', 'rommer rangleboksen inni', '1. The head', 'holds the rattle capsule inside'),
    ('2. Halsen og kragen', 'tube med volangkant, sys rundt treringen', '2. The neck and collar',
     'a tube with a ruffled edge, sewn around the wooden ring'),
    ('3. Ørene', 'to stk, myke, to lag', '3. The ears', 'two, soft, two layers'),
    ('4. Sløyfen', 'mellom ørene', '4. The bow', 'between the ears'),
])

# ---------------------------------------------------------------- SIDE 7: HODET
add('banner_hode', 'DEL 1: HODET', 'PART 1: THE HEAD')
add('hode_lead',
    'Hodet hekles i spiral, ovenfra og ned, i brunt. Rangleboksen legges inn før de siste '
    'omgangene lukkes.',
    'The head is crocheted in a spiral, from the top down, in brown. The rattle capsule is '
    'inserted before the last rounds are closed.')
add('hode_rows', [
    ('1', '6 fm i magisk ring', 6),
    ('2', 'økn x 6', 12),
    ('3', '(1 fm, økn) x 6', 18),
    ('4', '(2 fm, økn) x 6', 24),
    ('5', '(3 fm, økn) x 6', 30),
    ('6 til 9', '30 fm, 4 omganger uten økning', 30),
    ('10', '(3 fm, mink) x 6 - fyll godt herfra', 24),
    ('11', '(2 fm, mink) x 6 - legg inn rangleboksen nå, godt omgitt av fyll', 18),
    ('12', '(1 fm, mink) x 6', 12),
    ('13', 'mink x 6', 6),
])
add('hode_rows_en', [
    ('1', '6 sc in a magic ring', 6),
    ('2', 'inc x 6', 12),
    ('3', '(1 sc, inc) x 6', 18),
    ('4', '(2 sc, inc) x 6', 24),
    ('5', '(3 sc, inc) x 6', 30),
    ('6 to 9', '30 sc, 4 rounds with no increases', 30),
    ('10', '(3 sc, dec) x 6 - stuff firmly from here', 24),
    ('11', '(2 sc, dec) x 6 - insert the rattle capsule now, well surrounded by stuffing', 18),
    ('12', '(1 sc, dec) x 6', 12),
    ('13', 'dec x 6', 6),
])
add('hode_ferdig',
    'Ikke klipp av tråden. Diameter ca. 8 cm. Du bruker samme tråden til å feste hodet på '
    'halsen senere.',
    'Do not cut the yarn. Diameter approx. 8 cm. You use the same yarn to attach the head to the '
    'neck later.')

# ---------------------------------------------------------------- SIDE 8: HALS OG RING
add('banner_hals', 'DEL 2: HALSEN OG TRERINGEN', 'PART 2: THE NECK AND THE WOODEN RING')
add('hals_lead',
    'Halsen er en kort tube som sys rundt treringen og fester hodet til håndtaket.',
    'The neck is a short tube that is sewn around the wooden ring and attaches the head to the '
    'handle.')
add('hals_rows', [
    ('1', '6 fm i magisk ring', 6),
    ('2', 'økn x 6', 12),
    ('3 til 5', '12 fm, 3 omganger', 12),
])
add('hals_rows_en', [
    ('1', '6 sc in a magic ring', 6),
    ('2', 'inc x 6', 12),
    ('3 to 5', '12 sc, 3 rounds', 12),
])
add('hals_ferdig',
    'Ikke klipp av. Legg treringen inni halstuben, brett kanten av tuben over ringen og sy '
    'rundt hele ringen med tette, faste sting, slik at ringen er helt omsluttet og ikke kan '
    'skli ut.',
    'Do not cut the yarn. Place the wooden ring inside the neck tube, fold the edge of the tube '
    'over the ring and sew all the way around it with tight, secure stitches, so the ring is '
    'fully enclosed and cannot slide out.')
add('pill_krage', 'VOLANGKRAGEN', 'THE RUFFLED COLLAR')
add('krage_txt',
    'Før du syr hodet fast: fest pudderrosa tråd i halsens øverste kant (12 m). *1 fm i neste '
    'maske, hopp over 1 maske, 3 stav i neste maske (en liten vifte)*, gjenta rundt hele '
    'kanten (6 vifter totalt). Fest av og gjem tråden.',
    'Before sewing the head on: attach powder pink yarn at the top edge of the neck (12 sts). '
    '*1 sc in the next stitch, skip 1 stitch, 3 dc in the next stitch (a little fan)*, repeat '
    'all the way around the edge (6 fans in total). Fasten off and weave in the end.')
add('pill_montering_hode', 'FEST HODET PÅ HALSEN', "ATTACH THE HEAD TO THE NECK")
add('montering_hode_txt',
    'Sy hodet fast oppå halsen med tette sting hele veien rundt, midt over ringen.',
    'Sew the head onto the neck with tight stitches all the way around, centred over the ring.')

# ---------------------------------------------------------------- SIDE 9: ØRER OG SLØYFE
add('banner_orer', 'DEL 3: ØRENE OG SLØYFEN', 'PART 3: THE EARS AND THE BOW')
add('pill_orer', 'ØRENE (2 STK, TO LAG)', 'THE EARS (MAKE 2, TWO LAYERS)')
add('orer_txt',
    'Ytterside (brunt): 6 fm i magisk ring, økn x 6 (12), (1 fm, økn) x 6 (18). Avslutt. '
    'Innside (kremhvitt): 6 fm i magisk ring, økn x 6 (12). Avslutt. Sy den lyse sirkelen midt '
    'oppå den brune, og sy ørene fast øverst på hodet, ett på hver side.',
    'Outside (brown): 6 sc in a magic ring, inc x 6 (12), (1 sc, inc) x 6 (18). Fasten off. '
    'Inside (cream): 6 sc in a magic ring, inc x 6 (12). Fasten off. Sew the light circle onto '
    'the middle of the brown one, and sew the ears onto the top of the head, one on each side.')
add('pill_horn', 'SLØYFEN', 'THE BOW')
add('horn_txt',
    'Hekle en smal strimmel i pudderrosa: legg opp 14 lm + 1 vendemaske, fm i hver maske '
    'tilbake i 3 rader. Klipp av med god tråd igjen. Fold strimmelen sammen til en liten '
    'sløyfeform og sy et lite stykke garn stramt rundt midten flere ganger. Sy sløyfen fast '
    'permanent og flatt mellom ørene.',
    'Crochet a narrow strip in powder pink: chain 14 + 1 turning chain, sc in each stitch back '
    'across for 3 rows. Cut, leaving a long tail. Fold the strip together into a small bow '
    'shape and wrap a short length of yarn tightly around the centre a few times. Sew the bow '
    'on permanently and flat, between the ears.')
add('pill_ansikt', 'ANSIKTET, BRODERT', 'THE FACE, EMBROIDERED')
add('ansikt_txt',
    'Brodér to runde øyne i svart satengsting og en liten nese under. Ingen sikkerhetsøyne med '
    'plastdeler her, siden rangelen skal være helt uten harde eller løse deler utenom '
    'rangleboksen, som er trygt gjemt inni.',
    'Embroider two round eyes in black satin stitch and a small nose below. No plastic safety '
    'eyes here, since the rattle must be entirely free of hard or loose parts apart from the '
    'rattle capsule, which is safely hidden inside.')

# ---------------------------------------------------------------- SIDE 10: MONTERING
add('banner_montering', 'MONTERING, STEG FOR STEG', 'ASSEMBLY, STEP BY STEP')
add('montering_steg', [
    'Hekle hodet, la det stå åpent til rangleboksen er klar.',
    'Fyll hodet jevnt, legg inn rangleboksen midt inni, godt omgitt av fyll på alle sider, og '
    'lukk de siste omgangene.',
    'Hekle halsen, legg treringen inni, og sy tuben godt rundt hele ringen.',
    'Hekle volangkragen rundt halsens øverste kant, før du syr hodet fast.',
    'Sy hodet fast oppå halsen, midt over ringen og kragen.',
    'Sy ørene fast øverst på hodet, og sløyfen mellom dem.',
    'Brodér ansiktet.',
    'Fest alle løse tråder godt på innsiden, og klipp av det som er igjen.',
    'Rist rangelen forsiktig og lytt: lyden skal komme jevnt og tydelig, uten at noe skrangler '
    'løst.',
])
add('montering_steg_en', [
    'Crochet the head, leave it open until the rattle capsule is ready.',
    'Stuff the head evenly, place the rattle capsule in the middle, well surrounded by stuffing '
    'on all sides, and close the last rounds.',
    'Crochet the neck, place the wooden ring inside, and sew the tube securely around the whole '
    'ring.',
    'Crochet the ruffled collar around the top edge of the neck, before sewing the head on.',
    'Sew the head onto the neck, centred over the ring and the collar.',
    'Sew the ears onto the top of the head, and the bow between them.',
    'Embroider the face.',
    'Fasten every loose end securely on the inside, and trim what is left.',
    'Gently shake the rattle and listen: the sound should come through evenly and clearly, with '
    'nothing rattling loose.',
])

# ---------------------------------------------------------------- SIDE 11: FOTOVEILEDNING
add('banner_foto', 'FOTOVEILEDNING', 'PHOTO GUIDE')
add('foto_lead',
    'Sett inn egne bilder av hvert steg her når du har heklet rangelen selv.',
    'Add your own photos of each step here once you have crocheted the rattle yourself.')
add('foto_captions',
    ['Hodet før lukking', 'Rangleboksen på plass', 'Halsen rundt ringen', 'Ferdig montert rangle'],
    ['The head before closing', 'The rattle capsule in place', 'The neck around the ring',
     'The fully assembled rattle'])

# ---------------------------------------------------------------- SIDE 12: SIKKERHET
add('banner_sikkerhet', 'SIKKERHET', 'SAFETY')
add('pill_rangleboks', 'RANGLEBOKSEN MÅ ALDRI KUNNE TAS UT', 'THE RATTLE CAPSULE MUST NEVER COME OUT')
add('rangleboks_txt',
    'Rangleboksen er den eneste harde delen i denne rangelen, og den skal være fullstendig '
    'omsluttet av garn og fyll, uten noen åpning. Sjekk grundig at det ikke finnes hull eller '
    'svake sømmer den kan falle ut gjennom, verken nyheklet eller etter vask og bruk over tid.',
    'The rattle capsule is the only hard part in this rattle, and it must be fully enclosed by '
    'yarn and stuffing, with no opening. Check thoroughly that there are no gaps or weak seams it '
    'could fall out through, either when newly made or after washing and use over time.')
add('pill_regler', 'FLERE VIKTIGE REGLER', 'MORE IMPORTANT RULES')
add('regler',
    ['Brukes alltid under tilsyn av en voksen, spesielt de første gangene, til du er trygg på at '
     'alle sømmer holder.',
     'Ingen deler limes. Alt sys fast med sterk, tvinnet bomullstråd og mange, tette sting.',
     'Bruk kun en trering og rangleboks som er umalt/CE-merket og beregnet for barn, aldri '
     'gjenbrukte deler fra voksenprodukter.',
     'Sjekk rangelen jevnlig for slitasje: løse tråder, myke eller ujevne partier, eller en '
     'rangleboks som kjennes løs. Kast rangelen umiddelbart hvis noe er galt.',
     'Denne oppskriften er en veiledning for hjemmebruk. Skal det ferdige produktet selges, må '
     'det alltid kontrolleres, testes og eventuelt merkes i henhold til gjeldende lokale '
     'sikkerhetskrav og regelverk for barneprodukter/leketøy.'],
    ['Always use under adult supervision, especially the first few times, until you are '
     'confident every seam holds.',
     'No parts are glued. Everything is sewn on with strong, twisted cotton thread and plenty '
     'of tight stitches.',
     'Use only a wooden ring and rattle capsule that are unpainted/CE-marked and intended for '
     'children, never reused parts from adult products.',
     'Check the rattle regularly for wear: loose threads, soft or uneven patches, or a rattle '
     'capsule that feels loose. Discard the rattle immediately if anything is wrong.',
     'This pattern is a guide for home use. If the finished product is sold, it must always be '
     'checked, tested and marked as required under current local safety requirements and '
     'regulations for children\'s products/toys.'])

# ---------------------------------------------------------------- SIDE 13: STELL
add('banner_stell', 'STELL OG VASK', 'CARE AND WASHING')
add('stell_txt',
    'Håndvask i lunkent vann med litt mild såpe. Skyll godt. Klem forsiktig ut vannet i et '
    'håndkle, ikke vri. Legg til tørk flatt, og sjekk at rangleboksen ikke har tatt inn vann '
    'før rangelen tas i bruk igjen.',
    'Hand wash in lukewarm water with a little mild soap. Rinse well. Gently press out the '
    'water in a towel, do not wring. Lay flat to dry, and check that the rattle capsule has not '
    'taken on water before using the rattle again.')
add('pill_qr', 'VIDEOVEILEDNING', 'VIDEO GUIDE')
add('qr_caption', 'QR-kode til videoveiledning (legges til)', 'QR code to video guide (to be added)')

# ---------------------------------------------------------------- SIDE 14: FERDIG
add('banner_ferdig', 'GRATULERER, RANGELEN ER FERDIG!', 'CONGRATULATIONS, THE RATTLE IS DONE!')
add('ferdig_txt',
    'Nå har du heklet en liten Ellie-rangle. Rist den forsiktig og hør den myke lyden!',
    'Now you have crocheted a little Ellie rattle. Give it a gentle shake and listen to the '
    'soft sound!')
add('pill_kolleksjon', 'RESTEN AV LME BABY COLLECTION', 'THE REST OF THE LME BABY COLLECTION')
add('kolleksjon_liste',
    ['Ellie, det lille dådyret', 'Ellies smokkelenke', 'Ellies aktivitetsleke', 'Ellies vognlenke',
     'Ellies ballerinasko med sløyfe'],
    ['Ellie, the little fawn', "Ellie's pacifier clip", "Ellie's activity toy",
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
<div class="coverimg"><img src="{ref_src}" alt="Ellies rangle, stiluttrykk-referanse"></div>
<p class="small center" style="margin-top:-2mm;">{'Bildet viser stiluttrykk-referansen for rangelen, ikke det ferdige heklede produktet.' if lang == 'no' else 'Photo shows the style reference for the rattle, not the finished crocheted product.'}</p>
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
{rosep(t('pill_funksjon'))}
{cme(t('om_funksjon'))}
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
{sagep('MÅL' if lang == 'no' else 'SIZE')}
{cme(t('mal_txt'))}
''', 6))

    hode_rows = T['hode_rows']['no'] if lang == 'no' else T['hode_rows_en']['no']
    pages.append(pg(f'''
{banner(t('banner_hode'))}
<p>{t('hode_lead')}</p>
{card(otab(hode_rows, head3[lang]))}
{cme(t('hode_ferdig'))}
''', 7))

    hals_rows = T['hals_rows']['no'] if lang == 'no' else T['hals_rows_en']['no']
    pages.append(pg(f'''
{banner(t('banner_hals'))}
<p>{t('hals_lead')}</p>
{card(otab(hals_rows, head3[lang]))}
{cme(t('hals_ferdig'))}
{sagep(t('pill_krage'))}
{card('<p>' + t('krage_txt') + '</p>')}
{rosep(t('pill_montering_hode'))}
{card('<p>' + t('montering_hode_txt') + '</p>')}
''', 8))

    pages.append(pg(f'''
{banner(t('banner_orer'))}
{rosep(t('pill_orer'))}
{card('<p>' + t('orer_txt') + '</p>')}
{sagep(t('pill_horn'))}
{card('<p>' + t('horn_txt') + '</p>')}
{rosep(t('pill_ansikt'))}
{cme(t('ansikt_txt'))}
''', 9))

    mo_steg = T['montering_steg']['no'] if lang == 'no' else T['montering_steg_en']['no']
    pages.append(pg(f'''
{banner(t('banner_montering'))}
{card(steps(mo_steg))}
''', 10))

    foto_caps = T['foto_captions']['no'] if lang == 'no' else T['foto_captions']['en']
    pages.append(pg(f'''
{banner(t('banner_foto'))}
{card('<p class="center">' + t('foto_lead') + '</p>')}
{photo_row(foto_caps)}
''', 11))

    regler = T['regler']['no'] if lang == 'no' else T['regler']['en']
    pages.append(pg(f'''
{banner(t('banner_sikkerhet'))}
{rosep(t('pill_rangleboks'))}
{card('<p>' + t('rangleboks_txt') + '</p>')}
{sagep(t('pill_regler'))}
{card(ul(regler))}
''', 12))

    pages.append(pg(f'''
{banner(t('banner_stell'))}
{cme(t('stell_txt'))}
{rosep(t('pill_qr'))}
{qr_placeholder(t('qr_caption'))}
''', 13))

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
''', 14))

    return pages

for lang in ('no', 'en'):
    html_doc = kit.doc(lang, T['doctitle'][lang], None, build(lang))
    out = BASE / f'rangle_{lang}.html'
    out.write_text(html_doc, encoding='utf-8')
    print('OK', lang, len(html_doc), 'tegn/chars')
