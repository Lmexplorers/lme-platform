# Betaling = tilgang (Stripe-webhook)

Når noen betaler for Inner Circle, skal de automatisk få tilgang til
gruppe-chatten. Koden er ferdig (`functions/api/stripe-webhook.js`) og live.
Det gjenstår ÉN engangsting som bare du kan gjøre, fordi den krever din
Stripe-konto: koble Stripe til webhooken og lime inn én hemmelig nøkkel.
Dette tar et par minutter.

## Steg 1 – Lag webhooken i Stripe

1. Logg inn på Stripe → **Developers → Webhooks → Add endpoint**.
2. Endpoint-URL:
   ```
   https://lmexplorers.com/api/stripe-webhook
   ```
3. Velg disse hendelsene («Select events»):
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.paid`
4. Lagre. Stripe viser nå en **Signing secret** som starter med `whsec_...`.
   Kopier den.

## Steg 2 – Lim nøkkelen inn i Cloudflare

1. Cloudflare-dashbordet → **Workers & Pages → (LME-prosjektet) → Settings →
   Variables and Secrets** (miljøvariabler for Production).
2. Legg til:
   - Navn: `STRIPE_WEBHOOK_SECRET`
   - Verdi: `whsec_...` (nøkkelen fra Stripe)
3. Lagre, og gjør en ny deploy (eller bare push noe lite til `main`) slik at
   variabelen tas i bruk.

Det er alt. Fra nå av:

- Når noen betaler, skriver webhooken et medlemskap til kontoen deres og de
  slipper rett inn i gruppene.
- Sier de opp, fjernes tilgangen automatisk.
- Du (eier) har alltid tilgang uansett.

## Slik virker det

- Stripe sender en signert melding til `/api/stripe-webhook`. Vi sjekker
  signaturen mot `STRIPE_WEBHOOK_SECRET` så ingen kan forfalske betalinger.
- Ved betaling lagres `member:<e-post>` i KV (og speiles til kontoen for «Min
  konto»). Porten foran gruppene (`/api/group`) sjekker dette.
- Mangler nøkkelen, svarer webhooken med 503, og Stripe viser «failed» på
  leveringen. Da vet du at steg 2 ikke er gjort ennå.

## Test at det virker

1. Etter oppsettet: i Stripe → Webhooks → din endpoint → **Send test event**
   → velg `checkout.session.completed`. Den skal svare `200`.
2. Eller betal en ekte (eller test-modus) Inner Circle-bestilling med en
   e-post du har en LME-konto på, og åpne en gruppe. Du skal være inne.
