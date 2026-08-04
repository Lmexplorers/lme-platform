# Felix' smokkelenke (LME Baby Collection, Woodland Dreams)

Ferdig oppskrift: **`Felix-smokkelenke-LME.pdf`** (norsk, 14 sider, A4) og
**`Felix-smokkelenke-LME-EN.pdf`** (engelsk, 14 sider, A4).

Følger opp `../ellies-smokkelenke/` og `../pip-smokkelenke/` med en versjon
for Felix. Et lite, forenklet revehode i rustoransje, med to små foldede
ører (miniatyr av Felix sine spisse ører) og en miniatyr av signaturdelen
hans: en liten tofarget "minihale"-kule i stedet for sløyfe. Tres sammen
med heklede kuler til en smokkelenke, maks 22 cm som resten av
kolleksjonen.

Oppdatert 4. august 2026 etter Renates referansebilder av profesjonelt
stylede smokkelenker, samme mønster som Ellies og Pips: en salviegrønn
volangkrage rundt halsen (ny egen side), én stjerneformet treperle blant
kulene, en heklet snorløkke i enden til smokkering, og en oppdatert
klipsbeskrivelse (tre-kuleklips med innkapslet fjærmekanisme).

Bygget etter samme mal som `../ellies-smokkelenke/`, med Felix sitt eget
referansebilde (`felix_face_ref.jpg`, kopiert fra
`../felix-rev/felix_face.jpg`) på forsiden og i ansikts-seksjonen, tydelig
merket "stiluttrykk-referanse".

## Bygge PDF-ene på nytt

```bash
python3 build_felix_smokkelenke.py
CHROME=/opt/pw-browsers/chromium-1194/chrome-linux/chrome
"$CHROME" --headless --no-pdf-header-footer \
  --print-to-pdf=Felix-smokkelenke-LME.pdf smokkelenke_no.html
"$CHROME" --headless --no-pdf-header-footer \
  --print-to-pdf=Felix-smokkelenke-LME-EN.pdf smokkelenke_en.html
```

Bruker det delte byggesettet i `../_shared/lme_pattern_kit.py`.

Foreløpig kun selve oppskriften, ikke koblet til butikken ennå.
