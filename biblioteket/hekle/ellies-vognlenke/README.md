# Ellies vognlenke (LME Baby Collection, Woodland Dreams)

Ferdig oppskrift: **`Ellies-vognlenke-LME.pdf`** (norsk, 15 sider, A4) og
**`Ellies-vognlenke-LME-EN.pdf`** (engelsk, 15 sider, A4).

Fjerde oppskrift i **LME Baby Collection "Woodland Dreams"**. Sju motiver
(Ellie-medaljong, sky, sol, blad, blomst, stjerne og sommerfugl) festet langs
en kort streng, til å feste over en barnevogns bøyle.

Samme sikkerhetsfokus som `../ellies-smokkelenke/` og `../ellies-rangle/`:
side 13 forklarer hvorfor lengden holdes kort (generelt EN 71-prinsipp om at
snorer/bånd for barn under 36 måneder skal være så korte som praktisk mulig),
med en tydelig LME-anbefaling (maks 35-40 cm mellom festepunktene, ingen
motiv løsere enn 6-8 cm), IKKE en påstått eksakt regelsitat, pluss en
gjentatt oppfordring om å sjekke ferdig produkt mot gjeldende lokale krav.

- **Garn:** samme Bystrikk Merino + rester som resten av kolleksjonen, litt
  gult til solen.
- **Oppheng:** treklips, plastklips eller treringer, beskrevet som
  alternativer på side 3.
- **Fotoveiledning og QR-kode-plassholder:** samme mal som de andre
  tilbehørsoppskriftene.

## Bygge PDF-ene på nytt

```bash
python3 build_vognlenke.py
CHROME=/opt/pw-browsers/chromium-1194/chrome-linux/chrome
"$CHROME" --headless --no-pdf-header-footer \
  --print-to-pdf=Ellies-vognlenke-LME.pdf vognlenke_no.html
"$CHROME" --headless --no-pdf-header-footer \
  --print-to-pdf=Ellies-vognlenke-LME-EN.pdf vognlenke_en.html
```

Bruker det delte byggesettet i `../_shared/lme_pattern_kit.py`.

Ferdige kopier til nedlasting i butikken ligger i
`butikk/nedlasting/oppskrifter/ellies-vognlenke.pdf` og
`ellies-vognlenke-en.pdf`.
