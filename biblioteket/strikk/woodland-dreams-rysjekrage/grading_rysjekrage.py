# -*- coding: utf-8 -*-
"""
Graderingsberegning for "Woodland Dreams Rysjekrage" (rysjekrage til
Woodland Dreams-basisbodyen).

Regner ut, fra fasthet + basisbodyens halsmål (sizes.json i
woodland-dreams-basisbody), et helt sett med maske- og radtall per
størrelse for rysjekragen. Alle tall er beregnet her, ikke frihåndstall,
og bekreftet med assert-sjekker før de skrives til sizes.json.

Kjøres med:  python3 grading_rysjekrage.py
Skriver:     sizes.json (i denne mappen)
"""
import json
import pathlib

BASE = pathlib.Path(__file__).parent
BODY_SIZES = json.loads(
    (BASE.parent / 'woodland-dreams-basisbody' / 'sizes.json').read_text(encoding='utf-8')
)

# ---------------------------------------------------------------- FASTHET
# Samme fasthet som basisbodyen: 22 m = 10 cm / 30 o = 10 cm, glattstrikk,
# pinne 4 mm, Sandnes Garn Alpakka.
STS_PER_CM = 22 / 10   # 2.2
ROWS_PER_CM = 30 / 10  # 3.0

# ---------------------------------------------------------------- KONSTRUKSJON
# Kragen strikkes flatt, fram og tilbake (åpner bak). Legges opp langs
# halskanten, minus et lite bakåpning-mellomrom som lukkes med
# knapp + løkke. Radtallene under er FASTE for alle størrelser (kragens
# dybde varierer ikke mye mellom størrelsene, det er omkretsen som endrer
# seg), det er maskeantallet som graderes.
BACK_GAP_CM = 2.5          # fast bakåpning, uavhengig av størrelse (knapp+løkke trenger ikke skaleres)
RIB_ROWS = 4                # halskant: r1 vr1 vrangbord, 4 rader
PLAIN_ROWS = 6               # glattstrikket felt, 6 rader
RUFFLE_ROW = 1                # doblingsraden (r1, tilslag / k1fb)
AFTER_ROWS = 4               # rillestrikk-rader på det doblede masketallet, 4 rader
TOTAL_ROWS = RIB_ROWS + PLAIN_ROWS + RUFFLE_ROW + AFTER_ROWS   # = 15
DEPTH_CM = round(TOTAL_ROWS / ROWS_PER_CM, 2)                   # 5.0 cm, lik for alle størrelser


def nearest_even(x):
    """Runder til nærmeste PARTALL (så vrangbord r1 vr1 går jevnt opp)."""
    n = round(x)
    if n % 2 == 0:
        return n
    lo, hi = n - 1, n + 1
    return lo if abs(x - lo) <= abs(hi - x) else hi


rows = []
for bs in BODY_SIZES:
    neck_circ = bs['neck_circ_cm']
    co_circ_cm = neck_circ - BACK_GAP_CM
    co_raw = co_circ_cm * STS_PER_CM
    co_sts = nearest_even(co_raw)

    pre_ruffle_sts = co_sts          # uendret gjennom halskant + glattstrikk-feltet
    post_ruffle_sts = pre_ruffle_sts * 2   # doblingsraden dobler masketallet nøyaktig

    worked_neck_cm = round(co_sts / STS_PER_CM + BACK_GAP_CM, 1)
    outer_circ_cm = round(post_ruffle_sts / STS_PER_CM, 1)

    rows.append({
        'no': bs['no'], 'en': bs['en'],
        'neck_circ_cm': neck_circ,
        'back_gap_cm': BACK_GAP_CM,
        'co_circ_cm': round(co_circ_cm, 1),
        'co_sts': co_sts,
        'pre_ruffle_sts': pre_ruffle_sts,
        'post_ruffle_sts': post_ruffle_sts,
        'rib_rows': RIB_ROWS,
        'plain_rows': PLAIN_ROWS,
        'ruffle_row': RUFFLE_ROW,
        'after_rows': AFTER_ROWS,
        'total_rows': TOTAL_ROWS,
        'depth_cm': DEPTH_CM,
        'worked_neck_cm': worked_neck_cm,
        'outer_circ_cm': outer_circ_cm,
    })

# ---------------------------------------------------------------- KONSISTENSSJEKK
assert len(rows) == 7, 'skal ha 7 størrelser'

for r in rows:
    # 1) CO-maskene er alltid partall (nødvendig for r1 vr1 vrangbord).
    assert r['co_sts'] % 2 == 0, f"CO-tall må være partall: {r}"
    # 2) pre-rysj-maskene er identiske med CO-maskene (ingen øking/felling
    #    i halskant- eller glattstrikk-feltet).
    assert r['pre_ruffle_sts'] == r['co_sts'], f"pre-rysj skal = CO: {r}"
    # 3) doblingsraden dobler EKSAKT masketallet.
    assert r['post_ruffle_sts'] == r['pre_ruffle_sts'] * 2, f"dobling stemmer ikke: {r}"
    # 4) radtallene summerer riktig til totalen.
    assert (r['rib_rows'] + r['plain_rows'] + r['ruffle_row'] + r['after_rows']
            == r['total_rows']), f"radsum feil: {r}"
    # 5) det opplagte halsmålet (CO/fasthet + bakåpning) skal ligge nær
    #    basisbodyens halsmål (innenfor 1 cm, pga avrunding til partall).
    assert abs(r['worked_neck_cm'] - r['neck_circ_cm']) <= 1.0, f"halsmål avviker for mye: {r}"

for a, b in zip(rows, rows[1:]):
    # 6) CO-maskene, dobling-maskene og halsmålene skal strengt øke fra
    #    størrelse til størrelse (aldri stå stille eller gå bakover).
    assert b['co_sts'] > a['co_sts'], f"CO må øke: {a['no']} -> {b['no']}"
    assert b['post_ruffle_sts'] > a['post_ruffle_sts'], f"rysj-maskene må øke: {a['no']} -> {b['no']}"
    assert b['outer_circ_cm'] > a['outer_circ_cm'], f"ytterkant må øke: {a['no']} -> {b['no']}"
    assert b['neck_circ_cm'] > a['neck_circ_cm'], f"halsmål må øke: {a['no']} -> {b['no']}"

# 7) dybden (radtallene) er lik for alle størrelser, per designvalg.
depths = {r['depth_cm'] for r in rows}
assert depths == {DEPTH_CM}, f"dybden skal være lik for alle størrelser: {depths}"

out = BASE / 'sizes.json'
out.write_text(json.dumps(rows, ensure_ascii=False, indent=2), encoding='utf-8')
print('OK, skrev', out, 'med', len(rows), 'størrelser. Alle konsistenssjekk består.')
for r in rows:
    print(f"  {r['no']:>9s}: hals {r['neck_circ_cm']}cm -> CO {r['co_sts']} m, "
          f"rysj {r['post_ruffle_sts']} m, ytterkant {r['outer_circ_cm']} cm, "
          f"dybde {r['depth_cm']} cm")
