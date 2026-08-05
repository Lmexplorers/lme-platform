# Molly, det lille lammet (LME Baby Collection, Woodland Dreams)

Ferdig oppskrift: **`Molly-hekleoppskrift-LME.pdf`** (norsk, 20 sider, A4) og
**`Molly-hekleoppskrift-LME-EN.pdf`** (engelsk, 20 sider, A4).

Fjerde figur i **LME Baby Collection "Woodland Dreams"**, etter Ellie, Pip og
Felix. Et lite, mykt lam med lange, slappe ører og en krøllete ulltopp
heklet i tette løkkemasker (samme teknikk som Pips pigger, men mye tettere
og kortere, som et lite ullhette i stedet for en pigget overflate). En
smørgul sløyfe mellom ørene og en matchende volangkrage. Ca. 20 til 22 cm
sittende. Middels vanskelighetsgrad.

Et helt originalt LME-design, laget etter samme detaljerte mal-prompt som
Pip og Felix (avtalt med Renate 3. august 2026, som ønsker samme mal brukt
på alle figurene for en konsekvent serie), med Renates eget referansebilde
(stiluttrykk, ikke det ferdige produktet) for forsiden og
ansiktsdiagrammet. Ikke kopiert fra eksisterende design eller oppskrifter.

- **Ulltoppen** er Molly sin signaturdel: gjenbruker løkketeknikken fra Pips
  pigger, men med kort løkkelengde (0,5 til 1 cm i stedet for 1,5 til 2 cm)
  og heklet tett som en dome/hette over issen, i stedet for et langt,
  stående piggfelt.
- **Ørene** er lange og slappe (ikke spisse som Felix, ikke runde som Pip),
  heklet flatt i rader og sydd fast så de henger mykt nedover.
- **Dobbel øyne-løsning**, samme mønster som resten av familien: Versjon A
  med 16 mm sikkerhetsøyne (fra 3 år) og Versjon B med broderte øyne
  (babyvennlig, fra fødsel).
- **Fire skisser** (kroppens proporsjoner, ansiktet med øyeplassering,
  ulltoppen sett ovenfra, og kragen/ulltoppen sett fra siden) er egne
  håndtegnede SVG-illustrasjoner, bygget og visuelt verifisert i et eget
  testoppsett før de ble lagt inn i oppskriften. Ørene ble under
  verifiseringen justert til en litt dypere kremtone enn kroppen, for at de
  skal skille seg tydelig fra armene i skissene.
- Kolleksjonslisten på siste side inkluderer nå Felix i tillegg til Ellie
  og Pip. Den planlagte figuren Oliver er ikke laget ennå (venter på et
  referansebilde fra Renate).

## Bygge PDF-ene på nytt

```bash
python3 build_molly.py
CHROME=/opt/pw-browsers/chromium-1194/chrome-linux/chrome
"$CHROME" --headless --no-pdf-header-footer \
  --print-to-pdf=Molly-hekleoppskrift-LME.pdf molly_no.html
"$CHROME" --headless --no-pdf-header-footer \
  --print-to-pdf=Molly-hekleoppskrift-LME-EN.pdf molly_en.html
```

Bruker det delte byggesettet i `../_shared/lme_pattern_kit.py`.

Foreløpig kun selve oppskriften, ikke koblet til butikken ennå (samme status
som Pip og Felix hadde ved lansering).
