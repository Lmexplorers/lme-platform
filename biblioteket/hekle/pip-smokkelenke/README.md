# Pips smokkelenke (LME Baby Collection, Woodland Dreams)

Ferdig oppskrift: **`Pips-smokkelenke-LME.pdf`** (norsk, 15 sider, A4) og
**`Pips-smokkelenke-LME-EN.pdf`** (engelsk, 15 sider, A4).

Følger opp `../ellies-smokkelenke/` med en versjon for Pip. Et lite,
forenklet pinnsvinhode i kremhvitt, uten egen snute, med to små brune ører
og en miniatyr av Pips signaturdel: en kort løkkemasket "piggstripe" langs
midtlinjen, i stedet for Ellies sløyfe. Tres sammen med heklede kuler til en
smokkelenke, maks 22 cm som resten av kolleksjonen.

Oppdatert 4. august 2026 etter Renates referansebilder av profesjonelt
stylede smokkelenker, samme mønster som `../ellies-smokkelenke/`: en
salviegrønn volangkrage rundt halsen (ny egen side), én stjerneformet
treperle blant kulene, en heklet snorløkke i enden til smokkering, og en
oppdatert klipsbeskrivelse (tre-kuleklips med innkapslet fjærmekanisme).

Bygget etter samme mal som `../ellies-smokkelenke/` (samme struktur,
sikkerhetsside og montering), med Pip sitt eget referansebilde
(`pip_face_ref.png`, kopiert fra `../pip-pinnsvin/pip_face.png`) på
forsiden og i ansikts-seksjonen, tydelig merket "stiluttrykk-referanse".

## Bygge PDF-ene på nytt

```bash
python3 build_pip_smokkelenke.py
CHROME=/opt/pw-browsers/chromium-1194/chrome-linux/chrome
"$CHROME" --headless --no-pdf-header-footer \
  --print-to-pdf=Pips-smokkelenke-LME.pdf smokkelenke_no.html
"$CHROME" --headless --no-pdf-header-footer \
  --print-to-pdf=Pips-smokkelenke-LME-EN.pdf smokkelenke_en.html
```

Bruker det delte byggesettet i `../_shared/lme_pattern_kit.py`.

Foreløpig kun selve oppskriften, ikke koblet til butikken ennå.
