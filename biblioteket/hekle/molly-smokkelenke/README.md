# Mollys smokkelenke (LME Baby Collection, Woodland Dreams)

Ferdig oppskrift: **`Mollys-smokkelenke-LME.pdf`** (norsk, 14 sider, A4) og
**`Mollys-smokkelenke-LME-EN.pdf`** (engelsk, 14 sider, A4).

Følger opp `../ellies-smokkelenke/`, `../pip-smokkelenke/` og
`../felix-smokkelenke/` med en versjon for Molly. Et lite, forenklet
lamhode i kremhvitt, med to små ører, en miniatyr av signaturdelen hennes
(en liten, tett løkkemasket ulltopp direkte på hodet) og en smørgul sløyfe
oppå ulltoppen. Tres sammen med heklede kuler til en smokkelenke, maks
22 cm som resten av kolleksjonen.

Oppdatert 4. august 2026 etter Renates referansebilder av profesjonelt
stylede smokkelenker: en smørgul volangkrage rundt halsen (ny egen side),
én stjerneformet treperle blant kulene, en heklet snorløkke i enden til
smokkering, og en oppdatert klipsbeskrivelse (tre-kuleklips med
innkapslet fjærmekanisme). Samme oppdatering som Ellies, Pips og Felix'
smokkelenke.

Bygget etter samme mal som de andre smokkelenkene, med Molly sitt eget
referansebilde (`molly_face_ref.jpg`, kopiert fra
`../molly-lam/molly_face.jpg`) på forsiden og i ansikts-seksjonen, tydelig
merket "stiluttrykk-referanse".

## Bygge PDF-ene på nytt

```bash
python3 build_molly_smokkelenke.py
CHROME=/opt/pw-browsers/chromium-1194/chrome-linux/chrome
"$CHROME" --headless --no-pdf-header-footer \
  --print-to-pdf=Mollys-smokkelenke-LME.pdf smokkelenke_no.html
"$CHROME" --headless --no-pdf-header-footer \
  --print-to-pdf=Mollys-smokkelenke-LME-EN.pdf smokkelenke_en.html
```

Bruker det delte byggesettet i `../_shared/lme_pattern_kit.py`.

Foreløpig kun selve oppskriften, ikke koblet til butikken ennå.
