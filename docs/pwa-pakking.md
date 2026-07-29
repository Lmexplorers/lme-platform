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
| LME Content Studio | `https://lme-contentstudio.pages.dev/` |

LME Reel, LME YouTube og hele plattformen har allerede manifest, ikoner (192 og
512, vanlige og maskable), service worker og `display: standalone`, så de er
klare til pakking. LME Content Studio er et eget prosjekt (egen adresse), så
manifest og ikoner må klargjøres der før pakking. Trenger du hjelp med det, gir
du meg tilgang til det prosjektet.

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

## Betaling i appene (viktig)

All betaling skjer på nettsiden via Stripe, aldri som kjøp inne i app-en. Dette
er et bevisst valg fra Renate: Apple og Google tar normalt opptil 30 % av kjøp
som gjøres inne i app-en (in-app purchase), og LME skal ikke gi bort noe av
salget.

Derfor gjelder følgende, uten unntak:

- App-en er gratis å installere.
- "Kom i gang"-knappen sender brukeren til betaling på nettet (Stripe), utenfor
  app-en. Etter betaling kommer de tilbake med `?paid=1` og får full tilgang.
- Ingen del av salget går gjennom Apple eller Google.

Merk: Apple kan være kritiske til apper som sender brukeren ut for å betale for
digitalt innhold. Den tryggeste innsendingen er derfor at kjøpet skjer på
nettsiden (som nå), og at app-en presenteres som et verktøy du logger inn i. Vi
holder kjøpsflyten på nettet uansett, så hele salget blir ditt.

## Sjekkliste

- [ ] Google Play Console opprettet
- [ ] Apple Developer Program opprettet
- [ ] Tilgang til en Mac med Xcode
- [ ] Butikktekst, ikon og skjermbilder klare (norsk og engelsk)
- [ ] Android-pakke bygget og lastet opp
- [ ] iOS-pakke bygget og lastet opp
- [ ] Avklart hvordan betaling skal skje i appen (Stripe på nett, eller in-app)

Si fra når du vil starte, så kan jeg legge inn `assetlinks.json`, rydde
manifestene ytterligere og guide deg gjennom hvert steg i PWABuilder.
