# LME YouTube-appen: videogenerering og posting

`youtube-app` (`/youtube-app/`) lager i utgangspunktet manus (tittel, hook,
kapitler, beskrivelse, SEO-søkeord, tags, hashtags, CTA, caption) via
`/api/ai/content`. Denne siden dokumenterer den påfølgende funksjonen: å lage
selve videofilen (helt AI-generert, ingen filming) og poste den til YouTube.

## Slik virker det (for brukeren)

1. Lag manus som vanlig i appen (format "Lang video").
2. Trykk **🎬 Lag video** under resultatet. Dette trekker én video-kreditt
   (samme system som Video Studio, kjøpes på `/kjop-kreditt`).
3. Appen lager ett AI-bilde per kapittel og en AI-stemme som leser kapittelet,
   og setter det sammen til én MP4 (Ken Burns-panorament på bildene, ikke
   animerte videoklipp, rimelig og relativt raskt).
4. Ferdig video vises i en forhåndsvisning med redigerbar tittel og
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

- **Manus:** `functions/api/ai/content.js`, format `youtube`.
- **Video-orkestrering:** `functions/api/youtube-video.js`
  - `POST { title, hook, sections, lang }` → sjekker/trekker video-kreditt
    (`enforceVideoApp`/`refundVideoCredit` i `functions/_lib/access.js`),
    lager ett bilde per kapittel (Gemini foretrukket, ellers OpenAI, fri
    tema-drevet prompt, ingen Montessori-/Mia&Teo-låsing), sender scenene
    videre til rendrings-motoren, returnerer `{ id }`.
  - `GET ?id=` → poller rendrings-motoren. Ved feil refunderes kreditten
    (idempotent, KV `ytvid:<id>`). Ved suksess lastes MP4-en ned og lagres
    direkte i `BUILDER_KV` (`vid:<id>`, samme nøkkelmønster som
    `functions/api/video.js` sin GET allerede leser, men uten å gå via dens
    POST, som har sin egen separate kvote og ville dobbelttrukket).
- **Rendring:** egen Render-tjeneste `whiteboard-engine/` (samme tjeneste som
  forklaringsvideoene, se `whiteboard-engine/DEPLOY.md`), ny rute
  `POST /api/generer-slideshow` og komposisjon
  `whiteboard-engine/video/SlideshowVideo.tsx` (stillbilder + Ken Burns +
  ElevenLabs-stemme, ikke Veo-klipp, mye raskere/billigere enn
  `/api/generer-veo`). Deployes automatisk fra `main` via Render sin
  GitHub-kobling.
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
