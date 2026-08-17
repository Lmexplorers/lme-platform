# LME AI Core, arkitekturkartlegging og migreringsplan

Dette dokumentet er beslutningsgrunnlaget før noe bygges. Det viser dagens
arkitektur slik den faktisk er i koden i dag, hva jeg foreslår i stedet,
hvilke filer og lagre som påvirkes, hvilke risikoer som finnes, og i hvilken
rekkefølge jeg anbefaler å gjøre det.

Ingenting er implementert ennå. Ingen eksisterende app eller integrasjon er
endret av dette dokumentet.

Kartleggingsdato: 16. august 2026.

---

## Del 1: Dagens arkitektur

### 1.1 Alle LME-apper som bruker AI eller eksterne API-er

Plattformen har 17 selvstendige AI-flater bygget på rundt 40 serverruter.
Ingen av dem deler et felles lag for kall, kostnad eller lagring.

| Nr | App / flate | Side | Serverruter |
| --- | --- | --- | --- |
| 1 | LME Autopilot, Reel Studio | `reel-studio.html`, `reel-app/index.html`, `reel-generator.html` | `/api/ai/content`, `/api/image`, `/api/video`, `/api/reel-video`, `/api/blotato/*` |
| 2 | LME Autopilot, AI Visibility | `lme-visibility-app.html`, `ai-visibility.html` | `/api/ai/repurpose`, `/api/image`, `/api/blotato/*` |
| 3 | LME Autopilot, YouTube-app | `youtube-app/index.html` | `/api/ai/content`, `/api/youtube-video`, `/api/blotato/*` |
| 4 | LME Autopilot, AI Twin | `ai-twin-app/index.html` | `/api/ai/content`, `/api/headshot`, `/api/image`, `/api/video-studio`, `/api/blotato/*` |
| 5 | Video Studio | `video-studio.html` | `/api/video-studio`, `/api/image` |
| 6 | AI Headshot | `ai-twin-app/index.html` | `/api/headshot` |
| 7 | Mia & Teo Video Creator | `mia-teo-video-creator.html` | `/api/miateo/story`, `/keyframe`, `/shot-video`, `/voice`, `/render`, `/qc`, `/project`, `/media` |
| 8 | Mia & Teo Studio | `mia-teo-studio.html` | `/api/episode`, `/api/translate` |
| 9 | LME VideoFlow | `videoflow-studio.html` | `/api/videoflow/script`, `/scene-image`, `/scene-voice`, `/scene-video`, `/restyle`, `/transcribe`, `/render`, `/project`, `/media` |
| 10 | Nathalie AI | `ask-nathalie-ai.html`, `spor-nathalie-ai.html` | `/nathalie-ai`, `/ask-nathalie-ai` |
| 11 | LME Builder | `lme-builder.html` | `/ai-generate` |
| 12 | Bookly | `bookly/index.html` | `/api/bookly/*` |
| 13 | Blogg | `blogg.html` | `/api/blog` |
| 14 | Podcast | `podkast.html` | `/api/podcast/generate`, `/audio`, `/status` |
| 15 | Filmmanus og forklaringsvideo | `mia-teo-film.html`, `forklaringsvideo.html` | `/api/film-script`, `/api/tts` |
| 16 | Oversettelse og sidetekst | alle sider | `/api/translate`, `/api/page-i18n`, `/api/content`, `/api/ai/faq`, `/api/ai/schema` |
| 17 | Utfordringen, tilbakemelding | `/utfordringen` | `/api/utfordring-feedback` |

I tillegg finnes renderingstjenesten `whiteboard-engine` (Remotion på
Render.com) som brukes av VideoFlow, Mia & Teo og YouTube-appen, og Blotato
som brukes til publisering.

### 1.2 Hvilke leverandører og modeller hver app bruker

| Leverandør | Modeller i bruk | Brukes av |
| --- | --- | --- |
| Anthropic | `claude-sonnet-5` (16 filer, hvorav 15 ekte kall og 1 helsesjekk), `claude-haiku-4-5-20251001` (1 sted) | Autopilot-tekst, VideoFlow-manus, Mia & Teo-historie, Nathalie AI, Builder, Bookly, Blogg, Podcast, filmmanus, oversettelse, FAQ, schema, sidetekst, tilbakemelding |
| OpenAI | `gpt-image-1`, `dall-e-3`, `gpt-4o-mini`, `gpt-4o-mini-tts`, `whisper-1` | Bildegenerering (primær), headshot, tekstreserve, TTS-reserve, transkribering |
| Google Gemini | `gemini-2.5-flash-image` | Bildereserve i fem apper |
| ElevenLabs | `eleven_multilingual_v2`, `eleven_turbo_v2_5` | Mia & Teo-stemmer, VideoFlow-stemme med tidsstempler, podcast, TTS |
| Higgsfield | `dop-turbo` (image2video) | Video Studio, Reel-video, Mia & Teo-klipp, VideoFlow premium |
| Stability | `stable-image core` | Bookly og blogg, bildereserve |
| Cloudflare Workers AI | `@cf/bytedance/stable-diffusion-xl-lightning` | `/api/image`, siste reserve |
| Pollinations | `flux`, `turbo` | `/api/image`, gratis siste utvei |
| Blotato | publiserings-API | Autopilot-appene |
| whiteboard-engine | Remotion, egen tjeneste | VideoFlow, Mia & Teo, YouTube-app |

Det er altså 10 utgående tjenester og minst 13 modellnavn spredt utover
kodebasen, uten noe sted som lister dem samlet.

### 1.3 Hvor API-nøkler og konfigurasjon håndteres

Alle nøkler ligger som miljøvariabler på Cloudflare Pages-prosjektet, med ett
unntak: Blotato-nøkkelen ligger i KV (`cfg:blotato_key`) fordi den kan settes
fra plattformen selv.

Problemet er at seks leverandører er spredt på rundt 20 variabelnavn, med
aliaser som gjør at samme nøkkel kan leses under tre forskjellige navn:

- OpenAI: `OPENAI_API_KEY`, `IMAGE_API_KEY`, `IMAGE_OPENAI_KEY`
- Google: `GEMINI_API_KEY`, `GOOGLE_API_KEY`, `GOOGLE_GEMINI_API_KEY`
- Higgsfield: `HIGGSFIELD_API_KEY` og `HIGGSFIELD_SECRET`
- ElevenLabs: `ELEVENLABS_API_KEY`, `ELEVENLABS_VOICE_ID`, `ELEVENLABS_MODEL_ID`, `ELEVENLABS_VOICE_MIA`, `ELEVENLABS_VOICE_TEO`, `ELEVENLABS_VOICE_NARRATOR`

Modellvalg er i tillegg overstyrbart per app gjennom egne variabler:
`CONTENT_TEXT_MODEL`, `CONTENT_OPENAI_MODEL`, `BLOG_TEXT_MODEL`,
`BOOKLY_MODEL`, `BOOKLY_OPENAI_MODEL`, `BOOKLY_GEMINI_MODEL`,
`BOOKLY_IMAGE_MODEL`, `IMAGE_MODEL`, `IMAGE_OPENAI_MODEL`,
`GEMINI_IMAGE_MODEL`, `HEADSHOT_IMAGE_MODEL`, `OPENAI_TTS_MODEL`,
`OPENAI_TRANSCRIBE_MODEL`. Resten er hardkodet i selve rutefilen.

Konsekvensen: å bytte modell ett sted krever at man vet nøyaktig hvilken av
disse variablene den aktuelle ruten leser, og de fleste rutene leser ingen.

### 1.4 Hvordan bruk, kreditter, kostnader og medlemsgrenser håndteres

Her er den største oppdagelsen: plattformen har fire ulike, gjensidig ukjente
kostnadssystemer, og en femte gruppe ruter uten noe system i det hele tatt.

**System A, månedskvote med kredittpåfyll** (`functions/_lib/access.js`,
`enforceGeneration`). Teller `usage:<e-post>:<år-måned>` som `{image, video}`,
med standardgrense 250 bilder og 15 videoer. Når kvoten er brukt opp, trekkes
det fra `credit:<e-post>`. Brukes av `/api/image`, `/api/video`,
`/api/reel-video`, `/api/youtube-video`.

**System B, ren forhåndsbetalt kreditt** (`enforceVideoApp`,
`enforceHeadshotApp`). Ingen gratis kvote, trekker direkte fra
`credit:<e-post>`, refunderer ved feil. Brukes av `/api/video-studio`,
`/api/headshot`.

**System C, VideoFlow-kreditter** (`functions/_lib/videoflow-credits.js`). En
helt egen valuta i `vf-credit:<e-post>`, med egen prisliste i
`CREDIT_COSTS` (manus 20, bilde 15, stemme 0,08 per tegn, video 120,
transkribering 15). Har tørrkjøring: uten `confirm: true` returnerer ruten
pris og prompt uten å bruke penger.

**System D, Mia & Teo**. Ingen kreditter i det hele tatt. Bare eiertilgang,
`confirm: true` og et grovt dollarestimat i `estimate*Cost()`.

**System E, ingen kostnadskontroll.** Disse rutene gjør ekte, betalte kall
uten noen som helst måling: `/ai-generate`, `/nathalie-ai`,
`/api/ai/content`, `/api/ai/repurpose`, `/api/ai/faq`, `/api/ai/schema`,
`/api/content`, `/api/translate`, `/api/page-i18n`, `/api/blog`,
`/api/bookly/*`, `/api/podcast/generate`, `/api/film-script`, `/api/tts`,
`/api/utfordring-feedback`, `/api/episode`.

Fire ting i system E bør nevnes eksplisitt, ikke fordi noe er ødelagt, men
fordi det er en åpen kostnadsdør:

1. `/ai-generate` hadde ingen innloggingssjekk og `Access-Control-Allow-Origin: *`.
   Hvem som helst som fant adressen kunne bruke plattformens Anthropic-nøkkel.
   **Lukket i fase 1.**
2. `/api/ai/faq` og `/api/ai/schema` hadde ingen sesjonssjekk, og det viste
   seg i fase 3 at ingen side i plattformen kaller dem i det hele tatt:
   AI Visibility-appen bruker den separate workeren (`ai-visibility-worker.js`).
   De er altså foreldreløse duplikater som likevel kunne bruke nøkkelen.
   **Lukket i fase 3.**
3. `/api/ai/content` og `/api/ai/repurpose` har fortsatt ingen sesjonssjekk.
4. `/nathalie-ai` er offentlig med vilje og er lagt inn på 51 sider. Den er
   ikke en glipp, men den har heller ingen grense.

**Rettelse til en tidligere versjon av dette dokumentet:** `/api/blog` (POST)
ble her først listet som uten sesjonssjekk. Det var upresist. Ruten krever
redigeringspassordet (`COURSE_EDIT_PASSWORD`) for alle handlinger, inkludert
`generate`, så den har passordbeskyttelse, ikke sesjonsbeskyttelse. Det er en
svakere beskyttelse enn innlogging, men den er ikke åpen.

Ingen av systemene logger hva et kall faktisk kostet. Det finnes ingen sted i
kodebasen som skriver ned kroner, dollar eller tokenforbruk. Kostnaden er bare
synlig i leverandørenes egne dashbord, etterpå.

Eierunntaket (`isOwner`) er derimot godt ivaretatt overalt der kreditter
brukes, i tråd med regelen om at eier aldri betaler for sitt eget produkt.

### 1.5 Hvor genererte tekster, bilder, lydfiler, videoer og dokumenter lagres

| Type | Lagring | Levetid |
| --- | --- | --- |
| Bilder, Autopilot og Video Studio | `img:<id>` i BUILDER_KV | 30 dager |
| Video, Reel Studio | `vid:<id>` i BUILDER_KV | 30 dager |
| Lyd, Mia & Teo | `miateo:audio:<id>` i BUILDER_KV | 30 dager |
| Bilder og lyd, VideoFlow | `vf:*` i BUILDER_KV | 30 dager |
| Keyframes, Mia & Teo | KV | 30 dager |
| Ferdige episoder | R2-bøtte `MIATEO_EPISODES` | permanent |
| Ferdige VideoFlow-videoer | R2-bøtte `VIDEOFLOW_MEDIA` | permanent |
| Jobbstatus, Higgsfield | KV, 2 timer | 2 timer |
| Prosjekter, Mia & Teo | `miateo:project:`, `miateo:series:` | permanent |
| Prosjekter, VideoFlow | `vf:project:`, `vf:project-index:<e-post>` | permanent |
| Oversettelser | `tr:en:<hash>` | 180 dager |
| Sidetekst | `content:` via `/api/content` | 180 dager |
| Mellomfiler under rendering | disk hos whiteboard-engine på Render.com | ikke varig |

Tre viktige konsekvenser:

- Alt genererende materiale utenom ferdige videoer forsvinner etter 30 dager.
- Hver app har sitt eget prosjektregister, med egen nøkkelstruktur. VideoFlow
  indekserer per e-post, Mia & Teo har ett globalt register fordi den er
  eieronly.
- Det finnes ikke noe sted der en bruker kan se alt hun har laget på tvers.

### 1.6 Hva som allerede er felles, og hva som er duplisert

**Allerede felles og verdt å beholde:**

- `functions/_lib/access.js`: `sessionUser()`, `isOwner()`, kreditt- og
  kvotesjekker. Dette er det nærmeste plattformen har et felles lag i dag.
- `BUILDER_KV` som eneste database.
- `whiteboard-engine` som eneste renderingsmotor.
- Blotato-proxyen som eneste publiseringsvei.
- Mønsteret med tørrkjøring og `confirm: true` i VideoFlow og Mia & Teo. Dette
  er allerede riktig løsning, den er bare ikke brukt av de andre appene.

**Duplisert kode, målt i faktiske forekomster:**

| Duplisert | Antall kopier | Hvor |
| --- | --- | --- |
| Claude-kall mot `api.anthropic.com/v1/messages` | 17 | fra `ai-generate.js` til `videoflow-providers.js` |
| OpenAI bildegenerering | 7 | `image.js`, `blog.js`, `bookly`, `headshot.js`, `youtube-video.js`, begge provider-filene |
| Gemini bildereserve | 5 | samme filer |
| Higgsfield innsending og polling | 4 | `video-studio.js`, `reel-video.js`, begge provider-filene |
| ElevenLabs TTS | 4 | `tts.js`, `podcast`, begge provider-filene |
| `fetchTimeout` og `b64ToBytes` | i praktisk talt hver fil | |
| `friendlyElevenLabsError` | 2 ordrette kopier | |
| Hardkodet `OWNER_EMAILS`-liste | 9 | |

To av disse er verdt å merke seg spesielt:

`functions/_lib/videoflow-providers.js` og
`functions/_lib/miateo-providers.js` er nesten identiske filer på 309 og 284
linjer. Kopieringen var et bevisst valg (det står i filhodet at appene
med vilje ikke deler kode, så de kan utvikles uavhengig), men resultatet er at
en forbedring i den ene aldri når den andre.

De 9 kopiene av `OWNER_EMAILS` er ikke like. `functions/api/diag.js` har bare
to e-postadresser, mens `access.js` har fem. Logget inn som
`hei@lmexplorers.com` er du altså eier overalt bortsett fra på helsesjekken.

### 1.7 Oppsummert: hva som faktisk er problemet

1. Det finnes ingen samlet oversikt over hva AI koster, verken per app,
   bruker, leverandør eller innholdstype.
2. 16 ruter kan bruke penger uten noen grense, og fire av dem uten
   innlogging.
3. Fire ulike kredittvalutaer betyr at en bruker kan ha kreditt i én app og
   være stengt ute i en annen, uten å forstå hvorfor.
4. Ingen reservemodell utenom bilder. Er Anthropic nede, står 15 flater.
5. Ingenting hindrer at samme knapp trykkes to ganger og genererer to ganger.
6. Filer forsvinner etter 30 dager, og kan ikke deles mellom apper. For å
   flytte et bilde fra Mia & Teo til Autopilot må du laste ned og laste opp
   igjen.
7. Å bytte modell eller leverandør krever endring i opptil 17 filer.

---

## Del 2: Foreslått arkitektur, LME AI Core

### 2.1 Prinsipper

- **Additivt, ikke omskrivende.** AI Core legges ved siden av dagens kode.
  Ingen fungerende rute skrives om før kjernen er i drift og verifisert.
- **Adapterne løftes ordrett.** Koden som faktisk snakker med leverandørene
  flyttes uendret inn i kjernen, så oppførselen blir bit for bit den samme.
- **Hver fase kan rulles tilbake alene.** Ingen fase avhenger av at neste blir
  ferdig.
- **Eier betaler aldri.** `isOwner()` beholdes som eneste sannhet, og AI Core
  arver den.
- **Ingen eksisterende KV-nøkkel endres.** Kjernen leser dagens saldoer som de
  er, den flytter dem ikke.

### 2.2 Modulene

Ny mappe: `functions/_lib/ai-core/`.

**`registry.js`, felles provider- og modelregister.**
Én tabell som beskriver hver modell: leverandør, oppgavetype (tekst, bilde,
video, stemme, transkribering, rendering, publisering), kvalitetsnivå,
enhetspris (per million tokens inn og ut, per bilde, per tegn, per sekund),
typisk ventetid, hvilke miljøvariabler som må være satt, og en `configured(env)`.
Dette er det ene stedet et modellnavn eller en pris skal finnes.

**`adapters/`, ett lag som snakker med hver leverandør.**
`anthropic.js`, `openai.js`, `gemini.js`, `elevenlabs.js`, `higgsfield.js`,
`stability.js`, `cloudflare-ai.js`, `whiteboard.js`, `blotato.js`. Hver
eksporterer samme form: `call(env, input)` og `poll(env, job)` der det er
relevant. Innholdet er dagens kode, flyttet, ikke skrevet på nytt.

**`router.js`, ruting.**
`pick(task, { quality, maxCost, lang })` returnerer en liste: primærmodell
først, deretter reserver. Utilgjengelige leverandører (manglende nøkkel, eller
en åpen strømbryter etter gjentatte feil, lagret i `ai:breaker:<leverandør>`)
faller ut av listen automatisk.

**`client.js`, én sentral tjeneste for alle kall.**
`runAI(context, { app, task, input, quality, idempotencyKey, confirm })` gjør
dette i rekkefølge:
1. Slår opp om `idempotencyKey` allerede er brukt (`ai:idem:<nøkkel>`, 24
   timer). Er den det, returneres forrige resultat i stedet for et nytt kall.
2. Estimerer kostnad via registeret.
3. Uten `confirm: true` returneres estimatet, og ingenting koster penger.
4. Sjekker kvote og kreditt via `ledger.js`.
5. Kaller primærmodellen, faller over til reserve ved feil.
6. Logger faktisk forbruk og beregnet kostnad via `usage.js`.
7. Legger resultatet i `library.js` og returnerer en referanse.
8. Refunderer ved feil.

**`ledger.js`, felles kreditt og kvote.**
Et fasadelag over dagens fire systemer. Fase 1 endrer ingen saldo: det leser
`credit:`, `vf-credit:` og `usage:` akkurat som i dag, og eksponerer én
`balanceFor(user)` og én `charge(user, kostnad)`. Først når alt er verifisert
kan de fire slås sammen til én valuta, og det blir en egen, eksplisitt
beslutning.

**`usage.js`, felles logg.**
Hvert kall skriver `ai:usage:<år-måned>:<id>` med app, bruker, leverandør,
modell, oppgavetype, enheter inn og ut, beregnet kostnad, varighet og status.
I tillegg oppdateres ferdigsummerte totaler i `ai:rollup:<år-måned>` slik at
administrasjonssiden kan lastes med ett KV-oppslag. Loggingen er
fire-and-forget i `try/catch`: den kan aldri velte en generering.

**`jobs.js`, felles status.**
`ai:job:<id>` med tilstand `pending`, `done` eller `failed`, framdrift,
feilmelding og referanse til resultatet. Erstatter de tre ulike
pollemønstrene som finnes i dag.

**`library.js`, felles prosjekt- og filbibliotek.**
`ai:file:<id>` med metadata (eier, app, type, prompt, modell, kostnad, hvilken
jobb den kom fra), og selve innholdet i R2 når det er stort, KV når det er
lite. `ai:project:<id>` binder filer sammen til et prosjekt, og
`ai:project-index:<e-post>` gir brukeren én liste over alt hun har laget.
`handoff(fileId, tilApp)` gjør at et resultat kan sendes rett videre, uten
nedlasting og opplasting.

### 2.3 Nye endepunkt

| Rute | Hva den gjør |
| --- | --- |
| `GET /api/ai-core/status` | hvilke leverandører og modeller som er konfigurert |
| `POST /api/ai-core/estimate` | kostnadsestimat før en dyr generering |
| `POST /api/ai-core/run` | felles generering, med `confirm` og `idempotencyKey` |
| `GET /api/ai-core/job?id=` | ventende, ferdig eller mislykket |
| `GET /api/ai-core/library` | brukerens egne prosjekter og filer |
| `POST /api/ai-core/handoff` | send et resultat videre til en annen app |
| `GET /api/ai-core/usage` | tall til administrasjonssiden, kun eier |

Ny side: `/ai-kostnader`, administrasjonsside med kostnad per app, bruker,
leverandør, modell og innholdstype. Den lenkes fra et kort i `hero-cta-row` på
`dashboard.html`, i tråd med regelen om at ingenting skal ligge på en skjult
URL, og den skrives tospråklig med `data-no` og `data-en` fra første versjon.

### 2.4 Slik ser dagens og morgendagens kall ut

I dag, i `functions/api/videoflow/script.js`:

```
sessionUser -> debitCredits(vf-credit) -> textGenerateJSON(env, ...)
  -> egen fetch mot api.anthropic.com -> lagre i vf:project:
```

Etter migreringen, samme rute:

```
runAI(context, { app:"videoflow", task:"script", input, confirm, idempotencyKey })
  -> estimat -> ledger -> router (Claude, deretter reserve)
  -> adapter -> usage-logg -> library -> jobb-status
```

Rutens egen forretningslogikk (hvordan et manus skal se ut, hvilke scener som
lages) blir liggende akkurat der den er. Det er bare kall, kostnad og lagring
som flyttes.

---

## Del 3: Hvilke filer og databaser som påvirkes

### 3.1 Nye filer

```
functions/_lib/ai-core/registry.js
functions/_lib/ai-core/router.js
functions/_lib/ai-core/client.js
functions/_lib/ai-core/ledger.js
functions/_lib/ai-core/usage.js
functions/_lib/ai-core/jobs.js
functions/_lib/ai-core/library.js
functions/_lib/ai-core/adapters/{anthropic,openai,gemini,elevenlabs,higgsfield,stability,cloudflare-ai,whiteboard,blotato}.js
functions/api/ai-core/{status,estimate,run,job,library,handoff,usage}.js
ai-kostnader.html
docs/ai-core.md
```

### 3.2 Filer som endres, og hvor mye

**Bare én linje logging lagt til, ingen annen endring (fase 1):**
`ai-generate.js`, `nathalie-ai.js`, `api/ai/content.js`, `api/ai/repurpose.js`,
`api/ai/faq.js`, `api/ai/schema.js`, `api/content.js`, `api/translate.js`,
`api/page-i18n.js`, `api/blog.js`, `api/bookly/[[path]].js`,
`api/podcast/[[path]].js`, `api/film-script.js`, `api/tts.js`,
`api/utfordring-feedback.js`, `api/image.js`, `api/video.js`,
`api/reel-video.js`, `api/youtube-video.js`, `api/headshot.js`,
`api/video-studio.js`, `api/episode.js`.

**Erstattes gradvis av kjernen (fase 6):**
`_lib/miateo-providers.js` og `_lib/videoflow-providers.js` blir tynne skall
som videresender til kjernen, med samme eksporterte funksjonsnavn, slik at de
14 rutene som importerer dem ikke trenger endring.

**Utvides, ikke erstattes:**
`_lib/access.js` beholder alle dagens eksporter. `ledger.js` kaller dem.

**Berøres ikke:**
Alle e-postfiler, Stripe- og Vipps-webhooks, kursbygger, gruppebygger,
laeringsverksted, nyhetsbrev, autentisering.

### 3.3 Databaser og lagring

**Nye KV-nøkler** (ingen eksisterende endres):

```
ai:usage:<år-måned>:<id>      forbrukslogg, 400 dagers levetid
ai:rollup:<år-måned>          ferdigsummerte totaler
ai:job:<id>                   jobbstatus, 7 dager
ai:idem:<nøkkel>              dobbeltkall-vern, 24 timer
ai:file:<id>                  filmetadata
ai:project:<id>               prosjekt
ai:project-index:<e-post>     brukerens liste
ai:breaker:<leverandør>       strømbryter ved gjentatte feil
```

**R2:** Én ny bøtte `AI_LIBRARY`, eller gjenbruk av `VIDEOFLOW_MEDIA`. Dette
er den eneste endringen som krever et klikk i Cloudflare-dashbordet, og fram
til bindingen finnes faller biblioteket tilbake til KV, slik VideoFlow og Mia
& Teo allerede gjør.

**Uendret:** `credit:`, `vf-credit:`, `usage:`, `member:`, `user:`, `sess:`,
`img:`, `vid:`, `miateo:*`, `vf:*`. Ingen migrering av data i noen fase.

---

## Del 4: Risikoer

| Risiko | Alvorlighet | Hvordan jeg møter den |
| --- | --- | --- |
| Felles kode betyr at én feil rammer alle apper samtidig, i stedet for én | Høy | Adapterne løftes ordrett fra dagens kode. Hver app migreres for seg, og de gamle provider-filene beholder eksportnavnene sine som skall |
| Loggingen kan velte en generering som ellers ville gått bra | Høy | All logging er i `try/catch` og skjer etter at resultatet er sikret. En mislykket logg gir aldri feil til brukeren |
| Å slå fire kredittvalutaer sammen kan gi feil saldo | Høy | Slås ikke sammen i denne planen. `ledger.js` leser bare de fire som de er. Sammenslåing blir en egen beslutning, med et eget dokument |
| Dobbelt trekk fordi KV er "eventually consistent" | Middels | Finnes allerede i dag i `credit:`-logikken. Kjernen gjør det ikke verre, og `ai:idem:` fjerner den vanligste årsaken, som er dobbelttrykk fra samme bruker |
| Grenser i Cloudflare Workers på antall utgående kall per forespørsel | Middels | Ruteren legger til null nye nettverkskall. Logging og bibliotek er KV- og R2-skriving, ikke `fetch` |
| Kostnadsestimatene blir feil når leverandørene endrer priser | Middels | Prisene ligger ett sted, i `registry.js`, med dato på når de sist ble sjekket. Administrasjonssiden viser den datoen, så tallet aldri leses som en faktura |
| Migreringen gir ingen synlig gevinst før fase 5 | Middels | Derfor kommer administrasjonssiden i fase 2, ikke til slutt. Da er kostnadsoversikten på plass lenge før resten |
| Å lukke `/ai-generate` kan stoppe LME Builder | Middels | Innloggingskravet legges på med logging først, så jeg ser i tallene hvem som faktisk bruker ruten før den strammes inn |
| R2-bindingen mangler til å begynne med | Lav | Biblioteket faller tilbake til KV, akkurat som VideoFlow gjør i dag |
| Nye tekster bryter språk- eller fontregler | Lav | Administrasjonssiden bygges tospråklig fra start, med Playpen Sans på overskrifter og Sasson Montessori på all annen tekst |

---

## Del 5: Anbefalt implementeringsrekkefølge

Hver fase er ferdig, testbar og kan publiseres alene.

**Fase 1: Registeret og loggingen.** Bygg `registry.js`, `usage.js` og
adapterne. Legg én linje logging i alle 22 AI-ruter. Ingen oppførsel endres,
ingen rute skrives om. Etter denne fasen vet vi for første gang hva ting
koster.

**Fase 2: Administrasjonssiden `/ai-kostnader`.** Kostnad per app, bruker,
leverandør, modell og innholdstype, med kort på dashbordet. Dette er første
synlige gevinst, og den kommer tidlig med vilje.

**Fase 3: Kreditt-fasaden.** `ledger.js` over de fire eksisterende systemene,
pluss innlogging og en enkel grense på de fire åpne rutene. Ingen saldo
flyttes.

**Fase 4: Ruteren, reservemodell og vern.** `router.js`, `client.js`,
`jobs.js`, dobbeltkall-vern og strømbryter. Tas i bruk av én rute først, jeg
foreslår `/api/videoflow/script`, siden VideoFlow allerede har tørrkjøring og
kreditt på plass.

**Fase 5: Biblioteket.** `library.js`, `/api/ai-core/library` og
`handoff`. Fra nå av kan et resultat sendes videre uten nedlasting.

**Fase 6: Migrering av de fire målappene**, i denne rekkefølgen:
1. Mia & Teo, manus og læringsinnhold
2. Bilde- og mediegenerering
3. LME VideoFlow
4. LME Autopilot

Rekkefølgen er valgt fordi Mia & Teo er eieronly, altså den appen der en feil
rammer færrest. Autopilot kommer sist fordi den har flest betalende brukere.

**Fase 7: Den sammenhengende arbeidsflyten.** Se del 6.

---

## Del 6: Den første sammenhengende arbeidsflyten

Målet:

```
Idé -> manus -> scener -> bilder og video -> stemmer -> musikk
    -> teksting -> ferdig video -> publisering
```

Dette bygges som ett prosjekt i biblioteket som de fire appene deler, ikke som
en femte app:

| Steg | Hvem gjør det i dag | Hva som mangler |
| --- | --- | --- |
| Idé og manus | `/api/miateo/story`, `/api/videoflow/script` | felles prosjektobjekt begge kan skrive til |
| Scener | begge, hver sin form | felles scenemodell |
| Bilder | fem ulike bildeveier | felles `task: "image"` |
| Video | Higgsfield, fire kopier | felles adapter |
| Stemmer | ElevenLabs, fire kopier | felles adapter |
| Musikk | finnes ikke | ny leverandør i registeret, eneste helt nye integrasjon |
| Teksting | VideoFlow har ordtidsstempler, Mia & Teo ikke | løftes til felles nivå |
| Ferdig video | whiteboard-engine, felles allerede | felles jobbstatus |
| Publisering | Blotato, kun Autopilot | `handoff` fra prosjekt til Autopilot |

Musikk er den eneste helt nye leverandøren i hele planen. Alt annet er
sammenkobling av det som allerede finnes og virker.

Når dette er på plass ser Renates arbeidsflyt slik ut: skriv idéen én gang i
Mia & Teo, trykk "send videre til VideoFlow" når manuset er godkjent, la
scenebildene og stemmene genereres, og trykk "send videre til Autopilot" når
videoen er ferdig. Ingen nedlasting, ingen opplasting, ingen kopiering av
tekst.

---

## Del 7: Hva jeg trenger klarsignal på før jeg begynner

1. **Går vi for planen slik den står?** Fase 1 og 2 gir kostnadsoversikt uten
   å røre noen fungerende app, og er trygge å starte med uansett.
2. **Skal `/ai-generate` få innloggingskrav?** Ja, gjort i fase 1.
3. **Én ny R2-bøtte `AI_LIBRARY`, eller gjenbruk av `VIDEOFLOW_MEDIA`?**
   Gjenbruk er raskest, egen bøtte er ryddigst.
4. **Hvilken musikkleverandør?** Dette er det eneste nye abonnementet planen
   krever, og bare i fase 7.
5. **Skal de fire kredittvalutaene til slutt bli én?** Ikke nødvendig for noe
   av dette, men det ville gjort prisingen enklere å forstå for brukerne. Egen
   beslutning, egen plan.
