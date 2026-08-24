# Ellies smokkelenke (LME Baby Collection, Woodland Dreams)

Ferdig oppskrift: **`Ellies-smokkelenke-LME.pdf`** (norsk, 16 sider, A4) og
**`Ellies-smokkelenke-LME-EN.pdf`** (engelsk, 16 sider, A4).

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

## Oppdatert 24. august 2026: kinnflekker og snute lagt til på hodet

Renate hadde begynt å hekle smokkelenken og meldte fra at hodebeskrivelsen
manglet noe: ingen fargeskifte til hvit/naturhvit rundt øyne og nese, og
ingen forklaring på hvordan nesepartiet skulle bygges ut i 3D. Dette gikk
gjennom to rettinger samme dag:

1. Første retting la til én liten snute, men Renate presiserte at det også
   manglet en beskrivelse av det lyse partiet rundt øyne og kinn.
2. Andre retting la til ett stort, sammenhengende ansiktsfelt (samme
   teknikk som den fulle Ellie-oppskriften), men Renate rettet dette igjen:
   **det er ikke ett felt som danner en ring/maske rundt ansiktet, det er
   to atskilte, ovale kinnflekker, én under hvert øye, som smalner inn og
   møtes nede ved snuten**, med synlig brunt både mellom flekkene (nedover
   neseryggen) og utenfor dem.

Endelig løsning, i et eget oppslag "KINNFLEKKENE OG SNUTEN" på side 8 til 9
av 16:

- **To** flate, kremhvite **kinnflekker** hekles hver for seg (kjede 6, 14
  fm totalt per flekk, samme enkle, entydige rundt-for-rundt-teknikk som
  snuten, ingen tvetydig "øk jevnt fordelt"-instruks), stoppes IKKE, og sys
  flatt fast på hver sin side av hodet, med den smale tuppen inn mot
  midten og den brede enden opp mot hvert øye.
- En liten, flat oval **snute** hekles separat i kremhvit (kjede 4, 10 fm
  totalt), stoppes lett, og sys fast midt mellom de to kinnflekkenes tupper,
  nederst.
- Øynene broderes i svart øverst på hver kinnflekk. Nesen broderes i svart,
  øverst på selve snuten, midt på. Begge farger er eksplisitt angitt.

Montering-sjekklisten (siste side) minner om å sy fast de to kinnflekkene
og snuten, i tilfelle det ikke allerede er gjort.

Kun Ellies smokkelenke er oppdatert. De andre fem karakterenes
smokkelenker er bevisst forenklet uten egne kinnflekker/snuteflekk (samme
mønster som Felix' smokkelenke), og er ikke endret med mindre Renate ber
om det.

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
