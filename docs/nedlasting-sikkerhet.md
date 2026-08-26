# Nedlastingene er låst

## Hva som var galt

Filene under `/butikk/nedlasting/` lå åpent ute. Hvem som helst kunne hente
en oppskrift uten å betale, og adressene var lette å gjette: produktnavnet
med `.pdf` bak. Takkesiden krevde heller ingenting, så
`/butikk/takk.html?p=ro-strikk` viste nedlastingsknappene til alle som
skrev inn adressen.

Slik ble butikken bygget fra start: statiske sider, Stripe-betalingslenker,
og takkesiden som leveringssted. Det er den enkleste løsningen som virker,
og det er slik mange små digitale butikker begynner. Prisen er at det ikke
finnes noe skille mellom en som har betalt og en som ikke har det. Ingen
valgte å la det stå åpent, det er bare det den løsningen gir.

## Hva som gjelder nå

Alt under `/butikk/nedlasting/` går gjennom
`functions/butikk/nedlasting/[[sti]].js` før filen sendes ut. Tre ting
teller som kjøpsbevis:

1. **En nedlastingsnøkkel i adressen** (`?t=...`). Den lages ved kjøpet og
   står i leveringsmailen, så kundens egen lenke virker for alltid.
2. **Innlogget kunde som har kjøpt produktet.** Kjøpene ligger i
   `purchases:<e-post>`.
3. **Eieren.** Renate skal aldri stenges ute fra sitt eget.

Nøkkelen er knyttet til ett produkt, ikke til én fil. Kjøper du pakken,
åpner nøkkelen alle filene i pakken. Kjøper du én oppskrift, åpner den bare
den ene, selv om filene ligger side om side i samme mappe.

Filer som ikke hører til noe produkt slippes gjennom som før. Låsen kan
bare stenge det den vet at noen har betalt for.

## Kunden skal ha varen med en gang

Ikke bare i e-posten. Takkesiden får nøkkelen på to måter:

- **Kort:** Stripe sender kunden tilbake med `session_id` i adressen.
  Webhooken har da lagt nøkkelen under det øktnummeret
  (`dl_okt:<session_id>`, ryddes bort etter et døgn), og
  `/api/nedlasting-nokkel` henter den fram. Webhooken kan komme et par
  sekunder etter kunden, så siden spør flere ganger før den gir seg.
- **Vipps:** `/api/vipps-status` gir nøkkelen sammen med kvitteringen.

Kommer nøkkelen aldri, viser siden ikke døde lenker. Da sier den at
nedlastingen ligger i e-posten.

Dette krever at betalingslenken i Stripe sender med `session_id`. Den skal
se slik ut:

```
https://lmexplorers.com/butikk/takk.html?p=<produkt>&session_id={CHECKOUT_SESSION_ID}
```

Alle 149 aktive betalingslenker i butikken er satt opp slik (26. august
2026, kontrollert mot Stripe etterpå). Lager du en ny betalingslenke, må
`&session_id={CHECKOUT_SESSION_ID}` med i retur-adressen, ellers får den
kunden bare beskjed om å se i e-posten.

## Gamle lenker

Kunder som kjøpte før låsen kom har lenker uten nøkkel i innboksen. De
møter ikke en død lenke, men en side som forklarer hva som skjedde og lar
dem skrive e-posten de kjøpte med. `/api/nedlasting-ny-lenke` sjekker om
den adressen faktisk har kjøpt noe som gir filen, og sender i så fall
leveringsmailen på nytt med en fersk nøkkel.

Svaret er det samme uansett om e-posten fantes eller ikke. Ellers kunne
hvem som helst brukt siden til å finne ut hvem som har kjøpt hva.

## Velkomstmail og oppfølging

Kjøpere i butikken sto utenfor nyhetsbrevet og fikk derfor aldri
velkomstmailen eller de ukentlige. Nå meldes de på ved kjøpet, både med
kort og med Vipps. `registerNewsletter` rører ikke en som alt er påmeldt.

De to oppfølgingsmailene etter tre dager og to uker fantes fra før og
sendes av `functions/api/cron/newsletter.js` og
`oppskrift-followups.js`.

**Avmelding.** Nyhetsbrevet hadde ingen avmeldingslenke. Uten den kan man
ikke melde folk på, det er et krav, ikke en høflighet. Hver e-post har nå
en lenke nederst, både i HTML og i tekstversjonen, og
`/api/avmeld` slår abonnenten av med ett klikk. Koden er tilfeldig og
ligger på abonnenten, så ingen kan melde av noen andre ved å gjette en
e-postadresse. Abonnenter fra før koden fantes får den ved første
utsending.

## Det som fortsatt er åpent

**Tidslinjen** ligger i Google Drive, ikke hos oss. Den kan vi ikke låse
herfra. Skal den bak samme lås, må filen flyttes til
`/butikk/nedlasting/`.

## Når KV er nede

Da slipper vi kunden gjennom. I det minuttet kommer også en oppdiktet
nøkkel forbi, men alternativet er at hver eneste kunde som har betalt blir
stengt ute fra varen sin fordi noe hos oss ikke svarer. Det er en mye verre
feil å gjøre.

## Legger du til et nytt produkt

Filene må stå i produktlisten i `functions/_lib/oppskrift-mail.js`. Det er
den listen låsen bygger kartet sitt fra. Står de ikke der, er filen ulåst,
og da kan hvem som helst hente den.
