# Olivers aktivitetsleke (LME Baby Collection, Woodland Dreams)

Ferdig oppskrift: **`Olivers-aktivitetsleke-LME.pdf`** (norsk, 20 sider, A4) og
**`Olivers-aktivitetsleke-LME-EN.pdf`** (engelsk, 20 sider, A4).

Oliver-versjonen av `../ellies-aktivitetsleke/`. En myk aktivitetskube, ca.
11-12 cm per side, med seks sider: Oliver med sin lyseblå volangkrage, et
babysikkert speil i en lyseblå blomsterramme, en formside med hjerte,
stjerne, blad og sky, en miniatyr-Oliver som titter opp av en lyseblå
lomme, en knitreside med en liten stjernehimmel-sky med knitrefolie inni,
og en enkel bunn. To hjørneringer i tre og en perlekant langs toppen
fullfører kuben. Bygget etter Renates eget referansebilde av den ferdige
kuben (`oliver_aktivitetsleke_real.jpg`).

**Ingen sløyfe**, i tråd med resten av Oliver-kolleksjonen: Ellies
tilsvarende side har både en sløyfe og en volangkrage på hodet sitt, men
Oliver-siden her har bare den lyseblå volangkragen, akkurat som han aldri
har sløyfe noe annet sted i sin egen kolleksjon. Siden Ellie-siden i
utgangspunktet allerede hadde krage i tillegg til sløyfe, trengtes det ikke
noen egen ny "krage-side" for Oliver, sløyfe-avsnittet er ganske enkelt
fjernet fra samme side, og kragen står igjen som Olivers eneste pynt. Det
er derfor denne PDF-en holder seg på samme sidetall som Ellies versjon (20
sider), i motsetning til rangelen og vognlenken, som ble kortere uten
sløyfe-siden.

Formsiden og noen av motivene er tilpasset det faktiske referansebildet
Renate lastet opp, som skiller seg noe fra Ellies aktivitetsleke:

- **Formsiden** viser hjerte, stjerne, blad og sky, i tråd med det som
  faktisk er synlig på bildet, i stedet for Ellies hjerte/stjerne/sirkel/
  trekant-kombinasjon. Stjernen har et lite, sovende ansikt brodert på,
  akkurat som på bildet.
- **Speil-siden** har en lyseblå blomsterramme i stedet for Ellies
  pudderrosa.
- **Lomme-siden** har en lyseblå lomme (ikke salviegrønn som hos Ellie),
  som matcher fargen på lommen i bildet.
- **Knitre-siden** er en lyseblå sky med noen få bittesmå, kremhvite
  stjerner brodert rundt, en liten "stjernehimmel"-variant av Ellies
  enklere kremhvite sky, igjen for å matche referansebildet.

Gjenbruker bevisst bjørnehode-teknikken fra rangelen og vognlenkens
medaljong, sky-motivet fra `../oliver-vognlenke/`, og kule-motivet fra
`../oliver-smokkelenke/`, slik at kolleksjonen henger sammen visuelt og
barnet kjenner igjen formene på tvers av produktene, samme prinsipp som i
Ellies versjon.

**Sikkerhet er spesielt viktig her**, siden dette er oppskriften med flest
påsydde smådeler og flest ulike materialer (garn, tre, speil, knitrefolie)
i hele Oliver-kolleksjonen. Speilet og knitrefolien (kun babysikkert
akryl/plast, aldri glass, og alltid helt innsydd) skal aldri ligge løst, og
hjørneringenes perledusker skal aldri overstige ca. 6-8 cm. Side 18 av 20
er viet sikkerhet i sin helhet.

## Bygge PDF-ene på nytt

```bash
python3 build_oliver_aktivitetsleke.py
CHROME=/opt/pw-browsers/chromium-1194/chrome-linux/chrome
"$CHROME" --headless --no-pdf-header-footer \
  --print-to-pdf=Olivers-aktivitetsleke-LME.pdf aktivitetsleke_no.html
"$CHROME" --headless --no-pdf-header-footer \
  --print-to-pdf=Olivers-aktivitetsleke-LME-EN.pdf aktivitetsleke_en.html
```

Bruker det delte byggesettet i `../_shared/lme_pattern_kit.py`.

Lagt til i butikken (`/butikk/olivers-aktivitetsleke`) 4. august 2026.
