# LME Mini & Me Poncho, strikkeoppskrift

Ombygget fra et ChatGPT-utkast til riktig LME-mal (Sasson Montessori-brødtekst,
Playpen Sans-overskrifter, forside, samme sidestruktur som resten av
biblioteket). Rettet manglende tegn (X, é, stor Ø) som falt bort i det
opprinnelige utkastet.

Tre separate oppskrifter, alle strikkes rundt ovenfra og ned i ett stykke,
med åtte jevne økningslinjer (par-økning før og etter hver markør, M1V/M1H),
sammenhengende i-cordkant og én knepping i hver side:

- **Voksen** (XS til 4XL, 8 individuelle størrelser) og **Barn** (92 til
  176, 15 individuelle størrelser, én rad per ekte klesstørrelse, ingen
  interne koder): lav ribbehals. Tallene er beregnet og verifisert med
  Python (legg opp + 16 × økningsomganger = masker etter økning, bredde =
  masker / 1,7 / 2, stopp ved = hel lengde − 1,5 cm, knapp/knapphull-
  plassering = sidemidt ± masker), stemmer nøyaktig for alle størrelsene.
- **Baby, med hette** (50 til 92, 8 størrelser, nyfødt til 2 år): samme
  graderte størrelser som resten av barnefamilien i biblioteket. Ponchoen
  strikkes først akkurat som barne-/voksenversjonen (lav ribbehals, rund
  økningsdel, i-cordkant, sideknepping), deretter plukkes masker opp rundt
  halsen og hetten strikkes rett på, fram og tilbake, med toppen formet med
  markørfellinger og lukket med 3-pinners avfelling. Ingen søm utenom selve
  toppavfellingen.

**25. august 2026:** rettet økningsteknikken i alle tre oppskriftene, etter
tilbakemelding fra Renate. Det ble tidligere kun økt med én maske rett før
hver markør (8 masker per økningsomgang). Riktig teknikk er par-økning,
én maske som heller mot venstre (M1V) rett før markøren og én som heller
mot høyre (M1H) rett etter (16 masker per økningsomgang, samme 8 markører).
Antall økningsomganger, sluttmasketall, bredde og knappeplassering er
regnet om for alle 31 størrelsene (`/tmp` scratch-skript, verifisert med
`assert` mot de gamle, allerede verifiserte formlene før omregning), alltid
avrundet oppover slik at ingen størrelse ble trangere enn opprinnelig
planlagt.

**IKKE klar for salg ennå.** Baby-hette-varianten er ny design og må
test-strikkes og måles etter vask før den publiseres, se siste side i hver
oppskrift.

## Bygge PDF-ene på nytt

```bash
python3 build_poncho.py
# gir poncho_<voksen|barn|baby>_<no|en>.html for hver variant
```

Rendres til PDF med Chromium (print-to-pdf). Cover-foto for voksen/barn er
beskåret fra det originale ChatGPT-utkastets bilde, baby-hette bruker et
eget produktfoto (tre graderte størrelser). SVG-skissen (`hood_schematic`)
ligger igjen i skriptet som reservefallback dersom `photo` settes til
`None` for en fremtidig hette-variant uten foto ennå.
