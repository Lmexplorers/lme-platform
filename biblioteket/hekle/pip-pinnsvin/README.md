# Pip, det lille pinnsvinet (LME Baby Collection, Woodland Dreams)

Ferdig oppskrift: **`Pip-hekleoppskrift-LME.pdf`** (norsk, 20 sider, A4) og
**`Pip-hekleoppskrift-LME-EN.pdf`** (engelsk, 20 sider, A4).

Andre figur i **LME Baby Collection "Woodland Dreams"**, etter Ellie. Et lite,
nysgjerrig pinnsvin, ca. 22 til 24 cm høyt sittende, med spiss snute (ikke
rund), myke pigger som aldri stikker, og en salviegrønn volangkrage, akkurat
som Ellie. Heklet i de samme varme naturfargene som resten av kolleksjonen.
Middels vanskelighetsgrad.

Et helt originalt LME-design, laget etter et detaljert prompt fra Renate
3. august 2026, med eget referansebilde (stiluttrykk, ikke det ferdige
produktet) for forsiden og ansiktsdiagrammet. Ikke kopiert fra eksisterende
design eller oppskrifter.

- **Piggene** er Pips signaturdel og den nyeste teknikken i hele kolleksjonen:
  myke løkkemasker (løkketeknikk) i stedet for stive pigger, sydd på som ett
  langt, lakkemasket felt langs midtlinjen fra pannen, over hodet og ned hele
  ryggen.
- **Dobbel øyne-løsning**, samme mønster som Ellie: Versjon A med 16 mm
  sikkerhetsøyne (fra 3 år) og Versjon B med broderte øyne (babyvennlig,
  fra fødsel).
- **Fire skisser** (kroppens proporsjoner, ansiktet med øyeplassering,
  piggene sett bakfra, og kragen/piggene sett fra siden) er egne håndtegnede
  SVG-illustrasjoner, bygget og visuelt verifisert i et eget testoppsett før
  de ble lagt inn i oppskriften, for å unngå feilrenderte diagrammer.
- Kolleksjonslisten på siste side viser foreløpig kun Ellie og de fem
  Ellie-tilbehørsoppskriftene. De planlagte figurene Luna, Felix, Oliver og
  Molly er ikke laget ennå.

## Bygge PDF-ene på nytt

```bash
python3 build_pip.py
CHROME=/opt/pw-browsers/chromium-1194/chrome-linux/chrome
"$CHROME" --headless --no-pdf-header-footer \
  --print-to-pdf=Pip-hekleoppskrift-LME.pdf pip_no.html
"$CHROME" --headless --no-pdf-header-footer \
  --print-to-pdf=Pip-hekleoppskrift-LME-EN.pdf pip_en.html
```

Bruker det delte byggesettet i `../_shared/lme_pattern_kit.py`.

Ferdige kopier til nedlasting i butikken legges i
`butikk/nedlasting/oppskrifter/pip-pinnsvin.pdf` og `pip-pinnsvin-en.pdf`
når Pip kobles til butikken (ikke gjort ennå, se merknad i commit-loggen).
