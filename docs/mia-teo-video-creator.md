# Mia & Teo Video Creator

Dedikert produksjonsstudio for å lage komplette, animerte Mia og Teo-episoder
fra én idé: idé → manus → storyboard → nøkkelbilder → animerte shots →
stemmer → **automatisk sammenstilling til én ferdig episodefil** →
publisering (siste steg ikke koblet ennå, se under). Dette er IKKE
Filmgeneratoren (`mia-teo-film.html`) eller YouTube-appen, de er urørt.
Bygget etter en fullstendig kodegjennomgang av eksisterende LME-
infrastruktur, se "Undersøkelse før bygging" under.

**Kostnadskontroll er absolutt**: hvert steg som koster penger (manus,
nøkkelbilder, video, stemme) krever `confirm:true` i kallet. Uten det gjør
API-et et "dry run": ingen nettverkskall, bare nøyaktig prompt + et grovt
kostnadsoverslag. Grensesnittet viser alltid en bekreftelsesboks med
kostnad før noe sendes med `confirm:true`. Ingenting genereres automatisk.

## Status: hva er bygget nå (fase 1), hva gjenstår

Bygget og virker med ekte (ikke mocket) integrasjoner mot Claude, OpenAI/
Gemini, Higgsfield og ElevenLabs, samme nøkler/mønstre som resten av
plattformen:

- Karakterbibel (låst, ordrett fra `mia-teo-studio.html`/`master-creative-bible.md`)
- KV-datamodell for prosjekt/scene/shot/serie, med selvreparerende indeks
- Kontinuitetsmotor (ren logikk, sporer holdte gjenstander, sted, tid, vær)
- Story/Director-AI (Claude), 7 historiestrukturer (Adventure/Mystery/…)
- Storyboard-editor (visuelle shot-kort, rediger uten å regenerere alt)
- Nøkkelbilde-generering per shot (OpenAI/Gemini + karakterbibel)
- Shot-animasjon (Higgsfield image-to-video), async jobb/poll
- Stemmelinjer per replikk (ElevenLabs, faste Mia/Teo/Forteller-stemmer)
- Regelbasert kvalitetssjekk (sikkerhet, kontinuitet, dialog, alder, dialog-timing)
- Automatisk sammenstilling til én ferdig episodefil (via `whiteboard-engine`,
  ingen ny betalt infrastruktur, se "Sammenstilling" under)
- Bibliotek med statusflik (Idé/Manus/Storyboard/Godkjent/Genererer/Klar/Publisert)
- Synlig kort på dashbordet, sidemeny-lenke, roadmap-oppføring

**Oppdatert (samme dag, etter tilbakemelding om at hele poenget var en
FERDIG film, ikke en haug med klipp)**: automatisk sammenstilling til én
episodefil ER nå bygget, se "Sammenstilling" under. Alt annet i listen
under står fortsatt ved lag.

**Bevisst IKKE bygget ennå** (se "Infrastrukturgap" og "Faser" under, dette
er ikke scope kuttet i det stille, det er eksplisitt flagget):

- Leppesynk
- Musikk-/SFX-generering og -miksing (kun en tekstlig lydplan per shot,
  selve episodesammenstillingen spiller foreløpig kun dialog/fortelling)
- Undertekstfil-generering (.vtt/.srt) eller innbrente undertekster
- Overganger/crossfades mellom shot (rene klipp i dag)
- 9:16-reframing (ikke bare beskjæring, komposisjonen støtter 9:16-canvas,
  men selve smart-reframingen er ikke bygget)
- Permanent lagring av ferdig episode (ligger på rendringsmotorens egen
  disk, ikke kopiert til varig lagring/R2 ennå, se "Sammenstilling")
- Publisering til Lek & Lær / YouTube (metadata-felt finnes i datamodellen,
  selve publiseringsknappene er ikke koblet til `episode.js` ennå)
- AI-basert visuell QC (ansikt/hender/kontinuitet i selve bildet)
- Referanse-bilde-conditioning inn i Higgsfield (se punkt 9)
- Aldersbånd utover 6-9 (arkitekturen støtter dem, promptene er ikke tunet)

### Sammenstilling (ny, ingen ny betalt infrastruktur)

`whiteboard-engine/` (Render.com-tjenesten som allerede kjører for YouTube-
appens slideshow-video) har fått en ny rute og Remotion-komposisjon:

- `whiteboard-engine/video/EpisodeComposition.tsx`: setter godkjente
  shot-klipp etter hverandre, med hver replikk/fortellerlinjes lyd lagt på
  ved riktig tidspunkt inni shotet.
- `whiteboard-engine/server.js`: `POST /api/generer-episode` (ny jobb-type,
  samme async jobb/poll-mønster som `/api/generer-slideshow`).
- `functions/api/miateo/render.js`: bygger shot- og lyd-listen (rekkefølge
  fra kontinuitetsmotoren), sender den til motoren, og poller til episoden
  er ferdig. Ingen nye AI-kall her i det hele tatt, kun rendring av
  allerede genererte og allerede betalte klipp/lydfiler, derfor er denne
  ruten IKKE `confirm`-gated slik generering er.

Siden `whiteboard-engine/` allerede er koblet til dette GitHub-repoet på
Render (se `whiteboard-engine/DEPLOY.md`), ruller denne endringen automatisk
ut ved neste push til `main`, ingen ny tjeneste, ingen ny regning.

Ærlige begrensninger på selve sammenstillingen akkurat nå:
- Ingen musikk/SFX (ikke en manglende funksjon i koden, det finnes rett og
  slett ingen musikk-leverandør koblet til ennå).
- Replikker som ikke har fått generert stemme ennå, spilles stille (QC
  flagger dette nå, se under).
- Hvis summen av stemmelyd i ett shot er lengre enn selve klippet, fortsetter
  lyden etter at klippet er ferdig (QC flagger dette også).
- Permanent lagring: `functions/api/miateo/render.js` kopierer den ferdige
  MP4-en til R2 (`functions/api/miateo/media.js` server den ut igjen) idet
  rendringen er ferdig, i stedet for å la den ligge på rendringsmotorens
  egen (ikke-varige) disk. Dette krever en R2-bøtte koblet til
  lme-platform-Pages-prosjektet med variabelnavn `MIATEO_EPISODES`
  (Cloudflare-dashbordet: lme-platform → Settings → Functions → R2 bucket
  bindings). Renate har allerede R2-bøtter i kontoen (`lme-bruker-filer`,
  `lme-platform-html`), men ingen av dem er koblet til DENNE Pages-
  Functions-koden ennå, det er et eget steg fra å ha en bøtte i kontoen.
  Til bindingen er lagt til, faller koden automatisk tilbake til å bruke
  rendringsmotorens egen midlertidige URL (fungerer, bare ikke varig).

## Undersøkelse før bygging

### 1. Hva kan gjenbrukes

- **Claude-integrasjonen** (`ANTHROPIC_API_KEY`, `claude-sonnet-5`,
  `api.anthropic.com/v1/messages`) fra `film-script.js` og
  `podcast/[[path]].js`, samme mønster for manus/JSON-parsing.
- **Bildegenerering** (OpenAI prioritert, Gemini reserve) fra `image.js`.
- **Higgsfield image-to-video** (`dop-turbo`) fra `video-studio.js`, inkl.
  async submit/poll og feilhåndtering.
- **ElevenLabs flerspråklig TTS med faste stemme-ID-er per figur**
  (`ELEVENLABS_VOICE_MIA/TEO/NARRATOR`) fra `podcast/[[path]].js` sitt
  Mia og Teo-lydeventyr, som allerede løser "persistent voice per character".
- **KV-lagringsmønster** (dokument + selvreparerende indeks) fra `episode.js`.
- **Eier-/passord-tilgangsmønster** fra `mia-teo-studio.html`/`episode.js`.
- **Den låste karakterbeskrivelsen** (master prompt) ordrett, den er allerede
  godkjent av Renate og brukt på tvers av appen.
- **Referansebildene** i `brand/references/` (godkjent i `brand/README-STATUS.md`).

### 2. Hvorfor Filmgeneratoren ikke kan levere dette

`mia-teo-film.html` + `film-script.js` + `video-studio.js` løser ett manus
(tekst) og ett klipp per scene (bilde → Higgsfield-video), men:

- Ingen storyboard-godkjenning før video genereres, bilde og video lages i
  samme steg, ingen mulighet til å luke ut en dårlig scene billig.
- Ingen kontinuitet mellom scener (hver scene sitt bilde er uavhengig).
- Ingen strukturerte shots (kamera/vinkel/varighet/rekvisitter), bare én
  "motion"-streng per scene.
- Ingen persistente stemmer per figur, kun én generisk forteller-TTS
  (`/api/tts`) som leser narrasjon, ikke dialog med Mia/Teo som egne stemmer.
- Ingen sammenstilling: appen sier det rett ut selv ("Å slå alt sammen til
  én ferdig filmfil med musikk er et eksternt steg foreløpig").
- Ingen datamodell: ingenting lagres, alt skjer i nettleserminnet i én økt.
- Ingen kostnadskontroll utover selve video-kreditten, ingen "se kostnad
  før du genererer".

Kort sagt: Filmgeneratoren er en rekke enkeltkall, ikke en produksjonspipeline.

### 3. Hva den nye appen krever

Se punkt A-P i oppgavebeskrivelsen: strukturert story/director-AI,
karakterreferanse-motor, storyboard-bilder før video, ekte video-API per
shot, kontinuitetsmotor, persistente stemmer, dialog-timing, leppesynk der
det passer, lyddesign-plan, en ekte rendrer/kompositør, asynkron jobbkø og
strukturert databasemodell. Alt er bygget i fase 1 UNNTATT rendreren
("K"), leppesynk ("I") og lyd-generering ("J", kun plan er bygget), se gap under.

### 4. Anbefalt arkitektur

```
mia-teo-video-creator.html   (UI: idé, storyboard-editor, bibliotek)
        │
functions/api/miateo/
  story.js        Claude: idé -> manus + storyboard (strukturert JSON)
  project.js       KV CRUD: prosjekt/scene/shot/serie, godkjenning
  keyframe.js       OpenAI/Gemini: ett nøkkelbilde per shot
  shot-video.js     Higgsfield: animer ett godkjent nøkkelbilde
  voice.js          ElevenLabs: én replikk-lyd, + servering
  qc.js             Regelbasert kvalitetssjekk (gratis)
  render.js         Kontrakt for sammenstilling (se gap)
        │
functions/_lib/
  miateo-bible.js       Karakterbibel, master prompt, avoid-liste
  miateo-store.js       KV datamodell (prosjekt/scene/shot/serie)
  miateo-providers.js   Provider-adaptere (tekst/bilde/video/stemme)
  miateo-continuity.js  Ren kontinuitetslogikk
  miateo-access.js      Eier-tilgang
```

Provider-laget (`miateo-providers.js`) er det eneste stedet som snakker med
en ekstern leverandør, akkurat som spec §O krever, så Higgsfield kan byttes
med Runway/Veo/Kling senere uten å røre noen av rutene over.

### 5. AI-leverandører allerede tilgjengelig

| Evne | Tilgjengelig? | Leverandør | Bra nok for dette? | Handling |
|---|---|---|---|---|
| Manus/reasoning | Ja | Anthropic Claude | Ja | Gjenbrukt direkte |
| Storyboard/shot-strukturering | Ja | Anthropic Claude (strukturert JSON) | Ja | Bygget i story.js |
| Bildegenerering | Ja | OpenAI (prim.), Gemini (reserve) | Ja for nøkkelbilder | Gjenbrukt |
| Karakterreferanse-generering | Delvis | Statiske godkjente bilder i `brand/references/` | Ja for prompt-injeksjon, IKKE for bilde-conditioning (se punkt 9) | Brukt som prompt-referanse |
| Bilde-til-video | Ja | Higgsfield (`dop-turbo`) | Ja, men kun tekstprompt, ingen referansebilde-parameter funnet i APIet | Gjenbrukt, se gap |
| Tekst-til-video (uten bilde) | Nei | - | - | Ikke nødvendig, alt går via godkjent nøkkelbilde |
| Stemme/TTS | Ja | ElevenLabs (prim.), OpenAI TTS (reserve) | Ja | Gjenbrukt, persistente stemme-ID-er |
| Leppesynk | Nei | - | - | Se gap |
| Musikk | Nei | - | - | Se gap |
| Lydeffekter | Nei | - | - | Se gap |
| Undertekster | Delvis | Timing finnes per replikk, ingen fil-generator ennå | - | Se gap |
| Rendring/sammenstilling | Ja | `whiteboard-engine` (Remotion), ny `EpisodeComposition` + `/api/generer-episode` | Ja for klipp+dialog, IKKE for musikk/SFX/undertekster | Bygget (se "Sammenstilling") |
| Media-lagring | Delvis | KV blob (`img:`/`vid:`), 25MB-grense per verdi | Fungerer for bilder/lyd, for smalt for ferdig episode | Se gap (R2) |
| Async jobbkø | Ja | KV-jobbrecord + klient-polling (samme mønster som Video Studio) | Ja | Gjenbrukt |
| Publisering | Delvis | `episode.js` finnes og virker, ikke koblet til denne appen ennå | - | Fase 2 |

### 6. Ekstra leverandører/APIer som faktisk trengs

- **Object storage (Cloudflare R2)** for episodefiler over KVs 25MB-grense.
  Ikke opprettet i denne økten (infrastruktur-/betalingsendring, krever din
  bekreftelse først).
- **En ekte klipp+lyd-kompositør**: enten en ny Remotion-komposisjon på
  `whiteboard-engine` (samme leverandør som allerede kjører der), eller en
  frittstående FFmpeg-basert rendrer. Cloudflare Pages Functions kjører på
  Workers-runtimen, ingen filsystem, ingen FFmpeg, ingen headless Chrome,
  så dette MÅ være en ekstern tjeneste, det kan ikke bygges inn i
  `functions/`. Se `render.js` for den ferdige kontrakten det skal kobles til.
- **Leppesynk-API** (f.eks. en dedikert leppesynk-modell) hvis nærbilder
  med tydelig munnbevegelse skal synkroniseres presist. I dag styres
  munnbevegelse implisitt av Higgsfields egen animasjon, ikke eksplisitt
  synkronisert mot lydfilen.
- **Musikk-generering** (f.eks. en musikk-API) for bakgrunnsmusikk per
  humør. I dag lagres bare et tekstlig "musicMood"-felt per shot.
- Higgsfields dokumenterte API tar `input_images` (start-bilde), IKKE et
  eget "identity/reference" bilde-sett slik ekte karakter-conditioning
  (LoRA/IP-adapter-stil) ville gjort. Nøkkelbildet fungerer derfor som
  eneste identitetsanker per shot, se punkt 9 for hvorfor dette holder.

### 7. Karakterkonsistens-strategi

To lag, ikke ett:

1. **Tekstlaget** (`miateo-bible.js` `MASTER_PROMPT`): samme ordrette,
   godkjente beskrivelse limes inn FØRST i hvert nøkkelbilde-prompt, pluss
   en eksplisitt "avoid"-liste (ansiktsforvrengning, feil antall fingre,
   klesbytte, aldersendring osv., spec §11).
2. **Bildelaget**: nøkkelbildet som genereres for shot N blir selve
   startbildet Higgsfield animerer. Video-modellen ser altså aldri bare en
   tekstbeskrivelse, den ser et allerede godkjent bilde av Mia/Teo, akkurat
   som `mia-teo-studio.html` selv anbefaler manuelt i dag ("mat alltid inn
   det offisielle bildet som referanse, ikke bare ord"). Godkjenning er et
   eksplisitt steg (`keyframe.approve`) før video-generering er mulig i det
   hele tatt.

Ekte bilde-til-bilde identitetslåsing (samme ansikt garantert på tvers av
ALLE nøkkelbilder, ikke bare "samme prompt") krever en bildemodell med
referanse-conditioning (IP-Adapter/LoRA/faceswap-stil). Verken OpenAI
Images eller Gemini-modellene som brukes her støtter det per i dag, det er
et reelt gap, ikke noe denne appen later som er løst.

### 8. Storyboard-strategi

Claude returnerer strukturert JSON (scener → shots → dialog/kamera/lys/
kontinuitet-hendelser) i ETT kall, se `story.js`. Hvert shot er en egen
redigerbar enhet i UI-et, og regenerering (nøkkelbilde ELLER video) skjer
per shot, aldri for hele episoden (spec §9). Godkjenning er eksplisitt
(`project.js` action "approve") og krever at hvert shot med figurer har et
godkjent nøkkelbilde, matcher spec §10 sin "godkjenn før video koster penger".

### 9. Video-genererings-strategi

Shot-basert (spec §E): hvert shot er ett Higgsfield-kall, aldri hele
episoden i ett kall. Inndata er alltid det GODKJENTE nøkkelbildet + en kort
bevegelsesprompt bygget fra shot.action + kontinuitetsnotat + en fast
familievennlig sikkerhets-suffiks (samme mønster som `video-studio.js`).
Jobb-id og status-URL lagres på shotet, klienten poller
`GET /api/miateo/shot-video` til klippet er klart, akkurat som eksisterende
Video Studio.

### 10. Stemme/lyd-strategi

Én ElevenLabs-linje per replikk (ikke per shot, ikke per episode), med
faste stemme-ID-er (`ELEVENLABS_VOICE_MIA/TEO/NARRATOR`, samme env-variabler
som lydeventyret allerede bruker). Hver linje lagrer en varighet (grovt
anslått fra ordantall, ingen ffprobe tilgjengelig i Workers-runtimen), som
UI-et kan bruke til å sjekke at shotets varighet er lang nok til dialogen.

### 11. Kontinuitetsstrategi

`miateo-continuity.js` er ren logikk (ingen AI, ingen kostnad): hvert shot
kan erklære `continuityEvents` (holder/slipper en gjenstand, endrer sted,
tid, vær, en tings tilstand). Motoren går gjennom shotene i rekkefølge og
regner ut tilstanden som gjelder VED INNGANGEN til hvert shot, som så
skrives inn i nøkkelbilde- og bevegelsesprompten ("Mia holder: et lite rødt
blad. Sted: den gamle eika. Tid: ettermiddag."). Uten dette glemmer en
generativ modell alt fra forrige shot, med det husker prompten det.

### 12. Kvalitetskontroll-strategi

`qc.js` er regelbasert og gratis: sjekker sikkerhetsord i dialog/handling,
manglende nøkkelbilder, ugodkjente nøkkelbilder, manglende oversettelse,
kontinuitetsbrudd (slipper noe som aldri ble holdt), aldersbånd som ikke er
tunet ennå, og manglende faktasjekk-flagg. Den sier EKSPLISITT fra at
visuell QC (hender, ansikt, kontinuitet i selve bildet) ikke er automatisert
ennå, i stedet for å late som et sjekkmerke betyr mer enn det gjør.

### 13. Anslått kostnadsstruktur (grove, ikke eksakte tall, se kildekoden)

| Steg | Leverandør | Grovt per enhet |
|---|---|---|
| Manus + storyboard (hele episoden, ett kall) | Claude | ~$0.05-0.20 |
| Ett nøkkelbilde | OpenAI/Gemini | ~$0.04-0.08 |
| Én shot-animasjon | Higgsfield | 1 video-kreditt (samme pris som `/kjop-kreditt`) |
| Én replikk-lyd | ElevenLabs | Avhenger av tegn og plan, se ElevenLabs-kontoen |

En episode på 5 scener × 3 shots × ~2 replikker: ca. 15 nøkkelbilder, 15
videoklipp (= 15 video-kreditter), ~30 stemmelinjer. UI-et viser faktisk
overslag per kall før noe bekreftes, dette er kun et startpunkt for
budsjettering.

### 14. Databaseendringer

Ingen D1, ingen R2 i denne fasen (ikke tilgjengelig på plattformen ennå, se
gap). Alt går i `BUILDER_KV` som JSON-dokumenter:

- `miateo:project:<id>` / `miateo:project-index`
- `miateo:series:<id>` / `miateo:series-index`
- `miateo:audio:<id>` (stemmelyd, gjenbruker samme mønster som `img:`)

Genererte bilder gjenbruker EKSISTERENDE `img:`-nøkler fra `functions/api/image.js`,
så ingen ny serveringsrute var nødvendig for bilder.

### 15. UI/komponenter bygget

`mia-teo-video-creator.html`: idé-skjema (alder/språk/type/lengde),
statusflik-bibliotek, visuell storyboard-editor (scene-blokker → shot-kort
med redigerbar handling/kamera/dialog), kostnad-bekreft-modal foran HVERT
betalt kall, QC-panel, godkjenn-knapp, "sett sammen episode"-knapp (viser
det ærlige infrastrukturgapet med en manuell arbeidsflyt i mellomtiden).
Samme fontregler og fargepalett som resten av LME (Playpen Sans overskrift,
Sasson Montessori brødtekst).

### 16. Implementasjonsfaser

**Fase 1 (denne leveransen)**: alt over, idé → godkjent, animert, stemmelagt
shot-liste, med full kostnadskontroll. Ingen betalte kall er kjørt under
utviklingen.

**Fase 2 (krever din bekreftelse på ny infrastruktur/kostnad)**:
- ~~Ekte sammenstilling~~ Bygget (se "Sammenstilling" over), gjenbrukte
  eksisterende `whiteboard-engine` i stedet for ny infrastruktur.
- R2-bucket for permanent lagring av ferdige episoder (i dag: motorens egen
  disk, ikke garantert varig).
- Musikk-/SFX-miksing, overganger, intro/outro.
- Koble `project.publish.lekOgLaer` til `episode.js` (ett klikk-publisering).
- YouTube-forberedelse (tittel/beskrivelse/kapitler/SEO, gjenbruk
  `youtube-video.js` sitt mønster for barnerettet metadata).
- Musikk-/SFX-generering eller kuratert bibliotek.

**Fase 3**: leppesynk for nærbilder, 9:16 smart-reframing (ikke beskjæring),
AI-basert visuell QC, aldersbånd 0-3/3-6/9-12/12-16 tunet med egne
prompt-varianter (se `brand/mia-teo-age-progression-SKILL.md`), ekte
bilde-referanse-conditioning hvis/når en videoleverandør med det blir
tilgjengelig (Runway/Kling/Veo via aggregator, vurdert etter identitets-
konsistens, ikke bare implementeringsletthet, spec §D).

## Ikke i scope for fase 1

Alt i "Bevisst IKKE bygget ennå" over. Ingenting er stille nedskalert:
hver utelatelse står her, med hva som konkret trengs for å bygge den.
