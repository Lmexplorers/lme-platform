# -*- coding: utf-8 -*-
"""
Woodland Fluffy Skirt, graderingsberegning.

Skriver sizes.json for alle 16 størrelser. Fasthet 20 staver = 10 cm
(2,0 st/cm), 30 omganger = 15 cm (2,0 o/cm), heklenål 4 mm, Sandnes Garn
Alpakka. Topp-ned: elastisk linning, A-fasong kropp i stav med jevne
økeomganger, deretter volangdelen.

Volangdelen ble omarbeidet fra ÉN stor volang til FLERE volanglag
(TIER_COUNT, se under), etter tilbakemelding om at skjørtet skulle ha
"flere volanger" i stedet for én. Sluttresultatet (masketall og
omgangstall for hele skjørtet, altså midjemål, skjørtlengde og
sluttvidden ved fanget hem_sts) er UENDRET fra den opprinnelige
enkelt-volang-versjonen. Det som er nytt er at veksten fra
body_target_sts til hem_sts nå skjer i TIER_COUNT egne
multipliseringsomganger med noen glattstrikk-/stavomganger imellom, i
stedet for i én omgang, slik at skjørtet får flere synlige, kaskaderende
volanglag (som ekte sukkerspinn) i stedet for én stor.

Kjøres med:  python3 grading_skirt.py
Skriver:     sizes.json (i denne mappen)
"""
import json
import pathlib

BASE = pathlib.Path(__file__).parent

GAUGE_ST_CM = 20 / 10   # 2.0 staver/cm
GAUGE_RND_CM = 30 / 15  # 2.0 omganger/cm

# (no, en, waist_actual_cm, skirt_length_cm)
RAW_SIZES = [
    ("Prematur",    "Preemie",     32, 13),
    ("Nyfødt",      "Newborn",     34, 14),
    ("0-3 mnd",     "0-3 mo",      36, 15),
    ("3-6 mnd",     "3-6 mo",      38, 16),
    ("6-9 mnd",     "6-9 mo",      40, 17),
    ("9-12 mnd",    "9-12 mo",     42, 18),
    ("1-2 år",      "1-2 yr",      46, 20),
    ("2-3 år",      "2-3 yr",      49, 22),
    ("3-4 år",      "3-4 yr",      52, 24),
    ("4-5 år",      "4-5 yr",      54, 26),
    ("5-6 år",      "5-6 yr",      56, 28),
    ("6-8 år",      "6-8 yr",      58, 30),
    ("8-10 år",     "8-10 yr",     61, 32),
    ("10-12 år",    "10-12 yr",    64, 34),
    ("12-14 år",    "12-14 yr",    67, 36),
    ("14-16 år",    "14-16 yr",    70, 38),
]

WAIST_EASE_FACTOR = 0.92          # linningen heklet 92% av midjemål, strekker seg over strikk
HEM_MULTIPLIER = 2.6              # samlet volang-vekst, kropp -> ferdig hemvidde (uendret fra før)
INC_ROUNDS_TARGET_GROWTH = 1.55   # kroppen (over linning, under volangene) vokser til dette x linningmål
TIER_COUNT = 3                    # antall separate volanglag ("flere volanger")


def compute_base(waist, length, prev_waist_sts):
    waist_sts = round(waist * WAIST_EASE_FACTOR * GAUGE_ST_CM)
    waist_sts = waist_sts - (waist_sts % 4)
    if waist_sts <= prev_waist_sts:
        waist_sts = prev_waist_sts + 4

    body_target_sts = round(waist_sts * INC_ROUNDS_TARGET_GROWTH)
    body_target_sts = body_target_sts - (body_target_sts % 4)
    total_inc_sts = body_target_sts - waist_sts
    inc_per_round = 4
    n_inc_rounds = total_inc_sts // inc_per_round
    body_target_sts = waist_sts + n_inc_rounds * inc_per_round

    hem_sts = round(body_target_sts * HEM_MULTIPLIER)
    hem_sts = hem_sts - (hem_sts % 4)

    linning_rounds = 4
    total_rounds = round(length * GAUGE_RND_CM)
    remaining_after_linning = total_rounds - linning_rounds
    body_plain_rounds = round(remaining_after_linning * 0.55)
    hem_rounds = remaining_after_linning - body_plain_rounds
    if hem_rounds < 3:
        hem_rounds = 3
        body_plain_rounds = remaining_after_linning - hem_rounds

    return dict(
        waist_sts=waist_sts, body_target_sts=body_target_sts,
        n_inc_rounds=n_inc_rounds, hem_sts=hem_sts,
        linning_rounds=linning_rounds, body_plain_rounds=body_plain_rounds,
        hem_rounds=hem_rounds, total_rounds=total_rounds,
    )


def compute_tiers(body_target_sts, hem_sts, hem_rounds):
    """Fordeler veksten fra body_target_sts til hem_sts over TIER_COUNT
    multipliseringsomganger (ett synlig volanglag hver), med noen vanlige
    stavomganger imellom. Siste lag lander alltid nøyaktig på hem_sts."""
    per_tier_factor = (hem_sts / body_target_sts) ** (1.0 / TIER_COUNT)

    sts = body_target_sts
    end_targets = []
    for i in range(TIER_COUNT - 1):
        nxt = round(sts * per_tier_factor)
        nxt = nxt - (nxt % 4)
        if nxt <= sts:
            nxt = sts + 4
        end_targets.append(nxt)
        sts = nxt
    end_targets.append(hem_sts)

    remaining = hem_rounds - TIER_COUNT   # 1 multipliseringsomgang pr lag
    assert remaining >= TIER_COUNT, f"for få omganger til {TIER_COUNT} volanglag (hem_rounds={hem_rounds})"
    base = remaining // TIER_COUNT
    extra = remaining % TIER_COUNT
    plain_rounds_list = [base] * TIER_COUNT
    # gi eventuelle ekstra-omganger til de SISTE lagene, slik at det luftige
    # fallet blir tydeligst nærmest fanget
    for i in range(extra):
        plain_rounds_list[TIER_COUNT - 1 - i] += 1

    tiers = []
    prev = body_target_sts
    for i, end_sts in enumerate(end_targets):
        tiers.append(dict(
            tier=i + 1, start_sts=prev, end_sts=end_sts,
            plain_rounds=plain_rounds_list[i],
        ))
        prev = end_sts

    assert sum(t['plain_rounds'] for t in tiers) + TIER_COUNT == hem_rounds
    assert tiers[-1]['end_sts'] == hem_sts
    for a, b in zip(tiers, tiers[1:]):
        assert b['start_sts'] == a['end_sts']
        assert b['end_sts'] > b['start_sts']
    return tiers


rows = []
prev_waist_sts = 0
for no, en, waist, length in RAW_SIZES:
    base = compute_base(waist, length, prev_waist_sts)
    prev_waist_sts = base['waist_sts']
    tiers = compute_tiers(base['body_target_sts'], base['hem_sts'], base['hem_rounds'])
    rows.append(dict(
        no=no, en=en, waist_actual_cm=waist, skirt_length_cm=length,
        n_ruffle_tiers=TIER_COUNT, tiers=tiers,
        **base,
    ))

# ---------------------------------------------------------------- KONSISTENSSJEKK
waists = [r['waist_sts'] for r in rows]
assert waists == sorted(waists) and len(set(waists)) == 16, "waist sts not strictly increasing/unique!"
lengths = [r['skirt_length_cm'] for r in rows]
assert lengths == sorted(lengths), "lengths not increasing"
for r in rows:
    assert r['waist_sts'] % 4 == 0
    assert r['body_target_sts'] == r['waist_sts'] + r['n_inc_rounds'] * 4
    assert r['hem_sts'] % 4 == 0
    assert r['hem_sts'] > r['body_target_sts']
    assert r['linning_rounds'] + r['body_plain_rounds'] + r['hem_rounds'] == r['total_rounds']
    assert r['n_inc_rounds'] <= r['body_plain_rounds'], f"more increase rounds than available plain rounds! {r}"
    assert len(r['tiers']) == TIER_COUNT
    assert r['tiers'][0]['start_sts'] == r['body_target_sts']
    assert r['tiers'][-1]['end_sts'] == r['hem_sts']
    for t in r['tiers']:
        assert t['plain_rounds'] >= 1, f"{r['no']} tier {t['tier']}: ingen synlig lag ({t})"

for a, b in zip(rows, rows[1:]):
    assert b['hem_sts'] > a['hem_sts']
    assert b['tiers'][0]['start_sts'] == b['body_target_sts']

out = BASE / 'sizes.json'
out.write_text(json.dumps(rows, ensure_ascii=False, indent=2), encoding='utf-8')
print('OK, skrev', out, 'for', len(rows), 'størrelser,', TIER_COUNT, 'volanglag pr størrelse.')
for r in rows:
    tier_str = ' -> '.join(f"{t['start_sts']}->{t['end_sts']}({t['plain_rounds']}o)" for t in r['tiers'])
    print(f"  {r['no']:>10s}: kropp {r['body_target_sts']:>3d} m, {tier_str}, hem {r['hem_sts']:>3d} m")
