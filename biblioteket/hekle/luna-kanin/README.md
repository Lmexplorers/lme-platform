# Luna, den lille kaninen (LME Baby Collection, Woodland Dreams)

Ferdig oppskrift: **`Luna-hekleoppskrift-LME.pdf`** (norsk, 21 sider, A4) og
**`Luna-hekleoppskrift-LME-EN.pdf`** (engelsk, 21 sider, A4).

Femte figur i **LME Baby Collection "Woodland Dreams"**, etter Ellie, Pip,
Felix og Molly. En liten, myk kanin med ekstra lange, todelte ører (varmt
grå utenpå, kremhvite innvendig) som henger langs hodet og kroppen. En rosa
sløyfe mellom ørene og en matchende volangkrage. Ca. 21 til 23 cm sittende.
Middels vanskelighetsgrad.

Et helt originalt LME-design, laget etter samme detaljerte mal-prompt som
Pip, Felix og Molly (avtalt med Renate 3. august 2026, som ønsker samme mal
brukt på alle figurene for en konsekvent serie), med Renates eget
referansebilde (stiluttrykk, ikke det ferdige produktet) for forsiden og
ansiktsdiagrammet. Ikke kopiert fra eksisterende design eller oppskrifter.

- **Ørene** er Luna sin signaturdel: mye lengre enn på resten av familien,
  heklet i to lag som Felix sine (grått utenpå, kremhvitt inni), men i en
  lang, flat, avlang form i stedet for en spiss trekant. Kun litt fyll
  nederst, slik at øret står litt av seg selv ved festepunktet men flopper
  mykt i den øvre delen.
- **Snuteflekken** gjenbruker Felix sin teknikk (stor, flat lapp sydd på
  ansiktet), bare litt større.
- **Dobbel øyne-løsning**, samme mønster som resten av familien: Versjon A
  med 16 mm sikkerhetsøyne (fra 3 år) og Versjon B med broderte øyne
  (babyvennlig, fra fødsel).
- **Fire skisser** (kroppens proporsjoner, ørene sett bakfra, ansiktet med
  snuteflekk- og øyeplassering, og kragen/ørene sett fra siden) er egne
  håndtegnede SVG-illustrasjoner, bygget og visuelt verifisert i et eget
  testoppsett før de ble lagt inn i oppskriften.
- Kolleksjonslisten på siste side inkluderer nå Felix og Molly i tillegg
  til Ellie og Pip. Den planlagte figuren Oliver er ikke laget ennå
  (venter på et referansebilde fra Renate).

## Bygge PDF-ene på nytt

```bash
python3 build_luna.py
CHROME=/opt/pw-browsers/chromium-1194/chrome-linux/chrome
"$CHROME" --headless --no-pdf-header-footer \
  --print-to-pdf=Luna-hekleoppskrift-LME.pdf luna_no.html
"$CHROME" --headless --no-pdf-header-footer \
  --print-to-pdf=Luna-hekleoppskrift-LME-EN.pdf luna_en.html
```

Bruker det delte byggesettet i `../_shared/lme_pattern_kit.py`.

Foreløpig kun selve oppskriften, ikke koblet til butikken ennå (samme status
som Pip, Felix og Molly hadde ved lansering).
