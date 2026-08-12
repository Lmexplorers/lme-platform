# Vipps-betaling — oppsett

Egen liten Cloudflare Worker som oppretter Vipps-betalinger via Vipps
MobilePay sitt **ePayment API** (den gjeldende, aktive APIen deres, ikke
den utfasede "eCom"-APIen med andre endepunkter).

## 1. Hent nøklene dine

1. Logg inn på `portal.vippsmobilepay.com`.
2. Finn salgsenheten (merchant) du skal ta betalt til.
3. Under **API-nøkler** (eller tilsvarende) finner du:
   - `client_id`
   - `client_secret`
   - `Ocp-Apim-Subscription-Key` (abonnementsnøkkel)
   - `Merchant-Serial-Number` (MSN, et tall som identifiserer salgsenheten)

Test disse først i **testmiljøet** (egne testnøkler, egen testapp), bytt
til ekte produksjonsnøkler når alt fungerer.

## 2. Deploy workeren

```
cd workers/vipps-payment
npx wrangler deploy
```

## 3. Legg inn hemmelighetene

```
npx wrangler secret put VIPPS_CLIENT_ID
npx wrangler secret put VIPPS_CLIENT_SECRET
npx wrangler secret put VIPPS_SUBSCRIPTION_KEY
npx wrangler secret put VIPPS_MERCHANT_SERIAL_NUMBER
```

(Limes inn én om gangen, terminalen spør deg om verdien etter hver
kommando.)

## 4. Test et kjøp

```
curl -X POST https://lme-vipps-payment.<ditt-cloudflare-subdomene>.workers.dev/vipps/pay \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 1000,
    "reference": "test-ordre-001",
    "returnUrl": "https://lmexplorers.com/takk",
    "description": "Test av Vipps-betaling"
  }'
```

`amount` er i øre (1000 = 10,00 kr). Svaret skal inneholde en
`redirectUrl`, det er lenken du sender kunden til (Vipps-appen på mobil,
eller en side for å skanne QR/logge inn på desktop).

**Viktig å sjekke selv første gang**: jeg har ikke klart å hente Vipps
sin offisielle dokumentasjon direkte i dette miljøet (nettleseren min ble
blokkert), så feltnavnet `redirectUrl` i svaret er bygget på søkeresultater
og generell kunnskap om APIet, ikke dobbeltbekreftet mot deres egen
referanse. Kjør test-kjøpet over først, og se i responsen (`raw`-feltet i
loggen) om lenken faktisk heter `redirectUrl`. Si fra til meg hvis noe
annet dukker opp i svaret, så retter jeg det med en gang.

## 5. Koble på et ekte kjøp

Denne workeren gjør foreløpig bare selve Vipps-kallet, den er ikke koblet
til noe produkt på lmexplorers.com ennå. Neste steg (når du er klar):
kall `/vipps/pay` fra riktig sted i kjøpsflyten (f.eks. en knapp ved
siden av Stripe-knappen), og sett opp et webhook-endepunkt som lytter på
Vipps sine betalingshendelser for å bekrefte når pengene faktisk har
kommet inn, samme mønster som `oppskrift-webhook.js` gjør for Stripe.
