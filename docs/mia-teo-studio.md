# Mia & Teo Studio

Lag og publiser animerte Mia og Teo læringsepisoder i 3D Pixar-stil, uten kode,
rett i nettleseren.

## Slik bruker du den

1. Gå til **`/mia-teo-studio`** (siden er ikke lenket opp for medlemmer, men er
   ment for Renate). Den krever innlogging som medlem, samme port som resten.
2. Fyll inn episoden: tema/kategori, tittel, undertittel, læringsmål,
   beskrivelse, lengde, format (liggende eller stående) og videolenke til den
   ferdige filmen (mp4, YouTube eller Vimeo). Legg gjerne på en plakat/miniatyr.
3. Se forhåndsvisningen til høyre; den viser hvordan flisen ser ut i Lek & Lær
   og oppdateres mens du skriver.
4. Trykk **☁️ Lagre episode**. Første gang blir du bedt om passordet (samme som
   for kurs og grupper, `COURSE_EDIT_PASSWORD`).
5. Episoden vises automatisk i en egen "Filmer med Mia & Teo"-hylle på
   **`/mia-og-teo`** (Lek & Lær) når den er publisert, og spilles av den samme
   fullskjermspilleren som sangene. Merk: rett etter lagring kan skyen bruke
   opptil ett minutt før episoden dukker opp.

## Fast utseende (låst)

Studioet har et låst "fast utseende"-panel med hvordan Mia og Teo alltid skal se
ut, pluss en engelsk **master prompt** du kan kopiere rett inn i bilde- og
videoverktøy. Bruk den samme referansen hver gang, så holder utseendet seg likt.

- **Mia:** lyst, gyllent hår i høy hestehale med rosa sløyfe, blå øyne, rosa
  blomstrete kjole, hvite sokker og rosa joggesko, flettet kurv med tusenfryd.
- **Teo:** bustete kastanjebrunt hår, brune øyne, gul stripete t-skjorte, blå
  olashorts, brune joggesko, olivengrønn ryggsekk og kikkert.

## Slik lager du klippene med riktig utseende

Viktig: beskriv aldri Mia og Teo bare med ord. En videomodell som bare får en
tekstbeskrivelse gjetter ansiktene og bommer (feil hårfarge, feil øyne). Et
referansebilde låser utseendet. Oppskriften i studioet:

1. Åpne et video-verktøy som tar bilde inn (bilde til video), for eksempel
   Higgsfield, Runway, Kling, Sora eller Pika.
2. Last opp det offisielle Mia og Teo bildet (logoen eller boktegningen) som
   referanse eller startbilde.
3. Lim inn master prompten, og legg til hva som skjer i scenen.
4. Lag klippene scene for scene med samme referansebilde hver gang.
5. Sett klippene sammen, legg på norsk stemme og musikk, last opp den ferdige
   videoen og lim inn lenken i studioet.

**Scene-planlegger:** skriv inn et tema, så lager studioet en scene-for-scene
liste med ferdige engelske prompter du kan lime rett inn i video-verktøyet.

## Engelsk

Skriv de engelske feltene selv, eller trykk **✨ Oversett til engelsk** (krever
innlogging; bruker `/api/translate`). Tomme engelske felt faller tilbake til
norsk tekst i visningen.

## Teknisk

- **Lagring:** JSON i Cloudflare KV (`BUILDER_KV`), nøkkel
  `lme-builder:episode:<slug>` pluss indeksen `lme-builder:episode-index`.
- **API:** `functions/api/episode.js` (GET liste, GET `?slug=`, POST
  `save`/`delete` med passord).
- **Visning:** `mia-og-teo.html` henter publiserte episoder fra `/api/episode`
  og viser dem i "Filmer med Mia & Teo"-hyllen, spilt av den eksisterende
  fullskjermspilleren. Ingen egen `_redirects`-regel trengs; `/mia-teo-studio`
  serveres av `mia-teo-studio.html` via de rene URL-ene.
- **Avpublisering:** skru av "Publisert" og lagre; episoden forsvinner fra
  Lek & Lær, men dataene beholdes.
