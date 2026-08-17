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

- **Analytics dashboard**, scheduled/automated daily video generation,
  multi-platform auto-posting. All real FacelessGenie features, all
  explicitly out of scope for this first pass.
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
- ~~Audio-upload input~~ Built: `functions/api/videoflow/transcribe.js`
  (OpenAI Whisper, flat `CREDIT_COSTS.transcribe`) + upload/record buttons
  in `videoflow-studio.html`'s idea form (MediaRecorder for in-browser
  recording, falls back to a plain file upload if unsupported). Fills the
  idea field with the transcript, same as typing.
- ~~Stripe subscription/checkout automation~~ Built, see the dedicated
  section below.

## Stripe subscription (live, built 13. august 2026)

Real, live-mode billing (Renate: "Live modus, opprett, du vet jo prisene",
"Sett i gang med alt"). $8/mo (USD) / 89 kr/mnd (NOK), recurring monthly,
2000 credits/mo, matches the FacelessGenie numbers on `videoflow.html`.

- **Product**: `prod_V4D12UtsHgmMld`, created directly via the Stripe API
  (live mode). Two prices on it, one per currency (corrected 14. august
  2026 after Renate caught the Norwegian link charging in USD — "Hvorfor
  priser du med Dollar på den norske og? Det skal det være NOK" — the
  first version had one USD price shared by both language links):
  - `price_1U44bSLax7B8uQzqahgfMCP4` — USD, $8/mo
  - `price_1U5N52Lax7B8uQzq0Ni3CoxI` — NOK, 89 kr/mnd, following the same
    USD→NOK price-matching pattern as `AUTOPILOT_PAYMENT_LINKS`
    ($19→199kr, $54→549kr, $99→999kr)
- **Payment links**, one per currency/language, registered in
  `functions/_lib/purchase-links.js` (`VIDEOFLOW_PAYMENT_LINKS`,
  `videoFlowCheckoutUrl(lang)`):
  - no: `plink_1U5N58Lax7B8uQzqzDtZzZzl` → https://buy.stripe.com/9B64gAfsxgDR7a5eFF9R702 (NOK)
  - en: `plink_1U44bpLax7B8uQzqcoo98yaj` → https://buy.stripe.com/28E3cw6W11IX7a5cxx9R701 (USD)
  - ~~`plink_1U44bjLax7B8uQzqZuEoO2dT`~~ deactivated in Stripe (was the
    original, wrongly-USD-priced "no" link), kept mapped with
    `deactivated: true` purely so an already-started checkout against it
    still grants credits correctly if one somehow completes.
  Linked from the pricing card on `videoflow.html` (89 kr/mnd for the
  Norwegian page, $8/mo for the English page, both `data-no`/`data-en`
  driven, not hardcoded to one currency) and from a "⚡ Fyll på kreditter" /
  "Abonner, 89 kr/mnd" (or "Subscribe, $8/mo") button in `videoflow-
  studio.html`'s topbar, shown whenever the balance hits 0 or there's no
  active subscription.
- **Webhook**: reuses the platform's one already-live Stripe endpoint
  (`functions/api/oppskrift-webhook.js`, `/api/oppskrift-webhook`, the same
  one Autopilot/courses/oppskrifter use), not a new endpoint. Added
  `invoice.paid` to that endpoint's `enabled_events` in Stripe (it only had
  `checkout.session.completed`/`customer.subscription.updated`/`.deleted`
  before), since VideoFlow's monthly credit refill depends on it.
  - `checkout.session.completed` (first payment): `grantVideoFlowSub` +
    `setMonthlyCredits(env, email, 2000)` + welcome mail
    (`functions/_lib/videoflow-mail.js`) + owner sale notice + purchase record.
  - `customer.subscription.updated`/`.deleted`: keeps `vf-sub:<email>`
    status in sync (active/canceled), does **not** touch the credit
    balance, since this event fires for more than just renewal (e.g.
    payment method updates).
  - `invoice.paid`: the actual renewal trigger, resets credits to exactly
    2000 (`setMonthlyCredits`, a reset not an add, so accidental double
    delivery of the same invoice event is harmless). Matched on the
    invoice's line-item product (`VIDEOFLOW_PRODUCT_ID`).
- **Blocking on empty credits**: already-existing behavior
  (`functions/_lib/videoflow-access.js` `enforceVideoFlow`, unchanged
  logic), a debit that would go negative returns `needCredits:true` and the
  generation is refused with a 402, before this Stripe work and after it.
- **Reminder emails, day 3/7/14 after credits run out** (Renate: "Påminnelse
  etter 3, 7, 14 dager?", and 14. august 2026: "påfølgende mail til
  engelskspråklig må få oppfølgingsmail på engelsk"): the *first* time a
  generation is blocked for lack of credits, `enforceVideoFlow` queues
  `vf_fu:<email>:d3/d7/d14` in KV (guarded so it only queues once per empty
  period, not on every blocked click). `functions/api/cron/videoflow-
  followups.js` (daily via `.github/workflows/videoflow-followups.yml`)
  sends `videoflowEmptyCreditsEmail` for whichever are due, re-checking the
  balance immediately before sending and silently dropping the job if the
  person already topped up/resubscribed. Language: `grantVideoFlowSub`
  stores which payment link (no/en) the person bought through as
  `vf-sub:<email>.lang`, kept unchanged on renewal (renewal events don't
  carry a language, so the original purchase language sticks); both the
  welcome mail and every reminder mail read that field, so an English buyer
  gets English mail throughout, not just at checkout.
- Not built: a self-serve "manage/cancel my subscription" page (Stripe's
  own customer portal isn't wired in), and proration/plan changes (there's
  only one plan).

## Credit economy

$8/mo (USD) / 89 kr/mnd (NOK) for 2000 credits (matches FacelessGenie's own
USD numbers, picked deliberately for easy comparison; NOK price follows the
platform's usual USD→NOK conversion pattern, see "Stripe subscription"
above). Costs in
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
  already set up for Mia & Teo Video Creator. `MAILERSEND_API_KEY` for the
  welcome/reminder emails, already set up platform-wide. No new secrets.
- **Stripe**: uses the platform's existing live account and existing
  webhook endpoint (`we_1Txx1mLax7B8uQzqfUrRrHea`, `/api/oppskrift-webhook`).
  No new `STRIPE_*` secret needed. Optional: repo secret
  `VIDEOFLOW_CRON_TOKEN` to protect `/api/cron/videoflow-followups`, same
  pattern as `CLAUDE_CRON_TOKEN`.
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
- `vf-credit:<email>` → credit balance (integer, reset to 2000 on subscribe/renew)
- `vf-sub:<email>` → subscription status `{status, customer, sub, since, updated}`
- `scust:<stripe-customer-id>` → email (shared with the rest of the
  platform's Stripe webhook, see `functions/_lib/purchase-links.js`)
- `vf_fu:<email>:d3`/`:d7`/`:d14` → queued "credits ran out" reminder jobs,
  consumed and deleted by `functions/api/cron/videoflow-followups.js`

## Files

```
videoflow.html                          Landing/marketing page
videoflow-studio.html                   Creator app
functions/_lib/
  videoflow-styles.js                   8 style presets, avoid/safety lists
  videoflow-providers.js                Text/image/voice adapters + credit costs
  videoflow-credits.js                  Credit ledger (+ setMonthlyCredits reset)
  videoflow-access.js                   Owner-free-else-credits gate (+ reminder queueing)
  videoflow-store.js                    Per-user KV data model
  videoflow-mail.js                     Welcome + credits-empty reminder emails
  purchase-links.js                     Shared with rest of platform: VIDEOFLOW_PAYMENT_LINKS,
                                         grantVideoFlowSub/revokeVideoFlowSub/getVideoFlowSub
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
functions/api/cron/videoflow-followups.js   Daily: sends due day-3/7/14 empty-credits reminders
functions/api/oppskrift-webhook.js          Shared Stripe webhook: VideoFlow checkout/renewal/cancel
whiteboard-engine/video/CaptionedSlideshow.tsx   Ken Burns/OffthreadVideo + karaoke captions
whiteboard-engine/server.js                       + /api/generer-videoflow route
```
