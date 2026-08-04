# Mollys aktivitetsleke (LME Baby Collection, Woodland Dreams)

Ferdig oppskrift: **`Mollys-aktivitetsleke-LME.pdf`** (norsk, 20 sider, A4) og
**`Mollys-aktivitetsleke-LME-EN.pdf`** (engelsk, 20 sider, A4).

Molly-versjonen av `../ellies-aktivitetsleke/`, bygget 4. august 2026 etter
Renates ekte referansebilde av den faktiske heklede aktivitetskuben
(`molly_aktivitetsleke_real.jpg`). En myk aktivitetskube, ca. 11 til 12 cm
per side, med seks paneler: en Molly-side, en speil-side, en form-side
(hjerte, stjerne, sirkel, trekant), en lomme-side, en knitre-side og en
enkel bunn. Konstruksjonen (grunnkvadrater, panelmotiver, sammensying til
kube, topphåndtak, hjørneringer) er uendret fra Ellies oppskrift, kun
karakteren og fargene er tilpasset Molly.

Molly-siden bytter ut Ellies dådyrhode med Mollys eget ansikt: myke ører i
ett lag og en tett løkkemasket ulltopp mellom ørene, med den smørgule
sløyfen oppå ulltoppen og en smørgul volangkrage rundt halsen, samme
signaturuttrykk som resten av Mollys oppskrifter. Speilets blomsterramme og
lommens kant er heklet i smørgult i stedet for Ellies pudderrosa, som
matcher den gulkantede rammen i referansebildet. Referansebildet viser også
at både stjernen på form-siden og skyen på knitre-siden har et lite,
fredelig ansikt med lukkede øyne, det er lagt til som en valgfri
broderidetalj i oppskriften, og at hjørneringenes perledusker har to
dinglende kuler hver i stedet for én.

Samme sikkerhetsfokus som `../ellies-aktivitetsleke/`: side 18 er viet i sin
helhet til sikkerhet, med spesiell vekt på at speilet og knitrefolien alltid
skal være helt innsydd, og at løkkemaskene i ulltoppen sjekkes jevnlig.

## Bygge PDF-ene på nytt

```bash
python3 build_molly_aktivitetsleke.py
CHROME=/opt/pw-browsers/chromium-1194/chrome-linux/chrome
"$CHROME" --headless --no-pdf-header-footer \
  --print-to-pdf=Mollys-aktivitetsleke-LME.pdf aktivitetsleke_no.html
"$CHROME" --headless --no-pdf-header-footer \
  --print-to-pdf=Mollys-aktivitetsleke-LME-EN.pdf aktivitetsleke_en.html
```

Bruker det delte byggesettet i `../_shared/lme_pattern_kit.py`.

Lagt til i butikken (`/butikk/mollys-aktivitetsleke`) 4. august 2026.
