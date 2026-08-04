# Lunas aktivitetsleke (LME Baby Collection, Woodland Dreams)

Ferdig oppskrift: **`Lunas-aktivitetsleke-LME.pdf`** (norsk, 20 sider, A4) og
**`Lunas-aktivitetsleke-LME-EN.pdf`** (engelsk, 20 sider, A4).

Følger opp `../ellies-aktivitetsleke/`, tilpasset Luna, den lille kaninen, 4.
august 2026, etter Renates referansebilde av en profesjonelt stylet
kanin-aktivitetskube. Samme konstruksjon som Ellies versjon: en myk
aktivitetskube, ca. 11-12 cm per side, med seks sider (fem med motiv, én
enkel bunn), sydd sammen av seks grunnkvadrater med indre skumstiving, to
hjørneringer i tre og en perlekant langs toppen.

Luna-siden erstatter Ellie-siden (sløyfe og volangkrage i rosa i stedet for
pudderrosa), speil-siden har fått en rosa blomsterramme i stedet for Ellies
pudderrosa ramme, og lomme-siden har en miniatyr-Luna med avlange ører i
stedet for miniatyr-Ellie. Form-siden bytter ut trekanten med et blad i
salviegrønt, siden referansebildet tydelig viser et blad ved siden av
hjertet, mens stjernen er heklet i rosa med prikker og et lite sovende
ansikt (broderte lukkede øyne og kinn), i stedet for Ellies enkle,
salviegrønne stjerne, for å matche det som faktisk vises på bildet.
Knitre-siden (skyen) har samme konstruksjon og knitrefolie som Ellies
versjon, med et valgfritt broderi-tillegg (lukkede øyne, smil og noen få
stjerner rundt), siden referansebildet viser en sky med et søtt, smilende
uttrykk.

**Sikkerhet er spesielt viktig her**, samme som i Ellies versjon, siden dette
er oppskriften med flest påsydde smådeler og flest ulike materialer (garn,
tre, speil, knitrefolie) i hele kolleksjonen. Speilet og knitrefolien (kun
babysikkert akryl/plast, aldri glass, og alltid helt innsydd) skal aldri
ligge løst, og hjørneringenes perledusker skal aldri overstige ca. 6-8 cm.
Side 18 av 20 er viet sikkerhet i sin helhet.

Forsiden bruker `luna_aktivitetsleke_real.jpg`, det faktiske referansebildet
av kuben (konvertert fra PNG til JPEG, kvalitet 90), tydelig merket
"stiluttrykk-referanse", samme mønster som Ellies versjon.

## Bygge PDF-ene på nytt

```bash
python3 build_luna_aktivitetsleke.py
CHROME=/opt/pw-browsers/chromium-1194/chrome-linux/chrome
"$CHROME" --headless --no-pdf-header-footer \
  --print-to-pdf=Lunas-aktivitetsleke-LME.pdf aktivitetsleke_no.html
"$CHROME" --headless --no-pdf-header-footer \
  --print-to-pdf=Lunas-aktivitetsleke-LME-EN.pdf aktivitetsleke_en.html
```

Bruker det delte byggesettet i `../_shared/lme_pattern_kit.py`.

Foreløpig kun selve oppskriften, ikke koblet til butikken ennå.
