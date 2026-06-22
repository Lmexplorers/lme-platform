# Betaling = tilgang (Stripe), uten Cloudflare

Når noen betaler for Inner Circle, får de automatisk tilgang til gruppe-
chatten. Du gjør dette ÉN gang, og slipper Cloudflare helt: nøkkelen limes
inn på din egen side.

## Del 1 – Lag webhooken i Stripe

1. Gå til **dashboard.stripe.com** (slå **av** «Test mode» øverst hvis det
   skal gjelde ekte betalinger).
2. Lag en ny webhook / «event destination». Snarvei: lim
   `https://dashboard.stripe.com/webhooks/create` i adressefeltet, eller søk
   «Webhooks» i søkefeltet på toppen.
3. **Endpoint URL:**
   ```
   https://lmexplorers.com/api/stripe-webhook
   ```
4. Velg disse fem hendelsene:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.paid`
5. Opprett. Finn **Signing secret** (klikk «Reveal»), kopier koden som starter
   med `whsec_...`.

## Del 2 – Lim nøkkelen inn på din egen side

1. Gå til **lmexplorers.com/grupper/admin** og logg inn med eierkontoen din.
2. Under **«Automatisk tilgang (Stripe)»**, lim inn `whsec_...`-koden og trykk
   **Lagre nøkkel**.
3. Det skal nå stå «✅ På: betaling gir tilgang automatisk».

Ferdig. Ingen Cloudflare. Fra nå av:

- Når noen betaler, slipper de rett inn i gruppene.
- Sier de opp, fjernes tilgangen.
- Du (eier) er alltid inne.

## Test at det virker

I Stripe, på webhookens side: klikk **Send test event** → `checkout.session.completed`.
Den skal svare **200**. Får du **503**, er ikke nøkkelen lagret ennå (gjør del 2).
Får du **400**, er feil nøkkel limt inn.

## Manuell tilgang (valgfritt)

På samme side (`/grupper/admin`) kan du gi gratis tilgang til enkeltpersoner
uten betaling, og fjerne tilgang igjen. Det er ikke nødvendig for det
automatiske, bare et alternativ.
