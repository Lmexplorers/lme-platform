# Ellies rangle (LME Baby Collection, Woodland Dreams)

Ferdig oppskrift: **`Ellies-rangle-LME.pdf`** (norsk, 13 sider, A4) og
**`Ellies-rangle-LME-EN.pdf`** (engelsk, 13 sider, A4).

Tredje oppskrift i **LME Baby Collection "Woodland Dreams"**. Et lite
dådyrhode (miniatyrutgave av Ellie) på en trering, ca. 13 til 15 cm høyt, med
sløyfe, volangkrage rundt halsen og en rangleboks trygt gjemt inni hodet.
Sløyfen og kragen erstattet de tidligere valgfrie "hornene" 3. august 2026,
etter Renates referansebilde, slik at produktbildet i butikken stemmer med
oppskriften.

Samme sikkerhetsfokus som `../ellies-smokkelenke/`: en egen side minner om at
rangleboksen aldri må kunne tas ut, og at ferdig produkt må kontrolleres mot
gjeldende lokale krav før salg.

## Oppdatert 28. august 2026: kragen hekles for seg selv

Renate ba om at volangkragen på alle Ellie-oppskriftene skal hekles som en
egen del og sys fast etterpå, i stedet for direkte inn i eksisterende
masker. I motsetning til smokkelenken hadde denne oppskriften allerede et
ekte, åpent maskeantall å hekle fra (halstubens 12 m), så det var teknisk
sett ikke en konstruksjonsfeil her, men rettet for konsekvens på tvers av
hele kolleksjonen: legg opp 18 lm, lukk til en ring, hekl viftemønsteret
inn i ringen (6 vifter), sy den ferdige kragen fast med heftesting rundt
halstubens øverste kant. Oppdaget i samme slengen at det gamle maskeantallet
i teksten ("6 vifter totalt" på et 12-maskers grunnlag) ikke stemte
matematisk (12 delt på 3 masker per vifte gir 4, ikke 6), rettet ved å gå
over til 18 masker i den nye, separate ringen. Lagt til "stav" og
"heftesting" i forkortelsestabellen, som ble brukt av kragen uten å være
forklart.

## Oppdatert 28. august 2026: prikker på pannen lagt til

Samme mangel som ble oppdaget på smokkelenken og hoved-Ellie-oppskriften:
referansebildet av Ellie viser flere små kremhvite prikker på pannen, men
dette var aldri beskrevet her. Lagt til i ansikt-avsnittet: 2 til 3 bittesmå
prikker broderes i kremhvitt (franske knuter eller tette satengstingpunkter)
på pannen, mellom ørene. Samtidig presisert at nesen broderes i svart
(fargen var tidligere ikke angitt). Ørenes farger var allerede riktige
("kremhvitt", ingen fargefeil å rette her).

- **Garn:** samme Bystrikk Merino som resten av kolleksjonen, pluss en liten
  rest av pudderrosa til sløyfen og kragen.
- Forsidebildet er et beskjært utsnitt av Renates eget referansebilde for
  rangelen (tydelig merket "stiluttrykk-referanse" i bildeteksten), siden
  rangelen selv ikke er heklet og fotografert ennå.

Rettet 3. august 2026: forsiden viste feilaktig et generisk Ellie-bilde
merket "ikke selve rangelen". Byttet til `rangle_ref.jpg`, det faktiske
rangel-referansebildet som allerede brukes i butikken.

Oppdatert 4. august 2026 (Renate): fjernet "Fotoveiledning"-siden og
"Videoveiledning"-boksen, siden oppskriften er salgsklar og ligger live i
butikken. Ekte bilder/video legges inn i egne seksjoner den dagen de
faktisk finnes, ikke som tomme plassholdere før det.

## Bygge PDF-ene på nytt

```bash
python3 build_rangle.py
CHROME=/opt/pw-browsers/chromium-1194/chrome-linux/chrome
"$CHROME" --headless --no-pdf-header-footer \
  --print-to-pdf=Ellies-rangle-LME.pdf rangle_no.html
"$CHROME" --headless --no-pdf-header-footer \
  --print-to-pdf=Ellies-rangle-LME-EN.pdf rangle_en.html
```

Bruker det delte byggesettet i `../_shared/lme_pattern_kit.py`.

Ferdige kopier til nedlasting i butikken ligger i
`butikk/nedlasting/oppskrifter/ellies-rangle.pdf` og `ellies-rangle-en.pdf`.
