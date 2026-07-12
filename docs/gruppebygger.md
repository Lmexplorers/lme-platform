# LME Gruppebygger

Lag en salgs- og landingsside for et fellesskap eller medlemskap uten kode,
i samme stil som en Skool-gruppe (navn, trailer, bildegalleri, kort
beskrivelse, pris og en tydelig bli-med-knapp).

## Slik bruker du den

1. Gå til **`/gruppebygger`** (siden er ikke lenket opp for medlemmer, men den
   dukker også opp som egen flis under "Finn din gruppe" på `/community` når du
   har redigeringsmodus på, altså `#rediger` i adressen).
2. Trykk **＋ Ny gruppe**.
3. Fyll inn:
   - **Om gruppen:** navn, kort beskrivelse, privat eller åpen, vert, antall
     medlemmer (0 skjuler tallet), pris, pris-notis, knappetekst og hvilken
     lenke knappen går til (for eksempel `/oppgrader`).
   - **Bilder og trailer:** hovedbilde/omslag, en valgfri trailer-lenke
     (YouTube, Vimeo eller mp4), et bildegalleri (miniatyrstripe) og et
     valgfritt portrett av verten. Bilder krympes automatisk.
   - **Dette får du:** ett punkt per linje, vises som en liste med blomster.
   - **Om fellesskapet:** lengre tekst. Tom linje blir nytt avsnitt, `## ` gir
     en liten rosa mellomoverskrift, og `**ord**` gir tykk skrift.
   - **Avslutning:** overskrift og tekst i bunnen, med knappen igjen.
4. Se forhåndsvisningen til høyre; den oppdateres mens du skriver.
5. Trykk **💾 Lagre gruppen**. Første gang blir du bedt om passordet (samme som
   for kurs, `COURSE_EDIT_PASSWORD`).
6. Gruppen får sin egen side på **`/g/<adresse>`** og vises automatisk under
   "Finn din gruppe" på `/community` når den er publisert. Rett etter lagring
   kan skyen bruke opptil ett minutt på å vise siden på lenken.

## Engelsk

Trykk **🇬🇧 Vis engelske felt** for å skrive engelsk selv, eller
**✨ Oversett til engelsk automatisk** (krever innlogging; bruker
`/api/translate`). Tomme engelske felt faller tilbake til norsk tekst.

## Teknisk

- **Lagring:** JSON i Cloudflare KV (`BUILDER_KV`), nøkkel
  `lme-builder:gruppe:<slug>` pluss indeksen `lme-builder:gruppe-index`.
- **API:** `functions/api/gruppe.js` (GET liste, GET `?slug=`, POST
  `save`/`delete` med passord).
- **Visning:** `academy/gruppe.html` rendrer siden via `js/gruppe-render.js`
  og `css/gruppe.css`; `_redirects` har regelen `/g/* /academy/gruppe.html 200`.
- **Avpublisering:** skru av "Publisert" og lagre; gruppen forsvinner fra
  fellesskapssiden, men adressen virker fortsatt for den som har den.
