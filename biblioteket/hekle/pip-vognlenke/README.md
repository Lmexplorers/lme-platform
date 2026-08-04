# Pips vognlenke (LME Baby Collection, Woodland Dreams)

Ferdig oppskrift: **`Pips-vognlenke-LME.pdf`** (norsk, 16 sider, A4) og
**`Pips-vognlenke-LME-EN.pdf`** (engelsk, 16 sider, A4).

Følger opp `../ellies-vognlenke/` med en versjon for Pip. Samme oppbygning
som Ellies: en liten kremhvit Pip-medaljong midt på en kort snor, omgitt av
de samme sju universelle naturmotivene (sky, sol, blad, blomst, stjerne,
sommerfugl) og to sideringer med dinglende kuler. Pip-medaljongen har en
egen miniatyr av piggstripen hans sydd langs midtlinjen bak hodet, i
tillegg til de to små mørkebrune ørene.

Bygget etter samme mal som Ellies vognlenke (samme struktur, samme
sikkerhetsside om maks lengde), med Pip sitt eget referansebilde
(`pip_ref.png`, kopiert fra `../pip-pinnsvin/pip_hero.png`) på forsiden,
tydelig merket "stiluttrykk-referanse".

## Bygge PDF-ene på nytt

```bash
python3 build_pip_vognlenke.py
CHROME=/opt/pw-browsers/chromium-1194/chrome-linux/chrome
"$CHROME" --headless --no-pdf-header-footer \
  --print-to-pdf=Pips-vognlenke-LME.pdf vognlenke_no.html
"$CHROME" --headless --no-pdf-header-footer \
  --print-to-pdf=Pips-vognlenke-LME-EN.pdf vognlenke_en.html
```

Bruker det delte byggesettet i `../_shared/lme_pattern_kit.py`.

Foreløpig kun selve oppskriften, ikke koblet til butikken ennå.
