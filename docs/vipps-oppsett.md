# Vipps: hvor nøklene bor, og hva som kan gå galt

Skrevet 26. august 2026, etter en lang jakt på hvorfor Vipps-knappen svarte
"502 Bad gateway". Alt her er bekreftet mot Renates egen konto, ikke hentet
fra dokumentasjon.

## De fire nøklene, og hvor de er

I Vipps: `portal.vippsmobilepay.com`, nederst til venstre står **For
developers**, fanen **API keys**. Velg **Production**, ikke Test, øverst under
"Select environment". Adressen ender da på `/developer/api-keys/prod`.

Salgsenheten står i en tabell. **MSN** er en egen kolonne der. Knappen **Show
keys** til høyre på raden åpner de tre andre.

| Navn i Cloudflare | Hva det er | Hemmelig? |
| --- | --- | --- |
| `VIPPS_CLIENT_ID` | 36 tegn med bindestreker | ja |
| `VIPPS_CLIENT_SECRET` | lang tilfeldig tekst | ja |
| `VIPPS_SUBSCRIPTION_KEY` | 32 tegn, ingen bindestreker | ja |
| `VIPPS_MERCHANT_SERIAL_NUMBER` | MSN, sju siffer | nei |
| `VIPPS_ENV` | `test` eller `production` | nei |
| `VIPPS_WEBHOOK_SECRET` | fra `/api/vipps-register-webhook` | ja |

Alle fire nøklene må komme fra **samme** miljø som `VIPPS_ENV` peker på. Et
blandet sett gir `vipps_token_failed: 401`.

## Fellene vi faktisk gikk i

**Nummeret i adressefeltet er ikke MSN.** `portal.vippsmobilepay.com/1343162/`
er kontoens ID. MSN er et annet tall, og står i MSN-kolonnen i tabellen.

**En manglende nøkkel hang, den feilet ikke.** Var en av de fire ikke satt,
ble den sendt til Vipps som teksten "undefined". Forbindelsen ble hengende til
Cloudflare ga opp og svarte kunden med sin egen "502 Bad gateway". Vår kode
rakk aldri å si noe, så feilmeldingene i den hjalp ikke.

Rettet to steder: `manglendeVippsNokkel()` sjekker alle fire før første kall
og navngir den som mangler, og alle Vipps-kall har en tidsfrist på tolv
sekunder, se `functions/_lib/vipps.js`.

**En endret innstilling slår først inn ved neste utgivelse.** Lagrer du en
nøkkel i Cloudflare, kjører forrige utgave videre uendret. Det må publiseres
på nytt før den gjelder. Dette kostet oss flere runder.

**Cloudflare har to sett innstillinger.** Production og Preview. Legger du en
nøkkel i feil sett, skjer det ingenting. Adressen i dashbordet ender på
`/settings/production` når du står riktig.

**Velg Secret, ikke Text.** Legges en nøkkel inn som Text, vises verdien i
klartekst i dashbordet, og den blir med på skjermbilder. `VIPPS_CLIENT_SECRET`
lå som Text en periode og måtte byttes.

## Salgsenheten, slik den står i dag

- Navn: Little Montessori Explorers
- Solution: Vipps API, godkjent ("Approved", Payment Integration)
- Capture type: **Reserve Capture**, som er det koden vår gjør. Beløpet
  reserveres når kunden godkjenner i appen, og trekkes i samme øyeblikk av
  `captureVippsPayment` i webhooken.
- Recurring API: **true**. Faste betalinger er altså mulig hos Vipps, i
  motsetning til gjennom Stripe, der Vipps bare kan engangsbeløp. Det er en
  egen kobling å bygge, ikke noe som følger med.

## Feilkoder fra Vipps, og hva de betyr

Sjekksiden viser Vipps sin egen forklaring bak statuskoden. Disse har vi sett:

| Melding | Hva det betyr | Fiks |
| --- | --- | --- |
| `AADSTS700016: Application with identifier ... was not found in the directory ...` | `client_id` hører til et annet miljø enn det vi spør i, typisk en testnøkkel mot produksjon | hent `client_id` og `subscription key` fra produksjonsdelen |
| `AADSTS7000215: Invalid client secret provided` | `client_secret` er feil, avkortet eller utløpt | lag en ny under Show keys |
| `401` uten mer | nøklene er avvist, som regel blandet test og produksjon | sjekk at alle fire kommer fra samme sted |
| `vipps_mangler_nokkel: NAVN` | innstillingen er ikke satt i Cloudflare | legg den inn, og publiser |
| `vipps_timeout` | Vipps svarte ikke innen tolv sekunder | sjelden, prøv igjen før du leter videre |

Den vi faktisk gikk i var den første. `client_id` og `subscription key` lå i
Cloudflare fra et tidligere oppsett og var testnøkler, mens `client_secret` og
MSN ble hentet fra produksjon. Et blandet sett ser helt normalt ut i listen,
alle fire står jo der, og det er bare Vipps som kan si at de ikke hører sammen.

Derfor: bytter du én nøkkel, sjekk alle fire.

## Rekkefølgen som virker

1. Legg inn de fem første i Cloudflare, Production, som Secret (MSN og
   `VIPPS_ENV` kan være Text, de er ikke hemmelige)
2. Publiser, ellers gjelder de ikke
3. Åpne `/api/vipps-sjekk` og se at steg 5 sier at den fikk et tegn
4. Kjør `/api/vipps-register-webhook?pw=…` én gang, lagre svaret som
   `VIPPS_WEBHOOK_SECRET`, publiser igjen
5. Publiser igjen, og selg.

Merk at hver kjøring av `/api/vipps-register-webhook` lager et nytt abonnement
med en ny nøkkel hos Vipps. Kjører du den flere ganger, må
`VIPPS_WEBHOOK_SECRET` settes til den ferskeste.

## To veier inn til en levering

Et kjøp leveres av `_lib/vipps-lever.js`, og to veier fører dit:

1. **Varselet fra Vipps** treffer `/api/vipps-webhook`. Det er den normale
   veien, og den som gjør at leveringen skjer med én gang.
2. **Kunden selv.** Etter betalingen sendes hun tilbake til produktsiden med
   `?vipps=<referanse>` i adressen. `js/vipps-kvittering.js` spør da
   `/api/vipps-status`, som spør Vipps om betalingen er godkjent, og leverer
   på stedet hvis varselet ikke har kommet.

Vei 2 er sikkerhetsnettet. Blir varselet borte, kommer det for sent, eller
avvises det fordi `VIPPS_WEBHOOK_SECRET` mangler eller er utdatert, får kunden
varen likevel i samme øyeblikk som hun lander på siden. Det var den ene feilen
i denne flyten som ikke kunne oppdages av seg selv: kunden betaler, ingenting
skjer, og ingen vet det før hun skriver og spør.

Begge veier går gjennom den samme ordren i KV (`vipps_order:<referanse>`), og
en ordre som står som `fulfilled` leveres aldri på nytt. Kommer begge veier
fram samtidig, i samme sekund, kan følgen i verste fall bli én ekstra
leveringsmail. Det er den riktige veien å bomme på.

Retursiden trenger dette skriptet for å virke:

```html
<script src="/js/vipps-kvittering.js?v=1" defer></script>
```

Det ligger nå på `/lv/<slug>` og på kurssidene. Lager du en ny side som kan
være returside for et Vipps-kjøp, må skriptet med dit også.
