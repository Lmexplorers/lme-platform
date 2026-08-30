# Ellies vognlenke (LME Baby Collection, Woodland Dreams)

Ferdig oppskrift: **`Ellies-vognlenke-LME.pdf`** (norsk, 14 sider, A4) og
**`Ellies-vognlenke-LME-EN.pdf`** (engelsk, 14 sider, A4).

Fjerde oppskrift i **LME Baby Collection "Woodland Dreams"**.

## Oppdatert 30. august 2026: kragen hekles for seg selv

Renate ba om at volangkragen på alle Ellie-oppskriftene skal hekles som en
egen del og sys fast etterpå, i stedet for direkte inn i eksisterende
masker. Samme konstruksjonsfeil som på smokkelenken: Ellie-medaljongens
hode hekles helt lukket (mink x 6 til slutt, 9 masker), det finnes ingen
åpen kant å hekle kragen inn i der. Rettet: kragen hekles nå som en egen,
liten del (legg opp 24 lm, lukk til en ring, 1 omgang med viftemønster =
6 vifter, samme 24-maskers/4-masker-per-vifte-oppskrift som smokkelenken,
siden medaljongens bredeste omgang også er 24 masker), med eksplisitt
masketall, og sys fast rundt nedre del av medaljonghodet med heftesting
etterpå. Lagt til "heftesting" i forkortelsestabellen, som ble brukt uten
å være forklart. Sideantallet er uendret (14 sider): kragens konstruksjon
og plassering ble først forsøkt splittet på to sider, men begge rendret
tynt, så de er slått sammen til én tettere side igjen, samme vurdering som
ble gjort på rangelen. Rettet samtidig en sidetall-referanse som hadde
kommet skjevt ut av denne sideflyttingen: sikkerhetssiden omtales nå riktig
som side 12, ikke 13.

## Oppdatert 28. august 2026: prikker på pannen lagt til

Samme mangel som ble oppdaget på smokkelenken, rangelen og hoved-Ellie-
oppskriften: teksten "brodér et lite ansikt akkurat som på rangelen og
smokkelenken" var for vag. Presisert direkte: svarte øyne og nese, og 2 til
3 bittesmå prikker i kremhvitt (franske knuter) på pannen, mellom ørene.

Oppdatert 4. august 2026 etter Renates referansebilder av profesjonelt
stylede vognlenker: bygget fullstendig om fra sju flate motiver (sky, sol,
blad, blomst, stjerne, sommerfugl) til en kjede av heklede kuler og
tre-mellomperler med Ellie-medaljongen (nå med pudderrosa volangkrage) i
midten, en blomst og et blad på hver side, og to trering-rangler (trering
+ dinglende heklet kule) barnet kan gripe etter. Festes i hver ende med en
tre-kuleklips med innkapslet fjærmekanisme (samme klipstype som
smokkelenke-serien), i stedet for det tidligere valget mellom treklips,
plastklips eller trering.

Oppdatert igjen samme dag (Renate): forsidebildet (`vognlenke_ref.jpg`) hadde
en tydelig blå kule i kjeden, som ikke stemte med noe i materiallisten
(brunt, kremhvitt, pudderrosa, salviegrønt, ingen blått). Byttet forsidebildet
til Ellies eget referansebilde (`ellie_ref.png`, samme fil som resten av
Ellie-kolleksjonen bruker), samme ærlige "stiluttrykk-referanse"-behandling
som de fem andre karakterenes vognlenke- og smokkelenke-forsider allerede
har, i stedet for et produktbilde som ikke stemte. Oppdatert i butikken
(`images/oppskrift-ellies-vognlenke.jpg`) også.

Samme sikkerhetsfokus som `../ellies-smokkelenke/` og `../ellies-rangle/`:
side 12 forklarer hvorfor lengden holdes kort (generelt EN 71-prinsipp om at
snorer/kjeder for barn under 36 måneder skal være så korte som praktisk
mulig), med en tydelig LME-anbefaling (maks 35-40 cm mellom klipsene, ingen
del løsere enn 6-8 cm), IKKE en påstått eksakt regelsitat, pluss en
gjentatt oppfordring om å sjekke ferdig produkt mot gjeldende lokale krav.

- **Garn:** samme Bystrikk Merino + rester som resten av kolleksjonen.

Oppdatert 4. august 2026 (Renate): fjernet "Fotoveiledning"-siden og
"Videoveiledning"-boksen, siden oppskriften er salgsklar og ligger live i
butikken. Ekte bilder/video legges inn i egne seksjoner den dagen de
faktisk finnes, ikke som tomme plassholdere før det.

## Bygge PDF-ene på nytt

```bash
python3 build_vognlenke.py
CHROME=/opt/pw-browsers/chromium-1194/chrome-linux/chrome
"$CHROME" --headless --no-pdf-header-footer \
  --print-to-pdf=Ellies-vognlenke-LME.pdf vognlenke_no.html
"$CHROME" --headless --no-pdf-header-footer \
  --print-to-pdf=Ellies-vognlenke-LME-EN.pdf vognlenke_en.html
```

Bruker det delte byggesettet i `../_shared/lme_pattern_kit.py`.

Ferdige kopier til nedlasting i butikken ligger i
`butikk/nedlasting/oppskrifter/ellies-vognlenke.pdf` og
`ellies-vognlenke-en.pdf`.
