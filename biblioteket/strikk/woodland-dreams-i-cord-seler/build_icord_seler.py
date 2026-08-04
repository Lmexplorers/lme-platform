# -*- coding: utf-8 -*-
"""Genererer LME-strikkeoppskrift 'Woodland Dreams I-cord-seler' (norsk + engelsk)
som HTML, klar for PDF-print med Chromium. Tilbehørsdel i strikkekolleksjonen
LME Woodland Dreams (basisbody + 6 tilbehørsdeler + Woodland Fluffy Skirt).

Helt original LME-konstruksjon: to i-cord-seler som krysser bak, festes foran
og bak med treknapper via heklede løkker, justerbare via tre løkkeposisjoner
i hver ende. Fasthet 22 m = 10 cm / 30 o = 10 cm på 4 mm pinne, Sandnes Garn
Alpakka, samme fasthet som resten av kolleksjonen (brukt løst som referanse,
siden i-cord ikke krever presis fasthet for å fungere).

Strap-lengden per størrelse er reelt utregnet fra bodyens kroppslengde
(sizes.json, feltet body_length_cm), ikke frihåndstall, se STRAP_RATIO og
CROSS_EASE_CM under, med interne konsistenssjekk (assert).
"""
import pathlib, sys, json

BASE = pathlib.Path(__file__).parent
sys.path.insert(0, str(BASE.parent.parent / 'hekle' / '_shared'))
import lme_pattern_kit as kit
from lme_pattern_kit import (banner, rosep, sagep, card, cream, cme, ul, steps, abbrtab)

BODY_SIZES = json.loads(
    BASE.parent.joinpath('woodland-dreams-basisbody', 'sizes.json').read_text(encoding='utf-8'))

# ================================================================== GRADERING (BEREGNET, IKKE FRIHÅND)

GAUGE_STS_10CM = 22
GAUGE_ROWS_10CM = 30
ROWS_PER_CM = GAUGE_ROWS_10CM / 10.0   # 3.0 omg/rader pr cm, brukt løst som referanse for i-cord

# Strap-lengde = 2 x (STRAP_RATIO x kroppslengde) + CROSS_EASE_CM.
# STRAP_RATIO: anslag på avstanden midje-skulder (både foran og bak), som andel
# av bodyens kroppslengde (hals-skritt). 0,6 er valgt fordi midje-skulder-lengden
# på et lite barn normalt er kortere enn hele hals-skritt-lengden, men klart mer
# enn halvparten, siden kroppslengden inkluderer bleierommet under midjen.
# Tallet dobles fordi selen går både opp foran OG ned bak (til motsatt side).
# CROSS_EASE_CM: fast tillegg som dekker selve krysningen bak pluss litt
# bevegelsesvidde, samme for alle størrelser.
STRAP_RATIO = 0.6
CROSS_EASE_CM = 4.0

# Justering: tre heklede løkker i hver ende, jevnt fordelt over de siste
# LOOP_COUNT-1 x LOOP_SPACING_CM cm av selen.
LOOP_COUNT = 3
LOOP_SPACING_CM = 1.5


def compute_sizes(body_sizes):
    out = []
    for s in body_sizes:
        raw = 2 * STRAP_RATIO * s['body_length_cm'] + CROSS_EASE_CM
        strap_length_cm = round(raw, 1)
        strap_rows = round(strap_length_cm * ROWS_PER_CM)
        out.append({
            'no': s['no'], 'en': s['en'],
            'chest_cm': s['chest_cm'],
            'body_length_cm': s['body_length_cm'],
            'strap_length_cm': strap_length_cm,
            'strap_rows': strap_rows,
        })
    return out


SIZES = compute_sizes(BODY_SIZES)

# ---- konsistenssjekk: tallene skal alltid stemme med formelen over, og hver
# ---- størrelse skal være strengt lengre enn forrige (både cm og omganger).
loop_zone_cm = (LOOP_COUNT - 1) * LOOP_SPACING_CM
for i, s in enumerate(SIZES):
    expected_len = round(2 * STRAP_RATIO * s['body_length_cm'] + CROSS_EASE_CM, 1)
    assert s['strap_length_cm'] == expected_len, (s['no'], s['strap_length_cm'], expected_len)
    assert s['strap_rows'] == round(s['strap_length_cm'] * ROWS_PER_CM), s['no']
    # løkkesonen i hver ende må ha god klaring til motsatt ende (ikke overlappe)
    assert loop_zone_cm * 2 < s['strap_length_cm'] / 2, (s['no'], 'loop zone too large')
    if i > 0:
        assert s['strap_length_cm'] > SIZES[i - 1]['strap_length_cm'], (s['no'], 'length not increasing')
        assert s['strap_rows'] > SIZES[i - 1]['strap_rows'], (s['no'], 'rows not increasing')

T = {}
def add(key, no, en=None):
    T[key] = {'no': no, 'en': en if en is not None else no}

# ---------------------------------------------------------------- SIDE 1: FORSIDE
add('doctitle', 'Woodland Dreams I-cord-seler, LME strikkeoppskrift',
    'Woodland Dreams I-cord Suspenders, LME knitting pattern')
add('ph2', 'LME STRIKKEOPPSKRIFT&nbsp;&nbsp;|&nbsp;&nbsp;WOODLAND DREAMS I-CORD-SELER',
    'LME KNITTING PATTERN&nbsp;&nbsp;|&nbsp;&nbsp;WOODLAND DREAMS I-CORD SUSPENDERS')
add('covertag', 'LME STRIKKEOPPSKRIFT - BABY', 'LME KNITTING PATTERN - BABY')
add('covertitle', 'WOODLAND DREAMS I-CORD-SELER', 'WOODLAND DREAMS I-CORD SUSPENDERS')
add('subpill', 'LME BABY COLLECTION - WOODLAND DREAMS', 'LME BABY COLLECTION - WOODLAND DREAMS')
add('cover_desc',
    'Et par enkle, justerbare seler i i-cord, som krysser bak og festes foran med små treknapper. '
    'Selene er kolleksjonens signaturdel: de kan brukes over bukse, shorts, bloomers eller '
    'basisbodyen, og gjør at ett og samme par seler kan følge barnet gjennom flere ulike antrekk. '
    'Syv størrelser, fra 0-1 til 18-24 måneder.',
    'A pair of simple, adjustable i-cord suspenders, that cross at the back and fasten at the front '
    'with small wooden buttons. The suspenders are the signature piece of the collection: they can '
    'be worn over trousers, shorts, bloomers or the basisbody, so one single pair can follow the '
    'child through several different outfits. Seven sizes, from 0-1 to 18-24 months.')
add('by1', 'Av Renate Dahl', 'By Renate Dahl')
add('by2', 'Little Montessori Explorers', 'Little Montessori Explorers')
add('by3', 'lmexplorers.com', 'lmexplorers.com')
add('cover_tip',
    'TIPS: I-cord krever ikke en helt nøyaktig strikkefasthet for å fungere, men les gjennom hele '
    'oppskriften og størrelsestabellen på side 4 før du starter, slik at du velger riktig størrelse '
    'fra start.',
    'TIP: I-cord does not need an exact gauge to work, but read through the whole pattern and the '
    'size chart on page 4 before you start, so you choose the right size from the beginning.')

# ---------------------------------------------------------------- SIDE 2: OM
add('banner_om', 'OM I-CORD-SELENE', 'ABOUT THE I-CORD SUSPENDERS')
add('pill_signatur', 'KOLLEKSJONENS SIGNATURDEL', 'THE SIGNATURE PIECE OF THE COLLECTION')
add('om_signatur',
    'Om det er én del av Woodland Dreams som er verdt en liten ekstra kjærlighet, er det denne. '
    'I-cord-selene er den delen som gjør hele kolleksjonen virkelig modulær. Sy fire små treknapper '
    'på et par bloomers, et par shorts eller på selve basisbodyen, og selene kan flyttes fra plagg '
    'til plagg gjennom hele sesongen. Ett par seler, mange antrekk.',
    'If there is one piece in Woodland Dreams worth a little extra love, it is this one. The i-cord '
    'suspenders are the piece that makes the whole collection truly modular. Sew four small wooden '
    'buttons onto a pair of bloomers, a pair of shorts or the basisbody itself, and the suspenders '
    'can move from garment to garment all season long. One pair of suspenders, many outfits.')
add('pill_teknikk', 'ENKEL TEKNIKK, VAKKERT RESULTAT', 'A SIMPLE TECHNIQUE, A BEAUTIFUL RESULT')
add('om_teknikk',
    'I-cord er en av de enkleste teknikkene i strikking, en smal, rund snor som strikkes på bare '
    'noen få masker. Nettopp derfor egner den seg perfekt til seler. Den er sterk, elastisk nok til '
    'å bevege seg med barnet, og rask å strikke, selv om du aldri har prøvd teknikken før.',
    'I-cord is one of the simplest techniques in knitting, a narrow, round cord knitted on just a '
    'few stitches. That is exactly why it is perfect for suspenders. It is strong, stretchy enough '
    'to move with the child, and quick to knit, even if you have never tried the technique before.')
add('pill_bruk', 'BRUK PÅ TVERS AV PLAGG', 'USE ACROSS DIFFERENT GARMENTS')
add('om_bruk',
    'Selene er ikke sydd fast til noe bestemt plagg. Fest dem med treknapper på et par bloomers en '
    'dag, bytt til shorts neste, eller bruk dem rett over basisbodyen på en kjølig tur ute. '
    'Løsningen er tenkt som en liten investering som varer lenger enn ett enkelt plagg.',
    'The suspenders are not sewn to any particular garment. Attach them with wooden buttons to a '
    'pair of bloomers one day, switch to shorts the next, or wear them right over the basisbody on '
    'a cool walk outside. The idea is a small investment that outlasts any single garment.')

# ---------------------------------------------------------------- SIDE 3: MATERIALER
add('banner_mat', 'MATERIALER', 'MATERIALS')
add('pill_garn', 'GARN', 'YARN')
add('garn_txt',
    'Sandnes Garn Alpakka (100 % alpakka), eller et tilsvarende garn med samme fasthet. Siden '
    'selene er tilbehør, velges en av kolleksjonens kontrastfarger til selve i-corden, for eksempel '
    'salvie, støvrosa, smørgul, lyseblå, oliven eller terrakotta, som en fin kontrast til bodyens '
    'rolige, nøytrale farger (krem, lin, sand, havre eller beige).',
    "Sandnes Garn Alpakka (100% alpaca), or an equivalent yarn with the same gauge. As the "
    "suspenders are an accessory, choose one of the collection's contrast colours for the i-cord "
    'itself, for example sage, dusty rose, butter yellow, soft blue, olive or terracotta, for a '
    "lovely contrast to the body's calm, neutral colours (cream, linen, sand, oatmeal or beige).")
add('pill_forbruk', 'GARNFORBRUK', 'YARN REQUIREMENTS')
add('forbruk_txt',
    'I-cord bruker svært lite garn. Ett nøste på 50 g Sandnes Garn Alpakka er mer enn nok til begge '
    'selene, i alle syv størrelser, selv med noen ekstra centimeter til prøvelapp og feilstrikking.',
    'I-cord uses very little yarn. One 50 g ball of Sandnes Garn Alpakka is more than enough for '
    'both suspenders, in any of the seven sizes, even with a few extra centimetres for a gauge '
    'swatch and any mistakes.')
add('pill_pinner', 'PINNER OG TILBEHØR', 'NEEDLES AND NOTIONS')
add('pinner_txt',
    'To strømpepinner 4 mm (eller en kort rundpinne 4 mm brukt som strømpepinne), til selve '
    'i-corden. Heklenål 3 mm til å hekle knapphullsløkkene. Fire små, runde treknapper, som sys på '
    'plagget selene skal festes til, ikke på selve selene. Synål til å feste tråder, og gjerne et '
    'målebånd for å måle strap-lengden underveis.',
    'Two 4 mm double-pointed needles (or a short 4 mm circular needle used as a DPN), for the '
    'i-cord itself. A 3 mm crochet hook for crocheting the buttonhole loops. Four small, round '
    'wooden buttons, sewn onto the garment the suspenders will attach to, not onto the suspenders '
    'themselves. A tapestry needle for weaving in ends, and ideally a tape measure to check the '
    'strap length as you go.')
add('pill_swatch', 'OM STRIKKEFASTHET OG PRØVELAPP', 'ABOUT GAUGE AND THE SWATCH')
add('swatch_txt',
    'I-cord trenger ikke en presis strikkefasthet for å sitte riktig. Snoren blir bare litt tykkere '
    'eller tynnere enn ventet. Fasthetsangivelsen (se side 5) brukes likevel i denne oppskriften for '
    'å beregne omtrent hvor mange omganger som tilsvarer riktig lengde for din størrelse, og for å '
    'holde selene i tråd med resten av kolleksjonen. Strikk gjerne en liten prøvelapp i glattstrikk '
    'uansett, og mål heller strap-lengden din underveis med målebånd enn å telle omganger blindt.',
    'I-cord does not need a precise gauge to fit correctly. The cord will simply end up a little '
    'thicker or thinner than expected. The gauge below (see page 5) is still used in this pattern '
    'to calculate roughly how many rounds match the correct length for your size, and to keep the '
    'suspenders consistent with the rest of the collection. Knit a small gauge swatch in stockinette '
    'anyway if you like, and measure your actual strap length as you go with a tape measure rather '
    'than blindly counting rounds.')

# ---------------------------------------------------------------- SIDE 4: STØRRELSESTABELL
add('banner_storrelse', 'STØRRELSESTABELL', 'SIZE CHART')
add('storrelse_lead',
    'Selene er beregnet ut fra bodyens mål for hver størrelse, se Woodland Dreams Basisbody. Velg '
    'samme størrelse som bodyen, eller det plagget selene skal festes til.',
    'The suspenders are sized based on the body\'s measurements for each size, see Woodland Dreams '
    'Basisbody. Choose the same size as the body, or the garment the suspenders will attach to.')
storrelse_head = {'no': ['Størrelse', 'Brystvidde (ref.)', 'Kroppslengde (ref.)', 'Strap-lengde'],
                   'en': ['Size', 'Chest width (ref.)', 'Body length (ref.)', 'Strap length']}
add('storrelse_head', storrelse_head['no'], storrelse_head['en'])
storrelse_rows = []
for s in SIZES:
    storrelse_rows.append((s['no'], f"{s['chest_cm']} cm", f"{s['body_length_cm']} cm",
                            f"{s['strap_length_cm']} cm"))
add('storrelse_rows_data', storrelse_rows)
add('storrelse_note',
    'Brystvidde og kroppslengde er hentet fra Woodland Dreams Basisbody, og oppgis her kun som '
    'referanse for å velge riktig størrelse. Strap-lengden er selenes egen ferdige lengde, fra tupp '
    'til tupp, før selen bøyes over skulderen.',
    "Chest width and body length are taken from Woodland Dreams Basisbody, and are given here only "
    "as a reference for choosing the right size. Strap length is the suspenders' own finished "
    'length, from tip to tip, before the strap is folded over the shoulder.')

# ---------------------------------------------------------------- SIDE 5: FASTHET
add('banner_fasthet', 'STRIKKEFASTHET OG VANSKELIGHETSGRAD', 'GAUGE AND DIFFICULTY LEVEL')
add('pill_fasthet', 'FASTHET', 'GAUGE')
add('fasthet_txt',
    '22 masker og 30 omganger glattstrikk = 10 x 10 cm, på pinne 4 mm, samme fasthet som resten av '
    'Woodland Dreams-kolleksjonen. I denne oppskriften brukes fastheten til å regne ut et omtrentlig '
    'antall omganger for hver strap-lengde (se tabellen på side 8), ikke til å styre selve '
    'i-cord-teknikken, som fungerer fint på de fleste fastheter.',
    '22 stitches and 30 rounds in stockinette stitch = 10 x 10 cm, on 4 mm needles, the same gauge '
    'as the rest of the Woodland Dreams collection. In this pattern the gauge is used to calculate '
    'an approximate number of rounds for each strap length (see the table on page 8), not to '
    'control the i-cord technique itself, which works fine at most gauges.')
add('pill_vanskelig', 'VANSKELIGHETSGRAD', 'DIFFICULTY LEVEL')
add('vanskelig_txt',
    'Lett. I-cord er en av de aller enkleste teknikkene i strikking: du trenger bare å beherske å '
    'strikke rett, og å skyve maskene tilbake uten å snu arbeidet. Denne oppskriften passer godt som '
    'en første i-cord-øvelse, selv for deg som er relativt ny i strikking.',
    'Easy. I-cord is one of the simplest techniques in knitting: you only need to be able to knit, '
    'and slide the stitches back without turning the work. This pattern makes a great first i-cord '
    'project, even if you are still fairly new to knitting.')

# ---------------------------------------------------------------- SIDE 6: FORKORTELSER
add('banner_ord', 'FORKORTELSER', 'ABBREVIATIONS')
add('ord_lead',
    'Norske strikke- og hekleuttrykk med engelske termer ved siden av.',
    'Norwegian knitting and crochet terms with the English terms alongside.')
ord_head = {'no': ['Norsk', 'Engelsk', 'Betyr'], 'en': ['Norwegian', 'English', 'Meaning']}
add('ord_head', ord_head['no'], ord_head['en'])
ord_rows = [
    ('r', 'K', 'rett'),
    ('m', 'st(s)', 'maske(r)'),
    ('o', 'rnd', 'omgang'),
    ('legg opp', 'CO', 'legg opp masker'),
    ('fell av', 'BO', 'fell av / bind off'),
    ('strømpepinne', 'DPN', 'strømpepinne (dobbeltspiss)'),
    ('rundpinne', 'circular needle', 'rundpinne'),
    ('maskemarkør', 'st marker', 'maskemarkør'),
    ('heklenål', 'crochet hook', 'heklenål'),
    ('luftmaske / lm', 'chain / ch', 'luftmaske i hekling'),
    ('kjedemaske', 'slip stitch / sl st', 'kjedemaske i hekling'),
    ('i-cord', 'i-cord', 'smal, rund strikkesnor på strømpepinne'),
]
add('ord_rows', ord_rows)
add('pill_tips', 'TIPS', 'TIPS')
tips_no = [
    'Strikk begge selene like langt, tell omgangene dine eller mål med målebånd for hver, slik at '
    'de blir like lange.',
    'Bruk en løs strikkemåte på i-corden, en for stram i-cord blir stiv og lite behagelig mot huden.',
    'Sett gjerne en liten trådmarkør for hver 10. omgang mens du strikker, det gjør det enklere å '
    'holde styr på hvor langt du har kommet.',
]
tips_en = [
    'Knit both suspenders to the same length, count your rounds or measure with a tape measure for '
    'each, so they end up the same length.',
    'Knit the i-cord loosely, a too-tight i-cord becomes stiff and less comfortable against the '
    'skin.',
    'Place a small scrap-yarn marker every 10th round as you knit, it makes it easier to keep track '
    'of how far you have come.',
]
add('tips', tips_no, tips_en)

# ---------------------------------------------------------------- SIDE 7: I-CORD-TEKNIKKEN
add('banner_teknikk', 'SLIK STRIKKES I-CORD', 'HOW TO KNIT I-CORD')
add('teknikk_lead',
    'I-cord er en smal, rund strikkesnor som strikkes på strømpepinner, uten å strikke rundt på '
    'vanlig vis. Teknikken er enkel, men kan virke litt uvant første gang, så her er den forklart '
    'steg for steg.',
    'I-cord is a narrow, round knitted cord worked on double-pointed needles, without knitting in '
    'the round the usual way. The technique is simple, but can feel a little unfamiliar the first '
    'time, so here it is explained step by step.')
teknikk_steps_no = [
    'Legg opp 3 masker på en strømpepinne 4 mm.',
    'Strikk alle 3 maskene rett.',
    'IKKE snu arbeidet. Skyv maskene til motsatt ende av pinnen, den enden du nettopp strikket fra.',
    'Stram garnet bak over ryggen av arbeidet, fra venstre til høyre, og strikk de 3 maskene rett '
    'igjen.',
    'Gjenta trinn 3 og 4 om og om igjen. Etter noen omganger strammer garnet seg til en tett, rund '
    'snor bak, uten synlig søm.',
    'Fortsett til strap-lengden i tabellen på side 8 er nådd for din størrelse. Mål gjerne '
    'underveis med målebånd.',
]
teknikk_steps_en = [
    'Cast on 3 stitches onto a 4 mm double-pointed needle.',
    'Knit all 3 stitches.',
    'Do NOT turn the work. Slide the stitches to the opposite end of the needle, the end you just '
    'knitted from.',
    'Pull the yarn firmly across the back of the work, from left to right, and knit the 3 stitches '
    'again.',
    'Repeat steps 3 and 4 over and over. After a few rounds the yarn pulls itself into a tight, '
    'round cord at the back, with no visible seam.',
    'Continue until the strap length in the table on page 8 is reached for your size. Measure with '
    'a tape measure as you go if you like.',
]
add('teknikk_steps', teknikk_steps_no, teknikk_steps_en)
add('teknikk_tips',
    'TIPS: De første par centimeterne ser litt rotete ut. Det er helt normalt; snoren strammer seg '
    'selv til en jevn, rund form etter hvert som du strikker videre.',
    'TIP: The first couple of centimetres look a little messy. That is completely normal: the cord '
    'tightens itself into a neat, round tube as you keep knitting.')

# ---------------------------------------------------------------- SIDE 8: STRIKK SELENE
add('banner_seler', 'DEL 1: STRIKK DE TO SELENE', 'PART 1: KNIT THE TWO STRAPS')
add('seler_lead',
    'Strikk to like seler, hver strikket som én lang i-cord-snor. Strap-lengden er beregnet fra '
    'bodyens kroppslengde for hver størrelse, slik at selen er lang nok til å gå fra forkant, over '
    'skulderen, krysse bak og ned til motsatt side i midjekanten bak.',
    'Knit two identical suspenders, each worked as one long i-cord. The strap length is calculated '
    "from the body's body length for each size, so the strap is long enough to run from the front "
    'waistband, over the shoulder, cross at the back and down to the opposite side at the back '
    'waistband.')
add('seler_formel',
    'Strap-lengden er beregnet med denne enkle formelen: 2 x (0,6 x bodyens kroppslengde) + 4 cm. '
    'Faktoren 0,6 er et anslag på avstanden fra midje til skulder, både foran og bak, og de 4 ekstra '
    'centimeterne dekker selve krysningen bak, pluss litt bevegelsesvidde. Tallet dobles fordi selen '
    'går både opp foran og ned bak, til motsatt side.',
    'The strap length is calculated with this simple formula: 2 x (0.6 x the body\'s body length) + '
    '4 cm. The factor 0.6 is an estimate of the waist-to-shoulder distance, both at the front and '
    'the back, and the extra 4 cm covers the crossing at the back plus a little ease for movement. '
    'The number is doubled because the strap runs both up the front and down the back, to the '
    'opposite side.')
seler_head = {'no': ['Størrelse', 'Kroppslengde (ref.)', 'Strap-lengde', 'Omg. i-cord (ca.)'],
              'en': ['Size', 'Body length (ref.)', 'Strap length', 'I-cord rounds (approx.)']}
add('seler_head', seler_head['no'], seler_head['en'])
seler_rows = []
for s in SIZES:
    seler_rows.append((s['no'], f"{s['body_length_cm']} cm", f"{s['strap_length_cm']} cm",
                        str(s['strap_rows'])))
add('seler_rows_data', seler_rows)
add('seler_note',
    'Omgangstallet er en omtrentlig referanse regnet ut fra fastheten på side 5. I-cord kan variere '
    'litt i lengde fra strikker til strikker, mål alltid strap-lengden i cm-kolonnen for din '
    'størrelse, ikke bare tell omganger.',
    'The round count is an approximate reference calculated from the gauge on page 5. I-cord length '
    'can vary a little from knitter to knitter, always measure the strap length in the cm column '
    'for your size, do not just count rounds.')
seler_steps_no = [
    'Legg opp 3 masker på strømpepinne 4 mm.',
    'Strikk i-cord (se side 7) til strap-lengden i tabellen over er nådd for din størrelse.',
    'Klipp av garnet med en hale på ca. 15 cm. Tre halen gjennom de 3 gjenværende maskene med '
    'synål, og stram godt til.',
    'Strikk den andre selen på nøyaktig samme måte, med samme lengde.',
]
seler_steps_en = [
    'Cast on 3 stitches onto a 4 mm double-pointed needle.',
    'Work i-cord (see page 7) until the strap length in the table above is reached for your size.',
    'Cut the yarn leaving a tail of approx. 15 cm. Thread the tail through the 3 remaining stitches '
    'with a tapestry needle, and pull tight.',
    'Knit the second strap exactly the same way, to the same length.',
]
add('seler_steps', seler_steps_no, seler_steps_en)

# ---------------------------------------------------------------- SIDE 9: LØKKER OG JUSTERING
add('banner_lokker', 'DEL 2: KNAPPHULLSLØKKER OG JUSTERING', 'PART 2: BUTTONHOLE LOOPS AND ADJUSTABILITY')
add('lokker_lead',
    'I hver ende av begge selene hekles tre små løkker, med litt avstand mellom seg, slik at selen '
    'kan justeres i lengde uten å strikkes om.',
    'At each end of both straps, three small loops are crocheted, spaced a little apart, so the '
    'strap length can be adjusted without any reknitting.')
lokker_steps_no = [
    'Med heklenål 3 mm og en løs tråd fra i-corden (eller ny tråd festet i enden), hekle en '
    'luftmaskekjede på ca. 5-6 luftmasker.',
    'Fest kjeden til enden av i-corden med en kjedemaske, slik at den danner en liten løkke, stor '
    'nok til å tre en treknapp gjennom.',
    'Hekle to løkker til på samme ende, med ca. 1,5 cm avstand mellom hver løkke, langs de siste '
    '3 cm av selen.',
    'Gjenta på alle fire endene av de to selene: 2 seler x 2 ender = 4 ender, 3 løkker pr ende, '
    '12 løkker totalt.',
]
lokker_steps_en = [
    'With a 3 mm crochet hook and a loose end of yarn from the i-cord (or new yarn attached at the '
    'end), crochet a chain of approx. 5-6 chain stitches.',
    'Fasten the chain to the end of the i-cord with a slip stitch, so it forms a small loop, large '
    'enough to fit a wooden button through.',
    'Crochet two more loops on the same end, spaced approx. 1.5 cm apart, along the last 3 cm of '
    'the strap.',
    'Repeat on all four ends of the two straps: 2 straps x 2 ends = 4 ends, 3 loops per end, 12 '
    'loops in total.',
]
add('lokker_steps', lokker_steps_no, lokker_steps_en)
add('pill_juster', 'SLIK JUSTERES LENGDEN', 'HOW TO ADJUST THE LENGTH')
add('juster_txt',
    'De tre løkkene i hver ende gir tre lengder å velge mellom. Bruk den ytterste løkken, lengst ute '
    'på tuppen, for lengst mulig lengde, og en av løkkene lenger inn for en kortere, strammere '
    'passform. Slik kan selene justeres etter hvert som barnet vokser, eller etter hvilket plagg de '
    'festes til, uten at du trenger å strikke om noe.',
    'The three loops at each end give three lengths to choose between. Use the outermost loop, at '
    'the very tip, for the longest possible length, and one of the loops further in for a shorter, '
    'snugger fit. This way the suspenders can be adjusted as the child grows, or to suit whichever '
    'garment they are attached to, without any reknitting.')

# ---------------------------------------------------------------- SIDE 10: KRYSSING BAK
add('banner_kryss', 'SLIK KRYSSER SELENE BAK', 'HOW THE SUSPENDERS CROSS AT THE BACK')
add('kryss_txt',
    'Selene er designet for å krysses i en X bak, akkurat som klassiske bukseseler. Fest den '
    'venstre selen til venstre side foran, før den opp over venstre skulder, la den krysse over '
    'ryggen og fest den til høyre side bak i midjekanten. Gjør det motsatte med den andre selen: '
    'fest den til høyre side foran, over høyre skulder, kryssende ned til venstre side bak.',
    'The suspenders are designed to cross in an X at the back, just like classic braces. Attach the '
    'left strap to the left side at the front, bring it up over the left shoulder, let it cross '
    'over the back and attach it to the right side at the back waistband. Do the opposite with the '
    'other strap: attach it to the right side at the front, over the right shoulder, crossing down '
    'to the left side at the back.')
add('pill_styling', 'STYLINGTIPS', 'STYLING TIP')
add('styling_txt',
    'Foretrekker du et roligere uttrykk, kan selene like gjerne festes rett ned uten å krysses. De '
    'fungerer fint begge veier. Krysningen bak er det som gir den klassiske, litt gammeldagse '
    'selelooken kolleksjonen er inspirert av.',
    'If you prefer a quieter look, the suspenders can just as easily be attached straight down '
    'without crossing. They work fine either way. The crossing at the back is what gives the '
    'classic, slightly old-fashioned suspender look the collection is inspired by.')

# ---------------------------------------------------------------- SIDE 11: MONTERING
add('banner_montering', 'MONTERING', 'FINISHING')
montering_no = [
    'Fest alle løse tråder godt på vrangen av hver løkke og strap-ende, og klipp dem korte.',
    'Sy de fire treknappene fast på plagget selene skal brukes sammen med, bloomers, shorts eller '
    'basisbodyen, i posisjoner som passer til krysningen beskrevet på forrige side.',
    'Prøv selene på barnet eller mot plagget før knappene sys helt fast, og juster '
    'knappeposisjonen om nødvendig.',
    'Damp press selene lett, om ønskelig, for å jevne ut i-corden.',
    'Kontroller til slutt at alle løkker og knapper sitter godt fast, og at ingen løse tråder kan '
    'løsne.',
]
montering_en = [
    'Weave in all loose ends securely on the wrong side of each loop and strap end, and trim them '
    'short.',
    'Sew the four wooden buttons onto the garment the suspenders will be used with, bloomers, '
    'shorts or the basisbody, in positions that suit the crossing described on the previous page.',
    'Try the suspenders on the child or against the garment before sewing the buttons on fully, and '
    'adjust the button positions if needed.',
    'Lightly steam-block the suspenders if you like, to even out the i-cord.',
    'Finally, check that every loop and button is securely attached, and that no loose threads can '
    'come undone.',
]
add('montering_steg', montering_no, montering_en)

# ---------------------------------------------------------------- SIDE 12: SIKKERHET OG STELL
add('banner_sikkerhet', 'SIKKERHET OG STELL', 'SAFETY AND CARE')
add('pill_sikkerhet', 'SIKKERHET', 'SAFETY')
sik_no = [
    'Små treknapper er en kvelningsfare. Sy dem fast med dobbel tråd, flere ganger gjennom hvert '
    'hull, og kontroller dem jevnlig, spesielt etter vask.',
    'La aldri et barn være alene og uten tilsyn i selene, verken i lek, i vogn eller i seng, '
    'spesielt de første gangene selene brukes.',
    'Kontroller før hver bruk at ingen løkke, strap eller løs tråd er lang eller løs nok til å '
    'kunne vikle seg rundt barnets hals. Ta av selene helt før barnet legges til å sove.',
    'Stram alle knapper og løkker godt, slik at en strap ikke kan løsne og henge fritt mens barnet '
    'er i bevegelse.',
    'Alle mål og lengder i denne oppskriften er beregnet for en romslig, komfortabel passform, ikke '
    'en stram sikkerhetspassform. Følg alltid gjeldende sikkerhetsanbefalinger for barneklær og '
    'tilbehør med snorer eller bånd.',
]
sik_en = [
    'Small wooden buttons are a choking hazard. Sew them on with double thread, several times '
    'through each hole, and check them regularly, especially after washing.',
    'Never leave a child alone and unsupervised in the suspenders, whether playing, in a pram or in '
    'bed, especially the first few times they are worn.',
    'Before every wear, check that no loop, strap or loose thread is long or loose enough to wrap '
    "around the child's neck. Remove the suspenders completely before the child is put down to "
    'sleep.',
    'Tighten all buttons and loops securely, so a strap cannot come loose and hang freely while the '
    'child is moving around.',
    'All measurements and lengths in this pattern are calculated for a roomy, comfortable fit, not '
    'a tight safety fit. Always follow current safety recommendations for children\'s clothing and '
    'accessories with cords or straps.',
]
add('sikkerhet_txt', sik_no, sik_en)
add('pill_stell', 'VASKERÅD', 'CARE INSTRUCTIONS')
add('stell_txt',
    'Håndvask forsiktig i lunkent vann med ullvask, eller maskinvask på ullprogram 30 grader, '
    'sammen med resten av plagget de er festet til. Press ut vannet, trekk i-corden rett i fasong '
    'og tørk liggende flatt på et håndkle.',
    'Hand wash gently in lukewarm water with wool wash, or machine wash on a wool cycle at 30 '
    'degrees, together with the rest of the garment they are attached to. Press out the water, '
    'ease the i-cord straight, and dry lying flat on a towel.')

# ---------------------------------------------------------------- SIDE 13: FERDIG
add('banner_ferdig', 'FERDIG!', 'ALL DONE!')
add('ferdig_txt',
    'Gratulerer, selene dine er ferdige! De er laget for å bindes sammen med flere ulike plagg i '
    'Woodland Dreams-kolleksjonen, og for å følge barnet fra det ene antrekket til det neste.',
    'Congratulations, your suspenders are finished! They are made to be paired with several '
    'different garments in the Woodland Dreams collection, and to follow the child from one outfit '
    'to the next.')
add('pill_kolleksjon', 'RESTEN AV KOLLEKSJONEN', 'THE REST OF THE COLLECTION')
kolliste_no = [
    'Basisbody, kolleksjonens grunnmur, en topp-ned raglan-body i glattstrikk.',
    'Blondekrage, en løs krage som hekter bak.',
    'Rysjekrage, samme feste, litt mer romantisk.',
    'Peter Pan-krage, en klassisk avrundet krage.',
    'Smekke, som knytes med i-cord eller en knapp.',
    'Kort vest, med treknapper foran, brukes utenpå bodyen.',
    'Woodland Fluffy Skirt, et heklet skjørt laget for å matche bodyen.',
]
kolliste_en = [
    'Basisbody, the foundation of the collection, a top-down raglan body in stockinette stitch.',
    'Lace collar, a loose collar that fastens at the back.',
    'Ruffle collar, the same fastening, a little more romantic.',
    'Peter Pan collar, a classic rounded collar.',
    'Bib, tied with an i-cord or a button.',
    'Short vest, with wooden buttons at the front, worn over the body.',
    'Woodland Fluffy Skirt, a crocheted skirt made to match the body.',
]
add('kolleksjon_liste', kolliste_no, kolliste_en)
add('pill_copyright', 'OPPHAVSRETT', 'COPYRIGHT')
# Samme opphavsrettstekst som i Woodland Dreams Basisbody, ordrett (begge språk).
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

    # SIDE 1: forside
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

    # SIDE 2: om
    pages.append(pg(f'''
{banner(t('banner_om'))}
{rosep(t('pill_signatur'))}
{card('<p>' + t('om_signatur') + '</p>')}
{sagep(t('pill_teknikk'))}
{card('<p>' + t('om_teknikk') + '</p>')}
{rosep(t('pill_bruk'))}
{cme(t('om_bruk'))}
''', 2))

    # SIDE 3: materialer
    pages.append(pg(f'''
{banner(t('banner_mat'))}
{rosep(t('pill_garn'))}
{card('<p>' + t('garn_txt') + '</p>')}
{sagep(t('pill_forbruk'))}
{card('<p>' + t('forbruk_txt') + '</p>')}
{rosep(t('pill_pinner'))}
{card('<p>' + t('pinner_txt') + '</p>')}
{sagep(t('pill_swatch'))}
{cme(t('swatch_txt'))}
''', 3))

    # SIDE 4: størrelsestabell
    st_table = '<table class="t"><tr><th>' + '</th><th>'.join(t('storrelse_head')) + '</th></tr>' + \
        ''.join(f'<tr><td><b>{a}</b></td><td>{b}</td><td>{c}</td><td>{d}</td></tr>'
                for a, b, c, d in T['storrelse_rows_data']['no']) + '</table>'
    pages.append(pg(f'''
{banner(t('banner_storrelse'))}
<p>{t('storrelse_lead')}</p>
{card(st_table)}
{cme(t('storrelse_note'))}
''', 4))

    # SIDE 5: fasthet og vanskelighetsgrad
    pages.append(pg(f'''
{banner(t('banner_fasthet'))}
{rosep(t('pill_fasthet'))}
{card('<p>' + t('fasthet_txt') + '</p>')}
{sagep(t('pill_vanskelig'))}
{cme(t('vanskelig_txt'))}
''', 5))

    # SIDE 6: forkortelser
    ord_table = abbrtab(T['ord_rows']['no'], t('ord_head'))
    pages.append(pg(f'''
{banner(t('banner_ord'))}
<p>{t('ord_lead')}</p>
{card(ord_table)}
{sagep(t('pill_tips'))}
{card(ul(t('tips')))}
''', 6))

    # SIDE 7: i-cord-teknikken
    pages.append(pg(f'''
{banner(t('banner_teknikk'))}
<p>{t('teknikk_lead')}</p>
{card(steps(t('teknikk_steps')))}
<div class="notecard"><span class="noteemo">&#129517;</span><p><i>{t('teknikk_tips')}</i></p></div>
''', 7))

    # SIDE 8: strikk selene (per-størrelse tabell)
    seler_table = '<table class="t"><tr><th>' + '</th><th>'.join(t('seler_head')) + '</th></tr>' + \
        ''.join(f'<tr><td><b>{a}</b></td><td>{b}</td><td>{c}</td><td>{d}</td></tr>'
                for a, b, c, d in T['seler_rows_data']['no']) + '</table>'
    pages.append(pg(f'''
{banner(t('banner_seler'))}
<p>{t('seler_lead')}</p>
{card('<p>' + t('seler_formel') + '</p>')}
{card(seler_table)}
<p class="small center">{t('seler_note')}</p>
{card(steps(t('seler_steps')))}
''', 8))

    # SIDE 9: løkker og justering
    pages.append(pg(f'''
{banner(t('banner_lokker'))}
<p>{t('lokker_lead')}</p>
{card(steps(t('lokker_steps')))}
{sagep(t('pill_juster'))}
{cme(t('juster_txt'))}
''', 9))

    # SIDE 10: kryssing bak
    pages.append(pg(f'''
{banner(t('banner_kryss'))}
{card('<p>' + t('kryss_txt') + '</p>')}
{rosep(t('pill_styling'))}
{cme(t('styling_txt'))}
''', 10))

    # SIDE 11: montering
    pages.append(pg(f'''
{banner(t('banner_montering'))}
{card(steps(t('montering_steg')))}
''', 11))

    # SIDE 12: sikkerhet og stell
    pages.append(pg(f'''
{banner(t('banner_sikkerhet'))}
{rosep(t('pill_sikkerhet'))}
{card(ul(t('sikkerhet_txt')))}
{sagep(t('pill_stell'))}
{cme(t('stell_txt'))}
''', 12))

    # SIDE 13: ferdig, kolleksjon og opphavsrett
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
''', 13))

    return pages


if __name__ == '__main__':
    for lang in ('no', 'en'):
        html_doc = kit.doc(lang, T['doctitle'][lang], None, build(lang))
        out = BASE / f'icord_seler_{lang}.html'
        out.write_text(html_doc, encoding='utf-8')
        print('OK', lang, len(html_doc), 'tegn/chars')
