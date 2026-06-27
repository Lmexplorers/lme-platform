# LME Podkast, en serie som lager seg selv og publiserer daglig

Dette er en helautomatisk podkast. Hver dag skriver den et nytt manus om LME
(Montessori, pedagogikk, det forberedte miljoet, aldersgruppene, boekene, appene,
Inner Circle og hele systemet), stemmelegger det, og legger det i en RSS-feed.
Alle plattformer (Apple Podcasts, Spotify, Amazon Music, YouTube Music, Pocket
Casts osv.) henter nye episoder fra den samme feed-en av seg selv.

> **Den store ideen:** Du melder feed-en inn EN gang per plattform. Etter det er
> alt automatisk. Du trenger aldri laste opp en episode manuelt igjen.

Feed-URL (norsk): `https://lmexplorers.com/api/podcast/feed.xml`
Feed-URL (engelsk): `https://lmexplorers.com/api/podcast/feed-en.xml`
Landingsside: `https://lmexplorers.com/podkast`

---

## Hva som allerede virker uten oppsett

- Siden `/podkast` og API-et `/api/podcast/*` deployes med vanlig Pages-bygg.
- Trykk "Lag dagens episode" paa `/podkast` (med passord) saa lages en episode
  med en gang. Den vises paa siden og leses hoeyt i nettleseren.

To ting maa settes opp for at det skal bli en EKTE, daglig podkast paa
plattformene: en **stemme (TTS)** og en **daglig cron**.

---

## 1. Skru paa stemmen (TTS), kreves for plattformene

Plattformene trenger en lydfil per episode. Sett EN av disse i Pages-prosjektet
(**Pages -> Settings -> Variables and Secrets**), saa stemmelegges hver episode
automatisk:

**Alternativ A, ElevenLabs (best paa norsk):**
- `ELEVENLABS_API_KEY` = noekkelen din
- `ELEVENLABS_VOICE_ID` = id-en til en norsk/flerspraaklig stemme
- (valgfritt) `ELEVENLABS_MODEL_ID` = `eleven_multilingual_v2` (standard)

**Alternativ B, OpenAI:**
- `OPENAI_API_KEY` = noekkelen din
- (valgfritt) `OPENAI_TTS_VOICE` = f.eks. `alloy`
- (valgfritt) `OPENAI_TTS_MODEL` = `gpt-4o-mini-tts` (standard)

Uten noen av disse lages episodene fortsatt (manus + visning + opplesing i
nettleseren), men de faar ingen lydfil og dukker derfor ikke opp paa Apple/Spotify.

`ANTHROPIC_API_KEY` brukes til aa skrive manuset og er allerede satt (samme
noekkel som Renate AI / LME Builder).

Sett ogsaa et eget passord for generering (ellers brukes samme standard som
kurs-redigering):
- `PODCAST_PASSWORD` = et passord du velger

---

## 2. Skru paa den daglige cron-en (workeren)

Pages-funksjoner kan ikke ha cron, saa den daglige utloeseren er en liten Worker
(akkurat som chat-workeren). Den gjoer bare ett kall om dagen til generate-
endepunktet.

```bash
cd workers/lme-podcast

# Sett samme passord som du valgte i Pages (PODCAST_PASSWORD):
npx wrangler secret put PODCAST_PASSWORD

# Deploy. Cron (06:00 UTC daglig) opprettes fra wrangler.toml.
npx wrangler deploy
```

Vil du teste med en gang, etter deploy:
```
https://<worker-url>/run?key=<PODCAST_PASSWORD>
```

Endre tidspunkt ved aa redigere `crons` i `wrangler.toml` (UTC-tid).

---

## 3. Meld feed-en inn paa plattformene (engangsjobb)

Dette er det eneste manuelle steget, og det gjoeres bare en gang. Bruk
feed-URL-en over.

- **Apple Podcasts:** podcastsconnect.apple.com -> Add Show -> lim inn feed-URL.
- **Spotify:** podcasters.spotify.com -> Add your podcast -> lim inn feed-URL.
- **Amazon Music / Audible:** podcasters.amazon.com -> lim inn feed-URL.
- **YouTube Music:** via YouTube Studio -> Settings -> Podcasts -> RSS.
- **Pocket Casts / Overcast m.fl.:** indekserer automatisk etter Apple/Spotify.

Naar feed-en er godkjent (kan ta noen timer til et doegn foerste gang), dukker
hver ny daglig episode opp automatisk overalt.

> Tips: Lag minst en episode FOER du melder inn feed-en, saa plattformene ser at
> den har innhold.

---

## Hvordan det henger sammen

- **Skriving:** `/api/podcast/generate` ber Claude (samme `ANTHROPIC_API_KEY`)
  skrive en tospraaklig episode rundt neste tema i en roterende tema-bank.
- **Stemme:** Samme endepunkt stemmelegger den norske teksten via TTS og lagrer
  MP3-en i KV (`BUILDER_KV`), servert paa `/api/podcast/audio/<id>.mp3` (med
  Range-stoette saa podkast-spillere kan spole).
- **Publisering:** `/api/podcast/feed.xml` bygger RSS 2.0 + iTunes av alle
  episodene. Plattformene poller feed-en og henter nye episoder selv.
- **Daglig:** Cron-workeren kaller generate en gang i doegnet. Idempotent per
  dato, saa den lager bare en episode per dag.
- **Opprydding:** Lyd for de eldste episodene ryddes etter 90 episoder for aa
  spare KV-plass. Tekst og visning beholdes.

## Justere innholdet

- Tittel, forfatter, bilde og kategori: `SHOW`-objektet i
  `functions/api/podcast/[[path]].js`.
- Tema-banken serien roterer gjennom: `TOPICS` i samme fil. Legg gjerne til
  flere vinkler om LME-systemet.
