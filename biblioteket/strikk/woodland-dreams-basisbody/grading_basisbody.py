# -*- coding: utf-8 -*-
"""
Woodland Dreams Basisbody v2, graderingsberegning.

Redesign etter tilbakemelding fra Renate: den forrige versjonen hadde lange
erme og ribb i hals/mansjett/legg, langt fra det som var bedt om. Ny
versjon: ingen ribb noe sted (i-cord-kanter i stedet, se README), korte,
innebygde erme (ikke lange, ikke løse stropper), og skulderåpning med
knapper på ALLE 7 størrelser (ikke bare de 3 minste som før), siden i-cord
ikke strekker slik ribb gjør, så halsen trenger den flate åpningen for å
komme over hodet uansett størrelse.

Fasthet 22 m = 10 cm / 30 o = 10 cm (uendret). Bryst-, hals- og
kroppslengdemålene er UENDRET fra forrige versjon, med vilje: seks av
tilbehørsdelene (blondekrage, rysjekrage, Peter Pan-krage, smekke,
i-cord-seler, kort vest) leser chest_cm/neck_circ_cm/body_length_cm/
sleeve_after_divide direkte fra denne sizes.json, og skal fortsatt passe.

Matematisk begrensning oppdaget under uttestingen: hver størrelse øker
bæret (underarm_total) med bare 6 masker (S øker med 1, x6), men hver
raglan-økeomgang legger til 8 masker. Med et fast antall økeomganger pr
størrelse ville halsoppligget da MÅTTE synke for enkelte størrelser
(umulig, må øke). Løsningen (brukt her, og standard i raglan-gradering):
økeomgangene holdes på et FAST, lite antall (nok for minste størrelse) for
alle 7 størrelsene, og halsoppligget bærer resten av størrelsesveksten.
Færre økeomganger enn i forrige, ribbede versjon er også riktig her: uten
ribbens sammentrekning trengs ikke lenger en kunstig liten halsoppligg-
faktor (0,82), oppleggingen svarer nå direkte til halsmål x fasthet.

Kjøres med:  python3 grading_basisbody.py
Skriver:     sizes.json (i denne mappen)
"""
import json
import pathlib

BASE = pathlib.Path(__file__).parent
GAUGE_ST_CM = 22 / 10
GAUGE_ROW_CM = 30 / 10
EASE_CM = 6

# (no, en, chest_barn_cm, kroppslengde_cm, hals_cm, kort_erme_cm)
SIZES = [
    ("0-1 mnd",   "0-1 mo",   40, 25, 21, 4.0),
    ("1-3 mnd",   "1-3 mo",   42, 27, 22, 4.5),
    ("3-6 mnd",   "3-6 mo",   44, 30, 23, 5.0),
    ("6-9 mnd",   "6-9 mo",   46, 33, 24, 5.5),
    ("9-12 mnd",  "9-12 mo",  48, 36, 25, 6.0),
    ("12-18 mnd", "12-18 mo", 50, 39, 26, 6.5),
    ("18-24 mnd", "18-24 mo", 52, 42, 27, 7.0),
]

prelim = []
prev_S = 0
for no, en, chest, length, neck, sleeve in SIZES:
    finished_chest = chest + EASE_CM
    target_total = finished_chest * GAUGE_ST_CM
    S = round(target_total / 6)
    if S <= prev_S:
        S = prev_S + 1
    prev_S = S
    front = back = 2 * S
    underarm_total = front + back + 2 * S
    neck_target = neck * GAUGE_ST_CM
    raw_incs = round((underarm_total - neck_target) / 8)
    prelim.append(dict(no=no, en=en, chest=chest, length=length, neck=neck,
                        sleeve=sleeve, S=S, front=front, back=back,
                        underarm_total=underarm_total, raw_incs=raw_incs))

# Fast, lite antall økeomganger for alle størrelser (se modul-docstring for
# hvorfor): minimum av det hver enkelt størrelse "naturlig" ville trengt.
INCS = min(p['raw_incs'] for p in prelim)
assert INCS >= 1

rows = []
for p in prelim:
    S, front, back = p['S'], p['front'], p['back']
    underarm_total = p['underarm_total']
    neck_co = underarm_total - INCS * 8
    rounds_to_underarm = INCS * 2
    actual_chest_cm = round(underarm_total / GAUGE_ST_CM, 1)
    body_rows_total = round(p['length'] * GAUGE_ROW_CM)
    body_rows_below_underarm = body_rows_total - rounds_to_underarm
    sleeve_rows_total = round(p['sleeve'] * GAUGE_ROW_CM)
    body_after_divide = front + back + 4
    sleeve_after_divide = S + 2

    rows.append(dict(
        no=p['no'], en=p['en'], chest_cm=actual_chest_cm, ease_over_body_cm=EASE_CM,
        neck_circ_cm=p['neck'], neck_co=neck_co,
        raglan_inc_rounds=INCS, rows_neck_to_underarm=rounds_to_underarm,
        S=S, front=front, back=back, underarm_total=underarm_total,
        body_after_divide=body_after_divide, sleeve_after_divide=sleeve_after_divide,
        body_length_cm=p['length'], body_rows_total=body_rows_total,
        body_rows_below_underarm=body_rows_below_underarm,
        sleeve_length_cm=p['sleeve'], sleeve_rows_total=sleeve_rows_total,
    ))

# ---------------------------------------------------------------- KONSISTENSSJEKK
chests = [r['chest_cm'] for r in rows]
assert chests == sorted(chests) and len(set(chests)) == 7
assert len(set(r['S'] for r in rows)) == 7
for r in rows:
    assert r['front'] + r['back'] + 2 * r['S'] == r['underarm_total']
    assert r['neck_co'] + r['raglan_inc_rounds'] * 8 == r['underarm_total']
    assert r['neck_co'] >= 16, f"{r['no']}: halsoppligg for lite"
    assert r['raglan_inc_rounds'] >= 1
    assert r['body_rows_below_underarm'] > 0
    assert r['sleeve_rows_total'] >= 8, f"{r['no']}: ermet for kort til å være strikkbart"
    assert r['body_after_divide'] == r['front'] + r['back'] + 4
    assert r['sleeve_after_divide'] == r['S'] + 2

for r in rows:
    incs = r['raglan_inc_rounds']
    start_front = r['front'] - 2 * incs
    start_sleeve = r['S'] - 2 * incs
    start_back = r['back'] - 2 * incs
    assert start_front >= 0 and start_sleeve >= 0, f"{r['no']}: negativt startmasketall"
    assert 2 * start_front + 2 * start_sleeve == r['neck_co']
    r['start_front'] = start_front
    r['start_back'] = start_back
    r['start_sleeve'] = start_sleeve

for a, b in zip(rows, rows[1:]):
    assert b['sleeve_length_cm'] > a['sleeve_length_cm']
    assert b['sleeve_rows_total'] > a['sleeve_rows_total']
    assert b['neck_co'] > a['neck_co']
    assert b['chest_cm'] > a['chest_cm']
    assert b['body_length_cm'] > a['body_length_cm']
    assert b['neck_circ_cm'] > a['neck_circ_cm']

out = BASE / 'sizes.json'
out.write_text(json.dumps(rows, ensure_ascii=False, indent=2), encoding='utf-8')
print('OK, skrev', out, 'for', len(rows), 'størrelser. Alle konsistenssjekk består.')
for r in rows:
    print(f"  {r['no']:>10s}: bryst {r['chest_cm']}cm, hals {r['neck_circ_cm']}cm -> "
          f"oppl. {r['neck_co']}m, {r['raglan_inc_rounds']} økeomg, bær {r['underarm_total']}m, "
          f"erme {r['sleeve_length_cm']}cm ({r['sleeve_rows_total']} omg)")
