# Mollys ballerinasko (LME Baby Collection, Woodland Dreams)

Ferdig oppskrift: **`Mollys-ballerinasko-LME.pdf`** (norsk, 17 sider, A4) og
**`Mollys-ballerinasko-LME-EN.pdf`** (engelsk, 17 sider, A4).

Molly-versjonen av `../ellies-ballerinasko/`, bygget 4. august 2026 etter
Renates ekte referansebilde av de faktiske heklede skoene
(`molly_ballerinasko_real.jpg`). Klassiske babyballerinaer med rund tå,
T-stropp med knapp, picotkant og et hjerte brodert på sålen, i fem
størrelser (prematur, 0-3, 3-6, 6-9, 9-12 måneder), pluss en matchende
hårsløyfe. Konstruksjonen (oval såle, overdel, T-stropp, picotkant) er
uendret fra Ellies oppskrift, kun karakteren, fargen og ansiktsmotivet er
tilpasset Molly.

Motivet på tåpartiet er byttet fra Ellies dådyransikt til Mollys
lammeansikt: myke ører i ett lag og en tett løkkemasket ulltopp mellom
ørene, med Mollys signatur smørgule sløyfe oppå ulltoppen (samme
signaturuttrykk som resten av Mollys oppskrifter). Picotkanten er heklet i
smørgult i stedet for Ellies pudderrosa, som gir det gule fargeglimtet man
ser i referansebildet.

Tallene i oppskriften følger samme flerstørrelses-konvensjon som
`../ellies-ballerinasko/`: `prematur (0-3) 3-6 (6-9) 9-12`. Egen
størrelsestabell med fotlengde på side 4.

To trygge lukkingsalternativer for T-stroppen er beskrevet (uten knapp, eller
med en myk heklet knapp), og sikkerhetssiden fraråder harde plast-/metallknapper
på de minste størrelsene.

## Bygge PDF-ene på nytt

```bash
python3 build_molly_ballerinasko.py
CHROME=/opt/pw-browsers/chromium-1194/chrome-linux/chrome
"$CHROME" --headless --no-pdf-header-footer \
  --print-to-pdf=Mollys-ballerinasko-LME.pdf ballerinasko_no.html
"$CHROME" --headless --no-pdf-header-footer \
  --print-to-pdf=Mollys-ballerinasko-LME-EN.pdf ballerinasko_en.html
```

Bruker det delte byggesettet i `../_shared/lme_pattern_kit.py`.

Lagt til i butikken (`/butikk/mollys-ballerinasko`) 4. august 2026.
