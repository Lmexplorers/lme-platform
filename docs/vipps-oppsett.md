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

## Rekkefølgen som virker

1. Legg inn de fem første i Cloudflare, Production, som Secret (MSN og
   `VIPPS_ENV` kan være Text, de er ikke hemmelige)
2. Publiser, ellers gjelder de ikke
3. Åpne `/api/vipps-sjekk` og se at steg 5 sier at den fikk et tegn
4. Kjør `/api/vipps-register-webhook?pw=…` én gang, lagre svaret som
   `VIPPS_WEBHOOK_SECRET`, publiser igjen
5. Først da kan noe selges. Uten webhook-nøkkelen avviser vi meldingen om at
   kunden har betalt, og pengene trekkes uten at hun får varen.

Merk at hver kjøring av `/api/vipps-register-webhook` lager et nytt abonnement
med en ny nøkkel hos Vipps. Kjører du den flere ganger, må
`VIPPS_WEBHOOK_SECRET` settes til den ferskeste.
