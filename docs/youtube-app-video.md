# LME YouTube-appen: videogenerering og posting

`youtube-app` (`/youtube-app/`) lager i utgangspunktet manus (tittel, hook,
kapitler, beskrivelse, SEO-søkeord, tags, hashtags, CTA, caption) via
`/api/ai/content`. Denne siden dokumenterer den påfølgende funksjonen: å lage
selve videofilen (helt AI-generert, ingen filming) og poste den til YouTube.

## Slik virker det (for brukeren)

1. Lag manus som vanlig i appen, enten "Lang video" (YouTube, 16:9) eller
   "Short" (9:16).
2. Valgfritt, per kapittel/scene: last opp et eget bilde (📷-knappen) i stedet
   for å la AI lage det. Koster ikke ekstra kreditt.
3. Kun for Renate (eier): et eget valg **"🎭 Bruk Mia & Teo i denne videoen"**
   lar hele videoen bruke Mia & Teo med LMEs låste karakterprompt i stedet for
   et fritt temabilde. Andre som eventuelt bruker/kjøper appen ser ikke dette
   valget i det hele tatt, og det håndheves også server-side (se teknisk).
4. Trykk **🎬 Lag video** under resultatet. Dette trekker én video-kreditt
   (samme system som Video Studio, kjøpes på `/kjop-kreditt`). Opplastede
   bilder trekker ikke ekstra kreditt.
5. Appen lager ett bilde per kapittel (opplastet, Mia & Teo, eller fritt
   AI-bilde) og en AI-stemme som leser kapittelet, og setter det sammen til
   én MP4 (Ken Burns-panorament på bildene, ikke animerte videoklipp, rimelig
   og relativt raskt). Riktig format (liggende for lang video, stående for
   Short) følger automatisk med.
6. Ferdig video vises i en forhåndsvisning med redigerbar tittel og
   beskrivelse. Trykk **Post til YouTube** for å legge den ut med en gang.

## Viktig begrensning: kun eiers egen YouTube-konto

**"Post til YouTube" bruker Renates egen Blotato-tilkobling**
(`functions/api/blotato/[[path]].js`), og publisering der er låst til eier
(`isOwner`). Det betyr at posting i dag kun virker for Renate selv, ikke for
andre som eventuelt kjøper appen, siden det er Renates egen tilkoblede
YouTube-kanal som brukes, ikke hver enkelt kundes egen kanal. Skal appen
selges videre med individuell YouTube-posting, trenger hver kunde sin egen
kanal-tilkobling (enten via Blotato sin egen multi-konto-støtte, eller en
egen YouTube Data API-integrasjon), det er ikke bygget nå.

## Teknisk

- **Manus:** `functions/api/ai/content.js`, format `youtube` (lang video) og
  `reel` (Short).
- **Video-orkestrering:** `functions/api/youtube-video.js`
  - `POST { title, hook, sections:[{heading,talkingPoints,imageUpload?}], lang,
    aspect:"16:9"|"9:16", useMiaTeo? }` → sjekker/trekker video-kreditt
    (`enforceVideoApp`/`refundVideoCredit` i `functions/_lib/access.js`).
    Bilde per kapittel, i prioritert rekkefølge: (1) `imageUpload` (base64)
    brukeren selv har lastet opp, lagres direkte uten AI-kall eller ekstra
    kreditt, (2) Mia & Teo med LMEs låste karakterprompt
    (samme tekst som `functions/api/image.js` sin `CHAR.both`) når
    `useMiaTeo` er satt OG innlogget bruker er eier, sjekket server-side via
    `gate.owner` fra `enforceVideoApp` (klientens flagg alene stoler vi aldri
    på, så andre enn Renate kan aldri få Mia & Teo, uansett hva de sender
    inn), (3) ellers et fritt tema-drevet AI-bilde (Gemini foretrukket, ellers
    OpenAI, ingen Montessori-/Mia&Teo-låsing). Sender scenene videre til
    rendrings-motoren, returnerer `{ id }`.
  - `GET ?id=` → poller rendrings-motoren. Ved feil refunderes kreditten
    (idempotent, KV `ytvid:<id>`). Ved suksess lastes MP4-en ned og lagres
    direkte i `BUILDER_KV` (`vid:<id>`, samme nøkkelmønster som
    `functions/api/video.js` sin GET allerede leser, men uten å gå via dens
    POST, som har sin egen separate kvote og ville dobbelttrukket).
- **Rendring:** egen Render-tjeneste `whiteboard-engine/` (samme tjeneste som
  forklaringsvideoene, se `whiteboard-engine/DEPLOY.md`), rute
  `POST /api/generer-slideshow` og komposisjon
  `whiteboard-engine/video/SlideshowVideo.tsx` (stillbilder + Ken Burns +
  ElevenLabs-stemme, ikke Veo-klipp, mye raskere/billigere enn
  `/api/generer-veo`). Liggende (1920x1080) eller stående (1080x1920) canvas
  settes dynamisk ut fra `aspect` via Remotions `calculateMetadata` i
  `video/Root.tsx`, ingen egen komposisjon trengs per format. Deployes
  automatisk fra `main` via Render sin GitHub-kobling.
- **Posting:** `js/lme-visibility.js` sin `CHANNELS`-liste har fått en
  `youtube`-oppføring (`tt:"youtube"`, `needsTitle:true`), som gjenbrukes av
  både denne appen og eventuelt andre sider med "Gjør synlig"-knappen. Selve
  kallet fra youtube-app er skrevet direkte i `youtube-app/index.html` (egen,
  selvstendig HTML-fil, ingen delte script-includes, samme mønster som
  `reel-app`/`ai-twin-app`), ikke via den delte widgeten.

## Ikke i scope (foreløpig)

- Server-side sperre på selve `youtube-app`-kjøpet (79 kr). I dag er
  "unlocked" kun en `localStorage`-flagg i nettleseren, uten sperre på
  serveren. Video-kreditt-systemet gir uansett en reell kostnadssperre på
  selve videogenereringen.
- Individuell YouTube-tilkobling per kunde (se begrensningen over).
