# LME Vault

LME Vault er et lite produkt med engangspris: et hvelv med ferdige Claude-maler
som tar kjøperen fra tom side til ferdig digitalt produkt. Samme mønster som
resten av de betalte enkeltproduktene på plattformen, ikke abonnement.

## Sidene

| Adresse | Fil | Hva den er |
| --- | --- | --- |
| `/vault` | `funnel/vault/salg.html` | Salgssiden, viser malene og prisen |
| `/vault-takk` | `funnel/vault/takk.html` | Takkesiden etter kjøp |
| `/academy/vault` | `academy/vault.html` | Selve hvelvet, låst for andre enn kjøpere og eier |

Alle tre er tospråklige (norsk og engelsk), med språkknappen øverst til høyre og
samme språkvalg som resten av plattformen (`localStorage`-nøkkelen `lme_lang`).

## Malene ligger ett sted

`js/vault-data.js` er den eneste kilden til malene. Både salgssiden (som viser
tittel og en kort tekst) og hvelvet (som viser hele prompten) leser derfra, så
listene kan aldri komme i utakt.

Slik legger du til en ny mal: kopier en blokk i `js/vault-data.js`, endre `id`,
`ikon` og tekstene. Hver mal har `tittel`, `kort` (smakebiten på salgssiden),
`hva` (hva kjøperen får), `prompt` (selve malen) og `tips`, på både `no` og `en`.
Bruk `[klammer]` der leseren skal fylle inn sitt eget.

## Tilgang

Hvelvet er låst med `js/course-gate.js` og kurs-ID-en `vault`, altså nøyaktig
samme lås som de andre betalte kursene:

- Kjøperen får en personlig lenke i leveringsmailen
  (`/academy/vault?t=<token>`). Lenken lagres i nettleseren, så senere besøk
  uten `?t=` også virker. Tilgangen varer for alltid.
- Eieren slipper alltid inn, uten kjøp og uten token, via den vanlige
  innloggingen. Salgssiden bytter i tillegg ut kjøpsknappen med en egen vei rett
  inn i hvelvet når `/api/access` svarer med `plan === "owner"`.

## Betaling

Betalingen går gjennom det vanlige kurs-oppsettet, så leveringen skjer av seg
selv i `functions/api/oppskrift-webhook.js`. Alt er koblet på (opprettet i
live-modus 29. august 2026):

| Pris | Språk | Betalingslenke | ID |
| --- | --- | --- | --- |
| Grunnlegger, 199 kr | Norsk | `https://buy.stripe.com/9B6eVebchfzN2TPdBB9R70X` | `plink_1U9kRiLax7B8uQzqHUEe2TWx` |
| Grunnlegger, $19 | Engelsk | `https://buy.stripe.com/00wbJ22FL87l3XT0OP9R70Y` | `plink_1U9kRpLax7B8uQzq228YXsYe` |
| Ordinær, 349 kr | Norsk | `https://buy.stripe.com/7sY9AUa8d5ZdfGB5559R70Z` | `plink_1U9kUTLax7B8uQzqnOk0SUpD` |
| Ordinær, $34 | Engelsk | `https://buy.stripe.com/3cIbJ2bch73h9idbtt9R710` | `plink_1U9kUZLax7B8uQzqppwl1JR4` |

Produktet er `prod_VA4ZeuIHvlzY6E`. Alle fire lenkene sender kjøperen videre til
`/vault-takk` på riktig språk etter betaling, og alle fire gir tilgang, så et
kjøp som allerede var i gang leveres uansett hvilken pris som er ute.

Salgssiden bruker grunnleggerprisen. Skal du heve prisen til ordinær, bytter du
to ting i `funnel/vault/funnel-config.js`: `checkoutUrl` til ordinærlenken over,
og `pris.belop` til 349 (og 34 på engelsk), og tømmer `pris.visningFor` så det
ikke står en overstrøket pris som ikke lenger stemmer.

URL-ene ligger i `checkoutUrl` i `funnel/vault/funnel-config.js`, og ID-ene i
`COURSE_PAYMENT_LINKS` i `functions/_lib/purchase-links.js`. Etter kjøp får
kjøperen tilgangslenken sin på e-post automatisk, kjøpet havner i kjøpsloggen på
Min side, og du får salgsvarselet ditt som vanlig.

Står `checkoutUrl` tom, hopper kjøpsknappen rett til takkesiden. Det er med
vilje, slik at en trakt kan forhåndsvises før betalingen er koblet på.

## Priser

Prisen settes ett sted, i `funnel/vault/funnel-config.js`: `belop`, `valuta` og
`visningFor` (den overstrøkne ordinærprisen, tom streng skjuler den).
Grunnleggerprisen er 199 kr og 19 dollar, ordinær pris 349 kr og 34 dollar.

## Hvor hvelvet er lenket fra

- Kort i `hero-cta-row` på `dashboard.html`
- Knapp på `/academy` (LME Studio), ved siden av Claude-kurset
- Fase 3 (Blomsten) på `/roadmap`
