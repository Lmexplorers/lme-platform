# Lansere LME Autopilot: status og de eksakte stegene

Skrevet 26. august 2026.

## Kort oppsummert

Salget er åpent igjen. Autopilot ble stengt 19. august kl. 08:16, da de tre
produktene ble arkivert i Stripe. Et arkivert produkt slår ut alle
betalingslenkene, og Stripe nekter til og med å slå lenkene på igjen så lenge
produktet er arkivert:

> Payment Links cannot include a price with an inactive product.

Autopilot var derfor umulig å kjøpe i en uke. Renate ba meg åpne igjen
26. august 2026, og alt under er gjort.

## Gjort 26. august 2026

- De tre produktene er åpnet: Start, Proff og VIP.
- Alle åtte betalingslenkene er slått på, med rabattkoder tillatt.
- Grunnleggerkupongen er opprettet: 250 kr avslag i måneden i 12 måneder,
  kupong `EG6jdcaS`, kampanjekode `GRUNNLEGGER` (`promo_1U8WMRLax7B8uQzqbWHUB55B`),
  begrenset til to innløsninger og til førstegangskjøp.
- Den gamle 499-prisen på Proff er arkivert, så ingen kan plukke den ved en feil.
- Årsplan for Start og Proff er laget, 1 990 kr og 5 490 kr, altså to måneder
  gratis, samme regnestykke som VIP allerede hadde.
- Alle tolv betalingslenkene er laget på nytt, og de gamle åtte er slått av.
  Grunnen står under, i steg 2: teksten kunden ser i Stripe-kassen er et
  avtrykk av produktnavnet slik det var da lenken ble laget, og den kan ikke
  redigeres i etterkant. De gamle lenkene sa fortsatt det gamle navnet.

Lenken til Cecilie og Bente:

```
https://buy.stripe.com/eVq00k8055Zd51XgNN9R70R?prefilled_promo_code=GRUNNLEGGER
```

Verifisert mot Stripe: lenken står på 549 kr, kupongen trekker 250 kr, altså
299 kr i måneden i 12 måneder, deretter 549 kr. Koden er aktiv med null
innløsninger brukt.

Merk at koden krever førstegangskjøp. Tester Renate den med en e-post som
allerede har kjøpt noe av LME før, blir den avvist. Bruk en fersk e-post ved
test.

## Prisene

Sjekket direkte mot Stripe 26. august 2026:

| Plan | Kroner | Dollar | Produkt |
| --- | --- | --- | --- |
| Start | 199 kr | $19 | `prod_UwWlnVHko5a1Dt` |
| Proff | 549 kr | $54 | `prod_UTtEl6dxkbq4qM` |
| VIP | 999 kr | $99 | `prod_UwWmmP16D4lT5Z` |
| Start årlig | 1 990 kr | $190 | samme som Start |
| Proff årlig | 5 490 kr | $540 | samme som Proff |
| VIP årlig | 9 990 kr | $990 | samme som VIP |

Tallene stemmer med `functions/_lib/plans.js`, med `/oppgrader` og med
`lme-pricing.js` i Autopilot-appen. Ingenting av dette trenger endring.

Den gamle 499-prisen på Proff (`price_1TUvS3Lax7B8uQzqQcZAW8Dx`) er arkivert
26. august 2026, så ingen kan plukke feil pris senere.

## Steg 1: åpne de tre produktene (gjort)

Sett `active: true` på `prod_UwWlnVHko5a1Dt`, `prod_UTtEl6dxkbq4qM` og
`prod_UwWmmP16D4lT5Z`. Ingenting annet trengs, prisene ligger der fra før.

## Steg 2: betalingslenkene (gjort)

Lenkene ble først bare slått på igjen. Da oppdaget jeg at de sa feil navn i
kassen: fire av dem sto med det gamle produktnavnet, og fire sto bare med
"VIP" uten merkevare. Teksten på linjen i Stripe-kassen er et avtrykk av
produktnavnet slik det var den dagen lenken ble laget, og Stripe lar den ikke
redigeres etterpå. Eneste måten å rette den på er å lage lenken på nytt.

Derfor er alle tolv laget om, og de gamle åtte er satt til `active: false`.
Alle tolv har `allow_promotion_codes: true`, ellers virker ikke
grunnleggerkoden. Alle sier nå "LME Autopilot" i kassen.

| Lenke | Plan | Adresse |
| --- | --- | --- |
| `plink_1U8eBXLax7B8uQzq6DNWQTYD` | Start, kroner | `buy.stripe.com/dRmcN62FL3R53XT1ST9R70P` |
| `plink_1U8eBZLax7B8uQzqoMVzOZ8z` | Start, dollar | `buy.stripe.com/fZu00k949bjxdyteFF9R70Q` |
| `plink_1U8eBbLax7B8uQzq5BZQyOWH` | Proff, kroner | `buy.stripe.com/eVq00k8055Zd51XgNN9R70R` |
| `plink_1U8eBdLax7B8uQzqHGyhooDY` | Proff, dollar | `buy.stripe.com/14A3cwcgl5ZdfGBfJJ9R70S` |
| `plink_1U8dkfLax7B8uQzqQWZty5Zt` | Start årlig, kroner | `buy.stripe.com/9B6eVe1BHevJ1PL8hh9R70L` |
| `plink_1U8dkgLax7B8uQzq29kpOfYm` | Start årlig, dollar | `buy.stripe.com/7sY6oIdkpcnB1PL5559R70M` |
| `plink_1U8dkmLax7B8uQzqkr5b7uee` | Proff årlig, kroner | `buy.stripe.com/3cI9AUeot5Zd8e96999R70N` |
| `plink_1U8dknLax7B8uQzqm94G5Tmh` | Proff årlig, dollar | `buy.stripe.com/00w9AUfsxfzNcupfJJ9R70O` |
| `plink_1U8eBiLax7B8uQzqTShVS4k8` | VIP, kroner | `buy.stripe.com/4gM9AUa8d87l1PLbtt9R70T` |
| `plink_1U8eBlLax7B8uQzqXaCjQ2o6` | VIP, dollar | `buy.stripe.com/cNiaEY5RX1IX0LH6999R70U` |
| `plink_1U8eBnLax7B8uQzq2QQmUwSe` | VIP årlig, kroner | `buy.stripe.com/3cI7sM2FL2N1eCx2WX9R70V` |
| `plink_1U8eBoLax7B8uQzqVKts7Zm3` | VIP årlig, dollar | `buy.stripe.com/eVqeVe1BH73h661btt9R70W` |

Webhooken kjenner igjen kunden på lenke-ID-en (`AUTOPILOT_PAYMENT_LINKS` i
`functions/_lib/purchase-links.js`), og gir tilgang og kvote ut fra den. Lages
en lenke om, må den listen oppdateres i samme slengen, ellers betaler kunden
uten å få tilgang. Det var akkurat den feilen appen hadde med FEA Create.

De tolv over står nå tre steder, og de tre skal alltid stemme overens:
`AUTOPILOT_PAYMENT_LINKS` (lenke-ID), `/oppgrader` (adresse) og `lme-pricing.js`
i appen (adresse).

## Steg 3: grunnleggertilbudet til Cecilie og Bente (gjort)

Renate valgte: **Proff til 299 kr i måneden, låst i 12 måneder.** Normalprisen
er 549 kr, så avslaget er 250 kr i måneden i 12 måneder.

I Stripe blir det en kupong og en kampanjekode:

**Kupong**
- `amount_off`: `25000` (250,00 kr, Stripe regner i øre)
- `currency`: `nok`
- `duration`: `repeating`
- `duration_in_months`: `12`
- `name`: `Grunnlegger, Proff 299 kr`

**Kampanjekode**
- `code`: `GRUNNLEGGER`
- `coupon`: kupongen over
- `max_redemptions`: `2` (Cecilie og Bente, ingen flere)
- `restrictions.first_time_transaction`: `true`

Etter 12 måneder går abonnementet automatisk til 549 kr. Det står også på
siden de får, så det kommer ikke som en overraskelse.

Kupongen er i kroner, så den gjelder bare den norske Proff-lenken. Skal
tilbudet også kunne brukes i dollar, må det lages en tilsvarende kupong med
`amount_off: 2500` og `currency: usd`.

## Steg 4: lenken Renate sender (klar)

Når steg 1 til 3 er gjort, er lenken til Cecilie og Bente:

```
https://buy.stripe.com/eVq00k8055Zd51XgNN9R70R?prefilled_promo_code=GRUNNLEGGER
```

Koden fylles inn av seg selv, så de ser 299 kr med en gang, uten å måtte skrive
noe. Sjekk selv at det står 299 kr i Stripe-kassen før du sender den videre.

## Fram til Stripe åpnes: /grunnlegger

Siden `/grunnlegger` finnes allerede og virker nå. Den forklarer tilbudet på
norsk og engelsk, og lar Cecilie og Bente reservere plassen med navn og
e-post. Reservasjonene havner i plattformens egen abonnentliste med kilden
`autopilot-grunnlegger` og merkelappen `proff-299-laast-12mnd`, så de er lette
å finne igjen på `/subscribers`.

Siden lover ingen betaling og ingen binding, bare at de får lenken når den
åpner. Den er `noindex`, og den er lenket fra dashbordet som et kort bare
eieren ser.

Når Stripe er åpnet, er det én endring som gjenstår på siden: bytt
reservasjonsskjemaet med en kjøpsknapp som peker på lenken i steg 4. Si fra, så
gjør jeg det.

## Det som gjenstår for å lansere for alle

1. Kjør PWABuilder og send appen til Google Play og App Store. Oppskriften
   ligger i `lme-content-studio/docs/APP-STORE-INNSENDING.md`.
2. Fortell om appen i nyhetsbrevet og på sosiale medier.
3. Bytt reservasjonsskjemaet på `/grunnlegger` med en kjøpsknapp, nå som
   lenken virker.
