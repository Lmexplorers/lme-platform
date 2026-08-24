# Ellies smokkelenke (LME Baby Collection, Woodland Dreams)

Ferdig oppskrift: **`Ellies-smokkelenke-LME.pdf`** (norsk, 15 sider, A4) og
**`Ellies-smokkelenke-LME-EN.pdf`** (engelsk, 15 sider, A4).

Andre oppskrift i **LME Baby Collection "Woodland Dreams"**, etter
`../ellie-dadyret/`. Et forenklet dådyrhode inspirert av Ellie, med en liten
sløyfe mellom ørene, en blomst, et blad og heklede kuler, tredd/sydd sammen
til en smokkelenke.

Oppdatert 4. august 2026 etter Renates referansebilder av profesjonelt
stylede smokkelenker: lagt til en pudderrosa volangkrage rundt halsen (ny
egen side, "DEL 2"), én stjerneformet treperle blant de heklede kulene, og
en heklet snorløkke i enden som en kjøpt smokkering/adapterring tres
gjennom, i stedet for at ringen festes rett på siste kule. Materiallisten
er også oppdatert: klipsen er nå beskrevet som en tre-kuleklips med
innkapslet fjærmekanisme kjøpt spesielt til smokkelenker (matcher
referansebildene), ikke en flat treklype uten fjær.

**Sikkerhet er hovedpoenget med denne oppskriften.** Maks total lengde er satt
til 22 cm, i tråd med prinsippet i den europeiske standarden EN 12586 for
smokkeholdere (en enkel klips + snor skal ikke kunne danne en løkke rundt
barnets hals). Oppskriften minner flere steder om at ferdig produkt må
kontrolleres mot gjeldende lokale krav før salg.

## Oppdatert 24. august 2026: snute lagt til på hodet

Renate hadde begynt å hekle smokkelenken og meldte fra at hodebeskrivelsen
manglet noe: ingen fargeskifte til hvit/naturhvit rundt øyne og nese, og
ingen forklaring på hvordan nesepartiet skulle bygges ut i 3D. Løsningen
(lagt til som ny egen side, "SNUTEN (KREMHVIT)", side 8 av 15) er hentet
fra samme teknikk som den fulle Ellie-oppskriften (`../ellie-dadyret/`)
allerede bruker, forenklet og skalert ned til denne miniatyrstørrelsen:

- En liten, flat oval snute hekles separat i kremhvit (kjede 4, 10 fm
  totalt, ett enkelt rundt-for-rundt-trinn, ingen tvetydig
  "øk jevnt fordelt"-instruks).
- Stoppes lett før den sys fast, slik at den hever seg fra hodet i stedet
  for å ligge flatt.
- Sys midt foran på nedre halvdel av hodet, over kanten der volangkragen
  senere hekles på.
- Øynene broderes rett over snuten, nesen broderes øverst på selve snuten.
  Dette gir både fargeskiftet og den fysiske 3D-oppbyggingen Renate
  etterlyste.

Montering-sjekklisten (siste side) fikk også et nytt første punkt som
minner om å sy fast snuten, i tilfelle det ikke allerede er gjort.

Kun Ellies smokkelenke er oppdatert. De andre fem karakterenes
smokkelenker er bevisst forenklet uten egen snuteflekk (samme mønster som
Felix' smokkelenke), og er ikke endret med mindre Renate ber om det.

- **Garn:** samme Bystrikk Merino + rester av pudderrosa/salviegrønt som
  resten av kolleksjonen.
- **Nye hekleteknikker i denne oppskriften:** stav og halvstav (til blomst og
  blad), i tillegg til fastmaske/luftmaske/kjedemaske. Forkortelsestabellen
  viser både norske og amerikanske (US) hekletermer, slik designbriefen ba om.

Oppdatert 4. august 2026 (Renate): forsidebildet var feil, viste den gamle
lyseblå smokkelenken i stedet for den korrekte pudderrosa versjonen. Byttet
til riktig referansebilde, samme fil brukt i butikken
(`images/oppskrift-ellies-smokkelenke.jpg`). Samtidig fjernet
"Fotoveiledning"-siden og "Videoveiledning"-boksen, siden oppskriften er
salgsklar og ligger live i butikken. Ekte bilder/video legges inn i egne
seksjoner den dagen de faktisk finnes, ikke som tomme plassholdere før det.

## Bygge PDF-ene på nytt

```bash
python3 build_smokkelenke.py
CHROME=/opt/pw-browsers/chromium-1194/chrome-linux/chrome
"$CHROME" --headless --no-pdf-header-footer \
  --print-to-pdf=Ellies-smokkelenke-LME.pdf smokkelenke_no.html
"$CHROME" --headless --no-pdf-header-footer \
  --print-to-pdf=Ellies-smokkelenke-LME-EN.pdf smokkelenke_en.html
```

Skriptet bruker det delte byggesettet i `../_shared/lme_pattern_kit.py` for
CSS/sideoppsett, slik at alle Ellie-oppskriftene ser like ut uten å gjenta
stilkoden i hvert skript.

Ferdige kopier til nedlasting i butikken ligger i
`butikk/nedlasting/oppskrifter/ellies-smokkelenke.pdf` og
`ellies-smokkelenke-en.pdf`.
