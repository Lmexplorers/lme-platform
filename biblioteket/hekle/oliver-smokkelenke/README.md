# Olivers smokkelenke (LME Baby Collection, Woodland Dreams)

Ferdig oppskrift: **`Olivers-smokkelenke-LME.pdf`** (norsk, 14 sider, A4) og
**`Olivers-smokkelenke-LME-EN.pdf`** (engelsk, 14 sider, A4).

Femte og siste tilbehørsoppskrift i smokkelenke-serien, følger opp
`../ellies-smokkelenke/`, `../pip-smokkelenke/`, `../felix-smokkelenke/` og
`../molly-smokkelenke/` med en versjon for Oliver. Et lite, forenklet
bjørnehode i varmt lyst brunt, med to små runde ører og en lyseblå
"minikrage" (en miniatyr av Olivers signaturfarge og volangkrage) i stedet
for sløyfe. Tres sammen med heklede kuler til en smokkelenke, maks 22 cm
som resten av kolleksjonen.

Bygget etter samme mal som de andre smokkelenkene, med Oliver sitt eget
referansebilde (`oliver_face_ref.jpg`, kopiert fra
`../oliver-bjorn/oliver_face.jpg`) på forsiden og i ansikts-seksjonen,
tydelig merket "stiluttrykk-referanse".

Med denne er alle fem skogvenn-smokkelenkene (Pip, Felix, Molly, Luna,
Oliver) ferdige, i tillegg til Ellies opprinnelige.

## Bygge PDF-ene på nytt

```bash
python3 build_oliver_smokkelenke.py
CHROME=/opt/pw-browsers/chromium-1194/chrome-linux/chrome
"$CHROME" --headless --no-pdf-header-footer \
  --print-to-pdf=Olivers-smokkelenke-LME.pdf smokkelenke_no.html
"$CHROME" --headless --no-pdf-header-footer \
  --print-to-pdf=Olivers-smokkelenke-LME-EN.pdf smokkelenke_en.html
```

Bruker det delte byggesettet i `../_shared/lme_pattern_kit.py`.

Foreløpig kun selve oppskriften, ikke koblet til butikken ennå.
