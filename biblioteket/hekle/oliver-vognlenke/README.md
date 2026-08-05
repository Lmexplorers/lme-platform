# Olivers vognlenke (LME Baby Collection, Woodland Dreams)

Ferdig oppskrift: **`Olivers-vognlenke-LME.pdf`** (norsk, 15 sider, A4) og
**`Olivers-vognlenke-LME-EN.pdf`** (engelsk, 15 sider, A4).

Følger opp `../ellies-vognlenke/`, `../pip-vognlenke/`,
`../felix-vognlenke/` og `../molly-vognlenke/` med en versjon for Oliver,
den siste av de fem nye vognlenkene. Samme oppbygning som de andre: en
liten varmt lys brun Oliver-medaljong midt på en kort snor, omgitt av de
samme sju universelle naturmotivene (sky, sol, blad, blomst, stjerne,
sommerfugl, i lyseblått i stedet for gult/rosa der Oliver er involvert) og
to sideringer med dinglende kuler. Oliver-medaljongen har enkle runde
ører, ingen sløyfe eller ekstra pynt, akkurat som på ham selv.

Bygget etter samme mal som de andre vognlenkene (samme struktur, samme
sikkerhetsside om maks lengde), med Oliver sitt eget referansebilde
(`oliver_ref.jpg`, kopiert fra `../oliver-bjorn/oliver_hero.jpg`) på
forsiden, tydelig merket "stiluttrykk-referanse". Kolleksjonslisten på
siste side er nå 25 elementer og hekles i to spalter, samme løsning som
i resten av rangle- og vognlenke-serien.

## Bygge PDF-ene på nytt

```bash
python3 build_oliver_vognlenke.py
CHROME=/opt/pw-browsers/chromium-1194/chrome-linux/chrome
"$CHROME" --headless --no-pdf-header-footer \
  --print-to-pdf=Olivers-vognlenke-LME.pdf vognlenke_no.html
"$CHROME" --headless --no-pdf-header-footer \
  --print-to-pdf=Olivers-vognlenke-LME-EN.pdf vognlenke_en.html
```

Bruker det delte byggesettet i `../_shared/lme_pattern_kit.py`.

Foreløpig kun selve oppskriften, ikke koblet til butikken ennå.
