# Felix' vognlenke (LME Baby Collection, Woodland Dreams)

Ferdig oppskrift: **`Felix-vognlenke-LME.pdf`** (norsk, 16 sider, A4) og
**`Felix-vognlenke-LME-EN.pdf`** (engelsk, 16 sider, A4).

Følger opp `../ellies-vognlenke/` og `../pip-vognlenke/` med en versjon for
Felix. Samme oppbygning som de andre: en liten rustoransje Felix-medaljong
midt på en kort snor, omgitt av de samme sju universelle naturmotivene
(sky, sol, blad, blomst, stjerne, sommerfugl) og to sideringer med
dinglende kuler. Felix-medaljongen har todelte, foldede ører (samme
teknikk som på ham selv) og en egen miniatyr av den tofargede halen hans,
sydd til bakhodet.

Bygget etter samme mal som Ellies og Pips vognlenke (samme struktur, samme
sikkerhetsside om maks lengde), med Felix sitt eget referansebilde
(`felix_ref.jpg`, kopiert fra `../felix-rev/felix_hero.jpg`) på forsiden,
tydelig merket "stiluttrykk-referanse".

## Bygge PDF-ene på nytt

```bash
python3 build_felix_vognlenke.py
CHROME=/opt/pw-browsers/chromium-1194/chrome-linux/chrome
"$CHROME" --headless --no-pdf-header-footer \
  --print-to-pdf=Felix-vognlenke-LME.pdf vognlenke_no.html
"$CHROME" --headless --no-pdf-header-footer \
  --print-to-pdf=Felix-vognlenke-LME-EN.pdf vognlenke_en.html
```

Bruker det delte byggesettet i `../_shared/lme_pattern_kit.py`.

Foreløpig kun selve oppskriften, ikke koblet til butikken ennå.
