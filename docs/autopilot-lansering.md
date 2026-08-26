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

Lenken til Cecilie og Bente:

```
https://buy.stripe.com/9B64gAfsx1IXamhbtt9R61l?prefilled_promo_code=GRUNNLEGGER
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
| VIP årlig | 9 990 kr | $990 | samme som VIP |

Tallene stemmer med `functions/_lib/plans.js`, med `/oppgrader` og med
`lme-pricing.js` i Autopilot-appen. Ingenting av dette trenger endring.

Den gamle 499-prisen på Proff (`price_1TUvS3Lax7B8uQzqQcZAW8Dx`) er arkivert
26. august 2026, så ingen kan plukke feil pris senere.

## Steg 1: åpne de tre produktene (gjort)

Sett `active: true` på `prod_UwWlnVHko5a1Dt`, `prod_UTtEl6dxkbq4qM` og
`prod_UwWmmP16D4lT5Z`. Ingenting annet trengs, prisene ligger der fra før.

## Steg 2: slå på de åtte betalingslenkene (gjort)

Alle åtte er `active: false` i dag. De skal settes til `active: true`, og de
skal få `allow_promotion_codes: true`, ellers virker ikke grunnleggerkoden.

| Lenke | Plan | Adresse |
| --- | --- | --- |
| `plink_1Ty9NeLax7B8uQzqIlM5RCuB` | Start, kroner | `buy.stripe.com/bJeeVedkpfzN8e9btt9R61Z` |
| `plink_1Ty9NlLax7B8uQzqrRrPUgkr` | Start, dollar | `buy.stripe.com/14A9AUa8d0ET3XT1ST9R620` |
| `plink_1TxaxbLax7B8uQzq9nJeLLHB` | Proff, kroner | `buy.stripe.com/9B64gAfsx1IXamhbtt9R61l` |
| `plink_1TxaxcLax7B8uQzqQWSj2nuD` | Proff, dollar | `buy.stripe.com/bJe4gAfsx73hamhapp9R61m` |
| `plink_1TxaxeLax7B8uQzqhpvfmUta` | VIP, kroner | `buy.stripe.com/eVq8wQ1BHevJ51XdBB9R61n` |
| `plink_1TxaxfLax7B8uQzq0VIMveFM` | VIP, dollar | `buy.stripe.com/8x228s8059bpdyt1ST9R61o` |
| `plink_1TxaxhLax7B8uQzqYOEHA6O9` | VIP årlig, kroner | `buy.stripe.com/9B628s0xDgDR1PL5559R61p` |
| `plink_1TxaxiLax7B8uQzqCSt5zYag` | VIP årlig, dollar | `buy.stripe.com/4gMfZicglcnB1PL9ll9R61q` |

Det er viktig at det er akkurat disse lenkene som åpnes, ikke nye. Webhooken
kjenner igjen kunden på lenke-ID-en (`AUTOPILOT_PAYMENT_LINKS` i
`functions/_lib/purchase-links.js`), og gir tilgang og kvote ut fra den. Lager
vi nye lenker, må den listen oppdateres i samme slengen, ellers betaler kunden
uten å få tilgang. Det var akkurat den feilen appen hadde med FEA Create.

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
https://buy.stripe.com/9B64gAfsx1IXamhbtt9R61l?prefilled_promo_code=GRUNNLEGGER
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
