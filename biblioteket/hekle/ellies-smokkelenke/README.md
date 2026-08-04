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
barnets hals). Side 13 av 15 er viet sikkerhet, og oppskriften minner flere
steder om at ferdig produkt må kontrolleres mot gjeldende lokale krav før
salg.

- **Garn:** samme Bystrikk Merino + rester av pudderrosa/salviegrønt som
  resten av kolleksjonen.
- **Nye hekleteknikker i denne oppskriften:** stav og halvstav (til blomst og
  blad), i tillegg til fastmaske/luftmaske/kjedemaske. Forkortelsestabellen
  viser både norske og amerikanske (US) hekletermer, slik designbriefen ba om.
- **Fotoveiledning:** siden har fire plassholderbokser for egne
  arbeidsbilder (ikke ekte foto ennå).
- **QR-kode:** siden om stell/vask har en tom plassholderboks for en
  fremtidig QR-kode til videoveiledning.

Rettet 3. august 2026: forsiden manglet et produktbilde. Har nå fått et
eget stiluttrykk-referansebilde (`smokkelenke_ref.jpg`, samme bilde som
brukes i butikken), i stedet for ingenting.

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
