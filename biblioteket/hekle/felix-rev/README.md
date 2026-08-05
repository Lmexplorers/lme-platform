# Felix, den lille reven (LME Baby Collection, Woodland Dreams)

Ferdig oppskrift: **`Felix-hekleoppskrift-LME.pdf`** (norsk, 20 sider, A4) og
**`Felix-hekleoppskrift-LME-EN.pdf`** (engelsk, 20 sider, A4).

Tredje figur i **LME Baby Collection "Woodland Dreams"**, etter Ellie og Pip.
En liten, rolig rev med spisse ører, en flat snuteflekk (som Ellies
ansiktsfelt, ikke en fremstikkende snute som Pip), og en stor, buskete hale i
to farger som går fra rustoransje til kremhvitt. Ingen sløyfe, kun en
salviegrønn volangkrage, samme modell som Ellie og Pip. Ca. 20 til 22 cm
sittende. Middels vanskelighetsgrad.

Et helt originalt LME-design, laget etter samme detaljerte mal-prompt som Pip
(avtalt med Renate 3. august 2026, som ønsker samme mal brukt på alle
figurene for en konsekvent serie), med Renates eget referansebilde
(stiluttrykk, ikke det ferdige produktet) for forsiden og ansiktsdiagrammet.
Ikke kopiert fra eksisterende design eller oppskrifter.

- **Halen** er Felix sin signaturdel: hekles som en stor, fast stoppet form
  (ikke et flatt felt som Pips pigger), rustoransje som skifter til kremhvitt
  mot spissen, sydd fast skrått oppover nederst på ryggen.
- **Ørene** gjenbruker Pips to-lags teknikk (utside/innside sydd sammen), men
  brettes og sys til en spiss, trekantet form i stedet for å holdes runde og
  flate.
- **Dobbel øyne-løsning**, samme mønster som Ellie og Pip: Versjon A med
  16 mm sikkerhetsøyne (fra 3 år) og Versjon B med broderte øyne
  (babyvennlig, fra fødsel).
- **Fire skisser** (kroppens proporsjoner, ansiktet med snuteflekk- og
  øyeplassering, kroppen/halen sett bakfra, og kragen/halen sett fra siden)
  er egne håndtegnede SVG-illustrasjoner, bygget og visuelt verifisert i et
  eget testoppsett før de ble lagt inn i oppskriften.
- Kolleksjonslisten på siste side inkluderer nå Pip i tillegg til Ellie og
  Ellie-tilbehøret. De planlagte figurene Luna, Molly og Oliver er ikke
  laget ennå (Oliver venter på et referansebilde fra Renate).

## Bygge PDF-ene på nytt

```bash
python3 build_felix.py
CHROME=/opt/pw-browsers/chromium-1194/chrome-linux/chrome
"$CHROME" --headless --no-pdf-header-footer \
  --print-to-pdf=Felix-hekleoppskrift-LME.pdf felix_no.html
"$CHROME" --headless --no-pdf-header-footer \
  --print-to-pdf=Felix-hekleoppskrift-LME-EN.pdf felix_en.html
```

Bruker det delte byggesettet i `../_shared/lme_pattern_kit.py`.

Foreløpig kun selve oppskriften, ikke koblet til butikken ennå (samme status
som Pip hadde ved lansering).
