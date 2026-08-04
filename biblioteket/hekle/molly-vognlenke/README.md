# Mollys vognlenke (LME Baby Collection, Woodland Dreams)

Ferdig oppskrift: **`Mollys-vognlenke-LME.pdf`** (norsk, 16 sider, A4) og
**`Mollys-vognlenke-LME-EN.pdf`** (engelsk, 16 sider, A4).

Følger opp `../ellies-vognlenke/`, `../pip-vognlenke/` og
`../felix-vognlenke/` med en versjon for Molly. Samme oppbygning som de
andre: en liten kremhvit Molly-medaljong midt på en kort snor, omgitt av
de samme sju universelle naturmotivene (sky, sol, blad, blomst, stjerne,
sommerfugl) og to sideringer med dinglende kuler. Molly-medaljongen har
myke ører, en tett løkkemasket mini ulltopp og en liten smørgul sløyfe
oppå, samme signaturuttrykk som resten av Mollys oppskrifter.

Bygget etter samme mal som de andre vognlenkene (samme struktur, samme
sikkerhetsside om maks lengde), med Molly sitt eget referansebilde
(`molly_ref.jpg`, kopiert fra `../molly-lam/molly_hero.jpg`) på forsiden,
tydelig merket "stiluttrykk-referanse".

## Bygge PDF-ene på nytt

```bash
python3 build_molly_vognlenke.py
CHROME=/opt/pw-browsers/chromium-1194/chrome-linux/chrome
"$CHROME" --headless --no-pdf-header-footer \
  --print-to-pdf=Mollys-vognlenke-LME.pdf vognlenke_no.html
"$CHROME" --headless --no-pdf-header-footer \
  --print-to-pdf=Mollys-vognlenke-LME-EN.pdf vognlenke_en.html
```

Bruker det delte byggesettet i `../_shared/lme_pattern_kit.py`.

Foreløpig kun selve oppskriften, ikke koblet til butikken ennå.
