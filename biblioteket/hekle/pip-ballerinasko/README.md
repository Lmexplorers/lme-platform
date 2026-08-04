# Pips ballerinasko (LME Baby Collection, Woodland Dreams)

Ferdig oppskrift: **`Pips-ballerinasko-LME.pdf`** (norsk, 17 sider, A4) og
**`Pips-ballerinasko-LME-EN.pdf`** (engelsk, 17 sider, A4).

Følger opp `../ellies-ballerinasko/`, samme klassiske babyballerina-form
(rund tå, T-stropp, picotkant), tilpasset Pip: et lite pinnsvinansikt med
todelte ører i stedet for et dådyransikt, en piggstripe mellom ørene i
stedet for en sløyfe, picotkanten i salviegrønt i stedet for pudderrosa, og
to labbavtrykk brodert på sålen i stedet for et hjerte, etter Renates
referansebilde av de faktiske skoene.

Referansebildet (`pip_ballerinasko_real.jpg`) viser i tillegg en liten,
rund hale i kremhvitt helt bakerst på hver sko (ved hælen), et detalj
Ellies sko ikke har. Det er lagt til som en ekstra finish-detalj på
sålesiden (side 8), uten å endre sålens eller overdelens grunnkonstruksjon
eller maskeantall.

Samme flerstørrelses-konvensjon som `../ellies-ballerinasko/`: `prematur
(0-3) 3-6 (6-9) 9-12` måneder, med egen størrelsestabell med fotlengde på
side 4.

Ellies matchende hårsløyfe er byttet ut med en matchende hårklype med en
litt større utgave av piggstripen (samme løkkemaske-teknikk som brukes på
piggstripen på skoene og på Pips andre oppskrifter, `../pip-rangle/` og
`../pip-vognlenke/`), siden Pip ikke har noen sløyfe å matche mot.

To trygge lukkingsalternativer for T-stroppen er beskrevet (uten knapp,
eller med en myk heklet knapp, som i referansebildet), og sikkerhetssiden
fraråder harde plast-/metallknapper på de minste størrelsene, akkurat som
i Ellies oppskrift.

## Bygge PDF-ene på nytt

```bash
python3 build_pip_ballerinasko.py
CHROME=/opt/pw-browsers/chromium-1194/chrome-linux/chrome
"$CHROME" --headless --no-pdf-header-footer \
  --print-to-pdf=Pips-ballerinasko-LME.pdf ballerinasko_no.html
"$CHROME" --headless --no-pdf-header-footer \
  --print-to-pdf=Pips-ballerinasko-LME-EN.pdf ballerinasko_en.html
```

Bruker det delte byggesettet i `../_shared/lme_pattern_kit.py`.

Lagt til i butikken (`/butikk/pips-ballerinasko`) 4. august 2026.
