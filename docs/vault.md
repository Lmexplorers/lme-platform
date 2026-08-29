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
selv i `functions/api/oppskrift-webhook.js`:

1. Lag to betalingslenker i Stripe, én i kroner og én i dollar (engangsbeløp).
2. Lim URL-ene inn i `checkoutUrl` under `no` og `en` i
   `funnel/vault/funnel-config.js`.
3. Legg betalingslenke-ID-ene (`plink_…`) inn i `COURSE_PAYMENT_LINKS` i
   `functions/_lib/purchase-links.js` med `courseId: "vault"`. Plassen ligger
   klar, kommentert ut, i samme fil.

Da får kjøperen tilgangslenken sin på e-post automatisk, kjøpet havner i
kjøpsloggen på Min side, og du får salgsvarselet ditt som vanlig.

Så lenge `checkoutUrl` står tom, hopper kjøpsknappen rett til takkesiden. Det er
med vilje, slik at trakten kan forhåndsvises før betalingen er koblet på.

## Priser

Prisen settes ett sted, i `funnel/vault/funnel-config.js`: `belop`, `valuta` og
`visningFor` (den overstrøkne ordinærprisen, tom streng skjuler den).
Grunnleggerprisen er 199 kr og 19 dollar, ordinær pris 349 kr og 34 dollar.

## Hvor hvelvet er lenket fra

- Kort i `hero-cta-row` på `dashboard.html`
- Knapp på `/academy` (LME Studio), ved siden av Claude-kurset
- Fase 3 (Blomsten) på `/roadmap`
