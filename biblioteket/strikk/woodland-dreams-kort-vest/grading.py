# -*- coding: utf-8 -*-
"""Graderingsberegning for "Woodland Dreams Kort Vest".

Beregner ALLE masketall/omgangstall for de 7 størrelsene fra:
  - fasthet (22 m = 10 cm / 30 o = 10 cm)
  - basisbodyens egne, verifiserte mål i ../woodland-dreams-basisbody/sizes.json
    (chest_cm, neck_circ_cm, body_length_cm, sleeve_after_divide)
  - noen få uttalte, forklarte konstanter (ekstra vidde, halskant-luft,
    lengdeforhold til bodyen, hvor mye av bodyens ermeomkrets
    ermehullet skal romme)

Ingen tall er frihåndstall. Kjøres direkte for å skrive sizes_vest.json,
med interne assert-sjekk som garanterer at alt stemmer overens (se
README.md for forklaring av selve metoden og hvilke feil som ble
funnet og rettet underveis).

    python3 grading.py
"""
import json
import math
import pathlib

BASE = pathlib.Path(__file__).parent
BODY_SIZES = json.loads(
    (BASE.parent / 'woodland-dreams-basisbody' / 'sizes.json').read_text(encoding='utf-8')
)

# ---------------------------------------------------------------- KONSTANTER
GAUGE_STS_CM = 22 / 10     # 2.2 masker/cm, 22 m = 10 cm
GAUGE_ROW_CM = 30 / 10     # 3.0 omg/cm, 30 o = 10 cm

# Vesten strikkes UTENPÅ bodyen, så den trenger litt ekstra vidde utover
# bodyens egen (allerede romslige) brystvidde, slik at den ikke klemmer
# laget under.
EASE_EXTRA_CM = 3.0

# Vestens halsåpning får litt luft utover bodyens egen halsvidde, siden
# vesten skal gå utenpå (og eventuelt over en krage). Fronten er dessuten
# helt åpen hele veien, så halsen trenger IKKE strekke seg over hodet slik
# bodyens lukkede halsribb må, derfor bruker vi ingen sammentrekningsfaktor
# her (i motsetning til bodyens 0,82-faktor for vrangbord).
NECK_EASE_CM = 1.0

# Kort vest skal tydelig være kortere enn bodyen. 55 % av bodyens egen
# hals-til-skritt-lengde gir en vest som stopper godt over midjen/skrittet,
# og som samtidig har nok lengde til et ordentlig, rett stykke nedenfor
# ermehullene (ikke bare et bæreparti), se README.md for begrunnelse av
# akkurat dette forholdstallet.
LENGTH_RATIO = 0.55

# Ermehullet (antall avfelte masker på hver side ved delingen) beregnes som
# en andel av bodyens EGEN ermeomkrets rett under armen (sleeve_after_divide
# fra basisbodyens sizes.json), omregnet til cm. Ermehullet er en åpning,
# ikke et rør, så det trenger ikke romme hele ermeomkretsen, bare være stort
# nok til at bodyens erme går fint gjennom sammen med bæret over. 0,6 gir en
# avfelt bredde på 57-64 % av bodyens ermeomkrets over alle 7 størrelser,
# se kontroll-utskriften nederst i dette skriptet.
ARMHOLE_FACTOR = 0.6

HEM_BORDER_ROWS = 6     # omg. matstrikk i legg-kanten
NECK_BORDER_ROWS = 4    # omg. matstrikk i halskanten, før bæreøkingen starter


def round_half_up(x):
    return math.floor(x + 0.5)


def round_even(x):
    """Nærmeste partall, uavgjort rundes opp."""
    base = math.floor(x)
    cands = sorted({base + d for d in (-3, -2, -1, 0, 1, 2, 3) if (base + d) % 2 == 0})
    cands.sort(key=lambda c: (abs(c - x), -c))
    return cands[0]


def compute():
    results = []
    prev_N = None
    for s in BODY_SIZES:
        chest_cm = s['chest_cm']
        neck_circ_cm = s['neck_circ_cm']
        body_length_cm = s['body_length_cm']
        sleeve_after_divide = s['sleeve_after_divide']

        # ---- brystvidde og de tre delene (front-venstre, bak, front-høyre) ----
        vest_chest_target_cm = chest_cm + EASE_EXTRA_CM
        raw_total = vest_chest_target_cm * GAUGE_STS_CM
        # Rundes til nærmeste multiplum av 4, slik at bak (halvparten) og
        # hver front (fjerdedel) alltid blir hele tall.
        total_sts_hem = round_half_up(raw_total / 4) * 4
        back_sts = total_sts_hem // 2
        front_each = (total_sts_hem - back_sts) // 2
        assert front_each * 2 + back_sts == total_sts_hem
        vest_chest_finished_cm = round(total_sts_hem / GAUGE_STS_CM, 1)

        # ---- ermehull (avfelte masker på hver side ved delingen) ----
        sleeve_cm = sleeve_after_divide / GAUGE_STS_CM
        armhole_sts = round_even(sleeve_cm * ARMHOLE_FACTOR * GAUGE_STS_CM)

        # ---- bæreparti-bredde rett før deling (masker på pinnen, FØR
        # ermehullene felles av) = de tre ferdige delene + de to
        # ermehullene som skal felles av ----
        target = front_each * 2 + back_sts + 2 * armhole_sts
        rf_final = front_each + armhole_sts // 2   # front-høyre/venstre ved delingen
        back_final = back_sts + armhole_sts        # bak ved delingen
        assert rf_final * 2 + back_final == target

        # ---- halsoppligg og økeomganger, regnet TILBAKE fra bæremålet
        # (rf_final/back_final), ikke antatt, akkurat slik bodyens README
        # beskriver at bodyens egen startfordeling måtte regnes ----
        vest_neck_cm = neck_circ_cm + NECK_EASE_CM
        vest_neck_sts_est = round_half_up(vest_neck_cm * GAUGE_STS_CM)
        diff = target - vest_neck_sts_est
        N = round_half_up(diff / 8)
        if prev_N is not None and N < prev_N:
            N = prev_N  # øke-omgangene skal aldri bli færre i en større størrelse
        prev_N = N

        front_each_co = rf_final - 2 * N
        back_neck_co = back_final - 4 * N
        neck_co_actual = 2 * front_each_co + back_neck_co
        assert neck_co_actual == target - 8 * N
        assert front_each_co >= 1 and back_neck_co >= 1, s['no']

        yoke_shaping_rows = 2 * N
        yoke_rows_total = NECK_BORDER_ROWS + yoke_shaping_rows

        # ---- lengde ----
        vest_length_cm = round(round(body_length_cm * LENGTH_RATIO * 2) / 2, 1)
        rows_total = round_half_up(vest_length_cm * GAUGE_ROW_CM)
        panel_rows = rows_total - yoke_rows_total
        panel_plain_rows = panel_rows - HEM_BORDER_ROWS
        assert panel_rows > HEM_BORDER_ROWS, (s['no'], panel_rows)
        assert panel_plain_rows >= 1, (s['no'], panel_plain_rows)

        buttons = 3 if s['no'] in ('0-1 mnd', '1-3 mnd', '3-6 mnd') else 4
        band_pickup = round_half_up(rows_total * 0.75)
        arm_side_pickup = round_half_up(yoke_shaping_rows * 0.75)
        armhole_pickup = armhole_sts + 2 * arm_side_pickup

        results.append(dict(
            no=s['no'], en=s['en'],
            chest_cm=chest_cm, vest_chest_target_cm=round(vest_chest_target_cm, 1),
            vest_chest_finished_cm=vest_chest_finished_cm, total_sts_hem=total_sts_hem,
            front_each=front_each, back_sts=back_sts, armhole_sts=armhole_sts,
            sleeve_after_divide=sleeve_after_divide,
            target_underarm=target, rf_final=rf_final, back_final=back_final,
            neck_circ_cm=neck_circ_cm, vest_neck_cm=vest_neck_cm,
            neck_co=neck_co_actual, front_each_co=front_each_co, back_neck_co=back_neck_co,
            inc_rows=N, yoke_shaping_rows=yoke_shaping_rows, yoke_rows_total=yoke_rows_total,
            body_length_cm=body_length_cm, length_ratio=round(vest_length_cm / body_length_cm, 3),
            vest_length_cm=vest_length_cm, rows_total=rows_total,
            panel_rows=panel_rows, panel_plain_rows=panel_plain_rows,
            hem_border_rows=HEM_BORDER_ROWS, neck_border_rows=NECK_BORDER_ROWS,
            buttons=buttons, band_pickup_sts=band_pickup, armhole_pickup_sts=armhole_pickup,
        ))
    return results


def verify(results):
    def strictly_increasing(key):
        return all(results[i][key] < results[i + 1][key] for i in range(len(results) - 1))

    def non_decreasing(key):
        return all(results[i][key] <= results[i + 1][key] for i in range(len(results) - 1))

    for key in ('total_sts_hem', 'front_each', 'back_sts', 'vest_chest_finished_cm',
                'vest_length_cm', 'rows_total', 'neck_circ_cm', 'vest_neck_cm'):
        assert strictly_increasing(key), f'{key} skal strengt øke størrelse for størrelse'
    for key in ('armhole_sts', 'inc_rows', 'yoke_rows_total'):
        assert non_decreasing(key), f'{key} skal aldri bli mindre'

    for r in results:
        ratio = r['armhole_sts'] / r['sleeve_after_divide']
        assert 0.45 <= ratio <= 0.8, (r['no'], 'ermehull ute av rimelig forhold til erme', ratio)
        assert r['panel_plain_rows'] >= 1
        assert r['front_each_co'] >= 1 and r['back_neck_co'] >= 1
        assert r['neck_co'] == 2 * r['front_each_co'] + r['back_neck_co']
        assert r['rf_final'] * 2 + r['back_final'] == r['target_underarm']
        assert r['front_each'] * 2 + r['back_sts'] == r['total_sts_hem']
        assert r['rf_final'] - r['armhole_sts'] // 2 == r['front_each']
        assert r['back_final'] - r['armhole_sts'] == r['back_sts']
    print('Alle konsistenssjekk OK for', len(results), 'størrelser.')


if __name__ == '__main__':
    res = compute()
    verify(res)
    out = BASE / 'sizes_vest.json'
    out.write_text(json.dumps(res, ensure_ascii=False, indent=2), encoding='utf-8')
    print('Skrev', out)
    for r in res:
        print(r['no'], 'brystvidde', r['vest_chest_finished_cm'], 'cm /',
              r['total_sts_hem'], 'm | lengde', r['vest_length_cm'], 'cm /',
              r['rows_total'], 'omg | ermehull', r['armhole_sts'], 'm | halsoppl.',
              r['neck_co'], 'm')
