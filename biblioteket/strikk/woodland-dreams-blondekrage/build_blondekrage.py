# -*- coding: utf-8 -*-
"""Genererer LME-strikkeoppskrift 'Woodland Dreams Blondekrage' (norsk + engelsk)
som HTML, klar for PDF-print med Chromium. Andre del av strikkekolleksjonen
LME Woodland Dreams (basisbody + 6 tilbehørsdeler + Woodland Fluffy Skirt).

Helt original LME-konstruksjon: en løs krage som IKKE strikkes fast i selve
bodyen, legges opp langs halskanten (minus en liten åpning bak), strikkes
flatt fram og tilbake, flares utover med en jevnt fordelt økerad, avsluttes
med et enkelt 2-rads hullmønster (omslag/felling) og en picot-avfelling, og
lukkes bak med én liten treknapp og en heklet kjedeløkke. Fasthet 22 m = 10 cm
/ 30 rader = 10 cm på pinne 4 mm, Sandnes Garn Alpakka, samme fasthet som
basisbodyen. Graderingstallene er beregnet og verifisert separat, se
sizes.json og README.md, ikke frihåndstall.
"""
import pathlib, sys, json

BASE = pathlib.Path(__file__).parent
sys.path.insert(0, str(BASE.parent.parent / 'hekle' / '_shared'))
import lme_pattern_kit as kit
from lme_pattern_kit import (banner, rosep, sagep, card, cream, cme, ul, steps, abbrtab)

SIZES = json.loads(BASE.joinpath('sizes.json').read_text(encoding='utf-8'))

T = {}
def add(key, no, en=None):
    T[key] = {'no': no, 'en': en if en is not None else no}

# ---------------------------------------------------------------- SIDE 1: FORSIDE
add('doctitle', 'Woodland Dreams Blondekrage, LME strikkeoppskrift', 'Woodland Dreams Lace Collar, LME knitting pattern')
add('ph2', 'LME STRIKKEOPPSKRIFT&nbsp;&nbsp;|&nbsp;&nbsp;WOODLAND DREAMS BLONDEKRAGE',
    'LME KNITTING PATTERN&nbsp;&nbsp;|&nbsp;&nbsp;WOODLAND DREAMS LACE COLLAR')
add('covertag', 'LME STRIKKEOPPSKRIFT - TILBEHØR', 'LME KNITTING PATTERN - ACCESSORY')
add('covertitle', 'WOODLAND DREAMS BLONDEKRAGE', 'WOODLAND DREAMS LACE COLLAR')
add('subpill', 'LME BABY COLLECTION - WOODLAND DREAMS', 'LME BABY COLLECTION - WOODLAND DREAMS')
add('cover_desc',
    'En løs, luftig blondekrage som legges over skuldrene og hektes igjen bak med én liten '
    'treknapp, ikke strikket fast i selve bodyen. Kragen legges opp langs halskanten, flares '
    'jevnt utover og avsluttes med et enkelt hullmønster og en picot-kant som gir det spinkle, '
    'blonde preget. Syv størrelser, fra 0-1 til 18-24 måneder, tilpasset halsvidden på Woodland '
    'Dreams-basisbodyen. Blondekragen er den første tilbehørsdelen i "Woodland Dreams"-kolleksjonen.',
    'A loose, airy lace collar that drapes over the shoulders and fastens at the back with one '
    'small wooden button, not knitted onto the body itself. The collar is cast on along the neck '
    'edge, flares gently outward and finishes with a simple eyelet pattern and a picot edge for '
    'the delicate, lacy look. Seven sizes, from 0-1 to 18-24 months, sized to fit the neck opening '
    'of the Woodland Dreams basisbody. The lace collar is the first accessory piece in the '
    '"Woodland Dreams" collection.')
add('by1', 'Av Renate Dahl', 'By Renate Dahl')
add('by2', 'Little Montessori Explorers', 'Little Montessori Explorers')
add('by3', 'lmexplorers.com', 'lmexplorers.com')
add('cover_tip',
    'TIPS: Les hele oppskriften og størrelsestabellen på side 4 før du starter, og strikk en '
    'prøvelapp på 15 x 15 cm for å sjekke strikkefastheten din, før du legger opp selve kragen.',
    'TIP: Read through the whole pattern and the size chart on page 4 before you start, and knit a '
    '15 x 15 cm gauge swatch to check your tension, before casting on the collar itself.')

# ---------------------------------------------------------------- SIDE 2: OM
add('banner_om', 'OM WOODLAND DREAMS BLONDEKRAGE', 'ABOUT THE WOODLAND DREAMS LACE COLLAR')
add('pill_del', 'FØRSTE TILBEHØRSDEL', 'THE FIRST ACCESSORY PIECE')
add('om_del',
    'Blondekragen er den første av seks tilbehørsdeler i LME Woodland Dreams. Den er ikke '
    'strikket fast i basisbodyen, men et eget, selvstendig plagg som legges over skuldrene og '
    'lukkes bak, akkurat som en løs krage skal. Det gjør at samme body kan style på flere måter, '
    'uten at man må strikke en helt ny plagg for hvert antrekk.',
    'The lace collar is the first of six accessory pieces in LME Woodland Dreams. It is not '
    'knitted onto the basisbody, but a separate, standalone piece that drapes over the shoulders '
    'and fastens at the back, just like a loose collar should. This means the same body can be '
    'styled in several ways, without knitting a whole new garment for every outfit.')
add('pill_stil', 'STIL', 'STYLE')
add('om_stil',
    'Skandinavisk og tidløs, med et lett, spinkelt hullmønster langs ytterkanten, ikke et tungt '
    'allover-mønster. Formen er rolig og rund, og kragen skal kjennes luftig og delikat mot huden, '
    'uten å bli et pyntedetalj som stjeler oppmerksomheten fra selve bodyen.',
    'Scandinavian and timeless, with a light, delicate eyelet pattern along the outer edge, not a '
    'heavy allover lace repeat. The shape is calm and rounded, and the collar should feel airy and '
    'delicate against the skin, without becoming a decoration that steals attention from the body '
    'itself.')
add('pill_lukking', 'LUKKES BAK', 'FASTENS AT THE BACK')
add('om_lukking',
    'Kragen legges opp litt smalere enn hele halsomkretsen, slik at det blir en åpning bak. Denne '
    'åpningen lukkes med én liten treknapp og en heklet kjedeløkke, samme prinsipp som knappeløkkene '
    'i basisbodyen. Det gjør kragen rask å ta av og på, uten å måtte dra noe over hodet på barnet.',
    'The collar is cast on slightly narrower than the full neck circumference, leaving an opening '
    'at the back. This opening closes with one small wooden button and a crocheted chain loop, the '
    'same principle as the buttonhole loops on the basisbody. This makes the collar quick to put on '
    'and take off, without pulling anything over the baby\'s head.')

# ---------------------------------------------------------------- SIDE 3: MATERIALER
add('banner_mat', 'MATERIALER', 'MATERIALS')
add('pill_garn', 'GARN', 'YARN')
add('garn_txt',
    'Sandnes Garn Alpakka (100 % alpakka), samme garn og fasthet som basisbodyen. Kragen er '
    'tilbehør, så velg en av kolleksjonens tilbehørsfarger til den, i kontrast til bodyens '
    'nøytrale farger: salvie, gammelrosa, smørgul, dueblå, oliven eller terrakotta.',
    'Sandnes Garn Alpakka (100% alpaca), the same yarn and gauge as the basisbody. The collar is an '
    "accessory, so choose one of the collection's accessory colours for it, in contrast to the "
    "body's neutral colours: sage, dusty rose, butter yellow, soft blue, olive or terracotta.")
GARNFORBRUK = [
    ('0-1 mnd', '15-20 g'), ('1-3 mnd', '16-21 g'), ('3-6 mnd', '18-23 g'),
    ('6-9 mnd', '19-24 g'), ('9-12 mnd', '20-25 g'), ('12-18 mnd', '22-27 g'),
    ('18-24 mnd', '23-28 g'),
]
add('pill_forbruk', 'GARNFORBRUK', 'YARN REQUIREMENTS')
add('forbruk_note',
    'Ca.-tall, litt avhengig av strikkefasthet. Kragen bruker lite garn, en rest fra bodyen holder '
    'ofte, dersom du velger samme farge, eller kjøp ett nøste i kontrastfargen.',
    "Approximate figures, depending a little on gauge. The collar uses very little yarn, a "
    "leftover from the body is often enough if you choose the same colour, or buy one skein in the "
    "contrast colour.")
add('pill_pinner', 'PINNER OG TILBEHØR', 'NEEDLES AND NOTIONS')
add('pinner_txt',
    'Rundpinne 4 mm, 40 cm (brukes fram og tilbake, ikke rundt, siden kragen er flat). Én liten, '
    'rund treknapp. Heklenål 3 mm til kjedeløkken bak. Synål til å feste tråder og sy på knappen. '
    'Maskemarkører er valgfritt, men kan gjøre det lettere å holde styr på de jevnt fordelte '
    'økningene i del 2.',
    'Circular needle 4 mm, 40 cm (worked back and forth, not in the round, since the collar is '
    'flat). One small, round wooden button. A 3 mm crochet hook for the chain loop at the back. A '
    'tapestry needle for weaving in ends and sewing on the button. Stitch markers are optional, but '
    'can make it easier to keep track of the evenly spaced increases in part 2.')

# ---------------------------------------------------------------- SIDE 4: STØRRELSESTABELL
add('banner_storrelse', 'STØRRELSESTABELL', 'SIZE CHART')
add('storrelse_lead',
    'Ferdige mål, målt flatt liggende. Velg størrelse etter halsvidden på basisbodyen du strikker '
    'kragen til.',
    "Finished measurements, measured lying flat. Choose size to match the neck opening of the "
    "basisbody you are knitting the collar for.")
storrelse_head = {'no': ['Størrelse', 'Halsvidde (basisbody)', 'Ytterkant, blondekant', 'Kragens dybde'],
                   'en': ['Size', 'Neck opening (basisbody)', 'Outer edge, lace border', 'Collar depth']}
add('storrelse_head', storrelse_head['no'], storrelse_head['en'])
storrelse_rows = []
for s in SIZES:
    storrelse_rows.append((s['no'], f"{s['neck_circ_cm']} cm", f"{s['outer_edge_cm']} cm",
                            f"{s['depth_cm']} cm"))
add('storrelse_rows_data', storrelse_rows)
add('storrelse_note',
    'Kragen legges opp {gap} cm smalere enn halsvidden i tabellen, denne differansen blir '
    'åpningen bak som lukkes med knapp og løkke, se del 4.'.format(gap=SIZES[0]['back_gap_cm']),
    'The collar is cast on {gap} cm narrower than the neck opening in the table, this difference '
    'becomes the opening at the back that closes with a button and loop, see part 4.'.format(gap=SIZES[0]['back_gap_cm']))

# ---------------------------------------------------------------- SIDE 5: FASTHET
add('banner_fasthet', 'STRIKKEFASTHET OG VANSKELIGHETSGRAD', 'GAUGE AND DIFFICULTY LEVEL')
add('pill_fasthet', 'FASTHET', 'GAUGE')
add('fasthet_txt',
    '22 masker og 30 rader glattstrikk = 10 x 10 cm, på pinne 4 mm, samme fasthet som '
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
    'Lett til middels. Du bør beherske glattstrikk, rillestrikk, en enkel øking (M1) og en enkel '
    'felling (r2sm), i tillegg til omslag og en picot-avfelling. Kragen er liten, så selv de nye '
    'teknikkene er raskt overstått. Du bør også kunne hekle en enkel luftmaskekjede til løkken bak.',
    'Easy to medium. You should be comfortable with stockinette stitch, garter stitch, a simple '
    'increase (M1) and a simple decrease (k2tog), as well as yarn overs and a picot bind-off. The '
    'collar is small, so even the new techniques are over quickly. You should also be able to '
    'crochet a simple chain for the loop at the back.')

# ---------------------------------------------------------------- SIDE 6: FORKORTELSER
add('banner_ord', 'FORKORTELSER', 'ABBREVIATIONS')
add('ord_lead',
    'Norske strikkeuttrykk med engelske termer ved siden av. Kragen strikkes flatt, så det brukes '
    '"rad", ikke "omgang", gjennom hele oppskriften.',
    'Norwegian knitting terms with the English terms alongside. The collar is worked flat, so '
    '"row" is used, not "round", throughout the pattern.')
ord_head = {'no': ['Norsk', 'Engelsk', 'Betyr'], 'en': ['Norwegian', 'English', 'Meaning']}
add('ord_head', ord_head['no'], ord_head['en'])
ord_rows = [
    ('r', 'K', 'rett'),
    ('vr', 'P', 'vrang'),
    ('m', 'st(s)', 'maske(r)'),
    ('rad', 'row', 'rad (kragen strikkes flatt)'),
    ('øk1 / M1', 'M1', 'øk 1 maske (ta opp tråden mellom to masker, strikk vridd rett)'),
    ('o', 'yo', 'omslag (kaster tråden rundt pinnen, gir et hull og en ekstra maske)'),
    ('r2sm', 'k2tog', 'strikk 2 rett sammen (feller 1 maske)'),
    ('rillestrikk', 'garter st', 'strikk rett på alle rader, begge sider'),
    ('fell av', 'BO', 'fell av / bind off'),
    ('picot-avfelling', 'picot BO', 'dekorativ avfelling med små tagger'),
    ('legg opp', 'CO', 'legg opp masker'),
    ('kjedemasker', 'chain sts', 'luftmasker i hekling'),
    ('heklenål', 'crochet hook', 'heklenål'),
    ('maskemarkør', 'st marker', 'maskemarkør'),
]
add('ord_rows', ord_rows)
add('pill_tips', 'TIPS', 'TIPS')
tips_no = [
    'Tell maskene dine etter økeraden i del 2, og igjen etter siste hullrad i del 3, før du '
    'starter picot-avfellingen. Det er langt lettere å rette opp der enn midt i avfellingen.',
    'Sett gjerne en maskemarkør ved hver M1-øking i del 2, det gjør det enklere å se at '
    'økningene faktisk blir jevnt fordelt.',
    'Øv på M1-økingen og picot-avfellingen på prøvelappen først, dersom du ikke har strikket det '
    'før. Begge teknikkene er enkle, men går lettere når fingrene har prøvd dem én gang.',
]
tips_en = [
    'Count your stitches after the increase row in part 2, and again after the last eyelet row in '
    'part 3, before you start the picot bind-off. It is far easier to fix a mistake there than '
    'partway through the bind-off.',
    'Consider placing a stitch marker at each M1 increase in part 2, it makes it easier to see '
    'that the increases really are evenly spaced.',
    'Practise the M1 increase and the picot bind-off on your swatch first, if you have not knitted '
    'them before. Both techniques are simple, but easier once your fingers have tried them once.',
]
add('tips', tips_no, tips_en)

# ---------------------------------------------------------------- SIDE 7: KONSTRUKSJONSOVERSIKT
add('banner_oversikt', 'SLIK ER KRAGEN BYGD OPP', 'HOW THE COLLAR IS CONSTRUCTED')
add('oversikt_lead',
    'Kragen strikkes flatt, fram og tilbake, i ett stykke. Fire enkle deler, i denne rekkefølgen:',
    'The collar is knitted flat, back and forth, in one piece. Four simple parts, in this order:')
oversikt_deler = [
    ('1. Halskant', 'Legg opp langs halskanten, minus åpningen bak, strikk en kort '
     'rillestrikk-kant for struktur.', '1. Neck edge', 'Cast on along the neck edge, minus the '
     'back opening, work a short garter stitch band for structure.'),
    ('2. Flareøkning', 'Øk jevnt fordelt over én rad, slik at kragen flarer utover fra '
     'halskanten.', '2. Flare increase', 'Increase evenly spaced over one row, so the collar '
     'flares outward from the neck edge.'),
    ('3. Blondekant', 'Strikk noen glattstrikk-rader, deretter et enkelt 2-rads hullmønster, '
     'avslutt med en picot-avfelling.', '3. Lace border', 'Work a few rows of stockinette, then a '
     'simple 2-row eyelet pattern, finish with a picot bind-off.'),
    ('4. Bakre lukking', 'Hekle en kjedeløkke i den ene bakkanten, sy en treknapp på den andre.',
     '4. Back closure', 'Crochet a chain loop at one back edge, sew a wooden button onto the '
     'other.'),
]
add('oversikt_deler_data', oversikt_deler)

# ---------------------------------------------------------------- SIDE 8: DEL 1, HALSKANT
add('banner_hals', 'DEL 1: HALSKANT', 'PART 1: THE NECK EDGE')
add('hals_lead',
    'Legg opp langs halskanten, flatt fram og tilbake (ikke rundt). Oppleggsmasketallet er '
    'regnet ut fra halsvidden i størrelsestabellen, minus åpningen bak, ganget med '
    'strikkefastheten. Strikk deretter en kort rillestrikk-kant for struktur, før flareøkingen i '
    'del 2.',
    'Cast on along the neck edge, flat, back and forth (not in the round). The cast-on stitch '
    'count is calculated from the neck opening in the size chart, minus the back opening, '
    'multiplied by the gauge. Then work a short garter stitch band for structure, before the '
    'flare increase in part 2.')
hals_head = {'no': ['Størrelse', 'Halsvidde', 'Åpning bak', 'Legg opp (masker)', 'Rader rillestrikk'],
             'en': ['Size', 'Neck opening', 'Back gap', 'Cast-on (sts)', 'Rows of garter st']}
add('hals_head', hals_head['no'], hals_head['en'])
hals_rows = []
for s in SIZES:
    hals_rows.append((s['no'], f"{s['neck_circ_cm']} cm", f"{s['back_gap_cm']} cm",
                       str(s['co_sts']), str(s['neckband_rows'])))
add('hals_rows_data', hals_rows)
add('hals_ferdig',
    'Kontroll: tell maskene dine etter oppleggingen. De skal stemme med tallet i kolonnen "Legg '
    'opp (masker)" for din størrelse, før du strikker rillestrikk-kanten og går videre til del 2.',
    'Check: count your stitches after casting on. They should match the number in the "Cast-on '
    '(sts)" column for your size, before you work the garter stitch band and move on to part 2.')

# ---------------------------------------------------------------- SIDE 9: DEL 2, FLAREØKNING
add('banner_flare', 'DEL 2: FLAREØKNING', 'PART 2: THE FLARE INCREASE')
add('flare_lead',
    'Bytt til glattstrikk. På den første raden etter rillestrikk-kanten økes det jevnt fordelt '
    'over hele raden, med øk1 (M1), slik at kragen flarer utover fra halskanten. Antall økninger '
    'og fordelingen er beregnet for hver størrelse, se tabellen under.',
    'Switch to stockinette stitch. On the first row after the garter stitch band, increase evenly '
    'spaced across the whole row, using M1, so the collar flares outward from the neck edge. The '
    'number of increases and their spacing are calculated for every size, see the table below.')
flare_head = {'no': ['Størrelse', 'Masker ved legg opp', 'Antall M1-økninger', 'Masker etter øking'],
              'en': ['Size', 'Sts at cast-on', 'Number of M1 increases', 'Sts after increase row']}
add('flare_head', flare_head['no'], flare_head['en'])
flare_rows = []
for s in SIZES:
    flare_rows.append((s['no'], str(s['co_sts']), str(s['increases']), str(s['final_sts'])))
add('flare_rows_data', flare_rows)

def flare_example_text(s, lang):
    base, extra, inc = s['seg_base'], s['seg_extra'], s['increases']
    rest = inc - extra
    if lang == 'no':
        parts = []
        if extra:
            parts.append(f'[r{base + 1}, øk1] gjentas {extra} ganger')
        if rest:
            parts.append(f'[r{base}, øk1] gjentas {rest} ganger')
        return ', deretter '.join(parts) + '.'
    else:
        parts = []
        if extra:
            parts.append(f'[k{base + 1}, M1] repeated {extra} times')
        if rest:
            parts.append(f'[k{base}, M1] repeated {rest} times')
        return ', then '.join(parts) + '.'

add('flare_metode',
    'Økeraden legges opp slik at knittene og økningene til sammen bruker nøyaktig de maskene du '
    'la opp i del 1, ingen ekstra masker knittes til slutt. For {ex_no}: {ex_txt} Etter denne ene '
    'raden har du {final} masker, se tabellen for din egen størrelse.'.format(
        ex_no='0-1 mnd', ex_txt=flare_example_text(SIZES[0], 'no'), final=SIZES[0]['final_sts']),
    'The increase row is worked so the plain stitches and the increases together use exactly the '
    'stitches you cast on in part 1, no extra stitches are knitted at the end. For {ex_en}: '
    '{ex_txt} After this one row you have {final} stitches, see the table for your own '
    'size.'.format(ex_en='0-1 months', ex_txt=flare_example_text(SIZES[0], 'en'),
                    final=SIZES[0]['final_sts']))
add('flare_note',
    'Strikk deretter {plain} glattstrikk-rader rett fram, uten øking eller felling, før du går '
    'videre til blondekanten i del 3.'.format(plain=SIZES[0]['flare_plain_rows']),
    'Then work {plain} rows of stockinette stitch straight, with no further increasing or '
    'decreasing, before moving on to the lace border in part 3.'.format(plain=SIZES[0]['flare_plain_rows']))

# ---------------------------------------------------------------- SIDE 10: DEL 3, BLONDEKANT
add('banner_blonde', 'DEL 3: BLONDEKANT', 'PART 3: THE LACE BORDER')
add('blonde_lead',
    'Nå strikkes selve hullmønsteret, et enkelt 2-rads repetisjon som gir det blonde preget, og '
    'kragen avsluttes med en picot-avfelling langs hele ytterkanten.',
    'Now the eyelet pattern itself is worked, a simple 2-row repeat that gives the lacy look, and '
    'the collar finishes with a picot bind-off along the whole outer edge.')
add('blonde_monster',
    'Hullmønster (gjentas {reps} ganger = {rows} rader totalt): Rad 1 (rettsiden): *o, r2sm* '
    'gjenta til slutt av raden. Rad 2 (vrangsiden): vrang alle masker. Fordi hvert omslag legger '
    'til én maske og hver r2sm feller én maske, holder masketallet seg helt likt gjennom hele '
    'hullmønsteret.'.format(reps=SIZES[0]['eyelet_repeats'], rows=SIZES[0]['eyelet_rows']),
    'Eyelet pattern (repeated {reps} times = {rows} rows in total): Row 1 (RS): *yo, k2tog* '
    'repeat to the end of the row. Row 2 (WS): purl all stitches. Because every yarn over adds '
    'one stitch and every k2tog removes one stitch, the stitch count stays exactly the same '
    'throughout the eyelet pattern.'.format(reps=SIZES[0]['eyelet_repeats'], rows=SIZES[0]['eyelet_rows']))
add('blonde_picot',
    'Picot-avfelling: fell av 2 m. glattstrikk. *Legg strikketråden fram mellom pinnene, legg '
    'opp 2 nye masker med tvunnet oppligg, fell så av 4 m. (de 2 nye + de neste 2 på pinnen).* '
    'Gjenta fra * til det gjenstår restmaskene fra tabellen under, fell disse av vanlig, uten '
    'picot, helt til slutt.',
    'Picot bind-off: bind off 2 sts knitwise. *Bring the yarn forward between the needles, cast '
    'on 2 new stitches using a twisted (cable) cast-on, then bind off 4 sts (the 2 new stitches + '
    'the next 2 on the needle).* Repeat from * until the remaining stitches from the table below '
    'are left, bind these off plainly, with no picot, right to the end.')
blonde_head = {'no': ['Størrelse', 'Masker ved blondekant', 'Picot-repetisjoner', 'Rest, avfelt vanlig', 'Ferdig omkrets'],
               'en': ['Size', 'Sts at lace border', 'Picot repeats', 'Remainder, bound off plain', 'Finished circumference']}
add('blonde_head', blonde_head['no'], blonde_head['en'])
blonde_rows = []
for s in SIZES:
    blonde_rows.append((s['no'], str(s['final_sts']), str(s['picot_repeats']),
                         str(s['picot_remainder']), f"{s['outer_edge_cm']} cm"))
add('blonde_rows_data', blonde_rows)

# ---------------------------------------------------------------- SIDE 11: BAKRE LUKKING
add('banner_lukking', 'BAKRE LUKKING', 'BACK CLOSURE')
add('lukking_lead',
    'De to kortendene av kragen (radenden i hver ytterkant av det flate stykket, der du startet '
    'og avsluttet hver rad) møtes bak og lukkes med én knapp og én løkke.',
    'The two short ends of the collar (the row ends on each side of the flat piece, where you '
    'started and finished each row) meet at the back and close with one button and one loop.')
lukking_steps_no = [
    'Hekle en kjede på ca. 12-15 luftmasker med heklenål 3 mm, nok til at treknappen glir '
    'igjennom uten å strekke løkken.',
    'Fest kjeden godt i den ene bakkanten av kragen, med en synål og et par ekstra sting gjennom '
    'strikketøyet, slik at løkken sitter fast.',
    'Sy en liten treknapp fast på den andre bakkanten, rett overfor løkken, med dobbel tråd og '
    'flere sting gjennom hvert hull i knappen.',
    'Prøv lukkingen: knappen skal gli lett gjennom løkken, men ikke falle ut av seg selv når '
    'kragen henger fritt.',
]
lukking_steps_en = [
    'Crochet a chain of approx. 12-15 chain stitches with a 3 mm crochet hook, enough for the '
    'wooden button to pass through without stretching the loop.',
    'Fasten the chain securely to one back edge of the collar, with a tapestry needle and a few '
    'extra stitches through the knitted fabric, so the loop stays firmly attached.',
    'Sew a small wooden button onto the other back edge, directly opposite the loop, with double '
    'thread and several stitches through each hole in the button.',
    'Test the closure: the button should slide easily through the loop, but not fall out on its '
    'own when the collar hangs freely.',
]
add('lukking_steps', lukking_steps_no, lukking_steps_en)

# ---------------------------------------------------------------- SIDE 12: MONTERING
add('banner_montering', 'MONTERING', 'FINISHING')
montering_no = [
    'Fest alle løse tråder godt på vrangen, og klipp dem korte.',
    'Sy på treknappen og fest kjedeløkken bak, se forrige side.',
    'Damp press kragen lett på vrangen, unngå å presse direkte på picot-kanten, den skal beholde '
    'formen sin.',
    'Legg kragen over skuldrene på bodyen, lukk knappen bak, og kontroller at halskanten sitter '
    'jevnt rundt hele veien.',
    'Kontroller til slutt at knappen sitter godt fast, og at ingen løse tråder eller masker kan '
    'løsne.',
]
montering_en = [
    'Weave in all loose ends securely on the wrong side, and trim them short.',
    'Sew on the wooden button and fasten the chain loop at the back, see the previous page.',
    'Lightly steam-block the collar on the wrong side, avoid pressing directly on the picot edge, '
    'it should keep its shape.',
    'Lay the collar over the shoulders of the body, close the button at the back, and check that '
    'the neck edge sits evenly all the way round.',
    'Finally, check that the button is securely attached, and that no loose threads or stitches '
    'can come undone.',
]
add('montering_steg', montering_no, montering_en)

# ---------------------------------------------------------------- SIDE 13: SIKKERHET OG STELL
add('banner_sikkerhet', 'SIKKERHET OG STELL', 'SAFETY AND CARE')
add('pill_sikkerhet', 'SIKKERHET', 'SAFETY')
sik_no = [
    'Bruk alltid en liten, godt festet knapp, og sy den fast med dobbel tråd, flere ganger gjennom '
    'hvert hull.',
    'Kontroller knappen og kjedeløkken jevnlig, spesielt etter vask, og fest dem på nytt ved '
    'første tegn til løshet.',
    'Denne oppskriften er ikke ment for barn som putter små gjenstander i munnen uten tilsyn, la '
    'aldri barnet være alene med kragen på uten oppsyn den første tiden.',
    'Kragen er et løstsittende tilbehør, ikke en del av selve bodyen, følg alltid gjeldende '
    'sikkerhetsanbefalinger for barneklær og pass på at kragen ikke kan stramme rundt halsen.',
]
sik_en = [
    'Always use one small, securely attached button, and sew it on with double thread, several '
    'times through each hole.',
    'Check the button and the chain loop regularly, especially after washing, and reattach them '
    'at the first sign of looseness.',
    'This pattern is not intended for children who put small objects in their mouth unsupervised, '
    'never leave a baby alone and unsupervised in the collar during the first while of wearing it.',
    'The collar is a loose-fitting accessory, not part of the body itself, always follow current '
    'safety recommendations for children\'s clothing and make sure the collar cannot tighten '
    'around the neck.',
]
add('sikkerhet_txt', sik_no, sik_en)
add('pill_stell', 'VASKERÅD', 'CARE INSTRUCTIONS')
add('stell_txt',
    'Håndvask forsiktig i lunkent vann med ullvask, eller maskinvask på ullprogram 30 grader. '
    'Press ut vannet, trekk picot-kanten forsiktig i fasong, og tørk liggende flatt på et '
    'håndkle. Unngå å henge kragen til tørk, alpakka kan strekke seg.',
    'Hand wash gently in lukewarm water with wool wash, or machine wash on a wool cycle at 30 '
    'degrees. Press out the water, gently ease the picot edge into shape, and dry lying flat on a '
    'towel. Avoid hanging the collar up to dry, alpaca can stretch out of shape.')

# ---------------------------------------------------------------- SIDE 14: FERDIG
add('banner_ferdig', 'FERDIG!', 'ALL DONE!')
add('ferdig_txt',
    'Gratulerer, blondekragen din er ferdig! Den er laget for å legges over Woodland Dreams-'
    'basisbodyen, og er den første av seks tilbehørsdeler i kolleksjonen.',
    'Congratulations, your lace collar is finished! It is made to be worn over the Woodland '
    'Dreams basisbody, and is the first of six accessory pieces in the collection.')
add('pill_kolleksjon', 'RESTEN AV KOLLEKSJONEN', 'THE REST OF THE COLLECTION')
kolliste_no = [
    'Basisbodyen, kolleksjonens grunnmur, en topp-ned raglan-body i glattstrikk.',
    'Rysjekrage, samme feste bak, litt mer romantisk.',
    'Peter Pan-krage, en klassisk avrundet krage.',
    'Smekke, som knytes med i-cord eller en knapp.',
    'I-cord-seler, kolleksjonens signaturdel, justerbare og krysser bak.',
    'Kort vest, med treknapper foran, brukes utenpå bodyen.',
    'Woodland Fluffy Skirt, et heklet skjørt laget for å matche bodyen.',
]
kolliste_en = [
    'The basisbody, the foundation of the collection, a top-down raglan body in stockinette '
    'stitch.',
    'Ruffle collar, the same fastening at the back, a little more romantic.',
    'Peter Pan collar, a classic rounded collar.',
    'Bib, tied with an i-cord or a button.',
    "I-cord suspenders, the collection's signature piece, adjustable and crossing at the back.",
    'Short vest, with wooden buttons at the front, worn over the body.',
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
{rosep(t('pill_del'))}
{card('<p>' + t('om_del') + '</p>')}
{sagep(t('pill_stil'))}
{card('<p>' + t('om_stil') + '</p>')}
{rosep(t('pill_lukking'))}
{cme(t('om_lukking'))}
''', 2))

    forbruk_html = '<table class="t"><tr><th>' + {'no': 'Størrelse', 'en': 'Size'}[lang] + '</th><th>' + \
        {'no': 'Garnforbruk', 'en': 'Yarn amount'}[lang] + '</th></tr>' + \
        ''.join(f'<tr><td><b>{a}</b></td><td>{b}</td></tr>' for a, b in GARNFORBRUK) + '</table>'
    pages.append(pg(f'''
{banner(t('banner_mat'))}
{rosep(t('pill_garn'))}
{card('<p>' + t('garn_txt') + '</p>')}
{sagep(t('pill_forbruk'))}
{card(forbruk_html + '<p class="small" style="margin-top:2mm">' + t('forbruk_note') + '</p>')}
{rosep(t('pill_pinner'))}
{cme(t('pinner_txt'))}
''', 3))

    st_table = '<table class="t"><tr><th>' + '</th><th>'.join(t('storrelse_head')) + '</th></tr>' + \
        ''.join(f'<tr><td><b>{a}</b></td><td>{b}</td><td>{c}</td><td>{d}</td></tr>'
                for a, b, c, d in T['storrelse_rows_data']['no']) + '</table>'
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

    hals_table = '<table class="t"><tr><th>' + '</th><th>'.join(t('hals_head')) + '</th></tr>' + \
        ''.join(f'<tr><td><b>{a}</b></td><td>{b}</td><td>{c}</td><td>{d}</td><td>{e}</td></tr>'
                for a, b, c, d, e in T['hals_rows_data']['no']) + '</table>'
    pages.append(pg(f'''
{banner(t('banner_hals'))}
<p>{t('hals_lead')}</p>
{card(hals_table)}
{cme(t('hals_ferdig'))}
''', 8))

    flare_table = '<table class="t"><tr><th>' + '</th><th>'.join(t('flare_head')) + '</th></tr>' + \
        ''.join(f'<tr><td><b>{a}</b></td><td>{b}</td><td>{c}</td><td>{d}</td></tr>'
                for a, b, c, d in T['flare_rows_data']['no']) + '</table>'
    pages.append(pg(f'''
{banner(t('banner_flare'))}
<p>{t('flare_lead')}</p>
{card(flare_table)}
{card('<p>' + t('flare_metode') + '</p>')}
{cme(t('flare_note'))}
''', 9))

    blonde_table = '<table class="t"><tr><th>' + '</th><th>'.join(t('blonde_head')) + '</th></tr>' + \
        ''.join(f'<tr><td><b>{a}</b></td><td>{b}</td><td>{c}</td><td>{d}</td><td>{e}</td></tr>'
                for a, b, c, d, e in T['blonde_rows_data']['no']) + '</table>'
    pages.append(pg(f'''
{banner(t('banner_blonde'))}
<p>{t('blonde_lead')}</p>
{card('<p>' + t('blonde_monster') + '</p>')}
{card('<p>' + t('blonde_picot') + '</p>')}
{card(blonde_table)}
''', 10))

    pages.append(pg(f'''
{banner(t('banner_lukking'))}
<p>{t('lukking_lead')}</p>
{card(steps(t('lukking_steps')))}
''', 11))

    pages.append(pg(f'''
{banner(t('banner_montering'))}
{card(steps(t('montering_steg')))}
''', 12))

    pages.append(pg(f'''
{banner(t('banner_sikkerhet'))}
{rosep(t('pill_sikkerhet'))}
{card(ul(t('sikkerhet_txt')))}
{sagep(t('pill_stell'))}
{cme(t('stell_txt'))}
''', 13))

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
''', 14))

    return pages

for lang in ('no', 'en'):
    html_doc = kit.doc(lang, T['doctitle'][lang], None, build(lang))
    out = BASE / f'blondekrage_{lang}.html'
    out.write_text(html_doc, encoding='utf-8')
    print('OK', lang, len(html_doc), 'tegn/chars')
