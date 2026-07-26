# LME whiteboard-video-motor

En egen tjeneste som tar imot et **manus** og lager en **whiteboard-video (MP4)**
der teksten skrives fram og en illustrasjon avdekkes mens en ekte stemme leser,
i synk. Dette er "den siste biten" fra AI-oversikten: LLM (manus, ligger på
LME-plattformen fra før) + TTS (ElevenLabs) + tegne-/animasjonsmotor (Remotion).

## Hvorfor en egen tjeneste?

Remotion rendrer video med en hodeløs Chrome på serveren. Det kan **ikke** kjøre
på Cloudflare Pages (der resten av LME ligger). Denne motoren deployes derfor for
seg (Render, Railway, Fly, eller en enkel VPS med Node), og plattformen kaller
den over HTTP.

## Slik virker den (4 steg)

1. **Lyd + tidsstempler** — ElevenLabs `text-to-speech/.../with-timestamps` gir
   MP3 og tegn-tidsstempler. `buildWordTimestamps()` grupperer dem til ord.
2. **Skisse** — DALL-E 3 lager en enkel svart/hvit strektegning av temaet.
3. **Tidslinje** — videolengden settes fra siste ord + 2 sekunder.
4. **Rendring** — Remotion (`video/WhiteboardEngine.tsx`) skriver ordene fram i
   takt med stemmen, avdekker bildet venstre→høyre, og lar en markør "tegne" ved
   avdekkingskanten. `renderMedia` skriver ferdig MP4.

## Kom i gang

```bash
cd whiteboard-engine
npm install
cp .env.example .env      # fyll inn OPENAI_API_KEY og ELEVENLABS_API_KEY
npm start                 # kjører på http://localhost:3000
```

Første rendring laster ned en hodeløs Chrome automatisk (tar litt tid).
På en Linux-server trengs vanlige Chrome-biblioteker (f.eks. `libnss3`,
`libatk1.0-0`, `libgbm1`, `libasound2`); de fleste PaaS-images har dem.

### Test

```bash
curl -X POST http://localhost:3000/api/generer-whiteboard \
  -H "Content-Type: application/json" \
  -d '{
    "tema": "Montessori binomialkube",
    "manus": "Den binomiale kuben lar barnet oppleve matematikk med hendene, lenge før tallene kommer. Barnet bygger, kjenner og ser sammenhengen."
  }'
```

Svar:

```json
{ "success": true, "videoUrl": "http://127.0.0.1:3000/output/video_...mp4", "durationSeconds": 12.4, "words": 24 }
```

## Forhåndsvis animasjonen mens du utvikler

```bash
npm run studio
```

Åpner Remotion Studio, der du kan justere `WhiteboardEngine.tsx` (skrift, farger,
markør, tempo) live.

## Koble til LME-plattformen

Når motoren er deployet (får en URL, f.eks. `https://whiteboard.lmexplorers.com`),
kaller plattformen den med manuset som Forklaringsvideo allerede lager:

```js
// Forklaringsvideo bygger voiceover-teksten fra scenene:
const manus = EXPL.scenes.map(s => s.narration).join(" ") + " " + (EXPL.takeaway || "");
const r = await fetch(WHITEBOARD_ENGINE_URL + "/api/generer-whiteboard", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ tema: EXPL.title, manus, voiceId: "<din ElevenLabs-stemme>" }),
});
const { videoUrl } = await r.json();  // vis / last ned / ta med til Reel Studio
```

Anbefalt: legg en liten proxy-funksjon på plattformen (`/api/whiteboard`) som
holder motorens URL som en hemmelighet (`WHITEBOARD_ENGINE_URL`), så nettleseren
aldri ser den direkte. Si ifra, så wire-r jeg den inn når motoren er oppe.

## Ærlige begrensninger (og neste steg)

- **Én illustrasjon per video** avdekkes. For en illustrasjon *per scene* kaller
  du motoren per scene og setter sammen klippene, eller utvider
  `WhiteboardEngine.tsx` til å bytte bilde per scene ut fra tidsstemplene.
- **Markøren følger tegnekanten** på bildet (ikke hver enkelt bokstav). Det gir
  en tydelig "tegnes nå"-følelse uten skjør bokstav-sporing. Ekte penn-på-hver-
  bokstav krever å måle tekstlayouten; det er et naturlig neste steg.
- **Norsk stemme:** sett `ELEVENLABS_VOICE_ID` til en stemme på kontoen din som
  snakker god norsk, og bruk `eleven_multilingual_v2`.

## Filer

- `server.js` — Express-API, ElevenLabs, DALL-E, Remotion-rendring.
- `video/Root.tsx` — Remotion-komposisjonen (dynamisk lengde via calculateMetadata).
- `video/WhiteboardEngine.tsx` — selve animasjonen (tekst, bilde, markør, lyd).
- `remotion.config.ts`, `tsconfig.json`, `.env.example`.
