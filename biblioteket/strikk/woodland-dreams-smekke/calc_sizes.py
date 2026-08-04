# -*- coding: utf-8 -*-
"""
Beregner og verifiserer alle masketall/omgangstall for Smekke (bib), del av
LME Woodland Dreams-kolleksjonen. Leser neck_circ_cm og chest_cm fra
basisbodyens sizes.json (samme fasthet, samme 7 størrelser), og skriver
en fullstendig, verifisert sizes.json for smekken i denne mappen.

Ingen tall er frihåndsskrevet. Alt er beregnet fra fasthet (22 m/10 cm,
30 o/10 cm) og de to inngangsmålene, med `assert`-kontroller som sikrer at
tallene stemmer overens internt, på samme måte som basisbodyens
grading-script.

Konstruksjon (se README.md for full forklaring):
  1. Legg opp øverst (halskant), flatt, fram og tilbake.
  2. Rettbord (garter) i BORDER_ROWS_TOP omganger.
  3. Øk 1 m innenfor kanten på hver side, hver rad (INC_EVERY=1), til
     bredeste punkt (brystdekket) er nådd.
  4. Rettstrikk rett fram (uten øking/felling) i STRAIGHT_ROWS rader.
  5. Rund av de to nedre hjørnene: fell 1 m innenfor kanten på hver side,
     hver rad, i TAPER_ROWS rader.
  6. Rettbord i BORDER_ROWS_BOTTOM omganger, fell av rett.

Kanten (BORDER_STS masker på hver side) strikkes i rettstrikk/garter
gjennom hele plagget, uavhengig av seksjon, for en flat, ikke-rullende
kant. Feltingen/økingen skjer ALLTID rett innenfor disse kantmaskene.
"""
import json, pathlib

BASE = pathlib.Path(__file__).parent
BODY_SIZES = json.loads(
    (BASE.parent / 'woodland-dreams-basisbody' / 'sizes.json').read_text(encoding='utf-8')
)

# ---------------------------------------------------------------- FASTHET
GAUGE_STS_CM = 22 / 10   # 2.2 m/cm
GAUGE_ROWS_CM = 30 / 10  # 3.0 rader/cm

# ---------------------------------------------------------------- FORHOLDSTALL (designvalg, forklart i README)
TOP_FRACTION = 0.45   # øverste oppleggskant = 45 % av halsomkretsen (fremre halskant)
WIDTH_RATIO = 0.60    # bredeste punkt = 60 % av brystomkretsen (innenfor 55-65 %-intervallet)
LENGTH_RATIO = 0.42   # ferdig lengde = 42 % av brystomkretsen

BORDER_STS = 3          # rettstrikk-kant, masker på HVER side, strikkes gjennom hele plagget
BORDER_ROWS_TOP = 4     # rader rettstrikk rett etter oppfelling, før økingen starter
BORDER_ROWS_BOTTOM = 4  # rader rettstrikk rett etter hjørnerundingen, før avfelling
TAPER_ROWS = 4          # hjørneavrunding: felle 1 m på hver side, hver rad, i så mange rader
INC_EVERY = 1            # øk 1 m på hver side HVER rad (jevn diagonal kant)

TIE_EXTRA_CM = 7        # ekstra lengde pr. i-cord-knytebånd, til selve sløyfeknuten


def even(x):
    """Runder til nærmeste partall (symmetrisk øking/felling på begge sider)."""
    n = round(x)
    return n if n % 2 == 0 else n + 1


def build_size(s):
    neck = s['neck_circ_cm']
    chest = s['chest_cm']

    top_co = even(neck * TOP_FRACTION * GAUGE_STS_CM)
    widest_sts = even(chest * WIDTH_RATIO * GAUGE_STS_CM)
    assert widest_sts > top_co, f"{s['no']}: bredeste punkt må være bredere enn oppleggingen"
    assert (widest_sts - top_co) % 2 == 0, f"{s['no']}: øking må gi et helt antall par"

    inc_rows_count = (widest_sts - top_co) // 2
    inc_section_rows = inc_rows_count * INC_EVERY
    assert top_co + 2 * inc_rows_count == widest_sts

    bottom_sts = widest_sts - 2 * TAPER_ROWS
    assert bottom_sts + 2 * TAPER_ROWS == widest_sts
    assert bottom_sts > 2 * BORDER_STS, f"{s['no']}: for få masker igjen etter hjørneavrunding"

    length_cm = round(chest * LENGTH_RATIO, 1)
    total_rows = round(length_cm * GAUGE_ROWS_CM)

    straight_rows = total_rows - BORDER_ROWS_TOP - inc_section_rows - TAPER_ROWS - BORDER_ROWS_BOTTOM
    assert straight_rows >= 4, f"{s['no']}: for få rette rader igjen ({straight_rows})"
    assert (BORDER_ROWS_TOP + inc_section_rows + straight_rows + TAPER_ROWS
            + BORDER_ROWS_BOTTOM) == total_rows

    top_edge_cm = round(top_co / GAUGE_STS_CM, 1)
    widest_cm = round(widest_sts / GAUGE_STS_CM, 1)
    bottom_cm = round(bottom_sts / GAUGE_STS_CM, 1)
    chest_ratio = round(widest_cm / chest, 3)
    assert 0.50 <= chest_ratio <= 0.68, f"{s['no']}: brystdekke-forhold {chest_ratio} utenfor 55-65%-intervallet"

    remaining_neck_cm = neck - top_edge_cm
    tie_length_cm = round(remaining_neck_cm / 2 + TIE_EXTRA_CM)

    # grovt garnforbruk, skalert etter areal (trapesformel i maske-rader)
    area = (top_co + widest_sts) / 2 * total_rows
    yarn_g_mid = round(area * 0.0103)
    yarn_low = max(15, yarn_g_mid - 5)
    yarn_high = yarn_g_mid + 5

    return dict(
        no=s['no'], en=s['en'], neck_circ_cm=neck, chest_cm=chest,
        top_co=top_co, top_edge_cm=top_edge_cm,
        border_sts=BORDER_STS,
        border_rows_top=BORDER_ROWS_TOP,
        inc_rows_count=inc_rows_count, inc_section_rows=inc_section_rows,
        widest_sts=widest_sts, widest_cm=widest_cm, chest_ratio=chest_ratio,
        straight_rows=straight_rows,
        taper_rows=TAPER_ROWS, bottom_sts=bottom_sts, bottom_cm=bottom_cm,
        border_rows_bottom=BORDER_ROWS_BOTTOM,
        total_rows=total_rows, length_cm=length_cm,
        tie_length_cm=tie_length_cm,
        yarn_g_low=yarn_low, yarn_g_high=yarn_high,
    )


SIZES = [build_size(s) for s in BODY_SIZES]

# ---------------------------------------------------------------- KRYSSKONTROLLER PÅ TVERS AV STØRRELSER
# De egentlige størrelsesbærende maske-/radtallene skal øke strengt fra
# størrelse til størrelse.
for key in ('widest_sts', 'bottom_sts', 'total_rows', 'length_cm', 'yarn_g_low', 'yarn_g_high'):
    vals = [s[key] for s in SIZES]
    assert all(b > a for a, b in zip(vals, vals[1:])), f'{key} øker ikke strengt: {vals}'

# top_co og tie_length_cm tillates å gjenta seg mellom naboer (avrunding til
# partall / hele cm), akkurat som neck_co i basisbodyen, men skal aldri gå NED.
for key in ('top_co', 'tie_length_cm'):
    vals = [s[key] for s in SIZES]
    assert all(b >= a for a, b in zip(vals, vals[1:])), f'{key} synker: {vals}'

if __name__ == '__main__':
    out = BASE / 'sizes.json'
    out.write_text(json.dumps(SIZES, ensure_ascii=False, indent=2), encoding='utf-8')
    print('OK, skrev', out, '(' + str(len(SIZES)) + ' størrelser)')
    for s in SIZES:
        print(f"{s['no']:>10s}  top_co={s['top_co']:>3d}  widest={s['widest_sts']:>3d}  "
              f"bottom={s['bottom_sts']:>3d}  rows={s['total_rows']:>3d}  "
              f"len={s['length_cm']:>5.1f}cm  tie={s['tie_length_cm']:>2d}cm  "
              f"yarn={s['yarn_g_low']}-{s['yarn_g_high']}g")
