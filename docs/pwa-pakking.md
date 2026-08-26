# Pakke LME-appene til App Store og Google Play

LME-appene er bygget som PWA-er (nettapper som kan installeres). For å legge dem
i App Store og Google Play, pakker vi PWA-en til en app-fil med gratisverktøyet
**PWABuilder** (fra Microsoft): https://www.pwabuilder.com

Du limer inn adressen til appen, og PWABuilder lager ferdige pakker for begge
butikkene. Dette dokumentet er oppskriften.

## Appene som skal pakkes

| App | Adresse å lime inn i PWABuilder |
| --- | --- |
| Hele plattformen (LME) | `https://lmexplorers.com/` |
| LME Reel | `https://lmexplorers.com/reel-app/` |
| LME YouTube | `https://lmexplorers.com/youtube-app/` |
| LME Autopilot | `https://lme-contentstudio.pages.dev/` |

LME Reel, LME YouTube og hele plattformen har allerede manifest, ikoner (192 og
512, vanlige og maskable), service worker og `display: standalone`, så de er
klare til pakking. LME Autopilot ligger i et eget prosjekt (`lme-content-studio`),
og er også klart: manifest, ikoner, personvern, sletting av konto og butikkmodus
er på plass der. Oppskriften for akkurat den appen ligger i det repoet, i
`docs/APP-STORE-INNSENDING.md`, og er mer detaljert enn dette notatet.

## Det du trenger (engangsoppsett)

- **Google Play Console:** utviklerkonto, ca. 25 USD engang.
- **Apple Developer Program:** ca. 99 USD i året.
- **Mac med Xcode** (eller en Mac-skytjeneste som MacinCloud) for å bygge og
  laste opp iOS-appen. Apple krever dette, det går ikke fra Windows.

## Google Play (Android)

1. Gå til https://www.pwabuilder.com og lim inn appadressen.
2. Trykk "Package for stores", velg **Android**.
3. Last ned pakken (en `.aab`-fil, laget som en Trusted Web Activity).
4. I Google Play Console: lag en ny app, last opp `.aab`-filen, fyll inn
   butikktekst, ikon og skjermbilder, og send til gjennomgang.

Tips: PWABuilder lager også en `assetlinks.json` du legger på domenet, så appen
åpner uten nettleserlinje. Den kan jeg legge inn i repoet når du er klar.

## App Store (iOS)

1. På PWABuilder, velg **iOS** og last ned iOS-pakken.
2. Åpne prosjektet i Xcode på en Mac.
3. Signer med Apple Developer-kontoen din og last opp via Xcode eller
   Transporter.
4. I App Store Connect: fyll inn butikktekst, ikon og skjermbilder, og send til
   gjennomgang.

Merk: Apple er strenge med apper som bare er en nettside i en ramme. Den samlede
LME-appen (hele plattformen) har størst sjanse for å bli godkjent, fordi den har
mye ekte innhold og funksjon. De enkelte appene (Reel, YouTube) kan bli avvist
hvis de føles for tynne. Da er planen å sende inn LME-appen som hovedapp, og
heller markedsføre Reel og YouTube som deler av den.

## Betaling i appene (viktig, oppdatert 26. august 2026)

Renate har bestemt at ingen del av salget skal gå gjennom Apple eller Google.
Butikkappene er gratis å installere, og kjøp skjer på nettet med Stripe.

Måten det gjøres på er endret. Fram til sommeren 2026 sa dette notatet at appen
kunne vise priser og sende brukeren ut til Stripe uten at det kostet noe. Det
stemmer ikke lenger:

- **Google** skilte 30. juni 2026 tjenestegebyret fra betalingsgebyret i EØS, som
  Norge er med i. Lenker appen ut til kjøp, tar Google 10 % av abonnementer og
  20 % av nye kjøp. Selger appen ingenting i det hele tatt, faller den utenfor
  betalingspolicyen, og gebyret blir null.
- **Apple** godtar utlenking til kjøp bare i USA (etter Epic-dommen i 2025) og i
  EU under DMA. Norge er EØS, ikke EU, så DMA gjelder ikke her. En norsk iOS-app
  som viser priser og lenker til Stripe blir sannsynligvis avvist etter
  regel 3.1.1.

Derfor gjelder dette, uten unntak:

- App-en er gratis å installere.
- **Butikkversjonen viser ingen priser og ingen kjøpsknapper i det hele tatt.**
  Bare innlogging. Det er slik Netflix og Spotify gjør det, og det holder appen
  utenfor begge regelverkene.
- Kunden kjøper på lmexplorers.com og logger inn i appen etterpå.
- Ingen del av salget går gjennom Apple eller Google.

Hvis Apple likevel avviser etter 3.1.1, er svaret at appen er en
multiplattformtjeneste etter regel 3.1.3(b): kontoen kjøpes utenfor appen, appen
selger ingenting og lenker ikke til kjøp.

### Slik er det løst i LME Autopilot

`lme-pricing.js` i `lme-content-studio` slår på butikkmodus automatisk når appen
kjøres som installert app, eller når adressen inneholder `?store=1`. Da skjules
prisfanen, prismodalen, "Priser" i menyen og planlisten på låseskjermen. Sett
`start_url` til `/?store=1` i PWABuilder, så er det sikret.

Samme mønster kan gjenbrukes for de andre appene når de skal pakkes.

## Sletting av konto (kreves av Google Play)

Google Play krever at en app med innlogging lar brukeren slette kontoen sin, både
inne i appen og fra en offentlig nettadresse. Uten begge deler blir innsendingen
avvist.

LME Autopilot har dette på `/slett-konto`. Har en av de andre appene innlogging,
må den ha det samme før den sendes inn.

## Sjekkliste

- [ ] Google Play Console opprettet
- [ ] Apple Developer Program opprettet
- [ ] Tilgang til en Mac med Xcode
- [ ] Butikktekst, ikon og skjermbilder klare (norsk og engelsk)
- [ ] Android-pakke bygget og lastet opp
- [ ] iOS-pakke bygget og lastet opp
- [ ] Butikkmodus bekreftet: ingen pris eller kjøpsknapp i den installerte appen
- [ ] Sletting av konto på plass, både i appen og på en offentlig adresse
- [ ] Datasikkerhet fylt ut i Play Console

Si fra når du vil starte, så kan jeg legge inn `assetlinks.json`, rydde
manifestene ytterligere og guide deg gjennom hvert steg i PWABuilder.
