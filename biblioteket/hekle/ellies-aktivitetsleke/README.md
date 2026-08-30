# Ellies aktivitetsleke (LME Baby Collection, Woodland Dreams)

Ferdig oppskrift: **`Ellies-aktivitetsleke-LME.pdf`** (norsk, 21 sider, A4) og
**`Ellies-aktivitetsleke-LME-EN.pdf`** (engelsk, 21 sider, A4).

Sjette og mest omfattende oppskrift i **LME Baby Collection "Woodland
Dreams"**. En myk aktivitetskube, ca. 11-12 cm per side, med seks sider:
Ellie med sløyfe og volangkrage, et babysikkert speil i en blomsterramme,
fire former (hjerte, stjerne, sirkel, trekant), en miniatyr-Ellie som
titter opp av en lomme, en knitreside med en liten sky med knitrefolie inni,
og en enkel bunn. To hjørneringer i tre og en perlekant langs toppen
fullfører kuben.

## Oppdatert 30. august 2026: kragen hekles for seg selv

Renate ba om at volangkragen på alle Ellie-oppskriftene skal hekles som en
egen del og sys fast etterpå, i stedet for direkte inn i eksisterende
masker. Samme konstruksjonsfeil som på smokkelenken og vognlenken:
Ellie-hodet på Ellie-siden hekles helt lukket (mink x 6 til slutt, 9
masker), det finnes ingen åpen kant å hekle kragen inn i der. Rettet:
kragen hekles nå som en egen, liten del (legg opp 24 lm, lukk til en ring,
1 omgang med viftemønster, denne oppskriftens egen "5 stav per vifte"-
variant beholdt, ikke smokkelenkens "3 stav" = 6 vifter), med eksplisitt
masketall, og sys fast rundt nedre kant av hodet med heftesting, før hodet
sys fast midt på panelet. Lagt til "heftesting" i forkortelsestabellen.

Kragens konstruksjon og plassering fikk ikke plass sammen med resten av
Ellie-siden på én side uten overflyt, så DEL 2 er nå delt over to sider i
stedet for én (21 sider totalt, opp fra 20). Alle sidetall lenger ut i
oppskriften, inkludert henvisningen til sikkerhetssiden på side 2 (nå side
19, ikke 18), er oppdatert tilsvarende.

## Oppdatert 28. august 2026: prikker på pannen lagt til

Samme mangel som ble oppdaget på resten av Ellie-serien: presisert at øyne
og nese broderes i svart (var uspesifisert), og lagt til 2 til 3 bittesmå
prikker i kremhvitt (franske knuter) på pannen, mellom ørene, på Ellie-siden
av kuben. Miniatyr-Ellien i lommen refererer fortsatt til Ellie-siden for
ansiktsdetaljer ("akkurat som på Ellie-siden"), og arver dermed samme
retting automatisk.

Redesignet fra en ring til en kube 3. august 2026, etter ønske fra Renate
om å matche en referanse for aktivitetskuber i handelen. Flette-siden
(seks maskehull og en snor) ble samme dag byttet ut med en knitre-side,
etter ønske om at "noe som knitrer" skulle erstatte knytingen. Gjenbruker
bevisst Ellie-hode-teknikken fra rangelen og vognlenkens medaljong, sky-
motivet fra `../ellies-vognlenke/`, og kule-motivet fra
`../ellies-smokkelenke/`, slik at kolleksjonen henger sammen visuelt og
barnet kjenner igjen formene på tvers av produktene.

Presisert samme dag (3. august 2026): teksten på knitre-siden (side 6 i
oversikten, DEL 6 i oppskriften) beskriver nå eksplisitt at det er et
knitrende stoff (knitrefolie) sydd inni skyen som lager knitrelyden når
barnet klemmer på den, ikke bare at skyen "knitrer".

Rettet samme dag: forsiden viste feilaktig et generisk Ellie-bilde merket
"ikke selve aktivitetskuben". Byttet til `aktivitetsleke_ref.jpg`, det
faktiske kube-referansebildet som allerede brukes i butikken.

**Sikkerhet er spesielt viktig her**, siden dette er oppskriften med flest
påsydde smådeler og flest ulike materialer (garn, tre, speil, knitrefolie)
i hele kolleksjonen. Speilet og knitrefolien (kun babysikkert akryl/plast,
aldri glass, og alltid helt innsydd) skal aldri ligge løst, og
hjørneringenes perledusker skal aldri overstige ca. 6-8 cm. Side 19 av 21
er viet sikkerhet i sin helhet.

Oppdatert 4. august 2026 (Renate): fjernet "Fotoveiledning"-siden og
"Videoveiledning"-boksen, siden oppskriften er salgsklar og ligger live i
butikken. Ekte bilder/video legges inn i egne seksjoner den dagen de
faktisk finnes, ikke som tomme plassholdere før det.

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
