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

## Vipps (for norske brukere)

Vipps vises som betalingsvalg på `/oppgrader` når prisene står i NOK. Selve
betalingen skjer i Stripe-kassa, så du må slå Vipps på i Stripe én gang:

1. Gå til **dashboard.stripe.com** → **Settings** → **Payment methods**.
2. Slå på **Vipps MobilePay**. Da dukker Vipps opp i kassa for kunder som
   betaler i NOK, automatisk på alle betalingslenkene dine.

Merk: kort, Apple Pay og Google Pay er alltid med. Vipps er norsk og vises
bare for NOK-priser, ikke for USD.

## Tilgang følger planen (Start / Proff / Proff + Fellesskap)

Når noen betaler, leser webhooken hvilken plan de kjøpte (ut fra beløpet) og gir
tilgang etter nivå. Sidene er låst slik:

- **Start (299 kr):** dashbord, AI-innhold (Spør Renate AI), Akademiet.
- **Proff (499 kr):** alt i Start, pluss innholdsstudioet (LME Builder),
  AI Traffic Engine og Creative/Creator Academy.
- **Proff + Fellesskap (699 kr):** alt i Proff, pluss fellesskapet: grupper,
  Inner Circle, live, opptak, ressurser, biblioteket, medlemmer, perks, wins,
  partnere, meldinger og favoritter.

Innlogget uten betalt plan blir sendt til `/oppgrader`. Du (eier) slipper alltid
inn overalt.

### Endre hvilke sider som hører til hvilken plan

Alt styres ett sted: `functions/_plans.js`.

- **`PAGE_RULES`** kobler side til nivå (1 = Start, 2 = Proff,
  3 = Proff + Fellesskap, `"auth"` = bare innlogging). Legg til eller endre en
  linje for å gate flere sider. Alt som ikke står der, er åpent for alle.
- **`PLAN_AMOUNTS`** kobler beløp til plan. Endrer du prisene i LME
  innholdsstudio, oppdater beløpene her (i øre/cent) så riktig plan blir gitt.
