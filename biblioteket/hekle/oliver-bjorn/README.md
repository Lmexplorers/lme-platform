# Oliver, den lille bjørnen (LME Baby Collection, Woodland Dreams)

Ferdig oppskrift: **`Oliver-hekleoppskrift-LME.pdf`** (norsk, 20 sider, A4) og
**`Oliver-hekleoppskrift-LME-EN.pdf`** (engelsk, 20 sider, A4).

Sjette figur i **LME Baby Collection "Woodland Dreams"**, etter Ellie, Pip,
Felix, Molly og Luna. Den rundeste og mykeste i familien: en liten, varmt
brun bjørn med en ekstra rund, godt fylt mage, enkle runde ører (todelt som
Pip sine, men holdt runde og flate i stedet for brettet) og en lyseblå
volangkrage. Ingen sløyfe. Ca. 20 til 22 cm sittende. Middels
vanskelighetsgrad.

Et helt originalt LME-design, laget etter samme detaljerte mal-prompt som
resten av familien (avtalt med Renate 3. august 2026), med Renates eget
referansebilde av bamsen (stiluttrykk, ikke det ferdige produktet) for
forsiden og ansiktsdiagrammet, sendt 3. august 2026 etter at han i
utgangspunktet manglet referansebilde. Ikke kopiert fra eksisterende design
eller oppskrifter.

- **Kroppen** er Oliver sin signaturdel: i stedet for en ny teknikk er det
  selve formen som er kjennetegnet, en kropp holdt rundere og fylt fastere
  enn resten av familien, for den klassiske, pussete bamseformen.
- **Snuteflekken** gjenbruker Felix/Luna sin teknikk (stor, flat lapp sydd
  på ansiktet).
- **Dobbel øyne-løsning**, samme mønster som resten av familien: Versjon A
  med 16 mm sikkerhetsøyne (fra 3 år) og Versjon B med broderte øyne
  (babyvennlig, fra fødsel).
- **Fire skisser** (kroppens proporsjoner, ørenes todelte konstruksjon i
  eksplodert visning, ansiktet med snuteflekk- og øyeplassering, og
  kragen/den runde magen sett fra siden) er egne håndtegnede
  SVG-illustrasjoner, bygget og visuelt verifisert i et eget testoppsett før
  de ble lagt inn i oppskriften.
- Oliver har sju deler (én mindre enn de andre, siden han ikke har noen
  ekstra sydd-på-del som en hale, sløyfe eller ulltopp) og 20 sider (én
  kortere enn resten, siden signaturdelen hans deler side med hodet i
  stedet for å kreve en egen "sett bakfra"-side i tillegg til
  proporsjonsskissen).
- Kolleksjonslisten på siste side inkluderer hele familien laget så langt
  (Ellie, Pip, Felix, Molly, Luna).

## Bygge PDF-ene på nytt

```bash
python3 build_oliver.py
CHROME=/opt/pw-browsers/chromium-1194/chrome-linux/chrome
"$CHROME" --headless --no-pdf-header-footer \
  --print-to-pdf=Oliver-hekleoppskrift-LME.pdf oliver_no.html
"$CHROME" --headless --no-pdf-header-footer \
  --print-to-pdf=Oliver-hekleoppskrift-LME-EN.pdf oliver_en.html
```

Bruker det delte byggesettet i `../_shared/lme_pattern_kit.py`.

Foreløpig kun selve oppskriften, ikke koblet til butikken ennå (samme status
som Pip, Felix, Molly og Luna hadde ved lansering).
