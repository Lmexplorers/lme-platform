# LME Visibility, klargjøring for App Store og Google Play

Denne mappa gjør LME Visibility klar til å pakkes som en mobil-app og sendes inn
til Apple App Store og Google Play. Appen er allerede en installérbar PWA
(manifest, service worker, ikon og standalone-visning). Wrapperen her pakker den
inn i et native skall.

Kort sagt: koden er klar. Det som gjenstår er ting som bare kan gjøres på din
egen maskin med dine egne butikk-kontoer (signering, bygging og innsending).
Ingenting av det kan gjøres herfra, og det er derfor det står som steg til deg.

---

## 1. Hva er allerede gjort

- `visibility.webmanifest`: egen app-identitet (navn "LME Visibility", eget ikon,
  standalone, portrettmodus, merkefarger).
- App-ikon i `images/app/visibility/` (192, 512, maskable og apple-touch).
- Service worker registrert, så appen kan installeres og starter i fullskjerm.
- `capacitor.config.json`: native skall som laster den publiserte appen fra
  `https://lmexplorers.com/lme-visibility-app`, så alt server-arbeid (bilder,
  Blotato-publisering) virker som vanlig og appen alltid er oppdatert.
- `assetlinks.example.json`: mal for Android app-lenker (TWA).

## 2. Før du starter (kontoer og maskiner)

- **Apple Developer Program**: kreves for App Store. Koster ca. 99 USD per år.
  Meld deg på hos developer.apple.com. iOS-bygging krever i tillegg en **Mac med
  Xcode**. Uten Mac går ikke iOS.
- **Google Play Console**: kreves for Google Play. Engangsavgift ca. 25 USD hos
  play.google.com/console. Android bygges med **Android Studio**, som går på
  Windows, Mac og Linux.
- **Node.js** på maskinen (for Capacitor-kommandoene under).
- En **personvernerklæring** på en offentlig nettadresse. Begge butikkene krever
  det, og LME har ikke en egen personvern-side ennå. Si fra, så lager jeg
  `/personvern` i samme stil som resten av plattforma.

## 3. Bygg appen (Capacitor, både iOS og Android)

Kjør dette lokalt i denne mappa (`store/lme-visibility`):

```
npm install
npx cap add android      # legger til Android-prosjektet
npx cap add ios          # legger til iOS-prosjektet (kun på Mac)
npx cap sync
```

Sett app-ikon og splash med Capacitor sitt assets-verktøy (bruk 512-ikonet vårt
som kilde), og åpne så prosjektene:

```
npx cap open android     # åpner Android Studio
npx cap open ios         # åpner Xcode (kun på Mac)
```

I Android Studio: Build, Generate Signed Bundle (`.aab`), last opp i Play Console.
I Xcode: velg team, Archive, last opp via Organizer til App Store Connect.

## 4. Android, den lettere veien (valgfritt: TWA i stedet for Capacitor)

Google godtar PWA-er direkte via en Trusted Web Activity. Det gir en tynnere,
raskere Android-app:

```
npm install -g @bubblewrap/cli
bubblewrap init --manifest https://lmexplorers.com/visibility.webmanifest
bubblewrap build
```

For at nettleserlinja skal skjules, legg `assetlinks.json` (fyll inn SHA256 fra
signeringsnøkkelen din, se `assetlinks.example.json`) på:
`https://lmexplorers.com/.well-known/assetlinks.json`. Si fra, så legger jeg fila
inn i repoet med riktig fingeravtrykk når du har det.

## 5. Butikk-materiell du trenger

- **App-ikon**: klart (bruk `images/app/visibility/icon-512.png`).
- **Skjermbilder**: telefonstørrelser (minst 2, helst 3 til 5). Ta dem fra appen.
- **Feature graphic** (kun Google Play): 1024 x 500.
- **Beskrivelse**: kort og lang tekst. Utkast finnes i `store-listing.md` under.
- **Personvern-URL** og **support-URL**.
- **Aldersgrense** og **Data safety / App Privacy**-skjema (hva appen samler inn).

## 6. Viktig og ærlig om betaling i appen

Dette påvirker "salgbar app"-planen, så les det før du bestemmer pris i appen:

- Selger du **abonnement eller digital tilgang inne i appen**, krever både Apple
  og Google som hovedregel at du bruker deres egen betaling, og de tar 15 til 30
  prosent. Du kan da ikke bare sende folk til Stripe inne i iOS-appen.
- Vanlig løsning: la selve kjøpet skje **på nettsiden** (Stripe), og la appen være
  verktøyet man bruker etter at man er kunde. Da unngår du kuttet, men Apple har
  regler for hvor tydelig du får lenke til betaling utenfor appen.
- Enkleste trygge start: legg appen ut **gratis** (eller med gratis prøve), og
  behold salget på nettsiden inntil videre. Så kan vi vurdere in-app-kjøp senere.

## 7. Ærlig om Apple-godkjenning

Apple avviser ofte apper som bare er "en nettside i et skall" (retningslinje 4.2,
minimum funksjonalitet). LME Visibility har ekte funksjonalitet (den lager og
publiserer innhold), men for å stå trygt bør iOS-versjonen gjerne ha et par native
detaljer, for eksempel del-funksjon, varsler eller offline-visning. Si fra, så
legger jeg til det som trengs før innsending. Google Play er mer lempelig og
godtar PWA/TWA rett fram.

## 8. Sjekkliste

- [ ] Apple Developer Program betalt (for iOS)
- [ ] Google Play Console betalt (for Android)
- [ ] Personvern-side publisert (be meg lage `/personvern`)
- [ ] `npm install` og `npx cap add ...` kjørt lokalt
- [ ] Ikon og splash satt
- [ ] Signeringsnøkkel laget og `.aab` / arkiv bygget
- [ ] Skjermbilder og butikktekst klare
- [ ] Betalingsmodell bestemt (gratis nå, salg på nett)
- [ ] Sendt til vurdering
