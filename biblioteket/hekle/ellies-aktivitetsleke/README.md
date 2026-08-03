# Ellies aktivitetsleke (LME Baby Collection, Woodland Dreams)

Ferdig oppskrift: **`Ellies-aktivitetsleke-LME.pdf`** (norsk, 21 sider, A4) og
**`Ellies-aktivitetsleke-LME-EN.pdf`** (engelsk, 21 sider, A4).

Sjette og mest omfattende oppskrift i **LME Baby Collection "Woodland
Dreams"**. En myk aktivitetskube, ca. 11-12 cm per side, med seks sider:
Ellie med sløyfe og volangkrage, et babysikkert speil i en blomsterramme,
fire former (hjerte, stjerne, sirkel, trekant), en miniatyr-Ellie som
titter opp av en lomme, en flettesside med heklede maskehull og snor, og
en enkel bunn. To hjørneringer i tre og en perlekant langs toppen
fullfører kuben.

Redesignet fra en ring til en kube 3. august 2026, etter ønske fra Renate
om å matche en referanse for aktivitetskuber i handelen. Gjenbruker
bevisst Ellie-hode-teknikken fra rangelen og vognlenkens medaljong, og
kule-motivet fra `../ellies-smokkelenke/`, slik at kolleksjonen henger
sammen visuelt og barnet kjenner igjen formene på tvers av produktene.

**Sikkerhet er spesielt viktig her**, siden dette er oppskriften med flest
påsydde smådeler og flest ulike materialer (garn, tre, speil, snor) i hele
kolleksjonen. Speilet (kun babysikkert akryl/plast, aldri glass) skal
alltid sys inn i en helt lukket lomme, flettesnoren skal aldri overstige
ca. 30 cm, og hjørneringenes perledusker skal aldri overstige ca. 6-8 cm.
Side 19 av 21 er viet sikkerhet i sin helhet.

## Bygge PDF-ene på nytt

```bash
python3 build_aktivitetsleke.py
CHROME=/opt/pw-browsers/chromium-1194/chrome-linux/chrome
"$CHROME" --headless --no-pdf-header-footer \
  --print-to-pdf=Ellies-aktivitetsleke-LME.pdf aktivitetsleke_no.html
"$CHROME" --headless --no-pdf-header-footer \
  --print-to-pdf=Ellies-aktivitetsleke-LME-EN.pdf aktivitetsleke_en.html
```

Bruker det delte byggesettet i `../_shared/lme_pattern_kit.py`.

Ferdige kopier til nedlasting i butikken ligger i
`butikk/nedlasting/oppskrifter/ellies-aktivitetsleke.pdf` og
`ellies-aktivitetsleke-en.pdf`.
