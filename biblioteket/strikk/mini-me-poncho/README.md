# LME Mini & Me Poncho, strikkeoppskrift

Ombygget fra et ChatGPT-utkast til riktig LME-mal (Sasson Montessori-brødtekst,
Playpen Sans-overskrifter, forside, samme sidestruktur som resten av
biblioteket). Rettet manglende tegn (X, é, stor Ø) som falt bort i det
opprinnelige utkastet.

Tre separate oppskrifter, alle strikkes rundt ovenfra og ned i ett stykke,
med åtte jevne økningslinjer, sammenhengende i-cordkant og én knepping i
hver side:

- **Voksen** (V1-V4, XS-S til 3XL-4XL) og **Barn** (M1-M4, 2-4 år til 14-16
  år): lav ribbehals, tallene hentet direkte fra utkastet og verifisert
  (legg opp + 8 × økningsomganger = masker etter økning, stopp ved = hel
  lengde - 1,5 cm, knapp/knapphull-plassering = sidemidt ± masker, alt
  stemmer for alle 8 størrelsene).
- **Baby, med hette** (50-92, nyfødt til 2 år): samme graderte størrelser
  som resten av barnefamilien i biblioteket. Ponchoen strikkes først
  akkurat som barne-/voksenversjonen (lav ribbehals, rund økningsdel,
  i-cordkant, sideknepping), deretter plukkes masker opp rundt halsen og
  hetten strikkes rett på, fram og tilbake, med toppen formet med
  markørfellinger og lukket med 3-pinners avfelling. Ingen søm utenom selve
  toppavfellingen. Bygget om fra et andre ChatGPT-utkast (samme
  tegnfeil-mønster som det første), tallene verifisert på samme måte og
  stemmer for alle 8 størrelsene. Erstatter en tidligere B1-B3-versjon med
  en enklere hette-først-konstruksjon.

**IKKE klar for salg ennå.** Baby-hette-varianten er ny design og må
test-strikkes og måles etter vask før den publiseres, se siste side i hver
oppskrift.

## Bygge PDF-ene på nytt

```bash
python3 build_poncho.py
# gir poncho_<voksen|barn|baby>_<no|en>.html for hver variant
```

Rendres til PDF med Chromium (print-to-pdf). Cover-foto for voksen/barn er
beskåret fra det originale ChatGPT-utkastets bilde. Baby-hette har en tegnet
SVG-skisse i stedet, siden plagget ikke er strikket ennå.
