# Lunas vognlenke (LME Baby Collection, Woodland Dreams)

Ferdig oppskrift: **`Lunas-vognlenke-LME.pdf`** (norsk, 16 sider, A4) og
**`Lunas-vognlenke-LME-EN.pdf`** (engelsk, 16 sider, A4).

Følger opp `../ellies-vognlenke/`, `../pip-vognlenke/`,
`../felix-vognlenke/` og `../molly-vognlenke/` med en versjon for Luna.
Samme oppbygning som de andre: en liten varmt grå Luna-medaljong midt på
en kort snor, omgitt av de samme sju universelle naturmotivene (sky, sol,
blad, blomst, stjerne, sommerfugl) og to sideringer med dinglende kuler.
Luna-medaljongen har avlange miniatyrører i stedet for runde, en
miniatyr av signaturuttrykket hennes.

Bygget etter samme mal som de andre vognlenkene (samme struktur, samme
sikkerhetsside om maks lengde), med Luna sitt eget referansebilde
(`luna_ref.jpg`, kopiert fra `../luna-kanin/luna_hero.jpg`) på forsiden,
tydelig merket "stiluttrykk-referanse".

## Bygge PDF-ene på nytt

```bash
python3 build_luna_vognlenke.py
CHROME=/opt/pw-browsers/chromium-1194/chrome-linux/chrome
"$CHROME" --headless --no-pdf-header-footer \
  --print-to-pdf=Lunas-vognlenke-LME.pdf vognlenke_no.html
"$CHROME" --headless --no-pdf-header-footer \
  --print-to-pdf=Lunas-vognlenke-LME-EN.pdf vognlenke_en.html
```

Bruker det delte byggesettet i `../_shared/lme_pattern_kit.py`.

Foreløpig kun selve oppskriften, ikke koblet til butikken ennå.
