# Olivers ballerinasko (LME Baby Collection, Woodland Dreams)

Ferdig oppskrift: **`Olivers-ballerinasko-LME.pdf`** (norsk, 15 sider, A4) og
**`Olivers-ballerinasko-LME-EN.pdf`** (engelsk, 15 sider, A4).

Oliver-versjonen av `../ellies-ballerinasko/`. Klassiske babyballerinaer med
rund tå, et lite bjørneansikt med runde ører på tåpartiet, T-stropp, en
lyseblå picotkant øverst og to labbeavtrykk brodert på sålen, i fem
størrelser (prematur, 0-3, 3-6, 6-9, 9-12 måneder). Bygget etter Renates
eget referansebilde av de ferdige skoene (`oliver_ballerinasko_real.jpg`).

**Ingen sløyfe**, i tråd med resten av Oliver-kolleksjonen (`../oliver-bjorn/`,
`../oliver-rangle/`, `../oliver-smokkelenke/`, `../oliver-vognlenke/`): den
lyseblå kanten, T-stroppen og knappen er skoens eneste pynt, akkurat som
den lyseblå volangkragen er Olivers eneste pynt på ham selv. Derfor har
denne oppskriften **ingen egen sløyfe-side og ingen matchende hårsløyfe**,
i motsetning til Ellies versjon, som har begge deler. Det er grunnen til at
denne PDF-en er 2 sider kortere enn `../ellies-ballerinasko/` (15 mot 17
sider), samme mønster som når Oliver sine andre oppskrifter droppet
sløyfe-innhold Ellie sin versjon har.

To forskjeller fra referansebildet som er verdt å merke seg, sammenlignet
med Ellies sko:

- **Sålen har to labbeavtrykk brodert i lyseblått**, ikke et hjerte som på
  Ellies sko. Beskrivelsen på side 8 (Del 1: Sålen) er endret til å matche
  det faktiske bildet.
- **Knappen på T-stroppen er lyseblå**, ikke i en nøytral/naturfarge. Begge
  lukkingsalternativene (uten knapp, eller med myk heklet knapp) er beholdt
  fra Ellies oppskrift, men knappens farge er endret til lyseblått for å
  matche bildet.

Tallene i oppskriften følger samme flerstørrelses-konvensjon som
`../ellies-ballerinasko/`: `prematur (0-3) 3-6 (6-9) 9-12`. Egen
størrelsestabell med fotlengde på side 4.

## Bygge PDF-ene på nytt

```bash
python3 build_oliver_ballerinasko.py
CHROME=/opt/pw-browsers/chromium-1194/chrome-linux/chrome
"$CHROME" --headless --no-pdf-header-footer \
  --print-to-pdf=Olivers-ballerinasko-LME.pdf ballerinasko_no.html
"$CHROME" --headless --no-pdf-header-footer \
  --print-to-pdf=Olivers-ballerinasko-LME-EN.pdf ballerinasko_en.html
```

Bruker det delte byggesettet i `../_shared/lme_pattern_kit.py`.

Foreløpig kun selve oppskriften, ikke koblet til butikken ennå.
