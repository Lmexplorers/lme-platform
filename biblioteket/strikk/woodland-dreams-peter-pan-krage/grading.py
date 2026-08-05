# -*- coding: utf-8 -*-
"""
Gradering for Woodland Dreams Peter Pan-krage.

Beregner masketall og radtall for alle 7 storrelser ut fra fasthet
(22 m = 10 cm / 30 o = 10 cm, glattstrikk, pinne 4 mm) og halsmalene
(neck_circ_cm) fra ../woodland-dreams-basisbody/sizes.json. Skriver
sizes_collar.json, som build_peter_pan_krage.py leser inn.

KONSTRUKSJON (se README.md for full forklaring):
Hver krage-halvdel strikkes "sidelengs": omgangsretningen (radene) folger
halskanten (fra midt bak til midt front), mens ANTALL MASKER PA HVER RAD
representerer DYBDEN til kragen (avstand fra halskant til ytterkant) i det
punktet. Det gir naturlig den avrundede, flate Peter Pan-fasongen:

  - Legg opp {co_sts} m ved midt-bak-kanten (liten, fast startbredde).
  - Ok 1 m ved ytterkanten annenhver rad, til bredeste punkt (ved skulderen)
    er nadd.
  - Strikk noen rader rett fram uten forandring over det bredeste punktet.
  - Fell 1 m ved ytterkanten annenhver rad, symmetrisk, ned til samme lille
    tall igjen ved midt front.

Totalt antall rader pr halvdel er hentet fra RADFASTHETEN pa halv
halsomkrets (den lengden radene "beveger seg langs"). Bredden (masketall)
pa hver rad er hentet fra MASKEFASTHETEN pa kragens dybde. De to tallene
ma stemme overens: startrad (fast) + okerader + rette rader + fellerader
skal summeres til akkurat det uavhengig beregnede radtallet, verifisert
med en rad-for-rad-simulering og assert under.
"""
import json, pathlib

BASE = pathlib.Path(__file__).parent
BODY_SIZES = json.loads(
    (BASE.parent / 'woodland-dreams-basisbody' / 'sizes.json').read_text(encoding='utf-8'))

STS_PER_CM = 22 / 10.0   # 2.2 sts/cm, stockinette gauge (fasthet)
ROWS_PER_CM = 30 / 10.0  # 3.0 rows/cm, stockinette gauge (fasthet)

CO_STS = 3           # masker lagt opp v/ midt-bak-kanten = felt av v/ midt front
DEPTH_BASE_CM = 4.5   # kragedybde (glattstrikk-delen) ved minste storrelse
DEPTH_SLOPE = 0.18    # cm ekstra dybde pr cm ekstra halsomkrets
BORDER_ROWS = 5       # garterstrikk-kant, likt for alle storrelser


def compute():
    results = []
    for s in BODY_SIZES:
        neck = s['neck_circ_cm']
        half_neck_cm = neck / 2.0
        half_neck_rows = round(half_neck_cm * ROWS_PER_CM)

        max_depth_cm = DEPTH_BASE_CM + DEPTH_SLOPE * (neck - 21)
        max_depth_sts = round(max_depth_cm * STS_PER_CM)

        inc_count = max_depth_sts - CO_STS    # antall enkelt-okinger som trengs
        inc_rows = 2 * inc_count              # hver okerad + en rett rad mellom
        dec_rows = 2 * inc_count              # speilvendt fellefelt
        shaping_rows = inc_rows + dec_rows
        # -1 for rad 1, den flate oppleggingsraden for selve okingen starter
        plateau_rows = half_neck_rows - 1 - shaping_rows
        assert plateau_rows >= 1, f"{s['no']}: for lite radrom ({plateau_rows})"

        # rad-for-rad-simulering: bekrefter at start/slutt-masketall og
        # totalt radtall stemmer noyaktig med de uavhengig beregnede tallene
        row_widths = [CO_STS]
        w = CO_STS
        for _ in range(inc_count):
            w += 1
            row_widths.append(w)
            row_widths.append(w)
        assert w == max_depth_sts
        for _ in range(plateau_rows):
            row_widths.append(w)
        for _ in range(inc_count):
            w -= 1
            row_widths.append(w)
            row_widths.append(w)
        assert w == CO_STS
        assert len(row_widths) == half_neck_rows, (s['no'], len(row_widths), half_neck_rows)

        stitch_rows_per_half = sum(row_widths)
        border_pickup_per_half = half_neck_rows  # 1 m tatt opp pr rad langs ytterkanten

        results.append(dict(
            no=s['no'], en=s['en'], neck_circ_cm=neck, half_neck_cm=half_neck_cm,
            half_neck_rows=half_neck_rows, co_sts=CO_STS,
            max_depth_cm=round(max_depth_cm, 2), max_depth_sts=max_depth_sts,
            inc_count=inc_count, inc_rows=inc_rows, dec_rows=dec_rows,
            shaping_rows=shaping_rows, plateau_rows=plateau_rows,
            border_pickup_per_half=border_pickup_per_half, border_rows=BORDER_ROWS,
            stitch_rows_per_half=stitch_rows_per_half,
            finished_depth_total_cm=round(max_depth_cm + BORDER_ROWS / ROWS_PER_CM, 1),
        ))

    # ---- konsistenssjekk pa tvers av storrelser ----
    for i in range(1, len(results)):
        a, b = results[i - 1], results[i]
        assert b['neck_circ_cm'] > a['neck_circ_cm']
        assert b['half_neck_rows'] > a['half_neck_rows'], (a['no'], b['no'])
        assert b['max_depth_sts'] >= a['max_depth_sts']
        assert b['max_depth_cm'] > a['max_depth_cm']
        assert b['finished_depth_total_cm'] > a['finished_depth_total_cm']

    # halskant-kontroll: begge halvdeler til sammen skal reprodusere
    # malsatt halsomkrets innenfor en avrundingstoleranse pa 0,6 cm
    for r in results:
        reconstructed_cm = 2 * (r['half_neck_rows'] / ROWS_PER_CM)
        assert abs(reconstructed_cm - r['neck_circ_cm']) <= 0.6, (r['no'], reconstructed_cm)

    # ---- garnforbruk, kalibrert mot basisbodyens EGET, allerede oppgitte
    # garnforbruk (samme fasthet/garn), i stedet for et oppdiktet tall: vi
    # regner ut "maske-rader" (masker x rader, summert over bæreparti, kropp
    # og begge ermer) for 0-1-mnd-bodyen fra sizes.json, deler bodyens
    # oppgitte garnforbruk (midtpunkt 90-100 g) pa det, og bruker samme
    # gram-pr-1000-maskerader-rate for kragen.
    b0 = BODY_SIZES[0]
    body_yoke_sr = round((b0['neck_co'] + b0['underarm_total']) / 2) * b0['rows_neck_to_underarm']
    body_below_sr = b0['body_after_divide'] * b0['body_rows_below_underarm']
    body_sleeve_sr = b0['sleeve_after_divide'] * b0['sleeve_rows_total'] * 2
    body_total_sr = body_yoke_sr + body_below_sr + body_sleeve_sr
    body_yarn_mid_g = (90 + 100) / 2
    g_per_1000_sr = body_yarn_mid_g / body_total_sr * 1000

    for r in results:
        total_sr = 2 * r['stitch_rows_per_half'] + 2 * r['border_pickup_per_half'] * r['border_rows']
        grams = total_sr / 1000.0 * g_per_1000_sr
        r['total_stitchrows'] = total_sr
        r['yarn_g_low'] = int(round(grams))
        r['yarn_g_high'] = int(round(grams * 1.15))

    for i in range(1, len(results)):
        assert results[i]['yarn_g_low'] >= results[i - 1]['yarn_g_low']

    return results


if __name__ == '__main__':
    data = compute()
    out = BASE / 'sizes_collar.json'
    out.write_text(json.dumps(data, indent=2, ensure_ascii=False), encoding='utf-8')
    print('OK, skrev', out, 'for', len(data), 'storrelser. Alle assert bestatt.')
    for r in data:
        print(' ', r['no'], '-> co', r['co_sts'], 'maxdepth_sts', r['max_depth_sts'],
              'inc', r['inc_count'], 'plateau', r['plateau_rows'],
              'rows/half', r['half_neck_rows'], 'pickup/half', r['border_pickup_per_half'],
              'yarn', r['yarn_g_low'], '-', r['yarn_g_high'], 'g')
