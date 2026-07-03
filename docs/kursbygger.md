# LME Kursbygger

Lag minikurs og større kurs uten kode, rett i nettleseren.

## Slik bruker du den

1. Gå til **`/kursbygger`** (siden er ikke lenket opp for medlemmer, men den
   dukker også opp som egen flis på `/academy` når du har redigeringsmodus på,
   altså `#rediger` i adressen eller `Ctrl/Cmd+Shift+E`).
2. Velg **＋ Nytt minikurs** (3 leksjoner) eller **＋ Nytt større kurs**
   (8 leksjoner med modul-forslag).
3. Fyll inn tittel, ingress, "hva du lærer" og leksjonene. Tom linje i
   innholdsfeltet blir nytt avsnitt. Tips-feltet lager den gule tipsboksen.
   - Start en linje med `## ` for en liten rosa mellomoverskrift i leksjonen,
     for eksempel `## Slik kommer du i gang`.
   - Skriv `**ord**` for tykk skrift, for eksempel `Dette er **viktig**.`
   - Hver leksjon kan få et **bilde**: velg en bildefil i leksjonskortet, så
     krympes det automatisk og vises øverst i leksjonen.
4. Se forhåndsvisningen til høyre; den oppdateres mens du skriver.
5. Trykk **💾 Lagre kurset**. Første gang blir du bedt om passordet (samme som
   for kursredigering, `COURSE_EDIT_PASSWORD`).
6. Kurset får sin egen side på **`/academy/kurs/<adresse>`** og vises
   automatisk under "Dine egne kurs" på akademi-forsiden når det er publisert.
   Merk: rett etter lagring kan skyen bruke opptil ett minutt på å vise kurset
   på lenken; kurssiden prøver selv igjen noen ganger før den gir beskjed.

## Engelsk

Trykk **🇬🇧 Vis engelske felt** for å skrive engelsk selv, eller
**✨ Oversett til engelsk automatisk** (krever innlogging; bruker
`/api/translate`). Tomme engelske felt faller tilbake til norsk tekst.

## Kursbevis

Er "Med kursbevis" på, får kurssiden en knapp der medlemmet skriver navnet
sitt og får et utskriftsvennlig kursbevis i LME-stil.

## Teknisk

- **Lagring:** JSON i Cloudflare KV (`BUILDER_KV`), nøkkel
  `lme-builder:kurs:<slug>` pluss indeksen `lme-builder:kurs-index`.
- **API:** `functions/api/kurs.js` (GET liste, GET `?slug=`, POST
  `save`/`delete` med passord).
- **Visning:** `academy/kurs.html` rendrer kurset; `_redirects` har regelen
  `/academy/kurs/* /academy/kurs.html 200`.
- **Avpublisering:** skru av "Publisert" og lagre; kurset forsvinner fra
  forsiden, men adressen virker fortsatt for den som har den.
