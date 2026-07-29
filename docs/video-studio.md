# LME Video Studio

En egen app der medlemmer lager AI-video med sin egen karakter: last opp et
bilde, beskriv scenen, og få en animert video. Gjenbruker Higgsfield-motoren og
kredittsystemet som allerede finnes i LME.

## Slik virker det (for brukeren)

1. Gå til **`/video-studio`** (lenke på dashbordet for innloggede medlemmer).
2. Last opp et karakterbilde (tegning, figur eller bilde). Bildet holder
   utseendet i videoen.
3. Skriv hva som skjer i scenen, eventuelt med stil-knappene.
4. Trykk **Lag video**. Det trekker én video-kreditt, og videoen er klar etter
   et par minutter.

## Tilgang og betaling (viktig)

- **Tilgang** til appen: eier, **Pro** og **VIP** (Inner Circle), eller de som
  har **kjøpt appen**. Andre møter en oppfordring om å bli medlem.
- **Ingen gratis generering.** Hver video krever én **forhåndskjøpt** video-kreditt
  (`/kjop-kreditt`). Slik dekker Renate aldri andres genereringskostnad, og har
  margin på hver video. Tilgang åpner døra, kreditt betaler for maskinen.
- **Refusjon ved feil:** feiler en generering (eller blir avvist av trygghets-
  filteret), refunderes kreditten automatisk.

## Trygghet

Barnevennlig app. Et enkelt filter blokkerer åpenbart voksent, skummelt eller
voldelig innhold, og alle klipp får en mild familievennlig føring. Higgsfield
sin egen NSFW-status fanger opp resten (og refunderer da kreditten).

## Teknisk

- **Side:** `video-studio.html` (mobil-først, installerbar som PWA via den
  delte `manifest.webmanifest`).
- **API:** `functions/api/video-studio.js`
  - `GET /api/video-studio` (ingen parametre) gir tilgangsinfo
    `{ loggedIn, entitled, owner, tier, credit }` til siden.
  - `POST /api/video-studio { prompt, imageUrl }` sjekker tilgang, trekker én
    video-kreditt, og sender jobben til Higgsfield (`dop-turbo`, image-to-video).
  - `GET /api/video-studio?id=<id>[&u=<statusUrl>]` poller til `completed`.
    Ved `failed`/`nsfw` refunderes kreditten (idempotent via `vsjob:<id>`).
- **Tilgang/kreditt:** `functions/_lib/access.js` (`videoAppAccess`,
  `enforceVideoApp`, `refundVideoCredit`). Kreditt ligger i KV `credit:<e-post>`
  (video-bøtta). Kjøp settes av `stripe-webhook.js` (video-pakker 3/10/25).
- **Referansebilde:** lastes opp via `POST /api/image { upload }` som gir en
  offentlig URL, som mates inn i Higgsfield som `input_images`.
- **Higgsfield-nøkler:** Secrets `HIGGSFIELD_API_KEY`, `HIGGSFIELD_SECRET` i
  Cloudflare Pages.

## Gjenstår (egne steg)

- **"Kjøpe appen":** krever et Stripe-produkt/betalingslenke som setter
  `member:<e-post>.apps.videostudio = true` (mappes i `stripe-webhook.js`,
  som kredittpakkene). Frem til da: tilgang for eier, Pro og VIP.
- **App Store / Google Play:** native innpakning (Capacitor) og kjøp via Apple/
  Google in-app purchase (de krever det for digitale varer, 15 til 30 prosent).
  Egen fase.
