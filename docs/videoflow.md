# LME VideoFlow

**Name:** LME VideoFlow · **Tagline:** From idea to finished video. ·
**Pitch:** Turn any idea, text or audio into a ready-to-post video with AI.

A new, standalone, sellable app (not nested inside "LME Studio" naming,
though it lives in the same creative section of the platform as Video
Studio, Reel Studio and Mia & Teo Studio). General-purpose: any topic, any
niche, no fixed characters, unlike Mia & Teo Video Creator
(`docs/mia-teo-video-creator.md`), which this reuses architectural patterns
from but does not share code with (kept as separate files on purpose, so
the two products can evolve independently).

## Status: Phase 1 (core engine), built now

- Idea → script (Claude): scene list with narration, on-screen caption text,
  and a style-agnostic visual description per scene
- 8 visual style presets (Cinematic, 3D Pixar, Anime, Claymation, Comic,
  Vintage, Photoreal, Whiteboard sketch), applied at image-generation time,
  not baked into the script, so a future "swap style" feature can re-render
  images without a new script call
- Per-scene styled image (OpenAI/Gemini)
- Per-scene voice with word-level timestamps (ElevenLabs with-timestamps),
  4 curated preset voices
- Assembly into one finished video: Ken Burns slideshow with animated
  karaoke-style captions burned in, via a new whiteboard-engine composition
  (`whiteboard-engine/video/CaptionedSlideshow.tsx` +
  `/api/generer-videoflow`), same reuse-not-rebuild approach as Mia & Teo's
  render step, no new render infrastructure
- Finished videos copied to R2 for permanent storage (needs a binding, see
  "Infrastructure requirements")
- **Internal credit ledger** (`functions/_lib/videoflow-credits.js`):
  `vf-credit:<email>` balance in KV, debited per generation at the rates in
  `functions/_lib/videoflow-providers.js` CREDIT_COSTS, refunded on
  failure. Owner (Renate) always unlimited, per the platform-wide rule.
- Multi-user: every project is scoped to the account that created it
  (unlike Mia & Teo, which is owner-only)
- Landing page (`videoflow.html`) + creator app (`videoflow-studio.html`)

## Deliberately NOT built yet (phased, not silently cut)

- **Stripe subscription/checkout automation.** This is real billing and
  needs its own careful pass: creating the $8/mo product/price, a checkout
  route, a webhook that grants 2000 credits on successful payment and
  resets them monthly, handling cancellations/failed payments. Right now
  credits can only be granted manually (`grantCredits` in
  `videoflow-credits.js`), there is no self-serve purchase flow. Do not
  present this as "you can sell it today", the payment plumbing isn't there.
- ~~Image-to-video premium tier~~ Built: `functions/api/videoflow/scene-
  video.js` (Higgsfield `dop-turbo`, adapter duplicated on purpose into
  `functions/_lib/videoflow-providers.js` rather than imported, keeping the
  two apps' provider code independent). Optional, per-scene, priced well
  above a still image (`CREDIT_COSTS.video`, 8x `CREDIT_COSTS.image`,
  matches FacelessGenie's own affordable-stills-vs-premium-footage split).
  Requires the scene's image to already be ready. `functions/api/videoflow/
  render.js` opportunistically uses a scene's animated clip instead of its
  Ken Burns still whenever one is ready, never blocks the render waiting
  for one. Rendered in `whiteboard-engine/video/CaptionedSlideshow.tsx` via
  `OffthreadVideo` (same approach as Mia & Teo's `EpisodeComposition.tsx`).
  "🎥 Animer scene (premium)" button + poll in `videoflow-studio.html`.
- ~~Scene reordering~~ Built: drag-and-drop scene cards in
  `videoflow-studio.html` (native HTML5 drag/drop, no library), reassigns
  `scene.index` and autosaves. Trimming/swapping individual animated clips
  is still not built (only full re-animate-this-scene).
- ~~Style-swap re-render UI~~ Built: `functions/api/videoflow/restyle.js` +
  the style picker/button in `videoflow-studio.html`. Regenerates every
  scene's image in a new style from the stored `visualDescription`, no new
  script call, credits debited once for the whole batch upfront (not N
  separate debits, avoids a credit-ledger race across parallel calls).
- **Analytics dashboard**, scheduled/automated daily video generation,
  multi-platform auto-posting. All real FacelessGenie features, all
  explicitly out of scope for this first pass.
- ~~Audio-upload input~~ Built: `functions/api/videoflow/transcribe.js`
  (OpenAI Whisper, flat `CREDIT_COSTS.transcribe`) + upload/record buttons
  in `videoflow-studio.html`'s idea form (MediaRecorder for in-browser
  recording, falls back to a plain file upload if unsupported). Fills the
  idea field with the transcript, same as typing.

## Credit economy

$8/mo target price for 2000 credits (matches FacelessGenie's own numbers,
picked deliberately for easy comparison). Costs in
`functions/_lib/videoflow-providers.js` CREDIT_COSTS:

| Action | Cost |
|---|---|
| Script (whole project, one Claude call) | 20 credits |
| One scene image | 15 credits |
| One scene voice line | ~0.08 credits/character (min 3) |
| Audio idea transcription (Whisper) | 15 credits |
| One scene animated to video (premium, optional) | 120 credits |

A typical 6-scene video: ~20 + 6×15 + 6×~10 ≈ 160-180 credits, so 2000
credits covers roughly 10-12 videos a month (more if scenes are animated
with the premium video tier, which is priced deliberately high since a
Higgsfield clip costs far more than a still image). These are launch
estimates, not measured against real usage yet, revisit once real videos
have been made.

## Infrastructure requirements

- Same provider keys as the rest of the platform: `ANTHROPIC_API_KEY`,
  `OPENAI_API_KEY`/`GEMINI_API_KEY`, `ELEVENLABS_API_KEY`, and (for the
  premium image-to-video tier) `HIGGSFIELD_API_KEY`/`HIGGSFIELD_SECRET`,
  already set up for Mia & Teo Video Creator. No new secrets.
- **R2 binding** `VIDEOFLOW_MEDIA` on the lme-platform Pages project
  (Settings → Functions → R2 bucket bindings), for permanent storage of
  finished videos (`functions/api/videoflow/media.js`). Can point at the
  same bucket as Mia & Teo's `MIATEO_EPISODES` binding or a different one,
  bindings are independent of which bucket backs them. Falls back to the
  render engine's own (non-durable) URL until this is added.
- Rendering reuses the already-deployed `whiteboard-engine` Render.com
  service (no new server, no new monthly cost).

## Data model

KV documents (`BUILDER_KV`), scoped per user:

- `vf:project:<id>` → full project (input, scenes, render state)
- `vf:project-index:<email>` → light index for that user's library
- `vf:audio:<id>` → generated voice-line audio blobs
- `vf-credit:<email>` → credit balance

## Files

```
videoflow.html                          Landing/marketing page
videoflow-studio.html                   Creator app
functions/_lib/
  videoflow-styles.js                   8 style presets, avoid/safety lists
  videoflow-providers.js                Text/image/voice adapters + credit costs
  videoflow-credits.js                  Credit ledger
  videoflow-access.js                   Owner-free-else-credits gate
  videoflow-store.js                    Per-user KV data model
functions/api/videoflow/
  script.js         idea -> scenes (Claude), credit-gated
  project.js         CRUD/library + balance endpoint
  scene-image.js      per-scene styled image, credit-gated
  scene-voice.js       per-scene voice + timestamps, credit-gated, serves audio
  scene-video.js         per-scene premium image-to-video (Higgsfield), credit-gated
  restyle.js               batch style-swap re-render, credit-gated
  transcribe.js              audio idea upload -> Whisper transcript, credit-gated
  render.js            starts/polls assembly, copies result to R2
  media.js              serves finished videos from R2
whiteboard-engine/video/CaptionedSlideshow.tsx   Ken Burns/OffthreadVideo + karaoke captions
whiteboard-engine/server.js                       + /api/generer-videoflow route
```
