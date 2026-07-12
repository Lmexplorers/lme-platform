# LME Inner Circle: betaling og partnerprogram

Workeren `lme-inner-circle` har nå salgsside, Stripe-betaling med 14 dagers
prøvetid, partnerprogram (affiliate) og admin-dashbord.

## Nye sider

- `/medlemskap` - salgsside med tre planer (Basis 149 kr, Pro 299 kr, VIP 599 kr per måned)
- `/takk` - takkesiden etter kjøp
- `/affiliate` - partnerprogrammet (registrering og dashbord)
- `/admin` - admin-dashbord, kun for VIP-kontoer

Prisene endres øverst i `worker.js` (PLANS, beløp i øre).

## Slik tar du det i bruk (én gang)

### 1. Deploy Workeren

Koden ligger i `workers/lme-inner-circle/worker.js`. Lim den inn i
Cloudflare-dashbordet: Workers & Pages -> lme-inner-circle -> Edit code ->
erstatt alt -> Deploy. (Eller kjør `wrangler deploy` fra denne mappen.)

### 2. Legg inn nøklene (Settings -> Variables and Secrets på Workeren)

| Navn | Verdi |
| --- | --- |
| `STRIPE_SECRET_KEY` | `sk_live_...` fra Stripe -> Developers -> API keys |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` fra steg 3 |
| `MAILERLITE_API_KEY` | API-nøkkelen fra MailerLite -> Integrations -> API |

`AFFILIATE_COMMISSION_PERCENT` (30) og `AFFILIATE_COOKIE_DAYS` (30) ligger
allerede som vanlige variabler og kan endres der.

### 3. Lag webhooken i Stripe

1. Gå til dashboard.stripe.com -> Developers -> Webhooks -> Add endpoint.
2. Endpoint URL: `https://<worker-adressen din>/webhook/stripe`
3. Velg hendelsene `checkout.session.completed`, `invoice.paid`,
   `customer.subscription.updated` og `customer.subscription.deleted`.
4. Kopier "Signing secret" (`whsec_...`) og legg den inn som
   `STRIPE_WEBHOOK_SECRET` i steg 2.

### 4. Velkomst-epost i MailerLite

Workeren melder nye medlemmer inn i MailerLite (feltet `lme_plan` sier hvilken
plan de valgte). Lag en automasjon i MailerLite med trigger "ny abonnent", så
sendes velkomst-eposten automatisk. E-postene loggføres også i tabellen
`email_queue` i D1.

## Slik virker det

- Kjøp: kunden velger plan på `/medlemskap`, betaler hos Stripe og får 14
  dagers gratis prøvetid. Webhooken gir riktig tilgang (tier) automatisk, og
  tilgangen fjernes hvis abonnementet sies opp.
- Partner: medlemmer registrerer seg på `/affiliate` og får en lenke som
  `/medlemskap?ref=KODE`. Koden lagres i cookie i 30 dager. Provisjonen (30 %)
  regnes av den første ekte betalingen etter prøvetiden og vises både hos
  partneren og i admin-dashbordet. Utbetaling gjør du manuelt; salgene ligger
  i tabellen `affiliate_sales` med status `pending`.
- Admin: `/admin` viser inntekt, betalinger, partnere og e-postkøen. Logg inn
  som VIP-bruker på Workerens forside først.

## D1-endringer (allerede kjørt 12. juli 2026)

- `users` fikk kolonnene `stripe_customer_id`, `stripe_subscription_id` og `referred_by`.
- Nye tabeller: `payments`, `email_queue`, `affiliates` og `affiliate_sales`.
