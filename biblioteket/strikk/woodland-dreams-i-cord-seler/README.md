# Woodland Dreams I-cord-seler (LME Woodland Dreams, strikkeserie)

Ferdig oppskrift: **`Woodland-Dreams-I-cord-seler-LME.pdf`** (norsk, 13 sider, A4) og
**`Woodland-Dreams-I-cord-seler-LME-EN.pdf`** (engelsk, 13 sider, A4).

Tilbehørsdel i den modulære strikkekolleksjonen LME Woodland Dreams
(basisbody + 6 tilbehørsdeler, pluss det heklede Woodland Fluffy Skirt).
Helt original LME-konstruksjon, ikke en kopi av noe eksisterende mønster:
to i-cord-seler som krysser bak, festes foran og bak med treknapper via
heklede knapphullsløkker, og er justerbare via tre løkkeposisjoner i hver
ende. Beskrevet av Renate som kolleksjonens signaturdel.

## Konstruksjon, kort

1. Strikk to like seler, hver som én lang i-cord på 3 masker (strømpepinne
   4 mm), til strap-lengden for din størrelse er nådd (se gradering under).
2. Hekle tre knapphullsløkker i hver av de fire endene (2 seler x 2 ender),
   med heklenål 3 mm, jevnt fordelt over de siste 3 cm av hver ende. De tre
   løkkene gir tre justerbare lengder uten omstrikking.
3. Sy fire treknapper på plagget selene skal festes til (bloomers, shorts
   eller basisbodyen), ikke på selve selene.
4. Fest selene i en X bak (venstre foran til høyre bak, høyre foran til
   venstre bak), eller rett ned uten kryss, etter ønske.

## Fasthet

22 masker = 10 cm, 30 omganger = 10 cm, glattstrikk på pinne 4 mm, Sandnes
Garn Alpakka, samme fasthet som resten av Woodland Dreams-kolleksjonen.
I-cord krever ikke presis fasthet for å fungere, fastheten brukes her kun
for å regne ut et omtrentlig, konsistent omgangstall pr størrelse (se under).

## Sizing-metode (reelt utregnet, ikke frihåndstall)

Strap-lengden pr størrelse er beregnet direkte fra `body_length_cm`-feltet
i `../woodland-dreams-basisbody/sizes.json` (bodyens verifiserte
per-størrelse-mål), med formelen:

```
strap_length_cm = 2 x (0,6 x body_length_cm) + 4 cm
strap_rows      = round(strap_length_cm x 3,0)   # 3,0 omg/cm ved 30 omg = 10 cm
```

- **0,6** er et anslag på avstanden fra midje til skulder (både foran og
  bak), som andel av bodyens kroppslengde (hals-skritt). Kroppslengden
  inkluderer bleierommet under midjen, så midje-skulder er kortere enn hele
  kroppslengden, men klart mer enn halvparten.
- Tallet **dobles** fordi hver strap går både opp foran OG ned bak, til
  motsatt side (det er selve krysningen).
- **+4 cm** er et fast tillegg som dekker selve krysningen bak pluss litt
  bevegelsesvidde, likt for alle størrelser.

Alle syv strap-lengder og omgangstall genereres av `compute_sizes()` i
`build_icord_seler.py`, med interne konsistenssjekker (`assert`) som
bekrefter:

- hver størrelses `strap_length_cm` stemmer med formelen over,
- `strap_rows` stemmer med `strap_length_cm x` fastheten,
- løkkesonen i hver ende (3 løkker x 1,5 cm avstand = 3 cm) har god klaring
  til motsatt ende, uten overlapp,
- **hver størrelse er strengt lengre enn forrige**, både i cm og omganger.

Resulterende tabell (0-1 til 18-24 mnd):

| Størrelse | Kroppslengde (ref.) | Strap-lengde | Omg. i-cord (ca.) |
|---|---|---|---|
| 0-1 mnd   | 25 cm | 34.0 cm | 102 |
| 1-3 mnd   | 27 cm | 36.4 cm | 109 |
| 3-6 mnd   | 30 cm | 40.0 cm | 120 |
| 6-9 mnd   | 33 cm | 43.6 cm | 131 |
| 9-12 mnd  | 36 cm | 47.2 cm | 142 |
| 12-18 mnd | 39 cm | 50.8 cm | 152 |
| 18-24 mnd | 42 cm | 54.4 cm | 163 |

`chest_cm` fra samme `sizes.json` er tatt med i størrelsestabellen (side 4
i PDF-en) som ren referanse, til å matche riktig størrelse mot bodyen eller
plagget selene skal festes til, ikke i selve strap-formelen.

## Bygge PDF-ene på nytt

```bash
cd biblioteket/strikk/woodland-dreams-i-cord-seler
python3 build_icord_seler.py
CHROME=/opt/pw-browsers/chromium-1194/chrome-linux/chrome
"$CHROME" --headless --no-sandbox --disable-gpu --no-pdf-header-footer \
  --print-to-pdf=Woodland-Dreams-I-cord-seler-LME.pdf icord_seler_no.html
"$CHROME" --headless --no-sandbox --disable-gpu --no-pdf-header-footer \
  --print-to-pdf=Woodland-Dreams-I-cord-seler-LME-EN.pdf icord_seler_en.html
```

Bruker det delte byggesettet i `../../hekle/_shared/lme_pattern_kit.py`
(samme LME-stil som hele hekle-kolleksjonen og basisbodyen). `fonts/` er
kopiert inn fra `../woodland-dreams-basisbody/fonts/` slik at HTML-en er
selvstendig og ikke avhenger av søskenmappen ved print.

## Verifisering utført

1. `python3 -m py_compile build_icord_seler.py` — kompilerer rent.
2. Begge PDF-ene generert og sjekket med PyMuPDF (`fitz`): **13 sider NO,
   13 sider EN**, samsvarer.
3. Diakritikk-sjekk kjørt på begge HTML-filene med det delte
   sjekkscriptet. Ett funn i EN-filen: `'far'` i "how **far** you have
   come", som er et korrekt engelsk ord, ikke en manglende norsk
   diakritikk, ingen retting nødvendig.
4. Forsiden og to konstruksjonssider (strap-tabellen på side 8, løkke-/
   justeringssiden på side 9) rendret til PNG med `fitz` (dpi=100) og sett
   over manuelt: ingen overflow, ingen avkuttet tekst, tabellene sitter
   pent innenfor kortene.
5. To av de syv størrelsene (3-6 mnd og 12-18 mnd) re-utregnet for hånd i
   et frittstående script (uten å importere byggeskriptets funksjoner):
   begge stemte nøyaktig med tallene i PDF-en (40,0 cm/120 omg. og
   50,8 cm/152 omg.).
6. `git status --short` bekreftet at kun
   `biblioteket/strikk/woodland-dreams-i-cord-seler/` er lagt til, ingen
   andre filer eller mapper (basisbody, butikk, søsken-tilbehørsmapper)
   er rørt.

Ikke koblet til butikken ennå, samme status som resten av kolleksjonen.
