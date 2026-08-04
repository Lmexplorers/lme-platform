# -*- coding: utf-8 -*-
"""Genererer LME-strikkeoppskrift 'Woodland Dreams Kort Vest' (norsk + engelsk)
som HTML, klar for PDF-print med Chromium. Tredje del av strikkekolleksjonen
LME Woodland Dreams (basisbody + 6 tilbehørsdeler + Woodland Fluffy Skirt).

Helt original LME-konstruksjon: strikkes flatt fra hals til legg (fronten er
åpen hele veien, aldri i rundt), skulderlinje-øking i to linjer (ikke fire
raglanlinjer, siden vesten ikke har ermer), deling til tre deler (front-
venstre, bak, front-høyre) med et lite ermehull avfelt på hver side,
matstrikk-kant i hals/legg/ermehull, knappekant med treknapper foran.
Fasthet 22 m = 10 cm / 30 o = 10 cm på 4 mm pinne, Sandnes Garn Alpakka,
samme som basisbodyen. Graderingstallene er beregnet og verifisert i
grading.py (se sizes_vest.json), ikke frihåndstall.
"""
import pathlib, sys, json

BASE = pathlib.Path(__file__).parent
sys.path.insert(0, str(BASE.parent.parent / 'hekle' / '_shared'))
import lme_pattern_kit as kit
from lme_pattern_kit import (banner, rosep, sagep, card, cream, cme, ul, steps, abbrtab)

SIZES = json.loads(BASE.joinpath('sizes_vest.json').read_text(encoding='utf-8'))

# Lette sanity-sjekk ved lasting, i tillegg til de fulle sjekkene i grading.py
assert len(SIZES) == 7
for i in range(len(SIZES) - 1):
    assert SIZES[i]['total_sts_hem'] < SIZES[i + 1]['total_sts_hem']
    assert SIZES[i]['vest_length_cm'] < SIZES[i + 1]['vest_length_cm']
    assert SIZES[i]['rows_total'] < SIZES[i + 1]['rows_total']
for s in SIZES:
    assert s['front_each'] * 2 + s['back_sts'] == s['total_sts_hem']
    assert s['neck_co'] == 2 * s['front_each_co'] + s['back_neck_co']

T = {}
def add(key, no, en=None):
    T[key] = {'no': no, 'en': en if en is not None else no}

# ---------------------------------------------------------------- SIDE 1: FORSIDE
add('doctitle', 'Woodland Dreams Kort Vest, LME strikkeoppskrift', 'Woodland Dreams Short Vest, LME knitting pattern')
add('ph2', 'LME STRIKKEOPPSKRIFT&nbsp;&nbsp;|&nbsp;&nbsp;WOODLAND DREAMS KORT VEST',
    'LME KNITTING PATTERN&nbsp;&nbsp;|&nbsp;&nbsp;WOODLAND DREAMS SHORT VEST')
add('covertag', 'LME STRIKKEOPPSKRIFT - BABY', 'LME KNITTING PATTERN - BABY')
add('covertitle', 'WOODLAND DREAMS KORT VEST', 'WOODLAND DREAMS SHORT VEST')
add('subpill', 'LME BABY COLLECTION - WOODLAND DREAMS', 'LME BABY COLLECTION - WOODLAND DREAMS')
add('cover_desc',
    'En kort, åpen vest med treknapper foran, strikket for å tas utenpå Woodland Dreams-'
    'basisbodyen. Flatt fra hals til legg, ingen ermer, enkel skulderlinje-øking og en '
    'matstrikk-kant rundt hals, legg og ermehull. Syv størrelser, fra 0-1 til 18-24 måneder. '
    'Vesten er tilbehør, og strikkes i en av kolleksjonens fargerike toner: salviegrønn, '
    'gammelrosa, smørgul, dueblå, oliven eller terrakotta, som en fin kontrast til bodyens '
    'rolige nøytrale farger.',
    'A short, open-front vest with wooden buttons, knitted to be worn over the Woodland Dreams '
    'basisbody. Worked flat from neck to hem, no sleeves, simple shoulder-line shaping and a '
    'garter stitch border around the neck, hem and armholes. Seven sizes, from 0-1 to 18-24 '
    "months. The vest is an accessory piece, and is knitted in one of the collection's colourful "
    'shades: sage green, dusty rose, butter yellow, soft blue, olive or terracotta, as a lovely '
    "contrast to the body's calm neutral colours.")
add('by1', 'Av Renate Dahl', 'By Renate Dahl')
add('by2', 'Little Montessori Explorers', 'Little Montessori Explorers')
add('by3', 'lmexplorers.com', 'lmexplorers.com')
add('cover_tip',
    'TIPS: Les hele oppskriften og størrelsestabellen på side 4 før du starter, og strikk en '
    'prøvelapp på 15 x 15 cm for å sjekke strikkefastheten din, før du legger opp til selve '
    'vesten. Denne vesten strikkes flatt hele veien, aldri i rundt, siden fronten skal være '
    'åpen fra hals til legg.',
    'TIP: Read through the whole pattern and the size chart on page 4 before you start, and knit '
    'a 15 x 15 cm gauge swatch to check your tension, before casting on the vest itself. This '
    'vest is worked flat throughout, never in the round, since the front stays open from neck to '
    'hem.')

# ---------------------------------------------------------------- SIDE 2: OM
add('banner_om', 'OM WOODLAND DREAMS KORT VEST', 'ABOUT THE WOODLAND DREAMS SHORT VEST')
add('pill_kolleksjon0', 'DEL AV KOLLEKSJONEN', 'PART OF THE COLLECTION')
add('om_kolleksjon0',
    'Kort vest er en av seks tilbehørsdeler i LME Woodland Dreams, strikket for å tas utenpå '
    'basisbodyen. Der bodyen er det stillferdige, nøytrale grunnlaget, er vesten det fargerike '
    'laget som løftes utenpå, en enkel, åpen vest uten ermer, lett å ta av og på, og fin å '
    'kombinere med kolleksjonens andre deler.',
    'The short vest is one of six accessory pieces in LME Woodland Dreams, knitted to be worn '
    "over the basisbody. Where the body is the quiet, neutral foundation, the vest is the "
    'colourful layer lifted on top, a simple, open, sleeveless vest, easy to put on and take off, '
    "and lovely to combine with the collection's other pieces.")
add('pill_stil', 'STIL', 'STYLE')
add('om_stil',
    'Rette linjer, en synlig knappekant foran og en enkel matstrikk-kant rundt hals, legg og '
    'ermehull. Ingen ermer, ingen kompliserte detaljer, bare en liten, godt sittende vest som gir '
    'et ekstra fargeklatt utenpå bodyens rolige toner.',
    'Clean lines, a visible button band down the front and a simple garter stitch border around '
    'the neck, hem and armholes. No sleeves, no complicated details, just a small, well-fitting '
    "vest that adds an extra splash of colour over the body's calm tones.")
add('pill_passform', 'ROMSLIG PASSFORM, MENT FOR UTENPÅ', 'A ROOMY FIT, MEANT TO GO OVER')
add('om_passform',
    'Vesten er strikket med litt ekstra vidde utover bodyens egen brystvidde, slik at den ligger '
    'fint utenpå uten å klemme. Den er tydelig kortere enn bodyen selv, den skal stoppe godt over '
    'skrittet, ikke dekke hele kroppen, se størrelsestabellen for nøyaktige mål og forholdet til '
    'bodyens egen lengde.',
    "The vest is knitted with a little extra width beyond the body's own chest measurement, so it "
    'sits nicely on top without pulling tight. It is clearly shorter than the body itself, meant '
    'to stop well above the crotch, not cover the whole body, see the size chart for exact '
    "measurements and the ratio to the body's own length.")

# ---------------------------------------------------------------- SIDE 3: MATERIALER
add('banner_mat', 'MATERIALER', 'MATERIALS')
add('pill_garn', 'GARN', 'YARN')
add('garn_txt',
    'Sandnes Garn Alpakka (100 % alpakka), eller et tilsvarende garn med samme fasthet. Vesten er '
    'et tilbehør, så velg en av kolleksjonens fargerike toner: salviegrønn, gammelrosa, smørgul, '
    'dueblå, oliven eller terrakotta, en fin kontrast til bodyens nøytrale krem, lin, sand, havre '
    'eller beige.',
    'Sandnes Garn Alpakka (100% alpaca), or an equivalent yarn with the same gauge. The vest is an '
    "accessory piece, so choose one of the collection's colourful shades: sage green, dusty rose, "
    "butter yellow, soft blue, olive or terracotta, a lovely contrast to the body's neutral cream, "
    'linen, sand, oatmeal or beige.')
GARNFORBRUK = [
    ('0-1 mnd', '40-45 g'), ('1-3 mnd', '45-50 g'), ('3-6 mnd', '50-60 g'),
    ('6-9 mnd', '60-70 g'), ('9-12 mnd', '70-80 g'), ('12-18 mnd', '80-90 g'),
    ('18-24 mnd', '90-100 g'),
]
add('pill_forbruk', 'GARNFORBRUK', 'YARN REQUIREMENTS')
add('pill_pinner', 'PINNER OG TILBEHØR', 'NEEDLES AND NOTIONS')
add('pinner_txt',
    'Rundpinne 4 mm (40 cm er nok, siden vesten strikkes flatt, ikke rundt). 3-4 små, runde '
    'treknapper (se antall for din størrelse i tabellen på neste side). Maskemarkører (minst 2, '
    'til de to skulderlinjene), synål, og en heklenål 3 mm til å hekle løkker for knapphullene, '
    'eller en synål til sydde knapphull.',
    'Circular needle 4 mm (40 cm is enough, since the vest is worked flat, not in the round). 3-4 '
    'small round wooden buttons (see the number for your size in the table on the next page). '
    'Stitch markers (at least 2, for the two shoulder lines), a tapestry needle, and a 3 mm '
    'crochet hook for crocheting the buttonhole loops, or a sewing needle for worked buttonholes.')

# ---------------------------------------------------------------- SIDE 4: STØRRELSESTABELL
add('banner_storrelse', 'STØRRELSESTABELL', 'SIZE CHART')
add('storrelse_lead',
    'Ferdige mål, målt flatt liggende. Vesten er beregnet til å gå utenpå Woodland Dreams-'
    'basisbodyen, se kolonnen til høyre for hvor mye kortere vesten er enn bodyen i samme '
    'størrelse.',
    "Finished measurements, measured lying flat. The vest is designed to be worn over the "
    'Woodland Dreams basisbody, see the column on the right for how much shorter the vest is '
    'than the body in the same size.')
storrelse_head = {'no': ['Størrelse', 'Brystvidde (vest)', 'Halsåpning', 'Lengde (vest)', 'Lengde (body)'],
                   'en': ['Size', 'Chest width (vest)', 'Neck opening', 'Length (vest)', 'Length (body)']}
add('storrelse_head', storrelse_head['no'], storrelse_head['en'])
storrelse_rows = []
for s in SIZES:
    storrelse_rows.append((s['no'], f"{s['vest_chest_finished_cm']} cm", f"{s['vest_neck_cm']} cm",
                            f"{s['vest_length_cm']} cm", f"{s['body_length_cm']} cm"))
add('storrelse_rows_data', storrelse_rows)
add('storrelse_note',
    'Brystvidden er ferdig omkrets når vesten er knappet igjen foran, altså inkludert den ekstra '
    'vidden (3 cm mer enn bodyens egen brystvidde) som gjør at vesten går fint utenpå bodyen og '
    'et tynt lag under. Lengden er regnet som ca. 55 % av bodyens egen hals-til-skritt-lengde i '
    'samme størrelse, tydelig kortere, som en "kort vest" skal være.',
    'The chest width is the finished circumference when the vest is buttoned closed at the front, '
    "i.e. including the extra width (3 cm more than the body's own chest measurement) that lets "
    'the vest sit nicely over the body and a thin layer underneath. The length is calculated as '
    "roughly 55% of the body's own neck-to-crotch length in the same size, clearly shorter, as a "
    '"short vest" should be.')

# ---------------------------------------------------------------- SIDE 5: FASTHET
add('banner_fasthet', 'STRIKKEFASTHET OG VANSKELIGHETSGRAD', 'GAUGE AND DIFFICULTY LEVEL')
add('pill_fasthet', 'FASTHET', 'GAUGE')
add('fasthet_txt',
    '22 masker og 30 omganger glattstrikk = 10 x 10 cm, på pinne 4 mm, samme fasthet som '
    'basisbodyen. Denne fastheten er brukt i alle beregninger i oppskriften. Strikk alltid en '
    'prøvelapp først: legg opp 26 masker, strikk glattstrikk i ca. 12 cm, fell av og press lett. '
    'Stemmer ikke fastheten din, bytt til tynnere eller tykkere pinne til den stemmer, ikke bare '
    'til garnet.',
    '22 stitches and 30 rows in stockinette stitch = 10 x 10 cm, on 4 mm needles, the same gauge '
    'as the basisbody. This gauge is used in every calculation in the pattern. Always knit a '
    'swatch first: cast on 26 stitches, work stockinette stitch for approx. 12 cm, bind off and '
    'block lightly. If your gauge does not match, change to a smaller or larger needle until it '
    'does, not just to match the yarn.')
add('pill_vanskelig', 'VANSKELIGHETSGRAD', 'DIFFICULTY LEVEL')
add('vanskelig_txt',
    'Lett til middels, enklere enn basisbodyen. Vesten strikkes flatt hele veien, uten runde '
    'omganger, og uten raglanermer. Du bør beherske å øke og felle, plukke opp masker langs en '
    'kant, og strikke enkle knapphull.',
    'Easy to medium, simpler than the basisbody. The vest is worked flat throughout, with no '
    'rounds and no raglan sleeves. You should be comfortable increasing and decreasing, picking '
    'up stitches along an edge, and working simple buttonholes.')

# ---------------------------------------------------------------- SIDE 6: FORKORTELSER
add('banner_ord', 'FORKORTELSER', 'ABBREVIATIONS')
add('ord_lead',
    'Norske strikkeuttrykk med engelske termer ved siden av.',
    'Norwegian knitting terms with the English terms alongside.')
ord_head = {'no': ['Norsk', 'Engelsk', 'Betyr'], 'en': ['Norwegian', 'English', 'Meaning']}
add('ord_head', ord_head['no'], ord_head['en'])
ord_rows = [
    ('r', 'K', 'rett'),
    ('vr', 'P', 'vrangbord/vrang'),
    ('m', 'st(s)', 'maske(r)'),
    ('rad', 'row', 'rad'),
    ('øk', 'inc', 'øk (ta opp én tilleggsmaske)'),
    ('felle', 'dec', 'felle (strikk to masker sammen)'),
    ('fell av', 'BO', 'fell av / bind off'),
    ('legg opp', 'CO', 'legg opp masker'),
    ('ta opp m', 'pick up sts', 'ta opp masker langs en kant'),
    ('matstrikk', 'garter st', 'strikk rett på alle rader, begge sider'),
    ('glattstrikk', 'St st', 'rett på retten, vrang på vrangen'),
    ('RS/VS', 'RS/WS', 'rettside/vrangside'),
    ('rundpinne', 'circular needle', 'rundpinne (brukes flatt her)'),
    ('maskemarkør', 'st marker', 'maskemarkør'),
    ('knapphull', 'buttonhole', 'knapphull'),
]
add('ord_rows', ord_rows)
add('pill_tips', 'TIPS', 'TIPS')
tips_no = [
    'Vesten strikkes flatt hele veien, aldri i rundt. Snu arbeidet ved slutten av hver rad, '
    'akkurat som du er vant til fra vanlig flatstrikking.',
    'Bruk to maskemarkører til de to skulderlinjene, det gjør det mye enklere å holde styr på '
    'hvor økingene skal skje.',
    'Tell maskene dine ved hvert kontrollpunkt i tabellene. Det er lettere å rette en feil på '
    '10 rader enn på 40.',
]
tips_en = [
    'The vest is worked flat throughout, never in the round. Turn your work at the end of every '
    'row, exactly as you are used to from ordinary flat knitting.',
    'Use two stitch markers for the two shoulder lines, it makes it much easier to keep track of '
    'where the increases should happen.',
    'Count your stitches at every checkpoint in the tables. It is easier to fix a mistake 10 rows '
    'back than 40.',
]
add('tips', tips_no, tips_en)

# ---------------------------------------------------------------- SIDE 7: KONSTRUKSJONSOVERSIKT
add('banner_oversikt', 'SLIK ER VESTEN BYGD OPP', 'HOW THE VEST IS CONSTRUCTED')
add('oversikt_lead',
    'Vesten strikkes ovenfra og ned, flatt i ett stykke, uten ermer. Fem enkle deler, i denne '
    'rekkefølgen:',
    'The vest is knitted top-down, flat in one piece, with no sleeves. Five simple parts, in this '
    'order:')
oversikt_deler = [
    ('1. Halskant', 'Legg opp flatt i halsen, strikk noen rader matstrikk.',
     '1. The neck edge', 'Cast on flat at the neck, work a few rows of garter stitch.'),
    ('2. Skulderlinje-øking', 'Øk jevnt langs to skulderlinjer (front-bak og bak-front) til '
     'bæremålet er nådd.', '2. Shoulder-line shaping', 'Increase evenly along two shoulder lines '
     '(front-back and back-front) until the yoke width is reached.'),
    ('3. Del til ermehull', 'Fell av noen få masker på hver side for ermehullene, del i '
     'front-venstre, bak og front-høyre.', '3. Divide for the armholes', 'Bind off a few stitches '
     'on each side for the armholes, dividing into front-left, back and front-right.'),
    ('4. Ned til legg', 'Strikk hver av de tre delene rett ned, avslutt alle med matstrikk i '
     'leggkanten.', '4. Down to the hem', 'Knit each of the three panels straight down, finishing '
     'all with garter stitch at the hem.'),
    ('5. Knappekant', 'Strikk/ta opp en matstrikk-kant langs begge fronter, med knapphull på den '
     'ene siden.', '5. The button band', 'Work/pick up a garter stitch band along both front '
     'edges, with buttonholes on one side.'),
]
add('oversikt_deler_data', oversikt_deler)

# ---------------------------------------------------------------- SIDE 8: HALSKANT
add('banner_hals', 'DEL 1: HALSKANT', 'PART 1: THE NECK EDGE')
add('hals_lead',
    'Vesten legges opp i halsen og strikkes flatt ovenfra og ned, hele veien, siden fronten skal '
    'være åpen fra hals til legg. Strikk halskanten i matstrikk før du bytter til glattstrikk og '
    'begynner skulderøkingen.',
    'The vest is cast on at the neck and knitted flat, top-down, the whole way, since the front '
    'stays open from neck to hem. Work the first few rows in garter stitch before switching to '
    'stockinette stitch and starting the shoulder shaping.')
add('hals_txt',
    'Legg opp {neck_co} masker flatt på rundpinne 4 mm (du strikker fram og tilbake, ikke rundt, '
    'gjennom hele vesten). Strikk {neck_border_rows} rader matstrikk (rett på alle rader). På den '
    'siste matstrikk-raden setter du en maskemarkør etter maske {mk1} (dette er skillet mellom '
    'front-venstre og bak), og en til maskemarkør etter maske {mk2} (skillet mellom bak og '
    'front-høyre).',
    'Cast on {neck_co} stitches flat on a 4 mm circular needle (you work back and forth, not in '
    'the round, throughout the whole vest). Work {neck_border_rows} rows of garter stitch (knit '
    'every row). On the last garter row, place a stitch marker after stitch {mk1} (the boundary '
    'between front-left and back), and another stitch marker after stitch {mk2} (the boundary '
    'between back and front-right).')
add('hals_note',
    'Nøyaktig masketall for din størrelse finner du i graderingstabellen på neste side.',
    'The exact stitch count for your size is in the grading table on the next page.')

# ---------------------------------------------------------------- SIDE 9: SKULDERLINJE-ØKING
add('banner_skulder', 'DEL 2: SKULDERLINJE-ØKING', 'PART 2: SHOULDER-LINE SHAPING')
add('skulder_lead',
    'Bytt til glattstrikk. Nå økes det jevnt langs de to skulderlinjene, til bæremålet er nådd. '
    'Vesten har ingen ermer, så det er bare to skulderlinjer å øke langs, ikke fire raglanlinjer '
    'som på basisbodyen. Konstruksjonen er lik for alle størrelser, det er bare tallene som '
    'endrer seg, se graderingstabellen under.',
    'Switch to stockinette stitch. Now increase evenly along the two shoulder lines, until the '
    'yoke width is reached. The vest has no sleeves, so there are only two shoulder lines to '
    'increase along, not four raglan lines like on the basisbody. The construction is the same '
    'for every size, only the numbers change, see the grading table below.')
add('skulder_metode',
    'Økerad (hver 2. rad, alltid på rettsiden): øk 2 masker rett før og 2 masker rett etter hver '
    'av de to skuldermarkørene (8 masker økt totalt pr økerad, fordi det bare er to linjer i '
    'stedet for fire, må hver linje øke litt raskere for å nå samme bæremål på like mange rader). '
    'Strikk vanlig glattstrikk, uten øking, på raden mellom. Front-venstre øker altså bare langs '
    'sin ene, indre kant (fronten holder seg rett langs selve knappekanten), mens bak øker langs '
    'begge sine kanter.',
    'Increase row (every 2nd row, always on the right side): increase 2 stitches right before and '
    '2 stitches right after each of the two shoulder markers (8 stitches increased in total per '
    'increase row, because with only two lines instead of four, each line needs to increase a '
    'little faster to reach the same yoke width in the same number of rows). Knit plain '
    'stockinette, with no increases, on the row in between. Front-left therefore only increases '
    'along its one inner edge (the front stays straight along the button band edge itself), while '
    'the back increases along both of its edges.')
skulder_head = {'no': ['Størrelse', 'Legg opp i hals', 'Antall økerader', 'Rader til bæremål', 'Masker ved bæremål'],
                 'en': ['Size', 'Neck cast-on', 'Increase rows', 'Rows to yoke depth', 'Sts at yoke depth']}
add('skulder_head', skulder_head['no'], skulder_head['en'])
skulder_rows = []
for s in SIZES:
    skulder_rows.append((s['no'], str(s['neck_co']), str(s['inc_rows']),
                          str(s['yoke_rows_total']), str(s['target_underarm'])))
add('skulder_rows_data', skulder_rows)
add('skulder_ferdig',
    'Kontroll: tell maskene dine. De skal stemme med tallet i kolonnen "Masker ved bæremål" for '
    'din størrelse ("Rader til bæremål" inkluderer de {nb} radene matstrikk i halskanten fra del '
    '1). Stemmer det ikke, tell på nytt før du går videre til del 3.'.format(
        nb=SIZES[0]['neck_border_rows']),
    'Check: count your stitches. They should match the number in the "Sts at yoke depth" column '
    'for your size ("Rows to yoke depth" includes the {nb} rows of garter stitch at the neck from '
    'part 1). If it does not match, count again before moving on to part 3.'.format(
        nb=SIZES[0]['neck_border_rows']))

# ---------------------------------------------------------------- SIDE 10: DEL TIL ERMEHULL
add('banner_del', 'DEL 3: DEL TIL ERMEHULL', 'PART 3: DIVIDE FOR THE ARMHOLES')
add('del_lead',
    'Nå deles bæret i tre deler: front-venstre, bak og front-høyre, med et lite ermehull avfelt '
    'på hver side. Gjør dette likt for alle størrelser, følg din egen rad for masketallene, se '
    'tabellen på forrige side.',
    'Now the yoke is divided into three parts: front-left, back and front-right, with a small '
    'armhole bound off on each side. Do this the same way for every size, use your own row\'s '
    "stitch numbers from the table on the previous page.")
del_steps_no = [
    'Strikk over de {frontco} maskene til front-venstre (maskene fra kanten til venstre '
    'skuldermarkør).',
    'Fell av {armhole} masker for ermehullet (disse maskene tas rett over armhulen).',
    'Strikk over de {backco} maskene til bak (mellom de to skuldermarkørene, minus de nettopp '
    'avfelte maskene).',
    'Fell av {armhole} masker for det andre ermehullet.',
    'Strikk over de resterende maskene til front-høyre.',
    'Du har nå tre atskilte deler på pinnen: front-venstre og front-høyre med {front} masker '
    'hver, og bak med {back} masker. Fra nå av strikkes hver del for seg, flatt, med en egen '
    'nøste eller tråd garn, rett ned til leggen.',
]
del_steps_en = [
    'Knit across the {frontco} front-left stitches (the stitches from the edge to the left '
    'shoulder marker).',
    'Bind off {armhole} stitches for the armhole (these stitches sit right at the underarm).',
    'Knit across the {backco} back stitches (between the two shoulder markers, minus the '
    'stitches just bound off).',
    'Bind off {armhole} stitches for the second armhole.',
    'Knit across the remaining stitches for front-right.',
    'You now have three separate panels on the needle: front-left and front-right with {front} '
    'stitches each, and back with {back} stitches. From here on each panel is worked separately, '
    'flat, with its own ball or strand of yarn, straight down to the hem.',
]
add('del_steps', del_steps_no, del_steps_en)
add('del_note',
    'De {armhole_half} maskene som felles av på hver side, fordeles slik: halvparten regnes bort '
    'fra front-delen, halvparten fra bak-delen, akkurat der de møtes ved skuldermarkøren. Det er '
    'derfor front-venstre/front-høyre går fra {rf} masker (ved bæremålet) ned til {front} masker '
    '(etter delingen), og bak går fra {bf} masker ned til {back} masker, se '
    'graderingstabellen på neste side for din egen størrelse.',
    'The stitches bound off on each side are split evenly: half are counted from the front panel, '
    'half from the back panel, right where they meet at the shoulder marker. This is why front-'
    'left/front-right goes from {rf} stitches (at yoke depth) down to {front} stitches (after '
    'dividing), and back goes from {bf} stitches down to {back} stitches, see the grading table '
    'on the next page for your own size.')

# ---------------------------------------------------------------- SIDE 11: DELENE NED TIL LEGGEN
add('banner_kropp', 'DEL 4: DELENE NED TIL LEGGEN', 'PART 4: THE PANELS DOWN TO THE HEM')
add('kropp_lead',
    'Strikk glattstrikk rett ned på hver av de tre delene, uten øking eller felling, til vesten '
    'har ønsket lengde. Se tabellen under for hvor mange rader som skal strikkes for din '
    'størrelse.',
    'Knit stockinette stitch straight down on each of the three panels, with no increasing or '
    "decreasing, until the vest reaches the desired length. See the table below for how many "
    'rows to work for your size.')
kropp_head = {'no': ['Størrelse', 'Rader glattstrikk', 'Rader matstrikk i legg', 'Ferdig lengde'],
               'en': ['Size', 'Rows stockinette', 'Rows garter at hem', 'Finished length']}
add('kropp_head', kropp_head['no'], kropp_head['en'])
kropp_rows = []
for s in SIZES:
    kropp_rows.append((s['no'], str(s['panel_plain_rows']), str(s['hem_border_rows']),
                        f"{s['vest_length_cm']} cm"))
add('kropp_rows_data', kropp_rows)
add('kropp_ferdig',
    'Bytt til matstrikk (rett på alle rader) og strikk {hem} rader. Fell av alle masker løst. '
    'Gjenta likt for de to andre delene. Alle tre deler skal ha nøyaktig samme antall rader, slik '
    'at leggen blir jevn hele veien rundt når delene monteres sammen.',
    'Switch to garter stitch (knit every row) and work {hem} rows. Bind off all stitches loosely. '
    'Repeat the same way for the other two panels. All three panels should have exactly the same '
    'number of rows, so the hem is even all the way around once the panels are sewn together.')

# ---------------------------------------------------------------- SIDE 12: KNAPPEKANT
add('banner_knapp', 'DEL 5: KNAPPEKANT OG KNAPPHULL', 'PART 5: THE BUTTON BAND AND BUTTONHOLES')
add('knapp_lead',
    'Til slutt lages en enkel matstrikk-kant langs begge de rette fremkantene, med knapphull '
    'på den ene siden.',
    'Finally, work a simple garter stitch band along both straight front edges, with buttonholes '
    'on one side.')
knapp_steps_no = [
    'Ta opp ca. {pickup} masker langs hele fremkanten, fra leggen og opp til halsen, med rettsiden '
    'ut. Bruk regelen "ta opp ca. 3 masker for hver 4 rader" som utgangspunkt, juster litt om '
    'kanten drar seg sammen eller bølger.',
    'Strikk matstrikk (rett på alle rader) i 4-5 rader.',
    'På knapphullssiden (høyre front for jenter, venstre front for gutter, eller den siden som '
    'passer best): på 2. raden lager du {buttons} knapphull, jevnt fordelt langs kanten (fell av '
    '2 masker for hvert knapphull, legg opp 2 nye masker over hullet på neste rad).',
    'Fell av alle masker løst i matstrikk. Gjenta på den andre fremkanten, uten knapphull.',
    'Sy på {buttons} treknapper på knappesiden, rett overfor hvert knapphull.',
]
knapp_steps_en = [
    'Pick up approx. {pickup} stitches along the whole front edge, from the hem up to the neck, '
    'with the right side facing you. Use the rule of thumb "pick up approx. 3 stitches for every '
    '4 rows" as a starting point, adjust slightly if the edge draws in or ripples.',
    'Work garter stitch (knit every row) for 4-5 rows.',
    'On the buttonhole side (right front for girls, left front for boys, or whichever side suits '
    'best): on row 2, work {buttons} buttonholes, evenly spaced along the edge (bind off 2 '
    'stitches for each buttonhole, cast on 2 new stitches over the gap on the next row).',
    'Bind off all stitches loosely in garter stitch. Repeat on the other front edge, with no '
    'buttonholes.',
    'Sew {buttons} wooden buttons onto the button side, directly opposite each buttonhole.',
]
add('knapp_steps', knapp_steps_no, knapp_steps_en)
add('knapp_note',
    'Antall knapper og hvor mange masker du tar opp langs fremkanten, øker med størrelsen, se '
    'tabellen på side 4 og masketallene i graderingstabellen på side 9 (samme radtall brukes til '
    'å beregne opptak langs fremkanten). Fordel knappene jevnt: første og siste knapp ca. 1,5 cm '
    'fra hals og legg, resten jevnt fordelt mellom.',
    'The number of buttons and how many stitches you pick up along the front edge increase with '
    'the size, see the table on page 4 and the stitch counts in the grading table on page 9 (the '
    'same row count is used to calculate the front edge pickup). Space the buttons evenly: the '
    'first and last button approx. 1.5 cm from the neck and hem, the rest evenly spaced between.')

# ---------------------------------------------------------------- SIDE 13: ERMEHULL-KANT
add('banner_erme', 'ERMEHULL-KANT', 'THE ARMHOLE EDGE')
add('erme_lead',
    'Ermehullet får samme enkle matstrikk-kant som resten av vesten, slik at det ikke ruller seg '
    'og passer fint rundt bodyens erme som går under.',
    "The armhole gets the same simple garter stitch border as the rest of the vest, so it doesn't "
    "curl and sits nicely around the body's own sleeve underneath.")
add('erme_txt',
    'Ta opp masker rundt hele ermehullet (langs den avfelte kanten nederst og langs de to rette '
    'sidene opp mot skulderen) med rettsiden ut, ca. {pickup} masker totalt for din størrelse '
    '(se tabellen under). Strikk 3-4 rader matstrikk. Fell av løst. Gjenta likt for det andre '
    'ermehullet.',
    'Pick up stitches all the way around the armhole (along the bound-off edge at the bottom and '
    'the two straight sides up towards the shoulder) with the right side facing you, approx. '
    '{pickup} stitches in total for your size (see the table below). Work 3-4 rows of garter '
    'stitch. Bind off loosely. Repeat the same way for the other armhole.')
erme_head = {'no': ['Størrelse', 'Avfelte m. i ermehull', 'Ta opp ca. (rundt hele)', 'Bodyens ermeomkrets'],
              'en': ['Size', 'Sts bound off at armhole', 'Pick up approx. (all around)', "Body's own sleeve circumf."]}
add('erme_head', erme_head['no'], erme_head['en'])
erme_rows = []
for s in SIZES:
    body_sleeve_cm = round(s['sleeve_after_divide'] / (22 / 10), 1)
    erme_rows.append((s['no'], str(s['armhole_sts']), str(s['armhole_pickup_sts']),
                       f"{body_sleeve_cm} cm"))
add('erme_rows_data', erme_rows)
add('erme_note',
    'De avfelte maskene i ermehullet utgjør 57-64 % av bodyens egen ermeomkrets på det samme '
    'stedet (se tabellen), akkurat nok til at bodyens erme går fint gjennom sammen med bæret over, '
    'uten at ermehullet blir unødvendig stort. Ermehullet er en åpning, ikke et rør, så det '
    'trenger ikke romme hele ermeomkretsen.',
    "The stitches bound off at the armhole make up 57-64% of the body's own sleeve circumference "
    'at the same point (see the table), just enough for the body\'s sleeve to fit through '
    'comfortably along with the yoke above, without the armhole being unnecessarily large. The '
    'armhole is an opening, not a tube, so it does not need to fit the whole sleeve circumference.')

# ---------------------------------------------------------------- SIDE 14: MONTERING
add('banner_montering', 'MONTERING', 'FINISHING')
montering_no = [
    'Sy sammen de to skulderkantene: legg front-venstre og bak, og front-høyre og bak, med '
    'rettsidene mot hverandre, og sy en tett søm langs skulderlinjen (der skuldermarkørene satt '
    'under del 2).',
    'Ta opp og strikk matstrikk-kanten rundt begge ermehullene, se forrige side.',
    'Ta opp og strikk knappekanten med knapphull langs den ene fremkanten, og en ren matstrikk-'
    'kant uten hull langs den andre, se del 5.',
    'Sy på knappene rett overfor knapphullene.',
    'Fest alle løse tråder godt på vrangen, og klipp dem korte.',
    'Damp press vesten lett på vrangen, unngå å presse direkte på matstrikk-kantene, de skal '
    'beholde sin fine, ikke-rullende struktur.',
    'Kontroller til slutt at alle knapper sitter godt fast, og at ingen løse tråder eller masker '
    'kan løsne.',
]
montering_en = [
    'Sew the two shoulder seams: place front-left and back, and front-right and back, right sides '
    'together, and sew a neat seam along the shoulder line (where the shoulder markers sat during '
    'part 2).',
    'Pick up and work the garter stitch border around both armholes, see the previous page.',
    'Pick up and work the button band with buttonholes along one front edge, and a plain garter '
    'band with no holes along the other, see part 5.',
    'Sew the buttons on directly opposite the buttonholes.',
    'Weave in all loose ends securely on the wrong side, and trim them short.',
    'Lightly steam-block the vest on the wrong side, avoid pressing directly on the garter stitch '
    'borders, they should keep their neat, non-curling structure.',
    'Finally, check that every button is securely attached, and that no loose threads or stitches '
    'can come undone.',
]
add('montering_steg', montering_no, montering_en)

# ---------------------------------------------------------------- SIDE 15: SIKKERHET OG STELL
add('banner_sikkerhet', 'SIKKERHET OG STELL', 'SAFETY AND CARE')
add('pill_sikkerhet', 'SIKKERHET', 'SAFETY')
sik_no = [
    'Bruk alltid små, godt festede knapper, og sy dem fast med dobbel tråd, flere ganger gjennom '
    'hvert hull.',
    'Kontroller knappene jevnlig, spesielt etter vask, og fest dem på nytt ved første tegn til '
    'løshet.',
    'Denne oppskriften er ikke ment for barn som putter små gjenstander i munnen uten tilsyn, la '
    'aldri barnet være alene med vesten på uten oppsyn den første tiden.',
    'Alle mål og masketall i denne oppskriften er beregnet for en romslig, komfortabel passform, '
    'ikke en stram sikkerhetspassform, følg alltid gjeldende sikkerhetsanbefalinger for barneklær.',
]
sik_en = [
    'Always use small, securely attached buttons, and sew them on with double thread, several '
    'times through each hole.',
    'Check the buttons regularly, especially after washing, and reattach them at the first sign '
    'of looseness.',
    'This pattern is not intended for children who put small objects in their mouth unsupervised, '
    'never leave a baby alone and unsupervised in the vest during the first while of wearing it.',
    'All measurements and stitch counts in this pattern are calculated for a roomy, comfortable '
    'fit, not a tight safety fit, always follow current safety recommendations for children\'s '
    'clothing.',
]
add('sikkerhet_txt', sik_no, sik_en)
add('pill_stell', 'VASKERÅD', 'CARE INSTRUCTIONS')
add('stell_txt',
    'Håndvask forsiktig i lunkent vann med ullvask, eller maskinvask på ullprogram 30 grader. Press '
    'ut vannet, trekk i fasong, og tørk liggende flatt på et håndkle. Unngå å henge vesten til '
    'tørk, alpakka kan strekke seg.',
    'Hand wash gently in lukewarm water with wool wash, or machine wash on a wool cycle at 30 '
    'degrees. Press out the water, ease into shape, and dry lying flat on a towel. Avoid hanging '
    'the vest up to dry, alpaca can stretch out of shape.')

# ---------------------------------------------------------------- SIDE 16: FERDIG
add('banner_ferdig', 'FERDIG!', 'ALL DONE!')
add('ferdig_txt',
    'Gratulerer, kort vest-en din er ferdig! Ta den på utenpå basisbodyen, knapp den igjen foran, '
    'og du har et helt fargerikt lag klart, en fin del av hele "Woodland Dreams"-kolleksjonen.',
    'Congratulations, your short vest is finished! Put it on over the basisbody, button it closed '
    'at the front, and you have a whole colourful layer ready, a lovely part of the entire '
    '"Woodland Dreams" collection.')
add('pill_kolleksjon', 'RESTEN AV KOLLEKSJONEN', 'THE REST OF THE COLLECTION')
kolliste_no = [
    'Basisbody, den nøytrale grunnmuren vesten skal tas utenpå.',
    'Blondekrage, en løs krage som hekter bak.',
    'Rysjekrage, samme feste, litt mer romantisk.',
    'Peter Pan-krage, en klassisk avrundet krage.',
    'Smekke, som knytes med i-cord eller en knapp.',
    'I-cord-seler, kolleksjonens signaturdel, justerbare og krysser bak.',
    'Woodland Fluffy Skirt, et heklet skjørt laget for å matche bodyen.',
]
kolliste_en = [
    'Basisbody, the neutral foundation the vest is meant to be worn over.',
    'Lace collar, a loose collar that fastens at the back.',
    'Ruffle collar, the same fastening, a little more romantic.',
    'Peter Pan collar, a classic rounded collar.',
    'Bib, tied with an i-cord or a button.',
    "I-cord suspenders, the collection's signature piece, adjustable and crossing at the back.",
    'Woodland Fluffy Skirt, a crocheted skirt made to match the body.',
]
add('kolleksjon_liste', kolliste_no, kolliste_en)
add('pill_copyright', 'OPPHAVSRETT', 'COPYRIGHT')
add('copyright_txt',
    '(c) Renate Dahl, Little Montessori Explorers. Denne oppskriften er et helt originalt '
    'LME-design. Du står fritt til å selge ferdige plagg du lager etter denne oppskriften, i liten, '
    'personlig skala, forutsatt at det ferdige produktet er sjekket mot gjeldende '
    'sikkerhetskrav. Selve oppskriften, teksten og bildene, kan ikke deles, kopieres eller selges '
    'videre.',
    '(c) Renate Dahl, Little Montessori Explorers. This pattern is a fully original LME design. You '
    'are welcome to sell finished garments you make from this pattern, on a small personal scale, '
    'provided the finished product is checked against current safety requirements. The pattern '
    'itself, its text and images, may not be shared, copied or resold.')

# ================================================================== BYGG SIDENE

def build(lang):
    RIGHT = {'no': 'LME STRIKKING', 'en': 'LME KNITTING'}[lang]
    def t(key): return T[key][lang]
    PH2 = t('ph2')
    def pg(body, num): return kit.page(body, num, RIGHT, PH2, t('doctitle'))
    pages = []

    pages.append(pg(f'''
<div class="covertag">{t('covertag')}</div>
<div class="coverbanner"><h1 class="covertitle">{t('covertitle')}</h1></div>
<div class="subpill">{t('subpill')}</div>
{card('<p class="center">' + t('cover_desc') + '</p>')}
<div class="byline">
  <div class="by1">{t('by1')}</div>
  <div class="by2">{t('by2')}</div>
  <div class="by3">{t('by3')}</div>
</div>
<div class="notecard"><span class="noteemo">&#129517;</span><p><i>{t('cover_tip')}</i></p></div>
''', 1))

    pages.append(pg(f'''
{banner(t('banner_om'))}
{rosep(t('pill_kolleksjon0'))}
{card('<p>' + t('om_kolleksjon0') + '</p>')}
{sagep(t('pill_stil'))}
{card('<p>' + t('om_stil') + '</p>')}
{rosep(t('pill_passform'))}
{cme(t('om_passform'))}
''', 2))

    forbruk_html = '<table class="t"><tr><th>' + {'no':'Størrelse','en':'Size'}[lang] + '</th><th>' + \
        {'no':'Garnforbruk','en':'Yarn amount'}[lang] + '</th></tr>' + \
        ''.join(f'<tr><td><b>{a}</b></td><td>{b}</td></tr>' for a, b in GARNFORBRUK) + '</table>'
    pages.append(pg(f'''
{banner(t('banner_mat'))}
{rosep(t('pill_garn'))}
{card('<p>' + t('garn_txt') + '</p>')}
{sagep(t('pill_forbruk'))}
{card(forbruk_html)}
{rosep(t('pill_pinner'))}
{cme(t('pinner_txt'))}
''', 3))

    st_table = '<table class="t"><tr><th>' + '</th><th>'.join(t('storrelse_head')) + '</th></tr>' + \
        ''.join(f'<tr><td><b>{a}</b></td><td>{b}</td><td>{c}</td><td>{d}</td><td>{e}</td></tr>'
                for a, b, c, d, e in T['storrelse_rows_data']['no']) + '</table>'
    pages.append(pg(f'''
{banner(t('banner_storrelse'))}
<p>{t('storrelse_lead')}</p>
{card(st_table)}
{cme(t('storrelse_note'))}
''', 4))

    pages.append(pg(f'''
{banner(t('banner_fasthet'))}
{rosep(t('pill_fasthet'))}
{card('<p>' + t('fasthet_txt') + '</p>')}
{sagep(t('pill_vanskelig'))}
{cme(t('vanskelig_txt'))}
''', 5))

    ord_table = abbrtab(T['ord_rows']['no'], t('ord_head'))
    pages.append(pg(f'''
{banner(t('banner_ord'))}
<p>{t('ord_lead')}</p>
{card(ord_table)}
{sagep(t('pill_tips'))}
{card(ul(t('tips')))}
''', 6))

    deler_html = '<div class="deler-grid">' + ''.join(
        f'<div class="di"><b>{a}</b><br>{b}</div>'
        for a, b, c, d in T['oversikt_deler_data']['no']) + '</div>' if lang == 'no' else \
        '<div class="deler-grid">' + ''.join(
        f'<div class="di"><b>{c}</b><br>{d}</div>'
        for a, b, c, d in T['oversikt_deler_data']['no']) + '</div>'
    pages.append(pg(f'''
{banner(t('banner_oversikt'))}
{card('<p>' + t('oversikt_lead') + '</p>' + deler_html)}
''', 7))

    s0 = SIZES[0]
    hals_ex = t('hals_txt').format(neck_co=s0['neck_co'], neck_border_rows=s0['neck_border_rows'],
                                    mk1=s0['front_each_co'], mk2=s0['front_each_co']+s0['back_neck_co'])
    pages.append(pg(f'''
{banner(t('banner_hals'))}
<p>{t('hals_lead')}</p>
{card('<p><b>' + {'no':'Eksempel, 0-1 mnd:','en':'Example, 0-1 months:'}[lang] + '</b> ' + hals_ex + '</p>')}
<p class="small center">{t('hals_note')}</p>
''', 8))

    skulder_table = '<table class="t"><tr><th>' + '</th><th>'.join(t('skulder_head')) + '</th></tr>' + \
        ''.join(f'<tr><td><b>{a}</b></td><td>{b}</td><td>{c}</td><td>{d}</td><td>{e}</td></tr>'
                for a, b, c, d, e in T['skulder_rows_data']['no']) + '</table>'
    pages.append(pg(f'''
{banner(t('banner_skulder'))}
<p>{t('skulder_lead')}</p>
{card('<p>' + t('skulder_metode') + '</p>')}
{card(skulder_table)}
{cme(t('skulder_ferdig'))}
''', 9))

    s_ex = SIZES[0]
    del_html = ul([step.format(frontco=s_ex['front_each_co'], backco=s_ex['back_neck_co'],
                                armhole=s_ex['armhole_sts'], front=s_ex['front_each'],
                                back=s_ex['back_sts'])
                   for step in t('del_steps')])
    del_note = t('del_note').format(armhole_half=s_ex['armhole_sts']//2, rf=s_ex['rf_final'],
                                     front=s_ex['front_each'], bf=s_ex['back_final'],
                                     back=s_ex['back_sts'])
    pages.append(pg(f'''
{banner(t('banner_del'))}
<p>{t('del_lead')}</p>
{card('<p class="small">' + {'no':'Eksempel med tall for 0-1 mnd, bruk dine egne tall fra tabellen på forrige side.','en':'Example with numbers for 0-1 months, use your own numbers from the table on the previous page.'}[lang] + '</p>' + del_html)}
{cme(del_note)}
''', 10))

    kropp_table = '<table class="t"><tr><th>' + '</th><th>'.join(t('kropp_head')) + '</th></tr>' + \
        ''.join(f'<tr><td><b>{a}</b></td><td>{b}</td><td>{c}</td><td>{d}</td></tr>'
                for a, b, c, d in T['kropp_rows_data']['no']) + '</table>'
    kropp_ferdig = t('kropp_ferdig').format(hem=SIZES[0]['hem_border_rows'])
    pages.append(pg(f'''
{banner(t('banner_kropp'))}
<p>{t('kropp_lead')}</p>
{card(kropp_table)}
{cme(kropp_ferdig)}
''', 11))

    knapp_html = steps([step.format(pickup=s_ex['band_pickup_sts'], buttons=s_ex['buttons'])
                         for step in t('knapp_steps')])
    pages.append(pg(f'''
{banner(t('banner_knapp'))}
<p>{t('knapp_lead')}</p>
{card('<p class="small">' + {'no':'Eksempel med tall for 0-1 mnd, bruk dine egne tall fra tabellen på side 4 og graderingstabellen på side 9.','en':'Example with numbers for 0-1 months, use your own numbers from the table on page 4 and the grading table on page 9.'}[lang] + '</p>' + knapp_html)}
{cme(t('knapp_note'))}
''', 12))

    erme_table = '<table class="t"><tr><th>' + '</th><th>'.join(t('erme_head')) + '</th></tr>' + \
        ''.join(f'<tr><td><b>{a}</b></td><td>{b}</td><td>{c}</td><td>{d}</td></tr>'
                for a, b, c, d in T['erme_rows_data']['no']) + '</table>'
    erme_txt = t('erme_txt').format(pickup=s_ex['armhole_pickup_sts'])
    pages.append(pg(f'''
{banner(t('banner_erme'))}
<p>{t('erme_lead')}</p>
{card('<p>' + erme_txt + '</p>')}
{card(erme_table)}
{cme(t('erme_note'))}
''', 13))

    pages.append(pg(f'''
{banner(t('banner_montering'))}
{card(steps(t('montering_steg')))}
''', 14))

    pages.append(pg(f'''
{banner(t('banner_sikkerhet'))}
{rosep(t('pill_sikkerhet'))}
{card(ul(t('sikkerhet_txt')))}
{sagep(t('pill_stell'))}
{cme(t('stell_txt'))}
''', 15))

    pages.append(pg(f'''
{banner(t('banner_ferdig'))}
{cream('<p class="creamtitle">' + t('ferdig_txt') + '</p>')}
{sagep(t('pill_kolleksjon'))}
{card(ul(t('kolleksjon_liste')))}
{rosep(t('pill_copyright'))}
{card('<p class="small center">' + t('copyright_txt') + '</p>')}
<div class="byline">
  <div class="by2">{t('by1')} &middot; {t('by2')} &middot; {t('by3')}</div>
</div>
''', 16))

    return pages

for lang in ('no', 'en'):
    html_doc = kit.doc(lang, T['doctitle'][lang], None, build(lang))
    out = BASE / f'kort_vest_{lang}.html'
    out.write_text(html_doc, encoding='utf-8')
    print('OK', lang, len(html_doc), 'tegn/chars')
