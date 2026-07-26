# Deploy av whiteboard-video-motoren

Motoren er en Docker-tjeneste. Den kjører på hvilken som helst vert som støtter
Docker + nok RAM til Remotion (minst ~2 GB). Under er den enkleste veien.

## Du trenger

- En **OpenAI API-nøkkel** (for DALL-E-skissen).
- En **ElevenLabs API-nøkkel** (for stemme + tidsstempler), og gjerne en
  `ELEVENLABS_VOICE_ID` for en stemme som snakker god norsk.
- En Render- eller Railway-konto (begge har gratis registrering).

> Merk om kostnad: hver video bruker litt DALL-E og litt ElevenLabs. Småbeløp
> per video. Selve serveren koster også litt i måneden (gratis-nivåene har for
> lite minne til Remotion, så velg et lite betalt nivå, typisk rundt 7 USD/mnd).

---

## Alternativ A: Render (anbefalt, manuelt oppsett, ~6 felt)

1. Gå til **dashboard.render.com** → **New** → **Web Service**.
2. Koble til GitHub-repoet `Lmexplorers/lme-platform`.
3. Fyll inn:
   - **Root Directory:** `whiteboard-engine`
   - **Runtime/Language:** `Docker` (oppdages fra Dockerfile)
   - **Instance Type:** velg et betalt nivå med minst 2 GB RAM (f.eks. «Standard»).
4. Under **Environment** → legg til:
   - `OPENAI_API_KEY` = din OpenAI-nøkkel
   - `ELEVENLABS_API_KEY` = din ElevenLabs-nøkkel
   - `ELEVENLABS_VOICE_ID` = din norske stemme (valgfritt)
   - `GEMINI_API_KEY` = din Google/Gemini-nøkkel (kreves for den ekte
     håndtegningen: Nano Banana + Veo). Nøkkelen må ha tilgang til Veo.
5. **Create Web Service.** Første bygg tar noen minutter (laster ned Chrome).
6. Når den er «Live», kopier URL-en (f.eks. `https://lme-whiteboard-motor.onrender.com`)
   og legg den inn som `PUBLIC_BASE_URL` i samme Environment-liste, og lagre.

## Alternativ B: Railway

1. **railway.app** → **New Project** → **Deploy from GitHub repo** → velg repoet.
2. I tjeneste-innstillingene: **Root Directory** = `whiteboard-engine`
   (Railway bruker Dockerfile automatisk).
3. **Variables** → legg til `OPENAI_API_KEY`, `ELEVENLABS_API_KEY`,
   `GEMINI_API_KEY` (for Nano Banana + Veo), `ELEVENLABS_VOICE_ID`, og etter
   første deploy `PUBLIC_BASE_URL` = tjenestens URL.
4. Deploy.

---

## Test at den lever

Bytt ut URL-en med din:

```bash
curl -X POST https://DIN-URL/api/generer-whiteboard \
  -H "Content-Type: application/json" \
  -d '{"tema":"Montessori binomialkube","manus":"Den binomiale kuben lar barnet oppleve matematikk med hendene, lenge før tallene kommer."}'
```

Du får tilbake en `videoUrl` du kan åpne i nettleseren.

## Koble til LME-plattformen

Når du har URL-en, si ifra, så legger jeg inn en liten `/api/whiteboard`-funksjon
på plattformen (som holder URL-en hemmelig via `WHITEBOARD_ENGINE_URL`) og kobler
«Lag video»-knappen i Forklaringsvideo til motoren. Da blir det ett klikk:
tema → manus → ferdig whiteboard-video.

## Hvis noe feiler

- **Build feiler på Chrome-biblioteker:** sjekk at du bruker Docker-runtime
  (ikke Node-runtime). Dockerfilen installerer alt Chrome trenger.
- **«Killed» / minnefeil under render:** øk instansen til minst 2 GB RAM.
- **ElevenLabs 401:** feil/utløpt nøkkel. 4xx med «voice not found»: sjekk
  `ELEVENLABS_VOICE_ID`.
